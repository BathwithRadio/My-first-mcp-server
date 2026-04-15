import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';
import { createMcpHandler } from 'agents/mcp';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const server = new McpServer({
			name: 'Sticks Server',
			version: '1.0',
		});

		server.registerTool(
			'get-stock-price',
			{
				//
				description: 'Get the price of a stock given a ticker symbol.',
				// AI모델한테 이 tool에 argument가 필요하다고 알려주기 위해 사용
				inputSchema: {
					symbol: z.string(),
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
