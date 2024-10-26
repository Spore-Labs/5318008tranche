import { TokenData, CandlestickData } from '../types';

const msPerTimeFrame: { [key: string]: number } = {
  '15m': 15 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000 // Approximation
};

export const aggregateData = (data: TokenData[], timeFrame: string, metric: keyof Omit<TokenData, 'timestamp'>): CandlestickData[] => {
  if (data.length === 0) {
    console.warn('aggregateData: Input data is empty');
    return [];
  }

  const interval = msPerTimeFrame[timeFrame] || msPerTimeFrame['15m'];
  const lastDataPoint = new Date(data[data.length - 1].timestamp);
  let endTime = new Date(lastDataPoint);
  let startTime = new Date(endTime.getTime() - (interval * 120)); // Only keep the latest 120 intervals

  // Adjust start and end times for all timeframes
  const roundToInterval = (date: Date, intervalMs: number) => {
    return new Date(Math.floor(date.getTime() / intervalMs) * intervalMs);
  };

  startTime = roundToInterval(startTime, interval);
  endTime = roundToInterval(new Date(endTime.getTime() + interval), interval);

  if (timeFrame === '1w') {
    // Adjust to start of the week (Monday)
    startTime.setDate(startTime.getDate() - startTime.getDay() + 1);
    endTime.setDate(endTime.getDate() - endTime.getDay() + 1);
  } else if (timeFrame === '1M') {
    // Adjust to start of the month
    startTime.setDate(1);
    endTime.setDate(1);
    endTime.setMonth(endTime.getMonth() + 1);
  }

  const groupedData: Record<number, TokenData[]> = {};
  for (let i = startTime.getTime(); i <= endTime.getTime(); i += interval) {
    groupedData[i] = [];
  }

  data.forEach(d => {
    const timestamp = new Date(d.timestamp).getTime();
    if (timestamp >= startTime.getTime() && timestamp < endTime.getTime()) {
      const key = roundToInterval(new Date(timestamp), interval).getTime();
      if (groupedData[key]) {
        groupedData[key].push(d);
      }
    }
  });

  const result: CandlestickData[] = [];
  let prevClose: number | null = null;

  Object.entries(groupedData).forEach(([timestamp, values]) => {
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
