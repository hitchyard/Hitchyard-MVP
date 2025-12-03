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

/**
 * Check if a user's ZIP code is within 250 miles of Salt Lake City
 * @param userZip The user's ZIP code
 * @returns true if within 250 miles, false otherwise
 */
export async function checkDistance(userZip: string): Promise<boolean> {
  try {
    // Salt Lake City target coordinates (ZIP 84101)
    const saltLakeCityLat = 40.7608;
    const saltLakeCityLon = -111.891;
    const targetRadiusMiles = 250;

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
      saltLakeCityLat,
      saltLakeCityLon
    );

    // Return true if distance is within target radius
    const isWithinRadius = distance <= targetRadiusMiles;

    console.log(
      `Distance from ZIP ${userZip} to Salt Lake City: ${distance.toFixed(
        2
      )} miles. Within ${targetRadiusMiles} mile radius: ${isWithinRadius}`
    );

    return isWithinRadius;
  } catch (err) {
    console.error("Error checking distance:", (err as Error)?.message ?? String(err));
    return false;
  }
}
