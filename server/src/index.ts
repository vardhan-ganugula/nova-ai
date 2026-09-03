import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "@utils/passport.util.js";
import authRoutes from "@routes/auth.route.js";
import { PORT, CLIENT_URL } from "@utils/config.util.js";
import aiRouter from "@routes/ai.route.js";
import testRouter from "@routes/test.route.js";

const app = express();

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRouter);
app.use("/api/test", testRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
