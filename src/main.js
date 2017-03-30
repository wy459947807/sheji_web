import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource";
import VueApi from "./plugins/vue-api";
import VueUser from "./plugins/vue-user";
import VueStats from "./plugins/vue-stats";
import VueWeChat from "./plugins/vue-wechat";
import VuewHelper from "./plugins/vue-helper";
import filters from "./filters";
import directives from "./directives";
import wechat from "./libs/wechat";
import store from "./libs/store";
import utils from "./libs/utils";

Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(VueApi);
Vue.use(VueUser);
Vue.use(VuewHelper);

Vue.http.headers.common["X-XYWH-Application-Name"] = "eec607d1f47c18c9160634fd0954da1a";
Vue.http.headers.common["X-XYWH-Vendor-Name"] = "1d55af1659424cf94d869e2580a11bf8";
Vue.http.headers.common["X-XYWH-Application-Platform"] = "1";

let App = Vue.extend(require("./views/app.vue"));

let componentsReq = require.context("./components/", false, /\.vue$/);
componentsReq.keys().forEach(function(path) {
    Vue.component(path.match(/\.\/(.*?)\.vue/)[1], Vue.extend(componentsReq(path)));
});

Object.keys(filters).forEach(function(id) {
    Vue.filter(id, filters[id]);
});

Object.keys(directives).forEach(function(id) {
    Vue.directive(id, directives[id]);
});

let router = new VueRouter({
    hashbang: true
});

router.map({
    "/": {
        name: "index",
        title: "夜点娱乐",
        component: require("./views/index.vue")
    },
    "/ktv": {
        name: "list",
        title: "夜点娱乐",
        component: require("./views/ktv-list.vue")
    },
    "/ktv/:id": {
        name: "detail",
        hideBar: true,
        component: require("./views/ktv-detail.vue")
    },
    "/ktv/:id/map": {
        name: "map",
        hideBar: true,
        component: require("./views/map.vue")
    },
    "/book": {
        name: "book",
        title: "包房预订",
        hideBar: true,
        component: require("./views/book.vue")
    },
    "/book/:id": {
        name: "book-result",
        title: "包房预订",
        hideBar: true,
        component: require("./views/book-result.vue")
    },
    "/search": {
        name: "search",
        hideBar: true,
        component: require("./views/search.vue")
    },
    "/order": {
        name: "order",
        title: "我的订单",
        component: require("./views/order.vue"),
        subRoutes: {
            "/ktv": {
                component: require("./views/order-ktv.vue")
            },
            "/gift": {
                component: require("./views/order-gift.vue")
            }
        }
    },
    "/order/ktv/:id": {
        name: "ktv-order",
        title: "我的订单",
        hideBar: true,
        component: require("./views/order-ktv-detail.vue")
    },
    "/order/gift/:id": {
        name: "gift-order",
        title: "兑换成功",
        hideBar: true,
        component: require("./views/order-gift-detail.vue")
    },
    "/store": {
        name: "store",
        title: "礼品兑换",
        component: require("./views/store.vue")
    },
    "/store/:id": {
        name: "gift",
        title: "礼品兑换",
        hideBar: true,
        component: require("./views/gift.vue")
    },
    "/user": {
        name: "user",
        title: "个人中心",
        component: require("./views/user.vue")
    },
    "/user/favorite": {
        name: "favorite",
        title: "我的收藏",
        component: require("./views/favorite.vue")
    },
    "/coupon": {
        name: "coupons",
        title: "我的兑酒券",
        component: require("./views/coupon-list.vue")
    },
    "/view/order/:id": {
        name: "view-ktv-order",
        hideBar: true,
        component: require("./views/ktv-order.vue")
    },
    "/order/coupon/:id": {
        name: "order-coupon",
        hideBar: true,
        component: require("./views/order-ktv-coupon.vue")
    },
    "/wechat": {
        component: {}
    }
});

router.redirect({
    "/order": "/order/ktv",
    "*": "/"
});

router.beforeEach(function(transition) {
    if (transition.to.path === "/wechat") {
        if (transition.from.path && window.isWXReady) {
            wx.closeWindow();
        } else {
            transition.abort();
        };
    } else {
        transition.next();
    }
});

router.afterEach(function(transition) {
    if (transition.to.title) document.title = transition.to.title;
});

Vue.use(VueStats, router);
Vue.use(VueWeChat, router);

function wechatLogin(userData, noAuth) {
    Vue.api.oAuthLogin({//用户登录
        type: "wechat",
        openid: userData.openid,
        display_name: userData.display_name,
        avatar_url: userData.avatar_url
    }).then(function() {
        return Vue.Promise.all([
            //缓存基本信息
            Vue.api.get("api/index/baseinfo").then(function(data){store.baseinfo = data.baseinfo}),
            Vue.api.getUserInfo()//缓存用户信息
        ]);
    }).then(function(data) {
        let hash = location.hash;//获取页面地址

        if (typeof wx !== "undefined") wechat.init_jssdk();

        trak.init(store.jsinfo.appid);//打印
        trak.options.openId = userData.openid;
        if (process.env.NODE_ENV !== "production") trak.options.debug = true;

        trak.event({category: "", action: "", data: data[1]});//打印

        if (!noAuth) {//已认证用户
            if ((/micromessenger/i).test(navigator.userAgent)) {//判断浏览器类型是否为微信浏览器
                history.replaceState(null, null, "#!/wechat");//清除栈顶历史浏览记录
                history.pushState(null, null, hash);//添加历史浏览记录
            }

            if (hash && hash != "#!/" && hash.indexOf("#!/?") == -1) {
                history.replaceState(null, null, "#!/");
                history.pushState(null, null, hash);
            }
        }
        router.start(App, "app");
        
    }).catch(error => alert(error.msg || error.message || "加载失败"));
}

Vue.http.get("http://sheji.imwork.net/api/wechat/jsbaseinfo")
.then(response => response.json())
.then(function(data) {
    if (data.result === 0) {
        Vue.http.options.root = data.jsinfo.domain = location.protocol + "//" + data.jsinfo.domain + "/";
        store.jsinfo = data.jsinfo;
        return data.jsinfo;
    } else {
        throw new Error(data);
    }
}).then(function() {
    window.trak = {
        init: console.log.bind(console, "trak.init"),
        event: console.log.bind(console, "trak.event"),
        options: {}
    };
    
    
   if (process.env.NODE_ENV !== "production") {
        Vue.config.debug = true;
        window.Vue = Vue;
        window.router = router;
        window.$ = jQuery;

        wechatLogin({
            "openid": "oL8b5wuyRyzs8vKX9dMlfMkUQ4C0",
            "display_name": "小影",
            "avatar_url": ""
        });
    } else if(utils.getCookie("openid")) {//判断微信用户openid是否存在
        if (location.search || /\?(#|$)/.test(location.href)) {
            wechatLogin({ openid: utils.getCookie("openid") }, true);
        } else {
            location.replace("?" + location.hash);
        }
    } else {
      
        wechat.authenticate(wechatLogin, data => alert(data.msg || JSON.stringify(data)));
    }
}).catch(error => alert(error.msg || error.message || "Failed to get app/jsbaseinfo"));