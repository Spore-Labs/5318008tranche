'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useChainId, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useConfig, useBlockNumber } from 'wagmi'
import TrancheButton from './components/TrancheButton'
import contractABI from '../contractABI.json'
import { Abi } from 'viem'
import SaleUI from './components/SaleUI'
import { getContractAddress } from './utils/contractUtils'

const typedContractABI = contractABI as Abi

type PriceDifferenceContract = {
  address: `0x${string}`
  abi: typeof typedContractABI
  functionName: 'getCurrentPriceDifferencePercent'
  args: [bigint]
}

type TrancheSupplyContract = {
  address: `0x${string}`
  abi: typeof typedContractABI
  functionName: 'trancheSupplyBaseUnits'
  args: [bigint]
}

type TrancheSoldContract = {
  address: `0x${string}`
  abi: typeof typedContractABI
  functionName: 'trancheSoldBaseUnits'
  args: [bigint]
}

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const config = useConfig()
  const { isConnected, address: account } = useAccount()
  const chainId = useChainId()
  const [availableTranches, setAvailableTranches] = useState<boolean[]>([])
  const [trancheSupply, setTrancheSupply] = useState<bigint[]>([])
  const [trancheSold, setTrancheSold] = useState<bigint[]>([])
  const [priceDifference, setPriceDifference] = useState<bigint[] | null>(null)
  const [selectedTrancheIndex, setSelectedTrancheIndex] = useState<number | null>(null)
  const [selectedMaxPriceDifference, setSelectedMaxPriceDifference] = useState<number | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const contractAddress = getContractAddress(chainId)

  const { data: tranchesData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getAvailableTranches',
  })

  // @ts-expect-error Type instantiation is excessively deep and possibly infinite.
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

  const { writeContract, data: rebaseHash } = useWriteContract()

  const { isLoading: isRebaseConfirming, isSuccess: isRebaseConfirmed } =
    useWaitForTransactionReceipt({
      hash: rebaseHash,
    })

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
    <main className="container mx-auto p-4 bg-content-light dark:bg-content-dark text-text-light dark:text-text-dark">
      {isConnected && !contractAddress && (
        <div className="mt-4 p-4 bg-secondary-light dark:bg-secondary-dark text-text-light dark:text-text-dark rounded">
          Please switch to Mainnet or Sepolia network.
        </div>
      )}
      {isConnected && contractAddress && (
        <div className="mt-4 w-full">
          <h2 className="text-2xl font-bold mb-4 text-primary-light dark:text-primary-dark">Available Tranches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {availableTranches.slice(0, 12).map((isAvailable, index) => (
              <TrancheButton
                key={index}
                trancheIndex={index}
                isAvailable={isAvailable}
                onBuy={() => {
                  setSelectedTrancheIndex(index)
                  setSelectedMaxPriceDifference(priceDifference && priceDifference[index] ? Number(priceDifference[index]) + 500 : 500)
                  const updateSaleUI = memoizedOnRef(null)
                  if (updateSaleUI) {
                    updateSaleUI(index, priceDifference && priceDifference[index] ? Number(priceDifference[index]) + 500 : 500)
                  }
                }}
                supply={trancheSupply[index]}
                sold={trancheSold[index]}
                priceDifference={priceDifference && priceDifference[index] ? priceDifference[index] : BigInt(0)}
              />
            ))}
          </div >
          <SaleUI
            contractAddress={contractAddress}
            selectedTrancheIndex={selectedTrancheIndex}
            selectedMaxPriceDifference={selectedMaxPriceDifference}
            onRef={memoizedOnRef}
          />
        </div>
      )}
    </main>
  )
}
