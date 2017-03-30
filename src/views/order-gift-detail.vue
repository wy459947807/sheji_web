<template>
    <div class="page-giftorder">
        <figure class="gift-pic" v-adaptive-background="order.sellordergoods_mainpic"></figure>

        <section class="giftorder-detail">
            <h2 class="name">{{order.sellordergoods_name}}</h2>

            <ul class="numbers">
                <li><b class="value">{{order.sellordergoods_num}}</b><small class="label">兑换数量</small></li>
                <li><b class="value">{{order.sellorder_pointdeduction}}</b><small class="label">消费积分</small></li>
                <li><b class="value">{{userPoints}}</b><small class="label">剩余积分</small></li>
            </ul>

            <list-view>
                <div>下单时间：{{order.sellorder_datetime | date 'yyyy年MM月dd日 hh:mm'}}</div>
                <div v-if="order.real">收件人：{{order.sellorder_receiver}}</div>
                <div>手机号：{{order.sellorder_receivecell}}</div>
                <div class="item-address align-top" v-if="order.real"><span class="label">收件地址：</span><span class="value flex">{{order.sellorder_receiveprov + order.sellorder_receivecity + order.sellorder_receivecounty + order.sellorder_receiveaddr}}</span></div>
                <div class="item-address align-top"><span class="label">收件地址：</span><span class="value flex">请注意查收夜点娱乐公众号为您发送的礼品兑换码。</span></div>
            </list-view>

            <ul class="tips">
                <li v-if="!order.real">请注意查收夜点娱乐公众号为您发送的礼品兑换码。</li>
                <li>您可以在 <b>我的订单>礼品订单</b> 中查看订单最新进度。如有任何疑问，请拨打客服热线 <b>4006507351</b>。</li>
            </ul>
        </section>

        <button type="button" class="btn-float" @click="goBack">确定</button>

        <a class="fab" v-link="{name:'list'}"><span>KTV预订</span></a>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.page-giftorder {
    padding-bottom: 110px;
}

.giftorder-detail {
    position: relative;
    padding-top: 30px;

    &:before {
        content: "";
        position: absolute;
        top: -15px;
        left: 0;
        width: 100%;
        height: 15px;
        background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.4));
    }

    .name {
        font-size: 16px;
        color: #fff;
        margin-left: $gap;
        margin-bottom: $gap * 2;
    }

    .numbers {
        display: flex;
        justify-content: space-between;
        margin: 0 $gap;

        li {
            border: 1px solid rgba(255,255,255,0.2);
            text-align: center;
            width: 92px;
            height: 92px;
            border-radius: 50%;
            overflow: hidden;

            .value {
                font-size: 20px;
                font-weight: normal;
                margin-top: 27px;
                margin-bottom: 5px;
                display: block;
            }
            .label {
                font-size: 12px;
                display: block;
            }
        }
    }

    .list-view {
        margin: $gap;

        .item-address {
            .label,
            .value {
                line-height: 1.5;
            }
        }
    }

    .tips {
        margin: $gap;
        line-height: 1.5;

        li {
            margin-bottom: 1em;
            b {
                font-weight: normal;
                color: #fff;
            }
        }
    }
}

.fab {
    position: fixed;
    right: 24px;
    bottom: 70px;
    width: 60px;
    height: 60px;
    background: $primary;
    box-shadow: 0 0 17px rgba(0,0,0,0.4);
    border-radius: 100%;
    font-size: 12px;

    span {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2em;
        line-height: 1.2;
        transform: translate(-50%, -50%);
    }
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
            order: {},

            userPoints: 0,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        data() {
            this.$api.getUserInfo(true).then(function(data) {
                this.userPoints = data.points;

                this.fetch();
            });
        }
    },
    ready() {
        window.scrollTo(0, 0);
    },
    methods: {
        fetch() {
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("gift/orderdetail", {
                orderid: this.$route.params.id
            }).then(function (data) {
                data.data.real = data.data.sellorder_receiver != "";
                this.order = data.data;
                this.status = PAGE_STATUS.COMPLETED;
            }, function(data){
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        goBack() {
            window.history.back();
        }
    }
}
</script>