<script lang="ts">
  import { preferencesStore } from '../stores/windturbine.js';
  
  // Navigation items
  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/windturbines', label: 'Wind Turbines', icon: '💨' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/reports', label: 'Reports', icon: '📋' }
  ];
  
  let mobileMenuOpen = false;
  let notificationMenuOpen = false;
  let userMenuOpen = false;
  
  // Close menus when clicking outside
  function handleClickOutside(event) {
    const clickedElement = event.target;
    const dropdownElement = clickedElement.closest('.dropdown');
    
    if (!dropdownElement) {
      notificationMenuOpen = false;
      userMenuOpen = false;
      mobileMenuOpen = false;
    }
  }
  
  // Close other menus when opening a new one
  function toggleNotificationMenu() {
    userMenuOpen = false;
    notificationMenuOpen = !notificationMenuOpen;
  }
  
  function toggleUserMenu() {
    notificationMenuOpen = false;
    userMenuOpen = !userMenuOpen;
  }
  
  function toggleTheme() {
    console.log('🎨 Navigation theme button clicked - using reactive store!');
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

<div class="navbar bg-base-100 shadow-xl border-b border-base-300 backdrop-blur-sm" on:click={handleClickOutside}>
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost text-xl hover:bg-base-200 transition-colors duration-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
          </svg>
        </div>
        <span class="hidden sm:block font-bold text-primary text-lg">WindTurbine Manager</span>
      </div>
    </a>
  </div>
  
  <div class="navbar-center hidden lg:flex">
    <!-- Simplified center navigation -->
    <div class="breadcrumbs text-sm">
      <ul>
        <li><a href="/" class="text-base-content/70 hover:text-base-content">Wind Turbine Manager</a></li>
        <li class="text-base-content font-medium">Dashboard</li>
      </ul>
    </div>
  </div>
  
  <div class="navbar-end">
    <div class="flex items-center gap-1">
      <!-- Main Menu Button -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost hover:bg-base-200 transition-all duration-200 gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          <span class="hidden sm:inline">Menu</span>
        </label>
        <ul tabindex="0" class="dropdown-content z-[50] mt-3 w-56 p-2 shadow-2xl bg-base-100 rounded-xl border border-base-300">
          {#each navItems as item}
            <li>
              <a href={item.href} class="flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 rounded-lg transition-colors duration-200 group">
                <div class="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors duration-200">
                  <span class="text-lg">{item.icon}</span>
                </div>
                <span class="font-medium">{item.label}</span>
              </a>
            </li>
          {/each}
          <div class="divider my-2"></div>
          <li>
            <a href="/settings" class="flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 rounded-lg transition-colors duration-200 group">
              <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-colors duration-200">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="font-medium">Settings</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Theme toggle -->
      <button class="btn btn-ghost btn-circle hover:bg-base-200 transition-all duration-200" on:click={toggleTheme} title="Toggle theme" data-theme-button>
        <span class="text-xl">☀️</span>
      </button>
      
      <!-- Notifications -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle hover:bg-base-200 transition-all duration-200 indicator {notificationMenuOpen ? 'bg-base-200' : ''}" on:click|stopPropagation={toggleNotificationMenu}>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span class="badge badge-sm badge-primary indicator-item">3</span>
        </label>
        {#if notificationMenuOpen}
        <div class="dropdown-content z-[50] mt-3 w-80 bg-base-100 rounded-xl shadow-2xl border border-base-300" style="animation: dropdownFadeIn 0.2s ease-out;">
          <!-- Header -->
          <div class="px-4 py-3 border-b border-base-300">
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-base-content">Notifications</h3>
              <div class="badge badge-primary badge-sm">3</div>
            </div>
          </div>
          
          <!-- Notification Items -->
          <div class="py-2">
            <a href="#" class="flex items-start gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors duration-200">
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-base-content">Temperature alert in Sector 7</p>
                <p class="text-xs text-base-content/60 mt-1">Critical temperature threshold exceeded</p>
                <p class="text-xs text-base-content/50 mt-1">5 minutes ago</p>
              </div>
            </a>
            
            <a href="#" class="flex items-start gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors duration-200">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-base-content">Maintenance required for Unit 42</p>
                <p class="text-xs text-base-content/60 mt-1">Scheduled maintenance window approaching</p>
                <p class="text-xs text-base-content/50 mt-1">2 hours ago</p>
              </div>
            </a>
            
            <a href="#" class="flex items-start gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors duration-200">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-base-content">New report available</p>
                <p class="text-xs text-base-content/60 mt-1">Weekly performance summary is ready</p>
                <p class="text-xs text-base-content/50 mt-1">1 day ago</p>
              </div>
            </a>
          </div>
          
          <!-- Footer -->
          <div class="px-4 py-3 border-t border-base-300">
            <a href="/notifications" class="text-sm text-primary font-medium hover:text-primary-focus transition-colors duration-200">
              View all notifications →
            </a>
          </div>
        </div>
        {/if}
      </div>
    
      <!-- User menu -->
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar hover:bg-base-200 transition-all duration-200 {userMenuOpen ? 'bg-base-200' : ''}" on:click|stopPropagation={toggleUserMenu}>
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <span class="text-white font-semibold text-sm">JD</span>
          </div>
        </label>
        {#if userMenuOpen}
        <div class="dropdown-content z-[50] mt-3 w-64 bg-base-100 rounded-xl shadow-2xl border border-base-300" style="animation: dropdownFadeIn 0.2s ease-out;">
          <!-- User Info Header -->
          <div class="px-4 py-4 border-b border-base-300">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <span class="text-white font-semibold">JD</span>
              </div>
              <div class="flex-1">
                <p class="font-semibold text-base-content">Jose Dominguez</p>
                <p class="text-xs text-base-content/60">Fleet Administrator</p>
              </div>
            </div>
          </div>
          
          <!-- Menu Items -->
          <div class="py-2">
            <a href="/profile" class="flex items-center justify-between px-4 py-3 hover:bg-base-200/50 transition-colors duration-200 group">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <span class="font-medium text-sm">Profile</span>
              </div>
              <span class="badge badge-primary badge-sm">New</span>
            </a>
            
            <a href="/settings" class="flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors duration-200 group">
              <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <span class="font-medium text-sm">Settings</span>
            </a>
            
            <a href="/help" class="flex items-center gap-3 px-4 py-3 hover:bg-base-200/50 transition-colors duration-200 group">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span class="font-medium text-sm">Help & Support</span>
            </a>
          </div>
          
          <div class="border-t border-base-300 py-2">
            <a href="/logout" class="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 group text-error">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </div>
              <span class="font-medium text-sm">Sign Out</span>
            </a>
          </div>
        </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
