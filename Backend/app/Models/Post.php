<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded = [];

    protected $casts = [
        'data' => 'array',
    ];

    // Helpers para defaults sin dolor
    public function getInfoAttribute()
    {
        return $this->data['info']        ?? null;
    }
    public function getTextAttribute()
    {
        return $this->data['text']        ?? null;
    }
    public function getLinksAttribute()
    {
        return $this->data['links']       ?? [];
    }
    public function getAttachmentsAttribute()
    {
        return $this->data['attachments'] ?? [];
    }
    public function getCommentsAttribute()
    {
        return $this->data['comments']    ?? [];
    }

    // Setters opcionales
    public function setInfoAttribute($v)
    {
        $d = $this->data ?? [];
        $d['info']        = $v;
        $this->data = $d;
    }
    public function setTextAttribute($v)
    {
        $d = $this->data ?? [];
        $d['text']        = $v;
        $this->data = $d;
    }
    public function setLinksAttribute($v)
    {
        $d = $this->data ?? [];
        $d['links']       = array_values($v ?? []);
        $this->data = $d;
    }
    public function setAttachmentsAttribute($v)
    {
        $d = $this->data ?? [];
        $d['attachments'] = array_values($v ?? []);
        $this->data = $d;
    }
    public function setCommentsAttribute($v)
    {
        $d = $this->data ?? [];
        $d['comments']    = array_values($v ?? []);
        $this->data = $d;
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
