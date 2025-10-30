<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PracticeAreaStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('bullets')) {
            $bul = $this->input('bullets');

            // "" -> []
            if ($bul === '') {
                $this->merge(['bullets' => []]);
            }
            // JSON string -> array
            elseif (is_string($bul)) {
                $decoded = json_decode($bul, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $this->merge(['bullets' => $decoded]);
                }
            }
            // Limpieza básica
            if (is_array($this->bullets)) {
                $clean = array_values(array_filter(array_map(function ($s) {
                    return is_string($s) ? trim($s) : $s;
                }, $this->bullets), fn($s) => $s !== '' && $s !== null));
                $this->merge(['bullets' => $clean]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'title'     => ['required', 'string', 'max:200'],
            'subtitle'  => ['nullable', 'string', 'max:255'],
            'excerpt'   => ['nullable', 'string'],
            'body'      => ['nullable', 'string'],
            'slug'      => ['nullable', 'string', 'max:200', 'unique:practice_areas,slug'],
            'bullets'   => ['sometimes', 'array'],
            'bullets.*' => ['string', 'max:200'],
            'featured'  => ['nullable', 'boolean'],
            'active'    => ['nullable', 'boolean'],
            'order'     => ['nullable', 'integer', 'min:0'], 
            'icon'      => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg'],
            'icon_url'  => ['nullable', 'url'],
        ];
    }
}
