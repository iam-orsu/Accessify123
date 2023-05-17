import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import multer from 'multer'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import path from 'path'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


import Axios  from "axios";
import session from "express-session";

const app = express();

const db = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_accessify',
    password: '!AzjRVUJA@Y&Q3e',
    database: 'freedb_accessify'
})

const salt = 10;  //hashing password length

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true

    })
);
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

function message(props) {
    console.log(props);
}


// const storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		if (file.fieldname === '_logo') {
// 			cb(null,path.join(__dirname, '/uploads/logos') );
// 		  } else if (file.fieldname === '_userFile') {
// 			cb(null, path.join(__dirname, '/uploads/files'));
// 		  }else {
// 			cb(new Error('Invalid field name'));
// 		  }
// 	},
// 	filename: (req, file, cb) => {
// 		console.log(file);
// 		cb(null, file.originalname+ '-' + Date.now() + path.extname(file.originalname));
// 	}
	
// });
// const upload = multer({
// 	dest: 'uploads/' 
// });

// const storage = multer.diskStorage({
// 	destination: (req, file, callback) => {
// 	  callback(null, "uploads");
// 	},
// 	filename: (req, file, callback) => {
// 	  callback(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));
// 	},
//   });
//   const imageStorage = multer.diskStorage({
// 	destination: (req, file, callback) => {
// 	  callback(null, "images");
// 	},
// 	filename: (req, file, callback) => {
// 	  callback(null, file.originalname+ '-' + Date.now() + path.extname(file.originalname));
// 	},
//   });
// const upload = multer({ storage }).single("file");
// const imageUpload = multer({ storage: imageStorage }).single("image");


const upload = multer({ dest: "uploads/" });
const imageupload = multer({ dest: "images/" });

// connection.connect(function(err){
//   if(err) throw err;
//   console.log("connected database");
// });

// Regular expressions for validation
const nameRegex = /^[a-zA-Z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const zipRegex = /^\d{5}$/;
const countryRegex = /^[a-zA-Z\s]+$/;
const allowedTypes = /jpeg|jpg|png|gif/;


// Validation functions
function validateFullName(fullName) {
	const trimmedFullName = fullName.trim();
	return nameRegex.test(trimmedFullName);
}
function validateEmail(email) {
	return emailRegex.test(email);
}
function validatePhoneNumber(phoneNumber) {
	return phoneRegex.test(phoneNumber);
}
function validateZipCode(zipCode) {
  return zipRegex.test(zipCode);
}
function validateCountry(country) {
	return countryRegex.test(country);
}
function validateFileType(fileType) {
	return allowedTypes.test(fileType);
}


const verifyUser = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json({Error:"You are not Authenticated"})
    }else{
        jwt.verify(token, "jwt-secret-key", (err, decoded)=>{
            if(err){
                return res.json({Error:"Token is not matched"})
            }else{
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/',verifyUser,(req,res)=>{
    return res.json({Status: "Success", name:req.name});
})


app.post('/register', (req,res)=>{
    const sql = "INSERT INTO users (`name`,`email`,`password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash)=>{
        if(err) return res.json({Error:"Error for hashing password"})
        const values = [
            req.body.name,
            req.body.email,
            hash
        ]
        db.query(sql, [values], (err,result)=>{
            if(err) return res.json({Error: "Inserting data error"});
            return res.json({Status: "Success"});
        })
    })
    
})



app.get('/login', (req, res) => {
    res.send('This has CORS enabled ')
})


app.post('/login',(req, res) =>{

	const sql = "SELECT * FROM users WHERE email = ? ";
    db.query(sql,[req.body.email],(err,data)=>{
        if(err) return res.json({Error: "Login error in server"});
        if(data.length > 0){
            bcrypt.compare(req.body.password.toString(), data[0].password,(err,response)=>{
                if(err) return res.json({Error: "Password compare error"});
                if(response){
                    const name =data[0].name;
                    const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: "Success"});
                }else{
                    return res.json({Error: "Wrong password"});
                }
            })
        }else{
            return res.json({Error:"No email exist"});
        }
    })
});

