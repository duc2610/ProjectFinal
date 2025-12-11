# API Documentation: Question Report & Update Test Question

## Base URL
```
https://localhost:7100
```

---

# TỔNG QUAN VỀ CÁC TRƯỜNG MỚI

## Vấn đề cần giải quyết

Hệ thống có 2 loại câu hỏi:
1. **Single Question** (Câu hỏi đơn): Part 1, 2, 5 - mỗi TestQuestion là 1 câu hỏi độc lập
2. **Question Group** (Nhóm câu hỏi): Part 3, 4, 6, 7 - mỗi TestQuestion chứa nhiều câu hỏi con (sub-questions) dùng chung passage/audio

**Vấn đề**: Khi Examinee report lỗi trong Question Group, cần biết **CÂU NÀO** trong group bị lỗi, không phải cả group.

---

## Giải thích các trường mới

### 1. `subQuestionId` (Request & Response)

**Mục đích**: Xác định câu hỏi con cụ thể bị report trong Question Group

**Sử dụng**:
- **Request**: Examinee phải gửi `subQuestionId` khi report câu hỏi trong group
- **Response**: Trả về để Creator biết câu nào bị report

**Ví dụ**: Question Group có 3 câu (ID: 151, 152, 153). User report câu 152 → `subQuestionId = 152`

| Loại câu hỏi | subQuestionId |
|--------------|---------------|
| Single Question | `null` |
| Question Group | ID của câu con bị report |

---

### 2. `reportedSubQuestion` (Response)

**Mục đích**: Cho Examinee xem chi tiết câu hỏi con bị report **như một câu hỏi đơn**

**Sử dụng**:
- Khi Examinee xem danh sách "My Reports", họ thấy câu hỏi con bị report giống như câu hỏi đơn
- Không cần hiển thị cả group, chỉ hiển thị câu họ đã report

**Nội dung**: Chứa đầy đủ thông tin của sub-question (content, options, explanation, audioUrl, imageUrl)

```json
"reportedSubQuestion": {
  "questionId": 152,
  "content": "How long will it take to receive the membership card?",
  "options": [...],
  "explanation": "5-7 business days"
}
```

| Loại câu hỏi | reportedSubQuestion |
|--------------|---------------------|
| Single Question | `null` (dùng `questionSnapshot` thay thế) |
| Question Group | Chi tiết câu con bị report |

---

### 3. `groupPassage`, `groupAudioUrl`, `groupImageUrl`, `groupQuestionCount` (Response)

**Mục đích**: Cho Creator/Admin xem **context đầy đủ** của Question Group để sửa lỗi

**Sử dụng**:
- Creator cần xem toàn bộ passage để hiểu context
- Creator cần biết có bao nhiêu câu trong group
- Creator cần truy cập audio/image của group để kiểm tra

| Field | Description | Single Question | Question Group |
|-------|-------------|-----------------|----------------|
| `groupPassage` | Đoạn văn dùng chung cho cả group | `null` | Nội dung passage |
| `groupAudioUrl` | Audio dùng chung cho cả group (Part 3, 4) | `null` | URL audio hoặc `null` |
| `groupImageUrl` | Hình ảnh dùng chung cho cả group | `null` | URL image hoặc `null` |
| `groupQuestionCount` | Số câu hỏi trong group | `null` | Số lượng (VD: 3) |

---

## Tóm tắt theo Role

### Examinee (Người làm bài)

Khi **tạo report**:
- Single Question: Chỉ cần `testQuestionId`
- Question Group: Cần cả `testQuestionId` + `subQuestionId`

Khi **xem "My Reports"**:
- Single Question: Dùng `questionSnapshot` để hiển thị
- Question Group: Dùng `reportedSubQuestion` để hiển thị như câu đơn
- Luôn dùng `questionContent` để hiển thị preview

### Creator/Admin (Người quản lý)

Khi **xem report**:
- Single Question: Dùng `questionSnapshot` để xem và sửa
- Question Group:
  - Dùng `subQuestionId` để biết câu nào bị report
  - Dùng `questionGroupSnapshot` để xem TOÀN BỘ group
  - Dùng `groupPassage`, `groupAudioUrl`, `groupImageUrl` để xem context
  - Dùng `reportedSubQuestion` để xem chi tiết câu bị report

---

## Ví dụ minh họa

### Case 1: Examinee report lỗi đáp án câu 152 trong Question Group

**Request**:
```json
{
  "testQuestionId": 150,
  "subQuestionId": 152,
  "reportType": "IncorrectAnswer",
  "description": "Đáp án C sai"
}
```

**Response cho Examinee (My Reports)**:
- `subQuestionId`: 152
- `reportedSubQuestion`: Chi tiết câu 152 (hiển thị như câu đơn)
- `questionContent`: "How long will it take to receive the membership card?"

**Response cho Creator (View Report)**:
- `subQuestionId`: 152 → Biết câu 152 bị report
- `questionGroupSnapshot`: Toàn bộ group với passage và 3 câu hỏi
- `groupPassage`: "Dear Mr. Johnson..." → Xem context
- `groupQuestionCount`: 3 → Biết group có 3 câu
- `reportedSubQuestion`: Chi tiết câu 152

### Case 2: Examinee report lỗi typo trong passage của Question Group

**Request**:
```json
{
  "testQuestionId": 150,
  "subQuestionId": 151,
  "reportType": "Typo",
  "description": "Passage có lỗi chính tả 'recieve' phải là 'receive'"
}
```

**Lưu ý**: Dù lỗi ở passage, vẫn phải chọn 1 `subQuestionId` để liên kết report

---

# PHẦN 1: QUESTION REPORTS API

## 1.1 Create Question Report (Tạo báo cáo lỗi câu hỏi)

**Endpoint:** `POST /api/question-reports`

**Authorization:** `Bearer {token}` (Role: `Examinee`)

**Content-Type:** `application/json`

### Request Body - Single Question:
```json
{
  "testQuestionId": 8,
  "reportType": "IncorrectAnswer",
  "description": "Đáp án A sai, đáp án đúng phải là B vì trong hình người đàn ông đang cầm sách"
}
```

### Request Body - Question Group (BẮT BUỘC có SubQuestionId):
```json
{
  "testQuestionId": 150,
  "subQuestionId": 152,
  "reportType": "IncorrectAnswer",
  "description": "Câu hỏi 152 trong group có đáp án sai, đáp án đúng phải là C"
}
```

### Request Fields:
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `testQuestionId` | int | ✅ Yes | - | ID của TestQuestion bị report |
| `subQuestionId` | int | ⚠️ Conditional | - | **BẮT BUỘC** khi report câu hỏi trong Question Group. Để `null` nếu report câu hỏi đơn |
| `reportType` | string | ✅ Yes | 50 | Loại lỗi (xem bảng ReportType) |
| `description` | string | ❌ No | 1000 | Mô tả chi tiết lỗi |

### ReportType Values:
| Value | Description |
|-------|-------------|
| `IncorrectAnswer` | Đáp án sai |
| `Typo` | Lỗi chính tả |
| `AudioIssue` | Lỗi audio (không nghe được, audio sai,...) |
| `ImageIssue` | Lỗi hình ảnh |
| `Unclear` | Câu hỏi không rõ ràng |
| `Other` | Lỗi khác |

