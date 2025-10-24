// Mock data structured by TOEIC parts. Put sample audio/images in public/audio/ and public/images/ if you want playback/display.
export const MOCK_PARTS = [
  { id: 1, title: "Part 1: Photographs", description: "Listen & choose", questions: 3, audio: true, type: "photo" },
  { id: 2, title: "Part 2: Question-Response", description: "Short Q&A", questions: 4, audio: true, type: "audio" },
  { id: 3, title: "Part 3: Conversations", description: "Conversations", questions: 4, audio: true, type: "audio" },
  { id: 4, title: "Part 4: Talks", description: "Talks", questions: 3, audio: true, type: "audio" },
  { id: 5, title: "Part 5: Incomplete Sentences", description: "Single-sentence grammar", questions: 6, audio: false, type: "mcq" },
  { id: 6, title: "Part 6: Text Completion", description: "Text completion", questions: 3, audio: false, type: "mcq" },
  { id: 7, title: "Part 7: Reading Comprehension", description: "Passages", questions: 4, audio: false, type: "passage" },
];

const randCorrect = () => ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];

export function generateMockQuestionsFromParts(partIds) {
  const partsMap = MOCK_PARTS.reduce((acc, p) => ((acc[p.id] = p), acc), {});
  const selected = partIds.map((id) => partsMap[id]).filter(Boolean);
  const questions = [];
  let global = 1;

  for (const p of selected) {
    for (let i = 1; i <= p.questions; i++) {
      const id = `${p.id}-${i}`;
      const base = {
        id,
        partId: p.id,
        partTitle: p.title,
        indexInPart: i,
        globalIndex: global++,
        type: p.type,
        correct: randCorrect(),
      };

      if (p.type === "photo") {
        questions.push({
          ...base,
          question: `Look at the picture. What is most likely true? (sample)`,
          imageUrl: `/images/part1_${i}.jpg`, // optional
          options: [
            { key: "A", text: "A. People are talking" },
            { key: "B", text: "B. A person is holding an umbrella" },
            { key: "C", text: "C. There is a dog nearby" },
            { key: "D", text: "D. The room is empty" },
          ],
          audioUrl: `/audio/part1_${i}.mp3`,
        });
      } else if (p.type === "audio") {
        questions.push({
          ...base,
          question: `Listen to the recording. Choose the best response.`,
          options: [
            { key: "A", text: "A. Option 1" },
            { key: "B", text: "B. Option 2" },
            { key: "C", text: "C. Option 3" },
            { key: "D", text: "D. Option 4" },
          ],
          audioUrl: `/audio/part${p.id}_${i}.mp3`,
        });
      } else if (p.type === "mcq") {
        questions.push({
          ...base,
          question: `Incomplete sentence: (sample grammar) Choose the best word.`,
          options: [
            { key: "A", text: "A. before" },
            { key: "B", text: "B. during" },
            { key: "C", text: "C. while" },
            { key: "D", text: "D. although" },
          ],
        });
      } else if (p.type === "passage") {
        questions.push({
          ...base,
          question: `Passage Q: What is the main idea? (sample)`,
          passage:
            "This is a sample passage used for mock TOEIC Part 7. Read and answer the question.",
          options: [
            { key: "A", text: "A. Main idea 1" },
            { key: "B", text: "B. Main idea 2" },
            { key: "C", text: "C. Main idea 3" },
            { key: "D", text: "D. Main idea 4" },
          ],
        });
      } else {
        questions.push({
          ...base,
          question: "Sample question",
          options: [
            { key: "A", text: "A" },
            { key: "B", text: "B" },
            { key: "C", text: "C" },
            { key: "D", text: "D" },
          ],
        });
      }
    }
  }
  return questions;
}
