/**
 * @class KBWidget
 *
 * A KBase widget. Lorem ipsum dolor sit amet, consectetur adipisicing elit,
 * sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
 * ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
 * ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
 * velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
 * cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
 * est laborum.
 *
 * And here's an example:
 *
 *     @example
 *     var widget = $.KBWidget({
 *         name: "MyFancyWidget",
 *         parent: "MommyWidget",
 *         init: function () {}
 *     });
 */

var $ = require('jquery');
var jqElem = require('./jqElem');

var KBase, KBWidget;

var ucfirst = function (string) {
  if (string != undefined && string.length) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

var willChangeNoteForName = function (name) {
  return 'willChangeValueFor' + ucfirst(name);
};

var didChangeNoteForName = function (name) {
  return 'didChangeValueFor' + ucfirst(name);
};

var widgetRegistry = {};
if (KBase === undefined) {
  KBase = {
    _functions: {

      getter: function (name) {
        return function () {
          return this.valueForKey(name);
        }
      },

      setter: function (name) {
        return function (newVal) {
          return this.setValueForKey(name, newVal);
        }
      },

      getter_setter: function (name) {

        return function (newVal) {
          if (arguments.length == 1) {
            return this.setValueForKey(name, newVal);
          }
          else {
            return this.valueForKey(name);
          }
        }
      }
    }
  }
}

function subclass(constructor, superConstructor) {
  function surrogateConstructor() {}

  surrogateConstructor.prototype = superConstructor.prototype;

  var prototypeObject = new surrogateConstructor();
  prototypeObject.constructor = constructor;

  constructor.prototype = prototypeObject;
}

KBWidget = function (def) {
  def = (def || {});
  var name = def.name;
  var parent = def.parent;

  if (parent == undefined) {
    parent = 'kbaseWidget';
  }

  var asPlugin = def.asPlugin;
  if (asPlugin === undefined) {
    asPlugin = true;
  }

  var Widget = function ($elem) {
    this.$elem = $elem;
    this.options = $.extend(true, {}, def.options, this.constructor.prototype.options);
    return this;
  };

  if (name) {
    var directName = name;
    directName = directName.replace(/^kbase/, '');
    directName = directName.charAt(0).toLowerCase() + directName.slice(1);

    KBase[directName] = function (options, $elem) {
      var $w = new Widget();
      if ($elem == undefined) {
        $elem = jqElem('div');
      }
      $w.$elem = $elem;

      if (options == undefined) {
        options = {};
      }
      options.headless = true;

      $w.init(options);
      $w._init = true;
      $w.trigger('initialized');
      return $w;
    };

    widgetRegistry[name] = Widget;

    if (def == undefined) {
      def = parent;
      parent = 'kbaseWidget';
      if (def == undefined) {
        def = {};
      }
    }
  }

  if (parent) {
    var pWidget = widgetRegistry[parent];
    if (pWidget === undefined)
      throw new Error("Parent widget is not registered. Cannot find " + parent
        + " for " + name);
    subclass(Widget, pWidget);
  }

  var defCopy = $.extend(true, {}, def);

  Widget.prototype.__attributes = {};

  if (defCopy._accessors != undefined) {

    //for (var accessor in defCopy._accessors) {
    $.each(
      defCopy._accessors,
      $.proxy(function (idx, accessor) {
        var info = {
          name: accessor,
          setter: accessor,
          getter: accessor,
          type: 'rw'
        };

        if (typeof accessor === 'object') {

          info.setter = accessor.name;
          info.getter = accessor.name;

          for (var key in accessor) {
            info[key] = accessor[key];
          }

        }

        Widget.prototype.__attributes[info.name] = info;

        if (info.setter == info.getter && info.type.match(/rw/)) {

          Widget.prototype[info.getter] = KBase._functions.getter_setter(info.name);

        }
        else {

          if (info.type.match(/w/) && info.setter != undefined) {
            Widget.prototype[info.setter] = KBase._functions.setter(info.name);
          }

          if (info.type.match(/r/) && info.getter != undefined) {
            Widget.prototype[info.getter] = KBase._functions.getter(info.name);
          }

        }

      }, this)
    );

    defCopy._accessors = undefined;
  }

  var extension = $.extend(true, {}, Widget.prototype.__attributes, widgetRegistry[parent].prototype.__attributes);
  Widget.prototype.__attributes = extension;

  for (var prop in defCopy) {
    //hella slick closure based _super method adapted from JQueryUI.
    //*

    if ($.isFunction(defCopy[prop])) {

      Widget.prototype[prop] = (function (methodName, method) {
        var _super, _superMethod;

        if (parent) {
          _super = function () {
            return widgetRegistry[parent].prototype[methodName].apply(this, arguments);
          };

          _superMethod = function (superMethodName) {
            return widgetRegistry[parent].prototype[superMethodName].apply(this, Array.prototype.slice.call(arguments, 1));
          };
        }
        else {
          _super = function () {
            throw "No parent method defined! Play by the rules!";
          };

          _superMethod = function () {
            throw "No parent method defined! Play by the rules!";
          };
        }

        return function () {
          var _oSuper = this._super;
          var _oSuperMethod = this._superMethod;
          this._super = _super;
          this._superMethod = _superMethod;

          var retValue = method.apply(this, arguments);

          this._super = _oSuper;
          this._superMethod = _oSuperMethod;

          return retValue;
        }
      })(prop, defCopy[prop]);

    }
    else {
      Widget.prototype[prop] = defCopy[prop];
    }
  }

  if (parent) {
    Widget.prototype.options = $.extend(true, {}, widgetRegistry[parent].prototype.options, Widget.prototype.options);
  }

  if (asPlugin) {
    var widgetConstructor = function (method, args) {

      if (this.length > 1) {
        var methodArgs = arguments;
        $.each(
          this,
          function (idx, elem) {
            widgetConstructor.apply($(elem), methodArgs);
          }
        );
        return this;
      }

      if (this.data(name) == undefined) {
        this.data(name, new Widget(this));
      }

      // Method calling logic
      if (Widget.prototype[method]) {
        return Widget.prototype[method].apply(
          this.data(name),
          Array.prototype.slice.call(arguments, 1)
        );
      } else if (typeof method === 'object' || !method) {
        //return this.data(name).init( arguments );
        //var args = arguments;
        var $w = this.data(name);
        if ($w._init === undefined) {
          $w = Widget.prototype.init.apply($w, arguments);
        }
        $w._init = true;
        $w.trigger('initialized');
        return $w;
      } else {
        $.error('Method ' + method + ' does not exist on ' + name);
      }

      return this;

    };
    //widgetConstructor.name = name; <-- name is a reserved word in ES6
  }

  /**
   * Registers events on this element.
   * @param {String} name The event name to register
   * @param {Function} callback The function to call when an event is
   *        emitted.
   */
  this.on = function (evt, callback) {
    this.$elem.bind(evt, callback);
    return this;
  };

  /**
   * Emits an event.
   * @param {String} name The event name
   * @param {Object} data The data to emit with the event
   */
  this.emit = function (evt, data) {
    this.$elem.trigger(evt, data);
    return this;
  };

  /**
   * Unregisters events on this element.
   * @param {String} name The event name to unregister from
   */
  this.off = function (evt) {
    this.$elem.unbind(evt);
    return this;
  };

  if (name !== undefined) {
    Widget.prototype[name] = function () {
      return widgetConstructor.apply(this.$elem, arguments);
    };

    return widgetConstructor;
  } else {
    return this;
  }
};

/**
 * @method registry
 * The set of globally-registered widgets.
 * @return {Object} The registry
 * @return {String} return.key The name of the widget
 * @return {Object} return.value The widget
 * @static
 */
KBWidget.registry = function () {
  var registry = {};
  for (var widget in widgetRegistry) {
    if (widget !== 'kbaseWidget') {
      registry[widget] = widgetRegistry[widget];
    }
  }
  return registry;
};

/**
 * @method resetRegistry
 * Unregisters all global widgets.
 * Note that this does not delete the widgets if another reference to them
 * is maintained (e.g., by variable assignment).
 * @static
 * @chainable
 */
KBWidget.resetRegistry = function () {
  for (var widget in widgetRegistry) {
    if (widget !== 'kbaseWidget') {
      delete widgetRegistry[widget];
    }
  }
  return this;
};

// Create the root widget. This is added to the factory's registry and
// is the implicit root of all KBase Widgets.
new KBWidget(
  {
    name: 'kbaseWidget',

    /**
     * Writes text to console.
     * @param {String} txt The text to write.
     */
    dbg: function (txt) { if (window.console) console.log(txt); },


    callAfterInit: function _callAfterInit(func) {
      var $me = this;
      var delayer = function () {

        //var recursion = arguments.callee;

        if ($me._init) {
          func();
        }
        else {
          setTimeout(_callAfterInit, 10);
        }
      };

      delayer();
      return delayer;
    },

    /**
     * Initializes the widget.
     * @param {Object} args Initialization arguments
     */
    init: function (args) {

      this._attributes = {};

      var opts = $.extend(true, {}, this.options);
      this.options = $.extend(true, {}, opts, args);

      for (var arg in args) {
        if (args[arg] == undefined && this.options[arg] != undefined) {
          delete this.options[arg];
        }
      }

      for (var attribute in this.__attributes) {
        if (this.options[attribute] != undefined) {
          var setter = this.__attributes[attribute].setter;
          this[setter](this.options[attribute]);
        }
      }

      if (this.options.template) {
        this.callAfterInit(
          $.proxy(function () {
            this.appendUI(this.$elem);
          }, this)
        );
      }

      return this;
    },

    appendUI: function ($elem) {
      if (this.options.template) {
        $.ajax(this.options.template)
          .done($.proxy(function (res) { this.templateSuccess.apply(this, arguments) }, this))
          .fail($.proxy(function (res) { this.templateFailure.apply(this, arguments) }, this))
      }

      return $elem;
    },

    templateSuccess: function (templateString) {

      var template = Handlebars.compile(templateString);

      var html = template();

      var res = template(this.templateContent());

      var $res = jqElem('span').append(res);
      this._rewireIds($res, this);

      this.$elem.append($res);


    },

    templateFailure: function (res) {
      this.dbg("Template load failure");
      this.dbg(res);
    },

    templateContent: function () {
      return this.options.templateContent || {};
    },


    /**
     * Sets an alert to display
     * @param {String} msg The message to display
     */
    alert: function (msg) {
      if (msg == undefined) {
        msg = this.data('msg');
      }
      this.data('msg', msg);

      return this;
    },

    valueForKey: function (attribute) {
      //this.trigger('didAccessValueFor' + name + '.kbase');
      return this._attributes[attribute];
    },

    setValueForKey: function (attribute, newVal) {

      var triggerValues = undefined;
      var oldVal = this.valueForKey(attribute);

      if (newVal != oldVal) {

        var willChangeNote = willChangeNoteForName(attribute);

        triggerValues = {
          oldValue: oldVal,
          newValue: newVal
        };
        this.trigger(willChangeNote, triggerValues);

        this._attributes[attribute] = triggerValues.newValue;

        if (triggerValues.newValue != oldVal) {
          var didChangeNote = didChangeNoteForName(attribute);
          this.trigger(didChangeNote, triggerValues);
        }
      }

      return this.valueForKey(attribute);
    },

    setValuesForKeys: function (obj) {

      var objCopy = $.extend({}, obj);

      for (var attribute in this.__attributes) {
        if (objCopy[attribute] != undefined) {
          var setter = this.__attributes[attribute].setter;
          this[setter](objCopy[attribute]);
          delete objCopy[attribute];
        }
      }

      this.options = $.extend(this.options, objCopy);

    },

    /**
     * Sets data.
     * @param {Object} key The key for the data
     * @param {Object} value The data itself
     */
    data: function (key, val) {

      if (this.options._storage == undefined) {
        this.options._storage = {};
      }

      if (arguments.length == 2) {
        this.options._storage[key] = val;
      }

      if (key != undefined) {
        return this.options._storage[key];
      }
      else {
        return this.options._storage;
      }
    },

    _rewireIds: function ($elem, $target) {
      if ($target == undefined) {
        $target = $elem;
      }

      if ($elem.attr('id')) {
        $target.data($elem.attr('id'), $elem);
        $elem.removeAttr('id');
      }

      $.each(
        $elem.find('[id]'),
        function (idx) {
          $target.data($(this).attr('id'), $(this));
          $(this).attr('data-id', $(this).attr('id'));
          $(this).removeAttr('id');
        }
      );

      return $elem;
    },

    sortCaseInsensitively: function (a, b) {
      if (a.toLowerCase() < b.toLowerCase()) { return -1 }
      else if (a.toLowerCase() > b.toLowerCase()) { return 1 }
      else { return 0 }
    },

    sortByKey: function (key, insensitively) {
      if (insensitively) {
        return function (a, b) {
          if (a[key].toLowerCase() < b[key].toLowerCase()) { return -1 }
          else if (a[key].toLowerCase() > b[key].toLowerCase()) { return 1 }
          else { return 0 }
        }
      }
      else {
        return function (a, b) {
          if (a[key] < b[key]) { return -1 }
          else if (a[key] > b[key]) { return 1 }
          else { return 0 }
        }
      }
    },

    trigger: function () {
      this.$elem.trigger.apply(this.$elem, arguments);
    },

    on: function () {
      this.$elem.on.apply(this.$elem, arguments);
    },

    off: function () {
      this.$elem.off.apply(this.$elem, arguments);
    },

    makeObserverCallback: function ($target, attribute, callback) {
      return $.proxy(function (e, vals) {
        e.preventDefault();
        e.stopPropagation();

        callback.call(this, e, $target, vals);

      }, this)
    },

    observe: function ($target, attribute, callback) {
      $target.on(
        attribute,
        $target,
        this.makeObserverCallback($target, attribute, callback)
      );

    },

    unobserve: function ($target, attribute, callback) {
      $target.off(
        attribute,
        $target,
        this.makeObserverCallback($target, attribute, callback)
      );
    },

    kb_bind: function ($target, attribute, callback) {
      var event = didChangeNoteForName(attribute);
      this.observe($target, event, callback);
    },

    kb_unbind: function ($target, attribute, callback) {
      var event = didChangeNoteForName(attribute);
      //$target.off(event, callback);
      this.unobserve($target, event, callback);
    },

    uuid: function () {

      var result = '';
      for (var i = 0; i < 32; i++) {
        result += Math.floor(Math.random() * 16).toString(16).toUpperCase();
      }

      return 'uuid-' + result;
    }
  }
);

module.exports = KBWidget;