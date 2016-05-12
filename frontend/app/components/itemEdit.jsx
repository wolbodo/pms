import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import * as _ from 'lodash';
import * as schemaUtil from 'schema';

import Field from './field';


// Utility function for filtering fields from the schema
// Used for rendering all visible fields.
// Filter all readable nonempty fields, or writable fields
// _.(readable && filled) || writable
const mapFilter = (iterable, mapfun, filterfun) => _.filter(_.map(iterable, mapfun), filterfun);


export default class ItemEdit extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    schema: PropTypes.object,
    permissions: PropTypes.object,
    resources: PropTypes.object, // Resources referenced by schema
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
    const { schema, item, permissions, resources } = this.props;

    let form = mapFilter(
      schema.form,
      (role) => ({
        title: role.title,
        fields: mapFilter(
          role.fields,
          (fieldset) => mapFilter(
            fieldset,
            (field) => {
              const fieldSchema = _.get(schema, ['properties', field]);
                    // Readable and nonempty          // writable
              if ((_.includes(permissions.view, field) && !_.isEmpty(item[field]))
                    || _.includes(permissions.edit, field)) {
                // Then add the field, with all info zipped into an object.
                return {
                  schema: {
                    name: field,
                    ...fieldSchema
                  },
                  resource: schemaUtil.getReferencedResource(resources, fieldSchema),
                  value: item[field],
                  writable: _.includes(permissions.edit, field)
                };
              }
              return null;
            },
            (field) => !!field
          ),
          (fieldset) => !_.isEmpty(fieldset)
        )
      }),
      (role) => !_.isEmpty(role.fields)
    );

    return (
      <form className="content" onSubmit={this.handleSubmit}>
      {_.map(form, (role, i) => (
        <mdl.Card key={i} className="mdl-color--white mdl-shadow--2dp">
          <mdl.CardTitle>
            {role.title}
          </mdl.CardTitle>
          <div className="mdl-card__form">
          {_.map(role.fields, (fieldset, key) => (
            <div key={key} className="fieldset">
            {_.map(fieldset, (field, _key) => (
              <Field
                key={_key}
                field={field.schema}
                resource={field.resource}
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
