var colors = require('colors/safe');

colors.setTheme({
    info: 'green',
    help: 'cyan',
    data: 'gray',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function getDate()
{
    var date = new Date().
        toISOString().
        replace(/T/, ' ').
        replace(/\..+/, '');

    return date;
}

function logger(msg,level)
{
    var time = getDate();
    switch (level) {
        case 'green':
        case 'info':
            console.log(colors.info("[" + time +"] :"+ msg+""));
            break;
        case 'cyna':
        case 'help':
            console.log(colors.help("[" + time +"] :"+ msg+""));
            break;
        case 'gray':
        case 'data':
            console.log(colors.data("[" + time +"] :"+ msg+""));
            break;
        case 'yellow':
        case 'warn':
            console.log(colors.warn("[" + time +"] :"+ msg+""));
            break;
        case 'blue':
        case 'debug':
            console.log(colors.debug("[" + time +"] :"+ msg+""));
            break;
        case 'red':
        case 'error':
            console.log(colors.red("[" + time +"] :"+ msg+""));
            break;
        default:
            console.log(colors.info("[" + time +"] :"+ msg+""));
            break;
    }
}

module.exports = logger;
