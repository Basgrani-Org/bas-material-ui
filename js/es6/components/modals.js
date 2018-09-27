import Util from '../lib/util';

const Modals = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_modals`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-modals`;
    const DATA_KEY     = `${Util.API_PREFIX}.modals`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Default = {
        dismissible : true,
        opacity     : 0.5,
        in_duration : 300,
        out_duration: 200,
        starting_top: '4%',
    };

    const DefaultType = {
        dismissible : 'boolean',
        opacity     : 'number',
        in_duration : 'number',
        out_duration: 'number',
        starting_top: 'string',
    };

    const ClassName = {
        MODAL             : 'bas-ui-modal',
        MODAL_CLOSE       : 'bas-ui-modal-close',
        MODAL_TRIGGER     : 'bas-ui-modal-trigger',
        MODAL_OVERLAY     : 'bas-ui-modal-overlay',
        MODAL_TOP_SHEET   : 'bas-ui-modal-top-sheet',
        MODAL_BOTTOM_SHEET: 'bas-ui-modal-bottom-sheet',
        MODAL_LEFT_SHEET  : 'bas-ui-modal-left-sheet',
        MODAL_RIGHT_SHEET : 'bas-ui-modal-right-sheet',
        MODAL_FULL_SHEET  : 'bas-ui-modal-full-sheet',
    };

    const Selector = {
        MODAL             : `.${ClassName.MODAL}`,
        MODAL_CLOSE       : `.${ClassName.MODAL_CLOSE}`,
        MODAL_TRIGGER     : `.${ClassName.MODAL_TRIGGER}`,
        MODAL_OVERLAY     : `.${ClassName.MODAL_OVERLAY}`,
        MODAL_TOP_SHEET   : `.${ClassName.MODAL_TOP_SHEET}`,
        MODAL_BOTTOM_SHEET: `.${ClassName.MODAL_BOTTOM_SHEET}`,
        MODAL_LEFT_SHEET  : `.${ClassName.MODAL_LEFT_SHEET}`,
        MODAL_RIGHT_SHEET : `.${ClassName.MODAL_RIGHT_SHEET}`,
        MODAL_FULL_SHEET  : `.${ClassName.MODAL_FULL_SHEET}`,
    };

    const Event = {
        SHOW          : `show${EVENT_KEY}`,
        SHOWN         : `shown${EVENT_KEY}`,
        HIDE          : `hide${EVENT_KEY}`,
        HIDDEN        : `hidden${EVENT_KEY}`,
        KEYUP_DATA_API: `keyup${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    let stack  = 0;
    let lastID = 0;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Modals {

        constructor(element, config) {
            let _self = this;

            _self._trigger   = $(element);
            _self._target    = Modals._getTargetFromElement($(element));
            _self._overlay   = $('<div class="' + ClassName.MODAL_OVERLAY + '"></div>');
            _self._overlayID = Modals._generateID();
            _self._lStack    = (++stack);

            // Move modal to body
            if(_self._target.hasClass(ClassName.MODAL) && !_self._target.parent().is('body')){
                _self._target.appendTo(document.body);
            }

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
            _self._config = Modals._getConfig(config);
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
            let _self = this;
            $.removeData(_self._trigger, DATA_KEY);

            _self._trigger   = null;
            _self._target    = null;
            _self._overlay   = null;
            _self._overlayID = 0;
            _self._lStack    = 0;

            // Set config
            _self.config = null;

        }

        // Private
        // ------------------------------------------------------------------------

        // Open
        _open(object) {
            let _self = this;
            let _body = $('body');

            _body.css('overflow', 'hidden');

            _self._lStack = (++stack);

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
                    if (e.keyCode === 27) {   // ESC key
                        _self.hide();
                    }
                });
            }

            object.find(Selector.MODAL_CLOSE).on('click.close', function (e) {
                _self.hide();
            });

            // Prepare elements
            _self._overlay.css({display: "block", opacity: 0});

            object.css({
                display: "block",
                opacity: 0,
            });

            object.data('associated-overlay', _self._overlay[0]);

            // Show overlay
            _self._overlay.velocity({opacity: _self._config.opacity}, {
                duration: _self._config.in_duration,
                queue   : false,
                ease    : "easeOutCubic",
            });

            // Top and Full Sheet
            object.trigger(Event.SHOW);
            if (object.hasClass(ClassName.MODAL_TOP_SHEET) || object.hasClass(ClassName.MODAL_FULL_SHEET)) {
                object.velocity({top: "0", opacity: 1}, {
                    duration: _self._config.in_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        object.trigger(Event.SHOWN);
                    },
                });
            } // Bottom Sheet
            else if (object.hasClass(ClassName.MODAL_BOTTOM_SHEET)) {
                object.velocity({bottom: "0", opacity: 1}, {
                    duration: _self._config.in_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        object.trigger(Event.SHOWN);
                    },
                });
            } // Left Sheet
            else if (object.hasClass(ClassName.MODAL_LEFT_SHEET)) {
                object.velocity({left: "0", opacity: 1}, {
                    duration: _self._config.in_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        object.trigger(Event.SHOWN);
                    },
                });
            } // Right Sheet
            else if (object.hasClass(ClassName.MODAL_RIGHT_SHEET)) {
                object.velocity({right: "0", opacity: 1}, {
                    duration: _self._config.in_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        object.trigger(Event.SHOWN);
                    },
                });
            } // Normal
            else {
                $.Velocity.hook(object, "scaleX", 0.7);
                object.css({top: _self._config.starting_top});
                object.velocity({top: "10%", opacity: 1, scaleX: '1'}, {
                    duration: _self._config.in_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        object.trigger(Event.SHOWN);
                    },
                });
            }
        }

        // Close
        _close(object) {
            let _self = this;
            let _body = $('body');

            _body.css('overflow', '');

            // Remove events
            object.find(Selector.MODAL_CLOSE).off('click.close');
            $(document).off(Event.KEYUP_DATA_API + _self._overlayID);

            // Hide overlay
            _self._overlay.velocity({opacity: 0}, {
                duration: _self._config.out_duration, queue: false, ease: "easeOutQuart",
            });

            // Top and Full Sheet
            object.trigger(Event.HIDE);
            if (object.hasClass(ClassName.MODAL_TOP_SHEET) || object.hasClass(ClassName.MODAL_FULL_SHEET)) {
                object.velocity({top: "-100%", opacity: 0}, {
                    duration: _self._config.out_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        _self._overlay.css({display: "none"});

                        object.trigger(Event.HIDDEN);

                        _self._overlay.remove();
                        stack--;
                    },
                });
            } // Bottom Sheet
            else if (object.hasClass(ClassName.MODAL_BOTTOM_SHEET)) {
                object.velocity({bottom: "-100%", opacity: 0}, {
                    duration: _self._config.out_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        _self._overlay.css({display: "none"});

                        object.trigger(Event.HIDDEN);

                        _self._overlay.remove();
                        stack--;
                    },
                });
            } // Left Sheet
            else if (object.hasClass(ClassName.MODAL_LEFT_SHEET)) {
                object.velocity({left: "-100%", opacity: 0}, {
                    duration: _self._config.out_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        _self._overlay.css({display: "none"});

                        object.trigger(Event.HIDDEN);

                        _self._overlay.remove();
                        stack--;
                    },
                });
            } // Right Sheet
            else if (object.hasClass(ClassName.MODAL_RIGHT_SHEET)) {
                object.velocity({right: "-100%", opacity: 0}, {
                    duration: _self._config.out_duration,
                    queue   : false,
                    ease    : "easeOutCubic",
                    // Handle modal ready callback
                    complete: function () {
                        _self._overlay.css({display: "none"});

                        object.trigger(Event.HIDDEN);

                        _self._overlay.remove();
                        stack--;
                    },
                });
            } // Normal
            else {
                object.velocity(
                    {top: _self._config.starting_top, opacity: 0, scaleX: 0.7}, {
                        duration: _self._config.out_duration,
                        complete: function () {

                            $(this).css('display', 'none');

                            object.trigger(Event.HIDDEN);

                            _self._overlay.remove();
                            stack--;
                        },
                    },
                );
            }
        }

        _updateOptions() {
            let _self = this;

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

        static _getConfig(config) {
            config = $.extend({}, Default, config);
            Util.typeCheckConfig(NAME, config, DefaultType);
            return config;
        }

        static _getTargetFromElement(element) {
            let selector = $("#" + element.attr('data-target'));
            return selector ? selector : null;
        }

        static _generateID() {
            lastID++;
            return ClassName.MODAL_OVERLAY + '-' + lastID;
        }

        static _jQueryInterface(config, opt) {
            return this.each(function () {
                let $this   = $(this);
                let data    = $this.data(DATA_KEY);
                let _config = $.extend(
                    {},
                    Default,
                    $this.data(),
                    typeof config === 'object' && config,
                );

                if (!data) {
                    data = new Modals(this, _config);
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
            $(Selector.MODAL_TRIGGER).bas_ui_modals();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.MODAL_TRIGGER, function () {
            let _this = $(this);
            Modals._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Modals._jQueryInterface;
    $.fn[NAME].Constructor = Modals;

    return Modals;

})(jQuery);

BasUI.Modals = Modals;
export default Modals;
