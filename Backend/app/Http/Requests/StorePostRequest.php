<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    // app/Http/Requests/StorePostRequest.php
    public function rules(): array
    {
        return [
            'title'                 => ['required', 'string', 'max:255'],
            'info'                  => ['nullable', 'string'],
            'text'                  => ['nullable', 'string'],

            'author'            => ['nullable', 'array'],
            'author.id'         => ['nullable'], // puedes poner 'integer' si aplica
            'author.name'       => ['nullable', 'string', 'max:120'], // ❗ antes era required_with:author
            'author.slug'       => ['nullable', 'string', 'max:180'],
            'author.photo_url'  => ['nullable', 'string', 'max:255'], // ❗ avatar_url → photo_url

            'links'                 => ['array'],
            'links.*.label'         => ['required_with:links.*.url', 'string', 'max:255'],
            'links.*.url'           => ['required_with:links.*.label', 'url'],

            'comments'              => ['array'],
            'comments.*.user'       => ['required_with:comments.*.body', 'string', 'max:120'],
            'comments.*.body'       => ['nullable', 'string'],
            'comments.*.created_at' => ['nullable', 'date'],
            'comments.*.imageUrl'   => ['nullable', 'string', 'max:255'],

            'file'                  => ['nullable', 'file', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'links.*.url.url' => 'Cada link necesita un URL válido (incluye http:// o https://).',
            'comments.*.user.required_with' => 'Si pones texto del comentario, también debes indicar el usuario.',
            'comments.*.body.required_with' => 'Si indicas un usuario, también debes escribir el comentario.',
        ];
    }
}
