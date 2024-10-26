'use client'
import React from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useConfig, useChainId, useBlockNumber, useReadContract } from 'wagmi'
import { toast } from 'react-hot-toast'
import { Abi } from 'viem'
import contractABI from '../../contractABI.json'
import { getContractAddress } from '../utils/contractUtils'

const typedContractABI = contractABI as Abi

const RebaseButton: React.FC = () => {
  const { isConnected, address: account } = useAccount()
  const chainId = useChainId()
  const config = useConfig()
  const contractAddress = getContractAddress(chainId)
  const { data: blockNumber } = useBlockNumber()

  const { data: lastRebaseBlockData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: typedContractABI,
    functionName: 'lastRebaseBlock',
  })

  const { writeContract, data: rebaseHash } = useWriteContract()

  const { isLoading: isRebaseConfirming } = useWaitForTransactionReceipt({
    hash: rebaseHash,
  })

  const canRebase = blockNumber && lastRebaseBlockData
    ? blockNumber > (lastRebaseBlockData as bigint + BigInt(300))
    : false

  const handleRebase = async () => {
    if (!isConnected || !contractAddress || !account || !canRebase) return

    const chain = config.chains.find(c => c.id === chainId)
    if (!chain) {
      toast.error('Unsupported chain')
      return
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: typedContractABI,
        functionName: 'rebase',
        args: [account],
        chain,
        account,
      })

      toast.success('Rebase transaction sent. Waiting for confirmation...')
    } catch (error) {
      console.error('Error calling rebase:', error)
      toast.error('Failed to rebase. Please try again.')
    }
  }

  const blocksUntilRebase = lastRebaseBlockData && blockNumber
    ? Math.max(0, Number(BigInt(300) - (blockNumber - (lastRebaseBlockData as bigint))))
    : 0

  return (
    <div className="flex flex-col items-center">
      <button
        className={`btn-primary dark:btn-secondary ${!canRebase ? 'opacity-50' : ''} 
        shadow-soft hover:shadow-md transition-shadow duration-300
        text-lg py-3 px-6 rounded-lg font-semibold`}
        onClick={handleRebase}
        disabled={!isConnected || isRebaseConfirming || !canRebase}
      >
        {isRebaseConfirming ? 'Rebasing...' : canRebase ? 'Rebase' : `Rebase available in: ${blocksUntilRebase} blocks`}
      </button>
    </div>
  )
}

export default RebaseButton
