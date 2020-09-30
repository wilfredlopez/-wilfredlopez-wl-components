'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*!
 Stencil Mock Doc v2.0.3 | MIT Licensed | https://stenciljs.com
 */
const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const attrHandler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }
    if (!isNaN(prop)) {
      return obj.__items[prop];
    }
    return undefined;
  },
};
const createAttributeProxy = (caseInsensitive) => new Proxy(new MockAttributeMap(caseInsensitive), attrHandler);
class MockAttributeMap {
  constructor(caseInsensitive = false) {
    this.caseInsensitive = caseInsensitive;
    this.__items = [];
  }
  get length() {
    return this.__items.length;
  }
  item(index) {
    return this.__items[index] || null;
  }
  setNamedItem(attr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }
  setNamedItemNS(attr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }
    const existingAttr = this.__items.find(a => a.name === attr.name && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    }
    else {
      this.__items.push(attr);
    }
  }
  getNamedItem(attrName) {
    if (this.caseInsensitive) {
      attrName = attrName.toLowerCase();
    }
    return this.getNamedItemNS(null, attrName);
  }
  getNamedItemNS(namespaceURI, attrName) {
    namespaceURI = getNamespaceURI(namespaceURI);
    return this.__items.find(attr => attr.name === attrName && getNamespaceURI(attr.namespaceURI) === namespaceURI) || null;
  }
  removeNamedItem(attr) {
    this.removeNamedItemNS(attr);
  }
  removeNamedItemNS(attr) {
    for (let i = 0, ii = this.__items.length; i < ii; i++) {
      if (this.__items[i].name === attr.name && this.__items[i].namespaceURI === attr.namespaceURI) {
        this.__items.splice(i, 1);
        break;
      }
    }
  }
}
function getNamespaceURI(namespaceURI) {
  return namespaceURI === XLINK_NS ? null : namespaceURI;
}
function cloneAttributes(srcAttrs, sortByName = false) {
  const dstAttrs = new MockAttributeMap(srcAttrs.caseInsensitive);
  if (srcAttrs != null) {
    const attrLen = srcAttrs.length;
    if (sortByName && attrLen > 1) {
      const sortedAttrs = [];
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        sortedAttrs.push(dstAttr);
      }
      sortedAttrs.sort(sortAttributes).forEach(attr => {
        dstAttrs.setNamedItemNS(attr);
      });
    }
    else {
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        dstAttrs.setNamedItemNS(dstAttr);
      }
    }
  }
  return dstAttrs;
}
function sortAttributes(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
class MockAttr {
  constructor(attrName, attrValue, namespaceURI = null) {
    this._name = attrName;
    this._value = String(attrValue);
    this._namespaceURI = namespaceURI;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value);
  }
  get nodeName() {
    return this._name;
  }
  set nodeName(value) {
    this._name = value;
  }
  get nodeValue() {
    return this._value;
  }
  set nodeValue(value) {
    this._value = String(value);
  }
  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = namespaceURI;
  }
}

class MockCustomElementRegistry {
  constructor(win) {
    this.win = win;
  }
  define(tagName, cstr, options) {
    if (tagName.toLowerCase() !== tagName) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': "${tagName}" is not a valid custom element name`);
    }
    if (this.__registry == null) {
      this.__registry = new Map();
    }
    this.__registry.set(tagName, { cstr, options });
    if (this.__whenDefined != null) {
      const whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns != null) {
        whenDefinedResolveFns.forEach(whenDefinedResolveFn => {
          whenDefinedResolveFn();
        });
        whenDefinedResolveFns.length = 0;
        this.__whenDefined.delete(tagName);
      }
    }
    const doc = this.win.document;
    if (doc != null) {
      const hosts = doc.querySelectorAll(tagName);
      hosts.forEach(host => {
        if (upgradedElements.has(host) === false) {
          tempDisableCallbacks.add(doc);
          const upgradedCmp = createCustomElement(this, doc, tagName);
          for (let i = 0; i < host.childNodes.length; i++) {
            const childNode = host.childNodes[i];
            childNode.remove();
            upgradedCmp.appendChild(childNode);
          }
          tempDisableCallbacks.delete(doc);
          if (proxyElements.has(host)) {
            proxyElements.set(host, upgradedCmp);
          }
        }
        fireConnectedCallback(host);
      });
    }
  }
  get(tagName) {
    if (this.__registry != null) {
      const def = this.__registry.get(tagName.toLowerCase());
      if (def != null) {
        return def.cstr;
      }
    }
    return undefined;
  }
  upgrade(_rootNode) {
    //
  }
  clear() {
    if (this.__registry != null) {
      this.__registry.clear();
    }
    if (this.__whenDefined != null) {
      this.__whenDefined.clear();
    }
  }
  whenDefined(tagName) {
    tagName = tagName.toLowerCase();
    if (this.__registry != null && this.__registry.has(tagName) === true) {
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (this.__whenDefined == null) {
        this.__whenDefined = new Map();
      }
      let whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns == null) {
        whenDefinedResolveFns = [];
        this.__whenDefined.set(tagName, whenDefinedResolveFns);
      }
      whenDefinedResolveFns.push(resolve);
    });
  }
}
function createCustomElement(customElements, ownerDocument, tagName) {
  const Cstr = customElements.get(tagName);
  if (Cstr != null) {
    const cmp = new Cstr(ownerDocument);
    cmp.nodeName = tagName.toUpperCase();
    upgradedElements.add(cmp);
    return cmp;
  }
  const host = new Proxy({}, {
    get(obj, prop) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        return elm[prop];
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        elm[prop] = val;
      }
      else {
        obj[prop] = val;
      }
      return true;
    },
    has(obj, prop) {
      const elm = proxyElements.get(host);
      if (prop in elm) {
        return true;
      }
      if (prop in obj) {
        return true;
      }
      return false;
    },
  });
  const elm = new MockHTMLElement(ownerDocument, tagName);
  proxyElements.set(host, elm);
  return host;
}
const proxyElements = new WeakMap();
const upgradedElements = new WeakSet();
function connectNode(ownerDocument, node) {
  node.ownerDocument = ownerDocument;
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (ownerDocument != null && node.nodeName.includes('-')) {
      const win = ownerDocument.defaultView;
      if (win != null && typeof node.connectedCallback === 'function' && node.isConnected) {
        fireConnectedCallback(node);
      }
      const shadowRoot = node.shadowRoot;
      if (shadowRoot != null) {
        shadowRoot.childNodes.forEach(childNode => {
          connectNode(ownerDocument, childNode);
        });
      }
    }
    node.childNodes.forEach(childNode => {
      connectNode(ownerDocument, childNode);
    });
  }
  else {
    node.childNodes.forEach(childNode => {
      childNode.ownerDocument = ownerDocument;
    });
  }
}
function fireConnectedCallback(node) {
  if (typeof node.connectedCallback === 'function') {
    if (tempDisableCallbacks.has(node.ownerDocument) === false) {
      try {
        node.connectedCallback();
      }
      catch (e) {
        console.error(e);
      }
    }
  }
}
function disconnectNode(node) {
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (node.nodeName.includes('-') === true && typeof node.disconnectedCallback === 'function') {
      if (tempDisableCallbacks.has(node.ownerDocument) === false) {
        try {
          node.disconnectedCallback();
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    node.childNodes.forEach(disconnectNode);
  }
}
function attributeChanged(node, attrName, oldValue, newValue) {
  attrName = attrName.toLowerCase();
  const observedAttributes = node.constructor.observedAttributes;
  if (Array.isArray(observedAttributes) === true && observedAttributes.some(obs => obs.toLowerCase() === attrName) === true) {
    try {
      node.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
      console.error(e);
    }
  }
}
function checkAttributeChanged(node) {
  return node.nodeName.includes('-') === true && typeof node.attributeChangedCallback === 'function';
}
const tempDisableCallbacks = new Set();

function dataset(elm) {
  const ds = {};
  const attributes = elm.attributes;
  const attrLen = attributes.length;
  for (let i = 0; i < attrLen; i++) {
    const attr = attributes.item(i);
    const nodeName = attr.nodeName;
    if (nodeName.startsWith('data-')) {
      ds[dashToPascalCase(nodeName)] = attr.nodeValue;
    }
  }
  return new Proxy(ds, {
    get(_obj, camelCaseProp) {
      return ds[camelCaseProp];
    },
    set(_obj, camelCaseProp, value) {
      const dataAttr = toDataAttribute(camelCaseProp);
      elm.setAttribute(dataAttr, value);
      return true;
    },
  });
}
function toDataAttribute(str) {
  return ('data-' +
    String(str)
      .replace(/([A-Z0-9])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase());
}
function dashToPascalCase(str) {
  str = String(str).substr(5);
  return str
    .split('-')
    .map((segment, index) => {
    if (index === 0) {
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  })
    .join('');
}

// Sizzle 2.3.5
const Sizzle = (function() {
const window = {
  document: {
  createElement() {
    return {};
  },
  nodeType: 9,
  documentElement: {
    nodeType: 1,
    nodeName: 'HTML'
  }
  }
};
const module = { exports: {} };

/*! Sizzle v2.3.5 | (c) JS Foundation and other contributors | js.foundation */
!function(e){var t,n,r,i,o,u,l,a,c,s,d,f,p,h,g,m,y,v,w,b="sizzle"+1*new Date,N=e.document,C=0,x=0,E=ae(),A=ae(),S=ae(),D=ae(),T=function(e,t){return e===t&&(d=!0),0},L={}.hasOwnProperty,q=[],I=q.pop,B=q.push,R=q.push,$=q.slice,k=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",P="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",z="\\["+M+"*("+P+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+P+"))|)"+M+"*\\]",F=":("+P+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+z+")*)|.*)\\)|)",O=new RegExp(M+"+","g"),j=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),G=new RegExp("^"+M+"*,"+M+"*"),U=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),X=new RegExp(F),J=new RegExp("^"+P+"$"),K={ID:new RegExp("^#("+P+")"),CLASS:new RegExp("^\\.("+P+")"),TAG:new RegExp("^("+P+"|[*])"),ATTR:new RegExp("^"+z),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/HTML$/i,W=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){f();},ue=ve(function(e){return !0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{R.apply(q=$.call(N.childNodes),N.childNodes),q[N.childNodes.length].nodeType;}catch(e){R={apply:q.length?function(e,t){B.apply(e,$.call(t));}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1;}};}function le(e,t,r,i){var o,l,c,s,d,h,y,v=t&&t.ownerDocument,N=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==N&&9!==N&&11!==N)return r;if(!i&&(f(t),t=t||p,g)){if(11!==N&&(d=_.exec(e)))if(o=d[1]){if(9===N){if(!(c=t.getElementById(o)))return r;if(c.id===o)return r.push(c),r}else if(v&&(c=v.getElementById(o))&&w(t,c)&&c.id===o)return r.push(c),r}else {if(d[2])return R.apply(r,t.getElementsByTagName(e)),r;if((o=d[3])&&n.getElementsByClassName&&t.getElementsByClassName)return R.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!D[e+" "]&&(!m||!m.test(e))&&(1!==N||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===N&&(V.test(e)||U.test(e))){(v=ee.test(e)&&ge(t.parentNode)||t)===t&&n.scope||((s=t.getAttribute("id"))?s=s.replace(re,ie):t.setAttribute("id",s=b)),l=(h=u(e)).length;while(l--)h[l]=(s?"#"+s:":scope")+" "+ye(h[l]);y=h.join(",");}try{return R.apply(r,v.querySelectorAll(y)),r}catch(t){D(e,!0);}finally{s===b&&t.removeAttribute("id");}}}return a(e.replace(j,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function ce(e){return e[b]=!0,e}function se(e){var t=p.createElement("fieldset");try{return !!e(t)}catch(e){return !1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null;}}function de(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t;}function fe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return -1;return e?1:-1}function pe(e){return function(t){return "form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ue(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return ce(function(t){return t=+t,ce(function(n,r){var i,o=e([],n.length,t),u=o.length;while(u--)n[i=o[u]]&&(n[i]=!(r[i]=n[i]));})})}function ge(e){return e&&void 0!==e.getElementsByTagName&&e}n=le.support={},o=le.isXML=function(e){var t=e.namespaceURI,n=(e.ownerDocument||e).documentElement;return !Q.test(t||n&&n.nodeName||"HTML")},f=le.setDocument=function(e){var t,i,u=e?e.ownerDocument||e:N;return u!=p&&9===u.nodeType&&u.documentElement?(p=u,h=p.documentElement,g=!o(p),N!=p&&(i=p.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.scope=se(function(e){return h.appendChild(e).appendChild(p.createElement("div")),void 0!==e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),n.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=se(function(e){return e.appendChild(p.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Z.test(p.getElementsByClassName),n.getById=se(function(e){return h.appendChild(e).id=b,!p.getElementsByName||!p.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return [o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return [o]}return []}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=Z.test(p.querySelectorAll))&&(se(function(e){var t;h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+H+")"),e.querySelectorAll("[id~="+b+"-]").length||m.push("~="),(t=p.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||m.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||m.push(".#.+[+~]"),e.querySelectorAll("\\\f"),m.push("[\\r\\n\\f]");}),se(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=p.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:");})),(n.matchesSelector=Z.test(v=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F);}),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=Z.test(h.compareDocumentPosition),w=t||Z.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return !0;return !1},T=t?function(e,t){if(e===t)return d=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e==p||e.ownerDocument==N&&w(N,e)?-1:t==p||t.ownerDocument==N&&w(N,t)?1:s?k(s,e)-k(s,t):0:4&r?-1:1)}:function(e,t){if(e===t)return d=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!i||!o)return e==p?-1:t==p?1:i?-1:o?1:s?k(s,e)-k(s,t):0;if(i===o)return fe(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?fe(u[r],l[r]):u[r]==N?-1:l[r]==N?1:0},p):p},le.matches=function(e,t){return le(e,null,null,t)},le.matchesSelector=function(e,t){if(f(e),n.matchesSelector&&g&&!D[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){D(t,!0);}return le(t,p,null,[e]).length>0},le.contains=function(e,t){return (e.ownerDocument||e)!=p&&f(e),w(e,t)},le.attr=function(e,t){(e.ownerDocument||e)!=p&&f(e);var i=r.attrHandle[t.toLowerCase()],o=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},le.escape=function(e){return (e+"").replace(re,ie)},le.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},le.uniqueSort=function(e){var t,r=[],i=0,o=0;if(d=!n.detectDuplicates,s=!n.sortStable&&e.slice(0),e.sort(T),d){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1);}return s=null,e},i=le.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e);}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=le.selectors={cacheLength:50,createPseudo:ce,match:K,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||le.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&le.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return K.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=u(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return "*"===e?function(){return !0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=le.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(O," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),u="last"!==e.slice(-4),l="of-type"===t;return 1===r&&0===i?function(e){return !!e.parentNode}:function(t,n,a){var c,s,d,f,p,h,g=o!==u?"nextSibling":"previousSibling",m=t.parentNode,y=l&&t.nodeName.toLowerCase(),v=!a&&!l,w=!1;if(m){if(o){while(g){f=t;while(f=f[g])if(l?f.nodeName.toLowerCase()===y:1===f.nodeType)return !1;h=g="only"===e&&!h&&"nextSibling";}return !0}if(h=[u?m.firstChild:m.lastChild],u&&v){w=(p=(c=(s=(d=(f=m)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1])&&c[2],f=p&&m.childNodes[p];while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if(1===f.nodeType&&++w&&f===t){s[e]=[C,p,w];break}}else if(v&&(w=p=(c=(s=(d=(f=t)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1]),!1===w)while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if((l?f.nodeName.toLowerCase()===y:1===f.nodeType)&&++w&&(v&&((s=(d=f[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]=[C,w]),f===t))break;return (w-=i)===r||w%r==0&&w/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||le.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ce(function(e,n){var r,o=i(e,t),u=o.length;while(u--)e[r=k(e,o[u])]=!(n[r]=o[u]);}):function(e){return i(e,0,n)}):i}},pseudos:{not:ce(function(e){var t=[],n=[],r=l(e.replace(j,"$1"));return r[b]?ce(function(e,t,n,i){var o,u=r(e,null,i,[]),l=e.length;while(l--)(o=u[l])&&(e[l]=!(t[l]=o));}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:ce(function(e){return function(t){return le(e,t).length>0}}),contains:ce(function(e){return e=e.replace(te,ne),function(t){return (t.textContent||i(t)).indexOf(e)>-1}}),lang:ce(function(e){return J.test(e||"")||le.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return (n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return !1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:pe(!1),disabled:pe(!0),checked:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return !1;return !0},parent:function(e){return !r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return W.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return "input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return [0]}),last:he(function(e,t){return [t-1]}),eq:he(function(e,t,n){return [n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=function(e){return function(t){return "input"===t.nodeName.toLowerCase()&&t.type===e}}(t);for(t in {submit:!0,reset:!0})r.pseudos[t]=function(e){return function(t){var n=t.nodeName.toLowerCase();return ("input"===n||"button"===n)&&t.type===e}}(t);function me(){}me.prototype=r.filters=r.pseudos,r.setFilters=new me,u=le.tokenize=function(e,t){var n,i,o,u,l,a,c,s=A[e+" "];if(s)return t?0:s.slice(0);l=e,a=[],c=r.preFilter;while(l){n&&!(i=G.exec(l))||(i&&(l=l.slice(i[0].length)||l),a.push(o=[])),n=!1,(i=U.exec(l))&&(n=i.shift(),o.push({value:n,type:i[0].replace(j," ")}),l=l.slice(n.length));for(u in r.filter)!(i=K[u].exec(l))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),l=l.slice(n.length));if(!n)break}return t?l.length:l?le.error(e):A(e,a).slice(0)};function ye(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function ve(e,t,n){var r=t.dir,i=t.next,o=i||r,u=n&&"parentNode"===o,l=x++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||u)return e(t,n,i);return !1}:function(t,n,a){var c,s,d,f=[C,l];if(a){while(t=t[r])if((1===t.nodeType||u)&&e(t,n,a))return !0}else while(t=t[r])if(1===t.nodeType||u)if(d=t[b]||(t[b]={}),s=d[t.uniqueID]||(d[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else {if((c=s[o])&&c[0]===C&&c[1]===l)return f[2]=c[2];if(s[o]=f,f[2]=e(t,n,a))return !0}return !1}}function we(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return !1;return !0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)le(e,t[r],n);return n}function Ne(e,t,n,r,i){for(var o,u=[],l=0,a=e.length,c=null!=t;l<a;l++)(o=e[l])&&(n&&!n(o,r,i)||(u.push(o),c&&t.push(l)));return u}function Ce(e,t,n,r,i,o){return r&&!r[b]&&(r=Ce(r)),i&&!i[b]&&(i=Ce(i,o)),ce(function(o,u,l,a){var c,s,d,f=[],p=[],h=u.length,g=o||be(t||"*",l.nodeType?[l]:l,[]),m=!e||!o&&t?g:Ne(g,f,e,l,a),y=n?i||(o?e:h||r)?[]:u:m;if(n&&n(m,y,l,a),r){c=Ne(y,p),r(c,[],l,a),s=c.length;while(s--)(d=c[s])&&(y[p[s]]=!(m[p[s]]=d));}if(o){if(i||e){if(i){c=[],s=y.length;while(s--)(d=y[s])&&c.push(m[s]=d);i(null,y=[],c,a);}s=y.length;while(s--)(d=y[s])&&(c=i?k(o,d):f[s])>-1&&(o[c]=!(u[c]=d));}}else y=Ne(y===u?y.splice(h,y.length):y),i?i(null,u,y,a):R.apply(u,y);})}function xe(e){for(var t,n,i,o=e.length,u=r.relative[e[0].type],l=u||r.relative[" "],a=u?1:0,s=ve(function(e){return e===t},l,!0),d=ve(function(e){return k(t,e)>-1},l,!0),f=[function(e,n,r){var i=!u&&(r||n!==c)||((t=n).nodeType?s(e,n,r):d(e,n,r));return t=null,i}];a<o;a++)if(n=r.relative[e[a].type])f=[ve(we(f),n)];else {if((n=r.filter[e[a].type].apply(null,e[a].matches))[b]){for(i=++a;i<o;i++)if(r.relative[e[i].type])break;return Ce(a>1&&we(f),a>1&&ye(e.slice(0,a-1).concat({value:" "===e[a-2].type?"*":""})).replace(j,"$1"),n,a<i&&xe(e.slice(a,i)),i<o&&xe(e=e.slice(i)),i<o&&ye(e))}f.push(n);}return we(f)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,u,l,a,s){var d,h,m,y=0,v="0",w=o&&[],b=[],N=c,x=o||i&&r.find.TAG("*",s),E=C+=null==N?1:Math.random()||.1,A=x.length;for(s&&(c=u==p||u||s);v!==A&&null!=(d=x[v]);v++){if(i&&d){h=0,u||d.ownerDocument==p||(f(d),l=!g);while(m=e[h++])if(m(d,u||p,l)){a.push(d);break}s&&(C=E);}n&&((d=!m&&d)&&y--,o&&w.push(d));}if(y+=v,n&&v!==y){h=0;while(m=t[h++])m(w,b,u,l);if(o){if(y>0)while(v--)w[v]||b[v]||(b[v]=I.call(a));b=Ne(b);}R.apply(a,b),s&&!o&&b.length>0&&y+t.length>1&&le.uniqueSort(a);}return s&&(C=E,c=N),w};return n?ce(o):o}l=le.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=u(e)),n=t.length;while(n--)(o=xe(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e;}return o},a=le.select=function(e,t,n,i){var o,a,c,s,d,f="function"==typeof e&&e,p=!i&&u(e=f.selector||e);if(n=n||[],1===p.length){if((a=p[0]=p[0].slice(0)).length>2&&"ID"===(c=a[0]).type&&9===t.nodeType&&g&&r.relative[a[1].type]){if(!(t=(r.find.ID(c.matches[0].replace(te,ne),t)||[])[0]))return n;f&&(t=t.parentNode),e=e.slice(a.shift().value.length);}o=K.needsContext.test(e)?0:a.length;while(o--){if(c=a[o],r.relative[s=c.type])break;if((d=r.find[s])&&(i=d(c.matches[0].replace(te,ne),ee.test(a[0].type)&&ge(t.parentNode)||t))){if(a.splice(o,1),!(e=i.length&&ye(a)))return R.apply(n,i),n;break}}}return (f||l(e,p))(i,t,!g,n,!t||ee.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(T).join("")===b,n.detectDuplicates=!!d,f(),n.sortDetached=se(function(e){return 1&e.compareDocumentPosition(p.createElement("fieldset"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||de("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||de("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||de(H,function(e,t,n){var r;if(!n)return !0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null});var Ae=e.Sizzle;le.noConflict=function(){return e.Sizzle===le&&(e.Sizzle=Ae),le},"function"==typeof define&&define.amd?define(function(){return le}):"undefined"!=typeof module&&module.exports?module.exports=le:e.Sizzle=le;}(window);


return module.exports;
})();

function matches(selector, elm) {
  const r = Sizzle.matches(selector, [elm]);
  return r.length > 0;
}
function selectOne(selector, elm) {
  const r = Sizzle(selector, elm);
  return r[0] || null;
}
function selectAll(selector, elm) {
  return Sizzle(selector, elm);
}

class MockClassList {
  constructor(elm) {
    this.elm = elm;
  }
  add(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      if (clsNames.includes(className) === false) {
        clsNames.push(className);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.join(' '));
    }
  }
  remove(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach(className => {
      className = String(className);
      validateClass(className);
      const index = clsNames.indexOf(className);
      if (index > -1) {
        clsNames.splice(index, 1);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.filter(c => c.length > 0).join(' '));
    }
  }
  contains(className) {
    className = String(className);
    return getItems(this.elm).includes(className);
  }
  toggle(className) {
    className = String(className);
    if (this.contains(className) === true) {
      this.remove(className);
    }
    else {
      this.add(className);
    }
  }
  get length() {
    return getItems(this.elm).length;
  }
  item(index) {
    return getItems(this.elm)[index];
  }
  toString() {
    return getItems(this.elm).join(' ');
  }
}
function validateClass(className) {
  if (className === '') {
    throw new Error('The token provided must not be empty.');
  }
  if (/\s/.test(className)) {
    throw new Error(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
  }
}
function getItems(elm) {
  const className = elm.getAttribute('class');
  if (typeof className === 'string' && className.length > 0) {
    return className
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
  }
  return [];
}

class MockCSSStyleDeclaration {
  constructor() {
    this._styles = new Map();
  }
  setProperty(prop, value) {
    prop = jsCaseToCssCase(prop);
    if (value == null || value === '') {
      this._styles.delete(prop);
    }
    else {
      this._styles.set(prop, String(value));
    }
  }
  getPropertyValue(prop) {
    prop = jsCaseToCssCase(prop);
    return String(this._styles.get(prop) || '');
  }
  removeProperty(prop) {
    prop = jsCaseToCssCase(prop);
    this._styles.delete(prop);
  }
  get length() {
    return this._styles.size;
  }
  get cssText() {
    const cssText = [];
    this._styles.forEach((value, prop) => {
      cssText.push(`${prop}: ${value};`);
    });
    return cssText.join(' ').trim();
  }
  set cssText(cssText) {
    if (cssText == null || cssText === '') {
      this._styles.clear();
      return;
    }
    cssText.split(';').forEach(rule => {
      rule = rule.trim();
      if (rule.length > 0) {
        const splt = rule.split(':');
        if (splt.length > 1) {
          const prop = splt[0].trim();
          const value = splt[1].trim();
          if (prop !== '' && value !== '') {
            this._styles.set(jsCaseToCssCase(prop), value);
          }
        }
      }
    });
  }
}
function createCSSStyleDeclaration() {
  return new Proxy(new MockCSSStyleDeclaration(), cssProxyHandler);
}
const cssProxyHandler = {
  get(cssStyle, prop) {
    if (prop in cssStyle) {
      return cssStyle[prop];
    }
    prop = cssCaseToJsCase(prop);
    return cssStyle.getPropertyValue(prop);
  },
  set(cssStyle, prop, value) {
    if (prop in cssStyle) {
      cssStyle[prop] = value;
    }
    else {
      cssStyle.setProperty(prop, value);
    }
    return true;
  },
};
function cssCaseToJsCase(str) {
  // font-size to fontSize
  if (str.length > 1 && str.includes('-') === true) {
    str = str
      .toLowerCase()
      .split('-')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    str = str.substr(0, 1).toLowerCase() + str.substr(1);
  }
  return str;
}
function jsCaseToCssCase(str) {
  // fontSize to font-size
  if (str.length > 1 && str.includes('-') === false && /[A-Z]/.test(str) === true) {
    str = str
      .replace(/([A-Z])/g, g => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase();
  }
  return str;
}

class MockEvent {
  constructor(type, eventInitDict) {
    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.composed = false;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.target = null;
    if (typeof type !== 'string') {
      throw new Error(`Event type required`);
    }
    this.type = type;
    this.timeStamp = Date.now();
    if (eventInitDict != null) {
      Object.assign(this, eventInitDict);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  stopImmediatePropagation() {
    this.cancelBubble = true;
  }
}
class MockCustomEvent extends MockEvent {
  constructor(type, customEventInitDic) {
    super(type);
    this.detail = null;
    if (customEventInitDic != null) {
      Object.assign(this, customEventInitDic);
    }
  }
}
class MockKeyboardEvent extends MockEvent {
  constructor(type, keyboardEventInitDic) {
    super(type);
    this.code = '';
    this.key = '';
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;
    this.location = 0;
    this.repeat = false;
    if (keyboardEventInitDic != null) {
      Object.assign(this, keyboardEventInitDic);
    }
  }
}
class MockMouseEvent extends MockEvent {
  constructor(type, mouseEventInitDic) {
    super(type);
    this.screenX = 0;
    this.screenY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.metaKey = false;
    this.button = 0;
    this.buttons = 0;
    this.relatedTarget = null;
    if (mouseEventInitDic != null) {
      Object.assign(this, mouseEventInitDic);
    }
  }
}
class MockEventListener {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
}
function addEventListener(elm, type, handler) {
  const target = elm;
  if (target.__listeners == null) {
    target.__listeners = [];
  }
  target.__listeners.push(new MockEventListener(type, handler));
}
function removeEventListener(elm, type, handler) {
  const target = elm;
  if (target != null && Array.isArray(target.__listeners) === true) {
    const elmListener = target.__listeners.find(e => e.type === type && e.handler === handler);
    if (elmListener != null) {
      const index = target.__listeners.indexOf(elmListener);
      target.__listeners.splice(index, 1);
    }
  }
}
function resetEventListeners(target) {
  if (target != null && target.__listeners != null) {
    target.__listeners = null;
  }
}
function triggerEventListener(elm, ev) {
  if (elm == null || ev.cancelBubble === true) {
    return;
  }
  const target = elm;
  ev.currentTarget = elm;
  if (Array.isArray(target.__listeners) === true) {
    const listeners = target.__listeners.filter(e => e.type === ev.type);
    listeners.forEach(listener => {
      try {
        listener.handler.call(target, ev);
      }
      catch (err) {
        console.error(err);
      }
    });
  }
  if (ev.bubbles === false) {
    return;
  }
  if (elm.nodeName === "#document" /* DOCUMENT_NODE */) {
    triggerEventListener(elm.defaultView, ev);
  }
  else {
    triggerEventListener(elm.parentElement, ev);
  }
}
function dispatchEvent(currentTarget, ev) {
  ev.target = currentTarget;
  triggerEventListener(currentTarget, ev);
  return true;
}

function serializeNodeToHtml(elm, opts = {}) {
  const output = {
    currentLineWidth: 0,
    indent: 0,
    isWithinBody: false,
    text: [],
  };
  if (opts.prettyHtml) {
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 2;
    }
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = true;
    }
    opts.approximateLineWidth = -1;
  }
  else {
    opts.prettyHtml = false;
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = false;
    }
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 0;
    }
  }
  if (typeof opts.approximateLineWidth !== 'number') {
    opts.approximateLineWidth = -1;
  }
  if (typeof opts.removeEmptyAttributes !== 'boolean') {
    opts.removeEmptyAttributes = true;
  }
  if (typeof opts.removeAttributeQuotes !== 'boolean') {
    opts.removeAttributeQuotes = false;
  }
  if (typeof opts.removeBooleanAttributeQuotes !== 'boolean') {
    opts.removeBooleanAttributeQuotes = false;
  }
  if (typeof opts.removeHtmlComments !== 'boolean') {
    opts.removeHtmlComments = false;
  }
  if (typeof opts.serializeShadowRoot !== 'boolean') {
    opts.serializeShadowRoot = false;
  }
  if (opts.outerHtml) {
    serializeToHtml(elm, opts, output, false);
  }
  else {
    for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
      serializeToHtml(elm.childNodes[i], opts, output, false);
    }
  }
  if (output.text[0] === '\n') {
    output.text.shift();
  }
  if (output.text[output.text.length - 1] === '\n') {
    output.text.pop();
  }
  return output.text.join('');
}
function serializeToHtml(node, opts, output, isShadowRoot) {
  if (node.nodeType === 1 /* ELEMENT_NODE */ || isShadowRoot) {
    const tagName = isShadowRoot ? 'mock:shadow-root' : getTagName(node);
    if (tagName === 'body') {
      output.isWithinBody = true;
    }
    const ignoreTag = opts.excludeTags != null && opts.excludeTags.includes(tagName);
    if (ignoreTag === false) {
      if (opts.newLines) {
        output.text.push('\n');
        output.currentLineWidth = 0;
      }
      if (opts.indentSpaces > 0) {
        for (let i = 0; i < output.indent; i++) {
          output.text.push(' ');
        }
        output.currentLineWidth += output.indent;
      }
      output.text.push('<' + tagName);
      output.currentLineWidth += tagName.length + 1;
      const attrsLength = node.attributes.length;
      const attributes = opts.prettyHtml && attrsLength > 1 ? cloneAttributes(node.attributes, true) : node.attributes;
      for (let i = 0; i < attrsLength; i++) {
        const attr = attributes.item(i);
        const attrName = attr.name;
        if (attrName === 'style') {
          continue;
        }
        let attrValue = attr.value;
        if (opts.removeEmptyAttributes && attrValue === '' && REMOVE_EMPTY_ATTR.has(attrName)) {
          continue;
        }
        const attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI == null) {
          output.currentLineWidth += attrName.length + 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            output.text.push('\n' + attrName);
            output.currentLineWidth = 0;
          }
          else {
            output.text.push(' ' + attrName);
          }
        }
        else if (attrNamespaceURI === 'http://www.w3.org/XML/1998/namespace') {
          output.text.push(' xml:' + attrName);
          output.currentLineWidth += attrName.length + 5;
        }
        else if (attrNamespaceURI === 'http://www.w3.org/2000/xmlns/') {
          if (attrName !== 'xmlns') {
            output.text.push(' xmlns:' + attrName);
            output.currentLineWidth += attrName.length + 7;
          }
          else {
            output.text.push(' ' + attrName);
            output.currentLineWidth += attrName.length + 1;
          }
        }
        else if (attrNamespaceURI === XLINK_NS) {
          output.text.push(' xlink:' + attrName);
          output.currentLineWidth += attrName.length + 7;
        }
        else {
          output.text.push(' ' + attrNamespaceURI + ':' + attrName);
          output.currentLineWidth += attrNamespaceURI.length + attrName.length + 2;
        }
        if (opts.prettyHtml && attrName === 'class') {
          attrValue = attr.value = attrValue
            .split(' ')
            .filter(t => t !== '')
            .sort()
            .join(' ')
            .trim();
        }
        if (attrValue === '') {
          if (opts.removeBooleanAttributeQuotes && BOOLEAN_ATTR.has(attrName)) {
            continue;
          }
          if (opts.removeEmptyAttributes && attrName.startsWith('data-')) {
            continue;
          }
        }
        if (opts.removeAttributeQuotes && CAN_REMOVE_ATTR_QUOTES.test(attrValue)) {
          output.text.push('=' + escapeString(attrValue, true));
          output.currentLineWidth += attrValue.length + 1;
        }
        else {
          output.text.push('="' + escapeString(attrValue, true) + '"');
          output.currentLineWidth += attrValue.length + 3;
        }
      }
      if (node.hasAttribute('style')) {
        const cssText = node.style.cssText;
        if (opts.approximateLineWidth > 0 && output.currentLineWidth + cssText.length + 10 > opts.approximateLineWidth) {
          output.text.push(`\nstyle="${cssText}">`);
          output.currentLineWidth = 0;
        }
        else {
          output.text.push(` style="${cssText}">`);
          output.currentLineWidth += cssText.length + 10;
        }
      }
      else {
        output.text.push('>');
        output.currentLineWidth += 1;
      }
    }
    if (EMPTY_ELEMENTS.has(tagName) === false) {
      if (opts.serializeShadowRoot && node.shadowRoot != null) {
        output.indent = output.indent + opts.indentSpaces;
        serializeToHtml(node.shadowRoot, opts, output, true);
        output.indent = output.indent - opts.indentSpaces;
        if (opts.newLines &&
          (node.childNodes.length === 0 || (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3 /* TEXT_NODE */ && node.childNodes[0].nodeValue.trim() === ''))) {
          output.text.push('\n');
          output.currentLineWidth = 0;
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
      }
      if (opts.excludeTagContent == null || opts.excludeTagContent.includes(tagName) === false) {
        const childNodes = tagName === 'template' ? node.content.childNodes : node.childNodes;
        const childNodeLength = childNodes.length;
        if (childNodeLength > 0) {
          if (childNodeLength === 1 && childNodes[0].nodeType === 3 /* TEXT_NODE */ && (typeof childNodes[0].nodeValue !== 'string' || childNodes[0].nodeValue.trim() === '')) ;
          else {
            if (opts.indentSpaces > 0 && ignoreTag === false) {
              output.indent = output.indent + opts.indentSpaces;
            }
            for (let i = 0; i < childNodeLength; i++) {
              serializeToHtml(childNodes[i], opts, output, false);
            }
            if (ignoreTag === false) {
              if (opts.newLines) {
                output.text.push('\n');
                output.currentLineWidth = 0;
              }
              if (opts.indentSpaces > 0) {
                output.indent = output.indent - opts.indentSpaces;
                for (let i = 0; i < output.indent; i++) {
                  output.text.push(' ');
                }
                output.currentLineWidth += output.indent;
              }
            }
          }
        }
        if (ignoreTag === false) {
          output.text.push('</' + tagName + '>');
          output.currentLineWidth += tagName.length + 3;
        }
      }
    }
    if (opts.approximateLineWidth > 0 && STRUCTURE_ELEMENTS.has(tagName)) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (tagName === 'body') {
      output.isWithinBody = false;
    }
  }
  else if (node.nodeType === 3 /* TEXT_NODE */) {
    let textContent = node.nodeValue;
    if (typeof textContent === 'string') {
      const trimmedTextContent = textContent.trim();
      if (trimmedTextContent === '') {
        // this text node is whitespace only
        if (isWithinWhitespaceSensitive(node)) {
          // whitespace matters within this element
          // just add the exact text we were given
          output.text.push(textContent);
          output.currentLineWidth += textContent.length;
        }
        else if (opts.approximateLineWidth > 0 && !output.isWithinBody) ;
        else if (!opts.prettyHtml) {
          // this text node is only whitespace, and it's not
          // within a whitespace sensitive element like <pre> or <code>
          // so replace the entire white space with a single new line
          output.currentLineWidth += 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            // good enough for a new line
            // for perf these are all just estimates
            // we don't care to ensure exact line lengths
            output.text.push('\n');
            output.currentLineWidth = 0;
          }
          else {
            // let's keep it all on the same line yet
            output.text.push(' ');
          }
        }
      }
      else {
        // this text node has text content
        if (opts.newLines) {
          output.text.push('\n');
          output.currentLineWidth = 0;
        }
        if (opts.indentSpaces > 0) {
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
        let textContentLength = textContent.length;
        if (textContentLength > 0) {
          // this text node has text content
          const parentTagName = node.parentNode != null && node.parentNode.nodeType === 1 /* ELEMENT_NODE */ ? node.parentNode.nodeName : null;
          if (NON_ESCAPABLE_CONTENT.has(parentTagName)) {
            // this text node cannot have its content escaped since it's going
            // into an element like <style> or <script>
            if (isWithinWhitespaceSensitive(node)) {
              output.text.push(textContent);
            }
            else {
              output.text.push(trimmedTextContent);
              textContentLength = trimmedTextContent.length;
            }
            output.currentLineWidth += textContentLength;
          }
          else {
            // this text node is going into a normal element and html can be escaped
            if (opts.prettyHtml) {
              // pretty print the text node
              output.text.push(escapeString(textContent.replace(/\s\s+/g, ' ').trim(), false));
              output.currentLineWidth += textContentLength;
            }
            else {
              // not pretty printing the text node
              if (isWithinWhitespaceSensitive(node)) {
                output.currentLineWidth += textContentLength;
              }
              else {
                // this element is not a whitespace sensitive one, like <pre> or <code> so
                // any whitespace at the start and end can be cleaned up to just be one space
                if (/\s/.test(textContent.charAt(0))) {
                  textContent = ' ' + textContent.trimLeft();
                }
                textContentLength = textContent.length;
                if (textContentLength > 1) {
                  if (/\s/.test(textContent.charAt(textContentLength - 1))) {
                    if (opts.approximateLineWidth > 0 && output.currentLineWidth + textContentLength > opts.approximateLineWidth) {
                      textContent = textContent.trimRight() + '\n';
                      output.currentLineWidth = 0;
                    }
                    else {
                      textContent = textContent.trimRight() + ' ';
                    }
                  }
                }
                output.currentLineWidth += textContentLength;
              }
              output.text.push(escapeString(textContent, false));
            }
          }
        }
      }
    }
  }
  else if (node.nodeType === 8 /* COMMENT_NODE */) {
    const nodeValue = node.nodeValue;
    if (opts.removeHtmlComments) {
      const isHydrateAnnotation = nodeValue.startsWith(CONTENT_REF_ID + '.') ||
        nodeValue.startsWith(ORG_LOCATION_ID + '.') ||
        nodeValue.startsWith(SLOT_NODE_ID + '.') ||
        nodeValue.startsWith(TEXT_NODE_ID + '.');
      if (!isHydrateAnnotation) {
        return;
      }
    }
    if (opts.newLines) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (opts.indentSpaces > 0) {
      for (let i = 0; i < output.indent; i++) {
        output.text.push(' ');
      }
      output.currentLineWidth += output.indent;
    }
    output.text.push('<!--' + nodeValue + '-->');
    output.currentLineWidth += nodeValue.length + 7;
  }
  else if (node.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
    output.text.push('<!doctype html>');
  }
}
const AMP_REGEX = /&/g;
const NBSP_REGEX = /\u00a0/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const CAN_REMOVE_ATTR_QUOTES = /^[^ \t\n\f\r"'`=<>\/\\-]+$/;
function getTagName(element) {
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return element.nodeName.toLowerCase();
  }
  else {
    return element.nodeName;
  }
}
function escapeString(str, attrMode) {
  str = str.replace(AMP_REGEX, '&amp;').replace(NBSP_REGEX, '&nbsp;');
  if (attrMode) {
    return str.replace(DOUBLE_QUOTE_REGEX, '&quot;');
  }
  return str.replace(LT_REGEX, '&lt;').replace(GT_REGEX, '&gt;');
}
function isWithinWhitespaceSensitive(node) {
  while (node != null) {
    if (WHITESPACE_SENSITIVE.has(node.nodeName)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
/*@__PURE__*/ const NON_ESCAPABLE_CONTENT = new Set(['STYLE', 'SCRIPT', 'IFRAME', 'NOSCRIPT', 'XMP', 'NOEMBED', 'NOFRAMES', 'PLAINTEXT']);
/*@__PURE__*/ const WHITESPACE_SENSITIVE = new Set(['CODE', 'OUTPUT', 'PLAINTEXT', 'PRE', 'TEMPLATE', 'TEXTAREA']);
/*@__PURE__*/ const EMPTY_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'trace',
  'wbr',
]);
/*@__PURE__*/ const REMOVE_EMPTY_ATTR = new Set(['class', 'dir', 'id', 'lang', 'name', 'title']);
/*@__PURE__*/ const BOOLEAN_ATTR = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch',
  'visible',
]);
/*@__PURE__*/ const STRUCTURE_ELEMENTS = new Set(['html', 'body', 'head', 'iframe', 'meta', 'link', 'base', 'title', 'script', 'style']);

// Parse5 6.0.1
const e=function(e){const t=[65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];var n="�",s={EOF:-1,NULL:0,TABULATION:9,CARRIAGE_RETURN:13,LINE_FEED:10,FORM_FEED:12,SPACE:32,EXCLAMATION_MARK:33,QUOTATION_MARK:34,NUMBER_SIGN:35,AMPERSAND:38,APOSTROPHE:39,HYPHEN_MINUS:45,SOLIDUS:47,DIGIT_0:48,DIGIT_9:57,SEMICOLON:59,LESS_THAN_SIGN:60,EQUALS_SIGN:61,GREATER_THAN_SIGN:62,QUESTION_MARK:63,LATIN_CAPITAL_A:65,LATIN_CAPITAL_F:70,LATIN_CAPITAL_X:88,LATIN_CAPITAL_Z:90,RIGHT_SQUARE_BRACKET:93,GRAVE_ACCENT:96,LATIN_SMALL_A:97,LATIN_SMALL_F:102,LATIN_SMALL_X:120,LATIN_SMALL_Z:122,REPLACEMENT_CHARACTER:65533},r=function(e){return e>=55296&&e<=57343},i=function(e){return 32!==e&&10!==e&&13!==e&&9!==e&&12!==e&&e>=1&&e<=31||e>=127&&e<=159},o=function(e){return e>=64976&&e<=65007||t.indexOf(e)>-1},a="unexpected-null-character",T="invalid-first-character-of-tag-name",E="missing-semicolon-after-character-reference",h="eof-before-tag-name",c="eof-in-tag",_="missing-whitespace-after-doctype-public-keyword",l="missing-whitespace-between-doctype-public-and-system-identifiers",m="missing-whitespace-after-doctype-system-keyword",p="missing-quote-before-doctype-public-identifier",A="missing-quote-before-doctype-system-identifier",u="missing-doctype-public-identifier",N="missing-doctype-system-identifier",d="abrupt-doctype-public-identifier",C="abrupt-doctype-system-identifier",O="eof-in-script-html-comment-like-text",f="eof-in-doctype",S="abrupt-closing-of-empty-comment",R="eof-in-comment",I="absence-of-digits-in-numeric-character-reference",L="end-tag-without-matching-open-element",k="misplaced-start-tag-for-head-element";const M=s;var g=new Uint16Array([4,52,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,106,303,412,810,1432,1701,1796,1987,2114,2360,2420,2484,3170,3251,4140,4393,4575,4610,5106,5512,5728,6117,6274,6315,6345,6427,6516,7002,7910,8733,9323,9870,10170,10631,10893,11318,11386,11467,12773,13092,14474,14922,15448,15542,16419,17666,18166,18611,19004,19095,19298,19397,4,16,69,77,97,98,99,102,103,108,109,110,111,112,114,115,116,117,140,150,158,169,176,194,199,210,216,222,226,242,256,266,283,294,108,105,103,5,198,1,59,148,1,198,80,5,38,1,59,156,1,38,99,117,116,101,5,193,1,59,167,1,193,114,101,118,101,59,1,258,4,2,105,121,182,191,114,99,5,194,1,59,189,1,194,59,1,1040,114,59,3,55349,56580,114,97,118,101,5,192,1,59,208,1,192,112,104,97,59,1,913,97,99,114,59,1,256,100,59,1,10835,4,2,103,112,232,237,111,110,59,1,260,102,59,3,55349,56632,112,108,121,70,117,110,99,116,105,111,110,59,1,8289,105,110,103,5,197,1,59,264,1,197,4,2,99,115,272,277,114,59,3,55349,56476,105,103,110,59,1,8788,105,108,100,101,5,195,1,59,292,1,195,109,108,5,196,1,59,301,1,196,4,8,97,99,101,102,111,114,115,117,321,350,354,383,388,394,400,405,4,2,99,114,327,336,107,115,108,97,115,104,59,1,8726,4,2,118,119,342,345,59,1,10983,101,100,59,1,8966,121,59,1,1041,4,3,99,114,116,362,369,379,97,117,115,101,59,1,8757,110,111,117,108,108,105,115,59,1,8492,97,59,1,914,114,59,3,55349,56581,112,102,59,3,55349,56633,101,118,101,59,1,728,99,114,59,1,8492,109,112,101,113,59,1,8782,4,14,72,79,97,99,100,101,102,104,105,108,111,114,115,117,442,447,456,504,542,547,569,573,577,616,678,784,790,796,99,121,59,1,1063,80,89,5,169,1,59,454,1,169,4,3,99,112,121,464,470,497,117,116,101,59,1,262,4,2,59,105,476,478,1,8914,116,97,108,68,105,102,102,101,114,101,110,116,105,97,108,68,59,1,8517,108,101,121,115,59,1,8493,4,4,97,101,105,111,514,520,530,535,114,111,110,59,1,268,100,105,108,5,199,1,59,528,1,199,114,99,59,1,264,110,105,110,116,59,1,8752,111,116,59,1,266,4,2,100,110,553,560,105,108,108,97,59,1,184,116,101,114,68,111,116,59,1,183,114,59,1,8493,105,59,1,935,114,99,108,101,4,4,68,77,80,84,591,596,603,609,111,116,59,1,8857,105,110,117,115,59,1,8854,108,117,115,59,1,8853,105,109,101,115,59,1,8855,111,4,2,99,115,623,646,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8754,101,67,117,114,108,121,4,2,68,81,658,671,111,117,98,108,101,81,117,111,116,101,59,1,8221,117,111,116,101,59,1,8217,4,4,108,110,112,117,688,701,736,753,111,110,4,2,59,101,696,698,1,8759,59,1,10868,4,3,103,105,116,709,717,722,114,117,101,110,116,59,1,8801,110,116,59,1,8751,111,117,114,73,110,116,101,103,114,97,108,59,1,8750,4,2,102,114,742,745,59,1,8450,111,100,117,99,116,59,1,8720,110,116,101,114,67,108,111,99,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8755,111,115,115,59,1,10799,99,114,59,3,55349,56478,112,4,2,59,67,803,805,1,8915,97,112,59,1,8781,4,11,68,74,83,90,97,99,101,102,105,111,115,834,850,855,860,865,888,903,916,921,1011,1415,4,2,59,111,840,842,1,8517,116,114,97,104,100,59,1,10513,99,121,59,1,1026,99,121,59,1,1029,99,121,59,1,1039,4,3,103,114,115,873,879,883,103,101,114,59,1,8225,114,59,1,8609,104,118,59,1,10980,4,2,97,121,894,900,114,111,110,59,1,270,59,1,1044,108,4,2,59,116,910,912,1,8711,97,59,1,916,114,59,3,55349,56583,4,2,97,102,927,998,4,2,99,109,933,992,114,105,116,105,99,97,108,4,4,65,68,71,84,950,957,978,985,99,117,116,101,59,1,180,111,4,2,116,117,964,967,59,1,729,98,108,101,65,99,117,116,101,59,1,733,114,97,118,101,59,1,96,105,108,100,101,59,1,732,111,110,100,59,1,8900,102,101,114,101,110,116,105,97,108,68,59,1,8518,4,4,112,116,117,119,1021,1026,1048,1249,102,59,3,55349,56635,4,3,59,68,69,1034,1036,1041,1,168,111,116,59,1,8412,113,117,97,108,59,1,8784,98,108,101,4,6,67,68,76,82,85,86,1065,1082,1101,1189,1211,1236,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8751,111,4,2,116,119,1089,1092,59,1,168,110,65,114,114,111,119,59,1,8659,4,2,101,111,1107,1141,102,116,4,3,65,82,84,1117,1124,1136,114,114,111,119,59,1,8656,105,103,104,116,65,114,114,111,119,59,1,8660,101,101,59,1,10980,110,103,4,2,76,82,1149,1177,101,102,116,4,2,65,82,1158,1165,114,114,111,119,59,1,10232,105,103,104,116,65,114,114,111,119,59,1,10234,105,103,104,116,65,114,114,111,119,59,1,10233,105,103,104,116,4,2,65,84,1199,1206,114,114,111,119,59,1,8658,101,101,59,1,8872,112,4,2,65,68,1218,1225,114,114,111,119,59,1,8657,111,119,110,65,114,114,111,119,59,1,8661,101,114,116,105,99,97,108,66,97,114,59,1,8741,110,4,6,65,66,76,82,84,97,1264,1292,1299,1352,1391,1408,114,114,111,119,4,3,59,66,85,1276,1278,1283,1,8595,97,114,59,1,10515,112,65,114,114,111,119,59,1,8693,114,101,118,101,59,1,785,101,102,116,4,3,82,84,86,1310,1323,1334,105,103,104,116,86,101,99,116,111,114,59,1,10576,101,101,86,101,99,116,111,114,59,1,10590,101,99,116,111,114,4,2,59,66,1345,1347,1,8637,97,114,59,1,10582,105,103,104,116,4,2,84,86,1362,1373,101,101,86,101,99,116,111,114,59,1,10591,101,99,116,111,114,4,2,59,66,1384,1386,1,8641,97,114,59,1,10583,101,101,4,2,59,65,1399,1401,1,8868,114,114,111,119,59,1,8615,114,114,111,119,59,1,8659,4,2,99,116,1421,1426,114,59,3,55349,56479,114,111,107,59,1,272,4,16,78,84,97,99,100,102,103,108,109,111,112,113,115,116,117,120,1466,1470,1478,1489,1515,1520,1525,1536,1544,1593,1609,1617,1650,1664,1668,1677,71,59,1,330,72,5,208,1,59,1476,1,208,99,117,116,101,5,201,1,59,1487,1,201,4,3,97,105,121,1497,1503,1512,114,111,110,59,1,282,114,99,5,202,1,59,1510,1,202,59,1,1069,111,116,59,1,278,114,59,3,55349,56584,114,97,118,101,5,200,1,59,1534,1,200,101,109,101,110,116,59,1,8712,4,2,97,112,1550,1555,99,114,59,1,274,116,121,4,2,83,86,1563,1576,109,97,108,108,83,113,117,97,114,101,59,1,9723,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9643,4,2,103,112,1599,1604,111,110,59,1,280,102,59,3,55349,56636,115,105,108,111,110,59,1,917,117,4,2,97,105,1624,1640,108,4,2,59,84,1631,1633,1,10869,105,108,100,101,59,1,8770,108,105,98,114,105,117,109,59,1,8652,4,2,99,105,1656,1660,114,59,1,8496,109,59,1,10867,97,59,1,919,109,108,5,203,1,59,1675,1,203,4,2,105,112,1683,1689,115,116,115,59,1,8707,111,110,101,110,116,105,97,108,69,59,1,8519,4,5,99,102,105,111,115,1713,1717,1722,1762,1791,121,59,1,1060,114,59,3,55349,56585,108,108,101,100,4,2,83,86,1732,1745,109,97,108,108,83,113,117,97,114,101,59,1,9724,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9642,4,3,112,114,117,1770,1775,1781,102,59,3,55349,56637,65,108,108,59,1,8704,114,105,101,114,116,114,102,59,1,8497,99,114,59,1,8497,4,12,74,84,97,98,99,100,102,103,111,114,115,116,1822,1827,1834,1848,1855,1877,1882,1887,1890,1896,1978,1984,99,121,59,1,1027,5,62,1,59,1832,1,62,109,109,97,4,2,59,100,1843,1845,1,915,59,1,988,114,101,118,101,59,1,286,4,3,101,105,121,1863,1869,1874,100,105,108,59,1,290,114,99,59,1,284,59,1,1043,111,116,59,1,288,114,59,3,55349,56586,59,1,8921,112,102,59,3,55349,56638,101,97,116,101,114,4,6,69,70,71,76,83,84,1915,1933,1944,1953,1959,1971,113,117,97,108,4,2,59,76,1925,1927,1,8805,101,115,115,59,1,8923,117,108,108,69,113,117,97,108,59,1,8807,114,101,97,116,101,114,59,1,10914,101,115,115,59,1,8823,108,97,110,116,69,113,117,97,108,59,1,10878,105,108,100,101,59,1,8819,99,114,59,3,55349,56482,59,1,8811,4,8,65,97,99,102,105,111,115,117,2005,2012,2026,2032,2036,2049,2073,2089,82,68,99,121,59,1,1066,4,2,99,116,2018,2023,101,107,59,1,711,59,1,94,105,114,99,59,1,292,114,59,1,8460,108,98,101,114,116,83,112,97,99,101,59,1,8459,4,2,112,114,2055,2059,102,59,1,8461,105,122,111,110,116,97,108,76,105,110,101,59,1,9472,4,2,99,116,2079,2083,114,59,1,8459,114,111,107,59,1,294,109,112,4,2,68,69,2097,2107,111,119,110,72,117,109,112,59,1,8782,113,117,97,108,59,1,8783,4,14,69,74,79,97,99,100,102,103,109,110,111,115,116,117,2144,2149,2155,2160,2171,2189,2194,2198,2209,2245,2307,2329,2334,2341,99,121,59,1,1045,108,105,103,59,1,306,99,121,59,1,1025,99,117,116,101,5,205,1,59,2169,1,205,4,2,105,121,2177,2186,114,99,5,206,1,59,2184,1,206,59,1,1048,111,116,59,1,304,114,59,1,8465,114,97,118,101,5,204,1,59,2207,1,204,4,3,59,97,112,2217,2219,2238,1,8465,4,2,99,103,2225,2229,114,59,1,298,105,110,97,114,121,73,59,1,8520,108,105,101,115,59,1,8658,4,2,116,118,2251,2281,4,2,59,101,2257,2259,1,8748,4,2,103,114,2265,2271,114,97,108,59,1,8747,115,101,99,116,105,111,110,59,1,8898,105,115,105,98,108,101,4,2,67,84,2293,2300,111,109,109,97,59,1,8291,105,109,101,115,59,1,8290,4,3,103,112,116,2315,2320,2325,111,110,59,1,302,102,59,3,55349,56640,97,59,1,921,99,114,59,1,8464,105,108,100,101,59,1,296,4,2,107,109,2347,2352,99,121,59,1,1030,108,5,207,1,59,2358,1,207,4,5,99,102,111,115,117,2372,2386,2391,2397,2414,4,2,105,121,2378,2383,114,99,59,1,308,59,1,1049,114,59,3,55349,56589,112,102,59,3,55349,56641,4,2,99,101,2403,2408,114,59,3,55349,56485,114,99,121,59,1,1032,107,99,121,59,1,1028,4,7,72,74,97,99,102,111,115,2436,2441,2446,2452,2467,2472,2478,99,121,59,1,1061,99,121,59,1,1036,112,112,97,59,1,922,4,2,101,121,2458,2464,100,105,108,59,1,310,59,1,1050,114,59,3,55349,56590,112,102,59,3,55349,56642,99,114,59,3,55349,56486,4,11,74,84,97,99,101,102,108,109,111,115,116,2508,2513,2520,2562,2585,2981,2986,3004,3011,3146,3167,99,121,59,1,1033,5,60,1,59,2518,1,60,4,5,99,109,110,112,114,2532,2538,2544,2548,2558,117,116,101,59,1,313,98,100,97,59,1,923,103,59,1,10218,108,97,99,101,116,114,102,59,1,8466,114,59,1,8606,4,3,97,101,121,2570,2576,2582,114,111,110,59,1,317,100,105,108,59,1,315,59,1,1051,4,2,102,115,2591,2907,116,4,10,65,67,68,70,82,84,85,86,97,114,2614,2663,2672,2728,2735,2760,2820,2870,2888,2895,4,2,110,114,2620,2633,103,108,101,66,114,97,99,107,101,116,59,1,10216,114,111,119,4,3,59,66,82,2644,2646,2651,1,8592,97,114,59,1,8676,105,103,104,116,65,114,114,111,119,59,1,8646,101,105,108,105,110,103,59,1,8968,111,4,2,117,119,2679,2692,98,108,101,66,114,97,99,107,101,116,59,1,10214,110,4,2,84,86,2699,2710,101,101,86,101,99,116,111,114,59,1,10593,101,99,116,111,114,4,2,59,66,2721,2723,1,8643,97,114,59,1,10585,108,111,111,114,59,1,8970,105,103,104,116,4,2,65,86,2745,2752,114,114,111,119,59,1,8596,101,99,116,111,114,59,1,10574,4,2,101,114,2766,2792,101,4,3,59,65,86,2775,2777,2784,1,8867,114,114,111,119,59,1,8612,101,99,116,111,114,59,1,10586,105,97,110,103,108,101,4,3,59,66,69,2806,2808,2813,1,8882,97,114,59,1,10703,113,117,97,108,59,1,8884,112,4,3,68,84,86,2829,2841,2852,111,119,110,86,101,99,116,111,114,59,1,10577,101,101,86,101,99,116,111,114,59,1,10592,101,99,116,111,114,4,2,59,66,2863,2865,1,8639,97,114,59,1,10584,101,99,116,111,114,4,2,59,66,2881,2883,1,8636,97,114,59,1,10578,114,114,111,119,59,1,8656,105,103,104,116,97,114,114,111,119,59,1,8660,115,4,6,69,70,71,76,83,84,2922,2936,2947,2956,2962,2974,113,117,97,108,71,114,101,97,116,101,114,59,1,8922,117,108,108,69,113,117,97,108,59,1,8806,114,101,97,116,101,114,59,1,8822,101,115,115,59,1,10913,108,97,110,116,69,113,117,97,108,59,1,10877,105,108,100,101,59,1,8818,114,59,3,55349,56591,4,2,59,101,2992,2994,1,8920,102,116,97,114,114,111,119,59,1,8666,105,100,111,116,59,1,319,4,3,110,112,119,3019,3110,3115,103,4,4,76,82,108,114,3030,3058,3070,3098,101,102,116,4,2,65,82,3039,3046,114,114,111,119,59,1,10229,105,103,104,116,65,114,114,111,119,59,1,10231,105,103,104,116,65,114,114,111,119,59,1,10230,101,102,116,4,2,97,114,3079,3086,114,114,111,119,59,1,10232,105,103,104,116,97,114,114,111,119,59,1,10234,105,103,104,116,97,114,114,111,119,59,1,10233,102,59,3,55349,56643,101,114,4,2,76,82,3123,3134,101,102,116,65,114,114,111,119,59,1,8601,105,103,104,116,65,114,114,111,119,59,1,8600,4,3,99,104,116,3154,3158,3161,114,59,1,8466,59,1,8624,114,111,107,59,1,321,59,1,8810,4,8,97,99,101,102,105,111,115,117,3188,3192,3196,3222,3227,3237,3243,3248,112,59,1,10501,121,59,1,1052,4,2,100,108,3202,3213,105,117,109,83,112,97,99,101,59,1,8287,108,105,110,116,114,102,59,1,8499,114,59,3,55349,56592,110,117,115,80,108,117,115,59,1,8723,112,102,59,3,55349,56644,99,114,59,1,8499,59,1,924,4,9,74,97,99,101,102,111,115,116,117,3271,3276,3283,3306,3422,3427,4120,4126,4137,99,121,59,1,1034,99,117,116,101,59,1,323,4,3,97,101,121,3291,3297,3303,114,111,110,59,1,327,100,105,108,59,1,325,59,1,1053,4,3,103,115,119,3314,3380,3415,97,116,105,118,101,4,3,77,84,86,3327,3340,3365,101,100,105,117,109,83,112,97,99,101,59,1,8203,104,105,4,2,99,110,3348,3357,107,83,112,97,99,101,59,1,8203,83,112,97,99,101,59,1,8203,101,114,121,84,104,105,110,83,112,97,99,101,59,1,8203,116,101,100,4,2,71,76,3389,3405,114,101,97,116,101,114,71,114,101,97,116,101,114,59,1,8811,101,115,115,76,101,115,115,59,1,8810,76,105,110,101,59,1,10,114,59,3,55349,56593,4,4,66,110,112,116,3437,3444,3460,3464,114,101,97,107,59,1,8288,66,114,101,97,107,105,110,103,83,112,97,99,101,59,1,160,102,59,1,8469,4,13,59,67,68,69,71,72,76,78,80,82,83,84,86,3492,3494,3517,3536,3578,3657,3685,3784,3823,3860,3915,4066,4107,1,10988,4,2,111,117,3500,3510,110,103,114,117,101,110,116,59,1,8802,112,67,97,112,59,1,8813,111,117,98,108,101,86,101,114,116,105,99,97,108,66,97,114,59,1,8742,4,3,108,113,120,3544,3552,3571,101,109,101,110,116,59,1,8713,117,97,108,4,2,59,84,3561,3563,1,8800,105,108,100,101,59,3,8770,824,105,115,116,115,59,1,8708,114,101,97,116,101,114,4,7,59,69,70,71,76,83,84,3600,3602,3609,3621,3631,3637,3650,1,8815,113,117,97,108,59,1,8817,117,108,108,69,113,117,97,108,59,3,8807,824,114,101,97,116,101,114,59,3,8811,824,101,115,115,59,1,8825,108,97,110,116,69,113,117,97,108,59,3,10878,824,105,108,100,101,59,1,8821,117,109,112,4,2,68,69,3666,3677,111,119,110,72,117,109,112,59,3,8782,824,113,117,97,108,59,3,8783,824,101,4,2,102,115,3692,3724,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3709,3711,3717,1,8938,97,114,59,3,10703,824,113,117,97,108,59,1,8940,115,4,6,59,69,71,76,83,84,3739,3741,3748,3757,3764,3777,1,8814,113,117,97,108,59,1,8816,114,101,97,116,101,114,59,1,8824,101,115,115,59,3,8810,824,108,97,110,116,69,113,117,97,108,59,3,10877,824,105,108,100,101,59,1,8820,101,115,116,101,100,4,2,71,76,3795,3812,114,101,97,116,101,114,71,114,101,97,116,101,114,59,3,10914,824,101,115,115,76,101,115,115,59,3,10913,824,114,101,99,101,100,101,115,4,3,59,69,83,3838,3840,3848,1,8832,113,117,97,108,59,3,10927,824,108,97,110,116,69,113,117,97,108,59,1,8928,4,2,101,105,3866,3881,118,101,114,115,101,69,108,101,109,101,110,116,59,1,8716,103,104,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3900,3902,3908,1,8939,97,114,59,3,10704,824,113,117,97,108,59,1,8941,4,2,113,117,3921,3973,117,97,114,101,83,117,4,2,98,112,3933,3952,115,101,116,4,2,59,69,3942,3945,3,8847,824,113,117,97,108,59,1,8930,101,114,115,101,116,4,2,59,69,3963,3966,3,8848,824,113,117,97,108,59,1,8931,4,3,98,99,112,3981,4e3,4045,115,101,116,4,2,59,69,3990,3993,3,8834,8402,113,117,97,108,59,1,8840,99,101,101,100,115,4,4,59,69,83,84,4015,4017,4025,4037,1,8833,113,117,97,108,59,3,10928,824,108,97,110,116,69,113,117,97,108,59,1,8929,105,108,100,101,59,3,8831,824,101,114,115,101,116,4,2,59,69,4056,4059,3,8835,8402,113,117,97,108,59,1,8841,105,108,100,101,4,4,59,69,70,84,4080,4082,4089,4100,1,8769,113,117,97,108,59,1,8772,117,108,108,69,113,117,97,108,59,1,8775,105,108,100,101,59,1,8777,101,114,116,105,99,97,108,66,97,114,59,1,8740,99,114,59,3,55349,56489,105,108,100,101,5,209,1,59,4135,1,209,59,1,925,4,14,69,97,99,100,102,103,109,111,112,114,115,116,117,118,4170,4176,4187,4205,4212,4217,4228,4253,4259,4292,4295,4316,4337,4346,108,105,103,59,1,338,99,117,116,101,5,211,1,59,4185,1,211,4,2,105,121,4193,4202,114,99,5,212,1,59,4200,1,212,59,1,1054,98,108,97,99,59,1,336,114,59,3,55349,56594,114,97,118,101,5,210,1,59,4226,1,210,4,3,97,101,105,4236,4241,4246,99,114,59,1,332,103,97,59,1,937,99,114,111,110,59,1,927,112,102,59,3,55349,56646,101,110,67,117,114,108,121,4,2,68,81,4272,4285,111,117,98,108,101,81,117,111,116,101,59,1,8220,117,111,116,101,59,1,8216,59,1,10836,4,2,99,108,4301,4306,114,59,3,55349,56490,97,115,104,5,216,1,59,4314,1,216,105,4,2,108,109,4323,4332,100,101,5,213,1,59,4330,1,213,101,115,59,1,10807,109,108,5,214,1,59,4344,1,214,101,114,4,2,66,80,4354,4380,4,2,97,114,4360,4364,114,59,1,8254,97,99,4,2,101,107,4372,4375,59,1,9182,101,116,59,1,9140,97,114,101,110,116,104,101,115,105,115,59,1,9180,4,9,97,99,102,104,105,108,111,114,115,4413,4422,4426,4431,4435,4438,4448,4471,4561,114,116,105,97,108,68,59,1,8706,121,59,1,1055,114,59,3,55349,56595,105,59,1,934,59,1,928,117,115,77,105,110,117,115,59,1,177,4,2,105,112,4454,4467,110,99,97,114,101,112,108,97,110,101,59,1,8460,102,59,1,8473,4,4,59,101,105,111,4481,4483,4526,4531,1,10939,99,101,100,101,115,4,4,59,69,83,84,4498,4500,4507,4519,1,8826,113,117,97,108,59,1,10927,108,97,110,116,69,113,117,97,108,59,1,8828,105,108,100,101,59,1,8830,109,101,59,1,8243,4,2,100,112,4537,4543,117,99,116,59,1,8719,111,114,116,105,111,110,4,2,59,97,4555,4557,1,8759,108,59,1,8733,4,2,99,105,4567,4572,114,59,3,55349,56491,59,1,936,4,4,85,102,111,115,4585,4594,4599,4604,79,84,5,34,1,59,4592,1,34,114,59,3,55349,56596,112,102,59,1,8474,99,114,59,3,55349,56492,4,12,66,69,97,99,101,102,104,105,111,114,115,117,4636,4642,4650,4681,4704,4763,4767,4771,5047,5069,5081,5094,97,114,114,59,1,10512,71,5,174,1,59,4648,1,174,4,3,99,110,114,4658,4664,4668,117,116,101,59,1,340,103,59,1,10219,114,4,2,59,116,4675,4677,1,8608,108,59,1,10518,4,3,97,101,121,4689,4695,4701,114,111,110,59,1,344,100,105,108,59,1,342,59,1,1056,4,2,59,118,4710,4712,1,8476,101,114,115,101,4,2,69,85,4722,4748,4,2,108,113,4728,4736,101,109,101,110,116,59,1,8715,117,105,108,105,98,114,105,117,109,59,1,8651,112,69,113,117,105,108,105,98,114,105,117,109,59,1,10607,114,59,1,8476,111,59,1,929,103,104,116,4,8,65,67,68,70,84,85,86,97,4792,4840,4849,4905,4912,4972,5022,5040,4,2,110,114,4798,4811,103,108,101,66,114,97,99,107,101,116,59,1,10217,114,111,119,4,3,59,66,76,4822,4824,4829,1,8594,97,114,59,1,8677,101,102,116,65,114,114,111,119,59,1,8644,101,105,108,105,110,103,59,1,8969,111,4,2,117,119,4856,4869,98,108,101,66,114,97,99,107,101,116,59,1,10215,110,4,2,84,86,4876,4887,101,101,86,101,99,116,111,114,59,1,10589,101,99,116,111,114,4,2,59,66,4898,4900,1,8642,97,114,59,1,10581,108,111,111,114,59,1,8971,4,2,101,114,4918,4944,101,4,3,59,65,86,4927,4929,4936,1,8866,114,114,111,119,59,1,8614,101,99,116,111,114,59,1,10587,105,97,110,103,108,101,4,3,59,66,69,4958,4960,4965,1,8883,97,114,59,1,10704,113,117,97,108,59,1,8885,112,4,3,68,84,86,4981,4993,5004,111,119,110,86,101,99,116,111,114,59,1,10575,101,101,86,101,99,116,111,114,59,1,10588,101,99,116,111,114,4,2,59,66,5015,5017,1,8638,97,114,59,1,10580,101,99,116,111,114,4,2,59,66,5033,5035,1,8640,97,114,59,1,10579,114,114,111,119,59,1,8658,4,2,112,117,5053,5057,102,59,1,8477,110,100,73,109,112,108,105,101,115,59,1,10608,105,103,104,116,97,114,114,111,119,59,1,8667,4,2,99,104,5087,5091,114,59,1,8475,59,1,8625,108,101,68,101,108,97,121,101,100,59,1,10740,4,13,72,79,97,99,102,104,105,109,111,113,115,116,117,5134,5150,5157,5164,5198,5203,5259,5265,5277,5283,5374,5380,5385,4,2,67,99,5140,5146,72,99,121,59,1,1065,121,59,1,1064,70,84,99,121,59,1,1068,99,117,116,101,59,1,346,4,5,59,97,101,105,121,5176,5178,5184,5190,5195,1,10940,114,111,110,59,1,352,100,105,108,59,1,350,114,99,59,1,348,59,1,1057,114,59,3,55349,56598,111,114,116,4,4,68,76,82,85,5216,5227,5238,5250,111,119,110,65,114,114,111,119,59,1,8595,101,102,116,65,114,114,111,119,59,1,8592,105,103,104,116,65,114,114,111,119,59,1,8594,112,65,114,114,111,119,59,1,8593,103,109,97,59,1,931,97,108,108,67,105,114,99,108,101,59,1,8728,112,102,59,3,55349,56650,4,2,114,117,5289,5293,116,59,1,8730,97,114,101,4,4,59,73,83,85,5306,5308,5322,5367,1,9633,110,116,101,114,115,101,99,116,105,111,110,59,1,8851,117,4,2,98,112,5329,5347,115,101,116,4,2,59,69,5338,5340,1,8847,113,117,97,108,59,1,8849,101,114,115,101,116,4,2,59,69,5358,5360,1,8848,113,117,97,108,59,1,8850,110,105,111,110,59,1,8852,99,114,59,3,55349,56494,97,114,59,1,8902,4,4,98,99,109,112,5395,5420,5475,5478,4,2,59,115,5401,5403,1,8912,101,116,4,2,59,69,5411,5413,1,8912,113,117,97,108,59,1,8838,4,2,99,104,5426,5468,101,101,100,115,4,4,59,69,83,84,5440,5442,5449,5461,1,8827,113,117,97,108,59,1,10928,108,97,110,116,69,113,117,97,108,59,1,8829,105,108,100,101,59,1,8831,84,104,97,116,59,1,8715,59,1,8721,4,3,59,101,115,5486,5488,5507,1,8913,114,115,101,116,4,2,59,69,5498,5500,1,8835,113,117,97,108,59,1,8839,101,116,59,1,8913,4,11,72,82,83,97,99,102,104,105,111,114,115,5536,5546,5552,5567,5579,5602,5607,5655,5695,5701,5711,79,82,78,5,222,1,59,5544,1,222,65,68,69,59,1,8482,4,2,72,99,5558,5563,99,121,59,1,1035,121,59,1,1062,4,2,98,117,5573,5576,59,1,9,59,1,932,4,3,97,101,121,5587,5593,5599,114,111,110,59,1,356,100,105,108,59,1,354,59,1,1058,114,59,3,55349,56599,4,2,101,105,5613,5631,4,2,114,116,5619,5627,101,102,111,114,101,59,1,8756,97,59,1,920,4,2,99,110,5637,5647,107,83,112,97,99,101,59,3,8287,8202,83,112,97,99,101,59,1,8201,108,100,101,4,4,59,69,70,84,5668,5670,5677,5688,1,8764,113,117,97,108,59,1,8771,117,108,108,69,113,117,97,108,59,1,8773,105,108,100,101,59,1,8776,112,102,59,3,55349,56651,105,112,108,101,68,111,116,59,1,8411,4,2,99,116,5717,5722,114,59,3,55349,56495,114,111,107,59,1,358,4,14,97,98,99,100,102,103,109,110,111,112,114,115,116,117,5758,5789,5805,5823,5830,5835,5846,5852,5921,5937,6089,6095,6101,6108,4,2,99,114,5764,5774,117,116,101,5,218,1,59,5772,1,218,114,4,2,59,111,5781,5783,1,8607,99,105,114,59,1,10569,114,4,2,99,101,5796,5800,121,59,1,1038,118,101,59,1,364,4,2,105,121,5811,5820,114,99,5,219,1,59,5818,1,219,59,1,1059,98,108,97,99,59,1,368,114,59,3,55349,56600,114,97,118,101,5,217,1,59,5844,1,217,97,99,114,59,1,362,4,2,100,105,5858,5905,101,114,4,2,66,80,5866,5892,4,2,97,114,5872,5876,114,59,1,95,97,99,4,2,101,107,5884,5887,59,1,9183,101,116,59,1,9141,97,114,101,110,116,104,101,115,105,115,59,1,9181,111,110,4,2,59,80,5913,5915,1,8899,108,117,115,59,1,8846,4,2,103,112,5927,5932,111,110,59,1,370,102,59,3,55349,56652,4,8,65,68,69,84,97,100,112,115,5955,5985,5996,6009,6026,6033,6044,6075,114,114,111,119,4,3,59,66,68,5967,5969,5974,1,8593,97,114,59,1,10514,111,119,110,65,114,114,111,119,59,1,8645,111,119,110,65,114,114,111,119,59,1,8597,113,117,105,108,105,98,114,105,117,109,59,1,10606,101,101,4,2,59,65,6017,6019,1,8869,114,114,111,119,59,1,8613,114,114,111,119,59,1,8657,111,119,110,97,114,114,111,119,59,1,8661,101,114,4,2,76,82,6052,6063,101,102,116,65,114,114,111,119,59,1,8598,105,103,104,116,65,114,114,111,119,59,1,8599,105,4,2,59,108,6082,6084,1,978,111,110,59,1,933,105,110,103,59,1,366,99,114,59,3,55349,56496,105,108,100,101,59,1,360,109,108,5,220,1,59,6115,1,220,4,9,68,98,99,100,101,102,111,115,118,6137,6143,6148,6152,6166,6250,6255,6261,6267,97,115,104,59,1,8875,97,114,59,1,10987,121,59,1,1042,97,115,104,4,2,59,108,6161,6163,1,8873,59,1,10982,4,2,101,114,6172,6175,59,1,8897,4,3,98,116,121,6183,6188,6238,97,114,59,1,8214,4,2,59,105,6194,6196,1,8214,99,97,108,4,4,66,76,83,84,6209,6214,6220,6231,97,114,59,1,8739,105,110,101,59,1,124,101,112,97,114,97,116,111,114,59,1,10072,105,108,100,101,59,1,8768,84,104,105,110,83,112,97,99,101,59,1,8202,114,59,3,55349,56601,112,102,59,3,55349,56653,99,114,59,3,55349,56497,100,97,115,104,59,1,8874,4,5,99,101,102,111,115,6286,6292,6298,6303,6309,105,114,99,59,1,372,100,103,101,59,1,8896,114,59,3,55349,56602,112,102,59,3,55349,56654,99,114,59,3,55349,56498,4,4,102,105,111,115,6325,6330,6333,6339,114,59,3,55349,56603,59,1,926,112,102,59,3,55349,56655,99,114,59,3,55349,56499,4,9,65,73,85,97,99,102,111,115,117,6365,6370,6375,6380,6391,6405,6410,6416,6422,99,121,59,1,1071,99,121,59,1,1031,99,121,59,1,1070,99,117,116,101,5,221,1,59,6389,1,221,4,2,105,121,6397,6402,114,99,59,1,374,59,1,1067,114,59,3,55349,56604,112,102,59,3,55349,56656,99,114,59,3,55349,56500,109,108,59,1,376,4,8,72,97,99,100,101,102,111,115,6445,6450,6457,6472,6477,6501,6505,6510,99,121,59,1,1046,99,117,116,101,59,1,377,4,2,97,121,6463,6469,114,111,110,59,1,381,59,1,1047,111,116,59,1,379,4,2,114,116,6483,6497,111,87,105,100,116,104,83,112,97,99,101,59,1,8203,97,59,1,918,114,59,1,8488,112,102,59,1,8484,99,114,59,3,55349,56501,4,16,97,98,99,101,102,103,108,109,110,111,112,114,115,116,117,119,6550,6561,6568,6612,6622,6634,6645,6672,6699,6854,6870,6923,6933,6963,6974,6983,99,117,116,101,5,225,1,59,6559,1,225,114,101,118,101,59,1,259,4,6,59,69,100,105,117,121,6582,6584,6588,6591,6600,6609,1,8766,59,3,8766,819,59,1,8767,114,99,5,226,1,59,6598,1,226,116,101,5,180,1,59,6607,1,180,59,1,1072,108,105,103,5,230,1,59,6620,1,230,4,2,59,114,6628,6630,1,8289,59,3,55349,56606,114,97,118,101,5,224,1,59,6643,1,224,4,2,101,112,6651,6667,4,2,102,112,6657,6663,115,121,109,59,1,8501,104,59,1,8501,104,97,59,1,945,4,2,97,112,6678,6692,4,2,99,108,6684,6688,114,59,1,257,103,59,1,10815,5,38,1,59,6697,1,38,4,2,100,103,6705,6737,4,5,59,97,100,115,118,6717,6719,6724,6727,6734,1,8743,110,100,59,1,10837,59,1,10844,108,111,112,101,59,1,10840,59,1,10842,4,7,59,101,108,109,114,115,122,6753,6755,6758,6762,6814,6835,6848,1,8736,59,1,10660,101,59,1,8736,115,100,4,2,59,97,6770,6772,1,8737,4,8,97,98,99,100,101,102,103,104,6790,6793,6796,6799,6802,6805,6808,6811,59,1,10664,59,1,10665,59,1,10666,59,1,10667,59,1,10668,59,1,10669,59,1,10670,59,1,10671,116,4,2,59,118,6821,6823,1,8735,98,4,2,59,100,6830,6832,1,8894,59,1,10653,4,2,112,116,6841,6845,104,59,1,8738,59,1,197,97,114,114,59,1,9084,4,2,103,112,6860,6865,111,110,59,1,261,102,59,3,55349,56658,4,7,59,69,97,101,105,111,112,6886,6888,6891,6897,6900,6904,6908,1,8776,59,1,10864,99,105,114,59,1,10863,59,1,8778,100,59,1,8779,115,59,1,39,114,111,120,4,2,59,101,6917,6919,1,8776,113,59,1,8778,105,110,103,5,229,1,59,6931,1,229,4,3,99,116,121,6941,6946,6949,114,59,3,55349,56502,59,1,42,109,112,4,2,59,101,6957,6959,1,8776,113,59,1,8781,105,108,100,101,5,227,1,59,6972,1,227,109,108,5,228,1,59,6981,1,228,4,2,99,105,6989,6997,111,110,105,110,116,59,1,8755,110,116,59,1,10769,4,16,78,97,98,99,100,101,102,105,107,108,110,111,112,114,115,117,7036,7041,7119,7135,7149,7155,7219,7224,7347,7354,7463,7489,7786,7793,7814,7866,111,116,59,1,10989,4,2,99,114,7047,7094,107,4,4,99,101,112,115,7058,7064,7073,7080,111,110,103,59,1,8780,112,115,105,108,111,110,59,1,1014,114,105,109,101,59,1,8245,105,109,4,2,59,101,7088,7090,1,8765,113,59,1,8909,4,2,118,119,7100,7105,101,101,59,1,8893,101,100,4,2,59,103,7113,7115,1,8965,101,59,1,8965,114,107,4,2,59,116,7127,7129,1,9141,98,114,107,59,1,9142,4,2,111,121,7141,7146,110,103,59,1,8780,59,1,1073,113,117,111,59,1,8222,4,5,99,109,112,114,116,7167,7181,7188,7193,7199,97,117,115,4,2,59,101,7176,7178,1,8757,59,1,8757,112,116,121,118,59,1,10672,115,105,59,1,1014,110,111,117,59,1,8492,4,3,97,104,119,7207,7210,7213,59,1,946,59,1,8502,101,101,110,59,1,8812,114,59,3,55349,56607,103,4,7,99,111,115,116,117,118,119,7241,7262,7288,7305,7328,7335,7340,4,3,97,105,117,7249,7253,7258,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,4,3,100,112,116,7270,7275,7281,111,116,59,1,10752,108,117,115,59,1,10753,105,109,101,115,59,1,10754,4,2,113,116,7294,7300,99,117,112,59,1,10758,97,114,59,1,9733,114,105,97,110,103,108,101,4,2,100,117,7318,7324,111,119,110,59,1,9661,112,59,1,9651,112,108,117,115,59,1,10756,101,101,59,1,8897,101,100,103,101,59,1,8896,97,114,111,119,59,1,10509,4,3,97,107,111,7362,7436,7458,4,2,99,110,7368,7432,107,4,3,108,115,116,7377,7386,7394,111,122,101,110,103,101,59,1,10731,113,117,97,114,101,59,1,9642,114,105,97,110,103,108,101,4,4,59,100,108,114,7411,7413,7419,7425,1,9652,111,119,110,59,1,9662,101,102,116,59,1,9666,105,103,104,116,59,1,9656,107,59,1,9251,4,2,49,51,7442,7454,4,2,50,52,7448,7451,59,1,9618,59,1,9617,52,59,1,9619,99,107,59,1,9608,4,2,101,111,7469,7485,4,2,59,113,7475,7478,3,61,8421,117,105,118,59,3,8801,8421,116,59,1,8976,4,4,112,116,119,120,7499,7504,7517,7523,102,59,3,55349,56659,4,2,59,116,7510,7512,1,8869,111,109,59,1,8869,116,105,101,59,1,8904,4,12,68,72,85,86,98,100,104,109,112,116,117,118,7549,7571,7597,7619,7655,7660,7682,7708,7715,7721,7728,7750,4,4,76,82,108,114,7559,7562,7565,7568,59,1,9559,59,1,9556,59,1,9558,59,1,9555,4,5,59,68,85,100,117,7583,7585,7588,7591,7594,1,9552,59,1,9574,59,1,9577,59,1,9572,59,1,9575,4,4,76,82,108,114,7607,7610,7613,7616,59,1,9565,59,1,9562,59,1,9564,59,1,9561,4,7,59,72,76,82,104,108,114,7635,7637,7640,7643,7646,7649,7652,1,9553,59,1,9580,59,1,9571,59,1,9568,59,1,9579,59,1,9570,59,1,9567,111,120,59,1,10697,4,4,76,82,108,114,7670,7673,7676,7679,59,1,9557,59,1,9554,59,1,9488,59,1,9484,4,5,59,68,85,100,117,7694,7696,7699,7702,7705,1,9472,59,1,9573,59,1,9576,59,1,9516,59,1,9524,105,110,117,115,59,1,8863,108,117,115,59,1,8862,105,109,101,115,59,1,8864,4,4,76,82,108,114,7738,7741,7744,7747,59,1,9563,59,1,9560,59,1,9496,59,1,9492,4,7,59,72,76,82,104,108,114,7766,7768,7771,7774,7777,7780,7783,1,9474,59,1,9578,59,1,9569,59,1,9566,59,1,9532,59,1,9508,59,1,9500,114,105,109,101,59,1,8245,4,2,101,118,7799,7804,118,101,59,1,728,98,97,114,5,166,1,59,7812,1,166,4,4,99,101,105,111,7824,7829,7834,7846,114,59,3,55349,56503,109,105,59,1,8271,109,4,2,59,101,7841,7843,1,8765,59,1,8909,108,4,3,59,98,104,7855,7857,7860,1,92,59,1,10693,115,117,98,59,1,10184,4,2,108,109,7872,7885,108,4,2,59,101,7879,7881,1,8226,116,59,1,8226,112,4,3,59,69,101,7894,7896,7899,1,8782,59,1,10926,4,2,59,113,7905,7907,1,8783,59,1,8783,4,15,97,99,100,101,102,104,105,108,111,114,115,116,117,119,121,7942,8021,8075,8080,8121,8126,8157,8279,8295,8430,8446,8485,8491,8707,8726,4,3,99,112,114,7950,7956,8007,117,116,101,59,1,263,4,6,59,97,98,99,100,115,7970,7972,7977,7984,7998,8003,1,8745,110,100,59,1,10820,114,99,117,112,59,1,10825,4,2,97,117,7990,7994,112,59,1,10827,112,59,1,10823,111,116,59,1,10816,59,3,8745,65024,4,2,101,111,8013,8017,116,59,1,8257,110,59,1,711,4,4,97,101,105,117,8031,8046,8056,8061,4,2,112,114,8037,8041,115,59,1,10829,111,110,59,1,269,100,105,108,5,231,1,59,8054,1,231,114,99,59,1,265,112,115,4,2,59,115,8069,8071,1,10828,109,59,1,10832,111,116,59,1,267,4,3,100,109,110,8088,8097,8104,105,108,5,184,1,59,8095,1,184,112,116,121,118,59,1,10674,116,5,162,2,59,101,8112,8114,1,162,114,100,111,116,59,1,183,114,59,3,55349,56608,4,3,99,101,105,8134,8138,8154,121,59,1,1095,99,107,4,2,59,109,8146,8148,1,10003,97,114,107,59,1,10003,59,1,967,114,4,7,59,69,99,101,102,109,115,8174,8176,8179,8258,8261,8268,8273,1,9675,59,1,10691,4,3,59,101,108,8187,8189,8193,1,710,113,59,1,8791,101,4,2,97,100,8200,8223,114,114,111,119,4,2,108,114,8210,8216,101,102,116,59,1,8634,105,103,104,116,59,1,8635,4,5,82,83,97,99,100,8235,8238,8241,8246,8252,59,1,174,59,1,9416,115,116,59,1,8859,105,114,99,59,1,8858,97,115,104,59,1,8861,59,1,8791,110,105,110,116,59,1,10768,105,100,59,1,10991,99,105,114,59,1,10690,117,98,115,4,2,59,117,8288,8290,1,9827,105,116,59,1,9827,4,4,108,109,110,112,8305,8326,8376,8400,111,110,4,2,59,101,8313,8315,1,58,4,2,59,113,8321,8323,1,8788,59,1,8788,4,2,109,112,8332,8344,97,4,2,59,116,8339,8341,1,44,59,1,64,4,3,59,102,108,8352,8354,8358,1,8705,110,59,1,8728,101,4,2,109,120,8365,8371,101,110,116,59,1,8705,101,115,59,1,8450,4,2,103,105,8382,8395,4,2,59,100,8388,8390,1,8773,111,116,59,1,10861,110,116,59,1,8750,4,3,102,114,121,8408,8412,8417,59,3,55349,56660,111,100,59,1,8720,5,169,2,59,115,8424,8426,1,169,114,59,1,8471,4,2,97,111,8436,8441,114,114,59,1,8629,115,115,59,1,10007,4,2,99,117,8452,8457,114,59,3,55349,56504,4,2,98,112,8463,8474,4,2,59,101,8469,8471,1,10959,59,1,10961,4,2,59,101,8480,8482,1,10960,59,1,10962,100,111,116,59,1,8943,4,7,100,101,108,112,114,118,119,8507,8522,8536,8550,8600,8697,8702,97,114,114,4,2,108,114,8516,8519,59,1,10552,59,1,10549,4,2,112,115,8528,8532,114,59,1,8926,99,59,1,8927,97,114,114,4,2,59,112,8545,8547,1,8630,59,1,10557,4,6,59,98,99,100,111,115,8564,8566,8573,8587,8592,8596,1,8746,114,99,97,112,59,1,10824,4,2,97,117,8579,8583,112,59,1,10822,112,59,1,10826,111,116,59,1,8845,114,59,1,10821,59,3,8746,65024,4,4,97,108,114,118,8610,8623,8663,8672,114,114,4,2,59,109,8618,8620,1,8631,59,1,10556,121,4,3,101,118,119,8632,8651,8656,113,4,2,112,115,8639,8645,114,101,99,59,1,8926,117,99,99,59,1,8927,101,101,59,1,8910,101,100,103,101,59,1,8911,101,110,5,164,1,59,8670,1,164,101,97,114,114,111,119,4,2,108,114,8684,8690,101,102,116,59,1,8630,105,103,104,116,59,1,8631,101,101,59,1,8910,101,100,59,1,8911,4,2,99,105,8713,8721,111,110,105,110,116,59,1,8754,110,116,59,1,8753,108,99,116,121,59,1,9005,4,19,65,72,97,98,99,100,101,102,104,105,106,108,111,114,115,116,117,119,122,8773,8778,8783,8821,8839,8854,8887,8914,8930,8944,9036,9041,9058,9197,9227,9258,9281,9297,9305,114,114,59,1,8659,97,114,59,1,10597,4,4,103,108,114,115,8793,8799,8805,8809,103,101,114,59,1,8224,101,116,104,59,1,8504,114,59,1,8595,104,4,2,59,118,8816,8818,1,8208,59,1,8867,4,2,107,108,8827,8834,97,114,111,119,59,1,10511,97,99,59,1,733,4,2,97,121,8845,8851,114,111,110,59,1,271,59,1,1076,4,3,59,97,111,8862,8864,8880,1,8518,4,2,103,114,8870,8876,103,101,114,59,1,8225,114,59,1,8650,116,115,101,113,59,1,10871,4,3,103,108,109,8895,8902,8907,5,176,1,59,8900,1,176,116,97,59,1,948,112,116,121,118,59,1,10673,4,2,105,114,8920,8926,115,104,116,59,1,10623,59,3,55349,56609,97,114,4,2,108,114,8938,8941,59,1,8643,59,1,8642,4,5,97,101,103,115,118,8956,8986,8989,8996,9001,109,4,3,59,111,115,8965,8967,8983,1,8900,110,100,4,2,59,115,8975,8977,1,8900,117,105,116,59,1,9830,59,1,9830,59,1,168,97,109,109,97,59,1,989,105,110,59,1,8946,4,3,59,105,111,9009,9011,9031,1,247,100,101,5,247,2,59,111,9020,9022,1,247,110,116,105,109,101,115,59,1,8903,110,120,59,1,8903,99,121,59,1,1106,99,4,2,111,114,9048,9053,114,110,59,1,8990,111,112,59,1,8973,4,5,108,112,116,117,119,9070,9076,9081,9130,9144,108,97,114,59,1,36,102,59,3,55349,56661,4,5,59,101,109,112,115,9093,9095,9109,9116,9122,1,729,113,4,2,59,100,9102,9104,1,8784,111,116,59,1,8785,105,110,117,115,59,1,8760,108,117,115,59,1,8724,113,117,97,114,101,59,1,8865,98,108,101,98,97,114,119,101,100,103,101,59,1,8966,110,4,3,97,100,104,9153,9160,9172,114,114,111,119,59,1,8595,111,119,110,97,114,114,111,119,115,59,1,8650,97,114,112,111,111,110,4,2,108,114,9184,9190,101,102,116,59,1,8643,105,103,104,116,59,1,8642,4,2,98,99,9203,9211,107,97,114,111,119,59,1,10512,4,2,111,114,9217,9222,114,110,59,1,8991,111,112,59,1,8972,4,3,99,111,116,9235,9248,9252,4,2,114,121,9241,9245,59,3,55349,56505,59,1,1109,108,59,1,10742,114,111,107,59,1,273,4,2,100,114,9264,9269,111,116,59,1,8945,105,4,2,59,102,9276,9278,1,9663,59,1,9662,4,2,97,104,9287,9292,114,114,59,1,8693,97,114,59,1,10607,97,110,103,108,101,59,1,10662,4,2,99,105,9311,9315,121,59,1,1119,103,114,97,114,114,59,1,10239,4,18,68,97,99,100,101,102,103,108,109,110,111,112,113,114,115,116,117,120,9361,9376,9398,9439,9444,9447,9462,9495,9531,9585,9598,9614,9659,9755,9771,9792,9808,9826,4,2,68,111,9367,9372,111,116,59,1,10871,116,59,1,8785,4,2,99,115,9382,9392,117,116,101,5,233,1,59,9390,1,233,116,101,114,59,1,10862,4,4,97,105,111,121,9408,9414,9430,9436,114,111,110,59,1,283,114,4,2,59,99,9421,9423,1,8790,5,234,1,59,9428,1,234,108,111,110,59,1,8789,59,1,1101,111,116,59,1,279,59,1,8519,4,2,68,114,9453,9458,111,116,59,1,8786,59,3,55349,56610,4,3,59,114,115,9470,9472,9482,1,10906,97,118,101,5,232,1,59,9480,1,232,4,2,59,100,9488,9490,1,10902,111,116,59,1,10904,4,4,59,105,108,115,9505,9507,9515,9518,1,10905,110,116,101,114,115,59,1,9191,59,1,8467,4,2,59,100,9524,9526,1,10901,111,116,59,1,10903,4,3,97,112,115,9539,9544,9564,99,114,59,1,275,116,121,4,3,59,115,118,9554,9556,9561,1,8709,101,116,59,1,8709,59,1,8709,112,4,2,49,59,9571,9583,4,2,51,52,9577,9580,59,1,8196,59,1,8197,1,8195,4,2,103,115,9591,9594,59,1,331,112,59,1,8194,4,2,103,112,9604,9609,111,110,59,1,281,102,59,3,55349,56662,4,3,97,108,115,9622,9635,9640,114,4,2,59,115,9629,9631,1,8917,108,59,1,10723,117,115,59,1,10865,105,4,3,59,108,118,9649,9651,9656,1,949,111,110,59,1,949,59,1,1013,4,4,99,115,117,118,9669,9686,9716,9747,4,2,105,111,9675,9680,114,99,59,1,8790,108,111,110,59,1,8789,4,2,105,108,9692,9696,109,59,1,8770,97,110,116,4,2,103,108,9705,9710,116,114,59,1,10902,101,115,115,59,1,10901,4,3,97,101,105,9724,9729,9734,108,115,59,1,61,115,116,59,1,8799,118,4,2,59,68,9741,9743,1,8801,68,59,1,10872,112,97,114,115,108,59,1,10725,4,2,68,97,9761,9766,111,116,59,1,8787,114,114,59,1,10609,4,3,99,100,105,9779,9783,9788,114,59,1,8495,111,116,59,1,8784,109,59,1,8770,4,2,97,104,9798,9801,59,1,951,5,240,1,59,9806,1,240,4,2,109,114,9814,9822,108,5,235,1,59,9820,1,235,111,59,1,8364,4,3,99,105,112,9834,9838,9843,108,59,1,33,115,116,59,1,8707,4,2,101,111,9849,9859,99,116,97,116,105,111,110,59,1,8496,110,101,110,116,105,97,108,101,59,1,8519,4,12,97,99,101,102,105,106,108,110,111,112,114,115,9896,9910,9914,9921,9954,9960,9967,9989,9994,10027,10036,10164,108,108,105,110,103,100,111,116,115,101,113,59,1,8786,121,59,1,1092,109,97,108,101,59,1,9792,4,3,105,108,114,9929,9935,9950,108,105,103,59,1,64259,4,2,105,108,9941,9945,103,59,1,64256,105,103,59,1,64260,59,3,55349,56611,108,105,103,59,1,64257,108,105,103,59,3,102,106,4,3,97,108,116,9975,9979,9984,116,59,1,9837,105,103,59,1,64258,110,115,59,1,9649,111,102,59,1,402,4,2,112,114,1e4,10005,102,59,3,55349,56663,4,2,97,107,10011,10016,108,108,59,1,8704,4,2,59,118,10022,10024,1,8916,59,1,10969,97,114,116,105,110,116,59,1,10765,4,2,97,111,10042,10159,4,2,99,115,10048,10155,4,6,49,50,51,52,53,55,10062,10102,10114,10135,10139,10151,4,6,50,51,52,53,54,56,10076,10083,10086,10093,10096,10099,5,189,1,59,10081,1,189,59,1,8531,5,188,1,59,10091,1,188,59,1,8533,59,1,8537,59,1,8539,4,2,51,53,10108,10111,59,1,8532,59,1,8534,4,3,52,53,56,10122,10129,10132,5,190,1,59,10127,1,190,59,1,8535,59,1,8540,53,59,1,8536,4,2,54,56,10145,10148,59,1,8538,59,1,8541,56,59,1,8542,108,59,1,8260,119,110,59,1,8994,99,114,59,3,55349,56507,4,17,69,97,98,99,100,101,102,103,105,106,108,110,111,114,115,116,118,10206,10217,10247,10254,10268,10273,10358,10363,10374,10380,10385,10406,10458,10464,10470,10497,10610,4,2,59,108,10212,10214,1,8807,59,1,10892,4,3,99,109,112,10225,10231,10244,117,116,101,59,1,501,109,97,4,2,59,100,10239,10241,1,947,59,1,989,59,1,10886,114,101,118,101,59,1,287,4,2,105,121,10260,10265,114,99,59,1,285,59,1,1075,111,116,59,1,289,4,4,59,108,113,115,10283,10285,10288,10308,1,8805,59,1,8923,4,3,59,113,115,10296,10298,10301,1,8805,59,1,8807,108,97,110,116,59,1,10878,4,4,59,99,100,108,10318,10320,10324,10345,1,10878,99,59,1,10921,111,116,4,2,59,111,10332,10334,1,10880,4,2,59,108,10340,10342,1,10882,59,1,10884,4,2,59,101,10351,10354,3,8923,65024,115,59,1,10900,114,59,3,55349,56612,4,2,59,103,10369,10371,1,8811,59,1,8921,109,101,108,59,1,8503,99,121,59,1,1107,4,4,59,69,97,106,10395,10397,10400,10403,1,8823,59,1,10898,59,1,10917,59,1,10916,4,4,69,97,101,115,10416,10419,10434,10453,59,1,8809,112,4,2,59,112,10426,10428,1,10890,114,111,120,59,1,10890,4,2,59,113,10440,10442,1,10888,4,2,59,113,10448,10450,1,10888,59,1,8809,105,109,59,1,8935,112,102,59,3,55349,56664,97,118,101,59,1,96,4,2,99,105,10476,10480,114,59,1,8458,109,4,3,59,101,108,10489,10491,10494,1,8819,59,1,10894,59,1,10896,5,62,6,59,99,100,108,113,114,10512,10514,10527,10532,10538,10545,1,62,4,2,99,105,10520,10523,59,1,10919,114,59,1,10874,111,116,59,1,8919,80,97,114,59,1,10645,117,101,115,116,59,1,10876,4,5,97,100,101,108,115,10557,10574,10579,10599,10605,4,2,112,114,10563,10570,112,114,111,120,59,1,10886,114,59,1,10616,111,116,59,1,8919,113,4,2,108,113,10586,10592,101,115,115,59,1,8923,108,101,115,115,59,1,10892,101,115,115,59,1,8823,105,109,59,1,8819,4,2,101,110,10616,10626,114,116,110,101,113,113,59,3,8809,65024,69,59,3,8809,65024,4,10,65,97,98,99,101,102,107,111,115,121,10653,10658,10713,10718,10724,10760,10765,10786,10850,10875,114,114,59,1,8660,4,4,105,108,109,114,10668,10674,10678,10684,114,115,112,59,1,8202,102,59,1,189,105,108,116,59,1,8459,4,2,100,114,10690,10695,99,121,59,1,1098,4,3,59,99,119,10703,10705,10710,1,8596,105,114,59,1,10568,59,1,8621,97,114,59,1,8463,105,114,99,59,1,293,4,3,97,108,114,10732,10748,10754,114,116,115,4,2,59,117,10741,10743,1,9829,105,116,59,1,9829,108,105,112,59,1,8230,99,111,110,59,1,8889,114,59,3,55349,56613,115,4,2,101,119,10772,10779,97,114,111,119,59,1,10533,97,114,111,119,59,1,10534,4,5,97,109,111,112,114,10798,10803,10809,10839,10844,114,114,59,1,8703,116,104,116,59,1,8763,107,4,2,108,114,10816,10827,101,102,116,97,114,114,111,119,59,1,8617,105,103,104,116,97,114,114,111,119,59,1,8618,102,59,3,55349,56665,98,97,114,59,1,8213,4,3,99,108,116,10858,10863,10869,114,59,3,55349,56509,97,115,104,59,1,8463,114,111,107,59,1,295,4,2,98,112,10881,10887,117,108,108,59,1,8259,104,101,110,59,1,8208,4,15,97,99,101,102,103,105,106,109,110,111,112,113,115,116,117,10925,10936,10958,10977,10990,11001,11039,11045,11101,11192,11220,11226,11237,11285,11299,99,117,116,101,5,237,1,59,10934,1,237,4,3,59,105,121,10944,10946,10955,1,8291,114,99,5,238,1,59,10953,1,238,59,1,1080,4,2,99,120,10964,10968,121,59,1,1077,99,108,5,161,1,59,10975,1,161,4,2,102,114,10983,10986,59,1,8660,59,3,55349,56614,114,97,118,101,5,236,1,59,10999,1,236,4,4,59,105,110,111,11011,11013,11028,11034,1,8520,4,2,105,110,11019,11024,110,116,59,1,10764,116,59,1,8749,102,105,110,59,1,10716,116,97,59,1,8489,108,105,103,59,1,307,4,3,97,111,112,11053,11092,11096,4,3,99,103,116,11061,11065,11088,114,59,1,299,4,3,101,108,112,11073,11076,11082,59,1,8465,105,110,101,59,1,8464,97,114,116,59,1,8465,104,59,1,305,102,59,1,8887,101,100,59,1,437,4,5,59,99,102,111,116,11113,11115,11121,11136,11142,1,8712,97,114,101,59,1,8453,105,110,4,2,59,116,11129,11131,1,8734,105,101,59,1,10717,100,111,116,59,1,305,4,5,59,99,101,108,112,11154,11156,11161,11179,11186,1,8747,97,108,59,1,8890,4,2,103,114,11167,11173,101,114,115,59,1,8484,99,97,108,59,1,8890,97,114,104,107,59,1,10775,114,111,100,59,1,10812,4,4,99,103,112,116,11202,11206,11211,11216,121,59,1,1105,111,110,59,1,303,102,59,3,55349,56666,97,59,1,953,114,111,100,59,1,10812,117,101,115,116,5,191,1,59,11235,1,191,4,2,99,105,11243,11248,114,59,3,55349,56510,110,4,5,59,69,100,115,118,11261,11263,11266,11271,11282,1,8712,59,1,8953,111,116,59,1,8949,4,2,59,118,11277,11279,1,8948,59,1,8947,59,1,8712,4,2,59,105,11291,11293,1,8290,108,100,101,59,1,297,4,2,107,109,11305,11310,99,121,59,1,1110,108,5,239,1,59,11316,1,239,4,6,99,102,109,111,115,117,11332,11346,11351,11357,11363,11380,4,2,105,121,11338,11343,114,99,59,1,309,59,1,1081,114,59,3,55349,56615,97,116,104,59,1,567,112,102,59,3,55349,56667,4,2,99,101,11369,11374,114,59,3,55349,56511,114,99,121,59,1,1112,107,99,121,59,1,1108,4,8,97,99,102,103,104,106,111,115,11404,11418,11433,11438,11445,11450,11455,11461,112,112,97,4,2,59,118,11413,11415,1,954,59,1,1008,4,2,101,121,11424,11430,100,105,108,59,1,311,59,1,1082,114,59,3,55349,56616,114,101,101,110,59,1,312,99,121,59,1,1093,99,121,59,1,1116,112,102,59,3,55349,56668,99,114,59,3,55349,56512,4,23,65,66,69,72,97,98,99,100,101,102,103,104,106,108,109,110,111,112,114,115,116,117,118,11515,11538,11544,11555,11560,11721,11780,11818,11868,12136,12160,12171,12203,12208,12246,12275,12327,12509,12523,12569,12641,12732,12752,4,3,97,114,116,11523,11528,11532,114,114,59,1,8666,114,59,1,8656,97,105,108,59,1,10523,97,114,114,59,1,10510,4,2,59,103,11550,11552,1,8806,59,1,10891,97,114,59,1,10594,4,9,99,101,103,109,110,112,113,114,116,11580,11586,11594,11600,11606,11624,11627,11636,11694,117,116,101,59,1,314,109,112,116,121,118,59,1,10676,114,97,110,59,1,8466,98,100,97,59,1,955,103,4,3,59,100,108,11615,11617,11620,1,10216,59,1,10641,101,59,1,10216,59,1,10885,117,111,5,171,1,59,11634,1,171,114,4,8,59,98,102,104,108,112,115,116,11655,11657,11669,11673,11677,11681,11685,11690,1,8592,4,2,59,102,11663,11665,1,8676,115,59,1,10527,115,59,1,10525,107,59,1,8617,112,59,1,8619,108,59,1,10553,105,109,59,1,10611,108,59,1,8610,4,3,59,97,101,11702,11704,11709,1,10923,105,108,59,1,10521,4,2,59,115,11715,11717,1,10925,59,3,10925,65024,4,3,97,98,114,11729,11734,11739,114,114,59,1,10508,114,107,59,1,10098,4,2,97,107,11745,11758,99,4,2,101,107,11752,11755,59,1,123,59,1,91,4,2,101,115,11764,11767,59,1,10635,108,4,2,100,117,11774,11777,59,1,10639,59,1,10637,4,4,97,101,117,121,11790,11796,11811,11815,114,111,110,59,1,318,4,2,100,105,11802,11807,105,108,59,1,316,108,59,1,8968,98,59,1,123,59,1,1083,4,4,99,113,114,115,11828,11832,11845,11864,97,59,1,10550,117,111,4,2,59,114,11840,11842,1,8220,59,1,8222,4,2,100,117,11851,11857,104,97,114,59,1,10599,115,104,97,114,59,1,10571,104,59,1,8626,4,5,59,102,103,113,115,11880,11882,12008,12011,12031,1,8804,116,4,5,97,104,108,114,116,11895,11913,11935,11947,11996,114,114,111,119,4,2,59,116,11905,11907,1,8592,97,105,108,59,1,8610,97,114,112,111,111,110,4,2,100,117,11925,11931,111,119,110,59,1,8637,112,59,1,8636,101,102,116,97,114,114,111,119,115,59,1,8647,105,103,104,116,4,3,97,104,115,11959,11974,11984,114,114,111,119,4,2,59,115,11969,11971,1,8596,59,1,8646,97,114,112,111,111,110,115,59,1,8651,113,117,105,103,97,114,114,111,119,59,1,8621,104,114,101,101,116,105,109,101,115,59,1,8907,59,1,8922,4,3,59,113,115,12019,12021,12024,1,8804,59,1,8806,108,97,110,116,59,1,10877,4,5,59,99,100,103,115,12043,12045,12049,12070,12083,1,10877,99,59,1,10920,111,116,4,2,59,111,12057,12059,1,10879,4,2,59,114,12065,12067,1,10881,59,1,10883,4,2,59,101,12076,12079,3,8922,65024,115,59,1,10899,4,5,97,100,101,103,115,12095,12103,12108,12126,12131,112,112,114,111,120,59,1,10885,111,116,59,1,8918,113,4,2,103,113,12115,12120,116,114,59,1,8922,103,116,114,59,1,10891,116,114,59,1,8822,105,109,59,1,8818,4,3,105,108,114,12144,12150,12156,115,104,116,59,1,10620,111,111,114,59,1,8970,59,3,55349,56617,4,2,59,69,12166,12168,1,8822,59,1,10897,4,2,97,98,12177,12198,114,4,2,100,117,12184,12187,59,1,8637,4,2,59,108,12193,12195,1,8636,59,1,10602,108,107,59,1,9604,99,121,59,1,1113,4,5,59,97,99,104,116,12220,12222,12227,12235,12241,1,8810,114,114,59,1,8647,111,114,110,101,114,59,1,8990,97,114,100,59,1,10603,114,105,59,1,9722,4,2,105,111,12252,12258,100,111,116,59,1,320,117,115,116,4,2,59,97,12267,12269,1,9136,99,104,101,59,1,9136,4,4,69,97,101,115,12285,12288,12303,12322,59,1,8808,112,4,2,59,112,12295,12297,1,10889,114,111,120,59,1,10889,4,2,59,113,12309,12311,1,10887,4,2,59,113,12317,12319,1,10887,59,1,8808,105,109,59,1,8934,4,8,97,98,110,111,112,116,119,122,12345,12359,12364,12421,12446,12467,12474,12490,4,2,110,114,12351,12355,103,59,1,10220,114,59,1,8701,114,107,59,1,10214,103,4,3,108,109,114,12373,12401,12409,101,102,116,4,2,97,114,12382,12389,114,114,111,119,59,1,10229,105,103,104,116,97,114,114,111,119,59,1,10231,97,112,115,116,111,59,1,10236,105,103,104,116,97,114,114,111,119,59,1,10230,112,97,114,114,111,119,4,2,108,114,12433,12439,101,102,116,59,1,8619,105,103,104,116,59,1,8620,4,3,97,102,108,12454,12458,12462,114,59,1,10629,59,3,55349,56669,117,115,59,1,10797,105,109,101,115,59,1,10804,4,2,97,98,12480,12485,115,116,59,1,8727,97,114,59,1,95,4,3,59,101,102,12498,12500,12506,1,9674,110,103,101,59,1,9674,59,1,10731,97,114,4,2,59,108,12517,12519,1,40,116,59,1,10643,4,5,97,99,104,109,116,12535,12540,12548,12561,12564,114,114,59,1,8646,111,114,110,101,114,59,1,8991,97,114,4,2,59,100,12556,12558,1,8651,59,1,10605,59,1,8206,114,105,59,1,8895,4,6,97,99,104,105,113,116,12583,12589,12594,12597,12614,12635,113,117,111,59,1,8249,114,59,3,55349,56513,59,1,8624,109,4,3,59,101,103,12606,12608,12611,1,8818,59,1,10893,59,1,10895,4,2,98,117,12620,12623,59,1,91,111,4,2,59,114,12630,12632,1,8216,59,1,8218,114,111,107,59,1,322,5,60,8,59,99,100,104,105,108,113,114,12660,12662,12675,12680,12686,12692,12698,12705,1,60,4,2,99,105,12668,12671,59,1,10918,114,59,1,10873,111,116,59,1,8918,114,101,101,59,1,8907,109,101,115,59,1,8905,97,114,114,59,1,10614,117,101,115,116,59,1,10875,4,2,80,105,12711,12716,97,114,59,1,10646,4,3,59,101,102,12724,12726,12729,1,9667,59,1,8884,59,1,9666,114,4,2,100,117,12739,12746,115,104,97,114,59,1,10570,104,97,114,59,1,10598,4,2,101,110,12758,12768,114,116,110,101,113,113,59,3,8808,65024,69,59,3,8808,65024,4,14,68,97,99,100,101,102,104,105,108,110,111,112,115,117,12803,12809,12893,12908,12914,12928,12933,12937,13011,13025,13032,13049,13052,13069,68,111,116,59,1,8762,4,4,99,108,112,114,12819,12827,12849,12887,114,5,175,1,59,12825,1,175,4,2,101,116,12833,12836,59,1,9794,4,2,59,101,12842,12844,1,10016,115,101,59,1,10016,4,2,59,115,12855,12857,1,8614,116,111,4,4,59,100,108,117,12869,12871,12877,12883,1,8614,111,119,110,59,1,8615,101,102,116,59,1,8612,112,59,1,8613,107,101,114,59,1,9646,4,2,111,121,12899,12905,109,109,97,59,1,10793,59,1,1084,97,115,104,59,1,8212,97,115,117,114,101,100,97,110,103,108,101,59,1,8737,114,59,3,55349,56618,111,59,1,8487,4,3,99,100,110,12945,12954,12985,114,111,5,181,1,59,12952,1,181,4,4,59,97,99,100,12964,12966,12971,12976,1,8739,115,116,59,1,42,105,114,59,1,10992,111,116,5,183,1,59,12983,1,183,117,115,4,3,59,98,100,12995,12997,13e3,1,8722,59,1,8863,4,2,59,117,13006,13008,1,8760,59,1,10794,4,2,99,100,13017,13021,112,59,1,10971,114,59,1,8230,112,108,117,115,59,1,8723,4,2,100,112,13038,13044,101,108,115,59,1,8871,102,59,3,55349,56670,59,1,8723,4,2,99,116,13058,13063,114,59,3,55349,56514,112,111,115,59,1,8766,4,3,59,108,109,13077,13079,13087,1,956,116,105,109,97,112,59,1,8888,97,112,59,1,8888,4,24,71,76,82,86,97,98,99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,117,118,119,13142,13165,13217,13229,13247,13330,13359,13414,13420,13508,13513,13579,13602,13626,13631,13762,13767,13855,13936,13995,14214,14285,14312,14432,4,2,103,116,13148,13152,59,3,8921,824,4,2,59,118,13158,13161,3,8811,8402,59,3,8811,824,4,3,101,108,116,13173,13200,13204,102,116,4,2,97,114,13181,13188,114,114,111,119,59,1,8653,105,103,104,116,97,114,114,111,119,59,1,8654,59,3,8920,824,4,2,59,118,13210,13213,3,8810,8402,59,3,8810,824,105,103,104,116,97,114,114,111,119,59,1,8655,4,2,68,100,13235,13241,97,115,104,59,1,8879,97,115,104,59,1,8878,4,5,98,99,110,112,116,13259,13264,13270,13275,13308,108,97,59,1,8711,117,116,101,59,1,324,103,59,3,8736,8402,4,5,59,69,105,111,112,13287,13289,13293,13298,13302,1,8777,59,3,10864,824,100,59,3,8779,824,115,59,1,329,114,111,120,59,1,8777,117,114,4,2,59,97,13316,13318,1,9838,108,4,2,59,115,13325,13327,1,9838,59,1,8469,4,2,115,117,13336,13344,112,5,160,1,59,13342,1,160,109,112,4,2,59,101,13352,13355,3,8782,824,59,3,8783,824,4,5,97,101,111,117,121,13371,13385,13391,13407,13411,4,2,112,114,13377,13380,59,1,10819,111,110,59,1,328,100,105,108,59,1,326,110,103,4,2,59,100,13399,13401,1,8775,111,116,59,3,10861,824,112,59,1,10818,59,1,1085,97,115,104,59,1,8211,4,7,59,65,97,100,113,115,120,13436,13438,13443,13466,13472,13478,13494,1,8800,114,114,59,1,8663,114,4,2,104,114,13450,13454,107,59,1,10532,4,2,59,111,13460,13462,1,8599,119,59,1,8599,111,116,59,3,8784,824,117,105,118,59,1,8802,4,2,101,105,13484,13489,97,114,59,1,10536,109,59,3,8770,824,105,115,116,4,2,59,115,13503,13505,1,8708,59,1,8708,114,59,3,55349,56619,4,4,69,101,115,116,13523,13527,13563,13568,59,3,8807,824,4,3,59,113,115,13535,13537,13559,1,8817,4,3,59,113,115,13545,13547,13551,1,8817,59,3,8807,824,108,97,110,116,59,3,10878,824,59,3,10878,824,105,109,59,1,8821,4,2,59,114,13574,13576,1,8815,59,1,8815,4,3,65,97,112,13587,13592,13597,114,114,59,1,8654,114,114,59,1,8622,97,114,59,1,10994,4,3,59,115,118,13610,13612,13623,1,8715,4,2,59,100,13618,13620,1,8956,59,1,8954,59,1,8715,99,121,59,1,1114,4,7,65,69,97,100,101,115,116,13647,13652,13656,13661,13665,13737,13742,114,114,59,1,8653,59,3,8806,824,114,114,59,1,8602,114,59,1,8229,4,4,59,102,113,115,13675,13677,13703,13725,1,8816,116,4,2,97,114,13684,13691,114,114,111,119,59,1,8602,105,103,104,116,97,114,114,111,119,59,1,8622,4,3,59,113,115,13711,13713,13717,1,8816,59,3,8806,824,108,97,110,116,59,3,10877,824,4,2,59,115,13731,13734,3,10877,824,59,1,8814,105,109,59,1,8820,4,2,59,114,13748,13750,1,8814,105,4,2,59,101,13757,13759,1,8938,59,1,8940,105,100,59,1,8740,4,2,112,116,13773,13778,102,59,3,55349,56671,5,172,3,59,105,110,13787,13789,13829,1,172,110,4,4,59,69,100,118,13800,13802,13806,13812,1,8713,59,3,8953,824,111,116,59,3,8949,824,4,3,97,98,99,13820,13823,13826,59,1,8713,59,1,8951,59,1,8950,105,4,2,59,118,13836,13838,1,8716,4,3,97,98,99,13846,13849,13852,59,1,8716,59,1,8958,59,1,8957,4,3,97,111,114,13863,13892,13899,114,4,4,59,97,115,116,13874,13876,13883,13888,1,8742,108,108,101,108,59,1,8742,108,59,3,11005,8421,59,3,8706,824,108,105,110,116,59,1,10772,4,3,59,99,101,13907,13909,13914,1,8832,117,101,59,1,8928,4,2,59,99,13920,13923,3,10927,824,4,2,59,101,13929,13931,1,8832,113,59,3,10927,824,4,4,65,97,105,116,13946,13951,13971,13982,114,114,59,1,8655,114,114,4,3,59,99,119,13961,13963,13967,1,8603,59,3,10547,824,59,3,8605,824,103,104,116,97,114,114,111,119,59,1,8603,114,105,4,2,59,101,13990,13992,1,8939,59,1,8941,4,7,99,104,105,109,112,113,117,14011,14036,14060,14080,14085,14090,14106,4,4,59,99,101,114,14021,14023,14028,14032,1,8833,117,101,59,1,8929,59,3,10928,824,59,3,55349,56515,111,114,116,4,2,109,112,14045,14050,105,100,59,1,8740,97,114,97,108,108,101,108,59,1,8742,109,4,2,59,101,14067,14069,1,8769,4,2,59,113,14075,14077,1,8772,59,1,8772,105,100,59,1,8740,97,114,59,1,8742,115,117,4,2,98,112,14098,14102,101,59,1,8930,101,59,1,8931,4,3,98,99,112,14114,14157,14171,4,4,59,69,101,115,14124,14126,14130,14133,1,8836,59,3,10949,824,59,1,8840,101,116,4,2,59,101,14141,14144,3,8834,8402,113,4,2,59,113,14151,14153,1,8840,59,3,10949,824,99,4,2,59,101,14164,14166,1,8833,113,59,3,10928,824,4,4,59,69,101,115,14181,14183,14187,14190,1,8837,59,3,10950,824,59,1,8841,101,116,4,2,59,101,14198,14201,3,8835,8402,113,4,2,59,113,14208,14210,1,8841,59,3,10950,824,4,4,103,105,108,114,14224,14228,14238,14242,108,59,1,8825,108,100,101,5,241,1,59,14236,1,241,103,59,1,8824,105,97,110,103,108,101,4,2,108,114,14254,14269,101,102,116,4,2,59,101,14263,14265,1,8938,113,59,1,8940,105,103,104,116,4,2,59,101,14279,14281,1,8939,113,59,1,8941,4,2,59,109,14291,14293,1,957,4,3,59,101,115,14301,14303,14308,1,35,114,111,59,1,8470,112,59,1,8199,4,9,68,72,97,100,103,105,108,114,115,14332,14338,14344,14349,14355,14369,14376,14408,14426,97,115,104,59,1,8877,97,114,114,59,1,10500,112,59,3,8781,8402,97,115,104,59,1,8876,4,2,101,116,14361,14365,59,3,8805,8402,59,3,62,8402,110,102,105,110,59,1,10718,4,3,65,101,116,14384,14389,14393,114,114,59,1,10498,59,3,8804,8402,4,2,59,114,14399,14402,3,60,8402,105,101,59,3,8884,8402,4,2,65,116,14414,14419,114,114,59,1,10499,114,105,101,59,3,8885,8402,105,109,59,3,8764,8402,4,3,65,97,110,14440,14445,14468,114,114,59,1,8662,114,4,2,104,114,14452,14456,107,59,1,10531,4,2,59,111,14462,14464,1,8598,119,59,1,8598,101,97,114,59,1,10535,4,18,83,97,99,100,101,102,103,104,105,108,109,111,112,114,115,116,117,118,14512,14515,14535,14560,14597,14603,14618,14643,14657,14662,14701,14741,14747,14769,14851,14877,14907,14916,59,1,9416,4,2,99,115,14521,14531,117,116,101,5,243,1,59,14529,1,243,116,59,1,8859,4,2,105,121,14541,14557,114,4,2,59,99,14548,14550,1,8858,5,244,1,59,14555,1,244,59,1,1086,4,5,97,98,105,111,115,14572,14577,14583,14587,14591,115,104,59,1,8861,108,97,99,59,1,337,118,59,1,10808,116,59,1,8857,111,108,100,59,1,10684,108,105,103,59,1,339,4,2,99,114,14609,14614,105,114,59,1,10687,59,3,55349,56620,4,3,111,114,116,14626,14630,14640,110,59,1,731,97,118,101,5,242,1,59,14638,1,242,59,1,10689,4,2,98,109,14649,14654,97,114,59,1,10677,59,1,937,110,116,59,1,8750,4,4,97,99,105,116,14672,14677,14693,14698,114,114,59,1,8634,4,2,105,114,14683,14687,114,59,1,10686,111,115,115,59,1,10683,110,101,59,1,8254,59,1,10688,4,3,97,101,105,14709,14714,14719,99,114,59,1,333,103,97,59,1,969,4,3,99,100,110,14727,14733,14736,114,111,110,59,1,959,59,1,10678,117,115,59,1,8854,112,102,59,3,55349,56672,4,3,97,101,108,14755,14759,14764,114,59,1,10679,114,112,59,1,10681,117,115,59,1,8853,4,7,59,97,100,105,111,115,118,14785,14787,14792,14831,14837,14841,14848,1,8744,114,114,59,1,8635,4,4,59,101,102,109,14802,14804,14817,14824,1,10845,114,4,2,59,111,14811,14813,1,8500,102,59,1,8500,5,170,1,59,14822,1,170,5,186,1,59,14829,1,186,103,111,102,59,1,8886,114,59,1,10838,108,111,112,101,59,1,10839,59,1,10843,4,3,99,108,111,14859,14863,14873,114,59,1,8500,97,115,104,5,248,1,59,14871,1,248,108,59,1,8856,105,4,2,108,109,14884,14893,100,101,5,245,1,59,14891,1,245,101,115,4,2,59,97,14901,14903,1,8855,115,59,1,10806,109,108,5,246,1,59,14914,1,246,98,97,114,59,1,9021,4,12,97,99,101,102,104,105,108,109,111,114,115,117,14948,14992,14996,15033,15038,15068,15090,15189,15192,15222,15427,15441,114,4,4,59,97,115,116,14959,14961,14976,14989,1,8741,5,182,2,59,108,14968,14970,1,182,108,101,108,59,1,8741,4,2,105,108,14982,14986,109,59,1,10995,59,1,11005,59,1,8706,121,59,1,1087,114,4,5,99,105,109,112,116,15009,15014,15019,15024,15027,110,116,59,1,37,111,100,59,1,46,105,108,59,1,8240,59,1,8869,101,110,107,59,1,8241,114,59,3,55349,56621,4,3,105,109,111,15046,15057,15063,4,2,59,118,15052,15054,1,966,59,1,981,109,97,116,59,1,8499,110,101,59,1,9742,4,3,59,116,118,15076,15078,15087,1,960,99,104,102,111,114,107,59,1,8916,59,1,982,4,2,97,117,15096,15119,110,4,2,99,107,15103,15115,107,4,2,59,104,15110,15112,1,8463,59,1,8462,118,59,1,8463,115,4,9,59,97,98,99,100,101,109,115,116,15140,15142,15148,15151,15156,15168,15171,15179,15184,1,43,99,105,114,59,1,10787,59,1,8862,105,114,59,1,10786,4,2,111,117,15162,15165,59,1,8724,59,1,10789,59,1,10866,110,5,177,1,59,15177,1,177,105,109,59,1,10790,119,111,59,1,10791,59,1,177,4,3,105,112,117,15200,15208,15213,110,116,105,110,116,59,1,10773,102,59,3,55349,56673,110,100,5,163,1,59,15220,1,163,4,10,59,69,97,99,101,105,110,111,115,117,15244,15246,15249,15253,15258,15334,15347,15367,15416,15421,1,8826,59,1,10931,112,59,1,10935,117,101,59,1,8828,4,2,59,99,15264,15266,1,10927,4,6,59,97,99,101,110,115,15280,15282,15290,15299,15303,15329,1,8826,112,112,114,111,120,59,1,10935,117,114,108,121,101,113,59,1,8828,113,59,1,10927,4,3,97,101,115,15311,15319,15324,112,112,114,111,120,59,1,10937,113,113,59,1,10933,105,109,59,1,8936,105,109,59,1,8830,109,101,4,2,59,115,15342,15344,1,8242,59,1,8473,4,3,69,97,115,15355,15358,15362,59,1,10933,112,59,1,10937,105,109,59,1,8936,4,3,100,102,112,15375,15378,15404,59,1,8719,4,3,97,108,115,15386,15392,15398,108,97,114,59,1,9006,105,110,101,59,1,8978,117,114,102,59,1,8979,4,2,59,116,15410,15412,1,8733,111,59,1,8733,105,109,59,1,8830,114,101,108,59,1,8880,4,2,99,105,15433,15438,114,59,3,55349,56517,59,1,968,110,99,115,112,59,1,8200,4,6,102,105,111,112,115,117,15462,15467,15472,15478,15485,15491,114,59,3,55349,56622,110,116,59,1,10764,112,102,59,3,55349,56674,114,105,109,101,59,1,8279,99,114,59,3,55349,56518,4,3,97,101,111,15499,15520,15534,116,4,2,101,105,15506,15515,114,110,105,111,110,115,59,1,8461,110,116,59,1,10774,115,116,4,2,59,101,15528,15530,1,63,113,59,1,8799,116,5,34,1,59,15540,1,34,4,21,65,66,72,97,98,99,100,101,102,104,105,108,109,110,111,112,114,115,116,117,120,15586,15609,15615,15620,15796,15855,15893,15931,15977,16001,16039,16183,16204,16222,16228,16285,16312,16318,16363,16408,16416,4,3,97,114,116,15594,15599,15603,114,114,59,1,8667,114,59,1,8658,97,105,108,59,1,10524,97,114,114,59,1,10511,97,114,59,1,10596,4,7,99,100,101,110,113,114,116,15636,15651,15656,15664,15687,15696,15770,4,2,101,117,15642,15646,59,3,8765,817,116,101,59,1,341,105,99,59,1,8730,109,112,116,121,118,59,1,10675,103,4,4,59,100,101,108,15675,15677,15680,15683,1,10217,59,1,10642,59,1,10661,101,59,1,10217,117,111,5,187,1,59,15694,1,187,114,4,11,59,97,98,99,102,104,108,112,115,116,119,15721,15723,15727,15739,15742,15746,15750,15754,15758,15763,15767,1,8594,112,59,1,10613,4,2,59,102,15733,15735,1,8677,115,59,1,10528,59,1,10547,115,59,1,10526,107,59,1,8618,112,59,1,8620,108,59,1,10565,105,109,59,1,10612,108,59,1,8611,59,1,8605,4,2,97,105,15776,15781,105,108,59,1,10522,111,4,2,59,110,15788,15790,1,8758,97,108,115,59,1,8474,4,3,97,98,114,15804,15809,15814,114,114,59,1,10509,114,107,59,1,10099,4,2,97,107,15820,15833,99,4,2,101,107,15827,15830,59,1,125,59,1,93,4,2,101,115,15839,15842,59,1,10636,108,4,2,100,117,15849,15852,59,1,10638,59,1,10640,4,4,97,101,117,121,15865,15871,15886,15890,114,111,110,59,1,345,4,2,100,105,15877,15882,105,108,59,1,343,108,59,1,8969,98,59,1,125,59,1,1088,4,4,99,108,113,115,15903,15907,15914,15927,97,59,1,10551,100,104,97,114,59,1,10601,117,111,4,2,59,114,15922,15924,1,8221,59,1,8221,104,59,1,8627,4,3,97,99,103,15939,15966,15970,108,4,4,59,105,112,115,15950,15952,15957,15963,1,8476,110,101,59,1,8475,97,114,116,59,1,8476,59,1,8477,116,59,1,9645,5,174,1,59,15975,1,174,4,3,105,108,114,15985,15991,15997,115,104,116,59,1,10621,111,111,114,59,1,8971,59,3,55349,56623,4,2,97,111,16007,16028,114,4,2,100,117,16014,16017,59,1,8641,4,2,59,108,16023,16025,1,8640,59,1,10604,4,2,59,118,16034,16036,1,961,59,1,1009,4,3,103,110,115,16047,16167,16171,104,116,4,6,97,104,108,114,115,116,16063,16081,16103,16130,16143,16155,114,114,111,119,4,2,59,116,16073,16075,1,8594,97,105,108,59,1,8611,97,114,112,111,111,110,4,2,100,117,16093,16099,111,119,110,59,1,8641,112,59,1,8640,101,102,116,4,2,97,104,16112,16120,114,114,111,119,115,59,1,8644,97,114,112,111,111,110,115,59,1,8652,105,103,104,116,97,114,114,111,119,115,59,1,8649,113,117,105,103,97,114,114,111,119,59,1,8605,104,114,101,101,116,105,109,101,115,59,1,8908,103,59,1,730,105,110,103,100,111,116,115,101,113,59,1,8787,4,3,97,104,109,16191,16196,16201,114,114,59,1,8644,97,114,59,1,8652,59,1,8207,111,117,115,116,4,2,59,97,16214,16216,1,9137,99,104,101,59,1,9137,109,105,100,59,1,10990,4,4,97,98,112,116,16238,16252,16257,16278,4,2,110,114,16244,16248,103,59,1,10221,114,59,1,8702,114,107,59,1,10215,4,3,97,102,108,16265,16269,16273,114,59,1,10630,59,3,55349,56675,117,115,59,1,10798,105,109,101,115,59,1,10805,4,2,97,112,16291,16304,114,4,2,59,103,16298,16300,1,41,116,59,1,10644,111,108,105,110,116,59,1,10770,97,114,114,59,1,8649,4,4,97,99,104,113,16328,16334,16339,16342,113,117,111,59,1,8250,114,59,3,55349,56519,59,1,8625,4,2,98,117,16348,16351,59,1,93,111,4,2,59,114,16358,16360,1,8217,59,1,8217,4,3,104,105,114,16371,16377,16383,114,101,101,59,1,8908,109,101,115,59,1,8906,105,4,4,59,101,102,108,16394,16396,16399,16402,1,9657,59,1,8885,59,1,9656,116,114,105,59,1,10702,108,117,104,97,114,59,1,10600,59,1,8478,4,19,97,98,99,100,101,102,104,105,108,109,111,112,113,114,115,116,117,119,122,16459,16466,16472,16572,16590,16672,16687,16746,16844,16850,16924,16963,16988,17115,17121,17154,17206,17614,17656,99,117,116,101,59,1,347,113,117,111,59,1,8218,4,10,59,69,97,99,101,105,110,112,115,121,16494,16496,16499,16513,16518,16531,16536,16556,16564,16569,1,8827,59,1,10932,4,2,112,114,16505,16508,59,1,10936,111,110,59,1,353,117,101,59,1,8829,4,2,59,100,16524,16526,1,10928,105,108,59,1,351,114,99,59,1,349,4,3,69,97,115,16544,16547,16551,59,1,10934,112,59,1,10938,105,109,59,1,8937,111,108,105,110,116,59,1,10771,105,109,59,1,8831,59,1,1089,111,116,4,3,59,98,101,16582,16584,16587,1,8901,59,1,8865,59,1,10854,4,7,65,97,99,109,115,116,120,16606,16611,16634,16642,16646,16652,16668,114,114,59,1,8664,114,4,2,104,114,16618,16622,107,59,1,10533,4,2,59,111,16628,16630,1,8600,119,59,1,8600,116,5,167,1,59,16640,1,167,105,59,1,59,119,97,114,59,1,10537,109,4,2,105,110,16659,16665,110,117,115,59,1,8726,59,1,8726,116,59,1,10038,114,4,2,59,111,16679,16682,3,55349,56624,119,110,59,1,8994,4,4,97,99,111,121,16697,16702,16716,16739,114,112,59,1,9839,4,2,104,121,16708,16713,99,121,59,1,1097,59,1,1096,114,116,4,2,109,112,16724,16729,105,100,59,1,8739,97,114,97,108,108,101,108,59,1,8741,5,173,1,59,16744,1,173,4,2,103,109,16752,16770,109,97,4,3,59,102,118,16762,16764,16767,1,963,59,1,962,59,1,962,4,8,59,100,101,103,108,110,112,114,16788,16790,16795,16806,16817,16828,16832,16838,1,8764,111,116,59,1,10858,4,2,59,113,16801,16803,1,8771,59,1,8771,4,2,59,69,16812,16814,1,10910,59,1,10912,4,2,59,69,16823,16825,1,10909,59,1,10911,101,59,1,8774,108,117,115,59,1,10788,97,114,114,59,1,10610,97,114,114,59,1,8592,4,4,97,101,105,116,16860,16883,16891,16904,4,2,108,115,16866,16878,108,115,101,116,109,105,110,117,115,59,1,8726,104,112,59,1,10803,112,97,114,115,108,59,1,10724,4,2,100,108,16897,16900,59,1,8739,101,59,1,8995,4,2,59,101,16910,16912,1,10922,4,2,59,115,16918,16920,1,10924,59,3,10924,65024,4,3,102,108,112,16932,16938,16958,116,99,121,59,1,1100,4,2,59,98,16944,16946,1,47,4,2,59,97,16952,16954,1,10692,114,59,1,9023,102,59,3,55349,56676,97,4,2,100,114,16970,16985,101,115,4,2,59,117,16978,16980,1,9824,105,116,59,1,9824,59,1,8741,4,3,99,115,117,16996,17028,17089,4,2,97,117,17002,17015,112,4,2,59,115,17009,17011,1,8851,59,3,8851,65024,112,4,2,59,115,17022,17024,1,8852,59,3,8852,65024,117,4,2,98,112,17035,17062,4,3,59,101,115,17043,17045,17048,1,8847,59,1,8849,101,116,4,2,59,101,17056,17058,1,8847,113,59,1,8849,4,3,59,101,115,17070,17072,17075,1,8848,59,1,8850,101,116,4,2,59,101,17083,17085,1,8848,113,59,1,8850,4,3,59,97,102,17097,17099,17112,1,9633,114,4,2,101,102,17106,17109,59,1,9633,59,1,9642,59,1,9642,97,114,114,59,1,8594,4,4,99,101,109,116,17131,17136,17142,17148,114,59,3,55349,56520,116,109,110,59,1,8726,105,108,101,59,1,8995,97,114,102,59,1,8902,4,2,97,114,17160,17172,114,4,2,59,102,17167,17169,1,9734,59,1,9733,4,2,97,110,17178,17202,105,103,104,116,4,2,101,112,17188,17197,112,115,105,108,111,110,59,1,1013,104,105,59,1,981,115,59,1,175,4,5,98,99,109,110,112,17218,17351,17420,17423,17427,4,9,59,69,100,101,109,110,112,114,115,17238,17240,17243,17248,17261,17267,17279,17285,17291,1,8834,59,1,10949,111,116,59,1,10941,4,2,59,100,17254,17256,1,8838,111,116,59,1,10947,117,108,116,59,1,10945,4,2,69,101,17273,17276,59,1,10955,59,1,8842,108,117,115,59,1,10943,97,114,114,59,1,10617,4,3,101,105,117,17299,17335,17339,116,4,3,59,101,110,17308,17310,17322,1,8834,113,4,2,59,113,17317,17319,1,8838,59,1,10949,101,113,4,2,59,113,17330,17332,1,8842,59,1,10955,109,59,1,10951,4,2,98,112,17345,17348,59,1,10965,59,1,10963,99,4,6,59,97,99,101,110,115,17366,17368,17376,17385,17389,17415,1,8827,112,112,114,111,120,59,1,10936,117,114,108,121,101,113,59,1,8829,113,59,1,10928,4,3,97,101,115,17397,17405,17410,112,112,114,111,120,59,1,10938,113,113,59,1,10934,105,109,59,1,8937,105,109,59,1,8831,59,1,8721,103,59,1,9834,4,13,49,50,51,59,69,100,101,104,108,109,110,112,115,17455,17462,17469,17476,17478,17481,17496,17509,17524,17530,17536,17548,17554,5,185,1,59,17460,1,185,5,178,1,59,17467,1,178,5,179,1,59,17474,1,179,1,8835,59,1,10950,4,2,111,115,17487,17491,116,59,1,10942,117,98,59,1,10968,4,2,59,100,17502,17504,1,8839,111,116,59,1,10948,115,4,2,111,117,17516,17520,108,59,1,10185,98,59,1,10967,97,114,114,59,1,10619,117,108,116,59,1,10946,4,2,69,101,17542,17545,59,1,10956,59,1,8843,108,117,115,59,1,10944,4,3,101,105,117,17562,17598,17602,116,4,3,59,101,110,17571,17573,17585,1,8835,113,4,2,59,113,17580,17582,1,8839,59,1,10950,101,113,4,2,59,113,17593,17595,1,8843,59,1,10956,109,59,1,10952,4,2,98,112,17608,17611,59,1,10964,59,1,10966,4,3,65,97,110,17622,17627,17650,114,114,59,1,8665,114,4,2,104,114,17634,17638,107,59,1,10534,4,2,59,111,17644,17646,1,8601,119,59,1,8601,119,97,114,59,1,10538,108,105,103,5,223,1,59,17664,1,223,4,13,97,98,99,100,101,102,104,105,111,112,114,115,119,17694,17709,17714,17737,17742,17749,17754,17860,17905,17957,17964,18090,18122,4,2,114,117,17700,17706,103,101,116,59,1,8982,59,1,964,114,107,59,1,9140,4,3,97,101,121,17722,17728,17734,114,111,110,59,1,357,100,105,108,59,1,355,59,1,1090,111,116,59,1,8411,108,114,101,99,59,1,8981,114,59,3,55349,56625,4,4,101,105,107,111,17764,17805,17836,17851,4,2,114,116,17770,17786,101,4,2,52,102,17777,17780,59,1,8756,111,114,101,59,1,8756,97,4,3,59,115,118,17795,17797,17802,1,952,121,109,59,1,977,59,1,977,4,2,99,110,17811,17831,107,4,2,97,115,17818,17826,112,112,114,111,120,59,1,8776,105,109,59,1,8764,115,112,59,1,8201,4,2,97,115,17842,17846,112,59,1,8776,105,109,59,1,8764,114,110,5,254,1,59,17858,1,254,4,3,108,109,110,17868,17873,17901,100,101,59,1,732,101,115,5,215,3,59,98,100,17884,17886,17898,1,215,4,2,59,97,17892,17894,1,8864,114,59,1,10801,59,1,10800,116,59,1,8749,4,3,101,112,115,17913,17917,17953,97,59,1,10536,4,4,59,98,99,102,17927,17929,17934,17939,1,8868,111,116,59,1,9014,105,114,59,1,10993,4,2,59,111,17945,17948,3,55349,56677,114,107,59,1,10970,97,59,1,10537,114,105,109,101,59,1,8244,4,3,97,105,112,17972,17977,18082,100,101,59,1,8482,4,7,97,100,101,109,112,115,116,17993,18051,18056,18059,18066,18072,18076,110,103,108,101,4,5,59,100,108,113,114,18009,18011,18017,18032,18035,1,9653,111,119,110,59,1,9663,101,102,116,4,2,59,101,18026,18028,1,9667,113,59,1,8884,59,1,8796,105,103,104,116,4,2,59,101,18045,18047,1,9657,113,59,1,8885,111,116,59,1,9708,59,1,8796,105,110,117,115,59,1,10810,108,117,115,59,1,10809,98,59,1,10701,105,109,101,59,1,10811,101,122,105,117,109,59,1,9186,4,3,99,104,116,18098,18111,18116,4,2,114,121,18104,18108,59,3,55349,56521,59,1,1094,99,121,59,1,1115,114,111,107,59,1,359,4,2,105,111,18128,18133,120,116,59,1,8812,104,101,97,100,4,2,108,114,18143,18154,101,102,116,97,114,114,111,119,59,1,8606,105,103,104,116,97,114,114,111,119,59,1,8608,4,18,65,72,97,98,99,100,102,103,104,108,109,111,112,114,115,116,117,119,18204,18209,18214,18234,18250,18268,18292,18308,18319,18343,18379,18397,18413,18504,18547,18553,18584,18603,114,114,59,1,8657,97,114,59,1,10595,4,2,99,114,18220,18230,117,116,101,5,250,1,59,18228,1,250,114,59,1,8593,114,4,2,99,101,18241,18245,121,59,1,1118,118,101,59,1,365,4,2,105,121,18256,18265,114,99,5,251,1,59,18263,1,251,59,1,1091,4,3,97,98,104,18276,18281,18287,114,114,59,1,8645,108,97,99,59,1,369,97,114,59,1,10606,4,2,105,114,18298,18304,115,104,116,59,1,10622,59,3,55349,56626,114,97,118,101,5,249,1,59,18317,1,249,4,2,97,98,18325,18338,114,4,2,108,114,18332,18335,59,1,8639,59,1,8638,108,107,59,1,9600,4,2,99,116,18349,18374,4,2,111,114,18355,18369,114,110,4,2,59,101,18363,18365,1,8988,114,59,1,8988,111,112,59,1,8975,114,105,59,1,9720,4,2,97,108,18385,18390,99,114,59,1,363,5,168,1,59,18395,1,168,4,2,103,112,18403,18408,111,110,59,1,371,102,59,3,55349,56678,4,6,97,100,104,108,115,117,18427,18434,18445,18470,18475,18494,114,114,111,119,59,1,8593,111,119,110,97,114,114,111,119,59,1,8597,97,114,112,111,111,110,4,2,108,114,18457,18463,101,102,116,59,1,8639,105,103,104,116,59,1,8638,117,115,59,1,8846,105,4,3,59,104,108,18484,18486,18489,1,965,59,1,978,111,110,59,1,965,112,97,114,114,111,119,115,59,1,8648,4,3,99,105,116,18512,18537,18542,4,2,111,114,18518,18532,114,110,4,2,59,101,18526,18528,1,8989,114,59,1,8989,111,112,59,1,8974,110,103,59,1,367,114,105,59,1,9721,99,114,59,3,55349,56522,4,3,100,105,114,18561,18566,18572,111,116,59,1,8944,108,100,101,59,1,361,105,4,2,59,102,18579,18581,1,9653,59,1,9652,4,2,97,109,18590,18595,114,114,59,1,8648,108,5,252,1,59,18601,1,252,97,110,103,108,101,59,1,10663,4,15,65,66,68,97,99,100,101,102,108,110,111,112,114,115,122,18643,18648,18661,18667,18847,18851,18857,18904,18909,18915,18931,18937,18943,18949,18996,114,114,59,1,8661,97,114,4,2,59,118,18656,18658,1,10984,59,1,10985,97,115,104,59,1,8872,4,2,110,114,18673,18679,103,114,116,59,1,10652,4,7,101,107,110,112,114,115,116,18695,18704,18711,18720,18742,18754,18810,112,115,105,108,111,110,59,1,1013,97,112,112,97,59,1,1008,111,116,104,105,110,103,59,1,8709,4,3,104,105,114,18728,18732,18735,105,59,1,981,59,1,982,111,112,116,111,59,1,8733,4,2,59,104,18748,18750,1,8597,111,59,1,1009,4,2,105,117,18760,18766,103,109,97,59,1,962,4,2,98,112,18772,18791,115,101,116,110,101,113,4,2,59,113,18784,18787,3,8842,65024,59,3,10955,65024,115,101,116,110,101,113,4,2,59,113,18803,18806,3,8843,65024,59,3,10956,65024,4,2,104,114,18816,18822,101,116,97,59,1,977,105,97,110,103,108,101,4,2,108,114,18834,18840,101,102,116,59,1,8882,105,103,104,116,59,1,8883,121,59,1,1074,97,115,104,59,1,8866,4,3,101,108,114,18865,18884,18890,4,3,59,98,101,18873,18875,18880,1,8744,97,114,59,1,8891,113,59,1,8794,108,105,112,59,1,8942,4,2,98,116,18896,18901,97,114,59,1,124,59,1,124,114,59,3,55349,56627,116,114,105,59,1,8882,115,117,4,2,98,112,18923,18927,59,3,8834,8402,59,3,8835,8402,112,102,59,3,55349,56679,114,111,112,59,1,8733,116,114,105,59,1,8883,4,2,99,117,18955,18960,114,59,3,55349,56523,4,2,98,112,18966,18981,110,4,2,69,101,18973,18977,59,3,10955,65024,59,3,8842,65024,110,4,2,69,101,18988,18992,59,3,10956,65024,59,3,8843,65024,105,103,122,97,103,59,1,10650,4,7,99,101,102,111,112,114,115,19020,19026,19061,19066,19072,19075,19089,105,114,99,59,1,373,4,2,100,105,19032,19055,4,2,98,103,19038,19043,97,114,59,1,10847,101,4,2,59,113,19050,19052,1,8743,59,1,8793,101,114,112,59,1,8472,114,59,3,55349,56628,112,102,59,3,55349,56680,59,1,8472,4,2,59,101,19081,19083,1,8768,97,116,104,59,1,8768,99,114,59,3,55349,56524,4,14,99,100,102,104,105,108,109,110,111,114,115,117,118,119,19125,19146,19152,19157,19173,19176,19192,19197,19202,19236,19252,19269,19286,19291,4,3,97,105,117,19133,19137,19142,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,116,114,105,59,1,9661,114,59,3,55349,56629,4,2,65,97,19163,19168,114,114,59,1,10234,114,114,59,1,10231,59,1,958,4,2,65,97,19182,19187,114,114,59,1,10232,114,114,59,1,10229,97,112,59,1,10236,105,115,59,1,8955,4,3,100,112,116,19210,19215,19230,111,116,59,1,10752,4,2,102,108,19221,19225,59,3,55349,56681,117,115,59,1,10753,105,109,101,59,1,10754,4,2,65,97,19242,19247,114,114,59,1,10233,114,114,59,1,10230,4,2,99,113,19258,19263,114,59,3,55349,56525,99,117,112,59,1,10758,4,2,112,116,19275,19281,108,117,115,59,1,10756,114,105,59,1,9651,101,101,59,1,8897,101,100,103,101,59,1,8896,4,8,97,99,101,102,105,111,115,117,19316,19335,19349,19357,19362,19367,19373,19379,99,4,2,117,121,19323,19332,116,101,5,253,1,59,19330,1,253,59,1,1103,4,2,105,121,19341,19346,114,99,59,1,375,59,1,1099,110,5,165,1,59,19355,1,165,114,59,3,55349,56630,99,121,59,1,1111,112,102,59,3,55349,56682,99,114,59,3,55349,56526,4,2,99,109,19385,19389,121,59,1,1102,108,5,255,1,59,19395,1,255,4,10,97,99,100,101,102,104,105,111,115,119,19419,19426,19441,19446,19462,19467,19472,19480,19486,19492,99,117,116,101,59,1,378,4,2,97,121,19432,19438,114,111,110,59,1,382,59,1,1079,111,116,59,1,380,4,2,101,116,19452,19458,116,114,102,59,1,8488,97,59,1,950,114,59,3,55349,56631,99,121,59,1,1078,103,114,97,114,114,59,1,8669,112,102,59,3,55349,56683,99,114,59,3,55349,56527,4,2,106,110,19498,19501,59,1,8205,106,59,1,8204]);const P=s,H={DASH_DASH_STRING:[45,45],DOCTYPE_STRING:[68,79,67,84,89,80,69],CDATA_START_STRING:[91,67,68,65,84,65,91],SCRIPT_STRING:[115,99,114,105,112,116],PUBLIC_STRING:[80,85,66,76,73,67],SYSTEM_STRING:[83,89,83,84,69,77]},D={128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376},F="DATA_STATE",U="RCDATA_STATE",G="RAWTEXT_STATE",B="SCRIPT_DATA_STATE",K="PLAINTEXT_STATE",b="TAG_OPEN_STATE",x="END_TAG_OPEN_STATE",y="TAG_NAME_STATE",v="RCDATA_LESS_THAN_SIGN_STATE",Y="RCDATA_END_TAG_OPEN_STATE",w="RCDATA_END_TAG_NAME_STATE",Q="RAWTEXT_LESS_THAN_SIGN_STATE",X="RAWTEXT_END_TAG_OPEN_STATE",W="RAWTEXT_END_TAG_NAME_STATE",V="SCRIPT_DATA_LESS_THAN_SIGN_STATE",j="SCRIPT_DATA_END_TAG_OPEN_STATE",z="SCRIPT_DATA_END_TAG_NAME_STATE",q="SCRIPT_DATA_ESCAPE_START_STATE",J="SCRIPT_DATA_ESCAPE_START_DASH_STATE",Z="SCRIPT_DATA_ESCAPED_STATE",$="SCRIPT_DATA_ESCAPED_DASH_STATE",ee="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",te="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE",ne="SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE",se="SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE",re="SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE",ie="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",oe="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE",ae="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE",Te="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",Ee="SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE",he="BEFORE_ATTRIBUTE_NAME_STATE",ce="ATTRIBUTE_NAME_STATE",_e="AFTER_ATTRIBUTE_NAME_STATE",le="BEFORE_ATTRIBUTE_VALUE_STATE",me="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE",pe="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE",Ae="ATTRIBUTE_VALUE_UNQUOTED_STATE",ue="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE",Ne="SELF_CLOSING_START_TAG_STATE",de="BOGUS_COMMENT_STATE",Ce="MARKUP_DECLARATION_OPEN_STATE",Oe="COMMENT_START_STATE",fe="COMMENT_START_DASH_STATE",Se="COMMENT_STATE",Re="COMMENT_LESS_THAN_SIGN_STATE",Ie="COMMENT_LESS_THAN_SIGN_BANG_STATE",Le="COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE",ke="COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE",Me="COMMENT_END_DASH_STATE",ge="COMMENT_END_STATE",Pe="COMMENT_END_BANG_STATE",He="DOCTYPE_STATE",De="BEFORE_DOCTYPE_NAME_STATE",Fe="DOCTYPE_NAME_STATE",Ue="AFTER_DOCTYPE_NAME_STATE",Ge="AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE",Be="BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE",Ke="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE",be="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE",xe="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE",ye="BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE",ve="AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE",Ye="BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE",we="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE",Qe="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE",Xe="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE",We="BOGUS_DOCTYPE_STATE",Ve="CDATA_SECTION_STATE",je="CDATA_SECTION_BRACKET_STATE",ze="CDATA_SECTION_END_STATE",qe="CHARACTER_REFERENCE_STATE",Je="NAMED_CHARACTER_REFERENCE_STATE",Ze="AMBIGUOS_AMPERSAND_STATE",$e="NUMERIC_CHARACTER_REFERENCE_STATE",et="HEXADEMICAL_CHARACTER_REFERENCE_START_STATE",tt="DECIMAL_CHARACTER_REFERENCE_START_STATE",nt="HEXADEMICAL_CHARACTER_REFERENCE_STATE",st="DECIMAL_CHARACTER_REFERENCE_STATE",rt="NUMERIC_CHARACTER_REFERENCE_END_STATE";function it(e){return e===P.SPACE||e===P.LINE_FEED||e===P.TABULATION||e===P.FORM_FEED}function ot(e){return e>=P.DIGIT_0&&e<=P.DIGIT_9}function at(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_Z}function Tt(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_Z}function Et(e){return Tt(e)||at(e)}function ht(e){return Et(e)||ot(e)}function ct(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_F}function _t(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_F}function lt(e){return e+32}function mt(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(e>>>10&1023|55296)+String.fromCharCode(56320|1023&e))}function pt(e){return String.fromCharCode(lt(e))}function At(e,t){const n=g[++e];let s=++e,r=s+n-1;for(;s<=r;){const e=s+r>>>1,i=g[e];if(i<t)s=e+1;else {if(!(i>t))return g[e+n];r=e-1;}}return -1}class ut{constructor(){this.preprocessor=new class{constructor(){this.html=null,this.pos=-1,this.lastGapPos=-1,this.lastCharPos=-1,this.gapStack=[],this.skipNextNewLine=!1,this.lastChunkWritten=!1,this.endOfChunkHit=!1,this.bufferWaterline=65536;}_err(){}_addGap(){this.gapStack.push(this.lastGapPos),this.lastGapPos=this.pos;}_processSurrogate(e){if(this.pos!==this.lastCharPos){const t=this.html.charCodeAt(this.pos+1);if(function(e){return e>=56320&&e<=57343}(t))return this.pos++,this._addGap(),1024*(e-55296)+9216+t}else if(!this.lastChunkWritten)return this.endOfChunkHit=!0,M.EOF;return this._err("surrogate-in-input-stream"),e}dropParsedChunk(){this.pos>this.bufferWaterline&&(this.lastCharPos-=this.pos,this.html=this.html.substring(this.pos),this.pos=0,this.lastGapPos=-1,this.gapStack=[]);}write(e,t){this.html?this.html+=e:this.html=e,this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1,this.lastChunkWritten=t;}insertHtmlAtCurrentPos(e){this.html=this.html.substring(0,this.pos+1)+e+this.html.substring(this.pos+1,this.html.length),this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1;}advance(){if(this.pos++,this.pos>this.lastCharPos)return this.endOfChunkHit=!this.lastChunkWritten,M.EOF;let e=this.html.charCodeAt(this.pos);return this.skipNextNewLine&&e===M.LINE_FEED?(this.skipNextNewLine=!1,this._addGap(),this.advance()):e===M.CARRIAGE_RETURN?(this.skipNextNewLine=!0,M.LINE_FEED):(this.skipNextNewLine=!1,r(e)&&(e=this._processSurrogate(e)),e>31&&e<127||e===M.LINE_FEED||e===M.CARRIAGE_RETURN||e>159&&e<64976||this._checkForProblematicCharacters(e),e)}_checkForProblematicCharacters(e){i(e)?this._err("control-character-in-input-stream"):o(e)&&this._err("noncharacter-in-input-stream");}retreat(){this.pos===this.lastGapPos&&(this.lastGapPos=this.gapStack.pop(),this.pos--),this.pos--;}},this.tokenQueue=[],this.allowCDATA=!1,this.state=F,this.returnState="",this.charRefCode=-1,this.tempBuff=[],this.lastStartTagName="",this.consumedAfterSnapshot=-1,this.active=!1,this.currentCharacterToken=null,this.currentToken=null,this.currentAttr=null;}_err(){}_errOnNextCodePoint(e){this._consume(),this._err(e),this._unconsume();}getNextToken(){for(;!this.tokenQueue.length&&this.active;){this.consumedAfterSnapshot=0;const e=this._consume();this._ensureHibernation()||this[this.state](e);}return this.tokenQueue.shift()}write(e,t){this.active=!0,this.preprocessor.write(e,t);}insertHtmlAtCurrentPos(e){this.active=!0,this.preprocessor.insertHtmlAtCurrentPos(e);}_ensureHibernation(){if(this.preprocessor.endOfChunkHit){for(;this.consumedAfterSnapshot>0;this.consumedAfterSnapshot--)this.preprocessor.retreat();return this.active=!1,this.tokenQueue.push({type:ut.HIBERNATION_TOKEN}),!0}return !1}_consume(){return this.consumedAfterSnapshot++,this.preprocessor.advance()}_unconsume(){this.consumedAfterSnapshot--,this.preprocessor.retreat();}_reconsumeInState(e){this.state=e,this._unconsume();}_consumeSequenceIfMatch(e,t,n){let s=0,r=!0;const i=e.length;let o=0,a=t,T=void 0;for(;o<i;o++){if(o>0&&(a=this._consume(),s++),a===P.EOF){r=!1;break}if(T=e[o],a!==T&&(n||a!==lt(T))){r=!1;break}}if(!r)for(;s--;)this._unconsume();return r}_isTempBufferEqualToScriptString(){if(this.tempBuff.length!==H.SCRIPT_STRING.length)return !1;for(let e=0;e<this.tempBuff.length;e++)if(this.tempBuff[e]!==H.SCRIPT_STRING[e])return !1;return !0}_createStartTagToken(){this.currentToken={type:ut.START_TAG_TOKEN,tagName:"",selfClosing:!1,ackSelfClosing:!1,attrs:[]};}_createEndTagToken(){this.currentToken={type:ut.END_TAG_TOKEN,tagName:"",selfClosing:!1,attrs:[]};}_createCommentToken(){this.currentToken={type:ut.COMMENT_TOKEN,data:""};}_createDoctypeToken(e){this.currentToken={type:ut.DOCTYPE_TOKEN,name:e,forceQuirks:!1,publicId:null,systemId:null};}_createCharacterToken(e,t){this.currentCharacterToken={type:e,chars:t};}_createEOFToken(){this.currentToken={type:ut.EOF_TOKEN};}_createAttr(e){this.currentAttr={name:e,value:""};}_leaveAttrName(e){null===ut.getTokenAttr(this.currentToken,this.currentAttr.name)?this.currentToken.attrs.push(this.currentAttr):this._err("duplicate-attribute"),this.state=e;}_leaveAttrValue(e){this.state=e;}_emitCurrentToken(){this._emitCurrentCharacterToken();const e=this.currentToken;this.currentToken=null,e.type===ut.START_TAG_TOKEN?this.lastStartTagName=e.tagName:e.type===ut.END_TAG_TOKEN&&(e.attrs.length>0&&this._err("end-tag-with-attributes"),e.selfClosing&&this._err("end-tag-with-trailing-solidus")),this.tokenQueue.push(e);}_emitCurrentCharacterToken(){this.currentCharacterToken&&(this.tokenQueue.push(this.currentCharacterToken),this.currentCharacterToken=null);}_emitEOFToken(){this._createEOFToken(),this._emitCurrentToken();}_appendCharToCurrentCharacterToken(e,t){this.currentCharacterToken&&this.currentCharacterToken.type!==e&&this._emitCurrentCharacterToken(),this.currentCharacterToken?this.currentCharacterToken.chars+=t:this._createCharacterToken(e,t);}_emitCodePoint(e){let t=ut.CHARACTER_TOKEN;it(e)?t=ut.WHITESPACE_CHARACTER_TOKEN:e===P.NULL&&(t=ut.NULL_CHARACTER_TOKEN),this._appendCharToCurrentCharacterToken(t,mt(e));}_emitSeveralCodePoints(e){for(let t=0;t<e.length;t++)this._emitCodePoint(e[t]);}_emitChars(e){this._appendCharToCurrentCharacterToken(ut.CHARACTER_TOKEN,e);}_matchNamedCharacterReference(e){let t=null,n=1,s=At(0,e);for(this.tempBuff.push(e);s>-1;){const e=g[s],r=e<7;r&&1&e&&(t=2&e?[g[++s],g[++s]]:[g[++s]],n=0);const i=this._consume();if(this.tempBuff.push(i),n++,i===P.EOF)break;s=r?4&e?At(s,i):-1:i===e?++s:-1;}for(;n--;)this.tempBuff.pop(),this._unconsume();return t}_isCharacterReferenceInAttribute(){return this.returnState===me||this.returnState===pe||this.returnState===Ae}_isCharacterReferenceAttributeQuirk(e){if(!e&&this._isCharacterReferenceInAttribute()){const e=this._consume();return this._unconsume(),e===P.EQUALS_SIGN||ht(e)}return !1}_flushCodePointsConsumedAsCharacterReference(){if(this._isCharacterReferenceInAttribute())for(let e=0;e<this.tempBuff.length;e++)this.currentAttr.value+=mt(this.tempBuff[e]);else this._emitSeveralCodePoints(this.tempBuff);this.tempBuff=[];}[F](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=b:e===P.AMPERSAND?(this.returnState=F,this.state=qe):e===P.NULL?(this._err(a),this._emitCodePoint(e)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[U](e){this.preprocessor.dropParsedChunk(),e===P.AMPERSAND?(this.returnState=U,this.state=qe):e===P.LESS_THAN_SIGN?this.state=v:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[G](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=Q:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[B](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=V:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[K](e){this.preprocessor.dropParsedChunk(),e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[b](e){e===P.EXCLAMATION_MARK?this.state=Ce:e===P.SOLIDUS?this.state=x:Et(e)?(this._createStartTagToken(),this._reconsumeInState(y)):e===P.QUESTION_MARK?(this._err("unexpected-question-mark-instead-of-tag-name"),this._createCommentToken(),this._reconsumeInState(de)):e===P.EOF?(this._err(h),this._emitChars("<"),this._emitEOFToken()):(this._err(T),this._emitChars("<"),this._reconsumeInState(F));}[x](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(y)):e===P.GREATER_THAN_SIGN?(this._err("missing-end-tag-name"),this.state=F):e===P.EOF?(this._err(h),this._emitChars("</"),this._emitEOFToken()):(this._err(T),this._createCommentToken(),this._reconsumeInState(de));}[y](e){it(e)?this.state=he:e===P.SOLIDUS?this.state=Ne:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.tagName+=pt(e):e===P.NULL?(this._err(a),this.currentToken.tagName+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentToken.tagName+=mt(e);}[v](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Y):(this._emitChars("<"),this._reconsumeInState(U));}[Y](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(w)):(this._emitChars("</"),this._reconsumeInState(U));}[w](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this.state=F,void this._emitCurrentToken()}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(U);}}[Q](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=X):(this._emitChars("<"),this._reconsumeInState(G));}[X](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(W)):(this._emitChars("</"),this._reconsumeInState(G));}[W](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(G);}}[V](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=j):e===P.EXCLAMATION_MARK?(this.state=q,this._emitChars("<!")):(this._emitChars("<"),this._reconsumeInState(B));}[j](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(z)):(this._emitChars("</"),this._reconsumeInState(B));}[z](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(B);}}[q](e){e===P.HYPHEN_MINUS?(this.state=J,this._emitChars("-")):this._reconsumeInState(B);}[J](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):this._reconsumeInState(B);}[Z](e){e===P.HYPHEN_MINUS?(this.state=$,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[$](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[ee](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?this.state=te:e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=ne):Et(e)?(this.tempBuff=[],this._emitChars("<"),this._reconsumeInState(re)):(this._emitChars("<"),this._reconsumeInState(Z));}[ne](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(se)):(this._emitChars("</"),this._reconsumeInState(Z));}[se](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(Z);}}[re](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?ie:Z,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(Z);}[ie](e){e===P.HYPHEN_MINUS?(this.state=oe,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[oe](e){e===P.HYPHEN_MINUS?(this.state=ae,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[ae](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[Te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Ee,this._emitChars("/")):this._reconsumeInState(ie);}[Ee](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?Z:ie,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(ie);}[he](e){it(e)||(e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?this._reconsumeInState(_e):e===P.EQUALS_SIGN?(this._err("unexpected-equals-sign-before-attribute-name"),this._createAttr("="),this.state=ce):(this._createAttr(""),this._reconsumeInState(ce)));}[ce](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?(this._leaveAttrName(_e),this._unconsume()):e===P.EQUALS_SIGN?this._leaveAttrName(le):at(e)?this.currentAttr.name+=pt(e):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN?(this._err("unexpected-character-in-attribute-name"),this.currentAttr.name+=mt(e)):e===P.NULL?(this._err(a),this.currentAttr.name+=n):this.currentAttr.name+=mt(e);}[_e](e){it(e)||(e===P.SOLIDUS?this.state=Ne:e===P.EQUALS_SIGN?this.state=le:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._createAttr(""),this._reconsumeInState(ce)));}[le](e){it(e)||(e===P.QUOTATION_MARK?this.state=me:e===P.APOSTROPHE?this.state=pe:e===P.GREATER_THAN_SIGN?(this._err("missing-attribute-value"),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Ae));}[me](e){e===P.QUOTATION_MARK?this.state=ue:e===P.AMPERSAND?(this.returnState=me,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[pe](e){e===P.APOSTROPHE?this.state=ue:e===P.AMPERSAND?(this.returnState=pe,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[Ae](e){it(e)?this._leaveAttrValue(he):e===P.AMPERSAND?(this.returnState=Ae,this.state=qe):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN||e===P.EQUALS_SIGN||e===P.GRAVE_ACCENT?(this._err("unexpected-character-in-unquoted-attribute-value"),this.currentAttr.value+=mt(e)):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[ue](e){it(e)?this._leaveAttrValue(he):e===P.SOLIDUS?this._leaveAttrValue(Ne):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("missing-whitespace-between-attributes"),this._reconsumeInState(he));}[Ne](e){e===P.GREATER_THAN_SIGN?(this.currentToken.selfClosing=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("unexpected-solidus-in-tag"),this._reconsumeInState(he));}[de](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._emitCurrentToken(),this._emitEOFToken()):e===P.NULL?(this._err(a),this.currentToken.data+=n):this.currentToken.data+=mt(e);}[Ce](e){this._consumeSequenceIfMatch(H.DASH_DASH_STRING,e,!0)?(this._createCommentToken(),this.state=Oe):this._consumeSequenceIfMatch(H.DOCTYPE_STRING,e,!1)?this.state=He:this._consumeSequenceIfMatch(H.CDATA_START_STRING,e,!0)?this.allowCDATA?this.state=Ve:(this._err("cdata-in-html-content"),this._createCommentToken(),this.currentToken.data="[CDATA[",this.state=de):this._ensureHibernation()||(this._err("incorrectly-opened-comment"),this._createCommentToken(),this._reconsumeInState(de));}[Oe](e){e===P.HYPHEN_MINUS?this.state=fe:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Se);}[fe](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[Se](e){e===P.HYPHEN_MINUS?this.state=Me:e===P.LESS_THAN_SIGN?(this.currentToken.data+="<",this.state=Re):e===P.NULL?(this._err(a),this.currentToken.data+=n):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.data+=mt(e);}[Re](e){e===P.EXCLAMATION_MARK?(this.currentToken.data+="!",this.state=Ie):e===P.LESS_THAN_SIGN?this.currentToken.data+="!":this._reconsumeInState(Se);}[Ie](e){e===P.HYPHEN_MINUS?this.state=Le:this._reconsumeInState(Se);}[Le](e){e===P.HYPHEN_MINUS?this.state=ke:this._reconsumeInState(Me);}[ke](e){e!==P.GREATER_THAN_SIGN&&e!==P.EOF&&this._err("nested-comment"),this._reconsumeInState(ge);}[Me](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[ge](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EXCLAMATION_MARK?this.state=Pe:e===P.HYPHEN_MINUS?this.currentToken.data+="-":e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--",this._reconsumeInState(Se));}[Pe](e){e===P.HYPHEN_MINUS?(this.currentToken.data+="--!",this.state=Me):e===P.GREATER_THAN_SIGN?(this._err("incorrectly-closed-comment"),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--!",this._reconsumeInState(Se));}[He](e){it(e)?this.state=De:e===P.GREATER_THAN_SIGN?this._reconsumeInState(De):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-whitespace-before-doctype-name"),this._reconsumeInState(De));}[De](e){it(e)||(at(e)?(this._createDoctypeToken(pt(e)),this.state=Fe):e===P.NULL?(this._err(a),this._createDoctypeToken(n),this.state=Fe):e===P.GREATER_THAN_SIGN?(this._err("missing-doctype-name"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._createDoctypeToken(mt(e)),this.state=Fe));}[Fe](e){it(e)?this.state=Ue:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.name+=pt(e):e===P.NULL?(this._err(a),this.currentToken.name+=n):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.name+=mt(e);}[Ue](e){it(e)||(e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this._consumeSequenceIfMatch(H.PUBLIC_STRING,e,!1)?this.state=Ge:this._consumeSequenceIfMatch(H.SYSTEM_STRING,e,!1)?this.state=ve:this._ensureHibernation()||(this._err("invalid-character-sequence-after-doctype-name"),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ge](e){it(e)?this.state=Be:e===P.QUOTATION_MARK?(this._err(_),this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this._err(_),this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Be](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ke](e){e===P.QUOTATION_MARK?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[be](e){e===P.APOSTROPHE?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[xe](e){it(e)?this.state=ye:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.QUOTATION_MARK?(this._err(l),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(l),this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[ye](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[ve](e){it(e)?this.state=Ye:e===P.QUOTATION_MARK?(this._err(m),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(m),this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Ye](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[we](e){e===P.QUOTATION_MARK?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Qe](e){e===P.APOSTROPHE?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Xe](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("unexpected-character-after-doctype-system-identifier"),this._reconsumeInState(We)));}[We](e){e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.NULL?this._err(a):e===P.EOF&&(this._emitCurrentToken(),this._emitEOFToken());}[Ve](e){e===P.RIGHT_SQUARE_BRACKET?this.state=je:e===P.EOF?(this._err("eof-in-cdata"),this._emitEOFToken()):this._emitCodePoint(e);}[je](e){e===P.RIGHT_SQUARE_BRACKET?this.state=ze:(this._emitChars("]"),this._reconsumeInState(Ve));}[ze](e){e===P.GREATER_THAN_SIGN?this.state=F:e===P.RIGHT_SQUARE_BRACKET?this._emitChars("]"):(this._emitChars("]]"),this._reconsumeInState(Ve));}[qe](e){this.tempBuff=[P.AMPERSAND],e===P.NUMBER_SIGN?(this.tempBuff.push(e),this.state=$e):ht(e)?this._reconsumeInState(Je):(this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[Je](e){const t=this._matchNamedCharacterReference(e);if(this._ensureHibernation())this.tempBuff=[P.AMPERSAND];else if(t){const e=this.tempBuff[this.tempBuff.length-1]===P.SEMICOLON;this._isCharacterReferenceAttributeQuirk(e)||(e||this._errOnNextCodePoint(E),this.tempBuff=t),this._flushCodePointsConsumedAsCharacterReference(),this.state=this.returnState;}else this._flushCodePointsConsumedAsCharacterReference(),this.state=Ze;}[Ze](e){ht(e)?this._isCharacterReferenceInAttribute()?this.currentAttr.value+=mt(e):this._emitCodePoint(e):(e===P.SEMICOLON&&this._err("unknown-named-character-reference"),this._reconsumeInState(this.returnState));}[$e](e){this.charRefCode=0,e===P.LATIN_SMALL_X||e===P.LATIN_CAPITAL_X?(this.tempBuff.push(e),this.state=et):this._reconsumeInState(tt);}[et](e){!function(e){return ot(e)||ct(e)||_t(e)}(e)?(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState)):this._reconsumeInState(nt);}[tt](e){ot(e)?this._reconsumeInState(st):(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[nt](e){ct(e)?this.charRefCode=16*this.charRefCode+e-55:_t(e)?this.charRefCode=16*this.charRefCode+e-87:ot(e)?this.charRefCode=16*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[st](e){ot(e)?this.charRefCode=10*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[rt](){if(this.charRefCode===P.NULL)this._err("null-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(this.charRefCode>1114111)this._err("character-reference-outside-unicode-range"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(r(this.charRefCode))this._err("surrogate-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(o(this.charRefCode))this._err("noncharacter-character-reference");else if(i(this.charRefCode)||this.charRefCode===P.CARRIAGE_RETURN){this._err("control-character-reference");const e=D[this.charRefCode];e&&(this.charRefCode=e);}this.tempBuff=[this.charRefCode],this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState);}}ut.CHARACTER_TOKEN="CHARACTER_TOKEN",ut.NULL_CHARACTER_TOKEN="NULL_CHARACTER_TOKEN",ut.WHITESPACE_CHARACTER_TOKEN="WHITESPACE_CHARACTER_TOKEN",ut.START_TAG_TOKEN="START_TAG_TOKEN",ut.END_TAG_TOKEN="END_TAG_TOKEN",ut.COMMENT_TOKEN="COMMENT_TOKEN",ut.DOCTYPE_TOKEN="DOCTYPE_TOKEN",ut.EOF_TOKEN="EOF_TOKEN",ut.HIBERNATION_TOKEN="HIBERNATION_TOKEN",ut.MODE={DATA:F,RCDATA:U,RAWTEXT:G,SCRIPT_DATA:B,PLAINTEXT:K},ut.getTokenAttr=function(e,t){for(let n=e.attrs.length-1;n>=0;n--)if(e.attrs[n].name===t)return e.attrs[n].value;return null};var Nt=ut;function dt(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var Ct=dt((function(e,t){const n=t.NAMESPACES={HTML:"http://www.w3.org/1999/xhtml",MATHML:"http://www.w3.org/1998/Math/MathML",SVG:"http://www.w3.org/2000/svg",XLINK:"http://www.w3.org/1999/xlink",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"};t.ATTRS={TYPE:"type",ACTION:"action",ENCODING:"encoding",PROMPT:"prompt",NAME:"name",COLOR:"color",FACE:"face",SIZE:"size"},t.DOCUMENT_MODE={NO_QUIRKS:"no-quirks",QUIRKS:"quirks",LIMITED_QUIRKS:"limited-quirks"};const s=t.TAG_NAMES={A:"a",ADDRESS:"address",ANNOTATION_XML:"annotation-xml",APPLET:"applet",AREA:"area",ARTICLE:"article",ASIDE:"aside",B:"b",BASE:"base",BASEFONT:"basefont",BGSOUND:"bgsound",BIG:"big",BLOCKQUOTE:"blockquote",BODY:"body",BR:"br",BUTTON:"button",CAPTION:"caption",CENTER:"center",CODE:"code",COL:"col",COLGROUP:"colgroup",DD:"dd",DESC:"desc",DETAILS:"details",DIALOG:"dialog",DIR:"dir",DIV:"div",DL:"dl",DT:"dt",EM:"em",EMBED:"embed",FIELDSET:"fieldset",FIGCAPTION:"figcaption",FIGURE:"figure",FONT:"font",FOOTER:"footer",FOREIGN_OBJECT:"foreignObject",FORM:"form",FRAME:"frame",FRAMESET:"frameset",H1:"h1",H2:"h2",H3:"h3",H4:"h4",H5:"h5",H6:"h6",HEAD:"head",HEADER:"header",HGROUP:"hgroup",HR:"hr",HTML:"html",I:"i",IMG:"img",IMAGE:"image",INPUT:"input",IFRAME:"iframe",KEYGEN:"keygen",LABEL:"label",LI:"li",LINK:"link",LISTING:"listing",MAIN:"main",MALIGNMARK:"malignmark",MARQUEE:"marquee",MATH:"math",MENU:"menu",META:"meta",MGLYPH:"mglyph",MI:"mi",MO:"mo",MN:"mn",MS:"ms",MTEXT:"mtext",NAV:"nav",NOBR:"nobr",NOFRAMES:"noframes",NOEMBED:"noembed",NOSCRIPT:"noscript",OBJECT:"object",OL:"ol",OPTGROUP:"optgroup",OPTION:"option",P:"p",PARAM:"param",PLAINTEXT:"plaintext",PRE:"pre",RB:"rb",RP:"rp",RT:"rt",RTC:"rtc",RUBY:"ruby",S:"s",SCRIPT:"script",SECTION:"section",SELECT:"select",SOURCE:"source",SMALL:"small",SPAN:"span",STRIKE:"strike",STRONG:"strong",STYLE:"style",SUB:"sub",SUMMARY:"summary",SUP:"sup",TABLE:"table",TBODY:"tbody",TEMPLATE:"template",TEXTAREA:"textarea",TFOOT:"tfoot",TD:"td",TH:"th",THEAD:"thead",TITLE:"title",TR:"tr",TRACK:"track",TT:"tt",U:"u",UL:"ul",SVG:"svg",VAR:"var",WBR:"wbr",XMP:"xmp"};t.SPECIAL_ELEMENTS={[n.HTML]:{[s.ADDRESS]:!0,[s.APPLET]:!0,[s.AREA]:!0,[s.ARTICLE]:!0,[s.ASIDE]:!0,[s.BASE]:!0,[s.BASEFONT]:!0,[s.BGSOUND]:!0,[s.BLOCKQUOTE]:!0,[s.BODY]:!0,[s.BR]:!0,[s.BUTTON]:!0,[s.CAPTION]:!0,[s.CENTER]:!0,[s.COL]:!0,[s.COLGROUP]:!0,[s.DD]:!0,[s.DETAILS]:!0,[s.DIR]:!0,[s.DIV]:!0,[s.DL]:!0,[s.DT]:!0,[s.EMBED]:!0,[s.FIELDSET]:!0,[s.FIGCAPTION]:!0,[s.FIGURE]:!0,[s.FOOTER]:!0,[s.FORM]:!0,[s.FRAME]:!0,[s.FRAMESET]:!0,[s.H1]:!0,[s.H2]:!0,[s.H3]:!0,[s.H4]:!0,[s.H5]:!0,[s.H6]:!0,[s.HEAD]:!0,[s.HEADER]:!0,[s.HGROUP]:!0,[s.HR]:!0,[s.HTML]:!0,[s.IFRAME]:!0,[s.IMG]:!0,[s.INPUT]:!0,[s.LI]:!0,[s.LINK]:!0,[s.LISTING]:!0,[s.MAIN]:!0,[s.MARQUEE]:!0,[s.MENU]:!0,[s.META]:!0,[s.NAV]:!0,[s.NOEMBED]:!0,[s.NOFRAMES]:!0,[s.NOSCRIPT]:!0,[s.OBJECT]:!0,[s.OL]:!0,[s.P]:!0,[s.PARAM]:!0,[s.PLAINTEXT]:!0,[s.PRE]:!0,[s.SCRIPT]:!0,[s.SECTION]:!0,[s.SELECT]:!0,[s.SOURCE]:!0,[s.STYLE]:!0,[s.SUMMARY]:!0,[s.TABLE]:!0,[s.TBODY]:!0,[s.TD]:!0,[s.TEMPLATE]:!0,[s.TEXTAREA]:!0,[s.TFOOT]:!0,[s.TH]:!0,[s.THEAD]:!0,[s.TITLE]:!0,[s.TR]:!0,[s.TRACK]:!0,[s.UL]:!0,[s.WBR]:!0,[s.XMP]:!0},[n.MATHML]:{[s.MI]:!0,[s.MO]:!0,[s.MN]:!0,[s.MS]:!0,[s.MTEXT]:!0,[s.ANNOTATION_XML]:!0},[n.SVG]:{[s.TITLE]:!0,[s.FOREIGN_OBJECT]:!0,[s.DESC]:!0}};}));const Ot=Ct.TAG_NAMES,ft=Ct.NAMESPACES;function St(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI;case 3:return e===Ot.RTC;case 6:return e===Ot.OPTION;case 8:return e===Ot.OPTGROUP}return !1}function Rt(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI||e===Ot.TD||e===Ot.TH||e===Ot.TR;case 3:return e===Ot.RTC;case 5:return e===Ot.TBODY||e===Ot.TFOOT||e===Ot.THEAD;case 6:return e===Ot.OPTION;case 7:return e===Ot.CAPTION;case 8:return e===Ot.OPTGROUP||e===Ot.COLGROUP}return !1}function It(e,t){switch(e.length){case 2:if(e===Ot.TD||e===Ot.TH)return t===ft.HTML;if(e===Ot.MI||e===Ot.MO||e===Ot.MN||e===Ot.MS)return t===ft.MATHML;break;case 4:if(e===Ot.HTML)return t===ft.HTML;if(e===Ot.DESC)return t===ft.SVG;break;case 5:if(e===Ot.TABLE)return t===ft.HTML;if(e===Ot.MTEXT)return t===ft.MATHML;if(e===Ot.TITLE)return t===ft.SVG;break;case 6:return (e===Ot.APPLET||e===Ot.OBJECT)&&t===ft.HTML;case 7:return (e===Ot.CAPTION||e===Ot.MARQUEE)&&t===ft.HTML;case 8:return e===Ot.TEMPLATE&&t===ft.HTML;case 13:return e===Ot.FOREIGN_OBJECT&&t===ft.SVG;case 14:return e===Ot.ANNOTATION_XML&&t===ft.MATHML}return !1}class Lt{constructor(e){this.length=0,this.entries=[],this.treeAdapter=e,this.bookmark=null;}_getNoahArkConditionCandidates(e){const t=[];if(this.length>=3){const n=this.treeAdapter.getAttrList(e).length,s=this.treeAdapter.getTagName(e),r=this.treeAdapter.getNamespaceURI(e);for(let e=this.length-1;e>=0;e--){const i=this.entries[e];if(i.type===Lt.MARKER_ENTRY)break;const o=i.element,a=this.treeAdapter.getAttrList(o);this.treeAdapter.getTagName(o)===s&&this.treeAdapter.getNamespaceURI(o)===r&&a.length===n&&t.push({idx:e,attrs:a});}}return t.length<3?[]:t}_ensureNoahArkCondition(e){const t=this._getNoahArkConditionCandidates(e);let n=t.length;if(n){const s=this.treeAdapter.getAttrList(e),r=s.length,i=Object.create(null);for(let e=0;e<r;e++){const t=s[e];i[t.name]=t.value;}for(let e=0;e<r;e++)for(let s=0;s<n;s++){const r=t[s].attrs[e];if(i[r.name]!==r.value&&(t.splice(s,1),n--),t.length<3)return}for(let e=n-1;e>=2;e--)this.entries.splice(t[e].idx,1),this.length--;}}insertMarker(){this.entries.push({type:Lt.MARKER_ENTRY}),this.length++;}pushElement(e,t){this._ensureNoahArkCondition(e),this.entries.push({type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}insertElementAfterBookmark(e,t){let n=this.length-1;for(;n>=0&&this.entries[n]!==this.bookmark;n--);this.entries.splice(n+1,0,{type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}removeEntry(e){for(let t=this.length-1;t>=0;t--)if(this.entries[t]===e){this.entries.splice(t,1),this.length--;break}}clearToLastMarker(){for(;this.length;){const e=this.entries.pop();if(this.length--,e.type===Lt.MARKER_ENTRY)break}}getElementEntryInScopeWithTagName(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.MARKER_ENTRY)return null;if(this.treeAdapter.getTagName(n.element)===e)return n}return null}getElementEntry(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.ELEMENT_ENTRY&&n.element===e)return n}return null}}Lt.MARKER_ENTRY="MARKER_ENTRY",Lt.ELEMENT_ENTRY="ELEMENT_ENTRY";var kt=Lt;class Mt{constructor(e){const t={},n=this._getOverriddenMethods(this,t);for(const s of Object.keys(n))"function"==typeof n[s]&&(t[s]=e[s],e[s]=n[s]);}_getOverriddenMethods(){throw new Error("Not implemented")}}Mt.install=function(e,t,n){e.__mixins||(e.__mixins=[]);for(let n=0;n<e.__mixins.length;n++)if(e.__mixins[n].constructor===t)return e.__mixins[n];const s=new t(e,n);return e.__mixins.push(s),s};var gt=Mt,Pt=class extends gt{constructor(e){super(e),this.preprocessor=e,this.isEol=!1,this.lineStartPos=0,this.droppedBufferSize=0,this.offset=0,this.col=0,this.line=1;}_getOverriddenMethods(e,t){return {advance(){const n=this.pos+1,s=this.html[n];return e.isEol&&(e.isEol=!1,e.line++,e.lineStartPos=n),("\n"===s||"\r"===s&&"\n"!==this.html[n+1])&&(e.isEol=!0),e.col=n-e.lineStartPos+1,e.offset=e.droppedBufferSize+n,t.advance.call(this)},retreat(){t.retreat.call(this),e.isEol=!1,e.col=this.pos-e.lineStartPos+1;},dropParsedChunk(){const n=this.pos;t.dropParsedChunk.call(this);const s=n-this.pos;e.lineStartPos-=s,e.droppedBufferSize+=s,e.offset=e.droppedBufferSize+this.pos;}}}},Ht=class extends gt{constructor(e){super(e),this.tokenizer=e,this.posTracker=gt.install(e.preprocessor,Pt),this.currentAttrLocation=null,this.ctLoc=null;}_getCurrentLocation(){return {startLine:this.posTracker.line,startCol:this.posTracker.col,startOffset:this.posTracker.offset,endLine:-1,endCol:-1,endOffset:-1}}_attachCurrentAttrLocationInfo(){this.currentAttrLocation.endLine=this.posTracker.line,this.currentAttrLocation.endCol=this.posTracker.col,this.currentAttrLocation.endOffset=this.posTracker.offset;const e=this.tokenizer.currentToken,t=this.tokenizer.currentAttr;e.location.attrs||(e.location.attrs=Object.create(null)),e.location.attrs[t.name]=this.currentAttrLocation;}_getOverriddenMethods(e,t){const n={_createStartTagToken(){t._createStartTagToken.call(this),this.currentToken.location=e.ctLoc;},_createEndTagToken(){t._createEndTagToken.call(this),this.currentToken.location=e.ctLoc;},_createCommentToken(){t._createCommentToken.call(this),this.currentToken.location=e.ctLoc;},_createDoctypeToken(n){t._createDoctypeToken.call(this,n),this.currentToken.location=e.ctLoc;},_createCharacterToken(n,s){t._createCharacterToken.call(this,n,s),this.currentCharacterToken.location=e.ctLoc;},_createEOFToken(){t._createEOFToken.call(this),this.currentToken.location=e._getCurrentLocation();},_createAttr(n){t._createAttr.call(this,n),e.currentAttrLocation=e._getCurrentLocation();},_leaveAttrName(n){t._leaveAttrName.call(this,n),e._attachCurrentAttrLocationInfo();},_leaveAttrValue(n){t._leaveAttrValue.call(this,n),e._attachCurrentAttrLocationInfo();},_emitCurrentToken(){const n=this.currentToken.location;this.currentCharacterToken&&(this.currentCharacterToken.location.endLine=n.startLine,this.currentCharacterToken.location.endCol=n.startCol,this.currentCharacterToken.location.endOffset=n.startOffset),this.currentToken.type===Nt.EOF_TOKEN?(n.endLine=n.startLine,n.endCol=n.startCol,n.endOffset=n.startOffset):(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col+1,n.endOffset=e.posTracker.offset+1),t._emitCurrentToken.call(this);},_emitCurrentCharacterToken(){const n=this.currentCharacterToken&&this.currentCharacterToken.location;n&&-1===n.endOffset&&(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col,n.endOffset=e.posTracker.offset),t._emitCurrentCharacterToken.call(this);}};return Object.keys(Nt.MODE).forEach(s=>{const r=Nt.MODE[s];n[r]=function(n){e.ctLoc=e._getCurrentLocation(),t[r].call(this,n);};}),n}},Dt=class extends gt{constructor(e,t){super(e),this.onItemPop=t.onItemPop;}_getOverriddenMethods(e,t){return {pop(){e.onItemPop(this.current),t.pop.call(this);},popAllUpToHtmlElement(){for(let t=this.stackTop;t>0;t--)e.onItemPop(this.items[t]);t.popAllUpToHtmlElement.call(this);},remove(n){e.onItemPop(this.current),t.remove.call(this,n);}}}};const Ft=Ct.TAG_NAMES;var Ut=class extends gt{constructor(e){super(e),this.parser=e,this.treeAdapter=this.parser.treeAdapter,this.posTracker=null,this.lastStartTagToken=null,this.lastFosterParentingLocation=null,this.currentToken=null;}_setStartLocation(e){let t=null;this.lastStartTagToken&&(t=Object.assign({},this.lastStartTagToken.location),t.startTag=this.lastStartTagToken.location),this.treeAdapter.setNodeSourceCodeLocation(e,t);}_setEndLocation(e,t){if(this.treeAdapter.getNodeSourceCodeLocation(e)&&t.location){const n=t.location,s=this.treeAdapter.getTagName(e),r={};t.type===Nt.END_TAG_TOKEN&&s===t.tagName?(r.endTag=Object.assign({},n),r.endLine=n.endLine,r.endCol=n.endCol,r.endOffset=n.endOffset):(r.endLine=n.startLine,r.endCol=n.startCol,r.endOffset=n.startOffset),this.treeAdapter.updateNodeSourceCodeLocation(e,r);}}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),e.lastStartTagToken=null,e.lastFosterParentingLocation=null,e.currentToken=null;const r=gt.install(this.tokenizer,Ht);e.posTracker=r.posTracker,gt.install(this.openElements,Dt,{onItemPop:function(t){e._setEndLocation(t,e.currentToken);}});},_runParsingLoop(n){t._runParsingLoop.call(this,n);for(let t=this.openElements.stackTop;t>=0;t--)e._setEndLocation(this.openElements.items[t],e.currentToken);},_processTokenInForeignContent(n){e.currentToken=n,t._processTokenInForeignContent.call(this,n);},_processToken(n){if(e.currentToken=n,t._processToken.call(this,n),n.type===Nt.END_TAG_TOKEN&&(n.tagName===Ft.HTML||n.tagName===Ft.BODY&&this.openElements.hasInScope(Ft.BODY)))for(let t=this.openElements.stackTop;t>=0;t--){const s=this.openElements.items[t];if(this.treeAdapter.getTagName(s)===n.tagName){e._setEndLocation(s,n);break}}},_setDocumentType(e){t._setDocumentType.call(this,e);const n=this.treeAdapter.getChildNodes(this.document),s=n.length;for(let t=0;t<s;t++){const s=n[t];if(this.treeAdapter.isDocumentTypeNode(s)){this.treeAdapter.setNodeSourceCodeLocation(s,e.location);break}}},_attachElementToTree(n){e._setStartLocation(n),e.lastStartTagToken=null,t._attachElementToTree.call(this,n);},_appendElement(n,s){e.lastStartTagToken=n,t._appendElement.call(this,n,s);},_insertElement(n,s){e.lastStartTagToken=n,t._insertElement.call(this,n,s);},_insertTemplate(n){e.lastStartTagToken=n,t._insertTemplate.call(this,n);const s=this.treeAdapter.getTemplateContent(this.openElements.current);this.treeAdapter.setNodeSourceCodeLocation(s,null);},_insertFakeRootElement(){t._insertFakeRootElement.call(this),this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current,null);},_appendCommentNode(e,n){t._appendCommentNode.call(this,e,n);const s=this.treeAdapter.getChildNodes(n),r=s[s.length-1];this.treeAdapter.setNodeSourceCodeLocation(r,e.location);},_findFosterParentingLocation(){return e.lastFosterParentingLocation=t._findFosterParentingLocation.call(this),e.lastFosterParentingLocation},_insertCharacters(n){t._insertCharacters.call(this,n);const s=this._shouldFosterParentOnInsertion(),r=s&&e.lastFosterParentingLocation.parent||this.openElements.currentTmplContent||this.openElements.current,i=this.treeAdapter.getChildNodes(r),o=s&&e.lastFosterParentingLocation.beforeElement?i.indexOf(e.lastFosterParentingLocation.beforeElement)-1:i.length-1,a=i[o];if(this.treeAdapter.getNodeSourceCodeLocation(a)){const{endLine:e,endCol:t,endOffset:s}=n.location;this.treeAdapter.updateNodeSourceCodeLocation(a,{endLine:e,endCol:t,endOffset:s});}else this.treeAdapter.setNodeSourceCodeLocation(a,n.location);}}}},Gt=class extends gt{constructor(e,t){super(e),this.posTracker=null,this.onParseError=t.onParseError;}_setErrorLocation(e){e.startLine=e.endLine=this.posTracker.line,e.startCol=e.endCol=this.posTracker.col,e.startOffset=e.endOffset=this.posTracker.offset;}_reportError(e){const t={code:e,startLine:-1,startCol:-1,startOffset:-1,endLine:-1,endCol:-1,endOffset:-1};this._setErrorLocation(t),this.onParseError(t);}_getOverriddenMethods(e){return {_err(t){e._reportError(t);}}}},Bt=class extends Gt{constructor(e,t){super(e,t),this.posTracker=gt.install(e,Pt),this.lastErrOffset=-1;}_reportError(e){this.lastErrOffset!==this.posTracker.offset&&(this.lastErrOffset=this.posTracker.offset,super._reportError(e));}},Kt=class extends Gt{constructor(e,t){super(e,t);const n=gt.install(e.preprocessor,Bt,t);this.posTracker=n.posTracker;}},bt=class extends Gt{constructor(e,t){super(e,t),this.opts=t,this.ctLoc=null,this.locBeforeToken=!1;}_setErrorLocation(e){this.ctLoc&&(e.startLine=this.ctLoc.startLine,e.startCol=this.ctLoc.startCol,e.startOffset=this.ctLoc.startOffset,e.endLine=this.locBeforeToken?this.ctLoc.startLine:this.ctLoc.endLine,e.endCol=this.locBeforeToken?this.ctLoc.startCol:this.ctLoc.endCol,e.endOffset=this.locBeforeToken?this.ctLoc.startOffset:this.ctLoc.endOffset);}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),gt.install(this.tokenizer,Kt,e.opts),gt.install(this.tokenizer,Ht);},_processInputToken(n){e.ctLoc=n.location,t._processInputToken.call(this,n);},_err(t,n){e.locBeforeToken=n&&n.beforeToken,e._reportError(t);}}}},xt=dt((function(e,t){const{DOCUMENT_MODE:n}=Ct;t.createDocument=function(){return {nodeName:"#document",mode:n.NO_QUIRKS,childNodes:[]}},t.createDocumentFragment=function(){return {nodeName:"#document-fragment",childNodes:[]}},t.createElement=function(e,t,n){return {nodeName:e,tagName:e,attrs:n,namespaceURI:t,childNodes:[],parentNode:null}},t.createCommentNode=function(e){return {nodeName:"#comment",data:e,parentNode:null}};const s=function(e){return {nodeName:"#text",value:e,parentNode:null}},r=t.appendChild=function(e,t){e.childNodes.push(t),t.parentNode=e;},i=t.insertBefore=function(e,t,n){const s=e.childNodes.indexOf(n);e.childNodes.splice(s,0,t),t.parentNode=e;};t.setTemplateContent=function(e,t){e.content=t;},t.getTemplateContent=function(e){return e.content},t.setDocumentType=function(e,t,n,s){let i=null;for(let t=0;t<e.childNodes.length;t++)if("#documentType"===e.childNodes[t].nodeName){i=e.childNodes[t];break}i?(i.name=t,i.publicId=n,i.systemId=s):r(e,{nodeName:"#documentType",name:t,publicId:n,systemId:s});},t.setDocumentMode=function(e,t){e.mode=t;},t.getDocumentMode=function(e){return e.mode},t.detachNode=function(e){if(e.parentNode){const t=e.parentNode.childNodes.indexOf(e);e.parentNode.childNodes.splice(t,1),e.parentNode=null;}},t.insertText=function(e,t){if(e.childNodes.length){const n=e.childNodes[e.childNodes.length-1];if("#text"===n.nodeName)return void(n.value+=t)}r(e,s(t));},t.insertTextBefore=function(e,t,n){const r=e.childNodes[e.childNodes.indexOf(n)-1];r&&"#text"===r.nodeName?r.value+=t:i(e,s(t),n);},t.adoptAttributes=function(e,t){const n=[];for(let t=0;t<e.attrs.length;t++)n.push(e.attrs[t].name);for(let s=0;s<t.length;s++)-1===n.indexOf(t[s].name)&&e.attrs.push(t[s]);},t.getFirstChild=function(e){return e.childNodes[0]},t.getChildNodes=function(e){return e.childNodes},t.getParentNode=function(e){return e.parentNode},t.getAttrList=function(e){return e.attrs},t.getTagName=function(e){return e.tagName},t.getNamespaceURI=function(e){return e.namespaceURI},t.getTextNodeContent=function(e){return e.value},t.getCommentNodeContent=function(e){return e.data},t.getDocumentTypeNodeName=function(e){return e.name},t.getDocumentTypeNodePublicId=function(e){return e.publicId},t.getDocumentTypeNodeSystemId=function(e){return e.systemId},t.isTextNode=function(e){return "#text"===e.nodeName},t.isCommentNode=function(e){return "#comment"===e.nodeName},t.isDocumentTypeNode=function(e){return "#documentType"===e.nodeName},t.isElementNode=function(e){return !!e.tagName},t.setNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=t;},t.getNodeSourceCodeLocation=function(e){return e.sourceCodeLocation},t.updateNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=Object.assign(e.sourceCodeLocation,t);};}));const{DOCUMENT_MODE:yt}=Ct,vt="html",Yt=["+//silmaril//dtd html pro v0r11 19970101//","-//as//dtd html 3.0 aswedit + extensions//","-//advasoft ltd//dtd html 3.0 aswedit + extensions//","-//ietf//dtd html 2.0 level 1//","-//ietf//dtd html 2.0 level 2//","-//ietf//dtd html 2.0 strict level 1//","-//ietf//dtd html 2.0 strict level 2//","-//ietf//dtd html 2.0 strict//","-//ietf//dtd html 2.0//","-//ietf//dtd html 2.1e//","-//ietf//dtd html 3.0//","-//ietf//dtd html 3.2 final//","-//ietf//dtd html 3.2//","-//ietf//dtd html 3//","-//ietf//dtd html level 0//","-//ietf//dtd html level 1//","-//ietf//dtd html level 2//","-//ietf//dtd html level 3//","-//ietf//dtd html strict level 0//","-//ietf//dtd html strict level 1//","-//ietf//dtd html strict level 2//","-//ietf//dtd html strict level 3//","-//ietf//dtd html strict//","-//ietf//dtd html//","-//metrius//dtd metrius presentational//","-//microsoft//dtd internet explorer 2.0 html strict//","-//microsoft//dtd internet explorer 2.0 html//","-//microsoft//dtd internet explorer 2.0 tables//","-//microsoft//dtd internet explorer 3.0 html strict//","-//microsoft//dtd internet explorer 3.0 html//","-//microsoft//dtd internet explorer 3.0 tables//","-//netscape comm. corp.//dtd html//","-//netscape comm. corp.//dtd strict html//","-//o'reilly and associates//dtd html 2.0//","-//o'reilly and associates//dtd html extended 1.0//","-//o'reilly and associates//dtd html extended relaxed 1.0//","-//sq//dtd html 2.0 hotmetal + extensions//","-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//","-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//","-//spyglass//dtd html 2.0 extended//","-//sun microsystems corp.//dtd hotjava html//","-//sun microsystems corp.//dtd hotjava strict html//","-//w3c//dtd html 3 1995-03-24//","-//w3c//dtd html 3.2 draft//","-//w3c//dtd html 3.2 final//","-//w3c//dtd html 3.2//","-//w3c//dtd html 3.2s draft//","-//w3c//dtd html 4.0 frameset//","-//w3c//dtd html 4.0 transitional//","-//w3c//dtd html experimental 19960712//","-//w3c//dtd html experimental 970421//","-//w3c//dtd w3 html//","-//w3o//dtd w3 html 3.0//","-//webtechs//dtd mozilla html 2.0//","-//webtechs//dtd mozilla html//"],wt=Yt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]),Qt=["-//w3o//dtd w3 html strict 3.0//en//","-/w3c/dtd html 4.0 transitional/en","html"],Xt=["-//w3c//dtd xhtml 1.0 frameset//","-//w3c//dtd xhtml 1.0 transitional//"],Wt=Xt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]);function Vt(e,t){for(let n=0;n<t.length;n++)if(0===e.indexOf(t[n]))return !0;return !1}var jt=dt((function(e,t){const n=Ct.TAG_NAMES,s=Ct.NAMESPACES,r=Ct.ATTRS,i={attributename:"attributeName",attributetype:"attributeType",basefrequency:"baseFrequency",baseprofile:"baseProfile",calcmode:"calcMode",clippathunits:"clipPathUnits",diffuseconstant:"diffuseConstant",edgemode:"edgeMode",filterunits:"filterUnits",glyphref:"glyphRef",gradienttransform:"gradientTransform",gradientunits:"gradientUnits",kernelmatrix:"kernelMatrix",kernelunitlength:"kernelUnitLength",keypoints:"keyPoints",keysplines:"keySplines",keytimes:"keyTimes",lengthadjust:"lengthAdjust",limitingconeangle:"limitingConeAngle",markerheight:"markerHeight",markerunits:"markerUnits",markerwidth:"markerWidth",maskcontentunits:"maskContentUnits",maskunits:"maskUnits",numoctaves:"numOctaves",pathlength:"pathLength",patterncontentunits:"patternContentUnits",patterntransform:"patternTransform",patternunits:"patternUnits",pointsatx:"pointsAtX",pointsaty:"pointsAtY",pointsatz:"pointsAtZ",preservealpha:"preserveAlpha",preserveaspectratio:"preserveAspectRatio",primitiveunits:"primitiveUnits",refx:"refX",refy:"refY",repeatcount:"repeatCount",repeatdur:"repeatDur",requiredextensions:"requiredExtensions",requiredfeatures:"requiredFeatures",specularconstant:"specularConstant",specularexponent:"specularExponent",spreadmethod:"spreadMethod",startoffset:"startOffset",stddeviation:"stdDeviation",stitchtiles:"stitchTiles",surfacescale:"surfaceScale",systemlanguage:"systemLanguage",tablevalues:"tableValues",targetx:"targetX",targety:"targetY",textlength:"textLength",viewbox:"viewBox",viewtarget:"viewTarget",xchannelselector:"xChannelSelector",ychannelselector:"yChannelSelector",zoomandpan:"zoomAndPan"},o={"xlink:actuate":{prefix:"xlink",name:"actuate",namespace:s.XLINK},"xlink:arcrole":{prefix:"xlink",name:"arcrole",namespace:s.XLINK},"xlink:href":{prefix:"xlink",name:"href",namespace:s.XLINK},"xlink:role":{prefix:"xlink",name:"role",namespace:s.XLINK},"xlink:show":{prefix:"xlink",name:"show",namespace:s.XLINK},"xlink:title":{prefix:"xlink",name:"title",namespace:s.XLINK},"xlink:type":{prefix:"xlink",name:"type",namespace:s.XLINK},"xml:base":{prefix:"xml",name:"base",namespace:s.XML},"xml:lang":{prefix:"xml",name:"lang",namespace:s.XML},"xml:space":{prefix:"xml",name:"space",namespace:s.XML},xmlns:{prefix:"",name:"xmlns",namespace:s.XMLNS},"xmlns:xlink":{prefix:"xmlns",name:"xlink",namespace:s.XMLNS}},a=t.SVG_TAG_NAMES_ADJUSTMENT_MAP={altglyph:"altGlyph",altglyphdef:"altGlyphDef",altglyphitem:"altGlyphItem",animatecolor:"animateColor",animatemotion:"animateMotion",animatetransform:"animateTransform",clippath:"clipPath",feblend:"feBlend",fecolormatrix:"feColorMatrix",fecomponenttransfer:"feComponentTransfer",fecomposite:"feComposite",feconvolvematrix:"feConvolveMatrix",fediffuselighting:"feDiffuseLighting",fedisplacementmap:"feDisplacementMap",fedistantlight:"feDistantLight",feflood:"feFlood",fefunca:"feFuncA",fefuncb:"feFuncB",fefuncg:"feFuncG",fefuncr:"feFuncR",fegaussianblur:"feGaussianBlur",feimage:"feImage",femerge:"feMerge",femergenode:"feMergeNode",femorphology:"feMorphology",feoffset:"feOffset",fepointlight:"fePointLight",fespecularlighting:"feSpecularLighting",fespotlight:"feSpotLight",fetile:"feTile",feturbulence:"feTurbulence",foreignobject:"foreignObject",glyphref:"glyphRef",lineargradient:"linearGradient",radialgradient:"radialGradient",textpath:"textPath"},T={[n.B]:!0,[n.BIG]:!0,[n.BLOCKQUOTE]:!0,[n.BODY]:!0,[n.BR]:!0,[n.CENTER]:!0,[n.CODE]:!0,[n.DD]:!0,[n.DIV]:!0,[n.DL]:!0,[n.DT]:!0,[n.EM]:!0,[n.EMBED]:!0,[n.H1]:!0,[n.H2]:!0,[n.H3]:!0,[n.H4]:!0,[n.H5]:!0,[n.H6]:!0,[n.HEAD]:!0,[n.HR]:!0,[n.I]:!0,[n.IMG]:!0,[n.LI]:!0,[n.LISTING]:!0,[n.MENU]:!0,[n.META]:!0,[n.NOBR]:!0,[n.OL]:!0,[n.P]:!0,[n.PRE]:!0,[n.RUBY]:!0,[n.S]:!0,[n.SMALL]:!0,[n.SPAN]:!0,[n.STRONG]:!0,[n.STRIKE]:!0,[n.SUB]:!0,[n.SUP]:!0,[n.TABLE]:!0,[n.TT]:!0,[n.U]:!0,[n.UL]:!0,[n.VAR]:!0};t.causesExit=function(e){const t=e.tagName;return !(t!==n.FONT||null===Nt.getTokenAttr(e,r.COLOR)&&null===Nt.getTokenAttr(e,r.SIZE)&&null===Nt.getTokenAttr(e,r.FACE))||T[t]},t.adjustTokenMathMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++)if("definitionurl"===e.attrs[t].name){e.attrs[t].name="definitionURL";break}},t.adjustTokenSVGAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=i[e.attrs[t].name];n&&(e.attrs[t].name=n);}},t.adjustTokenXMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=o[e.attrs[t].name];n&&(e.attrs[t].prefix=n.prefix,e.attrs[t].name=n.name,e.attrs[t].namespace=n.namespace);}},t.adjustTokenSVGTagName=function(e){const t=a[e.tagName];t&&(e.tagName=t);},t.isIntegrationPoint=function(e,t,i,o){return !(o&&o!==s.HTML||!function(e,t,i){if(t===s.MATHML&&e===n.ANNOTATION_XML)for(let e=0;e<i.length;e++)if(i[e].name===r.ENCODING){const t=i[e].value.toLowerCase();return "text/html"===t||"application/xhtml+xml"===t}return t===s.SVG&&(e===n.FOREIGN_OBJECT||e===n.DESC||e===n.TITLE)}(e,t,i))||!(o&&o!==s.MATHML||!function(e,t){return t===s.MATHML&&(e===n.MI||e===n.MO||e===n.MN||e===n.MS||e===n.MTEXT)}(e,t))};}));const zt=Ct.TAG_NAMES,qt=Ct.NAMESPACES,Jt=Ct.ATTRS,Zt={scriptingEnabled:!0,sourceCodeLocationInfo:!1,onParseError:null,treeAdapter:xt},$t="hidden",en="INITIAL_MODE",tn="BEFORE_HTML_MODE",nn="BEFORE_HEAD_MODE",sn="IN_HEAD_MODE",rn="IN_HEAD_NO_SCRIPT_MODE",on="AFTER_HEAD_MODE",an="IN_BODY_MODE",Tn="TEXT_MODE",En="IN_TABLE_MODE",hn="IN_TABLE_TEXT_MODE",cn="IN_CAPTION_MODE",_n="IN_COLUMN_GROUP_MODE",ln="IN_TABLE_BODY_MODE",mn="IN_ROW_MODE",pn="IN_CELL_MODE",An="IN_SELECT_MODE",un="IN_SELECT_IN_TABLE_MODE",Nn="IN_TEMPLATE_MODE",dn="AFTER_BODY_MODE",Cn="IN_FRAMESET_MODE",On="AFTER_FRAMESET_MODE",fn="AFTER_AFTER_BODY_MODE",Sn="AFTER_AFTER_FRAMESET_MODE",Rn={[zt.TR]:mn,[zt.TBODY]:ln,[zt.THEAD]:ln,[zt.TFOOT]:ln,[zt.CAPTION]:cn,[zt.COLGROUP]:_n,[zt.TABLE]:En,[zt.BODY]:an,[zt.FRAMESET]:Cn},In={[zt.CAPTION]:En,[zt.COLGROUP]:En,[zt.TBODY]:En,[zt.TFOOT]:En,[zt.THEAD]:En,[zt.COL]:_n,[zt.TR]:ln,[zt.TD]:mn,[zt.TH]:mn},Ln={[en]:{[Nt.CHARACTER_TOKEN]:vn,[Nt.NULL_CHARACTER_TOKEN]:vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:function(e,t){e._setDocumentType(t);const n=t.forceQuirks?Ct.DOCUMENT_MODE.QUIRKS:function(e){if(e.name!==vt)return yt.QUIRKS;const t=e.systemId;if(t&&"http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"===t.toLowerCase())return yt.QUIRKS;let n=e.publicId;if(null!==n){if(n=n.toLowerCase(),Qt.indexOf(n)>-1)return yt.QUIRKS;let e=null===t?wt:Yt;if(Vt(n,e))return yt.QUIRKS;if(e=null===t?Xt:Wt,Vt(n,e))return yt.LIMITED_QUIRKS}return yt.NO_QUIRKS}(t);(function(e){return e.name===vt&&null===e.publicId&&(null===e.systemId||"about:legacy-compat"===e.systemId)})(t)||e._err("non-conforming-doctype"),e.treeAdapter.setDocumentMode(e.document,n),e.insertionMode=tn;},[Nt.START_TAG_TOKEN]:vn,[Nt.END_TAG_TOKEN]:vn,[Nt.EOF_TOKEN]:vn},[tn]:{[Nt.CHARACTER_TOKEN]:Yn,[Nt.NULL_CHARACTER_TOKEN]:Yn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?(e._insertElement(t,qt.HTML),e.insertionMode=nn):Yn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n!==zt.HTML&&n!==zt.HEAD&&n!==zt.BODY&&n!==zt.BR||Yn(e,t);},[Nt.EOF_TOKEN]:Yn},[nn]:{[Nt.CHARACTER_TOKEN]:wn,[Nt.NULL_CHARACTER_TOKEN]:wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.HEAD?(e._insertElement(t,qt.HTML),e.headElement=e.openElements.current,e.insertionMode=sn):wn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HEAD||n===zt.BODY||n===zt.HTML||n===zt.BR?wn(e,t):e._err(L);},[Nt.EOF_TOKEN]:wn},[sn]:{[Nt.CHARACTER_TOKEN]:Wn,[Nt.NULL_CHARACTER_TOKEN]:Wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:Qn,[Nt.END_TAG_TOKEN]:Xn,[Nt.EOF_TOKEN]:Wn},[rn]:{[Nt.CHARACTER_TOKEN]:Vn,[Nt.NULL_CHARACTER_TOKEN]:Vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASEFONT||n===zt.BGSOUND||n===zt.HEAD||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.STYLE?Qn(e,t):n===zt.NOSCRIPT?e._err("nested-noscript-in-head"):Vn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.NOSCRIPT?(e.openElements.pop(),e.insertionMode=sn):n===zt.BR?Vn(e,t):e._err(L);},[Nt.EOF_TOKEN]:Vn},[on]:{[Nt.CHARACTER_TOKEN]:jn,[Nt.NULL_CHARACTER_TOKEN]:jn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BODY?(e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=an):n===zt.FRAMESET?(e._insertElement(t,qt.HTML),e.insertionMode=Cn):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE?(e._err("abandoned-head-element-child"),e.openElements.push(e.headElement),Qn(e,t),e.openElements.remove(e.headElement)):n===zt.HEAD?e._err(k):jn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.BODY||n===zt.HTML||n===zt.BR?jn(e,t):n===zt.TEMPLATE?Xn(e,t):e._err(L);},[Nt.EOF_TOKEN]:jn},[an]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:as,[Nt.END_TAG_TOKEN]:cs,[Nt.EOF_TOKEN]:_s},[Tn]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:xn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Gn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:Gn,[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.SCRIPT&&(e.pendingScript=e.openElements.current),e.openElements.pop(),e.insertionMode=e.originalInsertionMode;},[Nt.EOF_TOKEN]:function(e,t){e._err("eof-in-element-that-can-contain-only-text"),e.openElements.pop(),e.insertionMode=e.originalInsertionMode,e._processToken(t);}},[En]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ms,[Nt.END_TAG_TOKEN]:ps,[Nt.EOF_TOKEN]:_s},[hn]:{[Nt.CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t),e.hasNonWhitespacePendingCharacterToken=!0;},[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t);},[Nt.COMMENT_TOKEN]:us,[Nt.DOCTYPE_TOKEN]:us,[Nt.START_TAG_TOKEN]:us,[Nt.END_TAG_TOKEN]:us,[Nt.EOF_TOKEN]:us},[cn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,n===zt.TABLE&&e._processToken(t)):n!==zt.BODY&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[_n]:{[Nt.CHARACTER_TOKEN]:Ns,[Nt.NULL_CHARACTER_TOKEN]:Ns,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.COL?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TEMPLATE?Qn(e,t):Ns(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.COLGROUP?e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En):n===zt.TEMPLATE?Xn(e,t):n!==zt.COL&&Ns(e,t);},[Nt.EOF_TOKEN]:_s},[ln]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?(e.openElements.clearBackToTableBodyContext(),e._insertElement(t,qt.HTML),e.insertionMode=mn):n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableBodyContext(),e._insertFakeElement(zt.TR),e.insertionMode=mn,e._processToken(t)):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasInTableScope(n)&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En):n===zt.TABLE?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH&&n!==zt.TR)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[mn]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableRowContext(),e._insertElement(t,qt.HTML),e.insertionMode=pn,e.activeFormattingElements.insertMarker()):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln):n===zt.TABLE?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?(e.openElements.hasInTableScope(n)||e.openElements.hasInTableScope(zt.TR))&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[pn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?(e.openElements.hasInTableScope(zt.TD)||e.openElements.hasInTableScope(zt.TH))&&(e._closeTableCell(),e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=mn):n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(n)&&(e._closeTableCell(),e._processToken(t)):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[An]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ds,[Nt.END_TAG_TOKEN]:Cs,[Nt.EOF_TOKEN]:_s},[un]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):ds(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):Cs(e,t);},[Nt.EOF_TOKEN]:_s},[Nn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;if(n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE)Qn(e,t);else {const s=In[n]||an;e._popTmplInsertionMode(),e._pushTmplInsertionMode(s),e.insertionMode=s,e._processToken(t);}},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.TEMPLATE&&Xn(e,t);},[Nt.EOF_TOKEN]:Os},[dn]:{[Nt.CHARACTER_TOKEN]:fs,[Nt.NULL_CHARACTER_TOKEN]:fs,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:function(e,t){e._appendCommentNode(t,e.openElements.items[0]);},[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):fs(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?e.fragmentContext||(e.insertionMode=fn):fs(e,t);},[Nt.EOF_TOKEN]:yn},[Cn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.FRAMESET?e._insertElement(t,qt.HTML):n===zt.FRAME?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName!==zt.FRAMESET||e.openElements.isRootHtmlElementCurrent()||(e.openElements.pop(),e.fragmentContext||e.openElements.currentTagName===zt.FRAMESET||(e.insertionMode=On));},[Nt.EOF_TOKEN]:yn},[On]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML&&(e.insertionMode=Sn);},[Nt.EOF_TOKEN]:yn},[fn]:{[Nt.CHARACTER_TOKEN]:Ss,[Nt.NULL_CHARACTER_TOKEN]:Ss,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):Ss(e,t);},[Nt.END_TAG_TOKEN]:Ss,[Nt.EOF_TOKEN]:yn},[Sn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:Gn,[Nt.EOF_TOKEN]:yn}};var kn=class{constructor(e){this.options=function(e,t){return [e,t=t||Object.create(null)].reduce((e,t)=>(Object.keys(t).forEach(n=>{e[n]=t[n];}),e),Object.create(null))}(Zt,e),this.treeAdapter=this.options.treeAdapter,this.pendingScript=null,this.options.sourceCodeLocationInfo&&gt.install(this,Ut),this.options.onParseError&&gt.install(this,bt,{onParseError:this.options.onParseError});}parse(e){const t=this.treeAdapter.createDocument();return this._bootstrap(t,null),this.tokenizer.write(e,!0),this._runParsingLoop(null),t}parseFragment(e,t){t||(t=this.treeAdapter.createElement(zt.TEMPLATE,qt.HTML,[]));const n=this.treeAdapter.createElement("documentmock",qt.HTML,[]);this._bootstrap(n,t),this.treeAdapter.getTagName(t)===zt.TEMPLATE&&this._pushTmplInsertionMode(Nn),this._initTokenizerForFragmentParsing(),this._insertFakeRootElement(),this._resetInsertionMode(),this._findFormInFragmentContext(),this.tokenizer.write(e,!0),this._runParsingLoop(null);const s=this.treeAdapter.getFirstChild(n),r=this.treeAdapter.createDocumentFragment();return this._adoptNodes(s,r),r}_bootstrap(e,t){this.tokenizer=new Nt(this.options),this.stopped=!1,this.insertionMode=en,this.originalInsertionMode="",this.document=e,this.fragmentContext=t,this.headElement=null,this.formElement=null,this.openElements=new class{constructor(e,t){this.stackTop=-1,this.items=[],this.current=e,this.currentTagName=null,this.currentTmplContent=null,this.tmplCount=0,this.treeAdapter=t;}_indexOf(e){let t=-1;for(let n=this.stackTop;n>=0;n--)if(this.items[n]===e){t=n;break}return t}_isInTemplate(){return this.currentTagName===Ot.TEMPLATE&&this.treeAdapter.getNamespaceURI(this.current)===ft.HTML}_updateCurrentElement(){this.current=this.items[this.stackTop],this.currentTagName=this.current&&this.treeAdapter.getTagName(this.current),this.currentTmplContent=this._isInTemplate()?this.treeAdapter.getTemplateContent(this.current):null;}push(e){this.items[++this.stackTop]=e,this._updateCurrentElement(),this._isInTemplate()&&this.tmplCount++;}pop(){this.stackTop--,this.tmplCount>0&&this._isInTemplate()&&this.tmplCount--,this._updateCurrentElement();}replace(e,t){const n=this._indexOf(e);this.items[n]=t,n===this.stackTop&&this._updateCurrentElement();}insertAfter(e,t){const n=this._indexOf(e)+1;this.items.splice(n,0,t),n===++this.stackTop&&this._updateCurrentElement();}popUntilTagNamePopped(e){for(;this.stackTop>-1;){const t=this.currentTagName,n=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),t===e&&n===ft.HTML)break}}popUntilElementPopped(e){for(;this.stackTop>-1;){const t=this.current;if(this.pop(),t===e)break}}popUntilNumberedHeaderPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.H1||e===Ot.H2||e===Ot.H3||e===Ot.H4||e===Ot.H5||e===Ot.H6&&t===ft.HTML)break}}popUntilTableCellPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.TD||e===Ot.TH&&t===ft.HTML)break}}popAllUpToHtmlElement(){this.stackTop=0,this._updateCurrentElement();}clearBackToTableContext(){for(;this.currentTagName!==Ot.TABLE&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableBodyContext(){for(;this.currentTagName!==Ot.TBODY&&this.currentTagName!==Ot.TFOOT&&this.currentTagName!==Ot.THEAD&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableRowContext(){for(;this.currentTagName!==Ot.TR&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}remove(e){for(let t=this.stackTop;t>=0;t--)if(this.items[t]===e){this.items.splice(t,1),this.stackTop--,this._updateCurrentElement();break}}tryPeekProperlyNestedBodyElement(){const e=this.items[1];return e&&this.treeAdapter.getTagName(e)===Ot.BODY?e:null}contains(e){return this._indexOf(e)>-1}getCommonAncestor(e){let t=this._indexOf(e);return --t>=0?this.items[t]:null}isRootHtmlElementCurrent(){return 0===this.stackTop&&this.currentTagName===Ot.HTML}hasInScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(It(n,s))return !1}return !0}hasNumberedHeaderInScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]),n=this.treeAdapter.getNamespaceURI(this.items[e]);if((t===Ot.H1||t===Ot.H2||t===Ot.H3||t===Ot.H4||t===Ot.H5||t===Ot.H6)&&n===ft.HTML)return !0;if(It(t,n))return !1}return !0}hasInListItemScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if((n===Ot.UL||n===Ot.OL)&&s===ft.HTML||It(n,s))return !1}return !0}hasInButtonScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(n===Ot.BUTTON&&s===ft.HTML||It(n,s))return !1}return !0}hasInTableScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n===Ot.TABLE||n===Ot.TEMPLATE||n===Ot.HTML)return !1}}return !0}hasTableBodyContextInTableScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]);if(this.treeAdapter.getNamespaceURI(this.items[e])===ft.HTML){if(t===Ot.TBODY||t===Ot.THEAD||t===Ot.TFOOT)return !0;if(t===Ot.TABLE||t===Ot.HTML)return !1}}return !0}hasInSelectScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n!==Ot.OPTION&&n!==Ot.OPTGROUP)return !1}}return !0}generateImpliedEndTags(){for(;St(this.currentTagName);)this.pop();}generateImpliedEndTagsThoroughly(){for(;Rt(this.currentTagName);)this.pop();}generateImpliedEndTagsWithExclusion(e){for(;St(this.currentTagName)&&this.currentTagName!==e;)this.pop();}}(this.document,this.treeAdapter),this.activeFormattingElements=new kt(this.treeAdapter),this.tmplInsertionModeStack=[],this.tmplInsertionModeStackTop=-1,this.currentTmplInsertionMode=null,this.pendingCharacterTokens=[],this.hasNonWhitespacePendingCharacterToken=!1,this.framesetOk=!0,this.skipNextNewLine=!1,this.fosterParentingEnabled=!1;}_err(){}_runParsingLoop(e){for(;!this.stopped;){this._setupTokenizerCDATAMode();const t=this.tokenizer.getNextToken();if(t.type===Nt.HIBERNATION_TOKEN)break;if(this.skipNextNewLine&&(this.skipNextNewLine=!1,t.type===Nt.WHITESPACE_CHARACTER_TOKEN&&"\n"===t.chars[0])){if(1===t.chars.length)continue;t.chars=t.chars.substr(1);}if(this._processInputToken(t),e&&this.pendingScript)break}}runParsingLoopForCurrentChunk(e,t){if(this._runParsingLoop(t),t&&this.pendingScript){const e=this.pendingScript;return this.pendingScript=null,void t(e)}e&&e();}_setupTokenizerCDATAMode(){const e=this._getAdjustedCurrentElement();this.tokenizer.allowCDATA=e&&e!==this.document&&this.treeAdapter.getNamespaceURI(e)!==qt.HTML&&!this._isIntegrationPoint(e);}_switchToTextParsing(e,t){this._insertElement(e,qt.HTML),this.tokenizer.state=t,this.originalInsertionMode=this.insertionMode,this.insertionMode=Tn;}switchToPlaintextParsing(){this.insertionMode=Tn,this.originalInsertionMode=an,this.tokenizer.state=Nt.MODE.PLAINTEXT;}_getAdjustedCurrentElement(){return 0===this.openElements.stackTop&&this.fragmentContext?this.fragmentContext:this.openElements.current}_findFormInFragmentContext(){let e=this.fragmentContext;do{if(this.treeAdapter.getTagName(e)===zt.FORM){this.formElement=e;break}e=this.treeAdapter.getParentNode(e);}while(e)}_initTokenizerForFragmentParsing(){if(this.treeAdapter.getNamespaceURI(this.fragmentContext)===qt.HTML){const e=this.treeAdapter.getTagName(this.fragmentContext);e===zt.TITLE||e===zt.TEXTAREA?this.tokenizer.state=Nt.MODE.RCDATA:e===zt.STYLE||e===zt.XMP||e===zt.IFRAME||e===zt.NOEMBED||e===zt.NOFRAMES||e===zt.NOSCRIPT?this.tokenizer.state=Nt.MODE.RAWTEXT:e===zt.SCRIPT?this.tokenizer.state=Nt.MODE.SCRIPT_DATA:e===zt.PLAINTEXT&&(this.tokenizer.state=Nt.MODE.PLAINTEXT);}}_setDocumentType(e){const t=e.name||"",n=e.publicId||"",s=e.systemId||"";this.treeAdapter.setDocumentType(this.document,t,n,s);}_attachElementToTree(e){if(this._shouldFosterParentOnInsertion())this._fosterParentElement(e);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.appendChild(t,e);}}_appendElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n);}_insertElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n),this.openElements.push(n);}_insertFakeElement(e){const t=this.treeAdapter.createElement(e,qt.HTML,[]);this._attachElementToTree(t),this.openElements.push(t);}_insertTemplate(e){const t=this.treeAdapter.createElement(e.tagName,qt.HTML,e.attrs),n=this.treeAdapter.createDocumentFragment();this.treeAdapter.setTemplateContent(t,n),this._attachElementToTree(t),this.openElements.push(t);}_insertFakeRootElement(){const e=this.treeAdapter.createElement(zt.HTML,qt.HTML,[]);this.treeAdapter.appendChild(this.openElements.current,e),this.openElements.push(e);}_appendCommentNode(e,t){const n=this.treeAdapter.createCommentNode(e.data);this.treeAdapter.appendChild(t,n);}_insertCharacters(e){if(this._shouldFosterParentOnInsertion())this._fosterParentText(e.chars);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.insertText(t,e.chars);}}_adoptNodes(e,t){for(let n=this.treeAdapter.getFirstChild(e);n;n=this.treeAdapter.getFirstChild(e))this.treeAdapter.detachNode(n),this.treeAdapter.appendChild(t,n);}_shouldProcessTokenInForeignContent(e){const t=this._getAdjustedCurrentElement();if(!t||t===this.document)return !1;const n=this.treeAdapter.getNamespaceURI(t);if(n===qt.HTML)return !1;if(this.treeAdapter.getTagName(t)===zt.ANNOTATION_XML&&n===qt.MATHML&&e.type===Nt.START_TAG_TOKEN&&e.tagName===zt.SVG)return !1;const s=e.type===Nt.CHARACTER_TOKEN||e.type===Nt.NULL_CHARACTER_TOKEN||e.type===Nt.WHITESPACE_CHARACTER_TOKEN;return !((e.type===Nt.START_TAG_TOKEN&&e.tagName!==zt.MGLYPH&&e.tagName!==zt.MALIGNMARK||s)&&this._isIntegrationPoint(t,qt.MATHML)||(e.type===Nt.START_TAG_TOKEN||s)&&this._isIntegrationPoint(t,qt.HTML)||e.type===Nt.EOF_TOKEN)}_processToken(e){Ln[this.insertionMode][e.type](this,e);}_processTokenInBodyMode(e){Ln.IN_BODY_MODE[e.type](this,e);}_processTokenInForeignContent(e){e.type===Nt.CHARACTER_TOKEN?function(e,t){e._insertCharacters(t),e.framesetOk=!1;}(this,e):e.type===Nt.NULL_CHARACTER_TOKEN?function(e,t){t.chars=n,e._insertCharacters(t);}(this,e):e.type===Nt.WHITESPACE_CHARACTER_TOKEN?xn(this,e):e.type===Nt.COMMENT_TOKEN?Kn(this,e):e.type===Nt.START_TAG_TOKEN?function(e,t){if(jt.causesExit(t)&&!e.fragmentContext){for(;e.treeAdapter.getNamespaceURI(e.openElements.current)!==qt.HTML&&!e._isIntegrationPoint(e.openElements.current);)e.openElements.pop();e._processToken(t);}else {const n=e._getAdjustedCurrentElement(),s=e.treeAdapter.getNamespaceURI(n);s===qt.MATHML?jt.adjustTokenMathMLAttrs(t):s===qt.SVG&&(jt.adjustTokenSVGTagName(t),jt.adjustTokenSVGAttrs(t)),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,s):e._insertElement(t,s),t.ackSelfClosing=!0;}}(this,e):e.type===Nt.END_TAG_TOKEN&&function(e,t){for(let n=e.openElements.stackTop;n>0;n--){const s=e.openElements.items[n];if(e.treeAdapter.getNamespaceURI(s)===qt.HTML){e._processToken(t);break}if(e.treeAdapter.getTagName(s).toLowerCase()===t.tagName){e.openElements.popUntilElementPopped(s);break}}}(this,e);}_processInputToken(e){this._shouldProcessTokenInForeignContent(e)?this._processTokenInForeignContent(e):this._processToken(e),e.type===Nt.START_TAG_TOKEN&&e.selfClosing&&!e.ackSelfClosing&&this._err("non-void-html-element-start-tag-with-trailing-solidus");}_isIntegrationPoint(e,t){const n=this.treeAdapter.getTagName(e),s=this.treeAdapter.getNamespaceURI(e),r=this.treeAdapter.getAttrList(e);return jt.isIntegrationPoint(n,s,r,t)}_reconstructActiveFormattingElements(){const e=this.activeFormattingElements.length;if(e){let t=e,n=null;do{if(t--,n=this.activeFormattingElements.entries[t],n.type===kt.MARKER_ENTRY||this.openElements.contains(n.element)){t++;break}}while(t>0);for(let s=t;s<e;s++)n=this.activeFormattingElements.entries[s],this._insertElement(n.token,this.treeAdapter.getNamespaceURI(n.element)),n.element=this.openElements.current;}}_closeTableCell(){this.openElements.generateImpliedEndTags(),this.openElements.popUntilTableCellPopped(),this.activeFormattingElements.clearToLastMarker(),this.insertionMode=mn;}_closePElement(){this.openElements.generateImpliedEndTagsWithExclusion(zt.P),this.openElements.popUntilTagNamePopped(zt.P);}_resetInsertionMode(){for(let e=this.openElements.stackTop,t=!1;e>=0;e--){let n=this.openElements.items[e];0===e&&(t=!0,this.fragmentContext&&(n=this.fragmentContext));const s=this.treeAdapter.getTagName(n),r=Rn[s];if(r){this.insertionMode=r;break}if(!(t||s!==zt.TD&&s!==zt.TH)){this.insertionMode=pn;break}if(!t&&s===zt.HEAD){this.insertionMode=sn;break}if(s===zt.SELECT){this._resetInsertionModeForSelect(e);break}if(s===zt.TEMPLATE){this.insertionMode=this.currentTmplInsertionMode;break}if(s===zt.HTML){this.insertionMode=this.headElement?on:nn;break}if(t){this.insertionMode=an;break}}}_resetInsertionModeForSelect(e){if(e>0)for(let t=e-1;t>0;t--){const e=this.openElements.items[t],n=this.treeAdapter.getTagName(e);if(n===zt.TEMPLATE)break;if(n===zt.TABLE)return void(this.insertionMode=un)}this.insertionMode=An;}_pushTmplInsertionMode(e){this.tmplInsertionModeStack.push(e),this.tmplInsertionModeStackTop++,this.currentTmplInsertionMode=e;}_popTmplInsertionMode(){this.tmplInsertionModeStack.pop(),this.tmplInsertionModeStackTop--,this.currentTmplInsertionMode=this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];}_isElementCausesFosterParenting(e){const t=this.treeAdapter.getTagName(e);return t===zt.TABLE||t===zt.TBODY||t===zt.TFOOT||t===zt.THEAD||t===zt.TR}_shouldFosterParentOnInsertion(){return this.fosterParentingEnabled&&this._isElementCausesFosterParenting(this.openElements.current)}_findFosterParentingLocation(){const e={parent:null,beforeElement:null};for(let t=this.openElements.stackTop;t>=0;t--){const n=this.openElements.items[t],s=this.treeAdapter.getTagName(n),r=this.treeAdapter.getNamespaceURI(n);if(s===zt.TEMPLATE&&r===qt.HTML){e.parent=this.treeAdapter.getTemplateContent(n);break}if(s===zt.TABLE){e.parent=this.treeAdapter.getParentNode(n),e.parent?e.beforeElement=n:e.parent=this.openElements.items[t-1];break}}return e.parent||(e.parent=this.openElements.items[0]),e}_fosterParentElement(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertBefore(t.parent,e,t.beforeElement):this.treeAdapter.appendChild(t.parent,e);}_fosterParentText(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertTextBefore(t.parent,e,t.beforeElement):this.treeAdapter.insertText(t.parent,e);}_isSpecialElement(e){const t=this.treeAdapter.getTagName(e),n=this.treeAdapter.getNamespaceURI(e);return Ct.SPECIAL_ELEMENTS[n][t]}};function Mn(e,t){let n=e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);return n?e.openElements.contains(n.element)?e.openElements.hasInScope(t.tagName)||(n=null):(e.activeFormattingElements.removeEntry(n),n=null):hs(e,t),n}function gn(e,t){let n=null;for(let s=e.openElements.stackTop;s>=0;s--){const r=e.openElements.items[s];if(r===t.element)break;e._isSpecialElement(r)&&(n=r);}return n||(e.openElements.popUntilElementPopped(t.element),e.activeFormattingElements.removeEntry(t)),n}function Pn(e,t,n){let s=t,r=e.openElements.getCommonAncestor(t);for(let i=0,o=r;o!==n;i++,o=r){r=e.openElements.getCommonAncestor(o);const n=e.activeFormattingElements.getElementEntry(o),a=n&&i>=3;!n||a?(a&&e.activeFormattingElements.removeEntry(n),e.openElements.remove(o)):(o=Hn(e,n),s===t&&(e.activeFormattingElements.bookmark=n),e.treeAdapter.detachNode(s),e.treeAdapter.appendChild(o,s),s=o);}return s}function Hn(e,t){const n=e.treeAdapter.getNamespaceURI(t.element),s=e.treeAdapter.createElement(t.token.tagName,n,t.token.attrs);return e.openElements.replace(t.element,s),t.element=s,s}function Dn(e,t,n){if(e._isElementCausesFosterParenting(t))e._fosterParentElement(n);else {const s=e.treeAdapter.getTagName(t),r=e.treeAdapter.getNamespaceURI(t);s===zt.TEMPLATE&&r===qt.HTML&&(t=e.treeAdapter.getTemplateContent(t)),e.treeAdapter.appendChild(t,n);}}function Fn(e,t,n){const s=e.treeAdapter.getNamespaceURI(n.element),r=n.token,i=e.treeAdapter.createElement(r.tagName,s,r.attrs);e._adoptNodes(t,i),e.treeAdapter.appendChild(t,i),e.activeFormattingElements.insertElementAfterBookmark(i,n.token),e.activeFormattingElements.removeEntry(n),e.openElements.remove(n.element),e.openElements.insertAfter(t,i);}function Un(e,t){let n;for(let s=0;s<8&&(n=Mn(e,t),n);s++){const t=gn(e,n);if(!t)break;e.activeFormattingElements.bookmark=n;const s=Pn(e,t,n.element),r=e.openElements.getCommonAncestor(n.element);e.treeAdapter.detachNode(s),Dn(e,r,s),Fn(e,t,n);}}function Gn(){}function Bn(e){e._err("misplaced-doctype");}function Kn(e,t){e._appendCommentNode(t,e.openElements.currentTmplContent||e.openElements.current);}function bn(e,t){e._appendCommentNode(t,e.document);}function xn(e,t){e._insertCharacters(t);}function yn(e){e.stopped=!0;}function vn(e,t){e._err("missing-doctype",{beforeToken:!0}),e.treeAdapter.setDocumentMode(e.document,Ct.DOCUMENT_MODE.QUIRKS),e.insertionMode=tn,e._processToken(t);}function Yn(e,t){e._insertFakeRootElement(),e.insertionMode=nn,e._processToken(t);}function wn(e,t){e._insertFakeElement(zt.HEAD),e.headElement=e.openElements.current,e.insertionMode=sn,e._processToken(t);}function Qn(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TITLE?e._switchToTextParsing(t,Nt.MODE.RCDATA):n===zt.NOSCRIPT?e.options.scriptingEnabled?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):(e._insertElement(t,qt.HTML),e.insertionMode=rn):n===zt.NOFRAMES||n===zt.STYLE?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):n===zt.SCRIPT?e._switchToTextParsing(t,Nt.MODE.SCRIPT_DATA):n===zt.TEMPLATE?(e._insertTemplate(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1,e.insertionMode=Nn,e._pushTmplInsertionMode(Nn)):n===zt.HEAD?e._err(k):Wn(e,t);}function Xn(e,t){const n=t.tagName;n===zt.HEAD?(e.openElements.pop(),e.insertionMode=on):n===zt.BODY||n===zt.BR||n===zt.HTML?Wn(e,t):n===zt.TEMPLATE&&e.openElements.tmplCount>0?(e.openElements.generateImpliedEndTagsThoroughly(),e.openElements.currentTagName!==zt.TEMPLATE&&e._err("closing-of-element-with-open-child-elements"),e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode()):e._err(L);}function Wn(e,t){e.openElements.pop(),e.insertionMode=on,e._processToken(t);}function Vn(e,t){const n=t.type===Nt.EOF_TOKEN?"open-elements-left-after-eof":"disallowed-content-in-noscript-in-head";e._err(n),e.openElements.pop(),e.insertionMode=sn,e._processToken(t);}function jn(e,t){e._insertFakeElement(zt.BODY),e.insertionMode=an,e._processToken(t);}function zn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t);}function qn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t),e.framesetOk=!1;}function Jn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}function Zn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.framesetOk=!1;}function $n(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}function es(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1;}function ts(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}function ns(e,t){e._appendElement(t,qt.HTML),t.ackSelfClosing=!0;}function ss(e,t){e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}function rs(e,t){e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function is(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTags(),e._insertElement(t,qt.HTML);}function os(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function as(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.I||n===zt.S||n===zt.B||n===zt.U?$n(e,t):n===zt.P?Jn(e,t):n===zt.A?function(e,t){const n=e.activeFormattingElements.getElementEntryInScopeWithTagName(zt.A);n&&(Un(e,t),e.openElements.remove(n.element),e.activeFormattingElements.removeEntry(n)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):os(e,t);break;case 2:n===zt.DL||n===zt.OL||n===zt.UL?Jn(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement();const n=e.openElements.currentTagName;n!==zt.H1&&n!==zt.H2&&n!==zt.H3&&n!==zt.H4&&n!==zt.H5&&n!==zt.H6||e.openElements.pop(),e._insertElement(t,qt.HTML);}(e,t):n===zt.LI||n===zt.DD||n===zt.DT?function(e,t){e.framesetOk=!1;const n=t.tagName;for(let t=e.openElements.stackTop;t>=0;t--){const s=e.openElements.items[t],r=e.treeAdapter.getTagName(s);let i=null;if(n===zt.LI&&r===zt.LI?i=zt.LI:n!==zt.DD&&n!==zt.DT||r!==zt.DD&&r!==zt.DT||(i=r),i){e.openElements.generateImpliedEndTagsWithExclusion(i),e.openElements.popUntilTagNamePopped(i);break}if(r!==zt.ADDRESS&&r!==zt.DIV&&r!==zt.P&&e._isSpecialElement(s))break}e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n===zt.EM||n===zt.TT?$n(e,t):n===zt.BR?ts(e,t):n===zt.HR?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}(e,t):n===zt.RB?is(e,t):n===zt.RT||n===zt.RP?function(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTagsWithExclusion(zt.RTC),e._insertElement(t,qt.HTML);}(e,t):n!==zt.TH&&n!==zt.TD&&n!==zt.TR&&os(e,t);break;case 3:n===zt.DIV||n===zt.DIR||n===zt.NAV?Jn(e,t):n===zt.PRE?Zn(e,t):n===zt.BIG?$n(e,t):n===zt.IMG||n===zt.WBR?ts(e,t):n===zt.XMP?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._reconstructActiveFormattingElements(),e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SVG?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenSVGAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.SVG):e._insertElement(t,qt.SVG),t.ackSelfClosing=!0;}(e,t):n===zt.RTC?is(e,t):n!==zt.COL&&os(e,t);break;case 4:n===zt.HTML?function(e,t){0===e.openElements.tmplCount&&e.treeAdapter.adoptAttributes(e.openElements.items[0],t.attrs);}(e,t):n===zt.BASE||n===zt.LINK||n===zt.META?Qn(e,t):n===zt.BODY?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();n&&0===e.openElements.tmplCount&&(e.framesetOk=!1,e.treeAdapter.adoptAttributes(n,t.attrs));}(e,t):n===zt.MAIN||n===zt.MENU?Jn(e,t):n===zt.FORM?function(e,t){const n=e.openElements.tmplCount>0;e.formElement&&!n||(e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),n||(e.formElement=e.openElements.current));}(e,t):n===zt.CODE||n===zt.FONT?$n(e,t):n===zt.NOBR?function(e,t){e._reconstructActiveFormattingElements(),e.openElements.hasInScope(zt.NOBR)&&(Un(e,t),e._reconstructActiveFormattingElements()),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):n===zt.AREA?ts(e,t):n===zt.MATH?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenMathMLAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.MATHML):e._insertElement(t,qt.MATHML),t.ackSelfClosing=!0;}(e,t):n===zt.MENU?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n!==zt.HEAD&&os(e,t);break;case 5:n===zt.STYLE||n===zt.TITLE?Qn(e,t):n===zt.ASIDE?Jn(e,t):n===zt.SMALL?$n(e,t):n===zt.TABLE?function(e,t){e.treeAdapter.getDocumentMode(e.document)!==Ct.DOCUMENT_MODE.QUIRKS&&e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=En;}(e,t):n===zt.EMBED?ts(e,t):n===zt.INPUT?function(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML);const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t||(e.framesetOk=!1),t.ackSelfClosing=!0;}(e,t):n===zt.PARAM||n===zt.TRACK?ns(e,t):n===zt.IMAGE?function(e,t){t.tagName=zt.IMG,ts(e,t);}(e,t):n!==zt.FRAME&&n!==zt.TBODY&&n!==zt.TFOOT&&n!==zt.THEAD&&os(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Jn(e,t):n===zt.BUTTON?function(e,t){e.openElements.hasInScope(zt.BUTTON)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.BUTTON)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1;}(e,t):n===zt.STRIKE||n===zt.STRONG?$n(e,t):n===zt.APPLET||n===zt.OBJECT?es(e,t):n===zt.KEYGEN?ts(e,t):n===zt.SOURCE?ns(e,t):n===zt.IFRAME?function(e,t){e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SELECT?function(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode===En||e.insertionMode===cn||e.insertionMode===ln||e.insertionMode===mn||e.insertionMode===pn?e.insertionMode=un:e.insertionMode=An;}(e,t):n===zt.OPTION?rs(e,t):os(e,t);break;case 7:n===zt.BGSOUND?Qn(e,t):n===zt.DETAILS||n===zt.ADDRESS||n===zt.ARTICLE||n===zt.SECTION||n===zt.SUMMARY?Jn(e,t):n===zt.LISTING?Zn(e,t):n===zt.MARQUEE?es(e,t):n===zt.NOEMBED?ss(e,t):n!==zt.CAPTION&&os(e,t);break;case 8:n===zt.BASEFONT?Qn(e,t):n===zt.FRAMESET?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();e.framesetOk&&n&&(e.treeAdapter.detachNode(n),e.openElements.popAllUpToHtmlElement(),e._insertElement(t,qt.HTML),e.insertionMode=Cn);}(e,t):n===zt.FIELDSET?Jn(e,t):n===zt.TEXTAREA?function(e,t){e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.tokenizer.state=Nt.MODE.RCDATA,e.originalInsertionMode=e.insertionMode,e.framesetOk=!1,e.insertionMode=Tn;}(e,t):n===zt.TEMPLATE?Qn(e,t):n===zt.NOSCRIPT?e.options.scriptingEnabled?ss(e,t):os(e,t):n===zt.OPTGROUP?rs(e,t):n!==zt.COLGROUP&&os(e,t);break;case 9:n===zt.PLAINTEXT?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.tokenizer.state=Nt.MODE.PLAINTEXT;}(e,t):os(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Jn(e,t):os(e,t);break;default:os(e,t);}}function Ts(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n));}function Es(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker());}function hs(e,t){const n=t.tagName;for(let t=e.openElements.stackTop;t>0;t--){const s=e.openElements.items[t];if(e.treeAdapter.getTagName(s)===n){e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilElementPopped(s);break}if(e._isSpecialElement(s))break}}function cs(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.A||n===zt.B||n===zt.I||n===zt.S||n===zt.U?Un(e,t):n===zt.P?function(e){e.openElements.hasInButtonScope(zt.P)||e._insertFakeElement(zt.P),e._closePElement();}(e):hs(e,t);break;case 2:n===zt.DL||n===zt.UL||n===zt.OL?Ts(e,t):n===zt.LI?function(e){e.openElements.hasInListItemScope(zt.LI)&&(e.openElements.generateImpliedEndTagsWithExclusion(zt.LI),e.openElements.popUntilTagNamePopped(zt.LI));}(e):n===zt.DD||n===zt.DT?function(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilTagNamePopped(n));}(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e){e.openElements.hasNumberedHeaderInScope()&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilNumberedHeaderPopped());}(e):n===zt.BR?function(e){e._reconstructActiveFormattingElements(),e._insertFakeElement(zt.BR),e.openElements.pop(),e.framesetOk=!1;}(e):n===zt.EM||n===zt.TT?Un(e,t):hs(e,t);break;case 3:n===zt.BIG?Un(e,t):n===zt.DIR||n===zt.DIV||n===zt.NAV||n===zt.PRE?Ts(e,t):hs(e,t);break;case 4:n===zt.BODY?function(e){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn);}(e):n===zt.HTML?function(e,t){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn,e._processToken(t));}(e,t):n===zt.FORM?function(e){const t=e.openElements.tmplCount>0,n=e.formElement;t||(e.formElement=null),(n||t)&&e.openElements.hasInScope(zt.FORM)&&(e.openElements.generateImpliedEndTags(),t?e.openElements.popUntilTagNamePopped(zt.FORM):e.openElements.remove(n));}(e):n===zt.CODE||n===zt.FONT||n===zt.NOBR?Un(e,t):n===zt.MAIN||n===zt.MENU?Ts(e,t):hs(e,t);break;case 5:n===zt.ASIDE?Ts(e,t):n===zt.SMALL?Un(e,t):hs(e,t);break;case 6:n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Ts(e,t):n===zt.APPLET||n===zt.OBJECT?Es(e,t):n===zt.STRIKE||n===zt.STRONG?Un(e,t):hs(e,t);break;case 7:n===zt.ADDRESS||n===zt.ARTICLE||n===zt.DETAILS||n===zt.SECTION||n===zt.SUMMARY||n===zt.LISTING?Ts(e,t):n===zt.MARQUEE?Es(e,t):hs(e,t);break;case 8:n===zt.FIELDSET?Ts(e,t):n===zt.TEMPLATE?Xn(e,t):hs(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Ts(e,t):hs(e,t);break;default:hs(e,t);}}function _s(e,t){e.tmplInsertionModeStackTop>-1?Os(e,t):e.stopped=!0;}function ls(e,t){const n=e.openElements.currentTagName;n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?(e.pendingCharacterTokens=[],e.hasNonWhitespacePendingCharacterToken=!1,e.originalInsertionMode=e.insertionMode,e.insertionMode=hn,e._processToken(t)):As(e,t);}function ms(e,t){const n=t.tagName;switch(n.length){case 2:n===zt.TD||n===zt.TH||n===zt.TR?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.TBODY),e.insertionMode=ln,e._processToken(t);}(e,t):As(e,t);break;case 3:n===zt.COL?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.COLGROUP),e.insertionMode=_n,e._processToken(t);}(e,t):As(e,t);break;case 4:n===zt.FORM?function(e,t){e.formElement||0!==e.openElements.tmplCount||(e._insertElement(t,qt.HTML),e.formElement=e.openElements.current,e.openElements.pop());}(e,t):As(e,t);break;case 5:n===zt.TABLE?function(e,t){e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode(),e._processToken(t));}(e,t):n===zt.STYLE?Qn(e,t):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=ln;}(e,t):n===zt.INPUT?function(e,t){const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t?e._appendElement(t,qt.HTML):As(e,t),t.ackSelfClosing=!0;}(e,t):As(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):As(e,t);break;case 7:n===zt.CAPTION?function(e,t){e.openElements.clearBackToTableContext(),e.activeFormattingElements.insertMarker(),e._insertElement(t,qt.HTML),e.insertionMode=cn;}(e,t):As(e,t);break;case 8:n===zt.COLGROUP?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=_n;}(e,t):n===zt.TEMPLATE?Qn(e,t):As(e,t);break;default:As(e,t);}}function ps(e,t){const n=t.tagName;n===zt.TABLE?e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode()):n===zt.TEMPLATE?Xn(e,t):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&As(e,t);}function As(e,t){const n=e.fosterParentingEnabled;e.fosterParentingEnabled=!0,e._processTokenInBodyMode(t),e.fosterParentingEnabled=n;}function us(e,t){let n=0;if(e.hasNonWhitespacePendingCharacterToken)for(;n<e.pendingCharacterTokens.length;n++)As(e,e.pendingCharacterTokens[n]);else for(;n<e.pendingCharacterTokens.length;n++)e._insertCharacters(e.pendingCharacterTokens[n]);e.insertionMode=e.originalInsertionMode,e._processToken(t);}function Ns(e,t){e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En,e._processToken(t));}function ds(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.OPTION?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.OPTGROUP?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.INPUT||n===zt.KEYGEN||n===zt.TEXTAREA||n===zt.SELECT?e.openElements.hasInSelectScope(zt.SELECT)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),n!==zt.SELECT&&e._processToken(t)):n!==zt.SCRIPT&&n!==zt.TEMPLATE||Qn(e,t);}function Cs(e,t){const n=t.tagName;if(n===zt.OPTGROUP){const t=e.openElements.items[e.openElements.stackTop-1],n=t&&e.treeAdapter.getTagName(t);e.openElements.currentTagName===zt.OPTION&&n===zt.OPTGROUP&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop();}else n===zt.OPTION?e.openElements.currentTagName===zt.OPTION&&e.openElements.pop():n===zt.SELECT&&e.openElements.hasInSelectScope(zt.SELECT)?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode()):n===zt.TEMPLATE&&Xn(e,t);}function Os(e,t){e.openElements.tmplCount>0?(e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode(),e._processToken(t)):e.stopped=!0;}function fs(e,t){e.insertionMode=an,e._processToken(t);}function Ss(e,t){e.insertionMode=an,e._processToken(t);}return Ct.TAG_NAMES,Ct.NAMESPACES,e.parse=function(e,t){return new kn(t).parse(e)},e.parseFragment=function(e,t,n){return "string"==typeof e&&(n=t,t=e,e=null),new kn(n).parseFragment(t,e)},e}({});const parse=e.parse;const parseFragment=e.parseFragment;

const docParser = new WeakMap();
function parseDocumentUtil(ownerDocument, html) {
  const doc = parse(html.trim(), getParser(ownerDocument));
  doc.documentElement = doc.firstElementChild;
  doc.head = doc.documentElement.firstElementChild;
  doc.body = doc.head.nextElementSibling;
  return doc;
}
function parseFragmentUtil(ownerDocument, html) {
  if (typeof html === 'string') {
    html = html.trim();
  }
  else {
    html = '';
  }
  const frag = parseFragment(html, getParser(ownerDocument));
  return frag;
}
function getParser(ownerDocument) {
  let parseOptions = docParser.get(ownerDocument);
  if (parseOptions != null) {
    return parseOptions;
  }
  const treeAdapter = {
    createDocument() {
      const doc = ownerDocument.createElement("#document" /* DOCUMENT_NODE */);
      doc['x-mode'] = 'no-quirks';
      return doc;
    },
    setNodeSourceCodeLocation(node, location) {
      node.sourceCodeLocation = location;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    createDocumentFragment() {
      return ownerDocument.createDocumentFragment();
    },
    createElement(tagName, namespaceURI, attrs) {
      const elm = ownerDocument.createElementNS(namespaceURI, tagName);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.namespace == null || attr.namespace === 'http://www.w3.org/1999/xhtml') {
          elm.setAttribute(attr.name, attr.value);
        }
        else {
          elm.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
      return elm;
    },
    createCommentNode(data) {
      return ownerDocument.createComment(data);
    },
    appendChild(parentNode, newNode) {
      parentNode.appendChild(newNode);
    },
    insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(doc, name, publicId, systemId) {
      let doctypeNode = doc.childNodes.find(n => n.nodeType === 10 /* DOCUMENT_TYPE_NODE */);
      if (doctypeNode == null) {
        doctypeNode = ownerDocument.createDocumentTypeNode();
        doc.insertBefore(doctypeNode, doc.firstChild);
      }
      doctypeNode.nodeValue = '!DOCTYPE';
      doctypeNode['x-name'] = name;
      doctypeNode['x-publicId'] = publicId;
      doctypeNode['x-systemId'] = systemId;
    },
    setDocumentMode(doc, mode) {
      doc['x-mode'] = mode;
    },
    getDocumentMode(doc) {
      return doc['x-mode'];
    },
    detachNode(node) {
      node.remove();
    },
    insertText(parentNode, text) {
      const lastChild = parentNode.lastChild;
      if (lastChild != null && lastChild.nodeType === 3 /* TEXT_NODE */) {
        lastChild.nodeValue += text;
      }
      else {
        parentNode.appendChild(ownerDocument.createTextNode(text));
      }
    },
    insertTextBefore(parentNode, text, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode != null && prevNode.nodeType === 3 /* TEXT_NODE */) {
        prevNode.nodeValue += text;
      }
      else {
        parentNode.insertBefore(ownerDocument.createTextNode(text), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (recipient.hasAttributeNS(attr.namespace, attr.name) === false) {
          recipient.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
    },
    getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      const attrs = element.attributes.__items.map(attr => {
        return {
          name: attr.name,
          value: attr.value,
          namespace: attr.namespaceURI,
          prefix: null,
        };
      });
      return attrs;
    },
    getTagName(element) {
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        return element.nodeName.toLowerCase();
      }
      else {
        return element.nodeName;
      }
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.nodeValue;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.nodeValue;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode['x-name'];
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode['x-publicId'];
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode['x-systemId'];
    },
    isTextNode(node) {
      return node.nodeType === 3 /* TEXT_NODE */;
    },
    isCommentNode(node) {
      return node.nodeType === 8 /* COMMENT_NODE */;
    },
    isDocumentTypeNode(node) {
      return node.nodeType === 10 /* DOCUMENT_TYPE_NODE */;
    },
    isElementNode(node) {
      return node.nodeType === 1 /* ELEMENT_NODE */;
    },
  };
  parseOptions = {
    treeAdapter: treeAdapter,
  };
  docParser.set(ownerDocument, parseOptions);
  return parseOptions;
}

class MockNode {
  constructor(ownerDocument, nodeType, nodeName, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this._nodeValue = nodeValue;
    this.parentNode = null;
    this.childNodes = [];
  }
  appendChild(newNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      const nodes = newNode.childNodes.slice();
      for (const child of nodes) {
        this.appendChild(child);
      }
    }
    else {
      newNode.remove();
      newNode.parentNode = this;
      this.childNodes.push(newNode);
      connectNode(this.ownerDocument, newNode);
    }
    return newNode;
  }
  append(...items) {
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.appendChild(isNode ? item : this.ownerDocument.createTextNode(String(item)));
    });
  }
  prepend(...items) {
    const firstChild = this.firstChild;
    items.forEach(item => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.insertBefore(isNode ? item : this.ownerDocument.createTextNode(String(item)), firstChild);
    });
  }
  cloneNode(deep) {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }
  compareDocumentPosition(_other) {
    // unimplemented
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    return -1;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  insertBefore(newNode, referenceNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      for (let i = 0, ii = newNode.childNodes.length; i < ii; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    }
    else {
      insertBefore(this, newNode, referenceNode);
    }
    return newNode;
  }
  get isConnected() {
    let node = this;
    while (node != null) {
      if (node.nodeType === 9 /* DOCUMENT_NODE */) {
        return true;
      }
      node = node.parentNode;
      if (node != null && node.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        node = node.host;
      }
    }
    return false;
  }
  isSameNode(node) {
    return this === node;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  get nodeValue() {
    return this._nodeValue;
  }
  set nodeValue(value) {
    this._nodeValue = value;
  }
  get parentElement() {
    return this.parentNode || null;
  }
  set parentElement(value) {
    this.parentNode = value;
  }
  get previousSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  contains(otherNode) {
    return this.childNodes.includes(otherNode);
  }
  removeChild(childNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      if (this.nodeType === 1 /* ELEMENT_NODE */) {
        const wasConnected = this.isConnected;
        childNode.parentNode = null;
        if (wasConnected === true) {
          disconnectNode(childNode);
        }
      }
      else {
        childNode.parentNode = null;
      }
    }
    else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }
  remove() {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  }
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }
  get textContent() {
    return this._nodeValue;
  }
  set textContent(value) {
    this._nodeValue = String(value);
  }
}
MockNode.ELEMENT_NODE = 1;
MockNode.TEXT_NODE = 3;
MockNode.PROCESSING_INSTRUCTION_NODE = 7;
MockNode.COMMENT_NODE = 8;
MockNode.DOCUMENT_NODE = 9;
MockNode.DOCUMENT_TYPE_NODE = 10;
MockNode.DOCUMENT_FRAGMENT_NODE = 11;
class MockNodeList {
  constructor(ownerDocument, childNodes, length) {
    this.ownerDocument = ownerDocument;
    this.childNodes = childNodes;
    this.length = length;
  }
}
class MockElement extends MockNode {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, 1 /* ELEMENT_NODE */, typeof nodeName === 'string' ? nodeName : null, null);
    this.namespaceURI = null;
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  attachShadow(_opts) {
    const shadowRoot = this.ownerDocument.createDocumentFragment();
    this.shadowRoot = shadowRoot;
    return shadowRoot;
  }
  get shadowRoot() {
    return this.__shadowRoot || null;
  }
  set shadowRoot(shadowRoot) {
    if (shadowRoot != null) {
      shadowRoot.host = this;
      this.__shadowRoot = shadowRoot;
    }
    else {
      delete this.__shadowRoot;
    }
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(false);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
  get children() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */);
  }
  get childElementCount() {
    return this.childNodes.filter(n => n.nodeType === 1 /* ELEMENT_NODE */).length;
  }
  get className() {
    return this.getAttributeNS(null, 'class') || '';
  }
  set className(value) {
    this.setAttributeNS(null, 'class', value);
  }
  get classList() {
    return new MockClassList(this);
  }
  click() {
    dispatchEvent(this, new MockEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }
  cloneNode(_deep) {
    // implemented on MockElement.prototype from within element.ts
    return null;
  }
  closest(selector) {
    let elm = this;
    while (elm != null) {
      if (elm.matches(selector)) {
        return elm;
      }
      elm = elm.parentNode;
    }
    return null;
  }
  get dataset() {
    return dataset(this);
  }
  get dir() {
    return this.getAttributeNS(null, 'dir') || '';
  }
  set dir(value) {
    this.setAttributeNS(null, 'dir', value);
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get firstElementChild() {
    return this.children[0] || null;
  }
  getAttribute(attrName) {
    if (attrName === 'style') {
      if (this.__style != null && this.__style.length > 0) {
        return this.style.cssText;
      }
      return null;
    }
    const attr = this.attributes.getNamedItem(attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getBoundingClientRect() {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
  }
  getRootNode(opts) {
    const isComposed = opts != null && opts.composed === true;
    let node = this;
    while (node.parentNode != null) {
      node = node.parentNode;
      if (isComposed === true && node.parentNode == null && node.host != null) {
        node = node.host;
      }
    }
    return node;
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') === 'true';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  get id() {
    return this.getAttributeNS(null, 'id') || '';
  }
  set id(value) {
    this.setAttributeNS(null, 'id', value);
  }
  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serializeNodeToHtml(this, {
      newLines: false,
      indentSpaces: 0,
    });
  }
  set innerHTML(html) {
    if (NON_ESCAPABLE_CONTENT.has(this.nodeName) === true) {
      setTextContent(this, html);
    }
    else {
      for (let i = this.childNodes.length - 1; i >= 0; i--) {
        this.removeChild(this.childNodes[i]);
      }
      if (typeof html === 'string') {
        const frag = parseFragmentUtil(this.ownerDocument, html);
        while (frag.childNodes.length > 0) {
          this.appendChild(frag.childNodes[0]);
        }
      }
    }
  }
  get innerText() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set innerText(value) {
    setTextContent(this, value);
  }
  insertAdjacentElement(position, elm) {
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
    return elm;
  }
  insertAdjacentHTML(position, html) {
    const frag = parseFragmentUtil(this.ownerDocument, html);
    if (position === 'beforebegin') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[0], this);
      }
    }
    else if (position === 'afterbegin') {
      while (frag.childNodes.length > 0) {
        this.prepend(frag.childNodes[frag.childNodes.length - 1]);
      }
    }
    else if (position === 'beforeend') {
      while (frag.childNodes.length > 0) {
        this.appendChild(frag.childNodes[0]);
      }
    }
    else if (position === 'afterend') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[frag.childNodes.length - 1], this.nextSibling);
      }
    }
  }
  insertAdjacentText(position, text) {
    const elm = this.ownerDocument.createTextNode(text);
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
  }
  hasAttribute(attrName) {
    if (attrName === 'style') {
      return this.__style != null && this.__style.length > 0;
    }
    return this.getAttribute(attrName) !== null;
  }
  hasAttributeNS(namespaceURI, name) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }
  get hidden() {
    return this.hasAttributeNS(null, 'hidden');
  }
  set hidden(isHidden) {
    if (isHidden === true) {
      this.setAttributeNS(null, 'hidden', '');
    }
    else {
      this.removeAttributeNS(null, 'hidden');
    }
  }
  get lang() {
    return this.getAttributeNS(null, 'lang') || '';
  }
  set lang(value) {
    this.setAttributeNS(null, 'lang', value);
  }
  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  matches(selector) {
    return matches(selector, this);
  }
  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  get outerHTML() {
    return serializeNodeToHtml(this, {
      newLines: false,
      outerHtml: true,
      indentSpaces: 0,
    });
  }
  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ || parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ || parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  getElementsByClassName(classNames) {
    const classes = classNames
      .trim()
      .split(' ')
      .filter(c => c.length > 0);
    const results = [];
    getElementsByClassName(this, classes, results);
    return results;
  }
  getElementsByTagName(tagName) {
    const results = [];
    getElementsByTagName(this, tagName.toLowerCase(), results);
    return results;
  }
  querySelector(selector) {
    return selectOne(selector, this);
  }
  querySelectorAll(selector) {
    return selectAll(selector, this);
  }
  removeAttribute(attrName) {
    if (attrName === 'style') {
      delete this.__style;
    }
    else {
      const attr = this.attributes.getNamedItem(attrName);
      if (attr != null) {
        this.attributes.removeNamedItemNS(attr);
        if (checkAttributeChanged(this) === true) {
          attributeChanged(this, attrName, attr.value, null);
        }
      }
    }
  }
  removeAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      this.attributes.removeNamedItemNS(attr);
      if (checkAttributeChanged(this) === true) {
        attributeChanged(this, attrName, attr.value, null);
      }
    }
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  setAttribute(attrName, value) {
    if (attrName === 'style') {
      this.style = value;
    }
    else {
      const attributes = this.attributes;
      let attr = attributes.getNamedItem(attrName);
      const checkAttrChanged = checkAttributeChanged(this);
      if (attr != null) {
        if (checkAttrChanged === true) {
          const oldValue = attr.value;
          attr.value = value;
          if (oldValue !== attr.value) {
            attributeChanged(this, attr.name, oldValue, attr.value);
          }
        }
        else {
          attr.value = value;
        }
      }
      else {
        if (attributes.caseInsensitive) {
          attrName = attrName.toLowerCase();
        }
        attr = new MockAttr(attrName, value);
        attributes.__items.push(attr);
        if (checkAttrChanged === true) {
          attributeChanged(this, attrName, null, attr.value);
        }
      }
    }
  }
  setAttributeNS(namespaceURI, attrName, value) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, attrName);
    const checkAttrChanged = checkAttributeChanged(this);
    if (attr != null) {
      if (checkAttrChanged === true) {
        const oldValue = attr.value;
        attr.value = value;
        if (oldValue !== attr.value) {
          attributeChanged(this, attr.name, oldValue, attr.value);
        }
      }
      else {
        attr.value = value;
      }
    }
    else {
      attr = new MockAttr(attrName, value, namespaceURI);
      attributes.__items.push(attr);
      if (checkAttrChanged === true) {
        attributeChanged(this, attrName, null, attr.value);
      }
    }
  }
  get style() {
    if (this.__style == null) {
      this.__style = createCSSStyleDeclaration();
    }
    return this.__style;
  }
  set style(val) {
    if (typeof val === 'string') {
      if (this.__style == null) {
        this.__style = createCSSStyleDeclaration();
      }
      this.__style.cssText = val;
    }
    else {
      this.__style = val;
    }
  }
  get tabIndex() {
    return parseInt(this.getAttributeNS(null, 'tabindex') || '-1', 10);
  }
  set tabIndex(value) {
    this.setAttributeNS(null, 'tabindex', value);
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get textContent() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set textContent(value) {
    setTextContent(this, value);
  }
  get title() {
    return this.getAttributeNS(null, 'title') || '';
  }
  set title(value) {
    this.setAttributeNS(null, 'title', value);
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
  toString(opts) {
    return serializeNodeToHtml(this, opts);
  }
}
function getElementsByClassName(elm, classNames, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    for (let j = 0, jj = classNames.length; j < jj; j++) {
      if (childElm.classList.contains(classNames[j])) {
        foundElms.push(childElm);
      }
    }
    getElementsByClassName(childElm, classNames, foundElms);
  }
}
function getElementsByTagName(elm, tagName, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (tagName === '*' || childElm.nodeName.toLowerCase() === tagName) {
      foundElms.push(childElm);
    }
    getElementsByTagName(childElm, tagName, foundElms);
  }
}
function resetElement(elm) {
  resetEventListeners(elm);
  delete elm.__attributeMap;
  delete elm.__shadowRoot;
  delete elm.__style;
}
function insertBefore(parentNode, newNode, referenceNode) {
  if (newNode !== referenceNode) {
    newNode.remove();
    newNode.parentNode = parentNode;
    newNode.ownerDocument = parentNode.ownerDocument;
    if (referenceNode != null) {
      const index = parentNode.childNodes.indexOf(referenceNode);
      if (index > -1) {
        parentNode.childNodes.splice(index, 0, newNode);
      }
      else {
        throw new Error(`referenceNode not found in parentNode.childNodes`);
      }
    }
    else {
      parentNode.childNodes.push(newNode);
    }
    connectNode(parentNode.ownerDocument, newNode);
  }
  return newNode;
}
class MockHTMLElement extends MockElement {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, typeof nodeName === 'string' ? nodeName.toUpperCase() : null);
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(true);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
}
class MockTextNode extends MockNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3 /* TEXT_NODE */, "#text" /* TEXT_NODE */, text);
  }
  cloneNode(_deep) {
    return new MockTextNode(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
  get data() {
    return this.nodeValue;
  }
  set data(text) {
    this.nodeValue = text;
  }
  get wholeText() {
    if (this.parentNode != null) {
      const text = [];
      for (let i = 0, ii = this.parentNode.childNodes.length; i < ii; i++) {
        const childNode = this.parentNode.childNodes[i];
        if (childNode.nodeType === 3 /* TEXT_NODE */) {
          text.push(childNode.nodeValue);
        }
      }
      return text.join('');
    }
    return this.nodeValue;
  }
}
function getTextContent(childNodes, text) {
  for (let i = 0, ii = childNodes.length; i < ii; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === 3 /* TEXT_NODE */) {
      text.push(childNode.nodeValue);
    }
    else if (childNode.nodeType === 1 /* ELEMENT_NODE */) {
      getTextContent(childNode.childNodes, text);
    }
  }
}
function setTextContent(elm, text) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockTextNode(elm.ownerDocument, text);
  elm.appendChild(textNode);
}

class MockComment extends MockNode {
  constructor(ownerDocument, data) {
    super(ownerDocument, 8 /* COMMENT_NODE */, "#comment" /* COMMENT_NODE */, data);
  }
  cloneNode(_deep) {
    return new MockComment(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
}

class MockDocumentFragment extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, null);
    this.nodeName = "#document-fragment" /* DOCUMENT_FRAGMENT_NODE */;
    this.nodeType = 11 /* DOCUMENT_FRAGMENT_NODE */;
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  cloneNode(deep) {
    const cloned = new MockDocumentFragment(null);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const childNode = this.childNodes[i];
        if (childNode.nodeType === 1 /* ELEMENT_NODE */ || childNode.nodeType === 3 /* TEXT_NODE */ || childNode.nodeType === 8 /* COMMENT_NODE */) {
          const clonedChildNode = this.childNodes[i].cloneNode(true);
          cloned.appendChild(clonedChildNode);
        }
      }
    }
    return cloned;
  }
}

class MockDocumentTypeNode extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, '!DOCTYPE');
    this.nodeType = 10 /* DOCUMENT_TYPE_NODE */;
    this.setAttribute('html', '');
  }
}

class MockCSSRule {
  constructor(parentStyleSheet) {
    this.parentStyleSheet = parentStyleSheet;
    this.cssText = '';
    this.type = 0;
  }
}
class MockCSSStyleSheet {
  constructor(ownerNode) {
    this.type = 'text/css';
    this.parentStyleSheet = null;
    this.cssRules = [];
    this.ownerNode = ownerNode;
  }
  get rules() {
    return this.cssRules;
  }
  set rules(rules) {
    this.cssRules = rules;
  }
  deleteRule(index) {
    if (index >= 0 && index < this.cssRules.length) {
      this.cssRules.splice(index, 1);
      updateStyleTextNode(this.ownerNode);
    }
  }
  insertRule(rule, index = 0) {
    if (typeof index !== 'number') {
      index = 0;
    }
    if (index < 0) {
      index = 0;
    }
    if (index > this.cssRules.length) {
      index = this.cssRules.length;
    }
    const cssRule = new MockCSSRule(this);
    cssRule.cssText = rule;
    this.cssRules.splice(index, 0, cssRule);
    updateStyleTextNode(this.ownerNode);
    return index;
  }
}
function getStyleElementText(styleElm) {
  const output = [];
  for (let i = 0; i < styleElm.childNodes.length; i++) {
    output.push(styleElm.childNodes[i].nodeValue);
  }
  return output.join('');
}
function setStyleElementText(styleElm, text) {
  // keeping the innerHTML and the sheet.cssRules connected
  // is not technically correct, but since we're doing
  // SSR we'll need to turn any assigned cssRules into
  // real text, not just properties that aren't rendered
  const sheet = styleElm.sheet;
  sheet.cssRules.length = 0;
  sheet.insertRule(text);
  updateStyleTextNode(styleElm);
}
function updateStyleTextNode(styleElm) {
  const childNodeLen = styleElm.childNodes.length;
  if (childNodeLen > 1) {
    for (let i = childNodeLen - 1; i >= 1; i--) {
      styleElm.removeChild(styleElm.childNodes[i]);
    }
  }
  else if (childNodeLen < 1) {
    styleElm.appendChild(styleElm.ownerDocument.createTextNode(''));
  }
  const textNode = styleElm.childNodes[0];
  textNode.nodeValue = styleElm.sheet.cssRules.map(r => r.cssText).join('\n');
}

function createElement(ownerDocument, tagName) {
  if (typeof tagName !== 'string' || tagName === '' || !/^[a-z0-9-_:]+$/i.test(tagName)) {
    throw new Error(`The tag name provided (${tagName}) is not a valid name.`);
  }
  tagName = tagName.toLowerCase();
  switch (tagName) {
    case 'a':
      return new MockAnchorElement(ownerDocument);
    case 'base':
      return new MockBaseElement(ownerDocument);
    case 'button':
      return new MockButtonElement(ownerDocument);
    case 'canvas':
      return new MockCanvasElement(ownerDocument);
    case 'form':
      return new MockFormElement(ownerDocument);
    case 'img':
      return new MockImageElement(ownerDocument);
    case 'input':
      return new MockInputElement(ownerDocument);
    case 'link':
      return new MockLinkElement(ownerDocument);
    case 'meta':
      return new MockMetaElement(ownerDocument);
    case 'script':
      return new MockScriptElement(ownerDocument);
    case 'style':
      return new MockStyleElement(ownerDocument);
    case 'template':
      return new MockTemplateElement(ownerDocument);
    case 'title':
      return new MockTitleElement(ownerDocument);
  }
  if (ownerDocument != null && tagName.includes('-')) {
    const win = ownerDocument.defaultView;
    if (win != null && win.customElements != null) {
      return createCustomElement(win.customElements, ownerDocument, tagName);
    }
  }
  return new MockHTMLElement(ownerDocument, tagName);
}
function createElementNS(ownerDocument, namespaceURI, tagName) {
  if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return createElement(ownerDocument, tagName);
  }
  else if (namespaceURI === 'http://www.w3.org/2000/svg') {
    return new MockSVGElement(ownerDocument, tagName);
  }
  else {
    return new MockElement(ownerDocument, tagName);
  }
}
class MockAnchorElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'a');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockButtonElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'button');
  }
}
patchPropAttributes(MockButtonElement.prototype, {
  type: String,
}, {
  type: 'submit',
});
class MockImageElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'img');
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') !== 'false';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockImageElement.prototype, {
  height: Number,
  width: Number,
});
class MockInputElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'input');
  }
  get list() {
    const listId = this.getAttribute('list');
    if (listId) {
      return this.ownerDocument.getElementById(listId);
    }
    return null;
  }
}
patchPropAttributes(MockInputElement.prototype, {
  accept: String,
  autocomplete: String,
  autofocus: Boolean,
  capture: String,
  checked: Boolean,
  disabled: Boolean,
  form: String,
  formaction: String,
  formenctype: String,
  formmethod: String,
  formnovalidate: String,
  formtarget: String,
  height: Number,
  inputmode: String,
  max: String,
  maxLength: Number,
  min: String,
  minLength: Number,
  multiple: Boolean,
  name: String,
  pattern: String,
  placeholder: String,
  required: Boolean,
  readOnly: Boolean,
  size: Number,
  spellCheck: Boolean,
  src: String,
  step: String,
  type: String,
  value: String,
  width: Number,
}, {
  type: 'text',
});
class MockFormElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'form');
  }
}
patchPropAttributes(MockFormElement.prototype, {
  name: String,
});
class MockLinkElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'link');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
patchPropAttributes(MockLinkElement.prototype, {
  crossorigin: String,
  media: String,
  rel: String,
  type: String,
});
class MockMetaElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'meta');
  }
}
patchPropAttributes(MockMetaElement.prototype, {
  charset: String,
  content: String,
  name: String,
});
class MockScriptElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'script');
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockScriptElement.prototype, {
  type: String,
});
class MockStyleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'style');
    this.sheet = new MockCSSStyleSheet(this);
  }
  get innerHTML() {
    return getStyleElementText(this);
  }
  set innerHTML(value) {
    setStyleElementText(this, value);
  }
  get innerText() {
    return getStyleElementText(this);
  }
  set innerText(value) {
    setStyleElementText(this, value);
  }
  get textContent() {
    return getStyleElementText(this);
  }
  set textContent(value) {
    setStyleElementText(this, value);
  }
}
class MockSVGElement extends MockElement {
  // SVGElement properties and methods
  get ownerSVGElement() {
    return null;
  }
  get viewportElement() {
    return null;
  }
  focus() {
    /**/
  }
  onunload() {
    /**/
  }
  // SVGGeometryElement properties and methods
  get pathLength() {
    return 0;
  }
  isPointInFill(_pt) {
    return false;
  }
  isPointInStroke(_pt) {
    return false;
  }
  getTotalLength() {
    return 0;
  }
}
class MockBaseElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'base');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockTemplateElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'template');
    this.content = new MockDocumentFragment(ownerDocument);
  }
  get innerHTML() {
    return this.content.innerHTML;
  }
  set innerHTML(html) {
    this.content.innerHTML = html;
  }
  cloneNode(deep) {
    const cloned = new MockTemplateElement(null);
    cloned.attributes = cloneAttributes(this.attributes);
    const styleCssText = this.getAttribute('style');
    if (styleCssText != null && styleCssText.length > 0) {
      cloned.setAttribute('style', styleCssText);
    }
    cloned.content = this.content.cloneNode(deep);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }
    return cloned;
  }
}
class MockTitleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'title');
  }
  get text() {
    return this.textContent;
  }
  set text(value) {
    this.textContent = value;
  }
}
class MockCanvasElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'canvas');
  }
  getContext() {
    return {
      fillRect() {
        return;
      },
      clearRect() { },
      getImageData: function (_, __, w, h) {
        return {
          data: new Array(w * h * 4),
        };
      },
      putImageData() { },
      createImageData: function () {
        return [];
      },
      setTransform() { },
      drawImage() { },
      save() { },
      fillText() { },
      restore() { },
      beginPath() { },
      moveTo() { },
      lineTo() { },
      closePath() { },
      stroke() { },
      translate() { },
      scale() { },
      rotate() { },
      arc() { },
      fill() { },
      measureText() {
        return { width: 0 };
      },
      transform() { },
      rect() { },
      clip() { },
    };
  }
}
function fullUrl(elm, attrName) {
  const val = elm.getAttribute(attrName) || '';
  if (elm.ownerDocument != null) {
    const win = elm.ownerDocument.defaultView;
    if (win != null) {
      const loc = win.location;
      if (loc != null) {
        try {
          const url = new URL(val, loc.href);
          return url.href;
        }
        catch (e) { }
      }
    }
  }
  return val.replace(/\'|\"/g, '').trim();
}
function patchPropAttributes(prototype, attrs, defaults = {}) {
  Object.keys(attrs).forEach(propName => {
    const attr = attrs[propName];
    const defaultValue = defaults[propName];
    if (attr === Boolean) {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName);
        },
        set(value) {
          if (value) {
            this.setAttribute(propName, '');
          }
          else {
            this.removeAttribute(propName);
          }
        },
      });
    }
    else if (attr === Number) {
      Object.defineProperty(prototype, propName, {
        get() {
          const value = this.getAttribute(propName);
          return value ? parseInt(value, 10) : defaultValue === undefined ? 0 : defaultValue;
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
    else {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName) ? this.getAttribute(propName) : defaultValue || '';
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
  });
}
MockElement.prototype.cloneNode = function (deep) {
  // because we're creating elements, which extending specific HTML base classes there
  // is a MockElement circular reference that bundling has trouble dealing with so
  // the fix is to add cloneNode() to MockElement's prototype after the HTML classes
  const cloned = createElement(this.ownerDocument, this.nodeName);
  cloned.attributes = cloneAttributes(this.attributes);
  const styleCssText = this.getAttribute('style');
  if (styleCssText != null && styleCssText.length > 0) {
    cloned.setAttribute('style', styleCssText);
  }
  if (deep) {
    for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
      const clonedChildNode = this.childNodes[i].cloneNode(true);
      cloned.appendChild(clonedChildNode);
    }
  }
  return cloned;
};

let sharedDocument;
function parseHtmlToDocument(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseDocumentUtil(ownerDocument, html);
}
function parseHtmlToFragment(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseFragmentUtil(ownerDocument, html);
}

class MockHeaders {
  constructor(init) {
    this._values = [];
    if (typeof init === 'object') {
      if (typeof init[Symbol.iterator] === 'function') {
        const kvs = [];
        for (const kv of init) {
          if (typeof kv[Symbol.iterator] === 'function') {
            kvs.push([...kv]);
          }
        }
        for (const kv of kvs) {
          this.append(kv[0], kv[1]);
        }
      }
      else {
        for (const key in init) {
          this.append(key, init[key]);
        }
      }
    }
  }
  append(key, value) {
    this._values.push([key, value + '']);
  }
  delete(key) {
    key = key.toLowerCase();
    for (let i = this._values.length - 1; i >= 0; i--) {
      if (this._values[i][0].toLowerCase() === key) {
        this._values.splice(i, 1);
      }
    }
  }
  entries() {
    const entries = [];
    for (const kv of this.keys()) {
      entries.push([kv, this.get(kv)]);
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: entries[index],
          done: !entries[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  forEach(cb) {
    for (const kv of this.entries()) {
      cb(kv[1], kv[0]);
    }
  }
  get(key) {
    const rtn = [];
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        rtn.push(kv[1]);
      }
    }
    return rtn.length > 0 ? rtn.join(', ') : null;
  }
  has(key) {
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        return true;
      }
    }
    return false;
  }
  keys() {
    const keys = [];
    for (const kv of this._values) {
      const key = kv[0].toLowerCase();
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: keys[index],
          done: !keys[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  set(key, value) {
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key.toLowerCase()) {
        kv[1] = value + '';
        return;
      }
    }
    this.append(key, value);
  }
  values() {
    const values = this._values;
    let index = -1;
    return {
      next() {
        index++;
        const done = !values[index];
        return {
          value: done ? undefined : values[index][1],
          done,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this._method = 'GET';
    this._url = '/';
    this.bodyUsed = false;
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.integrity = '';
    this.keepalive = false;
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = '';
    if (typeof input === 'string') {
      this.url = input;
    }
    else if (input) {
      Object.assign(this, input);
      this.headers = new MockHeaders(input.headers);
    }
    Object.assign(this, init);
    if (init.headers) {
      this.headers = new MockHeaders(init.headers);
    }
    if (!this.headers) {
      this.headers = new MockHeaders();
    }
  }
  get url() {
    if (typeof this._url === 'string') {
      return new URL(this._url, location.href).href;
    }
    return new URL('/', location.href).href;
  }
  set url(value) {
    this._url = value;
  }
  get method() {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase();
    }
    return 'GET';
  }
  set method(value) {
    this._method = value;
  }
  clone() {
    const clone = { ...this };
    clone.headers = new MockHeaders(this.headers);
    return new MockRequest(clone);
  }
}
class MockResponse {
  constructor(body, init = {}) {
    this.ok = true;
    this.status = 200;
    this.statusText = '';
    this.type = 'default';
    this.url = '';
    this._body = body;
    if (init) {
      Object.assign(this, init);
    }
    this.headers = new MockHeaders(init.headers);
  }
  async json() {
    return JSON.parse(this._body);
  }
  async text() {
    return this._body;
  }
  clone() {
    const initClone = { ...this };
    initClone.headers = new MockHeaders(this.headers);
    return new MockResponse(this._body, initClone);
  }
}

function setupGlobal(gbl) {
  if (gbl.window == null) {
    const win = (gbl.window = new MockWindow());
    WINDOW_FUNCTIONS.forEach(fnName => {
      if (!(fnName in gbl)) {
        gbl[fnName] = win[fnName].bind(win);
      }
    });
    WINDOW_PROPS.forEach(propName => {
      if (!(propName in gbl)) {
        Object.defineProperty(gbl, propName, {
          get() {
            return win[propName];
          },
          set(val) {
            win[propName] = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    GLOBAL_CONSTRUCTORS.forEach(([cstrName]) => {
      gbl[cstrName] = win[cstrName];
    });
  }
  return gbl.window;
}
function teardownGlobal(gbl) {
  const win = gbl.window;
  if (win && typeof win.close === 'function') {
    win.close();
  }
}
function patchWindow(winToBePatched) {
  const mockWin = new MockWindow(false);
  WINDOW_FUNCTIONS.forEach(fnName => {
    if (typeof winToBePatched[fnName] !== 'function') {
      winToBePatched[fnName] = mockWin[fnName].bind(mockWin);
    }
  });
  WINDOW_PROPS.forEach(propName => {
    if (winToBePatched === undefined) {
      Object.defineProperty(winToBePatched, propName, {
        get() {
          return mockWin[propName];
        },
        set(val) {
          mockWin[propName] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
}
function addGlobalsToWindowPrototype(mockWinPrototype) {
  GLOBAL_CONSTRUCTORS.forEach(([cstrName, Cstr]) => {
    Object.defineProperty(mockWinPrototype, cstrName, {
      get() {
        return this['__' + cstrName] || Cstr;
      },
      set(cstr) {
        this['__' + cstrName] = cstr;
      },
      configurable: true,
      enumerable: true,
    });
  });
}
const WINDOW_FUNCTIONS = [
  'addEventListener',
  'alert',
  'blur',
  'cancelAnimationFrame',
  'cancelIdleCallback',
  'clearInterval',
  'clearTimeout',
  'close',
  'confirm',
  'dispatchEvent',
  'focus',
  'getComputedStyle',
  'matchMedia',
  'open',
  'prompt',
  'removeEventListener',
  'requestAnimationFrame',
  'requestIdleCallback',
  'URL',
];
const WINDOW_PROPS = [
  'customElements',
  'devicePixelRatio',
  'document',
  'history',
  'innerHeight',
  'innerWidth',
  'localStorage',
  'location',
  'navigator',
  'pageXOffset',
  'pageYOffset',
  'performance',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'CSS',
  'CustomEvent',
  'Event',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'KeyboardEvent',
  'MouseEvent',
];
const GLOBAL_CONSTRUCTORS = [
  ['CustomEvent', MockCustomEvent],
  ['Event', MockEvent],
  ['Headers', MockHeaders],
  ['KeyboardEvent', MockKeyboardEvent],
  ['MouseEvent', MockMouseEvent],
  ['Request', MockRequest],
  ['Response', MockResponse],
  ['HTMLAnchorElement', MockAnchorElement],
  ['HTMLBaseElement', MockBaseElement],
  ['HTMLButtonElement', MockButtonElement],
  ['HTMLCanvasElement', MockCanvasElement],
  ['HTMLFormElement', MockFormElement],
  ['HTMLImageElement', MockImageElement],
  ['HTMLInputElement', MockInputElement],
  ['HTMLLinkElement', MockLinkElement],
  ['HTMLMetaElement', MockMetaElement],
  ['HTMLScriptElement', MockScriptElement],
  ['HTMLStyleElement', MockStyleElement],
  ['HTMLTemplateElement', MockTemplateElement],
  ['HTMLTitleElement', MockTitleElement],
];

const consoleNoop = () => {
  /**/
};
function createConsole() {
  return {
    debug: consoleNoop,
    error: consoleNoop,
    info: consoleNoop,
    log: consoleNoop,
    warn: consoleNoop,
    dir: consoleNoop,
    dirxml: consoleNoop,
    table: consoleNoop,
    trace: consoleNoop,
    group: consoleNoop,
    groupCollapsed: consoleNoop,
    groupEnd: consoleNoop,
    clear: consoleNoop,
    count: consoleNoop,
    countReset: consoleNoop,
    assert: consoleNoop,
    profile: consoleNoop,
    profileEnd: consoleNoop,
    time: consoleNoop,
    timeLog: consoleNoop,
    timeEnd: consoleNoop,
    timeStamp: consoleNoop,
    context: consoleNoop,
    memory: consoleNoop,
  };
}

class MockHistory {
  constructor() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  go(_value) {
    //
  }
  pushState(_state, _title, _url) {
    //
  }
  replaceState(_state, _title, _url) {
    //
  }
}

class MockIntersectionObserver {
  constructor() {
    /**/
  }
  disconnect() {
    /**/
  }
  observe() {
    /**/
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    /**/
  }
}

class MockLocation {
  constructor() {
    this.ancestorOrigins = null;
    this.protocol = '';
    this.host = '';
    this.hostname = '';
    this.port = '';
    this.pathname = '';
    this.search = '';
    this.hash = '';
    this.username = '';
    this.password = '';
    this.origin = '';
    this._href = '';
  }
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value, 'http://mockdoc.stenciljs.com');
    this._href = url.href;
    this.protocol = url.protocol;
    this.host = url.host;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }
  assign(_url) {
    //
  }
  reload(_forcedReload) {
    //
  }
  replace(_url) {
    //
  }
  toString() {
    return this.href;
  }
}

class MockNavigator {
  constructor() {
    this.appCodeName = 'MockNavigator';
    this.appName = 'MockNavigator';
    this.appVersion = 'MockNavigator';
    this.platform = 'MockNavigator';
    this.userAgent = 'MockNavigator';
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
class MockPerformance {
  constructor() {
    this.timeOrigin = Date.now();
  }
  addEventListener() {
    //
  }
  clearMarks() {
    //
  }
  clearMeasures() {
    //
  }
  clearResourceTimings() {
    //
  }
  dispatchEvent() {
    return true;
  }
  getEntries() {
    return [];
  }
  getEntriesByName() {
    return [];
  }
  getEntriesByType() {
    return [];
  }
  mark() {
    //
  }
  measure() {
    //
  }
  get navigation() {
    return {};
  }
  now() {
    return Date.now() - this.timeOrigin;
  }
  get onresourcetimingbufferfull() {
    return null;
  }
  removeEventListener() {
    //
  }
  setResourceTimingBufferSize() {
    //
  }
  get timing() {
    return {};
  }
  toJSON() {
    //
  }
}
function resetPerformance(perf) {
  if (perf != null) {
    try {
      perf.timeOrigin = Date.now();
    }
    catch (e) { }
  }
}

class MockStorage {
  constructor() {
    this.items = new Map();
  }
  key(_value) {
    //
  }
  getItem(key) {
    key = String(key);
    if (this.items.has(key)) {
      return this.items.get(key);
    }
    return null;
  }
  setItem(key, value) {
    if (value == null) {
      value = 'null';
    }
    this.items.set(String(key), String(value));
  }
  removeItem(key) {
    this.items.delete(String(key));
  }
  clear() {
    this.items.clear();
  }
}

const nativeClearInterval = clearInterval;
const nativeClearTimeout = clearTimeout;
const nativeSetInterval = setInterval;
const nativeSetTimeout = setTimeout;
const nativeURL = URL;
class MockWindow {
  constructor(html = null) {
    if (html !== false) {
      this.document = new MockDocument(html, this);
    }
    else {
      this.document = null;
    }
    this.performance = new MockPerformance();
    this.customElements = new MockCustomElementRegistry(this);
    this.console = createConsole();
    resetWindowDefaults(this);
    resetWindowDimensions(this);
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  alert(msg) {
    if (this.console) {
      this.console.debug(msg);
    }
    else {
      console.debug(msg);
    }
  }
  blur() {
    /**/
  }
  cancelAnimationFrame(id) {
    this.__clearTimeout(id);
  }
  cancelIdleCallback(id) {
    this.__clearTimeout(id);
  }
  get CharacterData() {
    if (this.__charDataCstr == null) {
      const ownerDocument = this.document;
      this.__charDataCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct CharacterData');
        }
      };
    }
    return this.__charDataCstr;
  }
  set CharacterData(charDataCstr) {
    this.__charDataCstr = charDataCstr;
  }
  clearInterval(id) {
    this.__clearInterval(id);
  }
  clearTimeout(id) {
    this.__clearTimeout(id);
  }
  close() {
    resetWindow(this);
  }
  confirm() {
    return false;
  }
  get CSS() {
    return {
      supports: () => true,
    };
  }
  get Document() {
    if (this.__docCstr == null) {
      const win = this;
      this.__docCstr = class extends MockDocument {
        constructor() {
          super(false, win);
          throw new Error('Illegal constructor: cannot construct Document');
        }
      };
    }
    return this.__docCstr;
  }
  set Document(docCstr) {
    this.__docCstr = docCstr;
  }
  get DocumentFragment() {
    if (this.__docFragCstr == null) {
      const ownerDocument = this.document;
      this.__docFragCstr = class extends MockDocumentFragment {
        constructor() {
          super(ownerDocument);
          throw new Error('Illegal constructor: cannot construct DocumentFragment');
        }
      };
    }
    return this.__docFragCstr;
  }
  set DocumentFragment(docFragCstr) {
    this.__docFragCstr = docFragCstr;
  }
  get DocumentType() {
    if (this.__docTypeCstr == null) {
      const ownerDocument = this.document;
      this.__docTypeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct DocumentType');
        }
      };
    }
    return this.__docTypeCstr;
  }
  set DocumentType(docTypeCstr) {
    this.__docTypeCstr = docTypeCstr;
  }
  get DOMTokenList() {
    if (this.__domTokenListCstr == null) {
      this.__domTokenListCstr = class MockDOMTokenList {
      };
    }
    return this.__domTokenListCstr;
  }
  set DOMTokenList(domTokenListCstr) {
    this.__domTokenListCstr = domTokenListCstr;
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get Element() {
    if (this.__elementCstr == null) {
      const ownerDocument = this.document;
      this.__elementCstr = class extends MockElement {
        constructor() {
          super(ownerDocument, '');
          throw new Error('Illegal constructor: cannot construct Element');
        }
      };
    }
    return this.__elementCstr;
  }
  focus() {
    /**/
  }
  getComputedStyle(_) {
    return {
      cssText: '',
      length: 0,
      parentRule: null,
      getPropertyPriority() {
        return null;
      },
      getPropertyValue() {
        return '';
      },
      item() {
        return null;
      },
      removeProperty() {
        return null;
      },
      setProperty() {
        return null;
      },
    };
  }
  get globalThis() {
    return this;
  }
  get history() {
    if (this.__history == null) {
      this.__history = new MockHistory();
    }
    return this.__history;
  }
  set history(hsty) {
    this.__history = hsty;
  }
  get JSON() {
    return JSON;
  }
  get HTMLElement() {
    if (this.__htmlElementCstr == null) {
      const ownerDocument = this.document;
      this.__htmlElementCstr = class extends MockHTMLElement {
        constructor() {
          super(ownerDocument, '');
          const observedAttributes = this.constructor.observedAttributes;
          if (Array.isArray(observedAttributes) && typeof this.attributeChangedCallback === 'function') {
            observedAttributes.forEach(attrName => {
              const attrValue = this.getAttribute(attrName);
              if (attrValue != null) {
                this.attributeChangedCallback(attrName, null, attrValue);
              }
            });
          }
        }
      };
    }
    return this.__htmlElementCstr;
  }
  set HTMLElement(htmlElementCstr) {
    this.__htmlElementCstr = htmlElementCstr;
  }
  get IntersectionObserver() {
    return MockIntersectionObserver;
  }
  get localStorage() {
    if (this.__localStorage == null) {
      this.__localStorage = new MockStorage();
    }
    return this.__localStorage;
  }
  set localStorage(locStorage) {
    this.__localStorage = locStorage;
  }
  get location() {
    if (this.__location == null) {
      this.__location = new MockLocation();
    }
    return this.__location;
  }
  set location(val) {
    if (typeof val === 'string') {
      if (this.__location == null) {
        this.__location = new MockLocation();
      }
      this.__location.href = val;
    }
    else {
      this.__location = val;
    }
  }
  matchMedia() {
    return {
      matches: false,
    };
  }
  get Node() {
    if (this.__nodeCstr == null) {
      const ownerDocument = this.document;
      this.__nodeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct Node');
        }
      };
    }
    return this.__nodeCstr;
  }
  get NodeList() {
    if (this.__nodeListCstr == null) {
      const ownerDocument = this.document;
      this.__nodeListCstr = class extends MockNodeList {
        constructor() {
          super(ownerDocument, [], 0);
          throw new Error('Illegal constructor: cannot construct NodeList');
        }
      };
    }
    return this.__nodeListCstr;
  }
  get navigator() {
    if (this.__navigator == null) {
      this.__navigator = new MockNavigator();
    }
    return this.__navigator;
  }
  set navigator(nav) {
    this.__navigator = nav;
  }
  get parent() {
    return null;
  }
  prompt() {
    return '';
  }
  open() {
    return null;
  }
  get origin() {
    return this.location.origin;
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  requestAnimationFrame(callback) {
    return this.setTimeout(() => {
      callback(Date.now());
    }, 0);
  }
  requestIdleCallback(callback) {
    return this.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, 0);
  }
  scroll(_x, _y) {
    /**/
  }
  scrollBy(_x, _y) {
    /**/
  }
  scrollTo(_x, _y) {
    /**/
  }
  get self() {
    return this;
  }
  get sessionStorage() {
    if (this.__sessionStorage == null) {
      this.__sessionStorage = new MockStorage();
    }
    return this.__sessionStorage;
  }
  set sessionStorage(locStorage) {
    this.__sessionStorage = locStorage;
  }
  setInterval(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    if (this.__allowInterval) {
      const intervalId = this.__setInterval(() => {
        if (this.__timeouts) {
          this.__timeouts.delete(intervalId);
          try {
            callback(...args);
          }
          catch (e) {
            if (this.console) {
              this.console.error(e);
            }
            else {
              console.error(e);
            }
          }
        }
      }, ms);
      if (this.__timeouts) {
        this.__timeouts.add(intervalId);
      }
      return intervalId;
    }
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  setTimeout(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  get top() {
    return this;
  }
  get window() {
    return this;
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
}
addGlobalsToWindowPrototype(MockWindow.prototype);
function resetWindowDefaults(win) {
  win.__clearInterval = nativeClearInterval;
  win.__clearTimeout = nativeClearTimeout;
  win.__setInterval = nativeSetInterval;
  win.__setTimeout = nativeSetTimeout;
  win.__maxTimeout = 30000;
  win.__allowInterval = true;
  win.URL = nativeURL;
}
function cloneWindow(srcWin, opts = {}) {
  if (srcWin == null) {
    return null;
  }
  const clonedWin = new MockWindow(false);
  if (!opts.customElementProxy) {
    srcWin.customElements = null;
  }
  if (srcWin.document != null) {
    const clonedDoc = new MockDocument(false, clonedWin);
    clonedWin.document = clonedDoc;
    clonedDoc.documentElement = srcWin.document.documentElement.cloneNode(true);
  }
  else {
    clonedWin.document = new MockDocument(null, clonedWin);
  }
  return clonedWin;
}
function cloneDocument(srcDoc) {
  if (srcDoc == null) {
    return null;
  }
  const dstWin = cloneWindow(srcDoc.defaultView);
  return dstWin.document;
}
/**
 * Constrain setTimeout() to 1ms, but still async. Also
 * only allow setInterval() to fire once, also constrained to 1ms.
 */
function constrainTimeouts(win) {
  win.__allowInterval = false;
  win.__maxTimeout = 0;
}
function resetWindow(win) {
  if (win != null) {
    if (win.__timeouts) {
      win.__timeouts.forEach(timeoutId => {
        nativeClearInterval(timeoutId);
        nativeClearTimeout(timeoutId);
      });
      win.__timeouts.clear();
    }
    if (win.customElements && win.customElements.clear) {
      win.customElements.clear();
    }
    resetDocument(win.document);
    resetPerformance(win.performance);
    for (const key in win) {
      if (win.hasOwnProperty(key) && key !== 'document' && key !== 'performance' && key !== 'customElements') {
        delete win[key];
      }
    }
    resetWindowDefaults(win);
    resetWindowDimensions(win);
    resetEventListeners(win);
    if (win.document != null) {
      try {
        win.document.defaultView = win;
      }
      catch (e) { }
    }
  }
}
function resetWindowDimensions(win) {
  try {
    win.devicePixelRatio = 1;
    win.innerHeight = 768;
    win.innerWidth = 1366;
    win.pageXOffset = 0;
    win.pageYOffset = 0;
    win.screenLeft = 0;
    win.screenTop = 0;
    win.screenX = 0;
    win.screenY = 0;
    win.scrollX = 0;
    win.scrollY = 0;
    win.screen = {
      availHeight: win.innerHeight,
      availLeft: 0,
      availTop: 0,
      availWidth: win.innerWidth,
      colorDepth: 24,
      height: win.innerHeight,
      keepAwake: false,
      orientation: {
        angle: 0,
        type: 'portrait-primary',
      },
      pixelDepth: 24,
      width: win.innerWidth,
    };
  }
  catch (e) { }
}

class MockDocument extends MockHTMLElement {
  constructor(html = null, win = null) {
    super(null, null);
    this.nodeName = "#document" /* DOCUMENT_NODE */;
    this.nodeType = 9 /* DOCUMENT_NODE */;
    this.defaultView = win;
    this.cookie = '';
    this.referrer = '';
    this.appendChild(this.createDocumentTypeNode());
    if (typeof html === 'string') {
      const parsedDoc = parseDocumentUtil(this, html);
      const documentElement = parsedDoc.children.find(elm => elm.nodeName === 'HTML');
      if (documentElement != null) {
        this.appendChild(documentElement);
        setOwnerDocument(documentElement, this);
      }
    }
    else if (html !== false) {
      const documentElement = new MockHTMLElement(this, 'html');
      this.appendChild(documentElement);
      documentElement.appendChild(new MockHTMLElement(this, 'head'));
      documentElement.appendChild(new MockHTMLElement(this, 'body'));
    }
  }
  get location() {
    if (this.defaultView != null) {
      return this.defaultView.location;
    }
    return null;
  }
  set location(val) {
    if (this.defaultView != null) {
      this.defaultView.location = val;
    }
  }
  get baseURI() {
    const baseNode = this.head.childNodes.find(node => node.nodeName === 'BASE');
    if (baseNode) {
      return baseNode.href;
    }
    return this.URL;
  }
  get URL() {
    return this.location.href;
  }
  get styleSheets() {
    return this.querySelectorAll('style');
  }
  get scripts() {
    return this.querySelectorAll('script');
  }
  get forms() {
    return this.querySelectorAll('form');
  }
  get images() {
    return this.querySelectorAll('img');
  }
  get scrollingElement() {
    return this.documentElement;
  }
  get documentElement() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeName === 'HTML') {
        return this.childNodes[i];
      }
    }
    const documentElement = new MockHTMLElement(this, 'html');
    this.appendChild(documentElement);
    return documentElement;
  }
  set documentElement(documentElement) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeType !== 10 /* DOCUMENT_TYPE_NODE */) {
        this.childNodes[i].remove();
      }
    }
    if (documentElement != null) {
      this.appendChild(documentElement);
      setOwnerDocument(documentElement, this);
    }
  }
  get head() {
    const documentElement = this.documentElement;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        return documentElement.childNodes[i];
      }
    }
    const head = new MockHTMLElement(this, 'head');
    documentElement.insertBefore(head, documentElement.firstChild);
    return head;
  }
  set head(head) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        documentElement.childNodes[i].remove();
      }
    }
    if (head != null) {
      documentElement.insertBefore(head, documentElement.firstChild);
      setOwnerDocument(head, this);
    }
  }
  get body() {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        return documentElement.childNodes[i];
      }
    }
    const body = new MockHTMLElement(this, 'body');
    documentElement.appendChild(body);
    return body;
  }
  set body(body) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        documentElement.childNodes[i].remove();
      }
    }
    if (body != null) {
      documentElement.appendChild(body);
      setOwnerDocument(body, this);
    }
  }
  appendChild(newNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }
  createComment(data) {
    return new MockComment(this, data);
  }
  createAttribute(attrName) {
    return new MockAttr(attrName.toLowerCase(), '');
  }
  createAttributeNS(namespaceURI, attrName) {
    return new MockAttr(attrName, '', namespaceURI);
  }
  createElement(tagName) {
    if (tagName === "#document" /* DOCUMENT_NODE */) {
      const doc = new MockDocument(false);
      doc.nodeName = tagName;
      doc.parentNode = null;
      return doc;
    }
    return createElement(this, tagName);
  }
  createElementNS(namespaceURI, tagName) {
    const elmNs = createElementNS(this, namespaceURI, tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }
  createTextNode(text) {
    return new MockTextNode(this, text);
  }
  createDocumentFragment() {
    return new MockDocumentFragment(this);
  }
  createDocumentTypeNode() {
    return new MockDocumentTypeNode(this);
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  getElementsByName(elmName) {
    return getElementsByName(this, elmName.toLowerCase());
  }
  get title() {
    const title = this.head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title != null && typeof title.textContent === 'string') {
      return title.textContent.trim();
    }
    return '';
  }
  set title(value) {
    const head = this.head;
    let title = head.childNodes.find(elm => elm.nodeName === 'TITLE');
    if (title == null) {
      title = this.createElement('title');
      head.appendChild(title);
    }
    title.textContent = value;
  }
}
function createDocument(html = null) {
  return new MockWindow(html).document;
}
function createFragment(html) {
  return parseHtmlToFragment(html, null);
}
function resetDocument(doc) {
  if (doc != null) {
    resetEventListeners(doc);
    const documentElement = doc.documentElement;
    if (documentElement != null) {
      resetElement(documentElement);
      for (let i = 0, ii = documentElement.childNodes.length; i < ii; i++) {
        const childNode = documentElement.childNodes[i];
        resetElement(childNode);
        childNode.childNodes.length = 0;
      }
    }
    for (const key in doc) {
      if (doc.hasOwnProperty(key) && !DOC_KEY_KEEPERS.has(key)) {
        delete doc[key];
      }
    }
    try {
      doc.nodeName = "#document" /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.nodeType = 9 /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.cookie = '';
    }
    catch (e) { }
    try {
      doc.referrer = '';
    }
    catch (e) { }
  }
}
const DOC_KEY_KEEPERS = new Set([
  'nodeName',
  'nodeType',
  'nodeValue',
  'ownerDocument',
  'parentNode',
  'childNodes',
  '_shadowRoot',
]);
function getElementById(elm, id) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.id === id) {
      return childElm;
    }
    const childElmFound = getElementById(childElm, id);
    if (childElmFound != null) {
      return childElmFound;
    }
  }
  return null;
}
function getElementsByName(elm, elmName, foundElms = []) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.name && childElm.name.toLowerCase() === elmName) {
      foundElms.push(childElm);
    }
    getElementsByName(childElm, elmName, foundElms);
  }
  return foundElms;
}
function setOwnerDocument(elm, ownerDocument) {
  for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
    elm.childNodes[i].ownerDocument = ownerDocument;
    if (elm.childNodes[i].nodeType === 1 /* ELEMENT_NODE */) {
      setOwnerDocument(elm.childNodes[i], ownerDocument);
    }
  }
}

function hydrateFactory($stencilWindow, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve) {
  var globalThis = $stencilWindow;
  var self = $stencilWindow;
  var top = $stencilWindow;
  var parent = $stencilWindow;

  var addEventListener = $stencilWindow.addEventListener.bind($stencilWindow);
  var alert = $stencilWindow.alert.bind($stencilWindow);
  var blur = $stencilWindow.blur.bind($stencilWindow);
  var cancelAnimationFrame = $stencilWindow.cancelAnimationFrame.bind($stencilWindow);
  var cancelIdleCallback = $stencilWindow.cancelIdleCallback.bind($stencilWindow);
  var clearInterval = $stencilWindow.clearInterval.bind($stencilWindow);
  var clearTimeout = $stencilWindow.clearTimeout.bind($stencilWindow);
  var close = () => {};
  var confirm = $stencilWindow.confirm.bind($stencilWindow);
  var dispatchEvent = $stencilWindow.dispatchEvent.bind($stencilWindow);
  var focus = $stencilWindow.focus.bind($stencilWindow);
  var getComputedStyle = $stencilWindow.getComputedStyle.bind($stencilWindow);
  var matchMedia = $stencilWindow.matchMedia.bind($stencilWindow);
  var open = $stencilWindow.open.bind($stencilWindow);
  var prompt = $stencilWindow.prompt.bind($stencilWindow);
  var removeEventListener = $stencilWindow.removeEventListener.bind($stencilWindow);
  var requestAnimationFrame = $stencilWindow.requestAnimationFrame.bind($stencilWindow);
  var requestIdleCallback = $stencilWindow.requestIdleCallback.bind($stencilWindow);
  var setInterval = $stencilWindow.setInterval.bind($stencilWindow);
  var setTimeout = $stencilWindow.setTimeout.bind($stencilWindow);

  var CharacterData = $stencilWindow.CharacterData;
  var CSS = $stencilWindow.CSS;
  var CustomEvent = $stencilWindow.CustomEvent;
  var Document = $stencilWindow.Document;
  var DocumentFragment = $stencilWindow.DocumentFragment;
  var DocumentType = $stencilWindow.DocumentType;
  var DOMTokenList = $stencilWindow.DOMTokenList;
  var Element = $stencilWindow.Element;
  var Event = $stencilWindow.Event;
  var Headers = $stencilWindow.Headers;
  var HTMLAnchorElement = $stencilWindow.HTMLAnchorElement;
  var HTMLBaseElement = $stencilWindow.HTMLBaseElement;
  var HTMLButtonElement = $stencilWindow.HTMLButtonElement;
  var HTMLCanvasElement = $stencilWindow.HTMLCanvasElement;
  var HTMLElement = $stencilWindow.HTMLElement;
  var HTMLFormElement = $stencilWindow.HTMLFormElement;
  var HTMLImageElement = $stencilWindow.HTMLImageElement;
  var HTMLInputElement = $stencilWindow.HTMLInputElement;
  var HTMLLinkElement = $stencilWindow.HTMLLinkElement;
  var HTMLMetaElement = $stencilWindow.HTMLMetaElement;
  var HTMLScriptElement = $stencilWindow.HTMLScriptElement;
  var HTMLStyleElement = $stencilWindow.HTMLStyleElement;
  var HTMLTemplateElement = $stencilWindow.HTMLTemplateElement;
  var HTMLTitleElement = $stencilWindow.HTMLTitleElement;
  var IntersectionObserver = $stencilWindow.IntersectionObserver;
  var KeyboardEvent = $stencilWindow.KeyboardEvent;
  var MouseEvent = $stencilWindow.MouseEvent;
  var Node = $stencilWindow.Node;
  var NodeList = $stencilWindow.NodeList;
  var Request = $stencilWindow.Request;
  var Response = $stencilWindow.Response;
  var URL = $stencilWindow.URL;

  var console = $stencilWindow.console;
  var customElements = $stencilWindow.customElements;
  var history = $stencilWindow.history;
  var localStorage = $stencilWindow.localStorage;
  var location = $stencilWindow.location;
  var navigator = $stencilWindow.navigator;
  var performance = $stencilWindow.performance;
  var sessionStorage = $stencilWindow.sessionStorage;

  var devicePixelRatio = $stencilWindow.devicePixelRatio;
  var innerHeight = $stencilWindow.innerHeight;
  var innerWidth = $stencilWindow.innerWidth;
  var origin = $stencilWindow.origin;
  var pageXOffset = $stencilWindow.pageXOffset;
  var pageYOffset = $stencilWindow.pageYOffset;
  var screen = $stencilWindow.screen;
  var screenLeft = $stencilWindow.screenLeft;
  var screenTop = $stencilWindow.screenTop;
  var screenX = $stencilWindow.screenX;
  var screenY = $stencilWindow.screenY;
  var scrollX = $stencilWindow.scrollX;
  var scrollY = $stencilWindow.scrollY;
  var exports = {};

  function hydrateAppClosure($stencilWindow) {
  const window = $stencilWindow;
  const document = $stencilWindow.document;
  /*hydrateAppClosure start*/


const NAMESPACE = 'wl-components';
const BUILD = /* wl-components */ { allRenderFn: false, appendChildSlotFix: false, asyncLoading: true, attachStyles: true, cloneNodeFix: false, cmpDidLoad: true, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: true, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: true, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: false, disconnectedCallback: true, dynamicImportShim: false, element: false, event: true, hasRenderFn: true, hostListener: true, hostListenerTarget: true, hostListenerTargetBody: false, hostListenerTargetDocument: true, hostListenerTargetParent: false, hostListenerTargetWindow: true, hotModuleReplacement: false, hydrateClientSide: true, hydrateServerSide: true, hydratedAttribute: false, hydratedClass: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: true, lifecycleDOMEvents: false, member: true, method: true, mode: true, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: true, propNumber: true, propString: true, reflect: true, safari10: false, scoped: true, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, shadowDomShim: true, slot: true, slotChildNodesFix: false, slotRelocation: true, state: true, style: true, svg: true, taskQueue: true, updatable: true, vdomAttribute: true, vdomClass: true, vdomFunctional: true, vdomKey: true, vdomListener: true, vdomPropOrAttr: true, vdomRef: true, vdomRender: true, vdomStyle: true, vdomText: true, vdomXlink: true, watchCallback: true };

const getPlatforms = (win) => setupPlatforms(win);
const isPlatform = (winOrPlatform, platform) => {
  if (typeof winOrPlatform === "string") {
    platform = winOrPlatform;
    winOrPlatform = undefined;
  }
  return getPlatforms(winOrPlatform).includes(platform);
};
const setupPlatforms = (win = window) => {
  win.Wl = win.Wl || {};
  let platforms = win.Wl.platforms;
  if (platforms == null) {
    platforms = win.Wl.platforms = detectPlatforms(win);
    platforms.forEach((p) => win.document.documentElement.classList.add(`plt-${p}`));
  }
  return platforms;
};
const detectPlatforms = (win) => Object.keys(PLATFORMS_MAP).filter((p) => PLATFORMS_MAP[p](win));
const isMobileWeb = (win) => isMobile(win) && !isHybrid(win);
const isIpad = (win) => {
  // iOS 12 and below
  if (testUserAgent(win, /iPad/i)) {
    return true;
  }
  // iOS 13+
  if (testUserAgent(win, /Macintosh/i) && isMobile(win)) {
    return true;
  }
  return false;
};
const isIphone = (win) => testUserAgent(win, /iPhone/i);
const isIOS = (win) => testUserAgent(win, /iPhone|iPod/i) || isIpad(win);
const isAndroid = (win) => testUserAgent(win, /android|sink/i);
const isAndroidTablet = (win) => {
  return isAndroid(win) && !testUserAgent(win, /mobile/i);
};
const isPhablet = (win) => {
  const width = win.innerWidth;
  const height = win.innerHeight;
  const smallest = Math.min(width, height);
  const largest = Math.max(width, height);
  return smallest > 390 && smallest < 520 && largest > 620 && largest < 800;
};
const isTablet = (win) => {
  const width = win.innerWidth;
  const height = win.innerHeight;
  const smallest = Math.min(width, height);
  const largest = Math.max(width, height);
  return (isIpad(win) ||
    isAndroidTablet(win) ||
    (smallest > 460 && smallest < 820 && largest > 780 && largest < 1400));
};
const isMobile = (win) => matchMedia(win, "(any-pointer:coarse)");
const isDesktop = (win) => !isMobile(win);
const isHybrid = (win) => isCordova(win) || isCapacitorNative(win);
const isCordova = (win) => !!(win["cordova"] || win["phonegap"] || win["PhoneGap"]);
const isCapacitorNative = (win) => {
  const capacitor = win["Capacitor"];
  return !!(capacitor && capacitor.isNative);
};
const isElectron = (win) => testUserAgent(win, /electron/i);
const isPWA = (win) => !!(win.matchMedia("(display-mode: standalone)").matches ||
  win.navigator.standalone);
const testUserAgent = (win, expr) => expr.test(win.navigator.userAgent);
const matchMedia = (win, query) => win.matchMedia(query).matches;
const PLATFORMS_MAP = {
  ipad: isIpad,
  iphone: isIphone,
  ios: isIOS,
  android: isAndroid,
  phablet: isPhablet,
  tablet: isTablet,
  cordova: isCordova,
  capacitor: isCapacitorNative,
  electron: isElectron,
  pwa: isPWA,
  mobile: isMobile,
  mobileweb: isMobileWeb,
  desktop: isDesktop,
  hybrid: isHybrid,
};

// import { WlConfig } from "./wl-config";
class Config {
  constructor() {
    this.m = new Map();
  }
  reset(configObj) {
    this.m = new Map(Object.entries(configObj));
  }
  get(key, fallback) {
    const value = this.m.get(key);
    return value !== undefined ? value : fallback;
  }
  getBoolean(key, fallback = false) {
    const val = this.m.get(key);
    if (val === undefined) {
      return fallback;
    }
    if (typeof val === "string") {
      return val === "true";
    }
    return !!val;
  }
  getNumber(key, fallback) {
    const val = parseFloat(this.m.get(key));
    return isNaN(val) ? (fallback !== undefined ? fallback : NaN) : val;
  }
  set(key, value) {
    this.m.set(key, value);
  }
}
const config = /*@__PURE__*/ new Config();
const configFromSession = (win) => {
  try {
    const configStr = win.sessionStorage.getItem(WL_SESSION_KEY);
    return configStr !== null ? JSON.parse(configStr) : {};
  }
  catch (e) {
    return {};
  }
};
const saveConfig = (win, c) => {
  try {
    win.sessionStorage.setItem(WL_SESSION_KEY, JSON.stringify(c));
  }
  catch (e) {
    return;
  }
};
const configFromURL = (win) => {
  const configObj = {};
  win.location.search
    .slice(1)
    .split("&")
    .map((entry) => entry.split("="))
    .map(([key, value]) => [decodeURIComponent(key), decodeURIComponent(value)])
    .filter(([key]) => startsWith(key, WL_PREFIX))
    .map(([key, value]) => [key.slice(WL_PREFIX.length), value])
    .forEach(([key, value]) => {
    configObj[key] = value;
  });
  return configObj;
};
const startsWith = (input, search) => {
  return input.substr(0, search.length) === search;
};
const WL_PREFIX = "wl:";
const WL_SESSION_KEY = "wl-persist-config";

let defaultMode;
const getWlMode = (ref) => {
  return (ref && getMode(ref)) || defaultMode;
};
var appGlobalScript = () => {
  const doc = document;
  const win = window;
  const WL = (win.Wl = win.Wl || {});
  // Setup platforms
  setupPlatforms(win);
  // create the WL.config from raw config object (if it exists)
  // and convert WL.config into a ConfigApi that has a get() fn
  const configObj = Object.assign(Object.assign(Object.assign(Object.assign({}, configFromSession(win)), { persistConfig: false }), WL.config), configFromURL(win));
  config.reset(configObj);
  if (config.getBoolean("persistConfig")) {
    saveConfig(win, configObj);
  }
  // first see if the mode was set as an attribute on <html>
  // which could have been set by the user, or by pre-rendering
  // otherwise get the mode via config settings, and fallback to md
  WL.config = config;
  WL.mode = defaultMode = config.get("mode", doc.documentElement.getAttribute("mode") ||
    (isPlatform(win, "ios") ? "ios" : "md"));
  config.set("mode", defaultMode);
  doc.documentElement.setAttribute("mode", defaultMode);
  doc.documentElement.classList.add(defaultMode);
  if (config.getBoolean("_testing")) {
    config.set("animated", false);
  }
  const isWlElement = (elm) => elm.tagName && elm.tagName.startsWith("WL-");
  const isAllowedWlModeValue = (elmMode) => ["ios", "md"].includes(elmMode);
  setMode((elm) => {
    while (elm) {
      const elmMode = elm.mode || elm.getAttribute("mode");
      if (elmMode) {
        if (isAllowedWlModeValue(elmMode)) {
          return elmMode;
        }
        else if (isWlElement(elm)) {
          console.warn('Invalid WL mode: "' + elmMode + '", expected: "ios" or "md"');
        }
      }
      elm = elm.parentElement;
    }
    return defaultMode;
  });
};

const globalScripts = appGlobalScript;

function componentOnReady() {
 return getHostRef(this).$onReadyPromise$;
}

function forceUpdate$1() {}

function hydrateApp(e, t, o, n, s) {
 function a() {
  global.clearTimeout(p), i.clear(), r.clear();
  try {
   t.clientHydrateAnnotations && insertVdomAnnotations(e.document, t.staticComponents), 
   e.document.createElement = c, e.document.createElementNS = $;
  } catch (e) {
   renderCatchError(t, o, e);
  }
  n(e, t, o, s);
 }
 function l(e) {
  renderCatchError(t, o, e), a();
 }
 const r = new Set, i = new Set, d = new Set, c = e.document.createElement, $ = e.document.createElementNS, m = Promise.resolve();
 let p;
 try {
  function h() {
   return f(this);
  }
  function u(e) {
   if (isValidComponent(e, t) && !getHostRef(e)) {
    const t = loadModule({
     $tagName$: e.nodeName.toLowerCase(),
     $flags$: null
    });
    null != t && null != t.cmpMeta && (i.add(e), e.connectedCallback = h, registerHost(e, t.cmpMeta), 
    function o(e, t) {
     if ("function" != typeof e.componentOnReady && (e.componentOnReady = componentOnReady), 
     "function" != typeof e.forceUpdate && (e.forceUpdate = forceUpdate$1), 1 & t.$flags$ && (e.shadowRoot = e), 
     null != t.$members$) {
      const o = getHostRef(e);
      Object.entries(t.$members$).forEach(([n, s]) => {
       const a = s[0];
       if (31 & a) {
        const l = s[1] || n, r = e.getAttribute(l);
        if (null != r) {
         const e = parsePropertyValue(r, a);
         o.$instanceValues$.set(n, e);
        }
        const i = e[n];
        void 0 !== i && (o.$instanceValues$.set(n, i), delete e[n]), Object.defineProperty(e, n, {
         get() {
          return getValue(this, n);
         },
         set(e) {
          setValue(this, n, e, t);
         },
         configurable: !0,
         enumerable: !0
        });
       } else 64 & a && Object.defineProperty(e, n, {
        value() {
         const e = getHostRef(this), t = arguments;
         return e.$onInstancePromise$.then(() => e.$lazyInstance$[n].apply(e.$lazyInstance$, t)).catch(consoleError);
        }
       });
      });
     }
    }(e, t.cmpMeta));
   }
  }
  function f(n) {
   return i.delete(n), isValidComponent(n, t) && o.hydratedCount < t.maxHydrateCount && !r.has(n) && function e(t) {
    if (9 === t.nodeType) return !0;
    if (NO_HYDRATE_TAGS.has(t.nodeName)) return !1;
    if (t.hasAttribute("no-prerender")) return !1;
    const o = t.parentNode;
    return null == o || e(o);
   }(n) ? (r.add(n), async function s(e, t, o, n, a) {
    o = o.toLowerCase();
    const l = loadModule({
     $tagName$: o,
     $flags$: null
    });
    if (null != l && null != l.cmpMeta) {
     a.add(n);
     try {
      connectedCallback(n), await n.componentOnReady(), t.hydratedCount++;
      const e = getHostRef(n), s = e.$modeName$ ? e.$modeName$ : "$";
      t.components.some(e => e.tag === o && e.mode === s) || t.components.push({
       tag: o,
       mode: s,
       count: 0,
       depth: -1
      });
     } catch (t) {
      e.console.error(t);
     }
     a.delete(n);
    }
   }(e, o, n.nodeName, n, d)) : m;
  }
  e.document.createElement = function t(o) {
   const n = c.call(e.document, o);
   return u(n), n;
  }, e.document.createElementNS = function t(o, n) {
   const s = $.call(e.document, o, n);
   return u(s), s;
  }, p = global.setTimeout((function g() {
   l("Hydrate exceeded timeout" + function e(t) {
    return Array.from(t).map(waitingOnElementMsg);
   }(d));
  }), t.timeout), plt.$resourcesUrl$ = new URL(t.resourcesUrl || "./", doc.baseURI).href, 
  globalScripts(), function e(t) {
   if (null != t && 1 === t.nodeType) {
    u(t);
    const o = t.children;
    for (let t = 0, n = o.length; t < n; t++) e(o[t]);
   }
  }(e.document.body), function e() {
   const t = Array.from(i).filter(e => e.parentElement);
   return t.length > 0 ? Promise.all(t.map(f)).then(e) : m;
  }().then(a).catch(l);
 } catch (e) {
  l(e);
 }
}

function isValidComponent(e, t) {
 if (null != e && 1 === e.nodeType) {
  const o = e.nodeName;
  if ("string" == typeof o && o.includes("-")) return !t.excludeComponents.includes(o.toLowerCase());
 }
 return !1;
}

function renderCatchError(e, t, o) {
 const n = {
  level: "error",
  type: "build",
  header: "Hydrate Error",
  messageText: "",
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 if (e.url) try {
  const t = new URL(e.url);
  "/" !== t.pathname && (n.header += ": " + t.pathname);
 } catch (e) {}
 null != o && (null != o.stack ? n.messageText = o.stack.toString() : null != o.message ? n.messageText = o.message.toString() : n.messageText = o.toString()), 
 t.diagnostics.push(n);
}

function printTag(e) {
 let t = "<" + e.nodeName.toLowerCase();
 if (Array.isArray(e.attributes)) for (let o = 0; o < e.attributes.length; o++) {
  const n = e.attributes[o];
  t += " " + n.name, "" !== n.value && (t += `="${n.value}"`);
 }
 return t += ">", t;
}

function waitingOnElementMsg(e) {
 let t = "";
 if (e) {
  const o = [];
  t = " - waiting on:";
  let n = e;
  for (;n && 9 !== n.nodeType && "BODY" !== n.nodeName; ) o.unshift(printTag(n)), 
  n = n.parentElement;
  let s = "";
  for (const e of o) s += "  ", t += `\n${s}${e}`;
 }
 return t;
}

const addHostEventListeners = (e, t, o, n) => {
  o && (o.map(([o, n, s]) => {
  const a =  getHostListenerTarget(e, o) , l = hostListenerProxy(t, s), r = hostListenerOpts(o);
  plt.ael(a, n, l, r), (t.$rmListeners$ = t.$rmListeners$ || []).push(() => plt.rel(a, n, l, r));
 }));
}, hostListenerProxy = (e, t) => o => {
  256 & e.$flags$ ? e.$lazyInstance$[t](o) : (e.$queuedListeners$ = e.$queuedListeners$ || []).push([ t, o ]) ;
}, getHostListenerTarget = (e, t) =>  4 & t ? doc :  8 & t ? win :   e, hostListenerOpts = e => 0 != (2 & e), XLINK_NS = "http://www.w3.org/1999/xlink";

const createTime = (e, t = "") => {
 return () => {};
}, rootAppliedStyles = new WeakMap, registerStyle = (e, t, o) => {
 let n = styles.get(e);
 n = t, styles.set(e, n);
}, addStyle = (e, t, o, n) => {
 let s = getScopeId(t, o), a = styles.get(s);
 if (e = 11 === e.nodeType ? e : doc, a) if ("string" == typeof a) {
  e = e.head || e;
  let o, l = rootAppliedStyles.get(e);
  if (l || rootAppliedStyles.set(e, l = new Set), !l.has(s)) {
   if ( e.host && (o = e.querySelector(`[sty-id="${s}"]`))) o.innerHTML = a; else {
    o = doc.createElement("style"), o.innerHTML = a;
     o.setAttribute("sty-id", s), 
    e.insertBefore(o, e.querySelector("link"));
   }
   l && l.add(s);
  }
 }
 return s;
}, attachStyles = e => {
 const t = e.$cmpMeta$, o = e.$hostElement$, n = t.$flags$, s = createTime("attachStyles", t.$tagName$), a = addStyle( o.getRootNode(), t, e.$modeName$);
  10 & n && (o["s-sc"] = a, 
 o.classList.add(a + "-h"),  2 & n && o.classList.add(a + "-s")), 
 s();
}, getScopeId = (e, t) => "sc-" + ( t && 32 & e.$flags$ ? e.$tagName$ + "-" + t : e.$tagName$), computeMode = e => modeResolutionChain.map(t => t(e)).find(e => !!e), setMode = e => modeResolutionChain.push(e), getMode = e => getHostRef(e).$modeName$, EMPTY_OBJ = {}, isComplexType = e => "object" == (e = typeof e) || "function" === e, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, h = (e, t, ...o) => {
 let n = null, s = null, a = null, l = !1, r = !1, i = [];
 const d = t => {
  for (let o = 0; o < t.length; o++) n = t[o], Array.isArray(n) ? d(n) : null != n && "boolean" != typeof n && ((l = "function" != typeof e && !isComplexType(n)) ? n = String(n) : BUILD.isDev  , 
  l && r ? i[i.length - 1].$text$ += n : i.push(l ? newVNode(null, n) : n), r = l);
 };
 if (d(o), t && ( t.key && (s = t.key), 
  t.name && (a = t.name), BUILD.vdomClass)) {
  const e = t.className || t.class;
  e && (t.class = "object" != typeof e ? e : Object.keys(e).filter(t => e[t]).join(" "));
 }
 if ( "function" == typeof e) return e(null === t ? {} : t, i, vdomFnUtils);
 const c = newVNode(e, null);
 return c.$attrs$ = t, i.length > 0 && (c.$children$ = i),  (c.$key$ = s), 
  (c.$name$ = a), c;
}, newVNode = (e, t) => {
 const o = {
  $flags$: 0,
  $tag$: e,
  $text$: t,
  $elm$: null,
  $children$: null
 };
 return  (o.$attrs$ = null),  (o.$key$ = null), 
  (o.$name$ = null), o;
}, Host = {}, isHost = e => e && e.$tag$ === Host, vdomFnUtils = {
 forEach: (e, t) => e.map(convertToPublic).forEach(t),
 map: (e, t) => e.map(convertToPublic).map(t).map(convertToPrivate)
}, convertToPublic = e => ({
 vattrs: e.$attrs$,
 vchildren: e.$children$,
 vkey: e.$key$,
 vname: e.$name$,
 vtag: e.$tag$,
 vtext: e.$text$
}), convertToPrivate = e => {
 if ("function" == typeof e.vtag) {
  const t = {
   ...e.vattrs
  };
  return e.vkey && (t.key = e.vkey), e.vname && (t.name = e.vname), h(e.vtag, t, ...e.vchildren || []);
 }
 const t = newVNode(e.vtag, e.vtext);
 return t.$attrs$ = e.vattrs, t.$children$ = e.vchildren, t.$key$ = e.vkey, t.$name$ = e.vname, 
 t;
}, setAccessor = (e, t, o, n, s, a) => {
 if (o !== n) {
  let l = isMemberInElement(e, t), r = t.toLowerCase();
  if ( "class" === t) {
   const t = e.classList, s = parseClassList(o), a = parseClassList(n);
   t.remove(...s.filter(e => e && !a.includes(e))), t.add(...a.filter(e => e && !s.includes(e)));
  } else if ( "style" === t) {
   for (const t in o) n && null != n[t] || ( e.style[t] = "");
   for (const t in n) o && n[t] === o[t] || ( e.style[t] = n[t]);
  } else if ( "key" === t) ; else if ( "ref" === t) n && n(e); else if ( ( l ) || "o" !== t[0] || "n" !== t[1]) {
   {
    const i = isComplexType(n);
    if ((l || i && null !== n) && !s) try {
     if (e.tagName.includes("-")) e[t] = n; else {
      let s = null == n ? "" : n;
      "list" === t ? l = !1 : null != o && e[t] == s || (e[t] = s);
     }
    } catch (e) {}
    let d = !1;
     r !== (r = r.replace(/^xlink\:?/, "")) && (t = r, d = !0), null == n || !1 === n ? !1 === n && "" !== e.getAttribute(t) || ( d ? e.removeAttributeNS(XLINK_NS, t) : e.removeAttribute(t)) : (!l || 4 & a || s) && !i && (n = !0 === n ? "" : n, 
     d ? e.setAttributeNS(XLINK_NS, t, n) : e.setAttribute(t, n));
   }
  } else t = "-" === t[2] ? t.slice(3) : isMemberInElement(win, r) ? r.slice(2) : r[2] + t.slice(3), 
  o && plt.rel(e, t, o, !1), n && plt.ael(e, t, n, !1);
 }
}, parseClassListRegex = /\s/, parseClassList = e => e ? e.split(parseClassListRegex) : [], updateElement = (e, t, o, n) => {
 const s = 11 === t.$elm$.nodeType && t.$elm$.host ? t.$elm$.host : t.$elm$, a = e && e.$attrs$ || EMPTY_OBJ, l = t.$attrs$ || EMPTY_OBJ;
 for (n in a) n in l || setAccessor(s, n, a[n], void 0, o, t.$flags$);
 for (n in l) setAccessor(s, n, a[n], l[n], o, t.$flags$);
};

let scopeId, contentRef, hostTagName, useNativeShadowDom = !1, checkSlotFallbackVisibility = !1, checkSlotRelocate = !1, isSvgMode = !1;

const createElm = (e, t, o, n) => {
 let s, a, l, r = t.$children$[o], i = 0;
 if ( !useNativeShadowDom && (checkSlotRelocate = !0, "slot" === r.$tag$ && (scopeId && n.classList.add(scopeId + "-s"), 
 r.$flags$ |= r.$children$ ? 2 : 1)),  null !== r.$text$) s = r.$elm$ = doc.createTextNode(r.$text$); else if ( 1 & r.$flags$) s = r.$elm$ =  slotReferenceDebugNode(r) ; else {
  if ( !isSvgMode && (isSvgMode = "svg" === r.$tag$), s = r.$elm$ =  doc.createElementNS(isSvgMode ? "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml",  2 & r.$flags$ ? "slot-fb" : r.$tag$) , 
   isSvgMode && "foreignObject" === r.$tag$ && (isSvgMode = !1),  updateElement(null, r, isSvgMode), 
   null != scopeId && s["s-si"] !== scopeId && s.classList.add(s["s-si"] = scopeId), 
  r.$children$) for (i = 0; i < r.$children$.length; ++i) a = createElm(e, r, i, s), 
  a && s.appendChild(a);
   ("svg" === r.$tag$ ? isSvgMode = !1 : "foreignObject" === s.tagName && (isSvgMode = !0));
 }
 return  (s["s-hn"] = hostTagName, 3 & r.$flags$ && (s["s-sr"] = !0, 
 s["s-cr"] = contentRef, s["s-sn"] = r.$name$ || "", l = e && e.$children$ && e.$children$[o], 
 l && l.$tag$ === r.$tag$ && e.$elm$ && putBackInOriginalLocation(e.$elm$, !1))), 
 s;
}, putBackInOriginalLocation = (e, t) => {
 plt.$flags$ |= 1;
 const o = e.childNodes;
 for (let e = o.length - 1; e >= 0; e--) {
  const n = o[e];
  n["s-hn"] !== hostTagName && n["s-ol"] && (parentReferenceNode(n).insertBefore(n, referenceNode(n)), 
  n["s-ol"].remove(), n["s-ol"] = void 0, checkSlotRelocate = !0), t && putBackInOriginalLocation(n, t);
 }
 plt.$flags$ &= -2;
}, addVnodes = (e, t, o, n, s, a) => {
 let l, r =  e["s-cr"] && e["s-cr"].parentNode || e;
 for ( r.shadowRoot && r.tagName === hostTagName && (r = r.shadowRoot); s <= a; ++s) n[s] && (l = createElm(null, o, s, e), 
 l && (n[s].$elm$ = l, r.insertBefore(l,  referenceNode(t) )));
}, removeVnodes = (e, t, o, n, s) => {
 for (;t <= o; ++t) (n = e[t]) && (s = n.$elm$, callNodeRefs(n),  (checkSlotFallbackVisibility = !0, 
 s["s-ol"] ? s["s-ol"].remove() : putBackInOriginalLocation(s, !0)), s.remove());
}, isSameVnode = (e, t) => e.$tag$ === t.$tag$ && ( "slot" === e.$tag$ ? e.$name$ === t.$name$ :  e.$key$ === t.$key$), referenceNode = e => e && e["s-ol"] || e, parentReferenceNode = e => (e["s-ol"] ? e["s-ol"] : e).parentNode, patch = (e, t) => {
 const o = t.$elm$ = e.$elm$, n = e.$children$, s = t.$children$, a = t.$tag$, l = t.$text$;
 let r;
  null !== l ?  (r = o["s-cr"]) ? r.parentNode.textContent = l :  e.$text$ !== l && (o.data = l) : ( (isSvgMode = "svg" === a || "foreignObject" !== a && isSvgMode), 
  ( "slot" === a || updateElement(e, t, isSvgMode)), 
  null !== n && null !== s ? ((e, t, o, n) => {
  let s, a, l = 0, r = 0, i = 0, d = 0, c = t.length - 1, $ = t[0], m = t[c], p = n.length - 1, h = n[0], u = n[p];
  for (;l <= c && r <= p; ) if (null == $) $ = t[++l]; else if (null == m) m = t[--c]; else if (null == h) h = n[++r]; else if (null == u) u = n[--p]; else if (isSameVnode($, h)) patch($, h), 
  $ = t[++l], h = n[++r]; else if (isSameVnode(m, u)) patch(m, u), m = t[--c], u = n[--p]; else if (isSameVnode($, u))  "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation($.$elm$.parentNode, !1), 
  patch($, u), e.insertBefore($.$elm$, m.$elm$.nextSibling), $ = t[++l], u = n[--p]; else if (isSameVnode(m, h))  "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation(m.$elm$.parentNode, !1), 
  patch(m, h), e.insertBefore(m.$elm$, $.$elm$), m = t[--c], h = n[++r]; else {
   if (i = -1, BUILD.vdomKey) for (d = l; d <= c; ++d) if (t[d] && null !== t[d].$key$ && t[d].$key$ === h.$key$) {
    i = d;
    break;
   }
    i >= 0 ? (a = t[i], a.$tag$ !== h.$tag$ ? s = createElm(t && t[r], o, i, e) : (patch(a, h), 
   t[i] = void 0, s = a.$elm$), h = n[++r]) : (s = createElm(t && t[r], o, r, e), h = n[++r]), 
   s && ( parentReferenceNode($.$elm$).insertBefore(s, referenceNode($.$elm$)) );
  }
  l > c ? addVnodes(e, null == n[p + 1] ? null : n[p + 1].$elm$, o, n, r, p) :  r > p && removeVnodes(t, l, c);
 })(o, n, t, s) : null !== s ? ( null !== e.$text$ && (o.textContent = ""), 
 addVnodes(o, null, t, s, 0, s.length - 1)) :  null !== n && removeVnodes(n, 0, n.length - 1), 
  isSvgMode && "svg" === a && (isSvgMode = !1));
}, updateFallbackSlotVisibility = e => {
 let t, o, n, s, a, l, r = e.childNodes;
 for (o = 0, n = r.length; o < n; o++) if (t = r[o], 1 === t.nodeType) {
  if (t["s-sr"]) for (a = t["s-sn"], t.hidden = !1, s = 0; s < n; s++) if (r[s]["s-hn"] !== t["s-hn"]) if (l = r[s].nodeType, 
  "" !== a) {
   if (1 === l && a === r[s].getAttribute("slot")) {
    t.hidden = !0;
    break;
   }
  } else if (1 === l || 3 === l && "" !== r[s].textContent.trim()) {
   t.hidden = !0;
   break;
  }
  updateFallbackSlotVisibility(t);
 }
}, relocateNodes = [], relocateSlotContent = e => {
 let t, o, n, s, a, l, r = 0, i = e.childNodes, d = i.length;
 for (;r < d; r++) {
  if (t = i[r], t["s-sr"] && (o = t["s-cr"])) for (n = o.parentNode.childNodes, s = t["s-sn"], 
  l = n.length - 1; l >= 0; l--) o = n[l], o["s-cn"] || o["s-nr"] || o["s-hn"] === t["s-hn"] || (isNodeLocatedInSlot(o, s) ? (a = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
  checkSlotFallbackVisibility = !0, o["s-sn"] = o["s-sn"] || s, a ? a.$slotRefNode$ = t : relocateNodes.push({
   $slotRefNode$: t,
   $nodeToRelocate$: o
  }), o["s-sr"] && relocateNodes.map(e => {
   isNodeLocatedInSlot(e.$nodeToRelocate$, o["s-sn"]) && (a = relocateNodes.find(e => e.$nodeToRelocate$ === o), 
   a && !e.$slotRefNode$ && (e.$slotRefNode$ = a.$slotRefNode$));
  })) : relocateNodes.some(e => e.$nodeToRelocate$ === o) || relocateNodes.push({
   $nodeToRelocate$: o
  }));
  1 === t.nodeType && relocateSlotContent(t);
 }
}, isNodeLocatedInSlot = (e, t) => 1 === e.nodeType ? null === e.getAttribute("slot") && "" === t || e.getAttribute("slot") === t : e["s-sn"] === t || "" === t, callNodeRefs = e => {
  (e.$attrs$ && e.$attrs$.ref && e.$attrs$.ref(null), e.$children$ && e.$children$.map(callNodeRefs));
}, renderVdom = (e, t) => {
 const o = e.$hostElement$, n = e.$cmpMeta$, s = e.$vnode$ || newVNode(null, null), a = isHost(t) ? t : h(null, null, t);
 if (hostTagName = o.tagName, BUILD.isDev  ) ;
 if ( n.$attrsToReflect$ && (a.$attrs$ = a.$attrs$ || {}, n.$attrsToReflect$.map(([e, t]) => a.$attrs$[t] = o[e])), 
 a.$tag$ = null, a.$flags$ |= 4, e.$vnode$ = a, a.$elm$ = s.$elm$ =  o.shadowRoot || o, 
  (scopeId = o["s-sc"]),  (contentRef = o["s-cr"], 
 useNativeShadowDom = supportsShadow, checkSlotFallbackVisibility = !1), patch(s, a), 
 BUILD.slotRelocation) {
  if (plt.$flags$ |= 1, checkSlotRelocate) {
   let e, t, o, n, s, l;
   relocateSlotContent(a.$elm$);
   let r = 0;
   for (;r < relocateNodes.length; r++) e = relocateNodes[r], t = e.$nodeToRelocate$, 
   t["s-ol"] || (o =  originalLocationDebugNode(t) , 
   o["s-nr"] = t, t.parentNode.insertBefore(t["s-ol"] = o, t));
   for (r = 0; r < relocateNodes.length; r++) if (e = relocateNodes[r], t = e.$nodeToRelocate$, 
   e.$slotRefNode$) {
    for (n = e.$slotRefNode$.parentNode, s = e.$slotRefNode$.nextSibling, o = t["s-ol"]; o = o.previousSibling; ) if (l = o["s-nr"], 
    l && l["s-sn"] === t["s-sn"] && n === l.parentNode && (l = l.nextSibling, !l || !l["s-nr"])) {
     s = l;
     break;
    }
    (!s && n !== t.parentNode || t.nextSibling !== s) && t !== s && (!t["s-hn"] && t["s-ol"] && (t["s-hn"] = t["s-ol"].parentNode.nodeName), 
    n.insertBefore(t, s));
   } else 1 === t.nodeType && (t.hidden = !0);
  }
  checkSlotFallbackVisibility && updateFallbackSlotVisibility(a.$elm$), plt.$flags$ &= -2, 
  relocateNodes.length = 0;
 }
}, slotReferenceDebugNode = e => doc.createComment(`<slot${e.$name$ ? ' name="' + e.$name$ + '"' : ""}> (host=${hostTagName.toLowerCase()})`), originalLocationDebugNode = e => doc.createComment("org-location for " + (e.localName ? `<${e.localName}> (host=${e["s-hn"]})` : `[${e.textContent}]`)), getElement = e =>  getHostRef(e).$hostElement$ , createEvent = (e, t, o) => {
 const n = getElement(e);
 return {
  emit: e => (emitEvent(n, t, {
   bubbles: !!(4 & o),
   composed: !!(2 & o),
   cancelable: !!(1 & o),
   detail: e
  }))
 };
}, emitEvent = (e, t, o) => {
 const n = plt.ce(t, o);
 return e.dispatchEvent(n), n;
}, attachToAncestor = (e, t) => {
  t && !e.$onRenderResolve$ && t["s-p"] && t["s-p"].push(new Promise(t => e.$onRenderResolve$ = t));
}, scheduleUpdate = (e, t) => {
 if ( (e.$flags$ |= 16),  4 & e.$flags$) return void (e.$flags$ |= 512);
 attachToAncestor(e, e.$ancestorComponent$);
 const o = () => dispatchHooks(e, t);
 return  writeTask(o) ;
}, dispatchHooks = (e, t) => {
 const n = createTime("scheduleUpdate", e.$cmpMeta$.$tagName$), s =  e.$lazyInstance$ ;
 let a;
 return t ? ( (e.$flags$ |= 256, e.$queuedListeners$ && (e.$queuedListeners$.map(([e, t]) => safeCall(s, e, t)), 
 e.$queuedListeners$ = null)),  (a = safeCall(s, "componentWillLoad"))) : (BUILD.cmpWillUpdate ), n(), then(a, () => updateComponent(e, s, t));
}, updateComponent = async (e, t, o) => {
 const n = e.$hostElement$, s = createTime("update", e.$cmpMeta$.$tagName$), a = n["s-rc"];
  o && attachStyles(e);
 const l = createTime("render", e.$cmpMeta$.$tagName$);
 if ( (  renderVdom(e, await callRender(e, t))  ), 
 BUILD.hydrateServerSide) try {
  serverSideConnected(n), o && (1 & e.$cmpMeta$.$flags$ ? n["s-en"] = "" : 2 & e.$cmpMeta$.$flags$ && (n["s-en"] = "c"));
 } catch (e) {
  consoleError(e);
 }
 if ( a && (a.map(e => e()), n["s-rc"] = void 0), l(), s(), 
 BUILD.asyncLoading) {
  const t = n["s-p"], o = () => postUpdateComponent(e);
  0 === t.length ? o() : (Promise.all(t).then(o), e.$flags$ |= 4, t.length = 0);
 }
};

const callRender = (e, t) => {
 try {
  t = ( t.render) && t.render(),  (e.$flags$ &= -17), 
   (e.$flags$ |= 2);
 } catch (e) {
  consoleError(e);
 }
 return t;
}, postUpdateComponent = e => {
 const t = e.$cmpMeta$.$tagName$, o = e.$hostElement$, n = createTime("postUpdate", t), s =  e.$lazyInstance$ , a = e.$ancestorComponent$;
 64 & e.$flags$ ? (n()) : (e.$flags$ |= 64,  addHydratedFlag(o), 
  (safeCall(s, "componentDidLoad"), 
 BUILD.isDev ), n(),  (e.$onReadyResolve$(o), a || appDidLoad())),  e.$onInstanceResolve$(o),  (e.$onRenderResolve$ && (e.$onRenderResolve$(), 
 e.$onRenderResolve$ = void 0), 512 & e.$flags$ && nextTick(() => scheduleUpdate(e, !1)), 
 e.$flags$ &= -517);
}, forceUpdate = e => {
 {
  const t = getHostRef(e), o = t.$hostElement$.isConnected;
  return o && 2 == (18 & t.$flags$) && scheduleUpdate(t, !1), o;
 }
}, appDidLoad = e => {
  addHydratedFlag(doc.documentElement), nextTick(() => emitEvent(win, "appload", {
  detail: {
   namespace: NAMESPACE
  }
 })), BUILD.profile  ;
}, safeCall = (e, t, o) => {
 if (e && e[t]) try {
  return e[t](o);
 } catch (e) {
  consoleError(e);
 }
}, then = (e, t) => e && e.then ? e.then(t) : t(), addHydratedFlag = e =>  e.classList.add("hydrated") , serverSideConnected = e => {
 const t = e.children;
 if (null != t) for (let e = 0, o = t.length; e < o; e++) {
  const o = t[e];
  "function" == typeof o.connectedCallback && o.connectedCallback(), serverSideConnected(o);
 }
}, clientHydrate = (e, t, o, n, s, a, l) => {
 let r, i, d, c;
 if (1 === a.nodeType) {
  for (r = a.getAttribute("c-id"), r && (i = r.split("."), i[0] !== l && "0" !== i[0] || (d = {
   $flags$: 0,
   $hostId$: i[0],
   $nodeId$: i[1],
   $depth$: i[2],
   $index$: i[3],
   $tag$: a.tagName.toLowerCase(),
   $elm$: a,
   $attrs$: null,
   $children$: null,
   $key$: null,
   $name$: null,
   $text$: null
  }, t.push(d), a.removeAttribute("c-id"), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
  e = d, n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))), c = a.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, a.childNodes[c], l);
  if (a.shadowRoot) for (c = a.shadowRoot.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, a.shadowRoot.childNodes[c], l);
 } else if (8 === a.nodeType) i = a.nodeValue.split("."), i[1] !== l && "0" !== i[1] || (r = i[0], 
 d = {
  $flags$: 0,
  $hostId$: i[1],
  $nodeId$: i[2],
  $depth$: i[3],
  $index$: i[4],
  $elm$: a,
  $attrs$: null,
  $children$: null,
  $key$: null,
  $name$: null,
  $tag$: null,
  $text$: null
 }, "t" === r ? (d.$elm$ = a.nextSibling, d.$elm$ && 3 === d.$elm$.nodeType && (d.$text$ = d.$elm$.textContent, 
 t.push(d), a.remove(), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
 n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))) : d.$hostId$ === l && ("s" === r ? (d.$tag$ = "slot", 
 i[5] ? a["s-sn"] = d.$name$ = i[5] : a["s-sn"] = "", a["s-sr"] = !0,  n && (d.$elm$ = doc.createElement(d.$tag$), 
 d.$name$ && d.$elm$.setAttribute("name", d.$name$), a.parentNode.insertBefore(d.$elm$, a), 
 a.remove(), "0" === d.$depth$ && (n[d.$index$] = d.$elm$)), o.push(d), e.$children$ || (e.$children$ = []), 
 e.$children$[d.$index$] = d) : "r" === r && ( n ? a.remove() :  (s["s-cr"] = a, 
 a["s-cn"] = !0)))); else if (e && "style" === e.$tag$) {
  const t = newVNode(null, a.textContent);
  t.$elm$ = a, t.$index$ = "0", e.$children$ = [ t ];
 }
}, initializeDocumentHydrate = (e, t) => {
 if (1 === e.nodeType) {
  let o = 0;
  for (;o < e.childNodes.length; o++) initializeDocumentHydrate(e.childNodes[o], t);
  if (e.shadowRoot) for (o = 0; o < e.shadowRoot.childNodes.length; o++) initializeDocumentHydrate(e.shadowRoot.childNodes[o], t);
 } else if (8 === e.nodeType) {
  const o = e.nodeValue.split(".");
  "o" === o[0] && (t.set(o[1] + "." + o[2], e), e.nodeValue = "", e["s-en"] = o[3]);
 }
}, parsePropertyValue = (e, t) => null == e || isComplexType(e) ? e :  4 & t ? "false" !== e && ("" === e || !!e) :  2 & t ? parseFloat(e) :  1 & t ? String(e) : e, getValue = (e, t) => getHostRef(e).$instanceValues$.get(t), setValue = (e, t, o, n) => {
 const s = getHostRef(e), l = s.$instanceValues$.get(t), r = s.$flags$, i =  s.$lazyInstance$ ;
 if (o = parsePropertyValue(o, n.$members$[t][0]), !( 8 & r && void 0 !== l || o === l) && (s.$instanceValues$.set(t, o), 
  i)) {
  if ( n.$watchers$ && 128 & r) {
   const e = n.$watchers$[t];
   e && e.map(e => {
    try {
     i[e](o, l, t);
    } catch (e) {
     consoleError(e);
    }
   });
  }
  if ( 2 == (18 & r)) {
   scheduleUpdate(s, !1);
  }
 }
}, proxyComponent = (e, t, o) => {
 if ( t.$members$) {
   e.watchers && (t.$watchers$ = e.watchers);
  const n = Object.entries(t.$members$), s = e.prototype;
  if (n.map(([e, [n]]) => {
    (31 & n || ( 2 & o) && 32 & n) ? Object.defineProperty(s, e, {
    get() {
     return getValue(this, e);
    },
    set(s) {
     setValue(this, e, s, t);
    },
    configurable: !0,
    enumerable: !0
   }) :  1 & o && 64 & n && Object.defineProperty(s, e, {
    value(...t) {
     const o = getHostRef(this);
     return o.$onInstancePromise$.then(() => o.$lazyInstance$[e](...t));
    }
   });
  }),  ( 1 & o)) {
   const o = new Map;
   s.attributeChangedCallback = function(e, t, n) {
    plt.jmp(() => {
     const t = o.get(e);
     this[t] = (null !== n || "boolean" != typeof this[t]) && n;
    });
   }, e.observedAttributes = n.filter(([e, t]) => 15 & t[0]).map(([e, n]) => {
    const s = n[1] || e;
    return o.set(s, e),  512 & n[0] && t.$attrsToReflect$.push([ e, s ]), 
    s;
   });
  }
 }
 return e;
}, initializeComponent = async (e, t, o, n, s) => {
 if ( 0 == (32 & t.$flags$)) {
  {
   if (t.$flags$ |= 32, (s = loadModule(o)).then) {
    const e = ( () => {});
    s = await s, e();
   }
    !s.isProxied && ( (o.$watchers$ = s.watchers), 
   proxyComponent(s, o, 2), s.isProxied = !0);
   const e = createTime("createInstance", o.$tagName$);
    (t.$flags$ |= 8);
   try {
    new s(t);
   } catch (e) {
    consoleError(e);
   }
    (t.$flags$ &= -9),  (t.$flags$ |= 128), e(), 
   fireConnectedCallback(t.$lazyInstance$);
  }
  if ( s.style) {
   let n = s.style;
    "string" != typeof n && (n = n[t.$modeName$ = computeMode(e)],  t.$modeName$ && e.setAttribute("s-mode", t.$modeName$));
   const a = getScopeId(o, t.$modeName$);
   if (!styles.has(a)) {
    const e = createTime("registerStyles", o.$tagName$);
    registerStyle(a, n), e();
   }
  }
 }
 const r = t.$ancestorComponent$, i = () => scheduleUpdate(t, !0);
  r && r["s-rc"] ? r["s-rc"].push(i) : i();
}, fireConnectedCallback = e => {
  safeCall(e, "connectedCallback");
}, connectedCallback = e => {
 if (0 == (1 & plt.$flags$)) {
  const t = getHostRef(e), o = t.$cmpMeta$, n = createTime("connectedCallback", o.$tagName$);
  if (1 & t.$flags$) addHostEventListeners(e, t, o.$listeners$), fireConnectedCallback(t.$lazyInstance$); else {
   let n;
   if (t.$flags$ |= 1,  (n = e.getAttribute("s-id"), n)) {
    ((e, t, o, n) => {
     const s = createTime("hydrateClient", t), a = e.shadowRoot, l = [], r =  a ? [] : null, i = n.$vnode$ = newVNode(t, null);
     plt.$orgLocNodes$ || initializeDocumentHydrate(doc.body, plt.$orgLocNodes$ = new Map), 
     e["s-id"] = o, e.removeAttribute("s-id"), clientHydrate(i, l, [], r, e, e, o), l.map(e => {
      const o = e.$hostId$ + "." + e.$nodeId$, n = plt.$orgLocNodes$.get(o), s = e.$elm$;
      n && supportsShadow && "" === n["s-en"] && n.parentNode.insertBefore(s, n.nextSibling), 
      a || (s["s-hn"] = t, n && (s["s-ol"] = n, s["s-ol"]["s-nr"] = s)), plt.$orgLocNodes$.delete(o);
     }),  a && r.map(e => {
      e && a.appendChild(e);
     }), s();
    })(e, o.$tagName$, n, t);
   }
   if ( !n && (BUILD.hydrateServerSide ) && setContentReference(e), 
   BUILD.asyncLoading) {
    let o = e;
    for (;o = o.parentNode || o.host; ) if ( 1 === o.nodeType && o.hasAttribute("s-id") && o["s-p"] || o["s-p"]) {
     attachToAncestor(t, t.$ancestorComponent$ = o);
     break;
    }
   }
    initializeComponent(e, t, o);
  }
  n();
 }
}, setContentReference = e => {
 const t = e["s-cr"] = doc.createComment( "");
 t["s-cn"] = !0, e.insertBefore(t, e.firstChild);
}, insertVdomAnnotations = (e, t) => {
 if (null != e) {
  const o = {
   hostIds: 0,
   rootLevelIds: 0,
   staticComponents: new Set(t)
  }, n = [];
  parseVNodeAnnotations(e, e.body, o, n), n.forEach(t => {
   if (null != t) {
    const n = t["s-nr"];
    let s = n["s-host-id"], a = n["s-node-id"], l = `${s}.${a}`;
    if (null == s) if (s = 0, o.rootLevelIds++, a = o.rootLevelIds, l = `${s}.${a}`, 
    1 === n.nodeType) n.setAttribute("c-id", l); else if (3 === n.nodeType) {
     if (0 === s && "" === n.nodeValue.trim()) return void t.remove();
     const o = e.createComment(l);
     o.nodeValue = "t." + l, n.parentNode.insertBefore(o, n);
    }
    let r = "o." + l;
    const i = t.parentElement;
    i && ("" === i["s-en"] ? r += "." : "c" === i["s-en"] && (r += ".c")), t.nodeValue = r;
   }
  });
 }
}, parseVNodeAnnotations = (e, t, o, n) => {
 null != t && (null != t["s-nr"] && n.push(t), 1 === t.nodeType && t.childNodes.forEach(t => {
  const s = getHostRef(t);
  if (null != s && !o.staticComponents.has(t.nodeName.toLowerCase())) {
   const n = {
    nodeIds: 0
   };
   insertVNodeAnnotations(e, t, s.$vnode$, o, n);
  }
  parseVNodeAnnotations(e, t, o, n);
 }));
}, insertVNodeAnnotations = (e, t, o, n, s) => {
 if (null != o) {
  const a = ++n.hostIds;
  if (t.setAttribute("s-id", a), null != t["s-cr"] && (t["s-cr"].nodeValue = "r." + a), 
  null != o.$children$) {
   const t = 0;
   o.$children$.forEach((o, n) => {
    insertChildVNodeAnnotations(e, o, s, a, t, n);
   });
  }
  if (t && o && o.$elm$ && !t.hasAttribute("c-id")) {
   const e = t.parentElement;
   if (e && e.childNodes) {
    const n = Array.from(e.childNodes), s = n.find(e => 8 === e.nodeType && e["s-sr"]);
    if (s) {
     const e = n.indexOf(t) - 1;
     o.$elm$.setAttribute("c-id", `${s["s-host-id"]}.${s["s-node-id"]}.0.${e}`);
    }
   }
  }
 }
}, insertChildVNodeAnnotations = (e, t, o, n, s, a) => {
 const l = t.$elm$;
 if (null == l) return;
 const r = o.nodeIds++, i = `${n}.${r}.${s}.${a}`;
 if (l["s-host-id"] = n, l["s-node-id"] = r, 1 === l.nodeType) l.setAttribute("c-id", i); else if (3 === l.nodeType) {
  const t = l.parentNode;
  if ("STYLE" !== t.nodeName) {
   const o = "t." + i, n = e.createComment(o);
   t.insertBefore(n, l);
  }
 } else if (8 === l.nodeType && l["s-sr"]) {
  const e = `s.${i}.${l["s-sn"] || ""}`;
  l.nodeValue = e;
 }
 if (null != t.$children$) {
  const a = s + 1;
  t.$children$.forEach((t, s) => {
   insertChildVNodeAnnotations(e, t, o, n, a, s);
  });
 }
}, NO_HYDRATE_TAGS = new Set([ "CODE", "HEAD", "IFRAME", "INPUT", "OBJECT", "OUTPUT", "NOSCRIPT", "PRE", "SCRIPT", "SELECT", "STYLE", "TEMPLATE", "TEXTAREA" ]), hAsync = (e, t, ...o) => {
 if (Array.isArray(o) && o.length > 0) {
  const n = o.flat(1 / 0);
  return n.some(isPromise) ? Promise.all(n).then(o => h(e, t, ...o)).catch(o => h(e, t)) : h(e, t, ...o);
 }
 return h(e, t);
}, cmpModules = new Map, getModule = e => {
 if ("string" == typeof e) {
  e = e.toLowerCase();
  const t = cmpModules.get(e);
  if (null != t) return t[e];
 }
 return null;
}, loadModule = (e, t, o) => getModule(e.$tagName$), isMemberInElement = (e, t) => {
 if (null != e) {
  if (t in e) return !0;
  const o = getModule(e.nodeName);
  if (null != o) {
   const e = o;
   if (null != e && null != e.cmpMeta && null != e.cmpMeta.$members$) return t in e.cmpMeta.$members$;
  }
 }
 return !1;
}, registerComponents = e => {
 for (const t of e) {
  const e = t.cmpMeta.$tagName$;
  cmpModules.set(e, {
   [e]: t
  });
 }
}, win = window, doc = win.document, writeTask = e => {
 process.nextTick(() => {
  try {
   e();
  } catch (e) {
   consoleError(e);
  }
 });
}, resolved = Promise.resolve(), nextTick = e => resolved.then(e), consoleError = e => {
 null != e && console.error(e.stack || e.message || e);
}, plt = {
 $flags$: 0,
 $resourcesUrl$: "",
 jmp: e => e(),
 raf: e => requestAnimationFrame(e),
 ael: (e, t, o, n) => e.addEventListener(t, o, n),
 rel: (e, t, o, n) => e.removeEventListener(t, o, n),
 ce: (e, t) => new win.CustomEvent(e, t)
}, supportsShadow = !1, hostRefs = new WeakMap, getHostRef = e => hostRefs.get(e), registerInstance = (e, t) => hostRefs.set(t.$lazyInstance$ = e, t), registerHost = (e, t) => {
 const o = {
  $flags$: 0,
  $cmpMeta$: t,
  $hostElement$: e,
  $instanceValues$: new Map,
  $renderCount$: 0
 };
 return o.$onInstancePromise$ = new Promise(e => o.$onInstanceResolve$ = e), o.$onReadyPromise$ = new Promise(e => o.$onReadyResolve$ = e), 
 e["s-p"] = [], e["s-rc"] = [], addHostEventListeners(e, o, t.$listeners$), hostRefs.set(e, o);
}, Build = {
 isDev: !1,
 isBrowser: !1,
 isServer: !0,
 isTesting: !1
}, styles = new Map, modeResolutionChain = [];

const appCss = "html.plt-mobile wl-app{user-select:none}wl-app.force-statusbar-padding{--wl-safe-area-top:20px}";

class App {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  componentDidLoad() {
  }
  render() {
    const mode = getWlMode(this);
    return (hAsync(Host, { class: {
        [mode]: true,
        "wl-page": true,
        "force-statusbar-padding": config.getBoolean("_forceStatusbarPadding"),
      } }));
  }
  get el() { return getElement(this); }
  static get style() { return appCss; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "wl-app",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

/**
 * Patched version of requestAnimationFrame that avoids ngzone
 * Use only when you know ngzone should not run
 */
const raf = (h) => {
  if (typeof __zone_symbol__requestAnimationFrame === "function") {
    return __zone_symbol__requestAnimationFrame(h);
  }
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(h);
  }
  return setTimeout(h);
};
const hasShadowDom = (el) => {
  return !!el.shadowRoot && !!el.attachShadow;
};
const findItemLabel = (componentEl) => {
  const itemEl = componentEl.closest("wl-item");
  if (itemEl) {
    return itemEl.querySelector("wl-label");
  }
  return null;
};
const hostContext = (selector, el) => {
  return el.closest(selector) !== null;
};
const renderHiddenInput = (always, container, name, value, disabled) => {
  if (always || hasShadowDom(container)) {
    let input = container.querySelector("input.aux-input");
    if (!input) {
      input = container.ownerDocument.createElement("input");
      input.type = "hidden";
      input.classList.add("aux-input");
      container.appendChild(input);
    }
    input.disabled = disabled;
    input.name = name;
    input.value = value || "";
  }
};
const clamp = (min, n, max) => {
  return Math.max(min, Math.min(n, max));
};
const debounceEvent = (event, wait) => {
  const original = event._original || event;
  return {
    _original: event,
    emit: debounce(original.emit.bind(original), wait),
  };
};
const debounce = (func, wait = 0) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(func, wait, ...args);
  };
};

/**
 * Create the mode and color classes for the component based on the classes passed in
 */
const createColorClasses = (color) => {
  return typeof color === "string" && color.length > 0
    ? {
      "wl-color": true,
      [`wl-color-${color}`]: true,
    }
    : undefined;
};
const SIZE_TO_MEDIA = {
  xs: "(min-width: 0px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
};
// Check if the window matches the media query
// at the breakpoint passed
// e.g. matchBreakpoint('sm') => true if screen width exceeds 576px
const matchBreakpoint = (breakpoint) => {
  if (breakpoint === undefined || breakpoint === "") {
    return true;
  }
  if (window.matchMedia) {
    const mediaQuery = SIZE_TO_MEDIA[breakpoint];
    return window.matchMedia(mediaQuery).matches;
  }
  return false;
};

const rangeIosCss = "/*!@:host(.wl-color-primary)*/.wl-color-primary.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-primary, #1f69e9) !important;--wl-color-base-rgb:var(--wl-color-primary-rgb, 31, 105, 233) !important;--wl-color-contrast:var(--wl-color-primary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-primary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-primary-shade, #1b5ccd) !important;--wl-color-tint:var(--wl-color-primary-tint, #3578eb) !important}/*!@:host(.wl-color-secondary)*/.wl-color-secondary.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-secondary, #924bee) !important;--wl-color-base-rgb:var(--wl-color-secondary-rgb, 146, 75, 238) !important;--wl-color-contrast:var(--wl-color-secondary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-secondary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-secondary-shade, #8042d1) !important;--wl-color-tint:var(--wl-color-secondary-tint, #9d5df0) !important}/*!@:host(.wl-color-tertiary)*/.wl-color-tertiary.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-tertiary, #3a89be) !important;--wl-color-base-rgb:var(--wl-color-tertiary-rgb, 58, 137, 190) !important;--wl-color-contrast:var(--wl-color-tertiary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-tertiary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #3379a7) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #4e95c5) !important}/*!@:host(.wl-color-success)*/.wl-color-success.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-success, #21b36e) !important;--wl-color-base-rgb:var(--wl-color-success-rgb, 33, 179, 110) !important;--wl-color-contrast:var(--wl-color-success-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-success-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-success-shade, #1d9e61) !important;--wl-color-tint:var(--wl-color-success-tint, #37bb7d) !important}/*!@:host(.wl-color-warning)*/.wl-color-warning.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-warning, #ffed86) !important;--wl-color-base-rgb:var(--wl-color-warning-rgb, 255, 237, 134) !important;--wl-color-contrast:var(--wl-color-warning-contrast, #000) !important;--wl-color-contrast-rgb:var(--wl-color-warning-contrast-rgb, 0, 0, 0) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0d176) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffef92) !important}/*!@:host(.wl-color-light)*/.wl-color-light.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-light, #fcfcfd) !important;--wl-color-base-rgb:var(--wl-color-light-rgb, 252, 252, 253) !important;--wl-color-contrast:var(--wl-color-light-contrast, #000) !important;--wl-color-contrast-rgb:var(--wl-color-light-contrast-rgb, 0, 0, 0) !important;--wl-color-shade:var(--wl-color-light-shade, #dededf) !important;--wl-color-tint:var(--wl-color-light-tint, #fcfcfd) !important}/*!@:host(.wl-color-medium)*/.wl-color-medium.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-medium, #a0a1a7) !important;--wl-color-base-rgb:var(--wl-color-medium-rgb, 160, 161, 167) !important;--wl-color-contrast:var(--wl-color-medium-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-medium-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-medium-shade, #8d8e93) !important;--wl-color-tint:var(--wl-color-medium-tint, #aaaab0) !important}/*!@:host(.wl-color-dark)*/.wl-color-dark.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-dark, #191a1d) !important;--wl-color-base-rgb:var(--wl-color-dark-rgb, 25, 26, 29) !important;--wl-color-contrast:var(--wl-color-dark-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-dark-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-dark-shade, #16171a) !important;--wl-color-tint:var(--wl-color-dark-tint, #303134) !important}/*!@:host(.wl-color-danger)*/.wl-color-danger.sc-wl-range-ios-h{--wl-color-base:var(--wl-color-danger, #d14b4b) !important;--wl-color-base-rgb:var(--wl-color-danger-rgb, 209, 75, 75) !important;--wl-color-contrast:var(--wl-color-danger-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-danger-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-danger-shade, #b84242) !important;--wl-color-tint:var(--wl-color-danger-tint, #d65d5d) !important}/*!@:host*/.sc-wl-range-ios-h{--knob-handle-size:calc(var(--knob-size) * 2);display:flex;position:relative;flex:3;align-items:center;font-family:var(--wl-font-family, inherit);user-select:none;z-index:2}/*!@:host(.range-disabled)*/.range-disabled.sc-wl-range-ios-h{pointer-events:none}/*!@::slotted(wl-label)*/.sc-wl-range-ios-s>wl-label{flex:initial}/*!@::slotted(wl-icon[slot])*/.sc-wl-range-ios-s>wl-icon[slot]{font-size:24px}/*!@.range-slider*/.range-slider.sc-wl-range-ios{position:relative;flex:1;width:100%;height:var(--height);contain:size layout style;cursor:grab;touch-action:pan-y}/*!@:host(.range-pressed) .range-slider*/.range-pressed.sc-wl-range-ios-h .range-slider.sc-wl-range-ios{cursor:grabbing}/*!@.range-pin*/.range-pin.sc-wl-range-ios{position:absolute;background:var(--wl-color-base);color:var(--wl-color-contrast);text-align:center;box-sizing:border-box}/*!@.range-knob-handle*/.range-knob-handle.sc-wl-range-ios{left:0;top:calc((var(--height) - var(--knob-handle-size)) / 2);margin-left:calc(0px - var(--knob-handle-size) / 2);position:absolute;width:var(--knob-handle-size);height:var(--knob-handle-size);text-align:center}/*!@[dir=rtl] .range-knob-handle, :host-context([dir=rtl]) .range-knob-handle*/[dir=rtl].sc-wl-range-ios .range-knob-handle.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-knob-handle.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-knob-handle.sc-wl-range-ios{left:unset;right:unset;right:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.range-knob-handle*/.range-knob-handle.sc-wl-range-ios{margin-left:unset;-webkit-margin-start:calc(0px - var(--knob-handle-size) / 2);margin-inline-start:calc(0px - var(--knob-handle-size) / 2)}}/*!@[dir=rtl] .range-knob-handle, :host-context([dir=rtl]) .range-knob-handle*/[dir=rtl].sc-wl-range-ios .range-knob-handle.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-knob-handle.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-knob-handle.sc-wl-range-ios{left:unset}/*!@.range-knob-handle:active, .range-knob-handle:focus*/.range-knob-handle.sc-wl-range-ios:active,.range-knob-handle.sc-wl-range-ios:focus{outline:none}/*!@.range-bar*/.range-bar.sc-wl-range-ios{border-radius:var(--bar-border-radius);left:0;top:calc((var(--height) - var(--bar-height)) / 2);position:absolute;width:100%;height:var(--bar-height);background:var(--bar-background);pointer-events:none}/*!@[dir] .range-bar*/[dir].sc-wl-range-ios .range-bar.sc-wl-range-ios{border-radius:var(--bar-border-radius)}/*!@[dir=rtl] .range-bar, :host-context([dir=rtl]) .range-bar*/[dir=rtl].sc-wl-range-ios .range-bar.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-bar.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-bar.sc-wl-range-ios{left:unset;right:unset;right:0}/*!@[dir=rtl] .range-bar, :host-context([dir=rtl]) .range-bar*/[dir=rtl].sc-wl-range-ios .range-bar.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-bar.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-bar.sc-wl-range-ios{left:unset}/*!@.range-knob*/.range-knob.sc-wl-range-ios{border-radius:var(--knob-border-radius);left:calc(50% - var(--knob-size) / 2);top:calc(50% - var(--knob-size) / 2);position:absolute;width:var(--knob-size);height:var(--knob-size);background:var(--knob-background);box-shadow:var(--knob-box-shadow);z-index:2;pointer-events:none}/*!@[dir] .range-knob*/[dir].sc-wl-range-ios .range-knob.sc-wl-range-ios{border-radius:var(--knob-border-radius)}/*!@[dir=rtl] .range-knob, :host-context([dir=rtl]) .range-knob*/[dir=rtl].sc-wl-range-ios .range-knob.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-knob.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-knob.sc-wl-range-ios{left:unset;right:unset;right:calc(50% - var(--knob-size) / 2)}/*!@[dir=rtl] .range-knob, :host-context([dir=rtl]) .range-knob*/[dir=rtl].sc-wl-range-ios .range-knob.sc-wl-range-ios,[dir=rtl].sc-wl-range-ios-h .range-knob.sc-wl-range-ios,[dir=rtl] .sc-wl-range-ios-h .range-knob.sc-wl-range-ios{left:unset}/*!@:host(.range-pressed) .range-bar-active*/.range-pressed.sc-wl-range-ios-h .range-bar-active.sc-wl-range-ios{will-change:left, right}/*!@:host(.in-item)*/.in-item.sc-wl-range-ios-h{width:100%}/*!@:host(.in-item) ::slotted(wl-label)*/.sc-wl-range-ios-h.in-item .sc-wl-range-ios-s>wl-label{align-self:center}/*!@:host*/.sc-wl-range-ios-h{--knob-border-radius:50%;--knob-background:#ffffff;--knob-box-shadow:0 3px 1px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.13), 0 0 0 1px rgba(0, 0, 0, 0.02);--knob-size:28px;--bar-height:2px;--bar-background:rgba(var(--wl-text-color-rgb, 0, 0, 0), 0.1);--bar-background-active:var(--wl-color-primary, #3880ff);--bar-border-radius:0;--height:42px;padding-left:16px;padding-right:16px;padding-top:8px;padding-bottom:8px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-range-ios-h{padding-left:unset;padding-right:unset;-webkit-padding-start:16px;padding-inline-start:16px;-webkit-padding-end:16px;padding-inline-end:16px}}/*!@:host(.wl-color) .range-bar-active,\n:host(.wl-color) .range-tick-active*/.wl-color.sc-wl-range-ios-h .range-bar-active.sc-wl-range-ios,.wl-color.sc-wl-range-ios-h .range-tick-active.sc-wl-range-ios{background:var(--wl-color-base)}/*!@::slotted([slot=start])*/.sc-wl-range-ios-s>[slot=start]{margin-left:0;margin-right:16px;margin-top:0;margin-bottom:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=start])*/.sc-wl-range-ios-s>[slot=start]{margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:16px;margin-inline-end:16px}}/*!@::slotted([slot=end])*/.sc-wl-range-ios-s>[slot=end]{margin-left:16px;margin-right:0;margin-top:0;margin-bottom:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=end])*/.sc-wl-range-ios-s>[slot=end]{margin-left:unset;margin-right:unset;-webkit-margin-start:16px;margin-inline-start:16px;-webkit-margin-end:0;margin-inline-end:0}}/*!@:host(.range-has-pin)*/.range-has-pin.sc-wl-range-ios-h{padding-top:20px}/*!@.range-bar-active*/.range-bar-active.sc-wl-range-ios{bottom:0;width:auto;background:var(--bar-background-active)}/*!@.range-tick*/.range-tick.sc-wl-range-ios{margin-left:-1px;border-radius:0;position:absolute;top:18px;width:2px;height:8px;background:rgba(var(--wl-text-color-rgb, 0, 0, 0), 0.1);pointer-events:none}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.range-tick*/.range-tick.sc-wl-range-ios{margin-left:unset;-webkit-margin-start:-1px;margin-inline-start:-1px}}/*!@[dir] .range-tick*/[dir].sc-wl-range-ios .range-tick.sc-wl-range-ios{border-radius:0}/*!@.range-tick-active*/.range-tick-active.sc-wl-range-ios{background:var(--bar-background-active)}/*!@.range-pin*/.range-pin.sc-wl-range-ios{transform:translate3d(0,  28px,  0) scale(0.01);padding-left:8px;padding-right:8px;padding-top:8px;padding-bottom:8px;display:inline-block;position:relative;top:-20px;min-width:28px;transition:transform 120ms ease;background:transparent;color:var(--wl-text-color, #000);font-size:12px;text-align:center}/*!@[dir] .range-pin*/[dir].sc-wl-range-ios .range-pin.sc-wl-range-ios{transform:translate3d(0,  28px,  0) scale(0.01)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.range-pin*/.range-pin.sc-wl-range-ios{padding-left:unset;padding-right:unset;-webkit-padding-start:8px;padding-inline-start:8px;-webkit-padding-end:8px;padding-inline-end:8px}}/*!@.range-knob-pressed .range-pin*/.range-knob-pressed.sc-wl-range-ios .range-pin.sc-wl-range-ios{transform:translate3d(0,  0,  0) scale(1)}/*!@[dir] .range-knob-pressed .range-pin*/[dir].sc-wl-range-ios .range-knob-pressed.sc-wl-range-ios .range-pin.sc-wl-range-ios{transform:translate3d(0,  0,  0) scale(1)}/*!@:host(.range-disabled)*/.range-disabled.sc-wl-range-ios-h{opacity:0.5}";

const rangeMdCss = "/*!@:host(.wl-color-primary)*/.wl-color-primary.sc-wl-range-md-h{--wl-color-base:var(--wl-color-primary, #1f69e9) !important;--wl-color-base-rgb:var(--wl-color-primary-rgb, 31, 105, 233) !important;--wl-color-contrast:var(--wl-color-primary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-primary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-primary-shade, #1b5ccd) !important;--wl-color-tint:var(--wl-color-primary-tint, #3578eb) !important}/*!@:host(.wl-color-secondary)*/.wl-color-secondary.sc-wl-range-md-h{--wl-color-base:var(--wl-color-secondary, #924bee) !important;--wl-color-base-rgb:var(--wl-color-secondary-rgb, 146, 75, 238) !important;--wl-color-contrast:var(--wl-color-secondary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-secondary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-secondary-shade, #8042d1) !important;--wl-color-tint:var(--wl-color-secondary-tint, #9d5df0) !important}/*!@:host(.wl-color-tertiary)*/.wl-color-tertiary.sc-wl-range-md-h{--wl-color-base:var(--wl-color-tertiary, #3a89be) !important;--wl-color-base-rgb:var(--wl-color-tertiary-rgb, 58, 137, 190) !important;--wl-color-contrast:var(--wl-color-tertiary-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-tertiary-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #3379a7) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #4e95c5) !important}/*!@:host(.wl-color-success)*/.wl-color-success.sc-wl-range-md-h{--wl-color-base:var(--wl-color-success, #21b36e) !important;--wl-color-base-rgb:var(--wl-color-success-rgb, 33, 179, 110) !important;--wl-color-contrast:var(--wl-color-success-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-success-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-success-shade, #1d9e61) !important;--wl-color-tint:var(--wl-color-success-tint, #37bb7d) !important}/*!@:host(.wl-color-warning)*/.wl-color-warning.sc-wl-range-md-h{--wl-color-base:var(--wl-color-warning, #ffed86) !important;--wl-color-base-rgb:var(--wl-color-warning-rgb, 255, 237, 134) !important;--wl-color-contrast:var(--wl-color-warning-contrast, #000) !important;--wl-color-contrast-rgb:var(--wl-color-warning-contrast-rgb, 0, 0, 0) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0d176) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffef92) !important}/*!@:host(.wl-color-light)*/.wl-color-light.sc-wl-range-md-h{--wl-color-base:var(--wl-color-light, #fcfcfd) !important;--wl-color-base-rgb:var(--wl-color-light-rgb, 252, 252, 253) !important;--wl-color-contrast:var(--wl-color-light-contrast, #000) !important;--wl-color-contrast-rgb:var(--wl-color-light-contrast-rgb, 0, 0, 0) !important;--wl-color-shade:var(--wl-color-light-shade, #dededf) !important;--wl-color-tint:var(--wl-color-light-tint, #fcfcfd) !important}/*!@:host(.wl-color-medium)*/.wl-color-medium.sc-wl-range-md-h{--wl-color-base:var(--wl-color-medium, #a0a1a7) !important;--wl-color-base-rgb:var(--wl-color-medium-rgb, 160, 161, 167) !important;--wl-color-contrast:var(--wl-color-medium-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-medium-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-medium-shade, #8d8e93) !important;--wl-color-tint:var(--wl-color-medium-tint, #aaaab0) !important}/*!@:host(.wl-color-dark)*/.wl-color-dark.sc-wl-range-md-h{--wl-color-base:var(--wl-color-dark, #191a1d) !important;--wl-color-base-rgb:var(--wl-color-dark-rgb, 25, 26, 29) !important;--wl-color-contrast:var(--wl-color-dark-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-dark-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-dark-shade, #16171a) !important;--wl-color-tint:var(--wl-color-dark-tint, #303134) !important}/*!@:host(.wl-color-danger)*/.wl-color-danger.sc-wl-range-md-h{--wl-color-base:var(--wl-color-danger, #d14b4b) !important;--wl-color-base-rgb:var(--wl-color-danger-rgb, 209, 75, 75) !important;--wl-color-contrast:var(--wl-color-danger-contrast, #fff) !important;--wl-color-contrast-rgb:var(--wl-color-danger-contrast-rgb, 255, 255, 255) !important;--wl-color-shade:var(--wl-color-danger-shade, #b84242) !important;--wl-color-tint:var(--wl-color-danger-tint, #d65d5d) !important}/*!@:host*/.sc-wl-range-md-h{--knob-handle-size:calc(var(--knob-size) * 2);display:flex;position:relative;flex:3;align-items:center;font-family:var(--wl-font-family, inherit);user-select:none;z-index:2}/*!@:host(.range-disabled)*/.range-disabled.sc-wl-range-md-h{pointer-events:none}/*!@::slotted(wl-label)*/.sc-wl-range-md-s>wl-label{flex:initial}/*!@::slotted(wl-icon[slot])*/.sc-wl-range-md-s>wl-icon[slot]{font-size:24px}/*!@.range-slider*/.range-slider.sc-wl-range-md{position:relative;flex:1;width:100%;height:var(--height);contain:size layout style;cursor:grab;touch-action:pan-y}/*!@:host(.range-pressed) .range-slider*/.range-pressed.sc-wl-range-md-h .range-slider.sc-wl-range-md{cursor:grabbing}/*!@.range-pin*/.range-pin.sc-wl-range-md{position:absolute;background:var(--wl-color-base);color:var(--wl-color-contrast);text-align:center;box-sizing:border-box}/*!@.range-knob-handle*/.range-knob-handle.sc-wl-range-md{left:0;top:calc((var(--height) - var(--knob-handle-size)) / 2);margin-left:calc(0px - var(--knob-handle-size) / 2);position:absolute;width:var(--knob-handle-size);height:var(--knob-handle-size);text-align:center}/*!@[dir=rtl] .range-knob-handle, :host-context([dir=rtl]) .range-knob-handle*/[dir=rtl].sc-wl-range-md .range-knob-handle.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-knob-handle.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-knob-handle.sc-wl-range-md{left:unset;right:unset;right:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.range-knob-handle*/.range-knob-handle.sc-wl-range-md{margin-left:unset;-webkit-margin-start:calc(0px - var(--knob-handle-size) / 2);margin-inline-start:calc(0px - var(--knob-handle-size) / 2)}}/*!@[dir=rtl] .range-knob-handle, :host-context([dir=rtl]) .range-knob-handle*/[dir=rtl].sc-wl-range-md .range-knob-handle.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-knob-handle.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-knob-handle.sc-wl-range-md{left:unset}/*!@.range-knob-handle:active, .range-knob-handle:focus*/.range-knob-handle.sc-wl-range-md:active,.range-knob-handle.sc-wl-range-md:focus{outline:none}/*!@.range-bar*/.range-bar.sc-wl-range-md{border-radius:var(--bar-border-radius);left:0;top:calc((var(--height) - var(--bar-height)) / 2);position:absolute;width:100%;height:var(--bar-height);background:var(--bar-background);pointer-events:none}/*!@[dir] .range-bar*/[dir].sc-wl-range-md .range-bar.sc-wl-range-md{border-radius:var(--bar-border-radius)}/*!@[dir=rtl] .range-bar, :host-context([dir=rtl]) .range-bar*/[dir=rtl].sc-wl-range-md .range-bar.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-bar.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-bar.sc-wl-range-md{left:unset;right:unset;right:0}/*!@[dir=rtl] .range-bar, :host-context([dir=rtl]) .range-bar*/[dir=rtl].sc-wl-range-md .range-bar.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-bar.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-bar.sc-wl-range-md{left:unset}/*!@.range-knob*/.range-knob.sc-wl-range-md{border-radius:var(--knob-border-radius);left:calc(50% - var(--knob-size) / 2);top:calc(50% - var(--knob-size) / 2);position:absolute;width:var(--knob-size);height:var(--knob-size);background:var(--knob-background);box-shadow:var(--knob-box-shadow);z-index:2;pointer-events:none}/*!@[dir] .range-knob*/[dir].sc-wl-range-md .range-knob.sc-wl-range-md{border-radius:var(--knob-border-radius)}/*!@[dir=rtl] .range-knob, :host-context([dir=rtl]) .range-knob*/[dir=rtl].sc-wl-range-md .range-knob.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-knob.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-knob.sc-wl-range-md{left:unset;right:unset;right:calc(50% - var(--knob-size) / 2)}/*!@[dir=rtl] .range-knob, :host-context([dir=rtl]) .range-knob*/[dir=rtl].sc-wl-range-md .range-knob.sc-wl-range-md,[dir=rtl].sc-wl-range-md-h .range-knob.sc-wl-range-md,[dir=rtl] .sc-wl-range-md-h .range-knob.sc-wl-range-md{left:unset}/*!@:host(.range-pressed) .range-bar-active*/.range-pressed.sc-wl-range-md-h .range-bar-active.sc-wl-range-md{will-change:left, right}/*!@:host(.in-item)*/.in-item.sc-wl-range-md-h{width:100%}/*!@:host(.in-item) ::slotted(wl-label)*/.sc-wl-range-md-h.in-item .sc-wl-range-md-s>wl-label{align-self:center}/*!@:host*/.sc-wl-range-md-h{--knob-border-radius:50%;--knob-background:var(--bar-background-active);--knob-box-shadow:none;--knob-size:18px;--bar-height:2px;--bar-background:rgba(var(--wl-color-primary-rgb, 56, 128, 255), 0.26);--bar-background-active:var(--wl-color-primary, #3880ff);--bar-border-radius:0;--height:42px;--pin-background:var(--wl-color-primary, #3880ff);--pin-color:var(--wl-color-primary-contrast, #fff);padding-left:14px;padding-right:14px;padding-top:8px;padding-bottom:8px;font-size:12px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-range-md-h{padding-left:unset;padding-right:unset;-webkit-padding-start:14px;padding-inline-start:14px;-webkit-padding-end:14px;padding-inline-end:14px}}/*!@:host(.wl-color) .range-bar*/.wl-color.sc-wl-range-md-h .range-bar.sc-wl-range-md{background:rgba(var(--wl-color-base-rgb), 0.26)}/*!@:host(.wl-color) .range-bar-active,\n:host(.wl-color) .range-knob,\n:host(.wl-color) .range-pin,\n:host(.wl-color) .range-pin::before,\n:host(.wl-color) .range-tick*/.wl-color.sc-wl-range-md-h .range-bar-active.sc-wl-range-md,.wl-color.sc-wl-range-md-h .range-knob.sc-wl-range-md,.wl-color.sc-wl-range-md-h .range-pin.sc-wl-range-md,.wl-color.sc-wl-range-md-h .range-pin.sc-wl-range-md::before,.wl-color.sc-wl-range-md-h .range-tick.sc-wl-range-md{background:var(--wl-color-base);color:var(--wl-color-contrast)}/*!@::slotted([slot=start])*/.sc-wl-range-md-s>[slot=start]{margin-left:0;margin-right:14px;margin-top:0;margin-bottom:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=start])*/.sc-wl-range-md-s>[slot=start]{margin-left:unset;margin-right:unset;-webkit-margin-start:0;margin-inline-start:0;-webkit-margin-end:14px;margin-inline-end:14px}}/*!@::slotted([slot=end])*/.sc-wl-range-md-s>[slot=end]{margin-left:14px;margin-right:0;margin-top:0;margin-bottom:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=end])*/.sc-wl-range-md-s>[slot=end]{margin-left:unset;margin-right:unset;-webkit-margin-start:14px;margin-inline-start:14px;-webkit-margin-end:0;margin-inline-end:0}}/*!@:host(.range-has-pin)*/.range-has-pin.sc-wl-range-md-h{padding-top:28px}/*!@.range-bar-active*/.range-bar-active.sc-wl-range-md{bottom:0;width:auto;background:var(--bar-background-active)}/*!@.range-knob*/.range-knob.sc-wl-range-md{transform:scale(0.67);transition-duration:120ms;transition-property:transform, background-color, border;transition-timing-function:ease;z-index:2}/*!@.range-tick*/.range-tick.sc-wl-range-md{position:absolute;top:calc((var(--height) - var(--bar-height)) / 2);width:var(--bar-height);height:var(--bar-height);background:var(--bar-background-active);z-index:1;pointer-events:none}/*!@.range-tick-active*/.range-tick-active.sc-wl-range-md{background:transparent}/*!@.range-pin*/.range-pin.sc-wl-range-md{padding-left:0;padding-right:0;padding-top:8px;padding-bottom:8px;border-radius:50%;transform:translate3d(0,  0,  0) scale(0.01);display:inline-block;position:relative;min-width:28px;height:28px;transition:transform 120ms ease, background 120ms ease;background:var(--pin-background);color:var(--pin-color);text-align:center}/*!@[dir] .range-pin*/[dir].sc-wl-range-md .range-pin.sc-wl-range-md{border-radius:50%}/*!@[dir] .range-pin*/[dir].sc-wl-range-md .range-pin.sc-wl-range-md{transform:translate3d(0,  0,  0) scale(0.01)}/*!@.range-pin::before*/.range-pin.sc-wl-range-md::before{left:50%;top:3px;margin-left:-13px;border-radius:50% 50% 50% 0;position:absolute;width:26px;height:26px;transform:rotate(-45deg);transition:background 120ms ease;background:var(--pin-background);content:\"\";z-index:-1}/*!@[dir=rtl] .range-pin::before, :host-context([dir=rtl]) .range-pin::before*/[dir=rtl].sc-wl-range-md .range-pin.sc-wl-range-md::before,[dir=rtl].sc-wl-range-md-h .range-pin.sc-wl-range-md::before,[dir=rtl] .sc-wl-range-md-h .range-pin.sc-wl-range-md::before{left:unset;right:unset;right:50%}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.range-pin::before*/.range-pin.sc-wl-range-md::before{margin-left:unset;-webkit-margin-start:-13px;margin-inline-start:-13px}}/*!@[dir] .range-pin::before*/[dir].sc-wl-range-md .range-pin.sc-wl-range-md::before{border-radius:50% 50% 50% 0}/*!@[dir=rtl] .range-pin::before, :host-context([dir=rtl]) .range-pin::before*/[dir=rtl].sc-wl-range-md .range-pin.sc-wl-range-md::before,[dir=rtl].sc-wl-range-md-h .range-pin.sc-wl-range-md::before,[dir=rtl] .sc-wl-range-md-h .range-pin.sc-wl-range-md::before{left:unset}/*!@.range-knob-pressed .range-pin*/.range-knob-pressed.sc-wl-range-md .range-pin.sc-wl-range-md{transform:translate3d(0,  -24px,  0) scale(1)}/*!@[dir] .range-knob-pressed .range-pin*/[dir].sc-wl-range-md .range-knob-pressed.sc-wl-range-md .range-pin.sc-wl-range-md{transform:translate3d(0,  -24px,  0) scale(1)}/*!@:host(:not(.range-has-pin)) .range-knob-pressed .range-knob*/.sc-wl-range-md-h:not(.range-has-pin) .range-knob-pressed.sc-wl-range-md .range-knob.sc-wl-range-md{transform:scale(1)}/*!@:host(.range-disabled) .range-bar-active,\n:host(.range-disabled) .range-bar,\n:host(.range-disabled) .range-tick*/.range-disabled.sc-wl-range-md-h .range-bar-active.sc-wl-range-md,.range-disabled.sc-wl-range-md-h .range-bar.sc-wl-range-md,.range-disabled.sc-wl-range-md-h .range-tick.sc-wl-range-md{background-color:var(--wl-color-step-250, #bfbfbf)}/*!@:host(.range-disabled) .range-knob*/.range-disabled.sc-wl-range-md-h .range-knob.sc-wl-range-md{transform:scale(0.55);outline:5px solid #fff;background-color:var(--wl-color-step-250, #bfbfbf)}";

// import { Mode } from "../../../dist/types/interfaces";
/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot start - Content is placed to the left of the range slider in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the range slider in LTR, and to the left in RTL.
 *
 * @part tick - An inactive tick mark.
 * @part tick-active - An active tick mark.
 * @part pin - The counter that appears above a knob.
 * @part knob - The handle that is used to drag the range.
 * @part bar - The inactive part of the bar.
 * @part bar-active - The active part of the bar.
 */
class Range {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlChange = createEvent(this, "wlChange", 7);
    this.wlStyle = createEvent(this, "wlStyle", 7);
    this.wlFocus = createEvent(this, "wlFocus", 7);
    this.wlBlur = createEvent(this, "wlBlur", 7);
    this.noUpdate = false;
    this.hasFocus = false;
    //   @Element() el!: HTMLElement;
    this.ratioA = 0;
    this.ratioB = 0;
    /**
     * How long, in milliseconds, to wait to trigger the
     * `wlChange` event after each change in the range value.
     */
    this.debounce = 0;
    /**
     * The name of the control, which is submitted with the form data.
     */
    this.name = "";
    /**
     * Show two knobs.
     */
    this.dualKnobs = false;
    /**
     * Minimum integer value of the range.
     */
    this.min = 0;
    /**
     * Maximum integer value of the range.
     */
    this.max = 100;
    /**
     * If `true`, a pin with integer value is shown when the knob
     * is pressed.
     */
    this.pin = false;
    /**
     * If `true`, the knob snaps to tick marks evenly spaced based
     * on the step property value.
     */
    this.snaps = false;
    /**
     * Specifies the value granularity.
     */
    this.step = 1;
    /**
     * If `true`, tick marks are displayed based on the step value.
     * Only applies when `snaps` is `true`.
     */
    this.ticks = true;
    /**
     * If `true`, the user cannot interact with the range.
     */
    this.disabled = false;
    /**
     * the value of the range.
     */
    this.value = 0;
    this.clampBounds = (value) => {
      return clamp(this.min, value, this.max);
    };
    this.ensureValueInBounds = (value) => {
      if (this.dualKnobs) {
        return {
          lower: this.clampBounds(value.lower),
          upper: this.clampBounds(value.upper),
        };
      }
      else {
        return this.clampBounds(value);
      }
    };
    this.handleKeyboard = (knob, isIncrease) => {
      let step = this.step;
      step = step > 0 ? step : 1;
      step = step / (this.max - this.min);
      if (!isIncrease) {
        step *= -1;
      }
      if (knob === "A") {
        this.ratioA = clamp(0, this.ratioA + step, 1);
      }
      else {
        this.ratioB = clamp(0, this.ratioB + step, 1);
      }
      this.updateValue();
    };
    this.onBlur = () => {
      if (this.hasFocus) {
        this.hasFocus = false;
        this.wlBlur.emit();
        this.emitStyle();
      }
    };
    this.onFocus = () => {
      if (!this.hasFocus) {
        this.hasFocus = true;
        this.wlFocus.emit();
        this.emitStyle();
      }
    };
  }
  debounceChanged() {
    this.wlChange = debounceEvent(this.wlChange, this.debounce);
  }
  minChanged() {
    if (!this.noUpdate) {
      this.updateRatio();
    }
  }
  maxChanged() {
    if (!this.noUpdate) {
      this.updateRatio();
    }
  }
  disabledChanged() {
    if (this.gesture) {
      this.gesture.enable(!this.disabled);
    }
    this.emitStyle();
  }
  valueChanged(value) {
    if (!this.noUpdate) {
      this.updateRatio();
    }
    value = this.ensureValueInBounds(value);
    this.wlChange.emit({ value });
  }
  connectedCallback() {
    this.updateRatio();
    this.debounceChanged();
    this.disabledChanged();
  }
  disconnectedCallback() {
    if (this.gesture) {
      this.gesture.destroy();
      this.gesture = undefined;
    }
  }
  async componentDidLoad() {
    const rangeSlider = this.rangeSlider;
    if (rangeSlider) {
      this.gesture = (await Promise.resolve().then(function () { return index; })).createGesture({
        el: rangeSlider,
        gestureName: "range",
        gesturePriority: 100,
        threshold: 0,
        onStart: (ev) => this.onStart(ev),
        onMove: (ev) => this.onMove(ev),
        onEnd: (ev) => this.onEnd(ev),
      });
      this.gesture.enable(!this.disabled);
    }
  }
  getValue() {
    const value = this.value || 0;
    if (this.dualKnobs) {
      if (typeof value === "object") {
        return value;
      }
      return {
        lower: 0,
        upper: value,
      };
    }
    else {
      if (typeof value === "object") {
        return value.upper;
      }
      return value;
    }
  }
  emitStyle() {
    this.wlStyle.emit({
      interactive: true,
      "interactive-disabled": this.disabled,
    });
  }
  onStart(detail) {
    const rect = (this.rect = this.rangeSlider.getBoundingClientRect());
    const currentX = detail.currentX;
    // figure out which knob they started closer to
    let ratio = clamp(0, (currentX - rect.left) / rect.width, 1);
    if (document.dir === "rtl") {
      ratio = 1 - ratio;
    }
    this.pressedKnob =
      !this.dualKnobs ||
        Math.abs(this.ratioA - ratio) < Math.abs(this.ratioB - ratio)
        ? "A"
        : "B";
    this.setFocus(this.pressedKnob);
    // update the active knob's position
    this.update(currentX);
  }
  onMove(detail) {
    this.update(detail.currentX);
  }
  onEnd(detail) {
    this.update(detail.currentX);
    this.pressedKnob = undefined;
  }
  update(currentX) {
    // figure out where the pointer is currently at
    // update the knob being interacted with
    const rect = this.rect;
    let ratio = clamp(0, (currentX - rect.left) / rect.width, 1);
    if (document.dir === "rtl") {
      ratio = 1 - ratio;
    }
    if (this.snaps) {
      // snaps the ratio to the current value
      ratio = valueToRatio(ratioToValue(ratio, this.min, this.max, this.step), this.min, this.max);
    }
    // update which knob is pressed
    if (this.pressedKnob === "A") {
      this.ratioA = ratio;
    }
    else {
      this.ratioB = ratio;
    }
    // Update input value
    this.updateValue();
  }
  get valA() {
    return ratioToValue(this.ratioA, this.min, this.max, this.step);
  }
  get valB() {
    return ratioToValue(this.ratioB, this.min, this.max, this.step);
  }
  get ratioLower() {
    if (this.dualKnobs) {
      return Math.min(this.ratioA, this.ratioB);
    }
    return 0;
  }
  get ratioUpper() {
    if (this.dualKnobs) {
      return Math.max(this.ratioA, this.ratioB);
    }
    return this.ratioA;
  }
  updateRatio() {
    const value = this.getValue();
    const { min, max } = this;
    if (this.dualKnobs) {
      this.ratioA = valueToRatio(value.lower, min, max);
      this.ratioB = valueToRatio(value.upper, min, max);
    }
    else {
      this.ratioA = valueToRatio(value, min, max);
    }
  }
  updateValue() {
    this.noUpdate = true;
    const { valA, valB } = this;
    this.value = !this.dualKnobs
      ? valA
      : {
        lower: Math.min(valA, valB),
        upper: Math.max(valA, valB),
      };
    this.noUpdate = false;
  }
  setFocus(knob) {
    if (this.el.shadowRoot) {
      const knobEl = this.el.shadowRoot.querySelector(knob === "A" ? ".range-knob-a" : ".range-knob-b");
      if (knobEl) {
        knobEl.focus();
      }
    }
  }
  render() {
    const { min, max, step, el, handleKeyboard, pressedKnob, disabled, pin, ratioLower, ratioUpper, } = this;
    const mode = getWlMode(this) || "md";
    const barStart = `${ratioLower * 100}%`;
    const barEnd = `${100 - ratioUpper * 100}%`;
    const doc = document;
    const isRTL = doc.dir === "rtl";
    const start = isRTL ? "right" : "left";
    const end = isRTL ? "left" : "right";
    const tickStyle = (tick) => {
      return {
        [start]: tick[start],
      };
    };
    const barStyle = {
      [start]: barStart,
      [end]: barEnd,
    };
    const ticks = [];
    if (this.snaps && this.ticks) {
      for (let value = min; value <= max; value += step) {
        const ratio = valueToRatio(value, min, max);
        const tick = {
          ratio,
          active: ratio >= ratioLower && ratio <= ratioUpper,
        };
        tick[start] = `${ratio * 100}%`;
        ticks.push(tick);
      }
    }
    renderHiddenInput(true, el, this.name, JSON.stringify(this.getValue()), disabled);
    return (hAsync(Host, { onFocusin: this.onFocus, onFocusout: this.onBlur, class: Object.assign(Object.assign({ [mode]: true, [mode === "ios" ? 0 : 1]: true }, createColorClasses(this.color)), { "in-item": hostContext("wl-item", el), "range-disabled": disabled, "range-pressed": pressedKnob !== undefined, "range-has-pin": pin }) }, hAsync("slot", { name: "start" }), hAsync("div", { class: "range-slider", ref: (rangeEl) => (this.rangeSlider = rangeEl) }, ticks.map((tick) => (hAsync("div", { style: tickStyle(tick), role: "presentation", class: {
        "range-tick": true,
        "range-tick-active": tick.active,
      }, part: tick.active ? "tick-active" : "tick" }))), hAsync("div", { class: "range-bar", role: "presentation", part: "bar" }), hAsync("div", { class: "range-bar range-bar-active", role: "presentation", style: barStyle, part: "bar-active" }), renderKnob(isRTL, {
      knob: "A",
      pressed: pressedKnob === "A",
      value: this.valA,
      ratio: this.ratioA,
      pin,
      disabled,
      handleKeyboard,
      min,
      max,
    }), this.dualKnobs &&
      renderKnob(isRTL, {
        knob: "B",
        pressed: pressedKnob === "B",
        value: this.valB,
        ratio: this.ratioB,
        pin,
        disabled,
        handleKeyboard,
        min,
        max,
      })), hAsync("slot", { name: "end" })));
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "debounce": ["debounceChanged"],
    "min": ["minChanged"],
    "max": ["maxChanged"],
    "disabled": ["disabledChanged"],
    "value": ["valueChanged"]
  }; }
  static get style() { return {
    ios: rangeIosCss,
    md: rangeMdCss
  }; }
  static get cmpMeta() { return {
    "$flags$": 41,
    "$tagName$": "wl-range",
    "$members$": {
      "color": [1],
      "debounce": [2],
      "name": [1],
      "dualKnobs": [4, "dual-knobs"],
      "min": [2],
      "max": [2],
      "pin": [4],
      "snaps": [4],
      "step": [2],
      "ticks": [4],
      "disabled": [4],
      "value": [1026],
      "ratioA": [32],
      "ratioB": [32],
      "pressedKnob": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
const renderKnob = (isRTL, { knob, value, ratio, min, max, disabled, pressed, pin, handleKeyboard, }) => {
  const start = isRTL ? "right" : "left";
  const knobStyle = () => {
    const style = {};
    style[start] = `${ratio * 100}%`;
    return style;
  };
  return (hAsync("div", { onKeyDown: (ev) => {
      const key = ev.key;
      if (key === "ArrowLeft" || key === "ArrowDown") {
        handleKeyboard(knob, false);
        ev.preventDefault();
        ev.stopPropagation();
      }
      else if (key === "ArrowRight" || key === "ArrowUp") {
        handleKeyboard(knob, true);
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, class: {
      "range-knob-handle": true,
      "range-knob-a": knob === "A",
      "range-knob-b": knob === "B",
      "range-knob-pressed": pressed,
      "range-knob-min": value === min,
      "range-knob-max": value === max,
    }, style: knobStyle(), role: "slider", tabindex: disabled ? -1 : 0, "aria-valuemin": min, "aria-valuemax": max, "aria-disabled": disabled ? "true" : null, "aria-valuenow": value }, pin && (hAsync("div", { class: "range-pin", role: "presentation", part: "pin" }, Math.round(value))), hAsync("div", { class: "range-knob", role: "presentation", part: "knob" })));
};
const ratioToValue = (ratio, min, max, step) => {
  let value = (max - min) * ratio;
  if (step > 0) {
    value = Math.round(value / step) * step + min;
  }
  return clamp(min, value, max);
};
const valueToRatio = (value, min, max) => {
  return clamp(0, (value - min) / (max - min), 1);
};

const appbarCss = ".sc-wl-appbar-h{--color:rgba(0, 0, 0, 0.87);--background-color:#fff}[color=primary].sc-wl-appbar{--background-color:var(--wl-color-primary, #3880ff);--color:var(--wl-color-primary-contrast, #fff)}[color=secondary].sc-wl-appbar{--background-color:var(--wl-color-secondary, #3dc2ff);--color:var(--wl-color-secondary-contrast, #fff)}[color=tertiary].sc-wl-appbar{--background-color:var(--wl-color-tertiary, #5260ff);--color:var(--wl-color-tertiary-contrast, #fff)}[color=success].sc-wl-appbar{--background-color:var(--wl-color-success, #2dd36f);--color:var(--wl-color-success-contrast, #fff)}[color=warning].sc-wl-appbar{--background-color:var(--wl-color-warning, #ffc409);--color:var(--wl-color-warning-contrast, #000)}[color=danger].sc-wl-appbar{--background-color:var(--wl-color-danger, #eb445a);--color:var(--wl-color-danger-contrast, #fff)}[color=light].sc-wl-appbar{--background-color:var(--wl-color-light, #f4f5f8);--color:var(--wl-color-light-contrast, #000)}[color=medium].sc-wl-appbar{--background-color:var(--wl-color-medium, #92949c);--color:var(--wl-color-medium-contrast, #fff)}[color=dark].sc-wl-appbar{--background-color:var(--wl-color-dark, #222428);--color:var(--wl-color-dark-contrast, #fff)}.sc-wl-appbar-h[textAlign=left] .sc-wl-appbar-s>:first-child{text-align:left}.sc-wl-appbar-h[textAlign=right] .sc-wl-appbar-s>:first-child{text-align:right}.sc-wl-appbar-h[textAlign=start] .sc-wl-appbar-s>:first-child{text-align:start}.sc-wl-appbar-h[textAlign=end] .sc-wl-appbar-s>:first-child{text-align:end}.sc-wl-appbar-h[textAlign=center] .sc-wl-appbar-s>:first-child{text-align:center}.sc-wl-appbar-h[textAlign=justify] .sc-wl-appbar-s>:first-child{text-align:justify}.sc-wl-appbar-h[textAlign=wrap] .sc-wl-appbar-s>:first-child{text-align:wrap}.sc-wl-appbar-h[textAlign=nowrap] .sc-wl-appbar-s>:first-child{text-align:nowrap}.sc-wl-appbar-h[textAlign=uppercase] .sc-wl-appbar-s>:first-child{text-align:uppercase}.sc-wl-appbar-h[textAlign=lowercase] .sc-wl-appbar-s>:first-child{text-align:lowercase}.sc-wl-appbar-h[textAlign=capitalize] .sc-wl-appbar-s>:first-child{text-align:capitalize}[noPadding].sc-wl-appbar-h #toolbar.sc-wl-appbar{padding-left:0;padding-right:0}.sc-wl-appbar-h header.sc-wl-appbar{padding-top:16px;padding-bottom:16px;color:var(--color, rgba(0, 0, 0, 0.87));background-color:var(--background-color, #fff);transition:box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;width:100%;display:flex;z-index:1100;box-sizing:border-box;flex-shrink:0;flex-direction:column;box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)}.sc-wl-appbar-h [static].sc-wl-appbar{position:static;transform:translateZ(0)}.sc-wl-appbar-h [regular].sc-wl-appbar{min-height:56px}@media (min-width: 600px){.sc-wl-appbar-h [regular].sc-wl-appbar{min-height:64px}}.sc-wl-appbar-h #toolbar.sc-wl-appbar{display:flex;position:relative;align-items:center}@media (min-width: 600px){.sc-wl-appbar-h #toolbar.sc-wl-appbar{padding-left:24px;padding-right:24px}}";

class WlAppbar {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.justify = "start";
    this.align = "stretch";
    this.textAlign = "left";
    this.noPadding = false;
  }
  render() {
    const { color, align, justify, textAlign, noPadding } = this;
    return (hAsync(Host, { color: color, textAlign: textAlign, noPadding: noPadding }, hAsync("header", { color: color, class: `wl-justify-content-${justify} wl-align-items-${align}` }, hAsync("div", { id: "toolbar" }, hAsync("slot", null)))));
  }
  static get style() { return appbarCss; }
  static get cmpMeta() { return {
    "$flags$": 6,
    "$tagName$": "wl-appbar",
    "$members$": {
      "color": [513],
      "justify": [1],
      "align": [1],
      "textAlign": [1, "text-align"],
      "noPadding": [4, "no-padding"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"]]
  }; }
}

const wlButtonCss = "/*!@:host*/.sc-wl-button-h{--padding-top:8px;--padding-start:8px;--padding-bottom:8px;--padding-end:8px}/*!@:host*/.sc-wl-button-h{--overflow:hidden;--ripple-color:current-color;--border-width:initial;--border-color:initial;--border-style:initial;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--box-shadow:none;--border-radius:3px;display:inline-block;width:auto;color:var(--color);font-family:var(--wl-font-family, inherit);text-align:center;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;user-select:none;vertical-align:top;vertical-align:-webkit-baseline-middle;pointer-events:auto;font-kerning:none}/*!@[size=xl]*/[size=xl].sc-wl-button{min-width:8rem;min-height:4rem;--padding-top:10px;--padding-start:10px;--padding-bottom:10px;--padding-end:10px}/*!@[size=lg]*/[size=lg].sc-wl-button{min-width:7rem;min-height:3rem}/*!@[size=sm]*/[size=sm].sc-wl-button{min-width:5rem;min-height:2rem;--padding-top:6px;--padding-start:6px;--padding-bottom:6px;--padding-end:6px}/*!@[color=primary]*/[color=primary].sc-wl-button{--background:var(--wl-color-primary, #3880ff);--color:var(--wl-color-primary-contrast, #fff);--color-hover:rgba(var(--wl-color-primary-rgb, 56, 128, 255), 0.5);--background-hover:rgba(var(--wl-color-primary-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=primary]*/[variant=outline][color=primary].sc-wl-button{--background:transparent;--color:var(--wl-color-primary, #3880ff) !important;border-color:var(--wl-color-primary, #3880ff) !important}/*!@[variant=solid][color=primary]*/[variant=solid][color=primary].sc-wl-button{--background:transparent;--color:var(--wl-color-primary, #3880ff) !important;border-color:var(--wl-color-primary, #3880ff) !important}/*!@[variant=clear][color=primary]*/[variant=clear][color=primary].sc-wl-button{--background:transparent;--color:var(--wl-color-primary, #3880ff) !important;border-color:var(--wl-color-primary, #3880ff) !important}/*!@[variant=outline][color=primary]*/[variant=outline][color=primary].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-primary-rgb, 56, 128, 255), 0.5);outline:1px solid var(--wl-color-primary, #3880ff) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-primary, #3880ff) !important}/*!@[color=primary]*/[color=primary].sc-wl-button{--border-color:rgba(var(--wl-color-primary-rgb, 56, 128, 255), 0.8)}/*!@[color=secondary]*/[color=secondary].sc-wl-button{--background:var(--wl-color-secondary, #3dc2ff);--color:var(--wl-color-secondary-contrast, #fff);--color-hover:rgba(var(--wl-color-secondary-rgb, 61, 194, 255), 0.5);--background-hover:rgba(var(--wl-color-secondary-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=secondary]*/[variant=outline][color=secondary].sc-wl-button{--background:transparent;--color:var(--wl-color-secondary, #3dc2ff) !important;border-color:var(--wl-color-secondary, #3dc2ff) !important}/*!@[variant=solid][color=secondary]*/[variant=solid][color=secondary].sc-wl-button{--background:transparent;--color:var(--wl-color-secondary, #3dc2ff) !important;border-color:var(--wl-color-secondary, #3dc2ff) !important}/*!@[variant=clear][color=secondary]*/[variant=clear][color=secondary].sc-wl-button{--background:transparent;--color:var(--wl-color-secondary, #3dc2ff) !important;border-color:var(--wl-color-secondary, #3dc2ff) !important}/*!@[variant=outline][color=secondary]*/[variant=outline][color=secondary].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-secondary-rgb, 61, 194, 255), 0.5);outline:1px solid var(--wl-color-secondary, #3dc2ff) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-secondary, #3dc2ff) !important}/*!@[color=secondary]*/[color=secondary].sc-wl-button{--border-color:rgba(var(--wl-color-secondary-rgb, 61, 194, 255), 0.8)}/*!@[color=tertiary]*/[color=tertiary].sc-wl-button{--background:var(--wl-color-tertiary, #5260ff);--color:var(--wl-color-tertiary-contrast, #fff);--color-hover:rgba(var(--wl-color-tertiary-rgb, 82, 96, 255), 0.5);--background-hover:rgba(var(--wl-color-tertiary-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=tertiary]*/[variant=outline][color=tertiary].sc-wl-button{--background:transparent;--color:var(--wl-color-tertiary, #5260ff) !important;border-color:var(--wl-color-tertiary, #5260ff) !important}/*!@[variant=solid][color=tertiary]*/[variant=solid][color=tertiary].sc-wl-button{--background:transparent;--color:var(--wl-color-tertiary, #5260ff) !important;border-color:var(--wl-color-tertiary, #5260ff) !important}/*!@[variant=clear][color=tertiary]*/[variant=clear][color=tertiary].sc-wl-button{--background:transparent;--color:var(--wl-color-tertiary, #5260ff) !important;border-color:var(--wl-color-tertiary, #5260ff) !important}/*!@[variant=outline][color=tertiary]*/[variant=outline][color=tertiary].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-tertiary-rgb, 82, 96, 255), 0.5);outline:1px solid var(--wl-color-tertiary, #5260ff) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-tertiary, #5260ff) !important}/*!@[color=tertiary]*/[color=tertiary].sc-wl-button{--border-color:rgba(var(--wl-color-tertiary-rgb, 82, 96, 255), 0.8)}/*!@[color=success]*/[color=success].sc-wl-button{--background:var(--wl-color-success, #2dd36f);--color:var(--wl-color-success-contrast, #fff);--color-hover:rgba(var(--wl-color-success-rgb, 45, 211, 111), 0.5);--background-hover:rgba(var(--wl-color-success-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=success]*/[variant=outline][color=success].sc-wl-button{--background:transparent;--color:var(--wl-color-success, #2dd36f) !important;border-color:var(--wl-color-success, #2dd36f) !important}/*!@[variant=solid][color=success]*/[variant=solid][color=success].sc-wl-button{--background:transparent;--color:var(--wl-color-success, #2dd36f) !important;border-color:var(--wl-color-success, #2dd36f) !important}/*!@[variant=clear][color=success]*/[variant=clear][color=success].sc-wl-button{--background:transparent;--color:var(--wl-color-success, #2dd36f) !important;border-color:var(--wl-color-success, #2dd36f) !important}/*!@[variant=outline][color=success]*/[variant=outline][color=success].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-success-rgb, 45, 211, 111), 0.5);outline:1px solid var(--wl-color-success, #2dd36f) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-success, #2dd36f) !important}/*!@[color=success]*/[color=success].sc-wl-button{--border-color:rgba(var(--wl-color-success-rgb, 45, 211, 111), 0.8)}/*!@[color=warning]*/[color=warning].sc-wl-button{--background:var(--wl-color-warning, #ffc409);--color:var(--wl-color-warning-contrast, #000);--color-hover:rgba(var(--wl-color-warning-rgb, 255, 196, 9), 0.5);--background-hover:rgba(var(--wl-color-warning-contrast-rgb, 0, 0, 0), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=warning]*/[variant=outline][color=warning].sc-wl-button{--background:transparent;--color:var(--wl-color-warning, #ffc409) !important;border-color:var(--wl-color-warning, #ffc409) !important}/*!@[variant=solid][color=warning]*/[variant=solid][color=warning].sc-wl-button{--background:transparent;--color:var(--wl-color-warning, #ffc409) !important;border-color:var(--wl-color-warning, #ffc409) !important}/*!@[variant=clear][color=warning]*/[variant=clear][color=warning].sc-wl-button{--background:transparent;--color:var(--wl-color-warning, #ffc409) !important;border-color:var(--wl-color-warning, #ffc409) !important}/*!@[variant=outline][color=warning]*/[variant=outline][color=warning].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-warning-rgb, 255, 196, 9), 0.5);outline:1px solid var(--wl-color-warning, #ffc409) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-warning, #ffc409) !important}/*!@[color=warning]*/[color=warning].sc-wl-button{--border-color:rgba(var(--wl-color-warning-rgb, 255, 196, 9), 0.8)}/*!@[color=danger]*/[color=danger].sc-wl-button{--background:var(--wl-color-danger, #eb445a);--color:var(--wl-color-danger-contrast, #fff);--color-hover:rgba(var(--wl-color-danger-rgb, 235, 68, 90), 0.5);--background-hover:rgba(var(--wl-color-danger-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=danger]*/[variant=outline][color=danger].sc-wl-button{--background:transparent;--color:var(--wl-color-danger, #eb445a) !important;border-color:var(--wl-color-danger, #eb445a) !important}/*!@[variant=solid][color=danger]*/[variant=solid][color=danger].sc-wl-button{--background:transparent;--color:var(--wl-color-danger, #eb445a) !important;border-color:var(--wl-color-danger, #eb445a) !important}/*!@[variant=clear][color=danger]*/[variant=clear][color=danger].sc-wl-button{--background:transparent;--color:var(--wl-color-danger, #eb445a) !important;border-color:var(--wl-color-danger, #eb445a) !important}/*!@[variant=outline][color=danger]*/[variant=outline][color=danger].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-danger-rgb, 235, 68, 90), 0.5);outline:1px solid var(--wl-color-danger, #eb445a) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-danger, #eb445a) !important}/*!@[color=danger]*/[color=danger].sc-wl-button{--border-color:rgba(var(--wl-color-danger-rgb, 235, 68, 90), 0.8)}/*!@[color=light]*/[color=light].sc-wl-button{--background:var(--wl-color-light, #f4f5f8);--color:var(--wl-color-light-contrast, #000);--color-hover:rgba(var(--wl-color-light-rgb, 244, 245, 248), 0.5);--background-hover:rgba(var(--wl-color-light-contrast-rgb, 0, 0, 0), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=light]*/[variant=outline][color=light].sc-wl-button{--background:transparent;--color:var(--wl-color-light, #f4f5f8) !important;border-color:var(--wl-color-light, #f4f5f8) !important}/*!@[variant=solid][color=light]*/[variant=solid][color=light].sc-wl-button{--background:transparent;--color:var(--wl-color-light, #f4f5f8) !important;border-color:var(--wl-color-light, #f4f5f8) !important}/*!@[variant=clear][color=light]*/[variant=clear][color=light].sc-wl-button{--background:transparent;--color:var(--wl-color-light, #f4f5f8) !important;border-color:var(--wl-color-light, #f4f5f8) !important}/*!@[variant=outline][color=light]*/[variant=outline][color=light].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-light-rgb, 244, 245, 248), 0.5);outline:1px solid var(--wl-color-light, #f4f5f8) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-light, #f4f5f8) !important}/*!@[color=light]*/[color=light].sc-wl-button{--border-color:rgba(var(--wl-color-light-rgb, 244, 245, 248), 0.8)}/*!@[color=medium]*/[color=medium].sc-wl-button{--background:var(--wl-color-medium, #92949c);--color:var(--wl-color-medium-contrast, #fff);--color-hover:rgba(var(--wl-color-medium-rgb, 146, 148, 156), 0.5);--background-hover:rgba(var(--wl-color-medium-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=medium]*/[variant=outline][color=medium].sc-wl-button{--background:transparent;--color:var(--wl-color-medium, #92949c) !important;border-color:var(--wl-color-medium, #92949c) !important}/*!@[variant=solid][color=medium]*/[variant=solid][color=medium].sc-wl-button{--background:transparent;--color:var(--wl-color-medium, #92949c) !important;border-color:var(--wl-color-medium, #92949c) !important}/*!@[variant=clear][color=medium]*/[variant=clear][color=medium].sc-wl-button{--background:transparent;--color:var(--wl-color-medium, #92949c) !important;border-color:var(--wl-color-medium, #92949c) !important}/*!@[variant=outline][color=medium]*/[variant=outline][color=medium].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-medium-rgb, 146, 148, 156), 0.5);outline:1px solid var(--wl-color-medium, #92949c) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-medium, #92949c) !important}/*!@[color=medium]*/[color=medium].sc-wl-button{--border-color:rgba(var(--wl-color-medium-rgb, 146, 148, 156), 0.8)}/*!@[color=dark]*/[color=dark].sc-wl-button{--background:var(--wl-color-dark, #222428);--color:var(--wl-color-dark-contrast, #fff);--color-hover:rgba(var(--wl-color-dark-rgb, 34, 36, 40), 0.5);--background-hover:rgba(var(--wl-color-dark-contrast-rgb, 255, 255, 255), 0.3);--background-hover-opacity:0.5}/*!@[variant=outline][color=dark]*/[variant=outline][color=dark].sc-wl-button{--background:transparent;--color:var(--wl-color-dark, #222428) !important;border-color:var(--wl-color-dark, #222428) !important}/*!@[variant=solid][color=dark]*/[variant=solid][color=dark].sc-wl-button{--background:transparent;--color:var(--wl-color-dark, #222428) !important;border-color:var(--wl-color-dark, #222428) !important}/*!@[variant=clear][color=dark]*/[variant=clear][color=dark].sc-wl-button{--background:transparent;--color:var(--wl-color-dark, #222428) !important;border-color:var(--wl-color-dark, #222428) !important}/*!@[variant=outline][color=dark]*/[variant=outline][color=dark].sc-wl-button{--border-width:20px !important;--background-hover:rgba(var(--wl-color-dark-rgb, 34, 36, 40), 0.5);outline:1px solid var(--wl-color-dark, #222428) !important;--border-radius:0;--box-shadow:0px 0px 0px 1px var(--wl-color-dark, #222428) !important}/*!@[color=dark]*/[color=dark].sc-wl-button{--border-color:rgba(var(--wl-color-dark-rgb, 34, 36, 40), 0.8)}/*!@[circular]*/[circular].sc-wl-button{--border-radius:50% !important;--box-shadow:none !important}/*!@:host(.button-disabled)*/.button-disabled.sc-wl-button-h{cursor:default;opacity:0.5;pointer-events:none}/*!@:host(.button-native)*/.button-native.sc-wl-button-h{background:var(--wl-color-base)}/*!@[variant=outline]*/[variant=outline].sc-wl-button{--border-width:20px !important;outline:1px solid var(--wl-color-base) !important}/*!@[variant=clear] .button-native*/[variant=clear].sc-wl-button .button-native.sc-wl-button{background:transparent;color:var(--wl-color-base)}/*!@[variant=clear]*/[variant=clear].sc-wl-button{--border-width:0}/*!@[variant=block]*/[variant=block].sc-wl-button{display:block}/*!@[variant=block] .button-native*/[variant=block].sc-wl-button .button-native.sc-wl-button{margin-left:0;margin-right:0;display:block;width:100%;clear:both;contain:content}/*!@[variant=block] .button-native::after*/[variant=block].sc-wl-button .button-native.sc-wl-button::after{clear:both}/*!@[variant=full]*/[variant=full].sc-wl-button{display:block}/*!@:host([variant=full])*/[variant=full].sc-wl-button-h{width:100%;height:100%;padding:0;margin:0;display:block;contain:content}/*!@[variant=full].button-native*/[variant=full].button-native.sc-wl-button{margin-left:0;margin-right:0;display:block;width:100%;contain:content}/*!@.button-native*/.button-native.sc-wl-button{border-radius:var(--border-radius);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;color:var(--color);display:block;position:relative;width:100%;height:100%;transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);line-height:1;box-shadow:var(--box-shadow);contain:layout style;cursor:pointer;opacity:var(--opacity);overflow:var(--overflow);z-index:0;box-sizing:border-box;appearance:none}/*!@[dir] .button-native*/[dir].sc-wl-button .button-native.sc-wl-button{border-radius:var(--border-radius)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.button-native*/.button-native.sc-wl-button{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}/*!@.button-native::-moz-focus-inner*/.button-native.sc-wl-button::-moz-focus-inner{border:0}/*!@.button-inner*/.button-inner.sc-wl-button{display:flex;position:relative;flex-flow:row nowrap;flex-shrink:0;align-items:center;justify-content:center;width:100%;height:100%;z-index:1}/*!@.button-native::after*/.button-native.sc-wl-button::after{left:0;right:0;top:0;bottom:0;position:absolute;content:\"\";opacity:0}/*!@[dir] .button-native::after*/[dir].sc-wl-button .button-native.sc-wl-button::after{left:0;right:0}/*!@:host(.wl-activated)*/.wl-activated.sc-wl-button-h{color:var(--color-activated)}/*!@:host(.wl-activated) .button-native::after*/.wl-activated.sc-wl-button-h .button-native.sc-wl-button::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}/*!@:host(.wl-focused)*/.wl-focused.sc-wl-button-h{color:var(--color-focused)}/*!@:host(.wl-focused) .button-native::after*/.wl-focused.sc-wl-button-h .button-native.sc-wl-button::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}@media (any-hover: hover){/*!@:host(:hover)*/.sc-wl-button-h:hover{color:var(--color-hover)}/*!@:host(:hover) .button-native::after*/.sc-wl-button-h:hover .button-native.sc-wl-button::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}}";

class WlButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * The type of the button.
     */
    this.type = "button";
    /**
     * If `true`, the user cannot interact with the button.
     */
    this.disabled = false;
    this.circular = false;
    this.variant = "block";
    this.color = "primary";
    this.handleClick = (ev) => {
      if (this.type === "submit") {
        const form = this.el.closest("form");
        if (form) {
          ev.preventDefault();
          const fakeButton = document.createElement("button");
          fakeButton.type = this.type;
          fakeButton.style.display = "none";
          form.appendChild(fakeButton);
          fakeButton.click();
          fakeButton.remove();
        }
      }
      else if (typeof this.href !== "undefined") {
        ev.preventDefault();
        const fakeLink = document.createElement("a");
        fakeLink.href = this.href || "";
        fakeLink.target = this.target || "";
        fakeLink.rel = this.rel || "";
        fakeLink.style.display = "none";
        fakeLink.click();
        fakeLink.remove();
      }
    };
  }
  render() {
    const { type, disabled, rel, target, size, href, color } = this;
    const attrs = type === "button"
      ? { type }
      : {
        href,
        rel,
        target,
      };
    // const finalSize = size === undefined && this.size ? "small" : size;
    const TagType = href === undefined ? "button" : "a";
    const sharedProps = {
      color: color,
      size: size,
      circular: this.circular,
      variant: this.variant,
    };
    if (TagType === "a") {
      sharedProps.href = href;
    }
    else {
      sharedProps.type = type;
      sharedProps.disabled = disabled;
      sharedProps["aria-disabled"] = disabled ? "true" : null;
    }
    return (hAsync(Host, Object.assign({}, sharedProps, { onClick: this.handleClick, "aria-disabled": disabled ? "true" : null, class: Object.assign(Object.assign({}, createColorClasses(color)), { "button-disabled": disabled }) }, attrs), hAsync(TagType, Object.assign({}, sharedProps, attrs, { class: { "button-native": true, "button-disabled": disabled } }), hAsync("slot", { name: "start" }), hAsync("slot", null), hAsync("slot", { name: "end" }))));
  }
  get el() { return getElement(this); }
  static get style() { return wlButtonCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-button",
    "$members$": {
      "type": [1],
      "disabled": [516],
      "circular": [516],
      "variant": [513],
      "color": [513],
      "href": [513],
      "target": [513],
      "rel": [513],
      "size": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["disabled", "disabled"], ["circular", "circular"], ["variant", "variant"], ["color", "color"], ["href", "href"], ["target", "target"], ["rel", "rel"], ["size", "size"]]
  }; }
}

const cardCss = "/*!@:host*/.sc-wl-card-h{width:100%}/*!@:host div*/.sc-wl-card-h div.sc-wl-card{box-shadow:0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12);color:rgba(0, 0, 0, 0.87);transition:box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;background-color:#fff;overflow:hidden;border-radius:4px}/*!@::slotted([slot=header])*/.sc-wl-card-s>[slot=header]{display:flex;margin-top:0;padding-top:15px;margin-bottom:1rem;align-items:center}/*!@::slotted([slot=content])*/.sc-wl-card-s>[slot=content]{padding-top:0;padding-bottom:0}/*!@**/*.sc-wl-card{padding-top:0;padding-bottom:16px;padding-left:16px;padding-right:16px}";

class WlCard {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (hAsync(Host, null, hAsync("div", null, hAsync("slot", { name: "header" }), hAsync("slot", { name: "content" }), hAsync("slot", null))));
  }
  static get style() { return cardCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-card",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const wlColCss = "/*!@:host*/.sc-wl-col-h{padding-left:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;box-sizing:border-box;position:relative;flex-basis:0;flex-grow:1;width:100%;max-width:100%;min-height:1px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-col-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px))}}@media (min-width: 576px){/*!@:host*/.sc-wl-col-h{padding-left:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-col (margin-inline-start.sc-wl-col: 0).sc-wl-col or.sc-wl-col (-webkit-margin-start.sc-wl-col: 0).sc-wl-col{.sc-wl-col-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 768px){/*!@:host*/.sc-wl-col-h{padding-left:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-col (margin-inline-start.sc-wl-col: 0).sc-wl-col or.sc-wl-col (-webkit-margin-start.sc-wl-col: 0).sc-wl-col{.sc-wl-col-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 992px){/*!@:host*/.sc-wl-col-h{padding-left:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-col (margin-inline-start.sc-wl-col: 0).sc-wl-col or.sc-wl-col (-webkit-margin-start.sc-wl-col: 0).sc-wl-col{.sc-wl-col-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 1200px){/*!@:host*/.sc-wl-col-h{padding-left:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-col (margin-inline-start.sc-wl-col: 0).sc-wl-col or.sc-wl-col (-webkit-margin-start.sc-wl-col: 0).sc-wl-col{.sc-wl-col-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px))}}}";

const win$1 = window;
const SUPPORTS_VARS = !!(win$1.CSS &&
  win$1.CSS.supports &&
  win$1.CSS.supports("--a: 0"));
const BREAKPOINTS = ["", "xs", "sm", "md", "lg", "xl"];
class WlCol {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  onResize() {
    forceUpdate(this);
  }
  // Loop through all of the breakpoints to see if the media query
  // matches and grab the column value from the relevant prop if so
  getColumns(property) {
    let matched;
    for (const breakpoint of BREAKPOINTS) {
      const matches = matchBreakpoint(breakpoint);
      // Grab the value of the property, if it exists and our
      // media query matches we return the value
      const columns = this[property + breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)];
      if (matches && columns !== undefined) {
        matched = columns;
      }
    }
    // Return the last matched columns since the breakpoints
    // increase in size and we want to return the largest match
    return matched;
  }
  calculateSize() {
    const columns = this.getColumns("size");
    // If size wasn't set for any breakpoint
    // or if the user set the size without a value
    // it means we need to stick with the default and return
    if (!columns || columns === "") {
      return;
    }
    // If the size is set to auto then don't calculate a size
    const colSize = columns === "auto"
      ? "auto"
      : // If CSS supports variables we should use the grid columns var
        SUPPORTS_VARS
          ? `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
          : // Convert the columns to a percentage by dividing by the total number
            // of columns (12) and then multiplying by 100
            (columns / 12) * 100 + "%";
    return {
      flex: `0 0 ${colSize}`,
      width: `${colSize}`,
      "max-width": `${colSize}`,
    };
  }
  // Called by push, pull, and offset since they use the same calculations
  calculatePosition(property, modifier) {
    const columns = this.getColumns(property);
    if (!columns) {
      return;
    }
    // If the number of columns passed are greater than 0 and less than
    // 12 we can position the column, else default to auto
    const amount = SUPPORTS_VARS
      ? // If CSS supports variables we should use the grid columns var
        `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
      : // Convert the columns to a percentage by dividing by the total number
        // of columns (12) and then multiplying by 100
        columns > 0 && columns < 12
          ? (columns / 12) * 100 + "%"
          : "auto";
    return {
      [modifier]: amount,
    };
  }
  calculateOffset(isRTL) {
    return this.calculatePosition("offset", isRTL ? "margin-right" : "margin-left");
  }
  calculatePull(isRTL) {
    return this.calculatePosition("pull", isRTL ? "left" : "right");
  }
  calculatePush(isRTL) {
    return this.calculatePosition("push", isRTL ? "right" : "left");
  }
  render() {
    const mode = getWlMode(this);
    const isRTL = document.dir === "rtl";
    return (hAsync(Host, { class: {
        [mode]: true,
      }, style: Object.assign(Object.assign(Object.assign(Object.assign({}, this.calculateOffset(isRTL)), this.calculatePull(isRTL)), this.calculatePush(isRTL)), this.calculateSize()) }, hAsync("slot", null)));
  }
  static get style() { return wlColCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-col",
    "$members$": {
      "offset": [1],
      "offsetXs": [1, "offset-xs"],
      "offsetSm": [1, "offset-sm"],
      "offsetMd": [1, "offset-md"],
      "offsetLg": [1, "offset-lg"],
      "offsetXl": [1, "offset-xl"],
      "pull": [1],
      "pullXs": [1, "pull-xs"],
      "pullSm": [1, "pull-sm"],
      "pullMd": [1, "pull-md"],
      "pullLg": [1, "pull-lg"],
      "pullXl": [1, "pull-xl"],
      "push": [1],
      "pushXs": [1, "push-xs"],
      "pushSm": [1, "push-sm"],
      "pushMd": [1, "push-md"],
      "pushLg": [1, "push-lg"],
      "pushXl": [1, "push-xl"],
      "size": [1],
      "sizeXs": [1, "size-xs"],
      "sizeSm": [1, "size-sm"],
      "sizeMd": [1, "size-md"],
      "sizeLg": [1, "size-lg"],
      "sizeXl": [1, "size-xl"]
    },
    "$listeners$": [[9, "resize", "onResize"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const wlContainerCss = ".sc-wl-container-h div.sc-wl-container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}.sc-wl-container-h div[size=xs].sc-wl-container,.sc-wl-container-h div[maxWidth=xs].sc-wl-container{max-width:576px !important;padding-right:6px;padding-left:6px}.sc-wl-container-h div[size=sm].sc-wl-container,.sc-wl-container-h div[maxWidth=sm].sc-wl-container{max-width:768px !important;padding-right:6px;padding-left:6px}.sc-wl-container-h div[size=md].sc-wl-container,.sc-wl-container-h div[maxWidth=md].sc-wl-container{max-width:992px !important}.sc-wl-container-h div[size=lg].sc-wl-container,.sc-wl-container-h div[maxWidth=lg].sc-wl-container{max-width:1200px !important}@media (min-width: 576px){.sc-wl-container-h div.sc-wl-container{max-width:540px}}@media (min-width: 768px){.sc-wl-container-h div.sc-wl-container{max-width:720px}}@media (min-width: 992px){.sc-wl-container-h div.sc-wl-container{max-width:960px}}@media (min-width: 1200px){.sc-wl-container-h div.sc-wl-container{max-width:1140px}}.sc-wl-container-h div[fluid].sc-wl-container,.sc-wl-container-h div[size=lg].sc-wl-container,.sc-wl-container-h div[size=md].sc-wl-container,.sc-wl-container-h div[size=sm].sc-wl-container,.sc-wl-container-h div[size=xl].sc-wl-container{width:100%;padding-right:15px;padding-left:15px;margin-right:auto;margin-left:auto}@media (min-width: 576px){.sc-wl-container-h div[size=sm].sc-wl-container{max-width:540px}}@media (min-width: 768px){.sc-wl-container-h div[size=md].sc-wl-container,.sc-wl-container-h div[size=sm].sc-wl-container{max-width:720px}}@media (min-width: 992px){.sc-wl-container-h div[size=lg].sc-wl-container,.sc-wl-container-h div[size=md].sc-wl-container,.sc-wl-container-h div[size=sm].sc-wl-container{max-width:960px}}@media (min-width: 1200px){.sc-wl-container-h div[size=lg].sc-wl-container,.sc-wl-container-h div[size=md].sc-wl-container,.sc-wl-container-h div[size=sm].sc-wl-container,.sc-wl-container-h div[size=xl].sc-wl-container{max-width:1140px}}";

class WlContainer {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.size = "lg";
    this.maxWidth = "xl";
    this.fluid = false;
    this.class = "";
  }
  render() {
    const { maxWidth, fluid, size } = this;
    return (hAsync(Host, { fluid: fluid, size: size, class: this.class }, hAsync("div", { class: this.class, id: "wl-container",
      //@ts-ignore
      size: size, maxWidth: maxWidth }, hAsync("slot", null))));
  }
  get el() { return getElement(this); }
  static get style() { return wlContainerCss; }
  static get cmpMeta() { return {
    "$flags$": 6,
    "$tagName$": "wl-container",
    "$members$": {
      "size": [513],
      "maxWidth": [513, "max-width"],
      "fluid": [516],
      "class": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["size", "size"], ["maxWidth", "max-width"], ["fluid", "fluid"], ["class", "class"]]
  }; }
}

const drawerCss = "/*!@html*/html.sc-wl-drawer{--wl-font-family:var(--wl-default-font)}/*!@body*/body.sc-wl-drawer{background:var(--wl-background-color)}/*!@body.backdrop-no-scroll*/body.backdrop-no-scroll.sc-wl-drawer{overflow:hidden}/*!@html.ios wl-modal.modal-card .wl-page > wl-header > wl-toolbar:first-of-type*/html.ios.sc-wl-drawer wl-modal.modal-card.sc-wl-drawer .wl-page.sc-wl-drawer>wl-header.sc-wl-drawer>wl-toolbar.sc-wl-drawer:first-of-type{padding-top:0px}/*!@html.ios wl-modal .wl-page*/html.ios.sc-wl-drawer wl-modal.sc-wl-drawer .wl-page.sc-wl-drawer{border-radius:inherit}/*!@.wl-color-primary*/.wl-color-primary.sc-wl-drawer{--wl-color-base:var(--wl-color-primary, #3880ff) !important;--wl-color-base-rgb:var(\n    --wl-color-primary-rgb,\n    56, 128, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-primary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-primary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-primary-shade, #3171e0) !important;--wl-color-tint:var(--wl-color-primary-tint, #4c8dff) !important}/*!@.wl-color-secondary*/.wl-color-secondary.sc-wl-drawer{--wl-color-base:var(--wl-color-secondary, #3dc2ff) !important;--wl-color-base-rgb:var(\n    --wl-color-secondary-rgb,\n    61, 194, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-secondary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-secondary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-secondary-shade, #36abe0) !important;--wl-color-tint:var(--wl-color-secondary-tint, #50c8ff) !important}/*!@.wl-color-tertiary*/.wl-color-tertiary.sc-wl-drawer{--wl-color-base:var(--wl-color-tertiary, #5260ff) !important;--wl-color-base-rgb:var(\n    --wl-color-tertiary-rgb,\n    82, 96, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-tertiary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-tertiary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #4854e0) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #6370ff) !important}/*!@.wl-color-success*/.wl-color-success.sc-wl-drawer{--wl-color-base:var(--wl-color-success, #2dd36f) !important;--wl-color-base-rgb:var(\n    --wl-color-success-rgb,\n    45, 211, 111\n  ) !important;--wl-color-contrast:var(\n    --wl-color-success-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-success-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-success-shade, #28ba62) !important;--wl-color-tint:var(--wl-color-success-tint, #42d77d) !important}/*!@.wl-color-warning*/.wl-color-warning.sc-wl-drawer{--wl-color-base:var(--wl-color-warning, #ffc409) !important;--wl-color-base-rgb:var(\n    --wl-color-warning-rgb,\n    255, 196, 9\n  ) !important;--wl-color-contrast:var(\n    --wl-color-warning-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-warning-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0ac08) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffca22) !important}/*!@.wl-color-danger*/.wl-color-danger.sc-wl-drawer{--wl-color-base:var(--wl-color-danger, #eb445a) !important;--wl-color-base-rgb:var(\n    --wl-color-danger-rgb,\n    235, 68, 90\n  ) !important;--wl-color-contrast:var(\n    --wl-color-danger-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-danger-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-danger-shade, #cf3c4f) !important;--wl-color-tint:var(--wl-color-danger-tint, #ed576b) !important}/*!@.wl-color-light*/.wl-color-light.sc-wl-drawer{--wl-color-base:var(--wl-color-light, #f4f5f8) !important;--wl-color-base-rgb:var(\n    --wl-color-light-rgb,\n    244, 245, 248\n  ) !important;--wl-color-contrast:var(\n    --wl-color-light-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-light-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-light-shade, #d7d8da) !important;--wl-color-tint:var(--wl-color-light-tint, #f5f6f9) !important}/*!@.wl-color-medium*/.wl-color-medium.sc-wl-drawer{--wl-color-base:var(--wl-color-medium, #92949c) !important;--wl-color-base-rgb:var(\n    --wl-color-medium-rgb,\n    146, 148, 156\n  ) !important;--wl-color-contrast:var(\n    --wl-color-medium-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-medium-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-medium-shade, #808289) !important;--wl-color-tint:var(--wl-color-medium-tint, #9d9fa6) !important}/*!@.wl-color-dark*/.wl-color-dark.sc-wl-drawer{--wl-color-base:var(--wl-color-dark, #222428) !important;--wl-color-base-rgb:var(\n    --wl-color-dark-rgb,\n    34, 36, 40\n  ) !important;--wl-color-contrast:var(\n    --wl-color-dark-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-dark-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-dark-shade, #1e2023) !important;--wl-color-tint:var(--wl-color-dark-tint, #383a3e) !important}/*!@.wl-page*/.wl-page.sc-wl-drawer{left:0;right:0;top:0;bottom:0;display:flex;position:absolute;flex-direction:column;justify-content:space-between;contain:layout size style;overflow:hidden;z-index:0}/*!@[dir] .wl-page*/[dir].sc-wl-drawer .wl-page.sc-wl-drawer{left:0;right:0}/*!@.split-pane-visible > .wl-page.split-pane-main*/.split-pane-visible.sc-wl-drawer>.wl-page.split-pane-main.sc-wl-drawer{position:relative}/*!@.wl-page-hidden,\n[hidden]*/.wl-page-hidden.sc-wl-drawer,[hidden].sc-wl-drawer{display:none !important}/*!@.wl-page-invisible*/.wl-page-invisible.sc-wl-drawer{opacity:0}/*!@.can-go-back > wl-header wl-back-button*/.can-go-back.sc-wl-drawer>wl-header.sc-wl-drawer wl-back-button.sc-wl-drawer{display:block}/*!@html.plt-ios.plt-hybrid,\nhtml.plt-ios.plt-pwa*/html.plt-ios.plt-hybrid.sc-wl-drawer,html.plt-ios.plt-pwa.sc-wl-drawer{--wl-statusbar-padding:20px}@supports (padding-top: 20px){/*!@html*/html.sc-wl-drawer{--wl-safe-area-top:var(--wl-statusbar-padding)}}@supports (padding-top: constant(safe-area-inset-top)){/*!@html*/html.sc-wl-drawer{--wl-safe-area-top:constant(safe-area-inset-top);--wl-safe-area-bottom:constant(safe-area-inset-bottom);--wl-safe-area-left:constant(safe-area-inset-left);--wl-safe-area-right:constant(safe-area-inset-right)}}@supports (padding-top: env(safe-area-inset-top)){/*!@html*/html.sc-wl-drawer{--wl-safe-area-top:env(safe-area-inset-top);--wl-safe-area-bottom:env(safe-area-inset-bottom);--wl-safe-area-left:env(safe-area-inset-left);--wl-safe-area-right:env(safe-area-inset-right)}}/*!@wl-card.wl-color .wl-inherit-color,\nwl-card-header.wl-color .wl-inherit-color*/wl-card.wl-color.sc-wl-drawer .wl-inherit-color.sc-wl-drawer,wl-card-header.wl-color.sc-wl-drawer .wl-inherit-color.sc-wl-drawer{color:inherit}/*!@.menu-content*/.menu-content.sc-wl-drawer{transform:translate3d(0,  0,  0)}/*!@[dir] .menu-content*/[dir].sc-wl-drawer .menu-content.sc-wl-drawer{transform:translate3d(0,  0,  0)}/*!@.menu-content-open*/.menu-content-open.sc-wl-drawer{cursor:pointer;touch-action:manipulation;pointer-events:none}/*!@audio,\ncanvas,\nprogress,\nvideo*/audio.sc-wl-drawer,canvas.sc-wl-drawer,progress.sc-wl-drawer,video.sc-wl-drawer{vertical-align:baseline}/*!@audio:not([controls])*/audio.sc-wl-drawer:not([controls]){display:none;height:0}/*!@b,\nstrong*/b.sc-wl-drawer,strong.sc-wl-drawer{font-weight:bold}/*!@img*/img.sc-wl-drawer{max-width:100%;border:0}/*!@svg:not(:root)*/svg.sc-wl-drawer:not(:root){overflow:hidden}/*!@figure*/figure.sc-wl-drawer{margin:1em 40px}/*!@hr*/hr.sc-wl-drawer{height:1px;border-width:0;box-sizing:content-box}/*!@pre*/pre.sc-wl-drawer{overflow:auto}/*!@code,\nkbd,\npre,\nsamp*/code.sc-wl-drawer,kbd.sc-wl-drawer,pre.sc-wl-drawer,samp.sc-wl-drawer{font-family:monospace, monospace;font-size:1em}/*!@label,\ninput,\nselect,\ntextarea*/label.sc-wl-drawer,input.sc-wl-drawer,select.sc-wl-drawer,textarea.sc-wl-drawer{font-family:inherit;line-height:normal}/*!@textarea*/textarea.sc-wl-drawer{overflow:auto;height:auto;font:inherit;color:inherit}/*!@textarea::placeholder*/textarea.sc-wl-drawer::placeholder{padding-left:2px}/*!@form,\ninput,\noptgroup,\nselect*/form.sc-wl-drawer,input.sc-wl-drawer,optgroup.sc-wl-drawer,select.sc-wl-drawer{margin:0;font:inherit;color:inherit}/*!@html input[type=button],\ninput[type=reset],\ninput[type=submit]*/html.sc-wl-drawer input[type=button].sc-wl-drawer,input[type=reset].sc-wl-drawer,input[type=submit].sc-wl-drawer{cursor:pointer;-webkit-appearance:button}/*!@a,\na div,\na span,\na wl-icon,\na wl-label,\nbutton,\nbutton div,\nbutton span,\nbutton wl-icon,\nbutton wl-label,\n.wl-tappable,\n[tappable],\n[tappable] div,\n[tappable] span,\n[tappable] wl-icon,\n[tappable] wl-label,\ninput,\ntextarea*/a.sc-wl-drawer,a.sc-wl-drawer div.sc-wl-drawer,a.sc-wl-drawer span.sc-wl-drawer,a.sc-wl-drawer wl-icon.sc-wl-drawer,a.sc-wl-drawer wl-label.sc-wl-drawer,button.sc-wl-drawer,button.sc-wl-drawer div.sc-wl-drawer,button.sc-wl-drawer span.sc-wl-drawer,button.sc-wl-drawer wl-icon.sc-wl-drawer,button.sc-wl-drawer wl-label.sc-wl-drawer,.wl-tappable.sc-wl-drawer,[tappable].sc-wl-drawer,[tappable].sc-wl-drawer div.sc-wl-drawer,[tappable].sc-wl-drawer span.sc-wl-drawer,[tappable].sc-wl-drawer wl-icon.sc-wl-drawer,[tappable].sc-wl-drawer wl-label.sc-wl-drawer,input.sc-wl-drawer,textarea.sc-wl-drawer{touch-action:manipulation}/*!@a wl-label,\nbutton wl-label*/a.sc-wl-drawer wl-label.sc-wl-drawer,button.sc-wl-drawer wl-label.sc-wl-drawer{pointer-events:none}/*!@button*/button.sc-wl-drawer{border:0;border-radius:0;font-family:inherit;font-style:inherit;font-variant:inherit;line-height:1;text-transform:none;cursor:pointer;-webkit-appearance:button}/*!@[tappable]*/[tappable].sc-wl-drawer{cursor:pointer}/*!@a[disabled],\nbutton[disabled],\nhtml input[disabled]*/a[disabled].sc-wl-drawer,button[disabled].sc-wl-drawer,html.sc-wl-drawer input[disabled].sc-wl-drawer{cursor:default}/*!@button::-moz-focus-inner,\ninput::-moz-focus-inner*/button.sc-wl-drawer::-moz-focus-inner,input.sc-wl-drawer::-moz-focus-inner{padding:0;border:0}/*!@input[type=checkbox],\ninput[type=radio]*/input[type=checkbox].sc-wl-drawer,input[type=radio].sc-wl-drawer{padding:0;box-sizing:border-box}/*!@input[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button*/input[type=number].sc-wl-drawer::-webkit-inner-spin-button,input[type=number].sc-wl-drawer::-webkit-outer-spin-button{height:auto}/*!@input[type=search]::-webkit-search-cancel-button,\ninput[type=search]::-webkit-search-decoration*/input[type=search].sc-wl-drawer::-webkit-search-cancel-button,input[type=search].sc-wl-drawer::-webkit-search-decoration{-webkit-appearance:none}/*!@table*/table.sc-wl-drawer{border-collapse:collapse;border-spacing:0}/*!@td,\nth*/td.sc-wl-drawer,th.sc-wl-drawer{padding:0}/*!@**/*.sc-wl-drawer{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}/*!@html*/html.sc-wl-drawer{width:100%;height:100%;text-size-adjust:100%}/*!@html:not(.hydrated) body*/html.sc-wl-drawer:not(.hydrated) body.sc-wl-drawer{display:none}/*!@html.plt-pwa*/html.plt-pwa.sc-wl-drawer{height:100vh}/*!@body*/body.sc-wl-drawer{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;text-rendering:optimizeLegibility;touch-action:manipulation;-webkit-user-drag:none;-ms-content-zooming:none;word-wrap:break-word;overscroll-behavior-y:none;text-size-adjust:none}/*!@html*/html.sc-wl-drawer{font-family:var(--wl-font-family)}/*!@a*/a.sc-wl-drawer{background-color:transparent;color:var(--wl-color-primary, #3880ff)}/*!@h1,\nh2,\nh3,\nh4,\nh5,\nh6*/h1.sc-wl-drawer,h2.sc-wl-drawer,h3.sc-wl-drawer,h4.sc-wl-drawer,h5.sc-wl-drawer,h6.sc-wl-drawer{font-weight:500;line-height:1.2}/*!@h1*/h1.sc-wl-drawer{font-size:26px}/*!@h2*/h2.sc-wl-drawer{font-size:24px}/*!@h3*/h3.sc-wl-drawer{font-size:22px}/*!@h4*/h4.sc-wl-drawer{font-size:20px}/*!@h5*/h5.sc-wl-drawer{font-size:18px}/*!@h6*/h6.sc-wl-drawer{font-size:16px}/*!@small*/small.sc-wl-drawer{font-size:75%}/*!@sub,\nsup*/sub.sc-wl-drawer,sup.sc-wl-drawer{position:relative;font-size:75%;line-height:0;vertical-align:baseline}/*!@sup*/sup.sc-wl-drawer{top:-0.5em}/*!@sub*/sub.sc-wl-drawer{bottom:-0.25em}/*!@.wl-no-padding*/.wl-no-padding.sc-wl-drawer{--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}/*!@.wl-padding*/.wl-padding.sc-wl-drawer{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding*/.wl-padding.sc-wl-drawer{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-top*/.wl-padding-top.sc-wl-drawer{--padding-top:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px)}/*!@.wl-padding-start*/.wl-padding-start.sc-wl-drawer{--padding-start:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-start*/.wl-padding-start.sc-wl-drawer{padding-left:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px)}}/*!@.wl-padding-end*/.wl-padding-end.sc-wl-drawer{--padding-end:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-end*/.wl-padding-end.sc-wl-drawer{padding-right:unset;-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-bottom*/.wl-padding-bottom.sc-wl-drawer{--padding-bottom:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-vertical*/.wl-padding-vertical.sc-wl-drawer{--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-drawer{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-drawer{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-no-margin*/.wl-no-margin.sc-wl-drawer{--margin-start:0;--margin-end:0;--margin-top:0;--margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}/*!@.wl-margin*/.wl-margin.sc-wl-drawer{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin*/.wl-margin.sc-wl-drawer{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-top*/.wl-margin-top.sc-wl-drawer{--margin-top:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px)}/*!@.wl-margin-start*/.wl-margin-start.sc-wl-drawer{--margin-start:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-start*/.wl-margin-start.sc-wl-drawer{margin-left:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px)}}/*!@.wl-margin-end*/.wl-margin-end.sc-wl-drawer{--margin-end:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-end*/.wl-margin-end.sc-wl-drawer{margin-right:unset;-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-bottom*/.wl-margin-bottom.sc-wl-drawer{--margin-bottom:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-vertical*/.wl-margin-vertical.sc-wl-drawer{--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-drawer{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-drawer{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-float-left*/.wl-float-left.sc-wl-drawer{float:left !important}/*!@[dir] .wl-float-left*/[dir].sc-wl-drawer .wl-float-left.sc-wl-drawer{float:left !important}/*!@.wl-float-right*/.wl-float-right.sc-wl-drawer{float:right !important}/*!@[dir] .wl-float-right*/[dir].sc-wl-drawer .wl-float-right.sc-wl-drawer{float:right !important}/*!@.wl-float-start*/.wl-float-start.sc-wl-drawer{float:left !important}/*!@[dir=rtl] .wl-float-start, :host-context([dir=rtl]) .wl-float-start*/[dir=rtl].sc-wl-drawer .wl-float-start.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-start.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-start.sc-wl-drawer{float:right !important}/*!@.wl-float-end*/.wl-float-end.sc-wl-drawer{float:right !important}/*!@[dir=rtl] .wl-float-end, :host-context([dir=rtl]) .wl-float-end*/[dir=rtl].sc-wl-drawer .wl-float-end.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-end.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-end.sc-wl-drawer{float:left !important}@media (min-width: 576px){/*!@.wl-float-sm-left*/.wl-float-sm-left.sc-wl-drawer{float:left !important}/*!@[dir] .wl-float-sm-left*/[dir].sc-wl-drawer .wl-float-sm-left.sc-wl-drawer{float:left !important}/*!@.wl-float-sm-right*/.wl-float-sm-right.sc-wl-drawer{float:right !important}/*!@[dir] .wl-float-sm-right*/[dir].sc-wl-drawer .wl-float-sm-right.sc-wl-drawer{float:right !important}/*!@.wl-float-sm-start*/.wl-float-sm-start.sc-wl-drawer{float:left !important}/*!@[dir=rtl] .wl-float-sm-start, :host-context([dir=rtl]) .wl-float-sm-start*/[dir=rtl].sc-wl-drawer .wl-float-sm-start.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-sm-start.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-sm-start.sc-wl-drawer{float:right !important}/*!@.wl-float-sm-end*/.wl-float-sm-end.sc-wl-drawer{float:right !important}/*!@[dir=rtl] .wl-float-sm-end, :host-context([dir=rtl]) .wl-float-sm-end*/[dir=rtl].sc-wl-drawer .wl-float-sm-end.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-sm-end.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-sm-end.sc-wl-drawer{float:left !important}}@media (min-width: 768px){/*!@.wl-float-md-left*/.wl-float-md-left.sc-wl-drawer{float:left !important}/*!@[dir] .wl-float-md-left*/[dir].sc-wl-drawer .wl-float-md-left.sc-wl-drawer{float:left !important}/*!@.wl-float-md-right*/.wl-float-md-right.sc-wl-drawer{float:right !important}/*!@[dir] .wl-float-md-right*/[dir].sc-wl-drawer .wl-float-md-right.sc-wl-drawer{float:right !important}/*!@.wl-float-md-start*/.wl-float-md-start.sc-wl-drawer{float:left !important}/*!@[dir=rtl] .wl-float-md-start, :host-context([dir=rtl]) .wl-float-md-start*/[dir=rtl].sc-wl-drawer .wl-float-md-start.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-md-start.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-md-start.sc-wl-drawer{float:right !important}/*!@.wl-float-md-end*/.wl-float-md-end.sc-wl-drawer{float:right !important}/*!@[dir=rtl] .wl-float-md-end, :host-context([dir=rtl]) .wl-float-md-end*/[dir=rtl].sc-wl-drawer .wl-float-md-end.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-md-end.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-md-end.sc-wl-drawer{float:left !important}}@media (min-width: 992px){/*!@.wl-float-lg-left*/.wl-float-lg-left.sc-wl-drawer{float:left !important}/*!@[dir] .wl-float-lg-left*/[dir].sc-wl-drawer .wl-float-lg-left.sc-wl-drawer{float:left !important}/*!@.wl-float-lg-right*/.wl-float-lg-right.sc-wl-drawer{float:right !important}/*!@[dir] .wl-float-lg-right*/[dir].sc-wl-drawer .wl-float-lg-right.sc-wl-drawer{float:right !important}/*!@.wl-float-lg-start*/.wl-float-lg-start.sc-wl-drawer{float:left !important}/*!@[dir=rtl] .wl-float-lg-start, :host-context([dir=rtl]) .wl-float-lg-start*/[dir=rtl].sc-wl-drawer .wl-float-lg-start.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-lg-start.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-lg-start.sc-wl-drawer{float:right !important}/*!@.wl-float-lg-end*/.wl-float-lg-end.sc-wl-drawer{float:right !important}/*!@[dir=rtl] .wl-float-lg-end, :host-context([dir=rtl]) .wl-float-lg-end*/[dir=rtl].sc-wl-drawer .wl-float-lg-end.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-lg-end.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-lg-end.sc-wl-drawer{float:left !important}}@media (min-width: 1200px){/*!@.wl-float-xl-left*/.wl-float-xl-left.sc-wl-drawer{float:left !important}/*!@[dir] .wl-float-xl-left*/[dir].sc-wl-drawer .wl-float-xl-left.sc-wl-drawer{float:left !important}/*!@.wl-float-xl-right*/.wl-float-xl-right.sc-wl-drawer{float:right !important}/*!@[dir] .wl-float-xl-right*/[dir].sc-wl-drawer .wl-float-xl-right.sc-wl-drawer{float:right !important}/*!@.wl-float-xl-start*/.wl-float-xl-start.sc-wl-drawer{float:left !important}/*!@[dir=rtl] .wl-float-xl-start, :host-context([dir=rtl]) .wl-float-xl-start*/[dir=rtl].sc-wl-drawer .wl-float-xl-start.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-xl-start.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-xl-start.sc-wl-drawer{float:right !important}/*!@.wl-float-xl-end*/.wl-float-xl-end.sc-wl-drawer{float:right !important}/*!@[dir=rtl] .wl-float-xl-end, :host-context([dir=rtl]) .wl-float-xl-end*/[dir=rtl].sc-wl-drawer .wl-float-xl-end.sc-wl-drawer,[dir=rtl].sc-wl-drawer-h .wl-float-xl-end.sc-wl-drawer,[dir=rtl] .sc-wl-drawer-h .wl-float-xl-end.sc-wl-drawer{float:left !important}}/*!@.wl-text-center*/.wl-text-center.sc-wl-drawer{text-align:center !important}/*!@.wl-text-justify*/.wl-text-justify.sc-wl-drawer{text-align:justify !important}/*!@.wl-text-start*/.wl-text-start.sc-wl-drawer{text-align:start !important}/*!@.wl-text-end*/.wl-text-end.sc-wl-drawer{text-align:end !important}/*!@.wl-text-left*/.wl-text-left.sc-wl-drawer{text-align:left !important}/*!@.wl-text-right*/.wl-text-right.sc-wl-drawer{text-align:right !important}/*!@.wl-text-nowrap*/.wl-text-nowrap.sc-wl-drawer{white-space:nowrap !important}/*!@.wl-text-wrap*/.wl-text-wrap.sc-wl-drawer{white-space:normal !important}@media (min-width: 576px){/*!@.wl-text-sm-center*/.wl-text-sm-center.sc-wl-drawer{text-align:center !important}/*!@.wl-text-sm-justify*/.wl-text-sm-justify.sc-wl-drawer{text-align:justify !important}/*!@.wl-text-sm-start*/.wl-text-sm-start.sc-wl-drawer{text-align:start !important}/*!@.wl-text-sm-end*/.wl-text-sm-end.sc-wl-drawer{text-align:end !important}/*!@.wl-text-sm-left*/.wl-text-sm-left.sc-wl-drawer{text-align:left !important}/*!@.wl-text-sm-right*/.wl-text-sm-right.sc-wl-drawer{text-align:right !important}/*!@.wl-text-sm-nowrap*/.wl-text-sm-nowrap.sc-wl-drawer{white-space:nowrap !important}/*!@.wl-text-sm-wrap*/.wl-text-sm-wrap.sc-wl-drawer{white-space:normal !important}}@media (min-width: 768px){/*!@.wl-text-md-center*/.wl-text-md-center.sc-wl-drawer{text-align:center !important}/*!@.wl-text-md-justify*/.wl-text-md-justify.sc-wl-drawer{text-align:justify !important}/*!@.wl-text-md-start*/.wl-text-md-start.sc-wl-drawer{text-align:start !important}/*!@.wl-text-md-end*/.wl-text-md-end.sc-wl-drawer{text-align:end !important}/*!@.wl-text-md-left*/.wl-text-md-left.sc-wl-drawer{text-align:left !important}/*!@.wl-text-md-right*/.wl-text-md-right.sc-wl-drawer{text-align:right !important}/*!@.wl-text-md-nowrap*/.wl-text-md-nowrap.sc-wl-drawer{white-space:nowrap !important}/*!@.wl-text-md-wrap*/.wl-text-md-wrap.sc-wl-drawer{white-space:normal !important}}@media (min-width: 992px){/*!@.wl-text-lg-center*/.wl-text-lg-center.sc-wl-drawer{text-align:center !important}/*!@.wl-text-lg-justify*/.wl-text-lg-justify.sc-wl-drawer{text-align:justify !important}/*!@.wl-text-lg-start*/.wl-text-lg-start.sc-wl-drawer{text-align:start !important}/*!@.wl-text-lg-end*/.wl-text-lg-end.sc-wl-drawer{text-align:end !important}/*!@.wl-text-lg-left*/.wl-text-lg-left.sc-wl-drawer{text-align:left !important}/*!@.wl-text-lg-right*/.wl-text-lg-right.sc-wl-drawer{text-align:right !important}/*!@.wl-text-lg-nowrap*/.wl-text-lg-nowrap.sc-wl-drawer{white-space:nowrap !important}/*!@.wl-text-lg-wrap*/.wl-text-lg-wrap.sc-wl-drawer{white-space:normal !important}}@media (min-width: 1200px){/*!@.wl-text-xl-center*/.wl-text-xl-center.sc-wl-drawer{text-align:center !important}/*!@.wl-text-xl-justify*/.wl-text-xl-justify.sc-wl-drawer{text-align:justify !important}/*!@.wl-text-xl-start*/.wl-text-xl-start.sc-wl-drawer{text-align:start !important}/*!@.wl-text-xl-end*/.wl-text-xl-end.sc-wl-drawer{text-align:end !important}/*!@.wl-text-xl-left*/.wl-text-xl-left.sc-wl-drawer{text-align:left !important}/*!@.wl-text-xl-right*/.wl-text-xl-right.sc-wl-drawer{text-align:right !important}/*!@.wl-text-xl-nowrap*/.wl-text-xl-nowrap.sc-wl-drawer{white-space:nowrap !important}/*!@.wl-text-xl-wrap*/.wl-text-xl-wrap.sc-wl-drawer{white-space:normal !important}}/*!@.wl-text-uppercase*/.wl-text-uppercase.sc-wl-drawer{text-transform:uppercase !important}/*!@.wl-text-lowercase*/.wl-text-lowercase.sc-wl-drawer{text-transform:lowercase !important}/*!@.wl-text-capitalize*/.wl-text-capitalize.sc-wl-drawer{text-transform:capitalize !important}@media (min-width: 576px){/*!@.wl-text-sm-uppercase*/.wl-text-sm-uppercase.sc-wl-drawer{text-transform:uppercase !important}/*!@.wl-text-sm-lowercase*/.wl-text-sm-lowercase.sc-wl-drawer{text-transform:lowercase !important}/*!@.wl-text-sm-capitalize*/.wl-text-sm-capitalize.sc-wl-drawer{text-transform:capitalize !important}}@media (min-width: 768px){/*!@.wl-text-md-uppercase*/.wl-text-md-uppercase.sc-wl-drawer{text-transform:uppercase !important}/*!@.wl-text-md-lowercase*/.wl-text-md-lowercase.sc-wl-drawer{text-transform:lowercase !important}/*!@.wl-text-md-capitalize*/.wl-text-md-capitalize.sc-wl-drawer{text-transform:capitalize !important}}@media (min-width: 992px){/*!@.wl-text-lg-uppercase*/.wl-text-lg-uppercase.sc-wl-drawer{text-transform:uppercase !important}/*!@.wl-text-lg-lowercase*/.wl-text-lg-lowercase.sc-wl-drawer{text-transform:lowercase !important}/*!@.wl-text-lg-capitalize*/.wl-text-lg-capitalize.sc-wl-drawer{text-transform:capitalize !important}}@media (min-width: 1200px){/*!@.wl-text-xl-uppercase*/.wl-text-xl-uppercase.sc-wl-drawer{text-transform:uppercase !important}/*!@.wl-text-xl-lowercase*/.wl-text-xl-lowercase.sc-wl-drawer{text-transform:lowercase !important}/*!@.wl-text-xl-capitalize*/.wl-text-xl-capitalize.sc-wl-drawer{text-transform:capitalize !important}}/*!@.wl-align-self-start*/.wl-align-self-start.sc-wl-drawer{align-self:flex-start !important}/*!@.wl-align-self-end*/.wl-align-self-end.sc-wl-drawer{align-self:flex-end !important}/*!@.wl-align-self-center*/.wl-align-self-center.sc-wl-drawer{align-self:center !important}/*!@.wl-align-self-stretch*/.wl-align-self-stretch.sc-wl-drawer{align-self:stretch !important}/*!@.wl-align-self-baseline*/.wl-align-self-baseline.sc-wl-drawer{align-self:baseline !important}/*!@.wl-align-self-auto*/.wl-align-self-auto.sc-wl-drawer{align-self:auto !important}/*!@.wl-wrap*/.wl-wrap.sc-wl-drawer{flex-wrap:wrap !important}/*!@.wl-nowrap*/.wl-nowrap.sc-wl-drawer{flex-wrap:nowrap !important}/*!@.wl-wrap-reverse*/.wl-wrap-reverse.sc-wl-drawer{flex-wrap:wrap-reverse !important}/*!@.wl-justify-content-start*/.wl-justify-content-start.sc-wl-drawer{justify-content:flex-start !important}/*!@.wl-justify-content-center*/.wl-justify-content-center.sc-wl-drawer{justify-content:center !important}/*!@.wl-justify-content-end*/.wl-justify-content-end.sc-wl-drawer{justify-content:flex-end !important}/*!@.wl-justify-content-around*/.wl-justify-content-around.sc-wl-drawer{justify-content:space-around !important}/*!@.wl-justify-content-between*/.wl-justify-content-between.sc-wl-drawer{justify-content:space-between !important}/*!@.wl-justify-content-evenly*/.wl-justify-content-evenly.sc-wl-drawer{justify-content:space-evenly !important}/*!@.wl-align-items-start*/.wl-align-items-start.sc-wl-drawer{align-items:flex-start !important}/*!@.wl-align-items-center*/.wl-align-items-center.sc-wl-drawer{align-items:center !important}/*!@.wl-align-items-end*/.wl-align-items-end.sc-wl-drawer{align-items:flex-end !important}/*!@.wl-align-items-stretch*/.wl-align-items-stretch.sc-wl-drawer{align-items:stretch !important}/*!@.wl-align-items-baseline*/.wl-align-items-baseline.sc-wl-drawer{align-items:baseline !important}/*!@.wl-hide*/.wl-hide.sc-wl-drawer{display:none !important}/*!@.wl-hide-up*/.wl-hide-up.sc-wl-drawer{display:none !important}/*!@.wl-hide-down*/.wl-hide-down.sc-wl-drawer{display:none !important}@media (min-width: 576px){/*!@.wl-hide-sm-up*/.wl-hide-sm-up.sc-wl-drawer{display:none !important}}@media (max-width: 576px){/*!@.wl-hide-sm-down*/.wl-hide-sm-down.sc-wl-drawer{display:none !important}}@media (min-width: 768px){/*!@.wl-hide-md-up*/.wl-hide-md-up.sc-wl-drawer{display:none !important}}@media (max-width: 768px){/*!@.wl-hide-md-down*/.wl-hide-md-down.sc-wl-drawer{display:none !important}}@media (min-width: 992px){/*!@.wl-hide-lg-up*/.wl-hide-lg-up.sc-wl-drawer{display:none !important}}@media (max-width: 992px){/*!@.wl-hide-lg-down*/.wl-hide-lg-down.sc-wl-drawer{display:none !important}}@media (min-width: 1200px){/*!@.wl-hide-xl-up*/.wl-hide-xl-up.sc-wl-drawer{display:none !important}}@media (max-width: 1200px){/*!@.wl-hide-xl-down*/.wl-hide-xl-down.sc-wl-drawer{display:none !important}}/*!@#focus-guard*/#focus-guard.sc-wl-drawer{width:1px;height:0px;padding:0px;overflow:hidden;position:fixed;top:1px;left:1px}/*!@:host*/.sc-wl-drawer-h{left:0;right:0;top:0;bottom:0}/*!@[dir] :host*/[dir] .sc-wl-drawer-h{left:0;right:0}/*!@.overlay-container*/.overlay-container.sc-wl-drawer{position:fixed;background-color:rgba(0, 0, 0, 0.4);transform:translate(-100%);left:0;top:0;width:100vw;height:100vh;z-index:1300;opacity:0;transition:opacity 500ms ease-in-out}/*!@[data-focus-guard=true]*/[data-focus-guard=true].sc-wl-drawer{display:none}/*!@[data-focus-guard=false]*/[data-focus-guard=false].sc-wl-drawer{display:block}/*!@.overlay*/.overlay.sc-wl-drawer{position:fixed;transform:translate(-100%);left:0;top:0;width:100%;height:100%;z-index:1400}/*!@.overlay .dialog*/.overlay.sc-wl-drawer .dialog.sc-wl-drawer{transition:all 500ms ease-in-out;opacity:0;will-change:opacity, transform;transform:inherit;right:inherit;top:inherit;left:inherit;height:100vh;outline:0;max-width:20rem;width:100%;position:fixed;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;z-index:1400;background-color:#fff;box-shadow:0 7px 14px 0 rgba(0, 0, 0, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.07)}";

class WlDrawer {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.drawerOpenStateChange = createEvent(this, "drawerOpenStateChange", 7);
    this.placement = "left";
    this.isOpen = false;
    this.transform = "";
    this.isAnimating = false;
    // width!: number; // TODO
    this.isEndSide = false;
  }
  getStylesFromPlacement(placement) {
    var _a;
    let percent = "100%";
    if (this.isOpen) {
      percent = "0%";
    }
    let positionStyles = {
      transform: `translateX(+${percent})`,
      right: "0px",
    };
    const rightPercent = window.innerWidth - (((_a = this.Dialog) === null || _a === void 0 ? void 0 : _a.clientWidth) || 300);
    let right = {
      transform: `translateX(${rightPercent}px)`,
      right: "0px",
    };
    let left = {
      transform: `translateX(-${percent})`,
      left: "0px",
    };
    let top = {
      transform: `translateY(-${percent})`,
      top: "0px",
      maxWidth: "100vw",
      height: "auto",
      left: "0px",
      right: "0px",
      bottom: "unset",
    };
    let bottom = {
      transform: `translateY(+${percent})`,
      bottom: "0px",
      maxWidth: "100vw",
      height: "auto",
      left: "0px",
      right: "0px",
      top: "unset",
    };
    switch (placement) {
      case "right":
        positionStyles = right;
        this.transform = right.transform;
        break;
      case "left":
        positionStyles = left;
        this.transform = left.transform;
        break;
      case "top":
        this.transform = top.transform;
        positionStyles = top;
        break;
      case "bottom":
        this.transform = bottom.transform;
        positionStyles = bottom;
        break;
    }
    return positionStyles;
  }
  async close() {
    this.isOpen = false;
  }
  async open() {
    this.isOpen = true;
  }
  //toggle body overflow hidden
  setBodyOverflow(value) {
    const body = document.querySelector("body");
    body.style.overflow = value;
  }
  disconnectedCallback() {
    this.setBodyOverflow("");
    this.drawerOpenStateChange.emit({ isOpen: this.isOpen });
  }
  watchHandler(newValue, oldValue) {
    this.drawerOpenStateChange.emit({
      isOpen: newValue,
    });
    if (newValue === oldValue && newValue === false) {
      this.setBodyOverflow(""); // reset overflow
    }
    if (newValue !== oldValue) {
      if (newValue === false) {
        animate(this, false); //doing the overflow in animate.
        // this.setBodyOverflow("");
      }
      else {
        // this.setBodyOverflow("hidden");
        animate(this, true); //doing the overflow in animate.
        this.drawerOpenStateChange.emit({
          isOpen: true,
        });
      }
    }
  }
  render() {
    let styles = this.getStylesFromPlacement(this.placement);
    const mode = getWlMode(this);
    return (hAsync(Host, { role: "navigation", "aria-hidden": this.isOpen ? "false" : "true", class: Object.assign({ "is-open": this.isOpen, [mode]: true }, createColorClasses(this.color)) }, hAsync("slot", { name: "button-open" }, hAsync("wl-drawer-menu-button", { onClick: () => this.open() })), hAsync("div", { id: "focus-guard" }), hAsync("div", { class: "overlay-container", ref: (el) => (this.OverlayContainer = el) }, hAsync("div", { ref: (el) => (this.overlayElement = el), class: "overlay", onClick: (e) => {
        if (e.target) {
          // let target = e.srcElement as HTMLDivElement;
          const target = e.target;
          let shouldClose = target.className === "overlay";
          if (shouldClose) {
            this.close();
          }
        }
      } }, hAsync("div", { class: "dialog", style: styles, ref: (el) => (this.Dialog = el) }, hAsync("slot", null)))), hAsync("div", { "data-focus-guard": this.isOpen, tabindex: "0", style: {
        width: "1px",
        height: "0px",
        padding: "0px",
        overflow: "hidden",
        position: "fixed",
        top: "1px",
        left: "1px",
      } })));
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "isOpen": ["watchHandler"]
  }; }
  static get style() { return drawerCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer",
    "$members$": {
      "placement": [513],
      "isOpen": [1540, "is-open"],
      "disabled": [516, "color"],
      "transform": [32],
      "close": [64],
      "open": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["placement", "placement"], ["isOpen", "is-open"], ["disabled", "color"]]
  }; }
}
// const iosEasing = 'cubic-bezier(0.32,0.72,0,1)';
// const mdEasing = 'cubic-bezier(0.0,0.0,0.2,1)';
// const iosEasingReverse = 'cubic-bezier(1, 0, 0.68, 0.28)';
// const mdEasingReverse = 'cubic-bezier(0.4, 0, 0.6, 1)';
function setBodyOverflow(value) {
  const body = document.querySelector("body");
  body.style.overflow = value;
}
async function animate(drawer, open) {
  const overlayContainer = drawer.OverlayContainer;
  const overlay = drawer.overlayElement;
  const dialog = drawer.Dialog;
  const transform = drawer.transform;
  const width = window.innerWidth - dialog.clientWidth;
  let replace = "-100%";
  if (drawer.placement === "right") {
    replace = `${width}px`;
  }
  // const placement = drawer.getStylesFromPlacement(drawer.placement) as PositionStyles
  if (open) {
    setBodyOverflow("hidden");
    overlayContainer.style.transform = "translate(0%)";
    overlayContainer.style.opacity = "1";
    overlay.style.transform = "translate(0%)";
    dialog.style.transform = transform; // 'translateX(0%)'
    dialog.style.opacity = "1";
  }
  else {
    setBodyOverflow("");
    await sleep(100);
    overlayContainer.style.opacity = "0";
    dialog.style.transform = transform.replace("0%", replace);
    dialog.style.opacity = "0";
    await sleep(400);
    overlayContainer.style.transform = "translate(-100%)";
    overlay.style.transform = "translate(-100%)";
  }
}
function sleep(n) {
  return new Promise((r) => setTimeout(r, n));
}

const drawerBodyCss = "/*!@:host*/.sc-wl-drawer-body-h{padding-left:1.5rem;padding-right:1.5rem;padding-top:0.5rem;padding-bottom:0.5rem;flex:1 1 0%;height:100%;flex-direction:column;display:flex;color:var(--wl-color-base, #000)}";

class WlDrawerBody {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (hAsync(Host, null, hAsync("slot", null)));
  }
  static get style() { return drawerBodyCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-body",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const closebuttonCss = "/*!@wl-button.close,\nbutton.close*/wl-button.close.sc-wl-drawer-close-button,button.close.sc-wl-drawer-close-button{outline:none;width:32px;height:32px;display:-webkit-inline-box;display:-webkit-inline-flex;display:-ms-inline-flexbox;display:inline-flex;-webkit-align-items:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;border-radius:0.25rem;-webkit-transition:all 0.2s;transition:all 0.2s;-webkit-flex:0 0 auto;-ms-flex:0 0 auto;flex:0 0 auto;position:fixed;top:8px;right:12px;z-index:1}/*!@svg*/svg.sc-wl-drawer-close-button{width:12px;height:12px;color:inherit;display:inline-block;vertical-align:middle;-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateY(-8%)}";

class WlDrawerCloseButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  async close() {
    const drawer = this.el.closest("wl-drawer");
    if (drawer) {
      drawer.close();
    }
  }
  render() {
    const buttonProps = this.buttonProps;
    return (hAsync(Host, { color: this.color, variant: this.variant, class: Object.assign(Object.assign({}, createColorClasses(this.color)), { "in-drawer": hostContext("wl-drawer", this.el) }) }, hAsync("wl-button", Object.assign({}, buttonProps, { color: this.color, variant: this.variant, class: "close wl-no-padding", onClick: () => this.close(), circular: this.circular }), hAsync("svg", { viewBox: "0 0 24 24", focusable: "false", role: "presentation", "aria-hidden": "true", class: "css-1idynds" }, hAsync("path", { fill: "currentColor", d: "M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z" })))));
  }
  get el() { return getElement(this); }
  static get style() { return closebuttonCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-close-button",
    "$members$": {
      "color": [1],
      "variant": [1],
      "circular": [4],
      "buttonProps": [16],
      "close": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const drawerContentCss = "";

class WlDrawerContent {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (hAsync(Host, null, hAsync("slot", null)));
  }
  static get style() { return drawerContentCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-content",
    "$members$": undefined,
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const drawerFooterCss = "/*!@:host(.fixed)*/.fixed.sc-wl-drawer-footer-h{bottom:0;position:fixed;right:0;left:0}/*!@:host*/.sc-wl-drawer-footer-h{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:end;-webkit-justify-content:flex-end;-ms-flex-pack:end;justify-content:flex-end;padding-left:1.5rem;padding-right:1.5rem;padding-top:1rem;padding-bottom:1rem;color:var(--wl-color-base, #000);border-color:rgba(var(--wl-color-base-rgb), 0.2);border-top:1px solid rgba(var(--wl-color-base-rgb), 0.2)}/*!@:host :host::before,\n:host :host::after*/.sc-wl-drawer-footer-h .sc-wl-drawer-footer::before,.sc-wl-drawer-footer-h .sc-wl-drawer-footer::after{border-width:0px;border-style:solid;border-color:rgba(var(--wl-color-base-rgb), 0.2)}/*!@:host footer*/.sc-wl-drawer-footer-h footer.sc-wl-drawer-footer{color:var(--wl-color-base, #000);width:100%}";

class WlDrawerFooter {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.fixed = false;
  }
  render() {
    return (hAsync(Host, { class: {
        fixed: this.fixed,
      } }, hAsync("footer", null, hAsync("slot", null))));
  }
  static get style() { return drawerFooterCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-footer",
    "$members$": {
      "fixed": [516]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["fixed", "fixed"]]
  }; }
}

const drawerHeaderCss = "/*!@html*/html.sc-wl-drawer-header{--wl-font-family:var(--wl-default-font)}/*!@body*/body.sc-wl-drawer-header{background:var(--wl-background-color)}/*!@body.backdrop-no-scroll*/body.backdrop-no-scroll.sc-wl-drawer-header{overflow:hidden}/*!@html.ios wl-modal.modal-card .wl-page > wl-header > wl-toolbar:first-of-type*/html.ios.sc-wl-drawer-header wl-modal.modal-card.sc-wl-drawer-header .wl-page.sc-wl-drawer-header>wl-header.sc-wl-drawer-header>wl-toolbar.sc-wl-drawer-header:first-of-type{padding-top:0px}/*!@html.ios wl-modal .wl-page*/html.ios.sc-wl-drawer-header wl-modal.sc-wl-drawer-header .wl-page.sc-wl-drawer-header{border-radius:inherit}/*!@.wl-color-primary*/.wl-color-primary.sc-wl-drawer-header{--wl-color-base:var(--wl-color-primary, #3880ff) !important;--wl-color-base-rgb:var(\n    --wl-color-primary-rgb,\n    56, 128, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-primary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-primary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-primary-shade, #3171e0) !important;--wl-color-tint:var(--wl-color-primary-tint, #4c8dff) !important}/*!@.wl-color-secondary*/.wl-color-secondary.sc-wl-drawer-header{--wl-color-base:var(--wl-color-secondary, #3dc2ff) !important;--wl-color-base-rgb:var(\n    --wl-color-secondary-rgb,\n    61, 194, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-secondary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-secondary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-secondary-shade, #36abe0) !important;--wl-color-tint:var(--wl-color-secondary-tint, #50c8ff) !important}/*!@.wl-color-tertiary*/.wl-color-tertiary.sc-wl-drawer-header{--wl-color-base:var(--wl-color-tertiary, #5260ff) !important;--wl-color-base-rgb:var(\n    --wl-color-tertiary-rgb,\n    82, 96, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-tertiary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-tertiary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #4854e0) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #6370ff) !important}/*!@.wl-color-success*/.wl-color-success.sc-wl-drawer-header{--wl-color-base:var(--wl-color-success, #2dd36f) !important;--wl-color-base-rgb:var(\n    --wl-color-success-rgb,\n    45, 211, 111\n  ) !important;--wl-color-contrast:var(\n    --wl-color-success-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-success-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-success-shade, #28ba62) !important;--wl-color-tint:var(--wl-color-success-tint, #42d77d) !important}/*!@.wl-color-warning*/.wl-color-warning.sc-wl-drawer-header{--wl-color-base:var(--wl-color-warning, #ffc409) !important;--wl-color-base-rgb:var(\n    --wl-color-warning-rgb,\n    255, 196, 9\n  ) !important;--wl-color-contrast:var(\n    --wl-color-warning-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-warning-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0ac08) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffca22) !important}/*!@.wl-color-danger*/.wl-color-danger.sc-wl-drawer-header{--wl-color-base:var(--wl-color-danger, #eb445a) !important;--wl-color-base-rgb:var(\n    --wl-color-danger-rgb,\n    235, 68, 90\n  ) !important;--wl-color-contrast:var(\n    --wl-color-danger-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-danger-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-danger-shade, #cf3c4f) !important;--wl-color-tint:var(--wl-color-danger-tint, #ed576b) !important}/*!@.wl-color-light*/.wl-color-light.sc-wl-drawer-header{--wl-color-base:var(--wl-color-light, #f4f5f8) !important;--wl-color-base-rgb:var(\n    --wl-color-light-rgb,\n    244, 245, 248\n  ) !important;--wl-color-contrast:var(\n    --wl-color-light-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-light-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-light-shade, #d7d8da) !important;--wl-color-tint:var(--wl-color-light-tint, #f5f6f9) !important}/*!@.wl-color-medium*/.wl-color-medium.sc-wl-drawer-header{--wl-color-base:var(--wl-color-medium, #92949c) !important;--wl-color-base-rgb:var(\n    --wl-color-medium-rgb,\n    146, 148, 156\n  ) !important;--wl-color-contrast:var(\n    --wl-color-medium-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-medium-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-medium-shade, #808289) !important;--wl-color-tint:var(--wl-color-medium-tint, #9d9fa6) !important}/*!@.wl-color-dark*/.wl-color-dark.sc-wl-drawer-header{--wl-color-base:var(--wl-color-dark, #222428) !important;--wl-color-base-rgb:var(\n    --wl-color-dark-rgb,\n    34, 36, 40\n  ) !important;--wl-color-contrast:var(\n    --wl-color-dark-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-dark-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-dark-shade, #1e2023) !important;--wl-color-tint:var(--wl-color-dark-tint, #383a3e) !important}/*!@.wl-page*/.wl-page.sc-wl-drawer-header{left:0;right:0;top:0;bottom:0;display:flex;position:absolute;flex-direction:column;justify-content:space-between;contain:layout size style;overflow:hidden;z-index:0}/*!@[dir] .wl-page*/[dir].sc-wl-drawer-header .wl-page.sc-wl-drawer-header{left:0;right:0}/*!@.split-pane-visible > .wl-page.split-pane-main*/.split-pane-visible.sc-wl-drawer-header>.wl-page.split-pane-main.sc-wl-drawer-header{position:relative}/*!@.wl-page-hidden,\n[hidden]*/.wl-page-hidden.sc-wl-drawer-header,[hidden].sc-wl-drawer-header{display:none !important}/*!@.wl-page-invisible*/.wl-page-invisible.sc-wl-drawer-header{opacity:0}/*!@.can-go-back > wl-header wl-back-button*/.can-go-back.sc-wl-drawer-header>wl-header.sc-wl-drawer-header wl-back-button.sc-wl-drawer-header{display:block}/*!@html.plt-ios.plt-hybrid,\nhtml.plt-ios.plt-pwa*/html.plt-ios.plt-hybrid.sc-wl-drawer-header,html.plt-ios.plt-pwa.sc-wl-drawer-header{--wl-statusbar-padding:20px}@supports (padding-top: 20px){/*!@html*/html.sc-wl-drawer-header{--wl-safe-area-top:var(--wl-statusbar-padding)}}@supports (padding-top: constant(safe-area-inset-top)){/*!@html*/html.sc-wl-drawer-header{--wl-safe-area-top:constant(safe-area-inset-top);--wl-safe-area-bottom:constant(safe-area-inset-bottom);--wl-safe-area-left:constant(safe-area-inset-left);--wl-safe-area-right:constant(safe-area-inset-right)}}@supports (padding-top: env(safe-area-inset-top)){/*!@html*/html.sc-wl-drawer-header{--wl-safe-area-top:env(safe-area-inset-top);--wl-safe-area-bottom:env(safe-area-inset-bottom);--wl-safe-area-left:env(safe-area-inset-left);--wl-safe-area-right:env(safe-area-inset-right)}}/*!@wl-card.wl-color .wl-inherit-color,\nwl-card-header.wl-color .wl-inherit-color*/wl-card.wl-color.sc-wl-drawer-header .wl-inherit-color.sc-wl-drawer-header,wl-card-header.wl-color.sc-wl-drawer-header .wl-inherit-color.sc-wl-drawer-header{color:inherit}/*!@.menu-content*/.menu-content.sc-wl-drawer-header{transform:translate3d(0,  0,  0)}/*!@[dir] .menu-content*/[dir].sc-wl-drawer-header .menu-content.sc-wl-drawer-header{transform:translate3d(0,  0,  0)}/*!@.menu-content-open*/.menu-content-open.sc-wl-drawer-header{cursor:pointer;touch-action:manipulation;pointer-events:none}/*!@audio,\ncanvas,\nprogress,\nvideo*/audio.sc-wl-drawer-header,canvas.sc-wl-drawer-header,progress.sc-wl-drawer-header,video.sc-wl-drawer-header{vertical-align:baseline}/*!@audio:not([controls])*/audio.sc-wl-drawer-header:not([controls]){display:none;height:0}/*!@b,\nstrong*/b.sc-wl-drawer-header,strong.sc-wl-drawer-header{font-weight:bold}/*!@img*/img.sc-wl-drawer-header{max-width:100%;border:0}/*!@svg:not(:root)*/svg.sc-wl-drawer-header:not(:root){overflow:hidden}/*!@figure*/figure.sc-wl-drawer-header{margin:1em 40px}/*!@hr*/hr.sc-wl-drawer-header{height:1px;border-width:0;box-sizing:content-box}/*!@pre*/pre.sc-wl-drawer-header{overflow:auto}/*!@code,\nkbd,\npre,\nsamp*/code.sc-wl-drawer-header,kbd.sc-wl-drawer-header,pre.sc-wl-drawer-header,samp.sc-wl-drawer-header{font-family:monospace, monospace;font-size:1em}/*!@label,\ninput,\nselect,\ntextarea*/label.sc-wl-drawer-header,input.sc-wl-drawer-header,select.sc-wl-drawer-header,textarea.sc-wl-drawer-header{font-family:inherit;line-height:normal}/*!@textarea*/textarea.sc-wl-drawer-header{overflow:auto;height:auto;font:inherit;color:inherit}/*!@textarea::placeholder*/textarea.sc-wl-drawer-header::placeholder{padding-left:2px}/*!@form,\ninput,\noptgroup,\nselect*/form.sc-wl-drawer-header,input.sc-wl-drawer-header,optgroup.sc-wl-drawer-header,select.sc-wl-drawer-header{margin:0;font:inherit;color:inherit}/*!@html input[type=button],\ninput[type=reset],\ninput[type=submit]*/html.sc-wl-drawer-header input[type=button].sc-wl-drawer-header,input[type=reset].sc-wl-drawer-header,input[type=submit].sc-wl-drawer-header{cursor:pointer;-webkit-appearance:button}/*!@a,\na div,\na span,\na wl-icon,\na wl-label,\nbutton,\nbutton div,\nbutton span,\nbutton wl-icon,\nbutton wl-label,\n.wl-tappable,\n[tappable],\n[tappable] div,\n[tappable] span,\n[tappable] wl-icon,\n[tappable] wl-label,\ninput,\ntextarea*/a.sc-wl-drawer-header,a.sc-wl-drawer-header div.sc-wl-drawer-header,a.sc-wl-drawer-header span.sc-wl-drawer-header,a.sc-wl-drawer-header wl-icon.sc-wl-drawer-header,a.sc-wl-drawer-header wl-label.sc-wl-drawer-header,button.sc-wl-drawer-header,button.sc-wl-drawer-header div.sc-wl-drawer-header,button.sc-wl-drawer-header span.sc-wl-drawer-header,button.sc-wl-drawer-header wl-icon.sc-wl-drawer-header,button.sc-wl-drawer-header wl-label.sc-wl-drawer-header,.wl-tappable.sc-wl-drawer-header,[tappable].sc-wl-drawer-header,[tappable].sc-wl-drawer-header div.sc-wl-drawer-header,[tappable].sc-wl-drawer-header span.sc-wl-drawer-header,[tappable].sc-wl-drawer-header wl-icon.sc-wl-drawer-header,[tappable].sc-wl-drawer-header wl-label.sc-wl-drawer-header,input.sc-wl-drawer-header,textarea.sc-wl-drawer-header{touch-action:manipulation}/*!@a wl-label,\nbutton wl-label*/a.sc-wl-drawer-header wl-label.sc-wl-drawer-header,button.sc-wl-drawer-header wl-label.sc-wl-drawer-header{pointer-events:none}/*!@button*/button.sc-wl-drawer-header{border:0;border-radius:0;font-family:inherit;font-style:inherit;font-variant:inherit;line-height:1;text-transform:none;cursor:pointer;-webkit-appearance:button}/*!@[tappable]*/[tappable].sc-wl-drawer-header{cursor:pointer}/*!@a[disabled],\nbutton[disabled],\nhtml input[disabled]*/a[disabled].sc-wl-drawer-header,button[disabled].sc-wl-drawer-header,html.sc-wl-drawer-header input[disabled].sc-wl-drawer-header{cursor:default}/*!@button::-moz-focus-inner,\ninput::-moz-focus-inner*/button.sc-wl-drawer-header::-moz-focus-inner,input.sc-wl-drawer-header::-moz-focus-inner{padding:0;border:0}/*!@input[type=checkbox],\ninput[type=radio]*/input[type=checkbox].sc-wl-drawer-header,input[type=radio].sc-wl-drawer-header{padding:0;box-sizing:border-box}/*!@input[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button*/input[type=number].sc-wl-drawer-header::-webkit-inner-spin-button,input[type=number].sc-wl-drawer-header::-webkit-outer-spin-button{height:auto}/*!@input[type=search]::-webkit-search-cancel-button,\ninput[type=search]::-webkit-search-decoration*/input[type=search].sc-wl-drawer-header::-webkit-search-cancel-button,input[type=search].sc-wl-drawer-header::-webkit-search-decoration{-webkit-appearance:none}/*!@table*/table.sc-wl-drawer-header{border-collapse:collapse;border-spacing:0}/*!@td,\nth*/td.sc-wl-drawer-header,th.sc-wl-drawer-header{padding:0}/*!@**/*.sc-wl-drawer-header{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}/*!@html*/html.sc-wl-drawer-header{width:100%;height:100%;text-size-adjust:100%}/*!@html:not(.hydrated) body*/html.sc-wl-drawer-header:not(.hydrated) body.sc-wl-drawer-header{display:none}/*!@html.plt-pwa*/html.plt-pwa.sc-wl-drawer-header{height:100vh}/*!@body*/body.sc-wl-drawer-header{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;text-rendering:optimizeLegibility;touch-action:manipulation;-webkit-user-drag:none;-ms-content-zooming:none;word-wrap:break-word;overscroll-behavior-y:none;text-size-adjust:none}/*!@html*/html.sc-wl-drawer-header{font-family:var(--wl-font-family)}/*!@a*/a.sc-wl-drawer-header{background-color:transparent;color:var(--wl-color-primary, #3880ff)}/*!@h1,\nh2,\nh3,\nh4,\nh5,\nh6*/h1.sc-wl-drawer-header,h2.sc-wl-drawer-header,h3.sc-wl-drawer-header,h4.sc-wl-drawer-header,h5.sc-wl-drawer-header,h6.sc-wl-drawer-header{font-weight:500;line-height:1.2}/*!@h1*/h1.sc-wl-drawer-header{font-size:26px}/*!@h2*/h2.sc-wl-drawer-header{font-size:24px}/*!@h3*/h3.sc-wl-drawer-header{font-size:22px}/*!@h4*/h4.sc-wl-drawer-header{font-size:20px}/*!@h5*/h5.sc-wl-drawer-header{font-size:18px}/*!@h6*/h6.sc-wl-drawer-header{font-size:16px}/*!@small*/small.sc-wl-drawer-header{font-size:75%}/*!@sub,\nsup*/sub.sc-wl-drawer-header,sup.sc-wl-drawer-header{position:relative;font-size:75%;line-height:0;vertical-align:baseline}/*!@sup*/sup.sc-wl-drawer-header{top:-0.5em}/*!@sub*/sub.sc-wl-drawer-header{bottom:-0.25em}/*!@.wl-no-padding*/.wl-no-padding.sc-wl-drawer-header{--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}/*!@.wl-padding*/.wl-padding.sc-wl-drawer-header{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding*/.wl-padding.sc-wl-drawer-header{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-top*/.wl-padding-top.sc-wl-drawer-header{--padding-top:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px)}/*!@.wl-padding-start*/.wl-padding-start.sc-wl-drawer-header{--padding-start:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-start*/.wl-padding-start.sc-wl-drawer-header{padding-left:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px)}}/*!@.wl-padding-end*/.wl-padding-end.sc-wl-drawer-header{--padding-end:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-end*/.wl-padding-end.sc-wl-drawer-header{padding-right:unset;-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-bottom*/.wl-padding-bottom.sc-wl-drawer-header{--padding-bottom:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-vertical*/.wl-padding-vertical.sc-wl-drawer-header{--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-drawer-header{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-drawer-header{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-no-margin*/.wl-no-margin.sc-wl-drawer-header{--margin-start:0;--margin-end:0;--margin-top:0;--margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}/*!@.wl-margin*/.wl-margin.sc-wl-drawer-header{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin*/.wl-margin.sc-wl-drawer-header{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-top*/.wl-margin-top.sc-wl-drawer-header{--margin-top:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px)}/*!@.wl-margin-start*/.wl-margin-start.sc-wl-drawer-header{--margin-start:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-start*/.wl-margin-start.sc-wl-drawer-header{margin-left:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px)}}/*!@.wl-margin-end*/.wl-margin-end.sc-wl-drawer-header{--margin-end:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-end*/.wl-margin-end.sc-wl-drawer-header{margin-right:unset;-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-bottom*/.wl-margin-bottom.sc-wl-drawer-header{--margin-bottom:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-vertical*/.wl-margin-vertical.sc-wl-drawer-header{--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-drawer-header{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-drawer-header{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-float-left*/.wl-float-left.sc-wl-drawer-header{float:left !important}/*!@[dir] .wl-float-left*/[dir].sc-wl-drawer-header .wl-float-left.sc-wl-drawer-header{float:left !important}/*!@.wl-float-right*/.wl-float-right.sc-wl-drawer-header{float:right !important}/*!@[dir] .wl-float-right*/[dir].sc-wl-drawer-header .wl-float-right.sc-wl-drawer-header{float:right !important}/*!@.wl-float-start*/.wl-float-start.sc-wl-drawer-header{float:left !important}/*!@[dir=rtl] .wl-float-start, :host-context([dir=rtl]) .wl-float-start*/[dir=rtl].sc-wl-drawer-header .wl-float-start.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-start.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-start.sc-wl-drawer-header{float:right !important}/*!@.wl-float-end*/.wl-float-end.sc-wl-drawer-header{float:right !important}/*!@[dir=rtl] .wl-float-end, :host-context([dir=rtl]) .wl-float-end*/[dir=rtl].sc-wl-drawer-header .wl-float-end.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-end.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-end.sc-wl-drawer-header{float:left !important}@media (min-width: 576px){/*!@.wl-float-sm-left*/.wl-float-sm-left.sc-wl-drawer-header{float:left !important}/*!@[dir] .wl-float-sm-left*/[dir].sc-wl-drawer-header .wl-float-sm-left.sc-wl-drawer-header{float:left !important}/*!@.wl-float-sm-right*/.wl-float-sm-right.sc-wl-drawer-header{float:right !important}/*!@[dir] .wl-float-sm-right*/[dir].sc-wl-drawer-header .wl-float-sm-right.sc-wl-drawer-header{float:right !important}/*!@.wl-float-sm-start*/.wl-float-sm-start.sc-wl-drawer-header{float:left !important}/*!@[dir=rtl] .wl-float-sm-start, :host-context([dir=rtl]) .wl-float-sm-start*/[dir=rtl].sc-wl-drawer-header .wl-float-sm-start.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-sm-start.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-sm-start.sc-wl-drawer-header{float:right !important}/*!@.wl-float-sm-end*/.wl-float-sm-end.sc-wl-drawer-header{float:right !important}/*!@[dir=rtl] .wl-float-sm-end, :host-context([dir=rtl]) .wl-float-sm-end*/[dir=rtl].sc-wl-drawer-header .wl-float-sm-end.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-sm-end.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-sm-end.sc-wl-drawer-header{float:left !important}}@media (min-width: 768px){/*!@.wl-float-md-left*/.wl-float-md-left.sc-wl-drawer-header{float:left !important}/*!@[dir] .wl-float-md-left*/[dir].sc-wl-drawer-header .wl-float-md-left.sc-wl-drawer-header{float:left !important}/*!@.wl-float-md-right*/.wl-float-md-right.sc-wl-drawer-header{float:right !important}/*!@[dir] .wl-float-md-right*/[dir].sc-wl-drawer-header .wl-float-md-right.sc-wl-drawer-header{float:right !important}/*!@.wl-float-md-start*/.wl-float-md-start.sc-wl-drawer-header{float:left !important}/*!@[dir=rtl] .wl-float-md-start, :host-context([dir=rtl]) .wl-float-md-start*/[dir=rtl].sc-wl-drawer-header .wl-float-md-start.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-md-start.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-md-start.sc-wl-drawer-header{float:right !important}/*!@.wl-float-md-end*/.wl-float-md-end.sc-wl-drawer-header{float:right !important}/*!@[dir=rtl] .wl-float-md-end, :host-context([dir=rtl]) .wl-float-md-end*/[dir=rtl].sc-wl-drawer-header .wl-float-md-end.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-md-end.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-md-end.sc-wl-drawer-header{float:left !important}}@media (min-width: 992px){/*!@.wl-float-lg-left*/.wl-float-lg-left.sc-wl-drawer-header{float:left !important}/*!@[dir] .wl-float-lg-left*/[dir].sc-wl-drawer-header .wl-float-lg-left.sc-wl-drawer-header{float:left !important}/*!@.wl-float-lg-right*/.wl-float-lg-right.sc-wl-drawer-header{float:right !important}/*!@[dir] .wl-float-lg-right*/[dir].sc-wl-drawer-header .wl-float-lg-right.sc-wl-drawer-header{float:right !important}/*!@.wl-float-lg-start*/.wl-float-lg-start.sc-wl-drawer-header{float:left !important}/*!@[dir=rtl] .wl-float-lg-start, :host-context([dir=rtl]) .wl-float-lg-start*/[dir=rtl].sc-wl-drawer-header .wl-float-lg-start.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-lg-start.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-lg-start.sc-wl-drawer-header{float:right !important}/*!@.wl-float-lg-end*/.wl-float-lg-end.sc-wl-drawer-header{float:right !important}/*!@[dir=rtl] .wl-float-lg-end, :host-context([dir=rtl]) .wl-float-lg-end*/[dir=rtl].sc-wl-drawer-header .wl-float-lg-end.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-lg-end.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-lg-end.sc-wl-drawer-header{float:left !important}}@media (min-width: 1200px){/*!@.wl-float-xl-left*/.wl-float-xl-left.sc-wl-drawer-header{float:left !important}/*!@[dir] .wl-float-xl-left*/[dir].sc-wl-drawer-header .wl-float-xl-left.sc-wl-drawer-header{float:left !important}/*!@.wl-float-xl-right*/.wl-float-xl-right.sc-wl-drawer-header{float:right !important}/*!@[dir] .wl-float-xl-right*/[dir].sc-wl-drawer-header .wl-float-xl-right.sc-wl-drawer-header{float:right !important}/*!@.wl-float-xl-start*/.wl-float-xl-start.sc-wl-drawer-header{float:left !important}/*!@[dir=rtl] .wl-float-xl-start, :host-context([dir=rtl]) .wl-float-xl-start*/[dir=rtl].sc-wl-drawer-header .wl-float-xl-start.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-xl-start.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-xl-start.sc-wl-drawer-header{float:right !important}/*!@.wl-float-xl-end*/.wl-float-xl-end.sc-wl-drawer-header{float:right !important}/*!@[dir=rtl] .wl-float-xl-end, :host-context([dir=rtl]) .wl-float-xl-end*/[dir=rtl].sc-wl-drawer-header .wl-float-xl-end.sc-wl-drawer-header,[dir=rtl].sc-wl-drawer-header-h .wl-float-xl-end.sc-wl-drawer-header,[dir=rtl] .sc-wl-drawer-header-h .wl-float-xl-end.sc-wl-drawer-header{float:left !important}}/*!@.wl-text-center*/.wl-text-center.sc-wl-drawer-header{text-align:center !important}/*!@.wl-text-justify*/.wl-text-justify.sc-wl-drawer-header{text-align:justify !important}/*!@.wl-text-start*/.wl-text-start.sc-wl-drawer-header{text-align:start !important}/*!@.wl-text-end*/.wl-text-end.sc-wl-drawer-header{text-align:end !important}/*!@.wl-text-left*/.wl-text-left.sc-wl-drawer-header{text-align:left !important}/*!@.wl-text-right*/.wl-text-right.sc-wl-drawer-header{text-align:right !important}/*!@.wl-text-nowrap*/.wl-text-nowrap.sc-wl-drawer-header{white-space:nowrap !important}/*!@.wl-text-wrap*/.wl-text-wrap.sc-wl-drawer-header{white-space:normal !important}@media (min-width: 576px){/*!@.wl-text-sm-center*/.wl-text-sm-center.sc-wl-drawer-header{text-align:center !important}/*!@.wl-text-sm-justify*/.wl-text-sm-justify.sc-wl-drawer-header{text-align:justify !important}/*!@.wl-text-sm-start*/.wl-text-sm-start.sc-wl-drawer-header{text-align:start !important}/*!@.wl-text-sm-end*/.wl-text-sm-end.sc-wl-drawer-header{text-align:end !important}/*!@.wl-text-sm-left*/.wl-text-sm-left.sc-wl-drawer-header{text-align:left !important}/*!@.wl-text-sm-right*/.wl-text-sm-right.sc-wl-drawer-header{text-align:right !important}/*!@.wl-text-sm-nowrap*/.wl-text-sm-nowrap.sc-wl-drawer-header{white-space:nowrap !important}/*!@.wl-text-sm-wrap*/.wl-text-sm-wrap.sc-wl-drawer-header{white-space:normal !important}}@media (min-width: 768px){/*!@.wl-text-md-center*/.wl-text-md-center.sc-wl-drawer-header{text-align:center !important}/*!@.wl-text-md-justify*/.wl-text-md-justify.sc-wl-drawer-header{text-align:justify !important}/*!@.wl-text-md-start*/.wl-text-md-start.sc-wl-drawer-header{text-align:start !important}/*!@.wl-text-md-end*/.wl-text-md-end.sc-wl-drawer-header{text-align:end !important}/*!@.wl-text-md-left*/.wl-text-md-left.sc-wl-drawer-header{text-align:left !important}/*!@.wl-text-md-right*/.wl-text-md-right.sc-wl-drawer-header{text-align:right !important}/*!@.wl-text-md-nowrap*/.wl-text-md-nowrap.sc-wl-drawer-header{white-space:nowrap !important}/*!@.wl-text-md-wrap*/.wl-text-md-wrap.sc-wl-drawer-header{white-space:normal !important}}@media (min-width: 992px){/*!@.wl-text-lg-center*/.wl-text-lg-center.sc-wl-drawer-header{text-align:center !important}/*!@.wl-text-lg-justify*/.wl-text-lg-justify.sc-wl-drawer-header{text-align:justify !important}/*!@.wl-text-lg-start*/.wl-text-lg-start.sc-wl-drawer-header{text-align:start !important}/*!@.wl-text-lg-end*/.wl-text-lg-end.sc-wl-drawer-header{text-align:end !important}/*!@.wl-text-lg-left*/.wl-text-lg-left.sc-wl-drawer-header{text-align:left !important}/*!@.wl-text-lg-right*/.wl-text-lg-right.sc-wl-drawer-header{text-align:right !important}/*!@.wl-text-lg-nowrap*/.wl-text-lg-nowrap.sc-wl-drawer-header{white-space:nowrap !important}/*!@.wl-text-lg-wrap*/.wl-text-lg-wrap.sc-wl-drawer-header{white-space:normal !important}}@media (min-width: 1200px){/*!@.wl-text-xl-center*/.wl-text-xl-center.sc-wl-drawer-header{text-align:center !important}/*!@.wl-text-xl-justify*/.wl-text-xl-justify.sc-wl-drawer-header{text-align:justify !important}/*!@.wl-text-xl-start*/.wl-text-xl-start.sc-wl-drawer-header{text-align:start !important}/*!@.wl-text-xl-end*/.wl-text-xl-end.sc-wl-drawer-header{text-align:end !important}/*!@.wl-text-xl-left*/.wl-text-xl-left.sc-wl-drawer-header{text-align:left !important}/*!@.wl-text-xl-right*/.wl-text-xl-right.sc-wl-drawer-header{text-align:right !important}/*!@.wl-text-xl-nowrap*/.wl-text-xl-nowrap.sc-wl-drawer-header{white-space:nowrap !important}/*!@.wl-text-xl-wrap*/.wl-text-xl-wrap.sc-wl-drawer-header{white-space:normal !important}}/*!@.wl-text-uppercase*/.wl-text-uppercase.sc-wl-drawer-header{text-transform:uppercase !important}/*!@.wl-text-lowercase*/.wl-text-lowercase.sc-wl-drawer-header{text-transform:lowercase !important}/*!@.wl-text-capitalize*/.wl-text-capitalize.sc-wl-drawer-header{text-transform:capitalize !important}@media (min-width: 576px){/*!@.wl-text-sm-uppercase*/.wl-text-sm-uppercase.sc-wl-drawer-header{text-transform:uppercase !important}/*!@.wl-text-sm-lowercase*/.wl-text-sm-lowercase.sc-wl-drawer-header{text-transform:lowercase !important}/*!@.wl-text-sm-capitalize*/.wl-text-sm-capitalize.sc-wl-drawer-header{text-transform:capitalize !important}}@media (min-width: 768px){/*!@.wl-text-md-uppercase*/.wl-text-md-uppercase.sc-wl-drawer-header{text-transform:uppercase !important}/*!@.wl-text-md-lowercase*/.wl-text-md-lowercase.sc-wl-drawer-header{text-transform:lowercase !important}/*!@.wl-text-md-capitalize*/.wl-text-md-capitalize.sc-wl-drawer-header{text-transform:capitalize !important}}@media (min-width: 992px){/*!@.wl-text-lg-uppercase*/.wl-text-lg-uppercase.sc-wl-drawer-header{text-transform:uppercase !important}/*!@.wl-text-lg-lowercase*/.wl-text-lg-lowercase.sc-wl-drawer-header{text-transform:lowercase !important}/*!@.wl-text-lg-capitalize*/.wl-text-lg-capitalize.sc-wl-drawer-header{text-transform:capitalize !important}}@media (min-width: 1200px){/*!@.wl-text-xl-uppercase*/.wl-text-xl-uppercase.sc-wl-drawer-header{text-transform:uppercase !important}/*!@.wl-text-xl-lowercase*/.wl-text-xl-lowercase.sc-wl-drawer-header{text-transform:lowercase !important}/*!@.wl-text-xl-capitalize*/.wl-text-xl-capitalize.sc-wl-drawer-header{text-transform:capitalize !important}}/*!@.wl-align-self-start*/.wl-align-self-start.sc-wl-drawer-header{align-self:flex-start !important}/*!@.wl-align-self-end*/.wl-align-self-end.sc-wl-drawer-header{align-self:flex-end !important}/*!@.wl-align-self-center*/.wl-align-self-center.sc-wl-drawer-header{align-self:center !important}/*!@.wl-align-self-stretch*/.wl-align-self-stretch.sc-wl-drawer-header{align-self:stretch !important}/*!@.wl-align-self-baseline*/.wl-align-self-baseline.sc-wl-drawer-header{align-self:baseline !important}/*!@.wl-align-self-auto*/.wl-align-self-auto.sc-wl-drawer-header{align-self:auto !important}/*!@.wl-wrap*/.wl-wrap.sc-wl-drawer-header{flex-wrap:wrap !important}/*!@.wl-nowrap*/.wl-nowrap.sc-wl-drawer-header{flex-wrap:nowrap !important}/*!@.wl-wrap-reverse*/.wl-wrap-reverse.sc-wl-drawer-header{flex-wrap:wrap-reverse !important}/*!@.wl-justify-content-start*/.wl-justify-content-start.sc-wl-drawer-header{justify-content:flex-start !important}/*!@.wl-justify-content-center*/.wl-justify-content-center.sc-wl-drawer-header{justify-content:center !important}/*!@.wl-justify-content-end*/.wl-justify-content-end.sc-wl-drawer-header{justify-content:flex-end !important}/*!@.wl-justify-content-around*/.wl-justify-content-around.sc-wl-drawer-header{justify-content:space-around !important}/*!@.wl-justify-content-between*/.wl-justify-content-between.sc-wl-drawer-header{justify-content:space-between !important}/*!@.wl-justify-content-evenly*/.wl-justify-content-evenly.sc-wl-drawer-header{justify-content:space-evenly !important}/*!@.wl-align-items-start*/.wl-align-items-start.sc-wl-drawer-header{align-items:flex-start !important}/*!@.wl-align-items-center*/.wl-align-items-center.sc-wl-drawer-header{align-items:center !important}/*!@.wl-align-items-end*/.wl-align-items-end.sc-wl-drawer-header{align-items:flex-end !important}/*!@.wl-align-items-stretch*/.wl-align-items-stretch.sc-wl-drawer-header{align-items:stretch !important}/*!@.wl-align-items-baseline*/.wl-align-items-baseline.sc-wl-drawer-header{align-items:baseline !important}/*!@.wl-hide*/.wl-hide.sc-wl-drawer-header{display:none !important}/*!@.wl-hide-up*/.wl-hide-up.sc-wl-drawer-header{display:none !important}/*!@.wl-hide-down*/.wl-hide-down.sc-wl-drawer-header{display:none !important}@media (min-width: 576px){/*!@.wl-hide-sm-up*/.wl-hide-sm-up.sc-wl-drawer-header{display:none !important}}@media (max-width: 576px){/*!@.wl-hide-sm-down*/.wl-hide-sm-down.sc-wl-drawer-header{display:none !important}}@media (min-width: 768px){/*!@.wl-hide-md-up*/.wl-hide-md-up.sc-wl-drawer-header{display:none !important}}@media (max-width: 768px){/*!@.wl-hide-md-down*/.wl-hide-md-down.sc-wl-drawer-header{display:none !important}}@media (min-width: 992px){/*!@.wl-hide-lg-up*/.wl-hide-lg-up.sc-wl-drawer-header{display:none !important}}@media (max-width: 992px){/*!@.wl-hide-lg-down*/.wl-hide-lg-down.sc-wl-drawer-header{display:none !important}}@media (min-width: 1200px){/*!@.wl-hide-xl-up*/.wl-hide-xl-up.sc-wl-drawer-header{display:none !important}}@media (max-width: 1200px){/*!@.wl-hide-xl-down*/.wl-hide-xl-down.sc-wl-drawer-header{display:none !important}}/*!@:host header::before,\n:host header::after*/.sc-wl-drawer-header-h header.sc-wl-drawer-header::before,.sc-wl-drawer-header-h header.sc-wl-drawer-header::after{border-width:0px;border-style:solid;border-color:rgba(var(--wl-color-base-rgb), 0.8)}/*!@:host header*/.sc-wl-drawer-header-h header.sc-wl-drawer-header{color:var(--wl-color-base);padding-left:1.5rem;padding-right:1.5rem;padding-top:1rem;padding-bottom:1rem;position:relative;font-size:1.25rem;font-weight:600;border-bottom:1px solid var(--wl-color-step-900)}/*!@:host header h1,\n:host header p*/.sc-wl-drawer-header-h header.sc-wl-drawer-header h1.sc-wl-drawer-header,.sc-wl-drawer-header-h header.sc-wl-drawer-header p.sc-wl-drawer-header{margin:0}";

class WlDrawerHeader {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    return (hAsync(Host, { class: Object.assign({}, createColorClasses(this.color)) }, hAsync("header", null, hAsync("slot", null))));
  }
  static get style() { return drawerHeaderCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-header",
    "$members$": {
      "color": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"]]
  }; }
}

const drawerMenuButtonCss = "/*!@:host*/.sc-wl-drawer-menu-button-h{padding:0 1rem}/*!@.label*/.label.sc-wl-drawer-menu-button{width:100%;display:flex;align-items:inherit;justify-content:inherit}/*!@svg*/svg.sc-wl-drawer-menu-button{fill:current-color;width:1em;height:1em;display:inline-block;font-size:1.5rem;transition:fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;flex-shrink:0;user-select:none}/*!@.root*/.root.sc-wl-drawer-menu-button{top:0;left:0;right:0;bottom:0;z-index:0;overflow:hidden;position:absolute;border-radius:inherit;pointer-events:none}";

class WlDrawerMenuButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.variant = "clear";
    this.onClick = async (ev) => {
      const drawer = this.el.closest("wl-drawer");
      ev.preventDefault();
      if (drawer && !drawer.isOpen) {
        drawer.open();
        return;
      }
      if (drawer && drawer.isOpen) {
        drawer.close();
        return;
      }
    };
  }
  render() {
    const { size, color, variant } = this;
    return (hAsync(Host, { size: size, color: color, variant: variant }, hAsync("wl-button", { onClick: (e) => this.onClick(e), size: size, color: color, variant: variant }, hAsync("span", { class: "label" }, hAsync("svg", { class: "svg-icon", focusable: "false", fill: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true" }, hAsync("path", { d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" }))), hAsync("span", { class: "root" }, hAsync("slot", null)))));
  }
  get el() { return getElement(this); }
  static get style() { return drawerMenuButtonCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-drawer-menu-button",
    "$members$": {
      "variant": [513],
      "color": [513],
      "size": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["variant", "variant"], ["color", "color"], ["size", "size"]]
  }; }
}

const flexCss = "/*!@:host*/.sc-wl-flex-h{width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;padding-left:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;box-sizing:border-box;color:inherit}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-flex-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-xs, var(--wl-grid-column-padding, 5px))}}@media (min-width: 576px){/*!@:host*/.sc-wl-flex-h{padding-left:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-flex (margin-inline-start.sc-wl-flex: 0).sc-wl-flex or.sc-wl-flex (-webkit-margin-start.sc-wl-flex: 0).sc-wl-flex{.sc-wl-flex-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-sm, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 768px){/*!@:host*/.sc-wl-flex-h{padding-left:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-flex (margin-inline-start.sc-wl-flex: 0).sc-wl-flex or.sc-wl-flex (-webkit-margin-start.sc-wl-flex: 0).sc-wl-flex{.sc-wl-flex-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-md, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 992px){/*!@:host*/.sc-wl-flex-h{padding-left:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-flex (margin-inline-start.sc-wl-flex: 0).sc-wl-flex or.sc-wl-flex (-webkit-margin-start.sc-wl-flex: 0).sc-wl-flex{.sc-wl-flex-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-lg, var(--wl-grid-column-padding, 5px))}}}@media (min-width: 1200px){/*!@:host*/.sc-wl-flex-h{padding-left:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-right:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-top:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-bottom:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-flex (margin-inline-start.sc-wl-flex: 0).sc-wl-flex or.sc-wl-flex (-webkit-margin-start.sc-wl-flex: 0).sc-wl-flex{.sc-wl-flex-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-inline-start:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));-webkit-padding-end:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px));padding-inline-end:var(--wl-grid-column-padding-xl, var(--wl-grid-column-padding, 5px))}}}";

const win$2 = window;
const SUPPORTS_VARS$1 = !!(win$2.CSS &&
  win$2.CSS.supports &&
  win$2.CSS.supports("--a: 0"));
const BREAKPOINTS$1 = ["", "xs", "sm", "md", "lg", "xl"];
class WlFlex {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.justify = "between";
    this.align = "stretch";
    ////wl-align-items-${AlignmentModifier}
    //`wl-justify-content-${JustificationModifier}`
    this.wrap = "wrap";
  }
  onResize() {
    forceUpdate(this);
  }
  // Loop through all of the breakpoints to see if the media query
  // matches and grab the column value from the relevant prop if so
  getColumns(property) {
    let matched;
    for (const breakpoint of BREAKPOINTS$1) {
      const matches = matchBreakpoint(breakpoint);
      // Grab the value of the property, if it exists and our
      // media query matches we return the value
      const columns = this[property + breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)];
      if (matches && columns !== undefined) {
        matched = columns;
      }
    }
    // Return the last matched columns since the breakpoints
    // increase in size and we want to return the largest match
    return matched;
  }
  calculateSize() {
    const columns = this.getColumns("size");
    // If size wasn't set for any breakpoint
    // or if the user set the size without a value
    // it means we need to stick with the default and return
    if (!columns || columns === "") {
      return;
    }
    // If the size is set to auto then don't calculate a size
    const colSize = columns === "auto"
      ? "auto"
      : // If CSS supports variables we should use the grid columns var
        SUPPORTS_VARS$1
          ? `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
          : // Convert the columns to a percentage by dividing by the total number
            // of columns (12) and then multiplying by 100
            (columns / 12) * 100 + "%";
    return {
      flex: `0 0 ${colSize}`,
      width: `${colSize}`,
      "max-width": `${colSize}`,
    };
  }
  // Called by push, pull, and offset since they use the same calculations
  calculatePosition(property, modifier) {
    const columns = this.getColumns(property);
    if (!columns) {
      return;
    }
    // If the number of columns passed are greater than 0 and less than
    // 12 we can position the column, else default to auto
    const amount = SUPPORTS_VARS$1
      ? // If CSS supports variables we should use the grid columns var
        `calc(calc(${columns} / var(--wl-grid-columns, 12)) * 100%)`
      : // Convert the columns to a percentage by dividing by the total number
        // of columns (12) and then multiplying by 100
        columns > 0 && columns < 12
          ? (columns / 12) * 100 + "%"
          : "auto";
    return {
      [modifier]: amount,
    };
  }
  calculateOffset(isRTL) {
    return this.calculatePosition("offset", isRTL ? "margin-right" : "margin-left");
  }
  calculatePull(isRTL) {
    return this.calculatePosition("pull", isRTL ? "left" : "right");
  }
  calculatePush(isRTL) {
    return this.calculatePosition("push", isRTL ? "right" : "left");
  }
  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;
    let wrapping = `wl-${this.wrap}`;
    const isRTL = document.dir === "rtl";
    return (hAsync(Host, { class: {
        [justify]: true,
        [align]: true,
        [alignItems]: true,
        [wrapping]: true,
      }, style: Object.assign(Object.assign(Object.assign(Object.assign({}, this.calculateSize()), this.calculateOffset(isRTL)), this.calculatePull(isRTL)), this.calculatePush(isRTL)) }, hAsync("slot", null)));
  }
  static get style() { return flexCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-flex",
    "$members$": {
      "justify": [513],
      "align": [513],
      "wrap": [513],
      "size": [1],
      "sizeXs": [1, "size-xs"],
      "sizeSm": [1, "size-sm"],
      "sizeMd": [1, "size-md"],
      "sizeLg": [1, "size-lg"],
      "sizeXl": [1, "size-xl"],
      "offset": [1],
      "offsetXs": [1, "offset-xs"],
      "offsetSm": [1, "offset-sm"],
      "offsetMd": [1, "offset-md"],
      "offsetLg": [1, "offset-lg"],
      "offsetXl": [1, "offset-xl"],
      "pull": [1],
      "pullXs": [1, "pull-xs"],
      "pullSm": [1, "pull-sm"],
      "pullMd": [1, "pull-md"],
      "pullLg": [1, "pull-lg"],
      "pullXl": [1, "pull-xl"],
      "push": [1],
      "pushXs": [1, "push-xs"],
      "pushSm": [1, "push-sm"],
      "pushMd": [1, "push-md"],
      "pushLg": [1, "push-lg"],
      "pushXl": [1, "push-xl"]
    },
    "$listeners$": [[9, "resize", "onResize"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["justify", "justify"], ["align", "align"], ["wrap", "wrap"]]
  }; }
}

const wlGridCss = "/*!@:host*/.sc-wl-grid-h{padding-left:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));padding-right:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));padding-top:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));padding-bottom:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));margin-left:auto;margin-right:auto;display:block;flex:1}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-grid-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));padding-inline-start:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));-webkit-padding-end:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px));padding-inline-end:var(--wl-grid-padding-xs, var(--wl-grid-padding, 5px))}}@media (min-width: 576px){/*!@:host*/.sc-wl-grid-h{padding-left:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));padding-right:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));padding-top:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));padding-bottom:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-grid (margin-inline-start.sc-wl-grid: 0).sc-wl-grid or.sc-wl-grid (-webkit-margin-start.sc-wl-grid: 0).sc-wl-grid{.sc-wl-grid-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));padding-inline-start:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));-webkit-padding-end:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px));padding-inline-end:var(--wl-grid-padding-sm, var(--wl-grid-padding, 5px))}}}@media (min-width: 768px){/*!@:host*/.sc-wl-grid-h{padding-left:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));padding-right:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));padding-top:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));padding-bottom:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-grid (margin-inline-start.sc-wl-grid: 0).sc-wl-grid or.sc-wl-grid (-webkit-margin-start.sc-wl-grid: 0).sc-wl-grid{.sc-wl-grid-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));padding-inline-start:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));-webkit-padding-end:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px));padding-inline-end:var(--wl-grid-padding-md, var(--wl-grid-padding, 5px))}}}@media (min-width: 992px){/*!@:host*/.sc-wl-grid-h{padding-left:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));padding-right:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));padding-top:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));padding-bottom:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-grid (margin-inline-start.sc-wl-grid: 0).sc-wl-grid or.sc-wl-grid (-webkit-margin-start.sc-wl-grid: 0).sc-wl-grid{.sc-wl-grid-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));padding-inline-start:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));-webkit-padding-end:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px));padding-inline-end:var(--wl-grid-padding-lg, var(--wl-grid-padding, 5px))}}}@media (min-width: 1200px){/*!@:host*/.sc-wl-grid-h{padding-left:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));padding-right:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));padding-top:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));padding-bottom:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px))}/*!@@supports (margin-inline-start: 0) or (-webkit-margin-start: 0)*/@supports .sc-wl-grid (margin-inline-start.sc-wl-grid: 0).sc-wl-grid or.sc-wl-grid (-webkit-margin-start.sc-wl-grid: 0).sc-wl-grid{.sc-wl-grid-h{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));padding-inline-start:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));-webkit-padding-end:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px));padding-inline-end:var(--wl-grid-padding-xl, var(--wl-grid-padding, 5px))}}}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host*/.sc-wl-grid-h{margin-left:unset;margin-right:unset;-webkit-margin-start:auto;margin-inline-start:auto;-webkit-margin-end:auto;margin-inline-end:auto}}/*!@:host(.grid-fixed)*/.grid-fixed.sc-wl-grid-h{width:var(--wl-grid-width-xs, var(--wl-grid-width, 100%));max-width:100%}@media (min-width: 576px){/*!@:host(.grid-fixed)*/.grid-fixed.sc-wl-grid-h{width:var(--wl-grid-width-sm, var(--wl-grid-width, 540px))}}@media (min-width: 768px){/*!@:host(.grid-fixed)*/.grid-fixed.sc-wl-grid-h{width:var(--wl-grid-width-md, var(--wl-grid-width, 720px))}}@media (min-width: 992px){/*!@:host(.grid-fixed)*/.grid-fixed.sc-wl-grid-h{width:var(--wl-grid-width-lg, var(--wl-grid-width, 960px))}}@media (min-width: 1200px){/*!@:host(.grid-fixed)*/.grid-fixed.sc-wl-grid-h{width:var(--wl-grid-width-xl, var(--wl-grid-width, 1140px))}}/*!@:host(.wl-no-padding)*/.wl-no-padding.sc-wl-grid-h{--wl-grid-column-padding:0;--wl-grid-column-padding-xs:0;--wl-grid-column-padding-sm:0;--wl-grid-column-padding-md:0;--wl-grid-column-padding-lg:0;--wl-grid-column-padding-xl:0}";

class WlGrid {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.justify = "between";
    this.align = "stretch";
    ////wl-align-items-${AlignmentModifier}
    //`wl-justify-content-${JustificationModifier}`
    /**
     * If `true`, the grid will have a fixed width based on the screen size.
     */
    this.fixed = false;
  }
  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;
    return (hAsync(Host, { class: {
        "grid-fixed": this.fixed,
        [justify]: true,
        [align]: true,
        [alignItems]: true,
      } }, hAsync("slot", null)));
  }
  static get style() { return wlGridCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-grid",
    "$members$": {
      "justify": [513],
      "align": [513],
      "fixed": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["justify", "justify"], ["align", "align"]]
  }; }
}

const inputCss = ".sc-wl-input-h{--placeholder-color:initial;--placeholder-font-style:initial;--placeholder-font-weight:initial;--placeholder-opacity:0.5;--padding-top:0;--padding-end:0;--padding-bottom:0;--padding-start:0;--background:transparent;--color:initial;display:flex;position:relative;flex:1;align-items:center;padding:0 !important;background:var(--background);color:var(--color);font-family:var(--wl-font-family, inherit);z-index:2}wl-item.sc-wl-input-h:not(.item-label),wl-item:not(.item-label) .sc-wl-input-h{--padding-start:0}.wl-color.sc-wl-input-h{color:var(--wl-color-base);border-bottom:1px solid var(--wl-color-base)}.native-input.sc-wl-input{border-radius:var(--border-radius);padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:inline-block;flex:1;max-width:100%;max-height:100%;border:1px;outline:none;background:transparent;box-sizing:border-box;appearance:none}[dir].sc-wl-input .native-input.sc-wl-input{border-radius:var(--border-radius)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.native-input.sc-wl-input{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.native-input.sc-wl-input::placeholder{color:var(--placeholder-color);font-family:inherit;font-style:var(--placeholder-font-style);font-weight:var(--placeholder-font-weight);opacity:var(--placeholder-opacity)}.native-input.sc-wl-input:-webkit-autofill{background-color:transparent}.native-input.sc-wl-input:invalid{box-shadow:none}.native-input.sc-wl-input::-ms-clear{display:none}.native-input[disabled].sc-wl-input{opacity:0.4}.cloned-input.sc-wl-input{left:0;top:0;position:absolute;pointer-events:none}[dir=rtl].sc-wl-input .cloned-input.sc-wl-input,[dir=rtl].sc-wl-input-h .cloned-input.sc-wl-input,[dir=rtl] .sc-wl-input-h .cloned-input.sc-wl-input{left:unset;right:unset;right:0}.input-clear-icon.sc-wl-input{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;background-position:center;border:1px;outline:none;background-color:transparent;background-repeat:no-repeat;appearance:none}[dir].sc-wl-input .input-clear-icon.sc-wl-input{background-position:center}.has-focus.has-value.sc-wl-input-h .input-clear-icon.sc-wl-input{visibility:visible}.has-focus.sc-wl-input-h{pointer-events:none}.has-focus.sc-wl-input-h input.sc-wl-input,.has-focus.sc-wl-input-h a.sc-wl-input,.has-focus.sc-wl-input-h button.sc-wl-input{pointer-events:auto}.sc-wl-input-h{--padding-top:10px;--padding-end:0;--padding-bottom:10px;--padding-start:8px;font-size:inherit}.item-label-stacked.sc-wl-input-h,.item-label-stacked .sc-wl-input-h,.item-label-floating.sc-wl-input-h,.item-label-floating .sc-wl-input-h{--padding-top:8px;--padding-bottom:8px;--padding-start:0}.input-clear-icon.sc-wl-input{background-image:url(\"data:image/svg+xml;charset=utf-8,<svg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'><polygon%20fill='var(--wl-color-step-600,%20%23666666)'%20points='405,136.798%20375.202,107%20256,226.202%20136.798,107%20107,136.798%20226.202,256%20107,375.202%20136.798,405%20256,285.798%20375.202,405%20405,375.202%20285.798,256'/></svg>\");width:30px;height:30px;background-size:22px}[dir].sc-wl-input .input-clear-icon.sc-wl-input{background-image:url(\"data:image/svg+xml;charset=utf-8,<svg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20512%20512'><polygon%20fill='var(--wl-color-step-600,%20%23666666)'%20points='405,136.798%20375.202,107%20256,226.202%20136.798,107%20107,136.798%20226.202,256%20107,375.202%20136.798,405%20256,285.798%20375.202,405%20405,375.202%20285.798,256'/></svg>\")}.sc-wl-input-h{width:fit-content;flex:0;border-bottom:1px solid rgba(0, 0, 0, 0.9)}";

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
class WlInput {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlInput = createEvent(this, "wlInput", 7);
    this.wlChange = createEvent(this, "wlChange", 7);
    this.wlBlur = createEvent(this, "wlBlur", 7);
    this.wlFocus = createEvent(this, "wlFocus", 7);
    this.wlStyle = createEvent(this, "wlStyle", 7);
    this.inputId = `wl-input-${inputIds++}`;
    this.didBlurAfterEdit = false;
    this.hasFocus = false;
    /**
     * Indicates whether and how the text value should be automatically capitalized as it is entered/edited by the user.
     */
    this.autocapitalize = "off";
    /**
     * Indicates whether the value of the control can be automatically completed by the browser.
     */
    this.autocomplete = "off";
    /**
     * Whether auto correction should be enabled when the user is entering/editing the text value.
     */
    this.autocorrect = "off";
    /**
     * This Boolean attribute lets you specify that a form control should have input focus when the page loads.
     */
    this.autofocus = false;
    /**
     * If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input.
     */
    this.clearInput = false;
    /**
     * Set the amount of time, in milliseconds, to wait to trigger the `wlChange` event after each keystroke.
     */
    this.debounce = 0;
    /**
     * If `true`, the user cannot interact with the input.
     */
    this.disabled = false;
    /**
     * The name of the control, which is submitted with the form data.
     */
    this.name = this.inputId;
    /**
     * If `true`, the user cannot modify the value.
     */
    this.readonly = false;
    /**
     * If `true`, the user must fill in a value before submitting a form.
     */
    this.required = false;
    /**
     * If `true`, the element will have its spelling and grammar checked.
     */
    this.spellcheck = false;
    /**
     * The type of control to display. The default type is text.
     */
    this.type = "text";
    /**
     * The value of the input.
     */
    this.value = "";
    this.onInput = (ev) => {
      const input = ev.target;
      if (input) {
        this.value = input.value || "";
      }
      this.wlInput.emit(ev);
    };
    this.onBlur = () => {
      this.hasFocus = false;
      this.focusChanged();
      this.emitStyle();
      this.wlBlur.emit();
    };
    this.onFocus = () => {
      this.hasFocus = true;
      this.focusChanged();
      this.emitStyle();
      this.wlFocus.emit();
    };
    this.onKeydown = (ev) => {
      if (this.shouldClearOnEdit()) {
        // Did the input value change after it was blurred and edited?
        // Do not clear if user is hitting Enter to submit form
        if (this.didBlurAfterEdit && this.hasValue() && ev.key !== "Enter") {
          // Clear the input
          this.clearTextInput();
        }
        // Reset the flag
        this.didBlurAfterEdit = false;
      }
    };
    this.clearTextInput = (ev) => {
      if (this.clearInput && !this.readonly && !this.disabled && ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      this.value = "";
      /**
       * This is needed for clearOnEdit
       * Otherwise the value will not be cleared
       * if user is inside the input
       */
      if (this.nativeInput) {
        this.nativeInput.value = "";
      }
    };
  }
  debounceChanged() {
    this.wlChange = debounceEvent(this.wlChange, this.debounce);
  }
  disabledChanged() {
    this.emitStyle();
  }
  /**
   * Update the native input element when the value changes
   */
  valueChanged() {
    this.emitStyle();
    this.wlChange.emit({
      value: this.value == null ? this.value : this.value.toString(),
    });
  }
  connectedCallback() {
    this.emitStyle();
    this.debounceChanged();
  }
  disconnectedCallback() {
  }
  /**
   * Sets focus on the specified `wl-input`. Use this method instead of the global
   * `input.focus()`.
   */
  async setFocus() {
    if (this.nativeInput) {
      this.nativeInput.focus();
    }
  }
  /**
   * Returns the native `<input>` element used under the hood.
   */
  getInputElement() {
    return Promise.resolve(this.nativeInput);
  }
  shouldClearOnEdit() {
    const { type, clearOnEdit } = this;
    return clearOnEdit === undefined ? type === "password" : clearOnEdit;
  }
  getValue() {
    return typeof this.value === "number"
      ? this.value.toString()
      : (this.value || "").toString();
  }
  emitStyle() {
    this.wlStyle.emit({
      interactive: true,
      input: true,
      "has-placeholder": this.placeholder != null,
      "has-value": this.hasValue(),
      "has-focus": this.hasFocus,
      "interactive-disabled": this.disabled,
    });
  }
  focusChanged() {
    // If clearOnEdit is enabled and the input blurred but has a value, set a flag
    if (!this.hasFocus && this.shouldClearOnEdit() && this.hasValue()) {
      this.didBlurAfterEdit = true;
    }
  }
  hasValue() {
    return this.getValue().length > 0;
  }
  render() {
    const value = this.getValue();
    const labelId = this.inputId + "-lbl";
    const label = findItemLabel(this.el);
    const mode = getWlMode(this);
    if (label) {
      label.id = labelId;
    }
    return (hAsync(Host, { "aria-disabled": this.disabled ? "true" : null, class: Object.assign(Object.assign({}, createColorClasses(this.color)), { [mode]: true, "has-value": this.hasValue(), "has-focus": this.hasFocus }) }, hAsync("input", { class: "native-input", ref: (input) => (this.nativeInput = input), "aria-labelledby": labelId, disabled: this.disabled, accept: this.accept, autoCapitalize: this.autocapitalize, autoComplete: this.autocomplete, autoCorrect: this.autocorrect, autoFocus: this.autofocus, enterKeyHint: this.enterkeyhint, inputMode: this.inputmode, min: this.min, max: this.max, minLength: this.minlength, maxLength: this.maxlength, multiple: this.multiple, name: this.name, pattern: this.pattern, placeholder: this.placeholder || "", readOnly: this.readonly, required: this.required, spellcheck: this.spellcheck, step: this.step, size: this.size, type: this.type, value: value, onInput: this.onInput, onBlur: this.onBlur, onFocus: this.onFocus, onKeyDown: this.onKeydown, style: {
        // borderBottom: "1px solid black",
        width: "auto",
        flex: "0",
      } }), this.clearInput && !this.readonly && !this.disabled && (hAsync("button", { type: "button", class: "input-clear-icon", tabindex: "-1", onTouchStart: this.clearTextInput, onMouseDown: this.clearTextInput }))));
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "debounce": ["debounceChanged"],
    "disabled": ["disabledChanged"],
    "value": ["valueChanged"]
  }; }
  static get style() { return inputCss; }
  static get cmpMeta() { return {
    "$flags$": 2,
    "$tagName$": "wl-input",
    "$members$": {
      "color": [1],
      "accept": [1],
      "autocapitalize": [1],
      "autocomplete": [1],
      "autocorrect": [1],
      "autofocus": [4],
      "clearInput": [4, "clear-input"],
      "clearOnEdit": [4, "clear-on-edit"],
      "debounce": [2],
      "disabled": [4],
      "inputmode": [1],
      "enterkeyhint": [1],
      "max": [1],
      "maxlength": [2],
      "min": [1],
      "minlength": [2],
      "multiple": [4],
      "name": [1],
      "pattern": [1],
      "placeholder": [1],
      "readonly": [4],
      "required": [4],
      "spellcheck": [4],
      "step": [1],
      "size": [2],
      "type": [1],
      "value": [1032],
      "hasFocus": [32],
      "setFocus": [64],
      "getInputElement": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}
let inputIds = 0;

const itemStylesCss = "/*!@:host*/.sc-wl-item-h{--border-radius:0px;--border-width:0px;--border-style:solid;--padding-top:0px;--padding-bottom:0px;--padding-end:0px;--padding-start:0px;--inner-border-width:0px;--inner-padding-top:0px;--inner-padding-bottom:0px;--inner-padding-start:0px;--inner-padding-end:0px;--inner-box-shadow:none;--show-full-highlight:0;--show-inset-highlight:0;--detail-icon-color:initial;--detail-icon-font-size:20px;--detail-icon-opacity:0.25;--color-activated:var(--color);--color-focused:var(--color);--color-hover:var(--color);--ripple-color:current-color;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;display:block;position:relative;outline:none;color:var(--color);font-family:var(--wl-font-family, inherit);text-align:initial;text-decoration:none;box-sizing:border-box;overflow:hidden}/*!@:host(.wl-color) .item-native*/.wl-color.sc-wl-item-h .item-native.sc-wl-item{background:var(--wl-color-base);color:var(--wl-color-contrast)}/*!@:host(.wl-color) .item-native,\n:host(.wl-color) .item-inner*/.wl-color.sc-wl-item-h .item-native.sc-wl-item,.wl-color.sc-wl-item-h .item-inner.sc-wl-item{border-color:var(--wl-color-shade)}/*!@:host(.wl-activated) .item-native*/.wl-activated.sc-wl-item-h .item-native.sc-wl-item{color:var(--color-activated)}/*!@:host(.wl-activated) .item-native::after*/.wl-activated.sc-wl-item-h .item-native.sc-wl-item::after{background:var(--background-activated);opacity:var(--background-activated-opacity)}/*!@:host(.wl-color.wl-activated) .item-native*/.wl-color.wl-activated.sc-wl-item-h .item-native.sc-wl-item{color:var(--wl-color-contrast)}/*!@:host(.wl-focused) .item-native*/.wl-focused.sc-wl-item-h .item-native.sc-wl-item{color:var(--color-focused)}/*!@:host(.wl-focused) .item-native::after*/.wl-focused.sc-wl-item-h .item-native.sc-wl-item::after{background:var(--background-focused);opacity:var(--background-focused-opacity)}/*!@:host(.wl-color.wl-focused) .item-native*/.wl-color.wl-focused.sc-wl-item-h .item-native.sc-wl-item{color:var(--wl-color-contrast)}/*!@:host(.wl-color.wl-focused) .item-native::after*/.wl-color.wl-focused.sc-wl-item-h .item-native.sc-wl-item::after{background:var(--wl-color-contrast)}@media (any-hover: hover){/*!@:host(.wl-activatable:hover) .item-native*/.wl-activatable.sc-wl-item-h:hover .item-native.sc-wl-item{color:var(--color-hover)}/*!@:host(.wl-activatable:hover) .item-native::after*/.wl-activatable.sc-wl-item-h:hover .item-native.sc-wl-item::after{background:var(--background-hover);opacity:var(--background-hover-opacity)}/*!@:host(.wl-color.wl-activatable:hover) .item-native*/.wl-color.wl-activatable.sc-wl-item-h:hover .item-native.sc-wl-item{color:var(--wl-color-contrast)}/*!@:host(.wl-color.wl-activatable:hover) .item-native::after*/.wl-color.wl-activatable.sc-wl-item-h:hover .item-native.sc-wl-item::after{background:var(--wl-color-contrast)}}/*!@:host(.item-interactive-disabled:not(.item-multiple-inputs))*/.item-interactive-disabled.sc-wl-item-h:not(.item-multiple-inputs){cursor:default;pointer-events:none}/*!@:host(.item-disabled)*/.item-disabled.sc-wl-item-h{cursor:default;opacity:0.3;pointer-events:none}/*!@.item-native*/.item-native.sc-wl-item{border-radius:var(--border-radius);margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:calc(var(--padding-start) + var(--wl-safe-area-left, 0px));padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:flex;position:relative;align-items:center;justify-content:space-between;width:100%;min-height:var(--min-height);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);overflow:inherit;box-sizing:border-box;z-index:1}/*!@[dir] .item-native*/[dir].sc-wl-item .item-native.sc-wl-item{border-radius:var(--border-radius)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.item-native*/.item-native.sc-wl-item{padding-left:unset;padding-right:unset;-webkit-padding-start:calc(var(--padding-start) + var(--wl-safe-area-left, 0px));padding-inline-start:calc(var(--padding-start) + var(--wl-safe-area-left, 0px));-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}/*!@.item-native::-moz-focus-inner*/.item-native.sc-wl-item::-moz-focus-inner{border:0}/*!@.item-native::after*/.item-native.sc-wl-item::after{left:0;right:0;top:0;bottom:0;position:absolute;content:\"\";opacity:0;transition:var(--transition);z-index:-1}/*!@[dir] .item-native::after*/[dir].sc-wl-item .item-native.sc-wl-item::after{left:0;right:0}/*!@button,\na*/button.sc-wl-item,a.sc-wl-item{cursor:pointer;user-select:none;-webkit-user-drag:none}/*!@.item-inner*/.item-inner.sc-wl-item{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--inner-padding-start);padding-right:calc(var(--wl-safe-area-right, 0px) + var(--inner-padding-end));padding-top:var(--inner-padding-top);padding-bottom:var(--inner-padding-bottom);display:flex;position:relative;flex:1;flex-direction:inherit;align-items:inherit;align-self:stretch;min-height:inherit;border-width:var(--inner-border-width);border-style:var(--border-style);border-color:var(--border-color);box-shadow:var(--inner-box-shadow);overflow:inherit;box-sizing:border-box}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.item-inner*/.item-inner.sc-wl-item{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--inner-padding-start);padding-inline-start:var(--inner-padding-start);-webkit-padding-end:calc(var(--wl-safe-area-right, 0px) + var(--inner-padding-end));padding-inline-end:calc(var(--wl-safe-area-right, 0px) + var(--inner-padding-end))}}/*!@.item-detail-icon*/.item-detail-icon.sc-wl-item{color:var(--detail-icon-color);font-size:var(--detail-icon-font-size);opacity:var(--detail-icon-opacity)}/*!@::slotted(wl-icon)*/.sc-wl-item-s>wl-icon{font-size:1.6em}/*!@::slotted(wl-button)*/.sc-wl-item-s>wl-button{--margin-top:0;--margin-bottom:0;--margin-start:0;--margin-end:0;z-index:1}/*!@::slotted(wl-label)*/.sc-wl-item-s>wl-label{flex:1}/*!@:host([vertical-align-top]),\n:host(.item-input)*/[vertical-align-top].sc-wl-item-h,.item-input.sc-wl-item-h{align-items:flex-start}/*!@.input-wrapper*/.input-wrapper.sc-wl-item{display:flex;flex:1;flex-direction:inherit;align-items:inherit;align-self:stretch;text-overflow:ellipsis;overflow:hidden;box-sizing:border-box;justify-content:center}/*!@:host(.item-label-stacked) .item-native,\n:host(.item-label-floating) .item-native*/.item-label-stacked.sc-wl-item-h .item-native.sc-wl-item,.item-label-floating.sc-wl-item-h .item-native.sc-wl-item{align-items:start}/*!@:host(.item-label-stacked) .input-wrapper,\n:host(.item-label-floating) .input-wrapper*/.item-label-stacked.sc-wl-item-h .input-wrapper.sc-wl-item,.item-label-floating.sc-wl-item-h .input-wrapper.sc-wl-item{flex:1;flex-direction:column}/*!@.item-highlight,\n.item-inner-highlight*/.item-highlight.sc-wl-item,.item-inner-highlight.sc-wl-item{left:0;right:0;bottom:0;position:absolute;background:var(--highlight-background);z-index:1}/*!@[dir] .item-highlight, [dir] .item-inner-highlight*/[dir].sc-wl-item .item-highlight.sc-wl-item,[dir].sc-wl-item .item-inner-highlight.sc-wl-item{left:0;right:0}/*!@.item-highlight*/.item-highlight.sc-wl-item{height:var(--full-highlight-height)}/*!@.item-inner-highlight*/.item-inner-highlight.sc-wl-item{height:var(--inset-highlight-height)}/*!@:host(.item-interactive.item-has-focus),\n:host(.item-interactive.wl-touched.wl-invalid)*/.item-interactive.item-has-focus.sc-wl-item-h,.item-interactive.wl-touched.wl-invalid.sc-wl-item-h{--full-highlight-height:calc(\n  var(--highlight-height) * var(--show-full-highlight));--inset-highlight-height:calc(\n   var(--highlight-height) * var(--show-inset-highlight))}/*!@:host(.item-interactive.item-has-focus)*/.item-interactive.item-has-focus.sc-wl-item-h{--highlight-background:var(--highlight-color-focused)}/*!@:host(.item-interactive.wl-valid)*/.item-interactive.wl-valid.sc-wl-item-h{--highlight-background:var(--highlight-color-valid)}/*!@:host(.item-interactive.wl-invalid)*/.item-interactive.wl-invalid.sc-wl-item-h{--highlight-background:var(--highlight-color-invalid)}/*!@:host(.item-label-stacked) ::slotted(wl-select),\n:host(.item-label-floating) ::slotted(wl-select)*/.sc-wl-item-h.item-label-stacked .sc-wl-item-s>wl-select,.sc-wl-item-h.item-label-floating .sc-wl-item-s>wl-select{--padding-start:0;align-self:stretch;width:100%;max-width:100%}/*!@:host(.item-label-stacked) ::slotted(wl-datetime),\n:host(.item-label-floating) ::slotted(wl-datetime)*/.sc-wl-item-h.item-label-stacked .sc-wl-item-s>wl-datetime,.sc-wl-item-h.item-label-floating .sc-wl-item-s>wl-datetime{--padding-start:0;width:100%}/*!@:host(.item-multiple-inputs) ::slotted(wl-checkbox),\n:host(.item-multiple-inputs) ::slotted(wl-datetime),\n:host(.item-multiple-inputs) ::slotted(wl-radio),\n:host(.item-multiple-inputs) ::slotted(wl-select)*/.sc-wl-item-h.item-multiple-inputs .sc-wl-item-s>wl-checkbox,.sc-wl-item-h.item-multiple-inputs .sc-wl-item-s>wl-datetime,.sc-wl-item-h.item-multiple-inputs .sc-wl-item-s>wl-radio,.sc-wl-item-h.item-multiple-inputs .sc-wl-item-s>wl-select{position:relative}/*!@:host(.item-textarea)*/.item-textarea.sc-wl-item-h{align-items:stretch}/*!@::slotted(wl-reorder[slot])*/.sc-wl-item-s>wl-reorder[slot]{margin-top:0;margin-bottom:0}/*!@wl-ripple-effect*/wl-ripple-effect.sc-wl-item{color:var(--ripple-color)}/*!@:host*/.sc-wl-item-h{--min-height:48px;--background:var(--wl-item-background, var(--wl-background-color, #fff));--background-activated:transparent;--background-focused:current-color;--background-hover:current-color;--background-activated-opacity:0;--background-focused-opacity:0.12;--background-hover-opacity:0.04;--border-color:var(--wl-item-border-color, var(--wl-border-color, var(--wl-color-step-150, rgba(0, 0, 0, 0.835), rgba(0, 0, 0, 0.835)), rgba(0, 0, 0, 0.835)));--color:var(--wl-item-color, var(--wl-text-color, #000));--transition:opacity 15ms linear, background-color 15ms linear;--padding-start:16px;--color:var(--wl-item-color, var(--wl-text-color, #000));--border-color:var(--wl-item-border-color, var(--wl-border-color, var(--wl-color-step-150, rgba(0, 0, 0, 0.835), rgba(0, 0, 0, 0.835)), rgba(0, 0, 0, 0.835)));--inner-padding-end:16px;--inner-border-width:0 0 1px 0;--highlight-height:2px;--highlight-color-focused:var(--wl-color-primary, #3880ff);--highlight-color-valid:var(--wl-color-success, #2dd36f);--highlight-color-invalid:var(--wl-color-danger, #eb445a);font-size:16px;font-weight:normal;text-transform:none}/*!@:host(.wl-color.wl-activated) .item-native::after*/.wl-color.wl-activated.sc-wl-item-h .item-native.sc-wl-item::after{background:transparent}/*!@:host(.item-interactive)*/.item-interactive.sc-wl-item-h{--border-width:0 0 1px 0;--inner-border-width:0;--show-full-highlight:1;--show-inset-highlight:0}/*!@:host(.item-lines-full)*/.item-lines-full.sc-wl-item-h{--border-width:0 0 1px 0;--show-full-highlight:1;--show-inset-highlight:0}/*!@:host(.item-lines-inset)*/.item-lines-inset.sc-wl-item-h{--inner-border-width:0 0 1px 0;--show-full-highlight:0;--show-inset-highlight:1}/*!@:host(.item-lines-inset),\n:host(.item-lines-none)*/.item-lines-inset.sc-wl-item-h,.item-lines-none.sc-wl-item-h{--border-width:0;--show-full-highlight:0}/*!@:host(.item-lines-full),\n:host(.item-lines-none)*/.item-lines-full.sc-wl-item-h,.item-lines-none.sc-wl-item-h{--inner-border-width:0;--show-inset-highlight:0}/*!@:host(.item-multi-line) ::slotted([slot=start]),\n:host(.item-multi-line) ::slotted([slot=end])*/.sc-wl-item-h.item-multi-line .sc-wl-item-s>[slot=start],.sc-wl-item-h.item-multi-line .sc-wl-item-s>[slot=end]{margin-top:16px;margin-bottom:16px;align-self:flex-start}/*!@::slotted([slot=start])*/.sc-wl-item-s>[slot=start]{margin-right:32px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=start])*/.sc-wl-item-s>[slot=start]{margin-right:unset;-webkit-margin-end:32px;margin-inline-end:32px}}/*!@::slotted([slot=end])*/.sc-wl-item-s>[slot=end]{margin-left:32px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted([slot=end])*/.sc-wl-item-s>[slot=end]{margin-left:unset;-webkit-margin-start:32px;margin-inline-start:32px}}/*!@::slotted(wl-icon)*/.sc-wl-item-s>wl-icon{color:rgba(var(--wl-text-color-rgb, 0, 0, 0), 0.54);font-size:24px}/*!@:host(.wl-color) ::slotted(wl-icon)*/.sc-wl-item-h.wl-color .sc-wl-item-s>wl-icon{color:var(--wl-color-contrast)}/*!@::slotted(wl-icon[slot])*/.sc-wl-item-s>wl-icon[slot]{margin-top:12px;margin-bottom:12px}/*!@::slotted(wl-icon[slot=start])*/.sc-wl-item-s>wl-icon[slot=start]{margin-right:32px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-icon[slot=start])*/.sc-wl-item-s>wl-icon[slot=start]{margin-right:unset;-webkit-margin-end:32px;margin-inline-end:32px}}/*!@::slotted(wl-icon[slot=end])*/.sc-wl-item-s>wl-icon[slot=end]{margin-left:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-icon[slot=end])*/.sc-wl-item-s>wl-icon[slot=end]{margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}/*!@::slotted(wl-toggle[slot=start]),\n::slotted(wl-toggle[slot=end])*/.sc-wl-item-s>wl-toggle[slot=start],.sc-wl-item-s>wl-toggle[slot=end]{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}/*!@::slotted(wl-note)*/.sc-wl-item-s>wl-note{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;align-self:flex-start;font-size:11px}/*!@::slotted(wl-note[slot])*/.sc-wl-item-s>wl-note[slot]{padding-left:0;padding-right:0;padding-top:18px;padding-bottom:10px}/*!@::slotted(wl-note[slot=start])*/.sc-wl-item-s>wl-note[slot=start]{padding-right:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-note[slot=start])*/.sc-wl-item-s>wl-note[slot=start]{padding-right:unset;-webkit-padding-end:16px;padding-inline-end:16px}}/*!@::slotted(wl-note[slot=end])*/.sc-wl-item-s>wl-note[slot=end]{padding-left:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-note[slot=end])*/.sc-wl-item-s>wl-note[slot=end]{padding-left:unset;-webkit-padding-start:16px;padding-inline-start:16px}}/*!@::slotted(wl-avatar)*/.sc-wl-item-s>wl-avatar{width:40px;height:40px}/*!@::slotted(wl-thumbnail)*/.sc-wl-item-s>wl-thumbnail{width:56px;height:56px}/*!@::slotted(wl-avatar),\n::slotted(wl-thumbnail)*/.sc-wl-item-s>wl-avatar,.sc-wl-item-s>wl-thumbnail{margin-top:8px;margin-bottom:8px}/*!@::slotted(wl-avatar[slot=start]),\n::slotted(wl-thumbnail[slot=start])*/.sc-wl-item-s>wl-avatar[slot=start],.sc-wl-item-s>wl-thumbnail[slot=start]{margin-right:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-avatar[slot=start]),\n::slotted(wl-thumbnail[slot=start])*/.sc-wl-item-s>wl-avatar[slot=start],.sc-wl-item-s>wl-thumbnail[slot=start]{margin-right:unset;-webkit-margin-end:16px;margin-inline-end:16px}}/*!@::slotted(wl-avatar[slot=end]),\n::slotted(wl-thumbnail[slot=end])*/.sc-wl-item-s>wl-avatar[slot=end],.sc-wl-item-s>wl-thumbnail[slot=end]{margin-left:16px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@::slotted(wl-avatar[slot=end]),\n::slotted(wl-thumbnail[slot=end])*/.sc-wl-item-s>wl-avatar[slot=end],.sc-wl-item-s>wl-thumbnail[slot=end]{margin-left:unset;-webkit-margin-start:16px;margin-inline-start:16px}}/*!@::slotted(wl-label)*/.sc-wl-item-s>wl-label{margin-left:0;margin-right:0;margin-top:11px;margin-bottom:10px}/*!@:host(.item-label-stacked) ::slotted([slot=end]),\n:host(.item-label-floating) ::slotted([slot=end])*/.sc-wl-item-h.item-label-stacked .sc-wl-item-s>[slot=end],.sc-wl-item-h.item-label-floating .sc-wl-item-s>[slot=end]{margin-top:7px;margin-bottom:7px}/*!@:host(.item-toggle) ::slotted(wl-label),\n:host(.item-radio) ::slotted(wl-label)*/.sc-wl-item-h.item-toggle .sc-wl-item-s>wl-label,.sc-wl-item-h.item-radio .sc-wl-item-s>wl-label{margin-left:0}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@:host(.item-toggle) ::slotted(wl-label),\n:host(.item-radio) ::slotted(wl-label)*/.sc-wl-item-h.item-toggle .sc-wl-item-s>wl-label,.sc-wl-item-h.item-radio .sc-wl-item-s>wl-label{margin-left:unset;-webkit-margin-start:0;margin-inline-start:0}}/*!@::slotted(.button-small)*/.sc-wl-item-s>.button-small{--padding-top:0;--padding-bottom:0;--padding-start:0.6em;--padding-end:0.6em;height:25px;font-size:12px}/*!@:host(.item-label-floating),\n:host(.item-label-stacked)*/.item-label-floating.sc-wl-item-h,.item-label-stacked.sc-wl-item-h{--min-height:55px}/*!@:host(.item-label-stacked) ::slotted(wl-select),\n:host(.item-label-floating) ::slotted(wl-select)*/.sc-wl-item-h.item-label-stacked .sc-wl-item-s>wl-select,.sc-wl-item-h.item-label-floating .sc-wl-item-s>wl-select{--padding-top:8px;--padding-bottom:8px;--padding-start:0}/*!@:host(.item-has-focus:not(.wl-color)) ::slotted(.label-stacked),\n:host(.item-has-focus:not(.wl-color)) ::slotted(.label-floating)*/.sc-wl-item-h.item-has-focus:not(.wl-color) .sc-wl-item-s>.label-stacked,.sc-wl-item-h.item-has-focus:not(.wl-color) .sc-wl-item-s>.label-floating{color:var(--wl-color-primary, #3880ff)}";

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed between the named slots if provided without a slot.
 * @slot start - Content is placed to the left of the item text in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the item text in LTR, and to the left in RTL.
 */
class WlItem {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.itemStyles = new Map();
    this.multipleInputs = false;
    /**
     * If `true`, a button tag will be rendered and the item will be tappable.
     */
    this.button = false;
    /**
     * If `true`, the user cannot interact with the item.
     */
    this.disabled = false;
    /**
     * How the bottom border should be displayed on the item.
     */
    this.lines = 'none';
    /**
     * The type of the button. Only used when an `onclick` or `button` property is present.
     */
    this.type = "button";
  }
  itemStyle(ev) {
    ev.stopPropagation();
    const tagName = ev.target.tagName;
    const updatedStyles = ev.detail;
    const newStyles = {};
    const childStyles = this.itemStyles.get(tagName) || {};
    let hasStyleChange = false;
    Object.keys(updatedStyles).forEach((key) => {
      if (updatedStyles[key]) {
        const itemKey = `item-${key}`;
        if (!childStyles[itemKey]) {
          hasStyleChange = true;
        }
        newStyles[itemKey] = true;
      }
    });
    if (!hasStyleChange &&
      Object.keys(newStyles).length !== Object.keys(childStyles).length) {
      hasStyleChange = true;
    }
    if (hasStyleChange) {
      this.itemStyles.set(tagName, newStyles);
      forceUpdate(this);
    }
  }
  componentDidLoad() {
    // The following elements can accept focus alongside the previous elements
    // therefore if these elements are also a child of item, we don't want the
    // input cover on top of those interfering with their clicks
    const inputs = this.el.querySelectorAll("wl-input");
    // The following elements should also stay clickable when an input with cover is present
    const clickables = this.el.querySelectorAll("wl-list, wl-button, a, button");
    // Check for multiple inputs to change the position of the input cover to relative
    // for all of the covered inputs above
    this.multipleInputs =
      inputs.length > 1 || (clickables.length > 1 && this.isClickable());
  }
  // If the item has an href or button property it will render a native
  // anchor or button that is clickable
  isClickable() {
    return this.href !== undefined || this.button;
  }
  canActivate() {
    return this.isClickable();
  }
  render() {
    const { download, lines, disabled, href, rel, target } = this;
    const childStyles = {};
    const clickable = this.isClickable();
    const canActivate = this.canActivate();
    const TagType = clickable
      ? href === undefined
        ? "button"
        : "a"
      : "div";
    const attrs = TagType === "button"
      ? { type: this.type }
      : {
        download,
        href,
        rel,
        target,
      };
    this.itemStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });
    const mode = getWlMode(this);
    return (hAsync(Host, { "aria-disabled": disabled ? "true" : null, class: Object.assign(Object.assign(Object.assign({}, childStyles), createColorClasses(this.color)), { item: true, [mode]: true, [`item-lines-${lines}`]: lines !== undefined, "item-disabled": disabled, "in-drawer": hostContext("wl-drawer", this.el), "item-multiple-inputs": this.multipleInputs, "wl-activatable": canActivate, "wl-focusable": true }) }, hAsync(TagType, Object.assign({}, attrs, { class: "item-native", disabled: disabled }), hAsync("slot", { name: "start" }), hAsync("div", { class: "item-inner" }, hAsync("div", { class: "input-wrapper" }, hAsync("slot", null)), hAsync("slot", { name: "end" }), hAsync("div", { class: "item-inner-highlight" }))), hAsync("div", { class: "item-highlight" })));
  }
  get el() { return getElement(this); }
  static get style() { return itemStylesCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-item",
    "$members$": {
      "color": [513],
      "button": [4],
      "disabled": [4],
      "download": [1],
      "href": [1],
      "rel": [1],
      "lines": [1],
      "target": [1],
      "type": [1],
      "multipleInputs": [32]
    },
    "$listeners$": [[0, "wlStyle", "itemStyle"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"]]
  }; }
}

const labelIosCss = ".item.sc-wl-label-ios-h,.item .sc-wl-label-ios-h{--color:initial;display:block;color:var(--color);font-family:var(--wl-font-family, inherit);font-size:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;box-sizing:border-box}.wl-color.sc-wl-label-ios-h{color:var(--wl-color-base)}.wl-text-wrap.sc-wl-label-ios-h,[text-wrap].sc-wl-label-ios-h{white-space:normal}.item-interactive-disabled.sc-wl-label-ios-h:not(.item-multiple-inputs),.item-interactive-disabled:not(.item-multiple-inputs) .sc-wl-label-ios-h{cursor:default;opacity:0.3;pointer-events:none}.item-input.sc-wl-label-ios-h,.item-input .sc-wl-label-ios-h{flex:initial;max-width:200px;pointer-events:none}.item-textarea.sc-wl-label-ios-h,.item-textarea .sc-wl-label-ios-h{align-self:baseline}.label-fixed.sc-wl-label-ios-h{flex:0 0 100px;width:100px;min-width:100px;max-width:200px}*.sc-wl-label-ios-h{visibility:visible}.label-stacked.sc-wl-label-ios-h,.label-floating.sc-wl-label-ios-h{margin-bottom:0;align-self:stretch;width:auto;max-width:100%}.label-no-animate.label-floating.sc-wl-label-ios-h{transition:none}.sc-wl-label-ios-s h1,.sc-wl-label-ios-s h2,.sc-wl-label-ios-s h3,.sc-wl-label-ios-s h4,.sc-wl-label-ios-s h5,.sc-wl-label-ios-s h6{text-overflow:inherit;overflow:inherit}.wl-text-wrap.sc-wl-label-ios-h,[text-wrap].sc-wl-label-ios-h{font-size:14px;line-height:1.5}.label-stacked.sc-wl-label-ios-h{margin-bottom:4px;font-size:14px}.label-floating.sc-wl-label-ios-h{margin-bottom:0;transform:translate3d(0,  27px,  0);transform-origin:left top;transition:transform 150ms ease-in-out}[dir] .label-floating.sc-wl-label-ios-h{transform:translate3d(0,  27px,  0)}[dir=rtl].sc-wl-label-ios-h -no-combinator.label-floating.sc-wl-label-ios-h,[dir=rtl] .sc-wl-label-ios-h -no-combinator.label-floating.sc-wl-label-ios-h,[dir=rtl].label-floating.sc-wl-label-ios-h,[dir=rtl] .label-floating.sc-wl-label-ios-h{transform-origin:right top}.item-has-focus.label-floating.sc-wl-label-ios-h,.item-has-focus .label-floating.sc-wl-label-ios-h,.item-has-placeholder.label-floating.sc-wl-label-ios-h,.item-has-placeholder .label-floating.sc-wl-label-ios-h,.item-has-value.label-floating.sc-wl-label-ios-h,.item-has-value .label-floating.sc-wl-label-ios-h{transform:translate3d(0,  0,  0) scale(0.82)}[dir] .item-has-focus.label-floating.sc-wl-label-ios-h,.item-has-focus .label-floating.sc-wl-label-ios-h,[dir] .item-has-placeholder.label-floating.sc-wl-label-ios-h,.item-has-placeholder .label-floating.sc-wl-label-ios-h,[dir] .item-has-value.label-floating.sc-wl-label-ios-h,.item-has-value .label-floating.sc-wl-label-ios-h{transform:translate3d(0,  0,  0) scale(0.82)}.sc-wl-label-ios-s h1{margin-left:0;margin-right:0;margin-top:3px;margin-bottom:2px;font-size:22px;font-weight:normal}.sc-wl-label-ios-s h2{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:17px;font-weight:normal}.sc-wl-label-ios-s h3,.sc-wl-label-ios-s h4,.sc-wl-label-ios-s h5,.sc-wl-label-ios-s h6{margin-left:0;margin-right:0;margin-top:0;margin-bottom:3px;font-size:14px;font-weight:normal;line-height:normal}.sc-wl-label-ios-s p{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:14px;line-height:normal;text-overflow:inherit;overflow:inherit}.sc-wl-label-ios-s>p{color:rgba(var(--wl-text-color-rgb, 0, 0, 0), 0.4)}.sc-wl-label-ios-h.wl-color.sc-wl-label-ios-s>p,.wl-color .sc-wl-label-ios-h.sc-wl-label-ios-s>p{color:inherit}.sc-wl-label-ios-s h2:last-child,.sc-wl-label-ios-s h3:last-child,.sc-wl-label-ios-s h4:last-child,.sc-wl-label-ios-s h5:last-child,.sc-wl-label-ios-s h6:last-child,.sc-wl-label-ios-s p:last-child{margin-bottom:0}";

const labelMdCss = ".item.sc-wl-label-md-h,.item .sc-wl-label-md-h{--color:initial;display:block;color:var(--color);font-family:var(--wl-font-family, inherit);font-size:inherit;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;box-sizing:border-box}.wl-color.sc-wl-label-md-h{color:var(--wl-color-base)}.wl-text-wrap.sc-wl-label-md-h,[text-wrap].sc-wl-label-md-h{white-space:normal}.item-interactive-disabled.sc-wl-label-md-h:not(.item-multiple-inputs),.item-interactive-disabled:not(.item-multiple-inputs) .sc-wl-label-md-h{cursor:default;opacity:0.3;pointer-events:none}.item-input.sc-wl-label-md-h,.item-input .sc-wl-label-md-h{flex:initial;max-width:200px;pointer-events:none}.item-textarea.sc-wl-label-md-h,.item-textarea .sc-wl-label-md-h{align-self:baseline}.label-fixed.sc-wl-label-md-h{flex:0 0 100px;width:100px;min-width:100px;max-width:200px}*.sc-wl-label-md-h{visibility:visible}.label-stacked.sc-wl-label-md-h,.label-floating.sc-wl-label-md-h{margin-bottom:0;align-self:stretch;width:auto;max-width:100%}.label-no-animate.label-floating.sc-wl-label-md-h{transition:none}.sc-wl-label-md-s h1,.sc-wl-label-md-s h2,.sc-wl-label-md-s h3,.sc-wl-label-md-s h4,.sc-wl-label-md-s h5,.sc-wl-label-md-s h6{text-overflow:inherit;overflow:inherit}.wl-text-wrap.sc-wl-label-md-h,[text-wrap].sc-wl-label-md-h{line-height:1.5}.label-stacked.sc-wl-label-md-h{transform-origin:left top;transform:translate3d(0,  50%,  0) scale(0.75);transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl].sc-wl-label-md-h -no-combinator.label-stacked.sc-wl-label-md-h,[dir=rtl] .sc-wl-label-md-h -no-combinator.label-stacked.sc-wl-label-md-h,[dir=rtl].label-stacked.sc-wl-label-md-h,[dir=rtl] .label-stacked.sc-wl-label-md-h{transform-origin:right top}[dir] .label-stacked.sc-wl-label-md-h{transform:translate3d(0,  50%,  0) scale(0.75)}.label-floating.sc-wl-label-md-h{transform:translate3d(0,  96%,  0);transform-origin:left top;transition:color 150ms cubic-bezier(0.4, 0, 0.2, 1), transform 150ms cubic-bezier(0.4, 0, 0.2, 1)}[dir] .label-floating.sc-wl-label-md-h{transform:translate3d(0,  96%,  0)}[dir=rtl].sc-wl-label-md-h -no-combinator.label-floating.sc-wl-label-md-h,[dir=rtl] .sc-wl-label-md-h -no-combinator.label-floating.sc-wl-label-md-h,[dir=rtl].label-floating.sc-wl-label-md-h,[dir=rtl] .label-floating.sc-wl-label-md-h{transform-origin:right top}.label-stacked.sc-wl-label-md-h,.label-floating.sc-wl-label-md-h{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}.item-select.label-floating.sc-wl-label-md-h,.item-select .label-floating.sc-wl-label-md-h{transform:translate3d(0,  130%,  0)}[dir] .item-select.label-floating.sc-wl-label-md-h,.item-select .label-floating.sc-wl-label-md-h{transform:translate3d(0,  130%,  0)}.item-has-focus.label-floating.sc-wl-label-md-h,.item-has-focus .label-floating.sc-wl-label-md-h,.item-has-placeholder.label-floating.sc-wl-label-md-h,.item-has-placeholder .label-floating.sc-wl-label-md-h,.item-has-value.label-floating.sc-wl-label-md-h,.item-has-value .label-floating.sc-wl-label-md-h{transform:translate3d(0,  50%,  0) scale(0.75)}[dir] .item-has-focus.label-floating.sc-wl-label-md-h,.item-has-focus .label-floating.sc-wl-label-md-h,[dir] .item-has-placeholder.label-floating.sc-wl-label-md-h,.item-has-placeholder .label-floating.sc-wl-label-md-h,[dir] .item-has-value.label-floating.sc-wl-label-md-h,.item-has-value .label-floating.sc-wl-label-md-h{transform:translate3d(0,  50%,  0) scale(0.75)}.item-has-focus.label-stacked.sc-wl-label-md-h,.item-has-focus .label-stacked.sc-wl-label-md-h,.item-has-focus.label-floating.sc-wl-label-md-h,.item-has-focus .label-floating.sc-wl-label-md-h{color:var(--wl-color-primary, #3880ff)}.sc-wl-label-md-s h1{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:24px;font-weight:normal}.sc-wl-label-md-s h2{margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;font-size:16px;font-weight:normal}.sc-wl-label-md-s h3,.sc-wl-label-md-s h4,.sc-wl-label-md-s h5,.sc-wl-label-md-s h6{margin-left:0;margin-right:0;margin-top:2px;margin-bottom:2px;font-size:14px;font-weight:normal;line-height:normal}.sc-wl-label-md-s p{margin-left:0;margin-right:0;margin-top:0;margin-bottom:2px;font-size:14px;line-height:20px;text-overflow:inherit;overflow:inherit}.sc-wl-label-md-s>p{color:var(--wl-color-step-600, #666666)}.sc-wl-label-md-h.wl-color.sc-wl-label-md-s>p,.wl-color .sc-wl-label-md-h.sc-wl-label-md-s>p{color:inherit}";

class WlLabel {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlStyle = createEvent(this, "wlStyle", 7);
    this.noAnimate = false;
  }
  componentWillLoad() {
    this.noAnimate = this.position === "floating";
    this.emitStyle();
  }
  componentDidLoad() {
    if (this.noAnimate) {
      setTimeout(() => {
        this.noAnimate = false;
      }, 1000);
    }
  }
  positionChanged() {
    this.emitStyle();
  }
  emitStyle() {
    const position = this.position;
    this.wlStyle.emit({
      md: true,
      [`label-${position}`]: position !== undefined,
      [`label-no-animate`]: this.noAnimate,
    });
  }
  render() {
    const position = this.position;
    const mode = getWlMode(this);
    return (hAsync(Host, { class: Object.assign(Object.assign({}, createColorClasses(this.color)), { [mode]: true, [`label-${position}`]: position !== undefined, [`label-no-animate`]: true }) }));
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "position": ["positionChanged"]
  }; }
  static get style() { return {
    ios: labelIosCss,
    md: labelMdCss
  }; }
  static get cmpMeta() { return {
    "$flags$": 34,
    "$tagName$": "wl-label",
    "$members$": {
      "color": [1],
      "position": [1],
      "noAnimate": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const listIosCss = "wl-list{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:block;contain:content;list-style-type:none}wl-list.list-inset{transform:translateZ(0);overflow:hidden}.list-ios{background:inherit}.list-ios.list-inset{margin-left:16px;margin-right:16px;margin-top:16px;margin-bottom:16px;border-radius:4px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.list-ios.list-inset{margin-left:unset;margin-right:unset;-webkit-margin-start:16px;margin-inline-start:16px;-webkit-margin-end:16px;margin-inline-end:16px}}[dir] .list-ios.list-inset{border-radius:4px}.list-ios.list-inset wl-item{--border-width:0 0 1px 0;--inner-border-width:0}.list-ios.list-inset wl-item:last-child{--border-width:0;--inner-border-width:0}.list-ios.list-inset+wl-list.list-inset{margin-top:0}.list-ios-lines-none .item{--border-width:0;--inner-border-width:0}.list-ios-lines-full .item,.list-ios .item-lines-full{--border-width:0 0 0.55px 0}.list-ios-lines-full .item{--inner-border-width:0}.list-ios-lines-inset .item,.list-ios .item-lines-inset{--inner-border-width:0 0 0.55px 0}.list-ios .item-lines-inset{--border-width:0}.list-ios .item-lines-full{--inner-border-width:0}.list-ios .item-lines-none{--border-width:0;--inner-border-width:0}wl-card .list-ios{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}";

const listMdCss = "wl-list{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;display:block;contain:content;list-style-type:none}wl-list.list-inset{transform:translateZ(0);overflow:hidden}.list-md{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:8px;padding-bottom:8px;background:inherit}.list-md>.input:last-child::after{left:0}[dir=rtl] .list-md>.input:last-child::after,:host-context([dir=rtl]) .list-md>.input:last-child::after{left:unset;right:unset;right:0}.list-md.list-inset{margin-left:16px;margin-right:16px;margin-top:16px;margin-bottom:16px;border-radius:2px}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){.list-md.list-inset{margin-left:unset;margin-right:unset;-webkit-margin-start:16px;margin-inline-start:16px;-webkit-margin-end:16px;margin-inline-end:16px}}[dir] .list-md.list-inset{border-radius:2px}.list-md.list-inset wl-item:first-child{--border-radius:2px 2px 0 0;--border-width:0 0 1px 0}.list-md.list-inset wl-item:last-child{--border-radius:0 0 2px, 2px;--border-width:0}.list-md.list-inset .item-interactive{--padding-start:0;--padding-end:0}.list-md.list-inset+wl-list.list-inset{margin-top:0}.list-md-lines-none .item{--border-width:0;--inner-border-width:0}.list-md-lines-full .item,.list-md .item-lines-full{--border-width:0 0 1px 0}.list-md-lines-full .item{--inner-border-width:0}.list-md-lines-inset .item,.list-md .item-lines-inset{--inner-border-width:0 0 1px 0}.list-md .item-lines-inset{--border-width:0}.list-md .item-lines-full{--inner-border-width:0}.list-md .item-lines-none{--border-width:0;--inner-border-width:0}wl-card .list-md{margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}";

class WlList {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    /**
     * If `true`, the list will have margin around it and rounded corners.
     */
    this.inset = false;
  }
  render() {
    const { lines, inset } = this;
    let mode = getWlMode();
    return (hAsync(Host, { class: {
        [mode]: true,
        // Used internally for styling
        [`list-${mode}`]: true,
        "list-inset": inset,
        [`list-lines-${lines}`]: lines !== undefined,
        [`list-${mode}-lines-${lines}`]: lines !== undefined,
      } }));
  }
  get el() { return getElement(this); }
  static get style() { return {
    ios: listIosCss,
    md: listMdCss
  }; }
  static get cmpMeta() { return {
    "$flags$": 32,
    "$tagName$": "wl-list",
    "$members$": {
      "lines": [1],
      "inset": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const wlModalCss = "/*!@#backdrop*/#backdrop.sc-wl-modal{transition:all 0.3s ease-out;width:100%;position:fixed;height:100vh;background-color:rgba(0, 0, 0, 0.77);top:0;left:0;pointer-events:none;opacity:0;z-index:101}/*!@#modal*/#modal.sc-wl-modal{transition:all 0.3s ease-out;width:80%;min-height:200px;padding:1rem;background-color:var(--wl-background-color, white);color:var(--wl-text-color, black);z-index:102;opacity:1;position:fixed;left:10%;right:10%;top:25%;box-shadow:0px 0px 4px 2px rgba(59, 57, 57, 0.29), 0px 0px 4px 2px rgba(59, 57, 57, 0.2);pointer-events:none;opacity:0}/*!@#content*/#content.sc-wl-modal{padding:0 0.4rem}/*!@::slotted(wl-title)*/.sc-wl-modal-s>wl-title{margin:0}/*!@#actions*/#actions.sc-wl-modal{position:absolute;bottom:0;right:0}/*!@#action-data*/#action-data.sc-wl-modal{margin:1.2rem}/*!@:host([show]) #backdrop*/[show].sc-wl-modal-h #backdrop.sc-wl-modal{pointer-events:all;opacity:1}/*!@:host([show]) #modal*/[show].sc-wl-modal-h #modal.sc-wl-modal{pointer-events:all;opacity:1;position:fixed}";

class WlModal {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.show = false;
  }
  async close() {
    this.show = false;
  }
  async open() {
    this.show = true;
  }
  render() {
    return [
      hAsync("div", { id: "backdrop", onClick: () => {
          this.close();
        } }),
      hAsync("div", { id: "modal" }, hAsync("header", null, hAsync("slot", { name: "title" })), hAsync("div", { id: "content" }, hAsync("slot", null)), hAsync("div", { id: "actions" }, hAsync("div", { id: "action-data" }, hAsync("slot", { name: "actions" })))),
    ];
  }
  static get style() { return wlModalCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-modal",
    "$members$": {
      "show": [1540],
      "close": [64],
      "open": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["show", "show"]]
  }; }
}

class WlRoute {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlRouteDataChanged = createEvent(this, "wlRouteDataChanged", 7);
    /**
     * Relative path that needs to match in order for this route to apply.
     *
     * Accepts paths similar to expressjs so that you can define parameters
     * in the url /foo/:bar where bar would be available in incoming props.
     */
    this.url = "";
  }
  onUpdate(newValue) {
    this.wlRouteDataChanged.emit(newValue);
  }
  onComponentProps(newValue, oldValue) {
    if (newValue === oldValue) {
      return;
    }
    const keys1 = newValue ? Object.keys(newValue) : [];
    const keys2 = oldValue ? Object.keys(oldValue) : [];
    if (keys1.length !== keys2.length) {
      this.onUpdate(newValue);
      return;
    }
    for (const key of keys1) {
      if (newValue[key] !== oldValue[key]) {
        this.onUpdate(newValue);
        return;
      }
    }
  }
  connectedCallback() {
    this.wlRouteDataChanged.emit();
  }
  static get watchers() { return {
    "url": ["onUpdate"],
    "component": ["onUpdate"],
    "componentProps": ["onComponentProps"]
  }; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "wl-route",
    "$members$": {
      "url": [1],
      "component": [1],
      "componentProps": [16]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

class WlRouteRedirect {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlRouteRedirectChanged = createEvent(this, "wlRouteRedirectChanged", 7);
  }
  propDidChange() {
    this.wlRouteRedirectChanged.emit();
  }
  connectedCallback() {
    this.wlRouteRedirectChanged.emit();
  }
  static get watchers() { return {
    "from": ["propDidChange"],
    "to": ["propDidChange"]
  }; }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "wl-route-redirect",
    "$members$": {
      "from": [1],
      "to": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const ROUTER_INTENT_NONE = 'root';
const ROUTER_INTENT_FORWARD = 'forward';
const ROUTER_INTENT_BACK = 'back';

const generatePath = (segments) => {
  const path = segments.filter((s) => s.length > 0).join("/");
  return "/" + path;
};
const chainToPath = (chain) => {
  const path = [];
  for (const route of chain) {
    for (const segment of route.path) {
      if (segment[0] === ":") {
        const param = route.params && route.params[segment.slice(1)];
        if (!param) {
          return null;
        }
        path.push(param);
      }
      else if (segment !== "") {
        path.push(segment);
      }
    }
  }
  return path;
};
const writePath = (history, root, useHash, path, direction, state) => {
  let url = generatePath([...parsePath(root), ...path]);
  if (useHash) {
    url = "#" + url;
  }
  if (direction === ROUTER_INTENT_FORWARD) {
    history.pushState(state, "", url);
  }
  else {
    history.replaceState(state, "", url);
  }
};
const removePrefix = (prefix, path) => {
  if (prefix.length > path.length) {
    return null;
  }
  if (prefix.length <= 1 && prefix[0] === "") {
    return path;
  }
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i].length > 0 && prefix[i] !== path[i]) {
      return null;
    }
  }
  if (path.length === prefix.length) {
    return [""];
  }
  return path.slice(prefix.length);
};
const readPath = (loc, root, useHash) => {
  let pathname = loc.pathname;
  if (useHash) {
    const hash = loc.hash;
    pathname = hash[0] === "#" ? hash.slice(1) : "";
  }
  const prefix = parsePath(root);
  const path = parsePath(pathname);
  return removePrefix(prefix, path);
};
const parsePath = (path) => {
  if (path == null) {
    return [""];
  }
  const segments = path
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (segments.length === 0) {
    return [""];
  }
  else {
    return segments;
  }
};

const printRoutes = (routes) => {
  console.group(`[wl-core] ROUTES[${routes.length}]`);
  for (const chain of routes) {
    const path = [];
    chain.forEach((r) => path.push(...r.path));
    const ids = chain.map((r) => r.id);
    console.debug(`%c ${generatePath(path)}`, "font-weight: bold; padding-left: 20px", "=>\t", `(${ids.join(", ")})`);
  }
  console.groupEnd();
};
const printRedirects = (redirects) => {
  console.group(`[wl-core] REDIRECTS[${redirects.length}]`);
  for (const redirect of redirects) {
    if (redirect.to) {
      console.debug("FROM: ", `$c ${generatePath(redirect.from)}`, "font-weight: bold", " TO: ", `$c ${generatePath(redirect.to)}`, "font-weight: bold");
    }
  }
  console.groupEnd();
};

const writeNavState = async (root, chain, direction, index, changed = false) => {
  try {
    // find next navigation outlet in the DOM
    const outlet = searchNavNode(root);
    // make sure we can continue interacting the DOM, otherwise abort
    if (index >= chain.length || !outlet) {
      return changed;
    }
    await outlet.componentOnReady();
    const route = chain[index];
    const result = await outlet.setRouteId(route.id, route.params, direction);
    // if the outlet changed the page, reset navigation to neutral (no direction)
    // this means nested outlets will not animate
    if (result.changed) {
      direction = ROUTER_INTENT_NONE;
      changed = true;
    }
    // recursively set nested outlets
    changed = await writeNavState(result.element, chain, direction, index + 1, changed);
    // once all nested outlets are visible let's make the parent visible too,
    // using markVisible prevents flickering
    if (result.markVisible) {
      await result.markVisible();
    }
    return changed;
  }
  catch (e) {
    console.error(e);
    return false;
  }
};
const readNavState = async (root) => {
  const ids = [];
  let outlet;
  let node = root;
  // tslint:disable-next-line:no-constant-condition
  while (true) {
    outlet = searchNavNode(node);
    if (outlet) {
      const id = await outlet.getRouteId();
      if (id) {
        node = id.element;
        id.element = undefined;
        ids.push(id);
      }
      else {
        break;
      }
    }
    else {
      break;
    }
  }
  return { ids, outlet };
};
const waitUntilNavNode = () => {
  if (searchNavNode(document.body)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.addEventListener("wlNavWillLoad", resolve, { once: true });
  });
};
const QUERY = ":not([no-router]) wl-nav, :not([no-router]) wl-tabs, :not([no-router]) wl-router-outlet";
const searchNavNode = (root) => {
  if (!root) {
    return undefined;
  }
  if (root.matches(QUERY)) {
    return root;
  }
  const outlet = root.querySelector(QUERY);
  return outlet ? outlet : undefined;
};

const matchesRedirect = (input, route) => {
  const { from, to } = route;
  if (to === undefined) {
    return false;
  }
  if (from.length > input.length) {
    return false;
  }
  for (let i = 0; i < from.length; i++) {
    const expected = from[i];
    if (expected === '*') {
      return true;
    }
    if (expected !== input[i]) {
      return false;
    }
  }
  return from.length === input.length;
};
const routeRedirect = (path, routes) => {
  return routes.find(route => matchesRedirect(path, route));
};
const matchesIDs = (ids, chain) => {
  const len = Math.min(ids.length, chain.length);
  let i = 0;
  for (; i < len; i++) {
    if (ids[i].toLowerCase() !== chain[i].id) {
      break;
    }
  }
  return i;
};
const matchesPath = (inputPath, chain) => {
  const segments = new RouterSegments(inputPath);
  let matchesDefault = false;
  let allparams;
  for (let i = 0; i < chain.length; i++) {
    const path = chain[i].path;
    if (path[0] === '') {
      matchesDefault = true;
    }
    else {
      for (const segment of path) {
        const data = segments.next();
        // data param
        if (segment[0] === ':') {
          if (data === '') {
            return null;
          }
          allparams = allparams || [];
          const params = allparams[i] || (allparams[i] = {});
          params[segment.slice(1)] = data;
        }
        else if (data !== segment) {
          return null;
        }
      }
      matchesDefault = false;
    }
  }
  const matches = (matchesDefault)
    ? matchesDefault === (segments.next() === '')
    : true;
  if (!matches) {
    return null;
  }
  if (allparams) {
    return chain.map((route, i) => ({
      id: route.id,
      path: route.path,
      params: mergeParams(route.params, allparams[i])
    }));
  }
  return chain;
};
const mergeParams = (a, b) => {
  if (!a && b) {
    return b;
  }
  else if (a && !b) {
    return a;
  }
  else if (a && b) {
    return Object.assign(Object.assign({}, a), b);
  }
  return undefined;
};
const routerIDsToChain = (ids, chains) => {
  let match = null;
  let maxMatches = 0;
  const plainIDs = ids.map(i => i.id);
  for (const chain of chains) {
    const score = matchesIDs(plainIDs, chain);
    if (score > maxMatches) {
      match = chain;
      maxMatches = score;
    }
  }
  if (match) {
    return match.map((route, i) => ({
      id: route.id,
      path: route.path,
      params: mergeParams(route.params, ids[i] && ids[i].params)
    }));
  }
  return null;
};
const routerPathToChain = (path, chains) => {
  let match = null;
  let matches = 0;
  for (const chain of chains) {
    const matchedChain = matchesPath(path, chain);
    if (matchedChain !== null) {
      const score = computePriority(matchedChain);
      if (score > matches) {
        matches = score;
        match = matchedChain;
      }
    }
  }
  return match;
};
const computePriority = (chain) => {
  let score = 1;
  let level = 1;
  for (const route of chain) {
    for (const path of route.path) {
      if (path[0] === ':') {
        score += Math.pow(1, level);
      }
      else if (path !== '') {
        score += Math.pow(2, level);
      }
      level++;
    }
  }
  return score;
};
class RouterSegments {
  constructor(path) {
    this.path = path.slice();
  }
  next() {
    if (this.path.length > 0) {
      return this.path.shift();
    }
    return '';
  }
}

const readRedirects = (root) => {
  return Array.from(root.children)
    .filter((el) => el.tagName === "WL-ROUTE-REDIRECT")
    .map((el) => {
    const to = readProp(el, "to");
    return {
      from: parsePath(readProp(el, "from")),
      to: to == null ? undefined : parsePath(to),
    };
  });
};
const readRoutes = (root) => {
  return flattenRouterTree(readRouteNodes(root));
};
const readRouteNodes = (root, node = root) => {
  return Array.from(node.children)
    .filter((el) => el.tagName === "WL-ROUTE" && el.component)
    .map((el) => {
    const component = readProp(el, "component");
    if (component == null) {
      throw new Error("component missing in wl-route");
    }
    return {
      path: parsePath(readProp(el, "url")),
      id: component.toLowerCase(),
      params: el.componentProps,
      children: readRouteNodes(root, el),
    };
  });
};
const readProp = (el, prop) => {
  if (prop in el) {
    return el[prop];
  }
  if (el.hasAttribute(prop)) {
    return el.getAttribute(prop);
  }
  return null;
};
const flattenRouterTree = (nodes) => {
  const routes = [];
  for (const node of nodes) {
    flattenNode([], routes, node);
  }
  return routes;
};
const flattenNode = (chain, routes, node) => {
  const s = chain.slice();
  s.push({
    id: node.id,
    path: node.path,
    params: node.params,
  });
  if (node.children.length === 0) {
    routes.push(s);
    return;
  }
  for (const sub of node.children) {
    flattenNode(s, routes, sub);
  }
};

class WlRouter {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlRouteWillChange = createEvent(this, "wlRouteWillChange", 7);
    this.wlRouteDidChange = createEvent(this, "wlRouteDidChange", 7);
    this.previousPath = null;
    this.busy = false;
    this.state = 0;
    this.lastState = 0;
    /**
     * By default `wl-router` will match the routes at the root path ("/").
     * That can be changed when
     *
     */
    this.root = "/";
    /**
     * The router can work in two "modes":
     * - With hash: `/index.html#/path/to/page`
     * - Without hash: `/path/to/page`
     *
     * Using one or another might depend in the requirements of your app and/or where it's deployed.
     *
     * Usually "hash-less" navigation works better for SEO and it's more user friendly too, but it might
     * requires additional server-side configuration in order to properly work.
     *
     * On the otherside hash-navigation is much easier to deploy, it even works over the file protocol.
     *
     * By default, this property is `true`, change to `false` to allow hash-less URLs.
     */
    this.useHash = true;
  }
  async componentWillLoad() {
    console.debug("[wl-router] router will load");
    await waitUntilNavNode();
    console.debug("[wl-router] found nav");
    await this.onRoutesChanged();
  }
  componentDidLoad() {
    window.addEventListener("wlRouteRedirectChanged", debounce(this.onRedirectChanged.bind(this), 10));
    window.addEventListener("wlRouteDataChanged", debounce(this.onRoutesChanged.bind(this), 100));
  }
  onPopState() {
    const direction = this.historyDirection();
    const path = this.getPath();
    console.debug("[wl-router] URL changed -> update nav", path, direction);
    return this.writeNavStateRoot(path, direction);
  }
  onBackButton(ev) {
    ev.detail.register(0, () => this.back());
  }
  /**
   * Navigate to the specified URL.
   *
   * @param url The url to navigate to.
   * @param direction The direction of the animation. Defaults to `"forward"`.
   */
  push(url, direction = "forward") {
    if (url.startsWith(".")) {
      url = new URL(url, window.location.href).pathname;
    }
    console.debug("[wl-router] URL pushed -> updating nav", url, direction);
    const path = parsePath(url);
    this.setPath(path, direction);
    return this.writeNavStateRoot(path, direction);
  }
  /**
   * Go back to previous page in the window.history.
   */
  back() {
    window.history.back();
    return Promise.resolve(this.waitPromise);
  }
  /** @internal */
  async printDebug() {
    console.debug("CURRENT PATH", this.getPath());
    console.debug("PREVIOUS PATH", this.previousPath);
    printRoutes(readRoutes(this.el));
    printRedirects(readRedirects(this.el));
  }
  /** @internal */
  async navChanged(direction) {
    if (this.busy) {
      console.warn("[wl-router] router is busy, navChanged was cancelled");
      return false;
    }
    const { ids, outlet } = await readNavState(window.document.body);
    const routes = readRoutes(this.el);
    const chain = routerIDsToChain(ids, routes);
    if (!chain) {
      console.warn("[wl-router] no matching URL for ", ids.map((i) => i.id));
      return false;
    }
    const path = chainToPath(chain);
    if (!path) {
      console.warn("[wl-router] router could not match path because some required param is missing");
      return false;
    }
    console.debug("[wl-router] nav changed -> update URL", ids, path);
    this.setPath(path, direction);
    await this.safeWriteNavState(outlet, chain, ROUTER_INTENT_NONE, path, null, ids.length);
    return true;
  }
  onRedirectChanged() {
    const path = this.getPath();
    if (path && routeRedirect(path, readRedirects(this.el))) {
      this.writeNavStateRoot(path, ROUTER_INTENT_NONE);
    }
  }
  onRoutesChanged() {
    return this.writeNavStateRoot(this.getPath(), ROUTER_INTENT_NONE);
  }
  historyDirection() {
    const win = window;
    if (win.history.state === null) {
      this.state++;
      win.history.replaceState(this.state, win.document.title, win.document.location && win.document.location.href);
    }
    const state = win.history.state;
    const lastState = this.lastState;
    this.lastState = state;
    if (state > lastState) {
      return ROUTER_INTENT_FORWARD;
    }
    else if (state < lastState) {
      return ROUTER_INTENT_BACK;
    }
    else {
      return ROUTER_INTENT_NONE;
    }
  }
  async writeNavStateRoot(path, direction) {
    if (!path) {
      console.error("[wl-router] URL is not part of the routing set");
      return false;
    }
    // lookup redirect rule
    const redirects = readRedirects(this.el);
    const redirect = routeRedirect(path, redirects);
    let redirectFrom = null;
    if (redirect) {
      this.setPath(redirect.to, direction);
      redirectFrom = redirect.from;
      path = redirect.to;
    }
    // lookup route chain
    const routes = readRoutes(this.el);
    const chain = routerPathToChain(path, routes);
    if (!chain) {
      console.error("[wl-router] the path does not match any route");
      return false;
    }
    // write DOM give
    return this.safeWriteNavState(document.body, chain, direction, path, redirectFrom);
  }
  async safeWriteNavState(node, chain, direction, path, redirectFrom, index = 0) {
    const unlock = await this.lock();
    let changed = false;
    try {
      changed = await this.writeNavState(node, chain, direction, path, redirectFrom, index);
    }
    catch (e) {
      console.error(e);
    }
    unlock();
    return changed;
  }
  async lock() {
    const p = this.waitPromise;
    let resolve;
    this.waitPromise = new Promise((r) => (resolve = r));
    if (p !== undefined) {
      await p;
    }
    return resolve;
  }
  async writeNavState(node, chain, direction, path, redirectFrom, index = 0) {
    if (this.busy) {
      console.warn("[wl-router] router is busy, transition was cancelled");
      return false;
    }
    this.busy = true;
    // generate route event and emit will change
    const routeEvent = this.routeChangeEvent(path, redirectFrom);
    if (routeEvent) {
      this.wlRouteWillChange.emit(routeEvent);
    }
    const changed = await writeNavState(node, chain, direction, index);
    this.busy = false;
    if (changed) {
      console.debug("[wl-router] route changed", path);
    }
    // emit did change
    if (routeEvent) {
      this.wlRouteDidChange.emit(routeEvent);
    }
    return changed;
  }
  setPath(path, direction) {
    this.state++;
    writePath(window.history, this.root, this.useHash, path, direction, this.state);
  }
  getPath() {
    return readPath(window.location, this.root, this.useHash);
  }
  routeChangeEvent(path, redirectFromPath) {
    const from = this.previousPath;
    const to = generatePath(path);
    this.previousPath = to;
    if (to === from) {
      return null;
    }
    const redirectedFrom = redirectFromPath
      ? generatePath(redirectFromPath)
      : null;
    return {
      from,
      redirectedFrom,
      to,
    };
  }
  get el() { return getElement(this); }
  static get cmpMeta() { return {
    "$flags$": 0,
    "$tagName$": "wl-router",
    "$members$": {
      "root": [1],
      "useHash": [4, "use-hash"],
      "push": [64],
      "back": [64],
      "printDebug": [64],
      "navChanged": [64]
    },
    "$listeners$": [[8, "popstate", "onPopState"], [4, "wlBackButton", "onBackButton"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const attachComponent = async (delegate, container, component, cssClasses, componentProps) => {
  if (delegate) {
    return delegate.attachViewToDom(container, component, componentProps, cssClasses);
  }
  if (typeof component !== "string" && !(component instanceof HTMLElement)) {
    throw new Error("framework delegate is missing");
  }
  const el = typeof component === "string"
    ? container.ownerDocument &&
      container.ownerDocument.createElement(component)
    : component;
  if (cssClasses) {
    cssClasses.forEach((c) => el.classList.add(c));
  }
  if (componentProps) {
    Object.assign(el, componentProps);
  }
  container.appendChild(el);
  if (el.componentOnReady) {
    await el.componentOnReady();
  }
  return el;
};
const detachComponent = (delegate, element) => {
  if (element) {
    if (delegate) {
      const container = element.parentElement;
      return delegate.removeViewFromDom(container, element);
    }
    element.remove();
  }
  return Promise.resolve();
};

const LIFECYCLE_WILL_ENTER = "wlViewWillEnter";
const LIFECYCLE_DID_ENTER = "wlViewDidEnter";
const LIFECYCLE_WILL_LEAVE = "wlViewWillLeave";
const LIFECYCLE_DID_LEAVE = "wlViewDidLeave";

const iosTransitionAnimation = () => Promise.resolve().then(function () { return ios_transition; });
const mdTransitionAnimation = () => Promise.resolve().then(function () { return md_transition; });
const transition = (opts) => {
  return new Promise((resolve, reject) => {
    writeTask(() => {
      beforeTransition(opts);
      runTransition(opts).then((result) => {
        if (result.animation) {
          result.animation.destroy();
        }
        afterTransition(opts);
        resolve(result);
      }, (error) => {
        afterTransition(opts);
        reject(error);
      });
    });
  });
};
const beforeTransition = (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  setZIndex(enteringEl, leavingEl, opts.direction);
  if (opts.showGoBack) {
    enteringEl.classList.add("can-go-back");
  }
  else {
    enteringEl.classList.remove("can-go-back");
  }
  setPageHidden(enteringEl, false);
  if (leavingEl) {
    setPageHidden(leavingEl, false);
  }
};
const runTransition = async (opts) => {
  const animationBuilder = await getAnimationBuilder(opts);
  const ani = animationBuilder && Build.isBrowser
    ? animation(animationBuilder, opts)
    : noAnimation(opts); // fast path for no animation
  return ani;
};
const afterTransition = (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  enteringEl.classList.remove("wl-page-invisible");
  if (leavingEl !== undefined) {
    leavingEl.classList.remove("wl-page-invisible");
  }
};
const getAnimationBuilder = async (opts) => {
  if (!opts.leavingEl || !opts.animated || opts.duration === 0) {
    return undefined;
  }
  if (opts.animationBuilder) {
    return opts.animationBuilder;
  }
  const getAnimation = opts.mode === "ios"
    ? (await iosTransitionAnimation()).iosTransitionAnimation
    : (await mdTransitionAnimation()).mdTransitionAnimation;
  return getAnimation;
};
const animation = async (animationBuilder, opts) => {
  await waitForReady(opts, true);
  const trans = animationBuilder(opts.baseEl, opts);
  fireWillEvents(opts.enteringEl, opts.leavingEl);
  const didComplete = await playTransition(trans, opts);
  if (opts.progressCallback) {
    opts.progressCallback(undefined);
  }
  if (didComplete) {
    fireDidEvents(opts.enteringEl, opts.leavingEl);
  }
  return {
    hasCompleted: didComplete,
    animation: trans,
  };
};
const noAnimation = async (opts) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  await waitForReady(opts, false);
  fireWillEvents(enteringEl, leavingEl);
  fireDidEvents(enteringEl, leavingEl);
  return {
    hasCompleted: true,
  };
};
const waitForReady = async (opts, defaultDeep) => {
  const deep = opts.deepWait !== undefined ? opts.deepWait : defaultDeep;
  const promises = deep
    ? [deepReady(opts.enteringEl), deepReady(opts.leavingEl)]
    : [shallowReady(opts.enteringEl), shallowReady(opts.leavingEl)];
  await Promise.all(promises);
  await notifyViewReady(opts.viewIsReady, opts.enteringEl);
};
const notifyViewReady = async (viewIsReady, enteringEl) => {
  if (viewIsReady) {
    await viewIsReady(enteringEl);
  }
};
const playTransition = (trans, opts) => {
  const progressCallback = opts.progressCallback;
  const promise = new Promise((resolve) => {
    trans.onFinish((currentStep) => resolve(currentStep === 1));
  });
  // cool, let's do this, start the transition
  if (progressCallback) {
    // this is a swipe to go back, just get the transition progress ready
    // kick off the swipe animation start
    trans.progressStart(true);
    progressCallback(trans);
  }
  else {
    // only the top level transition should actually start "play"
    // kick it off and let it play through
    // ******** DOM WRITE ****************
    trans.play();
  }
  // create a callback for when the animation is done
  return promise;
};
const fireWillEvents = (enteringEl, leavingEl) => {
  lifecycle(leavingEl, LIFECYCLE_WILL_LEAVE);
  lifecycle(enteringEl, LIFECYCLE_WILL_ENTER);
};
const fireDidEvents = (enteringEl, leavingEl) => {
  lifecycle(enteringEl, LIFECYCLE_DID_ENTER);
  lifecycle(leavingEl, LIFECYCLE_DID_LEAVE);
};
const lifecycle = (el, eventName) => {
  if (el) {
    const ev = new CustomEvent(eventName, {
      bubbles: false,
      cancelable: false,
    });
    el.dispatchEvent(ev);
  }
};
const shallowReady = (el) => {
  if (el && el.componentOnReady) {
    return el.componentOnReady();
  }
  return Promise.resolve();
};
const deepReady = async (el) => {
  const element = el;
  if (element) {
    if (element.componentOnReady != null) {
      const stencilEl = await element.componentOnReady();
      if (stencilEl != null) {
        return;
      }
    }
    await Promise.all(Array.from(element.children).map(deepReady));
  }
};
const setPageHidden = (el, hidden) => {
  if (hidden) {
    el.setAttribute("aria-hidden", "true");
    el.classList.add("wl-page-hidden");
  }
  else {
    el.hidden = false;
    el.removeAttribute("aria-hidden");
    el.classList.remove("wl-page-hidden");
  }
};
const setZIndex = (enteringEl, leavingEl, direction) => {
  if (enteringEl !== undefined) {
    enteringEl.style.zIndex = direction === "back" ? "99" : "101";
  }
  if (leavingEl !== undefined) {
    leavingEl.style.zIndex = "100";
  }
};
const getWlPageElement = (element) => {
  if (element.classList.contains("wl-page")) {
    return element;
  }
  const wlPage = element.querySelector(":scope > .wl-page, :scope > wl-nav, :scope > wl-tabs");
  if (wlPage) {
    return wlPage;
  }
  // idk, return the original element so at least something animates and we don't have a null pointer
  return element;
};

/**
 * Based on:
 * https://stackoverflow.com/questions/7348009/y-coordinate-for-a-given-x-cubic-bezier
 * https://math.stackexchange.com/questions/26846/is-there-an-explicit-form-for-cubic-b%C3%A9zier-curves
 * TODO: Reduce rounding error
 */
/**
 * EXPERIMENTAL
 * Given a cubic-bezier curve, get the x value (time) given
 * the y value (progression).
 * Ex: cubic-bezier(0.32, 0.72, 0, 1);
 * P0: (0, 0)
 * P1: (0.32, 0.72)
 * P2: (0, 1)
 * P3: (1, 1)
 *
 * If you give a cubic bezier curve that never reaches the
 * provided progression, this function will return an empty array.
 */
const getTimeGivenProgression = (p0, p1, p2, p3, progression) => {
  return solveCubicBezier(p0[1], p1[1], p2[1], p3[1], progression).map((tValue) => {
    return solveCubicParametricEquation(p0[0], p1[0], p2[0], p3[0], tValue);
  });
};
/**
 * Solve a cubic equation in one dimension (time)
 */
const solveCubicParametricEquation = (p0, p1, p2, p3, t) => {
  const partA = 3 * p1 * Math.pow(t - 1, 2);
  const partB = -3 * p2 * t + 3 * p2 + p3 * t;
  const partC = p0 * Math.pow(t - 1, 3);
  return t * (partA + t * partB) - partC;
};
/**
 * Find the `t` value for a cubic bezier using Cardano's formula
 */
const solveCubicBezier = (p0, p1, p2, p3, refPoint) => {
  p0 -= refPoint;
  p1 -= refPoint;
  p2 -= refPoint;
  p3 -= refPoint;
  const roots = solveCubicEquation(p3 - 3 * p2 + 3 * p1 - p0, 3 * p2 - 6 * p1 + 3 * p0, 3 * p1 - 3 * p0, p0);
  return roots.filter((root) => root >= 0 && root <= 1);
};
const solveQuadraticEquation = (a, b, c) => {
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return [];
  }
  else {
    return [
      (-b + Math.sqrt(discriminant)) / (2 * a),
      (-b - Math.sqrt(discriminant)) / (2 * a),
    ];
  }
};
const solveCubicEquation = (a, b, c, d) => {
  if (a === 0) {
    return solveQuadraticEquation(b, c, d);
  }
  b /= a;
  c /= a;
  d /= a;
  const p = (3 * c - b * b) / 3;
  const q = (2 * b * b * b - 9 * b * c + 27 * d) / 27;
  if (p === 0) {
    return [Math.pow(-q, 1 / 3)];
  }
  else if (q === 0) {
    return [Math.sqrt(-p), -Math.sqrt(-p)];
  }
  const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
  if (discriminant === 0) {
    return [Math.pow(q / 2, 1 / 2) - b / 3];
  }
  else if (discriminant > 0) {
    return [
      Math.pow(-(q / 2) + Math.sqrt(discriminant), 1 / 3) -
        Math.pow(q / 2 + Math.sqrt(discriminant), 1 / 3) -
        b / 3,
    ];
  }
  const r = Math.sqrt(Math.pow(-(p / 3), 3));
  const phi = Math.acos(-(q / (2 * Math.sqrt(Math.pow(-(p / 3), 3)))));
  const s = 2 * Math.pow(r, 1 / 3);
  return [
    s * Math.cos(phi / 3) - b / 3,
    s * Math.cos((phi + 2 * Math.PI) / 3) - b / 3,
    s * Math.cos((phi + 4 * Math.PI) / 3) - b / 3,
  ];
};

const routeOutletCss = "/*!@:host*/.sc-wl-router-outlet-h{left:0;right:0;top:0;bottom:0;position:absolute;contain:layout size style;overflow:hidden;z-index:0}/*!@[dir] :host*/[dir] .sc-wl-router-outlet-h{left:0;right:0}";

class WlRouterOutlet {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlNavWillLoad = createEvent(this, "wlNavWillLoad", 7);
    this.wlNavWillChange = createEvent(this, "wlNavWillChange", 3);
    this.wlNavDidChange = createEvent(this, "wlNavDidChange", 3);
    this.animationEnabled = true;
    /**
     * If `true`, the router-outlet should animate the transition of components.
     */
    this.animated = true;
  }
  swipeHandlerChanged() {
    if (this.gesture) {
      this.gesture.enable(this.swipeHandler !== undefined);
    }
  }
  async connectedCallback() {
    this.gesture = (await Promise.resolve().then(function () { return swipeBack; })).createSwipeBackGesture(this.el, () => !!this.swipeHandler &&
      this.swipeHandler.canStart() &&
      this.animationEnabled, () => this.swipeHandler && this.swipeHandler.onStart(), (step) => this.ani && this.ani.progressStep(step), (shouldComplete, step, dur) => {
      if (this.ani) {
        this.animationEnabled = false;
        this.ani.onFinish(() => {
          this.animationEnabled = true;
          if (this.swipeHandler) {
            this.swipeHandler.onEnd(shouldComplete);
          }
        }, { oneTimeCallback: true });
        // Account for rounding errors in JS
        let newStepValue = shouldComplete ? -0.001 : 0.001;
        /**
         * Animation will be reversed here, so need to
         * reverse the easing curve as well
         *
         * Additionally, we need to account for the time relative
         * to the new easing curve, as `stepValue` is going to be given
         * in terms of a linear curve.
         */
        if (!shouldComplete) {
          this.ani.easing("cubic-bezier(1, 0, 0.68, 0.28)");
          newStepValue += getTimeGivenProgression([0, 0], [1, 0], [0.68, 0.28], [1, 1], step)[0];
        }
        else {
          newStepValue += getTimeGivenProgression([0, 0], [0.32, 0.72], [0, 1], [1, 1], step)[0];
        }
        this.ani.progressEnd(shouldComplete ? 1 : 0, newStepValue, dur);
      }
    });
    this.swipeHandlerChanged();
  }
  componentWillLoad() {
    this.wlNavWillLoad.emit();
  }
  disconnectedCallback() {
    if (this.gesture) {
      this.gesture.destroy();
      this.gesture = undefined;
    }
  }
  /** @internal */
  async commit(enteringEl, leavingEl, opts) {
    const unlock = await this.lock();
    let changed = false;
    try {
      changed = await this.transition(enteringEl, leavingEl, opts);
    }
    catch (e) {
      console.error(e);
    }
    unlock();
    return changed;
  }
  /** @internal */
  async setRouteId(id, params, direction) {
    const changed = await this.setRoot(id, params, {
      duration: direction === "root" ? 0 : undefined,
      direction: direction === "back" ? "back" : "forward",
    });
    return {
      changed,
      element: this.activeEl,
    };
  }
  /** @internal */
  async getRouteId() {
    const active = this.activeEl;
    return active
      ? {
        id: active.tagName,
        element: active,
      }
      : undefined;
  }
  async setRoot(component, params, opts) {
    if (this.activeComponent === component) {
      return false;
    }
    // attach entering view to DOM
    const leavingEl = this.activeEl;
    const enteringEl = await attachComponent(this.delegate, this.el, component, ["wl-page", "wl-page-invisible"], params);
    this.activeComponent = component;
    this.activeEl = enteringEl;
    // commit animation
    await this.commit(enteringEl, leavingEl, opts);
    await detachComponent(this.delegate, leavingEl);
    return true;
  }
  async transition(enteringEl, leavingEl, opts = {}) {
    if (leavingEl === enteringEl) {
      return false;
    }
    // emit nav will change event
    this.wlNavWillChange.emit();
    const { el } = this;
    const animated = this.animated;
    const animationBuilder = this.animation || opts.animationBuilder;
    await transition(Object.assign({ animated,
      animationBuilder,
      enteringEl,
      leavingEl, baseEl: el, progressCallback: opts.progressAnimation
        ? (ani) => (this.ani = ani)
        : undefined }, opts));
    // emit nav changed event
    this.wlNavDidChange.emit();
    return true;
  }
  async lock() {
    const p = this.waitPromise;
    let resolve;
    this.waitPromise = new Promise((r) => (resolve = r));
    if (p !== undefined) {
      await p;
    }
    return resolve;
  }
  render() {
    return hAsync("slot", null);
  }
  get el() { return getElement(this); }
  static get watchers() { return {
    "swipeHandler": ["swipeHandlerChanged"]
  }; }
  static get style() { return routeOutletCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-router-outlet",
    "$members$": {
      "delegate": [16],
      "animated": [4],
      "animation": [16],
      "swipeHandler": [16],
      "commit": [64],
      "setRouteId": [64],
      "getRouteId": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const wlRowCss = "/*!@:host*/.sc-wl-row-h{display:flex;flex-wrap:wrap}/*!@:host([align=center])*/[align=center].sc-wl-row-h{align-items:center}/*!@:host([align=end])*/[align=end].sc-wl-row-h{align-items:flex-end}/*!@:host([align=start])*/[align=start].sc-wl-row-h{align-items:flex-start}/*!@:host([align=baseline])*/[align=baseline].sc-wl-row-h{align-items:baseline}";

class WlRow {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  render() {
    let justify = `wl-justify-content-${this.justify}`;
    let align = `wl-align-self-${this.align}`;
    let alignItems = `wl-align-items-${this.align}`;
    return (hAsync(Host, { align: this.align, class: {
        [justify]: this.justify !== undefined,
        [align]: this.align !== undefined,
        [alignItems]: this.align !== undefined,
      } }, hAsync("slot", null)));
  }
  static get style() { return wlRowCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-row",
    "$members$": {
      "align": [513],
      "justify": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["align", "align"], ["justify", "justify"]]
  }; }
}

const wlSpinnerCss = "/*!@[color=primary]*/[color=primary].sc-wl-spinner{--spinnerColor:var(--wl-color-primary, #3880ff)}/*!@[color=secondary]*/[color=secondary].sc-wl-spinner{--spinnerColor:var(--wl-color-secondary, #3dc2ff)}/*!@[color=tertiary]*/[color=tertiary].sc-wl-spinner{--spinnerColor:var(--wl-color-tertiary, #5260ff)}/*!@[color=success]*/[color=success].sc-wl-spinner{--spinnerColor:var(--wl-color-success, #2dd36f)}/*!@[color=warning]*/[color=warning].sc-wl-spinner{--spinnerColor:var(--wl-color-warning, #ffc409)}/*!@[color=danger]*/[color=danger].sc-wl-spinner{--spinnerColor:var(--wl-color-danger, #eb445a)}/*!@[color=light]*/[color=light].sc-wl-spinner{--spinnerColor:var(--wl-color-light, #f4f5f8)}/*!@[color=medium]*/[color=medium].sc-wl-spinner{--spinnerColor:var(--wl-color-medium, #92949c)}/*!@[color=dark]*/[color=dark].sc-wl-spinner{--spinnerColor:var(--wl-color-dark, #222428)}/*!@[variant=ellipsis]*/[variant=ellipsis].sc-wl-spinner{display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=ellipsis] div*/[variant=ellipsis].sc-wl-spinner div.sc-wl-spinner{position:absolute;top:calc(var(--size, 80px) / 2.424242424);width:calc(var(--size, 80px) / 6.15384615);height:calc(var(--size, 80px) / 6.15384615);border-radius:50%;background:var(--spinnerColor, #2457e6);animation-timing-function:cubic-bezier(0, 1, 1, 0)}/*!@[variant=ellipsis] div:nth-child(1)*/[variant=ellipsis].sc-wl-spinner div.sc-wl-spinner:nth-child(1){margin:auto;bottom:0;top:0;left:calc(var(--size, 80px) / 10);animation:lds-ellipsis1 0.6s infinite}/*!@[variant=ellipsis] div:nth-child(2)*/[variant=ellipsis].sc-wl-spinner div.sc-wl-spinner:nth-child(2){margin:auto;bottom:0;top:0;left:calc(var(--size, 80px) / 10);animation:lds-ellipsis2 0.6s infinite}/*!@[variant=ellipsis] div:nth-child(3)*/[variant=ellipsis].sc-wl-spinner div.sc-wl-spinner:nth-child(3){margin:auto;bottom:0;top:0;left:calc(var(--size, 80px) / 2.5);animation:lds-ellipsis2 0.6s infinite}/*!@[variant=ellipsis] div:nth-child(4)*/[variant=ellipsis].sc-wl-spinner div.sc-wl-spinner:nth-child(4){margin:auto;bottom:0;top:0;left:calc(var(--size, 80px) / 1.428571429);animation:lds-ellipsis3 0.6s infinite}@keyframes lds-ellipsis1{0%{transform:scale(0)}100%{transform:scale(1)}}@keyframes lds-ellipsis3{0%{transform:scale(1)}100%{transform:scale(0)}}@keyframes lds-ellipsis2{0%{transform:translate(0, 0)}100%{transform:translate(calc(var(--size, 40px) / 3.333333333), 0)}}/*!@[variant=ios]*/[variant=ios].sc-wl-spinner{color:var(--spinnerColor, black);display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=ios] div*/[variant=ios].sc-wl-spinner div.sc-wl-spinner{transform-origin:calc(var(--size, 80px) / 2) calc(var(--size, 80px) / 2);animation:lds-spinner 1.2s linear infinite}/*!@[variant=ios] div:after*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:after{content:\" \";display:block;position:absolute;top:calc(var(--size, 80px) / 26.66666667);left:46%;width:calc(var(--size, 80px) / 13.33333333);height:calc(var(--size, 80px) / 4.444444);border-radius:20%;background:var(--spinnerColor, #2457e6)}/*!@[variant=ios] div:nth-child(1)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(1){transform:rotate(0deg);animation-delay:-1.1s}/*!@[variant=ios] div:nth-child(2)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(2){transform:rotate(30deg);animation-delay:-1s}/*!@[variant=ios] div:nth-child(3)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(3){transform:rotate(60deg);animation-delay:-0.9s}/*!@[variant=ios] div:nth-child(4)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(4){transform:rotate(90deg);animation-delay:-0.8s}/*!@[variant=ios] div:nth-child(5)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(5){transform:rotate(120deg);animation-delay:-0.7s}/*!@[variant=ios] div:nth-child(6)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(6){transform:rotate(150deg);animation-delay:-0.6s}/*!@[variant=ios] div:nth-child(7)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(7){transform:rotate(180deg);animation-delay:-0.5s}/*!@[variant=ios] div:nth-child(8)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(8){transform:rotate(210deg);animation-delay:-0.4s}/*!@[variant=ios] div:nth-child(9)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(9){transform:rotate(240deg);animation-delay:-0.3s}/*!@[variant=ios] div:nth-child(10)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(10){transform:rotate(270deg);animation-delay:-0.2s}/*!@[variant=ios] div:nth-child(11)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(11){transform:rotate(300deg);animation-delay:-0.1s}/*!@[variant=ios] div:nth-child(12)*/[variant=ios].sc-wl-spinner div.sc-wl-spinner:nth-child(12){transform:rotate(330deg);animation-delay:0s}@keyframes lds-spinner{0%{opacity:1}100%{opacity:0}}/*!@[variant=facebook]*/[variant=facebook].sc-wl-spinner{display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=facebook] div*/[variant=facebook].sc-wl-spinner div.sc-wl-spinner{display:inline-block;position:absolute;left:0%;width:16%;background:var(--spinnerColor, #2457e6);animation:lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite}/*!@[variant=facebook] div:nth-child(1)*/[variant=facebook].sc-wl-spinner div.sc-wl-spinner:nth-child(1){left:calc(var(--size, 80px) / 10);animation-delay:-0.24s}/*!@[variant=facebook] div:nth-child(2)*/[variant=facebook].sc-wl-spinner div.sc-wl-spinner:nth-child(2){left:calc(var(--size, 80px) / 2.5);animation-delay:-0.12s}/*!@[variant=facebook] div:nth-child(3)*/[variant=facebook].sc-wl-spinner div.sc-wl-spinner:nth-child(3){left:calc(var(--size, 80px) / 1.428571429);animation-delay:0}@keyframes lds-facebook{0%{top:calc(var(--size, 80px) / 10);height:calc(var(--size, 80px) / 1.25)}50%,100%{top:calc(var(--size, 80px) / 3.333333333);height:calc(var(--size, 80px) / 2.5)}}/*!@[variant=ring]*/[variant=ring].sc-wl-spinner{display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=ring] div*/[variant=ring].sc-wl-spinner div.sc-wl-spinner{box-sizing:border-box;display:block;position:absolute;width:calc(var(--size) / 1.25);height:calc(var(--size) / 1.25);margin:calc(var(--size) / 10);border:calc(var(--size) / 10) solid transparent;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;border-color:var(--spinnerColor, #2457e6) transparent transparent transparent}/*!@[variant=ring] div:nth-child(1)*/[variant=ring].sc-wl-spinner div.sc-wl-spinner:nth-child(1){animation-delay:-0.45s}/*!@[variant=ring] div:nth-child(2)*/[variant=ring].sc-wl-spinner div.sc-wl-spinner:nth-child(2){animation-delay:-0.3s}/*!@[variant=ring] div:nth-child(3)*/[variant=ring].sc-wl-spinner div.sc-wl-spinner:nth-child(3){animation-delay:-0.15s}@keyframes lds-ring{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}/*!@[variant=ripple]*/[variant=ripple].sc-wl-spinner{display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=ripple] div*/[variant=ripple].sc-wl-spinner div.sc-wl-spinner{width:100%;height:100%;position:absolute;border:calc(var(--size, 80px) / 20) solid var(--spinnerColor, #2457e6);opacity:1;border-radius:50%;animation:lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite}/*!@[variant=ripple] div:nth-child(2)*/[variant=ripple].sc-wl-spinner div.sc-wl-spinner:nth-child(2){animation-delay:-0.5s}@keyframes lds-ripple{0%{top:calc(var(--size, 80px) / 2.222222222);left:calc(var(--size, 80px) / 2.222222222);width:0;height:0;opacity:1}100%{top:0px;left:0px;width:calc(var(--size, 80px) / 1.111111111);height:calc(var(--size, 80px) / 1.111111111);opacity:0}}/*!@[variant=loader]*/[variant=loader].sc-wl-spinner{display:inline-block;position:relative;width:var(--size, 80px);height:var(--size, 80px)}/*!@[variant=loader] div*/[variant=loader].sc-wl-spinner div.sc-wl-spinner{animation:lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;transform-origin:calc(var(--size, 80px) / 2) calc(var(--size, 80px) / 2)}/*!@[variant=loader] div:after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:after{content:\" \";display:block;position:absolute;width:calc(var(--size, 80px) / 11.42857);height:calc(var(--size, 80px) / 11.42857);border-radius:50%;background:var(--spinnerColor, blue);margin:-calc(var(--size, 80px)/20) 0 0 -calc(var(--size, 80px)/20)}/*!@[variant=loader] div:nth-child(1)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(1){animation-delay:-0.036s}/*!@[variant=loader] div:nth-child(1):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(1):after{top:calc(var(--size, 80px) / 1.269841);left:calc(var(--size, 80px) / 1.269841)}/*!@[variant=loader] div:nth-child(2)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(2){animation-delay:-0.072s}/*!@[variant=loader] div:nth-child(2):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(2):after{top:calc(var(--size, 80px) / 1.176471);left:calc(var(--size, 80px) / 1.428571)}/*!@[variant=loader] div:nth-child(3)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(3){animation-delay:-0.108s}/*!@[variant=loader] div:nth-child(3):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(3):after{top:calc(var(--size, 80px) / 1.126761);left:calc(var(--size, 80px) / 1.666667)}/*!@[variant=loader] div:nth-child(4)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(4){animation-delay:-0.144s}/*!@[variant=loader] div:nth-child(4):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(4):after{top:calc(var(--size, 80px) / 1.111111);left:calc(var(--size, 80px) / 2)}/*!@[variant=loader] div:nth-child(5)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(5){animation-delay:-0.18s}/*!@[variant=loader] div:nth-child(5):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(5):after{top:calc(var(--size, 80px) / 1.126761);left:calc(var(--size, 80px) / 2.5)}/*!@[variant=loader] div:nth-child(6)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(6){animation-delay:-0.216s}/*!@[variant=loader] div:nth-child(6):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(6):after{top:calc(var(--size, 80px) / 1.176471);left:calc(var(--size, 80px) / 3.333333)}/*!@[variant=loader] div:nth-child(7)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(7){animation-delay:-0.252s}/*!@[variant=loader] div:nth-child(7):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(7):after{top:calc(var(--size, 80px) / 1.269841);left:calc(var(--size, 80px) / 4.705882)}/*!@[variant=loader] div:nth-child(8)*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(8){animation-delay:-0.288s}/*!@[variant=loader] div:nth-child(8):after*/[variant=loader].sc-wl-spinner div.sc-wl-spinner:nth-child(8):after{top:calc(var(--size, 80px) / 1.428571);left:calc(var(--size, 80px) / 6.666667)}@keyframes lds-roller{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}";

class WlSpinner {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.variant = "ellipsis";
    this.color = "light";
    /**
     * @size defaults to 80px
     */
    this.size = "80px";
  }
  matchDivCountToVariant() {
    let loader = 8;
    let ripple = 2;
    let facebook = 3;
    let ios = 12;
    let ring = 4;
    let arr = [];
    switch (this.variant) {
      case "loader":
        return Array.apply(null, { length: loader }).map(() => {
          return hAsync("div", null);
        });
      case "ripple":
        return Array.apply(null, { length: ripple }).map(() => {
          return hAsync("div", null);
        });
      case "ring":
      case "ellipsis":
        return Array.apply(null, { length: ring }).map(() => {
          // return arr.push(<div></div>);
          return hAsync("div", null);
        });
      case "facebook":
        return Array.apply(null, { length: facebook }).map(() => {
          return hAsync("div", null);
        });
      case "ios":
        return Array.apply(null, { length: ios }).map(() => {
          return hAsync("div", null);
        });
    }
    return arr;
  }
  render() {
    const divsArray = this.matchDivCountToVariant();
    return (hAsync(Host, { style: {
        ["--size"]: `${this.size}`,
      } }, hAsync("div", {
      //@ts-ignore
      variant: this.variant, color: this.color, class: Object.assign({ "lds-roller": true }, createColorClasses(this.color))
    }, divsArray)));
  }
  static get style() { return wlSpinnerCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-spinner",
    "$members$": {
      "variant": [513],
      "color": [513],
      "size": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["variant", "variant"], ["color", "color"], ["size", "size"]]
  }; }
}

const wlStarCss = "/*!@:host div*/.sc-wl-star-h div.sc-wl-star{display:flex;flex-direction:row;justify-content:space-around;padding:0.2em 0.5em;text-align:center;width:fit-content}/*!@:host input*/.sc-wl-star-h input.sc-wl-star{display:none}/*!@:host label*/.sc-wl-star-h label.sc-wl-star{color:#d6d6d6;font-size:var(--size, 24px);cursor:pointer}/*!@:host label.star.active*/.sc-wl-star-h label.star.active.sc-wl-star{color:var(--colorActive, #f90)}/*!@:host label:hover, .star-rating label:hover ~ label*/.sc-wl-star-h label.sc-wl-star:hover,.star-rating.sc-wl-star label.sc-wl-star:hover~label.sc-wl-star{color:var(--colorActive, #f90)}";

class WlStar {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.wlChange = createEvent(this, "wlChange", 7);
    this.showBorder = false;
    this.colorActive = '#f90';
    /**
     * @size defaults to 80px
     */
    this.size = "25px";
    this.totalRating = 0;
    this.debounce = 0;
  }
  async setTotalRating(number) {
    this.totalRating = number;
  }
  valueChanged(newValue, _oldValue) {
    this.totalRating = newValue;
    this.wlChange.emit({
      totalRating: this.totalRating
    });
  }
  connectedCallback() {
    this.debounceChanged();
  }
  debounceChanged() {
    this.wlChange = debounceEvent(this.wlChange, this.debounce);
  }
  render() {
    const activeStars = {
      1: this.totalRating >= 1,
      2: this.totalRating >= 2,
      3: this.totalRating >= 3,
      4: this.totalRating >= 4,
      5: this.totalRating >= 5,
    };
    return (hAsync(Host, { style: {
        ["--size"]: `${this.size}`,
        ["--colorActive"]: `${this.colorActive}`,
      } }, hAsync("div", { class: {
        "lds-roller": true,
      }, style: {
        border: this.showBorder ? '1px solid #ccc' : ''
      } }, hAsync("label", { class: activeStars[1] ? 'star active' : 'star', htmlFor: "1-star", "aria-label": "1 Star", title: "1 Star" }, "\u2605"), hAsync("input", { style: {
        display: 'none'
      }, type: "radio", id: "1-star", name: 'rating', value: "1", onClick: () => this.setTotalRating(1), checked: activeStars[1] }), hAsync("label", { htmlFor: "2-stars", class: activeStars[2] ? 'star active' : 'star', "aria-label": "2 Stars", title: "2 Stars" }, "\u2605"), hAsync("input", { style: {
        display: 'none'
      }, type: "radio", id: "2-stars", name: 'rating', value: "2", onClick: () => this.setTotalRating(2), checked: activeStars[2] }), hAsync("label", { class: activeStars[3] ? 'star active' : 'star', htmlFor: "3-stars", "aria-label": "3 Stars", title: "3 Stars" }, "\u2605"), hAsync("input", { style: {
        display: 'none'
      }, type: "radio", id: "3-stars", name: 'rating', value: "3", onClick: () => this.setTotalRating(3), checked: activeStars[3] }), hAsync("label", { htmlFor: "4-stars", class: activeStars[4] ? 'star active' : 'star', "aria-label": "4 Stars", title: "4 Stars" }, "\u2605"), hAsync("input", { style: {
        display: 'none'
      }, type: "radio", id: "4-stars", name: 'rating', value: "4", onClick: () => this.setTotalRating(4), checked: activeStars[4] }), hAsync("label", { htmlFor: "5-stars", class: activeStars[5] ? 'star active' : 'star', "aria-label": "5 Stars", title: "5 Stars" }, "\u2605"), hAsync("input", { style: {
        display: 'none'
      }, type: "radio", id: "5-stars", name: 'rating', value: "5", onClick: () => this.setTotalRating(5), checked: activeStars[5] }))));
  }
  static get watchers() { return {
    "totalRating": ["valueChanged"],
    "debounce": ["debounceChanged"]
  }; }
  static get style() { return wlStarCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-star",
    "$members$": {
      "showBorder": [516, "show-border"],
      "colorActive": [513, "color-active"],
      "size": [513],
      "totalRating": [1538, "total-rating"],
      "debounce": [2],
      "setTotalRating": [64]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["showBorder", "show-border"], ["colorActive", "color-active"], ["size", "size"], ["totalRating", "total-rating"]]
  }; }
}

const wlTextCss = "/*!@html*/html.sc-wl-text{--wl-font-family:var(--wl-default-font)}/*!@body*/body.sc-wl-text{background:var(--wl-background-color)}/*!@body.backdrop-no-scroll*/body.backdrop-no-scroll.sc-wl-text{overflow:hidden}/*!@html.ios wl-modal.modal-card .wl-page > wl-header > wl-toolbar:first-of-type*/html.ios.sc-wl-text wl-modal.modal-card.sc-wl-text .wl-page.sc-wl-text>wl-header.sc-wl-text>wl-toolbar.sc-wl-text:first-of-type{padding-top:0px}/*!@html.ios wl-modal .wl-page*/html.ios.sc-wl-text wl-modal.sc-wl-text .wl-page.sc-wl-text{border-radius:inherit}/*!@.wl-color-primary*/.wl-color-primary.sc-wl-text{--wl-color-base:var(--wl-color-primary, #3880ff) !important;--wl-color-base-rgb:var(\n    --wl-color-primary-rgb,\n    56, 128, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-primary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-primary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-primary-shade, #3171e0) !important;--wl-color-tint:var(--wl-color-primary-tint, #4c8dff) !important}/*!@.wl-color-secondary*/.wl-color-secondary.sc-wl-text{--wl-color-base:var(--wl-color-secondary, #3dc2ff) !important;--wl-color-base-rgb:var(\n    --wl-color-secondary-rgb,\n    61, 194, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-secondary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-secondary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-secondary-shade, #36abe0) !important;--wl-color-tint:var(--wl-color-secondary-tint, #50c8ff) !important}/*!@.wl-color-tertiary*/.wl-color-tertiary.sc-wl-text{--wl-color-base:var(--wl-color-tertiary, #5260ff) !important;--wl-color-base-rgb:var(\n    --wl-color-tertiary-rgb,\n    82, 96, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-tertiary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-tertiary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #4854e0) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #6370ff) !important}/*!@.wl-color-success*/.wl-color-success.sc-wl-text{--wl-color-base:var(--wl-color-success, #2dd36f) !important;--wl-color-base-rgb:var(\n    --wl-color-success-rgb,\n    45, 211, 111\n  ) !important;--wl-color-contrast:var(\n    --wl-color-success-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-success-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-success-shade, #28ba62) !important;--wl-color-tint:var(--wl-color-success-tint, #42d77d) !important}/*!@.wl-color-warning*/.wl-color-warning.sc-wl-text{--wl-color-base:var(--wl-color-warning, #ffc409) !important;--wl-color-base-rgb:var(\n    --wl-color-warning-rgb,\n    255, 196, 9\n  ) !important;--wl-color-contrast:var(\n    --wl-color-warning-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-warning-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0ac08) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffca22) !important}/*!@.wl-color-danger*/.wl-color-danger.sc-wl-text{--wl-color-base:var(--wl-color-danger, #eb445a) !important;--wl-color-base-rgb:var(\n    --wl-color-danger-rgb,\n    235, 68, 90\n  ) !important;--wl-color-contrast:var(\n    --wl-color-danger-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-danger-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-danger-shade, #cf3c4f) !important;--wl-color-tint:var(--wl-color-danger-tint, #ed576b) !important}/*!@.wl-color-light*/.wl-color-light.sc-wl-text{--wl-color-base:var(--wl-color-light, #f4f5f8) !important;--wl-color-base-rgb:var(\n    --wl-color-light-rgb,\n    244, 245, 248\n  ) !important;--wl-color-contrast:var(\n    --wl-color-light-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-light-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-light-shade, #d7d8da) !important;--wl-color-tint:var(--wl-color-light-tint, #f5f6f9) !important}/*!@.wl-color-medium*/.wl-color-medium.sc-wl-text{--wl-color-base:var(--wl-color-medium, #92949c) !important;--wl-color-base-rgb:var(\n    --wl-color-medium-rgb,\n    146, 148, 156\n  ) !important;--wl-color-contrast:var(\n    --wl-color-medium-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-medium-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-medium-shade, #808289) !important;--wl-color-tint:var(--wl-color-medium-tint, #9d9fa6) !important}/*!@.wl-color-dark*/.wl-color-dark.sc-wl-text{--wl-color-base:var(--wl-color-dark, #222428) !important;--wl-color-base-rgb:var(\n    --wl-color-dark-rgb,\n    34, 36, 40\n  ) !important;--wl-color-contrast:var(\n    --wl-color-dark-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-dark-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-dark-shade, #1e2023) !important;--wl-color-tint:var(--wl-color-dark-tint, #383a3e) !important}/*!@.wl-page*/.wl-page.sc-wl-text{left:0;right:0;top:0;bottom:0;display:flex;position:absolute;flex-direction:column;justify-content:space-between;contain:layout size style;overflow:hidden;z-index:0}/*!@[dir] .wl-page*/[dir].sc-wl-text .wl-page.sc-wl-text{left:0;right:0}/*!@.split-pane-visible > .wl-page.split-pane-main*/.split-pane-visible.sc-wl-text>.wl-page.split-pane-main.sc-wl-text{position:relative}/*!@.wl-page-hidden,\n[hidden]*/.wl-page-hidden.sc-wl-text,[hidden].sc-wl-text{display:none !important}/*!@.wl-page-invisible*/.wl-page-invisible.sc-wl-text{opacity:0}/*!@.can-go-back > wl-header wl-back-button*/.can-go-back.sc-wl-text>wl-header.sc-wl-text wl-back-button.sc-wl-text{display:block}/*!@html.plt-ios.plt-hybrid,\nhtml.plt-ios.plt-pwa*/html.plt-ios.plt-hybrid.sc-wl-text,html.plt-ios.plt-pwa.sc-wl-text{--wl-statusbar-padding:20px}@supports (padding-top: 20px){/*!@html*/html.sc-wl-text{--wl-safe-area-top:var(--wl-statusbar-padding)}}@supports (padding-top: constant(safe-area-inset-top)){/*!@html*/html.sc-wl-text{--wl-safe-area-top:constant(safe-area-inset-top);--wl-safe-area-bottom:constant(safe-area-inset-bottom);--wl-safe-area-left:constant(safe-area-inset-left);--wl-safe-area-right:constant(safe-area-inset-right)}}@supports (padding-top: env(safe-area-inset-top)){/*!@html*/html.sc-wl-text{--wl-safe-area-top:env(safe-area-inset-top);--wl-safe-area-bottom:env(safe-area-inset-bottom);--wl-safe-area-left:env(safe-area-inset-left);--wl-safe-area-right:env(safe-area-inset-right)}}/*!@wl-card.wl-color .wl-inherit-color,\nwl-card-header.wl-color .wl-inherit-color*/wl-card.wl-color.sc-wl-text .wl-inherit-color.sc-wl-text,wl-card-header.wl-color.sc-wl-text .wl-inherit-color.sc-wl-text{color:inherit}/*!@.menu-content*/.menu-content.sc-wl-text{transform:translate3d(0,  0,  0)}/*!@[dir] .menu-content*/[dir].sc-wl-text .menu-content.sc-wl-text{transform:translate3d(0,  0,  0)}/*!@.menu-content-open*/.menu-content-open.sc-wl-text{cursor:pointer;touch-action:manipulation;pointer-events:none}/*!@audio,\ncanvas,\nprogress,\nvideo*/audio.sc-wl-text,canvas.sc-wl-text,progress.sc-wl-text,video.sc-wl-text{vertical-align:baseline}/*!@audio:not([controls])*/audio.sc-wl-text:not([controls]){display:none;height:0}/*!@b,\nstrong*/b.sc-wl-text,strong.sc-wl-text{font-weight:bold}/*!@img*/img.sc-wl-text{max-width:100%;border:0}/*!@svg:not(:root)*/svg.sc-wl-text:not(:root){overflow:hidden}/*!@figure*/figure.sc-wl-text{margin:1em 40px}/*!@hr*/hr.sc-wl-text{height:1px;border-width:0;box-sizing:content-box}/*!@pre*/pre.sc-wl-text{overflow:auto}/*!@code,\nkbd,\npre,\nsamp*/code.sc-wl-text,kbd.sc-wl-text,pre.sc-wl-text,samp.sc-wl-text{font-family:monospace, monospace;font-size:1em}/*!@label,\ninput,\nselect,\ntextarea*/label.sc-wl-text,input.sc-wl-text,select.sc-wl-text,textarea.sc-wl-text{font-family:inherit;line-height:normal}/*!@textarea*/textarea.sc-wl-text{overflow:auto;height:auto;font:inherit;color:inherit}/*!@textarea::placeholder*/textarea.sc-wl-text::placeholder{padding-left:2px}/*!@form,\ninput,\noptgroup,\nselect*/form.sc-wl-text,input.sc-wl-text,optgroup.sc-wl-text,select.sc-wl-text{margin:0;font:inherit;color:inherit}/*!@html input[type=button],\ninput[type=reset],\ninput[type=submit]*/html.sc-wl-text input[type=button].sc-wl-text,input[type=reset].sc-wl-text,input[type=submit].sc-wl-text{cursor:pointer;-webkit-appearance:button}/*!@a,\na div,\na span,\na wl-icon,\na wl-label,\nbutton,\nbutton div,\nbutton span,\nbutton wl-icon,\nbutton wl-label,\n.wl-tappable,\n[tappable],\n[tappable] div,\n[tappable] span,\n[tappable] wl-icon,\n[tappable] wl-label,\ninput,\ntextarea*/a.sc-wl-text,a.sc-wl-text div.sc-wl-text,a.sc-wl-text span.sc-wl-text,a.sc-wl-text wl-icon.sc-wl-text,a.sc-wl-text wl-label.sc-wl-text,button.sc-wl-text,button.sc-wl-text div.sc-wl-text,button.sc-wl-text span.sc-wl-text,button.sc-wl-text wl-icon.sc-wl-text,button.sc-wl-text wl-label.sc-wl-text,.wl-tappable.sc-wl-text,[tappable].sc-wl-text,[tappable].sc-wl-text div.sc-wl-text,[tappable].sc-wl-text span.sc-wl-text,[tappable].sc-wl-text wl-icon.sc-wl-text,[tappable].sc-wl-text wl-label.sc-wl-text,input.sc-wl-text,textarea.sc-wl-text{touch-action:manipulation}/*!@a wl-label,\nbutton wl-label*/a.sc-wl-text wl-label.sc-wl-text,button.sc-wl-text wl-label.sc-wl-text{pointer-events:none}/*!@button*/button.sc-wl-text{border:0;border-radius:0;font-family:inherit;font-style:inherit;font-variant:inherit;line-height:1;text-transform:none;cursor:pointer;-webkit-appearance:button}/*!@[tappable]*/[tappable].sc-wl-text{cursor:pointer}/*!@a[disabled],\nbutton[disabled],\nhtml input[disabled]*/a[disabled].sc-wl-text,button[disabled].sc-wl-text,html.sc-wl-text input[disabled].sc-wl-text{cursor:default}/*!@button::-moz-focus-inner,\ninput::-moz-focus-inner*/button.sc-wl-text::-moz-focus-inner,input.sc-wl-text::-moz-focus-inner{padding:0;border:0}/*!@input[type=checkbox],\ninput[type=radio]*/input[type=checkbox].sc-wl-text,input[type=radio].sc-wl-text{padding:0;box-sizing:border-box}/*!@input[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button*/input[type=number].sc-wl-text::-webkit-inner-spin-button,input[type=number].sc-wl-text::-webkit-outer-spin-button{height:auto}/*!@input[type=search]::-webkit-search-cancel-button,\ninput[type=search]::-webkit-search-decoration*/input[type=search].sc-wl-text::-webkit-search-cancel-button,input[type=search].sc-wl-text::-webkit-search-decoration{-webkit-appearance:none}/*!@table*/table.sc-wl-text{border-collapse:collapse;border-spacing:0}/*!@td,\nth*/td.sc-wl-text,th.sc-wl-text{padding:0}/*!@**/*.sc-wl-text{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}/*!@html*/html.sc-wl-text{width:100%;height:100%;text-size-adjust:100%}/*!@html:not(.hydrated) body*/html.sc-wl-text:not(.hydrated) body.sc-wl-text{display:none}/*!@html.plt-pwa*/html.plt-pwa.sc-wl-text{height:100vh}/*!@body*/body.sc-wl-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;text-rendering:optimizeLegibility;touch-action:manipulation;-webkit-user-drag:none;-ms-content-zooming:none;word-wrap:break-word;overscroll-behavior-y:none;text-size-adjust:none}/*!@html*/html.sc-wl-text{font-family:var(--wl-font-family)}/*!@a*/a.sc-wl-text{background-color:transparent;color:var(--wl-color-primary, #3880ff)}/*!@h1,\nh2,\nh3,\nh4,\nh5,\nh6*/h1.sc-wl-text,h2.sc-wl-text,h3.sc-wl-text,h4.sc-wl-text,h5.sc-wl-text,h6.sc-wl-text{font-weight:500;line-height:1.2}/*!@h1*/h1.sc-wl-text{font-size:26px}/*!@h2*/h2.sc-wl-text{font-size:24px}/*!@h3*/h3.sc-wl-text{font-size:22px}/*!@h4*/h4.sc-wl-text{font-size:20px}/*!@h5*/h5.sc-wl-text{font-size:18px}/*!@h6*/h6.sc-wl-text{font-size:16px}/*!@small*/small.sc-wl-text{font-size:75%}/*!@sub,\nsup*/sub.sc-wl-text,sup.sc-wl-text{position:relative;font-size:75%;line-height:0;vertical-align:baseline}/*!@sup*/sup.sc-wl-text{top:-0.5em}/*!@sub*/sub.sc-wl-text{bottom:-0.25em}/*!@.wl-no-padding*/.wl-no-padding.sc-wl-text{--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}/*!@.wl-padding*/.wl-padding.sc-wl-text{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding*/.wl-padding.sc-wl-text{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-top*/.wl-padding-top.sc-wl-text{--padding-top:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px)}/*!@.wl-padding-start*/.wl-padding-start.sc-wl-text{--padding-start:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-start*/.wl-padding-start.sc-wl-text{padding-left:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px)}}/*!@.wl-padding-end*/.wl-padding-end.sc-wl-text{--padding-end:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-end*/.wl-padding-end.sc-wl-text{padding-right:unset;-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-bottom*/.wl-padding-bottom.sc-wl-text{--padding-bottom:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-vertical*/.wl-padding-vertical.sc-wl-text{--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-text{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-text{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-no-margin*/.wl-no-margin.sc-wl-text{--margin-start:0;--margin-end:0;--margin-top:0;--margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}/*!@.wl-margin*/.wl-margin.sc-wl-text{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin*/.wl-margin.sc-wl-text{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-top*/.wl-margin-top.sc-wl-text{--margin-top:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px)}/*!@.wl-margin-start*/.wl-margin-start.sc-wl-text{--margin-start:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-start*/.wl-margin-start.sc-wl-text{margin-left:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px)}}/*!@.wl-margin-end*/.wl-margin-end.sc-wl-text{--margin-end:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-end*/.wl-margin-end.sc-wl-text{margin-right:unset;-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-bottom*/.wl-margin-bottom.sc-wl-text{--margin-bottom:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-vertical*/.wl-margin-vertical.sc-wl-text{--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-text{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-text{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-float-left*/.wl-float-left.sc-wl-text{float:left !important}/*!@[dir] .wl-float-left*/[dir].sc-wl-text .wl-float-left.sc-wl-text{float:left !important}/*!@.wl-float-right*/.wl-float-right.sc-wl-text{float:right !important}/*!@[dir] .wl-float-right*/[dir].sc-wl-text .wl-float-right.sc-wl-text{float:right !important}/*!@.wl-float-start*/.wl-float-start.sc-wl-text{float:left !important}/*!@[dir=rtl] .wl-float-start, :host-context([dir=rtl]) .wl-float-start*/[dir=rtl].sc-wl-text .wl-float-start.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-start.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-start.sc-wl-text{float:right !important}/*!@.wl-float-end*/.wl-float-end.sc-wl-text{float:right !important}/*!@[dir=rtl] .wl-float-end, :host-context([dir=rtl]) .wl-float-end*/[dir=rtl].sc-wl-text .wl-float-end.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-end.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-end.sc-wl-text{float:left !important}@media (min-width: 576px){/*!@.wl-float-sm-left*/.wl-float-sm-left.sc-wl-text{float:left !important}/*!@[dir] .wl-float-sm-left*/[dir].sc-wl-text .wl-float-sm-left.sc-wl-text{float:left !important}/*!@.wl-float-sm-right*/.wl-float-sm-right.sc-wl-text{float:right !important}/*!@[dir] .wl-float-sm-right*/[dir].sc-wl-text .wl-float-sm-right.sc-wl-text{float:right !important}/*!@.wl-float-sm-start*/.wl-float-sm-start.sc-wl-text{float:left !important}/*!@[dir=rtl] .wl-float-sm-start, :host-context([dir=rtl]) .wl-float-sm-start*/[dir=rtl].sc-wl-text .wl-float-sm-start.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-sm-start.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-sm-start.sc-wl-text{float:right !important}/*!@.wl-float-sm-end*/.wl-float-sm-end.sc-wl-text{float:right !important}/*!@[dir=rtl] .wl-float-sm-end, :host-context([dir=rtl]) .wl-float-sm-end*/[dir=rtl].sc-wl-text .wl-float-sm-end.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-sm-end.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-sm-end.sc-wl-text{float:left !important}}@media (min-width: 768px){/*!@.wl-float-md-left*/.wl-float-md-left.sc-wl-text{float:left !important}/*!@[dir] .wl-float-md-left*/[dir].sc-wl-text .wl-float-md-left.sc-wl-text{float:left !important}/*!@.wl-float-md-right*/.wl-float-md-right.sc-wl-text{float:right !important}/*!@[dir] .wl-float-md-right*/[dir].sc-wl-text .wl-float-md-right.sc-wl-text{float:right !important}/*!@.wl-float-md-start*/.wl-float-md-start.sc-wl-text{float:left !important}/*!@[dir=rtl] .wl-float-md-start, :host-context([dir=rtl]) .wl-float-md-start*/[dir=rtl].sc-wl-text .wl-float-md-start.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-md-start.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-md-start.sc-wl-text{float:right !important}/*!@.wl-float-md-end*/.wl-float-md-end.sc-wl-text{float:right !important}/*!@[dir=rtl] .wl-float-md-end, :host-context([dir=rtl]) .wl-float-md-end*/[dir=rtl].sc-wl-text .wl-float-md-end.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-md-end.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-md-end.sc-wl-text{float:left !important}}@media (min-width: 992px){/*!@.wl-float-lg-left*/.wl-float-lg-left.sc-wl-text{float:left !important}/*!@[dir] .wl-float-lg-left*/[dir].sc-wl-text .wl-float-lg-left.sc-wl-text{float:left !important}/*!@.wl-float-lg-right*/.wl-float-lg-right.sc-wl-text{float:right !important}/*!@[dir] .wl-float-lg-right*/[dir].sc-wl-text .wl-float-lg-right.sc-wl-text{float:right !important}/*!@.wl-float-lg-start*/.wl-float-lg-start.sc-wl-text{float:left !important}/*!@[dir=rtl] .wl-float-lg-start, :host-context([dir=rtl]) .wl-float-lg-start*/[dir=rtl].sc-wl-text .wl-float-lg-start.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-lg-start.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-lg-start.sc-wl-text{float:right !important}/*!@.wl-float-lg-end*/.wl-float-lg-end.sc-wl-text{float:right !important}/*!@[dir=rtl] .wl-float-lg-end, :host-context([dir=rtl]) .wl-float-lg-end*/[dir=rtl].sc-wl-text .wl-float-lg-end.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-lg-end.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-lg-end.sc-wl-text{float:left !important}}@media (min-width: 1200px){/*!@.wl-float-xl-left*/.wl-float-xl-left.sc-wl-text{float:left !important}/*!@[dir] .wl-float-xl-left*/[dir].sc-wl-text .wl-float-xl-left.sc-wl-text{float:left !important}/*!@.wl-float-xl-right*/.wl-float-xl-right.sc-wl-text{float:right !important}/*!@[dir] .wl-float-xl-right*/[dir].sc-wl-text .wl-float-xl-right.sc-wl-text{float:right !important}/*!@.wl-float-xl-start*/.wl-float-xl-start.sc-wl-text{float:left !important}/*!@[dir=rtl] .wl-float-xl-start, :host-context([dir=rtl]) .wl-float-xl-start*/[dir=rtl].sc-wl-text .wl-float-xl-start.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-xl-start.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-xl-start.sc-wl-text{float:right !important}/*!@.wl-float-xl-end*/.wl-float-xl-end.sc-wl-text{float:right !important}/*!@[dir=rtl] .wl-float-xl-end, :host-context([dir=rtl]) .wl-float-xl-end*/[dir=rtl].sc-wl-text .wl-float-xl-end.sc-wl-text,[dir=rtl].sc-wl-text-h .wl-float-xl-end.sc-wl-text,[dir=rtl] .sc-wl-text-h .wl-float-xl-end.sc-wl-text{float:left !important}}/*!@.wl-text-center*/.wl-text-center.sc-wl-text{text-align:center !important}/*!@.wl-text-justify*/.wl-text-justify.sc-wl-text{text-align:justify !important}/*!@.wl-text-start*/.wl-text-start.sc-wl-text{text-align:start !important}/*!@.wl-text-end*/.wl-text-end.sc-wl-text{text-align:end !important}/*!@.wl-text-left*/.wl-text-left.sc-wl-text{text-align:left !important}/*!@.wl-text-right*/.wl-text-right.sc-wl-text{text-align:right !important}/*!@.wl-text-nowrap*/.wl-text-nowrap.sc-wl-text{white-space:nowrap !important}/*!@.wl-text-wrap*/.wl-text-wrap.sc-wl-text{white-space:normal !important}@media (min-width: 576px){/*!@.wl-text-sm-center*/.wl-text-sm-center.sc-wl-text{text-align:center !important}/*!@.wl-text-sm-justify*/.wl-text-sm-justify.sc-wl-text{text-align:justify !important}/*!@.wl-text-sm-start*/.wl-text-sm-start.sc-wl-text{text-align:start !important}/*!@.wl-text-sm-end*/.wl-text-sm-end.sc-wl-text{text-align:end !important}/*!@.wl-text-sm-left*/.wl-text-sm-left.sc-wl-text{text-align:left !important}/*!@.wl-text-sm-right*/.wl-text-sm-right.sc-wl-text{text-align:right !important}/*!@.wl-text-sm-nowrap*/.wl-text-sm-nowrap.sc-wl-text{white-space:nowrap !important}/*!@.wl-text-sm-wrap*/.wl-text-sm-wrap.sc-wl-text{white-space:normal !important}}@media (min-width: 768px){/*!@.wl-text-md-center*/.wl-text-md-center.sc-wl-text{text-align:center !important}/*!@.wl-text-md-justify*/.wl-text-md-justify.sc-wl-text{text-align:justify !important}/*!@.wl-text-md-start*/.wl-text-md-start.sc-wl-text{text-align:start !important}/*!@.wl-text-md-end*/.wl-text-md-end.sc-wl-text{text-align:end !important}/*!@.wl-text-md-left*/.wl-text-md-left.sc-wl-text{text-align:left !important}/*!@.wl-text-md-right*/.wl-text-md-right.sc-wl-text{text-align:right !important}/*!@.wl-text-md-nowrap*/.wl-text-md-nowrap.sc-wl-text{white-space:nowrap !important}/*!@.wl-text-md-wrap*/.wl-text-md-wrap.sc-wl-text{white-space:normal !important}}@media (min-width: 992px){/*!@.wl-text-lg-center*/.wl-text-lg-center.sc-wl-text{text-align:center !important}/*!@.wl-text-lg-justify*/.wl-text-lg-justify.sc-wl-text{text-align:justify !important}/*!@.wl-text-lg-start*/.wl-text-lg-start.sc-wl-text{text-align:start !important}/*!@.wl-text-lg-end*/.wl-text-lg-end.sc-wl-text{text-align:end !important}/*!@.wl-text-lg-left*/.wl-text-lg-left.sc-wl-text{text-align:left !important}/*!@.wl-text-lg-right*/.wl-text-lg-right.sc-wl-text{text-align:right !important}/*!@.wl-text-lg-nowrap*/.wl-text-lg-nowrap.sc-wl-text{white-space:nowrap !important}/*!@.wl-text-lg-wrap*/.wl-text-lg-wrap.sc-wl-text{white-space:normal !important}}@media (min-width: 1200px){/*!@.wl-text-xl-center*/.wl-text-xl-center.sc-wl-text{text-align:center !important}/*!@.wl-text-xl-justify*/.wl-text-xl-justify.sc-wl-text{text-align:justify !important}/*!@.wl-text-xl-start*/.wl-text-xl-start.sc-wl-text{text-align:start !important}/*!@.wl-text-xl-end*/.wl-text-xl-end.sc-wl-text{text-align:end !important}/*!@.wl-text-xl-left*/.wl-text-xl-left.sc-wl-text{text-align:left !important}/*!@.wl-text-xl-right*/.wl-text-xl-right.sc-wl-text{text-align:right !important}/*!@.wl-text-xl-nowrap*/.wl-text-xl-nowrap.sc-wl-text{white-space:nowrap !important}/*!@.wl-text-xl-wrap*/.wl-text-xl-wrap.sc-wl-text{white-space:normal !important}}/*!@.wl-text-uppercase*/.wl-text-uppercase.sc-wl-text{text-transform:uppercase !important}/*!@.wl-text-lowercase*/.wl-text-lowercase.sc-wl-text{text-transform:lowercase !important}/*!@.wl-text-capitalize*/.wl-text-capitalize.sc-wl-text{text-transform:capitalize !important}@media (min-width: 576px){/*!@.wl-text-sm-uppercase*/.wl-text-sm-uppercase.sc-wl-text{text-transform:uppercase !important}/*!@.wl-text-sm-lowercase*/.wl-text-sm-lowercase.sc-wl-text{text-transform:lowercase !important}/*!@.wl-text-sm-capitalize*/.wl-text-sm-capitalize.sc-wl-text{text-transform:capitalize !important}}@media (min-width: 768px){/*!@.wl-text-md-uppercase*/.wl-text-md-uppercase.sc-wl-text{text-transform:uppercase !important}/*!@.wl-text-md-lowercase*/.wl-text-md-lowercase.sc-wl-text{text-transform:lowercase !important}/*!@.wl-text-md-capitalize*/.wl-text-md-capitalize.sc-wl-text{text-transform:capitalize !important}}@media (min-width: 992px){/*!@.wl-text-lg-uppercase*/.wl-text-lg-uppercase.sc-wl-text{text-transform:uppercase !important}/*!@.wl-text-lg-lowercase*/.wl-text-lg-lowercase.sc-wl-text{text-transform:lowercase !important}/*!@.wl-text-lg-capitalize*/.wl-text-lg-capitalize.sc-wl-text{text-transform:capitalize !important}}@media (min-width: 1200px){/*!@.wl-text-xl-uppercase*/.wl-text-xl-uppercase.sc-wl-text{text-transform:uppercase !important}/*!@.wl-text-xl-lowercase*/.wl-text-xl-lowercase.sc-wl-text{text-transform:lowercase !important}/*!@.wl-text-xl-capitalize*/.wl-text-xl-capitalize.sc-wl-text{text-transform:capitalize !important}}/*!@.wl-align-self-start*/.wl-align-self-start.sc-wl-text{align-self:flex-start !important}/*!@.wl-align-self-end*/.wl-align-self-end.sc-wl-text{align-self:flex-end !important}/*!@.wl-align-self-center*/.wl-align-self-center.sc-wl-text{align-self:center !important}/*!@.wl-align-self-stretch*/.wl-align-self-stretch.sc-wl-text{align-self:stretch !important}/*!@.wl-align-self-baseline*/.wl-align-self-baseline.sc-wl-text{align-self:baseline !important}/*!@.wl-align-self-auto*/.wl-align-self-auto.sc-wl-text{align-self:auto !important}/*!@.wl-wrap*/.wl-wrap.sc-wl-text{flex-wrap:wrap !important}/*!@.wl-nowrap*/.wl-nowrap.sc-wl-text{flex-wrap:nowrap !important}/*!@.wl-wrap-reverse*/.wl-wrap-reverse.sc-wl-text{flex-wrap:wrap-reverse !important}/*!@.wl-justify-content-start*/.wl-justify-content-start.sc-wl-text{justify-content:flex-start !important}/*!@.wl-justify-content-center*/.wl-justify-content-center.sc-wl-text{justify-content:center !important}/*!@.wl-justify-content-end*/.wl-justify-content-end.sc-wl-text{justify-content:flex-end !important}/*!@.wl-justify-content-around*/.wl-justify-content-around.sc-wl-text{justify-content:space-around !important}/*!@.wl-justify-content-between*/.wl-justify-content-between.sc-wl-text{justify-content:space-between !important}/*!@.wl-justify-content-evenly*/.wl-justify-content-evenly.sc-wl-text{justify-content:space-evenly !important}/*!@.wl-align-items-start*/.wl-align-items-start.sc-wl-text{align-items:flex-start !important}/*!@.wl-align-items-center*/.wl-align-items-center.sc-wl-text{align-items:center !important}/*!@.wl-align-items-end*/.wl-align-items-end.sc-wl-text{align-items:flex-end !important}/*!@.wl-align-items-stretch*/.wl-align-items-stretch.sc-wl-text{align-items:stretch !important}/*!@.wl-align-items-baseline*/.wl-align-items-baseline.sc-wl-text{align-items:baseline !important}/*!@.wl-hide*/.wl-hide.sc-wl-text{display:none !important}/*!@.wl-hide-up*/.wl-hide-up.sc-wl-text{display:none !important}/*!@.wl-hide-down*/.wl-hide-down.sc-wl-text{display:none !important}@media (min-width: 576px){/*!@.wl-hide-sm-up*/.wl-hide-sm-up.sc-wl-text{display:none !important}}@media (max-width: 576px){/*!@.wl-hide-sm-down*/.wl-hide-sm-down.sc-wl-text{display:none !important}}@media (min-width: 768px){/*!@.wl-hide-md-up*/.wl-hide-md-up.sc-wl-text{display:none !important}}@media (max-width: 768px){/*!@.wl-hide-md-down*/.wl-hide-md-down.sc-wl-text{display:none !important}}@media (min-width: 992px){/*!@.wl-hide-lg-up*/.wl-hide-lg-up.sc-wl-text{display:none !important}}@media (max-width: 992px){/*!@.wl-hide-lg-down*/.wl-hide-lg-down.sc-wl-text{display:none !important}}@media (min-width: 1200px){/*!@.wl-hide-xl-up*/.wl-hide-xl-up.sc-wl-text{display:none !important}}@media (max-width: 1200px){/*!@.wl-hide-xl-down*/.wl-hide-xl-down.sc-wl-text{display:none !important}}/*!@:host*/.sc-wl-text-h{color:var(--wl-color-base)}/*!@::slotted(*)*/.sc-wl-text-s>*{color:var(--wl-color-base)}";

class WlText {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.color = "light";
  }
  render() {
    return (hAsync(Host, { style: this.size
        ? {
          fontSize: this.size,
        }
        : {}, class: Object.assign({}, createColorClasses(this.color)) }, hAsync("slot", null)));
  }
  static get style() { return wlTextCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-text",
    "$members$": {
      "color": [513],
      "size": [513]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"], ["size", "size"]]
  }; }
}

const wlTitleCss = "/*!@:host*/.sc-wl-title-h{--padding-top:8px;--padding-start:8px;--padding-bottom:8px;--padding-end:8px}/*!@:host*/.sc-wl-title-h{--overflow:hidden;--box-shadow:none;display:inline-block;width:auto;color:var(--color);font-family:var(--wl-font-family, inherit);text-overflow:ellipsis;vertical-align:top;vertical-align:-webkit-baseline-middle}/*!@[color=primary]*/[color=primary].sc-wl-title{--background:var(--wl-color-primary, #3880ff);--color:var(--wl-color-primary-contrast, #fff)}/*!@[color=secondary]*/[color=secondary].sc-wl-title{--background:var(--wl-color-secondary, #3dc2ff);--color:var(--wl-color-secondary-contrast, #fff)}/*!@[color=tertiary]*/[color=tertiary].sc-wl-title{--background:var(--wl-color-tertiary, #5260ff);--color:var(--wl-color-tertiary-contrast, #fff)}/*!@[color=success]*/[color=success].sc-wl-title{--background:var(--wl-color-success, #2dd36f);--color:var(--wl-color-success-contrast, #fff)}/*!@[color=warning]*/[color=warning].sc-wl-title{--background:var(--wl-color-warning, #ffc409);--color:var(--wl-color-warning-contrast, #000)}/*!@[color=danger]*/[color=danger].sc-wl-title{--background:var(--wl-color-danger, #eb445a);--color:var(--wl-color-danger-contrast, #fff)}/*!@[color=light]*/[color=light].sc-wl-title{--background:var(--wl-color-light, #f4f5f8);--color:var(--wl-color-light-contrast, #000)}/*!@[color=medium]*/[color=medium].sc-wl-title{--background:var(--wl-color-medium, #92949c);--color:var(--wl-color-medium-contrast, #fff)}/*!@[color=dark]*/[color=dark].sc-wl-title{--background:var(--wl-color-dark, #222428);--color:var(--wl-color-dark-contrast, #fff)}/*!@[size=xl]*/[size=xl].sc-wl-title{font-size:7rem !important;--padding-top:10px;--padding-start:10px;--padding-bottom:10px;--padding-end:10px}/*!@[size=lg]*/[size=lg].sc-wl-title{font-size:5rem !important}/*!@[size=md]*/[size=md].sc-wl-title{font-size:3rem !important}/*!@[size=sm]*/[size=sm].sc-wl-title{font-size:2rem !important;--padding-top:6px;--padding-start:6px;--padding-bottom:6px;--padding-end:6px}/*!@.title-native*/.title-native.sc-wl-title{border-radius:var(--border-radius);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-indent:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;color:var(--color);display:block;position:relative;width:100%;height:100%;transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);background:var(--background);line-height:1.2;box-shadow:var(--box-shadow);contain:layout style;z-index:0;box-sizing:border-box}/*!@[dir] .title-native*/[dir].sc-wl-title .title-native.sc-wl-title{border-radius:var(--border-radius)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.title-native*/.title-native.sc-wl-title{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}/*!@.title-native::-moz-focus-inner*/.title-native.sc-wl-title::-moz-focus-inner{border:0}";

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 *
 * @slot - Content is placed between the named slots if provided without a slot.
 * @slot start - Content is placed to the left of the item text in LTR, and to the right in RTL.
 * @slot end - Content is placed to the right of the item text in LTR, and to the left in RTL.
 */
class WlTitle {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.itemStyles = new Map();
    /**
     * Contains a URL or a URL fragment that the hyperlink points to.
     * If this property is set, an anchor tag will be rendered.
     */
    this.component = "h1";
    this.size = "md";
  }
  itemStyle(ev) {
    ev.stopPropagation();
    const tagName = ev.target.tagName;
    const updatedStyles = ev.detail;
    const newStyles = {};
    const childStyles = this.itemStyles.get(tagName) || {};
    let hasStyleChange = false;
    Object.keys(updatedStyles).forEach((key) => {
      if (updatedStyles[key]) {
        const itemKey = `item-${key}`;
        if (!childStyles[itemKey]) {
          hasStyleChange = true;
        }
        newStyles[itemKey] = true;
      }
    });
    if (!hasStyleChange &&
      Object.keys(newStyles).length !== Object.keys(childStyles).length) {
      hasStyleChange = true;
    }
    if (hasStyleChange) {
      this.itemStyles.set(tagName, newStyles);
      forceUpdate(this);
    }
  }
  render() {
    const childStyles = {};
    const TagType = this.component;
    this.itemStyles.forEach((value) => {
      Object.assign(childStyles, value);
    });
    const Props = {
      color: this.color,
      size: this.size,
    };
    return (hAsync(Host, Object.assign({}, Props, { class: Object.assign(Object.assign({}, childStyles), createColorClasses(this.color)) }), hAsync(TagType, Object.assign({ class: "title-native" }, Props), hAsync("slot", { name: "start" }), hAsync("slot", null), hAsync("slot", { name: "end" }))));
  }
  static get style() { return wlTitleCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-title",
    "$members$": {
      "color": [513],
      "component": [1],
      "size": [513]
    },
    "$listeners$": [[0, "wlStyle", "itemStyle"]],
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"], ["size", "size"]]
  }; }
}

const wlTooltipCss = "/*!@html*/html.sc-wl-tooltip{--wl-font-family:var(--wl-default-font)}/*!@body*/body.sc-wl-tooltip{background:var(--wl-background-color)}/*!@body.backdrop-no-scroll*/body.backdrop-no-scroll.sc-wl-tooltip{overflow:hidden}/*!@html.ios wl-modal.modal-card .wl-page > wl-header > wl-toolbar:first-of-type*/html.ios.sc-wl-tooltip wl-modal.modal-card.sc-wl-tooltip .wl-page.sc-wl-tooltip>wl-header.sc-wl-tooltip>wl-toolbar.sc-wl-tooltip:first-of-type{padding-top:0px}/*!@html.ios wl-modal .wl-page*/html.ios.sc-wl-tooltip wl-modal.sc-wl-tooltip .wl-page.sc-wl-tooltip{border-radius:inherit}/*!@.wl-color-primary*/.wl-color-primary.sc-wl-tooltip{--wl-color-base:var(--wl-color-primary, #3880ff) !important;--wl-color-base-rgb:var(\n    --wl-color-primary-rgb,\n    56, 128, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-primary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-primary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-primary-shade, #3171e0) !important;--wl-color-tint:var(--wl-color-primary-tint, #4c8dff) !important}/*!@.wl-color-secondary*/.wl-color-secondary.sc-wl-tooltip{--wl-color-base:var(--wl-color-secondary, #3dc2ff) !important;--wl-color-base-rgb:var(\n    --wl-color-secondary-rgb,\n    61, 194, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-secondary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-secondary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-secondary-shade, #36abe0) !important;--wl-color-tint:var(--wl-color-secondary-tint, #50c8ff) !important}/*!@.wl-color-tertiary*/.wl-color-tertiary.sc-wl-tooltip{--wl-color-base:var(--wl-color-tertiary, #5260ff) !important;--wl-color-base-rgb:var(\n    --wl-color-tertiary-rgb,\n    82, 96, 255\n  ) !important;--wl-color-contrast:var(\n    --wl-color-tertiary-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-tertiary-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-tertiary-shade, #4854e0) !important;--wl-color-tint:var(--wl-color-tertiary-tint, #6370ff) !important}/*!@.wl-color-success*/.wl-color-success.sc-wl-tooltip{--wl-color-base:var(--wl-color-success, #2dd36f) !important;--wl-color-base-rgb:var(\n    --wl-color-success-rgb,\n    45, 211, 111\n  ) !important;--wl-color-contrast:var(\n    --wl-color-success-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-success-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-success-shade, #28ba62) !important;--wl-color-tint:var(--wl-color-success-tint, #42d77d) !important}/*!@.wl-color-warning*/.wl-color-warning.sc-wl-tooltip{--wl-color-base:var(--wl-color-warning, #ffc409) !important;--wl-color-base-rgb:var(\n    --wl-color-warning-rgb,\n    255, 196, 9\n  ) !important;--wl-color-contrast:var(\n    --wl-color-warning-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-warning-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-warning-shade, #e0ac08) !important;--wl-color-tint:var(--wl-color-warning-tint, #ffca22) !important}/*!@.wl-color-danger*/.wl-color-danger.sc-wl-tooltip{--wl-color-base:var(--wl-color-danger, #eb445a) !important;--wl-color-base-rgb:var(\n    --wl-color-danger-rgb,\n    235, 68, 90\n  ) !important;--wl-color-contrast:var(\n    --wl-color-danger-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-danger-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-danger-shade, #cf3c4f) !important;--wl-color-tint:var(--wl-color-danger-tint, #ed576b) !important}/*!@.wl-color-light*/.wl-color-light.sc-wl-tooltip{--wl-color-base:var(--wl-color-light, #f4f5f8) !important;--wl-color-base-rgb:var(\n    --wl-color-light-rgb,\n    244, 245, 248\n  ) !important;--wl-color-contrast:var(\n    --wl-color-light-contrast,\n    #000\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-light-contrast-rgb,\n    0, 0, 0\n  ) !important;--wl-color-shade:var(--wl-color-light-shade, #d7d8da) !important;--wl-color-tint:var(--wl-color-light-tint, #f5f6f9) !important}/*!@.wl-color-medium*/.wl-color-medium.sc-wl-tooltip{--wl-color-base:var(--wl-color-medium, #92949c) !important;--wl-color-base-rgb:var(\n    --wl-color-medium-rgb,\n    146, 148, 156\n  ) !important;--wl-color-contrast:var(\n    --wl-color-medium-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-medium-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-medium-shade, #808289) !important;--wl-color-tint:var(--wl-color-medium-tint, #9d9fa6) !important}/*!@.wl-color-dark*/.wl-color-dark.sc-wl-tooltip{--wl-color-base:var(--wl-color-dark, #222428) !important;--wl-color-base-rgb:var(\n    --wl-color-dark-rgb,\n    34, 36, 40\n  ) !important;--wl-color-contrast:var(\n    --wl-color-dark-contrast,\n    #fff\n  ) !important;--wl-color-contrast-rgb:var(\n    --wl-color-dark-contrast-rgb,\n    255, 255, 255\n  ) !important;--wl-color-shade:var(--wl-color-dark-shade, #1e2023) !important;--wl-color-tint:var(--wl-color-dark-tint, #383a3e) !important}/*!@.wl-page*/.wl-page.sc-wl-tooltip{left:0;right:0;top:0;bottom:0;display:flex;position:absolute;flex-direction:column;justify-content:space-between;contain:layout size style;overflow:hidden;z-index:0}/*!@[dir] .wl-page*/[dir].sc-wl-tooltip .wl-page.sc-wl-tooltip{left:0;right:0}/*!@.split-pane-visible > .wl-page.split-pane-main*/.split-pane-visible.sc-wl-tooltip>.wl-page.split-pane-main.sc-wl-tooltip{position:relative}/*!@.wl-page-hidden,\n[hidden]*/.wl-page-hidden.sc-wl-tooltip,[hidden].sc-wl-tooltip{display:none !important}/*!@.wl-page-invisible*/.wl-page-invisible.sc-wl-tooltip{opacity:0}/*!@.can-go-back > wl-header wl-back-button*/.can-go-back.sc-wl-tooltip>wl-header.sc-wl-tooltip wl-back-button.sc-wl-tooltip{display:block}/*!@html.plt-ios.plt-hybrid,\nhtml.plt-ios.plt-pwa*/html.plt-ios.plt-hybrid.sc-wl-tooltip,html.plt-ios.plt-pwa.sc-wl-tooltip{--wl-statusbar-padding:20px}@supports (padding-top: 20px){/*!@html*/html.sc-wl-tooltip{--wl-safe-area-top:var(--wl-statusbar-padding)}}@supports (padding-top: constant(safe-area-inset-top)){/*!@html*/html.sc-wl-tooltip{--wl-safe-area-top:constant(safe-area-inset-top);--wl-safe-area-bottom:constant(safe-area-inset-bottom);--wl-safe-area-left:constant(safe-area-inset-left);--wl-safe-area-right:constant(safe-area-inset-right)}}@supports (padding-top: env(safe-area-inset-top)){/*!@html*/html.sc-wl-tooltip{--wl-safe-area-top:env(safe-area-inset-top);--wl-safe-area-bottom:env(safe-area-inset-bottom);--wl-safe-area-left:env(safe-area-inset-left);--wl-safe-area-right:env(safe-area-inset-right)}}/*!@wl-card.wl-color .wl-inherit-color,\nwl-card-header.wl-color .wl-inherit-color*/wl-card.wl-color.sc-wl-tooltip .wl-inherit-color.sc-wl-tooltip,wl-card-header.wl-color.sc-wl-tooltip .wl-inherit-color.sc-wl-tooltip{color:inherit}/*!@.menu-content*/.menu-content.sc-wl-tooltip{transform:translate3d(0,  0,  0)}/*!@[dir] .menu-content*/[dir].sc-wl-tooltip .menu-content.sc-wl-tooltip{transform:translate3d(0,  0,  0)}/*!@.menu-content-open*/.menu-content-open.sc-wl-tooltip{cursor:pointer;touch-action:manipulation;pointer-events:none}/*!@audio,\ncanvas,\nprogress,\nvideo*/audio.sc-wl-tooltip,canvas.sc-wl-tooltip,progress.sc-wl-tooltip,video.sc-wl-tooltip{vertical-align:baseline}/*!@audio:not([controls])*/audio.sc-wl-tooltip:not([controls]){display:none;height:0}/*!@b,\nstrong*/b.sc-wl-tooltip,strong.sc-wl-tooltip{font-weight:bold}/*!@img*/img.sc-wl-tooltip{max-width:100%;border:0}/*!@svg:not(:root)*/svg.sc-wl-tooltip:not(:root){overflow:hidden}/*!@figure*/figure.sc-wl-tooltip{margin:1em 40px}/*!@hr*/hr.sc-wl-tooltip{height:1px;border-width:0;box-sizing:content-box}/*!@pre*/pre.sc-wl-tooltip{overflow:auto}/*!@code,\nkbd,\npre,\nsamp*/code.sc-wl-tooltip,kbd.sc-wl-tooltip,pre.sc-wl-tooltip,samp.sc-wl-tooltip{font-family:monospace, monospace;font-size:1em}/*!@label,\ninput,\nselect,\ntextarea*/label.sc-wl-tooltip,input.sc-wl-tooltip,select.sc-wl-tooltip,textarea.sc-wl-tooltip{font-family:inherit;line-height:normal}/*!@textarea*/textarea.sc-wl-tooltip{overflow:auto;height:auto;font:inherit;color:inherit}/*!@textarea::placeholder*/textarea.sc-wl-tooltip::placeholder{padding-left:2px}/*!@form,\ninput,\noptgroup,\nselect*/form.sc-wl-tooltip,input.sc-wl-tooltip,optgroup.sc-wl-tooltip,select.sc-wl-tooltip{margin:0;font:inherit;color:inherit}/*!@html input[type=button],\ninput[type=reset],\ninput[type=submit]*/html.sc-wl-tooltip input[type=button].sc-wl-tooltip,input[type=reset].sc-wl-tooltip,input[type=submit].sc-wl-tooltip{cursor:pointer;-webkit-appearance:button}/*!@a,\na div,\na span,\na wl-icon,\na wl-label,\nbutton,\nbutton div,\nbutton span,\nbutton wl-icon,\nbutton wl-label,\n.wl-tappable,\n[tappable],\n[tappable] div,\n[tappable] span,\n[tappable] wl-icon,\n[tappable] wl-label,\ninput,\ntextarea*/a.sc-wl-tooltip,a.sc-wl-tooltip div.sc-wl-tooltip,a.sc-wl-tooltip span.sc-wl-tooltip,a.sc-wl-tooltip wl-icon.sc-wl-tooltip,a.sc-wl-tooltip wl-label.sc-wl-tooltip,button.sc-wl-tooltip,button.sc-wl-tooltip div.sc-wl-tooltip,button.sc-wl-tooltip span.sc-wl-tooltip,button.sc-wl-tooltip wl-icon.sc-wl-tooltip,button.sc-wl-tooltip wl-label.sc-wl-tooltip,.wl-tappable.sc-wl-tooltip,[tappable].sc-wl-tooltip,[tappable].sc-wl-tooltip div.sc-wl-tooltip,[tappable].sc-wl-tooltip span.sc-wl-tooltip,[tappable].sc-wl-tooltip wl-icon.sc-wl-tooltip,[tappable].sc-wl-tooltip wl-label.sc-wl-tooltip,input.sc-wl-tooltip,textarea.sc-wl-tooltip{touch-action:manipulation}/*!@a wl-label,\nbutton wl-label*/a.sc-wl-tooltip wl-label.sc-wl-tooltip,button.sc-wl-tooltip wl-label.sc-wl-tooltip{pointer-events:none}/*!@button*/button.sc-wl-tooltip{border:0;border-radius:0;font-family:inherit;font-style:inherit;font-variant:inherit;line-height:1;text-transform:none;cursor:pointer;-webkit-appearance:button}/*!@[tappable]*/[tappable].sc-wl-tooltip{cursor:pointer}/*!@a[disabled],\nbutton[disabled],\nhtml input[disabled]*/a[disabled].sc-wl-tooltip,button[disabled].sc-wl-tooltip,html.sc-wl-tooltip input[disabled].sc-wl-tooltip{cursor:default}/*!@button::-moz-focus-inner,\ninput::-moz-focus-inner*/button.sc-wl-tooltip::-moz-focus-inner,input.sc-wl-tooltip::-moz-focus-inner{padding:0;border:0}/*!@input[type=checkbox],\ninput[type=radio]*/input[type=checkbox].sc-wl-tooltip,input[type=radio].sc-wl-tooltip{padding:0;box-sizing:border-box}/*!@input[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button*/input[type=number].sc-wl-tooltip::-webkit-inner-spin-button,input[type=number].sc-wl-tooltip::-webkit-outer-spin-button{height:auto}/*!@input[type=search]::-webkit-search-cancel-button,\ninput[type=search]::-webkit-search-decoration*/input[type=search].sc-wl-tooltip::-webkit-search-cancel-button,input[type=search].sc-wl-tooltip::-webkit-search-decoration{-webkit-appearance:none}/*!@table*/table.sc-wl-tooltip{border-collapse:collapse;border-spacing:0}/*!@td,\nth*/td.sc-wl-tooltip,th.sc-wl-tooltip{padding:0}/*!@**/*.sc-wl-tooltip{box-sizing:border-box;-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}/*!@html*/html.sc-wl-tooltip{width:100%;height:100%;text-size-adjust:100%}/*!@html:not(.hydrated) body*/html.sc-wl-tooltip:not(.hydrated) body.sc-wl-tooltip{display:none}/*!@html.plt-pwa*/html.plt-pwa.sc-wl-tooltip{height:100vh}/*!@body*/body.sc-wl-tooltip{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0;width:100%;max-width:100%;height:100%;max-height:100%;text-rendering:optimizeLegibility;touch-action:manipulation;-webkit-user-drag:none;-ms-content-zooming:none;word-wrap:break-word;overscroll-behavior-y:none;text-size-adjust:none}/*!@html*/html.sc-wl-tooltip{font-family:var(--wl-font-family)}/*!@a*/a.sc-wl-tooltip{background-color:transparent;color:var(--wl-color-primary, #3880ff)}/*!@h1,\nh2,\nh3,\nh4,\nh5,\nh6*/h1.sc-wl-tooltip,h2.sc-wl-tooltip,h3.sc-wl-tooltip,h4.sc-wl-tooltip,h5.sc-wl-tooltip,h6.sc-wl-tooltip{font-weight:500;line-height:1.2}/*!@h1*/h1.sc-wl-tooltip{font-size:26px}/*!@h2*/h2.sc-wl-tooltip{font-size:24px}/*!@h3*/h3.sc-wl-tooltip{font-size:22px}/*!@h4*/h4.sc-wl-tooltip{font-size:20px}/*!@h5*/h5.sc-wl-tooltip{font-size:18px}/*!@h6*/h6.sc-wl-tooltip{font-size:16px}/*!@small*/small.sc-wl-tooltip{font-size:75%}/*!@sub,\nsup*/sub.sc-wl-tooltip,sup.sc-wl-tooltip{position:relative;font-size:75%;line-height:0;vertical-align:baseline}/*!@sup*/sup.sc-wl-tooltip{top:-0.5em}/*!@sub*/sub.sc-wl-tooltip{bottom:-0.25em}/*!@.wl-no-padding*/.wl-no-padding.sc-wl-tooltip{--padding-start:0;--padding-end:0;--padding-top:0;--padding-bottom:0;padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}/*!@.wl-padding*/.wl-padding.sc-wl-tooltip{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding*/.wl-padding.sc-wl-tooltip{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-top*/.wl-padding-top.sc-wl-tooltip{--padding-top:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px)}/*!@.wl-padding-start*/.wl-padding-start.sc-wl-tooltip{--padding-start:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-start*/.wl-padding-start.sc-wl-tooltip{padding-left:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px)}}/*!@.wl-padding-end*/.wl-padding-end.sc-wl-tooltip{--padding-end:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-end*/.wl-padding-end.sc-wl-tooltip{padding-right:unset;-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-padding-bottom*/.wl-padding-bottom.sc-wl-tooltip{--padding-bottom:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-vertical*/.wl-padding-vertical.sc-wl-tooltip{--padding-top:var(--wl-padding, 16px);--padding-bottom:var(--wl-padding, 16px);padding-top:var(--wl-padding, 16px);padding-bottom:var(--wl-padding, 16px)}/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-tooltip{--padding-start:var(--wl-padding, 16px);--padding-end:var(--wl-padding, 16px);padding-left:var(--wl-padding, 16px);padding-right:var(--wl-padding, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-padding-horizontal*/.wl-padding-horizontal.sc-wl-tooltip{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--wl-padding, 16px);padding-inline-start:var(--wl-padding, 16px);-webkit-padding-end:var(--wl-padding, 16px);padding-inline-end:var(--wl-padding, 16px)}}/*!@.wl-no-margin*/.wl-no-margin.sc-wl-tooltip{--margin-start:0;--margin-end:0;--margin-top:0;--margin-bottom:0;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0}/*!@.wl-margin*/.wl-margin.sc-wl-tooltip{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin*/.wl-margin.sc-wl-tooltip{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-top*/.wl-margin-top.sc-wl-tooltip{--margin-top:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px)}/*!@.wl-margin-start*/.wl-margin-start.sc-wl-tooltip{--margin-start:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-start*/.wl-margin-start.sc-wl-tooltip{margin-left:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px)}}/*!@.wl-margin-end*/.wl-margin-end.sc-wl-tooltip{--margin-end:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-end*/.wl-margin-end.sc-wl-tooltip{margin-right:unset;-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-margin-bottom*/.wl-margin-bottom.sc-wl-tooltip{--margin-bottom:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-vertical*/.wl-margin-vertical.sc-wl-tooltip{--margin-top:var(--wl-margin, 16px);--margin-bottom:var(--wl-margin, 16px);margin-top:var(--wl-margin, 16px);margin-bottom:var(--wl-margin, 16px)}/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-tooltip{--margin-start:var(--wl-margin, 16px);--margin-end:var(--wl-margin, 16px);margin-left:var(--wl-margin, 16px);margin-right:var(--wl-margin, 16px)}@supports (margin-inline-start: 0) or (-webkit-margin-start: 0){/*!@.wl-margin-horizontal*/.wl-margin-horizontal.sc-wl-tooltip{margin-left:unset;margin-right:unset;-webkit-margin-start:var(--wl-margin, 16px);margin-inline-start:var(--wl-margin, 16px);-webkit-margin-end:var(--wl-margin, 16px);margin-inline-end:var(--wl-margin, 16px)}}/*!@.wl-float-left*/.wl-float-left.sc-wl-tooltip{float:left !important}/*!@[dir] .wl-float-left*/[dir].sc-wl-tooltip .wl-float-left.sc-wl-tooltip{float:left !important}/*!@.wl-float-right*/.wl-float-right.sc-wl-tooltip{float:right !important}/*!@[dir] .wl-float-right*/[dir].sc-wl-tooltip .wl-float-right.sc-wl-tooltip{float:right !important}/*!@.wl-float-start*/.wl-float-start.sc-wl-tooltip{float:left !important}/*!@[dir=rtl] .wl-float-start, :host-context([dir=rtl]) .wl-float-start*/[dir=rtl].sc-wl-tooltip .wl-float-start.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-start.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-start.sc-wl-tooltip{float:right !important}/*!@.wl-float-end*/.wl-float-end.sc-wl-tooltip{float:right !important}/*!@[dir=rtl] .wl-float-end, :host-context([dir=rtl]) .wl-float-end*/[dir=rtl].sc-wl-tooltip .wl-float-end.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-end.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-end.sc-wl-tooltip{float:left !important}@media (min-width: 576px){/*!@.wl-float-sm-left*/.wl-float-sm-left.sc-wl-tooltip{float:left !important}/*!@[dir] .wl-float-sm-left*/[dir].sc-wl-tooltip .wl-float-sm-left.sc-wl-tooltip{float:left !important}/*!@.wl-float-sm-right*/.wl-float-sm-right.sc-wl-tooltip{float:right !important}/*!@[dir] .wl-float-sm-right*/[dir].sc-wl-tooltip .wl-float-sm-right.sc-wl-tooltip{float:right !important}/*!@.wl-float-sm-start*/.wl-float-sm-start.sc-wl-tooltip{float:left !important}/*!@[dir=rtl] .wl-float-sm-start, :host-context([dir=rtl]) .wl-float-sm-start*/[dir=rtl].sc-wl-tooltip .wl-float-sm-start.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-sm-start.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-sm-start.sc-wl-tooltip{float:right !important}/*!@.wl-float-sm-end*/.wl-float-sm-end.sc-wl-tooltip{float:right !important}/*!@[dir=rtl] .wl-float-sm-end, :host-context([dir=rtl]) .wl-float-sm-end*/[dir=rtl].sc-wl-tooltip .wl-float-sm-end.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-sm-end.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-sm-end.sc-wl-tooltip{float:left !important}}@media (min-width: 768px){/*!@.wl-float-md-left*/.wl-float-md-left.sc-wl-tooltip{float:left !important}/*!@[dir] .wl-float-md-left*/[dir].sc-wl-tooltip .wl-float-md-left.sc-wl-tooltip{float:left !important}/*!@.wl-float-md-right*/.wl-float-md-right.sc-wl-tooltip{float:right !important}/*!@[dir] .wl-float-md-right*/[dir].sc-wl-tooltip .wl-float-md-right.sc-wl-tooltip{float:right !important}/*!@.wl-float-md-start*/.wl-float-md-start.sc-wl-tooltip{float:left !important}/*!@[dir=rtl] .wl-float-md-start, :host-context([dir=rtl]) .wl-float-md-start*/[dir=rtl].sc-wl-tooltip .wl-float-md-start.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-md-start.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-md-start.sc-wl-tooltip{float:right !important}/*!@.wl-float-md-end*/.wl-float-md-end.sc-wl-tooltip{float:right !important}/*!@[dir=rtl] .wl-float-md-end, :host-context([dir=rtl]) .wl-float-md-end*/[dir=rtl].sc-wl-tooltip .wl-float-md-end.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-md-end.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-md-end.sc-wl-tooltip{float:left !important}}@media (min-width: 992px){/*!@.wl-float-lg-left*/.wl-float-lg-left.sc-wl-tooltip{float:left !important}/*!@[dir] .wl-float-lg-left*/[dir].sc-wl-tooltip .wl-float-lg-left.sc-wl-tooltip{float:left !important}/*!@.wl-float-lg-right*/.wl-float-lg-right.sc-wl-tooltip{float:right !important}/*!@[dir] .wl-float-lg-right*/[dir].sc-wl-tooltip .wl-float-lg-right.sc-wl-tooltip{float:right !important}/*!@.wl-float-lg-start*/.wl-float-lg-start.sc-wl-tooltip{float:left !important}/*!@[dir=rtl] .wl-float-lg-start, :host-context([dir=rtl]) .wl-float-lg-start*/[dir=rtl].sc-wl-tooltip .wl-float-lg-start.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-lg-start.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-lg-start.sc-wl-tooltip{float:right !important}/*!@.wl-float-lg-end*/.wl-float-lg-end.sc-wl-tooltip{float:right !important}/*!@[dir=rtl] .wl-float-lg-end, :host-context([dir=rtl]) .wl-float-lg-end*/[dir=rtl].sc-wl-tooltip .wl-float-lg-end.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-lg-end.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-lg-end.sc-wl-tooltip{float:left !important}}@media (min-width: 1200px){/*!@.wl-float-xl-left*/.wl-float-xl-left.sc-wl-tooltip{float:left !important}/*!@[dir] .wl-float-xl-left*/[dir].sc-wl-tooltip .wl-float-xl-left.sc-wl-tooltip{float:left !important}/*!@.wl-float-xl-right*/.wl-float-xl-right.sc-wl-tooltip{float:right !important}/*!@[dir] .wl-float-xl-right*/[dir].sc-wl-tooltip .wl-float-xl-right.sc-wl-tooltip{float:right !important}/*!@.wl-float-xl-start*/.wl-float-xl-start.sc-wl-tooltip{float:left !important}/*!@[dir=rtl] .wl-float-xl-start, :host-context([dir=rtl]) .wl-float-xl-start*/[dir=rtl].sc-wl-tooltip .wl-float-xl-start.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-xl-start.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-xl-start.sc-wl-tooltip{float:right !important}/*!@.wl-float-xl-end*/.wl-float-xl-end.sc-wl-tooltip{float:right !important}/*!@[dir=rtl] .wl-float-xl-end, :host-context([dir=rtl]) .wl-float-xl-end*/[dir=rtl].sc-wl-tooltip .wl-float-xl-end.sc-wl-tooltip,[dir=rtl].sc-wl-tooltip-h .wl-float-xl-end.sc-wl-tooltip,[dir=rtl] .sc-wl-tooltip-h .wl-float-xl-end.sc-wl-tooltip{float:left !important}}/*!@.wl-text-center*/.wl-text-center.sc-wl-tooltip{text-align:center !important}/*!@.wl-text-justify*/.wl-text-justify.sc-wl-tooltip{text-align:justify !important}/*!@.wl-text-start*/.wl-text-start.sc-wl-tooltip{text-align:start !important}/*!@.wl-text-end*/.wl-text-end.sc-wl-tooltip{text-align:end !important}/*!@.wl-text-left*/.wl-text-left.sc-wl-tooltip{text-align:left !important}/*!@.wl-text-right*/.wl-text-right.sc-wl-tooltip{text-align:right !important}/*!@.wl-text-nowrap*/.wl-text-nowrap.sc-wl-tooltip{white-space:nowrap !important}/*!@.wl-text-wrap*/.wl-text-wrap.sc-wl-tooltip{white-space:normal !important}@media (min-width: 576px){/*!@.wl-text-sm-center*/.wl-text-sm-center.sc-wl-tooltip{text-align:center !important}/*!@.wl-text-sm-justify*/.wl-text-sm-justify.sc-wl-tooltip{text-align:justify !important}/*!@.wl-text-sm-start*/.wl-text-sm-start.sc-wl-tooltip{text-align:start !important}/*!@.wl-text-sm-end*/.wl-text-sm-end.sc-wl-tooltip{text-align:end !important}/*!@.wl-text-sm-left*/.wl-text-sm-left.sc-wl-tooltip{text-align:left !important}/*!@.wl-text-sm-right*/.wl-text-sm-right.sc-wl-tooltip{text-align:right !important}/*!@.wl-text-sm-nowrap*/.wl-text-sm-nowrap.sc-wl-tooltip{white-space:nowrap !important}/*!@.wl-text-sm-wrap*/.wl-text-sm-wrap.sc-wl-tooltip{white-space:normal !important}}@media (min-width: 768px){/*!@.wl-text-md-center*/.wl-text-md-center.sc-wl-tooltip{text-align:center !important}/*!@.wl-text-md-justify*/.wl-text-md-justify.sc-wl-tooltip{text-align:justify !important}/*!@.wl-text-md-start*/.wl-text-md-start.sc-wl-tooltip{text-align:start !important}/*!@.wl-text-md-end*/.wl-text-md-end.sc-wl-tooltip{text-align:end !important}/*!@.wl-text-md-left*/.wl-text-md-left.sc-wl-tooltip{text-align:left !important}/*!@.wl-text-md-right*/.wl-text-md-right.sc-wl-tooltip{text-align:right !important}/*!@.wl-text-md-nowrap*/.wl-text-md-nowrap.sc-wl-tooltip{white-space:nowrap !important}/*!@.wl-text-md-wrap*/.wl-text-md-wrap.sc-wl-tooltip{white-space:normal !important}}@media (min-width: 992px){/*!@.wl-text-lg-center*/.wl-text-lg-center.sc-wl-tooltip{text-align:center !important}/*!@.wl-text-lg-justify*/.wl-text-lg-justify.sc-wl-tooltip{text-align:justify !important}/*!@.wl-text-lg-start*/.wl-text-lg-start.sc-wl-tooltip{text-align:start !important}/*!@.wl-text-lg-end*/.wl-text-lg-end.sc-wl-tooltip{text-align:end !important}/*!@.wl-text-lg-left*/.wl-text-lg-left.sc-wl-tooltip{text-align:left !important}/*!@.wl-text-lg-right*/.wl-text-lg-right.sc-wl-tooltip{text-align:right !important}/*!@.wl-text-lg-nowrap*/.wl-text-lg-nowrap.sc-wl-tooltip{white-space:nowrap !important}/*!@.wl-text-lg-wrap*/.wl-text-lg-wrap.sc-wl-tooltip{white-space:normal !important}}@media (min-width: 1200px){/*!@.wl-text-xl-center*/.wl-text-xl-center.sc-wl-tooltip{text-align:center !important}/*!@.wl-text-xl-justify*/.wl-text-xl-justify.sc-wl-tooltip{text-align:justify !important}/*!@.wl-text-xl-start*/.wl-text-xl-start.sc-wl-tooltip{text-align:start !important}/*!@.wl-text-xl-end*/.wl-text-xl-end.sc-wl-tooltip{text-align:end !important}/*!@.wl-text-xl-left*/.wl-text-xl-left.sc-wl-tooltip{text-align:left !important}/*!@.wl-text-xl-right*/.wl-text-xl-right.sc-wl-tooltip{text-align:right !important}/*!@.wl-text-xl-nowrap*/.wl-text-xl-nowrap.sc-wl-tooltip{white-space:nowrap !important}/*!@.wl-text-xl-wrap*/.wl-text-xl-wrap.sc-wl-tooltip{white-space:normal !important}}/*!@.wl-text-uppercase*/.wl-text-uppercase.sc-wl-tooltip{text-transform:uppercase !important}/*!@.wl-text-lowercase*/.wl-text-lowercase.sc-wl-tooltip{text-transform:lowercase !important}/*!@.wl-text-capitalize*/.wl-text-capitalize.sc-wl-tooltip{text-transform:capitalize !important}@media (min-width: 576px){/*!@.wl-text-sm-uppercase*/.wl-text-sm-uppercase.sc-wl-tooltip{text-transform:uppercase !important}/*!@.wl-text-sm-lowercase*/.wl-text-sm-lowercase.sc-wl-tooltip{text-transform:lowercase !important}/*!@.wl-text-sm-capitalize*/.wl-text-sm-capitalize.sc-wl-tooltip{text-transform:capitalize !important}}@media (min-width: 768px){/*!@.wl-text-md-uppercase*/.wl-text-md-uppercase.sc-wl-tooltip{text-transform:uppercase !important}/*!@.wl-text-md-lowercase*/.wl-text-md-lowercase.sc-wl-tooltip{text-transform:lowercase !important}/*!@.wl-text-md-capitalize*/.wl-text-md-capitalize.sc-wl-tooltip{text-transform:capitalize !important}}@media (min-width: 992px){/*!@.wl-text-lg-uppercase*/.wl-text-lg-uppercase.sc-wl-tooltip{text-transform:uppercase !important}/*!@.wl-text-lg-lowercase*/.wl-text-lg-lowercase.sc-wl-tooltip{text-transform:lowercase !important}/*!@.wl-text-lg-capitalize*/.wl-text-lg-capitalize.sc-wl-tooltip{text-transform:capitalize !important}}@media (min-width: 1200px){/*!@.wl-text-xl-uppercase*/.wl-text-xl-uppercase.sc-wl-tooltip{text-transform:uppercase !important}/*!@.wl-text-xl-lowercase*/.wl-text-xl-lowercase.sc-wl-tooltip{text-transform:lowercase !important}/*!@.wl-text-xl-capitalize*/.wl-text-xl-capitalize.sc-wl-tooltip{text-transform:capitalize !important}}/*!@.wl-align-self-start*/.wl-align-self-start.sc-wl-tooltip{align-self:flex-start !important}/*!@.wl-align-self-end*/.wl-align-self-end.sc-wl-tooltip{align-self:flex-end !important}/*!@.wl-align-self-center*/.wl-align-self-center.sc-wl-tooltip{align-self:center !important}/*!@.wl-align-self-stretch*/.wl-align-self-stretch.sc-wl-tooltip{align-self:stretch !important}/*!@.wl-align-self-baseline*/.wl-align-self-baseline.sc-wl-tooltip{align-self:baseline !important}/*!@.wl-align-self-auto*/.wl-align-self-auto.sc-wl-tooltip{align-self:auto !important}/*!@.wl-wrap*/.wl-wrap.sc-wl-tooltip{flex-wrap:wrap !important}/*!@.wl-nowrap*/.wl-nowrap.sc-wl-tooltip{flex-wrap:nowrap !important}/*!@.wl-wrap-reverse*/.wl-wrap-reverse.sc-wl-tooltip{flex-wrap:wrap-reverse !important}/*!@.wl-justify-content-start*/.wl-justify-content-start.sc-wl-tooltip{justify-content:flex-start !important}/*!@.wl-justify-content-center*/.wl-justify-content-center.sc-wl-tooltip{justify-content:center !important}/*!@.wl-justify-content-end*/.wl-justify-content-end.sc-wl-tooltip{justify-content:flex-end !important}/*!@.wl-justify-content-around*/.wl-justify-content-around.sc-wl-tooltip{justify-content:space-around !important}/*!@.wl-justify-content-between*/.wl-justify-content-between.sc-wl-tooltip{justify-content:space-between !important}/*!@.wl-justify-content-evenly*/.wl-justify-content-evenly.sc-wl-tooltip{justify-content:space-evenly !important}/*!@.wl-align-items-start*/.wl-align-items-start.sc-wl-tooltip{align-items:flex-start !important}/*!@.wl-align-items-center*/.wl-align-items-center.sc-wl-tooltip{align-items:center !important}/*!@.wl-align-items-end*/.wl-align-items-end.sc-wl-tooltip{align-items:flex-end !important}/*!@.wl-align-items-stretch*/.wl-align-items-stretch.sc-wl-tooltip{align-items:stretch !important}/*!@.wl-align-items-baseline*/.wl-align-items-baseline.sc-wl-tooltip{align-items:baseline !important}/*!@.wl-hide*/.wl-hide.sc-wl-tooltip{display:none !important}/*!@.wl-hide-up*/.wl-hide-up.sc-wl-tooltip{display:none !important}/*!@.wl-hide-down*/.wl-hide-down.sc-wl-tooltip{display:none !important}@media (min-width: 576px){/*!@.wl-hide-sm-up*/.wl-hide-sm-up.sc-wl-tooltip{display:none !important}}@media (max-width: 576px){/*!@.wl-hide-sm-down*/.wl-hide-sm-down.sc-wl-tooltip{display:none !important}}@media (min-width: 768px){/*!@.wl-hide-md-up*/.wl-hide-md-up.sc-wl-tooltip{display:none !important}}@media (max-width: 768px){/*!@.wl-hide-md-down*/.wl-hide-md-down.sc-wl-tooltip{display:none !important}}@media (min-width: 992px){/*!@.wl-hide-lg-up*/.wl-hide-lg-up.sc-wl-tooltip{display:none !important}}@media (max-width: 992px){/*!@.wl-hide-lg-down*/.wl-hide-lg-down.sc-wl-tooltip{display:none !important}}@media (min-width: 1200px){/*!@.wl-hide-xl-up*/.wl-hide-xl-up.sc-wl-tooltip{display:none !important}}@media (max-width: 1200px){/*!@.wl-hide-xl-down*/.wl-hide-xl-down.sc-wl-tooltip{display:none !important}}/*!@:host*/.sc-wl-tooltip-h{display:inline-flex;position:relative}/*!@:host .tooltip-content*/.sc-wl-tooltip-h .tooltip-content.sc-wl-tooltip{position:absolute;bottom:125%;font-size:0.8em;border-radius:0.5em;padding:1em;transform:scale(0);transform-origin:bottom left;transition:transform 0.5s cubic-bezier(0.86, 0, 0.07, 1);z-index:9;width:var(--contentWidth, 300px);background-color:var(--wl-color-base);box-shadow:5px 5px 10px rgba(0, 0, 0, 0.1);color:var(--wl-color-contrast)}/*!@:host .tooltip-container*/.sc-wl-tooltip-h .tooltip-container.sc-wl-tooltip{display:inline-flex}/*!@:host #cancel*/.sc-wl-tooltip-h #cancel.sc-wl-tooltip{display:none;visibility:hidden}/*!@:host #alert*/.sc-wl-tooltip-h #alert.sc-wl-tooltip{display:block;visibility:visible}/*!@:host #cancel,\n:host #alert*/.sc-wl-tooltip-h #cancel.sc-wl-tooltip,.sc-wl-tooltip-h #alert.sc-wl-tooltip{cursor:pointer;width:var(--iconWidth, 1em);height:var(--iconWidth, 1em)}/*!@:host(:hover) .tooltip-content*/.sc-wl-tooltip-h:hover .tooltip-content.sc-wl-tooltip{transform:scale(1)}/*!@:host(:hover) #cancel*/.sc-wl-tooltip-h:hover #cancel.sc-wl-tooltip{display:block;visibility:visible}/*!@:host(:hover) #alert*/.sc-wl-tooltip-h:hover #alert.sc-wl-tooltip{display:none;visibility:hidden}";

class WlTooltip {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.color = "light";
    this.contentWidth = "300px";
    this.iconWidth = "1.4rem";
  }
  render() {
    return (hAsync(Host, { style: {
        ["--contentWidth"]: `${this.contentWidth}`,
        ["--iconWidth"]: `${this.iconWidth}`,
      }, class: Object.assign({}, createColorClasses(this.color)) }, hAsync("svg", { id: "cancel", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, hAsync("circle", { cx: "8", cy: "8", r: "8", fill: "var(--wl-color-base, #1F9BF5)" }), hAsync("rect", { x: "5.12854", y: "4", width: "9.57563", height: "1.59594", transform: "rotate(45 5.12854 4)", fill: "white" }), hAsync("rect", { x: "4", y: "10.771", width: "9.57563", height: "1.59594", transform: "rotate(-45 4 10.771)", fill: "white" })), hAsync("svg", { id: "alert", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, hAsync("circle", { cx: "8", cy: "8", r: "8", fill: "var(--wl-color-base, #1F9BF5)" }), hAsync("path", { d: "M7 2H9L8.5 10H7.5L7 2Z", fill: "white" }), hAsync("circle", { cx: "8", cy: "13", r: "1", fill: "white" })), hAsync("div", { class: "tooltip-content" }, this.message)));
  }
  static get style() { return wlTooltipCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "wl-tooltip",
    "$members$": {
      "color": [513],
      "message": [513],
      "contentWidth": [513, "content-width"],
      "iconWidth": [513, "icon-width"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": [["color", "color"], ["message", "message"], ["contentWidth", "content-width"], ["iconWidth", "icon-width"]]
  }; }
}

registerComponents([
  App,
  Range,
  WlAppbar,
  WlButton,
  WlCard,
  WlCol,
  WlContainer,
  WlDrawer,
  WlDrawerBody,
  WlDrawerCloseButton,
  WlDrawerContent,
  WlDrawerFooter,
  WlDrawerHeader,
  WlDrawerMenuButton,
  WlFlex,
  WlGrid,
  WlInput,
  WlItem,
  WlLabel,
  WlList,
  WlModal,
  WlRoute,
  WlRouteRedirect,
  WlRouter,
  WlRouterOutlet,
  WlRow,
  WlSpinner,
  WlStar,
  WlText,
  WlTitle,
  WlTooltip,
]);

class GestureController {
  constructor() {
    this.gestureId = 0;
    this.requestedStart = new Map();
    this.disabledGestures = new Map();
    this.disabledScroll = new Set();
  }
  /**
   * Creates a gesture delegate based on the GestureConfig passed
   */
  createGesture(config) {
    return new GestureDelegate(this, this.newID(), config.name, config.priority || 0, !!config.disableScroll);
  }
  /**
   * Creates a blocker that will block any other gesture events from firing. Set in the wl-gesture component.
   */
  createBlocker(opts = {}) {
    return new BlockerDelegate(this, this.newID(), opts.disable, !!opts.disableScroll);
  }
  start(gestureName, id, priority) {
    if (!this.canStart(gestureName)) {
      this.requestedStart.delete(id);
      return false;
    }
    this.requestedStart.set(id, priority);
    return true;
  }
  capture(gestureName, id, priority) {
    if (!this.start(gestureName, id, priority)) {
      return false;
    }
    const requestedStart = this.requestedStart;
    let maxPriority = -10000;
    requestedStart.forEach((value) => {
      maxPriority = Math.max(maxPriority, value);
    });
    if (maxPriority === priority) {
      this.capturedId = id;
      requestedStart.clear();
      const event = new CustomEvent("wlGestureCaptured", {
        detail: { gestureName },
      });
      document.dispatchEvent(event);
      return true;
    }
    requestedStart.delete(id);
    return false;
  }
  release(id) {
    this.requestedStart.delete(id);
    if (this.capturedId === id) {
      this.capturedId = undefined;
    }
  }
  disableGesture(gestureName, id) {
    let set = this.disabledGestures.get(gestureName);
    if (set === undefined) {
      set = new Set();
      this.disabledGestures.set(gestureName, set);
    }
    set.add(id);
  }
  enableGesture(gestureName, id) {
    const set = this.disabledGestures.get(gestureName);
    if (set !== undefined) {
      set.delete(id);
    }
  }
  disableScroll(id) {
    this.disabledScroll.add(id);
    if (this.disabledScroll.size === 1) {
      document.body.classList.add(BACKDROP_NO_SCROLL);
    }
  }
  enableScroll(id) {
    this.disabledScroll.delete(id);
    if (this.disabledScroll.size === 0) {
      document.body.classList.remove(BACKDROP_NO_SCROLL);
    }
  }
  canStart(gestureName) {
    if (this.capturedId !== undefined) {
      // a gesture already captured
      return false;
    }
    if (this.isDisabled(gestureName)) {
      return false;
    }
    return true;
  }
  isCaptured() {
    return this.capturedId !== undefined;
  }
  isScrollDisabled() {
    return this.disabledScroll.size > 0;
  }
  isDisabled(gestureName) {
    const disabled = this.disabledGestures.get(gestureName);
    if (disabled && disabled.size > 0) {
      return true;
    }
    return false;
  }
  newID() {
    this.gestureId++;
    return this.gestureId;
  }
}
class GestureDelegate {
  constructor(ctrl, id, name, priority, disableScroll) {
    this.id = id;
    this.name = name;
    this.disableScroll = disableScroll;
    this.priority = priority * 1000000 + id;
    this.ctrl = ctrl;
  }
  canStart() {
    if (!this.ctrl) {
      return false;
    }
    return this.ctrl.canStart(this.name);
  }
  start() {
    if (!this.ctrl) {
      return false;
    }
    return this.ctrl.start(this.name, this.id, this.priority);
  }
  capture() {
    if (!this.ctrl) {
      return false;
    }
    const captured = this.ctrl.capture(this.name, this.id, this.priority);
    if (captured && this.disableScroll) {
      this.ctrl.disableScroll(this.id);
    }
    return captured;
  }
  release() {
    if (this.ctrl) {
      this.ctrl.release(this.id);
      if (this.disableScroll) {
        this.ctrl.enableScroll(this.id);
      }
    }
  }
  destroy() {
    this.release();
    this.ctrl = undefined;
  }
}
class BlockerDelegate {
  constructor(ctrl, id, disable, disableScroll) {
    this.id = id;
    this.disable = disable;
    this.disableScroll = disableScroll;
    this.ctrl = ctrl;
  }
  block() {
    if (!this.ctrl) {
      return;
    }
    if (this.disable) {
      for (const gesture of this.disable) {
        this.ctrl.disableGesture(gesture, this.id);
      }
    }
    if (this.disableScroll) {
      this.ctrl.disableScroll(this.id);
    }
  }
  unblock() {
    if (!this.ctrl) {
      return;
    }
    if (this.disable) {
      for (const gesture of this.disable) {
        this.ctrl.enableGesture(gesture, this.id);
      }
    }
    if (this.disableScroll) {
      this.ctrl.enableScroll(this.id);
    }
  }
  destroy() {
    this.unblock();
    this.ctrl = undefined;
  }
}
const BACKDROP_NO_SCROLL = "backdrop-no-scroll";
const GESTURE_CONTROLLER = new GestureController();

const addEventListener = (el, eventName, callback, opts) => {
  // use event listener options when supported
  // otherwise it's just a boolean for the "capture" arg
  const listenerOpts = supportsPassive(el)
    ? {
      capture: !!opts.capture,
      passive: !!opts.passive,
    }
    : !!opts.capture;
  let add;
  let remove;
  if (el["__zone_symbol__addEventListener"]) {
    add = "__zone_symbol__addEventListener";
    remove = "__zone_symbol__removeEventListener";
  }
  else {
    add = "addEventListener";
    remove = "removeEventListener";
  }
  el[add](eventName, callback, listenerOpts);
  return () => {
    el[remove](eventName, callback, listenerOpts);
  };
};
const supportsPassive = (node) => {
  if (_sPassive === undefined) {
    try {
      const opts = Object.defineProperty({}, "passive", {
        get: () => {
          _sPassive = true;
        },
      });
      node.addEventListener("optsTest", () => {
        return;
      }, opts);
    }
    catch (e) {
      _sPassive = false;
    }
  }
  return !!_sPassive;
};
let _sPassive;

const MOUSE_WAIT = 2000;
const createPointerEvents = (el, pointerDown, pointerMove, pointerUp, options) => {
  let rmTouchStart;
  let rmTouchMove;
  let rmTouchEnd;
  let rmTouchCancel;
  let rmMouseStart;
  let rmMouseMove;
  let rmMouseUp;
  let lastTouchEvent = 0;
  const handleTouchStart = (ev) => {
    lastTouchEvent = Date.now() + MOUSE_WAIT;
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmTouchMove && pointerMove) {
      rmTouchMove = addEventListener(el, "touchmove", pointerMove, options);
    }
    if (!rmTouchEnd) {
      rmTouchEnd = addEventListener(el, "touchend", handleTouchEnd, options);
    }
    if (!rmTouchCancel) {
      rmTouchCancel = addEventListener(el, "touchcancel", handleTouchEnd, options);
    }
  };
  const handleMouseDown = (ev) => {
    if (lastTouchEvent > Date.now()) {
      return;
    }
    if (!pointerDown(ev)) {
      return;
    }
    if (!rmMouseMove && pointerMove) {
      rmMouseMove = addEventListener(getDocument(el), "mousemove", pointerMove, options);
    }
    if (!rmMouseUp) {
      rmMouseUp = addEventListener(getDocument(el), "mouseup", handleMouseUp, options);
    }
  };
  const handleTouchEnd = (ev) => {
    stopTouch();
    if (pointerUp) {
      pointerUp(ev);
    }
  };
  const handleMouseUp = (ev) => {
    stopMouse();
    if (pointerUp) {
      pointerUp(ev);
    }
  };
  const stopTouch = () => {
    if (rmTouchMove) {
      rmTouchMove();
    }
    if (rmTouchEnd) {
      rmTouchEnd();
    }
    if (rmTouchCancel) {
      rmTouchCancel();
    }
    rmTouchMove = rmTouchEnd = rmTouchCancel = undefined;
  };
  const stopMouse = () => {
    if (rmMouseMove) {
      rmMouseMove();
    }
    if (rmMouseUp) {
      rmMouseUp();
    }
    rmMouseMove = rmMouseUp = undefined;
  };
  const stop = () => {
    stopTouch();
    stopMouse();
  };
  const enable = (isEnabled = true) => {
    if (!isEnabled) {
      if (rmTouchStart) {
        rmTouchStart();
      }
      if (rmMouseStart) {
        rmMouseStart();
      }
      rmTouchStart = rmMouseStart = undefined;
      stop();
    }
    else {
      if (!rmTouchStart) {
        rmTouchStart = addEventListener(el, "touchstart", handleTouchStart, options);
      }
      if (!rmMouseStart) {
        rmMouseStart = addEventListener(el, "mousedown", handleMouseDown, options);
      }
    }
  };
  const destroy = () => {
    enable(false);
    pointerUp = pointerMove = pointerDown = undefined;
  };
  return {
    enable,
    stop,
    destroy,
  };
};
const getDocument = (node) => {
  return node instanceof Document ? node : node.ownerDocument;
};

const createPanRecognizer = (direction, thresh, maxAngle) => {
  const radians = maxAngle * (Math.PI / 180);
  const isDirX = direction === "x";
  const maxCosine = Math.cos(radians);
  const threshold = thresh * thresh;
  let startX = 0;
  let startY = 0;
  let dirty = false;
  let isPan = 0;
  return {
    start(x, y) {
      startX = x;
      startY = y;
      isPan = 0;
      dirty = true;
    },
    detect(x, y) {
      if (!dirty) {
        return false;
      }
      const deltaX = x - startX;
      const deltaY = y - startY;
      const distance = deltaX * deltaX + deltaY * deltaY;
      if (distance < threshold) {
        return false;
      }
      const hypotenuse = Math.sqrt(distance);
      const cosine = (isDirX ? deltaX : deltaY) / hypotenuse;
      if (cosine > maxCosine) {
        isPan = 1;
      }
      else if (cosine < -maxCosine) {
        isPan = -1;
      }
      else {
        isPan = 0;
      }
      dirty = false;
      return true;
    },
    isGesture() {
      return isPan !== 0;
    },
    getDirection() {
      return isPan;
    },
  };
};

const createGesture = (config) => {
  let hasCapturedPan = false;
  let hasStartedPan = false;
  let hasFiredStart = true;
  let isMoveQueued = false;
  const finalConfig = Object.assign({ disableScroll: false, direction: "x", gesturePriority: 0, passive: true, maxAngle: 40, threshold: 10 }, config);
  const canStart = finalConfig.canStart;
  const onWillStart = finalConfig.onWillStart;
  const onStart = finalConfig.onStart;
  const onEnd = finalConfig.onEnd;
  const notCaptured = finalConfig.notCaptured;
  const onMove = finalConfig.onMove;
  const threshold = finalConfig.threshold;
  const detail = {
    type: "pan",
    startX: 0,
    startY: 0,
    startTime: 0,
    currentX: 0,
    currentY: 0,
    velocityX: 0,
    velocityY: 0,
    deltaX: 0,
    deltaY: 0,
    currentTime: 0,
    event: undefined,
    data: undefined,
  };
  const pan = createPanRecognizer(finalConfig.direction, finalConfig.threshold, finalConfig.maxAngle);
  const gesture = GESTURE_CONTROLLER.createGesture({
    name: config.gestureName,
    priority: config.gesturePriority,
    disableScroll: config.disableScroll,
  });
  const pointerDown = (ev) => {
    const timeStamp = now(ev);
    if (hasStartedPan || !hasFiredStart) {
      return false;
    }
    updateDetail(ev, detail);
    detail.startX = detail.currentX;
    detail.startY = detail.currentY;
    detail.startTime = detail.currentTime = timeStamp;
    detail.velocityX = detail.velocityY = detail.deltaX = detail.deltaY = 0;
    detail.event = ev;
    // Check if gesture can start
    if (canStart && canStart(detail) === false) {
      return false;
    }
    // Release fallback
    gesture.release();
    // Start gesture
    if (!gesture.start()) {
      return false;
    }
    hasStartedPan = true;
    if (threshold === 0) {
      return tryToCapturePan();
    }
    pan.start(detail.startX, detail.startY);
    return true;
  };
  const pointerMove = (ev) => {
    // fast path, if gesture is currently captured
    // do minimum job to get user-land even dispatched
    if (hasCapturedPan) {
      if (!isMoveQueued && hasFiredStart) {
        isMoveQueued = true;
        calcGestureData(detail, ev);
        requestAnimationFrame(fireOnMove);
      }
      return;
    }
    // gesture is currently being detected
    calcGestureData(detail, ev);
    if (pan.detect(detail.currentX, detail.currentY)) {
      if (!pan.isGesture() || !tryToCapturePan()) {
        abortGesture();
      }
    }
  };
  const fireOnMove = () => {
    // Since fireOnMove is called inside a RAF, onEnd() might be called,
    // we must double check hasCapturedPan
    if (!hasCapturedPan) {
      return;
    }
    isMoveQueued = false;
    if (onMove) {
      onMove(detail);
    }
  };
  const tryToCapturePan = () => {
    if (gesture && !gesture.capture()) {
      return false;
    }
    hasCapturedPan = true;
    hasFiredStart = false;
    // reset start position since the real user-land event starts here
    // If the pan detector threshold is big, not resetting the start position
    // will cause a jump in the animation equal to the detector threshold.
    // the array of positions used to calculate the gesture velocity does not
    // need to be cleaned, more points in the positions array always results in a
    // more accurate value of the velocity.
    detail.startX = detail.currentX;
    detail.startY = detail.currentY;
    detail.startTime = detail.currentTime;
    if (onWillStart) {
      onWillStart(detail).then(fireOnStart);
    }
    else {
      fireOnStart();
    }
    return true;
  };
  const fireOnStart = () => {
    if (onStart) {
      onStart(detail);
    }
    hasFiredStart = true;
  };
  const reset = () => {
    hasCapturedPan = false;
    hasStartedPan = false;
    isMoveQueued = false;
    hasFiredStart = true;
    gesture.release();
  };
  // END *************************
  const pointerUp = (ev) => {
    const tmpHasCaptured = hasCapturedPan;
    const tmpHasFiredStart = hasFiredStart;
    reset();
    if (!tmpHasFiredStart) {
      return;
    }
    calcGestureData(detail, ev);
    // Try to capture press
    if (tmpHasCaptured) {
      if (onEnd) {
        onEnd(detail);
      }
      return;
    }
    // Not captured any event
    if (notCaptured) {
      notCaptured(detail);
    }
  };
  const pointerEvents = createPointerEvents(finalConfig.el, pointerDown, pointerMove, pointerUp, {
    capture: false,
  });
  const abortGesture = () => {
    reset();
    pointerEvents.stop();
    if (notCaptured) {
      notCaptured(detail);
    }
  };
  return {
    enable(enable = true) {
      if (!enable) {
        if (hasCapturedPan) {
          pointerUp(undefined);
        }
        reset();
      }
      pointerEvents.enable(enable);
    },
    destroy() {
      gesture.destroy();
      pointerEvents.destroy();
    },
  };
};
const calcGestureData = (detail, ev) => {
  if (!ev) {
    return;
  }
  const prevX = detail.currentX;
  const prevY = detail.currentY;
  const prevT = detail.currentTime;
  updateDetail(ev, detail);
  const currentX = detail.currentX;
  const currentY = detail.currentY;
  const timestamp = (detail.currentTime = now(ev));
  const timeDelta = timestamp - prevT;
  if (timeDelta > 0 && timeDelta < 100) {
    const velocityX = (currentX - prevX) / timeDelta;
    const velocityY = (currentY - prevY) / timeDelta;
    detail.velocityX = velocityX * 0.7 + detail.velocityX * 0.3;
    detail.velocityY = velocityY * 0.7 + detail.velocityY * 0.3;
  }
  detail.deltaX = currentX - detail.startX;
  detail.deltaY = currentY - detail.startY;
  detail.event = ev;
};
const updateDetail = (ev, detail) => {
  // get X coordinates for either a mouse click
  // or a touch depending on the given event
  let x = 0;
  let y = 0;
  if (ev) {
    const changedTouches = ev.changedTouches;
    if (changedTouches && changedTouches.length > 0) {
      const touch = changedTouches[0];
      x = touch.clientX;
      y = touch.clientY;
    }
    else if (ev.pageX !== undefined) {
      x = ev.pageX;
      y = ev.pageY;
    }
  }
  detail.currentX = x;
  detail.currentY = y;
};
const now = (ev) => {
  return ev.timeStamp || Date.now();
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createGesture: createGesture,
  GESTURE_CONTROLLER: GESTURE_CONTROLLER
});

/**
 * Web Animations requires hyphenated CSS properties
 * to be written in camelCase when animating
 */
const processKeyframes = (keyframes) => {
  keyframes.forEach((keyframe) => {
    for (const key in keyframe) {
      if (keyframe.hasOwnProperty(key)) {
        const value = keyframe[key];
        if (key === "easing") {
          const newKey = "animation-timing-function";
          keyframe[newKey] = value;
          delete keyframe[key];
        }
        else {
          const newKey = convertCamelCaseToHypen(key);
          if (newKey !== key) {
            keyframe[newKey] = value;
            delete keyframe[key];
          }
        }
      }
    }
  });
  return keyframes;
};
const convertCamelCaseToHypen = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
};
let animationPrefix;
const getAnimationPrefix = (el) => {
  if (animationPrefix === undefined) {
    const supportsUnprefixed = el.style.animationName !== undefined;
    const supportsWebkitPrefix = el.style.webkitAnimationName !== undefined;
    animationPrefix =
      !supportsUnprefixed && supportsWebkitPrefix ? "-webkit-" : "";
  }
  return animationPrefix;
};
const setStyleProperty = (element, propertyName, value) => {
  const prefix = propertyName.startsWith("animation")
    ? getAnimationPrefix(element)
    : "";
  element.style.setProperty(prefix + propertyName, value);
};
const removeStyleProperty = (element, propertyName) => {
  const prefix = propertyName.startsWith("animation")
    ? getAnimationPrefix(element)
    : "";
  element.style.removeProperty(prefix + propertyName);
};
const animationEnd = (el, callback) => {
  let unRegTrans;
  const opts = { passive: true };
  const unregister = () => {
    if (unRegTrans) {
      unRegTrans();
    }
  };
  const onTransitionEnd = (ev) => {
    if (el === ev.target) {
      unregister();
      callback(ev);
    }
  };
  if (el) {
    el.addEventListener("webkitAnimationEnd", onTransitionEnd, opts);
    el.addEventListener("animationend", onTransitionEnd, opts);
    unRegTrans = () => {
      el.removeEventListener("webkitAnimationEnd", onTransitionEnd, opts);
      el.removeEventListener("animationend", onTransitionEnd, opts);
    };
  }
  return unregister;
};
const generateKeyframeRules = (keyframes = []) => {
  return keyframes
    .map((keyframe) => {
    const offset = keyframe.offset;
    const frameString = [];
    for (const property in keyframe) {
      if (keyframe.hasOwnProperty(property) && property !== "offset") {
        frameString.push(`${property}: ${keyframe[property]};`);
      }
    }
    return `${offset * 100}% { ${frameString.join(" ")} }`;
  })
    .join(" ");
};
const keyframeIds = [];
const generateKeyframeName = (keyframeRules) => {
  let index = keyframeIds.indexOf(keyframeRules);
  if (index < 0) {
    index = keyframeIds.push(keyframeRules) - 1;
  }
  return `wl-animation-${index}`;
};
const getStyleContainer = (element) => {
  const rootNode = element.getRootNode();
  return rootNode.head || rootNode;
};
const createKeyframeStylesheet = (keyframeName, keyframeRules, element) => {
  const styleContainer = getStyleContainer(element);
  const keyframePrefix = getAnimationPrefix(element);
  const existingStylesheet = styleContainer.querySelector("#" + keyframeName);
  if (existingStylesheet) {
    return existingStylesheet;
  }
  const stylesheet = (element.ownerDocument || document).createElement("style");
  stylesheet.id = keyframeName;
  stylesheet.textContent = `@${keyframePrefix}keyframes ${keyframeName} { ${keyframeRules} } @${keyframePrefix}keyframes ${keyframeName}-alt { ${keyframeRules} }`;
  styleContainer.appendChild(stylesheet);
  return stylesheet;
};
const addClassToArray = (classes = [], className) => {
  if (className !== undefined) {
    const classNameToAppend = Array.isArray(className)
      ? className
      : [className];
    return [...classes, ...classNameToAppend];
  }
  return classes;
};

const createAnimation = (animationId) => {
  let _delay;
  let _duration;
  let _easing;
  let _iterations;
  let _fill;
  let _direction;
  let _keyframes = [];
  let beforeAddClasses = [];
  let beforeRemoveClasses = [];
  let initialized = false;
  let parentAnimation;
  let beforeStylesValue = {};
  let afterAddClasses = [];
  let afterRemoveClasses = [];
  let afterStylesValue = {};
  let numAnimationsRunning = 0;
  let shouldForceLinearEasing = false;
  let shouldForceSyncPlayback = false;
  let cssAnimationsTimerFallback;
  let forceDirectionValue;
  let forceDurationValue;
  let forceDelayValue;
  let willComplete = true;
  let finished = false;
  let shouldCalculateNumAnimations = true;
  let keyframeName;
  let ani;
  const id = animationId;
  const onFinishCallbacks = [];
  const onFinishOneTimeCallbacks = [];
  const elements = [];
  const childAnimations = [];
  const stylesheets = [];
  const _beforeAddReadFunctions = [];
  const _beforeAddWriteFunctions = [];
  const _afterAddReadFunctions = [];
  const _afterAddWriteFunctions = [];
  const webAnimations = [];
  const supportsAnimationEffect = typeof AnimationEffect === "function" ||
    typeof window.AnimationEffect === "function";
  const supportsWebAnimations = typeof Element === "function" &&
    typeof Element.prototype.animate === "function" &&
    supportsAnimationEffect;
  const ANIMATION_END_FALLBACK_PADDING_MS = 100;
  const getWebAnimations = () => {
    return webAnimations;
  };
  const destroy = (clearStyleSheets) => {
    childAnimations.forEach((childAnimation) => {
      childAnimation.destroy(clearStyleSheets);
    });
    cleanUp(clearStyleSheets);
    elements.length = 0;
    childAnimations.length = 0;
    _keyframes.length = 0;
    clearOnFinish();
    initialized = false;
    shouldCalculateNumAnimations = true;
    return ani;
  };
  /**
   * Cancels any Web Animations, removes
   * any animation properties from the
   * animation's elements, and removes the
   * animation's stylesheets from the DOM.
   */
  const cleanUp = (clearStyleSheets) => {
    cleanUpElements();
    if (clearStyleSheets) {
      cleanUpStyleSheets();
    }
  };
  const resetFlags = () => {
    shouldForceLinearEasing = false;
    shouldForceSyncPlayback = false;
    shouldCalculateNumAnimations = true;
    forceDirectionValue = undefined;
    forceDurationValue = undefined;
    forceDelayValue = undefined;
    numAnimationsRunning = 0;
    finished = false;
    willComplete = true;
  };
  const onFinish = (callback, opts) => {
    const callbacks = opts && opts.oneTimeCallback
      ? onFinishOneTimeCallbacks
      : onFinishCallbacks;
    callbacks.push({ c: callback, o: opts });
    return ani;
  };
  const clearOnFinish = () => {
    onFinishCallbacks.length = 0;
    onFinishOneTimeCallbacks.length = 0;
    return ani;
  };
  /**
   * Cancels any Web Animations and removes
   * any animation properties from the
   * the animation's elements.
   */
  const cleanUpElements = () => {
    if (supportsWebAnimations) {
      webAnimations.forEach((animation) => {
        animation.cancel();
      });
      webAnimations.length = 0;
    }
    else {
      const elementsArray = elements.slice();
      raf(() => {
        elementsArray.forEach((element) => {
          removeStyleProperty(element, "animation-name");
          removeStyleProperty(element, "animation-duration");
          removeStyleProperty(element, "animation-timing-function");
          removeStyleProperty(element, "animation-iteration-count");
          removeStyleProperty(element, "animation-delay");
          removeStyleProperty(element, "animation-play-state");
          removeStyleProperty(element, "animation-fill-mode");
          removeStyleProperty(element, "animation-direction");
        });
      });
    }
  };
  /**
   * Removes the animation's stylesheets
   * from the DOM.
   */
  const cleanUpStyleSheets = () => {
    stylesheets.forEach((stylesheet) => {
      /**
       * When sharing stylesheets, it's possible
       * for another animation to have already
       * cleaned up a particular stylesheet
       */
      if (stylesheet && stylesheet.parentNode) {
        stylesheet.parentNode.removeChild(stylesheet);
      }
    });
    stylesheets.length = 0;
  };
  const beforeAddRead = (readFn) => {
    _beforeAddReadFunctions.push(readFn);
    return ani;
  };
  const beforeAddWrite = (writeFn) => {
    _beforeAddWriteFunctions.push(writeFn);
    return ani;
  };
  const afterAddRead = (readFn) => {
    _afterAddReadFunctions.push(readFn);
    return ani;
  };
  const afterAddWrite = (writeFn) => {
    _afterAddWriteFunctions.push(writeFn);
    return ani;
  };
  const beforeAddClass = (className) => {
    beforeAddClasses = addClassToArray(beforeAddClasses, className);
    return ani;
  };
  const beforeRemoveClass = (className) => {
    beforeRemoveClasses = addClassToArray(beforeRemoveClasses, className);
    return ani;
  };
  /**
   * Set CSS inline styles to the animation's
   * elements before the animation begins.
   */
  const beforeStyles = (styles = {}) => {
    beforeStylesValue = styles;
    return ani;
  };
  /**
   * Clear CSS inline styles from the animation's
   * elements before the animation begins.
   */
  const beforeClearStyles = (propertyNames = []) => {
    for (const property of propertyNames) {
      beforeStylesValue[property] = "";
    }
    return ani;
  };
  const afterAddClass = (className) => {
    afterAddClasses = addClassToArray(afterAddClasses, className);
    return ani;
  };
  const afterRemoveClass = (className) => {
    afterRemoveClasses = addClassToArray(afterRemoveClasses, className);
    return ani;
  };
  const afterStyles = (styles = {}) => {
    afterStylesValue = styles;
    return ani;
  };
  const afterClearStyles = (propertyNames = []) => {
    for (const property of propertyNames) {
      afterStylesValue[property] = "";
    }
    return ani;
  };
  const getFill = () => {
    if (_fill !== undefined) {
      return _fill;
    }
    if (parentAnimation) {
      return parentAnimation.getFill();
    }
    return "both";
  };
  const getDirection = () => {
    if (forceDirectionValue !== undefined) {
      return forceDirectionValue;
    }
    if (_direction !== undefined) {
      return _direction;
    }
    if (parentAnimation) {
      return parentAnimation.getDirection();
    }
    return "normal";
  };
  const getEasing = () => {
    if (shouldForceLinearEasing) {
      return "linear";
    }
    if (_easing !== undefined) {
      return _easing;
    }
    if (parentAnimation) {
      return parentAnimation.getEasing();
    }
    return "linear";
  };
  const getDuration = () => {
    if (shouldForceSyncPlayback) {
      return 0;
    }
    if (forceDurationValue !== undefined) {
      return forceDurationValue;
    }
    if (_duration !== undefined) {
      return _duration;
    }
    if (parentAnimation) {
      return parentAnimation.getDuration();
    }
    return 0;
  };
  const getIterations = () => {
    if (_iterations !== undefined) {
      return _iterations;
    }
    if (parentAnimation) {
      return parentAnimation.getIterations();
    }
    return 1;
  };
  const getDelay = () => {
    if (forceDelayValue !== undefined) {
      return forceDelayValue;
    }
    if (_delay !== undefined) {
      return _delay;
    }
    if (parentAnimation) {
      return parentAnimation.getDelay();
    }
    return 0;
  };
  const getKeyframes = () => {
    return _keyframes;
  };
  const direction = (animationDirection) => {
    _direction = animationDirection;
    update(true);
    return ani;
  };
  const fill = (animationFill) => {
    _fill = animationFill;
    update(true);
    return ani;
  };
  const delay = (animationDelay) => {
    _delay = animationDelay;
    update(true);
    return ani;
  };
  const easing = (animationEasing) => {
    _easing = animationEasing;
    update(true);
    return ani;
  };
  const duration = (animationDuration) => {
    /**
     * CSS Animation Durations of 0ms work fine on Chrome
     * but do not run on Safari, so force it to 1ms to
     * get it to run on both platforms.
     */
    if (!supportsWebAnimations && animationDuration === 0) {
      animationDuration = 1;
    }
    _duration = animationDuration;
    update(true);
    return ani;
  };
  const iterations = (animationIterations) => {
    _iterations = animationIterations;
    update(true);
    return ani;
  };
  const parent = (animation) => {
    parentAnimation = animation;
    return ani;
  };
  const addElement = (el) => {
    if (el != null) {
      if (el.nodeType === 1) {
        elements.push(el);
      }
      else if (el.length >= 0) {
        for (let i = 0; i < el.length; i++) {
          elements.push(el[i]);
        }
      }
      else {
        console.error("Invalid addElement value");
      }
    }
    return ani;
  };
  const addAnimation = (animationToAdd) => {
    if (animationToAdd != null) {
      if (Array.isArray(animationToAdd)) {
        for (const animation of animationToAdd) {
          animation.parent(ani);
          childAnimations.push(animation);
        }
      }
      else {
        animationToAdd.parent(ani);
        childAnimations.push(animationToAdd);
      }
    }
    return ani;
  };
  const keyframes = (keyframeValues) => {
    _keyframes = keyframeValues;
    return ani;
  };
  /**
   * Run all "before" animation hooks.
   */
  const beforeAnimation = () => {
    // Runs all before read callbacks
    _beforeAddReadFunctions.forEach((callback) => callback());
    // Runs all before write callbacks
    _beforeAddWriteFunctions.forEach((callback) => callback());
    // Updates styles and classes before animation runs
    const addClasses = beforeAddClasses;
    const removeClasses = beforeRemoveClasses;
    const styles = beforeStylesValue;
    elements.forEach((el) => {
      const elementClassList = el.classList;
      addClasses.forEach((c) => elementClassList.add(c));
      removeClasses.forEach((c) => elementClassList.remove(c));
      for (const property in styles) {
        if (styles.hasOwnProperty(property)) {
          setStyleProperty(el, property, styles[property]);
        }
      }
    });
  };
  /**
   * Run all "after" animation hooks.
   */
  const afterAnimation = () => {
    clearCSSAnimationsTimeout();
    // Runs all after read callbacks
    _afterAddReadFunctions.forEach((callback) => callback());
    // Runs all after write callbacks
    _afterAddWriteFunctions.forEach((callback) => callback());
    // Updates styles and classes before animation ends
    const currentStep = willComplete ? 1 : 0;
    const addClasses = afterAddClasses;
    const removeClasses = afterRemoveClasses;
    const styles = afterStylesValue;
    elements.forEach((el) => {
      const elementClassList = el.classList;
      addClasses.forEach((c) => elementClassList.add(c));
      removeClasses.forEach((c) => elementClassList.remove(c));
      for (const property in styles) {
        if (styles.hasOwnProperty(property)) {
          setStyleProperty(el, property, styles[property]);
        }
      }
    });
    onFinishCallbacks.forEach((onFinishCallback) => {
      return onFinishCallback.c(currentStep, ani);
    });
    onFinishOneTimeCallbacks.forEach((onFinishCallback) => {
      return onFinishCallback.c(currentStep, ani);
    });
    onFinishOneTimeCallbacks.length = 0;
    shouldCalculateNumAnimations = true;
    if (willComplete) {
      finished = true;
    }
    willComplete = true;
  };
  const animationFinish = () => {
    if (numAnimationsRunning === 0) {
      return;
    }
    numAnimationsRunning--;
    if (numAnimationsRunning === 0) {
      afterAnimation();
      if (parentAnimation) {
        parentAnimation.animationFinish();
      }
    }
  };
  const initializeCSSAnimation = (toggleAnimationName = true) => {
    cleanUpStyleSheets();
    const processedKeyframes = processKeyframes(_keyframes);
    elements.forEach((element) => {
      if (processedKeyframes.length > 0) {
        const keyframeRules = generateKeyframeRules(processedKeyframes);
        keyframeName =
          animationId !== undefined
            ? animationId
            : generateKeyframeName(keyframeRules);
        const stylesheet = createKeyframeStylesheet(keyframeName, keyframeRules, element);
        stylesheets.push(stylesheet);
        setStyleProperty(element, "animation-duration", `${getDuration()}ms`);
        setStyleProperty(element, "animation-timing-function", getEasing());
        setStyleProperty(element, "animation-delay", `${getDelay()}ms`);
        setStyleProperty(element, "animation-fill-mode", getFill());
        setStyleProperty(element, "animation-direction", getDirection());
        const iterationsCount = getIterations() === Infinity
          ? "infinite"
          : getIterations().toString();
        setStyleProperty(element, "animation-iteration-count", iterationsCount);
        setStyleProperty(element, "animation-play-state", "paused");
        if (toggleAnimationName) {
          setStyleProperty(element, "animation-name", `${stylesheet.id}-alt`);
        }
        raf(() => {
          setStyleProperty(element, "animation-name", stylesheet.id || null);
        });
      }
    });
  };
  const initializeWebAnimation = () => {
    elements.forEach((element) => {
      const animation = element.animate(_keyframes, {
        id,
        delay: getDelay(),
        duration: getDuration(),
        easing: getEasing(),
        iterations: getIterations(),
        fill: getFill(),
        direction: getDirection(),
      });
      animation.pause();
      webAnimations.push(animation);
    });
    if (webAnimations.length > 0) {
      webAnimations[0].onfinish = () => {
        animationFinish();
      };
    }
  };
  const initializeAnimation = (toggleAnimationName = true) => {
    beforeAnimation();
    if (_keyframes.length > 0) {
      if (supportsWebAnimations) {
        initializeWebAnimation();
      }
      else {
        initializeCSSAnimation(toggleAnimationName);
      }
    }
    initialized = true;
  };
  const setAnimationStep = (step) => {
    step = Math.min(Math.max(step, 0), 0.9999);
    if (supportsWebAnimations) {
      webAnimations.forEach((animation) => {
        animation.currentTime =
          animation.effect.getComputedTiming().delay + getDuration() * step;
        animation.pause();
      });
    }
    else {
      const animationDuration = `-${getDuration() * step}ms`;
      elements.forEach((element) => {
        if (_keyframes.length > 0) {
          setStyleProperty(element, "animation-delay", animationDuration);
          setStyleProperty(element, "animation-play-state", "paused");
        }
      });
    }
  };
  const updateWebAnimation = (step) => {
    webAnimations.forEach((animation) => {
      animation.effect.updateTiming({
        delay: getDelay(),
        duration: getDuration(),
        easing: getEasing(),
        iterations: getIterations(),
        fill: getFill(),
        direction: getDirection(),
      });
    });
    if (step !== undefined) {
      setAnimationStep(step);
    }
  };
  const updateCSSAnimation = (toggleAnimationName = true, step) => {
    raf(() => {
      elements.forEach((element) => {
        setStyleProperty(element, "animation-name", keyframeName || null);
        setStyleProperty(element, "animation-duration", `${getDuration()}ms`);
        setStyleProperty(element, "animation-timing-function", getEasing());
        setStyleProperty(element, "animation-delay", step !== undefined ? `-${step * getDuration()}ms` : `${getDelay()}ms`);
        setStyleProperty(element, "animation-fill-mode", getFill() || null);
        setStyleProperty(element, "animation-direction", getDirection() || null);
        const iterationsCount = getIterations() === Infinity
          ? "infinite"
          : getIterations().toString();
        setStyleProperty(element, "animation-iteration-count", iterationsCount);
        if (toggleAnimationName) {
          setStyleProperty(element, "animation-name", `${keyframeName}-alt`);
        }
        raf(() => {
          setStyleProperty(element, "animation-name", keyframeName || null);
        });
      });
    });
  };
  const update = (deep = false, toggleAnimationName = true, step) => {
    if (deep) {
      childAnimations.forEach((animation) => {
        animation.update(deep, toggleAnimationName, step);
      });
    }
    if (supportsWebAnimations) {
      updateWebAnimation(step);
    }
    else {
      updateCSSAnimation(toggleAnimationName, step);
    }
    return ani;
  };
  const progressStart = (forceLinearEasing = false, step) => {
    childAnimations.forEach((animation) => {
      animation.progressStart(forceLinearEasing, step);
    });
    pauseAnimation();
    shouldForceLinearEasing = forceLinearEasing;
    if (!initialized) {
      initializeAnimation();
    }
    else {
      update(false, true, step);
    }
    return ani;
  };
  const progressStep = (step) => {
    childAnimations.forEach((animation) => {
      animation.progressStep(step);
    });
    setAnimationStep(step);
    return ani;
  };
  const progressEnd = (playTo, step, dur) => {
    shouldForceLinearEasing = false;
    childAnimations.forEach((animation) => {
      animation.progressEnd(playTo, step, dur);
    });
    if (dur !== undefined) {
      forceDurationValue = dur;
    }
    finished = false;
    // tslint:disable-next-line: strict-boolean-conditions
    willComplete = true;
    if (playTo === 0) {
      forceDirectionValue = getDirection() === "reverse" ? "normal" : "reverse";
      if (forceDirectionValue === "reverse") {
        willComplete = false;
      }
      if (supportsWebAnimations) {
        update();
        setAnimationStep(1 - step);
      }
      else {
        forceDelayValue = (1 - step) * getDuration() * -1;
        update(false, false);
      }
    }
    else if (playTo === 1) {
      if (supportsWebAnimations) {
        update();
        setAnimationStep(step);
      }
      else {
        forceDelayValue = step * getDuration() * -1;
        update(false, false);
      }
    }
    if (playTo !== undefined) {
      onFinish(() => {
        forceDurationValue = undefined;
        forceDirectionValue = undefined;
        forceDelayValue = undefined;
      }, {
        oneTimeCallback: true,
      });
      if (!parentAnimation) {
        play();
      }
    }
    return ani;
  };
  const pauseAnimation = () => {
    if (initialized) {
      if (supportsWebAnimations) {
        webAnimations.forEach((animation) => {
          animation.pause();
        });
      }
      else {
        elements.forEach((element) => {
          setStyleProperty(element, "animation-play-state", "paused");
        });
      }
    }
  };
  const pause = () => {
    childAnimations.forEach((animation) => {
      animation.pause();
    });
    pauseAnimation();
    return ani;
  };
  const onAnimationEndFallback = () => {
    cssAnimationsTimerFallback = undefined;
    animationFinish();
  };
  const clearCSSAnimationsTimeout = () => {
    if (cssAnimationsTimerFallback) {
      clearTimeout(cssAnimationsTimerFallback);
    }
  };
  const playCSSAnimations = () => {
    clearCSSAnimationsTimeout();
    raf(() => {
      elements.forEach((element) => {
        if (_keyframes.length > 0) {
          setStyleProperty(element, "animation-play-state", "running");
        }
      });
    });
    if (_keyframes.length === 0 || elements.length === 0) {
      animationFinish();
    }
    else {
      /**
       * This is a catchall in the event that a CSS Animation did not finish.
       * The Web Animations API has mechanisms in place for preventing this.
       * CSS Animations will not fire an `animationend` event
       * for elements with `display: none`. The Web Animations API
       * accounts for this, but using raw CSS Animations requires
       * this workaround.
       */
      const animationDelay = getDelay() || 0;
      const animationDuration = getDuration() || 0;
      const animationIterations = getIterations() || 1;
      // No need to set a timeout when animation has infinite iterations
      if (isFinite(animationIterations)) {
        cssAnimationsTimerFallback = setTimeout(onAnimationEndFallback, animationDelay +
          animationDuration * animationIterations +
          ANIMATION_END_FALLBACK_PADDING_MS);
      }
      animationEnd(elements[0], () => {
        clearCSSAnimationsTimeout();
        /**
         * Ensure that clean up
         * is always done a frame
         * before the onFinish handlers
         * are fired. Otherwise, there
         * may be flickering if a new
         * animation is started on the same
         * element too quickly
         *
         * TODO: Is there a cleaner way to do this?
         */
        raf(() => {
          clearCSSAnimationPlayState();
          raf(animationFinish);
        });
      });
    }
  };
  const clearCSSAnimationPlayState = () => {
    elements.forEach((element) => {
      removeStyleProperty(element, "animation-duration");
      removeStyleProperty(element, "animation-delay");
      removeStyleProperty(element, "animation-play-state");
    });
  };
  const playWebAnimations = () => {
    webAnimations.forEach((animation) => {
      animation.play();
    });
    if (_keyframes.length === 0 || elements.length === 0) {
      animationFinish();
    }
  };
  const resetAnimation = () => {
    if (supportsWebAnimations) {
      setAnimationStep(0);
      updateWebAnimation();
    }
    else {
      updateCSSAnimation();
    }
  };
  const play = (opts) => {
    return new Promise((resolve) => {
      if (opts && opts.sync) {
        shouldForceSyncPlayback = true;
        onFinish(() => (shouldForceSyncPlayback = false), {
          oneTimeCallback: true,
        });
      }
      if (!initialized) {
        initializeAnimation();
      }
      if (finished) {
        resetAnimation();
        finished = false;
      }
      if (shouldCalculateNumAnimations) {
        numAnimationsRunning = childAnimations.length + 1;
        shouldCalculateNumAnimations = false;
      }
      onFinish(() => resolve(), { oneTimeCallback: true });
      childAnimations.forEach((animation) => {
        animation.play();
      });
      if (supportsWebAnimations) {
        playWebAnimations();
      }
      else {
        playCSSAnimations();
      }
    });
  };
  const stop = () => {
    childAnimations.forEach((animation) => {
      animation.stop();
    });
    if (initialized) {
      cleanUpElements();
      initialized = false;
    }
    resetFlags();
  };
  const from = (property, value) => {
    const firstFrame = _keyframes[0];
    if (firstFrame !== undefined &&
      (firstFrame.offset === undefined || firstFrame.offset === 0)) {
      firstFrame[property] = value;
    }
    else {
      _keyframes = [
        { offset: 0, [property]: value },
        ..._keyframes,
      ];
    }
    return ani;
  };
  const to = (property, value) => {
    const lastFrame = _keyframes[_keyframes.length - 1];
    if (lastFrame !== undefined &&
      (lastFrame.offset === undefined || lastFrame.offset === 1)) {
      lastFrame[property] = value;
    }
    else {
      _keyframes = [
        ..._keyframes,
        { offset: 1, [property]: value },
      ];
    }
    return ani;
  };
  const fromTo = (property, fromValue, toValue) => {
    return from(property, fromValue).to(property, toValue);
  };
  return (ani = {
    parentAnimation,
    elements,
    childAnimations,
    id,
    animationFinish,
    from,
    to,
    fromTo,
    parent,
    play,
    pause,
    stop,
    destroy,
    keyframes,
    addAnimation,
    addElement,
    update,
    fill,
    direction,
    iterations,
    duration,
    easing,
    delay,
    getWebAnimations,
    getKeyframes,
    getFill,
    getDirection,
    getDelay,
    getIterations,
    getEasing,
    getDuration,
    afterAddRead,
    afterAddWrite,
    afterClearStyles,
    afterStyles,
    afterRemoveClass,
    afterAddClass,
    beforeAddRead,
    beforeAddWrite,
    beforeClearStyles,
    beforeStyles,
    beforeRemoveClass,
    beforeAddClass,
    onFinish,
    progressStart,
    progressStep,
    progressEnd,
  });
};

const DURATION = 540;
const getClonedElement = (tagName) => {
  return document.querySelector(`${tagName}.wl-cloned-element`);
};
const shadow = (el) => {
  return el.shadowRoot || el;
};
const getLargeTitle = (refEl) => {
  const tabs = refEl.tagName === "WL-TABS" ? refEl : refEl.querySelector("wl-tabs");
  const query = "wl-header:not(.header-collapse-condense-inactive) wl-title.title-large";
  if (tabs != null) {
    const activeTab = tabs.querySelector("wl-tab:not(.tab-hidden), .wl-page:not(.wl-page-hidden)");
    return activeTab != null ? activeTab.querySelector(query) : null;
  }
  return refEl.querySelector(query);
};
const getBackButton = (refEl, backDirection) => {
  const tabs = refEl.tagName === "wl-TABS" ? refEl : refEl.querySelector("wl-tabs");
  let buttonsList = [];
  if (tabs != null) {
    const activeTab = tabs.querySelector("wl-tab:not(.tab-hidden), .wl-page:not(.wl-page-hidden)");
    if (activeTab != null) {
      buttonsList = activeTab.querySelectorAll("wl-buttons");
    }
  }
  else {
    buttonsList = refEl.querySelectorAll("wl-buttons");
  }
  for (const buttons of buttonsList) {
    const parentHeader = buttons.closest("wl-header");
    const activeHeader = parentHeader &&
      !parentHeader.classList.contains("header-collapse-condense-inactive");
    const backButton = buttons.querySelector("wl-back-button");
    const buttonsCollapse = buttons.classList.contains("buttons-collapse");
    const startSlot = buttons.slot === "start" || buttons.slot === "";
    if (backButton !== null &&
      startSlot &&
      ((buttonsCollapse && activeHeader && backDirection) || !buttonsCollapse)) {
      return backButton;
    }
  }
  return null;
};
const createLargeTitleTransition = (rootAnimation, rtl, backDirection, enteringEl, leavingEl) => {
  const enteringBackButton = getBackButton(enteringEl, backDirection);
  const leavingLargeTitle = getLargeTitle(leavingEl);
  const enteringLargeTitle = getLargeTitle(enteringEl);
  const leavingBackButton = getBackButton(leavingEl, backDirection);
  const shouldAnimationForward = enteringBackButton !== null && leavingLargeTitle !== null && !backDirection;
  const shouldAnimationBackward = enteringLargeTitle !== null && leavingBackButton !== null && backDirection;
  if (shouldAnimationForward) {
    const leavingLargeTitleBox = leavingLargeTitle.getBoundingClientRect();
    const enteringBackButtonBox = enteringBackButton.getBoundingClientRect();
    animateLargeTitle(rootAnimation, rtl, backDirection, leavingLargeTitle, leavingLargeTitleBox, enteringBackButtonBox);
    animateBackButton(rootAnimation, rtl, backDirection, enteringBackButton, leavingLargeTitleBox, enteringBackButtonBox);
  }
  else if (shouldAnimationBackward) {
    const enteringLargeTitleBox = enteringLargeTitle.getBoundingClientRect();
    const leavingBackButtonBox = leavingBackButton.getBoundingClientRect();
    animateLargeTitle(rootAnimation, rtl, backDirection, enteringLargeTitle, enteringLargeTitleBox, leavingBackButtonBox);
    animateBackButton(rootAnimation, rtl, backDirection, leavingBackButton, enteringLargeTitleBox, leavingBackButtonBox);
  }
  return {
    forward: shouldAnimationForward,
    backward: shouldAnimationBackward,
  };
};
const animateBackButton = (rootAnimation, rtl, backDirection, backButtonEl, largeTitleBox, backButtonBox) => {
  const BACK_BUTTON_START_OFFSET = rtl
    ? `calc(100% - ${backButtonBox.right + 4}px)`
    : `${backButtonBox.left - 4}px`;
  const START_TEXT_TRANSLATE = rtl ? "7px" : "-7px";
  const END_TEXT_TRANSLATE = rtl ? "-4px" : "4px";
  const WL_TRANSLATE = rtl ? "-4px" : "4px";
  const TEXT_ORIGIN_X = rtl ? "right" : "left";
  const ICON_ORIGIN_X = rtl ? "left" : "right";
  const FORWARD_TEXT_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${START_TEXT_TRANSLATE}, ${largeTitleBox.top - 40}px, 0) scale(2.1)`,
    },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(${END_TEXT_TRANSLATE}, ${backButtonBox.top - 46}px, 0) scale(1)`,
    },
  ];
  const BACKWARD_TEXT_KEYFRAMES = [
    {
      offset: 0,
      opacity: 1,
      transform: `translate3d(${END_TEXT_TRANSLATE}, ${backButtonBox.top - 46}px, 0) scale(1)`,
    },
    { offset: 0.6, opacity: 0 },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${START_TEXT_TRANSLATE}, ${largeTitleBox.top - 40}px, 0) scale(2.1)`,
    },
  ];
  const TEXT_KEYFRAMES = backDirection
    ? BACKWARD_TEXT_KEYFRAMES
    : FORWARD_TEXT_KEYFRAMES;
  const FORWARD_ICON_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${backButtonBox.top - 41}px, 0) scale(0.6)`,
    },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(${WL_TRANSLATE}, ${backButtonBox.top - 46}px, 0) scale(1)`,
    },
  ];
  const BACKWARD_ICON_KEYFRAMES = [
    {
      offset: 0,
      opacity: 1,
      transform: `translate3d(${WL_TRANSLATE}, ${backButtonBox.top - 46}px, 0) scale(1)`,
    },
    {
      offset: 0.2,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${backButtonBox.top - 41}px, 0) scale(0.6)`,
    },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${WL_TRANSLATE}, ${backButtonBox.top - 41}px, 0) scale(0.6)`,
    },
  ];
  const ICON_KEYFRAMES = backDirection
    ? BACKWARD_ICON_KEYFRAMES
    : FORWARD_ICON_KEYFRAMES;
  const enteringBackButtonTextAnimation = createAnimation();
  const enteringBackButtonIconAnimation = createAnimation();
  const clonedBackButtonEl = getClonedElement("wl-back-button");
  const backButtonTextEl = shadow(clonedBackButtonEl).querySelector(".button-text");
  const backButtonIconEl = shadow(clonedBackButtonEl).querySelector("wl-icon");
  clonedBackButtonEl.text = backButtonEl.text;
  clonedBackButtonEl.mode = backButtonEl.mode;
  clonedBackButtonEl.icon = backButtonEl.icon;
  clonedBackButtonEl.color = backButtonEl.color;
  clonedBackButtonEl.disabled = backButtonEl.disabled;
  clonedBackButtonEl.style.setProperty("display", "block");
  clonedBackButtonEl.style.setProperty("position", "fixed");
  enteringBackButtonIconAnimation.addElement(backButtonIconEl);
  enteringBackButtonTextAnimation.addElement(backButtonTextEl);
  enteringBackButtonTextAnimation
    .beforeStyles({
    "transform-origin": `${TEXT_ORIGIN_X} center`,
  })
    .beforeAddWrite(() => {
    backButtonEl.style.setProperty("display", "none");
    clonedBackButtonEl.style.setProperty(TEXT_ORIGIN_X, BACK_BUTTON_START_OFFSET);
  })
    .afterAddWrite(() => {
    backButtonEl.style.setProperty("display", "");
    clonedBackButtonEl.style.setProperty("display", "none");
    clonedBackButtonEl.style.removeProperty(TEXT_ORIGIN_X);
  })
    .keyframes(TEXT_KEYFRAMES);
  enteringBackButtonIconAnimation
    .beforeStyles({
    "transform-origin": `${ICON_ORIGIN_X} center`,
  })
    .keyframes(ICON_KEYFRAMES);
  rootAnimation.addAnimation([
    enteringBackButtonTextAnimation,
    enteringBackButtonIconAnimation,
  ]);
};
const animateLargeTitle = (rootAnimation, rtl, backDirection, largeTitleEl, largeTitleBox, backButtonBox) => {
  const TITLE_START_OFFSET = rtl
    ? `calc(100% - ${largeTitleBox.right}px)`
    : `${largeTitleBox.left}px`;
  const START_TRANSLATE = rtl ? "-18px" : "18px";
  const ORIGIN_X = rtl ? "right" : "left";
  const BACKWARDS_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0,
      transform: `translate3d(${START_TRANSLATE}, ${backButtonBox.top - 4}px, 0) scale(0.49)`,
    },
    { offset: 0.1, opacity: 0 },
    {
      offset: 1,
      opacity: 1,
      transform: `translate3d(0, ${largeTitleBox.top - 2}px, 0) scale(1)`,
    },
  ];
  const FORWARDS_KEYFRAMES = [
    {
      offset: 0,
      opacity: 0.99,
      transform: `translate3d(0, ${largeTitleBox.top - 2}px, 0) scale(1)`,
    },
    { offset: 0.6, opacity: 0 },
    {
      offset: 1,
      opacity: 0,
      transform: `translate3d(${START_TRANSLATE}, ${backButtonBox.top - 4}px, 0) scale(0.5)`,
    },
  ];
  const KEYFRAMES = backDirection ? BACKWARDS_KEYFRAMES : FORWARDS_KEYFRAMES;
  const clonedTitleEl = getClonedElement("wl-title");
  const clonedLargeTitleAnimation = createAnimation();
  clonedTitleEl.innerText = largeTitleEl.innerText;
  clonedTitleEl.size = largeTitleEl.size;
  clonedTitleEl.color = largeTitleEl.color;
  clonedLargeTitleAnimation.addElement(clonedTitleEl);
  clonedLargeTitleAnimation
    .beforeStyles({
    "transform-origin": `${ORIGIN_X} center`,
    height: "46px",
    display: "",
    position: "relative",
    [ORIGIN_X]: TITLE_START_OFFSET,
  })
    .beforeAddWrite(() => {
    largeTitleEl.style.setProperty("display", "none");
  })
    .afterAddWrite(() => {
    largeTitleEl.style.setProperty("display", "");
    clonedTitleEl.style.setProperty("display", "none");
  })
    .keyframes(KEYFRAMES);
  rootAnimation.addAnimation(clonedLargeTitleAnimation);
};
const iosTransitionAnimation$1 = (navEl, opts) => {
  try {
    const EASING = "cubic-bezier(0.32,0.72,0,1)";
    const OPACITY = "opacity";
    const TRANSFORM = "transform";
    const CENTER = "0%";
    const OFF_OPACITY = 0.8;
    const isRTL = navEl.ownerDocument.dir === "rtl";
    const OFF_RIGHT = isRTL ? "-99.5%" : "99.5%";
    const OFF_LEFT = isRTL ? "33%" : "-33%";
    const enteringEl = opts.enteringEl;
    const leavingEl = opts.leavingEl;
    const backDirection = opts.direction === "back";
    const contentEl = enteringEl.querySelector(":scope > wl-content");
    const headerEls = enteringEl.querySelectorAll(":scope > wl-header > *:not(wl-toolbar), :scope > wl-footer > *");
    const enteringToolBarEls = enteringEl.querySelectorAll(":scope > wl-header > wl-toolbar");
    const rootAnimation = createAnimation();
    const enteringContentAnimation = createAnimation();
    rootAnimation
      .addElement(enteringEl)
      .duration(opts.duration || DURATION)
      .easing(opts.easing || EASING)
      .fill("both")
      .beforeRemoveClass("wl-page-invisible");
    if (leavingEl && navEl) {
      const navDecorAnimation = createAnimation();
      navDecorAnimation.addElement(navEl);
      rootAnimation.addAnimation(navDecorAnimation);
    }
    if (!contentEl &&
      enteringToolBarEls.length === 0 &&
      headerEls.length === 0) {
      enteringContentAnimation.addElement(enteringEl.querySelector(":scope > .wl-page, :scope > wl-nav, :scope > wl-tabs")); // REVIEW
    }
    else {
      enteringContentAnimation.addElement(contentEl); // REVIEW
      enteringContentAnimation.addElement(headerEls);
    }
    rootAnimation.addAnimation(enteringContentAnimation);
    if (backDirection) {
      enteringContentAnimation
        .beforeClearStyles([OPACITY])
        .fromTo("transform", `translateX(${OFF_LEFT})`, `translateX(${CENTER})`)
        .fromTo(OPACITY, OFF_OPACITY, 1);
    }
    else {
      // entering content, forward direction
      enteringContentAnimation
        .beforeClearStyles([OPACITY])
        .fromTo("transform", `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`);
    }
    if (contentEl) {
      const enteringTransitionEffectEl = shadow(contentEl).querySelector(".transitwl-effect");
      if (enteringTransitionEffectEl) {
        const enteringTransitionCoverEl = enteringTransitionEffectEl.querySelector(".transitwl-cover");
        const enteringTransitionShadowEl = enteringTransitionEffectEl.querySelector(".transitwl-shadow");
        const enteringTransitionEffect = createAnimation();
        const enteringTransitionCover = createAnimation();
        const enteringTransitionShadow = createAnimation();
        enteringTransitionEffect
          .addElement(enteringTransitionEffectEl)
          .beforeStyles({ opacity: "1", display: "block" })
          .afterStyles({ opacity: "", display: "" });
        enteringTransitionCover
          .addElement(enteringTransitionCoverEl) // REVIEW
          .beforeClearStyles([OPACITY])
          .fromTo(OPACITY, 0, 0.1);
        enteringTransitionShadow
          .addElement(enteringTransitionShadowEl) // REVIEW
          .beforeClearStyles([OPACITY])
          .fromTo(OPACITY, 0.03, 0.7);
        enteringTransitionEffect.addAnimation([
          enteringTransitionCover,
          enteringTransitionShadow,
        ]);
        enteringContentAnimation.addAnimation([enteringTransitionEffect]);
      }
    }
    const enteringContentHasLargeTitle = enteringEl.querySelector("wl-header.header-collapse-condense");
    const { forward, backward } = createLargeTitleTransition(rootAnimation, isRTL, backDirection, enteringEl, leavingEl);
    enteringToolBarEls.forEach((enteringToolBarEl) => {
      const enteringToolBar = createAnimation();
      enteringToolBar.addElement(enteringToolBarEl);
      rootAnimation.addAnimation(enteringToolBar);
      const enteringTitle = createAnimation();
      enteringTitle.addElement(enteringToolBarEl.querySelector("wl-title")); // REVIEW
      const enteringToolBarButtons = createAnimation();
      const buttons = Array.from(enteringToolBarEl.querySelectorAll("wl-buttons,[menuToggle]"));
      const parentHeader = enteringToolBarEl.closest("wl-header");
      const inactiveHeader = parentHeader &&
        parentHeader.classList.contains("header-collapse-condense-inactive");
      let buttonsToAnimate;
      if (backDirection) {
        buttonsToAnimate = buttons.filter((button) => {
          const isCollapseButton = button.classList.contains("buttons-collapse");
          return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
        });
      }
      else {
        buttonsToAnimate = buttons.filter((button) => !button.classList.contains("buttons-collapse"));
      }
      enteringToolBarButtons.addElement(buttonsToAnimate);
      const enteringToolBarItems = createAnimation();
      enteringToolBarItems.addElement(enteringToolBarEl.querySelectorAll(":scope > *:not(wl-title):not(wl-buttons):not([menuToggle])"));
      const enteringToolBarBg = createAnimation();
      enteringToolBarBg.addElement(shadow(enteringToolBarEl).querySelector(".toolbar-background")); // REVIEW
      const enteringBackButton = createAnimation();
      const backButtonEl = enteringToolBarEl.querySelector("wl-back-button");
      if (backButtonEl) {
        enteringBackButton.addElement(backButtonEl);
      }
      enteringToolBar.addAnimation([
        enteringTitle,
        enteringToolBarButtons,
        enteringToolBarItems,
        enteringToolBarBg,
        enteringBackButton,
      ]);
      enteringToolBarButtons.fromTo(OPACITY, 0.01, 1);
      enteringToolBarItems.fromTo(OPACITY, 0.01, 1);
      if (backDirection) {
        if (!inactiveHeader) {
          enteringTitle
            .fromTo("transform", `translateX(${OFF_LEFT})`, `translateX(${CENTER})`)
            .fromTo(OPACITY, 0.01, 1);
        }
        enteringToolBarItems.fromTo("transform", `translateX(${OFF_LEFT})`, `translateX(${CENTER})`);
        // back direction, entering page has a back button
        enteringBackButton.fromTo(OPACITY, 0.01, 1);
      }
      else {
        // entering toolbar, forward direction
        if (!enteringContentHasLargeTitle) {
          enteringTitle
            .fromTo("transform", `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`)
            .fromTo(OPACITY, 0.01, 1);
        }
        enteringToolBarItems.fromTo("transform", `translateX(${OFF_RIGHT})`, `translateX(${CENTER})`);
        enteringToolBarBg.beforeClearStyles([OPACITY, "transform"]);
        {
          enteringToolBarBg.fromTo(OPACITY, 0.01, 1);
        }
        // forward direction, entering page has a back button
        if (!forward) {
          enteringBackButton.fromTo(OPACITY, 0.01, 1);
        }
        if (backButtonEl && !forward) {
          const enteringBackBtnText = createAnimation();
          enteringBackBtnText
            .addElement(shadow(backButtonEl).querySelector(".button-text")) // REVIEW
            .fromTo(`transform`, isRTL ? "translateX(-100px)" : "translateX(100px)", "translateX(0px)");
          enteringToolBar.addAnimation(enteringBackBtnText);
        }
      }
    });
    // setup leaving view
    if (leavingEl) {
      const leavingContent = createAnimation();
      const leavingContentEl = leavingEl.querySelector(":scope > wl-content");
      const leavingToolBarEls = leavingEl.querySelectorAll(":scope > wl-header > wl-toolbar");
      const leavingHeaderEls = leavingEl.querySelectorAll(":scope > wl-header > *:not(wl-toolbar), :scope > wl-footer > *");
      if (!leavingContentEl &&
        leavingToolBarEls.length === 0 &&
        leavingHeaderEls.length === 0) {
        leavingContent.addElement(leavingEl.querySelector(":scope > .wl-page, :scope > wl-nav, :scope > wl-tabs")); // REVIEW
      }
      else {
        leavingContent.addElement(leavingContentEl); // REVIEW
        leavingContent.addElement(leavingHeaderEls);
      }
      rootAnimation.addAnimation(leavingContent);
      if (backDirection) {
        // leaving content, back direction
        leavingContent
          .beforeClearStyles([OPACITY])
          .fromTo("transform", `translateX(${CENTER})`, isRTL ? "translateX(-100%)" : "translateX(100%)");
        const leavingPage = getWlPageElement(leavingEl);
        rootAnimation.afterAddWrite(() => {
          if (rootAnimation.getDirection() === "normal") {
            leavingPage.style.setProperty("display", "none");
          }
        });
      }
      else {
        // leaving content, forward direction
        leavingContent
          .fromTo("transform", `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
          .fromTo(OPACITY, 1, OFF_OPACITY);
      }
      if (leavingContentEl) {
        const leavingTransitionEffectEl = shadow(leavingContentEl).querySelector(".transitwl-effect");
        if (leavingTransitionEffectEl) {
          const leavingTransitionCoverEl = leavingTransitionEffectEl.querySelector(".transitwl-cover");
          const leavingTransitionShadowEl = leavingTransitionEffectEl.querySelector(".transitwl-shadow");
          const leavingTransitionEffect = createAnimation();
          const leavingTransitionCover = createAnimation();
          const leavingTransitionShadow = createAnimation();
          leavingTransitionEffect
            .addElement(leavingTransitionEffectEl)
            .beforeStyles({ opacity: "1", display: "block" })
            .afterStyles({ opacity: "", display: "" });
          leavingTransitionCover
            .addElement(leavingTransitionCoverEl) // REVIEW
            .beforeClearStyles([OPACITY])
            .fromTo(OPACITY, 0.1, 0);
          leavingTransitionShadow
            .addElement(leavingTransitionShadowEl) // REVIEW
            .beforeClearStyles([OPACITY])
            .fromTo(OPACITY, 0.7, 0.03);
          leavingTransitionEffect.addAnimation([
            leavingTransitionCover,
            leavingTransitionShadow,
          ]);
          leavingContent.addAnimation([leavingTransitionEffect]);
        }
      }
      leavingToolBarEls.forEach((leavingToolBarEl) => {
        const leavingToolBar = createAnimation();
        leavingToolBar.addElement(leavingToolBarEl);
        const leavingTitle = createAnimation();
        leavingTitle.addElement(leavingToolBarEl.querySelector("wl-title")); // REVIEW
        const leavingToolBarButtons = createAnimation();
        const buttons = leavingToolBarEl.querySelectorAll("wl-buttons,[menuToggle]");
        const parentHeader = leavingToolBarEl.closest("wl-header");
        const inactiveHeader = parentHeader &&
          parentHeader.classList.contains("header-collapse-condense-inactive");
        const buttonsToAnimate = Array.from(buttons).filter((button) => {
          const isCollapseButton = button.classList.contains("buttons-collapse");
          return (isCollapseButton && !inactiveHeader) || !isCollapseButton;
        });
        leavingToolBarButtons.addElement(buttonsToAnimate);
        const leavingToolBarItems = createAnimation();
        const leavingToolBarItemEls = leavingToolBarEl.querySelectorAll(":scope > *:not(wl-title):not(wl-buttons):not([menuToggle])");
        if (leavingToolBarItemEls.length > 0) {
          leavingToolBarItems.addElement(leavingToolBarItemEls);
        }
        const leavingToolBarBg = createAnimation();
        leavingToolBarBg.addElement(shadow(leavingToolBarEl).querySelector(".toolbar-background")); // REVIEW
        const leavingBackButton = createAnimation();
        const backButtonEl = leavingToolBarEl.querySelector("wl-back-button");
        if (backButtonEl) {
          leavingBackButton.addElement(backButtonEl);
        }
        leavingToolBar.addAnimation([
          leavingTitle,
          leavingToolBarButtons,
          leavingToolBarItems,
          leavingBackButton,
          leavingToolBarBg,
        ]);
        rootAnimation.addAnimation(leavingToolBar);
        // fade out leaving toolbar items
        leavingBackButton.fromTo(OPACITY, 0.99, 0);
        leavingToolBarButtons.fromTo(OPACITY, 0.99, 0);
        leavingToolBarItems.fromTo(OPACITY, 0.99, 0);
        if (backDirection) {
          if (!inactiveHeader) {
            // leaving toolbar, back direction
            leavingTitle
              .fromTo("transform", `translateX(${CENTER})`, isRTL ? "translateX(-100%)" : "translateX(100%)")
              .fromTo(OPACITY, 0.99, 0);
          }
          leavingToolBarItems.fromTo("transform", `translateX(${CENTER})`, isRTL ? "translateX(-100%)" : "translateX(100%)");
          leavingToolBarBg.beforeClearStyles([OPACITY, "transform"]);
          {
            leavingToolBarBg.fromTo(OPACITY, 0.99, 0);
          }
          if (backButtonEl && !backward) {
            const leavingBackBtnText = createAnimation();
            leavingBackBtnText
              .addElement(shadow(backButtonEl).querySelector(".button-text")) // REVIEW
              .fromTo("transform", `translateX(${CENTER})`, `translateX(${(isRTL ? -124 : 124) + "px"})`);
            leavingToolBar.addAnimation(leavingBackBtnText);
          }
        }
        else {
          // leaving toolbar, forward direction
          if (!inactiveHeader) {
            leavingTitle
              .fromTo("transform", `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
              .fromTo(OPACITY, 0.99, 0)
              .afterClearStyles([TRANSFORM, OPACITY]);
          }
          leavingToolBarItems
            .fromTo("transform", `translateX(${CENTER})`, `translateX(${OFF_LEFT})`)
            .afterClearStyles([TRANSFORM, OPACITY]);
          leavingBackButton.afterClearStyles([OPACITY]);
          leavingTitle.afterClearStyles([OPACITY]);
          leavingToolBarButtons.afterClearStyles([OPACITY]);
        }
      });
    }
    return rootAnimation;
  }
  catch (err) {
    throw err;
  }
};

var ios_transition = /*#__PURE__*/Object.freeze({
  __proto__: null,
  shadow: shadow,
  iosTransitionAnimation: iosTransitionAnimation$1
});

const mdTransitionAnimation$1 = (_, opts) => {
  const OFF_BOTTOM = "40px";
  const CENTER = "0px";
  const backDirection = opts.direction === "back";
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;
  const wlPageElement = getWlPageElement(enteringEl);
  const enteringToolbarEle = wlPageElement.querySelector("wl-toolbar");
  const rootTransition = createAnimation();
  rootTransition
    .addElement(wlPageElement)
    .fill("both")
    .beforeRemoveClass("wl-page-invisible");
  // animate the component itself
  if (backDirection) {
    rootTransition
      .duration(opts.duration || 200)
      .easing("cubic-bezier(0.47,0,0.745,0.715)");
  }
  else {
    rootTransition
      .duration(opts.duration || 280)
      .easing("cubic-bezier(0.36,0.66,0.04,1)")
      .fromTo("transform", `translateY(${OFF_BOTTOM})`, `translateY(${CENTER})`)
      .fromTo("opacity", 0.01, 1);
  }
  // Animate toolbar if it's there
  if (enteringToolbarEle) {
    const enteringToolBar = createAnimation();
    enteringToolBar.addElement(enteringToolbarEle);
    rootTransition.addAnimation(enteringToolBar);
  }
  // setup leaving view
  if (leavingEl && backDirection) {
    // leaving content
    rootTransition
      .duration(opts.duration || 200)
      .easing("cubic-bezier(0.47,0,0.745,0.715)");
    const leavingPage = createAnimation();
    leavingPage
      .addElement(getWlPageElement(leavingEl))
      .onFinish((currentStep) => {
      if (currentStep === 1 && leavingPage.elements.length > 0) {
        leavingPage.elements[0].style.setProperty("display", "none");
      }
    })
      .afterStyles({ display: "none" })
      .fromTo("transform", `translateY(${CENTER})`, `translateY(${OFF_BOTTOM})`)
      .fromTo("opacity", 1, 0);
    rootTransition.addAnimation(leavingPage);
  }
  return rootTransition;
};

var md_transition = /*#__PURE__*/Object.freeze({
  __proto__: null,
  mdTransitionAnimation: mdTransitionAnimation$1
});

const createSwipeBackGesture = (el, canStartHandler, onStartHandler, onMoveHandler, onEndHandler) => {
  const win = el.ownerDocument.defaultView;
  const canStart = (detail) => {
    return detail.startX <= 50 && canStartHandler();
  };
  const onMove = (detail) => {
    // set the transition animation's progress
    const delta = detail.deltaX;
    const stepValue = delta / win.innerWidth;
    onMoveHandler(stepValue);
  };
  const onEnd = (detail) => {
    // the swipe back gesture has ended
    const delta = detail.deltaX;
    const width = win.innerWidth;
    const stepValue = delta / width;
    const velocity = detail.velocityX;
    const z = width / 2.0;
    const shouldComplete = velocity >= 0 && (velocity > 0.2 || detail.deltaX > z);
    const missing = shouldComplete ? 1 - stepValue : stepValue;
    const missingDistance = missing * width;
    let realDur = 0;
    if (missingDistance > 5) {
      const dur = missingDistance / Math.abs(velocity);
      realDur = Math.min(dur, 540);
    }
    /**
     * TODO: stepValue can sometimes return negative values
     * or values greater than 1 which should not be possible.
     * Need to investigate more to find where the issue is.
     */
    onEndHandler(shouldComplete, stepValue <= 0 ? 0.01 : clamp(0, stepValue, 0.9999), realDur);
  };
  return createGesture({
    el,
    gestureName: "goback-swipe",
    gesturePriority: 40,
    threshold: 10,
    canStart,
    onStart: onStartHandler,
    onMove,
    onEnd,
  });
};

var swipeBack = /*#__PURE__*/Object.freeze({
  __proto__: null,
  createSwipeBackGesture: createSwipeBackGesture
});

exports.hydrateApp = hydrateApp;


  /*hydrateAppClosure end*/
  hydrateApp(window, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve);
  }

  hydrateAppClosure($stencilWindow);
}

function createWindowFromHtml(e, t) {
 let r = templateWindows.get(t);
 return null == r && (r = new MockWindow(e), templateWindows.set(t, r)), cloneWindow(r);
}

function normalizeHydrateOptions(e) {
 const t = Object.assign({
  serializeToHtml: !1,
  destroyWindow: !1,
  destroyDocument: !1
 }, e || {});
 return "boolean" != typeof t.clientHydrateAnnotations && (t.clientHydrateAnnotations = !0), 
 "boolean" != typeof t.constrainTimeouts && (t.constrainTimeouts = !0), "number" != typeof t.maxHydrateCount && (t.maxHydrateCount = 300), 
 "boolean" != typeof t.runtimeLogging && (t.runtimeLogging = !1), "number" != typeof t.timeout && (t.timeout = 15e3), 
 Array.isArray(t.excludeComponents) ? t.excludeComponents = t.excludeComponents.filter(filterValidTags).map(mapValidTags) : t.excludeComponents = [], 
 Array.isArray(t.staticComponents) ? t.staticComponents = t.staticComponents.filter(filterValidTags).map(mapValidTags) : t.staticComponents = [], 
 t;
}

function filterValidTags(e) {
 return "string" == typeof e && e.includes("-");
}

function mapValidTags(e) {
 return e.trim().toLowerCase();
}

function generateHydrateResults(e) {
 "string" != typeof e.url && (e.url = "https://hydrate.stenciljs.com/");
 const t = {
  diagnostics: [],
  url: e.url,
  host: null,
  hostname: null,
  href: null,
  pathname: null,
  port: null,
  search: null,
  hash: null,
  html: null,
  httpStatus: null,
  hydratedCount: 0,
  anchors: [],
  components: [],
  imgs: [],
  scripts: [],
  styles: [],
  title: null
 };
 try {
  const r = new URL(e.url, "https://hydrate.stenciljs.com/");
  t.url = r.href, t.host = r.host, t.hostname = r.hostname, t.href = r.href, t.port = r.port, 
  t.pathname = r.pathname, t.search = r.search, t.hash = r.hash;
 } catch (e) {
  renderCatchError(t, e);
 }
 return t;
}

function renderBuildDiagnostic(e, t, r, s) {
 const n = {
  level: t,
  type: "build",
  header: r,
  messageText: s,
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 return e.pathname ? "/" !== e.pathname && (n.header += ": " + e.pathname) : e.url && (n.header += ": " + e.url), 
 e.diagnostics.push(n), n;
}

function renderBuildError(e, t) {
 return renderBuildDiagnostic(e, "error", "Hydrate Error", t);
}

function renderCatchError(e, t) {
 const r = renderBuildError(e, null);
 return null != t && (null != t.stack ? r.messageText = t.stack.toString() : null != t.message ? r.messageText = t.message.toString() : r.messageText = t.toString()), 
 r;
}

function runtimeLog(e, t, r) {
 global.console[t].apply(global.console, [ `[ ${e}  ${t} ] `, ...r ]);
}

function collectAttributes(e) {
 const t = {}, r = e.attributes;
 for (let e = 0, s = r.length; e < s; e++) {
  const s = r.item(e), n = s.nodeName.toLowerCase();
  if (SKIP_ATTRS.has(n)) continue;
  const o = s.nodeValue;
  "class" === n && "" === o || (t[n] = o);
 }
 return t;
}

function patchDomImplementation(e, t) {
 let r;
 if (null != e.defaultView ? (t.destroyWindow = !0, patchWindow(e.defaultView), r = e.defaultView) : (t.destroyWindow = !0, 
 t.destroyDocument = !1, r = new MockWindow(!1)), r.document !== e && (r.document = e), 
 e.defaultView !== r && (e.defaultView = r), "function" != typeof e.documentElement.constructor.prototype.getRootNode && (e.createElement("unknown-element").constructor.prototype.getRootNode = getRootNode), 
 "function" == typeof e.createEvent) {
  const t = e.createEvent("CustomEvent").constructor;
  r.CustomEvent !== t && (r.CustomEvent = t);
 }
 try {
  e.baseURI;
 } catch (t) {
  Object.defineProperty(e, "baseURI", {
   get() {
    const t = e.querySelector("base[href]");
    return t ? new URL(t.getAttribute("href"), r.location.href).href : r.location.href;
   }
  });
 }
 return r;
}

function getRootNode(e) {
 const t = null != e && !0 === e.composed;
 let r = this;
 for (;null != r.parentNode; ) r = r.parentNode, !0 === t && null == r.parentNode && null != r.host && (r = r.host);
 return r;
}

function renderToString(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !0, new Promise(t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 });
}

function hydrateDocument(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !1, new Promise(t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 });
}

function render(e, t, r, s) {
 if (process.__stencilErrors || (process.__stencilErrors = !0, process.on("unhandledRejection", e => {
  console.log("unhandledRejection", e);
 })), function n(e, t, r) {
  try {
   e.location.href = t.url;
  } catch (e) {
   renderCatchError(r, e);
  }
  if ("string" == typeof t.userAgent) try {
   e.navigator.userAgent = t.userAgent;
  } catch (e) {}
  if ("string" == typeof t.cookie) try {
   e.document.cookie = t.cookie;
  } catch (e) {}
  if ("string" == typeof t.referrer) try {
   e.document.referrer = t.referrer;
  } catch (e) {}
  if ("string" == typeof t.direction) try {
   e.document.documentElement.setAttribute("dir", t.direction);
  } catch (e) {}
  if ("string" == typeof t.language) try {
   e.document.documentElement.setAttribute("lang", t.language);
  } catch (e) {}
  try {
   e.customElements = null;
  } catch (e) {}
  return t.constrainTimeouts && constrainTimeouts(e), function s(e, t, r) {
   try {
    const s = e.location.pathname;
    e.console.error = (...e) => {
     renderCatchError(r, [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "error", e);
    }, e.console.debug = (...e) => {
     renderBuildDiagnostic(r, "debug", "Hydrate Debug", [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "debug", e);
    }, t.runtimeLogging && [ "log", "warn", "assert", "info", "trace" ].forEach(t => {
     e.console[t] = (...e) => {
      runtimeLog(s, t, e);
     };
    });
   } catch (e) {
    renderCatchError(r, e);
   }
  }(e, t, r), e;
 }(e, t, r), "function" == typeof t.beforeHydrate) try {
  const n = t.beforeHydrate(e.document);
  isPromise(n) ? n.then(() => {
   hydrateFactory(e, t, r, afterHydrate, s);
  }) : hydrateFactory(e, t, r, afterHydrate, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else hydrateFactory(e, t, r, afterHydrate, s);
}

function afterHydrate(e, t, r, s) {
 if ("function" == typeof t.afterHydrate) try {
  const n = t.afterHydrate(e.document);
  isPromise(n) ? n.then(() => {
   finalizeHydrate(e, e.document, t, r, s);
  }) : finalizeHydrate(e, e.document, t, r, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else finalizeHydrate(e, e.document, t, r, s);
}

function finalizeHydrate(e, t, r, s, n) {
 try {
  if (function e(t, r, s) {
   const n = r.children;
   for (let r = 0, o = n.length; r < o; r++) {
    const o = n[r], i = o.nodeName.toLowerCase();
    if (i.includes("-")) {
     const e = t.components.find(e => e.tag === i);
     null != e && (e.count++, s > e.depth && (e.depth = s));
    } else switch (i) {
    case "a":
     const e = collectAttributes(o);
     e.href = o.href, "string" == typeof e.href && (t.anchors.some(t => t.href === e.href) || t.anchors.push(e));
     break;

    case "img":
     const r = collectAttributes(o);
     r.src = o.src, "string" == typeof r.src && (t.imgs.some(e => e.src === r.src) || t.imgs.push(r));
     break;

    case "link":
     const s = collectAttributes(o);
     s.href = o.href, "string" == typeof s.rel && "stylesheet" === s.rel.toLowerCase() && "string" == typeof s.href && (t.styles.some(e => e.link === s.href) || (delete s.rel, 
     delete s.type, t.styles.push(s)));
     break;

    case "script":
     const n = collectAttributes(o);
     n.src = o.src, "string" == typeof n.src && (t.scripts.some(e => e.src === n.src) || t.scripts.push(n));
    }
    e(t, o, ++s);
   }
  }(s, t.documentElement, 0), !1 !== r.removeUnusedStyles) try {
   ((e, t) => {
    try {
     const r = e.head.querySelectorAll("style[data-styles]"), s = r.length;
     if (s > 0) {
      const n = (e => {
       const t = {
        attrs: new Set,
        classNames: new Set,
        ids: new Set,
        tags: new Set
       };
       return collectUsedSelectors(t, e), t;
      })(e.documentElement);
      for (let e = 0; e < s; e++) removeUnusedStyleText(n, t, r[e]);
     }
    } catch (e) {
     ((e, t, r) => {
      const s = {
       level: "error",
       type: "build",
       header: "Build Error",
       messageText: "build error",
       relFilePath: null,
       absFilePath: null,
       lines: []
      };
      null != t && (null != t.stack ? s.messageText = t.stack.toString() : null != t.message ? s.messageText = t.message.toString() : s.messageText = t.toString()), 
      null == e || shouldIgnoreError(s.messageText) || e.push(s);
     })(t, e);
    }
   })(t, s.diagnostics);
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.title) try {
   t.title = r.title;
  } catch (e) {
   renderCatchError(s, e);
  }
  s.title = t.title, r.removeScripts && function e(t) {
   const r = t.children;
   for (let t = r.length - 1; t >= 0; t--) {
    const s = r[t];
    e(s), ("SCRIPT" === s.nodeName || "LINK" === s.nodeName && "modulepreload" === s.getAttribute("rel")) && s.remove();
   }
  }(t.documentElement);
  try {
   ((e, t) => {
    let r = e.head.querySelector('link[rel="canonical"]');
    "string" == typeof t ? (null == r && (r = e.createElement("link"), r.setAttribute("rel", "canonical"), 
    e.head.appendChild(r)), r.setAttribute("href", t)) : null != r && (r.getAttribute("href") || r.parentNode.removeChild(r));
   })(t, r.canonicalUrl);
  } catch (e) {
   renderCatchError(s, e);
  }
  try {
   (e => {
    const t = e.head;
    let r = t.querySelector("meta[charset]");
    null == r ? (r = e.createElement("meta"), r.setAttribute("charset", "utf-8")) : r.remove(), 
    t.insertBefore(r, t.firstChild);
   })(t);
  } catch (e) {}
  hasError(s.diagnostics) || (s.httpStatus = 200);
  try {
   const e = t.head.querySelector('meta[http-equiv="status"]');
   if (null != e) {
    const t = e.getAttribute("content");
    t && t.length > 0 && (s.httpStatus = parseInt(t, 10));
   }
  } catch (e) {}
  r.clientHydrateAnnotations && t.documentElement.classList.add("hydrated"), r.serializeToHtml && (s.html = serializeDocumentToString(t, r));
 } catch (e) {
  renderCatchError(s, e);
 }
 if (r.destroyWindow) try {
  r.destroyDocument || (e.document = null, t.defaultView = null), e.close && e.close();
 } catch (e) {
  renderCatchError(s, e);
 }
 n(s);
}

function serializeDocumentToString(e, t) {
 return serializeNodeToHtml(e, {
  approximateLineWidth: t.approximateLineWidth,
  outerHtml: !1,
  prettyHtml: t.prettyHtml,
  removeAttributeQuotes: t.removeAttributeQuotes,
  removeBooleanAttributeQuotes: t.removeBooleanAttributeQuotes,
  removeEmptyAttributes: t.removeEmptyAttributes,
  removeHtmlComments: t.removeHtmlComments,
  serializeShadowRoot: !1
 });
}

function isValidDocument(e) {
 return null != e && 9 === e.nodeType && null != e.documentElement && 1 === e.documentElement.nodeType && null != e.body && 1 === e.body.nodeType;
}

const templateWindows = new Map, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, hasError = e => null != e && 0 !== e.length && e.some(e => "error" === e.level && "runtime" !== e.type), shouldIgnoreError = e => e === TASK_CANCELED_MSG, TASK_CANCELED_MSG = "task canceled", SKIP_ATTRS = new Set([ "s-id", "c-id" ]), collectUsedSelectors = (e, t) => {
 if (null != t && 1 === t.nodeType) {
  const r = t.children, s = t.nodeName.toLowerCase();
  e.tags.add(s);
  const n = t.attributes;
  for (let r = 0, s = n.length; r < s; r++) {
   const s = n.item(r), o = s.name.toLowerCase();
   if (e.attrs.add(o), "class" === o) {
    const r = t.classList;
    for (let t = 0, s = r.length; t < s; t++) e.classNames.add(r.item(t));
   } else "id" === o && e.ids.add(s.value);
  }
  if (r) for (let t = 0, s = r.length; t < s; t++) collectUsedSelectors(e, r[t]);
 }
}, parseCss = (e, t) => {
 let r = 1, s = 1;
 const n = [], o = e => {
  const t = e.match(/\n/g);
  t && (r += t.length);
  const n = e.lastIndexOf("\n");
  s = ~n ? e.length - n : s + e.length;
 }, i = () => {
  const e = {
   line: r,
   column: s
  };
  return t => (t.position = new A(e), d(), t);
 }, a = o => {
  const i = e.split("\n"), a = {
   level: "error",
   type: "css",
   language: "css",
   header: "CSS Parse",
   messageText: o,
   absFilePath: t,
   lines: [ {
    lineIndex: r - 1,
    lineNumber: r,
    errorCharStart: s,
    text: e[r - 1]
   } ]
  };
  if (r > 1) {
   const t = {
    lineIndex: r - 1,
    lineNumber: r - 1,
    text: e[r - 2],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.unshift(t);
  }
  if (r + 2 < i.length) {
   const e = {
    lineIndex: r,
    lineNumber: r + 1,
    text: i[r],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.push(e);
  }
  return n.push(a), null;
 }, l = () => u(/^{\s*/), c = () => u(/^}/), u = t => {
  const r = t.exec(e);
  if (!r) return;
  const s = r[0];
  return o(s), e = e.slice(s.length), r;
 }, m = () => {
  let t;
  const r = [];
  for (d(), h(r); e.length && "}" !== e.charAt(0) && (t = w() || z()); ) !1 !== t && (r.push(t), 
  h(r));
  return r;
 }, d = () => u(/^\s*/), h = e => {
  let t;
  for (e = e || []; t = f(); ) !1 !== t && e.push(t);
  return e;
 }, f = () => {
  const t = i();
  if ("/" !== e.charAt(0) || "*" !== e.charAt(1)) return null;
  let r = 2;
  for (;"" !== e.charAt(r) && ("*" !== e.charAt(r) || "/" !== e.charAt(r + 1)); ) ++r;
  if (r += 2, "" === e.charAt(r - 1)) return a("End of comment missing");
  const n = e.slice(2, r - 2);
  return s += 2, o(n), e = e.slice(r), s += 2, t({
   type: "comment",
   comment: n
  });
 }, p = () => {
  const e = u(/^([^{]+)/);
  return e ? trim(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (function(e) {
   return e.replace(/,/g, "‌");
  })).split(/\s*(?![^(]*\)),\s*/).map((function(e) {
   return e.replace(/\u200C/g, ",");
  })) : null;
 }, g = () => {
  const e = i();
  let t = u(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
  if (!t) return null;
  if (t = trim(t[0]), !u(/^:\s*/)) return a("property missing ':'");
  const r = u(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), s = e({
   type: "declaration",
   property: t.replace(commentre, ""),
   value: r ? trim(r[0]).replace(commentre, "") : ""
  });
  return u(/^[;\s]*/), s;
 }, y = () => {
  const e = [];
  if (!l()) return a("missing '{'");
  let t;
  for (h(e); t = g(); ) !1 !== t && (e.push(t), h(e));
  return c() ? e : a("missing '}'");
 }, C = () => {
  let e;
  const t = [], r = i();
  for (;e = u(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); ) t.push(e[1]), u(/^,\s*/);
  return t.length ? r({
   type: "keyframe",
   values: t,
   declarations: y()
  }) : null;
 }, S = e => {
  const t = new RegExp("^@" + e + "\\s*([^;]+);");
  return () => {
   const r = i(), s = u(t);
   if (!s) return null;
   const n = {
    type: e
   };
   return n[e] = s[1].trim(), r(n);
  };
 }, E = S("import"), b = S("charset"), T = S("namespace"), w = () => "@" !== e[0] ? null : (() => {
  const e = i();
  let t = u(/^@([-\w]+)?keyframes\s*/);
  if (!t) return null;
  const r = t[1];
  if (t = u(/^([-\w]+)\s*/), !t) return a("@keyframes missing name");
  const s = t[1];
  if (!l()) return a("@keyframes missing '{'");
  let n, o = h();
  for (;n = C(); ) o.push(n), o = o.concat(h());
  return c() ? e({
   type: "keyframes",
   name: s,
   vendor: r,
   keyframes: o
  }) : a("@keyframes missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@media *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@media missing '{'");
  const s = h().concat(m());
  return c() ? e({
   type: "media",
   media: r,
   rules: s
  }) : a("@media missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
  return t ? e({
   type: "custom-media",
   name: trim(t[1]),
   media: trim(t[2])
  }) : null;
 })() || (() => {
  const e = i(), t = u(/^@supports *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@supports missing '{'");
  const s = h().concat(m());
  return c() ? e({
   type: "supports",
   supports: r,
   rules: s
  }) : a("@supports missing '}'");
 })() || E() || b() || T() || (() => {
  const e = i(), t = u(/^@([-\w]+)?document *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]), s = trim(t[2]);
  if (!l()) return a("@document missing '{'");
  const n = h().concat(m());
  return c() ? e({
   type: "document",
   document: s,
   vendor: r,
   rules: n
  }) : a("@document missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@page */)) return null;
  const t = p() || [];
  if (!l()) return a("@page missing '{'");
  let r, s = h();
  for (;r = g(); ) s.push(r), s = s.concat(h());
  return c() ? e({
   type: "page",
   selectors: t,
   declarations: s
  }) : a("@page missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@host\s*/)) return null;
  if (!l()) return a("@host missing '{'");
  const t = h().concat(m());
  return c() ? e({
   type: "host",
   rules: t
  }) : a("@host missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@font-face\s*/)) return null;
  if (!l()) return a("@font-face missing '{'");
  let t, r = h();
  for (;t = g(); ) r.push(t), r = r.concat(h());
  return c() ? e({
   type: "font-face",
   declarations: r
  }) : a("@font-face missing '}'");
 })(), z = () => {
  const e = i(), t = p();
  return t ? (h(), e({
   type: "rule",
   selectors: t,
   declarations: y()
  })) : a("selector missing");
 };
 class A {
  constructor(e) {
   this.start = e, this.end = {
    line: r,
    column: s
   }, this.source = t;
  }
 }
 return A.prototype.content = e, {
  diagnostics: n,
  ...addParent((() => {
   const e = m();
   return {
    type: "stylesheet",
    stylesheet: {
     source: t,
     rules: e
    }
   };
  })())
 };
}, trim = e => e ? e.trim() : "", addParent = (e, t) => {
 const r = e && "string" == typeof e.type, s = r ? e : t;
 for (const t in e) {
  const r = e[t];
  Array.isArray(r) ? r.forEach((function(e) {
   addParent(e, s);
  })) : r && "object" == typeof r && addParent(r, s);
 }
 return r && Object.defineProperty(e, "parent", {
  configurable: !0,
  writable: !0,
  enumerable: !1,
  value: t || null
 }), e;
}, commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, getCssSelectors = e => {
 SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
 const t = (e = e.replace(/\./g, " .").replace(/\#/g, " #").replace(/\[/g, " [").replace(/\>/g, " > ").replace(/\+/g, " + ").replace(/\~/g, " ~ ").replace(/\*/g, " * ").replace(/\:not\((.*?)\)/g, " ")).split(" ");
 for (let e = 0, r = t.length; e < r; e++) t[e] = t[e].split(":")[0], 0 !== t[e].length && ("." === t[e].charAt(0) ? SELECTORS.classNames.push(t[e].substr(1)) : "#" === t[e].charAt(0) ? SELECTORS.ids.push(t[e].substr(1)) : "[" === t[e].charAt(0) ? (t[e] = t[e].substr(1).split("=")[0].split("]")[0].trim(), 
 SELECTORS.attrs.push(t[e].toLowerCase())) : /[a-z]/g.test(t[e].charAt(0)) && SELECTORS.tags.push(t[e].toLowerCase()));
 return SELECTORS.classNames = SELECTORS.classNames.sort((e, t) => e.length < t.length ? -1 : e.length > t.length ? 1 : 0), 
 SELECTORS;
}, SELECTORS = {
 all: [],
 tags: [],
 classNames: [],
 ids: [],
 attrs: []
}, serializeCssVisitNode = (e, t, r, s) => {
 const n = t.type;
 return "declaration" === n ? serializeCssDeclaration(t, r, s) : "rule" === n ? serializeCssRule(e, t) : "comment" === n ? "!" === t.comment[0] ? `/*${t.comment}*/` : "" : "media" === n ? serializeCssMedia(e, t) : "keyframes" === n ? serializeCssKeyframes(e, t) : "keyframe" === n ? serializeCssKeyframe(e, t) : "font-face" === n ? serializeCssFontFace(e, t) : "supports" === n ? serializeCssSupports(e, t) : "import" === n ? "@import " + t.import + ";" : "charset" === n ? "@charset " + t.charset + ";" : "page" === n ? serializeCssPage(e, t) : "host" === n ? "@host{" + serializeCssMapVisit(e, t.rules) + "}" : "custom-media" === n ? "@custom-media " + t.name + " " + t.media + ";" : "document" === n ? serializeCssDocument(e, t) : "namespace" === n ? "@namespace " + t.namespace + ";" : "";
}, serializeCssRule = (e, t) => {
 const r = t.declarations, s = e.usedSelectors, n = t.selectors.slice();
 if (null == r || 0 === r.length) return "";
 if (s) {
  let t, r, o = !0;
  for (t = n.length - 1; t >= 0; t--) {
   const i = getCssSelectors(n[t]);
   o = !0;
   let a = i.classNames.length;
   if (a > 0 && e.hasUsedClassNames) for (r = 0; r < a; r++) if (!s.classNames.has(i.classNames[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedTags && (a = i.tags.length, a > 0)) for (r = 0; r < a; r++) if (!s.tags.has(i.tags[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedAttrs && (a = i.attrs.length, a > 0)) for (r = 0; r < a; r++) if (!s.attrs.has(i.attrs[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedIds && (a = i.ids.length, a > 0)) for (r = 0; r < a; r++) if (!s.ids.has(i.ids[r])) {
    o = !1;
    break;
   }
   o || n.splice(t, 1);
  }
 }
 if (0 === n.length) return "";
 const o = [];
 let i = "";
 for (const e of t.selectors) i = removeSelectorWhitespace(e), o.includes(i) || o.push(i);
 return `${o}{${serializeCssMapVisit(e, r)}}`;
}, serializeCssDeclaration = (e, t, r) => "" === e.value ? "" : r - 1 === t ? e.property + ":" + e.value : e.property + ":" + e.value + ";", serializeCssMedia = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@media " + removeMediaWhitespace(t.media) + "{" + r + "}";
}, serializeCssKeyframes = (e, t) => {
 const r = serializeCssMapVisit(e, t.keyframes);
 return "" === r ? "" : "@" + (t.vendor || "") + "keyframes " + t.name + "{" + r + "}";
}, serializeCssKeyframe = (e, t) => t.values.join(",") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssFontFace = (e, t) => {
 const r = serializeCssMapVisit(e, t.declarations);
 return "" === r ? "" : "@font-face{" + r + "}";
}, serializeCssSupports = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@supports " + t.supports + "{" + r + "}";
}, serializeCssPage = (e, t) => "@page " + t.selectors.join(", ") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssDocument = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules), s = "@" + (t.vendor || "") + "document " + t.document;
 return "" === r ? "" : s + "{" + r + "}";
}, serializeCssMapVisit = (e, t) => {
 let r = "";
 if (t) for (let s = 0, n = t.length; s < n; s++) r += serializeCssVisitNode(e, t[s], s, n);
 return r;
}, removeSelectorWhitespace = e => {
 let t = "", r = "", s = !1;
 for (let n = 0, o = (e = e.trim()).length; n < o; n++) if (r = e[n], "[" === r && "\\" !== t[t.length - 1] ? s = !0 : "]" === r && "\\" !== t[t.length - 1] && (s = !1), 
 !s && CSS_WS_REG.test(r)) {
  if (CSS_NEXT_CHAR_REG.test(e[n + 1])) continue;
  if (CSS_PREV_CHAR_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, removeMediaWhitespace = e => {
 let t = "", r = "";
 for (let s = 0, n = (e = e.trim()).length; s < n; s++) if (r = e[s], CSS_WS_REG.test(r)) {
  if (CSS_WS_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, CSS_WS_REG = /\s/, CSS_NEXT_CHAR_REG = /[>\(\)\~\,\+\s]/, CSS_PREV_CHAR_REG = /[>\(\~\,\+]/, removeUnusedStyleText = (e, t, r) => {
 try {
  const s = parseCss(r.innerHTML);
  if (t.push(...s.diagnostics), hasError(t)) return;
  try {
   r.innerHTML = ((e, t) => {
    const r = t.usedSelectors || null, s = {
     usedSelectors: r || null,
     hasUsedAttrs: !!r && r.attrs.size > 0,
     hasUsedClassNames: !!r && r.classNames.size > 0,
     hasUsedIds: !!r && r.ids.size > 0,
     hasUsedTags: !!r && r.tags.size > 0
    }, n = e.rules;
    if (!n) return "";
    const o = n.length, i = [];
    for (let e = 0; e < o; e++) i.push(serializeCssVisitNode(s, n[e], e, o));
    return i.join("");
   })(s.stylesheet, {
    usedSelectors: e
   });
  } catch (e) {
   t.push({
    level: "warn",
    type: "css",
    header: "CSS Stringify",
    messageText: e
   });
  }
 } catch (e) {
  t.push({
   level: "warn",
   type: "css",
   header: "CSS Parse",
   messageText: e
  });
 }
};

exports.createWindowFromHtml = createWindowFromHtml;
exports.hydrateDocument = hydrateDocument;
exports.renderToString = renderToString;
exports.serializeDocumentToString = serializeDocumentToString;
