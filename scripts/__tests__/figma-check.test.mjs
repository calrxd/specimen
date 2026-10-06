#!/usr/bin/env node
/**
 * Runs scripts/figma-check.mjs against a stub Figma API so the diff logic is
 * exercised without a token or a network. Three cases: a file that matches the
 * contract, one with a renamed variant value, and one with a default that has
 * drifted from the prop default in code.
 *
 * Run with: node scripts/__tests__/figma-check.test.mjs
 */
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const contract = JSON.parse(readFileSync(resolve(root, 'tokens/component-contract.json'), 'utf8'))

/** Build a Figma REST file response that satisfies the contract exactly. */
function fileFromContract(mutate = (d) => d) {
  const pages = contract.components.map((c) => {
    const defs = {}
    let i = 0
    for (const prop of c.props) {
      const f = prop.figma
      if (f.figmaType === 'NONE') continue // data props have no Figma property
      defs[`${f.name}#1:${i++}`] = {
        type: f.figmaType,
        defaultValue: prop.default !== null && prop.default !== undefined ? prop.default : f.defaultValue,
        ...(f.figmaType === 'VARIANT' ? { variantOptions: [...f.values] } : {}),
      }
      if (f.companionBoolean) {
        defs[`${f.companionBoolean}#1:${i++}`] = { type: 'BOOLEAN', defaultValue: true }
      }
    }
    const isSet = c.variantAxes.length > 0
    const node = {
      id: `1:${i + 100}`,
      name: c.name,
      type: isSet ? 'COMPONENT_SET' : 'COMPONENT',
      componentPropertyDefinitions: defs,
      children: isSet
        ? Array.from({ length: c.expectedVariantCount }, (_, n) => ({ id: `2:${n}`, name: `v${n}`, type: 'COMPONENT' }))
        : [],
    }
    return { id: `0:${i}`, name: c.name, type: 'CANVAS', children: [node] }
  })
  return mutate({ name: 'stub', document: { id: '0:0', type: 'DOCUMENT', children: pages } })
}

const CASES = [
  { name: 'matches the contract', expect: 0, mutate: (d) => d },
  {
    name: 'variant value renamed in Figma',
    expect: 1,
    mutate: (d) => {
      for (const page of d.document.children) {
        for (const node of page.children) {
          for (const def of Object.values(node.componentPropertyDefinitions)) {
            if (def.type === 'VARIANT') def.variantOptions = def.variantOptions.map((v) => (v === 'lg' ? 'large' : v))
          }
        }
      }
      return d
    },
  },
  {
    name: 'default drifted from the code default',
    expect: 1,
    mutate: (d) => {
      for (const page of d.document.children) {
        for (const node of page.children) {
          for (const def of Object.values(node.componentPropertyDefinitions)) {
            if (def.type === 'VARIANT') def.defaultValue = def.variantOptions[def.variantOptions.length - 1]
          }
        }
      }
      return d
    },
  },
]

const run = (port) =>
  new Promise((done) => {
    const child = spawn(process.execPath, [resolve(root, 'scripts/figma-check.mjs')], {
      cwd: root,
      env: { ...process.env, FIGMA_API_BASE: `http://127.0.0.1:${port}`, FIGMA_TOKEN: 'stub', FIGMA_FILE_KEY: 'stub' },
    })
    let out = ''
    child.stdout.on('data', (c) => (out += c))
    child.stderr.on('data', (c) => (out += c))
    child.on('close', (code) => done({ code, out }))
  })

let failures = 0
for (const testCase of CASES) {
  const body = JSON.stringify(fileFromContract(testCase.mutate))
  const server = createServer((_, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(body)
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const { code, out } = await run(server.address().port)
  server.close()

  const ok = code === testCase.expect
  if (!ok) failures += 1
  console.log(`${ok ? 'pass' : 'FAIL'}  ${testCase.name} (exit ${code}, expected ${testCase.expect})`)
  if (!ok) console.log(out.split('\n').map((l) => `        ${l}`).join('\n'))
}

console.log(failures === 0 ? '\nfigma-check: all cases pass' : `\nfigma-check: ${failures} case(s) failed`)
process.exit(failures === 0 ? 0 : 1)
