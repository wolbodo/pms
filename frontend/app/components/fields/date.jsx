import React from 'react';
import * as mdl from 'react-mdl'

import {DatePicker} from 'material-ui';

export default class Date extends React.Component {
    // TODO: OnChange, and properly showing dates
    render() {
        let { name, label, value, disabled,
              onChange, onBlur } = this.props

        return (
        <DatePicker 
            className="datepicker"
            container="dialog"
            autoOk={true}
            disabled={disabled}
            floatingLabelText={label} 
            open={!disabled} 
            style={{
                width: '125px'
            }} 
            textFieldStyle={{
                width: '125px'
            }} />
        );
    }
}