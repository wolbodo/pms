// import _ from 'lodash';
import React, { PropTypes } from 'react';

import * as fieldActions from 'redux/modules/fields';
import { connectResources, FieldsResource } from 'resources';

import { Tabs, Tab } from 'react-mdl';
// import { ItemEdit } from 'components';

const FieldsOverview = ({ params, fields, history, updateField, content }) => {
  console.log(params, fields, updateField);
  const active = params.resource || 'people';
  const tabs = ['people', 'fields', 'roles'];
  const activeTab = tabs.indexOf(active);

  return (
    <div className="fields-overview">
      <Tabs
        activeTab={activeTab}
        onChange={(tabId) => history.push(`/velden/${tabs[tabId]}`)}
        ripple
      >
      {tabs.map((resource) => (
        <Tab key={resource}>{resource}</Tab>
      ))}
      </Tabs>
      <section>
        <div className="content">
          { content }
        </div>
      </section>
    </div>
  );
  // return fields.renderItemEdit(fields);
  //   <ItemEdit
  //     schema={fields.items.fields}
  //     permissions={auth.permissions.fields}
  //     item={fields.items.fields[params.veld]}
  //     onChange={(value, key) => updateField('person', params.veld, { [key]: value }) }
  //   />
  // );
};
FieldsOverview.propTypes = {
  params: PropTypes.object,
  fields: PropTypes.object,
  history: PropTypes.object,
  updateField: PropTypes.func,
  content: PropTypes.element,
};

export default connectResources({
  fields: FieldsResource,
}, {
  ...fieldActions
})(FieldsOverview);
