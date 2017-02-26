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

var Modals = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_modals';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-modals';
    var DATA_KEY = _util2.default.API_PREFIX + '.modals';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var Default = {
        dismissible: true,
        opacity: 0.5,
        in_duration: 300,
        out_duration: 200,
        starting_top: '4%'
    };

    var DefaultType = {
        dismissible: 'boolean',
        opacity: 'number',
        in_duration: 'number',
        out_duration: 'number',
        starting_top: 'string'
    };

    var ClassName = {
        MODAL: 'bas-ui-modal',
        MODAL_CLOSE: 'bas-ui-modal-close',
        MODAL_TRIGGER: 'bas-ui-modal-trigger',
        MODAL_OVERLAY: 'bas-ui-modal-overlay',
        MODAL_TOP_SHEET: 'bas-ui-modal-top-sheet',
        MODAL_BOTTOM_SHEET: 'bas-ui-modal-bottom-sheet',
        MODAL_LEFT_SHEET: 'bas-ui-modal-left-sheet',
        MODAL_RIGHT_SHEET: 'bas-ui-modal-right-sheet',
        MODAL_FULL_SHEET: 'bas-ui-modal-full-sheet'
    };

    var Selector = {
        MODAL: '.' + ClassName.MODAL,
        MODAL_CLOSE: '.' + ClassName.MODAL_CLOSE,
        MODAL_TRIGGER: '.' + ClassName.MODAL_TRIGGER,
        MODAL_OVERLAY: '.' + ClassName.MODAL_OVERLAY,
        MODAL_TOP_SHEET: '.' + ClassName.MODAL_TOP_SHEET,
        MODAL_BOTTOM_SHEET: '.' + ClassName.MODAL_BOTTOM_SHEET,
        MODAL_LEFT_SHEET: '.' + ClassName.MODAL_LEFT_SHEET,
        MODAL_RIGHT_SHEET: '.' + ClassName.MODAL_RIGHT_SHEET,
        MODAL_FULL_SHEET: '.' + ClassName.MODAL_FULL_SHEET
    };

    var Event = {
        SHOW: 'show' + EVENT_KEY,
        SHOWN: 'shown' + EVENT_KEY,
        HIDE: 'hide' + EVENT_KEY,
        HIDDEN: 'hidden' + EVENT_KEY,
        KEYUP_DATA_API: 'keyup' + EVENT_KEY + DATA_API_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    var stack = 0;
    var lastID = 0;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Modals = function () {
        function Modals(element, config) {
            _classCallCheck(this, Modals);

            var _self = this;

            _self._trigger = $(element);
            _self._target = Modals._getTargetFromElement($(element));
            _self._overlay = $('<div class="' + ClassName.MODAL_OVERLAY + '"></div>');
            _self._overlayID = Modals._generateID();
            _self._lStack = ++stack;

            // Set config
            _self.config = config;

            // Set top
            _self._config.starting_top = (_self._target.offset().top - $(window).scrollTop()) / 1.15;

            // Click
            _self._trigger.on(Event.CLICK_DATA_API, function (e) {
                // Show
                _self.show();
            });
        }

        // Getters / Setters
        // ------------------------------------------------------------------------

        _createClass(Modals, [{
            key: 'show',


            // Public
            // ------------------------------------------------------------------------

            value: function show() {
                var _self = this;
                _self._open($(_self._target));
            }
        }, {
            key: 'hide',
            value: function hide() {
                var _self = this;
                _self._close($(_self._target));
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                var _self = this;
                $.removeData(_self._trigger, DATA_KEY);

                _self._trigger = null;
                _self._target = null;
                _self._overlay = null;
                _self._overlayID = 0;
                _self._lStack = 0;

                // Set config
                _self.config = null;
            }

            // Private
            // ------------------------------------------------------------------------

            // Open

        }, {
            key: '_open',
            value: function _open(object) {
                var _self = this;
                var _body = $('body');

                _body.css('overflow', 'hidden');

                _self._lStack = ++stack;

                // Store a reference of the overlay
                _self._overlay.attr('id', _self._overlayID).css('z-index', 1000 + _self._lStack * 2);
                object.data('overlay-id', _self._overlayID).css('z-index', 1000 + _self._lStack * 2 + 1);

                // Add overlay
                _body.append(_self._overlay);

                // Set hide events
                if (_self._config.dismissible) {
                    _self._overlay.click(function () {
                        _self.hide();
                    });
                    // Return on ESC
                    $(document).on(Event.KEYUP_DATA_API + _self._overlayID, function (e) {
                        if (e.keyCode === 27) {
                            // ESC key
                            _self.hide();
                        }
                    });
                }

                object.find(Selector.MODAL_CLOSE).on('click.close', function (e) {
                    _self.hide();
                });

                // Prepare elements
                _self._overlay.css({ display: "block", opacity: 0 });

                object.css({
                    display: "block",
                    opacity: 0
                });

                object.data('associated-overlay', _self._overlay[0]);

                // Show overlay
                _self._overlay.velocity({ opacity: _self._config.opacity }, {
                    duration: _self._config.in_duration,
                    queue: false,
                    ease: "easeOutCubic"
                });

                // Top and Full Sheet
                object.trigger(Event.SHOW);
                if (object.hasClass(ClassName.MODAL_TOP_SHEET) || object.hasClass(ClassName.MODAL_FULL_SHEET)) {
                    object.velocity({ top: "0", opacity: 1 }, {
                        duration: _self._config.in_duration,
                        queue: false,
                        ease: "easeOutCubic",
                        // Handle modal ready callback
                        complete: function complete() {
                            object.trigger(Event.SHOWN);
                        }
                    });
                } // Bottom Sheet
                else if (object.hasClass(ClassName.MODAL_BOTTOM_SHEET)) {
                        object.velocity({ bottom: "0", opacity: 1 }, {
                            duration: _self._config.in_duration,
                            queue: false,
                            ease: "easeOutCubic",
                            // Handle modal ready callback
                            complete: function complete() {
                                object.trigger(Event.SHOWN);
                            }
                        });
                    } // Left Sheet
                    else if (object.hasClass(ClassName.MODAL_LEFT_SHEET)) {
                            object.velocity({ left: "0", opacity: 1 }, {
                                duration: _self._config.in_duration,
                                queue: false,
                                ease: "easeOutCubic",
                                // Handle modal ready callback
                                complete: function complete() {
                                    object.trigger(Event.SHOWN);
                                }
                            });
                        } // Right Sheet
                        else if (object.hasClass(ClassName.MODAL_RIGHT_SHEET)) {
                                object.velocity({ right: "0", opacity: 1 }, {
                                    duration: _self._config.in_duration,
                                    queue: false,
                                    ease: "easeOutCubic",
                                    // Handle modal ready callback
                                    complete: function complete() {
                                        object.trigger(Event.SHOWN);
                                    }
                                });
                            } // Normal
                            else {
                                    $.Velocity.hook(object, "scaleX", 0.7);
                                    object.css({ top: _self._config.starting_top });
                                    object.velocity({ top: "10%", opacity: 1, scaleX: '1' }, {
                                        duration: _self._config.in_duration,
                                        queue: false,
                                        ease: "easeOutCubic",
                                        // Handle modal ready callback
                                        complete: function complete() {
                                            object.trigger(Event.SHOWN);
                                        }
                                    });
                                }
            }

            // Close

        }, {
            key: '_close',
            value: function _close(object) {
                var _self = this;
                var _body = $('body');

                _body.css('overflow', '');

                // Remove events
                object.find(Selector.MODAL_CLOSE).off('click.close');
                $(document).off(Event.KEYUP_DATA_API + _self._overlayID);

                // Hide overlay
                _self._overlay.velocity({ opacity: 0 }, {
                    duration: _self._config.out_duration, queue: false, ease: "easeOutQuart"
                });

                // Top and Full Sheet
                object.trigger(Event.HIDE);
                if (object.hasClass(ClassName.MODAL_TOP_SHEET) || object.hasClass(ClassName.MODAL_FULL_SHEET)) {
                    object.velocity({ top: "-100%", opacity: 0 }, {
                        duration: _self._config.out_duration,
                        queue: false,
                        ease: "easeOutCubic",
                        // Handle modal ready callback
                        complete: function complete() {
                            _self._overlay.css({ display: "none" });

                            object.trigger(Event.HIDDEN);

                            _self._overlay.remove();
                            stack--;
                        }
                    });
                } // Bottom Sheet
                else if (object.hasClass(ClassName.MODAL_BOTTOM_SHEET)) {
                        object.velocity({ bottom: "-100%", opacity: 0 }, {
                            duration: _self._config.out_duration,
                            queue: false,
                            ease: "easeOutCubic",
                            // Handle modal ready callback
                            complete: function complete() {
                                _self._overlay.css({ display: "none" });

                                object.trigger(Event.HIDDEN);

                                _self._overlay.remove();
                                stack--;
                            }
                        });
                    } // Left Sheet
                    else if (object.hasClass(ClassName.MODAL_LEFT_SHEET)) {
                            object.velocity({ left: "-100%", opacity: 0 }, {
                                duration: _self._config.out_duration,
                                queue: false,
                                ease: "easeOutCubic",
                                // Handle modal ready callback
                                complete: function complete() {
                                    _self._overlay.css({ display: "none" });

                                    object.trigger(Event.HIDDEN);

                                    _self._overlay.remove();
                                    stack--;
                                }
                            });
                        } // Right Sheet
                        else if (object.hasClass(ClassName.MODAL_RIGHT_SHEET)) {
                                object.velocity({ right: "-100%", opacity: 0 }, {
                                    duration: _self._config.out_duration,
                                    queue: false,
                                    ease: "easeOutCubic",
                                    // Handle modal ready callback
                                    complete: function complete() {
                                        _self._overlay.css({ display: "none" });

                                        object.trigger(Event.HIDDEN);

                                        _self._overlay.remove();
                                        stack--;
                                    }
                                });
                            } // Normal
                            else {
                                    object.velocity({ top: _self._config.starting_top, opacity: 0, scaleX: 0.7 }, {
                                        duration: _self._config.out_duration,
                                        complete: function complete() {

                                            $(this).css('display', 'none');

                                            object.trigger(Event.HIDDEN);

                                            _self._overlay.remove();
                                            stack--;
                                        }
                                    });
                                }
            }
        }, {
            key: '_updateOptions',
            value: function _updateOptions() {
                var _self = this;

                // Override options from trigger data
                if (_self._trigger !== undefined) {
                    if (_self._trigger.data('dismissible') !== undefined) {
                        _self._config.dismissible = _self._trigger.data('dismissible');
                    }
                    if (_self._trigger.data('opacity') !== undefined) {
                        _self._config.opacity = _self._trigger.data('opacity');
                    }
                    if (_self._trigger.data('in_duration') !== undefined) {
                        _self._config.in_duration = _self._trigger.data('in_duration');
                    }
                    if (_self._trigger.data('out_duration') !== undefined) {
                        _self._config.out_duration = _self._trigger.data('out_duration');
                    }
                }

                // set options.....
            }

            // Static
            // ------------------------------------------------------------------------

        }, {
            key: 'config',
            get: function get() {
                var _self = this;
                return _self._config;
            },
            set: function set(config) {
                var _self = this;
                _self._config = Modals._getConfig(config);
                _self._updateOptions();
            }
        }], [{
            key: '_getConfig',
            value: function _getConfig(config) {
                config = $.extend({}, Default, config);
                _util2.default.typeCheckConfig(NAME, config, DefaultType);
                return config;
            }
        }, {
            key: '_getTargetFromElement',
            value: function _getTargetFromElement(element) {
                var selector = $("#" + element.attr('data-target'));
                return selector ? selector : null;
            }
        }, {
            key: '_generateID',
            value: function _generateID() {
                lastID++;
                return ClassName.MODAL_OVERLAY + '-' + lastID;
            }
        }, {
            key: '_jQueryInterface',
            value: function _jQueryInterface(config, opt) {
                return this.each(function () {
                    var $this = $(this);
                    var data = $this.data(DATA_KEY);
                    var _config = $.extend({}, Default, $this.data(), (typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object' && config);

                    if (!data) {
                        data = new Modals(this, _config);
                        $this.data(DATA_KEY, data);
                    } else {
                        data.config = _config;
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config](opt);
                    }
                });
            }
        }, {
            key: 'VERSION',
            get: function get() {
                return VERSION;
            }
        }, {
            key: 'ClassName',
            get: function get() {
                return ClassName;
            }
        }, {
            key: 'Selector',
            get: function get() {
                return Selector;
            }
        }]);

        return Modals;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // READY & OBSERVE


    if (_util2.default.mutationObserver === null) {
        $(document).ready(function () {
            $(Selector.MODAL_TRIGGER).bas_ui_modals();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.MODAL_TRIGGER, function () {
            var _this = $(this);
            Modals._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Modals._jQueryInterface;
    $.fn[NAME].Constructor = Modals;

    return Modals;
}(jQuery);

BasUI.Modals = Modals;
exports.default = Modals;
