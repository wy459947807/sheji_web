<template>
	<div class="page-favorite">
		<ul class="ktv-list">
            <ktv-item v-for="ktv in list" track-by="$index" :ktv="ktv"></ktv-item>
        </ul>

        <loading v-show="status==PAGE_STATUS.LOADING" :inline-mode="list.length>0"></loading>
        <screen-message v-if="status==PAGE_STATUS.FAILED" :inline-mode="list.length>0" message="加载失败, 点击重试" :info="errorMsg" @click="fetch"></screen-message>
        <screen-message v-if="status==PAGE_STATUS.COMPLETED&&list.length==0" message="收藏为空"></screen-message>
	</div>
</template>

<script>
import utils from "../libs/utils";
import { PAGE_STATUS } from "../constants/index";

export default {
    data() {
        return {
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
            this.$api.get("user/collectionlist", {
                offset: this.offset,
                limit: this.limit
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
        }
    }
}
</script>