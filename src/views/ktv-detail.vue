<template>
    <div class="page-ktvdetail">
        <section class="slides">
            <simple-slider :slides="ktv.piclist | formatSlides"></simple-slider>
        </section>

        <section class="baseinfo" v-if="ktv.xktvid">
            <div class="actions">
                <a class="favorite" :class="{added: favorite}" @click="doFavorite"></a>
                <a class="share" @click="showShareLayer=true"></a>
            </div>
            <h2 class="name">{{ktv.xktvname}}</h2>
            <div class="meta">
                <span class="rating"><span class="full"></span><span class="stars" :style="{width:ktv.rate*20+'%'}"></span></span>
                <span class="price" v-if="ktv.price">人均：¥{{ktv.price}}</span>
            </div>

            <ul class="ranklist">
                <li><span class="icon icon-decoration"></span><span class="text">环境 {{ktv.DecorationRating.toFixed(1)}}</span></li>
                <li><span class="icon icon-sound"></span><span class="text">音效 {{ktv.SoundRating.toFixed(1)}}</span></li>
                <li><span class="icon icon-service"></span><span class="text">服务 {{ktv.ServiceRating.toFixed(1)}}</span></li>
                <li><span class="icon icon-food"></span><span class="text">美食 {{ktv.FoodRating.toFixed(1)}}</span></li>
            </ul>

            <list-view class="has-arrow info-list">
                <a :href="'tel:'+ktv.tel"><span class="icon icon-phone-red"></span><div class="flex">{{ktv.telephone}}</div></a>
                <div class="item-address" @click="$openMap(ktv)"><span class="icon icon-location-red"></span><span class="value flex">{{ktv.address}}</span></div>
            </list-view>

            <list-view class="has-arrow info-list" v-if="ktv.taocan.status||ktv.sjq.status||ktv.online_pay.status||ktv.miandan.status">
                <div class="event align-top" v-if="ktv.taocan.status" @click="showEventsLayer=true">
                    <span class="icon"><span class="mark mark-dang"></span></span>
                    <div class="flex">
                        <h4 class="title">{{ktv.taocan.title}}</h4>
                        <p class="desc">{{ktv.taocan.desc}}</p>
                    </div>
                </div>
                <div class="event align-top" v-if="ktv.sjq.status" @click="showEventsLayer=true">
                    <span class="icon"><span class="mark mark-quan"></span></span>
                    <div class="flex">
                        <h4 class="title">{{ktv.sjq.title}}</h4>
                        <p class="desc">{{ktv.sjq.desc}}</p>
                    </div>
                </div>
                <div class="event align-top" v-if="ktv.online_pay.status" @click="showEventsLayer=true">
                    <span class="icon"><span class="mark mark-fu"></span></span>
                    <div class="flex">
                        <h4 class="title">{{ktv.online_pay.title}}</h4>
                        <p class="desc">{{ktv.online_pay.desc}}</p>
                    </div>
                </div>
                <div class="event align-top" v-if="ktv.miandan.status" @click="showEventsLayer=true">
                    <span class="icon"><span class="mark mark-mian"></span></span>
                    <div class="flex">
                        <h4 class="title">{{ktv.miandan.title}}</h4>
                        <p class="desc">{{ktv.miandan.desc}}</p>
                    </div>
                </div>
                <div class="event align-top" v-if="ktv.halloween.status" @click="showEventsLayer=true">
                    <span class="icon"><span class="mark mark-halloween"></span></span>
                    <div class="flex">
                        <h4 class="title">{{ktv.halloween.title}}</h4>
                        <p class="desc">{{ktv.halloween.desc}}</p>
                    </div>
                </div>
            </list-view>
        </section>

        <div class="store-info" v-if="ktv.xktvid">
            <h3>商户信息</h3>
            <p class="description">{{ktv.description}}</p>

            <ul class="services">
                <li v-for="device in ktv.devices"><span class="iconbox"><span class="icon" :class="'icon-'+device.toLowerCase()"></span></span><span class="text">{{device | deviceName}}</span></li>
            </ul>
        </div>

        <section class="business" v-if="ktv.openhours">
            <span class="openhours">营业时间 周一至周日 {{ktv.openhours}}</span>
            <span class="responsetime">平均等待时间：{{ktv.responsetime}}分钟</span>
        </section>

        <list-view class="feedback" v-if="ktv.xktvid">
            <div @click="$refs.feedbackModal.open()"><span class="icon icon-feedback"></span><div class="flex">纠错</div></div>
        </list-view>

        <button type="button" class="btn-float btn-book" @click="goBook" v-if="serviceAvailable">立即预订</button>
        <a :href="'tel:'+ktv.telephone" class="btn-float" @click="sendCallCenterMessage" v-else>电话预定</a>

        <div id="events-layer" class="flash-message" v-if="showEventsLayer" transition="fade" v-el:events-layer>
            <div class="flash-message-dialog">
                <ul class="event-list">
                    <li v-if="ktv.halloween.status">
                        <h4>{{ktv.halloween.title}}</h4>
                        <ul :class="{multi:ktv.halloween.list.length>1}">
                            <li v-for="rule in ktv.halloween.list">{{rule.content}}</li>
                        </ul>
                    </li>
                    <li v-if="ktv.miandan.status">
                        <h4>{{ktv.miandan.title}}</h4>
                        <ul :class="{multi:ktv.miandan.list.length>1}">
                            <li v-for="rule in ktv.miandan.list">{{rule.content}}</li>
                        </ul>
                    </li>
                    <li v-if="ktv.taocan.status">
                        <h4>{{ktv.taocan.title}}</h4>
                        <ul :class="{multi:ktv.taocan.list.length>1}">
                            <li v-for="rule in ktv.taocan.list">{{rule.content}}</li>
                        </ul>
                    </li>
                    <li v-if="ktv.sjq.status">
                        <h4>{{ktv.sjq.title}}</h4>
                        <ol :class="{multi:ktv.sjq.list.length>1}">
                            <li v-for="rule in ktv.sjq.list">{{rule.content}}</li>
                        </ol>
                    </li>
                    <li v-if="ktv.online_pay.status">
                        <h4>{{ktv.online_pay.title}}</h4>
                        <ol :class="{multi:ktv.online_pay.list.length>1}">
                            <li v-for="rule in ktv.online_pay.list">{{rule.content}}</li>
                        </ol>
                    </li>
                    <li v-if="ktv.taocan.status">
                        <h4>{{ktv.yudingshuoming.title}}</h4>
                        <ul>
                            <li>{{ktv.yudingshuoming.content}}</li>
                        </ul>
                    </li>
                </ul>
                <button type="button" class="btn" @click="showEventsLayer=false">确定</button>
            </div>
        </div>

        <a class="feb" @click="$handleLink('/wechat_ktv/home/event/enter', '兑酒券疯抢中')"></a>

        <modal id="favorite-modal" :closeable="false" v-ref:favorite-modal>
            <span class="icon icon-favorite"></span>
            <p>{{ktv.xktvname}}</p>
            <p v-show="favorite">已添加至 <a>我的收藏</a></p>
            <p v-else>已取消收藏</p>
        </modal>

        <modal id="feedback-modal" title="纠错" :btn-disabled="selectedErrors.length==0" :submit="submitFeedback" btn-text="提交" v-ref:feedback-modal>
            <list-view>
                <li v-for="error in feedbackErrors" :class="{active:error.selected==true}" @click="error.selected=!error.selected"><div class="flex">{{error.msg}}</div><span class="check"></span></li>
            </list-view>
        </modal>

        <div id="share-ktv" v-if="showShareLayer" @click="showShareLayer=false"><div class="tip"></div></div>

        <flash-message v-ref:flash-message></flash-message>

        <loading v-if="status==PAGE_STATUS.LOADING"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";
