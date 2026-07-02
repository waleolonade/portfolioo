<?php
/**
 * Unified Payment Engine Migration Script
 * Prepares the MySQL database schema for wallets, transactions, subscriptions, and logs.
 */
require_once __DIR__ . '/../../db.php';

try {
    echo "Starting payment engine schema migrations...\n";

    // 1. Create client_wallets table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_wallets` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "✓ Table client_wallets created or verified.\n";

    // 2. Create wallet_transactions table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `wallet_transactions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `wallet_id` INT NOT NULL,
        `type` ENUM('credit', 'debit') NOT NULL,
        `amount` DECIMAL(12,2) NOT NULL,
        `reference` VARCHAR(100) NOT NULL,
        `status` ENUM('pending', 'successful', 'failed') NOT NULL DEFAULT 'pending',
        `description` VARCHAR(255) NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (`wallet_id`) REFERENCES `client_wallets`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "✓ Table wallet_transactions created or verified.\n";

    // 3. Create client_subscriptions table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `client_subscriptions` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `client_id` INT NOT NULL,
        `status` ENUM('active', 'cancelled', 'expired', 'pending') NOT NULL DEFAULT 'pending',
        `plan_name` VARCHAR(100) NOT NULL,
        `amount` DECIMAL(12,2) NOT NULL,
        `currency` VARCHAR(10) NOT NULL DEFAULT 'NGN',
        `billing_cycle` ENUM('weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'monthly',
        `next_due_date` DATE NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`client_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "✓ Table client_subscriptions created or verified.\n";

    // 4. Create webhook_logs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS `webhook_logs` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `gateway` VARCHAR(50) NOT NULL,
        `payload` LONGTEXT NOT NULL,
        `headers` TEXT NULL,
        `verified` TINYINT(1) NOT NULL DEFAULT 0,
        `processed` TINYINT(1) NOT NULL DEFAULT 0,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    echo "✓ Table webhook_logs created or verified.\n";

    // 5. Add extra columns to payment_transactions
    $stmt = $pdo->prepare("DESCRIBE `payment_transactions`");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('provider_reference', $columns)) {
        $pdo->exec("ALTER TABLE `payment_transactions` ADD COLUMN `provider_reference` VARCHAR(255) NULL AFTER `reference`");
        echo "✓ Column provider_reference added to payment_transactions.\n";
    }
    if (!in_array('fee', $columns)) {
        $pdo->exec("ALTER TABLE `payment_transactions` ADD COLUMN `fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `amount`");
        echo "✓ Column fee added to payment_transactions.\n";
    }
    if (!in_array('settlement_amount', $columns)) {
        $pdo->exec("ALTER TABLE `payment_transactions` ADD COLUMN `settlement_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 AFTER `fee`");
        echo "✓ Column settlement_amount added to payment_transactions.\n";
    }
    if (!in_array('metadata', $columns)) {
        $pdo->exec("ALTER TABLE `payment_transactions` ADD COLUMN `metadata` TEXT NULL AFTER `gateway_response`");
        echo "✓ Column metadata added to payment_transactions.\n";
    }

    echo "All migrations completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
