const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//following: ???
//const User = require('./models/User');


/*const mongoDBUrl = "mongodb://localhost:27017/mydatabase";*/
const connectionString = 'mongodb+srv://yurio:123321@cluster0.ib2xfys.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas', err));

// set cloudinary
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'hjmvdevai',
  api_key: '966266419577723',
  api_secret: 'N_ZV1Xgg5anHDZGAdCzSKxhEWpc'
});
const multer = require('multer');
const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage: storage });



const cors = require('cors');



const jwt = require("jsonwebtoken");
const md5 = require("md5");
const redis = require("redis");

const app = express();
/*const port = 5001;*/
const port = process.env.PORT || 5001;

const salt = "somesalt";
app.use(cors());


// Create a Redis client
/*const client = redis.createClient({
  url: 'redis://localhost:6379' // Default Redis server URL
});*/
const client = redis.createClient({
  url: process.env.REDISCLOUD_URL,
  no_ready_check: true
});


/*const client = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});*/
// Connect to the Redis server
/*client.connect();*/
client.on('error', (err) => console.log('Redis Client Error', err));

client.connect().then(() => console.log("Connected to Redis"));




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});*/
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}




/*mongoose
  .connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });*/

// User model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: false
  },
  // 这里开始把followers变成引用类型了
  /*following: {
    type: Array,
    required: false,
  },*/
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  headline: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  zipcode:{
    type: String,
    required: false,
  },
  //third part 认证
  authProvider:{
    type: String,
    required: false,
  },
  authId:{
    type: String,
    required: false,
  }
});

const User = mongoose.model("User", userSchema);

// avatar? why image? it is 自定义？
app.post("/register",upload.single('avatar'), async (req, res) => {
  console.log("Register endpoint hit"); // Log when endpoint is hit
  console.log("Request Body:", req.body); // Log the request body
  try {
    const { username, email, password } = req.body;
    let profilePictureUrl = '';

    /*if (!req.file) {
      return res.status(400).send('No image file uploaded.');
    }*/

    // Check if there's an avatar file in the request
    if (req.file) {
      // Upload the avatar file to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(req.file.buffer);
      });

      profilePictureUrl = uploadResult.secure_url;
      console.log("Avatar image uploaded:", profilePictureUrl);
    }else{
      console.log("No avatar image provided, proceeding without it.");
    }


    // Hash and salt the password
    const hashedPassword = md5(password + salt);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      profilePicture: profilePictureUrl
    });

    // Save the user to the database
    await newUser.save();

    res.status(200).json({ code: "success", message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", error: error });
  }
});

//third part login
app.post('/auth/google', async (req, res) =>{
  const { email, username, profilePicture, authProvider, authId, password } = req.body;

  try {
    // Check if user already exists in your database, authId is nuique
    let user = await User.findOne({ authId });

    if (!user) {
      //console.log("hint third part login backend user");
      // Create a new user if doesn't exist
      user = new User({
        username,
        email,
        password,
        profilePicture,
        authProvider,
        authId,
        //password 是require的，这里记住，可能后续需要修改
        // Add any additional fields you require
      });
      await user.save();
    }
    // Create a token or session for the user
    const token = jwt.sign(
        { userId: user._id, email: user.email },
        'YOUR_SECRET_KEY', // Replace with your secret key
        { expiresIn: '1h' } // Token expiry time
    );
// Respond with user data and token
    /*res.status(200).json({
      code: "success",
      message: "success",
      data: {
        username: fullUser.username,
        userId: fullUser._id,
        following: fullUser.following,
        sessionId: token, // Include the session ID in the response
      },
    });*/
    res.status(200).json({
      code: "success",
      message: "Authentication successful",
      data: {
        username: user.username,
        userId: user._id,
        following: user.following,
        sessionId: token, // Include the session ID in the response
      },
    });
  } catch (error) {
    res.status(500).json({ code: "error", message: "An error occurred", error: error.message });
  }


})

