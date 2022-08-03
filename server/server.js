import  http from'http';
import { MongoClient } from 'mongodb';

const URL_MONGO=`mongodb+srv://marinasheigets:mAIUIsJ4vVV08ZNy@cluster0.js7qmad.mongodb.net/?retryWrites=true&w=majority`

const client=new MongoClient(URL_MONGO)
const DB_NAME="TodoApp";
const COLLECTION="todos";

client.connect();

const getTodosCollection = () => {
    return  client.db(DB_NAME).collection(COLLECTION)
}

async function mongoAddTodo(text){
    const newTodo={
        id:Date.now(),
        text:text.title,
        checked:false
    }

    await getTodosCollection().insertOne(newTodo);
    return await getTodos();

}

async function getTodos(){
    return  await getTodosCollection().find({}).toArray()
}

async function deleteTodo(id){
    await getTodosCollection().deleteOne({id:id})
    return await getTodos();
}

async function updateTodoText(newText,id){
    await getTodosCollection().updateOne({id:id},{$set:{text:newText}});
    return await getTodos();
}

async function changeStatus(id){
    const todo = await getTodosCollection().findOne({id:id})
    const checked = todo?.checked;
    await getTodosCollection().updateOne({id:id},{$set:{checked:!checked}});
    return await getTodos();
}

async function changeStatusAll(active){
    if(active){
        await getTodosCollection().updateMany({},{$set:{checked:true}});
    }else{
        await getTodosCollection().updateMany({},{$set:{checked:false}});
    }
    return await getTodos();
}



const PORT = 3030;

const server = http.createServer();

function getID(req){
    const lastIndex = req.url.lastIndexOf("/");
    const id = +req.url.slice(lastIndex + 1,req.url.length)
    return id;
}


server.listen(PORT);



server.on("request", async function (request, response) {

    const URL = (`http://localhost:${PORT}`+request.url);
    const regex = /http:\/\/[a-z]*\:[0-9]*\/todos/;

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
                const res = await getTodos();
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
                        const res = await mongoAddTodo(data)
                        response.end(JSON.stringify(res)); 
                   }catch(e){
                       console.log(e)
                   }              
               })
                          
            break;

        case "PATCH":
            response.writeHead(200, {...headers,'Content-Type': 'application/json'})
            const id = getID(request); 
            let newText = '';

            request.on('data',chunk  => {
                newText += chunk;
            })
            request.on('end', async()   =>  {
                
                newText = JSON.parse(newText);
                if(newText.hasOwnProperty("changeStatus")){
                   try{
                    const res = await changeStatus(id);
                    response.end(JSON.stringify(res));

                   }catch(e){
                       console.log(e)
                   }
                }else if(newText.hasOwnProperty("title")){

                    try{
                        const res = await updateTodoText(newText?.title,id);
                        response.end(JSON.stringify(res));

                    }catch(e){
                        console.log(e)
                    }
                }else if(newText.hasOwnProperty("changeStatusAll")){
                      try{
                        const res = await changeStatusAll(newText?.active);
                        response.end(JSON.stringify(res));
    
                       }catch(e){
                           console.log(e)
                       }
                }
            })
            break; 
        case "DELETE":
            response.writeHead(200, headers);
            const i = getID(request);
            try{
                const res=await deleteTodo(i)
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