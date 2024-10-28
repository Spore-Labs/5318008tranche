'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useConfig } from 'wagmi'
import { toast } from 'react-hot-toast'
import { TransactionReceipt } from 'viem'
import { SaleUIProps } from '../types'

const trancheBuyABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'trancheIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'maxPriceDifferencePercent', type: 'uint256' }
    ],
    name: 'buyTranche',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
]

const SaleUI: React.FC<SaleUIProps> = ({ contractAddress, selectedTrancheIndex, selectedMaxPriceDifference, onRef }) => {
  const [trancheIndex, setTrancheIndex] = useState<number>(0)
  const [maxPriceDifference, setMaxPriceDifference] = useState<number>(200)
  const [amount, setAmount] = useState<string>('0.1')
  const { isConnected, address: account } = useAccount()
  const chainId = useChainId()
  const config = useConfig()

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: txResult } =
    useWaitForTransactionReceipt({
      hash,
    })

  // Ensure txResult is a TransactionReceipt
  const transactionReceipt: TransactionReceipt | undefined = txResult
    ? {
        blockHash: txResult.blockHash,
        blockNumber: txResult.blockNumber,
        contractAddress: txResult.contractAddress,
        cumulativeGasUsed: txResult.cumulativeGasUsed,
        effectiveGasPrice: txResult.effectiveGasPrice,
        from: txResult.from,
        gasUsed: txResult.gasUsed,
        logs: txResult.logs,
        logsBloom: txResult.logsBloom,
        status: txResult.status,
        to: txResult.to,
        transactionHash: txResult.transactionHash,
        transactionIndex: txResult.transactionIndex,
        type: txResult.type,
      }
    : undefined

  useEffect(() => {
    if (selectedTrancheIndex !== null) {
      setTrancheIndex(selectedTrancheIndex)
    }
  }, [selectedTrancheIndex])

  useEffect(() => {
    if (selectedMaxPriceDifference !== null) {
      setMaxPriceDifference(selectedMaxPriceDifference)
    }
  }, [selectedMaxPriceDifference])

  useEffect(() => {
    onRef({
      updateTrancheIndex: setTrancheIndex,
      updateMaxPriceDifference: setMaxPriceDifference,
    })
    return () => onRef(null)
  }, [onRef])

  const handleBuyTranche = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const chain = config.chains.find(c => c.id === chainId)
    if (!chain) {
      toast.error('Unsupported chain')
      return
    }

    try {
      writeContract({
        address: contractAddress,
        abi: trancheBuyABI,
        functionName: 'buyTranche',
        args: [BigInt(trancheIndex), BigInt(maxPriceDifference)],
        value: BigInt(parseFloat(amount) * 1e18),
        account: account as `0x${string}`,
        chain,
      })
    } catch (error) {
      console.error('Error buying tranche:', error)
      toast.error('Failed to buy tranche. Please try again.')
    }
  }

  return (
    <div className="mt-4">
      <div className="max-w-[250px] bg-primary-light dark:bg-primary-dark p-4 xs:p-4 sm:p-6 rounded-lg shadow-soft mx-auto border border-text-light dark:border-text-dark">
        <h2 className="text-xl xs:text-xl sm:text-2xl font-bold mb-4 text-center">Buy Tranche</h2>
        <div className="flex flex-col space-y-3">
          <div>
            <label className="block text-xs xs:text-sm font-medium text-text-light dark:text-text-dark mb-1">Tranche Index</label>
            <input
              type="number"
              value={trancheIndex}
              onChange={(e) => setTrancheIndex(Number(e.target.value))}
              className="w-full px-2 py-1 xs:px-3 xs:py-2 text-xs xs:text-sm border border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs xs:text-sm font-medium text-text-light dark:text-text-dark mb-1">Max Price Difference (%)</label>
            <input
              type="number"
              value={maxPriceDifference}
              onChange={(e) => setMaxPriceDifference(Number(e.target.value))}
              className="w-full px-2 py-1 xs:px-3 xs:py-2 text-xs xs:text-sm border border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs xs:text-sm font-medium text-text-light dark:text-text-dark mb-1">Amount (ETH)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-2 py-1 xs:px-3 xs:py-2 text-xs xs:text-sm border border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            className={`btn btn-responsive w-full mt-2 text-xs xs:text-sm ${!isConnected || isPending || isConfirming ? 'opacity-50' : ''}`}
            disabled={!isConnected || isPending || isConfirming}
            onClick={handleBuyTranche}
          >
            {(isPending || isConfirming) ? 'Processing...' : 'Buy Tranche 💸'}
          </button>
        </div>
        {!isConnected && (
          <div className="text-xs xs:text-sm text-red-500 mt-2 text-center">
            Wallet not connected or in the wrong network
          </div>
        )}
      </div>
    </div>
  )
}

export default SaleUI
