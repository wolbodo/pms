
import React from 'react';
import * as mdl from 'react-mdl';
import _ from 'lodash'
import { connect } from 'react-redux';
import { push } from 'react-router-redux'
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

    // Deprecated: but useful for modals and such
    renderDialog() {
        let {people, groups, fields, dispatch} = this.props
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
            { !_.isEmpty(people.updates) && (
                <div>
                    <h6>Leden</h6>
                    <ul>
                        {_.map(people.updates, (person, id) => (
                            <li key={id}>
                                <p>{people.items[id].nickname} Gewijzigd</p>
                                <ul>
                                    {_.map(person, (value, key) => (
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

    render() {
        let {people, groups, fields, auth, dispatch, route} = this.props
        let changed = !_.isEmpty(people.updates) || !_.isEmpty(groups.updates) || !_.isEmpty(fields.updates)
        
        return (
            <div className='headerBar'>
            {changed && (
                <mdl.Button 
                    ripple 
                    id="header-save-button" 
                    onClick={() => dispatch(actions.people.commit(auth.token))} >
                    Opslaan
                </mdl.Button>
            )}
            {changed && (
                <mdl.Button 
                    ripple 
                    colored
                    onClick={() => dispatch(actions.people.revert())} >
                    Annuleren
                </mdl.Button>
            )}
            <div className="spacer"></div>
            {route.name === "Mensen" && (
                <mdl.Button 
                    className="action end"
                    ripple 
                    onClick={() => dispatch(actions.people.create())} >
                    Nieuw persoon
                </mdl.Button>
            )}
            {route.name === "Groepen" && (
                <mdl.Button 
                    className="action end"
                    ripple 
                    onClick={() => dispatch(actions.groups.create())} >
                    Nieuwe groep
                </mdl.Button>
            )}
            {route.name === "Velden" && (
                <mdl.Button 
                    className="action end"
                    ripple 
                    onClick={() => dispatch(actions.fields.create())} >
                    Nieuw veld
                </mdl.Button>
            )}


            </div>
        )
    }
}

function mapStateToProps(state) {
  return {
    ...state.toJS()
  }
}



export default connect(mapStateToProps)(HeaderBar);