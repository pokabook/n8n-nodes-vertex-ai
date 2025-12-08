import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class VertexAiApi implements ICredentialType {
	name = 'vertexAiApi';
	displayName = 'Vertex AI API';
	documentationUrl = 'https://cloud.google.com/vertex-ai/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'Project ID',
			name: 'projectId',
			type: 'string',
			default: '',
			required: true,
			description: 'Google Cloud Project ID',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{ name: 'us-central1 (Iowa) - 추천', value: 'us-central1' },
				{ name: 'us-east1 (South Carolina)', value: 'us-east1' },
				{ name: 'us-east4 (Northern Virginia)', value: 'us-east4' },
				{ name: 'us-west1 (Oregon)', value: 'us-west1' },
				{ name: 'europe-west1 (Belgium)', value: 'europe-west1' },
				{ name: 'europe-west4 (Netherlands)', value: 'europe-west4' },
				{ name: 'asia-northeast1 (Tokyo)', value: 'asia-northeast1' },
				{ name: 'asia-northeast3 (Seoul)', value: 'asia-northeast3' },
				{ name: 'asia-southeast1 (Singapore)', value: 'asia-southeast1' },
			],
			default: 'us-central1',
			required: true,
			description: 'Vertex AI 리전. 최신 모델은 us-central1에서 가장 먼저 지원됩니다.',
		},
		{
			displayName: 'Service Account Key (JSON)',
			name: 'serviceAccountKey',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 5,
			},
			default: '',
			required: true,
			placeholder: '{"type": "service_account", "project_id": "...", ...}',
			description:
				'Google Cloud Console에서 다운로드한 서비스 계정 키 JSON 파일의 전체 내용을 복사하여 붙여넣기 하세요',
		},
	];
}