// app.post('/multiuser', (req, res) => {
//     const sql = `INSERT INTO multi_user (Institution, BatchYear, Batch, AccessPeriod, file) VALUES (?, ?, ?, ?, ?)`;  
// console.log(req.body);
//     const { Institution, BatchYear, Batch, AccessPeriod } = req.body;
//     console.log("h");
//     const { filename } = req.file.filename;
//     console.log("h");

//     const queryValues = [Institution, BatchYear, Batch, AccessPeriod, filename];
//     // const values = [
//     //     req.body.Institution,
//     //     req.body.BatchYear,
//     //     req.body.Batch,
//     //     req.body.AccessPeriod,
//     //     req.file
//     // ]
// 	upload(req, res, (error) => {
// 		if (error) {
// 		  console.log(error);   
// 		  return res.sendStatus(500);
// 		}
//         console.log("h",req.body,Institution,BatchYear,Batch,AccessPeriod,filename,path);
//       db.query(sql, queryValues, (err,result)=>{
//         if(err) {
//             return res.json({Error: "Inserting data error"});
//         }else {
//             console.log("Upload successful!",req.body,req.file);
//             return res.json({Status: "Success"});
//         }
//     });
// });

// });


app.post("/multiuser", upload.single("file"), (req, res) => {
    const { Institution, BatchYear, Batch, AccessPeriod } = req.body;
    const filename = req.file.originalname;
    const sql = `INSERT INTO multi_user (Institution, BatchYear, Batch, AccessPeriod, file) VALUES (?, ?, ?, ?, ?)`;
    const queryValues = [Institution, BatchYear, Batch, AccessPeriod, filename];
    console.log(queryValues);
    db.query(sql, queryValues, (err, result) => {
      if (err) {
        console.log("h",err);
        return res.status(500).json({ error: "Inserting data error" });
      } else {
        console.log("Upload successful!", req.body, req.file);
        return res.status(200).json({ status: "Success" });

      }
    });
  });


app.get('/users/:institution/:batchYear/:batch', (req, res) => {    
    const { institution, batchYear, batch } = req.params;

    let sql = "SELECT * FROM users";
    console.log("h");
    if (institution) {
    const sql = `SELECT * FROM users WHERE institution = ? AND batchYear = ? AND batch = ?`;
    const values = [institution, batchYear, batch];
      }
      db.query(sql, values, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
        } else {
          res.json(result);
          console.log(result);
        }
      });
});
app.post('/institution-single-user', (req, res) => {
    const sql = "INSERT INTO `single-user` (`Institution`,`BatchYear`,`Batch`,`firstname`,`lastname`,`email`,`regid`,`mobile`,`password`,`AccessPeriod`) VALUES (?)";  

    bcrypt.hash(req.body.password.toString(), salt, (err, hash)=>{
        if(err) return res.json({Error:"Error for hashing password"})
    const values = [
        req.body.Institution,
        req.body.BatchYear,
        req.body.Batch,
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        req.body.regid,
        req.body.mobile,
        hash,
        req.body.AccessPeriod
    ]	
    console.log(req.body,);
    db.query(sql, [values], (err,result)=>{
        if(err){ 
            console.log(err);
            return res.json({Error: "Inserting data error"});
    }else{
        return res.json({Status: "Success"});
    }
    })
})
});
app.post('/institution', (req, res) => {
	const { institutionName,headofinstitution,primarycontact,primaryemail,secondarycontact,secondaryemail,address,institutioncode,state,city,password,InstitutionType} = req.body;
	console.log(req.body,institutionName,headofinstitution,primarycontact,primaryemail,secondarycontact,secondaryemail,address,institutioncode,state,city,password,InstitutionType);
});

app.post('/batch', (req, res) => {
    const sql = "INSERT INTO batch (`institution`,`BatchYear`,`Batchname`) VALUES (?)";  

    const values = [
        req.body.institution,
        req.body.BatchYear,
        req.body.Batchname,
    ]	
    console.log(req.body);
    db.query(sql, [values], (err,result)=>{
        if(err){ 
            console.log(err);
            return res.json({Error: "Inserting data error"});
    }else{
        return res.json({Status: "Success"});
    }
    })
});

