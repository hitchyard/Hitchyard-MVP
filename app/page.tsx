// src/app/RoleSelect.tsx - REVISED FOR ABERCROMBIE STYLE

"use client";

// Assuming you still need to select a role, but the style is now bright/lifestyle
export default function RoleSelect() {
  const handleRoleSelect = (role: string) => {
    console.log(`Role Selected: ${role}`);
    // Add navigation logic here
  };

  // Switch to a bright background with dark text
  return (
    <div className="bg-white min-h-screen text-gray-900">
      
      {/* 1. E-COMMERCE STYLE HEADER - Wide and bright */}
      <header className="py-4 px-6 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            HITCHYARD (A&F Style Logo Placeholder)
          </h1>
          {/* Placeholder for navigation links, cart, search icon */}
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
             <a href="#" className="hover:underline">Loads</a>
             <a href="#" className="hover:underline">About</a>
             <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      {/* 2. MAIN CONTENT - Wide, top-aligned content */}
      <div className="max-w-7xl mx-auto p-8">
        
        {/* LIFESTYLE IMAGE / CALLOUT AREA */}
        <div className="w-full h-80 bg-gray-100 mb-12 flex items-center justify-center border border-gray-300">
            {/* THIS IS WHERE YOU ADD A LARGE, LIFESTYLE-FOCUSED PHOTO (Trucks, Roads, People) */}
            <h2 className="text-3xl font-light text-gray-600">
                [Large, Bright Lifestyle Photo Placeholder Here]
            </h2>
        </div>

        {/* ROLE SELECTION BLOCK - Simple, centered below the photo */}
        <div className="max-w-md mx-auto">
             <h3 className="text-2xl font-semibold mb-6 text-center">
                Access Hitchyard Network
             </h3>
             <div className="space-y-4">
               {/* Shipper Button - Bright, less priority */}
               <button
                 onClick={() => handleRoleSelect('Shipper')}
                 className="w-full text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 transition py-4 px-6 font-semibold shadow-sm"
               >
                 LOGISTICS PARTNER SIGN-UP
               </button>

               {/* Carrier Button - High contrast, primary action */}
               <button
                 onClick={() => handleRoleSelect('Carrier')}
                 // The primary button should be dark and bold in this style
                 className="w-full text-white bg-black hover:bg-gray-800 transition py-4 px-6 font-semibold shadow-md"
               >
                 VERIFIED CARRIER APPLICATION
               </button>
             </div>
        </div>
      </div>
    </div>
  );
}