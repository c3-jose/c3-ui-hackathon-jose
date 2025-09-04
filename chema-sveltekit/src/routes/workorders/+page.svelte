<script lang="ts">
  import { onMount } from 'svelte';
  import { workOrders, workOrdersActions } from '$lib/stores';
  import type { WorkOrder, WorkOrderStatus } from '$lib/types';
  
  let searchQuery = '';
  let selectedStatus: WorkOrderStatus | '' = '';
  let sortField = 'creationDate';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  // Filter and sort work orders
  $: filteredWorkOrders = $workOrders.workOrders
    .filter(workOrder => {
      const matchesSearch = !searchQuery || 
        workOrder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workOrder.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workOrder.windTurbine.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !selectedStatus || workOrder.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'creationDate':
          aVal = new Date(a.creationDate);
          bVal = new Date(b.creationDate);
          break;
        case 'turbine':
          aVal = a.windTurbine.name;
          bVal = b.windTurbine.name;
          break;
        default:
          aVal = a.title;
          bVal = b.title;
      }
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' 
          ? aVal - bVal
          : bVal - aVal;
      }
    });
  
  function handleSort(field: string) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  function getStatusCounts() {
    return {
      total: $workOrders.workOrders.length,
      open: $workOrders.workOrders.filter(wo => wo.status === 'open').length,
      inProgress: $workOrders.workOrders.filter(wo => wo.status === 'in_progress').length,
      completed: $workOrders.workOrders.filter(wo => wo.status === 'completed').length
    };
  }
  
  onMount(() => {
    workOrdersActions.fetchWorkOrders();
  });
</script>

