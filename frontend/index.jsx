import React from 'react';
import ReactDOM from 'react-dom';
import members from './members';
import {Grid, Cell,
		DataTable, Layout,
		Header, HeaderRow,
		Tabs, Tab, Content} from 'react-mdl';

// var ReactForms = require('react-forms');
// var Schema = ReactForms.schema.Schema;
// var Property = ReactForms.schema.Property;
// var Form = ReactForms.Form;


class MembersList extends React.Component {
	render() {
		var columns = [
			{name: "firstname", label: "Naam"},
			{name: "lastname", label: "Achternaam"},
			{name: "city", label:"Plaats"},
			{name: "mobile", label:"Mobiel"},
			{name: "email", label:"Email"}
		];


		return (
			<Grid className="mdl-grid--no-spacing mdl-shadow--2dp">
				<Cell col={12}>
					<DataTable columns={columns} data={members}/>
				</Cell>
			</Grid>
		);
	}
}

class MemberEdit extends React.Component {

}

class App extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			activeTab: 0,

			tabs: [{
				label: "Ledenlijst",
				handler: () => (<MembersList/>)
			}, {
				label: "Wijzig gegevens",
				handler: () => (<div>Log uit</div>)
			}, {
				label: "Nieuw lid",
				handler: () => (<div>Log uit</div>)
			}, {
				label: "Log uit",
				handler: () => (<div>Log uit</div>)
			}, {
				label: "Log in",
				handler: () => (<div>Log uit</div>)
			}, 
			]
		}


		this.handleTab = this.handleTab.bind(this);
	}

	handleTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	render() {
		return (
			<Layout fixedHeader>
				<Header>
					<HeaderRow>
						<h3>Wolbodo:ledenlijst</h3>
					</HeaderRow>
					<Tabs activeTab={this.state.activeTab} onChange={this.handleTab} ripple>
						{
							this.state.tabs.map(tab => (
								<Tab>{tab.label}</Tab>
							))
						}
					</Tabs>
				</Header>
				<Content>
					{this.state.tabs[this.state.activeTab].handler()}
				</Content>
			</Layout>

		);
	}
}


ReactDOM.render(
  <App/>,
  document.getElementById('content')
);