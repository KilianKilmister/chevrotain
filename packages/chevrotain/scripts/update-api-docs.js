import _ from "lodash";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.resolve)
const __dirname = path.resolve(__filename, "../")

const pkgPath = path.resolve(__dirname, "../package.json")
const pkg = await fs.readFile(pkgPath)

console.log("updating api docs re-direct")

const version = pkg.version
const noDotsVersion = version.replace(/\./g, "_")
const newVersionApiDocsDir = path.resolve(
  __dirname,
  `../gh-pages/documentation/${noDotsVersion}`
)

try {
  stats = await fs.lstat(newVersionApiDocsDir)

  if (stats.isDirectory()) {
    console.error(`docs directory for ${noDotsVersion} already exists`)
    process.exit(-1)
  }
} catch (e) {
  // no issues it does not exist
}

// Update redirect to latest docs
const docsIndexHtmlPath = path.resolve(
  __dirname,
  "../gh-pages/documentation/index.html"
)
const docsIndexHtmlString = await fs.readFile(docsIndexHtmlPath, "utf8")
const bumpedDocsIndexHtmlString = docsIndexHtmlString.replace(
  /\d+_\d+_\d+/,
  noDotsVersion
)
fs.writeFile(docsIndexHtmlPath, bumpedDocsIndexHtmlString)

const orgDocsLocation = path.resolve(__dirname, "../dev/docs")
fs.copyFile(orgDocsLocation, newVersionApiDocsDir)
