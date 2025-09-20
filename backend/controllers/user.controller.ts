import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = "tempJWT"; // ⚠️ Move this to process.env.JWT_SECRET in production

// ----------------- LOGIN -----------------
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Please provide username and password",
        success: false,
      });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      token,
      message: "Logged in successfully",
      success: true,
    });
  } catch (error) {
    console.error("ERROR (login):", error);
    return res.status(500).json({
      error,
      success: false,
      message: "Internal server error",
    });
  }
};

// ----------------- SIGNUP -----------------
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Please provide all details",
        success: false,
      });
    }

    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      username,
      password: hash,
      email,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error("ERROR (signup):", error);
    return res.status(500).json({
      error,
      success: false,
      message: "Internal server error",
    });
  }
};

// ----------------- MIDDLEWARE -----------------
export const isAuthenticated = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided", success: false });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format", success: false });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token", success: false });
      }

      // Attach decoded user to req
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
      };

      next();
    });
  } catch (error) {
    console.error("ERROR (isAuthenticated):", error);
    return res.status(500).json({
      error,
      success: false,
      message: "Internal server error",
    });
  }
};

// ----------------- LOGOUT -----------------
export const logout = async (req: Request, res: Response) => {
  try {
    // If you're using client-side storage only:
    // Just tell the client to remove token
    return res.status(200).json({
      success: true,
      message: "Logged out successfully. Please remove token on client side.",
    });

    // --- OPTIONAL (Blacklist Example) ---
    // If you want server-controlled logout:
    // Save token to blacklist (in Redis/DB) with expiry
    // const authHeader = req.headers["authorization"];
    // const token = authHeader && authHeader.split(" ")[1];
    // if (token) {
    //   await redisClient.set(`blacklist:${token}`, "true", { EX: 3600 });
    // }
    // return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("ERROR (logout):", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// import { UserModel } from "../models/user.model";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";

// const JWT_SECRET = "tempJWT";

// export const login = async (req: any, res: any) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({
//         message: "Please provide username and password",
//         success: false,
//       });
//     }

//     const user = await UserModel.findOne({ username });
//     if (!user) {
//       return res.status(404).json({
//         message: "User not found",
//         success: false,
//       });
//     }

//     const checkPassword = await bcrypt.compare(password, user.password);
//     if (!checkPassword) {
//       return res.status(401).json({
//         message: "Invalid password",
//         success: false,
//       });
//     }

//     const token = jwt.sign(
//       {
//         id: user._id,
//         username: user.username,
//       },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.status(200).json({
//       token,
//       message: "Logged in successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.error("ERROR ", error);
//     return res.status(500).json({
//       error,
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// export const signup = async (req: any, res: any) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !password || !email) {
//       return res.status(400).json({
//         message: "Please provide all details",
//         success: false,
//       });
//     }

//     const existingUser = await User.findOne({ $or: [{ username }, { email }] });
//     if (existingUser) {
//       return res.status(409).json({
//         message: "User already exists",
//         success: false,
//       });
//     }

//     const hash = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       username,
//       password: hash,
//       email,
//     });

//     const token = jwt.sign(
//       {
//         id: newUser._id,
//         username: newUser.username,
//       },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.status(201).json({
//       success: true,
//       message: "User created successfully",
//       token,
//     });
//   } catch (error) {
//     console.error("ERROR ", error);
//     return res.status(500).json({
//       error,
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

// export const isAuthenticated = (req: any, res: any, next: any) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//       return res.status(401).json({ message: "No token provided", success: false });
//     }

//     const token = authHeader.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ message: "Invalid token format", success: false });
//     }

//     jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
//       if (err) {
//         return res.status(401).json({ message: "Invalid token", success: false });
//       }

//       req.user = decoded;
//       next();
//     });
//   } catch (error) {
//     console.error("ERROR ", error);
//     return res.status(500).json({
//       error,
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
