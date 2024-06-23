import type { Options } from 'tsup';
import { defineConfig } from 'tsup';

export function createTsupConfig(options?: Options) {
	return defineConfig({
		entry: ['src/index.ts'],
		external: [],
		noExternal: [],
		platform: 'node',
		format: ['esm'],
		skipNodeModulesBundle: true,
		target: 'esnext',
		clean: true,
		minify: false,
        terserOptions: {
            mangle: false,
            keep_classnames: true,
            keep_fnames: true
        },
		splitting: false,
		keepNames: true,
		dts: true,
		sourcemap: true,
		esbuildPlugins: [],
		treeshake: true,
		outDir: './dist',
        tsconfig: 'tsconfig.json',
        ...options
	});
}
