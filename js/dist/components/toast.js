'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Toast = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_toast';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-toast';
    var DATA_KEY = _util2.default.API_PREFIX + '.toast';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var Default = {};

    var DefaultType = {};

    var ClassName = {};

    var Selector = {};

    var Event = {
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Toast = function () {
        function Toast(element, config) {
            _classCallCheck(this, Toast);

            var _self = this;
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Toast, [{
            key: 'dispose',


            // Public
            // ------------------------------------------------------------------------

            value: function dispose() {
                $.removeData(this._trigger, DATA_KEY);
            }

            // Private
            // ------------------------------------------------------------------------


            // Static
            // ------------------------------------------------------------------------

        }], [{
            key: 'success',


            // Public
            // ------------------------------------------------------------------------

            value: function success() {
                toastr.success.apply(this, arguments);
            }
        }, {
            key: 'info',
            value: function info() {
                toastr.info.apply(this, arguments);
            }
        }, {
            key: 'warning',
            value: function warning() {
                toastr.warning.apply(this, arguments);
            }
        }, {
            key: 'error',
            value: function error() {
                toastr.error.apply(this, arguments);
            }
        }, {
            key: 'remove',
            value: function remove() {
                toastr.remove();
            }
        }, {
            key: 'clear',
            value: function clear() {
                toastr.clear();
            }
        }, {
            key: '_jQueryInterface',
            value: function _jQueryInterface(config) {
                return this.each(function () {
                    var $this = $(this);
                    var data = $this.data(DATA_KEY);
                    var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

                    if (!data) {
                        data = new Cards(this, _config);
                        $this.data(DATA_KEY, data);
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config]();
                    }
                });
            }
        }, {
            key: 'VERSION',
            get: function get() {
                return VERSION;
            }
        }, {
            key: 'options',
            get: function get() {
                return toastr.options;
            }

            // Setters
            // ------------------------------------------------------------------------

            ,
            set: function set(opt) {
                toastr.options = opt;
            }
        }]);

        return Toast;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // READY & OBSERVE


    if (_util2.default.mutationObserver === null) {} else {}
    // .bas_ui_observe(selector, onAdded, onRemoved)


    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Toast._jQueryInterface;
    $.fn[NAME].Constructor = Toast;

    return Toast;
}(jQuery);

BasUI.Toast = Toast;
exports.default = Toast;
