<script lang="ts">
  import { onMount } from 'svelte';
  import { windTurbines, windTurbinesActions, notificationsActions } from '$lib/stores';
  import type { WindTurbine, WindTurbineCreate } from '$lib/types';
  import Modal from '$lib/components/Modal.svelte';
  import AddTurbineForm from '$lib/components/AddTurbineForm.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  
  let searchQuery = '';
  let selectedManufacturer = '';
  let showActiveOnly = false;
  let sortField = 'name';
  let sortDirection: 'asc' | 'desc' = 'asc';
  
  // Advanced filter state
  let capacityMin = '';
  let capacityMax = '';
  let selectedCountry = '';
  let installationDateFrom = '';
  let installationDateTo = '';
  let showAdvancedFilters = false;
  
  // Modal and form state
  let showAddModal = false;
  let showEditModal = false;
  let showDeleteModal = false;
  let selectedTurbine: WindTurbine | null = null;
  let formLoading = false;
  let isSubmitting = false;
  let serverError: string | null = null;
  
  // Get unique values for filter dropdowns
  $: manufacturers = [...new Set($windTurbines.turbines.map(t => t.manufacturer.name))].sort();
  $: countries = [...new Set($windTurbines.turbines.map(t => t.manufacturer.country))].sort();
  
  // Enhanced search function with multiple fields
  function matchesSearchQuery(turbine: WindTurbine, query: string): boolean {
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    const searchableFields = [
      turbine.name,
      turbine.manufacturer.name,
      turbine.manufacturer.country,
      turbine.ratedCapacityKW?.toString(),
      turbine.active ? 'active' : 'inactive'
    ].filter(Boolean);
    
    return searchableFields.some(field => 
      field.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter and sort turbines with advanced filters
  $: filteredTurbines = $windTurbines.turbines
    .filter(turbine => {
      // Basic search across multiple fields
      const matchesSearch = matchesSearchQuery(turbine, searchQuery);
      
      // Manufacturer filter
      const matchesManufacturer = !selectedManufacturer || 
        turbine.manufacturer.name === selectedManufacturer;
      
      // Country filter
      const matchesCountry = !selectedCountry || 
        turbine.manufacturer.country === selectedCountry;
      
      // Active status filter
      const matchesActive = !showActiveOnly || turbine.active;
      
      // Capacity range filter
      const minCapacity = capacityMin ? parseFloat(capacityMin) : 0;
      const maxCapacity = capacityMax ? parseFloat(capacityMax) : Infinity;
      const turbineCapacity = turbine.ratedCapacityKW || 0;
      const matchesCapacity = turbineCapacity >= minCapacity && turbineCapacity <= maxCapacity;
      
      // Installation date range filter
      let matchesDateRange = true;
      if (installationDateFrom || installationDateTo) {
        const turbineDate = new Date(turbine.installationDate);
        const fromDate = installationDateFrom ? new Date(installationDateFrom) : new Date('1900-01-01');
        const toDate = installationDateTo ? new Date(installationDateTo) : new Date('2100-12-31');
        matchesDateRange = turbineDate >= fromDate && turbineDate <= toDate;
      }
      
      return matchesSearch && matchesManufacturer && matchesCountry && 
             matchesActive && matchesCapacity && matchesDateRange;
    })
    .sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortField) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'manufacturer':
          aVal = a.manufacturer.name;
          bVal = b.manufacturer.name;
          break;
        case 'capacity':
          aVal = a.ratedCapacityKW;
          bVal = b.ratedCapacityKW;
          break;
        case 'installationDate':
          aVal = new Date(a.installationDate);
          bVal = new Date(b.installationDate);
          break;
        default:
          aVal = a.name;
          bVal = b.name;
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
  
  // Clear all filters
  function clearAllFilters() {
    searchQuery = '';
    selectedManufacturer = '';
    selectedCountry = '';
    showActiveOnly = false;
    capacityMin = '';
    capacityMax = '';
    installationDateFrom = '';
    installationDateTo = '';
  }
  
  // Count active filters
  $: activeFilterCount = [
    searchQuery,
    selectedManufacturer,
    selectedCountry,
    showActiveOnly,
    capacityMin,
    capacityMax,
    installationDateFrom,
    installationDateTo
  ].filter(Boolean).length;
  
  // Quick filter presets
  function applyQuickFilter(type: string) {
    clearAllFilters();
    switch (type) {
      case 'high-capacity':
        capacityMin = '2000';
        break;
      case 'recent':
        installationDateFrom = '2020-01-01';
        break;
      case 'active':
        showActiveOnly = true;
        break;
      case 'enercon':
        selectedManufacturer = 'Enercon';
        break;
    }
  }
  
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  function formatCapacity(kw: number): string {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`;
    }
    return `${kw} kW`;
  }
  
  function handleAddTurbine() {
    selectedTurbine = null;
    serverError = null; // Clear errors when opening modal
    showAddModal = true;
  }
  
  function handleEditTurbine(turbine: WindTurbine) {
    selectedTurbine = turbine;
    showEditModal = true;
  }
  
  function handleDeleteTurbine(turbine: WindTurbine) {
    selectedTurbine = turbine;
    showDeleteModal = true;
  }
  
  async function handleAddTurbineSubmit(event: CustomEvent<WindTurbineCreate>) {
    isSubmitting = true;
    serverError = null; // Clear previous errors
    
    try {
      await windTurbinesActions.createTurbine(event.detail);
      notificationsActions.addNotification('success', 'Turbine Created', `Wind turbine "${event.detail.name}" created successfully!`);
      showAddModal = false;
    } catch (error) {
      // Set the server error to display in the form
      serverError = error instanceof Error ? error.message : 'Failed to create turbine';
      notificationsActions.addNotification('error', 'Error', serverError);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleFormSubmit(event: CustomEvent) {
    formLoading = true;
    
    try {
      if (showEditModal && selectedTurbine) {
        await windTurbinesActions.updateTurbine(selectedTurbine.id, event.detail);
        notificationsActions.addNotification('success', 'Turbine Updated', 'Wind turbine updated successfully!');
        showEditModal = false;
      }
      selectedTurbine = null;
    } catch (error) {
      notificationsActions.addNotification('error', 'Error', 'Failed to update turbine. Please try again.');
    } finally {
      formLoading = false;
    }
  }
  
  function handleFormCancel() {
    showAddModal = false;
    showEditModal = false;
    selectedTurbine = null;
    formLoading = false;
    serverError = null; // Clear errors when closing modal
  }
  
  async function confirmDelete() {
    if (selectedTurbine) {
      try {
        await windTurbinesActions.deleteTurbine(selectedTurbine.id);
        notificationsActions.addNotification('success', 'Turbine Deleted', 'Wind turbine has been deleted successfully');
      } catch (error) {
        notificationsActions.addNotification('error', 'Error', 'Failed to delete turbine. Please try again.');
      }
    }
    showDeleteModal = false;
    selectedTurbine = null;
  }
  
  onMount(() => {
    windTurbinesActions.fetchTurbines();
  });
</script>

<div class="container turbines-container">
  <Breadcrumb items={[
    { label: 'Home', href: '/', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' },
    { label: 'Wind Turbines', icon: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' }
  ]} />
  
  <div class="page-header">
    <div class="header-content">
      <h1>Wind Turbines</h1>
      <p>Manage your wind turbine fleet</p>
    </div>
    <div class="header-actions">
      <button class="btn btn-primary" on:click={handleAddTurbine}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Turbine
      </button>
    </div>
  </div>
  
  <!-- Enhanced Filters and Search -->
  <div class="filters-section">
    <!-- Search and Basic Filters -->
    <div class="filters-row primary-filters">
      <div class="search-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search by name, manufacturer, country, capacity..." 
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button class="clear-search" on:click={() => searchQuery = ''} title="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>
      
      <div class="filter-controls">
        <select bind:value={selectedManufacturer} class="filter-select">
          <option value="">All Manufacturers</option>
          {#each manufacturers as manufacturer}
            <option value={manufacturer}>{manufacturer}</option>
          {/each}
        </select>
        
        <select bind:value={selectedCountry} class="filter-select">
          <option value="">All Countries</option>
          {#each countries as country}
            <option value={country}>{country}</option>
          {/each}
        </select>
        
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            bind:checked={showActiveOnly}
          />
          <span>Active only</span>
        </label>
        
        <button 
          class="btn filter-toggle {showAdvancedFilters ? 'active' : ''}"
          on:click={() => showAdvancedFilters = !showAdvancedFilters}
          title="Advanced filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
          </svg>
          Advanced
          {#if activeFilterCount > 0}
            <span class="filter-badge">{activeFilterCount}</span>
          {/if}
        </button>
      </div>
    </div>

    <!-- Advanced Filters (Collapsible) -->
    {#if showAdvancedFilters}
      <div class="filters-row advanced-filters">
        <div class="advanced-filters-content">
          <!-- Capacity Range -->
          <div class="filter-group">
            <span class="filter-label">Capacity Range (kW)</span>
            <div class="range-inputs">
              <label class="sr-only" for="capacityMin">Minimum capacity</label>
              <input 
                id="capacityMin"
                type="number" 
                placeholder="Min" 
                bind:value={capacityMin}
                class="range-input"
                aria-label="Minimum capacity in kW"
              />
              <span class="range-separator">to</span>
              <label class="sr-only" for="capacityMax">Maximum capacity</label>
              <input 
                id="capacityMax"
                type="number" 
                placeholder="Max" 
                bind:value={capacityMax}
                class="range-input"
                aria-label="Maximum capacity in kW"
              />
            </div>
          </div>

          <!-- Installation Date Range -->
          <div class="filter-group">
            <span class="filter-label">Installation Date</span>
            <div class="date-inputs">
              <label class="sr-only" for="installationDateFrom">Installation date from</label>
              <input 
                id="installationDateFrom"
                type="date" 
                bind:value={installationDateFrom}
                class="date-input"
                aria-label="Installation date from"
              />
              <span class="range-separator">to</span>
              <label class="sr-only" for="installationDateTo">Installation date to</label>
              <input 
                id="installationDateTo"
                type="date" 
                bind:value={installationDateTo}
                class="date-input"
                aria-label="Installation date to"
              />
            </div>
          </div>

          <!-- Quick Filter Presets -->
          <div class="filter-group">
            <span class="filter-label">Quick Filters</span>
            <div class="quick-filters">
              <button 
                class="btn btn-ghost quick-filter-btn"
                on:click={() => applyQuickFilter('high-capacity')}
                title="Turbines with capacity > 2000 kW"
              >
                High Capacity
              </button>
              <button 
                class="btn btn-ghost quick-filter-btn"
                on:click={() => applyQuickFilter('recent')}
                title="Installed since 2020"
              >
                Recent
              </button>
              <button 
                class="btn btn-ghost quick-filter-btn"
                on:click={() => applyQuickFilter('active')}
                title="Active turbines only"
              >
                Active Only
              </button>
              <button 
                class="btn btn-ghost quick-filter-btn"
                on:click={() => applyQuickFilter('enercon')}
                title="Enercon turbines"
              >
                Enercon
              </button>
            </div>
          </div>

          <!-- Clear Filters -->
          <div class="filter-group">
            <button 
              class="btn btn-warning clear-filters-btn"
              on:click={clearAllFilters}
              disabled={activeFilterCount === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Enhanced Results Summary -->
  <div class="results-summary">
    <div class="results-info">
      <p class="results-count">
        Showing <strong>{filteredTurbines.length}</strong> of <strong>{$windTurbines.turbines.length}</strong> turbines
        {#if activeFilterCount > 0}
          <span class="filter-indicator">({activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'} applied)</span>
        {/if}
      </p>
      
      {#if filteredTurbines.length > 0}
        <div class="results-stats">
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {filteredTurbines.filter(t => t.active).length} active
          </span>
          <span class="stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {Math.round(filteredTurbines.reduce((sum, t) => sum + (t.ratedCapacityKW || 0), 0) / 1000).toLocaleString()} MW total
          </span>
        </div>
      {/if}
    </div>
    
    {#if activeFilterCount > 0}
      <button 
        class="btn btn-ghost clear-all-btn"
        on:click={clearAllFilters}
        title="Clear all filters"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Clear filters
      </button>
    {/if}
  </div>
  
  <!-- Loading state -->
  {#if $windTurbines.loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading turbines...</p>
    </div>
  {:else if $windTurbines.error}
    <div class="error-card">
      <h3>Error Loading Turbines</h3>
      <p>{$windTurbines.error}</p>
      <button class="btn btn-primary" on:click={() => windTurbinesActions.fetchTurbines()}>
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
              <button class="sort-button" on:click={() => handleSort('name')}>
                Name
                {#if sortField === 'name'}
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
              <button class="sort-button" on:click={() => handleSort('manufacturer')}>
                Manufacturer
                {#if sortField === 'manufacturer'}
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
              <button class="sort-button" on:click={() => handleSort('capacity')}>
                Capacity
                {#if sortField === 'capacity'}
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
              <button class="sort-button" on:click={() => handleSort('installationDate')}>
                Installation Date
                {#if sortField === 'installationDate'}
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
            <th>Status</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredTurbines as turbine (turbine.id)}
            <tr on:click={() => window.location.href = `/windturbines/${turbine.id}`}>
              <td>
                <div class="turbine-name">
                  <strong>{turbine.name}</strong>
                </div>
              </td>
              <td>
                <div class="manufacturer-info">
                  <span class="name">{turbine.manufacturer.name}</span>
                  <span class="country">{turbine.manufacturer.country}</span>
                </div>
              </td>
              <td>{formatCapacity(turbine.ratedCapacityKW)}</td>
              <td>{formatDate(turbine.installationDate)}</td>
              <td>
                <span class="status {turbine.active ? 'status-active' : 'status-inactive'}">
                  {turbine.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div class="location">
                  <span>{turbine.latitude.toFixed(4)}, {turbine.longitude.toFixed(4)}</span>
                </div>
              </td>
              <td>
                <div class="actions">
                  <button class="action-btn" title="Edit" on:click|stopPropagation={() => handleEditTurbine(turbine)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="action-btn danger" title="Delete" on:click|stopPropagation={() => handleDeleteTurbine(turbine)}>
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
              <td colspan="7" class="no-results">
                No turbines found matching your criteria.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Add Turbine Modal -->
<Modal bind:isOpen={showAddModal} title="Add New Wind Turbine" size="large">
  <AddTurbineForm
    {isSubmitting}
    {serverError}
    on:submit={handleAddTurbineSubmit}
    on:cancel={handleFormCancel}
  />
</Modal>

<!-- Edit Turbine Modal -->
<Modal bind:isOpen={showEditModal} title="Edit Wind Turbine" size="lg">
  <TurbineForm
    turbine={selectedTurbine}
    isEditing={true}
    loading={formLoading}
    on:submit={handleFormSubmit}
    on:cancel={handleFormCancel}
  />
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:isOpen={showDeleteModal} title="Confirm Deletion" size="sm">
  <div class="delete-confirmation">
    <div class="delete-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </div>
    <h3>Delete Wind Turbine</h3>
    <p>Are you sure you want to delete <strong>{selectedTurbine?.name}</strong>?</p>
    <p class="warning">This action cannot be undone.</p>
  </div>
  
  <svelte:fragment slot="footer">
    <button class="btn" on:click={() => { showDeleteModal = false; selectedTurbine = null; }}>
      Cancel
    </button>
    <button class="btn btn-danger" on:click={confirmDelete}>
      Delete Turbine
    </button>
  </svelte:fragment>
</Modal>

<style lang="scss">
  .turbines-container {
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-5);
    padding: var(--size-5) 0;
    border-bottom: 1px solid var(--border-color);
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-3);
      align-items: flex-start;
      padding: var(--size-4) 0;
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
  
  .filters-section {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    margin-bottom: var(--size-6);
    overflow: hidden;
  }

  .filters-row {
    &.primary-filters {
      padding: var(--size-5);
      display: flex;
      gap: var(--size-4);
      align-items: flex-start;
      flex-wrap: wrap;
      
      @media (max-width: 1024px) {
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-4);
      }
    }

    &.advanced-filters {
      border-top: 1px solid var(--color-border-color);
      background: var(--color-bg-tertiary);
      padding: var(--size-6) var(--size-5);
      
      @media (max-width: 768px) {
        padding: var(--size-4);
      }
    }
  }
  
  .search-box {
    position: relative;
    flex: 1;
    min-width: 300px;
    max-width: 500px;
    
    // Search icon (the magnifying glass)
    > svg:first-child {
      position: absolute;
      left: var(--size-3);
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      pointer-events: none;
      z-index: 1;
    }
    
    input {
      width: 100%;
      padding: var(--size-3) var(--size-10) var(--size-3) var(--size-10);
      border: 1px solid var(--color-border-color);
      border-radius: var(--border-radius-default);
      background: var(--color-bg-primary);
      color: var(--color-text-primary);
      font-size: var(--font-size-1);
      transition: var(--transition-theme);
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: var(--shadow-focus);
      }
      
      &::placeholder {
        color: var(--color-text-muted);
      }
    }

    .clear-search {
      position: absolute;
      right: var(--size-3);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: var(--size-1);
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: var(--border-radius-default);
      transition: var(--transition-theme);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-tertiary);
      }

      &:focus {
        outline: none;
        box-shadow: var(--shadow-focus);
      }
    }
  }
  
  .filter-controls {
    display: flex;
    gap: var(--size-3);
    align-items: center;
    
    @media (max-width: 768px) {
      flex-wrap: wrap;
    }
    
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
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      cursor: pointer;
      user-select: none;
      
      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: var(--color-accent);
      }
      
      span {
        color: var(--text-primary);
        font-size: var(--font-size-1);
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
      cursor: pointer;
      transition: background-color 0.2s ease;
      
      &:hover {
        background: var(--bg-tertiary);
      }
      
      &:last-child td {
        border-bottom: none;
      }
    }
  }
  
  .turbine-name {
    strong {
      color: var(--text-primary);
      font-weight: var(--font-weight-6);
    }
  }
  
  .manufacturer-info {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
    
    .name {
      color: var(--text-primary);
      font-weight: var(--font-weight-5);
    }
    
    .country {
      color: var(--text-secondary);
      font-size: var(--font-size-0);
    }
  }
  
  .location {
    font-family: monospace;
    font-size: var(--font-size-0);
    color: var(--text-secondary);
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
  
  .delete-confirmation {
    text-align: center;
    padding: var(--size-4);
    
    .delete-icon {
      display: flex;
      justify-content: center;
      margin-bottom: var(--size-3);
      
      svg {
        color: var(--color-error);
      }
    }
    
    h3 {
      margin: 0 0 var(--size-3) 0;
      color: var(--text-primary);
      font-size: var(--font-size-3);
    }
    
    p {
      margin: 0 0 var(--size-2) 0;
      color: var(--text-primary);
      
      &.warning {
        color: var(--color-error);
        font-size: var(--font-size-0);
        font-style: italic;
      }
      
      strong {
        color: var(--text-primary);
      }
    }
  }
  
  .btn-danger {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
    
    &:hover {
      background: var(--red-7);
      border-color: var(--red-7);
    }
  }

  // Enhanced filter styles
  .filter-controls {
    display: flex;
    gap: var(--size-4);
    align-items: center;
    flex-wrap: wrap;
    flex-shrink: 0;

    @media (max-width: 1024px) {
      width: 100%;
      justify-content: flex-start;
      gap: var(--size-3);
    }

    @media (max-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: var(--size-3);
      width: 100%;
    }
  }

  .filter-select {
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    min-width: 140px;
    min-height: 38px;
    transition: var(--transition-theme);

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: var(--shadow-focus);
    }
  }

  .filter-toggle {
    position: relative;
    padding: var(--size-2) var(--size-4);
    display: flex;
    align-items: center;
    gap: var(--size-2);
    font-size: var(--font-size-1);
    white-space: nowrap;
    
    &.active {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }

    .filter-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: var(--color-warning);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: var(--font-size-0);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-6);
      border: 2px solid var(--color-bg-secondary);
    }
  }

  .advanced-filters-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--size-6);
    align-items: start;
    
    @media (max-width: 1024px) {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--size-5);
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: var(--size-4);
    }
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    padding: var(--size-1) 0;
  }

  .filter-label {
    font-weight: var(--font-weight-6);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    margin-bottom: var(--size-1);
  }

  .range-inputs,
  .date-inputs {
    display: flex;
    align-items: center;
    gap: var(--size-2);
  }

  .range-input,
  .date-input {
    flex: 1;
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    transition: var(--transition-theme);
    min-width: 0; // Prevents overflow in flex containers

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: var(--shadow-focus);
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  // Screen reader only class for accessibility
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .range-separator {
    color: var(--color-text-muted);
    font-size: var(--font-size-1);
    flex-shrink: 0;
  }

  .quick-filters {
    display: flex;
    gap: var(--size-2);
    flex-wrap: wrap;
  }

  .quick-filter-btn {
    font-size: var(--font-size-1);
    padding: var(--size-2) var(--size-3);
    white-space: nowrap;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }
  }

  .clear-filters-btn {
    padding: var(--size-2) var(--size-4);
    display: flex;
    align-items: center;
    gap: var(--size-2);
    font-size: var(--font-size-1);
    white-space: nowrap;
    min-width: fit-content;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-muted);
        border-color: var(--color-border-color);
        transform: none;
      }
    }
  }

  // Enhanced results summary
  .results-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--size-4);
    padding: var(--size-3) var(--size-4);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-2);
      align-items: stretch;
    }
  }

  .results-info {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
  }

  .results-count {
    margin: 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-1);

    strong {
      color: var(--color-accent);
      font-weight: var(--font-weight-6);
    }
  }

  .filter-indicator {
    color: var(--color-text-muted);
    font-size: var(--font-size-0);
  }

  .results-stats {
    display: flex;
    gap: var(--size-4);
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: var(--size-1);
    }
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--size-1);
    color: var(--color-text-secondary);
    font-size: var(--font-size-0);

    svg {
      color: var(--color-accent);
      flex-shrink: 0;
    }
  }

  .clear-all-btn {
    font-size: var(--font-size-1);
    padding: var(--size-2) var(--size-3);
    display: flex;
    align-items: center;
    gap: var(--size-2);
    white-space: nowrap;
    min-height: 38px;
    
    @media (max-width: 768px) {
      width: 100%;
      justify-content: center;
    }
  }

  // Checkbox styling
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    cursor: pointer;
    font-size: var(--font-size-1);
    color: var(--color-text-primary);
    white-space: nowrap;
    padding: var(--size-2) var(--size-3);
    min-height: 38px;
    border: 1px solid transparent;
    border-radius: var(--border-radius-default);
    transition: var(--transition-theme);

    input[type="checkbox"] {
      margin: 0;
      width: 16px;
      height: 16px;
      accent-color: var(--color-accent);
    }

    &:hover {
      color: var(--color-accent);
      background: var(--color-bg-tertiary);
      border-color: var(--color-border-color);
    }
  }
</style>
