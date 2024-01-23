import express from 'express';
import admin from '../firebaseAdmin.js'; // Adjust the path

const router = express.Router();

// Test route for Firebase operations
router.get('/', async (req, res) => {
  const db = admin.firestore();

  try {
    // Create a new collection and document
    const docRef = db.collection('testCollection').doc('testDocument');
    await docRef.set({ field: 'value' });
    console.log("Document written, proceeding to the deletion in 5 seconds...");

    // Delay (e.g., 10 seconds) before deleting
    setTimeout(async () => {
      // Deleting the document
      await docRef.delete();
      console.log("Document deleted");
    }, 5000);

    res.send("Firestore test initiated. Check console for details.");
  } catch (error) {
    console.error("Error in Firestore operation: ", error);
    res.status(500).send("Error testing Firestore");
  }
});

export default router;
