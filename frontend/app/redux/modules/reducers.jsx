import { combineReducers } from 'redux-immutable';

import auth from './auth';
import fields from './fields';
import groups from './groups';
import people from './people';
import permissions from './permissions';
import routing from './routing';

export default combineReducers({
  auth,
  fields,
  groups,
  people,
  permissions,
  routing
});
