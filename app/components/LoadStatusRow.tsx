import { createClient } from '@/utils/supabase/server';

export default async function LoadStatusRow({ loadId }: { loadId: string }) {
  const supabase = createClient();
  
  // Fetch the BOL status and PDF URL for this load
  const { data: bol } = await supabase
    .from('bill_of_ladings')
    .select('status, pdf_url')
    .eq('load_id', loadId)
    .single();

  // Build the public PDF URL if available
  const pdfUrl = bol?.pdf_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/freight-documents/${bol.pdf_url}`
    : null;

  // Map status to badge color/text
  const statusMap: Record<string, { text: string; color: string; textColor: string }> = {
    GENERATED: { text: '✓ BOL GENERATED', color: 'bg-green-100', textColor: 'text-green-700' },
    DELIVERED: { text: '✓ DELIVERED', color: 'bg-blue-100', textColor: 'text-blue-700' },
    PENDING: { text: 'PENDING DOCS', color: 'bg-amber-100', textColor: 'text-amber-700' },
    default: { text: 'UNKNOWN', color: 'bg-gray-100', textColor: 'text-gray-700' },
  };
  const badge = bol?.status ? (statusMap[bol.status] || statusMap.default) : statusMap.PENDING;

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex-1">
        <p className="font-bold text-slate-800">Load ID: {loadId}</p>
      </div>

      {/* STATUS BADGE */}
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} ${badge.textColor}`}>
          {badge.text}
        </span>
      </div>

      {/* ACTION LINK */}
      {pdfUrl && (
        <a 
          href={pdfUrl}
          target="_blank"
          className="text-sm text-blue-600 hover:underline font-semibold"
        >
          View PDF
        </a>
      )}
    </div>
  );
}
