/**
 * Aggregate per-step `runs[]` arrays in measurements.json into `summary`
 * blocks (median of each metric). Idempotent — safe to re-run.
 *
 * Usage: `node docs/talk/measurements/summarize.mjs` (works from any CWD).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const FILE = resolve(HERE, 'measurements.json')

const SNAPSHOT_KEYS = [
	'lcp',
	'ttfb',
	'fcp',
	'inp',
	'cls',
	'jsBytes',
	'hydrationMs',
	'chartHydrationMs',
	'timeToTradeMs'
]

/**
 * @param {ReadonlyArray<unknown>} values
 * @returns {number | null}
 */
function median(values) {
	const filtered = values.filter((v) => typeof v === 'number')
	if (filtered.length === 0) return null
	const sorted = [...filtered].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid]
}

/**
 * @param {ReadonlyArray<Record<string, unknown>> | undefined} runs
 * @returns {Record<string, number | null> | null}
 */
function summarizeRuns(runs) {
	if (!runs || runs.length === 0) return null
	return Object.fromEntries(
		SNAPSHOT_KEYS.map((k) => [k, median(runs.map((r) => r[k]))])
	)
}

function readJson() {
	try {
		return JSON.parse(readFileSync(FILE, 'utf8'))
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.error(`Could not read or parse ${FILE}: ${message}`)
		process.exit(1)
	}
}

const data = readJson()
/** @type {string[]} */
const updated = []

for (const stepKey of ['step1', 'step2', 'step3', 'step4']) {
	const step = data[stepKey]
	if (step?.runs) {
		const summary = summarizeRuns(step.runs)
		step.summary = summary
		if (summary !== null) updated.push(`${stepKey} (${step.runs.length} runs)`)
	}
}

if (data.step5b) {
	for (const variant of ['csr', 'rsc']) {
		for (const reload of ['cold', 'warm']) {
			const slot = data.step5b[variant]?.[reload]
			if (slot?.runs) {
				const summary = summarizeRuns(slot.runs)
				slot.summary = summary
				if (summary !== null) {
					updated.push(`step5b.${variant}.${reload} (${slot.runs.length} runs)`)
				}
			}
		}
	}
}

if (data.step5c?.tabs) {
	const summary = summarizeRuns(data.step5c.tabs)
	data.step5c.summary = summary
	if (summary !== null) updated.push(`step5c (${data.step5c.tabs.length} tabs)`)
}

writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`)
console.log(
	updated.length === 0
		? 'Summary blocks updated: (none — all runs[] empty)'
		: `Summary blocks updated: ${updated.join(', ')}`
)
