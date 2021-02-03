const fs = require("fs");
const path = require("path");
const parseAttributeString = require("parse-attributes");
const marked = require("marked");
const { decode } = require("html-entities");
const wrap = require("word-wrap");
const twemoji = require("twemoji");
const { emojiBase } = require("./paths")

/**
 * Replace variables/placeholders in a web page template.
 * Placeholders use EJS format i.e. ${name}
 *
 * @param {String} source the web page template
 * @param {Object} placeholders Variables to insert into the template {key:value}
 * @returns String
 */
function replacePlaceholders(source, placeholders) {
  const VARIABLE_REGEX = /\${(?<name>\w+)}/;
  let placeholder = null;
  while ((placeholder = source.match(VARIABLE_REGEX))) {
    source = source.replace(
      VARIABLE_REGEX,
      placeholders[placeholder.groups.name]
    );
  }
  return source;
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
  const PARTIAL_TAG_REGEX = /<drr-partial\s*name="(?<name>[^"]*)"\s*(?<attributes>(\w+="[^"]*"\s*)*)\s*\/?>/;

  let partialTag = null;
  while ((partialTag = source.match(PARTIAL_TAG_REGEX))) {
    const replacement = replacePartials(
      replacePlaceholders(
        fs.readFileSync(
          "./partials/www/" + partialTag.groups.name + ".part",
          "utf8"
        ),
        unionOfObjects(
          variables,
          parseAttributeString(partialTag.groups.attributes || "")
        )
      )
    );
    source = source.replace(PARTIAL_TAG_REGEX, replacement);
  }

  return source;
}

/**
 * Inline SVG <img>s in a web page template.
 *
 * @param {String} source the web page template
 * @parmam {Function} logFunction function that takes a string with a filename and logs it
 * @returns String
 */
