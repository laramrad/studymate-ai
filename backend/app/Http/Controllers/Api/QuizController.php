<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::with(['material.course', 'questions', 'attempts' => function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)->latest();
            }])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'quizzes' => $quizzes,
        ]);
    }

    public function generate(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'question_count' => ['nullable', 'integer', 'in:5,10,15'],
        ]);

        $questionCount = $validated['question_count'] ?? 5;

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'material_id' => $material->id,
            'title' => $validated['title'] ?? 'Quiz - ' . $material->title,
            'description' => 'Generated from uploaded material: ' . $material->title,
        ]);

        $questions = $this->generateQuestionsFromMaterial($material, $questionCount);

        foreach ($questions as $questionData) {
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question' => $questionData['question'],
                'options' => $questionData['options'],
                'correct_answer' => $questionData['correct_answer'],
                'explanation' => $questionData['explanation'],
            ]);
        }

        $quiz->load(['material.course', 'questions']);

        return response()->json([
            'message' => 'Quiz generated successfully.',
            'quiz' => $quiz,
        ], 201);
    }

    public function show(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $quiz->load(['material.course', 'questions', 'attempts' => function ($query) use ($request) {
            $query->where('user_id', $request->user()->id)->latest();
        }]);

        return response()->json([
            'quiz' => $quiz,
        ]);
    }

    public function submit(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $quiz->load('questions');

        $score = 0;
        $checkedAnswers = [];

        foreach ($quiz->questions as $question) {
            $studentAnswer = $validated['answers'][$question->id] ?? null;
            $isCorrect = $studentAnswer === $question->correct_answer;

            if ($isCorrect) {
                $score++;
            }

            $checkedAnswers[$question->id] = [
                'student_answer' => $studentAnswer,
                'correct_answer' => $question->correct_answer,
                'is_correct' => $isCorrect,
            ];
        }

        $totalQuestions = $quiz->questions->count();
        $percentage = $totalQuestions > 0 ? round(($score / $totalQuestions) * 100, 2) : 0;

        $attempt = QuizAttempt::create([
            'user_id' => $request->user()->id,
            'quiz_id' => $quiz->id,
            'answers' => $checkedAnswers,
            'score' => $score,
            'total_questions' => $totalQuestions,
            'percentage' => $percentage,
        ]);

        return response()->json([
            'message' => 'Quiz submitted successfully.',
            'attempt' => $attempt,
        ]);
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        if ($quiz->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $quiz->delete();

        return response()->json([
            'message' => 'Quiz deleted successfully.',
        ]);
    }

    private function generateQuestionsFromMaterial(Material $material, int $questionCount = 5): array
    {
        $text = $material->extracted_text ?: '';
        $cleanText = $this->cleanMaterialText($text);

        $sentences = $this->extractUsefulSentences($cleanText);
        $keywords = $this->extractKeywords($cleanText);

        if (count($sentences) < 8) {
            $sentences = array_merge($sentences, $this->fallbackSentences());
        }

        if (count($keywords) < 5) {
            $keywords = array_merge($keywords, $this->fallbackKeywords());
        }

        $sentences = array_values(array_unique($sentences));
        $keywords = array_values(array_unique($keywords));

        $questions = [];

        for ($i = 0; $i < $questionCount; $i++) {
            $sentence = $sentences[$i % count($sentences)];
            $keyword = $keywords[$i % count($keywords)];
            $otherSentences = $this->getOtherSentences($sentences, $sentence);

            $templateNumber = $i % 5;

            if ($templateNumber === 0) {
                $questions[] = $this->createQuestion(
                    'Which statement is directly supported by the uploaded material?',
                    $this->shorten($sentence, 170),
                    $this->buildSentenceDistractors($otherSentences, $sentence),
                    'The correct answer is a statement extracted from the uploaded material.',
                    $i
                );
            }

            if ($templateNumber === 1) {
                $questions[] = $this->createQuestion(
                    "Which option is most related to the concept '{$keyword}'?",
                    $this->shorten($sentence, 170),
                    [
                        "{$keyword} is described as a random design color only.",
                        "{$keyword} is unrelated to the uploaded academic content.",
                        "{$keyword} is only mentioned as a file name and not as a study concept.",
                    ],
                    "The selected answer is the option that best matches the uploaded material and the concept '{$keyword}'.",
                    $i
                );
            }

            if ($templateNumber === 2) {
                $questions[] = $this->createQuestion(
                    'What can the student understand from this part of the material?',
                    $this->shorten($sentence, 170),
                    $this->buildConceptDistractors($keywords, $keyword),
                    'The correct answer reflects an academic idea found in the material.',
                    $i
                );
            }

            if ($templateNumber === 3) {
                $questions[] = $this->createQuestion(
                    'Choose the most accurate summary statement.',
                    $this->shorten($sentence, 170),
                    [
                        'The material mainly discusses unrelated entertainment content.',
                        'The material says the topic should not be studied or reviewed.',
                        'The material contains no useful academic information for students.',
                    ],
                    'The correct option summarizes a real idea from the uploaded material.',
                    $i
                );
            }

            if ($templateNumber === 4) {
                $nextKeyword = $keywords[($i + 1) % count($keywords)];

                $questions[] = $this->createQuestion(
                    "Based on the uploaded material, which answer best connects '{$keyword}' with the lesson?",
                    $this->shorten($sentence, 170),
                    [
                        "{$keyword} and {$nextKeyword} are described as social media features.",
                        "{$keyword} is only used as a decoration and has no academic meaning.",
                        "{$keyword} is not connected to any idea in the uploaded material.",
                    ],
                    'The correct answer uses information found in the uploaded lesson.',
                    $i
                );
            }
        }

        return $questions;
    }

    private function createQuestion(
        string $questionText,
        string $correctOptionText,
        array $wrongOptions,
        string $explanation,
        int $index
    ): array {
        $letters = ['A', 'B', 'C', 'D'];
        $correctLetter = $letters[$index % 4];

        $wrongOptions = $this->normalizeWrongOptions($wrongOptions, $correctOptionText);

        $options = [];
        $wrongIndex = 0;

        foreach ($letters as $letter) {
            if ($letter === $correctLetter) {
                $options[$letter] = $correctOptionText;
            } else {
                $options[$letter] = $wrongOptions[$wrongIndex] ?? 'This option is not supported by the uploaded material.';
                $wrongIndex++;
            }
        }

        return [
            'question' => $questionText,
            'options' => $options,
            'correct_answer' => $correctLetter,
            'explanation' => $explanation,
        ];
    }

    private function normalizeWrongOptions(array $wrongOptions, string $correctOptionText): array
    {
        $defaultWrongOptions = [
            'This statement is not supported by the uploaded material.',
            'This option changes the meaning of the lesson content.',
            'This answer is too general and does not match the uploaded material.',
            'This option is unrelated to the academic topic in the file.',
        ];

        $wrongOptions = array_merge($wrongOptions, $defaultWrongOptions);

        $wrongOptions = array_map(function ($option) {
            return $this->shorten(trim($option), 170);
        }, $wrongOptions);

        $wrongOptions = array_filter($wrongOptions, function ($option) use ($correctOptionText) {
            return $option !== '' && strtolower($option) !== strtolower($correctOptionText);
        });

        $wrongOptions = array_values(array_unique($wrongOptions));

        return array_slice($wrongOptions, 0, 3);
    }

    private function buildSentenceDistractors(array $otherSentences, string $correctSentence): array
    {
        $distractors = [];

        foreach ($otherSentences as $sentence) {
            if (count($distractors) >= 2) {
                break;
            }

            $distractors[] = $this->shorten($sentence, 170);
        }

        $distractors[] = 'The uploaded material does not discuss this academic topic.';

        return $distractors;
    }

    private function buildConceptDistractors(array $keywords, string $currentKeyword): array
    {
        $otherKeywords = array_values(array_filter($keywords, function ($keyword) use ($currentKeyword) {
            return strtolower($keyword) !== strtolower($currentKeyword);
        }));

        $first = $otherKeywords[0] ?? 'Learning';
        $second = $otherKeywords[1] ?? 'Study';
        $third = $otherKeywords[2] ?? 'Topic';

        return [
            "{$first} is the only concept mentioned and no other topic is discussed.",
            "{$second} is described as unrelated to the lesson.",
            "{$third} is presented as a non-academic personal note.",
        ];
    }

    private function cleanMaterialText(string $text): string
    {
        $text = strip_tags($text);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        return $text;
    }

    private function extractUsefulSentences(string $text): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $usefulSentences = array_filter($sentences, function ($sentence) {
            $sentence = trim($sentence);
            $lowerSentence = strtolower($sentence);

            return strlen($sentence) >= 45
                && strlen($sentence) <= 280
                && ! str_contains($lowerSentence, 'uploaded successfully')
                && ! str_contains($lowerSentence, 'text extraction')
                && ! str_contains($lowerSentence, 'no readable text');
        });

        $usefulSentences = array_map(function ($sentence) {
            return trim($sentence);
        }, $usefulSentences);

        $usefulSentences = array_values(array_unique($usefulSentences));

        return array_slice($usefulSentences, 0, 25);
    }

    private function getOtherSentences(array $sentences, string $currentSentence): array
    {
        $otherSentences = array_filter($sentences, function ($sentence) use ($currentSentence) {
            return strtolower($sentence) !== strtolower($currentSentence);
        });

        return array_values($otherSentences);
    }

    private function extractKeywords(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-zA-Z0-9\s]/', ' ', $text);

        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $stopWords = [
            'the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were',
            'will', 'can', 'could', 'should', 'would', 'into', 'about', 'which', 'when',
            'where', 'what', 'have', 'has', 'had', 'been', 'being', 'their', 'there',
            'they', 'them', 'then', 'than', 'also', 'only', 'each', 'such', 'more',
            'most', 'some', 'any', 'not', 'but', 'you', 'your', 'our', 'his', 'her',
            'its', 'may', 'use', 'used', 'using', 'based', 'material', 'uploaded',
            'course', 'chapter', 'section', 'page', 'file', 'text', 'student', 'students',
            'study', 'studying', 'learning', 'learn', 'important', 'different'
        ];

        $counts = [];

        foreach ($words as $word) {
            if (strlen($word) < 4) {
                continue;
            }

            if (in_array($word, $stopWords, true)) {
                continue;
            }

            $counts[$word] = ($counts[$word] ?? 0) + 1;
        }

        arsort($counts);

        $keywords = array_keys($counts);

        $keywords = array_map(function ($word) {
            return ucwords($word);
        }, $keywords);

        return array_slice($keywords, 0, 15);
    }

    private function shorten(string $text, int $limit): string
    {
        $text = trim($text);

        if (mb_strlen($text) <= $limit) {
            return $text;
        }

        return mb_substr($text, 0, $limit - 3) . '...';
    }

    private function fallbackSentences(): array
    {
        return [
            'StudyMate AI helps students understand uploaded course materials by summarizing content and generating practice questions.',
            'A database is an organized collection of data that can be accessed, managed, and updated efficiently.',
            'Normalization is a database design technique used to reduce redundancy and improve data consistency.',
            'A primary key is a unique identifier for each record in a database table.',
            'A foreign key is a field that links one database table to another table.',
            'A study plan helps students divide their learning tasks across multiple days before an exam.',
            'Flashcards help students review important concepts and memorize definitions more effectively.',
            'Quizzes help students test their understanding and identify weak topics before exams.',
        ];
    }

    private function fallbackKeywords(): array
    {
        return [
            'Database',
            'Normalization',
            'Primary Key',
            'Foreign Key',
            'Study Plan',
            'Flashcards',
            'Quiz',
            'Material',
        ];
    }
}