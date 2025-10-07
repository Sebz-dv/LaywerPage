<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ArticleCategories extends Model
{
    use SoftDeletes;

    protected $table = 'article_categories';

    protected $fillable = ['name', 'slug', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $m) {
            if (empty($m->slug)) $m->slug = Str::slug($m->name);
        });
    }

    public function articles()
    {
        return $this->hasMany(Article::class, 'article_category_id');
    }
}
