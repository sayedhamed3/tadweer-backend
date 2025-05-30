const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const testJwtRouter = require("./controllers/test-jwt")
const authRoutes = require("./controllers/auth.routes")
const verifyToken = require("./middleware/verify-token")

const userRoutes = require("./controllers/users");
const companyRoutes = require("./controllers/companies");
const workerRoutes = require("./controllers/workers");
const materialRoutes = require("./controllers/materials");
const disposalRoutes = require("./controllers/disposals");
const achievementRoutes = require("./controllers/achievements");

require("./utils/disposalScheduler")

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Routes go here
app.use("/auth",authRoutes)

app.use("/test-jwt",verifyToken,testJwtRouter)

app.use("/users", userRoutes);

app.use("/companies", companyRoutes);

app.use("/workers", workerRoutes);

app.use("/materials", materialRoutes);

app.use("/disposals", disposalRoutes);

app.use("/achievements", achievementRoutes);



app.listen(3000, () => {
  console.log('The express app is ready!');
});
