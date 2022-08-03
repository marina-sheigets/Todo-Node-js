import  http from'http';
import { MongoClient } from 'mongodb';

const URL_MONGO=`mongodb+srv://marinasheigets:mAIUIsJ4vVV08ZNy@cluster0.js7qmad.mongodb.net/?retryWrites=true&w=majority`

const client=new MongoClient(URL_MONGO)
const DB_NAME="TodoApp";
const COLLECTION="todos";


client.connect();



async function mongoAddTodo(client,text){
    let newTodo={
        id:Date.now(),
        text:text.title,
        checked:false
    }

    await client.db(DB_NAME).collection(COLLECTION).insertOne(newTodo);
    return await getTodos(client);

}

async function getTodos(client){//work
    return  await client.db(DB_NAME).collection(COLLECTION).find({}).toArray()
}

async function deleteTodo(client,id){//work
    await client.db(DB_NAME).collection(COLLECTION).deleteOne({id:id})
    return await getTodos(client);
}

async function updateTodoText(client,newText,id){//work
    await client.db(DB_NAME).collection(COLLECTION).updateOne({id:id},{$set:{text:newText}});
    return await getTodos(client);
}

async function changeStatus(client,id){
    let todo = await client.db(DB_NAME).collection(COLLECTION).findOne({id:id})
    let checked = todo?.checked;
    await client.db(DB_NAME).collection(COLLECTION).updateOne({id:id},{$set:{checked:!checked}});
    return await getTodos(client);
}

async function changeStatusAll(client,active){
    if(active){
        await client.db(DB_NAME).collection(COLLECTION).updateMany({},{$set:{checked:true}});
    }else{
        await client.db(DB_NAME).collection(COLLECTION).updateMany({},{$set:{checked:false}});
    }
    return await getTodos(client);
}



const PORT = 3030;

const server = http.createServer();

function getID(req){
    let lastIndex = req.url.lastIndexOf("/");
    let id = +req.url.slice(lastIndex + 1,req.url.length)
    return id;
}


server.listen(PORT);



server.on("request", async function (request, response) {

    const URL = (`http://localhost:${PORT}`+request.url);
    let regex = /http:\/\/[a-z]*\:[0-9]*\/todos/;

    const headers  =  {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE, PATCH",
        "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept",
      };

    if(regex.test(URL)){
        switch(request.method)
        {
        case "GET":
            response.writeHead(200, headers);
            try{
                let res = await getTodos(client);
                response.end(JSON.stringify(res));
            }catch(err){
                console.log(err)
            }
            break;

        case "POST":
            response.writeHead(200, {...headers,'Content-Type': 'application/json'});
            let data = "";
                request.on('data',  chunk  => {
                    data += chunk;
               })
   
               request.on('end',  async ()   =>  {
                   data =  JSON.parse(data);
                   try{
                        let res = await mongoAddTodo(client,data)
                        response.end(JSON.stringify(res)); 
                   }catch(e){
                       console.log(e)
                   }              
               })
                          
            break;

        case "PATCH":
            response.writeHead(200, {...headers,'Content-Type': 'application/json'})
            let id = getID(request); 
            let newText = '';

            request.on('data',chunk  => {
                newText += chunk;
            })
            request.on('end', async()   =>  {
                
                newText = JSON.parse(newText);
                if(newText.hasOwnProperty("changeStatus")){
                   try{
                    let res = await changeStatus(client,id);
                    response.end(JSON.stringify(res));

                   }catch(e){
                       console.log(e)
                   }
                }else if(newText.hasOwnProperty("title")){

                    try{
                        let res = await updateTodoText(client,newText?.title,id);
                        response.end(JSON.stringify(res));

                    }catch(e){
                        console.log(e)
                    }
                }else if(newText.hasOwnProperty("changeStatusAll")){
                      try{
                        let res = await changeStatusAll(client,newText?.active);
                        response.end(JSON.stringify(res));
    
                       }catch(e){
                           console.log(e)
                       }
                }
            })
            break; 
        case "DELETE":
            response.writeHead(200, headers);
            let i = getID(request);
            try{
                let res=await deleteTodo(client,i)
                response.end(JSON.stringify(res));

            }catch(e){
                console.log(e)
            }

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