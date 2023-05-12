const express = require("express");
const app = express();
require('dotenv').config();
const { connect } = require("mongoose");
const mongoose = require("mongoose");
const { urlencoded, json } = require("body-parser");
const models = require("./job.model");
const bodyParser = require("body-parser");
var cors = require("cors");
const nodemailer = require("nodemailer");
const session = require("express-session");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookiParser = require("cookie-parser");
const authenticate = require("./middleware/authenticate");
const auth = require("./middleware/auth");
const cron = require("node-cron");
const Personal = require("./model/personalSchema");
const Academic = require("./model/academicSchema");
const Publication = require("./model/publicationSchema");
const Reference = require("./model/referenceSchema");
const UserExperience = require("./model/experienceSchema");
const OtherDetail = require("./model/otherDetailSchema");
const POR = require("./model/porSchema");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const excelJs = require("exceljs");
const xl = require("excel4node");
const mime = require("mime");
const path = require("path");
const DB_URL = process.env.MONGO_DB_URL ;
const corsOptions ={
  origin:process.env.REACT_APP_API_KEY, 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(cookiParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/", require(__dirname + "/routes/UserProfile/resumeParser.js"));
app.use("/", require(__dirname + "/routes/UserProfile/personalDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/academicDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/experienceDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/referenceDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/publicationDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/porDetails.js"));
app.use("/", require(__dirname + "/routes/UserProfile/resumeManager.js"));

const keysecret = process.env.JWT_SECRET_KEY;

// databse

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

const Job = models.Job;
const User = models.User;
const UserInstitute = models.UserInstitute;
const Comment = models.Comment;
const CommentNew = models.CommentNew;
const Experience = models.Experience;
const RegisterInstitute = models.RegisterInstitute;
const Admin = models.Admin;
// const RegisterInstitute = models.RegisterInstitute;


let personalSchemaobj = Personal.schema.obj;
let academicSchemaobj = Academic.schema.obj;
let experienceSchemaobj = UserExperience.schema.obj;
let porSchemaobj = POR.schema.obj;
let publicationSchemaobj = Publication.schema.obj;
let referenceSchemaobj = Reference.schema.obj;

delete academicSchemaobj.email;
delete experienceSchemaobj.email;
delete porSchemaobj.email;
delete publicationSchemaobj.email;
delete referenceSchemaobj.email;


const applicationSchema = new mongoose.Schema({
  student_id: String,
  job_id: String,
  status: String,
  student_details: {
    personal: [Object],
    academic: [Object],
    experience: [Object],
    publication: [Object],
    por: [Object],
    reference: [Object]
  },
  application_date:String,
});
const Application = mongoose.model("application", applicationSchema);
// Getting collections from database

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/job-post", (req, res) => {
  console.log("acha :");
  console.log(req.body.job);
  const { job, id } = req.body;
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;
  console.log(job);
  console.log("the job fields are:");
  console.log(job.fields);
  var obj = {};
  obj = job;
  obj.createdAt=today;
  obj.institute_id = id;
  console.log(obj);
  const postJob = new Job(obj);
  postJob.save((err) => {
    if (err) {
      res.status(500).send({ status: 500, err });
    } else {
      res.status(201).send({ status: 200 });
    }
  });
});

app.get("/getjobs", (req, res) => {
  // console.log("isme aa rha home wale m");
  var email = "";
  var userType = "";
  Job.find({}, (err, jobs) => {
    if (err) {
      res.status(500).send({ status: 500, err });
    } else {
      res.status(200).send({
        status: 200,
        jobDetails: jobs,
      });
    }
  });
});

