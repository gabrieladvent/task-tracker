<?php

namespace App\Policies;

use App\Models\Note;
use App\Models\User;

class NotePolicy
{
    public function update(User $user, Note $note): bool
    {
        return $note->user_id === $user->id;
    }

    public function delete(User $user, Note $note): bool
    {
        return $note->user_id === $user->id;
    }

    public function restore(User $user, Note $note): bool
    {
        return $note->user_id === $user->id;
    }

    public function forceDelete(User $user, Note $note): bool
    {
        return $note->user_id === $user->id;
    }
}
