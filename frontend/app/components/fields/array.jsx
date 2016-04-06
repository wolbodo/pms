import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import { Chip } from 'components';

export default class Array extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    onBlur: PropTypes.func.isRequired
  };
  static defaultProps = {
    label: 'Array'
  };

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

  render() {
    const { name, label, value } = this.props;

    // Shows an array of strings for now.
    return (
      <div className="chip-list" onClick={() => {
      // focus the p element when clicking on the chip-list
        ReactDOM
          .findDOMNode(this)
          .querySelector(`#chiplist-${name}`)
          .focus();
      }}
      >
        <div>
        { _.map(value || [], (item, i) => (
          <Chip key={i}>
            {item}
            <i className="material-icons"
              onClick={() => this.onChange(i)}
            >cancel</i>
          </Chip>
        ))}
        <p id={`chiplist-${name}`}
          contentEditable="true"
          onBlur={(event) => this.addValue(event)}
          onKeyPress={(event) => (event.key === 'Enter') && this.addValue(event)}
          onKeyDown={(event) =>
            (event.key === 'Backspace' && _.isEmpty(event.target.textContent))
            && this.deleteValue()
          }
        />
        </div> <label className="chip-list--label" htmlFor={`chiplist-${name}`}>{label}</label>
      </div>
    );
  }
}
