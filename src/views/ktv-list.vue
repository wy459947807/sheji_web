<template>
    <div class="page-ktvlist" :class="{loading:status==PAGE_STATUS.LOADING}">
        <header class="masthead list-selector" v-el:masthead>
            <ul class="selector-triggers">
                <li :class="{active:activeLayer=='area'}" @click="activeLayer=activeLayer=='area'?false:'area'"><span class="selector-trigger"><span class="text">{{areaText}}</span></span></li>
                <li :class="{active:activeLayer=='sort'}" @click="activeLayer=activeLayer=='sort'?false:'sort'"><span class="selector-trigger"><span class="text">{{sortKey.name}}</span></span></li>
                <li :class="{active:activeLayer=='event'}" @click="activeLayer=activeLayer=='event'?false:'event'"><span class="selector-trigger"><span class="text">优惠筛选</span></span></li>
            </ul>
            <span class="search-trigger" @click="showSearchform"></span>
            <form class="search-form" v-show="activeLayer=='search'" transition="searchform" @submit.prevent="doSearch">
                <input type="search" autocomplete="off" placeholder="搜索…" v-model="keyword" v-el:search-input>
                <button type="submit"></button>
            </form>

            <div class="selector-droplist droplist-filter" v-show="activeLayer=='area'" transition="flip">
               <nav class="tab">
                    <a :class="{active:activePanel=='city'}" @click="activePanel='city'">城市</a>
                    <a :class="{active:activePanel=='area'}" @click="activePanel='area'">商区</a>
                    <a :class="{active:activePanel=='distance'}" @click="activePanel='distance'" v-show="hasLocation">附近</a>
               </nav>

                <div class="filter-panels">
                    <ul class="city-list" v-show="activePanel=='city'">
                        <li class="gps" :class="{na:!gpsCity.code,active:activeCity==gpsCity}" @click="activeCity=gpsCity,activePanel='area'">GPS定位：{{gpsCity.name}}</li>

                        <li v-for="city in cityList" :class="{active:activeCity==city}" @click="activeCity=city,activePanel='area'">{{city.name}}</li>
                    </ul>

                    <ul class="area-list" v-show="activePanel=='area'">
                        <li class="all" :class="{active:filterKey==allAreas}" @click="filterKey=allAreas,activeLayer=false">{{allAreas.name}}</li>

                        <li v-for="area in areaList" :class="{active:filterKey==area}" @click="filterKey=area,activeLayer=false">{{area.name}}</li>
                    </ul>

                    <ul class="distance-list" v-show="activePanel=='distance'">
                        <li v-for="distance in distanceList" :class="{active:filterKey==distance}" @click="filterKey=distance,activeLayer=false">{{distance.name}}</li>
                    </ul>
                </div>
            </div>

            <div class="selector-droplist droplist-sort" v-show="activeLayer=='sort'" transition="flip">
                <ul>
                    <li v-for="type in sortTypes" v-show="(type.code=='distance'?hasLocation:true)" :class="{active:sortKey==type}" @click="sortKey=type">{{type.name}}</li>
                </ul>
            </div>

            <div class="selector-droplist droplist-event" v-show="activeLayer=='event'" transition="flip">
                <ul class="event-list">
                    <li v-for="event in eventTypes" :class="{active:event.selected}" @click="event.selected=!event.selected">{{event.name}}</li>
                </ul>

                <span class="ok" @click="activeLayer=false,updateList()">确定</span>
            </div>
        </header>

        <section class="ktv-list-container">
            <ul class="ktv-list">
                <li v-if="eventKtv">
                    <a @click="$handleLink(eventKtv.link || '#!/ktv/' + eventKtv.xktvid, 'EventKTV')">
                        <div class="pic" :style="eventKtv.pic | backgroundImage"></div>
                        <div class="content">
                            <h3 class="name">{{eventKtv.event_name || eventKtv.xktvname}}</h3>
                            <span class="rating"><span class="full"></span><span class="stars" :style="{width:eventKtv.rating*20+'%'}"></span></span>
                            <p class="address">{{eventKtv.district}} <span class="distance" v-if="eventKtv.distance != null">{{eventKtv.distance}}KM</span></p>
                            <div class="marks">
                                <span v-if="eventKtv.sjq.status" class="mark mark-quan"></span>
                                <span v-if="eventKtv.taocan.status" class="mark mark-dang"></span>
                            </div>
                        </div>
                    </a>
                </li>
                <ktv-item v-for="ktv in list | limitBy currLimit" track-by="xktvid" :ktv="ktv"></ktv-item>
            </ul>

            <loading v-show="status==PAGE_STATUS.LOADING" :inline-mode="list.length>0"></loading>
            <screen-message v-if="status==PAGE_STATUS.FAILED" :inline-mode="list.length>0" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
            <screen-message v-if="status==PAGE_STATUS.COMPLETED&&list.length==0" message="结果为空"></screen-message>
        </section>

        <div class="dimmer" v-show="activeLayer" @click="activeLayer=false" transition="fade"></div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.page-ktvlist {
    padding-top: 44px;

    .masthead {
        transition: .3s ease;

        &.hide {
            transform: translate3d(0, -100%, 0);
        }
    }

    &.loading {
        pointer-events: none;
    }
}