### Response Success (200 OK) - Single Question:
```json
{
  "isSuccess": true,
  "data": {
    "reportId": 1,
    "testQuestionId": 8,
    "isQuestionGroup": false,
    "subQuestionId": null,
    "questionSnapshot": {
      "questionId": 5,
      "partId": 1,
      "content": "What is the man doing?",
      "audioUrl": "https://storage.blob.core.windows.net/audio/part1_q5.mp3",
      "imageUrl": "https://storage.blob.core.windows.net/images/part1_q5.jpg",
      "explanation": "The man is reading a book in the library",
      "options": [
        { "label": "A", "content": "He is writing a letter", "isCorrect": true },
        { "label": "B", "content": "He is reading a book", "isCorrect": false },
        { "label": "C", "content": "He is making a phone call", "isCorrect": false },
        { "label": "D", "content": "He is eating lunch", "isCorrect": false }
      ],
      "userAnswer": null,
      "isCorrect": null
    },
    "questionGroupSnapshot": null,
    "reportedSubQuestion": null,
    "groupPassage": null,
    "groupAudioUrl": null,
    "groupImageUrl": null,
    "groupQuestionCount": null,
    "questionContent": "What is the man doing?",
    "partId": 1,
    "partName": "Part 1: Photographs",
    "testId": 3,
    "testName": "TOEIC Full Test 2024 - December",
    "sourceQuestionId": 5,
    "sourceQuestionGroupId": null,
    "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "reporterName": "Nguyen Van A",
    "reporterEmail": "nguyenvana@gmail.com",
    "reportType": "IncorrectAnswer",
    "description": "Đáp án A sai, đáp án đúng phải là B vì trong hình người đàn ông đang cầm sách",
    "status": 0,
    "reviewedBy": null,
    "reviewerName": null,
    "reviewerNotes": null,
    "createdAt": "2025-12-11T10:30:00Z",
    "reviewedAt": null
  },
  "message": null
}
```

### Response Success (200 OK) - Question Group:
```json
{
  "isSuccess": true,
  "data": {
    "reportId": 2,
    "testQuestionId": 150,
    "isQuestionGroup": true,
    "subQuestionId": 152,
    "questionSnapshot": null,
    "questionGroupSnapshot": {
      "questionGroupId": 25,
      "partId": 6,
      "passage": "Dear Mr. Johnson,\n\nThank you for your recent inquiry about our premium membership services. We are pleased to inform you that your application has been approved. You will recieve your membership card within 5-7 business days.\n\nBest regards,\nCustomer Service Team",
      "audioUrl": null,
      "imageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
      "questionSnapshots": [
        {
          "questionId": 151,
          "partId": 6,
          "content": "What is the purpose of this letter?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "The letter is to inform about membership approval",
          "options": [
            { "label": "A", "content": "To make a complaint", "isCorrect": false },
            { "label": "B", "content": "To approve a membership application", "isCorrect": true },
            { "label": "C", "content": "To request information", "isCorrect": false },
            { "label": "D", "content": "To cancel a subscription", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        {
          "questionId": 152,
          "partId": 6,
          "content": "How long will it take to receive the membership card?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "5-7 business days as stated in the letter",
          "options": [
            { "label": "A", "content": "1-2 days", "isCorrect": false },
            { "label": "B", "content": "3-4 days", "isCorrect": false },
            { "label": "C", "content": "5-7 days", "isCorrect": true },
            { "label": "D", "content": "10-14 days", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        {
          "questionId": 153,
          "partId": 6,
          "content": "Who most likely wrote this letter?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "Customer Service Team as signed at the end",
          "options": [
            { "label": "A", "content": "Mr. Johnson", "isCorrect": false },
            { "label": "B", "content": "A sales manager", "isCorrect": false },
            { "label": "C", "content": "A customer service representative", "isCorrect": true },
            { "label": "D", "content": "A delivery person", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        }
      ]
    },
    "reportedSubQuestion": {
      "questionId": 152,
      "partId": 6,
      "content": "How long will it take to receive the membership card?",
      "audioUrl": null,
      "imageUrl": null,
      "explanation": "5-7 business days as stated in the letter",
      "options": [
        { "label": "A", "content": "1-2 days", "isCorrect": false },
        { "label": "B", "content": "3-4 days", "isCorrect": false },
        { "label": "C", "content": "5-7 days", "isCorrect": true },
        { "label": "D", "content": "10-14 days", "isCorrect": false }
      ],
      "userAnswer": null,
      "isCorrect": null
    },
    "groupPassage": "Dear Mr. Johnson,\n\nThank you for your recent inquiry about our premium membership services...",
    "groupAudioUrl": null,
    "groupImageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
    "groupQuestionCount": 3,
    "questionContent": "How long will it take to receive the membership card?",
    "partId": 6,
    "partName": "Part 6: Text Completion",
    "testId": 3,
    "testName": "TOEIC Full Test 2024 - December",
    "sourceQuestionId": null,
    "sourceQuestionGroupId": 25,
    "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "reporterName": "Nguyen Van A",
    "reporterEmail": "nguyenvana@gmail.com",
    "reportType": "IncorrectAnswer",
    "description": "Câu hỏi 152 trong group có đáp án sai, đáp án đúng phải là C",
    "status": 0,
    "reviewedBy": null,
    "reviewerName": null,
    "reviewerNotes": null,
    "createdAt": "2025-12-11T10:35:00Z",
    "reviewedAt": null
  },
  "message": null
}
```

### Response Fields Explanation:

| Field | Description | Single Question | Question Group |
|-------|-------------|-----------------|----------------|
| `subQuestionId` | ID câu hỏi con bị report trong group | `null` | ID của sub-question |
| `questionSnapshot` | Chi tiết câu hỏi đơn | ✅ Có dữ liệu | `null` |
| `questionGroupSnapshot` | Chi tiết toàn bộ group (cho Creator xem) | `null` | ✅ Có dữ liệu |
| `reportedSubQuestion` | Chi tiết câu hỏi con bị report (cho Examinee xem như câu đơn) | `null` | ✅ Có dữ liệu |
| `groupPassage` | Đoạn văn của group | `null` | ✅ Có dữ liệu |
| `groupAudioUrl` | Audio của group | `null` | URL hoặc `null` |
| `groupImageUrl` | Hình ảnh của group | `null` | URL hoặc `null` |
| `groupQuestionCount` | Số câu hỏi trong group | `null` | Số lượng |
| `questionContent` | Nội dung hiển thị | Content câu đơn | Content của sub-question bị report |

### Response Error (400 Bad Request):
```json
{
  "isSuccess": false,
  "data": null,
  "message": "You have already reported this question"
}
```

### Other Error Messages:
| Error Message | Description |
|---------------|-------------|
| `"Question not found"` | TestQuestionId không tồn tại |
| `"Invalid report type"` | ReportType không hợp lệ |
| `"TestQuestionId is required"` | Thiếu TestQuestionId |
| `"ReportType is required"` | Thiếu ReportType |
| `"SubQuestionId is required when reporting a question in a group"` | Report Question Group nhưng thiếu SubQuestionId |
| `"SubQuestionId {id} not found in question group"` | SubQuestionId không tồn tại trong group |
| `"Failed to validate SubQuestionId"` | Lỗi validate SubQuestionId |

---

## 1.2 Get My Reports (Xem báo cáo của tôi - Examinee)

**Endpoint:** `GET /api/question-reports/my-reports`

**Authorization:** `Bearer {token}` (Role: `Examinee`)

### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Số trang |
| `pageSize` | int | 20 | Số item mỗi trang |

