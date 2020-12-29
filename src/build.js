const fs = require('fs')
const processImages = require('./process-images')
const processHTMLTemplates = require('./process-html-templates')
const processScripts = require('./process-scripts')
const processStylesheets = require('./process-stylesheets')

const BASE_URL = 'https://danaross.dev/'
const BUILD_DIR = './build/www'
const PAGES_DIR = './pages/www'
const SCRIPTS_DIR = './assets/scripts'
const STYLES_DIR = './assets/stylesheets'

// Re-create the build directory
fs.rmdirSync(BUILD_DIR, { recursive: true })
fs.mkdirSync(BUILD_DIR, { recursive: true })

processImages(BUILD_DIR)
processHTMLTemplates(BUILD_DIR, PAGES_DIR, BASE_URL)
processScripts(BUILD_DIR, SCRIPTS_DIR)
processStylesheets(BUILD_DIR, STYLES_DIR)