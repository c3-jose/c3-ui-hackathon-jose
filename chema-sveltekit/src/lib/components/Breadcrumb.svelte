<script lang="ts">
  export let items: Array<{ label: string; href?: string; icon?: string }> = [];
</script>

<nav class="breadcrumb" aria-label="Breadcrumb">
  <ol class="breadcrumb-list">
    {#each items as item, index}
      <li class="breadcrumb-item">
        {#if item.href && index < items.length - 1}
          <a href={item.href} class="breadcrumb-link">
            {#if item.icon}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                {@html item.icon}
              </svg>
            {/if}
            {item.label}
          </a>
        {:else}
          <span class="breadcrumb-current">
            {#if item.icon}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                {@html item.icon}
              </svg>
            {/if}
            {item.label}
          </span>
        {/if}
        
        {#if index < items.length - 1}
          <svg class="breadcrumb-separator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style lang="scss">
  .breadcrumb {
    margin-bottom: var(--size-4);
  }

  .breadcrumb-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--size-1);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: var(--size-1);
  }

  .breadcrumb-link {
    display: flex;
    align-items: center;
    gap: var(--size-1);
    text-decoration: none;
    color: var(--color-text-secondary);
    font-size: var(--font-size-1);
    padding: var(--size-1) var(--size-2);
    border-radius: var(--border-radius-default);
    transition: all 0.2s ease;

    &:hover {
      color: var(--color-accent);
      background: var(--color-bg-tertiary);
    }

    svg {
      opacity: 0.7;
    }
  }

  .breadcrumb-current {
    display: flex;
    align-items: center;
    gap: var(--size-1);
    color: var(--color-text-primary);
    font-size: var(--font-size-1);
    font-weight: var(--font-weight-5);
    padding: var(--size-1) var(--size-2);

    svg {
      opacity: 0.8;
    }
  }

  .breadcrumb-separator {
    color: var(--color-text-muted);
    opacity: 0.6;
    margin: 0 var(--size-1);
  }
</style>
