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
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	__webpack_require__(13);
	module.exports = __webpack_require__(306);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = jQuery;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	// require('bootstrap');
	'use strict';
	
	var Utils = __webpack_require__(5);
	var Urls = __webpack_require__(4);
	__webpack_require__(9);
	var mdetect = __webpack_require__(12);
	var MobileEsp = mdetect.MobileEsp;
	
	//Login form Initialization
	function LoginInitialize() {
	    // alert(MobileEsp.DetectTierIphone())
	    // alert(MobileEsp.DetectTierRichCss())
	    // alert(MobileEsp.DetectOperaMobila())
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
	        country = $('#id_country'),
	        all_signup = $('.signup_form');
	
	    var phone_data, password_data;
	
	    //if (no_phone) {
	    intelInput();
	    //}
	
	    var isOperaMini = !!window['operamini'];
	    if (!isOperaMini) {
	        Utils.parsleyfyForm(signup_form);
	        if (all_signup.length > 0) {
	            Utils.parsleyfyForm(all_signup);
	        }
	    }
	    console.log(no_phone);
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
	        var errorNode = $('.signupErrorMessage');
	        errorNode.empty();
	        for (var key in error) {
	            errorNode.append('<p class="text-danger">' + error[key][0] + '</p>');
	        }
	    };
	    if (!isOperaMini) {
	        //debugger;
	        Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback, null, '#submit_btn');
	        if (all_signup.length > 0) {
	            Utils.formSubmission(all_signup, beforSubmit, successCallback, errorCallback, null);
	        }
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
	            modal_subtitle.html('<a href="' + Urls['account_signup']() + '">Join</a> Tuteria to connect with quality tutors and clients');
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
	    //var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all']());
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#nav-skill-input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls['skill_only_view'](datum.slug);
	        } else {
	
	            $('form[name=\'search-form\']').submit();
	        }
	    });
	    var search_form = $('form[name="search-form"]');
	
	    search_form.parsley();
	}
	function MobileAutocompleteSearch() {
	    //var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = Utils.getBloodhoundInstance('name', Urls['ajax_skills_all']());
	    BH.initialize();
	    Utils.ApplyTypeaheadToInput($('#mobile_skill_input'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls['skill_only_view'](datum.slug);
	        } else {
	
	            $('#mobile-nav-search-form').submit();
	        }
	    });
	    Utils.ApplyTypeaheadToInput($('#mobile_search_form22'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls['skill_only_view'](datum.slug);
	        } else {
	
	            $(this).closest('form').submit();
	        }
	    });
	    $('#mobile-nav-search-form').parsley();
	}
	function InternalNavMobile() {
	    $('.subnav.hide-print .subnav-item').on('click', function (e) {
	        $('.subnav.hide-print .subnav-list').toggleClass('is-open');
	    });
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
	        $.each($('.login_nav2'), function (key, val) {
	            $(val).attr('href', '#').attr('data-toggle', 'modal').attr('data-target', '#authModal');
	        });
	    }
	
	    $('.top-search input').blur();
	
	    AutocompleteSearch();
	    MobileAutocompleteSearch();
	    AuthModal();
	    InternalNavMobile();
	    SignUp(phone, sign_incallback);
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Bloodhound;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Urls;

