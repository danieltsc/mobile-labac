const registry: Record<string, number> = {
  'assets/content/geo/relief.md': require('../../assets/content/geo/relief.md'),
  'assets/content/geo/clima.md': require('../../assets/content/geo/clima.md'),
  'assets/content/geo/hidrografie.md': require('../../assets/content/geo/hidrografie.md'),
  'assets/content/geo/populatie.md': require('../../assets/content/geo/populatie.md'),
  'assets/content/geo/economie.md': require('../../assets/content/geo/economie.md'),
  'assets/content/ist/marea-unire.md': require('../../assets/content/ist/marea-unire.md'),
  'assets/content/ist/ev-mediu.md': require('../../assets/content/ist/ev-mediu.md'),
  'assets/content/ist/revolutie-1848.md': require('../../assets/content/ist/revolutie-1848.md'),
  'assets/content/ist/modernizare.md': require('../../assets/content/ist/modernizare.md'),
  'assets/content/ist/comunism.md': require('../../assets/content/ist/comunism.md')
};

export const getContentModule = (path: string): number => {
  const moduleId = registry[path];
  if (!moduleId) {
    throw new Error(`Nu există conținut pentru calea ${path}.`);
  }
  return moduleId;
};
