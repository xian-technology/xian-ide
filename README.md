# xian-ide-web

`xian-ide-web` is the browser-based IDE for Xian smart contracts. It pairs
the Monaco editor with a Xian-specific theme, the linter from
`xian-linter`, contract templates, the JS client, and the injected wallet
provider so contract authors can read, edit, lint, and deploy contracts
without leaving the browser.

The app is a Vite + React + TypeScript single-page app. It is
self-contained and consumes the public `@xian-tech/client` and
`@xian-tech/provider` packages from npm.

## Quick Start

```bash
npm install
npm run dev          # local dev server
npm run build        # production build (tsc + vite build)
npm run lint         # ESLint
npm run preview      # serve the production build locally
```

Open the printed URL in a browser. Connect a Xian wallet through the
injected provider to enable contract submission.

## Principles

- **Browser-native authoring.** The full author loop — edit, lint,
  simulate, submit — runs in the browser. There is no server-side
  component owned by this repo.
- **Linter is shared, not duplicated.** Linting goes through the same
  rules used by `xian-linter`; this repo wires them into Monaco, it does
  not redefine them.
- **Wallet via injected provider.** Transaction signing uses
  `@xian-tech/provider`'s injected-wallet discovery and the user's
  installed Xian wallet. The IDE never holds private keys.
- **Templates are starting points.** Contract templates live in
  `src/lib/contract-templates.ts` and are exposed in the editor as
  starter content; they are not a contract registry.
- **Vendor SDKs from npm.** The IDE consumes published versions of
  `@xian-tech/client` and `@xian-tech/provider`, not sibling checkouts.

## Key Directories

- `src/` — application code:
  - `App.tsx`, `main.tsx` — root component and Vite entry.
  - `components/` — IDE UI components (editor wrapper, panels, terminals).
  - `hooks/` — custom React hooks (e.g. `useIDE`).
  - `lib/` — integration layer:
    - `xian-client.ts` — `@xian-tech/client` setup and helpers.
    - `wallet.ts` — injected-provider connection and transaction flow.
    - `linter.ts` — bridge to the contract linter.
    - `contract-templates.ts` — starter contract templates.
  - `styles/`, `assets/` — Monaco theme, CSS, and static assets.
- `public/` — static assets served as-is.
- `index.html` — Vite HTML entrypoint.
- `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` — build, type,
  and lint configuration.

## Validation

```bash
npm install
npm run lint         # ESLint
npm run build        # tsc -b && vite build (also runs the typecheck)
```

The IDE has no server side, so functional validation is the build pipeline
plus interactive testing in a browser with a Xian wallet installed.

## Related Repos

- [`../xian-linter/README.md`](../xian-linter/README.md) — contract linter consumed by the IDE
- [`../xian-js/README.md`](../xian-js/README.md) — JS / TS SDK and provider contract
- [`../xian-wallet-browser/README.md`](../xian-wallet-browser/README.md) — browser wallet that this IDE talks to via the injected provider
