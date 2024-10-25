import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';

interface CandlestickData {
  date: Date;
  open: number;
  close: number;
  high: number;
  low: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  width: string | number;
  height: string | number;
  isCurrency: boolean;
  timeFrame: string;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, width, height, isCurrency, timeFrame }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#dbd1f5' : '#140a2e';

  const renderChart = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: CandlestickData[]) => {
    svg.selectAll("*").remove();

    const svgElement = svg.node() as SVGSVGElement;
    const containerWidth = svgElement.clientWidth;
    const containerHeight = svgElement.clientHeight;

    const margin = { top: 40, right: 40, bottom: 40, left: 80 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = containerHeight - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(data, d => d.date) as [Date, Date];
    const xDomain: [Date, Date] = [
      d3.timeMillisecond.offset(xExtent[0], -getTimeframeMilliseconds(timeFrame) / 2),
      d3.timeMillisecond.offset(xExtent[1], getTimeframeMilliseconds(timeFrame) / 2)
    ];

    const x = d3.scaleTime()
      .domain(xDomain)
      .range([0, innerWidth]);

    const yDomain = [
      d3.min(data, d => d.low) as number,
      d3.max(data, d => d.high) as number
    ];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
    const y = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([innerHeight, 0]);

    // Adjust x-axis based on timeframe
    const xAxis = d3.axisBottom(x);
    const tickFormat = getTickFormat(timeFrame);
    const tickValues = data.map(d => d.date); // Use actual data points for ticks

    xAxis.tickFormat(tickFormat as any)
         .tickValues(tickValues);

    const yAxis = d3.axisLeft(y);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(() => ""));

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(() => ""));

    g.selectAll(".grid line")
      .style("stroke", "lightgrey")
      .style("stroke-opacity", 0.7)
      .style("shape-rendering", "crispEdges");
    g.selectAll(".grid path")
      .style("stroke-width", 0);

    // Calculate candlestick width
    const candleWidth = (innerWidth / data.length) * 0.8; // 80% of available space

    const candlesticks = g.selectAll<SVGGElement, CandlestickData>(".candlestick")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candlestick")
      .attr("transform", d => `translate(${x(d.date)},0)`);

    candlesticks.append("line")
      .attr("class", "wick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => y(d.high))
      .attr("y2", d => y(d.low))
      .attr("stroke", d => d.open > d.close ? "red" : "green")
      .attr("stroke-width", 1);

    candlesticks.append("rect")
      .attr("class", "body")
      .attr("x", -candleWidth / 2)
      .attr("y", d => y(Math.max(d.open, d.close)))
      .attr("width", candleWidth)
      .attr("height", d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr("fill", d => d.open > d.close ? "red" : "green")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);
  };

  // Helper functions
  const getTickFormat = (timeFrame: string): (d: Date | number) => string => {
    switch (timeFrame) {
      case '15m':
      case '1h':
      case '4h':
        return (d: Date | number) => d3.timeFormat('%H:%M')(new Date(d));
      case '1d':
        return (d: Date | number) => d3.timeFormat('%b %d')(new Date(d));
      case '1w':
        return (d: Date | number) => d3.timeFormat('%b %d')(d3.timeMonday(new Date(d)));
      case '1M':
        return (d: Date | number) => d3.timeFormat('%b %Y')(new Date(d));
      default:
        return (d: Date | number) => d3.timeFormat('%b %d')(new Date(d));
    }
  };

  const getTickValues = (data: CandlestickData[], timeFrame: string): Date[] => {
    const extent = d3.extent(data, d => d.date) as [Date, Date];
    if (!extent[0] || !extent[1]) return [];
    
    const timeframeMs = getTimeframeMilliseconds(timeFrame);
    const start = d3.timeMillisecond.offset(extent[0], -timeframeMs);
    const end = d3.timeMillisecond.offset(extent[1], timeframeMs);
    
    switch (timeFrame) {
      case '15m':
        return d3.timeMinute.every(30)?.range(start, end) || [];
      case '1h':
        return d3.timeHour.every(2)?.range(start, end) || [];
      case '4h':
        return d3.timeHour.every(4)?.range(start, end) || [];
      case '1d':
        return d3.timeDay.every(1)?.range(start, end) || [];
      case '1w':
        return d3.timeWeek.every(1)?.range(start, end) || [];
      case '1M':
        return d3.timeMonth.every(1)?.range(start, end) || [];
      default:
        return d3.timeDay.range(start, end);
    }
  };

  const getCandleWidth = (chartWidth: number, dataLength: number, timeFrame: string): number => {
    const baseWidth = chartWidth / dataLength;
    switch (timeFrame) {
      case '15m':
      case '1h':
      case '4h':
        return baseWidth * 0.8; // Reduce width for shorter timeframes
      case '1d':
      case '1w':
      case '1M':
        return baseWidth * 0.9;
      default:
        return baseWidth * 0.9;
    }
  };

  const getTimeframeMilliseconds = (timeFrame: string): number => {
    switch (timeFrame) {
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '4h': return 4 * 60 * 60 * 1000;
      case '1d': return 24 * 60 * 60 * 1000;
      case '1w': return 7 * 24 * 60 * 60 * 1000;
      case '1M': return 30 * 24 * 60 * 60 * 1000; // Approximation
      default: return 24 * 60 * 60 * 1000;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    renderChart(svg, data);
  }, [data, width, height, isCurrency, timeFrame, theme]);

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current && data.length > 0) {
        const svg = d3.select(svgRef.current);
        renderChart(svg, data);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, renderChart]);

  return data.length > 0 ? (
    <svg ref={svgRef} width={width} height={height} className="w-full h-full text-text-light dark:text-text-dark"></svg>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-text-light dark:text-text-dark">
      No data available for the selected time frame
    </div>
  );
};

export default CandlestickChart;
