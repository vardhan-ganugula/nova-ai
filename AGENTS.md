## Project engineering guide
this is pern stack application ( postgress, express, react, node) with redis, inngest and Typescript 

the application is about to crete a saas based video, audio and image generation platform similar to elevenlabs, replicate and other platforms.

I want to add features like n8n so that they can schedule the posting of the generated content to their social media accounts. 

First implement the frontend based on the approval implement the backend and apis for the frontend 


## Repository layout 

- `client/` contains the react application with typescript 
- `server/` contains the nodejs express application with typescript and postgres 
- `docs/` contains the documentation of the application 

## Testing 
testing is not primary concern once the project is build to alpha level i will start the testing 
so dont run npm run build or npm run lint, instead run "npm run dev" if it has errors then solve it 

## Instructions 
- add and maintaing the pagenation, don't send entire data once instead send only 10 items or whatever required per page 
- use zod for data validation, request validation and response validation 
- use redis for caching, rate limiting and pub/sub 
- use inngest for asynchronous task processing and scheduling 