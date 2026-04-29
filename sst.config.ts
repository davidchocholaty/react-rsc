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

		// The demo runs locally; deploy is opt-in for the post-talk public URL.
		const web = new sst.aws.Nextjs('Web', {
			path: 'web'
		})

		return {
			Web: web.url
		}
	}
})
