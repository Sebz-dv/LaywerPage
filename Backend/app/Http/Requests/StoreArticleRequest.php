<?php

// app/Http/Requests/StoreArticleRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // meta puede venir como string JSON desde FormData
        $meta = $this->input('meta');
        if (is_string($meta)) {
            $decoded = json_decode($meta, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->merge(['meta' => $decoded]);
            } else {
                // si viene vacío o basura, nuléalo
                $this->merge(['meta' => null]);
            }
        }

        // normaliza booleans (FormData manda strings)
        foreach (['featured', 'is_published'] as $k) {
            if ($this->has($k)) {
                $v = $this->input($k);
                $this->merge([$k => filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
            }
        }

        // published_at: si llega "", pásalo a null
        if ($this->has('published_at') && $this->input('published_at') === '') {
            $this->merge(['published_at' => null]);
        }

        if ($this->has('author_id')) {
            $aid = $this->input('author_id');
            $this->merge(['author_id' => ($aid === '' || $aid === null) ? null : (int)$aid]);
        }
    }

    public function rules(): array
    {
        return [
            'article_category_id' => ['nullable', 'exists:article_categories,id'],
            'author_id' => ['nullable', 'exists:team_members,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug'  => ['nullable', 'string', 'max:255', 'unique:articles,slug'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'featured' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
            'published_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
            'meta.title' => ['nullable', 'string', 'max:80'],
            'meta.description' => ['nullable', 'string', 'max:160'],
            'meta.keywords' => ['nullable', 'array'],
            'cover' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
        ];
    }
}
