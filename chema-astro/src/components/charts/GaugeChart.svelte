<script lang="ts">
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  // Props
  export let value: number = 0;
  export let min: number = 0;
  export let max: number = 100;
  export let title: string = '';
  export let unit: string = '%';
  export let size: number = 200;
  export let colors: string[] = ['#dc2626', '#d97706', '#059669']; // Red, Orange, Green
  export let animated: boolean = true;

  // Component state
  let containerElement: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  // Chart properties
  const radius = size / 2 - 20;
  const angleRange = Math.PI * 1.5; // 270 degrees
  const startAngle = -Math.PI * 0.75; // Start at -135 degrees

  onMount(() => {
    setupGauge();
  });

  function setupGauge() {
    if (!containerElement) return;

    // Clear existing content
    d3.select(containerElement).selectAll('*').remove();

    // Create SVG
    svg = d3.select(containerElement)
      .append('svg')
      .attr('width', size)
      .attr('height', size)
      .attr('class', 'gauge-svg');

    const g = svg.append('g')
      .attr('transform', `translate(${size/2}, ${size/2})`);

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', `gauge-gradient-${Math.random().toString(36).substr(2, 9)}`)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', -radius).attr('y1', 0)
      .attr('x2', radius).attr('y2', 0);

    colors.forEach((color, i) => {
      gradient.append('stop')
        .attr('offset', `${(i / (colors.length - 1)) * 100}%`)
        .attr('stop-color', color);
    });

    // Background arc
    const backgroundArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(startAngle + angleRange);

    g.append('path')
      .datum({})
      .attr('d', backgroundArc)
      .attr('fill', '#e5e7eb')
      .attr('opacity', 0.3);

    // Value arc
    const valueArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(startAngle);

    const valuePath = g.append('path')
      .datum({})
      .attr('fill', `url(#gauge-gradient-${gradient.attr('id').split('-').pop()})`)
      .attr('d', valueArc.endAngle(startAngle));

    // Needle
    const needle = g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -radius + 30)
      .attr('stroke', '#374151')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('transform', `rotate(${angleToRotation(startAngle)})`);

    // Center circle
    g.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 8)
      .attr('fill', '#374151');

    // Value text
    const valueText = g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('y', 30)
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text('0');

    // Unit text
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('y', 50)
      .style('font-size', '14px')
      .style('fill', '#6b7280')
      .text(unit);

    // Scale markers
    const scaleData = d3.range(min, max + 1, (max - min) / 5);
    const scaleGroup = g.append('g').attr('class', 'scale');

    scaleGroup.selectAll('.tick')
      .data(scaleData)
      .enter()
      .append('g')
      .attr('class', 'tick')
      .attr('transform', d => {
        const angle = valueToAngle(d);
        return `rotate(${angleToRotation(angle)})`;
      })
      .each(function(d) {
        const tick = d3.select(this);
        
        // Tick line
        tick.append('line')
          .attr('x1', 0)
          .attr('y1', -radius + 10)
          .attr('x2', 0)
          .attr('y2', -radius + 20)
          .attr('stroke', '#9ca3af')
          .attr('stroke-width', 2);

        // Tick label
        tick.append('text')
          .attr('y', -radius + 5)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('fill', '#6b7280')
          .style('font-weight', '500')
          .text(d);
      });

    // Animation
    if (animated) {
      updateGauge(0, false);
      setTimeout(() => updateGauge(value, true), 500);
    } else {
      updateGauge(value, false);
    }
  }

  function valueToAngle(val: number): number {
    const normalizedValue = (val - min) / (max - min);
    return startAngle + (normalizedValue * angleRange);
  }

  function angleToRotation(angle: number): number {
    return (angle * 180) / Math.PI;
  }

  function updateGauge(newValue: number, animate: boolean = true) {
    if (!svg) return;

    const clampedValue = Math.max(min, Math.min(max, newValue));
    const targetAngle = valueToAngle(clampedValue);
    const targetRotation = angleToRotation(targetAngle);

    const valueArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(targetAngle);

    const duration = animate ? 1500 : 0;

    // Update arc
    svg.select('path:nth-of-type(2)')
      .transition()
      .duration(duration)
      .ease(d3.easeElasticOut)
      .attrTween('d', function() {
        const currentEndAngle = this.getAttribute('data-end-angle') || startAngle;
        const interpolate = d3.interpolate(+currentEndAngle, targetAngle);
        return function(t) {
          const angle = interpolate(t);
          this.setAttribute('data-end-angle', angle.toString());
          return d3.arc()
            .innerRadius(radius - 20)
            .outerRadius(radius)
            .startAngle(startAngle)
            .endAngle(angle)({});
        };
      });

    // Update needle
    svg.select('line')
      .transition()
      .duration(duration)
      .ease(d3.easeElasticOut)
      .attr('transform', `rotate(${targetRotation})`);

    // Update value text
    svg.select('text')
      .transition()
      .duration(duration)
      .ease(d3.easeQuadOut)
      .tween('text', function() {
        const currentValue = +this.textContent || 0;
        const interpolate = d3.interpolate(currentValue, clampedValue);
        return function(t) {
          this.textContent = interpolate(t).toFixed(1);
        };
      });
  }

  // Reactive updates
  $: if (svg) {
    updateGauge(value, true);
  }
</script>

<div class="gauge-container">
  {#if title}
    <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
  {/if}
  
  <div 
    bind:this={containerElement}
    class="gauge-wrapper flex justify-center"
  >
    <!-- Chart will be rendered here -->
  </div>
</div>

<style>
  .gauge-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .gauge-wrapper {
    position: relative;
  }

  :global(.gauge-svg) {
    display: block;
  }
</style>
