<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Deadline;
use App\Models\Flashcard;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\StudyPlan;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $totalCourses = Course::where('user_id', $userId)->count();
        $totalMaterials = Material::where('user_id', $userId)->count();
        $totalQuizzes = Quiz::where('user_id', $userId)->count();
        $totalFlashcards = Flashcard::where('user_id', $userId)->count();

        $quizAttempts = QuizAttempt::where('user_id', $userId)->get();

        $averageScore = $quizAttempts->count() > 0
            ? round($quizAttempts->avg('percentage'), 2)
            : 0;

        $activeDeadlines = Deadline::where('user_id', $userId)
            ->where('is_completed', false)
            ->count();

        $completedDeadlines = Deadline::where('user_id', $userId)
            ->where('is_completed', true)
            ->count();

        $upcomingDeadlines = Deadline::with('course')
            ->where('user_id', $userId)
            ->where('is_completed', false)
            ->orderBy('due_date')
            ->limit(5)
            ->get();

        $recentMaterials = Material::with('course')
            ->where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        $studyPlans = StudyPlan::with('tasks')
            ->where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        $studyPlanStats = $studyPlans->map(function ($plan) {
            $totalTasks = $plan->tasks->count();
            $completedTasks = $plan->tasks->where('is_completed', true)->count();

            return [
                'id' => $plan->id,
                'title' => $plan->title,
                'exam_date' => $plan->exam_date,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'progress' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0,
            ];
        });

        return response()->json([
            'stats' => [
                'total_courses' => $totalCourses,
                'total_materials' => $totalMaterials,
                'total_quizzes' => $totalQuizzes,
                'total_flashcards' => $totalFlashcards,
                'average_score' => $averageScore,
                'active_deadlines' => $activeDeadlines,
                'completed_deadlines' => $completedDeadlines,
            ],
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_materials' => $recentMaterials,
            'study_plans' => $studyPlanStats,
        ]);
    }
}