export interface GoogleFontsFetchOptions {
  base: string
  outDir: string
  metadata?: {
    name?: string
    outDir?: string
    override?: boolean
  }
  chunk?: {
    size?: number
    delay?: number
    retry?: number
    retryDelay?: number
    emptyDir?: boolean
  }
  css?: {
    write?: boolean
    merge?: boolean
  }
  font?: {
    subset?: Array<string>
    display?: string
    weight?: Array<number>
    style?: Array<string>
    outDir?: string
  }
}

export interface ResolvedGoogleFontsFetchOptions {
  base: string
  outDir: string
  metadata: {
    name: string
    outDir: string
    override: boolean
  }
  chunk: {
    size: number
    delay: number
    retry: number
    retryDelay: number
    emptyDir: boolean
  }
  css: {
    write: boolean
    merge: boolean
  }
  font: {
    outDir: string
    subset: Array<string>
    display: string
    weight: Array<number>
    style: Array<string>
  }
}

export interface GoogleFontsFetch {
  single: (
    name: string,
    options?: Partial<FontOptions & FetchFontOptions>,
    metadata?: Record<string, FontMetadata>,
  ) => Promise<Record<string, string>>
  metadata: (override?: boolean) => Promise<any>
  multiple: (fonts: Array<{ name: string, options?: Partial<FontOptions & FetchFontOptions>, metadata?: Record<string, FontMetadata> }>) => Promise<FetchFontsResult>
  all: (options?: Partial<FontOptions & FetchFontOptions>) => Promise<{ success: FetchFontsResult, errors: Array<Family> }>
}

export interface FontOptions {
  weight?: Array<number>
  style?: Array<string>
  subset?: Array<string>
  display?: string
}

export interface FontMetadata {
  thickness: number
  slant: number
  width: number
  lineHeight: number
}

export interface Family {
  family: string
  subsets: Array<string>
  fonts: Record<string, FontMetadata>
}

export interface Metadata {
  familyMetadataList: Array<Family>
}

export interface GoogleFontsOptions {
  display: string
}

export interface FetchFontOptions {
  url: string
  name: string
  base: string
  filename: string
  outDir: string
}

export interface FontContent {
  url: string
  css: string
}

export interface FetchFontResult {
  [variant: string]: string
}

export type FetchFontsResult = Array<{ name: string, fonts: FetchFontResult }>