@import "../scss/rsprite";

.page-ktvdetail {
    margin-bottom: 54px;
    background: $bgLight;

    .slides {
        position: relative;
        min-height: 200px;
        max-height: 450px;
        background: $bg url(../img/xktv-logo.png) no-repeat 50%;
        background-size: 70px 70px;

        &:before {
            content: "";
            display: block;
            padding-top: 53.33%;
        }

        .simple-slider {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }

    .baseinfo {
        margin: $gap;

        .actions {
            float: right;
            margin-top: 5px;

            a {
                display: inline-block;
                width: 26px;
                height: 26px;
                background: no-repeat 50%;
                background-size: contain;

                + a {
                    margin-left: 15px;
                }
            }

            .favorite {
                background-image: url(../img/icons/icon-favorite-red.svg);

                &.added {
                    background-image: url(../img/icons/icon-favorite-filled-red.svg);
                }
            }
            .share {
                background-image: url(../img/icons/icon-share.svg);
            }
        }

        .name {
            font-size: 16px;
            color: #fff;
            min-height: 1em;
            margin-bottom: 10px;
        }

        .meta {
            margin-bottom: $gap;
        }

        .rating {
            vertical-align: -1px;
        }

        .price {
            color: $grayText;
            font-size: 12px;
        }

        .ranklist {
            margin: 0 -15px;
            padding: 10px 5px;
            clear: both;
            background: $bg;
            font-size: 12px;
            @include clearfix;

            li {
                text-align: center;
                width: 25%;
                float: left;
            }
            .icon {
                width: 22px;
                height: 22px;
                vertical-align: middle;
                margin-right: 5px;
                background: no-repeat 50%;
                background-size: contain;
                opacity: 0.5;
            }
            .text {
                display: inline-block;
                vertical-align: middle;
            }
            .icon-decoration { background-image: url(../img/icons/ratingicon-decoration.svg); }
            .icon-sound { background-image: url(../img/icons/ratingicon-sound.svg); }
            .icon-service { background-image: url(../img/icons/ratingicon-service.svg); }
            .icon-food { background-image: url(../img/icons/ratingicon-food.svg); }
        }

        .info-list {
            color: $grayText;
            margin-left: -$gap;
            margin-right: -$gap;
            font-size: 12px;
            border-bottom: 5px solid $bg;

            > * {
                &:last-child {
                    border-bottom: none;
                }
            }

            a {
                color: $grayText;
            }

            .item-address {
                .value {
                    @include ellipsis;
                }
            }

            .event {
                .icon {
                    opacity: 1;
                    .mark {
                        width: 22px;
                        height: 22px;
                        line-height: 22px;
                    }
                }
            }
        }
    }

    .store-info {
        margin: $gap;
        h3 {
            font-size: 16px;
            font-weight: normal;
            margin-bottom: .5em;
        }
        .description {
            line-height: 1.5;
            margin: 0 0 20px;
            font-size: 12px;
            color: $grayText;
        }

        .services {
            display: table;
            width: 100%;
            margin-bottom: 20px;

            li {
                float: left;
                width: 33.33%;
                margin-bottom: 10px;
            }
            .iconbox {
                display: inline-block;
                width: 28px;
                height: 28px;
                vertical-align: middle;
                background: $bg;
                border-radius: 50%;
                margin-right: 7px;
            }
            .text {
                font-size: 12px;
            }
            .icon {
                display: block;
                width: 16px;
                height: 16px;
                background: no-repeat 50%;
                background-size: contain;
                opacity: 0.5;
                margin: 6px auto 0;
            }

            $icons: 'wifi', 'wirelessmicrophones', 'parking', 'themerooms', 'xktv', 'bathroom', 'yedianpad', 'buffet';
            // 'tm', 'zxgy', 'sjdg', 'zqss';
            @each $icon in $icons {
                .icon-#{$icon} { background-image: url(../img/icons/serviceicon-#{$icon}.svg); }
            }
        }
    }

    .business {
        border-top: 1px solid $bg;
        border-bottom: 1px solid $bg;
        line-height: 52px;
        overflow: hidden;
        text-align: center;
        font-size: 12px;
        margin-bottom: 20px;

        .openhours {
            float: left;
            width: 60%;
            border-right: 1px solid $bg;
            box-sizing: border-box;
        }
        .responsetime {
            width: 40%;
        }
    }

    .feedback {
        padding-bottom: 20px;
    }

    .feb {
        position: fixed;
        bottom: 80px;
        right: 5px;
        @include rsprite($feb-djq-group);
    }
}

#favorite-modal {
    font-size: 16px;
    .modal-dialog {
        text-align: center;
        color: $text;
        span {
            color: $primary;
        }
    }
    .modal-body {
        margin-bottom: 50px;
    }
}

