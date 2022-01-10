const express = require("express");
const route = express.Router();
const db = require('../models')

// Get All Users
route.get('/allUsers', (req,res) => {
    db.user.findAll().then((data) => {
        res.send(data);
    })
});

//get specific User by id
route.get('/getSpecificUser/:id', (req,res) => {
    db.user.findAll({
        where : {
            id : req.params.id
        }
    }).then((data) => {
        res.send(data)
    })
})

//get Specific User by username
route.get('/getUserbyname', (req,res) => {
    db.user.findAll({
        where: {
            username : req.body.username
        }
    }).then((data) => {
        if (Object.keys(data).length === 0) {
            return res.send('no data found')
        }
        res.send(data)
    });
});

//Get user by email
route.get('/getUserByEmail', (req,res) => {
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
route.post('/newUser', (req,res) => {
    db.user.create({
        username: req.body.username,
        email: req.body.email
    }).then((data) => {
        res.send(data);
    })
});

//delete by ID
route.delete('/deleteuser/:id', (req,res) => {
    db.user.destroy({
        where : {
            id: req.params.id
        }
    }).then((data) => {
        res.send(data + ' deleted');
    });
});

//delete by email
route.delete('/deleteUserByEmail', (req,res) => {
    db.user.destroy({
        where : {
            email : req.body.email
        }
    }).then((data) => {
        if(data === 0) {
            return res.send('no record found having this email')
        }
        res.send(data + ' record deleted!')
    })
})


route.put('/edit/:id', (req,res) => {
    db.user.update({
        username : req.body.username,
        email: req.body.email 
    }, {
        where: {
            id : req.params.id
        }
    }).then((data) => {
        res.send(data + ' updated!')
    })
})
module.exports = route;