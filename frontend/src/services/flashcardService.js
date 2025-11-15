import { api } from "./apiClient";

const unwrap = (res) => res?.data?.data ?? res?.data;

/**
 * Flashcard Set APIs
 */
export async function getUserFlashcardSets() {
  const res = await api.get("/api/flashcards/sets");
  return unwrap(res);
}

export async function getFlashcardSetById(setId) {
  const res = await api.get(`/api/flashcards/sets/${setId}`);
  return unwrap(res);
}

export async function getPublicFlashcardSets() {
  const res = await api.get("/api/flashcards/public");
  return unwrap(res);
}

export async function createFlashcardSet(data) {
  const res = await api.post("/api/flashcards/sets", data);
  return unwrap(res);
}

export async function updateFlashcardSet(setId, data) {
  const res = await api.put(`/api/flashcards/sets/${setId}`, data);
  return unwrap(res);
}

export async function deleteFlashcardSet(setId) {
  const res = await api.delete(`/api/flashcards/sets/${setId}`);
  return unwrap(res);
}

/**
 * Flashcard Card APIs
 */
export async function getFlashcardsBySetId(setId) {
  const res = await api.get(`/api/flashcards/sets/${setId}/cards`);
  return unwrap(res);
}

export async function createFlashcard(data) {
  const res = await api.post("/api/flashcards/cards", data);
  return unwrap(res);
}

export async function bulkCreateFlashcards(data) {
  const res = await api.post("/api/flashcards/cards/bulk", data);
  return unwrap(res);
}

export async function updateFlashcard(cardId, data) {
  const res = await api.put(`/api/flashcards/cards/${cardId}`, data);
  return unwrap(res);
}

export async function deleteFlashcard(cardId) {
  const res = await api.delete(`/api/flashcards/cards/${cardId}`);
  return unwrap(res);
}

export async function addFlashcardFromTest(data) {
  const res = await api.post("/api/flashcards/cards/from-test", data);
  return unwrap(res);
}

/**
 * Study Mode APIs
 */
export async function startStudySession(setId) {
  const res = await api.get(`/api/flashcards/study/${setId}`);
  return unwrap(res);
}

export async function markCardKnowledge(data) {
  const res = await api.post("/api/flashcards/study/mark", data);
  return unwrap(res);
}

export async function getStudyStats(setId) {
  const res = await api.get(`/api/flashcards/study/${setId}/stats`);
  return unwrap(res);
}

