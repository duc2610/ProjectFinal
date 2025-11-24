from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional
import shutil
import time
from enum import Enum

import azure.cognitiveservices.speech as speechsdk
import librosa
import numpy as np
from pydub import AudioSegment
from PIL import Image
import google.generativeai as genai

# ============================================
# LOGGING SETUP
# ============================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="TOEIC Assessment ULTIMATE",
    version="6.0.0",
    description="Part 1: v4.5.0 | Part 2-5: v4.5.0 logic + LanguageTool"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionType(str, Enum):
    READ_ALOUD = "read_aloud"
    DESCRIBE_PICTURE = "describe_picture"
    RESPOND_QUESTIONS = "respond_questions"
    RESPOND_WITH_INFO = "respond_with_info"
    EXPRESS_OPINION = "express_opinion"


# ============================================
# FLEXIBLE GRAMMAR CHECKER (KHÔNG CONFIG CỨNG)
# ============================================

class FlexibleGrammarChecker:
    """
    Flexible Grammar Checker - NO HARDCODED RULES

    Philosophy:
    - LanguageTool: Basic safety net (rule-based)
    - Gemini: Open-ended detection (AI finds everything)
    - NO hardcoded error types
    - AI adapts to ANY error pattern
    """

    def __init__(self):
        self.available = False
        self.tool = None

        try:
            import language_tool_python

            # Block downloads
            os.environ['LANGUAGE_TOOL_DOWNLOAD'] = '0'
            os.environ['LT_UPDATE'] = '0'

            self.tool = language_tool_python.LanguageTool('en-US', remote_server=None)
            self.available = True
            logger.info("✅ LanguageTool available (safety net mode)")

        except Exception as e:
            logger.info(f"ℹ️ LanguageTool unavailable: {e}")
            logger.info("   Will use Gemini-only (still 85%+ accurate)")
            self.available = False

    def check_basic_errors(self, text: str) -> List[Dict]:
        """
        Get basic grammar errors from LanguageTool

        Returns minimal info - just wrong/correct/rule
        NO hardcoded categories
        """
        if not self.available or not self.tool:
            return []

        if not text or len(text.strip()) == 0:
            return []

        try:
            matches = self.tool.check(text)
            errors = []
            seen = set()

            for match in matches:
                # Basic filtering
                if match.category not in ['GRAMMAR', 'TYPOS', 'CONFUSED_WORDS']:
                    continue

                position = (match.offset, match.errorLength)
                if position in seen:
                    continue
                seen.add(position)

                wrong = text[match.offset:match.offset + match.errorLength]
                correct = match.replacements[0] if match.replacements else ''

                if not correct or wrong.lower() == correct.lower():
                    continue

                # Simple format - NO categorization
                errors.append({
                    'wrong': wrong,
                    'correct': correct,
                    'rule': match.ruleId.replace('_', ' ').title(),
                    'source': 'LanguageTool'
                })

                if len(errors) >= 15:
                    break

            if errors:
                logger.info(f"LanguageTool: {len(errors)} basic errors")

            return errors

        except Exception as e:
            logger.warning(f"LanguageTool failed: {e}")
            return []


# ============================================
# MAIN ASSESSMENT CLASS
# ============================================

class TOEICSpeakingAssessmentUltimate:
    """
    ULTIMATE Assessment - Complete & Flexible

    Architecture:
    - Part 1: 100% v4.5.0 (proven)
    - Part 2-5: v4.5.0 comprehensive + LanguageTool safety
    - Prompts: Open-ended, no hardcoded types
    - AI: Detects EVERYTHING flexibly
    """

    def __init__(self):
        logger.info("=" * 70)
        logger.info("🚀 TOEIC Assessment ULTIMATE v6.0.0")
        logger.info("=" * 70)
        self.setup_services()
        logger.info("✅ System ready")
        logger.info("=" * 70)

    def setup_services(self):
        """Setup all services"""
        self.AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
        self.AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

        if not all([self.AZURE_SPEECH_KEY, self.AZURE_SPEECH_REGION, self.GEMINI_API_KEY]):
            raise ValueError("Missing required environment variables")
        # Gemini
        try:
            genai.configure(api_key=self.GEMINI_API_KEY)
            self.gemini_text_model = genai.GenerativeModel(
                'gemini-2.5-flash',
                generation_config={"temperature": 0.1, "response_mime_type": "application/json"}
            )
            self.gemini_vision_model = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("✅ Gemini AI initialized")
        except Exception as e:
            logger.error(f"❌ Gemini failed: {e}")
            self.gemini_text_model = None
            self.gemini_vision_model = None

        # Azure Speech
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.AZURE_SPEECH_KEY,
            region=self.AZURE_SPEECH_REGION
        )
        self.speech_config.speech_recognition_language = "en-US"
        self.speech_config.set_property(
            speechsdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "30000"
        )
        self.speech_config.set_property(
            speechsdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "15000"
        )
        logger.info("✅ Azure Speech initialized")

        # Flexible Grammar Checker
        self.grammar_checker = FlexibleGrammarChecker()

    # ============================================
    # AUDIO PROCESSING UTILITIES
    # ============================================

    def convert_audio_to_azure_format(self, input_path: str) -> str:
        """Convert audio to Azure format"""
        try:
            audio = AudioSegment.from_file(input_path)
            audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
            output_path = input_path.rsplit('.', 1)[0] + '_converted.wav'
            audio.export(output_path, format="wav", parameters=["-acodec", "pcm_s16le"])
            return output_path
        except Exception as e:
            logger.error(f"Audio conversion failed: {e}")
            return input_path

    def transcribe_audio_azure(self, audio_file_path: str) -> str:
        """Transcribe audio using Azure"""
        try:
            converted_path = self.convert_audio_to_azure_format(audio_file_path)
            audio_config = speechsdk.audio.AudioConfig(filename=converted_path)
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            all_text = []
            done = False

            def stop_cb(evt):
                nonlocal done
                done = True

            def recognized_cb(evt):
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    text = evt.result.text.strip()
                    if text:
                        all_text.append(text)

            speech_recognizer.recognized.connect(recognized_cb)
            speech_recognizer.session_stopped.connect(stop_cb)
            speech_recognizer.canceled.connect(stop_cb)

            speech_recognizer.start_continuous_recognition()

            start_time = time.time()
            while not done and (time.time() - start_time) < 1200:
                time.sleep(0.1)

            speech_recognizer.stop_continuous_recognition()

            result = " ".join(all_text).strip()
            logger.info(f"Transcription: {len(result)} chars")
            return result

        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            return ""

    def analyze_pronunciation_azure(self, audio_file_path: str, reference_text: str) -> Dict:
        """Analyze pronunciation using Azure"""
        try:
            converted_path = self.convert_audio_to_azure_format(audio_file_path)

            pronunciation_config = speechsdk.PronunciationAssessmentConfig(
                reference_text=reference_text,
                grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
                enable_miscue=True
            )

            audio_config = speechsdk.audio.AudioConfig(filename=converted_path)
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )

            pronunciation_config.apply_to(speech_recognizer)
            result = speech_recognizer.recognize_once()

            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                pr = speechsdk.PronunciationAssessmentResult(result)

                mispronounced_words = []
                omitted_words = []

                for word in pr.words:
                    if word.error_type == "Mispronunciation":
                        mispronounced_words.append({
                            'word': word.word,
                            'accuracy': word.accuracy_score
                        })
                    elif word.error_type == "Omission":
                        omitted_words.append(word.word)

                return {
                    'pronunciation_score': int(pr.pronunciation_score),
                    'accuracy_score': int(pr.accuracy_score),
                    'fluency_score': int(pr.fluency_score),
                    'completeness_score': int(pr.completeness_score),
                    'mispronounced_words': mispronounced_words,
                    'omitted_words': omitted_words
                }
        except Exception as e:
            logger.error(f"Pronunciation assessment failed: {e}")

        return {
            'pronunciation_score': 0,
            'accuracy_score': 0,
            'fluency_score': 0,
            'completeness_score': 0,
            'mispronounced_words': [],
            'omitted_words': []
        }

    def get_audio_duration(self, file_path: str) -> float:
        """Get audio duration"""
        try:
            return librosa.get_duration(filename=file_path)
        except:
            try:
                audio = AudioSegment.from_file(file_path)
                return len(audio) / 1000.0
            except:
                return 1200.0

    def _analyze_intonation_basic(self, audio_path: str) -> int:
        """Analyze intonation"""
        try:
            y, sr = librosa.load(audio_path, sr=16000)
            pitches = librosa.yin(y, fmin=75, fmax=600)
            pitch_std = np.std(pitches[pitches > 0])

            rms = librosa.feature.rms(y=y)[0]
            energy_std = np.std(rms)

            score = 70
            if pitch_std > 20:
                score += 15
            if energy_std > 0.05:
                score += 15

            return min(score, 100)
        except:
            return 75

    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity"""
        words1 = text1.lower().strip().split()
        words2 = text2.lower().strip().split()

        if not words1 or not words2:
            return 0.0

        set1 = set(words1)
        set2 = set(words2)
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        jaccard_score = len(intersection) / len(union) * 100 if union else 0

        from difflib import SequenceMatcher
        sequence_score = SequenceMatcher(None, words1, words2).ratio() * 100
        final_score = (jaccard_score * 0.4 + sequence_score * 0.6)

        return round(final_score, 2)

    # ============================================
    # IMAGE ANALYSIS (PART 2)
    # ============================================

    def analyze_image_with_gemini(self, image_path: str) -> str:
        """Analyze image using Gemini Vision"""
        if not self.gemini_vision_model:
            return ""

        try:
            img = Image.open(image_path)
            prompt = """Describe this image in detail for TOEIC speaking assessment.

