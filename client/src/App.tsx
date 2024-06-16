import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import moment from "moment";

type Car = {
  direction: "left" | "right";
  color: string;
  timeCrossing: number;
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
        const timeCrossing = generateRandomInteger(6000, 10000);

        const values: Car = {
          direction,
          color,
          timeCrossing,
          createdAt: Date.now(),
        };

        socket.emit("request-crossing", {
          ...values,
        });
      }
    }, 3000);

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
      <div style={{
        width: 600,
        overflowX: "auto"
      }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
          }}
        >
          {queueLeft
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((car) => (
              <div
                key={car.createdAt}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  width: 150
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "gray",
                    fontWeight: "bold",
                  }}
                >
                  Tiempo cruzando {car.timeCrossing / 1000} seg
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "gray",
                    fontWeight: "bold",
                  }}
                >
                  Agregado el {moment(car.createdAt).format('DD/MM/YYYY, h:mm:ss a')}
                </span>

                <img src="/assets/car-1.png" width={100} height={40} />
              </div>
            ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: 400
        }}
      >
        {carCrossing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              width: 150
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: "gray",
                fontWeight: "bold",
              }}
            >
              Tiempo cruzando {carCrossing.timeCrossing / 1000} seg
            </span>
            <span
              style={{
                fontSize: 14,
                color: "gray",
                fontWeight: "bold",
              }}
            >
              Agregado el {moment(carCrossing.createdAt).format('DD/MM/YYYY, h:mm:ss a')}
            </span>

            <img
              src={`/assets/${
                carCrossing?.direction === "right" ? "car-2" : "car-1"
              }.png`}
              width={100}
              height={40}
            />
          </div>
        ) : (
          <div style={{ height: 112 }}></div>
        )}

        <img src="/assets/bridge.png" width={400} height={100} />
      </div>

      <div style={{
        width: 600,
        overflowX: "auto"
      }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
          }}
        >
          {queueRigth
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((car) => (
              <div
                key={car.createdAt}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  width: 150
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: "gray",
                    fontWeight: "bold",
                  }}
                >
                  Tiempo cruzando {car.timeCrossing / 1000} seg
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "gray",
                    fontWeight: "bold",
                  }}
                >
                  Agregado el {moment(car.createdAt).format('DD/MM/YYYY, h:mm:ss a')}
                </span>

                <img src="/assets/car-2.png" width={100} height={40} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;
