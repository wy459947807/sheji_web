<template>
    <div class="modal" v-show="show" transition="modal">
        <div class="modal-dialog">
            <div class="modal-header">
                <h4 class="modal-title" v-if="title">{{title}}</h4>
                <span class="close" @click="close" v-if="closeable"></span>
            </div>
            <div class="modal-body">
                <slot></slot>
            </div>
            <div class="modal-footer" v-if="showBtn">
                <button type="button" class="btn" @click="submitHandler | debounce 300" :disabled="btnDisabled">{{btnText}}</button>
            </div>
        </div>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.modal {
    background: rgba(0,0,0,0.75);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
}

.modal-dialog {
    width: 300px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
    background: $bg;
    box-shadow: 0px 2px 12px 6px rgba(0,0,0,0.92);
}

.modal-header {
    padding: $gap;
    line-height: 1;
    font-size: 16px;
    height: 1em;

    .modal-title {
        font-size: 16px;
    }
    .close {
        position: absolute;
        top: 9px;
        right: $gap - 2;
        width: 28px;
        height: 28px;
        line-height: 44px;
        cursor: pointer;
        text-align: center;
        z-index: 2;
        background: $primary;
        border-radius: 50%;

        &:before,
        &:after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 70%;
            height: 1px;
            background: #fff;
            transform: translate3d(-50%, -50%, 0) rotate(45deg);
        }
        &:after {
            transform: translate3d(-50%, -50%, 0) rotate(-45deg);
        }
    }
}

.modal-body {
    overflow: auto;
    @include scrollable;

    > :first-child {
        margin-top: 0;
    }


    > :last-child {
        margin-bottom: 0;
    }

    > .icon {
        background: no-repeat 50%;
        width: 100px;
        height: 100px;
        vertical-align: top;

        &.icon-favorite { background-image: url(../img/icons/bigicon-favorite.svg); background-size: 58px 53px; }
    }

    .list-view {
        background: $bgLight;
        > * {
            &:last-child {
                margin-bottom: 0;
            }
        }
        input {
            height: 34px;
            width: 100%;

            &[type="radio"],
            &[type="checkbox"] {
                width: 20px!important;
                height: 20px!important;
                vertical-align: middle;
                background: $bg;
                border: 2px solid $primary;
                border-radius: 50%;
                box-shadow: inset 0 0 0 3px $bg;

                &:checked {
                    background: $primary;
                    border-color: $primary;
                }

                + label {
                    vertical-align: middle;
                    padding-left: 7px;
                    padding-right: 50px;
                }
            }
        }

        button {
            height: 34px;
            background: $bg;
            border: 2px solid $primary;
            border-radius: 2px;
        }

        .item-sex {
            padding-top: 18px;
            padding-bottom: 18px;
        }

        .item-captcha {
            input {
                margin-right: 10px;
            }
            .btn-sendcaptcha {
                width: 90px;
            }
        }

        .item-city {
            a {
                padding-left: 30px;
                padding-bottom: 10px;
                &:before {
                    display: none;
                }
            }
            input {
                background: $bg;
                border: 2px solid $primary;
                border-radius: 2px;
                width: 73px;
                height: 35px;
                padding: 0 10px;
                text-align: center;
            }
        }
    }
}

.modal-footer {
    position: relative;

    .btn {
        display: block;
        width: 100%;
        height: 54px;
        background: $primary;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 -3px 5px rgba(#000, 0.3);
        color: $text;

        &:disabled {
            color: $grayText;
            background: none;
        }
    }
}

.modal-transition {
    transition: opacity .3s ease;

    .modal-dialog {
        transition: transform .3s ease;
    }

    &.modal-enter,
    &.modal-leave  {
        opacity: 0;

        .modal-dialog {
            transform: translate3d(-50%, -50%, 0) scale(0.9);
        }
    }
}
</style>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: false,
            twoWay: true    
        },
        closeable: {
            type: Boolean,
            default: true
        },
        showBtn: {
            type: Boolean,
            default: true
        },
        btnText: {
            type: String,
            default: "确定"
        },
        btnDisabled: {
            type: Boolean,
            default: false
        },
        submit: Function,
        title: String
    },
    ready() {
        this.$el.querySelector(".modal-body").style.maxHeight = window.innerHeight - 160 + "px";
    },
    beforeDestroy() {
        document.body.classList.remove("no-scroll");
    },
    methods: {
        open(selector) {
            this.show = true;
            if (selector) {
                this.$nextTick(function(){
                    this.$el.querySelector(selector).scrollIntoView();
                });
            }
        },
        close() {
            this.show = false;
        },
        submitHandler() {
            this.submit? this.submit() : (this.show = false);
        },
        setLoading(loading) {
            if (loading) {
                this._btnText = this.btnText;
                this.btnText = "正在提交";
                this.btnDisabled = true;
            } else {
                this.btnText = this._btnText;
                this.btnDisabled = false;
            };
        }
    },
    watch: {
        show(show) {
            document.body.classList.toggle("no-scroll", show);
        }
    }
}
</script>