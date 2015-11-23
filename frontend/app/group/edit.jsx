
class GroupEdit extends React.Component {

	render() {
		return (
			<ListView 
				fields={
					['name', 'description']
				} 
				schema={{
					permissions: {},
					fields: {
						name: {
							label: "Naam"
						},
						description: {
							label: "Omschrijving"
						}
					}
				}}
				data={[
					{name: "Bestuur", description: "Alle bestuursleden"},
					{name: "Leden", description: "Alle leden"}
				]}>

				
			</ListView>
		);
	}
}