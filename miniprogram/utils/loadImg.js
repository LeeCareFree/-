// img promise
function loadImg(canvas, src) {
    return new Promise((resolve, reject) => {
        let img = canvas.createImage()
        img.src = src;
        img.onload = () => {
            resolve(img);
        };
        img.onerror = (e) => {
            reject(e);
        };
    });
}
module.exports = loadImg