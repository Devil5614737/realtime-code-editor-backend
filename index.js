
const express=require('express')
const app=express();
const cors=require('cors');



app.use(cors())


app.use(express.json())







const server = app.listen(
  4000,
  console.log('Server running on PORT 4000...')
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://127.0.0.1:5173",
    // credentials: true,
  },
});


const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                name: userSocketMap[socketId],
            };
        }
    );
}



io.on("connection", (socket) => {
  console.log("user connected");




  socket.on("join room", (room) => {

     userSocketMap[socket.id] = room.name;
        socket.join(room?.uuid);
        const clients = getAllConnectedClients(room?.uuid)
clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                name:socket?.name,
                socketId: socket?.id,
            });
        });
    
  });



socket.on("new input", (data) => {

  socket.in(data?.uuid).emit('input recieved',data?.code)

  });

  socket.off("setup", (userData) => {
    console.log("USER DISCONNECTED");
    socket.leave(userData?.uuid);
  });
});