/***/ },
/* 5 */
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
	            } }
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
	            },
	            validate_word_count: {
	                fn: function fn(value, req) {
	                    var new_val = value.replace(/\s+/g, ' ');
	                    return new_val.length >= parseInt(req);
	                },
	                priority: 101
	            }
	        },
	        i18n: {
	            en: {
	                valid_phone: 'Phone number is invalid. should be of the form +234 703 520 9576',
	                same_phone_number: 'Phone number is not the same',
	                schedule_time: 'End time must be greater than start time with at least an hour',
	                no_link: 'Links are not allowed.',
	                validate_time: 'Pls input a time in this format 6:00 AM',
	                no_email: 'Email addresses are not allowed in this field',
	                validate_word_count: 'Please input at least 300 words. No unnecessary spaces please.' }
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
	    //var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all']());
	
	    BH.initialize();
	
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        callback();
	    });
	}
	function GenericSkillSearchAutocomplete(input, form) {
	    //var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all']());
	
	    BH.initialize();
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(' in ')[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls['skill_only_view'](datum.slug);
	        } else {
	
	            form.submit();
	        }
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
	            //types: ['address'],
	            types: [],
	            componentRestrictions: {
	                country: 'ng'
	            }
	        };
	        console.log(options);
	        var autocomplete = new google.maps.places.Autocomplete(input[0], options);
	        console.log(autocomplete);
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
	function appendCSRFTOKEN() {
	    $.ajaxSetup({
	        beforeSend: function beforeSend(xhr, settings) {
	            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	                xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
	            }
	        }
	    });
	}
	function hideAddMore(fset, parentNode, count) {
	    var c = count || 2;
	    if (fset.length >= c) {
	        parentNode.addClass('hide');
	    }
	    fset.find('.delete-row').addClass('hide');
	}
	
	function GetLongitudeAndLatitudeAndSubmit(filterform, location_field, longitude_field, latitude_field, state_field, callback) {
	    var cb = callback || function () {};
	
	    filterform.on('submit', function (e) {
	        e.preventDefault();
	        var that = this;
	        var s = '';
	        if (state_field) {
	            s = state_field.val() ? state_field.val() : '';
	        }
	        var full_address = location_field.val() + ' ' + s;
	        console.log(full_address);
	        var geocoder = cb();
	
	        if (geocoder) {
	            geocoder.geocode({ 'address': full_address }, function (results, status) {
	                if (status == window.google.maps.GeocoderStatus.OK) {
	                    console.log(results);
	                    if (results.length > 0) {
	                        var address = full_address;
	                        var latitude = results[0].geometry.location.lat();
	                        var longitude = results[0].geometry.location.lng();
	                        location_field.val(address);
	                        latitude_field.val(latitude.toFixed(5));
	                        longitude_field.val(longitude.toFixed(5));
	                    }
	                    $(that).unbind('submit').submit();
	                } else {
	                    var field = location_field.val();
	                    if (field === '') {
	                        longitude_field.val('');
	                        latitude_field.val('');
	                    }
	                    $(that).unbind('submit').submit();
	                }
	            });
	        } else {
	            $(that).unbind('submit').submit();
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
	exports.GetLongitudeAndLatitudeAndSubmit = GetLongitudeAndLatitudeAndSubmit;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 6 */,
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./af": 211,
		"./af.js": 211,
		"./ar": 212,
		"./ar-ma": 213,
		"./ar-ma.js": 213,
		"./ar-sa": 214,
		"./ar-sa.js": 214,
		"./ar-tn": 215,
		"./ar-tn.js": 215,
		"./ar.js": 212,
		"./az": 216,
		"./az.js": 216,
		"./be": 217,
		"./be.js": 217,
		"./bg": 218,
		"./bg.js": 218,
		"./bn": 219,
		"./bn.js": 219,
		"./bo": 220,
		"./bo.js": 220,
		"./br": 221,
		"./br.js": 221,
		"./bs": 222,
		"./bs.js": 222,
		"./ca": 223,
		"./ca.js": 223,
		"./cs": 224,
		"./cs.js": 224,
		"./cv": 225,
		"./cv.js": 225,
		"./cy": 226,
		"./cy.js": 226,
		"./da": 227,
		"./da.js": 227,
		"./de": 228,
		"./de-at": 229,
		"./de-at.js": 229,
		"./de.js": 228,
		"./el": 230,
		"./el.js": 230,
		"./en-au": 231,
		"./en-au.js": 231,
		"./en-ca": 232,
		"./en-ca.js": 232,
		"./en-gb": 233,
		"./en-gb.js": 233,
		"./eo": 234,
		"./eo.js": 234,
		"./es": 235,
		"./es.js": 235,
		"./et": 236,
		"./et.js": 236,
		"./eu": 237,
		"./eu.js": 237,
		"./fa": 238,
		"./fa.js": 238,
		"./fi": 239,
		"./fi.js": 239,
		"./fo": 240,
		"./fo.js": 240,
		"./fr": 241,
		"./fr-ca": 242,
		"./fr-ca.js": 242,
		"./fr.js": 241,
		"./fy": 243,
		"./fy.js": 243,
		"./gl": 244,
		"./gl.js": 244,
		"./he": 245,
		"./he.js": 245,
		"./hi": 246,
		"./hi.js": 246,
		"./hr": 247,
		"./hr.js": 247,
		"./hu": 248,
		"./hu.js": 248,
		"./hy-am": 249,
		"./hy-am.js": 249,
		"./id": 250,
		"./id.js": 250,
		"./is": 251,
		"./is.js": 251,
		"./it": 252,
		"./it.js": 252,
		"./ja": 253,
		"./ja.js": 253,
		"./jv": 254,
		"./jv.js": 254,
		"./ka": 255,
		"./ka.js": 255,
		"./km": 256,
		"./km.js": 256,
		"./ko": 257,
		"./ko.js": 257,
		"./lb": 258,
		"./lb.js": 258,
		"./lt": 259,
		"./lt.js": 259,
		"./lv": 260,
		"./lv.js": 260,
		"./me": 261,
		"./me.js": 261,
		"./mk": 262,
		"./mk.js": 262,
		"./ml": 263,
		"./ml.js": 263,
		"./mr": 264,
		"./mr.js": 264,
		"./ms-my": 265,
		"./ms-my.js": 265,
		"./my": 266,
		"./my.js": 266,
		"./nb": 267,
		"./nb.js": 267,
		"./ne": 268,
		"./ne.js": 268,
		"./nl": 269,
		"./nl.js": 269,
		"./nn": 270,
		"./nn.js": 270,
		"./pl": 271,
		"./pl.js": 271,
		"./pt": 272,
		"./pt-br": 273,
		"./pt-br.js": 273,
		"./pt.js": 272,
		"./ro": 274,
		"./ro.js": 274,
		"./ru": 275,
		"./ru.js": 275,
		"./si": 276,
		"./si.js": 276,
		"./sk": 277,
		"./sk.js": 277,
		"./sl": 278,
		"./sl.js": 278,
		"./sq": 279,
		"./sq.js": 279,
		"./sr": 280,
		"./sr-cyrl": 281,
		"./sr-cyrl.js": 281,
		"./sr.js": 280,
		"./sv": 282,
		"./sv.js": 282,
		"./ta": 283,
		"./ta.js": 283,
		"./th": 284,
		"./th.js": 284,
		"./tl-ph": 285,
		"./tl-ph.js": 285,
		"./tr": 286,
		"./tr.js": 286,
		"./tzm": 287,
		"./tzm-latn": 288,
		"./tzm-latn.js": 288,
		"./tzm.js": 287,
		"./uk": 289,
		"./uk.js": 289,
		"./uz": 290,
		"./uz.js": 290,
		"./vi": 291,
		"./vi.js": 291,
		"./zh-cn": 292,
		"./zh-cn.js": 292,
		"./zh-tw": 293,
		"./zh-tw.js": 293
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 7;


/***/ },
/* 8 */,
/* 9 */
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
/* 10 */,
/* 11 */,
/* 12 */
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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	__webpack_require__(14);
	
	$(function () {
		$('#mobile_navigation .search').click(function () {
			$('#mobile_skill_input').focus();
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 14 */
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
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */
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

/***/ },
/* 23 */
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
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */,
/* 188 */,
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */,
/* 193 */,
/* 194 */,
/* 195 */,
/* 196 */,
/* 197 */,
/* 198 */,
/* 199 */,
/* 200 */,
/* 201 */,
/* 202 */,
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*
		Base.js, version 1.1a
		Copyright 2006-2010, Dean Edwards
		License: http://www.opensource.org/licenses/mit-license.php
	*/
	
	var Base = function() {
		// dummy
	};
	
	Base.extend = function(_instance, _static) { // subclass
		
		"use strict";
		
		var extend = Base.prototype.extend;
		
		// build the prototype
		Base._prototyping = true;
		
		var proto = new this();
		
		extend.call(proto, _instance);
		
		proto.base = function() {
		// call this method from any other method to invoke that method's ancestor
		};
	
		delete Base._prototyping;
		
		// create the wrapper for the constructor function
		//var constructor = proto.constructor.valueOf(); //-dean
		var constructor = proto.constructor;
		var klass = proto.constructor = function() {
			if (!Base._prototyping) {
				if (this._constructing || this.constructor == klass) { // instantiation
					this._constructing = true;
					constructor.apply(this, arguments);
					delete this._constructing;
				} else if (arguments[0] !== null) { // casting
					return (arguments[0].extend || extend).call(arguments[0], proto);
				}
			}
		};
		
		// build the class interface
		klass.ancestor = this;
		klass.extend = this.extend;
		klass.forEach = this.forEach;
		klass.implement = this.implement;
		klass.prototype = proto;
		klass.toString = this.toString;
		klass.valueOf = function(type) {
			//return (type == "object") ? klass : constructor; //-dean
			return (type == "object") ? klass : constructor.valueOf();
		};
		extend.call(klass, _static);
		// class initialisation
		if (typeof klass.init == "function") klass.init();
		return klass;
	};
	
	Base.prototype = {	
		extend: function(source, value) {
			if (arguments.length > 1) { // extending with a name/value pair
				var ancestor = this[source];
				if (ancestor && (typeof value == "function") && // overriding a method?
					// the valueOf() comparison is to avoid circular references
					(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
					/\bbase\b/.test(value)) {
					// get the underlying method
					var method = value.valueOf();
					// override
					value = function() {
						var previous = this.base || Base.prototype.base;
						this.base = ancestor;
						var returnValue = method.apply(this, arguments);
						this.base = previous;
						return returnValue;
					};
					// point to the underlying method
					value.valueOf = function(type) {
						return (type == "object") ? value : method;
					};
					value.toString = Base.toString;
				}
				this[source] = value;
			} else if (source) { // extending with an object literal
				var extend = Base.prototype.extend;
				// if this object has a customised extend method then use it
				if (!Base._prototyping && typeof this != "function") {
					extend = this.extend || extend;
				}
				var proto = {toSource: null};
				// do the "toString" and other methods manually
				var hidden = ["constructor", "toString", "valueOf"];
				// if we are prototyping then include the constructor
				var i = Base._prototyping ? 0 : 1;
				while (key = hidden[i++]) {
					if (source[key] != proto[key]) {
						extend.call(this, key, source[key]);
	
					}
				}
				// copy each of the source object's properties to this object
				for (var key in source) {
					if (!proto[key]) extend.call(this, key, source[key]);
				}
			}
			return this;
		}
	};
	
	// initialise
	Base = Base.extend({
		constructor: function() {
			this.extend(arguments[0]);
		}
	}, {
		ancestor: Object,
		version: "1.1",
		
		forEach: function(object, block, context) {
			for (var key in object) {
				if (this.prototype[key] === undefined) {
					block.call(context, object[key], key, object);
				}
			}
		},
			
		implement: function() {
			for (var i = 0; i < arguments.length; i++) {
				if (typeof arguments[i] == "function") {
					// if it's a function, call it
					arguments[i](this.prototype);
				} else {
					// add the interface using the extend method
					this.prototype.extend(arguments[i]);
				}
			}
			return this;
		},
		
		toString: function() {
			return String(this.valueOf());
		}
	});
	/*jshint smarttabs:true */
	
	var FlipClock;
		
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * FlipFlock Helper
		 *
		 * @param  object  A jQuery object or CSS select
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock = function(obj, digit, options) {
			if(digit instanceof Object && digit instanceof Date === false) {
				options = digit;
				digit = 0;
			}
	
			return new FlipClock.Factory(obj, digit, options);
		};
	
		/**
		 * The global FlipClock.Lang object
		 */
	
		FlipClock.Lang = {};
		
		/**
		 * The Base FlipClock class is used to extend all other FlipFlock
		 * classes. It handles the callbacks and the basic setters/getters
		 *	
		 * @param 	object  An object of the default properties
		 * @param 	object  An object of properties to override the default	
		 */
	
		FlipClock.Base = Base.extend({
			
			/**
			 * Build Date
			 */
			 
			buildDate: '2014-12-12',
			
			/**
			 * Version
			 */
			 
			version: '0.7.7',
			
			/**
			 * Sets the default options
			 *
			 * @param	object 	The default options
			 * @param	object 	The override options
			 */
			 
			constructor: function(_default, options) {
				if(typeof _default !== "object") {
					_default = {};
				}
				if(typeof options !== "object") {
					options = {};
				}
				this.setOptions($.extend(true, {}, _default, options));
			},
			
			/**
			 * Delegates the callback to the defined method
			 *
			 * @param	object 	The default options
			 * @param	object 	The override options
			 */
			 
			callback: function(method) {
			 	if(typeof method === "function") {
					var args = [];
									
					for(var x = 1; x <= arguments.length; x++) {
						if(arguments[x]) {
							args.push(arguments[x]);
						}
					}
					
					method.apply(this, args);
				}
			},
			 
			/**
			 * Log a string into the console if it exists
			 *
			 * @param 	string 	The name of the option
			 * @return	mixed
			 */		
			 
			log: function(str) {
				if(window.console && console.log) {
					console.log(str);
				}
			},
			 
			/**
			 * Get an single option value. Returns false if option does not exist
			 *
			 * @param 	string 	The name of the option
			 * @return	mixed
			 */		
			 
			getOption: function(index) {
				if(this[index]) {
					return this[index];
				}
				return false;
			},
			
			/**
			 * Get all options
			 *
			 * @return	bool
			 */		
			 
			getOptions: function() {
				return this;
			},
			
			/**
			 * Set a single option value
			 *
			 * @param 	string 	The name of the option
			 * @param 	mixed 	The value of the option
			 */		
			 
			setOption: function(index, value) {
				this[index] = value;
			},
			
			/**
			 * Set a multiple options by passing a JSON object
			 *
			 * @param 	object 	The object with the options
			 * @param 	mixed 	The value of the option
			 */		
			
			setOptions: function(options) {
				for(var key in options) {
		  			if(typeof options[key] !== "undefined") {
			  			this.setOption(key, options[key]);
			  		}
			  	}
			}
			
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock Face class is the base class in which to extend
		 * all other FlockClock.Face classes.
		 *
		 * @param 	object  The parent FlipClock.Factory object
		 * @param 	object  An object of properties to override the default	
		 */
		 
		FlipClock.Face = FlipClock.Base.extend({
			
			/**
			 * Sets whether or not the clock should start upon instantiation
			 */
			 
			autoStart: true,
	
			/**
			 * An array of jQuery objects used for the dividers (the colons)
			 */
			 
			dividers: [],
	
			/**
			 * An array of FlipClock.List objects
			 */		
			 
			factory: false,
			
			/**
			 * An array of FlipClock.List objects
			 */		
			 
			lists: [],
	
			/**
			 * Constructor
			 *
			 * @param 	object  The parent FlipClock.Factory object
			 * @param 	object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.dividers = [];
				this.lists = [];
				this.base(options);
				this.factory = factory;
			},
			
			/**
			 * Build the clock face
			 */
			 
			build: function() {
				if(this.autoStart) {
					this.start();
				}
			},
			
			/**
			 * Creates a jQuery object used for the digit divider
			 *
			 * @param	mixed 	The divider label text
			 * @param	mixed	Set true to exclude the dots in the divider. 
			 *					If not set, is false.
			 */
			 
			createDivider: function(label, css, excludeDots) {
				if(typeof css == "boolean" || !css) {
					excludeDots = css;
					css = label;
				}
	
				var dots = [
					'<span class="'+this.factory.classes.dot+' top"></span>',
					'<span class="'+this.factory.classes.dot+' bottom"></span>'
				].join('');
	
				if(excludeDots) {
					dots = '';	
				}
	
				label = this.factory.localize(label);
	
				var html = [
					'<span class="'+this.factory.classes.divider+' '+(css ? css : '').toLowerCase()+'">',
						'<span class="'+this.factory.classes.label+'">'+(label ? label : '')+'</span>',
						dots,
					'</span>'
				];	
				
				var $html = $(html.join(''));
	
				this.dividers.push($html);
	
				return $html;
			},
			
			/**
			 * Creates a FlipClock.List object and appends it to the DOM
			 *
			 * @param	mixed 	The digit to select in the list
			 * @param	object  An object to override the default properties
			 */
			 
			createList: function(digit, options) {
				if(typeof digit === "object") {
					options = digit;
					digit = 0;
				}
	
				var obj = new FlipClock.List(this.factory, digit, options);
			
				this.lists.push(obj);
	
				return obj;
			},
			
			/**
			 * Triggers when the clock is reset
			 */
	
			reset: function() {
				this.factory.time = new FlipClock.Time(
					this.factory, 
					this.factory.original ? Math.round(this.factory.original) : 0,
					{
						minimumDigits: this.factory.minimumDigits
					}
				);
	
				this.flip(this.factory.original, false);
			},
	
			/**
			 * Append a newly created list to the clock
			 */
	
			appendDigitToClock: function(obj) {
				obj.$el.append(false);
			},
	
			/**
			 * Add a digit to the clock face
			 */
			 
			addDigit: function(digit) {
				var obj = this.createList(digit, {
					classes: {
						active: this.factory.classes.active,
						before: this.factory.classes.before,
						flip: this.factory.classes.flip
					}
				});
	
				this.appendDigitToClock(obj);
			},
			
			/**
			 * Triggers when the clock is started
			 */
			 
			start: function() {},
			
			/**
			 * Triggers when the time on the clock stops
			 */
			 
			stop: function() {},
			
			/**
			 * Auto increments/decrements the value of the clock face
			 */
			 
			autoIncrement: function() {
				if(!this.factory.countdown) {
					this.increment();
				}
				else {
					this.decrement();
				}
			},
	
			/**
			 * Increments the value of the clock face
			 */
			 
			increment: function() {
				this.factory.time.addSecond();
			},
	
			/**
			 * Decrements the value of the clock face
			 */
	
			decrement: function() {
				if(this.factory.time.getTimeSeconds() == 0) {
		        	this.factory.stop()
				}
				else {
					this.factory.time.subSecond();
				}
			},
				
			/**
			 * Triggers when the numbers on the clock flip
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				var t = this;
	
				$.each(time, function(i, digit) {
					var list = t.lists[i];
	
					if(list) {
						if(!doNotAddPlayClass && digit != list.digit) {
							list.play();	
						}
	
						list.select(digit);
					}	
					else {
						t.addDigit(digit);
					}
				});
			}
						
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock Factory class is used to build the clock and manage
		 * all the public methods.
		 *
		 * @param 	object  A jQuery object or CSS selector used to fetch
		 				    the wrapping DOM nodes
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.Factory = FlipClock.Base.extend({
			
			/**
			 * The clock's animation rate.
			 * 
			 * Note, currently this property doesn't do anything.
			 * This property is here to be used in the future to
			 * programmaticaly set the clock's animation speed
			 */		
	
			animationRate: 1000,
	
			/**
			 * Auto start the clock on page load (True|False)
			 */	
			 
			autoStart: true,
			
			/**
			 * The callback methods
			 */		
			 
			callbacks: {
				destroy: false,
				create: false,
				init: false,
				interval: false,
				start: false,
				stop: false,
				reset: false
			},
			
			/**
			 * The CSS classes
			 */		
			 
			classes: {
				active: 'flip-clock-active',
				before: 'flip-clock-before',
				divider: 'flip-clock-divider',
				dot: 'flip-clock-dot',
				label: 'flip-clock-label',
				flip: 'flip',
				play: 'play',
				wrapper: 'flip-clock-wrapper'
			},
			
			/**
			 * The name of the clock face class in use
			 */	
			 
			clockFace: 'HourlyCounter',
			 
			/**
			 * The name of the clock face class in use
			 */	
			 
			countdown: false,
			 
			/**
			 * The name of the default clock face class to use if the defined
			 * clockFace variable is not a valid FlipClock.Face object
			 */	
			 
			defaultClockFace: 'HourlyCounter',
			 
			/**
			 * The default language
			 */	
			 
			defaultLanguage: 'english',
			 
			/**
			 * The jQuery object
			 */		
			 
			$el: false,
	
			/**
			 * The FlipClock.Face object
			 */	
			 
			face: true,
			 
			/**
			 * The language object after it has been loaded
			 */	
			 
			lang: false,
			 
			/**
			 * The language being used to display labels (string)
			 */	
			 
			language: 'english',
			 
			/**
			 * The minimum digits the clock must have
			 */		
	
			minimumDigits: 0,
	
			/**
			 * The original starting value of the clock. Used for the reset method.
			 */		
			 
			original: false,
			
			/**
			 * Is the clock running? (True|False)
			 */		
			 
			running: false,
			
			/**
			 * The FlipClock.Time object
			 */		
			 
			time: false,
			
			/**
			 * The FlipClock.Timer object
			 */		
			 
			timer: false,
			
			/**
			 * The jQuery object (depcrecated)
			 */		
			 
			$wrapper: false,
			
			/**
			 * Constructor
			 *
			 * @param   object  The wrapping jQuery object
			 * @param	object  Number of seconds used to start the clock
			 * @param	object 	An object override options
			 */
			 
			constructor: function(obj, digit, options) {
	
				if(!options) {
					options = {};
				}
	
				this.lists = [];
				this.running = false;
				this.base(options);	
	
				this.$el = $(obj).addClass(this.classes.wrapper);
	
				// Depcrated support of the $wrapper property.
				this.$wrapper = this.$el;
	
				this.original = (digit instanceof Date) ? digit : (digit ? Math.round(digit) : 0);
	
				this.time = new FlipClock.Time(this, this.original, {
					minimumDigits: this.minimumDigits,
					animationRate: this.animationRate 
				});
	
				this.timer = new FlipClock.Timer(this, options);
	
				this.loadLanguage(this.language);
				
				this.loadClockFace(this.clockFace, options);
	
				if(this.autoStart) {
					this.start();
				}
	
			},
			
			/**
			 * Load the FlipClock.Face object
			 *
			 * @param	object  The name of the FlickClock.Face class
			 * @param	object 	An object override options
			 */
			 
			loadClockFace: function(name, options) {	
				var face, suffix = 'Face', hasStopped = false;
				
				name = name.ucfirst()+suffix;
	
				if(this.face.stop) {
					this.stop();
					hasStopped = true;
				}
	
				this.$el.html('');
	
				this.time.minimumDigits = this.minimumDigits;
				
				if(FlipClock[name]) {
					face = new FlipClock[name](this, options);
				}
				else {
					face = new FlipClock[this.defaultClockFace+suffix](this, options);
				}
				
				face.build();
	
				this.face = face
	
				if(hasStopped) {
					this.start();
				}
				
				return this.face;
			},
					
			/**
			 * Load the FlipClock.Lang object
			 *
			 * @param	object  The name of the language to load
			 */
			 
			loadLanguage: function(name) {	
				var lang;
				
				if(FlipClock.Lang[name.ucfirst()]) {
					lang = FlipClock.Lang[name.ucfirst()];
				}
				else if(FlipClock.Lang[name]) {
					lang = FlipClock.Lang[name];
				}
				else {
					lang = FlipClock.Lang[this.defaultLanguage];
				}
				
				return this.lang = lang;
			},
						
			/**
			 * Localize strings into various languages
			 *
			 * @param	string  The index of the localized string
			 * @param	object  Optionally pass a lang object
			 */
	
			localize: function(index, obj) {
				var lang = this.lang;
	
				if(!index) {
					return null;
				}
	
				var lindex = index.toLowerCase();
	
				if(typeof obj == "object") {
					lang = obj;
				}
	
				if(lang && lang[lindex]) {
					return lang[lindex];
				}
	
				return index;
			},
			 
	
			/**
			 * Starts the clock
			 */
			 
			start: function(callback) {
				var t = this;
	
				if(!t.running && (!t.countdown || t.countdown && t.time.time > 0)) {
					t.face.start(t.time);
					t.timer.start(function() {
						t.flip();
						
						if(typeof callback === "function") {
							callback();
						}	
					});
				}
				else {
					t.log('Trying to start timer when countdown already at 0');
				}
			},
			
			/**
			 * Stops the clock
			 */
			 
			stop: function(callback) {
				this.face.stop();
				this.timer.stop(callback);
				
				for(var x in this.lists) {
					if (this.lists.hasOwnProperty(x)) {
						this.lists[x].stop();
					}
				}	
			},
			
			/**
			 * Reset the clock
			 */
			 
			reset: function(callback) {
				this.timer.reset(callback);
				this.face.reset();
			},
			
			/**
			 * Sets the clock time
			 */
			 
			setTime: function(time) {
				this.time.time = time;
				this.flip(true);		
			},
			
			/**
			 * Get the clock time
			 *
			 * @return  object  Returns a FlipClock.Time object
			 */
			 
			getTime: function(time) {
				return this.time;		
			},
			
			/**
			 * Changes the increment of time to up or down (add/sub)
			 */
			 
			setCountdown: function(value) {
				var running = this.running;
				
				this.countdown = value ? true : false;
					
				if(running) {
					this.stop();
					this.start();
				}
			},
			
			/**
			 * Flip the digits on the clock
			 *
			 * @param  array  An array of digits	 
			 */
			flip: function(doNotAddPlayClass) {	
				this.face.flip(false, doNotAddPlayClass);
			}
			
		});
			
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock List class is used to build the list used to create 
		 * the card flip effect. This object fascilates selecting the correct
		 * node by passing a specific digit.
		 *
		 * @param 	object  A FlipClock.Factory object
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 *				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.List = FlipClock.Base.extend({
			
			/**
			 * The digit (0-9)
			 */		
			 
			digit: 0,
			
			/**
			 * The CSS classes
			 */		
			 
			classes: {
				active: 'flip-clock-active',
				before: 'flip-clock-before',
				flip: 'flip'	
			},
					
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * The jQuery object
			 */		
			 
			$el: false,
	
			/**
			 * The jQuery object (deprecated)
			 */		
			 
			$obj: false,
			
			/**
			 * The items in the list
			 */		
			 
			items: [],
			
			/**
			 * The last digit
			 */		
			 
			lastDigit: 0,
				
			/**
			 * Constructor
			 *
			 * @param  object  A FlipClock.Factory object
			 * @param  int     An integer use to select the correct digit
			 * @param  object  An object to override the default properties	 
			 */
			 
			constructor: function(factory, digit, options) {
				this.factory = factory;
				this.digit = digit;
				this.lastDigit = digit;
				this.$el = this.createList();
				
				// Depcrated support of the $obj property.
				this.$obj = this.$el;
	
				if(digit > 0) {
					this.select(digit);
				}
	
				this.factory.$el.append(this.$el);
			},
			
			/**
			 * Select the digit in the list
			 *
			 * @param  int  A digit 0-9	 
			 */
			 
			select: function(digit) {
				if(typeof digit === "undefined") {
					digit = this.digit;
				}
				else {
					this.digit = digit;
				}
	
				if(this.digit != this.lastDigit) {
					var $delete = this.$el.find('.'+this.classes.before).removeClass(this.classes.before);
	
					this.$el.find('.'+this.classes.active).removeClass(this.classes.active)
														  .addClass(this.classes.before);
	
					this.appendListItem(this.classes.active, this.digit);
	
					$delete.remove();
	
					this.lastDigit = this.digit;
				}	
			},
			
			/**
			 * Adds the play class to the DOM object
			 */
			 		
			play: function() {
				this.$el.addClass(this.factory.classes.play);
			},
			
			/**
			 * Removes the play class to the DOM object 
			 */
			 
			stop: function() {
				var t = this;
	
				setTimeout(function() {
					t.$el.removeClass(t.factory.classes.play);
				}, this.factory.timer.interval);
			},
			
			/**
			 * Creates the list item HTML and returns as a string 
			 */
			 
			createListItem: function(css, value) {
				return [
					'<li class="'+(css ? css : '')+'">',
						'<a href="#">',
							'<div class="up">',
								'<div class="shadow"></div>',
								'<div class="inn">'+(value ? value : '')+'</div>',
							'</div>',
							'<div class="down">',
								'<div class="shadow"></div>',
								'<div class="inn">'+(value ? value : '')+'</div>',
							'</div>',
						'</a>',
					'</li>'
				].join('');
			},
	
			/**
			 * Append the list item to the parent DOM node 
			 */
	
			appendListItem: function(css, value) {
				var html = this.createListItem(css, value);
	
				this.$el.append(html);
			},
	
			/**
			 * Create the list of digits and appends it to the DOM object 
			 */
			 
			createList: function() {
	
				var lastDigit = this.getPrevDigit() ? this.getPrevDigit() : this.digit;
	
				var html = $([
					'<ul class="'+this.classes.flip+' '+(this.factory.running ? this.factory.classes.play : '')+'">',
						this.createListItem(this.classes.before, lastDigit),
						this.createListItem(this.classes.active, this.digit),
					'</ul>'
				].join(''));
						
				return html;
			},
	
			getNextDigit: function() {
				return this.digit == 9 ? 0 : this.digit + 1;
			},
	
			getPrevDigit: function() {
				return this.digit == 0 ? 9 : this.digit - 1;
			}
	
		});
		
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * Capitalize the first letter in a string
		 *
		 * @return string
		 */
		 
		String.prototype.ucfirst = function() {
			return this.substr(0, 1).toUpperCase() + this.substr(1);
		};
		
		/**
		 * jQuery helper method
		 *
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		$.fn.FlipClock = function(digit, options) {	
			return new FlipClock($(this), digit, options);
		};
		
		/**
		 * jQuery helper method
		 *
		 * @param  int     An integer used to start the clock (no. seconds)
		 * @param  object  An object of properties to override the default	
		 */
		 
		$.fn.flipClock = function(digit, options) {
			return $.fn.FlipClock(digit, options);
		};
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
				
		/**
		 * The FlipClock Time class is used to manage all the time 
		 * calculations.
		 *
		 * @param 	object  A FlipClock.Factory object
		 * @param 	mixed   This is the digit used to set the clock. If an 
		 *				    object is passed, 0 will be used.	
		 * @param 	object  An object of properties to override the default	
		 */
		 	
		FlipClock.Time = FlipClock.Base.extend({
			
			/**
			 * The time (in seconds) or a date object
			 */		
			 
			time: 0,
			
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * The minimum number of digits the clock face must have
			 */		
			 
			minimumDigits: 0,
	
			/**
			 * Constructor
			 *
			 * @param  object  A FlipClock.Factory object
			 * @param  int     An integer use to select the correct digit
			 * @param  object  An object to override the default properties	 
			 */
			 
			constructor: function(factory, time, options) {
				if(typeof options != "object") {
					options = {};
				}
	
				if(!options.minimumDigits) {
					options.minimumDigits = factory.minimumDigits;
				}
	
				this.base(options);
				this.factory = factory;
	
				if(time) {
					this.time = time;
				}
			},
	
			/**
			 * Convert a string or integer to an array of digits
			 *
			 * @param   mixed  String or Integer of digits	 
			 * @return  array  An array of digits 
			 */
			 
			convertDigitsToArray: function(str) {
				var data = [];
				
				str = str.toString();
				
				for(var x = 0;x < str.length; x++) {
					if(str[x].match(/^\d*$/g)) {
						data.push(str[x]);	
					}
				}
				
				return data;
			},
			
			/**
			 * Get a specific digit from the time integer
			 *
			 * @param   int    The specific digit to select from the time	 
			 * @return  mixed  Returns FALSE if no digit is found, otherwise
			 *				   the method returns the defined digit	 
			 */
			 
			digit: function(i) {
				var timeStr = this.toString();
				var length  = timeStr.length;
				
				if(timeStr[length - i])	 {
					return timeStr[length - i];
				}
				
				return false;
			},
	
			/**
			 * Formats any array of digits into a valid array of digits
			 *
			 * @param   mixed  An array of digits	 
			 * @return  array  An array of digits 
			 */
			 
			digitize: function(obj) {
				var data = [];
	
				$.each(obj, function(i, value) {
					value = value.toString();
					
					if(value.length == 1) {
						value = '0'+value;
					}
					
					for(var x = 0; x < value.length; x++) {
						data.push(value.charAt(x));
					}				
				});
	
				if(data.length > this.minimumDigits) {
					this.minimumDigits = data.length;
				}
				
				if(this.minimumDigits > data.length) {
					for(var x = data.length; x < this.minimumDigits; x++) {
						data.unshift('0');
					}
				}
	
				return data;
			},
			
			/**
			 * Gets a new Date object for the current time
			 *
			 * @return  array  Returns a Date object
			 */
	
			getDateObject: function() {
				if(this.time instanceof Date) {
					return this.time;
				}
	
				return new Date((new Date()).getTime() + this.getTimeSeconds() * 1000);
			},
			
			/**
			 * Gets a digitized daily counter
			 *
			 * @return  object  Returns a digitized object
			 */
	
			getDayCounter: function(includeSeconds) {
				var digits = [
					this.getDays(),
					this.getHours(true),
					this.getMinutes(true)
				];
	
				if(includeSeconds) {
					digits.push(this.getSeconds(true));
				}
	
				return this.digitize(digits);
			},
	
			/**
			 * Gets number of days
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getDays: function(mod) {
				var days = this.getTimeSeconds() / 60 / 60 / 24;
				
				if(mod) {
					days = days % 7;
				}
				
				return Math.floor(days);
			},
			
			/**
			 * Gets an hourly breakdown
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getHourCounter: function() {
				var obj = this.digitize([
					this.getHours(),
					this.getMinutes(true),
					this.getSeconds(true)
				]);
				
				return obj;
			},
			
			/**
			 * Gets an hourly breakdown
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getHourly: function() {
				return this.getHourCounter();
			},
			
			/**
			 * Gets number of hours
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getHours: function(mod) {
				var hours = this.getTimeSeconds() / 60 / 60;
				
				if(mod) {
					hours = hours % 24;	
				}
				
				return Math.floor(hours);
			},
			
			/**
			 * Gets the twenty-four hour time
			 *
			 * @return  object  returns a digitized object
			 */
			 
			getMilitaryTime: function(date, showSeconds) {
				if(typeof showSeconds === "undefined") {
					showSeconds = true;
				}
	
				if(!date) {
					date = this.getDateObject();
				}
	
				var data  = [
					date.getHours(),
					date.getMinutes()			
				];
	
				if(showSeconds === true) {
					data.push(date.getSeconds());
				}
	
				return this.digitize(data);
			},
					
			/**
			 * Gets number of minutes
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getMinutes: function(mod) {
				var minutes = this.getTimeSeconds() / 60;
				
				if(mod) {
					minutes = minutes % 60;
				}
				
				return Math.floor(minutes);
			},
			
			/**
			 * Gets a minute breakdown
			 */
			 
			getMinuteCounter: function() {
				var obj = this.digitize([
					this.getMinutes(),
					this.getSeconds(true)
				]);
	
				return obj;
			},
			
			/**
			 * Gets time count in seconds regardless of if targetting date or not.
			 *
			 * @return  int   Returns a floored integer
			 */
			 
			getTimeSeconds: function(date) {
				if(!date) {
					date = new Date();
				}
	
				if (this.time instanceof Date) {
					if (this.factory.countdown) {
						return Math.max(this.time.getTime()/1000 - date.getTime()/1000,0);
					} else {
						return date.getTime()/1000 - this.time.getTime()/1000 ;
					}
				} else {
					return this.time;
				}
			},
			
			/**
			 * Gets the current twelve hour time
			 *
			 * @return  object  Returns a digitized object
			 */
			 
			getTime: function(date, showSeconds) {
				if(typeof showSeconds === "undefined") {
					showSeconds = true;
				}
	
				if(!date) {
					date = this.getDateObject();
				}
	
				console.log(date);
	
				
				var hours = date.getHours();
				var merid = hours > 12 ? 'PM' : 'AM';
				var data   = [
					hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
					date.getMinutes()			
				];
	
				if(showSeconds === true) {
					data.push(date.getSeconds());
				}
	
				return this.digitize(data);
			},
			
			/**
			 * Gets number of seconds
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a ceiled integer
			 */
			 
			getSeconds: function(mod) {
				var seconds = this.getTimeSeconds();
				
				if(mod) {
					if(seconds == 60) {
						seconds = 0;
					}
					else {
						seconds = seconds % 60;
					}
				}
				
				return Math.ceil(seconds);
			},
	
			/**
			 * Gets number of weeks
			 *
			 * @param   bool  Should perform a modulus? If not sent, then no.
			 * @return  int   Retuns a floored integer
			 */
			 
			getWeeks: function(mod) {
				var weeks = this.getTimeSeconds() / 60 / 60 / 24 / 7;
				
				if(mod) {
					weeks = weeks % 52;
				}
				
				return Math.floor(weeks);
			},
			
			/**
			 * Removes a specific number of leading zeros from the array.
			 * This method prevents you from removing too many digits, even
			 * if you try.
			 *
			 * @param   int    Total number of digits to remove 
			 * @return  array  An array of digits 
			 */
			 
			removeLeadingZeros: function(totalDigits, digits) {
				var total    = 0;
				var newArray = [];
				
				$.each(digits, function(i, digit) {
					if(i < totalDigits) {
						total += parseInt(digits[i], 10);
					}
					else {
						newArray.push(digits[i]);
					}
				});
				
				if(total === 0) {
					return newArray;
				}
				
				return digits;
			},
	
			/**
			 * Adds X second to the current time
			 */
	
			addSeconds: function(x) {
				if(this.time instanceof Date) {
					this.time.setSeconds(this.time.getSeconds() + x);
				}
				else {
					this.time += x;
				}
			},
	
			/**
			 * Adds 1 second to the current time
			 */
	
			addSecond: function() {
				this.addSeconds(1);
			},
	
			/**
			 * Substracts X seconds from the current time
			 */
	
			subSeconds: function(x) {
				if(this.time instanceof Date) {
					this.time.setSeconds(this.time.getSeconds() - x);
				}
				else {
					this.time -= x;
				}
			},
	
			/**
			 * Substracts 1 second from the current time
			 */
	
			subSecond: function() {
				this.subSeconds(1);
			},
			
			/**
			 * Converts the object to a human readable string
			 */
			 
			toString: function() {
				return this.getTimeSeconds().toString();
			}
			
			/*
			getYears: function() {
				return Math.floor(this.time / 60 / 60 / 24 / 7 / 52);
			},
			
			getDecades: function() {
				return Math.floor(this.getWeeks() / 10);
			}*/
		});
		
	}(jQuery));
	
	/*jshint smarttabs:true */
	
	/**
	 * FlipClock.js
	 *
	 * @author     Justin Kimbrell
	 * @copyright  2013 - Objective HTML, LLC
	 * @licesnse   http://www.opensource.org/licenses/mit-license.php
	 */
		
	(function($) {
		
		"use strict";
		
		/**
		 * The FlipClock.Timer object managers the JS timers
		 *
		 * @param	object  The parent FlipClock.Factory object
		 * @param	object  Override the default options
		 */
		
		FlipClock.Timer = FlipClock.Base.extend({
			
			/**
			 * Callbacks
			 */		
			 
			callbacks: {
				destroy: false,
				create: false,
				init: false,
				interval: false,
				start: false,
				stop: false,
				reset: false
			},
			
			/**
			 * FlipClock timer count (how many intervals have passed)
			 */		
			 
			count: 0,
			
			/**
			 * The parent FlipClock.Factory object
			 */		
			 
			factory: false,
			
			/**
			 * Timer interval (1 second by default)
			 */		
			 
			interval: 1000,
	
			/**
			 * The rate of the animation in milliseconds (not currently in use)
			 */		
			 
			animationRate: 1000,
					
			/**
			 * Constructor
			 *
			 * @return	void
			 */		
			 
			constructor: function(factory, options) {
				this.base(options);
				this.factory = factory;
				this.callback(this.callbacks.init);	
				this.callback(this.callbacks.create);
			},
			
			/**
			 * This method gets the elapsed the time as an interger
			 *
			 * @return	void
			 */		
			 
			getElapsed: function() {
				return this.count * this.interval;
			},
			
			/**
			 * This method gets the elapsed the time as a Date object
			 *
			 * @return	void
			 */		
			 
			getElapsedTime: function() {
				return new Date(this.time + this.getElapsed());
			},
			
			/**
			 * This method is resets the timer
			 *
			 * @param 	callback  This method resets the timer back to 0
			 * @return	void
			 */		
			 
			reset: function(callback) {
				clearInterval(this.timer);
				this.count = 0;
				this._setInterval(callback);			
				this.callback(this.callbacks.reset);
			},
			
			/**
			 * This method is starts the timer
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			start: function(callback) {		
				this.factory.running = true;
				this._createTimer(callback);
				this.callback(this.callbacks.start);
			},
			
			/**
			 * This method is stops the timer
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			stop: function(callback) {
				this.factory.running = false;
				this._clearInterval(callback);
				this.callback(this.callbacks.stop);
				this.callback(callback);
			},
			
			/**
			 * Clear the timer interval
			 *
			 * @return	void
			 */		
			 
			_clearInterval: function() {
				clearInterval(this.timer);
			},
			
			/**
			 * Create the timer object
			 *
			 * @param 	callback  A function that is called once the timer is created
			 * @return	void
			 */		
			 
			_createTimer: function(callback) {
				this._setInterval(callback);		
			},
			
			/**
			 * Destroy the timer object
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 	
			_destroyTimer: function(callback) {
				this._clearInterval();			
				this.timer = false;
				this.callback(callback);
				this.callback(this.callbacks.destroy);
			},
			
			/**
			 * This method is called each time the timer interval is ran
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			_interval: function(callback) {
				this.callback(this.callbacks.interval);
				this.callback(callback);
				this.count++;
			},
			
			/**
			 * This sets the timer interval
			 *
			 * @param 	callback  A function that is called once the timer is destroyed
			 * @return	void
			 */		
			 
			_setInterval: function(callback) {
				var t = this;
		
				t._interval(callback);
	
				t.timer = setInterval(function() {		
					t._interval(callback);
				}, this.interval);
			}
				
		});
		
	}(jQuery));
	
	(function($) {
		
		/**
		 * Twenty-Four Hour Clock Face
		 *
		 * This class will generate a twenty-four our clock for FlipClock.js
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.TwentyFourHourClockFace = FlipClock.Face.extend({
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face
			 *
			 * @param  object  Pass the time that should be used to display on the clock.	
			 */
			 
			build: function(time) {
				var t        = this;
				var children = this.factory.$el.find('ul');
	
				if(!this.factory.time.time) {
					this.factory.original = new Date();
	
					this.factory.time = new FlipClock.Time(this.factory, this.factory.original);
				}
	
				var time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
				
				this.createDivider();
				this.createDivider();
	
				$(this.dividers[0]).insertBefore(this.lists[this.lists.length - 2].$el);
				$(this.dividers[1]).insertBefore(this.lists[this.lists.length - 4].$el);
				
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				this.autoIncrement();
				
				time = time ? time : this.factory.time.getMilitaryTime(false, this.showSeconds);
				
				this.base(time, doNotAddPlayClass);	
			}
					
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Counter Clock Face
		 *
		 * This class will generate a generice flip counter. The timer has been
		 * disabled. clock.increment() and clock.decrement() have been added.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.CounterFace = FlipClock.Face.extend({
			
			/**
			 * Tells the counter clock face if it should auto-increment
			 */
	
			shouldAutoIncrement: false,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
	
				if(typeof options != "object") {
					options = {};
				}
	
				factory.autoStart = options.autoStart ? true : false;
	
				if(options.autoStart) {
					this.shouldAutoIncrement = true;
				}
	
				factory.increment = function() {
					factory.countdown = false;
					factory.setTime(factory.getTime().getTimeSeconds() + 1);
				};
	
				factory.decrement = function() {
					factory.countdown = true;
					var time = factory.getTime().getTimeSeconds();
					if(time > 0) {
						factory.setTime(time - 1);
					}
				};
	
				factory.setValue = function(digits) {
					factory.setTime(digits);
				};
	
				factory.setCounter = function(digits) {
					factory.setTime(digits);
				};
	
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face	
			 */
			 
			build: function() {
				var t        = this;
				var children = this.factory.$el.find('ul');
				var time 	 = this.factory.getTime().digitize([this.factory.getTime().time]);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						var list = t.createList(digit);
	
						list.select(digit);
					});
				
				}
	
				$.each(this.lists, function(i, list) {
					list.play();
				});
	
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {			
				if(this.shouldAutoIncrement) {
					this.autoIncrement();
				}
	
				if(!time) {		
					time = this.factory.getTime().digitize([this.factory.getTime().time]);
				}
	
				this.base(time, doNotAddPlayClass);
			},
	
			/**
			 * Reset the clock face
			 */
	
			reset: function() {
				this.factory.time = new FlipClock.Time(
					this.factory, 
					this.factory.original ? Math.round(this.factory.original) : 0
				);
	
				this.flip();
			}
		});
		
	}(jQuery));
	(function($) {
	
		/**
		 * Daily Counter Clock Face
		 *
		 * This class will generate a daily counter for FlipClock.js. A
		 * daily counter will track days, hours, minutes, and seconds. If
		 * the number of available digits is exceeded in the count, a new
		 * digit will be created.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default
		 */
	
		FlipClock.DailyCounterFace = FlipClock.Face.extend({
	
			showSeconds: true,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default
			 */
	
			constructor: function(factory, options) {
				this.base(factory, options);
			},
	
			/**
			 * Build the clock face
			 */
	
			build: function(time) {
				var t = this;
				var children = this.factory.$el.find('ul');
				var offset = 0;
	
				time = time ? time : this.factory.time.getDayCounter(this.showSeconds);
	
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
	
				if(this.showSeconds) {
					$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
				}
				else
				{
					offset = 2;
				}
	
				$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4 + offset].$el);
				$(this.createDivider('Hours')).insertBefore(this.lists[this.lists.length - 6 + offset].$el);
				$(this.createDivider('Days', true)).insertBefore(this.lists[0].$el);
	
				this.base();
			},
	
			/**
			 * Flip the clock face
			 */
	
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getDayCounter(this.showSeconds);
				}
	
				this.autoIncrement();
	
				this.base(time, doNotAddPlayClass);
			}
	
		});
	
	}(jQuery));
	(function($) {
				
		/**
		 * Hourly Counter Clock Face
		 *
		 * This class will generate an hourly counter for FlipClock.js. An
		 * hour counter will track hours, minutes, and seconds. If number of
		 * available digits is exceeded in the count, a new digit will be 
		 * created.
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.HourlyCounterFace = FlipClock.Face.extend({
				
			// clearExcessDigits: true,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
			
			/**
			 * Build the clock face
			 */
			
			build: function(excludeHours, time) {
				var t = this;
				var children = this.factory.$el.find('ul');
				
				time = time ? time : this.factory.time.getHourCounter();
				
				if(time.length > children.length) {
					$.each(time, function(i, digit) {
						t.createList(digit);
					});
				}
				
				$(this.createDivider('Seconds')).insertBefore(this.lists[this.lists.length - 2].$el);
				$(this.createDivider('Minutes')).insertBefore(this.lists[this.lists.length - 4].$el);
				
				if(!excludeHours) {
					$(this.createDivider('Hours', true)).insertBefore(this.lists[0].$el);
				}
				
				this.base();
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getHourCounter();
				}	
	
				this.autoIncrement();
			
				this.base(time, doNotAddPlayClass);
			},
	
			/**
			 * Append a newly created list to the clock
			 */
	
			appendDigitToClock: function(obj) {
				this.base(obj);
	
				this.dividers[0].insertAfter(this.dividers[0].next());
			}
			
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Minute Counter Clock Face
		 *
		 * This class will generate a minute counter for FlipClock.js. A
		 * minute counter will track minutes and seconds. If an hour is 
		 * reached, the counter will reset back to 0. (4 digits max)
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.MinuteCounterFace = FlipClock.HourlyCounterFace.extend({
	
			clearExcessDigits: false,
	
			/**
			 * Constructor
			 *
			 * @param  object  The parent FlipClock.Factory object
			 * @param  object  An object of properties to override the default	
			 */
			 
			constructor: function(factory, options) {
				this.base(factory, options);
			},
			
			/**
			 * Build the clock face	
			 */
			 
			build: function() {
				this.base(true, this.factory.time.getMinuteCounter());
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {
				if(!time) {
					time = this.factory.time.getMinuteCounter();
				}
	
				this.base(time, doNotAddPlayClass);
			}
	
		});
		
	}(jQuery));
	(function($) {
			
		/**
		 * Twelve Hour Clock Face
		 *
		 * This class will generate a twelve hour clock for FlipClock.js
		 *
		 * @param  object  The parent FlipClock.Factory object
		 * @param  object  An object of properties to override the default	
		 */
		 
		FlipClock.TwelveHourClockFace = FlipClock.TwentyFourHourClockFace.extend({
			
			/**
			 * The meridium jQuery DOM object
			 */
			 
			meridium: false,
			
			/**
			 * The meridium text as string for easy access
			 */
			 
			meridiumText: 'AM',
						
			/**
			 * Build the clock face
			 *
			 * @param  object  Pass the time that should be used to display on the clock.	
			 */
			 
			build: function() {
				var t = this;
	
				var time = this.factory.time.getTime(false, this.showSeconds);
	
				this.base(time);			
				this.meridiumText = this.getMeridium();			
				this.meridium = $([
					'<ul class="flip-clock-meridium">',
						'<li>',
							'<a href="#">'+this.meridiumText+'</a>',
						'</li>',
					'</ul>'
				].join(''));
							
				this.meridium.insertAfter(this.lists[this.lists.length-1].$el);
			},
			
			/**
			 * Flip the clock face
			 */
			 
			flip: function(time, doNotAddPlayClass) {			
				if(this.meridiumText != this.getMeridium()) {
					this.meridiumText = this.getMeridium();
					this.meridium.find('a').html(this.meridiumText);	
				}
				this.base(this.factory.time.getTime(false, this.showSeconds), doNotAddPlayClass);	
			},
			
			/**
			 * Get the current meridium
			 *
			 * @return  string  Returns the meridium (AM|PM)
			 */
			 
			getMeridium: function() {
				return new Date().getHours() >= 12 ? 'PM' : 'AM';
			},
			
			/**
			 * Is it currently in the post-medirium?
			 *
			 * @return  bool  Returns true or false
			 */
			 
			isPM: function() {
				return this.getMeridium() == 'PM' ? true : false;
			},
	
			/**
			 * Is it currently before the post-medirium?
			 *
			 * @return  bool  Returns true or false
			 */
			 
			isAM: function() {
				return this.getMeridium() == 'AM' ? true : false;
			}
					
		});
		
	}(jQuery));
	(function($) {
	
	    /**
	     * FlipClock Arabic Language Pack
	     *
	     * This class will be used to translate tokens into the Arabic language.
	     *
	     */
	
	    FlipClock.Lang.Arabic = {
	
	      'years'   : 'سنوات',
	      'months'  : 'شهور',
	      'days'    : 'أيام',
	      'hours'   : 'ساعات',
	      'minutes' : 'دقائق',
	      'seconds' : 'ثواني'
	
	    };
	
	    /* Create various aliases for convenience */
	
	    FlipClock.Lang['ar']      = FlipClock.Lang.Arabic;
	    FlipClock.Lang['ar-ar']   = FlipClock.Lang.Arabic;
	    FlipClock.Lang['arabic']  = FlipClock.Lang.Arabic;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Danish Language Pack
		 *
		 * This class will used to translate tokens into the Danish language.
		 *	
		 */
		 
		FlipClock.Lang.Danish = {
			
			'years'   : 'År',
			'months'  : 'Måneder',
			'days'    : 'Dage',
			'hours'   : 'Timer',
			'minutes' : 'Minutter',
			'seconds' : 'Sekunder'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['da']     = FlipClock.Lang.Danish;
		FlipClock.Lang['da-dk']  = FlipClock.Lang.Danish;
		FlipClock.Lang['danish'] = FlipClock.Lang.Danish;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock German Language Pack
		 *
		 * This class will used to translate tokens into the German language.
		 *	
		 */
		 
		FlipClock.Lang.German = {
			
			'years'   : 'Jahre',
			'months'  : 'Monate',
			'days'    : 'Tage',
			'hours'   : 'Stunden',
			'minutes' : 'Minuten',
			'seconds' : 'Sekunden'	
	 
		};
		
		/* Create various aliases for convenience */
	 
		FlipClock.Lang['de']     = FlipClock.Lang.German;
		FlipClock.Lang['de-de']  = FlipClock.Lang.German;
		FlipClock.Lang['german'] = FlipClock.Lang.German;
	 
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock English Language Pack
		 *
		 * This class will used to translate tokens into the English language.
		 *	
		 */
		 
		FlipClock.Lang.English = {
			
			'years'   : 'Years',
			'months'  : 'Months',
			'days'    : 'Days',
			'hours'   : 'Hours',
			'minutes' : 'Minutes',
			'seconds' : 'Seconds'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['en']      = FlipClock.Lang.English;
		FlipClock.Lang['en-us']   = FlipClock.Lang.English;
		FlipClock.Lang['english'] = FlipClock.Lang.English;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Spanish Language Pack
		 *
		 * This class will used to translate tokens into the Spanish language.
		 *	
		 */
		 
		FlipClock.Lang.Spanish = {
			
			'years'   : 'A&#241;os',
			'months'  : 'Meses',
			'days'    : 'D&#205;as',
			'hours'   : 'Horas',
			'minutes' : 'Minutos',
			'seconds' : 'Segundo'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['es']      = FlipClock.Lang.Spanish;
		FlipClock.Lang['es-es']   = FlipClock.Lang.Spanish;
		FlipClock.Lang['spanish'] = FlipClock.Lang.Spanish;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Finnish Language Pack
		 *
		 * This class will used to translate tokens into the Finnish language.
		 *	
		 */
		 
		FlipClock.Lang.Finnish = {
			
			'years'   : 'Vuotta',
			'months'  : 'Kuukautta',
			'days'    : 'Päivää',
			'hours'   : 'Tuntia',
			'minutes' : 'Minuuttia',
			'seconds' : 'Sekuntia'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['fi']      = FlipClock.Lang.Finnish;
		FlipClock.Lang['fi-fi']   = FlipClock.Lang.Finnish;
		FlipClock.Lang['finnish'] = FlipClock.Lang.Finnish;
	
	}(jQuery));
	
	(function($) {
	
	  /**
	   * FlipClock Canadian French Language Pack
	   *
	   * This class will used to translate tokens into the Canadian French language.
	   *
	   */
	
	  FlipClock.Lang.French = {
	
	    'years'   : 'Ans',
	    'months'  : 'Mois',
	    'days'    : 'Jours',
	    'hours'   : 'Heures',
	    'minutes' : 'Minutes',
	    'seconds' : 'Secondes'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['fr']      = FlipClock.Lang.French;
	  FlipClock.Lang['fr-ca']   = FlipClock.Lang.French;
	  FlipClock.Lang['french']  = FlipClock.Lang.French;
	
	}(jQuery));
	
	(function($) {
			
		/**
		 * FlipClock Italian Language Pack
		 *
		 * This class will used to translate tokens into the Italian language.
		 *	
		 */
		 
		FlipClock.Lang.Italian = {
			
			'years'   : 'Anni',
			'months'  : 'Mesi',
			'days'    : 'Giorni',
			'hours'   : 'Ore',
			'minutes' : 'Minuti',
			'seconds' : 'Secondi'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['it']      = FlipClock.Lang.Italian;
		FlipClock.Lang['it-it']   = FlipClock.Lang.Italian;
		FlipClock.Lang['italian'] = FlipClock.Lang.Italian;
		
	}(jQuery));
	
	(function($) {
	
	  /**
	   * FlipClock Latvian Language Pack
	   *
	   * This class will used to translate tokens into the Latvian language.
	   *
	   */
	
	  FlipClock.Lang.Latvian = {
	
	    'years'   : 'Gadi',
	    'months'  : 'Mēneši',
	    'days'    : 'Dienas',
	    'hours'   : 'Stundas',
	    'minutes' : 'Minūtes',
	    'seconds' : 'Sekundes'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['lv']      = FlipClock.Lang.Latvian;
	  FlipClock.Lang['lv-lv']   = FlipClock.Lang.Latvian;
	  FlipClock.Lang['latvian'] = FlipClock.Lang.Latvian;
	
	}(jQuery));
	(function($) {
	
	    /**
	     * FlipClock Dutch Language Pack
	     *
	     * This class will used to translate tokens into the Dutch language.
	     */
	
	    FlipClock.Lang.Dutch = {
	
	        'years'   : 'Jaren',
	        'months'  : 'Maanden',
	        'days'    : 'Dagen',
	        'hours'   : 'Uren',
	        'minutes' : 'Minuten',
	        'seconds' : 'Seconden'
	
	    };
	
	    /* Create various aliases for convenience */
	
	    FlipClock.Lang['nl']      = FlipClock.Lang.Dutch;
	    FlipClock.Lang['nl-be']   = FlipClock.Lang.Dutch;
	    FlipClock.Lang['dutch']   = FlipClock.Lang.Dutch;
	
	}(jQuery));
	
	(function($) {
	
		/**
		 * FlipClock Norwegian-Bokmål Language Pack
		 *
		 * This class will used to translate tokens into the Norwegian language.
		 *	
		 */
	
		FlipClock.Lang.Norwegian = {
	
			'years'   : 'År',
			'months'  : 'Måneder',
			'days'    : 'Dager',
			'hours'   : 'Timer',
			'minutes' : 'Minutter',
			'seconds' : 'Sekunder'	
	
		};
	
		/* Create various aliases for convenience */
	
		FlipClock.Lang['no']      = FlipClock.Lang.Norwegian;
		FlipClock.Lang['nb']      = FlipClock.Lang.Norwegian;
		FlipClock.Lang['no-nb']   = FlipClock.Lang.Norwegian;
		FlipClock.Lang['norwegian'] = FlipClock.Lang.Norwegian;
	
	}(jQuery));
	
	(function($) {
	
		/**
		 * FlipClock Portuguese Language Pack
		 *
		 * This class will used to translate tokens into the Portuguese language.
		 *
		 */
	
		FlipClock.Lang.Portuguese = {
	
			'years'   : 'Anos',
			'months'  : 'Meses',
			'days'    : 'Dias',
			'hours'   : 'Horas',
			'minutes' : 'Minutos',
			'seconds' : 'Segundos'
	
		};
	
		/* Create various aliases for convenience */
	
		FlipClock.Lang['pt']         = FlipClock.Lang.Portuguese;
		FlipClock.Lang['pt-br']      = FlipClock.Lang.Portuguese;
		FlipClock.Lang['portuguese'] = FlipClock.Lang.Portuguese;
	
	}(jQuery));
	(function($) {
	
	  /**
	   * FlipClock Russian Language Pack
	   *
	   * This class will used to translate tokens into the Russian language.
	   *
	   */
	
	  FlipClock.Lang.Russian = {
	
	    'years'   : 'лет',
	    'months'  : 'месяцев',
	    'days'    : 'дней',
	    'hours'   : 'часов',
	    'minutes' : 'минут',
	    'seconds' : 'секунд'
	
	  };
	
	  /* Create various aliases for convenience */
	
	  FlipClock.Lang['ru']      = FlipClock.Lang.Russian;
	  FlipClock.Lang['ru-ru']   = FlipClock.Lang.Russian;
	  FlipClock.Lang['russian']  = FlipClock.Lang.Russian;
	
	}(jQuery));
	(function($) {
			
		/**
		 * FlipClock Swedish Language Pack
		 *
		 * This class will used to translate tokens into the Swedish language.
		 *	
		 */
		 
		FlipClock.Lang.Swedish = {
			
			'years'   : 'År',
			'months'  : 'Månader',
			'days'    : 'Dagar',
			'hours'   : 'Timmar',
			'minutes' : 'Minuter',
			'seconds' : 'Sekunder'	
	
		};
		
		/* Create various aliases for convenience */
	
		FlipClock.Lang['sv']      = FlipClock.Lang.Swedish;
		FlipClock.Lang['sv-se']   = FlipClock.Lang.Swedish;
		FlipClock.Lang['swedish'] = FlipClock.Lang.Swedish;
	
	}(jQuery));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 208 */,
/* 209 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {//! moment.js
	//! version : 2.10.3
	//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
	//! license : MIT
	//! momentjs.com
	
	(function (global, factory) {
	    true ? module.exports = factory() :
	    typeof define === 'function' && define.amd ? define(factory) :
	    global.moment = factory()
	}(this, function () { 'use strict';
	
	    var hookCallback;
	
	    function utils_hooks__hooks () {
	        return hookCallback.apply(null, arguments);
	    }
	
	    // This is done to register the method called with moment()
	    // without creating circular dependencies.
	    function setHookCallback (callback) {
	        hookCallback = callback;
	    }
	
	    function isArray(input) {
	        return Object.prototype.toString.call(input) === '[object Array]';
	    }
	
	    function isDate(input) {
	        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
	    }
	
	    function map(arr, fn) {
	        var res = [], i;
	        for (i = 0; i < arr.length; ++i) {
	            res.push(fn(arr[i], i));
	        }
	        return res;
	    }
	
	    function hasOwnProp(a, b) {
	        return Object.prototype.hasOwnProperty.call(a, b);
	    }
	
	    function extend(a, b) {
	        for (var i in b) {
	            if (hasOwnProp(b, i)) {
	                a[i] = b[i];
	            }
	        }
	
	        if (hasOwnProp(b, 'toString')) {
	            a.toString = b.toString;
	        }
	
	        if (hasOwnProp(b, 'valueOf')) {
	            a.valueOf = b.valueOf;
	        }
	
	        return a;
	    }
	
	    function create_utc__createUTC (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, true).utc();
	    }
	
	    function defaultParsingFlags() {
	        // We need to deep clone this object.
	        return {
	            empty           : false,
	            unusedTokens    : [],
	            unusedInput     : [],
	            overflow        : -2,
	            charsLeftOver   : 0,
	            nullInput       : false,
	            invalidMonth    : null,
	            invalidFormat   : false,
	            userInvalidated : false,
	            iso             : false
	        };
	    }
	
	    function getParsingFlags(m) {
	        if (m._pf == null) {
	            m._pf = defaultParsingFlags();
	        }
	        return m._pf;
	    }
	
	    function valid__isValid(m) {
	        if (m._isValid == null) {
	            var flags = getParsingFlags(m);
	            m._isValid = !isNaN(m._d.getTime()) &&
	                flags.overflow < 0 &&
	                !flags.empty &&
	                !flags.invalidMonth &&
	                !flags.nullInput &&
	                !flags.invalidFormat &&
	                !flags.userInvalidated;
	
	            if (m._strict) {
	                m._isValid = m._isValid &&
	                    flags.charsLeftOver === 0 &&
	                    flags.unusedTokens.length === 0 &&
	                    flags.bigHour === undefined;
	            }
	        }
	        return m._isValid;
	    }
	
	    function valid__createInvalid (flags) {
	        var m = create_utc__createUTC(NaN);
	        if (flags != null) {
	            extend(getParsingFlags(m), flags);
	        }
	        else {
	            getParsingFlags(m).userInvalidated = true;
	        }
	
	        return m;
	    }
	
	    var momentProperties = utils_hooks__hooks.momentProperties = [];
	
	    function copyConfig(to, from) {
	        var i, prop, val;
	
	        if (typeof from._isAMomentObject !== 'undefined') {
	            to._isAMomentObject = from._isAMomentObject;
	        }
	        if (typeof from._i !== 'undefined') {
	            to._i = from._i;
	        }
	        if (typeof from._f !== 'undefined') {
	            to._f = from._f;
	        }
	        if (typeof from._l !== 'undefined') {
	            to._l = from._l;
	        }
	        if (typeof from._strict !== 'undefined') {
	            to._strict = from._strict;
	        }
	        if (typeof from._tzm !== 'undefined') {
	            to._tzm = from._tzm;
	        }
	        if (typeof from._isUTC !== 'undefined') {
	            to._isUTC = from._isUTC;
	        }
	        if (typeof from._offset !== 'undefined') {
	            to._offset = from._offset;
	        }
	        if (typeof from._pf !== 'undefined') {
	            to._pf = getParsingFlags(from);
	        }
	        if (typeof from._locale !== 'undefined') {
	            to._locale = from._locale;
	        }
	
	        if (momentProperties.length > 0) {
	            for (i in momentProperties) {
	                prop = momentProperties[i];
	                val = from[prop];
	                if (typeof val !== 'undefined') {
	                    to[prop] = val;
	                }
	            }
	        }
	
	        return to;
	    }
	
	    var updateInProgress = false;
	
	    // Moment prototype object
	    function Moment(config) {
	        copyConfig(this, config);
	        this._d = new Date(+config._d);
	        // Prevent infinite loop in case updateOffset creates new moment
	        // objects.
	        if (updateInProgress === false) {
	            updateInProgress = true;
	            utils_hooks__hooks.updateOffset(this);
	            updateInProgress = false;
	        }
	    }
	
	    function isMoment (obj) {
	        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
	    }
	
	    function toInt(argumentForCoercion) {
	        var coercedNumber = +argumentForCoercion,
	            value = 0;
	
	        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
	            if (coercedNumber >= 0) {
	                value = Math.floor(coercedNumber);
	            } else {
	                value = Math.ceil(coercedNumber);
	            }
	        }
	
	        return value;
	    }
	
	    function compareArrays(array1, array2, dontConvert) {
	        var len = Math.min(array1.length, array2.length),
	            lengthDiff = Math.abs(array1.length - array2.length),
	            diffs = 0,
	            i;
	        for (i = 0; i < len; i++) {
	            if ((dontConvert && array1[i] !== array2[i]) ||
	                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
	                diffs++;
	            }
	        }
	        return diffs + lengthDiff;
	    }
	
	    function Locale() {
	    }
	
	    var locales = {};
	    var globalLocale;
	
	    function normalizeLocale(key) {
	        return key ? key.toLowerCase().replace('_', '-') : key;
	    }
	
	    // pick the locale from the array
	    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
	    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
	    function chooseLocale(names) {
	        var i = 0, j, next, locale, split;
	
	        while (i < names.length) {
	            split = normalizeLocale(names[i]).split('-');
	            j = split.length;
	            next = normalizeLocale(names[i + 1]);
	            next = next ? next.split('-') : null;
	            while (j > 0) {
	                locale = loadLocale(split.slice(0, j).join('-'));
	                if (locale) {
	                    return locale;
	                }
	                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
	                    //the next array item is better than a shallower substring of this one
	                    break;
	                }
	                j--;
	            }
	            i++;
	        }
	        return null;
	    }
	
	    function loadLocale(name) {
	        var oldLocale = null;
	        // TODO: Find a better way to register and load all the locales in Node
	        if (!locales[name] && typeof module !== 'undefined' &&
	                module && module.exports) {
	            try {
	                oldLocale = globalLocale._abbr;
	                __webpack_require__(7)("./" + name);
	                // because defineLocale currently also sets the global locale, we
	                // want to undo that for lazy loaded locales
	                locale_locales__getSetGlobalLocale(oldLocale);
	            } catch (e) { }
	        }
	        return locales[name];
	    }
	
	    // This function will load locale and then set the global locale.  If
	    // no arguments are passed in, it will simply return the current global
	    // locale key.
	    function locale_locales__getSetGlobalLocale (key, values) {
	        var data;
	        if (key) {
	            if (typeof values === 'undefined') {
	                data = locale_locales__getLocale(key);
	            }
	            else {
	                data = defineLocale(key, values);
	            }
	
	            if (data) {
	                // moment.duration._locale = moment._locale = data;
	                globalLocale = data;
	            }
	        }
	
	        return globalLocale._abbr;
	    }
	
	    function defineLocale (name, values) {
	        if (values !== null) {
	            values.abbr = name;
	            if (!locales[name]) {
	                locales[name] = new Locale();
	            }
	            locales[name].set(values);
	
	            // backwards compat for now: also set the locale
	            locale_locales__getSetGlobalLocale(name);
	
	            return locales[name];
	        } else {
	            // useful for testing
	            delete locales[name];
	            return null;
	        }
	    }
	
	    // returns locale data
	    function locale_locales__getLocale (key) {
	        var locale;
	
	        if (key && key._locale && key._locale._abbr) {
	            key = key._locale._abbr;
	        }
	
	        if (!key) {
	            return globalLocale;
	        }
	
	        if (!isArray(key)) {
	            //short-circuit everything else
	            locale = loadLocale(key);
	            if (locale) {
	                return locale;
	            }
	            key = [key];
	        }
	
	        return chooseLocale(key);
	    }
	
	    var aliases = {};
	
	    function addUnitAlias (unit, shorthand) {
	        var lowerCase = unit.toLowerCase();
	        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
	    }
	
	    function normalizeUnits(units) {
	        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
	    }
	
	    function normalizeObjectUnits(inputObject) {
	        var normalizedInput = {},
	            normalizedProp,
	            prop;
	
	        for (prop in inputObject) {
	            if (hasOwnProp(inputObject, prop)) {
	                normalizedProp = normalizeUnits(prop);
	                if (normalizedProp) {
	                    normalizedInput[normalizedProp] = inputObject[prop];
	                }
	            }
	        }
	
	        return normalizedInput;
	    }
	
	    function makeGetSet (unit, keepTime) {
	        return function (value) {
	            if (value != null) {
	                get_set__set(this, unit, value);
	                utils_hooks__hooks.updateOffset(this, keepTime);
	                return this;
	            } else {
	                return get_set__get(this, unit);
	            }
	        };
	    }
	
	    function get_set__get (mom, unit) {
	        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
	    }
	
	    function get_set__set (mom, unit, value) {
	        return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
	    }
	
	    // MOMENTS
	
	    function getSet (units, value) {
	        var unit;
	        if (typeof units === 'object') {
	            for (unit in units) {
	                this.set(unit, units[unit]);
	            }
	        } else {
	            units = normalizeUnits(units);
	            if (typeof this[units] === 'function') {
	                return this[units](value);
	            }
	        }
	        return this;
	    }
	
	    function zeroFill(number, targetLength, forceSign) {
	        var output = '' + Math.abs(number),
	            sign = number >= 0;
	
	        while (output.length < targetLength) {
	            output = '0' + output;
	        }
	        return (sign ? (forceSign ? '+' : '') : '-') + output;
	    }
	
	    var formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|x|X|zz?|ZZ?|.)/g;
	
	    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
	
	    var formatFunctions = {};
	
	    var formatTokenFunctions = {};
	
	    // token:    'M'
	    // padded:   ['MM', 2]
	    // ordinal:  'Mo'
	    // callback: function () { this.month() + 1 }
	    function addFormatToken (token, padded, ordinal, callback) {
	        var func = callback;
	        if (typeof callback === 'string') {
	            func = function () {
	                return this[callback]();
	            };
	        }
	        if (token) {
	            formatTokenFunctions[token] = func;
	        }
	        if (padded) {
	            formatTokenFunctions[padded[0]] = function () {
	                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
	            };
	        }
	        if (ordinal) {
	            formatTokenFunctions[ordinal] = function () {
	                return this.localeData().ordinal(func.apply(this, arguments), token);
	            };
	        }
	    }
	
	    function removeFormattingTokens(input) {
	        if (input.match(/\[[\s\S]/)) {
	            return input.replace(/^\[|\]$/g, '');
	        }
	        return input.replace(/\\/g, '');
	    }
	
	    function makeFormatFunction(format) {
	        var array = format.match(formattingTokens), i, length;
	
	        for (i = 0, length = array.length; i < length; i++) {
	            if (formatTokenFunctions[array[i]]) {
	                array[i] = formatTokenFunctions[array[i]];
	            } else {
	                array[i] = removeFormattingTokens(array[i]);
	            }
	        }
	
	        return function (mom) {
	            var output = '';
	            for (i = 0; i < length; i++) {
	                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
	            }
	            return output;
	        };
	    }
	
	    // format date using native date object
	    function formatMoment(m, format) {
	        if (!m.isValid()) {
	            return m.localeData().invalidDate();
	        }
	
	        format = expandFormat(format, m.localeData());
	
	        if (!formatFunctions[format]) {
	            formatFunctions[format] = makeFormatFunction(format);
	        }
	
	        return formatFunctions[format](m);
	    }
	
	    function expandFormat(format, locale) {
	        var i = 5;
	
	        function replaceLongDateFormatTokens(input) {
	            return locale.longDateFormat(input) || input;
	        }
	
	        localFormattingTokens.lastIndex = 0;
	        while (i >= 0 && localFormattingTokens.test(format)) {
	            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
	            localFormattingTokens.lastIndex = 0;
	            i -= 1;
	        }
	
	        return format;
	    }
	
	    var match1         = /\d/;            //       0 - 9
	    var match2         = /\d\d/;          //      00 - 99
	    var match3         = /\d{3}/;         //     000 - 999
	    var match4         = /\d{4}/;         //    0000 - 9999
	    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
	    var match1to2      = /\d\d?/;         //       0 - 99
	    var match1to3      = /\d{1,3}/;       //       0 - 999
	    var match1to4      = /\d{1,4}/;       //       0 - 9999
	    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999
	
	    var matchUnsigned  = /\d+/;           //       0 - inf
	    var matchSigned    = /[+-]?\d+/;      //    -inf - inf
	
	    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
	
	    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123
	
	    // any word (or two) characters or numbers including two/three word month in arabic.
	    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
	
	    var regexes = {};
	
	    function addRegexToken (token, regex, strictRegex) {
	        regexes[token] = typeof regex === 'function' ? regex : function (isStrict) {
	            return (isStrict && strictRegex) ? strictRegex : regex;
	        };
	    }
	
	    function getParseRegexForToken (token, config) {
	        if (!hasOwnProp(regexes, token)) {
	            return new RegExp(unescapeFormat(token));
	        }
	
	        return regexes[token](config._strict, config._locale);
	    }
	
	    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
	    function unescapeFormat(s) {
	        return s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
	            return p1 || p2 || p3 || p4;
	        }).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	    }
	
	    var tokens = {};
	
	    function addParseToken (token, callback) {
	        var i, func = callback;
	        if (typeof token === 'string') {
	            token = [token];
	        }
	        if (typeof callback === 'number') {
	            func = function (input, array) {
	                array[callback] = toInt(input);
	            };
	        }
	        for (i = 0; i < token.length; i++) {
	            tokens[token[i]] = func;
	        }
	    }
	
	    function addWeekParseToken (token, callback) {
	        addParseToken(token, function (input, array, config, token) {
	            config._w = config._w || {};
	            callback(input, config._w, config, token);
	        });
	    }
	
	    function addTimeToArrayFromToken(token, input, config) {
	        if (input != null && hasOwnProp(tokens, token)) {
	            tokens[token](input, config._a, config, token);
	        }
	    }
	
	    var YEAR = 0;
	    var MONTH = 1;
	    var DATE = 2;
	    var HOUR = 3;
	    var MINUTE = 4;
	    var SECOND = 5;
	    var MILLISECOND = 6;
	
	    function daysInMonth(year, month) {
	        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
	    }
	
	    // FORMATTING
	
	    addFormatToken('M', ['MM', 2], 'Mo', function () {
	        return this.month() + 1;
	    });
	
	    addFormatToken('MMM', 0, 0, function (format) {
	        return this.localeData().monthsShort(this, format);
	    });
	
	    addFormatToken('MMMM', 0, 0, function (format) {
	        return this.localeData().months(this, format);
	    });
	
	    // ALIASES
	
	    addUnitAlias('month', 'M');
	
	    // PARSING
	
	    addRegexToken('M',    match1to2);
	    addRegexToken('MM',   match1to2, match2);
	    addRegexToken('MMM',  matchWord);
	    addRegexToken('MMMM', matchWord);
	
	    addParseToken(['M', 'MM'], function (input, array) {
	        array[MONTH] = toInt(input) - 1;
	    });
	
	    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
	        var month = config._locale.monthsParse(input, token, config._strict);
	        // if we didn't find a month name, mark the date as invalid.
	        if (month != null) {
	            array[MONTH] = month;
	        } else {
	            getParsingFlags(config).invalidMonth = input;
	        }
	    });
	
	    // LOCALES
	
	    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
	    function localeMonths (m) {
	        return this._months[m.month()];
	    }
	
	    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
	    function localeMonthsShort (m) {
	        return this._monthsShort[m.month()];
	    }
	
	    function localeMonthsParse (monthName, format, strict) {
	        var i, mom, regex;
	
	        if (!this._monthsParse) {
	            this._monthsParse = [];
	            this._longMonthsParse = [];
	            this._shortMonthsParse = [];
	        }
	
	        for (i = 0; i < 12; i++) {
	            // make the regex if we don't have it already
	            mom = create_utc__createUTC([2000, i]);
	            if (strict && !this._longMonthsParse[i]) {
	                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
	                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
	            }
	            if (!strict && !this._monthsParse[i]) {
	                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
	                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
	                return i;
	            } else if (!strict && this._monthsParse[i].test(monthName)) {
	                return i;
	            }
	        }
	    }
	
	    // MOMENTS
	
	    function setMonth (mom, value) {
	        var dayOfMonth;
	
	        // TODO: Move this out of here!
	        if (typeof value === 'string') {
	            value = mom.localeData().monthsParse(value);
	            // TODO: Another silent failure?
	            if (typeof value !== 'number') {
	                return mom;
	            }
	        }
	
	        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
	        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
	        return mom;
	    }
	
	    function getSetMonth (value) {
	        if (value != null) {
	            setMonth(this, value);
	            utils_hooks__hooks.updateOffset(this, true);
	            return this;
	        } else {
	            return get_set__get(this, 'Month');
	        }
	    }
	
	    function getDaysInMonth () {
	        return daysInMonth(this.year(), this.month());
	    }
	
	    function checkOverflow (m) {
	        var overflow;
	        var a = m._a;
	
	        if (a && getParsingFlags(m).overflow === -2) {
	            overflow =
	                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
	                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
	                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
	                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
	                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
	                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
	                -1;
	
	            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
	                overflow = DATE;
	            }
	
	            getParsingFlags(m).overflow = overflow;
	        }
	
	        return m;
	    }
	
	    function warn(msg) {
	        if (utils_hooks__hooks.suppressDeprecationWarnings === false && typeof console !== 'undefined' && console.warn) {
	            console.warn('Deprecation warning: ' + msg);
	        }
	    }
	
	    function deprecate(msg, fn) {
	        var firstTime = true,
	            msgWithStack = msg + '\n' + (new Error()).stack;
	
	        return extend(function () {
	            if (firstTime) {
	                warn(msgWithStack);
	                firstTime = false;
	            }
	            return fn.apply(this, arguments);
	        }, fn);
	    }
	
	    var deprecations = {};
	
	    function deprecateSimple(name, msg) {
	        if (!deprecations[name]) {
	            warn(msg);
	            deprecations[name] = true;
	        }
	    }
	
	    utils_hooks__hooks.suppressDeprecationWarnings = false;
	
	    var from_string__isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
	
	    var isoDates = [
	        ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
	        ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
	        ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
	        ['GGGG-[W]WW', /\d{4}-W\d{2}/],
	        ['YYYY-DDD', /\d{4}-\d{3}/]
	    ];
	
	    // iso time formats and regexes
	    var isoTimes = [
	        ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
	        ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
	        ['HH:mm', /(T| )\d\d:\d\d/],
	        ['HH', /(T| )\d\d/]
	    ];
	
	    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;
	
	    // date from iso format
	    function configFromISO(config) {
	        var i, l,
	            string = config._i,
	            match = from_string__isoRegex.exec(string);
	
	        if (match) {
	            getParsingFlags(config).iso = true;
	            for (i = 0, l = isoDates.length; i < l; i++) {
	                if (isoDates[i][1].exec(string)) {
	                    // match[5] should be 'T' or undefined
	                    config._f = isoDates[i][0] + (match[6] || ' ');
	                    break;
	                }
	            }
	            for (i = 0, l = isoTimes.length; i < l; i++) {
	                if (isoTimes[i][1].exec(string)) {
	                    config._f += isoTimes[i][0];
	                    break;
	                }
	            }
	            if (string.match(matchOffset)) {
	                config._f += 'Z';
	            }
	            configFromStringAndFormat(config);
	        } else {
	            config._isValid = false;
	        }
	    }
	
	    // date from iso format or fallback
	    function configFromString(config) {
	        var matched = aspNetJsonRegex.exec(config._i);
	
	        if (matched !== null) {
	            config._d = new Date(+matched[1]);
	            return;
	        }
	
	        configFromISO(config);
	        if (config._isValid === false) {
	            delete config._isValid;
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }
	
	    utils_hooks__hooks.createFromInputFallback = deprecate(
	        'moment construction falls back to js Date. This is ' +
	        'discouraged and will be removed in upcoming major ' +
	        'release. Please refer to ' +
	        'https://github.com/moment/moment/issues/1407 for more info.',
	        function (config) {
	            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
	        }
	    );
	
	    function createDate (y, m, d, h, M, s, ms) {
	        //can't just apply() to create a date:
	        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
	        var date = new Date(y, m, d, h, M, s, ms);
	
	        //the date constructor doesn't accept years < 1970
	        if (y < 1970) {
	            date.setFullYear(y);
	        }
	        return date;
	    }
	
	    function createUTCDate (y) {
	        var date = new Date(Date.UTC.apply(null, arguments));
	        if (y < 1970) {
	            date.setUTCFullYear(y);
	        }
	        return date;
	    }
	
	    addFormatToken(0, ['YY', 2], 0, function () {
	        return this.year() % 100;
	    });
	
	    addFormatToken(0, ['YYYY',   4],       0, 'year');
	    addFormatToken(0, ['YYYYY',  5],       0, 'year');
	    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');
	
	    // ALIASES
	
	    addUnitAlias('year', 'y');
	
	    // PARSING
	
	    addRegexToken('Y',      matchSigned);
	    addRegexToken('YY',     match1to2, match2);
	    addRegexToken('YYYY',   match1to4, match4);
	    addRegexToken('YYYYY',  match1to6, match6);
	    addRegexToken('YYYYYY', match1to6, match6);
	
	    addParseToken(['YYYY', 'YYYYY', 'YYYYYY'], YEAR);
	    addParseToken('YY', function (input, array) {
	        array[YEAR] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });
	
	    // HELPERS
	
	    function daysInYear(year) {
	        return isLeapYear(year) ? 366 : 365;
	    }
	
	    function isLeapYear(year) {
	        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
	    }
	
	    // HOOKS
	
	    utils_hooks__hooks.parseTwoDigitYear = function (input) {
	        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
	    };
	
	    // MOMENTS
	
	    var getSetYear = makeGetSet('FullYear', false);
	
	    function getIsLeapYear () {
	        return isLeapYear(this.year());
	    }
	
	    addFormatToken('w', ['ww', 2], 'wo', 'week');
	    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');
	
	    // ALIASES
	
	    addUnitAlias('week', 'w');
	    addUnitAlias('isoWeek', 'W');
	
	    // PARSING
	
	    addRegexToken('w',  match1to2);
	    addRegexToken('ww', match1to2, match2);
	    addRegexToken('W',  match1to2);
	    addRegexToken('WW', match1to2, match2);
	
	    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
	        week[token.substr(0, 1)] = toInt(input);
	    });
	
	    // HELPERS
	
	    // firstDayOfWeek       0 = sun, 6 = sat
	    //                      the day of the week that starts the week
	    //                      (usually sunday or monday)
	    // firstDayOfWeekOfYear 0 = sun, 6 = sat
	    //                      the first week is the week that contains the first
	    //                      of this day of the week
	    //                      (eg. ISO weeks use thursday (4))
	    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
	        var end = firstDayOfWeekOfYear - firstDayOfWeek,
	            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
	            adjustedMoment;
	
	
	        if (daysToDayOfWeek > end) {
	            daysToDayOfWeek -= 7;
	        }
	
	        if (daysToDayOfWeek < end - 7) {
	            daysToDayOfWeek += 7;
	        }
	
	        adjustedMoment = local__createLocal(mom).add(daysToDayOfWeek, 'd');
	        return {
	            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
	            year: adjustedMoment.year()
	        };
	    }
	
	    // LOCALES
	
	    function localeWeek (mom) {
	        return weekOfYear(mom, this._week.dow, this._week.doy).week;
	    }
	
	    var defaultLocaleWeek = {
	        dow : 0, // Sunday is the first day of the week.
	        doy : 6  // The week that contains Jan 1st is the first week of the year.
	    };
	
	    function localeFirstDayOfWeek () {
	        return this._week.dow;
	    }
	
	    function localeFirstDayOfYear () {
	        return this._week.doy;
	    }
	
	    // MOMENTS
	
	    function getSetWeek (input) {
	        var week = this.localeData().week(this);
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }
	
	    function getSetISOWeek (input) {
	        var week = weekOfYear(this, 1, 4).week;
	        return input == null ? week : this.add((input - week) * 7, 'd');
	    }
	
	    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');
	
	    // ALIASES
	
	    addUnitAlias('dayOfYear', 'DDD');
	
	    // PARSING
	
	    addRegexToken('DDD',  match1to3);
	    addRegexToken('DDDD', match3);
	    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
	        config._dayOfYear = toInt(input);
	    });
	
	    // HELPERS
	
	    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
	    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
	        var d = createUTCDate(year, 0, 1).getUTCDay();
	        var daysToAdd;
	        var dayOfYear;
	
	        d = d === 0 ? 7 : d;
	        weekday = weekday != null ? weekday : firstDayOfWeek;
	        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
	        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
	
	        return {
	            year      : dayOfYear > 0 ? year      : year - 1,
	            dayOfYear : dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
	        };
	    }
	
	    // MOMENTS
	
	    function getSetDayOfYear (input) {
	        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
	        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
	    }
	
	    // Pick the first defined of two or three arguments.
	    function defaults(a, b, c) {
	        if (a != null) {
	            return a;
	        }
	        if (b != null) {
	            return b;
	        }
	        return c;
	    }
	
	    function currentDateArray(config) {
	        var now = new Date();
	        if (config._useUTC) {
	            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()];
	        }
	        return [now.getFullYear(), now.getMonth(), now.getDate()];
	    }
	
	    // convert an array to a date.
	    // the array should mirror the parameters below
	    // note: all values past the year are optional and will default to the lowest possible value.
	    // [year, month, day , hour, minute, second, millisecond]
	    function configFromArray (config) {
	        var i, date, input = [], currentDate, yearToUse;
	
	        if (config._d) {
	            return;
	        }
	
	        currentDate = currentDateArray(config);
	
	        //compute day of the year from weeks and weekdays
	        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
	            dayOfYearFromWeekInfo(config);
	        }
	
	        //if the day of the year is set, figure out what it is
	        if (config._dayOfYear) {
	            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
	
	            if (config._dayOfYear > daysInYear(yearToUse)) {
	                getParsingFlags(config)._overflowDayOfYear = true;
	            }
	
	            date = createUTCDate(yearToUse, 0, config._dayOfYear);
	            config._a[MONTH] = date.getUTCMonth();
	            config._a[DATE] = date.getUTCDate();
	        }
	
	        // Default to current date.
	        // * if no year, month, day of month are given, default to today
	        // * if day of month is given, default month and year
	        // * if month is given, default only year
	        // * if year is given, don't default anything
	        for (i = 0; i < 3 && config._a[i] == null; ++i) {
	            config._a[i] = input[i] = currentDate[i];
	        }
	
	        // Zero out whatever was not defaulted, including time
	        for (; i < 7; i++) {
	            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
	        }
	
	        // Check for 24:00:00.000
	        if (config._a[HOUR] === 24 &&
	                config._a[MINUTE] === 0 &&
	                config._a[SECOND] === 0 &&
	                config._a[MILLISECOND] === 0) {
	            config._nextDay = true;
	            config._a[HOUR] = 0;
	        }
	
	        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
	        // Apply timezone offset from input. The actual utcOffset can be changed
	        // with parseZone.
	        if (config._tzm != null) {
	            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
	        }
	
	        if (config._nextDay) {
	            config._a[HOUR] = 24;
	        }
	    }
	
	    function dayOfYearFromWeekInfo(config) {
	        var w, weekYear, week, weekday, dow, doy, temp;
	
	        w = config._w;
	        if (w.GG != null || w.W != null || w.E != null) {
	            dow = 1;
	            doy = 4;
	
	            // TODO: We need to take the current isoWeekYear, but that depends on
	            // how we interpret now (local, utc, fixed offset). So create
	            // a now version of current config (take local/utc/offset flags, and
	            // create now).
	            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(local__createLocal(), 1, 4).year);
	            week = defaults(w.W, 1);
	            weekday = defaults(w.E, 1);
	        } else {
	            dow = config._locale._week.dow;
	            doy = config._locale._week.doy;
	
	            weekYear = defaults(w.gg, config._a[YEAR], weekOfYear(local__createLocal(), dow, doy).year);
	            week = defaults(w.w, 1);
	
	            if (w.d != null) {
	                // weekday -- low day numbers are considered next week
	                weekday = w.d;
	                if (weekday < dow) {
	                    ++week;
	                }
	            } else if (w.e != null) {
	                // local weekday -- counting starts from begining of week
	                weekday = w.e + dow;
	            } else {
	                // default to begining of week
	                weekday = dow;
	            }
	        }
	        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);
	
	        config._a[YEAR] = temp.year;
	        config._dayOfYear = temp.dayOfYear;
	    }
	
	    utils_hooks__hooks.ISO_8601 = function () {};
	
	    // date from string and format string
	    function configFromStringAndFormat(config) {
	        // TODO: Move this to another part of the creation flow to prevent circular deps
	        if (config._f === utils_hooks__hooks.ISO_8601) {
	            configFromISO(config);
	            return;
	        }
	
	        config._a = [];
	        getParsingFlags(config).empty = true;
	
	        // This array is used to make a Date, either with `new Date` or `Date.UTC`
	        var string = '' + config._i,
	            i, parsedInput, tokens, token, skipped,
	            stringLength = string.length,
	            totalParsedInputLength = 0;
	
	        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
	
	        for (i = 0; i < tokens.length; i++) {
	            token = tokens[i];
	            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
	            if (parsedInput) {
	                skipped = string.substr(0, string.indexOf(parsedInput));
	                if (skipped.length > 0) {
	                    getParsingFlags(config).unusedInput.push(skipped);
	                }
	                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
	                totalParsedInputLength += parsedInput.length;
	            }
	            // don't parse if it's not a known token
	            if (formatTokenFunctions[token]) {
	                if (parsedInput) {
	                    getParsingFlags(config).empty = false;
	                }
	                else {
	                    getParsingFlags(config).unusedTokens.push(token);
	                }
	                addTimeToArrayFromToken(token, parsedInput, config);
	            }
	            else if (config._strict && !parsedInput) {
	                getParsingFlags(config).unusedTokens.push(token);
	            }
	        }
	
	        // add remaining unparsed input length to the string
	        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
	        if (string.length > 0) {
	            getParsingFlags(config).unusedInput.push(string);
	        }
	
	        // clear _12h flag if hour is <= 12
	        if (getParsingFlags(config).bigHour === true &&
	                config._a[HOUR] <= 12 &&
	                config._a[HOUR] > 0) {
	            getParsingFlags(config).bigHour = undefined;
	        }
	        // handle meridiem
	        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
	
	        configFromArray(config);
	        checkOverflow(config);
	    }
	
	
	    function meridiemFixWrap (locale, hour, meridiem) {
	        var isPm;
	
	        if (meridiem == null) {
	            // nothing to do
	            return hour;
	        }
	        if (locale.meridiemHour != null) {
	            return locale.meridiemHour(hour, meridiem);
	        } else if (locale.isPM != null) {
	            // Fallback
	            isPm = locale.isPM(meridiem);
	            if (isPm && hour < 12) {
	                hour += 12;
	            }
	            if (!isPm && hour === 12) {
	                hour = 0;
	            }
	            return hour;
	        } else {
	            // this is not supposed to happen
	            return hour;
	        }
	    }
	
	    function configFromStringAndArray(config) {
	        var tempConfig,
	            bestMoment,
	
	            scoreToBeat,
	            i,
	            currentScore;
	
	        if (config._f.length === 0) {
	            getParsingFlags(config).invalidFormat = true;
	            config._d = new Date(NaN);
	            return;
	        }
	
	        for (i = 0; i < config._f.length; i++) {
	            currentScore = 0;
	            tempConfig = copyConfig({}, config);
	            if (config._useUTC != null) {
	                tempConfig._useUTC = config._useUTC;
	            }
	            tempConfig._f = config._f[i];
	            configFromStringAndFormat(tempConfig);
	
	            if (!valid__isValid(tempConfig)) {
	                continue;
	            }
	
	            // if there is any input that was not parsed add a penalty for that format
	            currentScore += getParsingFlags(tempConfig).charsLeftOver;
	
	            //or tokens
	            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
	
	            getParsingFlags(tempConfig).score = currentScore;
	
	            if (scoreToBeat == null || currentScore < scoreToBeat) {
	                scoreToBeat = currentScore;
	                bestMoment = tempConfig;
	            }
	        }
	
	        extend(config, bestMoment || tempConfig);
	    }
	
	    function configFromObject(config) {
	        if (config._d) {
	            return;
	        }
	
	        var i = normalizeObjectUnits(config._i);
	        config._a = [i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond];
	
	        configFromArray(config);
	    }
	
	    function createFromConfig (config) {
	        var input = config._i,
	            format = config._f,
	            res;
	
	        config._locale = config._locale || locale_locales__getLocale(config._l);
	
	        if (input === null || (format === undefined && input === '')) {
	            return valid__createInvalid({nullInput: true});
	        }
	
	        if (typeof input === 'string') {
	            config._i = input = config._locale.preparse(input);
	        }
	
	        if (isMoment(input)) {
	            return new Moment(checkOverflow(input));
	        } else if (isArray(format)) {
	            configFromStringAndArray(config);
	        } else if (format) {
	            configFromStringAndFormat(config);
	        } else if (isDate(input)) {
	            config._d = input;
	        } else {
	            configFromInput(config);
	        }
	
	        res = new Moment(checkOverflow(config));
	        if (res._nextDay) {
	            // Adding is smart enough around DST
	            res.add(1, 'd');
	            res._nextDay = undefined;
	        }
	
	        return res;
	    }
	
	    function configFromInput(config) {
	        var input = config._i;
	        if (input === undefined) {
	            config._d = new Date();
	        } else if (isDate(input)) {
	            config._d = new Date(+input);
	        } else if (typeof input === 'string') {
	            configFromString(config);
	        } else if (isArray(input)) {
	            config._a = map(input.slice(0), function (obj) {
	                return parseInt(obj, 10);
	            });
	            configFromArray(config);
	        } else if (typeof(input) === 'object') {
	            configFromObject(config);
	        } else if (typeof(input) === 'number') {
	            // from milliseconds
	            config._d = new Date(input);
	        } else {
	            utils_hooks__hooks.createFromInputFallback(config);
	        }
	    }
	
	    function createLocalOrUTC (input, format, locale, strict, isUTC) {
	        var c = {};
	
	        if (typeof(locale) === 'boolean') {
	            strict = locale;
	            locale = undefined;
	        }
	        // object construction must be done this way.
	        // https://github.com/moment/moment/issues/1423
	        c._isAMomentObject = true;
	        c._useUTC = c._isUTC = isUTC;
	        c._l = locale;
	        c._i = input;
	        c._f = format;
	        c._strict = strict;
	
	        return createFromConfig(c);
	    }
	
	    function local__createLocal (input, format, locale, strict) {
	        return createLocalOrUTC(input, format, locale, strict, false);
	    }
	
	    var prototypeMin = deprecate(
	         'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
	         function () {
	             var other = local__createLocal.apply(null, arguments);
	             return other < this ? this : other;
	         }
	     );
	
	    var prototypeMax = deprecate(
	        'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
	        function () {
	            var other = local__createLocal.apply(null, arguments);
	            return other > this ? this : other;
	        }
	    );
	
	    // Pick a moment m from moments so that m[fn](other) is true for all
	    // other. This relies on the function fn to be transitive.
	    //
	    // moments should either be an array of moment objects or an array, whose
	    // first element is an array of moment objects.
	    function pickBy(fn, moments) {
	        var res, i;
	        if (moments.length === 1 && isArray(moments[0])) {
	            moments = moments[0];
	        }
	        if (!moments.length) {
	            return local__createLocal();
	        }
	        res = moments[0];
	        for (i = 1; i < moments.length; ++i) {
	            if (moments[i][fn](res)) {
	                res = moments[i];
	            }
	        }
	        return res;
	    }
	
	    // TODO: Use [].sort instead?
	    function min () {
	        var args = [].slice.call(arguments, 0);
	
	        return pickBy('isBefore', args);
	    }
	
	    function max () {
	        var args = [].slice.call(arguments, 0);
	
	        return pickBy('isAfter', args);
	    }
	
	    function Duration (duration) {
	        var normalizedInput = normalizeObjectUnits(duration),
	            years = normalizedInput.year || 0,
	            quarters = normalizedInput.quarter || 0,
	            months = normalizedInput.month || 0,
	            weeks = normalizedInput.week || 0,
	            days = normalizedInput.day || 0,
	            hours = normalizedInput.hour || 0,
	            minutes = normalizedInput.minute || 0,
	            seconds = normalizedInput.second || 0,
	            milliseconds = normalizedInput.millisecond || 0;
	
	        // representation for dateAddRemove
	        this._milliseconds = +milliseconds +
	            seconds * 1e3 + // 1000
	            minutes * 6e4 + // 1000 * 60
	            hours * 36e5; // 1000 * 60 * 60
	        // Because of dateAddRemove treats 24 hours as different from a
	        // day when working around DST, we need to store them separately
	        this._days = +days +
	            weeks * 7;
	        // It is impossible translate months into days without knowing
	        // which months you are are talking about, so we have to store
	        // it separately.
	        this._months = +months +
	            quarters * 3 +
	            years * 12;
	
	        this._data = {};
	
	        this._locale = locale_locales__getLocale();
	
	        this._bubble();
	    }
	
	    function isDuration (obj) {
	        return obj instanceof Duration;
	    }
	
	    function offset (token, separator) {
	        addFormatToken(token, 0, 0, function () {
	            var offset = this.utcOffset();
	            var sign = '+';
	            if (offset < 0) {
	                offset = -offset;
	                sign = '-';
	            }
	            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
	        });
	    }
	
	    offset('Z', ':');
	    offset('ZZ', '');
	
	    // PARSING
	
	    addRegexToken('Z',  matchOffset);
	    addRegexToken('ZZ', matchOffset);
	    addParseToken(['Z', 'ZZ'], function (input, array, config) {
	        config._useUTC = true;
	        config._tzm = offsetFromString(input);
	    });
	
	    // HELPERS
	
	    // timezone chunker
	    // '+10:00' > ['10',  '00']
	    // '-1530'  > ['-15', '30']
	    var chunkOffset = /([\+\-]|\d\d)/gi;
	
	    function offsetFromString(string) {
	        var matches = ((string || '').match(matchOffset) || []);
	        var chunk   = matches[matches.length - 1] || [];
	        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
	        var minutes = +(parts[1] * 60) + toInt(parts[2]);
	
	        return parts[0] === '+' ? minutes : -minutes;
	    }
	
	    // Return a moment from input, that is local/utc/zone equivalent to model.
	    function cloneWithOffset(input, model) {
	        var res, diff;
	        if (model._isUTC) {
	            res = model.clone();
	            diff = (isMoment(input) || isDate(input) ? +input : +local__createLocal(input)) - (+res);
	            // Use low-level api, because this fn is low-level api.
	            res._d.setTime(+res._d + diff);
	            utils_hooks__hooks.updateOffset(res, false);
	            return res;
	        } else {
	            return local__createLocal(input).local();
	        }
	        return model._isUTC ? local__createLocal(input).zone(model._offset || 0) : local__createLocal(input).local();
	    }
	
	    function getDateOffset (m) {
	        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
	        // https://github.com/moment/moment/pull/1871
	        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
	    }
	
	    // HOOKS
	
	    // This function will be called whenever a moment is mutated.
	    // It is intended to keep the offset in sync with the timezone.
	    utils_hooks__hooks.updateOffset = function () {};
	
	    // MOMENTS
	
	    // keepLocalTime = true means only change the timezone, without
	    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
	    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
	    // +0200, so we adjust the time as needed, to be valid.
	    //
	    // Keeping the time actually adds/subtracts (one hour)
	    // from the actual represented time. That is why we call updateOffset
	    // a second time. In case it wants us to change the offset again
	    // _changeInProgress == true case, then we have to adjust, because
	    // there is no such time in the given timezone.
	    function getSetOffset (input, keepLocalTime) {
	        var offset = this._offset || 0,
	            localAdjust;
	        if (input != null) {
	            if (typeof input === 'string') {
	                input = offsetFromString(input);
	            }
	            if (Math.abs(input) < 16) {
	                input = input * 60;
	            }
	            if (!this._isUTC && keepLocalTime) {
	                localAdjust = getDateOffset(this);
	            }
	            this._offset = input;
	            this._isUTC = true;
	            if (localAdjust != null) {
	                this.add(localAdjust, 'm');
	            }
	            if (offset !== input) {
	                if (!keepLocalTime || this._changeInProgress) {
	                    add_subtract__addSubtract(this, create__createDuration(input - offset, 'm'), 1, false);
	                } else if (!this._changeInProgress) {
	                    this._changeInProgress = true;
	                    utils_hooks__hooks.updateOffset(this, true);
	                    this._changeInProgress = null;
	                }
	            }
	            return this;
	        } else {
	            return this._isUTC ? offset : getDateOffset(this);
	        }
	    }
	
	    function getSetZone (input, keepLocalTime) {
	        if (input != null) {
	            if (typeof input !== 'string') {
	                input = -input;
	            }
	
	            this.utcOffset(input, keepLocalTime);
	
	            return this;
	        } else {
	            return -this.utcOffset();
	        }
	    }
	
	    function setOffsetToUTC (keepLocalTime) {
	        return this.utcOffset(0, keepLocalTime);
	    }
	
	    function setOffsetToLocal (keepLocalTime) {
	        if (this._isUTC) {
	            this.utcOffset(0, keepLocalTime);
	            this._isUTC = false;
	
	            if (keepLocalTime) {
	                this.subtract(getDateOffset(this), 'm');
	            }
	        }
	        return this;
	    }
	
	    function setOffsetToParsedOffset () {
	        if (this._tzm) {
	            this.utcOffset(this._tzm);
	        } else if (typeof this._i === 'string') {
	            this.utcOffset(offsetFromString(this._i));
	        }
	        return this;
	    }
	
	    function hasAlignedHourOffset (input) {
	        if (!input) {
	            input = 0;
	        }
	        else {
	            input = local__createLocal(input).utcOffset();
	        }
	
	        return (this.utcOffset() - input) % 60 === 0;
	    }
	
	    function isDaylightSavingTime () {
	        return (
	            this.utcOffset() > this.clone().month(0).utcOffset() ||
	            this.utcOffset() > this.clone().month(5).utcOffset()
	        );
	    }
	
	    function isDaylightSavingTimeShifted () {
	        if (this._a) {
	            var other = this._isUTC ? create_utc__createUTC(this._a) : local__createLocal(this._a);
	            return this.isValid() && compareArrays(this._a, other.toArray()) > 0;
	        }
	
	        return false;
	    }
	
	    function isLocal () {
	        return !this._isUTC;
	    }
	
	    function isUtcOffset () {
	        return this._isUTC;
	    }
	
	    function isUtc () {
	        return this._isUTC && this._offset === 0;
	    }
	
	    var aspNetRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/;
	
	    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
	    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
	    var create__isoRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
	
	    function create__createDuration (input, key) {
	        var duration = input,
	            // matching against regexp is expensive, do it on demand
	            match = null,
	            sign,
	            ret,
	            diffRes;
	
	        if (isDuration(input)) {
	            duration = {
	                ms : input._milliseconds,
	                d  : input._days,
	                M  : input._months
	            };
	        } else if (typeof input === 'number') {
	            duration = {};
	            if (key) {
	                duration[key] = input;
	            } else {
	                duration.milliseconds = input;
	            }
	        } else if (!!(match = aspNetRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y  : 0,
	                d  : toInt(match[DATE])        * sign,
	                h  : toInt(match[HOUR])        * sign,
	                m  : toInt(match[MINUTE])      * sign,
	                s  : toInt(match[SECOND])      * sign,
	                ms : toInt(match[MILLISECOND]) * sign
	            };
	        } else if (!!(match = create__isoRegex.exec(input))) {
	            sign = (match[1] === '-') ? -1 : 1;
	            duration = {
	                y : parseIso(match[2], sign),
	                M : parseIso(match[3], sign),
	                d : parseIso(match[4], sign),
	                h : parseIso(match[5], sign),
	                m : parseIso(match[6], sign),
	                s : parseIso(match[7], sign),
	                w : parseIso(match[8], sign)
	            };
	        } else if (duration == null) {// checks for null or undefined
	            duration = {};
	        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
	            diffRes = momentsDifference(local__createLocal(duration.from), local__createLocal(duration.to));
	
	            duration = {};
	            duration.ms = diffRes.milliseconds;
	            duration.M = diffRes.months;
	        }
	
	        ret = new Duration(duration);
	
	        if (isDuration(input) && hasOwnProp(input, '_locale')) {
	            ret._locale = input._locale;
	        }
	
	        return ret;
	    }
	
	    create__createDuration.fn = Duration.prototype;
	
	    function parseIso (inp, sign) {
	        // We'd normally use ~~inp for this, but unfortunately it also
	        // converts floats to ints.
	        // inp may be undefined, so careful calling replace on it.
	        var res = inp && parseFloat(inp.replace(',', '.'));
	        // apply sign while we're at it
	        return (isNaN(res) ? 0 : res) * sign;
	    }
	
	    function positiveMomentsDifference(base, other) {
	        var res = {milliseconds: 0, months: 0};
	
	        res.months = other.month() - base.month() +
	            (other.year() - base.year()) * 12;
	        if (base.clone().add(res.months, 'M').isAfter(other)) {
	            --res.months;
	        }
	
	        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
	
	        return res;
	    }
	
	    function momentsDifference(base, other) {
	        var res;
	        other = cloneWithOffset(other, base);
	        if (base.isBefore(other)) {
	            res = positiveMomentsDifference(base, other);
	        } else {
	            res = positiveMomentsDifference(other, base);
	            res.milliseconds = -res.milliseconds;
	            res.months = -res.months;
	        }
	
	        return res;
	    }
	
	    function createAdder(direction, name) {
	        return function (val, period) {
	            var dur, tmp;
	            //invert the arguments, but complain about it
	            if (period !== null && !isNaN(+period)) {
	                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
	                tmp = val; val = period; period = tmp;
	            }
	
	            val = typeof val === 'string' ? +val : val;
	            dur = create__createDuration(val, period);
	            add_subtract__addSubtract(this, dur, direction);
	            return this;
	        };
	    }
	
	    function add_subtract__addSubtract (mom, duration, isAdding, updateOffset) {
	        var milliseconds = duration._milliseconds,
	            days = duration._days,
	            months = duration._months;
	        updateOffset = updateOffset == null ? true : updateOffset;
	
	        if (milliseconds) {
	            mom._d.setTime(+mom._d + milliseconds * isAdding);
	        }
	        if (days) {
	            get_set__set(mom, 'Date', get_set__get(mom, 'Date') + days * isAdding);
	        }
	        if (months) {
	            setMonth(mom, get_set__get(mom, 'Month') + months * isAdding);
	        }
	        if (updateOffset) {
	            utils_hooks__hooks.updateOffset(mom, days || months);
	        }
	    }
	
	    var add_subtract__add      = createAdder(1, 'add');
	    var add_subtract__subtract = createAdder(-1, 'subtract');
	
	    function moment_calendar__calendar (time) {
	        // We want to compare the start of today, vs this.
	        // Getting start-of-today depends on whether we're local/utc/offset or not.
	        var now = time || local__createLocal(),
	            sod = cloneWithOffset(now, this).startOf('day'),
	            diff = this.diff(sod, 'days', true),
	            format = diff < -6 ? 'sameElse' :
	                diff < -1 ? 'lastWeek' :
	                diff < 0 ? 'lastDay' :
	                diff < 1 ? 'sameDay' :
	                diff < 2 ? 'nextDay' :
	                diff < 7 ? 'nextWeek' : 'sameElse';
	        return this.format(this.localeData().calendar(format, this, local__createLocal(now)));
	    }
	
	    function clone () {
	        return new Moment(this);
	    }
	
	    function isAfter (input, units) {
	        var inputMs;
	        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this > +input;
	        } else {
	            inputMs = isMoment(input) ? +input : +local__createLocal(input);
	            return inputMs < +this.clone().startOf(units);
	        }
	    }
	
	    function isBefore (input, units) {
	        var inputMs;
	        units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this < +input;
	        } else {
	            inputMs = isMoment(input) ? +input : +local__createLocal(input);
	            return +this.clone().endOf(units) < inputMs;
	        }
	    }
	
	    function isBetween (from, to, units) {
	        return this.isAfter(from, units) && this.isBefore(to, units);
	    }
	
	    function isSame (input, units) {
	        var inputMs;
	        units = normalizeUnits(units || 'millisecond');
	        if (units === 'millisecond') {
	            input = isMoment(input) ? input : local__createLocal(input);
	            return +this === +input;
	        } else {
	            inputMs = +local__createLocal(input);
	            return +(this.clone().startOf(units)) <= inputMs && inputMs <= +(this.clone().endOf(units));
	        }
	    }
	
	    function absFloor (number) {
	        if (number < 0) {
	            return Math.ceil(number);
	        } else {
	            return Math.floor(number);
	        }
	    }
	
	    function diff (input, units, asFloat) {
	        var that = cloneWithOffset(input, this),
	            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4,
	            delta, output;
	
	        units = normalizeUnits(units);
	
	        if (units === 'year' || units === 'month' || units === 'quarter') {
	            output = monthDiff(this, that);
	            if (units === 'quarter') {
	                output = output / 3;
	            } else if (units === 'year') {
	                output = output / 12;
	            }
	        } else {
	            delta = this - that;
	            output = units === 'second' ? delta / 1e3 : // 1000
	                units === 'minute' ? delta / 6e4 : // 1000 * 60
	                units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
	                units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
	                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
	                delta;
	        }
	        return asFloat ? output : absFloor(output);
	    }
	
	    function monthDiff (a, b) {
	        // difference in months
	        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
	            // b is in (anchor - 1 month, anchor + 1 month)
	            anchor = a.clone().add(wholeMonthDiff, 'months'),
	            anchor2, adjust;
	
	        if (b - anchor < 0) {
	            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor - anchor2);
	        } else {
	            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
	            // linear across the month
	            adjust = (b - anchor) / (anchor2 - anchor);
	        }
	
	        return -(wholeMonthDiff + adjust);
	    }
	
	    utils_hooks__hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
	
	    function toString () {
	        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
	    }
	
	    function moment_format__toISOString () {
	        var m = this.clone().utc();
	        if (0 < m.year() && m.year() <= 9999) {
	            if ('function' === typeof Date.prototype.toISOString) {
	                // native implementation is ~50x faster, use it when we can
	                return this.toDate().toISOString();
	            } else {
	                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	            }
	        } else {
	            return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
	        }
	    }
	
	    function format (inputString) {
	        var output = formatMoment(this, inputString || utils_hooks__hooks.defaultFormat);
	        return this.localeData().postformat(output);
	    }
	
	    function from (time, withoutSuffix) {
	        if (!this.isValid()) {
	            return this.localeData().invalidDate();
	        }
	        return create__createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
	    }
	
	    function fromNow (withoutSuffix) {
	        return this.from(local__createLocal(), withoutSuffix);
	    }
	
	    function to (time, withoutSuffix) {
	        if (!this.isValid()) {
	            return this.localeData().invalidDate();
	        }
	        return create__createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
	    }
	
	    function toNow (withoutSuffix) {
	        return this.to(local__createLocal(), withoutSuffix);
	    }
	
	    function locale (key) {
	        var newLocaleData;
	
	        if (key === undefined) {
	            return this._locale._abbr;
	        } else {
	            newLocaleData = locale_locales__getLocale(key);
	            if (newLocaleData != null) {
	                this._locale = newLocaleData;
	            }
	            return this;
	        }
	    }
	
	    var lang = deprecate(
	        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
	        function (key) {
	            if (key === undefined) {
	                return this.localeData();
	            } else {
	                return this.locale(key);
	            }
	        }
	    );
	
	    function localeData () {
	        return this._locale;
	    }
	
	    function startOf (units) {
	        units = normalizeUnits(units);
	        // the following switch intentionally omits break keywords
	        // to utilize falling through the cases.
	        switch (units) {
	        case 'year':
	            this.month(0);
	            /* falls through */
	        case 'quarter':
	        case 'month':
	            this.date(1);
	            /* falls through */
	        case 'week':
	        case 'isoWeek':
	        case 'day':
	            this.hours(0);
	            /* falls through */
	        case 'hour':
	            this.minutes(0);
	            /* falls through */
	        case 'minute':
	            this.seconds(0);
	            /* falls through */
	        case 'second':
	            this.milliseconds(0);
	        }
	
	        // weeks are a special case
	        if (units === 'week') {
	            this.weekday(0);
	        }
	        if (units === 'isoWeek') {
	            this.isoWeekday(1);
	        }
	
	        // quarters are also special
	        if (units === 'quarter') {
	            this.month(Math.floor(this.month() / 3) * 3);
	        }
	
	        return this;
	    }
	
	    function endOf (units) {
	        units = normalizeUnits(units);
	        if (units === undefined || units === 'millisecond') {
	            return this;
	        }
	        return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
	    }
	
	    function to_type__valueOf () {
	        return +this._d - ((this._offset || 0) * 60000);
	    }
	
	    function unix () {
	        return Math.floor(+this / 1000);
	    }
	
	    function toDate () {
	        return this._offset ? new Date(+this) : this._d;
	    }
	
	    function toArray () {
	        var m = this;
	        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
	    }
	
	    function moment_valid__isValid () {
	        return valid__isValid(this);
	    }
	
	    function parsingFlags () {
	        return extend({}, getParsingFlags(this));
	    }
	
	    function invalidAt () {
	        return getParsingFlags(this).overflow;
	    }
	
	    addFormatToken(0, ['gg', 2], 0, function () {
	        return this.weekYear() % 100;
	    });
	
	    addFormatToken(0, ['GG', 2], 0, function () {
	        return this.isoWeekYear() % 100;
	    });
	
	    function addWeekYearFormatToken (token, getter) {
	        addFormatToken(0, [token, token.length], 0, getter);
	    }
	
	    addWeekYearFormatToken('gggg',     'weekYear');
	    addWeekYearFormatToken('ggggg',    'weekYear');
	    addWeekYearFormatToken('GGGG',  'isoWeekYear');
	    addWeekYearFormatToken('GGGGG', 'isoWeekYear');
	
	    // ALIASES
	
	    addUnitAlias('weekYear', 'gg');
	    addUnitAlias('isoWeekYear', 'GG');
	
	    // PARSING
	
	    addRegexToken('G',      matchSigned);
	    addRegexToken('g',      matchSigned);
	    addRegexToken('GG',     match1to2, match2);
	    addRegexToken('gg',     match1to2, match2);
	    addRegexToken('GGGG',   match1to4, match4);
	    addRegexToken('gggg',   match1to4, match4);
	    addRegexToken('GGGGG',  match1to6, match6);
	    addRegexToken('ggggg',  match1to6, match6);
	
	    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
	        week[token.substr(0, 2)] = toInt(input);
	    });
	
	    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
	        week[token] = utils_hooks__hooks.parseTwoDigitYear(input);
	    });
	
	    // HELPERS
	
	    function weeksInYear(year, dow, doy) {
	        return weekOfYear(local__createLocal([year, 11, 31 + dow - doy]), dow, doy).week;
	    }
	
	    // MOMENTS
	
	    function getSetWeekYear (input) {
	        var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
	        return input == null ? year : this.add((input - year), 'y');
	    }
	
	    function getSetISOWeekYear (input) {
	        var year = weekOfYear(this, 1, 4).year;
	        return input == null ? year : this.add((input - year), 'y');
	    }
	
	    function getISOWeeksInYear () {
	        return weeksInYear(this.year(), 1, 4);
	    }
	
	    function getWeeksInYear () {
	        var weekInfo = this.localeData()._week;
	        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
	    }
	
	    addFormatToken('Q', 0, 0, 'quarter');
	
	    // ALIASES
	
	    addUnitAlias('quarter', 'Q');
	
	    // PARSING
	
	    addRegexToken('Q', match1);
	    addParseToken('Q', function (input, array) {
	        array[MONTH] = (toInt(input) - 1) * 3;
	    });
	
	    // MOMENTS
	
	    function getSetQuarter (input) {
	        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
	    }
	
	    addFormatToken('D', ['DD', 2], 'Do', 'date');
	
	    // ALIASES
	
	    addUnitAlias('date', 'D');
	
	    // PARSING
	
	    addRegexToken('D',  match1to2);
	    addRegexToken('DD', match1to2, match2);
	    addRegexToken('Do', function (isStrict, locale) {
	        return isStrict ? locale._ordinalParse : locale._ordinalParseLenient;
	    });
	
	    addParseToken(['D', 'DD'], DATE);
	    addParseToken('Do', function (input, array) {
	        array[DATE] = toInt(input.match(match1to2)[0], 10);
	    });
	
	    // MOMENTS
	
	    var getSetDayOfMonth = makeGetSet('Date', true);
	
	    addFormatToken('d', 0, 'do', 'day');
	
	    addFormatToken('dd', 0, 0, function (format) {
	        return this.localeData().weekdaysMin(this, format);
	    });
	
	    addFormatToken('ddd', 0, 0, function (format) {
	        return this.localeData().weekdaysShort(this, format);
	    });
	
	    addFormatToken('dddd', 0, 0, function (format) {
	        return this.localeData().weekdays(this, format);
	    });
	
	    addFormatToken('e', 0, 0, 'weekday');
	    addFormatToken('E', 0, 0, 'isoWeekday');
	
	    // ALIASES
	
	    addUnitAlias('day', 'd');
	    addUnitAlias('weekday', 'e');
	    addUnitAlias('isoWeekday', 'E');
	
	    // PARSING
	
	    addRegexToken('d',    match1to2);
	    addRegexToken('e',    match1to2);
	    addRegexToken('E',    match1to2);
	    addRegexToken('dd',   matchWord);
	    addRegexToken('ddd',  matchWord);
	    addRegexToken('dddd', matchWord);
	
	    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config) {
	        var weekday = config._locale.weekdaysParse(input);
	        // if we didn't get a weekday name, mark the date as invalid
	        if (weekday != null) {
	            week.d = weekday;
	        } else {
	            getParsingFlags(config).invalidWeekday = input;
	        }
	    });
	
	    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
	        week[token] = toInt(input);
	    });
	
	    // HELPERS
	
	    function parseWeekday(input, locale) {
	        if (typeof input === 'string') {
	            if (!isNaN(input)) {
	                input = parseInt(input, 10);
	            }
	            else {
	                input = locale.weekdaysParse(input);
	                if (typeof input !== 'number') {
	                    return null;
	                }
	            }
	        }
	        return input;
	    }
	
	    // LOCALES
	
	    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
	    function localeWeekdays (m) {
	        return this._weekdays[m.day()];
	    }
	
	    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
	    function localeWeekdaysShort (m) {
	        return this._weekdaysShort[m.day()];
	    }
	
	    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
	    function localeWeekdaysMin (m) {
	        return this._weekdaysMin[m.day()];
	    }
	
	    function localeWeekdaysParse (weekdayName) {
	        var i, mom, regex;
	
	        if (!this._weekdaysParse) {
	            this._weekdaysParse = [];
	        }
	
	        for (i = 0; i < 7; i++) {
	            // make the regex if we don't have it already
	            if (!this._weekdaysParse[i]) {
	                mom = local__createLocal([2000, 1]).day(i);
	                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
	                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
	            }
	            // test the regex
	            if (this._weekdaysParse[i].test(weekdayName)) {
	                return i;
	            }
	        }
	    }
	
	    // MOMENTS
	
	    function getSetDayOfWeek (input) {
	        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
	        if (input != null) {
	            input = parseWeekday(input, this.localeData());
	            return this.add(input - day, 'd');
	        } else {
	            return day;
	        }
	    }
	
	    function getSetLocaleDayOfWeek (input) {
	        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
	        return input == null ? weekday : this.add(input - weekday, 'd');
	    }
	
	    function getSetISODayOfWeek (input) {
	        // behaves the same as moment#day except
	        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
	        // as a setter, sunday should belong to the previous week.
	        return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
	    }
	
	    addFormatToken('H', ['HH', 2], 0, 'hour');
	    addFormatToken('h', ['hh', 2], 0, function () {
	        return this.hours() % 12 || 12;
	    });
	
	    function meridiem (token, lowercase) {
	        addFormatToken(token, 0, 0, function () {
	            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
	        });
	    }
	
	    meridiem('a', true);
	    meridiem('A', false);
	
	    // ALIASES
	
	    addUnitAlias('hour', 'h');
	
	    // PARSING
	
	    function matchMeridiem (isStrict, locale) {
	        return locale._meridiemParse;
	    }
	
	    addRegexToken('a',  matchMeridiem);
	    addRegexToken('A',  matchMeridiem);
	    addRegexToken('H',  match1to2);
	    addRegexToken('h',  match1to2);
	    addRegexToken('HH', match1to2, match2);
	    addRegexToken('hh', match1to2, match2);
	
	    addParseToken(['H', 'HH'], HOUR);
	    addParseToken(['a', 'A'], function (input, array, config) {
	        config._isPm = config._locale.isPM(input);
	        config._meridiem = input;
	    });
	    addParseToken(['h', 'hh'], function (input, array, config) {
	        array[HOUR] = toInt(input);
	        getParsingFlags(config).bigHour = true;
	    });
	
	    // LOCALES
	
	    function localeIsPM (input) {
	        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
	        // Using charAt should be more compatible.
	        return ((input + '').toLowerCase().charAt(0) === 'p');
	    }
	
	    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
	    function localeMeridiem (hours, minutes, isLower) {
	        if (hours > 11) {
	            return isLower ? 'pm' : 'PM';
	        } else {
	            return isLower ? 'am' : 'AM';
	        }
	    }
	
	
	    // MOMENTS
	
	    // Setting the hour should keep the time, because the user explicitly
	    // specified which hour he wants. So trying to maintain the same hour (in
	    // a new timezone) makes sense. Adding/subtracting hours does not follow
	    // this rule.
	    var getSetHour = makeGetSet('Hours', true);
	
	    addFormatToken('m', ['mm', 2], 0, 'minute');
	
	    // ALIASES
	
	    addUnitAlias('minute', 'm');
	
	    // PARSING
	
	    addRegexToken('m',  match1to2);
	    addRegexToken('mm', match1to2, match2);
	    addParseToken(['m', 'mm'], MINUTE);
	
	    // MOMENTS
	
	    var getSetMinute = makeGetSet('Minutes', false);
	
	    addFormatToken('s', ['ss', 2], 0, 'second');
	
	    // ALIASES
	
	    addUnitAlias('second', 's');
	
	    // PARSING
	
	    addRegexToken('s',  match1to2);
	    addRegexToken('ss', match1to2, match2);
	    addParseToken(['s', 'ss'], SECOND);
	
	    // MOMENTS
	
	    var getSetSecond = makeGetSet('Seconds', false);
	
	    addFormatToken('S', 0, 0, function () {
	        return ~~(this.millisecond() / 100);
	    });
	
	    addFormatToken(0, ['SS', 2], 0, function () {
	        return ~~(this.millisecond() / 10);
	    });
	
	    function millisecond__milliseconds (token) {
	        addFormatToken(0, [token, 3], 0, 'millisecond');
	    }
	
	    millisecond__milliseconds('SSS');
	    millisecond__milliseconds('SSSS');
	
	    // ALIASES
	
	    addUnitAlias('millisecond', 'ms');
	
	    // PARSING
	
	    addRegexToken('S',    match1to3, match1);
	    addRegexToken('SS',   match1to3, match2);
	    addRegexToken('SSS',  match1to3, match3);
	    addRegexToken('SSSS', matchUnsigned);
	    addParseToken(['S', 'SS', 'SSS', 'SSSS'], function (input, array) {
	        array[MILLISECOND] = toInt(('0.' + input) * 1000);
	    });
	
	    // MOMENTS
	
	    var getSetMillisecond = makeGetSet('Milliseconds', false);
	
	    addFormatToken('z',  0, 0, 'zoneAbbr');
	    addFormatToken('zz', 0, 0, 'zoneName');
	
	    // MOMENTS
	
	    function getZoneAbbr () {
	        return this._isUTC ? 'UTC' : '';
	    }
	
	    function getZoneName () {
	        return this._isUTC ? 'Coordinated Universal Time' : '';
	    }
	
	    var momentPrototype__proto = Moment.prototype;
	
	    momentPrototype__proto.add          = add_subtract__add;
	    momentPrototype__proto.calendar     = moment_calendar__calendar;
	    momentPrototype__proto.clone        = clone;
	    momentPrototype__proto.diff         = diff;
	    momentPrototype__proto.endOf        = endOf;
	    momentPrototype__proto.format       = format;
	    momentPrototype__proto.from         = from;
	    momentPrototype__proto.fromNow      = fromNow;
	    momentPrototype__proto.to           = to;
	    momentPrototype__proto.toNow        = toNow;
	    momentPrototype__proto.get          = getSet;
	    momentPrototype__proto.invalidAt    = invalidAt;
	    momentPrototype__proto.isAfter      = isAfter;
	    momentPrototype__proto.isBefore     = isBefore;
	    momentPrototype__proto.isBetween    = isBetween;
	    momentPrototype__proto.isSame       = isSame;
	    momentPrototype__proto.isValid      = moment_valid__isValid;
	    momentPrototype__proto.lang         = lang;
	    momentPrototype__proto.locale       = locale;
	    momentPrototype__proto.localeData   = localeData;
	    momentPrototype__proto.max          = prototypeMax;
	    momentPrototype__proto.min          = prototypeMin;
	    momentPrototype__proto.parsingFlags = parsingFlags;
	    momentPrototype__proto.set          = getSet;
	    momentPrototype__proto.startOf      = startOf;
	    momentPrototype__proto.subtract     = add_subtract__subtract;
	    momentPrototype__proto.toArray      = toArray;
	    momentPrototype__proto.toDate       = toDate;
	    momentPrototype__proto.toISOString  = moment_format__toISOString;
	    momentPrototype__proto.toJSON       = moment_format__toISOString;
	    momentPrototype__proto.toString     = toString;
	    momentPrototype__proto.unix         = unix;
	    momentPrototype__proto.valueOf      = to_type__valueOf;
	
	    // Year
	    momentPrototype__proto.year       = getSetYear;
	    momentPrototype__proto.isLeapYear = getIsLeapYear;
	
	    // Week Year
	    momentPrototype__proto.weekYear    = getSetWeekYear;
	    momentPrototype__proto.isoWeekYear = getSetISOWeekYear;
	
	    // Quarter
	    momentPrototype__proto.quarter = momentPrototype__proto.quarters = getSetQuarter;
	
	    // Month
	    momentPrototype__proto.month       = getSetMonth;
	    momentPrototype__proto.daysInMonth = getDaysInMonth;
	
	    // Week
	    momentPrototype__proto.week           = momentPrototype__proto.weeks        = getSetWeek;
	    momentPrototype__proto.isoWeek        = momentPrototype__proto.isoWeeks     = getSetISOWeek;
	    momentPrototype__proto.weeksInYear    = getWeeksInYear;
	    momentPrototype__proto.isoWeeksInYear = getISOWeeksInYear;
	
	    // Day
	    momentPrototype__proto.date       = getSetDayOfMonth;
	    momentPrototype__proto.day        = momentPrototype__proto.days             = getSetDayOfWeek;
	    momentPrototype__proto.weekday    = getSetLocaleDayOfWeek;
	    momentPrototype__proto.isoWeekday = getSetISODayOfWeek;
	    momentPrototype__proto.dayOfYear  = getSetDayOfYear;
	
	    // Hour
	    momentPrototype__proto.hour = momentPrototype__proto.hours = getSetHour;
	
	    // Minute
	    momentPrototype__proto.minute = momentPrototype__proto.minutes = getSetMinute;
	
	    // Second
	    momentPrototype__proto.second = momentPrototype__proto.seconds = getSetSecond;
	
	    // Millisecond
	    momentPrototype__proto.millisecond = momentPrototype__proto.milliseconds = getSetMillisecond;
	
	    // Offset
	    momentPrototype__proto.utcOffset            = getSetOffset;
	    momentPrototype__proto.utc                  = setOffsetToUTC;
	    momentPrototype__proto.local                = setOffsetToLocal;
	    momentPrototype__proto.parseZone            = setOffsetToParsedOffset;
	    momentPrototype__proto.hasAlignedHourOffset = hasAlignedHourOffset;
	    momentPrototype__proto.isDST                = isDaylightSavingTime;
	    momentPrototype__proto.isDSTShifted         = isDaylightSavingTimeShifted;
	    momentPrototype__proto.isLocal              = isLocal;
	    momentPrototype__proto.isUtcOffset          = isUtcOffset;
	    momentPrototype__proto.isUtc                = isUtc;
	    momentPrototype__proto.isUTC                = isUtc;
	
	    // Timezone
	    momentPrototype__proto.zoneAbbr = getZoneAbbr;
	    momentPrototype__proto.zoneName = getZoneName;
	
	    // Deprecations
	    momentPrototype__proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
	    momentPrototype__proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
	    momentPrototype__proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
	    momentPrototype__proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779', getSetZone);
	
	    var momentPrototype = momentPrototype__proto;
	
	    function moment__createUnix (input) {
	        return local__createLocal(input * 1000);
	    }
	
	    function moment__createInZone () {
	        return local__createLocal.apply(null, arguments).parseZone();
	    }
	
	    var defaultCalendar = {
	        sameDay : '[Today at] LT',
	        nextDay : '[Tomorrow at] LT',
	        nextWeek : 'dddd [at] LT',
	        lastDay : '[Yesterday at] LT',
	        lastWeek : '[Last] dddd [at] LT',
	        sameElse : 'L'
	    };
	
	    function locale_calendar__calendar (key, mom, now) {
	        var output = this._calendar[key];
	        return typeof output === 'function' ? output.call(mom, now) : output;
	    }
	
	    var defaultLongDateFormat = {
	        LTS  : 'h:mm:ss A',
	        LT   : 'h:mm A',
	        L    : 'MM/DD/YYYY',
	        LL   : 'MMMM D, YYYY',
	        LLL  : 'MMMM D, YYYY LT',
	        LLLL : 'dddd, MMMM D, YYYY LT'
	    };
	
	    function longDateFormat (key) {
	        var output = this._longDateFormat[key];
	        if (!output && this._longDateFormat[key.toUpperCase()]) {
	            output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
	                return val.slice(1);
	            });
	            this._longDateFormat[key] = output;
	        }
	        return output;
	    }
	
	    var defaultInvalidDate = 'Invalid date';
	
	    function invalidDate () {
	        return this._invalidDate;
	    }
	
	    var defaultOrdinal = '%d';
	    var defaultOrdinalParse = /\d{1,2}/;
	
	    function ordinal (number) {
	        return this._ordinal.replace('%d', number);
	    }
	
	    function preParsePostFormat (string) {
	        return string;
	    }
	
	    var defaultRelativeTime = {
	        future : 'in %s',
	        past   : '%s ago',
	        s  : 'a few seconds',
	        m  : 'a minute',
	        mm : '%d minutes',
	        h  : 'an hour',
	        hh : '%d hours',
	        d  : 'a day',
	        dd : '%d days',
	        M  : 'a month',
	        MM : '%d months',
	        y  : 'a year',
	        yy : '%d years'
	    };
	
	    function relative__relativeTime (number, withoutSuffix, string, isFuture) {
	        var output = this._relativeTime[string];
	        return (typeof output === 'function') ?
	            output(number, withoutSuffix, string, isFuture) :
	            output.replace(/%d/i, number);
	    }
	
	    function pastFuture (diff, output) {
	        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
	        return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
	    }
	
	    function locale_set__set (config) {
	        var prop, i;
	        for (i in config) {
	            prop = config[i];
	            if (typeof prop === 'function') {
	                this[i] = prop;
	            } else {
	                this['_' + i] = prop;
	            }
	        }
	        // Lenient ordinal parsing accepts just a number in addition to
	        // number + (possibly) stuff coming from _ordinalParseLenient.
	        this._ordinalParseLenient = new RegExp(this._ordinalParse.source + '|' + (/\d{1,2}/).source);
	    }
	
	    var prototype__proto = Locale.prototype;
	
	    prototype__proto._calendar       = defaultCalendar;
	    prototype__proto.calendar        = locale_calendar__calendar;
	    prototype__proto._longDateFormat = defaultLongDateFormat;
	    prototype__proto.longDateFormat  = longDateFormat;
	    prototype__proto._invalidDate    = defaultInvalidDate;
	    prototype__proto.invalidDate     = invalidDate;
	    prototype__proto._ordinal        = defaultOrdinal;
	    prototype__proto.ordinal         = ordinal;
	    prototype__proto._ordinalParse   = defaultOrdinalParse;
	    prototype__proto.preparse        = preParsePostFormat;
	    prototype__proto.postformat      = preParsePostFormat;
	    prototype__proto._relativeTime   = defaultRelativeTime;
	    prototype__proto.relativeTime    = relative__relativeTime;
	    prototype__proto.pastFuture      = pastFuture;
	    prototype__proto.set             = locale_set__set;
	
	    // Month
	    prototype__proto.months       =        localeMonths;
	    prototype__proto._months      = defaultLocaleMonths;
	    prototype__proto.monthsShort  =        localeMonthsShort;
	    prototype__proto._monthsShort = defaultLocaleMonthsShort;
	    prototype__proto.monthsParse  =        localeMonthsParse;
	
	    // Week
	    prototype__proto.week = localeWeek;
	    prototype__proto._week = defaultLocaleWeek;
	    prototype__proto.firstDayOfYear = localeFirstDayOfYear;
	    prototype__proto.firstDayOfWeek = localeFirstDayOfWeek;
	
	    // Day of Week
	    prototype__proto.weekdays       =        localeWeekdays;
	    prototype__proto._weekdays      = defaultLocaleWeekdays;
	    prototype__proto.weekdaysMin    =        localeWeekdaysMin;
	    prototype__proto._weekdaysMin   = defaultLocaleWeekdaysMin;
	    prototype__proto.weekdaysShort  =        localeWeekdaysShort;
	    prototype__proto._weekdaysShort = defaultLocaleWeekdaysShort;
	    prototype__proto.weekdaysParse  =        localeWeekdaysParse;
	
	    // Hours
	    prototype__proto.isPM = localeIsPM;
	    prototype__proto._meridiemParse = defaultLocaleMeridiemParse;
	    prototype__proto.meridiem = localeMeridiem;
	
	    function lists__get (format, index, field, setter) {
	        var locale = locale_locales__getLocale();
	        var utc = create_utc__createUTC().set(setter, index);
	        return locale[field](utc, format);
	    }
	
	    function list (format, index, field, count, setter) {
	        if (typeof format === 'number') {
	            index = format;
	            format = undefined;
	        }
	
	        format = format || '';
	
	        if (index != null) {
	            return lists__get(format, index, field, setter);
	        }
	
	        var i;
	        var out = [];
	        for (i = 0; i < count; i++) {
	            out[i] = lists__get(format, i, field, setter);
	        }
	        return out;
	    }
	
	    function lists__listMonths (format, index) {
	        return list(format, index, 'months', 12, 'month');
	    }
	
	    function lists__listMonthsShort (format, index) {
	        return list(format, index, 'monthsShort', 12, 'month');
	    }
	
	    function lists__listWeekdays (format, index) {
	        return list(format, index, 'weekdays', 7, 'day');
	    }
	
	    function lists__listWeekdaysShort (format, index) {
	        return list(format, index, 'weekdaysShort', 7, 'day');
	    }
	
	    function lists__listWeekdaysMin (format, index) {
	        return list(format, index, 'weekdaysMin', 7, 'day');
	    }
	
	    locale_locales__getSetGlobalLocale('en', {
	        ordinalParse: /\d{1,2}(th|st|nd|rd)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (toInt(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	
	    // Side effect imports
	    utils_hooks__hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', locale_locales__getSetGlobalLocale);
	    utils_hooks__hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', locale_locales__getLocale);
	
	    var mathAbs = Math.abs;
	
	    function duration_abs__abs () {
	        var data           = this._data;
	
	        this._milliseconds = mathAbs(this._milliseconds);
	        this._days         = mathAbs(this._days);
	        this._months       = mathAbs(this._months);
	
	        data.milliseconds  = mathAbs(data.milliseconds);
	        data.seconds       = mathAbs(data.seconds);
	        data.minutes       = mathAbs(data.minutes);
	        data.hours         = mathAbs(data.hours);
	        data.months        = mathAbs(data.months);
	        data.years         = mathAbs(data.years);
	
	        return this;
	    }
	
	    function duration_add_subtract__addSubtract (duration, input, value, direction) {
	        var other = create__createDuration(input, value);
	
	        duration._milliseconds += direction * other._milliseconds;
	        duration._days         += direction * other._days;
	        duration._months       += direction * other._months;
	
	        return duration._bubble();
	    }
	
	    // supports only 2.0-style add(1, 's') or add(duration)
	    function duration_add_subtract__add (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, 1);
	    }
	
	    // supports only 2.0-style subtract(1, 's') or subtract(duration)
	    function duration_add_subtract__subtract (input, value) {
	        return duration_add_subtract__addSubtract(this, input, value, -1);
	    }
	
	    function bubble () {
	        var milliseconds = this._milliseconds;
	        var days         = this._days;
	        var months       = this._months;
	        var data         = this._data;
	        var seconds, minutes, hours, years = 0;
	
	        // The following code bubbles up values, see the tests for
	        // examples of what that means.
	        data.milliseconds = milliseconds % 1000;
	
	        seconds           = absFloor(milliseconds / 1000);
	        data.seconds      = seconds % 60;
	
	        minutes           = absFloor(seconds / 60);
	        data.minutes      = minutes % 60;
	
	        hours             = absFloor(minutes / 60);
	        data.hours        = hours % 24;
	
	        days += absFloor(hours / 24);
	
	        // Accurately convert days to years, assume start from year 0.
	        years = absFloor(daysToYears(days));
	        days -= absFloor(yearsToDays(years));
	
	        // 30 days to a month
	        // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
	        months += absFloor(days / 30);
	        days   %= 30;
	
	        // 12 months -> 1 year
	        years  += absFloor(months / 12);
	        months %= 12;
	
	        data.days   = days;
	        data.months = months;
	        data.years  = years;
	
	        return this;
	    }
	
	    function daysToYears (days) {
	        // 400 years have 146097 days (taking into account leap year rules)
	        return days * 400 / 146097;
	    }
	
	    function yearsToDays (years) {
	        // years * 365 + absFloor(years / 4) -
	        //     absFloor(years / 100) + absFloor(years / 400);
	        return years * 146097 / 400;
	    }
	
	    function as (units) {
	        var days;
	        var months;
	        var milliseconds = this._milliseconds;
	
	        units = normalizeUnits(units);
	
	        if (units === 'month' || units === 'year') {
	            days   = this._days   + milliseconds / 864e5;
	            months = this._months + daysToYears(days) * 12;
	            return units === 'month' ? months : months / 12;
	        } else {
	            // handle milliseconds separately because of floating point math errors (issue #1867)
	            days = this._days + Math.round(yearsToDays(this._months / 12));
	            switch (units) {
	                case 'week'   : return days / 7     + milliseconds / 6048e5;
	                case 'day'    : return days         + milliseconds / 864e5;
	                case 'hour'   : return days * 24    + milliseconds / 36e5;
	                case 'minute' : return days * 1440  + milliseconds / 6e4;
	                case 'second' : return days * 86400 + milliseconds / 1000;
	                // Math.floor prevents floating point math errors here
	                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
	                default: throw new Error('Unknown unit ' + units);
	            }
	        }
	    }
	
	    // TODO: Use this.as('ms')?
	    function duration_as__valueOf () {
	        return (
	            this._milliseconds +
	            this._days * 864e5 +
	            (this._months % 12) * 2592e6 +
	            toInt(this._months / 12) * 31536e6
	        );
	    }
	
	    function makeAs (alias) {
	        return function () {
	            return this.as(alias);
	        };
	    }
	
	    var asMilliseconds = makeAs('ms');
	    var asSeconds      = makeAs('s');
	    var asMinutes      = makeAs('m');
	    var asHours        = makeAs('h');
	    var asDays         = makeAs('d');
	    var asWeeks        = makeAs('w');
	    var asMonths       = makeAs('M');
	    var asYears        = makeAs('y');
	
	    function duration_get__get (units) {
	        units = normalizeUnits(units);
	        return this[units + 's']();
	    }
	
	    function makeGetter(name) {
	        return function () {
	            return this._data[name];
	        };
	    }
	
	    var duration_get__milliseconds = makeGetter('milliseconds');
	    var seconds      = makeGetter('seconds');
	    var minutes      = makeGetter('minutes');
	    var hours        = makeGetter('hours');
	    var days         = makeGetter('days');
	    var months       = makeGetter('months');
	    var years        = makeGetter('years');
	
	    function weeks () {
	        return absFloor(this.days() / 7);
	    }
	
	    var round = Math.round;
	    var thresholds = {
	        s: 45,  // seconds to minute
	        m: 45,  // minutes to hour
	        h: 22,  // hours to day
	        d: 26,  // days to month
	        M: 11   // months to year
	    };
	
	    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
	    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
	        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
	    }
	
	    function duration_humanize__relativeTime (posNegDuration, withoutSuffix, locale) {
	        var duration = create__createDuration(posNegDuration).abs();
	        var seconds  = round(duration.as('s'));
	        var minutes  = round(duration.as('m'));
	        var hours    = round(duration.as('h'));
	        var days     = round(duration.as('d'));
	        var months   = round(duration.as('M'));
	        var years    = round(duration.as('y'));
	
	        var a = seconds < thresholds.s && ['s', seconds]  ||
	                minutes === 1          && ['m']           ||
	                minutes < thresholds.m && ['mm', minutes] ||
	                hours   === 1          && ['h']           ||
	                hours   < thresholds.h && ['hh', hours]   ||
	                days    === 1          && ['d']           ||
	                days    < thresholds.d && ['dd', days]    ||
	                months  === 1          && ['M']           ||
	                months  < thresholds.M && ['MM', months]  ||
	                years   === 1          && ['y']           || ['yy', years];
	
	        a[2] = withoutSuffix;
	        a[3] = +posNegDuration > 0;
	        a[4] = locale;
	        return substituteTimeAgo.apply(null, a);
	    }
	
	    // This function allows you to set a threshold for relative time strings
	    function duration_humanize__getSetRelativeTimeThreshold (threshold, limit) {
	        if (thresholds[threshold] === undefined) {
	            return false;
	        }
	        if (limit === undefined) {
	            return thresholds[threshold];
	        }
	        thresholds[threshold] = limit;
	        return true;
	    }
	
	    function humanize (withSuffix) {
	        var locale = this.localeData();
	        var output = duration_humanize__relativeTime(this, !withSuffix, locale);
	
	        if (withSuffix) {
	            output = locale.pastFuture(+this, output);
	        }
	
	        return locale.postformat(output);
	    }
	
	    var iso_string__abs = Math.abs;
	
	    function iso_string__toISOString() {
	        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
	        var Y = iso_string__abs(this.years());
	        var M = iso_string__abs(this.months());
	        var D = iso_string__abs(this.days());
	        var h = iso_string__abs(this.hours());
	        var m = iso_string__abs(this.minutes());
	        var s = iso_string__abs(this.seconds() + this.milliseconds() / 1000);
	        var total = this.asSeconds();
	
	        if (!total) {
	            // this is the same as C#'s (Noda) and python (isodate)...
	            // but not other JS (goog.date)
	            return 'P0D';
	        }
	
	        return (total < 0 ? '-' : '') +
	            'P' +
	            (Y ? Y + 'Y' : '') +
	            (M ? M + 'M' : '') +
	            (D ? D + 'D' : '') +
	            ((h || m || s) ? 'T' : '') +
	            (h ? h + 'H' : '') +
	            (m ? m + 'M' : '') +
	            (s ? s + 'S' : '');
	    }
	
	    var duration_prototype__proto = Duration.prototype;
	
	    duration_prototype__proto.abs            = duration_abs__abs;
	    duration_prototype__proto.add            = duration_add_subtract__add;
	    duration_prototype__proto.subtract       = duration_add_subtract__subtract;
	    duration_prototype__proto.as             = as;
	    duration_prototype__proto.asMilliseconds = asMilliseconds;
	    duration_prototype__proto.asSeconds      = asSeconds;
	    duration_prototype__proto.asMinutes      = asMinutes;
	    duration_prototype__proto.asHours        = asHours;
	    duration_prototype__proto.asDays         = asDays;
	    duration_prototype__proto.asWeeks        = asWeeks;
	    duration_prototype__proto.asMonths       = asMonths;
	    duration_prototype__proto.asYears        = asYears;
	    duration_prototype__proto.valueOf        = duration_as__valueOf;
	    duration_prototype__proto._bubble        = bubble;
	    duration_prototype__proto.get            = duration_get__get;
	    duration_prototype__proto.milliseconds   = duration_get__milliseconds;
	    duration_prototype__proto.seconds        = seconds;
	    duration_prototype__proto.minutes        = minutes;
	    duration_prototype__proto.hours          = hours;
	    duration_prototype__proto.days           = days;
	    duration_prototype__proto.weeks          = weeks;
	    duration_prototype__proto.months         = months;
	    duration_prototype__proto.years          = years;
	    duration_prototype__proto.humanize       = humanize;
	    duration_prototype__proto.toISOString    = iso_string__toISOString;
	    duration_prototype__proto.toString       = iso_string__toISOString;
	    duration_prototype__proto.toJSON         = iso_string__toISOString;
	    duration_prototype__proto.locale         = locale;
	    duration_prototype__proto.localeData     = localeData;
	
	    // Deprecations
	    duration_prototype__proto.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', iso_string__toISOString);
	    duration_prototype__proto.lang = lang;
	
	    // Side effect imports
	
	    addFormatToken('X', 0, 0, 'unix');
	    addFormatToken('x', 0, 0, 'valueOf');
	
	    // PARSING
	
	    addRegexToken('x', matchSigned);
	    addRegexToken('X', matchTimestamp);
	    addParseToken('X', function (input, array, config) {
	        config._d = new Date(parseFloat(input, 10) * 1000);
	    });
	    addParseToken('x', function (input, array, config) {
	        config._d = new Date(toInt(input));
	    });
	
	    // Side effect imports
	
	
	    utils_hooks__hooks.version = '2.10.3';
	
	    setHookCallback(local__createLocal);
	
	    utils_hooks__hooks.fn                    = momentPrototype;
	    utils_hooks__hooks.min                   = min;
	    utils_hooks__hooks.max                   = max;
	    utils_hooks__hooks.utc                   = create_utc__createUTC;
	    utils_hooks__hooks.unix                  = moment__createUnix;
	    utils_hooks__hooks.months                = lists__listMonths;
	    utils_hooks__hooks.isDate                = isDate;
	    utils_hooks__hooks.locale                = locale_locales__getSetGlobalLocale;
	    utils_hooks__hooks.invalid               = valid__createInvalid;
	    utils_hooks__hooks.duration              = create__createDuration;
	    utils_hooks__hooks.isMoment              = isMoment;
	    utils_hooks__hooks.weekdays              = lists__listWeekdays;
	    utils_hooks__hooks.parseZone             = moment__createInZone;
	    utils_hooks__hooks.localeData            = locale_locales__getLocale;
	    utils_hooks__hooks.isDuration            = isDuration;
	    utils_hooks__hooks.monthsShort           = lists__listMonthsShort;
	    utils_hooks__hooks.weekdaysMin           = lists__listWeekdaysMin;
	    utils_hooks__hooks.defineLocale          = defineLocale;
	    utils_hooks__hooks.weekdaysShort         = lists__listWeekdaysShort;
	    utils_hooks__hooks.normalizeUnits        = normalizeUnits;
	    utils_hooks__hooks.relativeTimeThreshold = duration_humanize__getSetRelativeTimeThreshold;
	
	    var _moment = utils_hooks__hooks;
	
	    return _moment;
	
	}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(210)(module)))

