import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const loadId = searchParams.get('loadId');

  if (!loadId) {
    return NextResponse.json({ error: 'loadId is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('bill_of_ladings')
    .select('status, bol_number, pdf_url, created_at')
    .eq('load_id', loadId)
    .single();

  if (error || !data) {
    return NextResponse.json({ status: 'NOT_FOUND', message: 'No documents found for this load ID.' });
  }

  return NextResponse.json({
    status: data.status,
    bolNumber: data.bol_number,
    generatedAt: data.created_at,
    pdfUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/freight-documents/${data.pdf_url}`
  });
}
