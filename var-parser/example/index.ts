import { parser } from "./../parser";
console.log(parser.makeCode(parser.parse(`
console.log(a/b)
`)));