List clearly and specifically:
1. Main subjects (people, animals, objects)
2. Actions happening
3. Setting/location
4. Important background details
5. Colors, positions, spatial relationships

Be objective, specific, and comprehensive."""

            response = self.gemini_vision_model.generate_content([prompt, img])
            return response.text.strip()

        except Exception as e:
            logger.error(f"Gemini Vision failed: {e}")
            return ""

    def compare_description_with_image(self, transcription: str, image_description: str,
                                       expected_content: Optional[str] = None) -> Dict:
        """Compare description with image"""
        if not self.gemini_text_model:
            return {'relevance_score': 70, 'matched_elements': [],
                    'missing_elements': [], 'incorrect_elements': []}

        try:
            reference = expected_content if expected_content else image_description

            prompt = f"""Compare the spoken description with the expected image content.

SPOKEN DESCRIPTION: "{transcription}"
EXPECTED CONTENT: "{reference}"

Return JSON:
{{
    "relevance_score": 85,
    "is_relevant": true,
    "matched_elements": ["specific element student described correctly"],
    "missing_elements": ["important element student forgot"],
    "incorrect_elements": ["wrong thing student said"],
    "overall_assessment": "brief assessment",
    "suggestions": ["Add description of X", "Correct Y"]
}}

Be specific about corrections."""

            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Comparison failed: {e}")
            return {
                'relevance_score': 70,
                'matched_elements': [],
                'missing_elements': [],
                'incorrect_elements': []
            }

    # ============================================
    # FLEXIBLE AI ANALYSIS (NO HARDCODED TYPES)
    # ============================================

    async def _analyze_with_flexible_ai(self, text: str, duration: float,
                                        task_type: str, **kwargs) -> Dict:
        """
        FLEXIBLE AI Analysis - NO HARDCODED ERROR TYPES

        Philosophy:
        1. Let LanguageTool catch basic errors (safety net)
        2. Let Gemini detect EVERYTHING else (open-ended)
        3. NO predefined categories
        4. AI adapts to ANY error pattern
        """

        if not self.gemini_text_model:
            return self._fallback_analysis(text, duration)

        word_count = len(text.split())
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        # Get basic errors from LanguageTool (if available)
        basic_errors = []
        if task_type != "read_aloud" and self.grammar_checker.available:
            basic_errors = self.grammar_checker.check_basic_errors(text)
            if basic_errors:
                logger.info(f"LanguageTool safety net: {len(basic_errors)} basic errors")

        # Build context from LanguageTool
        lt_context = ""
        if basic_errors:
            error_list = [f"'{e['wrong']}' → '{e['correct']}'" for e in basic_errors[:8]]
            lt_context = f"""
BASIC ERRORS DETECTED (rule-based):
{json.dumps(error_list, indent=2)}

Your task: Find ALL other errors not caught by rules.
Include context-based, style, and advanced errors.
"""

        # Pronunciation context (for Part 1 only)
        pronunciation_data = kwargs.get('pronunciation_data', {})
        pronunciation_context = ""
        if pronunciation_data.get('mispronounced_words'):
            mispronounced = [w.get('word', '') for w in pronunciation_data['mispronounced_words'][:5]]
            pronunciation_context = f"""
PRONUNCIATION ERRORS FROM AZURE:
Mispronounced: {mispronounced}

Provide detailed coaching:
- IPA pronunciation: /fəˈnetɪk/
- Syllable breakdown: syl-LA-ble (stress marks)
- Practice tips (tongue/lip position)
- Common Vietnamese speaker mistakes
"""

        # FLEXIBLE PROMPT - NO HARDCODED TYPES
        prompt = f"""You are a TOEIC Speaking expert. Analyze this student response comprehensively.

STUDENT TEXT: "{text}"
CONTEXT: {duration:.1f}s, {word_count} words, {wpm:.1f} WPM
TASK TYPE: {task_type}

{lt_context}
{pronunciation_context}

Return ONLY JSON:
{{
    "grammar": {{
        "score": 0-100,
        "errors": [
            {{
                "wrong": "exact phrase with error",
                "correct": "corrected version",
                "rule": "error type/rule name",
                "explanation": "why wrong and how to fix"
            }}
        ],
        "strengths": ["correct patterns from actual text"],
        "complexity": "basic|intermediate|advanced",
        "corrected_text": "complete corrected version"
    }},

    "vocabulary": {{
        "score": 0-100,
        "level": "basic|intermediate|advanced",
        "good_words": ["strong vocabulary used"],
        "weak_words": [
            {{"word": "weak word", "better": "stronger alternative", "example": "usage example"}}
        ],
        "overused": [
            {{"word": "repeated word", "count": number, "alternatives": ["synonym1", "synonym2"]}}
        ],
        "suggestions": ["specific improvements"]
    }},

    "fluency": {{
        "score": 0-100,
        "pace": "too slow|appropriate|too fast",
        "coherence": "poor|fair|good|excellent",
        "hesitation_markers": [
            {{"word": "um|uh|like", "count": number, "suggestion": "how to eliminate"}}
        ],
        "improvement_tip": "specific fluency improvement tip"
    }}{', "pronunciation_coaching": [...]' if pronunciation_context else ''}
}}

CRITICAL INSTRUCTIONS:

**GRAMMAR ERRORS** - Find ALL types, including but not limited to:
- Subject-verb agreement
- Verb tenses
- Articles (a/an/the)
- Prepositions
- Word form (adjective/adverb/noun)
- Singular/plural
- Sentence structure
- Any other grammatical mistakes

Do NOT limit yourself to these categories. If you find ANY error, report it.

**VOCABULARY** - Assess:
- Word choice appropriateness
- Vocabulary range and sophistication
- Repetition and alternatives
- Contextual accuracy

**FLUENCY** - Evaluate:
- Speaking pace
- Hesitations and fillers
- Logical flow and coherence
- Natural expression

SCORING GUIDE:
- 90-100: Excellent, 0-1 minor errors
- 80-89: Good, 2-3 minor or 1 major error
- 70-79: Fair, 4-6 errors
- 60-69: Poor, 7-10 errors
- Below 60: Very poor, 10+ errors

