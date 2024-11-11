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
  const [isSaleUIOpen, setIsSaleUIOpen] = useState(false);

  const handleTrancheClick = (index: number) => {
    if (selectedTrancheIndex === index) {
      setSelectedTrancheIndex(null);
      setIsSaleUIOpen(false);
    } else {
      setSelectedTrancheIndex(index);
      setIsSaleUIOpen(true);
      onBuyTranche(index);
    }
  };

  return (
    <div className={`
      flex-1 flex flex-col
      bg-background-light dark:bg-background-dark 
      border border-primary-light dark:border-primary-dark 
      rounded-lg p-2 text-xs overflow-y-auto space-y-2 
      transition-all duration-300 ease-in-out
      mt-4
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
            contractAddress={contractAddress}
          />
        ))}
      </div>
      <SaleUI
        contractAddress={contractAddress}
        selectedTrancheIndex={selectedTrancheIndex}
        selectedMaxPriceDifference={selectedTrancheIndex !== null && priceDifference ? Number(priceDifference[selectedTrancheIndex]) : null}
        onRef={onRef}
        isOpen={isSaleUIOpen}
        onClose={() => {
          setIsSaleUIOpen(false);
          setSelectedTrancheIndex(null);
        }}
      />
    </div>
  );
};
