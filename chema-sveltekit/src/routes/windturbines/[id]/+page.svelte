<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { windTurbines, windTurbinesActions, workOrders, workOrdersActions, notificationsActions } from '$lib/stores';
  import type { WindTurbine, WorkOrder, WindTurbineUpdate } from '$lib/types';
  import PowerChart from '$lib/components/PowerChart.svelte';
  import WindTurbineMap from '$lib/components/WindTurbineMap.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import EditTurbineForm from '$lib/components/EditTurbineForm.svelte';
  import ConfirmationDialog from '$lib/components/ConfirmationDialog.svelte';
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  let activeTab = 'overview';
  let editMode = false;
  let showDeleteModal = false;
  let showEditModal = false;
  let showConfirmDialog = false;
  let isSubmitting = false;
  let serverError: string | null = null;
  let pendingChanges: WindTurbineUpdate | null = null;
  
  // Mock performance data for charts
  let performanceData = [
    { date: '2024-01-01', powerOutput: 1450, efficiency: 95.2 },
    { date: '2024-01-02', powerOutput: 1520, efficiency: 96.1 },
    { date: '2024-01-03', powerOutput: 1380, efficiency: 94.8 },
    { date: '2024-01-04', powerOutput: 1600, efficiency: 97.3 },
    { date: '2024-01-05', powerOutput: 1480, efficiency: 95.7 },
    { date: '2024-01-06', powerOutput: 1550, efficiency: 96.5 },
    { date: '2024-01-07', powerOutput: 1420, efficiency: 95.1 },
  ];
  
  $: turbineId = $page.params.id;
  // Use server data first, then fall back to store data
  // Use store value if it's for the current turbine (updated after edits), otherwise use server data
  $: currentTurbine = ($windTurbines.currentTurbine?.id === turbineId) ? $windTurbines.currentTurbine : data.turbine;
  $: turbineWorkOrders = $workOrders.workOrders.filter(wo => wo.windTurbineId === turbineId);
  
  function setActiveTab(tab: string) {
    activeTab = tab;
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  function formatCapacity(kw: number): string {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`;
    }
    return `${kw} kW`;
  }
  
  function calculateAge(installationDate: string): string {
    const installed = new Date(installationDate);
    const now = new Date();
    const years = Math.floor((now.getTime() - installed.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  function getStatusCounts(orders: WorkOrder[]) {
    return {
      open: orders.filter(wo => wo.status === 'open').length,
      inProgress: orders.filter(wo => wo.status === 'in_progress').length,
      completed: orders.filter(wo => wo.status === 'completed').length
    };
  }
  
  function handleEdit() {
    showEditModal = true;
    serverError = null;
  }
  
  function handleDelete() {
    showDeleteModal = true;
  }

  function handleEditSubmit(event: CustomEvent<WindTurbineUpdate>) {
    pendingChanges = event.detail;
    showConfirmDialog = true;
  }

  function handleEditCancel() {
    showEditModal = false;
    serverError = null;
    pendingChanges = null;
  }

  async function confirmUpdate() {
    if (!pendingChanges || !currentTurbine) return;
    
    isSubmitting = true;
    serverError = null;
    
    try {
      await windTurbinesActions.updateTurbine(currentTurbine.id, pendingChanges);
      showEditModal = false;
      showConfirmDialog = false;
      notificationsActions.addNotification('success', 'Turbine Updated', `Wind turbine "${pendingChanges.name || currentTurbine.name}" updated successfully!`);
      pendingChanges = null;
    } catch (error) {
      serverError = error instanceof Error ? error.message : 'Failed to update turbine';
      notificationsActions.addNotification('error', 'Error', serverError);
      showConfirmDialog = false; // Close confirmation, keep edit modal open
    } finally {
      isSubmitting = false;
    }
  }

  function cancelUpdate() {
    showConfirmDialog = false;
    pendingChanges = null;
  }
  
  function confirmDelete() {
    if (turbineId) {
      windTurbinesActions.deleteTurbine(turbineId);
      showDeleteModal = false;
      // Navigate back to the list
      window.location.href = '/windturbines';
    }
  }
  
  onMount(() => {
    if (turbineId) {
      // Set the current turbine in the store if we have server data
      if (data.turbine) {
        windTurbinesActions.setCurrentTurbine(data.turbine);
      } else {
        // If we don't have turbine data from server, fetch it client-side
        windTurbinesActions.fetchTurbineById(turbineId);
      }
      
      // Fetch work orders for this turbine
      workOrdersActions.updateFilters({ windTurbineId: turbineId });
    }
  });
</script>

<svelte:head>
  <title>{currentTurbine ? `${currentTurbine.name} - Wind Turbine Manager` : 'Wind Turbine Details'}</title>
</svelte:head>

<div class="container turbine-detail-container">
  <!-- Enhanced Breadcrumb Navigation -->
  <Breadcrumb items={[
    { label: 'Home', href: '/', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
    { label: 'Wind Turbines', href: '/windturbines', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
    { label: currentTurbine?.name || 'Loading...', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>' }
  ]} />
  
  {#if currentTurbine}
    <!-- Compact Comprehensive Header -->
    <div class="detail-header">
      <div class="header-compact">
        <!-- Left: Primary Info -->
        <div class="header-primary">
          <div class="turbine-title">
            <h1>{currentTurbine.name}</h1>
            <div class="status-row">
              <span class="status {currentTurbine.active ? 'status-active' : 'status-inactive'}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                {currentTurbine.active ? 'Active' : 'Inactive'}
              </span>
              <span class="capacity-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                {formatCapacity(currentTurbine.ratedCapacityKW)}
              </span>
              <span class="age-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                {calculateAge(currentTurbine.installationDate)} old
              </span>
            </div>
          </div>
          <div class="location-info">
            <span class="location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {currentTurbine.latitude.toFixed(4)}, {currentTurbine.longitude.toFixed(4)}
            </span>
            <span class="manufacturer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              {currentTurbine.manufacturer.name} • {currentTurbine.manufacturer.country}
            </span>
          </div>
        </div>

        <!-- Center: Quick Stats -->
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-icon success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div class="stat-data">
              <span class="stat-value">1,485 kW</span>
              <span class="stat-label">Current Output</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div class="stat-data">
              <span class="stat-value">96.2%</span>
              <span class="stat-label">Efficiency</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon {turbineWorkOrders.filter(wo => wo.status === 'open').length > 0 ? 'warning' : 'success'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
            <div class="stat-data">
              <span class="stat-value">{turbineWorkOrders.filter(wo => wo.status === 'open').length}</span>
              <span class="stat-label">Open Work Orders</span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </div>
            <div class="stat-data">
              <span class="stat-value">99.1%</span>
              <span class="stat-label">Uptime (30d)</span>
            </div>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="header-actions">
          <button class="btn btn-compact" on:click={handleEdit}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
          <button class="btn btn-compact btn-danger" on:click={handleDelete}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        class="tab-button {activeTab === 'overview' ? 'active' : ''}"
        on:click={() => setActiveTab('overview')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        </svg>
        <span>Overview</span>
      </button>
      <button 
        class="tab-button {activeTab === 'performance' ? 'active' : ''}"
        on:click={() => setActiveTab('performance')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18"/>
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
        </svg>
        <span>Performance</span>
      </button>
      <button 
        class="tab-button {activeTab === 'location' ? 'active' : ''}"
        on:click={() => setActiveTab('location')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span>Location</span>
      </button>
      <button 
        class="tab-button {activeTab === 'workorders' ? 'active' : ''}"
        on:click={() => setActiveTab('workorders')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <span>Work Orders</span>
        {#if turbineWorkOrders.length > 0}
          <span class="tab-badge">{turbineWorkOrders.length}</span>
        {/if}
      </button>
      <button 
        class="tab-button {activeTab === 'maintenance' ? 'active' : ''}"
        on:click={() => setActiveTab('maintenance')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        <span>Maintenance</span>
      </button>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content">
      {#if activeTab === 'overview'}
        <div class="overview-content">
          <!-- Key Metrics -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div class="metric-content">
                <h3>{formatCapacity(currentTurbine.ratedCapacityKW)}</h3>
                <p>Rated Capacity</p>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div class="metric-content">
                <h3>{calculateAge(currentTurbine.installationDate)}</h3>
                <p>Age</p>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="metric-content">
                <h3>{currentTurbine.manufacturer.country}</h3>
                <p>Location</p>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="metric-content">
                <h3>{getStatusCounts(turbineWorkOrders).open}</h3>
                <p>Open Work Orders</p>
              </div>
            </div>
          </div>
          
          <!-- Details Grid -->
          <div class="details-grid">
            <div class="detail-section">
              <h3>Technical Specifications</h3>
              <div class="detail-table">
                <div class="detail-row">
                  <span class="label">Rated Capacity</span>
                  <span class="value">{formatCapacity(currentTurbine.ratedCapacityKW)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Manufacturer</span>
                  <span class="value">{currentTurbine.manufacturer.name}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Country of Origin</span>
                  <span class="value">{currentTurbine.manufacturer.country}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status</span>
                  <span class="value">
                    <span class="status {currentTurbine.active ? 'status-active' : 'status-inactive'}">
                      {currentTurbine.active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Installation Details</h3>
              <div class="detail-table">
                <div class="detail-row">
                  <span class="label">Built Date</span>
                  <span class="value">{formatDate(currentTurbine.builtDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Installation Date</span>
                  <span class="value">{formatDate(currentTurbine.installationDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Age</span>
                  <span class="value">{calculateAge(currentTurbine.installationDate)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Coordinates</span>
                  <span class="value coordinates">
                    {currentTurbine.latitude.toFixed(6)}, {currentTurbine.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else if activeTab === 'location'}
        <!-- Location Tab with Map -->
        <div class="location-content">
          <div class="dashboard-grid">
            <!-- Location Map -->
            <div class="map-section">
              <div class="section-card">
                <div class="section-header">
                  <h3>Turbine Location</h3>
                  <div class="location-coordinates">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {currentTurbine.latitude.toFixed(6)}, {currentTurbine.longitude.toFixed(6)}
                  </div>
                </div>
                <div class="map-container">
                  <WindTurbineMap 
                    turbines={[currentTurbine]} 
                    height="400px"
                    center={[currentTurbine.latitude, currentTurbine.longitude]}
                    zoom={15}
                    showControls={true}
                  />
                </div>
              </div>
            </div>

            <!-- Location Details -->
            <div class="location-details">
              <div class="section-card">
                <div class="section-header">
                  <h3>Location Information</h3>
                </div>
                <div class="detail-table">
                  <div class="detail-row">
                    <span class="label">Latitude</span>
                    <span class="value">{currentTurbine.latitude.toFixed(6)}°</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Longitude</span>
                    <span class="value">{currentTurbine.longitude.toFixed(6)}°</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Installation Site</span>
                    <span class="value">Site {currentTurbine.id.substring(0, 8)}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Grid Connection</span>
                    <span class="value">Connected</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Access Road</span>
                    <span class="value">Maintained</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Nearest Substation</span>
                    <span class="value">2.3 km northeast</span>
                  </div>
                </div>
              </div>

              <!-- Environmental Data -->
              <div class="section-card">
                <div class="section-header">
                  <h3>Environmental Conditions</h3>
                </div>
                <div class="env-stats">
                  <div class="env-stat">
                    <div class="env-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                      </svg>
                    </div>
                    <div class="env-content">
                      <span class="env-value">12.5 m/s</span>
                      <span class="env-label">Avg Wind Speed</span>
                    </div>
                  </div>
                  
                  <div class="env-stat">
                    <div class="env-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
                      </svg>
                    </div>
                    <div class="env-content">
                      <span class="env-value">18°C</span>
                      <span class="env-label">Temperature</span>
                    </div>
                  </div>
                  
                  <div class="env-stat">
                    <div class="env-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M2 12h20"/>
                        <path d="M10 16l4-4-4-4"/>
                      </svg>
                    </div>
                    <div class="env-content">
                      <span class="env-value">SW</span>
                      <span class="env-label">Wind Direction</span>
                    </div>
                  </div>
                  
                  <div class="env-stat">
                    <div class="env-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      </svg>
                    </div>
                    <div class="env-content">
                      <span class="env-value">65%</span>
                      <span class="env-label">Humidity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {:else if activeTab === 'workorders'}
        <div class="work-orders-content">
          {#if $workOrders.loading}
            <div class="loading">
              <div class="loading-spinner"></div>
              <p>Loading work orders...</p>
            </div>
          {:else if turbineWorkOrders.length === 0}
            <div class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <h3>No Work Orders</h3>
              <p>This turbine has no work orders yet.</p>
              <button class="btn btn-primary">Create Work Order</button>
            </div>
          {:else}
            <div class="work-orders-summary">
              <div class="summary-stats">
                <div class="stat">
                  <span class="count">{getStatusCounts(turbineWorkOrders).open}</span>
                  <span class="label">Open</span>
                </div>
                <div class="stat">
                  <span class="count">{getStatusCounts(turbineWorkOrders).inProgress}</span>
                  <span class="label">In Progress</span>
                </div>
                <div class="stat">
                  <span class="count">{getStatusCounts(turbineWorkOrders).completed}</span>
                  <span class="label">Completed</span>
                </div>
              </div>
              <button class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Work Order
              </button>
            </div>
            
            <div class="work-orders-list">
              {#each turbineWorkOrders as workOrder (workOrder.id)}
                <div class="work-order-card">
                  <div class="work-order-header">
                    <h4>{workOrder.title}</h4>
                    <span class="status status-{workOrder.status}">
                      {workOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p class="work-order-description">{workOrder.description}</p>
                  <div class="work-order-meta">
                    <span class="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      Created {formatDate(workOrder.creationDate)}
                    </span>
                    {#if workOrder.resolutionDate}
                      <span class="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                        Resolved {formatDate(workOrder.resolutionDate)}
                      </span>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'performance'}
        <div class="performance-content">
          <div class="performance-metrics">
            <div class="metric-card">
              <h4>Current Performance</h4>
              <div class="metric-value">
                <span class="value">1,847</span>
                <span class="unit">kW</span>
              </div>
              <span class="metric-label">Current Output</span>
            </div>
            
            <div class="metric-card">
              <h4>Efficiency</h4>
              <div class="metric-value">
                <span class="value">87.3</span>
                <span class="unit">%</span>
              </div>
              <span class="metric-label">Current Efficiency</span>
            </div>
            
            <div class="metric-card">
              <h4>Capacity Factor</h4>
              <div class="metric-value">
                <span class="value">42.1</span>
                <span class="unit">%</span>
              </div>
              <span class="metric-label">30-Day Average</span>
            </div>
          </div>
          
          <div class="performance-charts">
            <PowerChart 
              title="Power Output - {currentTurbine.name} (Last 24 Hours)" 
              height={450} 
            />
            
            <div class="chart-grid">
              <div class="chart-placeholder small">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M21 12c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <h4>Wind Speed Correlation</h4>
                <p>Power output vs wind speed analysis</p>
              </div>
              
              <div class="chart-placeholder small">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                <h4>Performance History</h4>
                <p>Monthly performance trends</p>
              </div>
            </div>
          </div>
        </div>
      {:else if activeTab === 'maintenance'}
        <div class="maintenance-content">
          <div class="chart-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="12" cy="1" r="1"/>
              <circle cx="12" cy="23" r="1"/>
              <circle cx="20.49" cy="8.51" r="1"/>
              <circle cx="3.51" cy="15.49" r="1"/>
              <circle cx="20.49" cy="15.49" r="1"/>
              <circle cx="3.51" cy="8.51" r="1"/>
            </svg>
            <h3>Maintenance Schedule</h3>
            <p>Coming soon - Maintenance schedules, service history, and predictive maintenance alerts.</p>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Delete Confirmation Modal -->
    {#if showDeleteModal}
      <div class="modal-overlay" on:click={() => showDeleteModal = false}>
        <div class="modal" on:click|stopPropagation>
          <div class="modal-header">
            <h3>Confirm Deletion</h3>
            <button class="modal-close" on:click={() => showDeleteModal = false}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <p>Are you sure you want to delete <strong>{currentTurbine.name}</strong>?</p>
            <p>This action cannot be undone.</p>
          </div>
          <div class="modal-actions">
            <button class="btn" on:click={() => showDeleteModal = false}>Cancel</button>
            <button class="btn btn-danger" on:click={confirmDelete}>Delete</button>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="not-found">
      <h2>Turbine Not Found</h2>
      <p>The requested wind turbine could not be found.</p>
      <a href="/windturbines" class="btn btn-primary">Back to Turbines</a>
    </div>
  {/if}
</div>

<!-- Edit Turbine Modal -->
{#if currentTurbine}
  <Modal 
    bind:isOpen={showEditModal} 
    title="Edit Wind Turbine" 
    size="large"
    on:close={handleEditCancel}
  >
    <EditTurbineForm
      turbine={currentTurbine}
      {isSubmitting}
      {serverError}
      on:submit={handleEditSubmit}
      on:cancel={handleEditCancel}
    />
  </Modal>
{/if}

<!-- Confirmation Dialog -->
{#if pendingChanges}
  <ConfirmationDialog
    bind:isOpen={showConfirmDialog}
    title="Confirm Changes"
    message="Are you sure you want to update this wind turbine? This action will modify the turbine's configuration and cannot be undone."
    confirmText="Update Turbine"
    cancelText="Cancel"
    type="warning"
    on:confirm={confirmUpdate}
    on:cancel={cancelUpdate}
  />
{/if}

<style lang="scss">
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    margin-bottom: var(--size-4);
    font-size: var(--font-size-1);
    
    a {
      color: var(--color-accent);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .separator {
      color: var(--color-text-muted);
    }
    
    .current {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-5);
    }
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--size-5);
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-3);
    }
    
    .header-info {
      h1 {
        margin: 0 0 var(--size-2) 0;
        color: var(--color-text-primary);
        font-size: var(--font-size-5);
      }
      
      .status-badges {
        display: flex;
        gap: var(--size-2);
        flex-wrap: wrap;
      }
      
      .manufacturer-badge {
        padding: var(--size-1) var(--size-2);
        background: var(--bg-tertiary);
        border: 1px solid var(--color-border-color);
        border-radius: var(--border-radius-default);
        font-size: var(--font-size-0);
        color: var(--color-text-secondary);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--size-2);
      
      .btn-danger {
        background: var(--color-error);
        color: white;
        border-color: var(--color-error);
        
        &:hover {
          background: var(--red-7);
          border-color: var(--red-7);
        }
      }
    }
  }
  
  .tab-navigation {
    display: flex;
    border-bottom: 1px solid var(--color-border-color);
    margin-bottom: var(--size-4);
    
    @media (max-width: 768px) {
      overflow-x: auto;
    }
    
    .tab-button {
      padding: var(--size-3) var(--size-4);
      border: none;
      background: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
      
      &:hover {
        color: var(--color-text-primary);
        background: var(--bg-tertiary);
      }
      
      &.active {
        color: var(--color-accent);
        border-bottom-color: var(--color-accent);
      }
    }
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-6);
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-border-color);
      border-top: 3px solid var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    text-align: center;
    
    h3 {
      color: var(--color-error);
      margin-bottom: var(--size-2);
    }
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-4);
    margin-bottom: var(--size-5);
  }
  
  .metric-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-4);
    display: flex;
    align-items: center;
    gap: var(--size-3);
    box-shadow: var(--shadow-default);
    transition: var(--transition-theme);
    
    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-hover);
    }
    
    .metric-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--border-radius-default);
      background: var(--color-accent);
      color: white;
      
      &.warning {
        background: var(--color-warning);
      }
    }
    
    .metric-content {
      h3 {
        margin: 0;
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-7);
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-1);
      }
    }
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--size-4);
  }
  
  .detail-section {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);
    
    h3 {
      margin: 0 0 var(--size-3) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-6);
    }
  }
  
  .detail-table {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--size-2) 0;
      border-bottom: 1px solid var(--color-border-color-light);
      
      &:last-child {
        border-bottom: none;
      }
      
      .label {
        color: var(--color-text-secondary);
        font-size: var(--font-size-1);
      }
      
      .value {
        color: var(--color-text-primary);
        font-weight: var(--font-weight-5);
        text-align: right;
        
        &.coordinates {
          font-family: monospace;
          font-size: var(--font-size-0);
        }
      }
    }
  }
  
  .work-orders-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-4);
    margin-bottom: var(--size-4);
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-3);
    }
    
    .summary-stats {
      display: flex;
      gap: var(--size-5);
      
      .stat {
        text-align: center;
        
        .count {
          display: block;
          font-size: var(--font-size-3);
          font-weight: var(--font-weight-7);
          color: var(--color-text-primary);
        }
        
        .label {
          font-size: var(--font-size-0);
          color: var(--color-text-secondary);
        }
      }
    }
  }
  
  .work-orders-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }
  
  .work-order-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-4);
    
    .work-order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--size-2);
      
      h4 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: var(--font-size-2);
      }
    }
    
    .work-order-description {
      color: var(--color-text-secondary);
      margin-bottom: var(--size-3);
      line-height: 1.5;
    }
    
    .work-order-meta {
      display: flex;
      gap: var(--size-4);
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: var(--size-2);
      }
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: var(--size-1);
        color: var(--color-text-muted);
        font-size: var(--font-size-0);
        
        svg {
          width: 14px;
          height: 14px;
        }
      }
    }
  }
  
  .empty-state, .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--size-8);
    text-align: center;
    color: var(--color-text-muted);
    
    svg {
      margin-bottom: var(--size-3);
      opacity: 0.5;
    }
    
    h3, h4 {
      margin: 0 0 var(--size-2) 0;
      color: var(--color-text-secondary);
    }
    
    p {
      margin: 0 0 var(--size-4) 0;
    }
    
    &.small {
      padding: var(--size-4);
      min-height: 200px;
      
      svg {
        width: 24px;
        height: 24px;
        margin-bottom: var(--size-2);
      }
      
      h4 {
        font-size: var(--font-size-1);
        margin-bottom: var(--size-1);
      }
      
      p {
        font-size: var(--font-size-0);
        margin-bottom: 0;
      }
    }
  }
  
  .performance-content {
    display: flex;
    flex-direction: column;
    gap: var(--size-5);
  }
  
  .performance-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-4);
    
    .metric-card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border-color);
      border-radius: var(--border-radius-default);
      padding: var(--size-4);
      text-align: center;
      
      h4 {
        margin: 0 0 var(--size-3) 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-1);
        font-weight: var(--font-weight-5);
      }
      
      .metric-value {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: var(--size-1);
        margin-bottom: var(--size-2);
        
        .value {
          font-size: var(--font-size-5);
          font-weight: var(--font-weight-8);
          color: var(--color-accent);
        }
        
        .unit {
          font-size: var(--font-size-2);
          color: var(--color-text-secondary);
        }
      }
      
      .metric-label {
        font-size: var(--font-size-0);
        color: var(--color-text-muted);
      }
    }
  }
  
  .performance-charts {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }
  
  .chart-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--size-4);
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: auto;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--size-4);
      border-bottom: 1px solid var(--color-border-color);
      
      h3 {
        margin: 0;
        color: var(--color-text-primary);
      }
      
      .modal-close {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        
        &:hover {
          color: var(--color-text-primary);
        }
      }
    }
    
    .modal-content {
      padding: var(--size-4);
      
      p {
        margin: 0 0 var(--size-2) 0;
        color: var(--color-text-primary);
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--size-2);
      padding: var(--size-4);
      border-top: 1px solid var(--color-border-color);
    }
  }
  
  .not-found {
    text-align: center;
    padding: var(--size-6);
    
    h2 {
      color: var(--color-text-primary);
      margin-bottom: var(--size-2);
    }
    
    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--size-4);
    }
  }
  
  // Enhanced header styles
  .turbine-detail-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--size-4);
    background: var(--color-bg-secondary);
    min-height: calc(100vh - 80px); // Account for header height
    border-radius: var(--border-radius-default) var(--border-radius-default) 0 0;
  }

  .detail-header {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-4);
    margin-bottom: var(--size-4);
    box-shadow: var(--shadow-default);
  }

  .header-compact {
    display: flex;
    align-items: center;
    width: 100%;
    
    @media (max-width: 1200px) {
      flex-direction: column;
      align-items: stretch;
      gap: var(--size-3);
    }
  }

  .header-primary {
    flex: 0 0 auto;
    min-width: fit-content;

    .turbine-title {
      margin-bottom: var(--size-2);
      
      h1 {
        margin: 0 0 var(--size-1) 0;
        color: var(--color-text-primary);
        font-size: var(--font-size-4);
        font-weight: var(--font-weight-7);
        line-height: 1.2;
      }

      .status-row {
        display: flex;
        gap: var(--size-2);
        flex-wrap: wrap;
        align-items: center;

        .status, .capacity-badge, .age-badge {
          display: flex;
          align-items: center;
          gap: var(--size-1);
          padding: var(--size-1) var(--size-2);
          border-radius: var(--border-radius-default);
          font-size: var(--font-size-0);
          font-weight: var(--font-weight-5);
          
          svg {
            flex-shrink: 0;
          }
        }

        .status {
          &.status-active {
            background: var(--color-success);
            color: white;
          }
          
          &.status-inactive {
            background: var(--color-error);
            color: white;
          }
        }

        .capacity-badge {
          background: var(--color-info);
          color: white;
        }

        .age-badge {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }
      }
    }

    .location-info {
      display: flex;
      flex-direction: column;
      gap: var(--size-1);

      .location, .manufacturer {
        display: flex;
        align-items: center;
        gap: var(--size-2);
        color: var(--color-text-secondary);
        font-size: var(--font-size-1);

        svg {
          color: var(--color-text-muted);
        }
      }
    }
  }


  .header-stats {
    display: flex;
    gap: var(--size-3);
    justify-content: center;
    flex: 1;
    
    @media (max-width: 1200px) {
      justify-content: space-between;
      gap: var(--size-2);
    }
    
    @media (max-width: 768px) {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--size-3);
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      padding: var(--size-2);
      background: var(--color-bg-tertiary);
      border-radius: var(--border-radius-default);
      min-width: 110px;
      flex-shrink: 0;

      .stat-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--border-radius-default);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.success {
          background: var(--color-success);
          color: white;
        }
        
        &.info {
          background: var(--color-info);
          color: white;
        }
        
        &.warning {
          background: var(--color-warning);
          color: white;
        }
      }

      .stat-data {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .stat-value {
          font-size: var(--font-size-2);
          font-weight: var(--font-weight-7);
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--font-size-0);
          color: var(--color-text-secondary);
          line-height: 1.2;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: var(--size-2);
    align-items: center;
    flex: 0 0 auto;
    min-width: fit-content;
    
    .btn-compact {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      padding: var(--size-2) var(--size-3);
      font-size: var(--font-size-1);
      flex-direction: row;
    }
  }


  .header-meta {
    display: flex;
    gap: var(--size-4);
    margin-bottom: var(--size-3);
    flex-wrap: wrap;

    .location-info, .manufacturer-info {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      color: var(--color-text-secondary);
      font-size: var(--font-size-1);

      svg {
        color: var(--color-accent);
      }
    }
  }

  .status-badges {
    display: flex;
    gap: var(--size-3);
    flex-wrap: wrap;

    .status, .capacity-badge, .age-badge {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      padding: var(--size-2) var(--size-3);
      border-radius: var(--border-radius-default);
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-6);

      svg {
        width: 12px;
        height: 12px;
      }
    }

    .status {
      &.status-active {
        background: var(--color-success);
        color: white;
      }
      &.status-inactive {
        background: var(--color-error);
        color: white;
      }
    }

    .capacity-badge {
      background: var(--color-info);
      color: white;
    }

    .age-badge {
      background: var(--color-bg-tertiary);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border-color);
    }
  }

  .header-actions {
    display: flex;
    gap: var(--size-3);
    align-items: flex-start;
  }

  // Quick stats row
  .quick-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-3);
  }

  .stat-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-3);
    display: flex;
    align-items: center;
    gap: var(--size-3);
    transition: var(--transition-theme);

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-hover);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--color-success);
      }
      &.info {
        background: rgba(59, 130, 246, 0.1);
        color: var(--color-info);
      }
      &.warning {
        background: rgba(245, 158, 11, 0.1);
        color: var(--color-warning);
      }
    }

    .stat-content {
      flex: 1;
      
      .stat-value {
        display: block;
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-7);
        color: var(--color-text-primary);
        margin-bottom: var(--size-1);
      }

      .stat-label {
        display: block;
        font-size: var(--font-size-1);
        color: var(--color-text-secondary);
      }
    }
  }

  // Enhanced tab navigation
  .tab-navigation {
    display: flex;
    gap: var(--size-1);
    margin-bottom: var(--size-4);
    border-bottom: 2px solid var(--color-border-color);
    overflow-x: auto;

    .tab-button {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      padding: var(--size-3) var(--size-4);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--color-text-secondary);
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
      cursor: pointer;
      transition: var(--transition-theme);
      white-space: nowrap;
      position: relative;

      &:hover {
        color: var(--color-accent);
        background: var(--color-bg-tertiary);
      }

      &.active {
        color: var(--color-accent);
        border-bottom-color: var(--color-accent);
        background: var(--color-bg-secondary);
      }

      .tab-badge {
        background: var(--color-accent);
        color: white;
        font-size: var(--font-size-0);
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
        line-height: 1;
      }
    }
  }

  // Dashboard grid layouts
  .dashboard-grid {
    display: grid;
    gap: var(--size-6);
    grid-template-columns: 1fr;

    @media (min-width: 1024px) {
      grid-template-columns: 2fr 1fr;
    }
  }

  // Section card styling
  .section-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);
    
    &.full-width {
      grid-column: 1 / -1;
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--size-4);
    
    h3 {
      margin: 0;
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-6);
      color: var(--color-text-primary);
    }
    
    .section-title {
      h2 {
        margin: 0 0 var(--size-1) 0;
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-7);
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-1);
      }
    }
    
    .section-actions {
      display: flex;
      gap: var(--size-2);
    }
  }

  // Location tab styles
  .location-content {
    .map-section {
      grid-column: 1 / -1;
      
      @media (min-width: 1024px) {
        grid-column: 1 / 2;
      }
    }

    .location-details {
      display: flex;
      flex-direction: column;
      gap: var(--size-4);
    }

    .location-coordinates {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      color: var(--color-text-secondary);
      font-size: var(--font-size-1);
      font-family: var(--font-mono);
    }

    .map-container {
      border-radius: var(--border-radius-default);
      overflow: hidden;
      border: 1px solid var(--color-border-color);
    }
  }

  // Environmental stats
  .env-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--size-4);
  }

  .env-stat {
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-3);
    background: var(--color-bg-tertiary);
    border-radius: var(--border-radius-default);

    .env-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-accent);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .env-content {
      flex: 1;

      .env-value {
        display: block;
        font-size: var(--font-size-2);
        font-weight: var(--font-weight-6);
        color: var(--color-text-primary);
        margin-bottom: var(--size-1);
      }

      .env-label {
        display: block;
        font-size: var(--font-size-0);
        color: var(--color-text-secondary);
      }
    }
  }

  // Performance tab styles
  .performance-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--size-4);
    grid-column: 1 / -1;
    margin-bottom: var(--size-6);
  }

  .perf-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);

    .perf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--size-3);

      h4 {
        margin: 0;
        font-size: var(--font-size-1);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-5);
      }

      .trend {
        font-size: var(--font-size-0);
        font-weight: var(--font-weight-6);
        padding: var(--size-1) var(--size-2);
        border-radius: var(--border-radius-default);

        &.positive {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }
        &.negative {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }
        &.neutral {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }
      }
    }

    .perf-value {
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-7);
      color: var(--color-text-primary);
      margin-bottom: var(--size-2);
    }

    .perf-subtext {
      font-size: var(--font-size-1);
      color: var(--color-text-secondary);
      margin-bottom: var(--size-3);
    }

    .perf-progress {
      .progress-bar {
        width: 100%;
        height: 6px;
        background: var(--color-bg-tertiary);
        border-radius: 3px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: var(--color-accent);
          transition: width 0.3s ease;
        }
      }
    }
  }

  .charts-section {
    display: flex;
    flex-direction: column;
    gap: var(--size-6);
    grid-column: 1 / -1;
  }

  .chart-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--size-4);

      h3 {
        margin: 0;
        font-size: var(--font-size-2);
        color: var(--color-text-primary);
      }

      .chart-controls {
        display: flex;
        gap: var(--size-2);
      }
    }
  }

  .metrics-table-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);
  }

  .metrics-table {
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--size-3) 0;
      border-bottom: 1px solid var(--color-border-color-light);

      &:last-child {
        border-bottom: none;
      }

      .metric-label {
        font-size: var(--font-size-1);
        color: var(--color-text-secondary);
      }

      .metric-value {
        font-size: var(--font-size-1);
        font-weight: var(--font-weight-6);
        color: var(--color-text-primary);
      }

      .metric-status {
        font-size: var(--font-size-0);
        padding: var(--size-1) var(--size-2);
        border-radius: var(--border-radius-default);
        font-weight: var(--font-weight-6);

        &.good {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }
        &.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
        }
        &.error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-error);
        }
      }
    }
  }

  // Alerts section
  .alerts-section {
    grid-column: 1 / -1;
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }

  .alert-item {
    display: flex;
    align-items: flex-start;
    gap: var(--size-3);
    padding: var(--size-4);
    border-radius: var(--border-radius-default);
    border: 1px solid var(--color-border-color);

    &.success {
      background: rgba(16, 185, 129, 0.05);
      border-color: rgba(16, 185, 129, 0.2);
    }
    &.info {
      background: rgba(59, 130, 246, 0.05);
      border-color: rgba(59, 130, 246, 0.2);
    }
    &.warning {
      background: rgba(245, 158, 11, 0.05);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .alert-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-bg-secondary);
      color: var(--color-accent);
      flex-shrink: 0;
    }

    .alert-content {
      flex: 1;

      .alert-title {
        font-size: var(--font-size-1);
        font-weight: var(--font-weight-6);
        color: var(--color-text-primary);
        margin-bottom: var(--size-1);
      }

      .alert-message {
        font-size: var(--font-size-1);
        color: var(--color-text-secondary);
        line-height: 1.5;
      }
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .turbine-detail-container {
      padding: var(--size-3);
    }

    .detail-header {
      padding: var(--size-4);
    }

    .quick-stats {
      grid-template-columns: 1fr;
    }

    .performance-summary {
      grid-template-columns: 1fr;
    }

    .env-stats {
      grid-template-columns: 1fr;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
