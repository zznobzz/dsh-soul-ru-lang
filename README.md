# dsh-soul-ru-lang

Russian UI language pack for the [`dsh-soul`](https://www.npmjs.com/package/dsh-soul)
personalization plugin (DeepSeek Harness). It registers a `ru` dictionary for the plugin's
`soul` locale namespace — **401 keys**, the full settings UI, session tab, workspace pages,
overview panel and toasts.

## Why a separate package

`dsh-soul` ships `zh` and `en` dictionaries. This pack keeps Russian UI text **out of the
vendor diff**: nothing in `dsh-soul` is patched or recompiled — the plugin's own locale
service is extended at runtime through the Harness client locale service
(`register('soul', 'ru', …)`).

Consequences worth knowing:

- The pack is a pure client overlay. If `dsh-soul` ever ships its own `soul` ru dictionary,
  this package becomes a no-op: the vendor dictionary wins for keys both provide.
- Nothing here touches the response language or the prompt. Russian **answers** are a feature
  of `dsh-soul` itself (`language: 'ru'`); this pack only localizes the **UI**.

## Requirements

- DeepSeek Harness with a Russian UI locale available (`0.2.2-rc.1` or newer; the client
  locale plugin registers `ru` alongside `ja/es/fr/de/pt`).
- `dsh-soul` 0.13.0 or newer, enabled in the same profile.

## Install

From GitHub (works today):

```bash
dsh plugin add github:zznobzz/dsh-soul-ru-lang
```

From npm (coming soon — the `dsh-soul-ru-lang` name is reserved for this package):

```bash
dsh plugin add dsh-soul-ru-lang
```

From a local checkout:

```bash
dsh plugin add /path/to/dsh-soul-ru-lang
```

Restart the Harness afterwards (profile changes apply at startup unless HMR is running) and
reload the page. The package declares `dsh.bundle.patch`, so the bundle manager inserts its
loader row automatically; no manual profile editing is needed.

## Verify it is active

1. Settings → Interface language → **Русский**.
2. Settings → **Персонализация** — the whole section is Russian (group titles, buttons,
   hints, toasts). The section itself is labelled «Персонализация».
3. Chat → `/soul` — help, `show`, `list`, `use` messages are Russian.

If the section stays English, the locale is not `ru` or the row is missing:

```bash
dsh --profile <profile> --dump-config | grep soul-ru-lang
```

## Updating

The dictionary mirrors the vendor `en` dictionary key by key. When `dsh-soul` changes UI
text, this pack is updated to match — ping the maintainer on such upstream changes.

Maintenance scripts (run from the repository root):

```bash
node scripts/check-keys.mjs [path/to/dsh-soul/client/index.mjs]  # key parity en ↔ ru
node scripts/embed-dict.mjs                                      # rebuild the embedded dictionary
```

`ru.json` is the source of truth; `client.js` carries an embedded copy because the client
bundle is loaded as a plain script (no JSON `require` at runtime).

## Publishing (maintainers)

npm releases are produced by GitHub Actions; no manual `npm publish` is needed.

1. Add the token once: repository **Settings → Secrets and variables → Actions → New repository
   secret**, name `NPM_TOKEN`, value an npm automation (or granular) token that may publish
   `dsh-soul-ru-lang` without a 2FA prompt.
2. Bump `version` in `package.json`, commit, then push a matching tag:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. `.github/workflows/publish.yml` verifies that the tag matches `package.json`, prints the tarball
   contents (`npm pack --dry-run`) and runs `npm publish --provenance --access public` with
   `NODE_AUTH_TOKEN` from the `NPM_TOKEN` secret.

Provenance attestation requires the repository to stay public and the workflow to keep
`id-token: write`.

## License

MIT — see [LICENSE](LICENSE).
