<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { WindTurbine } from '../types/windturbine.js';

  export let turbine: WindTurbine;
  export let height: string = '300px';
  export let zoom: number = 12;

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let marker: any = null;

  onMount(async () => {
    // Only initialize map on client-side
    if (typeof window !== 'undefined' && mapContainer && turbine) {
      // Dynamically import Leaflet to avoid SSR issues
      const L = await import('leaflet');
      
      // Import Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Initialize map
      map = L.map(mapContainer, {
        center: [turbine.latitude, turbine.longitude],
        zoom: zoom,
        zoomControl: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);

      // Create custom marker icon with inline styles to ensure visibility
      const markerIcon = L.divIcon({
        className: 'custom-turbine-marker',
        html: `
          <div style="
            position: relative; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: 24px; 
            height: 24px;
            background-color: ${turbine.active ? '#22c55e' : '#ef4444'}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
          ">
            <div style="
              width: 8px; 
              height: 8px; 
              background-color: white; 
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add marker with fallback to default icon if custom doesn't work
      try {
        marker = L.marker([turbine.latitude, turbine.longitude], { icon: markerIcon })
          .bindPopup(`
            <div class="font-sans text-gray-800 p-2">
              <h4 class="text-lg font-bold mb-2">${turbine.name}</h4>
              <div class="space-y-1 text-sm">
                <div class="flex items-center">
                  <span class="font-medium mr-2">Status:</span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${turbine.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                    ${turbine.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div><span class="font-medium">Manufacturer:</span> ${turbine.manufacturer.name}</div>
                <div><span class="font-medium">Country:</span> ${turbine.manufacturer.country}</div>
                <div><span class="font-medium">Capacity:</span> ${(turbine.ratedCapacityKW / 1000).toFixed(1)} MW</div>
                <div><span class="font-medium">Coordinates:</span> ${turbine.latitude.toFixed(4)}, ${turbine.longitude.toFixed(4)}</div>
                <div><span class="font-medium">Installed:</span> ${new Date(turbine.installationDate).toLocaleDateString()}</div>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-popup'
          })
          .addTo(map);
      } catch (error) {
        // Fallback to default marker if custom icon fails
        console.log('Using fallback marker icon');
        marker = L.marker([turbine.latitude, turbine.longitude])
          .bindPopup(`
            <div class="font-sans text-gray-800 p-2">
              <h4 class="text-lg font-bold mb-2">${turbine.name}</h4>
              <div class="space-y-1 text-sm">
                <div><span class="font-medium">Status:</span> ${turbine.active ? 'Active' : 'Inactive'}</div>
                <div><span class="font-medium">Manufacturer:</span> ${turbine.manufacturer.name}</div>
                <div><span class="font-medium">Country:</span> ${turbine.manufacturer.country}</div>
                <div><span class="font-medium">Capacity:</span> ${(turbine.ratedCapacityKW / 1000).toFixed(1)} MW</div>
                <div><span class="font-medium">Coordinates:</span> ${turbine.latitude.toFixed(4)}, ${turbine.longitude.toFixed(4)}</div>
              </div>
            </div>
          `)
          .addTo(map);
      }

      // Open popup by default after a short delay to ensure it renders
      setTimeout(() => {
        if (marker) {
          marker.openPopup();
        }
      }, 100);

      // Add zoom controls
      L.control.zoom({
        position: 'topright'
      }).addTo(map);

      // Add scale control
      L.control.scale({
        position: 'bottomleft'
      }).addTo(map);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  // Reactive update when turbine changes
  $: if (map && marker && turbine) {
    updateMarker();
  }

  async function updateMarker() {
    if (!map || !marker || !turbine) return;

    const L = await import('leaflet');

    // Update marker position
    marker.setLatLng([turbine.latitude, turbine.longitude]);
    
    // Update map center
    map.setView([turbine.latitude, turbine.longitude], zoom);
    
    // Update marker icon with new status
    const updatedIcon = L.divIcon({
      className: 'custom-turbine-marker',
      html: `
        <div style="
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          width: 24px; 
          height: 24px;
          background-color: ${turbine.active ? '#22c55e' : '#ef4444'}; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        ">
          <div style="
            width: 8px; 
            height: 8px; 
            background-color: white; 
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    marker.setIcon(updatedIcon);
    
    // Update popup content
    marker.setPopupContent(`
      <div class="font-sans text-gray-800 p-2">
        <h4 class="text-lg font-bold mb-2">${turbine.name}</h4>
        <div class="space-y-1 text-sm">
          <div class="flex items-center">
            <span class="font-medium mr-2">Status:</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${turbine.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
              ${turbine.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div><span class="font-medium">Manufacturer:</span> ${turbine.manufacturer.name}</div>
          <div><span class="font-medium">Country:</span> ${turbine.manufacturer.country}</div>
          <div><span class="font-medium">Capacity:</span> ${(turbine.ratedCapacityKW / 1000).toFixed(1)} MW</div>
          <div><span class="font-medium">Coordinates:</span> ${turbine.latitude.toFixed(4)}, ${turbine.longitude.toFixed(4)}</div>
          <div><span class="font-medium">Installed:</span> ${new Date(turbine.installationDate).toLocaleDateString()}</div>
        </div>
      </div>
    `);
  }
</script>

<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
  <div class="p-4 border-b border-gray-200">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Location</h3>
        <p class="text-sm text-gray-600">Interactive map showing turbine location</p>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        {turbine?.latitude.toFixed(4)}, {turbine?.longitude.toFixed(4)}
      </div>
    </div>
  </div>
  
  <div class="relative">
    {#if typeof window !== 'undefined' && turbine}
      <div bind:this={mapContainer} style="height: {height};" class="w-full"></div>
    {:else}
      <!-- SSR placeholder -->
      <div style="height: {height};" class="w-full bg-gray-100 flex items-center justify-center">
        <div class="flex items-center gap-2 text-gray-500">
          <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Loading map...
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Map Legend -->
  <div class="p-3 bg-gray-50 border-t border-gray-200">
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-gray-600">Active</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <span class="text-gray-600">Inactive</span>
        </div>
      </div>
      <div class="text-gray-500">
        Zoom: {zoom}x
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  /* Global styles to ensure Leaflet marker animations work */
  :global(.leaflet-marker-icon) {
    background: transparent !important;
    border: none !important;
  }

  :global(.custom-turbine-marker) {
    background: transparent !important;
    border: none !important;
  }


  /* Ensure Leaflet popups use our styling */
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  :global(.leaflet-popup-content) {
    margin: 0;
    line-height: 1.4;
  }

  :global(.leaflet-popup-tip) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  :global(.custom-popup .leaflet-popup-close-button) {
    color: #6b7280;
    font-size: 18px;
    padding: 4px;
  }

  :global(.custom-popup .leaflet-popup-close-button:hover) {
    color: #374151;
  }
</style>
