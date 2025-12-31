/**
 * Haversine formula to calculate great-circle distance between two coordinates
 * @param lat1 Latitude of point 1 (in degrees)
 * @param lon1 Longitude of point 1 (in degrees)
 * @param lat2 Latitude of point 2 (in degrees)
 * @param lon2 Longitude of point 2 (in degrees)
 * @returns Distance in miles
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Demonstration ZIP code to coordinates map
 * In production, this should use a real ZIP code API service
 */
const zipCodeMap: Record<string, { lat: number; lon: number }> = {
  "84101": { lat: 40.7608, lon: -111.891 }, // Salt Lake City, UT
  "84102": { lat: 40.748, lon: -111.876 },
  "84103": { lat: 40.733, lon: -111.867 },
  "84104": { lat: 40.722, lon: -111.901 },
  "90210": { lat: 34.0901, lon: -118.4065 }, // Beverly Hills, CA
  "10001": { lat: 40.7506, lon: -73.9972 }, // New York, NY
  "60601": { lat: 41.8773, lon: -87.6217 }, // Chicago, IL
  "75201": { lat: 32.7767, lon: -96.797 }, // Dallas, TX
  "98101": { lat: 47.6052, lon: -122.3324 }, // Seattle, WA
};

const GRIT_CLUB_ANCHOR_ZIP = "84101";
const TARGET_RADIUS_MILES = 250;

interface OperatingIdentifiers {
  dotNumber?: string;
  stateOperatingId?: string;
}

/**
 * Check if a load's origin or destination is within 250 miles of Salt Lake City (84101)
 * This identifies "Sweet Spot" loads - REGISTERED RADIUS loads
 * @param originZip Load origin ZIP code
 * @param destZip Load destination ZIP code
// ...existing code...
 */
export function isInSweetSpot(originZip: string, destZip: string): boolean {
  try {
    // SLC logic removed

    const originCoords = zipCodeMap[originZip?.trim()];
    const destCoords = zipCodeMap[destZip?.trim()];

    if (originCoords) {
      const originDistance = haversineDistance(
        originCoords.lat,
        originCoords.lon,
        // SLC logic removed
      );
      if (originDistance <= TARGET_RADIUS_MILES) return true;
    }

    if (destCoords) {
      const destDistance = haversineDistance(
        destCoords.lat,
        destCoords.lon,
        // SLC logic removed
      );
      if (destDistance <= TARGET_RADIUS_MILES) return true;
    }

    return false;
  } catch (err) {
    console.error("Error checking sweet spot:", err);
    return false;
  }
}

/**
 * Check if a user's ZIP code is within 250 miles of the anchor ZIP (84101)
 * and verify they have a DOT number or a state operating ID.
 * @param userZip The user's ZIP code
 * @param ids Optional operating identifiers (DOT or state ID)
 * @returns true if within 250 miles and at least one ID is present, false otherwise
 */
export async function checkDistance(
  userZip: string,
  ids?: OperatingIdentifiers
): Promise<boolean> {
  try {
    const anchorCoordinates = zipCodeMap[GRIT_CLUB_ANCHOR_ZIP];

    if (!anchorCoordinates) {
      console.warn(`Anchor ZIP ${GRIT_CLUB_ANCHOR_ZIP} not found in lookup map`);
      return false;
    }

    // Look up coordinates for the user's ZIP code
    const userCoordinates = zipCodeMap[userZip.trim()];

    if (!userCoordinates) {
      // If ZIP code not found in demo map, log warning and return false
      console.warn(`ZIP code ${userZip} not found in lookup map`);
      return false;
    }

    // Calculate distance using Haversine formula
    const distance = haversineDistance(
      userCoordinates.lat,
      userCoordinates.lon,
      anchorCoordinates.lat,
      anchorCoordinates.lon
    );

    const isWithinRadius = distance <= TARGET_RADIUS_MILES;

    const hasOperatingId = Boolean(
      ids?.dotNumber?.trim() || ids?.stateOperatingId?.trim()
    );

    console.log(
      `Distance from ZIP ${userZip} to ${GRIT_CLUB_ANCHOR_ZIP}: ${distance.toFixed(
        2
      )} miles. Within ${TARGET_RADIUS_MILES} mile radius: ${isWithinRadius}. Operating ID present: ${hasOperatingId}`
    );

    return isWithinRadius && hasOperatingId;
  } catch (err) {
    console.error("Error checking distance:", (err as Error)?.message ?? String(err));
    return false;
  }
}
