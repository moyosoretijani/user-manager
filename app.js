
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');

// Replace <password> with the password you created for the database user
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI)
  .then(() => console.log('Connected to School Database!'))
  .catch((err) => console.log(err));
  const studentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    status: { type: String, default: 'Pending' }, // 'Pending', 'Approved', or 'Suspended'
    dateJoined: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
app.use(express.json());
app.use(express.static('public'));

// --- DATABASE HELPERS ---
const getUsersFromFile = () => {
    try {
        const data = fs.readFileSync('./data.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; 
    }
};

const saveUsersToFile = (users) => {
    fs.writeFileSync('./data.json', JSON.stringify(users, null, 2));
};

// --- SECURITY MIDDLEWARE ---
const adminOnly = (req, res, next) => {
    const password = req.query.pass; 
    if (password === 'mubarak123') {
        next(); 
    } else {
        res.status(403).json({ error: "Access Denied: Wrong Password" });
    }
};

// --- ROUTES ---

// 1. GET ALL
app.get('/api/users', (req, res) => {
    res.json(getUsersFromFile());
});

// 2. CREATE
app.post('/add-user', async (req, res) => {
    try {
        const newStudent = new Student({
            fullName: req.body.name,
            email: req.body.email,
            studentId: `SCH-${Math.floor(1000 + Math.random() * 9000)}` // Generates a random School ID
        });

        await newStudent.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving student to database.");
    }
});

// 3. UPDATE
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, role } = req.body;
    let users = getUsersFromFile();
    const index = users.findIndex(u => u.id === userId);

    if (index !== -1) {
        users[index].name = name || users[index].name;
        users[index].role = role || users[index].role;
        saveUsersToFile(users);
        res.json(users[index]);
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

// 4. DELETE
app.get('/api/users/delete/:id', adminOnly, (req, res) => {
    const userId = parseInt(req.params.id);
    let users = getUsersFromFile();
    const filteredUsers = users.filter(u => u.id !== userId);
    saveUsersToFile(filteredUsers);
    res.json({ success: true, message: "Deleted successfully" });
});

// --- START SERVER ---
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});