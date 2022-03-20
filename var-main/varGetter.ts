import fs from "fs";
import path from "path";
export namespace varMain {
    export const getCode = (): string => {
        return fs.readFileSync(path.join(__dirname, `var.js`), `utf8`);
    }
}