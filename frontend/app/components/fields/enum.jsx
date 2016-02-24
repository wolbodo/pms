import React from 'react';

import {SelectField} from 'material-ui';
import MenuItem from 'material-ui/lib/menus/menu-item';

export default class Enum extends React.Component {

    render() {
        let { name, label, value, disabled, options,
              onBlur, style } = this.props

        style = style || {}

        return (
            <SelectField
                className="selectfield"
                floatingLabelText={label} 
                value={value}
                style={style}
                onChange={(ev, i, option) => {
                    onBlur(option)
                }}
                disabled={disabled}
            >
            {_.map(options, (field, key) => (
                <MenuItem
                    style={style}
                    key={key}
                    value={key}
                    primaryText={field}
                    />
            ))}
            </SelectField>
        );
    }
}