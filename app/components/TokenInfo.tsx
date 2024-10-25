'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { TokenData } from '../types'
import { ChartComponent } from './ChartComponent'
import { MetricButton } from './MetricButton'
import { SwappingFrame } from './SwappingFrame'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { getContractAddress } from '../utils/contractUtils'
import contractABI from '../../contractABI.json'

interface TokenInfoProps {
  isConnected: boolean;
  contractAddress: `0x${string}` | null;
  availableTranches: boolean[];
  trancheSupply: bigint[];
  trancheSold: bigint[];
  priceDifference: bigint[] | null;
  onBuyTranche: (index: number) => void;
  onRef: (ref: any) => ((trancheIndex: number, maxPriceDifference: number) => void) | null;
}

const TokenInfo: React.FC<TokenInfoProps> = ({
  isConnected,
  contractAddress,
  availableTranches,
  trancheSupply,
  trancheSold,
  priceDifference,
  onBuyTranche,
  onRef
}) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [historicalData, setHistoricalData] = useState<TokenData[]>([])
  const [selectedMetric, setSelectedMetric] = useState<keyof Omit<TokenData, 'timestamp'>>('marketCap')
  const [error, setError] = useState<string | null>(null)

  const { data: tranchesData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getAvailableTranches',
  })

  const fetchTokenData = useCallback(async () => {
    try {
      const currentDataEndpoints = [
        'https://docs.5318008.io/api/total',
        'https://docs.5318008.io/api/circulating',
        'https://docs.5318008.io/api/fdvmcap',
        'https://docs.5318008.io/api/circulatingmcap',
        'https://docs.5318008.io/api/liquidity'
      ]

      const results = await Promise.all(currentDataEndpoints.map(async url => {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        return response.json()
      }))

      const [total, circulating, fdvmcap, circulatingmcap, liquidity] = results

      const currentData: TokenData = {
        total: Number(total.result) / 1e18,
        circulating: Number(circulating.result) / 1e18,
        fdv: Number(fdvmcap.result),
        marketCap: Number(circulatingmcap.result),
        liquidity: Number(liquidity.result),
        timestamp: new Date().toISOString(),
      }

      setTokenData(currentData)

      // Fetch historical data
      const historicalResponse = await fetch('/api/historical-token-data')
      if (!historicalResponse.ok) throw new Error(`HTTP error! status: ${historicalResponse.status}`)
      const historicalData: TokenData[] = await historicalResponse.json()

      // Process historical data to include OHLC values
      const processedHistoricalData = historicalData.map((data, index, array) => ({
        ...data,
        open: index > 0 ? array[index - 1].marketCap : data.marketCap,
        high: Math.max(data.marketCap, index > 0 ? array[index - 1].marketCap : data.marketCap),
        low: Math.min(data.marketCap, index > 0 ? array[index - 1].marketCap : data.marketCap),
        close: data.marketCap
      }))

      setHistoricalData([...processedHistoricalData, currentData])
    } catch (error) {
      console.error('Error fetching token data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }, [])

  useEffect(() => {
    if (isConnected && contractAddress) {
      fetchTokenData()
    }
  }, [isConnected, contractAddress, fetchTokenData])

  if (error) return <div>Error loading token information: {error}</div>
  if (!tokenData) return <div>Loading token information...</div>

  const formatNumber = (num: number) => num.toLocaleString(undefined, { maximumFractionDigits: 0 })

  const metrics = [
    { key: 'total', label: 'Total Supply', value: `${formatNumber(tokenData.total)} $BOOB` },
    { key: 'circulating', label: 'Circulating Supply', value: `${formatNumber(tokenData.circulating)} $BOOB` },
    { key: 'fdv', label: 'FDV', value: `$${formatNumber(tokenData.fdv)}` },
    { key: 'marketCap', label: 'Market Cap', value: `$${formatNumber(tokenData.marketCap)}` },
    { key: 'liquidity', label: 'Liquidity', value: `$${formatNumber(tokenData.liquidity)}` }
  ]

  return (
    <div className="flex flex-col h-full bg-content-light dark:bg-content-dark text-white">
      <div className="text-xs grid grid-cols-5 gap-1 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-1 shadow-soft border border-primary-light dark:border-primary-dark rounded-lg">
        {metrics.map(({ key, label, value }) => (
          <MetricButton
            key={key}
            label={label}
            value={value}
            selected={selectedMetric === key}
            onClick={() => setSelectedMetric(key as keyof Omit<TokenData, 'timestamp'>)}
          />
        ))}
      </div>
      
      <div className="flex-grow flex mt-1 overflow-hidden bg-content-light dark:bg-content-dark rounded-lg">
        <div className="w-3/4 pr-1 h-full">
          <ChartComponent data={historicalData} metric={selectedMetric} />
        </div>
        <div className="w-1/4 pl-1 h-full overflow-auto">
          <SwappingFrame
            showUniswap={false}
            availableTranches={availableTranches}
            trancheSupply={trancheSupply}
            trancheSold={trancheSold}
            priceDifference={priceDifference || []}
            contractAddress={contractAddress as `0x${string}`}
            onBuyTranche={onBuyTranche}
            onRef={onRef}
          />
        </div>
      </div>
    </div>
  )
}

export default TokenInfo
