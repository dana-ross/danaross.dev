const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const chalk = require("chalk");
const { format } = require("date-fns");
const {
  replacePlaceholders,
  replacePartials,
  unbreakMultilineTemplateTags,
  sortMap,
  titleToSlug,
  handleFSError,
  typeset,
  inlineSVGs,
  getBuildTimestamp,
  renderBlogPost,
} = require("./utils");
const {
  scriptsBase,
  stylesheetsBase,
  imagesBase,
  BLOG_DIR,
  ogimage,
} = require("./paths");
const { processImage } = require("./process-images");

/**
 * Asynchronously reads and processes templates to create static pages.
 *
 * @param {String} buildDir root directory where html files will be written
 * @param {String} baseURL  base URL where the blog will live
 */
module.exports = async function (buildDir, baseURL, urlRegistry) {
  const blogTemplateDir = path.resolve(BLOG_DIR, "www");
  const blogContentDirectory = path.resolve(BLOG_DIR, "content");

  const blogPostTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "post.html"), "utf8")
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
          const postTitle = path.basename(potentialBlogPost, ".md");
          const postTimestamp = format(
            Date.parse(path.basename(contentPath)),
            "LLLL do, yyyy h:mm bbb"
          );
          const postSlug = titleToSlug(postTitle);
          const postURLPath = `/blog/${postSlug}/`;
          const postURL = `${baseURL}blog/${postSlug}/`;
          const postSummary = fs.existsSync(
            path.resolve(contentPath, "summary.txt")
          )
            ? fs.readFileSync(path.resolve(contentPath, "summary.txt"), "utf8")
            : "";

          urlRegistry.set(
            path.resolve(contentPath, potentialBlogPost),
            postURL
          );
          blogIndexData.set(Date.parse(path.basename(contentPath)), {
            postTitle,
            postURL,
            postURLPath,
            postTimestamp,
            postSummary: marked(typeset(postSummary)),
          });

          processBlogPost(
            blogPostTemplate,
            buildDir,
            contentPath,
            potentialBlogPost,
            baseURL,
            postTitle,
            postTimestamp,
            postSlug,
            postURL,
            postSummary
          );
        }
      });
    }
  });

  const blogIndexTemplate = unbreakMultilineTemplateTags(
    fs.readFileSync(path.resolve(blogTemplateDir, "blog.html"), "utf8")
  );

  // Render the index page
  console.log(
    `📄️  ${chalk.white("Processing")} ${chalk.blue(
      path.basename(blogTemplateDir) + "/blog.html"
    )} → ${chalk.yellow(buildDir + "/blog/index.html")}`
  );

  const variables = {
    baseURL,
    imagesBase,
    stylesheetsBase,
    scriptsBase,
    url: baseURL + "blog",
    ogimage,
    buildTimestamp: getBuildTimestamp(),
  };

  fs.writeFile(
    path.resolve(buildDir, "blog", "index.html"),
    inlineSVGs(
      replacePlaceholders(
        replacePartials(
          insertBlogIndex(blogIndexTemplate, blogIndexData),
          variables
        ),
        variables
      )
    ),
    handleFSError
  );
};

function insertBlogIndex(source, blogIndexData) {
  const BLOG_INDEX_TAG_REGEX = /<drr-blogindex[^>]*>(.*)<\/drr-blogindex>/;
  source = source.replace(/\n/g, "").replace(/>\s+</g, "><");
  const matches = source.match(BLOG_INDEX_TAG_REGEX);
  if (matches) {
    const blogIndexTemplate = matches[1];
    let replacement = "";
    sortMap(blogIndexData, true).forEach((value) => {
      replacement += replacePlaceholders(blogIndexTemplate, value);
    });
    source = source.replace(BLOG_INDEX_TAG_REGEX, replacement);
  }

  return source;
}

function processBlogPost(
  blogPostTemplate,
  buildDir,
  contentPath,
  potentialBlogPost,
  baseURL,
  postTitle,
  postTimestamp,
  postSlug,
  postURL,
  postSummary
) {
  console.log(
    `📄️  ${chalk.white("Processing")} ${chalk.blue(
      path.basename(contentPath) + "/" + potentialBlogPost
    )} → ${chalk.yellow(buildDir + "/blog/" + postSlug + "/index.html")}`
  );

  fs.mkdirSync(path.resolve(buildDir, "blog", postSlug), { recursive: true });

  const variables = {
    url: postURL,
    baseURL,
    postTitle,
    postTimestamp,
    postSummary,
    ogimage,
  };

  const html = renderBlogPost(
    blogPostTemplate,
    contentPath,
    potentialBlogPost,
    baseURL,
    variables
  );

  fs.writeFile(
    path.resolve(buildDir, "blog", postSlug, "index.html"),
    html,
    handleFSError
  );

  const dirEntries = fs.readdirSync(contentPath);
  dirEntries.forEach((dirEntry) => {
    if ([".jpg", ".png", ".gif", ".webp"].includes(path.extname(dirEntry))) {
      processImage(
        path.resolve(contentPath, dirEntry),
        path.resolve(buildDir, "blog", postSlug, dirEntry)
      );
    }
  });
}
