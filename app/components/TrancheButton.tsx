import React from 'react';
import { TrancheButtonProps } from '../types';

const TrancheButton: React.FC<TrancheButtonProps> = ({
  trancheIndex,
  isAvailable,
  onBuy,
  supply,
  sold,
  priceDifference,
  isSelected,
}) => {
  const soldPercentage = supply > BigInt(0) ? Number((sold * BigInt(10000)) / supply) / 100 : 0;
  const isSoldOut = sold >= supply && supply > BigInt(0);

  const buttonClass = `w-full btn btn-responsive btn-selectable text-xs xs:text-xs sm:text-sm ${isSelected ? 'selected' : ''}`;

  if (!isAvailable || isSoldOut) {
    return (
      <button className={`${buttonClass} hidden md:block`} disabled>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-xs">Tranche {trancheIndex}</span>
          <span className="text-xs">{isSoldOut ? 'Sold Out' : 'Not Available'}</span>
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
        <span className="font-bold text-xs xs:text-xs sm:text-sm">Tranche {trancheIndex}</span>
        <span className={`text-xs xs:text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-green-300'}`}>
          {isSelected ? 'Selected' : 'Available'}
        </span>
      </div>
      <div className="flex justify-between text-xs xs:text-xs sm:text-sm">
        <span>Price: {(Number(priceDifference) / 100).toFixed(2)}%</span>
        <span>Sold: {soldPercentage.toFixed(2)}%</span>
      </div>
    </button>
  );
};

export default TrancheButton;
