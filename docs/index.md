# 开发指南

## 技术栈

Vue.js + vue-router + vue-resource + gulp + webpack + ES6 + SASS


## 目录结构

```
├── build                     // webpack 配置
│   ├── webpack.base.conf.js  // 基础配置
│   ├── webpack.dev.conf.js   // 开发环境
│   └── webpack.prod.conf.js  // 生产环境
├── deploy.sh                 // 更新测试服务器文件
├── dist                      // 发布目录
├── docs                      // 文档
├── gulpfile.js
├── package.json
└── src                       // 项目源码
    ├── activities            // 活动页面
    ├── components            // Vue 组件
    ├── constants             // 常量
    ├── directives            // Vue 指令
    ├── filters               // Vue 过滤器
    ├── img                   // 图片
    ├── index.html            // App Page
    ├── landing.html          // Landing Page
    ├── landing.js            // Landing Page 入口文件
    ├── libs                  // 非第三方库
    ├── main.js               // App Page 入口文件
    ├── plugins               // Vue 插件
    ├── scss                  // SASS 样式文件
    ├── share.html            // Share Page
    ├── share.js              // Share Page 入口文件
    ├── vendor                // 第三方库
    └── views                 // Vue 页面组件
```


## 安装依赖

```
npm install
```


## 启动开发环境

```
npm run dev
```

启动完成后访问：[http://localhost:8080](http://localhost:8080)，修改文件后页面会实时刷新。

该命令包括了将 img/sprites 文件夹下的 2 倍图制作成一个 CSS Sprite 图片。


## 编译打包

```
npm run build
```

编译后的文件会发布在 dist 目录。

## 可用组件

参考 [组件文档](vue-components.md)。

## 活动页面

参考 [活动页面](activity-page.md)。