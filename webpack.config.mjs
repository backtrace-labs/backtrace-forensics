import path from 'path';

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

/** @type {import('webpack').Configuration} */
const base = {
    mode: process.env.NODE_ENV ?? 'development',
    entry: './src/index.ts',
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
};

/** @type {import('webpack').Configuration} */
const node = {
    ...base,
    target: 'node',
    output: {
        filename: 'backtrace-forensics.cjs',
        path: path.resolve('.', 'lib'),
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate(info) {
            return path.relative('lib', info.absoluteResourcePath);
        },
    },
    module: getModuleRules({ TARGET: 'node' }),
    optimization: {
        minimize: false
    }
}

/** @type {(opts: { minimize: boolean, filename: string }) => import('webpack').Configuration} */
const web = ({ minimize, filename }) => (
    {
        ...base,
        target: 'web',
        output: {
            filename,
            path: path.resolve('.', 'lib'),
            library: {
                name: '@backtrace/forensics',
                type: 'amd',
            }
        },
        module: getModuleRules({ TARGET: 'web' }),
        optimization: {
            minimize
        }
    });

/** @type {import('webpack').Configuration[]} */
export default [
    node,
    web({ filename: 'backtrace-forensics.js', minimize: false }),
    web({ filename: 'backtrace-forensics.min.js', minimize: true }),
];
