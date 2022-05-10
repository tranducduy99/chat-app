const generateMessage = (text, username) => {
    return {
        username,
        text,
        createAt: new Date().getTime()  
    }
}
module.exports = {
    generateMessage
}