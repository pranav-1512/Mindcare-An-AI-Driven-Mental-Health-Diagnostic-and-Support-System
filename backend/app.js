const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const selfAssessmentRoutes = require("./routes/selfAssessmentRoutes");
const assessmentRoutes = require('./routes/assessmentRoutes')
const authenticate = require('./middleware/authMiddleware')
const planRoutes = require('./routes/planRoutes')
const journalRoutes = require('./routes/journalRoutes');
const resourceRoutes = require('./routes/resourceRoutes')
const chatbotRoutes = require('./routes/chatbot')
const emergencyRoutes = require('./routes/emergencyRoutes')

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
// app.use("/api/self-assessment", authenticate, selfAssessmentRoutes);
app.use("/api/assessments", authenticate, assessmentRoutes);
app.use("/api/plan", authenticate, planRoutes)
app.use('/api/journals', authenticate, journalRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chatbot', chatbotRoutes);

//Emergency Routes
app.use('/api/emergency',authenticate, emergencyRoutes)

const con = mongoose.connection

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
con.on('open',()=>{
    console.log("Connected to db")
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
