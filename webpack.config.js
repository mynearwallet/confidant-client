'use strict';
const path = require('path');
const webpack = require("webpack");

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.join(process.cwd(), 'dist'),
        library: 'confidant-client',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    plugins: [
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            util: require.resolve('util/'),
            path: require.resolve('path-browserify'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer'),
        }
    },
    module: {
        rules: [
            { test: /\.ts?$/, loader: 'ts-loader' }
        ]
    }
};
