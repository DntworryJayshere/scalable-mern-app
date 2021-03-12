const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const shortId = require('shortid');
const _ = require('lodash');
require('dotenv').config();

// import models
const User = require('../../models/user');

// import validators
const {
	userRegisterValidator,
	userLoginValidator,
	forgotPasswordValidator,
	resetPasswordValidator,
} = require('../../validators/auth');
const { runValidation } = require('../../validators');

// import helpers
const {
	registerEmailParams,
	forgotPasswordEmailParams,
} = require('../../helpers/email');

//AWS Config SES
AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

//@route    POST api/register
//@desc     begin to register user through SES
//@access   Public
router.post(
	'/register',
	userRegisterValidator,
	runValidation,
	async (req, res) => {
		const { name, email, password, categories } = req.body;
		// check if user exists in our db
		try {
			let user = await User.findOne({ email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Email is taken' }] });
			}

			// generate token with user name email and password
			const token = jwt.sign(
				{ name, email, password, categories },
				process.env.JWT_ACCOUNT_ACTIVATION,
				{
					expiresIn: '10m',
				}
			);

			// send email
			const params = registerEmailParams(email, token);
			const sendEmailOnRegister = ses.sendEmail(params).promise();
			sendEmailOnRegister
				.then((data) => {
					console.log('email submitted to SES', data);
					return res.json({
						message: `Email has been sent to ${email}, Follow the instructions to complete your registration`,
					});
				})
				.catch((error) => {
					console.log('ses email on register', error);
					return res.json({
						message: `We could not verify your email. Please try again`,
					});
				});
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

//@route    POST api/register/activate
//@desc     activate a registered user
//@access   Public
router.post('/register/activate', async (req, res) => {
	const { token } = req.body;

	jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
		if (err) {
			return res.status(401).json({
				error: 'Expired link. Try again',
			});
		}

		const { name, email, password, categories } = jwt.decode(token);
		const username = shortId.generate();

		try {
			let user = await User.findOne({ email });

			if (user) {
				return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
			}

			// register new user
			user = new User({
				username,
				name,
				email,
				password,
				categories,
			});

			await user.save();
			res.json({ msg: 'User activated' });
		}
		catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	});
});

//@route    POST api/login
//@desc     login user
//@access   Public
router.post('/login', userLoginValidator, runValidation, async (req, res) => {
	const { email, password } = req.body;

	try {
		let user = await User.findOne({ email })

		if (!user) {
			return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
		}

		// authenticate
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
		}

		// generate token and send to client
		const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '7d',
		});
			
		const { _id, name, email, role } = user;
	
		return res.json({
			token,
			user: { _id, name, email, role },
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

//@route    PUT api/forgot-password
//@desc     send email to reset forgotten password
//@access   Public
router.put(
	'/forgot-password',
	forgotPasswordValidator,
	runValidation,
	async (req, res) => {
		const { email } = req.body;
		// check if user exists with that email
		try {
			let user = User.findOne({ email })

			if (err || !user) {
				return res.status(400).json({
					error: 'User with that email does not exist',
				});
			}
			
			// generate token and email to user
			const token = jwt.sign(
				{ name: user.name },
				process.env.JWT_RESET_PASSWORD,
				{ expiresIn: '10m' }
			);

			// send email
			const params = forgotPasswordEmailParams(email, token);

				// populate the db > user > resetPasswordLink
			await User.updateOne({ resetPasswordLink: token }, (err, success) => {
				if (err) {
					return res.status(400).json({
						error: 'Password reset failed. Try later.',
					});
				}
				const sendEmail = ses.sendEmail(params).promise();
				sendEmail
					.then((data) => {
						console.log('ses reset pw success', data);
						return res.json({
							message: `Email has been sent to ${email}. Click on the link to reset your password`,
						});
					})
					.catch((error) => {
						console.log('ses reset pw failed', error);
						return res.json({
							message: `We could not vefiry your email. Try later.`,
						});
					});
			});
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server Error');
		}
	}
);

//@route    PUT api/reset-password
//@desc     reset password
//@access   Public
router.put(
	'/reset-password',
	resetPasswordValidator,
	runValidation,
	async (req, res) => {
		const { resetPasswordLink, newPassword } = req.body;
		if (resetPasswordLink) {

			// check for expiry
			jwt.verify(
				resetPasswordLink,
				process.env.JWT_RESET_PASSWORD,
				(err, success) => {
					if (err) {
						return res.status(400).json({
							error: 'Expired Link. Try again.',
						});
					}

					try {

						let user = await User.findOne({ resetPasswordLink })

						if (err || !user) {
							return res.status(400).json({
								error: 'Invalid token. Try again',
							});
						}

						const updatedFields = {
							password: newPassword,
							resetPasswordLink: '',
						};

						user = _.extend(user, updatedFields);

						user.save((err, result) => {
							if (err) {
								return res.status(400).json({
									error: 'Password reset failed. Try again',
								});
							}

							res.json({
								message: `Great! Now you can login with your new password`,
							});
						});
					} catch (err) {
						console.error(err.message);
						return res.status(500).send('Server Error');
					}
				}
			);
		}
	}
);

// router.get('/secret', requireSignin, (req, res) => {
//     res.json({
//         data: 'This is secret page for logged in users only'
//     });
// });

module.exports = router;
