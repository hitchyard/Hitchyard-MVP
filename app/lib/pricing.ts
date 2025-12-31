/**
 * Hitchyard Pricing Logic - Service Business Model (Utah)
 * Removes 8.5% Sales Tax and 2.9% Melio Fee entirely.
 * Labels delivery costs as 'Freight Charges' for tax compliance.
 */

export interface InvoiceDetails {
  loadRate: number;      // Your base service fee
  freightCharges: number; // The third-party carrier cost
  total: number;         // sum of the above
}

/**
 * Generates billing data for Shippers.
 * @param baseRate - The primary service/load amount
 * @param carrierCost - The actual freight cost from the carrier
 */
export const calculateShipperInvoice = (
  baseRate: number, 
  carrierCost: number
): InvoiceDetails => {
  // Sales Tax (0%) and Melio Fees (0%) are removed to prevent 
  // QuickBooks/Melio from flagging them as taxable items.
  
  return {
    loadRate: baseRate,
    freightCharges: carrierCost,
    total: baseRate + carrierCost
  };
};
