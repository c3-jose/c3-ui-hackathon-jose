<script lang="ts">
  import ThemeSelector from '$lib/components/ThemeSelector.svelte';
  import { currentTheme, currentThemeConfig } from '$lib/theme';
</script>

<div class="container">
  <div class="settings-header">
    <h1>Settings</h1>
    <p>Customize your Wind Turbine Management System experience</p>
  </div>

  <div class="settings-content">
    <!-- Theme Settings Section -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Appearance</h2>
        <p>Choose your preferred theme and customize the application appearance</p>
      </div>
      
      <div class="theme-settings">
        <h3>Current Theme: {$currentThemeConfig.displayName}</h3>
        <p class="theme-description">{$currentThemeConfig.description}</p>
        
        <!-- Theme Grid Selector -->
        <ThemeSelector showAsDropdown={false} showPreview={true} compact={false} />
        
        <!-- Theme Properties Display -->
        <div class="theme-properties">
          <h4>Theme Properties</h4>
          <div class="properties-grid">
            <div class="property-item">
              <span class="property-label">Border Radius:</span>
              <span class="property-value">{$currentThemeConfig.borderRadius || 'medium'}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Shadows:</span>
              <span class="property-value">{$currentThemeConfig.shadows ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Primary Color:</span>
              <div class="color-preview" style="background-color: {$currentThemeConfig.colors.primary};"></div>
              <span class="property-value">{$currentThemeConfig.colors.primary}</span>
            </div>
            <div class="property-item">
              <span class="property-label">Accent Color:</span>
              <div class="color-preview" style="background-color: {$currentThemeConfig.colors.accent};"></div>
              <span class="property-value">{$currentThemeConfig.colors.accent}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Theme Preview</h2>
        <p>See how your selected theme looks with different components</p>
      </div>
      
      <div class="preview-section">
        <!-- Button Previews -->
        <div class="preview-group">
          <h4>Buttons</h4>
          <div class="button-preview">
            <button class="btn">Default</button>
            <button class="btn btn-primary">Primary</button>
            <button class="btn btn-success">Success</button>
            <button class="btn btn-warning">Warning</button>
            <button class="btn btn-danger">Danger</button>
            <button class="btn btn-ghost">Ghost</button>
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="preview-group">
          <h4>Status Indicators</h4>
          <div class="status-preview">
            <span class="status status-active">Active</span>
            <span class="status status-inactive">Inactive</span>
            <span class="status status-open">Open</span>
            <span class="status status-in-progress">In Progress</span>
            <span class="status status-completed">Completed</span>
          </div>
        </div>

        <!-- Card Preview -->
        <div class="preview-group">
          <h4>Cards</h4>
          <div class="card">
            <h5>Sample Card</h5>
            <p>This is how cards look with the current theme. They include shadows and proper spacing.</p>
            <button class="btn btn-primary">Action</button>
          </div>
        </div>

        <!-- Table Preview -->
        <div class="preview-group">
          <h4>Data Table</h4>
          <table class="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Wind Turbine 001</td>
                <td><span class="status status-active">Active</span></td>
                <td>California</td>
              </tr>
              <tr>
                <td>Wind Turbine 002</td>
                <td><span class="status status-in-progress">Maintenance</span></td>
                <td>Texas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Other Settings Placeholder -->
    <div class="settings-section">
      <div class="section-header">
        <h2>Preferences</h2>
        <p>Additional application preferences and settings</p>
      </div>
      
      <div class="preferences-grid">
        <div class="preference-item">
          <label for="language">Language</label>
          <select id="language" class="theme-select">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        
        <div class="preference-item">
          <label for="timezone">Timezone</label>
          <select id="timezone" class="theme-select">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        
        <div class="preference-item">
          <label for="items-per-page">Items per page</label>
          <select id="items-per-page" class="theme-select">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .settings-header {
    padding: var(--size-5) 0;
    border-bottom: 1px solid var(--color-border-color);
    margin-bottom: var(--size-6);
    
    h1 {
      margin: 0 0 var(--size-1) 0;
      font-size: var(--font-size-6);
      font-weight: var(--font-weight-7);
      color: var(--color-text-primary);
    }
    
    p {
      margin: 0;
      font-size: var(--font-size-2);
      color: var(--color-text-secondary);
    }
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: var(--size-6);
  }

  .settings-section {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    padding: var(--size-5);
    box-shadow: var(--shadow-default);
  }

  .section-header {
    margin-bottom: var(--size-4);
    
    h2 {
      margin: 0 0 var(--size-1) 0;
      font-size: var(--font-size-4);
      font-weight: var(--font-weight-6);
      color: var(--color-text-primary);
    }
    
    p {
      margin: 0;
      font-size: var(--font-size-1);
      color: var(--color-text-secondary);
    }
  }

  .theme-settings {
    h3 {
      margin: 0 0 var(--size-1) 0;
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-6);
      color: var(--color-accent);
    }
    
    .theme-description {
      margin: 0 0 var(--size-4) 0;
      font-size: var(--font-size-1);
      color: var(--color-text-secondary);
      font-style: italic;
    }
  }

  .theme-properties {
    margin-top: var(--size-5);
    padding-top: var(--size-4);
    border-top: 1px solid var(--color-border-color);
    
    h4 {
      margin: 0 0 var(--size-3) 0;
      font-size: var(--font-size-2);
      font-weight: var(--font-weight-5);
      color: var(--color-text-primary);
    }
  }

  .properties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--size-3);
  }

  .property-item {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-2);
    background: var(--color-bg-tertiary);
    border-radius: var(--border-radius-default);
    
    .property-label {
      font-weight: var(--font-weight-5);
      color: var(--color-text-secondary);
      white-space: nowrap;
    }
    
    .property-value {
      font-family: monospace;
      color: var(--color-text-primary);
      font-size: var(--font-size-0);
    }
  }

  .color-preview {
    width: 20px;
    height: 20px;
    border-radius: var(--border-radius-default);
    border: 1px solid var(--color-border-color);
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--size-4);
  }

  .preview-group {
    h4 {
      margin: 0 0 var(--size-2) 0;
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
      color: var(--color-text-primary);
    }
  }

  .button-preview {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-2);
  }

  .status-preview {
    display: flex;
    flex-wrap: wrap;
    gap: var(--size-2);
  }

  .preferences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-4);
  }

  .preference-item {
    display: flex;
    flex-direction: column;
    gap: var(--size-1);
    
    label {
      font-size: var(--font-size-1);
      font-weight: var(--font-weight-5);
      color: var(--color-text-primary);
    }
  }

  .theme-select {
    padding: var(--size-2) var(--size-3);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    cursor: pointer;

    &:focus {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
  }
</style>
