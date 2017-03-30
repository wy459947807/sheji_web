(function(root) {
    var YD = root.YD = {
        API_BASE_URL: null,
        APP_ID: null,
        OPEN_ID: null,
        shareData: null,
        getURLParameter: function(name) {
            var results = (new RegExp("[?&]" + name + "=([^&]*)")).exec(location.search);
            return results ? decodeURIComponent(results[1]) : null;
        },
        getCleanQueryString: function(extra) {
            var querystring = location.search.substring(1);
            var uselessParams = ["code", "state", "from", "isappinstalled"];
            var params = {};
            var paramsArray;

            if (!querystring) return "";

            if (extra) uselessParams = uselessParams.concat(extra);

            querystring.split("&").forEach(function(param) {
                var parts = param.split("=");
                var name = parts[0];
                var value = parts[1];
                if (params && value) params[name] = value;
            });

            uselessParams.forEach(function(name) {
                delete params[name];
            });

            paramsArray = Object.keys(params).map(function(name) {
                return name + "=" + params[name];
            });

            return paramsArray.length ? "?" + paramsArray.join("&") : "";
        },
        setCookie: function(name, value, days) {
            var expires = "";
            var date;

            if (days) {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }

            document.cookie = name + "=" + value + expires + "; path=/";
        },
        getCookie: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";");
            var i;
            var c;

            for (i = 0; i < ca.length; i++) {
                c = ca[i];
                while (c.charAt(0) === " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        removeCookie: function(name) {
            YD.setCookie(name, "", -1);
        },
        init: function(callback, shareData) {
            $.ajaxSetup({
                headers: {
                    "X-KTV-Application-Name": "eec607d1f47c18c9160634fd0954da1a",
                    "X-KTV-Vendor-Name": "1d55af1659424cf94d869e2580a11bf8",
                    "X-KTV-Application-Platform": "1"
                }
            });

            YD.shareData = shareData;

            YD.getBaseInfo(function() {
                if (YD.getCookie("openid")) {
                    YD.OPEN_ID = YD.getCookie("openid");
                    YD.login({
                        type: "wechat",
                        openid: YD.OPEN_ID
                    }, callback);
                } else {
                    YD.oAuth(false, callback);
                }
            });
        },
        getBaseInfo: function(callback) {
            $.getJSON("/app/jsbaseinfo", function(data) {
                YD.API_BASE_URL = location.protocol + "//" + data.jsinfo.domain + "/";
                YD.APP_ID = data.jsinfo.appid;
                if (callback) callback();
            });
        },
        oAuth: function(reload, callback) {
            var code = YD.getURLParameter("code");
            var sessionCode = sessionStorage.getItem("wx_code");
            var redirectUrl = encodeURIComponent(location.href.split("#")[0]);
            redirectUrl = encodeURIComponent("http://app.jingsocial.com/openid/dynamicOauth?wechat=" + redirectUrl);

            if (sessionCode) {
                $.getJSON(YD.API_BASE_URL + "wechat_ktv/Home/WeChat/getopenid?code=" + sessionCode, function(data) {
                    if (data.result === 0) {
                        var origURL = location.pathname + location.search + location.hash;
                        history.replaceState(null, null, "#closeWindow");
                        history.pushState(null, null, origURL);
                        window.addEventListener("hashchange", function() {
                            if (location.hash === "#closeWindow") {
                                YD.closeWindow();
                            }
                        }, false);

                        YD.OPEN_ID = data.openid;
                        YD.login({
                            type: "wechat",
                            openid: data.openid
                        }, callback);
                    } else {
                        sessionStorage.removeItem("wx_code");
                        YD.oAuth(true);
                    }
                });
            } else if (code && !reload) {
                sessionStorage.setItem("wx_code", code);

                location.replace(location.origin + location.pathname + YD.getCleanQueryString());
            } else {
                location.replace("https://open.weixin.qq.com/connect/oAuth2/authorize?appid=" + YD.APP_ID + "&redirect_uri=" + redirectUrl + "&response_type=code&scope=snsapi_base&state=state#wechat_redirect");
            }
        },
        login: function(userdata, callback) {
            $.post(YD.API_BASE_URL + "user/oauthlogin", JSON.stringify(userdata), function(data) {
                $.ajaxSetup({
                    headers: {
                        "X-KTV-User-Token": data.token
                    }
                });
                YD.setCookie("openid", YD.OPEN_ID, 7);
                if (typeof wx !== "undefined") YD.initJssdk();
                if (callback) callback();
            });
        },
        initJssdk: function() {
            $.getJSON(YD.API_BASE_URL + "wechat_ktv/Home/WeChat/getsign?url=" + encodeURIComponent(location.href.split("#")[0]), function(data) {
                wx.config({
                    debug: false,
                    appId: data.sign.appId,
                    timestamp: data.sign.timestamp,
                    nonceStr: data.sign.nonceStr,
                    signature: data.sign.signature,
                    jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ"]
                });
                if (YD.shareData) {
                    wx.ready(function() {
                        wx.onMenuShareTimeline(YD.shareData);
                        wx.onMenuShareAppMessage(YD.shareData);
                        wx.onMenuShareQQ(YD.shareData);
                    });
                }
            });
        },
        closeWindow: function() {
            if (typeof wx !== "undefined") {
                wx.closeWindow();
            } else {
                WeixinJSBridge.invoke("closeWindow");
            }
        }
    };
})(window);
