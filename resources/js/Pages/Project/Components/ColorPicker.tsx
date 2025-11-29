import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Props {
    colors: string[];
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

export default function ColorPicker({ colors, selectedColor, onColorSelect }: Props) {
    return (
        <div className="grid grid-cols-6 gap-3">
            {colors.map((color) => (
                <motion.button
                    key={color}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onColorSelect(color)}
                    className="relative w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                    style={{ backgroundColor: color }}
                >
                    {selectedColor === color && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <Check size={20} className="text-white drop-shadow-lg" />
                        </motion.div>
                    )}
                </motion.button>
            ))}
        </div>
    );
}
