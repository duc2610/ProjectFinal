from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime
import logging
import json
import os
import tempfile
import google.generativeai as genai
from PIL import Image
import hashlib

# ============================================================================
# CONFIGURATION
# ============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TOEIC Writing Assessment API", version="8.0.0-BEST-OF-BOTH")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")
# ============================================================================
# MODELS
# ============================================================================

class WritingPartType(str, Enum):
    WRITE_SENTENCE = "write_sentence"
    RESPOND_REQUEST = "respond_request"
    OPINION_ESSAY = "opinion_essay"


class GrammarError(BaseModel):
    wrong: str
    correct: str
    rule: str
    severity: str = "medium"


class VocabularyIssue(BaseModel):
    word: str
    better: str
    example: str


class AssessmentRequest(BaseModel):
    text: str = Field(..., min_length=1)
    part_type: WritingPartType
    question_number: int = Field(..., ge=1, le=8)
    prompt: Optional[str] = None


class ScoreBreakdown(BaseModel):
    word_count: int
    grammar: int = 0
    vocabulary: int = 0
    organization: int = 0
    relevance: int = 0
    sentence_variety: int = 0
    opinion_support: int = 0
    overall: int = 0


class DetailedAnalysis(BaseModel):
    grammar_errors: List[GrammarError] = []
    vocabulary_issues: List[VocabularyIssue] = []
    missing_points: List[str] = []
    matched_points: List[str] = []
    corrected_text: Optional[str] = None
    image_description: Optional[str] = None
    opinion_support_issues: List[str] = []


class AssessmentResponse(BaseModel):
    text: str
    part_type: str
    question_number: int
    scores: ScoreBreakdown
    detailed_analysis: DetailedAnalysis
    recommendations: List[str]
    overall_score: int
    timestamp: str


# ============================================================================
# GEMINI AI CLIENT
# ============================================================================

