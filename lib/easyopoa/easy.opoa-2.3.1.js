/**
 * EasyOPOA FrameWork
 * 
 * Version 2.3.1
 * 
 * http://easyproject.cn
 * https://github.com/ushelp/EasyOPOA
 * 
 * Copyright 2014 Ray [ inthinkcolor@gmail.com ]
 * 
 * Dependencies: jQuery
 * 
 */
(function(factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as anonymous module.
    define([ "jquery" ], factory);
  } else {
    // Browser globals.
    factory(jQuery);
  }
})(function($) {
  var // 覆盖的EasyOPOA变量
  _EasyOPOA = window.EasyOPOA, // 覆盖的OPOA变量
  _OPOA = window.OPOA, // 缓存设计对象
  caches = {
    // 缓存DOM或jQuery对象
    eles:{},
    // 缓存首页参数信息
    home:{}
  }, // 页面初次加载
  first = true, // OPOA程序的主页地址
  home = window.location.href.split("#")[0] + "#", // 加载url的数据并显示
  // hahs,url,opoa实体参数,请求提交的数据
  loadShow = function(hash, url, opoa, postData) {
    // 如果是post方式
    if (opoa.method.toLowerCase() == "post") {
      // 判断url是否有参数，提取参数将参数以post方式提交
      var q = url.indexOf("?");
      if (q != -1) {
        postData = (postData ? postData :"") + "&" + url.substring(q + 1);
        url = url.substring(0, q);
      }
    }
    // ajax请求时调用Loading对象进行loading提示
    var loaing = actionLoadings[hash] || EasyOPOA.Configs.loading;
    // ajax开始请求调用
    if (loaing.start) {
      loaing.start(hash, url, opoa, postData);
    }
    $.ajax({
      //为URL添加时间戳，防止缓存
      url:url+(url.indexOf("?")!=-1?"&":"?")+"&opoa_timestamp="+new Date(),
      type:opoa.method,
      data:postData,
      success:function(data) {
        // 显示内容的DOM选择器
        var showSelector = opoa.show;
        // 获得显示内容的jQuery对象
        var show = caches.eles[showSelector];
        // 如果未缓存（第一次加载）
        if (!show) {
          show = $(showSelector);
          // 创建并缓存对象
          caches.eles[showSelector] = show;
        }
        // 要显示的内容
        var content = data;
        // 存在数据内部查找，从返回数据中提供选择器指定的数据,获得内容
        if (opoa.find) {
          content = $("<div>").html(data).find(opoa.find).html();
          // 如果未找到指定内容
          if (!content) {
            // emptyfind
            // empty 显示空
            // all 显示加载到的搜有数据
            // "定义内容" 将自定义内容显示(可使用消息或图片提示用户)
            // function 执行该函数
            // 如果是函数
            if (typeof notFounds[hash] === "function") {
              notFounds[hash]();
              content = "";
            } else {
              var emptyfind = EasyOPOA.Configs.notFound;
              if (notFounds[hash]) {
                var emptyfind = notFounds[hash].toLowerCase();
              }
              // 显示空
              if (emptyfind == "empty") {
                content = "";
              } else if (emptyfind == "all") {
                content = data;
              } else {
                content = notFounds[hash];
              }
            }
          }
        }
        // ajax请求结束调用
        if (loaing.success) {
          loaing.success(hash, url, opoa, postData);
        }
        // 显示内容，
        show.html(content);
      },
      statusCode:actionUrlErrors[hash] || EasyOPOA.Configs.urlErrors,
      error:function() {
        // ajax请求错误调用
        if (loaing.error) {
          loaing.error(hash, url, opoa, postData);
        }
      },
      complete:function() {
        // ajax请求结束调用
        if (loaing.end) {
          loaing.end(hash, url, opoa, postData);
        }
      }
    });
  }, // action触发的回调函数
  actionDo = function(e) {
    // 获取单击事件传递的opoa实体对象参数
    var opoa = e.data;
    // 加载属性的hash值（默认认为hash和请求url相同）
    var hash = $(this).attr(opoa.hash);
    var url = $(this).attr(opoa.url);
    // 如果hash指定的属性没有找到，则会尝试加载href属性作为动作的hash值和url值。
    if (!hash) {
      // 存在href属性
      if ($(this).attr("href")) {
        // 提取href的值作为hash
        hash = $(this).attr("href");
      }
    }
    if (!url) {
      // 存在href属性
      if ($(this).attr("href")) {
        // 提取href的值作为hash
        url = $(this).attr("href");
      }
    }
    // 存在动作
    if (hash) {
      // 得到hash要请求加载的URL，默认为hash值
      // 存在hash动作映射
      if (actionMaps[hash]) {
        url = actionMaps[hash][0];
      }
      // 支持History API（能够定位记录动作，前进后退），动作记忆
      backForward(hash, url, opoa);
      // 加载和显示请求信息
      loadShow(hash, url, opoa, null);
      // 如果opoa参数为true，阻止事件传播
      if (opoa.prevent) {
        e.preventDefault();
      }
    }
  }, // 单击事件绑定，处理动作
  clickBind = function(opoa) {
    // 解除绑定，防止重复
    $(opoa.actions).off("click", actionDo);
    // 为actions绑定单击事件操作
    $(opoa.actions).on("click", opoa, actionDo);
  }, // 将用户输入的含有参数的hash动作，转换为映射对应的最终URL
  // 自定义hash，有参hash对应的hash筛选正则对象，用户当前hash，
  getRouterURL = function(hashRouter, hashRouterExp, nowURL) {
    var dataArray = hashRouterExp.exec(nowURL);
    // 有参hash对应的URL规则
    // 需要格式化
    if (dataArray) {
      var routerURL = routerActionMaps[hashRouter][0];
      // 从用户定义的hash URL中提取参数对应的数据数组集合
      var paramData = dataArray.slice(1);
      $.each(paramData, function(i, v) {
        paramData[i] = decodeURIComponent(v);
      });
      // Router参数名称数据
      var paramRouterURL = new Array();
      hashRouter.replace(nameOrsplatParam, function(m, i) {
        paramRouterURL.push(m.substring(1));
      });
      // 组合参数名称和对应数据
      var params = {};
      for (var i = 0; i < paramData.length; i++) {
        params[paramRouterURL[i]] = paramData[i];
      }
      // 将提取到的数据集合应用到带参hash动作对应的URL中
      routerURL = routerURL.replace(paramReg, function(m, name) {
        // 如果通过参数名能找到对应值
        if (params[name]) {
          return params[name];
        } else {
          // 判断如果参数是数字,按照索引获取数据
          name = name.replace(spaceReg, "");
          if (intReg.test(name)) {
            return paramData[parseInt(name)];
          }
          // 否则返回''
          return "";
        }
      });
      return routerURL;
    } else {
      return nowURL;
    }
  }, // 对含有参数的hash动作定义，修改其对应的URL
  routerHashCheck = function() {
    // 存在有参hash动作
    if (routerActionMaps) {
      // hash_router: [加载的url,EasyOPOA实体]
      $.each(routerActionMaps, function(hashRouter, v) {
        // 有参hash对应的hash筛选正则对象
        var hashRouterExp = hashToRegExp(hashRouter);
        // 有参hash对应的OPOA实体
        var opoaRouter = v[1];
        var opoa = {};
        // 合并初始化参数
        $.extend(true, opoa, EasyOPOA.Configs, opoaRouter);
        // 提取urlError和Loading，并从opoa移除
        var urlErrorAndLoading = getUrlErrorsAndLoading(opoa);
        // 筛选符合有参hash条件的action，进行重新事件绑定和处理
        $(opoa.actions).each(function() {
          // 有参hash对应的URL规则
          var routerURL = v[0];
          // 加载属性的hash值（默认认为hash和请求url相同）
          var hash = $(this).attr(opoa.hash);
          // 如果当前hash满足有参hash条件，
          // 修改hash对应的URL和OPOA参数
          if (hashRouterExp.test(hash)) {
            // 修改hash对应的urlError和actionLoading
            actionUrlErrors[hash] = urlErrorAndLoading.urlError;
            actionLoadings[hash] = urlErrorAndLoading.loading;
            // 用户当前hash对应的旧映射URL
            var nowURL = actionMaps[hash][0];
            actionMaps[hash][0] = getRouterURL(hashRouter, hashRouterExp, nowURL);
            // 将带参hash动作对应的opoa
            actionMaps[hash][1] = opoa;
          }
        });
      });
    }
  }, cookieSave = function(hash, url, opoa) {
    // 如果开启了最后动作定位的记忆功能
    if (EasyOPOA.cookieLast) {
      // 依赖jquery.cookie.js和json2.js
      if ($.cookie && window.JSON && JSON.parse) {
        // 将动作状态记录保存到cookie中
        $.cookie("hash", hash);
        $.cookie("url", url);
        $.cookie("opoa", JSON.stringify(opoa));
      }
    }
  }, // 修改初始记录的浏览器state信息
  replaceFirst = function(hash, url, opoa) {
    if (window.history.pushState) {
      // 使用锚记hash的做法
      // 也可以直接将浏览器地址栏更改为当前加载的URL，不过这样的话，如果用户点击浏览器刷新按钮就脱离了当前的home.jsp（One
      // Page）
      // 所以这里使用#锚记方式实现
      var saveUrl = home + hash;
      // 根据需要保存一些，前进后退时需要获取的与动作相关的键值数据
      var state = {
        // 当前hash
        hash:hash,
        // hash对应的请求URL
        url:url,
        // 存储当前opoa实体
        opoa:opoa
      };
      // 将当前URL实体添加进历史记录（并将浏览器地址栏转为当前URL）
      // 保存的数据参数，标题，添加的URL链接
      // 完成URL动作修改（可收藏，动作定位，前进后退功能）
      window.history.replaceState(state, document.title, saveUrl);
    }
    cookieSave(hash, url, opoa);
  }, // 支持History API（能够定位记录动作，前进后退）
  backForward = function(hash, url, opoa) {
    // 支持History API（能够定位记录动作，前进后退）
    if (window.history.pushState) {
      // 使用锚记hash的做法
      // 也可以直接将浏览器地址栏更改为当前加载的URL，不过这样的话，如果用户点击浏览器刷新按钮就脱离了当前的home.jsp（One
      // Page）
      // 所以这里使用#锚记方式实现
      var saveUrl = home + hash;
      // 根据需要保存一些，前进后退时需要获取的与动作相关的键值数据
      var state = {
        // 当前hash
        hash:hash,
        // hash对应的请求URL
        url:url,
        // 存储当前opoa实体
        opoa:opoa
      };
      // 将当前URL实体添加进历史记录（并将浏览器地址栏转为当前URL）
      // 保存的数据参数，标题，添加的URL链接
      // 完成URL动作修改（可收藏，动作定位，前进后退功能）
      window.history.pushState(state, document.title, saveUrl);
    } else {
      // 完成URL动作修改（可收藏，动作定位）
      window.location.hash = "#" + hash;
    }
    cookieSave(hash, url, opoa);
  }, // 从opoa实例中提取urlErrors和loading，并删除
  getUrlErrorsAndLoading = function(opoa) {
    var urlErrors = opoa["urlErrors"];
    delete opoa["urlErrors"];
    var loading = opoa["loading"];
    delete opoa["loading"];
    return {
      urlErrors:urlErrors,
      loading:loading
    };
  }, // 从带参动作扫描是否有匹配的hash配置，并存入
  scanFromRouter = function(hash) {
    var findurl;
    var findopoa;
    // 检测有参hash映射是否匹配
    $.each(routerActionMaps, function(hashRouter, v) {
      // 有参hash对应的hash筛选正则对象
      var hashRouterExp = hashToRegExp(hashRouter);
      // 有参hash对应的OPOA实体
      var opoa = v[1];
      // 如果当前hash满足有参hash条件，使用该映射
      if (hashRouterExp.test(hash)) {
        // 如果hash动作映射未进行初始化参数合并
        var opoa2 = {};
        $.extend(true, opoa2, EasyOPOA.Configs, opoa);
        // 将用户输入的含有参数的hash动作，转换为映射对应的最终URL
        var url = getRouterURL(hashRouter, hashRouterExp, hash);
        notFounds[hash] = opoa2.notFound;
        // 移除loading和urlErrors
        var eAl = getUrlErrorsAndLoading(opoa2);
        // 修改hash对应的urlError和actionLoading
        actionUrlErrors[hash] = eAl.urlError;
        actionLoadings[hash] = eAl.loading;
        actionMaps[hash] = [ url, opoa2 ];
        // 停止
        return false;
      }
    });
  }, // 初始化OPOA实体定义的动作默认映射
  initActionMaps = function(opoa) {
    var actionMaps = {};
    $(opoa.actions).each(function(actionDom) {
      // 加载属性的hash值（默认认为hash和请求url相同）
      var hash = $(this).attr(opoa.hash);
      // EasyOPOA框架将从DOM对象的`href`属性获取`url`值
      var url = $(this).attr(opoa.url);
      // DOM对象中默认指定的URL值优先级高于有参的Hash动作指定的URL。
      if (url) {
        // 将hash动作映射存入actionMaps
        // 格式为 hash:[opoa,hash]
        // 用户使用#hash访问时，即可加载hash值
        // hash:[url,opoa]
        actionMaps[hash] = [ url, opoa ];
      } else {
        // 如果指定的属性在DOM中找不到url或值为空
        // 扫描是否有与hash匹配的带参动作
        scanFromRouter(hash);
        // 没有扫描到与匹配的带参映射
        if (!actionMaps[hash]) {
          // 依然将hash值作为url值
          url = hash;
          actionMaps[hash] = [ url, opoa ];
        }
      }
    });
    return actionMaps;
  }, // 初始化hash动作对应的请求发生http错误时如何处理对象
  initActionUrlErrors = function(opoa, urlErrors) {
    var actionUrlErrors = {};
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      // 为动作绑定相应http请求错误处理对象
      actionUrlErrors[hash] = urlErrors;
    });
    return actionUrlErrors;
  }, // 初始化hash动作对应的Ajax loading处理对象
  initActionLoadings = function(opoa, loading) {
    var actionLoadings = {};
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      // 为动作绑定相应loading处理对象
      actionLoadings[hash] = loading;
    });
    return actionLoadings;
  }, // 初始化hash动作对应的notFound存入EasyOPOA.notFounds中
  initNotFounds = function(opoa) {
    // 将对应的notFound存入EasyOPOA.notFounds中
    $(opoa.actions).each(function(actionDom) {
      // 加载属性的hash值（默认认为hash和请求url相同）
      var hash = $(this).attr(opoa.hash);
      // 将hash动作映射的notFound存入notFounds
      notFounds[hash] = opoa.notFound;
    });
    // 删除OPOA实例中的notFound，因为可能是函数
    delete opoa.notFound;
  }, // 通过hash动态显示首页
  hashHomeShow = function(hash, postData) {
    // 从有参Hash扫描
    scanFromRouter(hash);
    // 存在hash动作映射
    if (actionMaps[hash]) {
      // 获得映射中的请求url
      var url = actionMaps[hash][0];
      // 如果hash动作映射未进行初始化参数合并
      var opoa = {};
      if (getPropertyCount(actionMaps[hash][1]) != 8) {
        // 合并初始化参数
        $.extend(true, opoa, EasyOPOA.Configs, actionMaps[hash][1]);
        // 移除loading和urlErrors
        getUrlErrorsAndLoading(opoa);
        actionMaps[hash][1] = opoa;
      } else {
        // opoa参数
        opoa = actionMaps[hash][1];
      }
      replaceFirst(hash, url, opoa);
      loadShow(hash, url, opoa, postData);
    } else {
      // hash不存在
      EasyOPOA.notHash(hash);
    }
  }, // 显示首页
  showHome = function() {
    // 如何设置了首页的加载Hash动作实例
    if (caches.home.hash) {
      // 通过homeUrl加载
      if (caches.home.url) {
        // backForward(hash,url,opoa);
        loadShow(caches.home.hash, caches.home.url, caches.home.opoa, caches.home.postData);
      } else {
        // 通过home加载(hash)
        var hash = caches.home.hash;
        var postData = caches.home.postData;
        hashHomeShow(hash, postData);
      }
    } else {
      // 当EasyOPOA没有置了首页的加载Hash动作实例时，默认执行显示首页的处理函数
      EasyOPOA.homeFun();
    }
  }, // 清理opoa实例中无法保持的函数属性
  clearOPOA = function(opoa) {
    delete opoa.notFound;
    delete opoa.loading;
    delete opoa.urlErrors;
  }, // hash动作对应没有找到find内容时显示的内容
  // {"hash动作名称":loading处理对象}
  notFounds = {}, // hash动作对应的ajax请求时调用的loading函数
  // {"hash动作名称":loading处理对象}
  actionLoadings = {}, // 获取对象的属性数量
  getPropertyCount = function(obj) {
    var c = 0;
    $.each(obj, function() {
      c++;
    });
    return c;
  }, // hash动作对应的请求发生http错误时如何处理对象
  // {"hash动作名称":{http状态码:处理函数,……}}
  actionUrlErrors = {}, // 动作映射对象（ActionMap Object）,保存全局hash动作映射
  // "动作hash:[加载的url,EasyOPOA实体]"
  actionMaps = {}, // 保存含有参hash动作映射 "含参动作hash:[加载的url,EasyOPOA实体]"
  routerActionMaps = {}, // 是否是数组
  isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]";
  }, // 带参hash动作参数正则
  optionalParam = /\((.*?)\)/g, namedParam = /(\(\?)?:\w+/g, splatParam = /\*\w+/g, nameOrsplatParam = /(\(\?)?:\w+|\*\w+/g, escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g, paramReg = /\{([^}]+)\}/g, spaceReg = /\ /g, intReg = /^[0-9]+$/, // 将带参hash转为正则对象
  hashToRegExp = function(hash) {
    hash = hash.replace(escapeRegExp, "\\$&").replace(optionalParam, "(?:$1)?").replace(namedParam, function(match, optional) {
      return optional ? match :"([^/]+)";
    }).replace(splatParam, "(.*?)");
    return new RegExp("^" + hash + "$");
  };
  // 监听浏览器前进、后退事件
  $(window).on("popstate", function() {
    // 如果有存储参数
    if (window.history.state) {
      // 前进后退时获得 保存的hash,url和opoa实体对象
      var url = window.history.state.url;
      var hash = window.history.state.hash;
      var opoa = window.history.state.opoa;
      // 加载和显示数据
      loadShow(hash, url, opoa, null);
    } else {
      // 可能回到了首页或第一次访问
      // var hash=window.location.hash;
      // if(actionMaps[hash]){
      // 加载和显示请求信息
      // loadShow(hash,actionMaps[hash][0],actionMaps[hash][1]);
      // }else{
      // 目前很多浏览器采取了导航面板页
      // 所以第一次直接访问OPOA应用时相当于进行了一次前进
      // 如果是回到首页，加载和显示home请求信息
      showHome();
    }
  });
  var EasyOPOA = {
    // 利用cookie，开启动作定位的记忆功能(依赖jquery.cookie.js和json2.js)
    // 能够记录最后访问的动作，实现OPOA动作恢复
    cookieLast:true,
    // 全局OPOA实例默认配置
    Configs:{
      // jQuery的DOM选择器，让DOM具有动作触发能力，自动创建Hash动作实例
      // 单击（click）该DOM元素时即会触发一个Hash动作实例
      // （可从选择的DOM中获得'Hash动作实例'所需的hash,url）
      // （结合当前opoa实例，自动创建DOM点击时触发的'Hash动作实例'）
      // 例如，通过该参数选择菜单选项，让OPOA程序的菜单选项能够触发Hash动作实例
      actions:null,
      // jQuery的DOM选择器，显示从请求的url加载到的内容
      // 将动作请求url返回的结果显示到选择器指定的区域
      show:null,
      // 从DOM节点中获取'Hash动作实例'的hash值的DOM属性名称
      // 默认值：hash
      hash:"hash",
      // 从DOM节点中获取'Hash动作实例'的url值的DOM属性名称
      // 默认值：hash (url值默认也等同于hash值)
      url:"hash",
      // jQuery DOM选择器，从服务器获得的数据中筛选出指定区域的数据
      // 例如，从服务器中返回的数据中仅获取某个DIV中的内容
      find:null,
      // 当find参数的选择器，没有从服务器返回的数据中找到内容时，显示的内容
      // 可选值为"empty","all","自定义内容",function
      // "empty" 显示空内容
      // "all" 显示加载到的所有数据
      // "自定义内容" 将自定义内容的内容显示处理(可使用消息或图片提示用户)
      // function 执行该函数
      // 默认值：empty
      notFound:"empty",
      // 对url进行Ajax请求的具体方式 ：post/get
      // post方式会自动将url请求后的参数转换为post参数发送
      // 默认值：post
      method:"post",
      // 阻止默认事件动作。如A标签点击时不触发href
      prevent:true,
      // *临时参数，仅接受，并不保存进OPOA实体
      // 使用actionMaps修改指定hash对应的默认url为其他值
      // Hash动作映射的`opoaInstance`默认即为当前opoa对象this
      actionMaps:{},
      // *临时参数，仅接受，并不保存进OPOA实体
      // 当对url的请求从服务器端返回错误代码时，如何处理
      // 一组数值的HTTP代码和函数对象，当响应时调用了相应的代码。
      // {http状态码:处理函数,……}
      urlErrors:{
        // 如果执行的动作发生404错误时，如何处理
        // 默认如果发生404加载错误，页面不会有任何响应
        404:function() {},
        // 如果执行的动作发生500错误时，如何处理
        // 默认如果发生500加载错误，页面不会有任何响应
        500:function() {}
      },
      // *临时参数，仅接受，并不保存进OPOA实体
      // 在ajax请求的不同状态时分别调用的函数，可用来进行loading提示
      loading:{
        // ajax请求开始
        start:function(hash, url, opoa, postData) {},
        // ajax请求成功
        success:function(hash, url, opoa, postData) {},
        // ajax请求出错
        error:function(hash, url, opoa, postData) {},
        // ajax请求结束（无论成功失败都会调用）
        end:function(hash, url, opoa, postData) {}
      }
    },
    // 如果用户请求的hash未注册不存在时的处理函数（如用户保存的书签已经失效或不存在）
    notHash:function(hash) {},
    // 使用addActionMap(hash,url,opoa)函数配置映射
    addActionMap:function(hash, url, opoa) {
      // 如果是数组参数列表
      if (isArray(hash)) {
        $.each(hash, function(k, v) {
          if (isArray(v)) {
            // 合并opoa实体对象参数
            var opoa2 = {};
            $.extend(true, opoa2, EasyOPOA.Configs, v[2]);
            notFounds[v[0]] = opoa2.notFound;
            clearOPOA(opoa2);
            // eg.
            // EasyOPOA.addActionMap([
            // ["demo", "demo.jsp", opoaList.menuOpoa],
            // ["demo2", "demo.jsp", opoaList.menuOpoa]
            // ]);
            // 如果是有参hash
            if (v[0].indexOf(":") != -1 || v[0].indexOf("*") != -1) {
              routerActionMaps[v[0]] = [ v[1], opoa2 ];
            } else {
              actionMaps[v[0]] = [ v[1], opoa2 ];
            }
          } else {
            // eg.
            // EasyOPOA.addActionMap([
            // {"demo" : [ "demo.jsp", opoaList.menuOpoa ]},
            // {"demo2" : [ "demo.jsp", opoaList.menuOpoa ]}
            // ]);
            $.each(v, function(k, v2) {
              // 合并opoa实体对象参数
              var opoa2 = {};
              opoa2 = $.extend(true, opoa2, EasyOPOA.Configs, v2[1]);
              notFounds[k] = opoa2.notFound;
              clearOPOA(opoa2);
              // 如果是有参hash
              if (k.indexOf(":") != -1 || k.indexOf("*") != -1) {
                routerActionMaps[k] = [ v2[0], opoa2 ];
              } else {
                actionMaps[k] = [ v2[0], opoa2 ];
              }
            });
          }
        });
      } else {
        var opoa2 = {};
        // 合并opoa实体对象参数
        $.extend(true, opoa2, EasyOPOA.Configs, opoa);
        notFounds[hash] = opoa2.notFound;
        clearOPOA(opoa2);
        // eg.
        // EasyOPOA.addActionMap("demo", opoaList.menuOpoa,
        // "demo.jsp" );
        // 如果是有参hash
        if (hash.indexOf(":") != -1 || hash.indexOf("*") != -1) {
          routerActionMaps[hash] = [ url, opoa2 ];
        } else {
          actionMaps[hash] = [ url, opoa2 ];
        }
      }
    },
    // 使用addActionUrlErrors()函数为hash动作定义HTTP代码响应对象
    addActionUrlErrors:function(hash, urlErrorsObject) {
      if (isArray(hash)) {
        // eg.
        // EasyOPOA.addActionUrlErrors(["donation.jsp","donation"],{
        // 404:function(){
        // console.info("Donation page not found!");
        // },
        // 500:function(){}
        // });
        $.each(hash, function(k, v) {
          actionUrlErrors[v] = urlErrorsObject;
        });
      } else {
        // eg.
        // EasyOPOA.addActionUrlErrors("donation.jsp",{
        // 404:function(){
        // console.info("Donation page not found!");
        // },
        // 500:function(){}
        // });
        actionUrlErrors[hash] = urlErrorsObject;
      }
    },
    // 使用addActionLoadings()函数为hash动作指定loading处理对象：
    addActionLoadings:function(hash, loadingObject) {
      if (isArray(hash)) {
        // eg.
        // EasyOPOA.addActionLoadings(["demo","demo2"],{
        // //ajax请求开始
        // "start":function(){console.info("Ajax 请求开始！");},
        // //ajax请求成功
        // "success":function(){console.info("Ajax 请求成功！");},
        // //ajax请求出错
        // "error":function(hash,url){
        // console.info("Ajax 请求失败...！["+hash+":"+url+"]");
        // },
        // //ajax请求结束（无论成功失败都会调用）
        // "end":function(){console.info("Ajax 请求结束！");}
        // });
        $.each(hash, function(k, v) {
          actionLoadings[v] = loadingObject;
        });
      } else {
        // eg.
        // EasyOPOA.addActionLoadings("demo",{
        // //ajax请求开始
        // "start":function(){console.info("Ajax 请求开始！");},
        // //ajax请求成功
        // "success":function(){console.info("Ajax 请求成功！");},
        // //ajax请求出错
        // "error":function(hash,url){
        // console.info("Ajax 请求失败...！["+hash+":"+url+"]");
        // },
        // //ajax请求结束（无论成功失败都会调用）
        // "end":function(){console.info("Ajax 请求结束！");}
        // });
        actionLoadings[hash] = loadingObject;
      }
    },
    // 启动EasyOPOA
    // opoaList：（OPOA实体配置集合）
    // actionMaps：hash动作映射 "动作hash:加载的url"
    start:function(opoaList, actionMapsParam) {
      // 如果定义了hash动作映射
      if (actionMapsParam) {
        // 如果是数组列表参数
        if (isArray(actionMapsParam)) {
          EasyOPOA.addActionMap(actionMapsParam);
        } else {
          // 标准的动作映射对象
          $.each(actionMapsParam, function(k, v) {
            EasyOPOA.addActionMap(k, v[0], v[1]);
          });
        }
      }
      // 页面加载完后进行EasyOPOA启动
      $(function() {
        if (opoaList) {
          // 为页面动作绑定处理事件
          $.each(opoaList, function(opoaNameOrIndex, opoaInstance) {
            // 合并问题
            // opoa实体对象
            var opoa = {};
            // 合并opoa实体对象参数
            $.extend(true, opoa, EasyOPOA.Configs, opoaInstance);
            // 提取urlError和Loading，并从opoa移除
            var errorsAndLoading = getUrlErrorsAndLoading(opoa);
            // 如果存在actionMaps，存入actionMaps
            if (opoaInstance["actionMaps"]) {
              // 提取所有actionMaps，存入
              $.each(opoaInstance["actionMaps"], function(hash, url) {
                EasyOPOA.addActionMap(hash, url, opoa);
              });
            }
            // 初始化hash动作对应的notFound存入notFounds中
            initNotFounds(opoa);
            // 将hash动作、url、EasyOPOA实体参数从存入actionMaps
            // hash:[url,opoa]
            var opoaActionMaps = initActionMaps(opoa);
            actionMaps = $.extend(opoaActionMaps, actionMaps);
            // 将hash动作，url错误处理对象，存入Easy.actionUrlErrors动作映射
            // hash:urlErrorObject
            var opoaActionUrlErrors = initActionUrlErrors(opoa, errorsAndLoading.urlErrors);
            actionUrlErrors = $.extend(opoaActionUrlErrors, actionUrlErrors);
            // 将hash动作，loading处理对象，存入actionLoadings动作映射
            // hash:loadingObject
            var opoaActionLoadings = initActionLoadings(opoa, errorsAndLoading.loading);
            actionLoadings = $.extend(true, opoaActionLoadings, actionLoadings);
            // 为opoa实体对象绑定单击事件
            clickBind(opoa);
          });
          // 有参hash,修改其对应的URL
          routerHashCheck();
        }
        // 页面初次加载
        if (first) {
          first = false;
          // 页面加载时，判断hash值，根据hash值，完成指定的动作
          if (window.location.hash) {

            // 按hash加载加载和显示数据
            var hash = window.location.hash.substring(1);
            hashHomeShow(hash, null);
          } else { 
            // 如果开启了最后动作定位的记忆功能
            if (EasyOPOA.cookieLast) {
              // 依赖jquery.cookie.js和json2.js
              if ($.cookie && window.JSON && JSON.parse) {
                // 判断是否保存用户最后的执行状态
                var hash = $.cookie("hash");
                var url = $.cookie("url");
                var opoa = $.cookie("opoa");
                // 存在加载cookie参数
                if (opoa) {
                  opoa = JSON.parse(opoa);
                  // 如果有保存的动作状态，加载该动状态显示
                  if (url) {
                    // window.location.hash="#"+hash;
                    replaceFirst(hash, url, opoa);
                    scanFromRouter(hash);
                    // 加载和显示请求信息
                    loadShow(hash, url, opoa, null);
                  }
                } else {
                  // cookie存储的最后动作不存在，加载和显示请求显示home信息
                  showHome();
                }
              } else {
                // jquery.cookie.js和json2.js未引入，显示home
                showHome();
              }
            } else {
              // 未开启cookie检测，直接加载和显示请求显示home信息
              showHome();
            }
          }
        }
      });
    },
    // 通过hash动态加载首页
    home:function(hash, postData) {
      caches.home = {
        hash:hash,
        postData:postData
      };
    },
    // 通过url动态加载首页url,opoaInstance,发送的数据
    homeUrl:function(url, opoaInstance, postData) {
      var hash = "";
      var opoa = {};
      // 合并opoa实体对象参数
      $.extend(true, opoa, EasyOPOA.Configs, opoaInstance);
      // 初始化hash动作对应的notFound存入notFounds中
      notFounds[hash] = opoa.notFound;
      delete opoa.notFound;
      // 提取urlError和Loading，并从opoa移除
      var errorsAndLoading = getUrlErrorsAndLoading(opoa);
      EasyOPOA.addActionLoadings(hash, errorsAndLoading.loading);
      caches.home = {
        hash:hash,
        url:url,
        opoa:opoa,
        postData:postData
      };
    },
    // 当OPOA没有从Ajax加载首页时，默认显示首页的处理函数
    // 主要用于该场景下浏览器后退到首页时，首页静态内容无法更新问题
    homeFun:function() {},
    // 通过hash动作名称，手动进行加载
    // hash,请求提交的数据
    load:function(hash, postData) {
      $(function() {
        scanFromRouter(hash);
        if (actionMaps[hash]) {
          backForward(hash, actionMaps[hash][0], actionMaps[hash][1]);
          loadShow(hash, actionMaps[hash][0], actionMaps[hash][1], postData);
        } else {
          // 找不到对应hash，显示默认
          if (notHash) {
            EasyOPOA.notHash(hash);
          }
        }
      });
    },
    // noConflict函数，将变量EasyOPOA和OPOA的控制权让渡给第一个实现它的那个库
    // deep 为空或false仅释放OPOA命名空间
    // 为true 将完全释放EasyOPOA和OPOA命名空间
    noConflict:function(deep) {
      // 还原覆盖的EasyOPOA
      if (window.OPOA === EasyOPOA) {
        window.OPOA = _OPOA;
      }
      // 还原覆盖的OPOA
      if (deep && window.EasyOPOA === EasyOPOA) {
        window.EasyOPOA = _EasyOPOA;
      }
      return EasyOPOA;
    }
  };
  window.EasyOPOA = window.OPOA = EasyOPOA;
  return EasyOPOA;
});