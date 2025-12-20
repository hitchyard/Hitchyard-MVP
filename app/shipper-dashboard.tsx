import React from 'react';
// Assuming the colors defined in tailwind.config.js are available:
// 'surface': '#FFFFFF', 'surface-secondary': '#F8F8F8'
// 'hitchyard-charcoal': '#1A1D21', 'hitchyard-green': '#0B1F1A'
// 'text-primary': '#1A1D21', 'text-secondary': '#4B5563'

const ShipperDashboard: React.FC = () => {

  // --- Component for a small, functional Data Card (A&F style applied to data)
  const DataCard: React.FC<{ title: string; value: string; color: 'charcoal' | 'green' }> = ({ title, value, color }) => {
    const primaryColor = color === 'charcoal' ? 'text-hitchyard-charcoal' : 'text-hitchyard-green';
    
    return (
      <div className="p-6 bg-surface border border-gray-200 rounded-none">
        {/* Cinzel Bold for the large, declarative data point */}
        <p className={`text-4xl font-cinzel-bold ${primaryColor} mb-2`}>
          {value}
        </p>
        {/* League Spartan for the UI label */}
        <h4 className="text-sm font-league-spartan uppercase tracking-wider text-text-secondary">
          {title}
        </h4>
      </div>
    );
  };

  // --- Main Dashboard Layout
  return (
    // Primary Page Background: Pure White (surface)
    <div className="min-h-screen flex bg-surface-secondary"> 
      
      {/* 1. Sidebar - Uses a subtle secondary surface for visual break */}
      <aside className="w-64 bg-surface-secondary p-6 border-r border-gray-100">
        <nav>
          {['Dashboard', 'Load Contracts', 'Payments & Finance', 'Carrier Vetting', 'Compliance'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
              // Active link uses the Authority color (Charcoal Black) on a light surface
              className={`block py-3 px-4 rounded-none font-league-spartan text-sm tracking-wide transition-colors mb-2 
                          ${item === 'Load Contracts' 
                            ? 'bg-hitchyard-charcoal text-white font-bold' 
                            : 'text-text-primary hover:bg-gray-100'}`}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* 2. Main Content Area - Primary Background: Pure White (surface) */}
      <main className="flex-1 bg-surface">
        
        {/* Top Bar - Simple, clean, high-contrast logo and profile */}
        <header className="p-6 border-b border-gray-100 flex justify-between items-center">
          {/* Logo: text-hitchyard-charcoal for Authority on light background */}
          <h1 className="text-xl font-cinzel-bold tracking-widest text-hitchyard-charcoal">
            HITCHYARD.
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-text-primary font-league-spartan text-sm">Welcome, Executive Shipper</span>
            <div className="w-10 h-10 rounded-none bg-hitchyard-charcoal"></div>
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <div className="p-8">
          {/* Main Section Header: Cinzel Bold for the declarative statement */}
          <h2 className="text-4xl font-cinzel-bold text-text-primary mb-12 uppercase">
            Shipper Overview
          </h2>

          {/* Data Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <DataCard 
              title="Loads in Progress" 
              value="14" 
              color="charcoal" // Charcoal for "Screens showing loads/contracts"
            />
            <DataCard 
              title="Verified Carriers" 
              value="97%" 
              color="green" // Green for "Verification"
            />
            <DataCard 
              title="Pending Payment" 
              value="$12,500" 
              color="green" // Green for "Finance, payments, and compliance screens"
            />
            <DataCard 
              title="Average Rate" 
              value="$2.45/mi" 
              color="charcoal" // Charcoal for "Screens showing deals, loads, contracts"
            />
          </div>

          {/* Authority Section: Current Contracts (Use Charcoal for focus) */}
          <section className="mb-12">
            {/* Section Header: Cinzel Bold */}
            <h3 className="text-2xl font-cinzel-bold text-text-primary mb-6 uppercase">
              Current Load Contracts
            </h3>
            <div className="bg-white border border-gray-200 rounded-none  p-6">
              <p className="text-sm text-text-secondary font-league-spartan mb-4">
                This table represents the system of record for all active contracts.
              </p>
              {/* Table Mockup (Using Authority Color) */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-surface-secondary">
                    <tr>
                      {['Contract ID', 'Origin', 'Status', 'Rate', 'Action'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-league-spartan text-hitchyard-charcoal uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100 text-text-primary font-league-spartan">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">HY-10482</td>
                      <td className="px-6 py-4 whitespace-nowrap">Chicago, IL</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-none bg-hitchyard-charcoal text-white">
                          EN ROUTE
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">$4,200</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-sm text-hitchyard-charcoal hover:underline">View Details</button>
                      </td>
                    </tr>
                    {/* ... more rows ... */}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Trust Section: Payment & Verification (Use Green for focus) */}
          <section className="mb-12">
            {/* Section Header: Cinzel Bold */}
            <h3 className="text-2xl font-cinzel-bold text-text-primary mb-6 uppercase">
              Financial and Compliance
            </h3>
            
            <div className="bg-white border border-gray-200 rounded-none  p-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <svg className="w-8 h-8 text-hitchyard-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {/* Iconography should be Minimal, Geometric, Thin Strokes */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.275a1.996 1.996 0 11-2.828 2.828L10 16.142 5.207 11.35a1.996 1.996 0 112.828-2.828l1.379 1.379 3.65-3.65a1.996 1.996 0 012.828 0z"></path>
                </svg>
                <div>
                  <p className="text-lg font-league-spartan font-bold text-hitchyard-green">
                    Payment Status: CLEARED
                  </p>
                  <p className="text-sm text-text-secondary font-league-spartan">
                    All financial and compliance checks are up to date.
                  </p>
                </div>
              </div>

              {/* Primary CTA Button: Uses the Trust/Financial Green color */}
              <button className="px-6 py-3 bg-hitchyard-green text-white font-bold font-league-spartan uppercase tracking-wider 
                                 hover:bg-hitchyard-charcoal transition-colors duration-300 rounded-none ">
                View Predictive Analytics
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ShipperDashboard;
