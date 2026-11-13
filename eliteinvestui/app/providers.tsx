"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ApiCountry = "us" | "uk" | "in";

export type Country = {
  code: string;       // UI code (US, UK, IND)
  name: string;
  flag: string;
  apiCode: ApiCountry; // backend code
};

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", apiCode: "us" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧", apiCode: "uk" },
  { code: "IND", name: "India", flag: "🇮🇳", apiCode: "in" },
];

type CountryContextType = {
  country: Country;
  setCountry: (c: Country) => void;
};

const CountryContext = createContext<CountryContextType | null>(null);

const STORAGE_KEY = "app.selectedCountry";

export function Providers({ children }: { children: React.ReactNode }) {
  const [country, setCountryState] = useState<Country>(COUNTRIES[0]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = COUNTRIES.find((c) => c.apiCode === saved);
    if (parsed) setCountryState(parsed);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, country.apiCode);
  }, [country]);

  const setCountry = (c: Country) => {
    setCountryState(c);
  };

  return (
    <CountryContext.Provider value={{ country, setCountry }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error("useCountry must be used inside <Providers />");
  }
  return ctx;
}