class GeminiAnalyzer:
    def __init__(self, api_key: str):
        try:
            genai.configure(api_key=api_key)

            self.text_model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={
                    "temperature": 0,
                    "response_mime_type": "application/json"
                }
            )

            self.vision_model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"temperature": 0}
            )

            self.image_cache = {}
            self.sentence_cache = {}
            self.email_cache = {}
            self.essay_cache = {}
            logger.info("✅ Gemini AI initialized - v8.0.0 BEST OF BOTH")
        except Exception as e:
            logger.error(f"Gemini init failed: {e}")
            self.text_model = None
            self.vision_model = None

    def _call_gemini(self, prompt: str) -> Dict:
        """Call Gemini and parse JSON"""
        if not self.text_model:
            raise Exception("Gemini not initialized")

        try:
            response = self.text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise

    def analyze_image(self, image_path: str) -> str:
        """Analyze image with caching"""
        if not self.vision_model:
            raise Exception("Vision model not initialized")

        try:
            with open(image_path, 'rb') as f:
                image_hash = hashlib.md5(f.read()).hexdigest()

            if image_hash in self.image_cache:
                logger.info(f"Cache HIT - image {image_hash[:8]}")
                return self.image_cache[image_hash]

            img = Image.open(image_path)

            prompt = """Describe this picture objectively for TOEIC Writing.
Focus on: main subjects, actions, setting, important details.
Be factual and detailed."""

            response = self.vision_model.generate_content([prompt, img])
            description = response.text.strip()

            self.image_cache[image_hash] = description
            logger.info(f"Cache MISS - saved {image_hash[:8]}")

            return description

        except Exception as e:
            logger.error(f"Image analysis failed: {e}")
            raise

    def analyze_sentence_detailed(self, text: str, picture_description: str) -> Dict:
        """Part 1: Analyze sentence with detailed feedback"""
        cache_key = hashlib.md5(f"{text}|||{picture_description}".encode()).hexdigest()

        if cache_key in self.sentence_cache:
            logger.info(f"Cache HIT - sentence {cache_key[:8]}")
            return self.sentence_cache[cache_key]

        prompt = f"""You are a TOEIC Part 1 evaluator. Check if the sentence accurately describes the picture.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PICTURE DESCRIPTION:
"{picture_description}"

STUDENT SENTENCE:
"{text}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
1. "wrong" phrase MUST be copied EXACTLY from student sentence
2. If sentence is grammatically correct → return empty errors []
3. "wrong" and "correct" MUST be different

STEP 1: RELEVANCE CHECK
Compare picture vs sentence:
• Accurately describes main elements = Score 90-100
• Describes most elements = Score 70-80
• Describes some elements = Score 50-60
• Wrong or irrelevant = Score 0-30

STEP 2: DETAILED GRAMMAR CHECK
- Verb tenses: correct form?
- Subject-verb agreement: matching?
- Articles (a/an/the): missing or incorrect?
- Prepositions: correct usage?
- Sentence structure: complete and clear?

STEP 3: VOCABULARY CHECK
- Generic words (thing, stuff, person) → suggest specific alternatives
- Word choice appropriateness for context
- Vocabulary level assessment

Return JSON:
{{
    "relevance": {{
        "score": 0-100,
        "matched_elements": ["elements from picture mentioned"],
        "missing_elements": ["important things not mentioned"],
        "incorrect_elements": ["things mentioned but NOT in picture"]
    }},
    "grammar": {{
        "overall_score": 0-100,
        "breakdown": {{
            "verb_tenses": {{"score": 0-100, "errors": [{{"wrong": "exact phrase", "correct": "fixed", "rule": "explanation", "severity": "high/medium/low"}}]}},
            "subject_verb_agreement": {{"score": 0-100, "errors": []}},
            "articles": {{"score": 0-100, "errors": []}},
            "prepositions": {{"score": 0-100, "errors": []}},
            "sentence_structure": {{"score": 0-100, "issues": "description or empty string"}},
            "other_grammar": {{"score": 0-100, "errors": []}}
        }},
        "corrected_text": "fully corrected sentence or original if no errors"
    }},
    "vocabulary": {{
        "overall_score": 0-100,
        "breakdown": {{
            "word_choice": {{"analysis": [{{"word": "word", "assessment": "weak/good", "better_options": ["alternatives"], "context": "why"}}]}},
            "vocabulary_level": {{"overall_level": "basic/intermediate/advanced"}},
            "specificity": {{"generic_words": [{{"word": "generic", "specific_alternative": "better", "note": "context"}}]}}
        }}
    }}
}}

Return ONLY valid JSON without markdown."""

        result = self._call_gemini(prompt)
        self.sentence_cache[cache_key] = result
        logger.info(f"Cache MISS - sentence {cache_key[:8]}")
        return result

    def analyze_email_response(self, text: str, request_prompt: str) -> Dict:
        """Part 2: Analyze email with detailed feedback"""

        cache_key = hashlib.md5(f"{text}|||{request_prompt}".encode()).hexdigest()

        if cache_key in self.email_cache:
            logger.info(f"Cache HIT - email {cache_key[:8]}")
            return self.email_cache[cache_key]

        prompt = f"""You are a TOEIC Part 2 email evaluator.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUEST:
"{request_prompt}"

STUDENT EMAIL:
"{text}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
1. "wrong" MUST be copied EXACTLY from student response
2. If phrase doesn't exist → DO NOT list it
3. Count overused words EXACTLY in text above

STEP 1: RELEVANCE - Parse request carefully
- What specific questions does request ask?
- Which are answered in response?
- Which are missing?
- Score 90-100 = All answered clearly
- Score 30-50 = Some missing
- Score 0-20 = Off-topic

STEP 2: DETAILED EVALUATION
Grammar, vocabulary, sentence variety, organization

Return JSON:
{{
    "relevance": {{
        "score": 0-100,
        "answered_points": ["specific point 1 answered", "point 2"],
        "missing_points": ["specific point NOT answered"],
        "assessment": "complete/partial/off-topic"
    }},
    "sentence_variety": {{
        "score": 0-100,
        "simple": count,
        "compound": count,
        "complex": count,
        "issues": "description or empty string"
    }},
    "vocabulary": {{
        "score": 0-100,
        "good_words": ["strong words used"],
        "weak_words": [{{"word": "word", "better": "alternative", "example": "usage example"}}],
        "overused": [{{"word": "word", "count": exact_number, "alternatives": ["alternatives"]}}],
        "issues": "summary or empty string"
    }},
    "organization": {{
        "score": 0-100,
        "structure": "clear/unclear",
        "coherence": "good/poor",
        "issues": "description or empty string"
    }},
    "grammar": {{
        "score": 0-100,
        "errors": [{{"wrong": "exact phrase", "correct": "fixed", "rule": "explanation", "severity": "high/medium/low"}}],
        "corrected_text": "corrected or original"
    }}
}}

Return ONLY valid JSON without markdown."""

        result = self._call_gemini(prompt)
        self.email_cache[cache_key] = result
        logger.info(f"Cache MISS - email {cache_key[:8]}")
        return result

    def analyze_essay(self, text: str, essay_prompt: str) -> Dict:
        """Part 3: Essay with OFF-TOPIC detection + detailed feedback"""

        cache_key = hashlib.md5(f"{text}|||{essay_prompt}".encode()).hexdigest()

        if cache_key in self.essay_cache:
            logger.info(f"Cache HIT - essay {cache_key[:8]}")
            return self.essay_cache[cache_key]

        prompt = f"""You are a TOEIC Part 3 essay evaluator. Use TWO-STEP evaluation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESSAY PROMPT:
"{essay_prompt}"

STUDENT ESSAY:
"{text}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL RULES:
1. "wrong" MUST be copied EXACTLY from essay
2. Count overused words EXACTLY (4+ times = overused)
3. Check OFF-TOPIC first, then other criteria

╔═══════════════════════════════════════════════════════════════╗
║  STEP 1: OFF-TOPIC CHECK (CHECK THIS FIRST!)                 ║
╚═══════════════════════════════════════════════════════════════╝

Question: "If someone asked you the PROMPT question, would this ESSAY be a good answer?"

Answer: YES / SOMEWHAT / NO

SCORING:
- If YES → Score 70-100 (on-topic, proceed to Step 2)
- If SOMEWHAT → Score 30-60 (partially relevant)
- If NO → Score 0-20 (off-topic, cannot evaluate other criteria)

╔═══════════════════════════════════════════════════════════════╗
║  STEP 2: DETAILED EVALUATION (only if Step 1 ≥ 60)           ║
╚═══════════════════════════════════════════════════════════════╝

1. OPINION SUPPORT:
   - Clear opinion statement?
   - 2-3 distinct reasons?
   - Specific examples with WHO, WHEN, HOW, RESULTS?
   - Examples relevant and well-developed?

2. GRAMMAR (with specific error examples):
   - Verb tenses/forms
   - Subject-verb agreement
   - Articles (a/an/the)
   - Prepositions
   - Complex structures

3. VOCABULARY (with improvement suggestions):
   - Generic words (thing, stuff, good, bad, very, people)
   - Overused words (4+ times)
   - Academic vocabulary usage
   - Word choice appropriateness

4. ORGANIZATION:
   - Introduction with thesis?
   - Body paragraphs with topic sentences?
   - Transitions between ideas?
   - Conclusion present?

Return JSON:
{{
    "relevance_to_prompt": {{
        "score": 0-100,
        "prompt_asks_about": "Simple 1-sentence summary of prompt topic",
        "essay_is_about": "Simple 1-sentence summary of essay topic",
        "does_essay_answer_prompt": "yes/somewhat/no",
        "assessment": "on-topic/partially-relevant/off-topic",
        "explanation": "Brief explanation why on-topic or off-topic"
    }},
    "opinion_support": {{
        "score": 0-100,
        "opinion_stated": "clear/unclear/missing",
        "reasons": ["reason 1", "reason 2"],
        "examples": [
            {{
                "reason": "which reason",
                "example": "the example",
                "specificity": "vague/moderate/specific",
                "details": "WHO, WHEN, HOW, RESULTS"
            }}
        ],
        "missing_issues": ["what's missing or weak"]
    }},
    "grammar": {{
        "score": 0-100,
        "errors": [{{"wrong": "exact phrase from essay", "correct": "fixed", "rule": "explanation", "severity": "high/medium/low"}}],
        "corrected_text": "corrected or original"
    }},
    "vocabulary": {{
        "score": 0-100,
        "good_words": ["strong academic words"],
        "weak_words": [{{"word": "word", "better": "better", "example": "usage example"}}],
        "overused": [{{"word": "word", "count": exact_count, "alternatives": ["alt"]}}],
        "issues": "summary or empty string"
    }},
    "organization": {{
        "score": 0-100,
        "structure": "clear/unclear",
        "has_introduction": true/false,
        "has_body_paragraphs": true/false,
        "has_conclusion": true/false,
        "coherence": "good/poor",
        "missing_transitions": ["transition words"],
        "issues": "description or empty string"
    }}
}}

Return ONLY valid JSON without markdown."""

        result = self._call_gemini(prompt)
        self.essay_cache[cache_key] = result
        logger.info(f"Cache MISS - essay {cache_key[:8]}")
        return result


