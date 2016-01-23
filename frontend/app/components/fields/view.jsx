import React, { PropTypes } from 'react';
import update from 'react/lib/update';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';
import classnames from 'classnames';
import {Link} from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import {List, Head, Row} from 'components/view/list';

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
      moveField: props.moveField,
      addSet: props.addSet
    };
  }
};
const fieldTarget = {

  hover(props, monitor, component) {
    const item = monitor.getItem();
    const direction = getDragDirection(component, monitor);

    if ( // were working on the same fieldset
          (item.index[GROUP] === props.index[GROUP])
           &&
          (item.index[SET] === props.index[SET])
           &&
          (
            // if items are being dropped on the same spot
            (_.isEqual(item.index, props.index)) 
            ||
            // if items will return on the same spot.
            (item.index[FIELD] + (direction.left ? 1 : -1)  === props.index[FIELD])
          )
        ) {

      component.setState({
        direction: undefined
      });
      return;
    }




    component.setState({
      direction: direction
    });
  },
  drop(props, monitor, component) {
    const item = monitor.getItem();
    const direction = getDragDirection(component, monitor);
    var toIndex = props.index;

    if ( // were working on the same fieldset
          (item.index[GROUP] === props.index[GROUP])
           &&
          (item.index[SET] === props.index[SET])
           &&
          (
            // if items are being dropped on the same spot
            (_.isEqual(item.index, props.index)) 
            ||
            // if items will return on the same spot.
            (item.index[FIELD] + (direction.left ? 1 : -1)  === props.index[FIELD])
          )
        ) {

      component.setState({
        direction: undefined
      });
      return;
    }

    if (direction.right) {
      // we should be adding behind the target
      toIndex[FIELD] += 1;
    }

    props.moveField(item.index, toIndex);
  }
}

const fieldSetTarget = {

  hover(props, monitor, component) {

    const direction = getDragDirection(component, monitor);

    component.setState({
      direction: direction
    });
  },
  drop(props, monitor, component) {
    const item = monitor.getItem();

    if (!monitor.isOver({shallow:true})) {
      // its being handle by fields
      return;
    }

    const direction = component.state.direction;
    var toIndex = props.index;

    if (direction.down) {
      // we should be adding behind the target
      toIndex[SET] += 1;
    }

    props.addSet(item.index, toIndex);
  }
}

const groupSource = {
  beginDrag(props) {
    index: props.index
  }
}
const groupTarget = {
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

  constructor(props) {
    super(props);

    this.mouseOver = this.mouseOver.bind(this);
    this.mouseOut = this.mouseOut.bind(this);

    this.state = {};
  }

  mouseOver() {
      this.setState({hover: true});
  }

  mouseOut() {
      this.setState({hover: false});
  }


  render() {
    const { isDragging, connectDragSource, connectDropTarget, 
            field, offset, isOver } = this.props;
    const { direction } = this.props;
    const {hover} = this.state;

    return connectDragSource(connectDropTarget(
      <div 
        onMouseOver={this.mouseOver}
        onMouseOut={this.mouseOut}
        className={classnames('field', isOver && direction)} 
        style={{ opacity: isDragging ? 0.5 : 1 }}>
        <Link to={`/velden/${field.name}`}>
        {field.label}
        </Link>
      </div>
    ));
  }
}
Field = DragSource(ItemTypes.FIELD, fieldSource, sourceCollect)(Field);
Field = DropTarget(ItemTypes.FIELD, fieldTarget, targetCollect)(Field);


class FieldSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render () {
    const { isOver, connectDropTarget, index, fields, moveField, addSet, schema} = this.props;
    const {direction} = this.state;

