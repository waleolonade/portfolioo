<?php
require_once __DIR__ . '/PaymentGateway.php';

class FlutterwaveGateway implements PaymentGateway {

    private function apiRequest($url, $method = 'POST', $payload = null, $secretKey = '') {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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
        // Flutterwave handles UI inline checkout client-side.
        // We return configuration variables that the frontend SDK uses.
        return [
            "success" => true,
            "public_key" => $gatewayConfig['public_key'],
            "reference" => $transaction['reference'],
            "payment_options" => "card,banktransfer,ussd,mobilemoney",
            "customizations" => [
                "title" => "Brainfeels Tech",
                "description" => "Payment for invoice " . $invoice['invoice_code']
            ]
        ];
    }

    public function verifyPayment($reference, $transaction, $gatewayConfig, $inputData) {
        $flwTxId = trim($inputData['flw_transaction_id'] ?? '');
        if (empty($flwTxId)) {
            $flwTxId = $reference;
        }

        $res = $this->apiRequest('https://api.flutterwave.com/v3/transactions/' . urlencode($flwTxId) . '/verify', 'GET', null, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['code'] === 200 && isset($body['data']['status']) && $body['data']['status'] === 'successful') {
            $paidAmount = $body['data']['amount'];
            if ($paidAmount >= $transaction['amount']) {
                $fee = $body['data']['app_fee'] ?? 0;
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
            "error" => $body['message'] ?? 'Flutterwave verification failed.'
        ];
    }

    public function refundPayment($reference, $amount, $gatewayConfig) {
        // Flutterwave refund requires transaction ID
        $payload = [
            "amount" => $amount
        ];
        $res = $this->apiRequest('https://api.flutterwave.com/v3/transactions/' . urlencode($reference) . '/refund', 'POST', $payload, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['success']) {
            return [
                "success" => true,
                "refund_reference" => $body['data']['id'] ?? ''
            ];
        }

        return [
            "success" => false,
            "error" => $body['message'] ?? 'Flutterwave refund failed.'
        ];
    }

    public function webhookHandler($rawBody, $headers, $gatewayConfig) {
        $sentSig = $headers['verif-hash'] ?? $headers['Verif-Hash'] ?? '';
        
        if (empty($gatewayConfig['webhook_secret']) || !hash_equals($gatewayConfig['webhook_secret'], $sentSig)) {
            return ["verified" => false, "error" => "Invalid secret hash signature"];
        }

        $payload = json_decode($rawBody, true);
        if (isset($payload['event']) && $payload['event'] === 'charge.completed') {
            return [
                "verified" => true,
                "status" => "success",
                "reference" => $payload['data']['tx_ref'] ?? '',
                "provider_reference" => $payload['data']['id'] ?? '',
                "fee" => $payload['data']['app_fee'] ?? 0,
                "amount" => $payload['data']['amount'],
                "raw_response" => $rawBody
            ];
        }

        return ["verified" => true, "status" => "ignored"];
    }
}
