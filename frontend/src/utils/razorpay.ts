/**
 * ResQPet — Razorpay Payment Utility
 * Loads the Razorpay checkout.js script dynamically and opens the payment popup.
 */

export const RAZORPAY_KEY_ID =
  (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_live_TqrM42YxNnEYQ6';

// Razorpay window type declaration
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise (1 INR = 100 paise)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayInstance {
  open(): void;
  close(): void;
  on(event: string, handler: () => void): void;
}

/**
 * Dynamically loads the Razorpay checkout script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Opens a Razorpay payment popup.
 *
 * @param options - Razorpay checkout options (amount in INR, not paise)
 * @returns A promise that resolves with the payment response or rejects on failure/dismiss
 */
export function openRazorpayCheckout(
  options: Omit<RazorpayOptions, 'key' | 'amount'> & { amount: number }
): Promise<RazorpayPaymentResponse> {
  return new Promise(async (resolve, reject) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      reject(new Error('Failed to load Razorpay checkout script. Please check your internet connection.'));
      return;
    }

    const rzp = new window.Razorpay({
      ...options,
      key: RAZORPAY_KEY_ID,
      amount: Math.round(options.amount * 100), // Convert INR to paise
      currency: options.currency || 'INR',
      theme: {
        color: '#16a34a',
        ...options.theme,
      },
      handler: (response: RazorpayPaymentResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
        escape: true,
        confirm_close: true,
        ...options.modal,
      },
    });

    rzp.open();
  });
}
