import React from 'react';
import {
  Brain,
  Film,
  Music,
  Tv,
  Gamepad2,
  Atom,
  Cpu,
  Trophy,
  Globe,
  Landmark,
  Vote,
  Flame,
  Cat,
  BookOpen,
  Calculator,
  Palette,
  Car,
  Dice5,
  Tv2,
  Clapperboard,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  switch (name) {
    case 'Brain':
      return <Brain className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Gamepad2':
      return <Gamepad2 className={className} />;
    case 'Atom':
      return <Atom className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Landmark':
      return <Landmark className={className} />;
    case 'Vote':
      return <Vote className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Cat':
      return <Cat className={className} />;
    case 'BookOpen':
      return <BookOpen className={className} />;
    case 'Calculator':
      return <Calculator className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Dice5':
      return <Dice5 className={className} />;
    case 'Tv2':
      return <Tv2 className={className} />;
    case 'Clapperboard':
      return <Clapperboard className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
