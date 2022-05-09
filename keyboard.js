/* eslint-disable import/extensions */
import buttons from './keysData.js';

const Keyboard = {
  currentLayout: null,
  storage: window.sessionStorage,
  isCapsLock: false,
  isShift: false,
  isAlt: false,
  isCtrl: false,
  osName: null,
  indexOfcursor: 0,

  elements: {
    main: null,
    keyContainer: null,
    textarea: null,
    keys: null,
  },

  init() {
    this.elements.keys = new Map();
    this.currentLayout = this.getLayout();
    this.osName = this.detectOs();
    this.addEventListeners();
    document.body.append(this.createHtml());
  },

  addEventListeners() {
    this.keyEventsPhysical();
    window.addEventListener('beforeunload', () => {
      this.storage.setItem('layoutRebuyBoy', this.currentLayout);
    });
  },

  createHtml() {
    const main = document.createElement('div');
    main.classList.add('main');
    const keyContainer = this.createKeyContainer();
    keyContainer.append(this.createKeys());
    const textarea = this.creatTextArea();
    main.append(textarea);
    main.append(keyContainer);
    this.elements.textarea = textarea;
    this.elements.main = main;
    this.elements.keyContainer = keyContainer;
    return main;
  },

  creatTextArea() {
    const textarea = document.createElement('textarea');
    textarea.classList.add('textarea');
    textarea.setAttribute('readonly', true);
    textarea.setAttribute('placeholder', 'ALT+LeftShift => Change language');
    return textarea;
  },

  createKeyContainer() {
    const keyContainer = document.createElement('div');
    keyContainer.classList.add('key-container');
    return keyContainer;
  },

  createKeys() {
    const keysFragment = document.createDocumentFragment();
    buttons.forEach((btn) => {
      const keyElement = document.createElement('button');
      keyElement.innerHTML = this.currentLayout === 'en' ? btn.content.en : btn.content.ru;
      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('key');

      const keyCode = btn.code;
      if (keyCode === 'Space') {
        keyElement.classList.add('key_wide');
      }
      if (keyCode === 'Tab') {
        keyElement.classList.add('key_small');
      }
      if (keyCode === 'Enter') {
        keyElement.classList.add('key_enter');
      }
      if (keyCode === 'Backspace'
      || keyCode === 'CapsLock'
      || keyCode === 'ShiftLeft') {
        keyElement.classList.add('key_big');
      }
      if (keyCode === 'ControlLeft' || keyCode === 'ControlRight') {
        keyElement.classList.add('key_ctrl');
      }
      if (keyCode === 'CapsLock') {
        const caps = document.createElement('span');
        caps.classList.add('caps_marker');
        keyElement.append(caps);
      }
      keysFragment.append(keyElement);
      this.keyEventsVirtual(keyElement);
      if (keyCode.match(/(Backspace|Del|Enter|ShiftRight)/)) {
        keysFragment.append(document.createElement('br'));
      }
      this.elements.keys.set(btn.code, keyElement);
    });
    return keysFragment;
  },

  keyEventsVirtual(key) {
    key.addEventListener('mousedown', () => {
      const keyData = key.innerText;
      key.classList.toggle('key_pressed');
      if (keyData === 'Shift' && this.isAlt) {
        this.isShift = this.isShift ? !this.isShift : this.isShift;
        this.handleLanguage();
      } else if (keyData === 'Shift') {
        this.handleShift();
        this.isShift = !this.isShift;
      } else if (keyData === 'Caps Lock') {
        key.lastChild.classList.toggle('caps_marker_active');
        this.handleCapsLock();
        this.isCapsLock = !this.isCapsLock;
      } else if (keyData === 'EN' || keyData === 'RU') {
        this.handleLanguage();
      } else if (keyData === 'Alt') {
        this.isAlt = !this.isAlt;
      } else if (keyData === 'Ctrl') {
        this.isCtrl = !this.isCtrl;
      }
    });

    key.addEventListener('mouseup', () => {
      if (!['Caps Lock', 'Shift', 'Ctrl', 'Alt'].includes(key.innerText)) {
        key.classList.remove('key_pressed');
        const keyData = key.innerText;

        if (keyData !== 'EN' && keyData !== 'RU') {
          this.handleInput(keyData);
        }
      }
      if (key.innerText === 'Shift' && this.isAlt) {
        key.classList.remove('key_pressed');
      }
    });

    key.addEventListener('mouseout', () => {
      if (!['Caps Lock', 'Shift', 'Ctrl', 'Alt'].includes(key.innerText)) {
        key.classList.remove('key_pressed');
      }
    });
  },

  keyEventsPhysical() {
    document.addEventListener('keydown', (event) => {
      const { code } = event;
      if (this.elements.keys.has(code)) {
        this.elements.keys.get(code).classList.add('key_pressed');
        if (code === 'CapsLock' && this.osName === 'Mac') {
          this.elements.keys.get(code).lastChild.classList.toggle('caps_marker_active');
          this.handleCapsLock();
          this.isCapsLock = !this.isCapsLock;
        } else if ((code === 'ShiftLeft' && this.isAlt) || code === 'MetaLeft') {
          this.handleLanguage();
        } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
          this.handleShift();
          this.isShift = !this.isShift;
        } else if (code === 'AltLeft' || code === 'AltRight') {
          this.isAlt = !this.isAlt;
        } else if (code === 'ControlRight' || code === 'ControlLeft') {
          this.isCtrl = !this.isCtrl;
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      const { code } = event;
      if (this.elements.keys.has(code)) {
        this.elements.keys.get(code).classList.remove('key_pressed');
        if (code === 'CapsLock') {
          this.handleCapsLock();
          this.elements.keys.get(code).lastChild.classList.toggle('caps_marker_active');
          this.isCapsLock = !this.isCapsLock;
        } else if (code === 'AltLeft' || code === 'AltRight') {
          this.isAlt = !this.isAlt;
        } else if (code === 'ControlRight' || code === 'ControlLeft') {
          this.isCtrl = !this.isCtrl;
        } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
          this.handleShift();
          this.isShift = !this.isShift;
        } else if (code !== 'MetaLeft') {
          this.handleInput(code);
        }
      }
    });
  },

  handleLanguage() {
    const keys = Array.from(this.elements.keys.values());
    for (let i = 0; i < keys.length; i += 1) {
      if (buttons[i].type !== 'functional') {
        if (this.isCapsLock) {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].content.ru.toUpperCase()
            : buttons[i].content.en.toUpperCase();
        } else if (this.isShift) {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].altContent.ru.toUpperCase()
            : buttons[i].altContent.en.toUpperCase();
        } else {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].content.ru
            : buttons[i].content.en;
        }
      }
    }
    this.currentLayout = this.currentLayout === 'en' ? 'ru' : 'en';
  },

  handleShift() {
    const keys = Array.from(this.elements.keys.values());
    for (let i = 0; i < keys.length; i += 1) {
      if (buttons[i].type !== 'functional' && buttons[i].type !== 'language') {
        if (!this.isShift) {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].altContent.en.toUpperCase()
            : buttons[i].altContent.ru.toUpperCase();
        } else if (this.isCapsLock) {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].content.en.toUpperCase()
            : buttons[i].content.ru.toUpperCase();
        } else {
          keys[i].innerText = this.currentLayout === 'en'
            ? buttons[i].content.en
            : buttons[i].content.ru;
        }
      }
    }
  },

  handleCapsLock() {
    const keys = Array.from(this.elements.keys.values());
    for (let i = 0; i < keys.length; i += 1) {
      if (buttons[i].type !== 'functional' && buttons[i].type !== 'language') {
        if (!this.isShift) {
          keys[i].innerText = this.isCapsLock
            ? keys[i].innerText.toLowerCase()
            : keys[i].innerText.toUpperCase();
        } else {
          keys[i].innerText = this.currentLayout === 'en'
            ? keys[i].innerText = buttons[i].altContent.en.toUpperCase()
            : keys[i].innerText = buttons[i].altContent.ru.toUpperCase();
        }
      }
    }
  },

  handleInput(data) {
    let textarea = this.elements.textarea.innerHTML;
    let input = data;
    if (this.elements.keys.has(input)) {
      input = this.elements.keys.get(data).innerText;
    }
    if (data === 'Enter') {
      textarea = `${textarea.slice(0, textarea.length - 1)}\n|`;
      this.indexOfcursor += 1;
    } else if (data === 'Backspace') {
      if (this.indexOfcursor > 0) {
        textarea = `${textarea.slice(0, this.indexOfcursor - 1)}|${textarea.slice(this.indexOfcursor + 1)}`;
        this.indexOfcursor -= 1;
      }
    } else if (data === 'Delete' || data === 'Del') {
      if (this.indexOfcursor < textarea.length) {
        textarea = `${textarea.slice(0, this.indexOfcursor)}|${textarea.slice(this.indexOfcursor + 2)}`;
      }
    } else if (data === 'Tab') {
      textarea = `${textarea.slice(0, textarea.length - 1)}    |`;
      this.indexOfcursor += 4;
    } else if (data === 'Space' || data === '') {
      textarea = `${textarea.slice(0, textarea.length - 1)} |`;
      this.indexOfcursor += 1;
    } else if (data === 'ArrowLeft' || data === '◄') {
      if (this.indexOfcursor > 0) {
        textarea = `${textarea.slice(0, this.indexOfcursor - 1)}|${textarea.slice(this.indexOfcursor - 1, this.indexOfcursor)}${textarea.slice(this.indexOfcursor + 1)}`;
        this.indexOfcursor -= 1;
      }
    } else if (data === 'ArrowRight' || data === '►') {
      if (this.indexOfcursor < textarea.length - 1) {
        textarea = `${textarea.slice(0, this.indexOfcursor)}${textarea.slice(this.indexOfcursor + 1, this.indexOfcursor + 2)}|${textarea.slice(this.indexOfcursor + 2)}`;
        this.indexOfcursor += 1;
      }
    } else if (data === 'ArrowUp' || data === '▲') {
      // todo
    } else if (data === 'ArrowDown' || data === '▼') {
      // todo
    } else {
      textarea = `${textarea.slice(0, textarea.length - 1)}${input}|`;
      this.indexOfcursor += 1;
    }
    this.elements.textarea.innerHTML = textarea;
  },

  getLayout() {
    return this.storage.getItem('layoutRebuyBoy') || 'en';
  },

  detectOs() {
    let name = '';
    if (navigator.userAgent.indexOf('Win') !== -1) { name = 'Win'; }
    if (navigator.userAgent.indexOf('Mac') !== -1) { name = 'Mac'; }
    return name;
  },
};

Keyboard.init();
