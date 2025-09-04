<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { windTurbineStore } from '../stores/windturbine.js';
  import type { WindTurbine, Manufacturer } from '../types/windturbine.js';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    name: '',
    latitude: 0,
    longitude: 0,
    manufacturer: {
      name: '',
      country: ''
    },
    builtDate: '',
    installationDate: '',
    active: true,
    ratedCapacityKW: 0
  };

  // Loading and error states
  let isSubmitting = false;
  let errors: Record<string, string> = {};

  // Common manufacturers for dropdown
  const commonManufacturers = [
    { name: 'Vestas', country: 'Denmark' },
    { name: 'Siemens Gamesa', country: 'Spain' },
    { name: 'GE Renewable Energy', country: 'United States' },
    { name: 'Goldwind', country: 'China' },
    { name: 'Enercon', country: 'Germany' },
    { name: 'Nordex', country: 'Germany' },
    { name: 'Suzlon', country: 'India' },
    { name: 'Ming Yang', country: 'China' },
    { name: 'Envision', country: 'China' },
    { name: 'Other', country: '' }
  ];

  let selectedManufacturer = '';
  let customManufacturer = false;

  // Form validation
  function validateForm() {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Turbine name is required';
    }
    
    if (!formData.latitude || formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Valid latitude (-90 to 90) is required';
    }
    
    if (!formData.longitude || formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Valid longitude (-180 to 180) is required';
    }
    
    if (!formData.manufacturer.name.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    
    if (!formData.manufacturer.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (!formData.builtDate) {
      errors.builtDate = 'Built date is required';
    }
    
    if (!formData.installationDate) {
      errors.installationDate = 'Installation date is required';
    }
    
    if (!formData.ratedCapacityKW || formData.ratedCapacityKW <= 0) {
      errors.ratedCapacityKW = 'Valid rated capacity is required';
    }

    return Object.keys(errors).length === 0;
  }

  // Handle manufacturer selection
  function handleManufacturerSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    
    if (value === 'Other') {
      customManufacturer = true;
      formData.manufacturer = { name: '', country: '' };
    } else if (value) {
      customManufacturer = false;
      const manufacturer = commonManufacturers.find(m => m.name === value);
      if (manufacturer) {
        formData.manufacturer = { ...manufacturer };
      }
    }
  }

  // Submit form
  async function handleSubmit() {
    if (!validateForm()) return;
    
    isSubmitting = true;
    try {
      const newTurbine = await windTurbineStore.createTurbine(formData);
      // Dispatch event with the new turbine data
      dispatch('turbineCreated', { turbine: newTurbine });
      closeModal();
    } catch (error) {
      console.error('Failed to create turbine:', error);
      // Don't close modal on error so user can retry
    } finally {
      isSubmitting = false;
    }
  }

  // Close modal and reset form
  function closeModal() {
    isOpen = false;
    formData = {
      name: '',
      latitude: 0,
      longitude: 0,
      manufacturer: { name: '', country: '' },
      builtDate: '',
      installationDate: '',
      active: true,
      ratedCapacityKW: 0
    };
    selectedManufacturer = '';
    customManufacturer = false;
    errors = {};
    dispatch('close');
  }

  // Format current date for input defaults
  function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click={closeModal}
  >
    <!-- Modal Container -->
    <div 
      class="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation
    >
      <!-- Modal Header -->
      <div class="sticky top-0 bg-base-100 border-b border-base-300 p-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-base-content">Add New Wind Turbine</h2>
            <p class="text-base-content/70 mt-1">Enter the details for the new wind turbine</p>
          </div>
          <button 
            on:click={closeModal}
            class="w-10 h-10 rounded-xl bg-base-200 hover:bg-base-300 flex items-center justify-center transition-colors"
            title="Close"
          >
            <svg class="w-5 h-5 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content -->
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-content">Basic Information</h3>
          
          <!-- Turbine Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-base-content mb-2">
              Turbine Name *
            </label>
            <input
              id="name"
              type="text"
              bind:value={formData.name}
              class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
              placeholder="e.g. Wind Turbine Alpha-1"
              class:border-error={errors.name}
            />
            {#if errors.name}
              <p class="text-error text-sm mt-1">{errors.name}</p>
            {/if}
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-base-content mb-2">Status</label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input 
                  type="radio" 
                  bind:group={formData.active} 
                  value={true}
                  class="w-4 h-4 text-accent border-base-300 focus:ring-accent"
                />
                <span class="ml-2 text-base-content">Active</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="radio" 
                  bind:group={formData.active} 
                  value={false}
                  class="w-4 h-4 text-accent border-base-300 focus:ring-accent"
                />
                <span class="ml-2 text-base-content">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-content">Location</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Latitude -->
            <div>
              <label for="latitude" class="block text-sm font-medium text-base-content mb-2">
                Latitude *
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                bind:value={formData.latitude}
                class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                placeholder="e.g. 40.7128"
                class:border-error={errors.latitude}
              />
              {#if errors.latitude}
                <p class="text-error text-sm mt-1">{errors.latitude}</p>
              {/if}
            </div>

            <!-- Longitude -->
            <div>
              <label for="longitude" class="block text-sm font-medium text-base-content mb-2">
                Longitude *
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                bind:value={formData.longitude}
                class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                placeholder="e.g. -74.0060"
                class:border-error={errors.longitude}
              />
              {#if errors.longitude}
                <p class="text-error text-sm mt-1">{errors.longitude}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Manufacturer -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-content">Manufacturer</h3>
          
          <!-- Manufacturer Selection -->
          <div>
            <label for="manufacturer" class="block text-sm font-medium text-base-content mb-2">
              Manufacturer *
            </label>
            <select
              id="manufacturer"
              on:change={handleManufacturerSelect}
              bind:value={selectedManufacturer}
              class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
              class:border-error={errors.manufacturer}
            >
              <option value="">Select a manufacturer</option>
              {#each commonManufacturers as manufacturer}
                <option value={manufacturer.name}>{manufacturer.name}{manufacturer.country ? ` (${manufacturer.country})` : ''}</option>
              {/each}
            </select>
            {#if errors.manufacturer}
              <p class="text-error text-sm mt-1">{errors.manufacturer}</p>
            {/if}
          </div>

          <!-- Custom Manufacturer Fields -->
          {#if customManufacturer}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="manufacturerName" class="block text-sm font-medium text-base-content mb-2">
                  Manufacturer Name *
                </label>
                <input
                  id="manufacturerName"
                  type="text"
                  bind:value={formData.manufacturer.name}
                  class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                  placeholder="Enter manufacturer name"
                />
              </div>
              <div>
                <label for="manufacturerCountry" class="block text-sm font-medium text-base-content mb-2">
                  Country *
                </label>
                <input
                  id="manufacturerCountry"
                  type="text"
                  bind:value={formData.manufacturer.country}
                  class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                  placeholder="Enter country"
                />
              </div>
            </div>
          {/if}
          
          {#if errors.country}
            <p class="text-error text-sm mt-1">{errors.country}</p>
          {/if}
        </div>

        <!-- Technical Specifications -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-base-content">Technical Specifications</h3>
          
          <!-- Rated Capacity -->
          <div>
            <label for="capacity" class="block text-sm font-medium text-base-content mb-2">
              Rated Capacity (kW) *
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              step="1"
              bind:value={formData.ratedCapacityKW}
              class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
              placeholder="e.g. 2500"
              class:border-error={errors.ratedCapacityKW}
            />
            {#if errors.ratedCapacityKW}
              <p class="text-error text-sm mt-1">{errors.ratedCapacityKW}</p>
            {/if}
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Built Date -->
            <div>
              <label for="builtDate" class="block text-sm font-medium text-base-content mb-2">
                Built Date *
              </label>
              <input
                id="builtDate"
                type="date"
                bind:value={formData.builtDate}
                max={getCurrentDate()}
                class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                class:border-error={errors.builtDate}
              />
              {#if errors.builtDate}
                <p class="text-error text-sm mt-1">{errors.builtDate}</p>
              {/if}
            </div>

            <!-- Installation Date -->
            <div>
              <label for="installationDate" class="block text-sm font-medium text-base-content mb-2">
                Installation Date *
              </label>
              <input
                id="installationDate"
                type="date"
                bind:value={formData.installationDate}
                max={getCurrentDate()}
                class="w-full px-4 py-3 border border-base-300 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent bg-base-100 text-base-content"
                class:border-error={errors.installationDate}
              />
              {#if errors.installationDate}
                <p class="text-error text-sm mt-1">{errors.installationDate}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-base-300">
          <button
            type="button"
            on:click={closeModal}
            class="px-6 py-3 text-base-content bg-base-200 hover:bg-base-300 rounded-xl font-medium transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-accent hover:bg-accent/90 text-base-100 rounded-xl font-medium transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-base-100/30 border-t-base-100 rounded-full animate-spin"></div>
                Creating...
              </div>
            {:else}
              Create Turbine
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
