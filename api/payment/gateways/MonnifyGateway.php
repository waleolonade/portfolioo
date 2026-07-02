<?php
require_once __DIR__ . '/PaymentGateway.php';

class MonnifyGateway implements PaymentGateway {

    private function apiRequest($url, $method = 'POST', $payload = null, $apiKey = '', $secretKey = '', $accessToken = '') {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        
        $headers = [];
        if (!empty($accessToken)) {
            $headers[] = 'Authorization: Bearer ' . $accessToken;
            $headers[] = 'Content-Type: application/json';
        } elseif (!empty($apiKey) && !empty($secretKey)) {
            curl_setopt($ch, CURLOPT_USERPWD, $apiKey . ':' . $secretKey);
        }
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($payload) ? json_encode($payload) : $payload);
            }
        } else {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }
        
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
        
        return [
            'success' => ($err === '' && $httpCode >= 200 && $httpCode < 300),
            'code' => $httpCode,
            'body' => $response,
            'error' => $err
        ];
    }

    private function getAccessToken($gatewayConfig) {
        $res = $this->apiRequest(
            'https://api.monnify.com/api/v1/auth/login',
            'POST',
            null,
            $gatewayConfig['public_key'],
            $gatewayConfig['secret_key']
        );
        $body = json_decode($res['body'], true);
        return $body['responseBody']['accessToken'] ?? '';
    }

    public function initializePayment($transaction, $gatewayConfig, $invoice, $client) {
        // Monnify web SDK operates client-side inside the modal.
        // We return the API key, contract code, and initialization context.
        return [
            "success" => true,
            "public_key" => $gatewayConfig['public_key'],
            "contract_code" => $gatewayConfig['webhook_secret'] ?: '',
            "reference" => $transaction['reference']
        ];
    }

    public function verifyPayment($reference, $transaction, $gatewayConfig, $inputData) {
        $token = $this->getAccessToken($gatewayConfig);
        if (empty($token)) {
            return ["success" => false, "error" => "Monnify authentication login failed."];
        }

        $res = $this->apiRequest(
            'https://api.monnify.com/api/v2/transactions/query?paymentReference=' . urlencode($reference),
            'GET',
            null,
            '',
            '',
            $token
        );
        $body = json_decode($res['body'], true);

        if ($res['code'] === 200 && isset($body['responseBody']['paymentStatus']) && $body['responseBody']['paymentStatus'] === 'PAID') {
            $paidAmount = $body['responseBody']['amountPaid'];
            if ($paidAmount >= $transaction['amount']) {
                $fee = $body['responseBody']['payableAmount'] - $body['responseBody']['amountPaid']; // computed fee if any
                return [
                    "success" => true,
                    "provider_reference" => $body['responseBody']['transactionReference'] ?? '',
                    "fee" => abs($fee),
                    "settlement_amount" => $paidAmount,
                    "raw_response" => $res['body']
                ];
            }
        }

        return [
            "success" => false,
            "error" => $body['responseMessage'] ?? 'Monnify verification failed.'
        ];
    }

    public function refundPayment($reference, $amount, $gatewayConfig) {
        $token = $this->getAccessToken($gatewayConfig);
        if (empty($token)) {
            return ["success" => false, "error" => "Monnify authentication login failed."];
        }

        $payload = [
            "transactionReference" => $reference,
            "refundAmount" => $amount,
            "refundReason" => "Client portal request",
            "customerNote" => "Processed via administration panel"
        ];
        
        $res = $this->apiRequest(
            'https://api.monnify.com/api/v1/refunds/initiate',
            'POST',
            $payload,
            '',
            '',
            $token
        );
        $body = json_decode($res['body'], true);

        if ($res['success']) {
            return [
                "success" => true,
                "refund_reference" => $body['responseBody']['refundReference'] ?? ''
            ];
        }

        return [
            "success" => false,
            "error" => $body['responseMessage'] ?? 'Monnify refund failed.'
        ];
    }

    public function webhookHandler($rawBody, $headers, $gatewayConfig) {
        $sentSig = $headers['monnify-signature'] ?? $headers['Monnify-Signature'] ?? '';
        $expectedSig = hash_hmac('sha512', $rawBody, $gatewayConfig['secret_key']);

        if (!hash_equals($expectedSig, $sentSig)) {
            return ["verified" => false, "error" => "Invalid Monnify signature hash"];
        }

        $payload = json_decode($rawBody, true);
        if (isset($payload['eventType']) && $payload['eventType'] === 'SUCCESSFUL_TRANSACTION') {
            $eventData = $payload['eventData'];
            return [
                "verified" => true,
                "status" => "success",
                "reference" => $eventData['paymentReference'] ?? '',
                "provider_reference" => $eventData['transactionReference'] ?? '',
                "fee" => 0.00, // Handle internally
                "amount" => $eventData['amountPaid'],
                "raw_response" => $rawBody
            ];
        }

        return ["verified" => true, "status" => "ignored"];
    }
}
