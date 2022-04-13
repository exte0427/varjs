namespace Var {

    export const make = (tagName: string, states: Array<VarInternal.Parser.VirtualState>, ...childNodes: Array<VarInternal.Parser.VirtualDom>): VarInternal.Parser.VirtualDom => {
        return new VarInternal.Parser.VirtualDom(tagName, states, childNodes.flat(), ``, new VarInternal.Key.KeyForm(-1, -1));
    }

    export const text = (value: string) => {
        return new VarInternal.Parser.VirtualDom(`var-text`, [], [], value, new VarInternal.Key.KeyForm(-1, -1));
    }

    export const state = (stateName: string, stateVal: any): VarInternal.Parser.VirtualState => {
        return new VarInternal.Parser.VirtualState(stateName, stateVal);
    }

    export const change = (value: any): VarInternal.Parser.VirtualDom => {
        if (Array.isArray(value) && value[0] instanceof VarInternal.Parser.VirtualDom)
            return Var.make(`variable`, [], ...value);
        else if (value instanceof VarInternal.Parser.VirtualDom)
            return Var.make(`variable`, [], value);
        else
            return Var.make(`variable`, [], Var.text(value));
    }
}

namespace VarInternal {

    export namespace Parser {
        export class VirtualState {
            attributeName: string;
            value: any;

            constructor(attributeName_: string, value_: any) {
                this.attributeName = attributeName_;
                this.value = value_;
            }
        }

        export class VirtualDom {
            tagName: string;
            attributesList: Array<VirtualState>;
            childList: Array<VirtualDom>;
            value: string;
            key: Key.KeyForm;
            var: any;

            constructor(tagName_: string, attributesList_: Array<VirtualState>, childList_: Array<VirtualDom>, value_: string, key_: Key.KeyForm, var_: any = null) {
                this.tagName = tagName_;
                this.attributesList = attributesList_;
                this.childList = childList_;
                this.value = value_;
                this.key = key_;
                this.var = var_;
            }
        }

        export const getHtml = (): HTMLElement => {
            return document.querySelector(`html`) as HTMLElement;
        }

        export const parseText = (text: string): string => {
            let startNum = -1;
            let endNum = -1;

            for (let i = 0; i < text.length; i++) {
                const nowChar: string = text[i] as string;
                if (nowChar !== `\n` && nowChar !== ` `) {
                    startNum = i;
                    break;
                }
            }

            for (let i = text.length - 1; i >= 0; i--) {
                const nowChar: string = text[i] as string;
                if (nowChar !== `\n` && nowChar !== ` `) {
                    endNum = i;
                    break;
                }
            }

            if (startNum === -1 || endNum == -1)
                return ``;

            return text.slice(startNum, endNum + 1);
        }

        export const texToDom = (text: string): VirtualDom => {
            return new VirtualDom(`var-text`, [], [], text, new VarInternal.Key.KeyForm(-1, -1));
        }

        export const parseAttributes = (attributes: NamedNodeMap): Array<VirtualState> => {
            const returningStates: Array<VirtualState> = [];
            for (const nowAttribute of attributes)
                returningStates.push(new VirtualState(nowAttribute.name, nowAttribute.value));

            return returningStates;
        }

        export const parse = (element: HTMLElement | ChildNode | Element, key: number): VirtualDom => {

            const children: Array<VirtualDom> = [];
            let tagName = ``;
            let attributes: Array<VirtualState> = [];
            let text = ``;

            if (element instanceof HTMLElement || element instanceof Element) {
                tagName = element.tagName.toLowerCase();
                attributes = parseAttributes(element.attributes);
                text = element.innerHTML;

                const nowChild = Html.getChild(element);

                for (let i = 0; i < nowChild.length; i++) {
                    children.push(parse(nowChild[i], i));
                }
            }
            else if (element !== undefined && element !== null) {
                tagName = `var-text`;
                text = parseText(element.nodeValue as string);
            }

            return new VirtualDom(tagName, attributes, children, text, new VarInternal.Key.KeyForm(key, children.length));
        }
    }

