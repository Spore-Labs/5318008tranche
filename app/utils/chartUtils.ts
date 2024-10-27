import { AggregatedTokenData, CandlestickData, ChartProps } from '../types';

export const processAggregatedData = (data: AggregatedTokenData[], metric: ChartProps['metric']): CandlestickData[] => {
    if (data.length === 0) return [];

    const baseMetric = metric.replace('_close', '');

    const processedData = data.map((d, index, array) => {
        const nextOpen = index < array.length - 1 ? Number(array[index + 1][`${baseMetric}_open`]) : Number(d[metric]);
        return {
            date: new Date(d.timestamp),
            open: Number(d[`${baseMetric}_open`]),
            high: Number(d[`${baseMetric}_high`]),
            low: Number(d[`${baseMetric}_low`]),
            close: nextOpen,
            [baseMetric]: Number(d[metric])
        };
    });

    return processedData;
};
