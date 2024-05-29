require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path'); // Add this line to use the 'path' module
const OpenAI = require('openai');
const bodyParser = require('body-parser');

const cors = require('cors');

// 

const app = express();


// Enable CORS for all routes
app.use(cors());


app.use(express.json());

const http = require('http');

console.log("MongoDB URI:", process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  // useNewUrlParser and useUnifiedTopology are no longer needed in version 4.x
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB:", err);
  process.exit(1);
});

// START OF KEYS 


const keyStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    key: {
        type: String,
        required: true
    },
    right: {
        type: Number,
        default: 0 // Default value if not provided
    },
    wrong: {
        type: Number,
        default: 0 // Default value if not provided
    }
});

const KeyStats = mongoose.model('KeyStats', keyStatsSchema);
app.post('/updateKeyStats/:userId', async (req, res) => {
    const userId = req.params.userId;
    const keyStatsData = req.body;

    console.log('Received keyStats:', keyStatsData);
    console.log('Received userId:', userId);

	try {
	    // Process each key in keyStatsData
	    for (const key in keyStatsData) {
	        if (Object.hasOwnProperty.call(keyStatsData, key)) {
	            const { right, wrong } = keyStatsData[key];

	            // Find the existing KeyStats document for the current key and user
	            let existingKeyStats = await KeyStats.findOne({ userId, key });

	            if (!existingKeyStats) {
	                // If the document doesn't exist, create a new one
	                existingKeyStats = new KeyStats({
	                    userId,
	                    key,
	                    right: right || 0,
	                    wrong: wrong || 0
	                });
	            } else {
	                // If the document exists, update its fields
	                existingKeyStats.right = right || existingKeyStats.right;
	                existingKeyStats.wrong = wrong || existingKeyStats.wrong;
	            }

	            // Save the updated or new KeyStats document to the database
	            await existingKeyStats.save();
	        }
	    }

	    console.log("Key stats updated successfully");

	    res.sendStatus(200); // Send success response
	} catch (error) {
	    console.error('Error updating key stats:', error);
	    res.status(500).send('Internal Server Error');
	}
});

// Endpoint to retrieve key statistics report for a specific user
app.get('/getKeyStatsReport/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
		console.log("received user ID: ",userId);

        // Use await to wait for the Promise returned by KeyStats.find()
        const keyStats = await KeyStats.find({ userId: userId });

        // Create a report object from the keyStats array
        const report = keyStats.reduce((acc, cur) => {
            acc[cur.key] = { right: cur.right, wrong: cur.wrong };
            return acc;
        }, {});
		
		console.log(report);
        // Send the report as JSON response
        res.json(report);
    } catch (error) {
        console.error('Error retrieving key stats:', error);
        res.status(500).send('Error retrieving key stats');
    }
});

// END OF KEYS


// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'regular'], default: 'regular' }
});

const User = mongoose.model('User', userSchema);

// Express middleware
app.use(express.json());


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Configure session middleware
app.use(session({
    secret: 'ThisIsTheKey',
    resave: false,
    saveUninitialized: false
}));




// Routes
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role }); // Include role in user creation
    await user.save();
    res.status(201).send("User registered successfully.");
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      // If the error is due to duplicate username
      res.status(400).send("Username already exists. Please choose a different username.");
    } else {
      console.error("Error registering user:", err);
      res.status(500).send("Error registering user.");
    }
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      // Retrieve user role
      const { role } = user;
      res.status(200).json({ message: "Login successful.", userId: user._id, role }); // Include role in response
    } else {
      res.status(401).send("Invalid username or password.");
    }
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Error logging in.");
  }
});


// Route for logout
app.post('/logout', (req, res) => {
    // Clear the session (if using express-session)
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send("Error logging out.");
        } else {
            res.clearCookie('session-id'); // Clear the session cookie
            res.status(200).send("Logged out successfully.");
        }
    });
});


// Routes
// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE a user by ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send('User deleted successfully');
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send('Internal Server Error');
  }
});

