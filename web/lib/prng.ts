/**
 * Mulberry32 PRNG. Deterministic given a seed; sufficient for procedural demo
 * data, NOT for cryptographic use. Returns floats in the range [0, 1).
 *
 * Source: https://gist.github.com/tommyettinger/46a3d44ade42ba43f56d (public
 * domain reference); see also Tommy Ettinger's notes for the algorithm
 * properties we rely on (good distribution, period 2^32, low cost).
 */
export type Rng = () => number

export function mulberry32(seed: number): Rng {
	let state = seed >>> 0
	return () => {
		state = (state + 0x6d2b79f5) >>> 0
		let t = state
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}