# ============================================================================
# ASSESSMENT SERVICE - BEST OF BOTH
# ============================================================================

class TOEICWritingAssessment:
    def __init__(self, gemini_api_key: str):
        self.gemini = GeminiAnalyzer(gemini_api_key)

    def assess_write_sentence(self, text: str, image_path: str) -> Dict:
        """Part 1: Describe picture - with detailed recommendations"""
        word_count = len(text.split())

        if word_count < 5:
            return {
                'scores': ScoreBreakdown(word_count=word_count, overall=0),
                'detailed_analysis': DetailedAnalysis(),
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 5 minimum)",
                    "",
                    "What you need:",
                    "• Write at least one complete sentence",
                    "• Describe what you see in the picture",
                    "• Use correct grammar and vocabulary"
                ],
                'overall_score': 0
            }

        try:
            picture_description = self.gemini.analyze_image(image_path)
            analysis = self.gemini.analyze_sentence_detailed(text, picture_description)
        except Exception as e:
            raise HTTPException(500, f"Analysis failed: {str(e)}")

        relevance_score = analysis['relevance']['score']
        grammar_overall = analysis['grammar']['overall_score']
        vocabulary_overall = analysis['vocabulary']['overall_score']

        # OFF-TOPIC CHECK
        if relevance_score < 30:
            return {
                'scores': ScoreBreakdown(
                    word_count=word_count,
                    relevance=relevance_score,
                    overall=0
                ),
                'detailed_analysis': DetailedAnalysis(
                    image_description=picture_description,
                    missing_points=analysis['relevance'].get('missing_elements', []),
                    matched_points=analysis['relevance'].get('matched_elements', [])
                ),
                'recommendations': [
                    "❌ FAIL: Sentence doesn't describe the picture",
                    "",
                    "What the picture shows:",
                    f"  {picture_description[:200]}",
                    "",
                    "What you wrote about:",
                    f"  Elements NOT in picture: {', '.join(analysis['relevance'].get('incorrect_elements', [])[:3])}",
                    "",
                    "How to fix:",
                    "1. Look at the picture carefully",
                    "2. Describe what you actually see",
                    "3. Use present continuous for actions (is/are + verb-ing)"
                ],
                'overall_score': 0
            }

        # CALCULATE OVERALL SCORE
        overall = int(relevance_score * 0.40 + grammar_overall * 0.35 + vocabulary_overall * 0.25)
        
        # PARSE DETAILED ERRORS
        grammar_errors = self._parse_grammar_breakdown(analysis['grammar']['breakdown'])
        vocab_issues = self._parse_vocabulary_breakdown(analysis['vocabulary']['breakdown'])

        # BUILD DETAILED RECOMMENDATIONS (V2.0.0 STYLE)
        recommendations = []
        
        # Score summary
        if overall >= 90:
            recommendations.append("✅ Excellent work!")
        elif overall >= 75:
            recommendations.append(f"✅ Good job! (Overall: {overall}/100)")
        else:
            recommendations.append(f"Score: {overall}/100")

        recommendations.append("")

        # Grammar feedback with examples
        if grammar_overall < 85 and grammar_errors:
            recommendations.append(f"📝 Grammar: {grammar_overall}/100")
            for i, err in enumerate(grammar_errors[:3], 1):
                recommendations.append(f"  {i}. ✗ '{err.wrong}' → ✓ '{err.correct}'")
                if err.rule:
                    recommendations.append(f"     Rule: {err.rule}")
            recommendations.append("")

        # Vocabulary feedback with examples
        if vocabulary_overall < 85 and vocab_issues:
            recommendations.append(f"📚 Vocabulary: {vocabulary_overall}/100")
            for i, issue in enumerate(vocab_issues[:2], 1):
                recommendations.append(f"  {i}. '{issue.word}' → '{issue.better}'")
                if issue.example:
                    recommendations.append(f"     Context: {issue.example}")
            recommendations.append("")

        # Relevance feedback
        if relevance_score < 90:
            recommendations.append(f"🎯 Relevance: {relevance_score}/100")
            missing = analysis['relevance'].get('missing_elements', [])
            if missing:
                recommendations.append(f"  Consider adding: {', '.join(missing[:2])}")
            recommendations.append("")

        # Positive reinforcement
        if grammar_overall >= 85 and vocabulary_overall >= 85:
            recommendations.append("💡 Great sentence structure and word choice!")

        return {
            'scores': ScoreBreakdown(
                word_count=word_count,
                grammar=grammar_overall,
                vocabulary=vocabulary_overall,
                relevance=relevance_score,
                overall=overall
            ),
            'detailed_analysis': DetailedAnalysis(
                grammar_errors=grammar_errors,
                vocabulary_issues=vocab_issues,
                corrected_text=analysis['grammar'].get('corrected_text'),
                image_description=picture_description,
                matched_points=analysis['relevance'].get('matched_elements', []),
                missing_points=analysis['relevance'].get('missing_elements', [])
            ),
            'recommendations': recommendations[:15],
            'overall_score': overall
        }

    def assess_respond_request(self, text: str, request_prompt: str) -> Dict:
        """Part 2: Email response - with detailed recommendations"""

        word_count = len(text.split())

        if word_count < 10:
            return {
                'scores': ScoreBreakdown(word_count=word_count, overall=0),
                'detailed_analysis': DetailedAnalysis(),
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 10 minimum)",
                    "",
                    "What you need:",
                    "• Answer ALL questions in the request",
                    "• Write complete sentences",
                    "• Recommended length: 25-50 words for best efficiency"
                ],
                'overall_score': 0
            }

        try:
            analysis = self.gemini.analyze_email_response(text, request_prompt)
        except Exception as e:
            logger.error(f"Email analysis failed: {e}")
            return self._fallback_email_analysis(text, word_count)

        relevance_score = analysis.get('relevance', {}).get('score', 50)
        sentence_variety = analysis.get('sentence_variety', {}).get('score', 50)
        vocabulary_score = analysis.get('vocabulary', {}).get('score', 50)
        organization_score = analysis.get('organization', {}).get('score', 50)
        grammar_score = analysis.get('grammar', {}).get('score', 50)

        # OFF-TOPIC CHECK
        if relevance_score < 30:
            return {
                'scores': ScoreBreakdown(
                    word_count=word_count,
                    relevance=relevance_score,
                    overall=0
                ),
                'detailed_analysis': DetailedAnalysis(
                    missing_points=analysis.get('relevance', {}).get('missing_points', [])
                ),
                'recommendations': [
                    "❌ FAIL: Response doesn't address the request",
                    "",
                    "Missing points:",
                ] + [f"  ✗ {point}" for point in analysis.get('relevance', {}).get('missing_points', [])[:4]] + [
                    "",
                    "How to fix:",
                    "1. Read the request carefully",
                    "2. Answer EVERY question asked",
                    "3. Organize your response clearly"
                ],
                'overall_score': 0
            }

        # CALCULATE OVERALL SCORE
        overall = int(
            relevance_score * 0.35 +
            sentence_variety * 0.25 +
            vocabulary_score * 0.20 +
            grammar_score * 0.10 +
            organization_score * 0.10
        )

        # PARSE DETAILED ERRORS
        grammar_errors = self._parse_grammar_errors(analysis.get('grammar', {}))
        vocab_issues = self._parse_vocab_issues(analysis.get('vocabulary', {}))

        # BUILD DETAILED RECOMMENDATIONS (V2.0.0 STYLE)
        recommendations = []
        
        # Score summary
        if overall >= 90:
            recommendations.append("✅ Excellent response! All points addressed clearly")
        elif overall >= 75:
            recommendations.append(f"✅ Good response! (Overall: {overall}/100)")
        else:
            recommendations.append(f"Score: {overall}/100")

        recommendations.append("")

        # Relevance feedback
        if relevance_score < 90:
            recommendations.append(f"🎯 Relevance: {relevance_score}/100")
            missing = analysis.get('relevance', {}).get('missing_points', [])
            if missing:
                recommendations.append("  Missing points:")
                for point in missing[:2]:
                    recommendations.append(f"    • {point}")
            recommendations.append("")

        # Sentence variety feedback
        if sentence_variety < 80:
            recommendations.append(f"📐 Sentence variety: {sentence_variety}/100")
            complex_count = analysis.get('sentence_variety', {}).get('complex', 0)
            if complex_count == 0:
                recommendations.append("  Try adding:")
                recommendations.append("    • Complex sentences with 'because', 'although', 'while'")
                recommendations.append("    • Example: 'I prefer X because it offers Y'")
            recommendations.append("")

        # Grammar feedback with examples
        if grammar_score < 85 and grammar_errors:
            recommendations.append(f"📝 Grammar: {grammar_score}/100")
            for i, err in enumerate(grammar_errors[:3], 1):
                recommendations.append(f"  {i}. ✗ '{err.wrong}' → ✓ '{err.correct}'")
                if err.rule:
                    recommendations.append(f"     Rule: {err.rule}")
            recommendations.append("")

        # Vocabulary feedback with examples
        if vocabulary_score < 85 and vocab_issues:
            recommendations.append(f"📚 Vocabulary: {vocabulary_score}/100")
            for i, issue in enumerate(vocab_issues[:2], 1):
                recommendations.append(f"  {i}. '{issue.word}' → '{issue.better}'")
                if issue.example:
                    recommendations.append(f"     Example: {issue.example}")
            recommendations.append("")

        # Overused words
        vocab_data = analysis.get('vocabulary', {})
        if isinstance(vocab_data, dict):
            overused = vocab_data.get('overused', [])
            if overused:
                recommendations.append("⚠️  Overused words:")
                for item in overused[:2]:
                    if isinstance(item, dict):
                        word = item.get('word', '')
                        count = item.get('count', 0)
                        alternatives = item.get('alternatives', [])
                        if count >= 3:
                            recommendations.append(f"  • '{word}' appears {count}x - try: {', '.join(alternatives[:3])}")
                recommendations.append("")

        # Length feedback
        if word_count < 25:
            recommendations.append(f"💡 Length note: {word_count} words - could add more detail (recommended: 25-50)")
        elif word_count > 50:
            recommendations.append(f"💡 Length note: {word_count} words - content complete! (For time efficiency, 25-50 words recommended)")

        return {
            'scores': ScoreBreakdown(
                word_count=word_count,
                relevance=relevance_score,
                sentence_variety=sentence_variety,
                vocabulary=vocabulary_score,
                organization=organization_score,
                grammar=grammar_score,
                overall=overall
            ),
            'detailed_analysis': DetailedAnalysis(
                grammar_errors=grammar_errors,
                vocabulary_issues=vocab_issues,
                matched_points=analysis.get('relevance', {}).get('answered_points', []),
                missing_points=analysis.get('relevance', {}).get('missing_points', []),
                corrected_text=analysis.get('grammar', {}).get('corrected_text')
            ),
            'recommendations': recommendations[:18],
            'overall_score': overall
        }

    def assess_opinion_essay(self, text: str, essay_prompt: str) -> Dict:
        """Part 3: Essay - OFF-TOPIC detection + detailed recommendations"""

        word_count = len(text.split())

        # TOO SHORT
        if word_count < 150:
            return {
                'scores': ScoreBreakdown(word_count=word_count, overall=0),
                'detailed_analysis': DetailedAnalysis(
                    missing_points=[f"Word count: {word_count} < 150 minimum"]
                ),
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 150 minimum)",
                    "",
                    "Essay structure needed:",
                    "  1. Introduction (state your opinion)",
                    "  2. Body paragraph 1 (reason + specific example)",
                    "  3. Body paragraph 2 (reason + specific example)",
                    "  4. Conclusion (restate opinion)",
                    "",
                    "Recommended length: 300+ words for good score"
                ],
                'overall_score': 0
            }

        # GEMINI ANALYSIS
        try:
            analysis = self.gemini.analyze_essay(text, essay_prompt)
        except Exception as e:
            logger.error(f"Essay analysis failed: {e}")
            return self._fallback_essay_analysis(text, word_count)

        relevance_to_prompt = analysis.get('relevance_to_prompt', {}).get('score', 50)
        opinion_support = analysis.get('opinion_support', {}).get('score', 50)
        grammar_score = analysis.get('grammar', {}).get('score', 50)
        vocabulary_score = analysis.get('vocabulary', {}).get('score', 50)
        organization_score = analysis.get('organization', {}).get('score', 50)

        # ═══════════════════════════════════════════════════════════════════
        # OFF-TOPIC CHECK (V7.1.0 FEATURE)
        # ═══════════════════════════════════════════════════════════════════
        if relevance_to_prompt < 30:
            relevance_data = analysis.get('relevance_to_prompt', {})

            return {
                'scores': ScoreBreakdown(
                    word_count=word_count,
                    relevance=relevance_to_prompt,
                    overall=0
                ),
                'detailed_analysis': DetailedAnalysis(
                    missing_points=[
                        "❌ ESSAY IS OFF-TOPIC",
                        "",
                        f"📋 Prompt asks: {relevance_data.get('prompt_asks_about', 'unknown')}",
                        f"✍️  Your essay: {relevance_data.get('essay_is_about', 'unknown')}",
                        "",
                        f"Does essay answer prompt? {relevance_data.get('does_essay_answer_prompt', 'NO').upper()}",
                        "",
                        "Why off-topic:",
                        relevance_data.get('explanation', 'Essay discusses different topic')
                    ]
                ),
                'recommendations': [
                    "❌ FAIL: ESSAY IS OFF-TOPIC (Score: 0/100)",
                    "═" * 60,
                    "",
                    f"📋 Prompt asks about: {relevance_data.get('prompt_asks_about', 'unknown')}",
                    f"✍️  Your essay is about: {relevance_data.get('essay_is_about', 'unknown')}",
                    "",
                    f"Does essay answer the prompt? {relevance_data.get('does_essay_answer_prompt', 'NO').upper()}",
                    "",
                    "═" * 60,
                    "Why this is off-topic:",
                    f"  {relevance_data.get('explanation', 'Essay discusses something different')}",
                    "",
                    "═" * 60,
                    "How to fix:",
                    "  1. Read the prompt question very carefully",
                    "  2. Make sure your ENTIRE essay answers that specific question",
                    "  3. Don't write about related but different topics",
                    "  4. Stay focused on what the prompt asks throughout",
                    "",
                    "⚠️  OFF-TOPIC = 0 POINTS, no matter how well written!",
                    "",
                    "Note: Cannot evaluate grammar, vocabulary, or organization",
                    "until topic relevance is fixed."
                ],
                'overall_score': 0
            }

        # ═══════════════════════════════════════════════════════════════════
        # NO CLEAR OPINION
        # ═══════════════════════════════════════════════════════════════════
        if opinion_support < 30:
            opinion_data = analysis.get('opinion_support', {})
            missing_issues = opinion_data.get('missing_issues', [])

            return {
                'scores': ScoreBreakdown(
                    word_count=word_count,
                    relevance=relevance_to_prompt,
                    opinion_support=opinion_support,
                    overall=0
                ),
                'detailed_analysis': DetailedAnalysis(
                    opinion_support_issues=missing_issues
                ),
                'recommendations': [
                    "❌ FAIL: Opinion not properly supported",
                    f"(Essay is on-topic ✅ but lacks opinion structure)",
                    "",
                    "What's missing:",
                ] + [f"  • {issue}" for issue in missing_issues[:4]] + [
                    "",
                    "Required essay structure:",
                    "  1. Introduction: State clear opinion",
                    "     Example: 'I strongly believe working from home is better because...'",
                    "",
                    "  2. Body paragraphs: 2-3 reasons with specific examples",
                    "     Each example needs: WHO, WHEN, HOW, RESULTS",
                    "     Example: 'Last year, my friend John worked from home...'",
                    "",
                    "  3. Conclusion: Restate your opinion",
                    "",
                    "Score: 0 - Cannot evaluate other skills without proper opinion support"
                ],
                'overall_score': 0
            }

        # ═══════════════════════════════════════════════════════════════════
        # WEAK OPINION SUPPORT
        # ═══════════════════════════════════════════════════════════════════
        if opinion_support < 60:
            overall = int(
                relevance_to_prompt * 0.25 +
                opinion_support * 0.45 +
                grammar_score * 0.15 +
                organization_score * 0.15
            )

            grammar_errors = self._parse_grammar_errors(analysis.get('grammar', {}))
            missing_issues = analysis.get('opinion_support', {}).get('missing_issues', [])

            recommendations = [
                f"⚠️  FAIR: Weak opinion support (Overall: {overall}/100)",
                f"✅ Essay is on-topic (Relevance: {relevance_to_prompt}/100)",
                f"⚠️  Opinion support weak: {opinion_support}/100",
                ""
            ]

            if missing_issues:
                recommendations.append("What needs improvement:")
                for i, issue in enumerate(missing_issues[:4], 1):
                    recommendations.append(f"  {i}. {issue}")
                recommendations.append("")

            if word_count < 250:
                recommendations.append(f"💡 Length: {word_count} words - aim for 300+ for better development")
                recommendations.append("")

            if grammar_score < 70 and grammar_errors:
                recommendations.append(f"📝 Grammar: {grammar_score}/100")
                for i, err in enumerate(grammar_errors[:2], 1):
                    recommendations.append(f"  {i}. ✗ '{err.wrong}' → ✓ '{err.correct}'")
                    if err.rule:
                        recommendations.append(f"     Rule: {err.rule}")

            return {
                'scores': ScoreBreakdown(
                    word_count=word_count,
                    relevance=relevance_to_prompt,
                    opinion_support=opinion_support,
                    grammar=grammar_score,
                    organization=organization_score,
                    overall=overall
                ),
                'detailed_analysis': DetailedAnalysis(
                    grammar_errors=grammar_errors,
                    opinion_support_issues=missing_issues
                ),
                'recommendations': recommendations[:15],
                'overall_score': overall
            }

        # ═══════════════════════════════════════════════════════════════════
        # GOOD TO EXCELLENT ESSAY
        # ═══════════════════════════════════════════════════════════════════
        overall = int(
            relevance_to_prompt * 0.10 +
            opinion_support * 0.40 +
            grammar_score * 0.25 +
            vocabulary_score * 0.15 +
            organization_score * 0.10
        )

        grammar_errors = self._parse_grammar_errors(analysis.get('grammar', {}))
        vocab_issues = self._parse_vocab_issues(analysis.get('vocabulary', {}))
        missing_issues = analysis.get('opinion_support', {}).get('missing_issues', [])

        # BUILD DETAILED RECOMMENDATIONS (V2.0.0 STYLE)
        recommendations = []
        
        # Score summary
        if opinion_support >= 90 and grammar_score >= 85 and vocabulary_score >= 80:
            recommendations.append("✅ Excellent essay! Strong opinion with detailed support")
        elif opinion_support >= 80:
            recommendations.append(f"✅ Strong essay! (Overall: {overall}/100)")
        else:
            recommendations.append(f"Good essay - can improve (Overall: {overall}/100)")

        recommendations.append("")

        # Opinion support feedback
        if opinion_support < 85 and missing_issues:
            recommendations.append(f"💭 Opinion support: {opinion_support}/100")
            for i, issue in enumerate(missing_issues[:3], 1):
                recommendations.append(f"  {i}. {issue}")
            recommendations.append("")

        # Grammar feedback with examples
        if grammar_score < 90 and grammar_errors:
            recommendations.append(f"📝 Grammar: {grammar_score}/100")
            for i, err in enumerate(grammar_errors[:3], 1):
                recommendations.append(f"  {i}. ✗ '{err.wrong}' → ✓ '{err.correct}'")
                if err.rule:
                    recommendations.append(f"     Rule: {err.rule}")
            recommendations.append("")

        # Vocabulary feedback with examples
        if vocabulary_score < 90 and vocab_issues:
            recommendations.append(f"📚 Vocabulary: {vocabulary_score}/100")
            for i, issue in enumerate(vocab_issues[:2], 1):
                recommendations.append(f"  {i}. '{issue.word}' → '{issue.better}'")
                if issue.example:
                    recommendations.append(f"     Example: {issue.example}")
            recommendations.append("")

        # Overused words
        vocab_data = analysis.get('vocabulary', {})
        if isinstance(vocab_data, dict):
            overused = vocab_data.get('overused', [])
            if overused:
                recommendations.append("⚠️  Overused words:")
                for item in overused[:2]:
                    if isinstance(item, dict):
                        word = item.get('word', '')
                        count = item.get('count', 0)
                        alternatives = item.get('alternatives', [])
                        if count >= 4:
                            recommendations.append(f"  • '{word}' appears {count}x - vary with: {', '.join(alternatives[:3])}")
                recommendations.append("")

        # Organization feedback
        if organization_score < 90:
            recommendations.append(f"📐 Organization: {organization_score}/100")
            org_data = analysis.get('organization', {})
            if isinstance(org_data, dict):
                missing_trans = org_data.get('missing_transitions', [])
                if missing_trans:
                    recommendations.append(f"  Add transition words: {', '.join(missing_trans[:3])}")
            recommendations.append("")

        # Length feedback
        if word_count < 250:
            recommendations.append(f"💡 Length: {word_count} words - aim for 300+ for comprehensive development")
        elif word_count >= 350:
            recommendations.append(f"💡 Length: {word_count} words - excellent detail and development!")

        return {
            'scores': ScoreBreakdown(
                word_count=word_count,
                relevance=relevance_to_prompt,
                opinion_support=opinion_support,
                grammar=grammar_score,
                vocabulary=vocabulary_score,
                organization=organization_score,
                overall=overall
            ),
            'detailed_analysis': DetailedAnalysis(
                grammar_errors=grammar_errors,
                vocabulary_issues=vocab_issues,
                opinion_support_issues=missing_issues,
                corrected_text=analysis.get('grammar', {}).get('corrected_text')
            ),
            'recommendations': recommendations[:20],
            'overall_score': overall
        }

    # ═══════════════════════════════════════════════════════════════════
    # HELPER METHODS
    # ═══════════════════════════════════════════════════════════════════

    def _parse_grammar_breakdown(self, breakdown) -> List[GrammarError]:
        """Parse grammar errors from breakdown structure"""
        errors = []
        if not breakdown or not isinstance(breakdown, dict):
            return errors

        categories = ['verb_tenses', 'articles', 'subject_verb_agreement', 'prepositions', 'other_grammar']
        for category in categories:
            cat_data = breakdown.get(category, {})
            if isinstance(cat_data, dict):
                error_list = cat_data.get('errors', [])
                if isinstance(error_list, list):
                    for err in error_list:
                        if isinstance(err, dict) and err.get('wrong') and err.get('correct'):
                            errors.append(GrammarError(
                                wrong=err.get('wrong', ''),
                                correct=err.get('correct', ''),
                                rule=err.get('rule', ''),
                                severity=err.get('severity', 'medium')
                            ))
        return errors

    def _parse_grammar_errors(self, grammar_data) -> List[GrammarError]:
        """Parse grammar errors from direct error list"""
        errors = []
        if isinstance(grammar_data, dict):
            error_list = grammar_data.get('errors', [])
            if isinstance(error_list, list):
                for err in error_list:
                    if isinstance(err, dict) and err.get('wrong') and err.get('correct'):
                        errors.append(GrammarError(
                            wrong=err.get('wrong', ''),
                            correct=err.get('correct', ''),
                            rule=err.get('rule', ''),
                            severity=err.get('severity', 'medium')
                        ))
        return errors

    def _parse_vocabulary_breakdown(self, breakdown) -> List[VocabularyIssue]:
        """Parse vocabulary issues from breakdown structure"""
        issues = []
        if not breakdown or not isinstance(breakdown, dict):
            return issues

        word_choice = breakdown.get('word_choice', {})
        if isinstance(word_choice, dict):
            analysis = word_choice.get('analysis', [])
            if isinstance(analysis, list):
                for item in analysis:
                    if isinstance(item, dict) and item.get('better_options'):
                        better = item.get('better_options', [])
                        if isinstance(better, list) and better:
                            issues.append(VocabularyIssue(
                                word=item.get('word', ''),
                                better=', '.join(better[:2]),
                                example=item.get('context', '')
                            ))
        return issues

    def _parse_vocab_issues(self, vocab_data) -> List[VocabularyIssue]:
        """Parse vocabulary issues from direct list"""
        issues = []
        if isinstance(vocab_data, dict):
            weak_words = vocab_data.get('weak_words', [])
            if isinstance(weak_words, list):
                for issue in weak_words:
                    if isinstance(issue, dict) and issue.get('word') and issue.get('better'):
                        issues.append(VocabularyIssue(
                            word=issue.get('word', ''),
                            better=issue.get('better', ''),
                            example=issue.get('example', '')
                        ))
        return issues

    def _fallback_sentence_analysis(self, text, word_count):
        return {
            'scores': ScoreBreakdown(word_count=word_count, overall=60),
            'detailed_analysis': DetailedAnalysis(),
            'recommendations': ["AI temporarily unavailable"],
            'overall_score': 60
        }

    def _fallback_email_analysis(self, text, word_count):
        return {
            'scores': ScoreBreakdown(word_count=word_count, overall=70),
            'detailed_analysis': DetailedAnalysis(),
            'recommendations': ["AI temporarily unavailable"],
            'overall_score': 70
        }

    def _fallback_essay_analysis(self, text, word_count):
        return {
            'scores': ScoreBreakdown(word_count=word_count, overall=70),
            'detailed_analysis': DetailedAnalysis(),
            'recommendations': ["AI temporarily unavailable"],
            'overall_score': 70
        }


