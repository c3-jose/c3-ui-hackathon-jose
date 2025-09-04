<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboard, dashboardActions } from '$lib/stores';
  import PowerChart from '$lib/components/PowerChart.svelte';
  import ManufacturerChart from '$lib/components/ManufacturerChart.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  
  onMount(() => {
    dashboardActions.fetchSummary();
  });
</script>

<div class="container dashboard-container">
  <Breadcrumb items={[
    { label: 'Home', href: '/', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
    { label: 'Analytics Dashboard', icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' }
  ]} />
  
  <div class="dashboard-header">
    <h1>Analytics Dashboard</h1>
    <p>Comprehensive analytics and performance insights</p>
  </div>
  
  {#if $dashboard.loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading analytics...</p>
    </div>
  {:else if $dashboard.error}
    <div class="error-card">
      <h3>Error Loading Analytics</h3>
      <p>{$dashboard.error}</p>
      <button class="btn btn-primary" on:click={() => dashboardActions.fetchSummary()}>
        Retry
      </button>
    </div>
  {:else if $dashboard.summary}
    <div class="analytics-grid">
      <!-- Fleet Overview -->
      <div class="analytics-section fleet-overview">
        <h2>Fleet Overview</h2>
        <div class="overview-stats">
          <div class="stat-item">
            <span class="stat-value">{$dashboard.summary.totalTurbines}</span>
            <span class="stat-label">Total Turbines</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{$dashboard.summary.activeTurbines}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{$dashboard.summary.totalTurbines - $dashboard.summary.activeTurbines}</span>
            <span class="stat-label">Inactive</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{Math.round(($dashboard.summary.activeTurbines / $dashboard.summary.totalTurbines) * 100)}%</span>
            <span class="stat-label">Uptime</span>
          </div>
        </div>
      </div>
      
      <!-- Work Orders Summary -->
      <div class="analytics-section work-orders-summary">
        <h2>Work Orders Status</h2>
        <div class="work-order-stats">
          <div class="work-order-item">
            <div class="work-order-icon open">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="work-order-content">
              <span class="work-order-count">{$dashboard.summary.openWorkOrders}</span>
              <span class="work-order-label">Open Orders</span>
            </div>
          </div>
          
          <div class="work-order-item">
            <div class="work-order-icon in-progress">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div class="work-order-content">
              <span class="work-order-count">{$dashboard.summary.inProgressWorkOrders}</span>
              <span class="work-order-label">In Progress</span>
            </div>
          </div>
          
          <div class="work-order-item">
            <div class="work-order-icon completed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <div class="work-order-content">
              <span class="work-order-count">{$dashboard.summary.totalWorkOrders - $dashboard.summary.openWorkOrders - $dashboard.summary.inProgressWorkOrders}</span>
              <span class="work-order-label">Completed</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Power Output -->
      <div class="analytics-section power-output">
        <h2>Power Performance</h2>
        <div class="power-metric">
          <div class="power-value">
            <span class="value">{Math.round($dashboard.summary.avgPowerOutput)}</span>
            <span class="unit">kW</span>
          </div>
          <span class="power-label">Average Power Output</span>
        </div>
        <div class="power-details">
          <div class="power-detail">
            <span class="detail-label">Peak Capacity</span>
            <span class="detail-value">{Math.round($dashboard.summary.avgPowerOutput * 1.3)} kW</span>
          </div>
          <div class="power-detail">
            <span class="detail-label">Efficiency</span>
            <span class="detail-value">85%</span>
          </div>
        </div>
      </div>
      
      <!-- Interactive Charts -->
      <div class="analytics-section chart-section">
        <PowerChart title="Power Output Trends (Last 24 Hours)" width={600} height={350} />
      </div>
      
      <div class="analytics-section chart-section">
        <ManufacturerChart title="Fleet Distribution by Manufacturer" width={600} height={350} />
      </div>
      
      <div class="analytics-section chart-section">
        <h2>Geographic Distribution</h2>
        <div class="chart-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Interactive map showing turbine locations and their performance metrics.</p>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <a href="/windturbines" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3>View All Turbines</h3>
          <p>Browse and manage your wind turbine fleet</p>
        </a>
        
        <a href="/workorders" class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <h3>Manage Work Orders</h3>
          <p>Track and update maintenance activities</p>
        </a>
        
        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h3>Add New Turbine</h3>
          <p>Register a new wind turbine in your fleet</p>
        </div>
        
        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h3>Export Data</h3>
          <p>Download performance reports and analytics</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--size-6);
    
    @media (max-width: 1200px) {
      padding: 0 var(--size-4);
    }
    
    @media (max-width: 768px) {
      padding: 0 var(--size-3);
    }
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: var(--size-6);
    
    h1 {
      color: var(--text-primary);
      margin-bottom: var(--size-2);
      font-size: var(--font-size-6);
      font-weight: var(--font-weight-7);
    }
    
    p {
      color: var(--text-secondary);
      font-size: var(--font-size-2);
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
      border: 3px solid var(--border-color);
      border-top: 3px solid var(--color-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    p {
      color: var(--text-secondary);
    }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-card {
    background: var(--bg-secondary);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-3);
    padding: var(--size-5);
    text-align: center;
    
    h3 {
      color: var(--color-error);
      margin-bottom: var(--size-2);
    }
    
    p {
      color: var(--text-secondary);
      margin-bottom: var(--size-4);
    }
  }
  
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--size-4);
    margin-bottom: var(--size-6);
  }
  
  .analytics-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-5);
    
    h2 {
      margin: 0 0 var(--size-4) 0;
      color: var(--text-primary);
      font-size: var(--font-size-3);
      font-weight: var(--font-weight-6);
    }
    
    &.chart-section {
      grid-column: span 2;
      
      @media (max-width: 768px) {
        grid-column: span 1;
      }
    }
  }
  
  .overview-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--size-3);
    
    .stat-item {
      text-align: center;
      padding: var(--size-3);
      background: var(--bg-tertiary);
      border-radius: var(--radius-2);
      
      .stat-value {
        display: block;
        font-size: var(--font-size-4);
        font-weight: var(--font-weight-7);
        color: var(--text-primary);
        margin-bottom: var(--size-1);
      }
      
      .stat-label {
        font-size: var(--font-size-0);
        color: var(--text-secondary);
      }
    }
  }
  
  .work-order-stats {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    
    .work-order-item {
      display: flex;
      align-items: center;
      gap: var(--size-3);
      padding: var(--size-3);
      background: var(--bg-tertiary);
      border-radius: var(--radius-2);
      
      .work-order-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-2);
        
        &.open {
          background: var(--orange-1);
          color: var(--orange-7);
        }
        
        &.in-progress {
          background: var(--blue-1);
          color: var(--blue-7);
        }
        
        &.completed {
          background: var(--green-1);
          color: var(--green-7);
        }
      }
      
      .work-order-content {
        display: flex;
        flex-direction: column;
        
        .work-order-count {
          font-size: var(--font-size-3);
          font-weight: var(--font-weight-7);
          color: var(--text-primary);
        }
        
        .work-order-label {
          font-size: var(--font-size-0);
          color: var(--text-secondary);
        }
      }
    }
  }
  
  .power-metric {
    text-align: center;
    margin-bottom: var(--size-4);
    
    .power-value {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: var(--size-2);
      margin-bottom: var(--size-2);
      
      .value {
        font-size: var(--font-size-7);
        font-weight: var(--font-weight-8);
        color: var(--color-accent);
      }
      
      .unit {
        font-size: var(--font-size-2);
        color: var(--text-secondary);
      }
    }
    
    .power-label {
      color: var(--text-secondary);
      font-size: var(--font-size-1);
    }
  }
  
  .power-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--size-3);
    
    .power-detail {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--size-3);
      background: var(--bg-tertiary);
      border-radius: var(--radius-2);
      
      .detail-label {
        font-size: var(--font-size-0);
        color: var(--text-secondary);
        margin-bottom: var(--size-1);
      }
      
      .detail-value {
        font-size: var(--font-size-2);
        font-weight: var(--font-weight-6);
        color: var(--text-primary);
      }
    }
  }
  
  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--size-6);
    text-align: center;
    color: var(--text-muted);
    border: 2px dashed var(--border-color);
    border-radius: var(--radius-2);
    
    svg {
      margin-bottom: var(--size-3);
      opacity: 0.5;
    }
    
    p {
      margin: 0;
      font-size: var(--font-size-1);
      line-height: 1.5;
    }
  }
  
  .quick-actions-section {
    h2 {
      margin-bottom: var(--size-4);
      color: var(--text-primary);
      font-size: var(--font-size-4);
    }
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--size-4);
  }
  
  .action-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-4);
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-3);
      transform: translateY(-2px);
    }
    
    .action-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-2);
      background: var(--color-accent);
      color: white;
      margin-bottom: var(--size-3);
    }
    
    h3 {
      margin: 0 0 var(--size-2) 0;
      color: var(--text-primary);
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-6);
    }
    
    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-1);
      line-height: 1.4;
    }
  }
</style>
