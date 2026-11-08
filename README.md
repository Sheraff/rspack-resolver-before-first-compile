# Rspack: a resolver used before the first compilation never sees new files

Issue: https://github.com/web-infra-dev/rspack/issues/16510

```sh
npm install
npm run repro    # resolver got and used before the first compilation
npm run control  # same resolver, got after the first compilation
```

`npm run repro` on @rspack/core 2.3.1:

```
before the first compilation: lib/index.js
resolver:                 lib/index.js   ✗ lib.js was created before the second compilation
get("normal") again:      lib/index.js   ✗ same cached Resolver
get("normal", { esm }):   lib.js
```

`npm run control` prints `lib.js` on all three lines. Getting the resolver early without
calling `resolve()` before the first compilation also works.
