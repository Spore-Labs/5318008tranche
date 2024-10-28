import React, { useState } from 'react';
import TrancheButton from './TrancheButton';
import SaleUI from './SaleUI';
import { SwappingFrameProps } from '../types';

export const SwappingFrame: React.FC<SwappingFrameProps> = ({
  availableTranches,
  trancheSupply,
  trancheSold,
  priceDifference,
  contractAddress,
  onBuyTranche,
  onRef,
}) => {
  const [selectedTrancheIndex, setSelectedTrancheIndex] = useState<number | null>(null);
  const [selectedMaxPriceDifference, setSelectedMaxPriceDifference] = useState<number | null>(null);

  const handleTrancheClick = (index: number) => {
    if (selectedTrancheIndex === index) {
      setSelectedTrancheIndex(null);
      setSelectedMaxPriceDifference(null);
    } else {
      setSelectedTrancheIndex(index);
      setSelectedMaxPriceDifference(Number(priceDifference[index]) + 500);
      onBuyTranche(index);
    }
  };

  // Count available tranches for mobile sizing
  const availableCount = availableTranches.filter(isAvailable => isAvailable).length;

  return (
    <div className={`
      h-auto md:h-full flex flex-col 
      bg-background-light dark:bg-background-dark 
      border border-primary-light dark:border-primary-dark 
      rounded-lg p-2 text-xs overflow-y-auto space-y-2 
      transition-all duration-300 ease-in-out
      ${selectedTrancheIndex !== null ? 'xs:min-h-[500px] sm:min-h-[500px]' : ''}
    `}>
      <div className="flex flex-col space-y-2">
        {availableTranches.map((isAvailable, index) => (
          <TrancheButton
            key={index}
            trancheIndex={index}
            isAvailable={isAvailable}
            onBuy={() => handleTrancheClick(index)}
            supply={trancheSupply[index]}
            sold={trancheSold[index]}
            priceDifference={priceDifference[index]}
            isSelected={selectedTrancheIndex === index}
          />
        ))}
      </div>
      <div className={`
        transition-all duration-300 ease-in-out
        ${selectedTrancheIndex === null ? 'h-0 opacity-0' : 'opacity-100'}
      `}>
        <SaleUI
          contractAddress={contractAddress}
          selectedTrancheIndex={selectedTrancheIndex}
          selectedMaxPriceDifference={selectedMaxPriceDifference}
          onRef={onRef}
        />
      </div>
    </div>
  );
};
