import path from 'node:path'
import fs from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { ofetch } from 'ofetch'
import type { FetchFontOptions } from '../types'
import { normalizeName } from './string'

const metadataURL = 'https://fonts.google.com/metadata/fonts'

/**
 * Download font by url and path
 * @param options
 */
export async function downloadFont(options: FetchFontOptions): Promise<string> {
  try {
    const name = normalizeName(options.name)
    const fontPath = path.join(options.outDir, name)
    await fs.mkdir(fontPath, { recursive: true })
    const response = await ofetch(options.url, {
      responseType: 'arrayBuffer',
      retry: 5,
      retryDelay: 1000,
    })
    if (!response) {
      return Promise.reject(new Error('Not found font'))
    }

    const buffer = Buffer.from(response)
    await fs.writeFile(`${fontPath}/${options.filename}`, buffer, 'utf-8')
    return `${options.base}/${name}/${options.filename}`
  }
  catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Download metadata by url and path
 * @param outputPath
 * @param override
 */
export async function downloadMetadata(outputPath: string, override = true): Promise<void> {
  if (!override) {
    try {
      await fs.access(outputPath)
      return
    }
    catch (e) {
      // Continue
    }
  }

  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    const response = await ofetch(metadataURL)
    if (!response) {
      return Promise.reject(new Error('Not found metadata'))
    }

    await fs.writeFile(outputPath, JSON.stringify(response, null, 2), 'utf-8')
  }
  catch (e) {
    return Promise.reject(e)
  }
}
