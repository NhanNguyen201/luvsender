const NodeCache = require('node-cache')

const mycache = new NodeCache({stdTTL: 50, checkperiod: 300})

module.exports = {
    getFile: key => mycache.get(key),
    hasFile: key => mycache.has(key),
    setFile: (key, fileName) => mycache.set(key, { file: fileName })
}
