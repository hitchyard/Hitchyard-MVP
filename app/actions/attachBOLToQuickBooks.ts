/**
 * QuickBooks BOL Attachment Action
 * Attaches Bill of Lading PDF to QuickBooks Invoice for complete financial record
 * 
 * Server Action Usage:
 * import { attachBOLToQuickBooks } from '@/app/actions/attachBOLToQuickBooks';
 * const result = await attachBOLToQuickBooks(invoiceId, pdfBuffer, fileName, accessToken, realmId);
 */

'use server';

interface QuickBooksAttachmentResponse {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  attachableRef?: Array<{
    EntityRef: {
      type: string;
      value: string;
    };
    IncludeOnSend: boolean;
  }>;
  error?: {
    message: string;
    code: string;
  };
}

interface AttachBOLResult {
  success: boolean;
  attachmentId?: string;
  fileName: string;
  message: string;
  error?: string;
}

/**
 * Attaches a Bill of Lading PDF to a QuickBooks Invoice
 * Creates a multipart/form-data request with metadata and PDF content
 * 
 * @param invoiceId - QuickBooks Invoice ID (realm-specific)
 * @param pdfBuffer - PDF file as Buffer (from BOL generation)
 * @param fileName - Display filename (e.g., "BOL_12345-67890-ABC.pdf")
 * @param accessToken - QuickBooks OAuth2 access token
 * @param realmId - QuickBooks Realm ID (Company ID)
 * @returns AttachBOLResult with status and attachment details
 */
export async function attachBOLToQuickBooks(
  invoiceId: string,
  pdfBuffer: Buffer,
  fileName: string,
  accessToken: string,
  realmId: string
): Promise<AttachBOLResult> {
  try {
    // ===================================================================
    // VALIDATION
    // ===================================================================
    if (!invoiceId || !accessToken || !realmId) {
      return {
        success: false,
        fileName,
        message: 'Missing required parameters',
        error: 'invoiceId, accessToken, and realmId are required',
      };
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return {
        success: false,
        fileName,
        message: 'Invalid PDF buffer',
        error: 'PDF buffer is empty or undefined',
      };
    }

    // ===================================================================
    // CONSTRUCT MULTIPART REQUEST
    // ===================================================================
    const boundary = '----Boundary' + Math.random().toString(16).substring(2);

    // Metadata tells QB which invoice this attachment belongs to
    const metadata = JSON.stringify({
      AttachableRef: [
        {
          EntityRef: {
            type: 'Invoice',
            value: invoiceId,
          },
          IncludeOnSend: true, // Include BOL when sending invoice to customer
        },
      ],
      FileName: fileName,
      ContentType: 'application/pdf',
    });

    // Build multipart body
    const bodyParts = [
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file_metadata_01"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file_content_01"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`
      ),
      pdfBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ];

    const body = Buffer.concat(bodyParts);

    // ===================================================================
    // SEND TO QUICKBOOKS API
    // ===================================================================
    console.log(`[QB_ATTACHMENT] Uploading BOL: ${fileName}`);
    console.log(`[QB_ATTACHMENT] Invoice ID: ${invoiceId}`);
    console.log(`[QB_ATTACHMENT] Realm ID: ${realmId}`);

    const response = await fetch(
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Accept': 'application/json',
        },
        body: body,
      }
    );

    // ===================================================================
    // HANDLE RESPONSE
    // ===================================================================
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[QB_ATTACHMENT] API Error: ${response.status}`);
      console.error(`[QB_ATTACHMENT] Response: ${errorData}`);

      return {
        success: false,
        fileName,
        message: 'QuickBooks API error',
        error: `HTTP ${response.status}: ${errorData}`,
      };
    }

    const qbResponse: QuickBooksAttachmentResponse = await response.json();

    if (qbResponse.error) {
      console.error(`[QB_ATTACHMENT] QB Error: ${qbResponse.error.message}`);

      return {
        success: false,
        fileName,
        message: 'QuickBooks rejected attachment',
        error: qbResponse.error.message,
      };
    }

    // ===================================================================
    // SUCCESS
    // ===================================================================
    console.log(`[QB_ATTACHMENT] ✓ BOL attached successfully`);
    console.log(`[QB_ATTACHMENT] Attachment ID: ${qbResponse.id}`);
    console.log(`[QB_ATTACHMENT] File Size: ${qbResponse.fileSize} bytes`);

    return {
      success: true,
      attachmentId: qbResponse.id,
      fileName: qbResponse.fileName,
      message: `BOL attached to Invoice ${invoiceId}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[QB_ATTACHMENT] Exception: ${errorMessage}`);

    return {
      success: false,
      fileName,
      message: 'Failed to attach BOL to QuickBooks',
      error: errorMessage,
    };
  }
}

/**
 * Batch attach multiple BOLs to QuickBooks
 * Useful for multi-invoice shipments
 */
export async function attachBOLsToQuickBooks(
  attachments: Array<{
    invoiceId: string;
    pdfBuffer: Buffer;
    fileName: string;
  }>,
  accessToken: string,
  realmId: string
): Promise<AttachBOLResult[]> {
  const results = await Promise.all(
    attachments.map((attachment) =>
      attachBOLToQuickBooks(
        attachment.invoiceId,
        attachment.pdfBuffer,
        attachment.fileName,
        accessToken,
        realmId
      )
    )
  );

  const successCount = results.filter((r) => r.success).length;
  console.log(
    `[QB_ATTACHMENT] Batch Complete: ${successCount}/${results.length} successful`
  );

  return results;
}
