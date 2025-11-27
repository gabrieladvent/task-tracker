<?php

namespace App\Enum;

enum PriorityEnum: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    public function color(): string
    {
        return match ($this) {
            self::LOW => '#A0AEC0', // gray-blue
            self::MEDIUM => '#F6AD55', // amber
            self::HIGH => '#F56565', // red
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::LOW => 'Low',
            self::MEDIUM => 'Medium',
            self::HIGH => 'High',
        };
    }
}
