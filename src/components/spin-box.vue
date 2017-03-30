<template>
    <div class="spinbox">
        <div class="btn minus" @click="adjust(-this.step)"></div>
        <div><input type="number" :min="min" :max="max" :step="step" :value="value" v-el:input></div>
        <div class="btn plus" @click="adjust(this.step)"></div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.spinbox {
    display: table;
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    height: 46px;
    margin-bottom: 15px;

    > div {
        display: table-cell;
        border: 1px solid #fff;
    }
    .btn {
        width: 46px;
        line-height: 0;
        vertical-align: middle;
        text-align: center;
        cursor: pointer;
        background: no-repeat 50%;
        background-size: 13px 13px;

        &.minus {
                background-image: url(../img/icons/icon-minus-white.svg);
        }
        &.plus {
                background-image: url(../img/icons/icon-plus-white.svg);
        }
    }
    input {
        width: 100%;
        height: 100%;
        text-align: center;
        font-size: 16px;
        color: #fff;
    }
}

.modal {
    .spinbox {
        > div {
            border-color: $primary;
        }
        input {
            color: $primary;
        }
        .btn {
            &.minus {
                background-image: url(../img/icons/icon-minus.svg);
            }
            &.plus {
                background-image: url(../img/icons/icon-plus.svg);
            }
        }
    }
}
</style>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: 1,
            twoWay: true
        },
        min: {
            type: Number,
            default: 1
        },
        max: {
            type: Number,
            default: 9999
        },
        step: {
            type: Number,
            default: 1
        }
    },
    ready() {
        let vm = this;
        let data = [];

        for (let i = this.min, max = this.max; i <= max; i+= this.step) {
            data.push({
                text: i,
                value: i
            });
        };
        this.scroller = $(this.$els.input).mobiscroll().select({
            data: data,
            onSelect(value) {
                vm.value = value;
            }
        }).mobiscroll("getInst");
    },
    methods: {
        adjust(number) {
            let newValue = this.value + number;
            if (this.min <= newValue && newValue <= this.max) {
                this.value = newValue;
                this.scroller.setVal(newValue, true);
            };
        }
    },
    watch: {
        value(value) {
            this.scroller.setVal(value, true);
        }
    }
}
</script>