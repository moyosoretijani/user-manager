const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Body Parsers - Vital for reading your "Add" data
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to School DB'))
  .catch(err => console.error('❌ Connection Error:', err));

// Schema
const Student = mongoose.model('Student', new mongoose.Schema({
    fullName: String,
    role: String
}));

// --- API ROUTES ---

// GET: Fetch all users
app.get('/api/users', async (req, res) => {
    try {
        const students = await Student.find();
        const cleanData = students.map(s => ({
            id: s._id,
            name: s.fullName || "Unknown",
            role: s.role || "Staff/Student"
        }));
        res.json(cleanData);
    } catch (err) {
        res.status(500).json({ error: "Failed to load" });
    }
});

// POST: Add new user
app.post('/api/users', async (req, res) => {
    try {
        if (!req.body.name || !req.body.role) {
            return res.status(400).json({ error: "Missing fields" });
        }
        const newStudent = new Student({ 
            fullName: req.body.name, 
            role: req.body.role 
        });
        await newStudent.save();
        res.json({ success: true });
    } catch (err) {
        console.error("SAVE ERROR:", err); // This will show in Render logs
        res.status(500).json({ error: err.message });
};

// PUT: Edit existing user
app.put('/api/users/:id', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { 
            fullName: req.body.name, 
            role: req.body.role 
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// DELETE: Remove user
app.get('/api/users/delete/:id', async (req, res) => {
    if (req.query.pass !== 'mubarak123') return res.status(403).send("Denied");
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send("Delete error");
    }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));