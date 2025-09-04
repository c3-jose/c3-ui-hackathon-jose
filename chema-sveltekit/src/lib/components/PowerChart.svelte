<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let data: { timestamp: string; value: number }[] = [];
  export let width: number = 800;
  export let height: number = 400;
  export let title: string = 'Power Output';
  
  let chartContainer: HTMLDivElement;
  let containerWidth: number;
  
  onMount(() => {
    if (data.length === 0) {
      // Generate some sample data for demonstration
      data = generateSampleData();
    }
    createChart();
  });
  
  function generateSampleData() {
    const now = new Date();
    const sampleData = [];
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      // Simulate realistic power output with some randomness
      const baseOutput = 1500; // kW
      const variation = Math.sin(i * 0.3) * 300 + Math.random() * 200 - 100;
      const value = Math.max(0, baseOutput + variation);
      
      sampleData.push({
        timestamp: timestamp.toISOString(),
        value: Math.round(value)
      });
    }
    
    return sampleData;
  }
  
  function createChart() {
    if (!chartContainer || data.length === 0) return;
    
    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();
    
    // Use container width or fallback to prop width
    const chartWidth = containerWidth || width;
    
    // Set dimensions and margins with better spacing
    const margin = { top: 30, right: 40, bottom: 60, left: 80 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', height)
      .style('background', 'var(--color-bg-primary)')
      .style('border-radius', 'var(--border-radius-default)');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Parse data
    const parsedData = data.map(d => ({
      timestamp: new Date(d.timestamp),
      value: d.value
    }));
    
    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.timestamp) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.value) as number])
      .nice()
      .range([innerHeight, 0]);
    
    // Line generator
    const line = d3.line<{ timestamp: Date; value: number }>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add axes with improved styling
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat('%H:%M') as any)
        .tickSize(-innerHeight)
        .tickPadding(10));
    
    xAxis.selectAll('text')
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', '14px')
      .style('font-weight', '500');
    
    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10));
    
    yAxis.selectAll('text')
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', '14px')
      .style('font-weight', '500');
    
    // Style axes with better contrast
    g.selectAll('.domain')
      .style('stroke', 'var(--color-border-color)')
      .style('stroke-width', '2px');
    
    g.selectAll('.tick line')
      .style('stroke', 'var(--color-border-color)')
      .style('stroke-width', '1px')
      .style('opacity', '0.3');
    
    // Add gradient for area under the curve
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'powerGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', yScale(0))
      .attr('x2', 0).attr('y2', yScale(d3.max(parsedData, d => d.value) as number));
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'var(--color-info)')
      .attr('stop-opacity', 0.4);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'var(--color-info)')
      .attr('stop-opacity', 0.05);
    
    // Add area
    const area = d3.area<{ timestamp: Date; value: number }>()
      .x(d => xScale(d.timestamp))
      .y0(yScale(0))
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
    
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'url(#powerGradient)')
      .attr('d', area);
    
    // Add line with better styling
    g.append('path')
      .datum(parsedData)
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-info)')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('d', line);
    
    // Add dots with better styling
    g.selectAll('.dot')
      .data(parsedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.timestamp))
      .attr('cy', d => yScale(d.value))
      .attr('r', 4)
      .attr('fill', 'var(--color-info)')
      .attr('stroke', 'var(--color-bg-primary)')
      .attr('stroke-width', 2)
      .style('opacity', 0);
    
    // Add interactivity with better tooltip
    const tooltip = d3.select(chartContainer)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'var(--color-bg-primary)')
      .style('border', '1px solid var(--color-border-color)')
      .style('border-radius', 'var(--border-radius-default)')
      .style('padding', '12px')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('color', 'var(--color-text-primary)')
      .style('box-shadow', 'var(--shadow-default)')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10);
    
    g.selectAll('.dot')
      .on('mouseenter', function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip
          .style('opacity', 1)
          .html(`
            <div>
              <strong>${d.value} kW</strong><br/>
              ${d3.timeFormat('%H:%M')(d.timestamp)}
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 0);
        tooltip.style('opacity', 0);
      });
    
    // Add labels with better styling
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 20)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Power Output (kW)');
    
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', 'var(--color-text-primary)')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Time');
  }
  
  // Reactive statement to redraw chart when data or container size changes
  $: if (chartContainer && data) {
    createChart();
  }
  
  $: if (containerWidth) {
    createChart();
  }
</script>

<div class="chart-wrapper" bind:clientWidth={containerWidth}>
  <h3 class="chart-title">{title}</h3>
  <div class="chart-container" bind:this={chartContainer}></div>
</div>

<style>
  .chart-wrapper {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    width: 100%;
    box-shadow: var(--shadow-default);
  }
  
  .chart-title {
    margin: 0 0 var(--size-4) 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
    text-align: center;
  }
  
  .chart-container {
    position: relative;
    width: 100%;
    min-height: 400px;
    overflow: hidden;
  }
</style>
