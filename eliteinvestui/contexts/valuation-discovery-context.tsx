"use client";

import { createContext, useContext, useReducer } from "react";

type Stock = {
  symbol: string;
  name?: string;
};

type State = {
  selectedStocks: Stock[];
  selectedSymbol: string | null;
  wizardStep: number;
};

type Action =
  | { type: "SET_STOCKS"; payload: Stock[] }
  | { type: "REMOVE_STOCKS"; payload: string[] }
  | { type: "SELECT_SYMBOL"; payload: string }
  | { type: "SET_STEP"; payload: number };

const initialState: State = {
  selectedStocks: [],
  selectedSymbol: null,
  wizardStep: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STOCKS":
      return {
        ...state,
        selectedStocks: action.payload,
        selectedSymbol: action.payload[0]?.symbol ?? null,
      };

    case "REMOVE_STOCKS":
      const remaining = state.selectedStocks.filter(
        (s) => !action.payload.includes(s.symbol),
      );

      return {
        ...state,
        selectedStocks: remaining,
        selectedSymbol: remaining[0]?.symbol ?? null,
      };

    case "SELECT_SYMBOL":
      return {
        ...state,
        selectedSymbol: action.payload,
      };

    case "SET_STEP":
      return {
        ...state,
        wizardStep: action.payload,
      };

    default:
      return state;
  }
}

const ValuationContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

export function ValuationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <ValuationContext.Provider value={{ state, dispatch }}>
      {children}
    </ValuationContext.Provider>
  );
}

export function useValuation() {
  const ctx = useContext(ValuationContext);
  if (!ctx) throw new Error("useValuation must be used inside provider");
  return ctx;
}