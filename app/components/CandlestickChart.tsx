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
  const textColor = theme === 'dark' ? '#dbd1f5' : '#140a2e'; // Adjust these colors if needed

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svgElement = svgRef.current;
    const containerWidth = svgElement.clientWidth;
    const containerHeight = svgElement.clientHeight;

    const margin = { top: 10, right: 30, bottom: 50, left: 60 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    svg.attr("width", containerWidth)
       .attr("height", containerHeight);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.date.toISOString()))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.low) as number, d3.max(data, d => d.high) as number])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(x);

    // Adjust ticks based on timeFrame
    const formatTime = (date: Date | string) => {
      const d = new Date(date);
      switch (timeFrame) {
        case '5m':
        case '15m':
          return d3.timeFormat("%I:%M %p")(d);
        case '1h':
        case '4h':
          return d3.timeFormat("%I %p")(d);
        case '1d':
        case '1w':
          return d3.timeFormat("%b %d")(d);
        case '1M':
          return d3.timeFormat("%b %Y")(d);
        default:
          return d3.timeFormat("%b %d")(d);
      }
    };

    xAxis.tickFormat(formatTime);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight + 10})`)
      .call(xAxis)
      .attr("class", "text-text-light dark:text-text-dark")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5)
        .tickFormat(d => isCurrency ? `$${d3.format(",.0f")(d)}` : d3.format(",.0f")(d)))
      .attr("class", "text-text-light dark:text-text-dark");

    // Candlesticks
    g.selectAll(".candlestick")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candlestick")
      .each(function(d) {
        const g = d3.select(this);
        const xPos = x(d.date.toISOString()) as number;
        const width = x.bandwidth();

        // Wick
        g.append("line")
          .attr("x1", xPos + width / 2)
          .attr("x2", xPos + width / 2)
          .attr("y1", y(d.high))
          .attr("y2", y(d.low))
          .attr("stroke", d.open > d.close ? "red" : "green");

        // Body
        g.append("rect")
          .attr("x", xPos)
          .attr("y", y(Math.max(d.open, d.close)))
          .attr("width", width)
          .attr("height", Math.abs(y(d.open) - y(d.close)))
          .attr("fill", d.open > d.close ? "red" : "green");
      });
  }, [data, width, height, isCurrency, timeFrame]);

  return <svg ref={svgRef} width={width} height={height} className="w-full h-full text-text-light dark:text-text-dark"></svg>;
};

export default CandlestickChart;
