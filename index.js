import 'dotenv/config';
import express from 'express';
import firebaseApp from './firebase-config.js';
import testRoute from './routes/testFirebaseAdmin.js';
import admin from './firebaseAdmin.js';
import userRoute from './routes/usersRoutes.js';
import adminRoute from './routes/adminRoutes.js';
import mqtt from 'mqtt';


const router = express.Router();
const db = admin.firestore();
const app = express();
const port = process.env.PORT || 4000;

// mqtt config
const options = {
    clientId: "mqtt_captor_list",
    clean: true,
}

// mqtt config 2
const options2 = {
    clientId: "mqtt_test2",
    clean: true,
}

const url = "mqtt://13.48.136.9:1883";
const client = mqtt.connect(url, options);
const client_debug = mqtt.connect(url, options2);


client.on('connect', function () {
    console.log('Subscriber connected to MQTT Server');
    // Subscribe to a Topic
    client.subscribe('captors_info', function (err) {
      if (!err) {
        console.log('Subscribed to captors_info');
      } else {
        console.error('Error Subscribing to Topic:', err);
      }
    });

    client_debug.subscribe('test_topic/#', function (err) {
      if (!err) {
        console.log('Subscribed to test_topic/#', err);
      } else {
        console.error('Error Subscribing to Topic:', err);
      }
    });
});

let lastCaptorsValue = null;
let lastReceivedMessage = null;

// Handle MQTT Message Event
client.on('message', function (topic, message) {
    lastCaptorsValue = message;
});

// Handle MQTT Message Event
client_debug.on('message', function (topic, message) {
    lastReceivedMessage = message.toString();
});
  
// Handle MQTT Client Error Event
client.on('error', function (err) {
    console.error('Subscriber Error:', err);
});

// Handle MQTT Client Error Event
client_debug.on('error', function (err) {
    console.error('Subscriber Error:', err);
});

//general route for mqtt
app.get('/captors_info', (req, res) => {
    res.send(lastCaptorsValue);
});

//general route for mqtt
app.get('/msgtestbroker', (req, res) => {
    res.send(lastReceivedMessage);
});

// Broker mqtt end


// config
app.use(express.json());

// Testing routes
app.use('/test-firebase', testRoute);

// User routes
app.use('/api/user', userRoute);

//admin routes
app.use('/api/admin', adminRoute);

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});