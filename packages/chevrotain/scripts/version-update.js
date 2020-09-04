import config from "./version-config";
import git from "gitty";
import _ from "lodash";
import * as fs from "fs/promises";

const myRepo = git("")

const newVersion = config.currVersion
import {VERSION as oldVersion} from "../lib/src/version";
const oldVersionRegExpGlobal = new RegExp(oldVersion.replace(/\./g, "\\."), "g")

const dateTemplateRegExp = /^(## X\.Y\.Z )\(INSERT_DATE_HERE\)/
if (!dateTemplateRegExp.test(config.changeLogString)) {
  console.log(
    "CHANGELOG.md must have first line in the format '## X.Y.Z (INSERT_DATE_HERE)'"
  )
  process.exit(-1)
}

// updating CHANGELOG.md date
const nowDate = new Date()
const nowDateString = nowDate.toLocaleDateString("en-US").replace(/\//g, "-")
const changeLogDate = config.changeLogString.replace(
  dateTemplateRegExp,
  `## ${newVersion} (${nowDateString})`
)
await fs.writeFile(config.changeLogPath, changeLogDate)

_.forEach(config.docFilesPaths, currDocPath => {
  if (_.includes(currDocPath, "changes")) {
    console.log(`SKIPPING bumping file: <${currDocPath}>`)
    return
  }
  console.log(`bumping file: <${currDocPath}>`)
  const currItemContents = await fs.readFile(currDocPath, "utf8")
  const bumpedItemContents = currItemContents.replace(
    /\d+_\d+_\d+/g,
    newVersion.replace(/\./g, "_")
  )
  await fs.writeFile(currDocPath, bumpedItemContents)
})

console.log(`bumping unpkg link in: <${config.readmePath}>`)
console.log(`bumping version on <${config.versionPath}>`)

const bumpedVersionTsFileContents = config.apiString.replace(
  oldVersionRegExpGlobal,
  newVersion
)
await fs.writeFile(config.versionPath, bumpedVersionTsFileContents)

const readmeContents = await fs.readFile(config.readmePath, "utf8")
const bumpedReadmeContents = readmeContents.replace(
  oldVersionRegExpGlobal,
  newVersion
)
await fs.writeFile(config.readmePath, bumpedReadmeContents)

// Just adding to the current commit is sufficient as lerna does the commit + tag + push
myRepo.addSync(
  [config.versionPath, config.changeLogPath].concat(config.docFilesPaths)
)
