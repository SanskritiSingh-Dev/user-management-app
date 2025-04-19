//all packages that need to be required
const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const { v4: uuidv4 } = require("uuid");

//use ejs for templating
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

//starting the sever at localhost:8080
app.listen("8080", () => {
    console.log("listenig to port 8080...");
});

//connecting to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Sanvi@1423'
});

//usingfaker to generate fake data to build the application
let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}

//inserting data of about 200 

// let data = [];
// for(let i = 1; i<=100; i++){
//     data.push(getRandomUser());
// }
// let q = "INSERT INTO user(id, username, email, password) VALUES ? ";

// try {
//     connection.query(q, [data], (err, result) => {
//         if (err) throw err;
//         console.log(result);
//     });
// }catch(err){
//     console.log(err);
// }
// connection.end();


// 1.GET / fetch and show total no. of users in our app
app.get("/", (req, res) => {
    let q = `SELECT COUNT(*) FROM user`;
    //we have to run the query in this route only.
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["COUNT(*)"];
            res.render("home.ejs", { count });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in the database.")
    }
});

// 2. GET /user fetch and show id, username, email of all the users
app.get("/user", (req, res) => {
    let q = `SELECT id, username, email FROM user`;
    //we have to run the query in this route only.
    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("user.ejs", { users });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in the database.")
    }
});

//3. GET /user/:id/edit get form to edit the username based on id. It will need password
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            res.render("edit.ejs", { user });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in the database.")
    }
});

//4. PATCH /user/:id to deit the user id
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let {password: formPAss, username: newUSername} = req.body;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if(formPAss != user.password){
                res.send("WRONG PASSWORD !!");
            }
            else{
                let w = `UPDATE user SET username = '${newUSername}' WHERE id = '${id}'`;
                connection.query(w, (err, result) => {
                    if(err) throw err;
                    res.redirect("/user");
                })
            }
        });
    } catch (err) {
        console.log(err);
        res.send("some error in the database.")
    }
});

//5. POST /user add the new user
app.get("/user/new", (req, res) => {
    res.render("new.ejs");
  });
  
  app.post("/user/new", (req, res) => {
    let { username, email, password } = req.body;
    let id = uuidv4();
    //Query to Insert New User
    let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        console.log("added new user");
        res.redirect("/user");
      });
    } catch (err) {
      res.send("some error occurred");
    }
  });

//6. PATCH /user/:id delte the user if email and password is correct
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let u = result[0];
            res.render("delete.ejs", { u });
        });
    } catch (err) {
        console.log(err);
        res.send("some error in the database.")
    }
});
//deletition process after verification
app.delete("/user/:id/", (req, res) => {
    let { id } = req.params;
    let { password } = req.body;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
  
        if (user.password != password) {
          res.send("WRONG Password entered!");
        } else {
          let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
          connection.query(q2, (err, result) => {
            if (err) throw err;
            else {
              console.log(result);
              console.log("deleted!");
              res.redirect("/user");
            }
          });
        }
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });
  
