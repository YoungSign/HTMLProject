const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

// the path(s) that should be cleaned
let pathsToClean = ['dist'];

// the clean options to use
let cleanOptions = {
    root: path.resolve(__dirname),
    // exclude: ['shared.js'],
    verbose: true,
    dry: false,
};

module.exports = {
    resolve: {
        extensions: ['.js', '.ts', '.json'],
    },
    mode: 'production', //'development',
    entry: {
        'TeatalkSdk': './src/TeatalkSdk.js'
    },
    output: {
        filename: '[name].[chunkhash].js',// 生成的fiename需要与package.json中的main一致
        path: path.resolve(__dirname, 'dist'),
        // libraryTarget: 'commonjs',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            // {
            //     test: /\.ts?$/,
            //     use: [
            //         {
            //             loader: 'tslint-loader',
            //             options: {
            //                 configFile: path.resolve(__dirname, './tslint.json'),
            //             },
            //         },
            //     ],
            //     exclude: /node_modules/,
            // },
            {
                test: /\.ts?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // 指定特定的ts编译配置，为了区分脚本的ts配置
                            configFile: path.resolve(__dirname, './tsconfig.json'),
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [new CleanWebpackPlugin(pathsToClean, cleanOptions)],
};