/// <reference path="./.sst/platform/config.d.ts" />

//this is prepared for cases where the git stage should be part of the url
//const { stageToUrlPart } = await import('./packages/sst-extensions/src/index')

export default $config({
	app(input) {
		return {
			name: 'purple-stack',
			removal: input?.stage === 'master' ? 'retain' : 'remove',
			protect: ['master', 'staging'].includes(input?.stage),
			home: 'aws',
			providers: {
				aws: {
					region: 'eu-central-1'
				}
			}
		}
	},
	async run() {
		$transform(sst.aws.Function, (args) => {
			args.runtime = 'nodejs22.x'
		})

		// Web is a Vite stub between U1 and U2; U2 replaces this with sst.aws.Nextjs.
		const web = new sst.aws.StaticSite('Web', {
			build: {
				command: 'pnpm run --filter @purple-stack/web build',
				output: 'web/dist'
			},
			dev: {
				autostart: true,
				command: 'pnpm --filter @purple-stack/web dev',
				directory: 'web'
			}
		})

		return {
			Web: web.url
		}
	}
})
