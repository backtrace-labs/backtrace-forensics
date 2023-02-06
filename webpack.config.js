const path = require('path');

function getModuleRules(env) {
    return {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{ loader: 'ts-loader' }, { loader: 'ifdef-loader', options: { ...env } }],
            },
        ],
    };
}

const base = {
    mode: process.env.NODE_ENV ?? 'development',
    entry: './src/index.ts',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
};

module.exports = [
    {
        ...base,
        target: 'node',
        output: {
            filename: 'backtrace-forensics.js',
            path: path.resolve(__dirname, 'lib'),
            libraryTarget: 'commonjs2',
        },
        module: getModuleRules({ TARGET: 'node' }),
    },
    {
        ...base,
        target: 'web',
        output: {
            filename: 'backtrace-forensics.web.js',
            path: path.resolve(__dirname, 'lib'),
        },
        module: getModuleRules({ TARGET: 'web' }),
    },
];
