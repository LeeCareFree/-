const Point = function(x, y) {
    return { x: x, y: y };
};

/**
 * @description: 画文字
 * @param {*} ctx 画布上下文
 * @param {*} rect 参数对象
 * { //基本格式
 *  fontSize 字体大小
 *  fontColor 字体颜色
 *  text 文本
 *  x,t,width, height//基本属性
 * }
 * @return {*}
 */
export function fontRext(ctx, rect) {
    ctx.save();
    ctx.font = `${rect.fontSize || "14px"} Microsoft YaHei`;
    ctx.fillStyle = rect.fontColor || "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(rect.text, rect.x, rect.y);
    ctx.restore();
}

/**
 * @description: 画圆角
 * @param {*} ctx 画布上下文
 * @param {*} rect
 * {
 * round //圆角大小
 * x,t,width, height//基本属性
 * }
 * @return {*}
 */
export function arcToRect(ctx, rect) {
    var ptA = Point(rect.x + rect.round, rect.y);
    var ptB = Point(rect.x + rect.width, rect.y);
    var ptC = Point(rect.x + rect.width, rect.y + rect.height);
    var ptD = Point(rect.x, rect.y + rect.height);
    var ptE = Point(rect.x, rect.y);
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, rect.round);
    ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, rect.round);
    ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, rect.round);
    ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, rect.round);
    ctx.closePath();
}

/**
 * @description: 画圆角矩形
 * @param {*} ctx  画布上下文
 * @param {*} rect
 * {
 * backgroundColor //背景 fillOrStroke =  fill 必填
 * strokeColor //线颜色 fillOrStroke =  stroke 必填
 * lineWidth //线宽度 fillOrStroke =  stroke 必填
 * x,t,width, height//基本属性
 * }
 * @param {*} fillOrStroke //圆形矩形 填充还是线
 * @return {*}
 */
export function roundRect(ctx, rect, fillOrStroke) {
    ctx.save();
    arcToRect(ctx, rect);
    if (fillOrStroke === "fill") {
        ctx.fillStyle = rect.backgroundColor;
        ctx.fill();
    }

    if (fillOrStroke === "stroke") {
        ctx.strokeStyle = rect.strokeColor || "#000000";
        ctx.lineWidth = rect.lineWidth || "1px";
        ctx.stroke();
    }
    ctx.restore();
}

/**
 * @description: 画矩形
 * @param {*} ctx 画布上下文
 * @param {*} rect 参数
 * {
 * backgroundColor //背景
 * x,t,width, height//基本属性
 * }
 * @return {*}
 */
export function fillRect(ctx, rect) {
    ctx.save();
    ctx.fillStyle = rect.backgroundColor;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fill();
    ctx.restore();
}

/**
 * @description: 绘画边框矩形
 * @param {*} ctx  画布上下文
 * @param {*} rect 参数
 * {
 *   lineWidth //边框线高
 *   strokeColor //边框颜色
 *   x,t,width, height//基本属性
 * }
 * @return {*}
 */
export function strokeRect(ctx, rect) {
    ctx.save();
    ctx.strokeStyle = rect.strokeColor;
    ctx.lineWidth = rect.lineWidth;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.stroke();
    ctx.restore();
}

/**
 * @description: 画图片
 * @param {*} ctx 画布上下文
 * @param {*} rect
 *  {
 *   round //圆角
 *   x,t,width, height//基本属性
 * }
 * @return {*}
 */
export function imageRect(ctx, rect) {
    ctx.save();
    if (rect.round) {
        arcToRect(ctx, rect);
        ctx.clip();
    }
    ctx.drawImage(rect.img, 0, 0, rect.img.width, rect.img.height, rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
}

/**
 * @description: 绘画布生成图片
 * @param {*} option
 * {
 * array // 画布数据
 * width // 画布宽
 * height // 画布高
 * }
 * @param {*} self this
 * @return {*}
 */
export function createCanvasInit(option, self) {
    const dpr = wx.getSystemInfoSync().pixelRatio;
    return new Promise((resolve, reject) => {
        let canvas, ctx, imageLength;
        try {
            //绘画视图矩形
            function drawView(rect) {
                if (rect.border) {
                    const border = rect.border.split(" ");
                    rect.lineWidth = border[0] || 1;
                    rect.strokeColor = border[1] || "#000000";
                }

                if (rect.backgroundColor) {
                    return rect.round ? roundRect(ctx, rect, "fill") : fillRect(ctx, rect);
                }

                if (rect.border) {
                    return rect.round ? roundRect(ctx, rect, "stroke") : strokeRect(ctx, rect);
                }
            }

            //绘画文本
            function drawText(rect) {
                const newRect = JSON.parse(JSON.stringify(rect));
                let textWidth = 0; //累计宽度
                let substringIndex = 0; //截取位置

                for (let index = 0; index < rect.text.length; index++) {
                    const element = rect.text[index];

                    // 获取字体实际高度
                    textWidth += element.charCodeAt(0) > 255 ? parseInt(rect.fontSize) : Math.ceil(ctx.measureText(element).width);
                    //ctx.measureText(element).width
                    // textWidth += 14;
                    // 字体累计宽度大于文字宽度
                    if (textWidth > (rect.width || option.width)) {
                        //画截取字段
                        newRect.text = rect.text.substring(substringIndex, index);
                        fontRext(ctx, newRect);

                        //设置开始下标 和 枢轴 y
                        substringIndex = index;
                        textWidth = 0;
                        //计算得出每行间距
                        const lineHeight = parseInt(newRect.lineHeight || newRect.fontSize) - parseInt(newRect.fontSize);
                        newRect.y = newRect.y + parseInt(newRect.fontSize) + lineHeight;
                    }

                    //绘画剩余部分
                    if (index === rect.text.length - 1) {
                        newRect.text = rect.text.substring(substringIndex, index + 1);
                        fontRext(ctx, newRect);
                    }
                }
            }

            //画图像
            function drawImgs(rect) {
                let poster = canvas.createImage(); // 创建一个图片对象
                poster.src = rect.img;
                poster.onload = function() {
                    // 监听图片加载完成
                    rect.img = poster;
                    imageRect(ctx, rect);

                    //判断图片是否绘画完成
                    imageLength = imageLength - 1;
                    if (imageLength === 0) {
                        wx.canvasToTempFilePath({
                            canvas: canvas,
                            fileType: "jpg",
                            success(res) {
                                resolve(res.tempFilePath);
                            },
                            fail(err) {
                                reject(err);
                            }
                        });
                    }
                };
            }

            //获取节点
            const query = wx.createSelectorQuery().in(self);
            query
                .select(option.id)
                .fields({ node: true, size: true, context: true })
                .exec((res) => {
                    canvas = res[0].node;
                    ctx = canvas.getContext("2d");

                    canvas.width = option.width * dpr;
                    canvas.height = option.height * dpr;
                    ctx.scale(dpr, dpr);
                    fillRect(ctx, {
                        x: 0,
                        y: 0,
                        width: option.width,
                        height: option.height,
                        backgroundColor: "#fff"
                    });

                    //判断数据渲染
                    if (option.array instanceof Array && option.array.length) {
                        //获取需要打印图片的数量
                        imageLength = option.array.filter((item) => item.type === "image").length;

                        option.array.forEach((item) => {
                            switch (item.type) {
                                case "view":
                                    drawView(item);
                                    break;
                                case "text":
                                    drawText(item);
                                    break;
                                case "image":
                                    drawImgs(item);
                                    break;
                            }
                        });
                    }
                });
        } catch (err) {
            reject(err);
        }
    });
}