import * as React from "react";

type FilterFactory = ((id: string) => JSX.Element) | null;

const defineFilters = <T extends Record<string, FilterFactory>>(defs: T): T => defs;

/**
 * SVG filter definitions by name. Each factory renders a `<filter>` for a
 * card's `<defs>`; ids are provided by the caller so they stay unique across
 * every card in the document. `none` renders no def at all.
 */
export const FILTER_DEFS = defineFilters({
  none: null,
  shadow: (id: string) => (
    <filter id={id} key={id}>
      <feDropShadow dx="1" dy="1" stdDeviation="0.5" />
    </filter>
  ),
  crinkle: (id: string) => (
    <filter id={id} key={id}>
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
  ),
  blur: (id: string) => (
    <filter id={id} key={id}>
      <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
    </filter>
  ),
  ink: (id: string) => (
    <filter id={id} key={id}>
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
  ),
});

export type FilterName = keyof typeof FILTER_DEFS;

export const FILTER_NAMES = Object.keys(FILTER_DEFS) as FilterName[];
