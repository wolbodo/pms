
import React from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash'
import { connect } from 'react-redux';
import { routeActions } from 'react-router-redux'


import {Popover, Dialog, FlatButton} from 'material-ui';

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

    render() {
        let {members, groups, fields, dispatch} = this.props
        let {dialogOpen} = this.state

        let changed = !_.isEmpty(members.updates) || !_.isEmpty(groups.updates) || !_.isEmpty(fields.updates)
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
            <div className='headerBar'>
                { changed && (
                    <mdl.Button 
                        ripple 
                        id="header-save-button" 
                        onClick={e => this.showDialog()} >
                        Opslaan
                    </mdl.Button>
                ) || (<div />)}
                <Dialog
                  title="Opslaan wijzigingen"
                  actions={actions}
                  modal={false}
                  open={dialogOpen}
                  onRequestClose={() => this.closeDialog()}
                >
                {_.map(members.updates, (member, id) => (
                    <p key={id}>{members.items[id].nickname} Gewijzigd</p>
                ))}
                </Dialog>
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