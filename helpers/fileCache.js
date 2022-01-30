const NodeCache = require('node-cache')
const fs = require('fs')

const mycache = new NodeCache({stdTTL: 50, checkperiod: 300})

module.exports = {
    hasFile: key => mycache.has(key),
    getFile: key => mycache.get(key),
    setFile: (key, fileName) => mycache.set(key, { file: fileName })
}
