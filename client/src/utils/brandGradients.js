// Brand accent colors for Swiss-style subtle differentiation (not used as gradients)
export const getBrandColor = (brand) => {
  switch (brand?.toLowerCase()) {
    case 'apple': return '#555555';
    case 'samsung': return '#1428A0';
    case 'google': return '#4285F4';
    case 'oneplus': return '#EB0028';
    case 'xiaomi': return '#FF6700';
    case 'nothing': return '#333333';
    case 'sony': return '#000000';
    case 'motorola': return '#5C92FA';
    case 'asus': return '#00529B';
    case 'vivo': return '#415FFF';
    case 'oppo': return '#1A8450';
    case 'realme': return '#F5C900';
    case 'honor': return '#0AB39C';
    case 'poco': return '#F4C600';
    case 'iqoo': return '#FF5500';
    default: return '#999999';
  }
};

// Keep backward compat — the old gradient function now returns empty string
// (no longer used in Swiss design but prevents import errors if referenced)
export const getBrandGradient = (_brand) => '';