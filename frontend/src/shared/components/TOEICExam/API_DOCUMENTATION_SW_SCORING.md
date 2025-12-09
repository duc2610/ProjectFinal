# API Documentation: Speaking & Writing Scoring

## Tổng quan thay đổi

Cập nhật cách tính điểm và response cho bài thi Speaking/Writing, phân biệt giữa **Simulator** (thi thử chuẩn TOEIC) và **Practice** (luyện tập).

| Mode | Điểm hiển thị | Thang điểm |
|------|---------------|------------|
| **Simulator** | TOEIC Scale | 0-200 mỗi skill, 0-400 tổng |
| **Practice** | Raw Score | 0-100 |

---

## API 1: Submit Bulk Assessment (Nộp bài S&W)

### Endpoint
```
POST /api/assessment/bulk
```

### Request

```json
{
  "testResultId": 123,
  "duration": 3600,
  "testType": "Simulator",
  "parts": [
    {
      "testQuestionId": 1001,
      "partType": "writing_sentence",
      "answerText": "The woman is reading a book in the library.",
      "audioFileUrl": null
    },
    {
      "testQuestionId": 1002,
      "partType": "writing_email",
      "answerText": "Dear Mr. Smith, I am writing to inquire about...",
      "audioFileUrl": null
    },
    {
      "testQuestionId": 1003,
      "partType": "read_aloud",
      "answerText": null,
      "audioFileUrl": "https://storage.example.com/audio/user123_q1003.mp3"
    }
  ]
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `testResultId` | int | ✅ | ID của TestResult đã tạo khi bắt đầu làm bài |
| `duration` | int | ✅ | Thời gian làm bài (giây) |
| `testType` | string | ❌ | `"Simulator"` hoặc `"Practice"`. Nếu không truyền, lấy từ Test |
| `parts` | array | ✅ | Danh sách các câu hỏi đã trả lời |
| `parts[].testQuestionId` | int | ✅ | ID của TestQuestion |
| `parts[].partType` | string | ✅ | Loại part: `writing_sentence`, `writing_email`, `writing_essay`, `read_aloud`, `describe_picture`, `respond_questions`, `respond_with_info`, `express_opinion` |
| `parts[].answerText` | string | ❌ | Câu trả lời text (Writing) |
| `parts[].audioFileUrl` | string | ❌ | URL audio trả lời (Speaking) - client upload audio trước rồi gửi URL |

**Lưu ý về Group Questions (Speaking Part 3/4):**
- Part 3 (Questions 5-7): Gửi 1 `testQuestionId` đại diện cho group, 1 audio cho cả 3 câu
- Part 4 (Questions 8-10): Tương tự, 1 `testQuestionId` + 1 audio cho group

---

### Response (ĐÃ CẬP NHẬT)

#### Case 1: Simulator S&W (Speaking + Writing chung)

**Điều kiện:** `testType = "Simulator"` và `testSkill = SW`

```json
{
  "isSuccess": true,
  "data": {
    "testId": 45,
    "testResultId": 123,
    "isSimulator": true,

    "writingScore": 150,
    "speakingScore": 170,
    "totalScore": 320,

    "writingRawScore": 72.5,
    "speakingRawScore": 78.3,

    "totalQuestions": 19,
    "answeredQuestions": 15,
    "skippedQuestions": 4,

    "perPartFeedbacks": [
      {
        "testQuestionId": 1001,
        "feedbackId": 2001,
        "userAnswerId": 5001,
        "answerText": "The woman is reading a book in the library.",
        "answerAudioUrl": null,
        "score": 85.0,
        "content": "Good sentence structure with correct grammar...",
        "aiScorer": "gemini-1.5-flash",
        "detailedScores": {
          "grammar": 90,
          "vocabulary": 85,
          "relevance": 80
        },
        "detailedAnalysis": {
          "strengths": ["Clear sentence structure", "Appropriate vocabulary"],
          "weaknesses": ["Could add more detail"]
        },
        "recommendations": [
          "Try using more descriptive adjectives",
          "Consider adding temporal context"
        ],
        "transcription": "",
        "correctedText": "The woman is reading a book in the quiet library.",
        "audioDuration": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "partId": 8,
        "partName": "Write a Sentence Based on a Picture",
        "questionContent": {
          "questionId": 101,
          "content": "Write a sentence based on the picture",
          "imageUrl": "https://storage.example.com/images/q101.jpg"
        }
      }
    ]
  },
  "errorMessage": null
}
```

**Giải thích các trường Response:**

| Field | Type | Description |
|-------|------|-------------|
| `testId` | int | ID của bài thi |
| `testResultId` | int | ID của kết quả bài thi |
| `isSimulator` | bool | `true` = Simulator mode, `false` = Practice mode |
| `writingScore` | double? | Điểm Writing theo thang TOEIC (0-200) - chỉ Simulator |
| `speakingScore` | double? | Điểm Speaking theo thang TOEIC (0-200) - chỉ Simulator |
| `totalScore` | double | Simulator: 0-400, Practice: 0-100 |
| `writingRawScore` | double? | Điểm thô Writing (0-100) |
| `speakingRawScore` | double? | Điểm thô Speaking (0-100) |
| `totalQuestions` | int | Tổng số câu hỏi trong bài thi |
| `answeredQuestions` | int | Số câu đã trả lời |
| `skippedQuestions` | int | Số câu bỏ qua (= 0 điểm) |

**Giải thích các trường `perPartFeedbacks[]`:**

| Field | Type | Description |
|-------|------|-------------|
| `testQuestionId` | int | ID của TestQuestion |
| `feedbackId` | int | ID của AIFeedback |
| `userAnswerId` | int | ID của UserAnswer |
| `answerText` | string? | Câu trả lời text (Writing) |
| `answerAudioUrl` | string? | URL audio đã upload (Speaking) |
| `score` | double | Điểm của câu này (0-100) |
| `content` | string | Feedback tổng quan từ AI |
| `aiScorer` | string | Model AI đã chấm (vd: `gemini-1.5-flash`) |
| `detailedScores` | object | Điểm chi tiết theo tiêu chí (grammar, vocabulary, ...) |
| `detailedAnalysis` | object | Phân tích chi tiết (strengths, weaknesses) |
| `recommendations` | string[] | Danh sách gợi ý cải thiện |
| `transcription` | string | Bản ghi chép audio (Speaking) - empty string nếu Writing |
| `correctedText` | string | Câu trả lời đã được sửa |
| `audioDuration` | double? | Thời lượng audio (giây) - chỉ Speaking |
| `createdAt` | datetime | Thời điểm chấm bài |
| `partId` | int | ID của Part |
| `partName` | string? | Tên Part (vd: "Write a Sentence Based on a Picture") |
| `questionContent` | object? | Nội dung câu hỏi gốc |

---

#### Case 2: Simulator Writing Only

**Điều kiện:** `testType = "Simulator"` và `testSkill = Writing`

```json
{
  "isSuccess": true,
  "data": {
    "testId": 46,
    "testResultId": 124,
    "isSimulator": true,

    "writingScore": 160,
    "speakingScore": null,
    "totalScore": 160,

    "writingRawScore": 75.5,
    "speakingRawScore": null,

    "totalQuestions": 8,
    "answeredQuestions": 8,
    "skippedQuestions": 0,

    "perPartFeedbacks": [...]
  }
}
```

---

#### Case 3: Simulator Speaking Only

**Điều kiện:** `testType = "Simulator"` và `testSkill = Speaking`

```json
{
  "isSuccess": true,
  "data": {
    "testId": 47,
    "testResultId": 125,
    "isSimulator": true,

    "writingScore": null,
    "speakingScore": 180,
    "totalScore": 180,

    "writingRawScore": null,
    "speakingRawScore": 82.0,

    "totalQuestions": 11,
    "answeredQuestions": 10,
    "skippedQuestions": 1,

    "perPartFeedbacks": [...]
  }
}
```

---

#### Case 4: Practice Writing

**Điều kiện:** `testType = "Practice"` và `testSkill = Writing`

```json
{
  "isSuccess": true,
  "data": {
    "testId": 48,
    "testResultId": 126,
    "isSimulator": false,

    "writingScore": null,
    "speakingScore": null,
    "totalScore": 65.5,

    "writingRawScore": 65.5,
    "speakingRawScore": null,

    "totalQuestions": 5,
    "answeredQuestions": 4,
    "skippedQuestions": 1,

    "perPartFeedbacks": [...]
  }
}
```

**Giải thích:**
- `isSimulator = false` → Practice mode
- `writingScore = null` → Không có điểm TOEIC scale
- `totalScore = 65.5` → Điểm thô trung bình (0-100)
- `writingRawScore = 65.5` → Giống totalScore vì chỉ có Writing

---

#### Case 5: Practice Speaking

**Điều kiện:** `testType = "Practice"` và `testSkill = Speaking`

```json
{
  "isSuccess": true,
  "data": {
    "testId": 49,
    "testResultId": 127,
    "isSimulator": false,

    "writingScore": null,
    "speakingScore": null,
    "totalScore": 72.0,

    "writingRawScore": null,
    "speakingRawScore": 72.0,

    "totalQuestions": 3,
    "answeredQuestions": 3,
    "skippedQuestions": 0,

    "perPartFeedbacks": [...]
  }
}
```

---

#### Case 6: Không trả lời câu nào (Simulator)

**Điều kiện:** User vào thi nhưng không trả lời câu nào

```json
{
  "isSuccess": true,
  "data": {
    "testId": 50,
    "testResultId": 128,
    "isSimulator": true,

    "writingScore": 15,
    "speakingScore": 15,
    "totalScore": 30,

    "writingRawScore": 0,
    "speakingRawScore": 0,

    "totalQuestions": 19,
    "answeredQuestions": 0,
    "skippedQuestions": 19,

    "perPartFeedbacks": []
  }
}
```

**Giải thích:**
- Câu không trả lời = **0 điểm**
- Raw score = 0 → TOEIC scale = Level 1 (0-30) → 15 điểm

---

#### Case 7: Không trả lời câu nào (Practice)

```json
{
  "isSuccess": true,
  "data": {
    "testId": 51,
    "testResultId": 129,
    "isSimulator": false,

    "writingScore": null,
    "speakingScore": null,
    "totalScore": 0,

    "writingRawScore": 0,
    "speakingRawScore": null,

    "totalQuestions": 5,
    "answeredQuestions": 0,
    "skippedQuestions": 5,

    "perPartFeedbacks": []
  }
}
```

---

## API 2: Get Test Result Detail (Xem kết quả bài thi)

### Endpoint
```
GET /api/tests/result/detail/{testResultId}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `testResultId` | int | ✅ | ID của TestResult cần xem |

