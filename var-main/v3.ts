namespace Var {
    export namespace New {
        export const state = (name: string, info: any) => {
            return new Virtual.State(name, info);
        }
        export const el = (tag: string, state: Array<Virtual.State>, ...children: Array<Virtual.Dom>) => {
            return new Virtual.Dom(tag, state, children);
        }
        export const text = (data: string) => {
            return new Virtual.Dom(`text`, [state(`value`, data)], []);
        }
    }

    export namespace Virtual {
        export class State {
            name: string;
            info: any;
            constructor(name_: string, info_: any) {
                this.name = name_;
                this.info = info_;
            }
        }
        export class Dom {
            tag: string;
            states: Array<State>;
            children: Array<Dom>;
            constructor(tag_: string, states_: Array<State>, children_: Array<Dom>) {
                this.tag = tag_;
                this.states = states_;
                this.children = children_;
            }

            findState(name: string) {
                return this.states.find(e => e.name === name) as State;
            }
        }
    }

    export namespace Internal {
        export namespace Compare {
            let delList: Array<HTMLElement> = [];

            export const start = (nowDoms: Array<Virtual.Dom>, lastDoms: Array<Virtual.Dom>, parentEl: HTMLElement) => {
                const biggers = nowDoms.length > lastDoms.length ? nowDoms : lastDoms;
                for (let i = 0; i < biggers.length; i++)
                    main(nowDoms[i], lastDoms[i], parentEl, i);

                delList.map(e => Html.del(e));
                delList = [];
            }

            const main = (nowDom: Virtual.Dom, lastDom: Virtual.Dom, parentEl: HTMLElement, index: number) => {
                const target = parentEl.children[index] as HTMLElement;

                if (!lastDom && nowDom) {
                    Html.add(parentEl, nowDom);
                    return;
                }
                if (lastDom && !nowDom) {
                    delList.push(target);
                    return;
                }
                if (lastDom.tag !== nowDom.tag) {
                    Html.change(parentEl, target, nowDom);
                    return;
                }
                if (lastDom.tag === `text` && nowDom.tag === `text` && lastDom.findState(`value`).info !== nowDom.findState(`value`).info) {
                    Html.changeText(target, nowDom);
                    return;
                }
                if (lastDom.tag === nowDom.tag) {
                    Html.changeState(target, lastDom.states, nowDom.states);
                }

                const biggers = nowDom.children.length > lastDom.children.length ? nowDom.children : lastDom.children;
                for (let i = 0; i < biggers.length; i++)
                    main(nowDom.children[i], lastDom.children[i], target, i);
            }
        }

        export namespace Html {
            const make = (data: Virtual.Dom): HTMLElement | Text => {
                if (data.tag === `text`) {
                    const myDom = document.createElement(`var-text`);
                    const element = document.createTextNode(data.findState(`value`).info);
                    myDom.appendChild(element);

                    return myDom;
                }
                else {
                    const myDom: HTMLElement = document.createElement(data.tag);

                    data.states.map(element => {
                        if (element.name !== `value`)
                            myDom.setAttribute(element.name, element.info);
                    });

                    data.children.map(element => {
                        myDom.append(make(element));
                    });

                    return myDom;
                }
            }

            export const add = (parentEl: HTMLElement, data: Virtual.Dom) => {
                parentEl.appendChild(make(data));
            }

            export const change = (parentEl: HTMLElement, target: HTMLElement, data: Virtual.Dom) => {
                parentEl.replaceChild(make(data), target);
            }

            export const changeText = (el: HTMLElement, data: Virtual.Dom) => {
                el.innerHTML = data.findState(`value`).info;
            }

            export const changeState = (el: HTMLElement, lastStates: Array<Virtual.State>, nowStates: Array<Virtual.State>) => {
                //add & change
                nowStates.map((element) => {
                    if (lastStates.find(e => e.name === element.name) === undefined)
                        el.setAttribute(element.name, element.info);
                    if (element.info !== lastStates.find(e => e.name === element.name)?.info)
                        el.setAttribute(element.name, element.info);
                });

                // del
                lastStates.map(element => {
                    if (nowStates.find(e => e.name === element.name) === undefined)
                        el.removeAttribute(element.name);
                });
            }

            export const del = (data: HTMLElement) => {
                data.remove();
            }
        }
    }
}

class App {
    el: string;
    lastDom: Var.Virtual.Dom;
    nowDom: Var.Virtual.Dom;
    mainDom: () => Array<Var.Virtual.Dom>;

    constructor(el_: string) {
        this.el = el_;
        this.mainDom = () => [];
        this.lastDom = new Var.Virtual.Dom(``, [], []);
        this.nowDom = new Var.Virtual.Dom(``, [], []);
    }

    render(mainDom_: () => Array<Var.Virtual.Dom>) {
        this.mainDom = mainDom_;
        return this;
    }

    start(sec: number) {
        if (this.mainDom === undefined)
            throw new Error(`cannot start without main Dom, use render() to set the main Dom`);

        if (document.querySelector(this.el) === null)
            throw new Error(`cannot start with current ${this.el} element`);

        setInterval(() => {
            this.nowDom = new Var.Virtual.Dom(`App`, [], this.mainDom());
            Var.Internal.Compare.start(this.nowDom?.children, this.lastDom?.children, document.querySelector(this.el) as HTMLElement);
            this.lastDom = this.nowDom;
        }, sec * 1000)
    }
}