### Example Request:
```
GET /api/question-reports/my-reports?page=1&pageSize=10
```

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "reportId": 1,
        "testQuestionId": 8,
        "isQuestionGroup": false,
        "subQuestionId": null,
        "questionSnapshot": {
          "questionId": 5,
          "partId": 1,
          "content": "What is the man doing?",
          "audioUrl": "https://storage.blob.core.windows.net/audio/part1_q5.mp3",
          "imageUrl": "https://storage.blob.core.windows.net/images/part1_q5.jpg",
          "explanation": "The man is reading a book",
          "options": [
            { "label": "A", "content": "He is writing a letter", "isCorrect": true },
            { "label": "B", "content": "He is reading a book", "isCorrect": false },
            { "label": "C", "content": "He is making a phone call", "isCorrect": false },
            { "label": "D", "content": "He is eating lunch", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        "questionGroupSnapshot": null,
        "reportedSubQuestion": null,
        "groupPassage": null,
        "groupAudioUrl": null,
        "groupImageUrl": null,
        "groupQuestionCount": null,
        "questionContent": "What is the man doing?",
        "partId": 1,
        "partName": "Part 1: Photographs",
        "testId": 3,
        "testName": "TOEIC Full Test 2024 - December",
        "sourceQuestionId": 5,
        "sourceQuestionGroupId": null,
        "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "reporterName": "Nguyen Van A",
        "reporterEmail": "nguyenvana@gmail.com",
        "reportType": "IncorrectAnswer",
        "description": "Đáp án A sai, đáp án đúng phải là B",
        "status": 0,
        "reviewedBy": null,
        "reviewerName": null,
        "reviewerNotes": null,
        "createdAt": "2025-12-11T10:30:00Z",
        "reviewedAt": null
      },
      {
        "reportId": 2,
        "testQuestionId": 150,
        "isQuestionGroup": true,
        "subQuestionId": 152,
        "questionSnapshot": null,
        "questionGroupSnapshot": {
          "questionGroupId": 25,
          "partId": 6,
          "passage": "Dear Mr. Johnson...",
          "audioUrl": null,
          "imageUrl": null,
          "questionSnapshots": [...]
        },
        "reportedSubQuestion": {
          "questionId": 152,
          "partId": 6,
          "content": "How long will it take to receive the membership card?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "5-7 business days",
          "options": [
            { "label": "A", "content": "1-2 days", "isCorrect": false },
            { "label": "B", "content": "3-4 days", "isCorrect": false },
            { "label": "C", "content": "5-7 days", "isCorrect": true },
            { "label": "D", "content": "10-14 days", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        "groupPassage": "Dear Mr. Johnson...",
        "groupAudioUrl": null,
        "groupImageUrl": null,
        "groupQuestionCount": 3,
        "questionContent": "How long will it take to receive the membership card?",
        "partId": 6,
        "partName": "Part 6: Text Completion",
        "testId": 3,
        "testName": "TOEIC Full Test 2024 - December",
        "sourceQuestionId": null,
        "sourceQuestionGroupId": 25,
        "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "reporterName": "Nguyen Van A",
        "reporterEmail": "nguyenvana@gmail.com",
        "reportType": "IncorrectAnswer",
        "description": "Câu 152 đáp án sai",
        "status": 2,
        "reviewedBy": "admin-guid",
        "reviewerName": "Admin",
        "reviewerNotes": "Đã sửa đáp án",
        "createdAt": "2025-12-11T10:35:00Z",
        "reviewedAt": "2025-12-11T14:00:00Z"
      }
    ],
    "page": 1,
    "pageSize": 10,
    "totalCount": 2,
    "totalPages": 1
  },
  "message": null
}
```

### Note cho Examinee:
- **Câu hỏi đơn**: Dùng `questionSnapshot` để hiển thị
- **Question Group**: Dùng `reportedSubQuestion` để hiển thị như câu hỏi đơn (không cần hiển thị cả group)
- Field `questionContent` luôn chứa nội dung câu hỏi cần hiển thị

---

## 1.3 Get All Reports (Admin/TestCreator xem tất cả)

**Endpoint:** `GET /api/question-reports`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

### Query Parameters:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | int | null | Filter theo status (0=Pending, 1=Reviewing, 2=Resolved, 3=Rejected) |
| `testQuestionId` | int | null | Filter theo TestQuestion ID |
| `page` | int | 1 | Số trang |
| `pageSize` | int | 20 | Số item mỗi trang |

### Example Requests:
```
GET /api/question-reports?page=1&pageSize=20
GET /api/question-reports?status=0&page=1&pageSize=20
GET /api/question-reports?testQuestionId=8&page=1&pageSize=20
GET /api/question-reports?status=0&testQuestionId=8&page=1&pageSize=20
```

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "reportId": 1,
        "testQuestionId": 8,
        "isQuestionGroup": false,
        "subQuestionId": null,
        "questionSnapshot": {...},
        "questionGroupSnapshot": null,
        "reportedSubQuestion": null,
        "groupPassage": null,
        "groupAudioUrl": null,
        "groupImageUrl": null,
        "groupQuestionCount": null,
        "questionContent": "What is the man doing?",
        "partId": 1,
        "partName": "Part 1: Photographs",
        "testId": 3,
        "testName": "TOEIC Full Test 2024 - December",
        "sourceQuestionId": 5,
        "sourceQuestionGroupId": null,
        "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "reporterName": "Nguyen Van A",
        "reporterEmail": "nguyenvana@gmail.com",
        "reportType": "IncorrectAnswer",
        "description": "Đáp án A sai",
        "status": 0,
        "reviewedBy": null,
        "reviewerName": null,
        "reviewerNotes": null,
        "createdAt": "2025-12-11T10:30:00Z",
        "reviewedAt": null
      },
      {
        "reportId": 2,
        "testQuestionId": 150,
        "isQuestionGroup": true,
        "subQuestionId": 152,
        "questionSnapshot": null,
        "questionGroupSnapshot": {
          "questionGroupId": 25,
          "partId": 6,
          "passage": "Dear Mr. Johnson...",
          "audioUrl": null,
          "imageUrl": null,
          "questionSnapshots": [...]
        },
        "reportedSubQuestion": {
          "questionId": 152,
          "content": "How long will it take to receive the membership card?",
          ...
        },
        "groupPassage": "Dear Mr. Johnson...",
        "groupAudioUrl": null,
        "groupImageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
        "groupQuestionCount": 3,
        "questionContent": "How long will it take to receive the membership card?",
        "partId": 6,
        "partName": "Part 6: Text Completion",
        "testId": 3,
        "testName": "TOEIC Full Test 2024 - December",
        "sourceQuestionId": null,
        "sourceQuestionGroupId": 25,
        "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "reporterName": "Nguyen Van A",
        "reporterEmail": "nguyenvana@gmail.com",
        "reportType": "IncorrectAnswer",
        "description": "Câu 152 đáp án sai",
        "status": 0,
        "reviewedBy": null,
        "reviewerName": null,
        "reviewerNotes": null,
        "createdAt": "2025-12-11T10:35:00Z",
        "reviewedAt": null
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 2,
    "totalPages": 1
  },
  "message": null
}
```

### Note cho Creator/Admin:
- **Câu hỏi đơn**: Dùng `questionSnapshot` để xem và sửa
- **Question Group**:
  - Dùng `questionGroupSnapshot` để xem TOÀN BỘ group
  - Dùng `subQuestionId` để biết câu nào bị report
  - Dùng `reportedSubQuestion` để xem chi tiết câu bị report
  - Dùng `groupPassage`, `groupAudioUrl`, `groupImageUrl` để xem context của group

---

## 1.4 Get Report By ID

**Endpoint:** `GET /api/question-reports/{reportId}`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

### Example Request:
```
GET /api/question-reports/2
```

### Response Success (200 OK) - Question Group Report:
```json
{
  "isSuccess": true,
  "data": {
    "reportId": 2,
    "testQuestionId": 150,
    "isQuestionGroup": true,
    "subQuestionId": 152,
    "questionSnapshot": null,
    "questionGroupSnapshot": {
      "questionGroupId": 25,
      "partId": 6,
      "passage": "Dear Mr. Johnson,\n\nThank you for your recent inquiry about our premium membership services. We are pleased to inform you that your application has been approved. You will recieve your membership card within 5-7 business days.\n\nBest regards,\nCustomer Service Team",
      "audioUrl": null,
      "imageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
      "questionSnapshots": [
        {
          "questionId": 151,
          "partId": 6,
          "content": "What is the purpose of this letter?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "The letter is to inform about membership approval",
          "options": [
            { "label": "A", "content": "To make a complaint", "isCorrect": false },
            { "label": "B", "content": "To approve a membership application", "isCorrect": true },
            { "label": "C", "content": "To request information", "isCorrect": false },
            { "label": "D", "content": "To cancel a subscription", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        {
          "questionId": 152,
          "partId": 6,
          "content": "How long will it take to receive the membership card?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "5-7 business days as stated in the letter",
          "options": [
            { "label": "A", "content": "1-2 days", "isCorrect": false },
            { "label": "B", "content": "3-4 days", "isCorrect": false },
            { "label": "C", "content": "5-7 days", "isCorrect": true },
            { "label": "D", "content": "10-14 days", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        },
        {
          "questionId": 153,
          "partId": 6,
          "content": "Who most likely wrote this letter?",
          "audioUrl": null,
          "imageUrl": null,
          "explanation": "Customer Service Team as signed at the end",
          "options": [
            { "label": "A", "content": "Mr. Johnson", "isCorrect": false },
            { "label": "B", "content": "A sales manager", "isCorrect": false },
            { "label": "C", "content": "A customer service representative", "isCorrect": true },
            { "label": "D", "content": "A delivery person", "isCorrect": false }
          ],
          "userAnswer": null,
          "isCorrect": null
        }
      ]
    },
    "reportedSubQuestion": {
      "questionId": 152,
      "partId": 6,
      "content": "How long will it take to receive the membership card?",
      "audioUrl": null,
      "imageUrl": null,
      "explanation": "5-7 business days as stated in the letter",
      "options": [
        { "label": "A", "content": "1-2 days", "isCorrect": false },
        { "label": "B", "content": "3-4 days", "isCorrect": false },
        { "label": "C", "content": "5-7 days", "isCorrect": true },
        { "label": "D", "content": "10-14 days", "isCorrect": false }
      ],
      "userAnswer": null,
      "isCorrect": null
    },
    "groupPassage": "Dear Mr. Johnson,\n\nThank you for your recent inquiry about our premium membership services...",
    "groupAudioUrl": null,
    "groupImageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
    "groupQuestionCount": 3,
    "questionContent": "How long will it take to receive the membership card?",
    "partId": 6,
    "partName": "Part 6: Text Completion",
    "testId": 3,
    "testName": "TOEIC Full Test 2024 - December",
    "sourceQuestionId": null,
    "sourceQuestionGroupId": 25,
    "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "reporterName": "Nguyen Van A",
    "reporterEmail": "nguyenvana@gmail.com",
    "reportType": "IncorrectAnswer",
    "description": "Câu hỏi 152 trong group có đáp án sai",
    "status": 0,
    "reviewedBy": null,
    "reviewerName": null,
    "reviewerNotes": null,
    "createdAt": "2025-12-11T10:35:00Z",
    "reviewedAt": null
  },
  "message": null
}
```

### Response Error (404 Not Found):
```json
{
  "isSuccess": false,
  "data": null,
  "message": "Report not found"
}
```

### Response Error (400 Bad Request) - Không có quyền:
```json
{
  "isSuccess": false,
  "data": null,
  "message": "You don't have permission to view this report"
}
```

---

## 1.5 Review Report (Xử lý báo cáo)

**Endpoint:** `PUT /api/question-reports/{reportId}/review`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

**Content-Type:** `application/json`

### Request Body:
```json
{
  "status": 2,
  "reviewerNotes": "Đã sửa đáp án từ A sang B. Cảm ơn bạn đã báo lỗi!"
}
```

### Request Fields:
| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `status` | int | ✅ Yes | - | Status mới (1=Reviewing, 2=Resolved, 3=Rejected). **Không thể set về 0 (Pending)** |
| `reviewerNotes` | string | ❌ No | 1000 | Ghi chú của reviewer |

### ReportStatus Values:
| Value | Name | Description |
|-------|------|-------------|
| 0 | `Pending` | Chưa xử lý (không thể set về status này) |
| 1 | `Reviewing` | Đang xem xét |
| 2 | `Resolved` | Đã giải quyết |
| 3 | `Rejected` | Từ chối (không phải lỗi) |

### Example Requests:

**Đánh dấu đang xem xét:**
```json
{
  "status": 1,
  "reviewerNotes": "Đang kiểm tra lại đáp án"
}
```

**Đánh dấu đã giải quyết:**
```json
{
  "status": 2,
  "reviewerNotes": "Đã sửa đáp án từ A sang B. Cảm ơn bạn đã báo lỗi!"
}
```

**Từ chối báo cáo:**
```json
{
  "status": 3,
  "reviewerNotes": "Đã kiểm tra, audio hoạt động bình thường. Có thể do kết nối mạng của bạn."
}
```

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": {
    "reportId": 2,
    "testQuestionId": 150,
    "isQuestionGroup": true,
    "subQuestionId": 152,
    "questionSnapshot": null,
    "questionGroupSnapshot": {...},
    "reportedSubQuestion": {...},
    "groupPassage": "Dear Mr. Johnson...",
    "groupAudioUrl": null,
    "groupImageUrl": "https://storage.blob.core.windows.net/images/part6_passage25.jpg",
    "groupQuestionCount": 3,
    "questionContent": "How long will it take to receive the membership card?",
    "partId": 6,
    "partName": "Part 6: Text Completion",
    "testId": 3,
    "testName": "TOEIC Full Test 2024 - December",
    "sourceQuestionId": null,
    "sourceQuestionGroupId": 25,
    "reportedBy": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "reporterName": "Nguyen Van A",
    "reporterEmail": "nguyenvana@gmail.com",
    "reportType": "IncorrectAnswer",
    "description": "Câu hỏi 152 trong group có đáp án sai",
    "status": 2,
    "reviewedBy": "c3d4e5f6-a7b8-9012-cdef-345678901234",
    "reviewerName": "Admin User",
    "reviewerNotes": "Đã sửa đáp án câu 152. Cảm ơn bạn đã báo lỗi!",
    "createdAt": "2025-12-11T10:35:00Z",
    "reviewedAt": "2025-12-11T15:00:00Z"
  },
  "message": null
}
```

### Response Error (400 Bad Request):
```json
{
  "isSuccess": false,
  "data": null,
  "message": "Cannot set status back to Pending"
}
```

### Other Error Messages:
- `"Report not found"` - Không tìm thấy report
- `"You don't have permission to review this report. Only the test creator or admin can review."` - Không có quyền

---

## 1.6 Get Pending Reports Count

**Endpoint:** `GET /api/question-reports/stats/pending-count`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": 15,
  "message": null
}
```

