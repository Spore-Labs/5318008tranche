import React from 'react';

interface TrancheButtonProps {
  trancheIndex: number;
  isAvailable: boolean;
  onBuy: () => void;
  supply: bigint;
  sold: bigint;
  priceDifference: bigint;
}

const TrancheButton: React.FC<TrancheButtonProps> = ({
  trancheIndex,
  isAvailable,
  onBuy,
  supply,
  sold,
  priceDifference,
}) => {
  const soldPercentage = supply > BigInt(0) ? Number((sold * BigInt(10000)) / supply) / 100 : 0;
  const isSoldOut = sold >= supply && supply > BigInt(0);

  return (
    <button
      className={`p-2 rounded-lg ${
        isAvailable ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300'
      } text-white font-bold text-left ${!isAvailable || isSoldOut ? 'cursor-not-allowed' : ''}`}
      onClick={onBuy}
      disabled={!isAvailable || isSoldOut}
      style={{ width: '100%', height: '100px' }}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex justify-between items-center">
          <span className="text-m">Tranche {trancheIndex}</span>
          <span className={`text-m ${isAvailable ? 'text-green-300' : isSoldOut ? 'text-red-300' : 'text-gray-500'}`}>
            <div>
            {isAvailable ? 'Available' : isSoldOut ? 'Sold Out' : 'Not Available'}
            </div>
          </span>
        </div>
        <div className="text-xs">
          <div>Difference from Unlock Price: {(Number(priceDifference) / 100).toFixed(2)}%</div>
          <div>Percentage of Tranche Sold: {soldPercentage.toFixed(2)}%</div>
        </div>
      </div>
    </button>
  );
};

export default TrancheButton;
