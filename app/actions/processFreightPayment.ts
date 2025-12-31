'use server';

import { calculateShipperInvoice } from '@/app/lib/pricing';
import { generateBOL } from '@/utils/freight/generateBOL';
import { attachBOLToQuickBooks } from '@/app/actions/attachBOLToQuickBooks';
import { supabaseClient } from '@/lib/supabaseClient';

/**
 * Executes the full freight cycle: 
 * Billing → PDF Generation → Archive → QuickBooks Sync
 */
export async function processFreightPayment({
  loadId,
  baseRate,
  carrierCost,
  bolData,
  qbInvoiceId
}: {
  loadId: string;
  baseRate: number;
  carrierCost: number;
  bolData: any;
  qbInvoiceId: string;
}) {
  try {
    // 1. Calculate Billing (Subtotal + Freight Charges Only)
    const billing = calculateShipperInvoice(baseRate, carrierCost);

    // 2. Generate the PDF Buffer using PDFKit
    const pdfBuffer = await generateBOL({ ...bolData, loadId });

    // 3. Upload to Supabase Storage
    const fileName = `BOL_${loadId}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('freight-documents')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    // 4. Save Record to Database Table
    await supabaseClient.from('bill_of_ladings').insert({
      load_id: loadId,
      bol_number: bolData.bolNumber,
      pdf_url: uploadData.path,
      status: 'GENERATED'
    });

    // 5. Sync to QuickBooks (BOL is automatically attached to the outgoing email)
    await attachBOLToQuickBooks(
      qbInvoiceId,
      pdfBuffer,
      fileName,
      process.env.QB_ACCESS_TOKEN!,
      process.env.QB_REALM_ID!
    );

    return { success: true, total: billing.total, pdfUrl: uploadData.path };
    
  } catch (error) {
    console.error('Freight Process Failed:', error);
    return { success: false, error: String(error) };
  }
}
