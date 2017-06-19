import * as tk from '../../../../ui/toolkit'
import {camelCaseSplit} from '../../../../utils/utils'

export class Wizard {
  
  constructor(app, opearation, metadata, initialState) {
    this.app = app;
    this.metadata = metadata;
    this.formFields = {};
    this.box = this.createUI(opearation, metadata);
    this.overridingHistory = false;
    if (initialState != undefined) {
      this.setFormFields(initialState);
    }
  }

  createRequest() {
    return {
      type: this.operation,
      params: this.readFormFields()
    };
  }

  uiLabel(name) {
    return camelCaseSplit(name).map(w => w.toLowerCase()).join(' ');
  }
  
  focus() {
    this.box.root.find('input, select').first().focus()
  }
  
  createUI(operation, metadata) {
    const box = new tk.Box($('#view-3d'));
    const folder = new tk.Folder(operation);
    tk.add(box, folder);
    for (let def of metadata) {
      const name = def[0];
      const type = def[1];
      const defaultValue = def[2];
      const params = def[3] || {};
      const label = this.uiLabel(name);
      const formItem = this.createFormField(name, label, type, params, defaultValue);
      formItem.setter(defaultValue);
      tk.add(folder, formItem.ui);
      this.formFields[name] = formItem;
    }
    const buttons = new tk.ButtonRow(["Cancel", "OK"], [() => this.cancelClick(), () => this.okClick()]);
    tk.add(folder, buttons);
    box.root.keydown((e) => {
      switch (e.keyCode) {
        case 27 : this.cancelClick(); break;
        case 13 : this.okClick(); break;
      }
    });

    return box;
  }
  
  cancelClick() {
    this.dispose();
  }

  okClick() {
    this.dispose();
    this.apply();
  }

  apply() {
    this.app.craft.modify(this.createRequest(), this.overridingHistory);
  }
  
  onUIChange() {}

  readFormFields() {
    const params = {};
    const keys = Object.keys(this.formFields);
    for (let key of keys) {
      params[key] = this.formFields[key].getter();
    }
    return params;
  }

  setFormFields(params) {
    const keys = Object.keys(params);
    for (let name of keys) {
      this.setFormField(name, params[name]);
    }
  }

  setFormField(name, value) {
    const formField = this.formFields[name];
    if (formField) {
      formField.setter(value);
    }
  }
  
  dispose() {
    this.disposed = true;
    this.box.close();
  }
  
  createFormField(name, label, type, params, initValue) {
    if (type == 'number') {
      const number = tk.config(new tk.Number(label, initValue, params.step, params.round), params);
      number.input.on('t-change', () => this.onUIChange(name));
      return Field.fromInput(number, Field.TEXT_TO_NUMBER_COERCION);
    } else if (type == 'choice') {
      const ops = params.options;
      const radio = new tk.InlineRadio(ops, ops, ops.indexOf(initValue));
      radio.root.find('input[type=radio]').on('change', () => {
        this.onUIChange(name);
      });
      return new Field(radio, () => radio.getValue(), (v) => radio.setValue(v));
    } else if (type == 'face') {
      const face = new tk.Text(label, initValue);
      face.input.on('change', () => this.onUIChange(name));
      return Field.fromInput(face, undefined, (faceId) => {
        if (faceId === CURRENT_SELECTION) {
          let selection = this.app.viewer.selectionMgr.selection[0];
          return selection ? selection.id : '';
        } else {
          return faceId;
        }
      });
    }
  }
}

function FaceSelectionListener() {
  this.callbacks = [];
}

function Field(ui, getter, setter) {
  this.ui = ui;
  this.getter = getter;
  this.setter = setter;
}

Field.NO_COERCION               = (v) => v;
Field.NUMBER_TO_TEXT_COERCION   = (v) => v + "";
Field.TEXT_TO_NUMBER_COERCION   = (v) => parseFloat(v);

Field.fromInput = function (inputEl, getterCoercer, setterCoercer) {
  getterCoercer = getterCoercer || Field.NO_COERCION;
  setterCoercer = setterCoercer || Field.NO_COERCION;
  return new Field(inputEl, () => getterCoercer(inputEl.input.val()), (value) => inputEl.input.val(setterCoercer(value)));
};

export const CURRENT_SELECTION = {}; 