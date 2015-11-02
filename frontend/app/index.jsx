import React from 'react';
import ReactDOM from 'react-dom';
import mdl from 'react-mdl';

import members from './members';

import _ from 'lodash';

import MembersList from './membersList';
import MemberEdit from './memberEdit';
import MemberCreate from './memberCreate';

class App extends React.Component {

	constructor(props) {
		super(props);

		var member = members[0];

		this.state = {

			currentPage: 0,

			pages: [{
				label: "Ledenlijst",
				handler: () => (<MembersList members={members}/>)
			}, {
				label: "Wijzig gegevens",
				handler: () => (<MemberEdit member={member}/>)
			}, {
				label: "Nieuw lid",
				handler: () => (<MemberCreate />)
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
		this.setPage = this.setPage.bind(this);
	}

	handleTab(tab) {
		this.setState({
			activeTab: tab
		});
	}

	setPage(page) {
		return () => 
			this.setState({
				currentPage: page
			});
	}

	render() {
					// <mdl.Tabs activeTab={this.state.activeTab} onChange={this.handleTab} ripple>
					// 	{
					// 		this.state.tabs.map((tab, key) => (
					// 			<mdl.Tab key={key}>{tab.label}</mdl.Tab>
					// 		))
					// 	}
					// </mdl.Tabs>
		return (
			<mdl.Layout fixedHeader fixedDrawer>
				<mdl.Header >
					<mdl.HeaderRow>
						<h3>Wolbodo:ledenlijst</h3>
					</mdl.HeaderRow>
				</mdl.Header>
				<mdl.Drawer>
					<header>
						<img src='dorus.png' />
					</header>

					<mdl.Navigation>
						{this.state.pages.map((page, key) => 
							<a key={key} href="#" onClick={this.setPage(key)}>{page.label}</a>
						)}
					</mdl.Navigation>
				</mdl.Drawer>
				<mdl.Content className="mdl-color--grey-100">
					<mdl.Grid className='main-content'>
						<mdl.Cell col={12} className='mdl-color--white mdl-shadow--2dp'>
							{this.state.pages[this.state.currentPage].handler()}
						</mdl.Cell>
					</mdl.Grid>
				</mdl.Content>
			</mdl.Layout>

		);
	}
}


ReactDOM.render(
  <App/>,
  document.getElementById('app')
);