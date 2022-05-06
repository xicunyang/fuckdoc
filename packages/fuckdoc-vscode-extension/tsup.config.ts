import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/extension.ts'],
  clean: true,
  // dts: true,
  outDir: "dist",
  format: ['cjs'],
  external: ['vscode']
});
