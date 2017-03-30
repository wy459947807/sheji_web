<template>
    <nav id="tab-bar" v-show="show">
        <span v-for="item in items" :class="'item-'+item.id">
            <a v-if="item.link.indexOf('#!')===0" v-link="{path:item.link.substring(2),query:{fromTabBar:1},activeClass:'active'}">
                <span class="icon" :class="'icon-'+item.id">{{{item.icon}}}</span>
                <span class="text">{{item.name}}</span>
            </a>
            <a v-else :href="item.link">
                <span class="icon" :class="'icon-'+item.id">{{{item.icon}}}</span>
                <span class="text">{{item.name}}</span>
            </a>
        </span>
    </nav>
</template>

<style lang="sass">
@import "../scss/variables";

body.show-tabbar {
    padding-bottom: $tabBarHeight;
}

#tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: $tabBarHeight;
    z-index: 3;
    background: $bgDark;
    text-align: center;
    font-size: 12px;
    display: flex;
    box-shadow: 0 -3px 5px 0 rgba(#000, 0.2);

    > span {
        flex: 1;
    }

    a {
        color: $grayText;
        display: block;

        .text {
            display: block;
        }

        &.active {
            color: $primary;
        }
    }

    .icon {
        width: 24px;
        height: 24px;
        margin: 7px auto 5px;

        svg {
            width: 100%;
            height: 100%;
            fill: currentColor;
        }
    }
}
</style>

<script>
export default {
    data() {
        return {
            show: true,
            items: [{
                id: "index",
                name: "精选",
                link: "#!/",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.75 23.93"><path d="M13.91,0.91l2.72,4.93a2,2,0,0,0,1.34,1l5.2,1a2,2,0,0,1,1.05,3.24L20.6,14.91a2,2,0,0,0-.51,1.57l0.66,5.25a2,2,0,0,1-2.76,2L13.2,21.49a2,2,0,0,0-1.65,0L6.76,23.74a2,2,0,0,1-2.76-2l0.66-5.25a2,2,0,0,0-.51-1.57L0.53,11.05A2,2,0,0,1,1.58,7.81l5.2-1a2,2,0,0,0,1.34-1l2.72-4.93A1.76,1.76,0,0,1,13.91.91ZM8.21,9.06l-5.29,1L6.6,14a2.31,2.31,0,0,1,.61,1.86L6.54,21.21l4.87-2.29a2.31,2.31,0,0,1,2,0l4.87,2.29-0.67-5.34A2.31,2.31,0,0,1,18.18,14l3.68-3.93-5.29-1A2.31,2.31,0,0,1,15,7.91L12.39,3.2,9.79,7.91A2.31,2.31,0,0,1,8.21,9.06Z" /></svg>'
            }, {
                id: "ktv",
                name: "预订",
                link: "#!/ktv",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.85 28.38"><path d="M19,1.37A8.12,8.12,0,0,0,7.76,3.54a7.75,7.75,0,0,0-1,6A8.28,8.28,0,0,0,7.21,11l-7,12.86a2,2,0,0,0,.67,2.65L3.14,28a2.2,2.2,0,0,0,3-.48L15,16.08a8.25,8.25,0,0,0,1.51-.15,7.75,7.75,0,0,0,5.1-3.4A8.12,8.12,0,0,0,19,1.37ZM5.56,25.61a1.23,1.23,0,0,1-1.64.28l-1.13-.73a1.23,1.23,0,0,1-.41-1.62L7.86,13.43a8.61,8.61,0,0,0,4.74,3ZM19.9,11.43A5.77,5.77,0,0,1,16.1,14,6.43,6.43,0,0,1,8.7,9.15,5.79,5.79,0,0,1,9.1,5.3a8.67,8.67,0,0,0,3.67,5.07,8.5,8.5,0,0,0,7.13,1h0ZM20.59,9.9a7.25,7.25,0,0,1-7-.79,7.08,7.08,0,0,1-3.41-5.38A5.94,5.94,0,0,1,14.43,2a6.39,6.39,0,0,1,3.48,1A6.19,6.19,0,0,1,20.59,9.9Z" /><path d="M8.47,15.86l-1.94,3a0.21,0.21,0,0,0,.06.28l1.23,0.8a0.21,0.21,0,0,0,.28-0.06l1.94-3a0.21,0.21,0,0,0,0-.15A0.2,0.2,0,0,0,10,16.6l-1.23-.8A0.21,0.21,0,0,0,8.47,15.86Z" /></svg>'
            }, {
                id: "store",
                name: "兑换",
                link: "#!/store",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,5H20.7A3.94,3.94,0,0,0,21,3.5,3.28,3.28,0,0,0,18,0a1,1,0,0,0-.24,0l-4,1a1,1,0,0,0-.32.15A2.48,2.48,0,0,0,12.5,1h-1a2.48,2.48,0,0,0-.93.18A1,1,0,0,0,10.24,1l-4-1A1,1,0,0,0,6,0,3.28,3.28,0,0,0,3,3.5,3.94,3.94,0,0,0,3.3,5H3A3,3,0,0,0,0,8v3a2,2,0,0,0,1,1.72V21a3,3,0,0,0,3,3H20a3,3,0,0,0,3-3V12.72A2,2,0,0,0,24,11V8A3,3,0,0,0,21,5Zm1,3v3H15V7h6A1,1,0,0,1,22,8ZM11.5,7H13v4H11V7h0.5Zm6.59-5A1.43,1.43,0,0,1,19,3.5,1.43,1.43,0,0,1,18.09,5L15,4.22V3.5a2.47,2.47,0,0,0-.11-0.69ZM11,3.5A0.5,0.5,0,0,1,11.5,3h1a0.5,0.5,0,0,1,.5.5v1a0.5,0.5,0,0,1-.5.5h-1A0.5,0.5,0,0,1,11,4.5v-1ZM5.91,2l3.2,0.8A2.47,2.47,0,0,0,9,3.5V4.22L5.91,5A1.43,1.43,0,0,1,5,3.5,1.43,1.43,0,0,1,5.91,2ZM2,8A1,1,0,0,1,3,7H9v4H2V8ZM3,21V13H9v9H4A1,1,0,0,1,3,21Zm8,1V13h2v9H11Zm9,0H15V13h6v8A1,1,0,0,1,20,22Z" /></svg>'
            }, {
                id: "user",
                name: "我的",
                link: "#!/user",
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.25 23.32"><path d="M9.62,0A9.68,9.68,0,0,0,0,9.74a9.68,9.68,0,0,0,9.62,9.74,9.68,9.68,0,0,0,9.62-9.74A9.68,9.68,0,0,0,9.62,0Zm0,16.79a7.05,7.05,0,1,1,7-7.05A7,7,0,0,1,9.62,16.79Z" /><rect y="20.45" width="19.25" height="2.87" rx="1.34" ry="1.34" /></svg>'
            }]
        }
    },
    ready() {
        var body = document.body;

        this.$router.afterEach(({to}) => {
            this.show = !to.hideBar;
            body.classList[this.show ? "add" : "remove"]("show-tabbar");
        });
    }
}
</script>