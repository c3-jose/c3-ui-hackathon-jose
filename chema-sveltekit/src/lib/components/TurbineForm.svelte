<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WindTurbine, WindTurbineCreate, WindTurbineUpdate } from '$lib/types';
  
  export let turbine: WindTurbine | null = null;
  export let isEditing = false;
  export let loading = false;
  
  const dispatch = createEventDispatcher<{
    submit: WindTurbineCreate | WindTurbineUpdate;
    cancel: void;
  }>();
  
  // Form data
  let formData = {
    name: turbine?.name || '',
    latitude: turbine?.latitude || 0,
    longitude: turbine?.longitude || 0,
    manufacturer: {
      name: turbine?.manufacturer.name || '',
      country: turbine?.manufacturer.country || ''
    },
    builtDate: turbine?.builtDate ? new Date(turbine.builtDate).toISOString().split('T')[0] : '',
    installationDate: turbine?.installationDate ? new Date(turbine.installationDate).toISOString().split('T')[0] : '',
    active: turbine?.active ?? true,
    ratedCapacityKW: turbine?.ratedCapacityKW || 0
  };
  
  // Validation state
  let errors: Record<string, string> = {};
  let touched: Record<string, boolean> = {};
  
  // Common manufacturers for autocomplete
  const commonManufacturers = [
    { name: 'Vestas', country: 'Denmark' },
    { name: 'Siemens Gamesa', country: 'Germany' },
    { name: 'Enercon', country: 'Germany' },
    { name: 'GE', country: 'United States' },
    { name: 'Envision Energy', country: 'China' },
    { name: 'Goldwind', country: 'China' },
    { name: 'Nordex', country: 'Germany' },
    { name: 'Suzlon', country: 'India' }
  ];
  
  function validateField(field: string, value: any) {
    errors[field] = '';
    
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 3) {
          errors[field] = 'Name must be at least 3 characters long';
        }
        break;
      case 'latitude':
        if (value < -90 || value > 90) {
          errors[field] = 'Latitude must be between -90 and 90';
        }
        break;
      case 'longitude':
        if (value < -180 || value > 180) {
          errors[field] = 'Longitude must be between -180 and 180';
        }
        break;
      case 'manufacturerName':
        if (!formData.manufacturer.name || formData.manufacturer.name.trim().length < 2) {
          errors[field] = 'Manufacturer name is required';
        }
        break;
      case 'manufacturerCountry':
        if (!formData.manufacturer.country || formData.manufacturer.country.trim().length < 2) {
          errors[field] = 'Manufacturer country is required';
        }
        break;
      case 'ratedCapacityKW':
        if (value <= 0 || value > 20000) {
          errors[field] = 'Rated capacity must be between 1 and 20,000 kW';
        }
        break;
      case 'builtDate':
        if (!value) {
          errors[field] = 'Built date is required';
        } else {
          const builtDate = new Date(value);
          const now = new Date();
          if (builtDate > now) {
            errors[field] = 'Built date cannot be in the future';
          }
        }
        break;
      case 'installationDate':
        if (!value) {
          errors[field] = 'Installation date is required';
        } else {
          const installDate = new Date(value);
          const builtDate = new Date(formData.builtDate);
          const now = new Date();
          
          if (installDate > now) {
            errors[field] = 'Installation date cannot be in the future';
          } else if (formData.builtDate && installDate < builtDate) {
            errors[field] = 'Installation date cannot be before built date';
          }
        }
        break;
    }
    
    // Trigger reactivity
    errors = { ...errors };
  }
  
  function handleBlur(field: string) {
    touched[field] = true;
    touched = { ...touched };
  }
  
  function handleManufacturerSelect(manufacturer: { name: string; country: string }) {
    formData.manufacturer = { ...manufacturer };
    validateField('manufacturerName', manufacturer.name);
    validateField('manufacturerCountry', manufacturer.country);
  }
  
  function handleSubmit() {
    // Validate all fields
    const fieldsToValidate = [
      'name', 'latitude', 'longitude', 'manufacturerName', 'manufacturerCountry',
      'ratedCapacityKW', 'builtDate', 'installationDate'
    ];
    
    fieldsToValidate.forEach(field => {
      touched[field] = true;
      
      if (field === 'manufacturerName') {
        validateField(field, formData.manufacturer.name);
      } else if (field === 'manufacturerCountry') {
        validateField(field, formData.manufacturer.country);
      } else {
        validateField(field, (formData as any)[field]);
      }
    });
    
    touched = { ...touched };
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    
    if (!hasErrors) {
      // Dispatch submit event with form data
      dispatch('submit', {
        name: formData.name.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        manufacturer: {
          name: formData.manufacturer.name.trim(),
          country: formData.manufacturer.country.trim()
        },
        builtDate: new Date(formData.builtDate).toISOString(),
        installationDate: new Date(formData.installationDate).toISOString(),
        active: formData.active,
        ratedCapacityKW: formData.ratedCapacityKW
      });
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="turbine-form">
  <div class="form-header">
    <h2>{isEditing ? 'Edit Wind Turbine' : 'Add New Wind Turbine'}</h2>
    <p>Fill in the details for the wind turbine</p>
  </div>
  
  <div class="form-sections">
    <!-- Basic Information -->
    <section class="form-section">
      <h3>Basic Information</h3>
      
      <div class="form-group">
        <label for="name" class="required">Turbine Name</label>
        <input
          id="name"
          type="text"
          bind:value={formData.name}
          on:blur={() => handleBlur('name')}
          on:input={() => validateField('name', formData.name)}
          class="form-input {errors.name && touched.name ? 'error' : ''}"
          placeholder="e.g., Energy-Eagle-001"
          required
        />
        {#if errors.name && touched.name}
          <span class="error-message">{errors.name}</span>
        {/if}
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="active">Status</label>
          <label class="checkbox-label">
            <input
              id="active"
              type="checkbox"
              bind:checked={formData.active}
            />
            <span>Active</span>
          </label>
        </div>
        
        <div class="form-group">
          <label for="ratedCapacityKW" class="required">Rated Capacity (kW)</label>
          <input
            id="ratedCapacityKW"
            type="number"
            min="1"
            max="20000"
            step="1"
            bind:value={formData.ratedCapacityKW}
            on:blur={() => handleBlur('ratedCapacityKW')}
            on:input={() => validateField('ratedCapacityKW', formData.ratedCapacityKW)}
            class="form-input {errors.ratedCapacityKW && touched.ratedCapacityKW ? 'error' : ''}"
            placeholder="2000"
            required
          />
          {#if errors.ratedCapacityKW && touched.ratedCapacityKW}
            <span class="error-message">{errors.ratedCapacityKW}</span>
          {/if}
        </div>
      </div>
    </section>
    
    <!-- Manufacturer Information -->
    <section class="form-section">
      <h3>Manufacturer</h3>
      
      <div class="manufacturer-suggestions">
        <p class="suggestions-label">Quick select:</p>
        <div class="suggestions-grid">
          {#each commonManufacturers as manufacturer}
            <button
              type="button"
              class="suggestion-chip"
              class:active={formData.manufacturer.name === manufacturer.name}
              on:click={() => handleManufacturerSelect(manufacturer)}
            >
              {manufacturer.name}
            </button>
          {/each}
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="manufacturerName" class="required">Manufacturer Name</label>
          <input
            id="manufacturerName"
            type="text"
            bind:value={formData.manufacturer.name}
            on:blur={() => handleBlur('manufacturerName')}
            on:input={() => validateField('manufacturerName', formData.manufacturer.name)}
            class="form-input {errors.manufacturerName && touched.manufacturerName ? 'error' : ''}"
            placeholder="e.g., Vestas"
            required
          />
          {#if errors.manufacturerName && touched.manufacturerName}
            <span class="error-message">{errors.manufacturerName}</span>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="manufacturerCountry" class="required">Country</label>
          <input
            id="manufacturerCountry"
            type="text"
            bind:value={formData.manufacturer.country}
            on:blur={() => handleBlur('manufacturerCountry')}
            on:input={() => validateField('manufacturerCountry', formData.manufacturer.country)}
            class="form-input {errors.manufacturerCountry && touched.manufacturerCountry ? 'error' : ''}"
            placeholder="e.g., Denmark"
            required
          />
          {#if errors.manufacturerCountry && touched.manufacturerCountry}
            <span class="error-message">{errors.manufacturerCountry}</span>
          {/if}
        </div>
      </div>
    </section>
    
    <!-- Location -->
    <section class="form-section">
      <h3>Location</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="latitude" class="required">Latitude</label>
          <input
            id="latitude"
            type="number"
            min="-90"
            max="90"
            step="any"
            bind:value={formData.latitude}
            on:blur={() => handleBlur('latitude')}
            on:input={() => validateField('latitude', formData.latitude)}
            class="form-input {errors.latitude && touched.latitude ? 'error' : ''}"
            placeholder="40.7128"
            required
          />
          {#if errors.latitude && touched.latitude}
            <span class="error-message">{errors.latitude}</span>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="longitude" class="required">Longitude</label>
          <input
            id="longitude"
            type="number"
            min="-180"
            max="180"
            step="any"
            bind:value={formData.longitude}
            on:blur={() => handleBlur('longitude')}
            on:input={() => validateField('longitude', formData.longitude)}
            class="form-input {errors.longitude && touched.longitude ? 'error' : ''}"
            placeholder="-74.0060"
            required
          />
          {#if errors.longitude && touched.longitude}
            <span class="error-message">{errors.longitude}</span>
          {/if}
        </div>
      </div>
    </section>
    
    <!-- Dates -->
    <section class="form-section">
      <h3>Installation Details</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="builtDate" class="required">Built Date</label>
          <input
            id="builtDate"
            type="date"
            bind:value={formData.builtDate}
            on:blur={() => handleBlur('builtDate')}
            on:input={() => validateField('builtDate', formData.builtDate)}
            class="form-input {errors.builtDate && touched.builtDate ? 'error' : ''}"
            required
          />
          {#if errors.builtDate && touched.builtDate}
            <span class="error-message">{errors.builtDate}</span>
          {/if}
        </div>
        
        <div class="form-group">
          <label for="installationDate" class="required">Installation Date</label>
          <input
            id="installationDate"
            type="date"
            bind:value={formData.installationDate}
            on:blur={() => handleBlur('installationDate')}
            on:input={() => validateField('installationDate', formData.installationDate)}
            class="form-input {errors.installationDate && touched.installationDate ? 'error' : ''}"
            required
          />
          {#if errors.installationDate && touched.installationDate}
            <span class="error-message">{errors.installationDate}</span>
          {/if}
        </div>
      </div>
    </section>
  </div>
  
  <!-- Form Actions -->
  <div class="form-actions">
    <button
      type="button"
      class="btn btn-secondary"
      on:click={handleCancel}
      disabled={loading}
    >
      Cancel
    </button>
    <button
      type="submit"
      class="btn btn-primary"
      disabled={loading}
    >
      {#if loading}
        <svg class="loading-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      {/if}
      {isEditing ? 'Update Turbine' : 'Create Turbine'}
    </button>
  </div>
</form>

<style lang="scss">
  .turbine-form {
    max-width: 800px;
    margin: 0 auto;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-6);
  }
  
  .form-header {
    text-align: center;
    margin-bottom: var(--size-5);
    
    h2 {
      margin: 0 0 var(--size-2) 0;
      color: var(--text-primary);
      font-size: var(--font-size-4);
    }
    
    p {
      margin: 0;
      color: var(--text-secondary);
    }
  }
  
  .form-sections {
    display: flex;
    flex-direction: column;
    gap: var(--size-5);
  }
  
  .form-section {
    h3 {
      margin: 0 0 var(--size-3) 0;
      color: var(--text-primary);
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-6);
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--size-2);
    }
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
    
    label {
      color: var(--text-primary);
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
      
      &.required::after {
        content: ' *';
        color: var(--color-error);
      }
    }
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--size-4);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .form-input {
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-2);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--font-size-1);
    
    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
    
    &.error {
      border-color: var(--color-error);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1);
    }
    
    &::placeholder {
      color: var(--text-muted);
    }
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    cursor: pointer;
    user-select: none;
    margin-top: var(--size-1);
    
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
  
  .error-message {
    color: var(--color-error);
    font-size: var(--font-size-0);
    margin-top: var(--size-1);
  }
  
  .manufacturer-suggestions {
    margin-bottom: var(--size-4);
    
    .suggestions-label {
      margin: 0 0 var(--size-2) 0;
      color: var(--text-secondary);
      font-size: var(--font-size-0);
    }
    
    .suggestions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--size-2);
    }
    
    .suggestion-chip {
      padding: var(--size-1) var(--size-2);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-2);
      background: var(--bg-primary);
      color: var(--text-secondary);
      font-size: var(--font-size-0);
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--color-accent);
        color: var(--text-primary);
      }
      
      &.active {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: white;
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--size-3);
    margin-top: var(--size-5);
    padding-top: var(--size-4);
    border-top: 1px solid var(--border-color);
    
    .btn {
      padding: var(--size-2) var(--size-4);
      font-size: var(--font-size-1);
      
      &.btn-secondary {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        color: var(--text-primary);
        
        &:hover {
          background: var(--bg-tertiary);
        }
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
  
  .loading-icon {
    animation: spin 1s linear infinite;
    margin-right: var(--size-2);
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