### Response (ĐÃ CẬP NHẬT)

Response giống với API Submit Bulk Assessment, với thêm thông tin về bài thi:

#### Case 1: Simulator S&W

```json
{
  "isSuccess": true,
  "data": {
    "testResultId": 123,
    "testId": 45,
    "title": "TOEIC S&W Full Test #1",
    "testType": 1,
    "testSkill": 3,
    "duration": 4800,
    "timeResuilt": 3650,
    "quantityQuestion": 19,

    "isSimulator": true,

    "writingScore": 150,
    "speakingScore": 170,
    "totalScore": 320,

    "writingRawScore": 72.5,
    "speakingRawScore": 78.3,

    "totalQuestions": 19,
    "answeredQuestions": 15,
    "skippedQuestions": 4,

    "isSelectTime": false,
    "status": 2,

    "perPartFeedbacks": [
      {
        "testQuestionId": 1001,
        "feedbackId": 2001,
        "userAnswerId": 5001,
        "answerText": "The woman is reading a book in the library.",
        "answerAudioUrl": null,
        "score": 85.0,
        "content": "Good sentence structure with correct grammar...",
        "aiScorer": "gemini-1.5-flash",
        "detailedScores": {
          "grammar": 90,
          "vocabulary": 85,
          "relevance": 80
        },
        "detailedAnalysis": {
          "strengths": ["Clear sentence structure", "Appropriate vocabulary"],
          "weaknesses": ["Could add more detail"]
        },
        "recommendations": [
          "Try using more descriptive adjectives",
          "Consider adding temporal context"
        ],
        "transcription": "",
        "correctedText": "The woman is reading a book in the quiet library.",
        "audioDuration": null,
        "createdAt": "2024-01-15T10:30:00Z",
        "partId": 8,
        "partName": "Write a Sentence Based on a Picture",
        "questionContent": {
          "questionId": 101,
          "content": "Write a sentence based on the picture",
          "imageUrl": "https://storage.example.com/images/q101.jpg"
        }
      }
    ]
  }
}
```

