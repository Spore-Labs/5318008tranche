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
    setSelectedTrancheIndex(index);
    setSelectedMaxPriceDifference(Number(priceDifference[index]) + 500);
    onBuyTranche(index);
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark border border-primary-light dark:border-primary-dark rounded-lg p-2 text-xs overflow-y-auto space-y-2">
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
      <SaleUI
        contractAddress={contractAddress}
        selectedTrancheIndex={selectedTrancheIndex}
        selectedMaxPriceDifference={selectedMaxPriceDifference}
        onRef={onRef}
      />
    </div>
  );
};
