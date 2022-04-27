<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	__webpack_require__(12);
	module.exports = __webpack_require__(10);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	module.exports = jQuery;

/***/ },

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	// require('bootstrap');
	'use strict';
	
	var Utils = __webpack_require__(5);
	var Urls = __webpack_require__(4);
	__webpack_require__(9);
	var mdetect = __webpack_require__(11);
	var MobileEsp = mdetect.MobileEsp;
	
	//Login form Initialization
	function LoginInitialize() {
	    var beforeSubmit = function beforeSubmit(data) {
	        console.log(Utils.getCookie('csrftoken'));
	        $('#login_form').find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	    };
	    var success = function success(data) {
	        console.log(data);
	        window.location.reload();
	    };
	    Utils.FormInitialize($('#login_form'), beforeSubmit, success, null, '#loginSubmitButton');
	}
	
	function ResetInitialize(regular) {
	    var form = $('#reset_password_form');
	    Utils.parsleyfyForm(form);
	    var before = function before(d) {
	        form.find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	    };
	    var success = function success(data, xhr) {
	        form.find('.invalid-form-error-message').html('Email Sent!').addClass('filled');
	        console.log(xhr);
	    };
	    if (regular) {
	        Utils.FormInitialize(form, before, success, 'text', '#resetButton');
	    }
	}
	function intelInput() {
	    $('#id_phone_number').intlTelInput({
	        defaultCountry: 'ng',
	        onlyCountries: ['ng'],
	        utilsScript: '/static/js/utils.js' // just for formatting/placeholders etc
	    });
	}
	
	function phone_value(phone) {
	    var country = phone.intlTelInput('getSelectedCountryData').dialCode,
	        isValid = phone.intlTelInput('isValidNumber');
	    if (isValid === false) {
	        return '+' + country + phone.val();
	    }
	    return phone.val();
	}
	
	function SignUp(no_phone, signupCallback) {
	    var signup_form = $('#signup_form'),
	        country = $('#id_country');
	
	    var phone_data, password_data;
	
	    //if (no_phone) {
	    intelInput();
	    //}
	
	    var isOperaMini = !!window['operamini'];
	    if (!isOperaMini) {
	        Utils.parsleyfyForm(signup_form);
	    }
	    if (no_phone) {
	
	        if (country.find(':selected').val() == 'NG') {
	            displayMailingList();
	        } else {
	            displayMailingList(true);
	        }
	    }
	    var beforSubmit = function beforSubmit(form) {
	        var url = form.attr('action');
	        form.find('input[name="csrfmiddlewaretoken"]').val(Utils.getCookie('csrftoken'));
	        console.log(url);
	        if (no_phone) {
	            if (url === Urls['account_signup']()) {
	                var phone = $('#id_phone_number');
	                phone.val(phone_value(phone));
	                //    country = phone.intlTelInput("getSelectedCountryData").dialCode,
	                //    isValid = phone.intlTelInput("isValidNumber");
	                //if (isValid === false) {
	                //    phone.val("+" + country + phone.val());
	                //    console.log(phone.val());
	                //}
	            } else {
	                console.log(url);
	            }
	        }
	    };
	
	    var successCallback = function successCallback(data) {
	        var form_url = this.url;
	        if (form_url === Urls['users:mailing_signup']()) {
	            console.log(form_url);
	            console.debug(data);
	            window.location.href = data.location;
	        } else {
	            console.log(data);
	            if (signupCallback) {
	                signupCallback(data);
	            }
	        }
	    };
	
	    var errorCallback = function errorCallback(xhr, err) {
	        // alert('Error');
	        var error = xhr.responseJSON.form_errors;
	        console.log(error);
	        var errorNode = $('#errorMessage');
	        errorNode.empty();
	        for (var key in error) {
	            $('#errorMessage').append('<p class="text-danger">' + error[key][0] + '</p>');
	        }
	    };
	    if (!isOperaMini) {
	        Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback, null, '#submit_btn');
	    } else {}
	
	    function displayMailingList(status) {
	        var form = $('#signup_form'),
	            phone = $('#phone_no'),
	            password = $('#pass_group'),
	            phone_container = $('#phone_container'),
	            password_container = $('#password_container'),
	            submitBtn = $('#submit_btn');
	        if (status) {
	            form.attr('action', Urls['users:mailing_signup']());
	            if (phone.length > 0) {
	                phone_data = phone.remove();
	            }
	            if (password.length > 0) {
	                password_data = password.remove();
	            }
	            $('#signup_header_text').removeClass('hidden').addClass('hidden');
	            $('#maillist_header_text').removeClass('hidden');
	            submitBtn.text('Subscribe');
	            $('.last.agree-to').addClass('hidden');
	        } else {
	            form.attr('action', Urls['account_signup']());
	            if (phone_data) {
	                phone_container.append(phone_data);
	                intelInput();
	                phone_data = null;
	            }
	            if (password_data) {
	                password_container.append(password_data);
	                password_data = null;
	            }
	            $('#maillist_header_text').removeClass('hidden').addClass('hidden');
	            $('#signup_header_text').removeClass('hidden');
	            submitBtn.text('Join Now');
	            $('.last.agree-to').removeClass('hidden');
	        }
	    }
	
	    // if (no_phone) {
	    country.change(function () {
	        var selected = $(this).find('option:selected');
	        if (selected.val() === 'NG') {
	            displayMailingList();
	        } else {
	            displayMailingList(true);
	        }
	        console.debug();
	    });
	
	    // }
	}
	
	function AuthModal() {
	    $('#authModal').on('show.bs.modal', function (event) {
	        var link_id = $(event.relatedTarget)[0].id;
	        console.log(link_id);
	        var modal = $(this);
	        var login_form = modal.find('#login_modal'),
	            signup_form = modal.find('#signup_modal'),
	            reset_form = modal.find('#reset_modal'),
	            modal_title = modal.find('h2.modal-title'),
	            modal_subtitle = modal.find('p.modal-subheader'),
	            login_footer = modal.find('.login_footer'),
	            signup_footer = modal.find('.signup_footer'),
	            reset_footer = modal.find('.reset_footer'),
	            forgot_password = modal.find('.password_link');
	
	        function displayLoginForm() {
	            login_form.removeClass('hidden');
	            login_footer.removeClass('hidden');
	            signup_form.addClass('hidden');
	            signup_footer.addClass('hidden');
	            reset_form.addClass('hidden');
	            reset_footer.addClass('hidden');
	            modal_title.text('Log in to Tuteria');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.text('Enter your email and password to access your account');
	        }
	
	        function displaySignupForm() {
	            signup_form.removeClass('hidden');
	            signup_footer.removeClass('hidden');
	            login_form.addClass('hidden');
	            login_footer.addClass('hidden');
	            reset_form.addClass('hidden');
	            reset_footer.addClass('hidden');
	            modal_title.text('WELCOME HOME');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.text('Join Tuteria to connect with quality tutors and clients');
	        }
	
	        function displayResetForm() {
	            signup_form.addClass('hidden');
	            signup_footer.addClass('hidden');
	            login_form.addClass('hidden');
	            login_footer.addClass('hidden');
	            reset_form.removeClass('hidden');
	            reset_footer.removeClass('hidden');
	            modal_title.text('Reset Password');
	            $('.invalid-form-error-message').empty();
	            modal_subtitle.text('Enter your email address to reset your password');
	        }
	
	        if (link_id === 'login_nav') {
	            displayLoginForm();
	        }
	        if (link_id === 'signup_nav') {
	            displaySignupForm();
	        }
	        login_footer.find('a').on('click', function () {
	            displaySignupForm();
	        });
	        signup_footer.find('a').on('click', function () {
	            displayLoginForm();
	        });
	        reset_footer.find('a').on('click', function () {
	            displayLoginForm();
	        });
	        forgot_password.on('click', function (e) {
	            e.preventDefault();
	            displayResetForm();
	        });
	    });
	};
	
	function AutocompleteSearch() {
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#nav-skill-input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        $('form[name=\'search-form\']').submit();
	    });
	    var search_form = $('form[name="search-form"]');
	    search_form.parsley();
	}
	function MobileAutocompleteSearch() {
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#mobile_skill_input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        $('#mobile-nav-search-form').submit();
	    });
	    $('#mobile-nav-search-form').parsley();
	}
	
	function AuthFunction(phone, sign_incallback, login_callback, reset_callback) {
	    $('#nav-skill-input').blur();
	    $('.navdropdown.dropdown').hover(function () {
	        $('.dropdown-toggle', this).trigger('click');
	    });
	    var isBBLow = MobileEsp.DetectBlackBerryHigh();
	    var isBBHigh = MobileEsp.DetectBlackBerryLow();
	    var isOperaMini = !!window['operamini'];
	
	    if (!isOperaMini) {
	        $('#mobile-navigation').find('#login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        $('#mobile_login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	
	        $('#login_nav').attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        // $('#signup_nav').attr('href', '#')
	        //         .attr('data-toggle', 'modal')
	        //         .attr('data-target', '#authModal');
	        $.each($('.signup_nav'), function (key, val) {
	            $(val).attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        });
	    }
	
	    $('.top-search input').blur();
	
	    AutocompleteSearch();
	    MobileAutocompleteSearch();
	    AuthModal();
	
	    SignUp($('#id_phone_number'), sign_incallback);
	    LoginInitialize();
	    ResetInitialize(true);
	    ShareButtonCounter();
	}
	function ShareButtonCounter() {
	    function openWindow(e) {
	        e.preventDefault();
	        window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
	        return false;
	    }
	    $('.toggle_invite_section').click(function (e) {
	        $('#prelaunch_section').addClass('hidden');
	    });
	    $('.invite_friends_btn').click(function (e) {
	        $('#prelaunch_section').addClass('hidden');
	        $('#invite_counter_section').removeClass('collapse').removeClass('fade');
	        window.location.hash = '#launch_sec';
	    });
	
	    $('.share-popup').click(function (e) {
	        e.preventDefault();
	        console.log('I was clicked');
	        var window_size = '';
	        var url = this.href;
	        var domain = url.split('/')[2];
	        console.log(domain);
	        switch (domain) {
	            case 'www.facebook.com':
	                $.get(Urls['button_clicks']() + '?button_type=facebook', function () {});
	                window_size = 'width=585,height=368';
	                break;
	            case 'twitter.com':
	                $.get(Urls['button_clicks']() + '?button_type=twitter', function () {});
	                window_size = 'width=585,height=261';
	                break;
	            case 'plus.google.com':
	                $.get(Urls['button_clicks']() + '?button_type=google', function () {});
	                window_size = 'width=517,height=511';
	                break;
	            default:
	                window_size = 'width=585,height=511';
	        }
	        window.open(url, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,' + window_size);
	        return false;
	    });
	}
	
	exports.AuthModal = AuthModal;
	exports.LoginInitialize = LoginInitialize;
	exports.SignUp = SignUp;
	exports.ResetInitialize = ResetInitialize;
	exports.phone_value = phone_value;
	exports.intelInput = intelInput;
	exports.Authenticate = AuthFunction;
	exports.ShareButtonCounter = ShareButtonCounter;
	
	// signup_form.submit()
	// Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback,null);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	module.exports = Bloodhound;

/***/ },

/***/ 4:
/***/ function(module, exports, __webpack_require__) {

	module.exports = Urls;

/***/ },

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {//require('typeahead.js');
	'use strict';
	
	var Bloodhound = __webpack_require__(3);
	var Urls = __webpack_require__(4);
	function getBloodhoundInstance(name, prefetch, remote) {
	    var data = {
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(name),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        limit: 10,
	        prefetch: prefetch };
	    if (remote) {
	        data['remote'] = remote;
	    }
	    return new Bloodhound(data);
	}
	
	function getBloodhoundInstanceT(key, callback) {
	    return new Bloodhound({
	        datumTokenizer: function datumTokenizer(d) {
	            return Bloodhound.tokenizers.whitespace(d.name);
	        },
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        prefetch: callback()
	    });
	}
	function getBloodhoundInstanceT2(key, callback) {
	    return new Bloodhound({
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(key),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        local: callback()
	    });
	}
	function keyupCallback(node, no_of_chars, counter) {
	    var thisChars = node.value.replace(/{.*}/g, '').length; //get chars count in textarea
	    var per = thisChars * 100;
	    var value = per / no_of_chars; // total percent complete
	    if (thisChars > no_of_chars) //if we have more chars than it should be
	        {
	            var CharsToDel = thisChars - no_of_chars; // total extra chars to delete
	            node.value = node.value.substring(0, node.value.length - CharsToDel); //remove excess chars from textarea
	        } else {
	        counter.text(no_of_chars - thisChars); //count remaining chars
	        $('#percent').text(value + '%');
	    }
	}
	
	function FormInitialize(form, beforeSubmit, success, dataType, button_id) {
	    parsleyfyForm(form);
	
	    var error = function error(_error, xhr) {
	        if (_error.status === 400) {
	            var resp = JSON.parse(_error.responseText).form_errors;
	            console.debug(_error);
	            $('.invalid-form-error-message').html(resp.__all__[0]).addClass('filled');
	        }
	    };
	    formSubmission(form, beforeSubmit, success, error, dataType, button_id);
	}
	function AfterParsleyInitialize() {
	    window.ParsleyValidator.addValidator('valid_phone', function (value, requirement) {
	        alert('myvalidator');
	        return false;
	    }, 32).addMessage('en', 'myvalidator', 'my validator failed');
	}
	function ParsleyConfig() {
	    window.ParsleyExtend = {
	        asyncValidators: {
	            validate_email: {
	                fn: function fn(xhr) {
	                    console.log(this.$element); // jQuery Object[ input[name="q"] ]
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:validate_email']()
	            },
	            validate_duplicate_number: {
	                fn: function fn(xhr) {
	                    console.log(this.$element); // jQuery Object[ input[name="q"] ]
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:check_duplicate_number']()
	            },
	            validate_changed_number: {
	                fn: function fn(xhr) {
	                    console.log(this.$element);
	                    return 404 === xhr.status;
	                },
	                url: Urls['users:user_phone_verifcation_process']()
	            }
	        }
	    };
	    window.ParsleyConfig = {
	        validators: {
	            valid_phone: {
	                fn: function fn(value) {
	                    console.log(value);
	                    var x = value.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);
	                    return x !== null;
	                },
	                priority: 32
	            },
	            no_link: {
	                fn: function fn(value) {
	                    var regexp = new RegExp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	                    var x = value.match(regexp);
	                    return x === null;
	                },
	                priority: 90
	            },
	            no_email: {
	                fn: function fn(value) {
	                    var regexp = new RegExp('([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})', 'i');
	                    var x = value.match(regexp);
	                    return x === null;
	                },
	                priority: 91
	            },
	            validate_time: {
	                fn: function fn(value) {
	                    var end_time = moment(value, 'hh:mm: A');
	                    console.log(end_time.isValid());
	                    return end_time.isValid();
	                },
	                priority: 96
	            },
	            same_phone_number: {
	                fn: function fn(value) {
	                    console.log(value);
	                    var x = $('#id_number').val();
	                    console.debug(x.replace(/\s/g, ''));
	
	                    return x.replace(/\s/g, '') === value || x === value;
	                },
	                priority: 33
	            },
	            schedule_time: {
	                fn: function fn(value, requirement) {
	                    var end_time = moment(value, 'hh:mm: A');
	                    var start_time = moment($(requirement).val(), 'hh:mm: A');
	
	                    return end_time.hours() > start_time.hours();
	
	                    // var startvar v = moment("12:30 AM","hh:mm: A")
	                }
	            }
	        },
	        i18n: {
	            en: {
	                valid_phone: 'Phone number is invalid. should be of the form +234 703 520 9576',
	                same_phone_number: 'Phone number is not the same',
	                schedule_time: 'End time must be greater than start time with at least an hour',
	                no_link: 'Links are not allowed.',
	                validate_time: 'Pls input a time in this format 6:00 AM',
	                no_email: 'Email addresses are not allowed in this field'
	            }
	        }
	    };
	}
	
	var parsleyConfig = {
	    successClass: 'has-success',
	    errorClass: 'has-error',
	    classHandler: function classHandler(el) {
	        return el.$element.closest('.form-group');
	    },
	    errorsContainer: function errorsContainer(el) {
	        return el.$element.closest('.form-group');
	    },
	    errorsWrapper: '<span class=\'help-block\'></span>',
	    errorTemplate: '<span></span>'
	};
	
	function parsleyfyForm(form, ooo) {
	    var options = {
	        errorTemplate: '<li class="input-hint"></li>'
	    };
	    // if (ooo) {
	    form.parsley(parsleyConfig);
	    // } else {
	    // form.parsley(options);
	    // }
	}
	
	function formSubmission(form, beforeSubmitCallback, successCallback, errorCallback, dataType, button_id) {
	    if (dataType) {
	        var dt = dataType;
	    } else {
	        dt = 'json';
	    }
	    var err = errorCallback || function (re, xhr, btn) {
	        console.log(re);
	    };
	
	    form.on('submit', function (e) {
	        e.preventDefault();
	        var form = $(this);
	
	        console.log(form);
	        form.parsley().validate();
	        if (form.parsley().isValid()) {
	            beforeSubmitCallback(form);
	            if (button_id) {
	                var $btn = $(button_id).button('loading');
	            }
	            console.log(form.serialize());
	            $.ajax({
	                url: form.attr('action'),
	                type: form.attr('method'),
	                dataType: dt,
	                data: form.serialize(),
	                success: successCallback,
	                error: function error(er, xhr) {
	                    if (button_id) {
	                        $btn.button('reset');
	                    }
	                    err(er, xhr);
	                }
	            });
	        }
	    });
	}
	
	function TypeAheadConfig(name, key, source) {
	    return {
	        name: name,
	        displayKey: key,
	        source: source.ttAdapter()
	    };
	}
	
	function ApplyTypeaheadToInput(input, name, key, bhInstance, callback) {
	
	    var generic_options = {
	        hint: true,
	        highlight: true,
	        minLength: 2
	    };
	    input.typeahead(generic_options, TypeAheadConfig(name, key, bhInstance)).on('typeahead:selected', callback);
	}
	
	function SkillAutoComplete(input, cb) {
	    var callback = cb || function () {};
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	
	    BH.initialize();
	
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        callback();
	    });
	}
	function GenericSkillSearchAutocomplete(input, form) {
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	
	    BH.initialize();
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        form.submit();
	    });
	    console.log(form);
	    if (form.length > 0) {
	
	        form.parsley();
	    }
	}
	
	function GoogleAutoComplete(input, callback, domInsertedCallback) {
	    var autocomplete;
	    var initialize = function initialize() {
	        var options = {
	            types: ['address'],
	            componentRestrictions: {
	                country: 'ng'
	            }
	        };
	        var autocomplete = new google.maps.places.Autocomplete(input[0], options);
	        var responseCallback = function responseCallback() {
	            callback(autocomplete);
	        };
	        google.maps.event.addListener(autocomplete, 'place_changed', responseCallback);
	    };
	    google.maps.event.addDomListener(window, 'load', initialize);
	    // document.addEventListener('DOMNodeInserted', domInsertedCallback);
	};
	
	function getCookie(name) {
	    var cookieValue = null;
	    if (document.cookie && document.cookie != '') {
	        var cookies = document.cookie.split(';');
	        for (var i = 0; i < cookies.length; i++) {
	            var cookie = $.trim(cookies[i]);
	            // Does this cookie string begin with the name we want?
	            if (cookie.substring(0, name.length + 1) == name + '=') {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }
	    if (name == 'csrftoken') {
	        if (cookieValue == null) {
	            return $('input[name="csrfmiddlewaretoken"]').val();
	        }
	    }
	    return cookieValue;
	}
	
	function csrfSafeMethod(method) {
	    // these HTTP methods do not require CSRF protection
	    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
	}
	
	function hideAddMore(fset, parentNode, count) {
	    var c = count || 2;
	    if (fset.length >= c) {
	        parentNode.addClass('hide');
	    }
	    fset.find('.delete-row').addClass('hide');
	}
	function appendCSRFTOKEN() {
	    $.ajaxSetup({
	        beforeSend: function beforeSend(xhr, settings) {
	            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	                xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
	            }
	        }
	    });
	}
	exports.FormInitialize = FormInitialize;
	exports.parsleyfyForm = parsleyfyForm;
	exports.formSubmission = formSubmission;
	exports.HideFormsetControl = hideAddMore;
	exports.getBloodhoundInstance = getBloodhoundInstance;
	exports.getBloodhoundInstanceT = getBloodhoundInstanceT;
	exports.getBloodhoundInstanceT2 = getBloodhoundInstanceT2;
	exports.filterOptionByText = function (node, text) {
	    return node.find('option').filter(function () {
	        return $(this).html() == text;
	    });
	};
	exports.ApplyTypeaheadToInput = ApplyTypeaheadToInput;
	exports.SkillAutoComplete = SkillAutoComplete;
	exports.GoogleAutoComplete = GoogleAutoComplete;
	exports.GenericSkillSearchAutocomplete = GenericSkillSearchAutocomplete;
	exports.parsleyConfig = parsleyConfig;
	exports.keyupCallback = keyupCallback;
	exports.ParsleyConfig = ParsleyConfig;
	exports.getCookie = getCookie;
	exports.csrfSafeMethod = csrfSafeMethod;
	exports.appendCSRFTOKEN = appendCSRFTOKEN;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 9:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	International Telephone Input v3.7.1
	https://github.com/Bluefieldscom/intl-tel-input.git
	*/
	// wrap in UMD - see https://github.com/umdjs/umd/blob/master/jqueryPlugin.js
	"use strict";
	
	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
	            factory($, window, document);
	        }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	        factory(jQuery, window, document);
	    }
	})(function ($, window, document, undefined) {
	    "use strict";
	    var pluginName = "intlTelInput",
	        id = 1,
	        // give each instance it's own id for namespaced event handling
	    defaults = {
	        // automatically format the number according to the selected country
	        autoFormat: true,
	        // if there is just a dial code in the input: remove it on blur, and re-add it on focus
	        autoHideDialCode: true,
	        // default country
	        defaultCountry: "",
	        // token for ipinfo - required for https or over 1000 daily page views support
	        ipinfoToken: "",
	        // don't insert international dial codes
	        nationalMode: false,
	        // number type to use for placeholders
	        numberType: "MOBILE",
	        // display only these countries
	        onlyCountries: [],
	        // the countries at the top of the list. defaults to united states and united kingdom
	        preferredCountries: ["us", "gb"],
	        // make the dropdown the same width as the input
	        responsiveDropdown: false,
	        // specify the path to the libphonenumber script to enable validation/formatting
	        utilsScript: ""
	    },
	        keys = {
	        UP: 38,
	        DOWN: 40,
	        ENTER: 13,
	        ESC: 27,
	        PLUS: 43,
	        A: 65,
	        Z: 90,
	        ZERO: 48,
	        NINE: 57,
	        SPACE: 32,
	        BSPACE: 8,
	        DEL: 46,
	        CTRL: 17,
	        CMD1: 91,
	        // Chrome
	        CMD2: 224
	    },
	        windowLoaded = false;
	    // keep track of if the window.load event has fired as impossible to check after the fact
	    $(window).load(function () {
	        windowLoaded = true;
	    });
	    function Plugin(element, options) {
	        this.element = element;
	        this.options = $.extend({}, defaults, options);
	        this._defaults = defaults;
	        // event namespace
	        this.ns = "." + pluginName + id++;
	        // Chrome, FF, Safari, IE9+
	        this.isGoodBrowser = Boolean(element.setSelectionRange);
	        this.hadInitialPlaceholder = Boolean($(element).attr("placeholder"));
	        this._name = pluginName;
	        this.init();
	    }
	    Plugin.prototype = {
	        init: function init() {
	            var that = this;
	            // if defaultCountry is set to "auto", we must do a lookup first
	            if (this.options.defaultCountry == "auto") {
	                // reset this in case lookup fails
	                this.options.defaultCountry = "";
	                var ipinfoURL = "//ipinfo.io";
	                if (this.options.ipinfoToken) {
	                    ipinfoURL += "?token=" + this.options.ipinfoToken;
	                }
	                $.get(ipinfoURL, function (response) {
	                    if (response && response.country) {
	                        that.options.defaultCountry = response.country.toLowerCase();
	                    }
	                }, "jsonp").always(function () {
	                    that._ready();
	                });
	            } else {
	                this._ready();
	            }
	        },
	        _ready: function _ready() {
	            // if in nationalMode, disable options relating to dial codes
	            if (this.options.nationalMode) {
	                this.options.autoHideDialCode = false;
	            }
	            // IE Mobile doesn't support the keypress event (see issue 68) which makes autoFormat impossible
	            if (navigator.userAgent.match(/IEMobile/i)) {
	                this.options.autoFormat = false;
	            }
	            // auto enable responsiveDropdown mode on small screens (dropdown is currently set to 430px in CSS)
	            if (window.innerWidth < 500) {
	                this.options.responsiveDropdown = true;
	            }
	            // process all the data: onlyCountries, preferredCountries etc
	            this._processCountryData();
	            // generate the markup
	            this._generateMarkup();
	            // set the initial state of the input value and the selected flag
	            this._setInitialState();
	            // start all of the event listeners: autoHideDialCode, input keydown, selectedFlag click
	            this._initListeners();
	        },
	        /********************
	        *  PRIVATE METHODS
	        ********************/
	        // prepare all of the country data, including onlyCountries and preferredCountries options
	        _processCountryData: function _processCountryData() {
	            // set the instances country data objects
	            this._setInstanceCountryData();
	            // set the preferredCountries property
	            this._setPreferredCountries();
	        },
	        // add a country code to this.countryCodes
	        _addCountryCode: function _addCountryCode(iso2, dialCode, priority) {
	            if (!(dialCode in this.countryCodes)) {
	                this.countryCodes[dialCode] = [];
	            }
	            var index = priority || 0;
	            this.countryCodes[dialCode][index] = iso2;
	        },
	        // process onlyCountries array if present, and generate the countryCodes map
	        _setInstanceCountryData: function _setInstanceCountryData() {
	            var i;
	            // process onlyCountries option
	            if (this.options.onlyCountries.length) {
	                this.countries = [];
	                for (i = 0; i < allCountries.length; i++) {
	                    if ($.inArray(allCountries[i].iso2, this.options.onlyCountries) != -1) {
	                        this.countries.push(allCountries[i]);
	                    }
	                }
	            } else {
	                this.countries = allCountries;
	            }
	            // generate countryCodes map
	            this.countryCodes = {};
	            for (i = 0; i < this.countries.length; i++) {
	                var c = this.countries[i];
	                this._addCountryCode(c.iso2, c.dialCode, c.priority);
	                // area codes
	                if (c.areaCodes) {
	                    for (var j = 0; j < c.areaCodes.length; j++) {
	                        // full dial code is country code + dial code
	                        this._addCountryCode(c.iso2, c.dialCode + c.areaCodes[j]);
	                    }
	                }
	            }
	        },
	        // process preferred countries - iterate through the preferences,
	        // fetching the country data for each one
	        _setPreferredCountries: function _setPreferredCountries() {
	            this.preferredCountries = [];
	            for (var i = 0; i < this.options.preferredCountries.length; i++) {
	                var countryCode = this.options.preferredCountries[i],
	                    countryData = this._getCountryData(countryCode, false, true);
	                if (countryData) {
	                    this.preferredCountries.push(countryData);
	                }
	            }
	        },
	        // generate all of the markup for the plugin: the selected flag overlay, and the dropdown
	        _generateMarkup: function _generateMarkup() {
	            // telephone input
	            this.telInput = $(this.element);
	            // containers (mostly for positioning)
	            this.telInput.wrap($("<div>", {
	                "class": "intl-tel-input"
	            }));
	            var flagsContainer = $("<div>", {
	                "class": "flag-dropdown"
	            }).insertAfter(this.telInput);
	            // currently selected flag (displayed to left of input)
	            var selectedFlag = $("<div>", {
	                "class": "selected-flag"
	            }).appendTo(flagsContainer);
	            this.selectedFlagInner = $("<div>", {
	                "class": "flag"
	            }).appendTo(selectedFlag);
	            // CSS triangle
	            $("<div>", {
	                "class": "arrow"
	            }).appendTo(this.selectedFlagInner);
	            // country list contains: preferred countries, then divider, then all countries
	            this.countryList = $("<ul>", {
	                "class": "country-list v-hide"
	            }).appendTo(flagsContainer);
	            if (this.preferredCountries.length) {
	                this._appendListItems(this.preferredCountries, "preferred");
	                $("<li>", {
	                    "class": "divider"
	                }).appendTo(this.countryList);
	            }
	            this._appendListItems(this.countries, "");
	            // now we can grab the dropdown height, and hide it properly
	            this.dropdownHeight = this.countryList.outerHeight();
	            this.countryList.removeClass("v-hide").addClass("hide");
	            // and set the width
	            if (this.options.responsiveDropdown) {
	                this.countryList.outerWidth(this.telInput.outerWidth());
	            }
	            // this is useful in lots of places
	            this.countryListItems = this.countryList.children(".country");
	        },
	        // add a country <li> to the countryList <ul> container
	        _appendListItems: function _appendListItems(countries, className) {
	            // we create so many DOM elements, I decided it was faster to build a temp string
	            // and then add everything to the DOM in one go at the end
	            var tmp = "";
	            // for each country
	            for (var i = 0; i < countries.length; i++) {
	                var c = countries[i];
	                // open the list item
	                tmp += "<li class='country " + className + "' data-dial-code='" + c.dialCode + "' data-country-code='" + c.iso2 + "'>";
	                // add the flag
	                tmp += "<div class='flag " + c.iso2 + "'></div>";
	                // and the country name and dial code
	                tmp += "<span class='country-name'>" + c.name + "</span>";
	                tmp += "<span class='dial-code'>+" + c.dialCode + "</span>";
	                // close the list item
	                tmp += "</li>";
	            }
	            this.countryList.append(tmp);
	        },
	        // set the initial state of the input value and the selected flag
	        _setInitialState: function _setInitialState() {
	            var val = this.telInput.val();
	            // if there is a number, and it's valid, we can go ahead and set the flag, else fall back to default
	            if (this._getDialCode(val)) {
	                this._updateFlagFromNumber(val);
	            } else {
	                var defaultCountry;
	                // check the defaultCountry option, else fall back to the first in the list
	                if (this.options.defaultCountry) {
	                    defaultCountry = this._getCountryData(this.options.defaultCountry, false, false);
	                } else {
	                    defaultCountry = this.preferredCountries.length ? this.preferredCountries[0] : this.countries[0];
	                }
	                this._selectFlag(defaultCountry.iso2);
	                // if empty, insert the default dial code (this function will check !nationalMode and !autoHideDialCode)
	                if (!val) {
	                    this._updateDialCode(defaultCountry.dialCode, false);
	                }
	            }
	            // format
	            if (val) {
	                // this wont be run after _updateDialCode as that's only called if no val
	                this._updateVal(val, false);
	            }
	        },
	        // initialise the main event listeners: input keyup, and click selected flag
	        _initListeners: function _initListeners() {
	            var that = this;
	            this._initKeyListeners();
	            // autoFormat prevents the change event from firing, so we need to check for changes between focus and blur in order to manually trigger it
	            if (this.options.autoHideDialCode || this.options.autoFormat) {
	                this._initFocusListeners();
	            }
	            // hack for input nested inside label: clicking the selected-flag to open the dropdown would then automatically trigger a 2nd click on the input which would close it again
	            var label = this.telInput.closest("label");
	            if (label.length) {
	                label.on("click" + this.ns, function (e) {
	                    // if the dropdown is closed, then focus the input, else ignore the click
	                    if (that.countryList.hasClass("hide")) {
	                        that.telInput.focus();
	                    } else {
	                        e.preventDefault();
	                    }
	                });
	            }
	            // toggle country dropdown on click
	            var selectedFlag = this.selectedFlagInner.parent();
	            selectedFlag.on("click" + this.ns, function (e) {
	                // only intercept this event if we're opening the dropdown
	                // else let it bubble up to the top ("click-off-to-close" listener)
	                // we cannot just stopPropagation as it may be needed to close another instance
	                if (that.countryList.hasClass("hide") && !that.telInput.prop("disabled")) {
	                    that._showDropdown();
	                }
	            });
	            // if the user has specified the path to the utils script, fetch it on window.load
	            if (this.options.utilsScript) {
	                // if the plugin is being initialised after the window.load event has already been fired
	                if (windowLoaded) {
	                    this.loadUtils();
	                } else {
	                    // wait until the load event so we don't block any other requests e.g. the flags image
	                    $(window).load(function () {
	                        that.loadUtils();
	                    });
	                }
	            }
	        },
	        _initKeyListeners: function _initKeyListeners() {
	            var that = this;
	            if (this.options.autoFormat) {
	                // format number and update flag on keypress
	                // use keypress event as we want to ignore all input except for a select few keys,
	                // but we dont want to ignore the navigation keys like the arrows etc.
	                // NOTE: no point in refactoring this to only bind these listeners on focus/blur because then you would need to have those 2 listeners running the whole time anyway...
	                this.telInput.on("keypress" + this.ns, function (e) {
	                    // 32 is space, and after that it's all chars (not meta/nav keys)
	                    // this fix is needed for Firefox, which triggers keypress event for some meta/nav keys
	                    // Update: also ignore if this is a metaKey e.g. FF and Safari trigger keypress on the v of Ctrl+v
	                    // Update: also check that we have utils before we do any autoFormat stuff
	                    if (e.which >= keys.SPACE && !e.metaKey && window.intlTelInputUtils) {
	                        e.preventDefault();
	                        // allowed keys are just numeric keys and plus
	                        // we must allow plus for the case where the user does select-all and then hits plus to start typing a new number. we could refine this logic to first check that the selection contains a plus, but that wont work in old browsers, and I think it's overkill anyway
	                        var isAllowedKey = e.which >= keys.ZERO && e.which <= keys.NINE || e.which == keys.PLUS,
	                            input = that.telInput[0],
	                            noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd,
	                            max = that.telInput.attr("maxlength"),
	                            // assumes that if max exists, it is >0
	                        isBelowMax = max ? that.telInput.val().length < max : true;
	                        // first: ensure we dont go over maxlength. we must do this here to prevent adding digits in the middle of the number
	                        // still reformat even if not an allowed key as they could by typing a formatting char, but ignore if there's a selection as doesn't make sense to replace selection with illegal char and then immediately remove it
	                        if (isBelowMax && (isAllowedKey || noSelection)) {
	                            var newChar = isAllowedKey ? String.fromCharCode(e.which) : null;
	                            that._handleInputKey(newChar, true);
	                        }
	                        if (!isAllowedKey) {
	                            that.telInput.trigger("invalidkey");
	                        }
	                    }
	                });
	            }
	            // handle keyup event
	            // for autoFormat: we use keyup to catch delete events after the fact
	            this.telInput.on("keyup" + this.ns, function (e) {
	                // the "enter" key event from selecting a dropdown item is triggered here on the input, because the document.keydown handler that initially handles that event triggers a focus on the input, and so the keyup for that same key event gets triggered here. weird, but just make sure we dont bother doing any re-formatting in this case (we've already done preventDefault in the keydown handler, so it wont actually submit the form or anything).
	                if (e.which == keys.ENTER) {} else if (that.options.autoFormat && window.intlTelInputUtils) {
	                    var isCtrl = e.which == keys.CTRL || e.which == keys.CMD1 || e.which == keys.CMD2,
	                        input = that.telInput[0],
	                        // noSelection defaults to false for bad browsers, else would be reformatting on all ctrl keys e.g. select-all/copy
	                    noSelection = that.isGoodBrowser && input.selectionStart == input.selectionEnd,
	                        // cursorAtEnd defaults to false for bad browsers else they would never get a reformat on delete
	                    cursorAtEnd = that.isGoodBrowser && input.selectionStart == that.telInput.val().length;
	                    // if delete in the middle: reformat with no suffix (no need to reformat if delete at end)
	                    // if backspace: reformat with no suffix (need to reformat if at end to remove any lingering suffix - this is a feature)
	                    // if ctrl and no selection (i.e. could have just been a paste): reformat (if cursorAtEnd: add suffix)
	                    if (e.which == keys.DEL && !cursorAtEnd || e.which == keys.BSPACE || isCtrl && noSelection) {
	                        // important to remember never to add suffix on any delete key as can fuck up in ie8 so you can never delete a formatting char at the end
	                        that._handleInputKey(null, isCtrl && cursorAtEnd);
	                    }
	                    // prevent deleting the plus (if not in nationalMode)
	                    if (!that.options.nationalMode) {
	                        var val = that.telInput.val();
	                        if (val.substr(0, 1) != "+") {
	                            // newCursorPos is current pos + 1 to account for the plus we are about to add
	                            var newCursorPos = that.isGoodBrowser ? input.selectionStart + 1 : 0;
	                            that.telInput.val("+" + val);
	                            if (that.isGoodBrowser) {
	                                input.setSelectionRange(newCursorPos, newCursorPos);
	                            }
	                        }
	                    }
	                } else {
	                    // if no autoFormat, just update flag
	                    that._updateFlagFromNumber(that.telInput.val());
	                }
	            });
	        },
	        // when autoFormat is enabled: handle various key events on the input: the 2 main situations are 1) adding a new number character, which will replace any selection, reformat, and try to preserve the cursor position. and 2) reformatting on backspace, or paste event
	        _handleInputKey: function _handleInputKey(newNumericChar, addSuffix) {
	            var val = this.telInput.val(),
	                newCursor = null,
	                cursorAtEnd = false,
	                // raw DOM element
	            input = this.telInput[0];
	            if (this.isGoodBrowser) {
	                var selectionEnd = input.selectionEnd,
	                    originalLen = val.length;
	                cursorAtEnd = selectionEnd == originalLen;
	                // if handling a new number character: insert it in the right place and calculate the new cursor position
	                if (newNumericChar) {
	                    // replace any selection they may have made with the new char
	                    val = val.substr(0, input.selectionStart) + newNumericChar + val.substring(selectionEnd, originalLen);
	                    // if the cursor was not at the end then calculate it's new pos
	                    if (!cursorAtEnd) {
	                        newCursor = selectionEnd + (val.length - originalLen);
	                    }
	                } else {
	                    // here we're not handling a new char, we're just doing a re-format, but we still need to maintain the cursor position
	                    newCursor = input.selectionStart;
	                }
	            } else if (newNumericChar) {
	                val += newNumericChar;
	            }
	            // update the number and flag
	            this.setNumber(val, addSuffix);
	            // update the cursor position
	            if (this.isGoodBrowser) {
	                // if it was at the end, keep it there
	                if (cursorAtEnd) {
	                    newCursor = this.telInput.val().length;
	                }
	                input.setSelectionRange(newCursor, newCursor);
	            }
	        },
	        // listen for focus and blur
	        _initFocusListeners: function _initFocusListeners() {
	            var that = this;
	            if (this.options.autoHideDialCode) {
	                // mousedown decides where the cursor goes, so if we're focusing we must preventDefault as we'll be inserting the dial code, and we want the cursor to be at the end no matter where they click
	                this.telInput.on("mousedown" + this.ns, function (e) {
	                    if (!that.telInput.is(":focus") && !that.telInput.val()) {
	                        e.preventDefault();
	                        // but this also cancels the focus, so we must trigger that manually
	                        that.telInput.focus();
	                    }
	                });
	            }
	            this.telInput.on("focus" + this.ns, function () {
	                var value = that.telInput.val();
	                // save this to compare on blur
	                that.telInput.data("focusVal", value);
	                if (that.options.autoHideDialCode) {
	                    // on focus: if empty, insert the dial code for the currently selected flag
	                    if (!value) {
	                        that._updateVal("+" + that.selectedCountryData.dialCode, true);
	                        // after auto-inserting a dial code, if the first key they hit is '+' then assume they are entering a new number, so remove the dial code. use keypress instead of keydown because keydown gets triggered for the shift key (required to hit the + key), and instead of keyup because that shows the new '+' before removing the old one
	                        that.telInput.one("keypress.plus" + that.ns, function (e) {
	                            if (e.which == keys.PLUS) {
	                                // if autoFormat is enabled, this key event will have already have been handled by another keypress listener (hence we need to add the "+"). if disabled, it will be handled after this by a keyup listener (hence no need to add the "+").
	                                var newVal = that.options.autoFormat && window.intlTelInputUtils ? "+" : "";
	                                that.telInput.val(newVal);
	                            }
	                        });
	                        // after tabbing in, make sure the cursor is at the end we must use setTimeout to get outside of the focus handler as it seems the selection happens after that
	                        setTimeout(function () {
	                            var input = that.telInput[0];
	                            if (that.isGoodBrowser) {
	                                var len = that.telInput.val().length;
	                                input.setSelectionRange(len, len);
	                            }
	                        });
	                    }
	                }
	            });
	            this.telInput.on("blur" + this.ns, function () {
	                if (that.options.autoHideDialCode) {
	                    // on blur: if just a dial code then remove it
	                    var value = that.telInput.val(),
	                        startsPlus = value.substr(0, 1) == "+";
	                    if (startsPlus) {
	                        var numeric = that._getNumeric(value);
	                        // if just a plus, or if just a dial code
	                        if (!numeric || that.selectedCountryData.dialCode == numeric) {
	                            that.telInput.val("");
	                        }
	                    }
	                    // remove the keypress listener we added on focus
	                    that.telInput.off("keypress.plus" + that.ns);
	                }
	                // if autoFormat, we must manually trigger change event if value has changed
	                if (that.options.autoFormat && window.intlTelInputUtils && that.telInput.val() != that.telInput.data("focusVal")) {
	                    that.telInput.trigger("change");
	                }
	            });
	        },
	        // extract the numeric digits from the given string
	        _getNumeric: function _getNumeric(s) {
	            return s.replace(/\D/g, "");
	        },
	        // show the dropdown
	        _showDropdown: function _showDropdown() {
	            this._setDropdownPosition();
	            // update highlighting and scroll to active list item
	            var activeListItem = this.countryList.children(".active");
	            this._highlightListItem(activeListItem);
	            // show it
	            this.countryList.removeClass("hide");
	            this._scrollTo(activeListItem);
	            // bind all the dropdown-related listeners: mouseover, click, click-off, keydown
	            this._bindDropdownListeners();
	            // update the arrow
	            this.selectedFlagInner.children(".arrow").addClass("up");
	        },
	        // decide where to position dropdown (depends on position within viewport, and scroll)
	        _setDropdownPosition: function _setDropdownPosition() {
	            var inputTop = this.telInput.offset().top,
	                windowTop = $(window).scrollTop(),
	                // dropdownFitsBelow = (dropdownBottom < windowBottom)
	            dropdownFitsBelow = inputTop + this.telInput.outerHeight() + this.dropdownHeight < windowTop + $(window).height(),
	                dropdownFitsAbove = inputTop - this.dropdownHeight > windowTop;
	            // dropdownHeight - 1 for border
	            var cssTop = !dropdownFitsBelow && dropdownFitsAbove ? "-" + (this.dropdownHeight - 1) + "px" : "";
	            this.countryList.css("top", cssTop);
	        },
	        // we only bind dropdown listeners when the dropdown is open
	        _bindDropdownListeners: function _bindDropdownListeners() {
	            var that = this;
	            // when mouse over a list item, just highlight that one
	            // we add the class "highlight", so if they hit "enter" we know which one to select
	            this.countryList.on("mouseover" + this.ns, ".country", function (e) {
	                that._highlightListItem($(this));
	            });
	            // listen for country selection
	            this.countryList.on("click" + this.ns, ".country", function (e) {
	                that._selectListItem($(this));
	            });
	            // click off to close
	            // (except when this initial opening click is bubbling up)
	            // we cannot just stopPropagation as it may be needed to close another instance
	            var isOpening = true;
	            $("html").on("click" + this.ns, function (e) {
	                if (!isOpening) {
	                    that._closeDropdown();
	                }
	                isOpening = false;
	            });
	            // listen for up/down scrolling, enter to select, or letters to jump to country name.
	            // use keydown as keypress doesn't fire for non-char keys and we want to catch if they
	            // just hit down and hold it to scroll down (no keyup event).
	            // listen on the document because that's where key events are triggered if no input has focus
	            var query = "",
	                queryTimer = null;
	            $(document).on("keydown" + this.ns, function (e) {
	                // prevent down key from scrolling the whole page,
	                // and enter key from submitting a form etc
	                e.preventDefault();
	                if (e.which == keys.UP || e.which == keys.DOWN) {
	                    // up and down to navigate
	                    that._handleUpDownKey(e.which);
	                } else if (e.which == keys.ENTER) {
	                    // enter to select
	                    that._handleEnterKey();
	                } else if (e.which == keys.ESC) {
	                    // esc to close
	                    that._closeDropdown();
	                } else if (e.which >= keys.A && e.which <= keys.Z || e.which == keys.SPACE) {
	                    // upper case letters (note: keyup/keydown only return upper case letters)
	                    // jump to countries that start with the query string
	                    if (queryTimer) {
	                        clearTimeout(queryTimer);
	                    }
	                    query += String.fromCharCode(e.which);
	                    that._searchForCountry(query);
	                    // if the timer hits 1 second, reset the query
	                    queryTimer = setTimeout(function () {
	                        query = "";
	                    }, 1000);
	                }
	            });
	        },
	        // highlight the next/prev item in the list (and ensure it is visible)
	        _handleUpDownKey: function _handleUpDownKey(key) {
	            var current = this.countryList.children(".highlight").first();
	            var next = key == keys.UP ? current.prev() : current.next();
	            if (next.length) {
	                // skip the divider
	                if (next.hasClass("divider")) {
	                    next = key == keys.UP ? next.prev() : next.next();
	                }
	                this._highlightListItem(next);
	                this._scrollTo(next);
	            }
	        },
	        // select the currently highlighted item
	        _handleEnterKey: function _handleEnterKey() {
	            var currentCountry = this.countryList.children(".highlight").first();
	            if (currentCountry.length) {
	                this._selectListItem(currentCountry);
	            }
	        },
	        // find the first list item whose name starts with the query string
	        _searchForCountry: function _searchForCountry(query) {
	            for (var i = 0; i < this.countries.length; i++) {
	                if (this._startsWith(this.countries[i].name, query)) {
	                    var listItem = this.countryList.children("[data-country-code=" + this.countries[i].iso2 + "]").not(".preferred");
	                    // update highlighting and scroll
	                    this._highlightListItem(listItem);
	                    this._scrollTo(listItem, true);
	                    break;
	                }
	            }
	        },
	        // check if (uppercase) string a starts with string b
	        _startsWith: function _startsWith(a, b) {
	            return a.substr(0, b.length).toUpperCase() == b;
	        },
	        // update the input's value to the given val
	        // if autoFormat=true, format it first according to the country-specific formatting rules
	        _updateVal: function _updateVal(val, addSuffix) {
	            var formatted;
	            if (this.options.autoFormat && window.intlTelInputUtils) {
	                formatted = intlTelInputUtils.formatNumber(val, this.selectedCountryData.iso2, addSuffix);
	                // ensure we dont go over maxlength. we must do this here to truncate any formatting suffix, and also handle paste events
	                var max = this.telInput.attr("maxlength");
	                if (max && formatted.length > max) {
	                    formatted = formatted.substr(0, max);
	                }
	            } else {
	                // no autoFormat, so just insert the original value
	                formatted = val;
	            }
	            this.telInput.val(formatted);
	        },
	        // check if need to select a new flag based on the given number
	        _updateFlagFromNumber: function _updateFlagFromNumber(number) {
	            // if we're in nationalMode and we're on US/Canada, make sure the number starts with a +1 so _getDialCode will be able to extract the area code
	            // update: if we dont yet have selectedCountryData, but we're here (trying to update the flag from the number), that means we're initialising the plugin with a number that already has a dial code, so fine to ignore this bit
	            if (this.options.nationalMode && this.selectedCountryData && this.selectedCountryData.dialCode == "1" && number.substr(0, 1) != "+") {
	                number = "+1" + number;
	            }
	            // try and extract valid dial code from input
	            var dialCode = this._getDialCode(number);
	            if (dialCode) {
	                // check if one of the matching countries is already selected
	                var countryCodes = this.countryCodes[this._getNumeric(dialCode)],
	                    alreadySelected = false;
	                if (this.selectedCountryData) {
	                    for (var i = 0; i < countryCodes.length; i++) {
	                        if (countryCodes[i] == this.selectedCountryData.iso2) {
	                            alreadySelected = true;
	                        }
	                    }
	                }
	                // if a matching country is not already selected (or this is an unknown NANP area code): choose the first in the list
	                if (!alreadySelected || this._isUnknownNanp(number, dialCode)) {
	                    // if using onlyCountries option, countryCodes[0] may be empty, so we must find the first non-empty index
	                    for (var j = 0; j < countryCodes.length; j++) {
	                        if (countryCodes[j]) {
	                            this._selectFlag(countryCodes[j]);
	                            break;
	                        }
	                    }
	                }
	            }
	        },
	        // check if the given number contains an unknown area code from the North American Numbering Plan i.e. the only dialCode that could be extracted was +1 but the actual number's length is >=4
	        _isUnknownNanp: function _isUnknownNanp(number, dialCode) {
	            return dialCode == "+1" && this._getNumeric(number).length >= 4;
	        },
	        // remove highlighting from other list items and highlight the given item
	        _highlightListItem: function _highlightListItem(listItem) {
	            this.countryListItems.removeClass("highlight");
	            listItem.addClass("highlight");
	        },
	        // find the country data for the given country code
	        // the ignoreOnlyCountriesOption is only used during init() while parsing the onlyCountries array
	        _getCountryData: function _getCountryData(countryCode, ignoreOnlyCountriesOption, allowFail) {
	            var countryList = ignoreOnlyCountriesOption ? allCountries : this.countries;
	            for (var i = 0; i < countryList.length; i++) {
	                if (countryList[i].iso2 == countryCode) {
	                    return countryList[i];
	                }
	            }
	            if (allowFail) {
	                return null;
	            } else {
	                throw new Error("No country data for '" + countryCode + "'");
	            }
	        },
	        // select the given flag, update the placeholder and the active list item
	        _selectFlag: function _selectFlag(countryCode) {
	            // do this first as it will throw an error and stop if countryCode is invalid
	            this.selectedCountryData = this._getCountryData(countryCode, false, false);
	            this.selectedFlagInner.attr("class", "flag " + countryCode);
	            // update the selected country's title attribute
	            var title = this.selectedCountryData.name + ": +" + this.selectedCountryData.dialCode;
	            this.selectedFlagInner.parent().attr("title", title);
	            // and the input's placeholder
	            this._updatePlaceholder();
	            // update the active list item
	            var listItem = this.countryListItems.children(".flag." + countryCode).first().parent();
	            this.countryListItems.removeClass("active");
	            listItem.addClass("active");
	        },
	        // update the input placeholder to an example number from the currently selected country
	        _updatePlaceholder: function _updatePlaceholder() {
	            if (window.intlTelInputUtils && !this.hadInitialPlaceholder) {
	                var iso2 = this.selectedCountryData.iso2,
	                    numberType = intlTelInputUtils.numberType[this.options.numberType || "FIXED_LINE"],
	                    placeholder = intlTelInputUtils.getExampleNumber(iso2, this.options.nationalMode, numberType);
	                this.telInput.attr("placeholder", placeholder);
	            }
	        },
	        // called when the user selects a list item from the dropdown
	        _selectListItem: function _selectListItem(listItem) {
	            // update selected flag and active list item
	            var countryCode = listItem.attr("data-country-code");
	            this._selectFlag(countryCode);
	            this._closeDropdown();
	            this._updateDialCode(listItem.attr("data-dial-code"), true);
	            // always fire the change event as even if nationalMode=true (and we haven't updated the input val), the system as a whole has still changed - see country-sync example. think of it as making a selection from a select element.
	            this.telInput.trigger("change");
	            // focus the input
	            this.telInput.focus();
	        },
	        // close the dropdown and unbind any listeners
	        _closeDropdown: function _closeDropdown() {
	            this.countryList.addClass("hide");
	            // update the arrow
	            this.selectedFlagInner.children(".arrow").removeClass("up");
	            // unbind key events
	            $(document).off(this.ns);
	            // unbind click-off-to-close
	            $("html").off(this.ns);
	            // unbind hover and click listeners
	            this.countryList.off(this.ns);
	        },
	        // check if an element is visible within it's container, else scroll until it is
	        _scrollTo: function _scrollTo(element, middle) {
	            var container = this.countryList,
	                containerHeight = container.height(),
	                containerTop = container.offset().top,
	                containerBottom = containerTop + containerHeight,
	                elementHeight = element.outerHeight(),
	                elementTop = element.offset().top,
	                elementBottom = elementTop + elementHeight,
	                newScrollTop = elementTop - containerTop + container.scrollTop(),
	                middleOffset = containerHeight / 2 - elementHeight / 2;
	            if (elementTop < containerTop) {
	                // scroll up
	                if (middle) {
	                    newScrollTop -= middleOffset;
	                }
	                container.scrollTop(newScrollTop);
	            } else if (elementBottom > containerBottom) {
	                // scroll down
	                if (middle) {
	                    newScrollTop += middleOffset;
	                }
	                var heightDifference = containerHeight - elementHeight;
	                container.scrollTop(newScrollTop - heightDifference);
	            }
	        },
	        // replace any existing dial code with the new one (if not in nationalMode)
	        // also we need to know if we're focusing for a couple of reasons e.g. if so, we want to add any formatting suffix, also if the input is empty and we're not in nationalMode, then we want to insert the dial code
	        _updateDialCode: function _updateDialCode(newDialCode, focusing) {
	            var inputVal = this.telInput.val(),
	                newNumber;
	            // save having to pass this every time
	            newDialCode = "+" + newDialCode;
	            if (this.options.nationalMode && inputVal.substr(0, 1) != "+") {
	                // if nationalMode, we just want to re-format
	                newNumber = inputVal;
	            } else if (inputVal) {
	                // if the previous number contained a valid dial code, replace it
	                // (if more than just a plus character)
	                var prevDialCode = this._getDialCode(inputVal);
	                if (prevDialCode.length > 1) {
	                    newNumber = inputVal.replace(prevDialCode, newDialCode);
	                } else {
	                    // if the previous number didn't contain a dial code, we should persist it
	                    var existingNumber = inputVal.substr(0, 1) != "+" ? $.trim(inputVal) : "";
	                    newNumber = newDialCode + existingNumber;
	                }
	            } else {
	                newNumber = !this.options.autoHideDialCode || focusing ? newDialCode : "";
	            }
	            this._updateVal(newNumber, focusing);
	        },
	        // try and extract a valid international dial code from a full telephone number
	        // Note: returns the raw string inc plus character and any whitespace/dots etc
	        _getDialCode: function _getDialCode(number) {
	            var dialCode = "";
	            // only interested in international numbers (starting with a plus)
	            if (number.charAt(0) == "+") {
	                var numericChars = "";
	                // iterate over chars
	                for (var i = 0; i < number.length; i++) {
	                    var c = number.charAt(i);
	                    // if char is number
	                    if ($.isNumeric(c)) {
	                        numericChars += c;
	                        // if current numericChars make a valid dial code
	                        if (this.countryCodes[numericChars]) {
	                            // store the actual raw string (useful for matching later)
	                            dialCode = number.substr(0, i + 1);
	                        }
	                        // longest dial code is 4 chars
	                        if (numericChars.length == 4) {
	                            break;
	                        }
	                    }
	                }
	            }
	            return dialCode;
	        },
	        /********************
	        *  PUBLIC METHODS
	        ********************/
	        // remove plugin
	        destroy: function destroy() {
	            // make sure the dropdown is closed (and unbind listeners)
	            this._closeDropdown();
	            // key events, and focus/blur events if autoHideDialCode=true
	            this.telInput.off(this.ns);
	            // click event to open dropdown
	            this.selectedFlagInner.parent().off(this.ns);
	            // label click hack
	            this.telInput.closest("label").off(this.ns);
	            // remove markup
	            var container = this.telInput.parent();
	            container.before(this.telInput).remove();
	        },
	        // format the number to E164
	        getCleanNumber: function getCleanNumber() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.formatNumberE164(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return "";
	        },
	        // get the type of the entered number e.g. landline/mobile
	        getNumberType: function getNumberType() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.getNumberType(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return -99;
	        },
	        // get the country data for the currently selected flag
	        getSelectedCountryData: function getSelectedCountryData() {
	            // if this is undefined, the plugin will return it's instance instead, so in that case an empty object makes more sense
	            return this.selectedCountryData || {};
	        },
	        // get the validation error
	        getValidationError: function getValidationError() {
	            if (window.intlTelInputUtils) {
	                return intlTelInputUtils.getValidationError(this.telInput.val(), this.selectedCountryData.iso2);
	            }
	            return -99;
	        },
	        // validate the input val - assumes the global function isValidNumber (from utilsScript)
	        isValidNumber: function isValidNumber() {
	            var val = $.trim(this.telInput.val()),
	                countryCode = this.options.nationalMode ? this.selectedCountryData.iso2 : "",
	                // libphonenumber allows alpha chars, but in order to allow that, we'd need a method to retrieve the processed number, with letters replaced with numbers
	            containsAlpha = /[a-zA-Z]/.test(val);
	            if (!containsAlpha && window.intlTelInputUtils) {
	                return intlTelInputUtils.isValidNumber(val, countryCode);
	            }
	            return false;
	        },
	        // load the utils script
	        loadUtils: function loadUtils(path) {
	            var utilsScript = path || this.options.utilsScript;
	            if (!$.fn[pluginName].loadedUtilsScript && utilsScript) {
	                // don't do this twice! (dont just check if the global intlTelInputUtils exists as if init plugin multiple times in quick succession, it may not have finished loading yet)
	                $.fn[pluginName].loadedUtilsScript = true;
	                // dont use $.getScript as it prevents caching
	                $.ajax({
	                    url: utilsScript,
	                    success: function success() {
	                        // tell all instances the utils are ready
	                        $(".intl-tel-input input").intlTelInput("utilsLoaded");
	                    },
	                    dataType: "script",
	                    cache: true
	                });
	            }
	        },
	        // update the selected flag, and update the input val accordingly
	        selectCountry: function selectCountry(countryCode) {
	            // check if already selected
	            if (!this.selectedFlagInner.hasClass(countryCode)) {
	                this._selectFlag(countryCode);
	                this._updateDialCode(this.selectedCountryData.dialCode, false);
	            }
	        },
	        // set the input value and update the flag
	        setNumber: function setNumber(number, addSuffix) {
	            // ensure starts with plus
	            if (!this.options.nationalMode && number.substr(0, 1) != "+") {
	                number = "+" + number;
	            }
	            // we must update the flag first, which updates this.selectedCountryData, which is used later for formatting the number before displaying it
	            this._updateFlagFromNumber(number);
	            this._updateVal(number, addSuffix);
	        },
	        // this is called when the utils are ready
	        utilsLoaded: function utilsLoaded() {
	            // if autoFormat is enabled and there's an initial value in the input, then format it
	            if (this.options.autoFormat && this.telInput.val()) {
	                this._updateVal(this.telInput.val());
	            }
	            this._updatePlaceholder();
	        }
	    };
	    // adapted to allow public functions
	    // using https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Extending-jQuery-Boilerplate
	    $.fn[pluginName] = function (options) {
	        var args = arguments;
	        // Is the first parameter an object (options), or was omitted,
	        // instantiate a new instance of the plugin.
	        if (options === undefined || typeof options === "object") {
	            return this.each(function () {
	                if (!$.data(this, "plugin_" + pluginName)) {
	                    $.data(this, "plugin_" + pluginName, new Plugin(this, options));
	                }
	            });
	        } else if (typeof options === "string" && options[0] !== "_" && options !== "init") {
	            // If the first parameter is a string and it doesn't start
	            // with an underscore or "contains" the `init`-function,
	            // treat this as a call to a public method.
	            // Cache the method call to make it possible to return a value
	            var returns;
	            this.each(function () {
	                var instance = $.data(this, "plugin_" + pluginName);
	                // Tests that there's already a plugin-instance
	                // and checks that the requested public method exists
	                if (instance instanceof Plugin && typeof instance[options] === "function") {
	                    // Call the method of our plugin instance,
	                    // and pass it the supplied arguments.
	                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
	                }
	                // Allow instances to be destroyed via the 'destroy' method
	                if (options === "destroy") {
	                    $.data(this, "plugin_" + pluginName, null);
	                }
	            });
	            // If the earlier cached method gives a value back return the value,
	            // otherwise return this to preserve chainability.
	            return returns !== undefined ? returns : this;
	        }
	    };
	    /********************
	    *  STATIC METHODS
	    ********************/
	    // get the country data object
	    $.fn[pluginName].getCountryData = function () {
	        return allCountries;
	    };
	    // set the country data object
	    $.fn[pluginName].setCountryData = function (obj) {
	        allCountries = obj;
	    };
	    // Tell JSHint to ignore this warning: "character may get silently deleted by one or more browsers"
	    // jshint -W100
	    // Array of country objects for the flag dropdown.
	    // Each contains a name, country code (ISO 3166-1 alpha-2) and dial code.
	    // Originally from https://github.com/mledoze/countries
	    // then modified using the following JavaScript (NOW OUT OF DATE):
	    /*
	    var result = [];
	    _.each(countries, function(c) {
	    // ignore countries without a dial code
	    if (c.callingCode[0].length) {
	    result.push({
	      // var locals contains country names with localised versions in brackets
	      n: _.findWhere(locals, {
	        countryCode: c.cca2
	      }).name,
	      i: c.cca2.toLowerCase(),
	      d: c.callingCode[0]
	    });
	    }
	    });
	    JSON.stringify(result);
	    */
	    // then with a couple of manual re-arrangements to be alphabetical
	    // then changed Kazakhstan from +76 to +7
	    // and Vatican City from +379 to +39 (see issue 50)
	    // and Caribean Netherlands from +5997 to +599
	    // and Curacao from +5999 to +599
	    // Removed: Åland Islands, Christmas Island, Cocos Islands, Guernsey, Isle of Man, Jersey, Kosovo, Mayotte, Pitcairn Islands, South Georgia, Svalbard, Western Sahara
	    // Update: converted objects to arrays to save bytes!
	    // Update: added "priority" for countries with the same dialCode as others
	    // Update: added array of area codes for countries with the same dialCode as others
	    // So each country array has the following information:
	    // [
	    //    Country name,
	    //    iso2 code,
	    //    International dial code,
	    //    Order (if >1 country with same dial code),
	    //    Area codes (if >1 country with same dial code)
	    // ]
	    var allCountries = [["Afghanistan (‫افغانستان‬‎)", "af", "93"], ["Albania (Shqipëri)", "al", "355"], ["Algeria (‫الجزائر‬‎)", "dz", "213"], ["American Samoa", "as", "1684"], ["Andorra", "ad", "376"], ["Angola", "ao", "244"], ["Anguilla", "ai", "1264"], ["Antigua and Barbuda", "ag", "1268"], ["Argentina", "ar", "54"], ["Armenia (Հայաստան)", "am", "374"], ["Aruba", "aw", "297"], ["Australia", "au", "61"], ["Austria (Österreich)", "at", "43"], ["Azerbaijan (Azərbaycan)", "az", "994"], ["Bahamas", "bs", "1242"], ["Bahrain (‫البحرين‬‎)", "bh", "973"], ["Bangladesh (বাংলাদেশ)", "bd", "880"], ["Barbados", "bb", "1246"], ["Belarus (Беларусь)", "by", "375"], ["Belgium (België)", "be", "32"], ["Belize", "bz", "501"], ["Benin (Bénin)", "bj", "229"], ["Bermuda", "bm", "1441"], ["Bhutan (འབྲུག)", "bt", "975"], ["Bolivia", "bo", "591"], ["Bosnia and Herzegovina (Босна и Херцеговина)", "ba", "387"], ["Botswana", "bw", "267"], ["Brazil (Brasil)", "br", "55"], ["British Indian Ocean Territory", "io", "246"], ["British Virgin Islands", "vg", "1284"], ["Brunei", "bn", "673"], ["Bulgaria (България)", "bg", "359"], ["Burkina Faso", "bf", "226"], ["Burundi (Uburundi)", "bi", "257"], ["Cambodia (កម្ពុជា)", "kh", "855"], ["Cameroon (Cameroun)", "cm", "237"], ["Canada", "ca", "1", 1, ["204", "236", "249", "250", "289", "306", "343", "365", "387", "403", "416", "418", "431", "437", "438", "450", "506", "514", "519", "548", "579", "581", "587", "604", "613", "639", "647", "672", "705", "709", "742", "778", "780", "782", "807", "819", "825", "867", "873", "902", "905"]], ["Cape Verde (Kabu Verdi)", "cv", "238"], ["Caribbean Netherlands", "bq", "599", 1], ["Cayman Islands", "ky", "1345"], ["Central African Republic (République centrafricaine)", "cf", "236"], ["Chad (Tchad)", "td", "235"], ["Chile", "cl", "56"], ["China (中国)", "cn", "86"], ["Colombia", "co", "57"], ["Comoros (‫جزر القمر‬‎)", "km", "269"], ["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)", "cd", "243"], ["Congo (Republic) (Congo-Brazzaville)", "cg", "242"], ["Cook Islands", "ck", "682"], ["Costa Rica", "cr", "506"], ["Côte d’Ivoire", "ci", "225"], ["Croatia (Hrvatska)", "hr", "385"], ["Cuba", "cu", "53"], ["Curaçao", "cw", "599", 0], ["Cyprus (Κύπρος)", "cy", "357"], ["Czech Republic (Česká republika)", "cz", "420"], ["Denmark (Danmark)", "dk", "45"], ["Djibouti", "dj", "253"], ["Dominica", "dm", "1767"], ["Dominican Republic (República Dominicana)", "do", "1", 2, ["809", "829", "849"]], ["Ecuador", "ec", "593"], ["Egypt (‫مصر‬‎)", "eg", "20"], ["El Salvador", "sv", "503"], ["Equatorial Guinea (Guinea Ecuatorial)", "gq", "240"], ["Eritrea", "er", "291"], ["Estonia (Eesti)", "ee", "372"], ["Ethiopia", "et", "251"], ["Falkland Islands (Islas Malvinas)", "fk", "500"], ["Faroe Islands (Føroyar)", "fo", "298"], ["Fiji", "fj", "679"], ["Finland (Suomi)", "fi", "358"], ["France", "fr", "33"], ["French Guiana (Guyane française)", "gf", "594"], ["French Polynesia (Polynésie française)", "pf", "689"], ["Gabon", "ga", "241"], ["Gambia", "gm", "220"], ["Georgia (საქართველო)", "ge", "995"], ["Germany (Deutschland)", "de", "49"], ["Ghana (Gaana)", "gh", "233"], ["Gibraltar", "gi", "350"], ["Greece (Ελλάδα)", "gr", "30"], ["Greenland (Kalaallit Nunaat)", "gl", "299"], ["Grenada", "gd", "1473"], ["Guadeloupe", "gp", "590", 0], ["Guam", "gu", "1671"], ["Guatemala", "gt", "502"], ["Guinea (Guinée)", "gn", "224"], ["Guinea-Bissau (Guiné Bissau)", "gw", "245"], ["Guyana", "gy", "592"], ["Haiti", "ht", "509"], ["Honduras", "hn", "504"], ["Hong Kong (香港)", "hk", "852"], ["Hungary (Magyarország)", "hu", "36"], ["Iceland (Ísland)", "is", "354"], ["India (भारत)", "in", "91"], ["Indonesia", "id", "62"], ["Iran (‫ایران‬‎)", "ir", "98"], ["Iraq (‫العراق‬‎)", "iq", "964"], ["Ireland", "ie", "353"], ["Israel (‫ישראל‬‎)", "il", "972"], ["Italy (Italia)", "it", "39", 0], ["Jamaica", "jm", "1876"], ["Japan (日本)", "jp", "81"], ["Jordan (‫الأردن‬‎)", "jo", "962"], ["Kazakhstan (Казахстан)", "kz", "7", 1], ["Kenya", "ke", "254"], ["Kiribati", "ki", "686"], ["Kuwait (‫الكويت‬‎)", "kw", "965"], ["Kyrgyzstan (Кыргызстан)", "kg", "996"], ["Laos (ລາວ)", "la", "856"], ["Latvia (Latvija)", "lv", "371"], ["Lebanon (‫لبنان‬‎)", "lb", "961"], ["Lesotho", "ls", "266"], ["Liberia", "lr", "231"], ["Libya (‫ليبيا‬‎)", "ly", "218"], ["Liechtenstein", "li", "423"], ["Lithuania (Lietuva)", "lt", "370"], ["Luxembourg", "lu", "352"], ["Macau (澳門)", "mo", "853"], ["Macedonia (FYROM) (Македонија)", "mk", "389"], ["Madagascar (Madagasikara)", "mg", "261"], ["Malawi", "mw", "265"], ["Malaysia", "my", "60"], ["Maldives", "mv", "960"], ["Mali", "ml", "223"], ["Malta", "mt", "356"], ["Marshall Islands", "mh", "692"], ["Martinique", "mq", "596"], ["Mauritania (‫موريتانيا‬‎)", "mr", "222"], ["Mauritius (Moris)", "mu", "230"], ["Mexico (México)", "mx", "52"], ["Micronesia", "fm", "691"], ["Moldova (Republica Moldova)", "md", "373"], ["Monaco", "mc", "377"], ["Mongolia (Монгол)", "mn", "976"], ["Montenegro (Crna Gora)", "me", "382"], ["Montserrat", "ms", "1664"], ["Morocco (‫المغرب‬‎)", "ma", "212"], ["Mozambique (Moçambique)", "mz", "258"], ["Myanmar (Burma) (မြန်မာ)", "mm", "95"], ["Namibia (Namibië)", "na", "264"], ["Nauru", "nr", "674"], ["Nepal (नेपाल)", "np", "977"], ["Netherlands (Nederland)", "nl", "31"], ["New Caledonia (Nouvelle-Calédonie)", "nc", "687"], ["New Zealand", "nz", "64"], ["Nicaragua", "ni", "505"], ["Niger (Nijar)", "ne", "227"], ["Nigeria", "ng", "234"], ["Niue", "nu", "683"], ["Norfolk Island", "nf", "672"], ["North Korea (조선 민주주의 인민 공화국)", "kp", "850"], ["Northern Mariana Islands", "mp", "1670"], ["Norway (Norge)", "no", "47"], ["Oman (‫عُمان‬‎)", "om", "968"], ["Pakistan (‫پاکستان‬‎)", "pk", "92"], ["Palau", "pw", "680"], ["Palestine (‫فلسطين‬‎)", "ps", "970"], ["Panama (Panamá)", "pa", "507"], ["Papua New Guinea", "pg", "675"], ["Paraguay", "py", "595"], ["Peru (Perú)", "pe", "51"], ["Philippines", "ph", "63"], ["Poland (Polska)", "pl", "48"], ["Portugal", "pt", "351"], ["Puerto Rico", "pr", "1", 3, ["787", "939"]], ["Qatar (‫قطر‬‎)", "qa", "974"], ["Réunion (La Réunion)", "re", "262"], ["Romania (România)", "ro", "40"], ["Russia (Россия)", "ru", "7", 0], ["Rwanda", "rw", "250"], ["Saint Barthélemy (Saint-Barthélemy)", "bl", "590", 1], ["Saint Helena", "sh", "290"], ["Saint Kitts and Nevis", "kn", "1869"], ["Saint Lucia", "lc", "1758"], ["Saint Martin (Saint-Martin (partie française))", "mf", "590", 2], ["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)", "pm", "508"], ["Saint Vincent and the Grenadines", "vc", "1784"], ["Samoa", "ws", "685"], ["San Marino", "sm", "378"], ["São Tomé and Príncipe (São Tomé e Príncipe)", "st", "239"], ["Saudi Arabia (‫المملكة العربية السعودية‬‎)", "sa", "966"], ["Senegal (Sénégal)", "sn", "221"], ["Serbia (Србија)", "rs", "381"], ["Seychelles", "sc", "248"], ["Sierra Leone", "sl", "232"], ["Singapore", "sg", "65"], ["Sint Maarten", "sx", "1721"], ["Slovakia (Slovensko)", "sk", "421"], ["Slovenia (Slovenija)", "si", "386"], ["Solomon Islands", "sb", "677"], ["Somalia (Soomaaliya)", "so", "252"], ["South Africa", "za", "27"], ["South Korea (대한민국)", "kr", "82"], ["South Sudan (‫جنوب السودان‬‎)", "ss", "211"], ["Spain (España)", "es", "34"], ["Sri Lanka (ශ්‍රී ලංකාව)", "lk", "94"], ["Sudan (‫السودان‬‎)", "sd", "249"], ["Suriname", "sr", "597"], ["Swaziland", "sz", "268"], ["Sweden (Sverige)", "se", "46"], ["Switzerland (Schweiz)", "ch", "41"], ["Syria (‫سوريا‬‎)", "sy", "963"], ["Taiwan (台灣)", "tw", "886"], ["Tajikistan", "tj", "992"], ["Tanzania", "tz", "255"], ["Thailand (ไทย)", "th", "66"], ["Timor-Leste", "tl", "670"], ["Togo", "tg", "228"], ["Tokelau", "tk", "690"], ["Tonga", "to", "676"], ["Trinidad and Tobago", "tt", "1868"], ["Tunisia (‫تونس‬‎)", "tn", "216"], ["Turkey (Türkiye)", "tr", "90"], ["Turkmenistan", "tm", "993"], ["Turks and Caicos Islands", "tc", "1649"], ["Tuvalu", "tv", "688"], ["U.S. Virgin Islands", "vi", "1340"], ["Uganda", "ug", "256"], ["Ukraine (Україна)", "ua", "380"], ["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)", "ae", "971"], ["United Kingdom", "gb", "44"], ["United States", "us", "1", 0], ["Uruguay", "uy", "598"], ["Uzbekistan (Oʻzbekiston)", "uz", "998"], ["Vanuatu", "vu", "678"], ["Vatican City (Città del Vaticano)", "va", "39", 1], ["Venezuela", "ve", "58"], ["Vietnam (Việt Nam)", "vn", "84"], ["Wallis and Futuna", "wf", "681"], ["Yemen (‫اليمن‬‎)", "ye", "967"], ["Zambia", "zm", "260"], ["Zimbabwe", "zw", "263"]];
	    // loop over all of the countries above
	    for (var i = 0; i < allCountries.length; i++) {
	        var c = allCountries[i];
	        allCountries[i] = {
	            name: c[0],
	            iso2: c[1],
	            dialCode: c[2],
	            priority: c[3] || 0,
	            areaCodes: c[4] || null
	        };
	    }
	});

/***/ },

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	'use strict';
	
	__webpack_require__(121);
	var Utils = __webpack_require__(5);
	var Auth = __webpack_require__(2);
	__webpack_require__(299);
	__webpack_require__(120);
	
	window.initializeCallback = function GCallback() {
		function responseCallback(autocomplete) {
			var place = autocomplete.getPlace();
			console.log(place.geometry.location);
			$('#id_location').val(place.name + ', ' + place.vicinity);
			$('#id_latitude').val(place.geometry.location.k);
			$('#id_longitude').val(place.geometry.location.D);
		}
	
		Utils.GoogleAutoComplete($('#id_location'), responseCallback);
		Utils.GenericSkillSearchAutocomplete($('#mobile_search_form'), $('#mobile_search_form').closest('form'));
	};
	window.openUrl = function (val) {
		window.location.href = val;
	};
	
	$(function () {
		Auth.Authenticate($('#id_phone_number'), function (data) {
			console.debug(data);
			window.location.href = data.location;
		});
	
		$('[data-toggle=popover]').popover({
			trigger: 'hover' });
		var a_tags = $('.pagination li a');
		$.each(a_tags, function (key, value) {
			var node = $(value);
			var attr = node.attr('href');
			node.attr('href', attr + '#result-display');
		});
	
		Number.prototype.formatMoney = function (c, d, t) {
			var n = this,
			    c = isNaN(c = Math.abs(c)) ? 2 : c,
			    d = d == undefined ? '.' : d,
			    t = t == undefined ? ',' : t,
			    s = n < 0 ? '-' : '',
			    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
			    j = (j = i.length) > 3 ? j % 3 : 0;
			return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
		};
	
		$('#toggle-price-type').on('click', function () {
			var input_text = $(this).text().trim();
			var state = true,
			    monthly = $('.monthly_price.price'),
			    hourly = $('.hourly_price.price');
			if (input_text === 'Monthly') {
				$(this).text('Hourly');
				monthly.removeClass('hide');
				hourly.addClass('hide');
			} else {
				$(this).text('Monthly');
				state = false;
				hourly.removeClass('hide');
				monthly.addClass('hide');
			}
		});
	
		var slider = $('#slider2');
		var min_input = $('#id_start_rate').val();
		var max_output = $('#id_end_rate').val();
		console.log(min_input);
		console.log(max_output);
		var price_range = {
			min: parseInt(min_input),
			max: max_output
		};
		slider.slider({
			range: true,
			values: [price_range.min, price_range.max],
			min: price_range.min,
			max: 20000,
			step: 50,
			slide: function slide(event, ui) {
				console.log(ui);
				var changing_text = '₦' + ui.values[0] + ' - ₦' + ui.values[1];
				if (ui.values[1] >= 20000) {
					changing_text += '+';
				}
				$('#amount').val(changing_text);
				$('#id_start_rate').val(ui.values[0]);
				$('#id_end_rate').val(ui.values[1]);
			}
		});
	
		$('#displayFilterBtn').on('click', function () {
			$('.filter-form-container').fadeIn(1000);
			$(this).fadeOut(1000);
		});
	
		function FireSpinner() {
			var opts = {
				lines: 30, // The number of lines to draw
				length: 20, // The length of each line
				width: 2, // The line thickness
				radius: 26, // The radius of the inner circle
				corners: 1, // Corner roundness (0..1)
				rotate: 90, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color: '#000', // #rgb or #rrggbb or array of colors
				speed: 1.8, // Rounds per second
				trail: 90, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex: 2000000000, // The z-index (defaults to 2000000000)
				top: '40%', // Top position relative to parent
				left: '50%' // Left position relative to parent
			};
			target = document.getElementById('result-display');
			$(target).fadeTo('slow', 0.3);
			spinner = new Spinner(opts).spin(target);
		}
	
		// Ajax loader calls spinner
		//         $('body').ajaxStop(function () {
		//             $('#result-display').fadeOut();
		//             spinner.stop();
		//         }).ajaxError(function (e, jqxhr, settings, exception) {
		//             console.log('An error occurer with the last ajax request. Exception:' + exception);
		//             $('#result-display').fadeOut();
		//             spinner.stop();
		//         });
	
		// spinner.stop();
		//         $('#filter-result').on('click', function () {
		//             FireSpinner();
		//         });
	
		var amount_text = '₦' + $('#slider2').slider('values', 0) + ' -  ₦' + $('#slider2').slider('values', 1);
		if ($('#slider2').slider('values', 1) >= 20000) {
			amount_text += '+';
		}
		$('#amount').val(amount_text);
		var count_nav = 0;
		$(document).on('scroll', function () {
			var hei = $(document).scrollTop();
			if (hei >= 80) {
				if (count_nav == 0) {
					$('.navigation ').fadeOut('fast');
	
					count_nav++;
				}
			} else {
				count_nav = 0;
				$('.navigation ').fadeIn('fast');
			}
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 11:
/***/ function(module, exports, __webpack_require__) {

	/* *******************************************
	// Copyright 2010-2015, Anthony Hand
	//
	// BETA NOTICE
	// Previous versions of the JavaScript code for MobileESP were 'regular' 
	// JavaScript. The strength of it was that it was really easy to code and use.
	// Unfortunately, regular JavaScript means that all variables and functions
	// are in the global namespace. There can be collisions with other code libraries
	// which may have similar variable or function names. Collisions cause bugs as each
	// library changes a variable's definition or functionality unexpectedly.
	// As a result, we thought it wise to switch to an "object oriented" style of code.
	// This 'literal notation' technique keeps all MobileESP variables and functions fully self-contained.
	// It avoids potential for collisions with other JavaScript libraries.
	// This technique allows the developer continued access to any desired function or property.
	//
	// Please send feedback to project founder Anthony Hand: anthony.hand@gmail.com
	//
	//
	// File version 2015.05.13 (May 13, 2015)
	// Updates:
	//	- Moved MobileESP to GitHub. https://github.com/ahand/mobileesp
	//	- Opera Mobile/Mini browser has the same UA string on multiple platforms and doesn't differentiate phone vs. tablet. 
	//		- Removed DetectOperaAndroidPhone(). This method is no longer reliable. 
	//		- Removed DetectOperaAndroidTablet(). This method is no longer reliable. 
	//	- Added support for Windows Phone 10: variable and DetectWindowsPhone10()
	//	- Updated DetectWindowsPhone() to include WP10. 
	//	- Added support for Firefox OS.  
	//		- A variable plus DetectFirefoxOS(), DetectFirefoxOSPhone(), DetectFirefoxOSTablet()
	//		- NOTE: Firefox doesn't add UA tokens to definitively identify Firefox OS vs. their browsers on other mobile platforms.
	//	- Added support for Sailfish OS. Not enough info to add a tablet detection method at this time. 
	//		- A variable plus DetectSailfish(), DetectSailfishPhone()
	//	- Added support for Ubuntu Mobile OS. 
	//		- DetectUbuntu(), DetectUbuntuPhone(), DetectUbuntuTablet()
	//	- Added support for 2 smart TV OSes. They lack browsers but do have WebViews for use by HTML apps. 
	//		- One variable for Samsung Tizen TVs, plus DetectTizenTV()
	//		- One variable for LG WebOS TVs, plus DetectWebOSTV()
	//	- Updated DetectTizen(). Now tests for “mobile” to disambiguate from Samsung Smart TVs
	//	- Removed variables for obsolete devices: deviceHtcFlyer, deviceXoom.
	//	- Updated DetectAndroid(). No longer has a special test case for the HTC Flyer tablet. 
	//	- Updated DetectAndroidPhone(). 
	//		- Updated internal detection code for Android. 
	//		- No longer has a special test case for the HTC Flyer tablet. 
	//		- Checks against DetectOperaMobile() on Android and reports here if relevant. 
	//	- Updated DetectAndroidTablet(). 
	//		- No longer has a special test case for the HTC Flyer tablet. 
	//		- Checks against DetectOperaMobile() on Android to exclude it from here.
	//	- DetectMeego(): Changed definition for this method. Now detects any Meego OS device, not just phones. 
	//	- DetectMeegoPhone(): NEW. For Meego phones. Ought to detect Opera browsers on Meego, as well.  
	//	- DetectTierIphone(): Added support for phones running Sailfish, Ubuntu and Firefox Mobile. 
	//	- DetectTierTablet(): Added support for tablets running Ubuntu and Firefox Mobile. 
	//	- DetectSmartphone(): Added support for Meego phones. 
	//	- Reorganized DetectMobileQuick(). Moved the following to DetectMobileLong():
	//		- DetectDangerHiptop(), DetectMaemoTablet(), DetectSonyMylo(), DetectArchos()
	//       
	//
	//
	// LICENSE INFORMATION
	// Licensed under the Apache License, Version 2.0 (the "License"); 
	// you may not use this file except in compliance with the License. 
	// You may obtain a copy of the License at 
	//        http://www.apache.org/licenses/LICENSE-2.0 
	// Unless required by applicable law or agreed to in writing, 
	// software distributed under the License is distributed on an 
	// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, 
	// either express or implied. See the License for the specific 
	// language governing permissions and limitations under the License. 
	//
	//
	// ABOUT THIS PROJECT
	//   Project Owner: Anthony Hand
	//   Email: anthony.hand@gmail.com
	//   Web Site: http://www.mobileesp.com
	//   Source Files: https://github.com/ahand/mobileesp
	//   
	//   Versions of this code are available for:
	//      PHP, JavaScript, Java, ASP.NET (C#), Ruby and others
	//
	//
	// WARNING: 
	//   These JavaScript-based device detection features may ONLY work 
	//   for the newest generation of smartphones, such as the iPhone, 
	//   Android and Palm WebOS devices.
	//   These device detection features may NOT work for older smartphones 
	//   which had poor support for JavaScript, including 
	//   older BlackBerry, PalmOS, and Windows Mobile devices. 
	//   Additionally, because JavaScript support is extremely poor among 
	//   'feature phones', these features may not work at all on such devices.
	//   For better results, consider using a server-based version of this code, 
	//   such as Java, APS.NET, PHP, or Ruby.
	//
	// *******************************************
	*/
	
	'use strict';
	
	var MobileEsp = {
	
		//GLOBALLY USEFUL VARIABLES
		//Note: These values are set automatically during the Init function.
		//Stores whether we're currently initializing the most popular functions.
		initCompleted: false,
		isWebkit: false, //Stores the result of DetectWebkit()
		isMobilePhone: false, //Stores the result of DetectMobileQuick()
		isIphone: false, //Stores the result of DetectIphone()
		isAndroid: false, //Stores the result of DetectAndroid()
		isAndroidPhone: false, //Stores the result of DetectAndroidPhone()
		isTierTablet: false, //Stores the result of DetectTierTablet()
		isTierIphone: false, //Stores the result of DetectTierIphone()
		isTierRichCss: false, //Stores the result of DetectTierRichCss()
		isTierGenericMobile: false, //Stores the result of DetectTierOtherPhones()
	
		//INTERNALLY USED DETECTION STRING VARIABLES
		engineWebKit: 'webkit',
		deviceIphone: 'iphone',
		deviceIpod: 'ipod',
		deviceIpad: 'ipad',
		deviceMacPpc: 'macintosh', //Used for disambiguation
	
		deviceAndroid: 'android',
		deviceGoogleTV: 'googletv',
	
		deviceWinPhone7: 'windows phone os 7',
		deviceWinPhone8: 'windows phone 8',
		deviceWinPhone10: 'windows phone 10',
		deviceWinMob: 'windows ce',
		deviceWindows: 'windows',
		deviceIeMob: 'iemobile',
		devicePpc: 'ppc', //Stands for PocketPC
		enginePie: 'wm5 pie', //An old Windows Mobile
	
		deviceBB: 'blackberry',
		deviceBB10: 'bb10', //For the new BB 10 OS
		vndRIM: 'vnd.rim', //Detectable when BB devices emulate IE or Firefox
		deviceBBStorm: 'blackberry95', //Storm 1 and 2
		deviceBBBold: 'blackberry97', //Bold 97x0 (non-touch)
		deviceBBBoldTouch: 'blackberry 99', //Bold 99x0 (touchscreen)
		deviceBBTour: 'blackberry96', //Tour
		deviceBBCurve: 'blackberry89', //Curve 2
		deviceBBCurveTouch: 'blackberry 938', //Curve Touch 9380
		deviceBBTorch: 'blackberry 98', //Torch
		deviceBBPlaybook: 'playbook', //PlayBook tablet
	
		deviceSymbian: 'symbian',
		deviceSymbos: 'symbos', //Opera 10 on Symbian
		deviceS60: 'series60',
		deviceS70: 'series70',
		deviceS80: 'series80',
		deviceS90: 'series90',
	
		devicePalm: 'palm',
		deviceWebOS: 'webos', //For Palm devices
		deviceWebOStv: 'web0s', //For LG TVs
		deviceWebOShp: 'hpwos', //For HP's line of WebOS devices
	
		deviceNuvifone: 'nuvifone', //Garmin Nuvifone
		deviceBada: 'bada', //Samsung's Bada OS
		deviceTizen: 'tizen', //Tizen OS
		deviceMeego: 'meego', //Meego OS
		deviceSailfish: 'sailfish', //Sailfish OS
		deviceUbuntu: 'ubuntu', //Ubuntu Mobile OS
	
		deviceKindle: 'kindle', //Amazon eInk Kindle
		engineSilk: 'silk-accelerated', //Amazon's accelerated Silk browser for Kindle Fire
	
		engineBlazer: 'blazer', //Old Palm browser
		engineXiino: 'xiino',
	
		//Initialize variables for mobile-specific content.
		vndwap: 'vnd.wap',
		wml: 'wml',
	
		//Initialize variables for random devices and mobile browsers.
		//Some of these may not support JavaScript
		deviceTablet: 'tablet',
		deviceBrew: 'brew',
		deviceDanger: 'danger',
		deviceHiptop: 'hiptop',
		devicePlaystation: 'playstation',
		devicePlaystationVita: 'vita',
		deviceNintendoDs: 'nitro',
		deviceNintendo: 'nintendo',
		deviceWii: 'wii',
		deviceXbox: 'xbox',
		deviceArchos: 'archos',
	
		engineFirefox: 'firefox', //For Firefox OS
		engineOpera: 'opera', //Popular browser
		engineNetfront: 'netfront', //Common embedded OS browser
		engineUpBrowser: 'up.browser', //common on some phones
		deviceMidp: 'midp', //a mobile Java technology
		uplink: 'up.link',
		engineTelecaQ: 'teleca q', //a modern feature phone browser
		engineObigo: 'obigo', //W 10 is a modern feature phone browser
	
		devicePda: 'pda',
		mini: 'mini', //Some mobile browsers put 'mini' in their names
		mobile: 'mobile', //Some mobile browsers put 'mobile' in their user agent strings
		mobi: 'mobi', //Some mobile browsers put 'mobi' in their user agent strings
	
		//Smart TV strings
		smartTV1: 'smart-tv', //Samsung Tizen smart TVs
		smartTV2: 'smarttv', //LG WebOS smart TVs
	
		//Use Maemo, Tablet, and Linux to test for Nokia's Internet Tablets.
		maemo: 'maemo',
		linux: 'linux',
		mylocom2: 'sony/com', // for Sony Mylo 1 and 2
	
		//In some UserAgents, the only clue is the manufacturer
		manuSonyEricsson: 'sonyericsson',
		manuericsson: 'ericsson',
		manuSamsung1: 'sec-sgh',
		manuSony: 'sony',
		manuHtc: 'htc', //Popular Android and WinMo manufacturer
	
		//In some UserAgents, the only clue is the operator
		svcDocomo: 'docomo',
		svcKddi: 'kddi',
		svcVodafone: 'vodafone',
	
		//Disambiguation strings.
		disUpdate: 'update', //pda vs. update
	
		//Holds the User Agent string value.
		uagent: '',
	
		//Initializes key MobileEsp variables
		InitDeviceScan: function InitDeviceScan() {
			this.initCompleted = false;
	
			if (navigator && navigator.userAgent) this.uagent = navigator.userAgent.toLowerCase();
	
			//Save these properties to speed processing
			this.isWebkit = this.DetectWebkit();
			this.isIphone = this.DetectIphone();
			this.isAndroid = this.DetectAndroid();
			this.isAndroidPhone = this.DetectAndroidPhone();
	
			//Generally, these tiers are the most useful for web development
			this.isMobilePhone = this.DetectMobileQuick();
			this.isTierIphone = this.DetectTierIphone();
			this.isTierTablet = this.DetectTierTablet();
	
			//Optional: Comment these out if you NEVER use them
			this.isTierRichCss = this.DetectTierRichCss();
			this.isTierGenericMobile = this.DetectTierOtherPhones();
	
			this.initCompleted = true;
		},
	
		//APPLE IOS
	
		//**************************
		// Detects if the current device is an iPhone.
		DetectIphone: function DetectIphone() {
			if (this.initCompleted || this.isIphone) return this.isIphone;
	
			if (this.uagent.search(this.deviceIphone) > -1) {
				//The iPad and iPod Touch say they're an iPhone! So let's disambiguate.
				if (this.DetectIpad() || this.DetectIpod()) return false;
				//Yay! It's an iPhone!
				else return true;
			} else return false;
		},
	
		//**************************
		// Detects if the current device is an iPod Touch.
		DetectIpod: function DetectIpod() {
			if (this.uagent.search(this.deviceIpod) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an iPhone or iPod Touch.
		DetectIphoneOrIpod: function DetectIphoneOrIpod() {
			//We repeat the searches here because some iPods
			//  may report themselves as an iPhone, which is ok.
			if (this.DetectIphone() || this.DetectIpod()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an iPad tablet.
		DetectIpad: function DetectIpad() {
			if (this.uagent.search(this.deviceIpad) > -1 && this.DetectWebkit()) return true;else return false;
		},
	
		//**************************
		// Detects *any* iOS device: iPhone, iPod Touch, iPad.
		DetectIos: function DetectIos() {
			if (this.DetectIphoneOrIpod() || this.DetectIpad()) return true;else return false;
		},
	
		//ANDROID
	
		//**************************
		// Detects *any* Android OS-based device: phone, tablet, and multi-media player.
		// Also detects Google TV.
		DetectAndroid: function DetectAndroid() {
			if (this.initCompleted || this.isAndroid) return this.isAndroid;
	
			if (this.uagent.search(this.deviceAndroid) > -1 || this.DetectGoogleTV()) return true;
	
			return false;
		},
	
		//**************************
		// Detects if the current device is a (small-ish) Android OS-based device
		// used for calling and/or multi-media (like a Samsung Galaxy Player).
		// Google says these devices will have 'Android' AND 'mobile' in user agent.
		// Ignores tablets (Honeycomb and later).
		DetectAndroidPhone: function DetectAndroidPhone() {
			if (this.initCompleted || this.isAndroidPhone) return this.isAndroidPhone;
	
			//First, let's make sure we're on an Android device.
			if (!this.DetectAndroid()) return false;
	
			//If it's Android and has 'mobile' in it, Google says it's a phone.
			if (this.uagent.search(this.mobile) > -1) return true;
	
			//Special check for Android phones with Opera Mobile. They should report here.
			if (this.DetectOperaMobile()) return true;
	
			return false;
		},
	
		//**************************
		// Detects if the current device is a (self-reported) Android tablet.
		// Google says these devices will have 'Android' and NOT 'mobile' in their user agent.
		DetectAndroidTablet: function DetectAndroidTablet() {
			//First, let's make sure we're on an Android device.
			if (!this.DetectAndroid()) return false;
	
			//Special check for Opera Android Phones. They should NOT report here.
			if (this.DetectOperaMobile()) return false;
	
			//Otherwise, if it's Android and does NOT have 'mobile' in it, Google says it's a tablet.
			if (this.uagent.search(this.mobile) > -1) return false;else return true;
		},
	
		//**************************
		// Detects if the current device is an Android OS-based device and
		//   the browser is based on WebKit.
		DetectAndroidWebKit: function DetectAndroidWebKit() {
			if (this.DetectAndroid() && this.DetectWebkit()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a GoogleTV.
		DetectGoogleTV: function DetectGoogleTV() {
			if (this.uagent.search(this.deviceGoogleTV) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is based on WebKit.
		DetectWebkit: function DetectWebkit() {
			if (this.initCompleted || this.isWebkit) return this.isWebkit;
	
			if (this.uagent.search(this.engineWebKit) > -1) return true;else return false;
		},
	
		//WINDOWS MOBILE AND PHONE
	
		// Detects if the current browser is a
		// Windows Phone 7, 8, or 10 device.
		DetectWindowsPhone: function DetectWindowsPhone() {
			if (this.DetectWindowsPhone7() || this.DetectWindowsPhone8() || this.DetectWindowsPhone10()) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 7 device (in mobile browsing mode).
		DetectWindowsPhone7: function DetectWindowsPhone7() {
			if (this.uagent.search(this.deviceWinPhone7) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 8 device (in mobile browsing mode).
		DetectWindowsPhone8: function DetectWindowsPhone8() {
			if (this.uagent.search(this.deviceWinPhone8) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a Windows Phone 10 device (in mobile browsing mode).
		DetectWindowsPhone10: function DetectWindowsPhone10() {
			if (this.uagent.search(this.deviceWinPhone10) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a Windows Mobile device.
		// Excludes Windows Phone 7 and later devices.
		// Focuses on Windows Mobile 6.xx and earlier.
		DetectWindowsMobile: function DetectWindowsMobile() {
			if (this.DetectWindowsPhone()) return false;
	
			//Most devices use 'Windows CE', but some report 'iemobile'
			//  and some older ones report as 'PIE' for Pocket IE.
			if (this.uagent.search(this.deviceWinMob) > -1 || this.uagent.search(this.deviceIeMob) > -1 || this.uagent.search(this.enginePie) > -1) return true;
			//Test for Windows Mobile PPC but not old Macintosh PowerPC.
			if (this.uagent.search(this.devicePpc) > -1 && !(this.uagent.search(this.deviceMacPpc) > -1)) return true;
			//Test for Windwos Mobile-based HTC devices.
			if (this.uagent.search(this.manuHtc) > -1 && this.uagent.search(this.deviceWindows) > -1) return true;else return false;
		},
	
		//BLACKBERRY
	
		//**************************
		// Detects if the current browser is a BlackBerry of some sort.
		// Includes BB10 OS, but excludes the PlayBook.
		DetectBlackBerry: function DetectBlackBerry() {
			if (this.uagent.search(this.deviceBB) > -1 || this.uagent.search(this.vndRIM) > -1) return true;
			if (this.DetectBlackBerry10Phone()) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry 10 OS phone.
		// Excludes tablets.
		DetectBlackBerry10Phone: function DetectBlackBerry10Phone() {
			if (this.uagent.search(this.deviceBB10) > -1 && this.uagent.search(this.mobile) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a BlackBerry tablet device.
		//    Example: PlayBook
		DetectBlackBerryTablet: function DetectBlackBerryTablet() {
			if (this.uagent.search(this.deviceBBPlaybook) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry device AND uses a
		//    WebKit-based browser. These are signatures for the new BlackBerry OS 6.
		//    Examples: Torch. Includes the Playbook.
		DetectBlackBerryWebKit: function DetectBlackBerryWebKit() {
			if (this.DetectBlackBerry() && this.uagent.search(this.engineWebKit) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry Touch
		//    device, such as the Storm, Torch, and Bold Touch. Excludes the Playbook.
		DetectBlackBerryTouch: function DetectBlackBerryTouch() {
			if (this.DetectBlackBerry() && (this.uagent.search(this.deviceBBStorm) > -1 || this.uagent.search(this.deviceBBTorch) > -1 || this.uagent.search(this.deviceBBBoldTouch) > -1 || this.uagent.search(this.deviceBBCurveTouch) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry OS 5 device AND
		//    has a more capable recent browser. Excludes the Playbook.
		//    Examples, Storm, Bold, Tour, Curve2
		//    Excludes the new BlackBerry OS 6 and 7 browser!!
		DetectBlackBerryHigh: function DetectBlackBerryHigh() {
			//Disambiguate for BlackBerry OS 6 or 7 (WebKit) browser
			if (this.DetectBlackBerryWebKit()) return false;
			if (this.DetectBlackBerry() && (this.DetectBlackBerryTouch() || this.uagent.search(this.deviceBBBold) > -1 || this.uagent.search(this.deviceBBTour) > -1 || this.uagent.search(this.deviceBBCurve) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a BlackBerry device AND
		//    has an older, less capable browser.
		//    Examples: Pearl, 8800, Curve1.
		DetectBlackBerryLow: function DetectBlackBerryLow() {
			if (this.DetectBlackBerry()) {
				//Assume that if it's not in the High tier or has WebKit, then it's Low.
				if (this.DetectBlackBerryHigh() || this.DetectBlackBerryWebKit()) return false;else return true;
			} else return false;
		},
	
		//SYMBIAN
	
		//**************************
		// Detects if the current browser is the Nokia S60 Open Source Browser.
		DetectS60OssBrowser: function DetectS60OssBrowser() {
			if (this.DetectWebkit()) {
				if (this.uagent.search(this.deviceS60) > -1 || this.uagent.search(this.deviceSymbian) > -1) return true;else return false;
			} else return false;
		},
	
		//**************************
		// Detects if the current device is any Symbian OS-based device,
		//   including older S60, Series 70, Series 80, Series 90, and UIQ,
		//   or other browsers running on these devices.
		DetectSymbianOS: function DetectSymbianOS() {
			if (this.uagent.search(this.deviceSymbian) > -1 || this.uagent.search(this.deviceS60) > -1 || this.uagent.search(this.deviceSymbos) > -1 && this.DetectOperaMobile || //Opera 10
			this.uagent.search(this.deviceS70) > -1 || this.uagent.search(this.deviceS80) > -1 || this.uagent.search(this.deviceS90) > -1) return true;else return false;
		},
	
		//WEBOS AND PALM
	
		//**************************
		// Detects if the current browser is on a PalmOS device.
		DetectPalmOS: function DetectPalmOS() {
			//Make sure it's not WebOS first
			if (this.DetectPalmWebOS()) return false;
	
			//Most devices nowadays report as 'Palm',
			//  but some older ones reported as Blazer or Xiino.
			if (this.uagent.search(this.devicePalm) > -1 || this.uagent.search(this.engineBlazer) > -1 || this.uagent.search(this.engineXiino) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a Palm device
		//   running the new WebOS.
		DetectPalmWebOS: function DetectPalmWebOS() {
			if (this.uagent.search(this.deviceWebOS) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on an HP tablet running WebOS.
		DetectWebOSTablet: function DetectWebOSTablet() {
			if (this.uagent.search(this.deviceWebOShp) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a WebOS smart TV.
		DetectWebOSTV: function DetectWebOSTV() {
			if (this.uagent.search(this.deviceWebOStv) > -1 && this.uagent.search(this.smartTV2) > -1) return true;else return false;
		},
	
		//OPERA
	
		//**************************
		// Detects if the current browser is Opera Mobile or Mini.
		// Note: Older embedded Opera on mobile devices didn't follow these naming conventions.
		//   Like Archos media players, they will probably show up in DetectMobileQuick or -Long instead.
		DetectOperaMobile: function DetectOperaMobile() {
			if (this.uagent.search(this.engineOpera) > -1 && (this.uagent.search(this.mini) > -1 || this.uagent.search(this.mobi) > -1)) return true;else return false;
		},
	
		//MISCELLANEOUS DEVICES
	
		//**************************
		// Detects if the current device is an Amazon Kindle (eInk devices only).
		// Note: For the Kindle Fire, use the normal Android methods.
		DetectKindle: function DetectKindle() {
			if (this.uagent.search(this.deviceKindle) > -1 && !this.DetectAndroid()) return true;else return false;
		},
	
		//**************************
		// Detects if the current Amazon device has turned on the Silk accelerated browsing feature.
		// Note: Typically used by the the Kindle Fire.
		DetectAmazonSilk: function DetectAmazonSilk() {
			if (this.uagent.search(this.engineSilk) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a
		//   Garmin Nuvifone.
		DetectGarminNuvifone: function DetectGarminNuvifone() {
			if (this.uagent.search(this.deviceNuvifone) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Bada OS from Samsung.
		DetectBada: function DetectBada() {
			if (this.uagent.search(this.deviceBada) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Tizen smartphone OS.
		DetectTizen: function DetectTizen() {
			if (this.uagent.search(this.deviceTizen) > -1 && this.uagent.search(this.mobile) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is on a Tizen smart TV.
		DetectTizenTV: function DetectTizenTV() {
			if (this.uagent.search(this.deviceTizen) > -1 && this.uagent.search(this.smartTV1) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a device running the Meego OS.
		DetectMeego: function DetectMeego() {
			if (this.uagent.search(this.deviceMeego) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Meego OS.
		DetectMeegoPhone: function DetectMeegoPhone() {
			if (this.uagent.search(this.deviceMeego) > -1 && this.uagent.search(this.mobi) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a mobile device (probably) running the Firefox OS.
		DetectFirefoxOS: function DetectFirefoxOS() {
			if (this.DetectFirefoxOSPhone() || this.DetectFirefoxOSTablet()) return true;else return false;
		},
	
		//**************************
		// Detects a phone (probably) running the Firefox OS.
		DetectFirefoxOSPhone: function DetectFirefoxOSPhone() {
			//First, let's make sure we're NOT on another major mobile OS.
			if (this.DetectIos() || this.DetectAndroid() || this.DetectSailfish()) return false;
	
			if (this.uagent.search(this.engineFirefox) > -1 && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a tablet (probably) running the Firefox OS.
		DetectFirefoxOSTablet: function DetectFirefoxOSTablet() {
			//First, let's make sure we're NOT on another major mobile OS.
			if (this.DetectIos() || this.DetectAndroid() || this.DetectSailfish()) return false;
	
			if (this.uagent.search(this.engineFirefox) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a device running the Sailfish OS.
		DetectSailfish: function DetectSailfish() {
			if (this.uagent.search(this.deviceSailfish) > -1) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Sailfish OS.
		DetectSailfishPhone: function DetectSailfishPhone() {
			if (this.DetectSailfish() && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a mobile device running the Ubuntu Mobile OS.
		DetectUbuntu: function DetectUbuntu() {
			if (this.DetectUbuntuPhone() || this.DetectUbuntuTablet()) return true;else return false;
		},
	
		//**************************
		// Detects a phone running the Ubuntu Mobile OS.
		DetectUbuntuPhone: function DetectUbuntuPhone() {
			if (this.uagent.search(this.deviceUbuntu) > -1 && this.uagent.search(this.mobile) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects a tablet running the Ubuntu Mobile OS.
		DetectUbuntuTablet: function DetectUbuntuTablet() {
			if (this.uagent.search(this.deviceUbuntu) > -1 && this.uagent.search(this.deviceTablet) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects the Danger Hiptop device.
		DetectDangerHiptop: function DetectDangerHiptop() {
			if (this.uagent.search(this.deviceDanger) > -1 || this.uagent.search(this.deviceHiptop) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current browser is a Sony Mylo device.
		DetectSonyMylo: function DetectSonyMylo() {
			if (this.uagent.search(this.manuSony) > -1 && (this.uagent.search(this.qtembedded) > -1 || this.uagent.search(this.mylocom2) > -1)) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is on one of
		// the Maemo-based Nokia Internet Tablets.
		DetectMaemoTablet: function DetectMaemoTablet() {
			if (this.uagent.search(this.maemo) > -1) return true;
			//For Nokia N810, must be Linux + Tablet, or else it could be something else.
			if (this.uagent.search(this.linux) > -1 && this.uagent.search(this.deviceTablet) > -1 && this.DetectWebOSTablet() && !this.DetectAndroid()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an Archos media player/Internet tablet.
		DetectArchos: function DetectArchos() {
			if (this.uagent.search(this.deviceArchos) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is an Internet-capable game console.
		// Includes many handheld consoles.
		DetectGameConsole: function DetectGameConsole() {
			if (this.DetectSonyPlaystation() || this.DetectNintendo() || this.DetectXbox()) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Sony Playstation.
		DetectSonyPlaystation: function DetectSonyPlaystation() {
			if (this.uagent.search(this.devicePlaystation) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a handheld gaming device with
		// a touchscreen and modern iPhone-class browser. Includes the Playstation Vita.
		DetectGamingHandheld: function DetectGamingHandheld() {
			if (this.uagent.search(this.devicePlaystation) > -1 && this.uagent.search(this.devicePlaystationVita) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Nintendo game device.
		DetectNintendo: function DetectNintendo() {
			if (this.uagent.search(this.deviceNintendo) > -1 || this.uagent.search(this.deviceWii) > -1 || this.uagent.search(this.deviceNintendoDs) > -1) return true;else return false;
		},
	
		//**************************
		// Detects if the current device is a Microsoft Xbox.
		DetectXbox: function DetectXbox() {
			if (this.uagent.search(this.deviceXbox) > -1) return true;else return false;
		},
	
		//**************************
		// Detects whether the device is a Brew-powered device.
		//   Note: Limited to older Brew-powered feature phones.
		//   Ignores newer Brew versions like MP. Refer to DetectMobileQuick().
		DetectBrewDevice: function DetectBrewDevice() {
			if (this.uagent.search(this.deviceBrew) > -1) return true;else return false;
		},
	
		// DEVICE CLASSES
	
		//**************************
		// Check to see whether the device is *any* 'smartphone'.
		//   Note: It's better to use DetectTierIphone() for modern touchscreen devices.
		DetectSmartphone: function DetectSmartphone() {
			//Exclude duplicates from TierIphone
			if (this.DetectTierIphone() || this.DetectS60OssBrowser() || this.DetectSymbianOS() || this.DetectWindowsMobile() || this.DetectBlackBerry() || this.DetectMeegoPhone() || this.DetectPalmOS()) return true;
	
			//Otherwise, return false.
			return false;
		},
	
		//**************************
		// Detects if the current device is a mobile device.
		//  This method catches most of the popular modern devices.
		//  Excludes Apple iPads and other modern tablets.
		DetectMobileQuick: function DetectMobileQuick() {
			if (this.initCompleted || this.isMobilePhone) return this.isMobilePhone;
	
			//Let's exclude tablets.
			if (this.DetectTierTablet()) return false;
	
			//Most mobile browsing is done on smartphones
			if (this.DetectSmartphone()) return true;
	
			//Catch-all for many mobile devices
			if (this.uagent.search(this.mobile) > -1) return true;
	
			if (this.DetectOperaMobile()) return true;
	
			//We also look for Kindle devices
			if (this.DetectKindle() || this.DetectAmazonSilk()) return true;
	
			if (this.uagent.search(this.deviceMidp) > -1 || this.DetectBrewDevice()) return true;
	
			if (this.uagent.search(this.engineObigo) > -1 || this.uagent.search(this.engineNetfront) > -1 || this.uagent.search(this.engineUpBrowser) > -1) return true;
	
			return false;
		},
	
		//**************************
		// Detects in a more comprehensive way if the current device is a mobile device.
		DetectMobileLong: function DetectMobileLong() {
			if (this.DetectMobileQuick()) return true;
			if (this.DetectGameConsole()) return true;
	
			if (this.DetectDangerHiptop() || this.DetectMaemoTablet() || this.DetectSonyMylo() || this.DetectArchos()) return true;
	
			if (this.uagent.search(this.devicePda) > -1 && !(this.uagent.search(this.disUpdate) > -1)) return true;
	
			//Detect for certain very old devices with stupid useragent strings.
			if (this.uagent.search(this.manuSamsung1) > -1 || this.uagent.search(this.manuSonyEricsson) > -1 || this.uagent.search(this.manuericsson) > -1 || this.uagent.search(this.svcDocomo) > -1 || this.uagent.search(this.svcKddi) > -1 || this.uagent.search(this.svcVodafone) > -1) return true;
	
			return false;
		},
	
		//*****************************
		// For Mobile Web Site Design
		//*****************************
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for the new generation of
		//   HTML 5 capable, larger screen tablets.
		//   Includes iPad, Android (e.g., Xoom), BB Playbook, WebOS, etc.
		DetectTierTablet: function DetectTierTablet() {
			if (this.initCompleted || this.isTierTablet) return this.isTierTablet;
	
			if (this.DetectIpad() || this.DetectAndroidTablet() || this.DetectBlackBerryTablet() || this.DetectFirefoxOSTablet() || this.DetectUbuntuTablet() || this.DetectWebOSTablet()) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for devices which can
		//   display iPhone-optimized web content.
		//   Includes iPhone, iPod Touch, Android, Windows Phone 7 and 8, BB10, WebOS, Playstation Vita, etc.
		DetectTierIphone: function DetectTierIphone() {
			if (this.initCompleted || this.isTierIphone) return this.isTierIphone;
	
			if (this.DetectIphoneOrIpod() || this.DetectAndroidPhone() || this.DetectWindowsPhone() || this.DetectBlackBerry10Phone() || this.DetectPalmWebOS() || this.DetectBada() || this.DetectTizen() || this.DetectFirefoxOSPhone() || this.DetectSailfishPhone() || this.DetectUbuntuPhone() || this.DetectGamingHandheld()) return true;
	
			//Note: BB10 phone is in the previous paragraph
			if (this.DetectBlackBerryWebKit() && this.DetectBlackBerryTouch()) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for devices which are likely to be
		//   capable of viewing CSS content optimized for the iPhone,
		//   but may not necessarily support JavaScript.
		//   Excludes all iPhone Tier devices.
		DetectTierRichCss: function DetectTierRichCss() {
			if (this.initCompleted || this.isTierRichCss) return this.isTierRichCss;
	
			//Exclude iPhone and Tablet Tiers and e-Ink Kindle devices
			if (this.DetectTierIphone() || this.DetectKindle() || this.DetectTierTablet()) return false;
	
			//Exclude if not mobile
			if (!this.DetectMobileQuick()) return false;
	
			//If it's a mobile webkit browser on any other device, it's probably OK.
			if (this.DetectWebkit()) return true;
	
			//The following devices are also explicitly ok.
			if (this.DetectS60OssBrowser() || this.DetectBlackBerryHigh() || this.DetectWindowsMobile() || this.uagent.search(this.engineTelecaQ) > -1) return true;else return false;
		},
	
		//**************************
		// The quick way to detect for a tier of devices.
		//   This method detects for all other types of phones,
		//   but excludes the iPhone and RichCSS Tier devices.
		// NOTE: This method probably won't work due to poor
		//  support for JavaScript among other devices.
		DetectTierOtherPhones: function DetectTierOtherPhones() {
			if (this.initCompleted || this.isTierGenericMobile) return this.isTierGenericMobile;
	
			//Exclude iPhone, Rich CSS and Tablet Tiers
			if (this.DetectTierIphone() || this.DetectTierRichCss() || this.DetectTierTablet()) return false;
	
			//Otherwise, if it's mobile, it's OK
			if (this.DetectMobileLong()) return true;else return false;
		}
	
	};
	
	//Initialize the MobileEsp object
	MobileEsp.InitDeviceScan();
	
	exports.MobileEsp = MobileEsp;

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	__webpack_require__(13);
	
	$(function () {
		$('#mobile_navigation .search').click(function () {
			$('#mobile_skill_input').focus();
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/* ========================================================================
	 * Bootstrap: sidebar.js v0.1
	 * ========================================================================
	 * Copyright 2011-2014 Asyraf Abdul Rahman
	 * Licensed under MIT
	 * ======================================================================== */
	
	'use strict';
	
	+(function ($) {
	  'use strict';
	
	  // SIDEBAR PUBLIC CLASS DEFINITION
	  // ================================
	
	  var Sidebar = function Sidebar(element, options) {
	    this.$element = $(element);
	    this.options = $.extend({}, Sidebar.DEFAULTS, options);
	    this.transitioning = null;
	
	    if (this.options.parent) this.$parent = $(this.options.parent);
	    if (this.options.toggle) this.toggle();
	  };
	
	  Sidebar.DEFAULTS = {
	    toggle: true
	  };
	
	  Sidebar.prototype.show = function () {
	    if (this.transitioning || this.$element.hasClass('sidebar-open')) return;
	
	    var startEvent = $.Event('show.bs.sidebar');
	    this.$element.trigger(startEvent);
	    if (startEvent.isDefaultPrevented()) return;
	
	    this.$element.addClass('sidebar-open');
	
	    this.transitioning = 1;
	
	    var complete = function complete() {
	      this.$element;
	      this.transitioning = 0;
	      this.$element.trigger('shown.bs.sidebar');
	    };
	
	    if (!$.support.transition) return complete.call(this);
	
	    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(400);
	  };
	
	  Sidebar.prototype.hide = function () {
	    if (this.transitioning || !this.$element.hasClass('sidebar-open')) return;
	
	    var startEvent = $.Event('hide.bs.sidebar');
	    this.$element.trigger(startEvent);
	    if (startEvent.isDefaultPrevented()) return;
	
	    this.$element.removeClass('sidebar-open');
	
	    this.transitioning = 1;
	
	    var complete = function complete() {
	      this.transitioning = 0;
	      this.$element.trigger('hidden.bs.sidebar');
	    };
	
	    if (!$.support.transition) return complete.call(this);
	
	    this.$element.one($.support.transition.end, $.proxy(complete, this)).emulateTransitionEnd(400);
	  };
	
	  Sidebar.prototype.toggle = function () {
	    this[this.$element.hasClass('sidebar-open') ? 'hide' : 'show']();
	  };
	
	  var old = $.fn.sidebar;
	
	  $.fn.sidebar = function (option) {
	    return this.each(function () {
	      var $this = $(this);
	      var data = $this.data('bs.sidebar');
	      var options = $.extend({}, Sidebar.DEFAULTS, $this.data(), typeof options == 'object' && option);
	
	      if (!data && options.toggle && option == 'show') option = !option;
	      if (!data) $this.data('bs.sidebar', data = new Sidebar(this, options));
	      if (typeof option == 'string') data[option]();
	    });
	  };
	
	  $.fn.sidebar.Constructor = Sidebar;
	
	  $.fn.sidebar.noConflict = function () {
	    $.fn.sidebar = old;
	    return this;
	  };
	
	  $(document).on('click.bs.sidebar.data-api', '[data-toggle="sidebar"]', function (e) {
	    var $this = $(this),
	        href;
	    var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '');
	    var $target = $(target);
	    var data = $target.data('bs.sidebar');
	    var option = data ? 'toggle' : $this.data();
	
	    $target.sidebar(option);
	  });
	
	  $('html').on('click.bs.sidebar.autohide', function (event) {
	    var $this = $(event.target);
	    var isButtonOrSidebar = $this.is('.sidebar, [data-toggle="sidebar"]') || $this.parents('.sidebar, [data-toggle="sidebar"]').length;
	    if (isButtonOrSidebar) {
	      return;
	    } else {
	      var $target = $('.sidebar');
	      $target.each(function (i, trgt) {
	        var $trgt = $(trgt);
	        if ($trgt.data('bs.sidebar') && $trgt.hasClass('sidebar-open')) {
	          $trgt.sidebar('hide');
	        }
	      });
	    }
	  });
	})(jQuery);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 120:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	* Parsleyjs
	* Guillaume Potier - <guillaume@wisembly.com>
	* Version 2.0.6 - built Sat Jan 24 2015 14:44:37
	* MIT Licensed
	*
	*/
	'use strict';
	
	!(function (factory) {
	  if (true) {
	    // AMD. Register as an anonymous module depending on jQuery.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    // No AMD. Register plugin with global jQuery object.
	    factory(jQuery);
	  }
	})(function ($) {
	  // small hack for requirejs if jquery is loaded through map and not path
	  // see http://requirejs.org/docs/jquery.html
	  if ('undefined' === typeof $ && 'undefined' !== typeof window.jQuery) $ = window.jQuery;
	  var ParsleyUtils = {
	    // Parsley DOM-API
	    // returns object from dom attributes and values
	    // if attr is given, returns bool if attr present in DOM or not
	    attr: function attr($element, namespace, checkAttr) {
	      var attribute,
	          obj = {},
	          msie = this.msieversion(),
	          regex = new RegExp('^' + namespace, 'i');
	      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return {};
	      for (var i in $element[0].attributes) {
	        attribute = $element[0].attributes[i];
	        if ('undefined' !== typeof attribute && null !== attribute && (!msie || msie >= 8 || attribute.specified) && regex.test(attribute.name)) {
	          if ('undefined' !== typeof checkAttr && new RegExp(checkAttr + '$', 'i').test(attribute.name)) return true;
	          obj[this.camelize(attribute.name.replace(namespace, ''))] = this.deserializeValue(attribute.value);
	        }
	      }
	      return 'undefined' === typeof checkAttr ? obj : false;
	    },
	    setAttr: function setAttr($element, namespace, attr, value) {
	      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
	    },
	    // Recursive object / array getter
	    get: function get(obj, path) {
	      var i = 0,
	          paths = (path || '').split('.');
	      while (this.isObject(obj) || this.isArray(obj)) {
	        obj = obj[paths[i++]];
	        if (i === paths.length) return obj;
	      }
	      return undefined;
	    },
	    hash: function hash(length) {
	      return String(Math.random()).substring(2, length ? length + 2 : 9);
	    },
	    /** Third party functions **/
	    // Underscore isArray
	    isArray: function isArray(mixed) {
	      return Object.prototype.toString.call(mixed) === '[object Array]';
	    },
	    // Underscore isObject
	    isObject: function isObject(mixed) {
	      return mixed === Object(mixed);
	    },
	    // Zepto deserialize function
	    deserializeValue: function deserializeValue(value) {
	      var num;
	      try {
	        return value ? value == 'true' || (value == 'false' ? false : value == 'null' ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
	      } catch (e) {
	        return value;
	      }
	    },
	    // Zepto camelize function
	    camelize: function camelize(str) {
	      return str.replace(/-+(.)?/g, function (match, chr) {
	        return chr ? chr.toUpperCase() : '';
	      });
	    },
	    // Zepto dasherize function
	    dasherize: function dasherize(str) {
	      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
	    },
	    // http://support.microsoft.com/kb/167820
	    // http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
	    msieversion: function msieversion() {
	      var ua = window.navigator.userAgent,
	          msie = ua.indexOf('MSIE ');
	      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	      return 0;
	    }
	  };
	  // All these options could be overriden and specified directly in DOM using
	  // `data-parsley-` default DOM-API
	  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
	  // eg: `data-parsley-stop-on-first-failing-constraint="false"`
	  var ParsleyDefaults = {
	    // ### General
	    // Default data-namespace for DOM API
	    namespace: 'data-parsley-',
	    // Supported inputs by default
	    inputs: 'input, textarea, select',
	    // Excluded inputs by default
	    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',
	    // Stop validating field on highest priority failing constraint
	    priorityEnabled: true,
	    // ### UI
	    // Enable\Disable error messages
	    uiEnabled: true,
	    // Key events threshold before validation
	    validationThreshold: 3,
	    // Focused field on form validation error. 'fist'|'last'|'none'
	    focus: 'first',
	    // `$.Event()` that will trigger validation. eg: `keyup`, `change`...
	    trigger: false,
	    // Class that would be added on every failing validation Parsley field
	    errorClass: 'parsley-error',
	    // Same for success validation
	    successClass: 'parsley-success',
	    // Return the `$element` that will receive these above success or error classes
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    classHandler: function classHandler(ParsleyField) {},
	    // Return the `$element` where errors will be appended
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    errorsContainer: function errorsContainer(ParsleyField) {},
	    // ul elem that would receive errors' list
	    errorsWrapper: '<ul class="parsley-errors-list"></ul>',
	    // li elem that would receive error message
	    errorTemplate: '<li></li>'
	  };
	
	  var ParsleyAbstract = function ParsleyAbstract() {};
	  ParsleyAbstract.prototype = {
	    asyncSupport: false,
	    actualizeOptions: function actualizeOptions() {
	      this.options = this.OptionsFactory.get(this);
	      return this;
	    },
	    // ParsleyValidator validate proxy function . Could be replaced by third party scripts
	    validateThroughValidator: function validateThroughValidator(value, constraints, priority) {
	      return window.ParsleyValidator.validate(value, constraints, priority);
	    },
	    // Subscribe an event and a handler for a specific field or a specific form
	    // If on a ParsleyForm instance, it will be attached to form instance and also
	    // To every field instance for this form
	    subscribe: function subscribe(name, fn) {
	      $.listenTo(this, name.toLowerCase(), fn);
	      return this;
	    },
	    // Same as subscribe above. Unsubscribe an event for field, or form + its fields
	    unsubscribe: function unsubscribe(name) {
	      $.unsubscribeTo(this, name.toLowerCase());
	      return this;
	    },
	    // Reset UI
	    reset: function reset() {
	      // Field case: just emit a reset event for UI
	      if ('ParsleyForm' !== this.__class__) return $.emit('parsley:field:reset', this);
	      // Form case: emit a reset event for each field
	      for (var i = 0; i < this.fields.length; i++) $.emit('parsley:field:reset', this.fields[i]);
	      $.emit('parsley:form:reset', this);
	    },
	    // Destroy Parsley instance (+ UI)
	    destroy: function destroy() {
	      // Field case: emit destroy event to clean UI and then destroy stored instance
	      if ('ParsleyForm' !== this.__class__) {
	        this.$element.removeData('Parsley');
	        this.$element.removeData('ParsleyFieldMultiple');
	        $.emit('parsley:field:destroy', this);
	        return;
	      }
	      // Form case: destroy all its fields and then destroy stored instance
	      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();
	      this.$element.removeData('Parsley');
	      $.emit('parsley:form:destroy', this);
	    }
	  };
	  /*!
	  * validator.js
	  * Guillaume Potier - <guillaume@wisembly.com>
	  * Version 1.0.1 - built Mon Aug 25 2014 16:10:10
	  * MIT Licensed
	  *
	  */
	  var Validator = (function () {
	    var exports = {};
	    /**
	    * Validator
	    */
	    var Validator = function Validator(options) {
	      this.__class__ = 'Validator';
	      this.__version__ = '1.0.1';
	      this.options = options || {};
	      this.bindingKey = this.options.bindingKey || '_validatorjsConstraint';
	    };
	    Validator.prototype = {
	      constructor: Validator,
	      /*
	      * Validate string: validate( string, Assert, string ) || validate( string, [ Assert, Assert ], [ string, string ] )
	      * Validate object: validate( object, Constraint, string ) || validate( object, Constraint, [ string, string ] )
	      * Validate binded object: validate( object, string ) || validate( object, [ string, string ] )
	      */
	      validate: function validate(objectOrString, AssertsOrConstraintOrGroup, group) {
	        if ('string' !== typeof objectOrString && 'object' !== typeof objectOrString) throw new Error('You must validate an object or a string');
	        // string / array validation
	        if ('string' === typeof objectOrString || _isArray(objectOrString)) return this._validateString(objectOrString, AssertsOrConstraintOrGroup, group);
	        // binded object validation
	        if (this.isBinded(objectOrString)) return this._validateBindedObject(objectOrString, AssertsOrConstraintOrGroup);
	        // regular object validation
	        return this._validateObject(objectOrString, AssertsOrConstraintOrGroup, group);
	      },
	      bind: function bind(object, constraint) {
	        if ('object' !== typeof object) throw new Error('Must bind a Constraint to an object');
	        object[this.bindingKey] = new Constraint(constraint);
	        return this;
	      },
	      unbind: function unbind(object) {
	        if ('undefined' === typeof object._validatorjsConstraint) return this;
	        delete object[this.bindingKey];
	        return this;
	      },
	      isBinded: function isBinded(object) {
	        return 'undefined' !== typeof object[this.bindingKey];
	      },
	      getBinded: function getBinded(object) {
	        return this.isBinded(object) ? object[this.bindingKey] : null;
	      },
	      _validateString: function _validateString(string, assert, group) {
	        var result,
	            failures = [];
	        if (!_isArray(assert)) assert = [assert];
	        for (var i = 0; i < assert.length; i++) {
	          if (!(assert[i] instanceof Assert)) throw new Error('You must give an Assert or an Asserts array to validate a string');
	          result = assert[i].check(string, group);
	          if (result instanceof Violation) failures.push(result);
	        }
	        return failures.length ? failures : true;
	      },
	      _validateObject: function _validateObject(object, constraint, group) {
	        if ('object' !== typeof constraint) throw new Error('You must give a constraint to validate an object');
	        if (constraint instanceof Constraint) return constraint.check(object, group);
	        return new Constraint(constraint).check(object, group);
	      },
	      _validateBindedObject: function _validateBindedObject(object, group) {
	        return object[this.bindingKey].check(object, group);
	      }
	    };
	    Validator.errorCode = {
	      must_be_a_string: 'must_be_a_string',
	      must_be_an_array: 'must_be_an_array',
	      must_be_a_number: 'must_be_a_number',
	      must_be_a_string_or_array: 'must_be_a_string_or_array'
	    };
	    /**
	    * Constraint
	    */
	    var Constraint = function Constraint(data, options) {
	      this.__class__ = 'Constraint';
	      this.options = options || {};
	      this.nodes = {};
	      if (data) {
	        try {
	          this._bootstrap(data);
	        } catch (err) {
	          throw new Error('Should give a valid mapping object to Constraint', err, data);
	        }
	      }
	    };
	    Constraint.prototype = {
	      constructor: Constraint,
	      check: function check(object, group) {
	        var result,
	            failures = {};
	        // check all constraint nodes.
	        for (var property in this.nodes) {
	          var isRequired = false;
	          var constraint = this.get(property);
	          var constraints = _isArray(constraint) ? constraint : [constraint];
	          for (var i = constraints.length - 1; i >= 0; i--) {
	            if ('Required' === constraints[i].__class__) {
	              isRequired = constraints[i].requiresValidation(group);
	              continue;
	            }
	          }
	          if (!this.has(property, object) && !this.options.strict && !isRequired) {
	            continue;
	          }
	          try {
	            if (!this.has(property, this.options.strict || isRequired ? object : undefined)) {
	              // we trigger here a HaveProperty Assert violation to have uniform Violation object in the end
	              new Assert().HaveProperty(property).validate(object);
	            }
	            result = this._check(property, object[property], group);
	            // check returned an array of Violations or an object mapping Violations
	            if (_isArray(result) && result.length > 0 || !_isArray(result) && !_isEmptyObject(result)) {
	              failures[property] = result;
	            }
	          } catch (violation) {
	            failures[property] = violation;
	          }
	        }
	        return _isEmptyObject(failures) ? true : failures;
	      },
	      add: function add(node, object) {
	        if (object instanceof Assert || _isArray(object) && object[0] instanceof Assert) {
	          this.nodes[node] = object;
	          return this;
	        }
	        if ('object' === typeof object && !_isArray(object)) {
	          this.nodes[node] = object instanceof Constraint ? object : new Constraint(object);
	          return this;
	        }
	        throw new Error('Should give an Assert, an Asserts array, a Constraint', object);
	      },
	      has: function has(node, nodes) {
	        nodes = 'undefined' !== typeof nodes ? nodes : this.nodes;
	        return 'undefined' !== typeof nodes[node];
	      },
	      get: function get(node, placeholder) {
	        return this.has(node) ? this.nodes[node] : placeholder || null;
	      },
	      remove: function remove(node) {
	        var _nodes = [];
	        for (var i in this.nodes) if (i !== node) _nodes[i] = this.nodes[i];
	        this.nodes = _nodes;
	        return this;
	      },
	      _bootstrap: function _bootstrap(data) {
	        if (data instanceof Constraint) return this.nodes = data.nodes;
	        for (var node in data) this.add(node, data[node]);
	      },
	      _check: function _check(node, value, group) {
	        // Assert
	        if (this.nodes[node] instanceof Assert) return this._checkAsserts(value, [this.nodes[node]], group);
	        // Asserts
	        if (_isArray(this.nodes[node])) return this._checkAsserts(value, this.nodes[node], group);
	        // Constraint -> check api
	        if (this.nodes[node] instanceof Constraint) return this.nodes[node].check(value, group);
	        throw new Error('Invalid node', this.nodes[node]);
	      },
	      _checkAsserts: function _checkAsserts(value, asserts, group) {
	        var result,
	            failures = [];
	        for (var i = 0; i < asserts.length; i++) {
	          result = asserts[i].check(value, group);
	          if ('undefined' !== typeof result && true !== result) failures.push(result);
	          // Some asserts (Collection for example) could return an object
	          // if ( result && ! ( result instanceof Violation ) )
	          //   return result;
	          //
	          // // Vast assert majority return Violation
	          // if ( result instanceof Violation )
	          //   failures.push( result );
	        }
	        return failures;
	      }
	    };
	    /**
	    * Violation
	    */
	    var Violation = function Violation(assert, value, violation) {
	      this.__class__ = 'Violation';
	      if (!(assert instanceof Assert)) throw new Error('Should give an assertion implementing the Assert interface');
	      this.assert = assert;
	      this.value = value;
	      if ('undefined' !== typeof violation) this.violation = violation;
	    };
	    Violation.prototype = {
	      show: function show() {
	        var show = {
	          assert: this.assert.__class__,
	          value: this.value
	        };
	        if (this.violation) show.violation = this.violation;
	        return show;
	      },
	      __toString: function __toString() {
	        if ('undefined' !== typeof this.violation) this.violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;
	        return this.assert.__class__ + ' assert failed for "' + this.value + this.violation || '';
	      },
	      getViolation: function getViolation() {
	        var constraint, expected;
	        for (constraint in this.violation) expected = this.violation[constraint];
	        return { constraint: constraint, expected: expected };
	      }
	    };
	    /**
	    * Assert
	    */
	    var Assert = function Assert(group) {
	      this.__class__ = 'Assert';
	      this.__parentClass__ = this.__class__;
	      this.groups = [];
	      if ('undefined' !== typeof group) this.addGroup(group);
	    };
	    Assert.prototype = {
	      construct: Assert,
	      requiresValidation: function requiresValidation(group) {
	        if (group && !this.hasGroup(group)) return false;
	        if (!group && this.hasGroups()) return false;
	        return true;
	      },
	      check: function check(value, group) {
	        if (!this.requiresValidation(group)) return;
	        try {
	          return this.validate(value, group);
	        } catch (violation) {
	          return violation;
	        }
	      },
	      hasGroup: function hasGroup(group) {
	        if (_isArray(group)) return this.hasOneOf(group);
	        // All Asserts respond to "Any" group
	        if ('Any' === group) return true;
	        // Asserts with no group also respond to "Default" group. Else return false
	        if (!this.hasGroups()) return 'Default' === group;
	        return -1 !== this.groups.indexOf(group);
	      },
	      hasOneOf: function hasOneOf(groups) {
	        for (var i = 0; i < groups.length; i++) if (this.hasGroup(groups[i])) return true;
	        return false;
	      },
	      hasGroups: function hasGroups() {
	        return this.groups.length > 0;
	      },
	      addGroup: function addGroup(group) {
	        if (_isArray(group)) return this.addGroups(group);
	        if (!this.hasGroup(group)) this.groups.push(group);
	        return this;
	      },
	      removeGroup: function removeGroup(group) {
	        var _groups = [];
	        for (var i = 0; i < this.groups.length; i++) if (group !== this.groups[i]) _groups.push(this.groups[i]);
	        this.groups = _groups;
	        return this;
	      },
	      addGroups: function addGroups(groups) {
	        for (var i = 0; i < groups.length; i++) this.addGroup(groups[i]);
	        return this;
	      },
	      /**
	      * Asserts definitions
	      */
	      HaveProperty: function HaveProperty(node) {
	        this.__class__ = 'HaveProperty';
	        this.node = node;
	        this.validate = function (object) {
	          if ('undefined' === typeof object[this.node]) throw new Violation(this, object, { value: this.node });
	          return true;
	        };
	        return this;
	      },
	      Blank: function Blank() {
	        this.__class__ = 'Blank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' !== value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Callback: function Callback(fn) {
	        this.__class__ = 'Callback';
	        this.arguments = Array.prototype.slice.call(arguments);
	        if (1 === this.arguments.length) this.arguments = [];else this.arguments.splice(0, 1);
	        if ('function' !== typeof fn) throw new Error('Callback must be instanciated with a function');
	        this.fn = fn;
	        this.validate = function (value) {
	          var result = this.fn.apply(this, [value].concat(this.arguments));
	          if (true !== result) throw new Violation(this, value, { result: result });
	          return true;
	        };
	        return this;
	      },
	      Choice: function Choice(list) {
	        this.__class__ = 'Choice';
	        if (!_isArray(list) && 'function' !== typeof list) throw new Error('Choice must be instanciated with an array or a function');
	        this.list = list;
	        this.validate = function (value) {
	          var list = 'function' === typeof this.list ? this.list() : this.list;
	          for (var i = 0; i < list.length; i++) if (value === list[i]) return true;
	          throw new Violation(this, value, { choices: list });
	        };
	        return this;
	      },
	      Collection: function Collection(assertOrConstraint) {
	        this.__class__ = 'Collection';
	        this.constraint = 'undefined' !== typeof assertOrConstraint ? assertOrConstraint instanceof Assert ? assertOrConstraint : new Constraint(assertOrConstraint) : false;
	        this.validate = function (collection, group) {
	          var result,
	              validator = new Validator(),
	              count = 0,
	              failures = {},
	              groups = this.groups.length ? this.groups : group;
	          if (!_isArray(collection)) throw new Violation(this, collection, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < collection.length; i++) {
	            result = this.constraint ? validator.validate(collection[i], this.constraint, groups) : validator.validate(collection[i], groups);
	            if (!_isEmptyObject(result)) failures[count] = result;
	            count++;
	          }
	          return !_isEmptyObject(failures) ? failures : true;
	        };
	        return this;
	      },
	      Count: function Count(count) {
	        this.__class__ = 'Count';
	        this.count = count;
	        this.validate = function (array) {
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          var count = 'function' === typeof this.count ? this.count(array) : this.count;
	          if (isNaN(Number(count))) throw new Error('Count must be a valid interger', count);
	          if (count !== array.length) throw new Violation(this, array, { count: count });
	          return true;
	        };
	        return this;
	      },
	      Email: function Email() {
	        this.__class__ = 'Email';
	        this.validate = function (value) {
	          var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!regExp.test(value)) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      EqualTo: function EqualTo(reference) {
	        this.__class__ = 'EqualTo';
	        if ('undefined' === typeof reference) throw new Error('EqualTo must be instanciated with a value or a function');
	        this.reference = reference;
	        this.validate = function (value) {
	          var reference = 'function' === typeof this.reference ? this.reference(value) : this.reference;
	          if (reference !== value) throw new Violation(this, value, { value: reference });
	          return true;
	        };
	        return this;
	      },
	      GreaterThan: function GreaterThan(threshold) {
	        this.__class__ = 'GreaterThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold >= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      GreaterThanOrEqual: function GreaterThanOrEqual(threshold) {
	        this.__class__ = 'GreaterThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold > value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      InstanceOf: function InstanceOf(classRef) {
	        this.__class__ = 'InstanceOf';
	        if ('undefined' === typeof classRef) throw new Error('InstanceOf must be instanciated with a value');
	        this.classRef = classRef;
	        this.validate = function (value) {
	          if (true !== value instanceof this.classRef) throw new Violation(this, value, { classRef: this.classRef });
	          return true;
	        };
	        return this;
	      },
	      Length: function Length(boundaries) {
	        this.__class__ = 'Length';
	        if (!boundaries.min && !boundaries.max) throw new Error('Lenth assert must be instanciated with a { min: x, max: y } object');
	        this.min = boundaries.min;
	        this.max = boundaries.max;
	        this.validate = function (value) {
	          if ('string' !== typeof value && !_isArray(value)) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_array });
	          if ('undefined' !== typeof this.min && this.min === this.max && value.length !== this.min) throw new Violation(this, value, { min: this.min, max: this.max });
	          if ('undefined' !== typeof this.max && value.length > this.max) throw new Violation(this, value, { max: this.max });
	          if ('undefined' !== typeof this.min && value.length < this.min) throw new Violation(this, value, { min: this.min });
	          return true;
	        };
	        return this;
	      },
	      LessThan: function LessThan(threshold) {
	        this.__class__ = 'LessThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold <= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      LessThanOrEqual: function LessThanOrEqual(threshold) {
	        this.__class__ = 'LessThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold < value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      NotNull: function NotNull() {
	        this.__class__ = 'NotNull';
	        this.validate = function (value) {
	          if (null === value || 'undefined' === typeof value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      NotBlank: function NotBlank() {
	        this.__class__ = 'NotBlank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' === value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Null: function Null() {
	        this.__class__ = 'Null';
	        this.validate = function (value) {
	          if (null !== value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Range: function Range(min, max) {
	        this.__class__ = 'Range';
	        if ('undefined' === typeof min || 'undefined' === typeof max) throw new Error('Range assert expects min and max values');
	        this.min = min;
	        this.max = max;
	        this.validate = function (value) {
	          try {
	            // validate strings and objects with their Length
	            if ('string' === typeof value && isNaN(Number(value)) || _isArray(value)) new Assert().Length({ min: this.min, max: this.max }).validate(value);
	            // validate numbers with their value
	            else new Assert().GreaterThanOrEqual(this.min).validate(value) && new Assert().LessThanOrEqual(this.max).validate(value);
	            return true;
	          } catch (violation) {
	            throw new Violation(this, value, violation.violation);
	          }
	          return true;
	        };
	        return this;
	      },
	      Regexp: function Regexp(regexp, flag) {
	        this.__class__ = 'Regexp';
	        if ('undefined' === typeof regexp) throw new Error('You must give a regexp');
	        this.regexp = regexp;
	        this.flag = flag || '';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!new RegExp(this.regexp, this.flag).test(value)) throw new Violation(this, value, { regexp: this.regexp, flag: this.flag });
	          return true;
	        };
	        return this;
	      },
	      Required: function Required() {
	        this.__class__ = 'Required';
	        this.validate = function (value) {
	          if ('undefined' === typeof value) throw new Violation(this, value);
	          try {
	            if ('string' === typeof value) new Assert().NotNull().validate(value) && new Assert().NotBlank().validate(value);else if (true === _isArray(value)) new Assert().Length({ min: 1 }).validate(value);
	          } catch (violation) {
	            throw new Violation(this, value);
	          }
	          return true;
	        };
	        return this;
	      },
	      // Unique() or Unique ( { key: foo } )
	      Unique: function Unique(object) {
	        this.__class__ = 'Unique';
	        if ('object' === typeof object) this.key = object.key;
	        this.validate = function (array) {
	          var value,
	              store = [];
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < array.length; i++) {
	            value = 'object' === typeof array[i] ? array[i][this.key] : array[i];
	            if ('undefined' === typeof value) continue;
	            if (-1 !== store.indexOf(value)) throw new Violation(this, array, { value: value });
	            store.push(value);
	          }
	          return true;
	        };
	        return this;
	      }
	    };
	    // expose to the world these awesome classes
	    exports.Assert = Assert;
	    exports.Validator = Validator;
	    exports.Violation = Violation;
	    exports.Constraint = Constraint;
	    /**
	    * Some useful object prototypes / functions here
	    */
	    // IE8<= compatibility
	    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
	    if (!Array.prototype.indexOf) Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
	
	      if (this === null) {
	        throw new TypeError();
	      }
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (len === 0) {
	        return -1;
	      }
	      var n = 0;
	      if (arguments.length > 1) {
	        n = Number(arguments[1]);
	        if (n != n) {
	          // shortcut for verifying if it's NaN
	          n = 0;
	        } else if (n !== 0 && n != Infinity && n != -Infinity) {
	          n = (n > 0 || -1) * Math.floor(Math.abs(n));
	        }
	      }
	      if (n >= len) {
	        return -1;
	      }
	      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	      for (; k < len; k++) {
	        if (k in t && t[k] === searchElement) {
	          return k;
	        }
	      }
	      return -1;
	    };
	    // Test if object is empty, useful for Constraint violations check
	    var _isEmptyObject = function _isEmptyObject(obj) {
	      for (var property in obj) return false;
	      return true;
	    };
	    var _isArray = function _isArray(obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	    // AMD export
	    if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return exports;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      // commonjs export
	    } else if (typeof module !== 'undefined' && module.exports) {
	      module.exports = exports;
	      // browser
	    } else {
	      window['undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator'] = exports;
	    }
	
	    return exports;
	  })();
	
	  // This is needed for Browserify usage that requires Validator.js through module.exports
	  Validator = 'undefined' !== typeof Validator ? Validator : true ? module.exports : null;
	  var ParsleyValidator = function ParsleyValidator(validators, catalog) {
	    this.__class__ = 'ParsleyValidator';
	    this.Validator = Validator;
	    // Default Parsley locale is en
	    this.locale = 'en';
	    this.init(validators || {}, catalog || {});
	  };
	  ParsleyValidator.prototype = {
	    init: function init(validators, catalog) {
	      this.catalog = catalog;
	      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority, validators[name].requirementsTransformer);
	      $.emit('parsley:validator:init');
	    },
	    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
	    setLocale: function setLocale(locale) {
	      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');
	      this.locale = locale;
	      return this;
	    },
	    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
	    addCatalog: function addCatalog(locale, messages, set) {
	      if ('object' === typeof messages) this.catalog[locale] = messages;
	      if (true === set) return this.setLocale(locale);
	      return this;
	    },
	    // Add a specific message for a given constraint in a given locale
	    addMessage: function addMessage(locale, name, message) {
	      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};
	      this.catalog[locale][name.toLowerCase()] = message;
	      return this;
	    },
	    validate: function validate(value, constraints, priority) {
	      return new this.Validator.Validator().validate.apply(new Validator.Validator(), arguments);
	    },
	    // Add a new validator
	    addValidator: function addValidator(name, fn, priority, requirementsTransformer) {
	      this.validators[name.toLowerCase()] = function (requirements) {
	        return $.extend(new Validator.Assert().Callback(fn, requirements), {
	          priority: priority,
	          requirementsTransformer: requirementsTransformer
	        });
	      };
	      return this;
	    },
	    updateValidator: function updateValidator(name, fn, priority, requirementsTransformer) {
	      return this.addValidator(name, fn, priority, requirementsTransformer);
	    },
	    removeValidator: function removeValidator(name) {
	      delete this.validators[name];
	      return this;
	    },
	    getErrorMessage: function getErrorMessage(constraint) {
	      var message;
	      // Type constraints are a bit different, we have to match their requirements too to find right error message
	      if ('type' === constraint.name) message = this.catalog[this.locale][constraint.name][constraint.requirements];else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);
	      return '' !== message ? message : this.catalog[this.locale].defaultMessage;
	    },
	    // Kind of light `sprintf()` implementation
	    formatMessage: function formatMessage(string, parameters) {
	      if ('object' === typeof parameters) {
	        for (var i in parameters) string = this.formatMessage(string, parameters[i]);
	        return string;
	      }
	      return 'string' === typeof string ? string.replace(new RegExp('%s', 'i'), parameters) : '';
	    },
	    // Here is the Parsley default validators list.
	    // This is basically Validatorjs validators, with different API for some of them
	    // and a Parsley priority set
	    validators: {
	      notblank: function notblank() {
	        return $.extend(new Validator.Assert().NotBlank(), { priority: 2 });
	      },
	      required: function required() {
	        return $.extend(new Validator.Assert().Required(), { priority: 512 });
	      },
	      type: function type(_type) {
	        var assert;
	        switch (_type) {
	          case 'email':
	            assert = new Validator.Assert().Email();
	            break;
	          // range type just ensure we have a number here
	          case 'range':
	          case 'number':
	            assert = new Validator.Assert().Regexp('^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?$');
	            break;
	          case 'integer':
	            assert = new Validator.Assert().Regexp('^-?\\d+$');
	            break;
	          case 'digits':
	            assert = new Validator.Assert().Regexp('^\\d+$');
	            break;
	          case 'alphanum':
	            assert = new Validator.Assert().Regexp('^\\w+$', 'i');
	            break;
	          case 'url':
	            assert = new Validator.Assert().Regexp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,24}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	            break;
	          default:
	            throw new Error('validator type `' + _type + '` is not supported');
	        }
	        return $.extend(assert, { priority: 256 });
	      },
	      pattern: function pattern(regexp) {
	        var flags = '';
	        // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
	        if (!!/^\/.*\/(?:[gimy]*)$/.test(regexp)) {
	          // Replace the regexp literal string with the first match group: ([gimy]*)
	          // If no flag is present, this will be a blank string
	          flags = regexp.replace(/.*\/([gimy]*)$/, '$1');
	          // Again, replace the regexp literal string with the first match group:
	          // everything excluding the opening and closing slashes and the flags
	          regexp = regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	        }
	        return $.extend(new Validator.Assert().Regexp(regexp, flags), { priority: 64 });
	      },
	      minlength: function minlength(value) {
	        return $.extend(new Validator.Assert().Length({ min: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      maxlength: function maxlength(value) {
	        return $.extend(new Validator.Assert().Length({ max: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      length: function length(array) {
	        return $.extend(new Validator.Assert().Length({ min: array[0], max: array[1] }), { priority: 32 });
	      },
	      mincheck: function mincheck(length) {
	        return this.minlength(length);
	      },
	      maxcheck: function maxcheck(length) {
	        return this.maxlength(length);
	      },
	      check: function check(array) {
	        return this.length(array);
	      },
	      min: function min(value) {
	        return $.extend(new Validator.Assert().GreaterThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      max: function max(value) {
	        return $.extend(new Validator.Assert().LessThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      range: function range(array) {
	        return $.extend(new Validator.Assert().Range(array[0], array[1]), {
	          priority: 32,
	          requirementsTransformer: function requirementsTransformer() {
	            for (var i = 0; i < array.length; i++) array[i] = 'string' === typeof array[i] && !isNaN(array[i]) ? parseInt(array[i], 10) : array[i];
	            return array;
	          }
	        });
	      },
	      equalto: function equalto(value) {
	        return $.extend(new Validator.Assert().EqualTo(value), {
	          priority: 256,
	          requirementsTransformer: function requirementsTransformer() {
	            return $(value).length ? $(value).val() : value;
	          }
	        });
	      }
	    }
	  };
	
	  var ParsleyUI = function ParsleyUI(options) {
	    this.__class__ = 'ParsleyUI';
	  };
	  ParsleyUI.prototype = {
	    listen: function listen() {
	      $.listen('parsley:form:init', this, this.setupForm);
	      $.listen('parsley:field:init', this, this.setupField);
	      $.listen('parsley:field:validated', this, this.reflow);
	      $.listen('parsley:form:validated', this, this.focus);
	      $.listen('parsley:field:reset', this, this.reset);
	      $.listen('parsley:form:destroy', this, this.destroy);
	      $.listen('parsley:field:destroy', this, this.destroy);
	      return this;
	    },
	    reflow: function reflow(fieldInstance) {
	      // If this field has not an active UI (case for multiples) don't bother doing something
	      if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active) return;
	      // Diff between two validation results
	      var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);
	      // Then store current validation result for next reflow
	      fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;
	      // Field have been validated at least once if here. Useful for binded key events...
	      fieldInstance._ui.validatedOnce = true;
	      // Handle valid / invalid / none field class
	      this.manageStatusClass(fieldInstance);
	      // Add, remove, updated errors messages
	      this.manageErrorsMessages(fieldInstance, diff);
	      // Triggers impl
	      this.actualizeTriggers(fieldInstance);
	      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
	      if ((diff.kept.length || diff.added.length) && 'undefined' === typeof fieldInstance._ui.failedOnce) this.manageFailingFieldTrigger(fieldInstance);
	    },
	    // Returns an array of field's error message(s)
	    getErrorsMessages: function getErrorsMessages(fieldInstance) {
	      // No error message, field is valid
	      if (true === fieldInstance.validationResult) return [];
	      var messages = [];
	      for (var i = 0; i < fieldInstance.validationResult.length; i++) messages.push(this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));
	      return messages;
	    },
	    manageStatusClass: function manageStatusClass(fieldInstance) {
	      if (true === fieldInstance.validationResult) this._successClass(fieldInstance);else if (fieldInstance.validationResult.length > 0) this._errorClass(fieldInstance);else this._resetClass(fieldInstance);
	    },
	    manageErrorsMessages: function manageErrorsMessages(fieldInstance, diff) {
	      if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled) return;
	      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
	      if ('undefined' !== typeof fieldInstance.options.errorMessage) {
	        if (diff.added.length || diff.kept.length) {
	          if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length) fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));
	          return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);
	        }
	        return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
	      }
	      // Show, hide, update failing constraints messages
	      for (var i = 0; i < diff.removed.length; i++) this.removeError(fieldInstance, diff.removed[i].assert.name, true);
	      for (i = 0; i < diff.added.length; i++) this.addError(fieldInstance, diff.added[i].assert.name, undefined, diff.added[i].assert, true);
	      for (i = 0; i < diff.kept.length; i++) this.updateError(fieldInstance, diff.kept[i].assert.name, undefined, diff.kept[i].assert, true);
	    },
	    // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
	    // but a little bit complex for above internal usage, with forced undefined parameter...
	    addError: function addError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert)));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above
	    updateError: function updateError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above twice
	    removeError: function removeError(fieldInstance, name, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();
	      // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
	      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
	      if (true !== doNotUpdateClass) this.manageStatusClass(fieldInstance);
	    },
	    focus: function focus(formInstance) {
	      if (true === formInstance.validationResult || 'none' === formInstance.options.focus) return formInstance._focusedField = null;
	      formInstance._focusedField = null;
	      for (var i = 0; i < formInstance.fields.length; i++) if (true !== formInstance.fields[i].validationResult && formInstance.fields[i].validationResult.length > 0 && 'undefined' === typeof formInstance.fields[i].options.noFocus) {
	        if ('first' === formInstance.options.focus) {
	          formInstance._focusedField = formInstance.fields[i].$element;
	          return formInstance._focusedField.focus();
	        }
	        formInstance._focusedField = formInstance.fields[i].$element;
	      }
	      if (null === formInstance._focusedField) return null;
	      return formInstance._focusedField.focus();
	    },
	    _getErrorMessage: function _getErrorMessage(fieldInstance, constraint) {
	      var customConstraintErrorMessage = constraint.name + 'Message';
	      if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage]) return window.ParsleyValidator.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);
	      return window.ParsleyValidator.getErrorMessage(constraint);
	    },
	    _diff: function _diff(newResult, oldResult, deep) {
	      var added = [],
	          kept = [];
	      for (var i = 0; i < newResult.length; i++) {
	        var found = false;
	        for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
	          found = true;
	          break;
	        }
	        if (found) kept.push(newResult[i]);else added.push(newResult[i]);
	      }
	      return {
	        kept: kept,
	        added: added,
	        removed: !deep ? this._diff(oldResult, newResult, true).added : []
	      };
	    },
	    setupForm: function setupForm(formInstance) {
	      formInstance.$element.on('submit.Parsley', false, $.proxy(formInstance.onSubmitValidate, formInstance));
	      // UI could be disabled
	      if (false === formInstance.options.uiEnabled) return;
	      formInstance.$element.attr('novalidate', '');
	    },
	    setupField: function setupField(fieldInstance) {
	      var _ui = { active: false };
	      // UI could be disabled
	      if (false === fieldInstance.options.uiEnabled) return;
	      _ui.active = true;
	      // Give field its Parsley id in DOM
	      fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);
	      /** Generate important UI elements and store them in fieldInstance **/
	      // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
	      _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);
	      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
	      _ui.errorsWrapperId = 'parsley-id-' + ('undefined' !== typeof fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
	      _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);
	      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
	      _ui.lastValidationResult = [];
	      _ui.validatedOnce = false;
	      _ui.validationInformationVisible = false;
	      // Store it in fieldInstance for later
	      fieldInstance._ui = _ui;
	      // Stops excluded inputs from getting errorContainer added
	      if (!fieldInstance.$element.is(fieldInstance.options.excluded)) {
	        /** Mess with DOM now **/
	        this._insertErrorWrapper(fieldInstance);
	      }
	      // Bind triggers first time
	      this.actualizeTriggers(fieldInstance);
	    },
	    // Determine which element will have `parsley-error` and `parsley-success` classes
	    _manageClassHandler: function _manageClassHandler(fieldInstance) {
	      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
	      if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length) return $(fieldInstance.options.classHandler);
	      // Class handled could also be determined by function given in Parsley options
	      var $handler = fieldInstance.options.classHandler(fieldInstance);
	      // If this function returned a valid existing DOM element, go for it
	      if ('undefined' !== typeof $handler && $handler.length) return $handler;
	      // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
	      if ('undefined' === typeof fieldInstance.options.multiple || fieldInstance.$element.is('select')) return fieldInstance.$element;
	      // But if multiple element (radio, checkbox), that would be their parent
	      return fieldInstance.$element.parent();
	    },
	    _insertErrorWrapper: function _insertErrorWrapper(fieldInstance) {
	      var $errorsContainer;
	      if ('string' === typeof fieldInstance.options.errorsContainer) {
	        if ($(fieldInstance.options.errorsContainer).length) return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else if (window.console && window.console.warn) window.console.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
	      } else if ('function' === typeof fieldInstance.options.errorsContainer) $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);
	      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);
	      return 'undefined' === typeof fieldInstance.options.multiple ? fieldInstance.$element.after(fieldInstance._ui.$errorsWrapper) : fieldInstance.$element.parent().after(fieldInstance._ui.$errorsWrapper);
	    },
	    actualizeTriggers: function actualizeTriggers(fieldInstance) {
	      var $toBind = fieldInstance.$element;
	      if (fieldInstance.options.multiple) $toBind = $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]');
	      // Remove Parsley events already binded on this field
	      $toBind.off('.Parsley');
	      // If no trigger is set, all good
	      if (false === fieldInstance.options.trigger) return;
	      var triggers = fieldInstance.options.trigger.replace(/^\s+/g, '').replace(/\s+$/g, '');
	      if ('' === triggers) return;
	      // Bind fieldInstance.eventValidate if exists (for parsley.ajax for example), ParsleyUI.eventValidate otherwise
	      $toBind.on(triggers.split(' ').join('.Parsley ') + '.Parsley', $.proxy('function' === typeof fieldInstance.eventValidate ? fieldInstance.eventValidate : this.eventValidate, fieldInstance));
	    },
	    // Called through $.proxy with fieldInstance. `this` context is ParsleyField
	    eventValidate: function eventValidate(event) {
	      // For keyup, keypress, keydown... events that could be a little bit obstrusive
	      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	      this._ui.validatedOnce = true;
	      this.validate();
	    },
	    manageFailingFieldTrigger: function manageFailingFieldTrigger(fieldInstance) {
	      fieldInstance._ui.failedOnce = true;
	      // Radio and checkboxes fields must bind every field multiple
	      if (fieldInstance.options.multiple) $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]').each(function () {
	        if (!new RegExp('change', 'i').test($(this).parsley().options.trigger || '')) return $(this).on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      });
	      // Select case
	      if (fieldInstance.$element.is('select')) if (!new RegExp('change', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      // All other inputs fields
	      if (!new RegExp('keyup', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('keyup.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	    },
	    reset: function reset(parsleyInstance) {
	      // Reset all event listeners
	      parsleyInstance.$element.off('.Parsley');
	      parsleyInstance.$element.off('.ParsleyFailedOnce');
	      // Nothing to do if UI never initialized for this field
	      if ('undefined' === typeof parsleyInstance._ui) return;
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      // Reset all errors' li
	      parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove();
	      // Reset validation class
	      this._resetClass(parsleyInstance);
	      // Reset validation flags and last validation result
	      parsleyInstance._ui.validatedOnce = false;
	      parsleyInstance._ui.lastValidationResult = [];
	      parsleyInstance._ui.validationInformationVisible = false;
	    },
	    destroy: function destroy(parsleyInstance) {
	      this.reset(parsleyInstance);
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      if ('undefined' !== typeof parsleyInstance._ui) parsleyInstance._ui.$errorsWrapper.remove();
	      delete parsleyInstance._ui;
	    },
	    _successClass: function _successClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
	    },
	    _errorClass: function _errorClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
	    },
	    _resetClass: function _resetClass(fieldInstance) {
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
	    }
	  };
	
	  var ParsleyOptionsFactory = function ParsleyOptionsFactory(defaultOptions, globalOptions, userOptions, namespace) {
	    this.__class__ = 'OptionsFactory';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.formOptions = null;
	    this.fieldOptions = null;
	    this.staticOptions = $.extend(true, {}, defaultOptions, globalOptions, userOptions, { namespace: namespace });
	  };
	  ParsleyOptionsFactory.prototype = {
	    get: function get(parsleyInstance) {
	      if ('undefined' === typeof parsleyInstance.__class__) throw new Error('Parsley Instance expected');
	      switch (parsleyInstance.__class__) {
	        case 'Parsley':
	          return this.staticOptions;
	        case 'ParsleyForm':
	          return this.getFormOptions(parsleyInstance);
	        case 'ParsleyField':
	        case 'ParsleyFieldMultiple':
	          return this.getFieldOptions(parsleyInstance);
	        default:
	          throw new Error('Instance ' + parsleyInstance.__class__ + ' is not supported');
	      }
	    },
	    getFormOptions: function getFormOptions(formInstance) {
	      this.formOptions = ParsleyUtils.attr(formInstance.$element, this.staticOptions.namespace);
	      // not deep extend, since formOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions);
	    },
	    getFieldOptions: function getFieldOptions(fieldInstance) {
	      this.fieldOptions = ParsleyUtils.attr(fieldInstance.$element, this.staticOptions.namespace);
	      if (null === this.formOptions && 'undefined' !== typeof fieldInstance.parent) this.formOptions = this.getFormOptions(fieldInstance.parent);
	      // not deep extend, since formOptions and fieldOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions, this.fieldOptions);
	    }
	  };
	
	  var ParsleyForm = function ParsleyForm(element, OptionsFactory) {
	    this.__class__ = 'ParsleyForm';
	    this.__id__ = ParsleyUtils.hash(4);
	    if ('OptionsFactory' !== ParsleyUtils.get(OptionsFactory, '__class__')) throw new Error('You must give an OptionsFactory instance');
	    this.OptionsFactory = OptionsFactory;
	    this.$element = $(element);
	    this.validationResult = null;
	    this.options = this.OptionsFactory.get(this);
	  };
	  ParsleyForm.prototype = {
	    onSubmitValidate: function onSubmitValidate(event) {
	      this.validate(undefined, undefined, event);
	      // prevent form submission if validation fails
	      if (false === this.validationResult && event instanceof $.Event) {
	        event.stopImmediatePropagation();
	        event.preventDefault();
	      }
	      return this;
	    },
	    // @returns boolean
	    validate: function validate(group, force, event) {
	      this.submitEvent = event;
	      this.validationResult = true;
	      var fieldValidationResult = [];
	      $.emit('parsley:form:validate', this);
	      // Refresh form DOM options and form's fields that could have changed
	      this._refreshFields();
	      // loop through fields to validate them one by one
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        fieldValidationResult = this.fields[i].validate(force);
	        if (true !== fieldValidationResult && fieldValidationResult.length > 0 && this.validationResult) this.validationResult = false;
	      }
	      $.emit('parsley:form:' + (this.validationResult ? 'success' : 'error'), this);
	      $.emit('parsley:form:validated', this);
	      return this.validationResult;
	    },
	    // Iterate over refreshed fields, and stop on first failure
	    isValid: function isValid(group, force) {
	      this._refreshFields();
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        if (false === this.fields[i].isValid(force)) return false;
	      }
	      return true;
	    },
	    _isFieldInGroup: function _isFieldInGroup(field, group) {
	      if (ParsleyUtils.isArray(field.options.group)) return -1 !== $.inArray(group, field.options.group);
	      return field.options.group === group;
	    },
	    _refreshFields: function _refreshFields() {
	      return this.actualizeOptions()._bindFields();
	    },
	    _bindFields: function _bindFields() {
	      var self = this;
	      this.fields = [];
	      this.fieldsMappedById = {};
	      this.$element.find(this.options.inputs).each(function () {
	        var fieldInstance = new window.Parsley(this, {}, self);
	        // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
	        if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && !fieldInstance.$element.is(fieldInstance.options.excluded)) if ('undefined' === typeof self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
	          self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
	          self.fields.push(fieldInstance);
	        }
	      });
	      return this;
	    }
	  };
	
	  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
	    var assert = {};
	    if (!new RegExp('ParsleyField').test(ParsleyUtils.get(parsleyField, '__class__'))) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');
	    if ('function' === typeof window.ParsleyValidator.validators[name]) assert = window.ParsleyValidator.validators[name](requirements);
	    if ('Assert' !== assert.__parentClass__) throw new Error('Valid validator expected');
	    var getPriority = function getPriority() {
	      if ('undefined' !== typeof parsleyField.options[name + 'Priority']) return parsleyField.options[name + 'Priority'];
	      return ParsleyUtils.get(assert, 'priority') || 2;
	    };
	    priority = priority || getPriority();
	    // If validator have a requirementsTransformer, execute it
	    if ('function' === typeof assert.requirementsTransformer) {
	      requirements = assert.requirementsTransformer();
	      // rebuild assert with new requirements
	      assert = window.ParsleyValidator.validators[name](requirements);
	    }
	    return $.extend(assert, {
	      name: name,
	      requirements: requirements,
	      priority: priority,
	      groups: [priority],
	      isDomConstraint: isDomConstraint || ParsleyUtils.attr(parsleyField.$element, parsleyField.options.namespace, name)
	    });
	  };
	
	  var ParsleyField = function ParsleyField(field, OptionsFactory, parsleyFormInstance) {
	    this.__class__ = 'ParsleyField';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.$element = $(field);
	    // If we have a parent `ParsleyForm` instance given, use its `OptionsFactory`, and save parent
	    if ('undefined' !== typeof parsleyFormInstance) {
	      this.parent = parsleyFormInstance;
	      this.OptionsFactory = this.parent.OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	      // Else, take the `Parsley` one
	    } else {
	      this.OptionsFactory = OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	    }
	    // Initialize some properties
	    this.constraints = [];
	    this.constraintsByName = {};
	    this.validationResult = [];
	    // Bind constraints
	    this._bindConstraints();
	  };
	  ParsleyField.prototype = {
	    // # Public API
	    // Validate field and $.emit some events for mainly `ParsleyUI`
	    // @returns validationResult:
	    //  - `true` if all constraints pass
	    //  - `[]` if not required field and empty (not validated)
	    //  - `[Violation, [Violation...]]` if there were validation errors
	    validate: function validate(force) {
	      this.value = this.getValue();
	      // Field Validate event. `this.value` could be altered for custom needs
	      $.emit('parsley:field:validate', this);
	      $.emit('parsley:field:' + (this.isValid(force, this.value) ? 'success' : 'error'), this);
	      // Field validated event. `this.validationResult` could be altered for custom needs too
	      $.emit('parsley:field:validated', this);
	      return this.validationResult;
	    },
	    // Just validate field. Do not trigger any event
	    // Same @return as `validate()`
	    isValid: function isValid(force, value) {
	      // Recompute options and rebind constraints to have latest changes
	      this.refreshConstraints();
	      // Sort priorities to validate more important first
	      var priorities = this._getConstraintsSortedPriorities();
	      if (0 === priorities.length) return this.validationResult = [];
	      // Value could be passed as argument, needed to add more power to 'parsley:field:validate'
	      if ('undefined' === typeof value || null === value) value = this.getValue();
	      // If a field is empty and not required, leave it alone, it's just fine
	      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
	      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty && true !== force) return this.validationResult = [];
	      // If we want to validate field against all constraints, just call Validator and let it do the job
	      if (false === this.options.priorityEnabled) return true === (this.validationResult = this.validateThroughValidator(value, this.constraints, 'Any'));
	      // Else, iterate over priorities one by one, and validate related asserts one by one
	      for (var i = 0; i < priorities.length; i++) if (true !== (this.validationResult = this.validateThroughValidator(value, this.constraints, priorities[i]))) return false;
	      return true;
	    },
	    // @returns Parsley field computed value that could be overrided or configured in DOM
	    getValue: function getValue() {
	      var value;
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();
	      // Handle wrong DOM or configurations
	      if ('undefined' === typeof value || null === value) return '';
	      // Use `data-parsley-trim-value="true"` to auto trim inputs entry
	      if (true === this.options.trimValue) return value.replace(/^\s+|\s+$/g, '');
	      return value;
	    },
	    // Actualize options that could have change since previous validation
	    // Re-bind accordingly constraints (could be some new, removed or updated)
	    refreshConstraints: function refreshConstraints() {
	      return this.actualizeOptions()._bindConstraints();
	    },
	    /**
	    * Add a new constraint to a field
	    *
	    * @method addConstraint
	    * @param {String}   name
	    * @param {Mixed}    requirements      optional
	    * @param {Number}   priority          optional
	    * @param {Boolean}  isDomConstraint   optional
	    */
	    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {
	      name = name.toLowerCase();
	      if ('function' === typeof window.ParsleyValidator.validators[name]) {
	        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);
	        // if constraint already exist, delete it and push new version
	        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);
	        this.constraints.push(constraint);
	        this.constraintsByName[constraint.name] = constraint;
	      }
	      return this;
	    },
	    // Remove a constraint
	    removeConstraint: function removeConstraint(name) {
	      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
	        this.constraints.splice(i, 1);
	        break;
	      }
	      delete this.constraintsByName[name];
	      return this;
	    },
	    // Update a constraint (Remove + re-add)
	    updateConstraint: function updateConstraint(name, parameters, priority) {
	      return this.removeConstraint(name).addConstraint(name, parameters, priority);
	    },
	    // # Internals
	    // Internal only.
	    // Bind constraints from config + options + DOM
	    _bindConstraints: function _bindConstraints() {
	      var constraints = [],
	          constraintsByName = {};
	      // clean all existing DOM constraints to only keep javascript user constraints
	      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
	        constraints.push(this.constraints[i]);
	        constraintsByName[this.constraints[i].name] = this.constraints[i];
	      }
	      this.constraints = constraints;
	      this.constraintsByName = constraintsByName;
	      // then re-add Parsley DOM-API constraints
	      for (var name in this.options) this.addConstraint(name, this.options[name]);
	      // finally, bind special HTML5 constraints
	      return this._bindHtml5Constraints();
	    },
	    // Internal only.
	    // Bind specific HTML5 constraints to be HTML5 compliant
	    _bindHtml5Constraints: function _bindHtml5Constraints() {
	      // html5 required
	      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);
	      // html5 pattern
	      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);
	      // range
	      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);
	      // HTML5 min
	      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);
	      // HTML5 max
	      else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);
	
	      // length
	      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);
	      // HTML5 minlength
	      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);
	      // HTML5 maxlength
	      else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);
	
	      // html5 types
	      var type = this.$element.attr('type');
	      if ('undefined' === typeof type) return this;
	      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
	      if ('number' === type) {
	        if ('undefined' === typeof this.$element.attr('step') || 0 === parseFloat(this.$element.attr('step')) % 1) {
	          return this.addConstraint('type', 'integer', undefined, true);
	        } else {
	          return this.addConstraint('type', 'number', undefined, true);
	        }
	        // Regular other HTML5 supported types
	      } else if (new RegExp(type, 'i').test('email url range')) {
	        return this.addConstraint('type', type, undefined, true);
	      }
	      return this;
	    },
	    // Internal only.
	    // Field is required if have required constraint without `false` value
	    _isRequired: function _isRequired() {
	      if ('undefined' === typeof this.constraintsByName.required) return false;
	      return false !== this.constraintsByName.required.requirements;
	    },
	    // Internal only.
	    // Sort constraints by priority DESC
	    _getConstraintsSortedPriorities: function _getConstraintsSortedPriorities() {
	      var priorities = [];
	      // Create array unique of priorities
	      for (var i = 0; i < this.constraints.length; i++) if (-1 === priorities.indexOf(this.constraints[i].priority)) priorities.push(this.constraints[i].priority);
	      // Sort them by priority DESC
	      priorities.sort(function (a, b) {
	        return b - a;
	      });
	      return priorities;
	    }
	  };
	
	  var ParsleyMultiple = function ParsleyMultiple() {
	    this.__class__ = 'ParsleyFieldMultiple';
	  };
	  ParsleyMultiple.prototype = {
	    // Add new `$element` sibling for multiple field
	    addElement: function addElement($element) {
	      this.$elements.push($element);
	      return this;
	    },
	    // See `ParsleyField.refreshConstraints()`
	    refreshConstraints: function refreshConstraints() {
	      var fieldConstraints;
	      this.constraints = [];
	      // Select multiple special treatment
	      if (this.$element.is('select')) {
	        this.actualizeOptions()._bindConstraints();
	        return this;
	      }
	      // Gather all constraints for each input in the multiple group
	      for (var i = 0; i < this.$elements.length; i++) {
	        // Check if element have not been dynamically removed since last binding
	        if (!$('html').has(this.$elements[i]).length) {
	          this.$elements.splice(i, 1);
	          continue;
	        }
	        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;
	        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
	      }
	      return this;
	    },
	    // See `ParsleyField.getValue()`
	    getValue: function getValue() {
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) return this.options.value;
	      // Radio input case
	      if (this.$element.is('input[type=radio]')) return $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').val() || '';
	      // checkbox input case
	      if (this.$element.is('input[type=checkbox]')) {
	        var values = [];
	        $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').each(function () {
	          values.push($(this).val());
	        });
	        return values.length ? values : [];
	      }
	      // Select multiple case
	      if (this.$element.is('select') && null === this.$element.val()) return [];
	      // Default case that should never happen
	      return this.$element.val();
	    },
	    _init: function _init(multiple) {
	      this.$elements = [this.$element];
	      this.options.multiple = multiple;
	      return this;
	    }
	  };
	
	  var o = $({}),
	      subscribed = {};
	  // $.listen(name, callback);
	  // $.listen(name, context, callback);
	  $.listen = function (name) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if ('function' === typeof arguments[1]) return subscribed[name].push({ fn: arguments[1] });
	    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) return subscribed[name].push({ fn: arguments[2], ctxt: arguments[1] });
	    throw new Error('Wrong parameters');
	  };
	  $.listenTo = function (instance, name, fn) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');
	    subscribed[name].push({ instance: instance, fn: fn });
	  };
	  $.unsubscribe = function (name, fn) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
	    for (var i = 0; i < subscribed[name].length; i++) if (subscribed[name][i].fn === fn) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeTo = function (instance, name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    for (var i = 0; i < subscribed[name].length; i++) if ('undefined' !== typeof subscribed[name][i].instance && subscribed[name][i].instance.__id__ === instance.__id__) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeAll = function (name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    delete subscribed[name];
	  };
	  // $.emit(name [, arguments...]);
	  // $.emit(name, instance [, arguments...]);
	  $.emit = function (name, instance) {
	    if ('undefined' === typeof subscribed[name]) return;
	    // loop through registered callbacks for this event
	    for (var i = 0; i < subscribed[name].length; i++) {
	      // if instance is not registered, simple emit
	      if ('undefined' === typeof subscribed[name][i].instance) {
	        subscribed[name][i].fn.apply('undefined' !== typeof subscribed[name][i].ctxt ? subscribed[name][i].ctxt : o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if instance registered but no instance given for the emit, continue
	      if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) continue;
	      // if instance is registered and same id, emit
	      if (subscribed[name][i].instance.__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if registered instance is a Form and fired one is a Field, loop over all its fields and emit if field found
	      if (subscribed[name][i].instance instanceof ParsleyForm && instance instanceof ParsleyField) for (var j = 0; j < subscribed[name][i].instance.fields.length; j++) if (subscribed[name][i].instance.fields[j].__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	    }
	  };
	  $.subscribed = function () {
	    return subscribed;
	  };
	
	  // ParsleyConfig definition if not already set
	  window.ParsleyConfig = window.ParsleyConfig || {};
	  window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};
	  // Define then the messages
	  window.ParsleyConfig.i18n.en = $.extend(window.ParsleyConfig.i18n.en || {}, {
	    defaultMessage: 'This value seems to be invalid.',
	    type: {
	      email: 'This value should be a valid email.',
	      url: 'This value should be a valid url.',
	      number: 'This value should be a valid number.',
	      integer: 'This value should be a valid integer.',
	      digits: 'This value should be digits.',
	      alphanum: 'This value should be alphanumeric.'
	    },
	    notblank: 'This value should not be blank.',
	    required: 'This value is required.',
	    pattern: 'This value seems to be invalid.',
	    min: 'This value should be greater than or equal to %s.',
	    max: 'This value should be lower than or equal to %s.',
	    range: 'This value should be between %s and %s.',
	    minlength: 'This value is too short. It should have %s characters or more.',
	    maxlength: 'This value is too long. It should have %s characters or fewer.',
	    length: 'This value length is invalid. It should be between %s and %s characters long.',
	    mincheck: 'You must select at least %s choices.',
	    maxcheck: 'You must select %s choices or fewer.',
	    check: 'You must select between %s and %s choices.',
	    equalto: 'This value should be the same.'
	  });
	  // If file is loaded after Parsley main file, auto-load locale
	  if ('undefined' !== typeof window.ParsleyValidator) window.ParsleyValidator.addCatalog('en', window.ParsleyConfig.i18n.en, true);
	
	  //     Parsley.js 2.0.6
	  //     http://parsleyjs.org
	  //     (c) 20012-2014 Guillaume Potier, Wisembly
	  //     Parsley may be freely distributed under the MIT license.
	
	  // ### Parsley factory
	  var Parsley = function Parsley(element, options, parsleyFormInstance) {
	    this.__class__ = 'Parsley';
	    this.__version__ = '2.0.6';
	    this.__id__ = ParsleyUtils.hash(4);
	    // Parsley must be instantiated with a DOM element or jQuery $element
	    if ('undefined' === typeof element) throw new Error('You must give an element');
	    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');
	    return this.init($(element), options, parsleyFormInstance);
	  };
	  Parsley.prototype = {
	    init: function init($element, options, parsleyFormInstance) {
	      if (!$element.length) throw new Error('You must bind Parsley on an existing element.');
	      this.$element = $element;
	      // If element have already been binded, returns its saved Parsley instance
	      if (this.$element.data('Parsley')) {
	        var savedparsleyFormInstance = this.$element.data('Parsley');
	        // If saved instance have been binded without a ParsleyForm parent and there is one given in this call, add it
	        if ('undefined' !== typeof parsleyFormInstance) savedparsleyFormInstance.parent = parsleyFormInstance;
	        return savedparsleyFormInstance;
	      }
	      // Handle 'static' options
	      this.OptionsFactory = new ParsleyOptionsFactory(ParsleyDefaults, ParsleyUtils.get(window, 'ParsleyConfig') || {}, options, this.getNamespace(options));
	      this.options = this.OptionsFactory.get(this);
	      // A ParsleyForm instance is obviously a `<form>` elem but also every node that is not an input and have `data-parsley-validate` attribute
	      if (this.$element.is('form') || ParsleyUtils.attr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');
	      // Every other supported element and not excluded element is binded as a `ParsleyField` or `ParsleyFieldMultiple`
	      else if (this.$element.is(this.options.inputs) && !this.$element.is(this.options.excluded)) return this.isMultiple() ? this.handleMultiple(parsleyFormInstance) : this.bind('parsleyField', parsleyFormInstance);
	      return this;
	    },
	    isMultiple: function isMultiple() {
	      return this.$element.is('input[type=radio], input[type=checkbox]') && 'undefined' === typeof this.options.multiple || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
	    },
	    // Multiples fields are a real nightmare :(
	    // Maybe some refacto would be appreciated here...
	    handleMultiple: function handleMultiple(parsleyFormInstance) {
	      var that = this,
	          name,
	          multiple,
	          parsleyMultipleInstance;
	      // Get parsleyFormInstance options if exist, mixed with element attributes
	      this.options = $.extend(this.options, parsleyFormInstance ? parsleyFormInstance.OptionsFactory.get(parsleyFormInstance) : {}, ParsleyUtils.attr(this.$element, this.options.namespace));
	      // Handle multiple name
	      if (this.options.multiple) multiple = this.options.multiple;else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) multiple = this.$element.attr('id');
	      // Special select multiple input
	      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
	        return this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple || this.__id__);
	        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
	      } else if ('undefined' === typeof multiple) {
	        if (window.console && window.console.warn) window.console.warn('To be binded by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
	        return this;
	      }
	      // Remove special chars
	      multiple = multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');
	      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
	      if ('undefined' !== typeof name) {
	        $('input[name="' + name + '"]').each(function () {
	          if ($(this).is('input[type=radio], input[type=checkbox]')) $(this).attr(that.options.namespace + 'multiple', multiple);
	        });
	      }
	      // Check here if we don't already have a related multiple instance saved
	      if ($('[' + this.options.namespace + 'multiple=' + multiple + ']').length) {
	        for (var i = 0; i < $('[' + this.options.namespace + 'multiple=' + multiple + ']').length; i++) {
	          if ('undefined' !== typeof $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley')) {
	            parsleyMultipleInstance = $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley');
	            if (!this.$element.data('ParsleyFieldMultiple')) {
	              parsleyMultipleInstance.addElement(this.$element);
	              this.$element.attr(this.options.namespace + 'id', parsleyMultipleInstance.__id__);
	            }
	            break;
	          }
	        }
	      }
	      // Create a secret ParsleyField instance for every multiple field. It would be stored in `data('ParsleyFieldMultiple')`
	      // And would be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
	      this.bind('parsleyField', parsleyFormInstance, multiple, true);
	      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple);
	    },
	    // Retrieve namespace used for DOM-API
	    getNamespace: function getNamespace(options) {
	      // `data-parsley-namespace=<namespace>`
	      if ('undefined' !== typeof this.$element.data('parsleyNamespace')) return this.$element.data('parsleyNamespace');
	      if ('undefined' !== typeof ParsleyUtils.get(options, 'namespace')) return options.namespace;
	      if ('undefined' !== typeof ParsleyUtils.get(window, 'ParsleyConfig.namespace')) return window.ParsleyConfig.namespace;
	      return ParsleyDefaults.namespace;
	    },
	    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	    bind: function bind(type, parentParsleyFormInstance, multiple, doNotStore) {
	      var parsleyInstance;
	      switch (type) {
	        case 'parsleyForm':
	          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.OptionsFactory), new ParsleyAbstract(), window.ParsleyExtend)._bindFields();
	          break;
	        case 'parsleyField':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), window.ParsleyExtend);
	          break;
	        case 'parsleyFieldMultiple':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), new ParsleyMultiple(), window.ParsleyExtend)._init(multiple);
	          break;
	        default:
	          throw new Error(type + 'is not a supported Parsley type');
	      }
	      if ('undefined' !== typeof multiple) ParsleyUtils.setAttr(this.$element, this.options.namespace, 'multiple', multiple);
	      if ('undefined' !== typeof doNotStore) {
	        this.$element.data('ParsleyFieldMultiple', parsleyInstance);
	        return parsleyInstance;
	      }
	      // Store instance if `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	      if (new RegExp('ParsleyF', 'i').test(parsleyInstance.__class__)) {
	        // Store for later access the freshly binded instance in DOM element itself using jQuery `data()`
	        this.$element.data('Parsley', parsleyInstance);
	        // Tell the world we got a new ParsleyForm or ParsleyField instance!
	        $.emit('parsley:' + ('parsleyForm' === type ? 'form' : 'field') + ':init', parsleyInstance);
	      }
	      return parsleyInstance;
	    }
	  };
	  // ### jQuery API
	  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
	  $.fn.parsley = $.fn.psly = function (options) {
	    if (this.length > 1) {
	      var instances = [];
	      this.each(function () {
	        instances.push($(this).parsley(options));
	      });
	      return instances;
	    }
	    // Return undefined if applied to non existing DOM element
	    if (!$(this).length) {
	      if (window.console && window.console.warn) window.console.warn('You must bind Parsley on an existing element.');
	      return;
	    }
	    return new Parsley(this, options);
	  };
	  // ### ParsleyUI
	  // UI is a class apart that only listen to some events and them modify DOM accordingly
	  // Could be overriden by defining a `window.ParsleyConfig.ParsleyUI` appropriate class (with `listen()` method basically)
	  window.ParsleyUI = 'function' === typeof ParsleyUtils.get(window, 'ParsleyConfig.ParsleyUI') ? new window.ParsleyConfig.ParsleyUI().listen() : new ParsleyUI().listen();
	  // ### ParsleyField and ParsleyForm extension
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};
	  // ### ParsleyConfig
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyConfig) window.ParsleyConfig = {};
	  // ### Globals
	  window.Parsley = window.psly = Parsley;
	  window.ParsleyUtils = ParsleyUtils;
	  window.ParsleyValidator = new ParsleyValidator(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
	  // ### PARSLEY auto-binding
	  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
	  if (false !== ParsleyUtils.get(window, 'ParsleyConfig.autoBind')) $(function () {
	    // Works only on `data-parsley-validate`.
	    if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
	  });
	});

/***/ },

/***/ 121:
/***/ function(module, exports, __webpack_require__) {

	var jQuery = __webpack_require__(1);
	__webpack_require__(122);
	__webpack_require__(123);
	__webpack_require__(124);
	
	/*!
=======
!function(e){function t(i){if(n[i])return n[i].exports;var a=n[i]={exports:{},id:i,loaded:!1};return e[i].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}({0:function(e,t,n){n(1),n(8),e.exports=n(119)},1:function(e,t,n){(function(e){"use strict";function i(){var t=function(t){e("#login_form").find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},n=function(e){window.location.reload()};p.FormInitialize(e("#login_form"),t,n,null,"#loginSubmitButton")}function a(t){var n=e("#reset_password_form");p.parsleyfyForm(n);var i=function(e){n.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},a=function(e,t){n.find(".invalid-form-error-message").html("Email Sent!").addClass("filled")};t&&p.FormInitialize(n,i,a,"text","#resetButton")}function r(){e("#id_phone_number").intlTelInput({defaultCountry:"ng",onlyCountries:["ng"],utilsScript:"/static/js/utils.js"})}function s(e){var t=e.intlTelInput("getSelectedCountryData").dialCode,n=e.intlTelInput("isValidNumber");return n===!1?"+"+t+e.val():e.val()}function o(t,n){function i(t){var n=e("#signup_form"),i=e("#phone_no"),s=e("#pass_group"),l=e("#phone_container"),u=e("#password_container"),c=e("#submit_btn");t?(n.attr("action",f["users:mailing_signup"]()),i.length>0&&(a=i.remove()),s.length>0&&(o=s.remove()),e("#signup_header_text").removeClass("hidden").addClass("hidden"),e("#maillist_header_text").removeClass("hidden"),c.text("Subscribe"),e(".last.agree-to").addClass("hidden")):(n.attr("action",f.account_signup()),a&&(l.append(a),r(),a=null),o&&(u.append(o),o=null),e("#maillist_header_text").removeClass("hidden").addClass("hidden"),e("#signup_header_text").removeClass("hidden"),c.text("Join Now"),e(".last.agree-to").removeClass("hidden"))}var a,o,l=e("#signup_form"),u=e("#id_country");r();var c=!!window.operamini;c||p.parsleyfyForm(l),t&&("NG"==u.find(":selected").val()?i():i(!0));var d=function(n){var i=n.attr("action");if(n.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken")),t&&i===f.account_signup()){var a=e("#id_phone_number");a.val(s(a))}},h=function(e){var t=this.url;t===f["users:mailing_signup"]()?window.location.href=e.location:n&&n(e)},m=function(t,n){var i=t.responseJSON.form_errors,a=e("#errorMessage");a.empty();for(var r in i)e("#errorMessage").append('<p class="text-danger">'+i[r][0]+"</p>")};c||p.formSubmission(l,d,h,m,null,"#submit_btn"),u.change(function(){var t=e(this).find("option:selected");"NG"===t.val()?i():i(!0)})}function l(){e("#authModal").on("show.bs.modal",function(t){function n(){o.removeClass("hidden"),h.removeClass("hidden"),l.addClass("hidden"),p.addClass("hidden"),u.addClass("hidden"),m.addClass("hidden"),c.text("Log in to Tuteria"),e(".invalid-form-error-message").empty(),d.text("Enter your email and password to access your account")}function i(){l.removeClass("hidden"),p.removeClass("hidden"),o.addClass("hidden"),h.addClass("hidden"),u.addClass("hidden"),m.addClass("hidden"),c.text("WELCOME HOME"),e(".invalid-form-error-message").empty(),d.html('<a href="'+f.account_signup()+'">Join</a> Tuteria to connect with quality tutors and clients')}function a(){l.addClass("hidden"),p.addClass("hidden"),o.addClass("hidden"),h.addClass("hidden"),u.removeClass("hidden"),m.removeClass("hidden"),c.text("Reset Password"),e(".invalid-form-error-message").empty(),d.text("Enter your email address to reset your password")}var r=e(t.relatedTarget)[0].id,s=e(this),o=s.find("#login_modal"),l=s.find("#signup_modal"),u=s.find("#reset_modal"),c=s.find("h2.modal-title"),d=s.find("p.modal-subheader"),h=s.find(".login_footer"),p=s.find(".signup_footer"),m=s.find(".reset_footer"),g=s.find(".password_link");"login_nav"===r&&n(),"signup_nav"===r&&i(),h.find("a").on("click",function(){i()}),p.find("a").on("click",function(){n()}),m.find("a").on("click",function(){n()}),g.on("click",function(e){e.preventDefault(),a()})})}function u(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#nav-skill-input"),"name","name",t,function(t,n,i){var a=n.name.split(" in ")[0].trim();e(this).typeahead("val",a),e("form[name='search-form']").submit()}),e('form[name="search-form"]').parsley()}function c(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#mobile_skill_input"),"name","name",t,function(t,n,i){var a=n.name.split(" in ")[0].trim();e(this).typeahead("val",a),e("#mobile-nav-search-form").submit()}),e("#mobile-nav-search-form").parsley()}function d(t,n,r,s){e("#nav-skill-input").blur(),e(".navdropdown.dropdown").hover(function(){e(".dropdown-toggle",this).trigger("click")});var d=(g.DetectBlackBerryHigh(),g.DetectBlackBerryLow(),!!window.operamini);d||(e("#mobile-navigation").find("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#mobile_login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e.each(e(".signup_nav"),function(t,n){e(n).attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal")})),e(".top-search input").blur(),u(),c(),l(),o(e("#id_phone_number"),n),i(),a(!0),h()}function h(){e(".toggle_invite_section").click(function(t){e("#prelaunch_section").addClass("hidden")}),e(".invite_friends_btn").click(function(t){e("#prelaunch_section").addClass("hidden"),e("#invite_counter_section").removeClass("collapse").removeClass("fade"),window.location.hash="#launch_sec"}),e(".share-popup").click(function(t){t.preventDefault();var n="",i=this.href,a=i.split("/")[2];switch(a){case"www.facebook.com":e.get(f.button_clicks()+"?button_type=facebook",function(){}),n="width=585,height=368";break;case"twitter.com":e.get(f.button_clicks()+"?button_type=twitter",function(){}),n="width=585,height=261";break;case"plus.google.com":e.get(f.button_clicks()+"?button_type=google",function(){}),n="width=517,height=511";break;default:n="width=585,height=511"}return window.open(i,"","menubar=no,toolbar=no,resizable=yes,scrollbars=yes,"+n),!1})}var p=n(3),f=n(5);n(6);var m=n(7),g=m.MobileEsp;t.AuthModal=l,t.LoginInitialize=i,t.SignUp=o,t.ResetInitialize=a,t.phone_value=s,t.intelInput=r,t.Authenticate=d,t.ShareButtonCounter=h}).call(t,n(2))},2:function(e,t,n){e.exports=jQuery},3:function(e,t,n){(function(e){"use strict";function i(e,t,n){var i={datumTokenizer:b.tokenizers.obj.whitespace(e),queryTokenizer:b.tokenizers.whitespace,limit:10,prefetch:t};return n&&(i.remote=n),new b(i)}function a(e,t){return new b({datumTokenizer:function(e){return b.tokenizers.whitespace(e.name)},queryTokenizer:b.tokenizers.whitespace,prefetch:t()})}function r(e,t){return new b({datumTokenizer:b.tokenizers.obj.whitespace(e),queryTokenizer:b.tokenizers.whitespace,local:t()})}function s(t,n,i){var a=t.value.replace(/{.*}/g,"").length,r=100*a,s=r/n;if(a>n){var o=a-n;t.value=t.value.substring(0,t.value.length-o)}else i.text(n-a),e("#percent").text(s+"%")}function o(t,n,i,a,r){u(t);var s=function(t,n){if(400===t.status){var i=JSON.parse(t.responseText).form_errors;e(".invalid-form-error-message").html(i.__all__[0]).addClass("filled")}};c(t,n,i,s,a,r)}function l(){window.ParsleyExtend={asyncValidators:{validate_email:{fn:function(e){return 404===e.status},url:D["users:validate_email"]()},validate_duplicate_number:{fn:function(e){return 404===e.status},url:D["users:check_duplicate_number"]()},validate_changed_number:{fn:function(e){return 404===e.status},url:D["users:user_phone_verifcation_process"]()}}},window.ParsleyConfig={validators:{valid_phone:{fn:function(e){var t=e.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);return null!==t},priority:32},no_link:{fn:function(e){var t=new RegExp("(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)","i"),n=e.match(t);return null===n},priority:90},no_email:{fn:function(e){var t=new RegExp("([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})","i"),n=e.match(t);return null===n},priority:91},validate_time:{fn:function(e){var t=moment(e,"hh:mm: A");return t.isValid()},priority:96},same_phone_number:{fn:function(t){var n=e("#id_number").val();return n.replace(/\s/g,"")===t||n===t},priority:33},schedule_time:{fn:function(t,n){var i=moment(t,"hh:mm: A"),a=moment(e(n).val(),"hh:mm: A");return i.hours()>a.hours()}}},i18n:{en:{valid_phone:"Phone number is invalid. should be of the form +234 703 520 9576",same_phone_number:"Phone number is not the same",schedule_time:"End time must be greater than start time with at least an hour",no_link:"Links are not allowed.",validate_time:"Pls input a time in this format 6:00 AM",no_email:"Email addresses are not allowed in this field"}}}}function u(e,t){e.parsley(w)}function c(t,n,i,a,r,s){if(r)var o=r;else o="json";var l=a||function(e,t,n){};t.on("submit",function(t){t.preventDefault();var a=e(this);if(a.parsley().validate(),a.parsley().isValid()){if(n(a),s)var r=e(s).button("loading");e.ajax({url:a.attr("action"),type:a.attr("method"),dataType:o,data:a.serialize(),success:i,error:function(e,t){s&&r.button("reset"),l(e,t)}})}})}function d(e,t,n){return{name:e,displayKey:t,source:n.ttAdapter()}}function h(e,t,n,i,a){var r={hint:!0,highlight:!0,minLength:2};e.typeahead(r,d(t,n,i)).on("typeahead:selected",a)}function p(t,n){var a=n||function(){},r=i("name",D.ajax_skills_all(),D.ajax_tags_all("%QUERY"));r.initialize(),h(t,"name","name",r,function(t,n,i){var r=n.name.split(" in ")[0].trim();e(this).typeahead("val",r),a()})}function f(t,n){var a=i("name",D.ajax_skills_all(),D.ajax_tags_all("%QUERY"));a.initialize(),h(t,"name","name",a,function(t,i,a){var r=i.name.split(" in ")[0].trim();e(this).typeahead("val",r),n.submit()}),n.parsley()}function m(e,t,n){var i=function(){var n={types:["address"],componentRestrictions:{country:"ng"}},i=new google.maps.places.Autocomplete(e[0],n),a=function(){t(i)};google.maps.event.addListener(i,"place_changed",a)};google.maps.event.addDomListener(window,"load",i)}function g(t){var n=null;if(document.cookie&&""!=document.cookie)for(var i=document.cookie.split(";"),a=0;a<i.length;a++){var r=e.trim(i[a]);if(r.substring(0,t.length+1)==t+"="){n=decodeURIComponent(r.substring(t.length+1));break}}return"csrftoken"==t&&null==n?e('input[name="csrfmiddlewaretoken"]').val():n}function _(e){return/^(GET|HEAD|OPTIONS|TRACE)$/.test(e)}function v(e,t,n){var i=n||2;e.length>=i&&t.addClass("hide"),e.find(".delete-row").addClass("hide")}function y(){e.ajaxSetup({beforeSend:function(e,t){_(t.type)||this.crossDomain||e.setRequestHeader("X-CSRFToken",g("csrftoken"))}})}var b=n(4),D=n(5),w={successClass:"has-success",errorClass:"has-error",classHandler:function(e){return e.$element.closest(".form-group")},errorsContainer:function(e){return e.$element.closest(".form-group")},errorsWrapper:"<span class='help-block'></span>",errorTemplate:"<span></span>"};t.FormInitialize=o,t.parsleyfyForm=u,t.formSubmission=c,t.HideFormsetControl=v,t.getBloodhoundInstance=i,t.getBloodhoundInstanceT=a,t.getBloodhoundInstanceT2=r,t.filterOptionByText=function(t,n){return t.find("option").filter(function(){return e(this).html()==n})},t.ApplyTypeaheadToInput=h,t.SkillAutoComplete=p,t.GoogleAutoComplete=m,t.GenericSkillSearchAutocomplete=f,t.parsleyConfig=w,t.keyupCallback=s,t.ParsleyConfig=l,t.getCookie=g,t.csrfSafeMethod=_,t.appendCSRFTOKEN=y}).call(t,n(2))},4:function(e,t,n){e.exports=Bloodhound},5:function(e,t,n){e.exports=Urls},6:function(e,t,n){var i,a;!function(r){i=[n(2)],a=function(e){r(e,window,document)}.apply(t,i),!(void 0!==a&&(e.exports=a))}(function(e,t,n,i){"use strict";function a(t,n){this.element=t,this.options=e.extend({},o,n),this._defaults=o,this.ns="."+r+s++,this.isGoodBrowser=Boolean(t.setSelectionRange),this.hadInitialPlaceholder=Boolean(e(t).attr("placeholder")),this._name=r,this.init()}var r="intlTelInput",s=1,o={autoFormat:!0,autoHideDialCode:!0,defaultCountry:"",ipinfoToken:"",nationalMode:!1,numberType:"MOBILE",onlyCountries:[],preferredCountries:["us","gb"],responsiveDropdown:!1,utilsScript:""},l={UP:38,DOWN:40,ENTER:13,ESC:27,PLUS:43,A:65,Z:90,ZERO:48,NINE:57,SPACE:32,BSPACE:8,DEL:46,CTRL:17,CMD1:91,CMD2:224},u=!1;e(t).load(function(){u=!0}),a.prototype={init:function(){var t=this;if("auto"==this.options.defaultCountry){this.options.defaultCountry="";var n="//ipinfo.io";this.options.ipinfoToken&&(n+="?token="+this.options.ipinfoToken),e.get(n,function(e){e&&e.country&&(t.options.defaultCountry=e.country.toLowerCase())},"jsonp").always(function(){t._ready()})}else this._ready()},_ready:function(){this.options.nationalMode&&(this.options.autoHideDialCode=!1),navigator.userAgent.match(/IEMobile/i)&&(this.options.autoFormat=!1),t.innerWidth<500&&(this.options.responsiveDropdown=!0),this._processCountryData(),this._generateMarkup(),this._setInitialState(),this._initListeners()},_processCountryData:function(){this._setInstanceCountryData(),this._setPreferredCountries()},_addCountryCode:function(e,t,n){t in this.countryCodes||(this.countryCodes[t]=[]);var i=n||0;this.countryCodes[t][i]=e},_setInstanceCountryData:function(){var t;if(this.options.onlyCountries.length)for(this.countries=[],t=0;t<c.length;t++)-1!=e.inArray(c[t].iso2,this.options.onlyCountries)&&this.countries.push(c[t]);else this.countries=c;for(this.countryCodes={},t=0;t<this.countries.length;t++){var n=this.countries[t];if(this._addCountryCode(n.iso2,n.dialCode,n.priority),n.areaCodes)for(var i=0;i<n.areaCodes.length;i++)this._addCountryCode(n.iso2,n.dialCode+n.areaCodes[i])}},_setPreferredCountries:function(){this.preferredCountries=[];for(var e=0;e<this.options.preferredCountries.length;e++){var t=this.options.preferredCountries[e],n=this._getCountryData(t,!1,!0);n&&this.preferredCountries.push(n)}},_generateMarkup:function(){this.telInput=e(this.element),this.telInput.wrap(e("<div>",{"class":"intl-tel-input"}));var t=e("<div>",{"class":"flag-dropdown"}).insertAfter(this.telInput),n=e("<div>",{"class":"selected-flag"}).appendTo(t);this.selectedFlagInner=e("<div>",{"class":"flag"}).appendTo(n),e("<div>",{"class":"arrow"}).appendTo(this.selectedFlagInner),this.countryList=e("<ul>",{"class":"country-list v-hide"}).appendTo(t),this.preferredCountries.length&&(this._appendListItems(this.preferredCountries,"preferred"),e("<li>",{"class":"divider"}).appendTo(this.countryList)),this._appendListItems(this.countries,""),this.dropdownHeight=this.countryList.outerHeight(),this.countryList.removeClass("v-hide").addClass("hide"),this.options.responsiveDropdown&&this.countryList.outerWidth(this.telInput.outerWidth()),this.countryListItems=this.countryList.children(".country")},_appendListItems:function(e,t){for(var n="",i=0;i<e.length;i++){var a=e[i];n+="<li class='country "+t+"' data-dial-code='"+a.dialCode+"' data-country-code='"+a.iso2+"'>",n+="<div class='flag "+a.iso2+"'></div>",n+="<span class='country-name'>"+a.name+"</span>",n+="<span class='dial-code'>+"+a.dialCode+"</span>",n+="</li>"}this.countryList.append(n)},_setInitialState:function(){var e=this.telInput.val();if(this._getDialCode(e))this._updateFlagFromNumber(e);else{var t;t=this.options.defaultCountry?this._getCountryData(this.options.defaultCountry,!1,!1):this.preferredCountries.length?this.preferredCountries[0]:this.countries[0],this._selectFlag(t.iso2),e||this._updateDialCode(t.dialCode,!1)}e&&this._updateVal(e,!1)},_initListeners:function(){var n=this;this._initKeyListeners(),(this.options.autoHideDialCode||this.options.autoFormat)&&this._initFocusListeners();var i=this.telInput.closest("label");i.length&&i.on("click"+this.ns,function(e){n.countryList.hasClass("hide")?n.telInput.focus():e.preventDefault()});var a=this.selectedFlagInner.parent();a.on("click"+this.ns,function(e){n.countryList.hasClass("hide")&&!n.telInput.prop("disabled")&&n._showDropdown()}),this.options.utilsScript&&(u?this.loadUtils():e(t).load(function(){n.loadUtils()}))},_initKeyListeners:function(){var e=this;this.options.autoFormat&&this.telInput.on("keypress"+this.ns,function(n){if(n.which>=l.SPACE&&!n.metaKey&&t.intlTelInputUtils){n.preventDefault();var i=n.which>=l.ZERO&&n.which<=l.NINE||n.which==l.PLUS,a=e.telInput[0],r=e.isGoodBrowser&&a.selectionStart==a.selectionEnd,s=e.telInput.attr("maxlength"),o=s?e.telInput.val().length<s:!0;if(o&&(i||r)){var u=i?String.fromCharCode(n.which):null;e._handleInputKey(u,!0)}i||e.telInput.trigger("invalidkey")}}),this.telInput.on("keyup"+this.ns,function(n){if(n.which==l.ENTER);else if(e.options.autoFormat&&t.intlTelInputUtils){var i=n.which==l.CTRL||n.which==l.CMD1||n.which==l.CMD2,a=e.telInput[0],r=e.isGoodBrowser&&a.selectionStart==a.selectionEnd,s=e.isGoodBrowser&&a.selectionStart==e.telInput.val().length;if((n.which==l.DEL&&!s||n.which==l.BSPACE||i&&r)&&e._handleInputKey(null,i&&s),!e.options.nationalMode){var o=e.telInput.val();if("+"!=o.substr(0,1)){var u=e.isGoodBrowser?a.selectionStart+1:0;e.telInput.val("+"+o),e.isGoodBrowser&&a.setSelectionRange(u,u)}}}else e._updateFlagFromNumber(e.telInput.val())})},_handleInputKey:function(e,t){var n=this.telInput.val(),i=null,a=!1,r=this.telInput[0];if(this.isGoodBrowser){var s=r.selectionEnd,o=n.length;a=s==o,e?(n=n.substr(0,r.selectionStart)+e+n.substring(s,o),a||(i=s+(n.length-o))):i=r.selectionStart}else e&&(n+=e);this.setNumber(n,t),this.isGoodBrowser&&(a&&(i=this.telInput.val().length),r.setSelectionRange(i,i))},_initFocusListeners:function(){var e=this;this.options.autoHideDialCode&&this.telInput.on("mousedown"+this.ns,function(t){e.telInput.is(":focus")||e.telInput.val()||(t.preventDefault(),e.telInput.focus())}),this.telInput.on("focus"+this.ns,function(){var n=e.telInput.val();e.telInput.data("focusVal",n),e.options.autoHideDialCode&&(n||(e._updateVal("+"+e.selectedCountryData.dialCode,!0),e.telInput.one("keypress.plus"+e.ns,function(n){if(n.which==l.PLUS){var i=e.options.autoFormat&&t.intlTelInputUtils?"+":"";e.telInput.val(i)}}),setTimeout(function(){var t=e.telInput[0];if(e.isGoodBrowser){var n=e.telInput.val().length;t.setSelectionRange(n,n)}})))}),this.telInput.on("blur"+this.ns,function(){if(e.options.autoHideDialCode){var n=e.telInput.val(),i="+"==n.substr(0,1);if(i){var a=e._getNumeric(n);a&&e.selectedCountryData.dialCode!=a||e.telInput.val("")}e.telInput.off("keypress.plus"+e.ns)}e.options.autoFormat&&t.intlTelInputUtils&&e.telInput.val()!=e.telInput.data("focusVal")&&e.telInput.trigger("change")})},_getNumeric:function(e){return e.replace(/\D/g,"")},_showDropdown:function(){this._setDropdownPosition();var e=this.countryList.children(".active");this._highlightListItem(e),this.countryList.removeClass("hide"),this._scrollTo(e),this._bindDropdownListeners(),this.selectedFlagInner.children(".arrow").addClass("up")},_setDropdownPosition:function(){var n=this.telInput.offset().top,i=e(t).scrollTop(),a=n+this.telInput.outerHeight()+this.dropdownHeight<i+e(t).height(),r=n-this.dropdownHeight>i,s=!a&&r?"-"+(this.dropdownHeight-1)+"px":"";this.countryList.css("top",s)},_bindDropdownListeners:function(){var t=this;this.countryList.on("mouseover"+this.ns,".country",function(n){t._highlightListItem(e(this))}),this.countryList.on("click"+this.ns,".country",function(n){t._selectListItem(e(this))});var i=!0;e("html").on("click"+this.ns,function(e){i||t._closeDropdown(),i=!1});var a="",r=null;e(n).on("keydown"+this.ns,function(e){e.preventDefault(),e.which==l.UP||e.which==l.DOWN?t._handleUpDownKey(e.which):e.which==l.ENTER?t._handleEnterKey():e.which==l.ESC?t._closeDropdown():(e.which>=l.A&&e.which<=l.Z||e.which==l.SPACE)&&(r&&clearTimeout(r),a+=String.fromCharCode(e.which),t._searchForCountry(a),r=setTimeout(function(){a=""},1e3))})},_handleUpDownKey:function(e){var t=this.countryList.children(".highlight").first(),n=e==l.UP?t.prev():t.next();n.length&&(n.hasClass("divider")&&(n=e==l.UP?n.prev():n.next()),this._highlightListItem(n),this._scrollTo(n))},_handleEnterKey:function(){var e=this.countryList.children(".highlight").first();e.length&&this._selectListItem(e)},_searchForCountry:function(e){for(var t=0;t<this.countries.length;t++)if(this._startsWith(this.countries[t].name,e)){var n=this.countryList.children("[data-country-code="+this.countries[t].iso2+"]").not(".preferred");this._highlightListItem(n),this._scrollTo(n,!0);break}},_startsWith:function(e,t){return e.substr(0,t.length).toUpperCase()==t},_updateVal:function(e,n){var i;if(this.options.autoFormat&&t.intlTelInputUtils){i=intlTelInputUtils.formatNumber(e,this.selectedCountryData.iso2,n);var a=this.telInput.attr("maxlength");a&&i.length>a&&(i=i.substr(0,a))}else i=e;this.telInput.val(i)},_updateFlagFromNumber:function(e){this.options.nationalMode&&this.selectedCountryData&&"1"==this.selectedCountryData.dialCode&&"+"!=e.substr(0,1)&&(e="+1"+e);var t=this._getDialCode(e);if(t){var n=this.countryCodes[this._getNumeric(t)],i=!1;if(this.selectedCountryData)for(var a=0;a<n.length;a++)n[a]==this.selectedCountryData.iso2&&(i=!0);if(!i||this._isUnknownNanp(e,t))for(var r=0;r<n.length;r++)if(n[r]){this._selectFlag(n[r]);break}}},_isUnknownNanp:function(e,t){return"+1"==t&&this._getNumeric(e).length>=4},_highlightListItem:function(e){this.countryListItems.removeClass("highlight"),e.addClass("highlight")},_getCountryData:function(e,t,n){for(var i=t?c:this.countries,a=0;a<i.length;a++)if(i[a].iso2==e)return i[a];if(n)return null;throw new Error("No country data for '"+e+"'")},_selectFlag:function(e){this.selectedCountryData=this._getCountryData(e,!1,!1),this.selectedFlagInner.attr("class","flag "+e);var t=this.selectedCountryData.name+": +"+this.selectedCountryData.dialCode;this.selectedFlagInner.parent().attr("title",t),this._updatePlaceholder();var n=this.countryListItems.children(".flag."+e).first().parent();this.countryListItems.removeClass("active"),n.addClass("active")},_updatePlaceholder:function(){if(t.intlTelInputUtils&&!this.hadInitialPlaceholder){var e=this.selectedCountryData.iso2,n=intlTelInputUtils.numberType[this.options.numberType||"FIXED_LINE"],i=intlTelInputUtils.getExampleNumber(e,this.options.nationalMode,n);this.telInput.attr("placeholder",i)}},_selectListItem:function(e){var t=e.attr("data-country-code");this._selectFlag(t),this._closeDropdown(),this._updateDialCode(e.attr("data-dial-code"),!0),this.telInput.trigger("change"),this.telInput.focus()},_closeDropdown:function(){this.countryList.addClass("hide"),this.selectedFlagInner.children(".arrow").removeClass("up"),e(n).off(this.ns),e("html").off(this.ns),this.countryList.off(this.ns)},_scrollTo:function(e,t){var n=this.countryList,i=n.height(),a=n.offset().top,r=a+i,s=e.outerHeight(),o=e.offset().top,l=o+s,u=o-a+n.scrollTop(),c=i/2-s/2;if(a>o)t&&(u-=c),n.scrollTop(u);else if(l>r){t&&(u+=c);var d=i-s;n.scrollTop(u-d)}},_updateDialCode:function(t,n){var i,a=this.telInput.val();if(t="+"+t,this.options.nationalMode&&"+"!=a.substr(0,1))i=a;else if(a){var r=this._getDialCode(a);if(r.length>1)i=a.replace(r,t);else{var s="+"!=a.substr(0,1)?e.trim(a):"";i=t+s}}else i=!this.options.autoHideDialCode||n?t:"";this._updateVal(i,n)},_getDialCode:function(t){var n="";if("+"==t.charAt(0))for(var i="",a=0;a<t.length;a++){var r=t.charAt(a);if(e.isNumeric(r)&&(i+=r,this.countryCodes[i]&&(n=t.substr(0,a+1)),4==i.length))break}return n},destroy:function(){this._closeDropdown(),this.telInput.off(this.ns),this.selectedFlagInner.parent().off(this.ns),this.telInput.closest("label").off(this.ns);var e=this.telInput.parent();e.before(this.telInput).remove()},getCleanNumber:function(){return t.intlTelInputUtils?intlTelInputUtils.formatNumberE164(this.telInput.val(),this.selectedCountryData.iso2):""},getNumberType:function(){return t.intlTelInputUtils?intlTelInputUtils.getNumberType(this.telInput.val(),this.selectedCountryData.iso2):-99},getSelectedCountryData:function(){return this.selectedCountryData||{}},getValidationError:function(){return t.intlTelInputUtils?intlTelInputUtils.getValidationError(this.telInput.val(),this.selectedCountryData.iso2):-99},isValidNumber:function(){var n=e.trim(this.telInput.val()),i=this.options.nationalMode?this.selectedCountryData.iso2:"",a=/[a-zA-Z]/.test(n);return!a&&t.intlTelInputUtils?intlTelInputUtils.isValidNumber(n,i):!1},loadUtils:function(t){var n=t||this.options.utilsScript;!e.fn[r].loadedUtilsScript&&n&&(e.fn[r].loadedUtilsScript=!0,e.ajax({url:n,success:function(){e(".intl-tel-input input").intlTelInput("utilsLoaded")},dataType:"script",cache:!0}))},selectCountry:function(e){this.selectedFlagInner.hasClass(e)||(this._selectFlag(e),this._updateDialCode(this.selectedCountryData.dialCode,!1))},setNumber:function(e,t){this.options.nationalMode||"+"==e.substr(0,1)||(e="+"+e),this._updateFlagFromNumber(e),this._updateVal(e,t)},utilsLoaded:function(){this.options.autoFormat&&this.telInput.val()&&this._updateVal(this.telInput.val()),this._updatePlaceholder()}},e.fn[r]=function(t){var n=arguments;if(t===i||"object"==typeof t)return this.each(function(){e.data(this,"plugin_"+r)||e.data(this,"plugin_"+r,new a(this,t))});if("string"==typeof t&&"_"!==t[0]&&"init"!==t){var s;return this.each(function(){var i=e.data(this,"plugin_"+r);i instanceof a&&"function"==typeof i[t]&&(s=i[t].apply(i,Array.prototype.slice.call(n,1))),"destroy"===t&&e.data(this,"plugin_"+r,null)}),s!==i?s:this}},e.fn[r].getCountryData=function(){return c},e.fn[r].setCountryData=function(e){c=e};for(var c=[["Afghanistan (‫افغانستان‬‎)","af","93"],["Albania (Shqipëri)","al","355"],["Algeria (‫الجزائر‬‎)","dz","213"],["American Samoa","as","1684"],["Andorra","ad","376"],["Angola","ao","244"],["Anguilla","ai","1264"],["Antigua and Barbuda","ag","1268"],["Argentina","ar","54"],["Armenia (Հայաստան)","am","374"],["Aruba","aw","297"],["Australia","au","61"],["Austria (Österreich)","at","43"],["Azerbaijan (Azərbaycan)","az","994"],["Bahamas","bs","1242"],["Bahrain (‫البحرين‬‎)","bh","973"],["Bangladesh (বাংলাদেশ)","bd","880"],["Barbados","bb","1246"],["Belarus (Беларусь)","by","375"],["Belgium (België)","be","32"],["Belize","bz","501"],["Benin (Bénin)","bj","229"],["Bermuda","bm","1441"],["Bhutan (འབྲུག)","bt","975"],["Bolivia","bo","591"],["Bosnia and Herzegovina (Босна и Херцеговина)","ba","387"],["Botswana","bw","267"],["Brazil (Brasil)","br","55"],["British Indian Ocean Territory","io","246"],["British Virgin Islands","vg","1284"],["Brunei","bn","673"],["Bulgaria (България)","bg","359"],["Burkina Faso","bf","226"],["Burundi (Uburundi)","bi","257"],["Cambodia (កម្ពុជា)","kh","855"],["Cameroon (Cameroun)","cm","237"],["Canada","ca","1",1,["204","236","249","250","289","306","343","365","387","403","416","418","431","437","438","450","506","514","519","548","579","581","587","604","613","639","647","672","705","709","742","778","780","782","807","819","825","867","873","902","905"]],["Cape Verde (Kabu Verdi)","cv","238"],["Caribbean Netherlands","bq","599",1],["Cayman Islands","ky","1345"],["Central African Republic (République centrafricaine)","cf","236"],["Chad (Tchad)","td","235"],["Chile","cl","56"],["China (中国)","cn","86"],["Colombia","co","57"],["Comoros (‫جزر القمر‬‎)","km","269"],["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)","cd","243"],["Congo (Republic) (Congo-Brazzaville)","cg","242"],["Cook Islands","ck","682"],["Costa Rica","cr","506"],["Côte d’Ivoire","ci","225"],["Croatia (Hrvatska)","hr","385"],["Cuba","cu","53"],["Curaçao","cw","599",0],["Cyprus (Κύπρος)","cy","357"],["Czech Republic (Česká republika)","cz","420"],["Denmark (Danmark)","dk","45"],["Djibouti","dj","253"],["Dominica","dm","1767"],["Dominican Republic (República Dominicana)","do","1",2,["809","829","849"]],["Ecuador","ec","593"],["Egypt (‫مصر‬‎)","eg","20"],["El Salvador","sv","503"],["Equatorial Guinea (Guinea Ecuatorial)","gq","240"],["Eritrea","er","291"],["Estonia (Eesti)","ee","372"],["Ethiopia","et","251"],["Falkland Islands (Islas Malvinas)","fk","500"],["Faroe Islands (Føroyar)","fo","298"],["Fiji","fj","679"],["Finland (Suomi)","fi","358"],["France","fr","33"],["French Guiana (Guyane française)","gf","594"],["French Polynesia (Polynésie française)","pf","689"],["Gabon","ga","241"],["Gambia","gm","220"],["Georgia (საქართველო)","ge","995"],["Germany (Deutschland)","de","49"],["Ghana (Gaana)","gh","233"],["Gibraltar","gi","350"],["Greece (Ελλάδα)","gr","30"],["Greenland (Kalaallit Nunaat)","gl","299"],["Grenada","gd","1473"],["Guadeloupe","gp","590",0],["Guam","gu","1671"],["Guatemala","gt","502"],["Guinea (Guinée)","gn","224"],["Guinea-Bissau (Guiné Bissau)","gw","245"],["Guyana","gy","592"],["Haiti","ht","509"],["Honduras","hn","504"],["Hong Kong (香港)","hk","852"],["Hungary (Magyarország)","hu","36"],["Iceland (Ísland)","is","354"],["India (भारत)","in","91"],["Indonesia","id","62"],["Iran (‫ایران‬‎)","ir","98"],["Iraq (‫العراق‬‎)","iq","964"],["Ireland","ie","353"],["Israel (‫ישראל‬‎)","il","972"],["Italy (Italia)","it","39",0],["Jamaica","jm","1876"],["Japan (日本)","jp","81"],["Jordan (‫الأردن‬‎)","jo","962"],["Kazakhstan (Казахстан)","kz","7",1],["Kenya","ke","254"],["Kiribati","ki","686"],["Kuwait (‫الكويت‬‎)","kw","965"],["Kyrgyzstan (Кыргызстан)","kg","996"],["Laos (ລາວ)","la","856"],["Latvia (Latvija)","lv","371"],["Lebanon (‫لبنان‬‎)","lb","961"],["Lesotho","ls","266"],["Liberia","lr","231"],["Libya (‫ليبيا‬‎)","ly","218"],["Liechtenstein","li","423"],["Lithuania (Lietuva)","lt","370"],["Luxembourg","lu","352"],["Macau (澳門)","mo","853"],["Macedonia (FYROM) (Македонија)","mk","389"],["Madagascar (Madagasikara)","mg","261"],["Malawi","mw","265"],["Malaysia","my","60"],["Maldives","mv","960"],["Mali","ml","223"],["Malta","mt","356"],["Marshall Islands","mh","692"],["Martinique","mq","596"],["Mauritania (‫موريتانيا‬‎)","mr","222"],["Mauritius (Moris)","mu","230"],["Mexico (México)","mx","52"],["Micronesia","fm","691"],["Moldova (Republica Moldova)","md","373"],["Monaco","mc","377"],["Mongolia (Монгол)","mn","976"],["Montenegro (Crna Gora)","me","382"],["Montserrat","ms","1664"],["Morocco (‫المغرب‬‎)","ma","212"],["Mozambique (Moçambique)","mz","258"],["Myanmar (Burma) (မြန်မာ)","mm","95"],["Namibia (Namibië)","na","264"],["Nauru","nr","674"],["Nepal (नेपाल)","np","977"],["Netherlands (Nederland)","nl","31"],["New Caledonia (Nouvelle-Calédonie)","nc","687"],["New Zealand","nz","64"],["Nicaragua","ni","505"],["Niger (Nijar)","ne","227"],["Nigeria","ng","234"],["Niue","nu","683"],["Norfolk Island","nf","672"],["North Korea (조선 민주주의 인민 공화국)","kp","850"],["Northern Mariana Islands","mp","1670"],["Norway (Norge)","no","47"],["Oman (‫عُمان‬‎)","om","968"],["Pakistan (‫پاکستان‬‎)","pk","92"],["Palau","pw","680"],["Palestine (‫فلسطين‬‎)","ps","970"],["Panama (Panamá)","pa","507"],["Papua New Guinea","pg","675"],["Paraguay","py","595"],["Peru (Perú)","pe","51"],["Philippines","ph","63"],["Poland (Polska)","pl","48"],["Portugal","pt","351"],["Puerto Rico","pr","1",3,["787","939"]],["Qatar (‫قطر‬‎)","qa","974"],["Réunion (La Réunion)","re","262"],["Romania (România)","ro","40"],["Russia (Россия)","ru","7",0],["Rwanda","rw","250"],["Saint Barthélemy (Saint-Barthélemy)","bl","590",1],["Saint Helena","sh","290"],["Saint Kitts and Nevis","kn","1869"],["Saint Lucia","lc","1758"],["Saint Martin (Saint-Martin (partie française))","mf","590",2],["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)","pm","508"],["Saint Vincent and the Grenadines","vc","1784"],["Samoa","ws","685"],["San Marino","sm","378"],["São Tomé and Príncipe (São Tomé e Príncipe)","st","239"],["Saudi Arabia (‫المملكة العربية السعودية‬‎)","sa","966"],["Senegal (Sénégal)","sn","221"],["Serbia (Србија)","rs","381"],["Seychelles","sc","248"],["Sierra Leone","sl","232"],["Singapore","sg","65"],["Sint Maarten","sx","1721"],["Slovakia (Slovensko)","sk","421"],["Slovenia (Slovenija)","si","386"],["Solomon Islands","sb","677"],["Somalia (Soomaaliya)","so","252"],["South Africa","za","27"],["South Korea (대한민국)","kr","82"],["South Sudan (‫جنوب السودان‬‎)","ss","211"],["Spain (España)","es","34"],["Sri Lanka (ශ්‍රී ලංකාව)","lk","94"],["Sudan (‫السودان‬‎)","sd","249"],["Suriname","sr","597"],["Swaziland","sz","268"],["Sweden (Sverige)","se","46"],["Switzerland (Schweiz)","ch","41"],["Syria (‫سوريا‬‎)","sy","963"],["Taiwan (台灣)","tw","886"],["Tajikistan","tj","992"],["Tanzania","tz","255"],["Thailand (ไทย)","th","66"],["Timor-Leste","tl","670"],["Togo","tg","228"],["Tokelau","tk","690"],["Tonga","to","676"],["Trinidad and Tobago","tt","1868"],["Tunisia (‫تونس‬‎)","tn","216"],["Turkey (Türkiye)","tr","90"],["Turkmenistan","tm","993"],["Turks and Caicos Islands","tc","1649"],["Tuvalu","tv","688"],["U.S. Virgin Islands","vi","1340"],["Uganda","ug","256"],["Ukraine (Україна)","ua","380"],["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)","ae","971"],["United Kingdom","gb","44"],["United States","us","1",0],["Uruguay","uy","598"],["Uzbekistan (Oʻzbekiston)","uz","998"],["Vanuatu","vu","678"],["Vatican City (Città del Vaticano)","va","39",1],["Venezuela","ve","58"],["Vietnam (Việt Nam)","vn","84"],["Wallis and Futuna","wf","681"],["Yemen (‫اليمن‬‎)","ye","967"],["Zambia","zm","260"],["Zimbabwe","zw","263"]],d=0;d<c.length;d++){
var h=c[d];c[d]={name:h[0],iso2:h[1],dialCode:h[2],priority:h[3]||0,areaCodes:h[4]||null}}})},7:function(e,t,n){"use strict";var i={initCompleted:!1,isWebkit:!1,isMobilePhone:!1,isIphone:!1,isAndroid:!1,isAndroidPhone:!1,isTierTablet:!1,isTierIphone:!1,isTierRichCss:!1,isTierGenericMobile:!1,engineWebKit:"webkit",deviceIphone:"iphone",deviceIpod:"ipod",deviceIpad:"ipad",deviceMacPpc:"macintosh",deviceAndroid:"android",deviceGoogleTV:"googletv",deviceWinPhone7:"windows phone os 7",deviceWinPhone8:"windows phone 8",deviceWinPhone10:"windows phone 10",deviceWinMob:"windows ce",deviceWindows:"windows",deviceIeMob:"iemobile",devicePpc:"ppc",enginePie:"wm5 pie",deviceBB:"blackberry",deviceBB10:"bb10",vndRIM:"vnd.rim",deviceBBStorm:"blackberry95",deviceBBBold:"blackberry97",deviceBBBoldTouch:"blackberry 99",deviceBBTour:"blackberry96",deviceBBCurve:"blackberry89",deviceBBCurveTouch:"blackberry 938",deviceBBTorch:"blackberry 98",deviceBBPlaybook:"playbook",deviceSymbian:"symbian",deviceSymbos:"symbos",deviceS60:"series60",deviceS70:"series70",deviceS80:"series80",deviceS90:"series90",devicePalm:"palm",deviceWebOS:"webos",deviceWebOStv:"web0s",deviceWebOShp:"hpwos",deviceNuvifone:"nuvifone",deviceBada:"bada",deviceTizen:"tizen",deviceMeego:"meego",deviceSailfish:"sailfish",deviceUbuntu:"ubuntu",deviceKindle:"kindle",engineSilk:"silk-accelerated",engineBlazer:"blazer",engineXiino:"xiino",vndwap:"vnd.wap",wml:"wml",deviceTablet:"tablet",deviceBrew:"brew",deviceDanger:"danger",deviceHiptop:"hiptop",devicePlaystation:"playstation",devicePlaystationVita:"vita",deviceNintendoDs:"nitro",deviceNintendo:"nintendo",deviceWii:"wii",deviceXbox:"xbox",deviceArchos:"archos",engineFirefox:"firefox",engineOpera:"opera",engineNetfront:"netfront",engineUpBrowser:"up.browser",deviceMidp:"midp",uplink:"up.link",engineTelecaQ:"teleca q",engineObigo:"obigo",devicePda:"pda",mini:"mini",mobile:"mobile",mobi:"mobi",smartTV1:"smart-tv",smartTV2:"smarttv",maemo:"maemo",linux:"linux",mylocom2:"sony/com",manuSonyEricsson:"sonyericsson",manuericsson:"ericsson",manuSamsung1:"sec-sgh",manuSony:"sony",manuHtc:"htc",svcDocomo:"docomo",svcKddi:"kddi",svcVodafone:"vodafone",disUpdate:"update",uagent:"",InitDeviceScan:function(){this.initCompleted=!1,navigator&&navigator.userAgent&&(this.uagent=navigator.userAgent.toLowerCase()),this.isWebkit=this.DetectWebkit(),this.isIphone=this.DetectIphone(),this.isAndroid=this.DetectAndroid(),this.isAndroidPhone=this.DetectAndroidPhone(),this.isMobilePhone=this.DetectMobileQuick(),this.isTierIphone=this.DetectTierIphone(),this.isTierTablet=this.DetectTierTablet(),this.isTierRichCss=this.DetectTierRichCss(),this.isTierGenericMobile=this.DetectTierOtherPhones(),this.initCompleted=!0},DetectIphone:function(){return this.initCompleted||this.isIphone?this.isIphone:this.uagent.search(this.deviceIphone)>-1?this.DetectIpad()||this.DetectIpod()?!1:!0:!1},DetectIpod:function(){return this.uagent.search(this.deviceIpod)>-1?!0:!1},DetectIphoneOrIpod:function(){return this.DetectIphone()||this.DetectIpod()?!0:!1},DetectIpad:function(){return this.uagent.search(this.deviceIpad)>-1&&this.DetectWebkit()?!0:!1},DetectIos:function(){return this.DetectIphoneOrIpod()||this.DetectIpad()?!0:!1},DetectAndroid:function(){return this.initCompleted||this.isAndroid?this.isAndroid:this.uagent.search(this.deviceAndroid)>-1||this.DetectGoogleTV()?!0:!1},DetectAndroidPhone:function(){return this.initCompleted||this.isAndroidPhone?this.isAndroidPhone:this.DetectAndroid()?this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:!1:!1},DetectAndroidTablet:function(){return this.DetectAndroid()?this.DetectOperaMobile()?!1:this.uagent.search(this.mobile)>-1?!1:!0:!1},DetectAndroidWebKit:function(){return this.DetectAndroid()&&this.DetectWebkit()?!0:!1},DetectGoogleTV:function(){return this.uagent.search(this.deviceGoogleTV)>-1?!0:!1},DetectWebkit:function(){return this.initCompleted||this.isWebkit?this.isWebkit:this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectWindowsPhone:function(){return this.DetectWindowsPhone7()||this.DetectWindowsPhone8()||this.DetectWindowsPhone10()?!0:!1},DetectWindowsPhone7:function(){return this.uagent.search(this.deviceWinPhone7)>-1?!0:!1},DetectWindowsPhone8:function(){return this.uagent.search(this.deviceWinPhone8)>-1?!0:!1},DetectWindowsPhone10:function(){return this.uagent.search(this.deviceWinPhone10)>-1?!0:!1},DetectWindowsMobile:function(){return this.DetectWindowsPhone()?!1:this.uagent.search(this.deviceWinMob)>-1||this.uagent.search(this.deviceIeMob)>-1||this.uagent.search(this.enginePie)>-1?!0:this.uagent.search(this.devicePpc)>-1&&!(this.uagent.search(this.deviceMacPpc)>-1)?!0:this.uagent.search(this.manuHtc)>-1&&this.uagent.search(this.deviceWindows)>-1?!0:!1},DetectBlackBerry:function(){return this.uagent.search(this.deviceBB)>-1||this.uagent.search(this.vndRIM)>-1?!0:this.DetectBlackBerry10Phone()?!0:!1},DetectBlackBerry10Phone:function(){return this.uagent.search(this.deviceBB10)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectBlackBerryTablet:function(){return this.uagent.search(this.deviceBBPlaybook)>-1?!0:!1},DetectBlackBerryWebKit:function(){return this.DetectBlackBerry()&&this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectBlackBerryTouch:function(){return this.DetectBlackBerry()&&(this.uagent.search(this.deviceBBStorm)>-1||this.uagent.search(this.deviceBBTorch)>-1||this.uagent.search(this.deviceBBBoldTouch)>-1||this.uagent.search(this.deviceBBCurveTouch)>-1)?!0:!1},DetectBlackBerryHigh:function(){return this.DetectBlackBerryWebKit()?!1:this.DetectBlackBerry()&&(this.DetectBlackBerryTouch()||this.uagent.search(this.deviceBBBold)>-1||this.uagent.search(this.deviceBBTour)>-1||this.uagent.search(this.deviceBBCurve)>-1)?!0:!1},DetectBlackBerryLow:function(){return this.DetectBlackBerry()?this.DetectBlackBerryHigh()||this.DetectBlackBerryWebKit()?!1:!0:!1},DetectS60OssBrowser:function(){return this.DetectWebkit()&&(this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbian)>-1)?!0:!1},DetectSymbianOS:function(){return this.uagent.search(this.deviceSymbian)>-1||this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbos)>-1&&this.DetectOperaMobile||this.uagent.search(this.deviceS70)>-1||this.uagent.search(this.deviceS80)>-1||this.uagent.search(this.deviceS90)>-1?!0:!1},DetectPalmOS:function(){return this.DetectPalmWebOS()?!1:this.uagent.search(this.devicePalm)>-1||this.uagent.search(this.engineBlazer)>-1||this.uagent.search(this.engineXiino)>-1?!0:!1},DetectPalmWebOS:function(){return this.uagent.search(this.deviceWebOS)>-1?!0:!1},DetectWebOSTablet:function(){return this.uagent.search(this.deviceWebOShp)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectWebOSTV:function(){return this.uagent.search(this.deviceWebOStv)>-1&&this.uagent.search(this.smartTV2)>-1?!0:!1},DetectOperaMobile:function(){return this.uagent.search(this.engineOpera)>-1&&(this.uagent.search(this.mini)>-1||this.uagent.search(this.mobi)>-1)?!0:!1},DetectKindle:function(){return this.uagent.search(this.deviceKindle)>-1&&!this.DetectAndroid()?!0:!1},DetectAmazonSilk:function(){return this.uagent.search(this.engineSilk)>-1?!0:!1},DetectGarminNuvifone:function(){return this.uagent.search(this.deviceNuvifone)>-1?!0:!1},DetectBada:function(){return this.uagent.search(this.deviceBada)>-1?!0:!1},DetectTizen:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectTizenTV:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.smartTV1)>-1?!0:!1},DetectMeego:function(){return this.uagent.search(this.deviceMeego)>-1?!0:!1},DetectMeegoPhone:function(){return this.uagent.search(this.deviceMeego)>-1&&this.uagent.search(this.mobi)>-1?!0:!1},DetectFirefoxOS:function(){return this.DetectFirefoxOSPhone()||this.DetectFirefoxOSTablet()?!0:!1},DetectFirefoxOSPhone:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectFirefoxOSTablet:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectSailfish:function(){return this.uagent.search(this.deviceSailfish)>-1?!0:!1},DetectSailfishPhone:function(){return this.DetectSailfish()&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntu:function(){return this.DetectUbuntuPhone()||this.DetectUbuntuTablet()?!0:!1},DetectUbuntuPhone:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntuTablet:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectDangerHiptop:function(){return this.uagent.search(this.deviceDanger)>-1||this.uagent.search(this.deviceHiptop)>-1?!0:!1},DetectSonyMylo:function(){return this.uagent.search(this.manuSony)>-1&&(this.uagent.search(this.qtembedded)>-1||this.uagent.search(this.mylocom2)>-1)?!0:!1},DetectMaemoTablet:function(){return this.uagent.search(this.maemo)>-1?!0:this.uagent.search(this.linux)>-1&&this.uagent.search(this.deviceTablet)>-1&&this.DetectWebOSTablet()&&!this.DetectAndroid()?!0:!1},DetectArchos:function(){return this.uagent.search(this.deviceArchos)>-1?!0:!1},DetectGameConsole:function(){return this.DetectSonyPlaystation()||this.DetectNintendo()||this.DetectXbox()?!0:!1},DetectSonyPlaystation:function(){return this.uagent.search(this.devicePlaystation)>-1?!0:!1},DetectGamingHandheld:function(){return this.uagent.search(this.devicePlaystation)>-1&&this.uagent.search(this.devicePlaystationVita)>-1?!0:!1},DetectNintendo:function(){return this.uagent.search(this.deviceNintendo)>-1||this.uagent.search(this.deviceWii)>-1||this.uagent.search(this.deviceNintendoDs)>-1?!0:!1},DetectXbox:function(){return this.uagent.search(this.deviceXbox)>-1?!0:!1},DetectBrewDevice:function(){return this.uagent.search(this.deviceBrew)>-1?!0:!1},DetectSmartphone:function(){return this.DetectTierIphone()||this.DetectS60OssBrowser()||this.DetectSymbianOS()||this.DetectWindowsMobile()||this.DetectBlackBerry()||this.DetectMeegoPhone()||this.DetectPalmOS()?!0:!1},DetectMobileQuick:function(){return this.initCompleted||this.isMobilePhone?this.isMobilePhone:this.DetectTierTablet()?!1:this.DetectSmartphone()?!0:this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:this.DetectKindle()||this.DetectAmazonSilk()?!0:this.uagent.search(this.deviceMidp)>-1||this.DetectBrewDevice()?!0:this.uagent.search(this.engineObigo)>-1||this.uagent.search(this.engineNetfront)>-1||this.uagent.search(this.engineUpBrowser)>-1?!0:!1},DetectMobileLong:function(){return this.DetectMobileQuick()?!0:this.DetectGameConsole()?!0:this.DetectDangerHiptop()||this.DetectMaemoTablet()||this.DetectSonyMylo()||this.DetectArchos()?!0:this.uagent.search(this.devicePda)>-1&&!(this.uagent.search(this.disUpdate)>-1)?!0:this.uagent.search(this.manuSamsung1)>-1||this.uagent.search(this.manuSonyEricsson)>-1||this.uagent.search(this.manuericsson)>-1||this.uagent.search(this.svcDocomo)>-1||this.uagent.search(this.svcKddi)>-1||this.uagent.search(this.svcVodafone)>-1?!0:!1},DetectTierTablet:function(){return this.initCompleted||this.isTierTablet?this.isTierTablet:this.DetectIpad()||this.DetectAndroidTablet()||this.DetectBlackBerryTablet()||this.DetectFirefoxOSTablet()||this.DetectUbuntuTablet()||this.DetectWebOSTablet()?!0:!1},DetectTierIphone:function(){return this.initCompleted||this.isTierIphone?this.isTierIphone:this.DetectIphoneOrIpod()||this.DetectAndroidPhone()||this.DetectWindowsPhone()||this.DetectBlackBerry10Phone()||this.DetectPalmWebOS()||this.DetectBada()||this.DetectTizen()||this.DetectFirefoxOSPhone()||this.DetectSailfishPhone()||this.DetectUbuntuPhone()||this.DetectGamingHandheld()?!0:this.DetectBlackBerryWebKit()&&this.DetectBlackBerryTouch()?!0:!1},DetectTierRichCss:function(){return this.initCompleted||this.isTierRichCss?this.isTierRichCss:this.DetectTierIphone()||this.DetectKindle()||this.DetectTierTablet()?!1:this.DetectMobileQuick()?this.DetectWebkit()?!0:this.DetectS60OssBrowser()||this.DetectBlackBerryHigh()||this.DetectWindowsMobile()||this.uagent.search(this.engineTelecaQ)>-1?!0:!1:!1},DetectTierOtherPhones:function(){return this.initCompleted||this.isTierGenericMobile?this.isTierGenericMobile:this.DetectTierIphone()||this.DetectTierRichCss()||this.DetectTierTablet()?!1:this.DetectMobileLong()?!0:!1}};i.InitDeviceScan(),t.MobileEsp=i},8:function(e,t,n){(function(e){"use strict";n(9),e(function(){e("#mobile_navigation .search").click(function(){e("#mobile_skill_input").focus()})})}).call(t,n(2))},9:function(e,t,n){(function(e){"use strict";+function(e){var t=function i(t,n){this.$element=e(t),this.options=e.extend({},i.DEFAULTS,n),this.transitioning=null,this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.DEFAULTS={toggle:!0},t.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("sidebar-open")){var t=e.Event("show.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.addClass("sidebar-open"),this.transitioning=1;var n=function(){this.$element,this.transitioning=0,this.$element.trigger("shown.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(n,this)).emulateTransitionEnd(400):n.call(this)}}},t.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("sidebar-open")){var t=e.Event("hide.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.removeClass("sidebar-open"),this.transitioning=1;var n=function(){this.transitioning=0,this.$element.trigger("hidden.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(n,this)).emulateTransitionEnd(400):n.call(this)}}},t.prototype.toggle=function(){this[this.$element.hasClass("sidebar-open")?"hide":"show"]()};var n=e.fn.sidebar;e.fn.sidebar=function(n){return this.each(function(){var i=e(this),a=i.data("bs.sidebar"),r=e.extend({},t.DEFAULTS,i.data(),"object"==typeof r&&n);!a&&r.toggle&&"show"==n&&(n=!n),a||i.data("bs.sidebar",a=new t(this,r)),"string"==typeof n&&a[n]()})},e.fn.sidebar.Constructor=t,e.fn.sidebar.noConflict=function(){return e.fn.sidebar=n,this},e(document).on("click.bs.sidebar.data-api",'[data-toggle="sidebar"]',function(t){var n,i=e(this),a=i.attr("data-target")||t.preventDefault()||(n=i.attr("href"))&&n.replace(/.*(?=#[^\s]+$)/,""),r=e(a),s=r.data("bs.sidebar"),o=s?"toggle":i.data();r.sidebar(o)}),e("html").on("click.bs.sidebar.autohide",function(t){var n=e(t.target),i=n.is('.sidebar, [data-toggle="sidebar"]')||n.parents('.sidebar, [data-toggle="sidebar"]').length;if(!i){var a=e(".sidebar");a.each(function(t,n){var i=e(n);i.data("bs.sidebar")&&i.hasClass("sidebar-open")&&i.sidebar("hide")})}})}(e)}).call(t,n(2))},119:function(e,t,n){(function(e){"use strict";n(120);var t=n(3),i=n(1);window.initializeCallback=function(){function n(t){var n=t.getPlace();e("#id_location").val(n.name+", "+n.vicinity),e("#id_latitude").val(n.geometry.location.k),e("#id_longitude").val(n.geometry.location.D)}t.GoogleAutoComplete(e("#id_location"),n),t.GenericSkillSearchAutocomplete(e("#mobile_search_form"),e("#mobile_search_form").closest("form"))},window.openUrl=function(e){window.location.href=e},e(function(){i.Authenticate(e("#id_phone_number"),function(e){window.location.href=e.location}),e("[data-toggle=popover]").popover({trigger:"hover"});var t=e(".pagination li a");e.each(t,function(t,n){var i=e(n),a=i.attr("href");i.attr("href",a+"#result-display")}),Number.prototype.formatMoney=function(e,t,n){var i=this,e=isNaN(e=Math.abs(e))?2:e,t=void 0==t?".":t,n=void 0==n?",":n,a=0>i?"-":"",r=parseInt(i=Math.abs(+i||0).toFixed(e))+"",s=(s=r.length)>3?s%3:0;return a+(s?r.substr(0,s)+n:"")+r.substr(s).replace(/(\d{3})(?=\d)/g,"$1"+n)+(e?t+Math.abs(i-r).toFixed(e).slice(2):"")},e("#toggle-price-type").on("click",function(){var t=e(this).text().trim(),n=!0,i=e(".monthly_price.price"),a=e(".hourly_price.price");"Monthly"===t?(e(this).text("Hourly"),i.removeClass("hide"),a.addClass("hide")):(e(this).text("Monthly"),n=!1,a.removeClass("hide"),i.addClass("hide"))});var n=e("#slider2"),a=e("#id_start_rate").val(),r=e("#id_end_rate").val(),s={min:parseInt(a),max:r};n.slider({range:!0,values:[s.min,s.max],min:s.min,max:2e4,step:50,slide:function(t,n){var i="₦"+n.values[0]+" - ₦"+n.values[1];n.values[1]>=2e4&&(i+="+"),e("#amount").val(i),e("#id_start_rate").val(n.values[0]),e("#id_end_rate").val(n.values[1])}}),e("#displayFilterBtn").on("click",function(){e(".filter-form-container").fadeIn(1e3),e(this).fadeOut(1e3)});var o="₦"+e("#slider2").slider("values",0)+" -  ₦"+e("#slider2").slider("values",1);e("#slider2").slider("values",1)>=2e4&&(o+="+"),e("#amount").val(o);var l=0;e(document).on("scroll",function(){var t=e(document).scrollTop();t>=80?0==l&&(e(".navigation ").fadeOut("fast"),l++):(l=0,e(".navigation ").fadeIn("fast"))})})}).call(t,n(2))},120:function(e,t,n){var i=n(2);n(121),n(122),n(123),/*!
>>>>>>> develop
=======
!function(e){function t(n){if(i[n])return i[n].exports;var a=i[n]={exports:{},id:n,loaded:!1};return e[n].call(a.exports,a,a.exports,t),a.loaded=!0,a.exports}var i={};return t.m=e,t.c=i,t.p="",t(0)}([function(e,t,i){i(1),i(8),e.exports=i(15)},function(e,t,i){(function(e){"use strict";function n(){var t=function(t){e("#login_form").find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},i=function(e){window.location.reload()};p.FormInitialize(e("#login_form"),t,i,null,"#loginSubmitButton")}function a(t){var i=e("#reset_password_form");p.parsleyfyForm(i);var n=function(e){i.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},a=function(e,t){i.find(".invalid-form-error-message").html("Email Sent!").addClass("filled")};t&&p.FormInitialize(i,n,a,"text","#resetButton")}function s(){e("#id_phone_number").intlTelInput({defaultCountry:"ng",onlyCountries:["ng"],utilsScript:"/static/js/utils.js"})}function o(e){var t=e.intlTelInput("getSelectedCountryData").dialCode,i=e.intlTelInput("isValidNumber");return i===!1?"+"+t+e.val():e.val()}function r(t,i){function n(t){var i=e("#signup_form"),n=e("#phone_no"),o=e("#pass_group"),l=e("#phone_container"),c=e("#password_container"),u=e("#submit_btn");t?(i.attr("action",f["users:mailing_signup"]()),n.length>0&&(a=n.remove()),o.length>0&&(r=o.remove()),e("#signup_header_text").removeClass("hidden").addClass("hidden"),e("#maillist_header_text").removeClass("hidden"),u.text("Subscribe"),e(".last.agree-to").addClass("hidden")):(i.attr("action",f.account_signup()),a&&(l.append(a),s(),a=null),r&&(c.append(r),r=null),e("#maillist_header_text").removeClass("hidden").addClass("hidden"),e("#signup_header_text").removeClass("hidden"),u.text("Join Now"),e(".last.agree-to").removeClass("hidden"))}var a,r,l=e("#signup_form"),c=e("#id_country");s();var u=!!window.operamini;u||p.parsleyfyForm(l),t&&("NG"==c.find(":selected").val()?n():n(!0));var h=function(i){var n=i.attr("action");if(i.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken")),t&&n===f.account_signup()){var a=e("#id_phone_number");a.val(o(a))}},d=function(e){var t=this.url;t===f["users:mailing_signup"]()?window.location.href=e.location:i&&i(e)},g=function(t,i){var n=t.responseJSON.form_errors,a=e("#errorMessage");a.empty();for(var s in n)e("#errorMessage").append('<p class="text-danger">'+n[s][0]+"</p>")};u||p.formSubmission(l,h,d,g,null,"#submit_btn"),c.change(function(){var t=e(this).find("option:selected");"NG"===t.val()?n():n(!0)})}function l(){e("#authModal").on("show.bs.modal",function(t){function i(){r.removeClass("hidden"),d.removeClass("hidden"),l.addClass("hidden"),p.addClass("hidden"),c.addClass("hidden"),g.addClass("hidden"),u.text("Log in to Tuteria"),e(".invalid-form-error-message").empty(),h.text("Enter your email and password to access your account")}function n(){l.removeClass("hidden"),p.removeClass("hidden"),r.addClass("hidden"),d.addClass("hidden"),c.addClass("hidden"),g.addClass("hidden"),u.text("WELCOME HOME"),e(".invalid-form-error-message").empty(),h.html('<a href="'+f.account_signup()+'">Join</a> Tuteria to connect with quality tutors and clients')}function a(){l.addClass("hidden"),p.addClass("hidden"),r.addClass("hidden"),d.addClass("hidden"),c.removeClass("hidden"),g.removeClass("hidden"),u.text("Reset Password"),e(".invalid-form-error-message").empty(),h.text("Enter your email address to reset your password")}var s=e(t.relatedTarget)[0].id,o=e(this),r=o.find("#login_modal"),l=o.find("#signup_modal"),c=o.find("#reset_modal"),u=o.find("h2.modal-title"),h=o.find("p.modal-subheader"),d=o.find(".login_footer"),p=o.find(".signup_footer"),g=o.find(".reset_footer"),m=o.find(".password_link");"login_nav"===s&&i(),"signup_nav"===s&&n(),d.find("a").on("click",function(){n()}),p.find("a").on("click",function(){i()}),g.find("a").on("click",function(){i()}),m.on("click",function(e){e.preventDefault(),a()})})}function c(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#nav-skill-input"),"name","name",t,function(t,i,n){var a=i.name.split(" in ")[0].trim();e(this).typeahead("val",a),e("form[name='search-form']").submit()}),e('form[name="search-form"]').parsley()}function u(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#mobile_skill_input"),"name","name",t,function(t,i,n){var a=i.name.split(" in ")[0].trim();e(this).typeahead("val",a),e("#mobile-nav-search-form").submit()}),e("#mobile-nav-search-form").parsley()}function h(t,i,s,o){e("#nav-skill-input").blur(),e(".navdropdown.dropdown").hover(function(){e(".dropdown-toggle",this).trigger("click")});var h=(m.DetectBlackBerryHigh(),m.DetectBlackBerryLow(),!!window.operamini);h||(e("#mobile-navigation").find("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#mobile_login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e.each(e(".signup_nav"),function(t,i){e(i).attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal")})),e(".top-search input").blur(),c(),u(),l(),r(e("#id_phone_number"),i),n(),a(!0),d()}function d(){e(".toggle_invite_section").click(function(t){e("#prelaunch_section").addClass("hidden")}),e(".invite_friends_btn").click(function(t){e("#prelaunch_section").addClass("hidden"),e("#invite_counter_section").removeClass("collapse").removeClass("fade"),window.location.hash="#launch_sec"}),e(".share-popup").click(function(t){t.preventDefault();var i="",n=this.href,a=n.split("/")[2];switch(a){case"www.facebook.com":e.get(f.button_clicks()+"?button_type=facebook",function(){}),i="width=585,height=368";break;case"twitter.com":e.get(f.button_clicks()+"?button_type=twitter",function(){}),i="width=585,height=261";break;case"plus.google.com":e.get(f.button_clicks()+"?button_type=google",function(){}),i="width=517,height=511";break;default:i="width=585,height=511"}return window.open(n,"","menubar=no,toolbar=no,resizable=yes,scrollbars=yes,"+i),!1})}var p=i(3),f=i(5);i(6);var g=i(7),m=g.MobileEsp;t.AuthModal=l,t.LoginInitialize=n,t.SignUp=r,t.ResetInitialize=a,t.phone_value=o,t.intelInput=s,t.Authenticate=h,t.ShareButtonCounter=d}).call(t,i(2))},function(e,t,i){e.exports=jQuery},function(e,t,i){(function(e){"use strict";function n(e,t,i){var n={datumTokenizer:D.tokenizers.obj.whitespace(e),queryTokenizer:D.tokenizers.whitespace,limit:10,prefetch:t};return i&&(n.remote=i),new D(n)}function a(e,t){return new D({datumTokenizer:function(e){return D.tokenizers.whitespace(e.name)},queryTokenizer:D.tokenizers.whitespace,prefetch:t()})}function s(e,t){return new D({datumTokenizer:D.tokenizers.obj.whitespace(e),queryTokenizer:D.tokenizers.whitespace,local:t()})}function o(t,i,n){var a=t.value.replace(/{.*}/g,"").length,s=100*a,o=s/i;if(a>i){var r=a-i;t.value=t.value.substring(0,t.value.length-r)}else n.text(i-a),e("#percent").text(o+"%")}function r(t,i,n,a,s){c(t);var o=function(t,i){if(400===t.status){var n=JSON.parse(t.responseText).form_errors;e(".invalid-form-error-message").html(n.__all__[0]).addClass("filled")}};u(t,i,n,o,a,s)}function l(){window.ParsleyExtend={asyncValidators:{validate_email:{fn:function(e){return 404===e.status},url:w["users:validate_email"]()},validate_duplicate_number:{fn:function(e){return 404===e.status},url:w["users:check_duplicate_number"]()},validate_changed_number:{fn:function(e){return 404===e.status},url:w["users:user_phone_verifcation_process"]()}}},window.ParsleyConfig={validators:{valid_phone:{fn:function(e){var t=e.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);return null!==t},priority:32},no_link:{fn:function(e){var t=new RegExp("(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)","i"),i=e.match(t);return null===i},priority:90},no_email:{fn:function(e){var t=new RegExp("([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})","i"),i=e.match(t);return null===i},priority:91},validate_time:{fn:function(e){var t=moment(e,"hh:mm: A");return t.isValid()},priority:96},same_phone_number:{fn:function(t){var i=e("#id_number").val();return i.replace(/\s/g,"")===t||i===t},priority:33},schedule_time:{fn:function(t,i){var n=moment(t,"hh:mm: A"),a=moment(e(i).val(),"hh:mm: A");return n.hours()>a.hours()}},validate_word_count:{fn:function(e,t){var i=e.replace(/\s+/g," ");return i.length>=parseInt(t)},priority:101}},i18n:{en:{valid_phone:"Phone number is invalid. should be of the form +234 703 520 9576",same_phone_number:"Phone number is not the same",schedule_time:"End time must be greater than start time with at least an hour",no_link:"Links are not allowed.",validate_time:"Pls input a time in this format 6:00 AM",no_email:"Email addresses are not allowed in this field",validate_word_count:"Please input at least 300 words. No unnecessary spaces please."}}}}function c(e,t){e.parsley(C)}function u(t,i,n,a,s,o){if(s)var r=s;else r="json";var l=a||function(e,t,i){};t.on("submit",function(t){t.preventDefault();var a=e(this);if(a.parsley().validate(),a.parsley().isValid()){if(i(a),o)var s=e(o).button("loading");e.ajax({url:a.attr("action"),type:a.attr("method"),dataType:r,data:a.serialize(),success:n,error:function(e,t){o&&s.button("reset"),l(e,t)}})}})}function h(e,t,i){return{name:e,displayKey:t,source:i.ttAdapter()}}function d(e,t,i,n,a){var s={hint:!0,highlight:!0,minLength:2};e.typeahead(s,h(t,i,n)).on("typeahead:selected",a)}function p(t,i){var a=i||function(){},s=n("name",w.ajax_skills_all(),w.ajax_tags_all("%QUERY"));s.initialize(),d(t,"name","name",s,function(t,i,n){var s=i.name.split(" in ")[0].trim();e(this).typeahead("val",s),a()})}function f(t,i){var a=n("name",w.ajax_skills_all(),w.ajax_tags_all("%QUERY"));a.initialize(),d(t,"name","name",a,function(t,n,a){var s=n.name.split(" in ")[0].trim();e(this).typeahead("val",s),i.submit()}),i.parsley()}function g(e,t,i){var n=function(){var i={types:["address"],componentRestrictions:{country:"ng"}},n=new google.maps.places.Autocomplete(e[0],i),a=function(){t(n)};google.maps.event.addListener(n,"place_changed",a)};google.maps.event.addDomListener(window,"load",n)}function m(t){var i=null;if(document.cookie&&""!=document.cookie)for(var n=document.cookie.split(";"),a=0;a<n.length;a++){var s=e.trim(n[a]);if(s.substring(0,t.length+1)==t+"="){i=decodeURIComponent(s.substring(t.length+1));break}}return"csrftoken"==t&&null==i?e('input[name="csrfmiddlewaretoken"]').val():i}function v(e){return/^(GET|HEAD|OPTIONS|TRACE)$/.test(e)}function b(e,t,i){var n=i||2;e.length>=n&&t.addClass("hide"),e.find(".delete-row").addClass("hide")}function y(){e.ajaxSetup({beforeSend:function(e,t){v(t.type)||this.crossDomain||e.setRequestHeader("X-CSRFToken",m("csrftoken"))}})}var D=i(4),w=i(5),C={successClass:"has-success",errorClass:"has-error",classHandler:function(e){return e.$element.closest(".form-group")},errorsContainer:function(e){return e.$element.closest(".form-group")},errorsWrapper:"<span class='help-block'></span>",errorTemplate:"<span></span>"};t.FormInitialize=r,t.parsleyfyForm=c,t.formSubmission=u,t.HideFormsetControl=b,t.getBloodhoundInstance=n,t.getBloodhoundInstanceT=a,t.getBloodhoundInstanceT2=s,t.filterOptionByText=function(t,i){return t.find("option").filter(function(){return e(this).html()==i})},t.ApplyTypeaheadToInput=d,t.SkillAutoComplete=p,t.GoogleAutoComplete=g,t.GenericSkillSearchAutocomplete=f,t.parsleyConfig=C,t.keyupCallback=o,t.ParsleyConfig=l,t.getCookie=m,t.csrfSafeMethod=v,t.appendCSRFTOKEN=y}).call(t,i(2))},function(e,t,i){e.exports=Bloodhound},function(e,t,i){e.exports=Urls},function(e,t,i){var n,a;!function(s){n=[i(2)],a=function(e){s(e,window,document)}.apply(t,n),!(void 0!==a&&(e.exports=a))}(function(e,t,i,n){"use strict";function a(t,i){this.element=t,this.options=e.extend({},r,i),this._defaults=r,this.ns="."+s+o++,this.isGoodBrowser=Boolean(t.setSelectionRange),this.hadInitialPlaceholder=Boolean(e(t).attr("placeholder")),this._name=s,this.init()}var s="intlTelInput",o=1,r={autoFormat:!0,autoHideDialCode:!0,defaultCountry:"",ipinfoToken:"",nationalMode:!1,numberType:"MOBILE",onlyCountries:[],preferredCountries:["us","gb"],responsiveDropdown:!1,utilsScript:""},l={UP:38,DOWN:40,ENTER:13,ESC:27,PLUS:43,A:65,Z:90,ZERO:48,NINE:57,SPACE:32,BSPACE:8,DEL:46,CTRL:17,CMD1:91,CMD2:224},c=!1;e(t).load(function(){c=!0}),a.prototype={init:function(){var t=this;if("auto"==this.options.defaultCountry){this.options.defaultCountry="";var i="//ipinfo.io";this.options.ipinfoToken&&(i+="?token="+this.options.ipinfoToken),e.get(i,function(e){e&&e.country&&(t.options.defaultCountry=e.country.toLowerCase())},"jsonp").always(function(){t._ready()})}else this._ready()},_ready:function(){this.options.nationalMode&&(this.options.autoHideDialCode=!1),navigator.userAgent.match(/IEMobile/i)&&(this.options.autoFormat=!1),t.innerWidth<500&&(this.options.responsiveDropdown=!0),this._processCountryData(),this._generateMarkup(),this._setInitialState(),this._initListeners()},_processCountryData:function(){this._setInstanceCountryData(),this._setPreferredCountries()},_addCountryCode:function(e,t,i){t in this.countryCodes||(this.countryCodes[t]=[]);var n=i||0;this.countryCodes[t][n]=e},_setInstanceCountryData:function(){var t;if(this.options.onlyCountries.length)for(this.countries=[],t=0;t<u.length;t++)-1!=e.inArray(u[t].iso2,this.options.onlyCountries)&&this.countries.push(u[t]);else this.countries=u;for(this.countryCodes={},t=0;t<this.countries.length;t++){var i=this.countries[t];if(this._addCountryCode(i.iso2,i.dialCode,i.priority),i.areaCodes)for(var n=0;n<i.areaCodes.length;n++)this._addCountryCode(i.iso2,i.dialCode+i.areaCodes[n])}},_setPreferredCountries:function(){this.preferredCountries=[];for(var e=0;e<this.options.preferredCountries.length;e++){var t=this.options.preferredCountries[e],i=this._getCountryData(t,!1,!0);i&&this.preferredCountries.push(i)}},_generateMarkup:function(){this.telInput=e(this.element),this.telInput.wrap(e("<div>",{"class":"intl-tel-input"}));var t=e("<div>",{"class":"flag-dropdown"}).insertAfter(this.telInput),i=e("<div>",{"class":"selected-flag"}).appendTo(t);this.selectedFlagInner=e("<div>",{"class":"flag"}).appendTo(i),e("<div>",{"class":"arrow"}).appendTo(this.selectedFlagInner),this.countryList=e("<ul>",{"class":"country-list v-hide"}).appendTo(t),this.preferredCountries.length&&(this._appendListItems(this.preferredCountries,"preferred"),e("<li>",{"class":"divider"}).appendTo(this.countryList)),this._appendListItems(this.countries,""),this.dropdownHeight=this.countryList.outerHeight(),this.countryList.removeClass("v-hide").addClass("hide"),this.options.responsiveDropdown&&this.countryList.outerWidth(this.telInput.outerWidth()),this.countryListItems=this.countryList.children(".country")},_appendListItems:function(e,t){for(var i="",n=0;n<e.length;n++){var a=e[n];i+="<li class='country "+t+"' data-dial-code='"+a.dialCode+"' data-country-code='"+a.iso2+"'>",i+="<div class='flag "+a.iso2+"'></div>",i+="<span class='country-name'>"+a.name+"</span>",i+="<span class='dial-code'>+"+a.dialCode+"</span>",i+="</li>"}this.countryList.append(i)},_setInitialState:function(){var e=this.telInput.val();if(this._getDialCode(e))this._updateFlagFromNumber(e);else{var t;t=this.options.defaultCountry?this._getCountryData(this.options.defaultCountry,!1,!1):this.preferredCountries.length?this.preferredCountries[0]:this.countries[0],this._selectFlag(t.iso2),e||this._updateDialCode(t.dialCode,!1)}e&&this._updateVal(e,!1)},_initListeners:function(){var i=this;this._initKeyListeners(),(this.options.autoHideDialCode||this.options.autoFormat)&&this._initFocusListeners();var n=this.telInput.closest("label");n.length&&n.on("click"+this.ns,function(e){i.countryList.hasClass("hide")?i.telInput.focus():e.preventDefault()});var a=this.selectedFlagInner.parent();a.on("click"+this.ns,function(e){i.countryList.hasClass("hide")&&!i.telInput.prop("disabled")&&i._showDropdown()}),this.options.utilsScript&&(c?this.loadUtils():e(t).load(function(){i.loadUtils()}))},_initKeyListeners:function(){var e=this;this.options.autoFormat&&this.telInput.on("keypress"+this.ns,function(i){if(i.which>=l.SPACE&&!i.metaKey&&t.intlTelInputUtils){i.preventDefault();var n=i.which>=l.ZERO&&i.which<=l.NINE||i.which==l.PLUS,a=e.telInput[0],s=e.isGoodBrowser&&a.selectionStart==a.selectionEnd,o=e.telInput.attr("maxlength"),r=o?e.telInput.val().length<o:!0;if(r&&(n||s)){var c=n?String.fromCharCode(i.which):null;e._handleInputKey(c,!0)}n||e.telInput.trigger("invalidkey")}}),this.telInput.on("keyup"+this.ns,function(i){if(i.which==l.ENTER);else if(e.options.autoFormat&&t.intlTelInputUtils){var n=i.which==l.CTRL||i.which==l.CMD1||i.which==l.CMD2,a=e.telInput[0],s=e.isGoodBrowser&&a.selectionStart==a.selectionEnd,o=e.isGoodBrowser&&a.selectionStart==e.telInput.val().length;if((i.which==l.DEL&&!o||i.which==l.BSPACE||n&&s)&&e._handleInputKey(null,n&&o),!e.options.nationalMode){var r=e.telInput.val();if("+"!=r.substr(0,1)){var c=e.isGoodBrowser?a.selectionStart+1:0;e.telInput.val("+"+r),e.isGoodBrowser&&a.setSelectionRange(c,c)}}}else e._updateFlagFromNumber(e.telInput.val())})},_handleInputKey:function(e,t){var i=this.telInput.val(),n=null,a=!1,s=this.telInput[0];if(this.isGoodBrowser){var o=s.selectionEnd,r=i.length;a=o==r,e?(i=i.substr(0,s.selectionStart)+e+i.substring(o,r),a||(n=o+(i.length-r))):n=s.selectionStart}else e&&(i+=e);this.setNumber(i,t),this.isGoodBrowser&&(a&&(n=this.telInput.val().length),s.setSelectionRange(n,n))},_initFocusListeners:function(){var e=this;this.options.autoHideDialCode&&this.telInput.on("mousedown"+this.ns,function(t){e.telInput.is(":focus")||e.telInput.val()||(t.preventDefault(),e.telInput.focus())}),this.telInput.on("focus"+this.ns,function(){var i=e.telInput.val();e.telInput.data("focusVal",i),e.options.autoHideDialCode&&(i||(e._updateVal("+"+e.selectedCountryData.dialCode,!0),e.telInput.one("keypress.plus"+e.ns,function(i){if(i.which==l.PLUS){var n=e.options.autoFormat&&t.intlTelInputUtils?"+":"";e.telInput.val(n)}}),setTimeout(function(){var t=e.telInput[0];if(e.isGoodBrowser){var i=e.telInput.val().length;t.setSelectionRange(i,i)}})))}),this.telInput.on("blur"+this.ns,function(){if(e.options.autoHideDialCode){var i=e.telInput.val(),n="+"==i.substr(0,1);if(n){var a=e._getNumeric(i);a&&e.selectedCountryData.dialCode!=a||e.telInput.val("")}e.telInput.off("keypress.plus"+e.ns)}e.options.autoFormat&&t.intlTelInputUtils&&e.telInput.val()!=e.telInput.data("focusVal")&&e.telInput.trigger("change")})},_getNumeric:function(e){return e.replace(/\D/g,"")},_showDropdown:function(){this._setDropdownPosition();var e=this.countryList.children(".active");this._highlightListItem(e),this.countryList.removeClass("hide"),this._scrollTo(e),this._bindDropdownListeners(),this.selectedFlagInner.children(".arrow").addClass("up")},_setDropdownPosition:function(){var i=this.telInput.offset().top,n=e(t).scrollTop(),a=i+this.telInput.outerHeight()+this.dropdownHeight<n+e(t).height(),s=i-this.dropdownHeight>n,o=!a&&s?"-"+(this.dropdownHeight-1)+"px":"";this.countryList.css("top",o)},_bindDropdownListeners:function(){var t=this;this.countryList.on("mouseover"+this.ns,".country",function(i){t._highlightListItem(e(this))}),this.countryList.on("click"+this.ns,".country",function(i){t._selectListItem(e(this))});var n=!0;e("html").on("click"+this.ns,function(e){n||t._closeDropdown(),n=!1});var a="",s=null;e(i).on("keydown"+this.ns,function(e){e.preventDefault(),e.which==l.UP||e.which==l.DOWN?t._handleUpDownKey(e.which):e.which==l.ENTER?t._handleEnterKey():e.which==l.ESC?t._closeDropdown():(e.which>=l.A&&e.which<=l.Z||e.which==l.SPACE)&&(s&&clearTimeout(s),a+=String.fromCharCode(e.which),t._searchForCountry(a),s=setTimeout(function(){a=""},1e3))})},_handleUpDownKey:function(e){var t=this.countryList.children(".highlight").first(),i=e==l.UP?t.prev():t.next();i.length&&(i.hasClass("divider")&&(i=e==l.UP?i.prev():i.next()),this._highlightListItem(i),this._scrollTo(i))},_handleEnterKey:function(){var e=this.countryList.children(".highlight").first();e.length&&this._selectListItem(e)},_searchForCountry:function(e){for(var t=0;t<this.countries.length;t++)if(this._startsWith(this.countries[t].name,e)){var i=this.countryList.children("[data-country-code="+this.countries[t].iso2+"]").not(".preferred");this._highlightListItem(i),this._scrollTo(i,!0);break}},_startsWith:function(e,t){return e.substr(0,t.length).toUpperCase()==t},_updateVal:function(e,i){var n;if(this.options.autoFormat&&t.intlTelInputUtils){n=intlTelInputUtils.formatNumber(e,this.selectedCountryData.iso2,i);var a=this.telInput.attr("maxlength");a&&n.length>a&&(n=n.substr(0,a))}else n=e;this.telInput.val(n)},_updateFlagFromNumber:function(e){this.options.nationalMode&&this.selectedCountryData&&"1"==this.selectedCountryData.dialCode&&"+"!=e.substr(0,1)&&(e="+1"+e);var t=this._getDialCode(e);if(t){var i=this.countryCodes[this._getNumeric(t)],n=!1;if(this.selectedCountryData)for(var a=0;a<i.length;a++)i[a]==this.selectedCountryData.iso2&&(n=!0);if(!n||this._isUnknownNanp(e,t))for(var s=0;s<i.length;s++)if(i[s]){this._selectFlag(i[s]);break}}},_isUnknownNanp:function(e,t){return"+1"==t&&this._getNumeric(e).length>=4},_highlightListItem:function(e){this.countryListItems.removeClass("highlight"),e.addClass("highlight")},_getCountryData:function(e,t,i){for(var n=t?u:this.countries,a=0;a<n.length;a++)if(n[a].iso2==e)return n[a];if(i)return null;throw new Error("No country data for '"+e+"'")},_selectFlag:function(e){this.selectedCountryData=this._getCountryData(e,!1,!1),this.selectedFlagInner.attr("class","flag "+e);var t=this.selectedCountryData.name+": +"+this.selectedCountryData.dialCode;this.selectedFlagInner.parent().attr("title",t),this._updatePlaceholder();var i=this.countryListItems.children(".flag."+e).first().parent();this.countryListItems.removeClass("active"),i.addClass("active")},_updatePlaceholder:function(){if(t.intlTelInputUtils&&!this.hadInitialPlaceholder){var e=this.selectedCountryData.iso2,i=intlTelInputUtils.numberType[this.options.numberType||"FIXED_LINE"],n=intlTelInputUtils.getExampleNumber(e,this.options.nationalMode,i);this.telInput.attr("placeholder",n)}},_selectListItem:function(e){var t=e.attr("data-country-code");this._selectFlag(t),this._closeDropdown(),this._updateDialCode(e.attr("data-dial-code"),!0),this.telInput.trigger("change"),this.telInput.focus()},_closeDropdown:function(){this.countryList.addClass("hide"),this.selectedFlagInner.children(".arrow").removeClass("up"),e(i).off(this.ns),e("html").off(this.ns),this.countryList.off(this.ns)},_scrollTo:function(e,t){var i=this.countryList,n=i.height(),a=i.offset().top,s=a+n,o=e.outerHeight(),r=e.offset().top,l=r+o,c=r-a+i.scrollTop(),u=n/2-o/2;if(a>r)t&&(c-=u),i.scrollTop(c);else if(l>s){t&&(c+=u);var h=n-o;i.scrollTop(c-h)}},_updateDialCode:function(t,i){var n,a=this.telInput.val();if(t="+"+t,this.options.nationalMode&&"+"!=a.substr(0,1))n=a;else if(a){var s=this._getDialCode(a);if(s.length>1)n=a.replace(s,t);else{var o="+"!=a.substr(0,1)?e.trim(a):"";n=t+o}}else n=!this.options.autoHideDialCode||i?t:"";this._updateVal(n,i)},_getDialCode:function(t){var i="";if("+"==t.charAt(0))for(var n="",a=0;a<t.length;a++){var s=t.charAt(a);if(e.isNumeric(s)&&(n+=s,this.countryCodes[n]&&(i=t.substr(0,a+1)),4==n.length))break}return i},destroy:function(){this._closeDropdown(),this.telInput.off(this.ns),this.selectedFlagInner.parent().off(this.ns),this.telInput.closest("label").off(this.ns);var e=this.telInput.parent();e.before(this.telInput).remove()},getCleanNumber:function(){return t.intlTelInputUtils?intlTelInputUtils.formatNumberE164(this.telInput.val(),this.selectedCountryData.iso2):""},getNumberType:function(){return t.intlTelInputUtils?intlTelInputUtils.getNumberType(this.telInput.val(),this.selectedCountryData.iso2):-99},getSelectedCountryData:function(){return this.selectedCountryData||{}},getValidationError:function(){return t.intlTelInputUtils?intlTelInputUtils.getValidationError(this.telInput.val(),this.selectedCountryData.iso2):-99},isValidNumber:function(){var i=e.trim(this.telInput.val()),n=this.options.nationalMode?this.selectedCountryData.iso2:"",a=/[a-zA-Z]/.test(i);return!a&&t.intlTelInputUtils?intlTelInputUtils.isValidNumber(i,n):!1},loadUtils:function(t){var i=t||this.options.utilsScript;!e.fn[s].loadedUtilsScript&&i&&(e.fn[s].loadedUtilsScript=!0,e.ajax({url:i,success:function(){e(".intl-tel-input input").intlTelInput("utilsLoaded")},dataType:"script",cache:!0}))},selectCountry:function(e){this.selectedFlagInner.hasClass(e)||(this._selectFlag(e),this._updateDialCode(this.selectedCountryData.dialCode,!1))},setNumber:function(e,t){this.options.nationalMode||"+"==e.substr(0,1)||(e="+"+e),this._updateFlagFromNumber(e),this._updateVal(e,t)},utilsLoaded:function(){this.options.autoFormat&&this.telInput.val()&&this._updateVal(this.telInput.val()),this._updatePlaceholder()}},e.fn[s]=function(t){var i=arguments;if(t===n||"object"==typeof t)return this.each(function(){e.data(this,"plugin_"+s)||e.data(this,"plugin_"+s,new a(this,t))});if("string"==typeof t&&"_"!==t[0]&&"init"!==t){var o;return this.each(function(){var n=e.data(this,"plugin_"+s);n instanceof a&&"function"==typeof n[t]&&(o=n[t].apply(n,Array.prototype.slice.call(i,1))),"destroy"===t&&e.data(this,"plugin_"+s,null)}),o!==n?o:this}},e.fn[s].getCountryData=function(){return u},e.fn[s].setCountryData=function(e){u=e};for(var u=[["Afghanistan (‫افغانستان‬‎)","af","93"],["Albania (Shqipëri)","al","355"],["Algeria (‫الجزائر‬‎)","dz","213"],["American Samoa","as","1684"],["Andorra","ad","376"],["Angola","ao","244"],["Anguilla","ai","1264"],["Antigua and Barbuda","ag","1268"],["Argentina","ar","54"],["Armenia (Հայաստան)","am","374"],["Aruba","aw","297"],["Australia","au","61"],["Austria (Österreich)","at","43"],["Azerbaijan (Azərbaycan)","az","994"],["Bahamas","bs","1242"],["Bahrain (‫البحرين‬‎)","bh","973"],["Bangladesh (বাংলাদেশ)","bd","880"],["Barbados","bb","1246"],["Belarus (Беларусь)","by","375"],["Belgium (België)","be","32"],["Belize","bz","501"],["Benin (Bénin)","bj","229"],["Bermuda","bm","1441"],["Bhutan (འབྲུག)","bt","975"],["Bolivia","bo","591"],["Bosnia and Herzegovina (Босна и Херцеговина)","ba","387"],["Botswana","bw","267"],["Brazil (Brasil)","br","55"],["British Indian Ocean Territory","io","246"],["British Virgin Islands","vg","1284"],["Brunei","bn","673"],["Bulgaria (България)","bg","359"],["Burkina Faso","bf","226"],["Burundi (Uburundi)","bi","257"],["Cambodia (កម្ពុជា)","kh","855"],["Cameroon (Cameroun)","cm","237"],["Canada","ca","1",1,["204","236","249","250","289","306","343","365","387","403","416","418","431","437","438","450","506","514","519","548","579","581","587","604","613","639","647","672","705","709","742","778","780","782","807","819","825","867","873","902","905"]],["Cape Verde (Kabu Verdi)","cv","238"],["Caribbean Netherlands","bq","599",1],["Cayman Islands","ky","1345"],["Central African Republic (République centrafricaine)","cf","236"],["Chad (Tchad)","td","235"],["Chile","cl","56"],["China (中国)","cn","86"],["Colombia","co","57"],["Comoros (‫جزر القمر‬‎)","km","269"],["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)","cd","243"],["Congo (Republic) (Congo-Brazzaville)","cg","242"],["Cook Islands","ck","682"],["Costa Rica","cr","506"],["Côte d’Ivoire","ci","225"],["Croatia (Hrvatska)","hr","385"],["Cuba","cu","53"],["Curaçao","cw","599",0],["Cyprus (Κύπρος)","cy","357"],["Czech Republic (Česká republika)","cz","420"],["Denmark (Danmark)","dk","45"],["Djibouti","dj","253"],["Dominica","dm","1767"],["Dominican Republic (República Dominicana)","do","1",2,["809","829","849"]],["Ecuador","ec","593"],["Egypt (‫مصر‬‎)","eg","20"],["El Salvador","sv","503"],["Equatorial Guinea (Guinea Ecuatorial)","gq","240"],["Eritrea","er","291"],["Estonia (Eesti)","ee","372"],["Ethiopia","et","251"],["Falkland Islands (Islas Malvinas)","fk","500"],["Faroe Islands (Føroyar)","fo","298"],["Fiji","fj","679"],["Finland (Suomi)","fi","358"],["France","fr","33"],["French Guiana (Guyane française)","gf","594"],["French Polynesia (Polynésie française)","pf","689"],["Gabon","ga","241"],["Gambia","gm","220"],["Georgia (საქართველო)","ge","995"],["Germany (Deutschland)","de","49"],["Ghana (Gaana)","gh","233"],["Gibraltar","gi","350"],["Greece (Ελλάδα)","gr","30"],["Greenland (Kalaallit Nunaat)","gl","299"],["Grenada","gd","1473"],["Guadeloupe","gp","590",0],["Guam","gu","1671"],["Guatemala","gt","502"],["Guinea (Guinée)","gn","224"],["Guinea-Bissau (Guiné Bissau)","gw","245"],["Guyana","gy","592"],["Haiti","ht","509"],["Honduras","hn","504"],["Hong Kong (香港)","hk","852"],["Hungary (Magyarország)","hu","36"],["Iceland (Ísland)","is","354"],["India (भारत)","in","91"],["Indonesia","id","62"],["Iran (‫ایران‬‎)","ir","98"],["Iraq (‫العراق‬‎)","iq","964"],["Ireland","ie","353"],["Israel (‫ישראל‬‎)","il","972"],["Italy (Italia)","it","39",0],["Jamaica","jm","1876"],["Japan (日本)","jp","81"],["Jordan (‫الأردن‬‎)","jo","962"],["Kazakhstan (Казахстан)","kz","7",1],["Kenya","ke","254"],["Kiribati","ki","686"],["Kuwait (‫الكويت‬‎)","kw","965"],["Kyrgyzstan (Кыргызстан)","kg","996"],["Laos (ລາວ)","la","856"],["Latvia (Latvija)","lv","371"],["Lebanon (‫لبنان‬‎)","lb","961"],["Lesotho","ls","266"],["Liberia","lr","231"],["Libya (‫ليبيا‬‎)","ly","218"],["Liechtenstein","li","423"],["Lithuania (Lietuva)","lt","370"],["Luxembourg","lu","352"],["Macau (澳門)","mo","853"],["Macedonia (FYROM) (Македонија)","mk","389"],["Madagascar (Madagasikara)","mg","261"],["Malawi","mw","265"],["Malaysia","my","60"],["Maldives","mv","960"],["Mali","ml","223"],["Malta","mt","356"],["Marshall Islands","mh","692"],["Martinique","mq","596"],["Mauritania (‫موريتانيا‬‎)","mr","222"],["Mauritius (Moris)","mu","230"],["Mexico (México)","mx","52"],["Micronesia","fm","691"],["Moldova (Republica Moldova)","md","373"],["Monaco","mc","377"],["Mongolia (Монгол)","mn","976"],["Montenegro (Crna Gora)","me","382"],["Montserrat","ms","1664"],["Morocco (‫المغرب‬‎)","ma","212"],["Mozambique (Moçambique)","mz","258"],["Myanmar (Burma) (မြန်မာ)","mm","95"],["Namibia (Namibië)","na","264"],["Nauru","nr","674"],["Nepal (नेपाल)","np","977"],["Netherlands (Nederland)","nl","31"],["New Caledonia (Nouvelle-Calédonie)","nc","687"],["New Zealand","nz","64"],["Nicaragua","ni","505"],["Niger (Nijar)","ne","227"],["Nigeria","ng","234"],["Niue","nu","683"],["Norfolk Island","nf","672"],["North Korea (조선 민주주의 인민 공화국)","kp","850"],["Northern Mariana Islands","mp","1670"],["Norway (Norge)","no","47"],["Oman (‫عُمان‬‎)","om","968"],["Pakistan (‫پاکستان‬‎)","pk","92"],["Palau","pw","680"],["Palestine (‫فلسطين‬‎)","ps","970"],["Panama (Panamá)","pa","507"],["Papua New Guinea","pg","675"],["Paraguay","py","595"],["Peru (Perú)","pe","51"],["Philippines","ph","63"],["Poland (Polska)","pl","48"],["Portugal","pt","351"],["Puerto Rico","pr","1",3,["787","939"]],["Qatar (‫قطر‬‎)","qa","974"],["Réunion (La Réunion)","re","262"],["Romania (România)","ro","40"],["Russia (Россия)","ru","7",0],["Rwanda","rw","250"],["Saint Barthélemy (Saint-Barthélemy)","bl","590",1],["Saint Helena","sh","290"],["Saint Kitts and Nevis","kn","1869"],["Saint Lucia","lc","1758"],["Saint Martin (Saint-Martin (partie française))","mf","590",2],["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)","pm","508"],["Saint Vincent and the Grenadines","vc","1784"],["Samoa","ws","685"],["San Marino","sm","378"],["São Tomé and Príncipe (São Tomé e Príncipe)","st","239"],["Saudi Arabia (‫المملكة العربية السعودية‬‎)","sa","966"],["Senegal (Sénégal)","sn","221"],["Serbia (Србија)","rs","381"],["Seychelles","sc","248"],["Sierra Leone","sl","232"],["Singapore","sg","65"],["Sint Maarten","sx","1721"],["Slovakia (Slovensko)","sk","421"],["Slovenia (Slovenija)","si","386"],["Solomon Islands","sb","677"],["Somalia (Soomaaliya)","so","252"],["South Africa","za","27"],["South Korea (대한민국)","kr","82"],["South Sudan (‫جنوب السودان‬‎)","ss","211"],["Spain (España)","es","34"],["Sri Lanka (ශ්‍රී ලංකාව)","lk","94"],["Sudan (‫السودان‬‎)","sd","249"],["Suriname","sr","597"],["Swaziland","sz","268"],["Sweden (Sverige)","se","46"],["Switzerland (Schweiz)","ch","41"],["Syria (‫سوريا‬‎)","sy","963"],["Taiwan (台灣)","tw","886"],["Tajikistan","tj","992"],["Tanzania","tz","255"],["Thailand (ไทย)","th","66"],["Timor-Leste","tl","670"],["Togo","tg","228"],["Tokelau","tk","690"],["Tonga","to","676"],["Trinidad and Tobago","tt","1868"],["Tunisia (‫تونس‬‎)","tn","216"],["Turkey (Türkiye)","tr","90"],["Turkmenistan","tm","993"],["Turks and Caicos Islands","tc","1649"],["Tuvalu","tv","688"],["U.S. Virgin Islands","vi","1340"],["Uganda","ug","256"],["Ukraine (Україна)","ua","380"],["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)","ae","971"],["United Kingdom","gb","44"],["United States","us","1",0],["Uruguay","uy","598"],["Uzbekistan (Oʻzbekiston)","uz","998"],["Vanuatu","vu","678"],["Vatican City (Città del Vaticano)","va","39",1],["Venezuela","ve","58"],["Vietnam (Việt Nam)","vn","84"],["Wallis and Futuna","wf","681"],["Yemen (‫اليمن‬‎)","ye","967"],["Zambia","zm","260"],["Zimbabwe","zw","263"]],h=0;h<u.length;h++){
var d=u[h];u[h]={name:d[0],iso2:d[1],dialCode:d[2],priority:d[3]||0,areaCodes:d[4]||null}}})},function(e,t,i){"use strict";var n={initCompleted:!1,isWebkit:!1,isMobilePhone:!1,isIphone:!1,isAndroid:!1,isAndroidPhone:!1,isTierTablet:!1,isTierIphone:!1,isTierRichCss:!1,isTierGenericMobile:!1,engineWebKit:"webkit",deviceIphone:"iphone",deviceIpod:"ipod",deviceIpad:"ipad",deviceMacPpc:"macintosh",deviceAndroid:"android",deviceGoogleTV:"googletv",deviceWinPhone7:"windows phone os 7",deviceWinPhone8:"windows phone 8",deviceWinPhone10:"windows phone 10",deviceWinMob:"windows ce",deviceWindows:"windows",deviceIeMob:"iemobile",devicePpc:"ppc",enginePie:"wm5 pie",deviceBB:"blackberry",deviceBB10:"bb10",vndRIM:"vnd.rim",deviceBBStorm:"blackberry95",deviceBBBold:"blackberry97",deviceBBBoldTouch:"blackberry 99",deviceBBTour:"blackberry96",deviceBBCurve:"blackberry89",deviceBBCurveTouch:"blackberry 938",deviceBBTorch:"blackberry 98",deviceBBPlaybook:"playbook",deviceSymbian:"symbian",deviceSymbos:"symbos",deviceS60:"series60",deviceS70:"series70",deviceS80:"series80",deviceS90:"series90",devicePalm:"palm",deviceWebOS:"webos",deviceWebOStv:"web0s",deviceWebOShp:"hpwos",deviceNuvifone:"nuvifone",deviceBada:"bada",deviceTizen:"tizen",deviceMeego:"meego",deviceSailfish:"sailfish",deviceUbuntu:"ubuntu",deviceKindle:"kindle",engineSilk:"silk-accelerated",engineBlazer:"blazer",engineXiino:"xiino",vndwap:"vnd.wap",wml:"wml",deviceTablet:"tablet",deviceBrew:"brew",deviceDanger:"danger",deviceHiptop:"hiptop",devicePlaystation:"playstation",devicePlaystationVita:"vita",deviceNintendoDs:"nitro",deviceNintendo:"nintendo",deviceWii:"wii",deviceXbox:"xbox",deviceArchos:"archos",engineFirefox:"firefox",engineOpera:"opera",engineNetfront:"netfront",engineUpBrowser:"up.browser",deviceMidp:"midp",uplink:"up.link",engineTelecaQ:"teleca q",engineObigo:"obigo",devicePda:"pda",mini:"mini",mobile:"mobile",mobi:"mobi",smartTV1:"smart-tv",smartTV2:"smarttv",maemo:"maemo",linux:"linux",mylocom2:"sony/com",manuSonyEricsson:"sonyericsson",manuericsson:"ericsson",manuSamsung1:"sec-sgh",manuSony:"sony",manuHtc:"htc",svcDocomo:"docomo",svcKddi:"kddi",svcVodafone:"vodafone",disUpdate:"update",uagent:"",InitDeviceScan:function(){this.initCompleted=!1,navigator&&navigator.userAgent&&(this.uagent=navigator.userAgent.toLowerCase()),this.isWebkit=this.DetectWebkit(),this.isIphone=this.DetectIphone(),this.isAndroid=this.DetectAndroid(),this.isAndroidPhone=this.DetectAndroidPhone(),this.isMobilePhone=this.DetectMobileQuick(),this.isTierIphone=this.DetectTierIphone(),this.isTierTablet=this.DetectTierTablet(),this.isTierRichCss=this.DetectTierRichCss(),this.isTierGenericMobile=this.DetectTierOtherPhones(),this.initCompleted=!0},DetectIphone:function(){return this.initCompleted||this.isIphone?this.isIphone:this.uagent.search(this.deviceIphone)>-1?this.DetectIpad()||this.DetectIpod()?!1:!0:!1},DetectIpod:function(){return this.uagent.search(this.deviceIpod)>-1?!0:!1},DetectIphoneOrIpod:function(){return this.DetectIphone()||this.DetectIpod()?!0:!1},DetectIpad:function(){return this.uagent.search(this.deviceIpad)>-1&&this.DetectWebkit()?!0:!1},DetectIos:function(){return this.DetectIphoneOrIpod()||this.DetectIpad()?!0:!1},DetectAndroid:function(){return this.initCompleted||this.isAndroid?this.isAndroid:this.uagent.search(this.deviceAndroid)>-1||this.DetectGoogleTV()?!0:!1},DetectAndroidPhone:function(){return this.initCompleted||this.isAndroidPhone?this.isAndroidPhone:this.DetectAndroid()?this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:!1:!1},DetectAndroidTablet:function(){return this.DetectAndroid()?this.DetectOperaMobile()?!1:this.uagent.search(this.mobile)>-1?!1:!0:!1},DetectAndroidWebKit:function(){return this.DetectAndroid()&&this.DetectWebkit()?!0:!1},DetectGoogleTV:function(){return this.uagent.search(this.deviceGoogleTV)>-1?!0:!1},DetectWebkit:function(){return this.initCompleted||this.isWebkit?this.isWebkit:this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectWindowsPhone:function(){return this.DetectWindowsPhone7()||this.DetectWindowsPhone8()||this.DetectWindowsPhone10()?!0:!1},DetectWindowsPhone7:function(){return this.uagent.search(this.deviceWinPhone7)>-1?!0:!1},DetectWindowsPhone8:function(){return this.uagent.search(this.deviceWinPhone8)>-1?!0:!1},DetectWindowsPhone10:function(){return this.uagent.search(this.deviceWinPhone10)>-1?!0:!1},DetectWindowsMobile:function(){return this.DetectWindowsPhone()?!1:this.uagent.search(this.deviceWinMob)>-1||this.uagent.search(this.deviceIeMob)>-1||this.uagent.search(this.enginePie)>-1?!0:this.uagent.search(this.devicePpc)>-1&&!(this.uagent.search(this.deviceMacPpc)>-1)?!0:this.uagent.search(this.manuHtc)>-1&&this.uagent.search(this.deviceWindows)>-1?!0:!1},DetectBlackBerry:function(){return this.uagent.search(this.deviceBB)>-1||this.uagent.search(this.vndRIM)>-1?!0:this.DetectBlackBerry10Phone()?!0:!1},DetectBlackBerry10Phone:function(){return this.uagent.search(this.deviceBB10)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectBlackBerryTablet:function(){return this.uagent.search(this.deviceBBPlaybook)>-1?!0:!1},DetectBlackBerryWebKit:function(){return this.DetectBlackBerry()&&this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectBlackBerryTouch:function(){return this.DetectBlackBerry()&&(this.uagent.search(this.deviceBBStorm)>-1||this.uagent.search(this.deviceBBTorch)>-1||this.uagent.search(this.deviceBBBoldTouch)>-1||this.uagent.search(this.deviceBBCurveTouch)>-1)?!0:!1},DetectBlackBerryHigh:function(){return this.DetectBlackBerryWebKit()?!1:this.DetectBlackBerry()&&(this.DetectBlackBerryTouch()||this.uagent.search(this.deviceBBBold)>-1||this.uagent.search(this.deviceBBTour)>-1||this.uagent.search(this.deviceBBCurve)>-1)?!0:!1},DetectBlackBerryLow:function(){return this.DetectBlackBerry()?this.DetectBlackBerryHigh()||this.DetectBlackBerryWebKit()?!1:!0:!1},DetectS60OssBrowser:function(){return this.DetectWebkit()&&(this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbian)>-1)?!0:!1},DetectSymbianOS:function(){return this.uagent.search(this.deviceSymbian)>-1||this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbos)>-1&&this.DetectOperaMobile||this.uagent.search(this.deviceS70)>-1||this.uagent.search(this.deviceS80)>-1||this.uagent.search(this.deviceS90)>-1?!0:!1},DetectPalmOS:function(){return this.DetectPalmWebOS()?!1:this.uagent.search(this.devicePalm)>-1||this.uagent.search(this.engineBlazer)>-1||this.uagent.search(this.engineXiino)>-1?!0:!1},DetectPalmWebOS:function(){return this.uagent.search(this.deviceWebOS)>-1?!0:!1},DetectWebOSTablet:function(){return this.uagent.search(this.deviceWebOShp)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectWebOSTV:function(){return this.uagent.search(this.deviceWebOStv)>-1&&this.uagent.search(this.smartTV2)>-1?!0:!1},DetectOperaMobile:function(){return this.uagent.search(this.engineOpera)>-1&&(this.uagent.search(this.mini)>-1||this.uagent.search(this.mobi)>-1)?!0:!1},DetectKindle:function(){return this.uagent.search(this.deviceKindle)>-1&&!this.DetectAndroid()?!0:!1},DetectAmazonSilk:function(){return this.uagent.search(this.engineSilk)>-1?!0:!1},DetectGarminNuvifone:function(){return this.uagent.search(this.deviceNuvifone)>-1?!0:!1},DetectBada:function(){return this.uagent.search(this.deviceBada)>-1?!0:!1},DetectTizen:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectTizenTV:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.smartTV1)>-1?!0:!1},DetectMeego:function(){return this.uagent.search(this.deviceMeego)>-1?!0:!1},DetectMeegoPhone:function(){return this.uagent.search(this.deviceMeego)>-1&&this.uagent.search(this.mobi)>-1?!0:!1},DetectFirefoxOS:function(){return this.DetectFirefoxOSPhone()||this.DetectFirefoxOSTablet()?!0:!1},DetectFirefoxOSPhone:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectFirefoxOSTablet:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectSailfish:function(){return this.uagent.search(this.deviceSailfish)>-1?!0:!1},DetectSailfishPhone:function(){return this.DetectSailfish()&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntu:function(){return this.DetectUbuntuPhone()||this.DetectUbuntuTablet()?!0:!1},DetectUbuntuPhone:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntuTablet:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectDangerHiptop:function(){return this.uagent.search(this.deviceDanger)>-1||this.uagent.search(this.deviceHiptop)>-1?!0:!1},DetectSonyMylo:function(){return this.uagent.search(this.manuSony)>-1&&(this.uagent.search(this.qtembedded)>-1||this.uagent.search(this.mylocom2)>-1)?!0:!1},DetectMaemoTablet:function(){return this.uagent.search(this.maemo)>-1?!0:this.uagent.search(this.linux)>-1&&this.uagent.search(this.deviceTablet)>-1&&this.DetectWebOSTablet()&&!this.DetectAndroid()?!0:!1},DetectArchos:function(){return this.uagent.search(this.deviceArchos)>-1?!0:!1},DetectGameConsole:function(){return this.DetectSonyPlaystation()||this.DetectNintendo()||this.DetectXbox()?!0:!1},DetectSonyPlaystation:function(){return this.uagent.search(this.devicePlaystation)>-1?!0:!1},DetectGamingHandheld:function(){return this.uagent.search(this.devicePlaystation)>-1&&this.uagent.search(this.devicePlaystationVita)>-1?!0:!1},DetectNintendo:function(){return this.uagent.search(this.deviceNintendo)>-1||this.uagent.search(this.deviceWii)>-1||this.uagent.search(this.deviceNintendoDs)>-1?!0:!1},DetectXbox:function(){return this.uagent.search(this.deviceXbox)>-1?!0:!1},DetectBrewDevice:function(){return this.uagent.search(this.deviceBrew)>-1?!0:!1},DetectSmartphone:function(){return this.DetectTierIphone()||this.DetectS60OssBrowser()||this.DetectSymbianOS()||this.DetectWindowsMobile()||this.DetectBlackBerry()||this.DetectMeegoPhone()||this.DetectPalmOS()?!0:!1},DetectMobileQuick:function(){return this.initCompleted||this.isMobilePhone?this.isMobilePhone:this.DetectTierTablet()?!1:this.DetectSmartphone()?!0:this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:this.DetectKindle()||this.DetectAmazonSilk()?!0:this.uagent.search(this.deviceMidp)>-1||this.DetectBrewDevice()?!0:this.uagent.search(this.engineObigo)>-1||this.uagent.search(this.engineNetfront)>-1||this.uagent.search(this.engineUpBrowser)>-1?!0:!1},DetectMobileLong:function(){return this.DetectMobileQuick()?!0:this.DetectGameConsole()?!0:this.DetectDangerHiptop()||this.DetectMaemoTablet()||this.DetectSonyMylo()||this.DetectArchos()?!0:this.uagent.search(this.devicePda)>-1&&!(this.uagent.search(this.disUpdate)>-1)?!0:this.uagent.search(this.manuSamsung1)>-1||this.uagent.search(this.manuSonyEricsson)>-1||this.uagent.search(this.manuericsson)>-1||this.uagent.search(this.svcDocomo)>-1||this.uagent.search(this.svcKddi)>-1||this.uagent.search(this.svcVodafone)>-1?!0:!1},DetectTierTablet:function(){return this.initCompleted||this.isTierTablet?this.isTierTablet:this.DetectIpad()||this.DetectAndroidTablet()||this.DetectBlackBerryTablet()||this.DetectFirefoxOSTablet()||this.DetectUbuntuTablet()||this.DetectWebOSTablet()?!0:!1},DetectTierIphone:function(){return this.initCompleted||this.isTierIphone?this.isTierIphone:this.DetectIphoneOrIpod()||this.DetectAndroidPhone()||this.DetectWindowsPhone()||this.DetectBlackBerry10Phone()||this.DetectPalmWebOS()||this.DetectBada()||this.DetectTizen()||this.DetectFirefoxOSPhone()||this.DetectSailfishPhone()||this.DetectUbuntuPhone()||this.DetectGamingHandheld()?!0:this.DetectBlackBerryWebKit()&&this.DetectBlackBerryTouch()?!0:!1},DetectTierRichCss:function(){return this.initCompleted||this.isTierRichCss?this.isTierRichCss:this.DetectTierIphone()||this.DetectKindle()||this.DetectTierTablet()?!1:this.DetectMobileQuick()?this.DetectWebkit()?!0:this.DetectS60OssBrowser()||this.DetectBlackBerryHigh()||this.DetectWindowsMobile()||this.uagent.search(this.engineTelecaQ)>-1?!0:!1:!1},DetectTierOtherPhones:function(){return this.initCompleted||this.isTierGenericMobile?this.isTierGenericMobile:this.DetectTierIphone()||this.DetectTierRichCss()||this.DetectTierTablet()?!1:this.DetectMobileLong()?!0:!1}};n.InitDeviceScan(),t.MobileEsp=n},function(e,t,i){(function(e){"use strict";i(9),e(function(){e("#mobile_navigation .search").click(function(){e("#mobile_skill_input").focus()})})}).call(t,i(2))},function(e,t,i){(function(e){"use strict";+function(e){var t=function n(t,i){this.$element=e(t),this.options=e.extend({},n.DEFAULTS,i),this.transitioning=null,this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.DEFAULTS={toggle:!0},t.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("sidebar-open")){var t=e.Event("show.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.addClass("sidebar-open"),this.transitioning=1;var i=function(){this.$element,this.transitioning=0,this.$element.trigger("shown.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(i,this)).emulateTransitionEnd(400):i.call(this)}}},t.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("sidebar-open")){var t=e.Event("hide.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.removeClass("sidebar-open"),this.transitioning=1;var i=function(){this.transitioning=0,this.$element.trigger("hidden.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(i,this)).emulateTransitionEnd(400):i.call(this)}}},t.prototype.toggle=function(){this[this.$element.hasClass("sidebar-open")?"hide":"show"]()};var i=e.fn.sidebar;e.fn.sidebar=function(i){return this.each(function(){var n=e(this),a=n.data("bs.sidebar"),s=e.extend({},t.DEFAULTS,n.data(),"object"==typeof s&&i);!a&&s.toggle&&"show"==i&&(i=!i),a||n.data("bs.sidebar",a=new t(this,s)),"string"==typeof i&&a[i]()})},e.fn.sidebar.Constructor=t,e.fn.sidebar.noConflict=function(){return e.fn.sidebar=i,this},e(document).on("click.bs.sidebar.data-api",'[data-toggle="sidebar"]',function(t){var i,n=e(this),a=n.attr("data-target")||t.preventDefault()||(i=n.attr("href"))&&i.replace(/.*(?=#[^\s]+$)/,""),s=e(a),o=s.data("bs.sidebar"),r=o?"toggle":n.data();s.sidebar(r)}),e("html").on("click.bs.sidebar.autohide",function(t){var i=e(t.target),n=i.is('.sidebar, [data-toggle="sidebar"]')||i.parents('.sidebar, [data-toggle="sidebar"]').length;if(!n){var a=e(".sidebar");a.each(function(t,i){var n=e(i);n.data("bs.sidebar")&&n.hasClass("sidebar-open")&&n.sidebar("hide")})}})}(e)}).call(t,i(2))},,,,,,function(e,t,i){(function(e){"use strict";i(16);var t=i(3),n=i(1);window.initializeCallback=function(){function i(t){var i=t.getPlace();e("#id_location").val(i.name+", "+i.vicinity),e("#id_latitude").val(i.geometry.location.k),e("#id_longitude").val(i.geometry.location.D)}t.GoogleAutoComplete(e("#id_location"),i),t.GenericSkillSearchAutocomplete(e("#mobile_search_form"),e("#mobile_search_form").closest("form"))},window.openUrl=function(e){window.location.href=e},e(function(){n.Authenticate(e("#id_phone_number"),function(e){window.location.href=e.location}),e("[data-toggle=popover]").popover({trigger:"hover"});var t=e(".pagination li a");e.each(t,function(t,i){var n=e(i),a=n.attr("href");n.attr("href",a+"#result-display")}),Number.prototype.formatMoney=function(e,t,i){var n=this,e=isNaN(e=Math.abs(e))?2:e,t=void 0==t?".":t,i=void 0==i?",":i,a=0>n?"-":"",s=parseInt(n=Math.abs(+n||0).toFixed(e))+"",o=(o=s.length)>3?o%3:0;return a+(o?s.substr(0,o)+i:"")+s.substr(o).replace(/(\d{3})(?=\d)/g,"$1"+i)+(e?t+Math.abs(n-s).toFixed(e).slice(2):"")},e("#toggle-price-type").on("click",function(){var t=e(this).text().trim(),i=!0,n=e(".monthly_price.price"),a=e(".hourly_price.price");"Monthly"===t?(e(this).text("Hourly"),n.removeClass("hide"),a.addClass("hide")):(e(this).text("Monthly"),i=!1,a.removeClass("hide"),n.addClass("hide"))});var i=e("#slider2"),a=e("#id_start_rate").val(),s=e("#id_end_rate").val(),o={min:parseInt(a),max:s};i.slider({range:!0,values:[o.min,o.max],min:o.min,max:2e4,step:50,slide:function(t,i){var n="₦"+i.values[0]+" - ₦"+i.values[1];i.values[1]>=2e4&&(n+="+"),e("#amount").val(n),e("#id_start_rate").val(i.values[0]),e("#id_end_rate").val(i.values[1])}}),e("#displayFilterBtn").on("click",function(){e(".filter-form-container").fadeIn(1e3),e(this).fadeOut(1e3)});var r="₦"+e("#slider2").slider("values",0)+" -  ₦"+e("#slider2").slider("values",1);e("#slider2").slider("values",1)>=2e4&&(r+="+"),e("#amount").val(r);var l=0;e(document).on("scroll",function(){var t=e(document).scrollTop();t>=80?0==l&&(e(".navigation ").fadeOut("fast"),l++):(l=0,e(".navigation ").fadeIn("fast"))})})}).call(t,i(2))},function(e,t,i){var n=i(2);i(17),i(18),i(19),/*!
>>>>>>> master
=======
!function(e){function t(i){if(n[i])return n[i].exports;var r=n[i]={exports:{},id:i,loaded:!1};return e[i].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var n={};return t.m=e,t.c=n,t.p="",t(0)}({0:function(e,t,n){n(1),n(8),e.exports=n(299)},1:function(e,t,n){(function(e){"use strict";function i(){var t=function(t){e("#login_form").find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},n=function(e){window.location.reload()};p.FormInitialize(e("#login_form"),t,n,null,"#loginSubmitButton")}function r(t){var n=e("#reset_password_form");p.parsleyfyForm(n);var i=function(e){n.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken"))},r=function(e,t){n.find(".invalid-form-error-message").html("Email Sent!").addClass("filled")};t&&p.FormInitialize(n,i,r,"text","#resetButton")}function a(){e("#id_phone_number").intlTelInput({defaultCountry:"ng",onlyCountries:["ng"],utilsScript:"/static/js/utils.js"})}function s(e){var t=e.intlTelInput("getSelectedCountryData").dialCode,n=e.intlTelInput("isValidNumber");return n===!1?"+"+t+e.val():e.val()}function o(t,n){function i(t){var n=e("#signup_form"),i=e("#phone_no"),s=e("#pass_group"),l=e("#phone_container"),u=e("#password_container"),c=e("#submit_btn");t?(n.attr("action",f["users:mailing_signup"]()),i.length>0&&(r=i.remove()),s.length>0&&(o=s.remove()),e("#signup_header_text").removeClass("hidden").addClass("hidden"),e("#maillist_header_text").removeClass("hidden"),c.text("Subscribe"),e(".last.agree-to").addClass("hidden")):(n.attr("action",f.account_signup()),r&&(l.append(r),a(),r=null),o&&(u.append(o),o=null),e("#maillist_header_text").removeClass("hidden").addClass("hidden"),e("#signup_header_text").removeClass("hidden"),c.text("Join Now"),e(".last.agree-to").removeClass("hidden"))}var r,o,l=e("#signup_form"),u=e("#id_country");a();var c=!!window.operamini;c||p.parsleyfyForm(l),t&&("NG"==u.find(":selected").val()?i():i(!0));var d=function(n){var i=n.attr("action");if(n.find('input[name="csrfmiddlewaretoken"]').val(p.getCookie("csrftoken")),t&&i===f.account_signup()){var r=e("#id_phone_number");r.val(s(r))}},h=function(e){var t=this.url;t===f["users:mailing_signup"]()?window.location.href=e.location:n&&n(e)},m=function(t,n){var i=t.responseJSON.form_errors,r=e("#errorMessage");r.empty();for(var a in i)e("#errorMessage").append('<p class="text-danger">'+i[a][0]+"</p>")};c||p.formSubmission(l,d,h,m,null,"#submit_btn"),u.change(function(){var t=e(this).find("option:selected");"NG"===t.val()?i():i(!0)})}function l(){e("#authModal").on("show.bs.modal",function(t){function n(){o.removeClass("hidden"),h.removeClass("hidden"),l.addClass("hidden"),p.addClass("hidden"),u.addClass("hidden"),m.addClass("hidden"),c.text("Log in to Tuteria"),e(".invalid-form-error-message").empty(),d.text("Enter your email and password to access your account")}function i(){l.removeClass("hidden"),p.removeClass("hidden"),o.addClass("hidden"),h.addClass("hidden"),u.addClass("hidden"),m.addClass("hidden"),c.text("WELCOME HOME"),e(".invalid-form-error-message").empty(),d.html('<a href="'+f.account_signup()+'">Join</a> Tuteria to connect with quality tutors and clients')}function r(){l.addClass("hidden"),p.addClass("hidden"),o.addClass("hidden"),h.addClass("hidden"),u.removeClass("hidden"),m.removeClass("hidden"),c.text("Reset Password"),e(".invalid-form-error-message").empty(),d.text("Enter your email address to reset your password")}var a=e(t.relatedTarget)[0].id,s=e(this),o=s.find("#login_modal"),l=s.find("#signup_modal"),u=s.find("#reset_modal"),c=s.find("h2.modal-title"),d=s.find("p.modal-subheader"),h=s.find(".login_footer"),p=s.find(".signup_footer"),m=s.find(".reset_footer"),g=s.find(".password_link");"login_nav"===a&&n(),"signup_nav"===a&&i(),h.find("a").on("click",function(){i()}),p.find("a").on("click",function(){n()}),m.find("a").on("click",function(){n()}),g.on("click",function(e){e.preventDefault(),r()})})}function u(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#nav-skill-input"),"name","name",t,function(t,n,i){var r=n.name.split(" in ")[0].trim();e(this).typeahead("val",r),e("form[name='search-form']").submit()}),e('form[name="search-form"]').parsley()}function c(){var t=p.getBloodhoundInstance("name",f.ajax_skills_all(),f.ajax_tags_all("%QUERY"));t.initialize(),p.ApplyTypeaheadToInput(e("#mobile_skill_input"),"name","name",t,function(t,n,i){var r=n.name.split(" in ")[0].trim();e(this).typeahead("val",r),e("#mobile-nav-search-form").submit()}),e("#mobile-nav-search-form").parsley()}function d(t,n,a,s){e("#nav-skill-input").blur(),e(".navdropdown.dropdown").hover(function(){e(".dropdown-toggle",this).trigger("click")});var d=(g.DetectBlackBerryHigh(),g.DetectBlackBerryLow(),!!window.operamini);d||(e("#mobile-navigation").find("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#mobile_login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e("#login_nav").attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal"),e.each(e(".signup_nav"),function(t,n){e(n).attr("href","#").attr("data-toggle","modal").attr("data-target","#authModal")})),e(".top-search input").blur(),u(),c(),l(),o(e("#id_phone_number"),n),i(),r(!0),h()}function h(){e(".toggle_invite_section").click(function(t){e("#prelaunch_section").addClass("hidden")}),e(".invite_friends_btn").click(function(t){e("#prelaunch_section").addClass("hidden"),e("#invite_counter_section").removeClass("collapse").removeClass("fade"),window.location.hash="#launch_sec"}),e(".share-popup").click(function(t){t.preventDefault();var n="",i=this.href,r=i.split("/")[2];switch(r){case"www.facebook.com":e.get(f.button_clicks()+"?button_type=facebook",function(){}),n="width=585,height=368";break;case"twitter.com":e.get(f.button_clicks()+"?button_type=twitter",function(){}),n="width=585,height=261";break;case"plus.google.com":e.get(f.button_clicks()+"?button_type=google",function(){}),n="width=517,height=511";break;default:n="width=585,height=511"}return window.open(i,"","menubar=no,toolbar=no,resizable=yes,scrollbars=yes,"+n),!1})}var p=n(3),f=n(5);n(6);var m=n(7),g=m.MobileEsp;t.AuthModal=l,t.LoginInitialize=i,t.SignUp=o,t.ResetInitialize=r,t.phone_value=s,t.intelInput=a,t.Authenticate=d,t.ShareButtonCounter=h}).call(t,n(2))},2:function(e,t,n){e.exports=jQuery},3:function(e,t,n){(function(e){"use strict";function i(e,t,n){var i={datumTokenizer:b.tokenizers.obj.whitespace(e),queryTokenizer:b.tokenizers.whitespace,limit:10,prefetch:t};return n&&(i.remote=n),new b(i)}function r(e,t){return new b({datumTokenizer:function(e){return b.tokenizers.whitespace(e.name)},queryTokenizer:b.tokenizers.whitespace,prefetch:t()})}function a(e,t){return new b({datumTokenizer:b.tokenizers.obj.whitespace(e),queryTokenizer:b.tokenizers.whitespace,local:t()})}function s(t,n,i){var r=t.value.replace(/{.*}/g,"").length,a=100*r,s=a/n;if(r>n){var o=r-n;t.value=t.value.substring(0,t.value.length-o)}else i.text(n-r),e("#percent").text(s+"%")}function o(t,n,i,r,a){u(t);var s=function(t,n){if(400===t.status){var i=JSON.parse(t.responseText).form_errors;e(".invalid-form-error-message").html(i.__all__[0]).addClass("filled")}};c(t,n,i,s,r,a)}function l(){window.ParsleyExtend={asyncValidators:{validate_email:{fn:function(e){return 404===e.status},url:w["users:validate_email"]()},validate_duplicate_number:{fn:function(e){return 404===e.status},url:w["users:check_duplicate_number"]()},validate_changed_number:{fn:function(e){return 404===e.status},url:w["users:user_phone_verifcation_process"]()}}},window.ParsleyConfig={validators:{valid_phone:{fn:function(e){var t=e.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);return null!==t},priority:32},no_link:{fn:function(e){var t=new RegExp("(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,4}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)","i"),n=e.match(t);return null===n},priority:90},no_email:{fn:function(e){var t=new RegExp("([a-z0-9_\\.-]+)@([\\da-z\\.-]+)\\.([a-z\\.]{2,6})","i"),n=e.match(t);return null===n},priority:91},validate_time:{fn:function(e){var t=moment(e,"hh:mm: A");return t.isValid()},priority:96},same_phone_number:{fn:function(t){var n=e("#id_number").val();return n.replace(/\s/g,"")===t||n===t},priority:33},schedule_time:{fn:function(t,n){var i=moment(t,"hh:mm: A"),r=moment(e(n).val(),"hh:mm: A");return i.hours()>r.hours()}},validate_word_count:{fn:function(e,t){var n=e.replace(/\s+/g," ");return n.length>=parseInt(t)},priority:101}},i18n:{en:{valid_phone:"Phone number is invalid. should be of the form +234 703 520 9576",same_phone_number:"Phone number is not the same",schedule_time:"End time must be greater than start time with at least an hour",no_link:"Links are not allowed.",validate_time:"Pls input a time in this format 6:00 AM",no_email:"Email addresses are not allowed in this field",validate_word_count:"Please input at least 300 words. No unnecessary spaces please."}}}}function u(e,t){e.parsley(D)}function c(t,n,i,r,a,s){if(a)var o=a;else o="json";var l=r||function(e,t,n){};t.on("submit",function(t){t.preventDefault();var r=e(this);if(r.parsley().validate(),r.parsley().isValid()){if(n(r),s)var a=e(s).button("loading");e.ajax({url:r.attr("action"),type:r.attr("method"),dataType:o,data:r.serialize(),success:i,error:function(e,t){s&&a.button("reset"),l(e,t)}})}})}function d(e,t,n){return{name:e,displayKey:t,source:n.ttAdapter()}}function h(e,t,n,i,r){var a={hint:!0,highlight:!0,minLength:2};e.typeahead(a,d(t,n,i)).on("typeahead:selected",r)}function p(t,n){var r=n||function(){},a=i("name",w.ajax_skills_all(),w.ajax_tags_all("%QUERY"));a.initialize(),h(t,"name","name",a,function(t,n,i){var a=n.name.split(" in ")[0].trim();e(this).typeahead("val",a),r()})}function f(t,n){var r=i("name",w.ajax_skills_all(),w.ajax_tags_all("%QUERY"));r.initialize(),h(t,"name","name",r,function(t,i,r){var a=i.name.split(" in ")[0].trim();e(this).typeahead("val",a),n.submit()}),n.parsley()}function m(e,t,n){var i=function(){var n={types:["address"],componentRestrictions:{country:"ng"}},i=new google.maps.places.Autocomplete(e[0],n),r=function(){t(i)};google.maps.event.addListener(i,"place_changed",r)};google.maps.event.addDomListener(window,"load",i)}function g(t){var n=null;if(document.cookie&&""!=document.cookie)for(var i=document.cookie.split(";"),r=0;r<i.length;r++){var a=e.trim(i[r]);if(a.substring(0,t.length+1)==t+"="){n=decodeURIComponent(a.substring(t.length+1));break}}return"csrftoken"==t&&null==n?e('input[name="csrfmiddlewaretoken"]').val():n}function v(e){return/^(GET|HEAD|OPTIONS|TRACE)$/.test(e)}function _(e,t,n){var i=n||2;e.length>=i&&t.addClass("hide"),e.find(".delete-row").addClass("hide")}function y(){e.ajaxSetup({beforeSend:function(e,t){v(t.type)||this.crossDomain||e.setRequestHeader("X-CSRFToken",g("csrftoken"))}})}var b=n(4),w=n(5),D={successClass:"has-success",errorClass:"has-error",classHandler:function(e){return e.$element.closest(".form-group")},errorsContainer:function(e){return e.$element.closest(".form-group")},errorsWrapper:"<span class='help-block'></span>",errorTemplate:"<span></span>"};t.FormInitialize=o,t.parsleyfyForm=u,t.formSubmission=c,t.HideFormsetControl=_,t.getBloodhoundInstance=i,t.getBloodhoundInstanceT=r,t.getBloodhoundInstanceT2=a,t.filterOptionByText=function(t,n){return t.find("option").filter(function(){return e(this).html()==n})},t.ApplyTypeaheadToInput=h,t.SkillAutoComplete=p,t.GoogleAutoComplete=m,t.GenericSkillSearchAutocomplete=f,t.parsleyConfig=D,t.keyupCallback=s,t.ParsleyConfig=l,t.getCookie=g,t.csrfSafeMethod=v,t.appendCSRFTOKEN=y}).call(t,n(2))},4:function(e,t,n){e.exports=Bloodhound},5:function(e,t,n){e.exports=Urls},6:function(e,t,n){var i,r;!function(a){i=[n(2)],r=function(e){a(e,window,document)}.apply(t,i),!(void 0!==r&&(e.exports=r))}(function(e,t,n,i){"use strict";function r(t,n){this.element=t,this.options=e.extend({},o,n),this._defaults=o,this.ns="."+a+s++,this.isGoodBrowser=Boolean(t.setSelectionRange),this.hadInitialPlaceholder=Boolean(e(t).attr("placeholder")),this._name=a,this.init()}var a="intlTelInput",s=1,o={autoFormat:!0,autoHideDialCode:!0,defaultCountry:"",ipinfoToken:"",nationalMode:!1,numberType:"MOBILE",onlyCountries:[],preferredCountries:["us","gb"],responsiveDropdown:!1,utilsScript:""},l={UP:38,DOWN:40,ENTER:13,ESC:27,PLUS:43,A:65,Z:90,ZERO:48,NINE:57,SPACE:32,BSPACE:8,DEL:46,CTRL:17,CMD1:91,CMD2:224},u=!1;e(t).load(function(){u=!0}),r.prototype={init:function(){var t=this;if("auto"==this.options.defaultCountry){this.options.defaultCountry="";var n="//ipinfo.io";this.options.ipinfoToken&&(n+="?token="+this.options.ipinfoToken),e.get(n,function(e){e&&e.country&&(t.options.defaultCountry=e.country.toLowerCase())},"jsonp").always(function(){t._ready()})}else this._ready()},_ready:function(){this.options.nationalMode&&(this.options.autoHideDialCode=!1),navigator.userAgent.match(/IEMobile/i)&&(this.options.autoFormat=!1),t.innerWidth<500&&(this.options.responsiveDropdown=!0),this._processCountryData(),this._generateMarkup(),this._setInitialState(),this._initListeners()},_processCountryData:function(){this._setInstanceCountryData(),this._setPreferredCountries()},_addCountryCode:function(e,t,n){t in this.countryCodes||(this.countryCodes[t]=[]);var i=n||0;this.countryCodes[t][i]=e},_setInstanceCountryData:function(){var t;if(this.options.onlyCountries.length)for(this.countries=[],t=0;t<c.length;t++)-1!=e.inArray(c[t].iso2,this.options.onlyCountries)&&this.countries.push(c[t]);else this.countries=c;for(this.countryCodes={},t=0;t<this.countries.length;t++){var n=this.countries[t];if(this._addCountryCode(n.iso2,n.dialCode,n.priority),n.areaCodes)for(var i=0;i<n.areaCodes.length;i++)this._addCountryCode(n.iso2,n.dialCode+n.areaCodes[i])}},_setPreferredCountries:function(){this.preferredCountries=[];for(var e=0;e<this.options.preferredCountries.length;e++){var t=this.options.preferredCountries[e],n=this._getCountryData(t,!1,!0);n&&this.preferredCountries.push(n)}},_generateMarkup:function(){this.telInput=e(this.element),this.telInput.wrap(e("<div>",{"class":"intl-tel-input"}));var t=e("<div>",{"class":"flag-dropdown"}).insertAfter(this.telInput),n=e("<div>",{"class":"selected-flag"}).appendTo(t);this.selectedFlagInner=e("<div>",{"class":"flag"}).appendTo(n),e("<div>",{"class":"arrow"}).appendTo(this.selectedFlagInner),this.countryList=e("<ul>",{"class":"country-list v-hide"}).appendTo(t),this.preferredCountries.length&&(this._appendListItems(this.preferredCountries,"preferred"),e("<li>",{"class":"divider"}).appendTo(this.countryList)),this._appendListItems(this.countries,""),this.dropdownHeight=this.countryList.outerHeight(),this.countryList.removeClass("v-hide").addClass("hide"),this.options.responsiveDropdown&&this.countryList.outerWidth(this.telInput.outerWidth()),this.countryListItems=this.countryList.children(".country")},_appendListItems:function(e,t){for(var n="",i=0;i<e.length;i++){var r=e[i];n+="<li class='country "+t+"' data-dial-code='"+r.dialCode+"' data-country-code='"+r.iso2+"'>",n+="<div class='flag "+r.iso2+"'></div>",n+="<span class='country-name'>"+r.name+"</span>",n+="<span class='dial-code'>+"+r.dialCode+"</span>",n+="</li>"}this.countryList.append(n)},_setInitialState:function(){var e=this.telInput.val();if(this._getDialCode(e))this._updateFlagFromNumber(e);else{var t;t=this.options.defaultCountry?this._getCountryData(this.options.defaultCountry,!1,!1):this.preferredCountries.length?this.preferredCountries[0]:this.countries[0],this._selectFlag(t.iso2),e||this._updateDialCode(t.dialCode,!1)}e&&this._updateVal(e,!1)},_initListeners:function(){var n=this;this._initKeyListeners(),(this.options.autoHideDialCode||this.options.autoFormat)&&this._initFocusListeners();var i=this.telInput.closest("label");i.length&&i.on("click"+this.ns,function(e){n.countryList.hasClass("hide")?n.telInput.focus():e.preventDefault()});var r=this.selectedFlagInner.parent();r.on("click"+this.ns,function(e){n.countryList.hasClass("hide")&&!n.telInput.prop("disabled")&&n._showDropdown()}),this.options.utilsScript&&(u?this.loadUtils():e(t).load(function(){n.loadUtils()}))},_initKeyListeners:function(){var e=this;this.options.autoFormat&&this.telInput.on("keypress"+this.ns,function(n){if(n.which>=l.SPACE&&!n.metaKey&&t.intlTelInputUtils){n.preventDefault();var i=n.which>=l.ZERO&&n.which<=l.NINE||n.which==l.PLUS,r=e.telInput[0],a=e.isGoodBrowser&&r.selectionStart==r.selectionEnd,s=e.telInput.attr("maxlength"),o=s?e.telInput.val().length<s:!0;if(o&&(i||a)){var u=i?String.fromCharCode(n.which):null;e._handleInputKey(u,!0)}i||e.telInput.trigger("invalidkey")}}),this.telInput.on("keyup"+this.ns,function(n){if(n.which==l.ENTER);else if(e.options.autoFormat&&t.intlTelInputUtils){var i=n.which==l.CTRL||n.which==l.CMD1||n.which==l.CMD2,r=e.telInput[0],a=e.isGoodBrowser&&r.selectionStart==r.selectionEnd,s=e.isGoodBrowser&&r.selectionStart==e.telInput.val().length;if((n.which==l.DEL&&!s||n.which==l.BSPACE||i&&a)&&e._handleInputKey(null,i&&s),!e.options.nationalMode){var o=e.telInput.val();if("+"!=o.substr(0,1)){var u=e.isGoodBrowser?r.selectionStart+1:0;e.telInput.val("+"+o),e.isGoodBrowser&&r.setSelectionRange(u,u)}}}else e._updateFlagFromNumber(e.telInput.val())})},_handleInputKey:function(e,t){var n=this.telInput.val(),i=null,r=!1,a=this.telInput[0];if(this.isGoodBrowser){var s=a.selectionEnd,o=n.length;r=s==o,e?(n=n.substr(0,a.selectionStart)+e+n.substring(s,o),r||(i=s+(n.length-o))):i=a.selectionStart}else e&&(n+=e);this.setNumber(n,t),this.isGoodBrowser&&(r&&(i=this.telInput.val().length),a.setSelectionRange(i,i))},_initFocusListeners:function(){var e=this;this.options.autoHideDialCode&&this.telInput.on("mousedown"+this.ns,function(t){e.telInput.is(":focus")||e.telInput.val()||(t.preventDefault(),e.telInput.focus())}),this.telInput.on("focus"+this.ns,function(){var n=e.telInput.val();e.telInput.data("focusVal",n),e.options.autoHideDialCode&&(n||(e._updateVal("+"+e.selectedCountryData.dialCode,!0),e.telInput.one("keypress.plus"+e.ns,function(n){if(n.which==l.PLUS){var i=e.options.autoFormat&&t.intlTelInputUtils?"+":"";e.telInput.val(i)}}),setTimeout(function(){var t=e.telInput[0];if(e.isGoodBrowser){var n=e.telInput.val().length;t.setSelectionRange(n,n)}})))}),this.telInput.on("blur"+this.ns,function(){if(e.options.autoHideDialCode){var n=e.telInput.val(),i="+"==n.substr(0,1);if(i){var r=e._getNumeric(n);r&&e.selectedCountryData.dialCode!=r||e.telInput.val("")}e.telInput.off("keypress.plus"+e.ns)}e.options.autoFormat&&t.intlTelInputUtils&&e.telInput.val()!=e.telInput.data("focusVal")&&e.telInput.trigger("change")})},_getNumeric:function(e){return e.replace(/\D/g,"")},_showDropdown:function(){this._setDropdownPosition();var e=this.countryList.children(".active");this._highlightListItem(e),this.countryList.removeClass("hide"),this._scrollTo(e),this._bindDropdownListeners(),this.selectedFlagInner.children(".arrow").addClass("up")},_setDropdownPosition:function(){var n=this.telInput.offset().top,i=e(t).scrollTop(),r=n+this.telInput.outerHeight()+this.dropdownHeight<i+e(t).height(),a=n-this.dropdownHeight>i,s=!r&&a?"-"+(this.dropdownHeight-1)+"px":"";this.countryList.css("top",s)},_bindDropdownListeners:function(){var t=this;this.countryList.on("mouseover"+this.ns,".country",function(n){t._highlightListItem(e(this))}),this.countryList.on("click"+this.ns,".country",function(n){t._selectListItem(e(this))});var i=!0;e("html").on("click"+this.ns,function(e){i||t._closeDropdown(),i=!1});var r="",a=null;e(n).on("keydown"+this.ns,function(e){e.preventDefault(),e.which==l.UP||e.which==l.DOWN?t._handleUpDownKey(e.which):e.which==l.ENTER?t._handleEnterKey():e.which==l.ESC?t._closeDropdown():(e.which>=l.A&&e.which<=l.Z||e.which==l.SPACE)&&(a&&clearTimeout(a),r+=String.fromCharCode(e.which),t._searchForCountry(r),a=setTimeout(function(){r=""},1e3))})},_handleUpDownKey:function(e){var t=this.countryList.children(".highlight").first(),n=e==l.UP?t.prev():t.next();n.length&&(n.hasClass("divider")&&(n=e==l.UP?n.prev():n.next()),this._highlightListItem(n),this._scrollTo(n))},_handleEnterKey:function(){var e=this.countryList.children(".highlight").first();e.length&&this._selectListItem(e)},_searchForCountry:function(e){for(var t=0;t<this.countries.length;t++)if(this._startsWith(this.countries[t].name,e)){var n=this.countryList.children("[data-country-code="+this.countries[t].iso2+"]").not(".preferred");this._highlightListItem(n),this._scrollTo(n,!0);break}},_startsWith:function(e,t){return e.substr(0,t.length).toUpperCase()==t},_updateVal:function(e,n){var i;if(this.options.autoFormat&&t.intlTelInputUtils){i=intlTelInputUtils.formatNumber(e,this.selectedCountryData.iso2,n);var r=this.telInput.attr("maxlength");r&&i.length>r&&(i=i.substr(0,r))}else i=e;this.telInput.val(i)},_updateFlagFromNumber:function(e){this.options.nationalMode&&this.selectedCountryData&&"1"==this.selectedCountryData.dialCode&&"+"!=e.substr(0,1)&&(e="+1"+e);var t=this._getDialCode(e);if(t){var n=this.countryCodes[this._getNumeric(t)],i=!1;if(this.selectedCountryData)for(var r=0;r<n.length;r++)n[r]==this.selectedCountryData.iso2&&(i=!0);if(!i||this._isUnknownNanp(e,t))for(var a=0;a<n.length;a++)if(n[a]){this._selectFlag(n[a]);break}}},_isUnknownNanp:function(e,t){return"+1"==t&&this._getNumeric(e).length>=4},_highlightListItem:function(e){this.countryListItems.removeClass("highlight"),e.addClass("highlight")},_getCountryData:function(e,t,n){for(var i=t?c:this.countries,r=0;r<i.length;r++)if(i[r].iso2==e)return i[r];if(n)return null;throw new Error("No country data for '"+e+"'")},_selectFlag:function(e){this.selectedCountryData=this._getCountryData(e,!1,!1),this.selectedFlagInner.attr("class","flag "+e);var t=this.selectedCountryData.name+": +"+this.selectedCountryData.dialCode;this.selectedFlagInner.parent().attr("title",t),this._updatePlaceholder();var n=this.countryListItems.children(".flag."+e).first().parent();this.countryListItems.removeClass("active"),n.addClass("active")},_updatePlaceholder:function(){if(t.intlTelInputUtils&&!this.hadInitialPlaceholder){var e=this.selectedCountryData.iso2,n=intlTelInputUtils.numberType[this.options.numberType||"FIXED_LINE"],i=intlTelInputUtils.getExampleNumber(e,this.options.nationalMode,n);this.telInput.attr("placeholder",i)}},_selectListItem:function(e){var t=e.attr("data-country-code");this._selectFlag(t),this._closeDropdown(),this._updateDialCode(e.attr("data-dial-code"),!0),this.telInput.trigger("change"),this.telInput.focus()},_closeDropdown:function(){this.countryList.addClass("hide"),this.selectedFlagInner.children(".arrow").removeClass("up"),e(n).off(this.ns),e("html").off(this.ns),this.countryList.off(this.ns)},_scrollTo:function(e,t){var n=this.countryList,i=n.height(),r=n.offset().top,a=r+i,s=e.outerHeight(),o=e.offset().top,l=o+s,u=o-r+n.scrollTop(),c=i/2-s/2;if(r>o)t&&(u-=c),n.scrollTop(u);else if(l>a){t&&(u+=c);var d=i-s;n.scrollTop(u-d)}},_updateDialCode:function(t,n){var i,r=this.telInput.val();if(t="+"+t,this.options.nationalMode&&"+"!=r.substr(0,1))i=r;else if(r){var a=this._getDialCode(r);if(a.length>1)i=r.replace(a,t);else{var s="+"!=r.substr(0,1)?e.trim(r):"";i=t+s}}else i=!this.options.autoHideDialCode||n?t:"";this._updateVal(i,n)},_getDialCode:function(t){var n="";if("+"==t.charAt(0))for(var i="",r=0;r<t.length;r++){var a=t.charAt(r);if(e.isNumeric(a)&&(i+=a,this.countryCodes[i]&&(n=t.substr(0,r+1)),4==i.length))break}return n},destroy:function(){this._closeDropdown(),this.telInput.off(this.ns),this.selectedFlagInner.parent().off(this.ns),this.telInput.closest("label").off(this.ns);var e=this.telInput.parent();e.before(this.telInput).remove()},getCleanNumber:function(){return t.intlTelInputUtils?intlTelInputUtils.formatNumberE164(this.telInput.val(),this.selectedCountryData.iso2):""},getNumberType:function(){return t.intlTelInputUtils?intlTelInputUtils.getNumberType(this.telInput.val(),this.selectedCountryData.iso2):-99},getSelectedCountryData:function(){return this.selectedCountryData||{}},getValidationError:function(){return t.intlTelInputUtils?intlTelInputUtils.getValidationError(this.telInput.val(),this.selectedCountryData.iso2):-99},isValidNumber:function(){var n=e.trim(this.telInput.val()),i=this.options.nationalMode?this.selectedCountryData.iso2:"",r=/[a-zA-Z]/.test(n);return!r&&t.intlTelInputUtils?intlTelInputUtils.isValidNumber(n,i):!1},loadUtils:function(t){var n=t||this.options.utilsScript;!e.fn[a].loadedUtilsScript&&n&&(e.fn[a].loadedUtilsScript=!0,e.ajax({url:n,success:function(){e(".intl-tel-input input").intlTelInput("utilsLoaded")},dataType:"script",cache:!0}))},selectCountry:function(e){this.selectedFlagInner.hasClass(e)||(this._selectFlag(e),this._updateDialCode(this.selectedCountryData.dialCode,!1))},setNumber:function(e,t){this.options.nationalMode||"+"==e.substr(0,1)||(e="+"+e),this._updateFlagFromNumber(e),this._updateVal(e,t)},utilsLoaded:function(){this.options.autoFormat&&this.telInput.val()&&this._updateVal(this.telInput.val()),this._updatePlaceholder()}},e.fn[a]=function(t){var n=arguments;if(t===i||"object"==typeof t)return this.each(function(){e.data(this,"plugin_"+a)||e.data(this,"plugin_"+a,new r(this,t))});if("string"==typeof t&&"_"!==t[0]&&"init"!==t){var s;return this.each(function(){var i=e.data(this,"plugin_"+a);i instanceof r&&"function"==typeof i[t]&&(s=i[t].apply(i,Array.prototype.slice.call(n,1))),"destroy"===t&&e.data(this,"plugin_"+a,null)}),s!==i?s:this}},e.fn[a].getCountryData=function(){return c},e.fn[a].setCountryData=function(e){c=e};for(var c=[["Afghanistan (‫افغانستان‬‎)","af","93"],["Albania (Shqipëri)","al","355"],["Algeria (‫الجزائر‬‎)","dz","213"],["American Samoa","as","1684"],["Andorra","ad","376"],["Angola","ao","244"],["Anguilla","ai","1264"],["Antigua and Barbuda","ag","1268"],["Argentina","ar","54"],["Armenia (Հայաստան)","am","374"],["Aruba","aw","297"],["Australia","au","61"],["Austria (Österreich)","at","43"],["Azerbaijan (Azərbaycan)","az","994"],["Bahamas","bs","1242"],["Bahrain (‫البحرين‬‎)","bh","973"],["Bangladesh (বাংলাদেশ)","bd","880"],["Barbados","bb","1246"],["Belarus (Беларусь)","by","375"],["Belgium (België)","be","32"],["Belize","bz","501"],["Benin (Bénin)","bj","229"],["Bermuda","bm","1441"],["Bhutan (འབྲུག)","bt","975"],["Bolivia","bo","591"],["Bosnia and Herzegovina (Босна и Херцеговина)","ba","387"],["Botswana","bw","267"],["Brazil (Brasil)","br","55"],["British Indian Ocean Territory","io","246"],["British Virgin Islands","vg","1284"],["Brunei","bn","673"],["Bulgaria (България)","bg","359"],["Burkina Faso","bf","226"],["Burundi (Uburundi)","bi","257"],["Cambodia (កម្ពុជា)","kh","855"],["Cameroon (Cameroun)","cm","237"],["Canada","ca","1",1,["204","236","249","250","289","306","343","365","387","403","416","418","431","437","438","450","506","514","519","548","579","581","587","604","613","639","647","672","705","709","742","778","780","782","807","819","825","867","873","902","905"]],["Cape Verde (Kabu Verdi)","cv","238"],["Caribbean Netherlands","bq","599",1],["Cayman Islands","ky","1345"],["Central African Republic (République centrafricaine)","cf","236"],["Chad (Tchad)","td","235"],["Chile","cl","56"],["China (中国)","cn","86"],["Colombia","co","57"],["Comoros (‫جزر القمر‬‎)","km","269"],["Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)","cd","243"],["Congo (Republic) (Congo-Brazzaville)","cg","242"],["Cook Islands","ck","682"],["Costa Rica","cr","506"],["Côte d’Ivoire","ci","225"],["Croatia (Hrvatska)","hr","385"],["Cuba","cu","53"],["Curaçao","cw","599",0],["Cyprus (Κύπρος)","cy","357"],["Czech Republic (Česká republika)","cz","420"],["Denmark (Danmark)","dk","45"],["Djibouti","dj","253"],["Dominica","dm","1767"],["Dominican Republic (República Dominicana)","do","1",2,["809","829","849"]],["Ecuador","ec","593"],["Egypt (‫مصر‬‎)","eg","20"],["El Salvador","sv","503"],["Equatorial Guinea (Guinea Ecuatorial)","gq","240"],["Eritrea","er","291"],["Estonia (Eesti)","ee","372"],["Ethiopia","et","251"],["Falkland Islands (Islas Malvinas)","fk","500"],["Faroe Islands (Føroyar)","fo","298"],["Fiji","fj","679"],["Finland (Suomi)","fi","358"],["France","fr","33"],["French Guiana (Guyane française)","gf","594"],["French Polynesia (Polynésie française)","pf","689"],["Gabon","ga","241"],["Gambia","gm","220"],["Georgia (საქართველო)","ge","995"],["Germany (Deutschland)","de","49"],["Ghana (Gaana)","gh","233"],["Gibraltar","gi","350"],["Greece (Ελλάδα)","gr","30"],["Greenland (Kalaallit Nunaat)","gl","299"],["Grenada","gd","1473"],["Guadeloupe","gp","590",0],["Guam","gu","1671"],["Guatemala","gt","502"],["Guinea (Guinée)","gn","224"],["Guinea-Bissau (Guiné Bissau)","gw","245"],["Guyana","gy","592"],["Haiti","ht","509"],["Honduras","hn","504"],["Hong Kong (香港)","hk","852"],["Hungary (Magyarország)","hu","36"],["Iceland (Ísland)","is","354"],["India (भारत)","in","91"],["Indonesia","id","62"],["Iran (‫ایران‬‎)","ir","98"],["Iraq (‫العراق‬‎)","iq","964"],["Ireland","ie","353"],["Israel (‫ישראל‬‎)","il","972"],["Italy (Italia)","it","39",0],["Jamaica","jm","1876"],["Japan (日本)","jp","81"],["Jordan (‫الأردن‬‎)","jo","962"],["Kazakhstan (Казахстан)","kz","7",1],["Kenya","ke","254"],["Kiribati","ki","686"],["Kuwait (‫الكويت‬‎)","kw","965"],["Kyrgyzstan (Кыргызстан)","kg","996"],["Laos (ລາວ)","la","856"],["Latvia (Latvija)","lv","371"],["Lebanon (‫لبنان‬‎)","lb","961"],["Lesotho","ls","266"],["Liberia","lr","231"],["Libya (‫ليبيا‬‎)","ly","218"],["Liechtenstein","li","423"],["Lithuania (Lietuva)","lt","370"],["Luxembourg","lu","352"],["Macau (澳門)","mo","853"],["Macedonia (FYROM) (Македонија)","mk","389"],["Madagascar (Madagasikara)","mg","261"],["Malawi","mw","265"],["Malaysia","my","60"],["Maldives","mv","960"],["Mali","ml","223"],["Malta","mt","356"],["Marshall Islands","mh","692"],["Martinique","mq","596"],["Mauritania (‫موريتانيا‬‎)","mr","222"],["Mauritius (Moris)","mu","230"],["Mexico (México)","mx","52"],["Micronesia","fm","691"],["Moldova (Republica Moldova)","md","373"],["Monaco","mc","377"],["Mongolia (Монгол)","mn","976"],["Montenegro (Crna Gora)","me","382"],["Montserrat","ms","1664"],["Morocco (‫المغرب‬‎)","ma","212"],["Mozambique (Moçambique)","mz","258"],["Myanmar (Burma) (မြန်မာ)","mm","95"],["Namibia (Namibië)","na","264"],["Nauru","nr","674"],["Nepal (नेपाल)","np","977"],["Netherlands (Nederland)","nl","31"],["New Caledonia (Nouvelle-Calédonie)","nc","687"],["New Zealand","nz","64"],["Nicaragua","ni","505"],["Niger (Nijar)","ne","227"],["Nigeria","ng","234"],["Niue","nu","683"],["Norfolk Island","nf","672"],["North Korea (조선 민주주의 인민 공화국)","kp","850"],["Northern Mariana Islands","mp","1670"],["Norway (Norge)","no","47"],["Oman (‫عُمان‬‎)","om","968"],["Pakistan (‫پاکستان‬‎)","pk","92"],["Palau","pw","680"],["Palestine (‫فلسطين‬‎)","ps","970"],["Panama (Panamá)","pa","507"],["Papua New Guinea","pg","675"],["Paraguay","py","595"],["Peru (Perú)","pe","51"],["Philippines","ph","63"],["Poland (Polska)","pl","48"],["Portugal","pt","351"],["Puerto Rico","pr","1",3,["787","939"]],["Qatar (‫قطر‬‎)","qa","974"],["Réunion (La Réunion)","re","262"],["Romania (România)","ro","40"],["Russia (Россия)","ru","7",0],["Rwanda","rw","250"],["Saint Barthélemy (Saint-Barthélemy)","bl","590",1],["Saint Helena","sh","290"],["Saint Kitts and Nevis","kn","1869"],["Saint Lucia","lc","1758"],["Saint Martin (Saint-Martin (partie française))","mf","590",2],["Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)","pm","508"],["Saint Vincent and the Grenadines","vc","1784"],["Samoa","ws","685"],["San Marino","sm","378"],["São Tomé and Príncipe (São Tomé e Príncipe)","st","239"],["Saudi Arabia (‫المملكة العربية السعودية‬‎)","sa","966"],["Senegal (Sénégal)","sn","221"],["Serbia (Србија)","rs","381"],["Seychelles","sc","248"],["Sierra Leone","sl","232"],["Singapore","sg","65"],["Sint Maarten","sx","1721"],["Slovakia (Slovensko)","sk","421"],["Slovenia (Slovenija)","si","386"],["Solomon Islands","sb","677"],["Somalia (Soomaaliya)","so","252"],["South Africa","za","27"],["South Korea (대한민국)","kr","82"],["South Sudan (‫جنوب السودان‬‎)","ss","211"],["Spain (España)","es","34"],["Sri Lanka (ශ්‍රී ලංකාව)","lk","94"],["Sudan (‫السودان‬‎)","sd","249"],["Suriname","sr","597"],["Swaziland","sz","268"],["Sweden (Sverige)","se","46"],["Switzerland (Schweiz)","ch","41"],["Syria (‫سوريا‬‎)","sy","963"],["Taiwan (台灣)","tw","886"],["Tajikistan","tj","992"],["Tanzania","tz","255"],["Thailand (ไทย)","th","66"],["Timor-Leste","tl","670"],["Togo","tg","228"],["Tokelau","tk","690"],["Tonga","to","676"],["Trinidad and Tobago","tt","1868"],["Tunisia (‫تونس‬‎)","tn","216"],["Turkey (Türkiye)","tr","90"],["Turkmenistan","tm","993"],["Turks and Caicos Islands","tc","1649"],["Tuvalu","tv","688"],["U.S. Virgin Islands","vi","1340"],["Uganda","ug","256"],["Ukraine (Україна)","ua","380"],["United Arab Emirates (‫الإمارات العربية المتحدة‬‎)","ae","971"],["United Kingdom","gb","44"],["United States","us","1",0],["Uruguay","uy","598"],["Uzbekistan (Oʻzbekiston)","uz","998"],["Vanuatu","vu","678"],["Vatican City (Città del Vaticano)","va","39",1],["Venezuela","ve","58"],["Vietnam (Việt Nam)","vn","84"],["Wallis and Futuna","wf","681"],["Yemen (‫اليمن‬‎)","ye","967"],["Zambia","zm","260"],["Zimbabwe","zw","263"]],d=0;d<c.length;d++){
var h=c[d];c[d]={name:h[0],iso2:h[1],dialCode:h[2],priority:h[3]||0,areaCodes:h[4]||null}}})},7:function(e,t,n){"use strict";var i={initCompleted:!1,isWebkit:!1,isMobilePhone:!1,isIphone:!1,isAndroid:!1,isAndroidPhone:!1,isTierTablet:!1,isTierIphone:!1,isTierRichCss:!1,isTierGenericMobile:!1,engineWebKit:"webkit",deviceIphone:"iphone",deviceIpod:"ipod",deviceIpad:"ipad",deviceMacPpc:"macintosh",deviceAndroid:"android",deviceGoogleTV:"googletv",deviceWinPhone7:"windows phone os 7",deviceWinPhone8:"windows phone 8",deviceWinPhone10:"windows phone 10",deviceWinMob:"windows ce",deviceWindows:"windows",deviceIeMob:"iemobile",devicePpc:"ppc",enginePie:"wm5 pie",deviceBB:"blackberry",deviceBB10:"bb10",vndRIM:"vnd.rim",deviceBBStorm:"blackberry95",deviceBBBold:"blackberry97",deviceBBBoldTouch:"blackberry 99",deviceBBTour:"blackberry96",deviceBBCurve:"blackberry89",deviceBBCurveTouch:"blackberry 938",deviceBBTorch:"blackberry 98",deviceBBPlaybook:"playbook",deviceSymbian:"symbian",deviceSymbos:"symbos",deviceS60:"series60",deviceS70:"series70",deviceS80:"series80",deviceS90:"series90",devicePalm:"palm",deviceWebOS:"webos",deviceWebOStv:"web0s",deviceWebOShp:"hpwos",deviceNuvifone:"nuvifone",deviceBada:"bada",deviceTizen:"tizen",deviceMeego:"meego",deviceSailfish:"sailfish",deviceUbuntu:"ubuntu",deviceKindle:"kindle",engineSilk:"silk-accelerated",engineBlazer:"blazer",engineXiino:"xiino",vndwap:"vnd.wap",wml:"wml",deviceTablet:"tablet",deviceBrew:"brew",deviceDanger:"danger",deviceHiptop:"hiptop",devicePlaystation:"playstation",devicePlaystationVita:"vita",deviceNintendoDs:"nitro",deviceNintendo:"nintendo",deviceWii:"wii",deviceXbox:"xbox",deviceArchos:"archos",engineFirefox:"firefox",engineOpera:"opera",engineNetfront:"netfront",engineUpBrowser:"up.browser",deviceMidp:"midp",uplink:"up.link",engineTelecaQ:"teleca q",engineObigo:"obigo",devicePda:"pda",mini:"mini",mobile:"mobile",mobi:"mobi",smartTV1:"smart-tv",smartTV2:"smarttv",maemo:"maemo",linux:"linux",mylocom2:"sony/com",manuSonyEricsson:"sonyericsson",manuericsson:"ericsson",manuSamsung1:"sec-sgh",manuSony:"sony",manuHtc:"htc",svcDocomo:"docomo",svcKddi:"kddi",svcVodafone:"vodafone",disUpdate:"update",uagent:"",InitDeviceScan:function(){this.initCompleted=!1,navigator&&navigator.userAgent&&(this.uagent=navigator.userAgent.toLowerCase()),this.isWebkit=this.DetectWebkit(),this.isIphone=this.DetectIphone(),this.isAndroid=this.DetectAndroid(),this.isAndroidPhone=this.DetectAndroidPhone(),this.isMobilePhone=this.DetectMobileQuick(),this.isTierIphone=this.DetectTierIphone(),this.isTierTablet=this.DetectTierTablet(),this.isTierRichCss=this.DetectTierRichCss(),this.isTierGenericMobile=this.DetectTierOtherPhones(),this.initCompleted=!0},DetectIphone:function(){return this.initCompleted||this.isIphone?this.isIphone:this.uagent.search(this.deviceIphone)>-1?this.DetectIpad()||this.DetectIpod()?!1:!0:!1},DetectIpod:function(){return this.uagent.search(this.deviceIpod)>-1?!0:!1},DetectIphoneOrIpod:function(){return this.DetectIphone()||this.DetectIpod()?!0:!1},DetectIpad:function(){return this.uagent.search(this.deviceIpad)>-1&&this.DetectWebkit()?!0:!1},DetectIos:function(){return this.DetectIphoneOrIpod()||this.DetectIpad()?!0:!1},DetectAndroid:function(){return this.initCompleted||this.isAndroid?this.isAndroid:this.uagent.search(this.deviceAndroid)>-1||this.DetectGoogleTV()?!0:!1},DetectAndroidPhone:function(){return this.initCompleted||this.isAndroidPhone?this.isAndroidPhone:this.DetectAndroid()?this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:!1:!1},DetectAndroidTablet:function(){return this.DetectAndroid()?this.DetectOperaMobile()?!1:this.uagent.search(this.mobile)>-1?!1:!0:!1},DetectAndroidWebKit:function(){return this.DetectAndroid()&&this.DetectWebkit()?!0:!1},DetectGoogleTV:function(){return this.uagent.search(this.deviceGoogleTV)>-1?!0:!1},DetectWebkit:function(){return this.initCompleted||this.isWebkit?this.isWebkit:this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectWindowsPhone:function(){return this.DetectWindowsPhone7()||this.DetectWindowsPhone8()||this.DetectWindowsPhone10()?!0:!1},DetectWindowsPhone7:function(){return this.uagent.search(this.deviceWinPhone7)>-1?!0:!1},DetectWindowsPhone8:function(){return this.uagent.search(this.deviceWinPhone8)>-1?!0:!1},DetectWindowsPhone10:function(){return this.uagent.search(this.deviceWinPhone10)>-1?!0:!1},DetectWindowsMobile:function(){return this.DetectWindowsPhone()?!1:this.uagent.search(this.deviceWinMob)>-1||this.uagent.search(this.deviceIeMob)>-1||this.uagent.search(this.enginePie)>-1?!0:this.uagent.search(this.devicePpc)>-1&&!(this.uagent.search(this.deviceMacPpc)>-1)?!0:this.uagent.search(this.manuHtc)>-1&&this.uagent.search(this.deviceWindows)>-1?!0:!1},DetectBlackBerry:function(){return this.uagent.search(this.deviceBB)>-1||this.uagent.search(this.vndRIM)>-1?!0:this.DetectBlackBerry10Phone()?!0:!1},DetectBlackBerry10Phone:function(){return this.uagent.search(this.deviceBB10)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectBlackBerryTablet:function(){return this.uagent.search(this.deviceBBPlaybook)>-1?!0:!1},DetectBlackBerryWebKit:function(){return this.DetectBlackBerry()&&this.uagent.search(this.engineWebKit)>-1?!0:!1},DetectBlackBerryTouch:function(){return this.DetectBlackBerry()&&(this.uagent.search(this.deviceBBStorm)>-1||this.uagent.search(this.deviceBBTorch)>-1||this.uagent.search(this.deviceBBBoldTouch)>-1||this.uagent.search(this.deviceBBCurveTouch)>-1)?!0:!1},DetectBlackBerryHigh:function(){return this.DetectBlackBerryWebKit()?!1:this.DetectBlackBerry()&&(this.DetectBlackBerryTouch()||this.uagent.search(this.deviceBBBold)>-1||this.uagent.search(this.deviceBBTour)>-1||this.uagent.search(this.deviceBBCurve)>-1)?!0:!1},DetectBlackBerryLow:function(){return this.DetectBlackBerry()?this.DetectBlackBerryHigh()||this.DetectBlackBerryWebKit()?!1:!0:!1},DetectS60OssBrowser:function(){return this.DetectWebkit()&&(this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbian)>-1)?!0:!1},DetectSymbianOS:function(){return this.uagent.search(this.deviceSymbian)>-1||this.uagent.search(this.deviceS60)>-1||this.uagent.search(this.deviceSymbos)>-1&&this.DetectOperaMobile||this.uagent.search(this.deviceS70)>-1||this.uagent.search(this.deviceS80)>-1||this.uagent.search(this.deviceS90)>-1?!0:!1},DetectPalmOS:function(){return this.DetectPalmWebOS()?!1:this.uagent.search(this.devicePalm)>-1||this.uagent.search(this.engineBlazer)>-1||this.uagent.search(this.engineXiino)>-1?!0:!1},DetectPalmWebOS:function(){return this.uagent.search(this.deviceWebOS)>-1?!0:!1},DetectWebOSTablet:function(){return this.uagent.search(this.deviceWebOShp)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectWebOSTV:function(){return this.uagent.search(this.deviceWebOStv)>-1&&this.uagent.search(this.smartTV2)>-1?!0:!1},DetectOperaMobile:function(){return this.uagent.search(this.engineOpera)>-1&&(this.uagent.search(this.mini)>-1||this.uagent.search(this.mobi)>-1)?!0:!1},DetectKindle:function(){return this.uagent.search(this.deviceKindle)>-1&&!this.DetectAndroid()?!0:!1},DetectAmazonSilk:function(){return this.uagent.search(this.engineSilk)>-1?!0:!1},DetectGarminNuvifone:function(){return this.uagent.search(this.deviceNuvifone)>-1?!0:!1},DetectBada:function(){return this.uagent.search(this.deviceBada)>-1?!0:!1},DetectTizen:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectTizenTV:function(){return this.uagent.search(this.deviceTizen)>-1&&this.uagent.search(this.smartTV1)>-1?!0:!1},DetectMeego:function(){return this.uagent.search(this.deviceMeego)>-1?!0:!1},DetectMeegoPhone:function(){return this.uagent.search(this.deviceMeego)>-1&&this.uagent.search(this.mobi)>-1?!0:!1},DetectFirefoxOS:function(){return this.DetectFirefoxOSPhone()||this.DetectFirefoxOSTablet()?!0:!1},DetectFirefoxOSPhone:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectFirefoxOSTablet:function(){return this.DetectIos()||this.DetectAndroid()||this.DetectSailfish()?!1:this.uagent.search(this.engineFirefox)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectSailfish:function(){return this.uagent.search(this.deviceSailfish)>-1?!0:!1},DetectSailfishPhone:function(){return this.DetectSailfish()&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntu:function(){return this.DetectUbuntuPhone()||this.DetectUbuntuTablet()?!0:!1},DetectUbuntuPhone:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.mobile)>-1?!0:!1},DetectUbuntuTablet:function(){return this.uagent.search(this.deviceUbuntu)>-1&&this.uagent.search(this.deviceTablet)>-1?!0:!1},DetectDangerHiptop:function(){return this.uagent.search(this.deviceDanger)>-1||this.uagent.search(this.deviceHiptop)>-1?!0:!1},DetectSonyMylo:function(){return this.uagent.search(this.manuSony)>-1&&(this.uagent.search(this.qtembedded)>-1||this.uagent.search(this.mylocom2)>-1)?!0:!1},DetectMaemoTablet:function(){return this.uagent.search(this.maemo)>-1?!0:this.uagent.search(this.linux)>-1&&this.uagent.search(this.deviceTablet)>-1&&this.DetectWebOSTablet()&&!this.DetectAndroid()?!0:!1},DetectArchos:function(){return this.uagent.search(this.deviceArchos)>-1?!0:!1},DetectGameConsole:function(){return this.DetectSonyPlaystation()||this.DetectNintendo()||this.DetectXbox()?!0:!1},DetectSonyPlaystation:function(){return this.uagent.search(this.devicePlaystation)>-1?!0:!1},DetectGamingHandheld:function(){return this.uagent.search(this.devicePlaystation)>-1&&this.uagent.search(this.devicePlaystationVita)>-1?!0:!1},DetectNintendo:function(){return this.uagent.search(this.deviceNintendo)>-1||this.uagent.search(this.deviceWii)>-1||this.uagent.search(this.deviceNintendoDs)>-1?!0:!1},DetectXbox:function(){return this.uagent.search(this.deviceXbox)>-1?!0:!1},DetectBrewDevice:function(){return this.uagent.search(this.deviceBrew)>-1?!0:!1},DetectSmartphone:function(){return this.DetectTierIphone()||this.DetectS60OssBrowser()||this.DetectSymbianOS()||this.DetectWindowsMobile()||this.DetectBlackBerry()||this.DetectMeegoPhone()||this.DetectPalmOS()?!0:!1},DetectMobileQuick:function(){return this.initCompleted||this.isMobilePhone?this.isMobilePhone:this.DetectTierTablet()?!1:this.DetectSmartphone()?!0:this.uagent.search(this.mobile)>-1?!0:this.DetectOperaMobile()?!0:this.DetectKindle()||this.DetectAmazonSilk()?!0:this.uagent.search(this.deviceMidp)>-1||this.DetectBrewDevice()?!0:this.uagent.search(this.engineObigo)>-1||this.uagent.search(this.engineNetfront)>-1||this.uagent.search(this.engineUpBrowser)>-1?!0:!1},DetectMobileLong:function(){return this.DetectMobileQuick()?!0:this.DetectGameConsole()?!0:this.DetectDangerHiptop()||this.DetectMaemoTablet()||this.DetectSonyMylo()||this.DetectArchos()?!0:this.uagent.search(this.devicePda)>-1&&!(this.uagent.search(this.disUpdate)>-1)?!0:this.uagent.search(this.manuSamsung1)>-1||this.uagent.search(this.manuSonyEricsson)>-1||this.uagent.search(this.manuericsson)>-1||this.uagent.search(this.svcDocomo)>-1||this.uagent.search(this.svcKddi)>-1||this.uagent.search(this.svcVodafone)>-1?!0:!1},DetectTierTablet:function(){return this.initCompleted||this.isTierTablet?this.isTierTablet:this.DetectIpad()||this.DetectAndroidTablet()||this.DetectBlackBerryTablet()||this.DetectFirefoxOSTablet()||this.DetectUbuntuTablet()||this.DetectWebOSTablet()?!0:!1},DetectTierIphone:function(){return this.initCompleted||this.isTierIphone?this.isTierIphone:this.DetectIphoneOrIpod()||this.DetectAndroidPhone()||this.DetectWindowsPhone()||this.DetectBlackBerry10Phone()||this.DetectPalmWebOS()||this.DetectBada()||this.DetectTizen()||this.DetectFirefoxOSPhone()||this.DetectSailfishPhone()||this.DetectUbuntuPhone()||this.DetectGamingHandheld()?!0:this.DetectBlackBerryWebKit()&&this.DetectBlackBerryTouch()?!0:!1},DetectTierRichCss:function(){return this.initCompleted||this.isTierRichCss?this.isTierRichCss:this.DetectTierIphone()||this.DetectKindle()||this.DetectTierTablet()?!1:this.DetectMobileQuick()?this.DetectWebkit()?!0:this.DetectS60OssBrowser()||this.DetectBlackBerryHigh()||this.DetectWindowsMobile()||this.uagent.search(this.engineTelecaQ)>-1?!0:!1:!1},DetectTierOtherPhones:function(){return this.initCompleted||this.isTierGenericMobile?this.isTierGenericMobile:this.DetectTierIphone()||this.DetectTierRichCss()||this.DetectTierTablet()?!1:this.DetectMobileLong()?!0:!1}};i.InitDeviceScan(),t.MobileEsp=i},8:function(e,t,n){(function(e){"use strict";n(9),e(function(){e("#mobile_navigation .search").click(function(){e("#mobile_skill_input").focus()})})}).call(t,n(2))},9:function(e,t,n){(function(e){"use strict";+function(e){var t=function i(t,n){this.$element=e(t),this.options=e.extend({},i.DEFAULTS,n),this.transitioning=null,this.options.parent&&(this.$parent=e(this.options.parent)),this.options.toggle&&this.toggle()};t.DEFAULTS={toggle:!0},t.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("sidebar-open")){var t=e.Event("show.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.addClass("sidebar-open"),this.transitioning=1;var n=function(){this.$element,this.transitioning=0,this.$element.trigger("shown.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(n,this)).emulateTransitionEnd(400):n.call(this)}}},t.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("sidebar-open")){var t=e.Event("hide.bs.sidebar");if(this.$element.trigger(t),!t.isDefaultPrevented()){this.$element.removeClass("sidebar-open"),this.transitioning=1;var n=function(){this.transitioning=0,this.$element.trigger("hidden.bs.sidebar")};return e.support.transition?void this.$element.one(e.support.transition.end,e.proxy(n,this)).emulateTransitionEnd(400):n.call(this)}}},t.prototype.toggle=function(){this[this.$element.hasClass("sidebar-open")?"hide":"show"]()};var n=e.fn.sidebar;e.fn.sidebar=function(n){return this.each(function(){var i=e(this),r=i.data("bs.sidebar"),a=e.extend({},t.DEFAULTS,i.data(),"object"==typeof a&&n);!r&&a.toggle&&"show"==n&&(n=!n),r||i.data("bs.sidebar",r=new t(this,a)),"string"==typeof n&&r[n]()})},e.fn.sidebar.Constructor=t,e.fn.sidebar.noConflict=function(){return e.fn.sidebar=n,this},e(document).on("click.bs.sidebar.data-api",'[data-toggle="sidebar"]',function(t){var n,i=e(this),r=i.attr("data-target")||t.preventDefault()||(n=i.attr("href"))&&n.replace(/.*(?=#[^\s]+$)/,""),a=e(r),s=a.data("bs.sidebar"),o=s?"toggle":i.data();a.sidebar(o)}),e("html").on("click.bs.sidebar.autohide",function(t){var n=e(t.target),i=n.is('.sidebar, [data-toggle="sidebar"]')||n.parents('.sidebar, [data-toggle="sidebar"]').length;if(!i){var r=e(".sidebar");r.each(function(t,n){var i=e(n);i.data("bs.sidebar")&&i.hasClass("sidebar-open")&&i.sidebar("hide")})}})}(e)}).call(t,n(2))},299:function(e,t,n){(function(e){"use strict";n(300);var t=n(3),i=n(1);window.initializeCallback=function(){function n(t){var n=t.getPlace();e("#id_location").val(n.name+", "+n.vicinity),e("#id_latitude").val(n.geometry.location.k),e("#id_longitude").val(n.geometry.location.D)}t.GoogleAutoComplete(e("#id_location"),n),t.GenericSkillSearchAutocomplete(e("#mobile_search_form"),e("#mobile_search_form").closest("form"))},window.openUrl=function(e){window.location.href=e},e(function(){i.Authenticate(e("#id_phone_number"),function(e){window.location.href=e.location}),e("[data-toggle=popover]").popover({trigger:"hover"});var t=e(".pagination li a");e.each(t,function(t,n){var i=e(n),r=i.attr("href");i.attr("href",r+"#result-display")}),Number.prototype.formatMoney=function(e,t,n){var i=this,e=isNaN(e=Math.abs(e))?2:e,t=void 0==t?".":t,n=void 0==n?",":n,r=0>i?"-":"",a=parseInt(i=Math.abs(+i||0).toFixed(e))+"",s=(s=a.length)>3?s%3:0;return r+(s?a.substr(0,s)+n:"")+a.substr(s).replace(/(\d{3})(?=\d)/g,"$1"+n)+(e?t+Math.abs(i-a).toFixed(e).slice(2):"")},e("#toggle-price-type").on("click",function(){var t=e(this).text().trim(),n=!0,i=e(".monthly_price.price"),r=e(".hourly_price.price");"Monthly"===t?(e(this).text("Hourly"),i.removeClass("hide"),r.addClass("hide")):(e(this).text("Monthly"),n=!1,r.removeClass("hide"),i.addClass("hide"))});var n=e("#slider2"),r=e("#id_start_rate").val(),a=e("#id_end_rate").val(),s={min:parseInt(r),max:a};n.slider({range:!0,values:[s.min,s.max],min:s.min,max:2e4,step:50,slide:function(t,n){var i="₦"+n.values[0]+" - ₦"+n.values[1];n.values[1]>=2e4&&(i+="+"),e("#amount").val(i),e("#id_start_rate").val(n.values[0]),e("#id_end_rate").val(n.values[1])}}),e("#displayFilterBtn").on("click",function(){e(".filter-form-container").fadeIn(1e3),e(this).fadeOut(1e3)});var o="₦"+e("#slider2").slider("values",0)+" -  ₦"+e("#slider2").slider("values",1);e("#slider2").slider("values",1)>=2e4&&(o+="+"),e("#amount").val(o);var l=0;e(document).on("scroll",function(){var t=e(document).scrollTop();t>=80?0==l&&(e(".navigation ").fadeOut("fast"),l++):(l=0,e(".navigation ").fadeIn("fast"))})})}).call(t,n(2))},300:function(e,t,n){var i=n(2);n(301),n(302),n(303),/*!
>>>>>>> master
	 * jQuery UI Slider 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/slider/
	 *
	 * Depends:
	 *	jquery.ui.core.js
	 *	jquery.ui.mouse.js
	 *	jquery.ui.widget.js
	 */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	(function( $, undefined ) {
	
	// number of pages in a slider
	// (how many times can you page up/down to go through the whole range)
	var numPages = 5;
	
	$.widget( "ui.slider", $.ui.mouse, {
		version: "1.10.4",
		widgetEventPrefix: "slide",
	
		options: {
			animate: false,
			distance: 0,
			max: 100,
			min: 0,
			orientation: "horizontal",
			range: false,
			step: 1,
			value: 0,
			values: null,
	
			// callbacks
			change: null,
			slide: null,
			start: null,
			stop: null
		},
	
		_create: function() {
			this._keySliding = false;
			this._mouseSliding = false;
			this._animateOff = true;
			this._handleIndex = null;
			this._detectOrientation();
			this._mouseInit();
	
			this.element
				.addClass( "ui-slider" +
					" ui-slider-" + this.orientation +
					" ui-widget" +
					" ui-widget-content" +
					" ui-corner-all");
	
			this._refresh();
			this._setOption( "disabled", this.options.disabled );
	
			this._animateOff = false;
		},
	
		_refresh: function() {
			this._createRange();
			this._createHandles();
			this._setupEvents();
			this._refreshValue();
		},
	
		_createHandles: function() {
			var i, handleCount,
				options = this.options,
				existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
				handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
				handles = [];
	
			handleCount = ( options.values && options.values.length ) || 1;
	
			if ( existingHandles.length > handleCount ) {
				existingHandles.slice( handleCount ).remove();
				existingHandles = existingHandles.slice( 0, handleCount );
			}
	
			for ( i = existingHandles.length; i < handleCount; i++ ) {
				handles.push( handle );
			}
	
			this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );
	
			this.handle = this.handles.eq( 0 );
	
			this.handles.each(function( i ) {
				$( this ).data( "ui-slider-handle-index", i );
			});
		},
	
		_createRange: function() {
			var options = this.options,
				classes = "";
	
			if ( options.range ) {
				if ( options.range === true ) {
					if ( !options.values ) {
						options.values = [ this._valueMin(), this._valueMin() ];
					} else if ( options.values.length && options.values.length !== 2 ) {
						options.values = [ options.values[0], options.values[0] ];
					} else if ( $.isArray( options.values ) ) {
						options.values = options.values.slice(0);
					}
				}
	
				if ( !this.range || !this.range.length ) {
					this.range = $( "<div></div>" )
						.appendTo( this.element );
	
					classes = "ui-slider-range" +
					// note: this isn't the most fittingly semantic framework class for this element,
					// but worked best visually with a variety of themes
					" ui-widget-header ui-corner-all";
				} else {
					this.range.removeClass( "ui-slider-range-min ui-slider-range-max" )
						// Handle range switching from true to min/max
						.css({
							"left": "",
							"bottom": ""
						});
				}
	
				this.range.addClass( classes +
					( ( options.range === "min" || options.range === "max" ) ? " ui-slider-range-" + options.range : "" ) );
			} else {
				if ( this.range ) {
					this.range.remove();
				}
				this.range = null;
			}
		},
	
		_setupEvents: function() {
			var elements = this.handles.add( this.range ).filter( "a" );
			this._off( elements );
			this._on( elements, this._handleEvents );
			this._hoverable( elements );
			this._focusable( elements );
		},
	
		_destroy: function() {
			this.handles.remove();
			if ( this.range ) {
				this.range.remove();
			}
	
			this.element
				.removeClass( "ui-slider" +
					" ui-slider-horizontal" +
					" ui-slider-vertical" +
					" ui-widget" +
					" ui-widget-content" +
					" ui-corner-all" );
	
			this._mouseDestroy();
		},
	
		_mouseCapture: function( event ) {
			var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
				that = this,
				o = this.options;
	
			if ( o.disabled ) {
				return false;
			}
	
			this.elementSize = {
				width: this.element.outerWidth(),
				height: this.element.outerHeight()
			};
			this.elementOffset = this.element.offset();
	
			position = { x: event.pageX, y: event.pageY };
			normValue = this._normValueFromMouse( position );
			distance = this._valueMax() - this._valueMin() + 1;
			this.handles.each(function( i ) {
				var thisDistance = Math.abs( normValue - that.values(i) );
				if (( distance > thisDistance ) ||
					( distance === thisDistance &&
						(i === that._lastChangedValue || that.values(i) === o.min ))) {
					distance = thisDistance;
					closestHandle = $( this );
					index = i;
				}
			});
	
			allowed = this._start( event, index );
			if ( allowed === false ) {
				return false;
			}
			this._mouseSliding = true;
	
			this._handleIndex = index;
	
			closestHandle
				.addClass( "ui-state-active" )
				.focus();
	
			offset = closestHandle.offset();
			mouseOverHandle = !$( event.target ).parents().addBack().is( ".ui-slider-handle" );
			this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
				left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
				top: event.pageY - offset.top -
					( closestHandle.height() / 2 ) -
					( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
					( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
					( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
			};
	
			if ( !this.handles.hasClass( "ui-state-hover" ) ) {
				this._slide( event, index, normValue );
			}
			this._animateOff = true;
			return true;
		},
	
		_mouseStart: function() {
			return true;
		},
	
		_mouseDrag: function( event ) {
			var position = { x: event.pageX, y: event.pageY },
				normValue = this._normValueFromMouse( position );
	
			this._slide( event, this._handleIndex, normValue );
	
			return false;
		},
	
		_mouseStop: function( event ) {
			this.handles.removeClass( "ui-state-active" );
			this._mouseSliding = false;
	
			this._stop( event, this._handleIndex );
			this._change( event, this._handleIndex );
	
			this._handleIndex = null;
			this._clickOffset = null;
			this._animateOff = false;
	
			return false;
		},
	
		_detectOrientation: function() {
			this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
		},
	
		_normValueFromMouse: function( position ) {
			var pixelTotal,
				pixelMouse,
				percentMouse,
				valueTotal,
				valueMouse;
	
			if ( this.orientation === "horizontal" ) {
				pixelTotal = this.elementSize.width;
				pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
			} else {
				pixelTotal = this.elementSize.height;
				pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
			}
	
			percentMouse = ( pixelMouse / pixelTotal );
			if ( percentMouse > 1 ) {
				percentMouse = 1;
			}
			if ( percentMouse < 0 ) {
				percentMouse = 0;
			}
			if ( this.orientation === "vertical" ) {
				percentMouse = 1 - percentMouse;
			}
	
			valueTotal = this._valueMax() - this._valueMin();
			valueMouse = this._valueMin() + percentMouse * valueTotal;
	
			return this._trimAlignValue( valueMouse );
		},
	
		_start: function( event, index ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}
			return this._trigger( "start", event, uiHash );
		},
	
		_slide: function( event, index, newVal ) {
			var otherVal,
				newValues,
				allowed;
	
			if ( this.options.values && this.options.values.length ) {
				otherVal = this.values( index ? 0 : 1 );
	
				if ( ( this.options.values.length === 2 && this.options.range === true ) &&
						( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
					) {
					newVal = otherVal;
				}
	
				if ( newVal !== this.values( index ) ) {
					newValues = this.values();
					newValues[ index ] = newVal;
					// A slide can be canceled by returning false from the slide callback
					allowed = this._trigger( "slide", event, {
						handle: this.handles[ index ],
						value: newVal,
						values: newValues
					} );
					otherVal = this.values( index ? 0 : 1 );
					if ( allowed !== false ) {
						this.values( index, newVal );
					}
				}
			} else {
				if ( newVal !== this.value() ) {
					// A slide can be canceled by returning false from the slide callback
					allowed = this._trigger( "slide", event, {
						handle: this.handles[ index ],
						value: newVal
					} );
					if ( allowed !== false ) {
						this.value( newVal );
					}
				}
			}
		},
	
		_stop: function( event, index ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}
	
			this._trigger( "stop", event, uiHash );
		},
	
		_change: function( event, index ) {
			if ( !this._keySliding && !this._mouseSliding ) {
				var uiHash = {
					handle: this.handles[ index ],
					value: this.value()
				};
				if ( this.options.values && this.options.values.length ) {
					uiHash.value = this.values( index );
					uiHash.values = this.values();
				}
	
				//store the last changed value index for reference when handles overlap
				this._lastChangedValue = index;
	
				this._trigger( "change", event, uiHash );
			}
		},
	
		value: function( newValue ) {
			if ( arguments.length ) {
				this.options.value = this._trimAlignValue( newValue );
				this._refreshValue();
				this._change( null, 0 );
				return;
			}
	
			return this._value();
		},
	
		values: function( index, newValue ) {
			var vals,
				newValues,
				i;
	
			if ( arguments.length > 1 ) {
				this.options.values[ index ] = this._trimAlignValue( newValue );
				this._refreshValue();
				this._change( null, index );
				return;
			}
	
			if ( arguments.length ) {
				if ( $.isArray( arguments[ 0 ] ) ) {
					vals = this.options.values;
					newValues = arguments[ 0 ];
					for ( i = 0; i < vals.length; i += 1 ) {
						vals[ i ] = this._trimAlignValue( newValues[ i ] );
						this._change( null, i );
					}
					this._refreshValue();
				} else {
					if ( this.options.values && this.options.values.length ) {
						return this._values( index );
					} else {
						return this.value();
					}
				}
			} else {
				return this._values();
			}
		},
	
		_setOption: function( key, value ) {
			var i,
				valsLength = 0;
	
			if ( key === "range" && this.options.range === true ) {
				if ( value === "min" ) {
					this.options.value = this._values( 0 );
					this.options.values = null;
				} else if ( value === "max" ) {
					this.options.value = this._values( this.options.values.length-1 );
					this.options.values = null;
				}
			}
	
			if ( $.isArray( this.options.values ) ) {
				valsLength = this.options.values.length;
			}
	
			$.Widget.prototype._setOption.apply( this, arguments );
	
			switch ( key ) {
				case "orientation":
					this._detectOrientation();
					this.element
						.removeClass( "ui-slider-horizontal ui-slider-vertical" )
						.addClass( "ui-slider-" + this.orientation );
					this._refreshValue();
					break;
				case "value":
					this._animateOff = true;
					this._refreshValue();
					this._change( null, 0 );
					this._animateOff = false;
					break;
				case "values":
					this._animateOff = true;
					this._refreshValue();
					for ( i = 0; i < valsLength; i += 1 ) {
						this._change( null, i );
					}
					this._animateOff = false;
					break;
				case "min":
				case "max":
					this._animateOff = true;
					this._refreshValue();
					this._animateOff = false;
					break;
				case "range":
					this._animateOff = true;
					this._refresh();
					this._animateOff = false;
					break;
			}
		},
	
		//internal value getter
		// _value() returns value trimmed by min and max, aligned by step
		_value: function() {
			var val = this.options.value;
			val = this._trimAlignValue( val );
	
			return val;
		},
	
		//internal values getter
		// _values() returns array of values trimmed by min and max, aligned by step
		// _values( index ) returns single value trimmed by min and max, aligned by step
		_values: function( index ) {
			var val,
				vals,
				i;
	
			if ( arguments.length ) {
				val = this.options.values[ index ];
				val = this._trimAlignValue( val );
	
				return val;
			} else if ( this.options.values && this.options.values.length ) {
				// .slice() creates a copy of the array
				// this copy gets trimmed by min and max and then returned
				vals = this.options.values.slice();
				for ( i = 0; i < vals.length; i+= 1) {
					vals[ i ] = this._trimAlignValue( vals[ i ] );
				}
	
				return vals;
			} else {
				return [];
			}
		},
	
		// returns the step-aligned value that val is closest to, between (inclusive) min and max
		_trimAlignValue: function( val ) {
			if ( val <= this._valueMin() ) {
				return this._valueMin();
			}
			if ( val >= this._valueMax() ) {
				return this._valueMax();
			}
			var step = ( this.options.step > 0 ) ? this.options.step : 1,
				valModStep = (val - this._valueMin()) % step,
				alignValue = val - valModStep;
	
			if ( Math.abs(valModStep) * 2 >= step ) {
				alignValue += ( valModStep > 0 ) ? step : ( -step );
			}
	
			// Since JavaScript has problems with large floats, round
			// the final value to 5 digits after the decimal point (see #4124)
			return parseFloat( alignValue.toFixed(5) );
		},
	
		_valueMin: function() {
			return this.options.min;
		},
	
		_valueMax: function() {
			return this.options.max;
		},
	
		_refreshValue: function() {
			var lastValPercent, valPercent, value, valueMin, valueMax,
				oRange = this.options.range,
				o = this.options,
				that = this,
				animate = ( !this._animateOff ) ? o.animate : false,
				_set = {};
	
			if ( this.options.values && this.options.values.length ) {
				this.handles.each(function( i ) {
					valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
					_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
					$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
					if ( that.options.range === true ) {
						if ( that.orientation === "horizontal" ) {
							if ( i === 0 ) {
								that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
							}
							if ( i === 1 ) {
								that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
							}
						} else {
							if ( i === 0 ) {
								that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
							}
							if ( i === 1 ) {
								that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
							}
						}
					}
					lastValPercent = valPercent;
				});
			} else {
				value = this.value();
				valueMin = this._valueMin();
				valueMax = this._valueMax();
				valPercent = ( valueMax !== valueMin ) ?
						( value - valueMin ) / ( valueMax - valueMin ) * 100 :
						0;
				_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
	
				if ( oRange === "min" && this.orientation === "horizontal" ) {
					this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
				}
				if ( oRange === "max" && this.orientation === "horizontal" ) {
					this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
				}
				if ( oRange === "min" && this.orientation === "vertical" ) {
					this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
				}
				if ( oRange === "max" && this.orientation === "vertical" ) {
					this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
				}
			}
		},
	
		_handleEvents: {
			keydown: function( event ) {
				var allowed, curVal, newVal, step,
					index = $( event.target ).data( "ui-slider-handle-index" );
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.END:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						event.preventDefault();
						if ( !this._keySliding ) {
							this._keySliding = true;
							$( event.target ).addClass( "ui-state-active" );
							allowed = this._start( event, index );
							if ( allowed === false ) {
								return;
							}
						}
						break;
				}
	
				step = this.options.step;
				if ( this.options.values && this.options.values.length ) {
					curVal = newVal = this.values( index );
				} else {
					curVal = newVal = this.value();
				}
	
				switch ( event.keyCode ) {
					case $.ui.keyCode.HOME:
						newVal = this._valueMin();
						break;
					case $.ui.keyCode.END:
						newVal = this._valueMax();
						break;
					case $.ui.keyCode.PAGE_UP:
						newVal = this._trimAlignValue( curVal + ( (this._valueMax() - this._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.PAGE_DOWN:
						newVal = this._trimAlignValue( curVal - ( (this._valueMax() - this._valueMin()) / numPages ) );
						break;
					case $.ui.keyCode.UP:
					case $.ui.keyCode.RIGHT:
						if ( curVal === this._valueMax() ) {
							return;
						}
						newVal = this._trimAlignValue( curVal + step );
						break;
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.LEFT:
						if ( curVal === this._valueMin() ) {
							return;
						}
						newVal = this._trimAlignValue( curVal - step );
						break;
				}
	
				this._slide( event, index, newVal );
			},
			click: function( event ) {
				event.preventDefault();
			},
			keyup: function( event ) {
				var index = $( event.target ).data( "ui-slider-handle-index" );
	
				if ( this._keySliding ) {
					this._keySliding = false;
					this._stop( event, index );
					this._change( event, index );
					$( event.target ).removeClass( "ui-state-active" );
				}
			}
		}
	
	});
	
	}(jQuery));


/***/ },

/***/ 122:
/***/ function(module, exports, __webpack_require__) {

	var jQuery = __webpack_require__(1);
	
	/*!
=======
function(e,t){var n=5;e.widget("ui.slider",e.ui.mouse,{version:"1.10.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var t,n,i=this.options,a=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),r="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",s=[];for(n=i.values&&i.values.length||1,a.length>n&&(a.slice(n).remove(),a=a.slice(0,n)),t=a.length;n>t;t++)s.push(r);this.handles=a.add(e(s.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(t){e(this).data("ui-slider-handle-index",t)})},_createRange:function(){var t=this.options,n="";t.range?(t.range===!0&&(t.values?t.values.length&&2!==t.values.length?t.values=[t.values[0],t.values[0]]:e.isArray(t.values)&&(t.values=t.values.slice(0)):t.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=e("<div></div>").appendTo(this.element),n="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(n+("min"===t.range||"max"===t.range?" ui-slider-range-"+t.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){var e=this.handles.add(this.range).filter("a");this._off(e),this._on(e,this._handleEvents),this._hoverable(e),this._focusable(e)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(t){var n,i,a,r,s,o,l,u,c=this,d=this.options;return d.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),n={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(n),a=this._valueMax()-this._valueMin()+1,this.handles.each(function(t){var n=Math.abs(i-c.values(t));(a>n||a===n&&(t===c._lastChangedValue||c.values(t)===d.min))&&(a=n,r=e(this),s=t)}),o=this._start(t,s),o===!1?!1:(this._mouseSliding=!0,this._handleIndex=s,r.addClass("ui-state-active").focus(),l=r.offset(),u=!e(t.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=u?{left:0,top:0}:{left:t.pageX-l.left-r.width()/2,top:t.pageY-l.top-r.height()/2-(parseInt(r.css("borderTopWidth"),10)||0)-(parseInt(r.css("borderBottomWidth"),10)||0)+(parseInt(r.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(t,s,i),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(e){var t={x:e.pageX,y:e.pageY},n=this._normValueFromMouse(t);return this._slide(e,this._handleIndex,n),!1},_mouseStop:function(e){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(e,this._handleIndex),this._change(e,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(e){var t,n,i,a,r;return"horizontal"===this.orientation?(t=this.elementSize.width,n=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(t=this.elementSize.height,n=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),i=n/t,i>1&&(i=1),0>i&&(i=0),"vertical"===this.orientation&&(i=1-i),a=this._valueMax()-this._valueMin(),r=this._valueMin()+i*a,this._trimAlignValue(r)},_start:function(e,t){var n={handle:this.handles[t],value:this.value()};return this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._trigger("start",e,n)},_slide:function(e,t,n){var i,a,r;this.options.values&&this.options.values.length?(i=this.values(t?0:1),2===this.options.values.length&&this.options.range===!0&&(0===t&&n>i||1===t&&i>n)&&(n=i),n!==this.values(t)&&(a=this.values(),a[t]=n,r=this._trigger("slide",e,{handle:this.handles[t],value:n,values:a}),i=this.values(t?0:1),r!==!1&&this.values(t,n))):n!==this.value()&&(r=this._trigger("slide",e,{handle:this.handles[t],value:n}),r!==!1&&this.value(n))},_stop:function(e,t){var n={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._trigger("stop",e,n)},_change:function(e,t){if(!this._keySliding&&!this._mouseSliding){var n={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._lastChangedValue=t,this._trigger("change",e,n)}},value:function(e){return arguments.length?(this.options.value=this._trimAlignValue(e),this._refreshValue(),void this._change(null,0)):this._value()},values:function(t,n){var i,a,r;if(arguments.length>1)return this.options.values[t]=this._trimAlignValue(n),this._refreshValue(),void this._change(null,t);if(!arguments.length)return this._values();if(!e.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(t):this.value();for(i=this.options.values,a=arguments[0],r=0;r<i.length;r+=1)i[r]=this._trimAlignValue(a[r]),this._change(null,r);this._refreshValue()},_setOption:function(t,n){var i,a=0;switch("range"===t&&this.options.range===!0&&("min"===n?(this.options.value=this._values(0),this.options.values=null):"max"===n&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),e.isArray(this.options.values)&&(a=this.options.values.length),e.Widget.prototype._setOption.apply(this,arguments),t){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),i=0;a>i;i+=1)this._change(null,i);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var e=this.options.value;return e=this._trimAlignValue(e)},_values:function(e){var t,n,i;if(arguments.length)return t=this.options.values[e],t=this._trimAlignValue(t);if(this.options.values&&this.options.values.length){for(n=this.options.values.slice(),i=0;i<n.length;i+=1)n[i]=this._trimAlignValue(n[i]);return n}return[]},_trimAlignValue:function(e){if(e<=this._valueMin())return this._valueMin();if(e>=this._valueMax())return this._valueMax();var t=this.options.step>0?this.options.step:1,n=(e-this._valueMin())%t,i=e-n;return 2*Math.abs(n)>=t&&(i+=n>0?t:-t),parseFloat(i.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var t,n,i,a,r,s=this.options.range,o=this.options,l=this,u=this._animateOff?!1:o.animate,c={};this.options.values&&this.options.values.length?this.handles.each(function(i){n=(l.values(i)-l._valueMin())/(l._valueMax()-l._valueMin())*100,c["horizontal"===l.orientation?"left":"bottom"]=n+"%",e(this).stop(1,1)[u?"animate":"css"](c,o.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===i&&l.range.stop(1,1)[u?"animate":"css"]({left:n+"%"},o.animate),1===i&&l.range[u?"animate":"css"]({width:n-t+"%"},{queue:!1,duration:o.animate})):(0===i&&l.range.stop(1,1)[u?"animate":"css"]({bottom:n+"%"},o.animate),1===i&&l.range[u?"animate":"css"]({height:n-t+"%"},{queue:!1,duration:o.animate}))),t=n}):(i=this.value(),a=this._valueMin(),r=this._valueMax(),n=r!==a?(i-a)/(r-a)*100:0,c["horizontal"===this.orientation?"left":"bottom"]=n+"%",this.handle.stop(1,1)[u?"animate":"css"](c,o.animate),"min"===s&&"horizontal"===this.orientation&&this.range.stop(1,1)[u?"animate":"css"]({width:n+"%"},o.animate),"max"===s&&"horizontal"===this.orientation&&this.range[u?"animate":"css"]({width:100-n+"%"},{queue:!1,duration:o.animate}),"min"===s&&"vertical"===this.orientation&&this.range.stop(1,1)[u?"animate":"css"]({height:n+"%"},o.animate),"max"===s&&"vertical"===this.orientation&&this.range[u?"animate":"css"]({height:100-n+"%"},{queue:!1,duration:o.animate}))},_handleEvents:{keydown:function(t){var i,a,r,s,o=e(t.target).data("ui-slider-handle-index");switch(t.keyCode){case e.ui.keyCode.HOME:case e.ui.keyCode.END:case e.ui.keyCode.PAGE_UP:case e.ui.keyCode.PAGE_DOWN:case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(t.preventDefault(),!this._keySliding&&(this._keySliding=!0,e(t.target).addClass("ui-state-active"),i=this._start(t,o),i===!1))return}switch(s=this.options.step,a=r=this.options.values&&this.options.values.length?this.values(o):this.value(),t.keyCode){case e.ui.keyCode.HOME:r=this._valueMin();break;case e.ui.keyCode.END:r=this._valueMax();break;case e.ui.keyCode.PAGE_UP:r=this._trimAlignValue(a+(this._valueMax()-this._valueMin())/n);break;case e.ui.keyCode.PAGE_DOWN:r=this._trimAlignValue(a-(this._valueMax()-this._valueMin())/n);break;case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:if(a===this._valueMax())return;r=this._trimAlignValue(a+s);break;case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(a===this._valueMin())return;r=this._trimAlignValue(a-s)}this._slide(t,o,r)},click:function(e){e.preventDefault()},keyup:function(t){var n=e(t.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(t,n),this._change(t,n),e(t.target).removeClass("ui-state-active"))}}})}(i)},121:function(e,t,n){var i=n(2);/*!
>>>>>>> develop
=======
function(e,t){var i=5;e.widget("ui.slider",e.ui.mouse,{version:"1.10.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var t,i,n=this.options,a=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),s="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",o=[];for(i=n.values&&n.values.length||1,a.length>i&&(a.slice(i).remove(),a=a.slice(0,i)),t=a.length;i>t;t++)o.push(s);this.handles=a.add(e(o.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(t){e(this).data("ui-slider-handle-index",t)})},_createRange:function(){var t=this.options,i="";t.range?(t.range===!0&&(t.values?t.values.length&&2!==t.values.length?t.values=[t.values[0],t.values[0]]:e.isArray(t.values)&&(t.values=t.values.slice(0)):t.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=e("<div></div>").appendTo(this.element),i="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(i+("min"===t.range||"max"===t.range?" ui-slider-range-"+t.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){var e=this.handles.add(this.range).filter("a");this._off(e),this._on(e,this._handleEvents),this._hoverable(e),this._focusable(e)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(t){var i,n,a,s,o,r,l,c,u=this,h=this.options;return h.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),i={x:t.pageX,y:t.pageY},n=this._normValueFromMouse(i),a=this._valueMax()-this._valueMin()+1,this.handles.each(function(t){var i=Math.abs(n-u.values(t));(a>i||a===i&&(t===u._lastChangedValue||u.values(t)===h.min))&&(a=i,s=e(this),o=t)}),r=this._start(t,o),r===!1?!1:(this._mouseSliding=!0,this._handleIndex=o,s.addClass("ui-state-active").focus(),l=s.offset(),c=!e(t.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=c?{left:0,top:0}:{left:t.pageX-l.left-s.width()/2,top:t.pageY-l.top-s.height()/2-(parseInt(s.css("borderTopWidth"),10)||0)-(parseInt(s.css("borderBottomWidth"),10)||0)+(parseInt(s.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(t,o,n),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(e){var t={x:e.pageX,y:e.pageY},i=this._normValueFromMouse(t);return this._slide(e,this._handleIndex,i),!1},_mouseStop:function(e){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(e,this._handleIndex),this._change(e,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(e){var t,i,n,a,s;return"horizontal"===this.orientation?(t=this.elementSize.width,i=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(t=this.elementSize.height,i=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),n=i/t,n>1&&(n=1),0>n&&(n=0),"vertical"===this.orientation&&(n=1-n),a=this._valueMax()-this._valueMin(),s=this._valueMin()+n*a,this._trimAlignValue(s)},_start:function(e,t){var i={handle:this.handles[t],value:this.value()};return this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._trigger("start",e,i)},_slide:function(e,t,i){var n,a,s;this.options.values&&this.options.values.length?(n=this.values(t?0:1),2===this.options.values.length&&this.options.range===!0&&(0===t&&i>n||1===t&&n>i)&&(i=n),i!==this.values(t)&&(a=this.values(),a[t]=i,s=this._trigger("slide",e,{handle:this.handles[t],value:i,values:a}),n=this.values(t?0:1),s!==!1&&this.values(t,i))):i!==this.value()&&(s=this._trigger("slide",e,{handle:this.handles[t],value:i}),s!==!1&&this.value(i))},_stop:function(e,t){var i={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._trigger("stop",e,i)},_change:function(e,t){if(!this._keySliding&&!this._mouseSliding){var i={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(i.value=this.values(t),i.values=this.values()),this._lastChangedValue=t,this._trigger("change",e,i)}},value:function(e){return arguments.length?(this.options.value=this._trimAlignValue(e),this._refreshValue(),void this._change(null,0)):this._value()},values:function(t,i){var n,a,s;if(arguments.length>1)return this.options.values[t]=this._trimAlignValue(i),this._refreshValue(),void this._change(null,t);if(!arguments.length)return this._values();if(!e.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(t):this.value();for(n=this.options.values,a=arguments[0],s=0;s<n.length;s+=1)n[s]=this._trimAlignValue(a[s]),this._change(null,s);this._refreshValue()},_setOption:function(t,i){var n,a=0;switch("range"===t&&this.options.range===!0&&("min"===i?(this.options.value=this._values(0),this.options.values=null):"max"===i&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),e.isArray(this.options.values)&&(a=this.options.values.length),e.Widget.prototype._setOption.apply(this,arguments),t){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),n=0;a>n;n+=1)this._change(null,n);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var e=this.options.value;return e=this._trimAlignValue(e)},_values:function(e){var t,i,n;if(arguments.length)return t=this.options.values[e],t=this._trimAlignValue(t);if(this.options.values&&this.options.values.length){for(i=this.options.values.slice(),n=0;n<i.length;n+=1)i[n]=this._trimAlignValue(i[n]);return i}return[]},_trimAlignValue:function(e){if(e<=this._valueMin())return this._valueMin();if(e>=this._valueMax())return this._valueMax();var t=this.options.step>0?this.options.step:1,i=(e-this._valueMin())%t,n=e-i;return 2*Math.abs(i)>=t&&(n+=i>0?t:-t),parseFloat(n.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var t,i,n,a,s,o=this.options.range,r=this.options,l=this,c=this._animateOff?!1:r.animate,u={};this.options.values&&this.options.values.length?this.handles.each(function(n){i=(l.values(n)-l._valueMin())/(l._valueMax()-l._valueMin())*100,u["horizontal"===l.orientation?"left":"bottom"]=i+"%",e(this).stop(1,1)[c?"animate":"css"](u,r.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===n&&l.range.stop(1,1)[c?"animate":"css"]({left:i+"%"},r.animate),1===n&&l.range[c?"animate":"css"]({width:i-t+"%"},{queue:!1,duration:r.animate})):(0===n&&l.range.stop(1,1)[c?"animate":"css"]({bottom:i+"%"},r.animate),1===n&&l.range[c?"animate":"css"]({height:i-t+"%"},{queue:!1,duration:r.animate}))),t=i}):(n=this.value(),a=this._valueMin(),s=this._valueMax(),i=s!==a?(n-a)/(s-a)*100:0,u["horizontal"===this.orientation?"left":"bottom"]=i+"%",this.handle.stop(1,1)[c?"animate":"css"](u,r.animate),"min"===o&&"horizontal"===this.orientation&&this.range.stop(1,1)[c?"animate":"css"]({width:i+"%"},r.animate),"max"===o&&"horizontal"===this.orientation&&this.range[c?"animate":"css"]({width:100-i+"%"},{queue:!1,duration:r.animate}),"min"===o&&"vertical"===this.orientation&&this.range.stop(1,1)[c?"animate":"css"]({height:i+"%"},r.animate),"max"===o&&"vertical"===this.orientation&&this.range[c?"animate":"css"]({height:100-i+"%"},{queue:!1,duration:r.animate}))},_handleEvents:{keydown:function(t){var n,a,s,o,r=e(t.target).data("ui-slider-handle-index");switch(t.keyCode){case e.ui.keyCode.HOME:case e.ui.keyCode.END:case e.ui.keyCode.PAGE_UP:case e.ui.keyCode.PAGE_DOWN:case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(t.preventDefault(),!this._keySliding&&(this._keySliding=!0,e(t.target).addClass("ui-state-active"),n=this._start(t,r),n===!1))return}switch(o=this.options.step,a=s=this.options.values&&this.options.values.length?this.values(r):this.value(),t.keyCode){case e.ui.keyCode.HOME:s=this._valueMin();break;case e.ui.keyCode.END:s=this._valueMax();break;case e.ui.keyCode.PAGE_UP:s=this._trimAlignValue(a+(this._valueMax()-this._valueMin())/i);break;case e.ui.keyCode.PAGE_DOWN:s=this._trimAlignValue(a-(this._valueMax()-this._valueMin())/i);break;case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:if(a===this._valueMax())return;s=this._trimAlignValue(a+o);break;case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(a===this._valueMin())return;s=this._trimAlignValue(a-o)}this._slide(t,r,s)},click:function(e){e.preventDefault()},keyup:function(t){var i=e(t.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(t,i),this._change(t,i),e(t.target).removeClass("ui-state-active"))}}})}(n)},function(e,t,i){var n=i(2);/*!
>>>>>>> master
=======
function(e,t){var n=5;e.widget("ui.slider",e.ui.mouse,{version:"1.10.4",widgetEventPrefix:"slide",options:{animate:!1,distance:0,max:100,min:0,orientation:"horizontal",range:!1,step:1,value:0,values:null,change:null,slide:null,start:null,stop:null},_create:function(){this._keySliding=!1,this._mouseSliding=!1,this._animateOff=!0,this._handleIndex=null,this._detectOrientation(),this._mouseInit(),this.element.addClass("ui-slider ui-slider-"+this.orientation+" ui-widget ui-widget-content ui-corner-all"),this._refresh(),this._setOption("disabled",this.options.disabled),this._animateOff=!1},_refresh:function(){this._createRange(),this._createHandles(),this._setupEvents(),this._refreshValue()},_createHandles:function(){var t,n,i=this.options,r=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),a="<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",s=[];for(n=i.values&&i.values.length||1,r.length>n&&(r.slice(n).remove(),r=r.slice(0,n)),t=r.length;n>t;t++)s.push(a);this.handles=r.add(e(s.join("")).appendTo(this.element)),this.handle=this.handles.eq(0),this.handles.each(function(t){e(this).data("ui-slider-handle-index",t)})},_createRange:function(){var t=this.options,n="";t.range?(t.range===!0&&(t.values?t.values.length&&2!==t.values.length?t.values=[t.values[0],t.values[0]]:e.isArray(t.values)&&(t.values=t.values.slice(0)):t.values=[this._valueMin(),this._valueMin()]),this.range&&this.range.length?this.range.removeClass("ui-slider-range-min ui-slider-range-max").css({left:"",bottom:""}):(this.range=e("<div></div>").appendTo(this.element),n="ui-slider-range ui-widget-header ui-corner-all"),this.range.addClass(n+("min"===t.range||"max"===t.range?" ui-slider-range-"+t.range:""))):(this.range&&this.range.remove(),this.range=null)},_setupEvents:function(){var e=this.handles.add(this.range).filter("a");this._off(e),this._on(e,this._handleEvents),this._hoverable(e),this._focusable(e)},_destroy:function(){this.handles.remove(),this.range&&this.range.remove(),this.element.removeClass("ui-slider ui-slider-horizontal ui-slider-vertical ui-widget ui-widget-content ui-corner-all"),this._mouseDestroy()},_mouseCapture:function(t){var n,i,r,a,s,o,l,u,c=this,d=this.options;return d.disabled?!1:(this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()},this.elementOffset=this.element.offset(),n={x:t.pageX,y:t.pageY},i=this._normValueFromMouse(n),r=this._valueMax()-this._valueMin()+1,this.handles.each(function(t){var n=Math.abs(i-c.values(t));(r>n||r===n&&(t===c._lastChangedValue||c.values(t)===d.min))&&(r=n,a=e(this),s=t)}),o=this._start(t,s),o===!1?!1:(this._mouseSliding=!0,this._handleIndex=s,a.addClass("ui-state-active").focus(),l=a.offset(),u=!e(t.target).parents().addBack().is(".ui-slider-handle"),this._clickOffset=u?{left:0,top:0}:{left:t.pageX-l.left-a.width()/2,top:t.pageY-l.top-a.height()/2-(parseInt(a.css("borderTopWidth"),10)||0)-(parseInt(a.css("borderBottomWidth"),10)||0)+(parseInt(a.css("marginTop"),10)||0)},this.handles.hasClass("ui-state-hover")||this._slide(t,s,i),this._animateOff=!0,!0))},_mouseStart:function(){return!0},_mouseDrag:function(e){var t={x:e.pageX,y:e.pageY},n=this._normValueFromMouse(t);return this._slide(e,this._handleIndex,n),!1},_mouseStop:function(e){return this.handles.removeClass("ui-state-active"),this._mouseSliding=!1,this._stop(e,this._handleIndex),this._change(e,this._handleIndex),this._handleIndex=null,this._clickOffset=null,this._animateOff=!1,!1},_detectOrientation:function(){this.orientation="vertical"===this.options.orientation?"vertical":"horizontal"},_normValueFromMouse:function(e){var t,n,i,r,a;return"horizontal"===this.orientation?(t=this.elementSize.width,n=e.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0)):(t=this.elementSize.height,n=e.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0)),i=n/t,i>1&&(i=1),0>i&&(i=0),"vertical"===this.orientation&&(i=1-i),r=this._valueMax()-this._valueMin(),a=this._valueMin()+i*r,this._trimAlignValue(a)},_start:function(e,t){var n={handle:this.handles[t],value:this.value()};return this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._trigger("start",e,n)},_slide:function(e,t,n){var i,r,a;this.options.values&&this.options.values.length?(i=this.values(t?0:1),2===this.options.values.length&&this.options.range===!0&&(0===t&&n>i||1===t&&i>n)&&(n=i),n!==this.values(t)&&(r=this.values(),r[t]=n,a=this._trigger("slide",e,{handle:this.handles[t],value:n,values:r}),i=this.values(t?0:1),a!==!1&&this.values(t,n))):n!==this.value()&&(a=this._trigger("slide",e,{handle:this.handles[t],value:n}),a!==!1&&this.value(n))},_stop:function(e,t){var n={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._trigger("stop",e,n)},_change:function(e,t){if(!this._keySliding&&!this._mouseSliding){var n={handle:this.handles[t],value:this.value()};this.options.values&&this.options.values.length&&(n.value=this.values(t),n.values=this.values()),this._lastChangedValue=t,this._trigger("change",e,n)}},value:function(e){return arguments.length?(this.options.value=this._trimAlignValue(e),this._refreshValue(),void this._change(null,0)):this._value()},values:function(t,n){var i,r,a;if(arguments.length>1)return this.options.values[t]=this._trimAlignValue(n),this._refreshValue(),void this._change(null,t);if(!arguments.length)return this._values();if(!e.isArray(arguments[0]))return this.options.values&&this.options.values.length?this._values(t):this.value();for(i=this.options.values,r=arguments[0],a=0;a<i.length;a+=1)i[a]=this._trimAlignValue(r[a]),this._change(null,a);this._refreshValue()},_setOption:function(t,n){var i,r=0;switch("range"===t&&this.options.range===!0&&("min"===n?(this.options.value=this._values(0),this.options.values=null):"max"===n&&(this.options.value=this._values(this.options.values.length-1),this.options.values=null)),e.isArray(this.options.values)&&(r=this.options.values.length),e.Widget.prototype._setOption.apply(this,arguments),t){case"orientation":this._detectOrientation(),this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation),this._refreshValue();break;case"value":this._animateOff=!0,this._refreshValue(),this._change(null,0),this._animateOff=!1;break;case"values":for(this._animateOff=!0,this._refreshValue(),i=0;r>i;i+=1)this._change(null,i);this._animateOff=!1;break;case"min":case"max":this._animateOff=!0,this._refreshValue(),this._animateOff=!1;break;case"range":this._animateOff=!0,this._refresh(),this._animateOff=!1}},_value:function(){var e=this.options.value;return e=this._trimAlignValue(e)},_values:function(e){var t,n,i;if(arguments.length)return t=this.options.values[e],t=this._trimAlignValue(t);if(this.options.values&&this.options.values.length){for(n=this.options.values.slice(),i=0;i<n.length;i+=1)n[i]=this._trimAlignValue(n[i]);return n}return[]},_trimAlignValue:function(e){if(e<=this._valueMin())return this._valueMin();if(e>=this._valueMax())return this._valueMax();var t=this.options.step>0?this.options.step:1,n=(e-this._valueMin())%t,i=e-n;return 2*Math.abs(n)>=t&&(i+=n>0?t:-t),parseFloat(i.toFixed(5))},_valueMin:function(){return this.options.min},_valueMax:function(){return this.options.max},_refreshValue:function(){var t,n,i,r,a,s=this.options.range,o=this.options,l=this,u=this._animateOff?!1:o.animate,c={};this.options.values&&this.options.values.length?this.handles.each(function(i){n=(l.values(i)-l._valueMin())/(l._valueMax()-l._valueMin())*100,c["horizontal"===l.orientation?"left":"bottom"]=n+"%",e(this).stop(1,1)[u?"animate":"css"](c,o.animate),l.options.range===!0&&("horizontal"===l.orientation?(0===i&&l.range.stop(1,1)[u?"animate":"css"]({left:n+"%"},o.animate),1===i&&l.range[u?"animate":"css"]({width:n-t+"%"},{queue:!1,duration:o.animate})):(0===i&&l.range.stop(1,1)[u?"animate":"css"]({bottom:n+"%"},o.animate),1===i&&l.range[u?"animate":"css"]({height:n-t+"%"},{queue:!1,duration:o.animate}))),t=n}):(i=this.value(),r=this._valueMin(),a=this._valueMax(),n=a!==r?(i-r)/(a-r)*100:0,c["horizontal"===this.orientation?"left":"bottom"]=n+"%",this.handle.stop(1,1)[u?"animate":"css"](c,o.animate),"min"===s&&"horizontal"===this.orientation&&this.range.stop(1,1)[u?"animate":"css"]({width:n+"%"},o.animate),"max"===s&&"horizontal"===this.orientation&&this.range[u?"animate":"css"]({width:100-n+"%"},{queue:!1,duration:o.animate}),"min"===s&&"vertical"===this.orientation&&this.range.stop(1,1)[u?"animate":"css"]({height:n+"%"},o.animate),"max"===s&&"vertical"===this.orientation&&this.range[u?"animate":"css"]({height:100-n+"%"},{queue:!1,duration:o.animate}))},_handleEvents:{keydown:function(t){var i,r,a,s,o=e(t.target).data("ui-slider-handle-index");switch(t.keyCode){case e.ui.keyCode.HOME:case e.ui.keyCode.END:case e.ui.keyCode.PAGE_UP:case e.ui.keyCode.PAGE_DOWN:case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(t.preventDefault(),!this._keySliding&&(this._keySliding=!0,e(t.target).addClass("ui-state-active"),i=this._start(t,o),i===!1))return}switch(s=this.options.step,r=a=this.options.values&&this.options.values.length?this.values(o):this.value(),t.keyCode){case e.ui.keyCode.HOME:a=this._valueMin();break;case e.ui.keyCode.END:a=this._valueMax();break;case e.ui.keyCode.PAGE_UP:a=this._trimAlignValue(r+(this._valueMax()-this._valueMin())/n);break;case e.ui.keyCode.PAGE_DOWN:a=this._trimAlignValue(r-(this._valueMax()-this._valueMin())/n);break;case e.ui.keyCode.UP:case e.ui.keyCode.RIGHT:if(r===this._valueMax())return;a=this._trimAlignValue(r+s);break;case e.ui.keyCode.DOWN:case e.ui.keyCode.LEFT:if(r===this._valueMin())return;a=this._trimAlignValue(r-s)}this._slide(t,o,a)},click:function(e){e.preventDefault()},keyup:function(t){var n=e(t.target).data("ui-slider-handle-index");this._keySliding&&(this._keySliding=!1,this._stop(t,n),this._change(t,n),e(t.target).removeClass("ui-state-active"))}}})}(i)},301:function(e,t,n){var i=n(2);/*!
>>>>>>> master
	 * jQuery UI Core 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/category/ui-core/
	 */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	(function( $, undefined ) {
	
	var uuid = 0,
		runiqueId = /^ui-id-\d+$/;
	
	// $.ui might exist from components with no dependencies, e.g., $.ui.position
	$.ui = $.ui || {};
	
	$.extend( $.ui, {
		version: "1.10.4",
	
		keyCode: {
			BACKSPACE: 8,
			COMMA: 188,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			NUMPAD_ADD: 107,
			NUMPAD_DECIMAL: 110,
			NUMPAD_DIVIDE: 111,
			NUMPAD_ENTER: 108,
			NUMPAD_MULTIPLY: 106,
			NUMPAD_SUBTRACT: 109,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SPACE: 32,
			TAB: 9,
			UP: 38
		}
	});
	
	// plugins
	$.fn.extend({
		focus: (function( orig ) {
			return function( delay, fn ) {
				return typeof delay === "number" ?
					this.each(function() {
						var elem = this;
						setTimeout(function() {
							$( elem ).focus();
							if ( fn ) {
								fn.call( elem );
							}
						}, delay );
					}) :
					orig.apply( this, arguments );
			};
		})( $.fn.focus ),
	
		scrollParent: function() {
			var scrollParent;
			if (($.ui.ie && (/(static|relative)/).test(this.css("position"))) || (/absolute/).test(this.css("position"))) {
				scrollParent = this.parents().filter(function() {
					return (/(relative|absolute|fixed)/).test($.css(this,"position")) && (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
				}).eq(0);
			} else {
				scrollParent = this.parents().filter(function() {
					return (/(auto|scroll)/).test($.css(this,"overflow")+$.css(this,"overflow-y")+$.css(this,"overflow-x"));
				}).eq(0);
			}
	
			return (/fixed/).test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent;
		},
	
		zIndex: function( zIndex ) {
			if ( zIndex !== undefined ) {
				return this.css( "zIndex", zIndex );
			}
	
			if ( this.length ) {
				var elem = $( this[ 0 ] ), position, value;
				while ( elem.length && elem[ 0 ] !== document ) {
					// Ignore z-index if position is set to a value where z-index is ignored by the browser
					// This makes behavior of this function consistent across browsers
					// WebKit always returns auto if the element is positioned
					position = elem.css( "position" );
					if ( position === "absolute" || position === "relative" || position === "fixed" ) {
						// IE returns 0 when zIndex is not specified
						// other browsers return a string
						// we ignore the case of nested elements with an explicit value of 0
						// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
						value = parseInt( elem.css( "zIndex" ), 10 );
						if ( !isNaN( value ) && value !== 0 ) {
							return value;
						}
					}
					elem = elem.parent();
				}
			}
	
			return 0;
		},
	
		uniqueId: function() {
			return this.each(function() {
				if ( !this.id ) {
					this.id = "ui-id-" + (++uuid);
				}
			});
		},
	
		removeUniqueId: function() {
			return this.each(function() {
				if ( runiqueId.test( this.id ) ) {
					$( this ).removeAttr( "id" );
				}
			});
		}
	});
	
	// selectors
	function focusable( element, isTabIndexNotNaN ) {
		var map, mapName, img,
			nodeName = element.nodeName.toLowerCase();
		if ( "area" === nodeName ) {
			map = element.parentNode;
			mapName = map.name;
			if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
				return false;
			}
			img = $( "img[usemap=#" + mapName + "]" )[0];
			return !!img && visible( img );
		}
		return ( /input|select|textarea|button|object/.test( nodeName ) ?
			!element.disabled :
			"a" === nodeName ?
				element.href || isTabIndexNotNaN :
				isTabIndexNotNaN) &&
			// the element and all of its ancestors must be visible
			visible( element );
	}
	
	function visible( element ) {
		return $.expr.filters.visible( element ) &&
			!$( element ).parents().addBack().filter(function() {
				return $.css( this, "visibility" ) === "hidden";
			}).length;
	}
	
	$.extend( $.expr[ ":" ], {
		data: $.expr.createPseudo ?
			$.expr.createPseudo(function( dataName ) {
				return function( elem ) {
					return !!$.data( elem, dataName );
				};
			}) :
			// support: jQuery <1.8
			function( elem, i, match ) {
				return !!$.data( elem, match[ 3 ] );
			},
	
		focusable: function( element ) {
			return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
		},
	
		tabbable: function( element ) {
			var tabIndex = $.attr( element, "tabindex" ),
				isTabIndexNaN = isNaN( tabIndex );
			return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
		}
	});
	
	// support: jQuery <1.8
	if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
		$.each( [ "Width", "Height" ], function( i, name ) {
			var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
				type = name.toLowerCase(),
				orig = {
					innerWidth: $.fn.innerWidth,
					innerHeight: $.fn.innerHeight,
					outerWidth: $.fn.outerWidth,
					outerHeight: $.fn.outerHeight
				};
	
			function reduce( elem, size, border, margin ) {
				$.each( side, function() {
					size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
					if ( border ) {
						size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
					}
					if ( margin ) {
						size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
					}
				});
				return size;
			}
	
			$.fn[ "inner" + name ] = function( size ) {
				if ( size === undefined ) {
					return orig[ "inner" + name ].call( this );
				}
	
				return this.each(function() {
					$( this ).css( type, reduce( this, size ) + "px" );
				});
			};
	
			$.fn[ "outer" + name] = function( size, margin ) {
				if ( typeof size !== "number" ) {
					return orig[ "outer" + name ].call( this, size );
				}
	
				return this.each(function() {
					$( this).css( type, reduce( this, size, true, margin ) + "px" );
				});
			};
		});
	}
	
	// support: jQuery <1.8
	if ( !$.fn.addBack ) {
		$.fn.addBack = function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		};
	}
	
	// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
	if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
		$.fn.removeData = (function( removeData ) {
			return function( key ) {
				if ( arguments.length ) {
					return removeData.call( this, $.camelCase( key ) );
				} else {
					return removeData.call( this );
				}
			};
		})( $.fn.removeData );
	}
	
	
	
	
	
	// deprecated
	$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );
	
	$.support.selectstart = "onselectstart" in document.createElement( "div" );
	$.fn.extend({
		disableSelection: function() {
			return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
				".ui-disableSelection", function( event ) {
					event.preventDefault();
				});
		},
	
		enableSelection: function() {
			return this.unbind( ".ui-disableSelection" );
		}
	});
	
	$.extend( $.ui, {
		// $.ui.plugin is deprecated. Use $.widget() extensions instead.
		plugin: {
			add: function( module, option, set ) {
				var i,
					proto = $.ui[ module ].prototype;
				for ( i in set ) {
					proto.plugins[ i ] = proto.plugins[ i ] || [];
					proto.plugins[ i ].push( [ option, set[ i ] ] );
				}
			},
			call: function( instance, name, args ) {
				var i,
					set = instance.plugins[ name ];
				if ( !set || !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) {
					return;
				}
	
				for ( i = 0; i < set.length; i++ ) {
					if ( instance.options[ set[ i ][ 0 ] ] ) {
						set[ i ][ 1 ].apply( instance.element, args );
					}
				}
			}
		},
	
		// only used by resizable
		hasScroll: function( el, a ) {
	
			//If overflow is hidden, the element might have extra content, but the user wants to hide it
			if ( $( el ).css( "overflow" ) === "hidden") {
				return false;
			}
	
			var scroll = ( a && a === "left" ) ? "scrollLeft" : "scrollTop",
				has = false;
	
			if ( el[ scroll ] > 0 ) {
				return true;
			}
	
			// TODO: determine which cases actually cause this to happen
			// if the element doesn't have the scroll set, see if it's possible to
			// set the scroll
			el[ scroll ] = 1;
			has = ( el[ scroll ] > 0 );
			el[ scroll ] = 0;
			return has;
		}
	});
	
	})( jQuery );


/***/ },

/***/ 123:
/***/ function(module, exports, __webpack_require__) {

	var jQuery = __webpack_require__(1);
	__webpack_require__(124);
	
	/*!
=======
!function(e,t){function n(t,n){var a,r,s,o=t.nodeName.toLowerCase();return"area"===o?(a=t.parentNode,r=a.name,t.href&&r&&"map"===a.nodeName.toLowerCase()?(s=e("img[usemap=#"+r+"]")[0],!!s&&i(s)):!1):(/input|select|textarea|button|object/.test(o)?!t.disabled:"a"===o?t.href||n:n)&&i(t)}function i(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var a=0,r=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(n,i){return"number"==typeof n?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),i&&i.call(t)},n)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(n){if(n!==t)return this.css("zIndex",n);if(this.length)for(var i,a,r=e(this[0]);r.length&&r[0]!==document;){if(i=r.css("position"),("absolute"===i||"relative"===i||"fixed"===i)&&(a=parseInt(r.css("zIndex"),10),!isNaN(a)&&0!==a))return a;r=r.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++a)})},removeUniqueId:function(){return this.each(function(){r.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(n){return!!e.data(n,t)}}):function(t,n,i){return!!e.data(t,i[3])},focusable:function(t){return n(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var i=e.attr(t,"tabindex"),a=isNaN(i);return(a||i>=0)&&n(t,!a)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(n,i){function a(t,n,i,a){return e.each(r,function(){n-=parseFloat(e.css(t,"padding"+this))||0,i&&(n-=parseFloat(e.css(t,"border"+this+"Width"))||0),a&&(n-=parseFloat(e.css(t,"margin"+this))||0)}),n}var r="Width"===i?["Left","Right"]:["Top","Bottom"],s=i.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+i]=function(n){return n===t?o["inner"+i].call(this):this.each(function(){e(this).css(s,a(this,n)+"px")})},e.fn["outer"+i]=function(t,n){return"number"!=typeof t?o["outer"+i].call(this,t):this.each(function(){e(this).css(s,a(this,t,!0,n)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(n){return arguments.length?t.call(this,e.camelCase(n)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,n,i){var a,r=e.ui[t].prototype;for(a in i)r.plugins[a]=r.plugins[a]||[],r.plugins[a].push([n,i[a]])},call:function(e,t,n){var i,a=e.plugins[t];if(a&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(i=0;i<a.length;i++)e.options[a[i][0]]&&a[i][1].apply(e.element,n)}},hasScroll:function(t,n){if("hidden"===e(t).css("overflow"))return!1;var i=n&&"left"===n?"scrollLeft":"scrollTop",a=!1;return t[i]>0?!0:(t[i]=1,a=t[i]>0,t[i]=0,a)}})}(i)},122:function(e,t,n){var i=n(2);n(123),/*!
>>>>>>> develop
=======
!function(e,t){function i(t,i){var a,s,o,r=t.nodeName.toLowerCase();return"area"===r?(a=t.parentNode,s=a.name,t.href&&s&&"map"===a.nodeName.toLowerCase()?(o=e("img[usemap=#"+s+"]")[0],!!o&&n(o)):!1):(/input|select|textarea|button|object/.test(r)?!t.disabled:"a"===r?t.href||i:i)&&n(t)}function n(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var a=0,s=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(i,n){return"number"==typeof i?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),n&&n.call(t)},i)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(i){if(i!==t)return this.css("zIndex",i);if(this.length)for(var n,a,s=e(this[0]);s.length&&s[0]!==document;){if(n=s.css("position"),("absolute"===n||"relative"===n||"fixed"===n)&&(a=parseInt(s.css("zIndex"),10),!isNaN(a)&&0!==a))return a;s=s.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++a)})},removeUniqueId:function(){return this.each(function(){s.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(i){return!!e.data(i,t)}}):function(t,i,n){return!!e.data(t,n[3])},focusable:function(t){return i(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var n=e.attr(t,"tabindex"),a=isNaN(n);return(a||n>=0)&&i(t,!a)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(i,n){function a(t,i,n,a){return e.each(s,function(){i-=parseFloat(e.css(t,"padding"+this))||0,n&&(i-=parseFloat(e.css(t,"border"+this+"Width"))||0),a&&(i-=parseFloat(e.css(t,"margin"+this))||0)}),i}var s="Width"===n?["Left","Right"]:["Top","Bottom"],o=n.toLowerCase(),r={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+n]=function(i){return i===t?r["inner"+n].call(this):this.each(function(){e(this).css(o,a(this,i)+"px")})},e.fn["outer"+n]=function(t,i){return"number"!=typeof t?r["outer"+n].call(this,t):this.each(function(){e(this).css(o,a(this,t,!0,i)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(i){return arguments.length?t.call(this,e.camelCase(i)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,i,n){var a,s=e.ui[t].prototype;for(a in n)s.plugins[a]=s.plugins[a]||[],s.plugins[a].push([i,n[a]])},call:function(e,t,i){var n,a=e.plugins[t];if(a&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(n=0;n<a.length;n++)e.options[a[n][0]]&&a[n][1].apply(e.element,i)}},hasScroll:function(t,i){if("hidden"===e(t).css("overflow"))return!1;var n=i&&"left"===i?"scrollLeft":"scrollTop",a=!1;return t[n]>0?!0:(t[n]=1,a=t[n]>0,t[n]=0,a)}})}(n)},function(e,t,i){var n=i(2);i(19),/*!
>>>>>>> master
=======
!function(e,t){function n(t,n){var r,a,s,o=t.nodeName.toLowerCase();return"area"===o?(r=t.parentNode,a=r.name,t.href&&a&&"map"===r.nodeName.toLowerCase()?(s=e("img[usemap=#"+a+"]")[0],!!s&&i(s)):!1):(/input|select|textarea|button|object/.test(o)?!t.disabled:"a"===o?t.href||n:n)&&i(t)}function i(t){return e.expr.filters.visible(t)&&!e(t).parents().addBack().filter(function(){return"hidden"===e.css(this,"visibility")}).length}var r=0,a=/^ui-id-\d+$/;e.ui=e.ui||{},e.extend(e.ui,{version:"1.10.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}}),e.fn.extend({focus:function(t){return function(n,i){return"number"==typeof n?this.each(function(){var t=this;setTimeout(function(){e(t).focus(),i&&i.call(t)},n)}):t.apply(this,arguments)}}(e.fn.focus),scrollParent:function(){var t;return t=e.ui.ie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(e.css(this,"position"))&&/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(e.css(this,"overflow")+e.css(this,"overflow-y")+e.css(this,"overflow-x"))}).eq(0),/fixed/.test(this.css("position"))||!t.length?e(document):t},zIndex:function(n){if(n!==t)return this.css("zIndex",n);if(this.length)for(var i,r,a=e(this[0]);a.length&&a[0]!==document;){if(i=a.css("position"),("absolute"===i||"relative"===i||"fixed"===i)&&(r=parseInt(a.css("zIndex"),10),!isNaN(r)&&0!==r))return r;a=a.parent()}return 0},uniqueId:function(){return this.each(function(){this.id||(this.id="ui-id-"+ ++r)})},removeUniqueId:function(){return this.each(function(){a.test(this.id)&&e(this).removeAttr("id")})}}),e.extend(e.expr[":"],{data:e.expr.createPseudo?e.expr.createPseudo(function(t){return function(n){return!!e.data(n,t)}}):function(t,n,i){return!!e.data(t,i[3])},focusable:function(t){return n(t,!isNaN(e.attr(t,"tabindex")))},tabbable:function(t){var i=e.attr(t,"tabindex"),r=isNaN(i);return(r||i>=0)&&n(t,!r)}}),e("<a>").outerWidth(1).jquery||e.each(["Width","Height"],function(n,i){function r(t,n,i,r){return e.each(a,function(){n-=parseFloat(e.css(t,"padding"+this))||0,i&&(n-=parseFloat(e.css(t,"border"+this+"Width"))||0),r&&(n-=parseFloat(e.css(t,"margin"+this))||0)}),n}var a="Width"===i?["Left","Right"]:["Top","Bottom"],s=i.toLowerCase(),o={innerWidth:e.fn.innerWidth,innerHeight:e.fn.innerHeight,outerWidth:e.fn.outerWidth,outerHeight:e.fn.outerHeight};e.fn["inner"+i]=function(n){return n===t?o["inner"+i].call(this):this.each(function(){e(this).css(s,r(this,n)+"px")})},e.fn["outer"+i]=function(t,n){return"number"!=typeof t?o["outer"+i].call(this,t):this.each(function(){e(this).css(s,r(this,t,!0,n)+"px")})}}),e.fn.addBack||(e.fn.addBack=function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}),e("<a>").data("a-b","a").removeData("a-b").data("a-b")&&(e.fn.removeData=function(t){return function(n){return arguments.length?t.call(this,e.camelCase(n)):t.call(this)}}(e.fn.removeData)),e.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase()),e.support.selectstart="onselectstart"in document.createElement("div"),e.fn.extend({disableSelection:function(){return this.bind((e.support.selectstart?"selectstart":"mousedown")+".ui-disableSelection",function(e){e.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),e.extend(e.ui,{plugin:{add:function(t,n,i){var r,a=e.ui[t].prototype;for(r in i)a.plugins[r]=a.plugins[r]||[],a.plugins[r].push([n,i[r]])},call:function(e,t,n){var i,r=e.plugins[t];if(r&&e.element[0].parentNode&&11!==e.element[0].parentNode.nodeType)for(i=0;i<r.length;i++)e.options[r[i][0]]&&r[i][1].apply(e.element,n)}},hasScroll:function(t,n){if("hidden"===e(t).css("overflow"))return!1;var i=n&&"left"===n?"scrollLeft":"scrollTop",r=!1;return t[i]>0?!0:(t[i]=1,r=t[i]>0,t[i]=0,r)}})}(i)},302:function(e,t,n){var i=n(2);n(303),/*!
>>>>>>> master
	 * jQuery UI Mouse 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/mouse/
	 *
	 * Depends:
	 *	jquery.ui.widget.js
	 */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	(function( $, undefined ) {
	
	var mouseHandled = false;
	$( document ).mouseup( function() {
		mouseHandled = false;
	});
	
	$.widget("ui.mouse", {
		version: "1.10.4",
		options: {
			cancel: "input,textarea,button,select,option",
			distance: 1,
			delay: 0
		},
		_mouseInit: function() {
			var that = this;
	
			this.element
				.bind("mousedown."+this.widgetName, function(event) {
					return that._mouseDown(event);
				})
				.bind("click."+this.widgetName, function(event) {
					if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
						$.removeData(event.target, that.widgetName + ".preventClickEvent");
						event.stopImmediatePropagation();
						return false;
					}
				});
	
			this.started = false;
		},
	
		// TODO: make sure destroying one instance of mouse doesn't mess with
		// other instances of mouse
		_mouseDestroy: function() {
			this.element.unbind("."+this.widgetName);
			if ( this._mouseMoveDelegate ) {
				$(document)
					.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
					.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
			}
		},
	
		_mouseDown: function(event) {
			// don't let more than one widget handle mouseStart
			if( mouseHandled ) { return; }
	
			// we may have missed mouseup (out of window)
			(this._mouseStarted && this._mouseUp(event));
	
			this._mouseDownEvent = event;
	
			var that = this,
				btnIsLeft = (event.which === 1),
				// event.target.nodeName works around a bug in IE 8 with
				// disabled inputs (#7620)
				elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
			if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
				return true;
			}
	
			this.mouseDelayMet = !this.options.delay;
			if (!this.mouseDelayMet) {
				this._mouseDelayTimer = setTimeout(function() {
					that.mouseDelayMet = true;
				}, this.options.delay);
			}
	
			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted = (this._mouseStart(event) !== false);
				if (!this._mouseStarted) {
					event.preventDefault();
					return true;
				}
			}
	
			// Click event may never have fired (Gecko & Opera)
			if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
				$.removeData(event.target, this.widgetName + ".preventClickEvent");
			}
	
			// these delegates are required to keep context
			this._mouseMoveDelegate = function(event) {
				return that._mouseMove(event);
			};
			this._mouseUpDelegate = function(event) {
				return that._mouseUp(event);
			};
			$(document)
				.bind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.bind("mouseup."+this.widgetName, this._mouseUpDelegate);
	
			event.preventDefault();
	
			mouseHandled = true;
			return true;
		},
	
		_mouseMove: function(event) {
			// IE mouseup check - mouseup happened when mouse was out of window
			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
				return this._mouseUp(event);
			}
	
			if (this._mouseStarted) {
				this._mouseDrag(event);
				return event.preventDefault();
			}
	
			if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
				this._mouseStarted =
					(this._mouseStart(this._mouseDownEvent, event) !== false);
				(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
			}
	
			return !this._mouseStarted;
		},
	
		_mouseUp: function(event) {
			$(document)
				.unbind("mousemove."+this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup."+this.widgetName, this._mouseUpDelegate);
	
			if (this._mouseStarted) {
				this._mouseStarted = false;
	
				if (event.target === this._mouseDownEvent.target) {
					$.data(event.target, this.widgetName + ".preventClickEvent", true);
				}
	
				this._mouseStop(event);
			}
	
			return false;
		},
	
		_mouseDistanceMet: function(event) {
			return (Math.max(
					Math.abs(this._mouseDownEvent.pageX - event.pageX),
					Math.abs(this._mouseDownEvent.pageY - event.pageY)
				) >= this.options.distance
			);
		},
	
		_mouseDelayMet: function(/* event */) {
			return this.mouseDelayMet;
		},
	
		// These are placeholder methods, to be overriden by extending plugin
		_mouseStart: function(/* event */) {},
		_mouseDrag: function(/* event */) {},
		_mouseStop: function(/* event */) {},
		_mouseCapture: function(/* event */) { return true; }
	});
	
	})(jQuery);


/***/ },

/***/ 124:
/***/ function(module, exports, __webpack_require__) {

	var jQuery = __webpack_require__(1);
	
	/*!
=======
function(e,t){var n=!1;e(document).mouseup(function(){n=!1}),e.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(n){return!0===e.data(n.target,t.widgetName+".preventClickEvent")?(e.removeData(n.target,t.widgetName+".preventClickEvent"),n.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!n){this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var i=this,a=1===t.which,r="string"==typeof this.options.cancel&&t.target.nodeName?e(t.target).closest(this.options.cancel).length:!1;return a&&!r&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(t)!==!1,!this._mouseStarted)?(t.preventDefault(),!0):(!0===e.data(t.target,this.widgetName+".preventClickEvent")&&e.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return i._mouseMove(e)},this._mouseUpDelegate=function(e){return i._mouseUp(e)},e(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),n=!0,!0)):!0}},_mouseMove:function(t){return e.ui.ie&&(!document.documentMode||document.documentMode<9)&&!t.button?this._mouseUp(t):this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})}(i)},123:function(e,t,n){var i=n(2);/*!
>>>>>>> develop
=======
function(e,t){var i=!1;e(document).mouseup(function(){i=!1}),e.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(i){return!0===e.data(i.target,t.widgetName+".preventClickEvent")?(e.removeData(i.target,t.widgetName+".preventClickEvent"),i.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!i){this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var n=this,a=1===t.which,s="string"==typeof this.options.cancel&&t.target.nodeName?e(t.target).closest(this.options.cancel).length:!1;return a&&!s&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){n.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(t)!==!1,!this._mouseStarted)?(t.preventDefault(),!0):(!0===e.data(t.target,this.widgetName+".preventClickEvent")&&e.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return n._mouseMove(e)},this._mouseUpDelegate=function(e){return n._mouseUp(e)},e(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),i=!0,!0)):!0}},_mouseMove:function(t){return e.ui.ie&&(!document.documentMode||document.documentMode<9)&&!t.button?this._mouseUp(t):this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})}(n)},function(e,t,i){var n=i(2);/*!
>>>>>>> master
=======
function(e,t){var n=!1;e(document).mouseup(function(){n=!1}),e.widget("ui.mouse",{version:"1.10.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function(){var t=this;this.element.bind("mousedown."+this.widgetName,function(e){return t._mouseDown(e)}).bind("click."+this.widgetName,function(n){return!0===e.data(n.target,t.widgetName+".preventClickEvent")?(e.removeData(n.target,t.widgetName+".preventClickEvent"),n.stopImmediatePropagation(),!1):void 0}),this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName),this._mouseMoveDelegate&&e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate)},_mouseDown:function(t){if(!n){this._mouseStarted&&this._mouseUp(t),this._mouseDownEvent=t;var i=this,r=1===t.which,a="string"==typeof this.options.cancel&&t.target.nodeName?e(t.target).closest(this.options.cancel).length:!1;return r&&!a&&this._mouseCapture(t)?(this.mouseDelayMet=!this.options.delay,this.mouseDelayMet||(this._mouseDelayTimer=setTimeout(function(){i.mouseDelayMet=!0},this.options.delay)),this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(t)!==!1,!this._mouseStarted)?(t.preventDefault(),!0):(!0===e.data(t.target,this.widgetName+".preventClickEvent")&&e.removeData(t.target,this.widgetName+".preventClickEvent"),this._mouseMoveDelegate=function(e){return i._mouseMove(e)},this._mouseUpDelegate=function(e){return i._mouseUp(e)},e(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate),t.preventDefault(),n=!0,!0)):!0}},_mouseMove:function(t){return e.ui.ie&&(!document.documentMode||document.documentMode<9)&&!t.button?this._mouseUp(t):this._mouseStarted?(this._mouseDrag(t),t.preventDefault()):(this._mouseDistanceMet(t)&&this._mouseDelayMet(t)&&(this._mouseStarted=this._mouseStart(this._mouseDownEvent,t)!==!1,this._mouseStarted?this._mouseDrag(t):this._mouseUp(t)),!this._mouseStarted)},_mouseUp:function(t){return e(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate),this._mouseStarted&&(this._mouseStarted=!1,t.target===this._mouseDownEvent.target&&e.data(t.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(t)),!1},_mouseDistanceMet:function(e){return Math.max(Math.abs(this._mouseDownEvent.pageX-e.pageX),Math.abs(this._mouseDownEvent.pageY-e.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})}(i)},303:function(e,t,n){var i=n(2);/*!
>>>>>>> master
	 * jQuery UI Widget 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/jQuery.widget/
	 */
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	(function( $, undefined ) {
	
	var uuid = 0,
		slice = Array.prototype.slice,
		_cleanData = $.cleanData;
	$.cleanData = function( elems ) {
		for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
			try {
				$( elem ).triggerHandler( "remove" );
			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		_cleanData( elems );
	};
	
	$.widget = function( name, base, prototype ) {
		var fullName, existingConstructor, constructor, basePrototype,
			// proxiedPrototype allows the provided prototype to remain unmodified
			// so that it can be used as a mixin for multiple widgets (#8876)
			proxiedPrototype = {},
			namespace = name.split( "." )[ 0 ];
	
		name = name.split( "." )[ 1 ];
		fullName = namespace + "-" + name;
	
		if ( !prototype ) {
			prototype = base;
			base = $.Widget;
		}
	
		// create selector for plugin
		$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
			return !!$.data( elem, fullName );
		};
	
		$[ namespace ] = $[ namespace ] || {};
		existingConstructor = $[ namespace ][ name ];
		constructor = $[ namespace ][ name ] = function( options, element ) {
			// allow instantiation without "new" keyword
			if ( !this._createWidget ) {
				return new constructor( options, element );
			}
	
			// allow instantiation without initializing for simple inheritance
			// must use "new" keyword (the code above always passes args)
			if ( arguments.length ) {
				this._createWidget( options, element );
			}
		};
		// extend with the existing constructor to carry over any static properties
		$.extend( constructor, existingConstructor, {
			version: prototype.version,
			// copy the object used to create the prototype in case we need to
			// redefine the widget later
			_proto: $.extend( {}, prototype ),
			// track widgets that inherit from this widget in case this widget is
			// redefined after a widget inherits from it
			_childConstructors: []
		});
	
		basePrototype = new base();
		// we need to make the options hash a property directly on the new instance
		// otherwise we'll modify the options hash on the prototype that we're
		// inheriting from
		basePrototype.options = $.widget.extend( {}, basePrototype.options );
		$.each( prototype, function( prop, value ) {
			if ( !$.isFunction( value ) ) {
				proxiedPrototype[ prop ] = value;
				return;
			}
			proxiedPrototype[ prop ] = (function() {
				var _super = function() {
						return base.prototype[ prop ].apply( this, arguments );
					},
					_superApply = function( args ) {
						return base.prototype[ prop ].apply( this, args );
					};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;
	
					this._super = _super;
					this._superApply = _superApply;
	
					returnValue = value.apply( this, arguments );
	
					this._super = __super;
					this._superApply = __superApply;
	
					return returnValue;
				};
			})();
		});
		constructor.prototype = $.widget.extend( basePrototype, {
			// TODO: remove support for widgetEventPrefix
			// always use the name + a colon as the prefix, e.g., draggable:start
			// don't prefix for widgets that aren't DOM-based
			widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
		}, proxiedPrototype, {
			constructor: constructor,
			namespace: namespace,
			widgetName: name,
			widgetFullName: fullName
		});
	
		// If this widget is being redefined then we need to find all widgets that
		// are inheriting from it and redefine all of them so that they inherit from
		// the new version of this widget. We're essentially trying to replace one
		// level in the prototype chain.
		if ( existingConstructor ) {
			$.each( existingConstructor._childConstructors, function( i, child ) {
				var childPrototype = child.prototype;
	
				// redefine the child widget using the same prototype that was
				// originally used, but inherit from the new version of the base
				$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
			});
			// remove the list of existing child constructors from the old constructor
			// so the old child constructors can be garbage collected
			delete existingConstructor._childConstructors;
		} else {
			base._childConstructors.push( constructor );
		}
	
		$.widget.bridge( name, constructor );
	};
	
	$.widget.extend = function( target ) {
		var input = slice.call( arguments, 1 ),
			inputIndex = 0,
			inputLength = input.length,
			key,
			value;
		for ( ; inputIndex < inputLength; inputIndex++ ) {
			for ( key in input[ inputIndex ] ) {
				value = input[ inputIndex ][ key ];
				if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
					// Clone objects
					if ( $.isPlainObject( value ) ) {
						target[ key ] = $.isPlainObject( target[ key ] ) ?
							$.widget.extend( {}, target[ key ], value ) :
							// Don't extend strings, arrays, etc. with objects
							$.widget.extend( {}, value );
					// Copy everything else by reference
					} else {
						target[ key ] = value;
					}
				}
			}
		}
		return target;
	};
	
	$.widget.bridge = function( name, object ) {
		var fullName = object.prototype.widgetFullName || name;
		$.fn[ name ] = function( options ) {
			var isMethodCall = typeof options === "string",
				args = slice.call( arguments, 1 ),
				returnValue = this;
	
			// allow multiple hashes to be passed on init
			options = !isMethodCall && args.length ?
				$.widget.extend.apply( null, [ options ].concat(args) ) :
				options;
	
			if ( isMethodCall ) {
				this.each(function() {
					var methodValue,
						instance = $.data( this, fullName );
					if ( !instance ) {
						return $.error( "cannot call methods on " + name + " prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}
					if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name + " widget instance" );
					}
					methodValue = instance[ options ].apply( instance, args );
					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				});
			} else {
				this.each(function() {
					var instance = $.data( this, fullName );
					if ( instance ) {
						instance.option( options || {} )._init();
					} else {
						$.data( this, fullName, new object( options, this ) );
					}
				});
			}
	
			return returnValue;
		};
	};
	
	$.Widget = function( /* options, element */ ) {};
	$.Widget._childConstructors = [];
	
	$.Widget.prototype = {
		widgetName: "widget",
		widgetEventPrefix: "",
		defaultElement: "<div>",
		options: {
			disabled: false,
	
			// callbacks
			create: null
		},
		_createWidget: function( options, element ) {
			element = $( element || this.defaultElement || this )[ 0 ];
			this.element = $( element );
			this.uuid = uuid++;
			this.eventNamespace = "." + this.widgetName + this.uuid;
			this.options = $.widget.extend( {},
				this.options,
				this._getCreateOptions(),
				options );
	
			this.bindings = $();
			this.hoverable = $();
			this.focusable = $();
	
			if ( element !== this ) {
				$.data( element, this.widgetFullName, this );
				this._on( true, this.element, {
					remove: function( event ) {
						if ( event.target === element ) {
							this.destroy();
						}
					}
				});
				this.document = $( element.style ?
					// element within the document
					element.ownerDocument :
					// element is window or document
					element.document || element );
				this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
			}
	
			this._create();
			this._trigger( "create", null, this._getCreateEventData() );
			this._init();
		},
		_getCreateOptions: $.noop,
		_getCreateEventData: $.noop,
		_create: $.noop,
		_init: $.noop,
	
		destroy: function() {
			this._destroy();
			// we can probably remove the unbind calls in 2.0
			// all event bindings should go through this._on()
			this.element
				.unbind( this.eventNamespace )
				// 1.9 BC for #7810
				// TODO remove dual storage
				.removeData( this.widgetName )
				.removeData( this.widgetFullName )
				// support: jquery <1.6.3
				// http://bugs.jquery.com/ticket/9413
				.removeData( $.camelCase( this.widgetFullName ) );
			this.widget()
				.unbind( this.eventNamespace )
				.removeAttr( "aria-disabled" )
				.removeClass(
					this.widgetFullName + "-disabled " +
					"ui-state-disabled" );
	
			// clean up events and states
			this.bindings.unbind( this.eventNamespace );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		},
		_destroy: $.noop,
	
		widget: function() {
			return this.element;
		},
	
		option: function( key, value ) {
			var options = key,
				parts,
				curOption,
				i;
	
			if ( arguments.length === 0 ) {
				// don't return a reference to the internal hash
				return $.widget.extend( {}, this.options );
			}
	
			if ( typeof key === "string" ) {
				// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
				options = {};
				parts = key.split( "." );
				key = parts.shift();
				if ( parts.length ) {
					curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
					for ( i = 0; i < parts.length - 1; i++ ) {
						curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
						curOption = curOption[ parts[ i ] ];
					}
					key = parts.pop();
					if ( arguments.length === 1 ) {
						return curOption[ key ] === undefined ? null : curOption[ key ];
					}
					curOption[ key ] = value;
				} else {
					if ( arguments.length === 1 ) {
						return this.options[ key ] === undefined ? null : this.options[ key ];
					}
					options[ key ] = value;
				}
			}
	
			this._setOptions( options );
	
			return this;
		},
		_setOptions: function( options ) {
			var key;
	
			for ( key in options ) {
				this._setOption( key, options[ key ] );
			}
	
			return this;
		},
		_setOption: function( key, value ) {
			this.options[ key ] = value;
	
			if ( key === "disabled" ) {
				this.widget()
					.toggleClass( this.widgetFullName + "-disabled ui-state-disabled", !!value )
					.attr( "aria-disabled", value );
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
	
			return this;
		},
	
		enable: function() {
			return this._setOption( "disabled", false );
		},
		disable: function() {
			return this._setOption( "disabled", true );
		},
	
		_on: function( suppressDisabledCheck, element, handlers ) {
			var delegateElement,
				instance = this;
	
			// no suppressDisabledCheck flag, shuffle arguments
			if ( typeof suppressDisabledCheck !== "boolean" ) {
				handlers = element;
				element = suppressDisabledCheck;
				suppressDisabledCheck = false;
			}
	
			// no element argument, shuffle and use this.element
			if ( !handlers ) {
				handlers = element;
				element = this.element;
				delegateElement = this.widget();
			} else {
				// accept selectors, DOM elements
				element = delegateElement = $( element );
				this.bindings = this.bindings.add( element );
			}
	
			$.each( handlers, function( event, handler ) {
				function handlerProxy() {
					// allow widgets to customize the disabled handling
					// - disabled as an array instead of boolean
					// - disabled class as method for disabling individual parts
					if ( !suppressDisabledCheck &&
							( instance.options.disabled === true ||
								$( this ).hasClass( "ui-state-disabled" ) ) ) {
						return;
					}
					return ( typeof handler === "string" ? instance[ handler ] : handler )
						.apply( instance, arguments );
				}
	
				// copy the guid so direct unbinding works
				if ( typeof handler !== "string" ) {
					handlerProxy.guid = handler.guid =
						handler.guid || handlerProxy.guid || $.guid++;
				}
	
				var match = event.match( /^(\w+)\s*(.*)$/ ),
					eventName = match[1] + instance.eventNamespace,
					selector = match[2];
				if ( selector ) {
					delegateElement.delegate( selector, eventName, handlerProxy );
				} else {
					element.bind( eventName, handlerProxy );
				}
			});
		},
	
		_off: function( element, eventName ) {
			eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
			element.unbind( eventName ).undelegate( eventName );
		},
	
		_delay: function( handler, delay ) {
			function handlerProxy() {
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}
			var instance = this;
			return setTimeout( handlerProxy, delay || 0 );
		},
	
		_hoverable: function( element ) {
			this.hoverable = this.hoverable.add( element );
			this._on( element, {
				mouseenter: function( event ) {
					$( event.currentTarget ).addClass( "ui-state-hover" );
				},
				mouseleave: function( event ) {
					$( event.currentTarget ).removeClass( "ui-state-hover" );
				}
			});
		},
	
		_focusable: function( element ) {
			this.focusable = this.focusable.add( element );
			this._on( element, {
				focusin: function( event ) {
					$( event.currentTarget ).addClass( "ui-state-focus" );
				},
				focusout: function( event ) {
					$( event.currentTarget ).removeClass( "ui-state-focus" );
				}
			});
		},
	
		_trigger: function( type, event, data ) {
			var prop, orig,
				callback = this.options[ type ];
	
			data = data || {};
			event = $.Event( event );
			event.type = ( type === this.widgetEventPrefix ?
				type :
				this.widgetEventPrefix + type ).toLowerCase();
			// the original event may come from any element
			// so we need to reset the target on the new event
			event.target = this.element[ 0 ];
	
			// copy original event properties over to the new event
			orig = event.originalEvent;
			if ( orig ) {
				for ( prop in orig ) {
					if ( !( prop in event ) ) {
						event[ prop ] = orig[ prop ];
					}
				}
			}
	
			this.element.trigger( event, data );
			return !( $.isFunction( callback ) &&
				callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
				event.isDefaultPrevented() );
		}
	};
	
	$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
		$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
			if ( typeof options === "string" ) {
				options = { effect: options };
			}
			var hasOptions,
				effectName = !options ?
					method :
					options === true || typeof options === "number" ?
						defaultEffect :
						options.effect || defaultEffect;
			options = options || {};
			if ( typeof options === "number" ) {
				options = { duration: options };
			}
			hasOptions = !$.isEmptyObject( options );
			options.complete = callback;
			if ( options.delay ) {
				element.delay( options.delay );
			}
			if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
				element[ method ]( options );
			} else if ( effectName !== method && element[ effectName ] ) {
				element[ effectName ]( options.duration, options.easing, callback );
			} else {
				element.queue(function( next ) {
					$( this )[ method ]();
					if ( callback ) {
						callback.call( element[ 0 ] );
					}
					next();
				});
			}
		};
	});
	
	})( jQuery );


/***/ },

/***/ 299:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function($) {// `window.ParsleyExtend`, like `ParsleyAbstract`, is inherited by `ParsleyField` and `ParsleyForm`
	// That way, we could add new methods or redefine some for these both classes. In particular case
	// We are adding async validation methods that returns promises, bind them properly to triggered
	// Events like onkeyup when field is invalid or on form submit. These validation methods adds an
	// Extra `remote` validator which could not be simply added like other `ParsleyExtra` validators
	// Because returns promises instead of booleans.
	'use strict';
	
	window.ParsleyExtend = window.ParsleyExtend || {};
	window.ParsleyExtend = $.extend(window.ParsleyExtend, {
	  asyncSupport: true,
	
	  asyncValidators: $.extend({
	    'default': {
	      fn: function fn(xhr) {
	        return 'resolved' === xhr.state();
	      },
	      url: false
	    },
	    reverse: {
	      fn: function fn(xhr) {
	        // If reverse option is set, a failing ajax request is considered successful
	        return 'rejected' === xhr.state();
	      },
	      url: false
	    }
	  }, window.ParsleyExtend.asyncValidators),
	
	  addAsyncValidator: function addAsyncValidator(name, fn, url, options) {
	    this.asyncValidators[name.toLowerCase()] = {
	      fn: fn,
	      url: url || false,
	      options: options || {}
	    };
	
	    return this;
	  },
	
	  asyncValidate: function asyncValidate() {
	    if ('ParsleyForm' === this.__class__) return this._asyncValidateForm.apply(this, arguments);
	
	    return this._asyncValidateField.apply(this, arguments);
	  },
	
	  asyncIsValid: function asyncIsValid() {
	    if ('ParsleyField' === this.__class__) return this._asyncIsValidField.apply(this, arguments);
	
	    return this._asyncIsValidForm.apply(this, arguments);
	  },
	
	  onSubmitValidate: function onSubmitValidate(event) {
	    var that = this;
	
	    // This is a Parsley generated submit event, do not validate, do not prevent, simply exit and keep normal behavior
	    if (true === event.parsley) return;
	
	    // Clone the event object
	    this.submitEvent = $.extend(true, {}, event);
	
	    // Prevent form submit and immediately stop its event propagation
	    if (event instanceof $.Event) {
	      event.stopImmediatePropagation();
	      event.preventDefault();
	    }
	
	    return this._asyncValidateForm(undefined, event).done(function () {
	      // If user do not have prevented the event, re-submit form
	      if (!that.submitEvent.isDefaultPrevented()) that.$element.trigger($.extend($.Event('submit'), { parsley: true }));
	    });
	  },
	
	  eventValidate: function eventValidate(event) {
	    // For keyup, keypress, keydown.. events that could be a little bit obstrusive
	    // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	    // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	    if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	
	    this._ui.validatedOnce = true;
	    this.asyncValidate();
	  },
	
	  // Returns Promise
	  _asyncValidateForm: function _asyncValidateForm(group, event) {
	    var that = this,
	        promises = [];
	
	    this._refreshFields();
	
	    $.emit('parsley:form:validate', this);
	
	    for (var i = 0; i < this.fields.length; i++) {
	
	      // do not validate a field if not the same as given validation group
	      if (group && group !== this.fields[i].options.group) continue;
	
	      promises.push(this.fields[i]._asyncValidateField());
	    }
	
	    return $.when.apply($, promises).done(function () {
	      $.emit('parsley:form:success', that);
	    }).fail(function () {
	      $.emit('parsley:form:error', that);
	    }).always(function () {
	      $.emit('parsley:form:validated', that);
	    });
	  },
	
	  _asyncIsValidForm: function _asyncIsValidForm(group, force) {
	    var promises = [];
	    this._refreshFields();
	
	    for (var i = 0; i < this.fields.length; i++) {
	
	      // do not validate a field if not the same as given validation group
	      if (group && group !== this.fields[i].options.group) continue;
	
	      promises.push(this.fields[i]._asyncIsValidField(force));
	    }
	
	    return $.when.apply($, promises);
	  },
	
	  _asyncValidateField: function _asyncValidateField(force) {
	    var that = this;
	
	    $.emit('parsley:field:validate', this);
	
	    return this._asyncIsValidField(force).done(function () {
	      $.emit('parsley:field:success', that);
	    }).fail(function () {
	      $.emit('parsley:field:error', that);
	    }).always(function () {
	      $.emit('parsley:field:validated', that);
	    });
	  },
	
	  _asyncIsValidField: function _asyncIsValidField(force, value) {
	    var deferred = $.Deferred(),
	        remoteConstraintIndex;
	
	    // If regular isValid (matching regular constraints) returns `false`, no need to go further
	    // Directly reject promise, do not run remote validator and save server load
	    if (false === this.isValid(force, value)) deferred.rejectWith(this);
	
	    // If regular constraints are valid, and there is a remote validator registered, run it
	    else if ('undefined' !== typeof this.constraintsByName.remote) this._remote(deferred);
	
	    // Otherwise all is good, resolve promise
	    else deferred.resolveWith(this);
	
	    // Return promise
	    return deferred.promise();
	  },
	
	  _remote: function _remote(deferred) {
	    var that = this,
	        data = {},
	        ajaxOptions,
	        csr,
	        validator = this.options.remoteValidator || (true === this.options.remoteReverse ? 'reverse' : 'default');
	
	    validator = validator.toLowerCase();
	
	    if ('undefined' === typeof this.asyncValidators[validator]) throw new Error('Calling an undefined async validator: `' + validator + '`');
	
	    // Fill data with current value
	    data[this.$element.attr('name') || this.$element.attr('id')] = this.getValue();
	
	    // Merge options passed in from the function with the ones in the attribute
	    this.options.remoteOptions = $.extend(true, this.options.remoteOptions || {}, this.asyncValidators[validator].options);
	
	    // All `$.ajax(options)` could be overridden or extended directly from DOM in `data-parsley-remote-options`
	    ajaxOptions = $.extend(true, {}, {
	      url: this.asyncValidators[validator].url || this.options.remote,
	      data: data,
	      type: 'GET'
	    }, this.options.remoteOptions || {});
	
	    // Generate store key based on ajax options
	    csr = $.param(ajaxOptions);
	
	    // Initialise querry cache
	    if ('undefined' === typeof this._remoteCache) this._remoteCache = {};
	
	    // Try to retrieve stored xhr
	    if (!this._remoteCache[csr]) {
	      // Prevent multi burst xhr queries
	      if (this._xhr && 'pending' === this._xhr.state()) this._xhr.abort();
	
	      // Make ajax call
	      this._xhr = $.ajax(ajaxOptions);
	
	      // Store remote call result to avoid next calls with exact same parameters
	      this._remoteCache[csr] = this._xhr;
	    }
	
	    this._remoteCache[csr].done(function (data, textStatus, xhr) {
	      that._handleRemoteResult(validator, xhr, deferred);
	    }).fail(function (xhr, status, message) {
	      // If we aborted the query, do not handle nothing for this value
	      if ('abort' === status) return;
	
	      that._handleRemoteResult(validator, xhr, deferred);
	    });
	  },
	
	  _handleRemoteResult: function _handleRemoteResult(validator, xhr, deferred) {
	    // If true, simply resolve and exit
	    if ('function' === typeof this.asyncValidators[validator].fn && this.asyncValidators[validator].fn.call(this, xhr)) {
	      deferred.resolveWith(this);
	
	      return;
	    }
	
	    // Else, create a proper remote validation Violation to trigger right UI
	    this.validationResult = [new window.ParsleyValidator.Validator.Violation(this.constraintsByName.remote, this.getValue(), null)];
	
	    deferred.rejectWith(this);
	  }
	});
	
	// Remote validator is just an always true sync validator with lowest (-1) priority possible
	// It will be overloaded in `validateThroughValidator()` that will do the heavy async work
	// This 'hack' is needed not to mess up too much with error messages and stuff in `ParsleyUI`
	window.ParsleyConfig = window.ParsleyConfig || {};
	window.ParsleyConfig.validators = window.ParsleyConfig.validators || {};
	window.ParsleyConfig.validators.remote = {
	  fn: function fn() {
	    return true;
	  },
	  priority: -1
	};
	
	/*!
	* Parsleyjs
	* Guillaume Potier - <guillaume@wisembly.com>
	* Version 2.0.6 - built Sat Jan 24 2015 14:44:37
	* MIT Licensed
	*
	*/
	!(function (factory) {
	  if (true) {
	    // AMD. Register as an anonymous module depending on jQuery.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    // No AMD. Register plugin with global jQuery object.
	    factory(jQuery);
	  }
	})(function ($) {
	  // small hack for requirejs if jquery is loaded through map and not path
	  // see http://requirejs.org/docs/jquery.html
	  if ('undefined' === typeof $ && 'undefined' !== typeof window.jQuery) $ = window.jQuery;
	  var ParsleyUtils = {
	    // Parsley DOM-API
	    // returns object from dom attributes and values
	    // if attr is given, returns bool if attr present in DOM or not
	    attr: function attr($element, namespace, checkAttr) {
	      var attribute,
	          obj = {},
	          msie = this.msieversion(),
	          regex = new RegExp('^' + namespace, 'i');
	      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return {};
	      for (var i in $element[0].attributes) {
	        attribute = $element[0].attributes[i];
	        if ('undefined' !== typeof attribute && null !== attribute && (!msie || msie >= 8 || attribute.specified) && regex.test(attribute.name)) {
	          if ('undefined' !== typeof checkAttr && new RegExp(checkAttr + '$', 'i').test(attribute.name)) return true;
	          obj[this.camelize(attribute.name.replace(namespace, ''))] = this.deserializeValue(attribute.value);
	        }
	      }
	      return 'undefined' === typeof checkAttr ? obj : false;
	    },
	    setAttr: function setAttr($element, namespace, attr, value) {
	      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
	    },
	    // Recursive object / array getter
	    get: function get(obj, path) {
	      var i = 0,
	          paths = (path || '').split('.');
	      while (this.isObject(obj) || this.isArray(obj)) {
	        obj = obj[paths[i++]];
	        if (i === paths.length) return obj;
	      }
	      return undefined;
	    },
	    hash: function hash(length) {
	      return String(Math.random()).substring(2, length ? length + 2 : 9);
	    },
	    /** Third party functions **/
	    // Underscore isArray
	    isArray: function isArray(mixed) {
	      return Object.prototype.toString.call(mixed) === '[object Array]';
	    },
	    // Underscore isObject
	    isObject: function isObject(mixed) {
	      return mixed === Object(mixed);
	    },
	    // Zepto deserialize function
	    deserializeValue: function deserializeValue(value) {
	      var num;
	      try {
	        return value ? value == 'true' || (value == 'false' ? false : value == 'null' ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
	      } catch (e) {
	        return value;
	      }
	    },
	    // Zepto camelize function
	    camelize: function camelize(str) {
	      return str.replace(/-+(.)?/g, function (match, chr) {
	        return chr ? chr.toUpperCase() : '';
	      });
	    },
	    // Zepto dasherize function
	    dasherize: function dasherize(str) {
	      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
	    },
	    // http://support.microsoft.com/kb/167820
	    // http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
	    msieversion: function msieversion() {
	      var ua = window.navigator.userAgent,
	          msie = ua.indexOf('MSIE ');
	      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
	      return 0;
	    }
	  };
	  // All these options could be overriden and specified directly in DOM using
	  // `data-parsley-` default DOM-API
	  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
	  // eg: `data-parsley-stop-on-first-failing-constraint="false"`
	  var ParsleyDefaults = {
	    // ### General
	    // Default data-namespace for DOM API
	    namespace: 'data-parsley-',
	    // Supported inputs by default
	    inputs: 'input, textarea, select',
	    // Excluded inputs by default
	    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',
	    // Stop validating field on highest priority failing constraint
	    priorityEnabled: true,
	    // ### UI
	    // Enable\Disable error messages
	    uiEnabled: true,
	    // Key events threshold before validation
	    validationThreshold: 3,
	    // Focused field on form validation error. 'fist'|'last'|'none'
	    focus: 'first',
	    // `$.Event()` that will trigger validation. eg: `keyup`, `change`...
	    trigger: false,
	    // Class that would be added on every failing validation Parsley field
	    errorClass: 'parsley-error',
	    // Same for success validation
	    successClass: 'parsley-success',
	    // Return the `$element` that will receive these above success or error classes
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    classHandler: function classHandler(ParsleyField) {},
	    // Return the `$element` where errors will be appended
	    // Could also be (and given directly from DOM) a valid selector like `'#div'`
	    errorsContainer: function errorsContainer(ParsleyField) {},
	    // ul elem that would receive errors' list
	    errorsWrapper: '<ul class="parsley-errors-list"></ul>',
	    // li elem that would receive error message
	    errorTemplate: '<li></li>'
	  };
	
	  var ParsleyAbstract = function ParsleyAbstract() {};
	  ParsleyAbstract.prototype = {
	    asyncSupport: false,
	    actualizeOptions: function actualizeOptions() {
	      this.options = this.OptionsFactory.get(this);
	      return this;
	    },
	    // ParsleyValidator validate proxy function . Could be replaced by third party scripts
	    validateThroughValidator: function validateThroughValidator(value, constraints, priority) {
	      return window.ParsleyValidator.validate(value, constraints, priority);
	    },
	    // Subscribe an event and a handler for a specific field or a specific form
	    // If on a ParsleyForm instance, it will be attached to form instance and also
	    // To every field instance for this form
	    subscribe: function subscribe(name, fn) {
	      $.listenTo(this, name.toLowerCase(), fn);
	      return this;
	    },
	    // Same as subscribe above. Unsubscribe an event for field, or form + its fields
	    unsubscribe: function unsubscribe(name) {
	      $.unsubscribeTo(this, name.toLowerCase());
	      return this;
	    },
	    // Reset UI
	    reset: function reset() {
	      // Field case: just emit a reset event for UI
	      if ('ParsleyForm' !== this.__class__) return $.emit('parsley:field:reset', this);
	      // Form case: emit a reset event for each field
	      for (var i = 0; i < this.fields.length; i++) $.emit('parsley:field:reset', this.fields[i]);
	      $.emit('parsley:form:reset', this);
	    },
	    // Destroy Parsley instance (+ UI)
	    destroy: function destroy() {
	      // Field case: emit destroy event to clean UI and then destroy stored instance
	      if ('ParsleyForm' !== this.__class__) {
	        this.$element.removeData('Parsley');
	        this.$element.removeData('ParsleyFieldMultiple');
	        $.emit('parsley:field:destroy', this);
	        return;
	      }
	      // Form case: destroy all its fields and then destroy stored instance
	      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();
	      this.$element.removeData('Parsley');
	      $.emit('parsley:form:destroy', this);
	    }
	  };
	  /*!
	  * validator.js
	  * Guillaume Potier - <guillaume@wisembly.com>
	  * Version 1.0.1 - built Mon Aug 25 2014 16:10:10
	  * MIT Licensed
	  *
	  */
	  var Validator = (function () {
	    var exports = {};
	    /**
	    * Validator
	    */
	    var Validator = function Validator(options) {
	      this.__class__ = 'Validator';
	      this.__version__ = '1.0.1';
	      this.options = options || {};
	      this.bindingKey = this.options.bindingKey || '_validatorjsConstraint';
	    };
	    Validator.prototype = {
	      constructor: Validator,
	      /*
	      * Validate string: validate( string, Assert, string ) || validate( string, [ Assert, Assert ], [ string, string ] )
	      * Validate object: validate( object, Constraint, string ) || validate( object, Constraint, [ string, string ] )
	      * Validate binded object: validate( object, string ) || validate( object, [ string, string ] )
	      */
	      validate: function validate(objectOrString, AssertsOrConstraintOrGroup, group) {
	        if ('string' !== typeof objectOrString && 'object' !== typeof objectOrString) throw new Error('You must validate an object or a string');
	        // string / array validation
	        if ('string' === typeof objectOrString || _isArray(objectOrString)) return this._validateString(objectOrString, AssertsOrConstraintOrGroup, group);
	        // binded object validation
	        if (this.isBinded(objectOrString)) return this._validateBindedObject(objectOrString, AssertsOrConstraintOrGroup);
	        // regular object validation
	        return this._validateObject(objectOrString, AssertsOrConstraintOrGroup, group);
	      },
	      bind: function bind(object, constraint) {
	        if ('object' !== typeof object) throw new Error('Must bind a Constraint to an object');
	        object[this.bindingKey] = new Constraint(constraint);
	        return this;
	      },
	      unbind: function unbind(object) {
	        if ('undefined' === typeof object._validatorjsConstraint) return this;
	        delete object[this.bindingKey];
	        return this;
	      },
	      isBinded: function isBinded(object) {
	        return 'undefined' !== typeof object[this.bindingKey];
	      },
	      getBinded: function getBinded(object) {
	        return this.isBinded(object) ? object[this.bindingKey] : null;
	      },
	      _validateString: function _validateString(string, assert, group) {
	        var result,
	            failures = [];
	        if (!_isArray(assert)) assert = [assert];
	        for (var i = 0; i < assert.length; i++) {
	          if (!(assert[i] instanceof Assert)) throw new Error('You must give an Assert or an Asserts array to validate a string');
	          result = assert[i].check(string, group);
	          if (result instanceof Violation) failures.push(result);
	        }
	        return failures.length ? failures : true;
	      },
	      _validateObject: function _validateObject(object, constraint, group) {
	        if ('object' !== typeof constraint) throw new Error('You must give a constraint to validate an object');
	        if (constraint instanceof Constraint) return constraint.check(object, group);
	        return new Constraint(constraint).check(object, group);
	      },
	      _validateBindedObject: function _validateBindedObject(object, group) {
	        return object[this.bindingKey].check(object, group);
	      }
	    };
	    Validator.errorCode = {
	      must_be_a_string: 'must_be_a_string',
	      must_be_an_array: 'must_be_an_array',
	      must_be_a_number: 'must_be_a_number',
	      must_be_a_string_or_array: 'must_be_a_string_or_array'
	    };
	    /**
	    * Constraint
	    */
	    var Constraint = function Constraint(data, options) {
	      this.__class__ = 'Constraint';
	      this.options = options || {};
	      this.nodes = {};
	      if (data) {
	        try {
	          this._bootstrap(data);
	        } catch (err) {
	          throw new Error('Should give a valid mapping object to Constraint', err, data);
	        }
	      }
	    };
	    Constraint.prototype = {
	      constructor: Constraint,
	      check: function check(object, group) {
	        var result,
	            failures = {};
	        // check all constraint nodes.
	        for (var property in this.nodes) {
	          var isRequired = false;
	          var constraint = this.get(property);
	          var constraints = _isArray(constraint) ? constraint : [constraint];
	          for (var i = constraints.length - 1; i >= 0; i--) {
	            if ('Required' === constraints[i].__class__) {
	              isRequired = constraints[i].requiresValidation(group);
	              continue;
	            }
	          }
	          if (!this.has(property, object) && !this.options.strict && !isRequired) {
	            continue;
	          }
	          try {
	            if (!this.has(property, this.options.strict || isRequired ? object : undefined)) {
	              // we trigger here a HaveProperty Assert violation to have uniform Violation object in the end
	              new Assert().HaveProperty(property).validate(object);
	            }
	            result = this._check(property, object[property], group);
	            // check returned an array of Violations or an object mapping Violations
	            if (_isArray(result) && result.length > 0 || !_isArray(result) && !_isEmptyObject(result)) {
	              failures[property] = result;
	            }
	          } catch (violation) {
	            failures[property] = violation;
	          }
	        }
	        return _isEmptyObject(failures) ? true : failures;
	      },
	      add: function add(node, object) {
	        if (object instanceof Assert || _isArray(object) && object[0] instanceof Assert) {
	          this.nodes[node] = object;
	          return this;
	        }
	        if ('object' === typeof object && !_isArray(object)) {
	          this.nodes[node] = object instanceof Constraint ? object : new Constraint(object);
	          return this;
	        }
	        throw new Error('Should give an Assert, an Asserts array, a Constraint', object);
	      },
	      has: function has(node, nodes) {
	        nodes = 'undefined' !== typeof nodes ? nodes : this.nodes;
	        return 'undefined' !== typeof nodes[node];
	      },
	      get: function get(node, placeholder) {
	        return this.has(node) ? this.nodes[node] : placeholder || null;
	      },
	      remove: function remove(node) {
	        var _nodes = [];
	        for (var i in this.nodes) if (i !== node) _nodes[i] = this.nodes[i];
	        this.nodes = _nodes;
	        return this;
	      },
	      _bootstrap: function _bootstrap(data) {
	        if (data instanceof Constraint) return this.nodes = data.nodes;
	        for (var node in data) this.add(node, data[node]);
	      },
	      _check: function _check(node, value, group) {
	        // Assert
	        if (this.nodes[node] instanceof Assert) return this._checkAsserts(value, [this.nodes[node]], group);
	        // Asserts
	        if (_isArray(this.nodes[node])) return this._checkAsserts(value, this.nodes[node], group);
	        // Constraint -> check api
	        if (this.nodes[node] instanceof Constraint) return this.nodes[node].check(value, group);
	        throw new Error('Invalid node', this.nodes[node]);
	      },
	      _checkAsserts: function _checkAsserts(value, asserts, group) {
	        var result,
	            failures = [];
	        for (var i = 0; i < asserts.length; i++) {
	          result = asserts[i].check(value, group);
	          if ('undefined' !== typeof result && true !== result) failures.push(result);
	          // Some asserts (Collection for example) could return an object
	          // if ( result && ! ( result instanceof Violation ) )
	          //   return result;
	          //
	          // // Vast assert majority return Violation
	          // if ( result instanceof Violation )
	          //   failures.push( result );
	        }
	        return failures;
	      }
	    };
	    /**
	    * Violation
	    */
	    var Violation = function Violation(assert, value, violation) {
	      this.__class__ = 'Violation';
	      if (!(assert instanceof Assert)) throw new Error('Should give an assertion implementing the Assert interface');
	      this.assert = assert;
	      this.value = value;
	      if ('undefined' !== typeof violation) this.violation = violation;
	    };
	    Violation.prototype = {
	      show: function show() {
	        var show = {
	          assert: this.assert.__class__,
	          value: this.value
	        };
	        if (this.violation) show.violation = this.violation;
	        return show;
	      },
	      __toString: function __toString() {
	        if ('undefined' !== typeof this.violation) this.violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;
	        return this.assert.__class__ + ' assert failed for "' + this.value + this.violation || '';
	      },
	      getViolation: function getViolation() {
	        var constraint, expected;
	        for (constraint in this.violation) expected = this.violation[constraint];
	        return { constraint: constraint, expected: expected };
	      }
	    };
	    /**
	    * Assert
	    */
	    var Assert = function Assert(group) {
	      this.__class__ = 'Assert';
	      this.__parentClass__ = this.__class__;
	      this.groups = [];
	      if ('undefined' !== typeof group) this.addGroup(group);
	    };
	    Assert.prototype = {
	      construct: Assert,
	      requiresValidation: function requiresValidation(group) {
	        if (group && !this.hasGroup(group)) return false;
	        if (!group && this.hasGroups()) return false;
	        return true;
	      },
	      check: function check(value, group) {
	        if (!this.requiresValidation(group)) return;
	        try {
	          return this.validate(value, group);
	        } catch (violation) {
	          return violation;
	        }
	      },
	      hasGroup: function hasGroup(group) {
	        if (_isArray(group)) return this.hasOneOf(group);
	        // All Asserts respond to "Any" group
	        if ('Any' === group) return true;
	        // Asserts with no group also respond to "Default" group. Else return false
	        if (!this.hasGroups()) return 'Default' === group;
	        return -1 !== this.groups.indexOf(group);
	      },
	      hasOneOf: function hasOneOf(groups) {
	        for (var i = 0; i < groups.length; i++) if (this.hasGroup(groups[i])) return true;
	        return false;
	      },
	      hasGroups: function hasGroups() {
	        return this.groups.length > 0;
	      },
	      addGroup: function addGroup(group) {
	        if (_isArray(group)) return this.addGroups(group);
	        if (!this.hasGroup(group)) this.groups.push(group);
	        return this;
	      },
	      removeGroup: function removeGroup(group) {
	        var _groups = [];
	        for (var i = 0; i < this.groups.length; i++) if (group !== this.groups[i]) _groups.push(this.groups[i]);
	        this.groups = _groups;
	        return this;
	      },
	      addGroups: function addGroups(groups) {
	        for (var i = 0; i < groups.length; i++) this.addGroup(groups[i]);
	        return this;
	      },
	      /**
	      * Asserts definitions
	      */
	      HaveProperty: function HaveProperty(node) {
	        this.__class__ = 'HaveProperty';
	        this.node = node;
	        this.validate = function (object) {
	          if ('undefined' === typeof object[this.node]) throw new Violation(this, object, { value: this.node });
	          return true;
	        };
	        return this;
	      },
	      Blank: function Blank() {
	        this.__class__ = 'Blank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' !== value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Callback: function Callback(fn) {
	        this.__class__ = 'Callback';
	        this.arguments = Array.prototype.slice.call(arguments);
	        if (1 === this.arguments.length) this.arguments = [];else this.arguments.splice(0, 1);
	        if ('function' !== typeof fn) throw new Error('Callback must be instanciated with a function');
	        this.fn = fn;
	        this.validate = function (value) {
	          var result = this.fn.apply(this, [value].concat(this.arguments));
	          if (true !== result) throw new Violation(this, value, { result: result });
	          return true;
	        };
	        return this;
	      },
	      Choice: function Choice(list) {
	        this.__class__ = 'Choice';
	        if (!_isArray(list) && 'function' !== typeof list) throw new Error('Choice must be instanciated with an array or a function');
	        this.list = list;
	        this.validate = function (value) {
	          var list = 'function' === typeof this.list ? this.list() : this.list;
	          for (var i = 0; i < list.length; i++) if (value === list[i]) return true;
	          throw new Violation(this, value, { choices: list });
	        };
	        return this;
	      },
	      Collection: function Collection(assertOrConstraint) {
	        this.__class__ = 'Collection';
	        this.constraint = 'undefined' !== typeof assertOrConstraint ? assertOrConstraint instanceof Assert ? assertOrConstraint : new Constraint(assertOrConstraint) : false;
	        this.validate = function (collection, group) {
	          var result,
	              validator = new Validator(),
	              count = 0,
	              failures = {},
	              groups = this.groups.length ? this.groups : group;
	          if (!_isArray(collection)) throw new Violation(this, collection, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < collection.length; i++) {
	            result = this.constraint ? validator.validate(collection[i], this.constraint, groups) : validator.validate(collection[i], groups);
	            if (!_isEmptyObject(result)) failures[count] = result;
	            count++;
	          }
	          return !_isEmptyObject(failures) ? failures : true;
	        };
	        return this;
	      },
	      Count: function Count(count) {
	        this.__class__ = 'Count';
	        this.count = count;
	        this.validate = function (array) {
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          var count = 'function' === typeof this.count ? this.count(array) : this.count;
	          if (isNaN(Number(count))) throw new Error('Count must be a valid interger', count);
	          if (count !== array.length) throw new Violation(this, array, { count: count });
	          return true;
	        };
	        return this;
	      },
	      Email: function Email() {
	        this.__class__ = 'Email';
	        this.validate = function (value) {
	          var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!regExp.test(value)) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      EqualTo: function EqualTo(reference) {
	        this.__class__ = 'EqualTo';
	        if ('undefined' === typeof reference) throw new Error('EqualTo must be instanciated with a value or a function');
	        this.reference = reference;
	        this.validate = function (value) {
	          var reference = 'function' === typeof this.reference ? this.reference(value) : this.reference;
	          if (reference !== value) throw new Violation(this, value, { value: reference });
	          return true;
	        };
	        return this;
	      },
	      GreaterThan: function GreaterThan(threshold) {
	        this.__class__ = 'GreaterThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold >= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      GreaterThanOrEqual: function GreaterThanOrEqual(threshold) {
	        this.__class__ = 'GreaterThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold > value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      InstanceOf: function InstanceOf(classRef) {
	        this.__class__ = 'InstanceOf';
	        if ('undefined' === typeof classRef) throw new Error('InstanceOf must be instanciated with a value');
	        this.classRef = classRef;
	        this.validate = function (value) {
	          if (true !== value instanceof this.classRef) throw new Violation(this, value, { classRef: this.classRef });
	          return true;
	        };
	        return this;
	      },
	      Length: function Length(boundaries) {
	        this.__class__ = 'Length';
	        if (!boundaries.min && !boundaries.max) throw new Error('Lenth assert must be instanciated with a { min: x, max: y } object');
	        this.min = boundaries.min;
	        this.max = boundaries.max;
	        this.validate = function (value) {
	          if ('string' !== typeof value && !_isArray(value)) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string_or_array });
	          if ('undefined' !== typeof this.min && this.min === this.max && value.length !== this.min) throw new Violation(this, value, { min: this.min, max: this.max });
	          if ('undefined' !== typeof this.max && value.length > this.max) throw new Violation(this, value, { max: this.max });
	          if ('undefined' !== typeof this.min && value.length < this.min) throw new Violation(this, value, { min: this.min });
	          return true;
	        };
	        return this;
	      },
	      LessThan: function LessThan(threshold) {
	        this.__class__ = 'LessThan';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold <= value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      LessThanOrEqual: function LessThanOrEqual(threshold) {
	        this.__class__ = 'LessThanOrEqual';
	        if ('undefined' === typeof threshold) throw new Error('Should give a threshold value');
	        this.threshold = threshold;
	        this.validate = function (value) {
	          if ('' === value || isNaN(Number(value))) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_number });
	          if (this.threshold < value) throw new Violation(this, value, { threshold: this.threshold });
	          return true;
	        };
	        return this;
	      },
	      NotNull: function NotNull() {
	        this.__class__ = 'NotNull';
	        this.validate = function (value) {
	          if (null === value || 'undefined' === typeof value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      NotBlank: function NotBlank() {
	        this.__class__ = 'NotBlank';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if ('' === value.replace(/^\s+/g, '').replace(/\s+$/g, '')) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Null: function Null() {
	        this.__class__ = 'Null';
	        this.validate = function (value) {
	          if (null !== value) throw new Violation(this, value);
	          return true;
	        };
	        return this;
	      },
	      Range: function Range(min, max) {
	        this.__class__ = 'Range';
	        if ('undefined' === typeof min || 'undefined' === typeof max) throw new Error('Range assert expects min and max values');
	        this.min = min;
	        this.max = max;
	        this.validate = function (value) {
	          try {
	            // validate strings and objects with their Length
	            if ('string' === typeof value && isNaN(Number(value)) || _isArray(value)) new Assert().Length({ min: this.min, max: this.max }).validate(value);
	            // validate numbers with their value
	            else new Assert().GreaterThanOrEqual(this.min).validate(value) && new Assert().LessThanOrEqual(this.max).validate(value);
	            return true;
	          } catch (violation) {
	            throw new Violation(this, value, violation.violation);
	          }
	          return true;
	        };
	        return this;
	      },
	      Regexp: function Regexp(regexp, flag) {
	        this.__class__ = 'Regexp';
	        if ('undefined' === typeof regexp) throw new Error('You must give a regexp');
	        this.regexp = regexp;
	        this.flag = flag || '';
	        this.validate = function (value) {
	          if ('string' !== typeof value) throw new Violation(this, value, { value: Validator.errorCode.must_be_a_string });
	          if (!new RegExp(this.regexp, this.flag).test(value)) throw new Violation(this, value, { regexp: this.regexp, flag: this.flag });
	          return true;
	        };
	        return this;
	      },
	      Required: function Required() {
	        this.__class__ = 'Required';
	        this.validate = function (value) {
	          if ('undefined' === typeof value) throw new Violation(this, value);
	          try {
	            if ('string' === typeof value) new Assert().NotNull().validate(value) && new Assert().NotBlank().validate(value);else if (true === _isArray(value)) new Assert().Length({ min: 1 }).validate(value);
	          } catch (violation) {
	            throw new Violation(this, value);
	          }
	          return true;
	        };
	        return this;
	      },
	      // Unique() or Unique ( { key: foo } )
	      Unique: function Unique(object) {
	        this.__class__ = 'Unique';
	        if ('object' === typeof object) this.key = object.key;
	        this.validate = function (array) {
	          var value,
	              store = [];
	          if (!_isArray(array)) throw new Violation(this, array, { value: Validator.errorCode.must_be_an_array });
	          for (var i = 0; i < array.length; i++) {
	            value = 'object' === typeof array[i] ? array[i][this.key] : array[i];
	            if ('undefined' === typeof value) continue;
	            if (-1 !== store.indexOf(value)) throw new Violation(this, array, { value: value });
	            store.push(value);
	          }
	          return true;
	        };
	        return this;
	      }
	    };
	    // expose to the world these awesome classes
	    exports.Assert = Assert;
	    exports.Validator = Validator;
	    exports.Violation = Violation;
	    exports.Constraint = Constraint;
	    /**
	    * Some useful object prototypes / functions here
	    */
	    // IE8<= compatibility
	    // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
	    if (!Array.prototype.indexOf) Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
	
	      if (this === null) {
	        throw new TypeError();
	      }
	      var t = Object(this);
	      var len = t.length >>> 0;
	      if (len === 0) {
	        return -1;
	      }
	      var n = 0;
	      if (arguments.length > 1) {
	        n = Number(arguments[1]);
	        if (n != n) {
	          // shortcut for verifying if it's NaN
	          n = 0;
	        } else if (n !== 0 && n != Infinity && n != -Infinity) {
	          n = (n > 0 || -1) * Math.floor(Math.abs(n));
	        }
	      }
	      if (n >= len) {
	        return -1;
	      }
	      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	      for (; k < len; k++) {
	        if (k in t && t[k] === searchElement) {
	          return k;
	        }
	      }
	      return -1;
	    };
	    // Test if object is empty, useful for Constraint violations check
	    var _isEmptyObject = function _isEmptyObject(obj) {
	      for (var property in obj) return false;
	      return true;
	    };
	    var _isArray = function _isArray(obj) {
	      return Object.prototype.toString.call(obj) === '[object Array]';
	    };
	    // AMD export
	    if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return exports;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	      // commonjs export
	    } else if (typeof module !== 'undefined' && module.exports) {
	      module.exports = exports;
	      // browser
	    } else {
	      window['undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator'] = exports;
	    }
	
	    return exports;
	  })();
	
	  // This is needed for Browserify usage that requires Validator.js through module.exports
	  Validator = 'undefined' !== typeof Validator ? Validator : true ? module.exports : null;
	  var ParsleyValidator = function ParsleyValidator(validators, catalog) {
	    this.__class__ = 'ParsleyValidator';
	    this.Validator = Validator;
	    // Default Parsley locale is en
	    this.locale = 'en';
	    this.init(validators || {}, catalog || {});
	  };
	  ParsleyValidator.prototype = {
	    init: function init(validators, catalog) {
	      this.catalog = catalog;
	      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority, validators[name].requirementsTransformer);
	      $.emit('parsley:validator:init');
	    },
	    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
	    setLocale: function setLocale(locale) {
	      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');
	      this.locale = locale;
	      return this;
	    },
	    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
	    addCatalog: function addCatalog(locale, messages, set) {
	      if ('object' === typeof messages) this.catalog[locale] = messages;
	      if (true === set) return this.setLocale(locale);
	      return this;
	    },
	    // Add a specific message for a given constraint in a given locale
	    addMessage: function addMessage(locale, name, message) {
	      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};
	      this.catalog[locale][name.toLowerCase()] = message;
	      return this;
	    },
	    validate: function validate(value, constraints, priority) {
	      return new this.Validator.Validator().validate.apply(new Validator.Validator(), arguments);
	    },
	    // Add a new validator
	    addValidator: function addValidator(name, fn, priority, requirementsTransformer) {
	      this.validators[name.toLowerCase()] = function (requirements) {
	        return $.extend(new Validator.Assert().Callback(fn, requirements), {
	          priority: priority,
	          requirementsTransformer: requirementsTransformer
	        });
	      };
	      return this;
	    },
	    updateValidator: function updateValidator(name, fn, priority, requirementsTransformer) {
	      return this.addValidator(name, fn, priority, requirementsTransformer);
	    },
	    removeValidator: function removeValidator(name) {
	      delete this.validators[name];
	      return this;
	    },
	    getErrorMessage: function getErrorMessage(constraint) {
	      var message;
	      // Type constraints are a bit different, we have to match their requirements too to find right error message
	      if ('type' === constraint.name) message = this.catalog[this.locale][constraint.name][constraint.requirements];else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);
	      return '' !== message ? message : this.catalog[this.locale].defaultMessage;
	    },
	    // Kind of light `sprintf()` implementation
	    formatMessage: function formatMessage(string, parameters) {
	      if ('object' === typeof parameters) {
	        for (var i in parameters) string = this.formatMessage(string, parameters[i]);
	        return string;
	      }
	      return 'string' === typeof string ? string.replace(new RegExp('%s', 'i'), parameters) : '';
	    },
	    // Here is the Parsley default validators list.
	    // This is basically Validatorjs validators, with different API for some of them
	    // and a Parsley priority set
	    validators: {
	      notblank: function notblank() {
	        return $.extend(new Validator.Assert().NotBlank(), { priority: 2 });
	      },
	      required: function required() {
	        return $.extend(new Validator.Assert().Required(), { priority: 512 });
	      },
	      type: function type(_type) {
	        var assert;
	        switch (_type) {
	          case 'email':
	            assert = new Validator.Assert().Email();
	            break;
	          // range type just ensure we have a number here
	          case 'range':
	          case 'number':
	            assert = new Validator.Assert().Regexp('^-?(?:\\d+|\\d{1,3}(?:,\\d{3})+)?(?:\\.\\d+)?$');
	            break;
	          case 'integer':
	            assert = new Validator.Assert().Regexp('^-?\\d+$');
	            break;
	          case 'digits':
	            assert = new Validator.Assert().Regexp('^\\d+$');
	            break;
	          case 'alphanum':
	            assert = new Validator.Assert().Regexp('^\\w+$', 'i');
	            break;
	          case 'url':
	            assert = new Validator.Assert().Regexp('(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,24}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)', 'i');
	            break;
	          default:
	            throw new Error('validator type `' + _type + '` is not supported');
	        }
	        return $.extend(assert, { priority: 256 });
	      },
	      pattern: function pattern(regexp) {
	        var flags = '';
	        // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
	        if (!!/^\/.*\/(?:[gimy]*)$/.test(regexp)) {
	          // Replace the regexp literal string with the first match group: ([gimy]*)
	          // If no flag is present, this will be a blank string
	          flags = regexp.replace(/.*\/([gimy]*)$/, '$1');
	          // Again, replace the regexp literal string with the first match group:
	          // everything excluding the opening and closing slashes and the flags
	          regexp = regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	        }
	        return $.extend(new Validator.Assert().Regexp(regexp, flags), { priority: 64 });
	      },
	      minlength: function minlength(value) {
	        return $.extend(new Validator.Assert().Length({ min: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      maxlength: function maxlength(value) {
	        return $.extend(new Validator.Assert().Length({ max: value }), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      length: function length(array) {
	        return $.extend(new Validator.Assert().Length({ min: array[0], max: array[1] }), { priority: 32 });
	      },
	      mincheck: function mincheck(length) {
	        return this.minlength(length);
	      },
	      maxcheck: function maxcheck(length) {
	        return this.maxlength(length);
	      },
	      check: function check(array) {
	        return this.length(array);
	      },
	      min: function min(value) {
	        return $.extend(new Validator.Assert().GreaterThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      max: function max(value) {
	        return $.extend(new Validator.Assert().LessThanOrEqual(value), {
	          priority: 30,
	          requirementsTransformer: function requirementsTransformer() {
	            return 'string' === typeof value && !isNaN(value) ? parseInt(value, 10) : value;
	          }
	        });
	      },
	      range: function range(array) {
	        return $.extend(new Validator.Assert().Range(array[0], array[1]), {
	          priority: 32,
	          requirementsTransformer: function requirementsTransformer() {
	            for (var i = 0; i < array.length; i++) array[i] = 'string' === typeof array[i] && !isNaN(array[i]) ? parseInt(array[i], 10) : array[i];
	            return array;
	          }
	        });
	      },
	      equalto: function equalto(value) {
	        return $.extend(new Validator.Assert().EqualTo(value), {
	          priority: 256,
	          requirementsTransformer: function requirementsTransformer() {
	            return $(value).length ? $(value).val() : value;
	          }
	        });
	      }
	    }
	  };
	
	  var ParsleyUI = function ParsleyUI(options) {
	    this.__class__ = 'ParsleyUI';
	  };
	  ParsleyUI.prototype = {
	    listen: function listen() {
	      $.listen('parsley:form:init', this, this.setupForm);
	      $.listen('parsley:field:init', this, this.setupField);
	      $.listen('parsley:field:validated', this, this.reflow);
	      $.listen('parsley:form:validated', this, this.focus);
	      $.listen('parsley:field:reset', this, this.reset);
	      $.listen('parsley:form:destroy', this, this.destroy);
	      $.listen('parsley:field:destroy', this, this.destroy);
	      return this;
	    },
	    reflow: function reflow(fieldInstance) {
	      // If this field has not an active UI (case for multiples) don't bother doing something
	      if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active) return;
	      // Diff between two validation results
	      var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);
	      // Then store current validation result for next reflow
	      fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;
	      // Field have been validated at least once if here. Useful for binded key events...
	      fieldInstance._ui.validatedOnce = true;
	      // Handle valid / invalid / none field class
	      this.manageStatusClass(fieldInstance);
	      // Add, remove, updated errors messages
	      this.manageErrorsMessages(fieldInstance, diff);
	      // Triggers impl
	      this.actualizeTriggers(fieldInstance);
	      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
	      if ((diff.kept.length || diff.added.length) && 'undefined' === typeof fieldInstance._ui.failedOnce) this.manageFailingFieldTrigger(fieldInstance);
	    },
	    // Returns an array of field's error message(s)
	    getErrorsMessages: function getErrorsMessages(fieldInstance) {
	      // No error message, field is valid
	      if (true === fieldInstance.validationResult) return [];
	      var messages = [];
	      for (var i = 0; i < fieldInstance.validationResult.length; i++) messages.push(this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));
	      return messages;
	    },
	    manageStatusClass: function manageStatusClass(fieldInstance) {
	      if (true === fieldInstance.validationResult) this._successClass(fieldInstance);else if (fieldInstance.validationResult.length > 0) this._errorClass(fieldInstance);else this._resetClass(fieldInstance);
	    },
	    manageErrorsMessages: function manageErrorsMessages(fieldInstance, diff) {
	      if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled) return;
	      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
	      if ('undefined' !== typeof fieldInstance.options.errorMessage) {
	        if (diff.added.length || diff.kept.length) {
	          if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length) fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));
	          return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);
	        }
	        return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
	      }
	      // Show, hide, update failing constraints messages
	      for (var i = 0; i < diff.removed.length; i++) this.removeError(fieldInstance, diff.removed[i].assert.name, true);
	      for (i = 0; i < diff.added.length; i++) this.addError(fieldInstance, diff.added[i].assert.name, undefined, diff.added[i].assert, true);
	      for (i = 0; i < diff.kept.length; i++) this.updateError(fieldInstance, diff.kept[i].assert.name, undefined, diff.kept[i].assert, true);
	    },
	    // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
	    // but a little bit complex for above internal usage, with forced undefined parameter...
	    addError: function addError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert)));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above
	    updateError: function updateError(fieldInstance, name, message, assert, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert));
	      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
	    },
	    // Same as above twice
	    removeError: function removeError(fieldInstance, name, doNotUpdateClass) {
	      fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();
	      // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
	      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
	      if (true !== doNotUpdateClass) this.manageStatusClass(fieldInstance);
	    },
	    focus: function focus(formInstance) {
	      if (true === formInstance.validationResult || 'none' === formInstance.options.focus) return formInstance._focusedField = null;
	      formInstance._focusedField = null;
	      for (var i = 0; i < formInstance.fields.length; i++) if (true !== formInstance.fields[i].validationResult && formInstance.fields[i].validationResult.length > 0 && 'undefined' === typeof formInstance.fields[i].options.noFocus) {
	        if ('first' === formInstance.options.focus) {
	          formInstance._focusedField = formInstance.fields[i].$element;
	          return formInstance._focusedField.focus();
	        }
	        formInstance._focusedField = formInstance.fields[i].$element;
	      }
	      if (null === formInstance._focusedField) return null;
	      return formInstance._focusedField.focus();
	    },
	    _getErrorMessage: function _getErrorMessage(fieldInstance, constraint) {
	      var customConstraintErrorMessage = constraint.name + 'Message';
	      if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage]) return window.ParsleyValidator.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);
	      return window.ParsleyValidator.getErrorMessage(constraint);
	    },
	    _diff: function _diff(newResult, oldResult, deep) {
	      var added = [],
	          kept = [];
	      for (var i = 0; i < newResult.length; i++) {
	        var found = false;
	        for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
	          found = true;
	          break;
	        }
	        if (found) kept.push(newResult[i]);else added.push(newResult[i]);
	      }
	      return {
	        kept: kept,
	        added: added,
	        removed: !deep ? this._diff(oldResult, newResult, true).added : []
	      };
	    },
	    setupForm: function setupForm(formInstance) {
	      formInstance.$element.on('submit.Parsley', false, $.proxy(formInstance.onSubmitValidate, formInstance));
	      // UI could be disabled
	      if (false === formInstance.options.uiEnabled) return;
	      formInstance.$element.attr('novalidate', '');
	    },
	    setupField: function setupField(fieldInstance) {
	      var _ui = { active: false };
	      // UI could be disabled
	      if (false === fieldInstance.options.uiEnabled) return;
	      _ui.active = true;
	      // Give field its Parsley id in DOM
	      fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);
	      /** Generate important UI elements and store them in fieldInstance **/
	      // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
	      _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);
	      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
	      _ui.errorsWrapperId = 'parsley-id-' + ('undefined' !== typeof fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
	      _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);
	      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
	      _ui.lastValidationResult = [];
	      _ui.validatedOnce = false;
	      _ui.validationInformationVisible = false;
	      // Store it in fieldInstance for later
	      fieldInstance._ui = _ui;
	      // Stops excluded inputs from getting errorContainer added
	      if (!fieldInstance.$element.is(fieldInstance.options.excluded)) {
	        /** Mess with DOM now **/
	        this._insertErrorWrapper(fieldInstance);
	      }
	      // Bind triggers first time
	      this.actualizeTriggers(fieldInstance);
	    },
	    // Determine which element will have `parsley-error` and `parsley-success` classes
	    _manageClassHandler: function _manageClassHandler(fieldInstance) {
	      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
	      if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length) return $(fieldInstance.options.classHandler);
	      // Class handled could also be determined by function given in Parsley options
	      var $handler = fieldInstance.options.classHandler(fieldInstance);
	      // If this function returned a valid existing DOM element, go for it
	      if ('undefined' !== typeof $handler && $handler.length) return $handler;
	      // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
	      if ('undefined' === typeof fieldInstance.options.multiple || fieldInstance.$element.is('select')) return fieldInstance.$element;
	      // But if multiple element (radio, checkbox), that would be their parent
	      return fieldInstance.$element.parent();
	    },
	    _insertErrorWrapper: function _insertErrorWrapper(fieldInstance) {
	      var $errorsContainer;
	      if ('string' === typeof fieldInstance.options.errorsContainer) {
	        if ($(fieldInstance.options.errorsContainer).length) return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else if (window.console && window.console.warn) window.console.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
	      } else if ('function' === typeof fieldInstance.options.errorsContainer) $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);
	      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);
	      return 'undefined' === typeof fieldInstance.options.multiple ? fieldInstance.$element.after(fieldInstance._ui.$errorsWrapper) : fieldInstance.$element.parent().after(fieldInstance._ui.$errorsWrapper);
	    },
	    actualizeTriggers: function actualizeTriggers(fieldInstance) {
	      var $toBind = fieldInstance.$element;
	      if (fieldInstance.options.multiple) $toBind = $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]');
	      // Remove Parsley events already binded on this field
	      $toBind.off('.Parsley');
	      // If no trigger is set, all good
	      if (false === fieldInstance.options.trigger) return;
	      var triggers = fieldInstance.options.trigger.replace(/^\s+/g, '').replace(/\s+$/g, '');
	      if ('' === triggers) return;
	      // Bind fieldInstance.eventValidate if exists (for parsley.ajax for example), ParsleyUI.eventValidate otherwise
	      $toBind.on(triggers.split(' ').join('.Parsley ') + '.Parsley', $.proxy('function' === typeof fieldInstance.eventValidate ? fieldInstance.eventValidate : this.eventValidate, fieldInstance));
	    },
	    // Called through $.proxy with fieldInstance. `this` context is ParsleyField
	    eventValidate: function eventValidate(event) {
	      // For keyup, keypress, keydown... events that could be a little bit obstrusive
	      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
	      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
	      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;
	      this._ui.validatedOnce = true;
	      this.validate();
	    },
	    manageFailingFieldTrigger: function manageFailingFieldTrigger(fieldInstance) {
	      fieldInstance._ui.failedOnce = true;
	      // Radio and checkboxes fields must bind every field multiple
	      if (fieldInstance.options.multiple) $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]').each(function () {
	        if (!new RegExp('change', 'i').test($(this).parsley().options.trigger || '')) return $(this).on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      });
	      // Select case
	      if (fieldInstance.$element.is('select')) if (!new RegExp('change', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	      // All other inputs fields
	      if (!new RegExp('keyup', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('keyup.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
	    },
	    reset: function reset(parsleyInstance) {
	      // Reset all event listeners
	      parsleyInstance.$element.off('.Parsley');
	      parsleyInstance.$element.off('.ParsleyFailedOnce');
	      // Nothing to do if UI never initialized for this field
	      if ('undefined' === typeof parsleyInstance._ui) return;
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      // Reset all errors' li
	      parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove();
	      // Reset validation class
	      this._resetClass(parsleyInstance);
	      // Reset validation flags and last validation result
	      parsleyInstance._ui.validatedOnce = false;
	      parsleyInstance._ui.lastValidationResult = [];
	      parsleyInstance._ui.validationInformationVisible = false;
	    },
	    destroy: function destroy(parsleyInstance) {
	      this.reset(parsleyInstance);
	      if ('ParsleyForm' === parsleyInstance.__class__) return;
	      if ('undefined' !== typeof parsleyInstance._ui) parsleyInstance._ui.$errorsWrapper.remove();
	      delete parsleyInstance._ui;
	    },
	    _successClass: function _successClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
	    },
	    _errorClass: function _errorClass(fieldInstance) {
	      fieldInstance._ui.validationInformationVisible = true;
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
	    },
	    _resetClass: function _resetClass(fieldInstance) {
	      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
	    }
	  };
	
	  var ParsleyOptionsFactory = function ParsleyOptionsFactory(defaultOptions, globalOptions, userOptions, namespace) {
	    this.__class__ = 'OptionsFactory';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.formOptions = null;
	    this.fieldOptions = null;
	    this.staticOptions = $.extend(true, {}, defaultOptions, globalOptions, userOptions, { namespace: namespace });
	  };
	  ParsleyOptionsFactory.prototype = {
	    get: function get(parsleyInstance) {
	      if ('undefined' === typeof parsleyInstance.__class__) throw new Error('Parsley Instance expected');
	      switch (parsleyInstance.__class__) {
	        case 'Parsley':
	          return this.staticOptions;
	        case 'ParsleyForm':
	          return this.getFormOptions(parsleyInstance);
	        case 'ParsleyField':
	        case 'ParsleyFieldMultiple':
	          return this.getFieldOptions(parsleyInstance);
	        default:
	          throw new Error('Instance ' + parsleyInstance.__class__ + ' is not supported');
	      }
	    },
	    getFormOptions: function getFormOptions(formInstance) {
	      this.formOptions = ParsleyUtils.attr(formInstance.$element, this.staticOptions.namespace);
	      // not deep extend, since formOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions);
	    },
	    getFieldOptions: function getFieldOptions(fieldInstance) {
	      this.fieldOptions = ParsleyUtils.attr(fieldInstance.$element, this.staticOptions.namespace);
	      if (null === this.formOptions && 'undefined' !== typeof fieldInstance.parent) this.formOptions = this.getFormOptions(fieldInstance.parent);
	      // not deep extend, since formOptions and fieldOptions is a 1 level deep object
	      return $.extend({}, this.staticOptions, this.formOptions, this.fieldOptions);
	    }
	  };
	
	  var ParsleyForm = function ParsleyForm(element, OptionsFactory) {
	    this.__class__ = 'ParsleyForm';
	    this.__id__ = ParsleyUtils.hash(4);
	    if ('OptionsFactory' !== ParsleyUtils.get(OptionsFactory, '__class__')) throw new Error('You must give an OptionsFactory instance');
	    this.OptionsFactory = OptionsFactory;
	    this.$element = $(element);
	    this.validationResult = null;
	    this.options = this.OptionsFactory.get(this);
	  };
	  ParsleyForm.prototype = {
	    onSubmitValidate: function onSubmitValidate(event) {
	      this.validate(undefined, undefined, event);
	      // prevent form submission if validation fails
	      if (false === this.validationResult && event instanceof $.Event) {
	        event.stopImmediatePropagation();
	        event.preventDefault();
	      }
	      return this;
	    },
	    // @returns boolean
	    validate: function validate(group, force, event) {
	      this.submitEvent = event;
	      this.validationResult = true;
	      var fieldValidationResult = [];
	      $.emit('parsley:form:validate', this);
	      // Refresh form DOM options and form's fields that could have changed
	      this._refreshFields();
	      // loop through fields to validate them one by one
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        fieldValidationResult = this.fields[i].validate(force);
	        if (true !== fieldValidationResult && fieldValidationResult.length > 0 && this.validationResult) this.validationResult = false;
	      }
	      $.emit('parsley:form:' + (this.validationResult ? 'success' : 'error'), this);
	      $.emit('parsley:form:validated', this);
	      return this.validationResult;
	    },
	    // Iterate over refreshed fields, and stop on first failure
	    isValid: function isValid(group, force) {
	      this._refreshFields();
	      for (var i = 0; i < this.fields.length; i++) {
	        // do not validate a field if not the same as given validation group
	        if (group && !this._isFieldInGroup(this.fields[i], group)) continue;
	        if (false === this.fields[i].isValid(force)) return false;
	      }
	      return true;
	    },
	    _isFieldInGroup: function _isFieldInGroup(field, group) {
	      if (ParsleyUtils.isArray(field.options.group)) return -1 !== $.inArray(group, field.options.group);
	      return field.options.group === group;
	    },
	    _refreshFields: function _refreshFields() {
	      return this.actualizeOptions()._bindFields();
	    },
	    _bindFields: function _bindFields() {
	      var self = this;
	      this.fields = [];
	      this.fieldsMappedById = {};
	      this.$element.find(this.options.inputs).each(function () {
	        var fieldInstance = new window.Parsley(this, {}, self);
	        // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
	        if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && !fieldInstance.$element.is(fieldInstance.options.excluded)) if ('undefined' === typeof self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
	          self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
	          self.fields.push(fieldInstance);
	        }
	      });
	      return this;
	    }
	  };
	
	  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
	    var assert = {};
	    if (!new RegExp('ParsleyField').test(ParsleyUtils.get(parsleyField, '__class__'))) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');
	    if ('function' === typeof window.ParsleyValidator.validators[name]) assert = window.ParsleyValidator.validators[name](requirements);
	    if ('Assert' !== assert.__parentClass__) throw new Error('Valid validator expected');
	    var getPriority = function getPriority() {
	      if ('undefined' !== typeof parsleyField.options[name + 'Priority']) return parsleyField.options[name + 'Priority'];
	      return ParsleyUtils.get(assert, 'priority') || 2;
	    };
	    priority = priority || getPriority();
	    // If validator have a requirementsTransformer, execute it
	    if ('function' === typeof assert.requirementsTransformer) {
	      requirements = assert.requirementsTransformer();
	      // rebuild assert with new requirements
	      assert = window.ParsleyValidator.validators[name](requirements);
	    }
	    return $.extend(assert, {
	      name: name,
	      requirements: requirements,
	      priority: priority,
	      groups: [priority],
	      isDomConstraint: isDomConstraint || ParsleyUtils.attr(parsleyField.$element, parsleyField.options.namespace, name)
	    });
	  };
	
	  var ParsleyField = function ParsleyField(field, OptionsFactory, parsleyFormInstance) {
	    this.__class__ = 'ParsleyField';
	    this.__id__ = ParsleyUtils.hash(4);
	    this.$element = $(field);
	    // If we have a parent `ParsleyForm` instance given, use its `OptionsFactory`, and save parent
	    if ('undefined' !== typeof parsleyFormInstance) {
	      this.parent = parsleyFormInstance;
	      this.OptionsFactory = this.parent.OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	      // Else, take the `Parsley` one
	    } else {
	      this.OptionsFactory = OptionsFactory;
	      this.options = this.OptionsFactory.get(this);
	    }
	    // Initialize some properties
	    this.constraints = [];
	    this.constraintsByName = {};
	    this.validationResult = [];
	    // Bind constraints
	    this._bindConstraints();
	  };
	  ParsleyField.prototype = {
	    // # Public API
	    // Validate field and $.emit some events for mainly `ParsleyUI`
	    // @returns validationResult:
	    //  - `true` if all constraints pass
	    //  - `[]` if not required field and empty (not validated)
	    //  - `[Violation, [Violation...]]` if there were validation errors
	    validate: function validate(force) {
	      this.value = this.getValue();
	      // Field Validate event. `this.value` could be altered for custom needs
	      $.emit('parsley:field:validate', this);
	      $.emit('parsley:field:' + (this.isValid(force, this.value) ? 'success' : 'error'), this);
	      // Field validated event. `this.validationResult` could be altered for custom needs too
	      $.emit('parsley:field:validated', this);
	      return this.validationResult;
	    },
	    // Just validate field. Do not trigger any event
	    // Same @return as `validate()`
	    isValid: function isValid(force, value) {
	      // Recompute options and rebind constraints to have latest changes
	      this.refreshConstraints();
	      // Sort priorities to validate more important first
	      var priorities = this._getConstraintsSortedPriorities();
	      if (0 === priorities.length) return this.validationResult = [];
	      // Value could be passed as argument, needed to add more power to 'parsley:field:validate'
	      if ('undefined' === typeof value || null === value) value = this.getValue();
	      // If a field is empty and not required, leave it alone, it's just fine
	      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
	      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty && true !== force) return this.validationResult = [];
	      // If we want to validate field against all constraints, just call Validator and let it do the job
	      if (false === this.options.priorityEnabled) return true === (this.validationResult = this.validateThroughValidator(value, this.constraints, 'Any'));
	      // Else, iterate over priorities one by one, and validate related asserts one by one
	      for (var i = 0; i < priorities.length; i++) if (true !== (this.validationResult = this.validateThroughValidator(value, this.constraints, priorities[i]))) return false;
	      return true;
	    },
	    // @returns Parsley field computed value that could be overrided or configured in DOM
	    getValue: function getValue() {
	      var value;
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();
	      // Handle wrong DOM or configurations
	      if ('undefined' === typeof value || null === value) return '';
	      // Use `data-parsley-trim-value="true"` to auto trim inputs entry
	      if (true === this.options.trimValue) return value.replace(/^\s+|\s+$/g, '');
	      return value;
	    },
	    // Actualize options that could have change since previous validation
	    // Re-bind accordingly constraints (could be some new, removed or updated)
	    refreshConstraints: function refreshConstraints() {
	      return this.actualizeOptions()._bindConstraints();
	    },
	    /**
	    * Add a new constraint to a field
	    *
	    * @method addConstraint
	    * @param {String}   name
	    * @param {Mixed}    requirements      optional
	    * @param {Number}   priority          optional
	    * @param {Boolean}  isDomConstraint   optional
	    */
	    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {
	      name = name.toLowerCase();
	      if ('function' === typeof window.ParsleyValidator.validators[name]) {
	        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);
	        // if constraint already exist, delete it and push new version
	        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);
	        this.constraints.push(constraint);
	        this.constraintsByName[constraint.name] = constraint;
	      }
	      return this;
	    },
	    // Remove a constraint
	    removeConstraint: function removeConstraint(name) {
	      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
	        this.constraints.splice(i, 1);
	        break;
	      }
	      delete this.constraintsByName[name];
	      return this;
	    },
	    // Update a constraint (Remove + re-add)
	    updateConstraint: function updateConstraint(name, parameters, priority) {
	      return this.removeConstraint(name).addConstraint(name, parameters, priority);
	    },
	    // # Internals
	    // Internal only.
	    // Bind constraints from config + options + DOM
	    _bindConstraints: function _bindConstraints() {
	      var constraints = [],
	          constraintsByName = {};
	      // clean all existing DOM constraints to only keep javascript user constraints
	      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
	        constraints.push(this.constraints[i]);
	        constraintsByName[this.constraints[i].name] = this.constraints[i];
	      }
	      this.constraints = constraints;
	      this.constraintsByName = constraintsByName;
	      // then re-add Parsley DOM-API constraints
	      for (var name in this.options) this.addConstraint(name, this.options[name]);
	      // finally, bind special HTML5 constraints
	      return this._bindHtml5Constraints();
	    },
	    // Internal only.
	    // Bind specific HTML5 constraints to be HTML5 compliant
	    _bindHtml5Constraints: function _bindHtml5Constraints() {
	      // html5 required
	      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);
	      // html5 pattern
	      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);
	      // range
	      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);
	      // HTML5 min
	      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);
	      // HTML5 max
	      else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);
	
	      // length
	      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);
	      // HTML5 minlength
	      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);
	      // HTML5 maxlength
	      else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);
	
	      // html5 types
	      var type = this.$element.attr('type');
	      if ('undefined' === typeof type) return this;
	      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
	      if ('number' === type) {
	        if ('undefined' === typeof this.$element.attr('step') || 0 === parseFloat(this.$element.attr('step')) % 1) {
	          return this.addConstraint('type', 'integer', undefined, true);
	        } else {
	          return this.addConstraint('type', 'number', undefined, true);
	        }
	        // Regular other HTML5 supported types
	      } else if (new RegExp(type, 'i').test('email url range')) {
	        return this.addConstraint('type', type, undefined, true);
	      }
	      return this;
	    },
	    // Internal only.
	    // Field is required if have required constraint without `false` value
	    _isRequired: function _isRequired() {
	      if ('undefined' === typeof this.constraintsByName.required) return false;
	      return false !== this.constraintsByName.required.requirements;
	    },
	    // Internal only.
	    // Sort constraints by priority DESC
	    _getConstraintsSortedPriorities: function _getConstraintsSortedPriorities() {
	      var priorities = [];
	      // Create array unique of priorities
	      for (var i = 0; i < this.constraints.length; i++) if (-1 === priorities.indexOf(this.constraints[i].priority)) priorities.push(this.constraints[i].priority);
	      // Sort them by priority DESC
	      priorities.sort(function (a, b) {
	        return b - a;
	      });
	      return priorities;
	    }
	  };
	
	  var ParsleyMultiple = function ParsleyMultiple() {
	    this.__class__ = 'ParsleyFieldMultiple';
	  };
	  ParsleyMultiple.prototype = {
	    // Add new `$element` sibling for multiple field
	    addElement: function addElement($element) {
	      this.$elements.push($element);
	      return this;
	    },
	    // See `ParsleyField.refreshConstraints()`
	    refreshConstraints: function refreshConstraints() {
	      var fieldConstraints;
	      this.constraints = [];
	      // Select multiple special treatment
	      if (this.$element.is('select')) {
	        this.actualizeOptions()._bindConstraints();
	        return this;
	      }
	      // Gather all constraints for each input in the multiple group
	      for (var i = 0; i < this.$elements.length; i++) {
	        // Check if element have not been dynamically removed since last binding
	        if (!$('html').has(this.$elements[i]).length) {
	          this.$elements.splice(i, 1);
	          continue;
	        }
	        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;
	        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
	      }
	      return this;
	    },
	    // See `ParsleyField.getValue()`
	    getValue: function getValue() {
	      // Value could be overriden in DOM
	      if ('undefined' !== typeof this.options.value) return this.options.value;
	      // Radio input case
	      if (this.$element.is('input[type=radio]')) return $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').val() || '';
	      // checkbox input case
	      if (this.$element.is('input[type=checkbox]')) {
	        var values = [];
	        $('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]:checked').each(function () {
	          values.push($(this).val());
	        });
	        return values.length ? values : [];
	      }
	      // Select multiple case
	      if (this.$element.is('select') && null === this.$element.val()) return [];
	      // Default case that should never happen
	      return this.$element.val();
	    },
	    _init: function _init(multiple) {
	      this.$elements = [this.$element];
	      this.options.multiple = multiple;
	      return this;
	    }
	  };
	
	  var o = $({}),
	      subscribed = {};
	  // $.listen(name, callback);
	  // $.listen(name, context, callback);
	  $.listen = function (name) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if ('function' === typeof arguments[1]) return subscribed[name].push({ fn: arguments[1] });
	    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) return subscribed[name].push({ fn: arguments[2], ctxt: arguments[1] });
	    throw new Error('Wrong parameters');
	  };
	  $.listenTo = function (instance, name, fn) {
	    if ('undefined' === typeof subscribed[name]) subscribed[name] = [];
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');
	    subscribed[name].push({ instance: instance, fn: fn });
	  };
	  $.unsubscribe = function (name, fn) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
	    for (var i = 0; i < subscribed[name].length; i++) if (subscribed[name][i].fn === fn) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeTo = function (instance, name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
	    for (var i = 0; i < subscribed[name].length; i++) if ('undefined' !== typeof subscribed[name][i].instance && subscribed[name][i].instance.__id__ === instance.__id__) return subscribed[name].splice(i, 1);
	  };
	  $.unsubscribeAll = function (name) {
	    if ('undefined' === typeof subscribed[name]) return;
	    delete subscribed[name];
	  };
	  // $.emit(name [, arguments...]);
	  // $.emit(name, instance [, arguments...]);
	  $.emit = function (name, instance) {
	    if ('undefined' === typeof subscribed[name]) return;
	    // loop through registered callbacks for this event
	    for (var i = 0; i < subscribed[name].length; i++) {
	      // if instance is not registered, simple emit
	      if ('undefined' === typeof subscribed[name][i].instance) {
	        subscribed[name][i].fn.apply('undefined' !== typeof subscribed[name][i].ctxt ? subscribed[name][i].ctxt : o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if instance registered but no instance given for the emit, continue
	      if (!(instance instanceof ParsleyField) && !(instance instanceof ParsleyForm)) continue;
	      // if instance is registered and same id, emit
	      if (subscribed[name][i].instance.__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	      // if registered instance is a Form and fired one is a Field, loop over all its fields and emit if field found
	      if (subscribed[name][i].instance instanceof ParsleyForm && instance instanceof ParsleyField) for (var j = 0; j < subscribed[name][i].instance.fields.length; j++) if (subscribed[name][i].instance.fields[j].__id__ === instance.__id__) {
	        subscribed[name][i].fn.apply(o, Array.prototype.slice.call(arguments, 1));
	        continue;
	      }
	    }
	  };
	  $.subscribed = function () {
	    return subscribed;
	  };
	
	  // ParsleyConfig definition if not already set
	  window.ParsleyConfig = window.ParsleyConfig || {};
	  window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};
	  // Define then the messages
	  window.ParsleyConfig.i18n.en = $.extend(window.ParsleyConfig.i18n.en || {}, {
	    defaultMessage: 'This value seems to be invalid.',
	    type: {
	      email: 'This value should be a valid email.',
	      url: 'This value should be a valid url.',
	      number: 'This value should be a valid number.',
	      integer: 'This value should be a valid integer.',
	      digits: 'This value should be digits.',
	      alphanum: 'This value should be alphanumeric.'
	    },
	    notblank: 'This value should not be blank.',
	    required: 'This value is required.',
	    pattern: 'This value seems to be invalid.',
	    min: 'This value should be greater than or equal to %s.',
	    max: 'This value should be lower than or equal to %s.',
	    range: 'This value should be between %s and %s.',
	    minlength: 'This value is too short. It should have %s characters or more.',
	    maxlength: 'This value is too long. It should have %s characters or fewer.',
	    length: 'This value length is invalid. It should be between %s and %s characters long.',
	    mincheck: 'You must select at least %s choices.',
	    maxcheck: 'You must select %s choices or fewer.',
	    check: 'You must select between %s and %s choices.',
	    equalto: 'This value should be the same.'
	  });
	  // If file is loaded after Parsley main file, auto-load locale
	  if ('undefined' !== typeof window.ParsleyValidator) window.ParsleyValidator.addCatalog('en', window.ParsleyConfig.i18n.en, true);
	
	  //     Parsley.js 2.0.6
	  //     http://parsleyjs.org
	  //     (c) 20012-2014 Guillaume Potier, Wisembly
	  //     Parsley may be freely distributed under the MIT license.
	
	  // ### Parsley factory
	  var Parsley = function Parsley(element, options, parsleyFormInstance) {
	    this.__class__ = 'Parsley';
	    this.__version__ = '2.0.6';
	    this.__id__ = ParsleyUtils.hash(4);
	    // Parsley must be instantiated with a DOM element or jQuery $element
	    if ('undefined' === typeof element) throw new Error('You must give an element');
	    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');
	    return this.init($(element), options, parsleyFormInstance);
	  };
	  Parsley.prototype = {
	    init: function init($element, options, parsleyFormInstance) {
	      if (!$element.length) throw new Error('You must bind Parsley on an existing element.');
	      this.$element = $element;
	      // If element have already been binded, returns its saved Parsley instance
	      if (this.$element.data('Parsley')) {
	        var savedparsleyFormInstance = this.$element.data('Parsley');
	        // If saved instance have been binded without a ParsleyForm parent and there is one given in this call, add it
	        if ('undefined' !== typeof parsleyFormInstance) savedparsleyFormInstance.parent = parsleyFormInstance;
	        return savedparsleyFormInstance;
	      }
	      // Handle 'static' options
	      this.OptionsFactory = new ParsleyOptionsFactory(ParsleyDefaults, ParsleyUtils.get(window, 'ParsleyConfig') || {}, options, this.getNamespace(options));
	      this.options = this.OptionsFactory.get(this);
	      // A ParsleyForm instance is obviously a `<form>` elem but also every node that is not an input and have `data-parsley-validate` attribute
	      if (this.$element.is('form') || ParsleyUtils.attr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');
	      // Every other supported element and not excluded element is binded as a `ParsleyField` or `ParsleyFieldMultiple`
	      else if (this.$element.is(this.options.inputs) && !this.$element.is(this.options.excluded)) return this.isMultiple() ? this.handleMultiple(parsleyFormInstance) : this.bind('parsleyField', parsleyFormInstance);
	      return this;
	    },
	    isMultiple: function isMultiple() {
	      return this.$element.is('input[type=radio], input[type=checkbox]') && 'undefined' === typeof this.options.multiple || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
	    },
	    // Multiples fields are a real nightmare :(
	    // Maybe some refacto would be appreciated here...
	    handleMultiple: function handleMultiple(parsleyFormInstance) {
	      var that = this,
	          name,
	          multiple,
	          parsleyMultipleInstance;
	      // Get parsleyFormInstance options if exist, mixed with element attributes
	      this.options = $.extend(this.options, parsleyFormInstance ? parsleyFormInstance.OptionsFactory.get(parsleyFormInstance) : {}, ParsleyUtils.attr(this.$element, this.options.namespace));
	      // Handle multiple name
	      if (this.options.multiple) multiple = this.options.multiple;else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) multiple = this.$element.attr('id');
	      // Special select multiple input
	      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
	        return this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple || this.__id__);
	        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
	      } else if ('undefined' === typeof multiple) {
	        if (window.console && window.console.warn) window.console.warn('To be binded by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
	        return this;
	      }
	      // Remove special chars
	      multiple = multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');
	      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
	      if ('undefined' !== typeof name) {
	        $('input[name="' + name + '"]').each(function () {
	          if ($(this).is('input[type=radio], input[type=checkbox]')) $(this).attr(that.options.namespace + 'multiple', multiple);
	        });
	      }
	      // Check here if we don't already have a related multiple instance saved
	      if ($('[' + this.options.namespace + 'multiple=' + multiple + ']').length) {
	        for (var i = 0; i < $('[' + this.options.namespace + 'multiple=' + multiple + ']').length; i++) {
	          if ('undefined' !== typeof $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley')) {
	            parsleyMultipleInstance = $($('[' + this.options.namespace + 'multiple=' + multiple + ']').get(i)).data('Parsley');
	            if (!this.$element.data('ParsleyFieldMultiple')) {
	              parsleyMultipleInstance.addElement(this.$element);
	              this.$element.attr(this.options.namespace + 'id', parsleyMultipleInstance.__id__);
	            }
	            break;
	          }
	        }
	      }
	      // Create a secret ParsleyField instance for every multiple field. It would be stored in `data('ParsleyFieldMultiple')`
	      // And would be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
	      this.bind('parsleyField', parsleyFormInstance, multiple, true);
	      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple', parsleyFormInstance, multiple);
	    },
	    // Retrieve namespace used for DOM-API
	    getNamespace: function getNamespace(options) {
	      // `data-parsley-namespace=<namespace>`
	      if ('undefined' !== typeof this.$element.data('parsleyNamespace')) return this.$element.data('parsleyNamespace');
	      if ('undefined' !== typeof ParsleyUtils.get(options, 'namespace')) return options.namespace;
	      if ('undefined' !== typeof ParsleyUtils.get(window, 'ParsleyConfig.namespace')) return window.ParsleyConfig.namespace;
	      return ParsleyDefaults.namespace;
	    },
	    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	    bind: function bind(type, parentParsleyFormInstance, multiple, doNotStore) {
	      var parsleyInstance;
	      switch (type) {
	        case 'parsleyForm':
	          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.OptionsFactory), new ParsleyAbstract(), window.ParsleyExtend)._bindFields();
	          break;
	        case 'parsleyField':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), window.ParsleyExtend);
	          break;
	        case 'parsleyFieldMultiple':
	          parsleyInstance = $.extend(new ParsleyField(this.$element, this.OptionsFactory, parentParsleyFormInstance), new ParsleyAbstract(), new ParsleyMultiple(), window.ParsleyExtend)._init(multiple);
	          break;
	        default:
	          throw new Error(type + 'is not a supported Parsley type');
	      }
	      if ('undefined' !== typeof multiple) ParsleyUtils.setAttr(this.$element, this.options.namespace, 'multiple', multiple);
	      if ('undefined' !== typeof doNotStore) {
	        this.$element.data('ParsleyFieldMultiple', parsleyInstance);
	        return parsleyInstance;
	      }
	      // Store instance if `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
	      if (new RegExp('ParsleyF', 'i').test(parsleyInstance.__class__)) {
	        // Store for later access the freshly binded instance in DOM element itself using jQuery `data()`
	        this.$element.data('Parsley', parsleyInstance);
	        // Tell the world we got a new ParsleyForm or ParsleyField instance!
	        $.emit('parsley:' + ('parsleyForm' === type ? 'form' : 'field') + ':init', parsleyInstance);
	      }
	      return parsleyInstance;
	    }
	  };
	  // ### jQuery API
	  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
	  $.fn.parsley = $.fn.psly = function (options) {
	    if (this.length > 1) {
	      var instances = [];
	      this.each(function () {
	        instances.push($(this).parsley(options));
	      });
	      return instances;
	    }
	    // Return undefined if applied to non existing DOM element
	    if (!$(this).length) {
	      if (window.console && window.console.warn) window.console.warn('You must bind Parsley on an existing element.');
	      return;
	    }
	    return new Parsley(this, options);
	  };
	  // ### ParsleyUI
	  // UI is a class apart that only listen to some events and them modify DOM accordingly
	  // Could be overriden by defining a `window.ParsleyConfig.ParsleyUI` appropriate class (with `listen()` method basically)
	  window.ParsleyUI = 'function' === typeof ParsleyUtils.get(window, 'ParsleyConfig.ParsleyUI') ? new window.ParsleyConfig.ParsleyUI().listen() : new ParsleyUI().listen();
	  // ### ParsleyField and ParsleyForm extension
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};
	  // ### ParsleyConfig
	  // Ensure that defined if not already the case
	  if ('undefined' === typeof window.ParsleyConfig) window.ParsleyConfig = {};
	  // ### Globals
	  window.Parsley = window.psly = Parsley;
	  window.ParsleyUtils = ParsleyUtils;
	  window.ParsleyValidator = new ParsleyValidator(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
	  // ### PARSLEY auto-binding
	  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
	  if (false !== ParsleyUtils.get(window, 'ParsleyConfig.autoBind')) $(function () {
	    // Works only on `data-parsley-validate`.
	    if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
	  });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }

/******/ });
//# sourceMappingURL=category.bundle.js.map
=======
!function(e,t){var n=0,i=Array.prototype.slice,a=e.cleanData;e.cleanData=function(t){for(var n,i=0;null!=(n=t[i]);i++)try{e(n).triggerHandler("remove")}catch(r){}a(t)},e.widget=function(t,n,i){var a,r,s,o,l={},u=t.split(".")[0];t=t.split(".")[1],a=u+"-"+t,i||(i=n,n=e.Widget),e.expr[":"][a.toLowerCase()]=function(t){return!!e.data(t,a)},e[u]=e[u]||{},r=e[u][t],s=e[u][t]=function(e,t){return this._createWidget?void(arguments.length&&this._createWidget(e,t)):new s(e,t)},e.extend(s,r,{version:i.version,_proto:e.extend({},i),_childConstructors:[]}),o=new n,o.options=e.widget.extend({},o.options),e.each(i,function(t,i){return e.isFunction(i)?void(l[t]=function(){var e=function(){return n.prototype[t].apply(this,arguments)},a=function(e){return n.prototype[t].apply(this,e)};return function(){var t,n=this._super,r=this._superApply;return this._super=e,this._superApply=a,t=i.apply(this,arguments),this._super=n,this._superApply=r,t}}()):void(l[t]=i)}),s.prototype=e.widget.extend(o,{widgetEventPrefix:r?o.widgetEventPrefix||t:t},l,{constructor:s,namespace:u,widgetName:t,widgetFullName:a}),r?(e.each(r._childConstructors,function(t,n){var i=n.prototype;e.widget(i.namespace+"."+i.widgetName,s,n._proto)}),delete r._childConstructors):n._childConstructors.push(s),e.widget.bridge(t,s)},e.widget.extend=function(n){for(var a,r,s=i.call(arguments,1),o=0,l=s.length;l>o;o++)for(a in s[o])r=s[o][a],s[o].hasOwnProperty(a)&&r!==t&&(e.isPlainObject(r)?n[a]=e.isPlainObject(n[a])?e.widget.extend({},n[a],r):e.widget.extend({},r):n[a]=r);return n},e.widget.bridge=function(n,a){var r=a.prototype.widgetFullName||n;e.fn[n]=function(s){var o="string"==typeof s,l=i.call(arguments,1),u=this;return s=!o&&l.length?e.widget.extend.apply(null,[s].concat(l)):s,o?this.each(function(){var i,a=e.data(this,r);return a?e.isFunction(a[s])&&"_"!==s.charAt(0)?(i=a[s].apply(a,l),i!==a&&i!==t?(u=i&&i.jquery?u.pushStack(i.get()):i,!1):void 0):e.error("no such method '"+s+"' for "+n+" widget instance"):e.error("cannot call methods on "+n+" prior to initialization; attempted to call method '"+s+"'")}):this.each(function(){var t=e.data(this,r);t?t.option(s||{})._init():e.data(this,r,new a(s,this))}),u}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,i){i=e(i||this.defaultElement||this)[0],this.element=e(i),this.uuid=n++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),i!==this&&(e.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===i&&this.destroy()}}),this.document=e(i.style?i.ownerDocument:i.document||i),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(n,i){var a,r,s,o=n;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof n)if(o={},a=n.split("."),n=a.shift(),a.length){for(r=o[n]=e.widget.extend({},this.options[n]),s=0;s<a.length-1;s++)r[a[s]]=r[a[s]]||{},r=r[a[s]];if(n=a.pop(),1===arguments.length)return r[n]===t?null:r[n];r[n]=i}else{if(1===arguments.length)return this.options[n]===t?null:this.options[n];o[n]=i}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(t,n,i){var a,r=this;"boolean"!=typeof t&&(i=n,n=t,t=!1),i?(n=a=e(n),this.bindings=this.bindings.add(n)):(i=n,n=this.element,a=this.widget()),e.each(i,function(i,s){function o(){return t||r.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof s?r[s]:s).apply(r,arguments):void 0}"string"!=typeof s&&(o.guid=s.guid=s.guid||o.guid||e.guid++);var l=i.match(/^(\w+)\s*(.*)$/),u=l[1]+r.eventNamespace,c=l[2];c?a.delegate(c,u,o):n.bind(u,o)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function n(){return("string"==typeof e?i[e]:e).apply(i,arguments)}var i=this;return setTimeout(n,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,n,i){var a,r,s=this.options[t];if(i=i||{},n=e.Event(n),n.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),n.target=this.element[0],r=n.originalEvent)for(a in r)a in n||(n[a]=r[a]);return this.element.trigger(n,i),!(e.isFunction(s)&&s.apply(this.element[0],[n].concat(i))===!1||n.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,n){e.Widget.prototype["_"+t]=function(i,a,r){"string"==typeof a&&(a={effect:a});var s,o=a?a===!0||"number"==typeof a?n:a.effect||n:t;a=a||{},"number"==typeof a&&(a={duration:a}),s=!e.isEmptyObject(a),a.complete=r,a.delay&&i.delay(a.delay),s&&e.effects&&e.effects.effect[o]?i[t](a):o!==t&&i[o]?i[o](a.duration,a.easing,r):i.queue(function(n){e(this)[t](),r&&r.call(i[0]),n()})}})}(i)}});
>>>>>>> develop
=======
!function(e,t){var i=0,n=Array.prototype.slice,a=e.cleanData;e.cleanData=function(t){for(var i,n=0;null!=(i=t[n]);n++)try{e(i).triggerHandler("remove")}catch(s){}a(t)},e.widget=function(t,i,n){var a,s,o,r,l={},c=t.split(".")[0];t=t.split(".")[1],a=c+"-"+t,n||(n=i,i=e.Widget),e.expr[":"][a.toLowerCase()]=function(t){return!!e.data(t,a)},e[c]=e[c]||{},s=e[c][t],o=e[c][t]=function(e,t){return this._createWidget?void(arguments.length&&this._createWidget(e,t)):new o(e,t)},e.extend(o,s,{version:n.version,_proto:e.extend({},n),_childConstructors:[]}),r=new i,r.options=e.widget.extend({},r.options),e.each(n,function(t,n){return e.isFunction(n)?void(l[t]=function(){var e=function(){return i.prototype[t].apply(this,arguments)},a=function(e){return i.prototype[t].apply(this,e)};return function(){var t,i=this._super,s=this._superApply;return this._super=e,this._superApply=a,t=n.apply(this,arguments),this._super=i,this._superApply=s,t}}()):void(l[t]=n)}),o.prototype=e.widget.extend(r,{widgetEventPrefix:s?r.widgetEventPrefix||t:t},l,{constructor:o,namespace:c,widgetName:t,widgetFullName:a}),s?(e.each(s._childConstructors,function(t,i){var n=i.prototype;e.widget(n.namespace+"."+n.widgetName,o,i._proto)}),delete s._childConstructors):i._childConstructors.push(o),e.widget.bridge(t,o)},e.widget.extend=function(i){for(var a,s,o=n.call(arguments,1),r=0,l=o.length;l>r;r++)for(a in o[r])s=o[r][a],o[r].hasOwnProperty(a)&&s!==t&&(e.isPlainObject(s)?i[a]=e.isPlainObject(i[a])?e.widget.extend({},i[a],s):e.widget.extend({},s):i[a]=s);return i},e.widget.bridge=function(i,a){var s=a.prototype.widgetFullName||i;e.fn[i]=function(o){var r="string"==typeof o,l=n.call(arguments,1),c=this;return o=!r&&l.length?e.widget.extend.apply(null,[o].concat(l)):o,r?this.each(function(){var n,a=e.data(this,s);return a?e.isFunction(a[o])&&"_"!==o.charAt(0)?(n=a[o].apply(a,l),n!==a&&n!==t?(c=n&&n.jquery?c.pushStack(n.get()):n,!1):void 0):e.error("no such method '"+o+"' for "+i+" widget instance"):e.error("cannot call methods on "+i+" prior to initialization; attempted to call method '"+o+"'")}):this.each(function(){var t=e.data(this,s);t?t.option(o||{})._init():e.data(this,s,new a(o,this))}),c}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,n){n=e(n||this.defaultElement||this)[0],this.element=e(n),this.uuid=i++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),n!==this&&(e.data(n,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===n&&this.destroy()}}),this.document=e(n.style?n.ownerDocument:n.document||n),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(i,n){var a,s,o,r=i;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof i)if(r={},a=i.split("."),i=a.shift(),a.length){for(s=r[i]=e.widget.extend({},this.options[i]),o=0;o<a.length-1;o++)s[a[o]]=s[a[o]]||{},s=s[a[o]];if(i=a.pop(),1===arguments.length)return s[i]===t?null:s[i];s[i]=n}else{if(1===arguments.length)return this.options[i]===t?null:this.options[i];r[i]=n}return this._setOptions(r),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(t,i,n){var a,s=this;"boolean"!=typeof t&&(n=i,i=t,t=!1),n?(i=a=e(i),this.bindings=this.bindings.add(i)):(n=i,i=this.element,a=this.widget()),e.each(n,function(n,o){function r(){return t||s.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof o?s[o]:o).apply(s,arguments):void 0}"string"!=typeof o&&(r.guid=o.guid=o.guid||r.guid||e.guid++);var l=n.match(/^(\w+)\s*(.*)$/),c=l[1]+s.eventNamespace,u=l[2];u?a.delegate(u,c,r):i.bind(c,r)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function i(){return("string"==typeof e?n[e]:e).apply(n,arguments)}var n=this;return setTimeout(i,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,i,n){var a,s,o=this.options[t];if(n=n||{},i=e.Event(i),i.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),i.target=this.element[0],s=i.originalEvent)for(a in s)a in i||(i[a]=s[a]);return this.element.trigger(i,n),!(e.isFunction(o)&&o.apply(this.element[0],[i].concat(n))===!1||i.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,i){e.Widget.prototype["_"+t]=function(n,a,s){"string"==typeof a&&(a={effect:a});var o,r=a?a===!0||"number"==typeof a?i:a.effect||i:t;a=a||{},"number"==typeof a&&(a={duration:a}),o=!e.isEmptyObject(a),a.complete=s,a.delay&&n.delay(a.delay),o&&e.effects&&e.effects.effect[r]?n[t](a):r!==t&&n[r]?n[r](a.duration,a.easing,s):n.queue(function(i){e(this)[t](),s&&s.call(n[0]),i()})}})}(n)}]);
>>>>>>> master
=======
!function(e,t){var n=0,i=Array.prototype.slice,r=e.cleanData;e.cleanData=function(t){for(var n,i=0;null!=(n=t[i]);i++)try{e(n).triggerHandler("remove")}catch(a){}r(t)},e.widget=function(t,n,i){var r,a,s,o,l={},u=t.split(".")[0];t=t.split(".")[1],r=u+"-"+t,i||(i=n,n=e.Widget),e.expr[":"][r.toLowerCase()]=function(t){return!!e.data(t,r)},e[u]=e[u]||{},a=e[u][t],s=e[u][t]=function(e,t){return this._createWidget?void(arguments.length&&this._createWidget(e,t)):new s(e,t)},e.extend(s,a,{version:i.version,_proto:e.extend({},i),_childConstructors:[]}),o=new n,o.options=e.widget.extend({},o.options),e.each(i,function(t,i){return e.isFunction(i)?void(l[t]=function(){var e=function(){return n.prototype[t].apply(this,arguments)},r=function(e){return n.prototype[t].apply(this,e)};return function(){var t,n=this._super,a=this._superApply;return this._super=e,this._superApply=r,t=i.apply(this,arguments),this._super=n,this._superApply=a,t}}()):void(l[t]=i)}),s.prototype=e.widget.extend(o,{widgetEventPrefix:a?o.widgetEventPrefix||t:t},l,{constructor:s,namespace:u,widgetName:t,widgetFullName:r}),a?(e.each(a._childConstructors,function(t,n){var i=n.prototype;e.widget(i.namespace+"."+i.widgetName,s,n._proto)}),delete a._childConstructors):n._childConstructors.push(s),e.widget.bridge(t,s)},e.widget.extend=function(n){for(var r,a,s=i.call(arguments,1),o=0,l=s.length;l>o;o++)for(r in s[o])a=s[o][r],s[o].hasOwnProperty(r)&&a!==t&&(e.isPlainObject(a)?n[r]=e.isPlainObject(n[r])?e.widget.extend({},n[r],a):e.widget.extend({},a):n[r]=a);return n},e.widget.bridge=function(n,r){var a=r.prototype.widgetFullName||n;e.fn[n]=function(s){var o="string"==typeof s,l=i.call(arguments,1),u=this;return s=!o&&l.length?e.widget.extend.apply(null,[s].concat(l)):s,o?this.each(function(){var i,r=e.data(this,a);return r?e.isFunction(r[s])&&"_"!==s.charAt(0)?(i=r[s].apply(r,l),i!==r&&i!==t?(u=i&&i.jquery?u.pushStack(i.get()):i,!1):void 0):e.error("no such method '"+s+"' for "+n+" widget instance"):e.error("cannot call methods on "+n+" prior to initialization; attempted to call method '"+s+"'")}):this.each(function(){var t=e.data(this,a);t?t.option(s||{})._init():e.data(this,a,new r(s,this))}),u}},e.Widget=function(){},e.Widget._childConstructors=[],e.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:!1,create:null},_createWidget:function(t,i){i=e(i||this.defaultElement||this)[0],this.element=e(i),this.uuid=n++,this.eventNamespace="."+this.widgetName+this.uuid,this.options=e.widget.extend({},this.options,this._getCreateOptions(),t),this.bindings=e(),this.hoverable=e(),this.focusable=e(),i!==this&&(e.data(i,this.widgetFullName,this),this._on(!0,this.element,{remove:function(e){e.target===i&&this.destroy()}}),this.document=e(i.style?i.ownerDocument:i.document||i),this.window=e(this.document[0].defaultView||this.document[0].parentWindow)),this._create(),this._trigger("create",null,this._getCreateEventData()),this._init()},_getCreateOptions:e.noop,_getCreateEventData:e.noop,_create:e.noop,_init:e.noop,destroy:function(){this._destroy(),this.element.unbind(this.eventNamespace).removeData(this.widgetName).removeData(this.widgetFullName).removeData(e.camelCase(this.widgetFullName)),this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled ui-state-disabled"),this.bindings.unbind(this.eventNamespace),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")},_destroy:e.noop,widget:function(){return this.element},option:function(n,i){var r,a,s,o=n;if(0===arguments.length)return e.widget.extend({},this.options);if("string"==typeof n)if(o={},r=n.split("."),n=r.shift(),r.length){for(a=o[n]=e.widget.extend({},this.options[n]),s=0;s<r.length-1;s++)a[r[s]]=a[r[s]]||{},a=a[r[s]];if(n=r.pop(),1===arguments.length)return a[n]===t?null:a[n];a[n]=i}else{if(1===arguments.length)return this.options[n]===t?null:this.options[n];o[n]=i}return this._setOptions(o),this},_setOptions:function(e){var t;for(t in e)this._setOption(t,e[t]);return this},_setOption:function(e,t){return this.options[e]=t,"disabled"===e&&(this.widget().toggleClass(this.widgetFullName+"-disabled ui-state-disabled",!!t).attr("aria-disabled",t),this.hoverable.removeClass("ui-state-hover"),this.focusable.removeClass("ui-state-focus")),this},enable:function(){return this._setOption("disabled",!1)},disable:function(){return this._setOption("disabled",!0)},_on:function(t,n,i){var r,a=this;"boolean"!=typeof t&&(i=n,n=t,t=!1),i?(n=r=e(n),this.bindings=this.bindings.add(n)):(i=n,n=this.element,r=this.widget()),e.each(i,function(i,s){function o(){return t||a.options.disabled!==!0&&!e(this).hasClass("ui-state-disabled")?("string"==typeof s?a[s]:s).apply(a,arguments):void 0}"string"!=typeof s&&(o.guid=s.guid=s.guid||o.guid||e.guid++);var l=i.match(/^(\w+)\s*(.*)$/),u=l[1]+a.eventNamespace,c=l[2];c?r.delegate(c,u,o):n.bind(u,o)})},_off:function(e,t){t=(t||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace,e.unbind(t).undelegate(t)},_delay:function(e,t){function n(){return("string"==typeof e?i[e]:e).apply(i,arguments)}var i=this;return setTimeout(n,t||0)},_hoverable:function(t){this.hoverable=this.hoverable.add(t),this._on(t,{mouseenter:function(t){e(t.currentTarget).addClass("ui-state-hover")},mouseleave:function(t){e(t.currentTarget).removeClass("ui-state-hover")}})},_focusable:function(t){this.focusable=this.focusable.add(t),this._on(t,{focusin:function(t){e(t.currentTarget).addClass("ui-state-focus")},focusout:function(t){e(t.currentTarget).removeClass("ui-state-focus")}})},_trigger:function(t,n,i){var r,a,s=this.options[t];if(i=i||{},n=e.Event(n),n.type=(t===this.widgetEventPrefix?t:this.widgetEventPrefix+t).toLowerCase(),n.target=this.element[0],a=n.originalEvent)for(r in a)r in n||(n[r]=a[r]);return this.element.trigger(n,i),!(e.isFunction(s)&&s.apply(this.element[0],[n].concat(i))===!1||n.isDefaultPrevented())}},e.each({show:"fadeIn",hide:"fadeOut"},function(t,n){e.Widget.prototype["_"+t]=function(i,r,a){"string"==typeof r&&(r={effect:r});var s,o=r?r===!0||"number"==typeof r?n:r.effect||n:t;r=r||{},"number"==typeof r&&(r={duration:r}),s=!e.isEmptyObject(r),r.complete=a,r.delay&&i.delay(r.delay),s&&e.effects&&e.effects.effect[o]?i[t](r):o!==t&&i[o]?i[o](r.duration,r.easing,a):i.queue(function(n){e(this)[t](),a&&a.call(i[0]),n()})}})}(i)}});
>>>>>>> master
