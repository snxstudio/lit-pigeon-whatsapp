# @lit-pigeon/whatsapp-svelte

Svelte 5 wrapper for the [`<pigeon-whatsapp-editor>`](../editor#readme) WhatsApp
template editor web component.

```sh
npm install @lit-pigeon/whatsapp-svelte svelte
```

```svelte
<script lang="ts">
  import { WhatsAppEditor } from '@lit-pigeon/whatsapp-svelte';
  let template = $state(/* … */);
</script>

<WhatsAppEditor {template} onchange={(t) => console.log(t)} />
```

- `template` — the `WhatsAppTemplate` to edit (bound to the element's DOM property).
- `onchange` — called with the updated template on every edit.

## License

MIT — see [LICENSE](./LICENSE).
