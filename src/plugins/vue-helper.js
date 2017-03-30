function install(Vue) {
    Vue.prototype.$handleLink = function(link, source) {
        this.$trackEvent(source, "Click", link);

        if (link.indexOf("#!") === 0) {
            this.$router.go(link.substring(2));
        } else {
            setTimeout(function() {
                location.href = link;
            }, 300);
        }

        return false;
    };

    Vue.prototype.$openMap = function(ktvinfo) {
        if (window.isWXReady) {
            wx.openLocation({
                latitude: ktvinfo.lat,
                longitude: ktvinfo.lng,
                name: ktvinfo.xktvname,
                address: ktvinfo.address,
                scale: 14
            });
        } else {
            this.$router.go({
                name: "map",
                query: {
                    lat: ktvinfo.lat,
                    lng: ktvinfo.lng,
                    name: ktvinfo.xktvname,
                    address: ktvinfo.address
                }
            });
        }
    };
}

module.exports = install;
