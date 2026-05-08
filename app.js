const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static('public'));

// --- DATABASE CONNECTION ---
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ Connected to School Database!'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

// --- SCHEMA & MODEL ---
const studentSchema = new mongoose.Schema({
    fullName: String,
    role: String,
    dateJoined: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// --- SECURITY MIDDLEWARE ---
const adminOnly = (req, res, next) => {
    const password = req.query.pass; 
    if (password === 'mubarak123') {
        next(); 
    } else {
        res.status(403).json({ error: "Access Denied" });
    }
};

// --- API ROUTES ---

// 1. GET ALL USERS (Called by loadUsers() in HTML)
app.get('/api/users', async (req, res) => {
    try {
        const students = await Student.find();
        // Map _id to id so your frontend script stays the same
        const formatted = students.map(s => ({
            id: s._id,
            name: s.fullName,
            role: s.role
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// 2. CREATE USER (Called by addUser() in HTML)
app.post('/api/users', async (req, res) => {
    try {
        const newStudent = new Student({
            fullName: req.body.name,
            role: req.body.role
        });
        await newStudent.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save user" });
    }
});

// 3. DELETE USER
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