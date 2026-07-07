<script lang="ts">
  import { PigeonWhatsAppEditor } from '@lit-pigeon/whatsapp-editor';
  import type { WhatsAppTemplate } from '@lit-pigeon/whatsapp-core';

  let {
    template = undefined,
    onchange = undefined,
  }: {
    /** The template to edit. Bound to the element's DOM property. */
    template?: WhatsAppTemplate;
    /** Called with the updated template on every edit. */
    onchange?: (template: WhatsAppTemplate) => void;
  } = $props();

  let el: PigeonWhatsAppEditor | undefined = $state();

  // Keep the element's `template` property in sync with the prop.
  $effect(() => {
    if (el && template) el.template = template;
  });

  // Forward the element's `pigeon:change` CustomEvent to the `onchange` prop.
  $effect(() => {
    const node = el;
    if (!node || !onchange) return;
    const handler = (event: Event) =>
      onchange((event as CustomEvent<{ template: WhatsAppTemplate }>).detail.template);
    node.addEventListener('pigeon:change', handler);
    return () => node.removeEventListener('pigeon:change', handler);
  });
</script>

<pigeon-whatsapp-editor bind:this={el}></pigeon-whatsapp-editor>
