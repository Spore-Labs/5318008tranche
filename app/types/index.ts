import { Abi } from 'viem'

export interface TokenData {
  timestamp: string;
  total: number
  circulating: number
  fdv: number
  marketCap: number
  liquidity: number
}

export interface CandlestickData {
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface CandlestickChartProps {
  data: CandlestickData[];
  timeFrame: string;
  metric: keyof Omit<TokenData, 'timestamp'>;
}

export interface ChartProps {
  data: TokenData[];
  metric: keyof Omit<TokenData, 'timestamp'>;
}

export interface MetricButtonProps {
  label: string;
  value: string | number;
  selected: boolean;
  onClick: () => void;
}

export interface SaleUIProps {
  contractAddress: `0x${string}`;
  selectedTrancheIndex: number | null;
  selectedMaxPriceDifference: number | null;
  onRef: (ref: { updateTrancheIndex: (index: number) => void, updateMaxPriceDifference: (diff: number) => void } | null) => void;
}

export type PriceDifferenceContract = {
  address: `0x${string}`
  abi: Abi
  functionName: 'getCurrentPriceDifferencePercent'
  args: [bigint]
}

export type TrancheSupplyContract = {
  address: `0x${string}`
  abi: Abi
  functionName: 'trancheSupplyBaseUnits'
  args: [bigint]
}

export type TrancheSoldContract = {
  address: `0x${string}`
  abi: Abi
  functionName: 'trancheSoldBaseUnits'
  args: [bigint]
}

// SwappingFrame.tsx
export interface SwappingFrameProps {
  availableTranches: boolean[];
  trancheSupply: bigint[];
  trancheSold: bigint[];
  priceDifference: bigint[];
  contractAddress: `0x${string}`;
  onBuyTranche: (index: number) => void;
  onRef: (ref: { updateTrancheIndex: (index: number) => void, updateMaxPriceDifference: (diff: number) => void } | null) => void;
}

// SwitchTheme.tsx
export interface SwitchThemeProps {
  className?: string;
}

// TokenInfo.tsx
export interface TokenInfoProps {
  isConnected: boolean;
  contractAddress: `0x${string}` | null;
  availableTranches: boolean[];
  trancheSupply: bigint[];
  trancheSold: bigint[];
  priceDifference: bigint[] | null;
  onBuyTranche: (index: number) => void;
  onRef: (ref: any) => ((trancheIndex: number, maxPriceDifference: number) => void) | null;
}

// TrancheButton.tsx
export interface TrancheButtonProps {
  trancheIndex: number;
  isAvailable: boolean;
  onBuy: () => void;
  supply: bigint;
  sold: bigint;
  priceDifference: bigint;
  isSelected: boolean;
}
