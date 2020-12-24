const fs = require('fs')
const processImages = require('./process-images')
const processHTMLTemplates = require('./process-html-templates')
const processScripts = require('./process-scripts')

const BUILD_DIR = './build/www'
const PAGES_DIR = './pages/www'
const SCRIPTS_DIR = './assets/scripts'

// Re-create the build directory
fs.rmdirSync(BUILD_DIR, { recursive: true })
fs.mkdirSync(BUILD_DIR, { recursive: true })

processImages(BUILD_DIR)
processHTMLTemplates(BUILD_DIR, PAGES_DIR)
processScripts(BUILD_DIR, SCRIPTS_DIR)