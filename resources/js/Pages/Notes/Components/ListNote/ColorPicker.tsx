import { NOTE_COLORS } from "../../types/note";

interface Props {
    value: string;
    onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 shrink-0">Warna:</span>
            <div className="flex gap-1.5 flex-wrap">
                {NOTE_COLORS.map(({ hex, label }) => (
                    <button
                        key={hex}
                        type="button"
                        title={label}
                        onClick={() => onChange(hex)}
                        className={`size-6 rounded-full border-2 transition-transform duration-150 ${value === hex
                                ? 'border-gray-800 dark:border-gray-200 scale-110'
                                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                            }`}
                        style={{ backgroundColor: hex }}
                    />
                ))}
            </div>
        </div>
    );
}
