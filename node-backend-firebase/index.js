const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const app = express();
const PORT = 5000;

// ✅ Enable CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// ✅ Load Firebase Admin credentials
const serviceAccount = require('./serviceAccountKey.json'); // Make sure filename is correct

// ✅ Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://form-details-80ca9-default-rtdb.firebaseio.com/" // <-- 🔁 Replace with your real Firebase DB URL
});

const db = admin.database(); // RTDB root ref

// ✅ Root route — just for friendly message
app.get('/', (req, res) => {
  res.send('🚀 Firebase Node API is live! Use POST /api/users and GET /api/users');
});

// ✅ POST /api/users — Add user to Firebase
app.post('/api/users', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔥 Received from React:", { username, password });

    // Push new user to Firebase
    await db.ref("users").push({
      Username: username,
      Password: password,
      CreatedAt: new Date().toISOString()
    });

    res.json({ message: "✅ User saved to Firebase" });
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).json({ error: "Failed to save user" });
  }
});

// ✅ GET /api/users — Retrieve all users from Firebase
app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.ref("users").once("value");
    const data = snapshot.val();

    const users = data ? Object.values(data) : [];
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
