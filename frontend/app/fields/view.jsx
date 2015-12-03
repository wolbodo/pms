import React, { PropTypes } from 'react';
import update from 'react/lib/update';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';
import classnames from 'classnames';

import _ from 'lodash';

import {List, Head, Row} from '../view/list';

import member_schema from '../member/schema.json';
import schema from './schema.json';

import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
// import Backend from 'react-dnd-touch-backend';
import Backend from 'react-dnd-html5-backend';

const ItemTypes = {
  FIELD: Symbol('field'),
  GROUP: Symbol('group')
};


function getDragDirection(component, monitor) {

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%
    return {
      up:    hoverClientY < hoverMiddleY,
      down:  hoverClientY > hoverMiddleY,
      left:  hoverClientX < hoverMiddleX,
      right: hoverClientX > hoverMiddleX
    };
}
// Index depths
const FIELD = 2,
      SET   = 1,
      GROUP = 0;


/**
 * Implements the drag source contract.
 */
const fieldSource = {
  beginDrag(props) {
    console.log("returning dragged field item", props);
    return {
      index: props.index,
      field: props.field,
      moveField: props.moveField
    };
  }
};
const fieldTarget = {

  hover(props, monitor, component) {
    var item = monitor.getItem();
    const dragIndex = item.index;
    const hoverIndex = props.index;

    // If wer're dragging betweend fieldsets, dont handle this.
    if (!_.isEqual(dragIndex.slice(0, 2), hoverIndex.slice(0, 2))) {
      return;
    }

    // Don't replace items with themselves
    if (dragIndex[2] === hoverIndex[2]) {
      return;
    }

    const direction = getDragDirection(component, monitor);
    console.log("Dragging:", direction.left ? 'left' : (direction.right ? 'right' : '---'), 'of hover field');

    // dropping on field, so 2nd item in indexes.
    let hFieldIndex = hoverIndex[2],
        dFieldIndex = dragIndex[2];

    // Dragging downwards
    if (dFieldIndex < hFieldIndex && direction.left) {
      return;
    }

    // Dragging upwards
    if (dFieldIndex > hFieldIndex && direction.right) {
      return;
    }

    // Time to actually perform the action
    props.moveField(dFieldIndex, hFieldIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    item.index = hoverIndex;
  },
}

// const groupSource = {
//   beginDrag(props) {
//     console.log("returning dragged group item", props);
//     return {
//       index: props.index,
//       field: props.field
//     };
//   }
// };

const fieldSetTarget = {

  hover(props, monitor, component) {
    var item = monitor.getItem();
    const dragIndex = item.index;
    const hoverIndex = props.index;


    if (!component.props.isOver) {
      return;
    }

    const direction = getDragDirection(component, monitor);
    console.log("Dragging:", direction.up ? 'up' : (direction.down ? 'down' : '---'), 'of hover fieldset');


    // dragging over fieldset, so 1st item in indexes.
    let hFieldIndex = hoverIndex[1],
        dFieldIndex = dragIndex[1];

    // Dragging downwards
    if (dFieldIndex < hFieldIndex && direction.down) {
      return;
    }

    // Dragging upwards
    if (dFieldIndex > hFieldIndex && direction.up) {
      return;
    }

    // Time to actually perform the action
    // add the new field into the first element of the new fieldset
    // var hIndex = hoverIndex.concat(0);
    // props.moveField(dragIndex, hIndex);

    // item.index = hIndex


  }
}


const groupTarget = {

  // hover(props, monitor, component) {
  //   const dragIndex = monitor.getItem().index;
  //   const hoverIndex = props.index;

  //   // Don't replace items with themselves
  //   if (dragIndex === hoverIndex) {
  //     return;
  //   }
  //   // console.log("move group:", dragIndex, hoverIndex);

  // }
};


function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({shallow: true})
  };
}
function sourceCollect(connect, monitor) {
  return {
	  connectDragSource: connect.dragSource(),
	  isDragging: monitor.isDragging()
  };
}




class Field extends React.Component{
  static propTypes = {
    // Injected by React DnD:
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  render() {
    const { isDragging, connectDragSource, connectDropTarget, field, offset, isOver } = this.props;
   
    return connectDragSource(connectDropTarget(
      <div className={classnames('field', {'hover': isOver})} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {field.label}
      </div>
    ));
  }
}
Field = DragSource(ItemTypes.FIELD, fieldSource, sourceCollect)(Field);
Field = DropTarget(ItemTypes.FIELD, fieldTarget, targetCollect)(Field);




class FieldSet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fields: this.props.fields
    }
  }
  moveField(dragIndex, hoverIndex) {

    
    
    // const { fields } = this.state;
    // const dragField = fields[dragIndex];
    // const { index } = this.props;

    // this.props.moveField(index.concat(dragIndex), index.concat(hoverIndex));


  }

  componentWillReceiveProps(props) {
    if (!_.isEqual(props.fields, this.props.fields)) {
      this.setState({
        fields: props.fields
      });
    }
  }
  render () {
    const { isOver, connectDropTarget, index} = this.props;
    const {fields } = this.state;

    return connectDropTarget(
      <div className={classnames('fieldset', {'hover': isOver})} >
      { _.map(fields, (field, i) =>
        <Field 
          key={i} 
          index={index.concat(i)} 
          field={member_schema.fields[field]} 
          moveField={this.moveField.bind(this)}/>
      )}
      </div>
    );
  }
}
FieldSet = DropTarget(ItemTypes.FIELD, fieldSetTarget, targetCollect)(FieldSet);



