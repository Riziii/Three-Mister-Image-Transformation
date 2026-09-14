import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "w-8 h-8", 
  size, 
  color = "#580305" 
}) => {
  return (
    <svg 
      viewBox="0 0 1000 1000" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Three Mister Logo"
    >
      <g fill={color}>
        {/* Top Horizontal Bar */}
        <rect x="248" y="70" width="308" height="56" />
        {/* Tall Center Vertical Spine */}
        <rect x="500" y="70" width="56" height="860" />
        {/* Bottom Horizontal Bar */}
        <rect x="248" y="874" width="308" height="56" />
        
        {/* Left Box Structure */}
        <rect x="248" y="146" width="56" height="708" />
        <rect x="248" y="146" width="232" height="56" />
        <rect x="248" y="798" width="232" height="56" />
        <rect x="424" y="146" width="56" height="708" />
        {/* Middle Horizontal Crossbar */}
        <rect x="248" y="472" width="252" height="56" />

        {/* Right Side Elements */}
        <rect x="556" y="146" width="242" height="56" />
        <rect x="556" y="324" width="132" height="56" />
        <rect x="632" y="324" width="56" height="606" />
        <rect x="556" y="798" width="242" height="56" />
      </g>
    </svg>
  );
};

export default Logo;
