import React, { useState } from 'react';
import { 
  Wind, 
  Gauge, 
  Leaf, 
  Star, 
  BookOpen, 
  Brush, 
  Baby, 
  Feather, 
  PenTool, 
  Map, 
  Ghost, 
  FlaskConical, 
  Bot, 
  Film, 
  Shapes, 
  Camera, 
  Car, 
  Gamepad2, 
  Aperture, 
  MessageSquare, 
  Clapperboard, 
  Palette,
  Sparkles,
  Info
} from 'lucide-react';
import { ArtisticStyle, ArtisticStyleMode } from '../types';

interface StyleSelectorProps {
  styles: ArtisticStyle[];
  selectedMode: ArtisticStyleMode;
  onSelectMode: (mode: ArtisticStyleMode) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedMode,
  onSelectMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [hoveredStyle, setHoveredStyle] = useState<ArtisticStyle | null>(null);

  const categories = ['Semua', 'Anime & Manga', 'Artistik & Sketsa', 'Digital & 3D', 'Retro & Pop'];

  const filteredStyles = selectedCategory === 'Semua'
    ? styles
    : styles.filter((s) => s.category === selectedCategory);

  const renderIcon = (iconName: string, className = '') => {
    switch (iconName) {
      case 'Wind': return <Wind className={className} size={20} />;
      case 'Gauge': return <Gauge className={className} size={20} />;
      case 'Leaf': return <Leaf className={className} size={20} />;
      case 'Star': return <Star className={className} size={20} />;
      case 'BookOpen': return <BookOpen className={className} size={20} />;
      case 'Brush': return <Brush className={className} size={20} />;
      case 'Baby': return <Baby className={className} size={20} />;
      case 'Feather': return <Feather className={className} size={20} />;
      case 'PenTool': return <PenTool className={className} size={20} />;
      case 'Map': return <Map className={className} size={20} />;
      case 'Ghost': return <Ghost className={className} size={20} />;
      case 'FlaskConical': return <FlaskConical className={className} size={20} />;
      case 'Bot': return <Bot className={className} size={20} />;
      case 'Film': return <Film className={className} size={20} />;
      case 'Shapes': return <Shapes className={className} size={20} />;
      case 'Camera': return <Camera className={className} size={20} />;
      case 'Car': return <Car className={className} size={20} />;
      case 'Gamepad2': return <Gamepad2 className={className} size={20} />;
      case 'Aperture': return <Aperture className={className} size={20} />;
      case 'MessageSquare': return <MessageSquare className={className} size={20} />;
      case 'Clapperboard': return <Clapperboard className={className} size={20} />;
      case 'Palette': return <Palette className={className} size={20} />;
      default: return <Sparkles className={className} size={20} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h3 className="text-base font-bold text-slate-900">Pilih Gaya Transformasi</h3>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredStyles.length} Gaya Tersedia
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Styles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {filteredStyles.map((item, index) => {
          const isSelected = selectedMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectMode(item.id)}
              onMouseEnter={() => setHoveredStyle(item)}
              onMouseLeave={() => setHoveredStyle(null)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative group ${
                isSelected
                  ? 'border-[#800000] bg-red-50/50 shadow-sm ring-1 ring-red-900/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`${item.color} p-1.5 rounded-xl bg-slate-50 group-hover:scale-110 transition-transform`}>
                  {renderIcon(item.icon)}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  #{index + 1}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active or Hovered Description Bar */}
      {hoveredStyle && (
        <div className="p-3 bg-slate-900 text-white rounded-2xl text-xs flex items-start gap-2 animate-fadeIn shadow-lg">
          <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-200">{hoveredStyle.label}: </span>
            <span className="text-slate-300">{hoveredStyle.desc}</span>
          </div>
        </div>
      )}
    </div>
  );
};
