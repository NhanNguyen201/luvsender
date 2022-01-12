const axios = require('axios')
const loveQuoteUrl = "https://api.quotable.io/random?tags=love"

module.exports = async () => {
    const { data } = await axios.get(loveQuoteUrl)
    let quote = `${data.author} said: "${data.content}"`
    return quote
}