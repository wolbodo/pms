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
  },

  // endDrag: function (props, monitor, component) {
  // 	debugger;
  //   if (!monitor.didDrop()) {
  //   	console.log("Not dropped");
  //     return;
  //   }

  //   // When dropped on a compatible target, do something
  //   var item = monitor.getItem();
  //   var dropResult = monitor.getDropResult();
  //   debugger;
  //   // CardActions.moveCardToList(item.id, dropResult.listId);
  // }
};

const fieldTarget = {

  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // dropping on field, so 2nd item in indexes.
    let hFieldIndex = hoverIndex[2],
        dFieldIndex = dragIndex[2];

    // Dragging downwards
    if (dFieldIndex < hFieldIndex && hoverClientX < hoverMiddleX) {
      return;
    }

    // Dragging upwards
    if (dFieldIndex > hFieldIndex && hoverClientX > hoverMiddleX) {
      return;
    }

    // Time to actually perform the action
    props.moveField(hFieldIndex, dFieldIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
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
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    console.log("move fieldset:", dragIndex, hoverIndex);
  }
}


const groupTarget = {

  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    console.log("move group:", dragIndex, hoverIndex);

  }
};


//   //   const dragIndex = monitor.getItem().index;
//   //   const hoverIndex = props.index;

//   //   console.log("movecard:", dragIndex, hoverIndex);
//   //   // Don't replace items with themselves
//   //   if (dragIndex === hoverIndex) {
//   //     return;
//   //   }

//   //   // Determine rectangle on screen
//   //   const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

//   //   // Get vertical middle
//   //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

//   //   // Determine mouse position
//   //   const clientOffset = monitor.getClientOffset();

//   //   // Get pixels to the top
//   //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;

//   //   // Only perform the move when the mouse has crossed half of the items height
//   //   // When dragging downwards, only move when the cursor is below 50%
//   //   // When dragging upwards, only move when the cursor is above 50%



//   //   // Dragging downwards
//   //   if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
//   //     return;
//   //   }

//   //   // Dragging upwards
//   //   if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
//   //     return;
//   //   }

//   //   // Time to actually perform the action
//   //   // props.moveCard(dragIndex, hoverIndex);

//   //   // Note: we're mutating the monitor item here!
//   //   // Generally it's better to avoid mutations,
//   //   // but it's good here for the sake of performance
//   //   // to avoid expensive index searches.
//   //   // monitor.getItem().index = hoverIndex;
//   // },
// 	drop(props, monitor, component) {
//     console.log("Group:Drop: ", monitor.getItemType(), monitor.getItem(), monitor.didDrop())
// 		// return props;
// 	}
// }

function targetCollect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
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
    const { isDragging, connectDragSource, connectDropTarget, field, offset } = this.props;
   
    return connectDragSource(connectDropTarget(
      <div className='field' style={{ opacity: isDragging ? 0.5 : 1 }}>
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
    
    const { fields } = this.state;
    const { index } = this.props;
    const dragField = fields[dragIndex];

    console.log("move field:", dragIndex, hoverIndex, fields, dragField);

    this.props.moveField(this.index, dragIndex, hoverIndex, dragField);
  }

  componentWillReceiveProps(props) {
    if (_.isEqual(props.fields, this.props.fields)) {
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
        <Field key={i} index={index.concat(i)} field={member_schema.fields[field]} moveField={this.moveField.bind(this)}/>
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
    if (_.isEqual(props.fieldsets, this.props.fieldsets)) {
      this.setState({
        fieldsets: props.fieldsets
      });
    }
  }
  moveField(fieldsetIndex, itemIndex, newIndex, field) {

    this.setState(update(this.state, {
      fieldsets : {
        [fieldsetIndex]: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragField]
          ]
        }
      }
    }));
  }
	render() {
	    const { isDragging, isOver, connectDragSource, 
        connectDropTarget, title, offset, index} = this.props;
    const { fieldsets } = this.state;
		
		return connectDropTarget(
      <div className={classnames('group', {hover: isOver})} style={{ opacity: isDragging ? 0.5 : 1 }}>
        { title }

        { _.map(fieldsets, (fieldset, i) => 
          <FieldSet fields={fieldset} key={i} index={[index, i]} />
        )}
      </div>);
	}
}
// Group = DragSource(ItemTypes.GROUP, groupSource, sourceCollect)(Group);
Group = DropTarget(ItemTypes.FIELD, groupTarget, targetCollect)(Group);




class FieldsView extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      groups: member_schema.form
    }
	}

  moveField(groupIndex, fieldsetIndex, itemIndex, newIndex, field) {

    this.setState(update(this.state, {
      groups: {
        [groupIndex]: {
          [fieldsetIndex]: {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragField]
            ]
          }
        }
      }
    }));
  }
  componentWillReceiveProps(props) {
    if (_.isEqual(props.groups, this.props.groups)) {
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
						<Group key={i} index={i} title={group.title} fieldsets={group.fields} />
					)}
				</mdl.CardText>
			</mdl.Card>

		);
	}	
}

export default DragDropContext(Backend)(FieldsView);

