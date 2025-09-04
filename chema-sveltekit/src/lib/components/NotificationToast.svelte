<script lang="ts">
  import { notifications, notificationsActions } from '$lib/stores';
  import { slide, fade } from 'svelte/transition';
  import type { NotificationType } from '$lib/types';
  
  function getIcon(type: NotificationType) {
    switch (type) {
      case 'success':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20,6 9,17 4,12"/>
        </svg>`;
      case 'error':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;
      case 'warning':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`;
      case 'info':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>`;
      default:
        return '';
    }
  }
  
  function handleClose(id: string) {
    notificationsActions.removeNotification(id);
  }
</script>

<div class="notifications-container">
  {#each $notifications.notifications as notification (notification.id)}
    <div
      class="notification notification-{notification.type}"
      in:slide={{duration: 300, delay: 100}}
      out:fade={{duration: 200}}
    >
      <div class="notification-content">
        <div class="notification-icon">
          {@html getIcon(notification.type)}
        </div>
        <div class="notification-text">
          <h4 class="notification-title">{notification.title}</h4>
          <p class="notification-message">{notification.message}</p>
        </div>
      </div>
      
      <button
        class="notification-close"
        on:click={() => handleClose(notification.id)}
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .notifications-container {
    position: fixed;
    top: var(--size-4);
    right: var(--size-4);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--size-3);
    max-width: 400px;
    
    @media (max-width: 768px) {
      top: var(--size-2);
      right: var(--size-2);
      left: var(--size-2);
      max-width: none;
    }
  }
  
  .notification {
    display: flex;
    align-items: flex-start;
    gap: var(--size-3);
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-3);
    padding: var(--size-4);
    box-shadow: var(--shadow-4);
    min-width: 300px;
    
    &.notification-success {
      border-left: 4px solid var(--green-6);
      
      .notification-icon {
        color: var(--green-6);
      }
    }
    
    &.notification-error {
      border-left: 4px solid var(--red-6);
      
      .notification-icon {
        color: var(--red-6);
      }
    }
    
    &.notification-warning {
      border-left: 4px solid var(--orange-6);
      
      .notification-icon {
        color: var(--orange-6);
      }
    }
    
    &.notification-info {
      border-left: 4px solid var(--blue-6);
      
      .notification-icon {
        color: var(--blue-6);
      }
    }
  }
  
  .notification-content {
    display: flex;
    align-items: flex-start;
    gap: var(--size-2);
    flex: 1;
  }
  
  .notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: var(--size-1);
  }
  
  .notification-text {
    flex: 1;
  }
  
  .notification-title {
    margin: 0 0 var(--size-1) 0;
    color: var(--text-primary);
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-6);
  }
  
  .notification-message {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-0);
    line-height: 1.4;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--size-1);
    border-radius: var(--radius-1);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    
    &:hover {
      color: var(--text-primary);
      background: var(--bg-tertiary);
    }
    
    &:focus {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
</style>
