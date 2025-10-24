export const MOCK_PARTS = [
{ id: 1, title: 'Part 1: Photographs', description: 'Listen to descriptions of photographs', questions: 3, audio: true },
{ id: 2, title: 'Part 2: Question-Response', description: 'Choose the correct response', questions: 5, audio: true },
{ id: 3, title: 'Part 3: Conversations', description: 'Listen and answer', questions: 4, audio: true },
{ id: 4, title: 'Part 4: Talks', description: 'Listen to talks and answer', questions: 3, audio: true },
{ id: 5, title: 'Part 5: Incomplete Sentences', description: 'Choose words to complete sentences', questions: 6 },
{ id: 6, title: 'Part 6: Text Completion', description: 'Complete short texts', questions: 3 },
{ id: 7, title: 'Part 7: Reading Comprehension', description: 'Read passages and answer', questions: 4 },
];


export function generateMockQuestionsFromParts(partIds) {
const partsMap = MOCK_PARTS.reduce((acc,p)=>{ acc[p.id]=p; return acc },{});
const selectedParts = partIds.map(id=>partsMap[id]).filter(Boolean);
const questions = [];
let globalIndex = 1;
for (const p of selectedParts) {
for (let i = 1; i <= p.questions; i++) {
const id = `${p.id}-${i}`;
questions.push({
id,
partId: p.id,
partTitle: p.title,
indexInPart: i,
globalIndex: globalIndex++,
question: `(${p.title}) Question ${i}: Choose the best answer for this sample question.`,
options: ['A','B','C','D'].map((o,idx)=>({ key:o, text:`${o}. Option ${idx+1}` })),
audioUrl: p.audio ? `/audio/sample_${p.id}_${i}.mp3` : null,
// We'll store correct answer for scoring (mock)
correct: ['A','B','C','D'][Math.floor(Math.random()*4)]
});
}
}
return questions;
}