app.post('/createBatchyears', (req, res) => {    
    const sql = "INSERT INTO Batchyears (`createinstitution`,`createBatchyear`) VALUES (?)";  

const values = [
    req.body.createInstitution,
    req.body.createBatchyear
]	
console.log(req.body,req.body.createInstitution,req.body.createBatchyear);
db.query(sql, [values], (err,result)=>{
    if(err) return res.json({Error: "Inserting data error"});
    return res.json({Status: "Success"});
})

});


app.get('/batchyears/:selectInstitution?', (req, res) => {
    const { selectInstitution } = req.params;
    let sql = "SELECT * FROM Batchyears";
    console.log("h");

    if (selectInstitution) {
      sql += ` WHERE createinstitution = '${selectInstitution}'`;
      console.log("hh");

    }
  
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(result);
      }
    });
  });
  
// app.get('/batchyearshh', (req, res) => {

//     let sql = "SELECT * FROM Batchyears";
//     console.log("h");

//     if (req.params.selectInstitution) {
//         const selectedInstitution = req.params.selectInstitution;
//         sql = `SELECT * FROM batch WHERE institution = '${selectedInstitution}'`;
//         console.log("hh");

//       }
    
    
//       db.query(sql, (err, result) => {
//         if (err) {
//             console.log("hhh");

//           console.log(err);
//           res.status(500).send("Internal Server Error");
//         } else {
//           res.json(result);
//           console.log("hhhh");

//         }
//       });
//     });

// app.get('/batchs',(req,res) =>{
//     const sql="SELECT * FROM batch";
//     db.query(sql,(err,result)=>{
//         if(err) console.log("l",err);

//         res.json(result);
//         });
// });

app.get('/batchs/:selectInstitution?', (req, res) => {
    const { selectInstitution } = req.params;
    let sql = "SELECT * FROM batch";
    console.log("h");

    if (selectInstitution) {
      sql += ` WHERE institution = '${selectInstitution}'`;
      console.log("hh");

    }
  
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.json(result);
      }
    });
  });

// app.get('/batchs/:selectInstitution', (req, res) => {
//     const selectedInstitution = req.params.selectInstitution;

//   const sql = `SELECT * FROM batch WHERE institution = '${selectedInstitution}'`;

//   db.query(sql, (err, result) => {
//     if (err) console.log(err);

//     res.send(result);
//   });
// });


// app.post('/register', upload.single('image'), (req, res) => {
// 	const { filename } = req.file;
// 	const fileExtension = path.extname(filename);
// 	const newName = `${filename}${fileExtension}`;
// 	const oldPath = `uploads/${filename}`;
  
// 	const { name,email,businessname,phone,address,state,city,zip,language } = req.body;

// 	console.log(req.body ,name,email,businessname,phone,address,state,city,zip,language);
// 	// move the file to the images folder with the new name
// 	// fs.rename(oldPath, newPath, (err) => {
// 	//   if (err) {
// 	// 	console.error(err);
// 	// 	res.status(500).json({ message: 'Failed to upload image' });
// 	//   } else {
// 	// 	console.log(`Image saved as ${newName}`);
// 	// 	res.json({ message: 'Image uploaded successfully' });
// 	//   }
// 	// });
//   });
  app.post('/register',(req, res) => {

    imageUpload(req, res, (error) => {
		if (error) {
		  console.log(error);
		  return res.sendStatus(500);
		}
		console.log("Upload successful!");
  
	const { name,email,businessname,phone,address,state,city,zip,language } = req.body;

	console.log(req.body ,name,email,businessname,phone,address,state,city,zip,language);

	});
  });


  app.get('/logout',(req,res) =>{
    res.clearCookie('token');
    return res.json({Status: "Success"})
	
})

app.listen(3001, () => {
    console.log("running server port 3001");
});
