var $countdowns = $("#countdown, #popup_countdown .countdown");

var eventStatus = 0;
var targetDate;
var serverDate;
var startTime;
var countdownTimer;
var waitAnimateTimer;
var fakeQueueTimer;

var SECOND = 1;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;

$.ajaxSetup({
    timeout: 20e3
});

function padZero(n) {
    return n < 10 ? "0" + n : n;
}

function grab() {
    $.post(YD.API_BASE_URL + "wechat_ktv/Home/OneYuan/getzige", {
        uid: YD.OPEN_ID
    }).done(function(data) {
        $("#mainPage, #popup_queue").hide();
        $(".queue_animate .can").remove();
        clearTimeout(waitAnimateTimer);

        if (data.result === 0 && data.zige_info.zhongjiang) {
            $("#winPage").show();
            _hmt.push(["_trackPageview", location.pathname + "#/win"]);
        } else {
            $("#losePage").show();
            _hmt.push(["_trackPageview", location.pathname + "#/lose"]);
        }
    }).fail(function() {
        $("#losePage").show();
        _hmt.push(["_trackPageview", location.pathname + "#/lose"]);
    });
}

function addCan() {
    $(".queue_animate").append("<div class='can' />");
    waitAnimateTimer = setTimeout(addCan, 1300);
}

function countdown() {
    var elapsedTime = Date.now() - startTime;
    var deltaInSecond = Math.round((targetDate - (serverDate + elapsedTime)) / 1e3);

    var hours = Math.floor(deltaInSecond / HOUR);
    var minutes = Math.floor((deltaInSecond % HOUR) / MINUTE);
    var seconds = Math.floor((deltaInSecond % MINUTE) / SECOND);

    if (deltaInSecond > 0) {
        $countdowns.text(padZero(hours) + " : " + padZero(minutes) + " : " + padZero(seconds));
    } else {
        $("#popup_countdown").hide();
        $("#mainPage").removeClass("countdown").addClass("grabing");
        clearInterval(countdownTimer);
        eventStatus = 1;
    }

    countdownTimer = setTimeout(countdown, 1e3);
}

$(".queue_animate").on("webkitAnimationEnd animationend", function(event) {
    $(event.target).remove();
});

$("#grab").click(function() {
    if (eventStatus === 0) {
        $("#popup_countdown").show();
    } else if (eventStatus === 1) {
        $("#popup_queue").show();
        addCan();
        fakeQueueTimer = setTimeout(grab, 6e3 + Math.random() * 4e3);
    }
});

$(".popup .btn_close").click(function() {
    $(this).closest(".popup").hide();
});

$("#popup_queue .btn_close").click(function() {
    $(".queue_animate .can").remove();
    clearTimeout(waitAnimateTimer);
    clearTimeout(fakeQueueTimer);
});

$("#losePage .btn_again").click(function() {
    $("#mainPage").show();
    $("#losePage").hide();
});

$("#winPage form").submit(function() {
    var phone = this.phone.value;

    if (!/1\d{10}/.test(phone)) {
        alert("请输入手机号");
        return false;
    }

    $.post(YD.API_BASE_URL + "wechat_ktv/Home/OneYuan/AddMobile", {
        mobile: phone,
        uid: YD.OPEN_ID
    }, function(data) {
        if (data.result === 0) {
            $("#winPage form").off("submit");
            $("#popup_code").show().find(".code").val(data.duijiangma);
        } else {
            alert(data.msg);
        }
    });

    _hmt.push(["_trackEvent", "win提交", "win提交"]);
    return false;
});

$(".btn_friends").click(function() {
    $("#shareLayer").show();
});

$("#shareLayer").click(function() {
    $(this).hide();
});

$("[data-track]").click(function() {
    var el = this;
    var data = $(el).data("track");

    _hmt.push(["_trackEvent", data, data]);

    if (el.href) {
        setTimeout(function() {
            location.href = el.href;
        }, 500);
        return false;
    }
});

YD.init(function init() {
    $.post(YD.API_BASE_URL + "wechat_ktv/Home/OneYuan/getTime", JSON.stringify({
        uid: YD.OPEN_ID
    })).done(function(data) {
        var shareData = {
            title: "什么！不花钱就能办派对？",
            link: location.origin + location.pathname,
            imgUrl: location.origin + location.pathname + "/img/weixin_share_pic.jpg",
            success: function(res) {
                _hmt.push(["_trackEvent", res.errMsg, res.errMsg]);
            }
        };

        if (data.result === 0) {
            $("#mainPage").css("background-image", "url(" + data.active_status.event.background + ")");
            $(".ktv-link").attr("href", "/dist/#!/ktv/" + data.active_status.event.ktvid);

            shareData.desc = data.active_status.event.act_desc;
            wx.ready(function() {
                wx.onMenuShareTimeline(shareData);
                wx.onMenuShareAppMessage(shareData);
                wx.onMenuShareQQ(shareData);
            });

            if (data.zhongjiang_status.status) {
                $("#winPage").show();
                if (data.zhongjiang_status.duijiangma) {
                    $("#popup_code").show().find(".code").val(data.zhongjiang_status.duijiangma);
                }
            } else {
                targetDate = data.active_status.event.starttime * 1e3;
                serverDate = data.active_status.now * 1e3;
                startTime = Date.now();

                switch (data.active_status.is_over) {
                    case 0:
                        if (Math.round((targetDate - serverDate) / 1e3) > 0) {
                            eventStatus = 0;
                            $("#mainPage").addClass("countdown");
                            countdown();
                        } else {
                            eventStatus = 1;
                            $("#mainPage").addClass("grabing");
                        }
                        break;
                    case 1:
                        eventStatus = 2;
                        $("#mainPage").addClass("over");
                        break;
                }

                $("#mainPage").show();
            }
        } else {
            alert(data.msg);
        }
    }).fail(init);
});
