<?php

namespace App\Enum;

enum StatusEnum: string
{
    case TODO = 'todo';
    case IN_PROGRESS = 'in_progress';
    case CODE_REVIEW = 'code_review';
    case READY_QA = 'ready_qa';
    case READY_DEV = 'ready_dev';
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
            self::READY_QA => '#9F7AEA', // purple
            self::READY_DEV => '#9F7AEA', // purple
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
            self::READY_QA => 'Ready for QA',
            self::READY_DEV => 'Ready for Dev',
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
            self::READY_QA => 4,
            self::READY_DEV => 5,
            self::ON_HOLD => 6,
            self::DONE => 7,
            self::CANCELLED => 8,
        };
    }
}
