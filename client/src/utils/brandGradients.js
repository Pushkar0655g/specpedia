export const getBrandGradient = (brand) => {
  switch (brand?.toLowerCase()) {
    case 'apple': return 'from-zinc-400 via-zinc-600 to-zinc-900';
    case 'samsung': return 'from-blue-600 via-purple-700 to-black';
    case 'google': return 'from-blue-400 via-red-500 to-yellow-500';
    case 'oneplus': return 'from-red-600 via-red-800 to-black';
    case 'xiaomi': return 'from-orange-500 via-orange-700 to-gray-900';
    case 'nothing': return 'from-white via-gray-300 to-gray-500';
    case 'sony': return 'from-indigo-900 via-purple-900 to-black';
    case 'motorola': return 'from-blue-500 via-cyan-500 to-teal-600';
    case 'asus': return 'from-red-500 via-rose-700 to-black';
    case 'vivo': return 'from-blue-500 via-indigo-600 to-purple-800';
    case 'oppo': return 'from-green-500 via-emerald-600 to-teal-800';
    case 'realme': return 'from-yellow-500 via-amber-600 to-black';
    case 'honor': return 'from-cyan-600 via-blue-800 to-indigo-900';
    case 'poco': return 'from-yellow-400 via-orange-500 to-yellow-600';
    case 'iqoo': return 'from-black via-orange-700 to-orange-500';
    default: return 'from-gray-700 via-gray-800 to-black';
  }
};