var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Var;
(function (Var) {
    Var.make = function (tagName, states) {
        var childNodes = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            childNodes[_i - 2] = arguments[_i];
        }
        return new VarInternal.Parser.VirtualDom(tagName, states, childNodes.flat(), "", new VarInternal.Key.KeyForm(-1, -1));
    };
    Var.text = function (value) {
        return new VarInternal.Parser.VirtualDom("var-text", [], [], value, new VarInternal.Key.KeyForm(-1, -1));
    };
    Var.state = function (stateName, stateVal) {
        return new VarInternal.Parser.VirtualState(stateName, stateVal);
    };
    Var.change = function (value) {
        if (Array.isArray(value) && value[0] instanceof VarInternal.Parser.VirtualDom)
            return Var.make.apply(Var, __spreadArray(["variable", []], value, false));
        else if (value instanceof VarInternal.Parser.VirtualDom)
            return Var.make("variable", [], value);
        else
            return Var.make("variable", [], Var.text(value));
    };
})(Var || (Var = {}));
var VarInternal;
(function (VarInternal) {
    var Parser;
    (function (Parser) {
        var VirtualState = /** @class */ (function () {
            function VirtualState(attributeName_, value_) {
                this.attributeName = attributeName_;
                this.value = value_;
            }
            return VirtualState;
        }());
        Parser.VirtualState = VirtualState;
        var VirtualDom = /** @class */ (function () {
            function VirtualDom(tagName_, attributesList_, childList_, value_, key_, var_) {
                if (var_ === void 0) { var_ = null; }
                this.tagName = tagName_;
                this.attributesList = attributesList_;
                this.childList = childList_;
                this.value = value_;
                this.key = key_;
                this["var"] = var_;
            }
            return VirtualDom;
        }());
        Parser.VirtualDom = VirtualDom;
        Parser.getHtml = function () {
            return document.querySelector("html");
        };
        Parser.parseText = function (text) {
            var startNum = -1;
            var endNum = -1;
            for (var i = 0; i < text.length; i++) {
                var nowChar = text[i];
                if (nowChar !== "\n" && nowChar !== " ") {
                    startNum = i;
                    break;
                }
            }
            for (var i = text.length - 1; i >= 0; i--) {
                var nowChar = text[i];
                if (nowChar !== "\n" && nowChar !== " ") {
                    endNum = i;
                    break;
                }
            }
            if (startNum === -1 || endNum == -1)
                return "";
            return text.slice(startNum, endNum + 1);
        };
        Parser.texToDom = function (text) {
            return new VirtualDom("var-text", [], [], text, new VarInternal.Key.KeyForm(-1, -1));
        };
        Parser.parseAttributes = function (attributes) {
            var returningStates = [];
            for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
                var nowAttribute = attributes_1[_i];
                returningStates.push(new VirtualState(nowAttribute.name, nowAttribute.value));
            }
            return returningStates;
        };
        Parser.parse = function (element, key) {
            var children = [];
            var tagName = "";
            var attributes = [];
            var text = "";
            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = Parser.parseAttributes(element.attributes);
                text = element.innerHTML;
                var nowChild = Html.getChild(element);
                for (var i = 0; i < nowChild.length; i++) {
                    children.push(Parser.parse(nowChild[i], i));
                }
            }
            else if (element !== undefined && element !== null) {
                tagName = "var-text";
                text = Parser.parseText(element.nodeValue);
            }
            return new VirtualDom(tagName, attributes, children, text, new VarInternal.Key.KeyForm(key, children.length));
        };
    })(Parser = VarInternal.Parser || (VarInternal.Parser = {}));
    var Key;
    (function (Key) {
        var KeyForm = /** @class */ (function () {
            function KeyForm(myKey_, lastKey_) {
                this.myKey = myKey_;
                this.lastKey = lastKey_;
            }
            return KeyForm;
        }());
        Key.KeyForm = KeyForm;
        Key.getElement = function (virtualList, key) {
            var returnData = virtualList.find(function (element) { return element.key.myKey === key; });
            if (returnData instanceof Parser.VirtualDom)
                return returnData;
            else {
                console.error("".concat(key, " is not found"));
                return new Parser.VirtualDom("", [], [], "", new VarInternal.Key.KeyForm(-1, -1));
            }
        };
    })(Key = VarInternal.Key || (VarInternal.Key = {}));
    var Html;
    (function (Html) {
        Html.getChild = function (parent) {
            var childList = [];
            for (var _i = 0, _a = parent.childNodes; _i < _a.length; _i++) {
                var child = _a[_i];
                if (child.nodeValue === null || Parser.parseText(child.nodeValue) !== "")
                    childList.push(child);
            }
            return childList;
        };
    })(Html = VarInternal.Html || (VarInternal.Html = {}));
    var main;
    (function (main) {
        main.delList = [];
        main.init = function () {
            // start
            main.firstData = Parser.parse(Parser.getHtml(), 0);
            main.lastData = main.firstData;
            main.nowData = main.firstData;
            console.log("Var.js");
        };
        main.detectStart = function (time) {
            setInterval(function () {
                // set now data
                main.nowData = detecter.subVar(__assign({}, main.nowData));
                detecter.detect(document, main.lastData, main.nowData, 1);
                main.delList.map(function (element) { return changer.del(element); });
                main.delList = [];
                // set last data
                main.lastData = main.nowData;
            }, time);
        };
    })(main = VarInternal.main || (VarInternal.main = {}));
    var changer;
    (function (changer) {
        changer.makeEvent = function (myDom, data) {
            if (data["var"] !== undefined && data["var"] !== null) {
                if (data["var"]["onclick"] !== undefined)
                    myDom["onclick"] = data["var"]["onclick"];
                if (data["var"]["ondblclick"] !== undefined)
                    myDom["ondblclick"] = data["var"]["ondblclick"];
                if (data["var"]["onmousemove"] !== undefined)
                    myDom["onmousemove"] = data["var"]["onmousemove"];
                if (data["var"]["onmouseout"] !== undefined)
                    myDom["onmouseout"] = data["var"]["onmouseout"];
                if (data["var"]["onmouseover"] !== undefined)
                    myDom["onmouseover"] = data["var"]["onmouseover"];
                if (data["var"]["onmouseup"] !== undefined)
                    myDom["onmouseup"] = data["var"]["onmouseup"];
                if (data["var"]["onwheel"] !== undefined)
                    myDom["onwheel"] = data["var"]["onwheel"];
                if (data["var"]["ondrag"] !== undefined)
                    myDom["ondrag"] = data["var"]["ondrag"];
                if (data["var"]["ondragend"] !== undefined)
                    myDom["ondragend"] = data["var"]["ondragend"];
                if (data["var"]["ondragenter"] !== undefined)
                    myDom["ondragenter"] = data["var"]["ondragenter"];
                if (data["var"]["ondragleave"] !== undefined)
                    myDom["ondragleave"] = data["var"]["ondragleave"];
                if (data["var"]["ondragover"] !== undefined)
                    myDom["ondragover"] = data["var"]["ondragover"];
                if (data["var"]["ondragstart"] !== undefined)
                    myDom["ondragstart"] = data["var"]["ondragstart"];
                if (data["var"]["ondrop"] !== undefined)
                    myDom["ondrop"] = data["var"]["ondrop"];
                if (data["var"]["onscroll"] !== undefined)
                    myDom["onscroll"] = data["var"]["onscroll"];
                if (data["var"]["oncopy"] !== undefined)
                    myDom["oncopy"] = data["var"]["oncopy"];
                if (data["var"]["oncut"] !== undefined)
                    myDom["oncut"] = data["var"]["oncut"];
                if (data["var"]["onpaste"] !== undefined)
                    myDom["onpaste"] = data["var"]["onpaste"];
                myDom.style.display = "inline-block";
            }
            return myDom;
        };
        changer.make = function (data) {
            if (data.tagName === "var-text")
                return document.createTextNode(data.value);
            else {
                var myDom_1 = changer.makeEvent(document.createElement(data.tagName), data);
                data.attributesList.map(function (element) {
                    myDom_1.setAttribute(element.attributeName, element.value);
                });
                data.childList.map(function (element) {
                    myDom_1.append(changer.make(element));
                });
                return myDom_1;
            }
        };
        changer.add = function (parent, data) {
            parent.appendChild(changer.make(data));
        };
        changer.del = function (data) {
            data.remove();
        };
        changer.change = function (parent, target, newData) {
            parent.replaceChild(changer.make(newData), target);
        };
        changer.attrChange = function (target, lastAttr, nowAttr) {
            nowAttr.map(function (element) {
                var _a;
                if (lastAttr.find(function (e) { return e.attributeName === element.attributeName; }) === undefined)
                    target.setAttribute(element.attributeName, element.value);
                if (element.value !== ((_a = lastAttr.find(function (e) { return e.attributeName === element.attributeName; })) === null || _a === void 0 ? void 0 : _a.value))
                    target.setAttribute(element.attributeName, element.value);
            });
            // del
            lastAttr.map(function (element) {
                if (nowAttr.find(function (e) { return e.attributeName === element.attributeName; }) === undefined)
                    target.removeAttribute(element.attributeName);
            });
        };
    })(changer = VarInternal.changer || (VarInternal.changer = {}));
    var detecter;
    (function (detecter) {
        detecter.getState = function (target) {
            var myVar = target["var"];
            var _loop_1 = function (element) {
                var myValue = target.attributesList.find(function (e) { return e.attributeName === element; });
                if (myValue === undefined)
                    myVar[element] = undefined;
                else
                    myVar[element] = myValue.value;
            };
            for (var _i = 0, _a = target["var"].stateList; _i < _a.length; _i++) {
                var element = _a[_i];
                _loop_1(element);
            }
            return myVar;
        };
        detecter.excute = function (target, excFir) {
            var myVar = target["var"];
            myVar = detecter.getState(target);
            if (excFir) {
                myVar.myThis = myVar;
                myVar.innerHtml = target.childList;
            }
            if (excFir && myVar.Start !== undefined)
                myVar.Start();
            if (myVar.Update !== undefined)
                myVar.Update();
            var childList = [];
            childList = myVar.Render().childList;
            childList = childList.map(function (element) { return detecter.subVar(element); });
            return new Parser.VirtualDom(target.tagName, target.attributesList, childList, target.value, target.key, myVar);
        };
        detecter.subVar = function (target) {
            if (target["var"] === null || target["var"] === undefined) {
                var myTemplate = tempClasses[target.tagName];
                if (myTemplate === undefined)
                    return new Parser.VirtualDom(target.tagName, target.attributesList, target.childList.map(function (element) { return detecter.subVar(element); }), target.value, target.key, target["var"]);
                else {
                    var myVar = new myTemplate();
                    return detecter.excute(new Parser.VirtualDom(target.tagName, target.attributesList, target.childList, target.value, target.key, myVar), true);
                }
            }
            else
                return detecter.excute(target, false);
        };
        detecter.detect = function (parent, lastData, nowData, index) {
            if (parent instanceof HTMLElement) {
                var target = (Html.getChild(parent)[index]);
                if (!lastData && !nowData)
                    console.error("unexpected error");
                else if (!lastData && nowData) {
                    changer.add(parent, nowData);
                    return;
                }
                else if (lastData && !nowData) {
                    main.delList.push(target);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) !== (nowData === null || nowData === void 0 ? void 0 : nowData.tagName)) {
                    changer.change(parent, target, nowData);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === "var-text" && (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) === "var-text" && lastData.value != nowData.value) {
                    changer.change(parent, target, nowData);
                    return;
                }
                else if ((lastData === null || lastData === void 0 ? void 0 : lastData.tagName) === (nowData === null || nowData === void 0 ? void 0 : nowData.tagName) && (lastData === null || lastData === void 0 ? void 0 : lastData.tagName) !== "var-text")
                    changer.attrChange(target, lastData === null || lastData === void 0 ? void 0 : lastData.attributesList, nowData === null || nowData === void 0 ? void 0 : nowData.attributesList);
            }
            var maxData = (lastData === null || lastData === void 0 ? void 0 : lastData.childList.length) > (nowData === null || nowData === void 0 ? void 0 : nowData.childList.length) ? lastData === null || lastData === void 0 ? void 0 : lastData.childList : nowData === null || nowData === void 0 ? void 0 : nowData.childList;
            if (maxData !== undefined) {
                for (var i = 0; i < maxData.length; i++) {
                    var nowElement = Html.getChild(parent)[index];
                    detecter.detect(nowElement, lastData === null || lastData === void 0 ? void 0 : lastData.childList[i], nowData === null || nowData === void 0 ? void 0 : nowData.childList[i], i);
                }
            }
        };
    })(detecter = VarInternal.detecter || (VarInternal.detecter = {}));
})(VarInternal || (VarInternal = {}));
VarInternal.main.init();
VarInternal.main.detectStart(100);
