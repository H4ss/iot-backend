import express from 'express';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const db = admin.firestore();

// POST: Create a new user
router.post('/create-user', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  const userRef = db.collection('users').doc(username);

  // Check if user already exists
  const doc = await userRef.get();
  if (doc.exists) {
    return res.status(409).send('User already exists');
  }

  // Create a new user
  const userData = {
    username,
    password,
    captors: {} // Empty object for captors
  };

  await userRef.set(userData);
  res.status(201).send(`User created with username: ${username}`);
});

// GET: Retrieve a user by username
router.get('/find/:username', async (req, res) => {
    const username = req.params.username;
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      res.status(404).send('User not found');
    } else {
      res.status(200).send(doc.data());
    }
});

// GET: Retrieve all users
router.get('/users', async (req, res) => {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
  
    const users = [];
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
  
    res.status(200).send(users);
});

// PUT: Update a user's username
router.put('/update-username/:oldUsername', async (req, res) => {
    const oldUsername = req.params.oldUsername;
    const { newUsername } = req.body;
  
    if (!newUsername) {
      return res.status(400).send('New username is required');
    }
  
    const oldUserRef = db.collection('users').doc(oldUsername);
    const newUserRef = db.collection('users').doc(newUsername);
  
    const newDoc = await newUserRef.get();
    if (newDoc.exists) {
      return res.status(409).send('New username already exists');
    }
  
    const oldDoc = await oldUserRef.get();
    if (!oldDoc.exists) {
      return res.status(404).send('Old user not found');
    }
  
    const userData = oldDoc.data();
    userData.username = newUsername; // Update the username field in the document
  
    await newUserRef.set(userData);
    await oldUserRef.delete();
  
    res.status(200).send(`Username updated from ${oldUsername} to ${newUsername}`);
  });  

export default router;
