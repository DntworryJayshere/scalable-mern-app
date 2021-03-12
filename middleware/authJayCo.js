const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
	//get token from the header
	const token = req.header('x-auth-token');

	//check if theres no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// Verify token
	try {
		jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
			if (error) {
				return res.status(401).json({ msg: 'Token is not valid' });
			} else {
				req.user = decoded.user;
				next();
			}
		});
	} catch (err) {
		console.error('something wrong with auth middleware');
		res.status(500).json({ msg: 'Server Error' });
	}
};
