const fs = require('fs');
const { processGlobalImages } = require('./process-images')
const processHTMLTemplates = require('./process-html-templates')
const processScripts = require('./process-scripts')
const processStylesheets = require('./process-stylesheets')
const processGopherTemplates = require('./process-gopher-templates')
const processBlogWWW = require('./process-blog')
const processBlogGopher = require('./process-gopher-blog')
const generateSitemap = require('./generate-sitemap')
const generateFeeds = require('./generate-feeds')

const urlRegistry = new Map()

const BASE_URL = 'https://danaross.dev/'
const BUILD_DIR = './build'
const BUILD_WWW_DIR = BUILD_DIR + '/www'
const PAGES_WWW_DIR = './pages/www'
const SCRIPTS_DIR = './assets/scripts'

const STYLES_DIR = './assets/stylesheets'
const BUILD_GOPHER_DIR = BUILD_DIR + '/gopher'
const PAGES_GOPHER_DIR = './pages/gopher'

fs.rmdirSync(BUILD_DIR, { recursive: true })
fs.mkdirSync(BUILD_WWW_DIR, { recursive: true })
fs.mkdirSync(BUILD_GOPHER_DIR, { recursive: true})

Promise.all([
    processGlobalImages(BUILD_WWW_DIR),
    processHTMLTemplates(BUILD_WWW_DIR, PAGES_WWW_DIR, BASE_URL, urlRegistry),
    processScripts(BUILD_WWW_DIR, SCRIPTS_DIR),
    processStylesheets(BUILD_WWW_DIR, STYLES_DIR),

    processGopherTemplates(BUILD_GOPHER_DIR, PAGES_GOPHER_DIR),

    processBlogWWW(BUILD_WWW_DIR, BASE_URL, urlRegistry),
    processBlogGopher(BUILD_GOPHER_DIR)
]).then((_) => {
    generateSitemap(BUILD_WWW_DIR, urlRegistry)
    generateFeeds(BASE_URL, BUILD_WWW_DIR, urlRegistry)
}).catch((err) => console.log(err))
