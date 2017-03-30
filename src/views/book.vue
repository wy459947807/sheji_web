<template>
    <div class="page-book">
        <div v-if="tcInfo && tcInfo.courses.length && tcInfo.roomtypes.length">
            <section class="section booking-table">
                <div class="days">
                    <table>
                        <td v-for="day in tcInfo.days" :class="{active:bookDay==day}" @click="bookDay=day">{{day.line1}}<em>{{day.line2}}</em></td>
                    </table>
                </div>

                <div class="fake-select" @click="$refs.coursesModal.open()" v-if="bookCourse"><span class="val">{{bookCourse.name}} {{bookCourse.line2}}</span><span class="arrow"></span></div>
                <div class="fake-select disabled" v-else><span class="val">无可选时间段</span><span class="arrow"></span></div>

                <div class="fake-select" @click="$refs.roomtypesModal.open()" v-if="bookRoomType"><span class="val">{{bookRoomType.name}} {{bookRoomType.desc}}</span><span class="arrow"></span></div>
                <div class="fake-select disabled" v-else><span class="val">无可用房型</span><span class="arrow"></span></div>

                <p class="show-price-menu-wrap" v-if="ktv.price_list_pics"><a @click="showPriceMenu=true">查看KTV价格菜单</a></p>
            </section>

            <div class="booking-packages" :class="{loading:loadingPackages}">
                <section class="section section-package section-goldpkg" v-if="goldPackages.length">
                    <h4 class="section-title">最强黄金档</h4>
                    <div class="section-bd">
                        <list-view class="align-top">
                            <li v-for="pkg in goldPackages | limitBy goldpkgLimit" :class="{active:bookPkg==pkg}" @click="bookPkg=pkg">
                                <span class="check"></span>
                                <h5 class="name flex">{{pkg.pre_txt}}{{pkg.name}}</h5>
                                <div class="secrow">
                                    <span v-if="ktv.online_pay.status">
                                        <span class="orig-price">到店价¥{{pkg.price_yd}}</span>
                                        <span class="special-price">在线价<span class="price">¥{{pkg.price_yd_online}}</span></span>
                                    </span>
                                    <span v-else>
                                        <span class="orig-price">原价¥{{pkg.price}}</span>
                                        <span class="special-price">{{pkg.special_pay?"在线付":"夜点价"}}<span>¥{{pkg.price_yd}}</span></span>
                                    </span>
                                </div>
                            </li>
                        </list-view>
                        <div class="more" @click="goldpkgLimit=99" v-if="goldPackages.length>3 && goldpkgLimit==3"><span class="arrow"></span>更多</div>
                        <div class="less" @click="goldpkgLimit=3" v-if="goldpkgLimit==99"><span class="arrow"></span>收起</div>
                    </div>
                </section>

                <section class="section section-coupon" v-if="goldPackages.length&&!hideCoupon">
                    <h2 class="section-title">兑酒券</h2>

                    <div class="section-bd">
                        <list-view>
                            <div class="coupon" @click="$refs.couponModal.open()" :class="{'has-arrow':couponList.length,'penone':!couponList.length}">
                                <div class="flex">{{couponText}}</div>
                            </div>
                        </list-view>
                    </div>
                </section>

                <section class="section section-package section-jsbpkg" v-if="jsbPackages.length">
                    <h4 class="section-title">KTV 套餐</h4>
                    <div class="section-bd">
                        <list-view class="align-top">
                            <li v-for="pkg in jsbPackages | limitBy jsbpkgLimit" :class="{active:bookPkg==pkg}" @click="bookPkg=pkg">
                                <span class="check"></span>
                                <h5 class="name flex">{{pkg.pre_txt}}{{pkg.name}}</h5>
                                <div class="secrow">
                                    <span v-if="ktv.online_pay.status">
                                        <span class="orig-price">到店价¥{{pkg.price_yd}}</span>
                                        <span class="special-price"><span class="price">¥{{pkg.price_yd_online}}</span></span>
                                    </span>
                                    <span v-else>
                                        <span class="orig-price">原价¥{{pkg.price}}</span>
                                        <span class="special-price"><span>¥{{pkg.price_yd}}</span></span>
                                    </span>
                                </div>
                            </li>
                        </list-view>
                        <div class="more" @click="jsbpkgLimit=99" v-if="jsbPackages.length>3 && jsbpkgLimit==3"><span class="arrow"></span>更多</div>
                        <div class="less" @click="jsbpkgLimit=3" v-if="jsbpkgLimit==99"><span class="arrow"></span>收起</div>
                    </div>
                </section>

                <section class="section section-package section-hcpkg" v-if="hcPackages.length">
                    <h4 class="section-title">欢唱</h4>
                    <div class="section-bd">
                        <list-view>
                            <div v-for="pkg in hcPackages | limitBy hcpkgLimit" :class="{active:bookPkg==pkg}" @click="bookPkg=pkg">
                                <span class="check"></span>
                                <h5 class="name flex">{{pkg.name}}</h5>
                            </div>
                        </list-view>
                        <div class="more" @click="hcpkgLimit=99" v-if="hcPackages.length>3 && hcpkgLimit==3"><span class="arrow"></span>更多</span></div>
                        <div class="less" @click="hcpkgLimit=3" v-if="hcpkgLimit==99"><span class="arrow"></span>收起</span></div>
                    </div>
                </section>

                <section class="section section-nopkg" v-if="!goldPackages.length && !jsbPackages.length && !hcPackages.length">
                    <p>无可选套餐</p>
                </section>
            </div>

            <modal id="courses-modal" title="选择时间段" :closeable="false" v-ref:courses-modal>
                <ul>
                    <li v-for="course in tcInfo.courses | orderBy 'weight'" :class="{active:bookCourse==course,disabled:course.expired}" @click="bookCourse=course">{{course.name}} {{course.line2}}</li>
                </ul>
            </modal>

            <modal id="roomtypes-modal" title="选择房间类型" :closeable="false" v-ref:roomtypes-modal>
                <ul>
                    <li v-for="room in tcInfo.roomtypes | orderBy 'weight'" :class="{active:bookRoomType==room}" @click="bookRoomType=room">{{room.name}} {{room.desc}}</li>
                </ul>
            </modal>
        </div>

        <div v-if="bookPkg">
            <section class="section section-times">
                <h2 class="section-title">选择到店时间</h2>

                <div class="section-bd">
                    <ul>
                        <li v-for="time in arrivalTimeList | limitBy arrivalTimeListLimit" :class="{active:time==startTime}" @click="startTime=time"><span>{{time | morrow arrivalTimeList[0]}}</span></li>
                    </ul>

                    <div class="more" @click="arrivalTimeListLimit=99" v-if="arrivalTimeList.length>8 && arrivalTimeListLimit==8"><span class="arrow"></span>更多进场时间</div>
                    <div class="less" @click="arrivalTimeListLimit=8" v-if="arrivalTimeListLimit==99"><span class="arrow"></span>收起</div>
                </div>
            </section>

            <section class="section section-payment" v-if="!bookPkg.huanchang">
                <div class="section-bd">
                     <list-view>
                        <div :class="{'has-arrow':canOnlinePay}" @click="canOnlinePay&&$refs.paymentModal.open()">
                            <div class="title">支付方式</div>
                            <div class="flex val">{{onlinePay ? "在线支付" : "到店支付"}}</div>
                        </div>
                    </list-view>
                </div>
            </section>

            <section class="section section-remark">
                <h2 class="section-title">预定说明</h2>

                <div class="section-bd">
                    <p>预订说明: 通过夜点预订KTV，只需要在夜点提交订单，达到KTV现场支付，即可享受夜点最强黄金档的价格优惠。</p>
                </div>
            </section>

            <section class="section section-tips">
                <h2 class="section-title">小提示</h2>

                <div class="section-bd">
                    <ul v-if="canOnlinePay">
                        <li>有任何问题请拨打夜点客服电话 400-650-7351</li>
                    </ul>
                    <ol v-else>
                        <li v-for="term in terms">{{term}}</li>
                    </ol>
                </div>
            </section>
        </div>

        <div v-if="ktv.price_list_pics&&showPriceMenu">
            <div id="price-menu">
                <header class="hd">
                    <span class="close" @click="showPriceMenu=false"></span>
                    <h4 class="title">KTV 价格菜单</h4>
                </header>
                <div class="bd">
                    <ul class="list">
                        <li v-for="item in ktv.price_list_pics"><div :style="item.pic | backgroundImage" @click="gotoPriceMenuSlides($index)"></div></li>
                    </ul>
                </div>
            </div>

            <simple-slider id="price-menu-slides" :slides="ktv.price_list_pics" v-show="showPriceMenuSlides" @click="showPriceMenuSlides=false" v-ref:price-menu-slides></simple-slider>
        </div>

        <div class="confirm-bar" v-if="price"><span>总计：</span><strong>¥{{price}}</strong></div>
        <button type="button" class="btn-float btn-pay" :class="{mini:price}" @click="submitOrder(true)" v-el:pay-btn v-if="onlinePay">微信支付</button>
        <button type="button" class="btn-float btn-order" :class="{mini:price}" :disabled="cantBook" @click="submitOrder(false)" v-el:submit-btn v-else>提交订单</button>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>

        <modal id="payment-modal" title="选择支付方式" :closeable="false" v-if="bookPkg" v-ref:payment-modal>
            <list-view>
                <div :class="{active:onlinePay}" @click="onlinePay=true">
                    <strong class="flex">在线支付</strong>
                    <span class="price">¥{{bookPkg.price_yd_online}}</span>
                    <span class="check"></span>
                </div>
                <div :class="{active:!onlinePay}" @click="onlinePay=false">
                    <strong class="flex">到店支付</strong>
                    <span class="price">¥{{bookPkg.price_yd}}</span>
                    <span class="check"></span>
                </div>
            </list-view>
        </modal>

        <modal id="coupon-modal" title="选择兑酒券" :closeable="false" :submit="updateCoupon" v-ref:coupon-modal>
            <ul class="coupon-list">
                <li v-for="cp in couponList" :class="{active:coupon==cp}" @click="coupon=cp" :style="{backgroundImage:'url('+(cp.status===0?cp.img:cp.img_disable)+')'}">
                    <span class="check"></span>
                    <div class="content">
                        <h3 class="name">{{cp.name}}</h3>
                        <p class="date">有效期<br>{{cp.start_time | date 'yyyy/MM/dd'}} 至 {{cp.expire_time | date 'yyyy/MM/dd'}}</p>
                    </div>
                </li>
                <li class="none" :class="{active:coupon==couponNone}" @click="coupon=couponNone"><span class="check"></span> 不使用任何兑酒券</li>
            </ul>

            <h4 class="rule-title">兑酒券使用说明</h4>
            <ol class="rule-content">
                <li>在预订KTV的时候选择使用兑酒券，到店后，由前台收银员扫描订单中的二维码，即可确认到店并获得相应数量的酒水。</li>
                <li>兑换酒水的品牌、数量以及有效期以兑酒券标识为准。</li>
                <li>通过兑酒券红包领取的兑酒券，可在领取12小时后使用，有效期14天。</li>
                <li>以任何形式取消订单，兑酒券都将会返还到用户账户，下次预订还可继续使用。</li>
                <li>每位用户每天可使用一张兑酒券。</li>
            </ol>
        </modal>

        <modal id="edit-mobile-modal" title="绑定手机号码" :btn-disabled="isInvalidMobileForm" :submit="updateMobile" v-ref:edit-mobile-modal>
            <list-view>
                <div class="item-phone" @click="$els.phone.focus()"><div class="flex"><input type="tel" placeholder="手机" v-model="editMobile.mobile" maxlength="11" v-el:phone></div></div>
                <div class="item-captcha"><input class="flex" type="number" placeholder="验证码" maxlength="6" v-model="editMobile.captcha"><button type="button" class="btn btn-sendcaptcha" @click="$api.sendCode(editMobile.mobile)">发送验证码</button></a></div>
            </list-view>
        </modal>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";
