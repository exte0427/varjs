import { parser } from "./../var-parser/parser";
import { log } from "./../var-log/log";
export namespace jsx {
    export const setting = {
        "domMaker": "Var.make",
        "textMaker": "Var.text",
        "stateMaker": "Var.state",
        "chageMaker": "Var.change"
    };

    export const parseText = (text: string): string => {
        let startNum = -1;
        let endNum = -1;

        for (let i = 0; i < text.length; i++) {
            const nowChar: string = text[i];
            if (nowChar !== `\n` && nowChar !== ` `) {
                startNum = i;
                break;
            }
        }

        for (let i = text.length - 1; i >= 0; i--) {
            const nowChar: string = text[i];
            if (nowChar !== `\n` && nowChar !== ` `) {
                endNum = i;
                break;
            }
        }

        if (startNum === -1 || endNum === -1)
            return ``;

        return text.slice(startNum, endNum + 1);
    };

    const str_varChange = (myToken: parser.Token): parser.Token => {
        if (myToken.type === parser.TokenType.string_o) {

            const values = [`'`];
            const str = myToken.value;

            for (let i = 0; i < str.length; i++) {
                if (str[i] === `[`) {
                    let nowStr = ``;
                    while (str[i + 1] !== `]`) {
                        nowStr += str[i + 1];
                        i++;
                    }

                    values[values.length - 1] += `'`;
                    values.push(`(${nowStr})`);
                    values.push(`'`);
                    i++;
                }
                else {
                    values[values.length - 1] += str[i];
                }
            }

            if (values[values.length - 1].charAt(values[values.length - 1].length - 1) !== `'`)
                values[values.length - 1] += `'`;

            return new parser.Token(parser.TokenType.command, values.join(`+`));
        }
        if (myToken.type === parser.TokenType.string_t) {

            const values = [`"`];
            const str = myToken.value;

            for (let i = 0; i < str.length; i++) {
                if (str[i] === `[`) {
                    let nowStr = ``;
                    while (str[i + 1] !== `]`) {
                        nowStr += str[i + 1];
                        i++;
                    }

                    values[values.length - 1] += `"`;
                    values.push(`(${nowStr})`);
                    values.push(`"`);
                    i++;
                }
                else {
                    values[values.length - 1] += str[i];
                }
            }

            if (values[values.length - 1].charAt(values[values.length - 1].length - 1) !== `"`)
                values[values.length - 1] += `"`;

            return new parser.Token(parser.TokenType.command, values.join(`+`));
        }

        return new parser.Token(parser.TokenType.string_u, myToken.value.replaceAll(`[`, `\${`).replaceAll(`]`, `}`));
    }

    class DomPart {
        startIndex: number;
        endIndex: number;

        constructor(startIndex_: number, endIndex_: number) {
            this.startIndex = startIndex_;
            this.endIndex = endIndex_;
        }
    }

    export class Dom {
        startIndex: DomPart;
        endIndex: DomPart;
        child: Array<Dom>;

        constructor(startIndex_: DomPart, endIndex_: DomPart, child_: Array<Dom>) {
            this.startIndex = startIndex_;
            this.endIndex = endIndex_;
            this.child = child_;
        }
    }

    class State {
        key: string;
        data: parser.Token;

        constructor(key_: string, data_: parser.Token) {
            this.key = key_;
            this.data = data_;
        }
    }

    const getState = (tokens: Array<parser.Token>): Array<State> => {
        const retVars: Array<State> = [];
        let i = 0;
        let isValue = false;
        let name = ``;
        while (true) {
            if (i === tokens.length)
                break;

            if (!isValue && tokens[i].type === parser.TokenType.command) {
                if (name !== ``)
                    retVars.push(new State(name, new parser.Token(parser.TokenType.command, `undefined`)));
                name = tokens[i].value;
            }

            if (isValue && tokens[i].type === parser.TokenType.command && (tokens[i].value === `false` || tokens[i].value === `true` || tokens[i].value === `null` || tokens[i].value === `undefined`)) {
                // true or false or undefined or null
                retVars.push(new State(name, tokens[i]));
                isValue = false;
                name = ``;
            }

            if (isValue && tokens[i].type === parser.TokenType.number) {
                // number
                retVars.push(new State(name, tokens[i]));
                isValue = false;
                name = ``;
            }

            if (isValue && (tokens[i].type === parser.TokenType.string_o || tokens[i].type === parser.TokenType.string_t || tokens[i].type === parser.TokenType.string_u)) {
                // true or false
                retVars.push(new State(name, str_varChange(tokens[i])));
                isValue = false;
                name = ``;
            }

            if (isValue && tokens[i].type === parser.TokenType.bb_start) {
                // [js code]
                const bb: Array<boolean> = [];
                const myTokens: Array<parser.Token> = [];

                while (true) {
                    if (tokens[i].type === parser.TokenType.bb_start) {
                        const nowLen = bb.length;
                        const nowTokens: Array<parser.Token> = [];
                        bb.push(true);

                        while (bb.length !== nowLen) {
                            i++;
                            nowTokens.push(tokens[i]);

                            if (tokens[i].type === parser.TokenType.bb_start)
                                bb.push(true);
                            if (tokens[i].type === parser.TokenType.bb_end)
                                bb.pop();
                        }

                        nowTokens.pop();
                        myTokens.push(new parser.Token(parser.TokenType.command, `((myThis)=>(()=>(${makeJsx(nowTokens)})))(this)`));
                    }
                    else if (tokens[i].type === parser.TokenType.bb_end)
                        bb.pop();
                    else {
                        if (tokens[i].type === parser.TokenType.string_o || tokens[i].type === parser.TokenType.string_t || tokens[i].type === parser.TokenType.string_u)
                            myTokens.push(str_varChange(tokens[i]));
                        else
                            myTokens.push(tokens[i]);
                    }

                    if (bb.length === 0)
                        break;

                    i++;
                }

                retVars.push(new State(name, new parser.Token(parser.TokenType.command, makeJsx(myTokens))));
                isValue = false;
                name = ``;
            }

            if (tokens[i].type === parser.getType(`=`))
                isValue = true;

            i++;
        }

        return retVars;
    };

