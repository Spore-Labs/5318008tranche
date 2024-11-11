import React from 'react';
import { useReadContract } from 'wagmi';
import { TrancheButtonProps } from '../types';
import contractABI from '../../contractABI.json';
const formatLargeNumber = (num: number): string => {
  const absNum = Math.abs(num);
  if (absNum >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`;
  } else if (absNum >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  } else if (absNum >= 1e3) {
    return `$${(num / 1e3).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
};

const TrancheButton: React.FC<TrancheButtonProps> = ({
  trancheIndex,
  isAvailable,
  onBuy,
  supply,
  sold,
  priceDifference,
  isSelected,
  contractAddress,
}) => {
  const soldPercentage = supply > BigInt(0) ? Number((sold * BigInt(10000)) / supply) / 100 : 0;
  const isSoldOut = sold >= supply && supply > BigInt(0);

  const INITIAL_SUPPLY = BigInt(1_000_000) * BigInt(10 ** 18); // 1,000,000 * 1e18

  const { data: initialPricePerSupply } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'initialPricePerInitialSupply',
  });

  const { data: priceMultiple } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'priceMultiples',
    args: [BigInt(trancheIndex)],
  });

  const { data: ethPrice } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getETHPriceFromUniswap',
  });

  // Calculate unlock FDV
  const unlockFDV = initialPricePerSupply && priceMultiple && ethPrice
    ? (Number(INITIAL_SUPPLY) / 1e18) * 
      (Number(initialPricePerSupply) / 1e18) * 
      Number(priceMultiple) * 
      (Number(ethPrice) / 1e18)
    : null;

  const formattedFDV = unlockFDV ? formatLargeNumber(unlockFDV) : '$0';

  const buttonClass = `w-full btn btn-responsive btn-selectable text-xs xs:text-xs sm:text-sm ${isSelected ? 'selected' : ''}`;

  const buttonContent = (
    <>
      <div className="flex justify-between items-center">
        <span className="font-bold text-xs xs:text-xs sm:text-sm">Tranche {trancheIndex}</span>
        <span className={`text-xs xs:text-xs sm:text-sm ${isSelected ? 'text-white' : isAvailable ? 'text-green-300' : 'text-red-300'}`}>
          {isSelected ? 'Selected' : isSoldOut ? 'Sold Out' : isAvailable ? 'Available' : 'Not Available'}
        </span>
      </div>
      {(!isSoldOut && (isAvailable || window.innerWidth >= 768)) && (
        <div className="flex justify-between text-xs xs:text-xs sm:text-sm">
          <span>
            {isAvailable ? `Unlocked at ${formattedFDV} FDV` : `Locked until ${formattedFDV} FDV`}
          </span>
          <span>Sold: {soldPercentage.toFixed(2)}%</span>
        </div>
      )}
    </>
  );

  return (
    <button 
      className={`
        ${buttonClass} 
        ${(!isAvailable || isSoldOut) ? 'opacity-50' : ''} 
        ${isSoldOut ? 'hidden md:block' : ''}
        ${!isAvailable ? 'hidden md:block' : ''}
      `} 
      onClick={onBuy}
      disabled={!isAvailable || isSoldOut}
    >
      {buttonContent}
    </button>
  );
};

export default TrancheButton;