@import "../scss/rsprite";

.page-book {
    margin-bottom: 54px;

    .section-payment {
        margin-top: -4px;
        .title {
            font-size: 16px;
            color: #fff;
            margin: 0;
        }
        .val {
            text-align: right;
        }
    }

    .section-coupon {
        margin-top: -4px;
    }

    .section-times {
        ul {
            margin: 10px;
            overflow: hidden;
        }
        li {
            float: left;
            width: 25%;
            span {
                display: block;
                margin: 5px;
                text-align: center;
                line-height: 34px;
                background: $bg;
                border-radius: 4px;
                white-space: nowrap;
                color: #fff;
            }
        }
        .active { 
            span {
                background: $primary;
            }
        }
    }

    .section-remark,
    .section-tips {
        .section-bd {
            padding: $gap;
            font-size: 12px;
            color: $grayText;
            line-height: 1.5;
            p {
                margin: 0;
            }
            ol {
                list-style: decimal inside;
            }
        }
    }

    .section-tips {
        margin-top: -4px;
        border-bottom: none;
    }

    .section-remark {
        border-bottom-width: 1px;
    }
}

.booking-table {
    overflow: hidden;
    font-size: 12px;

    .days {
        padding: 0 $gap;
        border-bottom: 1px solid $bg;
        margin-bottom: $gap;

        td {
            text-align: center;
            padding: 14px 0;

            em {
                display: block;
                font-style: normal;
                margin-top: 3px;
            }
        }
        .active {
            background: $primary;
        }
    }

    .fake-select {
        display: flex;
        align-items: center;
        background: $bg;
        border: none;
        border-radius: 3px;
        height: 40px;
        color: #fff;
        overflow: hidden;
        text-align: center;
        font-size: 14px;
        box-shadow: 0 1px 2px rgba(#000, 0.3);
        margin: 0 $gap $gap;

        .val {
            flex: 1;
        }

        .arrow {
            height: 100%;
            width: 30px;
            background: $primary;

            &:after {
                content: '';
                display: inline-block;
                width: 7px;
                height: 7px;
                border-bottom: 1px solid #fff;
                border-right: 1px solid #fff;
                transform: rotate(45deg);
                margin-top: 14px;
            }
        }

        &.disabled {
            .val,
            .arrow {
                opacity: 0.5;
            }
        }
    }

    .show-price-menu-wrap {
        text-align: center;
        margin-bottom: $gap;

        a {
            color: $primary;
            border-bottom: 1px solid;
        }
    }
}

.booking-packages { 
    &.loading {
        pointer-events: none;
        opacity: 0.5;
    }
}

.section-package {
    .name {
        font-size: 14px;
        line-height: 1.4;
    }
    .secrow {
        margin-left: 10px;
        text-align: center;
        width: 54px;
        align-self: center;
        .orig-price {
            display: block;
            font-size: 9px;
            text-decoration: line-through;
            color: $grayText;
            margin-bottom: 3px;
        }
        .special-price {
            color: #fff;
            span {
                margin-top: 2px;
                font-size: 16px;
                display: block;
            }
        }
    }
}

.section-goldpkg {
    .special-price {
        color: $primary;
    }
}

.section-nopkg {
    text-align: center;
    margin: 100px 0;
    opacity: .5;
    background: none;
}

.more,
.less {
    text-align: center;
    line-height: 40px;
    margin-bottom: 10px;

    .arrow {
        display: inline-block;
        width: 21px;
        height: 21px;
        background: $primary;
        border-radius: 50%;
        vertical-align: -5px;
        margin-right: 7px;

        &:after {
            content: '';
            display: block;
            margin: 5px 0 0 7px;
            width: 6px;
            height: 6px;
            border-bottom: 1px solid #fff;
            border-right: 1px solid #fff;
            transform: rotate(45deg);
        }
    }
}
.less {
    .arrow:after {
        margin-top: 7px;
        transform: rotate(-135deg);
    }
}

#coupon-modal {
    .coupon-list {
        color: #fff;
        margin-top: 10px;
        margin-bottom: 20px;

        li {
            position: relative;
            background: no-repeat 50%;
            background-size: contain;
            height: 110px;
            overflow: hidden;

            .content {
                text-align: right;
                margin-top: 30px;
                margin-right: 15px;
                transform-origin: 100% 50%;
                transform: scale(.9);
                font-size: 12px;
            }

            .name {
                margin-bottom: 5px;
                font-size: 1em;
            }

            .date {
                margin: 0 0 5px;
                line-height: 1.5;
            }
        }
        .active {
            .check {
                width: 26px;
                height: 26px;
                background: $primary;
                border-radius: 50%;
                position: absolute;
                top: 0;
                right: 0;
                &:after {
                    content: '';
                    border: 2px solid #000;
                    border-top-width: 0;
                    border-right-width: 0;
                    width: 13px;
                    height: 7px;
                    transform: rotate(-45deg);
                    float: left;
                    margin: 6px 0 0 5px;
                }
            }
        }
        .none {
            font-size: 12px;
            text-align: center;
            margin-top: 10px;
            height: auto;

            .check {
                display: inline-block;
                vertical-align: -2px;
                border: 1px solid #fff;
                background: rgba(#fff, 0.5);
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 10px;
            }

            &.active {
                .check {
                    position: static;
                    &:after {
                        content: '';
                        border: 1px solid #fff;
                        border-top-width: 0;
                        border-right-width: 0;
                        width: 7px;
                        height: 4px;
                        transform: rotate(-45deg);
                        float: left;
                        margin: 2px 0 0 2px;
                    }
                }
            }
        }
    }
    .rule-title {
        margin: 10px 30px;
        font-size: 1em;
    }
    .rule-content {
        list-style: inside decimal;
        color: #fff;
        margin: 0 30px;
        font-size: 12px;
        margin-bottom: 1em;
        li {
            margin-bottom: .5em;
            line-height: 1.4;
        }
    }
}

.confirm-bar {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 1;
    width: 100%;
    height: 54px;
    line-height: 54px;
    font-size: 16px;
    background: $grayBg;
    box-shadow: 0 -3px 5px rgba(#000, 0.2);
    padding-left: 20px;

    span {
        font-size: 12px;
        vertical-align: 2px;
    }
    strong {
        font-size: 18px;
    }
}

.btn-float.mini {
    left: auto;
    right: 0;
    width: 38.2%;
    box-shadow: -3px 0 5px rgba(#000, 0.2);
}

#price-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $bgLight;
    z-index: 7;

    .hd {
        font-size: 16px;
        border-bottom: 1px solid $bg;
        line-height: 1;
        padding: $gap;

        .close {
            position: absolute;
            top: 0;
            right: 0;
            width: 45px;
            height: 45px;

            &:before,
            &:after {
                content: "";
                position: absolute;
                top: 50%;
                left: 50%;
                width: 40%;
                height: 1px;
                background: #fff;
                transform: translate3d(-50%, -50%, 0) rotate(45deg);
            }
            &:after {
                transform: translate3d(-50%, -50%, 0) rotate(-45deg);
            }
        }
    }
    .bd {
        position: absolute;
        top: 45px;
        right: 0;
        bottom: 0;
        left: 0;
        @include scrollable;
        overflow: auto;
    }
    .list {
        @include clearfix;
        margin: $gap / 2;
        li {
            float: left;
            width: 50%;
        }
        div {
            margin: $gap / 2;
            background: no-repeat 50%;
            background-size: cover;
            &:before {
                content: "";
                display: block;
                padding-bottom: 100%;
            }
        }
    }
}

#price-menu-slides {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    background: rgba(#000, .9);
    z-index: 8;

    .slide {
        background-size: contain;
    }

    .slider-indicators {
        display: none;
    }
}
</style>

<script>
import utils from "../libs/utils";
import store from "../libs/store";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        var couponNone = {
            id: 0,
            name: "不使用任何兑酒券"
        };

        return {
            ktv: {},
            now: null,
            lastorder: null,
            terms: [],

            tcInfo:  null,
            bookDay: null,
            bookCourse: null,
            bookRoomType: null,
            bookPkg: null,
            coupon: couponNone,
            canOnlinePay: false,
            onlinePay: false,

            loadingPackages: false,
            packages: [],
            goldpkgLimit: 3,
            jsbpkgLimit: 3,
            hcPackages: [],
            hcpkgLimit: 3,

            arrivalTimeListStart: null,
            arrivalTimeList: [],
            arrivalTimeListLimit: 8,

            startTime: null,

            hideCoupon: false,
            couponList: [],
            couponText: "",
            couponNone: couponNone,

            userMobile: "",
            editMobile: {
                mobile: "",
                captcha: ""
            },

            showPriceMenu: false,
            showPriceMenuSlides: false,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        canActivate() {
            if (process.env.NODE_ENV !== "production") {
                if (store.bookdata) {
                    localStorage.setItem("bookdata", JSON.stringify(store.bookdata));
                } else {
                    let localdata = localStorage.getItem("bookdata");
                    if (localdata) store.bookdata = JSON.parse(localdata);
                }
            }

            return !!store.bookdata;
        },
        data() {
            this.now = new Date(store.bookdata.now);
            this.ktv = store.bookdata.ktv;
            delete store.bookdata;

            this.lastorder = this.ktv.lastofjiedan ? this.ktv.lastofjiedan.time : null;
            this.terms = this.ktv.taocaninfo.tiaokuan.map(term => term.name);
            this.hideCoupon = store.hideCoupon === this.ktv.xktvid;

            let todayDateString = this.now.toDateString();
            let yesterdayDateString = new Date(this.time - 86400000).toDateString();
            let daysText = "日一二三四五六".split("");
            let taocaninfo = this.taocaninfo = this.ktv.taocaninfo;

            this.tcInfo = {
                days: taocaninfo.days.map((day, idx) => {
                    let date = new Date(day);
                    let dateString = date.toDateString();

                    return {
                        day: date.getDay(),
                        line1: todayDateString == dateString ? "今天" : yesterdayDateString == dateString ? "昨天" : "周" + daysText[date.getDay()],
                        line2: day.substring(5),
                        date: day,
                        id: idx,
                        today: todayDateString == dateString,
                        yesterday: yesterdayDateString == dateString
                    };
                }),
                courses: taocaninfo.course.map(course => {
                    this.parseCourse(course);

                    return course;
                }),
                roomtypes: taocaninfo.roomtype.map(room => {
                    room.weight = parseInt(room.desc);

                    return room;
                }).sort((a, b) => {
                    return b.show == a.show ? parseInt(a.desc) - parseInt(b.desc) : b.show - a.show;
                })
            };
            this.tcInfo._courses = this.tcInfo.courses;
            this.tcInfo._roomtypes = this.tcInfo.roomtypes;

            this.bookRoomType = this.tcInfo.roomtypes.filter(room => room.show)[0];

            if (this.$route.query.day) {
                this.bookDay = this.tcInfo.days[taocaninfo.days.indexOf(this.$route.query.day)] || this.tcInfo.days[0];
            } else {
                this.bookDay = this.tcInfo.days[0];
            }

            if (this.bookDay == this.tcInfo.days[0] && !this.filteredCourses.filter(course => !course.expired).length) {
                this.tcInfo.days.shift();
                this.bookDay = this.tcInfo.days[0];
            }

            this.updatePackages();

            this.$api.getUserInfo(true).then(function(data) { 
                this.userMobile = data.mobile;

                if (this.ktv.sjq && !this.hideCoupon) {
                    return this.fetchCouponList();
                } else {
                    return true;
                }
            }).then(function() {
                this.status = PAGE_STATUS.COMPLETED;
            });
        }
    },
    ready() {
        window.scrollTo(0, 0);
    },
    methods: {
        updatePackages: utils.debounce(function() {
            if (this.loadingPackages || !this.bookCourse || !this.bookRoomType) return false;

            let startTime;

            if (this.bookDay.yesterday) {
                startTime = this.nowTime;
            } else if (this.bookDay.today) {
                if (this.bookCourse.crossday == 2) {
                    startTime = utils.minTime(this.nowTime, this.bookCourse.starttime);
                } else {
                    startTime = utils.maxTime(this.nowTime, this.bookCourse.starttime);
                }
            } else {
                startTime = this.bookCourse.starttime;
            }

            let startMinute = parseInt(startTime.split(":")[1]);
            if (startMinute > 30) {
                startMinute = 30;
            } else if (startMinute < 30) {
                startMinute = 0;
            }
            this.arrivalTimeListStart = startTime.split(":")[0] + ":" + utils.padZero(startMinute);

            let maxHours = utils.diffTime(this.arrivalTimeListStart, this.bookCourse.endtime);
            let packages = [];

            if (maxHours) {
                for (let hours = 1; hours <= maxHours; hours++) {
                    packages.push({
                        name: "欢唱" + hours + "小时",
                        duration: hours,
                        huanchang: true
                    });
                }

                packages.push({
                    name: "欢唱至该场次结束",
                    duration: 0,
                    huanchang: true
                });
            }
            this.hcPackages = packages;

            this.loadingPackages = true;
            this.$api.get("booking/gettaocanlist", {
                days: this.bookDay.id,
                course: this.bookCourse ? this.bookCourse.id : -1,
                roomtype: this.bookRoomType.id,
                ktvid: this.ktv.xktvid
            }).then(function({data}) {
                this.packages = data.list.sort((a, b) => b.show - a.show);
                this.bookPkg = data.total ? this.packages[0] : this.hcPackages[0];
                this.loadingPackages = false;
            }, function(data) {
                alert(data.msg || "获取套餐信息失败");
                this.bookPkg = null;
                this.loadingPackages = false;
            });
        }, 200),
        updateArrivalTime() {
            if (!this.bookPkg) return;

            let bookCourse = this.bookCourse;
            let timeList = [];
            let timeRange = [];
            let startTime = this.arrivalTimeListStart;
            let endTime;

            if (bookCourse.yesterday && bookCourse.crossday) {
                let date = new Date(this.bookDay.date);
                date.setDate(date.getDate() + 1);
                this.bookDay.date = date.toISOString();
            }

            this.canOnlinePay = (!this.bookPkg.huanchang && this.ktv.online_pay.status) || this.bookPkg.special_pay;
            this.onlinePay = this.canOnlinePay;

            if (this.lastorder) {
                endTime = this.getEarlierTime(this.lastorder, bookCourse.starttime, bookCourse.endtime);

                if (endTime == bookCourse.endtime) {
                    endTime = utils.adjustTime(bookCourse.endtime, -1);
                } else if (endTime == this.lastorder && utils.diffTime(endTime, bookCourse.endtime) <= 0.5) {
                    endTime = utils.adjustTime(endTime, 0, -30);
                }
            } else {
                endTime = utils.adjustTime(bookCourse.endtime, -1);
            }

            let newEndTime = this.bookPkg.duration ? utils.adjustTime(endTime, -this.bookPkg.duration + 1) : endTime;

            // newEndTime 不在套餐时间段内，也不等于结束时间 || newEndTime 等于开始时间
            if ((!utils.isBetweenTime(newEndTime, startTime, endTime) && newEndTime != endTime) || newEndTime == startTime) {
                timeList.push(startTime);
            } else {
                endTime = newEndTime;
                if (utils.isBeforeTime(startTime, endTime)) {
                    timeRange.push({
                        start: startTime,
                        end: endTime
                    });
                } else {
                    timeRange.push({
                        start: startTime,
                        end: "24:00"
                    }, {
                        start: "00:00",
                        end: endTime
                    });
                };

                timeRange.forEach(function(range){
                    let times = [];
                    let [startHour, startMinute] = range.start.split(":").map(n => parseInt(n));
                    let [endHour, endMinute] = range.end.split(":").map(n => parseInt(n));

                    for (let hour = startHour; hour <= endHour; hour++) {
                        let strHour = utils.padZero(hour);
                        times.push(strHour + ":00", strHour + ":30");
                    }

                    if (startMinute == 30) times.shift();
                    if (endHour == 24) {
                        times.pop();
                        times.pop();
                    } else if (endMinute < 30) {
                        times.pop();
                    }

                    timeList = timeList.concat(times);
                });
            }

            this.arrivalTimeList = timeList;
            this.startTime = timeList[0];
        },
        fetchCouponList() {
            return this.$api.get("coupon/availablelist").then(function(data) {
                if (data.total){
                    let list = data.list;
                    list.sort(function(a, b) {
                        return a.count == b.count ? a.expire_time - b.expire_time : b.count - a.count;
                    });
                    this.couponText = "已选择：" + list[0].name;
                    this.couponList = list;
                    this.coupon = list[0];

                } else {
                    this.couponText = data.wrong_msg || "无";
                }
            }, function(){
                this.couponText = "获取失败";
            });
        },
        updateMobile() {
            this.$api.verifyCode(this.editMobile.mobile, this.editMobile.captcha).then(function() {
                return this.$api.updateUserInfo({
                    mobile: this.editMobile.mobile
                });
            }).then(function(data) {
                alert("手机号绑定成功！");
                this.userMobile = data.mobile;
                this.$refs.editMobileModal.close();

                if (this.waitSubmitOrder) {
                    this.submitOrder(this.waitSubmitOrder.onlinePay);
                    this.waitSubmitOrder = null;
                }
            }).catch(function(data) {
                alert(data.msg || "绑定失败");
            });
        },
        updateCoupon() {
            this.couponText = this.coupon.id == 0 ? this.coupon.name : "已选择：" + this.coupon.name;
            this.$refs.couponModal.close();
        },
        submitOrder(onlinePay) {
            if (!this.userMobile) {
                this.$refs.editMobileModal.open();
                this.waitSubmitOrder = {
                    onlinePay: onlinePay
                };
                return;
            }

            let btn = onlinePay ? this.$els.payBtn : this.$els.submitBtn;
            let startDate = new Date(this.bookDay.date);
            let [startHour, startMinute] = this.startTime.split(":").map(n => parseInt(n));
            let [endHour, endMinute] = this.endTime.split(":").map(n => parseInt(n));
            startDate.setHours(startHour, startMinute);

            if (this.bookCourse.crossday == 2 || utils.isBeforeTime(this.startTime, this.bookCourse.starttime)) {
                startDate.setDate(startDate.getDate() + 1);
            }

            let endDate = new Date(this.bookDay.date);
            endDate.setHours(endHour, endMinute);
            if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

            let params = {
                ktvid: this.ktv.xktvid,
                roomtype: this.bookRoomType.id,
                starttime: utils.parseDate("yyyy-MM-dd hh:mm:ss", startDate),
                endtime: utils.parseDate("yyyy-MM-dd hh:mm:ss", endDate),
                couponid: this.coupon.id,
                taocantype: this.bookPkg.huanchang ? 1 : 0,
                taocanid: this.bookPkg.huanchang ? "" : this.bookPkg.id,
                onlinepay: onlinePay ? 1 : 0
            };

            btn.disabled = true;

            this.$api.post("booking/submitorder_new", params).then(function(data) {
                let orderId = data.order_code;

                if (onlinePay) {
                    this.$api.wechatPay(orderId).then(function(data) {
                        this.$router.replace({
                            name: "book-result",
                            params: {
                                id: orderId
                            }
                        });
                    }, function(data) {
                        alert(data.msg || "支付失败");
                        this.$router.replace({
                            name: "book-result",
                            params: {
                                id: orderId
                            }
                        });
                    });
                } else {
                    this.$router.replace({
                        name: "book-result",
                        params: {
                            id: orderId
                        }
                    });
                }

                trak.event({
                    category: "Order",
                    action: "Order",
                    date: data
                });
            }, function(data) {
                alert(data.msg || "预订失败");
                btn.disabled = false;
            });
        },
        isTomorrow(time, start, end) {
            return utils.isBeforeTime(start, end) && utils.isBeforeTime(time, start);
        },
        getEarlierTime(time, starttime, endtime) {
            if (this.isTomorrow(time, starttime, endtime)) {
                // 同一天，但 time 是次日
                return utils.maxTime(endtime, time);
            } else if (utils.isBeforeTime(starttime, time) && utils.isBeforeTime(endtime, time)) {
                // 不是同一天，但 time 在今天
                return utils.maxTime(endtime, time);
            } else {
                return utils.minTime(endtime, time);
            }
        },
        parseCourse(course) {
            course.expired = false;
            course.weight = parseInt(course.starttime.time) + (course.starttime.ciri ? 24 : 0);
            course.crossday = course.starttime.ciri + course.endtime.ciri;
            course.starttime = course.starttime.time;
            course.endtime = course.endtime.time;

            if (course.crossday == 2) {
                course.line2 = "次日" + course.starttime + "-" + course.endtime;
            } else if (course.crossday == 1) {
                course.line2 = course.starttime + "-次日" + course.endtime;
            } else {
                course.line2 = course.starttime + "-" + course.endtime;
            }
        },
        gotoPriceMenuSlides(index) {
            this.$refs.priceMenuSlides.go(index, true);
            this.showPriceMenuSlides = true;
        }
    },
    computed: {
        isInvalidMobileForm() {
            return !(utils.isMobile(this.editMobile.mobile) && utils.isCaptcha(this.editMobile.captcha));
        },
        endTime() {
            if (this.bookPkg.huanchang) {
                return this.bookPkg.duration === 0 ? this.bookCourse.endtime : utils.adjustTime(this.startTime, this.bookPkg.duration);
            } else {
                if (this.bookPkg.type === 0) {
                    return this.bookCourse.endtime;
                } else {
                    return utils.minTime(utils.adjustTime(this.startTime, this.bookPkg.longtime), this.bookCourse.endtime);
                }
            }
        },
        orderMeta() {
            let date = new Date(this.bookDay.date);
            let duration = utils.diffTime(this.startTime, this.endTime);

            if (this.bookCourse.crossday == 2 || utils.isBeforeTime(this.startTime, this.bookCourse.starttime)) {
                date.setDate(date.getDate() + 1);
            }

            if (this.bookPkg.huanchang) {
                if (duration > this.bookPkg.duration && this.bookPkg.duration > 0) duration = this.bookPkg.duration;
            }

            return (utils.parseDate("yyyy年MM月dd日", date)) + " " + this.startTime + "-" + this.endTime + " 欢唱" + duration + "小时 " + this.bookRoomType.name + "（" + this.bookRoomType.desc + "）";
        },
        price() {
            if (!this.bookPkg || this.bookPkg.huanchang) {
                return false;
            } else {
                return (this.ktv.online_pay.status && this.onlinePay) ? this.bookPkg.price_yd_online : this.bookPkg.price_yd;
            }
        },
        nowTime() {
            return utils.padZero(this.now.getHours()) + ":" + utils.padZero(this.now.getMinutes());
        },
        filteredCourses() {
            if (this.bookDay.today) {
                return this.tcInfo.courses.filter(course => !course.expired);
            } else {
                return this.tcInfo.courses;
            }
        },
        cantBook() {
            return !this.bookCourse || !this.bookRoomType || !this.bookPkg;
        },
        goldPackages() {
            return this.packages.filter(pkg => pkg.hjd);
        },
        jsbPackages() {
            return this.packages.filter(pkg => !pkg.hjd);
        }
    },
    filters: {
        morrow(time, starttime) {
            return (utils.isBeforeTime(time, starttime) ? "次日" : "") + time;
        }
    },
    watch: {
        bookDay(value) {
            let isToday = value.today;
            let isYesterday = value.yesterday;

            this.tcInfo.courses = this.tcInfo._courses.map(course => {
                if (isYesterday) {
                    course.expired = !course.crossday;
                } else if (isToday) {
                    if (course.crossday) {
                        course.expired = false;
                    } else {
                        course.expired = !utils.isBeforeTime(this.nowTime, utils.adjustTime(course.endtime, -1));
                    }
                } else {
                    course.expired = false;
                }
                return course;
            });
            this.bookCourse = this.filteredCourses[0];

            this.updatePackages();
        },
        bookCourse: "updatePackages",
        bookRoomType: "updatePackages",
        bookPkg: "updateArrivalTime"
    }
}
</script>