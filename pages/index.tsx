import React, { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useChainId, useReadContracts, useWriteContract, useWaitForTransactionReceipt, useConfig, useBlockNumber } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TrancheButton from '../components/TrancheButton';
import contractABI from '../contractABI.json';
import { Abi } from 'viem';
import SaleUI from './SaleUI';
import { toast } from 'react-hot-toast';


const contractAddresses = {
  mainnet: '0xbB493890c5a30a047576f9114081Cb65038c651c',
  sepolia: '0xf585a2e915998179EfC125832ed98eCcf87dF2f9',
};

const typedContractABI = contractABI as Abi;

type PriceDifferenceContract = {
  address: `0x${string}`;
  abi: typeof typedContractABI;
  functionName: 'getCurrentPriceDifferencePercent';
  args: [bigint];
};

type TrancheSupplyContract = {
  address: `0x${string}`;
  abi: typeof typedContractABI;
  functionName: 'trancheSupplyBaseUnits';
  args: [bigint];
};

type TrancheSoldContract = {
  address: `0x${string}`;
  abi: typeof typedContractABI;
  functionName: 'trancheSoldBaseUnits';
  args: [bigint];
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const config = useConfig();
  const { isConnected, address: account } = useAccount();
  const chainId = useChainId();
  const [availableTranches, setAvailableTranches] = useState<boolean[]>([]);
  const [trancheSupply, setTrancheSupply] = useState<bigint[]>([]);
  const [trancheSold, setTrancheSold] = useState<bigint[]>([]);
  const [priceDifference, setPriceDifference] = useState<bigint[] | null>(null);
  const [selectedTrancheIndex, setSelectedTrancheIndex] = useState<number | null>(null);
  const [selectedMaxPriceDifference, setSelectedMaxPriceDifference] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getContractAddress = (): `0x${string}` | null => {
    if (chainId === 1) return contractAddresses.mainnet as `0x${string}`;
    if (chainId === 11155111) return contractAddresses.sepolia as `0x${string}`;
    return null;
  };

  const contractAddress = getContractAddress();

  const { data: tranchesData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractABI,
    functionName: 'getAvailableTranches',
  });
  
  // @ts-expect-error Type instantiation is excessively deep and possibly infinite.
  const supplyResults = useReadContracts<TrancheSupplyContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'trancheSupplyBaseUnits',
      args: [BigInt(index)],
    })),
  });

  const soldResults = useReadContracts<TrancheSoldContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'trancheSoldBaseUnits',
      args: [BigInt(index)],
    })),
  });

  const priceDifferenceResults = useReadContracts<PriceDifferenceContract[]>({
    contracts: availableTranches.map((_, index) => ({
      address: contractAddress as `0x${string}`,
      abi: typedContractABI,
      functionName: 'getCurrentPriceDifferencePercent',
      args: [BigInt(index)],
    })),
  });

  useEffect(() => {
    if (tranchesData) {
      setAvailableTranches(tranchesData as boolean[]);
    }
  }, [tranchesData]);

  useEffect(() => {
    if (priceDifferenceResults.data) {
      setPriceDifference(priceDifferenceResults.data.map(result => result.result as bigint));
    }
  }, [priceDifferenceResults.data]);

  useEffect(() => {
    if (contractAddress && supplyResults.data && soldResults.data) {
      setTrancheSupply(supplyResults.data.map(result => (result.result as bigint) || BigInt(0)));
      setTrancheSold(soldResults.data.map(result => (result.result as bigint) || BigInt(0)));
    }
  }, [contractAddress, supplyResults.data, soldResults.data]);

  const memoizedOnRef = useCallback((ref: any) => {
    if (ref) {
      return (trancheIndex: number, maxPriceDifference: number) => {
        ref.updateTrancheIndex(trancheIndex);
        ref.updateMaxPriceDifference(maxPriceDifference);
      };
    }
    return null;
  }, []);

  const { writeContract, data: rebaseHash } = useWriteContract();

  const { isLoading: isRebaseConfirming, isSuccess: isRebaseConfirmed } =
    useWaitForTransactionReceipt({
      hash: rebaseHash,
    });

  const { data: blockNumber } = useBlockNumber();
  const [lastRebaseBlock, setLastRebaseBlock] = useState<bigint | null>(null);
  const [canRebase, setCanRebase] = useState<boolean>(false);

  const { data: lastRebaseBlockData } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: typedContractABI,
    functionName: 'lastRebaseBlock',
  });

  useEffect(() => {
    if (lastRebaseBlockData) {
      setLastRebaseBlock(lastRebaseBlockData as bigint);
    }
  }, [lastRebaseBlockData]);

  useEffect(() => {
    if (blockNumber && lastRebaseBlock) {
      setCanRebase(blockNumber > (lastRebaseBlock + BigInt(300)));
    }
  }, [blockNumber, lastRebaseBlock]);

  const handleRebase = async () => {
    if (!isConnected || !contractAddress || !account || !canRebase) return;

    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) {
      toast.error('Unsupported chain');
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi: typedContractABI,
        functionName: 'rebase',
        args: [account],
        chain,
        account,
      });
      
      toast.success('Rebase transaction sent. Waiting for confirmation...');
    } catch (error) {
      console.error('Error calling rebase:', error);
      toast.error('Failed to rebase. Please try again.');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 relative">
      <div className="flex flex-col items-center justify-center mb-4">
        <h1 className="text-3xl font-bold mb-4">Purchase BOOB Tranches</h1>
        <ConnectButton />
      </div>
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleRebase}
          disabled={!isConnected || isRebaseConfirming || !canRebase}
        >
          {isRebaseConfirming ? 'Rebasing...' : canRebase ? 'Rebase' : 'Rebase Unavailable'}
        </button>
        {!canRebase && lastRebaseBlock && blockNumber && (
          <div className="text-sm text-gray-600">
            Rebase will be available in {300 - Number(blockNumber - lastRebaseBlock)} blocks
          </div>
        )}
      </div>
      {isConnected && !contractAddress && (
        <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded">
          Please switch to Mainnet or Sepolia network.
        </div>
      )}
      {isConnected && contractAddress && (
        <div className="mt-4 w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {availableTranches.slice(0, 12).map((isAvailable, index) => (
              <TrancheButton
                key={index}
                trancheIndex={index}
                isAvailable={isAvailable}
                onBuy={() => {
                  setSelectedTrancheIndex(index);
                  setSelectedMaxPriceDifference(priceDifference && priceDifference[index] ? Number(priceDifference[index]) + 500 : 500);
                  const updateSaleUI = memoizedOnRef(null);
                  if (updateSaleUI) {
                    updateSaleUI(index, priceDifference && priceDifference[index] ? Number(priceDifference[index]) + 500 : 500);
                  }
                }} 
                supply={trancheSupply[index]}
                sold={trancheSold[index]}
                priceDifference={priceDifference && priceDifference[index] ? priceDifference[index] : BigInt(0)}
              />
            ))}
          </div>
          <SaleUI 
            contractAddress={contractAddress}
            selectedTrancheIndex={selectedTrancheIndex}
            selectedMaxPriceDifference={selectedMaxPriceDifference}
            onRef={memoizedOnRef}
          />
        </div>
      )}
    </div>
  );
}
