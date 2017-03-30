<template>
    <div class="page-map">
        <header class="map-info"><span class="icon"></span><p class="address">{{$route.query.address}}</p></header>
        <div class="map-container"><iframe :src="mapUrl"></iframe></div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.page-map {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
}

.map-info {
    padding: 15px;
    background: rgba(29,28,34,0.90);
    color: #fff;
    
    .icon {
        float: left;
        width: 18px;
        height: 26px;
        background: url(../img/icons/icon-map-location.svg) no-repeat 50%;
        background-size: contain;
        margin-right: 13px;
    }
    .address {
        margin: 0;
        overflow: hidden;
        line-height: 1.5;
    }
}

.map-container {
    display: flex;
    flex: 1;

    iframe {
        flex: 1;
        border: none;
    }
}
</style>

<script>
export default {
    data() {
        let query = this.$route.query;

        return {
            mapUrl: `http://apis.map.qq.com/tools/poimarker?type=0&marker=coord:${query.lat},${query.lng};title:${query.name};addr:${query.address}&streetview=0&key=4QMBZ-YW5AR-AAZWF-WXXP2-QWJ3V-3DFGN&referer=yedian`
        }
    }
};
</script>