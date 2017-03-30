<template>
    <div class="page-bookresult">
        <span class="icon"></span>
        <h1 class="title">您的订单提交成功</h1>

        <div class="tips">
            <h3>预定说明</h3>
            <p>我们会尽早为您安排合适的时间，请留意夜点娱乐公众号为您发送的订单信息。通过夜点预订KTV，只需要在夜点提交订单，到达KTV现场支付，即可享受夜点最强黄金档的价格优惠。</p>
        </div>

        <div class="actions">
            <a v-link="{ name: 'index', replace: true }">返回首页</a>
            <a v-link="{ name: 'ktv-order', params: { id: $route.params.id }, replace: true }">查看订单</a>
        </div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.page-bookresult {
    .icon {
        display: block;
        background: $primary;
        width: 128px;
        height: 128px;
        border-radius: 50%;
        margin: 30px auto 20px;
        overflow: hidden;

        &:after {
            content: "";
            border-left: 10px solid #fff;
            border-bottom: 10px solid #fff;
            width: 70px;
            height: 30px;
            transform: rotate(-45deg);
            display: block;
            margin: 36px 0 0 24px;
        }
    }
    .title {
        font-size: 20px;
        color: $primary;
        margin-bottom: 30px;
        text-align: center;
    }
    .tips {
        border-top: 1px solid rgba(#fff, 0.1);
        h3 {
            border-left: 4px solid $primary;
            padding-left: 11px;
            margin: 15px 0;
        }
        p {
            background: $bgDark;
            padding: 15px;
            color: $grayText;
            font-size: 12px;
            line-height: 1.5;
            margin: 0;
        }
    }
    .actions {
        margin: 15px 5px;
        display: flex;
        a {
            flex: 1;
            display: inline-block;
            background: $primary;
            color: #fff;
            border-radius: 4px;
            margin: 0 10px;
            text-align: center;
            font-size: 16px;
            padding: 1em;
            font-weight: bold;
        }
    }
}
</style>