---

# PHẦN 2: UPDATE TEST QUESTION API

## 2.1 Update Test Question (Single Question)

**Endpoint:** `PUT /api/tests/test-questions/{testQuestionId}`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

**Content-Type:** `multipart/form-data`

### Request Fields cho Single Question:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Content` | string | ❌ No | Nội dung câu hỏi mới |
| `AnswerOptions[n].Label` | string | ❌ No | Label option (A, B, C, D) |
| `AnswerOptions[n].Content` | string | ❌ No | Nội dung option |
| `AnswerOptions[n].IsCorrect` | bool | ❌ No | Đáp án đúng |
| `Solution` | string | ❌ No | Giải thích đáp án |
| `Audio` | file | ❌ No | File audio mới |
| `Image` | file | ❌ No | File hình ảnh mới |
| `AlsoUpdateSourceInBank` | bool | ❌ No | `true` = cập nhật cả Question gốc trong bank, `false` (default) = chỉ cập nhật snapshot |

### Example Request - Sửa đáp án:
```
PUT /api/tests/test-questions/8
Content-Type: multipart/form-data

AnswerOptions[0].Label: A
AnswerOptions[0].Content: He is writing a letter
AnswerOptions[0].IsCorrect: false
AnswerOptions[1].Label: B
AnswerOptions[1].Content: He is reading a book
AnswerOptions[1].IsCorrect: true
AnswerOptions[2].Label: C
AnswerOptions[2].Content: He is making a phone call
AnswerOptions[2].IsCorrect: false
AnswerOptions[3].Label: D
AnswerOptions[3].Content: He is eating lunch
AnswerOptions[3].IsCorrect: false
AlsoUpdateSourceInBank: false
```

