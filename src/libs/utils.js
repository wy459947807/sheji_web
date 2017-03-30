import pinyin from "./pinyin";
import Vue from "vue";

var utils = exports;

/**
 * 获取用户坐标
 * @param {function} [onSuccess] 获取成功的回调函数
 * @param {function} [onError] 获取失败的回调函数
 * @param {function} [onComplete] 无论成功或失败都会执行该函数
 */
utils.getLocation = (function() {
    var retryTimes = 0,
        sessionData = sessionStorage.getItem("location"),
        cachedData = sessionData ? JSON.parse(sessionData) : null;

    return function(onSuccess, onError, onComplete) {
        if (onSuccess === true) {
            return cachedData;
        }

        function geoSuccess(coords, source) {
            console.info(coords, source);
            cachedData = coords;
            sessionStorage.setItem("location", JSON.stringify(coords));
            if (onSuccess) onSuccess(coords);
            if (onComplete) onComplete(coords);
        }

        function geoError(error) {
            if (error) {
                retryTimes++;
                console.info(error);
            }
            if (onError) onError(error);
            if (onComplete) onComplete();
        }

        if (cachedData) {
            geoSuccess(cachedData, "cache");
        } else if (retryTimes > 1) {
            geoError("tired");
        } else if (typeof wx !== "undefined") {
            wx.ready(function() {
                wx.getLocation({
                    type: "gcj02",
                    success: function(res) {
                        geoSuccess({
                            lat: res.latitude,
                            lng: res.longitude
                        }, "wxApi");
                    },
                    fail: res => geoError(res.errMsg),
                    cancel: res => geoError(res.errMsg)
                });
            });
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function({coords}) {
                geoSuccess({
                    lat: coords.latitude,
                    lng: coords.longitude
                }, "geolocation");
            }, err => geoError(err.message), {
                enableHighAccuracy: true,
                timeout: 5e3,
                maximumAge: 60e3
            });
        } else {
            geoError();
        }
    };
})();

/**
 * 角度转弧度
 * @param {number} deg 角度
 * @return {number} 弧度
 */
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * 计算 2 个经纬度坐标之间的距离
 * @param {number} lat1 坐标1纬度
 * @param {number} lon1 坐标1经度
 * @param {number} [lat2] 坐标2纬度
 * @param {number} [lon2] 坐标2经度
 * @return {number} 距离（米）
 */
utils.getDistance = function(lat1, lon1, lat2, lon2) {
    const R = 6371;
    if (!lat2) {
        var userLocation = utils.getLocation(true);
        if (userLocation) {
            lat2 = userLocation.lat;
            lon2 = userLocation.lng;
        }
    }
    if (!lat2) return null;
    var deltaLat = deg2rad(lat2 - lat1);
    var deltaLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1);
};

/**
 * 计算 KTV 排序权重
 * @param {object} ktv KTV 信息
 * @param {string} best 权重最高的项目
 * @return {number} 权重
 */
utils.calcWeight = function(ktv, best) {
    if (best == "smart") best = "distance";

    let weight = 0;
    let bestDist = (best || "distance") == "distance";

    // 距离
    let distance = ktv.distance * 1000;
    weight += distance <= 500 ? 5 : distance <= 1000 ? 4 : distance <= 2000 ? 3 : distance <= 3000 ? 2 : 1;
    weight *= bestDist ? 1e3 : 100;

    // 评分
    weight += ktv[bestDist ? "rate" : best] * (bestDist ? 100 : 1e3);

    // 首字母
    let firstLetter = ktv.xktvname.charAt(0);
    let isAlphabet = firstLetter.charCodeAt(0) <= 122;
    weight += (25 - ((isAlphabet ? firstLetter : pinyin.getFirstLetter(firstLetter)).charCodeAt(0) - 96)) * (isAlphabet ? 2 : 1);

    return weight;
};

