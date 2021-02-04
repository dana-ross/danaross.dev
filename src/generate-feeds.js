// @ts-check
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { handleFSError, getBuildTimestamp, filterMap, renderBlogPost } = require("./utils");
const { BLOG_CONTENT_DIRECTORY } = require('./paths')

module.exports = (baseURL, buildDir, urlRegistry) => {
  const blogPosts = filterMap(urlRegistry, ([k,v]) => k.startsWith(BLOG_CONTENT_DIRECTORY));

  fs.mkdirSync(path.resolve(buildDir, "blog", 'feed'), {recursive: true});

  generateRSS(baseURL, buildDir, blogPosts);
}

function generateRSS(baseURL, buildDir, blogPosts) {
  console.log(
    `📄️  ${chalk.white("Generating")} ${chalk.blue(
      path.basename(buildDir) + "/blog/feed/rss.xml"
    )}`
  );

  const feedFile = fs.openSync(path.resolve(buildDir, "blog", "feed", "rss.xml"), "w");
  fs.writeSync(feedFile,`<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
   <title>Dana Ross Blog</title>
   <description>Dana Ross's Blog: Engineering Leader, Experienced Full-Stack Developer, Certified Accessibility Pro.</description>
   <link>https://danaross.dev/blog/</link>
   <atom:link href="${baseURL + 'blog/feed/rss.xml'}" rel="self" type="application/rss+xml" />
   <copyright>2020 Dana Ross All rights reserved</copyright>
   <lastBuildDate>${(new Date(getBuildTimestamp())).toUTCString()}</lastBuildDate>`);

  blogPosts.forEach((url, sourceFile) => {
    const variables = {
      url: url,
      baseURL,
    };
    
    const content = renderBlogPost('<drr-postcontent />', path.dirname(sourceFile), path.basename(sourceFile), baseURL, variables);
    fs.writeSync(feedFile, `
   <item>
    <title>${path.basename(sourceFile, path.extname(sourceFile))}</title>
    <description><![CDATA[${content}]]></description>
    <link>${url}</link>
    <guid isPermaLink="false">${url}</guid>
    <pubDate>${new Date(Date.parse(path.basename(path.dirname(sourceFile)))).toUTCString()}</pubDate>
   </item>`);
  });

   fs.writeSync(feedFile, `
  </channel>
  </rss>`);
  fs.close(feedFile, handleFSError);

}