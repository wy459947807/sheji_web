<template>
    <div class="page-user">
        <header class="user-info">
            <a class="btn btn-invite" @click="showInvitePoster=true">邀请好友</a>
            <img class="avatar" :src="user.avatar_url" @click="$refs.editBaseinfoModal.open()">
            <span class="name" @click="$refs.editBaseinfoModal.open()">{{user.display_name}}</span>
            <span class="points">积分 {{user.points}}</span>
        </header>

        <list-view class="has-arrow user-menu">
            <div @click="$refs.editMobileModal.open()"><span class="icon icon-phone"></span>手机<span class="value flex">{{user.mobile}}</span></div>
            <div @click="$refs.editAddressModal.open()"><span class="icon icon-home"></span>收件地址<span class="value flex">{{fullAddress}}</span></div>
            <a v-link="'/order'"><span class="icon icon-order"></span>我的订单<span class="value flex">{{user.order}}</span></a>
            <a v-link="'/user/favorite'"><span class="icon icon-favorite"></span>我的收藏<span class="value flex">{{user.collectionnum}}</span></a>
            <a v-link="'/coupon'"><span class="icon icon-coupon"></span>我的兑酒券<span class="value flex">未使用 {{user.couponnum}}</span></a>
            <a :href="'tel:'+hotline"><span class="icon icon-service"></span>客服热线<span class="value flex">{{hotline}}</span></a>
        </list-view>

        <modal id="edit-baseinfo-modal" title="编辑用户信息" :btn-disabled="isInvalidBaseInfoForm" :submit="updateBaseInfo" v-ref:edit-baseinfo-modal>
            <list-view>
                <a @click="$els.name.focus()"><input type="text" placeholder="姓名" v-model="editBaseInfo.name" maxlength="30" v-el:name></a>
                <div class="item-sex">
                    <input type="radio" id="male" value="1" v-model="editBaseInfo.gender">
                    <label for="male">男</label>
                    <input type="radio" id="female" value="2" v-model="editBaseInfo.gender">
                    <label for="female">女</label>
                </div>
            </list-view>
        </modal>

        <modal id="edit-mobile-modal" title="编辑手机号" :btn-disabled="isInvalidMobileForm" :submit="updateMobile" v-ref:edit-mobile-modal>
            <list-view>
                <div class="item-phone" @click="$els.phone.focus()"><div class="flex"><input type="tel" placeholder="手机" v-model="editMobile.mobile" maxlength="11" v-el:phone></div></div>
                <div class="item-captcha"><input class="flex" type="number" placeholder="验证码" maxlength="6" v-model="editMobile.captcha"><button type="button" class="btn btn-sendcaptcha" @click="$api.sendCode(editMobile.mobile)">发送验证码</button></div>
            </list-view>
        </modal>

        <modal id="edit-address-modal" title="编辑收件地址" :btn-disabled="isInvalidAddressForm" :submit="updateAddress" v-ref:edit-address-modal>
            <list-view>
                <div @click="$els.sname.focus()"><input class="flex" type="text" placeholder="收件人" maxlength="30" v-model="editAddress.name" v-el:sname></div>
                <div class="item-phone" @click="$els.stel.focus()"><input class="flex" type="tel" placeholder="手机" v-model="editAddress.tel" maxlength="11" v-el:stel></div>
                <div class="item-city"><city-selector class="flex" :province.sync="editAddress.prov" :city.sync="editAddress.city" :district.sync="editAddress.county"></city-selector></div>
                <div @click="$els.saddress.focus()"><input class="flex" type="text" placeholder="收件地址" v-model="editAddress.address" v-el:saddress></div>
            </list-view>
        </modal>

        <div class="invite-poster" v-show="showInvitePoster" transition="fade" @click="showInvitePoster=false"></div>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.page-user {
    background: linear-gradient(to bottom, rgba($bg, .3), $bg 170px), url(../img/user-bg.jpg);
    background-repeat: no-repeat;
    background-size: 100% auto;
}

.user-info {
    text-align: center;
    padding-top: 54px;

    .btn-invite {
        width: 70px;
        line-height: 35px;
        border: 1px solid rgba(255,255,255,0.7);
        text-align: center;
        position: absolute;
        top: 20px;
        right: 20px;
    }
    .avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        box-shadow: 0px 2px 6px 0px rgba(0,0,0,0.5);
        margin-bottom: 15px;
    }
    .name {
        display: block;
        height: 1em;
        width: 7em;
        margin: 0 auto;
        font-size: 16px;
        margin-bottom: 10px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
}

