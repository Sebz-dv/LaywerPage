<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PracticeAreaUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        // bullets
        $this->normalizeStringOrJsonToArray('bullets', true);

        // nuevos campos JSON
        $this->normalizeStringOrJsonToArray('scope');
        $this->normalizeStringOrJsonToArray('faqs');
        $this->normalizeStringOrJsonToArray('docs');
    }

    private function normalizeStringOrJsonToArray(string $key, bool $cleanStrings = false): void
    {
        if (!$this->has($key)) {
            return;
        }

        $value = $this->input($key);

        if ($value === '') {
            $this->merge([$key => []]);
            return;
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $value = $decoded;
            }
        }

        if (is_array($value)) {
            if ($cleanStrings) {
                $value = array_values(array_filter(
                    array_map(function ($s) {
                        return is_string($s) ? trim($s) : $s;
                    }, $value),
                    fn($s) => $s !== '' && $s !== null
                ));
            }

            $this->merge([$key => $value]);
        }
    }

    public function rules(): array
    {
        // Asegúrate de que el nombre del parámetro de ruta es 'practice_area'
        $id = $this->practice_area?->id ?? $this->route('practice_area');

        return [
            'title'     => ['sometimes', 'string', 'max:200'],
            'subtitle'  => ['nullable', 'string', 'max:255'],
            'excerpt'   => ['nullable', 'string'],
            'body'      => ['nullable', 'string'],
            'slug'      => [
                'nullable',
                'string',
                'max:200',
                Rule::unique('practice_areas', 'slug')->ignore($id),
            ],
            'bullets'   => ['sometimes', 'array'],
            'bullets.*' => ['string', 'max:200'],
            'featured'  => ['nullable', 'boolean'],
            'active'    => ['nullable', 'boolean'],
            'order'     => ['nullable', 'integer', 'min:0'],
            'icon'      => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg'],
            'icon_url'  => ['nullable', 'url'],

            'category'      => ['nullable', 'string', 'max:255'],
            'pricing_type'  => ['nullable', 'string', 'max:50'],
            'from_price'    => ['nullable', 'string', 'max:255'],
            'eta'           => ['nullable', 'string', 'max:255'],

            'scope'         => ['nullable', 'array'],
            'scope.*.label' => ['nullable', 'string'],
            'scope.*.value' => ['nullable', 'string'],

            'faqs'          => ['nullable', 'array'],
            'faqs.*.q'      => ['nullable', 'string'],
            'faqs.*.a'      => ['nullable', 'string'],

            'docs'          => ['nullable', 'array'],
            'docs.*'        => ['nullable', 'string'],
        ];
    }
}
