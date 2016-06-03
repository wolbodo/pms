import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import AutoComplete from 'material-ui/lib/auto-complete';
// import MenuItem from 'material-ui/lib/menus/menu-item';

import { Chip } from 'components';


export default class List extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    title: PropTypes.string,
    value: PropTypes.array,
    permissions: PropTypes.object,
    target: PropTypes.string,
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    resource: PropTypes.object.isRequired,
    displayValue: PropTypes.string,
  };
  static defaultProps = {
    title: 'Array'
  };

  constructor(props) {
    super(props);

    this.state = {
      newValue: ''
    };
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
    const { title, value, displayValue, resource, onBlur, target, permissions } = this.props;
    const { newValue } = this.state;

    const listToDisplay = (item) => _.get(
                                resource.get(
                                  _.get(item.$ref.match(`^\\/${target}\\/(\\d+)$`), 1)
                                ), _.toPath(displayValue), `@${item.$ref}`);

    // Filter based on possible permissions.
    const resourceReferences = resource._items
      .filter((item) => (
        _.isEmpty(permissions.filter) || _.includes(permissions.filter, item.get('id'))
      ))
      .map((item) => ({ $ref: `/${target}/${item.get('id')}` }))
      .toJS();

    // TODO: Add filtering by permissions.filter
    // Shows an array of strings for now.
    return (
      <div
        className="link-list"
        onClick={() => this._input && ReactDOM.findDOMNode(this._input).focus()}
      >
        <div>
        { _.map(_.map(value, listToDisplay), (item, i) => (
          <Chip key={i}>
            {item}
            {(permissions.edit) && (
              <i className="material-icons"
                onClick={() => onBlur(_.filter(value, (val, key) => key !== i))}
              >cancel</i>
            )}
          </Chip>
        ))}
        {(permissions.edit) && (
          <AutoComplete className="auto-complete"
            ref={(el) => {this._input = el;}}
            floatingLabelText="Nieuw..."
            searchText={newValue}
            filter={AutoComplete.fuzzyFilter}
            onUpdateInput={(val) => {
              // Keep updating, so we can clear it...
              this.setState({
                newValue: val
              });
            }}
            onNewRequest={(val) => {
              this.setState({
                newValue: ''
              });
              onBlur(
                _(value)
                .concat(_.find(resourceReferences, (opt) => listToDisplay(opt) === val))
                .uniqBy('$ref')
                .value()
              );
            }}
            dataSource={_.map(resourceReferences, listToDisplay)}
          />
        )}
        </div><label className="link-list--label">{title}</label>
      </div>
    );
  }
}
