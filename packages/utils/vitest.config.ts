import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@wayfare/types": new URL("../types/src/index.ts", import.meta.url).pathname,
    },
  },
});
