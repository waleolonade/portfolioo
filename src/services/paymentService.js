/**
 * paymentService.js — Brainfeels Tech
 * Production-grade payment gateway helper service.
 *
 * Handles dynamic script loading for online SDKs (Paystack, Flutterwave, Monnify)
 * to ensure optimal page performance and modular maintainability.
 */

// Helper to dynamically load external scripts via Promises
const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    // If the script is already present in document, resolve instantly
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load external payment SDK script: ${url}`));
    document.head.appendChild(script);
  });
};

/**
 * Trigger Paystack Inline checkout
 */
export const payWithPaystack = async (initData, verifyCallback) => {
  try {
    await loadScript('https://js.paystack.co/v2/inline.js');
    if (typeof window.PaystackPop === 'undefined') {
      throw new Error('Paystack SDK failed to load properly.');
    }
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: initData.public_key,
      email: initData.client_email,
      amount: Math.round(initData.amount * 100), // convert to kobo
      currency: initData.currency,
      ref: initData.reference,
      onSuccess: (transaction) => {
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
 * Trigger Flutterwave Standard checkout popup
 */
export const payWithFlutterwave = async (initData, verifyCallback) => {
  try {
    await loadScript('https://checkout.flutterwave.com/v3.js');
    if (typeof window.FlutterwaveCheckout === 'undefined') {
      throw new Error('Flutterwave SDK failed to load properly.');
    }
    window.FlutterwaveCheckout({
      public_key: initData.public_key,
      tx_ref: initData.tx_ref,
      amount: initData.amount,
      currency: initData.currency,
      payment_options: initData.payment_options || 'card,banktransfer,ussd',
      customer: {
        email: initData.client_email,
        name: initData.client_name
      },
      customizations: initData.customizations || {
        title: 'Brainfeels Tech',
        description: `Payment for invoice ${initData.invoice_code}`
      },
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          verifyCallback(initData.reference, { flw_transaction_id: response.transaction_id });
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
 * Trigger Stripe Hosted checkout session redirect
 */
export const payWithStripe = async (initData) => {
  if (initData.checkout_url) {
    window.location.href = initData.checkout_url;
  } else {
    alert(initData.gateway_error || 'Stripe Checkout Session URL is missing from backend response.');
  }
};

/**
 * Trigger Monnify Web SDK checkout popup
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
      onComplete: (response) => {
        if (response.status === 'SUCCESS') {
          verifyCallback(initData.reference);
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