// Create a schema for your data
const dataSchema = new mongoose.Schema({
  myVariable: String
});

// Create a model based on the schema
const Data = mongoose.model('Data', dataSchema);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to save the variable to the database
app.post('/saveVariable', async (req, res) => {
  try {
    const newData = new Data({ myVariable: req.body.myVariable });
    await newData.save();
    res.send('Variable saved successfully.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving variable.');
  }
});

app.get('/getVariable', async (req, res) => {
  try {
    const data = await Data.findOne();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error getting variable.');
  }
});

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    magicNumber: {
        type: Number
    },
    showKeyNames: {
        type: Boolean
    },
    keyVol: {
        type: Number
    },
    songVol: {
        type: Number
    }
});

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettings;

// Endpoint to update user settings for a specific user
app.post('/updateUserSettings/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { userSettings } = req.body;
	console.log("Settings coming in: ", userSettings);

    try {
        // Update user settings in the database
        // Find the user settings document for the given userId
        let existingUserSettings = await UserSettings.findOne({ userId });
		console.log("EXISTING SETTINGS: ",existingUserSettings);
        if (!existingUserSettings) {
            // If user settings document doesn't exist, create a new one
            existingUserSettings = new UserSettings({
                userId,
                ...userSettings
            });
        } else {
            // If user settings document exists, update its fields with values from userSettings
            existingUserSettings = {
                ...existingUserSettings.toObject(), // Convert existingUserSettings to plain object
                ...userSettings // Update with userSettings
            };
        }

        // Save the updated or new UserSettings document to the database
        await UserSettings.findOneAndUpdate({ userId }, existingUserSettings, { upsert: true });

        console.log("User settings updated successfully");

        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get user settings for a specific user
app.get('/getUserSettings/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Retrieve user settings from the database for the specified user
        let userSettings = await UserSettings.findOneAndUpdate(
            { userId }, // Find by userId
            {}, // Empty update - no changes needed, only fetching
            { upsert: true, new: true } // Upsert option to create if not found, new option to return the modified document
        );

        console.log("User settings:", userSettings);

        res.json({ userSettings }); // Send user settings as JSON response
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).send('Internal Server Error');
    }
});

/*

const magicNumberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    magicNumber: {
        type: Number,
        default: 0 // Default value if not provided
    }
});

const MagicNumber = mongoose.model('MagicNumber', magicNumberSchema);

// Endpoint to update magic number for a specific user
app.post('/updateMagicNumber/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { magicNumber } = req.body;

    try {
		console.log("magicNumber in js: ", magicNumber);
        let existingMagicNumber = await MagicNumber.findOne({ userId });

        if (!existingMagicNumber) {
            // If the document doesn't exist, create a new one
            existingMagicNumber = new MagicNumber({
                userId,
                magicNumber: magicNumber || 0
            });
        } else {
			console.log("ELO AQUI: ",existingMagicNumber);
            // If the document exists, update its magicNumber field
            existingMagicNumber.magicNumber = magicNumber;
			console.log("after modification: ", existingMagicNumber.magicNumber);
        }

        // Save the updated or new MagicNumber document to the database
        await existingMagicNumber.save();

        console.log("Magic number updated successfully");

        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error('Error updating magic number:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to retrieve magic number for a specific user
app.get('/getMagicNumber/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Use await to wait for the Promise returned by MagicNumber.findOne()
        const magicNumberDoc = await MagicNumber.findOne({ userId });

        if (magicNumberDoc) {
            res.json({ magicNumber: magicNumberDoc.magicNumber });
        } else {
            // Return magicNumber as 0 if not found
            res.json({ magicNumber: 0 });
        }
    } catch (error) {
        console.error('Error retrieving magic number:', error);
        res.status(500).send('Error retrieving magic number');
    }
});

*/

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

// Create HTTP server.
const server = http.createServer(app);

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Normalize a port into a number, string, or false.
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

// Event listener for HTTP server "error" event.
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Event listener for HTTP server "listening" event.
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('App started. Listening on ' + bind);
}