# ============================================================================
# INITIALIZE
# ============================================================================

try:
    assessment_service = TOEICWritingAssessment(GEMINI_API_KEY)
    logger.info("✅ Service initialized - v8.0.0 BEST OF BOTH")
    logger.info("   Features:")
    logger.info("   • Off-topic detection (from V7.1.0)")
    logger.info("   • Detailed recommendations with examples (from V2.0.0)")
    logger.info("   • Structured feedback with emojis for clarity")
    logger.info("   • Grammar errors with rules and corrections")
    logger.info("   • Vocabulary suggestions with usage examples")
except Exception as e:
    logger.error(f"❌ Init failed: {e}")
    assessment_service = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "TOEIC Writing Assessment API",
        "version": "8.0.0-BEST-OF-BOTH",
        "philosophy": "Combining the best features from V7.1.0 and V2.0.0",
        "features": {
            "from_v710": [
                "Off-topic detection for Part 3 essays",
                "Two-step evaluation (relevance → details)",
                "Clear off-topic explanations"
            ],
            "from_v200": [
                "Detailed recommendations with examples",
                "Structured grammar/vocabulary feedback",
                "Word count and length guidance"
            ],
            "improvements": [
                "Better formatting with emojis",
                "Numbered error lists for clarity",
                "Specific examples for improvements",
                "Contextual explanations"
            ]
        },
        "parts": {
            "part1": "POST /assess/sentence (with image)",
            "part2": "POST /assess (email response)",
            "part3": "POST /assess (opinion essay)"
        }
    }