.list-selector {
    color: #EEE;

    .selector-triggers {
        font-size: 12px;
        margin-left: 4px;
        margin-right: 44px;

        li {
            position: relative;
            float: left;
            height: 44px;
            width: 33.3%;
            overflow: hidden;
            cursor: pointer;
            text-align: center;

            &:before,
            &:last-child:after {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                width: 1px;
                height: 20px;
                background: rgba(0,0,0,.1);
                margin-top: -10px;
            }

            &:first-child:before {
                display: none;
            }

            &:last-child:after {
                left: auto;
                right: 0;
            }

            &.active {
                &:before,
                &:after,
                + li:before, {
                    display: none;
                }

                .selector-trigger {
                    background: $primary;
                    box-shadow: inset 0 1px 5px rgba(0,0,0,0.55);
                }
            }
        }
    }

    .selector-trigger {
        position: relative;
        display: block;
        height: 44px;
        line-height: 35px;
        padding: 0 8px;
        margin-top: 4px;

        .text {
            display: inline-block;
            max-width: 80%;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            vertical-align: middle;
        }

        &:after {
            content: '';
            display: inline-block;
            width: 4px;
            height: 4px;
            border-right: 1px solid #fff;
            border-bottom: 1px solid #fff;
            transform: rotate(45deg);
            margin-left: 5px;
            vertical-align: 2px;
        }
    }
}


.search-trigger {
    float: right;
    width: 44px;
    height: 44px;
    text-align: center;
    background: url(../img/icons/icon-search-white.svg) no-repeat 50%;
    background-size: 18px 18px;
}

.search-form {
    background-image: linear-gradient(90deg, $primary 0%, $primaryDark 100%);
    height: 44px;
    padding: 6px;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    input {
        background: rgba(0,0,0,0.29);
        box-shadow: inset 0px 1px 4px 1px rgba(0,0,0,0.26);
        border-radius: 16px;
        width: 100%;
        height: 100%;
        padding-left: 10px;
        padding-right: 40px;

        &::placeholder {
            color: rgba(255,255,255,0.4);
        }
    }

    button {
        position: absolute;
        top: 6px;
        right: 12px;
        width: 32px;
        height: 32px;
        opacity: .8;
        background: url(../img/icons/icon-search-white.svg) no-repeat 50%;
        background-size: 18px 18px;
    }
}

.searchform-transition {
    transition: .3s ease;

    &.searchform-enter,
    &.searchform-leave  {
        transform: translate3d(0, -100%, 0);
        opacity: 0;
    }
}

.flip-transition {
    transform: perspective(1000);
    transform-origin: 50% 0;
    transition: .3s ease;
    backface-visibility: hidden;

    &.flip-enter,
    &.flip-leave  {
        transform: perspective(1000) rotateX(-20deg);
        opacity: 0;
    }
}

