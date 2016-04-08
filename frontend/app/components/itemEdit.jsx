import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import * as _ from 'lodash';

import Field from './field';

export default class ItemEdit extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    schema: PropTypes.object,
    permissions: PropTypes.object,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(value, key) {
    const { onChange, item } = this.props;

    console.log('Setting store');

    // did value change?
    if ((item[key] !== value) && onChange) {
      onChange(value, key);
    }
  }
  render() {
    const { schema, item, permissions } = this.props;

    // Filter all readable nonempty fields, or writable fields
    // _.(readable && filled) || writable
    const mapFilter = (arr, mapfun, filterfun) => _.filter(_.map(arr, mapfun), filterfun);

    let form = mapFilter(
      schema.form,
      (group) => ({
        title: group.title,
        fields: mapFilter(
          group.fields,
          (fieldset) => mapFilter(
            fieldset,
            (field) => (
              // Readable and nonempty          // writable
              (_.includes(permissions.view, field) && !_.isEmpty(item[field]))
                || _.includes(permissions.edit, field)
            ) && {
              // Then add the field, with all info zipped into an object.
              schema: {
                name: field,
                ...schema.properties[field]
              },
              value: item[field],
              writable: _.includes(permissions.edit, field)
            },
            (field) => !!field
          ),
          (fieldset) => !_.isEmpty(fieldset)
        )
      }),
      (group) => !_.isEmpty(group.fields)
    );

    return (
      <form className="content" onSubmit={this.handleSubmit}>
      {_.map(form, (group, i) => (
        <mdl.Card key={i} className="mdl-color--white mdl-shadow--2dp">
          <mdl.CardTitle>
            {group.title}
          </mdl.CardTitle>
          <div className="mdl-card__form">
          {_.map(group.fields, (fieldset, key) => (
            <div key={key} className="fieldset">
            {_.map(fieldset, (field, _key) => (
              <Field
                key={_key}
                field={field.schema}
                tabIndex="0"
                disabled={!field.writable}
                onChange={this.handleChange}
                value={field.value}
              />
            ))}
            </div>
          ))}
          </div>
        </mdl.Card>
      ))}
      </form>
    );
  }
}
