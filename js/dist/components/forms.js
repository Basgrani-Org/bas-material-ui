'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('../lib/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Forms = function ($) {

    // ------------------------------------------------------------------------
    // Constants
    // ------------------------------------------------------------------------

    var VERSION = _util2.default.VERSION;
    var NAME = _util2.default.PREFIX + '_forms';
    var NAME_CLASS = _util2.default.CLASS_PREFIX + '-forms';
    var DATA_KEY = _util2.default.API_PREFIX + '.forms';
    var EVENT_KEY = '.' + DATA_KEY;
    var DATA_API_KEY = '.data-api';

    var ClassName = {
        ACTIVE: 'active',
        INPUT: 'bas-ui-input'
    };

    var Selector = {
        ACTIVE: '.' + ClassName.ACTIVE,
        INPUT: '.' + ClassName.INPUT,
        INPUTS: 'input.bas-ui-input[type=text], input.bas-ui-input[type=password], input.bas-ui-input[type=email], input.bas-ui-input[type=url], input.bas-ui-input[type=tel], input.bas-ui-input[type=number], input.bas-ui-input[type=search], textarea.bas-ui-textarea',
        CHECKBOX: 'input.bas-ui-input[type=checkbox]',
        TEXTAREA: 'textarea.bas-ui-textarea',
        FORM: 'form',
        INPUT_FILE: '.bas-ui-input-file'
    };

    var Event = {
        CHANGE_DATA_API: 'change' + EVENT_KEY + DATA_API_KEY,
        FOCUS_DATA_API: 'focus' + EVENT_KEY + DATA_API_KEY,
        BLUR_DATA_API: 'blur' + EVENT_KEY + DATA_API_KEY,
        RESET_DATA_API: 'reset' + EVENT_KEY + DATA_API_KEY
    };

    // ------------------------------------------------------------------------
    // Vars
    // ------------------------------------------------------------------------

    var validateLib = 'parsley'; // parsley | html5 | custom;

    // ------------------------------------------------------------------------
    // Class Definition
    // ------------------------------------------------------------------------

    var Forms = function () {
        function Forms(element) {
            _classCallCheck(this, Forms);

            this._element = element;
        }

        // Getters
        // ------------------------------------------------------------------------

        _createClass(Forms, [{
            key: 'dispose',


            // Public
            // ------------------------------------------------------------------------

            value: function dispose() {
                $.removeData(this._element, DATA_KEY);
                this._element = null;
            }

            // Static
            // ------------------------------------------------------------------------

        }], [{
            key: 'addFormForSubmitValidate',
            value: function addFormForSubmitValidate(object) {
                // Validate using a parsley lib
                if (validateLib === 'parsley') {
                    return object.parsley();
                }
                return null;
            }
        }, {
            key: 'validateForm',
            value: function validateForm(object) {
                // Validate using a parsley lib
                if (validateLib === 'parsley') {
                    var instance = object.parsley();
                    return instance.validate();
                }
                return null;
            }
        }, {
            key: 'validateField',
            value: function validateField(object) {
                // Validate using a parsley lib
                if (validateLib === 'parsley') {
                    return this._validateFieldParsley(object);
                }

                // Validate using a html5
                if (validateLib === 'html5') {
                    return this._validateFieldHtml5(object);
                }

                return null;
            }
        }, {
            key: 'updateLabels',
            value: function updateLabels(elements) {
                $(elements).each(function (index, element) {
                    if ($(element).val().length > 0 || $(this).attr('placeholder') !== undefined || $(this).attr('autofocus') !== undefined || $(element)[0].validity.badInput === true) {
                        $(this).siblings('label, i').addClass(ClassName.ACTIVE);
                    } else {
                        $(this).siblings('label, i').removeClass(ClassName.ACTIVE);
                    }
                });
            }
        }, {
            key: 'setCheckbox',
            value: function setCheckbox(object_class) {
                // Indeterminate
                if ($(object_class).hasClass('indeterminate-checkbox')) {
                    $(object_class).prop('indeterminate', true);
                }
            }
        }, {
            key: 'setTextarea',
            value: function setTextarea(object_class) {
                // Textarea auto size
                autosize($(object_class));
            }
        }, {
            key: 'fileInput',
            value: function fileInput(object_class) {

                var _self = this;

                // Trigger - Image preview
                $(object_class).find('input[type=file]').each(function () {
                    var _this2 = this;

                    var img_preview = $("#" + $(this).attr('data-img-preview'));
                    if (img_preview.length) {
                        (function () {
                            var _parent = $(_this2).closest('.bas-ui-input-file');
                            var file_input = _parent.find('input[type=file]');
                            img_preview.on('click', function () {
                                file_input.trigger('click');
                            });
                        })();
                    }
                });

                // Trigger
                $(object_class).find('input[type=text]').on('click', function () {
                    var _parent = $(this).closest('.bas-ui-input-file');
                    var file_input = _parent.find('input[type=file]');
                    file_input.trigger('click');
                });

                // On Change
                $(object_class).find('input[type=file]').on('change', function () {
                    var _parent = $(this).closest('.bas-ui-input-file');
                    var path_input = _parent.find('input[type=text]');
                    var files = $(this)[0].files;
                    var file_names = [];
                    var file_images = [];
                    for (var i = 0; i < files.length; i++) {
                        file_names.push(files[i].name);

                        // Only add image files.
                        if (files[i].type.match('image.*')) {
                            file_images.push(files[i]);
                        }
                    }
                    path_input.val(file_names.join(", "));
                    path_input.trigger('change');

                    // Image preview
                    var img_preview = $("#" + $(this).attr('data-img-preview'));
                    if (img_preview.length) {
                        for (var ii = 0; ii < file_images.length; ii++) {
                            _self._imgPreviewFileRead(this, file_images[ii], img_preview);
                        }
                    }
                });
            }

            // File upload drop, using a dropzone lib (http://www.dropzonejs.com/)

        }, {
            key: 'fileUploadDrop',
            value: function fileUploadDrop(object, options) {
                var _object = $(object);
                if (!_object.length) {
                    return false;
                }

                // Defaults
                var defaults = {
                    previewTemplate: '',
                    defaultImageThumbnail: ""
                };
                var _options = $.extend({}, defaults, options);

                // Default template
                if (_options.previewTemplate === '') {
                    _options.previewTemplate = '' + '<li class="bas-ui-list-item bas-ui-list-avatar bas-ui-list-secondary-content bas-ui-list-truncate">' + '   <img class="circle" src="' + _options.defaultImageThumbnail + '" data-dz-thumbnail>' + '   <div class="bas-ui-list-body">' + '       <h6 class="bas-ui-list-title"><span data-dz-name></span></h6>' + '       <span data-dz-size></span><span class="bas-ui-file-upload-drop-zone-error-message truncate" data-dz-errormessage></span>' + '       <div class="bas-ui-progress">' + '           <div class="bas-ui-determinate" data-dz-uploadprogress></div>' + '       </div>' + '   </div>' + '<a class="bas-ui-list-secondary-content-body active bas-ui-file-upload-drop-zone-success"><i class="mdi mdi-check bas-ui-icon bas-ui-icon-24"></i></a>' + '<a class="bas-ui-list-secondary-content-body active bas-ui-file-upload-drop-zone-error"><i class="mdi mdi-close bas-ui-icon bas-ui-icon-24"></i></a>' + '</li>';
                }

                return new Dropzone(object, _options);
            }
        }, {
            key: 'init',
            value: function init() {
                this.updateLabels(Selector.INPUTS);
                this.setCheckbox(Selector.CHECKBOX);
                this.setTextarea(Selector.TEXTAREA);
                this.fileInput(Selector.INPUT_FILE);
            }
        }, {
            key: 'setSettings',
            value: function setSettings() {
                // Is parsley
                if (validateLib === 'parsley') {
                    Parsley.options.noFocus = true;
                    Parsley.options.errorsMessagesDisabled = false;
                    Parsley.options.successClass = 'valid';
                    Parsley.options.errorClass = 'invalid';
                }

                // Setting Dropzone Globals
                if (Dropzone) {
                    Dropzone.autoDiscover = false;
                }
            }
        }, {
            key: '_jQueryInterface',
            value: function _jQueryInterface(config) {
                return this.each(function () {
                    var data = $(this).data(DATA_KEY);

                    if (!data) {
                        data = new Forms(this);
                        $(this).data(DATA_KEY, data);
                    }

                    if (typeof config === 'string') {
                        if (data[config] === undefined) {
                            throw new Error('No method named "' + config + '"');
                        }
                        data[config]();
                    }
                });
            }

            // Private
            // ------------------------------------------------------------------------

            // Validate using a parsley lib (http://parsleyjs.org/)

        }, {
            key: '_validateFieldParsley',
            value: function _validateFieldParsley(object) {
                var instance = object.parsley();
                return instance.validate();
            }

            // Validate using a HTML5

        }, {
            key: '_validateFieldHtml5',
            value: function _validateFieldHtml5(object) {
                var hasLength = object.attr('length') !== undefined;
                var lenAttr = parseInt(object.attr('length'));
                var len = object.val().length;

                if (object.val().length === 0 && object[0].validity.badInput === false) {
                    if (object.hasClass('validate')) {
                        object.removeClass('valid');
                        object.removeClass('invalid');
                    }
                } else {
                    if (object.hasClass('validate')) {
                        // Check for character counter attributes
                        if (object.is(':valid') && hasLength && len < lenAttr || object.is(':valid') && !hasLength) {
                            object.removeClass('invalid');
                            object.addClass('valid');
                            return true;
                        } else {
                            object.removeClass('valid');
                            object.addClass('invalid');
                            return false;
                        }
                    }
                }

                return null;
            }
        }, {
            key: '_imgPreviewFileRead',
            value: function _imgPreviewFileRead(object, file, img_preview) {
                if (!window.FileReader) {
                    return false;
                }

                var img_preview_img = img_preview.find('img');
                var img_preview_loading = img_preview.find('.img-preview-loading');
                var img_preview_text_loading = $(object).attr('data-img-preview-text-loading') || 'Loading...';

                // Loading text
                if (img_preview_loading.length) {
                    img_preview_loading.html(img_preview_text_loading);
                }

                var reader = new FileReader();

                // Closure to capture the file information.
                reader.onload = function (theFile) {
                    return function (e) {
                        // Render thumbnail.
                        img_preview_img.attr("src", e.target.result);

                        // Loading text
                        if (img_preview_loading.length) {
                            img_preview_loading.html(escape(theFile.name));
                        }
                    };
                }(file);

                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
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
        }, {
            key: 'validateLib',
            get: function get() {
                return validateLib;
            }
        }]);

        return Forms;
    }();

    // ------------------------------------------------------------------------
    // Data Api implementation
    // ------------------------------------------------------------------------

    $(document).on(Event.FOCUS_DATA_API, Selector.INPUTS, function (event) {
        var _this = $(event.target);
        _this.siblings('label, i').addClass('active');
    });

    $(document).on(Event.BLUR_DATA_API, Selector.INPUTS, function (event) {
        var _this = $(event.target);
        if (_this.val().length === 0 && _this[0].validity.badInput !== true && _this.attr('placeholder') === undefined) {
            _this.siblings('label, i').removeClass('active');
        }
        Forms.validateField(_this);
    });

    $(document).on(Event.CHANGE_DATA_API, Selector.INPUTS, function (event) {
        var _this = $(event.target);
        if (_this.val().length !== 0 || _this.attr('placeholder') !== undefined) {
            _this.siblings('label, i').addClass('active');
        }
        Forms.validateField(_this);
    });

    $(document).on(Event.RESET_DATA_API, Selector.FORM, function (event) {
        var _this = $(event.target);
        // Reset form
        _this.find(Selector.INPUTS).removeClass('valid').removeClass('invalid');
        _this.find(Selector.INPUTS).each(function () {
            if ($(this).attr('value') === '' || $(this).attr('value') === undefined) {
                $(this).siblings('label, i').removeClass('active');
            }
        });
        // Reset select
        _this.find('select.initialized').each(function () {
            var reset_text = _this.find('option[selected]').text();
            _this.siblings('input.select-dropdown').val(reset_text);
        });
    });

    // Set global settings
    $(document).ready(function () {
        Forms.setSettings();
    });

    // READY & OBSERVE
    if (_util2.default.mutationObserver === null) {
        $(document).ready(function () {
            Forms.init();
        });
    } else {
        // .bas_ui_observe(selector, onAdded, onRemoved)
        $(document).bas_ui_observe(Selector.INPUTS, function () {
            Forms.updateLabels(this);
        });
        $(document).bas_ui_observe(Selector.CHECKBOX, function () {
            Forms.setCheckbox(this);
        });
        $(document).bas_ui_observe(Selector.TEXTAREA, function () {
            Forms.setTextarea(this);
        });
        $(document).bas_ui_observe(Selector.INPUT_FILE, function () {
            Forms.fileInput(this);
        });
    }

    // ------------------------------------------------------------------------
    // jQuery
    // ------------------------------------------------------------------------

    $.fn[NAME] = Forms._jQueryInterface;
    $.fn[NAME].Constructor = Forms;

    return Forms;
}(jQuery);

BasUI.Forms = Forms;
exports.default = Forms;
