export const lit = (segs, ...parts) => segs.map((s, i) => `${s}${parts[i]}`).join('')

export function deepMerge (target, input) {
  const t = getType(target)
  if (t === getType(input)) {
    if (t === 'record') {
      for (const [k, v] of Object.entries(input)) {
        const vT = getType(v)
        if (['record', 'array'].includes(vT)) {
          deepMerge(target[k], v)
        } else {
          target[k] = v
        }
      }
    } else if (t === 'array') {
      input.map((v, i) => {
        const vT = getType(v)
        if (['record', 'array'].includes(vT)) {
          deepMerge(target[i], v)
        } else {
          target[i] = v
        }
      })
    }
  }
}

export function getType (a) {
  const t = typeof a
  if (t === 'object') {
    if (!a) {
      return 'null'
    } else if (Array.isArray(a)) {
      return 'array'
    } else if (a.toString() === '[object Object]') {
      return 'record'
    } else {
      return a.toString()
    }
  }
  return t
}
