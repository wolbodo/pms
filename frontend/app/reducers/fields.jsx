import update from  'react-addons-update';

import initialState from './fields.state.json'
import _ from 'lodash'


// Index depths
const FIELD = 2,
      SET   = 1,
      GROUP = 0;


function moveSchemaField(schema, fromIndex, toIndex) {

    const field = _.get(schema.form, [fromIndex[GROUP], 'fields', fromIndex[1], fromIndex[2]]);

    // mind the order, 
    if (fromIndex[FIELD] > toIndex[FIELD]) {
      // remove the field first, then add

      schema = update(schema, {
        form: {
          [fromIndex[GROUP]]: {
            fields: {
              [fromIndex[SET]]: {
                $splice: [[fromIndex[FIELD], 1]]
              }
            }
          }
        }
      })
      schema = update(schema, {
        form: {
          [toIndex[GROUP]]: {
            fields: {
              [toIndex[SET]]: {
                $splice: [[toIndex[FIELD], 0, field]]
              }
            }
          }
        }
      })
    } else {
      // other way around
      schema = update(schema, {
        form: {
          [toIndex[GROUP]]: {
            fields: {
              [toIndex[SET]]: {
                $splice: [[toIndex[FIELD], 0, field]]
              }
            }
          }
        }
      })
      schema = update(schema, {
        form: {
          [fromIndex[GROUP]]: {
            fields: {
              [fromIndex[SET]]: {
                $splice: [[fromIndex[FIELD], 1]]
              }
            }
          }
        }
      })
    }

    // remove old fieldset if it was empty
    var old_fieldset = schema.form[fromIndex[GROUP]].fields[fromIndex[SET]];
    if (_.isEmpty(old_fieldset)) {
      schema = update(schema, {
        form: {
          [fromIndex[GROUP]]: {
            fields: {
              $splice: [[fromIndex[SET], 1]]
            }
          }
        }
      })
    }
    // return updated schema
    return schema;
}

function createSchemaSet(schema, fromIndex, toIndex) {
  const field = _.get(schema.form, [fromIndex[GROUP], 'fields', fromIndex[1], fromIndex[2]]);

  // remove from old place.
  schema = update(schema, {
    form: {
      [fromIndex[GROUP]]: {
        fields: {
          [fromIndex[SET]]: {
            $splice: [[fromIndex[FIELD], 1]]
          }
        }
      }
    }
  })
  // add in the new place.
  schema = update(schema, {
    form: {
      [toIndex[GROUP]]: {
        fields: {
          $splice: [[toIndex[SET], 0, [field]]]
        }
      }
    }
  })

  // remove old fieldset if it was empty
  var old_fieldset = schema.form[fromIndex[GROUP]].fields[fromIndex[SET]];
  if (_.isEmpty(old_fieldset)) {
    schema = update(schema, {
      form: {
        [fromIndex[GROUP]]: {
          fields: {
            $splice: [[fromIndex[SET], 1]]
          }
        }
      }
    })
  }

  // return updated schema
  return schema;
}


function fieldreducer(state = initialState, action) {
  let schema = state.schemas[action.schema],
    {fromIndex, toIndex} = action;
  switch (action.type) {
    case "FIELDS_MOVE_SCHEMAFIELD":
      return update(state, {
        schemas: {
          [action.schema]: {
            $set: moveSchemaField(schema, fromIndex, toIndex)
          }
        }
      });
    case "FIELDS_CREATE_FIELDSET":
      return update(state, {
        schemas: {
          [action.schema]: {
            $set: createSchemaSet(schema, fromIndex, toIndex)
          }
        }
      });
    case "FIELDS_UPDATE_FIELD":
      return update(state, {
        schemas: {
          [action.schema]: {
            fields: {
              [action.id]: {
                $set: action.field
              }
            }
          }
        }
      })
    default:
      return state;
  }
}


export default fieldreducer