/***/ },
/* 210 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 211 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : afrikaans (af)
	//! author : Werner Mollentze : https://github.com/wernerm
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var af = moment.defineLocale('af', {
	        months : 'Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des'.split('_'),
	        weekdays : 'Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag'.split('_'),
	        weekdaysShort : 'Son_Maa_Din_Woe_Don_Vry_Sat'.split('_'),
	        weekdaysMin : 'So_Ma_Di_Wo_Do_Vr_Sa'.split('_'),
	        meridiemParse: /vm|nm/i,
	        isPM : function (input) {
	            return /^nm$/i.test(input);
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower ? 'vm' : 'VM';
	            } else {
	                return isLower ? 'nm' : 'NM';
	            }
	        },
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Vandag om] LT',
	            nextDay : '[Môre om] LT',
	            nextWeek : 'dddd [om] LT',
	            lastDay : '[Gister om] LT',
	            lastWeek : '[Laas] dddd [om] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'oor %s',
	            past : '%s gelede',
	            s : '\'n paar sekondes',
	            m : '\'n minuut',
	            mm : '%d minute',
	            h : '\'n uur',
	            hh : '%d ure',
	            d : '\'n dag',
	            dd : '%d dae',
	            M : '\'n maand',
	            MM : '%d maande',
	            y : '\'n jaar',
	            yy : '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de'); // Thanks to Joris Röling : https://github.com/jjupiter
	        },
	        week : {
	            dow : 1, // Maandag is die eerste dag van die week.
	            doy : 4  // Die week wat die 4de Januarie bevat is die eerste week van die jaar.
	        }
	    });
	
	    return af;
	
	}));

/***/ },
/* 212 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! Locale: Arabic (ar)
	//! Author: Abdel Said: https://github.com/abdelsaid
	//! Changes in months, weekdays: Ahmed Elkhatib
	//! Native plural forms: forabi https://github.com/forabi
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '١',
	        '2': '٢',
	        '3': '٣',
	        '4': '٤',
	        '5': '٥',
	        '6': '٦',
	        '7': '٧',
	        '8': '٨',
	        '9': '٩',
	        '0': '٠'
	    }, numberMap = {
	        '١': '1',
	        '٢': '2',
	        '٣': '3',
	        '٤': '4',
	        '٥': '5',
	        '٦': '6',
	        '٧': '7',
	        '٨': '8',
	        '٩': '9',
	        '٠': '0'
	    }, pluralForm = function (n) {
	        return n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5;
	    }, plurals = {
	        s : ['أقل من ثانية', 'ثانية واحدة', ['ثانيتان', 'ثانيتين'], '%d ثوان', '%d ثانية', '%d ثانية'],
	        m : ['أقل من دقيقة', 'دقيقة واحدة', ['دقيقتان', 'دقيقتين'], '%d دقائق', '%d دقيقة', '%d دقيقة'],
	        h : ['أقل من ساعة', 'ساعة واحدة', ['ساعتان', 'ساعتين'], '%d ساعات', '%d ساعة', '%d ساعة'],
	        d : ['أقل من يوم', 'يوم واحد', ['يومان', 'يومين'], '%d أيام', '%d يومًا', '%d يوم'],
	        M : ['أقل من شهر', 'شهر واحد', ['شهران', 'شهرين'], '%d أشهر', '%d شهرا', '%d شهر'],
	        y : ['أقل من عام', 'عام واحد', ['عامان', 'عامين'], '%d أعوام', '%d عامًا', '%d عام']
	    }, pluralize = function (u) {
	        return function (number, withoutSuffix, string, isFuture) {
	            var f = pluralForm(number),
	                str = plurals[u][pluralForm(number)];
	            if (f === 2) {
	                str = str[withoutSuffix ? 0 : 1];
	            }
	            return str.replace(/%d/i, number);
	        };
	    }, months = [
	        'كانون الثاني يناير',
	        'شباط فبراير',
	        'آذار مارس',
	        'نيسان أبريل',
	        'أيار مايو',
	        'حزيران يونيو',
	        'تموز يوليو',
	        'آب أغسطس',
	        'أيلول سبتمبر',
	        'تشرين الأول أكتوبر',
	        'تشرين الثاني نوفمبر',
	        'كانون الأول ديسمبر'
	    ];
	
	    var ar = moment.defineLocale('ar', {
	        months : months,
	        monthsShort : months,
	        weekdays : 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort : 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'D/\u200FM/\u200FYYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        meridiemParse: /ص|م/,
	        isPM : function (input) {
	            return 'م' === input;
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ص';
	            } else {
	                return 'م';
	            }
	        },
	        calendar : {
	            sameDay: '[اليوم عند الساعة] LT',
	            nextDay: '[غدًا عند الساعة] LT',
	            nextWeek: 'dddd [عند الساعة] LT',
	            lastDay: '[أمس عند الساعة] LT',
	            lastWeek: 'dddd [عند الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'بعد %s',
	            past : 'منذ %s',
	            s : pluralize('s'),
	            m : pluralize('m'),
	            mm : pluralize('m'),
	            h : pluralize('h'),
	            hh : pluralize('h'),
	            d : pluralize('d'),
	            dd : pluralize('d'),
	            M : pluralize('M'),
	            MM : pluralize('M'),
	            y : pluralize('y'),
	            yy : pluralize('y')
	        },
	        preparse: function (string) {
	            return string.replace(/\u200f/g, '').replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar;
	
	}));

/***/ },
/* 213 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Moroccan Arabic (ar-ma)
	//! author : ElFadili Yassine : https://github.com/ElFadiliY
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ar_ma = moment.defineLocale('ar-ma', {
	        months : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
	        monthsShort : 'يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر'.split('_'),
	        weekdays : 'الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort : 'احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'في %s',
	            past : 'منذ %s',
	            s : 'ثوان',
	            m : 'دقيقة',
	            mm : '%d دقائق',
	            h : 'ساعة',
	            hh : '%d ساعات',
	            d : 'يوم',
	            dd : '%d أيام',
	            M : 'شهر',
	            MM : '%d أشهر',
	            y : 'سنة',
	            yy : '%d سنوات'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar_ma;
	
	}));

/***/ },
/* 214 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Arabic Saudi Arabia (ar-sa)
	//! author : Suhail Alkowaileet : https://github.com/xsoh
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '١',
	        '2': '٢',
	        '3': '٣',
	        '4': '٤',
	        '5': '٥',
	        '6': '٦',
	        '7': '٧',
	        '8': '٨',
	        '9': '٩',
	        '0': '٠'
	    }, numberMap = {
	        '١': '1',
	        '٢': '2',
	        '٣': '3',
	        '٤': '4',
	        '٥': '5',
	        '٦': '6',
	        '٧': '7',
	        '٨': '8',
	        '٩': '9',
	        '٠': '0'
	    };
	
	    var ar_sa = moment.defineLocale('ar-sa', {
	        months : 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        monthsShort : 'يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        weekdays : 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort : 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin : 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        meridiemParse: /ص|م/,
	        isPM : function (input) {
	            return 'م' === input;
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ص';
	            } else {
	                return 'م';
	            }
	        },
	        calendar : {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'في %s',
	            past : 'منذ %s',
	            s : 'ثوان',
	            m : 'دقيقة',
	            mm : '%d دقائق',
	            h : 'ساعة',
	            hh : '%d ساعات',
	            d : 'يوم',
	            dd : '%d أيام',
	            M : 'شهر',
	            MM : '%d أشهر',
	            y : 'سنة',
	            yy : '%d سنوات'
	        },
	        preparse: function (string) {
	            return string.replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ar_sa;
	
	}));

/***/ },
/* 215 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale  : Tunisian Arabic (ar-tn)
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ar_tn = moment.defineLocale('ar-tn', {
	        months: 'جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        monthsShort: 'جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر'.split('_'),
	        weekdays: 'الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت'.split('_'),
	        weekdaysShort: 'أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت'.split('_'),
	        weekdaysMin: 'ح_ن_ث_ر_خ_ج_س'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[اليوم على الساعة] LT',
	            nextDay: '[غدا على الساعة] LT',
	            nextWeek: 'dddd [على الساعة] LT',
	            lastDay: '[أمس على الساعة] LT',
	            lastWeek: 'dddd [على الساعة] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'في %s',
	            past: 'منذ %s',
	            s: 'ثوان',
	            m: 'دقيقة',
	            mm: '%d دقائق',
	            h: 'ساعة',
	            hh: '%d ساعات',
	            d: 'يوم',
	            dd: '%d أيام',
	            M: 'شهر',
	            MM: '%d أشهر',
	            y: 'سنة',
	            yy: '%d سنوات'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return ar_tn;
	
	}));

/***/ },
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : azerbaijani (az)
	//! author : topchiyev : https://github.com/topchiyev
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var suffixes = {
	        1: '-inci',
	        5: '-inci',
	        8: '-inci',
	        70: '-inci',
	        80: '-inci',
	        2: '-nci',
	        7: '-nci',
	        20: '-nci',
	        50: '-nci',
	        3: '-üncü',
	        4: '-üncü',
	        100: '-üncü',
	        6: '-ncı',
	        9: '-uncu',
	        10: '-uncu',
	        30: '-uncu',
	        60: '-ıncı',
	        90: '-ıncı'
	    };
	
	    var az = moment.defineLocale('az', {
	        months : 'yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr'.split('_'),
	        monthsShort : 'yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek'.split('_'),
	        weekdays : 'Bazar_Bazar ertəsi_Çərşənbə axşamı_Çərşənbə_Cümə axşamı_Cümə_Şənbə'.split('_'),
	        weekdaysShort : 'Baz_BzE_ÇAx_Çər_CAx_Cüm_Şən'.split('_'),
	        weekdaysMin : 'Bz_BE_ÇA_Çə_CA_Cü_Şə'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[bugün saat] LT',
	            nextDay : '[sabah saat] LT',
	            nextWeek : '[gələn həftə] dddd [saat] LT',
	            lastDay : '[dünən] LT',
	            lastWeek : '[keçən həftə] dddd [saat] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s sonra',
	            past : '%s əvvəl',
	            s : 'birneçə saniyyə',
	            m : 'bir dəqiqə',
	            mm : '%d dəqiqə',
	            h : 'bir saat',
	            hh : '%d saat',
	            d : 'bir gün',
	            dd : '%d gün',
	            M : 'bir ay',
	            MM : '%d ay',
	            y : 'bir il',
	            yy : '%d il'
	        },
	        meridiemParse: /gecə|səhər|gündüz|axşam/,
	        isPM : function (input) {
	            return /^(gündüz|axşam)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'gecə';
	            } else if (hour < 12) {
	                return 'səhər';
	            } else if (hour < 17) {
	                return 'gündüz';
	            } else {
	                return 'axşam';
	            }
	        },
	        ordinalParse: /\d{1,2}-(ıncı|inci|nci|üncü|ncı|uncu)/,
	        ordinal : function (number) {
	            if (number === 0) {  // special case for zero
	                return number + '-ıncı';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;
	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return az;
	
	}));

