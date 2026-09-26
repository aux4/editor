import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: 'bin/executable.js',
  output: {
    file: 'package/lib/aux4-editor.mjs',
    format: 'es',
    inlineDynamicImports: true
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json()
  ],
  external: ['fs', 'path', 'os', 'child_process']
};
