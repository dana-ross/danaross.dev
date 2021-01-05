const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { format } = require("date-fns");
const {
  replacePlaceholders,
  replaceGopherPartials,
  unbreakMultilineTemplateTags,
  sortMap,
  processMarkdown,
  titleToSlug
} = require("./utils");
const {
  BLOG_DIR,
} = require("./paths");

/**
 * Asynchronously reads and processes templates to create static pages.
 *
 * @param {String} buildDir root directory where html files will be written
 * @param {String} baseURL  base URL where the blog will live
 */
module.exports = function (buildDir) {
  const blogTemplateDir = path.resolve(BLOG_DIR, "gopher");
  const blogContentDirectory = path.resolve(BLOG_DIR, "content");

  const blogPostTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "post.gophermap"), "utf8")
  );

  const blogIndexData = new Map();

  fs.mkdirSync(path.resolve(buildDir, "blog"), { recursive: true });
  // Process blog entries
  const dirEntries = fs.readdirSync(blogContentDirectory);
  dirEntries.forEach((dirEntry) => {
    const contentPath = path.resolve(blogContentDirectory, dirEntry);
    if (fs.statSync(contentPath).isDirectory()) {
      const potentialBlogPosts = fs.readdirSync(contentPath);
      potentialBlogPosts.forEach((potentialBlogPost) => {
        if (path.extname(potentialBlogPost) === ".md") {
          const postTitle = path.basename(potentialBlogPost, ".md").toUpperCase();
          const postTimestamp = format(
            Date.parse(path.basename(contentPath)),
            "LLLL do, yyyy h:mm bbb"
          );
          const postSlug = titleToSlug(postTitle);
          const postSummary = fs.existsSync(
            path.resolve(contentPath, "summary.txt")
          )
            ? processMarkdown(
                fs.readFileSync(
                  path.resolve(contentPath, "summary.txt"),
                  "utf8"
                )
              )
            : "";
          blogIndexData.set(Date.parse(path.basename(contentPath)), {
            postTitle,
            postTimestamp,
            postSlug,
            postSummary,
          });

          processBlogPost(
            blogPostTemplate,
            buildDir,
            contentPath,
            potentialBlogPost,
            postTitle,
            postTimestamp,
            postSlug
          );
        }
      });
    }
  });

  const blogIndexTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "blog.gophermap"), "utf8")
  );

  // Render the index page
  console.log(
    `📄️  ${chalk.white("Processing")} ${chalk.blue(
      path.basename(blogTemplateDir) + "/blog.gophermap"
    )} → ${chalk.yellow(buildDir + "/blog/gophermap")}`
  );

  fs.writeFile(
    path.resolve(buildDir, "blog", "gophermap"),
    replaceGopherPartials(insertBlogIndex(blogIndexTemplate, blogIndexData), {}),
    (err) => (err ? console.log(err) : "")
  );
};

function insertBlogIndex(source, blogIndexData) {
  const BLOG_INDEX_TAG_REGEX = />8\n([\w\s\n{}$]*)>8/;
  const matches = source.match(BLOG_INDEX_TAG_REGEX);
  if (matches) {
    const blogIndexTemplate = matches[1];
    let replacement = "";
    sortMap(blogIndexData, true).forEach((value) => {
      replacement += replacePlaceholders(blogIndexTemplate, value);
    });
    source = source.replace(BLOG_INDEX_TAG_REGEX, replacement).replace(/\n>8\n/, '');
  }

  return source;
}

function processBlogPost(
  blogPostTemplate,
  buildDir,
  contentPath,
  potentialBlogPost,
  postTitle,
  postTimestamp,
  postSlug
) {
  console.log(
    `📄️  ${chalk.white("Processing")} ${chalk.blue(
      path.basename(contentPath) + "/" + potentialBlogPost
    )} → ${chalk.yellow(buildDir + "/blog/" + postSlug + '/gophermap')}`
  );

  fs.mkdirSync(path.resolve(buildDir, "blog", postSlug), { recursive: true });

  const variables = {
    postTitle,
    postTimestamp,
    postSlug
  };

  const gophermap = replaceGopherPartials(
    replacePlaceholders(
      insertContent(blogPostTemplate, contentPath, potentialBlogPost),
      variables
    ),
    variables
  );

  fs.writeFileSync(
    path.resolve(buildDir, "blog", postSlug, "gophermap"),
    gophermap
  );
}

function insertContent(source, contentPath, fileName) {
  const CONTENT_TAG_REGEX = /(\n%)/;
  const filePath = path.resolve(contentPath, fileName)
  if ((contentTag = source.match(CONTENT_TAG_REGEX))) {
    const replacement = processMarkdown(
      fs.readFileSync(filePath, "utf8"),
      {}
    );
    source = source.replace(CONTENT_TAG_REGEX, replacement);
  }

  return source;
}