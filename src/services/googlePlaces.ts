import {
    GoogleAutocompleteRequest,
    GoogleAutocompleteResponse,
    GoogleGeocodeResponse,
    GoogleGeocodeResult,
    GooglePlaceSuggestion,
} from '@/types/location';


const GOOGLE_PLACES_BASE_URL = 'https://places.googleapis.com/v1';

export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;



const googleRequest = async <T>(path: string, payload: Record<string, unknown>) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is missing.');
  }

  const response = await fetch(`${GOOGLE_PLACES_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  const parsed = raw ? JSON.parse(raw) : {};

  if (!response.ok) {
    throw new Error(parsed?.error?.message || parsed?.message || 'Google request failed.');
  }

  return parsed as T;
};

const mapAutocompleteResponse = (response: GoogleAutocompleteResponse): GooglePlaceSuggestion[] => {
  const suggestions = response.suggestions ?? [];

  return suggestions
    .map((item) => {
      if (item.placePrediction) {
        const place = item.placePrediction;
        const text = place.text?.text ?? '';
        const mainText = place.structuredFormat?.mainText?.text;
        const secondaryText = place.structuredFormat?.secondaryText?.text;

        if (!place.placeId || !text) return null;

        return {
          placeId: place.placeId,
          displayText: text,
          mainText,
          secondaryText,
          distanceMeters: place.distanceMeters,
          suggestionType: 'place' as const,
        };
      }

      if (item.queryPrediction) {
        const text = item.queryPrediction.text?.text ?? '';
        if (!text) return null;

        return {
          placeId: '',
          displayText: text,
          suggestionType: 'query' as const,
        };
      }

      return null;
    })
    .filter((item): item is GooglePlaceSuggestion => item !== null);
};

export const googlePlacesApi = {
  autocomplete: async (payload: GoogleAutocompleteRequest) => {
    const response = await googleRequest<GoogleAutocompleteResponse>('/places:autocomplete', payload);
    return mapAutocompleteResponse(response);
  },
  geocodeAddress: async (address: string): Promise<GoogleGeocodeResult | null> => {
    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is missing.');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const raw = await response.text();
    const parsed = raw ? (JSON.parse(raw) as GoogleGeocodeResponse) : {};

    if (!response.ok) {
      throw new Error(parsed.error_message || 'Google geocoding failed.');
    }

    const first = parsed.results?.[0];
    const lat = first?.geometry?.location?.lat;
    const lng = first?.geometry?.location?.lng;
    const formattedAddress = first?.formatted_address;

    if (
      parsed.status !== 'OK' ||
      lat == null ||
      lng == null ||
      !formattedAddress
    ) {
      return null;
    }

    return {
      formattedAddress,
      latitude: Number(lat),
      longitude: Number(lng),
      placeId: first?.place_id,
    };
  },
};
