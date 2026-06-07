<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyPlanTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'study_plan_id',
        'task_date',
        'title',
        'description',
        'estimated_hours',
        'is_completed',
    ];

    protected $casts = [
        'task_date' => 'date',
        'is_completed' => 'boolean',
    ];

    public function studyPlan()
    {
        return $this->belongsTo(StudyPlan::class);
    }
}