/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : belarusian (be)
	//! author : Dmitry Demidov : https://github.com/demidov91
	//! author: Praleska: http://praleska.pro/
	//! Author : Menelion Elensúle : https://github.com/Oire
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? 'хвіліна_хвіліны_хвілін' : 'хвіліну_хвіліны_хвілін',
	            'hh': withoutSuffix ? 'гадзіна_гадзіны_гадзін' : 'гадзіну_гадзіны_гадзін',
	            'dd': 'дзень_дні_дзён',
	            'MM': 'месяц_месяцы_месяцаў',
	            'yy': 'год_гады_гадоў'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'хвіліна' : 'хвіліну';
	        }
	        else if (key === 'h') {
	            return withoutSuffix ? 'гадзіна' : 'гадзіну';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'студзень_люты_сакавік_красавік_травень_чэрвень_ліпень_жнівень_верасень_кастрычнік_лістапад_снежань'.split('_'),
	            'accusative': 'студзеня_лютага_сакавіка_красавіка_траўня_чэрвеня_ліпеня_жніўня_верасня_кастрычніка_лістапада_снежня'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'нядзеля_панядзелак_аўторак_серада_чацвер_пятніца_субота'.split('_'),
	            'accusative': 'нядзелю_панядзелак_аўторак_сераду_чацвер_пятніцу_суботу'.split('_')
	        },
	        nounCase = (/\[ ?[Вв] ?(?:мінулую|наступную)? ?\] ?dddd/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var be = moment.defineLocale('be', {
	        months : monthsCaseReplace,
	        monthsShort : 'студ_лют_сак_крас_трав_чэрв_ліп_жнів_вер_каст_ліст_снеж'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
	        weekdaysMin : 'нд_пн_ат_ср_чц_пт_сб'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY г.',
	            LLL : 'D MMMM YYYY г., LT',
	            LLLL : 'dddd, D MMMM YYYY г., LT'
	        },
	        calendar : {
	            sameDay: '[Сёння ў] LT',
	            nextDay: '[Заўтра ў] LT',
	            lastDay: '[Учора ў] LT',
	            nextWeek: function () {
	                return '[У] dddd [ў] LT';
	            },
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 5:
	                case 6:
	                    return '[У мінулую] dddd [ў] LT';
	                case 1:
	                case 2:
	                case 4:
	                    return '[У мінулы] dddd [ў] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'праз %s',
	            past : '%s таму',
	            s : 'некалькі секунд',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : relativeTimeWithPlural,
	            hh : relativeTimeWithPlural,
	            d : 'дзень',
	            dd : relativeTimeWithPlural,
	            M : 'месяц',
	            MM : relativeTimeWithPlural,
	            y : 'год',
	            yy : relativeTimeWithPlural
	        },
	        meridiemParse: /ночы|раніцы|дня|вечара/,
	        isPM : function (input) {
	            return /^(дня|вечара)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночы';
	            } else if (hour < 12) {
	                return 'раніцы';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечара';
	            }
	        },
	        ordinalParse: /\d{1,2}-(і|ы|га)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	            case 'w':
	            case 'W':
	                return (number % 10 === 2 || number % 10 === 3) && (number % 100 !== 12 && number % 100 !== 13) ? number + '-і' : number + '-ы';
	            case 'D':
	                return number + '-га';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return be;
	
	}));

