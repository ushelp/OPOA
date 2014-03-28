# EasyOPOA Framework API

**EasyOPOA Easy uphold the core idea of ​​the framework, in order to ensure the developer-friendly, API is very simple, only a limited number of storm drain functional API.**

EasyOPOA Framework API is divided into two categories:

**1. OPOA instance (OPOA Instance) defined attributes（Total 11）**

 Create OPOA instance property API. EasyOPOA action instances as a framework to Hash core, OPOA example is composed of three elements Hash action instances (hash, url, OPOAInstance) one.

**2. EasyOPOA Framework API（Total 12）**

 System-level global API.


-----------------

## 1、OPOA instance (OPOA Instance) defined attributes
In OPOA procedure, each action corresponds to a triggering need OPOA instance, a plurality of operation may correspond to the same instance OPOA. During loading, you must create OPOA instances in advance.

> OPOA Examples (OPOA Instance) is one example of a part of the Hash operation. Defined when the action is executed, the request url loaded, rendering and detail the parameters of the page.

A OPOA instance object contains 11 pages with Ajax requests and rendering related properties: `actions`, `show`, `hash`, `url`, `find`, `notfound`, `method`, `prevent`, `actionMaps`, `urlErrors`, `loading`. Part of the property has a default value, according to the definition of need or modify the properties. If you need to modify the OPOA global default definition, refer to `EasyOPOA.Configs` parameter.

- ### opoa instance of the default definition:

 ```JS
 var opoa = {
	// JQuery 's DOM selector, let DOM action trigger with the ability to automatically create instances of Hash action
	// Click (click) that will trigger a Hash action when the DOM element instance
	// ( Can get 'Hash action instance' desired hash, url selected from the DOM )
	// ( When combined with the current opoa instance , click triggered automatically created DOM 'Hash action instance' )
	// For example, select menu options via the parameter , so OPOA program menu options can trigger the action instance Hash
	"actions": null,
	// JQuery 's DOM selector display is loaded from the request url to content
	The results returned by url // display the action request to the selector designated area
	"show": null,
	// Get the DOM attribute name 'Hash action instance' of the hash value from the DOM node
	// Default value : hash
	"hash": "hash",
	// Get the DOM attribute name 'Hash action instance' the url value from a DOM node
	// Default value : hash (url default value is also equivalent to the hash value )
	"url": "hash",
	// Get the data from the server , using the specified jQuery DOM find selector filter out the data of the specified region
	// For example , the data returned from the server gets only the contents of a DIV
	"find": null,
	// When the find parameter selector, did not find the content of the data returned from the server to display the contents of the
	// Optional value "empty", "all", " custom content ", function
	// "Empty" Show Empty contents
	// "All" to display all of the data is loaded into the
	// "Custom Content" will display the contents of custom content ( messages or pictures can be used to prompt the user )
	// Function execution of the function
	// default:  empty
	"notfound": "empty",
	Specific methods // on the url Ajax request : post / get
	// Post mode parameters will be automatically converted to the request url parameter to send post
	// Default value : post
	"method": "post",
	// Prevent the default event action . If the label does not trigger when clicked href A
	"prevent": true,
	// Use actionMaps modify the default url specified hash corresponding to other values
	// Hash action mapping `opoaInstance` default is the current object this opoa
	"actionMaps": {
		// "Hash": "url",
		// "Demo": "demo.jsp"
	}
	// When the request url error code returned from the server when handling
	// Set the value of the HTTP code and function objects , when in response to the call of the corresponding code.
	"urlErrors": {
		// If the action performed 404 error occurs, how to deal with
		// default:  404 load if an error occurs , the page does not have any response
		404: function () {
		}
		// If the action performed 500 error occurs, how to deal with
		// default:  500 load if an error occurs , the page does not have any response
		500: function () {
		}
		// Also define other states
	}
	// Function ajax request in different states are called, can be used for loading tips
	"loading": {
		// Ajax request begins
		"start": function (hash, url, opoa, postData) {
		}
		// Ajax request is successful
		"success": function (hash, url, opoa, postData) {
		}
		// Ajax request error
		"error": function (hash, url, opoa, postData) {
		}
		// Ajax request ends ( regardless of success or failure will be called )
		"end": function (hash, url, opoa, postData) {
		}
	}
};
 ```

- ### OPOA instance creation examples:

 ```JS
// opoa Instance
var opoa = {
	"actions" : "#menuDIV .menu",
	"show" : "#contentDIV"
};
```

## 2. EasyOPOA Framework API

EasyOPOA framework open 12 system-level global API.


 - ### EasyOPOA.Configs 
 
 `EasyOPOA.Configs` save the default values ​​OPOA instance properties globally. OPOA global default instance configuration parameters, can be re-set by `EasyOPOA.Configs`.

 >  Example:
>   ```JS	
> // If you do not find the find the specified content data returned from the server, then displays all
> EasyOPOA.Configs.notFound="all";
> // Get url DOM attribute values
> EasyOPOA.Configs.url="href";
> 	...
> ```


 - ### EasyOPOA.cookieLast
```JS	
 = boolean：true || false
```
 Use cookie, open action positioning memory function (dependent jquery.cookie.js and json2.js), the ability to record the action last visit, OPOA action to achieve recovery.

 default: false。



- ### EasyOPOA.start
```JS
 = function(opoaList, [actionMaps])
```
 Core methods, start EasyOPOA.

 Function with two arguments: opoaList (OPOA physical configuration collection), actionMaps (hash action mapping list of objects).

 >  actionMaps supports three forms of parameters: standard hash mapping object, based on the list of  standard hash action mapping objects array parameter, an array of objects based on the list.
