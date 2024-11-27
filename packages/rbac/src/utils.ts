/**
 * Same as JSON.stringify, but with keys sorted reqursively
 */
export function stringify(input: unknown): string {
    const keys = new Set<string>();
    JSON.stringify(input, (key, value) => (keys.add(key), value));
    return JSON.stringify(input, Array.from(keys).sort());
}
