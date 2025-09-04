<script lang="ts">
  import { onMount } from 'svelte';
  import { dashboardStore } from '../stores/dashboard.js';

  // Subscribe to dashboard store
  $: ({ summary, loading, error } = $dashboardStore);

  onMount(() => {
    // Fetch dashboard data when component mounts
    dashboardStore.fetchSummary();
  });

  function formatPowerOutput(powerKW: number): string {
    if (powerKW >= 1000000) {
      return `${(powerKW / 1000000).toFixed(1)} GW`;
    } else if (powerKW >= 1000) {
      return `${(powerKW / 1000).toFixed(1)} MW`;
    }
    return `${powerKW.toFixed(0)} kW`;
  }

  function calculateInactiveCount(total: number, active: number): number {
    return total - active;
  }
</script>

<!-- Stats Overview -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
  {#if loading.summary}
    <!-- Loading State -->
    {#each Array(4) as _, i}
      <div class="group card bg-white border border-gray-200 shadow-lg">
        <div class="card-body p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div class="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div class="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
            <div class="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    {/each}
  {:else if error}
    <!-- Error State -->
    <div class="col-span-full bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center gap-3 text-red-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="font-semibold">Failed to load dashboard statistics</span>
      </div>
      <p class="text-red-600 mt-2 text-sm">{error}</p>
      <button 
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
        on:click={() => dashboardStore.fetchSummary()}
      >
        Retry
      </button>
    </div>
  {:else if summary}
    <!-- Real Data -->
    <!-- Total Turbines -->
    <div class="group card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="stat-title text-gray-600 font-semibold text-sm uppercase tracking-wide">Total Turbines</div>
            <div class="stat-value text-4xl font-bold text-gray-900 my-2">{summary.totalTurbines}</div>
            <div class="stat-desc text-green-600 font-medium">
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                {summary.activeTurbines} active
              </span>
            </div>
          </div>
          <div class="bg-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Alerts (Work Orders) -->
    <div class="group card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="stat-title text-gray-600 font-semibold text-sm uppercase tracking-wide">Open Work Orders</div>
            <div class="stat-value text-4xl font-bold text-gray-900 my-2">{summary.openWorkOrders}</div>
            <div class="stat-desc text-orange-600 font-medium">
              {summary.inProgressWorkOrders} in progress
            </div>
          </div>
          <div class="bg-red-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Power Output -->
    <div class="group card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="stat-title text-gray-600 font-semibold text-sm uppercase tracking-wide">Avg Power Output</div>
            <div class="stat-value text-4xl font-bold text-gray-900 my-2">{formatPowerOutput(summary.avgPowerOutput)}</div>
            <div class="stat-desc text-green-600 font-medium">
              <span class="inline-flex items-center gap-1">
                <svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                </svg>
                Last 24 hours
              </span>
            </div>
          </div>
          <div class="bg-green-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Fleet Status -->
    <div class="group card bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div class="card-body p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="stat-title text-gray-600 font-semibold text-sm uppercase tracking-wide">Fleet Status</div>
            <div class="stat-value text-4xl font-bold text-gray-900 my-2">
              {Math.round((summary.activeTurbines / summary.totalTurbines) * 100)}%
            </div>
            <div class="stat-desc text-gray-600 font-medium">
              {calculateInactiveCount(summary.totalTurbines, summary.activeTurbines)} offline
            </div>
          </div>
          <div class="bg-purple-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- No Data State -->
    <div class="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div class="text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <p class="font-medium">No dashboard data available</p>
        <p class="text-sm mt-1">Check your backend connection</p>
      </div>
    </div>
  {/if}
</div>
