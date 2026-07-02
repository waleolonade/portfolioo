<?php
require_once __DIR__ . '/PaymentGateway.php';

class StripeGateway implements PaymentGateway {

    private function apiRequest($url, $method = 'POST', $payload = null, $secretKey = '') {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        
        // Stripe uses Basic Auth with API key as username and empty password
        curl_setopt($ch, CURLOPT_USERPWD, $secretKey . ':');
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($payload) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($payload) ? http_build_query($payload) : $payload);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
            }
        } else {
            curl_setopt($ch, CURLOPT_HTTPGET, true);
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

    public function initializePayment($transaction, $gatewayConfig, $invoice, $client) {
        $currencyCode = strtolower($transaction['currency'] ?: 'usd');
        
        $payload = [
            'line_items[0][price_data][currency]' => $currencyCode,
            'line_items[0][price_data][product_data][name]' => 'Invoice ' . $invoice['invoice_code'],
            'line_items[0][price_data][product_data][description]' => 'Payment for Brainfeels Tech project invoice',
            'line_items[0][price_data][unit_amount]' => intval($transaction['amount'] * 100),
            'line_items[0][quantity]' => 1,
            'mode' => 'payment',
            'success_url' => ($gatewayConfig['callback_url'] ?: 'http://localhost:5173/#/portal') . '?payment_status=success&reference=' . $transaction['reference'] . '&gateway=stripe',
            'cancel_url' => ($gatewayConfig['callback_url'] ?: 'http://localhost:5173/#/portal') . '?payment_status=cancelled',
            'client_reference_id' => $transaction['reference'],
            'customer_email' => $client['email'] ?: $client['username'] . '@client.brainfeels.tech',
            'metadata[invoice_id]' => $invoice['id'],
            'metadata[transaction_id]' => $transaction['id']
        ];

        $res = $this->apiRequest('https://api.stripe.com/v1/checkout/sessions', 'POST', $payload, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['success'] && isset($body['url'])) {
            return [
                "success" => true,
                "checkout_url" => $body['url'],
                "session_id" => $body['id'],
                "reference" => $transaction['reference']
            ];
        }

        return [
            "success" => false,
            "error" => $body['error']['message'] ?? $res['error'] ?: 'Stripe initialization failed.'
        ];
    }

    public function verifyPayment($reference, $transaction, $gatewayConfig, $inputData) {
        // Stripe verify queries the checkout session status
        $res = $this->apiRequest('https://api.stripe.com/v1/checkout/sessions/' . urlencode($reference), 'GET', null, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['code'] === 200 && isset($body['payment_status']) && $body['payment_status'] === 'paid') {
            // Note: Stripe fees require calling charges API, here we mock it or fetch it if available
            return [
                "success" => true,
                "provider_reference" => $body['payment_intent'] ?? '',
                "fee" => 0.00, // Optional
                "settlement_amount" => $transaction['amount'],
                "raw_response" => $res['body']
            ];
        }

        return [
            "success" => false,
            "error" => $body['error']['message'] ?? 'Stripe verification failed.'
        ];
    }

    public function refundPayment($reference, $amount, $gatewayConfig) {
        $payload = [
            "payment_intent" => $reference,
            "amount" => intval($amount * 100)
        ];
        $res = $this->apiRequest('https://api.stripe.com/v1/refunds', 'POST', $payload, $gatewayConfig['secret_key']);
        $body = json_decode($res['body'], true);

        if ($res['success']) {
            return [
                "success" => true,
                "refund_reference" => $body['id'] ?? ''
            ];
        }

        return [
            "success" => false,
            "error" => $body['error']['message'] ?? 'Stripe refund failed.'
        ];
    }

    public function webhookHandler($rawBody, $headers, $gatewayConfig) {
        $sigHeader = $headers['Stripe-Signature'] ?? $headers['stripe-signature'] ?? '';
        
        if (empty($gatewayConfig['webhook_secret']) || empty($sigHeader)) {
            return ["verified" => false, "error" => "Stripe signatures missing"];
        }

        $sigParts = explode(',', $sigHeader);
        $timestamp = null;
        $v1Signature = null;
        foreach ($sigParts as $part) {
            $subParts = explode('=', $part, 2);
            if (count($subParts) === 2) {
                if (trim($subParts[0]) === 't') {
                    $timestamp = trim($subParts[1]);
                } elseif (trim($subParts[0]) === 'v1') {
                    $v1Signature = trim($subParts[1]);
                }
            }
        }
        
        if ($timestamp && $v1Signature) {
            $signedPayload = $timestamp . '.' . $rawBody;
            $computedSig = hash_hmac('sha256', $signedPayload, $gatewayConfig['webhook_secret']);
            if (hash_equals($computedSig, $v1Signature)) {
                $payload = json_decode($rawBody, true);
                if (isset($payload['type']) && $payload['type'] === 'checkout.session.completed') {
                    $sessionObj = $payload['data']['object'];
                    return [
                        "verified" => true,
                        "status" => "success",
                        "reference" => $sessionObj['client_reference_id'] ?? '',
                        "provider_reference" => $sessionObj['payment_intent'] ?? '',
                        "fee" => 0.00,
                        "amount" => $sessionObj['amount_total'] / 100,
                        "raw_response" => $rawBody
                    ];
                }
                return ["verified" => true, "status" => "ignored"];
            }
        }

        return ["verified" => false, "error" => "Invalid Stripe signature"];
    }
}
