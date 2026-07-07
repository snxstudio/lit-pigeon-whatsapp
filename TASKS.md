# Build backlog — lit-pigeon-whatsapp

Ordered, self-contained tasks for building out the WhatsApp template designer.
An automated agent (or a human) picks the **first unchecked `[ ]` task**,
implements it, and opens a PR.

## Conventions — READ BEFORE EXECUTING A TASK
- **Pick** the first `[ ]` task in file order whose branch/PR does **not**
  already exist (skip tasks that already have an open PR — check with
  `gh pr list`). Do **exactly one** task per run.
- **Branch:** `task/<slug>` (the bold slug on the task line).
- **Definition of done:** `pnpm install` then `pnpm build`, `pnpm typecheck`,
  `pnpm test`, `pnpm lint` all pass locally before you push.
- **PR:** open a PR to `main` describing what you did. Do **NOT** merge
  autonomously — a human reviews and merges.
- After opening the PR, tick the box here to `[x]` **in the same PR** and add
  the PR number, e.g. `- [x] **editor-scaffold** (#12): …`.
- Keep packages framework-agnostic; match existing code style (see
  `packages/core`). ESLint 9 flat config, Vitest 3, TS strict, Node 22, pnpm.
- **No AI/Claude co-author trailers** in commits or PR bodies.
- If a task is ambiguous or blocked, add a `> BLOCKED: <reason>` note under it
  and stop — do not guess destructively.

---

## Phase 2 — Editor UI

- [x] **editor-scaffold** (#1): Create the `@lit-pigeon/whatsapp-editor` package
  (`packages/editor/`). package.json (type module, exports, `files`, publishConfig
  public, `@lit-pigeon/whatsapp-core` as a `workspace:^` dep, `lit ^3` as a
  peerDependency + devDependency), a Lit-friendly `tsconfig.json`
  (`experimentalDecorators: true`, `useDefineForClassFields: false`, extends
  `../../tsconfig.base.json`), a `vite.config.ts` lib build (ES, externalize
  `lit*` and the core pkg) with `vite-plugin-dts`, a `vitest.config.ts`
  (`environment: 'happy-dom'`), a `LICENSE` (copy root), and a stub
  `src/index.ts`. **DoD:** `pnpm build` + `pnpm lint` pass with the empty package.

- [x] **preview-component** (#2): Add `<pigeon-whatsapp-preview>` (`src/whatsapp-preview.ts`).
  A Lit element with a `template: WhatsAppTemplate` property that renders a
  WhatsApp-style chat bubble: header (text or a media placeholder), body with
  `{{n}}` substituted by `example.body_text[0]` samples and WhatsApp formatting
  (`*bold*`, `_italic_`, `~strike~`, ` ```mono``` `, newlines) — escape HTML
  first, then format, render via Lit `unsafeHTML` (XSS-safe). Footer as small
  grey text; buttons as full-width tappable rows with per-type icons. Add a
  `src/format.ts` helper (`substituteVariables`, `renderWhatsAppText`).
  **DoD:** unit tests for `format.ts` + a render smoke test; build/lint green.

- [x] **editor-component** (#3): Add `<pigeon-whatsapp-editor>` (`src/whatsapp-editor.ts`).
  Two-pane layout: a form (name, language, category, header format+text, body
  textarea + comma-separated sample values, footer, add/remove/edit buttons) on
  the left; `<pigeon-whatsapp-preview>` + a validation panel (errors/warnings
  from `validateTemplate`) on the right. Immutable updates; `template` property
  defaults to `createEmptyTemplate()`; dispatch `pigeon:change`
  (`{ detail: { template } }`) on edits; expose a `getPayload()` method.
  Export both elements from `src/index.ts`. **DoD:** component test (set a
  template → preview text present, invalid template → error shown); build/lint.

- [x] **playground** (#4): Add `apps/playground` — a Vite app that mounts
  `<pigeon-whatsapp-editor>` with a sample template so the editor can be opened
  in a browser (`pnpm --filter playground dev`). Add `index.html`, `src/main.ts`,
  `vite.config.ts`, `tsconfig.json`, package.json (`private: true`). **DoD:**
  `pnpm --filter <playground> build` produces a bundle; add it to CI's build.

## Phase 3 — AI authoring

- [x] **mcp-server** (#5): Add `@lit-pigeon/whatsapp-mcp` (`packages/mcp-server/`) — a
  stdio MCP server exposing tools: `create_template`, `validate_template`,
  `list_categories`, `render_preview_text`, `build_cloud_api_payload`. Reuse the
  `@modelcontextprotocol/sdk` pattern from the email repo's mcp-server. **DoD:**
  a test that spawns the server and exercises `validate_template`; build/lint.

## Phase 4 — Ecosystem & release

- [x] **framework-wrappers** (#6): Thin `@lit-pigeon/whatsapp-react`,
  `-vue`, `-svelte` wrappers around `<pigeon-whatsapp-editor>` (mirror the email
  repo's wrapper pattern: props in, DOM CustomEvents out). **DoD:** each builds;
  a minimal render test each.

- [ ] **submit-helper**: Optional `@lit-pigeon/whatsapp-cloud` — `submitTemplate()`
  that POSTs a validated template to Meta's Graph API
  (`/{waba-id}/message_templates`), plus `listTemplates()`. Takes token + WABA id;
  validates first and refuses on errors. **DoD:** unit tests with a mocked fetch.

- [x] **starter-templates** (#8): Add `getStarterTemplates()` to core — welcome,
  order-update (UTILITY), and an OTP (AUTHENTICATION) example, all passing
  `validateTemplate`. **DoD:** a test asserting every starter is `valid`.

- [ ] **release-setup**: Add changesets (`.changeset/`), a `release.yml` mirroring
  the email repo, README polish per package, then a changeset to publish
  **0.1.0** under `@lit-pigeon`. **DoD:** `pnpm changeset status` clean; do NOT
  publish in the PR (human triggers release). Note the "Actions can't open PRs"
  org limitation in the README.

## Phase 5 — Polish

- [ ] **auth-templates**: Extend the validator for AUTHENTICATION templates
  (OTP button rules, `add_security_recommendation`, `code_expiration_minutes`,
  no other components). **DoD:** tests for valid + invalid OTP templates.

- [x] **locale-list** (#9): Export the set of WhatsApp-supported language codes and
  warn (not error) on an unknown `language`. **DoD:** tests.
