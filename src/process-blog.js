const fs = require("fs");
const path = require("path");
const marked = require("marked");
const chalk = require("chalk");
const { format } = require("date-fns");
const {
  replacePlaceholders,
  replacePartials,
  unbreakMultilineTemplateTags,
} = require("./utils");
const {
  scriptsBase,
  stylesheetsBase,
  imagesBase,
  BLOG_DIR,
} = require("./paths");

/**
 * Asynchronously reads and processes templates to create static pages.
 *
 * @param {String} buildDir root directory where html files will be written
 * @param {String} baseURL  base URL where the blog will live
 */
module.exports = function (buildDir, baseURL) {
  const blogTemplateDir = path.resolve(BLOG_DIR, "www");
  const blogContentDirectory = path.resolve(BLOG_DIR, "content");

  const blogIndexTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "blog.html"), "utf8")
  );
  const blogPostTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "post.html"), "utf8")
  );

  fs.mkdirSync(path.resolve(buildDir, "blog"), { recursive: true });
  // Process blog entries
  fs.readdir(blogContentDirectory, (err, dirEntries) => {
    dirEntries.forEach((dirEntry) => {
      const contentPath = path.resolve(BLOG_DIR, "content", dirEntry);
      if (fs.statSync(contentPath).isDirectory()) {
        fs.readdir(contentPath, (err, potentialBlogPosts) => {
          potentialBlogPosts.forEach((potentialBlogPost) => {
            if (path.extname(potentialBlogPost) === ".md") {
              processBlogPost(
                blogPostTemplate,
                buildDir,
                contentPath,
                potentialBlogPost,
                baseURL
              );
            }
          });
        });
      }
    });
  });
};

function processBlogPost(
  blogPostTemplate,
  buildDir,
  contentPath,
  potentialBlogPost,
  baseURL
) {
  const postTitle = path.basename(potentialBlogPost, ".md");
  const postTimestamp = format(Date.parse(path.basename(contentPath)), 'LLLL do, yyyy h:mm bbb')
  const postSlug = titleToSlug(postTitle);
  const url = `${baseURL}/blog/${postSlug}`;

  console.log(
    `📄️  ${chalk.white("Processing")} ${chalk.blue(
      path.basename(contentPath) + "/" + potentialBlogPost
    )} → ${chalk.yellow(buildDir + "/blog/" + postSlug + "/index.html")}`
  );

  fs.mkdirSync(path.resolve(buildDir, "blog", postSlug), { recursive: true });

  const variables = {
    url,
    baseURL,
    stylesheetsBase,
    scriptsBase,
    imagesBase,
    postTitle,
    postTimestamp,
  };

  const html = replacePartials(
    replacePlaceholders(
      insertContent(blogPostTemplate, contentPath, potentialBlogPost, baseURL),
      variables
    ),
    variables
  );

  fs.writeFileSync(
    path.resolve(buildDir, "blog", postSlug, "index.html"),
    html
  );
}

function insertContent(source, contentPath, potentialBlogPost, baseURL) {
  const CONTENT_TAG_REGEX = /<drr-postcontent[^>]+>(<\/drr-content>)?/;

  if ((contentTag = source.match(CONTENT_TAG_REGEX))) {
    const replacement = marked(
      fs.readFileSync(path.resolve(contentPath, potentialBlogPost), "utf8"),
      { baseURL }
    );
    source = source.replace(CONTENT_TAG_REGEX, replacement);
  }

  return source;
}

function titleToSlug(title) {
  return title.toLowerCase().replace(/\s/g, "-");
}
