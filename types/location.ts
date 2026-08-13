export type QuarryByAddressData = {
  quarry?: {
    id?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    distancekm?: number;
    [key: string]: unknown;
  } | null;
  quarries?: Array<{
    id?: string;
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    distancekm?: number;
    [key: string]: unknown;
  }>;
  confidence?: string;
  level?: string;
  accuracy_radius_km?: number;
  search_location?: {
    latitude?: number;
    longitude?: number;
    formatted_address?: string;
  } | null;
  message?: string;
  [key: string]: unknown;
};






export type GoogleTextMatch = {
  endOffset?: number;
  startOffset?: number;
};

export type GoogleFormattableText = {
  text?: string;
  matches?: GoogleTextMatch[];
};

export type GoogleStructuredFormat = {
  mainText?: GoogleFormattableText;
  secondaryText?: GoogleFormattableText;
};

export type GooglePlacePrediction = {
  placeId?: string;
  place?: string;
  text?: GoogleFormattableText;
  structuredFormat?: GoogleStructuredFormat;
  types?: string[];
  distanceMeters?: number;
};

export type GoogleQueryPrediction = {
  text?: GoogleFormattableText;
};

export type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: GooglePlacePrediction;
    queryPrediction?: GoogleQueryPrediction;
  }>;
};

export type GooglePlaceSuggestionBase = {
  displayText: string;
};

export type GooglePlacePredictionSuggestion = GooglePlaceSuggestionBase & {
  placeId: string;
  suggestionType: 'place';
  mainText?: string;
  secondaryText?: string;
  distanceMeters?: number;
};

export type GoogleQuerySuggestion = GooglePlaceSuggestionBase & {
  placeId: string;
  suggestionType: 'query';
};

export type GooglePlaceSuggestion = GooglePlacePredictionSuggestion | GoogleQuerySuggestion;

export type GoogleAutocompleteRequest = {
  input: string;
  languageCode?: string;
  regionCode?: string;
  includeQueryPredictions?: boolean;
  sessionToken?: string;
  origin?: {
    latitude: number;
    longitude: number;
  };
};

export type GoogleGeocodeResponse = {
  status?: string;
  results?: Array<{
    formatted_address?: string;
    place_id?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  error_message?: string;
};

export type GoogleGeocodeResult = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId?: string;
};

export type LoadingPointResponse = {
  loadingpoints: LoadingPoint[];
  states: string[];
  total: number;
}


export type PickupAddressSuggestion = {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  pickupLocationId?: string;
  distancekm?: number;
};

export type SelectedPickupAddress = {
  title?: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  pickupLocationId?: string;
  distancekm?: number;
};
export type LoadingPoint = {
  id: string;
  name: string;
  address: string;

  latitude: string;
  longitude: string;

  description?: string;
  state?: string;
  lga?: string;
};

export type SavedPickupAddress = {
  id: string;

  label: string;
  formattedaddress: string;

  latitude: number;
  longitude: number;

  contactperson: string;
  contactphone: string;
};

export type PickupOption = {
    id: string;

    type: "loading_point" | "saved_address" | "google";

    title: string;

    address: string;

    latitude?: number;

    longitude?: number;

    pickupLocationId?: string;

    contactPerson?: string;

    contactPhone?: string;
};