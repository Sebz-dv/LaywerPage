<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaSlots extends Model
{
    protected $fillable = [
        'key',
        'path',
        'alt',
    ];
}
