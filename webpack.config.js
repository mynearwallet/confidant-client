'use strict';
const path = require('path');
const webpack = require("webpack");

new webpack.ProvidePlugin({
    process: 'process/browser',
    Buffer: ['buffer', 'Buffer'],
});


module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.join(process.cwd(), 'dist'),
        library: 'confidant-client',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            util: require.resolve('util/'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify')
        }
    },
    module: {
        rules: [
            { test: /\.ts?$/, loader: 'ts-loader' }
        ]
    }
};
