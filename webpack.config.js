/*
 * Copyright (C) Balena.io - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary and confidential.
 */
const path = require('path')
const nodeExternals = require('webpack-node-externals');

module.exports = {
    context: path.resolve(__dirname, './lib'),
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'build'),
        library: 'uiComponents',
        libraryTarget: 'umd'
    },
    mode: 'production',
    target: 'node',
    externals: [ nodeExternals() ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpg|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    }
};
