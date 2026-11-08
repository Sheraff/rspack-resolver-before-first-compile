import fs from 'node:fs'
import path from 'node:path'
import { rspack, rspackVersion } from '@rspack/core'

const root = path.resolve('src')
const newFile = path.join(root, 'lib.js')
fs.rmSync(newFile, { force: true })

const compiler = rspack({ context: root, entry: './index.js', mode: 'development' })
const run = () => new Promise((ok, fail) => compiler.run((err) => (err ? fail(err) : ok())))
const resolve = (resolver) =>
  new Promise((ok) =>
    resolver.resolve({}, root, './lib', {}, (err, file) => ok(err ? err.message : path.relative(root, file))),
  )

console.log('@rspack/core', rspackVersion)

// `npm run control` (LATE=1) gets the resolver after the first compilation instead
let resolver = process.env.LATE ? undefined : compiler.resolverFactory.get('normal')
if (resolver) console.log('before the first compilation:', await resolve(resolver))
await run()
resolver ??= compiler.resolverFactory.get('normal')

fs.writeFileSync(newFile, "export default 'file'\n") // `./lib` should now resolve to lib.js
await run()

console.log('resolver:                ', await resolve(resolver))
console.log('get("normal") again:     ', await resolve(compiler.resolverFactory.get('normal')))
console.log('get("normal", { esm }):  ', await resolve(compiler.resolverFactory.get('normal', { dependencyType: 'esm' })))

await new Promise((ok) => compiler.close(ok))
fs.rmSync(newFile, { force: true })