//ricebook link third party login
app.post('/link-google',async (req, res) =>{
  try{
    console.log("hint link2");
    const { email, authId, authProvider } = req.body;
    console.log(email);
    const existingUserThird = await User.findOne({ email: email, authProvider: { $exists: true } });
    //console.log("existingUser?",existingUser);
    const existingUser = await User.findOne({ email: email, authProvider: { $exists: false } });

    if(existingUserThird){
      console.log("hint existingUser 3p");
      if(existingUser){
        console.log("hint existingUser");
        const following = existingUserThird.following;
        console.log("看看是不是获取");
        // Delete any user with the same email and an authProvider 这里要最后删，因为没有拿到follow信息，这个follow信息是库里的
        await User.deleteOne({ email: email, authProvider: { $exists: true } });

        // Update the existing user with authProvider and authId
        existingUser.authProvider = authProvider;
        existingUser.authId = authId;

        // Merge following arrays
        existingUser.following = Array.from(new Set([...existingUser.following, ...following]));
        await existingUser.save();

        res.status(200).json({
          code: "success",
          message: "Google account linked successfully (already have the thrid party version)",
          data: existingUser
          //先试试这样行吗，没有加token

        });
      }else{
        res.status(404).send("Cannot be merged repeatedly");
      }

    }else {
      console.log("hint create a new!");
      existingUser.authProvider = authProvider;
      existingUser.authId = authId;
      await existingUser.save();

      res.status(200).json({
        code: "success",
        message: "Google account linked successfully (don't have the thrid party version)",
        data: existingUser
        //先试试这样行吗，没有加token

      });

    }

  }catch (error) {
    console.error("Linking error:", error);
    res.status(500).send('Internal server error');
  }

});

//third part link ricebook
app.post('/link-ricebook',async (req, res) =>{
  try{
    console.log("hint link1");
    const { email, authId, authProvider, following } = req.body;
    console.log(email);
    const existingUser = await User.findOne({ email: email, authProvider: { $exists: false } });
    //console.log("existingUser?",existingUser);

    if(existingUser){
      //console.log("hint existingUser");
      // Delete any user with the same email and an authProvider
      await User.deleteOne({ email: email, authProvider: { $exists: true } });

      // Update the existing user with authProvider and authId
      existingUser.authProvider = authProvider;
      existingUser.authId = authId;

      // Merge following arrays
      existingUser.following = Array.from(new Set([...existingUser.following, ...following]));
      await existingUser.save();

      res.status(200).json({
        message: "Google account linked successfully",
        data: existingUser
        //先试试这样行吗，没有加token

      });

    }else {
      res.status(404).json({ message: "User with the provided email not found in the system" });
    }

  }catch (error) {
    console.error("Linking error:", error);
    res.status(500).send('Internal server error');
  }

});

