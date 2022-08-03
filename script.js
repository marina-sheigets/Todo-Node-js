
class TodoItem{
    
    createTodo(text){
         return {
             id:Date.now(),
             text:text,
             checked:false,
         }
     }

     createTodoLI(elem){
         let li  =  document.createElement("li");
 
         //inner content
         let checkbox  =  document.createElement("input");
         checkbox.type  =  "checkbox";
       
         checkbox.dataset.id = elem.id;
         let label = document.createElement("label");
         label.textContent = elem.text;
         if(elem.checked){
             checkbox.checked = "true";
             label.classList.add("completed");
         }else{
             label.classList.remove("completed");
         }
         label.setAttribute("for",elem.id);
         let deleteButton = document.createElement("button");
         deleteButton.dataset.id = elem.id;
         deleteButton.innerHTML = "&times;";
 
         li.appendChild(checkbox);
         li.appendChild(label);
         li.appendChild(deleteButton);
         return li;
     }
 }
 
 class TodoApp{
     todos = [];
    
     URL = "http://localhost:3030/todos";

     renderDOM(){
         localStorage.setItem("variant","All")
         const container = document.querySelector("#app");
         //h1
         let h1 = document.createElement("h1");
         h1.classList.add("main-h1");
         h1.textContent = "ToDo List";
         //form
         let div = document.createElement("div");
         div.classList.add("todo-form");
 
         let activateButton = document.createElement("button");
         activateButton.classList.add("activate");
         if(localStorage.getItem("buttonStatus") === "active"){
             activateButton.classList.add("active");
         }
         
         activateButton.innerHTML = `&#9745;`;
         activateButton.setAttribute("onclick",`todoApp.changeAllCompleted()`)
 
         //input
         let input = document.createElement("input");
         input.type = "text";
         input.placeholder = "Enter todo task";
         input.classList.add("todo-input");
         //button
         let button = document.createElement("button");
         button.classList.add("submit");
         button.textContent = "Add";
         button.setAttribute("onclick","todoApp.addTodo()")
         //ul
         let ul = document.createElement("ul");
         ul.classList.add("todo-list");
 
         div.appendChild(activateButton);
         div.appendChild(input);
         div.appendChild(button);
 
         //Filtering 
         let filterDiv = document.createElement("div");
         filterDiv.classList.add("filter-area");
         //Select
         let select = document.createElement("select");
         let options = ["All","Active","Completed"];
         options.forEach(elem =>{
             let option = document.createElement("option")
             option.text = elem;
             select.add(option);
 
         })
         select.setAttribute("onChange","todoApp.filter(this)")
         filterDiv.appendChild(select)
         
         container.classList.add("container");
         container.appendChild(h1);
         container.appendChild(div);
         container.appendChild(ul);
         container.appendChild(filterDiv);
 
         this.renderTodos();
     }
 
 
     renderTodos(ownArray = undefined){
         let arr = [];
         ownArray ? arr = ownArray.slice(0): arr = this.todos.slice(0)
         const ul = document.querySelector(".todo-list");
         if(arr.length === 0){
             ul.innerHTML = "No any todos..."
         }else{
             ul.innerHTML = "";
             let todoItem = new TodoItem;
             arr.forEach((elem) =>{
                 ul.appendChild(todoItem.createTodoLI(elem));
             })
         }
     }
 
     async changeAllCompleted(){
         let activateButton = document.querySelector(".activate");
         activateButton.classList.toggle("active");
 
         try{
             let active = false
             if(activateButton.classList.contains("active")){
                active = true;
             }
            
            let res = await fetch(this.URL,{
            method:"PATCH",
            body:JSON.stringify({changeStatusAll:"true",active:active})
         })

            let body = await res.json();
            activateButton.classList.contains("active") ? this.saveButtonStatusInLocalStorage("active"):this.saveButtonStatusInLocalStorage("non-active");
            this.saveTodos(body);
            this.filter() 
            this.changeActiveButton()
        }catch(err){
            console.log(err)
         }
     }

    async addTodo(){
        const todoInput = document.querySelector(".todo-input");
        const value = todoInput.value;
        todoInput.value = "";
        if(value.trim().length === 0){
            alert("Error! You entered the empty value.")
            return;
        }
        
        try{
            let res = await fetch(this.URL,{
                method:"POST",
                body:JSON.stringify({ title: value }),
                })
               
                let body = await res.json();
                this.saveTodos(body); 
                this.filter();
        }catch(err){
            console.log(err);
        }
     }
 
     async deleteTodoItem(button){
         let i = button.getAttribute("data-id")
         try{
          let res = await fetch(this.URL + "/" + i,{
             method:"DELETE",})
            let body = await res.json();
            
            this.saveTodos(body);
            this.filter(); 
        }catch(err){
            console.log(err)
        }
     }   
 
    async changeStatus(checkbox){
         let idCheck = +checkbox.getAttribute("data-id");
 
         try{
            let res = await fetch(this.URL+"/"+idCheck,{
              method:"PATCH",
              body:JSON.stringify({
                changeStatus:"true"
              }),
              headers:{
                "content-type": "application/json" 
              },
          })
            let body = await res.json();
            this.saveTodos(body);
            this.filter()
            this.changeActiveButton()
         }catch(err){
             console.log(err)
         }
     }

     changeActiveButton(){
        let allCompleted = this.todos.length;

        for(let i = 0;i<this.todos.length;i++){
            if(!this.todos[i].checked){
                allCompleted--
            }
        }
        let activateButton = document.querySelector(".activate");
        if(allCompleted == this.todos.length){
            activateButton.classList.add("active")
            this.saveButtonStatusInLocalStorage("active");
        }else{
            if(localStorage.getItem("variant") != "Completed")
            activateButton.classList.remove("active");
            this.saveButtonStatusInLocalStorage("");
        } 
     }
 
     async changeTodoText(e){
         if(e.value){
             let id = +e.parentElement.getAttribute("for");

             try{
                let res = await fetch(this.URL+"/"+id,{
                 method:"PATCH",
                 body: JSON.stringify({ title: e.value }),    
                })
                    let body = await res.json();
                    this.saveTodos(body);
                    this.filter()
               
            }catch(err){
                console.log(err);
            }
         }
         return false;
     }
 
     filter(select){
         
         let variant;
         let activateButton = document.querySelector(".activate");
 
         if(select){
              variant = select.options[select.selectedIndex].text;
              localStorage.setItem("variant",variant)
         }else{
            variant = localStorage.getItem("variant");
         }
        
         let arr = [];
         switch(variant){
             case "Active":
                 activateButton.classList.remove("active")
                 arr = this.todos.filter(elem =>elem.checked!= true);
                 break;
             case "Completed":
                 activateButton.classList.add("active")
                 arr = this.todos.filter(elem =>elem.checked!= false);
                 break;
             case "All":
                 activateButton.classList.contains("active")?activateButton.classList.remove("active"):null;
                 arr = this.todos.slice(0);
                 break;
         }
         this.renderTodos(arr);
     }
 
     saveinLocalStorage(){
         localStorage.setItem("todos",JSON.stringify(this.todos));
     } 
     
     saveButtonStatusInLocalStorage(status){
         localStorage.setItem("buttonStatus",status);
     }

    saveTodos(body){
        if(typeof body === "string"){
            this.todos = [...JSON.parse(body)];
        }else{

            this.todos = [...body];
        }
    } 
 }
 
 
 let todoApp = new TodoApp;
 
 document.addEventListener("DOMContentLoaded",async () =>{
     
    try{
        let res=await fetch(todoApp.URL,{
            method:"GET"
        });
        let body=await res.text();
        todoApp.saveTodos(body);
        todoApp.renderDOM();

        let ul = document.querySelector(".todo-list");
 
        ul.addEventListener("click",(e) =>{
            if(e.target.tagName == "BUTTON"){
            todoApp.deleteTodoItem(e.target);
            }
        }) 
        
        
        ul.addEventListener("change",(e) =>{
            if(e.target.tagName == "INPUT"){
            todoApp.changeStatus(e.target);
            }
        }) 
        
        ul.addEventListener("dblclick",(e) =>{
            let elem = e.target;
    
            if(elem.tagName == "LABEL"){
                let taskText = elem.textContent;
                let input = document.createElement("input");
                input.value = taskText;
    
                elem.innerHTML = "";
                elem.appendChild(input);
                input.focus();
    
                input.addEventListener("blur",(e) =>{
                    todoApp.changeTodoText(e.target)
                })
            }   
        })
    }catch(err){
        document.body.innerHTML=err
    }
 
     
 })
 