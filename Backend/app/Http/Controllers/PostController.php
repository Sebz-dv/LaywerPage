<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Requests\AddCommentRequest;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\team_members as TeamMember;

class PostController extends Controller
{
    public function index()
    {
        return Post::query()
            ->select(['id', 'author_id', 'title', 'data', 'created_at', 'updated_at'])
            ->latest('id')->get();
    }

    private function normalizeAuthor($author)
    {
        if (empty($author) || !is_array($author)) {
            return null;
        }

        $hasPhoto = isset($author['avatar_url']) && is_string($author['avatar_url']) && trim($author['avatar_url']) !== '';

        $tm = null;
        if (isset($author['id']) && $author['id'] !== null && $author['id'] !== '') {
            $tm = TeamMember::query()->where('id', $author['id'])->first();
        } elseif (isset($author['slug']) && is_string($author['slug']) && trim($author['slug']) !== '') {
            $tm = TeamMember::query()->where('slug', $author['slug'])->first();
        }

        $absolutize = function (?string $u): ?string {
            if (!$u) return null;
            if (preg_match('#^https?://#i', $u)) return $u;
            if (Storage::disk('public')->exists($u)) {
                return Storage::disk('public')->url($u);
            }
            return $u;
        };

        if ($tm) {
            $resolved = [
                'id'        => (string) $tm->id,
                'name'      => $tm->display_name ?? ($author['name'] ?? null),
                'slug'      => $tm->slug ?? ($author['slug'] ?? null),
                'avatar_url' => $tm->avatar_url ? $absolutize($tm->avatar_url) : null,
            ];

            if ($hasPhoto) {
                $resolved['avatar_url'] = $absolutize($author['avatar_url']);
            }

            return $resolved;
        }

        if ($hasPhoto) {
            $author['avatar_url'] = $absolutize($author['avatar_url']);
        }

        if (isset($author['id']))   $author['id'] = (string) $author['id'];
        if (isset($author['name'])) $author['name'] = is_string($author['name']) ? trim($author['name']) : $author['name'];
        if (isset($author['slug'])) $author['slug'] = is_string($author['slug']) ? trim($author['slug']) : $author['slug'];

        return $author;
    }

