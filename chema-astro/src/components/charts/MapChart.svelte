<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';

  // Map marker interface
  interface MapMarker {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    status?: 'active' | 'inactive' | 'warning';
    capacity?: number;
    data?: any;
  }

  // Props
  export let markers: MapMarker[] = [];
  export let centerLat: number = 40.9201;
  export let centerLng: number = -91.6027;
  export let zoom: number = 8;
  export let height: number = 400;
  export let showTooltip: boolean = true;
  export let interactive: boolean = true;
  export let mapStyle: 'satellite' | 'terrain' | 'roadmap' = 'terrain';

  // Component state
  let containerElement: HTMLDivElement;
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
  let resizeObserver: ResizeObserver;
  let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>;
  let currentZoom: number = zoom;

  // Map dimensions and scales
  let width: number = 600;
  let projection: d3.GeoProjection;
  let path: d3.GeoPath;

  // Enhanced Geographic Data
  const iowaGeography = {
    "type": "FeatureCollection",
    "features": [
      // Iowa state boundary
      {
        "type": "Feature",
        "properties": {"name": "Iowa", "type": "state"},
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-96.639704, 43.501391], [-96.639704, 42.859859], [-96.456685, 42.859859], 
            [-96.436414, 42.752552], [-96.415019, 42.584491], [-96.350464, 42.434115], 
            [-96.315460, 42.394166], [-96.229191, 42.299767], [-96.127625, 42.194699], 
            [-96.062241, 42.134732], [-95.919266, 42.032837], [-95.854311, 41.941017], 
            [-95.837345, 41.872956], [-95.826576, 41.781870], [-95.833618, 41.715705], 
            [-95.828285, 41.654282], [-95.801392, 41.533048], [-95.774025, 41.478686], 
            [-95.686325, 41.401294], [-95.642181, 41.350624], [-95.599808, 41.263073], 
            [-95.573090, 41.183918], [-95.549729, 41.062684], [-95.537255, 40.992701], 
            [-95.503945, 40.923252], [-95.454712, 40.863820], [-95.425644, 40.813150], 
            [-95.418602, 40.767299], [-95.425644, 40.713472], [-95.453596, 40.661892], 
            [-95.473867, 40.618576], [-95.491951, 40.571815], [-95.508017, 40.518523], 
            [-95.521608, 40.469394], [-95.534640, 40.415567], [-95.543387, 40.361740], 
            [-95.548720, 40.308449], [-95.547603, 40.255157], [-95.542270, 40.201864], 
            [-95.533522, 40.149107], [-95.523870, 40.097527], [-95.513101, 40.046482], 
            [-95.501745, 39.996347], [-95.489829, 39.947218], [-95.476797, 39.898624], 
            [-95.462648, 39.850565], [-95.447382, 39.803041], [-95.430999, 39.756052], 
            [-95.414616, 39.709064], [-95.397674, 39.662611], [-95.380732, 39.616693], 
            [-95.363231, 39.571310], [-95.345172, 39.526462], [-95.326555, 39.482149], 
            [-95.307938, 39.438371], [-95.288762, 39.395128], [-95.269028, 39.352420], 
            [-95.248735, 39.310246], [-95.227884, 39.268607], [-95.206474, 39.227503], 
            [-95.184506, 39.186933], [-95.161979, 39.146897], [-95.138893, 39.107396], 
            [-95.115249, 39.068429], [-95.091046, 39.029996], [-95.066284, 38.992098], 
            [-95.040964, 38.954734], [-95.015085, 38.917904], [-94.988647, 38.881609], 
            [-94.961651, 38.845848], [-94.934096, 38.810621], [-94.905982, 38.775928], 
            [-94.877309, 38.741770], [-94.848077, 38.708145], [-94.818286, 38.675055], 
            [-94.787935, 38.642498], [-90.639984, 40.375307], [-90.140061, 40.378143], 
            [-90.140061, 40.436681], [-90.147103, 40.494302], [-90.158989, 40.551388], 
            [-90.175931, 40.607939], [-90.197909, 40.663954], [-90.224922, 40.719434], 
            [-90.256970, 40.774378], [-90.294054, 40.828787], [-90.336172, 40.882661], 
            [-90.383326, 40.935999], [-90.435515, 40.988802], [-90.492738, 41.041070], 
            [-90.554996, 41.092803], [-90.622288, 41.144001], [-90.694614, 41.194663], 
            [-90.771975, 41.244790], [-90.854369, 41.294382], [-90.941798, 41.343439], 
            [-91.034260, 41.391960], [-91.131756, 41.439947], [-91.234286, 41.487398], 
            [-91.341849, 41.534315], [-91.454446, 41.580696], [-91.572076, 41.626542], 
            [-91.694740, 41.671853], [-91.822437, 41.716629], [-91.955168, 41.760870], 
            [-92.092932, 41.804576], [-92.235729, 41.847747], [-92.383560, 41.890383], 
            [-92.536424, 41.932484], [-92.694321, 41.974050], [-92.857252, 42.015081], 
            [-93.025216, 42.055577], [-93.198213, 42.095538], [-93.376244, 42.134964], 
            [-93.559308, 42.173855], [-93.747405, 42.212211], [-93.940535, 42.250032], 
            [-94.138699, 42.287318], [-94.341896, 42.324069], [-94.550126, 42.360285], 
            [-94.763389, 42.395966], [-94.981685, 42.431112], [-95.205014, 42.465723], 
            [-95.433376, 42.499799], [-95.666771, 42.533340], [-95.905199, 42.566346], 
            [-96.148660, 42.598817], [-96.397153, 42.630753], [-96.639704, 43.501391]
          ]]
        }
      },
      // Major rivers
      {
        "type": "Feature",
        "properties": {"name": "Mississippi River", "type": "river"},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-90.140061, 40.375307], [-90.155, 40.45], [-90.168, 40.52], [-90.178, 40.59],
            [-90.185, 40.66], [-90.190, 40.73], [-90.193, 40.80], [-90.195, 40.87],
            [-90.196, 40.94], [-90.196, 41.01], [-90.195, 41.08], [-90.193, 41.15],
            [-90.190, 41.22], [-90.186, 41.29], [-90.181, 41.36], [-90.175, 41.43],
            [-90.168, 41.50], [-90.160, 41.57], [-90.151, 41.64], [-90.141, 41.71],
            [-90.130, 41.78], [-90.118, 41.85], [-90.105, 41.92], [-90.091, 41.99],
            [-90.076, 42.06], [-90.060, 42.13], [-90.043, 42.20], [-90.025, 42.27],
            [-90.006, 42.34], [-89.986, 42.41], [-89.965, 42.48], [-89.943, 42.55],
            [-89.920, 42.62], [-89.896, 42.69], [-89.871, 42.76], [-89.845, 42.83],
            [-89.818, 42.90], [-89.790, 42.97], [-89.761, 43.04], [-89.731, 43.11],
            [-89.700, 43.18], [-89.668, 43.25], [-89.635, 43.32], [-89.601, 43.39],
            [-89.566, 43.46], [-89.530, 43.50]
          ]
        }
      },
      {
        "type": "Feature", 
        "properties": {"name": "Missouri River", "type": "river"},
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-95.905199, 42.566346], [-95.85, 42.52], [-95.80, 42.48], [-95.75, 42.44],
            [-95.70, 42.40], [-95.65, 42.36], [-95.60, 42.32], [-95.55, 42.28],
            [-95.50, 42.24], [-95.45, 42.20], [-95.40, 42.16], [-95.35, 42.12],
            [-95.30, 42.08], [-95.25, 42.04], [-95.20, 42.00], [-95.15, 41.96],
            [-95.10, 41.92], [-95.05, 41.88], [-95.00, 41.84], [-94.95, 41.80],
            [-94.90, 41.76], [-94.85, 41.72], [-94.80, 41.68], [-94.75, 41.64],
            [-94.70, 41.60], [-94.65, 41.56], [-94.60, 41.52], [-94.55, 41.48],
            [-94.50, 41.44], [-94.45, 41.40], [-94.40, 41.36], [-94.35, 41.32],
            [-94.30, 41.28], [-94.25, 41.24], [-94.20, 41.20], [-94.15, 41.16],
            [-94.10, 41.12], [-94.05, 41.08], [-94.00, 41.04], [-93.95, 41.00]
          ]
        }
      },
      // Cities
      {
        "type": "Feature",
        "properties": {"name": "Des Moines", "type": "city", "population": 215472},
        "geometry": {
          "type": "Point",
          "coordinates": [-93.6091, 41.5868]
        }
      },
      {
        "type": "Feature",
        "properties": {"name": "Cedar Rapids", "type": "city", "population": 133562},
        "geometry": {
          "type": "Point",
          "coordinates": [-91.6778, 42.0084]
        }
      },
      {
        "type": "Feature",
        "properties": {"name": "Davenport", "type": "city", "population": 101724},
        "geometry": {
          "type": "Point",
          "coordinates": [-90.5776, 41.5236]
        }
      },
      // Counties (simplified)
      {
        "type": "Feature",
        "properties": {"name": "Polk County", "type": "county"},
        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [-93.8, 41.4], [-93.4, 41.4], [-93.4, 41.8], [-93.8, 41.8], [-93.8, 41.4]
          ]]
        }
      }
    ]
  };

  onMount(() => {
    if (showTooltip) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'map-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('font-size', '14px')
        .style('font-weight', '500')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
        .style('max-width', '250px');
    }

    setupMap();
    
    resizeObserver = new ResizeObserver(() => {
      if (containerElement) {
        updateDimensions();
        drawMap();
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
    width = containerElement?.clientWidth || 600;
  }

  function setupMap() {
    if (!containerElement) return;
    
    updateDimensions();
    
    // Clear existing content
    d3.select(containerElement).selectAll('*').remove();

    // Create SVG
    svg = d3.select(containerElement)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'map-svg');

    // Setup projection and path
    projection = d3.geoMercator()
      .center([centerLng, centerLat])
      .scale(calculateScale())
      .translate([width / 2, height / 2]);

    path = d3.geoPath().projection(projection);

    drawMap();
  }

  function calculateScale(): number {
    // Dynamically calculate scale based on zoom level and container size
    const baseScale = Math.min(width, height) * 50;
    return baseScale * Math.pow(2, currentZoom - 8);
  }

  function updateProjection() {
    if (!projection) return;
    
    projection
      .center([centerLng, centerLat])
      .scale(calculateScale())
      .translate([width / 2, height / 2]);
  }

  function drawMap() {
    if (!svg) return;

    // Update projection with current zoom
    updateProjection();

    // Clear previous content
    svg.selectAll('*').remove();

    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', getBackgroundColor());

    // Create map group
    const mapGroup = svg.append('g').attr('class', 'map-group');

    // Draw base map (simplified background)
    drawBaseMap(mapGroup);

    // Draw grid lines
    drawGrid(mapGroup);

    // Draw markers
    drawMarkers(mapGroup);

    // Add zoom behavior if interactive
    if (interactive) {
      addZoomBehavior();
    }
  }

  function getBackgroundColor(): string {
    switch (mapStyle) {
      case 'satellite': return '#2d4a22';
      case 'terrain': return '#f8fdf8';
      case 'roadmap': return '#f8fafc';
      default: return '#f8fdf8';
    }
  }

  function drawBaseMap(mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const geographicGroup = mapGroup.append('g').attr('class', 'geographic-features');
    
    // Draw state boundaries
    geographicGroup.selectAll('.state-boundary')
      .data(iowaGeography.features.filter(f => f.properties.type === 'state'))
      .enter()
      .append('path')
      .attr('class', 'state-boundary')
      .attr('d', path)
      .attr('fill', getAreaColor())
      .attr('stroke', '#8b7355')
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);
    
    // Draw county boundaries
    geographicGroup.selectAll('.county-boundary')
      .data(iowaGeography.features.filter(f => f.properties.type === 'county'))
      .enter()
      .append('path')
      .attr('class', 'county-boundary')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);

    // Draw rivers
    geographicGroup.selectAll('.river')
      .data(iowaGeography.features.filter(f => f.properties.type === 'river'))
      .enter()
      .append('path')
      .attr('class', 'river')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#4f83cc')
      .attr('stroke-width', d => currentZoom > 8 ? 3 : 2)
      .attr('opacity', 0.7);

    // Draw cities
    geographicGroup.selectAll('.city')
      .data(iowaGeography.features.filter(f => f.properties.type === 'city'))
      .enter()
      .append('circle')
      .attr('class', 'city')
      .attr('cx', d => {
        const point = projection(d.geometry.coordinates);
        return point ? point[0] : 0;
      })
      .attr('cy', d => {
        const point = projection(d.geometry.coordinates);
        return point ? point[1] : 0;
      })
      .attr('r', d => {
        const pop = d.properties.population;
        if (pop > 200000) return currentZoom > 8 ? 8 : 6;
        if (pop > 100000) return currentZoom > 8 ? 6 : 4;
        return currentZoom > 8 ? 4 : 3;
      })
      .attr('fill', '#374151')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8);

    // Add city labels (only at higher zoom levels)
    if (currentZoom > 8) {
      geographicGroup.selectAll('.city-label')
        .data(iowaGeography.features.filter(f => f.properties.type === 'city'))
        .enter()
        .append('text')
        .attr('class', 'city-label')
        .attr('x', d => {
          const point = projection(d.geometry.coordinates);
          return point ? point[0] : 0;
        })
        .attr('y', d => {
          const point = projection(d.geometry.coordinates);
          return point ? point[1] - 12 : 0;
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('fill', '#374151')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('paint-order', 'stroke')
        .text(d => d.properties.name);
    }
  }

  function getAreaColor(): string {
    switch (mapStyle) {
      case 'satellite': return '#5a8a6b';
      case 'terrain': return '#f0f9f0';
      case 'roadmap': return '#f0f0f0';
      default: return '#f0f9f0';
    }
  }

  function drawGrid(mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const gridGroup = mapGroup.append('g').attr('class', 'grid-group');

    // Calculate grid range based on zoom level
    const gridSpacing = currentZoom > 10 ? 0.1 : currentZoom > 8 ? 0.2 : 0.5;
    const gridRange = currentZoom > 10 ? 1 : currentZoom > 8 ? 2 : 3;
    
    const latRange = d3.range(
      Math.floor((centerLat - gridRange) / gridSpacing) * gridSpacing,
      Math.ceil((centerLat + gridRange) / gridSpacing) * gridSpacing + gridSpacing,
      gridSpacing
    );
    
    const lngRange = d3.range(
      Math.floor((centerLng - gridRange) / gridSpacing) * gridSpacing,
      Math.ceil((centerLng + gridRange) / gridSpacing) * gridSpacing + gridSpacing,
      gridSpacing
    );

    // Draw latitude lines
    gridGroup.selectAll('.lat-line')
      .data(latRange)
      .enter()
      .append('line')
      .attr('class', 'lat-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => {
        const point = projection([centerLng, d]);
        return point ? point[1] : 0;
      })
      .attr('y2', d => {
        const point = projection([centerLng, d]);
        return point ? point[1] : 0;
      })
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.4);

    // Draw longitude lines
    gridGroup.selectAll('.lng-line')
      .data(lngRange)
      .enter()
      .append('line')
      .attr('class', 'lng-line')
      .attr('x1', d => {
        const point = projection([d, centerLat]);
        return point ? point[0] : 0;
      })
      .attr('x2', d => {
        const point = projection([d, centerLat]);
        return point ? point[0] : 0;
      })
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#d1d5db')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.4);
  }

  function drawMarkers(mapGroup: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const markersGroup = mapGroup.append('g').attr('class', 'markers-group');

    // Draw marker shadows first
    markersGroup.selectAll('.marker-shadow')
      .data(markers)
      .enter()
      .append('circle')
      .attr('class', 'marker-shadow')
      .attr('cx', d => {
        const point = projection([d.longitude, d.latitude]);
        return point ? point[0] + 2 : 0;
      })
      .attr('cy', d => {
        const point = projection([d.longitude, d.latitude]);
        return point ? point[1] + 2 : 0;
      })
      .attr('r', 8)
      .attr('fill', 'rgba(0, 0, 0, 0.2)')
      .attr('opacity', 0);

    // Draw main markers
    const markerElements = markersGroup.selectAll('.marker')
      .data(markers)
      .enter()
      .append('g')
      .attr('class', 'marker')
      .attr('transform', d => {
        const point = projection([d.longitude, d.latitude]);
        return point ? `translate(${point[0]}, ${point[1]})` : 'translate(0, 0)';
      })
      .style('cursor', interactive ? 'pointer' : 'default');

    // Marker circles
    markerElements.append('circle')
      .attr('r', 0)
      .attr('fill', d => getMarkerColor(d.status))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 3)
      .attr('opacity', 0.9)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .ease(d3.easeElasticOut)
      .attr('r', 8);

    // Marker icons (wind turbine symbol)
    markerElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#ffffff')
      .attr('opacity', 0)
      .text('⚡')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 500)
      .attr('opacity', 1);

    // Pulsing animation for active markers
    markerElements.filter(d => d.status === 'active')
      .append('circle')
      .attr('r', 8)
      .attr('fill', 'none')
      .attr('stroke', getMarkerColor('active'))
      .attr('stroke-width', 2)
      .attr('opacity', 0.7)
      .call(function(selection) {
        function pulse() {
          selection
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .attr('r', 20)
            .attr('opacity', 0)
            .on('end', function() {
              d3.select(this).attr('r', 8).attr('opacity', 0.7);
              pulse();
            });
        }
        pulse();
      });

    // Add interactions
    if (interactive) {
      markerElements
        .on('mouseover', function(event, d) {
          // Scale up marker
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', 12);

          // Show shadow
          markersGroup.select(`.marker-shadow:nth-child(${markers.indexOf(d) + 1})`)
            .transition()
            .duration(200)
            .attr('opacity', 1);

          // Show tooltip
          if (showTooltip && tooltip) {
            tooltip
              .style('visibility', 'visible')
              .html(`
                <div>
                  <div style="font-weight: bold; margin-bottom: 8px;">${d.name}</div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #9ca3af;">Status:</span> 
                    <span style="color: ${getMarkerColor(d.status)}; font-weight: bold;">${d.status || 'Unknown'}</span>
                  </div>
                  ${d.capacity ? `<div style="margin-bottom: 4px;"><span style="color: #9ca3af;">Capacity:</span> ${d.capacity.toFixed(1)} MW</div>` : ''}
                  <div style="margin-bottom: 4px;">
                    <span style="color: #9ca3af;">Location:</span> ${d.latitude.toFixed(4)}, ${d.longitude.toFixed(4)}
                  </div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 8px;">Click for details</div>
                </div>
              `);
          }
        })
        .on('mousemove', function(event) {
          if (showTooltip && tooltip) {
            tooltip
              .style('top', (event.pageY - 10) + 'px')
              .style('left', (event.pageX + 15) + 'px');
          }
        })
        .on('mouseout', function(event, d) {
          // Scale down marker
          d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', 8);

          // Hide shadow
          markersGroup.select(`.marker-shadow:nth-child(${markers.indexOf(d) + 1})`)
            .transition()
            .duration(200)
            .attr('opacity', 0);

          // Hide tooltip
          if (showTooltip && tooltip) {
            tooltip.style('visibility', 'hidden');
          }
        })
        .on('click', function(event, d) {
          // Dispatch custom event for marker click
          const detail = { marker: d, coordinates: [d.longitude, d.latitude] };
          containerElement.dispatchEvent(new CustomEvent('markerClick', { detail }));
        });
    }

    // Animate shadows
    markersGroup.selectAll('.marker-shadow')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100 + 200)
      .attr('opacity', 0.3);
  }

  function getMarkerColor(status?: string): string {
    switch (status) {
      case 'active': return '#059669';
      case 'inactive': return '#dc2626';
      case 'warning': return '#d97706';
      default: return '#6b7280';
    }
  }

  function addZoomBehavior() {
    zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        const { transform } = event;
        svg.select('.map-group')
          .attr('transform', transform);
      });

    svg.call(zoomBehavior);
  }

  function zoomIn() {
    if (!svg || !zoomBehavior) return;
    currentZoom = Math.min(currentZoom + 1, 12);
    redrawMap();
  }

  function zoomOut() {
    if (!svg || !zoomBehavior) return;
    currentZoom = Math.max(currentZoom - 1, 4);
    redrawMap();
  }

  function redrawMap() {
    // Smoothly transition to new zoom level
    drawMap();
  }

  // Reactive updates
  $: if (svg && markers && markers.length > 0) {
    drawMap();
  }
  
  // Update zoom when prop changes
  $: {
    currentZoom = zoom;
    if (svg) {
      drawMap();
    }
  }
