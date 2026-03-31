#!/usr/bin/env node
/**
 * One-command local setup: npm install, create .env from .env.example if missing,
 * optionally pull Ollama models when `ollama` is on PATH.
 * Exits non-zero only if `npm install` fails.
 */

import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const DEFAULT_CHAT_MODEL = 'llama3.2'
const DEFAULT_EMBED_MODEL = 'nomic-embed-text'

function parseEnvFile(path, keys) {
  if (!existsSync(path)) return {}
  const content = readFileSync(path, 'utf8')
  const out = {}
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim()
    if (!keys.includes(k)) continue
    let v = t.slice(eq + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

function runNpmInstall() {
  const r = spawnSync('npm', ['install'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (r.error) {
    console.error('[setup] npm install failed:', r.error.message)
    process.exit(1)
  }
  if (r.status !== 0) {
    process.exit(r.status ?? 1)
  }
}

function ensureEnvFile() {
  const envPath = join(root, '.env')
  const examplePath = join(root, '.env.example')
  if (existsSync(envPath)) {
    return
  }
  if (!existsSync(examplePath)) {
    console.warn('[setup] Missing .env.example; skipping .env creation.')
    return
  }
  copyFileSync(examplePath, envPath)
  console.info(
    '[setup] Created .env from .env.example — edit SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before ingest/chat.',
  )
}

function ollamaOnPath() {
  const r = spawnSync('ollama', ['--version'], {
    cwd: root,
    stdio: 'pipe',
    shell: process.platform === 'win32',
  })
  return r.status === 0 && !r.error
}

function pullOllamaModels(models) {
  const seen = new Set()
  for (const name of models) {
    const trimmed = String(name ?? '').trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    console.info(`[setup] ollama pull ${trimmed}`)
    const r = spawnSync('ollama', ['pull', trimmed], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    if (r.status !== 0 || r.error) {
      console.warn(
        `[setup] ollama pull ${trimmed} failed (continuing). Install Ollama and see README "Install Ollama".`,
      )
    }
  }
}

function main() {
  process.chdir(root)

  runNpmInstall()
  ensureEnvFile()

  const envPath = join(root, '.env')
  const keys = ['OLLAMA_CHAT_MODEL', 'OLLAMA_EMBEDDING_MODEL']
  const fromEnv = parseEnvFile(envPath, keys)
  const chatModel = fromEnv.OLLAMA_CHAT_MODEL || DEFAULT_CHAT_MODEL
  const embedModel = fromEnv.OLLAMA_EMBEDDING_MODEL || DEFAULT_EMBED_MODEL

  if (ollamaOnPath()) {
    pullOllamaModels([chatModel, embedModel])
  } else {
    console.info(
      '[setup] Ollama not found on PATH — skip model pulls. See README "Install Ollama".',
    )
  }
}

main()
