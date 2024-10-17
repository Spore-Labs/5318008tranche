import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useConfig } from 'wagmi';
import { toast } from 'react-hot-toast';
import { TransactionReceipt } from 'viem';
import { CopyToClipboard } from "react-copy-to-clipboard";

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
];

interface SaleUIProps {
  contractAddress: `0x${string}`;
  selectedTrancheIndex: number | null;
  selectedMaxPriceDifference: number | null;
  onRef: (ref: { updateTrancheIndex: (index: number) => void, updateMaxPriceDifference: (diff: number) => void } | null) => void;
}

const SaleUI: React.FC<SaleUIProps> = ({ contractAddress, selectedTrancheIndex, selectedMaxPriceDifference, onRef }) => {
  const [trancheIndex, setTrancheIndex] = useState<number>(0);
  const [maxPriceDifference, setMaxPriceDifference] = useState<number>(200);
  const [amount, setAmount] = useState<string>('0.1');
  const { isConnected, address: account } = useAccount();
  const chainId = useChainId();
  const config = useConfig();

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed, data: txResult } =
    useWaitForTransactionReceipt({
      hash,
    });

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
    : undefined;

  useEffect(() => {
    if (selectedTrancheIndex !== null) {
      setTrancheIndex(selectedTrancheIndex);
    }
  }, [selectedTrancheIndex]);

  useEffect(() => {
    if (selectedMaxPriceDifference !== null) {
      setMaxPriceDifference(selectedMaxPriceDifference);
    }
  }, [selectedMaxPriceDifference]);

  useEffect(() => {
    onRef({
      updateTrancheIndex: setTrancheIndex,
      updateMaxPriceDifference: setMaxPriceDifference,
    });
    return () => onRef(null);
  }, [onRef]);

  const handleBuyTranche = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const chain = config.chains.find(c => c.id === chainId);
    if (!chain) {
      toast.error('Unsupported chain');
      return;
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
      });
    } catch (error) {
      console.error('Error buying tranche:', error);
      toast.error('Failed to buy tranche. Please try again.');
    }
  };

  return (
    <div className="py-5 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Buy Tranche</h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tranche Index</label>
            <input
              type="number"
              value={trancheIndex}
              onChange={(e) => setTrancheIndex(Number(e.target.value))}
              placeholder="Tranche Index"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price Difference (%)</label>
            <input
              type="number"
              value={maxPriceDifference}
              onChange={(e) => setMaxPriceDifference(Number(e.target.value))}
              placeholder="Max Price Difference"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETH)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (ETH)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            (!isConnected || isPending || isConfirming) && "opacity-50 cursor-not-allowed"
          }`}
          disabled={!isConnected || isPending || isConfirming}
          onClick={handleBuyTranche}
        >
          {(isPending || isConfirming) ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Buy Tranche 💸'
          )}
        </button>
        {!isConnected && (
          <span className="text-sm text-red-500">
            Wallet not connected or in the wrong network
          </span>
        )}
      </div>
      {transactionReceipt && <TxReceipt txResult={transactionReceipt} />}
    </div>
  );
};

interface TxReceiptProps {
  txResult: TransactionReceipt | undefined;
}

const TxReceipt: React.FC<TxReceiptProps> = ({ txResult }) => {
  const [copied, setCopied] = useState(false);

  if (!txResult) return null;

  const displayTxResult = (result: TransactionReceipt) => {
    return JSON.stringify(result, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-semibold mb-2">Transaction Receipt</h3>
      <div className="flex items-center mb-2">
        <span className="mr-2">Transaction Hash:</span>
        <span className="font-mono">{txResult.transactionHash}</span>
        <CopyToClipboard text={txResult.transactionHash} onCopy={() => setCopied(true)}>
          <button className="ml-2 text-blue-500 hover:text-blue-700">
            {copied ? "Copied!" : "Copy"}
          </button>
        </CopyToClipboard>
      </div>
      <div className="mb-2">
        <span className="mr-2">Block Number:</span>
        <span className="font-mono">{txResult.blockNumber.toString()}</span>
      </div>
      <div className="mb-2">
        <span className="mr-2">Status:</span>
        <span className={`font-semibold ${txResult.status === "success" ? 'text-green-500' : 'text-red-500'}`}>
          {txResult.status === "success" ? 'Success' : 'Failed'}
        </span>
      </div>
      <details>
        <summary className="cursor-pointer text-blue-500 hover:text-blue-700">View Full Receipt</summary>
        <pre className="mt-2 p-2 bg-gray-200 rounded overflow-x-auto">
          {displayTxResult(txResult)}
        </pre>
      </details>
    </div>
  );
};

export default SaleUI;
