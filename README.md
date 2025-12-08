# n8n-nodes-vertex-ai

[English](#english) | [한국어](#한국어)

---

# English

A community node for n8n that integrates with Google Vertex AI (Gemini models).

This node allows you to use Google's powerful Gemini AI models directly in your n8n workflows.

## Features

- **Text Generation**: Generate text responses from prompts
- **Chat**: Have multi-turn conversations with context
- **Multimodal**: Process images along with text (vision capabilities)
- **Structured Output**: Get responses in JSON or Enum format with schema validation
- **Latest Models**: Support for Gemini 3, 2.5, 2.0, and 1.5 series

### Supported Models

| Model | Description |
|-------|-------------|
| Gemini 3 Pro (Preview) | Latest and most capable model with thinking capabilities |
| Gemini 2.5 Pro | High capability model for complex tasks |
| Gemini 2.5 Flash | Fast and efficient for most use cases (Recommended) |
| Gemini 2.5 Flash Lite | Lightweight version for simple tasks |
| Gemini 2.0 Flash | Previous generation fast model |
| Gemini 2.0 Flash Lite | Previous generation lightweight model |
| Gemini 1.5 Pro | Stable production model |
| Gemini 1.5 Flash | Stable fast model |

## Installation

### In n8n

1. Go to **Settings** > **Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-vertex-ai`
4. Click **Install**

### Manual Installation

```bash
# In your n8n installation directory
npm install n8n-nodes-vertex-ai
```

## Setup Guide

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** at the top
3. Click **New Project**
4. Enter a project name and click **Create**

### Step 2: Enable Vertex AI API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Vertex AI API"
3. Click on it and then click **Enable**

### Step 3: Create a Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Enter a name (e.g., "n8n-vertex-ai")
4. Click **Create and Continue**
5. Add the role: **Vertex AI User**
6. Click **Done**

### Step 4: Create a Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** and click **Create**
5. A JSON file will be downloaded - **keep this file safe!**

### Step 5: Configure Credentials in n8n

1. In n8n, go to **Credentials**
2. Click **Add Credential**
3. Search for "Vertex AI API"
4. Fill in the fields:
   - **Project ID**: Your Google Cloud project ID (found in the downloaded JSON as `project_id`)
   - **Region**: Select a region (us-central1 is recommended for latest model support)
   - **Service Account Key**: Copy and paste the **entire content** of the downloaded JSON file

## Usage Examples

### Example 1: Simple Text Generation

1. Add a **Vertex AI** node to your workflow
2. Select **Generate Text** operation
3. Choose a model (e.g., Gemini 2.5 Flash)
4. Enter your prompt:
   ```
   Write a short poem about automation
   ```
5. Execute the node

### Example 2: Sentiment Analysis with Structured Output

1. Add a **Vertex AI** node
2. Select **Generate Text** operation
3. In **Options**, set:
   - **Response Format**: Enum
   - **Schema Mode**: Simple (UI)
   - **Enum Values**: `positive, negative, neutral`
4. Enter your prompt:
   ```
   Analyze the sentiment of this text: "I love using n8n for automation!"
   ```

### Example 3: Extract Data as JSON

1. Add a **Vertex AI** node
2. Select **Generate Text** operation
3. In **Options**, set:
   - **Response Format**: JSON
   - **Schema Mode**: Simple (UI)
   - Add properties in **Schema Properties**:
     - name (String, Required)
     - email (String, Required)
     - company (String, Nullable)
4. Enter your prompt:
   ```
   Extract contact information from this text:
   "Hi, I'm John Smith from Acme Corp. You can reach me at john@acme.com"
   ```

### Example 4: Image Analysis

1. Add an **HTTP Request** node to fetch an image (or use a file node)
2. Add a **Vertex AI** node
3. Select **Multimodal** operation
4. Set **Image Source** to **Binary Data**
5. Enter text like: "Describe what you see in this image"

## Structured Output Guide

Structured Output allows you to get AI responses in a specific format (JSON or Enum). This is useful when you need to process the AI's response in subsequent workflow steps.

### When to Use Structured Output

| Use Case | Response Format | Example |
|----------|-----------------|---------|
| Classification (choosing from options) | Enum | Sentiment analysis, categorization |
| Extracting structured data | JSON | Parsing contact info, product details |
| Getting specific fields | JSON | Name extraction, data normalization |

### Using Enum Format (Classification)

Best for when you want the AI to choose ONE value from a list of options.

**Steps:**
1. In **Options**, click **Add Option**
2. Select **Response Format** → choose **Enum**
3. **Schema Mode** will appear → keep it as **Simple (UI)**
4. **Enum Values** will appear → enter your options separated by commas

**Example - Sentiment Analysis:**
```
Enum Values: positive, negative, neutral
```

**Example - Category Classification:**
```
Enum Values: bug, feature request, question, other
```

### Using JSON Format (Data Extraction)

Best for when you want to extract multiple pieces of information in a structured way.

**Steps:**
1. In **Options**, click **Add Option**
2. Select **Response Format** → choose **JSON**
3. **Schema Mode** will appear → keep it as **Simple (UI)**
4. **Schema Properties** will appear → click **Add Property** for each field you want

**Example - Extracting Contact Information:**

| Property Name | Type | Required | Description |
|---------------|------|----------|-------------|
| name | String | ✓ | Person's full name |
| email | String | ✓ | Email address |
| phone | String | ✗ (Nullable) | Phone number if mentioned |
| company | String | ✗ (Nullable) | Company name if mentioned |

**Example - Product Review Analysis:**

| Property Name | Type | Required | Description |
|---------------|------|----------|-------------|
| product_name | String | ✓ | Name of the product |
| rating | Integer | ✓ | Rating from 1-5 |
| pros | Array of Strings | ✓ | List of positive points |
| cons | Array of Strings | ✓ | List of negative points |
| sentiment | String (with Allowed Values: positive, negative, mixed) | ✓ | Overall sentiment |

### Property Types Explained

| Type | Description | Example Value |
|------|-------------|---------------|
| String | Text | "John Smith" |
| Number | Decimal number | 3.14, 99.99 |
| Integer | Whole number | 1, 42, 100 |
| Boolean | True or False | true, false |
| Array of Strings | List of text | ["apple", "banana"] |
| Array of Numbers | List of numbers | [1, 2, 3] |
| Object | Nested structure (use Advanced mode) | {"nested": "value"} |

### Using Advanced Mode (JSON Schema)

For complex structures like nested objects or arrays of objects, use **Advanced (JSON Schema)** mode.

**Example - Nested Object Schema:**
```json
{
  "type": "OBJECT",
  "properties": {
    "person": {
      "type": "OBJECT",
      "properties": {
        "name": { "type": "STRING" },
        "age": { "type": "INTEGER" }
      },
      "required": ["name"]
    },
    "tags": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    }
  },
  "required": ["person"]
}
```

> **Note:** In Advanced mode, use UPPERCASE type names: `STRING`, `INTEGER`, `NUMBER`, `BOOLEAN`, `ARRAY`, `OBJECT`

## Options Reference

| Option | Description |
|--------|-------------|
| Max Output Tokens | Maximum length of the response (default: 2048) |
| Temperature | Controls creativity (0 = focused, 2 = creative) |
| Top P | Nucleus sampling threshold |
| Top K | Top-k sampling threshold |
| System Instruction | Instructions that guide the AI's behavior |
| Thinking Level | For Gemini 3 only - enables reasoning (None/Low/High) |
| Response Format | Output format (Plain Text/JSON/Enum) |

## Troubleshooting

### "Permission denied" error
- Make sure the Vertex AI API is enabled
- Check that your service account has the "Vertex AI User" role

### "Invalid Service Account Key" error
- Make sure you copied the entire JSON content (including the curly braces)
- The JSON should start with `{` and end with `}`

### Model not available in region
- Some models (especially preview models) are only available in specific regions
- Try using `us-central1` region for the widest model availability
- Gemini 3 Preview models automatically use the global endpoint

## License

MIT

---

# 한국어

n8n에서 Google Vertex AI (Gemini 모델)를 사용할 수 있게 해주는 커뮤니티 노드입니다.

이 노드를 통해 Google의 강력한 Gemini AI 모델을 n8n 워크플로우에서 직접 사용할 수 있습니다.

## 기능

- **텍스트 생성**: 프롬프트로부터 텍스트 응답 생성
- **채팅**: 맥락을 유지하는 다중 턴 대화
- **멀티모달**: 이미지와 텍스트를 함께 처리 (비전 기능)
- **구조화된 출력**: JSON 또는 Enum 형식으로 스키마 검증된 응답 받기
- **최신 모델**: Gemini 3, 2.5, 2.0, 1.5 시리즈 지원

### 지원 모델

| 모델 | 설명 |
|------|------|
| Gemini 3 Pro (Preview) | 사고 기능이 있는 최신 고성능 모델 |
| Gemini 2.5 Pro | 복잡한 작업을 위한 고성능 모델 |
| Gemini 2.5 Flash | 대부분의 용도에 적합한 빠르고 효율적인 모델 (권장) |
| Gemini 2.5 Flash Lite | 간단한 작업을 위한 경량 버전 |
| Gemini 2.0 Flash | 이전 세대 빠른 모델 |
| Gemini 2.0 Flash Lite | 이전 세대 경량 모델 |
| Gemini 1.5 Pro | 안정적인 프로덕션 모델 |
| Gemini 1.5 Flash | 안정적인 빠른 모델 |

## 설치 방법

### n8n에서 설치

1. **Settings** > **Community Nodes**로 이동
2. **Install a community node** 클릭
3. `n8n-nodes-vertex-ai` 입력
4. **Install** 클릭

### 수동 설치

```bash
# n8n 설치 디렉토리에서
npm install n8n-nodes-vertex-ai
```

## 설정 가이드

### 1단계: Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 상단의 **프로젝트 선택** 클릭
3. **새 프로젝트** 클릭
4. 프로젝트 이름을 입력하고 **만들기** 클릭

### 2단계: Vertex AI API 활성화

1. Google Cloud Console에서 **API 및 서비스** > **라이브러리**로 이동
2. "Vertex AI API" 검색
3. 클릭한 후 **사용** 클릭

### 3단계: 서비스 계정 생성

1. **IAM 및 관리자** > **서비스 계정**으로 이동
2. **서비스 계정 만들기** 클릭
3. 이름 입력 (예: "n8n-vertex-ai")
4. **만들고 계속하기** 클릭
5. 역할 추가: **Vertex AI 사용자**
6. **완료** 클릭

### 4단계: 서비스 계정 키 생성

1. 방금 만든 서비스 계정 클릭
2. **키** 탭으로 이동
3. **키 추가** > **새 키 만들기** 클릭
4. **JSON** 선택 후 **만들기** 클릭
5. JSON 파일이 다운로드됨 - **이 파일을 안전하게 보관하세요!**

### 5단계: n8n에서 자격 증명 설정

1. n8n에서 **Credentials**로 이동
2. **Add Credential** 클릭
3. "Vertex AI API" 검색
4. 다음 필드를 입력:
   - **Project ID**: Google Cloud 프로젝트 ID (다운로드한 JSON의 `project_id` 값)
   - **Region**: 리전 선택 (최신 모델 지원을 위해 us-central1 권장)
   - **Service Account Key**: 다운로드한 JSON 파일의 **전체 내용**을 복사하여 붙여넣기

## 사용 예시

### 예시 1: 간단한 텍스트 생성

1. 워크플로우에 **Vertex AI** 노드 추가
2. **Generate Text** 작업 선택
3. 모델 선택 (예: Gemini 2.5 Flash)
4. 프롬프트 입력:
   ```
   자동화에 대한 짧은 시를 써줘
   ```
5. 노드 실행

### 예시 2: 구조화된 출력으로 감성 분석

1. **Vertex AI** 노드 추가
2. **Generate Text** 작업 선택
3. **Options**에서 설정:
   - **Response Format**: Enum
   - **Schema Mode**: Simple (UI)
   - **Enum Values**: `긍정, 부정, 중립`
4. 프롬프트 입력:
   ```
   다음 텍스트의 감성을 분석해줘: "n8n으로 자동화하니까 너무 편해요!"
   ```

### 예시 3: JSON으로 데이터 추출

1. **Vertex AI** 노드 추가
2. **Generate Text** 작업 선택
3. **Options**에서 설정:
   - **Response Format**: JSON
   - **Schema Mode**: Simple (UI)
   - **Schema Properties**에서 속성 추가:
     - name (String, Required)
     - email (String, Required)
     - company (String, Nullable)
4. 프롬프트 입력:
   ```
   다음 텍스트에서 연락처 정보를 추출해줘:
   "안녕하세요, 저는 에이컴사의 김철수입니다. 이메일은 cs.kim@acom.co.kr 입니다."
   ```

### 예시 4: 이미지 분석

1. **HTTP Request** 노드로 이미지 가져오기 (또는 파일 노드 사용)
2. **Vertex AI** 노드 추가
3. **Multimodal** 작업 선택
4. **Image Source**를 **Binary Data**로 설정
5. 텍스트 입력: "이 이미지에 무엇이 보이는지 설명해줘"

## 구조화된 출력 (Structured Output) 가이드

구조화된 출력을 사용하면 AI 응답을 특정 형식(JSON 또는 Enum)으로 받을 수 있습니다. 이후 워크플로우 단계에서 AI 응답을 처리해야 할 때 유용합니다.

### 언제 사용하나요?

| 사용 사례 | Response Format | 예시 |
|----------|-----------------|------|
| 분류 (여러 옵션 중 선택) | Enum | 감성 분석, 카테고리 분류 |
| 구조화된 데이터 추출 | JSON | 연락처 파싱, 제품 정보 추출 |
| 특정 필드 추출 | JSON | 이름 추출, 데이터 정규화 |

### Enum 형식 사용하기 (분류)

AI가 주어진 옵션 중 **하나의 값**을 선택하게 할 때 사용합니다.

**설정 방법:**
1. **Options**에서 **Add Option** 클릭
2. **Response Format** 선택 → **Enum** 선택
3. **Schema Mode**가 나타남 → **Simple (UI)** 유지
4. **Enum Values**가 나타남 → 콤마로 구분하여 옵션 입력

**예시 - 감성 분석:**
```
Enum Values: 긍정, 부정, 중립
```

**예시 - 카테고리 분류:**
```
Enum Values: 버그, 기능요청, 질문, 기타
```

### JSON 형식 사용하기 (데이터 추출)

여러 정보를 구조화된 형태로 추출할 때 사용합니다.

**설정 방법:**
1. **Options**에서 **Add Option** 클릭
2. **Response Format** 선택 → **JSON** 선택
3. **Schema Mode**가 나타남 → **Simple (UI)** 유지
4. **Schema Properties**가 나타남 → **Add Property** 클릭하여 원하는 필드 추가

**예시 - 연락처 정보 추출:**

| Property Name | Type | Required | Description |
|---------------|------|----------|-------------|
| name | String (텍스트) | ✓ | 이름 |
| email | String (텍스트) | ✓ | 이메일 주소 |
| phone | String (텍스트) | ✗ (Nullable 체크) | 전화번호 (없을 수도 있음) |
| company | String (텍스트) | ✗ (Nullable 체크) | 회사명 (없을 수도 있음) |

**예시 - 제품 리뷰 분석:**

| Property Name | Type | Required | Description |
|---------------|------|----------|-------------|
| product_name | String (텍스트) | ✓ | 제품명 |
| rating | Integer (정수) | ✓ | 1-5점 평점 |
| pros | Array of Strings (텍스트 배열) | ✓ | 장점 목록 |
| cons | Array of Strings (텍스트 배열) | ✓ | 단점 목록 |
| sentiment | String + Allowed Values: 긍정, 부정, 혼합 | ✓ | 전체 감성 |

### 속성 타입 설명

| 타입 | 설명 | 예시 값 |
|------|------|---------|
| String (텍스트) | 일반 텍스트 | "홍길동" |
| Number (소수점 숫자) | 소수점이 있는 숫자 | 3.14, 99.99 |
| Integer (정수) | 정수 | 1, 42, 100 |
| Boolean (참/거짓) | 참 또는 거짓 | true, false |
| Array of Strings (텍스트 배열) | 텍스트 목록 | ["사과", "바나나"] |
| Array of Numbers (숫자 배열) | 숫자 목록 | [1, 2, 3] |
| Object (중첩 객체) | 중첩 구조 (Advanced 모드 권장) | {"nested": "value"} |

### Advanced 모드 사용하기 (JSON 스키마)

중첩된 객체나 객체 배열 같은 복잡한 구조가 필요하면 **Advanced (JSON Schema)** 모드를 사용하세요.

**예시 - 중첩 객체 스키마:**
```json
{
  "type": "OBJECT",
  "properties": {
    "person": {
      "type": "OBJECT",
      "properties": {
        "name": { "type": "STRING" },
        "age": { "type": "INTEGER" }
      },
      "required": ["name"]
    },
    "tags": {
      "type": "ARRAY",
      "items": { "type": "STRING" }
    }
  },
  "required": ["person"]
}
```

> **참고:** Advanced 모드에서는 타입 이름을 대문자로 작성하세요: `STRING`, `INTEGER`, `NUMBER`, `BOOLEAN`, `ARRAY`, `OBJECT`

## 옵션 설명

| 옵션 | 설명 |
|------|------|
| Max Output Tokens | 응답의 최대 길이 (기본값: 2048) |
| Temperature | 창의성 조절 (0 = 일관성, 2 = 창의적) |
| Top P | 핵 샘플링 임계값 |
| Top K | Top-k 샘플링 임계값 |
| System Instruction | AI의 동작을 안내하는 지침 |
| Thinking Level | Gemini 3 전용 - 추론 활성화 (None/Low/High) |
| Response Format | 출력 형식 (Plain Text/JSON/Enum) |

## 문제 해결

### "Permission denied" 오류
- Vertex AI API가 활성화되어 있는지 확인
- 서비스 계정에 "Vertex AI 사용자" 역할이 있는지 확인

### "Invalid Service Account Key" 오류
- JSON 전체 내용을 복사했는지 확인 (중괄호 포함)
- JSON은 `{`로 시작하고 `}`로 끝나야 함

### 리전에서 모델 사용 불가
- 일부 모델(특히 프리뷰 모델)은 특정 리전에서만 사용 가능
- 가장 넓은 모델 지원을 위해 `us-central1` 리전 사용 권장
- Gemini 3 Preview 모델은 자동으로 글로벌 엔드포인트 사용

## 라이선스

MIT

