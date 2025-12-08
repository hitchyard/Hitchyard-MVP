import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-charcoal-black flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        
        {/* Header and Branding */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold font-spartan text-white">Hitchyard</h1>
          <p className="text-lg text-gray-300 mt-3">
            Local freight marketplace that connects businesses with verified independent box-truck carriers for short-haul deliveries within 250 miles of the Salt Lake area.
          </p>
        </header>

        {/* Value Proposition & Grit Club Highlight */}
        <section className="bg-dark-gray p-10 rounded-xl shadow-2xl mb-12">
          <h2 className="text-3xl font-semibold text-deep-forest-green mb-4 text-center">
            Connect. Verify. Ship.
          </h2>
          <p className="text-gray-200 text-center max-w-2xl mx-auto">
            Join the **Grit Club**—our invite-only network of high-trust carriers and shippers—to ensure secure load matching and reliable, predictable service in the regional short-haul market.
          </p>
        </section>

        {/* Call-to-Action Buttons */}
        <div className="flex justify-center space-x-6">
          
          {/* Sign In Button */}
          <Link href="/login" passHref>
            <button className="px-8 py-3 bg-white text-charcoal-black font-semibold rounded-lg shadow-md hover:bg-gray-200 transition duration-300 transform hover:scale-105">
              Sign In
            </button>
          </Link>

          {/* Sign Up Button (Primary Action) */}
          <Link href="/signup" passHref>
            <button className="px-8 py-3 bg-deep-forest-green text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 transform hover:scale-105">
              Get Started (Sign Up)
            </button>
          </Link>
          
        </div>
        
        {/* Footer Note */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          &copy; 2025 Hitchyard. Built on Trust.
        </footer>
      </div>
    </main>
  );
}