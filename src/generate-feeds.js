// @ts-check
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { handleFSError, getBuildTimestamp, filterMap } = require("./utils");
const { BLOG_DIR } = require('./paths')

module.exports = (baseURL, buildDir, urlRegistry) => {
  const blogContentDirectory = path.resolve(BLOG_DIR, "content");
  const blogPosts = filterMap(urlRegistry, ([k,v]) => k.startsWith(blogContentDirectory));

  fs.mkdirSync(path.resolve(buildDir, 'feed', 'rss'), {recursive: true});
  // fs.mkdirSync(path.resolve(buildDir, 'feed', 'atom'), {recursive: true});

  generateRSS(baseURL, buildDir, blogPosts);
  // generateAtom(baseURL, buildDir, blogPosts);
}

function generateRSS(baseURL, buildDir, blogPosts) {
  console.log(
    `📄️  ${chalk.white("Generating")} ${chalk.blue(
      path.basename(buildDir) + "/feed/rss/index.html"
    )}`
  );

  const feedFile = fs.openSync(path.resolve(buildDir, "feed", "rss", "index.html"), "w");
  fs.writeSync(feedFile,`<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
   <title>Dana Ross Blog</title>
   <description>Dana Ross's Blog: Engineering Leader, Experienced Full-Stack Developer, Certified Accessibility Pro.</description>
   <link>https://danaross.dev/blog/</link>
   <atom:link href="${baseURL + 'feed/rss'}" rel="self" type="application/rss+xml" />
   <copyright>2020 Dana Ross All rights reserved</copyright>
   <lastBuildDate>${(new Date(getBuildTimestamp())).toUTCString()}</lastBuildDate>
   <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
   <ttl>1800</ttl>`);

  blogPosts.forEach((url, sourceFile) => {
    const content = fs.readFileSync(sourceFile);
    fs.writeSync(feedFile, `
   <item>
    <title>Example entry</title>
    <description><![CDATA[${content}]]></description>
    <link>${url}</link>
    <guid isPermaLink="false">${url}</guid>
    <pubDate>Sun, 06 Sep 2009 16:20:00 +0000</pubDate>
   </item>`);
  });


   fs.writeSync(feedFile, `
  </channel>
  </rss>`);
  fs.close(feedFile, handleFSError);

}

function generateAtom(baseURL, buildDir, urlRegistry, isBlogUrl) {
  console.log(
    `📄️  ${chalk.white("Generating")} ${chalk.blue(
      path.basename(buildDir) + "/feed/atom/index.html"
    )}`
  );

  const feedFile = fs.openSync(path.resolve(buildDir, "feed", "atom", "index.html"), "w");

  fs.close(feedFile, handleFSError);

}

  
  // fs.writeSync(sitemapFile, '<?xml version="1.0" encoding="UTF-8"?>\n');
  // fs.writeSync(
  //   sitemapFile,
  //   '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  // );

  // urlRegistry.forEach((value, key) => {
  //   fs.writeSync(sitemapFile, `<url><loc>${value}</loc></url>\n`);
  // });
  // fs.writeSync(sitemapFile, "</urlset>");
