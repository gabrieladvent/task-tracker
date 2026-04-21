<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteTag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = Auth::id();

        $notes = Note::forUser($userId)
            ->active()
            ->with('tags')
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->when($request->tag, fn ($q) => $q->whereHas('tags', fn ($q) => $q->where('name', $request->tag)))
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get();

        $tags = NoteTag::where('user_id', $userId)->orderBy('name')->get();

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'tags' => $tags,
            'filters' => $request->only(['search', 'tag']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:note_tags,id',
        ]);

        $note = Note::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'content' => $validated['content'] ?? null,
            'color' => $validated['color'] ?? '#ffffff',
        ]);

        if (! empty($validated['tag_ids'])) {
            $note->tags()->sync($validated['tag_ids']);
        }

        return back()->with('success', 'Note berhasil dibuat.');
    }

    public function update(Request $request, Note $note): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:note_tags,id',
        ]);

        $note->update(array_filter([
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'] ?? null,
            'color' => $validated['color'] ?? null,
        ], fn ($v) => $v !== null));

        if (array_key_exists('tag_ids', $validated)) {
            $note->tags()->sync($validated['tag_ids'] ?? []);
        }

        return back()->with('success', 'Note berhasil diperbarui.');
    }

    public function togglePin(Note $note): RedirectResponse
    {
        $note->update(['is_pinned' => ! $note->is_pinned]);

        return back()->with('success', $note->is_pinned ? 'Note disematkan.' : 'Sematan dilepas.');
    }

    public function archive(Note $note): RedirectResponse
    {
        $note->update(['is_archived' => true, 'is_pinned' => false]);

        return back()->with('success', 'Note diarsipkan.');
    }

    public function unarchive(Note $note): RedirectResponse
    {
        $note->update(['is_archived' => false]);

        return back()->with('success', 'Note dipulihkan dari arsip.');
    }

    public function archived(Request $request): Response
    {
        $notes = Note::forUser(Auth::id())
            ->archived()
            ->with('tags')
            ->when($request->search, fn ($q) => $q->search($request->search))
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('Notes/Archived', ['notes' => $notes]);
    }

    public function destroy(Note $note): RedirectResponse
    {
        $note->delete(); // soft delete

        return back()->with('success', 'Note dihapus.');
    }

    public function forceDestroy(Note $note): RedirectResponse
    {
        $note->tags()->detach();
        $note->forceDelete();

        return back()->with('success', 'Note dihapus permanen.');
    }

    public function trash(Request $request): Response
    {
        $notes = Note::onlyTrashed()
            ->forUser(Auth::id())
            ->with('tags')
            ->orderByDesc('deleted_at')
            ->get();

        return Inertia::render('Notes/Trash', ['notes' => $notes]);
    }

    public function restore(int $id): RedirectResponse
    {
        $note = Note::onlyTrashed()->forUser(Auth::id())->findOrFail($id);
        $note->restore();

        return back()->with('success', 'Note dipulihkan.');
    }
}
