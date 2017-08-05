## P7: 街区地图
### 项目说明
利用谷歌地图API开发一个单页的应用程序，在这个程序中可以轻松过滤当前突出显示的地点，然后，还可以查看WikiPidea的查询记录，在弹出窗口可以看到Foursquare的纪录。
最有趣的是你在输入字符的时候就开始自动检索，没有用任何第三方程序完成，欢迎体验和提出建议。

### 文件介绍
#### JS库文件：
这里我们用了KnockOut 和jQuery的库文件，同时我自己还写了一个工具类库文件util.js，主要实现了两个函数：时间格式化和数组clone。
#### 主程序文件 main.js，这里面分了几个部分：
- 全局变量，定义了全局变量：map, locations, showAddList(是否显示地址清单)；
- 地图函数部分，initMap()以及和他相关的toggleBounce和populateInfoWindow，这个主要是和地图的加载相关，因此都放在前面作为全局函数；
- 接下来是数据Model部分，主要是两个主要函数，获取Wiki和Foursquare数据；
- 接下来是controller部分omnibox，主要是响应Web UI的各种action，然后去Model获取数据和调用View部分来进行显示。
- 接下来是view部分，主要是两个view: wikiView处理Wiki的显示，和infoWindownView处理Foursquare数据的显示。
- 最后是KnockOut部分，就是VM部分，主要是对地址数组的动态显示，这个是最核心部分，这个带动了整个应用的运行，地址的查找，marker的动态显示

#### HTML文件: index.html，这个文件主要是提供css和基本DOM元素。

### 主要突出点说明，对主程序主要突出需要介绍的地方进行说明。
#### 数组和binding
把主要的数组locations作为了KnockOut的observableArray，里面包含了keyword，location坐标和marker，这个非常方便，这样我们通过对这个数组的实时操作和UI的显示结合起来。但是由于他变成了一个动态数据，我们无法获得原始数据，因此我这里对原始数据clone了一份，这样任何时候需要原始数据都可以获得，这个是整个搜索算法的核心。

``` js
    var newLocations = ko.observableArray();
    var locationsCopy = locations.clone();
```

    另外如果对数组bind以后，随着数据的每一次loop都会调用click事件，这个让我苦恼了好处事件，实际上我不希望他在初始化的时候每一次调用click事件，而是希望真正鼠标进行click之后再调用这个函数，加载和显示当前纪录。终于我想到了鼠标事件MouseEvent的使用，event.button返回是0的时候，才是鼠标的click事件触发了，解决了这个问题。

``` js
    this.loadWiki = function(item, event){
      if(event.button ==0){ // Only handle the real click action, otherwise it will handle data with the loop.
        model.updateMarkers(item.title);
        this.showAddList(false);
        model.getResultsFromWiki(item.title);
      }
```
#### 两次绑定的困惑：
    我本来打算对返回WikiPidea数组继续绑定时，总是提示我两次绑定一个值，因为wiki数据实际上是loadWiKi函数里面发生的，我一直希望突破这个错误，但是要么就是对当前的wiki数组没有定义，要么就是两次绑定，我希望接下来再继续突破。因此，我只好把wiki返回结果动态加载在DOM元素中，而不是先定义好元素，然后bind去动态显示。

#### Google maps API的使用：
- makers的动态效果，谷歌也有明确的函数，直接使用，不用自己再生写。
``` js
    function toggleBounce(marker) {  
        if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    };
```
- 街景图片的获取，这个也是直接读取API文档，多试几次即可，里面有3个主要的属性: heading, fov和pitch, 有[详细文档说明](https://developers.google.com/maps/documentation/streetview/)，这里就不赘述。
```
var streetView = "http://maps.googleapis.com/maps/api/streetview?location="
                +infowindow.marker.position.lat()+','+infowindow.marker.position.lng()
                +'&size=400x300&heading=60&fov=90&pitch=10';
```
- InfoWindow的使用，总统来说比较简单，其实相当于一个弹出窗口，主要是如何去把这个窗口的创建和消除逻辑想好，再把DOM元素的逻辑想好即可。

#### jQuery.ajax()部分：
- 从Wiki获得数据： 
    这部分不是很难，直接去[Wiki的开发者网站](https://www.mediawiki.org/wiki/API:Main_page)获得Guideline，我这里主要是采用了jsonp的获取方式。

- 从Foursquare获得数据：
    这部分也不难，同样要去该网站[https://developer.foursquare.com/](https://developer.foursquare.com/),最好的办法就是把获取的json数据自己log下来进行解析，然后去的相关的值，当然这里面发现了两个问题，第一个返回值里面有一个30元素的数据，太多了，我最终只取了前5个，第二个问题是，返回值里面有些元素会是空的，比如contact, 或者url对象，有的纪录就没有。应该对每个返回值是否为空加一个判断，我这里没有做，但是后期会加的。
    如果不知道如何解析，也可以看他的文档里面有对一个[venue完整纪录的文档](https://developer.foursquare.com/docs/responses/venue).
** 如何处理ajax的异常，这个也不难，主要是jQuery的文档已经有介绍，可以去仔细阅读和实验一下:[http://api.jquery.com/jquery.ajax/](http://api.jquery.com/jquery.ajax/)

#### 其他重要部分：
- 正则表达式：
    如果要对字符进行操作，必须要求掌握正则表达式，好在这个也不难。下面是搜索的正则表达式：
    - 去掉左右空字符：
    ```
    inputText = inputText.replace(/(^\s*)|(\s*$)/g, "");
    ```
    - 查找字符串：
    ```
    var re = new RegExp(inputText,"gi");
    ```
- API key:
    - Wiki Key: 没有
    - Foursquare key: 需要替换成你的key
    - Google maps key: 需要替换成你的key


### 主要文档和链接：
- [http://api.jquery.com/jquery.ajax/](http://api.jquery.com/jquery.ajax/);
- [https://developer.foursquare.com/docs/](https://developer.foursquare.com/docs/);
- [谷歌地图API](https://developers.google.com/maps/documentation/javascript/reference);
- [MDN 文档，非常有用](https://developer.mozilla.org/en-US/docs/Tools);

### 意见以及反馈： wolfgao.yang@gmail.com