Analyze the ACTUAL student text. Be specific with corrections.
Return ONLY valid JSON."""

        try:
            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            # Parse JSON
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            analysis = json.loads(response_text)

            if isinstance(analysis, list):
                analysis = analysis[0] if analysis else {}

            # Merge with LanguageTool errors
            if basic_errors and task_type != "read_aloud":
                gemini_errors = analysis.get('grammar', {}).get('errors', [])
                merged = self._merge_errors(basic_errors, gemini_errors)
                analysis['grammar']['errors'] = merged

                # Adjust score based on total errors
                error_count = len(merged)
                base_score = analysis.get('grammar', {}).get('score', 75)

                if error_count == 0:
                    analysis['grammar']['score'] = min(100, base_score + 10)
                elif error_count <= 2:
                    analysis['grammar']['score'] = max(base_score, 85)
                elif error_count <= 5:
                    analysis['grammar']['score'] = max(base_score - 5, 70)
                else:
                    analysis['grammar']['score'] = min(base_score, 60 - (error_count - 5) * 3)

            logger.info("✅ Flexible AI analysis complete")
            return analysis

        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return self._fallback_analysis(text, duration)

    def _merge_errors(self, basic_errors: List[Dict], ai_errors: List[Dict]) -> List[Dict]:
        """Merge errors without duplicates"""
        merged = {}

        # Add basic errors (high priority)
        for err in basic_errors:
            key = err['wrong'].lower().strip()
            if key:
                merged[key] = {**err, 'source': 'LanguageTool', 'confidence': 'high'}

        # Add AI errors (if not duplicate)
        for err in ai_errors:
            wrong = err.get('wrong', '').lower().strip()
            if wrong and wrong not in merged:
                merged[wrong] = {**err, 'source': 'Gemini', 'confidence': 'medium'}

        return list(merged.values())[:10]

    def _fallback_analysis(self, text: str, duration: float) -> Dict:
        """Fallback when AI fails"""
        word_count = len(text.split())
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        return {
            'grammar': {'score': 75, 'errors': [], 'strengths': [],
                        'complexity': 'intermediate', 'corrected_text': text},
            'vocabulary': {'score': 75, 'level': 'intermediate', 'good_words': [],
                           'weak_words': [], 'overused': [], 'suggestions': []},
            'fluency': {'score': 80 if 120 <= wpm <= 150 else 70,
                        'pace': 'appropriate' if 120 <= wpm <= 150 else 'needs adjustment',
                        'coherence': 'fair', 'hesitation_markers': [], 'improvement_tip': ''}
        }

    # ============================================
    # PART 1: READ ALOUD (100% V4.5.0)
    # ============================================

    async def assess_read_aloud(self, audio_path: str, reference_text: str) -> Dict:
        """Part 1: Read Aloud - 100% V4.5.0 proven code"""
        logger.info("📖 Part 1: Read Aloud (v4.5.0 proven)")

        duration = self.get_audio_duration(audio_path)
        transcription = self.transcribe_audio_azure(audio_path)
        text_match = self._calculate_text_similarity(transcription, reference_text)

        # CẤP 1: < 40% → FAIL
        if text_match < 40:
            overall_score = 0
            scores = {
                'text_match': text_match,
                'pronunciation': 0,
                'accuracy': 0,
                'fluency': 0,
                'completeness': 0,
                'intonation': 0,
                'grammar': 0,
                'overall': 0
            }

            recommendations = [
                "❌ FAIL: Did NOT read the reference text",
                f"Text match: {text_match:.1f}% (need ≥40%)",
                "",
                "What you said:",
                f"❌ \"{transcription}\"",
                "",
                "What you should say:",
                f"✅ \"{reference_text}\"",
                "",
                "💡 Tips:",
                "• Read word-by-word slowly first",
                "• Practice the text before recording",
                "• Focus on accuracy over speed"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {
                    'text_match_percentage': text_match,
                    'reference_text': reference_text,
                    'pronunciation_details': {}
                },
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        # CẤP 2: 40-60% → POOR
        elif text_match < 60:
            overall_score = int(text_match)
            scores = {
                'text_match': text_match,
                'pronunciation': 0,
                'accuracy': 0,
                'fluency': 0,
                'completeness': 0,
                'intonation': 0,
                'grammar': 0,
                'overall': overall_score
            }

            recommendations = [
                f"⚠️ POOR: Many words wrong ({text_match:.1f}% match)",
                f"Need ≥60% to get pronunciation feedback",
                "",
                "What you said:",
                f"❌ \"{transcription}\"",
                "",
                "Reference text:",
                f"✅ \"{reference_text}\"",
                "",
                "💡 Next steps:",
                "• Compare your text with reference carefully",
                "• Read each word from the text",
                "• Don't skip or add words",
                "• Score can improve to 60+ if you read all words correctly"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {
                    'text_match_percentage': text_match,
                    'reference_text': reference_text,
                    'pronunciation_details': {}
                },
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        # CẤP 3: 60-80% → FAIR
        elif text_match < 80:
            pronunciation = self.analyze_pronunciation_azure(audio_path, reference_text)
            overall_score = int(text_match * 0.6 + pronunciation['pronunciation_score'] * 0.4)

            scores = {
                'text_match': text_match,
                'pronunciation': pronunciation['pronunciation_score'],
                'accuracy': pronunciation['accuracy_score'],
                'fluency': 0,
                'completeness': 0,
                'intonation': 0,
                'grammar': 0,
                'overall': overall_score
            }

            recommendations = [
                f"👍 FAIR: Some words missing ({text_match:.1f}% match)",
                f"Pronunciation: {pronunciation['pronunciation_score']}/100",
                f"Accuracy: {pronunciation['accuracy_score']}/100",
                "",
                "What you said:",
                f"⚠️ \"{transcription}\"",
                "",
                "Reference text:",
                f"✅ \"{reference_text}\"",
                "",
                "💡 Improvements needed:",
                "• Read more carefully - don't skip any words",
                "• Need ≥80% match to unlock full analysis",
                "• Practice pronunciation of individual words"
            ]

            if pronunciation.get('mispronounced_words'):
                recommendations.append("")
                recommendations.append("🗣️ Mispronounced words:")
                for word_info in pronunciation['mispronounced_words'][:5]:
                    word = word_info.get('word', '')
                    accuracy = word_info.get('accuracy', 0)
                    recommendations.append(f"  • \"{word}\" (accuracy: {accuracy}/100)")

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {
                    'text_match_percentage': text_match,
                    'reference_text': reference_text,
                    'pronunciation_details': pronunciation
                },
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        # CẤP 4: >= 80% → GOOD/EXCELLENT
        else:
            pronunciation = self.analyze_pronunciation_azure(audio_path, reference_text)
            intonation_score = self._analyze_intonation_basic(audio_path)

            fluency_raw = pronunciation['fluency_score']
            completeness = pronunciation['completeness_score']

            if completeness < 50:
                fluency_adjusted = int(fluency_raw * 0.5)
            elif completeness < 80:
                fluency_adjusted = int(fluency_raw * 0.8)
            else:
                fluency_adjusted = fluency_raw

            # Comprehensive analysis
            text_analysis = await self._analyze_read_aloud_with_coaching(
                text=transcription,
                duration=duration,
                pronunciation_data=pronunciation,
                reference_text=reference_text
            )

            scores = {
                'text_match': text_match,
                'pronunciation': pronunciation['pronunciation_score'],
                'accuracy': pronunciation['accuracy_score'],
                'fluency': fluency_adjusted,
                'completeness': completeness,
                'intonation': intonation_score,
                'grammar': text_analysis.get('grammar', {}).get('score', 85)
            }

            overall_score = int(
                text_match * 0.25 +
                pronunciation['pronunciation_score'] * 0.30 +
                pronunciation['accuracy_score'] * 0.20 +
                fluency_adjusted * 0.15 +
                intonation_score * 0.10
            )
            scores['overall'] = overall_score

            detailed_analysis = {
                'text_match_percentage': text_match,
                'reference_text': reference_text,
                'pronunciation_details': pronunciation,
                'pronunciation_coaching': text_analysis.get('pronunciation_coaching', []),
                'grammar_analysis': text_analysis.get('grammar', {}),
                'vocabulary_analysis': text_analysis.get('vocabulary', {}),
                'fluency_analysis': text_analysis.get('fluency', {})
            }

            recommendations = self._generate_read_aloud_recommendations(
                scores, detailed_analysis, transcription, reference_text
            )

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': detailed_analysis,
                'recommendations': recommendations,
                'overall_score': overall_score
            }

    async def _analyze_read_aloud_with_coaching(self, text: str, duration: float,
                                                pronunciation_data: Dict,
                                                reference_text: str) -> Dict:
        """V4.5.0 pronunciation coaching analysis"""

        if not self.gemini_text_model:
            return self._fallback_analysis(text, duration)

        word_count = len(text.split())
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        mispronounced = pronunciation_data.get('mispronounced_words', [])
        omitted = pronunciation_data.get('omitted_words', [])

        pronunciation_context = ""
        if mispronounced or omitted:
            mispronounced_list = [w.get('word', '') for w in mispronounced[:8]]

            pronunciation_context = f"""
🎤 PRONUNCIATION DATA FROM AZURE:

Mispronounced words: {mispronounced_list if mispronounced_list else "None"}
Omitted words: {omitted if omitted else "None"}

YOUR TASK: Generate DETAILED pronunciation coaching for EACH mispronounced word:

For each word provide:
1. Specific pronunciation issue
2. Correct pronunciation with IPA: /fəˈnetɪk/
3. Syllable breakdown with stress: pri-MAR-y
4. Practical practice tip (tongue/lip positioning)
5. Common mistakes Vietnamese speakers make

Example format:
{{
    "word": "beautiful",
    "current_issue": "pronouncing as 'bootiful' - missing 'yoo' sound",
    "correct_pronunciation": "/ˈbjuː.tɪ.fəl/ - BYOO-ti-ful",
    "syllable_breakdown": "beau-ti-ful (stress on BEAU)",
    "practice_tip": "Start with 'byoo' (lips rounded), NOT 'boo'. Practice: you → beauty → beautiful",
    "common_mistake": "Vietnamese speakers skip the 'y' sound",
    "similar_words": "duty /ˈdjuː.ti/ - both have 'yoo' sound"
}}
"""

        prompt = f"""You are an expert TOEIC Speaking assessor and pronunciation coach.

📝 READ ALOUD ASSESSMENT:

Reference: "{reference_text}"
Student: "{text}"
Duration: {duration:.1f}s, {word_count} words, {wpm:.1f} WPM

{pronunciation_context}

Return ONLY JSON:
{{
    "grammar": {{
        "score": 0-100,
        "errors": [
            {{
                "wrong": "exact phrase with error",
                "correct": "corrected phrase",
                "rule": "grammar rule",
                "explanation": "why wrong"
            }}
        ],
        "strengths": ["strengths"],
        "corrected_text": "corrected version"
    }},

    "vocabulary": {{
        "score": 0-100,
        "good_words": ["strong words"],
        "weak_words": [
            {{"word": "weak", "better": "better", "example": "example"}}
        ]
    }},

    "fluency": {{
        "score": 0-100,
        "pace": "appropriate|too slow|too fast",
        "hesitation_markers": [
            {{"word": "um|uh", "count": number, "suggestion": "fix"}}
        ],
        "improvement_tips": ["tips"]
    }},

    "pronunciation_coaching": [
        {{
            "word": "mispronounced word",
            "current_issue": "specific problem",
            "correct_pronunciation": "IPA: /fəˈnetɪk/ - phonetic",
            "syllable_breakdown": "syl-LA-ble (stress marks)",
            "practice_tip": "detailed practice method",
            "common_mistake": "typical Vietnamese error",
            "similar_words": "similar words for practice"
        }}
    ]
}}

