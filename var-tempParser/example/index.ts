import { tempParser } from "./../tempParser";
console.log(JSON.stringify(tempParser.makeTemplate(`
<print str= cat=null dog="cat lover" dog2 cat2=2342 cat3=[new Variable(1,2)]>
    <render>
        [this.str]
    </render>
    <script>
        const str2 = "helo";
        const Start = () => {
            const b = 10;
            console.log(b);
        }
        const end = "cat lover";
        function Update(){
            console.log(this.str2);
        }
    </script>
</print>
`)));