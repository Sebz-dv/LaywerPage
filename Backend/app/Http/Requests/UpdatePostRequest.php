<?php

// app/Http/Requests/UpdatePostRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                 => ['sometimes', 'nullable', 'string', 'max:255'],
            'info'                  => ['sometimes', 'nullable', 'string'],
            'text'                  => ['sometimes', 'nullable', 'string'],

            'author'            => ['sometimes', 'nullable', 'array'],
            'author.id'         => ['sometimes', 'nullable'],
            'author.name'       => ['sometimes', 'nullable', 'string', 'max:120'],
            'author.slug'       => ['sometimes', 'nullable', 'string', 'max:180'],
            'author.photo_url'  => ['sometimes', 'nullable', 'string', 'max:255'],

            'links'                 => ['sometimes', 'array'],
            'links.*.label'         => ['required_with:links.*.url', 'string', 'max:255'],
            'links.*.url'           => ['required_with:links.*.label', 'url'],

            'comments'              => ['sometimes', 'array'],
            'comments.*.user'       => ['required_with:comments.*.body', 'string', 'max:120'],
            'comments.*.body'       => ['nullable', 'string'],
            'comments.*.created_at' => ['nullable', 'date'],
            'comments.*.imageUrl'   => ['nullable', 'string', 'max:255'],

            'file'                  => ['sometimes', 'nullable', 'file', 'max:10240'],
        ];
    }
}
