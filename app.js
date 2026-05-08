const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

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
app.post('/api/users', (req, res) => {
    const { name, role } = req.body;
    if (!name || !role) return res.status(400).json({ error: "Name and Role required" });

    const users = getUsersFromFile();
    const newUser = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        name,
        role
    };
    users.push(newUser);
    saveUsersToFile(users);
    res.status(201).json(newUser);
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