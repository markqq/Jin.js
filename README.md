# Jin.js
[![MIT](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://github.com/emilwallner/Screenshot-to-code-in-Keras/blob/master/LICENSE)

A JavaScript framework for building UI on the web.

# Installation

```html
<script src="Jin.js" type="text/javascript"></script>
```

# Features

You can declare some components in your page via `<script tyle="text/component"></script>` tag or import components-declared file by using `<script tyle="text/component" src></script>` tag in the `<head>...</head>` of your page.

Jin.js will handle these components, all you need to do is deploy these components in your page and customize them.

......

# Documentation

## Components Patten

A components-declared file (usually suffixed .js) contains several declarations as follows:

```html
[!#JinStart name="standardCard"]
<div style="background: white;
            box-shadow: 0 1px 2px grey;
            border-radius: 4px;
            margin: 20px auto;
            padding: 20px;
            max-width: 300px;">
	<h1 style="font-size: 18px;
             color: #0e0e0e;
             margin: 0;">
    	{{card_title}}
  	</h1>
	<p style="color: #808080;
            fonnt-size: 16px;
            margin: 10px 0 0 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: ellipsis;">
    {{card_content}}
  </p>
</div>
[!#JinEnd]
```

Apparently, the `[!#JinStart]` and `[!#JinEnd]` tag is for packing different components' HTML code, and a `name` parameter is nessary.

## Import Components

You have 3 ways to declare your components.

  ### 1. Using `<script tyle="text/components" src></script>` Tag
  Adding `<script tyle="text/component" src></script>` tag between your page's `<head>` and `</head>`, Jin.js will fetch the target file when DOM is rendered.
  
  eg:
  ```html
  <script src="components/component1.js" tyle="text/components"></script>
  ```
  
  ### 2. Using `<script tyle="text/components"></script>` Tag
  Drectly attach components declaration between rag `<script tyle="text/component" src>` and `</script>`
  
  eg:
  ```html
  <script tyle="text/component">
  [!#JinStart name="components1"]
    <div>{{content}}</div>
  [!#JinEnd]
  </script>
  ```
  
  ### 2. Using `new Jin(url)` Method
  
  eg: 
  ```javascript
	const component_1 = new Jin('example-components/default2.html');
	component_1.ready( () => {
		alert('component_1 is ready');
	});
  ```
  ```javascript
	new Jin('example-components/default2.html').ready( () => {
		alert('component_1 is ready');
	});
  ```
  
  ### ! NOTICE
  
  In method 1 and 3, there might be cross-origin protection which will restrict Jin.js to fetch the component-declared file. To avoid this situation, please refer to ACCESS-CONTROL-ALLOW-ORIGIN or store the file in the same origin as the page. (You don't need to worry if you are using some hybrid platform such as phonegap, ionic etc)
  
## Jin.onReady

```javascript
Jin.onReady(function)
```

function will be called when all component-declared file imported by `<script>` tag are ready.

<b>WRONG:</b>

```html
<script src="component.js" tyle="text/component"></script>
<script>
card = Jin.append('body', 'card', {
	card_title: 'Hello World!'
});
// component1 is declared in component.js
</script>
```

<b>CORRECT:</b>

```html
<script src="component.js" tyle="text/component"></script>
<script>
Jin.onReady( () => {
	card = Jin.append('body', 'card', {
		card_title: 'Hello World!'
	});
});
// component1 is declared in component.js
</script>
```

## Jin.ready

```javascript
[Jin Object].ready(function)
```

function will be called when the component-declared file imported dynamicly is ready.

<b>WRONG:</b>

```javascript
new Jin('component.js');
card = Jin.append('body', 'card', {
	card_title: 'Hello World!'
});
// component1 is declared in component.js
```

<b>CORRECT:</b>

```javascript
<script>
new Jin('component.js').ready( () => {
	card = Jin.append('body', 'card', {
		card_title: 'Hello World!'
	});
});
// component1 is declared in component.js
</script>
```

## Jin.append

```javascript
Jin.append(parent, component, data)
```

## Dynamic Updata

After you initialize a component (for example A) in your page, you can change its data (such as A.title = 'Hello Beijing') directly, and the component in your page will updata automaticly.

eg:

```javascript
new Jin('component.js').ready( () => {
	card = Jin.append('body', 'card', {
		card_title: 'Hello World!'
	});
	card.card_title = 'Hello Beijing!';
});
```

......