/**
 * 获取图片左上角颜色
 * @param {string|element} image 图片地址或图像元素
 * @param {function} callback 回调函数
 */
utils.getImageColor = (function() {
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        cache = {},
        data;

    canvas.width = canvas.height = 1;

    return function(image, callback) {
        var imgSrc = image.src || image;

        if (cache[imgSrc]) return callback(cache[imgSrc], imgSrc);

        var img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0);
            data = ctx.getImageData(0, 0, 1, 1).data;
            cache[imgSrc] = data;
            callback(data, imgSrc);
        };
        img.onerror = function() {
            callback();
        };
        img.crossOrigin = "Anonymous";
        img.src = imgSrc;
    };
})();

/**
 * 函数节流
 * @param {function} func 原始函数
 * @param {number} wait 时间间隔
 * @param {object} [options]
 * @param {boolean} options.leading 设置为 false, 禁用开始边界上的调用
 * @param {boolean} options.trailing 设置为 false, 禁用结尾边界上的调用
 * @return {function}
 */
utils.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        var now = Date.now();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

/**
 * 函数去抖
 * @param {function} func 原始函数
 * @param {number} wait 时间间隔
 * @param {boolean} [immediate] 执行于开始边界
 * @return {function}
 */
utils.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            }
        }
    };

    return function() {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

/**
 * 判断是否是手机号
 * @param {string} number 待验证字符串
 * @return {boolean}
 */
utils.isMobile = function(number) {
    return /^1\d{10}$/.test(number);
};

/**
 * 判断是否是验证码
 * @param {string} code 待验证字符串
 * @return {boolean}
 */
utils.isCaptcha = function(code) {
    return code.length >= 4;
};

/**
 * 转义 BackgroundImage URL 中的特殊字符
 * @param {string} url 图片地址
 * @return {string}
 */
utils.encodeBackgroundImageUrl = function(url) {
    return url.replace(" ", "%20").replace("(", "\\(").replace(")", "\\)");
};

/**
 * 获取当前页面 URL 中的指定参数值
 * @param {string} name 参数名
 * @return {?string} 参数值
 */
utils.getURLParameter = function(name) {
    var results = (new RegExp("[?&]" + name + "=([^&]*)")).exec(location.search);
    return results ? decodeURIComponent(results[1]) : null;
};

/**
 * 日期格式化
 * @param {string} format 格式
 * @param {date} date 日期实例
 * @return {string} 格式化后的文本
 */
utils.parseDate = function(format, date) {
    if (!(date instanceof Date)) return;
    var o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

/**
 * 计算 2 个时间点的时间差
 * @param {string} start 较早的时间
 * @param {string} end 较晚的时间
 * @param {boolean} [sameDay] 强制认为是同一天
 * @return {number} 时间差（小时）
 */
utils.diffTime = function(start, end, sameDay) {
    var [startHour, startMinute] = start.split(":").map(n => parseInt(n));
    var [endHour, endMinute] = end.split(":").map(n => parseInt(n));

    var startDate = new Date(2000, 0, 1, startHour, startMinute);
    var endDate = new Date(2000, 0, 1, endHour, endMinute);

    if (!sameDay && endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }

    return (endDate - startDate) / 36e5;
};

/**
 * 判断时间是否早于另一个时间
 * @param {string} time
 * @param {string} anotherTime
 * @return {boolean}
 */
utils.isBeforeTime = function(time, anotherTime) {
    return parseInt(time.replace(":", "")) < parseInt(anotherTime.replace(":", ""));
};

/**
 * 返回最小的时间
 * @param {string} time
 * @param {string} anotherTime
 * @return {boolean}
 */
utils.minTime = function(time, anotherTime) {
    return utils.isBeforeTime(time, anotherTime) ? time : anotherTime;
};

/**
 * 返回最大的时间
 * @param {string} time
 * @param {string} anotherTime
 * @return {boolean}
 */
utils.maxTime = function(time, anotherTime) {
    return utils.isBeforeTime(time, anotherTime) ? anotherTime : time;
};

/**
 * 判断时间是否在时间段内
 * @param {string} time
 * @param {string} starttime
 * @param {string} endtime
 * @param {boolean} [equal]
 * @return {boolean}
 */
utils.isBetweenTime = function(time, starttime, endtime, equal) {
    if (equal && (starttime == time || endtime == time)) {
        return true;
    }

    if (utils.isBeforeTime(starttime, endtime)) {
        return utils.isBeforeTime(starttime, time) && utils.isBeforeTime(time, endtime);
    } else {
        return !(utils.isBeforeTime(endtime, time) && utils.isBeforeTime(time, starttime));
    }
};

/**
 * 调整时间
 * @param {string} time
 * @param {string} [hours=0]
 * @param {string} [minutes=0]
 * @return {[string]}
 */
utils.adjustTime = function(time, hours, minutes) {
    let date = new Date();
    let [hour, minute] = time.split(":").map(n => parseInt(n));

    hours = hours || 0;
    minutes = minutes || 0;

    date.setHours(hour, minute);
    date.setTime(date.getTime() + hours * 36e5 + minutes * 6e4);

    return utils.parseDate("hh:mm", date);
};

/**
 * 填充前导零
 * @param {number} n 数字
 * @return {string|number}
 */
utils.padZero = function(n) {
    return n < 10 ? "0" + n : n;
};

/**
 * 加载 CSS
 * @param {string} src 地址
 * @param {function} [callback] 加载成功回调函数
 */
utils.loadCSS = function(src, callback) {
    var sheets = document.styleSheets;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = src;
    link.media = "only x";

    function checkCssStatus() {
        for (var i = 0; i < sheets.length; i++) {
            if (sheets[i].href === link.href) {
                if (callback) callback();
                link.media = "all";
                return false;
            }
        }
        setTimeout(checkCssStatus, 10);
    };

    document.head.appendChild(link);

    setTimeout(checkCssStatus, 10);

    return link;
};

/**
 * 加载 JS
 * @param {string} src 地址
 * @param {function} [callback] 加载成功回调函数
 */
utils.loadJS = function(src, callback) {
    var script = document.createElement("script");
    script.src = src;
    script.async = true;
    if (callback) script.onload = callback;
    document.head.appendChild(script);

    return script;
};

/**
 * 根据坐标反查城市
 * @param {object} coords 经纬度坐标
 * @param {number} coords.lat 纬度
 * @param {number} coords.lng 经度
 * @param {object} context 上下文对象
 * @return {promise} 返回 Promise 对象
 */
utils.reverseGeocodeLocation = function(coords, context) {
    return new Vue.Promise(function(resolve, reject) {
        if (!coords) return reject(new Error("missing parameter"));

        Vue.http.jsonp("http://apis.map.qq.com/ws/geocoder/v1/", {
            params: {
                key: "4QMBZ-YW5AR-AAZWF-WXXP2-QWJ3V-3DFGN",
                location: coords.lat + "," + coords.lng,
                get_poi: 0,
                output: "jsonp"
            }
        }).then(function({
            data
        }) {
            if (data.status === 0 && data.result.ad_info.adcode) {
                resolve({
                    name: data.result.ad_info.city,
                    code: data.result.ad_info.adcode
                });
            } else {
                throw new Error(data.message);
            }
        }).catch(function(err) {
            reject(err);
        });
    }, context);
}

/**
 * 保存 Cookie
 * @param {string} name 名称
 * @param {string} value 值
 * @param {?number} days 保存天数
 */
utils.setCookie = function(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

/**
 * 获取 Cookie
 * @param {string} cname 名称
 * @return {string|null} 值
 */
utils.getCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

/**
 * 删除 Cookie
 * @param {string} cname 名称
 */
utils.removeCookie = function(name) {
    utils.setCookie(name, "", -1);
}