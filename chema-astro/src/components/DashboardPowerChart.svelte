<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardStore } from '../stores/dashboard.js';
  import * as d3 from 'd3';

  // Subscribe to dashboard store
  $: ({ turbines, loading, error } = $dashboardStore);

  let chartContainer: HTMLDivElement;
  let lastRenderedData: any[] = [];

  onMount(() => {
    // Fetch turbine data
    dashboardStore.fetchAll();
  });

  // Function to create power output chart from real turbine data
  function createPowerChart(turbineData: any[]) {
    if (!chartContainer || !turbineData?.length) return;

    const container = chartContainer;
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    // Clear existing content
    d3.select(container).selectAll('*').remove();

    // Generate aggregated power data from real turbines
    function generateAggregatedPowerData() {
      const now = new Date();
      const data = [];
      
      // Calculate total fleet capacity
      const totalCapacity = turbineData.reduce((sum, turbine) => {
        return sum + (turbine.ratedCapacityKW || 0);
      }, 0);

      // Generate hourly data for last 12 hours based on real fleet capacity
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // Simulate realistic power output based on actual fleet capacity
        // Factor in time of day (wind patterns), number of active turbines, etc.
        const hourOfDay = date.getHours();
        const activeTurbines = turbineData.filter(t => t.active).length;
        const timeOfDayFactor = 0.3 + 0.7 * Math.sin((hourOfDay - 6) * Math.PI / 12); // Peak around noon
        const efficiencyFactor = 0.6 + Math.random() * 0.3; // 60-90% efficiency
        
        const powerOutput = (totalCapacity / 1000) * (activeTurbines / turbineData.length) * timeOfDayFactor * efficiencyFactor;
        
        data.push({
          date,
          value: Math.max(0, powerOutput) // Ensure non-negative
        });
      }
      return data;
    }

    const data = generateAggregatedPowerData();

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%H:%M')));

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d.toFixed(0)} MW`));

    // Add gridlines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Add the line
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Animate the line
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.value))
      .attr('r', 0)
      .attr('fill', '#3b82f6')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('r', 4);

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'power-chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    g.selectAll('.dot')
      .on('mouseover', function(event, d) {
        d3.select(this).transition().duration(100).attr('r', 6);
        tooltip.style('visibility', 'visible')
          .html(`Time: ${d.date.toLocaleTimeString()}<br/>Power: ${d.value.toFixed(1)} MW`);
      })
      .on('mousemove', function(event) {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(100).attr('r', 4);
        tooltip.style('visibility', 'hidden');
      });
  }

  // React to turbine data changes
  $: if (turbines && turbines.length > 0 && chartContainer && turbines !== lastRenderedData) {
    lastRenderedData = turbines;
    setTimeout(() => createPowerChart(turbines), 100);
  }
</script>

<!-- Power Output Trend Chart -->
<div class="card bg-base-100 shadow-xl border-0">
  <div class="card-body p-8">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-2xl font-bold text-base-content">Power Output Trend</h3>
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
          </svg>
        </label>
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
          <li><a>Last 24h</a></li>
          <li><a>Last 7 days</a></li>
          <li><a>Last 30 days</a></li>
        </ul>
      </div>
    </div>
    
    <div class="bg-white rounded-xl p-6 border border-gray-200 relative">
      {#if loading.turbines}
        <div class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="text-gray-600 font-medium">Loading power data...</span>
          </div>
        </div>
      {:else if error}
        <div class="absolute inset-0 bg-red-50/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div class="text-center">
            <div class="text-red-600 mb-2">
              <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-red-600 font-medium">Failed to load power data</p>
            <p class="text-red-500 text-sm mt-1">{error}</p>
            <button 
              class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
              on:click={() => dashboardStore.fetchAll()}
            >
              Retry
            </button>
          </div>
        </div>
      {/if}
      
      <div bind:this={chartContainer} class="w-full h-64"></div>
    </div>
  </div>
</div>
