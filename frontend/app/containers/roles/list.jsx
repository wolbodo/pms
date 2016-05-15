import _ from 'lodash';
import React, { PropTypes } from 'react';

import { List, Head, Row } from 'components/list';
import { connect } from 'react-redux';

import * as rolesActions from 'redux/modules/roles';
import * as fieldsActions from 'redux/modules/fields';

@connect((state) => ({
  roles: state.get('roles').toJS(),
  fields: state.get('fields').toJS()
}), {
  create: rolesActions.create,
  fieldsFetch: fieldsActions.fetch,
  rolesFetch: rolesActions.fetch
})
export default class RoleList extends React.Component {
  static propTypes = {
    roles: PropTypes.object,
    fields: PropTypes.object,
    create: PropTypes.func,
    pushState: PropTypes.func,
    fieldsFetch: PropTypes.func,
    rolesFetch: PropTypes.func,
  }
  componentDidMount() {
    this.props.fieldsFetch();
    this.props.rolesFetch();
  }

  render() {
    const { roles, fields, pushState } = this.props;
    const schema = _.get(fields, 'items.roles');

    return (
      <List title="Groepen" buttons={this.renderButtons()}>
        <Head schema={schema} editLink />
        {_.map(roles.items, (row, i) => (
          <Row
            className="click"
            key={i}
            item={row}
            fields={schema.header}
            edit={ () => pushState(`groepen/${i}`) }
          />
        ))}
      </List>
    );
  }
}
