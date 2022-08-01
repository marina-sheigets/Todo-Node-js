const express=require("express");

const app=express();
const PORT=process.env.PORT ?? 3000

let todos=[
    {id:1, text:"Buy bread", checked:false},
    {id:2, text:"Buy cheese", checked:false},
    {id:3, text:"Buy onion", checked:false}
]


app.listen(PORT,()=>{
console.log("Listening on the Port "+PORT);
})

app.delete("/todos/:id",(req,res)=>{
    let id=req.params.id;
    todos=todos.filter(elem=>elem.id!=id);
    res.on("finish");
})

app.get("/todos",(req,res)=>{
    res.send(todos);
})

app.put("/todos/:id",(req,res)=>{
    let id=req.params.id;
    console.log(req.body);
    todos=todos.map(elem=>{
        if(elem.id==id){
            return{
                ...elem,
                text:req.body
            }
        }
        return elem;
    })
    res.on("finish");
})

