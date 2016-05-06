import React from 'react';

import Region from './Region.jsx';
import { regionColor } from './util/colors';
import transform from './util/transform';
import PropsComparer from './util/PropsComparer';
import pickNumericKeys from "./util/pickNumericKeys";

export default class Genome extends React.Component {

  constructor(props) {
    super(props);
    this.propsComparer = new PropsComparer(
      'globalStats.timesSetResultsHasBeenCalled',
      'svgMetrics',
      'selection'
    );
  }

  shouldComponentUpdate(newProps) {
    return this.propsComparer.differ(this.props, newProps);
  }

  render() {
    return (
      <g className="genome">
        <g className="regions">
          {this.renderRegions()}
        </g>
      </g>
    );
  }

  baseWidth() {
    return (this.props.svgMetrics.width.genomes - this.props.svgMetrics.layout.genomePadding)
              / this.props.genome.fullGenomeSize;
  }

  renderRegions() {
    const baseWidth = this.baseWidth();
    const numRegions = this.props.genome.regionCount();
    var translateX = 0;

    return this.props.genome.mapRegions((region, idx) => {
      const translate = transform(translateX, 0);
      const isLastRegion = (idx + 1) === numRegions;
      const genomeProps = _.pick(this.props, [
        'height',
        'width',
        'globalStats',
        'onHighlight',
        'onSelection',
        'onSelectionStart',
        'genome'
      ]);

      // SIDE EFFECTS
      translateX += region.size * baseWidth;

      return (
        <g className="region-wrapper"
           key={idx}
           {...translate}>
          <Region {...genomeProps}
                  selection={this.selectionForRegion(region)}
                  highlight={this.highlightForRegion(region)}
                  regionIdx={idx}
                  region={region}
                  color={regionColor(idx, region.name === 'UNANCHORED')}
                  baseWidth={baseWidth}
                  isLastRegion={isLastRegion}
          />
        </g>
      );
    });
  }

  selectionForRegion(region) {
    const selection = this.props.selection;
    const firstBin = region.firstBin().idx;
    const lastBin = firstBin + region.binCount() - 1;
    return pickNumericKeys(selection, firstBin, lastBin);
  }

  highlightForRegion(region) {
    const highlight = this.props.highlight;
    if(highlight && highlight.genome.startBin === region.startBin) {
      return highlight;
    }
  }
}

Genome.propTypes = {
  genome: React.PropTypes.object.isRequired,
  globalStats: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  highlight: React.PropTypes.object,
  selection: React.PropTypes.object,
  onSelectionStart: React.PropTypes.func.isRequired,
  onSelection: React.PropTypes.func.isRequired,
  onHighlight: React.PropTypes.func.isRequired
};