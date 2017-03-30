<template>
    <div class="page-sharecoupon">
        <div class="redpacket">
            <div class="coupon" :style="{backgroundImage:'url('+$route.query.img+')'}" :data-count="$route.query.count"></div>
            <div class="content" v-el:redpacket-content>
                <p>邀请小伙伴扫描下方二维码<br>领取更多兑酒券</p>
                <div class="qrcode">
                    <img :src="qrcode">
                </div>
            </div>
        </div>
        <div class="redpacket_share" transition="fade" v-if="showRedpacketShare" @click="showRedpacketShare=false"></div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.page-sharecoupon {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: $bg url(../img/sharecoupon_bg.jpg) no-repeat 50% 0;
    background-size: contain;

    .redpacket {
        width: 89.3%;
        margin: 31.06% auto 0;

        .coupon {
            position: relative;
            background: no-repeat 50%;
            background-size: 100% 100%;
            padding-bottom: 59.7%;

            &:before {
                content: attr(data-count);
                position: absolute;
                left: 6%;
                top: 50%;
                transform: translateY(-50%);
                font-size: 90px;
                font-size: 23vw;
                font-weight: bold;
                color: #fff;
            }
        }

        .content {
            position: relative;
            background: $bgLight;
            padding: 1px 0;

            &:before {
                content: "";
                position: absolute;
                right: 100%;
                top: 0;
                bottom: 0;
                width: 2%;
                background: linear-gradient(to left, #25282D, $bg);
            }

            &:after {
                content: "";
                position: absolute;
                left: 100%;
                top: 0;
                bottom: 0;
                width: 2%;
                background: linear-gradient(to right, #25282D, $bg);
            }

            p {
                font-size: 18px;
                font-style: italic;
                text-align: center;
                line-height: 1.3;
                margin: 10px 0;
            }

            .qrcode {
                position: relative;
                width: 214px;
                height: 214px;
                margin: 10px auto;
                background: linear-gradient(0deg, $bgDark 1px, rgba(0,0,0,0) 1px), linear-gradient(90deg, $bgDark 1px, rgba(0,0,0,0) 1px);
                background-size: 5px 5px;

                &:before,
                &:after {
                    content: "";
                    position: absolute;
                    top: 0;
                    width: 20px;
                    height: 100%;
                    border: 3px solid $primary;
                    box-sizing: border-box;
                }

                &:before {
                    left: 0;
                    border-right: none;
                }

                &:after {
                    right: 0;
                    border-left: none;
                }

                img {
                    margin: 15px;
                    width: 184px;
                    height: 184px;
                }
            }
        }
    }

    .redpacket_share {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(#000, 0.9) url(../img/sharecoupon_share.png) no-repeat 80% 1%;
        background-size: 66.13%;
    }
}
</style>

<script>
import qrcode from "yaqrcode";

export default {
    data() {
        return {
            qrcode: null,
            showRedpacketShare: false
        }
    },
    ready() {
        this.qrcode = qrcode("http://" + location.host + location.pathname + "redpacket/?coupon=" + this.$route.params.id, {
            size: 184
        });

        this.$els.redpacketContent.style.minHeight = window.innerHeight - Math.ceil(window.innerWidth * 0.844) + "px";
        setTimeout(() => this.showRedpacketShare = true, 2e3);

        this.$wxShare({
            title: "夜点送你KTV兑酒券！",
            desc: "好友K歌局，有酒才痛快！夜点免费兑酒券，等你来抢！",
            link: "http://" + location.host + location.pathname + "redpacket/?coupon=" + this.$route.params.id,
            imgUrl: "http://" + location.host + location.pathname + "redpacket/img/weixin_share_pic.jpg",
            success: () => this.$api.addPoints(1)
        });
    }
}
</script>