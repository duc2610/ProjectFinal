export const MOCK_EXAMS = [
  {
    id: "exam-1",
    title: "TOEIC Practice Test 1",
    description: "Full-length TOEIC practice test with listening and reading sections.",
    duration: 120,
    createdAt: "2024-01-15",
    parts: [1,2,3,4,5,6,7]
  },
  {
    id: "exam-2",
    title: "TOEIC Practice Test 2",
    description: "Advanced level TOEIC practice test",
    duration: 120,
    createdAt: "2024-02-01",
    parts: [1,2,3,4,5,6,7]
  }
];

// Question bank: sample pool you can pick from
export const QUESTION_BANK = [
  {
    id: "bank-1",
    type: "Listening",
    part: "Part 1",
    question: "Look at the picture and choose the correct description.",
    options: { A: "People are talking", B: "Someone holds umbrella", C: "There is a dog", D: "The room is empty" },
    correct: "B",
    imageUrl: null,
    audioUrl: null,
    explanation: ""
  },
  {
    id: "bank-2",
    type: "Listening",
    part: "Part 2",
    question: "When will the meeting start?",
    options: { A: "At 9", B: "In the conference room", C: "Yes, I will", D: "No, thanks" },
    correct: "A",
    imageUrl: null,
    audioUrl: null,
    explanation: ""
  },
  {
    id: "bank-3",
    type: "Reading",
    part: "Part 5",
    question: "The company ____ a new product line next month.",
    options: { A: "launches", B: "is launching", C: "launch", D: "launched" },
    correct: "B",
    imageUrl: null,
    audioUrl: null,
    explanation: ""
  },
  {
    id: "bank-4",
    type: "Reading",
    part: "Part 7",
    question: "Please review the attached document and ____ any necessary changes.",
    options: { A: "make", B: "made", C: "making", D: "has made" },
    correct: "A",
    imageUrl: null,
    audioUrl: null,
    explanation: ""
  }
];
