<?php
/**
 * PaymentService — Brainfeels Tech
 * Enterprise-grade service coordinating transactions, database locks, wallet credits, and failovers.
 */
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../factory/PaymentFactory.php';

class PaymentService {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Initialize Payment with Automatic Gateway Failover Chain
     */
    public function initialize($invoiceId, $client, $preferredGateway) {
        // Fetch invoice
        $invStmt = $this->pdo->prepare("SELECT * FROM `client_invoices` WHERE `id` = ? AND `client_id` = ?");
        $invStmt->execute([$invoiceId, $client['id']]);
        $invoice = $invStmt->fetch(PDO::FETCH_ASSOC);

        if (!$invoice) {
            throw new Exception("Invoice not found.");
        }
        if ($invoice['status'] === 'Paid') {
            throw new Exception("This invoice has already been paid.");
        }

        $payAmount = floatval($invoice['balance_due']) > 0 ? floatval($invoice['balance_due']) : floatval($invoice['amount']);
        $currency = $invoice['currency'] ?: 'NGN';
        
        $currencyMap = [
            '$' => 'USD', '₦' => 'NGN', '€' => 'EUR', '£' => 'GBP', 'C$' => 'CAD',
            'USD' => 'USD', 'NGN' => 'NGN', 'EUR' => 'EUR', 'GBP' => 'GBP', 'CAD' => 'CAD'
        ];
        $currencyCode = $currencyMap[$currency] ?? 'NGN';

        // 1. Fetch preferred gateway
        $gwStmt = $this->pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` = ? AND `is_enabled` = 1");
        $gwStmt->execute([$preferredGateway]);
        $gatewayConfig = $gwStmt->fetch(PDO::FETCH_ASSOC);

        // We will build a list of gateways to try (preferred first, then fallback chain)
        $gatewaysToTry = [];
        if ($gatewayConfig) {
            $gatewaysToTry[] = $gatewayConfig;
        }

        // Fetch all other enabled gateways to serve as failover fallbacks
        $fallbackStmt = $this->pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` != ? AND `is_enabled` = 1");
        $fallbackStmt->execute([$preferredGateway]);
        $fallbacks = $fallbackStmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($fallbacks as $f) {
            $gatewaysToTry[] = $f;
        }

        if (empty($gatewaysToTry)) {
            throw new Exception("No active payment gateways are configured at this time.");
        }

        // Create transaction record first
        $reference = 'BFT-' . strtoupper($preferredGateway) . '-' . time() . '-' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $txRef = 'BFTX-' . time() . '-' . $invoiceId;
        
        $txStmt = $this->pdo->prepare("INSERT INTO `payment_transactions` (`client_id`, `invoice_id`, `gateway`, `reference`, `tx_ref`, `amount`, `currency`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
        $txStmt->execute([$client['id'], $invoiceId, $preferredGateway, $reference, $txRef, $payAmount, $currencyCode]);
        $transactionId = $this->pdo->lastInsertId();

        $transactionRecord = [
            "id" => $transactionId,
            "reference" => $reference,
            "amount" => $payAmount,
            "currency" => $currencyCode
        ];

        // 2. Loop through failover chain
        $lastError = '';
        foreach ($gatewaysToTry as $gw) {
            $currentGatewayName = $gw['gateway_name'];
            
            // Check if credentials are empty -> trigger Demo mode bypass
            if (empty($gw['public_key']) || empty($gw['secret_key'])) {
                $demoReference = 'BFT-DEMO-' . strtoupper($currentGatewayName) . '-' . time() . '-' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
                $upStmt = $this->pdo->prepare("UPDATE `payment_transactions` SET `gateway` = ?, `reference` = ? WHERE `id` = ?");
                $upStmt->execute([$currentGatewayName, $demoReference, $transactionId]);

                $fallbackPublicKeys = [
                    'paystack' => 'pk_test_a0d8bb568a0f8b1b11b7a2d4838dbf9c8b82dfc7',
                    'flutterwave' => 'FLWPUBK_TEST-5f6ab585f81014e7a68e0d3c063f25c7-X',
                    'stripe' => 'pk_test_TYooMQauvdEDq54NiTphI7jx',
                    'monnify' => 'MK_TEST_SAF7KVGBDX'
                ];
                $pubKey = $gw['public_key'] ?: ($fallbackPublicKeys[$currentGatewayName] ?? '');

                return [
                    "success" => true,
                    "transaction_id" => $transactionId,
                    "reference" => $demoReference,
                    "tx_ref" => $txRef,
                    "amount" => $payAmount,
                    "currency" => $currencyCode,
                    "client_email" => $client['email'] ?: $client['username'] . '@client.brainfeels.tech',
                    "client_name" => $client['username'],
                    "gateway" => $currentGatewayName,
                    "invoice_code" => $invoice['invoice_code'],
                    "public_key" => $pubKey,
                    "contract_code" => $gw['webhook_secret'] ?: '1234567890',
                    "is_demo" => true,
                    "gateway_switched" => ($currentGatewayName !== $preferredGateway)
                ];
            }

            try {
                // Update transaction details for current try
                $currentReference = 'BFT-' . strtoupper($currentGatewayName) . '-' . time() . '-' . str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
                $transactionRecord['reference'] = $currentReference;
                
                $upStmt = $this->pdo->prepare("UPDATE `payment_transactions` SET `gateway` = ?, `reference` = ? WHERE `id` = ?");
                $upStmt->execute([$currentGatewayName, $currentReference, $transactionId]);

                // Try initialize via factory
                $gatewayAdapter = PaymentFactory::make($currentGatewayName);
                $initRes = $gatewayAdapter->initializePayment($transactionRecord, $gw, $invoice, $client);

                if ($initRes['success']) {
                    // Initialization succeeded!
                    return array_merge($initRes, [
                        "transaction_id" => $transactionId,
                        "tx_ref" => $txRef,
                        "amount" => $payAmount,
                        "currency" => $currencyCode,
                        "client_email" => $client['email'] ?: $client['username'] . '@client.brainfeels.tech',
                        "client_name" => $client['username'],
                        "gateway" => $currentGatewayName,
                        "invoice_code" => $invoice['invoice_code'],
                        "gateway_switched" => ($currentGatewayName !== $preferredGateway)
                    ]);
                } else {
                    $lastError = $initRes['error'];
                    error_log("[Failover Log] Initialization failed for {$currentGatewayName}: {$lastError}");
                }
            } catch (Exception $ex) {
                $lastError = $ex->getMessage();
                error_log("[Failover Log] Exception initializing {$currentGatewayName}: {$lastError}");
            }
        }

        // If we reached here, all gateways in the chain failed!
        throw new Exception("All initialization attempts failed. Last error: " . $lastError);
    }

    /**
     * Unified Verify payment status with Row Lock & Wallet credit
     */
    public function verify($reference, $gatewayName, $inputData) {
        $this->pdo->beginTransaction();

        try {
            // Fetch transaction with write-lock (FOR UPDATE)
            $txStmt = $this->pdo->prepare("SELECT * FROM `payment_transactions` WHERE `reference` = ? FOR UPDATE");
            $txStmt->execute([$reference]);
            $transaction = $txStmt->fetch(PDO::FETCH_ASSOC);

            if (!$transaction) {
                $this->pdo->rollBack();
                return ["success" => false, "error" => "Transaction record not found."];
            }

            if ($transaction['status'] === 'success') {
                $this->pdo->commit();
                return ["success" => true, "already_verified" => true, "amount" => $transaction['amount']];
            }

            // Fetch gateway config
            $gwStmt = $this->pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` = ?");
            $gwStmt->execute([$gatewayName]);
            $gatewayConfig = $gwStmt->fetch(PDO::FETCH_ASSOC);

            if (!$gatewayConfig) {
                $this->pdo->rollBack();
                return ["success" => false, "error" => "Gateway configuration not found."];
            }

            $verified = false;
            $gatewayResponse = '';
            $fee = 0.00;
            $settlementAmount = $transaction['amount'];
            $providerReference = '';

            if (strpos($reference, 'BFT-DEMO-') === 0) {
                $verified = true;
                $gatewayResponse = json_encode(["status" => "success", "mode" => "demo_simulation"]);
            } else {
                $gatewayAdapter = PaymentFactory::make($gatewayName);
                $verifyRes = $gatewayAdapter->verifyPayment($reference, $transaction, $gatewayConfig, $inputData);

                if ($verifyRes['success']) {
                    $verified = true;
                    $gatewayResponse = $verifyRes['raw_response'] ?? '';
                    $fee = $verifyRes['fee'] ?? 0.00;
                    $settlementAmount = $verifyRes['settlement_amount'] ?? $transaction['amount'];
                    $providerReference = $verifyRes['provider_reference'] ?? '';
                } else {
                    $this->pdo->rollBack();
                    return ["success" => false, "error" => $verifyRes['error']];
                }
            }

            if ($verified) {
                // 1. Update transaction status
                $updateTx = $this->pdo->prepare("UPDATE `payment_transactions` SET `status` = 'success', `provider_reference` = ?, `fee` = ?, `settlement_amount` = ?, `gateway_response` = ? WHERE `id` = ?");
                $updateTx->execute([$providerReference, $fee, $settlementAmount, $gatewayResponse, $transaction['id']]);

                // 2. Update invoice status to Paid
                $updateInv = $this->pdo->prepare("UPDATE `client_invoices` SET `status` = 'Paid', `balance_due` = 0 WHERE `id` = ?");
                $updateInv->execute([$transaction['invoice_id']]);

                // 3. Mark payment task as Completed
                $updateTask = $this->pdo->prepare("UPDATE `client_tasks` SET `status` = 'Completed' WHERE `client_id` = ? AND `action_type` = 'payment' AND `status` = 'Pending'");
                $updateTask->execute([$transaction['client_id']]);

                // 4. Update project progress
                $this->recalculateProjectProgress($transaction['client_id']);

                // 5. Credit Client Wallet (Unified Wallet Funding flow!)
                $this->fundClientWallet($transaction['client_id'], $transaction['amount'], $transaction['currency'], $reference, "Invoice payment fee credit");

                // 6. Log system message in chat
                $adminStmt = $this->pdo->query("SELECT `id` FROM `users` WHERE `role` = 'Super Admin' LIMIT 1");
                $adminId = $adminStmt->fetchColumn() ?: 1;

                $logMsg = "💰 Payment Verified & Settled: " . $transaction['currency'] . " " . number_format($transaction['amount'], 2) . " received via " . ucfirst($gatewayName) . " (Ref: " . $reference . "). Wallet credited.";
                $chatStmt = $this->pdo->prepare("INSERT INTO `chat_messages` (`sender_id`, `receiver_id`, `message`, `sender_name`, `is_bot`) VALUES (?, ?, ?, 'System Logger', 0)");
                $chatStmt->execute([$adminId, $transaction['client_id'], $logMsg]);

                $this->pdo->commit();
                return ["success" => true, "amount" => $transaction['amount']];
            }

            $this->pdo->rollBack();
            return ["success" => false, "error" => "Verification failed."];

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            return ["success" => false, "error" => "Fulfillment exception: " . $e->getMessage()];
        }
    }

    /**
     * Fund Client Wallet & log wallet transaction
     */
    private function fundClientWallet($clientId, $amount, $currency, $reference, $description = '') {
        // Find or create client wallet
        $wStmt = $this->pdo->prepare("SELECT * FROM `client_wallets` WHERE `client_id` = ? FOR UPDATE");
        $wStmt->execute([$clientId]);
        $wallet = $wStmt->fetch(PDO::FETCH_ASSOC);

        if (!$wallet) {
            $insWallet = $this->pdo->prepare("INSERT INTO `client_wallets` (`client_id`, `balance`, `currency`) VALUES (?, ?, ?)");
            $insWallet->execute([$clientId, $amount, $currency]);
            $walletId = $this->pdo->lastInsertId();
        } else {
            $newBalance = floatval($wallet['balance']) + floatval($amount);
            $upWallet = $this->pdo->prepare("UPDATE `client_wallets` SET `balance` = ? WHERE `id` = ?");
            $upWallet->execute([$newBalance, $wallet['id']]);
            $walletId = $wallet['id'];
        }

        // Log wallet transaction
        $insTx = $this->pdo->prepare("INSERT INTO `wallet_transactions` (`wallet_id`, `type`, `amount`, `reference`, `status`, `description`) VALUES (?, 'credit', ?, ?, 'successful', ?)");
        $insTx->execute([$walletId, $amount, $reference, $description]);
    }

    /**
     * Initiate Transaction Refund
     */
    public function refund($transactionId, $amount) {
        $txStmt = $this->pdo->prepare("SELECT * FROM `payment_transactions` WHERE `id` = ?");
        $txStmt->execute([$transactionId]);
        $transaction = $txStmt->fetch(PDO::FETCH_ASSOC);

        if (!$transaction) {
            throw new Exception("Transaction not found.");
        }
        if ($transaction['status'] !== 'success') {
            throw new Exception("Only successful transactions can be refunded.");
        }

        $gatewayName = $transaction['gateway'];
        
        $gwStmt = $this->pdo->prepare("SELECT * FROM `payment_gateways` WHERE `gateway_name` = ?");
        $gwStmt->execute([$gatewayName]);
        $gatewayConfig = $gwStmt->fetch(PDO::FETCH_ASSOC);

        if (!$gatewayConfig) {
            throw new Exception("Gateway configuration not found.");
        }

        // Call refund on adapter
        if (strpos($transaction['reference'], 'BFT-DEMO-') === 0) {
            $refundRef = 'REFUND-DEMO-' . time();
            $success = true;
        } else {
            $gatewayAdapter = PaymentFactory::make($gatewayName);
            $refundRes = $gatewayAdapter->refundPayment($transaction['reference'], $amount, $gatewayConfig);
            $success = $refundRes['success'];
            $refundRef = $refundRes['refund_reference'] ?? '';
            $error = $refundRes['error'] ?? '';
        }

        if ($success) {
            // Update transaction status
            $this->pdo->beginTransaction();
            try {
                $upTx = $this->pdo->prepare("UPDATE `payment_transactions` SET `status` = 'refunded', `metadata` = ? WHERE `id` = ?");
                $meta = json_encode([
                    "refunded_at" => date('Y-m-d H:i:s'),
                    "refund_amount" => $amount,
                    "refund_reference" => $refundRef
                ]);
                $upTx->execute([$meta, $transactionId]);

                // Deduct balance from wallet
                $wStmt = $this->pdo->prepare("SELECT * FROM `client_wallets` WHERE `client_id` = ? FOR UPDATE");
                $wStmt->execute([$transaction['client_id']]);
                $wallet = $wStmt->fetch(PDO::FETCH_ASSOC);

                if ($wallet) {
                    $newBalance = max(0, floatval($wallet['balance']) - floatval($amount));
                    $upWallet = $this->pdo->prepare("UPDATE `client_wallets` SET `balance` = ? WHERE `id` = ?");
                    $upWallet->execute([$newBalance, $wallet['id']]);

                    $insTx = $this->pdo->prepare("INSERT INTO `wallet_transactions` (`wallet_id`, `type`, `amount`, `reference`, `status`, `description`) VALUES (?, 'debit', ?, ?, 'successful', ?)");
                    $insTx->execute([$wallet['id'], $amount, $refundRef, "Refund adjustment"]);
                }

                $this->pdo->commit();
                return ["success" => true, "reference" => $refundRef];
            } catch (Exception $e) {
                $this->pdo->rollBack();
                throw new Exception("Refund database update failed: " . $e->getMessage());
            }
        } else {
            throw new Exception("Refund failed: " . $error);
        }
    }

    /**
     * Recalculate client progress index
     */
    private function recalculateProjectProgress($clientId) {
        $totalStmt = $this->pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ?");
        $totalStmt->execute([$clientId]);
        $total = $totalStmt->fetchColumn();

        $completedStmt = $this->pdo->prepare("SELECT COUNT(*) FROM `client_tasks` WHERE `client_id` = ? AND `status` = 'Completed'");
        $completedStmt->execute([$clientId]);
        $completed = $completedStmt->fetchColumn();

        $progressPercent = $total > 0 ? intval(($completed / $total) * 100) : 0;
        
        $projStatus = 'Planning';
        if ($progressPercent >= 100) $projStatus = 'Final Handover';
        elseif ($progressPercent >= 75) $projStatus = 'Testing & QA';
        elseif ($progressPercent >= 50) $projStatus = 'Active Development';
        elseif ($progressPercent >= 25) $projStatus = 'Design & Architecture';
        elseif ($progressPercent > 0) $projStatus = 'Discovery Phase';

        $updateProj = $this->pdo->prepare("UPDATE `client_projects` SET `progress` = ?, `status` = ? WHERE `client_id` = ?");
        $updateProj->execute([$progressPercent, $projStatus, $clientId]);
    }
}
