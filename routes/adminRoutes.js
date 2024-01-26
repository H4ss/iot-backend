import express from 'express';
import axios from 'axios';
import admin from '../firebaseAdmin.js';

const router = express.Router();
const db = admin.firestore();

// GET: Check if a user is an admin
router.get('/is-admin/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(username);
      const doc = await userRef.get();
  
      if (!doc.exists) {
        return res.status(404).send('User not found');
      }
  
      const userData = doc.data();
      const isAdmin = userData.is_admin || false;
  
      res.status(200).json({ username, isAdmin });
    } catch (error) {
      console.error("Error in checking admin status:", error);
      res.status(500).send("Internal server error");
    }
});

  // PUT: Add/Update is_admin for a user
router.put('/set-admin/:username', async (req, res) => {
    const username = req.params.username;
    const { isAdmin } = req.body; // Expecting a boolean value
  
    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(username);
      const doc = await userRef.get();
  
      if (!doc.exists) {
        return res.status(404).send('User not found');
      }
  
      await userRef.update({ is_admin: isAdmin });
      res.status(200).send(`User ${username}'s admin status updated to ${isAdmin}`);
    } catch (error) {
      console.error("Error in updating admin status:", error);
      res.status(500).send("Internal server error");
    }
});

  // DELETE: Remove is_admin from a user
router.delete('/remove-admin/:username', async (req, res) => {
    const username = req.params.username;
  
    try {
      const db = admin.firestore();
      const userRef = db.collection('users').doc(username);
      const doc = await userRef.get();
  
      if (!doc.exists) {
        return res.status(404).send('User not found');
      }
  
      await userRef.update({ is_admin: admin.firestore.FieldValue.delete() });
      res.status(200).send(`Admin status removed from user ${username}`);
    } catch (error) {
      console.error("Error in removing admin status:", error);
      res.status(500).send("Internal server error");
    }
});

export default router;