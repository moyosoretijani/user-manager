const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARE ---
// This line is VITAL for HTML forms to work!
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs'); // Ensure EJS is set

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ Connected to School Database!'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

// --- SCHEMA ---
const studentSchema = new mongoose.Schema({
    fullName: String,
    role: String,
    dateJoined: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// --- ROUTES ---

// 1. GET ALL (The HTML needs this to display the list)
app.get('/api/users', async (req, res) => {
    try {
        const students = await Student.find();
        // We map MongoDB's 'fullName' back to 'name' so your HTML script works
        const formattedUsers = students.map(s => ({
            id: s._id,
            name: s.fullName, 
            role: s.role
        }));
        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch" });
    }
});

// 2. CREATE (The HTML 'addUser' function calls this)
app.post('/api/users', async (req, res) => {
    try {
        const newStudent = new Student({
            fullName: req.body.name, // Matches 'name' from your HTML script
            role: req.body.role
        });
        await newStudent.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Save failed" });
    }
});

// 3. DELETE (Using MongoDB ID)
app.get('/api/users/delete/:id', adminOnly, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});