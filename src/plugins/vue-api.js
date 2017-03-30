import utils from "../libs/utils";

function install(Vue) {
    let api = {
        get(url, data, cacheable) {
            if (cacheable) {
                let cached = getCache("get", url, data);
                if (cached) return Vue.Promise.resolve(cached, context);
            }
            return request("get", url, data, cacheable);
        },
        post(url, data, cacheable) {
            if (cacheable) {
                let cached = getCache("post", url, data);
                if (cached) return Vue.Promise.resolve(cached, context);
            }
            return request("post", url, data, cacheable);
        },
        oAuthLogin(data) {
            return request("post", "api/wechat/oauthlogin", data)
                .then(function (data) {
                    Vue.http.headers.common["X-KTV-User-Token"] = data.token;
                    return data;
                }, function (data) {
                    throw new Error(data.msg || "登录失败");
                });
        },
        getUserInfo(preferLocal) {
            if (preferLocal && Object.keys(Vue.prototype.$user).length > 0) {
                return Vue.Promise.resolve(Vue.prototype.$user, context);
            }
            return request("get", "api/user/info").then(function(data) {
                Vue.prototype.$user = data;
                if (data.lat != -1 && data.lng != -1) {
                    sessionStorage.setItem("location", JSON.stringify({
                        lat: data.lat,
                        lng: data.lng
                    }));
                }
                return data;
            });
        },
        updateUserInfo(data) {
            return request("post", "api/user/info", data);
        },
        sendCode(mobile) {
            if (!utils.isMobile(mobile)) {
                alert("请输入手机号");
                return Vue.Promise.reject("请输入手机号", context);
            }
            return request("post", "user/sendcode", {
                mobile: mobile
            }).then(function(data) {
                alert(data.msg);
            }, function(data) {
                alert(data.msg || "发送失败");
            });
        },
        verifyCode(mobile, code) {
            return request("post", "user/phoneverify", {
                mobile: mobile,
                verifycode: code
            });
        },
        wechatPay(orderId) {
            return new Vue.Promise(function(resolve, reject) {
                if (window.isWXReady) {
                    request("post", "wechat_ktv/Pay/Index/payapi", {
                        openid: this.$user.openid,
                        trade_no: orderId
                    }).then(function(data) {
                        let params = data.signinfo.jsApiParameters;

                        wx.chooseWXPay({
                            appId: params.appId,
                            timestamp: params.timeStamp,
                            nonceStr: params.nonceStr,
                            package: params.package,
                            signType: params.signType,
                            paySign: params.paySign,
                            success: resolve,
                            fail: res => reject({msg: "支付失败"}),
                            cancel: res => reject({msg: "支付取消"})
                        });
                    }, reject);
                } else {
                    reject({msg: "支付失败：未加载微信 JSSDK" });
                }
            }, context);
        },
        addPoints(type) {
            return request("post", "user/addpointsbyshare", { type });
        }
    };

    let cacheStore = {};
    let context;

    if (process.env.NODE_ENV !== "production") window.__apiCache = cacheStore;

    function getCacheId(method, url, params) {
        return method + ":" + url + (params ? Object.keys(params).reduce((prev, curr) => prev + curr + "=" + params[curr] + "&", "?") : "");
    }

    function setCache(method, url, params, data) {
        let id = getCacheId(method, url, params);

        return cacheStore[id] = data;
    }

    function getCache(method, url, params) {
        let id = getCacheId(method, url, params);

        return cacheStore.hasOwnProperty(id) ? cacheStore[id] : false;
    }

    function request(method, url, params, cacheable) {
        return new Vue.Promise(function(resolve, reject) {
            Vue.http[method](url, method === "get" ? {params: params} : params).then(function(response) {
                let data = response.data;

                if (typeof data === "string") {
                    try {
                        data = JSON.parse(response.data);
                    } catch (err) {
                        reject({
                            msg: "response data is not valid JSON"
                        });
                        return false;
                    }
                }

                if (data.result === 0) {
                    if (cacheable) setCache(method, url, params, data);
                    resolve(data);
                } else if (data.result === 450) {
                    data.list = [];
                    data.total = 0;
                    if (cacheable) setCache(method, url, params, data);
                    resolve(data);
                } else {
                    reject(data);
                }
            }, function(response) {
                reject(response);
            });
        }, context);
    }

    Object.defineProperties(Vue, {
        api: {
            get: function() {
                context = this;
                return api;
            }
        }
    });

    Object.defineProperties(Vue.prototype, {
        $api: {
            get: function() {
                context = this;
                return api;
            }
        }
    });
}

module.exports = install;
