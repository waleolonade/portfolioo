<?php
require_once __DIR__ . '/PaymentGateway.php';

class PaystackGateway implements PaymentGateway {
    
    private function apiRequest($url, $method = 'POST', $payload = null, $secretKey = '') {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Local debug bypass
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        
        $headers = [
            'Authorization: Bearer ' . $secretKey,
            'Content-Type: application/json'
        ];
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($payload) ? json_encode($payload) : $payload);
            }
        } else {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
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

    public function initializePayment($transaction, $gatewayConfig, $invoice, $client) {
        $amountInCents = intval($transaction['amount'] * 100);
        
        $payload = [
            "email" => $client['email'] ?: $client['username'] . '@client.brainfeels.tech',
            "amount" => $amountInCents,
            "currency" => $transaction['currency'] ?: 'NGN',
            "reference" => $transaction['reference'],
            "callback_url" => $gatewayConfig['callback_url'] ?: (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] . '/#/portal' : 'http://localhost:5173/#/portal'),
            "metadata" => [
                "invoice_id" => $invoice['id'],
                "invoice_code" => $invoice['invoice_code'],
                "transaction_id" => $transaction['id']
            ]
        ];

        $res = $this->apiRequest('https://api.paystack.co/transaction/initialize', 'POST', $payload, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['success'] && isset($body['data']['access_code'])) {
            return [
                "success" => true,
                "access_code" => $body['data']['access_code'],
                "authorization_url" => $body['data']['authorization_url'],
                "reference" => $transaction['reference']
            ];
        }

        return [
            "success" => false,
            "error" => $body['message'] ?? $res['error'] ?: 'Paystack initialization failed.'
        ];
    }

    public function verifyPayment($reference, $transaction, $gatewayConfig, $inputData) {
        $res = $this->apiRequest('https://api.paystack.co/transaction/verify/' . urlencode($reference), 'GET', null, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['code'] === 200 && isset($body['data']['status']) && $body['data']['status'] === 'success') {
            $paidAmount = $body['data']['amount'] / 100;
            if ($paidAmount >= $transaction['amount']) {
                // Calculate settlement and fees if provided by API
                $fee = ($body['data']['fees'] ?? 0) / 100;
                return [
                    "success" => true,
                    "provider_reference" => $body['data']['id'] ?? '',
                    "fee" => $fee,
                    "settlement_amount" => $paidAmount - $fee,
                    "raw_response" => $res['body']
                ];
            }
        }

        return [
            "success" => false,
            "error" => $body['message'] ?? 'Paystack verification failed.'
        ];
    }

    public function refundPayment($reference, $amount, $gatewayConfig) {
        $payload = [
            "transaction" => $reference,
            "amount" => intval($amount * 100) // Convert to cents
        ];
        $res = $this->apiRequest('https://api.paystack.co/refund', 'POST', $payload, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['success']) {
            return [
                "success" => true,
                "refund_reference" => $body['data']['reference'] ?? ''
            ];
        }

        return [
            "success" => false,
            "error" => $body['message'] ?? 'Paystack refund request failed.'
        ];
    }

    public function webhookHandler($rawBody, $headers, $gatewayConfig) {
        $sentSig = $headers['X-Paystack-Signature'] ?? $headers['x-paystack-signature'] ?? '';
        $expectedSig = hash_hmac('sha512', $rawBody, $gatewayConfig['secret_key']);

        if (!hash_equals($expectedSig, $sentSig)) {
            return ["verified" => false, "error" => "Invalid signature"];
        }

        $payload = json_decode($rawBody, true);
        if (isset($payload['event']) && $payload['event'] === 'charge.success') {
            return [
                "verified" => true,
                "status" => "success",
                "reference" => $payload['data']['reference'] ?? '',
                "provider_reference" => $payload['data']['id'] ?? '',
                "fee" => ($payload['data']['fees'] ?? 0) / 100,
                "amount" => $payload['data']['amount'] / 100,
                "raw_response" => $rawBody
            ];
        }

        return ["verified" => true, "status" => "ignored"];
    }
}
