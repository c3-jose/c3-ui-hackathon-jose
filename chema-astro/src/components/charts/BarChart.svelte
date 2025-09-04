<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import {
    type ChartDimensions,
    type ChartColors,
    defaultColors,
    defaultMargins,
    createSvgContainer,
    createChartGroup,
    createTooltip,
    animateOnLoad
  } from '../../utils/charts.js';

  // Data interface for bar chart
  interface BarDataPoint {
    label: string;
    value: number;
    color?: string;
  }

  // Props
  export let data: BarDataPoint[] = [];
  export let title: string = '';
  export let yAxisLabel: string = '';
  export let colors: ChartColors = defaultColors;
  export let height: number = 300;
  export let animated: boolean = true;
  export let showTooltip: boolean = true;
  export let horizontal: boolean = false;

  // Component state
  let containerElement: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
  let resizeObserver: ResizeObserver;

  // Chart dimensions
  let dimensions: ChartDimensions;
  let chartWidth: number;
  let chartHeight: number;

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
      margins: horizontal ? 
        { top: 20, right: 30, bottom: 40, left: 80 } : 
        { top: 20, right: 30, bottom: 60, left: 60 }
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

    const chartGroup = createChartGroup(svg, dimensions.margins);

    // Create scales
    let xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number, never>;
    let yScale: d3.ScaleLinear<number, number, never> | d3.ScaleBand<string>;

    if (horizontal) {
      xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) as number])
        .range([0, chartWidth]);

      yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.2);
    } else {
      xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, chartWidth])
        .padding(0.2);

      yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) as number])
        .range([chartHeight, 0]);
    }

    // Add axes
    if (horizontal) {
      // X-axis (bottom)
      chartGroup.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleLinear<number, number, never>))
        .selectAll('text')
        .style('fill', colors.text)
        .style('font-size', '12px');

      // Y-axis (left)
      chartGroup.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleBand<string>))
        .selectAll('text')
        .style('fill', colors.text)
        .style('font-size', '12px');
    } else {
      // X-axis (bottom)
      chartGroup.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale as d3.ScaleBand<string>))
        .selectAll('text')
        .style('fill', colors.text)
        .style('font-size', '12px')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      // Y-axis (left)
      chartGroup.append('g')
        .call(d3.axisLeft(yScale as d3.ScaleLinear<number, number, never>))
        .selectAll('text')
        .style('fill', colors.text)
        .style('font-size', '12px');
    }

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

    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range([colors.primary, colors.secondary, colors.success, colors.warning, colors.error]);

    // Add bars
    const bars = chartGroup.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .style('cursor', 'pointer');

    if (horizontal) {
      bars
        .attr('x', 0)
        .attr('y', d => (yScale as d3.ScaleBand<string>)(d.label)!)
        .attr('height', (yScale as d3.ScaleBand<string>).bandwidth())
        .attr('fill', d => d.color || colorScale(d.label) as string)
        .attr('opacity', 0.8)
        .attr('width', 0); // Start with 0 width for animation

      // Animation
      if (animated) {
        bars.transition()
          .duration(1000)
          .delay((d, i) => i * 100)
          .ease(d3.easeQuadOut)
          .attr('width', d => (xScale as d3.ScaleLinear<number, number, never>)(d.value));
      } else {
        bars.attr('width', d => (xScale as d3.ScaleLinear<number, number, never>)(d.value));
      }
    } else {
      bars
        .attr('x', d => (xScale as d3.ScaleBand<string>)(d.label)!)
        .attr('width', (xScale as d3.ScaleBand<string>).bandwidth())
        .attr('fill', d => d.color || colorScale(d.label) as string)
        .attr('opacity', 0.8)
        .attr('y', chartHeight) // Start from bottom for animation
        .attr('height', 0); // Start with 0 height for animation

      // Animation
      if (animated) {
        bars.transition()
          .duration(1000)
          .delay((d, i) => i * 100)
          .ease(d3.easeQuadOut)
          .attr('y', d => (yScale as d3.ScaleLinear<number, number, never>)(d.value))
          .attr('height', d => chartHeight - (yScale as d3.ScaleLinear<number, number, never>)(d.value));
      } else {
        bars
          .attr('y', d => (yScale as d3.ScaleLinear<number, number, never>)(d.value))
          .attr('height', d => chartHeight - (yScale as d3.ScaleLinear<number, number, never>)(d.value));
      }
    }

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke', colors.primary)
          .attr('stroke-width', 2);

        if (showTooltip && tooltip) {
          tooltip
            .style('visibility', 'visible')
            .html(`
              <div>
                <strong>${d.label}</strong><br/>
                <span>${d.value.toFixed(1)}</span>
              </div>
            `);
        }
      })
      .on('mousemove', function(event) {
        if (showTooltip && tooltip) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');

        if (showTooltip && tooltip) {
          tooltip.style('visibility', 'hidden');
        }
      });

    // Add value labels on bars
    const labels = chartGroup.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', colors.text)
      .style('text-anchor', 'middle')
      .style('opacity', 0);

    if (horizontal) {
      labels
        .attr('x', d => (xScale as d3.ScaleLinear<number, number, never>)(d.value) + 5)
        .attr('y', d => (yScale as d3.ScaleBand<string>)(d.label)! + (yScale as d3.ScaleBand<string>).bandwidth() / 2)
        .attr('dy', '0.35em')
        .text(d => d.value.toFixed(1));
    } else {
      labels
        .attr('x', d => (xScale as d3.ScaleBand<string>)(d.label)! + (xScale as d3.ScaleBand<string>).bandwidth() / 2)
        .attr('y', d => (yScale as d3.ScaleLinear<number, number, never>)(d.value) - 5)
        .text(d => d.value.toFixed(1));
    }

    // Animate labels
    if (animated) {
      labels.transition()
        .duration(1000)
        .delay((d, i) => i * 100 + 500)
        .style('opacity', 1);
    } else {
      labels.style('opacity', 1);
    }
  }

  // Reactive updates
  $: if (svg && data && data.length > 0) {
    drawChart();
  }
</script>

<div class="bar-chart-container">
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
          <p class="text-gray-500 font-medium">No data available</p>
          <p class="text-sm text-gray-400 mt-1">Chart will appear when data is loaded</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .bar-chart-container {
    width: 100%;
  }
  
  .chart-wrapper {
    position: relative;
  }
</style>