/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : bulgarian (bg)
	//! author : Krasen Borisov : https://github.com/kraz
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var bg = moment.defineLocale('bg', {
	        months : 'януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември'.split('_'),
	        monthsShort : 'янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек'.split('_'),
	        weekdays : 'неделя_понеделник_вторник_сряда_четвъртък_петък_събота'.split('_'),
	        weekdaysShort : 'нед_пон_вто_сря_чет_пет_съб'.split('_'),
	        weekdaysMin : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'D.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Днес в] LT',
	            nextDay : '[Утре в] LT',
	            nextWeek : 'dddd [в] LT',
	            lastDay : '[Вчера в] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[В изминалата] dddd [в] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[В изминалия] dddd [в] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'след %s',
	            past : 'преди %s',
	            s : 'няколко секунди',
	            m : 'минута',
	            mm : '%d минути',
	            h : 'час',
	            hh : '%d часа',
	            d : 'ден',
	            dd : '%d дни',
	            M : 'месец',
	            MM : '%d месеца',
	            y : 'година',
	            yy : '%d години'
	        },
	        ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bg;
	
	}));

/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bengali (bn)
	//! author : Kaushik Gandhi : https://github.com/kaushikgandhi
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '১',
	        '2': '২',
	        '3': '৩',
	        '4': '৪',
	        '5': '৫',
	        '6': '৬',
	        '7': '৭',
	        '8': '৮',
	        '9': '৯',
	        '0': '০'
	    },
	    numberMap = {
	        '১': '1',
	        '২': '2',
	        '৩': '3',
	        '৪': '4',
	        '৫': '5',
	        '৬': '6',
	        '৭': '7',
	        '৮': '8',
	        '৯': '9',
	        '০': '0'
	    };
	
	    var bn = moment.defineLocale('bn', {
	        months : 'জানুয়ারী_ফেবুয়ারী_মার্চ_এপ্রিল_মে_জুন_জুলাই_অগাস্ট_সেপ্টেম্বর_অক্টোবর_নভেম্বর_ডিসেম্বর'.split('_'),
	        monthsShort : 'জানু_ফেব_মার্চ_এপর_মে_জুন_জুল_অগ_সেপ্ট_অক্টো_নভ_ডিসেম্'.split('_'),
	        weekdays : 'রবিবার_সোমবার_মঙ্গলবার_বুধবার_বৃহস্পত্তিবার_শুক্রুবার_শনিবার'.split('_'),
	        weekdaysShort : 'রবি_সোম_মঙ্গল_বুধ_বৃহস্পত্তি_শুক্রু_শনি'.split('_'),
	        weekdaysMin : 'রব_সম_মঙ্গ_বু_ব্রিহ_শু_শনি'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm সময়',
	            LTS : 'A h:mm:ss সময়',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[আজ] LT',
	            nextDay : '[আগামীকাল] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[গতকাল] LT',
	            lastWeek : '[গত] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s পরে',
	            past : '%s আগে',
	            s : 'কএক সেকেন্ড',
	            m : 'এক মিনিট',
	            mm : '%d মিনিট',
	            h : 'এক ঘন্টা',
	            hh : '%d ঘন্টা',
	            d : 'এক দিন',
	            dd : '%d দিন',
	            M : 'এক মাস',
	            MM : '%d মাস',
	            y : 'এক বছর',
	            yy : '%d বছর'
	        },
	        preparse: function (string) {
	            return string.replace(/[১২৩৪৫৬৭৮৯০]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /রাত|শকাল|দুপুর|বিকেল|রাত/,
	        isPM: function (input) {
	            return /^(দুপুর|বিকেল|রাত)$/.test(input);
	        },
	        //Bengali is a vast language its spoken
	        //in different forms in various parts of the world.
	        //I have just generalized with most common one used
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'রাত';
	            } else if (hour < 10) {
	                return 'শকাল';
	            } else if (hour < 17) {
	                return 'দুপুর';
	            } else if (hour < 20) {
	                return 'বিকেল';
	            } else {
	                return 'রাত';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bn;
	
	}));

/***/ },
/* 220 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : tibetan (bo)
	//! author : Thupten N. Chakrishar : https://github.com/vajradog
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '༡',
	        '2': '༢',
	        '3': '༣',
	        '4': '༤',
	        '5': '༥',
	        '6': '༦',
	        '7': '༧',
	        '8': '༨',
	        '9': '༩',
	        '0': '༠'
	    },
	    numberMap = {
	        '༡': '1',
	        '༢': '2',
	        '༣': '3',
	        '༤': '4',
	        '༥': '5',
	        '༦': '6',
	        '༧': '7',
	        '༨': '8',
	        '༩': '9',
	        '༠': '0'
	    };
	
	    var bo = moment.defineLocale('bo', {
	        months : 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
	        monthsShort : 'ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ'.split('_'),
	        weekdays : 'གཟའ་ཉི་མ་_གཟའ་ཟླ་བ་_གཟའ་མིག་དམར་_གཟའ་ལྷག་པ་_གཟའ་ཕུར་བུ_གཟའ་པ་སངས་_གཟའ་སྤེན་པ་'.split('_'),
	        weekdaysShort : 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
	        weekdaysMin : 'ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[དི་རིང] LT',
	            nextDay : '[སང་ཉིན] LT',
	            nextWeek : '[བདུན་ཕྲག་རྗེས་མ], LT',
	            lastDay : '[ཁ་སང] LT',
	            lastWeek : '[བདུན་ཕྲག་མཐའ་མ] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s ལ་',
	            past : '%s སྔན་ལ',
	            s : 'ལམ་སང',
	            m : 'སྐར་མ་གཅིག',
	            mm : '%d སྐར་མ',
	            h : 'ཆུ་ཚོད་གཅིག',
	            hh : '%d ཆུ་ཚོད',
	            d : 'ཉིན་གཅིག',
	            dd : '%d ཉིན་',
	            M : 'ཟླ་བ་གཅིག',
	            MM : '%d ཟླ་བ',
	            y : 'ལོ་གཅིག',
	            yy : '%d ལོ'
	        },
	        preparse: function (string) {
	            return string.replace(/[༡༢༣༤༥༦༧༨༩༠]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /མཚན་མོ|ཞོགས་ཀས|ཉིན་གུང|དགོང་དག|མཚན་མོ/,
	        isPM: function (input) {
	            return /^(ཉིན་གུང|དགོང་དག|མཚན་མོ)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'མཚན་མོ';
	            } else if (hour < 10) {
	                return 'ཞོགས་ཀས';
	            } else if (hour < 17) {
	                return 'ཉིན་གུང';
	            } else if (hour < 20) {
	                return 'དགོང་དག';
	            } else {
	                return 'མཚན་མོ';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bo;
	
	}));

/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : breton (br)
	//! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function relativeTimeWithMutation(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'munutenn',
	            'MM': 'miz',
	            'dd': 'devezh'
	        };
	        return number + ' ' + mutation(format[key], number);
	    }
	    function specialMutationForYears(number) {
	        switch (lastNumber(number)) {
	        case 1:
	        case 3:
	        case 4:
	        case 5:
	        case 9:
	            return number + ' bloaz';
	        default:
	            return number + ' vloaz';
	        }
	    }
	    function lastNumber(number) {
	        if (number > 9) {
	            return lastNumber(number % 10);
	        }
	        return number;
	    }
	    function mutation(text, number) {
	        if (number === 2) {
	            return softMutation(text);
	        }
	        return text;
	    }
	    function softMutation(text) {
	        var mutationTable = {
	            'm': 'v',
	            'b': 'v',
	            'd': 'z'
	        };
	        if (mutationTable[text.charAt(0)] === undefined) {
	            return text;
	        }
	        return mutationTable[text.charAt(0)] + text.substring(1);
	    }
	
	    var br = moment.defineLocale('br', {
	        months : 'Genver_C\'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu'.split('_'),
	        monthsShort : 'Gen_C\'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker'.split('_'),
	        weekdays : 'Sul_Lun_Meurzh_Merc\'her_Yaou_Gwener_Sadorn'.split('_'),
	        weekdaysShort : 'Sul_Lun_Meu_Mer_Yao_Gwe_Sad'.split('_'),
	        weekdaysMin : 'Su_Lu_Me_Mer_Ya_Gw_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h[e]mm A',
	            LTS : 'h[e]mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D [a viz] MMMM YYYY',
	            LLL : 'D [a viz] MMMM YYYY LT',
	            LLLL : 'dddd, D [a viz] MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Hiziv da] LT',
	            nextDay : '[Warc\'hoazh da] LT',
	            nextWeek : 'dddd [da] LT',
	            lastDay : '[Dec\'h da] LT',
	            lastWeek : 'dddd [paset da] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'a-benn %s',
	            past : '%s \'zo',
	            s : 'un nebeud segondennoù',
	            m : 'ur vunutenn',
	            mm : relativeTimeWithMutation,
	            h : 'un eur',
	            hh : '%d eur',
	            d : 'un devezh',
	            dd : relativeTimeWithMutation,
	            M : 'ur miz',
	            MM : relativeTimeWithMutation,
	            y : 'ur bloaz',
	            yy : specialMutationForYears
	        },
	        ordinalParse: /\d{1,2}(añ|vet)/,
	        ordinal : function (number) {
	            var output = (number === 1) ? 'añ' : 'vet';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return br;
	
	}));

/***/ },
/* 222 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : bosnian (bs)
	//! author : Nedim Cholich : https://github.com/frontyard
	//! based on (hr) translation by Bojan Marković
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }
	
	    var bs = moment.defineLocale('bs', {
	        months : 'januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar'.split('_'),
	        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
	        weekdaysShort : 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
	        weekdaysMin : 'ne_po_ut_sr_če_pe_su'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[jučer u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[prošlu] dddd [u] LT';
	                case 6:
	                    return '[prošle] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'par sekundi',
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : 'dan',
	            dd     : translate,
	            M      : 'mjesec',
	            MM     : translate,
	            y      : 'godinu',
	            yy     : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return bs;
	
	}));

/***/ },
/* 223 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : catalan (ca)
	//! author : Juan G. Hurtado : https://github.com/juanghurtado
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ca = moment.defineLocale('ca', {
	        months : 'gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre'.split('_'),
	        monthsShort : 'gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.'.split('_'),
	        weekdays : 'diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte'.split('_'),
	        weekdaysShort : 'dg._dl._dt._dc._dj._dv._ds.'.split('_'),
	        weekdaysMin : 'Dg_Dl_Dt_Dc_Dj_Dv_Ds'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[avui a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextDay : function () {
	                return '[demà a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastDay : function () {
	                return '[ahir a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [passat a ' + ((this.hours() !== 1) ? 'les' : 'la') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'en %s',
	            past : 'fa %s',
	            s : 'uns segons',
	            m : 'un minut',
	            mm : '%d minuts',
	            h : 'una hora',
	            hh : '%d hores',
	            d : 'un dia',
	            dd : '%d dies',
	            M : 'un mes',
	            MM : '%d mesos',
	            y : 'un any',
	            yy : '%d anys'
	        },
	        ordinalParse: /\d{1,2}(r|n|t|è|a)/,
	        ordinal : function (number, period) {
	            var output = (number === 1) ? 'r' :
	                (number === 2) ? 'n' :
	                (number === 3) ? 'r' :
	                (number === 4) ? 't' : 'è';
	            if (period === 'w' || period === 'W') {
	                output = 'a';
	            }
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return ca;
	
	}));

/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : czech (cs)
	//! author : petrbela : https://github.com/petrbela
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var months = 'leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec'.split('_'),
	        monthsShort = 'led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro'.split('_');
	    function plural(n) {
	        return (n > 1) && (n < 5) && (~~(n / 10) !== 1);
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'pár sekund' : 'pár sekundami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'minuta' : (isFuture ? 'minutu' : 'minutou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'minuty' : 'minut');
	            } else {
	                return result + 'minutami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hodin');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'den' : 'dnem';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dny' : 'dní');
	            } else {
	                return result + 'dny';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'měsíc' : 'měsícem';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'měsíce' : 'měsíců');
	            } else {
	                return result + 'měsíci';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokem';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'let');
	            } else {
	                return result + 'lety';
	            }
	            break;
	        }
	    }
	
	    var cs = moment.defineLocale('cs', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : 'neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota'.split('_'),
	        weekdaysShort : 'ne_po_út_st_čt_pá_so'.split('_'),
	        weekdaysMin : 'ne_po_út_st_čt_pá_so'.split('_'),
	        longDateFormat : {
	            LT: 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[dnes v] LT',
	            nextDay: '[zítra v] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v neděli v] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [v] LT';
	                case 3:
	                    return '[ve středu v] LT';
	                case 4:
	                    return '[ve čtvrtek v] LT';
	                case 5:
	                    return '[v pátek v] LT';
	                case 6:
	                    return '[v sobotu v] LT';
	                }
	            },
	            lastDay: '[včera v] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minulou neděli v] LT';
	                case 1:
	                case 2:
	                    return '[minulé] dddd [v] LT';
	                case 3:
	                    return '[minulou středu v] LT';
	                case 4:
	                case 5:
	                    return '[minulý] dddd [v] LT';
	                case 6:
	                    return '[minulou sobotu v] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : 'před %s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse : /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return cs;
	
	}));

/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : chuvash (cv)
	//! author : Anatoly Mironov : https://github.com/mirontoli
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var cv = moment.defineLocale('cv', {
	        months : 'кӑрлач_нарӑс_пуш_ака_май_ҫӗртме_утӑ_ҫурла_авӑн_юпа_чӳк_раштав'.split('_'),
	        monthsShort : 'кӑр_нар_пуш_ака_май_ҫӗр_утӑ_ҫур_авн_юпа_чӳк_раш'.split('_'),
	        weekdays : 'вырсарникун_тунтикун_ытларикун_юнкун_кӗҫнерникун_эрнекун_шӑматкун'.split('_'),
	        weekdaysShort : 'выр_тун_ытл_юн_кӗҫ_эрн_шӑм'.split('_'),
	        weekdaysMin : 'вр_тн_ыт_юн_кҫ_эр_шм'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ]',
	            LLL : 'YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ], LT',
	            LLLL : 'dddd, YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ], LT'
	        },
	        calendar : {
	            sameDay: '[Паян] LT [сехетре]',
	            nextDay: '[Ыран] LT [сехетре]',
	            lastDay: '[Ӗнер] LT [сехетре]',
	            nextWeek: '[Ҫитес] dddd LT [сехетре]',
	            lastWeek: '[Иртнӗ] dddd LT [сехетре]',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (output) {
	                var affix = /сехет$/i.exec(output) ? 'рен' : /ҫул$/i.exec(output) ? 'тан' : 'ран';
	                return output + affix;
	            },
	            past : '%s каялла',
	            s : 'пӗр-ик ҫеккунт',
	            m : 'пӗр минут',
	            mm : '%d минут',
	            h : 'пӗр сехет',
	            hh : '%d сехет',
	            d : 'пӗр кун',
	            dd : '%d кун',
	            M : 'пӗр уйӑх',
	            MM : '%d уйӑх',
	            y : 'пӗр ҫул',
	            yy : '%d ҫул'
	        },
	        ordinalParse: /\d{1,2}-мӗш/,
	        ordinal : '%d-мӗш',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return cv;
	
	}));

/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Welsh (cy)
	//! author : Robert Allen
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var cy = moment.defineLocale('cy', {
	        months: 'Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr'.split('_'),
	        monthsShort: 'Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag'.split('_'),
	        weekdays: 'Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn'.split('_'),
	        weekdaysShort: 'Sul_Llun_Maw_Mer_Iau_Gwe_Sad'.split('_'),
	        weekdaysMin: 'Su_Ll_Ma_Me_Ia_Gw_Sa'.split('_'),
	        // time formats are the same as en-gb
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS : 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Heddiw am] LT',
	            nextDay: '[Yfory am] LT',
	            nextWeek: 'dddd [am] LT',
	            lastDay: '[Ddoe am] LT',
	            lastWeek: 'dddd [diwethaf am] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'mewn %s',
	            past: '%s yn ôl',
	            s: 'ychydig eiliadau',
	            m: 'munud',
	            mm: '%d munud',
	            h: 'awr',
	            hh: '%d awr',
	            d: 'diwrnod',
	            dd: '%d diwrnod',
	            M: 'mis',
	            MM: '%d mis',
	            y: 'blwyddyn',
	            yy: '%d flynedd'
	        },
	        ordinalParse: /\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,
	        // traditional ordinal numbers above 31 are not commonly used in colloquial Welsh
	        ordinal: function (number) {
	            var b = number,
	                output = '',
	                lookup = [
	                    '', 'af', 'il', 'ydd', 'ydd', 'ed', 'ed', 'ed', 'fed', 'fed', 'fed', // 1af to 10fed
	                    'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'eg', 'fed', 'eg', 'fed' // 11eg to 20fed
	                ];
	            if (b > 20) {
	                if (b === 40 || b === 50 || b === 60 || b === 80 || b === 100) {
	                    output = 'fed'; // not 30ain, 70ain or 90ain
	                } else {
	                    output = 'ain';
	                }
	            } else if (b > 0) {
	                output = lookup[b];
	            }
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return cy;
	
	}));

/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : danish (da)
	//! author : Ulrik Nielsen : https://github.com/mrbase
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var da = moment.defineLocale('da', {
	        months : 'januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
	        weekdaysShort : 'søn_man_tir_ons_tor_fre_lør'.split('_'),
	        weekdaysMin : 'sø_ma_ti_on_to_fr_lø'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd [d.] D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[I dag kl.] LT',
	            nextDay : '[I morgen kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[I går kl.] LT',
	            lastWeek : '[sidste] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : '%s siden',
	            s : 'få sekunder',
	            m : 'et minut',
	            mm : '%d minutter',
	            h : 'en time',
	            hh : '%d timer',
	            d : 'en dag',
	            dd : '%d dage',
	            M : 'en måned',
	            MM : '%d måneder',
	            y : 'et år',
	            yy : '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return da;
	
	}));

/***/ },
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : german (de)
	//! author : lluchs : https://github.com/lluchs
	//! author: Menelion Elensúle: https://github.com/Oire
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	
	    var de = moment.defineLocale('de', {
	        months : 'Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort : 'Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : 'vor %s',
	            s : 'ein paar Sekunden',
	            m : processRelativeTime,
	            mm : '%d Minuten',
	            h : processRelativeTime,
	            hh : '%d Stunden',
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return de;
	
	}));

/***/ },
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : austrian german (de-at)
	//! author : lluchs : https://github.com/lluchs
	//! author: Menelion Elensúle: https://github.com/Oire
	//! author : Martin Groller : https://github.com/MadMG
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eine Minute', 'einer Minute'],
	            'h': ['eine Stunde', 'einer Stunde'],
	            'd': ['ein Tag', 'einem Tag'],
	            'dd': [number + ' Tage', number + ' Tagen'],
	            'M': ['ein Monat', 'einem Monat'],
	            'MM': [number + ' Monate', number + ' Monaten'],
	            'y': ['ein Jahr', 'einem Jahr'],
	            'yy': [number + ' Jahre', number + ' Jahren']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	
	    var de_at = moment.defineLocale('de-at', {
	        months : 'Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort : 'Jän._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays : 'Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag'.split('_'),
	        weekdaysShort : 'So._Mo._Di._Mi._Do._Fr._Sa.'.split('_'),
	        weekdaysMin : 'So_Mo_Di_Mi_Do_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Heute um] LT [Uhr]',
	            sameElse: 'L',
	            nextDay: '[Morgen um] LT [Uhr]',
	            nextWeek: 'dddd [um] LT [Uhr]',
	            lastDay: '[Gestern um] LT [Uhr]',
	            lastWeek: '[letzten] dddd [um] LT [Uhr]'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : 'vor %s',
	            s : 'ein paar Sekunden',
	            m : processRelativeTime,
	            mm : '%d Minuten',
	            h : processRelativeTime,
	            hh : '%d Stunden',
	            d : processRelativeTime,
	            dd : processRelativeTime,
	            M : processRelativeTime,
	            MM : processRelativeTime,
	            y : processRelativeTime,
	            yy : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return de_at;
	
	}));

/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : modern greek (el)
	//! author : Aggelos Karalias : https://github.com/mehiel
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var el = moment.defineLocale('el', {
	        monthsNominativeEl : 'Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος'.split('_'),
	        monthsGenitiveEl : 'Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου'.split('_'),
	        months : function (momentToFormat, format) {
	            if (/D/.test(format.substring(0, format.indexOf('MMMM')))) { // if there is a day number before 'MMMM'
	                return this._monthsGenitiveEl[momentToFormat.month()];
	            } else {
	                return this._monthsNominativeEl[momentToFormat.month()];
	            }
	        },
	        monthsShort : 'Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ'.split('_'),
	        weekdays : 'Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο'.split('_'),
	        weekdaysShort : 'Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ'.split('_'),
	        weekdaysMin : 'Κυ_Δε_Τρ_Τε_Πε_Πα_Σα'.split('_'),
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'μμ' : 'ΜΜ';
	            } else {
	                return isLower ? 'πμ' : 'ΠΜ';
	            }
	        },
	        isPM : function (input) {
	            return ((input + '').toLowerCase()[0] === 'μ');
	        },
	        meridiemParse : /[ΠΜ]\.?Μ?\.?/i,
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendarEl : {
	            sameDay : '[Σήμερα {}] LT',
	            nextDay : '[Αύριο {}] LT',
	            nextWeek : 'dddd [{}] LT',
	            lastDay : '[Χθες {}] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                    case 6:
	                        return '[το προηγούμενο] dddd [{}] LT';
	                    default:
	                        return '[την προηγούμενη] dddd [{}] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        calendar : function (key, mom) {
	            var output = this._calendarEl[key],
	                hours = mom && mom.hours();
	            if (typeof output === 'function') {
	                output = output.apply(mom);
	            }
	            return output.replace('{}', (hours % 12 === 1 ? 'στη' : 'στις'));
	        },
	        relativeTime : {
	            future : 'σε %s',
	            past : '%s πριν',
	            s : 'λίγα δευτερόλεπτα',
	            m : 'ένα λεπτό',
	            mm : '%d λεπτά',
	            h : 'μία ώρα',
	            hh : '%d ώρες',
	            d : 'μία μέρα',
	            dd : '%d μέρες',
	            M : 'ένας μήνας',
	            MM : '%d μήνες',
	            y : 'ένας χρόνος',
	            yy : '%d χρόνια'
	        },
	        ordinalParse: /\d{1,2}η/,
	        ordinal: '%dη',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4st is the first week of the year.
	        }
	    });
	
	    return el;
	
	}));

/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : australian english (en-au)
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_au = moment.defineLocale('en-au', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return en_au;
	
	}));

/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : canadian english (en-ca)
	//! author : Jonathan Abourbih : https://github.com/jonbca
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_ca = moment.defineLocale('en-ca', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM, YYYY',
	            LLL : 'D MMMM, YYYY LT',
	            LLLL : 'dddd, D MMMM, YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        }
	    });
	
	    return en_ca;
	
	}));

/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : great britain english (en-gb)
	//! author : Chris Gedrim : https://github.com/chrisgedrim
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var en_gb = moment.defineLocale('en-gb', {
	        months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
	        weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
	        weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
	        weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'HH:mm:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Today at] LT',
	            nextDay : '[Tomorrow at] LT',
	            nextWeek : 'dddd [at] LT',
	            lastDay : '[Yesterday at] LT',
	            lastWeek : '[Last] dddd [at] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'in %s',
	            past : '%s ago',
	            s : 'a few seconds',
	            m : 'a minute',
	            mm : '%d minutes',
	            h : 'an hour',
	            hh : '%d hours',
	            d : 'a day',
	            dd : '%d days',
	            M : 'a month',
	            MM : '%d months',
	            y : 'a year',
	            yy : '%d years'
	        },
	        ordinalParse: /\d{1,2}(st|nd|rd|th)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'th' :
	                (b === 1) ? 'st' :
	                (b === 2) ? 'nd' :
	                (b === 3) ? 'rd' : 'th';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return en_gb;
	
	}));

/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : esperanto (eo)
	//! author : Colin Dean : https://github.com/colindean
	//! komento: Mi estas malcerta se mi korekte traktis akuzativojn en tiu traduko.
	//!          Se ne, bonvolu korekti kaj avizi min por ke mi povas lerni!
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var eo = moment.defineLocale('eo', {
	        months : 'januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec'.split('_'),
	        weekdays : 'Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato'.split('_'),
	        weekdaysShort : 'Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_Ĵa_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D[-an de] MMMM, YYYY',
	            LLL : 'D[-an de] MMMM, YYYY LT',
	            LLLL : 'dddd, [la] D[-an de] MMMM, YYYY LT'
	        },
	        meridiemParse: /[ap]\.t\.m/i,
	        isPM: function (input) {
	            return input.charAt(0).toLowerCase() === 'p';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'p.t.m.' : 'P.T.M.';
	            } else {
	                return isLower ? 'a.t.m.' : 'A.T.M.';
	            }
	        },
	        calendar : {
	            sameDay : '[Hodiaŭ je] LT',
	            nextDay : '[Morgaŭ je] LT',
	            nextWeek : 'dddd [je] LT',
	            lastDay : '[Hieraŭ je] LT',
	            lastWeek : '[pasinta] dddd [je] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'je %s',
	            past : 'antaŭ %s',
	            s : 'sekundoj',
	            m : 'minuto',
	            mm : '%d minutoj',
	            h : 'horo',
	            hh : '%d horoj',
	            d : 'tago',//ne 'diurno', ĉar estas uzita por proksimumo
	            dd : '%d tagoj',
	            M : 'monato',
	            MM : '%d monatoj',
	            y : 'jaro',
	            yy : '%d jaroj'
	        },
	        ordinalParse: /\d{1,2}a/,
	        ordinal : '%da',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return eo;
	
	}));

/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : spanish (es)
	//! author : Julio Napurí : https://github.com/julionc
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortDot = 'Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.'.split('_'),
	        monthsShort = 'Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic'.split('_');
	
	    var es = moment.defineLocale('es', {
	        months : 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShort[m.month()];
	            } else {
	                return monthsShortDot[m.month()];
	            }
	        },
	        weekdays : 'Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado'.split('_'),
	        weekdaysShort : 'Dom._Lun._Mar._Mié._Jue._Vie._Sáb.'.split('_'),
	        weekdaysMin : 'Do_Lu_Ma_Mi_Ju_Vi_Sá'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY LT',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextDay : function () {
	                return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastDay : function () {
	                return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            lastWeek : function () {
	                return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'en %s',
	            past : 'hace %s',
	            s : 'unos segundos',
	            m : 'un minuto',
	            mm : '%d minutos',
	            h : 'una hora',
	            hh : '%d horas',
	            d : 'un día',
	            dd : '%d días',
	            M : 'un mes',
	            MM : '%d meses',
	            y : 'un año',
	            yy : '%d años'
	        },
	        ordinalParse : /\d{1,2}º/,
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return es;
	
	}));

/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : estonian (et)
	//! author : Henry Kehlmann : https://github.com/madhenry
	//! improvements : Illimar Tambek : https://github.com/ragulka
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            's' : ['mõne sekundi', 'mõni sekund', 'paar sekundit'],
	            'm' : ['ühe minuti', 'üks minut'],
	            'mm': [number + ' minuti', number + ' minutit'],
	            'h' : ['ühe tunni', 'tund aega', 'üks tund'],
	            'hh': [number + ' tunni', number + ' tundi'],
	            'd' : ['ühe päeva', 'üks päev'],
	            'M' : ['kuu aja', 'kuu aega', 'üks kuu'],
	            'MM': [number + ' kuu', number + ' kuud'],
	            'y' : ['ühe aasta', 'aasta', 'üks aasta'],
	            'yy': [number + ' aasta', number + ' aastat']
	        };
	        if (withoutSuffix) {
	            return format[key][2] ? format[key][2] : format[key][1];
	        }
	        return isFuture ? format[key][0] : format[key][1];
	    }
	
	    var et = moment.defineLocale('et', {
	        months        : 'jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember'.split('_'),
	        monthsShort   : 'jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets'.split('_'),
	        weekdays      : 'pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev'.split('_'),
	        weekdaysShort : 'P_E_T_K_N_R_L'.split('_'),
	        weekdaysMin   : 'P_E_T_K_N_R_L'.split('_'),
	        longDateFormat : {
	            LT   : 'H:mm',
	            LTS : 'LT:ss',
	            L    : 'DD.MM.YYYY',
	            LL   : 'D. MMMM YYYY',
	            LLL  : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay  : '[Täna,] LT',
	            nextDay  : '[Homme,] LT',
	            nextWeek : '[Järgmine] dddd LT',
	            lastDay  : '[Eile,] LT',
	            lastWeek : '[Eelmine] dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s pärast',
	            past   : '%s tagasi',
	            s      : processRelativeTime,
	            m      : processRelativeTime,
	            mm     : processRelativeTime,
	            h      : processRelativeTime,
	            hh     : processRelativeTime,
	            d      : processRelativeTime,
	            dd     : '%d päeva',
	            M      : processRelativeTime,
	            MM     : processRelativeTime,
	            y      : processRelativeTime,
	            yy     : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return et;
	
	}));

/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : euskara (eu)
	//! author : Eneko Illarramendi : https://github.com/eillarra
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var eu = moment.defineLocale('eu', {
	        months : 'urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua'.split('_'),
	        monthsShort : 'urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.'.split('_'),
	        weekdays : 'igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata'.split('_'),
	        weekdaysShort : 'ig._al._ar._az._og._ol._lr.'.split('_'),
	        weekdaysMin : 'ig_al_ar_az_og_ol_lr'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY[ko] MMMM[ren] D[a]',
	            LLL : 'YYYY[ko] MMMM[ren] D[a] LT',
	            LLLL : 'dddd, YYYY[ko] MMMM[ren] D[a] LT',
	            l : 'YYYY-M-D',
	            ll : 'YYYY[ko] MMM D[a]',
	            lll : 'YYYY[ko] MMM D[a] LT',
	            llll : 'ddd, YYYY[ko] MMM D[a] LT'
	        },
	        calendar : {
	            sameDay : '[gaur] LT[etan]',
	            nextDay : '[bihar] LT[etan]',
	            nextWeek : 'dddd LT[etan]',
	            lastDay : '[atzo] LT[etan]',
	            lastWeek : '[aurreko] dddd LT[etan]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s barru',
	            past : 'duela %s',
	            s : 'segundo batzuk',
	            m : 'minutu bat',
	            mm : '%d minutu',
	            h : 'ordu bat',
	            hh : '%d ordu',
	            d : 'egun bat',
	            dd : '%d egun',
	            M : 'hilabete bat',
	            MM : '%d hilabete',
	            y : 'urte bat',
	            yy : '%d urte'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return eu;
	
	}));

