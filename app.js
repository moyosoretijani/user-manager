const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(express.static('public'));

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('✅ Connected to School Database!'))
  .catch((err) => console.error('❌ Connection Error:', err));

const studentSchema = new mongoose.Schema({
    fullName: String,
    role: String
});
const Student = mongoose.model('Student', studentSchema);

const adminOnly = (req, res, next) => {
    if (req.query.pass === 'mubarak123') return next();
    res.status(403).json({ error: "Access Denied" });
};

// GET ALL
app.get('/api/users', async (req, res) => {
    const students = await Student.find();
    res.json(students.map(s => ({ id: s._id, name: s.fullName, role: s.role })));
});

// CREATE
app.post('/api/users', async (req, res) => {
    const newStudent = new Student({ fullName: req.body.name, role: req.body.role });
    await newStudent.save();
    res.json({ success: true });
});

// UPDATE
app.put('/api/users/:id', async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, { 
        fullName: req.body.name, 
        role: req.body.role 
    });
    res.json({ success: true });
});

// DELETE
app.get('/api/users/delete/:id', adminOnly, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.listen(port, () => console.log(`🚀 Server running on ${port}`));