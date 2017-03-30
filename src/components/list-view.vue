<template>
    <div class="list-view">
        <slot></slot>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";
@import "../scss/mixins";

.list-view {
    clear: both;

    > * {
        position: relative;
        display: flex;
        align-items: center;
        padding: 10px $gap;
        border-bottom: 1px solid $bg;

        .icon {
            height: 22px;
            width: 22px;
            margin-right: 10px;
            background-repeat: no-repeat;
            background-position: 50%;
            background-size: contain;
            opacity: 0.5;

            &[class*="red"] {
                opacity: 1;
            }

            &.blank {
                background: none;
            }
        }

        .check {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1px solid $primary;

            &:first-child {
                margin-right: 10px;
            }

            &:last-child {
                margin-left: 10px;
            }
        }

        &.active {
            .check {
                background: $primary;
                &:after {
                    content: "";
                    display: block;
                    border: 1px solid #fff;
                    border-top-width: 0;
                    border-right-width: 0;
                    width: 8px;
                    height: 5px;
                    transform: rotate(-45deg);
                    margin: 4px 0 0 3px;
                }
            }
        }

        .flex {
            flex: 1;
        }

        .title {
            color: #fff;
            font-weight: normal;
            font-size: 16px;
            margin-top: 3px;
            margin-bottom: .5em;
        }
        .desc {
            margin: 0 0 3px;
            color: $grayText;
            font-size: 12px;
            line-height: 1.4;
        }

        .align-top {
            align-self: flex-start;
        }

        .align-center {
            align-self: center;
        }

        &.align-top {
            align-items: flex-start;
        }

        &.has-arrow:after {
            content: "";
            display: inline-block;
            margin-left: 5px;
            margin-right: 2px;
            margin-top: -1px;
            width: 6px;
            height: 6px;
            border-top: 1px solid #fff;
            border-right: 1px solid #fff;
            transform: rotate(45deg);
            align-self: center;
        }
    }

    $icons: 'phone', 'location', 'remark', 'coupon', 'order', 'favorite', 'home', 'feedback', 'service',
            'phone-red', 'location-red', 'home-red';
    @each $icon in $icons {
        .icon-#{$icon} { background-image: url(../img/icons/icon-#{$icon}.svg); }
    }

    &.has-arrow {
        > * {
            &:after {
                content: "";
                display: inline-block;
                margin-left: 5px;
                margin-right: 2px;
                margin-top: -1px;
                width: 6px;
                height: 6px;
                border-top: 1px solid #fff;
                border-right: 1px solid #fff;
                transform: rotate(45deg);
                align-self: center;
            }
        }
    }

    &.align-top {
        > * {
            align-items: flex-start;
        }
    }
}
</style>