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
	            const { wrong, right } = keyStatsData[key];

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
	                existingKeyStats.right = right + existingKeyStats.right;
	                existingKeyStats.wrong = wrong + existingKeyStats.wrong;
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


const jwt = require('jsonwebtoken');

// Update login route to generate and send token
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      // Generate token
      const token = jwt.sign({ userId: user._id }, '777', { expiresIn: '1h' });
      // Send token along with other user info
      res.status(200).json({ message: "Login successful.", userId: user._id, role: user.role, token });
    } else {
      res.status(401).send("Invalid username or password.");
    }
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).send("Error logging in.");
  }
});

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




function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers['authorization'];
  if (!authorizationHeader) {
    return res.status(401).send("Unauthorized: Missing Authorization header");
  }

  // Check if the token starts with "Bearer "
  if (!authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).send("Unauthorized: Invalid token format");
  }

  // Extract the token (excluding the "Bearer " keyword)
  const token = authorizationHeader.slice(7);

  // Verify if the token has the correct JWT format
  const parts = token.split('.');
  if (parts.length !== 3) {
    return res.status(401).send("Unauthorized: Invalid token format");
  }

  jwt.verify(token, '777', async (err, decodedToken) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).send("Invalid token");
    }

    // Fetch user data from your database based on decodedToken.userId
    try {
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // If the user exists, attach user information to the request object
      req.user = {
        userId: user._id,
        username: user.username, // Get the username from the user schema
        // Other user properties...
      };

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Internal Server Error');
    }
  });
}

// Use the authenticateToken middleware for routes that require authentication
app.get('/protected-route', authenticateToken, (req, res) => {
  // Only authenticated users can access this route
	console.log(req.user.userId);
	console.log(req.user.username);
  res.json({ message: "Access granted", userId: req.user.userId, username: req.user.username });
});

// Route for logout
app.post('/logout', (req, res) => {
  // No action required on the server side for token-based logout
  res.status(200).send("Logged out successfully.");
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

// Replace 'YOUR_CLIENT_ID' and 'YOUR_CLIENT_SECRET' with your actual Spotify client ID and secret
const CLIENT_ID = '6a67892f6508441eb817a7eb18b06037';
const CLIENT_SECRET = '263ed6d745084ad8b88f5bed52757232';
const REDIRECT_URI = 'https://my-app.adaptable.app/callback'; // Redirect URI registered with Spotify //tonicfinder6.adaptable.app

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route for initiating Spotify authentication
app.get('/spo/login', (req, res) => {
	const scopes = 'user-read-playback-state user-modify-playback-state streaming';
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(scopes)}`);
});

// Route for logging out
app.get('/logout', (req, res) => {
    // Clear tokens from session or database
    delete req.session.accessToken;
    delete req.session.refreshToken;

    // Destroy the session (if using sessions)
    req.session.destroy(() => {
        // Redirect to home page or login page
        res.redirect('/');
    });
});

// Callback route after Spotify authentication
app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.status(400).send('Code not found');
        return;
    }
	
	//// GETTING THE TOKEN REFRESH INSTEAD OF A FUNCTION CHECK //

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': REDIRECT_URI
            })
        });
		const tokenData = await tokenResponse.json();

		        // Fetching user information (including username) from Spotify API
		        const userInfoResponse = await fetch('https://api.spotify.com/v1/me', {
		            method: 'GET',
		            headers: {
		                'Authorization': `Bearer ${tokenData.access_token}`
		            }
		        });
		        const userInfoData = await userInfoResponse.json();
		        const spotifyUsername = userInfoData.id;

		        // Serialize tokenData and spotifyUsername into a JSON string
		        const responseData = {
		            tokenData: tokenData,
		            spotifyUsername: spotifyUsername
		        };
		        const responseDataJson = JSON.stringify(responseData);
				

        // Redirect the user back to /index.html with responseDataJson as a query parameter
        res.redirect(`/index.html?responseData=${encodeURIComponent(responseDataJson)}&fromCallback=true`);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// New route for fetching playlists
app.get('/api/playlists', async (req, res) => {
    const accessToken = req.query.access_token;
    if (!accessToken) {
        res.status(400).send('Access token not found');
        return;
    }

    try {
        // Make a request to fetch user's playlists
        const playlistsResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        if (playlistsResponse.ok) {
            const playlistsData = await playlistsResponse.json();
            res.json(playlistsData);
        } else {
            res.status(playlistsResponse.status).send('Failed to fetch playlists');
        }
    } catch (error) {
        console.error('Error fetching playlists:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Route definition
app.get('/spotify/track/:trackId', async (req, res) => {
    try {
        const trackId = req.params.trackId;
        const accessToken = req.query.access_token; // Extracting token from query parameter
        
        // Making request to Spotify API
        const url = `https://spclient.wg.spotify.com/metadata/4/track/${trackId}?market=from_token`;
        
        // Making GET request using fetch
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Failed to fetch data from Spotify API');
        }

        const data = await response.json();

        // Sending back the data received from Spotify API
        res.json(data);
        
    } catch (error) {
        // Handling errors
        console.error('Error:', error); // Log the error for debugging purposes
        res.status(500).json({ error: 'Internal Server Error', message: error.message }); // Send back detailed error message
    }
});

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
