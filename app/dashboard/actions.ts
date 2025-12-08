"use server";

import { acceptBidAction as acceptBidInternal } from "../loads/acceptBidAction";

interface AcceptBidState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function acceptBidAction(
  _prevState: AcceptBidState,
  formData: FormData
): Promise<AcceptBidState> {
  const load_id = formData.get("load_id")?.toString() ?? "";
  const bid_id = formData.get("bid_id")?.toString() ?? "";

  if (!load_id || !bid_id) {
    return {
      success: false,
      error: "Missing load or bid identifier",
    };
  }

  const result = await acceptBidInternal({ load_id, bid_id });

  if (result.error) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    message: result.message ?? "Bid accepted and load assigned",
  };
}
