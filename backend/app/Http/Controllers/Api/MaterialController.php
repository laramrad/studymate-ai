<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use ZipArchive;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $materials = Material::with('course')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'materials' => $materials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => ['required', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'file' => ['required', 'file', 'mimes:pdf,txt,doc,docx', 'max:10240'],
        ]);

        $course = Course::where('id', $validated['course_id'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $course) {
            return response()->json([
                'message' => 'Course not found or unauthorized.',
            ], 403);
        }

        $file = $request->file('file');

        $path = $file->store('materials', 'public');

        $extractedText = $this->extractTextFromFile($file);

        $material = Material::create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
            'title' => $validated['title'],
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => strtolower($file->getClientOriginalExtension()),
            'file_size' => $file->getSize(),
            'extracted_text' => $extractedText,
        ]);

        $material->load('course');

        return response()->json([
            'message' => 'Material uploaded successfully.',
            'material' => $material,
        ], 201);
    }

    public function show(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $material->load('course');

        return response()->json([
            'material' => $material,
            'file_url' => asset('storage/' . $material->file_path),
        ]);
    }

    public function summary(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $text = $material->extracted_text ?: '';
        $cleanText = $this->cleanText($text);

        $wordCount = $this->countWords($cleanText);
        $readingTime = max(1, (int) ceil($wordCount / 200));

        $sentences = $this->extractUsefulSentences($cleanText);
        $keywords = $this->extractKeywords($cleanText);

        $summarySentences = array_slice($sentences, 0, 4);

        if (count($summarySentences) === 0) {
            $summarySentences = [
                'No readable academic text was found for this material. Try uploading a clearer PDF, TXT, or DOCX file.',
            ];
        }

        $studyTips = $this->generateStudyTips($wordCount, count($keywords));

        return response()->json([
            'summary' => implode(' ', $summarySentences),
            'key_terms' => array_slice($keywords, 0, 12),
            'word_count' => $wordCount,
            'reading_time_minutes' => $readingTime,
            'study_tips' => $studyTips,
        ]);
    }

    public function destroy(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($material->file_path && Storage::disk('public')->exists($material->file_path)) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json([
            'message' => 'Material deleted successfully.',
        ]);
    }

    private function extractTextFromFile($file): ?string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        try {
            if ($extension === 'txt') {
                return $this->cleanText(file_get_contents($file->getRealPath()));
            }

            if ($extension === 'pdf') {
                return $this->extractTextFromPdf($file->getRealPath());
            }

            if ($extension === 'docx') {
                return $this->extractTextFromDocx($file->getRealPath());
            }

            if ($extension === 'doc') {
                return 'DOC file uploaded successfully. For best text extraction, please upload DOCX, PDF, or TXT files.';
            }

            return null;
        } catch (\Throwable $e) {
            return 'File uploaded successfully, but text extraction failed. Please try uploading a clearer PDF, TXT, or DOCX file.';
        }
    }

    private function extractTextFromPdf(string $filePath): string
    {
        $parser = new Parser();
        $pdf = $parser->parseFile($filePath);

        $text = $pdf->getText();

        $text = $this->cleanText($text);

        if (! $text) {
            return 'PDF uploaded successfully, but no readable text was found. This may be a scanned/image-based PDF.';
        }

        return $text;
    }

    private function extractTextFromDocx(string $filePath): string
    {
        $zip = new ZipArchive();

        if ($zip->open($filePath) !== true) {
            return 'DOCX uploaded successfully, but the file could not be opened for text extraction.';
        }

        $xml = $zip->getFromName('word/document.xml');
        $zip->close();

        if (! $xml) {
            return 'DOCX uploaded successfully, but no readable document text was found.';
        }

        $xml = str_replace(['</w:p>', '</w:tr>'], "\n", $xml);
        $text = strip_tags($xml);

        $text = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');

        $text = $this->cleanText($text);

        if (! $text) {
            return 'DOCX uploaded successfully, but no readable text was found.';
        }

        return $text;
    }

    private function cleanText(?string $text): string
    {
        if (! $text) {
            return '';
        }

        $text = strip_tags($text);
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n\s*\n\s*\n+/', "\n\n", $text);
        $text = trim($text);

        return $text;
    }

    private function countWords(string $text): int
    {
        if (! $text) {
            return 0;
        }

        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        return count($words);
    }

    private function extractUsefulSentences(string $text): array
    {
        $sentences = preg_split('/(?<=[.!?])\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $usefulSentences = array_filter($sentences, function ($sentence) {
            $sentence = trim($sentence);
            $lowerSentence = strtolower($sentence);

            return strlen($sentence) >= 50
                && strlen($sentence) <= 300
                && ! str_contains($lowerSentence, 'uploaded successfully')
                && ! str_contains($lowerSentence, 'text extraction')
                && ! str_contains($lowerSentence, 'no readable text');
        });

        $usefulSentences = array_map(function ($sentence) {
            return trim($sentence);
        }, $usefulSentences);

        return array_values(array_unique($usefulSentences));
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
            'study', 'studying', 'learning', 'learn', 'important', 'different', 'example',
            'examples', 'because', 'therefore', 'however', 'between', 'before', 'after',
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

        return array_slice($keywords, 0, 20);
    }

    private function generateStudyTips(int $wordCount, int $keywordCount): array
    {
        $tips = [];

        if ($wordCount <= 300) {
            $tips[] = 'This is a short material. Read it fully, then create flashcards for the main terms.';
        } elseif ($wordCount <= 1200) {
            $tips[] = 'This is a medium-length material. Review the summary first, then test yourself using a quiz.';
        } else {
            $tips[] = 'This is a long material. Divide it into smaller sections and review it over multiple study sessions.';
        }

        if ($keywordCount >= 8) {
            $tips[] = 'Focus on the key terms because they are likely to represent the main concepts in this file.';
        } else {
            $tips[] = 'The file has few detected key terms. Check the extracted text to make sure the file is readable.';
        }

        $tips[] = 'Use the Ask AI button to ask specific questions about unclear parts of the material.';
        $tips[] = 'Generate a quiz after reading to check your understanding.';

        return $tips;
    }
}