const path = require('path'),
	loaderUtils = require('loader-utils')

const hashOnlyIdent = (context, _, exportName) => {
	let hash = loaderUtils
		.getHashDigest(
			Buffer.from(
				`filePath:${path
					.relative(context.rootContext, context.resourcePath)
					.replace(/\\+/g, '/')}#className:${exportName}`,
			),
			'md4',
			'base64',
			10,
		)
	hash = hash.replace(/^(-?\d|--)/, '_$1')
	return `css_${hash}`
}

module.exports = {
	webpack(config, { dev }) {
		const rules = config.module.rules
			.find((rule) => typeof rule.oneOf === 'object')
			.oneOf.filter((rule) => Array.isArray(rule.use))

		rules.forEach((rule) => {
			rule.use.forEach((moduleLoader) => {
				if (
					moduleLoader.loader?.includes('css-loader') &&
					!moduleLoader.loader?.includes('postcss-loader')
				)
					moduleLoader.options.modules.getLocalIdent = hashOnlyIdent
			})
		})
		return config
	},
	reactStrictMode: true
}
