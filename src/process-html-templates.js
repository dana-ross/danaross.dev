const fs = require('fs')
const path = require('path')
const beautify = require('beautify')
const chalk = require('chalk')
const marked = require('marked')

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

function parseAttributeString(attributeString) {
    let attributes = new Map()
    attributeString.split('" ').forEach((attributeString) => {
        attribute = attributeString.replace(/"$/, '').split('="')
        attributes = attributes.set(attribute[0], attribute[1])
    })

    return Object.fromEntries(attributes)
}

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

function cleanHTML(source) {
    return beautify(source, { format: 'html' }).replace(/\n\W*\n/g, "\n")
}

function isHomeTemplate(fileName) {
    return (path.basename(fileName, '.html') == 'index')
}

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