<div class="container">
  <div class="page-header">
    <div class="header-content">
      <h1>Work Orders</h1>
      <p>Track maintenance and repair work orders</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New Work Order
      </button>
    </div>
  </div>
  
  <!-- Summary Cards -->
  <div class="summary-grid">
    <div class="summary-card">
      <div class="summary-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
      </div>
      <div class="summary-content">
        <h3>{getStatusCounts().total}</h3>
        <p>Total Orders</p>
      </div>
    </div>
    
    <div class="summary-card warning">
      <div class="summary-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="summary-content">
        <h3>{getStatusCounts().open}</h3>
        <p>Open Orders</p>
      </div>
    </div>
    
    <div class="summary-card info">
      <div class="summary-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>
      <div class="summary-content">
        <h3>{getStatusCounts().inProgress}</h3>
        <p>In Progress</p>
      </div>
    </div>
    
    <div class="summary-card success">
      <div class="summary-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
      </div>
      <div class="summary-content">
        <h3>{getStatusCounts().completed}</h3>
        <p>Completed</p>
      </div>
    </div>
  </div>
  
  <!-- Filters and Search -->
  <div class="filters-section">
    <div class="search-box">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input 
        type="text" 
        placeholder="Search work orders..." 
        bind:value={searchQuery}
      />
    </div>
    
    <div class="filter-controls">
      <select bind:value={selectedStatus}>
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  </div>
  
  <!-- Results summary -->
  <div class="results-summary">
    <p>Showing {filteredWorkOrders.length} of {$workOrders.workOrders.length} work orders</p>
  </div>
  
  <!-- Loading state -->
  {#if $workOrders.loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading work orders...</p>
    </div>
  {:else if $workOrders.error}
    <div class="error-card">
      <h3>Error Loading Work Orders</h3>
      <p>{$workOrders.error}</p>
      <button class="btn btn-primary" on:click={() => workOrdersActions.fetchWorkOrders()}>
        Retry
      </button>
    </div>
  {:else}
    <!-- Data Table -->
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <button class="sort-button" on:click={() => handleSort('title')}>
                Title
                {#if sortField === 'title'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if sortDirection === 'asc'}
                      <polyline points="18,15 12,9 6,15"/>
                    {:else}
                      <polyline points="6,9 12,15 18,9"/>
                    {/if}
                  </svg>
                {/if}
              </button>
            </th>
            <th>
              <button class="sort-button" on:click={() => handleSort('turbine')}>
                Wind Turbine
                {#if sortField === 'turbine'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if sortDirection === 'asc'}
                      <polyline points="18,15 12,9 6,15"/>
                    {:else}
                      <polyline points="6,9 12,15 18,9"/>
                    {/if}
                  </svg>
                {/if}
              </button>
            </th>
            <th>
              <button class="sort-button" on:click={() => handleSort('status')}>
                Status
                {#if sortField === 'status'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if sortDirection === 'asc'}
                      <polyline points="18,15 12,9 6,15"/>
                    {:else}
                      <polyline points="6,9 12,15 18,9"/>
                    {/if}
                  </svg>
                {/if}
              </button>
            </th>
            <th>
              <button class="sort-button" on:click={() => handleSort('creationDate')}>
                Created
                {#if sortField === 'creationDate'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    {#if sortDirection === 'asc'}
                      <polyline points="18,15 12,9 6,15"/>
                    {:else}
                      <polyline points="6,9 12,15 18,9"/>
                    {/if}
                  </svg>
                {/if}
              </button>
            </th>
            <th>Resolution Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredWorkOrders as workOrder (workOrder.id)}
            <tr>
              <td>
                <div class="work-order-title">
                  <strong>{workOrder.title}</strong>
                  <p class="description">{workOrder.description}</p>
                </div>
              </td>
              <td>
                <a href="/windturbines/{workOrder.windTurbineId}" class="turbine-link">
                  {workOrder.windTurbine.name}
                </a>
              </td>
              <td>
                <span class="status status-{workOrder.status}">
                  {workOrder.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td>{formatDate(workOrder.creationDate)}</td>
              <td>
                {workOrder.resolutionDate ? formatDate(workOrder.resolutionDate) : '-'}
              </td>
              <td>
                <div class="actions">
                  <button class="action-btn" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn danger" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="6" class="no-results">
                No work orders found matching your criteria.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style lang="scss">
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-5);
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-3);
      align-items: flex-start;
    }
    
    .header-content {
      h1 {
        margin: 0 0 var(--size-1) 0;
        color: var(--text-primary);
        font-size: var(--font-size-5);
      }
      
      p {
        margin: 0;
        color: var(--text-secondary);
      }
    }
    
    .header-actions {
      display: flex;
      gap: var(--size-2);
      
      button {
        display: flex;
        align-items: center;
        gap: var(--size-2);
      }
    }
  }
  
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-4);
    margin-bottom: var(--size-5);
  }
  
  .summary-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-4);
    display: flex;
    align-items: center;
    gap: var(--size-3);
    
    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-2);
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }
    
    .summary-content {
      h3 {
        margin: 0;
        font-size: var(--font-size-3);
        font-weight: var(--font-weight-7);
        color: var(--text-primary);
      }
      
      p {
        margin: 0;
        color: var(--text-secondary);
        font-size: var(--font-size-0);
      }
    }
    
    &.warning .summary-icon {
      background: var(--orange-1);
      color: var(--orange-7);
    }
    
    &.info .summary-icon {
      background: var(--blue-1);
      color: var(--blue-7);
    }
    
    &.success .summary-icon {
      background: var(--green-1);
      color: var(--green-7);
    }
  }
  
  .filters-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-4);
    margin-bottom: var(--size-4);
    display: flex;
    gap: var(--size-4);
    align-items: center;
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  .search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
    
    svg {
      position: absolute;
      left: var(--size-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    
    input {
      width: 100%;
      padding: var(--size-2) var(--size-2) var(--size-2) var(--size-7);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--font-size-1);
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
      
      &::placeholder {
        color: var(--text-muted);
      }
    }
  }
  
  .filter-controls {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    
    select {
      padding: var(--size-2) var(--size-3);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--font-size-1);
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
  }
  
  .results-summary {
    margin-bottom: var(--size-3);
    
    p {
      color: var(--text-secondary);
      font-size: var(--font-size-1);
      margin: 0;
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
  
  .table-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    overflow: hidden;
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      background: var(--bg-tertiary);
      font-weight: var(--font-weight-6);
      color: var(--text-primary);
      text-align: left;
      padding: var(--size-3);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      
      .sort-button {
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: var(--size-1);
        padding: 0;
        
        &:hover {
          color: var(--color-accent);
        }
        
        svg {
          opacity: 0.7;
        }
      }
    }
    
    td {
      padding: var(--size-3);
      border-bottom: 1px solid var(--border-color);
      vertical-align: top;
    }
    
    tbody tr {
      transition: background-color 0.2s ease;
      
      &:hover {
        background: var(--bg-tertiary);
      }
      
      &:last-child td {
        border-bottom: none;
      }
    }
  }
  
  .work-order-title {
    strong {
      color: var(--text-primary);
      font-weight: var(--font-weight-6);
      display: block;
      margin-bottom: var(--size-1);
    }
    
    .description {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-0);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
  
  .turbine-link {
    color: var(--color-accent);
    text-decoration: none;
    font-weight: var(--font-weight-5);
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .actions {
    display: flex;
    gap: var(--size-2);
    
    .action-btn {
      padding: var(--size-1);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-1);
      background: var(--bg-primary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
        border-color: var(--color-accent);
        background: var(--bg-tertiary);
      }
      
      &.danger:hover {
        color: var(--color-error);
        border-color: var(--color-error);
      }
    }
  }
  
  .no-results {
    text-align: center;
    color: var(--text-muted);
    font-style: italic;
    padding: var(--size-5);
  }
</style>
