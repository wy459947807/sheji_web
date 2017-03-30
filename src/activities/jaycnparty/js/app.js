var page;

function showRegModal(data) {
    $("#regForm .day").text(data.day);
    $("#regForm .groupname").text(data.name);
    $("#regForm").get(0).gid.value = data.id;
    $("#modal-reg").show();
}

function goPage(pid, pdata) {
    /* globals template */

    page = pid;

    switch (pid) {
        case "index":
            var data = pdata;

            $("#main").html(template("tmpl-" + pid, {
                over: !data.event_status.status,
                address: data.address,
                remain: data.roomlist["24"].count,
                total: data.roomlist["24"].total,
                day24groups: data.roomlist["24"].list
            }));

            $(".address").text(data.address);

            $("#groupBox .tabs a").click(function() {
                if ($(this).hasClass("active")) return false;

                var day = $(this).data("day");

                $(".tabs .active, .tab-pane.active").removeClass("active");
                $(this).addClass("active");
                $("#day" + day).addClass("active");

                $(".members").text(data.roomlist[day].count + "/" + data.roomlist[day].total);

                return false;
            });

            $("#btnRundown").click(function() {
                $("#modal-rundown").show();
                _hmt.push(["_trackEvent", "jay_rundown", "jay_rundown"]);
                return false;
            });

            $("#btnKtv").click(function() {
                var link = this.href;
                $("#modal-rundown").show();
                _hmt.push(["_trackEvent", "jay_ktv", "jay_ktv"]);
                setTimeout(function() {
                    location.href = link;
                }, 300);
                return false;
            });
            $("#groupBox .info").click(function() {
                var id = $(this).data("id");
                goPage("groupDetail", id);
                _hmt.push(["_trackEvent", "jay_group" + id, "jay_group" + id]);
            });
            $("#groupBox .btnJoin").click(function() {
                var id = $(this).data("id");
                showRegModal({
                    day: $(this).data("day"),
                    id: id,
                    name: $(this).closest(".group").find(".name").text()
                });
                _hmt.push(["_trackEvent", "jay_join" + id, "jay_join" + id]);
            });
            break;

        case "groupDetail":
            $.get(YD.API_BASE_URL + "wechat_ktv/Home/JayEvent/roomdetail/id/" + pdata, function(data) {
                data.roominfo.day = data.roominfo.date.match(/\d+/g)[2];
                $("#main").html(template("tmpl-" + pid, data.roominfo));

                $("#btnJoin").click(function() {
                    showRegModal({
                        day: data.roominfo.day,
                        id: data.roominfo.id,
                        name: data.roominfo.name
                    });
                    _hmt.push(["_trackEvent", "jay_join", "jay_join"]);
                    return false;
                });
            });
            break;

        case "orderDetail":
            $("#main").html(template("tmpl-" + pid, pdata));
            shareData.title = "我在" + pdata.day + "日杰迷派对的" + pdata.name + "小组，一起来!";
            shareData.link = location.origin + location.pathname + "?invite=" + YD.OPEN_ID;

            $("#btnFriend").click(function() {
                $("#shareLayer").show();
                _hmt.push(["_trackEvent", "jay_friend", "jay_friend"]);
            });
            break;

        case "share":
            $.post(YD.API_BASE_URL + "wechat_ktv/Home/JayEvent/roomlist", {
                openid: YD.OPEN_ID
            }, function(data) {
                $("#main").html(template("tmpl-" + pid, {
                    address: data.address,
                    remain: data.roomlist["24"].count,
                    total: data.roomlist["24"].total
                }));
            });
            break;

        case "invite":
            var friendId = YD.getURLParameter("invite");
            $.post(YD.API_BASE_URL + "wechat_ktv/Home/JayEvent/checkstatus", {
                openid: friendId
            }, function(data) {
                data.Event_info.day = data.Event_info.date.match(/\d+/g)[2];
                shareData.title = "我在" + data.Event_info.day + "日杰迷派对的" + data.Event_info.name + "小组，一起来!";
                shareData.link = location.origin + location.pathname + "?invite=" + friendId;
                $("#main").html(template("tmpl-" + pid, data.Event_info));
            });
            break;

        default:
            $("#main").html($("#tmpl-" + pid).html());
            break;
    }

    _hmt.push(["_trackPageview", location.pathname + "#/" + pid]);
}

$(".modal .close").click(function() {
    $(this).closest(".modal").hide();
});

$("#shareLayer").click(function() {
    $("#shareLayer").hide();
});

$("#regForm").submit(function() {
    if (!this.name.value) {
        alert("请输入昵称");
        return false;
    }
    if (!(/^1\d{10}$/.test(this.phone.value))) {
        alert("请输入手机号");
        return false;
    }
    if (this.gender.value === "-1") {
        alert("请选择性别");
        return false;
    }

    var day = $(this).find(".day").text();
    var groupid = this.gid.value;
    var groupname = $(this).find(".groupname").text();

    $.post(YD.API_BASE_URL + "wechat_ktv/Home/JayEvent/submit_info", {
        nick_name: this.name.value,
        mobile: this.phone.value,
        sex: this.gender.value,
        id: groupid,
        openid: YD.OPEN_ID
    }, function(data) {
        if (data.result === 0) {
            goPage("orderDetail", {
                address: data.address,
                qrcode: data.hexiaoma,
                name: groupname,
                id: groupid,
                day: day
            });
            $("#modal-reg").hide();
        } else {
            alert(data.msg);
        }
    });

    _hmt.push(["_trackEvent", "jay_submit", "jay_submit"]);

    return false;
}).find("select").one("change", function() {
    $(this).removeClass("default");
});


YD.init(function() {
    $.post(YD.API_BASE_URL + "wechat_ktv/Home/JayEvent/roomlist", {
        openid: YD.OPEN_ID
    }, function(data) {
        if (data.is_join.status) {
            goPage("orderDetail", {
                address: data.address,
                qrcode: data.is_join.order_info.duijiangma,
                name: data.is_join.order_info.name,
                id: data.is_join.order_info.id,
                day: data.is_join.order_info.date.match(/\d+/g)[2]
            });
        } else {
            if (YD.getURLParameter("share")) {
                goPage("share");
            } else if (YD.getURLParameter("invite")) {
                goPage("invite");
            } else {
                goPage("index", data);
            }
        }
    });
}, {
    title: "来这里和上百杰迷唱双截棍",
    desc: "周董演唱会前，先来感受一下上百杰迷合唱双截棍的K房派对吧！",
    link: location.origin + location.pathname + "?share=1",
    imgUrl: location.origin + location.pathname + "/img/weixin_share_pic.jpg",
    success: function(res) {
        _hmt.push(["_trackEvent", "jay_" + page + res.errMsg, "jay_" + page + res.errMsg]);
    }
});
