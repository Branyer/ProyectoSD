import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

type Car = {
  direction: "left" | "right";
  color: string;
  timeCrossing: number;
  timeWaiting: number;
  createdAt: number;
};

function generateRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const socket = io("http://localhost:5000");

function App() {
  const intervalRef = useRef<NodeJS.Timeout>();
  const [queueLeft, setQueueLeft] = useState<Car[]>([]);
  const [queueRigth, setQueueRigth] = useState<Car[]>([]);
  const [carCrossing, setCarCrossing] = useState<Car | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const isAllowedToAddCar = Math.random() < 0.5;

      if (isAllowedToAddCar) {
        const direction = Math.random() < 0.5 ? "left" : "right";
        const color = Math.random() < 0.5 ? "red" : "blue";
        const timeWaiting = generateRandomInteger(1000, 5000);
        const timeCrossing = generateRandomInteger(2000, 8000);

        const values: Car = {
          direction,
          color,
          timeWaiting,
          timeCrossing,
          createdAt: Date.now(),
        };

        socket.emit("request-crossing", {
          ...values,
        });
      }
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    socket.on("queue-left", (data) => {
      setQueueLeft(data as Car[]);
    });

    socket.on("queue-rigth", (data) => {
      setQueueRigth(data as Car[]);
    });

    socket.on("car-crossing", (data) => {
      setCarCrossing(data as Car | null);
    });

    return () => {
      socket.off("queue-left");
      socket.off("queue-rigth");
      socket.off("car-crossing");
    };
  }, [socket]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        gap: 50,
      }}
    >
      <div>
        <h3 style={{textAlign: 'center'}}>Cola por la Izquierda</h3>
        <pre style={{ fontSize: 10 }}>
          {JSON.stringify(
            queueLeft.sort((a, b) => a.createdAt - b.createdAt),
            null,
            4
          )}
        </pre>
      </div>
      <div>
        <h3 style={{textAlign: 'center'}}>Carro Pasando por el Puente</h3>
        <pre style={{ fontSize: 10, color: "red" }}>
          {JSON.stringify(carCrossing, null, 4)}
        </pre>
      </div>
      <div>
        <h3 style={{textAlign: 'center'}}>Cola por la Derecha</h3>
        <pre style={{ fontSize: 10 }}>
          {JSON.stringify(
            queueRigth.sort((a, b) => a.createdAt - b.createdAt),
            null,
            4
          )}
        </pre>
      </div>
    </div>
  );
}

export default App;