/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Persian (fa)
	//! author : Ebrahim Byagowi : https://github.com/ebraminio
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '۱',
	        '2': '۲',
	        '3': '۳',
	        '4': '۴',
	        '5': '۵',
	        '6': '۶',
	        '7': '۷',
	        '8': '۸',
	        '9': '۹',
	        '0': '۰'
	    }, numberMap = {
	        '۱': '1',
	        '۲': '2',
	        '۳': '3',
	        '۴': '4',
	        '۵': '5',
	        '۶': '6',
	        '۷': '7',
	        '۸': '8',
	        '۹': '9',
	        '۰': '0'
	    };
	
	    var fa = moment.defineLocale('fa', {
	        months : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        monthsShort : 'ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر'.split('_'),
	        weekdays : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
	        weekdaysShort : 'یک\u200cشنبه_دوشنبه_سه\u200cشنبه_چهارشنبه_پنج\u200cشنبه_جمعه_شنبه'.split('_'),
	        weekdaysMin : 'ی_د_س_چ_پ_ج_ش'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        meridiemParse: /قبل از ظهر|بعد از ظهر/,
	        isPM: function (input) {
	            return /بعد از ظهر/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return 'قبل از ظهر';
	            } else {
	                return 'بعد از ظهر';
	            }
	        },
	        calendar : {
	            sameDay : '[امروز ساعت] LT',
	            nextDay : '[فردا ساعت] LT',
	            nextWeek : 'dddd [ساعت] LT',
	            lastDay : '[دیروز ساعت] LT',
	            lastWeek : 'dddd [پیش] [ساعت] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'در %s',
	            past : '%s پیش',
	            s : 'چندین ثانیه',
	            m : 'یک دقیقه',
	            mm : '%d دقیقه',
	            h : 'یک ساعت',
	            hh : '%d ساعت',
	            d : 'یک روز',
	            dd : '%d روز',
	            M : 'یک ماه',
	            MM : '%d ماه',
	            y : 'یک سال',
	            yy : '%d سال'
	        },
	        preparse: function (string) {
	            return string.replace(/[۰-۹]/g, function (match) {
	                return numberMap[match];
	            }).replace(/،/g, ',');
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            }).replace(/,/g, '،');
	        },
	        ordinalParse: /\d{1,2}م/,
	        ordinal : '%dم',
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return fa;
	
	}));

/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : finnish (fi)
	//! author : Tarmo Aidantausta : https://github.com/bleadof
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var numbersPast = 'nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän'.split(' '),
	        numbersFuture = [
	            'nolla', 'yhden', 'kahden', 'kolmen', 'neljän', 'viiden', 'kuuden',
	            numbersPast[7], numbersPast[8], numbersPast[9]
	        ];
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = '';
	        switch (key) {
	        case 's':
	            return isFuture ? 'muutaman sekunnin' : 'muutama sekunti';
	        case 'm':
	            return isFuture ? 'minuutin' : 'minuutti';
	        case 'mm':
	            result = isFuture ? 'minuutin' : 'minuuttia';
	            break;
	        case 'h':
	            return isFuture ? 'tunnin' : 'tunti';
	        case 'hh':
	            result = isFuture ? 'tunnin' : 'tuntia';
	            break;
	        case 'd':
	            return isFuture ? 'päivän' : 'päivä';
	        case 'dd':
	            result = isFuture ? 'päivän' : 'päivää';
	            break;
	        case 'M':
	            return isFuture ? 'kuukauden' : 'kuukausi';
	        case 'MM':
	            result = isFuture ? 'kuukauden' : 'kuukautta';
	            break;
	        case 'y':
	            return isFuture ? 'vuoden' : 'vuosi';
	        case 'yy':
	            result = isFuture ? 'vuoden' : 'vuotta';
	            break;
	        }
	        result = verbalNumber(number, isFuture) + ' ' + result;
	        return result;
	    }
	    function verbalNumber(number, isFuture) {
	        return number < 10 ? (isFuture ? numbersFuture[number] : numbersPast[number]) : number;
	    }
	
	    var fi = moment.defineLocale('fi', {
	        months : 'tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu'.split('_'),
	        monthsShort : 'tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu'.split('_'),
	        weekdays : 'sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai'.split('_'),
	        weekdaysShort : 'su_ma_ti_ke_to_pe_la'.split('_'),
	        weekdaysMin : 'su_ma_ti_ke_to_pe_la'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'HH.mm.ss',
	            L : 'DD.MM.YYYY',
	            LL : 'Do MMMM[ta] YYYY',
	            LLL : 'Do MMMM[ta] YYYY, [klo] LT',
	            LLLL : 'dddd, Do MMMM[ta] YYYY, [klo] LT',
	            l : 'D.M.YYYY',
	            ll : 'Do MMM YYYY',
	            lll : 'Do MMM YYYY, [klo] LT',
	            llll : 'ddd, Do MMM YYYY, [klo] LT'
	        },
	        calendar : {
	            sameDay : '[tänään] [klo] LT',
	            nextDay : '[huomenna] [klo] LT',
	            nextWeek : 'dddd [klo] LT',
	            lastDay : '[eilen] [klo] LT',
	            lastWeek : '[viime] dddd[na] [klo] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s päästä',
	            past : '%s sitten',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fi;
	
	}));

/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : faroese (fo)
	//! author : Ragnar Johannesen : https://github.com/ragnar123
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fo = moment.defineLocale('fo', {
	        months : 'januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 'sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur'.split('_'),
	        weekdaysShort : 'sun_mán_týs_mik_hós_frí_ley'.split('_'),
	        weekdaysMin : 'su_má_tý_mi_hó_fr_le'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D. MMMM, YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Í dag kl.] LT',
	            nextDay : '[Í morgin kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[Í gjár kl.] LT',
	            lastWeek : '[síðstu] dddd [kl] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'um %s',
	            past : '%s síðani',
	            s : 'fá sekund',
	            m : 'ein minutt',
	            mm : '%d minuttir',
	            h : 'ein tími',
	            hh : '%d tímar',
	            d : 'ein dagur',
	            dd : '%d dagar',
	            M : 'ein mánaði',
	            MM : '%d mánaðir',
	            y : 'eitt ár',
	            yy : '%d ár'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fo;
	
	}));

/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : french (fr)
	//! author : John Fischer : https://github.com/jfroffice
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fr = moment.defineLocale('fr', {
	        months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
	        monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
	        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Aujourd\'hui à] LT',
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dans %s',
	            past : 'il y a %s',
	            s : 'quelques secondes',
	            m : 'une minute',
	            mm : '%d minutes',
	            h : 'une heure',
	            hh : '%d heures',
	            d : 'un jour',
	            dd : '%d jours',
	            M : 'un mois',
	            MM : '%d mois',
	            y : 'un an',
	            yy : '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|)/,
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : '');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fr;
	
	}));

/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : canadian french (fr-ca)
	//! author : Jonathan Abourbih : https://github.com/jonbca
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var fr_ca = moment.defineLocale('fr-ca', {
	        months : 'janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre'.split('_'),
	        monthsShort : 'janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.'.split('_'),
	        weekdays : 'dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi'.split('_'),
	        weekdaysShort : 'dim._lun._mar._mer._jeu._ven._sam.'.split('_'),
	        weekdaysMin : 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Aujourd\'hui à] LT',
	            nextDay: '[Demain à] LT',
	            nextWeek: 'dddd [à] LT',
	            lastDay: '[Hier à] LT',
	            lastWeek: 'dddd [dernier à] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dans %s',
	            past : 'il y a %s',
	            s : 'quelques secondes',
	            m : 'une minute',
	            mm : '%d minutes',
	            h : 'une heure',
	            hh : '%d heures',
	            d : 'un jour',
	            dd : '%d jours',
	            M : 'un mois',
	            MM : '%d mois',
	            y : 'un an',
	            yy : '%d ans'
	        },
	        ordinalParse: /\d{1,2}(er|)/,
	        ordinal : function (number) {
	            return number + (number === 1 ? 'er' : '');
	        }
	    });
	
	    return fr_ca;
	
	}));

/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : frisian (fy)
	//! author : Robin van der Vliet : https://github.com/robin0van0der0v
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_');
	
	    var fy = moment.defineLocale('fy', {
	        months : 'jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays : 'snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon'.split('_'),
	        weekdaysShort : 'si._mo._ti._wo._to._fr._so.'.split('_'),
	        weekdaysMin : 'Si_Mo_Ti_Wo_To_Fr_So'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[hjoed om] LT',
	            nextDay: '[moarn om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[juster om] LT',
	            lastWeek: '[ôfrûne] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'oer %s',
	            past : '%s lyn',
	            s : 'in pear sekonden',
	            m : 'ien minút',
	            mm : '%d minuten',
	            h : 'ien oere',
	            hh : '%d oeren',
	            d : 'ien dei',
	            dd : '%d dagen',
	            M : 'ien moanne',
	            MM : '%d moannen',
	            y : 'ien jier',
	            yy : '%d jierren'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return fy;
	
	}));

/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : galician (gl)
	//! author : Juan G. Hurtado : https://github.com/juanghurtado
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var gl = moment.defineLocale('gl', {
	        months : 'Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro'.split('_'),
	        monthsShort : 'Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.'.split('_'),
	        weekdays : 'Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado'.split('_'),
	        weekdaysShort : 'Dom._Lun._Mar._Mér._Xov._Ven._Sáb.'.split('_'),
	        weekdaysMin : 'Do_Lu_Ma_Mé_Xo_Ve_Sá'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : function () {
	                return '[hoxe ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
	            },
	            nextDay : function () {
	                return '[mañá ' + ((this.hours() !== 1) ? 'ás' : 'á') + '] LT';
	            },
	            nextWeek : function () {
	                return 'dddd [' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
	            },
	            lastDay : function () {
	                return '[onte ' + ((this.hours() !== 1) ? 'á' : 'a') + '] LT';
	            },
	            lastWeek : function () {
	                return '[o] dddd [pasado ' + ((this.hours() !== 1) ? 'ás' : 'a') + '] LT';
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (str) {
	                if (str === 'uns segundos') {
	                    return 'nuns segundos';
	                }
	                return 'en ' + str;
	            },
	            past : 'hai %s',
	            s : 'uns segundos',
	            m : 'un minuto',
	            mm : '%d minutos',
	            h : 'unha hora',
	            hh : '%d horas',
	            d : 'un día',
	            dd : '%d días',
	            M : 'un mes',
	            MM : '%d meses',
	            y : 'un ano',
	            yy : '%d anos'
	        },
	        ordinalParse : /\d{1,2}º/,
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return gl;
	
	}));

/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Hebrew (he)
	//! author : Tomer Cohen : https://github.com/tomer
	//! author : Moshe Simantov : https://github.com/DevelopmentIL
	//! author : Tal Ater : https://github.com/TalAter
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var he = moment.defineLocale('he', {
	        months : 'ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר'.split('_'),
	        monthsShort : 'ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳'.split('_'),
	        weekdays : 'ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת'.split('_'),
	        weekdaysShort : 'א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳'.split('_'),
	        weekdaysMin : 'א_ב_ג_ד_ה_ו_ש'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [ב]MMMM YYYY',
	            LLL : 'D [ב]MMMM YYYY LT',
	            LLLL : 'dddd, D [ב]MMMM YYYY LT',
	            l : 'D/M/YYYY',
	            ll : 'D MMM YYYY',
	            lll : 'D MMM YYYY LT',
	            llll : 'ddd, D MMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[היום ב־]LT',
	            nextDay : '[מחר ב־]LT',
	            nextWeek : 'dddd [בשעה] LT',
	            lastDay : '[אתמול ב־]LT',
	            lastWeek : '[ביום] dddd [האחרון בשעה] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'בעוד %s',
	            past : 'לפני %s',
	            s : 'מספר שניות',
	            m : 'דקה',
	            mm : '%d דקות',
	            h : 'שעה',
	            hh : function (number) {
	                if (number === 2) {
	                    return 'שעתיים';
	                }
	                return number + ' שעות';
	            },
	            d : 'יום',
	            dd : function (number) {
	                if (number === 2) {
	                    return 'יומיים';
	                }
	                return number + ' ימים';
	            },
	            M : 'חודש',
	            MM : function (number) {
	                if (number === 2) {
	                    return 'חודשיים';
	                }
	                return number + ' חודשים';
	            },
	            y : 'שנה',
	            yy : function (number) {
	                if (number === 2) {
	                    return 'שנתיים';
	                } else if (number % 10 === 0 && number !== 10) {
	                    return number + ' שנה';
	                }
	                return number + ' שנים';
	            }
	        }
	    });
	
	    return he;
	
	}));

/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hindi (hi)
	//! author : Mayank Singhal : https://github.com/mayanksinghal
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };
	
	    var hi = moment.defineLocale('hi', {
	        months : 'जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर'.split('_'),
	        monthsShort : 'जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.'.split('_'),
	        weekdays : 'रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
	        weekdaysShort : 'रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि'.split('_'),
	        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm बजे',
	            LTS : 'A h:mm:ss बजे',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[कल] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[कल] LT',
	            lastWeek : '[पिछले] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s में',
	            past : '%s पहले',
	            s : 'कुछ ही क्षण',
	            m : 'एक मिनट',
	            mm : '%d मिनट',
	            h : 'एक घंटा',
	            hh : '%d घंटे',
	            d : 'एक दिन',
	            dd : '%d दिन',
	            M : 'एक महीने',
	            MM : '%d महीने',
	            y : 'एक वर्ष',
	            yy : '%d वर्ष'
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        // Hindi notation for meridiems are quite fuzzy in practice. While there exists
	        // a rigid notion of a 'Pahar' it is not used as rigidly in modern Hindi.
	        meridiemParse: /रात|सुबह|दोपहर|शाम/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'रात') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === 'सुबह') {
	                return hour;
	            } else if (meridiem === 'दोपहर') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'शाम') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'रात';
	            } else if (hour < 10) {
	                return 'सुबह';
	            } else if (hour < 17) {
	                return 'दोपहर';
	            } else if (hour < 20) {
	                return 'शाम';
	            } else {
	                return 'रात';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hi;
	
	}));

/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hrvatski (hr)
	//! author : Bojan Marković : https://github.com/bmarkovic
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'jedna minuta' : 'jedne minute';
	        case 'mm':
	            if (number === 1) {
	                result += 'minuta';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'minute';
	            } else {
	                result += 'minuta';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'jedan sat' : 'jednog sata';
	        case 'hh':
	            if (number === 1) {
	                result += 'sat';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'sata';
	            } else {
	                result += 'sati';
	            }
	            return result;
	        case 'dd':
	            if (number === 1) {
	                result += 'dan';
	            } else {
	                result += 'dana';
	            }
	            return result;
	        case 'MM':
	            if (number === 1) {
	                result += 'mjesec';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'mjeseca';
	            } else {
	                result += 'mjeseci';
	            }
	            return result;
	        case 'yy':
	            if (number === 1) {
	                result += 'godina';
	            } else if (number === 2 || number === 3 || number === 4) {
	                result += 'godine';
	            } else {
	                result += 'godina';
	            }
	            return result;
	        }
	    }
	
	    var hr = moment.defineLocale('hr', {
	        months : 'siječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac'.split('_'),
	        monthsShort : 'sij._velj._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.'.split('_'),
	        weekdays : 'nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota'.split('_'),
	        weekdaysShort : 'ned._pon._uto._sri._čet._pet._sub.'.split('_'),
	        weekdaysMin : 'ne_po_ut_sr_če_pe_su'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay  : '[danas u] LT',
	            nextDay  : '[sutra u] LT',
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[jučer u] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                    return '[prošlu] dddd [u] LT';
	                case 6:
	                    return '[prošle] [subote] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prošli] dddd [u] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'par sekundi',
	            m      : translate,
	            mm     : translate,
	            h      : translate,
	            hh     : translate,
	            d      : 'dan',
	            dd     : translate,
	            M      : 'mjesec',
	            MM     : translate,
	            y      : 'godinu',
	            yy     : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hr;
	
	}));

/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : hungarian (hu)
	//! author : Adam Brunner : https://github.com/adambrunner
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var weekEndings = 'vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton'.split(' ');
	    function translate(number, withoutSuffix, key, isFuture) {
	        var num = number,
	            suffix;
	        switch (key) {
	        case 's':
	            return (isFuture || withoutSuffix) ? 'néhány másodperc' : 'néhány másodperce';
	        case 'm':
	            return 'egy' + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'mm':
	            return num + (isFuture || withoutSuffix ? ' perc' : ' perce');
	        case 'h':
	            return 'egy' + (isFuture || withoutSuffix ? ' óra' : ' órája');
	        case 'hh':
	            return num + (isFuture || withoutSuffix ? ' óra' : ' órája');
	        case 'd':
	            return 'egy' + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'dd':
	            return num + (isFuture || withoutSuffix ? ' nap' : ' napja');
	        case 'M':
	            return 'egy' + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	        case 'MM':
	            return num + (isFuture || withoutSuffix ? ' hónap' : ' hónapja');
	        case 'y':
	            return 'egy' + (isFuture || withoutSuffix ? ' év' : ' éve');
	        case 'yy':
	            return num + (isFuture || withoutSuffix ? ' év' : ' éve');
	        }
	        return '';
	    }
	    function week(isFuture) {
	        return (isFuture ? '' : '[múlt] ') + '[' + weekEndings[this.day()] + '] LT[-kor]';
	    }
	
	    var hu = moment.defineLocale('hu', {
	        months : 'január_február_március_április_május_június_július_augusztus_szeptember_október_november_december'.split('_'),
	        monthsShort : 'jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec'.split('_'),
	        weekdays : 'vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat'.split('_'),
	        weekdaysShort : 'vas_hét_kedd_sze_csüt_pén_szo'.split('_'),
	        weekdaysMin : 'v_h_k_sze_cs_p_szo'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY.MM.DD.',
	            LL : 'YYYY. MMMM D.',
	            LLL : 'YYYY. MMMM D., LT',
	            LLLL : 'YYYY. MMMM D., dddd LT'
	        },
	        meridiemParse: /de|du/i,
	        isPM: function (input) {
	            return input.charAt(1).toLowerCase() === 'u';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 12) {
	                return isLower === true ? 'de' : 'DE';
	            } else {
	                return isLower === true ? 'du' : 'DU';
	            }
	        },
	        calendar : {
	            sameDay : '[ma] LT[-kor]',
	            nextDay : '[holnap] LT[-kor]',
	            nextWeek : function () {
	                return week.call(this, true);
	            },
	            lastDay : '[tegnap] LT[-kor]',
	            lastWeek : function () {
	                return week.call(this, false);
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s múlva',
	            past : '%s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hu;
	
	}));

/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Armenian (hy-am)
	//! author : Armendarabyan : https://github.com/armendarabyan
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր'.split('_'),
	            'accusative': 'հունվարի_փետրվարի_մարտի_ապրիլի_մայիսի_հունիսի_հուլիսի_օգոստոսի_սեպտեմբերի_հոկտեմբերի_նոյեմբերի_դեկտեմբերի'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = 'հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ'.split('_');
	        return monthsShort[m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = 'կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ'.split('_');
	        return weekdays[m.day()];
	    }
	
	    var hy_am = moment.defineLocale('hy-am', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
	        weekdaysMin : 'կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY թ.',
	            LLL : 'D MMMM YYYY թ., LT',
	            LLLL : 'dddd, D MMMM YYYY թ., LT'
	        },
	        calendar : {
	            sameDay: '[այսօր] LT',
	            nextDay: '[վաղը] LT',
	            lastDay: '[երեկ] LT',
	            nextWeek: function () {
	                return 'dddd [օրը ժամը] LT';
	            },
	            lastWeek: function () {
	                return '[անցած] dddd [օրը ժամը] LT';
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '%s հետո',
	            past : '%s առաջ',
	            s : 'մի քանի վայրկյան',
	            m : 'րոպե',
	            mm : '%d րոպե',
	            h : 'ժամ',
	            hh : '%d ժամ',
	            d : 'օր',
	            dd : '%d օր',
	            M : 'ամիս',
	            MM : '%d ամիս',
	            y : 'տարի',
	            yy : '%d տարի'
	        },
	        meridiemParse: /գիշերվա|առավոտվա|ցերեկվա|երեկոյան/,
	        isPM: function (input) {
	            return /^(ցերեկվա|երեկոյան)$/.test(input);
	        },
	        meridiem : function (hour) {
	            if (hour < 4) {
	                return 'գիշերվա';
	            } else if (hour < 12) {
	                return 'առավոտվա';
	            } else if (hour < 17) {
	                return 'ցերեկվա';
	            } else {
	                return 'երեկոյան';
	            }
	        },
	        ordinalParse: /\d{1,2}|\d{1,2}-(ին|րդ)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'DDD':
	            case 'w':
	            case 'W':
	            case 'DDDo':
	                if (number === 1) {
	                    return number + '-ին';
	                }
	                return number + '-րդ';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return hy_am;
	
	}));

/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bahasa Indonesia (id)
	//! author : Mohammad Satrio Utomo : https://github.com/tyok
	//! reference: http://id.wikisource.org/wiki/Pedoman_Umum_Ejaan_Bahasa_Indonesia_yang_Disempurnakan
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var id = moment.defineLocale('id', {
	        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des'.split('_'),
	        weekdays : 'Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu'.split('_'),
	        weekdaysShort : 'Min_Sen_Sel_Rab_Kam_Jum_Sab'.split('_'),
	        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'LT.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] LT',
	            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
	        },
	        meridiemParse: /pagi|siang|sore|malam/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'siang') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'sore' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'siang';
	            } else if (hours < 19) {
	                return 'sore';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Besok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kemarin pukul] LT',
	            lastWeek : 'dddd [lalu pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'dalam %s',
	            past : '%s yang lalu',
	            s : 'beberapa detik',
	            m : 'semenit',
	            mm : '%d menit',
	            h : 'sejam',
	            hh : '%d jam',
	            d : 'sehari',
	            dd : '%d hari',
	            M : 'sebulan',
	            MM : '%d bulan',
	            y : 'setahun',
	            yy : '%d tahun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return id;
	
	}));

/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : icelandic (is)
	//! author : Hinrik Örn Sigurðsson : https://github.com/hinrik
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(n) {
	        if (n % 100 === 11) {
	            return true;
	        } else if (n % 10 === 1) {
	            return false;
	        }
	        return true;
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':
	            return withoutSuffix || isFuture ? 'nokkrar sekúndur' : 'nokkrum sekúndum';
	        case 'm':
	            return withoutSuffix ? 'mínúta' : 'mínútu';
	        case 'mm':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'mínútur' : 'mínútum');
	            } else if (withoutSuffix) {
	                return result + 'mínúta';
	            }
	            return result + 'mínútu';
	        case 'hh':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'klukkustundir' : 'klukkustundum');
	            }
	            return result + 'klukkustund';
	        case 'd':
	            if (withoutSuffix) {
	                return 'dagur';
	            }
	            return isFuture ? 'dag' : 'degi';
	        case 'dd':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'dagar';
	                }
	                return result + (isFuture ? 'daga' : 'dögum');
	            } else if (withoutSuffix) {
	                return result + 'dagur';
	            }
	            return result + (isFuture ? 'dag' : 'degi');
	        case 'M':
	            if (withoutSuffix) {
	                return 'mánuður';
	            }
	            return isFuture ? 'mánuð' : 'mánuði';
	        case 'MM':
	            if (plural(number)) {
	                if (withoutSuffix) {
	                    return result + 'mánuðir';
	                }
	                return result + (isFuture ? 'mánuði' : 'mánuðum');
	            } else if (withoutSuffix) {
	                return result + 'mánuður';
	            }
	            return result + (isFuture ? 'mánuð' : 'mánuði');
	        case 'y':
	            return withoutSuffix || isFuture ? 'ár' : 'ári';
	        case 'yy':
	            if (plural(number)) {
	                return result + (withoutSuffix || isFuture ? 'ár' : 'árum');
	            }
	            return result + (withoutSuffix || isFuture ? 'ár' : 'ári');
	        }
	    }
	
	    var is = moment.defineLocale('is', {
	        months : 'janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des'.split('_'),
	        weekdays : 'sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur'.split('_'),
	        weekdaysShort : 'sun_mán_þri_mið_fim_fös_lau'.split('_'),
	        weekdaysMin : 'Su_Má_Þr_Mi_Fi_Fö_La'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY [kl.] LT',
	            LLLL : 'dddd, D. MMMM YYYY [kl.] LT'
	        },
	        calendar : {
	            sameDay : '[í dag kl.] LT',
	            nextDay : '[á morgun kl.] LT',
	            nextWeek : 'dddd [kl.] LT',
	            lastDay : '[í gær kl.] LT',
	            lastWeek : '[síðasta] dddd [kl.] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'eftir %s',
	            past : 'fyrir %s síðan',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : 'klukkustund',
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return is;
	
	}));

/***/ },
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : italian (it)
	//! author : Lorenzo : https://github.com/aliem
	//! author: Mattia Larentis: https://github.com/nostalgiaz
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var it = moment.defineLocale('it', {
	        months : 'gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre'.split('_'),
	        monthsShort : 'gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic'.split('_'),
	        weekdays : 'Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato'.split('_'),
	        weekdaysShort : 'Dom_Lun_Mar_Mer_Gio_Ven_Sab'.split('_'),
	        weekdaysMin : 'D_L_Ma_Me_G_V_S'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Oggi alle] LT',
	            nextDay: '[Domani alle] LT',
	            nextWeek: 'dddd [alle] LT',
	            lastDay: '[Ieri alle] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                    case 0:
	                        return '[la scorsa] dddd [alle] LT';
	                    default:
	                        return '[lo scorso] dddd [alle] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return ((/^[0-9].+$/).test(s) ? 'tra' : 'in') + ' ' + s;
	            },
	            past : '%s fa',
	            s : 'alcuni secondi',
	            m : 'un minuto',
	            mm : '%d minuti',
	            h : 'un\'ora',
	            hh : '%d ore',
	            d : 'un giorno',
	            dd : '%d giorni',
	            M : 'un mese',
	            MM : '%d mesi',
	            y : 'un anno',
	            yy : '%d anni'
	        },
	        ordinalParse : /\d{1,2}º/,
	        ordinal: '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return it;
	
	}));

/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : japanese (ja)
	//! author : LI Long : https://github.com/baryon
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ja = moment.defineLocale('ja', {
	        months : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays : '日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日'.split('_'),
	        weekdaysShort : '日_月_火_水_木_金_土'.split('_'),
	        weekdaysMin : '日_月_火_水_木_金_土'.split('_'),
	        longDateFormat : {
	            LT : 'Ah時m分',
	            LTS : 'LTs秒',
	            L : 'YYYY/MM/DD',
	            LL : 'YYYY年M月D日',
	            LLL : 'YYYY年M月D日LT',
	            LLLL : 'YYYY年M月D日LT dddd'
	        },
	        meridiemParse: /午前|午後/i,
	        isPM : function (input) {
	            return input === '午後';
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return '午前';
	            } else {
	                return '午後';
	            }
	        },
	        calendar : {
	            sameDay : '[今日] LT',
	            nextDay : '[明日] LT',
	            nextWeek : '[来週]dddd LT',
	            lastDay : '[昨日] LT',
	            lastWeek : '[前週]dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s後',
	            past : '%s前',
	            s : '数秒',
	            m : '1分',
	            mm : '%d分',
	            h : '1時間',
	            hh : '%d時間',
	            d : '1日',
	            dd : '%d日',
	            M : '1ヶ月',
	            MM : '%dヶ月',
	            y : '1年',
	            yy : '%d年'
	        }
	    });
	
	    return ja;
	
	}));

/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Boso Jowo (jv)
	//! author : Rony Lantip : https://github.com/lantip
	//! reference: http://jv.wikipedia.org/wiki/Basa_Jawa
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var jv = moment.defineLocale('jv', {
	        months : 'Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember'.split('_'),
	        monthsShort : 'Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des'.split('_'),
	        weekdays : 'Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu'.split('_'),
	        weekdaysShort : 'Min_Sen_Sel_Reb_Kem_Jem_Sep'.split('_'),
	        weekdaysMin : 'Mg_Sn_Sl_Rb_Km_Jm_Sp'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'LT.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] LT',
	            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
	        },
	        meridiemParse: /enjing|siyang|sonten|ndalu/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'enjing') {
	                return hour;
	            } else if (meridiem === 'siyang') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'sonten' || meridiem === 'ndalu') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'enjing';
	            } else if (hours < 15) {
	                return 'siyang';
	            } else if (hours < 19) {
	                return 'sonten';
	            } else {
	                return 'ndalu';
	            }
	        },
	        calendar : {
	            sameDay : '[Dinten puniko pukul] LT',
	            nextDay : '[Mbenjang pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kala wingi pukul] LT',
	            lastWeek : 'dddd [kepengker pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'wonten ing %s',
	            past : '%s ingkang kepengker',
	            s : 'sawetawis detik',
	            m : 'setunggal menit',
	            mm : '%d menit',
	            h : 'setunggal jam',
	            hh : '%d jam',
	            d : 'sedinten',
	            dd : '%d dinten',
	            M : 'sewulan',
	            MM : '%d wulan',
	            y : 'setaun',
	            yy : '%d taun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return jv;
	
	}));

/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Georgian (ka)
	//! author : Irakli Janiashvili : https://github.com/irakli-janiashvili
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი'.split('_'),
	            'accusative': 'იანვარს_თებერვალს_მარტს_აპრილის_მაისს_ივნისს_ივლისს_აგვისტს_სექტემბერს_ოქტომბერს_ნოემბერს_დეკემბერს'.split('_')
	        },
	        nounCase = (/D[oD] *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი'.split('_'),
	            'accusative': 'კვირას_ორშაბათს_სამშაბათს_ოთხშაბათს_ხუთშაბათს_პარასკევს_შაბათს'.split('_')
	        },
	        nounCase = (/(წინა|შემდეგ)/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var ka = moment.defineLocale('ka', {
	        months : monthsCaseReplace,
	        monthsShort : 'იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : 'კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ'.split('_'),
	        weekdaysMin : 'კვ_ორ_სა_ოთ_ხუ_პა_შა'.split('_'),
	        longDateFormat : {
	            LT : 'h:mm A',
	            LTS : 'h:mm:ss A',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[დღეს] LT[-ზე]',
	            nextDay : '[ხვალ] LT[-ზე]',
	            lastDay : '[გუშინ] LT[-ზე]',
	            nextWeek : '[შემდეგ] dddd LT[-ზე]',
	            lastWeek : '[წინა] dddd LT-ზე',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : function (s) {
	                return (/(წამი|წუთი|საათი|წელი)/).test(s) ?
	                    s.replace(/ი$/, 'ში') :
	                    s + 'ში';
	            },
	            past : function (s) {
	                if ((/(წამი|წუთი|საათი|დღე|თვე)/).test(s)) {
	                    return s.replace(/(ი|ე)$/, 'ის წინ');
	                }
	                if ((/წელი/).test(s)) {
	                    return s.replace(/წელი$/, 'წლის წინ');
	                }
	            },
	            s : 'რამდენიმე წამი',
	            m : 'წუთი',
	            mm : '%d წუთი',
	            h : 'საათი',
	            hh : '%d საათი',
	            d : 'დღე',
	            dd : '%d დღე',
	            M : 'თვე',
	            MM : '%d თვე',
	            y : 'წელი',
	            yy : '%d წელი'
	        },
	        ordinalParse: /0|1-ლი|მე-\d{1,2}|\d{1,2}-ე/,
	        ordinal : function (number) {
	            if (number === 0) {
	                return number;
	            }
	            if (number === 1) {
	                return number + '-ლი';
	            }
	            if ((number < 20) || (number <= 100 && (number % 20 === 0)) || (number % 100 === 0)) {
	                return 'მე-' + number;
	            }
	            return number + '-ე';
	        },
	        week : {
	            dow : 1,
	            doy : 7
	        }
	    });
	
	    return ka;
	
	}));

/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : khmer (km)
	//! author : Kruy Vanna : https://github.com/kruyvanna
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var km = moment.defineLocale('km', {
	        months: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
	        monthsShort: 'មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ'.split('_'),
	        weekdays: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        weekdaysShort: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        weekdaysMin: 'អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍'.split('_'),
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS : 'LT:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd, D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[ថ្ងៃនៈ ម៉ោង] LT',
	            nextDay: '[ស្អែក ម៉ោង] LT',
	            nextWeek: 'dddd [ម៉ោង] LT',
	            lastDay: '[ម្សិលមិញ ម៉ោង] LT',
	            lastWeek: 'dddd [សប្តាហ៍មុន] [ម៉ោង] LT',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: '%sទៀត',
	            past: '%sមុន',
	            s: 'ប៉ុន្មានវិនាទី',
	            m: 'មួយនាទី',
	            mm: '%d នាទី',
	            h: 'មួយម៉ោង',
	            hh: '%d ម៉ោង',
	            d: 'មួយថ្ងៃ',
	            dd: '%d ថ្ងៃ',
	            M: 'មួយខែ',
	            MM: '%d ខែ',
	            y: 'មួយឆ្នាំ',
	            yy: '%d ឆ្នាំ'
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return km;
	
	}));

/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : korean (ko)
	//!
	//! authors
	//!
	//! - Kyungwook, Park : https://github.com/kyungw00k
	//! - Jeeeyul Lee <jeeeyul@gmail.com>
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ko = moment.defineLocale('ko', {
	        months : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
	        monthsShort : '1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월'.split('_'),
	        weekdays : '일요일_월요일_화요일_수요일_목요일_금요일_토요일'.split('_'),
	        weekdaysShort : '일_월_화_수_목_금_토'.split('_'),
	        weekdaysMin : '일_월_화_수_목_금_토'.split('_'),
	        longDateFormat : {
	            LT : 'A h시 m분',
	            LTS : 'A h시 m분 s초',
	            L : 'YYYY.MM.DD',
	            LL : 'YYYY년 MMMM D일',
	            LLL : 'YYYY년 MMMM D일 LT',
	            LLLL : 'YYYY년 MMMM D일 dddd LT'
	        },
	        calendar : {
	            sameDay : '오늘 LT',
	            nextDay : '내일 LT',
	            nextWeek : 'dddd LT',
	            lastDay : '어제 LT',
	            lastWeek : '지난주 dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s 후',
	            past : '%s 전',
	            s : '몇초',
	            ss : '%d초',
	            m : '일분',
	            mm : '%d분',
	            h : '한시간',
	            hh : '%d시간',
	            d : '하루',
	            dd : '%d일',
	            M : '한달',
	            MM : '%d달',
	            y : '일년',
	            yy : '%d년'
	        },
	        ordinalParse : /\d{1,2}일/,
	        ordinal : '%d일',
	        meridiemParse : /오전|오후/,
	        isPM : function (token) {
	            return token === '오후';
	        },
	        meridiem : function (hour, minute, isUpper) {
	            return hour < 12 ? '오전' : '오후';
	        }
	    });
	
	    return ko;
	
	}));

/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Luxembourgish (lb)
	//! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var format = {
	            'm': ['eng Minutt', 'enger Minutt'],
	            'h': ['eng Stonn', 'enger Stonn'],
	            'd': ['een Dag', 'engem Dag'],
	            'M': ['ee Mount', 'engem Mount'],
	            'y': ['ee Joer', 'engem Joer']
	        };
	        return withoutSuffix ? format[key][0] : format[key][1];
	    }
	    function processFutureTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'a ' + string;
	        }
	        return 'an ' + string;
	    }
	    function processPastTime(string) {
	        var number = string.substr(0, string.indexOf(' '));
	        if (eifelerRegelAppliesToNumber(number)) {
	            return 'viru ' + string;
	        }
	        return 'virun ' + string;
	    }
	    /**
	     * Returns true if the word before the given number loses the '-n' ending.
	     * e.g. 'an 10 Deeg' but 'a 5 Deeg'
	     *
	     * @param number {integer}
	     * @returns {boolean}
	     */
	    function eifelerRegelAppliesToNumber(number) {
	        number = parseInt(number, 10);
	        if (isNaN(number)) {
	            return false;
	        }
	        if (number < 0) {
	            // Negative Number --> always true
	            return true;
	        } else if (number < 10) {
	            // Only 1 digit
	            if (4 <= number && number <= 7) {
	                return true;
	            }
	            return false;
	        } else if (number < 100) {
	            // 2 digits
	            var lastDigit = number % 10, firstDigit = number / 10;
	            if (lastDigit === 0) {
	                return eifelerRegelAppliesToNumber(firstDigit);
	            }
	            return eifelerRegelAppliesToNumber(lastDigit);
	        } else if (number < 10000) {
	            // 3 or 4 digits --> recursively check first digit
	            while (number >= 10) {
	                number = number / 10;
	            }
	            return eifelerRegelAppliesToNumber(number);
	        } else {
	            // Anything larger than 4 digits: recursively check first n-3 digits
	            number = number / 1000;
	            return eifelerRegelAppliesToNumber(number);
	        }
	    }
	
	    var lb = moment.defineLocale('lb', {
	        months: 'Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember'.split('_'),
	        monthsShort: 'Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.'.split('_'),
	        weekdays: 'Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg'.split('_'),
	        weekdaysShort: 'So._Mé._Dë._Më._Do._Fr._Sa.'.split('_'),
	        weekdaysMin: 'So_Mé_Dë_Më_Do_Fr_Sa'.split('_'),
	        longDateFormat: {
	            LT: 'H:mm [Auer]',
	            LTS: 'H:mm:ss [Auer]',
	            L: 'DD.MM.YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[Haut um] LT',
	            sameElse: 'L',
	            nextDay: '[Muer um] LT',
	            nextWeek: 'dddd [um] LT',
	            lastDay: '[Gëschter um] LT',
	            lastWeek: function () {
	                // Different date string for 'Dënschdeg' (Tuesday) and 'Donneschdeg' (Thursday) due to phonological rule
	                switch (this.day()) {
	                    case 2:
	                    case 4:
	                        return '[Leschten] dddd [um] LT';
	                    default:
	                        return '[Leschte] dddd [um] LT';
	                }
	            }
	        },
	        relativeTime : {
	            future : processFutureTime,
	            past : processPastTime,
	            s : 'e puer Sekonnen',
	            m : processRelativeTime,
	            mm : '%d Minutten',
	            h : processRelativeTime,
	            hh : '%d Stonnen',
	            d : processRelativeTime,
	            dd : '%d Deeg',
	            M : processRelativeTime,
	            MM : '%d Méint',
	            y : processRelativeTime,
	            yy : '%d Joer'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal: '%d.',
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lb;
	
	}));

