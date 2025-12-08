"use client";

import React, { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { setupShipperPayment, savePaymentMethod } from "../actions/stripe";

// Load Stripe outside component to avoid recreating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  onSuccess: () => void;
}

function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Confirm the Setup Intent
      const { setupIntent, error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href, // Fallback for redirect-based methods
        },
        redirect: "if_required", // Stay on page if no redirect needed
      });

      if (error) {
        setErrorMessage(error.message || "Failed to setup payment method");
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.status === "succeeded") {
        // Save payment method to database
        const result = await savePaymentMethod(setupIntent.id);

        if (result.error) {
          setErrorMessage(result.error);
        } else if (result.success) {
          setSuccessMessage("Payment method added successfully!");
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setErrorMessage("Setup Intent did not complete successfully");
      }
    } catch (err) {
      setErrorMessage((err as Error)?.message ?? "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg p-6">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-deep-green text-white font-semibold rounded-md hover:bg-[#0e2b26] disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {isProcessing ? "Processing..." : "Add Payment Method"}
      </button>
    </form>
  );
}

interface PaymentSetupFormProps {
  onSuccess: () => void;
}

export default function PaymentSetupForm({ onSuccess }: PaymentSetupFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await setupShipperPayment();

        if (result.error) {
          setError(result.error);
        } else if (result.clientSecret) {
          setClientSecret(result.clientSecret);
        } else {
          setError("Failed to initialize payment setup");
        }
      } catch (err) {
        setError((err as Error)?.message ?? "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white bg-opacity-5 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-deep-green border-t-transparent rounded-full"></div>
          <p className="ml-4 text-gray-400">Initializing payment setup...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Payment Setup Error
        </h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">Unable to initialize payment setup. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-8">
      <h3 className="text-2xl font-semibold text-white mb-4">
        Add Payment Method
      </h3>
      <p className="text-gray-400 mb-6">
        Add a payment method to accept bids and pay carriers. Your card details are securely stored by Stripe.
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night",
            variables: {
              colorPrimary: "#166e5a",
              colorBackground: "#1a1a1a",
              colorText: "#ffffff",
              colorDanger: "#df1b41",
              fontFamily: "system-ui, sans-serif",
              spacingUnit: "4px",
              borderRadius: "8px",
            },
          },
        }}
      >
        <PaymentForm onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
