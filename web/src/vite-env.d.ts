/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPO_BASE_URL?: string;
  /** Optional absolute origin for the chat API (e.g. https://api.yourdomain.com). Omit in dev to use Vite proxy. */
  readonly VITE_CHAT_API_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
