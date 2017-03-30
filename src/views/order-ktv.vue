<template>
    <div class="order-list order-list-ktv">
        <nav class="status-filter">
            <div class="inner">
                <a v-for="item in statusList" :class="{active:item.code==orderStatus}" @click="orderStatus=item.code">{{item.text}}</a>
            </div>
        </nav>
        <ul>
            <li v-for="order in list | limitBy currLimit" :data-status="order.order_status" v-link="{name: 'ktv-order', params: { id: order.order_code }}" data-v-swipe-to-delete="order">
                <header class="header">
                    <span class="name">{{order.ktvinfo.xktvname}}</span>
                    <span class="status">{{order.order_status | statusName}}</span>
                </header>
                <figure class="pic" :style="order.ktvinfo.piclist[0].bigpicurl | backgroundImage"></figure>
                <div class="content">
                    <button type="button" class="btn" v-if="order.order_status==5&&!order.rating.status" @click.stop="showRatingModal(order)">待评价</button>
                    <span class="share" @click.stop="shareOrder(order)" v-else></span>
                    <time class="ordertime">{{order | humanDate}}</time>
                    <p class="info">{{order.room_name}}&emsp;共{{order | duration}}小时</p>
                    <p class="couponinfo" v-if="order.coupon_info.count">订单包含兑酒券一张，到店消费可免费兑换{{order.coupon_info.name}}。</p>
                </div>
            </li>
        </ul>

        <modal v-if="ratingOrder" id="rating-modal" :title="'为 ' + ratingOrder.ktvinfo.xktvname + ' 评分'" btn-text="提交" :btn-disabled="!isRatingComplete" :submit="postReview" v-ref:rating-modal>
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

        <div id="share-order" v-if="showShareOrderTip" @click="showShareOrderTip=false"><div class="tip"></div></div>

        <flash-message v-ref:flash-message></flash-message>

        <loading v-show="status==PAGE_STATUS.LOADING" :inline-mode="list.length>0"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" :inline-mode="list.length>0" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
        <screen-message v-if="status==PAGE_STATUS.COMPLETED&&list.length==0" message="无订单"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.order-list-ktv {
    .status-filter {
        position: relative;
        background: $bgLight;
        height: 44px;
        z-index: 3;

        .inner {
            margin: 0 $gap;
            display: flex;
            justify-content: space-between;
        }

        a {
            margin-top: 4px;
            line-height: 36px; 

            &.active {
                margin-top: 0;
                border-top: 4px solid $primary;
                color: $primary;
            }
        }
    }

    li {
        .pic:not([style]) {
            background-image: url(../img/xktv-logo.png);
            background-size: 70px 70px;
        }
    }
}

#share-order {
    background: rgba(0,0,0,.88);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;

    .tip {
        float: right;
        margin: 20px 20px 0 0;
        width: 229px;
        height: 82px;
        background: url(../img/share-order-tip.png) no-repeat 50%;
        background-size: contain;
    }
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS, ORDER_STATUS } from "../constants/index";

