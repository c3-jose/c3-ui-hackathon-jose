<script lang="ts">
  import { preferencesStore } from '../stores/windturbine.js';
  
  // Navigation items
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊', description: 'Overview & Analytics' },
    { href: '/windturbines', label: 'Wind Turbines', icon: '💨', description: 'Fleet Management' },
    { href: '/analytics', label: 'Analytics', icon: '📈', description: 'Data Insights' },
    { href: '/reports', label: 'Reports', icon: '📋', description: 'Generated Reports' }
  ];

  let sidebarCollapsed = false;
  let currentPath = '/';
  let isMobile = false;
  
  // Get current path (this would normally come from router)
  if (typeof window !== 'undefined') {
    currentPath = window.location.pathname;
    
    // Check if mobile
    const checkMobile = () => {
      isMobile = window.innerWidth < 1024;
      if (isMobile) {
        sidebarCollapsed = true;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
  }
  
  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    
    // Update main content margin
    if (typeof window !== 'undefined') {
      const mainElements = document.querySelectorAll('main[class*="ml-"]');
      mainElements.forEach(main => {
        if (sidebarCollapsed) {
          main.classList.remove('ml-80');
          main.classList.add('ml-16');
        } else {
          main.classList.remove('ml-16');
          main.classList.add('ml-80');
        }
      });
    }
  }
  
  function toggleTheme() {
    console.log('🎨 Sidebar theme button clicked - using reactive store!');
    preferencesStore.toggleTheme();
  }
  
  function getThemeIcon() {
    switch ($preferencesStore.theme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'system': return '💻';
      default: return '💻';
    }
  }
</script>

<aside class="fixed left-0 top-0 h-full bg-base-100 border-r border-base-300 transition-all duration-300 ease-in-out z-40 {sidebarCollapsed ? 'w-16' : 'w-80'} shadow-2xl">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b border-base-300">
    {#if !sidebarCollapsed}
      <div class="flex items-center gap-3 animate-in fade-in duration-200">
        <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-primary-content" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>
        <div>
          <h2 class="font-bold text-lg text-base-content">WindTurbine</h2>
          <p class="text-xs text-base-content/60">Manager</p>
        </div>
      </div>
    {:else}
      <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg mx-auto">
        <svg class="w-6 h-6 text-primary-content" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
        </svg>
      </div>
    {/if}
    
    <button 
      on:click={toggleSidebar}
      class="btn btn-ghost btn-sm {sidebarCollapsed ? 'ml-0' : ''}"
      title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg class="w-4 h-4 transition-transform duration-200 {sidebarCollapsed ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
      </svg>
    </button>
  </div>

  <!-- Navigation -->
  <nav class="p-4 space-y-2 flex-1 overflow-y-auto">
    {#each navItems as item}
      <a 
        href={item.href}
        class="group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-base-200 {currentPath === item.href ? 'bg-primary/10 border border-primary/20 shadow-sm' : ''}"
        title={sidebarCollapsed ? item.label : ''}
      >
        <div class="w-10 h-10 flex items-center justify-center rounded-xl {currentPath === item.href ? 'bg-primary text-primary-content shadow-md' : 'bg-base-200 text-base-content/60 group-hover:bg-primary group-hover:text-primary-content'} transition-all duration-200">
          <span class="text-lg">{item.icon}</span>
        </div>
        
        {#if !sidebarCollapsed}
          <div class="flex-1 animate-in fade-in slide-in-from-left-2 duration-200">
            <div class="font-semibold text-base-content {currentPath === item.href ? 'text-primary' : 'group-hover:text-primary'} transition-colors duration-200">
              {item.label}
            </div>
            <div class="text-xs text-base-content/60">
              {item.description}
            </div>
          </div>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- User Profile & Settings -->
  <div class="border-t border-base-300 p-4 space-y-2 bg-base-200">
    <!-- Theme Toggle -->
      <button 
    on:click={toggleTheme}
    data-theme-button
    class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-base-100 transition-all duration-200 group shadow-sm hover:shadow-md cursor-pointer active:scale-95"
    title="Toggle theme"
  >
      <div class="w-10 h-10 flex items-center justify-center rounded-xl bg-base-300 text-base-content/60 group-hover:bg-accent group-hover:text-accent-content transition-all duration-200">
        <span class="text-lg">{getThemeIcon()}</span>
      </div>
      {#if !sidebarCollapsed}
        <div class="flex-1 text-left animate-in fade-in slide-in-from-left-2 duration-200">
          <div class="font-semibold text-base-content group-hover:text-accent transition-colors duration-200">
            Theme
          </div>
          <div class="text-xs text-base-content/60 capitalize" data-theme-text>
            {$preferencesStore.theme}
          </div>
        </div>
      {/if}
    </button>

    <!-- User Profile -->
    <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-base-100 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md">
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
        <span class="text-primary-content font-semibold text-sm">JD</span>
      </div>
      {#if !sidebarCollapsed}
        <div class="flex-1 animate-in fade-in slide-in-from-left-2 duration-200">
          <div class="font-semibold text-base-content group-hover:text-base-content/80 transition-colors duration-200">
            Jose Dominguez
          </div>
          <div class="text-xs text-base-content/60">
            Fleet Administrator
          </div>
        </div>
        <div class="text-base-content/40">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      {/if}
    </div>
  </div>
</aside>

<!-- Sidebar overlay for mobile -->
{#if !sidebarCollapsed}
  <div class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden" on:click={toggleSidebar}></div>
{/if}

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-in {
    animation: animate-in 0.2s ease-out;
  }
  
  .fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .slide-in-from-left-2 {
    animation: slide-in-from-left 0.2s ease-out;
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-in-from-left {
    from { 
      opacity: 0;
      transform: translateX(-8px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