CRITICAL:
- Pronunciation coaching for ALL mispronounced words
- Include IPA notation
- Mark stress clearly
- Practical tips for tongue/lip position
- If no mispronunciations: return []

Return ONLY valid JSON."""

        try:
            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            analysis = json.loads(response_text)

            if isinstance(analysis, list):
                analysis = analysis[0] if analysis else {}

            analysis.setdefault('grammar', {})
            analysis.setdefault('vocabulary', {})
            analysis.setdefault('fluency', {})
            analysis.setdefault('pronunciation_coaching', [])

            return analysis

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._fallback_analysis(text, duration)

    def _generate_read_aloud_recommendations(self, scores: Dict, detailed_analysis: Dict,
                                             transcription: str, reference_text: str) -> List[str]:
        """Generate recommendations for Read Aloud"""

        recommendations = []
        overall = scores.get('overall', 0)

        if overall >= 90:
            recommendations.append("🌟 EXCELLENT! Almost perfect reading.")
        elif overall >= 80:
            recommendations.append("✅ GOOD JOB! Minor improvements needed.")
        elif overall >= 70:
            recommendations.append("👍 FAIR. Focus on areas below.")
        else:
            recommendations.append("⚠️ NEEDS IMPROVEMENT. Practice more.")

        recommendations.append("")
        recommendations.append(f"📊 Your Scores:")
        recommendations.append(f"   • Text Match: {scores.get('text_match', 0):.1f}%")
        recommendations.append(f"   • Pronunciation: {scores.get('pronunciation', 0)}/100")
        recommendations.append(f"   • Accuracy: {scores.get('accuracy', 0)}/100")
        recommendations.append(f"   • Fluency: {scores.get('fluency', 0)}/100")
        recommendations.append(f"   • Intonation: {scores.get('intonation', 0)}/100")
        if scores.get('grammar', 0) > 0:
            recommendations.append(f"   • Grammar: {scores.get('grammar', 0)}/100")
        recommendations.append("")

        # Pronunciation Coaching
        coaching = detailed_analysis.get('pronunciation_coaching', [])

        if coaching:
            recommendations.append("🎤 PRONUNCIATION COACHING:")
            recommendations.append("")

            for i, tip in enumerate(coaching[:5], 1):
                if isinstance(tip, dict):
                    word = tip.get('word', '')
                    issue = tip.get('current_issue', '')
                    correct = tip.get('correct_pronunciation', '')
                    syllables = tip.get('syllable_breakdown', '')
                    practice = tip.get('practice_tip', '')

                    recommendations.append(f"   {i}. Word: \"{word}\"")

                    if issue:
                        recommendations.append(f"      ❌ Your issue: {issue}")

                    if correct:
                        recommendations.append(f"      ✅ Correct: {correct}")

                    if syllables:
                        recommendations.append(f"      📖 Syllables: {syllables}")

                    if practice:
                        recommendations.append(f"      💡 Practice: {practice}")

                    recommendations.append("")

        # Grammar
        grammar_analysis = detailed_analysis.get('grammar_analysis', {})
        grammar_score = scores.get('grammar', 100)

        if grammar_score < 85:
            errors = grammar_analysis.get('errors', [])

            if errors:
                recommendations.append(f"📝 GRAMMAR ({grammar_score}/100):")
                recommendations.append("")

                for i, err in enumerate(errors[:3], 1):
                    if isinstance(err, dict):
                        wrong = err.get('wrong', '')
                        correct = err.get('correct', '')
                        rule = err.get('rule', '')

                        recommendations.append(f"   {i}. ❌ \"{wrong}\"")
                        recommendations.append(f"      ✅ \"{correct}\"")

                        if rule:
                            recommendations.append(f"      📖 Rule: {rule}")

                        recommendations.append("")

        # Final encouragement
        if overall >= 85:
            recommendations.append("💪 Excellent work! Keep it up!")
        elif overall >= 70:
            recommendations.append("💪 Good progress! Focus on areas above.")
        else:
            recommendations.append("💪 Keep practicing! Improvement takes time.")

        return recommendations

    # ============================================
    # PART 2: DESCRIBE PICTURE
    # ============================================

    async def assess_describe_picture(self, audio_path: str,
                                      image_path: Optional[str] = None,
                                      expected_content: Optional[str] = None) -> Dict:
        """Part 2: Describe Picture"""

        if not image_path and not expected_content:
            raise HTTPException(400, "Image or expected_content REQUIRED")

        logger.info("🖼️ Part 2: Describe Picture")

        duration = self.get_audio_duration(audio_path)
        transcription = self.transcribe_audio_azure(audio_path)

        if not transcription or len(transcription.split()) < 10:
            return {
                'transcription': transcription,
                'duration': duration,
                'scores': {'relevance': 0, 'overall': 0},
                'recommendations': [
                    "❌ FAIL: Response too short (need 10+ words)",
                    f"Word count: {len(transcription.split())}",
                    "Describe people, objects, actions, colors, location"
                ],
                'overall_score': 0
            }

        # Image analysis
        ai_image_description = None
        if image_path and self.gemini_vision_model:
            try:
                ai_image_description = self.analyze_image_with_gemini(image_path)
            except:
                if not expected_content:
                    raise HTTPException(500, "Image analysis failed")

        reference_content = expected_content if expected_content else ai_image_description
        if not reference_content:
            raise HTTPException(500, "No reference content")

        # Compare description
        content_relevance = self.compare_description_with_image(
            transcription,
            ai_image_description or reference_content,
            expected_content=reference_content
        )
        content_score = content_relevance.get('relevance_score', 0)

        # 4-TIER SYSTEM
        if content_score < 30:
            overall_score = 0
            scores = {'content_accuracy': content_score, 'intonation': 0,
                      'grammar': 0, 'vocabulary': 0, 'fluency': 0, 'overall': 0}

            incorrect = content_relevance.get('incorrect_elements', [])
            recommendations = [
                "❌ FAIL: Completely wrong description",
                f"X You described: {', '.join(incorrect[:2])}" if incorrect else "You described something different",
                f"✓ Image shows: {reference_content[:100]}...",
                "Look at the image again - describe what you SEE",
                "Score: 0"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'content_relevance': content_relevance},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        elif content_score < 50:
            overall_score = content_score
            scores = {'content_accuracy': content_score, 'intonation': 0,
                      'grammar': 0, 'vocabulary': 0, 'fluency': 0, 'overall': overall_score}

            missing = content_relevance.get('missing_elements', [])
            incorrect = content_relevance.get('incorrect_elements', [])
            suggestions = content_relevance.get('suggestions', [])

            recommendations = [
                f"⚠️ POOR: Major errors ({content_score}/100)",
                f"X Wrong: {', '.join(incorrect[:2])}" if incorrect else "",
                f"Missing: {', '.join(missing[:3])}" if missing else "",
                f"✓ Add: {suggestions[0]}" if suggestions else "Describe main subjects and actions",
                "Other skills not evaluated due to low content score"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'content_relevance': content_relevance},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        elif content_score < 70:
            intonation_score = self._analyze_intonation_basic(audio_path)
            overall_score = int(content_score * 0.7 + intonation_score * 0.3)
            scores = {'content_accuracy': content_score, 'intonation': intonation_score,
                      'grammar': 0, 'vocabulary': 0, 'fluency': 0, 'overall': overall_score}

            missing = content_relevance.get('missing_elements', [])
            suggestions = content_relevance.get('suggestions', [])

            recommendations = [
                f"👍 FAIR: Partially correct ({content_score}/100)",
                f"Intonation: {intonation_score}/100",
                f"Missing: {', '.join(missing[:2])}" if missing else "",
                f"✓ {suggestions[0]}" if suggestions else "Add more details",
                "Grammar/vocabulary not evaluated yet - improve content first"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'content_relevance': content_relevance},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        else:
            intonation_score = self._analyze_intonation_basic(audio_path)

            text_analysis = await self._analyze_with_flexible_ai(
                transcription, duration, task_type="describe_picture"
            )

            scores = {
                'content_accuracy': content_score,
                'intonation': intonation_score,
                'grammar': text_analysis.get('grammar', {}).get('score', 75),
                'vocabulary': text_analysis.get('vocabulary', {}).get('score', 75),
                'fluency': text_analysis.get('fluency', {}).get('score', 75)
            }

            overall_score = int(
                content_score * 0.40 +
                intonation_score * 0.10 +
                scores['grammar'] * 0.20 +
                scores['vocabulary'] * 0.20 +
                scores['fluency'] * 0.10
            )
            scores['overall'] = overall_score

            detailed_analysis = {
                'content_relevance': content_relevance,
                'grammar_analysis': text_analysis.get('grammar', {}),
                'vocabulary_analysis': text_analysis.get('vocabulary', {}),
                'fluency_analysis': text_analysis.get('fluency', {})
            }

            recommendations = self._generate_recommendations(scores, detailed_analysis)

            missing = content_relevance.get('missing_elements', [])
            if missing:
                recommendations.insert(0, f"Content: Add {', '.join(missing[:2])}")

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': detailed_analysis,
                'recommendations': recommendations[:8],
                'overall_score': overall_score
            }

    # ============================================
    # PART 3: RESPOND TO QUESTIONS
    # ============================================

    async def assess_respond_questions(self, audio_path: str,
                                       question_context: Optional[str] = None) -> Dict:
        """Part 3: Respond to Questions (Q5-7)"""

        logger.info("❓ Part 3: Respond to Questions")

        duration = self.get_audio_duration(audio_path)
        transcription = self.transcribe_audio_azure(audio_path)
        word_count = len(transcription.split())

        if word_count < 20:
            return {
                'transcription': transcription,
                'duration': duration,
                'scores': {
                    'word_count': word_count,
                    'pronunciation': 0,
                    'intonation': 0,
                    'grammar': 0,
                    'vocabulary': 0,
                    'cohesion': 0,
                    'relevance': 0,
                    'completeness': 0,
                    'overall': 0
                },
                'detailed_analysis': {},
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 20 minimum)",
                    "Must answer all 3 questions",
                    "Need at least 60 words for good score",
                    "Speak more - give details and examples"
                ],
                'overall_score': 0
            }

        text_analysis = await self._analyze_respond_questions_flexible(
            transcription, duration, question_context
        )

        relevance_score = text_analysis.get('relevance_of_content', {}).get('score', 0)
        completeness_score = text_analysis.get('completeness_of_content', {}).get('score', 0)

        if relevance_score < 30 or completeness_score < 30:
            overall_score = max(relevance_score, completeness_score)
            scores = {
                'word_count': word_count,
                'relevance': relevance_score,
                'completeness': completeness_score,
                'pronunciation': 0,
                'intonation': 0,
                'grammar': 0,
                'vocabulary': 0,
                'cohesion': 0,
                'overall': overall_score
            }

            issues = text_analysis.get('relevance_of_content', {}).get('issues', 'Off-topic')
            missing_details = text_analysis.get('completeness_of_content', {}).get('missing_details',
                                                                                   'Missing key info')

            recommendations = [
                "❌ FAIL: Didn't answer properly",
                f"Relevance issue: {issues}" if issues not in ['none', 'N/A'] else "",
                f"Completeness: {missing_details}",
                "Answer ALL questions that were asked"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'content_analysis': text_analysis},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        elif completeness_score < 60:
            intonation_score = self._analyze_intonation_basic(audio_path)
            overall_score = int(relevance_score * 0.3 + completeness_score * 0.4 + intonation_score * 0.3)

            scores = {
                'word_count': word_count,
                'relevance': relevance_score,
                'completeness': completeness_score,
                'intonation': intonation_score,
                'pronunciation': 0,
                'grammar': 0,
                'vocabulary': 0,
                'cohesion': 0,
                'overall': overall_score
            }

            suggestions = text_analysis.get('completeness_of_content', {}).get('suggestions', [])
            recommendations = [
                f"👍 Content incomplete ({completeness_score}/100)",
                f"Intonation: {intonation_score}/100"
            ]
            if suggestions:
                for sug in suggestions[:2]:
                    recommendations.append(f"✓ {sug}")

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'content_analysis': text_analysis},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        else:
            pronunciation = self.analyze_pronunciation_azure(audio_path, transcription)
            intonation_score = self._analyze_intonation_basic(audio_path)

            scores = {
                'word_count': word_count,
                'pronunciation': pronunciation['pronunciation_score'],
                'intonation': intonation_score,
                'grammar': text_analysis.get('grammar', {}).get('score', 75),
                'vocabulary': text_analysis.get('vocabulary', {}).get('score', 75),
                'cohesion': text_analysis.get('cohesion', {}).get('score', 75),
                'relevance': relevance_score,
                'completeness': completeness_score
            }

            overall_score = int(
                scores['pronunciation'] * 0.15 +
                scores['intonation'] * 0.10 +
                scores['grammar'] * 0.20 +
                scores['vocabulary'] * 0.15 +
                scores['cohesion'] * 0.15 +
                scores['relevance'] * 0.15 +
                scores['completeness'] * 0.10
            )
            scores['overall'] = overall_score

            detailed_analysis = {
                'pronunciation_details': pronunciation,
                'grammar_analysis': text_analysis.get('grammar', {}),
                'vocabulary_analysis': text_analysis.get('vocabulary', {}),
                'cohesion_analysis': text_analysis.get('cohesion', {}),
                'relevance_analysis': text_analysis.get('relevance_of_content', {}),
                'completeness_analysis': text_analysis.get('completeness_of_content', {})
            }

            recommendations = self._generate_recommendations(scores, detailed_analysis)

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': detailed_analysis,
                'recommendations': recommendations[:10],
                'overall_score': overall_score
            }

    async def _analyze_respond_questions_flexible(self, text: str, duration: float,
                                                  question_context: Optional[str] = None) -> Dict:
        """Flexible analysis for Part 3"""

        if not self.gemini_text_model:
            return self._fallback_respond_analysis(text, duration)

        word_count = len(text.split())
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        basic_errors = self.grammar_checker.check_basic_errors(text)

        lt_context = ""
        if basic_errors:
            error_list = [f"'{e['wrong']}' → '{e['correct']}'" for e in basic_errors[:8]]
            lt_context = f"""
