<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { dashboardStore } from '../stores/dashboard.js';
  
  // Subscribe to dashboard store with null checks for SSR
  $: storeData = $dashboardStore || { turbines: [], summary: null, loading: { turbines: false, summary: false }, error: { turbines: null, summary: null } };
  $: ({ turbines, summary, loading, error } = storeData);

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let markersLayer: any = null;

  onMount(async () => {
    // Only fetch data on client-side
    if (typeof window !== 'undefined') {
      // Fetch turbine data for the map
      dashboardStore.fetchAll();
    }
    
    // Dynamically import Leaflet to avoid SSR issues
    const L = await import('leaflet');
    
    // Import Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Initialize the map
    if (mapContainer && !map) {
      // Set default view to center of US (roughly where wind farms are)
      map = L.map(mapContainer).setView([39.8283, -98.5795], 4);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create a layer group for markers
      markersLayer = L.layerGroup().addTo(map);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  // Reactive statement to update markers when turbines data changes (client-side only)
  $: if (typeof window !== 'undefined' && map && markersLayer && turbines && Array.isArray(turbines) && turbines.length > 0) {
    updateMarkers(turbines);
  }

  async function updateMarkers(turbineData: any[]) {
    if (!map || !markersLayer) return;
    
    const L = await import('leaflet');
    
    // Clear existing markers
    markersLayer.clearLayers();

    // Custom icons for active/inactive turbines
    const activeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: #10b981;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const inactiveIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          background-color: #ef4444;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Add markers for each turbine
    turbineData.forEach(turbine => {
      const marker = L.marker([turbine.latitude, turbine.longitude], {
        icon: turbine.active ? activeIcon : inactiveIcon
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
            ${turbine.name}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px;">
            <div>
              <strong>Status:</strong> 
              <span style="color: ${turbine.active ? '#10b981' : '#ef4444'};">
                ${turbine.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div><strong>Manufacturer:</strong> ${turbine.manufacturer.name}</div>
            <div><strong>Country:</strong> ${turbine.manufacturer.country}</div>
            <div><strong>Capacity:</strong> ${(turbine.ratedCapacityKW / 1000).toFixed(1)} MW</div>
            <div><strong>Location:</strong> ${turbine.latitude.toFixed(3)}, ${turbine.longitude.toFixed(3)}</div>
            <div><strong>Built:</strong> ${new Date(turbine.builtDate).getFullYear()}</div>
          </div>
          <div style="margin-top: 12px;">
            <a href="/windturbines/${turbine.id}" 
               style="display: inline-block; padding: 6px 12px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 12px;">
              View Details
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayer.addLayer(marker);
    });

    // Fit map to show all markers if we have turbines
    if (turbineData.length > 0) {
      const group = new L.featureGroup(markersLayer.getLayers());
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }
</script>

<!-- Fleet Map Section - Double Width -->
<div class="card bg-base-100 shadow-xl border-0 mt-8">
  <div class="card-body p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-2xl font-bold text-base-content">Fleet Locations</h3>
        <p class="text-base-content/70 mt-1">Interactive map showing all wind turbine locations and status</p>
      </div>
      {#if loading && !loading.summary && summary}
        <div class="flex gap-2">
          <div class="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{summary.activeTurbines || 0} Active</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>{(summary.totalTurbines || 0) - (summary.activeTurbines || 0)} Inactive</span>
          </div>
        </div>
      {/if}
    </div>
    
    <div class="bg-white rounded-xl p-8 border border-gray-200 relative">
      {#if typeof window !== 'undefined'}
        <div bind:this={mapContainer} class="w-full h-[600px] rounded-lg overflow-hidden"></div>
      {:else}
        <!-- SSR placeholder -->
        <div class="w-full h-[600px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <div class="text-gray-500">Loading map...</div>
        </div>
      {/if}
      
      {#if loading && loading.turbines}
        <div class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="text-lg font-medium text-gray-700">Loading Map Data...</span>
          </div>
        </div>
      {/if}
      
      {#if error && error.turbines}
        <div class="absolute inset-0 bg-red-50/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-red-700">
          <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">Error loading turbines</p>
          <p class="text-sm text-center mb-4">{error.turbines}</p>
          <button on:click={() => typeof window !== 'undefined' && dashboardStore.fetchTurbines()} class="btn btn-sm btn-error btn-outline">Retry</button>
        </div>
      {/if}
    </div>

    <!-- Map Legend -->
    <div class="mt-4 flex items-center justify-center gap-6 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-green-500 rounded-full border border-white shadow"></div>
        <span class="text-gray-600">Active Turbines</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-red-500 rounded-full border border-white shadow"></div>
        <span class="text-gray-600">Inactive Turbines</span>
      </div>
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-gray-500">Click markers for details</span>
      </div>
    </div>
  </div>
</div>

<style>
  /* Ensure Leaflet controls display properly */
  :global(.leaflet-container) {
    font-family: inherit;
  }
  
  :global(.leaflet-popup-content) {
    margin: 8px 12px;
  }
  
  :global(.custom-div-icon) {
    border: none !important;
    background: transparent !important;
  }
</style>
