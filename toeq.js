
class InputTable {

    static header = `<tr><th>x</th><th colspan="2">f(x)</th></tr>`;
    static main = undefined;
    static calculator = undefined;

    constructor(el){
        this.el = el;
        this.rows = [];
        this.rowels = [];
        this.selected = undefined;
        this.render();
        InputTable.main = this;
    }


    fill_default(rowel){
        let point = rowel.point;
        document.querySelector("#old_x").value = String(point[0]);
        document.querySelector("#old_fx").value = String(point[1]);
    }

    change_type_form(){
        if(this.selected){
            document.querySelector("#addrow").style.display = "none";
            document.querySelector("#editrow").style.display = "block";
            this.fill_default(this.selected);
        }else {
            document.querySelector("#addrow").style.display = "block";
            document.querySelector("#editrow").style.display = "none";
        }
    }


    select_table(el){
        let table = this;
        el.addEventListener("mouseup",(e)=>{
            if(table.selected == el){
                table.selected.classList.remove("selected");
                table.selected = undefined;
            }else{
                if(table.selected){
                    table.selected.classList.remove("selected");
                }
                table.selected = el;
                el.classList.add("selected");
            }
            this.change_type_form();
        });
    }

    render(){
        this.el.innerHTML = InputTable.header;

        this.rowels = [];
        for(let i = 0; i < this.rows.length; i++){
            let row = this.rows[i];
            let rowel = document.createElement("tr");
            rowel.classList.add("table-row");

            let xtd = document.createElement("td");
            xtd.innerHTML = String(row[0]);
            rowel.appendChild(xtd);

            let fxtd = document.createElement("td");
            fxtd.innerHTML = String(row[1]);
            rowel.appendChild(fxtd);

            this.el.appendChild(rowel);

            rowel.point = row;

            this.select_table(rowel);
            this.rowels.push(rowel);

        }

        this.render_regression();

    }

    add_point(sx, sfx){
        let x = Number(document.querySelector(sx).value);
        let fx = Number(document.querySelector(sfx).value);
        this.rows.push([x,fx]);
        this.render();

        document.querySelector(sx).value = "";
        document.querySelector(sfx).value = "";

        document.querySelector(sx).select();

    }

    edit_point(sx, sfx){
        let x = Number(document.querySelector(sx).value);
        let fx = Number(document.querySelector(sfx).value);

        for(let i = 0; i < this.rows.length; i++){
            if(this.rows[i] == this.selected.point){
                this.rows[i] = [x,fx];
                break;
            }
        }

        this.selected = undefined;
        this.change_type_form();
        this.render();

    }

    delete_point(sx, sfx){
        let x = Number(document.querySelector(sx).value);
        let fx = Number(document.querySelector(sfx).value);

        for(let i = 0; i < this.rows.length; i++){
            if(this.rows[i] == this.selected.point){
                this.rows.splice(i,1);
                break;
            }
        }

        this.selected = undefined;
        this.change_type_form();
        this.render();
    }

    get_type(){
        let types = document.getElementsByName("type");
        for(let i = 0; i < types.length; i++){
            if(types[i].checked){
                return types[i].value;
            }
        }
    }

    get_regression(){
        let type = this.get_type();
        switch(type){
            case "l":
                return regression.linear(this.rows)
            case "q":
                return regression.polynomial(this.rows, {order:2})
            case "e":
                return regression.exponential(this.rows)
            case "c":
                return regression.polynomial(this.rows, {order:3})
            case "log":
                return regression.logarithmic(this.rows)
        }
    }

    is_real_equation(eq){
        for(let c of eq.equation){
            if(isNaN(c)){
                return false;
            }
        }
        return true;
    }

    render_regression(){
        if(this.rows.length > 0){
            InputTable.calculator.setBlank();
            let reg = this.get_regression();
            let eq = document.querySelector("#eq");
            if(this.is_real_equation(reg)){
                eq.innerHTML = reg.string.replace("y","f(x)");
                InputTable.calculator.setExpression({latex:this.eq_arr_to_latex(this.get_type(),reg.equation)});
                this.render_desmos_points();
            }else{
               eq.innerHTML = `Error`; 
            }
        }
    }

    eq_arr_to_latex(type, eq){
        switch(type){
            case "l":
                return `${eq[0]}*x + ${eq[1]}`;
            case "q":
                return `${eq[0]}*x^2 + ${eq[1]}*x + ${eq[2]}`;
            case "e":
                return `${eq[0]}*e^{{${eq[1]}*x}}`;
            case "c":
                return `${eq[0]}*x^3 + ${eq[1]}*x^2 + ${eq[2]}*x + ${eq[3]}`;
            case "log":
                return `${eq[0]} + ${eq[1]}*\\ln\\left(x\\right)`;
        }
    }

    render_desmos_points(){
        for(let p of this.rows){
            InputTable.calculator.setExpression({
                latex:`\\left(${p[0]},${p[1]}\\right)`,
                color:"red"
            });
        }
    }

}

window.addEventListener("load",(e)=>{
    let types = document.getElementsByName("type");
    for(let type of types){
        let clickevent = (el)=>{
            el.addEventListener("change", (e2)=>{
                InputTable.main.render_regression();
            });
        };
        clickevent(type);
    }

    let calculator = Desmos.GraphingCalculator(document.querySelector("#desmos"), {settingsMenu:false,expressions:false});
    InputTable.calculator = calculator;

});