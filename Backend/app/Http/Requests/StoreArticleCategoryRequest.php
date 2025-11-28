<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleCategoryRequest extends FormRequest
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

        // Si slug llega vacío, pásalo a null para que el modelo lo genere
        if ($this->has('slug') && $this->input('slug') === '') {
            $this->merge(['slug' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'name'   => ['required', 'string', 'max:120'],
            'slug'   => ['nullable', 'string', 'max:160', 'unique:article_categories,slug'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
