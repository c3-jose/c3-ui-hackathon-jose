<script lang="ts">
  import { onMount } from 'svelte';
  import MapChart from './MapChart.svelte';
  import type { WindTurbine } from '../../types/windturbine.js';

  // Props
  export let turbines: WindTurbine[] = [];
  export let selectedTurbineId: string | null = null;
  export let height: number = 500;
  export let interactive: boolean = true;

  // Component state
  let mapComponent: MapChart;
  let mapMarkers: any[] = [];

  // Calculate map center from turbine locations
  function calculateMapCenter() {
    if (turbines.length === 0) {
      return { lat: 40.9201, lng: -91.6027 }; // Default center
    }

    const avgLat = turbines.reduce((sum, t) => sum + t.latitude, 0) / turbines.length;
    const avgLng = turbines.reduce((sum, t) => sum + t.longitude, 0) / turbines.length;

    return { lat: avgLat, lng: avgLng };
  }

  // Convert turbines to map markers
  function turbinesToMarkers(turbines: WindTurbine[]) {
    return turbines.map(turbine => ({
      id: turbine.id,
      name: turbine.name,
      latitude: turbine.latitude,
      longitude: turbine.longitude,
      status: turbine.active ? 'active' : 'inactive',
      capacity: turbine.ratedCapacityKW / 1000, // Convert to MW
      data: turbine
    }));
  }

  // Handle marker click
  function handleMarkerClick(event: CustomEvent) {
    const { marker } = event.detail;
    const turbine = marker.data as WindTurbine;
    
    // Dispatch custom event for parent components
    if (interactive) {
      const customEvent = new CustomEvent('turbineSelected', {
        detail: { turbine, turbineId: turbine.id }
      });
      document.dispatchEvent(customEvent);
      
      // For navigation, you could also do:
      // window.location.href = `/windturbines/${turbine.id}`;
    }
  }

  // Calculate appropriate zoom level based on turbine spread
  function calculateZoom() {
    if (turbines.length <= 1) return 10;

    const lats = turbines.map(t => t.latitude);
    const lngs = turbines.map(t => t.longitude);
    
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    if (maxSpread > 2) return 6;
    if (maxSpread > 1) return 7;
    if (maxSpread > 0.5) return 8;
    return 9;
  }

  // Reactive updates
  $: mapMarkers = turbinesToMarkers(turbines);
  $: mapCenter = calculateMapCenter();
  $: zoomLevel = calculateZoom();
</script>

<div class="fleet-map-container">
  <div class="mb-4 flex items-center justify-between">
    <div>
      <h3 class="text-xl font-semibold text-gray-900">Fleet Locations</h3>
      <p class="text-sm text-gray-600">
        {turbines.length} turbine{turbines.length !== 1 ? 's' : ''} 
        • {turbines.filter(t => t.active).length} active
        • {turbines.filter(t => !t.active).length} inactive
      </p>
    </div>
    
    <div class="flex gap-2">
      <button class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
        </svg>
        List View
      </button>
      <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"></path>
        </svg>
        Map View
      </button>
    </div>
  </div>

  <MapChart
    bind:this={mapComponent}
    markers={mapMarkers}
    centerLat={mapCenter.lat}
    centerLng={mapCenter.lng}
    zoom={zoomLevel}
    {height}
    {interactive}
    showTooltip={true}
    mapStyle="terrain"
    on:markerClick={handleMarkerClick}
  />

  {#if selectedTurbineId}
    <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {#each turbines as turbine}
        {#if turbine.id === selectedTurbineId}
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-blue-900">{turbine.name}</h4>
              <p class="text-sm text-blue-700">
                {turbine.manufacturer.name} • {(turbine.ratedCapacityKW / 1000).toFixed(1)} MW
              </p>
            </div>
            <a 
              href={`/windturbines/${turbine.id}`}
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
            >
              View Details
            </a>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .fleet-map-container {
    width: 100%;
  }
</style>
