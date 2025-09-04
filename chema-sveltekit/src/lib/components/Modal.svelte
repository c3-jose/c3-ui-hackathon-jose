<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;
  export let title = '';
  export let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
  export let showCloseButton = true;
  export let closeOnBackdrop = true;

  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();

  function handleClose() {
    isOpen = false;
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      handleClose();
    }
  }

  $: if (isOpen) {
    dispatch('open');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div 
    class="modal-backdrop" 
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <div class="modal-container {size}">
      <div class="modal-header">
        {#if title}
          <h2 id="modal-title" class="modal-title">{title}</h2>
        {/if}
        
        {#if showCloseButton}
          <button 
            type="button" 
            class="modal-close" 
            on:click={handleClose}
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        {/if}
      </div>
      
      <div class="modal-content">
        <slot />
      </div>
      
      <div class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--size-4);
    animation: fadeIn 0.2s ease-out;
  }

  .modal-container {
    background: var(--color-bg-primary);
    border-radius: var(--border-radius-default);
    box-shadow: var(--shadow-hover);
    border: 1px solid var(--color-border-color);
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.3s ease-out;
    
    &.small {
      width: 100%;
      max-width: 400px;
    }
    
    &.medium {
      width: 100%;
      max-width: 600px;
    }
    
    &.large {
      width: 100%;
      max-width: 800px;
    }
    
    &.full {
      width: 90vw;
      max-width: 1200px;
    }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--size-5) var(--size-6);
    border-bottom: 1px solid var(--color-border-color);
    background: var(--color-bg-secondary);
    border-radius: var(--border-radius-default) var(--border-radius-default) 0 0;
  }

  .modal-title {
    margin: 0;
    font-size: var(--font-size-4);
    font-weight: var(--font-weight-6);
    color: var(--color-text-primary);
  }

  .modal-close {
    background: none;
    border: none;
    padding: var(--size-2);
    cursor: pointer;
    color: var(--color-text-muted);
    border-radius: var(--border-radius-default);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-theme);
    
    &:hover {
      background: var(--color-bg-tertiary);
      color: var(--color-text-primary);
    }
    
    &:focus {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }

  .modal-content {
    padding: var(--size-6);
    flex: 1;
    overflow-y: auto;
  }

  .modal-footer {
    padding: var(--size-4) var(--size-6);
    border-top: 1px solid var(--color-border-color);
    background: var(--color-bg-secondary);
    border-radius: 0 0 var(--border-radius-default) var(--border-radius-default);
    display: flex;
    justify-content: flex-end;
    gap: var(--size-3);
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

  // Ensure modal content scrolls properly
  :global(.modal-content) {
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-color) transparent;
    
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--color-border-color);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }
  }
</style>