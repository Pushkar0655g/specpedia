import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

/**
 * SealMark — the SpecPedia wax-seal logo mark.
 *
 * Props:
 *   variant: 'colour' (default) | 'ink' | 'parchment' | 'favicon' | 'mono'
 *   size: number in px (default 32)
 *   spin: boolean (default false) — adds .seal-spin class
 *   className: string
 *   decorative: boolean (default false) — if true aria-hidden="true" and alt="", otherwise alt="SpecPedia seal"
 *   style: object
 */
export default function SealMark({
  variant = 'colour',
  size = 32,
  spin = false,
  className = '',
  decorative = false,
  style = {},
  ...rest
}) {
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme || 'codex';

  let resolved = variant;
  if (variant === 'mono') {
    resolved = theme === 'midnight' ? 'parchment' : 'ink';
  }

  return (
    <img
      src={`/seals/seal-${resolved}.svg`}
      width={size}
      height={size}
      alt={decorative ? '' : 'SpecPedia seal'}
      aria-hidden={decorative ? 'true' : undefined}
      className={['seal-mark', spin ? 'seal-spin' : '', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      loading="eager"
      decoding="async"
      {...rest}
    />
  );
}