BASIC ERRORS DETECTED:
{json.dumps(error_list, indent=2)}

Your task: Analyze comprehensively beyond these basic errors.
"""

        context_instruction = ""
        if question_context and question_context.strip():
            context_instruction = f"""
QUESTIONS ASKED:
{question_context}

Analyze if student answered ALL questions with SPECIFIC feedback.
"""
        else:
            context_instruction = "This is Question 5-7: Student must answer 3 questions."

        prompt = f"""You are a TOEIC Speaking expert for Questions 5-7.

{context_instruction}

STUDENT ANSWER: "{text}"
DURATION: {duration}s, {word_count} words, {wpm:.1f} WPM

{lt_context}

Return ONLY JSON:
{{
    "relevance_of_content": {{
        "score": 75,
        "assessment": "relevant|partially relevant|off-topic",
        "issues": "specific issue or none",
        "which_questions_answered": [1, 2, 3],
        "missing_questions": []
    }},

    "completeness_of_content": {{
        "score": 70,
        "questions_answered": 3,
        "missing_details": "Should add X",
        "coverage": "adequate|incomplete",
        "suggestions": ["Add example for Q2"]
    }},

    "grammar": {{
        "score": 80,
        "errors": [
            {{"wrong": "text", "correct": "text", "rule": "rule", "explanation": "why wrong"}}
        ],
        "strengths": ["strength"],
        "corrected_text": "full corrected answer"
    }},

    "vocabulary": {{
        "score": 75,
        "good_words": ["word"],
        "weak_words": [{{"word": "X", "better": "Y", "example": "context"}}],
        "overused": [{{"word": "repeated", "count": 3, "alternatives": ["alt1"]}}]
    }},

    "cohesion": {{
        "score": 70,
        "logical_flow": "logical|unclear",
        "connectors_used": ["because", "also"],
        "missing_connectors": ["however"],
        "suggestion": "Add 'For instance'"
    }},

    "fluency": {{
        "score": 75,
        "pace": "appropriate|too slow|too fast",
        "hesitation_markers": [{{"word": "um", "count": 2, "fix": "pause silently"}}],
        "improvement_tip": "specific tip"
    }}
}}

CRITICAL:
- Find ALL error types (grammar, vocab, structure, flow)
- Do NOT limit to predefined categories
- Be specific with ALL corrections
- Analyze ACTUAL student text

