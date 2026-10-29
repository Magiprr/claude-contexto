export type Fill = { tokens: number; window: number; percent: number; isEstimate: boolean }

declare module 'claude-code' {
  interface PluginState {
    contexto: { fill: Fill | null }
  }
}