//unlink
app.post('/unlink', async ( req, res) => {
  const { authId } = req.body;
  console.log(authId);
  try {
    // Find the user by ID
    const user = await User.findOne({ authId: authId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Unlink the Google account
    user.authId = undefined; // Remove the authId
    user.authProvider = undefined; // Remove the authProvider

    await user.save(); // Save the updated user document

    res.status(200).json({ message: "Google account unlinked successfully" });
  } catch (error) {
    console.error("Unlinking error:", error);
    res.status(500).json({ message: "Internal server error while unlinking account" });
  }

});


//转换图片文件为url的API代码：
// Endpoint to upload an image and return its URL
app.post('/upload-image', upload.single('image'), async (req, res) => {
  console.log("hint image upload");
  if (!req.file) {
    return res.status(400).send('No image file uploaded.');
  }

  try {
    const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Error uploading to Cloudinary' });
      }
      res.status(200).json({ url: result.secure_url });
    });

    // Stream the file upload to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post("/login", async (req, res) => {
  console.log("Login endpoint hit");
  console.log("Login Request Body:", req.body);

  // Add code to handle user sign in
  const email = req.body.email;
  const password = req.body.password;
  // Hash and salt the password
  const hashedPassword = md5(password + salt);

  User.findOne({ email: email })
    .then(async (user) => {
      if (!user) {
        console.log("User not found for email:", email);
        res.status(200).json({ code: "error", message: "User not found" });
      } else {
        if (user.password === hashedPassword) {
          // Generate a session ID (token)
          console.log("Successful login for user:", email);

          const token = jwt.sign({ userId: user._id }, "secretKey");

          // Cache the session ID in Redis
          client.set(token, JSON.stringify(user));

          // Fetch the full user document including the following array
          const fullUser = await User.findById(user._id).populate('following', 'username profilePicture');


          console.log(user);

          res.status(200).json({
            code: "success",
            message: "success",
            data: {
              username: fullUser.username,
              userId: fullUser._id,
              following: fullUser.following,
              sessionId: token, // Include the session ID in the response
            },
          });
        } else {
          console.log("Incorrect password for user:", email);
          res
            .status(200)
            .json({ code: "error", message: "Incorrect password" });
        }
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      res.status(200).json({ code: "error", error: error });
    });
});



app.post("/logout", (req, res) => {
  validateSessionId(req, res, () => {
    const sessionId = req.cookies.sessionId;
    // Delete the session ID from Redis
    client.del(sessionId, (err, reply) => {
      if (err) {
        res.status(500).json({ code: "error", message: "Failed to delete session" });
      } else {
        res.status(200).json({ code: "success", message: "Session deleted successfully" });
      }
    });
  });
});

app.put("/password", (req, res) => {
  validateSessionId(req, res, () => {
    // TODO: Implement the logic to update the user's password

    res.status(200).json({ code: "success", message: "Password updated successfully" });
  });
});


//好像没用到这个，人家从localstorage拿的
//而且通过id拿email之前是不是已经实现过了。。。
app.get("/email/:user?", (req, res) => {
  //validateSessionId(req, res, () => {
    const { user } = req.params;
    const userId = req.params.user;
    // TODO: Implement the logic to retrieve the email of the user



    res.status(200).json({ code: "success", message: "Email retrieved successfully" });
  //});
});

// userId in link => email json in body tomodify
app.put("/email/:user", async (req, res) => {
  //validateSessionId(req, res, () => {
    // TODO: Implement the logic to update the user's email
  const userId = req.params.user;
  const newEmail = req.body.email;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({code: "error", message: "User not found"});
    }
    // 查找当前数据库里是否有相同的email，如果有，则返回错误，显示当前用户已经存在，如果没有相同的email，则替换现在id的数据库里的email
    // Check if the new email is already taken by another user
    const emailExists = await User.findOne({ email: newEmail });
    if (emailExists) {
      return res.status(400).json({ code: "error", message: "Email already in use" });
    }
    // Update the user's email
    user.email = newEmail;

    await user.save();
    res.status(200).json({code: "success", message: "Email updated successfully"});
    //});
  } catch(error){
    res.status(500).json( { code:"error", message: "Error Update Email"});
  }

});

//决定写个一次性更新的
app.put('/users/:userId', async (req, res) => {
  console.log("modifty all hint");
  try {
    const userId = req.params.userId;
    //check email and username uniqueness
    const { email, username, password } = req.body;
    // Check if the email already exists (excluding the current user)
    const emailExists = await User.findOne({ email: email, _id: { $ne: userId } });
    if (emailExists) {
      return res.status(409).json({ message: "Email already in use by another account" });
    }

    // Check if the username already exists (excluding the current user)
    const usernameExists = await User.findOne({ username: username, _id: { $ne: userId } });
    if (usernameExists) {
      return res.status(409).json({ message: "Username already taken by another account" });
    }


    const updates = req.body; // Contains the fields to update
    console.log("看看updates是什么结构？",updates);

    // Find user by ID and update with the provided data
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedNewPassword = md5(password + salt);

    // Update the user's password
    updatedUser.password = hashedNewPassword;
    await updatedUser.save();

    // Respond with the updated user data
    // 这里应该展开来然后再写
    //console.log("这是什么？",updatedUser);
    //res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



app.get("/following/:user?", async (req, res) => {

  const userId = req.params.user;
  try {
    const user = await User.findById(userId);
    const following = await User.find({ '_id': { $in: user.following }});
    res.status(200).json({ code: "success", message: "Following list retrieved successfully", following });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Error retrieving following list" });
  }

});

// from email to find id : email - > id
app.get("/users", async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ code: "error", message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email }).select('_id username email profilePicture');
    if (!user) {
      res.status(404).json({ code: "error", message: "User not found" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ code: "error", message: "Internal server error", error: error.message });
  }
});

