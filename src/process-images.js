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
 * @param {String} buildDir 
 */
async function processGlobalImages(buildDir) {
  fs.mkdirSync(buildDir + '/images')

  // Copy images
  fs.readdir('./images', (err, files) => {
    files.forEach((file) => {
      const sourceFile = './images/' + file
      const targetFile = buildDir + '/images/' + file
      processImage(sourceFile, targetFile);
    })
  })
}

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
