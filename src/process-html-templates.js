const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const marked = require('marked')
const { replacePlaceholders, replacePartials, unbreakMultilineTemplateTags, handleFSError, typeset, getBuildTimestamp, inlineSVGs, emojiToSVG } = require('./utils')
const { scriptsBase, stylesheetsBase, imagesBase, ogimage } = require('./paths')


/**
 * Asynchronously reads and processes templates to create static pages.
 * 
 * @param {String} buildDir root directory where html files will be written 
 * @param {String} pagesDir directory where page templates can be found
 * @param {String} baseURL  base URL where the web site will live
 * @param {Map}    urlRegistry 
 */
async function processHTMLTemplates(buildDir, pagesDir, baseURL, urlRegistry) {
  // Process WWW templates
  console.log("PROCESSING " + pagesDir)
  const files = fs.readdirSync(pagesDir, { withFileTypes: true });
  files.forEach((file) => {
    if (file.isDirectory()) {
      fs.mkdirSync(path.resolve(buildDir, file.name));
      processHTMLTemplates(buildDir + '/' + file.name, pagesDir + '/' + file.name, baseURL, urlRegistry);
    } else if (path.extname(file.name) == ".html") {
      renderHTMLPage(
        pagesDir + "/" + file.name,
        buildDir,
        baseURL,
        urlRegistry
      );
    } else if ([".txt", ""].includes(path.extname(file.name))) {
      fs.copyFile(
        path.resolve(pagesDir, file.name),
        path.resolve(buildDir, file.name),
        handleFSError
      );
    }
  });
}

module.exports = processHTMLTemplates

/**
 * Parses a page template to produce a static html document.
 * @param {String} fileName path & filename of the template to process
 * @param {String} buildDir root directory where gophermaps will be written
 * @param {String} baseURL  base URL where the web site will live
 * @param {Map}    urlRegistry
 */
function renderHTMLPage(fileName, buildDir, baseURL, urlRegistry) {

    const targetFileName = isHomeTemplate(fileName) ?
        buildDir + '/index.html' :
        buildDir + '/' + path.basename(fileName, '.html') + '/index.html'

    const url = baseURL + (isHomeTemplate(fileName) ? '' : path.basename(fileName, '.html') + '/')
    urlRegistry.set(path.resolve(targetFileName), url)

    console.log(`📄️  ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)

    let source = unbreakMultilineTemplateTags(fs.readFileSync(fileName, 'utf8'))

    const variables = { url, imagesBase, baseURL, stylesheetsBase, scriptsBase, ogimage, buildTimestamp: getBuildTimestamp() }
    source = inlineSVGs(emojiToSVG(replacePlaceholders(replacePartials(insertContent(source),
        variables),
        variables)),
        (svgFilename) => { console.log(`✏️   ${chalk.white('Inlining')} ${chalk.blue(svgFilename)}`) })

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
        const replacement =  marked(typeset(
            fs.readFileSync('./content/' + contentTag.groups.name + '.md', 'utf8'),
            { baseURL }
        ))
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
    return source.replace(/\n\s*\n/g, "\n");
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
