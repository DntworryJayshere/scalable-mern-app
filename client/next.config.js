const withCSS = require('@zeit/next-css');
module.exports = withCSS({
	publicRuntimeConfig: {
		APP_NAME: 'NODE-REACT-AWS',
		API: 'http://localhost:8000/api',
		PRODUCTION: false,
		DOMAIN: 'http://localhost:3000',
	},
});

// const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

// module.exports = (phase, { defaultConfig }) => {
// 	if (phase === PHASE_DEVELOPMENT_SERVER) {
// 		return {
// 			publicRuntimeConfig: {
// 				APP_NAME: 'scalable-mern-app',
// 				API: 'http://localhost:8000/api',
// 				PRODUCTION: false,
// 				DOMAIN: 'http://localhost:3000',
// 			},
// 		};
// 	}

// 	return {
// 		publicRuntimeConfig: {
// 			APP_NAME: 'scalable-mern-app',
// 			API: '/api',
// 			PRODUCTION: false,
// 			DOMAIN: 'http://scalableapp.cloud',
// 		},
// 	};
// };
