<template>
    <router-view transition="fade" transition-mode="out-in"></router-view>
    <tab-bar></tab-bar>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";
@import "../scss/base";
@import "../scss/common";
@import "../vendor/mobiscroll/mobiscroll.custom-2.17.1.min.css";
@import "../scss/mobiscroll";
</style>

<script>
import mobiscroll from "../vendor/mobiscroll/mobiscroll.custom-2.16.0.min.js";

export default {
    ready() {
        let vm = this;

        $.mobiscroll.setDefaults({
            theme: "ios",
            lang: "zh",
            display: "bottom",
            height: 42,
            mode: "scroller"
        });

        window.onerror = function (msg, url, lineNo, colNo, error) {
            if (msg == "Script error.") return;

            var data = {
                ua: navigator.userAgent,
                url: location.href,
                msg: msg,
                file: url,
                line: lineNo,
                col: colNo
            };

            if (error && error.stack) data.msg = error.stack.toString();

            if (process.env.NODE_ENV !== "production") {
                console.info("errorreport", data);
            } else {
                if (location.host.indexOf("dev") == -1) {
                    vm.$api.post("tongji/errorreport", {
                        content: JSON.stringify(data)
                    });
                }
            }
        }
    }
}
</script>