function inlineSVGs(source, logFunction = undefined) {
  const SVG_TAG_REGEX = /<img\s*(?<attributes1>[a-zA-Z0-9]+="[^"]*"[^\/>]*)*src="(?<src>[^"]*.svg)"\s*(?<attributes2>[a-zA-Z0-9]+="[^"]*"[^\/>]*)*[^\/>]*\/?>/;

  let svgTag = null;
  while ((svgTag = source.match(SVG_TAG_REGEX))) {
    const attributes = unionOfObjects(
      parseAttributeString(svgTag.groups.attributes1 || ""),
      parseAttributeString(svgTag.groups.attributes2 || "")
    );

    if(logFunction && typeof logFunction === "function") {
      logFunction(svgTag.groups.src);
    }

    const sourcePath = path.resolve(svgTag.groups.src.replace(/^\//, ''));
    let replacement = fs.readFileSync(
      sourcePath,
      "utf8"
    );

    replacement = replacement.replace('>', ` role="img" aria-label="${attributes.alt || ""}">`);
    Object.keys(attributes).forEach((key) => {
      if(key !== "alt") {
        replacement = replacement.replace('>', ` ${key}="${attributes[key]}">`)
      }
    });
    source = source.replace(SVG_TAG_REGEX, replacement);
  }

  return source;
}

/**
 * Convert emoji to <svg>s.
 *
 * @param {String} source the web page template
 * @returns String
 */
function emojiToSVG(source) {

  const newSource = twemoji.parse(
      source,
      {
        folder: emojiBase.replace(/\/$/, ''),
        ext: '.svg',
        base: ''
      }
  );
  

  return newSource;
}

/**
 * Replace partials in a gopher page template.
 * Partial includes are indicated with an @ at the start of a line followed by
 * the name of the partial.
 *
 * @param {String} source the gopher page template
 * @param {Object} variables Variables to use when parsing the template {key:value}
 * @returns String
 */
function replaceGopherPartials(source, variables) {
  const output = source.split("\n").reduce((output, current) => {
    if (current.charAt(0) === "@") {
      const partial = replacePartials(
        fs.readFileSync(`./partials/gopher/${current.slice(1)}.part`, "utf8")
      );
      return (output += `${partial}\n`);
    } else {
      return (output += `${current}\n`);
    }
  }, "");

  return output;
}

/**
 * Compute the union of two or more objects.
 *
 * @param  {...Object} objects Objects to union
 * @returns Object map containing the union of the objects passed
 */
function unionOfObjects(...objects) {
  const retVal = {};
  objects.forEach((settings) => {
    if (settings) {
      Object.keys(settings).forEach((key) => {
        retVal[key] = settings[key];
      });
    }
  });
  return retVal;
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
  let state = "outside";
  let cleanHTML = "";
  html.split("").forEach((char) => {
    switch (char) {
      case "<":
        state = "inside";
        break;
      case ">":
        state = "outside";
        break;
      case "\n":
        if (state === "inside") {
          char = " ";
          state = "afternewline";
        } else if (state === "afternewline") {
          char = "";
        }
        break;
      case " ":
        if (state === "afternewline") {
          char = "";
        }
        break;
      default:
        if (state === "afternewline") {
          state = "inside";
        }
    }
    cleanHTML += char;
  });
  return cleanHTML;
}

/**
 * Sort a Map so its keys are in order
 *
 * @param {Map} map The Map to sort
 * @param {boolean} reverse If true, results are sorted ascending
 * @returns Map The Map sorted by key
 */
function sortMap(map, reverse = false) {
  return Array.from(map.keys())
    .sort((a, b) => (reverse ? b - a : a - b))
    .reduce((sortedMap, key) => {
      sortedMap.set(key, map.get(key));
      return sortedMap;
    }, new Map());
}

/**
 * Parses markdown into a format appropriate to gopher
 *
 * @param {String} markdown Markdown source for content
 * @returns String
 */
function processMarkdown(markdown) {
  markdown = wrap(
    decode(
      marked(markdown)
        .replace(/<br>/g, "\n")
        .replace(/\n<ul>\n/, "")
        .replace(/<h2/g, "## <h2")
        .replace(/<h3/g, "### <h3")
        .replace(/<li/g, "* <li")
        .replace(/<\/(p|h2)>/g, "\n")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\*\s*\n/g, "")
        .replace(/(\n\s*\n\s*[\n\s]+)/g, "\n\n")
    ),
    { width: 70, indent: "" }
  );
  return markdown;
}

/**
 * Convert a post title to something that looks at home in a URL
 *
 * @param {String} title
 * @returns String
 */
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s/g, "-");
}

/**
 * Standard error handler for async fs functions
 * @param {Object|null} err 
 */
function handleFSError(err) {
  if (err) {
    console.log(err);
  }
}

/**
 * Change straight quotes to curly and double hyphens to em-dashes.
 * @see https://gist.github.com/drdrang/705071 which uses regexes
 * @param {String} a Text to typeset
 * @return Text with Unicode characters substituted for quotes & em-dashes 
 */
function typeset(a) {
  let inTag = false;
  let index = 0;
  const whitespace = [' ', "\t", "\n", "\r"];

  while (index < a.length) {
    if (inTag) {
      if (a[index] === '>') {
        inTag = false;
      }
    }
    else {
      if (a[index] === '<') {
        inTag = true;
      }
      else if (a[index] === '-' && a[index + 1] === '-') {
        a = `${a.slice(0, index)}—${a.slice(index + 2)}`;
        index += 1;
      }
      else if (a[index] === '"') {
        if (whitespace.includes(a[index + 1])) {
          // closing quote
          a = `${a.slice(0, index)}”${a.slice(index + 1)}`
        }
        else {
          // opening quote
          a = `${a.slice(0, index)}“${a.slice(index + 1)}`
        }
      }
      else if (a[index] === "'") {
        a = `${a.slice(0, index)}’${a.slice(index + 1)}`
      }
    }

    index += 1;
  }

  return a

};

const getBuildTimestamp = (function() {
  const buildTimestamp = Date.now();
  return () => buildTimestamp;
}())

module.exports = {
  replacePlaceholders,
  replacePartials,
  replaceGopherPartials,
  unionOfObjects,
  parseAttributeString,
  unbreakMultilineTemplateTags,
  sortMap,
  processMarkdown,
  titleToSlug,
  handleFSError,
  typeset,
  getBuildTimestamp,
  inlineSVGs,
  emojiToSVG
};
