const express = require('express');
const app = express();
const path = require('path');
const assert = require('assert');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const session = require('express-session')
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var ObjectID = require('mongodb').ObjectID;
imageUpload = require('./imageUploader');
//upload = imageUpload.single('Image');
var flash = require('connect-flash');
app.use(flash());
app.use(cookieParser());
var trans = require('./email.js');

// ------multer-----------------------

app.use('/uploads', express.static('uploads'))

// var upload = multer({ dest: 'uploads/' })
// Require static assets from public folder
// app.use(express.static(path.join(__dirname, 'public')));

// Set 'views' directory for any views 
// being rendered res.render()
app.set('views', path.join(__dirname, 'views'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');
// parse application/json
app.use(bodyParser.json());
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// Use connect method to connect to the server
var MongoClient = require('mongodb').MongoClient;
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: 'pec.saumil@gmail.com',
    pass: 'saumiljain1994'
  }
});
let db;
MongoClient.connect('mongodb://localhost:27017/myproject', function (err, client) {
  if (err) throw err

  db = client.db('myproject')
  console.log("mongodb connected....")
});

//node mailer
// const nodemailer = require("nodemailer");
var checkUserloggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Session time out.');
    res.redirect('/admin');
  }
}


app.get('/', function (req, res) {
  console.log("req.session------>", req.session);
  var data = {}
  // data.error = req.flash('error');
  // data.success = req.success('success');
  data.session = false;
  if (req.session.user) {
    res.redirect('admin/dashboard');
  } else {
    res.render('admin-login', data);
  }
});

app.get('/admin', function (req, res) {
  var data = {};
  data.error = req.flash("error");
  data.success = req.flash("success");
  data.session = req.session;
  if (req.session.user) {
    res.redirect('/admin/dashboard');

  } else {
    res.render('admin-login', data);
  }
});

app.post('/admin/login', function (req, res) {
  console.log('lllllllllllllllllllllllllll', req.session)
  db.collection('user').findOne({ email: req.body.email, password: req.body.password, role: "Admin" }, (error1, ress1) => {
    if (error1) throw error1;
    else {
      console.log("data", ress1)
      if (ress1.role == "Admin") {
        req.session.user = {
          email: ress1.email,
          password: ress1.password
        };
        var user = req.session.user;
        console.log("////////////////", user)
        req.flash('success',"You are Successfully logged in !!!")
        res.redirect('/admin/dashboard')
      }
      else {
        console.log("dont have permission")
      }
    }
  })

}),

// flash message here
// app.all('/express-flash', (req, res )=> {
//   req.flash('success', 'This is a flash message using the express-flash module.');
//   res.redirect(301, '/');
// }),

  app.get('/admin/dashboard', function (req, res) {
    console.log("req.session.user5555555555555555555555555555", req.session)
    // res.send('welcome to the dashboard' + req.session.user);
    if (req.session.user.email) {
      res.render('DashBoard', { user: req.session.user, successMessage: req.flash('success'), errorMessage: req.flash('error') });
    } else {
      res.redirect('/admin');
    }
  });

app.get('/admin/logout', function (req, res) {
  if (req.session.user) {
    delete req.session.user;
    req.flash('success', 'successfully Log Out')
    res.redirect('/admin');
  }
  else {
    res.redirect('/admin');

  }
});


