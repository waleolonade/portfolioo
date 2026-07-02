<?php
/**
 * PaymentFactory
 * Strategy pattern factory that instantiates the correct gateway adapter.
 */
require_once __DIR__ . '/../gateways/PaystackGateway.php';
require_once __DIR__ . '/../gateways/FlutterwaveGateway.php';
require_once __DIR__ . '/../gateways/StripeGateway.php';
require_once __DIR__ . '/../gateways/MonnifyGateway.php';

class PaymentFactory {
    /**
     * Factory method to load and make a gateway adapter
     * 
     * @param string $gatewayName
     * @return PaymentGateway
     * @throws Exception
     */
    public static function make($gatewayName) {
        $gatewayKey = strtolower(trim($gatewayName));
        
        switch ($gatewayKey) {
            case 'paystack':
                return new PaystackGateway();
            case 'flutterwave':
                return new FlutterwaveGateway();
            case 'stripe':
                return new StripeGateway();
            case 'monnify':
                return new MonnifyGateway();
            default:
                throw new Exception("Unsupported payment gateway provider: " . $gatewayName);
        }
    }
}
