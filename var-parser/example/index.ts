import { parser } from "./../parser";
console.log(parser.parse(`
const a = prompt("name");
const b = prompt("desc");
lists.push({a:a,b:b});
`));