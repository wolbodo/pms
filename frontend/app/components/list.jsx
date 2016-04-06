import React, { PropTypes } from 'react';
import * as mdl from 'react-mdl';

import { Link } from 'react-router';

import _ from 'lodash';

export function List({ title, buttons, children }) {
  const { heads, rows } = _.groupBy(
    _.flatten(children),
    (child) => ((child.type.name === 'Head') ? 'heads' : 'rows')
  );

  return (
    <mdl.Card className="content mdl-color--white mdl-shadow--2dp">
      <mdl.CardMenu>
        {buttons}
      </mdl.CardMenu>
      <mdl.CardTitle>
        {title || 'Lijst'}
      </mdl.CardTitle>
      <mdl.CardText>
        <table className="mdl-data-table mdl-js-data-table">
          <thead>
            {heads}
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </mdl.CardText>
    </mdl.Card>
  );
}
List.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node,
  buttons: PropTypes.object,
};

export function Head({ schema, fields, fieldLink }) {
  return (
    <tr>
      {fields
        .map((fieldname) => schema.properties[fieldname]) // get fields from the fieldname
        .map((field) => (
        <th key={field.id} className="mdl-data-table__cell--non-numeric">
        {
          fieldLink ? (
            <Link to={`${fieldLink}/${field.name}`}>{field.title}</Link>
          ) : field.title
        }
        </th>
      ))}
    </tr>
  );
}
Head.propTypes = {
  schema: PropTypes.object,
  fields: PropTypes.array,
  fieldLink: PropTypes.string,
};

export function Row({ className, item, fields, edit }) {
  return (
    <tr className={className} key={item.name} onClick={edit}>
      {fields.map((field, i) => (
        <td key={i} className="mdl-data-table__cell--non-numeric">
          { item[field] }
        </td>
      ))}
    </tr>
  );
}
Row.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object,
  fields: PropTypes.array,
  edit: PropTypes.func,
};
