
import React from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash'
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux'
import actions from 'actions'


import {Dialog, FlatButton, Divider} from 'material-ui';

class HeaderBar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            dialogOpen:false
        }
    }

    showDialog() {
      this.setState({
        dialogOpen:true
      });
    }
    closeDialog() {
        this.setState({
            dialogOpen:false
        })
    }

    renderDialog() {
        let {members, groups, fields, dispatch} = this.props
        let {dialogOpen} = this.state

        const actions = [
          <FlatButton
            label="Annuleren"
            secondary={true}
            onTouchTap={() => this.closeDialog()}
          />,
          <FlatButton
            label="Opslaan"
            primary={true}
            onTouchTap={() => this.closeDialog()}
          />,
        ];
          
        return (
            <Dialog
              title="Opslaan wijzigingen"
              className="change-dialog"
              actions={actions}
              modal={false}
              open={dialogOpen}
              onRequestClose={() => this.closeDialog()}
            >
            { !_.isEmpty(members.updates) && (
                <div>
                    <h6>Leden</h6>
                    <ul>
                        {_.map(members.updates, (member, id) => (
                            <li key={id}>
                                <p>{members.items[id].nickname} Gewijzigd</p>
                                <ul>
                                    {_.map(member, (value, key) => (
                                        <li key={key}>{key}: {value}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            { !_.isEmpty(groups.updates) && (
                <div>
                    <h6>Groepen</h6>
                    <ul>
                        {_.map(groups.updates, (group, id) => (
                            <li key={id}>
                                <p>{groups.items[id].name} Gewijzigd</p>
                                <ul>
                                    {_.map(group, (value, key) => (
                                        <li key={key}>{key}: {value}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </Dialog>
        )
    }

    saveCurrent() {
        let {members, groups, fields, dispatch} = this.props
        dispatch(actions.members.commit())
    }

    render() {
        let {members, groups, fields, dispatch} = this.props
        let changed = !_.isEmpty(members.updates) || !_.isEmpty(groups.updates) || !_.isEmpty(fields.updates)

        return (
            <div className='headerBar'>
                { changed && (
                    <mdl.Button 
                        ripple 
                        id="header-save-button" 
                        onClick={() => this.saveCurrent()} >
                        Opslaan
                    </mdl.Button>
                ) || (<div />)}
                {this.renderDialog()}
            </div>
        )
    }
}

function mapStateToProps(state) {
  return {
    ...state.app.toJS()
  }
}



export default connect(mapStateToProps)(HeaderBar);