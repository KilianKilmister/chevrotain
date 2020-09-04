/**
 * This script copies api.d.ts to the lib folder and modifies
 * the access level of some class methods to "protected"
 *
 * This is because the concept of "protected" interface methods
 * Is not supported in TypeScript as it does not make sense...
 */
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from 'url'

const __dirname = path.resolve(fileURLToPath(import.meta.url), '../')

const apiPath = path.resolve(__dirname, "../api.d.ts")
const apiString = await fs.readFile(apiPath, "utf8")

let fixedApiString = apiString.replace(/\/\* protected \*\//g, "protected")
fixedApiString = fixedApiString.replace(
  /\/\* protected \* static\//g,
  "protected static"
)

const apiDirPath = path.resolve(__dirname, "../lib")
fs.writeFile(`${apiDirPath}/chevrotain.d.ts`, fixedApiString)

// copy api.d.ts to lib/api.d.ts so that src/**/*.ts works when importing this file.
fs.writeFile(`${apiDirPath}/api.d.ts`, apiString)
