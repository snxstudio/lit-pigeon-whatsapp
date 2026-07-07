# @lit-pigeon/whatsapp-vue

Vue 3 wrapper for the [`<pigeon-whatsapp-editor>`](../editor#readme) WhatsApp
template editor web component.

```sh
npm install @lit-pigeon/whatsapp-vue vue
```

```vue
<script setup lang="ts">
import { WhatsAppEditor } from '@lit-pigeon/whatsapp-vue';
</script>

<template>
  <WhatsAppEditor :template="template" @change="(t) => console.log(t)" />
</template>
```

- `template` — the `WhatsAppTemplate` to edit (bound to the element's DOM property).
- `@change` — emitted with the updated template on every edit.

## License

MIT — see [LICENSE](./LICENSE).
