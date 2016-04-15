import React from 'react';

export default class Bin extends React.Component {
  render() {
    return (
      <rect x="0"
            y="0"
            width={this.props.width}
            height={this.props.height}
            fill="yellow"
      />
    )
  }
}

Bin.propTypes = {
  bin: React.PropTypes.object.isRequired,
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired
};