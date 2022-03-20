import { jsx } from "./../var-jsx/jsx";
import { parser } from "./../var-parser/parser";
export namespace tempParser {

    export class Variable {
        name: string;
        value: any;
        constructor(name_: string, value_: any) {
            this.name = name_;
            this.value = value_;
        }
    }
    export class Template {
        name: string;
        vars: Array<Variable>;
        states: Array<Variable>;
        constructor(name_: string, vars_: Array<Variable>, states_: Array<Variable>) {
            this.name = name_;
            this.vars = vars_;
            this.states = states_;
        }
    }
    const parse = (str: string): Array<Template> => {
        const tokens = parser.parse(`<html>${str}</html>`);
        const dom = jsx.parse(`<html>${str}</html>`)[0];

        const templates = dom.child.map(element => parseTemplate(element, tokens));
        return templates;
    };

    const parseState = (tokens: Array<parser.Token>): Array<Variable> => {
        const retVars: Array<Variable> = [];
        let i = 0;
        let isValue = false;
        let name = ``;
        while (true) {
            if (i === tokens.length)
                break;

            if (!isValue && tokens[i].type === parser.TokenType.command) {
                if (name !== ``)
                    retVars.push(new Variable(name, "undefined"));
                name = tokens[i].value;
            }

            if (isValue && tokens[i].type === parser.TokenType.command && (tokens[i].value === `false` || tokens[i].value === `true` || tokens[i].value === `null` || tokens[i].value === `undefined`)) {
                // true or false or undefined or null
                retVars.push(new Variable(name, tokens[i].value));
                isValue = false;
                name = ``;
            }

            if (isValue && tokens[i].type === parser.TokenType.number) {
                // number
                retVars.push(new Variable(name, tokens[i].value));
                isValue = false;
                name = ``;
            }

            if (isValue && (tokens[i].type === parser.TokenType.string_o || tokens[i].type === parser.TokenType.string_t || tokens[i].type === parser.TokenType.string_u)) {
                // true or false
                retVars.push(new Variable(name, parser.makeCode([tokens[i]])));
                isValue = false;
                name = ``;
            }

            if (isValue && tokens[i].type === parser.TokenType.bb_start) {
                // [js code]
                const bb: Array<boolean> = [];
                const myTokens: Array<parser.Token> = [];

                while (true) {
                    if (tokens[i].type === parser.TokenType.bb_start)
                        bb.push(true);
                    else if (tokens[i].type === parser.TokenType.bb_end)
                        bb.pop();
                    else
                        myTokens.push(tokens[i]);

                    if (bb.length === 0)
                        break;

                    i++;
                }

                retVars.push(new Variable(name, `()=>(${jsx.makeJsx(myTokens)})`));
                isValue = false;
                name = ``;
            }

            if (tokens[i].type === parser.getType(`=`))
                isValue = true;

            i++;
        }

        return retVars;
    };

    const parseTemplate = (dom: jsx.Dom, tokens: Array<parser.Token>): Template => {
        let renderCode: Array<parser.Token>, scriptCode: Array<parser.Token>;
        if (tokens[dom.child[0].endIndex.endIndex - 1].value === `render`) {
            renderCode = tokens.slice(dom.child[0].startIndex.startIndex, dom.child[0].endIndex.endIndex + 1);
            if (dom.child.length > 1)
                scriptCode = tokens.slice(dom.child[1].startIndex.endIndex + 1, dom.child[1].endIndex.startIndex);
            else
                scriptCode = [];
        }
        else {
            renderCode = tokens.slice(dom.child[1].startIndex.startIndex, dom.child[1].endIndex.endIndex + 1);
            scriptCode = tokens.slice(dom.child[0].startIndex.endIndex + 1, dom.child[0].endIndex.startIndex);
        }

        const stateCode = parseState(tokens.slice(dom.startIndex.startIndex + 2, dom.startIndex.endIndex));
        const name = parser.makeCode(tokens.slice(dom.endIndex.startIndex + 1, dom.endIndex.endIndex));
        const vars = makeVar(renderCode, scriptCode);

        return new Template(name, vars.map(el => new Variable(el.name, el.value
            .replaceAll(`Var@variable`, vars.map(e => e.name).filter(e => e !== `render` && e !== `Start` && e !== `Update`).join(`,`))
            .replaceAll(`Var@return`, vars.filter(e => e.name !== `render` && e.name !== `Start` && e.name !== `Update`).map(e => `"${e.name}":${e.name}`).join(`,`)))),
            stateCode);
    }

    const makeVar = (render: Array<parser.Token>, script: Array<parser.Token>): Array<Variable> => {
        const retVars: Array<Variable> = [];
        retVars.push(new Variable(`Render`, `()=>{return ${jsx.makeJsx(render)}}`));

        if (script.length !== 0) {
            for (let i = 0; i < script.length; i++) {
                if (script[i].value === `const` || script[i].value === `let` || script[i].value === `var`) {
                    const varName = script[i + 1].value;
                    const start = i + 3;
                    let end = 0, isFunc = false;
                    i += 3;

                    const mb: Array<true> = [];
                    while (true) {
                        if (script.length - 1 === i) {
                            end = i + 1;
                            break;
                        }
                        if (script[i].type === parser.getType(`{`)) {
                            isFunc = true;
                            mb.push(true);
                        }
                        if (script[i].type === parser.getType(`}`)) {
                            mb.pop();
                            if (!mb.length) {
                                end = i;
                                break;
                            }
                        }
                        if (!mb.length && (script[i].value === `const` || script[i].value === `let` || script[i].value === `var` || script[i].value === `function` || script[i].value === `\n` || script[i].value === `;`)) {
                            i--;
                            end = i;
                            break;
                        }

                        i++;
                    }

                    const value = jsx.makeJsx(script.slice(start, end + 1));
                    retVars.push(new Variable(varName, value));
                }
            }
        }

        return retVars;
    }

    export const makeTemplate = (str: string): string => {
        const templates: Array<Template> = parse(str);
        const retText: Array<string> = [];

        templates.map(element => {
            const name = element.name;
            const vars = element.vars.map(e => `this.${e.name}=${e.value}`).join(`;`);
            const states = element.states.map(e => `this.${e.name}=${e.value}`).join(`;`);
            const stateNames = element.states.map(e => `"${e.name}"`).join(`,`);

            retText.push(`this.${name} = class ${name} {constructor(){${vars};${states};this.stateList=[${stateNames}];}}`);
        });

        return retText.join(`;`);
    }
}