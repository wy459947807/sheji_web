import Vue from "vue";
import utils from "./utils";
import store from "./store";

require("../img/logo.png");

function getCleanQueryString(extra) {
    let querystring = location.search.substring(1);

    if (!querystring) return "";

    let uselessParams = ["code", "state", "from", "isappinstalled"];
    let params = {};
    let paramsArray;

    if (extra) uselessParams = uselessParams.concat(extra);

    querystring.split("&").forEach(function(param) {
        let [name, value] = param.split("=");
        if (params && value) params[name] = value;
    });

    uselessParams.forEach(function (name) {
        delete params[name];
    });

    paramsArray = Object.keys(params).map(function(name) {
        return name + "=" + params[name];
    });

    return paramsArray.length ? "?" + paramsArray.join("&") : "";
};

function wx_init(success, error) {
    let urlCode = utils.getURLParameter("code");
    let sessionCode = sessionStorage.getItem("wx_code");

    if (sessionCode) {
       
        wx_userinfo(sessionCode, success, error);
    } else if (urlCode) {
        sessionStorage.setItem("wx_code", urlCode);
        let targetUrl = utils.getURLParameter("target_url");
        
        location.replace(location.origin + location.pathname + (getCleanQueryString("target_url") || "?") + (targetUrl ? "#!" + targetUrl : ""));
    } else {
        wx_authorize();
    }
}

function wx_authorize() {
    let qs = getCleanQueryString();
    let redirectUrl = location.origin + location.pathname + qs + location.hash.replace("#!", (qs ? "&" : "?") + "target_url=");
     
    redirectUrl = "http://sheji.imwork.net/api/wechat/dynamicoauth?wechat=" + encodeURIComponent(redirectUrl);
    location.replace("https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + store.jsinfo.appid + "&redirect_uri=" + encodeURIComponent(redirectUrl) + "&response_type=code&scope=snsapi_userinfo&state=state#wechat_redirect");
}

function wx_userinfo(code, success, error) {
    $.getJSON(store.jsinfo.domain + "api/wechat/getopenid?code=" + code, function(data) {
        if (data.result === 0) {
            utils.setCookie("openid", data.openid, 7);
            success(data);
        } else {
            sessionStorage.removeItem("wx_code");
            wx_authorize();
        }
    });
}

function wx_jssdk() {
    $.getJSON(store.jsinfo.domain + "api/wechat/getsign?url=" + encodeURIComponent(location.href.split("#")[0]), function(data) {
        if (data.status === 1) {
            wx.config({
                debug: false,
                appId: data.sign.appId,
                timestamp: data.sign.timestamp,
                nonceStr: data.sign.nonceStr,
                signature: data.sign.signature,
                jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareWeibo", "onMenuShareQZone", "getLocation", "openLocation", "scanQRCode", "closeWindow", "chooseWXPay"]
            });

            wx.ready(function() {
                window.isWXReady = true;

                wx.onMenuShareTimeline(shareDataTL);
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareQQ(shareData);
                wx.onMenuShareQZone(shareData);
            });

            wx.error(function(res) {
                window.isWXReady = false;
                window.wxErrorMsg = res.errMsg;
            });
        } else {
            alert(data.msg);
        }
    });
}

window.defaultShareData = {
    title: "标题！",
    desc: "描述！",
    titleTL: "标题！",
    link: location.href.replace("?fromTabBar=1", ""),
    imgUrl: location.origin + location.pathname + "/assets/img/logo.png",
    success: function(res) { 
        Vue.trackEvent("wxShare", res.errMsg.split(":")[0], location.hash.substring(2));
        if (window.shareData.successCallback) window.shareData.successCallback();
    }
};

window.shareData = Object.assign({}, window.defaultShareData);
window.shareDataTL = Object.assign({}, window.defaultShareData, { title: window.defaultShareData.titleTL });

module.exports = {
    authenticate: wx_init,
    init_jssdk: wx_jssdk
};