/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Lithuanian (lt)
	//! author : Mindaugas Mozūras : https://github.com/mmozuras
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var units = {
	        'm' : 'minutė_minutės_minutę',
	        'mm': 'minutės_minučių_minutes',
	        'h' : 'valanda_valandos_valandą',
	        'hh': 'valandos_valandų_valandas',
	        'd' : 'diena_dienos_dieną',
	        'dd': 'dienos_dienų_dienas',
	        'M' : 'mėnuo_mėnesio_mėnesį',
	        'MM': 'mėnesiai_mėnesių_mėnesius',
	        'y' : 'metai_metų_metus',
	        'yy': 'metai_metų_metus'
	    },
	    weekDays = 'sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis'.split('_');
	    function translateSeconds(number, withoutSuffix, key, isFuture) {
	        if (withoutSuffix) {
	            return 'kelios sekundės';
	        } else {
	            return isFuture ? 'kelių sekundžių' : 'kelias sekundes';
	        }
	    }
	    function translateSingular(number, withoutSuffix, key, isFuture) {
	        return withoutSuffix ? forms(key)[0] : (isFuture ? forms(key)[1] : forms(key)[2]);
	    }
	    function special(number) {
	        return number % 10 === 0 || (number > 10 && number < 20);
	    }
	    function forms(key) {
	        return units[key].split('_');
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        if (number === 1) {
	            return result + translateSingular(number, withoutSuffix, key[0], isFuture);
	        } else if (withoutSuffix) {
	            return result + (special(number) ? forms(key)[1] : forms(key)[0]);
	        } else {
	            if (isFuture) {
	                return result + forms(key)[1];
	            } else {
	                return result + (special(number) ? forms(key)[1] : forms(key)[2]);
	            }
	        }
	    }
	    function relativeWeekDay(moment, format) {
	        var nominative = format.indexOf('dddd HH:mm') === -1,
	            weekDay = weekDays[moment.day()];
	        return nominative ? weekDay : weekDay.substring(0, weekDay.length - 2) + 'į';
	    }
	
	    var lt = moment.defineLocale('lt', {
	        months : 'sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio'.split('_'),
	        monthsShort : 'sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd'.split('_'),
	        weekdays : relativeWeekDay,
	        weekdaysShort : 'Sek_Pir_Ant_Tre_Ket_Pen_Šeš'.split('_'),
	        weekdaysMin : 'S_P_A_T_K_Pn_Š'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY [m.] MMMM D [d.]',
	            LLL : 'YYYY [m.] MMMM D [d.], LT [val.]',
	            LLLL : 'YYYY [m.] MMMM D [d.], dddd, LT [val.]',
	            l : 'YYYY-MM-DD',
	            ll : 'YYYY [m.] MMMM D [d.]',
	            lll : 'YYYY [m.] MMMM D [d.], LT [val.]',
	            llll : 'YYYY [m.] MMMM D [d.], ddd, LT [val.]'
	        },
	        calendar : {
	            sameDay : '[Šiandien] LT',
	            nextDay : '[Rytoj] LT',
	            nextWeek : 'dddd LT',
	            lastDay : '[Vakar] LT',
	            lastWeek : '[Praėjusį] dddd LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'po %s',
	            past : 'prieš %s',
	            s : translateSeconds,
	            m : translateSingular,
	            mm : translate,
	            h : translateSingular,
	            hh : translate,
	            d : translateSingular,
	            dd : translate,
	            M : translateSingular,
	            MM : translate,
	            y : translateSingular,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}-oji/,
	        ordinal : function (number) {
	            return number + '-oji';
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lt;
	
	}));

/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : latvian (lv)
	//! author : Kristaps Karlsons : https://github.com/skakri
	//! author : Jānis Elmeris : https://github.com/JanisE
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var units = {
	        'm': 'minūtes_minūtēm_minūte_minūtes'.split('_'),
	        'mm': 'minūtes_minūtēm_minūte_minūtes'.split('_'),
	        'h': 'stundas_stundām_stunda_stundas'.split('_'),
	        'hh': 'stundas_stundām_stunda_stundas'.split('_'),
	        'd': 'dienas_dienām_diena_dienas'.split('_'),
	        'dd': 'dienas_dienām_diena_dienas'.split('_'),
	        'M': 'mēneša_mēnešiem_mēnesis_mēneši'.split('_'),
	        'MM': 'mēneša_mēnešiem_mēnesis_mēneši'.split('_'),
	        'y': 'gada_gadiem_gads_gadi'.split('_'),
	        'yy': 'gada_gadiem_gads_gadi'.split('_')
	    };
	    /**
	     * @param withoutSuffix boolean true = a length of time; false = before/after a period of time.
	     */
	    function format(forms, number, withoutSuffix) {
	        if (withoutSuffix) {
	            // E.g. "21 minūte", "3 minūtes".
	            return number % 10 === 1 && number !== 11 ? forms[2] : forms[3];
	        } else {
	            // E.g. "21 minūtes" as in "pēc 21 minūtes".
	            // E.g. "3 minūtēm" as in "pēc 3 minūtēm".
	            return number % 10 === 1 && number !== 11 ? forms[0] : forms[1];
	        }
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        return number + ' ' + format(units[key], number, withoutSuffix);
	    }
	    function relativeTimeWithSingular(number, withoutSuffix, key) {
	        return format(units[key], number, withoutSuffix);
	    }
	    function relativeSeconds(number, withoutSuffix) {
	        return withoutSuffix ? 'dažas sekundes' : 'dažām sekundēm';
	    }
	
	    var lv = moment.defineLocale('lv', {
	        months : 'janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 'svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena'.split('_'),
	        weekdaysShort : 'Sv_P_O_T_C_Pk_S'.split('_'),
	        weekdaysMin : 'Sv_P_O_T_C_Pk_S'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY.',
	            LL : 'YYYY. [gada] D. MMMM',
	            LLL : 'YYYY. [gada] D. MMMM, LT',
	            LLLL : 'YYYY. [gada] D. MMMM, dddd, LT'
	        },
	        calendar : {
	            sameDay : '[Šodien pulksten] LT',
	            nextDay : '[Rīt pulksten] LT',
	            nextWeek : 'dddd [pulksten] LT',
	            lastDay : '[Vakar pulksten] LT',
	            lastWeek : '[Pagājušā] dddd [pulksten] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'pēc %s',
	            past : 'pirms %s',
	            s : relativeSeconds,
	            m : relativeTimeWithSingular,
	            mm : relativeTimeWithPlural,
	            h : relativeTimeWithSingular,
	            hh : relativeTimeWithPlural,
	            d : relativeTimeWithSingular,
	            dd : relativeTimeWithPlural,
	            M : relativeTimeWithSingular,
	            MM : relativeTimeWithPlural,
	            y : relativeTimeWithSingular,
	            yy : relativeTimeWithPlural
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return lv;
	
	}));

/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Montenegrin (me)
	//! author : Miodrag Nikač <miodrag@restartit.me> : https://github.com/miodragnikac
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['jedan minut', 'jednog minuta'],
	            mm: ['minut', 'minuta', 'minuta'],
	            h: ['jedan sat', 'jednog sata'],
	            hh: ['sat', 'sata', 'sati'],
	            dd: ['dan', 'dana', 'dana'],
	            MM: ['mjesec', 'mjeseca', 'mjeseci'],
	            yy: ['godina', 'godine', 'godina']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var me = moment.defineLocale('me', {
	        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
	        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
	        weekdays: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
	        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sri.', 'čet.', 'pet.', 'sub.'],
	        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sjutra u] LT',
	
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedjelju] [u] LT';
	                case 3:
	                    return '[u] [srijedu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[juče u] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[prošle] [nedjelje] [u] LT',
	                    '[prošlog] [ponedjeljka] [u] LT',
	                    '[prošlog] [utorka] [u] LT',
	                    '[prošle] [srijede] [u] LT',
	                    '[prošlog] [četvrtka] [u] LT',
	                    '[prošlog] [petka] [u] LT',
	                    '[prošle] [subote] [u] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'prije %s',
	            s      : 'nekoliko sekundi',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : 'dan',
	            dd     : translator.translate,
	            M      : 'mjesec',
	            MM     : translator.translate,
	            y      : 'godinu',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return me;
	
	}));

/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : macedonian (mk)
	//! author : Borislav Mickov : https://github.com/B0k0
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var mk = moment.defineLocale('mk', {
	        months : 'јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември'.split('_'),
	        monthsShort : 'јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек'.split('_'),
	        weekdays : 'недела_понеделник_вторник_среда_четврток_петок_сабота'.split('_'),
	        weekdaysShort : 'нед_пон_вто_сре_чет_пет_саб'.split('_'),
	        weekdaysMin : 'нe_пo_вт_ср_че_пе_сa'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'D.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Денес во] LT',
	            nextDay : '[Утре во] LT',
	            nextWeek : 'dddd [во] LT',
	            lastDay : '[Вчера во] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 6:
	                    return '[Во изминатата] dddd [во] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[Во изминатиот] dddd [во] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'после %s',
	            past : 'пред %s',
	            s : 'неколку секунди',
	            m : 'минута',
	            mm : '%d минути',
	            h : 'час',
	            hh : '%d часа',
	            d : 'ден',
	            dd : '%d дена',
	            M : 'месец',
	            MM : '%d месеци',
	            y : 'година',
	            yy : '%d години'
	        },
	        ordinalParse: /\d{1,2}-(ев|ен|ти|ви|ри|ми)/,
	        ordinal : function (number) {
	            var lastDigit = number % 10,
	                last2Digits = number % 100;
	            if (number === 0) {
	                return number + '-ев';
	            } else if (last2Digits === 0) {
	                return number + '-ен';
	            } else if (last2Digits > 10 && last2Digits < 20) {
	                return number + '-ти';
	            } else if (lastDigit === 1) {
	                return number + '-ви';
	            } else if (lastDigit === 2) {
	                return number + '-ри';
	            } else if (lastDigit === 7 || lastDigit === 8) {
	                return number + '-ми';
	            } else {
	                return number + '-ти';
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return mk;
	
	}));

/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : malayalam (ml)
	//! author : Floyd Pink : https://github.com/floydpink
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ml = moment.defineLocale('ml', {
	        months : 'ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ'.split('_'),
	        monthsShort : 'ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.'.split('_'),
	        weekdays : 'ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച'.split('_'),
	        weekdaysShort : 'ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി'.split('_'),
	        weekdaysMin : 'ഞാ_തി_ചൊ_ബു_വ്യാ_വെ_ശ'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm -നു',
	            LTS : 'A h:mm:ss -നു',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[ഇന്ന്] LT',
	            nextDay : '[നാളെ] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[ഇന്നലെ] LT',
	            lastWeek : '[കഴിഞ്ഞ] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s കഴിഞ്ഞ്',
	            past : '%s മുൻപ്',
	            s : 'അൽപ നിമിഷങ്ങൾ',
	            m : 'ഒരു മിനിറ്റ്',
	            mm : '%d മിനിറ്റ്',
	            h : 'ഒരു മണിക്കൂർ',
	            hh : '%d മണിക്കൂർ',
	            d : 'ഒരു ദിവസം',
	            dd : '%d ദിവസം',
	            M : 'ഒരു മാസം',
	            MM : '%d മാസം',
	            y : 'ഒരു വർഷം',
	            yy : '%d വർഷം'
	        },
	        meridiemParse: /രാത്രി|രാവിലെ|ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി/i,
	        isPM : function (input) {
	            return /^(ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'രാത്രി';
	            } else if (hour < 12) {
	                return 'രാവിലെ';
	            } else if (hour < 17) {
	                return 'ഉച്ച കഴിഞ്ഞ്';
	            } else if (hour < 20) {
	                return 'വൈകുന്നേരം';
	            } else {
	                return 'രാത്രി';
	            }
	        }
	    });
	
	    return ml;
	
	}));

/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Marathi (mr)
	//! author : Harshad Kale : https://github.com/kalehv
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };
	
	    var mr = moment.defineLocale('mr', {
	        months : 'जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर'.split('_'),
	        monthsShort: 'जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.'.split('_'),
	        weekdays : 'रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार'.split('_'),
	        weekdaysShort : 'रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि'.split('_'),
	        weekdaysMin : 'र_सो_मं_बु_गु_शु_श'.split('_'),
	        longDateFormat : {
	            LT : 'A h:mm वाजता',
	            LTS : 'A h:mm:ss वाजता',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[उद्या] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[काल] LT',
	            lastWeek: '[मागील] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s नंतर',
	            past : '%s पूर्वी',
	            s : 'सेकंद',
	            m: 'एक मिनिट',
	            mm: '%d मिनिटे',
	            h : 'एक तास',
	            hh : '%d तास',
	            d : 'एक दिवस',
	            dd : '%d दिवस',
	            M : 'एक महिना',
	            MM : '%d महिने',
	            y : 'एक वर्ष',
	            yy : '%d वर्षे'
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /रात्री|सकाळी|दुपारी|सायंकाळी/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'रात्री') {
	                return hour < 4 ? hour : hour + 12;
	            } else if (meridiem === 'सकाळी') {
	                return hour;
	            } else if (meridiem === 'दुपारी') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'सायंकाळी') {
	                return hour + 12;
	            }
	        },
	        meridiem: function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'रात्री';
	            } else if (hour < 10) {
	                return 'सकाळी';
	            } else if (hour < 17) {
	                return 'दुपारी';
	            } else if (hour < 20) {
	                return 'सायंकाळी';
	            } else {
	                return 'रात्री';
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return mr;
	
	}));

/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Bahasa Malaysia (ms-MY)
	//! author : Weldan Jamili : https://github.com/weldan
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ms_my = moment.defineLocale('ms-my', {
	        months : 'Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember'.split('_'),
	        monthsShort : 'Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis'.split('_'),
	        weekdays : 'Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu'.split('_'),
	        weekdaysShort : 'Ahd_Isn_Sel_Rab_Kha_Jum_Sab'.split('_'),
	        weekdaysMin : 'Ah_Is_Sl_Rb_Km_Jm_Sb'.split('_'),
	        longDateFormat : {
	            LT : 'HH.mm',
	            LTS : 'LT.ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY [pukul] LT',
	            LLLL : 'dddd, D MMMM YYYY [pukul] LT'
	        },
	        meridiemParse: /pagi|tengahari|petang|malam/,
	        meridiemHour: function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'pagi') {
	                return hour;
	            } else if (meridiem === 'tengahari') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === 'petang' || meridiem === 'malam') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours < 11) {
	                return 'pagi';
	            } else if (hours < 15) {
	                return 'tengahari';
	            } else if (hours < 19) {
	                return 'petang';
	            } else {
	                return 'malam';
	            }
	        },
	        calendar : {
	            sameDay : '[Hari ini pukul] LT',
	            nextDay : '[Esok pukul] LT',
	            nextWeek : 'dddd [pukul] LT',
	            lastDay : '[Kelmarin pukul] LT',
	            lastWeek : 'dddd [lepas pukul] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'dalam %s',
	            past : '%s yang lepas',
	            s : 'beberapa saat',
	            m : 'seminit',
	            mm : '%d minit',
	            h : 'sejam',
	            hh : '%d jam',
	            d : 'sehari',
	            dd : '%d hari',
	            M : 'sebulan',
	            MM : '%d bulan',
	            y : 'setahun',
	            yy : '%d tahun'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ms_my;
	
	}));

/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Burmese (my)
	//! author : Squar team, mysquar.com
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '၁',
	        '2': '၂',
	        '3': '၃',
	        '4': '၄',
	        '5': '၅',
	        '6': '၆',
	        '7': '၇',
	        '8': '၈',
	        '9': '၉',
	        '0': '၀'
	    }, numberMap = {
	        '၁': '1',
	        '၂': '2',
	        '၃': '3',
	        '၄': '4',
	        '၅': '5',
	        '၆': '6',
	        '၇': '7',
	        '၈': '8',
	        '၉': '9',
	        '၀': '0'
	    };
	
	    var my = moment.defineLocale('my', {
	        months: 'ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ'.split('_'),
	        monthsShort: 'ဇန်_ဖေ_မတ်_ပြီ_မေ_ဇွန်_လိုင်_သြ_စက်_အောက်_နို_ဒီ'.split('_'),
	        weekdays: 'တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ'.split('_'),
	        weekdaysShort: 'နွေ_လာ_ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
	        weekdaysMin: 'နွေ_လာ_ဂါ_ဟူး_ကြာ_သော_နေ'.split('_'),
	
	        longDateFormat: {
	            LT: 'HH:mm',
	            LTS: 'HH:mm:ss',
	            L: 'DD/MM/YYYY',
	            LL: 'D MMMM YYYY',
	            LLL: 'D MMMM YYYY LT',
	            LLLL: 'dddd D MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[ယနေ.] LT [မှာ]',
	            nextDay: '[မနက်ဖြန်] LT [မှာ]',
	            nextWeek: 'dddd LT [မှာ]',
	            lastDay: '[မနေ.က] LT [မှာ]',
	            lastWeek: '[ပြီးခဲ့သော] dddd LT [မှာ]',
	            sameElse: 'L'
	        },
	        relativeTime: {
	            future: 'လာမည့် %s မှာ',
	            past: 'လွန်ခဲ့သော %s က',
	            s: 'စက္ကန်.အနည်းငယ်',
	            m: 'တစ်မိနစ်',
	            mm: '%d မိနစ်',
	            h: 'တစ်နာရီ',
	            hh: '%d နာရီ',
	            d: 'တစ်ရက်',
	            dd: '%d ရက်',
	            M: 'တစ်လ',
	            MM: '%d လ',
	            y: 'တစ်နှစ်',
	            yy: '%d နှစ်'
	        },
	        preparse: function (string) {
	            return string.replace(/[၁၂၃၄၅၆၇၈၉၀]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        week: {
	            dow: 1, // Monday is the first day of the week.
	            doy: 4 // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return my;
	
	}));

/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : norwegian bokmål (nb)
	//! authors : Espen Hovlandsdal : https://github.com/rexxars
	//!           Sigurd Gartmann : https://github.com/sigurdga
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var nb = moment.defineLocale('nb', {
	        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 'søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag'.split('_'),
	        weekdaysShort : 'søn_man_tirs_ons_tors_fre_lør'.split('_'),
	        weekdaysMin : 'sø_ma_ti_on_to_fr_lø'.split('_'),
	        longDateFormat : {
	            LT : 'H.mm',
	            LTS : 'LT.ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY [kl.] LT',
	            LLLL : 'dddd D. MMMM YYYY [kl.] LT'
	        },
	        calendar : {
	            sameDay: '[i dag kl.] LT',
	            nextDay: '[i morgen kl.] LT',
	            nextWeek: 'dddd [kl.] LT',
	            lastDay: '[i går kl.] LT',
	            lastWeek: '[forrige] dddd [kl.] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'for %s siden',
	            s : 'noen sekunder',
	            m : 'ett minutt',
	            mm : '%d minutter',
	            h : 'en time',
	            hh : '%d timer',
	            d : 'en dag',
	            dd : '%d dager',
	            M : 'en måned',
	            MM : '%d måneder',
	            y : 'ett år',
	            yy : '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nb;
	
	}));

/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : nepali/nepalese
	//! author : suvash : https://github.com/suvash
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var symbolMap = {
	        '1': '१',
	        '2': '२',
	        '3': '३',
	        '4': '४',
	        '5': '५',
	        '6': '६',
	        '7': '७',
	        '8': '८',
	        '9': '९',
	        '0': '०'
	    },
	    numberMap = {
	        '१': '1',
	        '२': '2',
	        '३': '3',
	        '४': '4',
	        '५': '5',
	        '६': '6',
	        '७': '7',
	        '८': '8',
	        '९': '9',
	        '०': '0'
	    };
	
	    var ne = moment.defineLocale('ne', {
	        months : 'जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर'.split('_'),
	        monthsShort : 'जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.'.split('_'),
	        weekdays : 'आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार'.split('_'),
	        weekdaysShort : 'आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.'.split('_'),
	        weekdaysMin : 'आइ._सो._मङ्_बु._बि._शु._श.'.split('_'),
	        longDateFormat : {
	            LT : 'Aको h:mm बजे',
	            LTS : 'Aको h:mm:ss बजे',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        preparse: function (string) {
	            return string.replace(/[१२३४५६७८९०]/g, function (match) {
	                return numberMap[match];
	            });
	        },
	        postformat: function (string) {
	            return string.replace(/\d/g, function (match) {
	                return symbolMap[match];
	            });
	        },
	        meridiemParse: /राती|बिहान|दिउँसो|बेलुका|साँझ|राती/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'राती') {
	                return hour < 3 ? hour : hour + 12;
	            } else if (meridiem === 'बिहान') {
	                return hour;
	            } else if (meridiem === 'दिउँसो') {
	                return hour >= 10 ? hour : hour + 12;
	            } else if (meridiem === 'बेलुका' || meridiem === 'साँझ') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 3) {
	                return 'राती';
	            } else if (hour < 10) {
	                return 'बिहान';
	            } else if (hour < 15) {
	                return 'दिउँसो';
	            } else if (hour < 18) {
	                return 'बेलुका';
	            } else if (hour < 20) {
	                return 'साँझ';
	            } else {
	                return 'राती';
	            }
	        },
	        calendar : {
	            sameDay : '[आज] LT',
	            nextDay : '[भोली] LT',
	            nextWeek : '[आउँदो] dddd[,] LT',
	            lastDay : '[हिजो] LT',
	            lastWeek : '[गएको] dddd[,] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%sमा',
	            past : '%s अगाडी',
	            s : 'केही समय',
	            m : 'एक मिनेट',
	            mm : '%d मिनेट',
	            h : 'एक घण्टा',
	            hh : '%d घण्टा',
	            d : 'एक दिन',
	            dd : '%d दिन',
	            M : 'एक महिना',
	            MM : '%d महिना',
	            y : 'एक बर्ष',
	            yy : '%d बर्ष'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ne;
	
	}));

/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : dutch (nl)
	//! author : Joris Röling : https://github.com/jjupiter
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsShortWithDots = 'jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.'.split('_'),
	        monthsShortWithoutDots = 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_');
	
	    var nl = moment.defineLocale('nl', {
	        months : 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
	        monthsShort : function (m, format) {
	            if (/-MMM-/.test(format)) {
	                return monthsShortWithoutDots[m.month()];
	            } else {
	                return monthsShortWithDots[m.month()];
	            }
	        },
	        weekdays : 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
	        weekdaysShort : 'zo._ma._di._wo._do._vr._za.'.split('_'),
	        weekdaysMin : 'Zo_Ma_Di_Wo_Do_Vr_Za'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD-MM-YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[vandaag om] LT',
	            nextDay: '[morgen om] LT',
	            nextWeek: 'dddd [om] LT',
	            lastDay: '[gisteren om] LT',
	            lastWeek: '[afgelopen] dddd [om] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'over %s',
	            past : '%s geleden',
	            s : 'een paar seconden',
	            m : 'één minuut',
	            mm : '%d minuten',
	            h : 'één uur',
	            hh : '%d uur',
	            d : 'één dag',
	            dd : '%d dagen',
	            M : 'één maand',
	            MM : '%d maanden',
	            y : 'één jaar',
	            yy : '%d jaar'
	        },
	        ordinalParse: /\d{1,2}(ste|de)/,
	        ordinal : function (number) {
	            return number + ((number === 1 || number === 8 || number >= 20) ? 'ste' : 'de');
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nl;
	
	}));

/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : norwegian nynorsk (nn)
	//! author : https://github.com/mechuwind
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var nn = moment.defineLocale('nn', {
	        months : 'januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des'.split('_'),
	        weekdays : 'sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag'.split('_'),
	        weekdaysShort : 'sun_mån_tys_ons_tor_fre_lau'.split('_'),
	        weekdaysMin : 'su_må_ty_on_to_fr_lø'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[I dag klokka] LT',
	            nextDay: '[I morgon klokka] LT',
	            nextWeek: 'dddd [klokka] LT',
	            lastDay: '[I går klokka] LT',
	            lastWeek: '[Føregåande] dddd [klokka] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'for %s sidan',
	            s : 'nokre sekund',
	            m : 'eit minutt',
	            mm : '%d minutt',
	            h : 'ein time',
	            hh : '%d timar',
	            d : 'ein dag',
	            dd : '%d dagar',
	            M : 'ein månad',
	            MM : '%d månader',
	            y : 'eit år',
	            yy : '%d år'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return nn;
	
	}));

/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : polish (pl)
	//! author : Rafal Hirsz : https://github.com/evoL
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var monthsNominative = 'styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień'.split('_'),
	        monthsSubjective = 'stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia'.split('_');
	    function plural(n) {
	        return (n % 10 < 5) && (n % 10 > 1) && ((~~(n / 10) % 10) !== 1);
	    }
	    function translate(number, withoutSuffix, key) {
	        var result = number + ' ';
	        switch (key) {
	        case 'm':
	            return withoutSuffix ? 'minuta' : 'minutę';
	        case 'mm':
	            return result + (plural(number) ? 'minuty' : 'minut');
	        case 'h':
	            return withoutSuffix  ? 'godzina'  : 'godzinę';
	        case 'hh':
	            return result + (plural(number) ? 'godziny' : 'godzin');
	        case 'MM':
	            return result + (plural(number) ? 'miesiące' : 'miesięcy');
	        case 'yy':
	            return result + (plural(number) ? 'lata' : 'lat');
	        }
	    }
	
	    var pl = moment.defineLocale('pl', {
	        months : function (momentToFormat, format) {
	            if (format === '') {
	                // Hack: if format empty we know this is used to generate
	                // RegExp by moment. Give then back both valid forms of months
	                // in RegExp ready format.
	                return '(' + monthsSubjective[momentToFormat.month()] + '|' + monthsNominative[momentToFormat.month()] + ')';
	            } else if (/D MMMM/.test(format)) {
	                return monthsSubjective[momentToFormat.month()];
	            } else {
	                return monthsNominative[momentToFormat.month()];
	            }
	        },
	        monthsShort : 'sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru'.split('_'),
	        weekdays : 'niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota'.split('_'),
	        weekdaysShort : 'nie_pon_wt_śr_czw_pt_sb'.split('_'),
	        weekdaysMin : 'N_Pn_Wt_Śr_Cz_Pt_So'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Dziś o] LT',
	            nextDay: '[Jutro o] LT',
	            nextWeek: '[W] dddd [o] LT',
	            lastDay: '[Wczoraj o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[W zeszłą niedzielę o] LT';
	                case 3:
	                    return '[W zeszłą środę o] LT';
	                case 6:
	                    return '[W zeszłą sobotę o] LT';
	                default:
	                    return '[W zeszły] dddd [o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : '%s temu',
	            s : 'kilka sekund',
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : '1 dzień',
	            dd : '%d dni',
	            M : 'miesiąc',
	            MM : translate,
	            y : 'rok',
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return pl;
	
	}));

/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : portuguese (pt)
	//! author : Jefferson : https://github.com/jalex79
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var pt = moment.defineLocale('pt', {
	        months : 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
	        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
	        weekdays : 'Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado'.split('_'),
	        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
	        weekdaysMin : 'Dom_2ª_3ª_4ª_5ª_6ª_Sáb'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY LT',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[Último] dddd [às] LT' : // Saturday + Sunday
	                    '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'em %s',
	            past : 'há %s',
	            s : 'segundos',
	            m : 'um minuto',
	            mm : '%d minutos',
	            h : 'uma hora',
	            hh : '%d horas',
	            d : 'um dia',
	            dd : '%d dias',
	            M : 'um mês',
	            MM : '%d meses',
	            y : 'um ano',
	            yy : '%d anos'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal : '%dº',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return pt;
	
	}));

/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : brazilian portuguese (pt-br)
	//! author : Caio Ribeiro Pereira : https://github.com/caio-ribeiro-pereira
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var pt_br = moment.defineLocale('pt-br', {
	        months : 'Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro'.split('_'),
	        monthsShort : 'Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez'.split('_'),
	        weekdays : 'Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado'.split('_'),
	        weekdaysShort : 'Dom_Seg_Ter_Qua_Qui_Sex_Sáb'.split('_'),
	        weekdaysMin : 'Dom_2ª_3ª_4ª_5ª_6ª_Sáb'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D [de] MMMM [de] YYYY',
	            LLL : 'D [de] MMMM [de] YYYY [às] LT',
	            LLLL : 'dddd, D [de] MMMM [de] YYYY [às] LT'
	        },
	        calendar : {
	            sameDay: '[Hoje às] LT',
	            nextDay: '[Amanhã às] LT',
	            nextWeek: 'dddd [às] LT',
	            lastDay: '[Ontem às] LT',
	            lastWeek: function () {
	                return (this.day() === 0 || this.day() === 6) ?
	                    '[Último] dddd [às] LT' : // Saturday + Sunday
	                    '[Última] dddd [às] LT'; // Monday - Friday
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'em %s',
	            past : '%s atrás',
	            s : 'segundos',
	            m : 'um minuto',
	            mm : '%d minutos',
	            h : 'uma hora',
	            hh : '%d horas',
	            d : 'um dia',
	            dd : '%d dias',
	            M : 'um mês',
	            MM : '%d meses',
	            y : 'um ano',
	            yy : '%d anos'
	        },
	        ordinalParse: /\d{1,2}º/,
	        ordinal : '%dº'
	    });
	
	    return pt_br;
	
	}));

/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : romanian (ro)
	//! author : Vlad Gurdiga : https://github.com/gurdiga
	//! author : Valentin Agachi : https://github.com/avaly
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	                'mm': 'minute',
	                'hh': 'ore',
	                'dd': 'zile',
	                'MM': 'luni',
	                'yy': 'ani'
	            },
	            separator = ' ';
	        if (number % 100 >= 20 || (number >= 100 && number % 100 === 0)) {
	            separator = ' de ';
	        }
	        return number + separator + format[key];
	    }
	
	    var ro = moment.defineLocale('ro', {
	        months : 'ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie'.split('_'),
	        monthsShort : 'ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.'.split('_'),
	        weekdays : 'duminică_luni_marți_miercuri_joi_vineri_sâmbătă'.split('_'),
	        weekdaysShort : 'Dum_Lun_Mar_Mie_Joi_Vin_Sâm'.split('_'),
	        weekdaysMin : 'Du_Lu_Ma_Mi_Jo_Vi_Sâ'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY H:mm',
	            LLLL : 'dddd, D MMMM YYYY H:mm'
	        },
	        calendar : {
	            sameDay: '[azi la] LT',
	            nextDay: '[mâine la] LT',
	            nextWeek: 'dddd [la] LT',
	            lastDay: '[ieri la] LT',
	            lastWeek: '[fosta] dddd [la] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'peste %s',
	            past : '%s în urmă',
	            s : 'câteva secunde',
	            m : 'un minut',
	            mm : relativeTimeWithPlural,
	            h : 'o oră',
	            hh : relativeTimeWithPlural,
	            d : 'o zi',
	            dd : relativeTimeWithPlural,
	            M : 'o lună',
	            MM : relativeTimeWithPlural,
	            y : 'un an',
	            yy : relativeTimeWithPlural
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ro;
	
	}));

/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : russian (ru)
	//! author : Viktorminator : https://github.com/Viktorminator
	//! Author : Menelion Elensúle : https://github.com/Oire
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': withoutSuffix ? 'минута_минуты_минут' : 'минуту_минуты_минут',
	            'hh': 'час_часа_часов',
	            'dd': 'день_дня_дней',
	            'MM': 'месяц_месяца_месяцев',
	            'yy': 'год_года_лет'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'минута' : 'минуту';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
	            'accusative': 'января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function monthsShortCaseReplace(m, format) {
	        var monthsShort = {
	            'nominative': 'янв_фев_март_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_'),
	            'accusative': 'янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек'.split('_')
	        },
	        nounCase = (/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return monthsShort[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'воскресенье_понедельник_вторник_среда_четверг_пятница_суббота'.split('_'),
	            'accusative': 'воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу'.split('_')
	        },
	        nounCase = (/\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/).test(format) ?
	            'accusative' :
	            'nominative';
	        return weekdays[nounCase][m.day()];
	    }
	
	    var ru = moment.defineLocale('ru', {
	        months : monthsCaseReplace,
	        monthsShort : monthsShortCaseReplace,
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
	        weekdaysMin : 'вс_пн_вт_ср_чт_пт_сб'.split('_'),
	        monthsParse : [/^янв/i, /^фев/i, /^мар/i, /^апр/i, /^ма[й|я]/i, /^июн/i, /^июл/i, /^авг/i, /^сен/i, /^окт/i, /^ноя/i, /^дек/i],
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY г.',
	            LLL : 'D MMMM YYYY г., LT',
	            LLLL : 'dddd, D MMMM YYYY г., LT'
	        },
	        calendar : {
	            sameDay: '[Сегодня в] LT',
	            nextDay: '[Завтра в] LT',
	            lastDay: '[Вчера в] LT',
	            nextWeek: function () {
	                return this.day() === 2 ? '[Во] dddd [в] LT' : '[В] dddd [в] LT';
	            },
	            lastWeek: function (now) {
	                if (now.week() !== this.week()) {
	                    switch (this.day()) {
	                    case 0:
	                        return '[В прошлое] dddd [в] LT';
	                    case 1:
	                    case 2:
	                    case 4:
	                        return '[В прошлый] dddd [в] LT';
	                    case 3:
	                    case 5:
	                    case 6:
	                        return '[В прошлую] dddd [в] LT';
	                    }
	                } else {
	                    if (this.day() === 2) {
	                        return '[Во] dddd [в] LT';
	                    } else {
	                        return '[В] dddd [в] LT';
	                    }
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'через %s',
	            past : '%s назад',
	            s : 'несколько секунд',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : 'час',
	            hh : relativeTimeWithPlural,
	            d : 'день',
	            dd : relativeTimeWithPlural,
	            M : 'месяц',
	            MM : relativeTimeWithPlural,
	            y : 'год',
	            yy : relativeTimeWithPlural
	        },
	        meridiemParse: /ночи|утра|дня|вечера/i,
	        isPM : function (input) {
	            return /^(дня|вечера)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночи';
	            } else if (hour < 12) {
	                return 'утра';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечера';
	            }
	        },
	        ordinalParse: /\d{1,2}-(й|го|я)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	                return number + '-й';
	            case 'D':
	                return number + '-го';
	            case 'w':
	            case 'W':
	                return number + '-я';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ru;
	
	}));

/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Sinhalese (si)
	//! author : Sampath Sitinamaluwa : https://github.com/sampathsris
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var si = moment.defineLocale('si', {
	        months : 'ජනවාරි_පෙබරවාරි_මාර්තු_අප්‍රේල්_මැයි_ජූනි_ජූලි_අගෝස්තු_සැප්තැම්බර්_ඔක්තෝබර්_නොවැම්බර්_දෙසැම්බර්'.split('_'),
	        monthsShort : 'ජන_පෙබ_මාර්_අප්_මැයි_ජූනි_ජූලි_අගෝ_සැප්_ඔක්_නොවැ_දෙසැ'.split('_'),
	        weekdays : 'ඉරිදා_සඳුදා_අඟහරුවාදා_බදාදා_බ්‍රහස්පතින්දා_සිකුරාදා_සෙනසුරාදා'.split('_'),
	        weekdaysShort : 'ඉරි_සඳු_අඟ_බදා_බ්‍රහ_සිකු_සෙන'.split('_'),
	        weekdaysMin : 'ඉ_ස_අ_බ_බ්‍ර_සි_සෙ'.split('_'),
	        longDateFormat : {
	            LT : 'a h:mm',
	            LTS : 'a h:mm:ss',
	            L : 'YYYY/MM/DD',
	            LL : 'YYYY MMMM D',
	            LLL : 'YYYY MMMM D, LT',
	            LLLL : 'YYYY MMMM D [වැනි] dddd, LTS'
	        },
	        calendar : {
	            sameDay : '[අද] LT[ට]',
	            nextDay : '[හෙට] LT[ට]',
	            nextWeek : 'dddd LT[ට]',
	            lastDay : '[ඊයේ] LT[ට]',
	            lastWeek : '[පසුගිය] dddd LT[ට]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%sකින්',
	            past : '%sකට පෙර',
	            s : 'තත්පර කිහිපය',
	            m : 'මිනිත්තුව',
	            mm : 'මිනිත්තු %d',
	            h : 'පැය',
	            hh : 'පැය %d',
	            d : 'දිනය',
	            dd : 'දින %d',
	            M : 'මාසය',
	            MM : 'මාස %d',
	            y : 'වසර',
	            yy : 'වසර %d'
	        },
	        ordinalParse: /\d{1,2} වැනි/,
	        ordinal : function (number) {
	            return number + ' වැනි';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            if (hours > 11) {
	                return isLower ? 'ප.ව.' : 'පස් වරු';
	            } else {
	                return isLower ? 'පෙ.ව.' : 'පෙර වරු';
	            }
	        }
	    });
	
	    return si;
	
	}));

/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : slovak (sk)
	//! author : Martin Minka : https://github.com/k2s
	//! based on work of petrbela : https://github.com/petrbela
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var months = 'január_február_marec_apríl_máj_jún_júl_august_september_október_november_december'.split('_'),
	        monthsShort = 'jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec'.split('_');
	    function plural(n) {
	        return (n > 1) && (n < 5);
	    }
	    function translate(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':  // a few seconds / in a few seconds / a few seconds ago
	            return (withoutSuffix || isFuture) ? 'pár sekúnd' : 'pár sekundami';
	        case 'm':  // a minute / in a minute / a minute ago
	            return withoutSuffix ? 'minúta' : (isFuture ? 'minútu' : 'minútou');
	        case 'mm': // 9 minutes / in 9 minutes / 9 minutes ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'minúty' : 'minút');
	            } else {
	                return result + 'minútami';
	            }
	            break;
	        case 'h':  // an hour / in an hour / an hour ago
	            return withoutSuffix ? 'hodina' : (isFuture ? 'hodinu' : 'hodinou');
	        case 'hh': // 9 hours / in 9 hours / 9 hours ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'hodiny' : 'hodín');
	            } else {
	                return result + 'hodinami';
	            }
	            break;
	        case 'd':  // a day / in a day / a day ago
	            return (withoutSuffix || isFuture) ? 'deň' : 'dňom';
	        case 'dd': // 9 days / in 9 days / 9 days ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'dni' : 'dní');
	            } else {
	                return result + 'dňami';
	            }
	            break;
	        case 'M':  // a month / in a month / a month ago
	            return (withoutSuffix || isFuture) ? 'mesiac' : 'mesiacom';
	        case 'MM': // 9 months / in 9 months / 9 months ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'mesiace' : 'mesiacov');
	            } else {
	                return result + 'mesiacmi';
	            }
	            break;
	        case 'y':  // a year / in a year / a year ago
	            return (withoutSuffix || isFuture) ? 'rok' : 'rokom';
	        case 'yy': // 9 years / in 9 years / 9 years ago
	            if (withoutSuffix || isFuture) {
	                return result + (plural(number) ? 'roky' : 'rokov');
	            } else {
	                return result + 'rokmi';
	            }
	            break;
	        }
	    }
	
	    var sk = moment.defineLocale('sk', {
	        months : months,
	        monthsShort : monthsShort,
	        monthsParse : (function (months, monthsShort) {
	            var i, _monthsParse = [];
	            for (i = 0; i < 12; i++) {
	                // use custom parser to solve problem with July (červenec)
	                _monthsParse[i] = new RegExp('^' + months[i] + '$|^' + monthsShort[i] + '$', 'i');
	            }
	            return _monthsParse;
	        }(months, monthsShort)),
	        weekdays : 'nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota'.split('_'),
	        weekdaysShort : 'ne_po_ut_st_št_pi_so'.split('_'),
	        weekdaysMin : 'ne_po_ut_st_št_pi_so'.split('_'),
	        longDateFormat : {
	            LT: 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[dnes o] LT',
	            nextDay: '[zajtra o] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v nedeľu o] LT';
	                case 1:
	                case 2:
	                    return '[v] dddd [o] LT';
	                case 3:
	                    return '[v stredu o] LT';
	                case 4:
	                    return '[vo štvrtok o] LT';
	                case 5:
	                    return '[v piatok o] LT';
	                case 6:
	                    return '[v sobotu o] LT';
	                }
	            },
	            lastDay: '[včera o] LT',
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[minulú nedeľu o] LT';
	                case 1:
	                case 2:
	                    return '[minulý] dddd [o] LT';
	                case 3:
	                    return '[minulú stredu o] LT';
	                case 4:
	                case 5:
	                    return '[minulý] dddd [o] LT';
	                case 6:
	                    return '[minulú sobotu o] LT';
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past : 'pred %s',
	            s : translate,
	            m : translate,
	            mm : translate,
	            h : translate,
	            hh : translate,
	            d : translate,
	            dd : translate,
	            M : translate,
	            MM : translate,
	            y : translate,
	            yy : translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sk;
	
	}));

