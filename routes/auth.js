'use strict';

const express = require('express');
const router = express.Router({ mergeParams: true });
const userModel = require('../models/users');
const bcrypt = require('bcrypt-as-promised');



router.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

router.post('/', (req, res) => {
  userModel.getByEmail(req.body.email)
    .then((user) => {
      if(!user){
        res.status(400).send('Nope');
      }else{
        bcrypt.compare(req.body.password, user.password)
          .then((success)=>{
            console.log(user);
            req.session.user = user;
            res.redirect('/');
          })
          .catch((err)=>{
            res.status(400).redirect('/')
          })
      }
    })
});




module.exports = router;
