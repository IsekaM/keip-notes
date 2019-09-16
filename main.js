/***************************************************************
 *** Notes App 
    Used to store notes in localstorage (thus far).
    Eventually it will be a single page with login system,
    database storage of note items as well as other features.
    Official name is yet to be determined
****************************************************************
    Author: Makesi Morrison
    Contrubtors: Luke Chen Shui
***************************************************************/

// ** Object to store helper functions for localstorage api
storage = {
	key: 'keepCloneStorage',

	get() {
		return localStorage.getItem(this.key);
	},

	set(key, value) {
		return localStorage.set(key, value);
	},

	update(key = this.key, value = list.items) {
		localStorage.setItem(key, JSON.stringify(value));
	},

	clear() {
		localStorage.clear();
	}
};

// ** Object with methods used to manipulate create/manipulate html
const element = {
	create(element) {
		const ele = document.createElement(element);
		return ele;
	},

	attributes(ele, attributes) {
		for (const key in attributes) {
			if (key === 'class') {
				ele.classList.add(attributes[key]);
			} else {
				ele.setAttribute(key, attributes[key]);
			}
		}
	},

	appendChildren(parent, arrayOfChildren) {
		const children = [ ...arrayOfChildren ];
		for (const child of children) {
			parent.appendChild(child);
		}
	}
};

// ** Object for form module
const form = {
	init() {
		this.domCache();
	},

	domCache() {
		this.container = document.getElementById('listInput');
		this.title = document.getElementById('listInput__title');
		this.body = document.getElementById('listInput__body');
	},

	focus() {
		this.title.classList.add('show');
		this.body.classList.add('show');
	},

	clear() {
		this.title.textContent = '';
		this.body.textContent = '';
	},

	blur() {
		this.title.classList.remove('show');
		this.body.classList.remove('show');
		this.clear();
	}
};

// ** Object for list module
const list = {
	items: [],

	title: '',

	body: '',

	init() {
		this.cacheDom();
		this.render();
	},

	cacheDom() {
		this.pinnedSection = document.getElementById('pinnedList');
		this.mainSection = document.getElementById('mainList');
	},

	// * Method used to render elements stored in localstorage when page loads
	render() {
		const itemsExist = storage.get();
		const items = JSON.parse(itemsExist);
		if (itemsExist && items.length >= 1) {
			this.items = items;
			for (const item of items) {
				const addItem = this.createItem(item.title, item.body, item.index);
				this.appendItem(this.mainSection, addItem);
			}
		}
	},

	// *Method used to create a list element with alll necesarry children
	createItem(title = form.title.textContent, body = form.body.textContent, index = this.items.length) {
		//Making parent and child elements to hold note/list item
		const listContainer = element.create('li');
		const divCont = element.create('div');
		const listItemTitle = element.create('div');
		const listItemBody = element.create('div');

		//Adding attributes to eatch element
		element.attributes(listContainer, { class: 'listItem', 'data-listIndex': index });
		element.attributes(divCont, { class: 'listItem__cont' });
		element.attributes(listItemTitle, { class: 'listItem__title', contenteditable: 'true' });
		element.attributes(listItemBody, { class: 'listItem__body', contenteditable: 'true' });

		//Adding text to title and body
		listItemTitle.textContent = title;
		listItemBody.textContent = body;

		//Appending children to list container
		element.appendChildren(listContainer, [ divCont, listItemTitle, listItemBody ]);

		//Prepending item to list
		return listContainer;
	},

	prependItem(parent, element) {
		parent.prepend(element);
	},

	appendItem(parent, element) {
		parent.appendChild(element);
	},

	// ** Method used to check text content of elemnt to see if its >= to "n" values
	checkField(field, length, callback) {
		if (field.textContent.length >= length) {
			callback();
		}
	},

	addItem() {
		this.checkField(form.title, 0, () => {
			this.title = form.title.textContent;
		});

		this.checkField(form.body, 1, () => {
			this.body = form.body.textContent;
			this.items.unshift({ title: this.title, body: this.body, index: this.items.length });
			newItem = this.createItem(this.title, this.body, this.items.length);
			this.prependItem(this.mainSection, newItem);
		});
	}
};

// **Object containing methods to initialize app modules, bind events and initalize the app itself
const app = {
	init() {
		this.initModules();
		this.bindEvents();
	},

	initModules() {
		form.init();
		list.init();
	},

	bindEvents() {
		document.addEventListener('click', this.onFormBlur);
	},

	onFormBlur(e) {
		const formTitleID = `#${form.title.id}`;
		const formBodyID = `#${form.body.id}`;
		const targetClicked = e.target.closest(formTitleID) || e.target.closest(formBodyID);
		if (targetClicked) {
			form.focus();
		} else {
			list.addItem();
			storage.update();
			form.blur();
		}
	}
};

app.init();
