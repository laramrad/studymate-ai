<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\Material;
use Illuminate\Http\Request;

class FlashcardController extends Controller
{
    public function index(Request $request)
    {
        $flashcards = Flashcard::with('material.course')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'flashcards' => $flashcards,
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
            'card_count' => ['nullable', 'integer', 'in:6,10,15'],
        ]);

        $cardCount = $validated['card_count'] ?? 6;

        $generatedCards = $this->generateFlashcardsFromMaterial($material, $cardCount);

        $createdCards = [];

        foreach ($generatedCards as $card) {
            $createdCards[] = Flashcard::create([
                'user_id' => $request->user()->id,
                'material_id' => $material->id,
                'front' => $card['front'],
                'back' => $card['back'],
            ]);
        }

        return response()->json([
            'message' => 'Flashcards generated successfully.',
            'flashcards' => $createdCards,
        ], 201);
    }

    public function destroy(Request $request, Flashcard $flashcard)
    {
        if ($flashcard->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $flashcard->delete();

        return response()->json([
            'message' => 'Flashcard deleted successfully.',
        ]);
    }

    public function destroyByMaterial(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        Flashcard::where('user_id', $request->user()->id)
            ->where('material_id', $material->id)
            ->delete();

        return response()->json([
            'message' => 'Material flashcards deleted successfully.',
        ]);
    }

    private function generateFlashcardsFromMaterial(Material $material, int $cardCount = 6): array
    {
        $text = $material->extracted_text ?: '';
        $text = strip_tags($text);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $usefulSentences = array_values(array_filter($sentences, function ($sentence) {
            return strlen($sentence) >= 50
                && strlen($sentence) <= 260
                && ! str_contains(strtolower($sentence), 'uploaded successfully')
                && ! str_contains(strtolower($sentence), 'text extraction');
        }));

        $keywords = $this->extractKeywords($text);

        if (count($usefulSentences) < 5) {
            $usefulSentences = [
                'StudyMate AI helps students study uploaded course materials using summaries, quizzes, flashcards, and study planning.',
                'A database is an organized collection of information that can be accessed, managed, and updated efficiently.',
                'Normalization is a database design method used to reduce duplicate data and improve data consistency.',
                'A primary key uniquely identifies each record inside a database table.',
                'A foreign key is used to create a relationship between two database tables.',
                'A study plan helps students divide their learning work into smaller tasks before the exam.',
                'Flashcards help students memorize key terms through repeated review.',
                'Quizzes help students check their understanding and identify weak topics.',
            ];
        }

        if (count($keywords) < 5) {
            $keywords = [
                'StudyMate AI',
                'Database',
                'Normalization',
                'Primary Key',
                'Foreign Key',
                'Study Plan',
                'Flashcards',
                'Quiz',
            ];
        }

        $cards = [];

        for ($i = 0; $i < $cardCount; $i++) {
            $keyword = $keywords[$i % count($keywords)];
            $sentence = $usefulSentences[$i % count($usefulSentences)];

            $frontTemplates = [
                'What should you remember about ' . $keyword . '?',
                'Explain the concept of ' . $keyword . '.',
                'Why is ' . $keyword . ' important in this material?',
                'What is the main idea related to ' . $keyword . '?',
            ];

            $cards[] = [
                'front' => $frontTemplates[$i % count($frontTemplates)],
                'back' => $this->shorten($sentence, 280),
            ];
        }

        return $cards;
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
            'course', 'chapter', 'section', 'page', 'file', 'text'
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
}