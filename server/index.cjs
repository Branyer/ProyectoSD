const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let queueLeft = [];
let queueRight = [];
let carCrossing = null;

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  function carCrossingAction() {
    setTimeout(() => {
      const queues = [...queueLeft, ...queueRight].sort(
        (a, b) => a.createdAt - b.createdAt
      );

      if (queues.length === 0) {
        carCrossing = null;
        socket.emit("car-crossing", null);
      } else {
        carCrossing = queues[0];

        switch (carCrossing.direction) {
          case "left":
            queueLeft = queueLeft.filter(
              (q) => q.createdAt !== carCrossing.createdAt
            );

            socket.emit("queue-left", [...queueLeft]);
            break;

          case "right":
            queueRight = queueRight.filter(
              (q) => q.createdAt !== carCrossing.createdAt
            );

            socket.emit("queue-rigth", [...queueRight]);
            break;

          default:
            break;
        }

        socket.emit("car-crossing", { ...carCrossing });
        carCrossingAction();
      }
    }, carCrossing.timeWaiting + carCrossing.timeCrossing);
  }

  socket.on("request-crossing", (data) => {
    if (carCrossing?.createdAt) {
      switch (data.direction) {
        case "left":
          queueLeft.push(data);

          socket.emit("queue-left", [...queueLeft]);
          break;

        case "right":
          queueRight.push(data);

          socket.emit("queue-rigth", [...queueRight]);
          break;

        default:
          break;
      }
    } else {
      carCrossing = { ...data };
      socket.emit("car-crossing", { ...carCrossing });
      carCrossingAction();
    }
  });
});

server.listen(5000, () => {
  console.log("SERVER IS RUNNING");
});
