<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { windTurbineStore, turbineDetailStore } from '../stores/windturbine.js';
  import type { WindTurbine } from '../types/windturbine.js';
  
  export let turbineId: string;
  
  // Import chart components
  import LineChart from './charts/LineChart.svelte';
  import GaugeChart from './charts/GaugeChart.svelte';
  import BarChart from './charts/BarChart.svelte';
  import TurbineLocationMapLeaflet from './TurbineLocationMapLeaflet.svelte';
  
  let activeTab = 'overview';
  
  // Get tab from URL or set default
  function getTabFromUrl(): string {
    if (typeof window === 'undefined') return 'overview'; // SSR safety
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const validTabs = ['overview', 'work-orders', 'power-output', 'predictions'];
    return validTabs.includes(tabParam || '') ? tabParam! : 'overview';
  }
  
  // Update URL with tab parameter
  function updateUrl(tabName: string) {
    if (typeof window === 'undefined') return; // SSR safety
    const url = new URL(window.location.href);
    if (tabName === 'overview') {
      url.searchParams.delete('tab'); // Remove tab param for default overview
    } else {
      url.searchParams.set('tab', tabName);
    }
    window.history.pushState({}, '', url.toString());
  }
  
  // Switch tab function with URL management
  function switchTab(tabName: string) {
    activeTab = tabName;
    
    // Update URL for bookmarking/sharing
    updateUrl(tabName);
    
    // Future: When API endpoints are available, fetch data here
    // if (tabName === 'work-orders' && turbineId) {
    //   turbineDetailStore.fetchWorkOrders(turbineId);
    // } else if (tabName === 'power-output' && turbineId) {
    //   turbineDetailStore.fetchPowerOutput(turbineId);
    // } else if (tabName === 'predictions' && turbineId) {
    //   turbineDetailStore.fetchAlertPredictions(turbineId);
    // }
  }
  
  // Get turbine data from store
  $: turbine = $windTurbineStore.selectedTurbine;
  $: loading = $windTurbineStore.loading;
  $: error = $windTurbineStore.error;
  
  
  // Mock data for demonstration (since API endpoints don't exist yet)
  const mockWorkOrders = [
    {
      id: '1',
      title: 'Routine Blade Inspection',
      description: 'Monthly inspection of turbine blades for wear and damage',
      status: 'Open',
      priority: 'Medium',
      createdAt: '2024-01-15T10:00:00Z',
      dueDate: '2024-01-25T18:00:00Z'
    },
    {
      id: '2',
      title: 'Gearbox Oil Change',
      description: 'Scheduled gearbox maintenance and oil replacement',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2024-01-10T08:30:00Z',
      dueDate: '2024-01-20T16:00:00Z'
    },
    {
      id: '3',
      title: 'Generator Cleaning',
      description: 'Clean and service electrical generator components',
      status: 'Completed',
      priority: 'Low',
      createdAt: '2024-01-05T14:00:00Z',
      dueDate: null
    }
  ];
  
  // Generate realistic alert predictions based on turbine characteristics
  $: mockAlertPredictions = (() => {
    if (!turbine) return [];
    
    const turbineAge = new Date().getFullYear() - new Date(turbine.builtDate).getFullYear();
    const isOldTurbine = turbineAge > 8;
    const isInactive = !turbine.active;
    const manufacturer = turbine.manufacturer.name.toLowerCase();
    
    const predictions = [];
    
    // Age-based predictions
    if (isOldTurbine) {
      predictions.push({
        id: '1',
        type: 'Bearing Temperature Alert',
        severity: 'High',
        probability: 0.75 + (turbineAge - 8) * 0.05,
        predictedDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Main bearing showing wear patterns typical for ${turbineAge}-year-old turbine`,
        recommendation: 'Schedule maintenance inspection within 2 weeks',
        confidenceScore: 85 + Math.min(10, turbineAge - 8),
        dataPoints: 'Temperature sensors, vibration analysis, oil condition'
      });
    }
    
    // Capacity-based predictions
    if (turbine.ratedCapacityKW > 2000) {
      predictions.push({
        id: '2',
        type: 'Gearbox Oil Quality',
        severity: isOldTurbine ? 'High' : 'Medium',
        probability: 0.60 + (isOldTurbine ? 0.20 : 0),
        predictedDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Large turbine gearbox requires frequent oil monitoring',
        recommendation: 'Schedule oil analysis and potential replacement',
        confidenceScore: 80,
        dataPoints: 'Oil temperature, viscosity trends, particle analysis'
      });
    }
    
    // Manufacturer-specific predictions
    if (manufacturer.includes('vestas') || manufacturer.includes('siemens')) {
      predictions.push({
        id: '3',
        type: 'Blade Pitch System',
        severity: 'Low',
        probability: 0.35,
        predictedDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Pitch control system showing minor performance variations',
        recommendation: 'Monitor pitch accuracy during routine inspections',
        confidenceScore: 72,
        dataPoints: 'Pitch sensor data, motor performance, wind response'
      });
    }
    
    // Inactive turbine predictions
    if (isInactive) {
      predictions.push({
        id: '4',
        type: 'Extended Downtime Risk',
        severity: 'Medium',
        probability: 0.80,
        predictedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Prolonged inactivity may lead to component degradation',
        recommendation: 'Perform maintenance check and restart sequence',
        confidenceScore: 90,
        dataPoints: 'System status logs, environmental conditions, maintenance history'
      });
    }
    
    // Location-based predictions (northern latitudes have more weather stress)
    if (Math.abs(turbine.latitude) > 45) {
      predictions.push({
        id: '5',
        type: 'Weather Stress Alert',
        severity: 'Low',
        probability: 0.50,
        predictedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'High latitude location increases weather-related stress',
        recommendation: 'Monitor for ice buildup and temperature fluctuations',
        confidenceScore: 75,
        dataPoints: 'Weather station data, temperature sensors, vibration patterns'
      });
    }
    
    return predictions.slice(0, 4); // Limit to 4 predictions
  })();
  
  // Use mock data instead of store data for now
  $: mockDetailStore = {
    workOrders: mockWorkOrders,
    alertPredictions: mockAlertPredictions,
    powerOutput: [],
    loading: {
      workOrders: false,
      powerOutput: false,
      alertPredictions: false
    },
    error: {
      workOrders: null,
      powerOutput: null,
      alertPredictions: null
    }
  };
  
  onMount(() => {
    // Initialize active tab from URL
    activeTab = getTabFromUrl();
    
    // Listen for browser back/forward navigation
    const handlePopState = (event) => {
      const newTab = getTabFromUrl();
      activeTab = newTab;
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }
    
    // Fetch real turbine data from API
    windTurbineStore.fetchTurbine(turbineId);
    
    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  });
  
  // Format capacity
  function formatCapacity(kw: number): string {
    if (kw >= 1000) {
      return `${(kw / 1000).toFixed(1)} MW`;
    }
    return `${kw} kW`;
  }
  
  // Get detail data from turbine detail store
  $: detailStore = $turbineDetailStore;
  
  // Fetch detailed data when turbine ID changes (disabled - using mock data)
  // $: if (turbineId && turbine) {
  //   turbineDetailStore.fetchWorkOrders(turbineId);
  //   turbineDetailStore.fetchPowerOutput(turbineId);
  //   turbineDetailStore.fetchAlertPredictions(turbineId);
  // }

  // Create realistic power output data based on turbine characteristics
  $: powerOutputData = (() => {
    try {
      if (!turbine || !calculatedMetrics) return [];
      
      const capacityMW = turbine.ratedCapacityKW / 1000;
      const efficiency = calculatedMetrics.efficiency / 100;
      const now = new Date();
      const data = [];
      
      // Generate 24 hours of realistic power output data
      for (let i = 0; i < 24; i += 4) {
        const timestamp = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
        
        // Simulate wind patterns (higher at night and morning)
        const hourOfDay = timestamp.getHours();
        const windFactor = 0.6 + 0.4 * Math.sin((hourOfDay + 6) * Math.PI / 12);
        
        // Calculate realistic power output
        const baseOutput = capacityMW * efficiency * windFactor;
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        const powerOutput = turbine.active ? baseOutput * randomVariation : 0;
        
        data.push({
          date: timestamp,
          value: Math.round(powerOutput * 100) / 100,
          label: 'Power Output'
        });
      }
      
      return data.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error creating powerOutputData:', error);
      return [];
    }
  })();

  // Generate performance metrics from real data
  $: performanceData = (() => {
    try {
      if (!turbine) return [];
      
      const turbineAge = new Date().getFullYear() - new Date(turbine.builtDate).getFullYear();
      const isNewTurbine = turbineAge <= 2;
      const capacityMW = turbine.ratedCapacityKW / 1000;
      
      // Calculate efficiency based on turbine age and capacity (realistic simulation)
      const baseEfficiency = turbine.active ? 88 : 0;
      const ageBonus = isNewTurbine ? 8 : Math.max(0, 6 - turbineAge * 0.5);
      const capacityBonus = capacityMW > 2 ? 4 : 2;
      const calculatedEfficiency = Math.min(100, baseEfficiency + ageBonus + capacityBonus);
      
      return [
        { label: 'Status', value: turbine.active ? 100 : 0, color: turbine.active ? '#059669' : '#dc2626' },
        { label: 'Capacity (MW)', value: capacityMW, color: '#3b82f6' },
        { label: 'Age (Years)', value: turbineAge, color: '#8b5cf6' },
        { label: 'Efficiency (%)', value: Math.round(calculatedEfficiency * 10) / 10, color: '#06b6d4' }
      ];
    } catch (error) {
      console.error('Error creating performanceData:', error);
      return [];
    }
  })();

  // Calculate real-time performance metrics from turbine data
  $: calculatedMetrics = (() => {
    if (!turbine) return null;
    
    const turbineAge = new Date().getFullYear() - new Date(turbine.builtDate).getFullYear();
    const capacityMW = turbine.ratedCapacityKW / 1000;
    const efficiency = performanceData.find(p => p.label === 'Efficiency (%)')?.value || 88;
    
    // Calculate realistic current output based on capacity and efficiency
    const baseOutput = capacityMW * (efficiency / 100);
    const variabilityFactor = 0.8 + (Math.random() * 0.4); // 80-120% variation
    const currentOutput = turbine.active ? baseOutput * variabilityFactor : 0;
    
    // Calculate capacity factor (typical range 25-45% for wind turbines)
    const capacityFactor = turbine.active ? 
      Math.min(50, 25 + (efficiency - 80) * 1.5 + Math.random() * 5) : 0;
    
    // Simulate wind speed based on location (latitude affects wind patterns)
    const latitudeFactor = Math.abs(turbine.latitude) / 90;
    const baseWindSpeed = 8 + latitudeFactor * 6;
    const windSpeed = baseWindSpeed + (Math.random() - 0.5) * 4;
    
    return {
      currentOutput: Math.round(currentOutput * 100) / 100,
      efficiency: Math.round(efficiency * 10) / 10,
      capacityFactor: Math.round(capacityFactor * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      outputPercentChange: (Math.random() - 0.5) * 15, // ±7.5% variation
      efficiencyMonthChange: turbine.active ? (Math.random() - 0.3) * 4 : -5, // Slight positive bias when active
      capacityFactorTrend: turbineAge > 5 ? 'declining' : 'stable'
    };
  })();

  // Create prediction chart data for timeline visualization
  $: predictionChartData = (() => {
    if (!mockDetailStore.alertPredictions || mockDetailStore.alertPredictions.length === 0) return [];
    
    const now = new Date();
    const baselineData = [];
    
    // Add current baseline (no risk)
    baselineData.push({
      date: now,
      value: 5, // Base risk level
      label: 'Current Status'
    });
    
    // Add prediction points sorted by date
    const sortedPredictions = [...mockDetailStore.alertPredictions]
      .sort((a, b) => new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime());
    
    let cumulativeRisk = 5; // Start at baseline
    
    sortedPredictions.forEach((prediction, index) => {
      const predictionDate = new Date(prediction.predictedDate);
      const probability = prediction.probability * 100;
      
      // Add a point just before the prediction
      const preDate = new Date(predictionDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
      baselineData.push({
        date: preDate,
        value: cumulativeRisk,
        label: 'Risk Building'
      });
      
      // Add the prediction point with cumulative risk
      cumulativeRisk = Math.min(95, cumulativeRisk + probability * 0.6); // Gradual increase, cap at 95%
      baselineData.push({
        date: predictionDate,
        value: cumulativeRisk,
        label: `${prediction.type} (${probability.toFixed(0)}%)`
      });
    });
    
    // Add future projection (risk typically stabilizes or slowly increases)
    const lastPrediction = sortedPredictions[sortedPredictions.length - 1];
    if (lastPrediction) {
      const futureDate = new Date(new Date(lastPrediction.predictedDate).getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after last prediction
      baselineData.push({
        date: futureDate,
        value: Math.min(100, cumulativeRisk + 5), // Slight increase over time
        label: 'Projected Risk'
      });
    }
    
    return baselineData;
  })();

  // Create bar chart data for individual prediction probabilities
  $: predictionBarChartData = (() => {
    if (!mockDetailStore.alertPredictions || mockDetailStore.alertPredictions.length === 0) return [];
    
    return mockDetailStore.alertPredictions.map(prediction => {
      // Color based on severity
      let color = '#06b6d4'; // Default blue
      switch (prediction.severity.toLowerCase()) {
        case 'high':
          color = '#dc2626'; // Red
          break;
        case 'medium':
          color = '#d97706'; // Orange
          break;
        case 'low':
          color = '#fbbf24'; // Yellow
          break;
      }
      
      return {
        label: prediction.type.replace(' Alert', '').replace(' System', ''), // Shorten label
        value: prediction.probability * 100,
        color: color
      };
    }).sort((a, b) => b.value - a.value); // Sort by probability descending
  })();

  // Calculate overall system health score based on predictions
  $: systemHealthScore = (() => {
    if (!mockDetailStore.alertPredictions || mockDetailStore.alertPredictions.length === 0) {
      return 95; // High health if no predictions
    }
    
    let totalRiskScore = 0;
    const weights = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    mockDetailStore.alertPredictions.forEach(prediction => {
      const severityWeight = weights[prediction.severity] || 1;
      const riskContribution = (prediction.probability * 100) * severityWeight;
      totalRiskScore += riskContribution;
    });
    
    // Convert risk to health (inverse relationship)
    const maxPossibleRisk = 100 * 3 * mockDetailStore.alertPredictions.length; // Max if all high severity at 100%
    const riskPercentage = Math.min(100, (totalRiskScore / maxPossibleRisk) * 100);
    const healthScore = Math.max(10, 100 - riskPercentage); // Min 10% health
    
    return Math.round(healthScore);
  })();
</script>

<div class="space-y-6">
  {#if loading}
    <div class="bg-white rounded-xl shadow-lg border border-gray-200">
      <div class="flex justify-center items-center h-48">
        <div class="flex items-center gap-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span class="text-gray-600 font-medium">Loading turbine details...</span>
        </div>
      </div>
    </div>
  {:else if error}
    <div class="bg-white rounded-xl shadow-lg border border-red-200">
      <div class="p-6">
        <div class="flex items-center gap-3 text-red-600">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-semibold">Error loading turbine details</span>
        </div>
        <p class="text-gray-600 mt-2">{error}</p>
        <button 
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          on:click={() => windTurbineStore.fetchTurbine(turbineId)}
        >
          Retry
        </button>
      </div>
    </div>
  {:else if turbine}
    <!-- Turbine Header -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200">
      <div class="p-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div class="flex-1">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{turbine.name}</h1>
                <p class="text-gray-600">{turbine.manufacturer.name} • {turbine.manufacturer.country}</p>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3">
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
              
              <div class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                Capacity: {formatCapacity(turbine.ratedCapacityKW)}
              </div>
              
              <div class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <svg class="w-4 h-4 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {turbine.latitude.toFixed(2)}, {turbine.longitude.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit
            </button>
            <button class="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-200">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">98.5%</h3>
        <p class="text-gray-600 font-medium">Uptime</p>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">2.1 MW</h3>
        <p class="text-gray-600 font-medium">Current Output</p>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"></path>
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">12 m/s</h3>
        <p class="text-gray-600 font-medium">Wind Speed</p>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-shadow duration-200">
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-gray-900 mb-2">2</h3>
        <p class="text-gray-600 font-medium">Open Alerts</p>
      </div>
    </div>
    
    <!-- Navigation Tabs -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div class="border-b border-gray-200">
        <nav class="flex">
          <button 
            class="flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer {activeTab === 'overview' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'}"
            on:click={() => switchTab('overview')}
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Overview
            </div>
          </button>
          <button 
            class="flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer {activeTab === 'work-orders' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'}"
            on:click={() => switchTab('work-orders')}
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Work Orders
            </div>
          </button>
          <button 
            class="flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer {activeTab === 'power-output' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'}"
            on:click={() => switchTab('power-output')}
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Power Output
            </div>
          </button>
          <button 
            class="flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 cursor-pointer {activeTab === 'predictions' ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'}"
            on:click={() => switchTab('predictions')}
          >
            <div class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Predictions
            </div>
          </button>
        </nav>
      </div>
      
      <div class="p-6">
        {#if activeTab === 'overview'}
          <!-- Overview Tab -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
                <dl class="space-y-4">
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <dt class="font-medium text-gray-600">Built Date:</dt>
                    <dd class="text-gray-900 font-medium">{new Date(turbine.builtDate).toLocaleDateString()}</dd>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <dt class="font-medium text-gray-600">Installation Date:</dt>
                    <dd class="text-gray-900 font-medium">{new Date(turbine.installationDate).toLocaleDateString()}</dd>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-200">
                    <dt class="font-medium text-gray-600">Manufacturer:</dt>
                    <dd class="text-gray-900 font-medium">{turbine.manufacturer.name} ({turbine.manufacturer.country})</dd>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <dt class="font-medium text-gray-600">Rated Capacity:</dt>
                    <dd class="text-gray-900 font-medium">{formatCapacity(turbine.ratedCapacityKW)}</dd>
                  </div>
                </dl>
              </div>
              
              <!-- Location -->
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 mb-6">Location</h3>
                <div class="space-y-4">
                  <!-- Coordinates Display -->
                  <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Coordinates</p>
                        <p class="text-sm text-gray-500">
                          {turbine.latitude.toFixed(6)}, {turbine.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <button class="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors duration-200">
                      Copy
                    </button>
                  </div>
                  
                  <!-- Interactive Map -->
                  <TurbineLocationMapLeaflet
                    turbine={turbine}
                    height="300px"
                    zoom={12}
                  />
                </div>
              </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
              <div class="space-y-4">
                <div class="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">Routine maintenance completed</p>
                    <p class="text-sm text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">Temperature alert triggered</p>
                    <p class="text-sm text-gray-500">5 days ago</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">Performance report generated</p>
                    <p class="text-sm text-gray-500">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        {:else if activeTab === 'work-orders'}
          <!-- Work Orders Tab -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold text-gray-900">Work Orders</h3>
              <button class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Work Order
              </button>
            </div>
            
            {#if mockDetailStore.loading.workOrders}
              <div class="flex justify-center items-center h-32 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span class="text-gray-600 font-medium">Loading work orders...</span>
                </div>
              </div>
            {:else if mockDetailStore.error.workOrders}
              <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-lg font-semibold text-red-800 mb-2">Error loading work orders</h4>
                  <p class="text-red-600 mb-4">{mockDetailStore.error.workOrders}</p>
                  <button 
                    on:click={() => turbineDetailStore.fetchWorkOrders(turbineId)} 
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            {:else if mockDetailStore.workOrders.length > 0}
              <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      {#each mockDetailStore.workOrders as order}
                        <tr class="hover:bg-gray-50 transition-colors duration-150">
                          <td class="px-6 py-4">
                            <div>
                              <div class="text-sm font-medium text-gray-900">{order.title}</div>
                              <div class="text-sm text-gray-500">{order.description}</div>
                            </div>
                          </td>
                          <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                              order.status === 'Open' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }">
                              {order.status}
                            </span>
                          </td>
                          <td class="px-6 py-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {
                              order.priority === 'High' ? 'bg-red-100 text-red-800' :
                              order.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }">
                              {order.priority}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td class="px-6 py-4 text-sm text-gray-600">
                            {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'No due date'}
                          </td>
                          <td class="px-6 py-4">
                            <div class="flex items-center space-x-2">
                              <button class="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-colors duration-200">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                                View
                              </button>
                              <button class="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors duration-200">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            {:else}
              <div class="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">No work orders found</h4>
                <p class="text-gray-600 mb-4">This turbine doesn't have any work orders yet.</p>
                <button class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                  Create First Work Order
                </button>
              </div>
            {/if}
          </div>
          
        {:else if activeTab === 'power-output'}
          <!-- Power Output Tab -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold text-gray-900">Power Output & Performance</h3>
              <div class="flex items-center gap-3">
                <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                </select>
                <button class="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
            
            <!-- Power Output Chart -->
            {#if mockDetailStore.loading.powerOutput}
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 h-96 flex items-center justify-center">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span class="text-gray-600 font-medium">Loading power output data...</span>
                </div>
              </div>
            {:else if mockDetailStore.error.powerOutput}
              <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-lg font-semibold text-red-800 mb-2">Error loading power output data</h4>
                  <p class="text-red-600 mb-4">{mockDetailStore.error.powerOutput}</p>
                  <button 
                    on:click={() => turbineDetailStore.fetchPowerOutput(turbineId)} 
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            {:else}
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <!-- Contain chart events to prevent interference with tab navigation -->
                <div style="pointer-events: auto;" on:click|stopPropagation>
                  <LineChart
                    data={powerOutputData}
                    title="24-Hour Power Output Trend"
                    yAxisLabel="Power Output (MW)"
                    height={400}
                    animated={true}
                    showGrid={true}
                    showTooltip={true}
                  />
                </div>
              </div>
            {/if}
            
            <!-- Performance Metrics -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <!-- Contain chart events to prevent interference with tab navigation -->
                <div style="pointer-events: auto;" on:click|stopPropagation>
                  <GaugeChart
                    value={calculatedMetrics?.efficiency || 0}
                    min={0}
                    max={100}
                    title="Current Efficiency"
                    unit="%"
                    size={250}
                    colors={['#dc2626', '#d97706', '#059669']}
                    animated={true}
                  />
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <!-- Contain chart events to prevent interference with tab navigation -->
                <div style="pointer-events: auto;" on:click|stopPropagation>
                  <BarChart
                    data={performanceData}
                    title="Performance Metrics"
                    yAxisLabel="Percentage (%)"
                    height={300}
                    animated={true}
                    showTooltip={true}
                    horizontal={false}
                  />
                </div>
              </div>
            </div>
            
            <!-- Performance Summary -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900 mb-6">Performance Summary</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {#if calculatedMetrics}
                  <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-blue-600 mb-1">{calculatedMetrics.currentOutput.toFixed(1)} MW</div>
                    <div class="text-sm text-gray-600">Current Output</div>
                    <div class="text-xs {calculatedMetrics.outputPercentChange >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                      {calculatedMetrics.outputPercentChange >= 0 ? '↑' : '↓'} {Math.abs(calculatedMetrics.outputPercentChange).toFixed(1)}% from avg
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-green-600 mb-1">{calculatedMetrics.efficiency}%</div>
                    <div class="text-sm text-gray-600">Efficiency</div>
                    <div class="text-xs {calculatedMetrics.efficiencyMonthChange >= 0 ? 'text-green-600' : 'text-red-600'} mt-1">
                      {calculatedMetrics.efficiencyMonthChange >= 0 ? '↑' : '↓'} {Math.abs(calculatedMetrics.efficiencyMonthChange).toFixed(1)}% this month
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-purple-600 mb-1">{calculatedMetrics.capacityFactor}%</div>
                    <div class="text-sm text-gray-600">Capacity Factor</div>
                    <div class="text-xs {calculatedMetrics.capacityFactorTrend === 'stable' ? 'text-yellow-600' : 'text-orange-600'} mt-1">
                      {calculatedMetrics.capacityFactorTrend === 'stable' ? '→ Stable' : '↘ Declining'}
                    </div>
                  </div>
                  <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div class="text-2xl font-bold text-cyan-600 mb-1">{calculatedMetrics.windSpeed} m/s</div>
                    <div class="text-sm text-gray-600">Current Wind Speed</div>
                    <div class="text-xs text-blue-600 mt-1">
                      {calculatedMetrics.windSpeed > 12 ? 'High' : calculatedMetrics.windSpeed > 8 ? 'Optimal' : 'Low'} conditions
                    </div>
                  </div>
                {:else}
                  <div class="col-span-4 text-center text-gray-500">Loading performance data...</div>
                {/if}
              </div>
            </div>
          </div>
          
        {:else if activeTab === 'predictions'}
          <!-- Predictions Tab -->
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-bold text-gray-900">Predictive Maintenance Alerts</h3>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  AI-Powered Analytics
                </div>
                <button class="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Refresh Analysis
                </button>
              </div>
            </div>
            
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div class="text-2xl font-bold text-red-600 mb-1">{mockDetailStore.alertPredictions.filter(p => p.severity === 'High').length}</div>
                <div class="text-sm text-gray-600">High Risk</div>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div class="text-2xl font-bold text-orange-600 mb-1">{mockDetailStore.alertPredictions.filter(p => p.severity === 'Medium').length}</div>
                <div class="text-sm text-gray-600">Medium Risk</div>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div class="text-2xl font-bold text-yellow-600 mb-1">{mockDetailStore.alertPredictions.filter(p => p.severity === 'Low').length}</div>
                <div class="text-sm text-gray-600">Low Risk</div>
              </div>
              <div class="bg-white rounded-lg p-4 border border-gray-200 text-center">
                <div class="text-2xl font-bold text-blue-600 mb-1">{Math.round(mockDetailStore.alertPredictions.reduce((acc, p) => acc + p.confidenceScore, 0) / mockDetailStore.alertPredictions.length)}%</div>
                <div class="text-sm text-gray-600">Avg Confidence</div>
              </div>
            </div>
            
            <!-- Prediction Charts -->
            {#if mockDetailStore.alertPredictions.length > 0}
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Timeline Chart -->
                <div class="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-2">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">Risk Timeline</h4>
                  <!-- Contain chart events to prevent interference with tab navigation -->
                  <div style="pointer-events: auto;" on:click|stopPropagation>
                    <LineChart
                      data={predictionChartData}
                      title="Cumulative Risk Over Time"
                      yAxisLabel="Risk Level (%)"
                      height={280}
                      animated={true}
                      showGrid={true}
                      showTooltip={true}
                    />
                  </div>
                </div>
                
                <!-- System Health Gauge -->
                <div class="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">System Health</h4>
                  <!-- Contain chart events to prevent interference with tab navigation -->
                  <div style="pointer-events: auto;" on:click|stopPropagation>
                    <GaugeChart
                      value={systemHealthScore}
                      min={0}
                      max={100}
                      title="Health Score"
                      unit="%"
                      size={200}
                      colors={['#dc2626', '#d97706', '#059669']}
                      animated={true}
                    />
                  </div>
                </div>
              </div>
              
              <!-- Individual Predictions Bar Chart -->
              <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">Alert Probability Breakdown</h4>
                <!-- Contain chart events to prevent interference with tab navigation -->
                <div style="pointer-events: auto;" on:click|stopPropagation>
                  <BarChart
                    data={predictionBarChartData}
                    title="Individual Alert Probabilities"
                    yAxisLabel="Probability (%)"
                    height={250}
                    animated={true}
                    showTooltip={true}
                    horizontal={false}
                  />
                </div>
              </div>
            {/if}
            
            {#if mockDetailStore.loading.alertPredictions}
              <div class="flex justify-center items-center h-32 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span class="text-gray-600 font-medium">Loading predictions...</span>
                </div>
              </div>
            {:else if mockDetailStore.error.alertPredictions}
              <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h4 class="text-lg font-semibold text-red-800 mb-2">Error loading predictions</h4>
                  <p class="text-red-600 mb-4">{mockDetailStore.error.alertPredictions}</p>
                  <button 
                    on:click={() => turbineDetailStore.fetchAlertPredictions(turbineId)} 
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            {:else if mockDetailStore.alertPredictions.length > 0}
              <div class="space-y-4">
                {#each mockDetailStore.alertPredictions as alert}
                  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div class="p-6">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <!-- Header Section -->
                          <div class="flex items-center gap-3 mb-4">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center {
                              alert.severity === 'High' ? 'bg-red-100' :
                              alert.severity === 'Medium' ? 'bg-orange-100' :
                              'bg-yellow-100'
                            }">
                              <svg class="w-6 h-6 {
                                alert.severity === 'High' ? 'text-red-600' :
                                alert.severity === 'Medium' ? 'text-orange-600' :
                                'text-yellow-600'
                              }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                              </svg>
                            </div>
                            <div>
                              <h4 class="text-lg font-semibold text-gray-900">{alert.type}</h4>
                              <p class="text-sm text-gray-600">{alert.description}</p>
                            </div>
                          </div>
                          
                          <!-- Key Metrics -->
                          <div class="grid grid-cols-3 gap-4 mb-4">
                            <div class="bg-gray-50 rounded-lg p-3">
                              <div class="text-sm font-medium text-gray-600">Probability</div>
                              <div class="text-xl font-bold text-gray-900">{(alert.probability * 100).toFixed(0)}%</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                              <div class="text-sm font-medium text-gray-600">Predicted Date</div>
                              <div class="text-sm font-semibold text-gray-900">
                                {new Date(alert.predictedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                              <div class="text-sm font-medium text-gray-600">Confidence</div>
                              <div class="text-xl font-bold text-blue-600">{alert.confidenceScore}%</div>
                            </div>
                          </div>
                          
                          <!-- Recommendation -->
                          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div class="flex items-start gap-2">
                              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <div>
                                <div class="text-sm font-medium text-blue-800">Recommendation</div>
                                <div class="text-sm text-blue-700">{alert.recommendation}</div>
                              </div>
                            </div>
                          </div>
                          
                          <!-- Data Sources -->
                          <div class="text-xs text-gray-500">
                            <span class="font-medium">Data Sources:</span> {alert.dataPoints}
                          </div>
                        </div>
                        
                        <div class="ml-6 text-right flex-shrink-0">
                          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {
                            alert.severity === 'High' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'Medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }">
                            {alert.severity} Risk
                          </span>
                          
                          <div class="mt-4 space-y-2">
                            <button class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                              </svg>
                              Create Work Order
                            </button>
                            <button class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200">
                              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4 12h12M4 12l4-4m-4 4l4 4"></path>
                              </svg>
                              Set Alert
                            </button>
                            <button class="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200">
                              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                              </svg>
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-2">No predictions available</h4>
                <p class="text-gray-600 mb-4">Our AI hasn't detected any potential issues for this turbine.</p>
                <div class="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  All systems operating normally
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Turbine not found -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200">
      <div class="flex flex-col items-center justify-center h-48 p-6">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Turbine not found</h3>
        <p class="text-gray-600 text-center mb-4">The requested wind turbine could not be found.</p>
        <a href="/windturbines" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          Back to Turbines
        </a>
      </div>
    </div>
  {/if}
</div>
