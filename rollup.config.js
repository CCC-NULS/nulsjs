import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import yaml from 'rollup-plugin-yaml'
import {terser} from 'rollup-plugin-terser'
import autoExternal from 'rollup-plugin-auto-external'
import path from 'path'
import fs from 'fs'

import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import globals from 'rollup-plugin-node-globals'
import multiEntry from 'rollup-plugin-multi-entry'
import resolve from 'rollup-plugin-node-resolve'

const {LERNA_PACKAGE_NAME, NODE_ENV} = process.env
const PACKAGE_ROOT_PATH = process.cwd()
const OUTPUT_DIR = path.join(PACKAGE_ROOT_PATH, 'dist')
const PKG_JSON = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT_PATH, 'package.json')),
)
const IS_PROD = NODE_ENV === 'production'
// const packagesPath = `${LERNA_ROOT_PATH}/packages`
// const content = fs.readdirSync(packagesPath)
// const ALL_PACKAGES = content.map(p => JSON.parse(fs.readFileSync(`${packagesPath}/${p}/package.json`, 'utf8')).name)

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const nodeBundles = ['', ['esm', 'cjs']] // node
const browserBundles = ['.browser', ['esm']] // browser
const nativeBundles = ['.mobile', ['esm']] // react-native

const entries = [nodeBundles]

if (!!PKG_JSON['browser']) {
  entries.push(browserBundles)
}

if (!!PKG_JSON['react-native']) {
  entries.push(nativeBundles)
}

const isBrowser = bundle => bundle === '.mobile'

export default entries
  .filter(([bundle]) =>
    fs.existsSync(path.join(PACKAGE_ROOT_PATH, `src/index${bundle}.ts`)),
  )
  .reduce(
    (prev, [bundle, formats]) => [
      ...prev,
      ...formats.map(format => ({
        plugins: [
          yaml(),
          json(),
          typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
            tsconfigOverride: {
              compilerOptions: {},
            },
          }),
          builtins({
            fs: true,
            crypto: true,
          }),
          commonjs({
            extensions,
          }),
          globals(),
          multiEntry(),
          resolve({
            browser: true,
            preferBuiltins: false,
            mainFields: [
              ...(isBrowser(bundle) ? ['browser'] : []),
              ...['module', 'main'],
            ],
            extensions,
          }),
          autoExternal({
            builtins: !isBrowser(bundle),
            dependencies: true,
            peerDependencies: true,
            packagePath: PACKAGE_ROOT_PATH,
          }),
          ...(IS_PROD ? [terser()] : []),
        ],
        input: path.join(PACKAGE_ROOT_PATH, `src/index${bundle}.ts`),
        output: {
          file: path.join(OUTPUT_DIR, `index${bundle}.${format}.js`),
          name: LERNA_PACKAGE_NAME,
          format,
          sourcemap: IS_PROD ? false : 'inline',
          amd: {
            id: LERNA_PACKAGE_NAME,
          },
        },
      })),
    ],
    [],
  )
