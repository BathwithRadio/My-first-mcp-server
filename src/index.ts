import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import z from 'zod';
import { createMcpHandler } from 'agents/mcp';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';

const widgetHtml = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f0f4f8;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 320px;
      width: 100%;
    }
    .city { font-size: 1.5rem; font-weight: 600; color: #1a202c; }
    .temp { font-size: 3rem; font-weight: 700; color: #2d3748; margin: 0.5rem 0; }
    .desc { font-size: 1rem; color: #718096; }
    .loading { color: #718096; }
  </style>
</head>
<body>
  <div class="card" id="price-card">
    <p class="loading">Loading stock price…</p>
  </div>

  <script type="module">
  // initialize the app
  import { App } from "https://esm.sh/@modelcontextprotocol/ext-apps/app-with-deps";

  const app = new App (
  	{name: 'Stocks App', version: '1.0'}
  )

  app.ontoolresult = ({structuredContent}) => {
  	if(!structuredContent) return;
  	document.getElementById("price-card").innerHTML = structuredContent.price;
  }

  app.connect();

  </script>
</body>
</html>`;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// initialize the server
		const server = new McpServer({
			name: 'Sticks Server',
			version: '1.0',
		});

		registerAppResource(server, 'Stocks Widget', 'ui://stocks-ui', { description: 'UI of the stocks tool' }, async () => {
			return {
				contents: [
					{
						uri: 'ui://stocks-ui',
						text: widgetHtml,
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
					//widget에도 데이타를 보내고 싶은 경우
					structuredContent: {
						price: 10,
					},
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
