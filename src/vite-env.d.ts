/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID?: string
  readonly SANITY_DATASET?: string
  readonly SANITY_API_VERSION?: string
  readonly SANITY_USE_CDN?: string
  readonly ENQUIRY_ENDPOINT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
