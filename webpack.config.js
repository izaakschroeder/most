
var path = require('path');

module.exports = {
	entry: './most',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'most.js',
		library: 'most.js',
		libraryTarget: 'umd'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loaders: [
				'babel-loader?optional[]=runtime&optional[]=optimisation.react.constantElements&optional[]=es7.classProperties&optional[]=es7.decorators'
			]
		}]
	},
	devtool: 'source-map'
};
