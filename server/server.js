import  http from'http';


const PORT=3030;
 let todos=[
    {id:1, text:"Buy dog", checked:false},
    {id:2, text:"Buy cheese", checked:false},
    {id:3, text:"Buy onion", checked:false}
]

const server=http.createServer();

function getID(req){
    let lastIndex=req.url.lastIndexOf("/");
    let id=+req.url.slice(lastIndex+1,req.url.length)
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
            response.writeHead(200, {...headers,'Content-Type': 'application/json'})
            let id=getID(request); 
            let newText='';

            request.on('data',chunk=>{
                newText+=chunk;
            })
            request.on('end', () => {
                
                newText=JSON.parse(newText);
                if(newText.hasOwnProperty("changeStatus")){
                    todos=todos.map(elem=>{
                        if(elem.id==id){
                            return{
                                ...elem,
                                checked:!elem.checked
                            }
                        }
                        return elem;
                    })
                }else if(newText.hasOwnProperty("title")){

                    todos=todos.map(elem=>{
                        if(elem.id==id){
                            return{
                                ...elem,
                                text:newText.title
                            }
                        }
                        return elem;
                    })
                }else if(newText.hasOwnProperty("changeStatusAll")){
                    todos=todos.map(elem=>{
                            return{
                                ...elem,
                                checked:!elem.checked
                            }
                        }
                    )
                }
            })
            response.end(JSON.stringify({ status:"Done" }));
            break;
              
        case "DELETE":
            response.writeHead(200, headers);
            console.log("DELETE method");
            
            let i=getID(request);

            todos=todos.filter(elem=>elem.id!=i)
           /*  let value=response.sendDate
            console.log(value) */
            response.end();
            break;
        case "OPTIONS": 
            response.writeHead(200, {
                "Access-Control-Allow-Origin":"*", 
                "Access-Control-Allow-Methods":"GET, POST, DELETE, PUT, PATCH", 
                "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept" 
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