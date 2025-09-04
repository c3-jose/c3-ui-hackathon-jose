<script lang="ts">
  import { onMount } from 'svelte';
  import { windTurbineStore } from '../stores/windturbine.js';
  import AddTurbineModal from './AddTurbineModal.svelte';
  import type { WindTurbine } from '../types/windturbine.js';
  
  // Apply client-side filtering to paginated API results
  $: filteredTurbines = $windTurbineStore.turbines.filter(turbine => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      turbine.name.toLowerCase().includes(searchTermLower) ||
      turbine.id.toLowerCase().includes(searchTermLower) ||
      turbine.manufacturer.name.toLowerCase().includes(searchTermLower) ||
      turbine.manufacturer.country.toLowerCase().includes(searchTermLower) ||
      formatLocation(turbine.latitude, turbine.longitude).includes(searchTermLower);
    
    const matchesManufacturer = !selectedManufacturer || 
      turbine.manufacturer.name === selectedManufacturer;
    
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'active' && turbine.active) ||
      (selectedStatus === 'inactive' && !turbine.active);
    
    return matchesSearch && matchesManufacturer && matchesStatus;
  });

  // Use filtered results
  $: turbines = filteredTurbines;
  
  // Extract unique manufacturers from current page data
  $: manufacturers = [...new Set($windTurbineStore.turbines.map(t => t.manufacturer.name))].sort();
  
  let searchTerm = '';
  let selectedManufacturer = '';
  let selectedStatus = '';
  let showAddModal = false;
  
  // Pagination settings
  const ITEMS_PER_PAGE = 25;
  
  onMount(() => {
    // Fetch real turbine data from API
    windTurbineStore.fetchTurbines(1, ITEMS_PER_PAGE, {});
  });

  // Handle modal events
  function openAddModal() {
    showAddModal = true;
  }

  function handleTurbineCreated() {
    // Refresh the turbine list after creation - go to last page to see new turbine
    const totalPages = Math.ceil(($windTurbineStore.totalCount + 1) / ITEMS_PER_PAGE);
    windTurbineStore.fetchTurbines(totalPages, ITEMS_PER_PAGE);
  }

  // Pagination functions (no need for filters since we're doing client-side filtering)
  function goToPage(page: number) {
    windTurbineStore.fetchTurbines(page, ITEMS_PER_PAGE, {});
  }

  function goToPrevPage() {
    if ($windTurbineStore.currentPage > 1) {
      goToPage($windTurbineStore.currentPage - 1);
    }
  }

  function goToNextPage() {
    const totalPages = Math.ceil($windTurbineStore.totalCount / ITEMS_PER_PAGE);
    if ($windTurbineStore.currentPage < totalPages) {
      goToPage($windTurbineStore.currentPage + 1);
    }
  }

  // Computed pagination values
  $: totalPages = Math.ceil($windTurbineStore.totalCount / ITEMS_PER_PAGE);
  $: currentPage = $windTurbineStore.currentPage;
  $: startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  $: endItem = Math.min(currentPage * ITEMS_PER_PAGE, $windTurbineStore.totalCount);
  
  // Generate page numbers to show (show current page ± 2)
  $: pageNumbers = (() => {
    if (totalPages <= 1) return [];
    
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  })();
  
  // Format capacity for display
  function formatCapacity(kw: number): string {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`;
    }
    return `${kw} kW`;
  }
  
  // Format location from lat/lng
  function formatLocation(lat: number, lng: number): string {
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
  
  // Navigate to detail view
  function viewDetails(turbine: WindTurbine) {
    window.location.href = `/windturbines/${turbine.id}`;
  }

  // Clear all filters (no need to refresh since filtering is client-side)
  function clearFilters() {
    searchTerm = '';
    selectedManufacturer = '';
    selectedStatus = '';
  }

  // Highlight search matches in text
  function highlightMatch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }
</script>

<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-6 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-4xl font-bold text-gray-900">Wind Turbines</h1>
        <p class="text-gray-600 mt-2">Manage and monitor your wind turbine fleet</p>
      </div>
      <button 
        on:click={openAddModal}
        class="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Turbine
      </button>
    </div>
    
    <!-- Filters Card -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900">Filters & Search</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Search turbines 
              <span class="text-xs text-gray-500 font-normal">(Press Escape to clear)</span>
            </label>
            <div class="relative">
              <input 
                type="text" 
                placeholder="Search by name, ID, manufacturer, or location..." 
                class="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                bind:value={searchTerm}
                on:keydown={(e) => {
                  if (e.key === 'Escape') {
                    searchTerm = '';
                    e.target.blur();
                  }
                }}
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {#if searchTerm}
                  <button 
                    class="pointer-events-auto w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    on:click={() => searchTerm = ''}
                    title="Clear search"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                  </button>
                {:else}
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                {/if}
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
            <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white" bind:value={selectedManufacturer}>
              <option value="">All Manufacturers</option>
              {#each manufacturers as manufacturer}
                <option value={manufacturer}>{manufacturer}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white" bind:value={selectedStatus}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Actions</label>
            <div class="flex gap-2">
              <button 
                class="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
                on:click={clearFilters}
              >
                Clear All
              </button>
              <button 
                class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200"
                on:click={() => windTurbineStore.fetchTurbines(currentPage, ITEMS_PER_PAGE, {})}
                title="Refresh data"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-100 mt-6 pt-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap gap-3">
              <div class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {#if searchTerm || selectedManufacturer || selectedStatus}
                  Page {currentPage} of {totalPages}
                {:else}
                  Total: {$windTurbineStore.totalCount}
                {/if}
              </div>
              <div class="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                Active: {turbines.filter(t => t.active).length}
              </div>
              <div class="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                Inactive: {turbines.filter(t => !t.active).length}
              </div>
            </div>
            
            <!-- Active Filters Display -->
            {#if searchTerm || selectedManufacturer || selectedStatus}
              <div class="flex flex-wrap gap-2">
                <span class="text-sm text-gray-600 font-medium">Active filters:</span>
                {#if searchTerm}
                  <span class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                    Search: "{searchTerm}"
                    <button 
                      class="ml-1 hover:text-blue-900"
                      on:click={() => searchTerm = ''}
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </span>
                {/if}
                {#if selectedManufacturer}
                  <span class="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                    Manufacturer: {selectedManufacturer}
                    <button 
                      class="ml-1 hover:text-purple-900"
                      on:click={() => selectedManufacturer = ''}
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </span>
                {/if}
                {#if selectedStatus}
                  <span class="inline-flex items-center px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-medium border border-orange-200">
                    Status: {selectedStatus}
                    <button 
                      class="ml-1 hover:text-orange-900"
                      on:click={() => selectedStatus = ''}
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                      </svg>
                    </button>
                  </span>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Results -->
    {#if $windTurbineStore.loading}
      <div class="bg-white rounded-xl shadow-lg border border-gray-200">
        <div class="flex justify-center items-center h-64">
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span class="text-gray-600 font-medium">Loading turbines...</span>
          </div>
        </div>
      </div>
    {:else if $windTurbineStore.error}
      <div class="bg-white rounded-xl shadow-lg border border-red-200">
        <div class="p-6">
          <div class="flex items-center gap-3 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-semibold">Error loading turbines</span>
          </div>
          <p class="text-gray-600 mt-2">{$windTurbineStore.error}</p>
          <button 
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            on:click={() => windTurbineStore.fetchTurbines()}
          >
            Retry
          </button>
        </div>
      </div>
    {:else if turbines.length === 0}
      <div class="bg-white rounded-xl shadow-lg border border-gray-200">
        <div class="text-center py-16 px-6">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">
            {#if $windTurbineStore.turbines.length === 0}
              No turbines found
            {:else}
              No turbines match your filters
            {/if}
          </h3>
          <p class="text-gray-600 mb-6">
            {#if $windTurbineStore.turbines.length === 0}
              Add a new turbine to get started.
            {:else}
              Try adjusting your search or filter criteria.
            {/if}
          </p>
          <button 
            on:click={openAddModal}
            class="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Your First Turbine
          </button>
        </div>
      </div>
    {:else}
      <!-- Turbines Table -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left">
                  <input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                </th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Turbine</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Manufacturer</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Installed</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each turbines as turbine}
                <tr class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                        <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                        </svg>
                      </div>
                      <div>
                        <button 
                          class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200"
                          on:click={() => viewDetails(turbine)}
                        >
                          {@html highlightMatch(turbine.name, searchTerm)}
                        </button>
                        <div class="text-sm text-gray-500">ID: {@html highlightMatch(turbine.id, searchTerm)}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="font-semibold text-gray-900">{@html highlightMatch(turbine.manufacturer.name, searchTerm)}</div>
                      <div class="text-sm text-gray-500">{@html highlightMatch(turbine.manufacturer.country, searchTerm)}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {formatLocation(turbine.latitude, turbine.longitude)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-lg font-bold text-gray-900 font-mono">
                      {formatCapacity(turbine.ratedCapacityKW)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {#if turbine.active}
                      <div class="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                        <div class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Active
                      </div>
                    {:else}
                      <div class="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                        <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                        Inactive
                      </div>
                    {/if}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(turbine.installationDate).toLocaleDateString()}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <button 
                        class="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        on:click={() => viewDetails(turbine)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                      <div class="relative">
                        <button class="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        <!-- Dropdown menu would go here -->
                      </div>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="flex items-center justify-between mt-8">
        <div class="text-sm text-gray-600">
          Showing <span class="font-semibold">{startItem}</span> to <span class="font-semibold">{endItem}</span> of <span class="font-semibold">{$windTurbineStore.totalCount}</span> results
        </div>
        <div class="flex items-center space-x-2">
          <!-- Previous Button -->
          <button 
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage <= 1}
            on:click={goToPrevPage}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </button>

          <!-- Page Numbers -->
          {#each pageNumbers as page}
            <button 
              class="px-3 py-2 text-sm font-medium border rounded-lg transition-colors duration-200"
              class:bg-blue-500={page === currentPage}
              class:border-blue-500={page === currentPage}
              class:text-white={page === currentPage}
              class:bg-white={page !== currentPage}
              class:border-gray-300={page !== currentPage}
              class:text-gray-500={page !== currentPage}
              class:hover:bg-gray-50={page !== currentPage}
              class:hover:text-gray-700={page !== currentPage}
              on:click={() => goToPage(page)}
            >
              {page}
            </button>
          {/each}

          <!-- Next Button -->
          <button 
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage >= totalPages}
            on:click={goToNextPage}
          >
            Next
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Add Turbine Modal -->
<AddTurbineModal 
  bind:isOpen={showAddModal}
  on:turbineCreated={handleTurbineCreated}
  on:close={() => showAddModal = false}
/>
