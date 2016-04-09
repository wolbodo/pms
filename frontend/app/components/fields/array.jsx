import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import { Chip } from 'components';

export default class Array extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    title: PropTypes.string,
    value: PropTypes.array,
    disabled: PropTypes.bool,
    getOptions: PropTypes.func,
    onBlur: PropTypes.func.isRequired
  };
  static defaultProps = {
    title: 'Array'
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

  handleKeyPress(event) {
    const { getOptions } = this.props;


    if (event.key === 'Backspace' && _.isEmpty(event.target.textContent)) {
      this.deleteValue();
      this.setState({
        options: null
      });
    }

    if (event.key === 'Enter') {
      this.addValue(event);
    }

    if (getOptions) {
      this.setState({
        options: getOptions(event.target.textContent + event.key)
      });
    }
  }

  render() {
    const { name, title, value } = this.props;

    // Shows an array of strings for now.
    return (
      <div className="chip-list" onClick={() => {
      // focus the p element when clicking on the chip-list
      // Rewite to use refs...
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
          onKeyPress={(event) => this.handleKeyPress(event)}
          onKeyDown={(event) => this.handleKeyPress(event)}
        />
        </div><label className="chip-list--label" htmlFor={`chiplist-${name}`}>{title}</label>
      </div>
    );
  }
}
