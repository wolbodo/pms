
const initialState = {
  schema: {
    "title": "Wijzig groep",
    "permissions": {},
    "form": [{
      "title": "Gegevens",
      "fields": [
        "name", "description"
      ]
    }],
    "fields": {
      "name": {
       "name": "name",
       "type": "string",
        "label": "Naam"
      },
      "description": {
       "name": "description",
       "type": "string",
        "label": "Omschrijving"
      }
    }
  },
  items: {
	  bestuur: {
	    "id": "bestuur",
	    "name": "Bestuur",
	    "description": "Alle bestuursleden"
	  },
	  leden: {
	    "id": "leden",
	    "name": "Leden",
	    "description": "Alle leden"
	  },
	  oudleden: {
	    "id": "oudleden",
	    "name": "Oud Leden",
	    "description": "Alle oud leden"
	  }

  }
}

function update(state = initialState, action) {
	switch (action.type) {
		default:
			return state;
	}
}


export default update