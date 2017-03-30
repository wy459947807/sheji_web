<template>
    <div class="simple-slider">
        <figure class="slide" v-if="slides.length==1" :style="slides[0].pic | backgroundImage" @click="click(slides[0].link)"></figure>

        <ul class="slider-carousel" v-if="slides.length>1" v-el:carousel>
            <li class="slide" :style="slides[slides.length-1].pic | backgroundImage" @click="click(slides[slides.length-1].link)"></li>
            <li class="slide" v-for="slide in slides" :style="slide.pic | backgroundImage" track-by="$index" @click="click(slide.link)"></li>
            <li class="slide" :style="slides[0].pic | backgroundImage" @click="click(slides[0].link)"></li>
        </ul>

        <nav class="slider-indicators" v-if="slides.length>1"><span v-for="slide in slides" :class="{active:$index==current}" :title="$index+1"></span></nav>
    </div>
</template>

<style lang="sass">
@import "../scss/variables";

.simple-slider {
    position: relative;
    height: 200px;
    background: $bgDark;
    overflow: hidden;

    .slider-carousel {
        position: relative;
        height: 100%;

        &.transition {
            transition: .3s ease-out;
        }
    }

    .slide {
        float: left;
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: 50% 50%;
        background-size: cover;
    }

    .slider-indicators {
        position: absolute;
        bottom: 10px;
        left: 0;
        width: 100%;
        text-align: center;

        span {
            display: inline-block;
            width: 6px;
            height: 6px;
            margin: 0 3px;
            background: #fff;
            border-radius: 50%;
            transition: .3s;

            &.active {
                background: $primary;
            }
        }
    }
}
</style>

<script>
import utils from "../libs/utils";

export default {
    props: {
        slides: {
            type: Array,
            default: []
        },
        current: {
            type: Number,
            default: 0
        },
        auto: {
            type: Boolean,
            default: false,
        },
        delay: {
            type: Number,
            default: 7e3,
        },
        click: {
            type: Function,
            default: function(){}
        }
    },
    ready() {
        this.startX = 0;
        this.startY = 0;
        this.distance = 0;
        this.isMoving = false;
        this.initialized = false;

        this.init();
    },
    beforeDestroy() {
        $(window).off(".ss");

        if (this.slides.length > 1) {
            $(this.$el).off(".ss");
            if (this.auto) clearInterval(this.timer);
        }
    },
    methods: {
        init() {
            if (this.initialized) {
                this.resize();
                $(window).off(".ss");
                $(this.$el).off(".ss");
                clearInterval(this.timer);
            }

            if (this.slides.length > 1) {
                this.bindEvents();
                this.resize();
                if (this.auto) this.timer = setInterval(this.next, this.delay);

                this.initialized = true;
            }
        },
        bindEvents() {
            let $el = $(this.$el);

            $el.on("touchstart.ss", event => {
                if (this.isMoving) return false;
                if (this.auto) clearInterval(this.timer);

                let touch = event.originalEvent.touches[0];
                this.startX = touch.pageX;
                this.startY = touch.pageY;

                $el.off(".temp").one("touchmove.ss", event => {
                    touch = event.originalEvent.changedTouches[0];
                    if (Math.abs(this.startX - touch.pageX) > Math.abs(this.startY - touch.pageY)) {
                        event.preventDefault();
                        this.isMoving = true;
                        this.oldX = -this.width * this.current;
                        this.startTime = Date.now();
                        this.startX = touch.pageX;
                        this.startY = touch.pageY;
                        $el.on("touchmove.ss.temp", this.touchmoveHandler).one("touchend.ss.temp touchcancel.ss.temp", this.touchendHandler);
                    };
                });
            }).on("webkitTransitionEnd transitionend", event => {
                let carousel = this.$els.carousel;
                if (event.originalEvent.target == carousel) {
                    carousel.classList.remove("transition");
                    if (this.current == -1) {
                        this.current = this.slides.length - 1;
                        this.translateX(-this.width * this.current);
                    } else if (this.current == this.slides.length) {
                        this.current = 0;
                        this.translateX(-this.width * this.current);
                    };
                    this.isMoving = false;
                };
            });

            $(window).on("resize.ss", utils.throttle(() => {
                this.resize();
            }));
        },
        translateX(x) {
            this.$els.carousel.style.WebkitTransform = this.$els.carousel.style.transform = "translate3d(" + x + "px,0,0)";
        },
        touchmoveHandler(event) {
            let touch = event.originalEvent.changedTouches[0];
            this.distance = touch.pageX - this.startX;
            this.translateX(this.oldX + this.distance);
        },
        touchendHandler(immediate) {
            let pct = this.distance / this.width;
            let speed = this.distance / (Date.now() - this.startTime);
            let index = this.current;

            if (pct < -0.2 || speed < -0.5) {
                index++;
            } else if (pct > 0.2 || speed > 0.5) {
                index--;
            };

            this.$els.carousel.classList.add("transition");
            this.translateX(-this.width * index);
            this.current = index;
            $(this.$el).off(".temp");
            if (this.slides.length > 1 && this.auto) this.timer = setInterval(this.next, this.delay);
        },
        resize() {
            let width = window.innerWidth;
            let carousel = this.$els.carousel;

            this.width = width;

            if (carousel) {
                carousel.style.left = -width + "px";
                carousel.style.width = (this.slides.length + 2) * width + "px";

                this.translateX(-this.width * this.current);

                Array.prototype.forEach.call(carousel.children, function(slide) {
                    slide.style.width = width + "px";
                });
            };
        },
        go(index, immediate) {
            this.current = index;
            if (!immediate) this.$els.carousel.classList.add("transition");
            this.translateX(-this.width * this.current);
        },
        prev() {
            this.go((this.current - 1) % this.slides.length);
        },
        next() {
            this.go((this.current + 1) % this.slides.length);
        }
    },
    watch: {
        slides: "init"
    }
}
</script>