import React from 'react';
import * as mdl from 'react-mdl'

import DatePicker from 'material-ui/lib/date-picker/date-picker';

export default class Date extends React.Component {
    // TODO: OnChange, and properly showing dates
    render() {
        let { name, label, value, disabled,
              onChange, onBlur } = this.props

        return (
            <p>{name}</p>
        );
            // <DatePicker 
            //     className="datepicker"
                // container="dialog"
                // onShow={function () {return disabled && this.onRequestClose()} }
                // autoOk={true}
                // disabled={disabled}
                // floatingLabelText={label} 
                // open={!disabled} 
                // style={{
                //     width: '125px'
                // }} 
                // textFieldStyle={{
                //     width: '125px'
                // }} />
    }
}