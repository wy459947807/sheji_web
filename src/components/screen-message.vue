<template>
    <div class="screen-message" :class="{'inline-mode':inlineMode}">
        <div class="screen-message-dialog">
            <span class="icon"></span>
            <p class="content">{{message}}</p>
            <small class="info" v-if="info">{{info}}</small>
        </div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.screen-message {
    background: $bg;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
}

.screen-message-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    transform: translate3d(-50%, -50%, 0);
    text-align: center;
    color: $grayText;

    .icon {
        background: url(../img/xktv-logo.png) no-repeat 50%;
        background-size: contain;
        width: 70px;
        height: 70px;
        margin-bottom: 10px;
    }
    
    .content {
        line-height: 2;
        margin: 0;
    }

    .info {
        display: block;
        font-size: 12px;
    }
}

.screen-message.inline-mode {
    background: none;
    position: static;
    padding: 20px;

    .screen-message-dialog {
        position: static;
        width: auto;
        transform: none;
        color: $text;

        .icon,
        .info {
            display: none;
        }

        .content {
            line-height: 1;
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
        },
        message: {
            type: String,
            default: ""
        },
        info: {
            type: String,
            default: ""
        }
    }
}
</script>