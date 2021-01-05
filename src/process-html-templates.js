const fs = require('fs')
const path = require('path')
const beautify = require('beautify')
const chalk = require('chalk')
const marked = require('marked')
const { replacePlaceholders, replacePartials, unbreakMultilineTemplateTags, handleFSError } = require('./utils')
const { scriptsBase, stylesheetsBase, imagesBase } = require('./paths')


/**
 * Asynchronously reads and processes templates to create static pages.
 * 
 * @param {String} buildDir root directory where html files will be written 
 * @param {String} pagesDir directory where page templates can be found
 * @param {String} baseURL  base URL where the web site will live
 */
module.exports = async function (buildDir, pagesDir, baseURL) {
    // Process WWW templates
    fs.readdir(pagesDir, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) == '.html') {
                renderHTMLPage(pagesDir + '/' + file, buildDir, baseURL)
            }
        })
    })
}

/**
 * Parses a page template to produce a static html document.
 * @param {String} fileName path & filename of the template to process
 * @param {String} buildDir root directory where gophermaps will be written
 * @param {String} baseURL  base URL where the web site will live
 */
function renderHTMLPage(fileName, buildDir, baseURL) {

    const targetFileName = isHomeTemplate(fileName) ?
        buildDir + '/index.html' :
        buildDir + '/' + path.basename(fileName, '.html') + '/index.html'

    const url = baseURL + (isHomeTemplate(fileName) ? '' : path.basename(fileName, '.html') + '/')

    console.log(`📄️  ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)

    let source = unbreakMultilineTemplateTags(fs.readFileSync(fileName, 'utf8'))
    source = insertContent(replacePlaceholders(replacePartials(source, { url, imagesBase, baseURL, stylesheetsBase, scriptsBase }), { url, imagesBase, baseURL, stylesheetsBase, scriptsBase }))

    if (!isHomeTemplate(fileName)) {
        fs.mkdirSync(buildDir + '/' + path.basename(fileName, '.html'))
    }

    fs.writeFile(targetFileName, cleanHTML(source), handleFSError)
}

/**
 * Insert content into web page templates.
 * Content includes are indicated with a <drr-content> tag with the
 * name of the content file in the "name" attribute.
 *
 * @param {String} source the web page template
 * @param {Object} baseURL base URL where the web site will live
 * @returns String
 */
function insertContent(source, baseURL) {
    const CONTENT_TAG_REGEX = /<drr-content\W?name="(?<name>[^"]*)"\W?(?<attributes>.+="[^"]+"?)*\W?\/?>(<\/drr-content>)?/

    let contentTag = null;
    while (contentTag = source.match(CONTENT_TAG_REGEX)) {
        const replacement =  marked(
            fs.readFileSync('./content/' + contentTag.groups.name + '.md', 'utf8'),
            { baseURL }
        )
        source = source.replace(CONTENT_TAG_REGEX, replacement)
    }

    return source;
}

/**
 * Improves the appearance of the generated HTML markup.
 * 
 * @param {String} source the rendered web page template
 * @returns String
 */
function cleanHTML(source) {
    return beautify(source, { format: 'html' }).replace(/\n\W*\n/g, "\n")
}

/**
 * Determine if the template represents the home page (index.html)
 * 
 * @param {String} fileName file name of the page template
 * @returns boolean 
 */
function isHomeTemplate(fileName) {
    return (path.basename(fileName, '.html') == 'index')
}
