var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var context = __dirname;
// The directory that generated bundles will be placed in
var outputDir = path.join(__dirname, 'js');
var moduleOpts = {
    // Inform webpack to not parse the jQuery library, this is an
    // an optimisation which helps to reduce the build time associated
    // with large libraries
    noParse: [
        /jquery/
    ],
    // Inform webpack to use the babel loader when reading files
    // ending in '.jsx'
    loaders: [
        {test: /\.html$/, loader: 'raw-loader',exclude:/node_modules/},
        {test: /\.jsx$/, exclude: /node_modules/, loader: 'babel-loader'},
        {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'},
        {test: /\.css$/, exclude: /node_modules/, 
            loader: 'style-loader!css-loader'},
            // loader: ExtractTextPlugin.extract('style-loader','css-loader') },
        {test: /\.scss$/, exclude: /node_modules/, 
            loader: 'style-loader!css-loader!sass-loader'},

            // loader: ExtractTextPlugin.enpxtract('style-loader','css-loader!sass-loader')},
    ]
};

module.exports = [
    // -----------------
    //   Client side
    // -----------------
    {
        context: context,
        entry: {
            'request_payment':['./jsx/request_payment/main.jsx'],
            'user_application':['./angular_app/user_application/app.js']
        },
        output: {
            path: outputDir,
            filename: '[name].js',
            // A global variable that the bundle will be exposed as
            library: 'main'
        },
        module: moduleOpts,
        devtool: 'eval',
        plugins: [
            // new ExtractTextPlugin('request_received.css')
        ],

    },
    // -----------------
    //    Server side
    // -----------------
    {
        context: context,
        entry: {
            'request_payment': ['./jsx/request_payment/components/PageBox.jsx']
        },
        output: {
            path: outputDir,
            filename: '[name].server.js',
            libraryTarget: 'commonjs2'
        },
        module: moduleOpts
    }];