import  http from'http';


const PORT=3030;
 let todos=[
    {id:1, text:"Buy dog", checked:false},
    {id:2, text:"Buy cheese", checked:false},
    {id:3, text:"Buy onion", checked:false}
]

const server=http.createServer((req,res)=>{
/*
    let URL=(`http://localhost:${PORT}`+req.url);
    let regex=/http:\/\/[a-z]*\:[0-9]*\/todos/;

    const headers = {
        "Access-Control-Allow-Origin": "http://127.0.0.1:5501/",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE, PATCH",
      };
          console.log(req.headers)
    if(regex.test(URL)){
        if(req.method=="POST"){
            let text="";
            req.on('data',chunk=>{
                text+=chunk;
            })

            req.on('end', () => {
                text=JSON.parse(text);
                todos=[...todos,
                    {
                        id:Date.now(),
                        text:text.title,
                        checked:false
                    }];
              });
              console.log("POST method");
            res.end();
        }else if(req.method=="DELETE"){
            console.log("DELETE method");
            res.writeHead(200,headers);
            
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
                text=JSON.parse(text);
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
              console.log("PATCH method");
            res.end();
        }else if(req.method=="GET"){
            res.writeHead(200, {
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify(todos));
        }   
        res.end()
    }else{
        res.end("Page was not found...")
    }*/
})

function getID(req){
    let lastIndex=req.url.lastIndexOf("/");
    let id=+req.url.slice(lastIndex+1,req.url.length)
    console.log(id,typeof id);
    return id;
}


server.listen(PORT);

server.on("request", function (request, response) {

    let URL=(`http://localhost:${PORT}`+request.url);
    let regex=/http:\/\/[a-z]*\:[0-9]*\/todos/;

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE, PATCH",
        "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
      };

    if(regex.test(URL)){
        switch(request.method)
        {
        case "GET":
            response.writeHead(200, headers);
            response.end(JSON.stringify(todos));
            break;
        case "POST":
            let text="";
            request.on('data',chunk=>{
                text+=chunk;
            })

            request.on('end', () => {
                text=JSON.parse(text);
                todos=[...todos,
                    {
                        id:Date.now(),
                        text:text.title,
                        checked:false
                    }];
              });
              console.log("POST method");
            response.end();
            break;
        case "PATCH":
            response.writeHead(200, headers)
            let id=getID(request); 
            let newText='';

            request.on('data',chunk=>{
                newText+=chunk;
            })
            request.on('end', () => {
                newText=JSON.parse(newText);
                console.log(newText);

                todos=todos.map(elem=>{
                    if(elem.id==id){
                        return{
                            ...elem,
                            text:newText.title
                        }
                    }
                    return elem;
                })
              });
              console.log("PATCH method");
            response.end();
            break;
        case "DELETE":
            response.writeHead(200, headers);
            console.log("DELETE method");
            
            let i=getID(request);

            todos=todos.filter(elem=>elem.id!=i)
            response.end();
            break;
        case "OPTIONS": // THE CLIENT OCCASIONALLY - NOT ALWAYS - CHECKS THIS
            response.writeHead(200, {
                "Access-Control-Allow-Origin":"*", // REQUIRED CORS HEADER
                "Access-Control-Allow-Methods":"GET, POST, DELETE, PUT, PATCH", // REQUIRED CORS HEADER
                "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept" // REQUIRED CORS HEADER
            });
            response.end();
            break;
        default:
            response.writeHead(405, {
                "Content-Type":"application/json"
            });
            response.end(JSON.stringify({error:`method ${request.method} not allowed`}));
            break;
        }
    }else{
        response.end("Page was not found...")
    }
});