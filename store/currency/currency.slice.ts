import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencyHistoryItem } from "./currency.type";

interface CurrencyState {
  currencies: string[];
  history: CurrencyHistoryItem[];
  loading: boolean;
  error: string | null;
  isHydrated: boolean;
}

const loadHistory = (): CurrencyHistoryItem[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("currency_history");
  return data ? JSON.parse(data) : [];
};

const saveHistory = (history: CurrencyHistoryItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("currency_history", JSON.stringify(history));
};

const initialState: CurrencyState = {
  currencies: [],
  history: loadHistory(),
  loading: false,
  error: null,
  isHydrated: false,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrencies(state, action: PayloadAction<string[]>) {
      state.currencies = action.payload;
    },

    addHistoryItem(state, action: PayloadAction<CurrencyHistoryItem>) {
      state.history.unshift(action.payload);

      if (state.history.length > 10) {
        state.history.pop();
      }

      saveHistory(state.history);
    },

    clearHistory(state) {
      state.history = [];
      saveHistory([]);
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    // hydrateHistory(state) {
    //   if (typeof window !== "undefined") {
    //     const data = localStorage.getItem("currency_history");
    //     if (data) {
    //       try {
    //         state.history = JSON.parse(data);
    //       } catch (e) {
    //         state.history = [];
    //       }
    //     }
    //     state.isHydrated = true;
    //   }
    // },
  },
});

export const {
  setCurrencies,
  addHistoryItem,
  clearHistory,
  setLoading,
  setError,
} = currencySlice.actions;

export default currencySlice.reducer;