    return connectDropTarget(
      <div className={classnames('fieldset', isOver && direction) } >
      { _.map(fields, (field, i) =>
        <Field 
          key={i} 
          index={index.concat(i)} 
          field={schema.fields[field]} 
          moveField={moveField}
          addSet={addSet} />
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

  render() {
    const { isDragging, isOver, connectDragSource, 
      connectDropTarget, title, offset, index, 
      moveField, addSet, schema } = this.props;
    const { fieldsets } = this.state;
    
    return connectDropTarget(
        <div>
            <mdl.Card className={classnames('group', 'mdl-color--white', 'mdl-shadow--2dp', {hover: isOver})}>
              <mdl.CardTitle>
                { title }
              </mdl.CardTitle>
              <mdl.CardText>
                { _.map(fieldsets, (fieldset, i) => 
                  <FieldSet 
                    fields={fieldset} 
                    moveField={moveField} 
                    schema={schema}
                    addSet={addSet} 
                    key={i} 
                    index={[index, i]} />
                )}
              </mdl.CardText>
            </mdl.Card>
          </div>);
  }
}
// Group = DragSource(ItemTypes.GROUP, groupSource, sourceCollect)(Group);
Group = DropTarget(ItemTypes.FIELD, groupTarget, targetCollect)(Group);


class FieldsView extends React.Component {
  constructor(props) {
    super(props);

    this.moveField = this.moveField.bind(this);
    this.addSet = this.addSet.bind(this);
  }

  moveField(fromIndex, toIndex) {
    const {fields} = this.props

    const field = _.get(fields.schemas.member.form, [fromIndex[GROUP], 'fields', fromIndex[1], fromIndex[2]]);

    console.log("Dragging field", field, "fromto", fromIndex, toIndex);

    let fromFieldset = fields.schemas.member.form[fromIndex[GROUP]].fields[fromIndex[SET]],
        toFieldset = fields.schemas.member.form[toIndex[GROUP]].fields[toIndex[SET]];

    // mind the order, 
    if (fromIndex[FIELD] > toIndex[FIELD]) {
      // remove the field first, then add

      fromFieldset.splice(fromIndex[FIELD], 1);
      toFieldset.splice(toIndex[FIELD], 0, field);
    } else {
      // other way around
      toFieldset.splice(toIndex[FIELD], 0, field);
      fromFieldset.splice(fromIndex[FIELD], 1);
    }

    // remove old fieldset if it was empty
    var fieldsets = fields.schemas.member.form[fromIndex[GROUP]].fields;
    if (_.isEmpty(fieldsets[fromIndex[SET]])) {
      fieldsets.splice(fromIndex[SET], 1);
    }
  }

  addSet(fromIndex, toIndex) {
    const {fields} = this.props

    const field = _.get(fields.schemas.member.form, [fromIndex[GROUP], 'fields', fromIndex[1], fromIndex[2]]);

    console.log("adding set", field, "fromto", fromIndex, toIndex);

    // remove from old place.
    fields.schemas.member.form[fromIndex[GROUP]].fields[fromIndex[SET]].splice(fromIndex[FIELD], 1);
    // add in the new place.
    fields.schemas.member.form[toIndex[GROUP]].fields.splice(toIndex[SET], 0, [field]);

    // remove old fieldset if it was empty
    var fieldsets = fields.schemas.member.form[fromIndex[GROUP]].fields;
    if (_.isEmpty(fieldsets[fromIndex[SET]])) {
      fieldsets.splice(fromIndex[SET], 1);
    }
  }

  render() {
    const {fields} = this.props;

    // <mdl.CardTitle>Alle velden</mdl.CardTitle>
    return (
      <div className='content fieldsview'>
        { _.map(fields.schemas.member.form, (group, i) => 
          <Group 
            key={i} 
            index={i} 
            moveField={this.moveField}
            schema={fields.schemas.member}
            addSet={this.addSet} 
            title={group.title} 
            fieldsets={group.fields} />
        )}
      </div>
    );
  } 
}

function mapStateToProps(state) {
  const { fields } = state

  return {
    fields
  }
}


export default connect(mapStateToProps)(DragDropContext(Backend)(FieldsView));

