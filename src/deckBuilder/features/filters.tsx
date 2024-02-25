import * as React from "react";

interface FilterGen {
  [name: string]: (shape: React.ReactNode) => React.ReactNode
}

export const filters: FilterGen = {
  none: (shape) => (shape),
  shadow: (shape) => (
    <g style={{ filter: `url(#shadow)` }}>
      <defs>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="0.5" />
        </filter> 
      </defs>
      {shape}
    </g>
  ),
  crinkle: (shape) => (
    <g style={{ filter: `url(#crinkle)` }}>
      <defs>
        <filter id="crinkle">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.01"
            numOctaves="2"
            result="turbulence"
          />
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {shape}
    </g>
  ),
  blur: (shape) => (
    <g style={{ filter: `url(#blur)`}}>
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      {shape}
    </g>
  ),
  ink: (shape) => (
    <g style={{ filter: `url(#ink)` }}>
      <defs>
        <filter id="ink">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.18"
            numOctaves="2"
            result="turbulence"
          />
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {shape}
    </g>
  ),
};