.selector-droplist {
    position: absolute;
    background: $primary;
    top: 100%;
    left: 0;
    width: 100%;
    box-shadow: 0px 10px 10px 0px rgba(0,0,0,0.92);

    .tab {
        height: 54px;
        width: 300px;
        margin: 0 auto;
        text-align: center;

        a {
            display: inline-block;
            width: 96px;
            height: 50px;
            line-height: 54px;
            font-size: 16px;
            // margin: 0 20px;

            &.active {
                color: #fff;
                border-bottom: 4px solid #FFF;
            }
        }
    }

    ul {
        max-width: 320px;
        margin: 20px auto;
        overflow: hidden;
        clear: both;
    }

    li {
        border: 1px solid #E4E4E4;
        border-radius: 1px;
        line-height: 36px;
        float: left;
        padding: 0 11px;
        margin: 8px 13px;
        text-align: center;
        transition: .3s;
        cursor: pointer;

        &.active {
            background: #EDEDED;
            font-size: 14px;
            color: #4E4E4E;
            box-shadow: 0 3px 6px rgba(0,0,0,0.5);
        }
    }

    .city-list {
        .gps {
            width: auto;
        }

        .na {
            opacity: 0.5;
            pointer-events: none;
        }
    }

    .city-list .gps,
    .area-list .all {
         + li {
            clear: left;
        }
    }

    .distance-list {
        max-width: 280px;
        li {
            width: 5em;
            margin: 8px 20px;
        }
    }

    .event-list {
        li {
            margin-left: 8px;
            margin-right: 8px;
        }
    }

    .ok {
        display: block;
        background: $primaryDark;
        line-height: 34px;
        text-align: center;
    }
}

.droplist-filter {
    li {
        width: 4em;
    }
    .filter-panels {
        border-top: 1px solid $borderRed;
        overflow: auto;
        @include scrollable;
    }
}

.dimmer {
    background: #000;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    opacity: .5;
}
</style>

