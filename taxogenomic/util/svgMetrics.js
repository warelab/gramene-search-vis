const SMALL_SCREEN_WIDTH_PX = 480;
const TEXT_WIDTH_PX = 188;
const GENOME_PADDING_DEFAULT_PX = 2;
const GENOME_PADDING_SMALL_PX = 1.5;

const CIRCLE_RADIUS_DEFAULT_PX = 2.5;
const CIRCLE_RADIUS_SMALL_PX = 1.5;
const STROKE_WIDTH_DEFAULT_PX = 1; // px, defined in taxonomy.less;
const STROKE_WIDTH_SMALL_PX = STROKE_WIDTH_DEFAULT_PX;

const SPECIES_TREE_PROPORTION = 0.18;

const LEAF_NODE_HEIGHT_DEFAULT_PX = 12;
const LEAF_NODE_HEIGHT_SMALL_PX = 6.5;

const MARGIN_PX = 6;

export default function metrics(width) {
  const visWidth = width - MARGIN_PX;

  const showSpeciesNames = visWidth > SMALL_SCREEN_WIDTH_PX;

  let genomePadding;
  let leafNodeHeight;
  let circleRadius;
  let strokeWidth;
  let textWidth;

  if(showSpeciesNames) {
    genomePadding = GENOME_PADDING_DEFAULT_PX;
    leafNodeHeight = LEAF_NODE_HEIGHT_DEFAULT_PX;
    circleRadius = CIRCLE_RADIUS_DEFAULT_PX;
    strokeWidth = STROKE_WIDTH_DEFAULT_PX;
    textWidth = TEXT_WIDTH_PX + genomePadding;
  }
  else {
    genomePadding = GENOME_PADDING_SMALL_PX;
    leafNodeHeight = LEAF_NODE_HEIGHT_SMALL_PX;
    circleRadius = CIRCLE_RADIUS_SMALL_PX;
    strokeWidth = STROKE_WIDTH_SMALL_PX;
    textWidth = genomePadding;
  }

  const textProportion = textWidth / visWidth;
  const genomesProportion = 1 - SPECIES_TREE_PROPORTION - textProportion;

  const speciesTreeWidth = visWidth * SPECIES_TREE_PROPORTION;
  const genomesWidth = visWidth * genomesProportion;
  const genomesStart = visWidth - genomesWidth;

  return {
    layout: {
      genomesXStart: genomesStart,
      genomePadding: genomePadding,
      showSpeciesNames: showSpeciesNames,
      circleRadius: circleRadius,
      strokeWidth: strokeWidth,
      margin: MARGIN_PX
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
    },
    height: {
      leafNode: leafNodeHeight
    }
  }
}