### Example Request - Sửa nội dung câu hỏi:
```
PUT /api/tests/test-questions/8
Content-Type: multipart/form-data

Content: What is the man doing in the picture?
Solution: The correct answer is B because the man is clearly reading a book in the library
AlsoUpdateSourceInBank: false
```

### Example Request - Upload Audio mới:
```
PUT /api/tests/test-questions/45
Content-Type: multipart/form-data

Audio: [File: new_audio_part2_q30.mp3]
AlsoUpdateSourceInBank: true
```

### Example Request - Upload Image mới:
```
PUT /api/tests/test-questions/8
Content-Type: multipart/form-data

Image: [File: new_image_part1_q5.jpg]
AlsoUpdateSourceInBank: true
```

### Example Request - Full Update (Sửa toàn bộ):
```
PUT /api/tests/test-questions/8
Content-Type: multipart/form-data

Content: What is the man doing in the photograph?
AnswerOptions[0].Label: A
AnswerOptions[0].Content: He is writing a report
AnswerOptions[0].IsCorrect: false
AnswerOptions[1].Label: B
AnswerOptions[1].Content: He is reading a novel
AnswerOptions[1].IsCorrect: true
AnswerOptions[2].Label: C
AnswerOptions[2].Content: He is talking on the phone
AnswerOptions[2].IsCorrect: false
AnswerOptions[3].Label: D
AnswerOptions[3].Content: He is having lunch
AnswerOptions[3].IsCorrect: false
Solution: Đáp án B đúng. Trong hình, người đàn ông đang ngồi trên ghế sofa và đọc một cuốn tiểu thuyết.
Image: [File: updated_image_part1_q5.jpg]
Audio: [File: updated_audio_part1_q5.mp3]
AlsoUpdateSourceInBank: true
```

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": "TestQuestion updated successfully",
  "message": null
}
```

### Response Success với update source bank:
```json
{
  "isSuccess": true,
  "data": "TestQuestion updated successfully (including source Question in bank)",
  "message": null
}
```

### Response Success với version mới (có user đã làm bài):
```json
{
  "isSuccess": true,
  "data": "TestQuestion updated successfully (new version 2)",
  "message": null
}
```

---

## 2.2 Update Test Question (Question Group)

**Endpoint:** `PUT /api/tests/test-questions/{testQuestionId}`

**Authorization:** `Bearer {token}` (Role: `Admin` hoặc `TestCreator`)

**Content-Type:** `multipart/form-data`

### Request Fields cho Question Group:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Passage` | string | ❌ No | Đoạn văn/passage mới |
| `Questions[n].QuestionId` | int | ❌ No | ID của sub-question trong group |
| `Questions[n].Content` | string | ❌ No | Nội dung sub-question |
| `Questions[n].Explanation` | string | ❌ No | Giải thích cho sub-question |
| `Questions[n].Options[m].Label` | string | ❌ No | Label option |
| `Questions[n].Options[m].Content` | string | ❌ No | Nội dung option |
| `Questions[n].Options[m].IsCorrect` | bool | ❌ No | Đáp án đúng |
| `Audio` | file | ❌ No | File audio mới |
| `Image` | file | ❌ No | File hình ảnh mới |
| `AlsoUpdateSourceInBank` | bool | ❌ No | Cập nhật cả QuestionGroup gốc |

### Example Request - Sửa Passage:
```
PUT /api/tests/test-questions/150
Content-Type: multipart/form-data

Passage: Dear Mr. Johnson,

Thank you for your recent inquiry about our premium membership services. We are pleased to inform you that your application has been approved. You will receive your membership card within 5-7 business days.

If you have any questions, please do not hesitate to contact us.

Best regards,
Customer Service Team

AlsoUpdateSourceInBank: false
```

### Example Request - Sửa 1 Sub-question (theo SubQuestionId từ report):
```
PUT /api/tests/test-questions/150
Content-Type: multipart/form-data

Questions[0].QuestionId: 152
Questions[0].Content: How long will it take to receive the membership card?
Questions[0].Explanation: 5-7 business days as stated in the letter
Questions[0].Options[0].Label: A
Questions[0].Options[0].Content: 1-2 business days
Questions[0].Options[0].IsCorrect: false
Questions[0].Options[1].Label: B
Questions[0].Options[1].Content: 3-4 business days
Questions[0].Options[1].IsCorrect: false
Questions[0].Options[2].Label: C
Questions[0].Options[2].Content: 5-7 business days
Questions[0].Options[2].IsCorrect: true
Questions[0].Options[3].Label: D
Questions[0].Options[3].Content: 10-14 business days
Questions[0].Options[3].IsCorrect: false
AlsoUpdateSourceInBank: false
```

### Example Request - Sửa nhiều Sub-questions:
```
PUT /api/tests/test-questions/150
Content-Type: multipart/form-data

Questions[0].QuestionId: 151
Questions[0].Content: What is the main purpose of this letter?
Questions[0].Explanation: The letter confirms membership approval
Questions[0].Options[0].Label: A
Questions[0].Options[0].Content: To file a complaint
Questions[0].Options[0].IsCorrect: false
Questions[0].Options[1].Label: B
Questions[0].Options[1].Content: To confirm membership approval
Questions[0].Options[1].IsCorrect: true
Questions[0].Options[2].Label: C
Questions[0].Options[2].Content: To request information
Questions[0].Options[2].IsCorrect: false
Questions[0].Options[3].Label: D
Questions[0].Options[3].Content: To cancel service
Questions[0].Options[3].IsCorrect: false

Questions[1].QuestionId: 152
Questions[1].Content: How long will it take to receive the membership card?
Questions[1].Explanation: 5-7 business days as stated in the letter
Questions[1].Options[0].Label: A
Questions[1].Options[0].Content: 1-2 business days
Questions[1].Options[0].IsCorrect: false
Questions[1].Options[1].Label: B
Questions[1].Options[1].Content: 3-4 business days
Questions[1].Options[1].IsCorrect: false
Questions[1].Options[2].Label: C
Questions[1].Options[2].Content: 5-7 business days
Questions[1].Options[2].IsCorrect: true
Questions[1].Options[3].Label: D
Questions[1].Options[3].Content: 10-14 business days
Questions[1].Options[3].IsCorrect: false

Questions[2].QuestionId: 153
Questions[2].Content: Who most likely wrote this letter?
Questions[2].Explanation: Customer Service Team as signed at the end
Questions[2].Options[0].Label: A
Questions[2].Options[0].Content: Mr. Johnson
Questions[2].Options[0].IsCorrect: false
Questions[2].Options[1].Label: B
Questions[2].Options[1].Content: A sales manager
Questions[2].Options[1].IsCorrect: false
Questions[2].Options[2].Label: C
Questions[2].Options[2].Content: A customer service representative
Questions[2].Options[2].IsCorrect: true
Questions[2].Options[3].Label: D
Questions[2].Options[3].Content: A delivery person
Questions[2].Options[3].IsCorrect: false

AlsoUpdateSourceInBank: true
```

### Response Success (200 OK):
```json
{
  "isSuccess": true,
  "data": "TestQuestion (Group) updated successfully",
  "message": null
}
```

### Response Success với version mới (có user đã làm bài):
```json
{
  "isSuccess": true,
  "data": "TestQuestion (Group) updated successfully (new version 2)",
  "message": null
}
```