</script>

<div class="map-container">
  <div 
    bind:this={containerElement}
    class="map-wrapper w-full relative"
    style="height: {height}px;"
  >
    {#if !markers || markers.length === 0}
      <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div class="text-center">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <p class="text-gray-500 font-medium">No locations to display</p>
          <p class="text-sm text-gray-400 mt-1">Add markers to see them on the map</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Map Controls -->
  <div class="absolute top-4 right-4 flex flex-col gap-2">
    <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div class="flex flex-col gap-1">
        <button 
          class="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          on:click={zoomIn}
          title="Zoom in"
          disabled={currentZoom >= 12}
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </button>
        
        <div class="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-600">
          {currentZoom}
        </div>
        
        <button 
          class="w-8 h-8 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          on:click={zoomOut}
          title="Zoom out"
          disabled={currentZoom <= 4}
        >
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Map Legend -->
  <div class="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
    <h4 class="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-green-600"></div>
        <span class="text-xs text-gray-600">Active</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-orange-600"></div>
        <span class="text-xs text-gray-600">Warning</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-600"></div>
        <span class="text-xs text-gray-600">Inactive</span>
      </div>
    </div>
  </div>
</div>

<style>
  .map-container {
    width: 100%;
    position: relative;
  }
  
  .map-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }

  :global(.map-svg) {
    display: block;
    width: 100%;
    height: 100%;
    background: #f8fafc;
  }

  :global(.map-tooltip) {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.4;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:disabled:hover {
    background-color: #f3f4f6 !important;
  }
</style>
