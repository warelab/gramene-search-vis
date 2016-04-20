const SMALL_SCREEN_WIDTH_PX = 480;
const TEXT_WIDTH_PX = 188;
const GENOME_PADDING_PX = 2;

const SPECIES_TREE_PROPORTION = 0.18;

export default function metrics(width) {
  const visWidth = width;

  const showSpeciesNames = visWidth > SMALL_SCREEN_WIDTH_PX;

  const textWidth = showSpeciesNames ? TEXT_WIDTH_PX + GENOME_PADDING_PX : GENOME_PADDING_PX;

  const textProportion = textWidth / visWidth;
  const genomesProportion = 1 - SPECIES_TREE_PROPORTION - textProportion;

  const speciesTreeWidth = visWidth * SPECIES_TREE_PROPORTION;
  const genomesWidth = visWidth * genomesProportion;
  const genomesStart = visWidth - genomesWidth;

  return {
    layout: {
      genomesXStart: genomesStart,
      genomePadding: GENOME_PADDING_PX,
      showSpeciesNames: showSpeciesNames
    },
    proportion: {
      text: textProportion,
      speciesTree: SPECIES_TREE_PROPORTION,
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