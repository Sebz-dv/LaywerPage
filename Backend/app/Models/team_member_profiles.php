<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class team_member_profiles extends Model
{
    protected $fillable = [
        'team_member_id','email','idiomas','perfil','educacion','experiencia','reconocimientos'
    ];

    protected $casts = [
        'idiomas' => 'array',
        'educacion' => 'array',
        'experiencia' => 'array',
        'reconocimientos' => 'array',
    ];

    public function member() {
        return $this->belongsTo(team_members::class, 'team_member_id');
    }
}