app.get("/api/job-details/:id/:student_id", async (req, res) => {
  ////console.log(req.userID);
  //console.log("jsgiuf");

  try {
    const { id, student_id } = req.params;
    //console.log(id);
    //console.log(student_id);

    var applied = false;
    var application_id;
    ////console.log(id);
    const application = await Application.findOne({
      job_id: id,
      student_id: student_id,
    });
    if (application) {
      //console.log("sbugfiw");
      applied = true;
      application_id = application._id;
    } else {
      //console.log("sbfoie");
      applied = false;
    }

    const job = await Job.findOne({ _id: id });
    if (job) {
      //console.log("here at job detaisl");
      //console.log(job);
      res.status(200).json({
        status: 200,
        job: job,
        applied: applied,
        application_id: application_id
      });
    }
  } catch (err) {
    res.status(500).json({ status: 500, err });
  }
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

// Send email with OTP to the user's email address
app.post("/api/sendOtp", async (req, res) => {
  const email = req.body.email;
  const userType = req.body.userType;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  console.log(userType);

  let user = await User.findOne({ email });  // finsding user in student
  if (user) {
    console.log("i m hetyfiuwbri");
    console.log(user);
    return res
      .status(200)
      .send({ status: 400, message: "User already exists" });
  }
  else if (!user) { // finding user in institute
    user = await UserInstitute.findOne({ email });
    if (user) {
      return res
        .status(200)
        .send({ status: 400, message: "User already exists" });
    }
  }
  // if (userType == "student") {
  //   // Check if the user already exists
  // } else {
  //   // Check if the user already exists
  //   const user = await UserInstitute.findOne({ email });
  //   if (user) {
  //     return res
  //       .status(200)
  //       .send({ status: 400, message: "User already exists" });
  //   }
  // }

  // req.session.otp = otp;


  const mailOptions = {
    from: "r.patidar181001.2@gmail.com",
    to: email,
    subject: "OTP for login",
    text: `Your OTP is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      //console.log(error);
      return res.status(200).send({
        status: 500,
        message: "Failed to send OTP",
      });
    } else {
      //console.log("OTP sent: " + info.response);
      return res.status(200).send({
        status: 200,
        message: "OTP sent",
        otp: otp
      });
    }
  });
});

// Verify OTP and create new user
app.post("/api/verifyOtp", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const otpEntered = req.body.otp;
  const password = req.body.password;
  // const otp = req.session.otp;
  let otp = req.body.randomotp;

  console.log(otp);
  console.log(otpEntered);

  const hashedPassword = bcrypt.hashSync(password, 1);
  // req.session.hashedPassword = hashedPassword;

  //console.log(req.body);
  console.log("aa gya");
  // console.log(req.session);

  //console.log(req.body.userType);


  // if (otpEntered === -1) {
  //   const userInstitute = new UserInstitute({
  //     name: name,
  //     email: email,
  //     password: hashedPassword,
  //   });
  //   await userInstitute.save();

  //   console.log("institute registered");
  //   return res.status(200).send({
  //     status: 200,
  //     success: true,
  //     message: "OTP verified successfully",
  //   });

  // }

  if (otp === otpEntered) {
    if (req.body.userType === "student") {
      //console.log("student hu vai");
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;

      const personals = new Personal({
        email: email,
        name: name,
        fathername: "-",
        dob: today,
        age: "-",
        category: "-",
        disability: "-",
        married: "-",
        nationality: "-",
        gender: "-",
        category: "General",
        // Communication Details
        communication_address: "-",
        communication_city: "-",
        communication_state: "-",
        communication_pincode: "-",
        profile_image_url : "#",
        permanent_address: "-",
        permanent_city: "-",
        permanent_state: "-",
        permanent_pincode: "-",
        communication_country: "-",
        permanent_country: "-",
        mobile: "-",
        altmobile: "-",
      });
      const academics = new Academic({
        email: email,
        board10: '-',
        percentageformat10: '-',
        percentage10: '-',
        year10: '-',
        remarks10: '-',
        marksheet10: '-',

        board12: '-',
        percentageformat12: '-',
        percentage12: '-',
        year12: '-',
        remarks12: '-',
        marksheet12: '-',

        collegebtech: '-',
        branchbtech: '-',
        percentageformatbtech: '-',
        percentagebtech: '-',
        yearbtech: '-',
        remarksbtech: '-',
        marksheetbtechurl: '-',

        collegemtech: '-',
        branchmtech: '-',
        percentageformatmtech: '-',
        percentagemtech: '-',
        yearmtech: '-',
        remarksmtech: '-',
        marksheetmtech: '-',

        isphdcompleted: '-',
        phdremarks: '-',
      });
      const otherdetails = new OtherDetail({
        email : email,
        resume_url : '#',
      })
      await academics.save();
      await personals.save();
      await user.save();
      await otherdetails.save();

    } else {
      const userInstitute = new UserInstitute({
        name: name,
        email: email,
        password: hashedPassword,
      });
      await userInstitute.save();
    }

    //console.log("bn gya");
    return res.status(200).send({
      status: 200,
      success: true,
      message: "OTP verified successfully",
    });
  } else
    return res.status(200).send({
      status: 400,
      success: false,
      message: "Invalid OTP",
    });
});

app.post("/api/add-institute", async (req, res) => {

  let info = req.body;
  const password = "root";
  const check = await UserInstitute.findOne({
    email: info.email,
  });

  if (check && check.length !== 0) {
    return res.send("2"); /** Email ID already exists */
  }

  const hashedPassword = bcrypt.hashSync(password, 1);

  const userInstitute = new UserInstitute({
    name: info.name,
    email: info.email,
    password: hashedPassword,
  });
  await userInstitute.save();

  console.log("delete hone wala hai");

  await RegisterInstitute.deleteOne({ email: info.email });

  const mailOptions = {
    from: "r.patidar181001.2@gmail.com",
    to: info.email,
    subject: "Registration on PhD Job Platform ",
    text: `You are registered successfully on our Platform. Your default password is 'root' , kindly change it by clicking on forget password`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      //console.log(error);
      return res.status(200).send({
        status: 500,
        message: "Failed to send Mail",
      });
    } else {
      //console.log("OTP sent: " + info.response);
      return res.status(200).send({
        status: 200,
        message: "Mail sent",
      });
    }
  });

});

app.post("/api/login", async (req, res) => {
  //console.log("idhr aa gya");
  const { email, password, userType } = req.body;
  // //console.log(userType);
  if (userType === "student") {
    const userstudent = await User.findOne({
      email: email,
    });
    console.log("login m aa gya");
    console.log(userstudent);
    
    //   //console.log(res.data);
    if (!userstudent){
      return res.status(400).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    const isPasswordValid = bcrypt.compareSync(password, userstudent.password);

    if (!isPasswordValid)
      return res.status(400).send({
        success: false,
        message: "Invalid Email or Password",
      });
    else {
      // token generate

      const token = await userstudent.generateAuthToken();

      //console.log(userstudent);

      // cookiegenerate

      res.cookie("usercookie", token, {
        expires: new Date(Date.now() + 9000000),
        httpOnly: true,
      });

      const result = {
        userstudent,
        token,
      };
      // res.status(201).json({status:201,result})

      // //console.log("Logged in huehue");

      res.status(201).json({ status: 201, result });
      // return res.status(200).send({
      //   success: true,
      //   message: "Logged in successfully",
      //   result : result
      // });
    }
  } else if (userType === "institute") {
    const userInstitute = await UserInstitute.findOne({
      email,
    });

    // //console.log("login m aa gya : institute");
    // //console.log(userInstitute);
    //   //console.log(res.data);
    if (!userInstitute)
      return res.status(400).send({
        success: false,
        message: "Invalid Email or Password",
      });
    const isPasswordValid = bcrypt.compareSync(
      password,
      userInstitute.password
    );

    if (!isPasswordValid)
      return res.status(400).send({
        success: false,
        message: "Invalid Email or Password",
      });
    else {
      // token generate

      const token = await userInstitute.generateAuthToken();

      // //console.log(userInstitute);

      // cookiegenerate

      res.cookie("usercookie", token, {
        expires: new Date(Date.now() + 9000000),
        httpOnly: true,
      });

      const result = {
        userInstitute,
        token,
      };
      // res.status(201).json({status:201,result})

      // //console.log("Logged in huehue");

      res.status(201).json({ status: 201, result });
      // return res.status(200).send({
      //   success: true,
      //   message: "Logged in successfully",
      //   result : result
      // });
    }
  }
  else {
    console.log("admin");
    const useradmin = await Admin.findOne({
      email: email,
    });
    if (!useradmin) {
      return res.status(400).send({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    else {

      if (useradmin.password === password) {
        const token = await useradmin.generateAuthToken();

        res.cookie("usercookie", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
        });
        const result = {
          useradmin,
          token,
        };

        res.status(201).json({ status: 201, result });

      }
    }
  }
});


passport.use(
  new GoogleStrategy(
    {
      clientID: '82066739900-rqo1gjofhmv4lqarkt82sr30nm8383pb.apps.googleusercontent.com', // Replace with your Google client ID
      clientSecret: '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', // Replace with your Google client secret
      callbackURL: '/auth/google/callback', // Replace with your callback URL
    },
    async (accessToken, refreshToken, profile, done) => {
      // Use the profile information to create or authenticate a user in your application
      // You can access the user's information from the profile object
      const { id, displayName, emails } = profile;
      // Example: You can save the user's information in your database and call done() to complete the authentication process
      // Replace this with your actual logic for creating or authenticating a user
      const user = await User.findOne({ googleId: id });
      if (user) {
        return done(null, user);
      } else {
        const newUser = new User({
          googleId: id,
          displayName: displayName,
          email: emails[0].value,
        });
        await newUser.save();
        return done(null, newUser);
      }
    }
  )
);


// Initialize Passport
app.use(passport.initialize());

// Route for starting the Google authentication process
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route for handling the Google authentication callback
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Redirect to the appropriate page after successful authentication
  res.redirect('/dashboard'); // Replace with your appropriate redirect URL
});




// user valid
app.get("/validuser", authenticate, async (req, res) => {
  console.log(req);
  try {
    
    let ValidUserOne = await User.findOne({ _id: req.userId });

    if (ValidUserOne) {
      res.status(201).json({ status: 201, message:"success", ValidUserOne, userType: "student" });
    }
    else if (!ValidUserOne) {
      ValidUserOne = await UserInstitute.findOne({ _id: req.userId });
      if (ValidUserOne) {
        res.status(201).json({ status: 201, message:"success", ValidUserOne, userType: "institute" });
      }
      else
      {
        ValidUserOne = await Admin.findOne({ _id: req.userId });
      res.status(201).json({ status: 201, message:"success", ValidUserOne, userType: "admin" });
      }
    }

    if(!ValidUserOne) 
    {
      res.status(201).json({ status: 201, message:"failed", ValidUserOne, userType: "NA" });
    }
    


    // if (!ValidUserOne) {
    //   ValidUserOne = await UserInstitute.findOne({ _id: req.userId });
    //   if (!ValidUserOne) {
    //     ValidUserOne = await Admin.findOne({ _id: req.userId });
    //     if (ValidUserOne) {
    //       console.log("found admin");
    //       res
    //         .status(201)
    //         .json({ status: 201, ValidUserOne, userType: "admin" });
    //     }

    //   }
    //   if (ValidUserOne) {
    //     res
    //       .status(201)
    //       .json({ status: 201, ValidUserOne, userType: "institute" });
    //   }
    // } else {
    //   res.status(201).json({ status: 201, ValidUserOne, userType: "student" });
    // }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// send email Link For reset Password
app.post("/api/sendpasswordlink", async (req, res) => {
  //console.log(req.body)

  const { email, userType } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: "Enter Your Email" });
  }

  try {
    if (userType == "student") {
      const userfind = await User.findOne({ email: email });

      // token generate for reset password
      const token = jwt.sign({ _id: userfind._id }, keysecret, {
        expiresIn: "120s",
      });

      const setusertoken = await User.findByIdAndUpdate(
        { _id: userfind._id },
        { verifytoken: token },
        { new: true }
      );
      if (setusertoken) {
        const mailOptions = {
          from: "r.patidar181001.2@gmail.com",
          to: email,
          subject: "Sending Email For password Reset",
          text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}/${userType}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            //console.log("error",error);
            res.status(401).json({ status: 401, message: "email not send" });
          } else {
            //console.log("Email sent",info.response);
            res
              .status(201)
              .json({ status: 201, message: "Email sent Succsfully" });
          }
        });
      }
    } else {
      const userfind = await UserInstitute.findOne({ email: email });

      // token generate for reset password
      const token = jwt.sign({ _id: userfind._id }, keysecret, {
        expiresIn: "120s",
      });

      const setusertoken = await UserInstitute.findByIdAndUpdate(
        { _id: userfind._id },
        { verifytoken: token },
        { new: true }
      );
      if (setusertoken) {
        const mailOptions = {
          from: "r.patidar181001.2@gmail.com",
          to: email,
          subject: "Sending Email For password Reset",
          text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}/${userType}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            //console.log("error",error);
            res.status(401).json({ status: 401, message: "email not send" });
          } else {
            //console.log("Email sent",info.response);
            res
              .status(201)
              .json({ status: 201, message: "Email sent Succsfully" });
          }
        });
      }
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: "invalid user" });
  }
});

// verify user for forgot password time
app.get("/forgotpassword/:id/:token/:usertype", async (req, res) => {
  const { id, token, usertype } = req.params;

  //console.log(usertype);
  //console.log("link ke baad ka get pe hu");

  try {
    if (usertype == "student") {
      //console.log("student hu omk ?");

      const validuser = await User.findOne({ _id: id, verifytoken: token });

      const verifyToken = jwt.verify(token, keysecret);

      //console.log(verifyToken)

      if (validuser && verifyToken._id) {
        res.status(201).json({ status: 201, validuser });
      } else {
        res.status(401).json({ status: 401, message: "user not exist" });
      }
    } else {
      const validuser = await UserInstitute.findOne({
        _id: id,
        verifytoken: token,
      });

      const verifyToken = jwt.verify(token, keysecret);

      //console.log(verifyToken)

      if (validuser && verifyToken._id) {
        res.status(201).json({ status: 201, validuser });
      } else {
        res.status(401).json({ status: 401, message: "user not exist" });
      }
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// change password

app.post("/api/:id/:token/:usertype", async (req, res) => {
  const { id, token, usertype } = req.params;

  const { password } = req.body;

  try {
    if (usertype == "student") {
      //console.log("student after password reset");
      const validuser = await User.findOne({ _id: id, verifytoken: token });

      const verifyToken = jwt.verify(token, keysecret);

      if (validuser && verifyToken._id) {
        const newpassword = await bcrypt.hash(password, 1);

        const setnewuserpass = await User.findByIdAndUpdate(
          { _id: id },
          { password: newpassword }
        );

        setnewuserpass.save();
        res.status(201).json({ status: 201, setnewuserpass });
      } else {
        res.status(401).json({ status: 401, message: "user not exist" });
      }
    } else {
      const validuser = await UserInstitute.findOne({
        _id: id,
        verifytoken: token,
      });

      const verifyToken = jwt.verify(token, keysecret);

      if (validuser && verifyToken._id) {
        const newpassword = await bcrypt.hash(password, 1);

        const setnewuserpass = await UserInstitute.findByIdAndUpdate(
          { _id: id },
          { password: newpassword }
        );

        setnewuserpass.save();
        res.status(201).json({ status: 201, setnewuserpass });
      } else {
        res.status(401).json({ status: 401, message: "user not exist" });
      }
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

app.get("/logout", authenticate, async (req, res) => { 
  
  console.log("sjbfouwbgro");
  try {
    req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
      return curelem.token !== req.token; 
    });

    console.log("logout me aa rha");

    res.clearCookie("usercookie", { path: "/" });

    req.rootUser.save();

    

    console.log("save ho rha");
    // console.log(rootUser);

    res.status(201).json({ status: 201, message : "success" });
  } catch (error) {
    res.status(401).json({status:401,message : "failed",error})
  }
});

app.post("/apply", async (req, res) => {
  //console.log("here at apply");
  const id = req.body.id;
  const student_id = req.body.student_id;

  const newApplication = new Application({
    student_id: student_id,
    job_id: id,
    status: "Pending",
  });
  const success = await newApplication.save();
  if (success) {
    res.status(200).send({ status: 200 });
  } else {
    res.status(500).send({ status: 500 });
  }
});

app.get("/api/jobStatus/:id", async (req, res) => {
  const { id } = req.params;
  ////console.log("here at job status");
  try {
    const student_applications = await Application.find({ student_id: id });
    //console.log(student_applications);
    Promise.all(
      student_applications.map(async (application) => {
        const job = await Job.findOne({ _id: application.job_id });
        let obj = {};
        obj.job_id = await job._id;
        obj.title = await job.title;
        obj.college = await job.college;
        obj.location = await job.location;
        obj.salary = await job.salary;
        obj.application_status = await application.status;
        obj.deleted = await job.deleted;
        obj.application_id = await application._id;
        obj.application_date=await application.application_date;
        return obj;
      })
    ).then((applicationArray) => {
      res.status(200).send({ status: 200, applicationArray });
    });
  } catch (error) {
    //console.log(error);
    res.status(500).send({ status: 500, err });
  }
});

app.get("/jobPostings/:id", async (req, res) => {
  ////console.log("here at job postings");
  try {
    const { id } = req.params;
    const jobs = await Job.find({ institute_id: id });
    Promise.all(
      jobs.map(async (job) => {
        let obj = {};
        console.log("the last update date is");
        console.log(job.lastUpdateDate);
        obj.title = await job.title;
        obj._id = await job._id;
        obj.createdAt = await job.createdAt;
        obj.deleted = await job.deleted;
        obj.updatedAt=await job.lastUpdateDate;
        return obj;
      })
    ).then((jobArray) => {
      res.status(200).send({ status: 200, jobArray });
    });
  } catch (error) {
    //console.log(error);
    res.status(500).send({ status: 500, err });
  }
});

app.get("/jobApplicants/:id", async (req, res) => {
  ////console.log("here at job applicants");
  try {
    //console.log("yolo");
    const { id } = req.params;
    //console.log(id);
    const applications = await Application.find({ job_id: id });
    //console.log(applications);
    Promise.all(
      applications.map(async (application) => {
        const student = await User.findOne({ _id: application.student_id });
        //const job=await Job.findOne({_id:id});
        let obj = {};
        if (student) {
          obj.application_id = await application._id;
          obj.student_name = await application.student_details.personal[0].name;
          obj.student_email = await application.student_details.personal[0].email;
          obj.student_id = await student._id;
          obj.status = await application.status;
          obj.student = await application.student_details;
          obj.application_date=await application.application_date;
        }
        return obj;
      })
    ).then((applicantArray) => {
      res.status(200).send({ status: 200, applicantArray });
    });
  } catch (error) {
    //console.log(error);
    res.status(500).send({ status: 500, error });
  }
});

app.post("/jobApplicantStatusChange", async (req, res) => {
  try {
    const { application_id, newStatus, student_email } = req.body;
    //console.log("here at status change");
    //console.log(application_id);
    //console.log(newStatus);
    const application = await Application.updateOne(
      { _id: application_id },
      { $set: { status: newStatus } }
    );
    console.log(newStatus);
    if (newStatus === "Accepted") {
      // Save the OTP to the user's record in the database
      const mailOptions = {
        from: "r.patidar181001.2@gmail.com",
        to: student_email,
        subject: "Status Change",
        text: `You got some changes in status of job you have applied , please login to our platform for check`,
      };

      console.log("acceptd hai bahi");
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          //console.log(error);
          return res.status(200).send({
            status: 500,
            // message: "Failed to send OTP",
          });
        } else {
          console.log("mail gya");
          //console.log("OTP sent: " + info.response);
          return res.status(200).send({
            status: 200,
            // message: "OTP sent",
            // otp: otp
          });
        }
      });
    }
    res.send("success");
  } catch (err) {
    //console.log(err);
    res.send(err);
  }
});

// getting self email ID

app.get("/api/me", auth, async (req, res) => {
  const { _id } = req.user;
  try {
    let user = await User.findById(_id);
    if (!user) {
      user = await UserInstitute.findById(_id);
      // return res.status(404).json({ error: 'User not found' });
    }
    res.json({ email: user.email });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// getting self name

app.get("/api/mename", auth, async (req, res) => {
  const { _id } = req.user;
  console.log("inside mename");
  try {
    let user = await User.findById(_id);
    if (!user) {
      user = await UserInstitute.findById(_id);
      // return res.status(404).json({ error: 'User not found' });
    }
    console.log(user);
    res.json({ name: user.name });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/subscribe", (req, res) => {
  const { email } = req.body;
  //console.log(email);
  User.findOneAndUpdate(
    { email },
    { subscribedToJobAlerts: true },
    { upsert: true, new: true },
    (error, user) => {
      if (error) res.status(400).send(error);
      else res.status(200).send(user);
    }
  );
});

app.post("/api/unsubscribe", (req, res) => {
  const { email } = req.body;
  // console.log(email);
  User.findOneAndUpdate(
    { email },
    { subscribedToJobAlerts: false },
    { upsert: true, new: true },
    (error, user) => {
      if (error) res.status(400).send(error);
      else res.status(200).send(user);
    }
  );
});

// for subscribtion and email notification

const lastCheckTime = new Date();

function sendJobNotification(job) {
  User.find({ subscribedToJobAlerts: true }).exec((error, users) => {
    if (error) console.error(error);
    else {
      const emailAddresses = users.map((user) => user.email);
      const mailOptions = {
        from: "noreply@example.com",
        to: emailAddresses,
        subject: `New job posted: ${job.title}`,
        text: `A new job has been posted in ${job.location}.`,
        html: `<p>A new job has been posted in ${job.location}.</p>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          //console.error(error);
        } else {
          //console.log('Email sent: ' + info.response);
        }
      });
    }
  });
}

