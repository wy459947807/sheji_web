<template>
    <div class="page-ktvorder">
        <div v-if="order.ktvinfo">
            <section class="section-detail">
                <div class="section-bd">
                    <div class="top">
                        <h3 class="name">{{order.ktvinfo.xktvname}}</h3>
                        <div class="action">
                            <span class="status">{{order.order_status | statusName}}</span>
                            <button type="button" class="btn" v-if="isOrderCancelable" @click.stop="cancelOrder" v-el:cancel-btn><span class="text">取消订单</span><span class="icon icon-spinner"></span></button>
                        </div>
                    </div>

                    <hr>

                    <div v-if="timeRemaining > -1">
                        <div class="pay-countdown">
                            <h4>支付剩余时间</h4>
                            <time>{{timeRemaining | humanTime}}</time>
                        </div>
                        <hr>
                    </div>

                    <div v-if="order.order_status==21">
                        <p class="refund-tip">您的款项将于3-5 个工作日返还您的账户</p>
                        <hr>
                    </div>

                    <ul>
                        <li><span class="label">时间：</span><span class="value">{{orderDate}}</span></li>
                        <li><span class="label">共计：</span><span class="value duration">{{(this.order.endtime - this.order.starttime)/60/60}}小时</span></li>
                        <li><span class="label">地址：</span><span class="value">{{order.ktvinfo.address}}</span></li>
                        <li><span class="label">包房：</span><span class="value">{{order.room_name}}</span></li>
                        <li><span class="label">套餐：</span><span class="value">{{order.taocan_info?order.taocan_info.name:"无"}}</span></li>
                        <li><span class="label">兑酒券：</span><span class="value">{{order.coupon_info.count?order.coupon_info.name+((order.order_status==4||order.order_status==7||order.order_status==14)?"（已返还）":""):"无"}}</span></li>
                    </ul>

                    <hr>

                    <ul>
                        <li><span class="label">手机：</span><span class="value">{{order.mobile | mobileFormat}}</span></li>
                        <li v-if="order.taocantype==0"><span class="label">总价：</span><span class="value price">¥{{order.price}}</span></li>
                    </ul>
                </div>
            </section>

            <figure class="qrcode" v-if="canDisplayQrcode">
                <div class="corner corner-tl"></div>
                <div class="corner corner-tr"></div>
                <div class="corner corner-bl"></div>
                <div class="corner corner-br"></div>
                <img :src="order.qrcode" @error="reloadQRCode" />
            </figure>

            <button type="button" class="btn-float btn-comment" v-if="order.order_status==5&&!order.rating.status" @click="$refs.ratingModal.open()">立即评价</button>

            <div v-else>
                <button type="button" class="btn-float btn-pay" @click="payOrder" v-if="timeRemaining > -1" v-el:pay-btn>微信支付</button>

                <button type="button" class="btn-float btn-share" @click="showShareOrderTip=true" v-else>分享订单</button>
            </div>

            <modal id="rating-modal" :title="'为 ' + order.ktvinfo.xktvname + ' 评分'" btn-text="提交" :btn-disabled="!isRatingComplete" :submit="postReview" v-ref:rating-modal>
                <table class="rating-list">
                    <tr><th><span class="icon icon-decoration"></span>装修</th><td><rating :value.sync="ratings.decoration"></rating></td></tr>
                    <tr><th><span class="icon icon-sound"></span>音响</th><td><rating :value.sync="ratings.sound"></rating></td></tr>
                    <tr><th><span class="icon icon-service"></span>服务</th><td><rating :value.sync="ratings.service"></rating></td></tr>
                    <tr><th><span class="icon icon-consumer"></span>消费</th><td><rating :value.sync="ratings.consumer"></rating></td></tr>
                    <tr><th><span class="icon icon-food"></span>食物</th><td><rating :value.sync="ratings.food"></rating></td></tr>
                </table>

                <div class="app-rating">
                    <h4>为 夜点娱乐 评分</h4>
                    <rating :value.sync="ratings.app" :size="22"></rating>
                </div>
            </modal>
        </div>

        <div id="share-order" v-if="showShareOrderTip" @click="showShareOrderTip=false"><div class="tip"></div></div>

        <div id="miandan-free" v-if="miandan=='free'"><a class="btn" v-link="{ name:'order-coupon', params:{id:shareCoupon.code} }"></a></div>
        <div id="miandan-top20" v-if="miandan=='top20'"><a class="btn" v-link="{ name:'order-coupon', params:{id:shareCoupon.code} }"></a></div>

        <flash-message v-ref:flash-message></flash-message>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.page-ktvorder {
    margin-bottom: 74px;

    .section-detail {
        position: relative;
        background: $bgLight;
        padding: 0 $gap 30px;

        &:after {
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 100%;
            height: 8px;
            content: "";
            background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAMAAAAhxq8pAAAAOVBMVEVMaXE+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+Qkg+QkgDFLXwAAAAEnRSTlMAAwwNHB0yM09Qb3CQsM3j8/w6yxxHAAAAVUlEQVR42mXOSxJAMAAE0QlBRL7uf1gKpSPesletuP9E2dK3Mkm+j5skk74tGZ3m2ra66BLaGHQbMi2PejjiqldkEbawCM8iTGIRc2URgUUMmUU4Fg/2HAtzrH29TgAAAABJRU5ErkJggg==) repeat-x;
            background-size: 10px 8px;
        }

        hr {
            border: none;
            height: 1px;
            background: $bg;
            clear: both;
            margin: 0;
        }

        ul {
            padding-top: $gap;

            li {
                overflow: hidden;
                line-height: 1.5;
                margin-bottom: $gap - 4;
            }
            .value {
                color: #fff;
            }

            .duration {
                font-size: 16px;
            }

            .duration,
            .price {
                color: $primary;
            }
        }

        .top {
            margin: $gap 0;
            display: flex;
            justify-content: space-between;
        }

        .name {
            font-size: 20px;
            color: #fff;
            max-width: 70%;
        }

        .action {
            .status {
                margin-top: 2px;
                font-size: 16px;
                color: $primary;
            }

            .btn {
                margin-top: -3px;
                border: 1px solid $primary;
                border-radius: 3px;
                background: $bg;
                width: 80px;
                height: 28px;

                .icon {
                    background: url(../img/icons/icon-loader.svg) no-repeat 50%;
                    background-size: contain;
                    width: 16px;
                    height: 16px;
                    display: none;
                    margin-top: 3px;
                }

                &.loading {
                    .text {
                        display: none;
                    }
                    .icon {
                        display: inline-block;
                    }
                }
            }
        }

        .pay-countdown {
            margin: $gap 0;
            text-align: center;

            h4 {
                margin-bottom: .5em;
            }

            time {
                font-size: 2em;
            }
        }

        .refund-tip {
            margin: $gap;
            text-align: center;
        }
    }

    .qrcode {
        position: relative;
        margin: -20px auto 30px;
        text-align: center;
        font-size: 12px;
        width: 200px;
        height: 200px;

        img {
            width: 100%;
            height: 100%;
        }

        .corner {
            position: absolute;
            width: 20px;
            height: 20px;
        }
        .corner-tl {
            top: -10px;
            left: -10px;
            border-top: 3px solid $primary;
            border-left: 3px solid $primary;
        }
        .corner-tr {
            top: -10px;
            right: -10px;
            border-top: 3px solid $primary;
            border-right: 3px solid $primary;
        }
        .corner-bl {
            bottom: -10px;
            left: -10px;
            border-bottom: 3px solid $primary;
            border-left: 3px solid $primary;
        }
        .corner-br {
            bottom: -10px;
            right: -10px;
            border-bottom: 3px solid $primary;
            border-right: 3px solid $primary;
        }
    }
}

