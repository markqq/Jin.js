	"use strict";
	window.JinComponentTree = [],
	window.JinComponentTreeData = [];
	window.JinOnReadyFun = [];
	window.JinEmbeddedTagNum = -1;
	window.JinEmbeddedLoadedTagNum = 0;
	class Jiner{
		constructor(){
			this.initAjax();
		}
		static DOMReady(fn){
			if (document.addEventListener){
				// standard browser
				document.addEventListener('DOMContentLoaded', () => {
					// destory event
					document.removeEventListener('DOMContentLoaded', null, false);
					fn();
				}, false);
			}else if (document.attachEvent){
				// IE
				document.attachEvent('onreadystatechange', () => {
					if (document.readyState == 'complete'){
						document.detachEvent('onreadystatechange', null);
						fn();
					}
				});
			}
		}
		initAjax(){
			this.get = (url, fn) => {
				let xhr = new XMLHttpRequest();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = () => {
					if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304){
						fn.call(this, xhr.responseText);
					}
				};
				xhr.send();
			}
			this.post = (url, data, fn) => {
				let xhr = new XMLHttpRequest();
				xhr.open('POST', url, true);
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.onreadystatechange = () => {
					if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304){
						fn.call(this, xhr.responseText);
					}
				};
				xhr.send(data);
			}
		}
		loadScript(url, fn){
			let head = document.getElementsByTagName('head')[0],
				script = document.createElement('script'),
				done = false;
			script.src = url;
			script.type = 'text/component';
			script.onload = script.onreadystatechange = () => {
				if(!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')){
					done = true;
					fn();
					script.onload = script.onreadystatechange = null;
				}
			};
			head.appendChild(script);
		}
		// convert parameter string into object data
		parameterParse(str, name = `Unknown Component`){
			let obj = {}
			// merge spaces
			str = str.replace(/\s+/g, ` `);
			// delete extra spaces
			str = str.replace(/(^\s*)|(\s*$)/g,``);
			// convert to obj-like format
			str = str.replace(/\ /g, ";");
			str = str.replace(/\=/g, ":");
			try{
				let r = {};
				eval(`r = {${str}};`);
				// check if `name` set
				if(typeof(r.name) == 'undefined')
					throw 'Missing nessary parameter "name"';
				return r;
			}catch(err){
				console.error(new Error(`Wrong component parameters declare in ${name}`));
				return false;
			}
		}
		contentParse(content, skipCoint = 1){
			let r = content.split(`[!#JinStart `);
			r.forEach( (obj, i, arr) => {
				try{
					// skip if is the first `JinStart` tag
					if (i == 0) return true;
					// parse parameters
					let parameters = this.parameterParse(obj.split(`]`)[0]),
						l = obj.slice(obj.indexOf(`]`) + 1);
					// check if missing `JinEnd` tag
					if (l.indexOf(`[!#JinEnd]`) <= 0)
						throw `Missing "JinEnd" tag for component ${parameters.name}`;
					// check if component name conflict
					if (window.JinComponentTree.indexOf(parameters.name) != -1)
						throw `Component name "${parameters.name}" already existed`;
					l = l.split(`[!#JinEnd]`)[0];
					let tampData = {
						name: parameters.name,
						parameters: parameters,
						template: l
					};
					// updata JinComponentTree and its data
					window.JinComponentTree.push(parameters.name);
					window.JinComponentTreeData.push(tampData);
					// if all script tag parsed, call function array: window.JinOnReadyFun
					if (skipCoint == 1)
						return true;
					window.JinEmbeddedLoadedTagNum++;
					if (window.JinEmbeddedLoadedTagNum == window.JinEmbeddedTagNum){
						window.JinOnReadyFun.forEach( (obj, index, arr) => {
							obj.call();
						});
					}
				}catch(err){
					console.error(err);
				}
			} );
		}
	}
	class Jin extends Jiner{
		constructor(string, type = 'url', skipCount = 1){
			super();
			if (type == 'url'){
				this.url = string;
				this.readyFunc = null;
				this.loadComponentFile(skipCount);
			}else if(type == 'embed'){
				this.contentParse(string, skipCount);
			}
		}
		loadComponentFile(skipCount = 1){
			this.get(this.url, (content) => {
				this.contentParse(content, skipCount);
				if (this.readyFunc != null)
					this.readyFunc.call();
			});
		}
		ready(fn){
			this.readyFunc = fn;
		}
		static onReady(fun){
			window.JinOnReadyFun.push(fun);
		}
		static createVirtualDOM(id, html){
			// ???????????????
			let domID = id,
				body = document.getElementsByTagName('body')[0],
				template = document.createElement('template');
			template.class = 'JinVirtualDOM';
			template.style = 'display:none!important;visibility:hidden;height:0;width:0;overflow:hidden;position:absolute;left:-20px;top:-20px;z-index:-1';
			template.id = domID;
			template.innerHTML = html;
			body.appendChild(template);
		}
		static renderHTMLWidthData(html, data = {}){
			for (var key in data){
				eval('html = html.replace(/\\{{' + key + `}}/g, data[key]);`);
			}
			return html;
		}
		static render(name, data){
			let i = window.JinComponentTree.indexOf(name),
				d = window.JinComponentTreeData[i],
				o = this.renderHTMLWidthData(d.template, data);
			return o;
		}
		static action(parent, name, data, method){
			// check if `name` in JinComponentTree
			if (window.JinComponentTree.indexOf(name) < 0){
				console.error(new Error(`Undeclared component name "${name}"`));
				return false;
			}
            let t = document.createElement('div'),
            	f = document.createDocumentFragment(),
            	_d = {},
            	virtualDOMID = 'Jin-virtual-' + Math.floor(Math.random () * 900) + 100,
            	h = this.render(name, data);
            t.innerHTML = h;
            while (t.firstChild) {
                f.appendChild(t.firstChild);
            }
            // create real DOM
            eval(`document.querySelector(parent).${method}(f);`);
            // create virtual DOM
            this.createVirtualDOM(virtualDOMID, h);
			// create dynamic object
			for (var key in data){
				eval(`
				_d[key] = data[key];
				Object.defineProperty(data, key, {
				    get: () => {
				    	// get original data and return it
				    	return data.JinData.data.${key};
				    },
				    set: (newValue) => {
				    	// updata JinData.data
				    	data.JinData.data.${key} = newValue;
				    	// data's key has changed, rerender it
				    	let setData = data.JinData.data;
				    	// ???????????????
				    	document.querySelector('${parent}').innerHTML = this.render('${name}', setData);
				    }
				});
				`);
			}
			// add a propertype `JinParent`
			// `JinParent` stores object's parent, name, and data
			Object.defineProperty(data, 'JinData', {
			    value: {
			    	parent: parent,
			    	name: name,
			    	data: _d
			    },
			    writable: true
			});
			return data;
		}
		static append(parent, name, data){
			return this.action(parent, name, data, 'appendChild');
		}
	}
	// excute components file on page after DOM rendered
	// embed
	Jiner.DOMReady( () => {
		window.JinEmbeddedTagNum = document.querySelectorAll('script[type="text/component"]').length;
		document.querySelectorAll('script[type="text/component"]').forEach( (obj, index, arr) => {
			let content = (obj.getAttribute("src") === null) ? obj.innerHTML : null;
			if (content === null){
				// no-src script tag
				new Jin(obj.getAttribute("src"), 'url', 0);
			}else{
				new Jin(content, 'embed', 0);
			}
		});
	});
