// HITCHYARD LOGIN - RULER ARCHETYPE
// Authoritative Authentication Gateway

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  
  // Create Supabase browser client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Authenticate user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch user role from user_profiles
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", authData.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // Fallback to generic dashboard
          router.push("/dashboard");
          router.refresh();
          return;
        }

        // Role-based redirect
        const role = profileData?.role;
        if (role === "carrier") {
          router.push("/carrier-dashboard");
        } else if (role === "shipper") {
          router.push("/shipper-dashboard");
        } else {
          router.push("/dashboard");
        }
        
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-black flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Shield className="w-16 h-16 text-deep-forest-green" />
          </div>
          <h1 className="text-5xl font-serif font-extrabold uppercase tracking-tight text-white mb-4">
            HITCHYARD
          </h1>
          <p className="text-lg font-sans text-white/70">
            Enterprise Logistics Platform
          </p>
        </div>

        {/* LOGIN FORM */}
        <div className="bg-white/5 border border-white/10 rounded-none p-8">
          <h2 className="text-2xl font-serif font-bold uppercase text-white mb-6 text-center">
            SECURE ACCESS
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-sans font-medium text-white/80 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-charcoal-black border border-white/20 rounded-none text-white font-sans focus:outline-none focus:border-deep-forest-green transition"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-sans font-medium text-white/80 mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-charcoal-black border border-white/20 rounded-none text-white font-sans focus:outline-none focus:border-deep-forest-green transition"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-none p-3">
                <p className="text-sm font-sans text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button - Charcoal Black (#1A1D21) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-charcoal-black text-white font-sans font-semibold text-lg py-4 px-8 hover:bg-deep-forest-green transition-all duration-300 uppercase tracking-wide border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-sans text-white/60">
              Need access?{" "}
              <a href="/signup" className="text-deep-forest-green hover:underline font-semibold">
                Apply for verification
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
