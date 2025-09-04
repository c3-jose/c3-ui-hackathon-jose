<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { windTurbineStore } from '../stores/windturbine.js';
  import type { WindTurbine, Manufacturer } from '../types/windturbine.js';

  export let isOpen = false;
  export let turbine: WindTurbine | null = null;

  const dispatch = createEventDispatcher();

  // Form data - will be populated when turbine prop changes
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
  let showUpdateConfirm = false;

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

  // Populate form when turbine changes or modal opens
  $: if (turbine) {
    populateForm();
  }

  // Helper function to convert ISO date to YYYY-MM-DD format for HTML date inputs
  function formatDateForInput(isoDate: string): string {
    if (!isoDate) return '';
    return new Date(isoDate).toISOString().split('T')[0];
  }

  function populateForm() {
    if (!turbine) return;

    formData = {
      name: turbine.name,
      latitude: turbine.latitude,
      longitude: turbine.longitude,
      manufacturer: {
        name: turbine.manufacturer.name,
        country: turbine.manufacturer.country
      },
      builtDate: formatDateForInput(turbine.builtDate),
      installationDate: formatDateForInput(turbine.installationDate),
      active: turbine.active,
      ratedCapacityKW: turbine.ratedCapacityKW
    };

    // Set selected manufacturer for dropdown
    const matchingManufacturer = commonManufacturers.find(
      m => m.name === turbine.manufacturer.name
    );
    
    if (matchingManufacturer) {
      selectedManufacturer = matchingManufacturer.name;
      customManufacturer = false;
    } else {
      selectedManufacturer = 'Other';
      customManufacturer = true;
    }
  }

  // Form validation
  function validateForm() {
    errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.manufacturer.name.trim()) {
      errors.manufacturer = 'Manufacturer is required';
    }
    
    if (!formData.manufacturer.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90';
    }
    
    if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180';
    }
    
    if (!formData.builtDate) {
      errors.builtDate = 'Built date is required';
    }
    
    if (!formData.installationDate) {
      errors.installationDate = 'Installation date is required';
    }
    
    if (formData.ratedCapacityKW <= 0) {
      errors.ratedCapacityKW = 'Rated capacity must be greater than 0';
    }
    
    return Object.keys(errors).length === 0;
  }

  // Handle manufacturer selection
  function handleManufacturerChange() {
    if (selectedManufacturer === 'Other') {
      customManufacturer = true;
      formData.manufacturer = { name: '', country: '' };
    } else {
      customManufacturer = false;
      const selected = commonManufacturers.find(m => m.name === selectedManufacturer);
      if (selected) {
        formData.manufacturer = { ...selected };
      }
    }
  }

  // Helper function to convert form data to API format
  function prepareDataForAPI(formData: any) {
    return {
      ...formData,
      // Convert YYYY-MM-DD dates back to ISO format for API
      builtDate: formData.builtDate ? new Date(formData.builtDate + 'T00:00:00.000Z').toISOString() : '',
      installationDate: formData.installationDate ? new Date(formData.installationDate + 'T00:00:00.000Z').toISOString() : ''
    };
  }

  // Handle form submission - show confirmation first
  function handleSubmit() {
    if (!validateForm() || !turbine) return;
    showUpdateConfirm = true;
  }

  // Handle confirmed update
  async function handleConfirmedUpdate() {
    if (!turbine) return;

    isSubmitting = true;
    showUpdateConfirm = false;
    
    try {
      const apiData = prepareDataForAPI(formData);
      const updatedTurbine = await windTurbineStore.updateTurbine(turbine.id, apiData);
      dispatch('turbineUpdated', { turbine: updatedTurbine });
      closeModal();
    } catch (error) {
      console.error('Failed to update turbine:', error);
      // Don't close modal on error so user can retry
    } finally {
      isSubmitting = false;
    }
  }

  // Cancel update confirmation
  function cancelUpdate() {
    showUpdateConfirm = false;
  }

  // Close modal and reset form
  function closeModal() {
    isOpen = false;
    errors = {};
    dispatch('close');
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    on:click={closeModal}
  >
    <!-- Modal content -->
    <div 
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      on:click|stopPropagation
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Edit Wind Turbine</h2>
        <button 
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          on:click={closeModal}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal body -->
      <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Turbine Name *
            </label>
            <input
              type="text"
              bind:value={formData.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              class:border-error={errors.name}
              placeholder="Enter turbine name"
              required
            />
            {#if errors.name}
              <p class="text-sm text-red-600 mt-1">{errors.name}</p>
            {/if}
          </div>

          <!-- Location -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                bind:value={formData.latitude}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-error={errors.latitude}
                placeholder="e.g. 40.7128"
                min="-90"
                max="90"
                required
              />
              {#if errors.latitude}
                <p class="text-sm text-red-600 mt-1">{errors.latitude}</p>
              {/if}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                bind:value={formData.longitude}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-error={errors.longitude}
                placeholder="e.g. -74.0060"
                min="-180"
                max="180"
                required
              />
              {#if errors.longitude}
                <p class="text-sm text-red-600 mt-1">{errors.longitude}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Manufacturer Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Manufacturer</h3>
          
          <!-- Manufacturer Dropdown -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer *
            </label>
            <select
              bind:value={selectedManufacturer}
              on:change={handleManufacturerChange}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              class:border-error={errors.manufacturer}
              required
            >
              <option value="">Select a manufacturer</option>
              {#each commonManufacturers as manufacturer}
                <option value={manufacturer.name}>{manufacturer.name}</option>
              {/each}
            </select>
            {#if errors.manufacturer}
              <p class="text-sm text-red-600 mt-1">{errors.manufacturer}</p>
            {/if}
          </div>

          <!-- Custom Manufacturer Fields -->
          {#if customManufacturer}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer Name *
                </label>
                <input
                  type="text"
                  bind:value={formData.manufacturer.name}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  class:border-error={errors.manufacturer}
                  placeholder="Enter manufacturer name"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  bind:value={formData.manufacturer.country}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  class:border-error={errors.country}
                  placeholder="Enter country"
                  required
                />
                {#if errors.country}
                  <p class="text-sm text-red-600 mt-1">{errors.country}</p>
                {/if}
              </div>
            </div>
          {:else}
            <!-- Display selected manufacturer info -->
            <div class="text-sm text-gray-600">
              Country: {formData.manufacturer.country || 'Not specified'}
            </div>
          {/if}
        </div>

        <!-- Dates -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Dates</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Built Date *
              </label>
              <input
                type="date"
                bind:value={formData.builtDate}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-error={errors.builtDate}
                required
              />
              {#if errors.builtDate}
                <p class="text-sm text-red-600 mt-1">{errors.builtDate}</p>
              {/if}
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Installation Date *
              </label>
              <input
                type="date"
                bind:value={formData.installationDate}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-error={errors.installationDate}
                required
              />
              {#if errors.installationDate}
                <p class="text-sm text-red-600 mt-1">{errors.installationDate}</p>
              {/if}
            </div>
          </div>
        </div>

        <!-- Technical Specifications -->
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Technical Specifications</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Rated Capacity (kW) *
              </label>
              <input
                type="number"
                bind:value={formData.ratedCapacityKW}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-error={errors.ratedCapacityKW}
                placeholder="e.g. 2500"
                min="1"
                required
              />
              {#if errors.ratedCapacityKW}
                <p class="text-sm text-red-600 mt-1">{errors.ratedCapacityKW}</p>
              {/if}
            </div>
            <div class="flex items-center">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  bind:checked={formData.active}
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Submit buttons -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            on:click={closeModal}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            {:else}
              Update Turbine
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Update Confirmation Modal -->
{#if showUpdateConfirm}
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
    on:click={cancelUpdate}
  >
    <div 
      class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      on:click|stopPropagation
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900">Confirm Update</h2>
        <button 
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          on:click={cancelUpdate}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Confirmation message -->
      <div class="mb-6">
        <div class="flex items-center mb-3">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-lg font-medium text-blue-800">Update Confirmation</h3>
          </div>
        </div>
        <p class="text-gray-700">
          Are you sure you want to update <strong>{turbine?.name}</strong>? 
          The changes will be saved and applied immediately.
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          on:click={cancelUpdate}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={handleConfirmedUpdate}
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          {:else}
            Confirm Update
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
