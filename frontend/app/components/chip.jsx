import React, { PropTypes } from 'react';

const style = {};


export default function Chip({ children }) {
  return (
    <div className="chip" style={style}>
      {children}
    </div>
  );
}
Chip.propTypes = {
  children: PropTypes.arrayOf(PropTypes.node).isRequired
};
