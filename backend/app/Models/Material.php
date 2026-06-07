<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'title',
        'original_filename',
        'file_path',
        'file_type',
        'file_size',
        'extracted_text',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function aiChats()
    {
        return $this->hasMany(AiChat::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }
}