### Response Success với update source bank:
```json
{
  "isSuccess": true,
  "data": "TestQuestion (Group) updated successfully (including source QuestionGroup in bank)",
  "message": null
}
```

### Response Error (400 Bad Request):
```json
{
  "isSuccess": false,
  "data": null,
  "message": "TestQuestion not found"
}
```

### Other Error Messages:
- `"You don't have permission to update this question. Only the test creator can modify."` - Không có quyền
- `"Invalid snapshot JSON format"` - Lỗi định dạng snapshot
- `"Failed to upload audio: ..."` - Lỗi upload audio
- `"Failed to upload image: ..."` - Lỗi upload image

---

# PHẦN 3: TEST CASES

## 3.1 Test Cases - Create Report (Single Question)

### TC01: Report Single Question - IncorrectAnswer - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "IncorrectAnswer",
  "description": "Đáp án A sai, đáp án đúng phải là B vì trong hình người đàn ông đang cầm sách"
}

Expected: 200 OK
Response: subQuestionId = null, questionSnapshot có dữ liệu
```

### TC02: Report Single Question - AudioIssue - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 45,
  "reportType": "AudioIssue",
  "description": "Audio bị rè, không nghe rõ từ giây thứ 5 đến giây thứ 10"
}

Expected: 200 OK
```

### TC03: Report Single Question - ImageIssue - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "ImageIssue",
  "description": "Hình ảnh bị mờ, không nhìn rõ chi tiết trong hình"
}

Expected: 200 OK
```

### TC04: Report Single Question - Typo - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 20,
  "reportType": "Typo",
  "description": "Câu hỏi có lỗi chính tả: 'teh' phải là 'the'"
}

Expected: 200 OK
```

### TC05: Report Single Question - Unclear - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 120,
  "reportType": "Unclear",
  "description": "Câu hỏi không rõ ràng, có thể hiểu theo 2 nghĩa khác nhau"
}

Expected: 200 OK
```

### TC06: Report Single Question - Other - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 200,
  "reportType": "Other",
  "description": "Câu hỏi này trùng với câu 150 trong bài test"
}

Expected: 200 OK
```

---

## 3.2 Test Cases - Create Report (Question Group)

### TC07: Report Question Group - Với SubQuestionId - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 152,
  "reportType": "IncorrectAnswer",
  "description": "Câu hỏi 152 trong group có đáp án sai, đáp án C mới đúng"
}

Expected: 200 OK
Response:
- subQuestionId = 152
- isQuestionGroup = true
- questionGroupSnapshot có toàn bộ group
- reportedSubQuestion có chi tiết câu 152
- questionContent = nội dung câu 152
```

### TC08: Report Question Group - SubQuestionId khác - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 151,
  "reportType": "Unclear",
  "description": "Câu hỏi 151 không rõ ràng"
}

Expected: 200 OK
Response:
- subQuestionId = 151
- reportedSubQuestion có chi tiết câu 151
```

### TC09: Report Question Group - Typo trong Passage - Thành công
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 151,
  "reportType": "Typo",
  "description": "Đoạn văn có lỗi chính tả ở dòng 3: 'recieve' phải là 'receive'"
}

Expected: 200 OK
```

### TC10: Report Question Group thất bại - Thiếu SubQuestionId
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "reportType": "IncorrectAnswer",
  "description": "Đáp án sai"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "SubQuestionId is required when reporting a question in a group" }
```

### TC11: Report Question Group thất bại - SubQuestionId không tồn tại trong group
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 999,
  "reportType": "IncorrectAnswer",
  "description": "Test"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "SubQuestionId 999 not found in question group" }
```

### TC12: Report Question Group - User đã report cùng SubQuestionId
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 152,
  "reportType": "Typo",
  "description": "Report lần 2 cùng SubQuestionId"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "You have already reported this question" }
```

### TC13: Report Question Group - User report SubQuestionId khác (cho phép)
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 153,
  "reportType": "IncorrectAnswer",
  "description": "Câu 153 cũng có lỗi"
}

Expected: 200 OK (vì SubQuestionId khác với report trước)
```

---

## 3.3 Test Cases - Create Report (Error Cases)

### TC14: Report thất bại - Đã report rồi (Single Question)
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "IncorrectAnswer",
  "description": "Report lần 2"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "You have already reported this question" }
```

### TC15: Report thất bại - Question không tồn tại
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 99999,
  "reportType": "IncorrectAnswer",
  "description": "Test report"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "Question not found" }
```

### TC16: Report thất bại - Invalid ReportType
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "InvalidType",
  "description": "Test report"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "Invalid report type" }
```

### TC17: Report thất bại - Thiếu required fields
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "description": "Test report without testQuestionId"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "TestQuestionId is required" }
```

### TC18: Report thất bại - Unauthorized
```
POST /api/question-reports
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "IncorrectAnswer",
  "description": "Test"
}

Expected: 401 Unauthorized
Response: { "isSuccess": false, "message": "Invalid or missing user ID." }
```

---

## 3.4 Test Cases - Get Reports

### TC19: Get My Reports - Thành công
```
GET /api/question-reports/my-reports?page=1&pageSize=10
Authorization: Bearer {examinee_token}

Expected: 200 OK
Response: List reports với reportedSubQuestion cho Question Group
```

### TC20: Get All Reports - Admin - Thành công
```
GET /api/question-reports?page=1&pageSize=20
Authorization: Bearer {admin_token}

Expected: 200 OK
```

### TC21: Get Reports - Filter theo status=Pending
```
GET /api/question-reports?status=0&page=1&pageSize=20
Authorization: Bearer {admin_token}

Expected: 200 OK
```

### TC22: Get Reports - Filter theo testQuestionId
```
GET /api/question-reports?testQuestionId=150&page=1&pageSize=20
Authorization: Bearer {admin_token}

Expected: 200 OK - Có thể có nhiều reports cho các SubQuestionId khác nhau
```

### TC23: Get Report By ID - Single Question
```
GET /api/question-reports/1
Authorization: Bearer {admin_token}

Expected: 200 OK
Response:
- subQuestionId = null
- questionSnapshot có dữ liệu
- questionGroupSnapshot = null
- reportedSubQuestion = null
```

### TC24: Get Report By ID - Question Group
```
GET /api/question-reports/2
Authorization: Bearer {admin_token}

Expected: 200 OK
Response:
- subQuestionId = 152
- questionGroupSnapshot có toàn bộ group
- reportedSubQuestion có chi tiết câu 152
- groupPassage, groupAudioUrl, groupImageUrl, groupQuestionCount có dữ liệu
```

### TC25: Get Report By ID - Không tìm thấy
```
GET /api/question-reports/99999
Authorization: Bearer {admin_token}

Expected: 404 Not Found
Response: { "isSuccess": false, "message": "Report not found" }
```

### TC26: Get Pending Count - Thành công
```
GET /api/question-reports/stats/pending-count
Authorization: Bearer {admin_token}

Expected: 200 OK
Response: { "isSuccess": true, "data": 15 }
```

---

## 3.5 Test Cases - Review Report

### TC27: Review Report - Đánh dấu Reviewing
```
PUT /api/question-reports/1/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 1,
  "reviewerNotes": "Đang kiểm tra lại đáp án"
}

Expected: 200 OK
```

### TC28: Review Report - Đánh dấu Resolved
```
PUT /api/question-reports/1/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 2,
  "reviewerNotes": "Đã sửa đáp án từ A sang B. Cảm ơn bạn đã báo lỗi!"
}

Expected: 200 OK
```

### TC29: Review Report - Đánh dấu Rejected
```
PUT /api/question-reports/3/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 3,
  "reviewerNotes": "Đã kiểm tra, audio hoạt động bình thường. Có thể do kết nối mạng của bạn."
}

