import express from 'express';
import axios from 'axios';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const db = admin.firestore();

router.get('/login', async (req, res) => {
    const { username, password } = req.query

    if (!username || !password) {
        return res.status(400).json('Username and password are required');
    }

    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();

    if (!doc.exists) {
        return res.status(404).json('User not found');
    }

    const user = doc.data();
    if (user.password === password) {
        // Passwords match
        // TODO: Implement token generation or session creation as per your authentication strategy
        res.status(200).json('Login successful');
    } else {
        // Passwords do not match
        res.status(401).json('Invalid password');
    }
});

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
      return res.status(400).json('New username is required');
    }
  
    const oldUserRef = db.collection('users').doc(oldUsername);
    const newUserRef = db.collection('users').doc(newUsername);
  
    const newDoc = await newUserRef.get();
    if (newDoc.exists) {
      return res.status(409).json('New username already exists');
    }
  
    const oldDoc = await oldUserRef.get();
    if (!oldDoc.exists) {
      return res.status(404).json('Old user not found');
    }
  
    const userData = oldDoc.data();
    userData.username = newUsername; // Update the username field in the document
  
    await newUserRef.set(userData);
    await oldUserRef.delete();
  
    res.status(200).json(`Username updated from ${oldUsername} to ${newUsername}`);
});

// PUT: Update a user's password
router.put('/update-password/:username', async (req, res) => {
    const username = req.params.username;
    const { oldPassword, newPassword } = req.body;
  
    if (!oldPassword || !newPassword) {
      return res.status(400).json('Old and new passwords are required');
    }
  
    // TODO: Add password strength validation for newPassword here

    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      return res.status(404).json('User not found');
    }
  
    const user = doc.data();
    if (user.password !== oldPassword) { // This is a simple check; we might need to do it hashed
      return res.status(401).json('Old password is incorrect');
    }
  
    await userRef.update({ password: newPassword });
    res.status(200).json(`Password updated for user: ${username}`);
});

// DELETE: Delete a user account
router.delete('/delete-user/:username', async (req, res) => {
    const username = req.params.username;
  
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      return res.status(404).send('User not found');
    }
  
    await userRef.delete();
    res.status(200).send(`User account '${username}' has been deleted`);
});

// PUT: Add a captor to a user's captors map
router.put('/add-captor/:username', async (req, res) => {
    const username = req.params.username;
    const { captorName, captorValue } = req.body;
  
    if (!captorName) {
      return res.status(400).send('Captor name is required');
    }
  
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      return res.status(404).send('User not found');
    }
  
    // Update the captors map
    const userCaptors = doc.data().captors || {};
    userCaptors[captorName] = 0;
  
    await userRef.update({ captors: userCaptors });
    res.status(200).send(`Captor '${captorName}' added/updated for user: ${username}`);
});

function calculateAirQualityPercentage(rawValue) {
    const minValue = 10000; // Worst air quality
    const maxValue = 30000; // Best air quality

    // Clamp rawValue between minValue and maxValue
    rawValue = Math.max(minValue, Math.min(maxValue, rawValue));

    // Normalize the value between 0 and 1, then convert to percentage
    const normalized = (rawValue - minValue) / (maxValue - minValue);
    return Math.round(normalized * 100);
}

function getAirQualityMessage(percentage, currentTime) {
    const hour = parseInt(currentTime.split(':')[0]);

    if (percentage > 90) {
        return "Your air quality is excellent.";
    } else if (percentage > 70) {
        return "Your air quality is good.";
    } else if (hour >= 18) {
        return "Open your windows for the night.";
    } else if (hour >= 6 && hour < 18) {
        return "Leave some air go in for today.";
    } else {
        return "Air quality is poor.";
    }
}

router.get('/data-test', async (req, res) => {
    res.json({
        CO2: 28999,
        time: "10:30:00"
    });
})

router.get('/air-quality', async (req, res) => {
    // Replace this with actual data fetching mechanism
    const airQualityDataTest = {"CO2": "16000", "time": "7:30:00"};
    let airQualityData = axios.get("http://localhost:4000/captors_info").then((response) => { return response.data; });
    

    const rawCO2Value = parseInt(airQualityDataTest.CO2);
    const airQualityPercentage = calculateAirQualityPercentage(rawCO2Value);
    const message = getAirQualityMessage(airQualityPercentage, airQualityDataTest.time);

    res.json({
        percentage: airQualityPercentage,
        message: message
    });
});

// PUT: Update selected captors
router.put('/update-captor/:username/:captor', async (req, res) => {
    const username = req.params.username;
    const captor = req.params.captor;

    // get request to /captors_info to retrieve the json, then parse it by the captor name
    let result = await axios.get("http://localhost:4000/captors_info").then((response) => { return response.data; });
    const { captorValue } = result[captor];
  
    if (!captor) {
      return res.status(400).send('Captor name is required');
    }
  
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      return res.status(404).send('User not found');
    }
  
    // Update the captors map
    const userCaptors = doc.data().captors || {};
    userCaptors[captor] = captorValue;
  
    await userRef.update({ captors: userCaptors });
    res.status(200).send(`Captor '${captor}' updated for user: ${username}`);
});

// DELETE: Remove a captor from a user's captors map
router.delete('/delete-captor/:username', async (req, res) => {
    const username = req.params.username;
    const { captorName } = req.body;
  
    if (!captorName) {
      return res.status(400).send('Captor name is required');
    }
  
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
  
    if (!doc.exists) {
      return res.status(404).send('User not found');
    }
  
    // Remove the captor from the map
    const userCaptors = doc.data().captors || {};
    if (userCaptors.hasOwnProperty(captorName)) {
      delete userCaptors[captorName];
      await userRef.update({ captors: userCaptors });
      res.status(200).send(`Captor '${captorName}' removed from user: ${username}`);
    } else {
      res.status(404).send(`Captor '${captorName}' not found for user: ${username}`);
    }
});

export default router;
