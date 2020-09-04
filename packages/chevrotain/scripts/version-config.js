import jf from "jsonfile";
import * as fs from "fs/promises";
import * as path from "path";
import _ from "lodash";

const __filename = fileURLToPath(import.meta.resolve)
const __dirname = path.resolve(__filename, "../")

const versionPath = path.resolve(__dirname, "../src/version.ts")
const packagePath = path.resolve(__dirname, "../package.json")
const changeLogPath = path.resolve(__dirname, "../docs/changes/CHANGELOG.md")

const docsDirPath = path.resolve(__dirname, "../docs")
const docFiles = await fs.readFile(docsDirPath)

const docFilesPaths = _.map(docFiles, file => {
  return path.resolve(docsDirPath, file)
})

function notChangesDocs(path) {
  return !_.includes(path, "changes/")
}

const markdownDocsFiles = await _.reduce(
  docFilesPaths,
  async (result, currPath) => {
    // Only scan 2 directories deep.
    if (await fs.lstat(currPath).isDirectory()) {
      const nestedFiles = await fs.readdir(currPath)
      const nestedPaths = _.map(nestedFiles, (currFile) =>
        path.resolve(currPath, currFile)
      )
      const newMarkdowns = _.filter(
        nestedPaths,
        (currPath) => _.endsWith(currPath, ".md") && notChangesDocs(currPath)
      )

      result = (await result).concat(newMarkdowns)
    } else if (
      (await fs.lstat(currPath)).isFile() &&
      _.endsWith(currPath, ".md") &&
      notChangesDocs(currPath)
    ) {
      result.push(currPath)
    }

    return result
  },
  []
)

const mainReadmePath = path.resolve(__dirname, "../../../readme.md")
markdownDocsFiles.push(mainReadmePath)

const pkgJson = await jf.readFile(packagePath)
const apiString = await fs.readFile(versionPath, "utf8")
const changeLogString = await fs.readFile(changeLogPath, "utf8")

export default {
  versionPath,
  packagePath,
  changeLogPath,
  docFilesPaths: markdownDocsFiles,
  readmePath: mainReadmePath,
  pkgJson,
  apiString,
  changeLogString,
  currVersion: pkgJson.version
};
