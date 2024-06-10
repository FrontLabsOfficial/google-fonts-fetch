import path from 'node:path'
import fs from 'node:fs/promises'
import { consola } from 'consola'
import {
  buildDownloadFontUrls,
  buildFont,
  buildGoogleFontUrl,
  buildVariables,
  chunk,
  delay,
  downloadFont,
  downloadMetadata,
  extend,
  getFontCss,
  mergeDeep,
  mergeFontCss,
  normalizeFontOptions,
  normalizeOptions,
  parseFontCss,
  writeFontCss,
} from './utils'
import type {
  Family,
  FetchFontOptions,
  FetchFontResult,
  FetchFontsResult,
  FontMetadata,
  FontOptions,
  GoogleFontsFetch,
  GoogleFontsFetchOptions,
  Metadata,
  ResolvedGoogleFontsFetchOptions,
} from './types'

/**
 * Create Google fonts fetch
 * @param defaultOptions
 * @returns GoogleFontsFetch
 */
export function createGoogleFontsFetch(defaultOptions: GoogleFontsFetchOptions): GoogleFontsFetch {
  const baseOptions = normalizeOptions(defaultOptions) as ResolvedGoogleFontsFetchOptions
  const baseMetadata = baseOptions.metadata
  const metadataPath = path.join(
    baseMetadata.outDir || baseOptions.outDir,
    baseOptions.metadata.name,
  )

  const context = {
    /**
     * Fetch a single font.
     * @param name - The name of the font.
     * @param fontOptions - The font options.
     * @param metadata - The font metadata.
     * @returns {Promise<FetchFontResult>} The downloaded fonts.
     */
    async single(
      name: string,
      fontOptions?: FontOptions,
      metadata?: Record<string, FontMetadata>,
    ): Promise<FetchFontResult> {
      try {
        consola.info(`Start download font: ${name}`)
        const options = mergeDeep(baseOptions, normalizeFontOptions(fontOptions)) as ResolvedGoogleFontsFetchOptions
        let fontMetadata: Record<string, FontMetadata> = metadata || {}
        if (!metadata) {
          await context.metadata(false)
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8')) as Metadata
          const family = metadata.familyMetadataList.find(({ family }) => family === name)
          if (family)
            fontMetadata = family.fonts
        }

        let css = ''
        const normalize = mergeDeep(
          options.font,
          normalizeFontOptions(fontOptions),
        ) as Required<FontOptions>
        const { weightVariables, italicVariables } = buildVariables(normalize, fontMetadata)

        if (weightVariables.length) {
          const url = buildGoogleFontUrl(name, weightVariables)
          css = await getFontCss(url)
        }

        if (italicVariables.length) {
          const url = buildGoogleFontUrl(name, italicVariables)
          css += await getFontCss(url)
        }

        if (css) {
          const parsed = parseFontCss(css, normalize.subset)
          const fontUrls = buildDownloadFontUrls(parsed)
          const downloadedFontUrls: Record<string, string> = {}
          if (fontUrls.length) {
            const outDir = options.font.outDir || options.outDir
            const promises = fontUrls.map(async (url, index) => {
              downloadedFontUrls[url] = await downloadFont({
                url,
                name,
                outDir,
                base: options.base,
                filename: `${index + 1}.woff2`,
              })
            })
            await Promise.all(promises)
            const fonts = buildFont(parsed, downloadedFontUrls)
            if (options.css.write)
              await writeFontCss(name, fonts, outDir)

            consola.success(`Download font ${name} successfully`)
            return fonts
          }
        }

        return {}
      }
      catch (e) {
        consola.error(`Download font ${name} failed`, e)
        return Promise.reject(e)
      }
    },
    /**
     * Fetch metadata.
     * @param override - Whether to override existing metadata.
     * @returns {Promise<void>} A promise that resolves when the metadata is downloaded successfully.
     */
    async metadata(override?: boolean): Promise<void> {
      try {
        consola.info('Start download metadata')
        await downloadMetadata(metadataPath, override)
        consola.success('Download metadata successfully')
      }
      catch (e) {
        consola.error('Download metadata failed', e)
        return Promise.reject(e)
      }
    },
    /**
     * Fetch multiple fonts.
     * @param fonts - The fonts to fetch.
     * @param fontOptions - The font options.
     * @returns {Promise<FetchFontResult>} A promise that resolves with the downloaded fonts.
     */
    async multiple(fonts: Array<{ name: string, options?: Partial<FontOptions & FetchFontOptions>, metadata?: Record<string, FontMetadata> }>, fontOptions?: FontOptions): Promise<FetchFontsResult> {
      try {
        consola.info('Start download fonts')
        const options = mergeDeep(baseOptions, normalizeFontOptions(fontOptions)) as ResolvedGoogleFontsFetchOptions
        const promises = fonts.map(async ({ name, options, metadata }) => {
          return context.single(name, options || {}, metadata)
        })
        const res = await Promise.all(promises)
        const result = res.map((item, i) => ({ name: fonts[i].name, fonts: item }))
        consola.success('Download fonts successfully\n')
        if (options.css.write && options.css.merge) {
          const fonts = mergeFontCss(result)
          await writeFontCss('multiple', fonts, options.outDir)
        }

        return result
      }
      catch (e) {
        return Promise.reject(e)
      }
    },
    /**
     * Fetch all fonts.
     * @param fontOptions - The font options.
     * @returns {Promise<FetchFontResult>} A promise that resolves with the downloaded fonts.
     */

    /**
     * Fetch all fonts.
     * @param fontOptions - The font options.
     * @returns {Promise<{ success: FetchFontsResult, errors: Array<Family> }>} A promise that resolves with the downloaded fonts.
     */
    async all(fontOptions?: Partial<FontOptions & FetchFontOptions>): Promise<{ success: FetchFontsResult, errors: Array<Family> }> {
      const options = mergeDeep(baseOptions, normalizeFontOptions(fontOptions)) as ResolvedGoogleFontsFetchOptions
      if (options.chunk.emptyDir) {
        await fs.rm(options.outDir, { recursive: true, force: true })
      }

      try {
        await fs.access(metadataPath)
      }
      catch (e) {
        await context.metadata()
      }

      const outDir = options.font.outDir || options.outDir
      await context.metadata(false)
      const metadata = JSON.parse((await fs.readFile(metadataPath, 'utf-8'))) as Metadata
      const families = metadata.familyMetadataList
      const chunkFamilies: Array<Array<Family>> = chunk(families, baseOptions.chunk.size)
      const success: FetchFontsResult = []
      const errors: Array<Family> = []
      for (let i = 0; i < chunkFamilies.length; i++) {
        const multiple = chunkFamilies[i].map((item) => {
          const { family: name, fonts } = item
          const weight = Object.keys(fonts)
            .filter(item => !item.includes('i'))
            .map(Number)

          return { name, options: extend({}, { weight }, outDir, fontOptions), metadata: fonts }
        })

        if (fontOptions) {
          extend(fontOptions, { css: { write: false, merge: false } })
        }

        let multipleResult: FetchFontsResult = []
        try {
          multipleResult = await context.multiple(multiple, fontOptions)
        }
        catch (e) {
          try {
            multipleResult = await onError(multiple, fontOptions || {}, options.chunk.retry, options.chunk.retryDelay)
          }
          catch (e) {
            errors.push(...chunkFamilies[i])
            multipleResult = []
          }
        }

        if (multipleResult.length > 0) {
          success.push(...multipleResult)
        }

        if (baseOptions.chunk.delay) {
          await delay(baseOptions.chunk.delay)
        }
      }

      if (options.css.write && options.css.merge) {
        const fonts = mergeFontCss(success)
        await writeFontCss('all', fonts, options.outDir)
      }

      return {
        success,
        errors,
      }
    },
  }

  /**
   * Handle download fonts error
   * @param fonts
   * @param fontOptions
   * @param retry
   * @param retryDelay
   */
  async function onError(fonts: Array<{ name: string, options?: Partial<FontOptions & FetchFontOptions>, metadata?: Record<string, FontMetadata> }>, fontOptions: FontOptions, retry: number, retryDelay: number): Promise<FetchFontsResult> {
    if (retry === 0) {
      return Promise.reject(new Error('Download fonts failed'))
    }

    try {
      return await context.multiple(fonts, fontOptions)
    }
    catch (e) {
      if (retryDelay > 0) {
        await delay(retryDelay)
      }

      return onError(fonts, fontOptions, retry - 1, retryDelay)
    }
  }

  return context
}
