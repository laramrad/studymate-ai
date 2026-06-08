<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\AiAssistantController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\FlashcardController;
use App\Http\Controllers\Api\DeadlineController;
use App\Http\Controllers\Api\StudyPlanController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AdminController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'StudyMate AI API is working.',
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/subscription/plan', [AuthController::class, 'updatePlan']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::apiResource('courses', CourseController::class);

    Route::apiResource('materials', MaterialController::class)->only([
        'index',
        'store',
        'show',
        'destroy',
    ]);

    Route::get('/materials/{material}/summary', [MaterialController::class, 'summary']);

    Route::get('/materials/{material}/ai-chats', [AiAssistantController::class, 'history']);
    Route::post('/materials/{material}/ask-ai', [AiAssistantController::class, 'ask']);

    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/materials/{material}/generate-quiz', [QuizController::class, 'generate']);
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);

    Route::get('/flashcards', [FlashcardController::class, 'index']);
    Route::post('/materials/{material}/generate-flashcards', [FlashcardController::class, 'generate']);
    Route::delete('/flashcards/{flashcard}', [FlashcardController::class, 'destroy']);
    Route::delete('/materials/{material}/flashcards', [FlashcardController::class, 'destroyByMaterial']);

    Route::get('/deadlines', [DeadlineController::class, 'index']);
    Route::post('/deadlines', [DeadlineController::class, 'store']);
    Route::put('/deadlines/{deadline}', [DeadlineController::class, 'update']);
    Route::patch('/deadlines/{deadline}/toggle', [DeadlineController::class, 'toggle']);
    Route::delete('/deadlines/{deadline}', [DeadlineController::class, 'destroy']);

    Route::get('/study-plans', [StudyPlanController::class, 'index']);
    Route::post('/study-plans', [StudyPlanController::class, 'store']);
    Route::get('/study-plans/{studyPlan}', [StudyPlanController::class, 'show']);
    Route::patch('/study-plan-tasks/{task}/toggle', [StudyPlanController::class, 'toggleTask']);
    Route::delete('/study-plans/{studyPlan}', [StudyPlanController::class, 'destroy']);

    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/students', [AdminController::class, 'students']);
    Route::get('/admin/courses', [AdminController::class, 'courses']);
    Route::get('/admin/materials', [AdminController::class, 'materials']);
    Route::get('/admin/quizzes', [AdminController::class, 'quizzes']);
    Route::get('/admin/deadlines', [AdminController::class, 'deadlines']);
});