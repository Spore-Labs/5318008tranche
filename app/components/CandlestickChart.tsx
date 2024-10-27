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

    const xBand = d3.scaleBand()
      .domain(data.map(d => d.date.getTime().toString()))
      .range([0, innerWidth])
      .padding(0.2);

    // Generate ticks based on timeFrame
    const ticks = generateTicks(data, timeFrame);

    const yDomain = [
      d3.min(data, d => d.low) as number,
      d3.max(data, d => d.high) as number
    ];
    const yPadding = (yDomain[1] - yDomain[0]) * 0.1;
    const y = d3.scaleLinear()
      .domain([yDomain[0] - yPadding, yDomain[1] + yPadding])
      .range([innerHeight, 0]);

    const yAxis = d3.axisLeft(y);
    if (['fdv_close', 'marketCap_close', 'liquidity_close'].includes(metric)) {
      yAxis.tickFormat(d => `$${d3.format(",.0f")(d)}`);
    }

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis);

    const xAxis = d3.axisBottom(x)
      .tickValues(ticks)
      .tickFormat(getTickFormat(timeFrame) as any);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);

    g.append("text")
      .attr("class", "x-axis-label")
      .attr("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 5)
      .style("fill", textColor)
      .text("Time (UTC)");

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

    const candleWidth = xBand.bandwidth();

    const candlesticks = g.selectAll<SVGGElement, CandlestickData>(".candlestick")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candlestick")
      .attr("transform", d => `translate(${xBand(d.date.getTime().toString())},0)`);

    candlesticks.append("line")
      .attr("class", "wick")
      .attr("x1", candleWidth / 2)
      .attr("x2", candleWidth / 2)
      .attr("y1", d => y(d.high))
      .attr("y2", d => y(d.low))
      .attr("stroke", d => d.open > d.close ? "red" : "green")
      .attr("stroke-width", 1);

    candlesticks.append("rect")
      .attr("class", "body")
      .attr("x", 0)
      .attr("y", d => y(Math.max(d.open, d.close)))
      .attr("width", candleWidth)
      .attr("height", d => Math.max(1, Math.abs(y(d.open) - y(d.close))))
      .attr("fill", d => d.open > d.close ? "red" : "green")
      .attr("stroke", "black")
      .attr("stroke-width", 0.5);
  };

  const generateTicks = (data: CandlestickData[], timeFrame: string): Date[] => {
    const interval = getTickInterval(timeFrame);
    const firstDate = new Date(data[0].date);
    const startOfDay = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), firstDate.getUTCDate()));
    
    return data.filter((d, index) => {
      const timeSinceMidnight = d.date.getTime() - startOfDay.getTime();
      const unitsSinceMidnight = timeSinceMidnight / getTimeframeMilliseconds(timeFrame);
      return unitsSinceMidnight % interval === 0;
    }).map(d => d.date);
  };

  const getTickInterval = (timeFrame: string): number => {
    switch (timeFrame) {
      case '15m': return 2;  // Every 30 minutes
      case '1h': return 2;   // Every 2 hours
      case '4h': return 2;   // Every 8 hours
      case '1d': return 1;   // Every day
      case '1w': return 1;   // Every week
      case '1M': return 1;   // Every month
      default: return 2;
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
      default: return 15 * 60 * 1000;
    }
  };

  const getTickFormat = (timeFrame: string): (d: Date | number) => string => {
    const formatTime = d3.utcFormat('%H:%M');
    const formatDate = d3.utcFormat('%b %d');
    const formatMonthYear = d3.utcFormat('%b %Y');

    return (d: Date | number) => {
      const date = new Date(d);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();

      switch (timeFrame) {
        case '15m':
        case '1h':
        case '4h':
          return hours === 0 && minutes === 0 ? formatDate(date) : formatTime(date);
        case '1d':
        case '1w':
          return formatDate(date);
        case '1M':
          return formatMonthYear(date);
        default:
          return formatDate(date);
      }
    };
  };

  const shouldShowTick = (date: Date, timeFrame: string): boolean => {
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const utcDay = date.getUTCDay();
    const utcDate = date.getUTCDate();

    switch (timeFrame) {
      case '15m':
        return utcMinutes === 0 || utcMinutes === 30;
      case '1h':
        return utcHours % 2 === 0 && utcMinutes === 0;
      case '4h':
        return utcHours % 8 === 0 && utcMinutes === 0;
      case '1d':
        return utcHours === 0 && utcMinutes === 0;
      case '1w':
        return utcDay === 1 && utcHours === 0 && utcMinutes === 0; // Monday
      case '1M':
        return utcDate === 1 && utcHours === 0 && utcMinutes === 0; // First day of the month
      default:
        return true;
    }
  };

  const adjustTickValues = (data: CandlestickData[], timeFrame: string): Date[] => {
    const dataLength = data.length;
    let step: number;

    if (dataLength <= 10) {
      step = 1;
    } else if (dataLength <= 20) {
      step = 2;
    } else if (dataLength <= 40) {
      step = 4;
    } else {
      step = Math.ceil(dataLength / 10);
    }

    return data.filter((_, index) => index % step === 0).map(d => d.date);
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
    <svg ref={svgRef} className="w-full h-full text-text-light dark:text-text-dark"></svg>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-text-light dark:text-text-dark">
      No data available for the selected time frame
    </div>
  );
};

export default CandlestickChart;
