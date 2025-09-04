<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboard, dashboardActions, windTurbines, windTurbinesActions, notificationsActions } from '$lib/stores';
  import WindTurbineMap from '$lib/components/WindTurbineMap.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import AddTurbineForm from '$lib/components/AddTurbineForm.svelte';
  import type { WindTurbineCreate } from '$lib/types';
  
  let showAddTurbineModal = false;
  let isSubmitting = false;
  let serverError: string | null = null;

  async function handleAddTurbine(event: CustomEvent<WindTurbineCreate>) {
    const turbineData = event.detail;
    isSubmitting = true;
    serverError = null; // Clear previous errors
    
    try {
      await windTurbinesActions.createTurbine(turbineData);
      showAddTurbineModal = false;
      notificationsActions.addNotification('success', 'Turbine Created', `Wind turbine "${turbineData.name}" created successfully!`);
      
      // Refresh dashboard data
      dashboardActions.fetchSummary();
    } catch (error) {
      // Set the server error to display in the form
      serverError = error instanceof Error ? error.message : 'Failed to create turbine';
      notificationsActions.addNotification('error', 'Error', serverError);
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancelAddTurbine() {
    showAddTurbineModal = false;
    serverError = null; // Clear errors when closing modal
  }

  function openAddTurbineModal() {
    showAddTurbineModal = true;
    serverError = null; // Clear errors when opening modal
  }
  
  onMount(() => {
    dashboardActions.fetchSummary();
    windTurbinesActions.fetchTurbines(); // Fetch turbines for map
  });
</script>

<div class="professional-dashboard">
  <!-- Header Section -->
  <div class="dashboard-header">
    <div class="container">
      <div class="header-content">
        <div class="header-text">
          <h1>Wind Turbine Management System</h1>
          <p>Monitor and manage your wind turbine fleet efficiently</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" on:click={openAddTurbineModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Turbine
          </button>
          <button class="btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if $dashboard.loading}
    <div class="container">
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    </div>
  {:else if $dashboard.error}
    <div class="container">
      <div class="error-state">
        <h3>Error Loading Dashboard</h3>
        <p>{$dashboard.error}</p>
        <button class="btn btn-primary" on:click={() => dashboardActions.fetchSummary()}>
          Retry
        </button>
      </div>
    </div>
  {:else if $dashboard.summary}
    <!-- Main Content -->
    <div class="dashboard-content">
      <div class="container dashboard-container">
        <Breadcrumb items={[
          { label: 'Home', href: '/', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
          { label: 'Analytics Dashboard', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' }
        ]} />

        <!-- Key Metrics Row -->
        <div class="metrics-section">
          <div class="metrics-grid">
            <div class="metric-card primary">
              <div class="metric-header">
                <div class="metric-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <span class="metric-label">Total Turbines</span>
              </div>
              <div class="metric-value">{$dashboard.summary.totalTurbines}</div>
              <div class="metric-change positive">+2 this month</div>
            </div>

            <div class="metric-card success">
              <div class="metric-header">
                <div class="metric-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <span class="metric-label">Active Turbines</span>
              </div>
              <div class="metric-value">{$dashboard.summary.activeTurbines}</div>
              <div class="metric-change positive">
                {Math.round(($dashboard.summary.activeTurbines / $dashboard.summary.totalTurbines) * 100)}% uptime
              </div>
            </div>

            <div class="metric-card warning">
              <div class="metric-header">
                <div class="metric-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <span class="metric-label">Open Work Orders</span>
              </div>
              <div class="metric-value">{$dashboard.summary.openWorkOrders}</div>
              <div class="metric-change neutral">
                {$dashboard.summary.inProgressWorkOrders} in progress
              </div>
            </div>

            <div class="metric-card info">
              <div class="metric-header">
                <div class="metric-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                </div>
                <span class="metric-label">Average Power Output</span>
              </div>
              <div class="metric-value">{Math.round($dashboard.summary.avgPowerOutput)} kW</div>
              <div class="metric-change positive">+5.2% from last month</div>
            </div>
          </div>
        </div>

        <!-- Wind Turbine Map Section -->
        <div class="map-section">
          <div class="section-card full-width">
            <div class="section-header">
              <div class="section-title">
                <h2>Fleet Location Overview</h2>
                <p>Geographic distribution of your wind turbine fleet</p>
              </div>
              <div class="section-actions">
                <button class="btn btn-ghost">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  Find Turbines
                </button>
                <button class="btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="3,6 9,12 3,18"/>
                    <polygon points="15,6 21,12 15,18"/>
                  </svg>
                  Full Screen
                </button>
              </div>
            </div>
            <div class="map-container-wrapper">
              {#if $windTurbines.loading}
                <div class="map-loading">
                  <div class="loading-spinner"></div>
                  <p>Loading turbine locations...</p>
                </div>
              {:else if $windTurbines.error}
                <div class="map-error">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <h4>Failed to load map</h4>
                  <p>{$windTurbines.error}</p>
                  <button class="btn btn-primary" on:click={() => windTurbinesActions.fetchTurbines()}>
                    Retry
                  </button>
                </div>
              {:else}
                <WindTurbineMap 
                  turbines={$windTurbines.turbines} 
                  height="500px"
                  center={[40.0, -95.0]}
                  zoom={6}
                  showControls={true}
                />
              {/if}
            </div>
          </div>
        </div>

        <!-- Main Layout Grid -->
        <div class="dashboard-grid">
          <!-- Left Column -->
          <div class="main-column">
            <!-- Recent Activity -->
            <div class="section-card">
              <div class="section-header">
                <h2>Recent Activity</h2>
                <button class="btn btn-ghost">View All</button>
              </div>
              <div class="activity-list">
                <div class="activity-item">
                  <div class="activity-icon success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">Maintenance completed on Energy-Eagle-008</div>
                    <div class="activity-meta">
                      <span class="activity-time">2 hours ago</span>
                      <span class="activity-user">by Tech Team Alpha</span>
                    </div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">New work order created for Energy-Storm-038</div>
                    <div class="activity-meta">
                      <span class="activity-time">4 hours ago</span>
                      <span class="activity-user">by System Monitor</span>
                    </div>
                  </div>
                </div>
                <div class="activity-item">
                  <div class="activity-icon info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">Daily performance report generated</div>
                    <div class="activity-meta">
                      <span class="activity-time">6 hours ago</span>
                      <span class="activity-user">by Automated System</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fleet Overview -->
            <div class="section-card">
              <div class="section-header">
                <h2>Fleet Overview</h2>
                <button class="btn btn-ghost">Manage Fleet</button>
              </div>
              <div class="fleet-stats">
                <div class="fleet-stat">
                  <span class="stat-label">Total Capacity</span>
                  <span class="stat-value">{Math.round($dashboard.summary.avgPowerOutput * $dashboard.summary.totalTurbines / 1000)} MW</span>
                </div>
                <div class="fleet-stat">
                  <span class="stat-label">Efficiency</span>
                  <span class="stat-value">87.3%</span>
                </div>
                <div class="fleet-stat">
                  <span class="stat-label">Availability</span>
                  <span class="stat-value">{Math.round(($dashboard.summary.activeTurbines / $dashboard.summary.totalTurbines) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="sidebar-column">
            <!-- Quick Actions -->
            <div class="section-card">
              <div class="section-header">
                <h3>Quick Actions</h3>
              </div>
              <div class="quick-actions-list">
                <a href="/windturbines" class="quick-action-item">
                  <div class="quick-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <div class="quick-action-content">
                    <span class="quick-action-title">Manage Turbines</span>
                    <span class="quick-action-subtitle">View and manage your fleet</span>
                  </div>
                  <svg class="quick-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </a>
                
                <a href="/workorders" class="quick-action-item">
                  <div class="quick-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div class="quick-action-content">
                    <span class="quick-action-title">Work Orders</span>
                    <span class="quick-action-subtitle">Track maintenance tasks</span>
                  </div>
                  <svg class="quick-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </a>
                
                <a href="/dashboard" class="quick-action-item">
                  <div class="quick-action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div class="quick-action-content">
                    <span class="quick-action-title">Analytics</span>
                    <span class="quick-action-subtitle">Detailed performance reports</span>
                  </div>
                  <svg class="quick-action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- System Status -->
            <div class="section-card">
              <div class="section-header">
                <h3>System Status</h3>
              </div>
              <div class="status-list">
                <div class="status-item">
                  <div class="status-indicator success"></div>
                  <div class="status-content">
                    <span class="status-label">API Services</span>
                    <span class="status-value">Online</span>
                  </div>
                </div>
                <div class="status-item">
                  <div class="status-indicator success"></div>
                  <div class="status-content">
                    <span class="status-label">Data Synchronization</span>
                    <span class="status-value">Active</span>
                  </div>
                </div>
                <div class="status-item">
                  <div class="status-indicator warning"></div>
                  <div class="status-content">
                    <span class="status-label">Pending Alerts</span>
                    <span class="status-value">3 items</span>
                  </div>
                </div>
                <div class="status-item">
                  <div class="status-indicator success"></div>
                  <div class="status-content">
                    <span class="status-label">Last Backup</span>
                    <span class="status-value">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Performance Summary -->
            <div class="section-card">
              <div class="section-header">
                <h3>Performance Summary</h3>
              </div>
              <div class="performance-summary">
                <div class="performance-item">
                  <span class="performance-label">Today's Generation</span>
                  <span class="performance-value">{Math.round($dashboard.summary.avgPowerOutput * 24 / 1000)} MWh</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">This Month</span>
                  <span class="performance-value">{Math.round($dashboard.summary.avgPowerOutput * 24 * 30 / 1000)} MWh</span>
                </div>
                <div class="performance-item">
                  <span class="performance-label">Carbon Saved</span>
                  <span class="performance-value">{Math.round($dashboard.summary.avgPowerOutput * 24 * 0.5)} tons CO₂</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Add Turbine Modal -->
<Modal 
  bind:isOpen={showAddTurbineModal} 
  title="Add New Wind Turbine" 
  size="large"
  on:close={handleCancelAddTurbine}
>
  <AddTurbineForm 
    {isSubmitting}
    {serverError}
    on:submit={handleAddTurbine}
    on:cancel={handleCancelAddTurbine}
  />
</Modal>

<style lang="scss">
  .professional-dashboard {
    min-height: 100vh;
    background: var(--color-bg-primary);
  }

  .dashboard-header {
    background: var(--color-bg-secondary);
    border-bottom: 2px solid var(--color-border-color);
    padding: var(--size-6) 0;
    margin-bottom: var(--size-2);
    
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: var(--size-4);
        text-align: center;
      }
    }
    
    .header-text {
      h1 {
        margin: 0 0 var(--size-1) 0;
        font-size: var(--font-size-6);
        font-weight: var(--font-weight-7);
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        font-size: var(--font-size-2);
        color: var(--color-text-secondary);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--size-3);
      
      .btn {
        display: flex;
        align-items: center;
        gap: var(--size-2);
        padding: var(--size-2) var(--size-4);
        font-size: var(--font-size-1);
        
        svg {
          width: 18px;
          height: 18px;
        }
      }
    }
  }

  .dashboard-content {
    padding: var(--size-6) 0;
  }

  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--size-6);
    
    @media (max-width: 1024px) {
      padding: 0 var(--size-4);
    }
    
    @media (max-width: 768px) {
      padding: 0 var(--size-3);
    }
  }

  .loading-state, .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--size-8);
    text-align: center;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--size-3);
    }
    
    h3 {
      color: var(--color-error);
      margin-bottom: var(--size-2);
    }
    
    p {
      color: var(--color-text-secondary);
      margin-bottom: var(--size-4);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .metrics-section {
    margin-bottom: var(--size-6);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--size-4);
  }

  .metric-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:hover {
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
      border-color: var(--color-accent);
    }
    
    .metric-header {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      margin-bottom: var(--size-3);
      
      .metric-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-2);
        background: var(--color-accent);
        color: white;
      }
      
      .metric-label {
        font-size: var(--font-size-1);
        font-weight: var(--font-weight-5);
        color: var(--color-text-secondary);
      }
    }
    
    .metric-value {
      font-size: var(--font-size-6);
      font-weight: var(--font-weight-8);
      color: var(--color-text-primary);
      margin-bottom: var(--size-2);
    }
    
    .metric-change {
      font-size: var(--font-size-0);
      font-weight: var(--font-weight-5);
      
      &.positive {
        color: var(--green-7);
      }
      
      &.negative {
        color: var(--red-7);
      }
      
      &.neutral {
        color: var(--color-text-secondary);
      }
    }
    
    &.success .metric-header .metric-icon {
      background: var(--green-6);
    }
    
    &.warning .metric-header .metric-icon {
      background: var(--orange-6);
    }
    
    &.info .metric-header .metric-icon {
      background: var(--blue-6);
    }
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--size-6);
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: var(--size-4);
    }
  }

  .section-card {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-6);
    margin-bottom: var(--size-6);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--size-4);
      
      h2, h3 {
        margin: 0;
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-6);
        color: var(--color-text-primary);
      }
      
      .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--color-text-secondary);
        padding: var(--size-1) var(--size-3);
        font-size: var(--font-size-0);
        
        &:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
      }
    }
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: var(--size-3);
    padding: var(--size-4);
    border-radius: var(--border-radius-default);
    border: 1px solid transparent;
    transition: all 0.2s ease;
    margin-bottom: var(--size-3);
    
    &:hover {
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-color);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-2);
      flex-shrink: 0;
      
      &.success {
        background: var(--green-1);
        color: var(--green-7);
      }
      
      &.warning {
        background: var(--orange-1);
        color: var(--orange-7);
      }
      
      &.info {
        background: var(--blue-1);
        color: var(--blue-7);
      }
    }
    
    .activity-content {
      flex: 1;
      min-width: 0;
      
      .activity-title {
        display: block;
        font-weight: var(--font-weight-5);
        color: var(--color-text-primary);
        margin-bottom: var(--size-1);
        line-height: 1.4;
      }
      
      .activity-meta {
        display: flex;
        gap: var(--size-2);
        font-size: var(--font-size-0);
        color: var(--color-text-muted);
        
        .activity-time, .activity-user {
          white-space: nowrap;
        }
      }
    }
  }

  .fleet-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--size-4);
  }

  .fleet-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--size-3);
    background: var(--color-bg-tertiary);
    border-radius: var(--radius-2);
    
    .stat-label {
      font-size: var(--font-size-0);
      color: var(--color-text-secondary);
      margin-bottom: var(--size-1);
    }
    
    .stat-value {
      font-size: var(--font-size-3);
      font-weight: var(--font-weight-7);
      color: var(--color-text-primary);
    }
  }

  .quick-actions-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
  }

  .quick-action-item {
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-3);
    border-radius: var(--radius-2);
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--color-bg-tertiary);
      
      .quick-action-arrow {
        transform: translateX(4px);
      }
    }
    
    .quick-action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-2);
      background: var(--color-accent);
      color: white;
      flex-shrink: 0;
    }
    
    .quick-action-content {
      flex: 1;
      min-width: 0;
      
      .quick-action-title {
        display: block;
        font-weight: var(--font-weight-5);
        color: var(--color-text-primary);
        margin-bottom: var(--size-1);
      }
      
      .quick-action-subtitle {
        font-size: var(--font-size-0);
        color: var(--color-text-secondary);
      }
    }
    
    .quick-action-arrow {
      color: var(--color-text-muted);
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
  }

  .status-list {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--size-3);
    
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      
      &.success {
        background: var(--green-6);
      }
      
      &.warning {
        background: var(--orange-6);
      }
      
      &.error {
        background: var(--red-6);
      }
    }
    
    .status-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      
      .status-label {
        font-size: var(--font-size-1);
        color: var(--color-text-primary);
      }
      
      .status-value {
        font-size: var(--font-size-0);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-5);
      }
    }
  }

  .performance-summary {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
  }

  .performance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--size-2) 0;
    border-bottom: 1px solid var(--border-color-light);
    
    &:last-child {
      border-bottom: none;
    }
    
    .performance-label {
      font-size: var(--font-size-1);
      color: var(--color-text-secondary);
    }
    
    .performance-value {
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-6);
      color: var(--color-text-primary);
    }
  }

  // Map section styles
  .map-section {
    margin: var(--size-6) 0;
  }

  .section-card.full-width {
    width: 100%;
    margin-bottom: var(--size-6);
  }

  .section-title {
    h2 {
      margin: 0 0 var(--size-1) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-6);
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
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-2);
      width: 100%;

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  }

  .map-container-wrapper {
    margin-top: var(--size-4);
    border-radius: var(--border-radius-default);
    overflow: hidden;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
  }

  .map-loading,
  .map-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
    color: var(--color-text-muted);

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--color-border-color);
      border-top: 3px solid var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: var(--size-3);
    }

    svg {
      margin-bottom: var(--size-3);
      color: var(--color-text-muted);
    }

    h4 {
      margin: 0 0 var(--size-2) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-2);
    }

    p {
      margin: 0 0 var(--size-4) 0;
      font-size: var(--font-size-1);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

</style>