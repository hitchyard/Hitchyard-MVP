// =================================================================
// SECURE SERVER ACTION: FETCH CARRIER HISTORY
// =================================================================
// Purpose: Provide Dify Matchmaking Agent with secure access to carrier performance data
// Called by: Dify HTTP Request Node in the Matchmaking Workflow
// Security: Authenticated server-side only, validates session before database access

"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Carrier Performance Data Structure
 * Used for Trust Score calculation in Matchmaking Agent
 */
interface CarrierPerformance {
  carrier_id: string;
  load_completion_rate: number; // 0.0 to 1.0 (100%)
  average_payment_delay_days: number; // Days past due
  total_loads_completed: number;
  total_loads_failed: number;
  last_updated: string;
}

/**
 * fetchCarrierHistory - Secure carrier performance retrieval
 * 
 * @param carrierId - UUID of the carrier to retrieve history for
 * @returns CarrierPerformance data or error object
 * 
 * Security Features:
 * - Server-side only execution (cannot be called from client)
 * - Supabase session validation before database access
 * - Row Level Security policies enforced on database queries
 * - No exposure of internal database structure to client
 */
export async function fetchCarrierHistory(carrierId: string): Promise<{
  success: boolean;
  data?: CarrierPerformance;
  error?: string;
}> {
  try {
    // =================================================================
    // STEP 1: VALIDATE INPUT
    // =================================================================
    if (!carrierId || typeof carrierId !== "string") {
      return {
        success: false,
        error: "Invalid carrier ID provided",
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
    // STEP 3: VERIFY USER ROLE (Only shippers can access carrier history)
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

    // Only shippers should access carrier history for matchmaking
    if (profile.role !== "shipper") {
      return {
        success: false,
        error: "Forbidden: Only shippers can access carrier history",
      };
    }

    // =================================================================
    // STEP 4: QUERY CARRIER PERFORMANCE DATA
    // =================================================================
    // Note: RLS policies on 'carrier_performance' table ensure data access is controlled
    const { data: performanceData, error: queryError } = await supabase
      .from("carrier_performance")
      .select(
        `
        carrier_id,
        load_completion_rate,
        average_payment_delay_days,
        total_loads_completed,
        total_loads_failed,
        last_updated
      `
      )
      .eq("carrier_id", carrierId)
      .single();

    if (queryError) {
      // Handle case where carrier has no performance history yet
      if (queryError.code === "PGRST116") {
        return {
          success: true,
          data: {
            carrier_id: carrierId,
            load_completion_rate: 0.0,
            average_payment_delay_days: 0,
            total_loads_completed: 0,
            total_loads_failed: 0,
            last_updated: new Date().toISOString(),
          },
        };
      }

      console.error("Database query error:", queryError);
      return {
        success: false,
        error: "Failed to retrieve carrier performance data",
      };
    }

    // =================================================================
    // STEP 5: RETURN VALIDATED PERFORMANCE DATA
    // =================================================================
    return {
      success: true,
      data: performanceData as CarrierPerformance,
    };
  } catch (error) {
    console.error("Unexpected error in fetchCarrierHistory:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

/**
 * USAGE EXAMPLE (from Dify HTTP Request Node):
 * 
 * POST https://your-domain.com/api/carrier-history
 * 
 * Body:
 * {
 *   "carrierId": "uuid-here"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "carrier_id": "uuid",
 *     "load_completion_rate": 0.95,
 *     "average_payment_delay_days": 2.3,
 *     "total_loads_completed": 47,
 *     "total_loads_failed": 2,
 *     "last_updated": "2025-12-16T10:00:00Z"
 *   }
 * }
 */
