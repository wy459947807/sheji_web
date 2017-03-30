function install(Vue, router) {
    Vue.prototype.$wxShare = function(data) {
        let successCallback = data.success;

        delete data.success;

        Object.assign(window.shareData, data, { successCallback });
        Object.assign(window.shareDataTL, data, { title: data.titleTL || data.title });
    };

    router.afterEach(function() {
        window.defaultShareData.link = location.href.replace("?fromTabBar=1", "");
        Object.assign(window.shareData, window.defaultShareData, { successCallback: null });
        Object.assign(window.shareDataTL, window.defaultShareData, { title: window.defaultShareData.titleTL });
    });
}

module.exports = install;
