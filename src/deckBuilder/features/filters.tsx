import * as React from "react";

export const filters = {
  crinkle: (shape: JSX.Element, color: string) => (
    <g style={{ filter: `url(#turbuMap)`, fill: color }}>
      <defs>
        <filter id="turbuMap">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01"
            numOctaves="2"
            result="turbulence"
            data-filterid="3"
          />
          <feDisplacementMap
            xChannelSelector="R"
            yChannelSelector="G"
            in="SourceGraphic"
            in2="turbulence"
            scale="100"
          />
        </filter>
      </defs>
      {shape}
    </g>
  ),
  blur: (shape: JSX.Element, color: string) => (
    <g style={{ filter: `url(#blurMe)`, fill: color }}>
      <defs>
        <filter id="blurMe">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
        </filter>
      </defs>
      {shape}
    </g>
  ),
  ink: (shape: JSX.Element, color: string) => (
    <g style={{ filter: `url(#displacementFilter)`, fill: color }}>
      <defs>
        <filter id="displacementFilter">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.1"
            numOctaves="2"
            result="turbulence"
          />
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale="40"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {shape}
    </g>
  ),
};
