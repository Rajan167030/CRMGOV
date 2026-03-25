import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDefaultUsers } from "./services/auth.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultUsers();
    app.listen(PORT, () => {
      console.log(`Backend server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend server", error);
    process.exit(1);
  }
};

startServer();
