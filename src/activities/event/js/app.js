var ktvdata;
var coupon;
var page;

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371;

    var deltaLat = deg2rad(lat2 - lat1);
    var deltaLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1);
}

function genList(list) {
    var html = "<ul>";

    $.each(list, function(idx, ktv) {
        html += "<li><a href='/dist/#!/ktv/" + ktv.id + "' data-idx='" + idx + "' data-id='" + ktv.id + "'><div class='inner'>" + "<div class='pic' style='background-image:url(" + ktv.pic.replace(" ", "%20").replace("(", "\\(").replace(")", "\\)") + ")'></div>" + "<h3 class='name'>" + ktv.name + "</h3><span class='area'>" + ktv.area + "</span>" + "</div></a></li>";

        if (idx % 2 === 1) html += "</ul><ul>";
    });

    if (html.substring(html.length - 4) === "<ul>") html = html.substring(0, html.length - 4);

    $(".recommend-list").html(html).find("a").click(function() {
        var el = this;
        _hmt.push(["_trackEvent", "ktv_" + el.dataset.idx, "ktv_" + el.dataset.idx]);
        _hmt.push(["_trackEvent", "ktv_" + el.dataset.id, "ktv_" + el.dataset.id]);

        setTimeout(function() {
            location.href = el.href;
        }, 500);
        return false;
    });
}

function geoError() {
    $.getJSON(YD.API_BASE_URL + "wechat_ktv/Home/Event/ktv_recommend", function(data) {
        var list = data.data.map(function(item) {
            return {
                name: item.name,
                area: item.district,
                pic: item.room_pic_small,
                id: item.ktvid
            };
        });
        genList(list);
    });
}

function goPage(pid) {
    var $tmpl = $("#" + pid);
    page = pid;
    $("body").attr("class", $tmpl.attr("class") || "");
    $("#main").html($tmpl.html());

    $("#logo, #rules").show();

    $("[data-track]").click(function() {
        var el = this;
        var data = $(el).data("track");

        _hmt.push(["_trackEvent", data, data]);

        setTimeout(function() {
            location.href = el.href;
        }, 500);

        return false;
    });

    if (coupon) {
        $(".coupon").addClass("type-" + coupon.beer_type + " count-" + coupon.count);
    }

    switch (pid) {
        case "ktv":
            wx.ready(function() {
                wx.getLocation({
                    type: "gcj02",
                    success: function(res) {
                        $.getJSON(YD.API_BASE_URL + "booking/xktvcoords", function(data) {
                            var list = data.list.filter(function(item) {
                                return item.sjq;
                            });
                            list.forEach(function(item) {
                                item.distance = getDistance(item.lat, item.lng, res.latitude, res.longitude);
                            });
                            list.sort(function(a, b) {
                                return a.distance - b.distance;
                            });
                            list = list.slice(0, 6);

                            $.post(YD.API_BASE_URL + "booking/xktvlist", JSON.stringify({
                                list: list.map(function(item) {
                                    return item.xktvid;
                                })
                            }), function(data) {
                                genList(data.list.map(function(ktv) {
                                    return {
                                        name: ktv.xktvname,
                                        area: ktv.district,
                                        pic: ktv.piclist[0].smallpicurl,
                                        id: ktv.xktvid
                                    };
                                }));
                            });
                        });
                    },
                    fail: geoError,
                    cancel: geoError
                });
            });
            break;
        case "reg":
            $.get(YD.API_BASE_URL + "wechat_ktv/Home/Event/addMobile", {
                mobile: "",
                openid: YD.OPEN_ID
            });
            break;
        case "offline31":
        case "offline32":
            if (ktvdata) $(".btn-ktv").html("预订" + ktvdata.name.replace(/(\(|（)/, "<br>$1")).attr("href", "/dist/#!/ktv/" + ktvdata.ktvid);
            break;
        default:
            break;
    }

    _hmt.push(["_trackPageview", location.pathname + "#/" + pid]);
}

YD.init(function() {
    // /wechat_ktv/Home/Event/enter/ktvid/XKTV00001
    $.getJSON(YD.API_BASE_URL + "wechat_ktv/Home/Event/getktvinfo", function(data) {
        if (data.result === 0) {
            ktvdata = data.info;
            $.getJSON(YD.API_BASE_URL + "coupon/getcouponbyevents", function(data) {
                coupon = data.coupon;

                goPage(data.result === 0 ? "offline31" : "offline32");
            });
        } else {
            $.getJSON(YD.API_BASE_URL + "coupon/getcouponstatusbyevents", function(data) {
                var got = data.result === 1;
                coupon = data.coupon;

                $.getJSON(YD.API_BASE_URL + "wechat_ktv/Home/Event/is_subcribe", {
                    openid: YD.OPEN_ID
                }, function(data) {
                    var subscribe = data.result === 0;

                    if (got) {
                        goPage(subscribe ? "yy" : "yw");
                    } else {
                        goPage(subscribe ? "ktv" : "reg");
                    }
                });
            });
        }
    });
}, {
    title: "夜点送您KTV派对啤酒兑酒券",
    desc: "为您的KTV派对加点料！夜点兑酒券发放中，无论新老用户，点击即可参与抽奖！马上参与！",
    link: location.origin + location.pathname,
    imgUrl: location.origin + location.pathname + "/img/weixin_share_pic.jpg",
    success: function(res) {
        _hmt.push(["_trackEvent", page + res.errMsg, page + res.errMsg]);
    }
});
