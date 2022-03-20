export namespace parser {
    export enum TokenType {
        command,
        string_u,
        string_o,
        string_t,
        number,

        sb_start, // (
        sb_end,   // )
        mb_start, // {
        mb_end,   // }
        bb_start, // [
        bb_end,   // ]

        plus,     // +
        minus,    // -
        mul,      // *
        div,      // /
        not,      // !

        add_s,      // ++
        mis_s,       // --

        same,     // =
        div_same, // /=
        mul_same, // *=
        add_same, // +=
        mis_same, // -=

        eq,       // ==
        eq_jn,     // :
        uneq,     // !=
        eq_t,     // ===
        uneq_t,   // !==
        big,      // >
        big_s,    // >=
        small,    // <
        se,       // />
        ee,       // </
        small_s,  // <=
        pow,      // ^
        pow_o,    // **
        rem,      // %

        and,      // &&
        or,       // ||

        arrow,    // =>
        comma,    // ,
        point,    // .
        oa,       // @

        semi,     // ;
        other,     // other

    }

    export class Token {
        type: TokenType;
        value: string;

        constructor(type_: TokenType, value_: string) {
            this.type = type_;
            this.value = value_;
        }
    }

    export const parse = (code: string) => {
        const tokens: Array<Token> = [];

        for (let i = 0; i < code.length; i++) {

            if (code[i] === `(`)
                tokens.push(new Token(TokenType.sb_start, `(`));
            else if (code[i] === `)`)
                tokens.push(new Token(TokenType.sb_end, `)`));
            else if (code[i] === `{`)
                tokens.push(new Token(TokenType.mb_start, `{`));
            else if (code[i] === `}`)
                tokens.push(new Token(TokenType.mb_end, `}`));
            else if (code[i] === `[`)
                tokens.push(new Token(TokenType.bb_start, `[`));
            else if (code[i] === `]`)
                tokens.push(new Token(TokenType.bb_end, `]`));
            else if (code[i] === `*`) {
                if (i + 1 < code.length && code[i + 1] === `*`) {
                    tokens.push(new Token(TokenType.pow_o, `**`));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.mul_same, `*=`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.mul, `*`));
            }
            else if (code[i] === `/`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.div_same, `/=`));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `/`) {
                    while (i === code.length - 1 || code[i] === `\n`) { i++; }
                }
                else if (i + 1 < code.length && code[i + 1] === `*`) {
                    while (code[i] === `*` && code[i + 1] === `/`) { i++; }
                }
                else if (i + 1 < code.length && code[i + 1] === ">") {
                    tokens.push(new Token(TokenType.se, `/>`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.div, ``));
            }
            else if (code[i] === `+`) {
                if (i + 1 < code.length && code[i + 1] === `+`) {
                    tokens.push(new Token(TokenType.add_s, `++`));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.add_same, `+=`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.plus, `+`));
            }
            else if (code[i] === `-`) {
                if (i + 1 < code.length && code[i + 1] === `-`) {
                    tokens.push(new Token(TokenType.mis_s, `--`));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.mis_same, `-=`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.minus, `-`));
            }
            else if (code[i] === `!`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.uneq, `!=`));
                    i++;
                }
                else if (i + 2 < code.length && code[i + 1] === `=` && code[i + 2] === `=`) {
                    tokens.push(new Token(TokenType.uneq_t, `!==`));
                    i += 2;
                }
                else
                    tokens.push(new Token(TokenType.not, `!`));
            }
            else if (code[i] === `=`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.eq, `==`));
                    i++;
                }
                else if (i + 2 < code.length && code[i + 1] === `=` && code[i + 2] === `=`) {
                    tokens.push(new Token(TokenType.eq_t, `===`));
                    i += 2;
                }
                else if (i + 1 < code.length && code[i + 1] === ">") {
                    tokens.push(new Token(TokenType.arrow, `=>`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.same, `=`));
            }
            else if (code[i] === `:`)
                tokens.push(new Token(TokenType.eq_jn, `:`));
            else if (code[i] === `>`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.big_s, `>=`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.big, `>`));
            }
            else if (code[i] === `<`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.small_s, `<=`));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `/`) {
                    tokens.push(new Token(TokenType.ee, `</`));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.small, `<`));
            }
            else if (code[i] === `^`)
                tokens.push(new Token(TokenType.pow, `^`));
            else if (code[i] === `%`)
                tokens.push(new Token(TokenType.rem, `%`));
            else if (i + 1 < code.length && code[i] === `&` && code[i + 1] === `&`) {
                i++;
                tokens.push(new Token(TokenType.and, `&&`));
            }
            else if (i + 1 < code.length && code[i] === `|` && code[i + 1] === `|`) {
                i++;
                tokens.push(new Token(TokenType.or, `||`));
            }
            else if (code[i] === `.`)
                tokens.push(new Token(TokenType.point, `.`));
            else if (code[i] === `,`)
                tokens.push(new Token(TokenType.comma, `,`));
            else if (code[i] === `@`)
                tokens.push(new Token(TokenType.oa, `@`));
            else if (code[i] === `;`)
                tokens.push(new Token(TokenType.semi, `;`));

            else if ((/[0-9]/g).test(code[i])) {
                let num: string = "";
                while (i < code.length && (/[0-9]/g).test(code[i])) {
                    num += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.number, num));

                i--;
            }
            else if ((/[a-zA-Z]/g).test(code[i])) {
                let cmd: string = "";
                while (i < code.length && (/[a-zA-Z0-9]/g).test(code[i])) {
                    cmd += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.command, cmd));

                i--;
            }
            else if (code[i] === `\``) {
                let str: string = "";
                i++;
                while (code[i] !== `\``) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_u, str));
            }
            else if (code[i] === `\"`) {
                let str: string = "";
                i++;
                while (code[i] !== `\"`) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_t, str));
            }
            else if (code[i] === `\'`) {
                let str: string = "";
                i++;
                while (code[i] !== `\'`) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_o, str));
            }
            else if (code[i] !== ` `)
                tokens.push(new Token(TokenType.other, code[i]));
        }

        return tokens;
    };
    export const getType = (code: string): TokenType => {
        const myToken = parse(code)[0];
        return myToken.type;
    };

    export const makeCode = (tokens: Array<Token>): string => {
        let retString = ``;
        for (const i in tokens) {
            if (Number(i) > 0 && tokens[Number(i) - 1].type === TokenType.command && tokens[Number(i)].type === TokenType.command)
                retString += ` ${tokens[Number(i)].value}`;
            else if (tokens[Number(i)].type === TokenType.string_u)
                retString += `\`${tokens[Number(i)].value}\``;
            else if (tokens[Number(i)].type === TokenType.string_o)
                retString += `'${tokens[Number(i)].value}'`;
            else if (tokens[Number(i)].type === TokenType.string_t)
                retString += `"${tokens[Number(i)].value}"`;
            else
                retString += tokens[Number(i)].value;
        }

        return retString;
    }
}