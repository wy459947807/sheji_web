var modulesMap = {
    nnnn: "dq",
    nnny: "db",
    nnyn: "dtq",
    nynn: "eq",
    ynnn: "lq",
    yynn: "lq",
    ynyn: "dtq",
    ynny: "bl",
    nyyn: "dtq",
    nyny: "be",
    nnyy: "dbt",
    yyyn: "dtq",
    yyny: "bl",
    ynyy: "dbt",
    nyyy: "dbt",
    yyyy: "dbt",
    zero: "zq"
};

function displayModules(lg, gq, lguo, gz, couponStatus, coupon) {
    var key = (lg ? "y" : "n") + (gq ? "y" : "n") + (lguo ? "y" : "n") + (gz ? "y" : "n");
    var modules = modulesMap[key].split("");

    modules.forEach(function(module) {
        switch (module) {
            case "d":
                $("#count").text("恭喜您，获得" + coupon.name);
                $("#remain").text("共" + couponStatus.total + "张，还剩" + couponStatus.count + "张");
                $("#coupon").addClass("coupon-" + coupon.beer_type + "-" + coupon.count);
                $("#couponBox").show();
                break;
            case "b":
                $("#btns, #btnsHolder").show();
                break;
            case "l":
                $("#heading").addClass("late").show();
                break;
            case "e":
                $("#heading").addClass("expired").show();
                break;
            case "t":
                $("#tip").show();
                setTimeout(function() {
                    $("#tip").hide();
                }, 3e3);
                break;
            case "q":
                $("#qrcodeBox").show();
                break;
            case "z":
                $("#heading").addClass("lose").show();
                break;
            default:
                break;
        }
    });

    $("#main").show();
}

$("#btns a").click(function() {
    var link = this.href;
    var track = "redpacket_" + $(this).data("track");

    setTimeout(function() {
        location.href = link;
    }, 300);

    _hmt.push(["_trackEvent", track, track]);

    return false;
});

YD.init(function() {
    var couponId = YD.getURLParameter("coupon");

    $.post(YD.API_BASE_URL + "coupon/getcouponbyshare", JSON.stringify({
        openid: YD.OPEN_ID,
        code: couponId
    }), function(data) {
        if (data.result === 0) {
            displayModules(data.is_lingguang, data.is_guoqi, data.is_lingguo, data.is_subscribe, data.coupon_status, data.coupon);
        } else {
            displayModules(false, true, false, false);
        }

        setTimeout(function() {
            /* globals IScroll */
            var myScroll = new IScroll("#wrapper", {
                preventDefaultException: {
                    className: /pde/
                }
            });
        }, 1e3);
    });

    _hmt.push(["_trackPageview", location.pathname + (couponId ? "?coupon=" + couponId : "")]);
}, {
    title: "夜点送你KTV兑酒券！",
    desc: "好友K歌局，有酒才痛快！夜点免费兑酒券，等你来抢！",
    link: location.origin + location.pathname + "?coupon=" + YD.getURLParameter("coupon"),
    imgUrl: location.origin + location.pathname + "/img/weixin_share_pic.jpg"
});