.user-menu {
    > * {
        border-bottom-color: $bgDark;
    }
    .value {
        color: #fff;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        text-align: right;

        @media (max-width:320px) {
            width: 130px;
        }
    }
}

.invite-poster {
    background: #DC3846 url(../img/invite-poster.jpg) no-repeat 50% 0;
    background-size: cover;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9;
}
</style>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
            showInvitePoster: false,

            user: {},

            hotline: "4006507351",

            editBaseInfo: {
                name: "",
                gender: 0
            },

            editMobile: {
                mobile: "",
                captcha: ""
            },

            editAddress: {
                name: "",
                prov: "",
                city: "",
                county: "",
                address: ""
            },

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
        if (this.$route.query.fromTabBar) window.scrollTo(0, 0);
    },
    methods: {
        fetch() {
            this.status = PAGE_STATUS.LOADING;

            this.$api.getUserInfo().then(function (data) {
                this.user = data;
                this.editBaseInfo = {
                    name: data.display_name,
                    gender: data.gender
                };
                this.editAddress = {
                    name: data.sname,
                    tel: data.stel,
                    prov: data.prov,
                    city: data.city,
                    county: data.county,
                    address: data.address
                };
                this.status = PAGE_STATUS.COMPLETED;

                this.$wxShare({
                    title: "用夜点，要派对，不排队！想嗨就嗨，无需等待！",
                    desc: "无需下载APP，关注微信公众账号，即可HIGH遍KTV！",
                    titleTL: "用夜点一键预订KTV！想嗨就嗨，无需等待！",
                    link: location.origin + location.pathname + "/share.html?openid=" + data.openid
                });
            }, function(data){
                this.errorMsg = data.msg || "加载失败";
                this.status = PAGE_STATUS.FAILED;
            });
        },
        updateBaseInfo() {
            this.$api.updateUserInfo({
                "display_name": this.editBaseInfo.name,
                "gender": this.editBaseInfo.gender
            }).then(function(data) {
                alert("用户信息更新成功！");
                this.user = data;
                this.$refs.editBaseinfoModal.close();
            }, function(data) {
                alert(data.msg || "更新失败");
            });
        },
        updateMobile() {
            this.$api.verifyCode(this.editMobile.mobile, this.editMobile.captcha).then(function() {
                return this.$api.updateUserInfo({
                    "mobile": this.editMobile.mobile
                });
            }).then(function(data) {
                alert("手机号更新成功！");
                this.mobile = data.mobile;
                this.$refs.editMobileModal.close();
            }).catch(function(data) {
                alert(data.msg || "更新失败");
            });
        },
        updateAddress() {
            this.$api.updateUserInfo({
                "sname": this.editAddress.name,
                "stel": this.editAddress.tel,
                "prov": this.editAddress.prov,
                "city": this.editAddress.city,
                "county": this.editAddress.county,
                "address": this.editAddress.address
            }).then(function(data) {
                alert("收件地址更新成功！");
                this.user = data;
                this.$refs.editAddressModal.close();
            }, function(data) {
                alert(data.msg || "更新失败");
            });
        },
        scanQRCode() {
            wx.scanQRCode({
                needResult: 0,
                scanType: ["qrCode","barCode"],
                success(res) {
                    var result = res.resultStr;
                },
                fail(data) {
                    alert(data.errMsg);
                }
            });
        }
    },
    computed: {
        fullAddress() {
            return this.user.prov ? (this.user.prov + " " + this.user.city + " " + this.user.county + " " + this.user.address) : "";
        },
        isInvalidBaseInfoForm() {
            return !(this.editBaseInfo.name.length > 0 && this.editBaseInfo.gender != 0);
        },
        isInvalidMobileForm() {
            return !(utils.isMobile(this.editMobile.mobile) && utils.isCaptcha(this.editMobile.captcha));
        },
        isInvalidAddressForm() {
            return !(this.editAddress.name != "" && utils.isMobile(this.editAddress.tel) && this.editAddress.prov != "" && this.editAddress.city != "" && this.editAddress.county != "" && this.editAddress.address != "");
        }
    }
}
</script>