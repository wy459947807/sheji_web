# 组件文档

## 城市选择 <city-selector />

```html
<city-selector
    :province.sync="editAddress.prov"   
    :city.sync="editAddress.city"
    :district.sync="editAddress.county"></city-selector>
```

### 选项

| 参数       | 类型     | 默认值  | 说明   |
| -------- | ------ | ---- | ---- |
| province | String |      | 省    |
| city     | String |      | 市    |
| district | String |      | 区    |



## Flash 消息 <flash-message />

```html
<flash-message v-ref:flash-message></flash-message>	
```

```javascript
this.$refs.flashMessage.show("smile", "<p>感谢您的反馈！</p>");
```

### 选项

| 参数       | 类型       | 默认值     | 说明                                      |
| -------- | -------- | ------- | --------------------------------------- |
| hidden   | Boolean  | true    | 是否隐藏                                    |
| icon     | String   | success | 消息图标，可选值：success, smile                 |
| message  | String   |         | 消息内容                                    |
| btnText  | String   | 确定      | 按钮文字                                    |
| callback | Function |         | 点击按钮触发的回调，如果设置该参数，则点击确定不自动隐藏消息，而是取决于返回值 |

### 方法

| 方法                            | 说明   |
| ----------------------------- | ---- |
| show(icon, message, callback) | 显示   |
| hide                          | 隐藏   |



## KTV 列表项 <ktv-item />

```html
<ul class="ktv-list">
    <ktv-item v-for="ktv in list" :ktv="ktv"></ktv-item>
</ul>
```

### 选项

| 参数   | 类型     | 默认值  | 说明     |
| ---- | ------ | ---- | ------ |
| ktv  | Object |      | KTV 数据 |



## 列表 <list-view />

普通列表：

```html
<list-view class="has-arrow">
    <a :href="tel"><span class="icon icon-phone"></span><div class="flex">.flex 是自适应宽度</div></a>
</list-view>
```

选择列表：

```html
<list-view>
    <div class="active">
        <div class="flex">选中</div>
        <span class="check"></span>
    </div>
    <div>
        <div class="flex">未选中</div>
        <span class="check"></span>
    </div>
</list-view>
```

其他用法：

```html
<list-view>
    <div class="align-top"><span class="icon blank"></span><div class="flex">顶部对齐</div></a>
    <div class="has-arrow"><span class="icon blank"></span><div class="flex">带小箭头</div></a>

    <div>
        <span class="icon-blank"></span>
        <div class="flex align-top">顶部对齐</div>
        <div class="align-center">居中对齐</div>
      </div>
    </div>

    <div>
        <span class="icon-blank"></span>
        <div class="flex">
            <h4 class="title">标题</h4>
            <p class="desc">描述</p>
        </div>
    </div>
</list-view>
```

### Slot

列表内容



## 加载提示 <loading />

```html
<loading v-show="status==PAGE_STATUS.LOADING" :inline-mode="list.length>0"></loading>
```

### 选项

| 参数         | 类型      | 默认值   | 说明    |
| ---------- | ------- | ----- | ----- |
| inlineMode | Boolean | false | 非全屏显示 |



## 模态弹窗 <modal />

```html
<modal
    title="绑定手机号码"
    :btn-disabled="isInvalid"
    :submit="updateMobile">
    <list-view>
        ...
    </list-view>
</modal>
```

### 选项

| 参数          | 类型       | 默认值   | 说明          |
| ----------- | -------- | ----- | ----------- |
| show        | Boolean  | false | 是否显示        |
| closeable   | Boolean  |       | 是否显示右上角关闭按钮 |
| showBtn     | Boolean  |       | 是否显示        |
| btnText     | String   | 确定    | 按钮文字        |
| btnDisabled | Boolean  | false | 是否是禁用状态     |
| submit      | Function |       | 点击按钮触发的回调   |
| title       | String   |       | 标题          |

### 方法

| 方法                    | 说明            |
| --------------------- | ------------- |
| open                  | 显示            |
| close                 | 隐藏            |
| setLoading(isLoading) | 设置按钮为"正在提交"状态 |

### Slot

内容



## 评分 <rating />

```html
<rating :value.sync="ratings.app" :size="22">
```

### 选项

| 参数          | 类型      | 默认值   | 说明       |
| ----------- | ------- | ----- | -------- |
| max         | Number  | 5     | 星星数量     |
| value       | Number  | 0     | 默认值      |
| disabled    | Boolean |       | 禁用       |
| size        | Number  | 19    | 星星大小（px） |
| color       | String  | #fff  | 默认颜色     |
| activeColor | String  | #fff  | 高亮颜色     |
| solid       | Boolean | false | 实心样式     |
| once        | Boolean | false | 只能改变一次   |

### 

## 屏幕消息 <screen-message />

```html
<screen-message
    v-if="status==PAGE_STATUS.FAILED"
    message="加载失败, 点击重试"
    :info="errorMsg"
    @click="fetch"></screen-message>
```

### 选项

| 参数         | 类型      | 默认值   | 说明    |
| ---------- | ------- | ----- | ----- |
| inlineMode | Boolean | false | 非全屏显示 |
| message    | String  |       | 消息正文  |
| info       | String  |       | 辅助消息  |

### 

## 幻灯片 <simple-slider />

```html
<simple-slider
    :slides="banners"
    :click="handleBanner"
    :auto="true"></simple-slider>
```

### 选项

| 参数      | 类型       | 默认值   | 说明                      |
| ------- | -------- | ----- | ----------------------- |
| slides  | Array    | []    | 幻灯片列表，单项为：`{pic, link}` |
| current | Number   | 0     | 当前幻灯片的索引值               |
| auto    | Boolean  | false | 是否自动播放                  |
| delay   | Number   | 7e3   | 自动播放时的切换间隔              |
| click   | Function |       | 点击幻灯片触发的回调，参数为 `link`   |

### 

## 数字输入框 <spin-box />

```html
<spin-box
    :max="maxQuantity"
    :value.sync="order.quantity"></spin-box>
```

### 选项

| 参数    | 类型     | 默认值  | 说明   |
| ----- | ------ | ---- | ---- |
| value | Number | 1    | 值    |
| min   | Number | 1    | 最小值  |
| max   | Number | 999  | 最大值  |
| step  | Number | 1    | 步进值  |

### 

## TabBar <tab-bar />

```html
<tab-bar></tab-bar>
```

