<template>
    <li class="ktv-item">
        <a class="ktv-item-inner" v-link="{ name: 'detail', params: { id: ktv.xktvid } }">
            <div class="pic" :style="ktv.piclist[0].bigpicurl | backgroundImage">
                <div class="halloween" v-if="ktv.halloween.status"></div>
            </div>
            <div class="content">
                <h3 class="name">{{ktv.xktvname}}</h3>
                <div class="meta">
                    <span class="rating"><span class="full"></span><span class="stars" :style="{width:ktv.rate*20+'%'}"></span></span>
                    <span class="price" v-if="ktv.price">人均：¥{{ktv.price}}</span>
                </div>
                <p class="address">{{ktv.district}} <span class="distance" v-if="ktv.distance != null">{{ktv.distance | formatDistance}}km</span></p>
                <div class="marks">
                    <span v-if="ktv.sjq.status" class="mark mark-quan"></span>
                    <span v-if="ktv.taocan.status" class="mark mark-dang"></span>
                    <span v-if="ktv.miandan.status" class="mark mark-mian"></span>
                </div>
            </div>
        </a>
    </li>
</template>

<style lang="sass">
@import "../scss/variables";

.ktv-list {
    .ktv-item {
        background: $bgLight;
        margin-bottom: 1px;
        animation: fadeIn .3s;
    }
}

.ktv-item {
    .ktv-item-inner {
        position: relative;
        display: flex;
        align-items: center;
        padding: 5px;
        overflow: hidden;
    }

    .pic {
        position: relative;
        width: 49.32%;
        max-width: 180px;
        background: $bgDark no-repeat 50%;
        background-size: cover;
        margin-right: $gap;

        &:before {
            content: '';
            display: block;
            padding-bottom: 62.5%;
        }

        &:not([style]) {
            background-image: url(../img/xktv-logo.png);
            background-size: 50px auto;
        }

        .halloween {
            position: absolute;
            top: 0;
            left: 0;
            background: url(../img/mark_halloween.png) no-repeat 0 0;
            background-size: contain;
            width: 76px;
            height: 61px;
        }
    }

    .content {
        flex: 1;
        margin-right: 10px;
    }

    .name {
        font-size: 16px;
        margin-bottom: 5px;
        line-height: 1.2;
    }

    .meta {
        margin-bottom: 10px;
    }

    .rating {
        vertical-align: -1px;
    }

    .price {
        color: $grayText;
        font-size: 12px;
    }

    .address {
        float: right;
        margin: 0;
        font-size: 12px;
        line-height: 18px;
    }
}
</style>

<script>
export default {
    props: {
        ktv: {
            type: Object,
            required: true
        }
    },
    filters: {
        formatDistance(distance) {
            return distance < 1e3 ? distance : Math.round(distance);
        }
    }
}
</script>