/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : slovenian (sl)
	//! author : Robert Sedovšek : https://github.com/sedovsek
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function processRelativeTime(number, withoutSuffix, key, isFuture) {
	        var result = number + ' ';
	        switch (key) {
	        case 's':
	            return withoutSuffix || isFuture ? 'nekaj sekund' : 'nekaj sekundami';
	        case 'm':
	            return withoutSuffix ? 'ena minuta' : 'eno minuto';
	        case 'mm':
	            if (number === 1) {
	                result += withoutSuffix ? 'minuta' : 'minuto';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'minuti' : 'minutama';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'minute' : 'minutami';
	            } else {
	                result += withoutSuffix || isFuture ? 'minut' : 'minutami';
	            }
	            return result;
	        case 'h':
	            return withoutSuffix ? 'ena ura' : 'eno uro';
	        case 'hh':
	            if (number === 1) {
	                result += withoutSuffix ? 'ura' : 'uro';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'uri' : 'urama';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'ure' : 'urami';
	            } else {
	                result += withoutSuffix || isFuture ? 'ur' : 'urami';
	            }
	            return result;
	        case 'd':
	            return withoutSuffix || isFuture ? 'en dan' : 'enim dnem';
	        case 'dd':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'dan' : 'dnem';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'dni' : 'dnevoma';
	            } else {
	                result += withoutSuffix || isFuture ? 'dni' : 'dnevi';
	            }
	            return result;
	        case 'M':
	            return withoutSuffix || isFuture ? 'en mesec' : 'enim mesecem';
	        case 'MM':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'mesec' : 'mesecem';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'meseca' : 'mesecema';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'mesece' : 'meseci';
	            } else {
	                result += withoutSuffix || isFuture ? 'mesecev' : 'meseci';
	            }
	            return result;
	        case 'y':
	            return withoutSuffix || isFuture ? 'eno leto' : 'enim letom';
	        case 'yy':
	            if (number === 1) {
	                result += withoutSuffix || isFuture ? 'leto' : 'letom';
	            } else if (number === 2) {
	                result += withoutSuffix || isFuture ? 'leti' : 'letoma';
	            } else if (number < 5) {
	                result += withoutSuffix || isFuture ? 'leta' : 'leti';
	            } else {
	                result += withoutSuffix || isFuture ? 'let' : 'leti';
	            }
	            return result;
	        }
	    }
	
	    var sl = moment.defineLocale('sl', {
	        months : 'januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.'.split('_'),
	        weekdays : 'nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota'.split('_'),
	        weekdaysShort : 'ned._pon._tor._sre._čet._pet._sob.'.split('_'),
	        weekdaysMin : 'ne_po_to_sr_če_pe_so'.split('_'),
	        longDateFormat : {
	            LT : 'H:mm',
	            LTS : 'LT:ss',
	            L : 'DD. MM. YYYY',
	            LL : 'D. MMMM YYYY',
	            LLL : 'D. MMMM YYYY LT',
	            LLLL : 'dddd, D. MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay  : '[danes ob] LT',
	            nextDay  : '[jutri ob] LT',
	
	            nextWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[v] [nedeljo] [ob] LT';
	                case 3:
	                    return '[v] [sredo] [ob] LT';
	                case 6:
	                    return '[v] [soboto] [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[v] dddd [ob] LT';
	                }
	            },
	            lastDay  : '[včeraj ob] LT',
	            lastWeek : function () {
	                switch (this.day()) {
	                case 0:
	                    return '[prejšnjo] [nedeljo] [ob] LT';
	                case 3:
	                    return '[prejšnjo] [sredo] [ob] LT';
	                case 6:
	                    return '[prejšnjo] [soboto] [ob] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[prejšnji] dddd [ob] LT';
	                }
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'čez %s',
	            past   : 'pred %s',
	            s      : processRelativeTime,
	            m      : processRelativeTime,
	            mm     : processRelativeTime,
	            h      : processRelativeTime,
	            hh     : processRelativeTime,
	            d      : processRelativeTime,
	            dd     : processRelativeTime,
	            M      : processRelativeTime,
	            MM     : processRelativeTime,
	            y      : processRelativeTime,
	            yy     : processRelativeTime
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sl;
	
	}));

/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Albanian (sq)
	//! author : Flakërim Ismani : https://github.com/flakerimi
	//! author: Menelion Elensúle: https://github.com/Oire (tests)
	//! author : Oerd Cukalla : https://github.com/oerd (fixes)
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var sq = moment.defineLocale('sq', {
	        months : 'Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor'.split('_'),
	        monthsShort : 'Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj'.split('_'),
	        weekdays : 'E Diel_E Hënë_E Martë_E Mërkurë_E Enjte_E Premte_E Shtunë'.split('_'),
	        weekdaysShort : 'Die_Hën_Mar_Mër_Enj_Pre_Sht'.split('_'),
	        weekdaysMin : 'D_H_Ma_Më_E_P_Sh'.split('_'),
	        meridiemParse: /PD|MD/,
	        isPM: function (input) {
	            return input.charAt(0) === 'M';
	        },
	        meridiem : function (hours, minutes, isLower) {
	            return hours < 12 ? 'PD' : 'MD';
	        },
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[Sot në] LT',
	            nextDay : '[Nesër në] LT',
	            nextWeek : 'dddd [në] LT',
	            lastDay : '[Dje në] LT',
	            lastWeek : 'dddd [e kaluar në] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'në %s',
	            past : '%s më parë',
	            s : 'disa sekonda',
	            m : 'një minutë',
	            mm : '%d minuta',
	            h : 'një orë',
	            hh : '%d orë',
	            d : 'një ditë',
	            dd : '%d ditë',
	            M : 'një muaj',
	            MM : '%d muaj',
	            y : 'një vit',
	            yy : '%d vite'
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sq;
	
	}));

/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Serbian-latin (sr)
	//! author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['jedan minut', 'jedne minute'],
	            mm: ['minut', 'minute', 'minuta'],
	            h: ['jedan sat', 'jednog sata'],
	            hh: ['sat', 'sata', 'sati'],
	            dd: ['dan', 'dana', 'dana'],
	            MM: ['mesec', 'meseca', 'meseci'],
	            yy: ['godina', 'godine', 'godina']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var sr = moment.defineLocale('sr', {
	        months: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
	        monthsShort: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sep.', 'okt.', 'nov.', 'dec.'],
	        weekdays: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
	        weekdaysShort: ['ned.', 'pon.', 'uto.', 'sre.', 'čet.', 'pet.', 'sub.'],
	        weekdaysMin: ['ne', 'po', 'ut', 'sr', 'če', 'pe', 'su'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[danas u] LT',
	            nextDay: '[sutra u] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[u] [nedelju] [u] LT';
	                case 3:
	                    return '[u] [sredu] [u] LT';
	                case 6:
	                    return '[u] [subotu] [u] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[u] dddd [u] LT';
	                }
	            },
	            lastDay  : '[juče u] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[prošle] [nedelje] [u] LT',
	                    '[prošlog] [ponedeljka] [u] LT',
	                    '[prošlog] [utorka] [u] LT',
	                    '[prošle] [srede] [u] LT',
	                    '[prošlog] [četvrtka] [u] LT',
	                    '[prošlog] [petka] [u] LT',
	                    '[prošle] [subote] [u] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'za %s',
	            past   : 'pre %s',
	            s      : 'nekoliko sekundi',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : 'dan',
	            dd     : translator.translate,
	            M      : 'mesec',
	            MM     : translator.translate,
	            y      : 'godinu',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sr;
	
	}));

/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Serbian-cyrillic (sr-cyrl)
	//! author : Milan Janačković<milanjanackovic@gmail.com> : https://github.com/milan-j
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var translator = {
	        words: { //Different grammatical cases
	            m: ['један минут', 'једне минуте'],
	            mm: ['минут', 'минуте', 'минута'],
	            h: ['један сат', 'једног сата'],
	            hh: ['сат', 'сата', 'сати'],
	            dd: ['дан', 'дана', 'дана'],
	            MM: ['месец', 'месеца', 'месеци'],
	            yy: ['година', 'године', 'година']
	        },
	        correctGrammaticalCase: function (number, wordKey) {
	            return number === 1 ? wordKey[0] : (number >= 2 && number <= 4 ? wordKey[1] : wordKey[2]);
	        },
	        translate: function (number, withoutSuffix, key) {
	            var wordKey = translator.words[key];
	            if (key.length === 1) {
	                return withoutSuffix ? wordKey[0] : wordKey[1];
	            } else {
	                return number + ' ' + translator.correctGrammaticalCase(number, wordKey);
	            }
	        }
	    };
	
	    var sr_cyrl = moment.defineLocale('sr-cyrl', {
	        months: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
	        monthsShort: ['јан.', 'феб.', 'мар.', 'апр.', 'мај', 'јун', 'јул', 'авг.', 'сеп.', 'окт.', 'нов.', 'дец.'],
	        weekdays: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
	        weekdaysShort: ['нед.', 'пон.', 'уто.', 'сре.', 'чет.', 'пет.', 'суб.'],
	        weekdaysMin: ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су'],
	        longDateFormat: {
	            LT: 'H:mm',
	            LTS : 'LT:ss',
	            L: 'DD. MM. YYYY',
	            LL: 'D. MMMM YYYY',
	            LLL: 'D. MMMM YYYY LT',
	            LLLL: 'dddd, D. MMMM YYYY LT'
	        },
	        calendar: {
	            sameDay: '[данас у] LT',
	            nextDay: '[сутра у] LT',
	            nextWeek: function () {
	                switch (this.day()) {
	                case 0:
	                    return '[у] [недељу] [у] LT';
	                case 3:
	                    return '[у] [среду] [у] LT';
	                case 6:
	                    return '[у] [суботу] [у] LT';
	                case 1:
	                case 2:
	                case 4:
	                case 5:
	                    return '[у] dddd [у] LT';
	                }
	            },
	            lastDay  : '[јуче у] LT',
	            lastWeek : function () {
	                var lastWeekDays = [
	                    '[прошле] [недеље] [у] LT',
	                    '[прошлог] [понедељка] [у] LT',
	                    '[прошлог] [уторка] [у] LT',
	                    '[прошле] [среде] [у] LT',
	                    '[прошлог] [четвртка] [у] LT',
	                    '[прошлог] [петка] [у] LT',
	                    '[прошле] [суботе] [у] LT'
	                ];
	                return lastWeekDays[this.day()];
	            },
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'за %s',
	            past   : 'пре %s',
	            s      : 'неколико секунди',
	            m      : translator.translate,
	            mm     : translator.translate,
	            h      : translator.translate,
	            hh     : translator.translate,
	            d      : 'дан',
	            dd     : translator.translate,
	            M      : 'месец',
	            MM     : translator.translate,
	            y      : 'годину',
	            yy     : translator.translate
	        },
	        ordinalParse: /\d{1,2}\./,
	        ordinal : '%d.',
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return sr_cyrl;
	
	}));

/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : swedish (sv)
	//! author : Jens Alm : https://github.com/ulmus
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var sv = moment.defineLocale('sv', {
	        months : 'januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december'.split('_'),
	        monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
	        weekdays : 'söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag'.split('_'),
	        weekdaysShort : 'sön_mån_tis_ons_tor_fre_lör'.split('_'),
	        weekdaysMin : 'sö_må_ti_on_to_fr_lö'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'YYYY-MM-DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Idag] LT',
	            nextDay: '[Imorgon] LT',
	            lastDay: '[Igår] LT',
	            nextWeek: '[På] dddd LT',
	            lastWeek: '[I] dddd[s] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'om %s',
	            past : 'för %s sedan',
	            s : 'några sekunder',
	            m : 'en minut',
	            mm : '%d minuter',
	            h : 'en timme',
	            hh : '%d timmar',
	            d : 'en dag',
	            dd : '%d dagar',
	            M : 'en månad',
	            MM : '%d månader',
	            y : 'ett år',
	            yy : '%d år'
	        },
	        ordinalParse: /\d{1,2}(e|a)/,
	        ordinal : function (number) {
	            var b = number % 10,
	                output = (~~(number % 100 / 10) === 1) ? 'e' :
	                (b === 1) ? 'a' :
	                (b === 2) ? 'a' :
	                (b === 3) ? 'e' : 'e';
	            return number + output;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return sv;
	
	}));

/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : tamil (ta)
	//! author : Arjunkumar Krishnamoorthy : https://github.com/tk120404
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var ta = moment.defineLocale('ta', {
	        months : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
	        monthsShort : 'ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்'.split('_'),
	        weekdays : 'ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை'.split('_'),
	        weekdaysShort : 'ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி'.split('_'),
	        weekdaysMin : 'ஞா_தி_செ_பு_வி_வெ_ச'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY, LT',
	            LLLL : 'dddd, D MMMM YYYY, LT'
	        },
	        calendar : {
	            sameDay : '[இன்று] LT',
	            nextDay : '[நாளை] LT',
	            nextWeek : 'dddd, LT',
	            lastDay : '[நேற்று] LT',
	            lastWeek : '[கடந்த வாரம்] dddd, LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s இல்',
	            past : '%s முன்',
	            s : 'ஒரு சில விநாடிகள்',
	            m : 'ஒரு நிமிடம்',
	            mm : '%d நிமிடங்கள்',
	            h : 'ஒரு மணி நேரம்',
	            hh : '%d மணி நேரம்',
	            d : 'ஒரு நாள்',
	            dd : '%d நாட்கள்',
	            M : 'ஒரு மாதம்',
	            MM : '%d மாதங்கள்',
	            y : 'ஒரு வருடம்',
	            yy : '%d ஆண்டுகள்'
	        },
	        ordinalParse: /\d{1,2}வது/,
	        ordinal : function (number) {
	            return number + 'வது';
	        },
	        // refer http://ta.wikipedia.org/s/1er1
	        meridiemParse: /யாமம்|வைகறை|காலை|நண்பகல்|எற்பாடு|மாலை/,
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 2) {
	                return ' யாமம்';
	            } else if (hour < 6) {
	                return ' வைகறை';  // வைகறை
	            } else if (hour < 10) {
	                return ' காலை'; // காலை
	            } else if (hour < 14) {
	                return ' நண்பகல்'; // நண்பகல்
	            } else if (hour < 18) {
	                return ' எற்பாடு'; // எற்பாடு
	            } else if (hour < 22) {
	                return ' மாலை'; // மாலை
	            } else {
	                return ' யாமம்';
	            }
	        },
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === 'யாமம்') {
	                return hour < 2 ? hour : hour + 12;
	            } else if (meridiem === 'வைகறை' || meridiem === 'காலை') {
	                return hour;
	            } else if (meridiem === 'நண்பகல்') {
	                return hour >= 10 ? hour : hour + 12;
	            } else {
	                return hour + 12;
	            }
	        },
	        week : {
	            dow : 0, // Sunday is the first day of the week.
	            doy : 6  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return ta;
	
	}));

/***/ },
/* 284 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : thai (th)
	//! author : Kridsada Thanabulpong : https://github.com/sirn
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var th = moment.defineLocale('th', {
	        months : 'มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม'.split('_'),
	        monthsShort : 'มกรา_กุมภา_มีนา_เมษา_พฤษภา_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา'.split('_'),
	        weekdays : 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์'.split('_'),
	        weekdaysShort : 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์'.split('_'), // yes, three characters difference
	        weekdaysMin : 'อา._จ._อ._พ._พฤ._ศ._ส.'.split('_'),
	        longDateFormat : {
	            LT : 'H นาฬิกา m นาที',
	            LTS : 'LT s วินาที',
	            L : 'YYYY/MM/DD',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY เวลา LT',
	            LLLL : 'วันddddที่ D MMMM YYYY เวลา LT'
	        },
	        meridiemParse: /ก่อนเที่ยง|หลังเที่ยง/,
	        isPM: function (input) {
	            return input === 'หลังเที่ยง';
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 12) {
	                return 'ก่อนเที่ยง';
	            } else {
	                return 'หลังเที่ยง';
	            }
	        },
	        calendar : {
	            sameDay : '[วันนี้ เวลา] LT',
	            nextDay : '[พรุ่งนี้ เวลา] LT',
	            nextWeek : 'dddd[หน้า เวลา] LT',
	            lastDay : '[เมื่อวานนี้ เวลา] LT',
	            lastWeek : '[วัน]dddd[ที่แล้ว เวลา] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'อีก %s',
	            past : '%sที่แล้ว',
	            s : 'ไม่กี่วินาที',
	            m : '1 นาที',
	            mm : '%d นาที',
	            h : '1 ชั่วโมง',
	            hh : '%d ชั่วโมง',
	            d : '1 วัน',
	            dd : '%d วัน',
	            M : '1 เดือน',
	            MM : '%d เดือน',
	            y : '1 ปี',
	            yy : '%d ปี'
	        }
	    });
	
	    return th;
	
	}));

/***/ },
/* 285 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Tagalog/Filipino (tl-ph)
	//! author : Dan Hagman
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tl_ph = moment.defineLocale('tl-ph', {
	        months : 'Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre'.split('_'),
	        monthsShort : 'Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis'.split('_'),
	        weekdays : 'Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado'.split('_'),
	        weekdaysShort : 'Lin_Lun_Mar_Miy_Huw_Biy_Sab'.split('_'),
	        weekdaysMin : 'Li_Lu_Ma_Mi_Hu_Bi_Sab'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'MM/D/YYYY',
	            LL : 'MMMM D, YYYY',
	            LLL : 'MMMM D, YYYY LT',
	            LLLL : 'dddd, MMMM DD, YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Ngayon sa] LT',
	            nextDay: '[Bukas sa] LT',
	            nextWeek: 'dddd [sa] LT',
	            lastDay: '[Kahapon sa] LT',
	            lastWeek: 'dddd [huling linggo] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'sa loob ng %s',
	            past : '%s ang nakalipas',
	            s : 'ilang segundo',
	            m : 'isang minuto',
	            mm : '%d minuto',
	            h : 'isang oras',
	            hh : '%d oras',
	            d : 'isang araw',
	            dd : '%d araw',
	            M : 'isang buwan',
	            MM : '%d buwan',
	            y : 'isang taon',
	            yy : '%d taon'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return tl_ph;
	
	}));

/***/ },
/* 286 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : turkish (tr)
	//! authors : Erhan Gundogan : https://github.com/erhangundogan,
	//!           Burak Yiğit Kaya: https://github.com/BYK
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var suffixes = {
	        1: '\'inci',
	        5: '\'inci',
	        8: '\'inci',
	        70: '\'inci',
	        80: '\'inci',
	        2: '\'nci',
	        7: '\'nci',
	        20: '\'nci',
	        50: '\'nci',
	        3: '\'üncü',
	        4: '\'üncü',
	        100: '\'üncü',
	        6: '\'ncı',
	        9: '\'uncu',
	        10: '\'uncu',
	        30: '\'uncu',
	        60: '\'ıncı',
	        90: '\'ıncı'
	    };
	
	    var tr = moment.defineLocale('tr', {
	        months : 'Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık'.split('_'),
	        monthsShort : 'Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara'.split('_'),
	        weekdays : 'Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi'.split('_'),
	        weekdaysShort : 'Paz_Pts_Sal_Çar_Per_Cum_Cts'.split('_'),
	        weekdaysMin : 'Pz_Pt_Sa_Ça_Pe_Cu_Ct'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd, D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay : '[bugün saat] LT',
	            nextDay : '[yarın saat] LT',
	            nextWeek : '[haftaya] dddd [saat] LT',
	            lastDay : '[dün] LT',
	            lastWeek : '[geçen hafta] dddd [saat] LT',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : '%s sonra',
	            past : '%s önce',
	            s : 'birkaç saniye',
	            m : 'bir dakika',
	            mm : '%d dakika',
	            h : 'bir saat',
	            hh : '%d saat',
	            d : 'bir gün',
	            dd : '%d gün',
	            M : 'bir ay',
	            MM : '%d ay',
	            y : 'bir yıl',
	            yy : '%d yıl'
	        },
	        ordinalParse: /\d{1,2}'(inci|nci|üncü|ncı|uncu|ıncı)/,
	        ordinal : function (number) {
	            if (number === 0) {  // special case for zero
	                return number + '\'ıncı';
	            }
	            var a = number % 10,
	                b = number % 100 - a,
	                c = number >= 100 ? 100 : null;
	            return number + (suffixes[a] || suffixes[b] || suffixes[c]);
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tr;
	
	}));

/***/ },
/* 287 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Morocco Central Atlas Tamaziɣt (tzm)
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tzm = moment.defineLocale('tzm', {
	        months : 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
	        monthsShort : 'ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ'.split('_'),
	        weekdays : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        weekdaysShort : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        weekdaysMin : 'ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS: 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[ⴰⵙⴷⵅ ⴴ] LT',
	            nextDay: '[ⴰⵙⴽⴰ ⴴ] LT',
	            nextWeek: 'dddd [ⴴ] LT',
	            lastDay: '[ⴰⵚⴰⵏⵜ ⴴ] LT',
	            lastWeek: 'dddd [ⴴ] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'ⴷⴰⴷⵅ ⵙ ⵢⴰⵏ %s',
	            past : 'ⵢⴰⵏ %s',
	            s : 'ⵉⵎⵉⴽ',
	            m : 'ⵎⵉⵏⵓⴺ',
	            mm : '%d ⵎⵉⵏⵓⴺ',
	            h : 'ⵙⴰⵄⴰ',
	            hh : '%d ⵜⴰⵙⵙⴰⵄⵉⵏ',
	            d : 'ⴰⵙⵙ',
	            dd : '%d oⵙⵙⴰⵏ',
	            M : 'ⴰⵢoⵓⵔ',
	            MM : '%d ⵉⵢⵢⵉⵔⵏ',
	            y : 'ⴰⵙⴳⴰⵙ',
	            yy : '%d ⵉⵙⴳⴰⵙⵏ'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tzm;
	
	}));

/***/ },
/* 288 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : Morocco Central Atlas Tamaziɣt in Latin (tzm-latn)
	//! author : Abdel Said : https://github.com/abdelsaid
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var tzm_latn = moment.defineLocale('tzm-latn', {
	        months : 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
	        monthsShort : 'innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir'.split('_'),
	        weekdays : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        weekdaysShort : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        weekdaysMin : 'asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'dddd D MMMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[asdkh g] LT',
	            nextDay: '[aska g] LT',
	            nextWeek: 'dddd [g] LT',
	            lastDay: '[assant g] LT',
	            lastWeek: 'dddd [g] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'dadkh s yan %s',
	            past : 'yan %s',
	            s : 'imik',
	            m : 'minuḍ',
	            mm : '%d minuḍ',
	            h : 'saɛa',
	            hh : '%d tassaɛin',
	            d : 'ass',
	            dd : '%d ossan',
	            M : 'ayowr',
	            MM : '%d iyyirn',
	            y : 'asgas',
	            yy : '%d isgasn'
	        },
	        week : {
	            dow : 6, // Saturday is the first day of the week.
	            doy : 12  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return tzm_latn;
	
	}));

/***/ },
/* 289 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : ukrainian (uk)
	//! author : zemlanin : https://github.com/zemlanin
	//! Author : Menelion Elensúle : https://github.com/Oire
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    function plural(word, num) {
	        var forms = word.split('_');
	        return num % 10 === 1 && num % 100 !== 11 ? forms[0] : (num % 10 >= 2 && num % 10 <= 4 && (num % 100 < 10 || num % 100 >= 20) ? forms[1] : forms[2]);
	    }
	    function relativeTimeWithPlural(number, withoutSuffix, key) {
	        var format = {
	            'mm': 'хвилина_хвилини_хвилин',
	            'hh': 'година_години_годин',
	            'dd': 'день_дні_днів',
	            'MM': 'місяць_місяці_місяців',
	            'yy': 'рік_роки_років'
	        };
	        if (key === 'm') {
	            return withoutSuffix ? 'хвилина' : 'хвилину';
	        }
	        else if (key === 'h') {
	            return withoutSuffix ? 'година' : 'годину';
	        }
	        else {
	            return number + ' ' + plural(format[key], +number);
	        }
	    }
	    function monthsCaseReplace(m, format) {
	        var months = {
	            'nominative': 'січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень'.split('_'),
	            'accusative': 'січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня'.split('_')
	        },
	        nounCase = (/D[oD]? *MMMM?/).test(format) ?
	            'accusative' :
	            'nominative';
	        return months[nounCase][m.month()];
	    }
	    function weekdaysCaseReplace(m, format) {
	        var weekdays = {
	            'nominative': 'неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота'.split('_'),
	            'accusative': 'неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу'.split('_'),
	            'genitive': 'неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи'.split('_')
	        },
	        nounCase = (/(\[[ВвУу]\]) ?dddd/).test(format) ?
	            'accusative' :
	            ((/\[?(?:минулої|наступної)? ?\] ?dddd/).test(format) ?
	                'genitive' :
	                'nominative');
	        return weekdays[nounCase][m.day()];
	    }
	    function processHoursFunction(str) {
	        return function () {
	            return str + 'о' + (this.hours() === 11 ? 'б' : '') + '] LT';
	        };
	    }
	
	    var uk = moment.defineLocale('uk', {
	        months : monthsCaseReplace,
	        monthsShort : 'січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд'.split('_'),
	        weekdays : weekdaysCaseReplace,
	        weekdaysShort : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        weekdaysMin : 'нд_пн_вт_ср_чт_пт_сб'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD.MM.YYYY',
	            LL : 'D MMMM YYYY р.',
	            LLL : 'D MMMM YYYY р., LT',
	            LLLL : 'dddd, D MMMM YYYY р., LT'
	        },
	        calendar : {
	            sameDay: processHoursFunction('[Сьогодні '),
	            nextDay: processHoursFunction('[Завтра '),
	            lastDay: processHoursFunction('[Вчора '),
	            nextWeek: processHoursFunction('[У] dddd ['),
	            lastWeek: function () {
	                switch (this.day()) {
	                case 0:
	                case 3:
	                case 5:
	                case 6:
	                    return processHoursFunction('[Минулої] dddd [').call(this);
	                case 1:
	                case 2:
	                case 4:
	                    return processHoursFunction('[Минулого] dddd [').call(this);
	                }
	            },
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : 'за %s',
	            past : '%s тому',
	            s : 'декілька секунд',
	            m : relativeTimeWithPlural,
	            mm : relativeTimeWithPlural,
	            h : 'годину',
	            hh : relativeTimeWithPlural,
	            d : 'день',
	            dd : relativeTimeWithPlural,
	            M : 'місяць',
	            MM : relativeTimeWithPlural,
	            y : 'рік',
	            yy : relativeTimeWithPlural
	        },
	        // M. E.: those two are virtually unused but a user might want to implement them for his/her website for some reason
	        meridiemParse: /ночі|ранку|дня|вечора/,
	        isPM: function (input) {
	            return /^(дня|вечора)$/.test(input);
	        },
	        meridiem : function (hour, minute, isLower) {
	            if (hour < 4) {
	                return 'ночі';
	            } else if (hour < 12) {
	                return 'ранку';
	            } else if (hour < 17) {
	                return 'дня';
	            } else {
	                return 'вечора';
	            }
	        },
	        ordinalParse: /\d{1,2}-(й|го)/,
	        ordinal: function (number, period) {
	            switch (period) {
	            case 'M':
	            case 'd':
	            case 'DDD':
	            case 'w':
	            case 'W':
	                return number + '-й';
	            case 'D':
	                return number + '-го';
	            default:
	                return number;
	            }
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 1st is the first week of the year.
	        }
	    });
	
	    return uk;
	
	}));

/***/ },
/* 290 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : uzbek (uz)
	//! author : Sardor Muminov : https://github.com/muminoff
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var uz = moment.defineLocale('uz', {
	        months : 'январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь'.split('_'),
	        monthsShort : 'янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек'.split('_'),
	        weekdays : 'Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба'.split('_'),
	        weekdaysShort : 'Якш_Душ_Сеш_Чор_Пай_Жум_Шан'.split('_'),
	        weekdaysMin : 'Як_Ду_Се_Чо_Па_Жу_Ша'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM YYYY',
	            LLL : 'D MMMM YYYY LT',
	            LLLL : 'D MMMM YYYY, dddd LT'
	        },
	        calendar : {
	            sameDay : '[Бугун соат] LT [да]',
	            nextDay : '[Эртага] LT [да]',
	            nextWeek : 'dddd [куни соат] LT [да]',
	            lastDay : '[Кеча соат] LT [да]',
	            lastWeek : '[Утган] dddd [куни соат] LT [да]',
	            sameElse : 'L'
	        },
	        relativeTime : {
	            future : 'Якин %s ичида',
	            past : 'Бир неча %s олдин',
	            s : 'фурсат',
	            m : 'бир дакика',
	            mm : '%d дакика',
	            h : 'бир соат',
	            hh : '%d соат',
	            d : 'бир кун',
	            dd : '%d кун',
	            M : 'бир ой',
	            MM : '%d ой',
	            y : 'бир йил',
	            yy : '%d йил'
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 7  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return uz;
	
	}));

/***/ },
/* 291 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : vietnamese (vi)
	//! author : Bang Nguyen : https://github.com/bangnk
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var vi = moment.defineLocale('vi', {
	        months : 'tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12'.split('_'),
	        monthsShort : 'Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12'.split('_'),
	        weekdays : 'chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy'.split('_'),
	        weekdaysShort : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        weekdaysMin : 'CN_T2_T3_T4_T5_T6_T7'.split('_'),
	        longDateFormat : {
	            LT : 'HH:mm',
	            LTS : 'LT:ss',
	            L : 'DD/MM/YYYY',
	            LL : 'D MMMM [năm] YYYY',
	            LLL : 'D MMMM [năm] YYYY LT',
	            LLLL : 'dddd, D MMMM [năm] YYYY LT',
	            l : 'DD/M/YYYY',
	            ll : 'D MMM YYYY',
	            lll : 'D MMM YYYY LT',
	            llll : 'ddd, D MMM YYYY LT'
	        },
	        calendar : {
	            sameDay: '[Hôm nay lúc] LT',
	            nextDay: '[Ngày mai lúc] LT',
	            nextWeek: 'dddd [tuần tới lúc] LT',
	            lastDay: '[Hôm qua lúc] LT',
	            lastWeek: 'dddd [tuần rồi lúc] LT',
	            sameElse: 'L'
	        },
	        relativeTime : {
	            future : '%s tới',
	            past : '%s trước',
	            s : 'vài giây',
	            m : 'một phút',
	            mm : '%d phút',
	            h : 'một giờ',
	            hh : '%d giờ',
	            d : 'một ngày',
	            dd : '%d ngày',
	            M : 'một tháng',
	            MM : '%d tháng',
	            y : 'một năm',
	            yy : '%d năm'
	        },
	        ordinalParse: /\d{1,2}/,
	        ordinal : function (number) {
	            return number;
	        },
	        week : {
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return vi;
	
	}));

/***/ },
/* 292 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : chinese (zh-cn)
	//! author : suupic : https://github.com/suupic
	//! author : Zeno Zeng : https://github.com/zenozeng
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var zh_cn = moment.defineLocale('zh-cn', {
	        months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
	        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
	        weekdaysShort : '周日_周一_周二_周三_周四_周五_周六'.split('_'),
	        weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
	        longDateFormat : {
	            LT : 'Ah点mm分',
	            LTS : 'Ah点m分s秒',
	            L : 'YYYY-MM-DD',
	            LL : 'YYYY年MMMD日',
	            LLL : 'YYYY年MMMD日LT',
	            LLLL : 'YYYY年MMMD日ddddLT',
	            l : 'YYYY-MM-DD',
	            ll : 'YYYY年MMMD日',
	            lll : 'YYYY年MMMD日LT',
	            llll : 'YYYY年MMMD日ddddLT'
	        },
	        meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
	        meridiemHour: function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '凌晨' || meridiem === '早上' ||
	                    meridiem === '上午') {
	                return hour;
	            } else if (meridiem === '下午' || meridiem === '晚上') {
	                return hour + 12;
	            } else {
	                // '中午'
	                return hour >= 11 ? hour : hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 600) {
	                return '凌晨';
	            } else if (hm < 900) {
	                return '早上';
	            } else if (hm < 1130) {
	                return '上午';
	            } else if (hm < 1230) {
	                return '中午';
	            } else if (hm < 1800) {
	                return '下午';
	            } else {
	                return '晚上';
	            }
	        },
	        calendar : {
	            sameDay : function () {
	                return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
	            },
	            nextDay : function () {
	                return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
	            },
	            lastDay : function () {
	                return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
	            },
	            nextWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
	                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
	            },
	            lastWeek : function () {
	                var startOfWeek, prefix;
	                startOfWeek = moment().startOf('week');
	                prefix = this.unix() < startOfWeek.unix()  ? '[上]' : '[本]';
	                return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
	            },
	            sameElse : 'LL'
	        },
	        ordinalParse: /\d{1,2}(日|月|周)/,
	        ordinal : function (number, period) {
	            switch (period) {
	            case 'd':
	            case 'D':
	            case 'DDD':
	                return number + '日';
	            case 'M':
	                return number + '月';
	            case 'w':
	            case 'W':
	                return number + '周';
	            default:
	                return number;
	            }
	        },
	        relativeTime : {
	            future : '%s内',
	            past : '%s前',
	            s : '几秒',
	            m : '1 分钟',
	            mm : '%d 分钟',
	            h : '1 小时',
	            hh : '%d 小时',
	            d : '1 天',
	            dd : '%d 天',
	            M : '1 个月',
	            MM : '%d 个月',
	            y : '1 年',
	            yy : '%d 年'
	        },
	        week : {
	            // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
	            dow : 1, // Monday is the first day of the week.
	            doy : 4  // The week that contains Jan 4th is the first week of the year.
	        }
	    });
	
	    return zh_cn;
	
	}));

/***/ },
/* 293 */
/***/ function(module, exports, __webpack_require__) {

	//! moment.js locale configuration
	//! locale : traditional chinese (zh-tw)
	//! author : Ben : https://github.com/ben-lin
	
	(function (global, factory) {
	   true ? factory(__webpack_require__(209)) :
	   typeof define === 'function' && define.amd ? define(['moment'], factory) :
	   factory(global.moment)
	}(this, function (moment) { 'use strict';
	
	
	    var zh_tw = moment.defineLocale('zh-tw', {
	        months : '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
	        monthsShort : '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
	        weekdays : '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
	        weekdaysShort : '週日_週一_週二_週三_週四_週五_週六'.split('_'),
	        weekdaysMin : '日_一_二_三_四_五_六'.split('_'),
	        longDateFormat : {
	            LT : 'Ah點mm分',
	            LTS : 'Ah點m分s秒',
	            L : 'YYYY年MMMD日',
	            LL : 'YYYY年MMMD日',
	            LLL : 'YYYY年MMMD日LT',
	            LLLL : 'YYYY年MMMD日ddddLT',
	            l : 'YYYY年MMMD日',
	            ll : 'YYYY年MMMD日',
	            lll : 'YYYY年MMMD日LT',
	            llll : 'YYYY年MMMD日ddddLT'
	        },
	        meridiemParse: /早上|上午|中午|下午|晚上/,
	        meridiemHour : function (hour, meridiem) {
	            if (hour === 12) {
	                hour = 0;
	            }
	            if (meridiem === '早上' || meridiem === '上午') {
	                return hour;
	            } else if (meridiem === '中午') {
	                return hour >= 11 ? hour : hour + 12;
	            } else if (meridiem === '下午' || meridiem === '晚上') {
	                return hour + 12;
	            }
	        },
	        meridiem : function (hour, minute, isLower) {
	            var hm = hour * 100 + minute;
	            if (hm < 900) {
	                return '早上';
	            } else if (hm < 1130) {
	                return '上午';
	            } else if (hm < 1230) {
	                return '中午';
	            } else if (hm < 1800) {
	                return '下午';
	            } else {
	                return '晚上';
	            }
	        },
	        calendar : {
	            sameDay : '[今天]LT',
	            nextDay : '[明天]LT',
	            nextWeek : '[下]ddddLT',
	            lastDay : '[昨天]LT',
	            lastWeek : '[上]ddddLT',
	            sameElse : 'L'
	        },
	        ordinalParse: /\d{1,2}(日|月|週)/,
	        ordinal : function (number, period) {
	            switch (period) {
	            case 'd' :
	            case 'D' :
	            case 'DDD' :
	                return number + '日';
	            case 'M' :
	                return number + '月';
	            case 'w' :
	            case 'W' :
	                return number + '週';
	            default :
	                return number;
	            }
	        },
	        relativeTime : {
	            future : '%s內',
	            past : '%s前',
	            s : '幾秒',
	            m : '一分鐘',
	            mm : '%d分鐘',
	            h : '一小時',
	            hh : '%d小時',
	            d : '一天',
	            dd : '%d天',
	            M : '一個月',
	            MM : '%d個月',
	            y : '一年',
	            yy : '%d年'
	        }
	    });
	
	    return zh_tw;
	
	}));

/***/ },
/* 294 */,
/* 295 */,
/* 296 */,
/* 297 */,
/* 298 */,
/* 299 */,
/* 300 */,
/* 301 */,
/* 302 */,
/* 303 */,
/* 304 */,
/* 305 */,
/* 306 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var Auth = __webpack_require__(2);
	var Utils = __webpack_require__(5);
	Utils.ParsleyConfig();
	__webpack_require__(22);
	__webpack_require__(23);
	__webpack_require__(207);
	var moment = __webpack_require__(209);
	
	function step1() {
	    $('input[name="payment_method"]').on('change', function () {
	        if ($(this).attr('id') === 'payment_method1') {
	            $('.payment_method1').removeClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method2') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').removeClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method3') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').removeClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method4') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').removeClass('hide');
	        }
	    });
	
	    $('.book_signin').on('click', function () {
	        $('#sig_form').addClass('hide');
	        $('.sig_form').addClass('hide');
	        $('#reg_form').removeClass('hide');
	        $('.reg_form').removeClass('hide');
	    });
	    $('.book_register').on('click', function () {
	        $('#sig_form').removeClass('hide');
	        $('.sig_form').removeClass('hide');
	        $('#reg_form').addClass('hide');
	        $('.reg_form').addClass('hide');
	    });
	    Auth.Authenticate(false, function (data) {
	        console.debug(data);
	        window.location.reload();
	    });
	
	    //Auth.SignUp(false,function () {
	    //    window.location.reload();
	    //});
	    //Auth.LoginInitialize();
	    //Auth.ResetInitialize(true);
	}
	function step2() {
	    var classDate = moment(window.ttcountdownTimer, 'YYYY-MM-DD hh:mmA');
	    var today = moment();
	    var duration = classDate.diff(today, 'seconds');
	    var timer = 0;
	    if (duration > 0) {
	        timer = duration;
	    }
	    var clock = $('.clock').FlipClock(timer, {
	        clockFace: 'DailyCounter',
	        countdown: true
	    });
	    clock.start();
	    $('input[name="payment_method"]').on('change', function () {
	        if ($(this).attr('id') === 'payment_method1') {
	            $('.payment_method1').removeClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method2') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').removeClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method3') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').removeClass('hide');
	            $('.payment_method4').addClass('hide');
	        }
	        if ($(this).attr('id') === 'payment_method4') {
	            $('.payment_method1').addClass('hide');
	            $('.payment_method2').addClass('hide');
	            $('.payment_method3').addClass('hide');
	            $('.payment_method4').removeClass('hide');
	        }
	    });
	}
	function step3() {
	    console.log('hello');
	    Utils.parsleyfyForm($('#message_tutor_form'));
	    var textarea = $('textarea[name="message_to_tutor"]');
	    textarea.val('');
	    $(textarea).keyup(function () {
	        // Utils.keyupCallback(this, 1200, $('#textCounter'));
	    });
	}
	$(function () {
	    $('[data-toggle="popover"]').popover();
	    if (window.StepCount === 1) {
	        step1();
	    }
	    if (window.StepCount === 2) {
	        step2();
	    }
	    if (window.StepCount === 3) {
	        step3();
	    }
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }
/******/ ]);
//# sourceMappingURL=booking_page.bundle.js.map