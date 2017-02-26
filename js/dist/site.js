'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./lib/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Site = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_site';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-site';
    var DATA_KEY = _util2.default.API_PREFIX + '.site';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var ClassName = {
        WAVES: 'bas-ui-waves',
        WAVES_LIGHT: 'bas-ui-waves-light',
        DISMISSABLE: 'dismissable',
        DATA_TABLE: 'bas-ui-data-table',
        DATA_TABLE_JS: 'bas-ui-data-table-js',
        SEARCH: 'bas-ui-search',
        SEARCH_CLEAR: 'bas-ui-search-clear',
        SEARCH_EXPANDABLE: 'bas-ui-serach-expandable',
        SEARCH_EXPANDABLE_SHOW: 'bas-ui-serach-expandable-show',
        SEARCH_TOP: 'bas-ui-top-search',
        SEARCH_TOP_ACTION_SHOW: 'bas-ui-top-search-show',
        SEARCH_TOP_ACTION_CLOSE: 'bas-ui-top-search-close',
        LAYOUT_HEADER: 'bas-ui-layout-header',
        LAYOUT_HEADER_FIXED: 'bas-ui-layout-header-fixed',
        SIDE_NAV: 'bas-ui-side-nav',
        SIDE_NAV_AUTO: 'bas-ui-side-nav-auto',
        SIDE_NAV_WITH_OVERLAY: 'bas-ui-side-nav-with-overlay',
        SIDE_NAV_VISIBLE: 'bas-ui-side-nav-visible',
        SIDE_NAV_HIDE: 'bas-ui-side-nav-hide',
        SIDE_NAV_TOGGLE: 'bas-ui-side-nav-toggle',
        SIDE_NAV_OVERLAY: 'bas-ui-side-nav-overlay'

    };

    var Selector = {
        WAVES: '.' + ClassName.WAVES,
        WAVES_LIGHT: '.' + ClassName.WAVES_LIGHT,
        DISMISSABLE: '.' + ClassName.DISMISSABLE,
        DATA_TABLE: '.' + ClassName.DATA_TABLE,
        DATA_TABLE_JS: '.' + ClassName.DATA_TABLE_JS,
        SEARCH: '.' + ClassName.SEARCH,
        SEARCH_CLEAR: '.' + ClassName.SEARCH_CLEAR,
        SEARCH_EXPANDABLE: '.' + ClassName.SEARCH_EXPANDABLE,
        SEARCH_EXPANDABLE_SHOW: '.' + ClassName.SEARCH_EXPANDABLE_SHOW,
        SEARCH_TOP: '.' + ClassName.SEARCH_TOP,
        SEARCH_TOP_ACTION_SHOW: '.' + ClassName.SEARCH_TOP_ACTION_SHOW,
        SEARCH_TOP_ACTION_CLOSE: '.' + ClassName.SEARCH_TOP_ACTION_CLOSE,
        LAYOUT_HEADER: '.' + ClassName.LAYOUT_HEADER,
        LAYOUT_HEADER_FIXED: '.' + ClassName.LAYOUT_HEADER_FIXED,
        SIDE_NAV: '.' + ClassName.SIDE_NAV,
        SIDE_NAV_AUTO: '.' + ClassName.SIDE_NAV_AUTO,
        SIDE_NAV_WITH_OVERLAY: '.' + ClassName.SIDE_NAV_WITH_OVERLAY,
        SIDE_NAV_VISIBLE: '.' + ClassName.SIDE_NAV_VISIBLE,
        SIDE_NAV_HIDE: '.' + ClassName.SIDE_NAV_HIDE,
        SIDE_NAV_TOGGLE: '.' + ClassName.SIDE_NAV_TOGGLE,
        SIDE_NAV_OVERLAY: '.' + ClassName.SIDE_NAV_OVERLAY
    };

    var Event = {
        MOUSE_ENTER_LEAVE_DATA_API: 'mouseenter' + EVENT_KEY + DATA_API_KEY + ', mouseleave' + EVENT_KEY + DATA_API_KEY,
        TOUCH_START_DATA_API: 'touchstart' + EVENT_KEY + DATA_API_KEY,
        MOUSE_DOWN_DATA_API: 'mousedown' + EVENT_KEY + DATA_API_KEY,
        CLICK_DATA_API: 'click' + EVENT_KEY + DATA_API_KEY,
        FOCUS_BLUR_DATA_API: 'focus' + EVENT_KEY + DATA_API_KEY + ' ' + ('blur' + EVENT_KEY + DATA_API_KEY),
        FOCUS_DATA_API: 'focus' + EVENT_KEY + DATA_API_KEY,
        BLUR_DATA_API: 'blur' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    var wavesInit = false;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Site = function () {
        function Site() {
            _classCallCheck(this, Site);
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Site, null, [{
            key: 'dismissableList',


            // Public
            // ------------------------------------------------------------------------

            value: function dismissableList(selector) {
                // Touch Event
                var swipeLeft = false;
                var swipeRight = false;

                $(selector).each(function () {
                    $(this).hammer({
                        prevent_default: false
                    }).bind('pan', function (e) {
                        if (e.gesture.pointerType === "touch") {
                            var $this = $(this);
                            var direction = e.gesture.direction;
                            var x = e.gesture.deltaX;
                            var velocityX = e.gesture.velocityX;

                            $this.velocity({
                                translateX: x
                            }, { duration: 50, queue: false, easing: 'easeOutQuad' });

                            // Swipe Left
                            if (direction === 4 && (x > $this.innerWidth() / 2 || velocityX < -0.75)) {
                                swipeLeft = true;
                            }

                            // Swipe Right
                            if (direction === 2 && (x < -1 * $this.innerWidth() / 2 || velocityX > 0.75)) {
                                swipeRight = true;
                            }
                        }
                    }).bind('panend', function (e) {
                        var _this2 = this;

                        // Reset if collection is moved back into original position
                        if (Math.abs(e.gesture.deltaX) < $(this).innerWidth() / 2) {
                            swipeRight = false;
                            swipeLeft = false;
                        }

                        if (e.gesture.pointerType === "touch") {
                            (function () {
                                var $this = $(_this2);
                                if (swipeLeft || swipeRight) {
                                    var fullWidth = void 0;
                                    if (swipeLeft) {
                                        fullWidth = $this.innerWidth();
                                    } else {
                                        fullWidth = -1 * $this.innerWidth();
                                    }

                                    $this.velocity({
                                        translateX: fullWidth
                                    }, {
                                        duration: 100, queue: false, easing: 'easeOutQuad', complete: function complete() {
                                            $this.css('border', 'none');
                                            $this.velocity({
                                                height: 0, padding: 0
                                            }, {
                                                duration: 200, queue: false, easing: 'easeOutQuad', complete: function complete() {
                                                    $this.remove();
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    $this.velocity({
                                        translateX: 0
                                    }, { duration: 100, queue: false, easing: 'easeOutQuad' });
                                }
                                swipeLeft = false;
                                swipeRight = false;
                            })();
                        }
                    });
                });
            }
        }, {
            key: 'renderLayoutHeader',
            value: function renderLayoutHeader(selector) {

                if ($(selector) === undefined) {
                    return;
                }

                var _layout_header = $(selector);
                var _layout_header_offset = 0;
                var _body = $('body');

                // Is header fixed layout
                if (_body.hasClass(ClassName.LAYOUT_HEADER_FIXED)) {
                    _layout_header.css('top', _layout_header_offset + 'px');
                    _body.css('margin-top', _layout_header.outerHeight(true) + _layout_header_offset + 'px');
                    _body.css('height', 'calc(100% - ' + (_layout_header.outerHeight(true) + _layout_header_offset) + 'px)');
                } else {
                    _layout_header.css('top', '0px');
                    _body.css('margin-top', _layout_header_offset + 'px');
                    _body.css('height', '100%');
                }
            }
        }, {
            key: 'toggleSideNav',
            value: function toggleSideNav() {
                var _body = $('body');

                if (_body.hasClass(ClassName.SIDE_NAV_VISIBLE)) {
                    Site.closeSideNav();
                } else if (_body.hasClass(ClassName.SIDE_NAV_HIDE)) {
                    Site.openSideNav();
                } else {
                    if (window.innerWidth > 768) {
                        _body.addClass(ClassName.SIDE_NAV_HIDE);
                    } else {
                        _body.addClass(ClassName.SIDE_NAV_VISIBLE);
                    }
                }
            }

            // Private
            // ------------------------------------------------------------------------

        }, {
            key: 'init',
            value: function init() {
                this.dismissableList(Selector.DISMISSABLE);
                this.renderLayoutHeader(Selector.LAYOUT_HEADER);
            }
        }, {
            key: 'resize',
            value: function resize() {
                Site.renderSideNav();
            }
        }, {
            key: 'load',
            value: function load() {
                var _html = $('html');
                _html.velocity({ opacity: 1 }, {
                    duration: 300,
                    queue: false,
                    ease: "easeOutCubic"
                });
            }
        }, {
            key: 'setSettings',
            value: function setSettings() {
                Site.resize();

                var _side_nav = $(Selector.SIDE_NAV);
                if (_side_nav !== undefined) {
                    var _side_nav_overlay = $('<div class="bas-ui-side-nav-overlay"></div>');
                    _side_nav.after(_side_nav_overlay);
                }

                if (_util2.default.isTouch) {
                    $('html').addClass("is-touch");
                }
            }

            // Static
            // ------------------------------------------------------------------------

        }, {
            key: 'waves',
            value: function waves(element) {
                element = $(element).closest(Selector.WAVES + ',' + Selector.WAVES_LIGHT);

                if (element.data('waves-init') || element.hasClass('disabled') || Waves === 'undefined') {
                    return;
                }

                if (!wavesInit) {
                    Waves.init();
                    wavesInit = true;
                }

                if (element.hasClass(ClassName.WAVES_LIGHT)) {
                    Waves.attach(element, ['waves-effect', 'waves-light']);
                } else {
                    Waves.attach(element, ['waves-effect']);
                }

                Waves.ripple(element, null);

                element.data('waves-init', true);
            }
        }, {
            key: 'renderSideNav',
            value: function renderSideNav() {

                var _body = $('body');

                if (window.innerWidth > 768) {
                    if (_body.hasClass(ClassName.SIDE_NAV_AUTO)) {
                        Site.openSideNav();
                    } else if (!_body.hasClass(ClassName.SIDE_NAV_VISIBLE) && !_body.hasClass(ClassName.SIDE_NAV_HIDE)) {
                        _body.addClass(ClassName.SIDE_NAV_VISIBLE);
                    }
                } else {
                    if (_body.hasClass(ClassName.SIDE_NAV_AUTO)) {
                        Site.closeSideNav();
                    } else if (!_body.hasClass(ClassName.SIDE_NAV_VISIBLE) && !_body.hasClass(ClassName.SIDE_NAV_HIDE)) {
                        _body.addClass(ClassName.SIDE_NAV_HIDE);
                    }
                }
            }
        }, {
            key: 'openSideNav',
            value: function openSideNav() {
                var _body = $('body');
                _body.removeClass(ClassName.SIDE_NAV_HIDE);
                _body.addClass(ClassName.SIDE_NAV_VISIBLE);
            }
        }, {
            key: 'closeSideNav',
            value: function closeSideNav() {
                var _body = $('body');
                _body.removeClass(ClassName.SIDE_NAV_VISIBLE);
                _body.addClass(ClassName.SIDE_NAV_HIDE);
            }
        }, {
            key: 'VERSION',
            get: function get() {
                return VERSION;
            }
        }]);

        return Site;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // Search


    $(document).on(Event.FOCUS_DATA_API, Selector.SEARCH, function (event) {
        var _this = $(event.target);
        var _element_parent = _this.parent();
        _element_parent.addClass('active');
    });

    $(document).on(Event.BLUR_DATA_API, Selector.SEARCH, function (event) {
        var _this = $(event.target);
        var _element_parent = _this.parent();
        if (_this.val().length === 0) {
            _element_parent.removeClass('active');
        }
    });

    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH + ' ' + Selector.SEARCH_CLEAR, function (event) {
        var _this = $(event.target);
        var _element_parent = _this.parent();
        _element_parent.removeClass('active');
        // Clear autocomplete
        if (_element_parent.find('autocomplete-suggestions')) {
            _element_parent.find('input').autocomplete('hide');
        }
        _element_parent.find('input').val('');
    });

    // Search -> Expandable
    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH + ' ' + Selector.SEARCH_EXPANDABLE_SHOW, function (event) {
        var _this = $(event.target);
        var _element_parent = _this.parent();
        _element_parent.addClass('active');
        // Set focus
        _element_parent.find('input').focus();
    });

    // Search -> Top
    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH_TOP_ACTION_SHOW, function (event) {
        var _this = $(Selector.SEARCH_TOP);
        _this.css('visibility', 'visible');
        _this.css('top', '0');
    });

    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH_TOP_ACTION_CLOSE, function (event) {
        var _this = $(event.target);
        var _top_serach = $(Selector.SEARCH_TOP);
        var _element_parent = _this.parent();
        _top_serach.css('visibility', 'hidden');
        _top_serach.css('top', '-64px');
        // Clear search
        _element_parent.children(Selector.SEARCH).removeClass('active');
        // Clear autocomplete
        if (_element_parent.find('autocomplete-suggestions')) {
            _element_parent.children(Selector.SEARCH).find('input').autocomplete('hide');
        }
        _element_parent.children(Selector.SEARCH).find('input').val('');
    });

    // Data Table
    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TABLE + Selector.DATA_TABLE_JS + ' thead input[type="checkbox"]', function (event) {
        var _this = $(event.target);
        var _tbody = _this.parents('table').children('tbody');
        var _is_checked = event.target.checked;
        _tbody.find('tr input[type="checkbox"]').each(function () {
            var _self = this;
            _self.checked = _is_checked;
            var _parent = $(this).parent().parent();
            if (_self.checked) {
                _parent.addClass('is-selected');
            } else {
                _parent.removeClass('is-selected');
            }
        });
    });

    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TABLE + Selector.DATA_TABLE_JS + ' tbody tr input[type="checkbox"]', function (event) {
        var _this = $(event.target);
        var _parent = _this.parent().parent();
        if (event.target.checked) {
            _parent.addClass('is-selected');
        } else {
            _parent.removeClass('is-selected');
        }
    });

    // Waves
    $(document).on(Event.CLICK_DATA_API, Selector.WAVES + ',' + Selector.WAVES_LIGHT, function (event) {
        var _target = $(event.target);
        Site.waves(_target);
    });

    // Side Nav Toggle
    $(document).on(Event.CLICK_DATA_API, Selector.SIDE_NAV_TOGGLE, function (event) {
        Site.toggleSideNav();
    });

    // Side Nav Overlay
    $(document).on(Event.CLICK_DATA_API, Selector.SIDE_NAV_OVERLAY, function (event) {
        Site.closeSideNav();
    });

    // Ready
    $(document).ready(function () {
        // Set global settings
        Site.setSettings();

        // Resize
        $(window).on('resize', function () {
            // Update
            Site.resize();
        });

        // Load
        $(window).on('load', function () {
            // Load.
            Site.load();
        });
    });

    // READY & OBSERVE
    if (_util2.default.mutationObserver === null) {
        $(document).ready(function () {
            Site.init();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.DISMISSABLE, function () {
            Site.dismissableList(this);
        });
        $(document).bas_ui_observe(Selector.LAYOUT_HEADER, function () {
            Site.renderLayoutHeader(this);
        });
    }

    return Site;
}(jQuery);

BasUI.Site = Site;
exports.default = Site;