<script>
import utils from "../libs/utils";
import store from "../libs/store";
import Vue from "vue";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        let query = this.$route.query;

        let distanceList = [
            { distance: 500,  name: "离我500M" },
            { distance: 1000, name: "离我1KM" },
            { distance: 2000, name: "离我2KM" },
            { distance: 3000, name: "离我3KM" }
        ];

        let allAreasObj = { code: 0, name: "全部商区" };

        let filterKey = allAreasObj;

        if (store.filterKey && store.filterKey.distance) {
            distanceList.some(function(item, index) {
                if (item.distance == store.filterKey.distance) {
                    filterKey = item;
                    return true;
                } else {
                    return false;
                }
            });
        }

        let sortTypes = [
            { code: "distance",         name: "离我最近" },
            { code: "smart",            name: "智能排序" },
            { code: "DecorationRating", name: "环境最佳" },
            { code: "SoundRating",      name: "音效最好" },
            // { code: "ConsumerRating",   name: "性价比最高" },
            { code: "ServiceRating",    name: "服务最好" },
            { code: "FoodRating",       name: "美食最佳" },
            { code: "responsetime",     name: "订单处理最快" }
        ];

        let sortKey = sortTypes[1];

        if (query.sort) {
            let result = sortTypes.filter(type => type.code == query.sort)[0];
            if (result) sortKey = result;
        }

        if (store.sortKeyCode) {
            sortTypes.some(function(type, index) {
                if (type.code == store.sortKeyCode) {
                    sortKey = type;
                    return true;
                } else {
                    return false;
                }
            });
        }

        let eventTypes = store.eventTypes || [
            { code: "sjq", name: "兑酒券", selected: query.event == "jq" },
            { code: "taocan", name: "黄金档", selected: query.event == "goldpkg" },
            { code: "online_pay", name: "专享优惠", selected: query.event == "online_pay" },
            // { code: "miandan", name: "有机会免单", selected: query.event == "miandan" },
            { code: "halloween", name: "万圣节惊喜", selected: query.event == "halloween" }
        ];

        return {
            hasLocation: false,
            eventKtv: null,

            activeLayer: false,
            activePanel: "area",

            keyword: "",

            cityList: [],
            gpsCity: {
                name: "正在定位…"
            },
            activeCity: null,

            distanceList: distanceList,
            areaList: [],
            allAreas: allAreasObj,
            filterKey: filterKey,

            sortTypes: sortTypes,
            sortKey: sortKey,

            eventTypes: eventTypes,

            list: [],

            type: this.$route.query.type || "",
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
            let query = this.$route.query;

            utils.getLocation(null, null, coords => {
                this.hasLocation = !!coords;

                this.getCityList().then(function() {
                    if (store.city) {
                        this.activeCity = this.cityList.filter(item => item.code == store.city)[0];
                        this.gpsCity.name = store.gpsCity;
                    } else {
                        return utils.reverseGeocodeLocation(coords, this).then(function(city) {
                            if (this.isCityAvailable(city)) {
                                city.code = this.cityList.filter(item => item.name == city.name)[0].code;
                                this.activeCity = this.gpsCity = city;
                                store.city = this.activeCity.code;
                                store.gpsCity = city.name;
                            } else {
                                store.gpsCity = this.gpsCity.name = city.name;
                                throw new Error("检测到您当前城市没有可预订的KTV，是否手动切换城市？");
                            }
                        }, error => {
                            store.gpsCity = this.gpsCity.name = "定位失败";
                            throw new Error("系统检测不到当前位置信息，是否需要手动切换城市？");
                        }).catch(error => {
                            this.activeCity = this.cityList[0];
                            store.city = this.activeCity.code;

                            if (this.cityList.length > 1) {
                                (window.splashAdPromise || Vue.Promise.resolve()).then(() => {
                                    if (confirm(error.message)) {
                                        this.activePanel = "city";
                                        this.activeLayer = "area";
                                    }
                                });
                            }
                        });
                    }
                }).then(function(){
                    this.getDistrictList().then(function() {
                        let districtCode = query.district || (store.filterKey && store.filterKey.code);

                        if (districtCode) {
                            let found = false;
                            let area;

                            for (let i=0,len=this.areaList.length; i<len; i++) {
                                area = this.areaList[i];

                                if (area.code == districtCode) {
                                    this.filterKey = area;
                                    found = true;
                                    break;
                                }
                            }

                            if (found) return;
                        }

                        this.fetch();
                    });

                    this.$watch("activeCity", function(value) {
                        this.fetchCoords().then(function() {
                            if (!this.filterKey.distance && this.filterKey.code !== this.allAreas.code) {
                                this.filterKey = this.allAreas;
                            }
                            this.updateList();
                        });
                        store.city = value.code;
                        this.getDistrictList();
                    });
                })
            });
        }
    },
    ready() {
        if (this.$route.query.fromTabBar) window.scrollTo(0, 0);

        let masthead = this.$els.masthead;
        let $win = $(window);
        let $doc = $(document);
        let winHeight = $win.height();

        $doc.on("touchstart.page", function(event) {
            let start = $win.scrollTop();

            $win.one("scroll", function(event) {
                let scrollTop = $win.scrollTop();
                let distance = scrollTop - start;

                if (scrollTop > 44 && distance > 0) {
                    masthead.classList.add("hide");
                } else {
                    masthead.classList.remove("hide");
                };
            });
        });

        $win.on("scroll", utils.throttle(() => {
            let scrollTop = $win.scrollTop();
            if (this.status == PAGE_STATUS.LOADING) return false;
            if ($doc.height() - winHeight - scrollTop < 400) {
                this.fetch();
            };
            if (scrollTop < 44) {
                masthead.classList.remove("hide");
            };
        }, 100));

        $(".filter-panels").css("max-height", winHeight - 152);
    },
    beforeDestroy() {
        $(document).off(".page");
        $(window).off("scroll");
    },
    methods: {
        buildQuery(source) {
            let query = {
                city: this.activeCity.code,
                code: this.filterKey.code,
                best: this.sortKey.code == "smart" ? "distance" : this.sortKey.code,
                type: this.type
            };

            this.eventTypes.forEach(event => event.selected && (query[event.code] = 1));

            if (source) {
                Object.keys(source).forEach(key => {
                    query[key] = source[key];
                });
            };

            return query;
        },
        fetch() {
            if (((this.sortKey.code == "distance" || this.sortKey.code == "smart") && this.filterKey.code === 0) || this.filterKey.distance) {
                if (this.coords) {
                    this.fetchByDistance();
                } else {
                    this.fetchCoords().then(function() {
                        this.fetchByDistance();
                    });
                };
            } else {
                this.fetchList();
            };
        },
        fetchList() {
            if (this.offset > this.currLimit) {
                this.page++;
                return false;
            } else if (this.status == PAGE_STATUS.COMPLETED) {
                return false;
            };
            this.status = PAGE_STATUS.LOADING;
            this.$api.get("booking/Xktvlist", this.buildQuery({
                offset: this.offset,
                limit: this.limit,
            }), true).then(function (data) {
                if (data.total == 0) {
                    this.status = PAGE_STATUS.COMPLETED;
                    return false;
                };

                if (data.event && !this.eventKtv) {
                    data.event.distance = utils.getDistance(data.event.lat, data.event.lng);
                    this.eventKtv = data.event;
                };

                let isSmartSort = this.sortKey.code == "smart";

                data.list.forEach(item => {
                    item.distance = utils.getDistance(item.lat, item.lng);
                    if (isSmartSort) item.weight = utils.calcWeight(item, this.sortKey.code);
                });

                if (isSmartSort) {
                    data.list = data.list.filter(item => item.taocan.status).sort((a, b) => b.weight - a.weight).concat(data.list.filter(item => !item.taocan.status).sort((a, b) => b.weight - a.weight));
                }

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
        fetchByDistance() {
            if (this.offset > this.currLimit) {
                this.page++;
                return false;
            } else if (this.status == PAGE_STATUS.COMPLETED) {
                return false;
            };
            this.status = PAGE_STATUS.LOADING;

            let isSmartSort = this.sortKey.code == "smart";
            let items = this.coords || [];

            this.eventTypes.forEach(function(type) {
                if (type.selected) items = items.filter(item => item[type.code]);
            });

            if (this.filterKey.distance) {
                let distanceInKM = this.filterKey.distance / 1000;
                items = items.filter(item => item.distance < distanceInKM);
            };

            if (isSmartSort) {
                items = items.filter(item => item.taocan).concat(items.filter(item => !item.taocan));
            };

            items = items.slice(this.offset, this.offset + this.limit);

            this.$api.post("booking/Xktvlist", this.buildQuery({
                list: items.map(item => item.xktvid),
            }), true).then(function (data) {
                if (data.total == 0) {
                    this.status = PAGE_STATUS.COMPLETED;
                    return false;
                };

                if (data.event && !this.eventKtv) {
                    data.event.distance = utils.getDistance(data.event.lat, data.event.lng);
                    this.eventKtv = data.event;
                };

                data.list.forEach(item => {
                    item.distance = utils.getDistance(item.lat, item.lng);
                    if (isSmartSort) item.weight = utils.calcWeight(item);
                });

                if (isSmartSort) {
                    data.list = data.list.filter(item => item.taocan.status).sort((a, b) => b.weight - a.weight).concat(data.list.filter(item => !item.taocan.status).sort((a, b) => b.weight - a.weight));
                }

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
        fetchCoords() {
            this.status = PAGE_STATUS.LOADING;
            
            return this.$api.get("booking/xktvcoords", {
                city: this.activeCity.code
            }, true).then(function(data) {
                data.list.forEach(function(item) {
                    item.distance = utils.getDistance(item.lat, item.lng);
                });
                data.list.sort(function(a, b) {
                    return a.distance - b.distance;
                });
                this.coords = data.list;
                this.status = PAGE_STATUS.DONE;
            }, function(data) {
                this.errorMsg = data.message;
                this.status = PAGE_STATUS.FAILED;
            });
        },
        getCityList() {
            return this.$api.get("booking/CityList", {}, true).then(function(data) {
                this.cityList = data.lists.map(function(item) {
                    return {
                        name: item.name,
                        code: item.area_id
                    }
                });
            });
        },
        getDistrictList() {
            return this.$api.get("booking/Xktvdistrict", {
                parent: this.activeCity.code
            }, true).then(function(data) {
                this.areaList = data.list;
            });
        },
        updateList() {
            this.status = PAGE_STATUS.DONE;
            this.list = [];
            this.page = this.offset = 0;
            this.fetch();
        },
        showSearchform() {
            this.activeLayer = "search";

            this.$nextTick(function() {
                this.$els.searchInput.focus();
            });
        },
        doSearch() {
            document.body.classList.remove("no-scroll");
            
            this.$router.go({
                name: "search",
                query: {
                    q: this.keyword
                }
            });
        },
        isCityAvailable(target) {
            return this.cityList.some(city => target.name == city.name);
        }
    },
    computed: {
        areaText() {
            if (this.filterKey.distance) {
                return this.filterKey.name;
            } else {
                return this.activeCity ? (this.filterKey.code ? this.filterKey.name : this.activeCity.name) : "城市-商区";
            }
        },
        currLimit() {
            return this.page * this.perPage;
        }
    },
    watch: {
        filterKey(value) {
            if (!!value.code && this.sortKey.code == "distance") {
                this.sortKey = this.sortTypes[0];
            };
            if (value.code) {
                store.city = this.activeCity.code;
            };
            store.filterKey = Object.assign({}, value);
            this.updateList();
        },
        sortKey(value) {
            store.sortKeyCode = value.code;
            this.activeLayer = false;
            this.updateList();
        },
        eventTypes: {
            handler(value) {
                store.eventTypes = JSON.parse(JSON.stringify(value));
            },
            deep: true
        },
        activeLayer(show) {
            document.body.classList.toggle("no-scroll", show);
        }
    }
}
</script>