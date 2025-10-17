const examAssetRegistry: Record<string, number> = {
  'assets/exams/geografie-subiect1-map.png': require('../../assets/exams/geografie-subiect1-map.png'),
  'assets/exams/geografie-subiect2-map.png': require('../../assets/exams/geografie-subiect2-map.png'),
  'assets/exams/geografie-subiect3-map.png': require('../../assets/exams/geografie-subiect3-map.png')
};

export const getExamAssetModule = (path: string): number => {
  const moduleId = examAssetRegistry[path];
  if (!moduleId) {
    throw new Error(`Nu există imagine de examen pentru calea ${path}.`);
  }
  return moduleId;
};