#feedback-modal {
    .list-view {
        li {
            padding-top: 15px;
            padding-bottom: 15px;
        }
        .check {
            margin-right: 3px;
        }
    }
}

#events-layer {
    color: #fff;
    font-size: 12px;

    .flash-message-dialog {
        width: 280px;
        text-align: left;
    }

    .event-list > li {
        padding-bottom: 15px;
        margin-bottom: 15px;
        line-height: 1.4;
        border-bottom: 1px solid rgba(#FFF, 0.2);

        h4 {
            font-size: 14px;
            margin-bottom: 12px;
            color: $primary;
        }

        ol.multi {
            list-style: inside decimal;
        }

        li {
            margin-bottom: 1em;

            &:last-child {
                margin-bottom: 0;
            }
        }

        &:last-child {
            border-bottom: none;
            padding-bottom: 0;
            margin-bottom: 0;
        }
    }

    .btn {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    &.scroll {
        .flash-message-dialog {
            position: static;
            transform: none;

            > ul {
                position: absolute;
                top: 30px;
                left: 40px;
                right: 40px;
                bottom: 100px;
                overflow: auto;
                @include scrollable;
            }
        }
        .btn {
            position: absolute;
            bottom: 25px;
            left: 50%;
            margin-left: -55px;
        }
    }
}

#courses-modal,
#roomtypes-modal {
    li {
        display: block;
        color: #fff;
        border-left: 3px solid $primary;
        line-height: 50px;
        padding-left: 45px;
        margin-bottom: 5px;
    }
    .active {
        background: $primary;
    }
    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }
}

