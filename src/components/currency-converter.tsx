"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowDownUp, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useConvertCurrencyQuery,
  useGetSupportedCurrenciesQuery,
} from "store/currency/currency.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useDispatch } from "react-redux";
import { addHistoryItem } from "store/currency/currency.slice";
import gsap from "gsap";

export function CurrencyConverter() {
  const dispatch = useDispatch();
  // const [mounted, setMounted] = useState(false);
  const containerCurrencyConverterRef = useRef<HTMLDivElement>(null);
  const rateCardRef = useRef<HTMLDivElement>(null);

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("UAH");
  const [amount, setAmount] = useState("1.00");
  const [debouncedAmount, setDebouncedAmount] = useState(amount);

  // useEffect(() => {
  //   //костиль
  //   setMounted(true);
  //   dispatch({ type: "currency/hydrateHistory" });
  // }, [dispatch]);

  const {
    data: currenciesData,
    isLoading: isLoadingCurrencies,
    error: currenciesError,
  } = useGetSupportedCurrenciesQuery();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 600);
    return () => clearTimeout(timer);
  }, [amount]);

  const {
    data: convertData,
    isFetching: isConverting,
    error: convertError,
  } = useConvertCurrencyQuery(
    {
      amount: parseFloat(debouncedAmount) || 0,
      from: fromCurrency,
      to: toCurrency,
      format: "json",
    },
    { skip: !debouncedAmount || parseFloat(debouncedAmount) <= 0 }
  );

  useEffect(() => {
    if (convertData) {
      dispatch(
        addHistoryItem({
          date: new Date().toLocaleString(),
          from: convertData.base,
          to: convertData.to,
          amount: convertData.amount,
          result: convertData.result,
          rate: convertData.rate,
        })
      );
    }
  }, [convertData, dispatch]);

  useEffect(() => {
    if (containerCurrencyConverterRef.current && !isLoadingCurrencies) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".fade-up",
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2,
          }
        );
      }, containerCurrencyConverterRef);

      return () => ctx.revert();
    }
  }, [isLoadingCurrencies]);

  useEffect(() => {
    if (convertData && !isConverting && rateCardRef.current) {
      gsap.fromTo(
        rateCardRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [convertData, isConverting]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <Card className="mt-8 mx-8 border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="size-5 text-primary" />
          Convert Currency
        </CardTitle>
        <CardDescription>
          Real-time exchange rates from Unirate API
        </CardDescription>
      </CardHeader>
      <CardContent ref={containerCurrencyConverterRef}>
        {isLoadingCurrencies && !currenciesError ? (
          <div className="flex items-center gap-3 py-2 text-muted-foreground animate-pulse">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Initializing currency data...</span>
          </div>
        ) : (
          <>
            {convertError && (
              <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive fade-up">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Error occurred while converting currency
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 fade-up">
                <label className="text-sm font-semibold text-foreground/70">
                  From
                </label>
                <div className="flex gap-3">
                  <Select
                    value={fromCurrency}
                    onValueChange={setFromCurrency}
                    disabled={isLoadingCurrencies}
                  >
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCurrencies ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-3 animate-spin" />
                            Loading...
                          </div>
                        </SelectItem>
                      ) : (
                        currenciesData?.currencies.map((currency, index) => (
                          <SelectItem key={index} value={currency}>
                            <span className="font-mono font-bold mr-2">
                              {currency}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 text-lg font-medium"
                    min="0"
                    step="any"
                    disabled={isLoadingCurrencies}
                  />
                </div>
              </div>

              <div className="flex items-center justify-center -my-2 fade-up">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwap}
                  className="rounded-full shadow-md bg-background hover:bg-primary/10 hover:text-primary cursor-pointer"
                  disabled={isLoadingCurrencies}
                >
                  <ArrowDownUp className="size-4" />
                  <span className="sr-only">Swap</span>
                </Button>
              </div>

              <div className="flex flex-col gap-2 fade-up">
                <label className="text-sm font-semibold text-foreground/70">
                  To
                </label>
                <div className="flex gap-3">
                  <Select
                    value={toCurrency}
                    onValueChange={setToCurrency}
                    disabled={isLoadingCurrencies}
                  >
                    <SelectTrigger className="w-40 bg-background">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCurrencies ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        currenciesData?.currencies.map((currency, index) => (
                          <SelectItem key={index} value={currency}>
                            <span className="font-mono font-bold mr-2">
                              {currency}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={
                        convertData?.result
                          ? convertData.result.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })
                          : "0.00"
                      }
                      readOnly
                      className="flex-1 bg-muted/30 text-lg font-bold pr-10"
                    />
                    {isConverting && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-primary" />
                    )}
                  </div>
                </div>
              </div>

              {convertData && !isConverting && (
                <div
                  ref={rateCardRef}
                  className="rounded-xl border bg-gradient-to-r from-primary/5 to-transparent px-6 py-4 shadow-sm border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Current Exchange Rate
                      </p>
                      <p className="text-xl font-bold mt-1">
                        1 {convertData.base} ={" "}
                        <span className="text-primary">
                          {convertData.rate.toFixed(6)}
                        </span>{" "}
                        {convertData.to}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="text-xs font-mono">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
