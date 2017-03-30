
<template>
    <div class="page-gift">
        <figure class="gift-pic" v-adaptive-background="gift.product_mainpic"></figure>

        <div class="gift-content" v-if="gift.product_id">
            <section class="gift-info">
                <span class="points">{{gift.productsale_points}} 积分</span>
                <h2 class="name">{{gift.productsale_name}}</h2>
                <div class="desc">{{{gift.productsale_cont1}}}</div>
            </section>

            <section class="gift-exchange clearfix">
                <span class="points">需要积分 {{gift.productsale_points*order.quantity}}</span>
                <h3 class="title">兑换数量</h3>

                <span class="quantity" v-if="!gift.real">1</span>
                <spin-box v-if="gift.real" :max="maxQuantity" :value.sync="order.quantity"></spin-box>

                <span class="my-points">我的当前积分 {{userPoints}}</span>
            </section>

            <button type="button" class="btn-float" @click="$refs.exchangeModal.open()" v-if="userPoints>=gift.productsale_points">立即兑换</button>
            <button type="button" class="btn-float" disabled v-else>积分不足</button>
        </div>

        <modal id="exchange-modal" :title="gift.productsale_name" :btn-disabled="isInvalidOrder" :submit="submitOrder" btn-text="下一步" v-ref:exchange-modal>
            <div class="gift-quantity">
                <span class="points">需要积分 {{gift.productsale_points*order.quantity}}</span>
                <h3 class="title">兑换数量</h3>

                <spin-box v-if="gift.real" :max="maxQuantity" :value.sync="order.quantity"></spin-box>
                <span class="quantity" v-else>1</span>
            </div>
            <list-view>
                <div v-if="gift.real" @click="$els.name.focus()"><input class="flex" type="text" placeholder="收件人" v-model="order.name" v-el:name></div>
                <div @click="$els.mobile.focus()"><input class="flex" type="tel" placeholder="手机" v-model="order.mobile" maxlength="11" v-el:mobile></div>
                <div class="item-captcha" v-if="!gift.real"><input class="flex" type="number" placeholder="验证码" maxlength="6" v-model="order.captcha"><button type="button" class="btn btn-sendcaptcha" @click="$api.sendCode(order.mobile)">发送验证码</button></div>
                <div class="item-city" v-if="gift.real"><city-selector class="flex" :province.sync="order.province" :city.sync="order.city" :district.sync="order.district"></city-selector></div>
                <div v-if="gift.real" @click="$els.address.focus()"><input class="flex" type="text" placeholder="收件地址" v-model="order.address" v-el:address></div>
            </list-view>
        </modal>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.page-gift {
    margin-bottom: 74px;
}

.gift-pic {
    background: #fff no-repeat 50%;
    background-size: contain;
    height: 185px;
}

.gift-content {
    position: relative;
    padding-top: 1px;

    &:before {
        content: "";
        position: absolute;
        top: -15px;
        left: 0;
        width: 100%;
        height: 15px;
        background: linear-gradient(to bottom, rgba(#000, 0), rgba(#000, 0.4));
    }
}

.gift-info {
    margin: $gap;

    .name {
        font-size: 16px;
        margin-bottom: 10px;
        color: #fff;
    }

    .points {
        font-size: 12px;
        color: #fff;
        line-height: 22px;
        padding: 0 8px;
        border: 1px solid $border;
        border-radius: 11px;
        float: right;
        margin-top: -4px;
    }

    .desc {
        line-height: 1.5;

        br {
            display: none;
        }
        dl,
        dt,
        dd {
            margin: 0;
        }
    }
}

.gift-exchange {
    margin: $gap;
    clear: both;

    .title {
        color: #fff;
        font-size: 1em;
        margin-bottom: 15px;
    }    
    .points {
        float: right;
    }
    .quantity {
        display: block;
        text-align: center;
        font-size: 16px;
        line-height: 46px;
        color: #fff;
        border: 1px solid $border;
        margin-bottom: 15px;
    }
    .my-points {
        float: right;
    }
}

.gift-exchange .quantity,
#exchange-modal .quantity {
    display: block;
    text-align: center;
    font-size: 16px;
    line-height: 46px;
    color: #fff;
    border: 1px solid $border;
    margin-bottom: 15px;
}

#exchange-modal {
    .gift-quantity {
        margin: $gap;
        .title {
            font-size: 1em;
        }
        .points {
            float: right;
        }
        .quantity,
        .spinbox {
            margin-top: 15px;
        }
    }
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
            gift: {},

            order: {
                quantity: 1,
                captcha: "",
                name: "",
                mobile: "",
                province: "",
                city: "",
                district: "",
                address: ""
            },

            userPoints: 0,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        data() {
            this.$api.getUserInfo(true).then(function(data){
                this.userPoints = data.points;
                this.order.name = data.sname;
                this.order.mobile = data.stel;
                this.order.province = data.prov;
                this.order.city = data.city;
                this.order.district = data.county;
                this.order.address = data.address;

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
            this.$api.get("gift/giftdetail", {
                giftid: this.$route.params.id
            }).then(function(data) {
                data.data.real = data.data.productsale_cata3 == "实物";
                this.gift = data.data;
                this.status = PAGE_STATUS.COMPLETED;

                this.$wxShare({
                    title: "用积分就可以兑换［" + this.gift.productsale_name + "］",
                    desc: "我在夜点的积分商城里面看的这个不错哦…",
                    titleTL: "我在夜点的积分商城里面看到［" + this.gift.productsale_name + "］不错哦…",
                    imgUrl: this.gift.product_mainpic
                });
            }, function(data){
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        submitOrder() {
            let requestPromise;
            this.$refs.exchangeModal.setLoading(true);

            if (this.gift.real) {
                requestPromise = this.$api.post("gift/orderreal", {
                    giftid: this.gift.product_id,
                    giftcount: this.order.quantity,
                    sname: this.order.name,
                    stel: this.order.mobile,
                    prov: this.order.province,
                    city: this.order.city,
                    county: this.order.district,
                    address: this.order.address
                });
            } else {
                requestPromise = this.$api.verifyCode(this.order.mobile, this.order.captcha).then(function() {
                    return this.$api.post("gift/ordervirtual", {
                        giftid: this.gift.product_id,
                        giftcount: 1,
                        mobile: this.order.mobile
                    });
                });
            };

            requestPromise.then(function(data) {
                this.$router.go({
                    name: "gift-order",
                    params: {
                        id: data.order_result
                    }
                });
                this.$api.getUserInfo();
            }).catch(function(data) {
                this.$refs.exchangeModal.setLoading(false);
                alert(data.msg || "提交失败");
            });
        }
    },
    computed: {
        maxQuantity() {
            return Math.max(1, Math.floor(this.userPoints / this.gift.productsale_points));
        },
        isInvalidOrder() {
            if (this.gift.real) {
                return !(this.order.quantity > 0 && utils.isMobile(this.order.mobile) && this.order.name != "" && this.order.province != "" && this.order.city != "" && this.order.district != "" && this.order.address != "");
            } else {
                return !(utils.isMobile(this.order.mobile) && utils.isCaptcha(this.order.captcha));
            };
        }
    }
}
</script>