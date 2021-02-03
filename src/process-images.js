const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const SVGO = require('svgo')
const {handleFSError} = require('./utils')

svgo = new SVGO({
  plugins: [{
    cleanupAttrs: true,
  }, {
    removeDoctype: true,
  }, {
    removeXMLProcInst: true,
  }, {
    removeComments: true,
  }, {
    removeMetadata: true,
  }, {
    removeTitle: true,
  }, {
    removeDesc: true,
  }, {
    removeUselessDefs: true,
  }, {
    removeEditorsNSData: true,
  }, {
    removeEmptyAttrs: true,
  }, {
    removeHiddenElems: true,
  }, {
    removeEmptyText: true,
  }, {
    removeEmptyContainers: true,
  }, {
    removeViewBox: false,
  }, {
    cleanupEnableBackground: true,
  }, {
    convertStyleToAttrs: true,
  }, {
    convertColors: true,
  }, {
    convertPathData: true,
  }, {
    convertTransform: true,
  }, {
    removeUnknownsAndDefaults: true,
  }, {
    removeNonInheritableGroupAttrs: true,
  }, {
    removeUselessStrokeAndFill: true,
  }, {
    removeUnusedNS: true,
  }, {
    cleanupIDs: true,
  }, {
    cleanupNumericValues: true,
  }, {
    moveElemsAttrsToGroup: true,
  }, {
    moveGroupAttrsToElems: true,
  }, {
    collapseGroups: true,
  }, {
    removeRasterImages: false,
  }, {
    mergePaths: true,
  }, {
    convertShapeToPath: true,
  }, {
    sortAttrs: true,
  }, {
    removeDimensions: true,
  }, {
    removeAttrs: { attrs: '(krita.+)' },
  }]
});

/**
 * Finds image files and copies them to the build directory.
 * Optimizes SVG files.
 * 
 * @param {String} sourceDir
 * @param {String} targetDir
 */
function processGlobalImagesDir (sourceDir, targetDir) {    
  return fs.readdir(sourceDir, (err, files) => {
      files.forEach((file) => {
        const sourceFile = path.resolve(sourceDir, file)
        if (fs.statSync(sourceFile).isDirectory()) {
          const targetSubdir = path.resolve(targetDir, file)
          fs.mkdirSync(targetSubdir)
          processGlobalImagesDir(sourceFile, targetSubdir)
        }
        else {
          const targetFile = path.resolve(targetDir, file)
          processImage(sourceFile, targetFile);
        }
      })
    });
}

/**
 * Process the main directory of image files
 * 
 * @param {String} buildDir Directory where built www files will go 
 */
async function processGlobalImages(buildDir) {
  const targetDir = path.resolve(buildDir + '/images')
  fs.mkdirSync(targetDir)
  processGlobalImagesDir(path.resolve('./images'), targetDir)
}

/**
 * Process a single image file. Optimizes SVGs. Copies all other image formats.
 * @param {String} sourceFile 
 * @param {String} targetFile 
 */
function processImage(sourceFile, targetFile) {
  const fileName = path.basename(sourceFile);
  if (path.extname(fileName) == '.svg') {
    console.log(`🖼️  ${chalk.white('Optimizing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFile)}`)
    const originalSVG = fs.readFileSync(sourceFile)
    svgo.optimize(originalSVG).then((optimizedSVG) => fs.writeFile(targetFile, optimizedSVG.data, handleFSError))
  }
  else {
    console.log(`🖼️  ${chalk.white('Copying')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFile)}`)
    fs.copyFile(sourceFile, targetFile, handleFSError)
  }
}

module.exports = {
  processGlobalImages,
  processImage
}