@app.post("/assess/sentence")
async def assess_sentence(
    text: str = Form(...),
    question_number: int = Form(..., ge=1, le=5),
    image: UploadFile = File(...)
):
    """Part 1: Write a sentence about a picture"""
    if not assessment_service:
        raise HTTPException(500, "Service not initialized")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
        content = await image.read()
        temp_file.write(content)
        image_path = temp_file.name

    try:
        result = assessment_service.assess_write_sentence(text, image_path)
        return AssessmentResponse(
            text=text,
            part_type="write_sentence",
            question_number=question_number,
            scores=result['scores'],
            detailed_analysis=result['detailed_analysis'],
            recommendations=result['recommendations'],
            overall_score=result['overall_score'],
            timestamp=datetime.now().isoformat()
        )
    finally:
        if os.path.exists(image_path):
            try:
                os.unlink(image_path)
            except:
                pass


@app.post("/assess", response_model=AssessmentResponse)
async def assess_writing(request: AssessmentRequest):
    """Part 2 & 3: Email response and Opinion essay"""
    if not assessment_service:
        raise HTTPException(500, "Service not initialized")

    try:
        if request.part_type == WritingPartType.RESPOND_REQUEST:
            if not request.prompt:
                raise HTTPException(400, "prompt required for email response")
            result = assessment_service.assess_respond_request(request.text, request.prompt)

        elif request.part_type == WritingPartType.OPINION_ESSAY:
            if not request.prompt:
                raise HTTPException(400, "prompt required for opinion essay")
            result = assessment_service.assess_opinion_essay(request.text, request.prompt)

        else:
            raise HTTPException(400, "Invalid part_type")

        return AssessmentResponse(
            text=request.text,
            part_type=request.part_type.value,
            question_number=request.question_number,
            scores=result['scores'],
            detailed_analysis=result['detailed_analysis'],
            recommendations=result['recommendations'],
            overall_score=result['overall_score'],
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(500, str(e))


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gemini_available": assessment_service is not None,
        "version": "8.0.0-BEST-OF-BOTH",
        "features": {
            "off_topic_detection": True,
            "detailed_recommendations": True,
            "grammar_error_examples": True,
            "vocabulary_suggestions": True,
            "structured_feedback": True
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)