import Util from '../lib/util';

const Dropdown = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_dropdown`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-dropdown`;
    const DATA_KEY     = `${Util.API_PREFIX}.dropdown`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Default = {
        inDuration : 300,
        outDuration: 225,
        hover      : true,
        gutter     : 0,
        belowOrigin: false
    };

    const DefaultType = {
        inDuration : 'number',
        outDuration: 'number',
        hover      : 'boolean',
        gutter     : 'number',
        belowOrigin: 'boolean'
    };

    const ClassName = {
        DROPDOWN             : 'bas-ui-dropdown',
        DROPDOWN_TRIGGER     : 'dropdown-trigger',
        DROPDOWN_BELOW_ORIGIN: 'bas-ui-dropdown-below-origin',
        DROPDOWN_LEFT_BOTTOM : 'bas-ui-dropdown-left-bottom',
        DROPDOWN_RIGHT_BOTTOM: 'bas-ui-dropdown-right-bottom'
    };

    const Selector = {
        DROPDOWN             : `.${ClassName.DROPDOWN}`,
        DROPDOWN_TRIGGER     : `.${ClassName.DROPDOWN_TRIGGER}`,
        DROPDOWN_BELOW_ORIGIN: `.${ClassName.DROPDOWN_BELOW_ORIGIN}`,
        DROPDOWN_LEFT_BOTTOM : `.${ClassName.DROPDOWN_LEFT_BOTTOM}`,
        DROPDOWN_RIGHT_BOTTOM: `.${ClassName.DROPDOWN_RIGHT_BOTTOM}`
    };

    const Event = {
        SHOW                : `show${EVENT_KEY}`,
        SHOWN               : `shown${EVENT_KEY}`,
        HIDE                : `hide${EVENT_KEY}`,
        HIDDEN              : `hidden${EVENT_KEY}`,
        TOUCH_START_DATA_API: `touchstart${EVENT_KEY}${DATA_API_KEY}`,
        MOUSE_ENTER_DATA_API: `mouseenter${EVENT_KEY}${DATA_API_KEY}`,
        MOUSE_LEAVE_DATA_API: `mouseleave${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API      : `click${EVENT_KEY}${DATA_API_KEY}`
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Dropdown {

        constructor(element, config) {
            let _self = this;

            _self._trigger      = $(element);
            _self._target       = Dropdown._getTargetFromElement($(element));
            _self._target_items = Dropdown._getTargetItemsFromElement($(element));

            // Set config
            _self.config = config;

            // Close on items click
            _self._target_items.on(Event.CLICK_DATA_API, function (e) {
                let element = $(e.target);
                if (element.attr('data-target') === undefined) {
                    _self.hide();
                }
            });

            // Set Events
            // Is Touch
            if (Util.isTouch) {
                _self._trigger.on(Event.CLICK_DATA_API, function (e) {
                    _self.show();
                });

                $(document).on(Event.TOUCH_START_DATA_API, function (e) {
                    let element = $(e.target);
                    if (!element.hasClass(ClassName.DROPDOWN) && element.parents(Selector.DROPDOWN).length !== 1 && element.attr('data-target') === undefined) {
                        _self.hide();
                    }
                });
            } else {
                // Close on html click
                $(document).on(Event.CLICK_DATA_API, function (e) {
                    let element = $(e.target);
                    if (!element.hasClass(ClassName.DROPDOWN) && element.parents(Selector.DROPDOWN).length !== 1 && element.attr('data-target') === undefined) {
                        _self.hide();
                    }
                });

                // Hover
                if (_self._config.hover) {
                    let _close_process = false;

                    _self._trigger.on(Event.MOUSE_ENTER_DATA_API, function (e) {
                        _self.show();
                        _close_process = false;
                    });

                    _self._trigger.on(Event.MOUSE_LEAVE_DATA_API, function (e) {
                        _close_process = true;
                        setTimeout(function () {
                            if (_close_process) {
                                _self.hide();
                                _close_process = false;
                            }
                        }, 350);
                    });

                    _self._target.on(Event.MOUSE_LEAVE_DATA_API, function (e) {
                        _close_process = true;
                        setTimeout(function () {
                            if (_close_process) {
                                _self.hide();
                                _close_process = false;
                            }
                        }, 350);
                    });

                    _self._target.on(Event.MOUSE_ENTER_DATA_API, function (e) {
                        _close_process = false;
                    });
                } else { // Click
                    _self._trigger.on(Event.CLICK_DATA_API, function (e) {
                        _self.show();
                    });
                }
            }
        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        static get ClassName() {
            return ClassName;
        }

        static get Selector() {
            return Selector;
        }

        get config() {
            let _self = this;
            return _self._config;
        }

        set config(config) {
            let _self     = this;
            _self._config = Dropdown._getConfig(config);
            _self._updateOptions();
        }

        // Public
        // ------------------------------------------------------------------------

        show() {
            let _self = this;
            _self._open($(_self._target));
        }

        hide() {
            let _self = this;
            _self._close($(_self._target));
        }

        dispose() {
            $.removeData(this._trigger, DATA_KEY);
            this._trigger      = null;
            this._target       = null;
            this._target_items = null;
            this._config       = null;
        }

        // Private
        // ------------------------------------------------------------------------

        // Open
        _open(object) {
            let _self = this;

            if ((_self._config.hover && !object.hasClass('active')) || (!_self._config.hover && !object.hasClass('open'))) {

                object.addClass('active');

                object.trigger(Event.SHOW);
                object.stop(true, false).slideDown({
                    duration: _self._config.inDuration, easing: "easeOutQuart", queue: false, complete: function () {
                        object.trigger(Event.SHOWN);
                        object.addClass('open');
                        $(this).css('height', '');
                        object.focus();
                    }
                });
            }
        }

        // Close
        _close(object) {
            let _self = this;

            if ((_self._config.hover && object.hasClass('active')) || (!_self._config.hover && object.hasClass('open'))) {

                object.removeClass('active');

                object.trigger(Event.HIDE);

                object.stop(true, false).slideUp({
                    duration: _self._config.outDuration, easing: "easeOutQuart", queue: false, complete: function () {
                        object.trigger(Event.HIDDEN);
                        object.removeClass('open');
                        $(this).css('height', '');
                    }
                });

                // Close all dropdown children
                object.find(Selector.DROPDOWN).each(function () {
                    let element = $(this);

                    element.removeClass('active');

                    element.trigger(Event.HIDE);

                    element.stop(true, false).slideUp({
                        duration: (_self._config.outDuration / 2),
                        easing  : "easeOutQuart",
                        queue   : false,
                        complete: function () {
                            element.trigger(Event.HIDDEN);
                            $(this).removeClass('open');
                            $(this).css('height', '');
                        }
                    });
                });
            }
        }

        _setGutter(object) {
            let _self = this;

            if (_self._config.gutter === 0) {
                return;
            }

            let origin_height = _self._trigger.outerHeight(true);

            // Bottom
            if (object.hasClass(ClassName.DROPDOWN_LEFT_BOTTOM) || object.hasClass(ClassName.DROPDOWN_RIGHT_BOTTOM)) {

                // CSS
                object.css({
                    bottom: origin_height + _self._config.gutter
                });

            } else { // Top

                // CSS
                object.css({
                    top: origin_height + _self._config.gutter
                });
            }
        }

        _updateOptions() {
            let _self = this;

            // Override options from trigger data
            if (_self._trigger !== undefined) {
                if (_self._trigger.data('inDuration') !== undefined) {
                    _self._config.inDuration = _self._trigger.data('inDuration');
                }
                if (_self._trigger.data('outDuration') !== undefined) {
                    _self._config.outDuration = _self._trigger.data('outDuration');
                }
                if (_self._trigger.data('hover') !== undefined) {
                    _self._config.hover = _self._trigger.data('hover');
                }
                if (_self._trigger.data('gutter') !== undefined) {
                    _self._config.gutter = _self._trigger.data('gutter');
                }
                if (_self._trigger.data('belowOrigin') !== undefined) {
                    _self._config.belowOrigin = _self._trigger.data('belowOrigin');
                }
            }

            // If below Origin
            if (_self._config.belowOrigin) {
                _self._target.addClass(ClassName.DROPDOWN_BELOW_ORIGIN);
            } else {
                _self._target.removeClass(ClassName.DROPDOWN_BELOW_ORIGIN);
            }

            // Set Gutter
            _self._setGutter(_self._target);
        }

        // Static
        // ------------------------------------------------------------------------

        static _getConfig(config) {
            config = $.extend({}, Default, config);
            Util.typeCheckConfig(NAME, config, DefaultType);
            return config;
        }

        static _getTargetFromElement(element) {
            let selector = $("#" + element.attr('data-target'));
            return selector ? selector : null;
        }

        static _getTargetItemsFromElement(element) {
            let selector = $("#" + element.attr('data-target') + ' li');
            return selector ? selector : null;
        }

        static _jQueryInterface(config, opt) {
            return this.each(function () {
                let $this   = $(this);
                let data    = $this.data(DATA_KEY);
                let _config = $.extend(
                    {},
                    Default,
                    $this.data(),
                    typeof config === 'object' && config
                );

                if (!data) {
                    data = new Dropdown(this, _config);
                    $this.data(DATA_KEY, data);
                } else {
                    data.config = _config;
                }

                if (typeof config === 'string') {
                    if (data[config] === undefined) {
                        throw new Error(`No method named "${config}"`);
                    }
                    data[config](opt);
                }
            });
        }

    }

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // READY & OBSERVE
    if (Util.mutationObserver === null) {
        $(document).ready(function () {
            $(Selector.DROPDOWN_TRIGGER).bas_ui_dropdown();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.DROPDOWN_TRIGGER, function () {
            let _this = $(this);
            Dropdown._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Dropdown._jQueryInterface;
    $.fn[NAME].Constructor = Dropdown;

    return Dropdown;

})(jQuery);

BasUI.Dropdown = Dropdown;
export default Dropdown;
