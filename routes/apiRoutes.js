const express = require("express");
const route = express.Router();
const db = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// demo route
route.get('/demo', (req, res) => {
    res.send("hey there!")
});

// Get All Users
route.get('/allUsers', (req, res) => {
    db.user.findAll().then((data) => {
        res.send(data);
    })
});

//get specific User by id
route.get('/getSpecificUser/:id', (req, res) => {
    db.user.findAll({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        res.send(data)
    })
})

//get Specific User by username
route.post('/getUserbyname', (req, res) => {
    db.user.findAll({
        where: {
            username: req.body.username
        }
    }).then((data) => {
        if (Object.keys(data).length === 0) {
            return res.send('no data found')
        }
        res.send(data)
    });
});

//Get user by email
route.post('/getUserByEmail', (req, res) => {
    // console.log(req.body.email)
    db.user.findAll({
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if (Object.keys(data).length === 0) {
            return res.send('No Data Found')
        }
        res.send(data);
    })
})



// Create/Add new User
route.post('/newUser', (req, res) => {
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if (data) {
            res.json({
                message: "Email already exist"
            })
        } else {
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(req.body.password, salt, (error, hash) => {
                    db.user.create({
                        username: req.body.username,
                        email: req.body.email,
                        password: hash
                    }).then((data) => {
                        res.send(data);
                    }).catch((error) => {
                        res.json({
                            message: "Error : " + error
                        });
                    });
                });
            });
        }
    }).catch((error) => {
        res.json({
            message: "Error : " + error
        });
    });
});

//delete by ID
route.delete('/deleteuser/:id', (req, res) => {
    db.user.findOne({
        where: {
            id: req.params.id
        }
    }).then((data) => {
        if (!data) {
            res.json({
                message: "No user found"
            })
        } else {
            db.user.destroy({
                where: {
                    id: req.params.id
                }
            }).then((data) => {
                res.send(data + ' deleted');
            }).catch((error) => {
                res.json({
                    message: "Error : " + error
                });
            });
        }
    }).catch((error) => {
        res.json({
            message: "Error : " + error
        });
    });
});

//delete by email
route.delete('/deleteUserByEmail', (req, res) => {
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if (!data) {
            res.json({
                message: "No user Found"
            });
            return
        }
        db.user.destroy({
            where: {
                email: req.body.email
            }
        }).then((data) => {
            if (data === 0) {
                return res.send('no record found having this email')
            }
            res.send(data + ' record deleted!')
        })
    }).catch((error) => {
        res.json({
            message: "Error : " + error
        });
    });
})

route.put('/update-user', (req, res) => {
    db.user.findOne({
        where: {
            id: req.body.id
        }
    }).then((data) => {
        if (!data) {
            res.json({
                message: "No user with id " + req.body.id + " found."
            })
            return
        }
        db.user.update({
            username: req.body.username,
            email: req.body.email
        }, {
            where: {
                id: req.body.id
            }
        }).then((data) => {
            res.send(data + ' record updated!')
        }).catch((error) => {
            res.json({
                message: "Error : " + error
            });
        });
    })
});

route.get('/forgot-password', (req, res) => {
    res.send('forgot password?')
});

route.post('/forgot-password', (req, res) => {

});
route.get('/reset-password', (req, res) => {

});
route.post('/reset-password', (req, res) => {

});









module.exports = route;