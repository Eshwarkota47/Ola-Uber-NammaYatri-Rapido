import https from "https";

export interface PlaceSuggestionResult {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
  lat?: number;
  lng?: number;
}

export interface PlaceDetailsResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "RideAggregatorApp/1.0" } }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (err) => reject(err));
  });
}

/**
 * Google Places Autocomplete API Endpoint
 * Restricts suggestions to Bengaluru, India region (location bias 12.9716, 77.5946, 50km radius)
 */
export async function googlePlacesAutocomplete(
  query: string,
  apiKey: string
): Promise<PlaceSuggestionResult[]> {
  if (!query || query.trim().length === 0) return [];

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedQuery}&components=country:in&location=12.9716,77.5946&radius=50000&key=${apiKey}`;

  try {
    const json: any = await fetchJson(url);
    if (json.status === "OK" && Array.isArray(json.predictions)) {
      return json.predictions.map((p: any) => ({
        placeId: p.place_id,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || "Bengaluru, Karnataka",
        fullText: p.description,
      }));
    } else if (json.status === "ZERO_RESULTS") {
      return [];
    } else {
      console.warn("Google Places Autocomplete status:", json.status, json.error_message);
    }
  } catch (err) {
    console.error("Google Places Autocomplete HTTP error:", err);
  }
  return [];
}

/**
 * Google Place Details API Endpoint — Retrieves lat & lng for selected place_id
 */
export async function googlePlaceDetails(
  placeId: string,
  apiKey: string
): Promise<PlaceDetailsResult | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry&key=${apiKey}`;

  try {
    const json: any = await fetchJson(url);
    if (json.status === "OK" && json.result?.geometry?.location) {
      return {
        placeId: json.result.place_id,
        name: json.result.name,
        formattedAddress: json.result.formatted_address,
        lat: json.result.geometry.location.lat,
        lng: json.result.geometry.location.lng,
      };
    } else {
      console.warn("Google Place Details status:", json.status, json.error_message);
    }
  } catch (err) {
    console.error("Google Place Details HTTP error:", err);
  }
  return null;
}

/**
 * Google Directions API — Retrieves exact driving distance and traffic duration
 */
export async function googleDirectionsMatrix(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  apiKey: string
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&departure_time=now&avoid=tolls&key=${apiKey}`;

  try {
    const json: any = await fetchJson(directionsUrl);
    if (json.status === "OK" && json.routes?.[0]?.legs?.[0]) {
      const leg = json.routes[0].legs[0];
      const distanceKm = Math.round((leg.distance.value / 1000) * 10) / 10;
      const durationSeconds = leg.duration_in_traffic?.value || leg.duration.value;
      const durationMin = Math.max(3, Math.round(durationSeconds / 60));
      return { distanceKm, durationMin };
    } else {
      console.warn("Google Directions API status:", json.status, json.error_message);
    }
  } catch (err) {
    console.error("Google Directions API HTTP error:", err);
  }

  return null;
}
