// The package for the web server
const express = require('express');
// Additional package for logging of HTTP requests/responses
const sendgridMail = require('@sendgrid/mail');//for sending emails
// Set up SendGrid API key
sendgridMail.setApiKey('add-your-secret-key-for-email'); // Replace with your actual API key
// const { getMembers, insertDB, getSearchMembers, insertUser, getLoginDetails } = require('./createDB');
const morgan = require('morgan');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = 3000;
app.use(express.json());
// Include the logging for all requests
app.use(morgan('common'));
// Tell our application to serve all the files under the `public_html` directory
app.use(express.static('Week\ 10/Task\ 4'));
const path = require('path');
app.use(cors());
//Here we are configuring express to use body-parser as middle-ware.
app.use(express.urlencoded({ extended: true }));
// ********************************************
// *** Other route/request handlers go here ***
// ********************************************
// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, ()=> {
// When the application starts, print to the console that our app is
// running at http://localhost:3000. Print another message indicating
// how to shut the server down.
console.log(`Web server running at: http://localhost:${port}`);
console.log(`Type Ctrl+C to shut down the web server`);
})

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change if different
    password: '14June@1999', // Change if set
    database: 'SIT772'
});

//sql connection response message
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
  res.render('login', { title: 'Login', alert:'' });
  });


app.post('/login', (req, res, next) => {
  const logindata = req.body;
  let hashedPassword = hashPassword(logindata.password);
  const sql = `SELECT * FROM USERS WHERE EMAIL = ? and password = ?;`;
  db.query(sql, [logindata.email, hashedPassword], (err, result) => {
    if (err) {
        return res.json({success:false, message: 'Database error : ' + err });  //sending msg back to the frontend
        console.log("database error"+err);
    }
    else
    {
        if(result.length !=0)
        {
            res.render('index',{user_name:result[0].NAME});
        }
        else
        {
            const sql = `SELECT * FROM USERS WHERE EMAIL = ?;`;
            db.query(sql, [logindata.email], (err, row) => {
                if (err) {
                    return res.json({success:false, message: 'Database error : ' + err });  //sending msg back to the frontend
                    console.log("database error"+err);
                }
                else
                {
                    if(row.length !=0)
                    {
                        res.render('login', {alert: 'Invalid Password'});
                    }
                    else
                    {
                        res.render('login', {alert: 'User does not exist'});
                        // console.log("no users");
                    }
                }
                }); 
            // res.render('login', {alert: 'Invalid Credentials or the user does not exist'});
            // console.log("no users");
        }
    }
    }); 
});

app.get('/registerform', (req, res, next) => {
  res.render('register', { title: 'Membership Form', alert: "" });
  });

// Function to hash the password
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}
app.post('/register', (req, res, next) => {
  const formdata = req.body;
  const sql = `INSERT INTO USERS(NAME,EMAIL,PASSWORD) VALUES(?,?,?);`;
  console.log(formdata);
  if(formdata.password == formdata.confirmPassword)
  {
    let hashedPassword = hashPassword(formdata.password);
    db.query(sql, [formdata.name, formdata.email, hashedPassword], (err, result) => {
        if (err) {
            res.render('register', {alert: 'User already exists!'});;  //sending msg back to the frontend
            console.log("database error"+err);
        }
        else
        {
                res.render('register', {alert: 'User registered successgully, please login again!'});
        }
        });
    }
    else
    {
        // res.render('register', {alert: 'Confirm password does not match'});
        console.log("Passwords do not match");
    }
  });

app.post('/place_order', (req, res, next) => {
console.log("place");
const formdata = req.body;
const sql = `INSERT INTO ORDERS(EMAIL,ADDRESS,ITEMS) VALUES(?,?,?);`;
// console.log(req.body);
db.query(sql, [formdata.email, formdata.address, formdata.cart], (err, result) => {
    if (err) {
        console.log(err);
        return res.json({success:false, message: 'Database error : ' + err });  //sending msg back to the frontend
        console.log("database error"+err);
    }
    else
    {
        // console.log(result);
        // console.log(result.insertId);
        const mailOptions = {
            to: formdata.email,
            from: 'ritikamaikap.1997@gmail.com', // Replace with a verified sender email in SendGrid
            subject: 'Your Order Details from AllProducts.com',
            text: 'Hi, You order has been placed. Your order number is : '+result.insertId
        };
    
        try {
            sendgridMail.send(mailOptions);
            console.log("Email sent successfully");
        } catch (error) {
            console.error(error);
        }
        return res.json({success:true, order_num: result.insertId });  //sending msg back to the frontend
        
    }
    });
});

// app.post('/submitmembership', (req, res, next) => {
//   const formdata = req.body;
//   // console.log(req.body);
//   insertDB(formdata.firstname, formdata.surname, formdata.email, formdata.mobileNumber, formdata.inputNumCaps, formdata.capstyle, formdata.comments,(err,id) => {
//     if (err) {
//         console.error('Error inserting user:', err);
//     } else {
//         console.log(`User added`);
//     }
//   });
//   res.render('thankyou', {
//     title: 'dKin Cap Sales',
//     data: formdata
//     });
//   });

//   app.get('/feedback', (req, res) => {
//     getMembers((err,data) =>{
//       if(err){
//         res.status(500).send('Error retrieving members');
//       } else {
//         res.render('members',{
//           title: 'dKin Cap Sales',
//           members: data});
//       }
//     })
//     });

// app.post('/search', (req, res, next) => {
//   const searchdata = req.body;
//   getSearchMembers(searchdata.searchitem, searchdata.field, (err,response) => {
//     if (err) {
//         console.error('Error retrieving user:', err);
//     } else {
//         console.log(`Records retrived`);
//         res.render('search', {
//           title: 'dKin Cap Sales',
//           data: response,
//           searchkeyword: searchdata.searchitem,
//           searchfield: searchdata.field
//           });
//     }
//   });
  
//   });

app.use( (error, request, response, next) => {
  let errorStatus = error.status || 500;
  response.status(errorStatus);
  response.send(`<h3>${errorStatus}: ${error.toString()}</h3>`);
  });