import _ from 'lodash';
import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';

import { List, Head, Row } from 'components/list';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import * as groupsActions from 'redux/modules/groups';
import * as fieldsActions from 'redux/modules/fields';

@connect((state) => ({
  groups: state.get('groups').toJS(),
  fields: state.get('fields').toJS()
}), {
  create: groupsActions.create,
  pushState: push,
  fieldsFetch: fieldsActions.fetch,
  groupsFetch: groupsActions.fetch
})
export default class GroupView extends React.Component {
  static propTypes = {
    groups: PropTypes.object,
    fields: PropTypes.object,
    create: PropTypes.func,
    pushState: PropTypes.func,
    fieldsFetch: PropTypes.func,
    groupsFetch: PropTypes.func,
  }
  componentDidMount() {
    this.props.fieldsFetch();
    this.props.groupsFetch();
  }

  renderButtons() {
    const { create } = this.props;

    return (
      <mdl.IconButton
        name="add"
        onClick={() => create.create()}
      />
    );
  }

  render() {
    const headerFields = ['name', 'description'];
    const { groups, fields, pushState } = this.props;

    return (
      <List title="Groepen" buttons={this.renderButtons()}>
        <Head schema={fields.items.roles} fields={headerFields} editLink />
        {_.map(groups.items, (row, i) => (
          <Row
            className="click"
            key={i}
            item={row}
            fields={headerFields}
            edit={ () => pushState(`groepen/${i}`) }
          />
        ))}
      </List>
    );
  }
}
