const express = require("express");
const route = express.Router();
const db = require('../models')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET
const port = process.env.PORT

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.User,
        pass: process.env.Pass
    }
});

var mailOptions, host, link


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

//forgot password
route.get('/forgot-password', (req, res) => {
    res.render('forgotpassword');
});

route.post('/forgot-password', (req, res) => {

    // check if user exist or not
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if (!data) {
            res.json({
                message: "No Account Found By this email"
            })
            return
        }

        //user exist, one time link valid for 15 minutes
        // res.send("you are there..")

        const secret_key = JWT_SECRET + data.password;
        const payload = {
            email: data.email,
            id: data.id
        }

        const token = jwt.sign(payload, secret_key, { expiresIn: '15m' });

        const link = `http://${req.get('host')}/api/reset-password/${data.id}/${token}`
        console.log(link);

        mailOptions = {
            to: data.email,
            subject: "Reset Password Link",
            html: "hello " + data.email + " , Kindly click on the link to reset your password.\n" + link
        }

        transport.sendMail(mailOptions, (error, response) => {
            if (error) {
                res.json({
                    message: "Error : " + error
                })
                return
            }
            res.send("Reset password link has been send to your email");
        });
    }).catch((error) => {
        res.json({
            message: "Error finding the user" + error
        });
    });
});
route.get('/reset-password/:id/:token', (req, res) => {
    const { id, token } = req.params
    // res.json({
    //     id,
    //     token
    // })

    // get details of user
    db.user.findOne({
        where: {
            id: id
        }
    }).then((data) => {
        if (!data) {
            res.json({
                message: "No User Found"
            })
            return
        }

        const secret_key = JWT_SECRET + data.password;

        try {
            const payload = jwt.verify(token, secret_key)
            console.log(payload)
            res.render('reset-password', { email: payload.email })
        } catch (error) {
            res.json({
                message: "Error : " + error
            });
        }
    });
});

route.post('/reset-password', (req, res) => {
    db.user.findOne({
        where: {
            email: req.body.email
        }
    }).then((data) => {
        if (req.body.password === req.body.repassword) {
            bcrypt.genSalt(10, (error, salt) => {
                bcrypt.hash(req.body.password, salt, (error, hash) => {
                    db.user.update({
                        password: hash
                    }, {
                        where: {
                            email: data.email
                        }
                    }).then((data) => {
                        if (data === 0) {
                            res.json({
                                message: "Something went wrong, password not changed!"
                            });
                            return
                        };
                        res.json({
                            message: "password changed!"
                        });
                    }).catch((error) => {
                        res.json({
                            message: "Error : " + error
                        });
                    });
                });
            });
        };
    });
});

module.exports = route;