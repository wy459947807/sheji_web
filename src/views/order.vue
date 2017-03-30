<template>
    <div class="page-order">
        <router-view></router-view>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.order-list {
    li {
        margin: $gap;
        background: $bgLight;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
        animation: fadeIn .3s;
        transition: .3s ease-out;

        .header {
            padding: $gap;

            .name {
                font-size: 16px;
            }
            .status{
                float: right;
                color: $primary;
            }
        }

        .content {
            padding: $gap;
            
            .btn {
                float: right;
                border: 1px solid $primary;
                border-radius: 3px;
                background: $bg;
                width: 60px;
                height: 24px;
                margin-top: 3px;
            }
            .share {
                float: right;
                margin-top: 2px;
                background: url(../img/icons/icon-share.svg) no-repeat 50%;
                width: 26px;
                height: 26px;
            }
            .ordertime {
                display: block;
                margin: 0 0 3px;
            }
            .info {
                margin: 0;
            }
            .couponinfo {
                font-size: 12px;
                margin-bottom: 0;
                line-height: 1.4;
            }
        }

        .pic {
            margin: 0 $gap;
            height: 120px;
            background: $bg no-repeat 50%;
            background-size: cover;
        }

        &.deleted {
            height: 0!important;
            margin-bottom: 0;
            opacity: 0;
        }
    }
}
</style>

<script>
export default {
    data() {
        return {
            activeView: this.$route.path.indexOf("gift") == -1 ? "ktv" : "gift"
        }
    },
    ready() {
        if (this.$route.query.fromTabBar) window.scrollTo(0, 0);
    }
}
</script>