    export namespace Key {
        export class KeyForm {
            myKey: number;
            lastKey: number;

            constructor(myKey_: number, lastKey_: number) {
                this.myKey = myKey_;
                this.lastKey = lastKey_;
            }
        }

        export const getElement = (virtualList: Array<Parser.VirtualDom>, key: number): Parser.VirtualDom => {
            const returnData = virtualList.find(element => element.key.myKey === key);
            if (returnData instanceof Parser.VirtualDom)
                return returnData
            else {
                console.error(`${key} is not found`);
                return new Parser.VirtualDom("", [], [], "", new VarInternal.Key.KeyForm(-1, -1));
            }
        }
    }

    export namespace Html {
        export const getChild = (parent: ChildNode | Document | HTMLElement): Array<ChildNode> => {
            const childList = [];

            for (const child of parent.childNodes)
                if (child.nodeValue === null || Parser.parseText(child.nodeValue as string) !== ``)
                    childList.push(child);

            return childList;
        }
    }

    export namespace main {
        export let firstData: Parser.VirtualDom | undefined;
        export let lastData: Parser.VirtualDom | undefined;
        export let nowData: Parser.VirtualDom | undefined;

        export let delList: Array<HTMLElement> = [];

        export const init = (): void => {
            // start

            firstData = Parser.parse(Parser.getHtml(), 0);

            lastData = firstData;
            nowData = firstData;
            console.log(`Var.js`);
        }

        export const detectStart = (time: number): void => {
            setInterval(() => {

                // set now data
                nowData = detecter.subVar({ ...(nowData as Parser.VirtualDom) });

                detecter.detect(document, lastData, nowData, 1);

                delList.map(element => changer.del(element));
                delList = [];

                // set last data
                lastData = nowData;

            }, time)
        }
    }

    export namespace changer {
        export const makeEvent = (myDom: HTMLElement, data: Parser.VirtualDom): HTMLElement => {
            if (data.var !== undefined && data.var !== null) {
                const eventList = [`onclick`, `ondblclick`, `onmousemove`, `onmouseout`, `onmouseover`, `onmouseup`, `onwheel`, `ondrag`, `ondragend`, `ondragenter`, `ondragleave`, `ondragover`, `ondragstart`
                    `ondrop`, `onscroll`, `oncopy`, `oncut`, `onpaste`, `onpaste`];
                eventList.map(e => {
                    if (data.var[e] !== undefined)
                        myDom[e] = ((thisDom) => (() => { thisDom[`is_${e}`] = true; }))(myDom);
                });

                myDom.style.display = `inline-block`;
            }

            return myDom;
        }

        export const make = (data: Parser.VirtualDom): HTMLElement | Text => {
            if (data.tagName === `var-text`) {
                const myDom = document.createTextNode(data.value);

                data.var.thisElement = myDom;
                return myDom;
            }
            else {
                const myDom: HTMLElement = makeEvent(document.createElement(data.tagName), data);

                data.attributesList.map(element => {
                    myDom.setAttribute(element.attributeName, element.value);
                });

                data.childList.map(element => {
                    myDom.append(make(element));
                });

                data.var.thisElement = myDom;
                return myDom;
            }
        }

        export const add = (parent: HTMLElement, data: Parser.VirtualDom): void => {
            parent.appendChild(make(data));
        }

        export const del = (data: HTMLElement): void => {
            data.remove();
        }

        export const change = (parent: HTMLElement, target: HTMLElement, newData: Parser.VirtualDom): void => {
            parent.replaceChild(make(newData), target);
        }

