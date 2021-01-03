const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { replaceGopherPartials, processMarkdown } = require('./utils')
/**
 * Asynchronously reads and processes templates to create gophermaps.
 * 
 * @param {String} buildDir root directory where gophermaps will be written 
 * @param {String} pagesDir directory where page templates can be found
 */
module.exports = function (buildDir, pagesDir) {
    fs.readdir(pagesDir, (err, files) => {
        files.forEach(file => {
            renderGopherPage(pagesDir + '/' + file, buildDir)
        })
    })
}

/**
 * Parses a page template to produce a gophermap.
 * @param {String} fileName path & filename of the template to process
 * @param {String} buildDir root directory where gophermaps will be written  
 */
function renderGopherPage(fileName, buildDir) {
    const targetFileName = (path.basename(fileName) === 'gophermap') ? `${buildDir}/gophermap` : `${buildDir}/${path.basename(fileName)}/gophermap`
    console.log(`🐾  ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)
    const page = fs.readFileSync(fileName, 'utf8')
    const html = replaceGopherPartials(replaceContent(page), {})
    if(path.basename(fileName) !== 'gophermap') {
        fs.mkdirSync(buildDir + '/' + path.basename(fileName))    
    }
    fs.writeFileSync(targetFileName, html)
}

/**
 * Insert content into gopher templates.
 * Content includes are indicated with a ^ at the start of a line followed by
 * the name of the content file.
 *
 * @param {String} source the gopher page template
 * @param {Object} variables Variables to use when parsing the template {key:value}
 * @returns String
 */
function replaceContent(source, variables) {
    const output = source.split('\n').reduce((output, current) => {
        if(current.charAt(0) === '^') {
            const content = fs.readFileSync(`./content/${current.slice(1)}.md`, 'utf8')
            return output += `${processMarkdown(content)}\n`
        }
        else {
            return output += `${current}\n`
        }
    }, '')

    return output
}
