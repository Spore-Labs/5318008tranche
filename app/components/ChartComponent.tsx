import React, { useState, useMemo } from 'react';
import { TokenData } from '../types';
import CandlestickChart from './CandlestickChart';

interface ChartProps {
  data: TokenData[];
  metric: keyof Omit<TokenData, 'timestamp'>;
}

const timeFrames = ['5m', '15m', '1h', '4h', '1d', '1w', '1M'];

const aggregateData = (data: TokenData[], timeFrame: string, metric: keyof Omit<TokenData, 'timestamp'>) => {
  const msPerTimeFrame = {
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
    '1w': 604800000,
    '1M': 2592000000
  };

  const groupedData = data.reduce((acc, d) => {
    const date = new Date(d.timestamp);
    const key = Math.floor(date.getTime() / msPerTimeFrame[timeFrame as keyof typeof msPerTimeFrame]) * msPerTimeFrame[timeFrame as keyof typeof msPerTimeFrame];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(d);
    return acc;
  }, {} as Record<number, TokenData[]>);

  return Object.entries(groupedData).map(([timestamp, values]) => {
    const metricValues = values.map(v => v[metric] as number);
    return {
      date: new Date(Number(timestamp)),
      open: metricValues[0],
      close: metricValues[metricValues.length - 1],
      high: Math.max(...metricValues),
      low: Math.min(...metricValues)
    };
  });
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
      <div className="flex-grow relative" style={{ height: 'calc(100% - 50px)' }}>
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
