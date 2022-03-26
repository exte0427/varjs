import fs from "fs";
import path from "path";
import { jsx } from "./../var-jsx/jsx";
import { tempParser } from "./../var-tempParser/tempParser";
import { varMain } from "./../var-main/varGetter";
import { log } from "./../var-log/log";

export namespace VarMake {
    export class Project {
        name: string;
        myPath: string;
        runList: Array<number>;
        constructor(name_: string) {
            this.name = name_;
            this.myPath = process.cwd();
            this.runList = [];
        }

        new() { this.runList.push(0) }
        build() { this.runList.push(1) }
        delete() { this.runList.push(2) }

        delete_() {
            const nowPath_var = path.join(this.myPath, `${this.name}.var`);
            const nowPath_bui = path.join(this.myPath, `${this.name}.bui`);

            if (fs.existsSync(nowPath_var))
                fs.rmSync(nowPath_var, { recursive: true, force: true });
            else
                log.justError(`Var-Make`, `No project Found`);

            if (fs.existsSync(nowPath_bui))
                fs.rmSync(nowPath_bui, { recursive: true, force: true });
        }
        new_() {
            const nowPath = path.join(this.myPath, `${this.name}.var`);

            if (fs.existsSync(nowPath))
                log.justError(`Var-Make`, `Project is already exist`);

            fs.mkdirSync(nowPath);

            fs.mkdirSync(path.join(nowPath, `html`));
            fs.writeFileSync(path.join(nowPath, `html`, `head.html`), `<meta charset="UTF-8">\n<title>Var App</title>`);
            fs.writeFileSync(path.join(nowPath, `html`, `body.html`), `<say tex="helloWorld"></say>`);

            fs.mkdirSync(path.join(nowPath, `templates`));
            fs.writeFileSync(path.join(nowPath, `templates`, `say.template`), `<say tex="">\n    <render>\n        <hi>[this.tex]</hi>\n    </render>\n</say>`);

            fs.mkdirSync(path.join(nowPath, `javascript`));
            fs.writeFileSync(path.join(nowPath, `javascript`, `setting.json`), `{\n    "load_priority" : [\n        "main"\n    ]\n}`);
            fs.writeFileSync(path.join(nowPath, `javascript`, `main.js`), `//js file`);
            fs.mkdirSync(path.join(nowPath, `css`));
            fs.writeFileSync(path.join(nowPath, `css`, `style.css`), `/*css file*/`);

            fs.mkdirSync(path.join(nowPath, `image`));
        }
        build_() {
            const infoPath = path.join(this.myPath, `${this.name}.var`);
            const nowPath = path.join(this.myPath, `${this.name}.bui`);

            if (fs.existsSync(nowPath))
                fs.rmSync(nowPath, { recursive: true, force: true });
            fs.mkdirSync(nowPath);

            const myScripts: Array<string> = [];

            fs.mkdirSync(path.join(nowPath, `javascript`));

            const info: string = fs.readFileSync(path.join(infoPath, `javascript`, `setting.json`), `utf-8`);
            const prio: Array<string> = JSON.parse(info).load_priority;

            prio.map(element => {
                myScripts.push(element.replace(`.js`, ``));
            });

            fs.readdirSync(path.join(infoPath, "javascript")).map((name) => {
                if (name !== `setting.json`) {
                    const data = fs.readFileSync(path.join(infoPath, `javascript`, name), `utf-8`);
                    fs.writeFileSync(path.join(nowPath, `javascript`, name), jsx.translate(data));

                    if (!myScripts.includes(name.replace(`.js`, ``)))
                        myScripts.push(name.replace(`.js`, ``));
                }
            });

            const myCss: Array<string> = [];

            fs.mkdirSync(path.join(nowPath, `css`));
            fs.readdirSync(path.join(infoPath, "css")).map((name) => {
                const data = fs.readFileSync(path.join(infoPath, `css`, name), `utf-8`);
                fs.writeFileSync(path.join(nowPath, `css`, name), data);

                myCss.push(name);
            });

            fs.mkdirSync(path.join(nowPath, `image`));
            fs.readdirSync(path.join(infoPath, "image")).map((name) => {
                const data = fs.readFileSync(path.join(infoPath, `image`, name), `utf-8`);
                fs.writeFileSync(path.join(nowPath, `image`, name), data);
            });

            const myTemp: Array<string> = [];
            fs.readdirSync(path.join(infoPath, "templates")).map((name) => {
                const data = tempParser.makeTemplate(fs.readFileSync(path.join(infoPath, `templates`, name), `utf-8`));
                myTemp.push(data);
            });
            fs.writeFileSync(path.join(nowPath, `javascript`, `templates.js`), `'self';\n'unsafe-eval';\nconst tempClasses = new function() {${myTemp.join(`\n`)}};`);
            fs.writeFileSync(path.join(nowPath, `javascript`, `var.js`), varMain.getCode());

            const head = fs.readFileSync(path.join(infoPath, `html`, `head.html`), `utf-8`);
            const body = fs.readFileSync(path.join(infoPath, `html`, `body.html`), `utf-8`);

            const html = `<!DOCTYPE html>\n<html lang = "en"><head>${head}\n${myCss.map(element => `<link rel="stylesheet" href="./css/${element}">\n`).join(`\n`)}</head>\n<body>${body}\n${[...myScripts, `templates`, `var`].map(element => `<script src="./javascript/${element}.js"></script>`).join("\n")}</body></html>`

            fs.writeFileSync(path.join(nowPath, `index.html`), html);
        }
    }

    export const run = (project: Project): void => {
        for (const nowNum of project.runList) {
            if (nowNum === 0) {
                const nowErrs = log.errorList;
                project.new_();

                if (nowErrs.length === log.errorList.length)
                    log.success(`VarMake`, `Make new var file successfully`);
            }
            if (nowNum === 1) {
                const nowErrs = log.errorList;
                project.build_();

                if (nowErrs.length === log.errorList.length)
                    log.success(`VarMake`, `Build var file successfully`);
            }
            if (nowNum === 2) {
                const nowErrs = log.errorList;
                project.delete_();

                if (nowErrs.length === log.errorList.length)
                    log.success(`VarMake`, `Delete var file successfully`);
            }
        }

        if (log.errorList.length)
            for (const errStr of log.errorList)
                console.log(errStr);
        else
            for (const scsStr of log.successList)
                console.log(scsStr);
    }
}