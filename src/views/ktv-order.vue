<template>
    <div class="page-vieworder">
        <section class="orderinfo" :style="order.ktvinfo.piclist | backgroundImage">
            <div class="inner">
                <span class="logo" v-link="{name:'list'}"></span>

                <p class="invite">{{order.display_name}} 邀请你参与 KTV 派对</p>

                <h1 class="name" v-link="{name:'detail',params:{id:order.ktvinfo.xktvid}}">{{order.ktvinfo.xktvname || "&nbsp;"}}</h1>
                
                <ul>
                    <li>{{orderDate || "&nbsp;"}}</li>
                    <li>{{orderTime || "&nbsp;"}}</li>
                </ul>
            </div>
        </section>

        <section class="ktvinfo">
            <ul>
                <li><svg class="icon" viewBox="31 166 18 19" xmlns="http://www.w3.org/2000/svg"><path d="M38.617 176.382c-1.782-1.78-3.485-3.844-2.668-4.66 1.165-1.167 2.182-1.886.115-4.46-2.068-2.574-3.447-.597-4.58.535-1.303 1.305-.068 6.17 4.74 10.978 4.808 4.807 9.674 6.045 10.98 4.74 1.13-1.132 3.106-2.51.533-4.58-2.573-2.068-3.293-1.05-4.46.117-.817.813-2.88-.89-4.66-2.67z" fill="#707070" /></svg>{{order.ktvinfo.telephone}}</li>
                <li><svg class="icon" viewBox="28 95 18 24" xmlns="http://www.w3.org/2000/svg"><path d="M36.745 118.154S28 108.478 28 103.684C28 98.886 31.915 95 36.745 95c4.83 0 8.744 3.887 8.744 8.683 0 4.795-8.745 14.47-8.745 14.47zm0-11.577c-2.013 0-3.644-1.62-3.644-3.618 0-2 1.632-3.62 3.645-3.62 2.012 0 3.643 1.62 3.643 3.62 0 1.997-1.63 3.617-3.643 3.617z" fill="#707070" fill-rule="evenodd" /></svg>{{order.ktvinfo.address}}</li>
            </ul>

            <div class="actions">
                <a :href="'tel:'+order.ktvinfo.telephone"><svg class="icon" width="25" height="32" viewBox="31 166 18 19" xmlns="http://www.w3.org/2000/svg"><path d="M38.617 176.382c-1.782-1.78-3.485-3.844-2.668-4.66 1.165-1.167 2.182-1.886.115-4.46-2.068-2.574-3.447-.597-4.58.535-1.303 1.305-.068 6.17 4.74 10.978 4.808 4.807 9.674 6.045 10.98 4.74 1.13-1.132 3.106-2.51.533-4.58-2.573-2.068-3.293-1.05-4.46.117-.817.813-2.88-.89-4.66-2.67z" fill="#DE3341" /></svg></a>
                <a @click="$openMap(order.ktvinfo)"><svg class="icon" width="20" height="30" viewBox="28 95 18 24" xmlns="http://www.w3.org/2000/svg"><path d="M36.745 118.154S28 108.478 28 103.684C28 98.886 31.915 95 36.745 95c4.83 0 8.744 3.887 8.744 8.683 0 4.795-8.745 14.47-8.745 14.47zm0-11.577c-2.013 0-3.644-1.62-3.644-3.618 0-2 1.632-3.62 3.645-3.62 2.012 0 3.643 1.62 3.643 3.62 0 1.997-1.63 3.617-3.643 3.617z" fill="#DE3341" fill-rule="evenodd" /></svg></a>
            </div>
        </section>


        <div id="subscribe-popup" v-if="showSubscribePopup">
            <div class="body">
                <h5 class="title">关注「夜点娱乐」公众号</h5>
                <span class="desc">方可查看订单详情</span>
                <img :src="subscribeQRCode" class="qrcode">
            </div>
        </div>

        <flash-message v-ref:flash-message></flash-message>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.page-vieworder {
    min-height: 100vh;
    text-align: center;
    background: #fffffb;
    overflow: hidden;

    .orderinfo {
        color: #fff;
        background: $primary no-repeat 50%;
        background-size: cover;
        box-shadow: 0 1px 7px rgba(#000, 0.5);
    
        .inner {
            background: rgba($primary, .8);
            overflow: hidden;
        }

        .logo {
            display: block;
            width: 202px;
            height: 38px;
            margin: 15px auto 60px;
            background: url(../img/logo_text.png) no-repeat;
            background-size: contain;
        }
        .invite {
            margin: 0 0 .5em;
        }
        .name {
            font-size: 33px;
            margin: 0 0 65px;
        }
        ul {
            font-size: 19px;
            margin-bottom: 40px;
        }
        li {
            margin-bottom: .3em;
        }
    }

    .ktvinfo {
        color: $primary;
        overflow: hidden;
        max-width: 86%;
        margin: 50px auto;

        ul {
            margin: 0 auto 35px;
            color: #707070;
        }
        li {
            margin-bottom: .4em;
            line-height: 1.4;

            .icon {
                vertical-align: middle;
                margin-right: .3em;
                width: 14px;
                height: 14px;
            }
        }

        .actions {
            a {
                display: inline-block;
                width: 70px;
                height: 70px;
                border: 1px solid $primary;
                border-radius: 50%;
                margin-left: 70px;

                &:first-child {
                    margin-left: 0;
                }
            }

            .icon {
                margin: 20px auto 0;
            }
        }
    }
}

#subscribe-popup {
    background: rgba(0,0,0,.88);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;

    .body {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        transform: translate3d(-50%, -50%, 0);
        text-align: center;
    }

    .title {
        font-size: 16px;
        margin-bottom: .7em;
    }

    .desc {
        display: block;
        margin-bottom: 1.5em;
    }

    .qrcode {
        width: 150px;
        margin: 0;
    }
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
            isSubscribe: false,
            subscribeQRCode: null,

            order: {
                ktvinfo: {}
            },

            showSubscribePopup: false,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        data() {
            this.$api.getUserInfo().then(function (data) {
                this.isSubscribe = data.is_subscribe;
                this.fetch();
            }, function(data){
                this.errorMsg = data.msg || "加载失败";
                this.status = PAGE_STATUS.FAILED;
            });
        }
    },
    ready() {
        window.scrollTo(0, 0);

        this.$el.style.minHeight = window.innerHeight + "px";
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        fetch() {
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("booking/shareorderdetail", {
                ordercode: this.$route.params.id,
                openid: this.$route.query.openid
            }).then(function (data) {
                if (this.isSubscribe) {
                    this.order = data;
                } else {
                    this._order = data;
                    this.subscribeQRCode = data.subscribe_qr_code;
                    this.showSubscribePopup = true;
                    this.timer = setInterval(this.checkSubscribe.bind(this), 3e3);
                }

                this.shareOrder(data);
                this.status = PAGE_STATUS.COMPLETED;
            }, function(data) {
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        checkSubscribe() {
            this.$api.getUserInfo().then(function (data) {
                if (data.is_subscribe) {
                    this.order = this._order;
                    this.showSubscribePopup = false;
                    clearInterval(this.timer);
                }
            });
        },
        shareOrder(order) {
            let date = new Date(order.starttime * 1000);
            let hour = date.getHours();
            let orderDate =  "周" + "日一二三四五六".split("")[date.getDay()] + utils.parseDate("（M月d日）", date) + (hour<5?"凌晨":hour<12?"上午":hour<14?"中午":hour<18?"下午":"晚上") + utils.parseDate("hh:mm", date) + "-" + utils.parseDate("hh:mm", new Date(order.endtime * 1000));

            this.$wxShare({
                title: this.$user.display_name + "预订了：" + order.ktvinfo.xktvname,
                desc: "到店时间：" + orderDate + " 地址：" + order.ktvinfo.address,
                link: location.href.replace(this.$route.query.openid, this.$user.openid)
            });
        }
    },
    filters: {
        backgroundImage(piclist) {
            return piclist ? {
                backgroundImage: "url(" + utils.encodeBackgroundImageUrl(piclist[0].bigpicurl) + ")"
            } : null;
        }
    },
    computed: {
        orderDuration() {
            return this.order.starttime ? (this.order.endtime - this.order.starttime) / 60 / 60 + "小时" : "";
        },
        orderDate() {
            if (this.order.starttime) {
                let date = new Date(this.order.starttime * 1000);

                return utils.parseDate("M月d日", date) + " 星期" + "日一二三四五六".split("")[date.getDay()];
            } else {
                return "";
            }
        },
        orderTime() {
            if (this.order.starttime) {
                let start = new Date(this.order.starttime * 1000);
                let end = new Date(this.order.endtime * 1000);

                return utils.parseDate("hh:mm", start) + " - " + (end.getHours() < start.getHours() ? "次日" : "") + utils.parseDate("hh:mm", end);
            } else {
                return "";
            }
        }
    }
}
</script>