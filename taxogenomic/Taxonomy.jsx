import React from "react";
import Clade from "./Clade.jsx";

export default class Taxonomy extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      inProgressSelection: {},
      selection: {},
      highlight: {}
    };
  }

  handleSelectionStart(selection) {
    this.setState({inProgressSelection: selection});
  }

  handleSelection(selection) {
    this.setState({selection: selection});
    if(this.props.onSelection) this.props.onSelection(selection);
  }

  handleHighlight(highlight) {
    this.setState({highlight: highlight});
    if (this.props.onHighlight) this.props.onHighlight(highlight);
  }

  render() {
    const propsPassthrough = _.pick(this.props, [
      'nodeDisplayInfo',
      'svgMetrics'
    ]);

    return (
      <g className="taxonomy">
        <Clade node={this.props.rootNode}
               isRoot={true}
               state={this.state}
               onSelectionStart={this.handleSelectionStart.bind(this)}
               onSelection={this.handleSelection.bind(this)}
               onHighlight={this.handleHighlight.bind(this)}
          {...propsPassthrough} />
      </g>
    )
  }
}

Taxonomy.propTypes = {
  rootNode: React.PropTypes.object.isRequired,
  nodeDisplayInfo: React.PropTypes.object.isRequired,
  svgMetrics: React.PropTypes.object.isRequired,

  onSelection: React.PropTypes.func,
  onHighlight: React.PropTypes.func
};