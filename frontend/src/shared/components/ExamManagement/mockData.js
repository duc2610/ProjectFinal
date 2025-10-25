export const MOCK_EXAMS = [
  {
    id: "exam-1",
    title: "TOEIC Practice Test 1",
    description: "Full-length TOEIC practice test with listening and reading.",
    duration: 120,
    createdAt: "2024-01-15",
    parts: ["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"],
    isActive: true
  },
  {
    id: "exam-2",
    title: "TOEIC Practice Test 2",
    description: "Advanced level TOEIC practice test",
    duration: 90,
    createdAt: "2024-02-01",
    parts: ["Part 1","Part 2","Part 3","Part 4","Part 5","Part 6","Part 7"],
    isActive: true
  }
];

const rnd = (n=10000) => Math.floor(Math.random()*n);

export const QUESTION_BANK = [
  {
    id: `bank-${rnd()}`,
    type: "Listening",
    part: "Part 1",
    question: "Look at the picture and choose the correct description.",
    options: { A: "People are talking", B: "Someone holds umbrella", C: "There is a dog", D: "The room is empty" },
    correct: "B",
    imageUrl: null,
    audioUrl: null,
    explanation: "",
    isActive: true,
    createdAt: "2024-01-10"
  },
  {
    id: `bank-${rnd()}`,
    type: "Listening",
    part: "Part 2",
    question: "When will the meeting start?",
    options: { A: "At 9", B: "In the conference room", C: "Yes, I will", D: "No, thanks" },
    correct: "A",
    imageUrl: null,
    audioUrl: null,
    explanation: "",
    isActive: true,
    createdAt: "2024-01-11"
  },
  {
    id: `bank-${rnd()}`,
    type: "Reading",
    part: "Part 5",
    question: "The company ____ a new product line next month.",
    options: { A: "launches", B: "is launching", C: "launch", D: "launched" },
    correct: "B",
    imageUrl: null,
    audioUrl: null,
    explanation: "",
    isActive: true,
    createdAt: "2024-01-12"
  },
  {
    id: `bank-${rnd()}`,
    type: "Reading",
    part: "Part 7",
    question: "Please review the attached document and ____ any necessary changes.",
    options: { A: "make", B: "made", C: "making", D: "has made" },
    correct: "A",
    imageUrl: null,
    audioUrl: null,
    explanation: "",
    isActive: true,
    createdAt: "2024-01-13"
  }
];
