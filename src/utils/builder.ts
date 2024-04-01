import type { FontContent, FontMetadata, FontOptions, GoogleFontsOptions } from '../types'
import { extend } from './common'

const baseURL = 'https://fonts.googleapis.com/css2'

/**
 * Build query string
 * @param params
 * @returns {string} The built query string.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  return Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&')
}

/**
 * Build Google Font URL
 * @param name
 * @param variables
 * @param options
 * @returns {string} The built Google Font URL.
 */
export function buildGoogleFontUrl(name: string, variables: Array<string>, options?: GoogleFontsOptions): string {
  const isItalic = variables.some(item => item.endsWith('i'))
  const normalizeAxis = variables.map((item) => {
    if (isItalic) {
      return `1,${item.replace(/i$/, '')}`
    }

    return item
  })
  const family = `${name}:${isItalic ? 'ital,' : ''}wght@${normalizeAxis.join(';')}`
  const params = extend({}, { display: 'swap' }, options || {}, { family }) as Record<
    string,
    unknown
  >
  return `${baseURL}?${buildQueryString(params)}`
}

/**
 * Build download font URLs
 * @param content
 * @returns {Array<string>} The array of font download URLs.
 */
export function buildDownloadFontUrls(content: Record<string, Record<string, FontContent>>): Array<string> {
  const seen = new Set<string>()
  for (const weight in content) {
    for (const subset in content[weight]) {
      const { url } = content[weight][subset]
      if (!seen.has(url)) {
        seen.add(url)
      }
    }
  }

  return Array.from(seen)
}

/**
 * Build font content
 * @param content
 * @param fontUrls
 * @returns {Record<string, string>} The built font content.
 */
export function buildFont(content: Record<string, Record<string, FontContent>>, fontUrls: Record<string, string>): Record<string, string> {
  const bundle: Record<string, string> = {}
  for (const weight in content) {
    let css = ''
    for (const subset in content[weight]) {
      const { url, css: subsetCss } = content[weight][subset]
      if (fontUrls[url]) {
        css += subsetCss.replace(url, fontUrls[url])
      }
    }

    bundle[weight] = css
  }

  return bundle
}

/**
 * Build variables
 * @param options
 * @param metadata
 * @returns {weightVariables: Array<string>, italicVariables: Array<string>} The built variables.
 */
export function buildVariables(options: Required<FontOptions>, metadata: Record<string, FontMetadata>): { weightVariables: Array<string>, italicVariables: Array<string> } {
  const hasItalic = options.style.includes('italic')
  let weight: Array<number> = []
  if (options.weight.length > 0) {
    weight = options.weight.sort((a, b) => a - b)
  }
  else {
    weight = Object.keys(metadata)
      .filter(item => !item.endsWith('i'))
      .map(item => Number.parseInt(item))
      .sort((a, b) => a - b)
  }

  const weightVariables = weight.filter(item => metadata[`${item}`]).map(String)
  const italicVariables = hasItalic
    ? weight.filter(item => metadata[`${item}i`]).map(String)
    : []

  return { weightVariables, italicVariables }
}
