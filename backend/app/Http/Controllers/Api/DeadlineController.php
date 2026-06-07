<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Deadline;
use Illuminate\Http\Request;

class DeadlineController extends Controller
{
    public function index(Request $request)
    {
        $deadlines = Deadline::with('course')
            ->where('user_id', $request->user()->id)
            ->orderBy('is_completed')
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'deadlines' => $deadlines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => ['nullable', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'due_date' => ['required', 'date'],
            'priority' => ['required', 'string', 'max:100'],
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

        $deadline = Deadline::create([
            'user_id' => $request->user()->id,
            'course_id' => $validated['course_id'] ?? null,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'due_date' => $validated['due_date'],
            'priority' => $validated['priority'],
            'description' => $validated['description'] ?? null,
            'is_completed' => false,
        ]);

        $deadline->load('course');

        return response()->json([
            'message' => 'Deadline created successfully.',
            'deadline' => $deadline,
        ], 201);
    }

    public function update(Request $request, Deadline $deadline)
    {
        if ($deadline->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'course_id' => ['nullable', 'exists:courses,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'due_date' => ['required', 'date'],
            'priority' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'is_completed' => ['boolean'],
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

        $deadline->update([
            'course_id' => $validated['course_id'] ?? null,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'due_date' => $validated['due_date'],
            'priority' => $validated['priority'],
            'description' => $validated['description'] ?? null,
            'is_completed' => $validated['is_completed'] ?? $deadline->is_completed,
        ]);

        $deadline->load('course');

        return response()->json([
            'message' => 'Deadline updated successfully.',
            'deadline' => $deadline,
        ]);
    }

    public function toggle(Request $request, Deadline $deadline)
    {
        if ($deadline->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deadline->update([
            'is_completed' => ! $deadline->is_completed,
        ]);

        $deadline->load('course');

        return response()->json([
            'message' => 'Deadline status updated successfully.',
            'deadline' => $deadline,
        ]);
    }

    public function destroy(Request $request, Deadline $deadline)
    {
        if ($deadline->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $deadline->delete();

        return response()->json([
            'message' => 'Deadline deleted successfully.',
        ]);
    }
}