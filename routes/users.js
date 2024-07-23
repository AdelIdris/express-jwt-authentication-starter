const mongoose = require('mongoose');
const router = require('express').Router();   
const User = mongoose.model('User');
//const passport = require('passport');
const utils = require('../lib/utils');

//router.get('/protected', passport.authenticate('jwt', {session: false}), (req, res, next) => {
router.get('/protected',utils.authMiddleware , (req, res, next) => {
	console.log(req.jwt);
	res.status(200).json({success: true, msg: 'you are autorized!'});
});

// TODO
router.post('/login', function(req, res, next){
	User.findOne({ username: req.body.username})
	.then((user) => { 
		
		if(!user){
		res.status(401).json({success: false, msg: "could not find user"});
		}
		const isValid = utils.validPassword(req.body.password, user.hash, user.salt);
		if(isValid){
		const tokenObject = utils.issueJWT(user);
		console.log("*************************loggin***************************");
		console.log("***********Username"+  user.username+  " ***********************");

		res.status(200).json({ success: true, user: user, token: tokenObject, expiresIn: tokenObject.expires});
 
		}else {
		 res.status(401).json({ success: false, msg: "you entered the worng password"});

		}
	})
	.catch((err) =>{
		next(err);
	});

});

// TODO
router.post('/register', function(req, res, next){
	const saltHash = utils.genPassword(req.body.password);
	const salt = saltHash.salt;
	const hash = saltHash.hash;
	
	const newUser = new User({
		username: req.body.username,
		hash: hash,
		salt: salt
	});

	newUser.save()
	.then((user) => {
		const jwt = utils.issueJWT(user); 
			console.log("*************************CREATED***************************");
		console.log("***********User with name"+  user.username+  " ***********************");
		res.json({ sucess: true, user:user, token:jwt.token , expiresIn: jwt.expires });

	})
	.catch(err => next(err));

});
module.exports = router;
