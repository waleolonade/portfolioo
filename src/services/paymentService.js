/**
 * paymentService.js — Brainfeels Tech
 * Production-grade payment gateway helper service.
 * Handles dynamic script loading, fallback retries, and modal handlers.
 */

// Helper to dynamically load external scripts with retry and timeout logic
const loadScript = (url, retries = 3, timeoutMs = 12000) => {
  return new Promise((resolve, reject) => {
    const attemptLoad = (attempt) => {
      // If script is already in the document, resolve immediately
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      const timer = setTimeout(() => {
        cleanup();
        if (attempt < retries) {
          console.warn(`[Payment Loader] Timeout loading ${url}. Retrying (Attempt ${attempt + 1}/${retries})...`);
          attemptLoad(attempt + 1);
        } else {
          reject(new Error(`Network timeout loading payment SDK: ${url}`));
        }
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };

      script.onload = () => {
        clearTimeout(timer);
        resolve();
      };

      script.onerror = () => {
        cleanup();
        if (attempt < retries) {
          console.warn(`[Payment Loader] Load error on ${url}. Retrying in 1.5s (Attempt ${attempt + 1}/${retries})...`);
          setTimeout(() => attemptLoad(attempt + 1), 1500);
        } else {
          reject(new Error(`Connection failed while loading payment SDK: ${url}`));
        }
      };

      document.head.appendChild(script);
    };

    attemptLoad(1);
  });
};

/**
 * Trigger Paystack Inline Checkout Popup
 */
export const payWithPaystack = async (initData, verifyCallback) => {
  try {
    await loadScript('https://js.paystack.co/v2/inline.js');
    if (typeof window.PaystackPop === 'undefined') {
      throw new Error('Paystack SDK failed to initialize.');
    }
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: initData.public_key,
      email: initData.client_email,
      amount: Math.round(initData.amount * 100), // Convert to kobo/cents
      currency: initData.currency || 'NGN',
      ref: initData.reference,
      firstname: initData.client_name || '',
      metadata: {
        invoice_id: initData.invoice_id,
        invoice_code: initData.invoice_code,
        custom_fields: [
          {
            display_name: "Invoice Code",
            variable_name: "invoice_code",
            value: initData.invoice_code
          }
        ]
      },
      onSuccess: (transaction) => {
        console.log('[Paystack] Payment completed successfully', transaction);
        verifyCallback(transaction.reference || initData.reference);
      },
      onCancel: () => {
        console.log('[Paystack] Payment modal closed by user');
      }
    });
  } catch (err) {
    console.error('[Paystack Error]', err);
    alert(err.message || 'Paystack initialization failed.');
  }
};

/**
 * Trigger Flutterwave Standard Checkout Popup
 */
export const payWithFlutterwave = async (initData, verifyCallback) => {
  try {
    await loadScript('https://checkout.flutterwave.com/v3.js');
    if (typeof window.FlutterwaveCheckout === 'undefined') {
      throw new Error('Flutterwave SDK failed to initialize.');
    }
    window.FlutterwaveCheckout({
      public_key: initData.public_key,
      tx_ref: initData.reference, // Use backend transaction reference as tx_ref
      amount: initData.amount,
      currency: initData.currency || 'NGN',
      payment_options: initData.payment_options || 'card,banktransfer,ussd',
      customer: {
        email: initData.client_email,
        name: initData.client_name
      },
      meta: {
        invoice_id: initData.invoice_id,
        invoice_code: initData.invoice_code
      },
      customizations: initData.customizations || {
        title: 'Brainfeels Tech',
        description: `Payment for invoice ${initData.invoice_code}`
      },
      callback: (response) => {
        console.log('[Flutterwave] Checkout response', response);
        if (response.status === 'successful' || response.status === 'completed') {
          verifyCallback(initData.reference, { flw_transaction_id: response.transaction_id });
        } else {
          alert('Flutterwave transaction was not successful. Status: ' + response.status);
        }
      },
      onclose: () => {
        console.log('[Flutterwave] Checkout modal closed by user');
      }
    });
  } catch (err) {
    console.error('[Flutterwave Error]', err);
    alert(err.message || 'Flutterwave initialization failed.');
  }
};

/**
 * Trigger Stripe Hosted Checkout Session Redirect
 */
export const payWithStripe = async (initData) => {
  if (initData.checkout_url) {
    window.location.href = initData.checkout_url;
  } else {
    alert(initData.gateway_error || 'Stripe Checkout Session URL is missing from backend response.');
  }
};

/**
 * Trigger Monnify Web SDK Checkout Popup
 */
export const payWithMonnify = async (initData, verifyCallback) => {
  try {
    await loadScript('https://sdk.monnify.com/v1/sdk.js');
    if (typeof window.MonnifySDK === 'undefined') {
      throw new Error('Monnify SDK failed to load properly.');
    }
    window.MonnifySDK.initialize({
      amount: initData.amount,
      currency: initData.currency || 'NGN',
      reference: initData.reference,
      customerName: initData.client_name,
      customerEmail: initData.client_email,
      apiKey: initData.public_key,
      contractCode: initData.contract_code,
      paymentDescription: `Payment for invoice ${initData.invoice_code}`,
      metadata: {
        invoice_id: initData.invoice_id,
        invoice_code: initData.invoice_code
      },
      onComplete: (response) => {
        console.log('[Monnify] Checkout response', response);
        if (response.status === 'SUCCESS' || response.paymentStatus === 'PAID') {
          verifyCallback(initData.reference);
        } else {
          alert('Monnify payment was not completed. Status: ' + response.status);
        }
      },
      onClose: () => {
        console.log('[Monnify] Web SDK closed by user');
      }
    });
  } catch (err) {
    console.error('[Monnify Error]', err);
    alert(err.message || 'Monnify SDK initialization failed.');
  }
};
