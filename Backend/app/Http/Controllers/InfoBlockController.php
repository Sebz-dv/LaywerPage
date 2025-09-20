<?php

namespace App\Http\Controllers;

use App\Models\InfoBlock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class InfoBlockController extends Controller
{
    // GET /api/info-blocks?public=1
    public function index(Request $request)
    {
        $publicOnly = filter_var($request->query('public', '0'), FILTER_VALIDATE_BOOL);
        $q = InfoBlock::query()->orderBy('position')->orderBy('id');
        if ($publicOnly) $q->where('published', true);
        return response()->json($q->get());
    }

    // GET /api/info-blocks/{infoBlock}
    public function show(InfoBlock $infoBlock)
    {
        return response()->json($infoBlock);
    }

    // POST /api/info-blocks
    public function store(Request $request)
    {
        // Normaliza key (si no viene, se deriva del title)
        $rawKey   = $request->input('key');
        $rawTitle = $request->input('title');
        $normKey  = $this->normalizeKey($rawKey ?: $rawTitle);
        $request->merge(['key' => $normKey]);

        $data = $request->validate([
            'key'       => ['required', 'regex:/^[a-z0-9_-]+$/', 'max:64', 'unique:info_blocks,key'],
            'title'     => ['required', 'string', 'max:200'],
            'body'      => ['required', 'string'],
            'published' => ['sometimes', 'boolean'],
        ]);

        // posición al final
        $data['position'] = ((int) InfoBlock::max('position')) + 1;

        $block = InfoBlock::create($data);
        return response()->json($block, 201);
    }

    // PATCH /api/info-blocks/{infoBlock}
    public function update(Request $request, InfoBlock $infoBlock)
    {
        if ($request->has('key')) {
            $request->merge(['key' => $this->normalizeKey($request->input('key'))]);
        }

        $data = $request->validate([
            'key'       => ['sometimes', 'required', 'regex:/^[a-z0-9_-]+$/', 'max:64', Rule::unique('info_blocks', 'key')->ignore($infoBlock->id)],
            'title'     => ['sometimes', 'required', 'string', 'max:200'],
            'body'      => ['sometimes', 'required', 'string'],
            'published' => ['sometimes', 'boolean'],
            'position'  => ['sometimes', 'integer', 'min:0'],
        ]);

        $infoBlock->fill($data)->save();
        return response()->json($infoBlock);
    }

    // DELETE /api/info-blocks/{infoBlock}
    public function destroy(InfoBlock $infoBlock)
    {
        $infoBlock->delete();
        return response()->json(['ok' => true]);
    }

    // PATCH /api/info-blocks/reorder   { "ids": [3,1,2,...] }
    public function reorder(Request $request)
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:info_blocks,id'],
        ])['ids'];

        DB::transaction(function () use ($ids) {
            foreach ($ids as $i => $id) {
                InfoBlock::where('id', $id)->update(['position' => $i + 1]);
            }
        });

        return response()->json(['ok' => true]);
    }

    private function normalizeKey(?string $k): string
    {
        $k = (string) ($k ?? '');
        $k = Str::of($k)->lower()->ascii()->toString();   // quita acentos
        $k = preg_replace('/[^a-z0-9_-]+/i', '-', $k);    // deja letras, números, _ y -
        $k = preg_replace('/-{2,}/', '-', $k);           // colapsa ---
        $k = trim($k, "-_");                             // recorta extremos
        return $k ?: 'item';
    }
}