app.post('/addUser', checkUserloggedIn, function (req, res) {
  console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,", req.body.image)
  console.log("images")
  imageUpload.upload(req, res, (err, ress) => {
    if (err) {
      console.log("heloo", err)
    }
    else {
      let current_datetime = new Date()
      let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
      console.log("Success", ress)
      db.collection('user').insertOne({
        name: req.body.userName,
        email: req.body.userEmail,
        address: req.body.userAddress,
        conatct: req.body.userContact,
        role: req.body.role,
        created_At: formatted_date,
        status: "Active",
        image: ress
      }, function (err, result) {
        if (err) {
          console.log("error")
        }
        else {
          var mailOptions = {
            from: 'pec.saumil@gmail.com',
            to: req.body.userEmail,
            subject: 'Amar dental',
            // text: 'That was easy!'
            html: '<h5>you have been added as a user in Amar dental. To set a new password click on the link below!<h5><a href=http://localhost:5000/createPassword?userId=' + result.ops[0]._id + '>click Me!</a>'
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              res.send('email sent successfully!!! Go to your email inbox to set your password')
            }
          });
        }
      })
    }
  })
  //   let current_datetime = new Date()
  //   let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
  //  upload(req,res,err=>{
  //    if(err){
  //      console.log("lojjjjj",err)
  //    }
  //    else{
  //      console.log("image>>>>>>>>>>>>>>>>>>>>>>>>",req.Image),
  //      console.log("qwertyuik,mmnbnbngbn",req.file)
  //      db.collection('user').insertOne({
  //       name: req.body.userName,
  //       email: req.body.userEmail,
  //       address: req.body.userAddress,
  //       conatct: req.body.userContact,
  //       role: req.body.role,
  //       created_At: formatted_date,
  //       status: "Active",
  //       image:ress
  //     }, function (error, result) {
  //       if (error) {
  //         res.send('error');
  //       }
  //       else {
  //         console.log("result>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>??????????",result.image)
  //         console.log("-------------", result.ops[0]._id);
  //         //  req.flash('user added.');
  //         // res.send('user added successfully!!!');
  //         var mailOptions = {
  //           from: 'pec.saumil@gmail.com',
  //           to: req.body.userEmail,
  //           subject: 'Amar dental',
  //           // text: 'That was easy!'
  //           html: '<h5>you have been added as a user in Amar dental. To set a new password click on the link below!<h5><a href=http://localhost:5000/createPassword?userId=' + result.ops[0]._id + '>click Me!</a>'
  //         };

  //         transporter.sendMail(mailOptions, function (error, info) {
  //           if (error) {
  //             console.log(error);
  //           } else {
  //             console.log('Email sent: ' + info.response);
  //             res.send('email sent successfully!!! Go to your email inbox to set your password')
  //           }

  //         });
  //       }
  //     });
  //    }
  //  })
});

app.get('/createPassword', checkUserloggedIn, function (req, res) {
  console.log("createPasswordGetmethod--------", req.query)
  res.render('createmyPassword', { userId: req.query.userId });
});

app.post('/createuserPassword', function (req, res) {
  console.log('dfghjk??????????', req.body)
  if (req.body.newPassword != req.body.verifyPassword) {
    res.send('your password is not matched. please type same password in both fields!!!!')
  }
  else {
    var hashPassword = bcrypt.hash(req.body.newPassword, 12, function (error, passwordHash) {
      console.log("HashPassword", passwordHash)
      if (error) {
        console.log('Error while updating password', error)
        res.send('error')
      }
      else {
        db.collection('user').update({ _id: ObjectID(req.body.userId) }, { $set: { password: passwordHash } }, function (error, result) {
          console.log("User find out", result)
          console.log('Error while updation for the password', error)
          if (error) {
            res.send('error')
          }
          else {
            res.send('password created successfully!!!')
          }
        });

      }

    });
  }

});


app.get('/userList', checkUserloggedIn, function (req, res) {
  db.collection('user').find({}).sort({ "_id": -1 }).toArray

    (function (err, result) {
      console.log('result11111111111111111111111111111111111', result)
      if (err) {
        res.send('error')
      }
      else {
        let data = {};
        data.result = result;
        console.log("hooooooooooooo",result[0].image)
        res.render('home', data);
      }

    });
});

app.get('/resetPassword', function (req, res) {
  res.render('reset-password')
});

app.post('/resetPassword', function (req, res) {
  console.log('=====//////////========', req.body.email)
  db.collection('user').findOne({
    email: req.body.email
  }, function (error, result) {
    console.log(result)
    if (error || !result) {
      res.send('Email does not exist. please enter valid Email')
    }
    else {
      var mailOptions = {
        from: 'pec.saumil@gmail.com',
        to: req.body.email,
        subject: 'Sending Email using Node.js',
        // text: 'That was easy!'
        html: `<h5>Click on this to reset your password:<br></h5><a href=http://localhost:5000/resetmyPassword?userId=${result._id}>click here!</a>`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.send('email sent successfully!!!')
        }

      });
    }
  });
});


app.get('/resetmyPassword', checkUserloggedIn, function (req, res) {
  res.render('resetmyPassword', { userId: req.query.userId });
});

app.post('/resetmyPassword', checkUserloggedIn, function (req, res) {
  console.log("req.body", req.body)
  bcrypt.hash(req.body.password, 10, function (err, passwordHash) {    // Store hash in your password DB.
    if (err) {
      res.send('error')
    }
    else {
      db.collection('user').updateOne({ _id: ObjectID(req.body.userId) }, { $set: { password: passwordHash } })
        .then(data => {
          console.log("______________", data.result);
          res.send("password updated");
        })
    }
  });

});

app.get('/aboutUs', checkUserloggedIn, function (req, res) {
  res.render('aboutUs')
});

app.get('/contactUs', checkUserloggedIn, function (req, res) {
  res.render('contactUs')
});

