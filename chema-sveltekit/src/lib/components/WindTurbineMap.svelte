<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import type { WindTurbine } from '$lib/types';

  export let turbines: WindTurbine[] = [];
  export let height = '400px';
  export let center: [number, number] = [40.0, -95.0]; // Default center over US midwest
  export let zoom = 6;
  export let showControls = true;
  export let clustered = true;

  // Ensure turbines is always a valid array
  $: safeTurbines = Array.isArray(turbines) ? turbines.filter(t => t) : [];

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let L: any = null;
  let markers: any[] = [];
  let markerGroup: any = null;

  onMount(async () => {
    if (!browser) return;

    try {
      // Dynamic import of Leaflet
      L = await import('leaflet');
      
      // Import Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      initializeMap();
    } catch (error) {
      console.error('Error loading map:', error);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  function initializeMap() {
    if (!L || !mapContainer) return;

    // Initialize map
    map = L.map(mapContainer, {
      zoomControl: showControls,
      attributionControl: true,
    }).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Create marker group
    markerGroup = L.layerGroup().addTo(map);

    // Add turbine markers
    updateMarkers();
  }

  function updateMarkers() {
    if (!L || !map || !markerGroup) return;

    // Clear existing markers
    markerGroup.clearLayers();
    markers = [];

    if (safeTurbines.length === 0) return;

    // Create custom wind turbine icon
    const turbineIcon = L.divIcon({
      html: `
        <div class="turbine-marker" style="
          background: var(--color-accent);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
      `,
      className: 'custom-turbine-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });

    // Add markers for each turbine
    safeTurbines.forEach((turbine) => {
      if (turbine && turbine.latitude && turbine.longitude) {
        const marker = L.marker([turbine.latitude, turbine.longitude], {
          icon: turbineIcon
        });

        // Create popup content
        const popupContent = `
          <div class="turbine-popup" style="
            min-width: 200px;
            font-family: var(--font-family-default);
          ">
            <h4 style="
              margin: 0 0 8px 0;
              color: var(--color-text-primary);
              font-size: 14px;
              font-weight: 600;
            ">${turbine.name}</h4>
            <div style="
              display: grid;
              gap: 4px;
              font-size: 12px;
              color: var(--color-text-secondary);
            ">
              <div><strong>Manufacturer:</strong> ${turbine.manufacturer?.name || 'Unknown'}</div>
              <div><strong>Capacity:</strong> ${turbine.ratedCapacityKW?.toLocaleString() || 'N/A'} kW</div>
              <div><strong>Status:</strong> 
                <span style="
                  color: ${turbine.active ? 'var(--color-success)' : 'var(--color-error)'};
                  font-weight: 500;
                ">${turbine.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div><strong>Installed:</strong> ${turbine.installationDate ? new Date(turbine.installationDate).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div style="
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid var(--color-border-color);
            ">
              <button 
                onclick="window.location.href='/windturbines/${turbine.id}'"
                style="
                  background: var(--color-accent);
                  color: white;
                  border: none;
                  border-radius: 4px;
                  padding: 6px 12px;
                  font-size: 11px;
                  cursor: pointer;
                  font-weight: 500;
                "
              >View Details</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markerGroup.addLayer(marker);
        markers.push(marker);
      }
    });

    // Auto-fit map to show all markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  // Reactive update when turbines change
  $: if (safeTurbines && map) {
    updateMarkers();
  }
</script>

<div class="wind-turbine-map-container">
  <div 
    class="map-container" 
    bind:this={mapContainer}
    style="height: {height};"
  ></div>
  
  {#if safeTurbines.length > 0}
    <div class="map-info">
      <div class="map-stats">
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          {turbines.length} Turbines
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6M12 17v6"/>
          </svg>
          {safeTurbines.filter(t => t.active).length} Active
        </span>
        <span class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          {Math.round(safeTurbines.reduce((sum, t) => sum + (t.ratedCapacityKW || 0), 0) / 1000).toLocaleString()} MW Total
        </span>
      </div>
    </div>
  {:else}
    <div class="map-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
      <p>No wind turbines to display</p>
    </div>
  {/if}
</div>

<style lang="scss">
  .wind-turbine-map-container {
    position: relative;
    border-radius: var(--border-radius-default);
    overflow: hidden;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
  }

  .map-container {
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .map-info {
    position: absolute;
    top: 12px;
    right: 12px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-2) var(--size-3);
    box-shadow: var(--shadow-default);
    z-index: 1000;
    backdrop-filter: blur(8px);
  }

  .map-stats {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--size-1);
    font-size: var(--font-size-0);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-5);

    svg {
      color: var(--color-accent);
      flex-shrink: 0;
    }
  }

  .map-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--color-text-muted);
    z-index: 10;

    svg {
      margin-bottom: var(--size-2);
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: var(--font-size-1);
    }
  }

  // Dark theme adjustments for map tiles
  :global([data-theme="dark"]) .wind-turbine-map-container {
    .map-container {
      filter: brightness(0.8) contrast(1.2) hue-rotate(180deg) invert(1);
    }

    .map-info {
      filter: hue-rotate(180deg) invert(1);
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    .map-info {
      position: static;
      margin: 0;
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .map-stats {
      flex-direction: row;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: var(--size-2);
    }

    .stat-item {
      font-size: var(--font-size-0);
    }
  }
</style>
