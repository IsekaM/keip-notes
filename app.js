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
		this.bindEvents();
	},

	domCache() {
		this.container = document.querySelector('.form');
		this.title = document.getElementById('form__title-input');
		this.body = document.getElementById('form__body-input');
		this.addNoteButton = document.getElementById('header__button-add');
		// this.menu = document.getElementById('topBar__menu-cont');
		this.archiveButton = document.getElementById('form__btn--archive');
		this.favButton = document.getElementById('form__btn--fav');
		this.closeButton = document.getElementById('form__menu-btn');
	},

	bindEvents() {
		this.addNoteButton.addEventListener('click', this.showForm.bind(this));
	},

	checkButtonClass(button, otherButton, target) {
		if (target === button || button.contains(target)) {
			button.classList.toggle('true');
			otherButton.classList.remove('true');
		}
	},

	addButtonClass(e) {
		e.stopPropagation();
		const target = e.target;
		this.checkButtonClass(this.archiveButton, this.favButton, target);
		this.checkButtonClass(this.favButton, this.archiveButton, target);
		console.log(target);
	},

	removeButtonClass() {
		element.removeClasses([ this.favButton, this.archiveButton ], 'true');
	},

	showForm() {
		this.container.classList.add('show');
	},

	focus() {
		element.addClasses([ this.container ], 'show');
	},

	clear() {
		this.title.textContent = '';
		this.body.textContent = '';
	},

	blur() {
		element.removeClasses([ this.menu, this.body ], 'show');
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
		this.bindEvents();
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
		this.allNotes = document.getElementsByClassName('listItem__cont');
	},

	bindEvents() {
		const noteItems = document.getElementsByClassName('listItem');
		for (item of noteItems) {
			item.addEventListener('click', this.storeIndex.bind(this));
			item.addEventListener('keyup', this.edit.bind(this));
		}
		form.closeButton.addEventListener('click', this.add.bind(this));
	},

	prepend(parent, element) {
		parent.prepend(element);
	},

	append(parent, element) {
		parent.appendChild(element);
	},

	// *Method used to create a list element with alll necesarry children
	createItem(title = form.title.textContent, body = form.body.textContent) {
		//Making parent and child elements to hold note/list item
		const listContainer = element.create('li');
		const divCont = element.create('div');
		const listItemTitle = element.create('div');
		const listItemBody = element.create('div');

		//Adding attributes to eatch element
		element.attributes(listContainer, { class: 'listItem' });
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

	render(parent, noteTitle, noteBody, archived = false, faved = false) {
		this.title = noteTitle;
		this.body = noteBody;
		const note = this.createItem(noteTitle, noteBody);
		this.prepend(parent, note);
		this.items.unshift({
			title: noteTitle,
			body: noteBody,
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
				const addItem = this.createItem(item.title, item.body);
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
		const noteExist = this.items.filter((x) => x.title === formTitleText && x.body === formBodyText); // come back to this
		this.storeType();
		if (formBodyLength >= 1 && this.fav === true) {
			this.render(this.favSection, formTitleText, formBodyText, false, true);
		} else if (formBodyLength >= 1 && this.archived === true) {
			this.render(this.archivedSection, formTitleText, formBodyText, true, false);
		} else if (formBodyLength >= 1 && this.archived === false && this.fav === false) {
			this.render(this.mainSection, formTitleText, formBodyText, false, false);
		}
		form.blur();
	},

	storeIndex(e) {
		e.stopPropagation();
		const target = e.target;
		const that = this;
		function getIndex(title, body) {
			that.index = that.items.findIndex((x) => x.title === title && x.body === body);
		}

		if (target.className === 'listItem__title') {
			const title = target.textContent;
			const body = target.nextSibling.textContent;
			getIndex(title, body);
		} else if (target.className === 'listItem__body') {
			const title = target.previousSibling.textContent;
			const body = target.textContent;
			getIndex(title, body);
		}
	},

	edit(e) {
		const target = e.target;
		const className = target.className;
		const i = this.index;
		if (className === 'listItem__title') {
			this.items[i].title = target.textContent;
		} else if (className === 'listItem__body') {
			this.items[i].body = target.textContent;
		}
		storage.update();
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
		this.items = [ ...document.querySelectorAll('.nav__item') ];
	},

	bindEvents() {
		for (const item of this.items) {
			item.addEventListener('click', this.toggleSection.bind(this));
		}
	},

	toggleSection(e) {
		e.stopPropagation();
		const target = e.target;
		let element;
		let id;
		const sections = [
			note.mainSectionCont,
			note.favSectionCont,
			note.archivedSectionCont,
			note.trashedSectionCont
		];

		if (target.id) {
			element = target;
			id = element.id;
		} else if (target.parentElement.id) {
			element = target.parentElement;
			id = element.id;
			element.classList.add('active');
		} else if (target.parentElement.parentElement.id) {
			element = target.parentElement.parentElement;
			id = element.id;
		}

		const index = this.items.findIndex(
			(x) => x.id === id || x.parentElement.id === id || x.parentElement.parentElement.id === id
		);

		this.items.filter((x) => x.classList.contains('active')).map((x) => x.classList.remove('active'));
		sections.map((x) => x.classList.remove('show-section'));

		if (index === 0 || sections[index].contains(target)) {
			sections
				.filter((x) => x.classList.contains('listSection__favs') || x.classList.contains('listSection__main'))
				.map((x) => x.classList.add('show-section'));
			element.classList.add('active');
		} else {
			element.classList.add('active');
			sections[index].classList.add('show-section');
		}
	}
};

const search = {
	init() {
		this.cacheDom();
		this.bindEvents();
	},

	cacheDom() {
		this.input = document.getElementById('header__search-input');
	},

	bindEvents() {
		this.input.addEventListener('keyup', this.filterNotes.bind(this));
	},

	filterNotes(e) {
		// console.log(e);
		const value = e.target.value;
		const notes = [ ...note.allNotes ];
		// notes.map( x => )
		function checkNoteValue(x, value) {
			const titleText = x.firstChild.textContent;
			const bodyText = x.firstChild.nextSibling.textContent;

			return titleText.includes(value) || bodyText.includes(value);
		}

		function displayNote(x) {
			x.parentNode.style.display = 'block';
		}

		function hideUnmatchedNotes(x) {
			x.parentNode.style.display = 'none';
		}

		notes.map((x) => hideUnmatchedNotes(x));
		notes.filter((x) => checkNoteValue(x, value)).map((x) => displayNote(x));
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
		search.init();
	},

	bindEvents() {
		document.addEventListener('click', this.onFormBlur);
		form.container.addEventListener('click', form.addButtonClass.bind(form), true);
	},

	onFormBlur(e) {
		const formContainer = `#${form.container.id}`;
		const targetClicked = e.target.closest(formContainer);
		if (targetClicked) {
			return false;
		} else {
			note.add();
			// form.blur();
		}
	}
};

app.init();
