import Util from './lib/util';

const Site = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_site`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-site`;
    const DATA_KEY     = `${Util.API_PREFIX}.site`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const ClassName = {
        WAVES                  : 'bas-ui-waves',
        WAVES_LIGHT            : 'bas-ui-waves-light',
        DISMISSABLE            : 'dismissable',
        DATA_TABLE             : 'bas-ui-data-table',
        DATA_TABLE_JS          : 'bas-ui-data-table-js',
        SEARCH                 : 'bas-ui-search',
        SEARCH_CLEAR           : 'bas-ui-search-clear',
        SEARCH_EXPANDABLE      : 'bas-ui-serach-expandable',
        SEARCH_EXPANDABLE_SHOW : 'bas-ui-serach-expandable-show',
        SEARCH_TOP             : 'bas-ui-top-search',
        SEARCH_TOP_ACTION_SHOW : 'bas-ui-top-search-show',
        SEARCH_TOP_ACTION_CLOSE: 'bas-ui-top-search-close',
        LAYOUT_HEADER          : 'bas-ui-layout-header',
        LAYOUT_HEADER_FIXED    : 'bas-ui-layout-header-fixed',
        SIDE_NAV               : 'bas-ui-side-nav',
        SIDE_NAV_AUTO          : 'bas-ui-side-nav-auto',
        SIDE_NAV_WITH_OVERLAY  : 'bas-ui-side-nav-with-overlay',
        SIDE_NAV_VISIBLE       : 'bas-ui-side-nav-visible',
        SIDE_NAV_HIDE          : 'bas-ui-side-nav-hide',
        SIDE_NAV_TOGGLE        : 'bas-ui-side-nav-toggle',
        SIDE_NAV_OVERLAY       : 'bas-ui-side-nav-overlay'


    };

    const Selector = {
        WAVES                  : `.${ClassName.WAVES}`,
        WAVES_LIGHT            : `.${ClassName.WAVES_LIGHT}`,
        DISMISSABLE            : `.${ClassName.DISMISSABLE}`,
        DATA_TABLE             : `.${ClassName.DATA_TABLE}`,
        DATA_TABLE_JS          : `.${ClassName.DATA_TABLE_JS}`,
        SEARCH                 : `.${ClassName.SEARCH}`,
        SEARCH_CLEAR           : `.${ClassName.SEARCH_CLEAR}`,
        SEARCH_EXPANDABLE      : `.${ClassName.SEARCH_EXPANDABLE}`,
        SEARCH_EXPANDABLE_SHOW : `.${ClassName.SEARCH_EXPANDABLE_SHOW}`,
        SEARCH_TOP             : `.${ClassName.SEARCH_TOP}`,
        SEARCH_TOP_ACTION_SHOW : `.${ClassName.SEARCH_TOP_ACTION_SHOW}`,
        SEARCH_TOP_ACTION_CLOSE: `.${ClassName.SEARCH_TOP_ACTION_CLOSE}`,
        LAYOUT_HEADER          : `.${ClassName.LAYOUT_HEADER}`,
        LAYOUT_HEADER_FIXED    : `.${ClassName.LAYOUT_HEADER_FIXED}`,
        SIDE_NAV               : `.${ClassName.SIDE_NAV}`,
        SIDE_NAV_AUTO          : `.${ClassName.SIDE_NAV_AUTO}`,
        SIDE_NAV_WITH_OVERLAY  : `.${ClassName.SIDE_NAV_WITH_OVERLAY}`,
        SIDE_NAV_VISIBLE       : `.${ClassName.SIDE_NAV_VISIBLE}`,
        SIDE_NAV_HIDE          : `.${ClassName.SIDE_NAV_HIDE}`,
        SIDE_NAV_TOGGLE        : `.${ClassName.SIDE_NAV_TOGGLE}`,
        SIDE_NAV_OVERLAY       : `.${ClassName.SIDE_NAV_OVERLAY}`
    };

    const Event = {
        MOUSE_ENTER_LEAVE_DATA_API: `mouseenter${EVENT_KEY}${DATA_API_KEY}, mouseleave${EVENT_KEY}${DATA_API_KEY}`,
        TOUCH_START_DATA_API      : `touchstart${EVENT_KEY}${DATA_API_KEY}`,
        MOUSE_DOWN_DATA_API       : `mousedown${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API            : `click${EVENT_KEY}${DATA_API_KEY}`,
        FOCUS_BLUR_DATA_API       : `focus${EVENT_KEY}${DATA_API_KEY} ` + `blur${EVENT_KEY}${DATA_API_KEY}`,
        FOCUS_DATA_API            : `focus${EVENT_KEY}${DATA_API_KEY}`,
        BLUR_DATA_API             : `blur${EVENT_KEY}${DATA_API_KEY}`,
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    let wavesInit = false;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Site {

        constructor() {

        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        // Public
        // ------------------------------------------------------------------------

        static dismissableList(selector) {
            // Touch Event
            let swipeLeft  = false;
            let swipeRight = false;

            $(selector).each(function () {
                $(this).hammer({
                    prevent_default: false
                }).bind('pan', function (e) {
                    if (e.gesture.pointerType === "touch") {
                        let $this     = $(this);
                        let direction = e.gesture.direction;
                        let x         = e.gesture.deltaX;
                        let velocityX = e.gesture.velocityX;

                        $this.velocity({
                            translateX: x
                        }, {duration: 50, queue: false, easing: 'easeOutQuad'});

                        // Swipe Left
                        if (direction === 4 && (x > ($this.innerWidth() / 2) || velocityX < -0.75)) {
                            swipeLeft = true;
                        }

                        // Swipe Right
                        if (direction === 2 && (x < (-1 * $this.innerWidth() / 2) || velocityX > 0.75)) {
                            swipeRight = true;
                        }
                    }
                }).bind('panend', function (e) {
                    // Reset if collection is moved back into original position
                    if (Math.abs(e.gesture.deltaX) < ($(this).innerWidth() / 2)) {
                        swipeRight = false;
                        swipeLeft  = false;
                    }

                    if (e.gesture.pointerType === "touch") {
                        let $this = $(this);
                        if (swipeLeft || swipeRight) {
                            let fullWidth;
                            if (swipeLeft) {
                                fullWidth = $this.innerWidth();
                            }
                            else {
                                fullWidth = -1 * $this.innerWidth();
                            }

                            $this.velocity({
                                translateX: fullWidth
                            }, {
                                duration: 100, queue: false, easing: 'easeOutQuad', complete: function () {
                                    $this.css('border', 'none');
                                    $this.velocity({
                                        height: 0, padding: 0
                                    }, {
                                        duration: 200, queue: false, easing: 'easeOutQuad', complete: function () {
                                            $this.remove();
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            $this.velocity({
                                translateX: 0
                            }, {duration: 100, queue: false, easing: 'easeOutQuad'});
                        }
                        swipeLeft  = false;
                        swipeRight = false;
                    }
                });

            });
        }

        static renderLayoutHeader(selector) {

            if ($(selector) === undefined) {
                return;
            }

            let _layout_header        = $(selector);
            let _layout_header_offset = 0;
            let _body                 = $('body');

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

        static toggleSideNav() {
            let _body = $('body');

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

        static init() {
            this.dismissableList(Selector.DISMISSABLE);
            this.renderLayoutHeader(Selector.LAYOUT_HEADER);
        }

        static resize() {
            Site.renderSideNav();
        }

        static load() {
            let _body = $('body');
            _body.css('visibility', 'visible');
        }

        static setSettings() {
            Site.resize();

            let _side_nav = $(Selector.SIDE_NAV);
            if (_side_nav !== undefined) {
                let _side_nav_overlay = $('<div class="bas-ui-side-nav-overlay"></div>');
                _side_nav.after(_side_nav_overlay);
            }

            if (Util.isTouch) {
                $('html').addClass("is-touch");
            }
        }

        // Static
        // ------------------------------------------------------------------------

        static waves(element) {
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

        static renderSideNav() {

            let _body = $('body');

            if (window.innerWidth > 768) {
                if (_body.hasClass(ClassName.SIDE_NAV_AUTO)) {
                    Site.openSideNav();
                } else if (!_body.hasClass(ClassName.SIDE_NAV_VISIBLE) && !_body.hasClass(ClassName.SIDE_NAV_HIDE)) {
                    _body.addClass(ClassName.SIDE_NAV_VISIBLE);
                }
            }
            else {
                if (_body.hasClass(ClassName.SIDE_NAV_AUTO)) {
                    Site.closeSideNav();
                } else if (!_body.hasClass(ClassName.SIDE_NAV_VISIBLE) && !_body.hasClass(ClassName.SIDE_NAV_HIDE)) {
                    _body.addClass(ClassName.SIDE_NAV_HIDE);
                }
            }
        }

        static openSideNav() {
            let _body = $('body');
            _body.removeClass(ClassName.SIDE_NAV_HIDE);
            _body.addClass(ClassName.SIDE_NAV_VISIBLE);
        }

        static closeSideNav() {
            let _body = $('body');
            _body.removeClass(ClassName.SIDE_NAV_VISIBLE);
            _body.addClass(ClassName.SIDE_NAV_HIDE);
        }

    }

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    // Search
    $(document).on(Event.FOCUS_DATA_API, Selector.SEARCH, (event) => {
        let _this           = $(event.target);
        let _element_parent = _this.parent();
        _element_parent.addClass('active');
    });

    $(document).on(Event.BLUR_DATA_API, Selector.SEARCH, (event) => {
        let _this           = $(event.target);
        let _element_parent = _this.parent();
        if (_this.val().length === 0) {
            _element_parent.removeClass('active');
        }
    });

    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH + ' ' + Selector.SEARCH_CLEAR, (event) => {
        let _this           = $(event.target);
        let _element_parent = _this.parent();
        _element_parent.removeClass('active');
        // Clear autocomplete
        if (_element_parent.find('autocomplete-suggestions')) {
            _element_parent.find('input').autocomplete('hide');
        }
        _element_parent.find('input').val('');
    });

    // Search -> Expandable
    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH + ' ' + Selector.SEARCH_EXPANDABLE_SHOW, (event) => {
        let _this           = $(event.target);
        let _element_parent = _this.parent();
        _element_parent.addClass('active');
        // Set focus
        _element_parent.find('input').focus();
    });

    // Search -> Top
    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH_TOP_ACTION_SHOW, (event) => {
        let _this = $(Selector.SEARCH_TOP);
        _this.css('visibility', 'visible');
        _this.css('top', '0');
    });

    $(document).on(Event.CLICK_DATA_API, Selector.SEARCH_TOP_ACTION_CLOSE, (event) => {
        let _this           = $(event.target);
        let _top_serach     = $(Selector.SEARCH_TOP);
        let _element_parent = _this.parent();
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
    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TABLE + Selector.DATA_TABLE_JS + ' thead input[type="checkbox"]', (event) => {
        let _this       = $(event.target);
        let _tbody      = _this.parents('table').children('tbody');
        let _is_checked = event.target.checked;
        _tbody.find('tr input[type="checkbox"]').each(function () {
            let _self     = this;
            _self.checked = _is_checked;
            let _parent   = $(this).parent().parent();
            if (_self.checked) {
                _parent.addClass('is-selected');
            } else {
                _parent.removeClass('is-selected');
            }
        });
    });

    $(document).on(Event.CLICK_DATA_API, Selector.DATA_TABLE + Selector.DATA_TABLE_JS + ' tbody tr input[type="checkbox"]', (event) => {
        let _this   = $(event.target);
        let _parent = _this.parent().parent();
        if (event.target.checked) {
            _parent.addClass('is-selected');
        } else {
            _parent.removeClass('is-selected');
        }
    });

    // Waves
    $(document).on(Event.CLICK_DATA_API, Selector.WAVES + ',' + Selector.WAVES_LIGHT, (event) => {
        let _target = $(event.target);
        Site.waves(_target);
    });

    // Side Nav Toggle
    $(document).on(Event.CLICK_DATA_API, Selector.SIDE_NAV_TOGGLE, (event) => {
        Site.toggleSideNav();
    });

    // Side Nav Overlay
    $(document).on(Event.CLICK_DATA_API, Selector.SIDE_NAV_OVERLAY, (event) => {
        Site.closeSideNav();
    });

    // Ready
    $(document).ready(function () {
        // Set global settings
        Site.setSettings();
    });

    // Resize
    $(window).on('resize', function () {
        // Update
        Site.resize();
    });

    // Load
    $(window).on('load', function () {
        // Load
        Site.load();
    });

    // READY & OBSERVE
    if (Util.mutationObserver === null) {
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

})(jQuery);

BasUI.Site = Site;
export default Site;
