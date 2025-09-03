import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Error handling
app.use(errorHandler);

export default app;
