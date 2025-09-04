<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let data: { manufacturer: string; count: number; avgCapacity: number }[] = [];
  export let width: number = 600;
  export let height: number = 300;
  export let title: string = 'Turbines by Manufacturer';
  
  let chartContainer: HTMLDivElement;
  
  onMount(() => {
    if (data.length === 0) {
      // Generate some sample data for demonstration
      data = generateSampleData();
    }
    createChart();
  });
  
  function generateSampleData() {
    return [
      { manufacturer: 'Vestas', count: 45, avgCapacity: 2200 },
      { manufacturer: 'Siemens Gamesa', count: 38, avgCapacity: 2500 },
      { manufacturer: 'Enercon', count: 28, avgCapacity: 1800 },
      { manufacturer: 'GE', count: 22, avgCapacity: 2800 },
      { manufacturer: 'Envision Energy', count: 17, avgCapacity: 2100 }
    ];
  }
  
  function createChart() {
    if (!chartContainer || data.length === 0) return;
    
    // Clear previous chart
    d3.select(chartContainer).selectAll('*').remove();
    
    // Set dimensions and margins
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'var(--bg-secondary)')
      .style('border-radius', 'var(--radius-2)');
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.manufacturer))
      .range([0, innerWidth])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .nice()
      .range([innerHeight, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.manufacturer))
      .range(['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', 'var(--text-secondary)')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
    
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', 'var(--text-secondary)')
      .style('font-size', '12px');
    
    // Style axes
    g.selectAll('.domain, .tick line')
      .style('stroke', 'var(--border-color)');
    
    // Add bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.manufacturer) as number)
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d.count))
      .attr('height', d => innerHeight - yScale(d.count))
      .attr('fill', d => colorScale(d.manufacturer) as string)
      .style('opacity', 0.8)
      .style('cursor', 'pointer');
    
    // Add hover effects
    const tooltip = d3.select(chartContainer)
      .append('div')
      .style('position', 'absolute')
      .style('background', 'var(--bg-primary)')
      .style('border', '1px solid var(--border-color)')
      .style('border-radius', 'var(--radius-2)')
      .style('padding', '8px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 10);
    
    g.selectAll('.bar')
      .on('mouseenter', function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip
          .style('opacity', 1)
          .html(`
            <div style="color: var(--text-primary);">
              <strong>${d.manufacturer}</strong><br/>
              Turbines: ${d.count}<br/>
              Avg Capacity: ${(d.avgCapacity / 1000).toFixed(1)} MW
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseleave', function() {
        d3.select(this).style('opacity', 0.8);
        tooltip.style('opacity', 0);
      });
    
    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(data)
      .enter().append('text')
      .attr('class', 'bar-label')
      .attr('x', d => (xScale(d.manufacturer) as number) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--text-primary)')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d.count);
    
    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .style('font-size', '12px')
      .text('Number of Turbines');
    
    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', 'var(--text-secondary)')
      .style('font-size', '12px')
      .text('Manufacturer');
  }
  
  // Reactive statement to redraw chart when data changes
  $: if (chartContainer && data) {
    createChart();
  }
</script>

<div class="chart-wrapper">
  <h3 class="chart-title">{title}</h3>
  <div class="chart-container" bind:this={chartContainer}></div>
</div>

<style>
  .chart-wrapper {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-4);
  }
  
  .chart-title {
    margin: 0 0 var(--size-3) 0;
    color: var(--text-primary);
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
  }
  
  .chart-container {
    position: relative;
    width: 100%;
    min-height: 300px;
  }
</style>
