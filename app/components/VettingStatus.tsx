
import React, { useEffect, useState } from 'react';
import { getVettingStatus } from '@/app/actions/vetting';

interface VettingStatusProps {
  carrierId: string;
}

export default function VettingStatus({ carrierId }: VettingStatusProps) {
  const [isVetted, setIsVetted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      try {
        const result = await getVettingStatus(carrierId);
        setIsVetted(result.isVetted);
        setReason(result.reason);
      } catch {
        setIsVetted(false);
        setReason('SYSTEM ERROR');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [carrierId]);

  return (
    <section
      className="w-full flex flex-col items-center justify-center bg-charcoal py-imperial px-6 rounded-none"
    >
      <h2
        className="font-cinzel font-bold uppercase text-3xl md:text-4xl tracking-imperial text-white mb-10 text-center"
      >
        {loading
          ? 'STATUS: VETTING IN PROGRESS'
          : isVetted
            ? ''
            : 'STATUS: UNDER REVIEW BY SYSTEM'}
      </h2>
      {isVetted && (
        <span
          className="px-8 py-4 font-spartan text-lg font-bold uppercase rounded-none bg-forest text-green-300 tracking-[0.3em]"
        >
          VERIFIED AUTHORITY
        </span>
      )}
      {!isVetted && !loading && (
        <span className="font-spartan text-base text-gray-300 mt-6 tracking-widest">
          {reason}
        </span>
      )}
    </section>
  );
}
