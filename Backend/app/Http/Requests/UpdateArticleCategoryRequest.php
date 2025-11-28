<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateArticleCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ajusta según tu sistema de auth/roles
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('active')) {
            $this->merge([
                'active' => filter_var(
                    $this->input('active'),
                    FILTER_VALIDATE_BOOLEAN,
                    FILTER_NULL_ON_FAILURE
                ) ?? false,
            ]);
        }

        if ($this->has('slug') && $this->input('slug') === '') {
            $this->merge(['slug' => null]);
        }
    }

    public function rules(): array
    {
        // El id viene de la ruta /article-categories/{article_category}
        $id = $this->route('article_category') ?? $this->route('id');

        if (is_object($id) && method_exists($id, 'getKey')) {
            $id = $id->getKey();
        }

        return [
            'name'   => ['sometimes', 'required', 'string', 'max:120'],
            'slug'   => [
                'nullable',
                'string',
                'max:160',
                'unique:article_categories,slug,' . $id,
            ],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
