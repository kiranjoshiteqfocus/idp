const { MongoClient } = require("mongodb");
const  express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const uri = "mongodb+srv://kiranjoshi:v51n8BEu1PwchVVc@cluster0.xtnuwk8.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);
const app = express();
app.use(express.json());
app.use(cors());

const database = client.db('sample_dashboard');
let refreshTokens = [];

const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email, isAdmin: user.isAdmin }, "mySecretKey", {
      expiresIn: "120m",
    });
  };
  
  const generateRefreshToken = (user) => {
    return jwt.sign({ email: user.email, isAdmin: user.isAdmin }, "myRefreshSecretKey");
  };

  const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
  
      jwt.verify(token, "mySecretKey", (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json("You are not authenticated!");
    }
  };


  app.post("/refresh", (req, res) => {
    //take the refresh token from the user
    const refreshToken = req.body.token;
    //return res.json(refreshTokens);
    //send error if there is no token or it's invalid
    if (!refreshToken) return res.status(401).json("You are not authenticated!");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid!");
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
      err && console.log(err);
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
  
      refreshTokens.push(newRefreshToken);
  
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    });
  
    //if everything is ok, create new access token, refresh token and send to user
  });


app.get('/projectcards', verify, async (req, res) => {
    const dash = database.collection('dash_data');
    const query = {ids: 1};
    const data = await dash.findOne(query);
    return res.json(data);
})

app.post('/registration', async (req, res) => {
    const dash = database.collection('users');

    const query = {email: req.body.email};
    const result = await dash.findOne(query);
    
    if(result){return res.json({status:500,message:"User exist, try with another email."})}
    
    const document = {username:req.body.username, email:req.body.email, password:req.body.password, isAdmin:false};
    const data = await dash.insertOne(document);
    return res.json({status:200,message:"Success"});
})

app.post('/login', async (req, res) => {
    const dash = database.collection('users');

    const query = {email: req.body.email, password: req.body.password};
    const user = await dash.findOne(query);
    
    if(user){
        //return res.json({status:true, username:result.username, email:result.email})
        //Generate an access token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.json({
        status:200,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        accessToken,
        refreshToken,
        });
    }
    
    return res.json({status:403, message:"Login failed"});
})


app.post("/logout", verify, (req, res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    res.status(200).json("You logged out successfully.");
  });

app.get("/test", (req, res) => {
    res.json("success");
})

app.listen(8800, async ()=>{
    console.log("backend connected")
})