#share-ktv {
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
        height: 60px;
        background: url(../img/share-order-tip.png) no-repeat 50% 0;
        background-size: 100% auto;
    }
}
</style>

<script>
import utils from "../libs/utils";
import store from "../libs/store";
import { PAGE_STATUS, DEVICE_NAMES } from "../constants/index";

export default {
    data() {
        return {
            ktv: {},
            now: null,

            favorite: this.$user.collectionids.indexOf(this.$route.params.id) > -1,

            feedbackErrors: [{
                id: 1,
                msg: "地址位置错误",
                selected: false,
            }, {
                id: 2,
                msg: "商户联系电话错误",
                selected: false,
            }, {
                id: 3,
                msg: "房型有误",
                selected: false,
            }, {
                id: 4,
                msg: "价格有误",
                selected: false,
            }, {
                id: 5,
                msg: "服务信息有误",
                selected: false,
            }, {
                id: 6,
                msg: "KTV已关闭",
                selected: false,
            }],

            serviceAvailable: true,

            showEventsLayer: false,
            showShareLayer: false,

            status: PAGE_STATUS.LOADING,
            errorMsg: "",

            PAGE_STATUS
        }
    },
    route: {
        data() {
            utils.getLocation(null, null, this.fetch);

            store.hideCoupon = this.$route.query.hc ? this.$route.params.id : false;
        }
    },
    ready() {
        window.scrollTo(0, 0);
    },
    methods: {
        fetch() {
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("booking/xktv", {
                xktvid: this.$route.params.id
            }).then(function (data) {
                data.data.tel = data.data.telephone.split(" ")[0];

                this.ktv = data.data;
                this.now = new Date(data.now * 1e3);
                this.enterTime = Date.now();

                if (this.ktv.type == 0) {// CallCenter
                    let worktime = store.baseinfo.callcenter_worktime;
                    if (!utils.isBetweenTime(utils.parseDate("hh:mm", this.now), worktime.starttime, worktime.endtime, true)) {
                        this.serviceAvailable = false;
                    };
                };

                this.status = PAGE_STATUS.COMPLETED;

                this.$wxShare({
                    title: this.ktv.xktvname,
                    desc: "我在夜点看到这个KTV不错哦，大家都来看看吧！",
                    titleTL: "我在夜点看到［" + this.ktv.xktvname + "］不错哦，大家都来看看吧！",
                    imgUrl: this.ktv.piclist[0].smallpicurl
                });
            }, function (data) {
                this.errorMsg = data.msg;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        doFavorite() {
            let id = this.ktv.xktvid;
            let add = this.$user.collectionids.indexOf(id) == -1;

            this.$api.post("user/" + (add ? "addcollection" : "delcollection"), {
                "xktvid": id
            }).then(function(data) {
                if (add) {
                    this.$user.collectionids += "," + id;
                } else {
                    this.$user.collectionids = this.$user.collectionids.replace(id, "");
                };
                this.favorite = add;
                this.$refs.favoriteModal.open();
            }, function(data) {
                alert(data.msg || "提交失败");
            });
        },
        submitFeedback() {
            let errorIDs = this.selectedErrors.map(error => error.id);

            this.$api.post("feedback/feedback", {
                "ktvid": this.ktv.xktvid,
                "openid": this.$user.openid,
                "errortype": errorIDs.join(",")
            }).then(function(data) {
                this.$refs.feedbackModal.close();
                this.$refs.flashMessage.show("smile", "<p>感谢您的反馈<br>我们会对您提出的问题尽快做出调整<br>再次谢谢您对夜点娱乐的支持！</p>");
                this.feedbackErrors.forEach(error => {error.selected = false});
            }, function(data) {
                alert(data.msg || "提交失败");
            });
        },
        goBook() {
            store.bookdata = {
                now: this.now.getTime() + (Date.now() - this.enterTime),
                ktv: JSON.parse(JSON.stringify(this.ktv))
            };

            this.$router.go({
                name: "book"
            });
        },
        sendCallCenterMessage() {
            this.$api.get("booking/sendcallcentertimelimit");
        }
    },
    computed: {
        selectedErrors() {
            return this.feedbackErrors.filter(error => error.selected);
        }
    },
    filters: {
        deviceName(device) {
            return DEVICE_NAMES[device.toLowerCase()];
        },
        formatSlides(list) {
            return list ? list.map(function(item){
                return {
                    pic: item.bigpicurl
                }
            }) : [];
        }
    },
    watch: {
        showEventsLayer(show) {
            if (show && this.$els.eventsLayer) {
                this.$els.eventsLayer.classList.toggle("scroll", this.$els.eventsLayer.querySelector(".flash-message-dialog").scrollHeight > window.innerHeight - 30);
            };
            document.body.classList.toggle("no-scroll", show);
        }
    }
}
</script>