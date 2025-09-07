import dotenv from "dotenv";
import app from "./app.js"; 

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

});
