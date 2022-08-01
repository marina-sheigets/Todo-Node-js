import  http from'http';

const PORT=3030;
 let todos=[
    {id:1, text:"Buy dog", checked:false},
    {id:2, text:"Buy cheese", checked:false},
    {id:3, text:"Buy onion", checked:false}
]

    
const server=http.createServer((req,res)=>{

    let URL=(`http://localhost:${PORT}`+req.url);
    let regex=/http:\/\/[a-z]*\:[0-9]*\/todos/;

    if(regex.test(URL)){
        if(req.method=="POST"){
            let text='';
            req.on('data',chunk=>{
                text+=chunk;
            })
            req.on('end', () => {
                todos=[...todos,
                    {
                        id:Date.now(),
                        text:text,
                        checked:false
                    }];
              });
            res.end();
        }else if(req.method=="DELETE"){
          
            let id=getID(req);

            todos=todos.filter(elem=>elem.id!=id)
            res.end();
           
        }else if(req.method=="PATCH"){
            let id=getID(req); 
            let text='';
            console.log(id);

            req.on('data',chunk=>{
                text+=chunk;
            })

            req.on('end', () => {
                todos=todos.map(elem=>{
                    if(elem.id==id){
                        return{
                            ...elem,
                            text:text
                        }
                    }
                    return elem;
                })
              });
            res.end();
        }else if(req.method=="GET"){
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(todos));
        }   
    }else{
        res.end("Page was not found...")
    }
})

function getID(req){
    let lastIndex=req.url.lastIndexOf("/");
    let id=+req.url.slice(lastIndex+1,req.url.length)
    console.log(id,typeof id);
    return id;
}

server.listen(PORT);
