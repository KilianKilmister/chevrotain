/**
 * this script adds istanbul ignore comments to the compiled JS sources.
 * For some strange reason this is only needed for interpreter.js
 * In other compiled files there are no issues.
 * TODO: Try to remove this script in the future, perhaps it is a bug in TS source maps or nyc instrumentation.
 *      - 23/02/19 still broken with TypeScript 3.3.0
 */
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from 'url'

console.log('"fixing"')
const interPath = path.resolve(
  fileURLToPath(import.meta.url),
  "../../lib/src/parse/grammar/interpreter.js"
)

const interString = await fs.readFile(interPath, "utf8")
let fixedInterString = interString.replace(
  "var __extends =",
  "/* istanbul ignore next */ var __extends ="
)

fixedInterString = fixedInterString.replace(
  /\|\| this/g,
  "/* istanbul ignore next */ || this"
)

await fs.writeFile(interPath, fixedInterString)
