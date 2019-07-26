# BOT APP JS SDK

## GUID
一个H5应用接入到度秘需要哪些步骤？

* 创建一个技能，https://dueros.baidu.com/dbp/bot/index#/addbot/0，选择“自定义”，输入后“确定”，将技能ID发给度秘对接技术
* 集成度秘提供的JS-SDK，详见BotApp的初始化
* 如开发者有登录的需求，账号关联流程详见BotApp.requireLinkAccount
* 如开发者有支付的需求，详见BotApp.requireCharge

## BotApp的初始化
从以下两种方法中选出一种引入BotAppSDK

* 方法一
```javascript
import BotApp from '@baidu/duer.botapp-sdk';
```

* 方法二
```html
<script src="https://duer.bdstatic.com/saiya/dbp/sdk/botapp.xx.js"></script>
```


* 开始使用
```javascript
const botApp = new BotApp({
    random1: '3691308f2a4c2f6983f2880d32e29c84', // 随机字符串，长度不限，由开发者自己生成
    signature1: 'd85f5cfffe5450fe7855fec1fcfe0b16', // 将(random1 + appkey)的字符串拼接后做MD5运算得出
    random2: 'dc468c70fb574ebd07287b38d0d0676d', // 随机字符串，长度不限，由开发者自己生成
    signature2: '61dc2b99967e0b326e82e80b05571d22', // 将(random2 + appkey)的字符串拼接后做MD5运算得出
});
```
> 如何快速根据字符串生成MD5？
> 如果你的电脑装有MD5工具，则可参考如下方式生成
> ```bash
> md5 -s "string"
> ```

## BotApp.requireLinkAccount(data)
接入度秘上的H5应用，如有登录需要，必须和百度的账号体系进行绑定，此接口用来在度秘上发起账号绑定流程。

目前支持2种方案：
    
* 1、沿用百度账号体系oauth的授权流程，开发者需在http://developer.baidu.com/wiki/index.php?title=docs/oauth申请一个新的应用，并将oauth应用的相关信息提供给度秘。绑定成功后，会回调给开发者提供的callback H5地址。后续度秘请求的所有H5和接口回调，都会带上accessToken参数。开发者可以通过accessToken参数请求百度oauth的接口，再换取用户的具体信息。

* 2、开发者自己实现标准的oauth协议，并将oauth协议相关接口信息在度秘dbp平台上进行配置。授权成功后可在`onLinkAccountSucceeded(fn)`的回调函数中获取到accessToken。

	> 建议第三方开发者使用方案1，产品交互相对简单，用户只需要在设备上确认授权，即可自动登录


* 示例

    ```javascript
    botApp.requireLinkAccount();
    ```

## BotApp.onLinkAccountSuccess(handler)
获取oauth授权结果。此方法会监听oauth授权成功后的结果(*暂时无法捕获授权失败结果*)。

> 注意：仅当开发者选中上方的第二种授权方案时才会触发本函数的回调


* 参数

    handler(*Function*)：此函数接收一个参数，SDK收到授权成功的通知后会调用此函数下发accessToken等相关数据。其数据schema如下：

 ```javascript
    {
        "token": "{{STRING}}", // 标识本此返回
        "app":{
            "accessToken": "{{STRING}}" // 第三方平台的授权accessToken（非DuerOS使用的百度access_token）
        }
    }
    ```

* 示例

    ```javascript
    botApp.onLinkAccountSuccess(function (payload) {
        console.log(payload);
        // 结果如下：
        {
            token: '13782f3d-05cd-802d-f0a9-92bb0ac572c8',
            app:{
                accessToken: '21.15a2c2cd345816f2e51f9eae6e3d1f03.2592000.1566035530.2050908969-9943593'
            }
        }
    })
    ```

## BotApp.requireCharge(data)
在度秘上的H5应用可通过本方法发起支付，当用户在度秘上支付成功后会回调SDK`.onChargeStatusChange(fn)`中的回调函数，开发者可在回调函数中添加自己的业务逻辑处理
    
   对于用户支付成功的订单，会有服务端的订单通知接口，开发者应以该接口的订单支付成功通知为最终数据。

* 参数

    data(*Object*)：其schema如下：
    ```javascript
    {
        "token": "{{STRING}}", // 可选，本次事件的token，开发者可自己生成
        "chargeBaiduPay": {
            "authorizeAttributes": {
                "authorizationAmount": {
                    "amount": "{{STRING}}", // 价格
                    "currencyCode": "CNY" // 币种，目前仅支持 CNY
                },
                "sellerAuthorizationNote": "{{STRING}}" // 商家授权信息备注
            },
            "sellerOrderAttributes": {
                "sellerOrderId": "{{STRING}}", // 此笔交易，在商家这边的订单ID。当用户付款成功后，会带有此ID通知技能
                "productName": "{{STRING}}", // 商品名称
                "productId": "{{STRING}}", // 商品id
                "description": "{{STRING}}", // 商品描述信息。对商品的简单介绍
                "sellerNote": "{{STRING}}" // 商品的备注信息
            }
        }
    }
    ```

