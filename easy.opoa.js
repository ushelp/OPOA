//
// Version 2.0.0
//
// Copy By RAY
// inthinkcolor@gmail.com
// 2013
//
// https://github.com/ushelp/OPOA/
//
(function(window) {
  var _EasyOPOA = window.EasyOPOA, _OPOA = window.OPOA, caches = {
    eles:{},
    home:{}
  }, first = true, home = window.location.href.split("#")[0] + "#", loadShow = function(hash, url, opoa, postData) {
    if (opoa.method.toLowerCase() == "post") {
      var q = url.indexOf("?");
      if (q != -1) {
        postData = (postData ? postData :"") + "&" + url.substring(q + 1);
        url = url.substring(0, q);
      }
    }
    var loaing = actionLoadings[hash] || EasyOPOA.Configs.loading;
    if (loaing.start) {
      loaing.start(hash, url, opoa, postData);
    }
    $.ajax({
      url:url,
      type:opoa.method,
      data:postData,
      success:function(data) {
        var showSelector = opoa.show;
        var show = caches.eles[showSelector];
        if (!show) {
          show = $(showSelector);
          caches.eles[showSelector] = show;
        }
        var content = data;
        if (opoa.find) {
          content = $("<div>").html(data).find(opoa.find).html();
          if (!content) {
            if (typeof notFounds[hash] === "function") {
              notFounds[hash]();
              content = "";
            } else {
              var emptyfind = notFounds[hash].toLowerCase();
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
        if (loaing.success) {
          loaing.success(hash, url, opoa, postData);
        }
        show.html(content);
      },
      statusCode:actionUrlErrors[hash] || EasyOPOA.Configs.urlErrors,
      error:function() {
        if (loaing.error) {
          loaing.error(hash, url, opoa, postData);
        }
      },
      complete:function() {
        if (loaing.end) {
          loaing.end(hash, url, opoa, postData);
        }
      }
    });
  }, actionDo = function(e) {
    var opoa = e.data;
    var hash = $(this).attr(opoa.hash);
    var url = $(this).attr(opoa.url);
    if (!hash) {
      if ($(this).attr("href")) {
        hash = $(this).attr("href");
      }
    }
    if (!url) {
      if ($(this).attr("href")) {
        url = $(this).attr("href");
      }
    }
    if (hash) {
      if (actionMaps[hash]) {
        url = actionMaps[hash][0];
      }
      backForward(hash, url, opoa);
      loadShow(hash, url, opoa, null);
      if (opoa.prevent) {
        e.preventDefault();
      }
    }
  }, clickBind = function(opoa) {
    $(opoa.actions).off("click", actionDo);
    $(opoa.actions).on("click", opoa, actionDo);
  }, getRouterURL = function(hashRouter, hashRouterExp, nowURL) {
    var dataArray = hashRouterExp.exec(nowURL);
    if (dataArray) {
      var routerURL = routerActionMaps[hashRouter][0];
      var paramData = dataArray.slice(1);
      $.each(paramData, function(i, v) {
        paramData[i] = decodeURIComponent(v);
      });
      var paramRouterURL = new Array();
      hashRouter.replace(nameOrsplatParam, function(m, i) {
        paramRouterURL.push(m.substring(1));
      });
      var params = {};
      for (var i = 0; i < paramData.length; i++) {
        params[paramRouterURL[i]] = paramData[i];
      }
      routerURL = routerURL.replace(paramReg, function(m, name) {
        if (params[name]) {
          return params[name];
        } else {
          name = name.replace(spaceReg, "");
          if (intReg.test(name)) {
            return paramData[parseInt(name)];
          }
          return "";
        }
      });
      return routerURL;
    } else {
      return nowURL;
    }
  }, routerHashCheck = function() {
    if (routerActionMaps) {
      $.each(routerActionMaps, function(hashRouter, v) {
        var hashRouterExp = hashToRegExp(hashRouter);
        var opoaRouter = v[1];
        var opoa = {};
        $.extend(true, opoa, EasyOPOA.Configs, opoaRouter);
        var urlErrorAndLoading = getUrlErrorsAndLoading(opoa);
        $(opoa.actions).each(function() {
          var routerURL = v[0];
          var hash = $(this).attr(opoa.hash);
          if (hashRouterExp.test(hash)) {
            actionUrlErrors[hash] = urlErrorAndLoading.urlError;
            actionLoadings[hash] = urlErrorAndLoading.loading;
            var nowURL = actionMaps[hash][0];
            actionMaps[hash][0] = getRouterURL(hashRouter, hashRouterExp, nowURL);
            actionMaps[hash][1] = opoa;
          }
        });
      });
    }
  }, replaceFirst = function(hash, url, opoa) {
    if (window.history.pushState) {
      var saveUrl = home + hash;
      var state = {
        hash:hash,
        url:url,
        opoa:opoa
      };
      window.history.replaceState(state, document.title, saveUrl);
    }
  }, backForward = function(hash, url, opoa) {
    if (window.history.pushState) {
      var saveUrl = home + hash;
      var state = {
        hash:hash,
        url:url,
        opoa:opoa
      };
      window.history.pushState(state, document.title, saveUrl);
    } else {
      window.location.hash = "#" + hash;
    }
    if (EasyOPOA.cookieLast) {
      if ($.cookie && window.JSON && JSON.parse) {
        $.cookie("hash", hash);
        $.cookie("url", url);
        $.cookie("opoa", JSON.stringify(opoa));
      }
    }
  }, getUrlErrorsAndLoading = function(opoa) {
    var urlErrors = opoa["urlErrors"];
    delete opoa["urlErrors"];
    var loading = opoa["loading"];
    delete opoa["loading"];
    return {
      urlErrors:urlErrors,
      loading:loading
    };
  }, scanFromRouter = function(hash) {
    var findurl;
    var findopoa;
    $.each(routerActionMaps, function(hashRouter, v) {
      var hashRouterExp = hashToRegExp(hashRouter);
      var opoa = v[1];
      if (hashRouterExp.test(hash)) {
        var opoa2 = {};
        $.extend(true, opoa2, EasyOPOA.Configs, opoa);
        var url = getRouterURL(hashRouter, hashRouterExp, hash);
        notFounds[hash] = opoa2.notFound;
        var eAl = getUrlErrorsAndLoading(opoa2);
        actionUrlErrors[hash] = eAl.urlError;
        actionLoadings[hash] = eAl.loading;
        actionMaps[hash] = [ url, opoa2 ];
        return false;
      }
    });
  }, initActionMaps = function(opoa) {
    var actionMaps = {};
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      var url = $(this).attr(opoa.url);
      if (url) {
        actionMaps[hash] = [ url, opoa ];
      } else {
        scanFromRouter(hash);
        if (!actionMaps[hash]) {
          url = hash;
          actionMaps[hash] = [ url, opoa ];
        }
      }
    });
    return actionMaps;
  }, initActionUrlErrors = function(opoa, urlErrors) {
    var actionUrlErrors = {};
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      actionUrlErrors[hash] = urlErrors;
    });
    return actionUrlErrors;
  }, initActionLoadings = function(opoa, loading) {
    var actionLoadings = {};
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      actionLoadings[hash] = loading;
    });
    return actionLoadings;
  }, initNotFounds = function(opoa) {
    $(opoa.actions).each(function(actionDom) {
      var hash = $(this).attr(opoa.hash);
      notFounds[hash] = opoa.notFound;
    });
    delete opoa.notFound;
  }, hashHomeShow = function(hash, postData) {
    scanFromRouter(hash);
    if (actionMaps[hash]) {
      var url = actionMaps[hash][0];
      var opoa = {};
      if (getPropertyCount(actionMaps[hash][1]) != 8) {
        $.extend(true, opoa, EasyOPOA.Configs, actionMaps[hash][1]);
        getUrlErrorsAndLoading(opoa);
        actionMaps[hash][1] = opoa;
      } else {
        opoa = actionMaps[hash][1];
      }
      replaceFirst(hash, url, opoa);
      loadShow(hash, url, opoa, postData);
    } else {
      EasyOPOA.notHash(hash);
    }
  }, showHome = function() {
    if (caches.home.hash) {
      if (caches.home.url) {
        loadShow(caches.home.hash, caches.home.url, caches.home.opoa, caches.home.postData);
      } else {
        var hash = caches.home.hash;
        var postData = caches.home.postData;
        hashHomeShow(hash, postData);
      }
    } else {
      EasyOPOA.homeFun();
    }
  }, clearOPOA = function(opoa) {
    delete opoa.notFound;
    delete opoa.loading;
    delete opoa.urlErrors;
  }, notFounds = {}, actionLoadings = {}, getPropertyCount = function(obj) {
    var c = 0;
    $.each(obj, function() {
      c++;
    });
    return c;
  }, actionUrlErrors = {}, actionMaps = {}, routerActionMaps = {}, isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]";
  }, optionalParam = /\((.*?)\)/g, namedParam = /(\(\?)?:\w+/g, splatParam = /\*\w+/g, nameOrsplatParam = /(\(\?)?:\w+|\*\w+/g, escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g, paramReg = /\{([^}]+)\}/g, spaceReg = /\ /g, intReg = /^[0-9]+$/, hashToRegExp = function(hash) {
    hash = hash.replace(escapeRegExp, "\\$&").replace(optionalParam, "(?:$1)?").replace(namedParam, function(match, optional) {
      return optional ? match :"([^/]+)";
    }).replace(splatParam, "(.*?)");
    return new RegExp("^" + hash + "$");
  };
  $(window).on("popstate", function() {
    if (window.history.state) {
      var url = window.history.state.url;
      var hash = window.history.state.hash;
      var opoa = window.history.state.opoa;
      loadShow(hash, url, opoa, null);
    } else {
      showHome();
    }
  });
  var EasyOPOA = {
    cookieLast:true,
    Configs:{
      actions:null,
      show:null,
      hash:"hash",
      url:"hash",
      find:null,
      notFound:"empty",
      method:"post",
      prevent:true,
      actionMaps:{},
      urlErrors:{
        404:function() {},
        500:function() {}
      },
      loading:{
        start:function(hash, url, opoa, postData) {},
        success:function(hash, url, opoa, postData) {},
        error:function(hash, url, opoa, postData) {},
        end:function(hash, url, opoa, postData) {}
      }
    },
    notHash:function(hash) {},
    addActionMap:function(hash, url, opoa) {
      if (isArray(hash)) {
        $.each(hash, function(k, v) {
          if (isArray(v)) {
            var opoa2 = {};
            $.extend(true, opoa2, EasyOPOA.Configs, v[2]);
            notFounds[v[0]] = opoa2.notFound;
            clearOPOA(opoa2);
            if (v[0].indexOf(":") != -1 || v[0].indexOf("*") != -1) {
              routerActionMaps[v[0]] = [ v[1], opoa2 ];
            } else {
              actionMaps[v[0]] = [ v[1], opoa2 ];
            }
          } else {
            $.each(v, function(k, v2) {
              var opoa2 = {};
              opoa2 = $.extend(true, opoa2, EasyOPOA.Configs, v2[1]);
              notFounds[k] = opoa2.notFound;
              clearOPOA(opoa2);
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
        $.extend(true, opoa2, EasyOPOA.Configs, opoa);
        notFounds[hash] = opoa2.notFound;
        clearOPOA(opoa2);
        if (hash.indexOf(":") != -1 || hash.indexOf("*") != -1) {
          routerActionMaps[hash] = [ url, opoa2 ];
        } else {
          actionMaps[hash] = [ url, opoa2 ];
        }
      }
    },
    addActionUrlErrors:function(hash, urlErrorsObject) {
      if (isArray(hash)) {
        $.each(hash, function(k, v) {
          actionUrlErrors[v] = urlErrorsObject;
        });
      } else {
        actionUrlErrors[hash] = urlErrorsObject;
      }
    },
    addActionLoadings:function(hash, loadingObject) {
      if (isArray(hash)) {
        $.each(hash, function(k, v) {
          actionLoadings[v] = loadingObject;
        });
      } else {
        actionLoadings[hash] = loadingObject;
      }
    },
    start:function(opoaList, actionMapsParam) {
      if (actionMapsParam) {
        if (isArray(actionMapsParam)) {
          EasyOPOA.addActionMap(actionMapsParam);
        } else {
          $.each(actionMapsParam, function(k, v) {
            EasyOPOA.addActionMap(k, v[0], v[1]);
          });
        }
      }
      $(function() {
        if (opoaList) {
          $.each(opoaList, function(opoaNameOrIndex, opoaInstance) {
            var opoa = {};
            $.extend(true, opoa, EasyOPOA.Configs, opoaInstance);
            var errorsAndLoading = getUrlErrorsAndLoading(opoa);
            if (opoaInstance["actionMaps"]) {
              $.each(opoaInstance["actionMaps"], function(hash, url) {
                EasyOPOA.addActionMap(hash, url, opoa);
              });
            }
            initNotFounds(opoa);
            var opoaActionMaps = initActionMaps(opoa);
            actionMaps = $.extend(opoaActionMaps, actionMaps);
            var opoaActionUrlErrors = initActionUrlErrors(opoa, errorsAndLoading.urlErrors);
            actionUrlErrors = $.extend(opoaActionUrlErrors, actionUrlErrors);
            var opoaActionLoadings = initActionLoadings(opoa, errorsAndLoading.loading);
            actionLoadings = $.extend(true, opoaActionLoadings, actionLoadings);
            clickBind(opoa);
          });
          routerHashCheck();
        }
        if (first) {
          first = false;
          if (window.location.hash) {
            var hash = window.location.hash.substring(1);
            hashHomeShow(hash, null);
          } else {
            if (EasyOPOA.cookieLast) {
              if ($.cookie && window.JSON && JSON.parse) {
                var hash = $.cookie("hash");
                var url = $.cookie("url");
                var opoa = $.cookie("opoa");
                if (opoa) {
                  opoa = JSON.parse(opoa);
                  if (url) {
                    replaceFirst(hash, url, opoa);
                    loadShow(hash, url, opoa, null);
                  }
                } else {
                  showHome();
                }
              } else {
                showHome();
              }
            } else {
              showHome();
            }
          }
        }
      });
    },
    home:function(hash, postData) {
      caches.home = {
        hash:hash,
        postData:postData
      };
    },
    homeUrl:function(url, opoaInstance, postData) {
      var hash = "";
      var opoa = {};
      $.extend(true, opoa, EasyOPOA.Configs, opoaInstance);
      notFounds[hash] = opoa.notFound;
      delete opoa.notFound;
      var errorsAndLoading = getUrlErrorsAndLoading(opoa);
      EasyOPOA.addActionLoadings(hash, errorsAndLoading.loading);
      caches.home = {
        hash:hash,
        url:url,
        opoa:opoa,
        postData:postData
      };
    },
    homeFun:function() {},
    load:function(hash, postData) {
      $(function() {
        scanFromRouter(hash);
        if (actionMaps[hash]) {
          backForward(hash, actionMaps[hash][0], actionMaps[hash][1]);
          loadShow(hash, actionMaps[hash][0], actionMaps[hash][1], postData);
        } else {
          if (notHash) {
            EasyOPOA.notHash(hash);
          }
        }
      });
    },
    noConflict:function(deep) {
      if (window.OPOA === EasyOPOA) {
        window.OPOA = _OPOA;
      }
      if (deep && window.EasyOPOA === EasyOPOA) {
        window.EasyOPOA = _EasyOPOA;
      }
      return EasyOPOA;
    }
  };
  window.EasyOPOA = window.OPOA = EasyOPOA;
})(window);