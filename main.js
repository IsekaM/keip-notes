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

	update(key = this.key, value = note.items) {
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
	},

	addClasses(elements, className) {
		const parents = [ ...elements ];
		for (const parent of parents) {
			parent.classList.add(className);
		}
	},

	removeClasses(elements, className) {
		const parents = [ ...elements ];
		for (const parent of parents) {
			parent.classList.remove(className);
		}
	}
};

// ** Object for form module
const form = {
	init() {
		this.domCache();
	},

	domCache() {
		this.container = document.getElementById('topBar__input-cont');
		this.title = document.getElementById('topBar__input-title');
		this.body = document.getElementById('topBar__input-body');
		this.archiveButton = document.getElementById('topBar__button-archive');
		this.favButton = document.getElementById('topBar__button-fav');
	},

	checkButtonClass(button, otherButton, target) {
		if (target === button) {
			button.classList.toggle('true');
			otherButton.classList.remove('true');
			console.log(target);
		}
	},

	addButtonClass(e) {
		const target = e.target;
		this.checkButtonClass(this.archiveButton, this.favButton, target);
		this.checkButtonClass(this.favButton, this.archiveButton, target);
	},

	removeButtonClass() {
		element.removeClasses([ this.favButton, this.archiveButton ], 'true');
	},

	focus() {
		this.body.classList.add('show');
	},

	clear() {
		this.title.textContent = '';
		this.body.textContent = '';
	},

	blur() {
		this.body.classList.remove('show');
		this.removeButtonClass();
		this.clear();
	}
};

// ** Object for note module
const note = {
	init() {
		this.delcareVars();
		this.cacheDom();
		this.renderStored();
	},

	delcareVars() {
		(this.items = []), (this.title = ''), (this.index = 0), (this.fav = ''), (this.archived = '');
	},

	cacheDom() {
		this.favSectionCont = document.querySelector('.listSection__favs');
		this.archivedSectionCont = document.querySelector('.listSection__archived');
		this.mainSectionCont = document.querySelector('.listSection__main');
		this.trashedSectionCont = document.querySelector('.listSection__trashed');
		this.favSection = document.getElementById('favNotes');
		this.mainSection = document.getElementById('mainNotes');
		this.archivedSection = document.getElementById('archivedNotes');
	},

	prepend(parent, element) {
		parent.prepend(element);
	},

	append(parent, element) {
		parent.appendChild(element);
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
		element.appendChildren(divCont, [ listItemTitle, listItemBody ]);
		element.appendChildren(listContainer, [ divCont ]);

		//Return list item
		return listContainer;
	},

	// ** Method used to check text content of elemnt to see if its >= to "n" values
	checkBody(field, length, callback) {
		if (field.textContent.length >= length) {
			callback();
		}
	},

	checkType(button, objectKey) {
		if (button.className === 'true') {
			this[objectKey] = true;
		} else {
			this[objectKey] = false;
		}
	},

	storeType() {
		// check if pinned button clicked
		this.checkType(form.archiveButton, 'archived');

		//check if fav button clicked
		this.checkType(form.favButton, 'fav');
	},

	render(parent, noteTitle, noteBody, archived, faved) {
		this.title = noteTitle;
		this.body = noteBody;
		this.index++;
		const note = this.createItem(noteTitle, noteBody, this.index);
		this.prepend(parent, note);
		this.items.unshift({
			title: noteTitle,
			body: noteBody,
			index: this.index,
			archived: archived,
			fav: faved
		});
		storage.update();
		// form.blur();
	},

	// * Method used to render elements stored in localstorage when page loads
	renderStored() {
		const itemString = storage.get();
		const itemArray = JSON.parse(itemString);
		if (Array.isArray(itemArray) && itemArray.length >= 1) {
			this.items = itemArray;
			for (const item of itemArray) {
				const addItem = this.createItem(item.title, item.body, item.index);
				if (item.fav === true) {
					this.append(this.favSection, addItem);
				} else if (item.archived === true) {
					this.append(this.archivedSection, addItem);
				} else {
					this.append(this.mainSection, addItem);
				}
			}
		} else {
			storage.clear();
		}
	},

	add() {
		const formTitleText = form.title.textContent;
		const formBodyText = form.body.textContent;
		const formBodyLength = formBodyText.length;
		this.storeType();
		if (formBodyLength >= 1 && this.fav === true) {
			this.render(this.favSection, formTitleText, formBodyText, false, true);
		} else if (formBodyLength >= 1 && this.archived === true) {
			this.render(this.archivedSection, formTitleText, formBodyText, true, false);
		} else if (formBodyLength >= 1 && this.archived === false && this.fav === false) {
			this.render(this.mainSection, formTitleText, formBodyText, false, false);
		}
	},

	edit() {
		const noteTitle = [ ...document.getElementsByClassName('listItem__title') ];
		const noteBody = [ ...document.getElementsByClassName('listItem__title') ];

		noteTitle.forEach(updateTitle);
	}
};

const nav = {
	init() {
		this.cacheDom();
		this.bindEvents();
	},

	cacheDom() {
		this.navCont = document.querySelector('.nav__cont');
		this.allNotes = document.getElementById('nav__item-all');
		this.favs = document.getElementById('nav__item-fav');
		this.archived = document.getElementById('nav__item-archived');
		this.trash = document.getElementById('nav__item-trash');
		this.items = [ ...document.getElementsByClassName('nav__item') ];
	},

	bindEvents() {
		for (const item of this.items) {
			item.addEventListener('click', this.toggleSection.bind(this), true);
		}
	},

	toggleSection(e) {
		// e.stopPropagation();
		const target = e.target;
		const id = target.id;
		const index = this.items.findIndex((x) => x.id === id);
		const sections = [
			note.mainSectionCont,
			note.favSectionCont,
			note.archivedSectionCont,
			note.trashedSectionCont
		];

		console.log(index);

		this.items.filter((x) => x.classList.contains('active')).map((x) => x.classList.remove('active'));
		sections.map((x) => x.classList.remove('show-section'));

		if (index === 0) {
			sections
				.filter((x) => x.classList.contains('listSection__favs') || x.classList.contains('listSection__main'))
				.map((x) => x.classList.add('show-section'));
			target.classList.add('active');
		} else {
			target.classList.add('active');
			sections[index].classList.add('show-section');
		}
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
		note.init();
		nav.init();
	},

	bindEvents() {
		document.addEventListener('click', this.onFormBlur);
		form.container.addEventListener('click', form.addButtonClass.bind(form));
	},

	onFormBlur(e) {
		const formContainer = `#${form.container.id}`;
		const targetClicked = e.target.closest(formContainer);
		if (targetClicked) {
			form.focus();
		} else {
			note.add();
			form.blur();
		}
	}
};

app.init();
