/**
 * Bill of Lading (BOL) Type Definition
 * Industry-standard freight document for Utah Tax Commission compliance
 * 
 * The BOL serves as:
 * 1. Proof of 3rd-party carrier transportation (tax exemption)
 * 2. Contract between shipper, carrier, and consignee
 * 3. Shipment audit trail and compliance record
 */

export interface BillOfLading {
  bolNumber: string;         // Unique ID (Industry standard is usually 17 digits)
  date: string;              // Date of pickup (ISO 8601 format)
  
  // SHIPPER (The Origin)
  shipper: {
    name: string;
    address: string;
    contactPhone: string;
  };

  // CONSIGNEE (The Destination)
  consignee: {
    name: string;
    address: string;
    contactPhone: string;
  };

  // CARRIER (The "Proof" for Utah Tax Commission)
  carrier: {
    name: string;            // Legal Carrier Name
    dotNumber: string;       // REQUIRED for proof of 3rd party transport
    scacCode?: string;       // Standard Carrier Alpha Code
    trailerNumber: string;
  };

  // THE LOAD DETAILS
  lineItems: Array<{
    quantity: number;
    packagingType: 'Pallets' | 'Cartons' | 'Crates' | 'Loose';
    description: string;     // Commodity type (e.g., "Non-Hazardous Parts")
    weight: number;          // In lbs
    nmfcCode?: string;       // National Motor Freight Classification
    class?: string;          // Freight Class (e.g., 50, 70, 100)
  }>;

  // LEGAL & COMPLIANCE
  terms: 'Prepaid' | 'Collect' | '3rd Party';
  fobPoint: 'Origin';        // "Shipping Point" - Crucial for Utah tax exemption
  hazmat: boolean;
  
  // SIGNATURE DATA
  signatures: {
    shipperSigned: boolean;
    carrierSigned: boolean;
    consigneeSigned: boolean; // Captured at delivery
  };
}

/**
 * BOL Status Tracking
 */
export type BOLStatus = 'created' | 'issued' | 'picked_up' | 'in_transit' | 'delivered' | 'archived';

/**
 * BOL with Status & Timestamps
 */
export interface BOLRecord extends BillOfLading {
  bolId: string;                    // Database primary key
  status: BOLStatus;
  createdAt: string;                // ISO 8601 timestamp
  updatedAt: string;                // ISO 8601 timestamp
  deliveredAt?: string;             // ISO 8601 timestamp when consignee signed
  metadata?: {
    linkedInvoiceTotal?: number;    // Total from invoice for audit trail
    utahTaxExemptStatus?: boolean;  // Tax compliance flag
    loadId?: string;                // Link to parent load record
    invoiceBreakdown?: {
      loadRate: number;
      freightCharges: number;
      total: number;
    };
    complianceNotes?: string;
    [key: string]: any;             // Allow additional tracking fields
  };
}
