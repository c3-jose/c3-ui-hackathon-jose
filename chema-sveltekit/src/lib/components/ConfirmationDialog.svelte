<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';
  export let confirmText = 'Confirm';
  export let cancelText = 'Cancel';
  export let type: 'warning' | 'danger' | 'info' = 'warning';

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  function handleConfirm() {
    dispatch('confirm');
    isOpen = false;
  }

  function handleCancel() {
    dispatch('cancel');
    isOpen = false;
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div 
    class="confirmation-backdrop" 
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirmation-title"
  >
    <div class="confirmation-container {type}">
      <div class="confirmation-header">
        <div class="confirmation-icon">
          {#if type === 'warning'}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          {:else if type === 'danger'}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          {:else}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          {/if}
        </div>
        
        <h3 id="confirmation-title" class="confirmation-title">{title}</h3>
      </div>
      
      <div class="confirmation-content">
        <p class="confirmation-message">{message}</p>
      </div>
      
      <div class="confirmation-actions">
        <button 
          type="button" 
          class="btn btn-secondary" 
          on:click={handleCancel}
        >
          {cancelText}
        </button>
        
        <button 
          type="button" 
          class="btn btn-primary {type}" 
          on:click={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .confirmation-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1050; // Higher than modal
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-4);
    animation: fadeIn 0.2s ease-out;
  }

  .confirmation-container {
    background: var(--color-bg-primary);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-hover);
    border: 1px solid var(--color-border-color);
    width: 100%;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  }

  .confirmation-header {
    display: flex;
    align-items: center;
    gap: var(--size-3);
    padding: var(--size-5) var(--size-6);
    border-bottom: 1px solid var(--color-border-color);
  }

  .confirmation-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    
    .warning & {
      background: rgba(245, 158, 11, 0.1);
      color: var(--color-warning);
    }
    
    .danger & {
      background: rgba(239, 68, 68, 0.1);
      color: var(--color-error);
    }
    
    .info & {
      background: rgba(59, 130, 246, 0.1);
      color: var(--color-info);
    }
    
    svg {
      width: 24px;
      height: 24px;
    }
  }

  .confirmation-title {
    margin: 0;
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-6);
    color: var(--color-text-primary);
  }

  .confirmation-content {
    padding: var(--size-4) var(--size-6);
  }

  .confirmation-message {
    margin: 0;
    font-size: var(--font-size-1);
    line-height: 1.5;
    color: var(--color-text-secondary);
  }

  .confirmation-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--size-3);
    padding: var(--size-4) var(--size-6);
    border-top: 1px solid var(--color-border-color);
    background: var(--color-bg-secondary);
    border-radius: 0 0 var(--border-radius-default) var(--border-radius-default);
  }

  .btn {
    display: flex;
    align-items: center;
    gap: var(--size-2);
    padding: var(--size-2) var(--size-4);
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
  }

  .btn-secondary {
    background: var(--color-bg-primary);
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

  .btn-primary {
    color: white;
    
    &.warning {
      background: var(--color-warning);
      
      &:hover:not(:disabled) {
        background: #d97706;
      }
    }
    
    &.danger {
      background: var(--color-error);
      
      &:hover:not(:disabled) {
        background: #dc2626;
      }
    }
    
    &.info {
      background: var(--color-info);
      
      &:hover:not(:disabled) {
        background: #2563eb;
      }
    }
    
    &:focus {
      outline: none;
      box-shadow: var(--shadow-focus);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
