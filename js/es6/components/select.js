import Util from '../lib/util';
import Forms from './forms';
import Dropdown from './dropdown';

const Select = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_select`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-select`;
    const DATA_KEY     = `${Util.API_PREFIX}.select`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Default = {};

    const DefaultType = {};

    const ClassName = {
        SELECT: 'bas-ui-select',
    };

    const Selector = {
        SELECT: `.${ClassName.SELECT}`,
    };

    const Event = {
        TOUCH_START_DATA_API: `touchstart${EVENT_KEY}${DATA_API_KEY}`,
        MOUSE_ENTER_DATA_API: `mouseenter${EVENT_KEY}${DATA_API_KEY}`,
        MOUSE_LEAVE_DATA_API: `mouseleave${EVENT_KEY}${DATA_API_KEY}`,
        CLICK_DATA_API      : `click${EVENT_KEY}${DATA_API_KEY}`,
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Select {

        constructor(element, config) {
            let _self = this;

            _self._select         = $(element);
            _self._select_id      = $(element).attr('id') || '';
            _self._input_id       = _self._select_id + '-fake';
            _self._valuesSelected = [];
            _self._is_multiple    = !!_self._select.attr('multiple');
            _self._unique_ID      = Util.getUID(_self._select_id);
            _self._label          = '';
            _self._is_dropdown_click          = false;

            // Set ID
            _self._select.attr('data-select-id', _self._unique_ID);
            let select_options = _self._select.children('option');

            // Set class handler for parsley
            if (Forms.validateLib === 'parsley') {
                _self._select.attr('data-parsley-class-handler', '#' + _self._select_id + '-fake');
            }

            // Get msg text's
            let label_text_error   = _self._select.parent().find('label').attr('data-error') || '';
            let label_text_success = _self._select.parent().find('label').attr('data-success') || '';

            // Get label
            if (_self._select.find('option:selected').length > 0) {
                _self._label = _self._select.find('option:selected');
                if (_self._is_multiple && !_self._label.is(':disabled')) {
                    _self._label.each(function (i) {
                        _self._label = Select._buildValuesSelectedFromMultiple(_self._valuesSelected, $(this).index(), _self._select);
                    });
                } else {
                    _self._label = _self._label.html();
                }
            } else {
                _self._label = select_options.first().html();
            }

            // Wrapper
            let wrapper = $('<div class="' + ClassName.SELECT + '-wrapper"></div>');
            _self._select.wrap(wrapper);

            // Add extra elements
            let dropdown_icon = $('<span class="bas-ui-caret"></span>');
            if (_self._select.is(':disabled')) {
                dropdown_icon.addClass('disabled');
            }
            let sanitizedLabelHtml = _self._label && _self._label.replace(/"/g, '&quot;');
            let select_fake        = $('' +
                '<input id="' + _self._input_id + '" data-target="dropdown-' + _self._unique_ID + '" type="text" class="' + Forms.ClassName.INPUT + ' ' + ClassName.SELECT + '-fake ' + ClassName.SELECT + '-input-' + _self._unique_ID + '" readonly ' + ((_self._select.is(':disabled')) ? 'disabled' : '') + ' value="' + sanitizedLabelHtml + '"/>' +
                '<span class="' + ClassName.SELECT + '-fake-msg-error">' + label_text_error + '</span>' +
                '<span class="' + ClassName.SELECT + '-fake-msg-success">' + label_text_success + '</span>',
            );

            // Add select fake
            _self._select.before(select_fake);

            // Dropdown
            let select_dropdown = $('<ul tabindex="0" id="dropdown-' + _self._unique_ID + '" class="' + Dropdown.ClassName.DROPDOWN + '"></ul>');

            // Create dropdown structure
            if (select_options.length) {
                select_options.each(function () {
                    // Render option
                    _self._appendOption(select_dropdown, $(this));
                });
            }

            // Add dropdown
            _self._select.before(select_dropdown);
            _self._select.before(dropdown_icon);

            // Init dropdown
            $(Selector.SELECT+'-input-' + _self._unique_ID).bas_ui_dropdown({
                inDuration : 300,
                outDuration: 225,
                hover      : false,
                gutter     : -62,
                belowOrigin: false,
            });

            // Add select dropdown events
            select_dropdown.find('li').each(function (i) {
                let curr_select = _self._select;
                $(this).click(function (e) {
                    let element = $(e.target);

                    if (_self._is_multiple) {
                        element.toggleClass('active');
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, $(this).index(), curr_select);
                        curr_select.find('option:disabled').eq(0).prop('selected', false);
                        select_dropdown.find('li a').eq(0).removeClass('active');
                    } else {
                        select_dropdown.find('li a').removeClass('active');
                        element.toggleClass('active');
                        curr_select.siblings('input.' + ClassName.SELECT + '-fake').val(element.find('span').text());
                    }

                    curr_select.find('option').eq(i).prop('selected', element.hasClass('active'));
                    _self._is_dropdown_click = true;
                    curr_select.trigger('change');
                });
            });

            // Select change event
            _self._select.change(function (e) {
                let i = $(this).prop('selectedIndex');
                let element = select_dropdown.find('li a').eq(i);
                let curr_select = _self._select;

                if(_self._is_dropdown_click){
                    _self._is_dropdown_click = false;
                    return;
                }

                if (_self._is_multiple) {
                    _self._valuesSelected = [];
                    select_dropdown.find('li a').removeClass('active');
                    $(this).children('option:selected').each(function () {
                        let i = $(this).index();
                        let element = select_dropdown.find('li a').eq(i);
                        element.toggleClass('active');
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, i, curr_select);
                    });
                    if($(this).children('option:selected').length === 0){
                        Select._buildValuesSelectedFromMultiple(_self._valuesSelected, 0, curr_select);
                    }
                    select_dropdown.find('li a').eq(0).removeClass('active');
                } else {
                    select_dropdown.find('li a').removeClass('active');
                    element.toggleClass('active');
                    curr_select.siblings('input.' + ClassName.SELECT + '-fake').val(element.find('span').text());
                }
            });

            // Set initialized
            _self._select.addClass('initialized');
        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        // Public
        // ------------------------------------------------------------------------

        rebuild() {
            this._select.parent().find('span.bas-ui-caret').remove();
            this._select.parent().find('input').remove();
            this._select.unwrap();
            $('ul#dropdown-' + this._unique_ID).remove();
        }

        destroy() {
            this._select.attr('data-select-id', null).removeClass('initialized');
            this._select.attr('data-parsley-class-handler', null);
        }

        dispose() {
            this.destroy();
            $.removeData(this._trigger, DATA_KEY);
            this._select         = null;
            this._select_id      = null;
            this._input_id       = null;
            this._valuesSelected = null;
            this._is_multiple    = null;
            this._unique_ID      = null;
            this._label          = null;
        }

        // Private
        // ------------------------------------------------------------------------

        _appendOption(select_dropdown, option) {
            let _self = this;

            let disabled_class = (option.is(':disabled')) ? 'disabled ' : '';
            let slected_class  = (option.is(':selected')) ? 'active' : '';

            select_dropdown.append($('' +
                '<li class="' + disabled_class + '">' +
                '<a ' + (_self._is_multiple ? 'data-target="fake"' : '') + ' class="truncate ' + slected_class + '">' +
                '<i class="mdi mdi-check icon ' + ClassName.SELECT + '-icon"></i> <span>' + option.html() + '</span>' +
                '</a></li>'));
        }

        // Static
        // ------------------------------------------------------------------------

        static _buildValuesSelectedFromMultiple(entriesArray, entryIndex, select) {
            let index = entriesArray.indexOf(entryIndex);

            if (index === -1) {
                entriesArray.push(entryIndex);
            } else {
                entriesArray.splice(index, 1);
            }

            return Select._setInputFromMultiple(entriesArray, select);
        }

        static _setInputFromMultiple(entriesArray, select) {
            let value = '';

            for (let i = 0, count = entriesArray.length; i < count; i++) {
                let text = select.find('option').eq(entriesArray[i]).text();

                if (i === 0) {
                    value += text;
                } else {
                    value += ', ' + text;
                }
            }

            if (value === '') {
                value = select.find('option:disabled').eq(0).text();
            }

            select.siblings('input' + Selector.SELECT + '-fake').val(value);

            return value;
        }

        static _jQueryInterface(config) {
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
                    data = new Select(this, _config);
                    $this.data(DATA_KEY, data);
                }

                if (typeof config === 'string') {
                    if (data[config] === undefined) {
                        throw new Error(`No method named "${config}"`);
                    }
                    data[config]();
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
            $(Selector.SELECT).bas_ui_select();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.SELECT, function () {
            let _this = $(this);
            Select._jQueryInterface.call(_this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Select._jQueryInterface;
    $.fn[NAME].Constructor = Select;

    return Select;

})(jQuery);

BasUI.Select = Select;
export default Select;
