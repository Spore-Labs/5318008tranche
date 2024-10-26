import React, { useState, useMemo } from 'react';
import { ChartProps } from '../types';
import CandlestickChart from './CandlestickChart';
import { aggregateData } from '../utils/chartUtils';

const timeFrames = ['15m', '1h', '4h', '1d', '1w', '1M'];

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
          timeFrame={timeFrame} 
          metric={metric}
        />
      </div>
    </div>
  );
};
