import axios from "axios";

function add(a: number, b: number): number {
  return a + b;
}

describe("Authentication", () => {
  test("User is Able to Signup", async () => {
    let username = "Parth" + Math.random();
    let password = "helloworld";
    const res: any = await axios.post("http://localhost:3000/api/v1/user/signin", {
      username,
      password,
      type: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.data.token).toBeDefined()

    try {
        await axios.post("http://localhost:3000/api/v1/user/signin", {
          username,
          password,
          type: "admin",
        });
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.success).toBe(false);
      }
  });

  test("User singup request fails if the username is empty", async () => {
    let password = "1234";

    try {
        const res = await axios.post("http://localhost:3000/api/v1/user/signin", {
        password,
        });
    } catch (error: any) {
        expect(error.response.status).toBe(400);
    }

  });
});

// describe("User Information Endpoints", () => {
//     let token = ""
//     beforeAll(async () => {
//         const username = "parth" + Math.random();
//         let password = "1234"

//         const res = await axios.post("http://localhost:3000/api/v1/user/signin", {
//             username,
//             password,
//         })

//         token = res.data.token
//     })

//     // test("", () => {

//     // })
// })