* 示例

    ```javascript
    const data = {
        token: 'fjaksvmakfjiefj23fdsnfs',
        chargeBaiduPay: {
            authorizeAttributes: {
                authorizationAmount: {
                    amount: '1.09',
                    currencyCode: 'CNY'
                },
                sellerAuthorizationNote: '双11大促'
            },
            sellerOrderAttributes: {
                sellerOrderId: 'hfuawffu2jkjk12e23',
                productName: 'Mac Book Pro 2019',
                productId: 'fjaksdfkvjsznvj',
                description: '笔记本电脑',
                sellerNote: '大促销'
            }
        }
    }
    botApp.requireCharge(data);
    ```

## BotApp.onChargeStatusChange(handler)
通知支付结果。该指令只是一个前端的通知，第三方开发者可以用此回调做页面的刷新。

* 参数

    handler(*Function*)：当DuerOS支付结果返回时，SDK会调用此函数。此函数有一个参数，其schema如下：
    ```javascript
    {
        "token": "{{STRING}}", // 标识本次返回
        "app":{
            "accessToken":"{{STRING}}" // oauth授权结果的accessToken
        },
        "authorizationDetails": {
            "authorizationAmount": { //
                "amount": "{{STRING}}", // 扣款金额。比如：1.09，数字字符串。系统取小数点后两位，单位：元
                "currencyCode": "CNY" // 枚举类型。目前只能为CNY
            },
            "capturedAmount": {
                "amount": "{{STRING}}", // 实际百度扣款金额。比如：1.09，数字字符串。系统取小数点后两位，单位：元
                "currencyCode": "CNY" // 枚举类型。目前只能为CNY
            },
            "creationTimestamp": {{INT32}}, // 订单创建时间。时间戳，单位毫秒
        },
        "baiduOrderReferenceId": "{{STRING}}" // 此次交易百度生成的订单ID
        "sellerOrderId":"{{STRING}}", // 对应支付的订单ID
        "purchaseResult":"{{ENUM}}", // 此次支付结果。 -枚举值，选值范围： - SUCCESS 支付成功 - ERROR 支付发生错误
        "message":"{{STRING}}" // 支付状态对应的消息
    }
    ```

* 示例
    ```javascript
    botApp.onChargeStatusChange(function (payload) {
        console.log(payload);
        // 打印结果如下：
        {
            token: 'faskdfkasdfsnvcknawjkenfjkwa', // 标识本次返回
            app:{
                accessToken: '21.15a2c2cd345816f2e51f9eae6e3d1f03.2592000.1566035530.2050908969-9943593'
            },
            authorizationDetails: {
                authorizationAmount: {
                    amount: "1.99",
                    currencyCode: 'CNY'
                },
                capturedAmount: {
                    amount: '1.09',
                    currencyCode: 'CNY'
                },
                creationTimestamp: '1546272000000',
            },
            accessToken: '21.15a2c2cd345816f2e51f9eae6e3d1f03.2592000.1566035530.2050908969-9943593',
            baiduOrderReferenceId: 'fjkasdfekfjsnvks',
            sellerOrderId: 'fskdfjmvckadfl',
            purchaseResult: 'SUCCESS',
            message: '支付成功'
        }
    })
    ```


##BotApp.onHandleIntent(handler)
意图下发。开发者在DBP平台上面开发的意图，在匹配到对应用户query之后,会封装对应意图成为Intent下发下来。
APP通过`intent.name`来确定意图名称，之后开发对应的逻辑。同时APP还可以通过`intent.slots`解析参数。
> 传送门：<a herf="https://dueros.baidu.com/dbp">DBP平台</a>

* 参数

    handler(Function)：SDK收到DuerOS解析的意图后会回调此函数，开发者可使用解析结果开发相关逻辑。handler函数接收一个payload参数，其schema如下：
    ```javascript
    {
        "token":"{{STRING}}",
        "app":{
            "accessToken":"{{STRING}}"
        },
        "intent":{
            "name":"{{STRING}}", // 意图名
            "slots":[
                {
                    "name":"{{STRING}}", // 槽位的槽位名
                    "value":"{{STRING}}" // 槽位的值
                }
            ]
        },
        "customData":{} // 自定义数据
    }
    ```

