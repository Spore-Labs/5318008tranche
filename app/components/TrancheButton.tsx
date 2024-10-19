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
      className={`btn-secondary p-4 ${!isAvailable || isSoldOut ? 'opacity-50' : ''} shadow-soft hover:shadow-md transition-shadow duration-300`}
      onClick={onBuy}
      disabled={!isAvailable || isSoldOut}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg">Tranche {trancheIndex}</span>
          <span className={`text-sm ${isAvailable ? 'text-green-300' : isSoldOut ? 'text-red-300' : 'text-gray-500'}`}>
            {isAvailable ? 'Available' : isSoldOut ? 'Sold Out' : 'Not Available'}
          </span>
        </div>
        <div className="text-sm">
          <div className="mb-1">Price above Unlock: {(Number(priceDifference) / 100).toFixed(2)}%</div>
          <div>Percentage Sold: {soldPercentage.toFixed(2)}%</div>
        </div>
      </div>
    </button>
  );
};

export default TrancheButton;
