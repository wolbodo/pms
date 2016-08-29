import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';
import * as _ from 'lodash';

import Field from './field';


// Utility function for filtering fields from the schema
// Used for rendering all visible fields.
// Filter all readable nonempty fields, or writable fields
// _.(readable && filled) || writable
const mapFilter = (iterable, mapfun, filterfun) => _.filter(_.map(iterable, mapfun), filterfun);


export default class ItemEdit extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    resource: PropTypes.object, // Resource referenced by schema
    // onChange: PropTypes.func,
  };

  createField(field) {
    // Creates the field for use in the DOM

    const { resource, item } = this.props;
    const fieldSchema = resource.getSchemaForField(field);
    const permissions = resource.getPermissionsForField(item.id, field);

    if ((permissions.view && !_.isEmpty(item[field])) || permissions.edit || permissions.create) {
      // Then add the field, with all info zipped into an object.
      const itemValue = item[field];
      return {
        schema: {
          name: field,
          ...fieldSchema
        },
        resource: resource.getReferencedResource(field),
        value: _.isFunction(itemValue) ? itemValue() : itemValue,
        permissions,
      };
    }
    return null;
  }

  render() {
    const { resource, item } = this.props;

    // const permissions = ((type === 'people') && (item.id === auth.user.user)) ?
    //   _.merge({}, auth.permissions.people.self, auth.permissions.people)
    //   :
    //   _.get(auth, ['permissions', type]);

    let form = mapFilter(
      resource.schema.form,
      (formGroup) => ({
        title: formGroup.title,
        fields: mapFilter(
          formGroup.fields,
          (fieldset) => mapFilter(fieldset, this.createField.bind(this), (field) => !!field),
          (fieldset) => !_.isEmpty(fieldset)
        )
      }),
      (formGroup) => !_.isEmpty(formGroup.fields)
    );

    return (
      <form className="content">
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
                permissions={field.permissions}
                onChange={(value) => resource.updateItem(item.id, value, field.schema.name)}
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
