<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'instructor',
        'semester',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }

    public function deadlines()
    {
        return $this->hasMany(Deadline::class);
    }

    public function studyPlans()
    {
        return $this->hasMany(StudyPlan::class);
    }
}