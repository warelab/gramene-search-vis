export default function metrics(width) {
  const visWidth = width;

  const textWidth = 190;
  const genomePadding = 2;

  const speciesTreeProportion = 0.18;
  const textProportion = textWidth / visWidth;
  const genomesProportion = 1 - speciesTreeProportion - textProportion;

  const speciesTreeWidth = visWidth * speciesTreeProportion;
  const genomesWidth = visWidth * genomesProportion;
  const genomesStart = visWidth - genomesWidth;

  return {
    layout: {
      genomesXStart: genomesStart,
      genomePadding: genomePadding
    },
    proportion: {
      text: textProportion,
      speciesTree: speciesTreeProportion,
      genomes: genomesProportion
    },
    width: {
      vis: visWidth,
      genomes: genomesWidth,
      speciesTree: speciesTreeWidth,
      text: textWidth
    }
  }
}