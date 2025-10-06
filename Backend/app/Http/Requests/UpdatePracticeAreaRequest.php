<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePracticeAreaRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'slug'      => ['nullable','string','max:190', Rule::unique('practice_areas','slug')->ignore($this->route('practice_area'))],
            'title'     => ['sometimes','required','string','max:190'],
            'subtitle'  => ['nullable','string','max:255'],
            'excerpt'   => ['nullable','string'],

            // ✅ URL como string
            'icon_url'  => ['nullable','string','max:512'],

            // ✅ Archivo real va en "icon"
            'icon'      => ['nullable','file','mimetypes:image/png,image/jpeg,image/webp,image/svg+xml','max:4096'],

            'to_path'   => ['nullable','string','max:512'],
            'bullets'   => ['nullable','array'],
            'bullets.*' => ['string','max:255'],
            'featured'  => ['boolean'],
            'active'    => ['boolean'],
            'order'     => ['integer','min:0'],
        ];
    }
}