Expected: 200 OK
```

### TC30: Review Report thất bại - Set về Pending
```
PUT /api/question-reports/1/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 0,
  "reviewerNotes": "Chuyển về pending"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "Cannot set status back to Pending" }
```

### TC31: Review Report thất bại - Không có quyền
```
PUT /api/question-reports/5/review
Authorization: Bearer {testcreator_token} (không phải owner)
Content-Type: application/json

{
  "status": 2,
  "reviewerNotes": "Đã sửa"
}

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "You don't have permission to review this report. Only the test creator or admin can review." }
```

---

## 3.6 Test Cases - Update Single Question

### TC32: Update Single Question - Sửa đáp án
```
PUT /api/tests/test-questions/8
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

AnswerOptions[0].Label: A
AnswerOptions[0].Content: He is writing a letter
AnswerOptions[0].IsCorrect: false
AnswerOptions[1].Label: B
AnswerOptions[1].Content: He is reading a book
AnswerOptions[1].IsCorrect: true
AnswerOptions[2].Label: C
AnswerOptions[2].Content: He is making a phone call
AnswerOptions[2].IsCorrect: false
AnswerOptions[3].Label: D
AnswerOptions[3].Content: He is eating lunch
AnswerOptions[3].IsCorrect: false
AlsoUpdateSourceInBank: false

Expected: 200 OK
Response: { "isSuccess": true, "data": "TestQuestion updated successfully" }
```

### TC33: Update Single Question - Sửa nội dung câu hỏi
```
PUT /api/tests/test-questions/8
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Content: What is the man doing in the picture?
Solution: The correct answer is B because the man is clearly reading a book in the library
AlsoUpdateSourceInBank: false

Expected: 200 OK
```

### TC34: Update Single Question - Upload Audio mới
```
PUT /api/tests/test-questions/45
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Audio: [File: new_audio_part2_q30.mp3]
AlsoUpdateSourceInBank: true

Expected: 200 OK
Response: { "isSuccess": true, "data": "TestQuestion updated successfully (including source Question in bank)" }
```

### TC35: Update Single Question - Upload Image mới
```
PUT /api/tests/test-questions/8
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Image: [File: new_image_part1_q5.jpg]
AlsoUpdateSourceInBank: true

Expected: 200 OK
```

---

## 3.7 Test Cases - Update Question Group

### TC36: Update Question Group - Sửa Passage (fix typo)
```
PUT /api/tests/test-questions/150
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Passage: Dear Mr. Johnson,

Thank you for your recent inquiry about our premium membership services. We are pleased to inform you that your application has been approved. You will receive your membership card within 5-7 business days.

If you have any questions, please do not hesitate to contact us.

Best regards,
Customer Service Team

AlsoUpdateSourceInBank: false

Expected: 200 OK
Response: { "isSuccess": true, "data": "TestQuestion (Group) updated successfully" }
```

### TC37: Update Question Group - Sửa 1 Sub-question (theo SubQuestionId từ report)
```
PUT /api/tests/test-questions/150
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Questions[0].QuestionId: 152
Questions[0].Content: How long will it take to receive the membership card?
Questions[0].Explanation: 5-7 business days as stated in the letter
Questions[0].Options[0].Label: A
Questions[0].Options[0].Content: 1-2 business days
Questions[0].Options[0].IsCorrect: false
Questions[0].Options[1].Label: B
Questions[0].Options[1].Content: 3-4 business days
Questions[0].Options[1].IsCorrect: false
Questions[0].Options[2].Label: C
Questions[0].Options[2].Content: 5-7 business days
Questions[0].Options[2].IsCorrect: true
Questions[0].Options[3].Label: D
Questions[0].Options[3].Content: 10-14 business days
Questions[0].Options[3].IsCorrect: false
AlsoUpdateSourceInBank: false

Expected: 200 OK
```

### TC38: Update Question Group - Sửa nhiều Sub-questions
```
PUT /api/tests/test-questions/150
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Questions[0].QuestionId: 151
Questions[0].Content: What is the main purpose of this letter?
...

Questions[1].QuestionId: 152
Questions[1].Content: How long will it take to receive the membership card?
...

Questions[2].QuestionId: 153
Questions[2].Content: Who most likely wrote this letter?
...

AlsoUpdateSourceInBank: true

Expected: 200 OK
Response: { "isSuccess": true, "data": "TestQuestion (Group) updated successfully (including source QuestionGroup in bank)" }
```

---

## 3.8 Test Cases - Update Question Errors

### TC39: Update Test Question thất bại - Không tìm thấy
```
PUT /api/tests/test-questions/99999
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

Content: Test content

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "TestQuestion not found" }
```

### TC40: Update Test Question thất bại - Không có quyền
```
PUT /api/tests/test-questions/8
Authorization: Bearer {testcreator_token} (không phải owner)
Content-Type: multipart/form-data

Content: Test content

Expected: 400 Bad Request
Response: { "isSuccess": false, "message": "You don't have permission to update this question. Only the test creator can modify." }
```

### TC41: Update Test Question thất bại - Unauthorized
```
PUT /api/tests/test-questions/8
Content-Type: multipart/form-data

Content: Test content

Expected: 401 Unauthorized
Response: { "isSuccess": false, "message": "Invalid or missing user token" }
```

---

## 3.9 Test Cases - End-to-End Workflow

### TC42: Workflow hoàn chỉnh - Single Question

**Bước 1: Examinee tạo report**
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 8,
  "reportType": "IncorrectAnswer",
  "description": "Đáp án A sai, đáp án đúng phải là B"
}

Expected: 200 OK - reportId: 10
```

**Bước 2: Admin xem danh sách report pending**
```
GET /api/question-reports?status=0
Authorization: Bearer {admin_token}

Expected: 200 OK - thấy report với reportId: 10
```

**Bước 3: Admin đánh dấu đang xem xét**
```
PUT /api/question-reports/10/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 1,
  "reviewerNotes": "Đang kiểm tra"
}

Expected: 200 OK - status: 1
```

**Bước 4: Admin sửa câu hỏi**
```
PUT /api/tests/test-questions/8
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

AnswerOptions[0].Label: A
AnswerOptions[0].Content: He is writing a letter
AnswerOptions[0].IsCorrect: false
AnswerOptions[1].Label: B
AnswerOptions[1].Content: He is reading a book
AnswerOptions[1].IsCorrect: true
AnswerOptions[2].Label: C
AnswerOptions[2].Content: He is making a phone call
AnswerOptions[2].IsCorrect: false
AnswerOptions[3].Label: D
AnswerOptions[3].Content: He is eating lunch
AnswerOptions[3].IsCorrect: false
AlsoUpdateSourceInBank: true

Expected: 200 OK
```

**Bước 5: Admin đánh dấu đã giải quyết**
```
PUT /api/question-reports/10/review
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": 2,
  "reviewerNotes": "Đã sửa đáp án từ A sang B. Cảm ơn bạn đã báo lỗi!"
}

Expected: 200 OK - status: 2
```

**Bước 6: Examinee kiểm tra report của mình**
```
GET /api/question-reports/my-reports
Authorization: Bearer {examinee_token}

Expected: 200 OK - thấy report với status: 2 (Resolved)
```

---

### TC43: Workflow hoàn chỉnh - Question Group

**Bước 1: Examinee tạo report cho câu hỏi cụ thể trong group**
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 152,
  "reportType": "IncorrectAnswer",
  "description": "Câu 152 đáp án C sai, phải là D"
}

Expected: 200 OK
- reportId: 11
- isQuestionGroup: true
- subQuestionId: 152
- reportedSubQuestion có chi tiết câu 152
```

**Bước 2: TestCreator xem chi tiết report**
```
GET /api/question-reports/11
Authorization: Bearer {testcreator_token}

