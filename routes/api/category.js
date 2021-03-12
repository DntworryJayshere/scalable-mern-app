const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const formidable = require('formidable');
const uuidv4 = require('uuid/v4');
const AWS = require('aws-sdk');
const fs = require('fs');

// import models
const Category = require('../../models/category');
const Link = require('../../models/link');

// import validators
const {
	categoryCreateValidator,
	categoryUpdateValidator,
} = require('../../validators/category');
const { runValidation } = require('../../validators');

// import middleware
const { requireSignin, adminMiddleware } = require('../../middleware/auth');

// config AWS S3
const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

//@route    POST api/category
//@desc     post create catagort
//@access   Admin
router.post(
	'/category',
	categoryCreateValidator,
	runValidation,
	requireSignin,
	adminMiddleware,
	async (req, res) => {
		const { name, image, content } = req.body;
		// console.log({ name, image, content });
		// image data
		const base64Data = new Buffer.from(
			image.replace(/^data:image\/\w+;base64,/, ''),
			'base64'
		);
		const type = image.split(';')[0].split('/')[1];

		const slug = slugify(name);
		let category = new Category({ name, content, slug });

		const params = {
			Bucket: 'hackr-kaloraat',
			Key: `category/${uuidv4()}.${type}`,
			Body: base64Data,
			ACL: 'public-read',
			ContentEncoding: 'base64',
			ContentType: `image/${type}`,
		};

		s3.upload(params, (err, data) => {
			if (err) {
				console.log(err);
				res.status(400).json({ error: 'Upload to s3 failed' });
			}
			console.log('AWS UPLOAD RES DATA', data);
			category.image.url = data.Location;
			category.image.key = data.Key;
			// posted by
			category.postedBy = req.user._id;

			// save to db
			category.save((err, success) => {
				if (err) {
					console.log(err);
					res.status(400).json({ error: 'Duplicate category' });
				}
				return res.json(success);
			});
		});
	}
);

//@route    GET api/categories
//@desc     get list ************************************
//@access   Public
router.get('/categories', async (req, res) => {
	Category.find({}).exec((err, data) => {
		if (err) {
			return res.status(400).json({
				error: 'Categories could not load',
			});
		}
		res.json(data);
	});
});

//@route    POST api/category/:slug
//@desc     post ***************************************
//@access   Public
router.post('/category/:slug', async (req, res) => {
	const { slug } = req.params;
	let limit = req.body.limit ? parseInt(req.body.limit) : 10;
	let skip = req.body.skip ? parseInt(req.body.skip) : 0;

	Category.findOne({ slug })
		.populate('postedBy', '_id name username')
		.exec((err, category) => {
			if (err) {
				return res.status(400).json({
					error: 'Could not load category',
				});
			}
			// res.json(category);
			Link.find({ categories: category })
				.populate('postedBy', '_id name username')
				.populate('categories', 'name')
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(skip)
				.exec((err, links) => {
					if (err) {
						return res.status(400).json({
							error: 'Could not load links of a category',
						});
					}
					res.json({ category, links });
				});
		});
});

//@route    Put api/category/:slug
//@desc     put admin ********************************************
//@access   Admin
router.put(
	'/category/:slug',
	categoryUpdateValidator,
	runValidation,
	requireSignin,
	adminMiddleware,
	async (req, res) => {
		const { slug } = req.params;
		const { name, image, content } = req.body;

		// image data
		const base64Data = new Buffer.from(
			image.replace(/^data:image\/\w+;base64,/, ''),
			'base64'
		);
		const type = image.split(';')[0].split('/')[1];

		Category.findOneAndUpdate({ slug }, { name, content }, { new: true }).exec(
			(err, updated) => {
				if (err) {
					return res.status(400).json({
						error: 'Could not find category to update',
					});
				}
				console.log('UPDATED', updated);
				if (image) {
					// remove the existing image from s3 before uploading new/updated one
					const deleteParams = {
						Bucket: 'hackr-kaloraat',
						Key: `${updated.image.key}`,
					};

					s3.deleteObject(deleteParams, function (err, data) {
						if (err) console.log('S3 DELETE ERROR DUING UPDATE', err);
						else console.log('S3 DELETED DURING UPDATE', data); // deleted
					});

					// handle upload image
					const params = {
						Bucket: 'hackr-kaloraat',
						Key: `category/${uuidv4()}.${type}`,
						Body: base64Data,
						ACL: 'public-read',
						ContentEncoding: 'base64',
						ContentType: `image/${type}`,
					};

					s3.upload(params, (err, data) => {
						if (err) {
							console.log(err);
							res.status(400).json({ error: 'Upload to s3 failed' });
						}
						console.log('AWS UPLOAD RES DATA', data);
						updated.image.url = data.Location;
						updated.image.key = data.Key;

						// save to db
						updated.save((err, success) => {
							if (err) {
								console.log(err);
								res.status(400).json({ error: 'Duplicate category' });
							}
							res.json(success);
						});
					});
				} else {
					res.json(updated);
				}
			}
		);
	}
);

//@route    DELETE api/category/:slug
//@desc     delete admin *********************************
//@access   Admin
router.delete(
	'/category/:slug',
	requireSignin,
	adminMiddleware,
	async (req, res) => {
		const { slug } = req.params;

		Category.findOneAndRemove({ slug }).exec((err, data) => {
			if (err) {
				return res.status(400).json({
					error: 'Could not delete category',
				});
			}
			// remove the existing image from s3 before uploading new/updated one
			const deleteParams = {
				Bucket: 'hackr-kaloraat',
				Key: `${data.image.key}`,
			};

			s3.deleteObject(deleteParams, function (err, data) {
				if (err) console.log('S3 DELETE ERROR DUING', err);
				else console.log('S3 DELETED DURING', data); // deleted
			});

			res.json({
				message: 'Category deleted successfully',
			});
		});
	}
);

module.exports = router;