    const makeJs_state = (states: Array<State>): string => {
        const returnCode: Array<string> = [];

        for (const state of states) {
            returnCode.push(`${setting.stateMaker}(\`${state.key}\`,${parser.makeCode([state.data])})`);
        }

        return `[${returnCode.join(`,`)}]`;
    }

    const makeJs_dom = (name: string, states: string, childs: string) => {
        if (parseText(childs) === "")
            return `${setting.domMaker}(\`${name}\`,${states})`;
        else
            return `${setting.domMaker}(\`${name}\`,${states},${childs})`;
    }

    const makeJs_text = (value: string) => {
        if (parseText(value) !== ``)
            return `${setting.textMaker}(\`${parseText(value)}\`)`;
        else
            return ``;
    }

    const makeJs_change = (value: string) => {
        return `${setting.chageMaker}(((myThis)=>(${value}))(this))`;
    }

    const makeJs_child = (tokens: Array<parser.Token>, myDom: Dom): string => {
        const returnTokens: Array<parser.Token> = [];
        const isVar: Array<boolean> = [];
        let nowText: Array<parser.Token> = [];
        let nowDom_index = 0;

        for (let i = myDom.startIndex.endIndex + 1; i < myDom.endIndex.startIndex; i++) {
            if (nowText.length > 0 && nowText[0].type === parser.getType(`[`) && tokens[i].type === parser.getType(`]`)) {
                isVar.pop();
                if (isVar.length === 0) {
                    returnTokens.push(new parser.Token(parser.TokenType.command, makeJs_change(make(nowText.slice(1, nowText.length)))));
                    nowText = [];
                }
                else
                    nowText.push(tokens[i]);
            }
            else if (i < myDom.endIndex.startIndex && tokens[i].type === parser.getType(`[`)) {
                if (isVar.length === 0) {
                    if (makeJs_text(nowText.map(element => element.value).join(``)) !== ``)
                        returnTokens.push(new parser.Token(parser.TokenType.command, parser.makeCode(nowText)));

                    nowText = [];
                }
                isVar.push(true);
                nowText.push(tokens[i]);
            }
            else if ((nowDom_index < myDom.child.length && i === myDom.child[nowDom_index].startIndex.startIndex)) {
                if (nowText.filter(text => text.type === parser.TokenType.command).length !== 0) {
                    if (makeJs_text(nowText.map(element => element.value).join(``)) !== ``)
                        returnTokens.push(new parser.Token(parser.TokenType.command, makeJs_text(parser.makeCode(nowText))));
                }
                nowText = [];

                returnTokens.push(new parser.Token(parser.TokenType.command, htmlToJsx(tokens, myDom.child[nowDom_index])));
                i = myDom.child[nowDom_index].endIndex.endIndex;
                nowDom_index++;
            }
            else
                nowText.push(tokens[i]);
        }

        if (nowText.filter(text => text.type === parser.TokenType.command).length !== 0)
            if (makeJs_text(nowText.map(element => element.value).join(``)) !== ``)
                returnTokens.push(new parser.Token(parser.TokenType.command, makeJs_text(parser.makeCode(nowText))));

        return returnTokens.map(element => element.value).join(`,`);
    }

    const htmlToJsx = (tokens: Array<parser.Token>, myDom: Dom): string => {
        const startTokens = tokens.slice(myDom.startIndex.startIndex + 1, myDom.startIndex.endIndex);

        const name = startTokens[0].value;
        const states = getState(startTokens.slice(1, startTokens.length));
        const childs = makeJs_child(tokens, myDom);

        return makeJs_dom(name, makeJs_state(states), childs);
    };