Return ONLY valid JSON."""

        try:
            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            analysis = json.loads(response_text)

            if isinstance(analysis, list):
                analysis = analysis[0] if analysis else {}

            if basic_errors:
                gemini_errors = analysis.get('grammar', {}).get('errors', [])
                merged = self._merge_errors(basic_errors, gemini_errors)
                analysis['grammar']['errors'] = merged

            return analysis

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._fallback_respond_analysis(text, duration)

    def _fallback_respond_analysis(self, text: str, duration: float) -> Dict:
        """Fallback for Part 3"""
        return {
            'relevance_of_content': {'score': 70, 'assessment': 'AI unavailable',
                                     'issues': 'N/A', 'which_questions_answered': [],
                                     'missing_questions': []},
            'completeness_of_content': {'score': 70, 'questions_answered': 3,
                                        'missing_details': 'Unknown', 'coverage': 'estimated',
                                        'suggestions': []},
            'grammar': {'score': 75, 'errors': [], 'strengths': [], 'corrected_text': ''},
            'vocabulary': {'score': 75, 'good_words': [], 'weak_words': []},
            'cohesion': {'score': 70, 'logical_flow': 'unknown', 'connectors_used': [],
                         'missing_connectors': [], 'suggestion': ''},
            'fluency': {'score': 75, 'pace': 'appropriate', 'hesitation_markers': [],
                        'improvement_tip': ''}
        }

    # ============================================
    # PART 4: RESPOND WITH INFO
    # ============================================

    async def assess_respond_with_info(self, audio_path: str, reference_info: str) -> Dict:
        """Part 4: Respond with Information (Q8-10)"""

        if not reference_info or reference_info.strip() == "":
            raise HTTPException(400, "reference_info REQUIRED")

        logger.info("📋 Part 4: Respond with Information")

        duration = self.get_audio_duration(audio_path)
        transcription = self.transcribe_audio_azure(audio_path)
        word_count = len(transcription.split())

        if word_count < 20:
            return {
                'transcription': transcription,
                'duration': duration,
                'scores': {
                    'word_count': word_count,
                    'information_accuracy': 0,
                    'completeness': 0,
                    'pronunciation': 0,
                    'intonation': 0,
                    'grammar': 0,
                    'vocabulary': 0,
                    'cohesion': 0,
                    'overall': 0
                },
                'detailed_analysis': {},
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 20)",
                    "Need 60+ words to answer all 3 questions",
                    "Use information from the schedule provided"
                ],
                'overall_score': 0
            }

        text_analysis = await self._analyze_info_accuracy_flexible(
            transcription, duration, reference_info
        )

        accuracy_score = text_analysis.get('information_accuracy', {}).get('score', 0)
        error_count = text_analysis.get('information_accuracy', {}).get('factual_errors_count', 0)
        completeness_score = text_analysis.get('completeness_of_content', {}).get('score', 0)

        pronunciation = self.analyze_pronunciation_azure(audio_path, transcription)
        intonation_score = self._analyze_intonation_basic(audio_path)

        grammar_score = text_analysis.get('grammar', {}).get('score', 75)
        vocabulary_score = text_analysis.get('vocabulary', {}).get('score', 75)
        cohesion_score = text_analysis.get('cohesion', {}).get('score', 75)

        scores = {
            'word_count': word_count,
            'information_accuracy': accuracy_score,
            'factual_errors': error_count,
            'completeness': completeness_score,
            'pronunciation': pronunciation['pronunciation_score'],
            'intonation': intonation_score,
            'grammar': grammar_score,
            'vocabulary': vocabulary_score,
            'cohesion': cohesion_score
        }

        if accuracy_score < 30 or error_count >= 2:
            overall_score = 0

            accuracy_analysis = text_analysis.get('information_accuracy', {})
            incorrect = accuracy_analysis.get('incorrect_facts', [])
            correction = accuracy_analysis.get('correction', '')

            recommendations = [
                "❌ FAIL: Major factual errors - cannot pass",
                f"Factual errors: {error_count}",
                "Score: 0 - MUST use EXACT schedule information",
                ""
            ]

            if incorrect:
                recommendations.append("X Your errors:")
                for fact in incorrect[:2]:
                    if isinstance(fact, dict):
                        said = fact.get('student_said', '')
                        should = fact.get('should_be', '')
                        recommendations.append(f"  You said: {said}")
                        recommendations.append(f"  Should be: {should}")

            if correction:
                recommendations.append(f"✓ Correct answer: {correction}")

            recommendations.extend([
                "",
                "Your other skills:",
                f"  Pronunciation: {pronunciation['pronunciation_score']}/100",
                f"  Grammar: {grammar_score}/100",
                "Fix information accuracy to get credit for language skills"
            ])

            scores['overall'] = overall_score

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': text_analysis,
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        elif accuracy_score < 70:
            overall_score = int(
                accuracy_score * 0.30 +
                completeness_score * 0.15 +
                pronunciation['pronunciation_score'] * 0.20 +
                intonation_score * 0.10 +
                grammar_score * 0.15 +
                vocabulary_score * 0.05 +
                cohesion_score * 0.05
            )

            accuracy_analysis = text_analysis.get('information_accuracy', {})
            incorrect = accuracy_analysis.get('incorrect_facts', [])

            recommendations = [
                f"👍 FAIR: Information accuracy needs improvement ({accuracy_score}/100)",
                f"Factual errors: {error_count}"
            ]

            if incorrect:
                for fact in incorrect[:2]:
                    if isinstance(fact, dict):
                        said = fact.get('student_said', '')
                        should = fact.get('should_be', '')
                        recommendations.append(f"X Wrong: {said} → ✓ Correct: {should}")

            recommendations.extend([
                f"Pronunciation: {pronunciation['pronunciation_score']}/100",
                f"Grammar: {grammar_score}/100",
                "Use EXACT data from schedule - don't guess!"
            ])

            scores['overall'] = overall_score

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': text_analysis,
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        else:
            overall_score = int(
                accuracy_score * 0.40 +
                completeness_score * 0.15 +
                pronunciation['pronunciation_score'] * 0.15 +
                intonation_score * 0.10 +
                grammar_score * 0.10 +
                vocabulary_score * 0.05 +
                cohesion_score * 0.05
            )

            recommendations = []
            if accuracy_score < 90:
                recommendations.append(f"Information Accuracy: {accuracy_score}/100 - minor issues")
            if pronunciation['pronunciation_score'] < 80:
                recommendations.append(f"Pronunciation: {pronunciation['pronunciation_score']}/100")
            if grammar_score < 80:
                grammar_errors = text_analysis.get('grammar', {}).get('errors', [])
                if grammar_errors:
                    recommendations.append(f"Grammar: {grammar_score}/100")
                    for err in grammar_errors[:1]:
                        if isinstance(err, dict):
                            recommendations.append(f"  X '{err.get('wrong')}' → ✓ '{err.get('correct')}'")
            if overall_score >= 85:
                recommendations.append("✅ Excellent! Accurate use of information")

            scores['overall'] = overall_score

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': text_analysis,
                'recommendations': recommendations[:12],
                'overall_score': overall_score
            }

    async def _analyze_info_accuracy_flexible(self, text: str, duration: float,
                                              reference_info: str) -> Dict:
        """Flexible analysis for Part 4"""

        if not self.gemini_text_model:
            return self._fallback_info_analysis(text, duration)

        word_count = len(text.split())

        basic_errors = self.grammar_checker.check_basic_errors(text)

        lt_context = ""
        if basic_errors:
            error_list = [f"'{e['wrong']}' → '{e['correct']}'" for e in basic_errors[:8]]
            lt_context = f"""
BASIC GRAMMAR ERRORS:
{json.dumps(error_list, indent=2)}

Focus on: Information accuracy + context/style errors.
"""

        prompt = f"""You are a TOEIC Speaking expert for Question 8-10.

PROVIDED INFORMATION (REFERENCE): {reference_info}
STUDENT ANSWER: "{text}"

{lt_context}

Return ONLY JSON:
{{
    "information_accuracy": {{
        "score": 75,
        "correct_facts": ["Student said meeting at 2pm correctly"],
        "incorrect_facts": [
            {{"student_said": "3pm", "should_be": "2pm", "severity": "major"}}
        ],
        "missing_facts": ["Forgot duration"],
        "factual_errors_count": 2,
        "assessment": "mostly accurate|has errors",
        "correction": "Meeting is at 2pm (not 3pm) in Room B"
    }},

    "completeness_of_content": {{
        "score": 70,
        "questions_answered": 3,
        "missing_details": "Should mention X",
        "suggestions": ["Add Y"]
    }},

    "grammar": {{
        "score": 80,
        "errors": [{{"wrong": "text", "correct": "text", "rule": "rule"}}],
        "corrected_text": "corrected with CORRECT facts"
    }},

    "vocabulary": {{
        "score": 75,
        "good_words": ["word"],
        "weak_words": [{{"word": "X", "better": "Y"}}]
    }},

    "cohesion": {{
        "score": 78,
        "connectors_used": ["first", "then"],
        "missing_connectors": ["finally"]
    }}
}}

CRITICAL:
- Check if facts match REFERENCE info
- Identify ALL incorrect facts
- Score based on accuracy: 2+ errors = 0-40, 1 error = 50-70, all correct = 80-100
- Find ALL grammar/vocab errors (not just basic ones)

