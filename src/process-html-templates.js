const fs = require('fs')
const path = require('path')
const beautify = require('beautify')
const chalk = require('chalk')
const marked = require('marked')

/**
 * Asynchronously reads and processes templates to create static pages.
 * 
 * @param {String} buildDir root directory where html files will be written 
 * @param {String} pagesDir directory where page templates can be found
 * @param {String} baseURL  base URL where the web site will live
 */

module.exports = function (buildDir, pagesDir, baseURL) {
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
    const imagesBase = '/images/'
    const stylesheetsBase = '/stylesheets/'
    const scriptsBase = '/scripts/'

    console.log(`📄️  ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)

    let source = unbreakMultilineTemplateTags(fs.readFileSync(fileName, 'utf8'))
    source = insertContent(replacePlaceholders(replacePartials(source, { url, imagesBase, baseURL, stylesheetsBase, scriptsBase }), { url, imagesBase, baseURL, stylesheetsBase, scriptsBase }))

    if (!isHomeTemplate(fileName)) {
        fs.mkdirSync(buildDir + '/' + path.basename(fileName, '.html'))
    }

    fs.writeFileSync(targetFileName, cleanHTML(source))
}

/**
 * Replace partials in a web page template.
 * Partial includes are indicated with a <drr-partial> tag with the
 * name of the partial in the "name" attributes.
 * 
 * @param {String} source the web page template
 * @param {Object} variables Variables to use when parsing the template {key:value}
 * @returns String
 */
function replacePartials(source, variables) {
    const PARTIAL_TAG_REGEX = /<drr-partial\W?name="(?<name>[^"]*)"\W?(?<attributes>.+="[^"]+"?)*\W?\/?>(<\/drr-partial>)?/

    let partialTag = null;
    while (partialTag = source.match(PARTIAL_TAG_REGEX)) {
        const replacement = replacePartials(
            replacePlaceholders(
                fs.readFileSync(
                    './partials/www/' + partialTag.groups.name + '.part',
                    'utf8'
                ),
                unionOfObjects(variables, parseAttributeString(
                    partialTag.groups.attributes || ''
                ))
            )
        )
        source = source.replace(PARTIAL_TAG_REGEX, replacement)
    }

    return source;
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
 * Parse a string of attributes in the format a="b"{space}x="y" 
 * 
 * @param {String} attributeString
 * @returns {Object} {key:value} map of attribute names & values
 */
function parseAttributeString(attributeString) {
    let attributes = new Map()
    attributeString.split('" ').forEach((attributeString) => {
        attribute = attributeString.replace(/"$/, '').split('="')
        attributes = attributes.set(attribute[0], attribute[1])
    })

    return Object.fromEntries(attributes)
}

/**
 * Replace variables/placeholders in a web page template.
 * Placeholders use EJS format i.e. ${name}
 * 
 * @param {String} source the web page template
 * @param {Object} placeholders Variables to insert into the template {key:value}
 * @returns String
 */
function replacePlaceholders(source, placeholders) {
    const VARIABLE_REGEX = /\${(?<name>\w+)}/
    let placeholder = null;
    while (placeholder = source.match(VARIABLE_REGEX)) {
        source = source.replace(
            VARIABLE_REGEX,
            placeholders[placeholder.groups.name]
        )
    }
    return source
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

/**
 * Compute the union of two or more objects.
 * 
 * @param  {...Object} objects Objects to union
 * @returns Object map containing the union of the objects passed 
 */
function unionOfObjects(...objects) {
    const retVal = {}
    objects.forEach((settings) => {
        if (settings) {
            Object.keys(settings).forEach((key) => {
                retVal[key] = settings[key]
            })
        }
    })
    return retVal
}

/**
 * Converts template tags that span multiple lines in the template
 * into single lines. The parsing logic can't handle humanly-formatted
 * HTML, and people shouldn't try to manage sprawling lines of HTML.
 * 
 * @param {String} html the page template
 * @returns String 
 */
function unbreakMultilineTemplateTags(html) {
    let state = 'outside'
    let cleanHTML = ''
    html.split('').forEach((char) => {
      switch(char) {
        case '<':
          state = 'inside'
          break
        case '>':
          state = 'outside'
          break
        case "\n":
          if (state === 'inside') {
            char = ' '
            state = 'afternewline'
          }
          else if (state === 'afternewline') {
            char = ''
          }
          break
        case ' ':
          if (state === 'afternewline') {
            char = ''
          }
          break;
        default:
          if(state === 'afternewline') {
            state = 'inside'
          }
      }
      cleanHTML += char
    })
    return cleanHTML
}
