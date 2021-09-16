function getByteLen(val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
        var a = val.charAt(i);
        if (a.match(/[^\x00-\xff]/ig) != null) { //\x00-\xff→GBK双字节编码范围
            len += 2;
        } else {
            len += 1;
        }
    }
    return len / 2;
}
module.exports = getByteLen