    public function store(StorePostRequest $req)
    {
        Log::info('[simple-posts.store] INPUT', [
            'all'   => $req->all(),
            'files' => array_keys($req->allFiles() ?: []),
        ]);

        try {
            $links    = $req->input('links', []);
            $comments = $req->input('comments', []);
            $authorIn = $req->input('author');

            $author   = $this->normalizeAuthor(is_array($authorIn) ? $authorIn : null);

            $attachments = [];
            if ($req->hasFile('file')) {
                $f = $req->file('file');
                $path = $f->store('simple_posts', 'public');
                $attachments[] = [
                    'path' => $path,
                    'name' => $f->getClientOriginalName(),
                    'size' => $f->getSize(),
                    'mime' => $f->getMimeType(),
                    'url'  => Storage::disk('public')->url($path),
                ];
            }

            $post = Post::create([
                'author_id' => auth()->id(),
                'title'     => (string) $req->string('title'),
                'data'      => [
                    'author'      => $author,
                    'info'        => $req->input('info'),
                    'text'        => $req->input('text'),
                    'links'       => array_values($links),
                    'attachments' => array_values($attachments),
                    'comments'    => array_values($comments),
                ],
            ]);

            Log::info('[simple-posts.store] OK', ['id' => $post->id]);

            return response()->json($post, 201);
        } catch (\Throwable $e) {
            Log::error('[simple-posts.store] ERROR', [
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'No se pudo crear el post',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdatePostRequest $req, Post $post)
    {
        Log::info('[simple-posts.update] INPUT', [
            'id'    => $post->id,
            'all'   => $req->all(),
            'files' => array_keys($req->allFiles() ?: []),
            'meta'  => [
                'has.author'   => $req->has('author'),
                'has.info'     => $req->has('info'),
                'has.text'     => $req->has('text'),
                'has.links'    => $req->has('links'),
                'has.comments' => $req->has('comments'),
                'filled.title' => $req->filled('title'),
            ],
        ]);

        try {
            $beforeData = $post->data ?? [];

            $data = $post->data ?? [];

            if ($req->has('author')) {
                $data['author'] = $this->normalizeAuthor(
                    is_array($req->input('author')) ? $req->input('author') : null
                );
            }

            if ($req->has('info')) $data['info'] = $req->input('info');
            if ($req->has('text')) $data['text'] = $req->input('text');

            if ($req->has('links')) {
                $data['links'] = array_values($req->input('links', []));
            }

            if ($req->has('comments')) {
                $data['comments'] = array_values($req->input('comments', []));
            }

            if ($req->hasFile('file')) {
                $f = $req->file('file');
                $path = $f->store('simple_posts', 'public');
                $data['attachments'] = array_values($data['attachments'] ?? []);
                $data['attachments'][] = [
                    'path' => $path,
                    'name' => $f->getClientOriginalName(),
                    'size' => $f->getSize(),
                    'mime' => $f->getMimeType(),
                    'url'  => Storage::disk('public')->url($path),
                ];
            }

            $update = ['data' => $data];

            if ($req->filled('title')) {
                $update['title'] = (string) $req->string('title');
            }

            Log::info('[simple-posts.update] BEFORE->AFTER data', [
                'before.data' => $beforeData,
                'after.data'  => $data,
                'update'      => $update,
            ]);

            $ok = $post->update($update);

            Log::info('[simple-posts.update] SAVE RESULT', [
                'ok'       => $ok,
                'changes'  => $post->getChanges(), // cambios en la instancia en memoria
            ]);

            // A veces la instancia queda “vieja”; refrescamos desde DB
            $post->refresh();

            Log::info('[simple-posts.update] REFRESHED', [
                'id'    => $post->id,
                'title' => $post->title,
                // cuidado: puede ser largo, pero útil en la primera depuración
                'data'  => $post->data,
            ]);

            return response()->json($post);
        } catch (\Throwable $e) {
            Log::error('[simple-posts.update] ERROR', [
                'id'    => $post->id,
                'msg'   => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'No se pudo actualizar el post',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Post $post)
    {
        return response()->json($post);
    }

    public function addComment(AddCommentRequest $req, Post $post)
    {
        Log::info('[POSTS] addComment()', [
            'post_id' => $post->id,
            'user'    => $req->input('user'),
            'hasImg'  => $req->hasFile('image'),
        ]);

        $data = $post->data ?? [];
        $data['comments']    = array_values($data['comments']    ?? []);
        $data['attachments'] = array_values($data['attachments'] ?? []);
        $data['links']       = array_values($data['links']       ?? []);

        $commentId = (string) Str::uuid();
        $imageInfo = null;

        if ($req->hasFile('image')) {
            $f = $req->file('image');
            $path = $f->store('simple_posts/comments', 'public');
            $imageInfo = [
                'path' => $path,
                'name' => $f->getClientOriginalName(),
                'size' => $f->getSize(),
                'mime' => $f->getMimeType(),
                'url'  => Storage::disk('public')->url($path),
            ];
        }

        $comment = [
            'id'         => $commentId,
            'user'       => (string) $req->string('user'),
            'body'       => (string) $req->string('body'),
            'image'      => $imageInfo,
            'created_at' => now()->toIso8601String(),
        ];

        $data['comments'][] = $comment;
        $post->data = $data;
        $post->save();

        return response()->json($comment, 201);
    }

    public function comments(Post $post)
    {
        return response()->json($post->data['comments'] ?? []);
    }

    public function deleteComment(Request $req, Post $post, string $commentId)
    {
        $data = $post->data ?? [];
        $comments = array_values($data['comments'] ?? []);

        $new = [];
        $removed = null;

        foreach ($comments as $c) {
            if (($c['id'] ?? null) === $commentId) {
                $removed = $c;
                continue;
            }
            $new[] = $c;
        }

        $data['comments'] = $new;
        $post->data = $data;
        $post->save();

        return response()->json(['removed' => $removed], $removed ? 200 : 404);
    }
}
