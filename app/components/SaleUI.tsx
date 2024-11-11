'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useConfig, useReadContract } from 'wagmi'
import { toast } from 'react-hot-toast'
import { SaleUIProps } from '../types'
import Modal from './Modal'

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
  },
  {
    inputs: [],
    name: 'getBoobsPriceInETH',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getETHPriceFromUniswap',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'ethPrice', type: 'uint256' }
    ],
    name: 'getBoobsPriceInUSD',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
]

const SaleUI: React.FC<SaleUIProps> = ({ contractAddress, selectedTrancheIndex, selectedMaxPriceDifference, onRef, isOpen, onClose }) => {
  const [trancheIndex, setTrancheIndex] = useState<number>(0)
  const [slippage, setSlippage] = useState<number>(2)
  const [amount, setAmount] = useState<string>('0.1')
  const { isConnected, address: account } = useAccount()
  const chainId = useChainId()
  const config = useConfig()

  const { data: currentPrice, isError, error } = useReadContract({
    address: contractAddress,
    abi: trancheBuyABI,
    functionName: 'getBoobsPriceInETH',
  })

  const { data: ethPrice } = useReadContract({
    address: contractAddress,
    abi: trancheBuyABI,
    functionName: 'getETHPriceFromUniswap',
  })

  const { data: usdPrice } = useReadContract({
    address: contractAddress,
    abi: trancheBuyABI,
    functionName: 'getBoobsPriceInUSD',
    args: [ethPrice || BigInt(0)],
  })

  const { data: totalSupply } = useReadContract({
    address: contractAddress,
    abi: trancheBuyABI,
    functionName: 'totalSupply',
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (selectedTrancheIndex !== null) {
      setTrancheIndex(selectedTrancheIndex)
    }
  }, [selectedTrancheIndex])

  useEffect(() => {
    onRef({
      updateTrancheIndex: setTrancheIndex,
      updateMaxPriceDifference: () => {}
    })
    return () => onRef(null)
  }, [onRef])

  useEffect(() => {
    if (isError) {
      console.error('Price fetch error:', error)
    }
  }, [contractAddress, currentPrice, isError, error])

  const estimatedTokens = currentPrice && amount
    ? (parseFloat(amount) * 1e18) / Number(currentPrice)
    : 0

  const percentageOfSupply = totalSupply && estimatedTokens
    ? (estimatedTokens / (Number(totalSupply) / 1e18)) * 100
    : 0

  const handleBuyTranche = async () => {
    if (!isConnected || !currentPrice || selectedMaxPriceDifference === null) {
      toast.error('Please connect your wallet first or wait for price data')
      return
    }

    const chain = config.chains.find(c => c.id === chainId)
    if (!chain) {
      toast.error('Unsupported chain')
      return
    }

    try {
      // Calculate total price difference with slippage
      // Formula: ((contractPriceDifference + 10000) * (1 + slippage/100)) - 10000
      const totalPriceDifference = Math.round(
        ((selectedMaxPriceDifference + 10000) * (1 + slippage / 100)) - 10000
      )

      // Log all relevant values
      console.log('Buy Tranche Parameters:', {
        trancheIndex,
        contractPriceDifference: selectedMaxPriceDifference,
        slippageMultiplier: 1 + slippage / 100,
        totalPriceDifference,
        amount: parseFloat(amount),
        valueInWei: BigInt(parseFloat(amount) * 1e18).toString(),
        contractAddress,
        account
      })

      writeContract({
        address: contractAddress,
        abi: trancheBuyABI,
        functionName: 'buyTranche',
        args: [BigInt(trancheIndex), BigInt(totalPriceDifference)],
        value: BigInt(parseFloat(amount) * 1e18),
        account: account as `0x${string}`,
        chain,
      })
    } catch (error) {
      console.error('Error buying tranche:', error)
      toast.error('Failed to buy tranche. Please try again.')
    }
  }

  const priceDisplay = () => {
    if (isError) return 'Error fetching price'
    if (!currentPrice || !usdPrice || !ethPrice) return 'Loading...'
    
    const ethValue = (Number(currentPrice) / 1e18).toFixed(8)
    const usdValue = (Number(usdPrice) / 1e18).toFixed(2)
    
    return `${ethValue} ETH ($${usdValue})`
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-background-light dark:bg-background-dark rounded-xl">
        <h2 className="text-xl xs:text-xl sm:text-2xl font-bold mb-4 text-center text-text-light dark:text-text-dark">
          Buy Tranche {trancheIndex}
        </h2>
        <div className="flex flex-col space-y-4">
          <div className="bg-primary-light dark:bg-primary-dark p-3 rounded-lg border border-primary-light dark:border-primary-dark">
            <p className="text-sm mb-1 text-text-light dark:text-text-dark">Current Price: {priceDisplay()}</p>
          </div>
          <div className="bg-content-light dark:bg-content-dark p-3 rounded-lg border border-primary-light dark:border-primary-dark">
            <p className="text-sm mb-1 text-text-light dark:text-text-dark">Estimated Tokens: {estimatedTokens.toFixed(2)}</p>
            <p className="text-sm text-text-light dark:text-text-dark">% of Total Supply: {percentageOfSupply.toFixed(4)}%</p>
          </div>
          
          <div>
            <label className="block text-xs xs:text-sm font-medium mb-1 text-text-light dark:text-text-dark">
              Amount (ETH)
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 
                bg-background-light dark:bg-background-dark 
                text-text-light dark:text-text-dark
                border-primary-light dark:border-primary-dark
                focus:ring-secondary-light dark:focus:ring-secondary-dark"
            />
          </div>
          
          <div>
            <label className="block text-xs xs:text-sm font-medium mb-1 text-text-light dark:text-text-dark">
              Slippage Tolerance (%)
            </label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2
                bg-background-light dark:bg-background-dark 
                text-text-light dark:text-text-dark
                border-primary-light dark:border-primary-dark
                focus:ring-secondary-light dark:focus:ring-secondary-dark"
            />
          </div>

          <button
            className={`btn btn-responsive w-full mt-2 ${!isConnected || isPending || isConfirming ? 'opacity-50' : ''}`}
            disabled={!isConnected || isPending || isConfirming}
            onClick={handleBuyTranche}
          >
            {(isPending || isConfirming) ? 'Processing...' : 'Buy Tranche 💸'}
          </button>
        </div>

        {!isConnected && (
          <div className="text-sm text-red-500 mt-4 text-center">
            Wallet not connected or in the wrong network
          </div>
        )}
      </div>
    </Modal>
  )
}

export default SaleUI
