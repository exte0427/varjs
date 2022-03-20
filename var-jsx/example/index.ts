import { jsx } from "./../jsx";
console.log(jsx.translate(`
const a = <div target = "[c]"> [b] </div>
if(b>10)
    console.log(<div> a </div>)
`));