const internal = require('./internal')

// holds paths to the main site
// (and is not tracked by git)
const external = require('./external')

module.exports = { ...internal, ...external }
