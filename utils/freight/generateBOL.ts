/**
 * Bill of Lading PDF Generator
 * Creates a standard Straight Bill of Lading document
 * 
 * Requirements:
 * npm install pdfkit
 * 
 * Usage:
 * import { generateBOL } from '@/utils/freight/generateBOL';
 * const pdfBuffer = await generateBOL(bolData);
 */

import { BillOfLading } from '@/types/freight';

/**
 * Generates a PDF Bill of Lading document
 * @param bol - Bill of Lading data
 * @returns Promise<Buffer> - PDF file as buffer (can be sent as response or saved)
 */
export async function generateBOL(bol: BillOfLading): Promise<Buffer> {
  // Dynamic import for server-side only PDF generation
  const PDFDocument = (await import('pdfkit')).default;
  
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // =========================================================================
      // HEADER
      // =========================================================================
      doc.fontSize(20).font('Helvetica-Bold').text('STRAIGHT BILL OF LADING', {
        align: 'center',
      });

      doc.fontSize(10).font('Helvetica').text('Non-Negotiable Unless Consigned to Order', {
        align: 'center',
        marginTop: 5,
      });

      // BOL Number and Date
      doc.fontSize(9).marginTop(15);
      doc.text(`BOL #: ${bol.bolNumber}`, 50, doc.y);
      doc.text(`Date: ${bol.date}`, 350, doc.y - 20);

      // =========================================================================
      // SHIPPER SECTION
      // =========================================================================
      doc.fontSize(10).font('Helvetica-Bold').marginTop(20).text('SHIPPER');
      doc.fontSize(9).font('Helvetica');
      doc.rect(50, doc.y, 250, 80).stroke();
      
      doc.text(bol.shipper.name, 55, doc.y + 5);
      doc.text(bol.shipper.address, 55, doc.y + 20);
      doc.text(`Phone: ${bol.shipper.contactPhone}`, 55, doc.y + 35);

      // =========================================================================
      // CONSIGNEE SECTION
      // =========================================================================
      doc.fontSize(10).font('Helvetica-Bold').text('CONSIGNEE', 320, doc.y - 85);
      doc.fontSize(9).font('Helvetica');
      doc.rect(300, doc.y - 80, 250, 80).stroke();
      
      doc.text(bol.consignee.name, 305, doc.y - 75);
      doc.text(bol.consignee.address, 305, doc.y - 60);
      doc.text(`Phone: ${bol.consignee.contactPhone}`, 305, doc.y - 45);

      // =========================================================================
      // CARRIER SECTION (KEY FOR TAX COMPLIANCE)
      // =========================================================================
      doc.fontSize(10).font('Helvetica-Bold').marginTop(30).text('CARRIER INFORMATION');
      doc.fontSize(9).font('Helvetica');
      
      doc.rect(50, doc.y, 500, 100).stroke();
      doc.text(`Carrier Name: ${bol.carrier.name}`, 55, doc.y + 5);
      doc.text(`DOT #: ${bol.carrier.dotNumber}`, 55, doc.y + 22);
      doc.text(`SCAC Code: ${bol.carrier.scacCode || 'N/A'}`, 55, doc.y + 39);
      doc.text(`Trailer #: ${bol.carrier.trailerNumber}`, 55, doc.y + 56);
      doc.text(`Terms: ${bol.terms}`, 55, doc.y + 73);
      doc.text(`F.O.B. Point: ${bol.fobPoint} (Exempt from Sales Tax)`, 55, doc.y + 90, {
        color: '#008000', // Green for tax-exempt callout
      });

      // =========================================================================
      // LINE ITEMS (CARGO DETAILS)
      // =========================================================================
      doc.fontSize(10).font('Helvetica-Bold').marginTop(35).text('FREIGHT DETAILS');
      doc.fontSize(9).font('Helvetica');

      // Table header
      const tableTop = doc.y + 10;
      doc.rect(50, tableTop, 500, 20).stroke();
      
      doc.text('Qty', 55, tableTop + 5);
      doc.text('Type', 100, tableTop + 5);
      doc.text('Description', 170, tableTop + 5);
      doc.text('Weight (lbs)', 350, tableTop + 5);
      doc.text('Class', 430, tableTop + 5);
      doc.text('NMFC', 480, tableTop + 5);

      // Table rows
      let tableY = tableTop + 20;
      bol.lineItems.forEach((item, index) => {
        doc.rect(50, tableY, 500, 25).stroke();
        
        doc.text(item.quantity.toString(), 55, tableY + 5);
        doc.text(item.packagingType, 100, tableY + 5);
        doc.text(item.description, 170, tableY + 5);
        doc.text(item.weight.toString(), 350, tableY + 5);
        doc.text(item.class || 'N/A', 430, tableY + 5);
        doc.text(item.nmfcCode || 'N/A', 480, tableY + 5);
        
        tableY += 25;
      });

      // Hazmat indicator
      if (bol.hazmat) {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('red').text('⚠ HAZMAT - See attached safety documentation', 55, tableY + 10);
        doc.fillColor('black');
      }

      // =========================================================================
      // SIGNATURE BLOCK
      // =========================================================================
      doc.fontSize(10).font('Helvetica-Bold').marginTop(40).text('SIGNATURES & ACCEPTANCE');
      doc.fontSize(9).font('Helvetica');

      const signatureY = doc.y + 15;
      const signatureBoxHeight = 60;

      // Shipper signature
      doc.rect(50, signatureY, 140, signatureBoxHeight).stroke();
      doc.text('Shipper Signature', 55, signatureY + 5);
      doc.text('_____________________', 55, signatureY + 35);
      doc.text('Date: _____________', 55, signatureY + 48);

      // Driver/Carrier signature
      doc.rect(210, signatureY, 140, signatureBoxHeight).stroke();
      doc.text('Driver Signature', 215, signatureY + 5);
      doc.text('_____________________', 215, signatureY + 35);
      doc.text('Date: _____________', 215, signatureY + 48);

      // Consignee signature
      doc.rect(370, signatureY, 140, signatureBoxHeight).stroke();
      doc.text('Consignee Signature', 375, signatureY + 5);
      doc.text('_____________________', 375, signatureY + 35);
      doc.text('Date: _____________', 375, signatureY + 48);

      // =========================================================================
      // FOOTER
      // =========================================================================
      doc.fontSize(7).marginTop(80).text('This is a legal contract. Freight is accepted subject to the rate on the front of this bill of lading.', {
        align: 'center',
      });
      doc.text('For questions or claims, contact the carrier within 9 months of delivery.', {
        align: 'center',
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Server action wrapper for generating and returning BOL PDF
 * Use this in Next.js API routes or server actions
 */
export async function generateBOLResponse(bol: BillOfLading) {
  const pdfBuffer = await generateBOL(bol);
  
  return {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="BOL_${bol.bolNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    },
    body: pdfBuffer,
  };
}