> 				
> - **When activated, incoming standard hash action mapping object:**
> 
> ```JS
> // standard hash action mapping
> var actionMap={"demo":[ "demo.jsp" ,opoaList.menu]};
> 
> // Use opoaList and actionMaps start
> EasyOPOA.start(opoaList,actionMap);
> ```
> 
> - **When you start, passing an array list of parameters (based on the standard mapping object):**
> 
> ```JS
> var actionMaps=[
> 	// based standard hash action mapping
> 	// {hash: [ url, opoaInstance ]}
> 	{"demo" : [ "demo.jsp" ,opoaList.menu]},
> 	{"readme" : [ "readme.jsp",opoaList.menu ]}
> ];
> 
> //Use opoaList and actionMaps start
> EasyOPOA.start(opoaList,actionMap);
> ```
> 
> - **When you start, passing an array list of parameters (based on an array of objects):**
> 
> ```JS
> var actionMaps2=[
> 	// based Arrays
> 	// [hash, url, opoaInstance]
> 	["demo", "demo.jsp", opoaList.menu],
> 	["readme", "readme.jsp", opoaList.menu]
> ];
> 
> //Use opoaList and actionMaps start
> EasyOPOA.start(opoaList,actionMap2);
> ```

- ### EasyOPOA.notHash
```JS
 = function([hash])
```
 If the user requests a hash unregistered handler does not exist (such as the user to save the bookmark has expired or does not exist).

 Functions can be passed one argument: the name of the user to access an invalid hash.




 - ### EasyOPOA.addActionMap :
```JS
  = function(hash, url, opoa)
```
 addActionMap (hash, url, opoa) function to add a new custom hash action mapping.

  Functions can be passed three parameters: Custom hash name, custom url, custom opoa instance.



 - ### EasyOPOA.addActionUrlErrors :
```JS
  = function(hash, urlErrorsObject) 
```
 addActionUrlErrors (hash, urlErrorsObject) function is defined as the hash code action HTTP response object.

  Function with two arguments: hash name, HTTP response object code.

 >   **HTTP response object code:**
> Ajax jQuery equivalent of state processing parameters statusCode.
>
>  ```JS
> {
>     //http code: handler
> 	404:function(){},
> 	500:function(){}
> }
> ```

- ### EasyOPOA.addActionLoadings
```JS
 = function(hash, loadingObject)
```
 addActionLoadings (hash, loadingObject) function specifies loading process object to hash action.

  Function with two arguments: hash name, loading the processing object.

 >   **loading process object:**
>   
> Loading processing object contains four loading states: start, success, error, end.
> Does not force requirements also define four states, the definition, according to the definitions section needs only.
>
>  ```JS
{
	//ajax start
	"start":function(hash, url, opoa, postData){},
	//ajax success
	"success":function(hash, url, opoa, postData){},
	//ajax error
	"error":function(hash, url, opoa, postData){},
	//ajax end(Regardless of success or failure will be called)
	"end":function(hash, url, opoa, postData){}
}
> ```


- ### EasyOPOA.home
```JS
 = function(hash, [postData])
```
 Home dynamically loaded by hash name.

 Function with two arguments: hash name, submitted to the server's data postData....

- ### EasyOPOA.homeUrl
```JS
 = function(url, opoaInstance, [postData])
```
 Home dynamically loaded by url.

 Function can be passed two parameters: url, opoaInstance, submitted to the server's data postData.


- ### EasyOPOA.homeFun
```JS
  = function()
```
 When OPOA not loaded home from Ajax, the default display page handler.
 The next scene is mainly used for the static content page, the browser back to the home page Home static content can not update in question. You can set a static page content displayed in this function.

 >   Example:
>   ```JS
> EasyOPOA.homeFun=function(){
> 	$("#contentDIV").html("<h1>welcome!</h1>");
> }
> ```


- ### EasyOPOA.load
```JS 
 = function(hash, [postData])
```
 Loaded via hash action name manually.

 Function with two arguments: hash name, submitted to the server's data postData.

- ### EasyOPOA.noConflict
```JS
 = function([deep])
```
 noConflict function, the control variable EasyOPOA and OPOA of transferring it to the first realization that library.

 Function can pass a parameter: deep (empty or false to release only OPOA namespace is true will be fully released EasyOPOA and OPOA namespace).

 > Example:
 >  Control over the operation of the function of the variable `OPOA` transfer to first realize that its library.
> ```JS
> var $OPOA=EasyOPOA.noConflict();
> ```
> 
> Run this function will control variable `OPOA` and `EasyOPOA` the transfer to the first library that implements it.
> ```JS
> var $OPOA=EasyOPOA.noConflict(true);
> ```



## END



If you have more comments, suggestions or ideas, please contact me.


[Demo Online](http://www.lightfeel.com/easy/easyopoa/en/index.jsp#demo '在线 Demo')

Contact , feedback, customization, training Email: <inthinkcolor@gmail.com>

<p>
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
<input type="hidden" name="cmd" value="_xclick">
<input type="hidden" name="business" value="inthinkcolor@gmail.com">
<input type="hidden" name="item_name" value="EasyProject development Donation">
<input type="hidden" name="no_note" value="1">
<input type="hidden" name="tax" value="0">
<input type="image" src="http://www.lightfeel.com/easy/images/paypaldonation5.jpg"  title="PayPal donation"  border="0" name="submit" alt="Make payments with PayPal - it's fast, free and secure!">
</form>
</P>
