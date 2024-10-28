import React, { useState, useEffect, useCallback } from 'react';
import { ChartProps, AggregatedTokenData, CandlestickData } from '../types';
import CandlestickChart from './CandlestickChart';
import { processAggregatedData } from '../utils/chartUtils';

const timeFrames = ['15m', '1h', '4h', '1d', '1w', '1M'];

export const ChartComponent: React.FC<ChartProps> = ({ metric }) => {
  const [rawChartData, setRawChartData] = useState<CandlestickData[]>([]);
  const [filledChartData, setFilledChartData] = useState<CandlestickData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState('15m');

  const fillDataGaps = useCallback((data: CandlestickData[]): CandlestickData[] => {
    if (data.length < 2) return data;

    const timeFrameMilliseconds = getTimeFrameMilliseconds(timeFrame);
    let filledData: CandlestickData[] = [];
    
    for (let i = 0; i < data.length - 1; i++) {
      filledData.push(data[i]);
      
      const currentDate = new Date(data[i].date);
      const nextDate = new Date(data[i + 1].date);
      const timeDiff = nextDate.getTime() - currentDate.getTime();
      
      if (timeDiff > timeFrameMilliseconds) {
        const gapsToFill = Math.floor(timeDiff / timeFrameMilliseconds) - 1;
        const closeValue = data[i].close;
        
        for (let j = 1; j <= gapsToFill; j++) {
          const filledDate = new Date(currentDate.getTime() + j * timeFrameMilliseconds);
          filledData.push({
            date: filledDate,
            open: closeValue,
            high: closeValue,
            low: closeValue,
            close: closeValue
          });
        }
      }
    }
    
    // Add the last data point
    filledData.push(data[data.length - 1]);
    
    return filledData;
  }, [timeFrame]);

  // Helper function to get milliseconds for each time frame
  const getTimeFrameMilliseconds = (timeFrame: string): number => {
    switch (timeFrame) {
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      case '1w': return 7 * 24 * 60 * 60 * 1000;
      case '1M': return 30 * 24 * 60 * 60 * 1000; // Approximation
      default: return 15 * 60 * 1000; // Default to 15 minutes
    }
  };

  const fetchHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(`/api/historical-token-data?timeFrame=${timeFrame}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AggregatedTokenData[] = await response.json();
      
      const processedData = processAggregatedData(data, metric);
      setRawChartData(processedData);
      setError(null);
    } catch (error) {
      setError('Failed to fetch historical data. Please try again later.');
    }
  }, [timeFrame, metric]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  useEffect(() => {
    if (rawChartData.length > 0) {
      const filled = fillDataGaps(rawChartData);
      setFilledChartData(filled);
    }
  }, [rawChartData, fillDataGaps]);

  const handleTimeFrameChange = (newTimeFrame: typeof timeFrames[number]) => {
    setTimeFrame(newTimeFrame);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 mb-1">
        {timeFrames.map(tf => (
          <button
            key={tf}
            onClick={() => handleTimeFrameChange(tf)}
            className={`btn-chart text-xs xs:text-xs sm:text-sm ${timeFrame === tf ? 'selected' : ''}`}
            disabled={timeFrame === tf}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="flex-grow relative pb-[150px] xs:pb-[150px] sm:pb-[150px] md:pb-0" style={{ minHeight: '300px' }}>
        <CandlestickChart 
          data={filledChartData} 
          timeFrame={timeFrame} 
          metric={metric}
        />
      </div>
    </div>
  );
};
