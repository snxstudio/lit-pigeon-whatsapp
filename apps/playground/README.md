# playground

A tiny Vite app that mounts `<pigeon-whatsapp-editor>` with a sample template so
the editor can be opened in a browser. Private — not published.

```sh
pnpm build                       # build the workspace packages first
pnpm --filter playground dev     # then open the dev server
```

`pnpm --filter playground build` produces a static bundle in `dist/`.
