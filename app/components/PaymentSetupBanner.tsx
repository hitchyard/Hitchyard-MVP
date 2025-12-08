"use client";

import React from "react";
import PaymentSetupForm from "./PaymentSetupForm";

interface PaymentSetupBannerProps {
  stripePaymentMethodId: string | null;
  userRole: string | null;
  onPaymentAdded: () => void;
}

export default function PaymentSetupBanner({
  stripePaymentMethodId,
  userRole,
  onPaymentAdded,
}: PaymentSetupBannerProps) {
  const [showForm, setShowForm] = React.useState(false);

  // Only show for shippers without payment method
  if (userRole !== "shipper" || stripePaymentMethodId) {
    return null;
  }

  if (showForm) {
    return (
      <div className="mb-8">
        <PaymentSetupForm
          onSuccess={() => {
            setShowForm(false);
            onPaymentAdded();
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-deep-green p-6 mb-8 rounded-md shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-charcoal-black mb-2">
            Payment Method Required
          </h3>
          <p className="text-gray-700 mb-4">
            Add a payment method to accept bids and process payments to carriers. 
            Your payment information is securely stored and encrypted by Stripe.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-deep-green text-white font-semibold rounded-md hover:bg-[#0e2b26] transition"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