#rating-modal {
    .rating-list {
        clear: both;
        margin: 0 7% 20px;
        width: 86%;
        color: $text;
        text-align: center;

        th, td {
            padding: 10px 0;
        }

        th {
            width: 40%;
        }
        .icon {
            background: no-repeat 50%;
            background-size: contain;
            width: 24px;
            height: 24px;
            margin-right: 10px;
            vertical-align: middle;
        }
        .c-rating {
            text-align: left;
        }

        .icon-decoration { background-image: url(../img/icons/ratingicon-decoration.svg); }
        .icon-sound { background-image: url(../img/icons/ratingicon-sound.svg); }
        .icon-service { background-image: url(../img/icons/ratingicon-service.svg); }
        .icon-food { background-image: url(../img/icons/ratingicon-food.svg); }
        // .icon-consumer { background-image: url(../img/icons/ratingicon-consumer.svg); }
    }

    .app-rating {
        margin-bottom: 40px;
        h4 {
            margin-left: 30px;
            margin-bottom: 20px;
        }
    }
}

#miandan-free,
#miandan-top20 {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: #000 no-repeat 50% 0;
    background-size: cover;
    z-index: 99;
}

#miandan-free {
    background-image: url(../img/prize_free.jpg);

    .btn {
        display: block;
        margin: 100% auto 0;
        padding-top: 18%;
        width: 52%;
    }
}

