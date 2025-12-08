import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';
import { VertexAI as VertexAIClient, Part, Content } from '@google-cloud/vertexai';

interface ServiceAccountKey {
	type: string;
	project_id: string;
	private_key_id: string;
	private_key: string;
	client_email: string;
	client_id: string;
	auth_uri: string;
	token_uri: string;
}

interface ChatMessage {
	role: string;
	content: string;
}

export class VertexAI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Vertex AI',
		name: 'vertexAI',
		icon: 'file:vertex-ai.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Google Vertex AI Gemini API',
		defaults: {
			name: 'Vertex AI',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'vertexAiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate Text',
						value: 'generateText',
						description: 'Generate text from a prompt',
						action: 'Generate text from a prompt',
					},
					{
						name: 'Chat',
						value: 'chat',
						description: 'Have a multi-turn conversation',
						action: 'Have a multi turn conversation',
					},
					{
						name: 'Multimodal',
						value: 'multimodal',
						description: 'Process text and images together',
						action: 'Process text and images together',
					},
				],
				default: 'generateText',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{ name: 'Gemini 3 Pro (Preview)', value: 'gemini-3-pro-preview' },
					{ name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
					{ name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
					{ name: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
					{ name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash-001' },
					{ name: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite-001' },
					{ name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro-002' },
					{ name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash-002' },
				],
				default: 'gemini-2.5-flash',
				description: 'The Gemini model to use',
			},
			// Generate Text
			{
				displayName: 'Prompt',
				name: 'prompt',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['generateText'],
					},
				},
				description: 'The text prompt to send to the model',
			},
			// Chat
			{
				displayName: 'Messages',
				name: 'messages',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						operation: ['chat'],
					},
				},
				options: [
					{
						name: 'messageValues',
						displayName: 'Message',
						values: [
							{
								displayName: 'Role',
								name: 'role',
								type: 'options',
								options: [
									{ name: 'User', value: 'user' },
									{ name: 'Model', value: 'model' },
								],
								default: 'user',
							},
							{
								displayName: 'Content',
								name: 'content',
								type: 'string',
								typeOptions: {
									rows: 2,
								},
								default: '',
							},
						],
					},
				],
				description: 'The conversation messages',
			},
			// Multimodal
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						operation: ['multimodal'],
					},
				},
				description: 'The text to send with the image',
			},
			{
				displayName: 'Image Source',
				name: 'imageSource',
				type: 'options',
				options: [
					{ name: 'Binary Data', value: 'binary' },
					{ name: 'URL', value: 'url' },
					{ name: 'Base64', value: 'base64' },
				],
				default: 'binary',
				displayOptions: {
					show: {
						operation: ['multimodal'],
					},
				},
			},
			{
				displayName: 'Binary Property',
				name: 'binaryProperty',
				type: 'string',
				default: 'data',
				displayOptions: {
					show: {
						operation: ['multimodal'],
						imageSource: ['binary'],
					},
				},
				description: 'Name of the binary property containing the image',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['multimodal'],
						imageSource: ['url'],
					},
				},
			},
			{
				displayName: 'Base64 Image',
				name: 'base64Image',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['multimodal'],
						imageSource: ['base64'],
					},
				},
				description: 'Base64 encoded image data (without data:image prefix)',
			},
			// Options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Output Tokens',
						name: 'maxOutputTokens',
						type: 'number',
						default: 2048,
						description: 'Maximum number of tokens to generate',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberStepSize: 0.1,
						},
						default: 1,
						description: 'Controls randomness (0-2)',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
							numberStepSize: 0.1,
						},
						default: 0.95,
						description: 'Nucleus sampling threshold',
					},
					{
						displayName: 'Top K',
						name: 'topK',
						type: 'number',
						default: 40,
						description: 'Top-k sampling threshold',
					},
					{
						displayName: 'System Instruction',
						name: 'systemInstruction',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'System instruction to guide the model behavior',
					},
					{
						displayName: 'Thinking Level (Gemini 3 only)',
						name: 'thinkingLevel',
						type: 'options',
						options: [
							{ name: 'None', value: 'none' },
							{ name: 'Low', value: 'low' },
							{ name: 'High', value: 'high' },
						],
						default: 'none',
						description: 'Controls the amount of internal reasoning for Gemini 3 models. Use "low" or "high" to enable thinking.',
					},
				],
			},
			// Structured Output Section
			{
				displayName: 'Response Format',
				name: 'responseFormat',
				type: 'options',
				options: [
					{ name: 'Plain Text', value: 'text/plain' },
					{ name: 'JSON', value: 'application/json' },
					{ name: 'Enum', value: 'text/x.enum' },
				],
				default: 'text/plain',
				description: '응답 형식을 지정합니다. JSON 또는 Enum 선택 시 스키마 설정이 필요합니다.',
			},
			{
				displayName: 'Schema Mode',
				name: 'schemaMode',
				type: 'options',
				options: [
					{ name: 'Simple (UI)', value: 'simple' },
					{ name: 'Advanced (JSON Schema)', value: 'advanced' },
				],
				default: 'simple',
				displayOptions: {
					show: {
						responseFormat: ['application/json', 'text/x.enum'],
					},
				},
				description: '스키마 입력 방식을 선택합니다. Simple은 UI로 쉽게 설정, Advanced는 JSON 스키마 직접 입력.',
			},
			// Simple Mode - Enum Values
			{
				displayName: 'Enum Values',
				name: 'enumValues',
				type: 'string',
				default: '',
				placeholder: 'positive, negative, neutral',
				displayOptions: {
					show: {
						responseFormat: ['text/x.enum'],
						schemaMode: ['simple'],
					},
				},
				description: '콤마로 구분된 Enum 값들을 입력하세요. 예: positive, negative, neutral',
			},
			// Simple Mode - Object Properties
			{
				displayName: 'Schema Properties',
				name: 'schemaProperties',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				displayOptions: {
					show: {
						responseFormat: ['application/json'],
						schemaMode: ['simple'],
					},
				},
				description: 'JSON 응답의 속성들을 정의합니다. "Add Property" 버튼을 클릭하여 원하는 필드를 추가하세요.',
				options: [
					{
						name: 'properties',
						displayName: 'Property',
						values: [
							{
								displayName: 'Property Name',
								name: 'name',
								type: 'string',
								default: '',
								placeholder: 'name, email, age, ...',
								description: '속성 이름 (영문 권장)',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'String (텍스트)', value: 'string' },
									{ name: 'Number (소수점 숫자)', value: 'number' },
									{ name: 'Integer (정수)', value: 'integer' },
									{ name: 'Boolean (참/거짓)', value: 'boolean' },
									{ name: 'Array of Strings (텍스트 배열)', value: 'array_string' },
									{ name: 'Array of Numbers (숫자 배열)', value: 'array_number' },
									{ name: 'Object (중첩 객체 - Advanced 모드 권장)', value: 'object' },
								],
								default: 'string',
								description: '이 속성에 들어갈 값의 타입',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								placeholder: '이 필드에 대한 설명...',
								description: '속성 설명 (AI가 더 정확한 값을 생성하는 데 도움이 됩니다)',
							},
							{
								displayName: 'Required (필수 여부)',
								name: 'required',
								type: 'boolean',
								default: true,
								description: '이 속성이 반드시 포함되어야 하는지 여부',
							},
							{
								displayName: 'Nullable (null 허용)',
								name: 'nullable',
								type: 'boolean',
								default: false,
								description: '값을 찾을 수 없을 때 null을 허용할지 여부',
							},
							{
								displayName: 'Allowed Values (허용 값 목록)',
								name: 'enumValues',
								type: 'string',
								default: '',
								placeholder: 'option1, option2, option3',
								description: '이 속성에 허용되는 값들만 지정 (String 타입에서만 사용, 콤마로 구분). 비워두면 모든 값 허용',
							},
						],
					},
				],
			},
			// Advanced Mode - Raw JSON Schema
			{
				displayName: 'Response Schema (JSON)',
				name: 'responseSchema',
				type: 'json',
				default: '',
				displayOptions: {
					show: {
						responseFormat: ['application/json', 'text/x.enum'],
						schemaMode: ['advanced'],
					},
				},
				description: 'JSON 스키마 형식으로 응답 구조를 정의합니다. 예: {"type": "OBJECT", "properties": {"name": {"type": "STRING"}}, "required": ["name"]}',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('vertexAiApi');
		const projectId = credentials.projectId as string;
		const region = credentials.region as string;
		const serviceAccountKeyStr = credentials.serviceAccountKey as string;

		let serviceAccountKey: ServiceAccountKey;
		try {
			serviceAccountKey = JSON.parse(serviceAccountKeyStr);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid Service Account Key JSON. Please paste the entire JSON content from your service account key file.',
			);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const model = this.getNodeParameter('model', i) as string;

				// Get structured output parameters (outside of options)
				const responseFormat = this.getNodeParameter('responseFormat', i, 'text/plain') as string;
				const schemaMode = this.getNodeParameter('schemaMode', i, 'simple') as string;
				const enumValues = this.getNodeParameter('enumValues', i, '') as string;

				interface SchemaProperty {
					name: string;
					type: string;
					description?: string;
					required?: boolean;
					nullable?: boolean;
					enumValues?: string;
				}

				const schemaProperties = this.getNodeParameter('schemaProperties', i, {}) as {
					properties?: SchemaProperty[];
				};
				const responseSchema = this.getNodeParameter('responseSchema', i, '') as string;

				const options = this.getNodeParameter('options', i, {}) as {
					maxOutputTokens?: number;
					temperature?: number;
					topP?: number;
					topK?: number;
					systemInstruction?: string;
					thinkingLevel?: string;
				};

				// Preview models (like gemini-3-pro-preview) require global region
				const isPreviewModel = model.includes('preview');
				const isGemini3 = model.includes('gemini-3');
				const location = isPreviewModel ? 'global' : region;

				// Initialize Vertex AI client with appropriate location and endpoint
				const vertexAI = new VertexAIClient({
					project: projectId,
					location,
					apiEndpoint: isPreviewModel ? 'aiplatform.googleapis.com' : undefined,
					googleAuthOptions: {
						credentials: serviceAccountKey,
					},
				});

				// Build generation config
				const generationConfig: Record<string, unknown> = {
					maxOutputTokens: options.maxOutputTokens || 2048,
					temperature: options.temperature ?? 1,
					topP: options.topP ?? 0.95,
					topK: options.topK ?? 40,
				};

				// Add thinking config for Gemini 3 models
				if (isGemini3 && options.thinkingLevel && options.thinkingLevel !== 'none') {
					generationConfig.thinkingConfig = {
						thinkingLevel: options.thinkingLevel.toUpperCase(),
					};
				}

				// Add structured output config
				if (responseFormat && responseFormat !== 'text/plain') {
					generationConfig.responseMimeType = responseFormat;

					if (schemaMode === 'simple') {
						// Simple mode: Build schema from UI inputs
						if (responseFormat === 'text/x.enum') {
							// Enum mode
							if (enumValues) {
								const enumArray = enumValues.split(',').map((v) => v.trim()).filter((v) => v);
								if (enumArray.length > 0) {
									generationConfig.responseSchema = {
										type: 'STRING',
										enum: enumArray,
									};
								}
							}
						} else if (responseFormat === 'application/json') {
							// JSON Object mode
							const schemaProps = schemaProperties?.properties || [];
							if (schemaProps.length > 0) {
								const properties: Record<string, Record<string, unknown>> = {};
								const required: string[] = [];

								for (const prop of schemaProps) {
									if (!prop.name) continue;

									let propSchema: Record<string, unknown> = {};

									// Handle different types
									if (prop.type === 'array_string') {
										propSchema = { type: 'ARRAY', items: { type: 'STRING' } };
									} else if (prop.type === 'array_number') {
										propSchema = { type: 'ARRAY', items: { type: 'NUMBER' } };
									} else {
										propSchema = { type: prop.type.toUpperCase() };
									}

									// Add description if provided
									if (prop.description) {
										propSchema.description = prop.description;
									}

									// Add nullable if true
									if (prop.nullable) {
										propSchema.nullable = true;
									}

									// Add enum values for string type
									if (prop.type === 'string' && prop.enumValues) {
										const enumArray = prop.enumValues.split(',').map((v) => v.trim()).filter((v) => v);
										if (enumArray.length > 0) {
											propSchema.enum = enumArray;
										}
									}

									properties[prop.name] = propSchema;

									if (prop.required) {
										required.push(prop.name);
									}
								}

								generationConfig.responseSchema = {
									type: 'OBJECT',
									properties,
									...(required.length > 0 && { required }),
								};
							}
						}
					} else {
						// Advanced mode: Use raw JSON schema
						if (responseSchema) {
							try {
								generationConfig.responseSchema = JSON.parse(responseSchema);
							} catch {
								throw new NodeOperationError(
									this.getNode(),
									'Invalid Response Schema JSON. Please provide a valid JSON schema.',
									{ itemIndex: i },
								);
							}
						}
					}
				}

				// Get generative model with configuration
				const generativeModel = vertexAI.getGenerativeModel({
					model,
					generationConfig,
					systemInstruction: options.systemInstruction
						? { role: 'system', parts: [{ text: options.systemInstruction }] }
						: undefined,
				});

				let contents: Content[];

				if (operation === 'generateText') {
					const prompt = this.getNodeParameter('prompt', i) as string;
					contents = [{ role: 'user', parts: [{ text: prompt }] }];
				} else if (operation === 'chat') {
					const messagesData = this.getNodeParameter('messages', i, {}) as {
						messageValues?: ChatMessage[];
					};
					const messages = messagesData.messageValues || [];
					contents = messages.map((msg) => ({
						role: msg.role,
						parts: [{ text: msg.content }],
					}));
				} else {
					// multimodal
					const text = this.getNodeParameter('text', i, '') as string;
					const imageSource = this.getNodeParameter('imageSource', i) as string;

					let imagePart: Part;

					if (imageSource === 'binary') {
						const binaryProperty = this.getNodeParameter('binaryProperty', i) as string;
						const binaryData = this.helpers.assertBinaryData(i, binaryProperty);
						const buffer = await this.helpers.getBinaryDataBuffer(i, binaryProperty);
						imagePart = {
							inlineData: {
								mimeType: binaryData.mimeType || 'image/png',
								data: buffer.toString('base64'),
							},
						};
					} else if (imageSource === 'url') {
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						// For URL, we can use fileData part
						imagePart = {
							fileData: {
								fileUri: imageUrl,
								mimeType: 'image/jpeg',
							},
						};
					} else {
						const base64 = this.getNodeParameter('base64Image', i) as string;
						imagePart = {
							inlineData: {
								mimeType: 'image/png',
								data: base64.replace(/^data:image\/\w+;base64,/, ''),
							},
						};
					}

					contents = [
						{
							role: 'user',
							parts: [
								{ text: text || 'Describe this image' },
								imagePart,
							],
						},
					];
				}

				// Generate content using the SDK
				const result = await generativeModel.generateContent({ contents });
				const response = result.response;

				const generatedText =
					response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

				// Parse JSON response if structured output is enabled
				let parsedJson = null;
				if (responseFormat === 'application/json' && generatedText) {
					try {
						parsedJson = JSON.parse(generatedText);
					} catch {
						// If parsing fails, keep parsedJson as null
					}
				}

				returnData.push({
					json: {
						text: generatedText,
						...(parsedJson !== null && { json: parsedJson }),
						model,
						operation,
						usage: response?.usageMetadata,
						safetyRatings: response?.candidates?.[0]?.safetyRatings,
						finishReason: response?.candidates?.[0]?.finishReason,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					`Vertex AI Error: ${(error as Error).message}`,
					{ itemIndex: i },
				);
			}
		}

		return [returnData];
	}
}
