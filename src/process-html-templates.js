const fs = require('fs')
const path = require('path')
const beautify = require('beautify');
const chalk = require('chalk')

module.exports = function (buildDir, pagesDir) {
    // Process WWW templates
    fs.readdir(pagesDir, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) == '.html') {
                renderHTMLPage(pagesDir + '/' + file, buildDir)
            }
        })
    })
}
function renderHTMLPage(fileName, buildDir) {

    const targetFileName = isHomeTemplate(fileName) ?
        buildDir + '/index.html' :
        buildDir + '/' + path.basename(fileName, '.html') + '/index.html'

    console.log(`📄️  ${chalk.white('Processing')} ${chalk.blue(fileName)} → ${chalk.yellow(targetFileName)}`)

    let source = fs.readFileSync(fileName, 'utf8')
    source = replacePlaceholders(replacePartials(source), { url: 'http://example.com' })

    if (!isHomeTemplate(fileName)) {
        fs.mkdirSync(buildDir + '/' + path.basename(fileName, '.html'))
    }

    fs.writeFileSync(targetFileName, cleanHTML(source))
}

function replacePartials(source) {
    const PARTIAL_TAG_REGEX = /<drr-partial\W?name="(?<name>[^"]*)"\W?(?<attributes>.+="[^"]+"?)*\W?\/?>(<\/drr-partial>)?/

    let partialTag = null;
    while (partialTag = source.match(PARTIAL_TAG_REGEX)) {
        const replacement = replacePartials(
            replacePlaceholders(
                fs.readFileSync(
                    './partials/' + partialTag.groups.name + '.part',
                    'utf8'
                ),
                parseAttributeString(
                    partialTag.groups.attributes || ''
                )
            )
        )
        source = source.replace(PARTIAL_TAG_REGEX, replacement)
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