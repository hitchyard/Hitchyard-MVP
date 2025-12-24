import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { companyName, email, mcDotNumber } = await req.json()

    // 1. Call Dify Agent
    const difyResponse = await fetch('http://129.212.181.151/v1/completion-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: { company: companyName, mc_number: mcDotNumber, email: email },
        response_mode: 'blocking',
        user: 'hitchyard-admin',
      }),
    })

    const difyData = await difyResponse.json()
    const result: string = difyData.answer || 'DENIED'

    // 2. Persist to Supabase for Library Auditing
    await supabase.from('applicants').insert([
      {
        company_name: companyName,
        email,
        mc_number: mcDotNumber,
        status: result,
      },
    ])

    return NextResponse.json({ status: result })
  } catch (error) {
    console.error('Vetting Error:', error)
    return NextResponse.json({ error: 'System Error' }, { status: 500 })
  }
}
