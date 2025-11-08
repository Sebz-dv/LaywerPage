// app/Http/Requests/AddCommentRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCommentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user'  => ['required','string','max:120'],
            'body'  => ['required','string','max:5000'],
            'image' => ['nullable','image','max:10240'], // 10 MB
        ];
    }
}
