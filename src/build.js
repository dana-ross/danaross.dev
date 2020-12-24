const processImages = require('./process-images')
const processHTMLTemplates = require('./process-html-templates')

const BUILD_DIR = './build/www'
const PAGES_DIR = './pages/www'

fs.rmdir(BUILD_DIR, { recursive: true })
fs.mkdirSync(BUILD_DIR, {recursive: true})

processImages(BUILD_DIR)
processHTMLTemplates(BUILD_DIR, PAGES_DIR)