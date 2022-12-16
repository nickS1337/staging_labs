const { Server } = require('ws');
 
const sockserver = new Server({ port: 27015 });
sockserver.on('connection', (ws) => {
   console.log('New client connected!'); 
   ws.on('close', () => console.log('Client has disconnected!'));
});