        export const attrChange = (target: HTMLElement, lastAttr: Array<Parser.VirtualState>, nowAttr: Array<Parser.VirtualState>): void => {
            nowAttr.map((element) => {
                if (lastAttr.find(e => e.attributeName === element.attributeName) === undefined)
                    target.setAttribute(element.attributeName, element.value);
                if (element.value !== lastAttr.find(e => e.attributeName === element.attributeName)?.value)
                    target.setAttribute(element.attributeName, element.value);
            });

            // del
            lastAttr.map(element => {
                if (nowAttr.find(e => e.attributeName === element.attributeName) === undefined)
                    target.removeAttribute(element.attributeName);
            })
        }
    }

    export namespace detecter {

        export const getState = (target: Parser.VirtualDom) => {
            const myVar = target.var;
            for (const element of target.var.stateList) {
                const myValue = target.attributesList.find(e => e.attributeName === element);

                if (myValue === undefined)
                    myVar[element] = undefined;
                else
                    myVar[element] = myValue.value;
            }

            return myVar;
        }

        export const excute = (target: Parser.VirtualDom, excFir: boolean): Parser.VirtualDom => {
            let myVar = target.var;
            myVar = getState(target);

            if (excFir) {
                myVar.myThis = myVar;
                myVar.innerHtml = target.childList;
            }
            if (excFir && myVar.Start !== undefined)
                myVar.Start();

            if (myVar.Update !== undefined)
                myVar.Update();

            let childList: Array<Parser.VirtualDom> = [];
            childList = myVar.Render().childList;
            childList = childList.map(element => subVar(element));

            return new Parser.VirtualDom(target.tagName, target.attributesList, childList, target.value, target.key, myVar);
        }

        export const subVar = (target: Parser.VirtualDom): Parser.VirtualDom => {
            if (target.var === null || target.var === undefined) {
                const myTemplate = tempClasses[target.tagName];
                if (myTemplate === undefined)
                    return new Parser.VirtualDom(target.tagName, target.attributesList, target.childList.map(element => subVar(element)), target.value, target.key, target.var);
                else {
                    const myVar = new myTemplate();
                    return excute(new Parser.VirtualDom(target.tagName, target.attributesList, target.childList, target.value, target.key, myVar), true);
                }
            }
            else
                return excute(target, false);
        }

        export const detect = (parent: HTMLElement | Document, lastData: Parser.VirtualDom | undefined, nowData: Parser.VirtualDom | undefined, index: number): void => {

            if (parent instanceof HTMLElement) {
                const target: HTMLElement = (Html.getChild(parent)[index]) as HTMLElement;

                if (!lastData && !nowData)
                    console.error(`unexpected error`);
                else if (!lastData && nowData) {
                    changer.add(parent, nowData);
                    return;
                }

                else if (lastData && !nowData) {
                    main.delList.push(target);
                    return;
                }

                else if (lastData?.tagName !== nowData?.tagName) {
                    changer.change(parent, target, nowData as Parser.VirtualDom);
                    return;
                }

                else if (lastData?.tagName === `var-text` && nowData?.tagName === `var-text` && lastData.value != nowData.value) {
                    changer.change(parent, target, nowData as Parser.VirtualDom);
                    return;
                }

                else if (lastData?.tagName === nowData?.tagName && lastData?.tagName !== `var-text`)
                    changer.attrChange(target, lastData?.attributesList as Array<Parser.VirtualState>, nowData?.attributesList as Array<Parser.VirtualState>);
            }
            const maxData: Array<Parser.VirtualDom> | undefined = ((lastData?.childList.length) as number) > ((nowData?.childList.length) as number) ? lastData?.childList : nowData?.childList;
            if (maxData !== undefined) {
                for (let i = 0; i < maxData.length; i++) {
                    const nowElement = Html.getChild(parent)[index];
                    detect((nowElement as HTMLElement), lastData?.childList[i], nowData?.childList[i], i);
                }
            }

        }
    }
}

VarInternal.main.init();
VarInternal.main.detectStart(100);