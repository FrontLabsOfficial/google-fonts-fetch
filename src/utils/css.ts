import path from 'node:path'
import fs from 'node:fs/promises'
import { ofetch } from 'ofetch'
import type { FetchFontsResult, FontContent } from '../types'
import { normalizeName } from './string'

/**
 * Get font css content
 * @param url
 * @returns {string} The font css content.
 */
export async function getFontCss(url: string): Promise<string> {
  const response = await ofetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    },
    responseType: 'text',
    retry: 5,
    retryDelay: 1000,
  })
  if (!response) {
    return Promise.reject(new Error('Not found font css'))
  }

  return response
}

/**
 * Parse font url
 * @param cssContent
 * @returns {string} The font url.
 */
export function parseFontUrl(cssContent: string): string {
  const matches = cssContent.match(/url\((.*?)\)/)
  return matches && matches[1] ? matches[1].replace(/['"]/g, '') : ''
}

/**
 * Minify font css content
 * @param css
 * @returns {string} The minified font css content.
 */
export function minifyFontCss(css: string): string {
  return css
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\/\*.*?\*\//g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/\n/g, '')
    .trim()
}

/**
 * Parse font css content
 * @param css
 * @param subsets
 * @returns {Record<string, Record<string, FontContent>>} The parsed font css content.
 */
export function parseFontCss(css: string, subsets: Array<string>): Record<string, Record<string, FontContent>> {
  const content: Record<string, Record<string, FontContent>> = {}
  const rules = css.split('/* ')
  for (let i = 1; i < rules.length; i++) {
    const rule = rules[i].split(' */')
    const subsetCss = rule[1].trim()
    const subset = rule[0]
    const fontWeightMatches = subsetCss.match(/font-weight:\s*(\d+)/)
    const fontStyleMatches = subsetCss.match(/font-style:\s*(\w+)/)
    if (fontWeightMatches && fontStyleMatches && subset) {
      const weight = fontWeightMatches[1]
      const style = fontStyleMatches[1] === 'normal' ? '' : 'i'
      const key = `${weight}${style}`
      const url = parseFontUrl(subsetCss)
      if (!content[key]) {
        content[key] = {}
      }

      if (subsets.length === 0 || subsets.includes(subset)) {
        content[key][subset] = { url, css: minifyFontCss(subsetCss) }
      }
    }
  }

  return content
}

/**
 * Write font css content
 * @param name
 * @param fonts
 * @param outputPath
 * @returns {Promise<void>} The promise.
 */
export async function writeFontCss(name: string, fonts: Record<string, string>, outputPath: string): Promise<void> {
  try {
    const fontPath = path.join(outputPath, normalizeName(name))
    const content = Object.keys(fonts).reduce((acc, key) => {
      acc += fonts[key]
      return acc
    }, '')
    await fs.mkdir(fontPath, { recursive: true })
    await fs.writeFile(`${fontPath}/style.css`, content, 'utf-8')
  }
  catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Merge font css content
 * @param fonts
 */
export function mergeFontCss(fonts: FetchFontsResult): Record<string, string> {
  return fonts.reduce((acc, item) => {
    acc[item.name] = Object.values(item.fonts).join('')
    return acc
  }, {} as Record<string, string>)
}
