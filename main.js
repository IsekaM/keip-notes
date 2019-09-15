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


const element = {

  create(element) {
    const ele = document.createElement(element);
    return ele;
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

  appendChildren(parent, arrayOfChildren) {
    const children = [...arrayOfChildren];
    for (const child of children) {
      parent.appendChild(child);
    }
  }
};


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
    this.title.textContent = "";
    this.body.textContent = "";
  },

  blur() {
    this.title.classList.remove('show');
    this.body.classList.remove('show');
    this.clear();
  },

};


const list = {
  items: [],

  title: '',

  body: '',

  init() {
    this.cacheDom();
    this.render()
  },

  cacheDom() {
    this.pinnedSection = document.getElementById('pinnedList');
    this.mainSection = document.getElementById('mainList');
  },

  render() {
    const key = storage.key.toString();
    console.log(key);
    const items = storage.get(key);
    const value = JSON.parse(items);
    if (items && value.lenth > 0) {
      this.items = value;
      console.log(true);
      for (const item of this.items) {
        const newItem = list.createItem(item.title, item.body, item.index);
        element.appendChildren(this.mainSection, [newItem]);
      } 
    } else {
      storage.clear();
    }
  },

  // ** Method used to create a list element with alll necesarry children
  createItem(title = form.title.textContent, body = form.body.textContent, index = this.items.length, parent = this.mainSection) {
    //Making parent and child elements to hold note/list item
    const listCont = element.create('li');
    const divCont = element.create('div');
    const listItemTitle = element.create('div');
    const listItemBody = element.create('div');

    //Adding attributes to eatch element
    element.attributes(listCont, {class: "listItem", ['data-listIndex']: index});
    element.attributes(divCont, { class: "listItem__cont" });
    element.attributes(listItemTitle, { class: "listItem__title", contenteditable: "true" });
    element.attributes(listItemBody, { class: "listItem__body", contenteditable: "true" });

    //Adding text to title and body
    listItemTitle.textContent = title;
    listItemBody.textContent = body;

    //Appending children to list container
    element.appendChildren(listCont, [divCont, listItemTitle, listItemBody]);

    //Prepending item to list
    this.prependItem(parent, listCont);
  },

  prependItem(parent, element) {
    if (parent.children.length === 0) {
      parent.appendChild(element);
    } else {
      parent.prepend(element);
    }
  },

  // ** Method used to check text content of elemnt to see if its >= to "n" values
  checkField(field, chars, callback) {
    if (field.textContent.length >= chars) {
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
      this.createItem(this.title, this.body, this.items.length);
    });
  }

};


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
      form.blur();
      storage.update();
      list.addItem();
    }
  },

};

app.init();
