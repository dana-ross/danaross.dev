const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const marked = require('marked')
const {decode} = require('html-entities')

module.exports = function (buildDir, pagesDir) {
    fs.readdir(pagesDir, (err, files) => {
        files.forEach(file => {
            renderGopherPage(pagesDir + '/' + file, buildDir)
        })
    })
}

function renderGopherPage(fileName, buildDir) {
    const targetFileName = (path.basename(fileName) === 'gophermap') ? `${buildDir}/gophermap` : `${buildDir}/${path.basename(fileName)}/gophermap`
    console.log(`🐾   ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)
    const page = fs.readFileSync(fileName, 'utf8')
    const html = replacePartials(replaceContent(page), {})
    if(path.basename(fileName) !== 'gophermap') {
        fs.mkdirSync(buildDir + '/' + path.basename(fileName))    
    }
    fs.writeFileSync(targetFileName, html)
}

function replacePartials(source, variables) {
    const output = source.split('\n').reduce((output, current) => {
        if(current.charAt(0) === '@') {
            const partial = replacePartials(fs.readFileSync(`./partials/gopher/${current.slice(1)}.part`, 'utf8'))
            return output += `${partial}\n`
        }
        else {
            return output += `${current}\n`
        }
    }, '')

    return output
}

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

function processMarkdown(markdown) {
    console.log(marked(markdown))
    markdown = decode(marked(markdown)
        .replace(/<br>/g, '\n')
        .replace(/\n<ul>\n/, '')
        .replace(/<h2/g, '## <h2')
        .replace(/<h3/g, '### <h3')
        .replace(/<li/g, '* <li')
        .replace(/<\/(p|h2)>/g, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .replace(/\*\s*\n/g, '')
        .replace(/(\n\s*\n\s*[\n\s]+)/g, '\n\n')
        )
    return markdown
}

/**
 * 
 * @param {} input
 * @see https://stackoverflow.com/a/1912522 
 */
function htmlDecode(input){
    var e = document.createElement('textarea');
    e.innerHTML = input;
    // handle case of empty input
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
  }