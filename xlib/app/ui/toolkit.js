
export function add(parent, child) {
  parent.content.append(child.root);
}

export function methodRef(_this, methodName, args) {
  return function() {
    _this[methodName].apply(_this, args);
  };
}

export function Box(parent) {
  this.root = this.content = $('<div class="tc-box" />');
  this.root.addClass('tc-box tc-scroll');
  this.root.appendTo(parent ? parent : 'body');
}

Box.prototype.close = function() {
  this.root.remove();
};

export function Panel() {
  this.root = this.content = $('<div />');
  this.root.addClass('tc-panel tc-scroll');
}

Panel.prototype.close = function() {
  this.root.remove();
};

export function Folder(title) {
  this.root = $('<div/>', {'class': 'tc-folder'});
  this.content = $('<div/>');
  this.root.append($('<div/>', {text: title, 'class': 'tc-row tc-title'}));
  this.root.append(this.content);
}

export function Button(title) {
  this.root = $('<div/>',
    {'class': 'tc-row tc-ctrl tc-ctrl-btn', text: title});
}

export function CheckBox(title, checked) {
  this.root = $('<div/>',
    {'class': 'tc-row tc-ctrl'});
  this.root.append('<label><input type="checkbox">' + title + '</label>')
  this.input = this.root.find("input");
  this.input.prop('checked', !!checked);
}

export function InlineRadio(choiceLabels, choiceValues, checkedIndex) {
  var name = 'TCAD.toolkit.InlineRadio_' + (InlineRadio.COUNTER++)
  this.root = $('<div/>',
    {'class': 'tc-row tc-ctrl tc-inline-radio'});
  this.inputs = [];
  for (var i = 0; i < choiceLabels.length; i++) {
    var checked = checkedIndex === i ? "checked" : '';
    var label = $('<label><input type="radio" name="' + name + '" value="' + choiceValues[i] + '"><span>' + choiceLabels[i] + '</span></label>');
    this.inputs.push(label.find("input"));
     this.root.append(label);
  }
  this.inputs[checkedIndex].prop('checked', true);
}

InlineRadio.prototype.getValue = function() {
  for (var i = 0; i < this.inputs.length; i++) {
    if (this.inputs[i].prop('checked')) {
      return this.inputs[i].attr('value');
    }
  }
  return null;
};

InlineRadio.prototype.setValue = function(v) {
  this.root.find('input[value='+v+']').prop('checked', true);
};


InlineRadio.COUNTER = 0;

export function propLayout(root, name, valueEl) {
  root.append($('<span/>', {'class': 'tc-prop-name', text: name}))
    .append($('<div/>', {'class': 'tc-prop-value'})
    .append(valueEl));
}

function NumberWidget(name, initValue, baseStep, round) {
  this.root = $('<div/>', {'class': 'tc-row tc-ctrl tc-ctrl-number'});
  this.input = $("<input type='text' value='"+initValue+"' />");
  this.slide = false;
  baseStep = baseStep || 1;
  round = round || 0;
  this.min = null;
  this.max = null;
  this.accelerator = 100;
  var scope = this;
  var lastValue = null;
  function trigger() {
    if ($(this).val() !== lastValue) {
      $(this).trigger('t-change');
      lastValue = $(this).val();
    }
  }
  
  this.input.on('input', function(e) {
    var val = $(this).val();
    //var floatRegex = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;
    //if (!floatRegex.test(val)) {
    //  $(this).val(val.replace(/[^0-9\.-]/g, ''));
    //}
    trigger.call(this);
  });
  this.input.get(0).addEventListener('mousewheel', function (e) {
    var delta = 0;
    if ( e.wheelDelta ) { // WebKit / Opera / Explorer 9
      delta = e.wheelDelta;
    } else if ( e.detail ) { // Firefox
      delta = - e.detail;
    }
    var val = $(this).val();
    if (!val) val = 0;
    var step = baseStep * (e.shiftKey ? scope.accelerator : 1);
    val = parseFloat(val) + (delta < 0 ? -step : step);
    if (scope.min != null && val < scope.min) {
      val = scope.min;
    }
    if (scope.max != null && val > scope.max) {
      val = scope.max;
    }
    if (round !== 0) {
      val = val.toFixed(round);
    }
    $(this).val(val);
    e.preventDefault();
    e.stopPropagation();
    trigger.call(this);
  }, false);
  propLayout(this.root, name, this.input);
}

NumberWidget.prototype.val = function() {
  return Number(this.input.val());
};

export function Text(name, initValue) {
  this.root = $('<div/>', {'class': 'tc-row tc-ctrl'});
  this.input = $("<input type='text' value='"+initValue+"' />");
  propLayout(this.root, name, this.input);
}

export function Combo(id, labelText) {
  this.root = $('<div/>', {'class': 'tc-row tc-ctrl tc-ctrl-combo'});
  var label = $('<span/>', {'class': 'tc-prop-name', text: labelText});
  this.select = $('<select>', {id : id});
  this.root.append(label)
    .append($('<div/>', {'class': 'tc-prop-value'}).append(this.select));
}