Return ONLY JSON."""

        try:
            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            analysis = json.loads(response_text)

            if isinstance(analysis, list):
                analysis = analysis[0] if analysis else {}

            if basic_errors:
                gemini_errors = analysis.get('grammar', {}).get('errors', [])
                merged = self._merge_errors(basic_errors, gemini_errors)
                analysis['grammar']['errors'] = merged

            return analysis

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._fallback_info_analysis(text, duration)

    def _fallback_info_analysis(self, text: str, duration: float) -> Dict:
        """Fallback for Part 4"""
        return {
            'information_accuracy': {'score': 70, 'correct_facts': [], 'incorrect_facts': [],
                                     'missing_facts': [], 'factual_errors_count': 0,
                                     'assessment': 'AI unavailable', 'correction': ''},
            'completeness_of_content': {'score': 70, 'questions_answered': 3,
                                        'missing_details': 'unknown', 'suggestions': []},
            'grammar': {'score': 75, 'errors': [], 'corrected_text': ''},
            'vocabulary': {'score': 75, 'good_words': [], 'weak_words': []},
            'cohesion': {'score': 70, 'connectors_used': [], 'missing_connectors': []}
        }

    # ============================================
    # PART 5: EXPRESS OPINION
    # ============================================

    async def assess_express_opinion(self, audio_path: str,
                                     question_context: Optional[str] = None) -> Dict:
        """Part 5: Express Opinion (Q11)"""

        logger.info("💭 Part 5: Express Opinion")

        duration = self.get_audio_duration(audio_path)
        transcription = self.transcribe_audio_azure(audio_path)
        word_count = len(transcription.split())

        if word_count < 30:
            return {
                'transcription': transcription,
                'duration': duration,
                'scores': {
                    'word_count': word_count,
                    'relevance': 0,
                    'opinion_clarity': 0,
                    'reasoning': 0,
                    'pronunciation': 0,
                    'intonation': 0,
                    'grammar': 0,
                    'vocabulary': 0,
                    'fluency': 0,
                    'coherence': 0,
                    'overall': 0
                },
                'detailed_analysis': {},
                'recommendations': [
                    f"❌ FAIL: Too short ({word_count} words < 30 minimum)",
                    "Need 60+ words for complete answer",
                    "Must: State opinion → Give reasons → Provide examples",
                    "Example: 'I prefer X because Y. For instance, when I...'"
                ],
                'overall_score': 0
            }

        text_analysis = await self._analyze_express_opinion_flexible(
            transcription, duration, question_context
        )

        relevance_score = text_analysis.get('relevance_to_question', {}).get('score', 0)

        if relevance_score < 30:
            overall_score = 0
            scores = {
                'word_count': word_count,
                'relevance': relevance_score,
                'opinion_clarity': 0,
                'reasoning': 0,
                'pronunciation': 0,
                'intonation': 0,
                'grammar': 0,
                'vocabulary': 0,
                'fluency': 0,
                'coherence': 0,
                'overall': 0
            }

            relevance_analysis = text_analysis.get('relevance_to_question', {})
            issues = relevance_analysis.get('issues', 'Off-topic')
            suggestion = relevance_analysis.get('suggestion', '')

            recommendations = [
                f"❌ FAIL: Completely off-topic ({relevance_score}/100)",
                "You did NOT address the question",
                f"Issue: {issues}" if issues not in ['none', 'N/A'] else "",
                f"✓ {suggestion}" if suggestion else "Read the question carefully",
                "Score: 0"
            ]

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': {'relevance_analysis': relevance_analysis},
                'recommendations': recommendations,
                'overall_score': overall_score
            }

        else:
            opinion_clarity = text_analysis.get('opinion_clarity', {}).get('score', 0)
            reasoning_score = text_analysis.get('reasoning_quality', {}).get('score', 0)

            pronunciation = self.analyze_pronunciation_azure(audio_path, transcription)
            intonation_score = self._analyze_intonation_basic(audio_path)
            grammar_score = text_analysis.get('grammar', {}).get('score', 75)
            vocabulary_score = text_analysis.get('vocabulary', {}).get('score', 75)
            fluency_score = text_analysis.get('fluency', {}).get('score', 75)
            coherence_score = text_analysis.get('coherence', {}).get('score', 75)

            scores = {
                'word_count': word_count,
                'relevance': relevance_score,
                'opinion_clarity': opinion_clarity,
                'reasoning': reasoning_score,
                'pronunciation': pronunciation['pronunciation_score'],
                'intonation': intonation_score,
                'grammar': grammar_score,
                'vocabulary': vocabulary_score,
                'fluency': fluency_score,
                'coherence': coherence_score
            }

            if opinion_clarity < 40:
                overall_score = int(
                    relevance_score * 0.25 +
                    opinion_clarity * 0.25 +
                    pronunciation['pronunciation_score'] * 0.15 +
                    grammar_score * 0.15 +
                    intonation_score * 0.10 +
                    vocabulary_score * 0.05 +
                    fluency_score * 0.03 +
                    coherence_score * 0.02
                )

                opinion_analysis = text_analysis.get('opinion_clarity', {})
                recommendations = [
                    f"⚠️ POOR: No clear opinion ({opinion_clarity}/100)",
                    f"✓ {opinion_analysis.get('suggestion', 'State clearly: I agree/disagree or I prefer A/B')}",
                    f"Pronunciation: {pronunciation['pronunciation_score']}/100",
                    f"Grammar: {grammar_score}/100"
                ]

            elif reasoning_score < 50:
                overall_score = int(
                    relevance_score * 0.20 +
                    opinion_clarity * 0.15 +
                    reasoning_score * 0.20 +
                    pronunciation['pronunciation_score'] * 0.15 +
                    grammar_score * 0.15 +
                    intonation_score * 0.08 +
                    vocabulary_score * 0.04 +
                    fluency_score * 0.02 +
                    coherence_score * 0.01
                )

                reasoning_analysis = text_analysis.get('reasoning_quality', {})
                recommendations = [
                    f"👍 FAIR: Weak reasoning ({reasoning_score}/100)",
                    f"Opinion: {text_analysis.get('opinion_clarity', {}).get('opinion_stated', 'stated')}",
                    f"✓ {reasoning_analysis.get('suggestion', 'Provide specific examples')}",
                    f"Pronunciation: {pronunciation['pronunciation_score']}/100",
                    f"Grammar: {grammar_score}/100"
                ]

            else:
                overall_score = int(
                    relevance_score * 0.15 +
                    opinion_clarity * 0.10 +
                    reasoning_score * 0.15 +
                    pronunciation['pronunciation_score'] * 0.15 +
                    intonation_score * 0.10 +
                    grammar_score * 0.15 +
                    vocabulary_score * 0.10 +
                    fluency_score * 0.05 +
                    coherence_score * 0.05
                )

                recommendations = []

                if grammar_score < 80:
                    grammar_analysis = text_analysis.get('grammar', {})
                    recommendations.append(f"📝 Grammar: {grammar_score}/100")
                    errors = grammar_analysis.get('errors', [])
                    if errors:
                        for err in errors[:2]:
                            if isinstance(err, dict):
                                recommendations.append(f"  X '{err.get('wrong')}' → ✓ '{err.get('correct')}'")

                    corrected = grammar_analysis.get('corrected_text', '')
                    if corrected:
                        recommendations.append(f"  ✓ Corrected: \"{corrected}\"")

                if vocabulary_score < 80:
                    vocab_analysis = text_analysis.get('vocabulary', {})
                    recommendations.append(f"📚 Vocabulary: {vocabulary_score}/100")
                    weak = vocab_analysis.get('weak_words', [])
                    if weak:
                        for w in weak[:1]:
                            if isinstance(w, dict):
                                recommendations.append(f"  X '{w.get('word')}' → ✓ '{w.get('better')}'")

                if overall_score >= 85:
                    recommendations.append("✅ Excellent performance!")

            scores['overall'] = overall_score

            detailed_analysis = {
                'relevance_analysis': text_analysis.get('relevance_to_question', {}),
                'opinion_analysis': text_analysis.get('opinion_clarity', {}),
                'reasoning_analysis': text_analysis.get('reasoning_quality', {}),
                'pronunciation_details': pronunciation,
                'grammar_analysis': text_analysis.get('grammar', {}),
                'vocabulary_analysis': text_analysis.get('vocabulary', {}),
                'fluency_analysis': text_analysis.get('fluency', {}),
                'coherence_analysis': text_analysis.get('coherence', {})
            }

            return {
                'transcription': transcription,
                'duration': duration,
                'scores': scores,
                'detailed_analysis': detailed_analysis,
                'recommendations': recommendations[:12],
                'overall_score': overall_score
            }

    async def _analyze_express_opinion_flexible(self, text: str, duration: float,
                                                question_context: Optional[str] = None) -> Dict:
        """Flexible analysis for Part 5"""

        if not self.gemini_text_model:
            return self._fallback_opinion_analysis(text, duration)

        word_count = len(text.split())
        wpm = (word_count / duration) * 60 if duration > 0 else 0

        basic_errors = self.grammar_checker.check_basic_errors(text)

        lt_context = ""
        if basic_errors:
            error_list = [f"'{e['wrong']}' → '{e['correct']}'" for e in basic_errors[:8]]
            lt_context = f"""
BASIC ERRORS:
{json.dumps(error_list, indent=2)}

Focus on: Opinion clarity, reasoning, and advanced errors.
"""

        context_instruction = ""
        if question_context and question_context.strip():
            context_instruction = f"""
QUESTION: {question_context}

Check if student:
1. Answered THIS question
2. Stated clear opinion
3. Provided reasons/examples
"""
        else:
            context_instruction = "Question 11: Express clear opinion with reasons."

        prompt = f"""You are a TOEIC Speaking expert for Question 11.

{context_instruction}

STUDENT ANSWER: "{text}"
DURATION: {duration}s, {word_count} words, {wpm:.1f} WPM

{lt_context}

