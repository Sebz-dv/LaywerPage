<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfoBlock extends Model
{
    protected $fillable = ['key', 'title', 'body', 'position', 'published'];
    protected $casts = ['published' => 'boolean'];
}