class Group extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fieldsets: this.props.fieldsets
    }
  }
  componentWillReceiveProps(props) {
    if (!_.isEqual(props.fieldsets, this.props.fieldsets)) {
      this.setState({
        fieldsets: props.fieldsets
      });
    }
  }
  moveField(dragIndex, hoverIndex) {

    this.props.moveField(dragIndex, hoverIndex);
  }
	render() {
    const { isDragging, isOver, connectDragSource, 
      connectDropTarget, title, offset, index} = this.props;
    const { fieldsets } = this.state;
		
		return connectDropTarget(
      <div className={classnames('group', {hover: isOver})} style={{ opacity: isDragging ? 0.5 : 1 }}>
        { title }

        { _.map(fieldsets, (fieldset, i) => 
          <FieldSet 
            fields={fieldset} 
            moveField={this.moveField.bind(this)} 
            key={i} 
            index={[index, i]} />
        )}
      </div>);
	}
}
// Group = DragSource(ItemTypes.GROUP, groupSource, sourceCollect)(Group);
Group = DropTarget(ItemTypes.FIELD, groupTarget, targetCollect)(Group);


function createStateUpdate(dragIndex, hoverIndex, field) {
  // creates a update compatible object for moving the field from dragIndex to hoverIndex

  // first remove the dragged Element from it's dragindex.
  // then add it to the hoverindex.

  var diff = {};
  var drag_diff = diff,
      hover_diff = diff;

  var [g_id_drag, fs_id_drag, f_id_drag] = dragIndex,
      [g_id_hover, fs_id_hover, f_id_hover] = hoverIndex;

  // find where the indexes differ, there should be 1 place.
  var moveDepth;
  for (let i=0; i<3; i++) {

    if (dragIndex[i] !== hoverIndex[i]) {
      // if (moveDepth) {
        // throw "Unexpected, moves in 2 places";
      // }

      moveDepth = i;
    }
  }

  if (moveDepth === 0) {
    // moved from group
    return {
      groups: {
        [dragIndex[0]]: {
          fields: {
            [dragIndex[1]]: {
              $splice: [
                [dragIndex[2], 1]
              ]
            }
          }
        },
        [hoverIndex[0]]: {
          fields: {
            [hoverIndex[1]]: {
              $splice: [
                [hoverIndex[2], 0, field]
              ]
            }
          }
        }
      }
    };
  } else if (moveDepth === 1) {
    return {
      groups: {
        [dragIndex[0]]: {
          fields: {
            [dragIndex[1]]: {
              $splice: [
                [dragIndex[2], 1]
              ]
            }, 
            [hoverIndex[1]]: {
              $splice: [
                [hoverIndex[2], 0, field]
              ]
            }
          }
        }
      }
    };
  } else if (moveDepth === 2) {
    return {
      groups: {
        [dragIndex[0]]: {
          fields: {
            [dragIndex[1]]: {
              $splice: [
                [dragIndex[2], 1],
                [hoverIndex[2], 0, field]
              ]
            }
          }
        }
      }
    };
  }
}

class FieldsView extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      groups: member_schema.form
    }
	}

  moveField(dragIndex, hoverIndex) {
    const field = _.get(this.state.groups, [dragIndex[0], 'fields', dragIndex[1], dragIndex[2]]);

    console.log("Dragging field", field, "fromto", dragIndex, hoverIndex);

    this.setState(update(this.state, createStateUpdate(dragIndex, hoverIndex, field)));
  }
  componentWillReceiveProps(props) {
    if (!_.isEqual(props.groups, this.props.groups)) {
      this.setState({
        groups: props.groups
      });
    }
  }

	render() {
		var fields = member_schema.fields;
		var form = member_schema.form;
    const {groups} = this.state;

		return (

			<mdl.Card className='content fieldsview mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>Alle velden</mdl.CardTitle>
				<mdl.CardText>
					{ _.map(groups, (group, i) => 
						<Group 
              key={i} 
              index={i} 
              moveField={this.moveField.bind(this)} 
              title={group.title} 
              fieldsets={group.fields} />
					)}
				</mdl.CardText>
			</mdl.Card>

		);
	}	
}

export default DragDropContext(Backend)(FieldsView);

