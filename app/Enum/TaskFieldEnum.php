<?php

namespace App\Enum;

/**
 * The vocabulary for task fields that show up in the activity log.
 *
 * Single source for both renderers: the timeline builds JSX around these
 * labels and the spreadsheet export writes them into cells. Keeping the
 * wording here is what stops the two from drifting apart.
 */
enum TaskFieldEnum: string
{
    case TITLE = 'title';
    case DESCRIPTION = 'description';
    case NOTES = 'notes';
    case STATUS = 'status';
    case PRIORITY = 'priority';
    case STORY_POINTS = 'story_points';
    case PROJECT = 'project_id';
    case TASK_DATE = 'task_date';
    case LINK_PULL_REQUEST = 'link_pull_request';

    public function label(): string
    {
        return match ($this) {
            self::TITLE => 'Title',
            self::DESCRIPTION => 'Description',
            self::NOTES => 'Notes',
            self::STATUS => 'Status',
            self::PRIORITY => 'Priority',
            self::STORY_POINTS => 'Story points',
            self::PROJECT => 'Project',
            self::TASK_DATE => 'Date',
            self::LINK_PULL_REQUEST => 'Pull request',
        };
    }

    /**
     * Free text and blobs. Showing both versions of one is worse than useless
     * in a timeline row or a spreadsheet cell, so only the field is named.
     */
    public function isOpaque(): bool
    {
        return match ($this) {
            self::TITLE, self::DESCRIPTION, self::NOTES => true,
            default => false,
        };
    }

    public static function labelFor(?string $field): ?string
    {
        return $field === null ? null : (self::tryFrom($field)?->label() ?? $field);
    }

    public static function isOpaqueField(?string $field): bool
    {
        return $field !== null && (self::tryFrom($field)?->isOpaque() ?? false);
    }
}
