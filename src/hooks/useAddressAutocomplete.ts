import { useEffect, useState } from 'react';
import { googlePlacesApi } from '../services/googlePlaces';

type Suggestion = {
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  quarryId?: string;
  pickupLocationId?: string;
  distancekm?: number;
};

type Props = {
  token?: string;
  minLength?: number;
  enabled?: boolean;
};

export function useAddressAutocomplete({ token, minLength = 3, enabled = true }: Props) {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Suggestion | null>(null);

  // 1. debounce input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedInput(input.trim());
    }, 500);

    return () => clearTimeout(t);
  }, [input]);

  // 2. fetch suggestions
  useEffect(() => {
    let isActive = true;
    const fetch = async () => {
      if (!enabled || !token) {
        if (isActive) {
          setSuggestions([]);
          setLoading(false);
        }
        return;
      }

      if (debouncedInput.length < minLength) {
        if (isActive) setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const result = await googlePlacesApi.autocomplete({
          input: debouncedInput,
        });

        const mapped: Suggestion[] = result.map((item) => ({
          formattedAddress: item.displayText,
          placeId: item.placeId || undefined,
        }));

        const unique = mapped.filter(
          (item, idx, arr) =>
            arr.findIndex((x) => x.formattedAddress === item.formattedAddress) ===
            idx
        );

        if (isActive) setSuggestions(unique);
      } catch {
        if (isActive) setSuggestions([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetch();
    return () => {
      isActive = false;
    };
  }, [debouncedInput, token, minLength, enabled]);

  // 3. selection handler (IMPORTANT FIX)
  const select = (item: Suggestion) => {
    setSelected(item);
    setInput(item.formattedAddress);
    setSuggestions([]);
  };

  // 4. typing handler (resets selection)
  const onChange = (text: string) => {
    setSelected(null);
    setInput(text);
  };

  // 5. visibility logic (THIS fixes your pickup bug)
  const showSuggestions =
    !selected &&
    input.trim().length >= minLength &&
    suggestions.length > 0;

  return {
    input,
    setInput: onChange,

    suggestions,
    loading,

    selected,
    setSelected,

    showSuggestions,

    select,
  };
}
