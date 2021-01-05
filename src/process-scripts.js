const uglifyJS = require('uglify-js')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

/**
 * Process JavaScript files, minifying them and copying them into
 * the build directory.
 * 
 * @param {String} buildDir 
 * @param {String} stylesDir 
 */
module.exports = function (buildDir, scriptsDir) {
    fs.mkdirSync(buildDir + '/scripts')
    fs.readdir(scriptsDir, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) == '.js') {
                const targetFile = buildDir + '/scripts/' + path.basename(file, '.js') + '.min.js'
                console.log(`🤖️  ${chalk.white('Optimizing')} ${chalk.blue(file)} → ${chalk.yellow(targetFile)}`)
                var minifiedJS = uglifyJS.minify(fs.readFileSync(scriptsDir + '/' + file, "utf8"), {
                    compress: {
                        dead_code: true,
                        global_defs: {
                            DEBUG: false
                        }
                    }
                })
                fs.writeFile(targetFile, minifiedJS.code, (err) => (err ? console.log(err) : ""))
            }
        })
    })
}