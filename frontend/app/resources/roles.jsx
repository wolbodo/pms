
import BaseResource from './baseResource';
import actions from 'redux/modules';


export default class RolesResource extends BaseResource {
  static actions = actions.roles;
}
