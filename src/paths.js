const path = require('path')

const paths = {
    stylesheetsBase: '/stylesheets/',
    scriptsBase: '/scripts/',
    emojiBase: '/emoji/merged/',
    imagesBase: '/images/',
    BLOG_DIR: './blog',
    ogimage: 'https://danaross.dev/images/dana_sweater.jpg',
}

paths.BLOG_CONTENT_DIRECTORY = path.resolve(paths.BLOG_DIR, "content");

module.exports = paths;