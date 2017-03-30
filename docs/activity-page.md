# 活动页面

每个活动单独一个文件夹，公共文件放在 assets 目录。

## 开发

活动页面未使用 webpack，开发方式自定。

## 发布

```
npm run act
```

该脚本会把所有活动页面的 JS/CSS 文件添加版本号、压缩图片、删除 JS 中的 `http://dev-yedian.chinacloudapp.cn` 字符串，最后发布到 dist 目录。

## yd.js

活动页面的公用 JS 库，依赖于 jQuery。

### init(callback, shareDate)

执行微信授权和登录操作，成功后会自动配置 `wx.config`，调用 `callback`, 如果传入第二个参数，则自动注册分享内容。

```javascript
YD.init(function() {
    // 授权并登录成功
    // YD.OPEN_ID = 用户的 openid
    // YD.API_BASE_URL = API 接口地址
    // YD.APP_ID = 微信公众号的 App ID
}, {
    title: "分享标题",
    desc: "分享描述",
    link:  "分享链接",
    imgUrl: "分享图片"
});
```

### getURLParameter(name)

返回 URL 中的参数值。

### getCleanQueryString(extra)

返回删除 `["code", "state", "from", "isappinstalled"].concat(extra)` 这些参数后的 QueryString。

### setCookie(name, value, days)

设置 Cookie。

### getCookie(name)

获取 Cookie。

### removeCookie(name)

删除 Cookie。

### closeWindow()

关闭当前页面。