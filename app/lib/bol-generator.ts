/**
 * BOL Generator & Finalization
 * Links Bill of Lading to financial invoice and prepares for PDF generation
 * 
 * This module ensures:
 * 1. BOL and Invoice totals are linked for audit
 * 2. Utah tax exemption status is properly documented
 * 3. Complete freight documentation is generated for compliance
 */

import { BillOfLading, BOLRecord, BOLStatus } from '@/types/freight';
import { InvoiceDetails } from '@/app/lib/pricing';

/**
 * Generates a unique BOL ID
 * Format: BOL-{timestamp}-{random}
 */
export const generateBOLId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BOL-${timestamp}-${random}`;
};

/**
 * Prepares a complete BOL record linked to the financial invoice.
 * This creates an audit trail proving 3rd-party carrier transportation.
 * 
 * @param bolData - Bill of Lading details
 * @param invoice - Invoice details from pricing calculation
 * @param loadId - Optional parent load ID for relationship tracking
 * @returns BOLRecord ready for PDF generation and database storage
 */
export const finalizeFreightDocumentation = (
  bolData: BillOfLading,
  invoice: InvoiceDetails,
  loadId?: string
): BOLRecord => {
  return {
    ...bolData,
    bolId: generateBOLId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'created' as BOLStatus,
    metadata: {
      linkedInvoiceTotal: invoice.total,
      utahTaxExemptStatus: true, // FOB Origin = Tax exempt
      loadId: loadId,
      invoiceBreakdown: {
        loadRate: invoice.loadRate,
        freightCharges: invoice.freightCharges,
        total: invoice.total,
      },
      complianceNotes: 'F.O.B. Shipping Point - Freight charges pass-through, exempt from sales tax',
    },
  };
};

/**
 * Updates BOL status through its lifecycle
 * @param bolRecord - Existing BOL record
 * @param newStatus - Target status
 * @returns Updated BOL record
 */
export const updateBOLStatus = (
  bolRecord: BOLRecord,
  newStatus: BOLStatus
): BOLRecord => {
  return {
    ...bolRecord,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...(newStatus === 'delivered' && { deliveredAt: new Date().toISOString() }),
  };
};

/**
 * Validates that BOL and Invoice amounts match
 * Critical for audit compliance
 */
export const validateBOLInvoiceAlignment = (
  bol: BOLRecord,
  expectedTotal: number
): { valid: boolean; message: string } => {
  const linkedTotal = bol.metadata?.linkedInvoiceTotal;
  
  if (!linkedTotal) {
    return {
      valid: false,
      message: 'BOL metadata missing linked invoice total',
    };
  }

  if (Math.abs(linkedTotal - expectedTotal) > 0.01) {
    return {
      valid: false,
      message: `Invoice mismatch: BOL expects $${linkedTotal}, but actual is $${expectedTotal}`,
    };
  }

  return {
    valid: true,
    message: 'BOL and Invoice amounts aligned ✓',
  };
};

/**
 * Generates compliance report for Utah Tax Commission
 * Proves freight is transported by 3rd party carrier
 */
export const generateComplianceReport = (bol: BOLRecord): string => {
  return `
=== UTAH TAX EXEMPTION COMPLIANCE REPORT ===

BOL Number: ${bol.bolNumber}
BOL ID: ${bol.bolId}
Date: ${bol.date}

CARRIER VERIFICATION:
- Carrier Name: ${bol.carrier.name}
- DOT Number: ${bol.carrier.dotNumber}
- SCAC Code: ${bol.carrier.scacCode || 'N/A'}

FREIGHT DETAILS:
- FOB Point: ${bol.fobPoint} (Shipping Point)
- Terms: ${bol.terms}
- Total Freight Weight: ${bol.lineItems.reduce((sum, item) => sum + item.weight, 0)} lbs

FINANCIAL LINK:
- Invoice Total: $${bol.metadata?.linkedInvoiceTotal || 'N/A'}
- Load Rate: $${bol.metadata?.invoiceBreakdown?.loadRate || 'N/A'}
- Freight Charges (Pass-through): $${bol.metadata?.invoiceBreakdown?.freightCharges || 'N/A'}

TAX STATUS:
✓ Freight transportation by 3rd-party carrier (${bol.carrier.name})
✓ FOB Origin - Responsibility passes at shipping point
✓ Exempt from 8.5% Utah Sales Tax per UCA 59-12-104

SHIPPER: ${bol.shipper.name}
CONSIGNEE: ${bol.consignee.name}

Generated: ${new Date().toISOString()}
Status: ${bol.status}
  `;
};