Return ONLY JSON:
{{
    "relevance_to_question": {{
        "score": 75,
        "assessment": "answers question|off-topic",
        "issues": "specific issue or none",
        "suggestion": "Should address X"
    }},

    "opinion_clarity": {{
        "score": 80,
        "opinion_stated": "yes - prefers studying alone",
        "clarity": "clear|unclear",
        "suggestion": "Say 'I strongly believe' instead of 'I think'"
    }},

    "reasoning_quality": {{
        "score": 70,
        "reasons_provided": ["can concentrate better"],
        "examples_given": 1,
        "missing": "Add specific example",
        "suggestion": "Example: 'Last semester when I studied alone...'"
    }},

    "grammar": {{
        "score": 75,
        "errors": [{{"wrong": "can focusing", "correct": "can focus", "rule": "modal + base"}}],
        "corrected_text": "I prefer to study alone because I can focus better"
    }},

    "vocabulary": {{
        "score": 78,
        "good_words": ["concentrate"],
        "weak_words": [{{"word": "thing", "better": "subject", "example": "studying thing → math"}}],
        "overused": [{{"word": "very", "count": 3, "alternatives": ["extremely", "really"]}}]
    }},

    "fluency": {{
        "score": 80,
        "hesitations": [{{"word": "um", "count": 3, "fix": "Pause silently"}}],
        "improvement": "Plan structure: Opinion → Reason → Example"
    }},

    "coherence": {{
        "score": 75,
        "transitions_used": ["because", "also"],
        "missing_transitions": ["for example"],
        "suggestion": "Add 'For example' before instances"
    }}
}}

CRITICAL:
- Find ALL error types (grammar, vocab, structure, flow)
- Do NOT limit to predefined categories
- Be specific with corrections
- Analyze ACTUAL text

Return ONLY JSON."""

        try:
            response = self.gemini_text_model.generate_content(prompt)
            response_text = response.text.strip()

            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()

            analysis = json.loads(response_text)

            if isinstance(analysis, list):
                analysis = analysis[0] if analysis else {}

            if basic_errors:
                gemini_errors = analysis.get('grammar', {}).get('errors', [])
                merged = self._merge_errors(basic_errors, gemini_errors)
                analysis['grammar']['errors'] = merged

            return analysis

        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return self._fallback_opinion_analysis(text, duration)

    def _fallback_opinion_analysis(self, text: str, duration: float) -> Dict:
        """Fallback for Part 5"""
        return {
            'relevance_to_question': {'score': 70, 'assessment': 'AI unavailable',
                                      'issues': 'N/A', 'suggestion': ''},
            'opinion_clarity': {'score': 70, 'opinion_stated': 'unknown',
                                'clarity': 'unknown', 'suggestion': ''},
            'reasoning_quality': {'score': 65, 'reasons_provided': [], 'examples_given': 0,
                                  'missing': '', 'suggestion': ''},
            'grammar': {'score': 75, 'errors': [], 'corrected_text': ''},
            'vocabulary': {'score': 75, 'good_words': [], 'weak_words': [], 'overused': []},
            'fluency': {'score': 75, 'hesitations': [], 'improvement': ''},
            'coherence': {'score': 70, 'transitions_used': [], 'missing_transitions': [],
                          'suggestion': ''}
        }

    # ============================================
    # RECOMMENDATIONS GENERATOR
    # ============================================

    def _generate_recommendations(self, scores: Dict, detailed_analysis: Dict) -> List[str]:
        """Generate comprehensive recommendations"""

        recommendations = []
        overall = scores.get('overall', 0)

        if overall >= 90:
            recommendations.append("🌟 EXCELLENT PERFORMANCE!")
        elif overall >= 80:
            recommendations.append("✅ GOOD JOB! Minor improvements needed.")
        elif overall >= 70:
            recommendations.append("👍 FAIR PERFORMANCE. Focus on key areas below.")
        elif overall >= 60:
            recommendations.append("⚠️ NEEDS IMPROVEMENT. Practice areas below.")
        else:
            recommendations.append("❌ SIGNIFICANT WORK NEEDED. Focus on fundamentals.")

        recommendations.append("")

        # Grammar
        grammar_analysis = detailed_analysis.get('grammar_analysis', {})
        grammar_score = scores.get('grammar', 0)

        if grammar_score < 85:
            recommendations.append(f"📝 GRAMMAR ({grammar_score}/100):")
            errors = grammar_analysis.get('errors', [])

            if errors:
                recommendations.append("   Errors found:")
                for i, err in enumerate(errors[:5], 1):
                    if isinstance(err, dict):
                        wrong = err.get('wrong', '')
                        correct = err.get('correct', '')
                        rule = err.get('rule', '')
                        source = err.get('source', 'AI')

                        recommendations.append(f"   {i}. [{source}] ❌ \"{wrong}\"")
                        recommendations.append(f"      ✅ \"{correct}\"")
                        if rule:
                            recommendations.append(f"      📖 {rule}")
                        recommendations.append("")

                if len(errors) > 5:
                    recommendations.append(f"   ... and {len(errors) - 5} more errors")
                    recommendations.append("")

        # Vocabulary
        vocab_analysis = detailed_analysis.get('vocabulary_analysis', {})
        vocab_score = scores.get('vocabulary', 0)

        if vocab_score < 85:
            recommendations.append(f"📚 VOCABULARY ({vocab_score}/100):")

            weak = vocab_analysis.get('weak_words', [])
            if weak:
                recommendations.append("   Improve these words:")
                for w in weak[:3]:
                    if isinstance(w, dict):
                        recommendations.append(f"   • \"{w.get('word')}\" → \"{w.get('better')}\"")
                        example = w.get('example', '')
                        if example:
                            recommendations.append(f"     Example: {example}")
                recommendations.append("")

        # Final encouragement
        if overall >= 70:
            recommendations.append("💪 Keep practicing! You're making progress.")
        else:
            recommendations.append("💪 Focus on fundamentals. Practice daily!")

        return recommendations[:15]


# Initialize service
try:
    assessment_service = TOEICSpeakingAssessmentUltimate()
    logger.info("✅ ULTIMATE v6.0.0 ready")
except Exception as e:
    logger.error(f"Initialization failed: {e}")
    raise


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {
        "message": "TOEIC Assessment ULTIMATE v6.0.0",
        "version": "6.0.0",
        "features": {
            "part1": "100% v4.5.0 proven code",
            "part2_5": "v4.5.0 logic + LanguageTool safety",
            "ai": "Flexible - detects ALL error types",
            "prompts": "Open-ended, no hardcoded categories"
        },
        "grammar_mode": "Hybrid: LanguageTool (safety) + Gemini (comprehensive)"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "gemini": assessment_service.gemini_text_model is not None,
            "azure_speech": True,
            "languagetool": assessment_service.grammar_checker.available
        }
    }


@app.post("/assess")
async def assess_speaking(
        file: UploadFile = File(...),
        question_type: str = Form(...),
        question_number: int = Form(...),
        reference_text: Optional[str] = Form(None),
        picture: Optional[UploadFile] = File(None),
        expected_content: Optional[str] = Form(None),
        question_context: Optional[str] = Form(None)
):
    """
    Main assessment endpoint

    Parameters:
    - file: Audio file (required)
    - question_type: Type of question (required)
    - question_number: Question number (required)
    - reference_text: For read_aloud
    - picture: For describe_picture
    - expected_content: For describe_picture
    - question_context: For other question types
    """

    logger.info(f"📩 Received assessment request: {question_type}")

    # Validate question type
    try:
        q_type = QuestionType(question_type)
    except ValueError:
        raise HTTPException(400, f"Invalid question_type: {question_type}")

    # Create temp directory
    temp_dir = tempfile.mkdtemp()
    audio_path = None
    image_path = None

    try:
        # Save audio file
        audio_path = os.path.join(temp_dir, f"audio_{datetime.now().timestamp()}.wav")
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"✅ Audio saved: {audio_path}")

        # Route to appropriate assessment function
        if q_type == QuestionType.READ_ALOUD:
            if not reference_text:
                raise HTTPException(400, "reference_text is required for read_aloud")
            result = await assessment_service.assess_read_aloud(audio_path, reference_text)

        elif q_type == QuestionType.DESCRIBE_PICTURE:
            # Save picture if provided
            if picture:
                image_path = os.path.join(temp_dir, f"image_{datetime.now().timestamp()}.jpg")
                with open(image_path, "wb") as buffer:
                    shutil.copyfileobj(picture.file, buffer)
                logger.info(f"✅ Image saved: {image_path}")

            result = await assessment_service.assess_describe_picture(
                audio_path, image_path, expected_content
            )

        elif q_type == QuestionType.RESPOND_QUESTIONS:
            result = await assessment_service.assess_respond_questions(
                audio_path, question_context
            )

        elif q_type == QuestionType.RESPOND_WITH_INFO:
            if not question_context:
                raise HTTPException(400, "question_context is required for respond_with_info")
            result = await assessment_service.assess_respond_with_info(
                audio_path, question_context
            )

        elif q_type == QuestionType.EXPRESS_OPINION:
            result = await assessment_service.assess_express_opinion(
                audio_path, question_context
            )

        else:
            raise HTTPException(400, f"Unsupported question type: {question_type}")

        logger.info(f"✅ Assessment complete: {result.get('overall_score', 0)}/100")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Assessment failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(500, f"Assessment failed: {str(e)}")

    finally:
        # Cleanup temp files
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            logger.info("🧹 Temp files cleaned")
        except Exception as e:
            logger.warning(f"Cleanup warning: {e}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)