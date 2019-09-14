storage = {
  key: 'keepCloneStorage',
  
  get(key = this.key) {
    return localStorage.getItem(key);
  },

  set(key, value) {
    return localStorage.set(key, value);
  },

  check(key = this.key, value = list.items) {
    if (storage.get(key) === null && value) {
      storage.set(key, JSON.stringify(value));
    }
  },

  init(key = this.key) {
    const items = storage.get(this.key);
    if (list.items.length === 0 && items) {
      list.items = JSON.parse(items);
      list.retrieve();
      console.log('fiyah');
    }
  },

  update(key = this.key, value = list.items) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};


const element = {
  prepend(parent, element) {
    if (parent.children.length === 0) {
      parent.appendChild(element);
    } else {
      parent.insertBefore(element, parent.children[0]);
    }
  },

  create(ele) {
    const element = document.createElement(ele);
    return element;
  },

  attributes(ele, attributes) {
    for (const key in attributes) {
      if (key === "class") {
        ele.classList.add(attributes[key]);
      } else {
        ele.setAttribute(key, attributes[key]);
      }
    }
  },

  // appendChild(parent, child) {

  // },

  appendChildren(parent, arrayOfChildren) {
    const children = [...arrayOfChildren];
    for (const child of children) {
      parent.appendChild(child);
    }
  }
};

const form = {
  container: document.getElementById('listInput'),
  title: document.getElementById('listInput__title'),
  body: document.getElementById('listInput__body'),
  focus() {
    this.title.classList.add('show');
    this.body.classList.add('show');
  },

  blur() {
    this.title.classList.remove('show');
    this.body.classList.remove('show');
  },

  clear() {
    this.title.textContent = "";
    this.body.textContent = "";
  }
};


const list = {
  items: [],

  title: '',

  body: '',

  sections: {
    pinned: document.getElementById('pinnedList'),
    main: document.getElementById('mainList')
  },

  // ** Method used to create a list element with alll necesarry children
  createEle(title, body, index = 0) {
    const listCont = element.create('li');
    const divCont = element.create('div');
    const listItemTitle = element.create('div');
    const listItemBody = element.create('div');
    element.attributes(listCont, {class: "listItem", ['data-listIndex']: index})
    element.attributes(divCont, { class: "listItem__cont" });
    element.attributes(listItemTitle, { class: "listItem__title", contenteditable: "true" });
    element.attributes(listItemBody, { class: "listItem__body", contenteditable: "true" });

    listItemTitle.textContent = title;
    listItemBody.textContent = body;

    element.appendChildren(listCont, [divCont, listItemTitle, listItemBody]);

    return listCont;
  },


  // ** Method used to check text content of elemnt to see if its >= to "n" values
  checkField(field, length, callback) {
    if (field.textContent.length >= length) {
      callback();
    }
  },

  retrieve(items = this.items) {
    const listItems = [...items];
    for (const item of listItems) {
      const ele = this.createEle(item.title, item.body, item.index);
      element.appendChildren(this.sections.main, [ele]);
    }
  },

  addItem() {
    this.checkField(form.title, 0, () => {
      this.title = form.title.textContent;
    });

    this.checkField(form.body, 1, () => {
      this.body = form.body.textContent;
      this.items.unshift({ title: this.title, body: this.body, index: this.items.length});
      const newItem = this.createEle(this.title, this.body, this.items.length);
      element.prepend(this.sections.main, newItem);
      form.clear()
      storage.update();
    });
  }

};

document.addEventListener('click', (e) => {
  const formTitle = `#${form.title.id}`;
  const formBody = `#${form.body.id}`;
  const target = e.target;

  if (target.closest(formTitle) || target.closest(formBody)) {
    form.focus();
  } else {
    form.blur();
    list.addItem();
  }
});

addEventListener('load', () => {
  console.log('heya');
  storage.init();
});
