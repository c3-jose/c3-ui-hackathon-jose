<script lang="ts">
    import '../app.scss';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import NotificationToast from '$lib/components/NotificationToast.svelte';
  import ThemeSelector from '$lib/components/ThemeSelector.svelte';
  import { currentTheme, effectiveTheme, currentThemeConfig } from '$lib/theme';

  // Initialize theme system
  onMount(() => {
    // Theme system is automatically initialized in theme.ts
    console.log('Theme system initialized');
  });
</script>

<div class="app">
  <header class="header">
    <nav class="nav container">
      <div class="nav-brand">
        <a href="/" class="brand-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span class="brand-text">Wind Turbine Manager</span>
        </a>
      </div>
      
      <div class="nav-links">
        <a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span>Home</span>
        </a>
        <a href="/windturbines" class="nav-link" class:active={$page.url.pathname.startsWith('/windturbines')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          <span>Wind Turbines</span>
        </a>
        <a href="/workorders" class="nav-link" class:active={$page.url.pathname.startsWith('/workorders')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <span>Work Orders</span>
        </a>
        <a href="/dashboard" class="nav-link" class:active={$page.url.pathname === '/dashboard'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          </svg>
          <span>Analytics</span>
        </a>
        <a href="/settings" class="nav-link" class:active={$page.url.pathname === '/settings'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
          </svg>
          <span>Settings</span>
        </a>
      </div>
      
      <div class="nav-actions">
        <ThemeSelector compact={true} showAsDropdown={true} showPreview={false} />
      </div>
    </nav>
  </header>
  
  <main class="main">
    <slot />
  </main>
  
  <footer class="footer">
    <div class="container">
      <p>&copy; 2024 Wind Turbine Management System. Built with SvelteKit.</p>
    </div>
  </footer>
</div>

<!-- Global notifications -->
<NotificationToast />

<style lang="scss">
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-3) var(--size-6);
    min-height: 64px;
    max-width: 1400px;
    margin: 0 auto;
    
    @media (max-width: 1200px) {
      padding: var(--size-3) var(--size-4);
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--size-3);
      padding: var(--size-3);
    }
  }
  
  .nav-brand {
    .brand-link {
      display: flex;
      align-items: center;
      gap: var(--size-2);
      text-decoration: none;
      color: var(--text-primary);
      font-weight: var(--font-weight-6);
      font-size: var(--font-size-3);
      
      svg {
        color: var(--color-accent);
      }
    }
    
    .brand-text {
      @media (max-width: 480px) {
        display: none;
      }
    }
  }
  
  .nav-links {
    display: flex;
    gap: var(--size-4);
    
    @media (max-width: 768px) {
      gap: var(--size-3);
    }
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    text-decoration: none;
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-5);
    padding: var(--size-2) var(--size-3);
    border-radius: var(--border-radius-default);
    transition: all 0.2s ease;
    white-space: nowrap;
    
    svg {
      flex-shrink: 0;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }
    
    span {
      @media (max-width: 1024px) {
        display: none;
      }
    }
    
    &:hover {
      color: var(--color-text-primary);
      background: var(--color-bg-tertiary);
      
      svg {
        opacity: 1;
      }
    }
    
    &.active {
      color: var(--color-accent);
      background: color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-tertiary));
      font-weight: var(--font-weight-6);
      
      svg {
        opacity: 1;
        stroke: var(--color-accent);
      }
    }
  }
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: var(--size-2);
  }
  

  
  .main {
    flex: 1;
    padding: var(--size-6) 0;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    
    @media (max-width: 768px) {
      padding: var(--size-4) 0;
    }
  }
  
  .footer {
    background: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: var(--size-3) 0;
    margin-top: auto;
    
    p {
      text-align: center;
      color: var(--text-muted);
      margin: 0;
      font-size: var(--font-size-0);
    }
  }
</style>
