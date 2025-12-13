// IMPORTANT: Install 'airtable' package first: npm install airtable

import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable Base
// Ensure AIRTABLE_PAT and AIRTABLE_BASE_ID are in your environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT }).base(process.env.AIRTABLE_BASE_ID as string);

// The name of the table/Base where your team tracks carrier vetting
const CARRIER_VETTING_TABLE = 'Carrier Vetting Queue'; 

export async function POST(req: Request) {
  try {
    const { 
      user_id, 
      email, 
      company_name, 
      zip_code, 
      cargo_policy, 
      auto_policy 
    } = await req.json();

    if (!email || !user_id) {
      return NextResponse.json({ error: 'Missing required profile data.' }, { status: 400 });
    }

    // 1. Create a new record in Airtable for the manual review team
    await base(CARRIER_VETTING_TABLE).create([
      {
        fields: {
          // Field names must exactly match your Airtable column headers
          "Supabase ID": user_id, 
          "Email": email,
          "Company Name": company_name,
          "Zip Code": zip_code,
          "Cargo Policy #": cargo_policy,
          "Auto Policy #": auto_policy,
          "Vetting Status": "New Signup - Pending Review", // Initial status for your team
          "Signup Date": new Date().toISOString(),
        },
      },
    ]);

    return NextResponse.json({ message: 'Airtable sync successful.' }, { status: 200 });

  } catch (error) {
    console.error('Airtable sync failed:', error);
    // IMPORTANT: Do NOT let a failed sync break the user's registration flow.
    // Return success to the user, but log the error internally.
    return NextResponse.json({ message: 'Profile saved, but sync to Airtable failed.' }, { status: 202 });
  }
}
