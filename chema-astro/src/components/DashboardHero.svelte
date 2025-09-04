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
      return `${(powerKW / 1000000).toFixed(1)}GW`;
    } else if (powerKW >= 1000) {
      return `${(powerKW / 1000).toFixed(1)}MW`;
    }
    return `${powerKW.toFixed(0)}kW`;
  }
</script>

<!-- Hero Section -->
<div class="hero min-h-80 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0 opacity-30">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 60px 60px;"></div>
  </div>
  
  <!-- Additional gradient overlay for more depth -->
  <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
  
  <div class="hero-content text-center text-base-100 relative z-20 w-full py-12">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-8 flex justify-center">
        <div class="inline-flex p-4 bg-base-100/20 backdrop-blur-sm rounded-full shadow-2xl">
          <svg class="w-16 h-16 text-base-100" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2M12 21.5C16.97 21.5 21.5 18.79 21.5 15.5C21.5 14.5 21.17 13.56 20.55 12.77C19.93 11.98 19.03 11.35 18 10.96L17.45 12.38C18.17 12.65 18.75 13.1 19.15 13.68C19.55 14.26 19.75 14.87 19.75 15.5C19.75 17.43 16.83 19 12 19C7.17 19 4.25 17.43 4.25 15.5C4.25 14.87 4.45 14.26 4.85 13.68C5.25 13.1 5.83 12.65 6.55 12.38L6 10.96C4.97 11.35 4.07 11.98 3.45 12.77C2.83 13.56 2.5 14.5 2.5 15.5C2.5 18.79 7.03 21.5 12 21.5Z"/>
          </svg>
        </div>
      </div>
      <h1 class="mb-8 text-5xl md:text-6xl lg:text-7xl font-bold text-base-100 drop-shadow-2xl leading-tight">
        Wind Turbine Manager
      </h1>
      <p class="mb-10 text-lg md:text-xl text-base-100/90 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
        Monitor, analyze, and optimize your wind turbine fleet with real-time insights and AI-powered predictions.
      </p>
      
      <!-- Command Palette Style Actions -->
      <div class="max-w-2xl mx-auto">
        <!-- Primary Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <!-- Start Monitoring Card -->
          <a href="/windturbines" class="group relative overflow-hidden bg-base-200 rounded-2xl shadow-xl border border-base-300 hover:shadow-2xl hover:bg-base-100 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
            <div class="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative p-8">
              <div class="flex items-start justify-between mb-6">
                <div class="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg class="w-7 h-7 text-base-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center group-hover:bg-accent group-hover:text-base-100 transition-all duration-300">
                  <svg class="w-4 h-4 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-2xl font-bold text-base-content mb-2 group-hover:text-accent transition-colors duration-300">Start Monitoring</h3>
                  <p class="text-base-content/70 leading-relaxed">Access real-time fleet status, alerts, and operational metrics</p>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 bg-base-300 rounded-xl">
                  <div class="w-3 h-3 bg-success rounded-full animate-pulse shadow-lg"></div>
                  <span class="text-sm font-medium text-base-content">
                    {#if loading.summary}
                      <span class="animate-pulse">Loading turbines...</span>
                    {:else if summary}
                      <span>{summary.activeTurbines} turbines active</span>
                    {:else}
                      <span>Fleet status loading</span>
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          </a>
          
          <!-- View Analytics Card -->
          <a href="/analytics" class="group relative overflow-hidden bg-base-200 rounded-2xl shadow-xl border border-base-300 hover:shadow-2xl hover:bg-base-100 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]">
            <div class="absolute inset-0 bg-gradient-to-br from-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative p-8">
              <div class="flex items-start justify-between mb-6">
                <div class="w-14 h-14 bg-info rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg class="w-7 h-7 text-base-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2 a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center group-hover:bg-info group-hover:text-base-100 transition-all duration-300">
                  <svg class="w-4 h-4 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <h3 class="text-2xl font-bold text-base-content mb-2 group-hover:text-info transition-colors duration-300">View Analytics</h3>
                  <p class="text-base-content/70 leading-relaxed">Explore performance insights, trends, and predictive data</p>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 bg-base-300 rounded-xl">
                  <div class="w-3 h-3 bg-info rounded-full shadow-lg"></div>
                  <span class="text-sm font-medium text-base-content">
                    {#if loading.summary}
                      <span class="animate-pulse">Loading data...</span>
                    {:else if summary}
                      <span>Latest: {formatPowerOutput(summary.avgPowerOutput)} avg</span>
                    {:else}
                      <span>Power data loading</span>
                    {/if}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
        
        <!-- Secondary Actions -->
        <div class="flex justify-center">
          <div class="inline-flex items-center bg-base-200 rounded-2xl p-2 shadow-lg border border-base-300">
            <a href="/reports" class="group flex items-center gap-3 px-6 py-4 text-base-content/80 hover:text-base-content hover:bg-base-100 transition-all duration-200 rounded-xl font-medium">
              <div class="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center group-hover:bg-accent group-hover:text-base-100 transition-all duration-200">
                <svg class="w-4 h-4 text-base-content group-hover:text-base-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <span class="text-sm text-base-content">Reports</span>
            </a>
            
            <div class="w-px h-8 bg-base-300 mx-1"></div>
            
            <a href="/settings" class="group flex items-center gap-3 px-6 py-4 text-base-content/80 hover:text-base-content hover:bg-base-100 transition-all duration-200 rounded-xl font-medium">
              <div class="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center group-hover:bg-info group-hover:text-base-100 transition-all duration-200">
                <svg class="w-4 h-4 text-base-content group-hover:text-base-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="text-sm text-base-content">Settings</span>
            </a>
            
            <div class="w-px h-8 bg-base-300 mx-1"></div>
            
            <a href="/help" class="group flex items-center gap-3 px-6 py-4 text-base-content/80 hover:text-base-content hover:bg-base-100 transition-all duration-200 rounded-xl font-medium">
              <div class="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center group-hover:bg-warning group-hover:text-base-100 transition-all duration-200">
                <svg class="w-4 h-4 text-base-content group-hover:text-base-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="text-sm text-base-content">Help</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
