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
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function ensureAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Admin access only.',
            ], 403);
        }

        return null;
    }

    public function dashboard(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $totalStudents = User::where('role', 'student')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalCourses = Course::count();
        $totalMaterials = Material::count();
        $totalQuizzes = Quiz::count();
        $totalAttempts = QuizAttempt::count();
        $totalFlashcards = Flashcard::count();
        $totalDeadlines = Deadline::count();
        $totalStudyPlans = StudyPlan::count();

        $averageScore = QuizAttempt::count() > 0
            ? round(QuizAttempt::avg('percentage'), 2)
            : 0;

        $recentStudents = User::where('role', 'student')
            ->latest()
            ->limit(5)
            ->get();

        $recentMaterials = Material::with(['user', 'course'])
            ->latest()
            ->limit(5)
            ->get();

        $recentQuizzes = Quiz::with(['user', 'material'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_students' => $totalStudents,
                'total_admins' => $totalAdmins,
                'total_courses' => $totalCourses,
                'total_materials' => $totalMaterials,
                'total_quizzes' => $totalQuizzes,
                'total_attempts' => $totalAttempts,
                'total_flashcards' => $totalFlashcards,
                'total_deadlines' => $totalDeadlines,
                'total_study_plans' => $totalStudyPlans,
                'average_score' => $averageScore,
            ],
            'recent_students' => $recentStudents,
            'recent_materials' => $recentMaterials,
            'recent_quizzes' => $recentQuizzes,
        ]);
    }

    public function students(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $students = User::withCount([
                'courses',
                'materials',
                'quizzes',
                'flashcards',
                'deadlines',
                'studyPlans',
            ])
            ->where('role', 'student')
            ->latest()
            ->get();

        return response()->json([
            'students' => $students,
        ]);
    }

    public function courses(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $courses = Course::with(['user'])
            ->withCount(['materials', 'deadlines', 'studyPlans'])
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function materials(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $materials = Material::with(['user', 'course'])
            ->latest()
            ->get();

        return response()->json([
            'materials' => $materials,
        ]);
    }

    public function quizzes(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $quizzes = Quiz::with(['user', 'material.course', 'questions'])
            ->withCount(['questions', 'attempts'])
            ->latest()
            ->get();

        return response()->json([
            'quizzes' => $quizzes,
        ]);
    }

    public function deadlines(Request $request)
    {
        $adminCheck = $this->ensureAdmin($request);

        if ($adminCheck) {
            return $adminCheck;
        }

        $deadlines = Deadline::with(['user', 'course'])
            ->orderBy('is_completed')
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'deadlines' => $deadlines,
        ]);
    }
}