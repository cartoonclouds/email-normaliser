// scripts/download-feature-extraction.mjs
import { env, pipeline } from '@huggingface/transformers'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Config via env vars (with sensible defaults)
const MODEL_ID = process.env.MODEL_ID || 'Xenova/all-MiniLM-L6-v2'
const OUT_DIR = process.env.OUT_DIR || 'public/models' // final destination

// Make sure the output base exists (Transformers.js will create nested dirs for the model)
mkdirSync(OUT_DIR, { recursive: true })

// During *download*, allow remote + set a filesystem cache
env.allowRemoteModels = true
env.allowLocalModels = true
env.cacheDir = OUT_DIR // Node-only: download straight into OUT_DIR

// Optional: ensure we don’t touch browser caches here
env.useBrowserCache = false

console.log(`[download] feature-extraction model: ${MODEL_ID}`)
console.log(`[download] destination: ${join(OUT_DIR, MODEL_ID)}`)

const pipe = await pipeline('feature-extraction', MODEL_ID)
// Run a tiny forward pass to ensure all artifacts (tokenizer + weights) are fetched
await pipe('warm up', { pooling: 'mean', normalize: true })

console.log('[download] complete ✅')
