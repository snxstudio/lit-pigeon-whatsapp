# @lit-pigeon/whatsapp-react

React wrapper for the [`<pigeon-whatsapp-editor>`](../editor#readme) WhatsApp
template editor web component, built with [`@lit/react`](https://www.npmjs.com/package/@lit/react).

```sh
npm install @lit-pigeon/whatsapp-react react
```

```tsx
import { WhatsAppEditor } from '@lit-pigeon/whatsapp-react';

export function App() {
  return (
    <WhatsAppEditor
      template={template}
      onChange={(e) => console.log(e.detail.template)}
    />
  );
}
```

- `template` — the `WhatsAppTemplate` to edit (set as a DOM property).
- `onChange` — the element's `pigeon:change` CustomEvent (`e.detail.template`).

## License

MIT — see [LICENSE](./LICENSE).
