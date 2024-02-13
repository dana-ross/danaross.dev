const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const svgo = require("svgo");
const { handleFSError } = require("./utils");

/**
 * Finds image files and copies them to the build directory.
 * Optimizes SVG files.
 *
 * @param {String} sourceDir
 * @param {String} targetDir
 */
function processGlobalImagesDir(sourceDir, targetDir) {
  return fs.readdir(sourceDir, (err, files) => {
    files.forEach((file) => {
      const sourceFile = path.resolve(sourceDir, file);
      if (fs.statSync(sourceFile).isDirectory()) {
        const targetSubdir = path.resolve(targetDir, file);
        fs.mkdirSync(targetSubdir);
        processGlobalImagesDir(sourceFile, targetSubdir);
      } else {
        const targetFile = path.resolve(targetDir, file);
        processImage(sourceFile, targetFile);
      }
    });
  });
}

/**
 * Process the main directory of image files
 *
 * @param {String} buildDir Directory where built www files will go
 */
async function processGlobalImages(buildDir) {
  const targetDir = path.resolve(buildDir + "/images");
  fs.mkdirSync(targetDir);
  processGlobalImagesDir(path.resolve("./images"), targetDir);
}

/**
 * Process a single image file. Optimizes SVGs. Copies all other image formats.
 * @param {String} sourceFile
 * @param {String} targetFile
 */
function processImage(sourceFile, targetFile) {
  const fileName = path.basename(sourceFile);
  if (path.extname(fileName) == ".svg") {
    console.log(
      `🖼️  ${chalk.white("Optimizing")} ${chalk.blue(
        fileName
      )} → ${chalk.yellow(targetFile)}`
    );
    const originalSVG = fs.readFileSync(sourceFile);
    const optimizedSVG = svgo.optimize(originalSVG);
    fs.writeFile(targetFile, optimizedSVG.data, handleFSError);
  } else {
    console.log(
      `🖼️  ${chalk.white("Copying")} ${chalk.blue(fileName)} → ${chalk.yellow(
        targetFile
      )}`
    );
    fs.copyFile(sourceFile, targetFile, handleFSError);
  }
}

module.exports = {
  processGlobalImages,
  processImage,
};
