import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyMode } from '../types';

interface CurrencyContextType {
  currencyMode: CurrencyMode;
  setCurrencyMode: (mode: CurrencyMode) => void;
  toggleCurrency: () => void;
  oracleRate: number;
  formatAmount: (usdValue: number, showSymbol?: boolean) => string;
  formatStockPrice: (usdPrice: number, decimals?: number) => { primary: string; secondary: string };
  convertUSDToZIG: (usd: number) => number;
  convertZIGToUSD: (zig: number) => number;
}

const DEFAULT_ORACLE_RATE = 26.00; // 1 USD = 26.00 ZIG

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyMode, setCurrencyModeState] = useState<CurrencyMode>(() => {
    try {
      const saved = localStorage.getItem('zeex_currency_mode');
      if (saved === 'USD' || saved === 'ZIG') {
        return saved;
      }
    } catch {
      // localStorage may not be accessible in some environments
    }
    return 'USD';
  });

  const oracleRate = DEFAULT_ORACLE_RATE;

  const setCurrencyMode = (mode: CurrencyMode) => {
    setCurrencyModeState(mode);
    try {
      localStorage.setItem('zeex_currency_mode', mode);
    } catch {
      // ignore
    }
  };

  const toggleCurrency = () => {
    setCurrencyMode(currencyMode === 'USD' ? 'ZIG' : 'USD');
  };

  const convertUSDToZIG = (usd: number) => usd * oracleRate;
  const convertZIGToUSD = (zig: number) => zig / oracleRate;

  const formatAmount = (usdValue: number, showSymbol = true): string => {
    if (isNaN(usdValue)) return showSymbol ? '$0.00' : '0.00';

    if (currencyMode === 'USD') {
      const formatted = usdValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return showSymbol ? `$${formatted}` : formatted;
    } else {
      const zigValue = usdValue * oracleRate;
      const formatted = zigValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return showSymbol ? `ZIG ${formatted}` : formatted;
    }
  };

  const formatStockPrice = (usdPrice: number, decimals = 2) => {
    const zigPrice = usdPrice * oracleRate;
    const dec = usdPrice < 1 && decimals === 2 ? 3 : decimals;

    if (currencyMode === 'USD') {
      return {
        primary: `$${usdPrice.toFixed(dec)}`,
        secondary: `ZIG ${zigPrice.toFixed(2)}`,
      };
    } else {
      return {
        primary: `ZIG ${zigPrice.toFixed(2)}`,
        secondary: `$${usdPrice.toFixed(dec)}`,
      };
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyMode,
        setCurrencyMode,
        toggleCurrency,
        oracleRate,
        formatAmount,
        formatStockPrice,
        convertUSDToZIG,
        convertZIGToUSD,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
