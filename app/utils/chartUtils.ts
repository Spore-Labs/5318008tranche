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
  if (data.length === 0) return [];

  const interval = msPerTimeFrame[timeFrame];
  const latestTimestamp = Math.max(...data.map(d => new Date(d.timestamp).getTime()));
  const endTime = new Date(latestTimestamp);
  const startTime = new Date(latestTimestamp - (71 * interval)); // 72 ticks including the last one

  const roundToInterval = (date: Date): Date => {
    const utcDate = new Date(date.toUTCString());
    switch (timeFrame) {
      case '15m':
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          utcDate.getUTCHours(),
          Math.floor(utcDate.getUTCMinutes() / 15) * 15
        ));
      case '1h':
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          utcDate.getUTCHours()
        ));
      case '4h':
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          Math.floor(utcDate.getUTCHours() / 4) * 4
        ));
      case '1d':
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate()
        ));
      case '1w':
        const daysSinceMonday = (utcDate.getUTCDay() + 6) % 7; // Monday is 0
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate() - daysSinceMonday
        ));
      case '1M':
        return new Date(Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          1
        ));
      default:
        return utcDate;
    }
  };

  // Filter data to only include points within the 72 tick range
  const filteredData = data.filter(d => {
    const timestamp = new Date(d.timestamp);
    return timestamp >= startTime && timestamp <= endTime;
  });

  const groupedData: { [key: number]: TokenData[] } = {};

  // Initialize groupedData with empty arrays for each interval
  for (let i = roundToInterval(startTime).getTime(); i <= endTime.getTime(); i += interval) {
    groupedData[i] = [];
  }

  // Group filtered data into respective intervals
  filteredData.forEach(d => {
    const timestamp = new Date(d.timestamp);
    const key = roundToInterval(timestamp).getTime();
    if (groupedData[key]) {
      groupedData[key].push(d);
    }
  });

  // Create CandlestickData from grouped data
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
