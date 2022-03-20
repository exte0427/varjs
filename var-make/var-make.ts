import fs from "fs";
import path from "path";
import { jsx } from "./../var-jsx/jsx";
import { tempParser } from "./../var-tempParser/tempParser";
import { varMain } from "./../var-main/varGetter";

export namespace VarMake {
    export class Project {
        name: string;
        myPath: string;
        constructor(name_: string) {
            this.name = name_;
            this.myPath = process.cwd();
        }
        new() {
            const nowPath = path.join(this.myPath, `${this.name}.var`);

            if (fs.existsSync(nowPath))
                fs.rmSync(nowPath, { recursive: true, force: true });

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
        build() {
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

            const html = `<!DOCTYPE html>\n<html lang = "en"><head>${head}\n${myCss.map(element => `<link rel="stylesheet" href="./css/${element}">\n`)}</head>\n<body>${body}\n${[...myScripts, `templates`].map(element => `<script src="./javascript/${element}.js"></script>`)}</body></html>`

            fs.writeFileSync(path.join(nowPath, `index.html`), html);
        }
    }
}