// from id to id.all
app.get('/users/:userId', async (req, res) => {
  try {
    console.log("hit user search all");
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});




//:user是id？
app.put("/following/:user", async (req, res) => {
  const userId = req.params.user;
  const followUserId = req.body.followUserId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ code: "error", message: "User not found" });
    }

    // Add followUserId to the following array if it's not already there
    if (!user.following.includes(followUserId)) {
      user.following.push(followUserId);
    }

    // Save the updated user
    await user.save();
    res.status(200).json({ code: "success", message: "Following list updated successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Error updating following list" });
  }


});

app.delete("/following/:user", async (req, res) => {
  const userId = req.params.user;
  const unfollowUserId = req.body.unfollowUserId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ code: "error", message: "User not found" });
    }

    // Remove unfollowUserId from the following array
    const index = user.following.indexOf(unfollowUserId);
    if (index > -1) {
      user.following.splice(index, 1);
    }

    // Save the updated user
    await user.save();
    res.status(200).json({ code: "success", message: "User removed from following list successfully" });
  } catch (error) {
    res.status(500).json({ code: "error", message: "Error removing user from following list" });
  }

});


app.get("/headline/:user", (req, res) => {
  validateSessionId(req, res, () => {
    const user = req.params.user;
    User.findOne({ username: user })
      .then((foundUser) => {
        if (!foundUser) {
          res.status(404).json({ code: "error", message: "User not found" });
        } else {
          const headline = foundUser.headline;
          res.status(200).json({
            code: "success",
            data: {
              headline
            }
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ code: "error", error: error });
      });
  });
});
app.put("/headline", (req, res) => {
  //validateSessionId(req, res, () => {
    const { username, headline } = req.body;
    User.findOneAndUpdate(
      { username: username },
      { headline: headline },
      { new: true }
    )
      .then((updatedUser) => {
        if (!updatedUser) {
          console.log("hit there 404")
          res.status(404).json({ code: "error", message: "User not found" });
        } else {
          res.status(200).json({ code: "success", message: "Headline updated successfully" });
        }
      })
      .catch((error) => {
        res.status(500).json({ code: "error", error: error });
      });
  //});
});

// Profile model
const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  zipcode: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
});

const Profile = mongoose.model("Profile", profileSchema);


app.get("/zipcode/:user?", (req, res) => {
  validateSessionId(req, res, () => {
    const { user } = req.params;
    // TODO: Implement the logic to retrieve the zipcode of the user

    res.status(200).json({ code: "success", message: "Zipcode retrieved successfully" });
  });
});

app.put("/zipcode", (req, res) => {
  validateSessionId(req, res, () => {
    // TODO: Implement the logic to update the user's zipcode

    res.status(200).json({ code: "success", message: "Zipcode updated successfully" });
  });
});

app.get("/avatar/:user?", (req, res) => {
  validateSessionId(req, res, () => {
    const { user } = req.params;
    // TODO: Implement the logic to retrieve the avatar of the user

    res.status(200).json({ code: "success", message: "Avatar retrieved successfully" });
  });
});

app.put("/avatar", (req, res) => {
  validateSessionId(req, res, () => {
    // TODO: Implement the logic to update the user's avatar

    res.status(200).json({ code: "success", message: "Avatar updated successfully" });
  });
});
app.get("/phone/:user?", (req, res) => {
  validateSessionId(req, res, () => {
    const { user } = req.params;
    // TODO: Implement the logic to retrieve the phone number of the user

    res.status(200).json({ code: "success", message: "Phone number retrieved successfully" });
  });
});

app.put("/phone", (req, res) => {
  validateSessionId(req, res, () => {
    // TODO: Implement the logic to update the user's phone number

    res.status(200).json({ code: "success", message: "Phone number updated successfully" });
  });
});


app.get("/dob", (req, res) => {
  validateSessionId(req, res, () => {
    // TODO: Implement the logic to retrieve the date of birth of the user

    res.status(200).json({ code: "success", message: "Date of birth retrieved successfully" });
  });
});

// Article model
const articleSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  like: {
    type: Number,
    required: false,
  },
  comment: {
    type: Number,
    required: false,
  },
});

