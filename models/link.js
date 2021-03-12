const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkSchema = new Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
			max: 256,
		},
		url: {
			type: String,
			trim: true,
			required: true,
			max: 256,
		},
		slug: {
			type: String,
			lowercase: true,
			required: true,
			index: true,
		},
		postedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		categories: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Category',
				required: true,
			},
		],
		type: {
			type: String,
			default: 'Free',
		},
		medium: {
			type: String,
			default: 'Video',
		},
		clicks: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

const Link = mongoose.model('Link', linkSchema);
module.exports = Link;
