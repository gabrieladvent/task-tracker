<?php

namespace App\Enum;

enum TaskActivityTypeEnum: string
{
    case CREATED = 'created';
    case CARRIED_OVER = 'carried_over';
    case STATUS_CHANGED = 'status_changed';
    case FIELD_CHANGED = 'field_changed';
    case PR_LINKED = 'pr_linked';
    case DELETED = 'deleted';
    case RESTORED = 'restored';

    public function color(): string
    {
        return match ($this) {
            self::CREATED => '#48BB78', // green
            self::CARRIED_OVER => '#F6AD55', // amber
            self::STATUS_CHANGED => '#4299E1', // blue
            self::FIELD_CHANGED => '#A0AEC0', // gray-blue
            self::PR_LINKED => '#9F7AEA', // purple
            self::DELETED => '#F56565', // red
            self::RESTORED => '#38B2AC', // teal
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::CREATED => 'Created',
            self::CARRIED_OVER => 'Carried over',
            self::STATUS_CHANGED => 'Status changed',
            self::FIELD_CHANGED => 'Updated',
            self::PR_LINKED => 'Pull request linked',
            self::DELETED => 'Deleted',
            self::RESTORED => 'Restored',
        };
    }
}
