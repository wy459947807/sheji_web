export const PAGE_STATUS = {
    FAILED   : -1,  // 加载失败
    DONE     : 0,   // 加载完毕
    LOADING  : 1,   // 正在加载
    COMPLETED: 2    // 已全部加载
};

export const ORDER_STATUS = {
    1  : "预约中…",    // Pending
    14 : "已过期",     // Expired
    17 : "等待支付",   // Waiting Cash
    18 : "已支付",     // Paid by Wechat
    19 : "已支付",     // Paid by Alipay
    20 : "已支付",     // Paid by Cash
    21 : "退款中",     // Refunding
    22 : "退款完成",   // Refunded
    23 : "支付失败",   // Payment fail
    3  : "已确认",     // Confirmed
    7  : "已取消",     // Canceled
    5  : "已完成",     // Complete
    4  : "已满房",     // Rejected
    8  : "已删除"      // Deleted
};

export const DEVICE_NAMES = {
    bathroom           : "独立卫生间",
    yedianpad          : "夜点PAD",
    wirelessmicrophones: "无线麦克风",
    themerooms         : "主题包房",
    parking            : "停车场",
    buffet             : "自助餐",
    xktv               : "XKTV触摸桌",
    wifi               : "免费WiFi",
    tm                 : "弹幕",
    zxgy               : "观影",
    sjdg               : "手机点歌",
    zqss               : "足球赛事"
};