Expected: 200 OK
- Thấy questionGroupSnapshot với TOÀN BỘ passage và questionSnapshots
- Thấy subQuestionId = 152 để biết câu nào bị report
- Thấy reportedSubQuestion với chi tiết câu 152
```

**Bước 3: TestCreator đánh dấu đang xem xét**
```
PUT /api/question-reports/11/review
Authorization: Bearer {testcreator_token}
Content-Type: application/json

{
  "status": 1,
  "reviewerNotes": "Đang kiểm tra đáp án câu 152"
}

Expected: 200 OK - status: 1
```

**Bước 4: TestCreator sửa câu 152 trong group (dùng SubQuestionId từ report)**
```
PUT /api/tests/test-questions/150
Authorization: Bearer {testcreator_token}
Content-Type: multipart/form-data

Questions[0].QuestionId: 152
Questions[0].Content: How long will it take to receive the membership card?
Questions[0].Explanation: 5-7 business days as stated in the letter
Questions[0].Options[0].Label: A
Questions[0].Options[0].Content: 1-2 days
Questions[0].Options[0].IsCorrect: false
Questions[0].Options[1].Label: B
Questions[0].Options[1].Content: 3-4 days
Questions[0].Options[1].IsCorrect: false
Questions[0].Options[2].Label: C
Questions[0].Options[2].Content: 5-7 days
Questions[0].Options[2].IsCorrect: false
Questions[0].Options[3].Label: D
Questions[0].Options[3].Content: 5-7 business days
Questions[0].Options[3].IsCorrect: true
AlsoUpdateSourceInBank: true

Expected: 200 OK
```

**Bước 5: TestCreator đánh dấu đã giải quyết**
```
PUT /api/question-reports/11/review
Authorization: Bearer {testcreator_token}
Content-Type: application/json

{
  "status": 2,
  "reviewerNotes": "Đã sửa đáp án câu 152 từ C sang D. Cảm ơn bạn đã phản hồi!"
}

Expected: 200 OK - status: 2
```

**Bước 6: Examinee kiểm tra report của mình**
```
GET /api/question-reports/my-reports
Authorization: Bearer {examinee_token}

Expected: 200 OK
- Thấy report với status: 2 (Resolved)
- reportedSubQuestion hiển thị như câu hỏi đơn
- questionContent = "How long will it take to receive the membership card?"
```

---

### TC44: Workflow - Report nhiều câu trong cùng group

**Bước 1: Examinee report câu 151**
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 151,
  "reportType": "Unclear",
  "description": "Câu hỏi 151 không rõ ràng"
}

Expected: 200 OK - reportId: 12
```

**Bước 2: Examinee report câu 153 (cùng group nhưng SubQuestionId khác)**
```
POST /api/question-reports
Authorization: Bearer {examinee_token}
Content-Type: application/json

{
  "testQuestionId": 150,
  "subQuestionId": 153,
  "reportType": "IncorrectAnswer",
  "description": "Câu 153 đáp án sai"
}

Expected: 200 OK - reportId: 13
```

**Bước 3: Creator xem danh sách reports cho TestQuestionId 150**
```
GET /api/question-reports?testQuestionId=150
Authorization: Bearer {testcreator_token}

Expected: 200 OK
- Có 2 reports với cùng testQuestionId=150 nhưng khác subQuestionId (151 và 153)
```

---

# APPENDIX

## A. ReportStatus Enum
| Value | Name | Description |
|-------|------|-------------|
| 0 | `Pending` | Chưa xử lý |
| 1 | `Reviewing` | Đang xem xét |
| 2 | `Resolved` | Đã giải quyết |
| 3 | `Rejected` | Từ chối (không phải lỗi) |

## B. ReportType Values
| Value | Description |
|-------|-------------|
| `IncorrectAnswer` | Đáp án sai |
| `Typo` | Lỗi chính tả |
| `AudioIssue` | Lỗi audio |
| `ImageIssue` | Lỗi hình ảnh |
| `Unclear` | Câu hỏi không rõ ràng |
| `Other` | Lỗi khác |

## C. Authorization Roles
| Role | Permissions |
|------|-------------|
| `Examinee` | Tạo report, xem report của mình |
| `TestCreator` | Xem/review report của test mình tạo, sửa câu hỏi của test mình |
| `Admin` | Xem/review tất cả report, sửa tất cả câu hỏi |

## D. API Endpoints Summary
| # | Method | Endpoint | Role | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/question-reports` | Examinee | Tạo báo cáo lỗi |
| 2 | GET | `/api/question-reports/my-reports` | Examinee | Xem báo cáo của tôi |
| 3 | GET | `/api/question-reports` | Admin, TestCreator | Xem tất cả báo cáo |
| 4 | GET | `/api/question-reports/{reportId}` | Admin, TestCreator | Xem chi tiết báo cáo |
| 5 | PUT | `/api/question-reports/{reportId}/review` | Admin, TestCreator | Xử lý báo cáo |
| 6 | GET | `/api/question-reports/stats/pending-count` | Admin, TestCreator | Đếm báo cáo chờ xử lý |
| 7 | PUT | `/api/tests/test-questions/{testQuestionId}` | Admin, TestCreator | Cập nhật câu hỏi |

## E. Response Fields cho QuestionReportDto

| Field | Type | Description | Single Question | Question Group |
|-------|------|-------------|-----------------|----------------|
| `reportId` | int | ID của report | ✅ | ✅ |
| `testQuestionId` | int | ID của TestQuestion | ✅ | ✅ |
| `isQuestionGroup` | bool | Có phải Question Group không | `false` | `true` |
| `subQuestionId` | int? | ID câu hỏi con bị report | `null` | ID |
| `questionSnapshot` | object | Chi tiết câu hỏi đơn | ✅ Có dữ liệu | `null` |
| `questionGroupSnapshot` | object | Chi tiết toàn bộ group | `null` | ✅ Có dữ liệu |
| `reportedSubQuestion` | object | Chi tiết câu con bị report | `null` | ✅ Có dữ liệu |
| `groupPassage` | string | Đoạn văn của group | `null` | Có dữ liệu |
| `groupAudioUrl` | string | Audio của group | `null` | URL hoặc null |
| `groupImageUrl` | string | Hình của group | `null` | URL hoặc null |
| `groupQuestionCount` | int? | Số câu trong group | `null` | Số lượng |
| `questionContent` | string | Nội dung để hiển thị | Content câu đơn | Content câu con |
| `partId` | int | ID của Part | ✅ | ✅ |
| `partName` | string | Tên Part | ✅ | ✅ |
| `testId` | int | ID của Test | ✅ | ✅ |
| `testName` | string | Tên Test | ✅ | ✅ |
| `sourceQuestionId` | int? | ID Question gốc trong bank | ID hoặc null | `null` |
| `sourceQuestionGroupId` | int? | ID QuestionGroup gốc | `null` | ID hoặc null |
| `reportedBy` | Guid | ID người report | ✅ | ✅ |
| `reporterName` | string | Tên người report | ✅ | ✅ |
| `reporterEmail` | string | Email người report | ✅ | ✅ |
| `reportType` | string | Loại lỗi | ✅ | ✅ |
| `description` | string | Mô tả lỗi | ✅ | ✅ |
| `status` | int | Trạng thái | ✅ | ✅ |
| `reviewedBy` | Guid? | ID người review | Guid hoặc null | Guid hoặc null |
| `reviewerName` | string | Tên reviewer | Tên hoặc null | Tên hoặc null |
| `reviewerNotes` | string | Ghi chú reviewer | Notes hoặc null | Notes hoặc null |
| `createdAt` | DateTime | Ngày tạo | ✅ | ✅ |
| `reviewedAt` | DateTime? | Ngày review | DateTime hoặc null | DateTime hoặc null |

---

**Tổng số Test Cases: 44**
