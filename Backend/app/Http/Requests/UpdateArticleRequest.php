<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    protected function prepareForValidation(): void
    {
        $meta = $this->input('meta');
        if (is_string($meta)) {
            $decoded = json_decode($meta, true);
            $this->merge(['meta' => json_last_error() === JSON_ERROR_NONE ? $decoded : null]);
        }
        foreach (['featured', 'is_published'] as $k) {
            if ($this->has($k)) {
                $v = $this->input($k);
                $this->merge([$k => filter_var($v, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false]);
            }
        }
        if ($this->has('published_at') && $this->input('published_at') === '') {
            $this->merge(['published_at' => null]);
        }
    }
}