app.get('/editUser/:userId', checkUserloggedIn, function (req, res) {
  console.log('ggggggggggggggggggggggggg', req.params)
  let condition = { _id: ObjectID(req.params.userId) }
  db.collection('user').findOne(condition, function (error, result) {
    console.log('dddddddddd', result)
    if (error) {
      res.send('error')
    }
    else {
      res.render('Edit', { "data": result })
    }
  })
});

app.post('/userUpdate', checkUserloggedIn, function (req, res) {
  console.log('1111111111111', req.body)
  db.collection('user').updateOne({ _id: ObjectID(req.body._id) }, { $set: { name: req.body.userName, email: req.body.email, address: req.body.userAddress, conatct: req.body.userContact } }, function (error, result) {
    if (error) {
      res.send('error')
    }
    else {
      req.flash("success", "user updated successfully!!!")
      res.redirect('/userList')
    }
  });
});

app.get('/userRemove/:userId', checkUserloggedIn, function (req, res,next) {
  let success;
  let condition = { _id: ObjectID(req.params.userId) }
  db.collection('user').findOne(condition, function (error, result) {
    console.log('dddddddddd', result)
    if (error) {
      req.flash("error", "error generated !!!")
      res.send('error')
    }
    else {
      // res.render('Remove', { "data": result })
      let condition = { _id: ObjectID(result._id) }
      db.collection('user').deleteOne(condition, function (error, result) {
        if (error) {
          res.send('error')
        }
        else {
          console.log('user removed successfully')
         // success= req.flash("error", "error generated !!!")
     //  res.render('home', success)
          res.redirect(req.get("Referrer"));
        }
      });
    }
  });

});

app.post('/assignStaff', checkUserloggedIn, function (req, res) {
  console.log(req.body)
  //let current_datetime = new Date()
  //let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
  let current_datetime = new Date()
  let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

  db.collection('clinic').save({
    clinic: req.body.ClinicName,
    address: req.body.assignAddress,
    staff: req.body.assignStaff,
    created_at: formatted_date
  }, function (error, result) {
    console.log(result.date)
    if (error) {
      res.send('error')
    }
    else {
      res.redirect('/admin/dashboard')

    }
  });

});

app.get('/manageClinic', checkUserloggedIn, function (req, res) {
  db.collection('clinic').find({}).sort({ "_id": -1 }).toArray(function (err, result) {
    console.log(result)
    if (err) {
      res.send('err')
    }
    else {
      console.log("result--------->", result)
      res.render('assignStaff', { result })
    }
  });
});

app.get('/assignStaffRemove/:userId', checkUserloggedIn, function (req, res) {
  let condition = { _id: ObjectID(req.params.userId) }
  db.collection('clinic').findOne(condition, function (error, result) {
    console.log('dddddddddd', result)
    if (error) {
      res.send('error')
    }
    else {
      res.render('assignstaffRemoved', { "data": result })
    }
  });

});

app.post('/staffAssignRemove', checkUserloggedIn, function (req, res) {
  let condition = { _id: ObjectID(req.body._id) }
  db.collection('clinic').deleteOne(condition, function (error, result) {
    if (error) {
      res.send('error')
    }
    else {
      res.send('removed successfully!!!')
    }
  });

});

app.get('/editassignStaff/:userId', checkUserloggedIn, function (req, res) {
  console.log('ggggggggggggggggggggggggg', req.params)
  let condition = { _id: ObjectID(req.params.userId) }
  db.collection('clinic').findOne(condition, function (error, result) {
    console.log('dddddddddd', result)
    if (error) {
      res.send('error')
    }
    else {
      res.render('updateassignStaff', { "data": result })
    }
  });
});

app.post('/assignstaffUpdate', checkUserloggedIn, function (req, res) {
  console.log('1111111111111', req.body._id)
  db.collection('clinic').updateOne({ _id: ObjectID(req.body._id) }, { $set: { clinic: req.body.clinicName, address: req.body.staffAddress, staff: req.body.assignStaff } }, function (error, result) {
    if (error) {
      res.send('error')
    }
    else {
      res.send('updated successfully!!!')
    }
  });
});

app.get('/findRole', function (req, res) {
  console.log('okokokokokokokokokokokokokokok', req.params)
  console.log('okokokokokokokokokokokokokokok', req.query)
  let condition = { role: req.query.role }
  console.log('condition==', condition)
  db.collection('user').findOne(condition, function (error, result) {
    if (error) {
      res.send('error')
    }
    else {
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@', result)
      let data = {}
      data.result = result;
      res.render('home', data)

    }

  });

});


app.listen(5000, function (req, res) {
  console.log('server is running at port:5000');
})
