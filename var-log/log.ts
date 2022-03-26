import { parser } from "../var-parser/parser";
import console from "console";

export namespace log {
    const Color = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",

        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            crimson: "\x1b[38m" // Scarlet
        },
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            crimson: "\x1b[48m"
        }
    };

    export const errorList: Array<string> = [];
    export const successList: Array<string> = [];
    export const success = (name: string, str: string) => {
        successList.push(`${Color.bg.green}${Color.bright}   ${name} ✓   ${Color.reset} ${Color.fg.green}${str}${Color.reset}`);
    }
    export const error = (name: string, str: string, tokens: Array<parser.Token>, line: number) => {
        errorList.push(`${Color.bg.red}${Color.bright}   ${name} ✕   ${Color.reset} ${Color.fg.red}${str}${Color.reset}`);
        errorList.push(`${` `.repeat(`   ${name} ✕   `.length)} ${Color.fg.red}${Color.underscore}${parser.makeCode(tokens.filter(e => e.line === line))}${Color.reset} at line ${line}`);
    }
    export const justError = (name: string, str: string) => {
        errorList.push(`${Color.bg.red}${Color.bright}   ${name} ✕   ${Color.reset} ${Color.fg.red}${str}${Color.reset}`);
    }
}