import type {
  FetchFontOptions,
  FontOptions,
  GoogleFontsFetchOptions,
  ResolvedGoogleFontsFetchOptions,
} from '../types'
import { extend, mergeDeep } from './common'

/**
 * Normalize Google Font Helper options
 * @param options
 * @returns {ResolvedGoogleFontsFetchOptions} The normalized Google Font Helper options.
 */
export function normalizeOptions(options?: GoogleFontsFetchOptions): ResolvedGoogleFontsFetchOptions {
  const base: ResolvedGoogleFontsFetchOptions = {
    base: '',
    outDir: './output',
    metadata: {
      name: 'metadata.json',
      outDir: './output',
      override: false,
    },
    chunk: {
      size: 3,
      delay: 200,
      retry: 5,
      retryDelay: 1000,
      emptyDir: false,
    },
    css: {
      write: false,
      merge: false,
    },
    font: {
      subset: [],
      display: 'swap',
      weight: [],
      style: ['normal', 'italic'],
      outDir: './output/fonts',
    },
  }
  return mergeDeep(
    base,
    options || {},
  ) as ResolvedGoogleFontsFetchOptions
}

/**
 * Normalize download font options
 * @param options
 * @returns {Required<FetchFontOptions>} The normalized download font options.
 */
export function normalizeDownloadOptions(options?: FetchFontOptions): Required<FetchFontOptions> {
  return extend(
    {},
    {
      url: '',
      name: '',
      base: '',
      filename: '',
      outDir: '',
    },
    options || {},
  )
}

/**
 * Normalize font options
 * @param options
 * @returns {Required<FontOptions>} The normalized font options.
 */
export function normalizeFontOptions(options?: FontOptions): Required<FontOptions> {
  return extend(
    {},
    {
      display: 'swap',
      weight: [],
      style: ['normal', 'italic'],
      subset: [],
    },
    options || {},
  )
}
