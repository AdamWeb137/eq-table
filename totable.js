class OutputTable {

    static out_table_id = "#out_body";

    static eq = (x)=>{return x**2;};
    static start = 0;
    static step = 1;

    static is_alpha(str){

        if(str.length == 0) return false;

        let alpha = "abcdefghijklmnopqrstuvwxyz";
        alpha = alpha+alpha.toUpperCase();
        for(let c of str){
            if(alpha.indexOf(c) == -1){
                return false;
            }   
        }
        return true;
    }

    static get_math_func(varname, sub){

        if(sub == varname){
            return varname;
        }

        let alts = {
            "ln":"Math.log",
            "log":`Math.log10`,
            "arcsin":`Math.asin`,
            "arccos":`Math.acos`,
            "arctan":`Math.atan`,
            "arctan2":`Math.atan2`,
            "arcsinh":`Math.asinh`,
            "arccosh":`Math.acosh`,
            "arctanh":`Math.atanh`,
            "e":`Math.E`,
            "pi":`Math.PI`
        };

        if(sub in alts){
            return alts[sub];
        }

        if(sub in Math){
            return "Math."+sub;
        }

        return false;
    }

    static to_eq_string(varname, str){

        str = str.replaceAll("^","**");

        let unknown = false;
        let un_begin = -1;
        let un_end = -1;

        let depth = 0;

        let op_chars = ".+*-/(){}";
        let digits = "1234567890";

        let return_str = "return ";

        for(let i = 0; i < str.length; i++){
            let c = str[i];
            if(!unknown){
                if(op_chars.indexOf(c) > -1 || digits.indexOf(c) > -1){
                    return_str+=c;
                }else{
                    unknown = true;
                    un_begin = i;
                    un_end = i+1;
                }
            }else{
                if(op_chars.indexOf(c) > -1){
                    let func = this.get_math_func(varname, str.slice(un_begin, un_end));
                    if (func === false) return false;
                    return_str += func;
                    return_str+=c;
                    unknown = false;
                }else{
                    un_end += 1;
                }
            }
        }

        if(unknown){
            let func = this.get_math_func(varname, str.slice(un_begin, un_end));
            if(func === false) return false;
            return_str += func;
        }

        return return_str;

    }

    static update_eq(varname){

        if(!OutputTable.is_alpha(varname)){
            alert("Inappropriate variable name");
            return false;
        }

        let raw_eq_str = document.querySelector("#eq").value;
        let func_str = OutputTable.to_eq_string(varname, raw_eq_str);

        if(!func_str){
            alert("Function contains unknown function or constant");
            return false;
        }


        OutputTable.eq = new Function(varname, func_str);

        return true;

    }

    static update_table(varname){
        let out_table = document.querySelector(OutputTable.out_table_id);
        out_table.innerHTML = `<tr><th>${varname}</th><th>f(${varname})</th></tr>`;
        for(let i = -4; i < 5; i++){
            let x = i*OutputTable.step + OutputTable.start;
            out_table.innerHTML += `<tr><td>${x}</td><td>${OutputTable.eq(x)}</td></tr>`;
        }
    }

    static update(){
        let varname = document.querySelector("#var_name").value;

        OutputTable.step = Number(document.querySelector("#step").value);
        OutputTable.start = Number(document.querySelector("#start").value);

        OutputTable.step = (isNaN(OutputTable.step)) ? 1 : OutputTable.step;
        OutputTable.start = (isNaN(OutputTable.start)) ? 0 : OutputTable.start;

        if(OutputTable.update_eq(varname)){
            OutputTable.update_table(varname);
        }
    }

    static move_table(x){
        document.querySelector("#start").value = Number(document.querySelector("#start").value)+x*OutputTable.step;
        OutputTable.update();
    }

}