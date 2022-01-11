const setSafeHeader = (req, res, next) => {
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    next()
}

module.exports = setSafeHeader;