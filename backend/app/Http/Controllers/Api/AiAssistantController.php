<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiChat;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiAssistantController extends Controller
{
    public function history(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $chats = AiChat::where('user_id', $request->user()->id)
            ->where('material_id', $material->id)
            ->oldest()
            ->get();

        return response()->json([
            'material' => $material->load('course'),
            'chats' => $chats,
        ]);
    }

    public function ask(Request $request, Material $material)
    {
        if ($material->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'question' => ['required', 'string', 'max:2000'],
        ]);

        $question = $validated['question'];

        $answer = $this->generateAnswer($material, $question);

        $chat = AiChat::create([
            'user_id' => $request->user()->id,
            'material_id' => $material->id,
            'question' => $question,
            'answer' => $answer,
        ]);

        return response()->json([
            'message' => 'AI answer generated successfully.',
            'chat' => $chat,
        ]);
    }

    private function generateAnswer(Material $material, string $question): string
    {
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'gpt-4.1-mini');

        if (! $apiKey) {
            return $this->fallbackAnswer($material, $question);
        }

        $materialText = $material->extracted_text ?: 'No extracted text available.';

        $materialText = mb_substr($materialText, 0, 12000);

        $prompt = "
You are StudyMate AI, an academic study assistant.

Answer the student's question using ONLY the provided course material.
If the answer is not available in the material, say:
'I could not find this information in the uploaded material.'

Be clear, helpful, and easy to understand.

Material title:
{$material->title}

Course material:
{$materialText}

Student question:
{$question}
";

        try {
            $response = Http::withToken($apiKey)
                ->timeout(60)
                ->post('https://api.openai.com/v1/responses', [
                    'model' => $model,
                    'input' => $prompt,
                ]);

            if ($response->failed()) {
                return 'AI request failed. Please check your OpenAI API key and try again.';
            }

            $data = $response->json();

            if (isset($data['output_text'])) {
                return $data['output_text'];
            }

            if (isset($data['output'][0]['content'][0]['text'])) {
                return $data['output'][0]['content'][0]['text'];
            }

            return 'AI response received, but the answer format was not recognized.';
        } catch (\Throwable $e) {
            return 'AI connection failed. Please check your internet connection or API key.';
        }
    }

    private function fallbackAnswer(Material $material, string $question): string
    {
        $text = $material->extracted_text ?: '';

        if (! $text) {
            return 'No extracted text is available for this material yet.';
        }

        $shortText = mb_substr($text, 0, 800);

        return "Demo AI response: I found material content related to your uploaded file. Here is a short preview I can use:\n\n"
            . $shortText
            . "\n\nTo enable real AI answers, add your OpenAI API key in the backend .env file.";
    }
}