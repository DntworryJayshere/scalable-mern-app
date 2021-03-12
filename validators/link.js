const { check } = require('express-validator');

exports.linkCreateValidator = [
	check('title', 'Title is required').not().isEmpty(),
	check('url', 'URL is required').not().isEmpty(),
	check('categories', 'Pick a category').not().isEmpty(),
	check('type', 'Pick a type free/paid').not().isEmpty(),
	check('medium', 'Pick a medium video/book').not().isEmpty(),
];

exports.linkUpdateValidator = [
	check('title', 'Title is required').not().isEmpty(),
	check('url', 'URL is required').not().isEmpty(),
	check('categories', 'Pick a category').not().isEmpty(),
	check('type', 'Pick a type free/paid').not().isEmpty(),
	check('medium', 'Pick a medium video/book').not().isEmpty(),
];
