import React from 'react';
import * as mdl from 'react-mdl'

import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

export default class Enum extends React.Component {

	render() {
        let { name, label, value, disabled, options,
              onChange, onBlur } = this.props

        return (
            <SelectField
                className="selectfield"
                floatingLabelText={label} 
                value={value}
                onChange={(ev, i, option) => onChange(option.payload)}
                onBlur={(ev, i, option) => onBlur(option.payload)}

                disabled={disabled}>
                {_.map(options, (field, key) => (
                	<MenuItem
                		key={key}
                		value={key}
                		primaryText={field}
                		/>
                ))}
            </SelectField>
        );
	}
}