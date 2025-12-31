"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { DocusealForm } from "@docuseal/react";

export default function SignContractPage() {
  const [prefill, setPrefill] = useState<{ [key: string]: string | undefined }>({});
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const run = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      const today = new Date().toISOString().split("T")[0];

      setPortalUrl(process.env.NEXT_PUBLIC_DOCUSEAL_FORM_URL || null);

      if (!userId) {
        setPrefill({ date: today });
        return;
      }

      const { data: reg } = await supabase
        .from("registrations")
        .select("company_name, mc_number")
        .eq("user_id", userId)
        .single();

      setPrefill({
        'CARRIER': reg?.company_name ?? undefined,
        'MC#': reg?.mc_number ?? undefined,
        'date': today,
      });
    };

    run();
  }, []);

  return (
    <main className="min-h-screen bg-charcoal-black text-white px-6 py-[120px]">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-5xl md:text-6xl uppercase tracking-[0.6em] mb-8">Broker–Carrier Agreement</h1>
        <p className="font-sans text-sm uppercase tracking-[0.4em] mb-12 text-white/80">
          Review and sign to activate settlements.
        </p>

        {portalUrl ? (
          <div className="bg-white rounded-none p-4">
            <DocusealForm src={portalUrl} initialValues={prefill} />
          </div>
        ) : (
          <div className="border border-white/10 p-8">
            <p className="font-sans text-sm uppercase tracking-[0.4em]">Docuseal portal URL not configured.</p>
          </div>
        )}
      </div>
    </main>
  );
}
