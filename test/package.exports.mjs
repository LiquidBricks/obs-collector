import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

// Resolve package root URL from this test file location
const pkgRoot = new URL('../', import.meta.url)

// Load and parse package.json
const pkgJsonUrl = new URL('package.json', pkgRoot)
const pkg = JSON.parse(fs.readFileSync(pkgJsonUrl, 'utf8'))

const { name: pkgName, exports: exportMap } = pkg
const expectedExportKeys = ['./collector']

test('exports map matches expected API surface', () => {
  assert.ok(exportMap && typeof exportMap === 'object', 'exports map missing')
  const actual = Object.keys(exportMap).sort()
  const expected = expectedExportKeys.slice().sort()
  assert.deepEqual(actual, expected, 'package.json exports keys changed; update expectedExportKeys if intentional')
})

test('collector subpath resolves and exposes collector export', async () => {
  const subpath = expectedExportKeys[0]
  const target = exportMap[subpath]
  assert.ok(target, `missing mapping for ${subpath}`)

  const targetUrl = new URL(target, pkgRoot)
  assert.ok(fs.existsSync(targetUrl), `target missing for ${subpath}: ${target}`)

  // Compute the package subpath specifier, e.g. "@scope/pkg/collector"
  const spec = pkgName + subpath.slice(1)

  const [viaExport, viaPath] = await Promise.all([
    import(spec),
    import(targetUrl.href),
  ])

  assert.strictEqual(viaExport, viaPath, `mismatch for ${spec} -> ${target}`)
  assert.equal(typeof viaExport.collector, 'function', 'collector export missing or not a function')
})
