module.exports = function (buffer) {
    const Duplex = require('stream').Duplex;
    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
}