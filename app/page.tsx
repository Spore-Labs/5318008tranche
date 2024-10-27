'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useChainId, useReadContracts, useBlockNumber } from 'wagmi'
import { Abi } from 'viem'
import { getContractAddress } from './utils/contractUtils'
import TokenInfo from './components/TokenInfo'
import contractABI from '../contractABI.json'
import { PriceDifferenceContract, TrancheSupplyContract, TrancheSoldContract } from './types'

const typedContractABI = contractABI as Abi

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const { isConnected, address: account } = useAccount()
  const chainId = useChainId()
  const [availableTranches, setAvailableTranches] = useState<boolean[]>([])
  const [trancheSupply, setTrancheSupply] = useState<bigint[]>([])
  const [trancheSold, setTrancheSold] = useState<bigint[]>([])
  const [priceDifference, setPriceDifference] = useState<bigint[] | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const contractAddress = getContractAddress(chainId)

  const { data: tranchesData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getAvailableTranches',
  })

  
  const supplyResults = useReadContracts<TrancheSupplyContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'trancheSupplyBaseUnits',
      args: [BigInt(index)],
    })),
  })

  const soldResults = useReadContracts<TrancheSoldContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'trancheSoldBaseUnits',
      args: [BigInt(index)],
    })),
  })

  const priceDifferenceResults = useReadContracts<PriceDifferenceContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'getCurrentPriceDifferencePercent',
      args: [BigInt(index)],
    })),
  })

  useEffect(() => {
    if (tranchesData) {
      setAvailableTranches(tranchesData as boolean[])
    }
  }, [tranchesData])

  useEffect(() => {
    if (priceDifferenceResults.data) {
      setPriceDifference(priceDifferenceResults.data.map(result => result.result as bigint))
    }
  }, [priceDifferenceResults.data])

  useEffect(() => {
    if (contractAddress && supplyResults.data && soldResults.data) {
      setTrancheSupply(supplyResults.data.map(result => (result.result as bigint) || BigInt(0)))
      setTrancheSold(soldResults.data.map(result => (result.result as bigint) || BigInt(0)))
    }
  }, [contractAddress, supplyResults.data, soldResults.data])

  const memoizedOnRef = useCallback((ref: any) => {
    if (ref) {
      return (trancheIndex: number, maxPriceDifference: number) => {
        ref.updateTrancheIndex(trancheIndex)
        ref.updateMaxPriceDifference(maxPriceDifference)
      }
    }
    return null
  }, [])

  const { data: blockNumber } = useBlockNumber()
  const [lastRebaseBlock, setLastRebaseBlock] = useState<bigint | null>(null)
  const [canRebase, setCanRebase] = useState<boolean>(false)

  const { data: lastRebaseBlockData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: typedContractABI,
    functionName: 'lastRebaseBlock',
  })

  useEffect(() => {
    if (lastRebaseBlockData) {
      setLastRebaseBlock(lastRebaseBlockData as bigint)
    }
  }, [lastRebaseBlockData])

  useEffect(() => {
    if (blockNumber && lastRebaseBlock) {
      setCanRebase(blockNumber > (lastRebaseBlock + BigInt(300)))
    }
  }, [blockNumber, lastRebaseBlock])

  if (!isClient) {
    return null
  }

  return (
    <main className="flex flex-col h-full bg-content-light dark:bg-content-dark text-text-light dark:text-text-dark">
      <TokenInfo
        isConnected={isConnected}
        contractAddress={contractAddress}
        availableTranches={availableTranches}
        trancheSupply={trancheSupply}
        trancheSold={trancheSold}
        priceDifference={priceDifference}
        onBuyTranche={(index: number) => {
          const updateSaleUI = memoizedOnRef(null)
          if (updateSaleUI) {
            updateSaleUI(index, priceDifference && priceDifference[index] ? Number(priceDifference[index]) + 500 : 500)
          }
        }}
        onRef={memoizedOnRef}
      />
    </main>
  )
}
