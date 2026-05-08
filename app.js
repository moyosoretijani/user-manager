const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Connection Error:', err));

const Student = mongoose.model('Student', new mongoose.Schema({
    fullName: String,
    role: String
}));

// API: GET ALL
app.get('/api/users', async (req, res) => {
    try {
        const students = await Student.find();
        // The .map() ensures we only send clean data to the frontend
        const cleanData = students.map(s => ({
            id: s._id,
            name: s.fullName || "Unnamed",
            role: s.role || "No Role"
        }));
        res.json(cleanData);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ error: "Server Crash" });
    }
});

// API: CREATE
app.post('/api/users', async (req, res) => {
    try {
        const newStudent = new Student({ fullName: req.body.name, role: req.body.role });
        await newStudent.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Save Failed" });
    }
});

// API: UPDATE (For the Edit button)
app.put('/api/users/:id', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, { 
            fullName: req.body.name, 
            role: req.body.role 
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Update Failed" });
    }
});

// API: DELETE
app.get('/api/users/delete/:id', async (req, res) => {
    if (req.query.pass !== 'mubarak123') return res.status(403).send("Wrong Pass");
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(port, () => console.log(`🚀 Live on ${port}`));