const uglifyCSS = require('uglifycss')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * Process CSS stylesheets, minifying them and copying them into
 * the build directory.
 * 
 * @param {String} buildDir 
 * @param {String} stylesDir 
 */
module.exports = function (buildDir, stylesDir) {
    fs.mkdirSync(buildDir + '/stylesheets')
    fs.readdir(stylesDir, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) == '.css') {
                const targetFile = buildDir + '/stylesheets/' + path.basename(file, '.css') + '.min.css'
                console.log(`🎨️  ${chalk.white('Optimizing')} ${chalk.blue(file)} → ${chalk.yellow(targetFile)}`)
                var minifiedCSS = uglifyCSS.processString(fs.readFileSync(stylesDir + '/' + file, "utf8"), {
                })
                fs.writeFile(targetFile, minifiedCSS, (err) => (err ? console.log(err) : ""))
            }
        })
    })
}