let emailSent = false;

function checkForNewJobs() {
  if (emailSent) return; // stop checking if email has already been sent

  Job.find({ createdAt: { $gt: lastCheckTime } })
    .sort({ createdAt: "desc" })
    .exec((error, jobs) => {
      if (error) console.error(error);
      else {
        if (jobs.length > 0) {
          var i = 0;
          for (i = 0; i < jobs.length; i++) {
            sendJobNotification(jobs[i]);
          }
          emailSent = true; // set emailSent flag to true
        }
      }
    });

  lastCheckTime = new Date(); // update lastCheckTime to current time
}

cron.schedule("* * * * *", checkForNewJobs); // run every minute

app.get("/application-form/:job_id/:user_id", async (req, res) => {
  console.log("right herefyviubriu");
  const { job_id, user_id } = req.params;
  const job = await Job.findOne({ _id: job_id });
  console.log(job);
  const user = await User.findOne({ _id: user_id });
  console.log(user);
  if (job && user) {
    const academic = await Academic.find({ email: user.email });
    const experience = await UserExperience.find({ email: user.email });
    const personal = await Personal.find({ email: user.email });
    const publication = await Publication.find({ email: user.email });
    const por = await POR.find({ email: user.email });
    const reference = await Reference.find({ email: user.email });

    let obj = {};
    if (academic && experience && personal && publication) {
      console.log("brgi");
      obj.personal = personal;
      obj.academic = academic;
      obj.experience = experience;
      obj.publication = publication;
      obj.por = por;
      obj.reference = reference;
      obj.jobFields = job.fields;
      console.log("the job fields are: the second time");
      console.log(obj.jobFields);
      res.json({ status: 200, dataObject: obj });
    } else {
      res.json({ status: 500 });
    }
  } else {
    res.json({ status: 500 });
  }
});