const Article = mongoose.model("Article", articleSchema);

//根据username返回这个user的文章集合
//success
app.get("/articles", async (req, res) => {
  console.log("articles endpoint hit");
  //要用http://localhost:5001/articles?username=123这个地址
  try {
    const username = req.query.username; // Accessing username from query parameters
    if (!username) {
      return res.status(400).json({ code: "error", message: "Username is required" });
    }

    // Query the database for articles associated with the specified username
    const articles = await Article.find({ username: username }).select('body photo date like comment');
    console.log("articles:", articles);

    res.status(200).json({ code: "success", articles });
  } catch (error) {
    res.status(500).json({ code: "error", error: error.message });
  }
});

//success 传json数据进去，返回当前user下所有的post
app.post("/article", async (req, res) => {
  //validateSessionId(req, res, async () => {
    console.log("article post hit");
    console.log("reqiswhat:",req);
    try {
      //const userId = req.user._id; //不知道这个能不能查到
      const { username, body, photo, date, like, comment } = req.body;
      console.log("request body:", req.body)

      // Create a new article
      const newArticle = new Article({
        username,
        body,
        photo,
        date,
        like,
        comment,
      });

      // Save the new article to the database
      await newArticle.save();

      // Query the database for articles associated with the user, including the newly added article
      const articles = await Article.find({ username });

      res.status(200).json({ code: "success", articles });
    } catch (error) {
      res.status(500).json({ code: "error", error: error.message });
    }
  //});
});

app.get("/articles/:id?", async (req, res) => {
  //validateSessionId(req, res, async () => {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      let query = { userId };
      if (id) {
        query._id = id;
      }

      // Query the database for articles based on the query
      const articles = await Article.find(query);

      res.status(200).json({ code: "success", articles });
    } catch (error) {
      res.status(500).json({ code: "error", error: error.message });
    }
  //});
});

app.put("/articles/:id", (req, res) => {
  //validateSessionId(req, res, () => {
    const { id } = req.params;
    // TODO: Implement the logic to update the article with the given id

    res.status(200).json({ code: "success", message: "Article updated successfully" });
  //});
});

// Article Comment model
const commentSchema = new mongoose.Schema({
  articleId:{
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Comment = mongoose.model("Comment", commentSchema);
//获取评论 Get Comment
/*app.get('/comments', async (req, res) => {
  const { articleId } = req.query;
  try {
    //这里有个bug，可能comment有很多，咋整？
    //获取一个follow，他可能有很多post好像
    const comments = await Comment.find({ articleId });
    //const comments = await Comment.find({ articleId }).populate('user', 'username avatar');
    //好像是返回username啥的？

    res.json(comments);
  } catch (err) {
    res.status(500).send(err);
  }
});*/
//sucees
app.get('/comments', async (req, res) => {
  try {
    console.log("get comment hit");
    const articleId = req.query.articleId; // Retrieve postId from query parameters

    if (!articleId) {
      return res.status(400).json({ message: 'articleId is required' });
    }

    // Assuming your Comment model has a 'postId' field that references the Post model
    const comments = await Comment.find({ articleId: articleId });

    res.json(comments); // Send the comments as a response
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//发表评论 Post Comment success
app.post('/comments', async (req, res) => {
  const { articleId, username, body, date } = req.body;
  try {
    const comment = new Comment({ articleId, username, body, date });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).send(err);
  }
});


//Global function to validate the sesionId when request .
function validateSessionId(req, res, callback) {

  //console.log("req header:",req.headers);
  console.log("req cookies",req.cookie);
  console.log("seesionDi",req.cookie.sessionId);
  if (!req.cookies || !req.cookies.sessionId) {
    res.status(401).json({ code: "error", message: "Unauthorized" });
  } else {
    try {
      client.get(req.cookies.sessionId, (err, reply) => {
        if (err) {
          res.status(500).json({ code: "error", message: "Failed to retrieve session" });
        } else if (!reply) {
          res.status(401).json({ code: "error", message: "Unauthorized" });
        } else {
          callback();
        }
      });
    } catch (error) {
      console.log(error)
    }

  }
}

module.exports = app;