    const sub = (tokens: Array<parser.Token>, doms: Array<Dom>): Array<parser.Token> => {
        const returnTokens: Array<parser.Token> = [];
        let nowDom_num = 0;

        for (let index = 0; index < tokens.length; index++) {
            if (nowDom_num < doms.length && index === doms[nowDom_num].startIndex.startIndex) {
                returnTokens.push(new parser.Token(parser.TokenType.command, htmlToJsx(tokens, doms[nowDom_num])));
                index = doms[nowDom_num].endIndex.endIndex;

                nowDom_num++;
            }
            else
                returnTokens.push(tokens[index]);
        }

        return returnTokens;
    };

    const domStartError = (domStart: Array<DomPart>, tokens: Array<parser.Token>) => {
        if (domStart.length > 0) {
            for (const myDom of domStart) {
                const bb: Array<boolean> = [];
                const myTokens = tokens.slice(myDom.startIndex + 1, myDom.endIndex);
                for (const nowToken of myTokens) {
                    if (!(nowToken.type === parser.TokenType.command
                        || nowToken.type === parser.TokenType.string_o
                        || nowToken.type === parser.TokenType.string_t
                        || nowToken.type === parser.TokenType.string_u
                        || nowToken.type === parser.TokenType.same
                        || nowToken.type === parser.TokenType.number
                    )) {
                        if (nowToken.type === parser.TokenType.bb_start)
                            bb.push(true);
                        else if (nowToken.type === parser.TokenType.bb_end)
                            bb.pop();
                        else if (!bb.length) {
                            log.error(`Var-Jsx`, `Html Tag isn't closed`, tokens, nowToken.line);
                        }
                    }
                }
            }
        }
    }

    const parseHtml = (tokens: Array<parser.Token>, isHtml: boolean): Array<Dom> => {
        const dom_start: Array<number> = [];
        const dom_end: Array<number> = [];

        const domStart: Array<DomPart> = [];
        const doms: Array<Dom> = [];

        const varList: Array<boolean> = [];

        for (let index = 0; index < tokens.length; index++) {
            const nowToken = tokens[index];

            if (nowToken.type === parser.getType(`[`))
                varList.push(true);
            if (nowToken.type === parser.getType(`]`))
                varList.pop();

            if (!varList.length) {
                if (nowToken.type === parser.getType(`<`))
                    dom_start.push(index);
                else if (nowToken.type === parser.getType(`</`))
                    dom_end.push(index);
                else if (nowToken.type === parser.getType(`>`)) {
                    if (dom_end.length !== 0) {
                        if (domStart.length < 1) {
                            log.error(`Var-Jsx`, `Unexpected close`, tokens, nowToken.line);
                        }
                        else {
                            const firstPart = domStart[domStart.length - 1];
                            const lastPart = new DomPart(dom_end[dom_end.length - 1], index);
                            const child: Array<Dom> = [];

                            if (tokens[firstPart.startIndex + 1].value === tokens[lastPart.endIndex - 1].value) {

                                for (let i = 0; i < doms.length; i++) {
                                    if (doms[i].startIndex.startIndex > firstPart.startIndex) {
                                        child.push(doms[i]);
                                        doms.splice(i, 1);
                                        i--;
                                    }
                                }

                                for (const myPart of domStart)
                                    if (myPart.startIndex > firstPart.startIndex)
                                        domStartError([myPart], tokens);

                                dom_end.pop();
                                domStart.pop();

                                doms.push(new Dom(firstPart, lastPart, child));
                            }
                            else {
                                log.error(`Var-Jsx`, `<${tokens[firstPart.startIndex + 1].value}> isn't closed`, tokens, tokens[lastPart.startIndex - 1].line);
                                domStart.pop();
                                dom_end.pop();
                            }
                        }
                    }
                    else {
                        const firstIndex = dom_start[dom_start.length - 1];
                        const lastIndex = index;
                        dom_start.pop();

                        domStart.push(new DomPart(firstIndex, lastIndex));
                    }
                }
            }

        }

        if (dom_end.length > 0)
            log.error(`Var-Jsx`, `Html Tag isn't closed`, tokens, tokens[dom_end[0]].line);
        domStartError(domStart, tokens);

        if (isHtml) {
            if (dom_start.length > 0)
                log.error(`Var-Jsx`, `Unexpective Tag`, tokens, tokens[dom_start[0]].line);
            if (dom_end.length > 0)
                log.error(`Var-Jsx`, `Unexpective Tag`, tokens, tokens[dom_end[0]].line);
            if (domStart.length > 0) {
                for (const myDom of domStart)
                    log.error(`Var-Jsx`, `<${tokens[myDom.startIndex + 1].value}> isn't closed`, tokens, tokens[tokens.length - 1].line);
            }
        }

        return doms;
    }

    const make = (tokens: Array<parser.Token>): string => {

        return parser.makeCode(sub(tokens, parseHtml(tokens, false)));
    };

    export const parse = (code: string): Array<Dom> => {
        return parseHtml(parser.parse(code), true);
    }

    export const translate = (code: string): string => {
        return make(parser.parse(code));
    }

    export const makeJsx = (tokens: Array<parser.Token>) => {
        return make(tokens);
    }
};