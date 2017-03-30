function install(Vue, router) {
    let points = [];
    let $tabBar;
    let $masthead;

    function sendPoints() {
        let data = points.splice(0, points.length);

        if (data.length > 0) {
            Vue.api.post("tongji/click", {
                click: data
            });
        }    }

    function trackClick(event) {
        let page = location.hash.substring(2).split("?")[0];
        let pageY = event.pageY;

        if ($tabBar && $tabBar.contains(event.target)) pageY = -(window.innerHeight - (event.pageY - document.body.scrollTop));
        if ($masthead && $masthead.contains(event.target)) pageY = event.pageY - document.body.scrollTop;

        points.push({
            url: page,
            x: event.pageX,
            y: pageY
        });
    }

    Vue.trackPageview = Vue.prototype.$trackPageview = function(pageURL) {
        Vue.api.post("tongji/browse", {
            browse: {
                url: pageURL.replace("?fromTabBar=1", "")
            }
        });
        if (typeof ga != "undefined") ga("send", "pageview", pageURL);
        if (typeof _hmt != "undefined") _hmt.push(["_trackPageview", pageURL]);
        if (typeof trak != "undefined") trak.event({category: "_trackPageview", action: "PageView", data: {url: pageURL}});
    };

    Vue.trackEvent = Vue.prototype.$trackEvent = function(category, action, opt_label, opt_value) {
        if (typeof ga != "undefined") ga("send", "event", category, action, opt_label, opt_value);
        if (typeof _hmt != "undefined") _hmt.push(["_trackEvent", category, action, opt_label, opt_value]);
        if (typeof trak != "undefined") {
            let data = {};
            if (opt_label) data.label = opt_label;
            if (opt_value) data.value = opt_value;
            trak.event({
                category: category,
                action: action,
                data: data
            });
        }

        if (process.env.NODE_ENV !== "production") console.info("trackEvent", category, action, opt_label, opt_value);
    };

    if (process.env.NODE_ENV !== "production") {
        router.afterEach(function(transition) {
            console.info("跳转到：", transition.to.path, transition.to);
        });
    } else {
        router.afterEach(function(transition) {
            Vue.prototype.$trackPageview(transition.to.path);

            setTimeout(function () {
                $tabBar = document.getElementById("tab-bar");
                $masthead = document.querySelector(".masthead");
            }, 1e3);
        });

        window.addEventListener("unload", sendPoints, false);
        document.addEventListener("click", trackClick, false);
        setInterval(sendPoints, 10e3);
    }
}

module.exports = install;