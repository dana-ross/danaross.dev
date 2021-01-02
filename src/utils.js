const fs = require('fs')

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
 * Replace partials in a web page template.
 * Partial includes are indicated with a <drr-partial> tag with the
 * name of the partial in the "name" attributes.
 * 
 * @param {String} source the web page template
 * @param {Object} variables Variables to use when parsing the template {key:value}
 * @returns String
 */
function replacePartials(source, variables) {
    const PARTIAL_TAG_REGEX = /<drr-partial\s*name="(?<name>[^"]*)"\s*(?<attributes>[^">]+="[^">]+"\s*)*\s*\/?>(?:<\/drr-partial>)?/

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

/**
 * Sort a Map so its keys are in order
 * @param {Map} map
 * @returns Map 
 */
function sortMap(map) {
  return Array.from(map.keys()).reduce((sortedMap, key) => {
    sortedMap.set(key, map.get(key))
    return sortedMap
  }, new Map())
}

module.exports = {
    replacePlaceholders,
    replacePartials,
    unionOfObjects,
    parseAttributeString,
    unbreakMultilineTemplateTags,
    sortMap
}