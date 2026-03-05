import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AllSupportedCurrenciesResponse,
  CurrencyConvertRequest,
  CurrencyConvertResponse,
} from "./currency.type";
export const currencyApi = createApi({
  reducerPath: "currencyApi",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),

  endpoints: (builder) => ({
    getSupportedCurrencies: builder.query<AllSupportedCurrenciesResponse, void>({
      query: () => ({
        url: `/currencies?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
        method: "GET",
      }),
    }),
    convertCurrency: builder.query<
      CurrencyConvertResponse,
      CurrencyConvertRequest
    >({
      query: ({ amount, from, to, format = "json" }) => ({
        url: `/rates?api_key=${process.env.NEXT_PUBLIC_API_KEY}`,
        params: {
          amount,
          from,
          to,
          format,
        },
        method: "GET",
      }),
    }),
  }),
});

export const { useGetSupportedCurrenciesQuery, useConvertCurrencyQuery } =
  currencyApi;
