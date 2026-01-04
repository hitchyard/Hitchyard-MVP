import { calculateShipperInvoice } from '@/app/lib/pricing';

interface InvoiceSummaryProps {
  loadRate: number;
  carrierCost: number;
}

export const InvoiceSummary = ({ loadRate, carrierCost }: InvoiceSummaryProps) => {
  const billing = calculateShipperInvoice(loadRate, carrierCost);

  return (
    <div className="invoice-container border border-gray-200 rounded-none p-6 bg-surface">
      {/* Standard Service Fee */}
      <div className="row flex justify-between py-imperial border-b border-gray-100">
        <span className="text-gray-700">Load Matching Service</span>
        <span className="font-semibold text-gray-900">${billing.loadRate.toFixed(2)}</span>
      </div>

      {/* This is the key line for the Tax Commission */}
      <div className="row flex justify-between py-imperial border-b border-gray-100">
        <span className="text-gray-700">Freight Charges (F.O.B. Shipping Point)</span>
        <span className="font-semibold text-gray-900">${billing.freightCharges.toFixed(2)}</span>
      </div>

      {/* Total - No Tax, No Melio Fees visible */}
      <div className="row total flex justify-between py-imperial mt-2 bg-gray-50 px-4 rounded-none">
        <strong className="text-lg text-gray-900">Total Amount:</strong>
        <strong className="text-lg text-green-700">${billing.total.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default InvoiceSummary;
