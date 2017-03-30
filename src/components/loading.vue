<template>
    <div class="loading-layer" :class="{'inline-mode':inlineMode}">
        <div class="loading-layer-content">
            <span class="icon icon-spinner"></span>
            <p class="text">正在加载…</p>
        </div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.loading-layer {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.loading-layer-content {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    text-align: center;
    border-radius: 7px;
    background: rgba(0,0,0,0.8);
    transform: translate3d(-50%, -50%, 0);

    .icon {
        background: url(../img/icons/icon-loader.svg) no-repeat 50%;
        background-size: contain;
        width: 32px;
        height: 32px;
        margin: 20px auto 5px;
    }
    
    .text {
        line-height: 2;
        margin: 0;
    }
}

.loading-layer.inline-mode {
    position: static;
    margin: 20px;

    .loading-layer-content {
        position: static;
        width: auto;
        height: auto;
        border-radius: 0;
        background: none;
        transform: none;

        .icon {
            background: url(../img/icons/icon-loader.svg) no-repeat 50%;
            background-size: contain;
            width: 16px;
            height: 16px;
            vertical-align: middle;
            margin: 0 5px 0 0;
        }
        .text {
            display: inline;
            vertical-align: middle;
        }
    }
}
</style>

<script>
export default {
    props: {
        inlineMode: {
            type: Boolean,
            default: false
        }
    }
}
</script>