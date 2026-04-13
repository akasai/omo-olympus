declare module "@opencode-ai/plugin" {
  export type Plugin = () => Promise<Record<string, any>>
}

declare module "solid-js" {
  export function createSignal<T>(value: T): [() => T, (value: T) => void]
}

declare module "@opencode-ai/plugin/tui" {
  export type TuiPlugin = any
  export type TuiPluginModule = any
  export type TuiSlotContext = any
}

declare module "@opentui/solid/jsx-runtime" {
  export const Fragment: any
  export const jsx: any
  export const jsxs: any
}

declare const require: any
