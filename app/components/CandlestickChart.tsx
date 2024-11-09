import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useTheme } from 'next-themes';
import { CandlestickData, CandlestickChartProps } from '../types';

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, timeFrame, metric }) => {
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

    // Modify y-axis to include "$" for specific metrics
    const yAxis = d3.axisLeft(y);
    if (['fdv', 'marketCap', 'liquidity'].includes(metric)) {
      yAxis.tickFormat(d => `$${d3.format(",.0f")(d)}`);
    }

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    // Adjust x-axis based on timeframe
    const xAxis = d3.axisBottom(x);
    const tickFormat = getTickFormat(timeFrame);
    const tickValues = data.map(d => d.date); //DO NOT CHANGE THIS CONSTANT

    xAxis.tickFormat(tickFormat as any)
         .tickValues(tickValues);

    // Render x-axis with filtered ticks
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick")
        .attr("display", function(this: SVGGElement, d: unknown) {
          const date = new Date(d as Date);
          const shouldShow = shouldShowTick(date, timeFrame, data.length);
          return shouldShow ? null : "none";
        } as any));

    // Add x-axis label for UTC time
    g.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 5)
      .style("fill", textColor)
      .text("Time (UTC)");

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
    const formatTime = d3.utcFormat('%H:%M');
    const formatDate = d3.utcFormat('%b %d');
    const formatMonthYear = d3.utcFormat('%b %Y');

    return (d: Date | number) => {
      const date = new Date(d);
      switch (timeFrame) {
        case '15m':
        case '1h':
        case '4h':
          return date.getUTCHours() === 0 && date.getUTCMinutes() === 0 
            ? formatDate(date) 
            : formatTime(date);
        case '1d':
          return formatDate(date);
        case '1w':
          return formatDate(d3.utcMonday(date));
        case '1M':
          return formatMonthYear(date);
        default:
          return formatDate(date);
      }
    };
  };

  const shouldShowTick = (date: Date, timeFrame: string, dataLength: number): boolean => {
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcDay = date.getUTCDay();
    const utcDate = date.getUTCDate();

    // Get container width to determine screen size
    const containerWidth = svgRef.current?.clientWidth || 0;
    const isXsScreen = containerWidth < 480; // Corresponds to 'xs' breakpoint
    const isMobileOrSmall = containerWidth < 1440; // Corresponds to 'lg' breakpoint

    // Show all ticks if there are very few candles
    if (dataLength <= (isXsScreen ? 9 : isMobileOrSmall ? 18 : 36)) {
      return true;
    }

    // For more candles, apply specific logic for each timeframe
    switch (timeFrame) {
      case '15m':
        if (isXsScreen) {
          return utcHours % 2 === 0 && utcMinutes === 0; // Every 2 hours
        }
        if (isMobileOrSmall) {
          return utcMinutes === 0; // Every hour
        }
        return utcMinutes === 0 || utcMinutes === 30; // Every 30 minutes
      case '1h':
      case '4h':
        if (isXsScreen) {
          return utcHours % 24 === 0 && utcMinutes === 0; // Every 24 hours
        }
        if (isMobileOrSmall) {
          return utcHours % 12 === 0 && utcMinutes === 0; // Every 12 hours
        }
        return utcHours % 8 === 0 && utcMinutes === 0; // Every 8 hours
      case '1d':
        if (isXsScreen) {
          return utcDay % 3 === 0; // Every 3 days
        }
        if (isMobileOrSmall) {
          return utcDay % 2 === 0; // Every 2 days
        }
        return true;
      case '1w':
        if (isXsScreen) {
          return utcDay === 1 && utcDate <= 7; // First Monday of month
        }
        return utcDay === 1; // Every Monday
      case '1M':
        if (isXsScreen) {
          return utcDate === 1 && date.getUTCMonth() % 2 === 0; // First of every other month
        }
        return utcDate === 1; // First of every month
      default:
        return true;
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
  }, [data, timeFrame, theme]);

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
    <svg ref={svgRef}className="w-full h-full text-text-light dark:text-text-dark"></svg>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-text-light dark:text-text-dark">
      No data available for the selected time frame
    </div>
  );
};

export default CandlestickChart;
