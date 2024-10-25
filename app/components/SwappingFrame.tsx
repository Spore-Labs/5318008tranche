import { useState } from 'react';
import TrancheButton from './TrancheButton';
import SaleUI from './SaleUI';

interface SwappingFrameProps {
  showUniswap?: boolean;
  availableTranches: boolean[];
  trancheSupply: bigint[];
  trancheSold: bigint[];
  priceDifference: bigint[];
  contractAddress: `0x${string}`;
  onBuyTranche: (index: number) => void;
  onRef: (ref: { updateTrancheIndex: (index: number) => void, updateMaxPriceDifference: (diff: number) => void } | null) => void;
}

export const SwappingFrame: React.FC<SwappingFrameProps> = ({
  availableTranches,
  trancheSupply,
  trancheSold,
  priceDifference,
  contractAddress,
  onBuyTranche,
  onRef,
}) => {
  const [activeTab, setActiveTab] = useState<'uniswap' | 'tranches'>('uniswap');
  const [selectedTrancheIndex, setSelectedTrancheIndex] = useState<number | null>(null);
  const [selectedMaxPriceDifference, setSelectedMaxPriceDifference] = useState<number | null>(null);

  const handleTrancheClick = (index: number) => {
    setSelectedTrancheIndex(index);
    setSelectedMaxPriceDifference(Number(priceDifference[index]) + 500);
    onBuyTranche(index);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex">
        <button
          onClick={() => setActiveTab('uniswap')}
          className={`flex-1 btn-tab dark:btn-tab-dark ${
            activeTab === 'uniswap' ? 'selected' : ''
          }`}
        >
          Uniswap
        </button>
        <button
          onClick={() => setActiveTab('tranches')}
          className={`flex-1 btn-tab dark:btn-tab-dark ${
            activeTab === 'tranches' ? 'selected' : ''
          }`}
        >
          Tranches
        </button>
      </div>
      
      <div className="flex-grow bg-background-light dark:bg-background-dark border border-primary-light dark:border-primary-dark rounded-b-lg p-2 text-xs overflow-y-auto space-y-2">
        {activeTab === 'uniswap' ? (
          <div className="h-full flex justify-center items-center">
            <iframe
              src={`https://app.uniswap.org/#/swap?outputCurrency=0xbb493890c5a30a047576f9114081cb65038c651c&exactField=output&exactAmount=1`}
              height="660px"
              width="100%"
              style={{ border: 'none', borderRadius: '10px', maxWidth: '420px' }}
              title="Uniswap Interface"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col space-y-2">
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
        )}
      </div>
    </div>
  );
};
