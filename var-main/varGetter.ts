import fs from "fs";
export namespace varMain {
    export const getCode = (): string => {
        return fs.readFileSync(`./var.js`, `utf8`);
    }
}