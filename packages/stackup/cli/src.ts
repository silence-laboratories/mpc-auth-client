const express = require('express');
const { SigpairAdmin } = require('sigpair-admin-v2');
const dotenv = require('dotenv');
const ed = require('ed'); // Import the 'ed' module

dotenv.config();
const app = express();
app.use(express.json());

const adminToken = process.env.ADMIN_TOKEN;
const baseUrl = 'http://localhost:8080';
const admin = new SigpairAdmin(adminToken, baseUrl);

// Route to create a new user
app.post('/create-user', async (req, res) => {
    try {
        const userName = req.body.userName;
        const userId = await admin.createUser(userName);
        const sk = ed.utils.randomPrivateKey();
        const pk = await ed.getPublicKeyAsync(sk);
        const userToken = admin.genUserToken(userId, ed.etc.bytesToHex(pk));
        res.status(201).json({ userId, userToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