export default {
    data() {
        return {
            statusList: [
                { code: 0, text: "全部" },
                { code: 1, text: "确认中" },
                { code: 3, text: "已确认" },
                { code: 7, text: "已取消" },
            ],
            orderStatus: 0,

            list: [],

            showShareOrderTip: false,

            ratings: {
                decoration: 0,
                sound: 0,
                service: 0,
                consumer: 0,
                food: 0,
                app: 0
            },
            ratingOrder: null,

            offset: 0,
            limit: 27,
            page: 0,
            perPage: 9,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        data() {
            this.fetch();
        }
    },
    ready() {
        let $win = $(window);
        let $doc = $(document);
        let winHeight = $win.height();

        $win.on("scroll", utils.throttle(() => {
            if (this.status == PAGE_STATUS.LOADING) return false;
            if ($doc.height() - winHeight - $win.scrollTop() < 400) {
                this.fetch();
            };
        }, 100));
    },
    beforeDestroy() {
        $(window).off("scroll");
    },
    methods: {
        fetch() {
            if (this.offset > this.currLimit) {
                this.page++;
                return false;
            } else if (this.status == PAGE_STATUS.COMPLETED) {
                return false;
            };
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("booking/orderlist", {
                offset: this.offset,
                limit: this.limit,
                status: this.orderStatus
            }).then(function (data) {
                if (data.total == 0) {
                    this.status = PAGE_STATUS.COMPLETED;
                    return false;
                };
                this.list = this.list.concat(data.list);
                this.offset += data.total;
                this.page++;
                if (data.total < this.limit) {
                    this.status = PAGE_STATUS.COMPLETED;
                } else {
                    this.status = PAGE_STATUS.DONE;
                };
            }, function (data) {
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        deleteOrder(order, $el) {
            this.$api.post("booking/deleteorder", {
                ordercode: order.order_code,
                ktvid: order.ktvinfo.xktvid
            }).then(function(data) {
                $el.one("transitionend", () => {
                    this.list.$remove(order);
                }).css("height", $el.height());
                setTimeout(function(){
                    $el.addClass("deleted");
                }, 10);
            }, function(data){
                alert(data.msg || "删除订单失败");
            });
        },
        showRatingModal(order) {
            this.ratingOrder = order;
            this.$nextTick(function(){
                this.$refs.ratingModal.open();
            });
        },
        postReview() {
            this.$api.post("feedback/comment", {
                ktvid: this.ratingOrder.ktvinfo.xktvid,
                openid: this.$user.openid,
                DecorationRating: this.ratings.decoration,
                SoundRating: this.ratings.sound,
                ServiceRating: this.ratings.service,
                FoodRating: this.ratings.food,
                ConsumerRating: this.ratings.consumer,
                appRating: this.ratings.app
            }).then(function (data) {
                this.ratingOrder.rating.status = 1;
                this.$refs.ratingModal.close();
                this.$refs.flashMessage.show("smile", "<p>评价成功</p>");
                Object.keys(this.ratings).forEach(item => this.ratings[item]=0);
            }, function(data){
                alert(data.msg || "提交失败");
            });
        },
        shareOrder(order) {
            let date = new Date(order.starttime * 1000);
            let hour = date.getHours();
            let orderDate =  "周" + "日一二三四五六".split("")[date.getDay()] + utils.parseDate("（M月d日）", date) + (hour<5?"凌晨":hour<12?"上午":hour<14?"中午":hour<18?"下午":"晚上") + utils.parseDate("hh:mm", date) + "-" + utils.parseDate("hh:mm", new Date(order.endtime * 1000));

            this.$wxShare({
                title: this.$user.display_name + "预订了：" + order.ktvinfo.xktvname,
                desc: "到店时间：" + orderDate + " 地址：" + order.ktvinfo.address,
                link: location.href.replace("order/ktv", "view/order/" + order.order_code) + "?openid=" + this.$user.openid,
                success: () => this.$api.addPoints(2)
            });

            this.showShareOrderTip = true;
        }
    },
    computed: {
        currLimit() {
            return this.page * this.perPage;
        },
        isRatingComplete() {
            return Object.keys(this.ratings).every(item => this.ratings[item]);
        }
    },
    watch: {
        orderStatus(value) {
            this.status = PAGE_STATUS.DONE;
            this.page = this.offset = 0;
            this.list = [];
            this.fetch();
        }
    },
    directives: {
        swipeToDelete: {
            bind() {
                let self = this;
                let $el = $(this.el);
                let startX = 0;
                let startY = 0;
                let distance = 0;

                function touchmoveHandler(event) {
                    let touch = event.originalEvent.changedTouches[0];
                    distance = startX - touch.pageX;
                };

                function touchendHandler(event) {
                    let order = self.order;
                    if (distance / $el.width() > 0.3 && (order.order_status == 7) && confirm("确定要删除" + order.ktvinfo.xktvname + " " + (utils.parseDate("yyyy年MM月dd日 hh:mm", new Date(order.starttime * 1000))) + " " + order.members + "人" + order.room_name + "的订单吗？")) {
                        self.vm.deleteOrder(order, $el);
                    };
                    $el.off(".temp");
                };

                $el.on("touchstart.s2d", function(event) {
                    let touch = event.originalEvent.touches[0];
                    startX = touch.pageX;
                    startY = touch.pageY;

                    $el.off(".temp").one("touchmove.s2d.temp", function(event) {
                        let touch = event.originalEvent.changedTouches[0];
                        if (startX - touch.pageX > Math.abs(startY - touch.pageY)) {
                            event.preventDefault();
                            $el.on("touchmove.s2d.temp", touchmoveHandler).one("touchend.s2d.temp touchcancel.s2d.temp", touchendHandler);
                        };
                    });
                });
            },
            update(order) {
                this.order = order;
            },
            unbind() {
                $(this.el).off(".s2d");
            }
        }
    },
    filters: {
        humanDate(order) {
            let date = new Date(order.starttime * 1000);
            let hour = date.getHours();

            return "周" + "日一二三四五六".split("")[date.getDay()] + utils.parseDate("（M月d日）", date) + (hour<5?"凌晨":hour<12?"上午":hour<14?"中午":hour<18?"下午":"晚上") + utils.parseDate("hh:mm", date) + "-" + utils.parseDate("hh:mm", new Date(this.order.endtime * 1000));
        },
        duration(order) {
            return (order.endtime - order.starttime) / 60 / 60;
        },
        statusName(statusCode) {
            return ORDER_STATUS[statusCode];
        },
        backgroundImage(pic) {
            return {
                backgroundImage: "url(" + utils.encodeBackgroundImageUrl(pic) + ")"
            };
        }
    }
}
</script>