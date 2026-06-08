<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'plan',
        'billing_status',
        'plan_started_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_started_at' => 'datetime',
        ];
    }

    public function isPaid(): bool
    {
        return $this->plan === 'paid';
    }

    public function isFree(): bool
    {
        return $this->plan === 'free';
    }
}