**Các trường bổ sung so với Submit API:**

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Tên bài thi |
| `testType` | enum | 1 = Simulator, 2 = Practice |
| `testSkill` | enum | 1 = Speaking, 2 = Writing, 3 = SW, 4 = LR |
| `duration` | int | Thời gian tối đa của bài thi (giây) |
| `timeResuilt` | int | Thời gian user đã làm (giây) |
| `quantityQuestion` | int | Tổng số câu hỏi |
| `isSelectTime` | bool? | User có chọn chế độ tính giờ không |
| `status` | enum | 1 = InProgress, 2 = Completed |

---

#### Case 2: Practice Writing

```json
{
  "isSuccess": true,
  "data": {
    "testResultId": 126,
    "testId": 48,
    "title": "Writing Practice - Sentence Part",
    "testType": 2,
    "testSkill": 2,
    "duration": 1200,
    "timeResuilt": 850,
    "quantityQuestion": 5,

    "isSimulator": false,

    "writingScore": null,
    "speakingScore": null,
    "totalScore": 65.5,

    "writingRawScore": 65.5,
    "speakingRawScore": null,

    "totalQuestions": 5,
    "answeredQuestions": 4,
    "skippedQuestions": 1,

    "isSelectTime": true,
    "status": 2,

    "perPartFeedbacks": [...]
  }
}
```

