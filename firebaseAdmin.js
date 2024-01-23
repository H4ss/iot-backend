import admin from 'firebase-admin';
import serviceAccount from './iot-tek-fb-admin.json' assert {type: 'json'};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export default admin;
