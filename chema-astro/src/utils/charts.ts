import * as d3 from 'd3';

// Chart configuration types
export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margins: ChartMargins;
}

export interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  grid: string;
  text: string;
}

// Default professional chart styling
export const defaultColors: ChartColors = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  grid: '#e5e7eb',
  text: '#374151'
};

export const defaultMargins: ChartMargins = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 60
};

// Chart utility functions
export function createSvgContainer(
  container: HTMLElement,
  dimensions: ChartDimensions
): d3.Selection<SVGSVGElement, unknown, null, undefined> {
  // Clear existing content
  d3.select(container).selectAll('*').remove();
  
  return d3.select(container)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
    .attr('class', 'chart-svg');
}

export function createChartGroup(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  margins: ChartMargins
): d3.Selection<SVGGElement, unknown, null, undefined> {
  return svg.append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);
}

// Time scale utilities
export function createTimeScale(
  data: DataPoint[],
  width: number
): d3.ScaleTime<number, number, never> {
  return d3.scaleTime()
    .domain(d3.extent(data, d => d.date) as [Date, Date])
    .range([0, width]);
}

// Linear scale utilities
export function createLinearScale(
  data: DataPoint[],
  height: number,
  padding: number = 0.1
): d3.ScaleLinear<number, number, never> {
  const [min, max] = d3.extent(data, d => d.value) as [number, number];
  const paddingValue = (max - min) * padding;
  
  return d3.scaleLinear()
    .domain([min - paddingValue, max + paddingValue])
    .range([height, 0]);
}

// Axis utilities
export function createTimeAxis(
  scale: d3.ScaleTime<number, number, never>,
  height: number
): d3.Selection<SVGGElement, unknown, null, undefined> {
  return d3.axisBottom(scale)
    .tickFormat(d3.timeFormat('%H:%M'))
    .ticks(6);
}

export function createValueAxis(
  scale: d3.ScaleLinear<number, number, never>
): d3.Axis<d3.NumberValue> {
  return d3.axisLeft(scale)
    .tickFormat(d3.format('.1f'))
    .ticks(5);
}

// Grid utilities
export function addGrid(
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number, never>,
  yScale: d3.ScaleLinear<number, number, never>,
  width: number,
  height: number,
  colors: ChartColors
): void {
  // Horizontal grid lines
  chartGroup.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(yScale.ticks(5))
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', colors.grid)
    .attr('stroke-width', 1)
    .attr('opacity', 0.3);

  // Vertical grid lines
  chartGroup.append('g')
    .attr('class', 'grid')
    .selectAll('line')
    .data(xScale.ticks(6))
    .enter()
    .append('line')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', colors.grid)
    .attr('stroke-width', 1)
    .attr('opacity', 0.3);
}

// Tooltip utilities
export function createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
  return d3.select('body')
    .append('div')
    .attr('class', 'chart-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '6px')
    .style('font-size', '12px')
    .style('font-weight', '500')
    .style('pointer-events', 'none')
    .style('z-index', '1000');
}

// Animation utilities
export function animateOnLoad<T extends d3.BaseType>(
  selection: d3.Selection<T, any, any, any>,
  duration: number = 1000
): d3.Selection<T, any, any, any> {
  return selection
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .ease(d3.easeQuadOut)
    .style('opacity', 1);
}

// Responsive chart utilities
export function makeResponsive(
  container: HTMLElement,
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
): void {
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  svg
    .attr('width', containerWidth)
    .attr('height', containerHeight)
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
}
