<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { currentTheme, getThemeList, setTheme } from '$lib/theme';
  import type { Theme } from '$lib/types';

  export let showAsDropdown = true;
  export let showPreview = true;
  export let compact = false;

  const dispatch = createEventDispatcher<{
    themeChanged: { theme: Theme };
  }>();

  const themes = getThemeList();

  function handleThemeChange(theme: Theme) {
    setTheme(theme);
    dispatch('themeChanged', { theme });
  }

  function handleSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    handleThemeChange(target.value as Theme);
  }

  function handleButtonClick(themeId: string) {
    handleThemeChange(themeId as Theme);
  }

  function getThemeIcon(themeId: string) {
    switch (themeId) {
      case 'light':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>`;
      case 'dark':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>`;
      case 'system':
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>`;
    }
  }
</script>

{#if showAsDropdown}
  <div class="theme-selector-dropdown" class:compact>
    <label for="theme-select" class="theme-label">
      {#if !compact}
        <span class="theme-icon" aria-hidden="true">
          {@html getThemeIcon($currentTheme)}
        </span>
      {/if}
      {compact ? '' : 'Theme'}
    </label>
    
    <select 
      id="theme-select" 
      bind:value={$currentTheme} 
      on:change={handleSelectChange}
      class="theme-select"
    >
      {#each themes as theme}
        <option value={theme.id}>{theme.displayName}</option>
      {/each}
    </select>
  </div>
{:else}
  <div class="theme-selector-grid" class:compact>
    {#if !compact}
      <h3 class="theme-selector-title">Choose Theme</h3>
    {/if}
    
    <div class="theme-options">
      {#each themes as theme}
        <button
          type="button"
          class="theme-option"
          class:active={$currentTheme === theme.id}
          on:click={() => handleButtonClick(theme.id)}
          title={theme.description}
        >
          <div class="theme-option-header">
            <span class="theme-icon" aria-hidden="true">
              {@html getThemeIcon(theme.id)}
            </span>
            <span class="theme-name">{theme.displayName}</span>
          </div>
          
          {#if showPreview && !compact}
            <div class="theme-preview" style="
              background: {theme.colors.bgPrimary};
              border: 1px solid {theme.colors.borderColor};
            ">
              <div class="preview-header" style="background: {theme.colors.bgSecondary};">
                <div class="preview-dot" style="background: {theme.colors.accent};"></div>
                <div class="preview-dot" style="background: {theme.colors.success};"></div>
                <div class="preview-dot" style="background: {theme.colors.warning};"></div>
              </div>
              <div class="preview-content" style="color: {theme.colors.textPrimary};">
                <div class="preview-text" style="background: {theme.colors.bgTertiary}; color: {theme.colors.textSecondary};"></div>
                <div class="preview-text" style="background: {theme.colors.accent}; color: white;"></div>
              </div>
            </div>
          {/if}
          
          {#if !compact}
            <p class="theme-description">{theme.description}</p>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .theme-selector-dropdown {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    
    &.compact {
      gap: var(--size-1);
    }
  }

  .theme-label {
    display: flex;
    align-items: center;
    gap: var(--size-1);
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  .theme-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    
    :global(svg) {
      width: 100%;
      height: 100%;
    }
  }

  .theme-select {
    padding: var(--size-1) var(--size-2);
    border: 1px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    cursor: pointer;
    min-width: 120px;

    &:focus {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
  }

  .theme-selector-grid {
    &.compact .theme-options {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }
  }

  .theme-selector-title {
    margin: 0 0 var(--size-3) 0;
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-6);
    color: var(--color-text-primary);
  }

  .theme-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--size-3);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .theme-option {
    display: flex;
    flex-direction: column;
    gap: var(--size-2);
    padding: var(--size-3);
    border: 2px solid var(--color-border-color);
    border-radius: var(--border-radius-default);
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    &:hover {
      border-color: var(--color-accent);
      box-shadow: var(--shadow-hover);
    }

    &.active {
      border-color: var(--color-accent);
      background: color-mix(in srgb, var(--color-accent) 5%, var(--color-bg-secondary));
      
      .theme-option-header .theme-name {
        color: var(--color-accent);
        font-weight: var(--font-weight-6);
      }
    }

    &:focus {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
  }

  .theme-option-header {
    display: flex;
    align-items: center;
    gap: var(--size-2);
  }

  .theme-name {
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    color: var(--color-text-primary);
  }

  .theme-preview {
    width: 100%;
    height: 40px;
    border-radius: var(--border-radius-default);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .preview-header {
    height: 12px;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 0 4px;
  }

  .preview-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
  }

  .preview-content {
    flex: 1;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preview-text {
    height: 4px;
    border-radius: 2px;
    
    &:first-child {
      width: 70%;
    }
    
    &:last-child {
      width: 40%;
    }
  }

  .theme-description {
    margin: 0;
    font-size: var(--font-size-0);
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .compact {
    .theme-option {
      padding: var(--size-2);
      gap: var(--size-1);
    }
    
    .theme-name {
      font-size: var(--font-size-0);
    }
    
    .theme-icon {
      width: 16px;
      height: 16px;
    }
  }
</style>
