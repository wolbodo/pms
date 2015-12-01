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
      field: props.field
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
const groupSource = {
  beginDrag(props) {
    console.log("returning dragged group item", props);
    return {
      index: props.index,
      field: props.field
    };
  }
};



const cardTarget = {
  // hover(props, monitor, component) {
  //   const dragIndex = monitor.getItem().index;
  //   const hoverIndex = props.index;

  //   // Don't replace items with themselves
  //   if (dragIndex === hoverIndex) {
  //     return;
  //   }

  //   // Determine rectangle on screen
  //   const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

  //   // Get vertical middle
  //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  //   // Determine mouse position
  //   const clientOffset = monitor.getClientOffset();

  //   // Get pixels to the top
  //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  //   // Only perform the move when the mouse has crossed half of the items height
  //   // When dragging downwards, only move when the cursor is below 50%
  //   // When dragging upwards, only move when the cursor is above 50%


  //   console.log("movecard:", dragIndex, hoverIndex);

  //   // Dragging downwards
  //   if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //     return;
  //   }

  //   // Dragging upwards
  //   if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //     return;
  //   }

  //   // Time to actually perform the action
  //   // props.moveCard(dragIndex, hoverIndex);

  //   // Note: we're mutating the monitor item here!
  //   // Generally it's better to avoid mutations,
  //   // but it's good here for the sake of performance
  //   // to avoid expensive index searches.
  //   // monitor.getItem().index = hoverIndex;
  // }
};



const groupTarget = {
  // hover(props, monitor, component) {
  //   const dragIndex = monitor.getItem().index;
  //   const hoverIndex = props.index;

  //   console.log("movecard:", dragIndex, hoverIndex);
  //   // Don't replace items with themselves
  //   if (dragIndex === hoverIndex) {
  //     return;
  //   }

  //   // Determine rectangle on screen
  //   const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

  //   // Get vertical middle
  //   const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  //   // Determine mouse position
  //   const clientOffset = monitor.getClientOffset();

  //   // Get pixels to the top
  //   const hoverClientY = clientOffset.y - hoverBoundingRect.top;

  //   // Only perform the move when the mouse has crossed half of the items height
  //   // When dragging downwards, only move when the cursor is below 50%
  //   // When dragging upwards, only move when the cursor is above 50%



  //   // Dragging downwards
  //   if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //     return;
  //   }

  //   // Dragging upwards
  //   if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //     return;
  //   }

  //   // Time to actually perform the action
  //   // props.moveCard(dragIndex, hoverIndex);

  //   // Note: we're mutating the monitor item here!
  //   // Generally it's better to avoid mutations,
  //   // but it's good here for the sake of performance
  //   // to avoid expensive index searches.
  //   // monitor.getItem().index = hoverIndex;
  // },
	drop(props, monitor, component) {
    console.log("Group:Drop: ", monitor.getItemType(), monitor.getItem(), monitor.didDrop())
		// return props;
	}
}
const fieldSetTarget = {
  hover(props, monitor, component) {
    const item = monitor.getItem();
    const dragIndex = item.index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }
    console.log("movecard:", item, dragIndex, hoverIndex);
    // debugger;

    // Time to actually perform the action
    // props.moveCard(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    // monitor.getItem().index = hoverIndex;

  },
  drop(props, monitor, component) {
    console.log("Fieldset:Drop: ", monitor.getItemType(), monitor.getItem(), monitor.didDrop())
    // return props;
  }
}


function targetCollect(connect, monitor) {
  return {
    offset: monitor.getSourceClientOffset(),
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}
function sourceCollect(connect, monitor) {
  return {
    offset: monitor.getSourceClientOffset(),
	  connectDragSource: connect.dragSource(),
	  isDragging: monitor.isDragging()
  };
}

class Field extends React.Component{
  static propTypes = {
    // Injected by React DnD:
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
  };

  render() {
    const { isDragging, connectDragSource, field, offset } = this.props;
   
    return connectDragSource(
      <div className='field' style={{ opacity: isDragging ? 0.5 : 1 }}>
        {field.label}
      </div>
    );
  }
}
Field = DragSource(ItemTypes.FIELD, fieldSource, sourceCollect)(Field);




class FieldSet extends React.Component {
  render () {
    const { isOver, connectDropTarget, fields, offset, index} = this.props;

    return connectDropTarget(
      <div className={classnames('fieldset', {'hover': isOver})} >
      { _.map(fields, (field, i) =>
        <Field key={i}  index={index.concat[i]} field={member_schema.fields[field]}/>
      )}
      </div>
    );
  }
}
FieldSet = DropTarget(ItemTypes.FIELD, fieldSetTarget, targetCollect)(FieldSet);




class Group extends React.Component {
	render() {
	    const { isDragging, isOver, connectDragSource, 
        connectDropTarget, title, fields, offset, index} = this.props;
		
		return connectDropTarget(
			<div className={classnames('group', {hover: isOver})} style={{ opacity: isDragging ? 0.5 : 1 }}>
				{ title }

				{ _.map(fields, (fieldset, i) => 
          <FieldSet fields={fieldset} key={i} index={[index, i]} />
				)}
			</div>
		);
	}
}
// Group = DragSource(ItemTypes.GROUP, groupSource, sourceCollect)(Group);
Group = DropTarget(ItemTypes.FIELD, groupTarget, targetCollect)(Group);




class FieldsView extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		var fields = member_schema.fields;
		var form = member_schema.form;

		return (

			<mdl.Card className='content fieldsview mdl-color--white mdl-shadow--2dp'>
				<mdl.CardTitle>Alle velden</mdl.CardTitle>
				<mdl.CardText>
					{ _.map(form, (group, i) => 
						<Group key={i} index={i} title={group.title} fields={group.fields} />
					)}
				</mdl.CardText>
			</mdl.Card>

		);
	}	
}

export default DragDropContext(Backend)(FieldsView);

