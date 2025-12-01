import axios from "axios";
import server from "../index"; // Asegúrate de que la ruta sea correcta

let address: string;

beforeAll(async () => {
  // Escuchamos en un puerto dinámico permitido en GitHub Actions
  await server.listen({ port: 0, host: "127.0.0.1" });
  const addr = server.server.address() as any;
  const port =
    typeof addr === "string"
      ? parseInt(addr.split(":").pop() as string, 10)
      : addr.port;
  address = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await server.close();
});
describe("Water Module Endpoints", () => {
  test("POST /api/v1/water/solve - should return 400 for invalid input", async () => {
    try {
      await axios.post(`${address}/api/v1/water/solve`, {
        x_capacity: -5,
        y_capacity: 3,
        z_amount_wanted: 4,
      });
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.code).toBe("FST_ERR_VALIDATION");
        expect(error.response.data.message).toContain(
          "x_capacity must be a positive number."
        );
      } else {
        throw error;
      }
    }
  });

  test("POST /api/v1/water/solve - should return 422 for amount wanted greater than capacities", async () => {
    try {
      await axios.post(`${address}/api/v1/water/solve`, {
        x_capacity: 5,
        y_capacity: 3,
        z_amount_wanted: 10,
      });
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.message).toContain(
          "Amount wanted is greater than the capacity of both jugs."
        );
      } else {
        throw error;
      }
    }
  });

  test("POST /api/v1/water/solve - should return 422 for amount wanted not a multiple of gcd", async () => {
    try {
      await axios.post(`${address}/api/v1/water/solve`, {
        x_capacity: 5,
        y_capacity: 3,
        z_amount_wanted: 2,
      });
    } catch (error: any) {
      if (error.response) {
        expect(error.response.status).toBe(422);
        expect(error.response.data.message).toContain(
          "Amount wanted is not a multiple of the greatest common divisor of the capacities of the jugs."
        );
      } else {
        throw error;
      }
    }
  });
});
