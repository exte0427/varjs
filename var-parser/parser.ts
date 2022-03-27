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
        line: number;

        constructor(type_: TokenType, value_: string, line_: number = -1) {
            this.type = type_;
            this.value = value_;
            this.line = line_;
        }
    }

    export const parse = (code: string) => {
        const tokens: Array<Token> = [];
        let line = 1;

        for (let i = 0; i < code.length; i++) {

            if (code[i] === `(`)
                tokens.push(new Token(TokenType.sb_start, `(`, line));
            else if (code[i] === `)`)
                tokens.push(new Token(TokenType.sb_end, `)`, line));
            else if (code[i] === `{`)
                tokens.push(new Token(TokenType.mb_start, `{`, line));
            else if (code[i] === `}`)
                tokens.push(new Token(TokenType.mb_end, `}`, line));
            else if (code[i] === `[`)
                tokens.push(new Token(TokenType.bb_start, `[`, line));
            else if (code[i] === `]`)
                tokens.push(new Token(TokenType.bb_end, `]`, line));
            else if (code[i] === `*`) {
                if (i + 1 < code.length && code[i + 1] === `*`) {
                    tokens.push(new Token(TokenType.pow_o, `**`, line));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.mul_same, `*=`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.mul, `*`, line));
            }
            else if (code[i] === `/`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.div_same, `/=`, line));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `/`) {
                    while (!(i === code.length - 1 || code[i] === `\n`)) { i++; }
                }
                else if (i + 1 < code.length && code[i + 1] === `*`) {
                    while (!(code[i] === `*` && code[i + 1] === `/`)) { i++; }
                }
                else if (i + 1 < code.length && code[i + 1] === ">") {
                    tokens.push(new Token(TokenType.se, `/>`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.div, `/`, line));
            }
            else if (code[i] === `+`) {
                if (i + 1 < code.length && code[i + 1] === `+`) {
                    tokens.push(new Token(TokenType.add_s, `++`, line));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.add_same, `+=`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.plus, `+`, line));
            }
            else if (code[i] === `-`) {
                if (i + 1 < code.length && code[i + 1] === `-`) {
                    tokens.push(new Token(TokenType.mis_s, `--`, line));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.mis_same, `-=`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.minus, `-`, line));
            }
            else if (code[i] === `!`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.uneq, `!=`, line));
                    i++;
                }
                else if (i + 2 < code.length && code[i + 1] === `=` && code[i + 2] === `=`) {
                    tokens.push(new Token(TokenType.uneq_t, `!==`, line));
                    i += 2;
                }
                else
                    tokens.push(new Token(TokenType.not, `!`, line));
            }
            else if (code[i] === `=`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.eq, `==`, line));
                    i++;
                }
                else if (i + 2 < code.length && code[i + 1] === `=` && code[i + 2] === `=`) {
                    tokens.push(new Token(TokenType.eq_t, `===`, line));
                    i += 2;
                }
                else if (i + 1 < code.length && code[i + 1] === ">") {
                    tokens.push(new Token(TokenType.arrow, `=>`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.same, `=`, line));
            }
            else if (code[i] === `:`)
                tokens.push(new Token(TokenType.eq_jn, `:`, line));
            else if (code[i] === `>`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.big_s, `>=`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.big, `>`, line));
            }
            else if (code[i] === `<`) {
                if (i + 1 < code.length && code[i + 1] === `=`) {
                    tokens.push(new Token(TokenType.small_s, `<=`, line));
                    i++;
                }
                else if (i + 1 < code.length && code[i + 1] === `/`) {
                    tokens.push(new Token(TokenType.ee, `</`, line));
                    i++;
                }
                else
                    tokens.push(new Token(TokenType.small, `<`, line));
            }
            else if (code[i] === `^`)
                tokens.push(new Token(TokenType.pow, `^`, line));
            else if (code[i] === `%`)
                tokens.push(new Token(TokenType.rem, `%`, line));
            else if (i + 1 < code.length && code[i] === `&` && code[i + 1] === `&`) {
                i++;
                tokens.push(new Token(TokenType.and, `&&`, line));
            }
            else if (i + 1 < code.length && code[i] === `|` && code[i + 1] === `|`) {
                i++;
                tokens.push(new Token(TokenType.or, `||`, line));
            }
            else if (code[i] === `.`)
                tokens.push(new Token(TokenType.point, `.`, line));
            else if (code[i] === `,`)
                tokens.push(new Token(TokenType.comma, `,`, line));
            else if (code[i] === `@`)
                tokens.push(new Token(TokenType.oa, `@`, line));
            else if (code[i] === `;`)
                tokens.push(new Token(TokenType.semi, `;`, line));

            else if ((/[0-9]/g).test(code[i])) {
                let num: string = "";
                while (i < code.length && (/[0-9]/g).test(code[i])) {
                    num += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.number, num, line));

                i--;
            }
            else if ((/[a-zA-Z_]/g).test(code[i])) {
                let cmd: string = "";
                while (i < code.length && (/[a-zA-Z0-9_]/g).test(code[i])) {
                    cmd += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.command, cmd, line));

                i--;
            }
            else if (code[i] === `\``) {
                let str: string = "";
                i++;
                while (code[i] !== `\``) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_u, str, line));
            }
            else if (code[i] === `\"`) {
                let str: string = "";
                i++;
                while (code[i] !== `\"`) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_t, str, line));
            }
            else if (code[i] === `\'`) {
                let str: string = "";
                i++;
                while (code[i] !== `\'`) {
                    str += code[i];
                    i++;
                }

                tokens.push(new Token(TokenType.string_o, str, line));
            }
            else if (code[i] === `\n`)
                line++;
            else if (code[i] !== ` `)
                tokens.push(new Token(TokenType.other, code[i], line));
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