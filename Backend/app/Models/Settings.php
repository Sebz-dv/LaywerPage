<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $guarded =  [];
    protected $casts = [
        'social_links' => 'array',
        'footer_blocks' => 'array',
    ];
}
