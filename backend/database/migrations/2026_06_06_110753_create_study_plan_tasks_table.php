<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_plan_tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('study_plan_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('task_date');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('estimated_hours')->default(1);
            $table->boolean('is_completed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_plan_tasks');
    }
};