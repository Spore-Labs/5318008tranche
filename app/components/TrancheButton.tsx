import React from 'react';

interface TrancheButtonProps {
  trancheIndex: number;
  isAvailable: boolean;
  onBuy: () => void;
  supply: bigint;
  sold: bigint;
  priceDifference: bigint;
  isSelected: boolean;
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

  const buttonClass = "w-full py-2 px-4 btn-primary dark:btn-secondary border border-primary-light dark:border-primary-dark text-white rounded-lg transition-colors";

  if (!isAvailable || isSoldOut) {
    return (
      <button className={buttonClass} disabled>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Tranche {trancheIndex}</span>
          <span>{isSoldOut ? 'Sold Out' : 'Not Available'}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      className={buttonClass}
      onClick={onBuy}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold">Tranche {trancheIndex}</span>
        <span className="text-green-300 text-sm">Available</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Price: {(Number(priceDifference) / 100).toFixed(2)}%</span>
        <span>Sold: {soldPercentage.toFixed(2)}%</span>
      </div>
    </button>
  );
};

export default TrancheButton;
