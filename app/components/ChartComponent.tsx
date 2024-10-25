import React, { useState, useMemo } from 'react';
import { TokenData } from '../types';
import CandlestickChart from './CandlestickChart';

interface CandlestickData {
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface ChartProps {
  data: TokenData[];
  metric: keyof Omit<TokenData, 'timestamp'>;
}

const timeFrames = ['15m', '1h', '4h', '1d', '1w', '1M'];

const aggregateData = (data: TokenData[], timeFrame: string, metric: keyof Omit<TokenData, 'timestamp'>) => {
  if (data.length === 0) {
    console.warn('aggregateData: Input data is empty');
    return [];
  }

  const msPerTimeFrame: { [key: string]: number } = {
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
    '1w': 604800000,
    '1M': 2592000000
  };

  const interval = msPerTimeFrame[timeFrame] || 900000; // Default to 15m if timeFrame is not found
  const endTime = Math.ceil(new Date(data[data.length - 1].timestamp).getTime() / interval) * interval;
  const startTime = endTime - (interval * 120); // Only keep the latest 120 intervals

  const groupedData: Record<number, TokenData[]> = {};
  for (let i = startTime; i <= endTime; i += interval) {
    groupedData[i] = [];
  }

  data.forEach(d => {
    const timestamp = new Date(d.timestamp).getTime();
    if (timestamp >= startTime && timestamp <= endTime) {
      const key = Math.floor(timestamp / interval) * interval;
      if (groupedData[key]) {
        groupedData[key].push(d);
      }
    }
  });

  const result: CandlestickData[] = [];
  let prevClose: number | null = null;

  Object.entries(groupedData).forEach(([timestamp, values], index) => {
    if (values.length === 0) {
      if (prevClose !== null) {
        result.push({
          date: new Date(Number(timestamp)),
          open: prevClose,
          close: prevClose,
          high: prevClose,
          low: prevClose
        });
      }
    } else {
      const metricValues = values.map(v => Number(v[metric]));
      const candlestick: CandlestickData = {
        date: new Date(Number(timestamp)),
        open: prevClose !== null ? prevClose : metricValues[0],
        close: metricValues[metricValues.length - 1],
        high: Math.max(...metricValues),
        low: Math.min(...metricValues)
      };
      result.push(candlestick);
      prevClose = candlestick.close;
    }
  });

  return result;
};

export const ChartComponent: React.FC<ChartProps> = ({ data, metric }) => {
  const [timeFrame, setTimeFrame] = useState('15m');

  const chartData = useMemo(() => {
    return aggregateData(data, timeFrame, metric);
  }, [data, metric, timeFrame]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-1 mb-1">
        {timeFrames.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeFrame(tf)}
            className={`btn-chart ${
              timeFrame === tf ? 'btn-chart-selected' : ''
            } light dark:dark`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="flex-grow relative" style={{ height: 'calc(100% - 50px)', minHeight: '400px' }}>
        <CandlestickChart 
          data={chartData} 
          width="100%" 
          height="100%" 
          isCurrency={['fdv', 'marketCap', 'liquidity'].includes(metric)} 
          timeFrame={timeFrame} 
        />
      </div>
    </div>
  );
};
