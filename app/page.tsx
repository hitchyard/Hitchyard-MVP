"use client";

export default function RoleSelect() {
  const handleRoleSelect = (role: string) => {
    console.log(`Role Selected: ${role}`);
    // Add navigation logic here (e.g., router.push('/signup?role=...'))
  };

  return (
    <div className="bg-[#1A1D21] min-h-screen text-white flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        {/* HITCHYARD. The System of Record. (Cinzel Bold / Ruler Archetype) */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-white uppercase [font-family:Cinzel,serif]">
            HITCHYARD. The System of Record.
          </h1>
        </header>

        {/* ESTABLISH YOUR ACCESS RIGHTS. (League Spartan style / Structured) */}
        <div className="text-center mb-12 border-t border-b border-white/10 py-6">
          <h2 className="text-xl font-semibold mb-3 tracking-wide uppercase [font-family:LeagueSpartan,sans-serif]">
            ESTABLISH YOUR ACCESS RIGHTS.
          </h2>
          <p className="text-gray-300 text-base">
            Hitchyard is the definitive operating system for enterprise logistics. Select your authorized role to proceed.
          </p>
        </div>

        {/* Role Selection Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('Shipper')}
            className="w-full text-white bg-[#1A1D21] border border-white/20 hover:bg-[#2A2D31] transition py-5 px-6 font-bold uppercase tracking-widest shadow-lg"
          >
            ENTERPRISE LOGISTICS PARTNER
            <span className="block text-xs font-normal opacity-75">(Shipper / Freight Broker)</span>
          </button>

          <button
            onClick={() => handleRoleSelect('Carrier')}
            className="w-full text-white bg-[#0B1F1A] border border-white/20 hover:bg-[#1B2F2A] transition py-5 px-6 font-bold uppercase tracking-widest shadow-lg"
          >
            VERIFIED CARRIER
            <span className="block text-xs font-normal opacity-75">(Motor Carrier / Fleet Owner)</span>
          </button>
        </div>
      </div>
    </div>
  );
}