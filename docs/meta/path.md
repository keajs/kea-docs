# path

## Setting the path manually

In order to help debugging, you may manually specify a `path` for your logic.

```typescript
kea([
  path(['scenes', 'dashboard']),
])
```

This doesn't change how Kea behaves, but helps when inspecting the state and actions.

## Setting the path automatically

[`kea-typegen`](/docs/intro/typescript#option-2-kea-typegen) is able to automatically add the path to your logic
if you run it with `--write-paths`.

See the [debugging](/docs/intro/debugging) doc for more details on why this is useful.