#miandan-top20 {
    background-image: url(../img/prize_top20.jpg);

    .btn {
        display: block;
        margin: 93% auto 0;
        padding-top: 18%;
        width: 50%;
    }
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS, ORDER_STATUS } from "../constants/index";

export default {
    data() {
        return {
            order: {},
            shareCoupon: {},
            miandan: false,

            showShareOrderTip: false,

            timeRemaining: -1,

            ratings: {
                decoration: 0,
                sound: 0,
                service: 0,
                consumer: 0,
                food: 0,
                app: 0
            },

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        activate(transition) {
            this.fromOrderCoupon = transition.from && transition.from.name == "order-coupon";
            transition.next();
        },
        data() {
            if (this.$route.query.share && !this.fromOrderCoupon) {
                this.$api.get("booking/checkstatus", {
                    order_code: this.$route.params.id
                }).then(function (data) {
                    this.$router.go({
                        name: "order-coupon",
                        params: {
                            id: data.ShareCoupon.code
                        },
                        query: {
                            img: data.ConfirmOrderCoupon.img,
                            count: data.ConfirmOrderCoupon.count
                        }
                    });
                });
            } else {
                this.fetch();
            }
        }
    },
    ready() {
        window.scrollTo(0, 0);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        fetch() {
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("booking/Orderdetail", {
                ordercode: this.$route.params.id
            }).then(function (data) {
                this.order = data;
                this.status = PAGE_STATUS.COMPLETED;

                if (data.is_pingjia.status) this.ratings.app = data.is_pingjia.appRating;
                if (data.order_status == 3) this.timer = setInterval(this.checkStatus.bind(this), 5e3);
                if (data.is_pay_online && data.order_status == 17) this.payCountdown(data.payendtime - data.now);

                this.setWxShareOrderData();
            }, function(data) {
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        cancelOrder() {
            let order = this.order;

            if (!confirm("确定要取消" + order.ktvinfo.xktvname + " " + (utils.parseDate("yyyy年MM月dd日 hh:mm", new Date(order.starttime * 1000))) + " " + order.room_name + "的订单吗？")) {
                return false;
            };

            let promise;

            this.$els.cancelBtn.classList.add("loading");

            if (order.is_pay_online) {
                promise = this.$api.get("booking/cancelpayorder", {
                    ordercode: order.order_code,
                });
            } else {
                promise = this.$api.post("booking/cancelorder", {
                    ordercode: order.order_code,
                    ktvid: order.ktvinfo.xktvid
                });
            }

            promise.then(function(data) {
                this.order.order_status = order.is_pay_online ? 21 : 7;
                this.$els.cancelBtn.classList.remove("loading");
            }, function(data){
                alert(data.msg || "取消订单失败");
            });
        },
        checkStatus() {
            this.$api.get("booking/checkstatus", {
                order_code: this.order.order_code
            }).then(function (data) {
                if (data.status == 5) {
                    clearInterval(this.timer);

                    this.shareCoupon = data.ShareCoupon;

                    if (data.ShareCoupon.miandan.is_zhongjiang) {
                        this.miandan = "free";
                    } else if (data.ShareCoupon.miandan.is_last_20) {
                        this.miandan = "top20";
                    } else {
                        this.$router.go({
                            name: "order-coupon",
                            params: {
                                id: data.ShareCoupon.code
                            },
                            query: {
                                img: data.ConfirmOrderCoupon.img,
                                count: data.ConfirmOrderCoupon.count
                            }
                        });
                    }
                };
            });
        },
        postReview() {
            this.$api.post("feedback/comment", {
                ktvid: this.order.ktvinfo.xktvid,
                openid: this.$user.openid,
                DecorationRating: this.ratings.decoration,
                SoundRating: this.ratings.sound,
                ServiceRating: this.ratings.service,
                FoodRating: this.ratings.food,
                ConsumerRating: this.ratings.consumer,
                appRating: this.ratings.app
            }).then(function (data) {
                this.order.rating.status = 1;
                this.$refs.ratingModal.close();
                this.$refs.flashMessage.show("smile", "<p>评价成功</p>");
            }, function(data){
                alert(data.msg || "提交失败");
            });
        },
        payCountdown(seconds) {
            this.timeRemaining = seconds;
            this.timeRemainingLast = Date.now();

            this.timer = setInterval(() => {
                if (this.timeRemaining > 0) {
                    let now = Date.now();
                    this.timeRemaining -= Math.round((now - this.timeRemainingLast) / 1e3);
                    this.timeRemainingLast = now;
                } else {
                    this.timeRemaining = -1;
                    clearInterval(this.timer);
                }
            }, 1e3);
        },
        payOrder() {
            this.$api.wechatPay(this.order.order_code).then(function(data) {
                alert("支付成功");
                clearInterval(this.timer);
                this.timeRemaining = -1;
                this.order.order_status = 18;
            }, function(data) {
                alert(data.msg || "支付失败");
            });
        },
        reloadQRCode(event) {
            setTimeout(() => event.target.src = this.order.qrcode + "?_=" + Date.now(), 1e3);
        },
        setWxShareOrderData() {
            this.$wxShare({
                title: this.$user.display_name + "预订了：" + this.order.ktvinfo.xktvname,
                desc: "到店时间：" + this.orderDate + " 地址：" + this.order.ktvinfo.address,
                link: location.href.replace("order/ktv", "view/order") + "?openid=" + this.$user.openid,
                success: () => this.$api.addPoints(2)
            });
        }
    },
    filters: {
        statusName(statusCode) {
            return ORDER_STATUS[statusCode];
        },
        backgroundImage(url) {
            return {
                backgroundImage: "url(" + utils.encodeBackgroundImageUrl(url) + ")"
            };
        },
        mobileFormat(mobile) {
            return mobile && mobile.replace(/(\d{3})(\d{4})(\d{4})/, "$1 $2 $3");
        },
        humanTime(seconds) {
            return utils.padZero(Math.floor(seconds / 60)) + ":" + utils.padZero(seconds % 60);
        }
    },
    computed: {
        orderDate() {
            if (this.order.starttime && this.order.endtime) {
                let date = new Date(this.order.starttime * 1000);
                let hour = date.getHours();

                return "周" + "日一二三四五六".split("")[date.getDay()] + utils.parseDate("（M月d日）", date) + (hour<5?"凌晨":hour<12?"上午":hour<14?"中午":hour<18?"下午":"晚上") + utils.parseDate("hh:mm", date) + "-" + utils.parseDate("hh:mm", new Date(this.order.endtime * 1000));
            } else {
                return "";
            }
        },
        isRatingComplete() {
            return Object.keys(this.ratings).every(item => this.ratings[item]);
        },
        isOrderCancelable() {
            return [1, 3].indexOf(this.order.order_status) !== -1;
        },
        canDisplayQrcode() {
            return [1, 4, 7, 14, 17, 18, 21, 22, 23].indexOf(this.order.order_status) === -1;
        }
    }
}
</script>