import Util from '../lib/util';
import Cards from "./cards";

const Toast = (($) => {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    const VERSION      = Util.VERSION;
    const NAME         = `${Util.PREFIX}_toast`;
    const NAME_CLASS   = `${Util.CLASS_PREFIX}-toast`;
    const DATA_KEY     = `${Util.API_PREFIX}.toast`;
    const EVENT_KEY    = `.${DATA_KEY}`;
    const DATA_API_KEY = '.data-api';

    const Default = {};

    const DefaultType = {};

    const ClassName = {};

    const Selector = {};

    const Event = {
        CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    };

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    class Toast {

        constructor(element, config) {
            let _self = this;

        }

        // Getters
        // ------------------------------------------------------------------------

        static get VERSION() {
            return VERSION;
        }

        static get options() {
            return toastr.options;
        }

        // Setters
        // ------------------------------------------------------------------------

        static set options(opt) {
            toastr.options = opt;
        }

        // Public
        // ------------------------------------------------------------------------

        static success() {
            toastr.success.apply(this, arguments);
        }

        static info() {
            toastr.info.apply(this, arguments);
        }

        static warning() {
            toastr.warning.apply(this, arguments);
        }

        static error() {
            toastr.error.apply(this, arguments);
        }

        static remove() {
            toastr.remove();
        }

        static clear() {
            toastr.clear();
        }

        // Public
        // ------------------------------------------------------------------------

        dispose() {
            $.removeData(this._trigger, DATA_KEY);
        }

        // Private
        // ------------------------------------------------------------------------


        // Static
        // ------------------------------------------------------------------------

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
                    data = new Cards(this, _config);
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

    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME]             = Toast._jQueryInterface;
    $.fn[NAME].Constructor = Toast;

    return Toast;

})(jQuery);

BasUI.Toast = Toast;
export default Toast;