app.post("/application-form/:job_id/:user_id", async (req, res) => {
  console.log("posting at application form");
  const { job_id, user_id } = req.params;
  // const { jobFields } = req.body;
  // console.log("jobfields are:");
  // console.log(jobFields);
  // const obj = {};
  // obj.personal = jobFields.personal;
  // obj.academic = jobFields.academic;
  // obj.experience = jobFields.experience;
  // obj.publication = jobFields.publication;
  // obj.por = jobFields.por;
  // obj.reference = jobFields.reference;
  //
  // console.log("the created obj is");
  // console.log(obj);

  const { dataToSend } = req.body;
  const obj = dataToSend;
  console.log("i got this data from the application form");
  console.log(obj);
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  console.log(today);




  const new_application = new Application({
    student_id: user_id,
    job_id: job_id,
    status: "Pending",
    student_details: obj,
    application_date:today,
  });

  console.log("checking the new application");
  console.log(new_application);
  const saved = await new_application.save();
  if (saved) {
    console.log("done");
    res.send({ status: 200 });
  } else {
    res.send({ status: 500 });
  }
});

app.get("/api/applicant-details/:id", async (req, res) => {
  console.log(Application.schema.obj);
  const { id } = req.params;
  const application = await Application.findOne({ _id: id });
  console.log("here at applicant-details");
  console.log(application);
  if (application) {
    const job_id = application.job_id;
    const job = await Job.findOne({ _id: job_id });
    if (job) {
      console.log(application.student_details);
      let obj = {};
      obj.fields = job.fields;
      obj.student_details = application.student_details;
      obj.institute_id = job.institute_id;
      res.send({ status: 200, details: obj });
    } else {
      res.send({ status: 500 });
    }
  } else {
    res.send({ status: 500 });
  }
});


