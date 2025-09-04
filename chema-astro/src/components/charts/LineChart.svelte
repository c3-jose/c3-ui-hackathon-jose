<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import {
    type DataPoint,
    type ChartDimensions,
    type ChartColors,
    defaultColors,
    defaultMargins,
    createSvgContainer,
    createChartGroup,
    createTimeScale,
    createLinearScale,
    createTimeAxis,
    createValueAxis,
    addGrid,
    createTooltip,
    animateOnLoad,
    makeResponsive
  } from '../../utils/charts.js';

  // Props
  export let data: DataPoint[] = [];
  export let title: string = '';
  export let yAxisLabel: string = '';
  export let colors: ChartColors = defaultColors;
  export let height: number = 300;
  export let animated: boolean = true;
  export let showGrid: boolean = true;
  export let showTooltip: boolean = true;

  // Component state
  let containerElement: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
  let resizeObserver: ResizeObserver;

  // Chart dimensions
  let dimensions: ChartDimensions;
  let chartWidth: number;
  let chartHeight: number;

  // Scales
  let xScale: d3.ScaleTime<number, number, never>;
  let yScale: d3.ScaleLinear<number, number, never>;

  onMount(() => {
    if (showTooltip) {
      tooltip = createTooltip();
    }
    setupChart();
    
    // Setup responsive behavior
    resizeObserver = new ResizeObserver(() => {
      if (containerElement) {
        updateDimensions();
        drawChart();
      }
    });
    resizeObserver.observe(containerElement);
  });

  onDestroy(() => {
    if (tooltip) {
      tooltip.remove();
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  function updateDimensions() {
    const containerWidth = containerElement?.clientWidth || 600;
    dimensions = {
      width: containerWidth,
      height,
      margins: defaultMargins
    };
    chartWidth = dimensions.width - dimensions.margins.left - dimensions.margins.right;
    chartHeight = dimensions.height - dimensions.margins.top - dimensions.margins.bottom;
  }

  function setupChart() {
    if (!containerElement || !data.length) return;
    
    updateDimensions();
    svg = createSvgContainer(containerElement, dimensions);
    drawChart();
  }

  function drawChart() {
    if (!svg || !data.length) return;

    // Clear previous chart
    svg.selectAll('*').remove();

    // Create scales
    xScale = createTimeScale(data, chartWidth);
    yScale = createLinearScale(data, chartHeight);

    // Create chart group
    const chartGroup = createChartGroup(svg, dimensions.margins);

    // Add grid
    if (showGrid) {
      addGrid(chartGroup, xScale, yScale, chartWidth, chartHeight, colors);
    }

    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(createTimeAxis(xScale, chartHeight))
      .selectAll('text')
      .style('fill', colors.text)
      .style('font-size', '12px');

    chartGroup.append('g')
      .call(createValueAxis(yScale))
      .selectAll('text')
      .style('fill', colors.text)
      .style('font-size', '12px');

    // Add Y-axis label
    if (yAxisLabel) {
      chartGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - dimensions.margins.left)
        .attr('x', 0 - (chartHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', colors.text)
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(yAxisLabel);
    }

    // Create line generator
    const line = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add area fill
    const area = d3.area<DataPoint>()
      .x(d => xScale(d.date))
      .y0(chartHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'line-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', chartHeight);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', colors.primary)
      .attr('stop-opacity', 0.05);

    // Add area path
    const areaPath = chartGroup.append('path')
      .datum(data)
      .attr('fill', 'url(#line-gradient)')
      .attr('d', area);

    // Add line path
    const linePath = chartGroup.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors.primary)
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    // Add data points
    const dots = chartGroup.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 4)
      .attr('fill', colors.primary)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add tooltip interactions
    if (showTooltip && tooltip) {
      dots
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6);

          tooltip
            .style('visibility', 'visible')
            .html(`
              <div>
                <strong>${d.label || 'Value'}</strong><br/>
                <span>${d.value.toFixed(2)} MW</span><br/>
                <span>${d3.timeFormat('%H:%M - %b %d')(d.date)}</span>
              </div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4);

          tooltip.style('visibility', 'hidden');
        });
    }

    // Animation
    if (animated) {
      // Animate line drawing
      const totalLength = (linePath.node() as SVGPathElement).getTotalLength();
      linePath
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

      // Animate area
      animateOnLoad(areaPath, 1500);

      // Animate dots
      dots
        .attr('r', 0)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 100)
        .ease(d3.easeElasticOut)
        .attr('r', 4);
    }
  }

  // Reactive updates
  $: if (svg && data && data.length > 0) {
    drawChart();
  }
</script>

<div class="line-chart-container">
  {#if title}
    <h3 class="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
  {/if}
  
  <div 
    bind:this={containerElement}
    class="chart-wrapper w-full"
    style="height: {height}px;"
  >
    {#if !data || data.length === 0}
      <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div class="text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p class="text-gray-500 font-medium">No data available</p>
          <p class="text-sm text-gray-400 mt-1">Chart will appear when data is loaded</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .line-chart-container {
    width: 100%;
  }
  
  .chart-wrapper {
    position: relative;
  }

  :global(.chart-svg) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :global(.chart-tooltip) {
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
</style>
