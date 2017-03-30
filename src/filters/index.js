import utils from "../libs/utils";

exports.date = function(value, format) {
    return value ? utils.parseDate(format, new Date(value * 1000)) : "";
};

exports.distance = function(ktv) {
    return ktv.distance || (ktv.lat ? utils.getDistance(ktv.lat, ktv.lng) : "");
};

exports.backgroundImage = function(url) {
    return url ? {
        backgroundImage: "url(" + utils.encodeBackgroundImageUrl(url) + ")"
    } : null;
};