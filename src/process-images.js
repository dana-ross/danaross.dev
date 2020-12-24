const fs = require('fs')
const chalk = require('chalk')
const SVGO = require('svgo')

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
    removeAttrs: { attrs: '(stroke|fill|krita.+)' },
  }]
});

module.exports = function (buildDir) {
  fs.mkdirSync(buildDir + '/images')

  // Copy images
  fs.readdirSync('./images').forEach(file => {
    const sourceFile = './images/' + file
    const targetFile = buildDir + '/images/' + file
    console.log(`🖼️  ${chalk.white('Processing')} ${chalk.blue(file)} → ${chalk.yellow(targetFile)}`)
    const originalSVG = fs.readFileSync(sourceFile)
    svgo.optimize(originalSVG).then((optimizedSVG) => fs.writeFileSync(targetFile, optimizedSVG.data))
  })
}
