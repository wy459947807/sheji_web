<template>
    <div class="city-selector">
        <input type="text" :value="province" v-el:province>
        <input type="text" placeholder="省" @click="provinceScroller.show()" v-model="province" onmousedown="return false" readonly>

        <input type="text" :value="city" v-el:city>
        <input type="text" placeholder="市" @click="cityScroller.show()" v-model="city" onmousedown="return false" readonly>

        <input type="text" :value="district" v-el:district>
        <input type="text" placeholder="区" @click="districtScroller.show()" v-model="district" onmousedown="return false" readonly>
    </div>
</template>

<style lang="sass">
.city-selector {
    display: flex;
    justify-content: space-between;
}
</style>

<script>
import CitySelector from "../libs/city-selector";

export default {
    props: {
        province: {
            type: String,
            twoWay: true
        },
        city: {
            type: String,
            twoWay: true
        },
        district: {
            type: String,
            twoWay: true
        }
    },
    ready() {
        this.provinceScroller = $(this.$els.province).mobiscroll().select({
            data: this.convertToData(CitySelector.getProvinceList()),
            showInput: false,
            onSelect: this.setProvince
        }).mobiscroll("getInst");

        this.cityScroller = $(this.$els.city).mobiscroll().select({
            showInput: false,
            onSelect: this.setCity
        }).mobiscroll("getInst");

        this.districtScroller = $(this.$els.district).mobiscroll().select({
            showInput: false,
            onSelect: this.setDistrict
        }).mobiscroll("getInst");

        if (this.province) this.setProvince(this.province, false);
        if (this.city) this.setCity(this.city, false);
        if (this.district) this.setDistrict(this.district, false);
    },
    methods: {
        convertToData(list) {
            return list.map(name => ({
                text: name,
                value: name
            }));
        },
        setProvince(value, byScroller) {
            if (!this.cityScroller || !this.districtScroller) return false;
            this.province = value;
            this.cityScroller.option("data", this.convertToData(CitySelector.getCityList(value)));
            this.districtScroller.option("data", []);
            if (byScroller) {
                this.city = this.district = "";
            };
        },
        setCity(value, byScroller) {
            if (!this.districtScroller || !this.districtScroller) return false;
            this.city = value;
            this.districtScroller.option("data", this.convertToData(CitySelector.getDistrictList(this.province, value)));
            if (byScroller) {
                this.district = "";
            } else {
                this.districtScroller.setVal(value, true);
            };
        },
        setDistrict(value, byScroller) {
            if (!this.districtScroller) return false;
            this.district = value;
            if (!byScroller) {
                this.districtScroller.setVal(value, true);
            };
        }
    },
    watch: {
        province(value, oldVal) {
            if (!oldVal) this.setProvince(value, false);
        },
        city(value, oldVal) {
            if (!oldVal) this.setCity(value, false);
        },
        district(value, oldVal) {
            if (!oldVal) this.setDistrict(value, false);
        }
    }
}
</script>