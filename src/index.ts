import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';
import { createMcpHandler } from 'agents/mcp';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Sticks Server',
			version: '1.0',
		});

		registerAppResource(server, 'Stocks Widget', 'ui://stocks-ui', { description: 'UI of the stocks tool' }, async () => {
			return {
				contents: [
					{
						uri: 'ui://stocks-ui',
						text: '<html><body><h1>Hello world</h1></body></html>',
						mimeType: RESOURCE_MIME_TYPE,
					},
				],
			};
		});

		registerAppTool(
			server,
			'get-stock-price',
			{
				//
				description: 'Get the price of a stock given a ticker symbol.',
				// AI모델한테 이 tool에 argument가 필요하다고 알려주기 위해 사용
				inputSchema: {
					symbol: z.string(),
				},
				// registerAppTool로 텍스트 뿐만이 아니라 아래의 ui도 같이 보여달라고 말하게 되는 것
				_meta: {
					ui: {
						resourceUri: 'ui://stocks-ui',
					},
				},
			},
			async ({ symbol }) => {
				return {
					content: [
						{
							type: 'text',
							text: 'the price of ${symbol} is $10 USD.',
						},
					],
				};
			},
		);

		// transport mode - but way that MCP server and Ai communicate will change
		// handler works like doorman - which can people can communicate with our MCP server
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

// cb : 실제로 tool이 호출될 때 우리 서버에서 실행
