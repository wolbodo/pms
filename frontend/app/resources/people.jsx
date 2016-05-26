import BaseResource from './baseResource';
import actions from 'redux/modules';

export default class PeopleResource extends BaseResource {
  static actions = actions.people;
}
