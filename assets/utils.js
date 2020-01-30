export const lit = (segs, ...parts) => segs.map((s, i) => `${s}${parts[i]}`).join('')
