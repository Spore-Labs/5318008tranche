'use client'

import React, { useEffect, useState } from 'react'

interface TokenData {
  total: number
  circulating: number
  fdvmcap: number
  circulatingmcap: number
  liquidity: number
}

const TokenInfo: React.FC = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const endpoints = [
          'https://docs.5318008.io/api/total',
          'https://docs.5318008.io/api/circulating',
          'https://docs.5318008.io/api/fdvmcap',
          'https://docs.5318008.io/api/circulatingmcap',
          'https://docs.5318008.io/api/liquidity'
        ]

        const results = await Promise.all(endpoints.map(async url => {
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.json()
        }))

        const [total, circulating, fdvmcap, circulatingmcap, liquidity] = results

        setTokenData({
          total: Number(total.result) / 1e18,
          circulating: Number(circulating.result) / 1e18,
          fdvmcap: Number(fdvmcap.result),
          circulatingmcap: Number(circulatingmcap.result),
          liquidity: Number(liquidity.result)
        })
      } catch (error) {
        console.error('Error fetching token data:', error)
        setError(error instanceof Error ? error.message : 'An unknown error occurred')
      }
    }

    fetchTokenData()
  }, [])

  if (error) {
    return <div>Error loading token information: {error}</div>
  }

  if (!tokenData) {
    return <div>Loading token information...</div>
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 })
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 rounded-lg shadow-soft mb-8 border border-primary-light dark:border-primary-dark">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2">Total Supply:</h3>
          <p>{formatNumber(tokenData.total)} $BOOB</p>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2">Circulating Supply:</h3>
          <p>{formatNumber(tokenData.circulating)} $BOOB</p>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2">FDV:</h3>
          <p>${formatNumber(tokenData.fdvmcap)}</p>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2">Circulating MCAP:</h3>
          <p>${formatNumber(tokenData.circulatingmcap)}</p>
        </div>
        <div className="text-center">
          <h3 className="text-sm font-semibold mb-2">Liquidity Depth:</h3>
          <p>${formatNumber(tokenData.liquidity)}</p>
        </div>
      </div>
    </div>
  )
}

export default TokenInfo
