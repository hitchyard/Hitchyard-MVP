import React, { useEffect, useState } from 'react';
import { getMatchmakingStatus } from '@/app/actions/vetting';

interface MatchmakingSectionProps {
  carrierId: string;
}

export default function MatchmakingSection({ carrierId }: MatchmakingSectionProps) {
  const [status, setStatus] = useState('PENDING');
  const [lanes, setLanes] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMatchmaking() {
      setLoading(true);
      try {
        const result = await getMatchmakingStatus(carrierId);
        setStatus(result.allocationStatus);
        setLanes(result.recommendedLanes);
        setReason(result.reason);
      } catch {
        setStatus('ERROR');
        setReason('SYSTEM ERROR');
      } finally {
        setLoading(false);
      }
    }
    fetchMatchmaking();
  }, [carrierId]);

  return (
    <section className="w-full flex flex-col items-center justify-center bg-[#1A1D21] py-[200px] px-6" style={{ borderRadius: 0 }}>
      <h2 className="font-cinzel font-bold uppercase text-3xl md:text-4xl tracking-[0.6em] text-white mb-10 text-center" style={{ letterSpacing: '0.6em' }}>
        PROTOCOL: OPTIMIZING CARRIER ALLOCATION
      </h2>
      {loading ? (
        <span className="font-spartan text-base text-gray-300 mt-6 tracking-widest">Loading matchmaking status...</span>
      ) : (
        <>
          <span className="font-spartan text-base text-green-300 mb-6 tracking-widest">{status}</span>
          {lanes.length > 0 && (
            <div className="mt-8 w-full max-w-xl mx-auto">
              <h3 className="font-cinzel font-bold uppercase text-lg tracking-[0.4em] text-white mb-4" style={{ letterSpacing: '0.4em' }}>
                Recommended Lanes
              </h3>
              <ul className="space-y-3">
                {lanes.map((lane, idx) => (
                  <li key={idx} className="font-spartan text-base text-gray-200 bg-[#23272A] px-6 py-4 rounded-none" style={{ borderRadius: 0 }}>
                    {lane}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <span className="font-spartan text-base text-gray-400 mt-8 tracking-widest">{reason}</span>
        </>
      )}
    </section>
  );
}
