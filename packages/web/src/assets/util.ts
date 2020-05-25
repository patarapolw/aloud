import SparkMD5 from 'spark-md5'

export const lit = (segs: TemplateStringsArray, ...parts: string[]) =>
  segs.map((s, i) => `${s}${parts[i]}`).join('')

/**
 *
 * @param {string} [email]
 * @param {number} [size]
 */
export function getGravatarUrl (email: string, size = 96) {
  return `https://www.gravatar.com/avatar/${
    email ? SparkMD5.hash(email.trim().toLocaleLowerCase()) : '0'
  }?s=${size}&d=mp`
}

export function deepMerge (target: any, input: any) {
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
      ;(input as any[]).map((v, i) => {
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

export function getType (a: any) {
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
