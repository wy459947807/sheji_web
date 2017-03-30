<template>
    <div class="page-search">
        <header class="masthead" v-el:masthead>
            <form class="search-form" @submit.prevent="search">
                <input type="search" autocomplete="off" v-model="keyword">
                <button type="submit"></button>
            </form>
        </header>

        <div class="ktv-list-container">
            <ul class="ktv-list">
                <ktv-item v-for="ktv in list | limitBy currLimit" track-by="xktvid" :ktv="ktv"></ktv-item>
            </ul>

            <loading v-show="status==PAGE_STATUS.LOADING" :inline-mode="list.length>0"></loading>
            <screen-message v-if="status==PAGE_STATUS.FAILED" :inline-mode="list.length>0" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
            <screen-message v-if="status==PAGE_STATUS.COMPLETED&&list.length==0" message="未找到"></screen-message>
        </div>
    </div>
</template>

<style lang="sass">
.page-search {
    padding-top: 44px;

    .masthead {
        transition: .3s ease;

        &.hide {
            transform: translate3d(0, -100%, 0);
        }
    }

    .search-form {
        position: static;
    }
}
</style>

<script>
import utils from "../libs/utils";
import store from "../libs/store";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
            keyword: this.$route.query.q,
            city: store.city,

            list: [],

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
            utils.getLocation(null, null, this.fetch);
        }
    },
    ready() {
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
    },
    beforeDestroy() {
        $(document).off(".page");
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
            this.$api.get("booking/xktvsearchlist", {
                offset: this.offset,
                limit: this.limit,
                name: this.keyword,
                city: this.city
            }, true).then(function (data) {
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
        search() {
            this.status = PAGE_STATUS.DONE;
            this.list = [];
            this.page = this.offset = 0;
            this.fetch();
        }
    },
    computed: {
        currLimit() {
            return this.page * this.perPage;
        }
    }
}
</script>