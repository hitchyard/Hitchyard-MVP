import { NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Uint8Array[] = [];

    // Collect the PDF data chunks
    doc.on('data', (chunk) => chunks.push(chunk));

    // --- PDF CONTENT DESIGN ---
    doc.fontSize(20).font('Helvetica-Bold').text('STRAIGHT BILL OF LADING', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Non-Negotiable Unless Consigned to Order', { align: 'center' });
    doc.moveDown();

    // BOL Header Info
    doc.fontSize(10).text(`BOL Number: ${data.bolNumber || data.bol_number || 'PENDING'}`);
    doc.text(`Load ID: ${data.loadId || data.load_id}`);
    doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Shipper & Consignee Section
    const startY = doc.y;
    
    // Shipper Box
    doc.rect(50, startY, 220, 80).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text('SHIPPER:', 55, startY + 5);
    doc.fontSize(9).font('Helvetica');
    doc.text(data.shipper?.name || data.shipper_name || 'N/A', 55, startY + 20);
    doc.text(data.shipper?.address || 'Address', 55, startY + 35);
    doc.text(`Phone: ${data.shipper?.contactPhone || 'N/A'}`, 55, startY + 50);
    
    // Consignee Box
    doc.rect(280, startY, 220, 80).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text('CONSIGNEE:', 285, startY + 5);
    doc.fontSize(9).font('Helvetica');
    doc.text(data.consignee?.name || data.consignee_name || 'N/A', 285, startY + 20);
    doc.text(data.consignee?.address || 'Address', 285, startY + 35);
    doc.text(`Phone: ${data.consignee?.contactPhone || 'N/A'}`, 285, startY + 50);
    
    doc.moveDown(5);

    // Carrier Section
    doc.fontSize(10).font('Helvetica-Bold').text('CARRIER INFORMATION:', { underline: true });
    doc.fontSize(9).font('Helvetica');
    doc.text(`Carrier: ${data.carrier?.name || data.carrier_name || 'TBD'}`);
    doc.text(`DOT #: ${data.carrier?.dotNumber || data.carrier_dot || 'N/A'}`);
    doc.text(`SCAC Code: ${data.carrier?.scacCode || 'N/A'}`);
    doc.text(`Trailer #: ${data.carrier?.trailerNumber || 'N/A'}`);
    doc.text(`F.O.B. Point: ${data.fobPoint || 'Origin'} (Exempt from Sales Tax)`, {
      color: '#008000',
    });
    doc.moveDown();

    // Freight Details
    if (data.lineItems && data.lineItems.length > 0) {
      doc.fontSize(10).font('Helvetica-Bold').text('FREIGHT DETAILS:');
      doc.fontSize(9).font('Helvetica');
      
      const tableTop = doc.y;
      doc.rect(50, tableTop, 500, 20).stroke();
      doc.text('Qty', 55, tableTop + 5);
      doc.text('Type', 100, tableTop + 5);
      doc.text('Description', 170, tableTop + 5);
      doc.text('Weight (lbs)', 350, tableTop + 5);
      
      let tableY = tableTop + 20;
      data.lineItems.forEach((item: any) => {
        doc.rect(50, tableY, 500, 25).stroke();
        doc.text(item.quantity?.toString() || '1', 55, tableY + 5);
        doc.text(item.packagingType || 'N/A', 100, tableY + 5);
        doc.text(item.description || 'Commodity', 170, tableY + 5);
        doc.text(item.weight?.toString() || '0', 350, tableY + 5);
        tableY += 25;
      });
      doc.moveDown();
    }

    // Hazmat warning
    if (data.hazmat) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor('red');
      doc.text('⚠ HAZMAT - See attached safety documentation');
      doc.fillColor('black');
    }

    doc.moveDown(2);

    // Signature Section
    doc.fontSize(10).font('Helvetica-Bold').text('SIGNATURES:');
    const sigStartY = doc.y + 10;
    
    // Shipper signature
    doc.rect(50, sigStartY, 140, 60).stroke();
    doc.fontSize(8).font('Helvetica').text('Shipper', 55, sigStartY + 5);
    doc.text('_____________________', 55, sigStartY + 30);
    doc.text('Date: _____________', 55, sigStartY + 45);
    
    // Driver signature
    doc.rect(210, sigStartY, 140, 60).stroke();
    doc.fontSize(8).font('Helvetica').text('Driver', 215, sigStartY + 5);
    doc.text('_____________________', 215, sigStartY + 30);
    doc.text('Date: _____________', 215, sigStartY + 45);
    
    // Consignee signature
    doc.rect(370, sigStartY, 140, 60).stroke();
    doc.fontSize(8).font('Helvetica').text('Consignee', 375, sigStartY + 5);
    doc.text('_____________________', 375, sigStartY + 30);
    doc.text('Date: _____________', 375, sigStartY + 45);

    // Footer
    doc.moveDown(6);
    doc.fontSize(7).text(
      'This is a legal contract. Freight is accepted subject to the rate on the front of this bill of lading. For questions or claims, contact the carrier within 9 months of delivery.',
      { align: 'center', width: 500 }
    );

    // Finalize the PDF
    doc.end();

    // Wait for the stream to finish and return the buffer
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks as any)));
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BOL_${data.loadId || data.load_id || 'document'}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[GENERATE_BOL] PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
