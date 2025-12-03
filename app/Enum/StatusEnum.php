<?php

namespace App\Enum;

enum StatusEnum: string
{
    case TODO = 'todo';
    case IN_PROGRESS = 'in_progress';
    case CODE_REVIEW = 'code_review';
    case ON_HOLD = 'on_hold';
    case DONE = 'done';
    case CANCELLED = 'cancelled';

    public function color(): string
    {
        return match ($this) {
            self::TODO => '#A0AEC0', // gray-blue
            self::IN_PROGRESS => '#4299E1', // blue
            self::ON_HOLD => '#F6AD55', // amber
            self::CODE_REVIEW => '#9F7AEA', // purple
            self::DONE => '#48BB78', // green
            self::CANCELLED => '#F56565', // red
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::TODO => 'Pending',
            self::IN_PROGRESS => 'In Progress',
            self::ON_HOLD => 'On Hold',
            self::CODE_REVIEW => 'Review',
            self::DONE => 'Done',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function sortOrder(): int
    {
        return match ($this) {
            self::TODO => 1,
            self::IN_PROGRESS => 2,
            self::CODE_REVIEW => 3,
            self::ON_HOLD => 4,
            self::DONE => 5,
            self::CANCELLED => 6,
        };
    }
}
