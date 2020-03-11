
import * as webpack from 'webpack';
import * as path from 'path';
import { CliContext } from '../../context';
import { existsSync } from 'fs-extra';
import { getWebpackConfig, getConfig } from '../utils';
import { FRONTEND_TARGET } from '../../constants';
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

export class CopyWepackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;
        const assets = [];
        for (const assert of (pkg as any)[`${target}Assets`].values()) {
            const p = path.join(pkg.projectPath, 'node_modules', assert);
            if (existsSync(p)) {
                assets.push(p);
            } else if (existsSync(assert)) {
                assets.push(assert);
            }
        }

        return {
            plugins: [
                new CopyPlugin(assets.map(assert => ({
                    from: assert,
                    to: path.join(config.output.path, 'assets')
                }))),
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class EnvironmentPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;

        return {
            plugins: [
                new webpack.EnvironmentPlugin({
                    'MALAGU_CONFIG': getConfig(pkg, target)
                }),
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class ForkTsCheckerWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;

        return {
            plugins: [
                new ForkTsCheckerWebpackPlugin({ ...{ eslint: true }, ...getWebpackConfig(pkg, target).forkTSCheckerWebpackPlugin || {} }),
                new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HardSourceWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;

        return {
            plugins: [
                new HardSourceWebpackPlugin({
                    ...getWebpackConfig(pkg, target).hardSourceWebpackPlugin || {}
                })
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return true;
    }
}

export class HtmlWebpackPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;
        return {
            plugins: [
                new HtmlWebpackPlugin({ ...{ title: 'Malagu App' }, ...getWebpackConfig(pkg, FRONTEND_TARGET).htmlWebpackPlugin || {} }),
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}

export class HtmlWebpackTagsPluginConfigFactory {
    create(config: any, context: CliContext, target: string) {
        const { pkg } = context;
        const pluginConfig = getWebpackConfig(pkg, FRONTEND_TARGET).htmlWebpackTagsPlugin || {};
        const before = [];
        const after = [];
        for (const key in pluginConfig) {
            if (pluginConfig.hasOwnProperty(key)) {
                let c = pluginConfig[key];
                if (typeof c === 'string') {
                    c = {
                        tags: {
                            path: c,
                            attributes: { crossorigin: true }
                        },
                        append: false
                    };
                }
                if (c.append) {
                    after.push(c);
                } else {
                    before.push(c);
                }
            }
        }

        return {
            plugins: [
                ...[...after, ...before.reverse()].map(c => new HtmlWebpackTagsPlugin(c))
            ]
        };
    }

    support(context: CliContext, target: string): boolean {
        return FRONTEND_TARGET === target;
    }
}