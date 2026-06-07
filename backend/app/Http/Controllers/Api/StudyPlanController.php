<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\StudyPlan;
use App\Models\StudyPlanTask;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StudyPlanController extends Controller
{
    public function index(Request $request)
    {
        $studyPlans = StudyPlan::with(['course', 'tasks'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'study_plans' => $studyPlans,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => ['nullable', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'exam_date' => ['required', 'date', 'after_or_equal:today'],
            'hours_per_day' => ['required', 'integer', 'min:1', 'max:12'],
            'difficulty' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        if (! empty($validated['course_id'])) {
            $course = Course::where('id', $validated['course_id'])
                ->where('user_id', $request->user()->id)
                ->first();

            if (! $course) {
                return response()->json([
                    'message' => 'Course not found or unauthorized.',
                ], 403);
            }
        }

        $studyPlan = StudyPlan::create([
            'user_id' => $request->user()->id,
            'course_id' => $validated['course_id'] ?? null,
            'title' => $validated['title'],
            'exam_date' => $validated['exam_date'],
            'hours_per_day' => $validated['hours_per_day'],
            'difficulty' => $validated['difficulty'],
            'description' => $validated['description'] ?? null,
        ]);

        $tasks = $this->generateTasks($studyPlan);

        foreach ($tasks as $task) {
            StudyPlanTask::create([
                'study_plan_id' => $studyPlan->id,
                'task_date' => $task['task_date'],
                'title' => $task['title'],
                'description' => $task['description'],
                'estimated_hours' => $task['estimated_hours'],
                'is_completed' => false,
            ]);
        }

        $studyPlan->load(['course', 'tasks']);

        return response()->json([
            'message' => 'Study plan generated successfully.',
            'study_plan' => $studyPlan,
        ], 201);
    }

    public function show(Request $request, StudyPlan $studyPlan)
    {
        if ($studyPlan->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $studyPlan->load(['course', 'tasks' => function ($query) {
            $query->orderBy('task_date');
        }]);

        return response()->json([
            'study_plan' => $studyPlan,
        ]);
    }

    public function toggleTask(Request $request, StudyPlanTask $task)
    {
        $task->load('studyPlan');

        if ($task->studyPlan->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $task->update([
            'is_completed' => ! $task->is_completed,
        ]);

        return response()->json([
            'message' => 'Task status updated successfully.',
            'task' => $task,
        ]);
    }

    public function destroy(Request $request, StudyPlan $studyPlan)
    {
        if ($studyPlan->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $studyPlan->delete();

        return response()->json([
            'message' => 'Study plan deleted successfully.',
        ]);
    }

    private function generateTasks(StudyPlan $studyPlan): array
    {
        $today = Carbon::today();
        $examDate = Carbon::parse($studyPlan->exam_date);

        $availableDays = max(1, $today->diffInDays($examDate));

        $maxTasks = min($availableDays, 10);

        if ($maxTasks < 3) {
            $maxTasks = $availableDays;
        }

        $difficultyMultiplier = match ($studyPlan->difficulty) {
            'Easy' => 1,
            'Medium' => 1.2,
            'Hard' => 1.5,
            default => 1.2,
        };

        $estimatedHours = max(1, min(6, (int) round($studyPlan->hours_per_day * $difficultyMultiplier)));

        $taskTemplates = [
            [
                'title' => 'Review course overview and main topics',
                'description' => 'Read the main notes and identify the most important chapters or sections.',
            ],
            [
                'title' => 'Summarize key concepts',
                'description' => 'Create short summaries for the important definitions, formulas, theories, or rules.',
            ],
            [
                'title' => 'Practice with quiz questions',
                'description' => 'Solve generated quizzes and write down the questions you answered incorrectly.',
            ],
            [
                'title' => 'Focus on weak topics',
                'description' => 'Review the topics that were difficult or unclear during quiz practice.',
            ],
            [
                'title' => 'Create and review flashcards',
                'description' => 'Use flashcards to memorize definitions, key terms, and important points.',
            ],
            [
                'title' => 'Solve practice problems',
                'description' => 'Apply the concepts using exercises, previous assignments, or sample questions.',
            ],
            [
                'title' => 'Final revision',
                'description' => 'Review summaries, flashcards, and previous mistakes before the exam.',
            ],
            [
                'title' => 'Mock exam session',
                'description' => 'Simulate exam conditions by solving questions without checking notes.',
            ],
            [
                'title' => 'Review mistakes and unclear points',
                'description' => 'Go back to wrong answers and unclear topics, then revise them carefully.',
            ],
            [
                'title' => 'Light revision and confidence check',
                'description' => 'Do a final light review and make sure you understand the core concepts.',
            ],
        ];

        $tasks = [];

        for ($i = 0; $i < $maxTasks; $i++) {
            $taskDate = $today->copy()->addDays($i);

            if ($taskDate->greaterThanOrEqualTo($examDate)) {
                $taskDate = $examDate->copy()->subDay();
            }

            if ($taskDate->lessThan($today)) {
                $taskDate = $today->copy();
            }

            $template = $taskTemplates[$i % count($taskTemplates)];

            $tasks[] = [
                'task_date' => $taskDate->toDateString(),
                'title' => $template['title'],
                'description' => $template['description'],
                'estimated_hours' => $estimatedHours,
            ];
        }

        return $tasks;
    }
}