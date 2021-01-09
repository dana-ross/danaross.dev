const fs = require("fs");
const path = require("path");

module.exports = (buildDir, urlRegistry) => {
  console.log(path.resolve(buildDir, "sitemap.xml"));
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
  fs.close(sitemapFile);
};
