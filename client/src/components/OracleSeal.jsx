import React from 'react';
import SealMark from './SealMark';

/**
 * OracleSeal — Visual badge for Oracle AI surfaces.
 * Delegates to SealMark with colour variant and optional spin when thinking / streaming.
 */
export default function OracleSeal({ size = 24, thinking = false, className = '', style = {} }) {
  return (
    <SealMark
      variant="colour"
      size={size}
      spin={thinking}
      decorative
      className={`oracle-seal flex-shrink-0 ${className}`}
      style={style}
    />
  );
}
