<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WindTurbineCreate, Manufacturer } from '$lib/types';

  export let isSubmitting = false;
  export let serverError: string | null = null;

  const dispatch = createEventDispatcher<{
    submit: WindTurbineCreate;
    cancel: void;
  }>();

  // Form data
  let formData: WindTurbineCreate = {
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

  // Form validation
  let errors: Record<string, string> = {};
  let touched: Record<string, boolean> = {};

  // Validation rules
  function validateField(field: string, value: any): string {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'Turbine name must be at least 2 characters long';
        }
        break;
      case 'latitude':
        if (value < -90 || value > 90) {
          return 'Latitude must be between -90 and 90';
        }
        break;
      case 'longitude':
        if (value < -180 || value > 180) {
          return 'Longitude must be between -180 and 180';
        }
        break;
      case 'manufacturer.name':
        if (!value || value.trim().length < 2) {
          return 'Manufacturer name is required';
        }
        break;
      case 'manufacturer.country':
        if (!value || value.trim().length < 2) {
          return 'Manufacturer country is required';
        }
        break;
      case 'ratedCapacityKW':
        if (!value || value <= 0) {
          return 'Rated capacity must be greater than 0';
        }
        break;
      case 'builtDate':
        if (!value) {
          return 'Built date is required';
        }
        const builtDate = new Date(value);
        if (builtDate > new Date()) {
          return 'Built date cannot be in the future';
        }
        break;
      case 'installationDate':
        if (!value) {
          return 'Installation date is required';
        }
        const installDate = new Date(value);
        const builtDateValue = new Date(formData.builtDate);
        if (installDate < builtDateValue) {
          return 'Installation date cannot be before built date';
        }
        if (installDate > new Date()) {
          return 'Installation date cannot be in the future';
        }
        break;
    }
    return '';
  }

  function handleFieldChange(field: string, value: any) {
    // Update form data
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      formData[parent as keyof WindTurbineCreate][child] = value;
    } else {
      formData[field as keyof WindTurbineCreate] = value;
    }

    // Mark as touched
    touched[field] = true;

    // Validate field
    const error = validateField(field, value);
    if (error) {
      errors[field] = error;
    } else {
      delete errors[field];
    }

    // Trigger reactivity
    formData = formData;
    errors = errors;
    touched = touched;
  }

  function validateForm(): boolean {
    const fieldsToValidate = [
      'name',
      'latitude',
      'longitude',
      'manufacturer.name',
      'manufacturer.country',
      'ratedCapacityKW',
      'builtDate',
      'installationDate'
    ];

    let isValid = true;
    fieldsToValidate.forEach(field => {
      let value: any;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = formData[parent as keyof WindTurbineCreate][child];
      } else {
        value = formData[field as keyof WindTurbineCreate];
      }

      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
      touched[field] = true;
    });

    errors = errors;
    touched = touched;
    return isValid;
  }

  function handleSubmit() {
    if (validateForm() && !isSubmitting) {
      dispatch('submit', formData);
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  // Common manufacturers for quick selection
  const commonManufacturers = [
    { name: 'Vestas', country: 'Denmark' },
    { name: 'Siemens Gamesa', country: 'Spain' },
    { name: 'GE Renewable Energy', country: 'United States' },
    { name: 'Goldwind', country: 'China' },
    { name: 'Enercon', country: 'Germany' },
    { name: 'Nordex', country: 'Germany' },
    { name: 'Senvion', country: 'Germany' },
    { name: 'Mingyang', country: 'China' }
  ];

  function selectManufacturer(manufacturer: Manufacturer) {
    formData.manufacturer = { ...manufacturer };
    handleFieldChange('manufacturer.name', manufacturer.name);
    handleFieldChange('manufacturer.country', manufacturer.country);
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="turbine-form">
  <!-- Server Error Display -->
  {#if serverError}
    <div class="server-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {serverError}
    </div>
  {/if}
  <!-- Basic Information -->
  <div class="form-section">
    <h3 class="section-title">Basic Information</h3>
    
    <div class="form-group">
      <label for="name" class="form-label">
        Turbine Name <span class="required">*</span>
      </label>
      <input
        id="name"
        type="text"
        class="form-input"
        class:error={touched.name && errors.name}
        bind:value={formData.name}
        on:input={(e) => handleFieldChange('name', e.target.value)}
        placeholder="Enter turbine name"
        required
      />
      {#if touched.name && errors.name}
        <span class="error-message">{errors.name}</span>
      {/if}
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="ratedCapacityKW" class="form-label">
          Rated Capacity (kW) <span class="required">*</span>
        </label>
        <input
          id="ratedCapacityKW"
          type="number"
          class="form-input"
          class:error={touched.ratedCapacityKW && errors.ratedCapacityKW}
          bind:value={formData.ratedCapacityKW}
          on:input={(e) => handleFieldChange('ratedCapacityKW', Number(e.target.value))}
          placeholder="e.g., 2500"
          min="1"
          step="1"
          required
        />
        {#if touched.ratedCapacityKW && errors.ratedCapacityKW}
          <span class="error-message">{errors.ratedCapacityKW}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="active" class="form-label">Status</label>
        <div class="checkbox-group">
          <input
            id="active"
            type="checkbox"
            class="form-checkbox"
            bind:checked={formData.active}
            on:change={(e) => handleFieldChange('active', e.target.checked)}
          />
          <label for="active" class="checkbox-label">
            Active and operational
          </label>
        </div>
      </div>
    </div>
  </div>

  <!-- Location Information -->
  <div class="form-section">
    <h3 class="section-title">Location</h3>
    
    <div class="form-row">
      <div class="form-group">
        <label for="latitude" class="form-label">
          Latitude <span class="required">*</span>
        </label>
        <input
          id="latitude"
          type="number"
          class="form-input"
          class:error={touched.latitude && errors.latitude}
          bind:value={formData.latitude}
          on:input={(e) => handleFieldChange('latitude', Number(e.target.value))}
          placeholder="e.g., 37.7749"
          min="-90"
          max="90"
          step="any"
          required
        />
        {#if touched.latitude && errors.latitude}
          <span class="error-message">{errors.latitude}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="longitude" class="form-label">
          Longitude <span class="required">*</span>
        </label>
        <input
          id="longitude"
          type="number"
          class="form-input"
          class:error={touched.longitude && errors.longitude}
          bind:value={formData.longitude}
          on:input={(e) => handleFieldChange('longitude', Number(e.target.value))}
          placeholder="e.g., -122.4194"
          min="-180"
          max="180"
          step="any"
          required
        />
        {#if touched.longitude && errors.longitude}
          <span class="error-message">{errors.longitude}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Manufacturer Information -->
  <div class="form-section">
    <h3 class="section-title">Manufacturer</h3>
    
    <!-- Quick manufacturer selection -->
    <div class="manufacturer-quick-select">
      <p class="quick-select-label">Quick select:</p>
      <div class="manufacturer-buttons">
        {#each commonManufacturers as manufacturer}
          <button
            type="button"
            class="manufacturer-btn"
            class:selected={formData.manufacturer.name === manufacturer.name}
            on:click={() => selectManufacturer(manufacturer)}
          >
            {manufacturer.name}
          </button>
        {/each}
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="manufacturerName" class="form-label">
          Manufacturer Name <span class="required">*</span>
        </label>
        <input
          id="manufacturerName"
          type="text"
          class="form-input"
          class:error={touched['manufacturer.name'] && errors['manufacturer.name']}
          bind:value={formData.manufacturer.name}
          on:input={(e) => handleFieldChange('manufacturer.name', e.target.value)}
          placeholder="Enter manufacturer name"
          required
        />
        {#if touched['manufacturer.name'] && errors['manufacturer.name']}
          <span class="error-message">{errors['manufacturer.name']}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="manufacturerCountry" class="form-label">
          Country <span class="required">*</span>
        </label>
        <input
          id="manufacturerCountry"
          type="text"
          class="form-input"
          class:error={touched['manufacturer.country'] && errors['manufacturer.country']}
          bind:value={formData.manufacturer.country}
          on:input={(e) => handleFieldChange('manufacturer.country', e.target.value)}
          placeholder="Enter country"
          required
        />
        {#if touched['manufacturer.country'] && errors['manufacturer.country']}
          <span class="error-message">{errors['manufacturer.country']}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Dates -->
  <div class="form-section">
    <h3 class="section-title">Dates</h3>
    
    <div class="form-row">
      <div class="form-group">
        <label for="builtDate" class="form-label">
          Built Date <span class="required">*</span>
        </label>
        <input
          id="builtDate"
          type="date"
          class="form-input"
          class:error={touched.builtDate && errors.builtDate}
          bind:value={formData.builtDate}
          on:input={(e) => handleFieldChange('builtDate', e.target.value)}
          required
        />
        {#if touched.builtDate && errors.builtDate}
          <span class="error-message">{errors.builtDate}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="installationDate" class="form-label">
          Installation Date <span class="required">*</span>
        </label>
        <input
          id="installationDate"
          type="date"
          class="form-input"
          class:error={touched.installationDate && errors.installationDate}
          bind:value={formData.installationDate}
          on:input={(e) => handleFieldChange('installationDate', e.target.value)}
          required
        />
        {#if touched.installationDate && errors.installationDate}
          <span class="error-message">{errors.installationDate}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Form Actions -->
  <div class="form-actions">
    <button
      type="button"
      class="btn btn-secondary"
      on:click={handleCancel}
      disabled={isSubmitting}
    >
      Cancel
    </button>
    
    <button
      type="submit"
      class="btn btn-primary"
      disabled={isSubmitting || Object.keys(errors).length > 0}
    >
      {#if isSubmitting}
        <svg class="spinner" width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" />
          <circle cx="12" cy="12" r="10" stroke="var(--color-accent)" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416" />
        </svg>
        Creating...
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create Turbine
      {/if}
    </button>
  </div>
</form>

<style lang="scss">
  .turbine-form {
    max-width: 100%;
  }

  .server-error {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-3) var(--size-4);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-error);
    border-radius: var(--border-radius-default);
    color: var(--color-error);
    font-size: var(--font-size-1);
    margin-bottom: var(--size-4);
    
    svg {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
    }
  }

  .form-section {
    margin-bottom: var(--size-6);
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin: 0 0 var(--size-4) 0;
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-6);
    color: var(--color-text-primary);
    border-bottom: 2px solid var(--color-border-color);
    padding-bottom: var(--size-2);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--size-4);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
  }

  .form-label {
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    color: var(--color-text-primary);
    
    .required {
      color: var(--color-error);
    }
  }

  .form-input {
    padding: var(--size-3);
    border: 2px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    font-size: var(--font-size-1);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    transition: var(--transition-theme);
    
    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: var(--shadow-focus);
    }
    
    &.error {
      border-color: var(--color-error);
    }
    
    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: var(--size-2);
  }

  .form-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .checkbox-label {
    cursor: pointer;
    font-size: var(--font-size-1);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .error-message {
    font-size: var(--font-size-0);
    color: var(--color-error);
    margin-top: var(--size-1);
  }

  .manufacturer-quick-select {
    margin-bottom: var(--size-4);
    padding: var(--size-4);
    background: var(--color-bg-secondary);
    border-radius: var(--border-radius-default);
    border: 1px solid var(--color-border-color);
  }

  .quick-select-label {
    margin: 0 0 var(--size-3) 0;
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    color: var(--color-text-secondary);
  }

  .manufacturer-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-2);
  }

  .manufacturer-btn {
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-primary);
    color: var(--color-text-secondary);
    font-size: var(--font-size-0);
    cursor: pointer;
    transition: var(--transition-theme);
    
    &:hover {
      background: var(--color-bg-tertiary);
      border-color: var(--color-accent);
    }
    
    &.selected {
      background: var(--color-accent);
      color: white;
      border-color: var(--color-accent);
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--size-3);
    padding-top: var(--size-4);
    border-top: 1px solid var(--color-border-color);
    margin-top: var(--size-6);
  }

  .btn {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-3) var(--size-5);
    border-radius: var(--border-radius-default);
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    cursor: pointer;
    transition: var(--transition-theme);
    border: 2px solid transparent;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }

  .btn-primary {
    background: var(--color-accent);
    color: white;
    
    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
    
    &:focus {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  }

  .btn-secondary {
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-color: var(--color-border-color);
    
    &:hover:not(:disabled) {
      background: var(--color-bg-tertiary);
      border-color: var(--color-accent);
    }
    
    &:focus {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
