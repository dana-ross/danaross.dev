const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { handleFSError } = require("./utils");

module.exports = (buildDir, urlRegistry) => {
  console.log(
    `📄️  ${chalk.white("Generating")} ${chalk.blue(
      path.basename(buildDir) + "/sitemap.xml"
    )}`
  );

  const sitemapFile = fs.openSync(path.resolve(buildDir, "sitemap.xml"), "w");
  fs.writeSync(sitemapFile, '<?xml version="1.0" encoding="UTF-8"?>\n');
  fs.writeSync(
    sitemapFile,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  );

  urlRegistry.forEach((value, key) => {
    fs.writeSync(sitemapFile, `<url><loc>${value}</loc></url>\n`);
  });
  fs.writeSync(sitemapFile, "</urlset>");
  fs.close(sitemapFile, handleFSError);
};
