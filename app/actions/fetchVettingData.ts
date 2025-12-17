// =================================================================
// SECURE SERVER ACTION: FETCH VETTING DATA
// =================================================================
// Purpose: Provide Dify Vetting Agent with secure access to carrier performance data
// Called by: Dify HTTP Request Node in the Vetting Agent workflow
// Security: Authenticated server-side only, validates session before database access

"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * User Performance Data Structure
 * Used for Trust Score calculation in Vetting Agent
 */
interface UserPerformanceData {
  user_id: string;
  load_completion_rate: number; // 0.0 to 1.0 (100%)
  average_payment_delay_days: number; // Days past due
  safety_rating: "N/A" | "Satisfactory" | "Conditional" | "Unsatisfactory";
  total_loads_completed: number;
  insurance_verified: boolean;
  mc_number_verified: boolean;
  dot_number: string | null;
  years_in_business: number;
  last_updated: string;
}

/**
 * fetchVettingData - Secure carrier vetting data retrieval
 * 
 * @param userId - UUID of the user being vetted
 * @returns UserPerformanceData or error object
 * 
 * Security Features:
 * - Server-side only execution (cannot be called from client)
 * - Supabase session validation before database access
 * - Role verification (admin/shipper can vet carriers)
 * - Row Level Security policies enforced on database queries
 * - No exposure of internal database structure to client
 */
export async function fetchVettingData(userId: string): Promise<{
  success: boolean;
  data?: UserPerformanceData;
  error?: string;
}> {
  try {
    // =================================================================
    // STEP 1: VALIDATE INPUT
    // =================================================================
    if (!userId || typeof userId !== "string") {
      return {
        success: false,
        error: "Invalid user ID provided",
      };
    }

    // =================================================================
    // STEP 2: AUTHENTICATE USER (Server-Side Session Check)
    // =================================================================
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Cookie setting can fail in Server Components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Cookie removal can fail in Server Components
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized: Invalid or missing session",
      };
    }

    // =================================================================
    // STEP 3: VERIFY USER ROLE (Admin or Shipper can vet carriers)
    // =================================================================
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "User profile not found",
      };
    }

    // Only admins and shippers can access vetting data
    if (profile.role !== "admin" && profile.role !== "shipper") {
      return {
        success: false,
        error: "Forbidden: Insufficient permissions to access vetting data",
      };
    }

    // =================================================================
    // STEP 4: QUERY USER PERFORMANCE DATA
    // =================================================================
    // Note: RLS policies on 'user_performance' table ensure data access is controlled
    const { data: performanceData, error: queryError } = await supabase
      .from("user_performance")
      .select(
        `
        user_id,
        load_completion_rate,
        average_payment_delay_days,
        safety_rating,
        total_loads_completed,
        insurance_verified,
        mc_number_verified,
        dot_number,
        years_in_business,
        last_updated
      `
      )
      .eq("user_id", userId)
      .single();

    if (queryError) {
      // Handle case where user has no performance history yet (new carrier)
      if (queryError.code === "PGRST116") {
        // Return default values for new carriers
        return {
          success: true,
          data: {
            user_id: userId,
            load_completion_rate: 0.0,
            average_payment_delay_days: 0,
            safety_rating: "N/A",
            total_loads_completed: 0,
            insurance_verified: false,
            mc_number_verified: false,
            dot_number: null,
            years_in_business: 0,
            last_updated: new Date().toISOString(),
          },
        };
      }

      console.error("Database query error:", queryError);
      return {
        success: false,
        error: "Failed to retrieve vetting data",
      };
    }

    // =================================================================
    // STEP 5: VALIDATE AND ENRICH DATA
    // =================================================================
    // Ensure safety_rating is one of the expected values
    const validSafetyRatings = ["N/A", "Satisfactory", "Conditional", "Unsatisfactory"];
    const safetyRating = validSafetyRatings.includes(performanceData.safety_rating)
      ? performanceData.safety_rating
      : "N/A";

    // =================================================================
    // STEP 6: FETCH ADDITIONAL USER DETAILS (Name for context)
    // =================================================================
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("full_name, company_name")
      .eq("user_id", userId)
      .single();

    const carrierName =
      userProfile?.company_name || userProfile?.full_name || "Unknown Carrier";

    // =================================================================
    // STEP 7: RETURN VALIDATED PERFORMANCE DATA
    // =================================================================
    return {
      success: true,
      data: {
        user_id: performanceData.user_id,
        load_completion_rate: performanceData.load_completion_rate,
        average_payment_delay_days: performanceData.average_payment_delay_days,
        safety_rating: safetyRating as "N/A" | "Satisfactory" | "Conditional" | "Unsatisfactory",
        total_loads_completed: performanceData.total_loads_completed,
        insurance_verified: performanceData.insurance_verified,
        mc_number_verified: performanceData.mc_number_verified,
        dot_number: performanceData.dot_number,
        years_in_business: performanceData.years_in_business,
        last_updated: performanceData.last_updated,
      },
    };
  } catch (error) {
    console.error("Unexpected error in fetchVettingData:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

/**
 * USAGE EXAMPLE (from Dify HTTP Request Node):
 * 
 * POST https://your-domain.com/api/vetting-data
 * 
 * Headers:
 * {
 *   "Content-Type": "application/json",
 *   "Cookie": "sb-access-token=...; sb-refresh-token=..."
 * }
 * 
 * Body:
 * {
 *   "userId": "uuid-here"
 * }
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "user_id": "uuid",
 *     "load_completion_rate": 0.94,
 *     "average_payment_delay_days": 2.3,
 *     "safety_rating": "Satisfactory",
 *     "total_loads_completed": 47,
 *     "insurance_verified": true,
 *     "mc_number_verified": true,
 *     "dot_number": "1234567",
 *     "years_in_business": 5,
 *     "last_updated": "2025-12-16T10:00:00Z"
 *   }
 * }
 * 
 * Response (New Carrier):
 * {
 *   "success": true,
 *   "data": {
 *     "user_id": "uuid",
 *     "load_completion_rate": 0.0,
 *     "average_payment_delay_days": 0,
 *     "safety_rating": "N/A",
 *     "total_loads_completed": 0,
 *     "insurance_verified": false,
 *     "mc_number_verified": false,
 *     "dot_number": null,
 *     "years_in_business": 0,
 *     "last_updated": "2025-12-16T10:00:00Z"
 *   }
 * }
 * 
 * Response (Error):
 * {
 *   "success": false,
 *   "error": "Unauthorized: Invalid or missing session"
 * }
 */
