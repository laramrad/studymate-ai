<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $courses = Course::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'courses' => $courses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'instructor' => ['nullable', 'string', 'max:255'],
            'semester' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $course = Course::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'instructor' => $validated['instructor'] ?? null,
            'semester' => $validated['semester'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course,
        ], 201);
    }

    public function show(Request $request, Course $course)
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'course' => $course,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:100'],
            'instructor' => ['nullable', 'string', 'max:255'],
            'semester' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $course->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'instructor' => $validated['instructor'] ?? null,
            'semester' => $validated['semester'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => $course,
        ]);
    }

    public function destroy(Request $request, Course $course)
    {
        if ($course->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }
}