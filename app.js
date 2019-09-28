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
		this.mainContainer = document.getElementById('form');
		this.container = document.getElementById('form__cont');
		this.title = document.getElementById('form__title-input');
		this.body = document.getElementById('form__body-input');
		this.buttonContainer = document.querySelector('.form__title-btn');
		this.addNoteButton = document.getElementById('header__button-add');
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
	},

	removeButtonClass() {
		element.removeClasses([ this.favButton, this.archiveButton ], 'true');
	},

	showForm() {
		this.mainContainer.classList.add('show');
	},

	focus() {
		element.addClasses([ this.mainContainer ], 'show');
	},

	clear() {
		this.title.textContent = '';
		this.body.textContent = '';
	},

	blur() {
		this.mainContainer.classList.remove('show');
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
		(this.items = []), (this.title = ''), (this.index = 0), (this.fav = ''), (this.archived = ''), this.trashed;
	},

	cacheDom() {
		this.favSectionCont = document.querySelector('.listSection__favs');
		this.archivedSectionCont = document.querySelector('.listSection__archived');
		this.mainSectionCont = document.querySelector('.listSection__main');
		this.trashedSectionCont = document.querySelector('.listSection__trashed');
		this.favSection = document.getElementById('favNotes');
		this.mainSection = document.getElementById('mainNotes');
		this.archivedSection = document.getElementById('archivedNotes');
		this.allNotes = document.getElementsByClassName('listItem');
		this.trashedSection = document.getElementById('trashedNotes');
		this.allNotesCont = document.getElementsByClassName('listItem__cont');
		this.trashButtons = document.getElementsByClassName('listItem__trash-btn');
	},

	bindEvents() {
		const noteItems = document.getElementsByClassName('listItem');
		for (item of noteItems) {
			item.addEventListener('click', this.storeIndex.bind(this));
			item.addEventListener('keyup', this.edit.bind(this));
		}
		for (btn of this.trashButtons) {
			btn.addEventListener('click', this.trash.bind(this));
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
		const listTrashBtn = element.create('button');
		const listTrashBtnIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" width="15.75" height="15" viewBox="0 0 21 20">
      <g transform="translate(-179 -360)">
        <g transform="translate(56 160)">
          <path
            d="M130.35,216h2.1v-8h-2.1Zm4.2,0h2.1v-8h-2.1Zm-6.3,2h10.5V206h-10.5Zm2.1-14h6.3v-2h-6.3Zm8.4,0v-4h-10.5v4H123v2h3.15v14h14.7V206H144v-2Z"
            fill="#2d3142" fill-rule="evenodd" />
        </g>
      </g>
    </svg>`;

		//Adding attributes to eatch element
		element.attributes(listContainer, { class: 'listItem' });
		element.attributes(divCont, { class: 'listItem__cont' });
		element.attributes(listItemTitle, { class: 'listItem__title', contenteditable: 'true' });
		element.attributes(listItemBody, { class: 'listItem__body', contenteditable: 'true' });
		element.attributes(listTrashBtn, { class: 'listItem__trash-btn' });

		//Adding text to title and body
		listItemTitle.textContent = title;
		listItemBody.textContent = body;

		//Appending children to list container
		listTrashBtn.innerHTML = listTrashBtnIcon;
		element.appendChildren(divCont, [ listTrashBtn, listItemTitle, listItemBody ]);
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
		if (button.classList.contains('true')) {
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
				} else if (item.trashed === true) {
					this.append(this.trashedSection, addItem);
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
		// const noteExist = this.items.filter((x) => x.title === formTitleText && x.body === formBodyText); // come back to this
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
	},

	trash(e) {
		e.stopPropagation();
		const target = e.target;
		const className = 'listItem__trash-btn';
		const ele = getParent(target, className);
		const note = getParent(target, 'listItem');
		const trashedSection = this.trashedSection;

		// **Move item to trashed section

		// Function to get return button with item class
		function getParent(target, className) {
			let element = target;
			while (!element.classList.contains(className)) {
				element = element.parentElement;
			}
			return element;
		}

		// Capture note title and body text
		const noteTitle = ele.nextElementSibling.textContent;
		const noteBody = ele.nextElementSibling.nextElementSibling.textContent;

		// If the note is a child of the trashed section, delete permamently
		// else add to trashed section

		if (trashedSection.contains(note)) {
			const itemIndex = this.items.findIndex(item => item.title == noteTitle && item.body == noteBody );
			this.items.splice(itemIndex, 1);
			note.remove();
		} else {
			// Check the items array to see what item has the same text as note body and title
			// Set the entry in the array to reflect that the item is trashed
			this.items
				.filter((item) => item.title === noteTitle && item.body === noteBody)
				.map((item) => ((item.trashed = true), (item.archived = false), (item.fav = false)));

			this.prepend(trashedSection, note);
		}

		// Update items in local storage
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
		e.stopPropagation();
		const value = e.target.value.toLowerCase();
		const notes = [ ...note.allNotesCont ];

		function checkNoteValue(x, value) {
			const titleText = x.firstChild.textContent.toLowerCase();
			const bodyText = x.firstChild.nextSibling.textContent.toLowerCase();
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
		form.mainContainer.addEventListener('click', this.onFormBlur);
		form.buttonContainer.addEventListener('click', form.addButtonClass.bind(form));
	},

	onFormBlur(e) {
		e.stopPropagation();
		const formContainer = `#${form.container.id}`;
		const targetClicked = e.target.closest(formContainer);
		if (targetClicked) {
			return false;
		} else {
			note.add();
		}
	}
};

app.init();
