import { combineReducers } from 'redux-immutable';

import auth from './auth';
import fields from './fields';
import roles from './roles';
import people from './people';
import permissions from './permissions';
import routing from './routing';

export default combineReducers({
  auth,
  fields,
  roles,
  people,
  permissions,
  routing
});