export function ButtonRow(captions, actions) {

  this.root = $('<div/>',
    {'class': 'tc-row tc-ctrl tc-buttons-block'});

  function withAction(btn, action) {
    return btn.click(function(){
      action.call()
    });
  }
  for (var i = 0; i < captions.length; i++) {
    var caption = captions[i];
    var btn = $('<span/>', {
      text: caption,
      'class': 'tc-block-btn active-btn'
    });
    withAction(btn, actions[i]);
    this.root.append(btn);
  }
}

export function List() {
  this.root = $('<div/>', {'class': 'tc-list'});
}

List.prototype.addRow = function(name) {
  var row = $('<div/>', {
    text: name, 'class': 'tc-row tc-pseudo-btn'
  });
  this.root.append(row);
  return row;
};

List.setIconForRow = function(row, icon) {
  row.css({
    'background-image' : 'url('+icon+')'
  });
};

export function Tree() {
  this.root = $('<div/>', {'class': 'tc-tree'});
}

Tree.prototype.set = function(data) {
  this.root.empty();
  this._fill(data, 0);
};

Tree.prototype._fill = function(data, level) {
  var notLeaf = data.children !== undefined && data.children.length !== 0;
  if (data.name !== undefined) {
    this.root.append($('<div/>', {
      text: data.name, 'class': 'tc-row' + (notLeaf ? ' tc-chevron-open' : ''),
      css: {'margin-left': level * (notLeaf ? 10 : 16) + 'px'}
    }));
  }
  if (notLeaf) {
    for (var i = 0; i < data.children.length; i++) {
      var child = data.children[i];
      this._fill(child, level + 1);
    }
  }
};

export function Parameters() {
  this.listeners = {};
}

Parameters.prototype.define = function(name, initValue) {
  function fn(name) {
    return '___' + name;
  }
  this[fn(name)] = initValue;
  return Object.defineProperty(this, name, {
    get: function() { return this[fn(name)]},
    set: function(value) {
      var oldValue = this[fn(name)];
      this[fn(name)] = value;
      this.notify(name, value, oldValue);
    }
  });
};

Parameters.prototype.subscribe = function(name, listenerId, callback, scope) {
  var listenerList = this.listeners[name];
  if (listenerList === undefined) {
    listenerList = [];
    this.listeners[name] = listenerList;
  }
  var callbackFunc = scope === undefined ? callback : function() {
    callback.apply(scope, arguments);
  }; 
  listenerList.push([listenerId, callbackFunc]);
  var params = this;
  return (function () { callbackFunc(params[name], undefined, null) }); // return init function
};

Parameters.prototype.notify = function(name, newValue, oldValue) {
  var listenerList = this.listeners[name];
  if (listenerList !== undefined) {
    for (var i = 0; i < listenerList.length; i++) {
      var listenerId = listenerList[i][0];
      var callback = listenerList[i][1];
      if (listenerId == null || this.__currentSender == null || listenerId != this.__currentSender) {
        callback(newValue, oldValue, this.__currentSender);
      }
    }
  }
  this.__currentSender = null;
};

Parameters.prototype.set = function(name, value, sender) {
  this.__currentSender = sender;
  this[name] = value;
};

export function Bus() {
  this.listeners = {};
}

Bus.prototype.subscribe = function(event, callback, listenerId) {
  var listenerList = this.listeners[event];
  if (listenerList === undefined) {
    listenerList = [];
    this.listeners[event] = listenerList;
  }
  if (listenerId == undefined) listenerId = null;
  listenerList.push([callback, listenerId]);
  return callback;
};

Bus.prototype.unsubscribe = function(event, callback) {
  const listenerList = this.listeners[event];
  for (let i = 0; i < listenerList.length; i++) {
    if (listenerList[i][0] === callback) {
      listenerList.splice(i, 1);
      return;
    }
  }
};

Bus.prototype.notify = function(event, data, sender) {
  var listenerList = this.listeners[event];
  if (listenerList !== undefined) {
    for (var i = 0; i < listenerList.length; i++) {
      const callback = listenerList[i][0];
      const listenerId = listenerList[i][1];
      if (sender == undefined || listenerId == null  || listenerId != sender) {
        try {
          callback(data);
        } catch(e) {
          console.error(e);
        }
      }
    }
  }
};

Bus.Observable = function(initValue) {
  this.value = initValue;
};

Bus.prototype.defineObservable = function(scope, name, initValue, eventName) {
  if (eventName == undefined) eventName = name;
  var observable = new Bus.Observable(initValue);
  var bus = this;
  return Object.defineProperty(scope, name, {
    get: function() { return observable.value;},
    set: function(value) { 
      observable.value = value;
      bus.notify(eventName, value);
    }
  });
};

export function config(obj, props) {
  for (var key in props) {
    obj[key] = props[key];   
  }
  return obj;
}

export {NumberWidget as Number}