* 示例：

    ```javascript
    botApp.onHandleIntent(function (payload) {
        console.log(payload);
        // 结果如下：
        {
            token: 'cmkadjfqewjfidkvnksdnvkasjdf',
            app:{
                accessToken: '21.15a2c2cd345816f2e51f9eae6e3d1f03.2592000.1566035530.2050908969-9943593'
            },
           intent: {
               name: 'buy_ticket',
               slots: [
                    {
                       destination: '广州'
                    }
               ]
           },
           customData: {
           }
        }
    });
    ```

## BotApp.updateUiContext(data, [,handler])
新增一个自定义交互元素描述。


* 参数

    data(*Object*)：要上传的端状态数据，其schema如下
    ```javascript
    {
        "enableGeneralUtterances": "{{Boolean}}",
        "hyperUtterances": [
            {
                "url": "{{string}}"// 用于确定用户query的url
                "utterances": "{[{{string}}]}", // 支持的用户话术集合
                "type": "{{ENM}}",  // 枚举类型，自定义类型为link,系统还提供内建类型 input,select等等，具体见下方链接
                "parameters: "{[{"key": "{{string}}" ,"value": "{{string}}"}]} // 参数列表
            }
        ]
    }
    ```

    handler(*Function*)：成功发出该事件后此回调函数会被调用，参数是一个Boolean，标识本事件是否成功发起成功(注意不是请求成功，是指发起操作成功触发)。

* 示例
    ```javascript
    const data = {
        enableGeneralUtterances: true,
        hyperUtterances: [
            {
                url: 'https://www.baidu.com',
                utterances: ['你们好'],
                type: 'link',
                parameters: {
                }
            }
        ]
    };
    botApp.updateUiContext(data, function (result) {
        console.log(result);
        // 返回结果如下
        true
    })
    ```
> 参考：<a herf="https://github.com/dueros/AndroidBotSdkDemo">自定义交互元素</a>

## BotApp.listen([,handler]);
开启聆听。设备会进入语音交互转态。

* 参数

    handler(*Function*)：可选参数，该函数会接收一个Boolean，标识是否发起聆听成功。

* 示例
    ```javascript
    botApp.listen(function (result) {
        console.log(result);
        // 打印结果：
        // true
    });
    ```
## BotApp.speak(data, [,handler])
播报一段文本，播报完毕之后回调handler

* 参数
    handler(*Function*)：TTS播放完毕后回调此函数，本函数没有参数

* 示例
    ```javascript
    /**
    data: 要播报的TTS的文字内容
    */
    botApp.speak(data, function () {
        console.log('播报完毕');
        // 打印结果
        // 播报完毕
    }))
    ```
## BotApp.onClickLink(handler)
ClickLink事件下发。ClickLink是一种Directive，用户新增自定义交互之后，云端会解析用户定义的交互，下发对应的指令。例如APP通过`updateUiContext(UiContextPayload)`新增自定义交互之后DuerOS会通过此接口下发上面定义的url。

如果用户引用系统内建自定义类型，用户query中可以包含参数，例如"*输入北京*"，这个query中*北京*可以被解析成参数，放到后面`params`中下发。
>系统内建类型参考：<a herf="https://github.com/dueros/AndroidBotSdkDemo">DCS type文档</a>

* 参数

    handler(*Function*)：SDK收到DuerOS返回的结果后回调此函数，此函数的参数schema如下：

    ```javascript
    {
        "url": "{{STRING}}",
        "params":{
          "{{STRING}}": "{{ANY}}"
        }
    }
    ```

* 示例

    ```javascript
    botApp.onClickLink(function (payload) {
        console.log(payload);
        // 待补充打印结果
    })
    ```

## BotApp.onHandleScreenNavigatorEvent(handler)
屏幕导航事件。当用户发起语音请求，要求滚动屏幕时，本事件会被调用。

* 参数

    handler(*Function*)：当收到SDK收到DuerOS下发的屏幕导航事件时，本函数会被调用，参数是一个枚举型的值，可能是一下几种：

    NAV_SCROLL_LEFT(列表向左滚动)，
    NAV_SCROLL_RIGHT(列表向右滚动)
    NAV_SCROLL_UP(列表向上滚动)
    NAV_SCROLL_DOWN(列表向下滚动)
    NAV_NEXT_PAGE(下一页)
    NAV_PREVIOUS_PAGE(上一页)
    NAV_GO_BACK(返回上一页)
    NAV_GO_HOMEPAGE(返回主页);

* 示例

    ```javascript
    botApp.onHandleScreenNavigatorEvent(function (payload) {
        console.log(payload);
        //打印：
        // 'NAV_NEXT_PAGE'
    })
    ```
