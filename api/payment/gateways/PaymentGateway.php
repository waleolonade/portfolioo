<?php
/**
 * PaymentGateway Interface
 * Standardizes API communication and callback formats across all third-party providers.
 */
interface PaymentGateway {
    /**
     * Initialize payment session
     */
    public function initializePayment($transaction, $gatewayConfig, $invoice, $client);

    /**
     * Verify transaction status
     */
    public function verifyPayment($reference, $transaction, $gatewayConfig, $inputData);

    /**
     * Refund a processed payment transaction
     */
    public function refundPayment($reference, $amount, $gatewayConfig);

    /**
     * Parse merchant webhook triggers
     */
    public function webhookHandler($rawBody, $headers, $gatewayConfig);
}