// POST /api/comments
app.post('/api/comments', async (req, res) => {

  console.log("inside backend after submit");

  const { text, user, jobPosting } = req.body;
  // console.log(text);
  // console.log(user);
  // console.log(jobPosting);
  const comment = new Comment({ text, user, jobPosting });
  // console.log("1");

  try {
    const savedComment = await comment.save();
    // console.log("2");
    res.json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/comments?jobPostingId=<jobPostingId>
app.get('/api/getcomments', async (req, res) => {
  const { jobPostingId } = req.query;
  console.log("3");
  try {
    const comments = await Comment.find({ jobPosting: jobPostingId }).populate('user');
    console.log(comments);
    res.json(comments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all institutes requests
app.get('/api/getrequests', async (req, res) => {
  const requestss = await RegisterInstitute.find();
  res.json(requestss);
});

// get me ID

app.get('/api/meid', auth, async (req, res) => {
  const { _id } = req.user;

  res.json({ _id });

  // try {
  //   let user = await User.findById(_id);
  //   if (!user) {
  //     user = await UserInstitute.findById(_id);
  //     // return res.status(404).json({ error: 'User not found' });
  //   }
  //   res.json({ email: user.email });
  // } catch (error) {
  //   //console.error(error);
  //   res.status(500).json({ error: 'Server error' });
  // }
});

// Get all experiences
app.get('/api/getexperiences', async (req, res) => {
  const experiences = await Experience.find();
  res.json(experiences);
});

// Get all subscription status
app.get('/api/getexperiences', async (req, res) => {
  const experiences = await Experience.find();
  res.json(experiences);
});

app.get('/api/getsubscriptionstatus', auth, async (req, res) => {

  const { _id } = req.user;
  console.log()
  const email = "";

  try {
    let user = await User.findById(_id);
    if (!user) {
      user = await UserInstitute.findById(_id);
      // return res.status(404).json({ error: 'User not found' });
      email = user.email;
      try {
        // Get the email address from the query parameters
        // const { email } = req.body;

        // Find the user by email address
        const user = await User.findOne({ email });

        // If the user doesn't exist, return an error response
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // Otherwise, return the subscribedToJobAlerts value
        return res.json({ subscribedToJobAlerts: user.subscribedToJobAlerts });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// Create a new experience
app.post('/api/createExperiences', async (req, res) => {
  // console.log(req.body);
  const experience = new Experience(req.body);
  await experience.save();
  res.json(experience);
});

// get photo for experience section

app.post('/api/getimage', async (req, res) => {
  // console.log(req.body);
  const email = req.body.email;
  console.log(req.body);
  console.log(email);

  if(!req.body)
  {
    return res.json({ status:200 , image :  "#" });
  }
  else
  {

    let user = await Personal.findOne({ email : email });

    // console.log(user);
    // console.log(user.profile_image_url);

    let imagesrc = "#";

    if(user.profile_image_url)
    {
      imagesrc = user.profile_image_url;
    }

    return res.json({ status:200 , image :  imagesrc });
  }


});

// Add a comment to an experience
app.post("/api/addcomments/:id", async (req, res) => {
  // console.log("inside api");
  // console.log(req.body);
  console.log("add comments");
  const experience = await Experience.findById(req.params.id);
  const commentnew = new CommentNew({
    experience: experience._id,
    comment: req.body.comment,
    user: req.body.email, // assuming user's email is sent in the request body
  });
  await commentnew.save();
  experience.comments.push(commentnew);
  await experience.save();

  console.log("all done");

  res.json({
    comment: commentnew.comment,
    user: commentnew.user,
    createdAt: commentnew.createdAt,
  });
});


// Update an experience
app.put('/api/experiences/:id', async (req, res) => {
  console.log(" experiences");
  const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(experience);
});

// get comments
// app.get('/api/experiences', async (req, res) => {
//   try {
//     console.log("inside get comment api");
//     const experience = await Experience.findById(req.params.id);
//     if (!experience) {
//       return res.status(404).json({ message: 'Experience not found' });
//     }
//     const comments = experience.comments;
//     res.json(comments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Get all comments for an experience
app.get('/api/getcomments/:id', async (req, res) => {
  console.log("get comments");
  try {
    const comments = await CommentNew.find({ experience: req.params.id })
      .populate('experience', 'companyName')
      .select('comment user createdAt');
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});





app.get("/custom-form-fields", (req, res) => {
  const academicKeys = Object.keys(academicSchemaobj)
  const experienceKeys = Object.keys(experienceSchemaobj)
  const porKeys = Object.keys(porSchemaobj)
  const publicationKeys = Object.keys(publicationSchemaobj)
  const referenceKeys = Object.keys(referenceSchemaobj)
  const personalKeys = Object.keys(personalSchemaobj)
  console.log(personalKeys);
  const obj = {};
  obj.academicKeys = academicKeys;
  obj.experienceKeys = experienceKeys;
  obj.porKeys = porKeys;
  obj.publicationKeys = publicationKeys;
  obj.referenceKeys = referenceKeys;
  obj.personalKeys = personalKeys;


  const personalData = {};
  personalKeys.map(k => {
    personalData[k] = false;
  });
  personalData["name"] = true;
  personalData["email"] = true;

  const academicData = {};
  academicKeys.map(k => {
    academicData[k] = false;
  });

  const experienceData = {};
  experienceKeys.map(k => {
    experienceData[k] = false;
  });

  const porData = {};
  porKeys.map(k => {
    porData[k] = false;
  });

  const referenceData = {};
  referenceKeys.map(k => {
    referenceData[k] = false;
  });

  const publicationData = {};
  publicationKeys.map(k => {
    publicationData[k] = false;
  });

  res.send({ status: 200, obj: obj, personalData, academicData, experienceData, porData, referenceData, publicationData });

})


app.post("/delete-job", async (req, res) => {
  console.log("hereregueiryg");
  const { id } = req.body;
  console.log(id);
  const job = await Job.updateOne({ _id: id }, { $set: { deleted: true } });
  if (job) {
    console.log("deleted");
    res.send({ status: 200 });
  } else {
    console.log("error deleting");
    res.send({ status: 500 });
  }
})

app.post("/withdraw-application", async (req, res) => {
  const { id } = req.body;
  const application = await Application.updateOne({ _id: id }, { $set: { status: "Withdrew" } });
  if (application) {
    console.log("withdrew");
    res.send({ status: 200 });
  } else {
    console.log("error");
    res.send({ status: 500 });
  }
})


app.post("/api/registerInstitute", async (req, res) => {
  // console.log("inside api");
  console.log(req.body);

  const userName = req.body.formData.username;
  const email = req.body.formData.email;
  const companyName = req.body.formData.companyName;
  const location = req.body.formData.location;
  const year = req.body.formData.year;
  const phone = req.body.formData.phone;

  console.log(email);

  const newInstitute = new RegisterInstitute({
    usersname: userName,
    email: email,
    companyName: companyName,
    location: location,
    year: year,
    phone: phone

  });

  console.log("chck ke pehle");
  console.log(newInstitute);

  try {
    let check1 = await RegisterInstitute.find({ email: email });
    let check2 = await UserInstitute.find({ email: email });
    console.log(check1);
    console.log(check2);
    if (check1.length !== 0 || check2.length!==0) {
      console.log("inside check");
      return res.status(200).send({ status: 400, message: "User already exists" });
    }
    else {
      const insti = new RegisterInstitute(newInstitute);
      insti.save((err) => {
        if (err) {
          return res.status(500).send({ status: 500 , message: "Request Failed", err });

        } else {
          return res.status(200).send({ status: 200 , message: "Request Succesfull"});
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: 500 , message: "Request Failed"});
  }

  console.log("check ke baad ");


});

app.get("/updateJob/:id", async (req, res) => {
  const { id } = req.params;
  const job = await Job.findOne({ _id: id });
  if (job) {
    res.send({ status: 200, job: job });
  } else {
    res.send({ status: 500 });
  }
})

app.post("/updateJob", async (req, res) => {
  const { job, id } = req.body;

  const current_job = await Job.findOne({ _id: id });
  if (current_job) {
    const new_job = await Job.updateOne({ _id: id }, {
      $set: {
        title: job.title,
        description: job.description,
        location: job.location,
        salary: job.salary,
        contactEmail: job.contactEmail,
        qualifications: job.qualifications,
        college: job.college,
        responsibilities: job.responsibilities,
        lastDate: job.lastDate,
        lastUpdateDate: job.lastUpdateDate,
        fields: job.fields
      }
    });

    if (new_job) {
      res.send({ status: 200 });
    } else {
      res.send({ status: 500 });
    }
  } else {
    res.send({ status: 500 })
  }
})



const createWorkbook = async (id) => {

};


app.get("/create-workbook/:id", async (req, res) => {
  const { id } = req.params;
  const application = await Application.findOne({ _id: id });
  var name_of_file = "_applicant_details.xlsx";
  if (application) {
    name_of_file = application.student_details.personal[0].name + name_of_file;
    console.log("got into application");
    const student_details = application.student_details;
    console.log(student_details);
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("data");
    ws.cell(1, 2).string("data field");
    ws.cell(1, 3).string("value");
    var rowIndex = 3;
    var flag = 0;
    await Object.keys(student_details).map((details) => {
      student_details[details].map((stu) => {
        Object.keys(stu).map((k) => {
          if (flag == 0) {
            ws.cell(rowIndex, 1).string(details);
            flag = 1;
          }
          console.log(k);
          console.log(stu[k]);
          ws.cell(rowIndex, 2).string(k);
          ws.cell(rowIndex, 3).string(stu[k]);
          rowIndex++;
          //ws.cell(:k,value:stu[k]});
        });
        if (flag == 1) {
          rowIndex++;
        }
        flag = 0;
      });
    });
    console.log("done till here");
    await wb.write(name_of_file);

  }
  res.send({ status: 200 });
})
app.get("/export/:id", async (req, res, next) => {
  console.log("here");
  const { id } = req.params;
  const application = await Application.findOne({ _id: id });
  console.log(application);
  //await createWorkbook(id);
  var name_of_file = application.student_details.personal[0].name + "_applicant_details.xlsx";
  const file = __dirname + `\\${name_of_file}`;
  const fileName = path.basename(file);
  const mimeType = mime.getType(file);
  res.setHeader("Content-Disposition", "attachment;filename=" + fileName);
  res.setHeader("Content-Type", mimeType);
  console.log("here too");
  res.download(file, name_of_file);



  console.log("and afetr");
  console.log('rwugteiu');


})

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 4000");
});
