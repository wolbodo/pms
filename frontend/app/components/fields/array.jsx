import React, { PropTypes } from 'react';
import _ from 'lodash';
// import AutoComplete from 'material-ui/lib/auto-complete';
// import MenuItem from 'material-ui/lib/menus/menu-item';

import { Chip } from 'components';

export default class Array extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    title: PropTypes.string,
    value: PropTypes.array,
    permissions: PropTypes.object,
    options: PropTypes.array,
    onBlur: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Array'
  };

  constructor(props) {
    super(props);

    this.state = {};
  }

  onChange(index) {
    const { onBlur, value } = this.props;

    if (onBlur) {
      onBlur(
        _.filter(value, (x, i) => i !== index)
      );
    }
  }

  addValue({ target }) {
    const newValue = _.trim(target.textContent);
    const { onBlur, value } = this.props;

    // FIXME: Never assign like this in react...
    target.textContent = undefined; // eslint-disable-line

    if (!_.isEmpty(newValue)) {
      onBlur(
        _(value || []).concat(newValue).value()
      );
    }
  }
  deleteValue() {
    const { onBlur, value } = this.props;

    onBlur(_.slice(value, 0, -1));
  }

  handleKeyPress(event) {
    if (event.key === 'Backspace' && _.isEmpty(event.target.textContent)) {
      this.deleteValue();
    }

    if (event.key === 'Enter') {
      this.addValue(event);
    }
  }

  render() {
    const { title, value } = this.props;
    // Shows an array of strings for now.
    // Get the react internal id to create the id.
    return (
      <div className="chip-list" onClick={() => this._input && this._input.focus()}>
        <div>
        { _.map(value || [], (item, i) => (
          <Chip key={i}>
            {item}
            <i className="material-icons"
              onClick={() => this.onChange(i)}
            >cancel</i>
          </Chip>
        ))}
          <p ref={(el) => {this._input = el;}}
            contentEditable="true"
            onBlur={(event) => this.addValue(event)}
            onKeyPress={(event) => this.handleKeyPress(event)}
            onKeyDown={(event) => this.handleKeyPress(event)}
          />
        </div><label className="chip-list--label">{title}</label>
      </div>
    );
  }
}
