<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'plan')) {
                $table->string('plan')->default('free')->after('role');
            }

            if (!Schema::hasColumn('users', 'billing_status')) {
                $table->string('billing_status')->default('inactive')->after('plan');
            }

            if (!Schema::hasColumn('users', 'plan_started_at')) {
                $table->timestamp('plan_started_at')->nullable()->after('billing_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'plan_started_at')) {
                $table->dropColumn('plan_started_at');
            }

            if (Schema::hasColumn('users', 'billing_status')) {
                $table->dropColumn('billing_status');
            }

            if (Schema::hasColumn('users', 'plan')) {
                $table->dropColumn('plan');
            }
        });
    }
};