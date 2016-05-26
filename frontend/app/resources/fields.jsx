
import BaseResource from './baseResource';
import actions from 'redux/modules';

export default class FieldsResource extends BaseResource {
  static actions = actions.fields;

  getSchema(resourceSlug) {
    // Returns the schema for the given resourec.
    return this.items.get(resourceSlug).toJS();
  }
}
