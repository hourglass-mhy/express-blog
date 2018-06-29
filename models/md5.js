const crypto = require('crypto'); //nodejs的加密模块

/**
 * md5加密
 * @param plaintext 明文
 * @returns {*} ciphertext 密文
 */
module.exports = function (plaintext) {
    const md5 = crypto.createHash('md5');
    var ciphertext = md5.update(plaintext).digest('base64');
    return ciphertext;
}
