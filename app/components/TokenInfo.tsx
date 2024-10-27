'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { TokenData, TokenInfoProps } from '../types'
import { ChartComponent } from './ChartComponent'
import { MetricButton } from './MetricButton'
import { SwappingFrame } from './SwappingFrame'
import { useReadContract } from 'wagmi'
import contractABI from '../../contractABI.json'
import { ChartProps } from '../types'

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
  const [selectedMetric, setSelectedMetric] = useState<ChartProps['metric']>('marketCap_close')
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
    } catch (error) {
      console.error('Error fetching token data:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }, [])

  useEffect(() => {
    if (isConnected && contractAddress) {
      fetchTokenData()
      const intervalId = setInterval(fetchTokenData, 60000) // Fetch every minute
      return () => clearInterval(intervalId)
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
            selected={selectedMetric === `${key}_close`}
            onClick={() => setSelectedMetric(`${key}_close` as ChartProps['metric'])}
          />
        ))}
      </div>
      
      <div className="flex-grow flex mt-1 overflow-hidden bg-content-light dark:bg-content-dark rounded-lg">
        <div className="w-3/4 pr-1 h-full">
          <ChartComponent metric={selectedMetric} />
        </div>
        <div className="w-1/4 pl-1 h-full overflow-auto">
          <SwappingFrame
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