---

#### Case 3: Practice Speaking

```json
{
  "isSuccess": true,
  "data": {
    "testResultId": 127,
    "testId": 49,
    "title": "Speaking Practice - Read Aloud",
    "testType": 2,
    "testSkill": 1,
    "duration": 600,
    "timeResuilt": 420,
    "quantityQuestion": 3,

    "isSimulator": false,

    "writingScore": null,
    "speakingScore": null,
    "totalScore": 72.0,

    "writingRawScore": null,
    "speakingRawScore": 72.0,

    "totalQuestions": 3,
    "answeredQuestions": 3,
    "skippedQuestions": 0,

    "isSelectTime": true,
    "status": 2,

    "perPartFeedbacks": [...]
  }
}
```

---

## Enum Values Reference

### TestType
| Value | Name | Description |
|-------|------|-------------|
| 1 | Simulator | Thi thử chuẩn TOEIC |
| 2 | Practice | Luyện tập |

### TestSkill
| Value | Name | Description |
|-------|------|-------------|
| 1 | Speaking | Chỉ Speaking |
| 2 | Writing | Chỉ Writing |
| 3 | SW | Speaking + Writing |
| 4 | LR | Listening + Reading |

### TestResultStatus
| Value | Name | Description |
|-------|------|-------------|
| 1 | InProgress | Đang làm bài |
| 2 | Completed | Đã hoàn thành |

---

## Logic tính điểm

### Simulator Mode

1. **Câu không trả lời = 0 điểm**
2. **Tính weighted score theo part:**
   - Writing: Sentence (20%), Email (30%), Essay (50%)
   - Speaking: Read Aloud (15%), Describe Picture (15%), Respond Questions (20%), Respond with Info (20%), Express Opinion (30%)
3. **Quy đổi sang TOEIC scale (0-200):**
   - Writing: 9 proficiency levels
   - Speaking: 8 proficiency levels
4. **Tổng điểm = WritingScore + SpeakingScore (0-400)**

### Practice Mode

1. **Câu không trả lời = 0 điểm**
2. **Tính trung bình cộng điểm thô của tất cả câu hỏi**
3. **Không quy đổi sang TOEIC scale**
4. **Tổng điểm = Raw score trung bình (0-100)**

---

## Hướng dẫn hiển thị trên FE

### Màn hình kết quả Simulator

```
┌─────────────────────────────────────┐
│  TOEIC S&W Simulator Result         │
├─────────────────────────────────────┤
│                                     │
│  Writing Score:    150 / 200        │
│  Speaking Score:   170 / 200        │
│  ─────────────────────────          │
│  Total Score:      320 / 400        │
│                                     │
│  Questions: 15/19 answered          │
│  Time: 60:50 / 80:00                │
│                                     │
└─────────────────────────────────────┘
```

### Màn hình kết quả Practice

```
┌─────────────────────────────────────┐
│  Writing Practice Result            │
├─────────────────────────────────────┤
│                                     │
│  Score:    65.5 / 100               │
│                                     │
│  Questions: 4/5 answered            │
│  Time: 14:10 / 20:00                │
│                                     │
└─────────────────────────────────────┘
```

---

## Checklist cho FE

### Khi nhận response, check các trường sau:

- [ ] `isSimulator` để xác định mode
- [ ] Nếu `isSimulator = true`:
  - Hiển thị `writingScore`, `speakingScore` (0-200)
  - Hiển thị `totalScore` (0-400)
  - Label: "TOEIC Score"
- [ ] Nếu `isSimulator = false`:
  - Hiển thị `totalScore` (0-100)
  - Hoặc `writingRawScore` / `speakingRawScore` tùy skill
  - Label: "Score" hoặc "Raw Score"
- [ ] Hiển thị `answeredQuestions` / `totalQuestions`
- [ ] Hiển thị `skippedQuestions` nếu > 0 (có thể highlight cảnh báo)

---

## Error Responses

### 401 Unauthorized
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "Invalid or missing user ID."
}
```

### 404 Not Found
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "Test result not found."
}
```

### 400 Bad Request
```json
{
  "isSuccess": false,
  "data": null,
  "errorMessage": "No parts provided for assessment."
}
```
