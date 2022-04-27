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

	__webpack_require__(1);
	__webpack_require__(8);
	module.exports = __webpack_require__(458);


/***/ },

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/* global $ */
	// require('bootstrap');
	'use strict';
	
	var Utils = __webpack_require__(3);
	var Urls = __webpack_require__(5);
	__webpack_require__(6);
	var mdetect = __webpack_require__(7);
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
	        form.find('.invalid-form-error-message').html('Email Sent!').addClass("filled");
	        console.log(xhr);
	    };
	    if (regular) {
	        Utils.FormInitialize(form, before, success, 'text', '#resetButton');
	    }
	}
	function intelInput() {
	    $("#id_phone_number").intlTelInput({
	        defaultCountry: "ng",
	        onlyCountries: ["ng"],
	        utilsScript: "/static/js/utils.js" // just for formatting/placeholders etc
	    });
	}
	
	function phone_value(phone) {
	    var country = phone.intlTelInput("getSelectedCountryData").dialCode,
	        isValid = phone.intlTelInput("isValidNumber");
	    if (isValid === false) {
	        return "+" + country + phone.val();
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
	        console.log("parsley kicked");
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
	                var phone = $("#id_phone_number");
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
	    } else {
	        // signup_form.submit()
	        // Utils.formSubmission(signup_form, beforSubmit, successCallback, errorCallback,null);  
	    }
	
	    function displayMailingList(status) {
	        console.log("Triggered");
	        var form = $('#signup_form'),
	            phone = $("#phone_no"),
	            password = $("#pass_group"),
	            phone_container = $('#phone_container'),
	            password_container = $('#password_container'),
	            submitBtn = $("#submit_btn");
	        if (status) {
	            form.attr('action', Urls['users:mailing_signup']());
	            // if (phone.length > 0) {
	            phone_data = phone.remove();
	            // }
	            // if (password.length > 0) {
	            password_data = password.remove();
	            // }
	            $("#signup_header_text").removeClass('hidden').addClass('hidden');
	            $("#maillist_header_text").removeClass('hidden');
	            submitBtn.text("Subscribe");
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
	            $("#maillist_header_text").removeClass('hidden').addClass('hidden');
	            $("#signup_header_text").removeClass('hidden');
	            submitBtn.text("Join Now");
	            $('.last.agree-to').removeClass('hidden');
	        }
	    }
	
	    // if (no_phone) {
	    country.change(function () {
	        var selected = $(this).find("option:selected");
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
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            $("form[name='search-form']").submit();
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
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            $('#mobile-nav-search-form').submit();
	        }
	    });
	    Utils.ApplyTypeaheadToInput($('#mobile_search_form22'), 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
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
	        window.location.hash = "#launch_sec";
	    });
	
	    $(".share-popup").click(function (e) {
	        e.preventDefault();
	        console.log("I was clicked");
	        var window_size = "";
	        var url = this.href;
	        var domain = url.split("/")[2];
	        console.log(domain);
	        switch (domain) {
	            case "www.facebook.com":
	                $.get(Urls['button_clicks']() + '?button_type=facebook', function () {});
	                window_size = "width=585,height=368";
	                break;
	            case "twitter.com":
	                $.get(Urls['button_clicks']() + '?button_type=twitter', function () {});
	                window_size = "width=585,height=261";
	                break;
	            case "plus.google.com":
	                $.get(Urls['button_clicks']() + '?button_type=google', function () {});
	                window_size = "width=517,height=511";
	                break;
	            default:
	                window_size = "width=585,height=511";
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
	exports.SignUp = SignUp;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 2:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {//require('typeahead.js');
	'use strict';
	
	var Bloodhound = __webpack_require__(4);
	var Urls = __webpack_require__(5);
	function getBloodhoundInstance(name, prefetch, remote) {
	    var data = {
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace(name),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        limit: 10,
	        prefetch: prefetch
	    };
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
	            $('.invalid-form-error-message').html(resp.__all__[0]).addClass("filled");
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
	                    var end_time = moment(value, "hh:mm: A");
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
	                    var end_time = moment(value, "hh:mm: A");
	                    var start_time = moment($(requirement).val(), "hh:mm: A");
	
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
	                validate_time: "Pls input a time in this format 6:00 AM",
	                no_email: 'Email addresses are not allowed in this field',
	                validate_word_count: 'Please input at least 300 words. No unnecessary spaces please.'
	            }
	        }
	    };
	}
	
	var parsleyConfig = {
	    successClass: "has-success",
	    errorClass: "has-error",
	    classHandler: function classHandler(el) {
	        return el.$element.closest(".form-group");
	    },
	    errorsContainer: function errorsContainer(el) {
	        return el.$element.closest(".form-group");
	    },
	    errorsWrapper: "<span class='help-block'></span>",
	    errorTemplate: "<span></span>",
	    excluded: "input[type=text]:hidden, input[type=select]:hidden, textarea:hidden"
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
	        dt = "json";
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
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        callback();
	    });
	}
	function GenericSkillSearchAutocomplete(input, form) {
	    //var BH = getBloodhoundInstance('name', Urls['ajax_skills_all'](), Urls['ajax_tags_all']('%QUERY'));
	    var BH = getBloodhoundInstance('name', Urls['ajax_skills_all']());
	
	    BH.initialize();
	    ApplyTypeaheadToInput(input, 'name', 'name', BH, function (obj, datum, name) {
	        var skill = datum.name.split(" in ")[0].trim();
	        $(this).typeahead('val', skill);
	        if (datum.slug) {
	            window.location.href = Urls["skill_only_view"](datum.slug);
	        } else {
	
	            form.submit();
	        }
	    });
	    console.log(form);
	    if (form.length > 0) {
	
	        form.parsley();
	    }
	}
	
	function GoogleAutoComplete(input, callback, custom_callback) {
	    var autocomplete, map, geocoder, marker;
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
	        if (!!custom_callback) {
	            custom_callback(map, geocoder, marker);
	        }
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
	    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
	    );
	}
	function appendCSRFTOKEN() {
	    $.ajaxSetup({
	        beforeSend: function beforeSend(xhr, settings) {
	            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
	                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
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
	function GeocodeFunction(geocoder, full_address, successcallback, callback, errorCallback) {
	    geocoder.geocode({ 'address': full_address }, function (results, status) {
	        if (status == window.google.maps.GeocoderStatus.OK) {
	            console.log(results);
	            if (results.length > 0) {
	                var address = full_address;
	                var latitude = results[0].geometry.location.lat().toFixed(7);
	                var longitude = results[0].geometry.location.lng().toFixed(7);
	                successcallback(latitude, longitude, results);
	            }
	            callback();
	        } else {
	            errorCallback();
	        }
	    });
	}
	function GetLongitudeAndLatitudeAndSubmit(filterform, location_field, longitude_field, latitude_field, state_field, callback) {
	    var cb = callback || function () {};
	
	    filterform.on("submit", function (e) {
	        e.preventDefault();
	        var that = this;
	        var s = "";
	        if (state_field) {
	            s = state_field.val() ? state_field.val() : "";
	        }
	        var full_address = location_field.val() + " " + s;
	        console.log(full_address);
	        var geocoder = cb();
	
	        if (geocoder) {
	            GeocodeFunction(geocoder, full_address, function (latitude, longitude) {
	                location_field.val(full_address);
	                if (latitude) {
	                    latitude_field.val(parseFloat(latitude).toFixed(5));
	                }
	                if (longitude) {
	                    longitude_field.val(parseFloat(longitude).toFixed(5));
	                }
	            }, function () {
	                $(that).unbind("submit").submit();
	            }, function () {
	                var field = location_field.val();
	                if (field === "") {
	                    longitude_field.val("");
	                    latitude_field.val("");
	                }
	                $(that).unbind("submit").submit();
	            });
	        } else {
	            $(that).unbind("submit").submit();
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
	exports.GeocodeFunction = GeocodeFunction;
	exports.filterOptionByText = function (node, text) {
	    return node.find('option').filter(function () {
	        node.trigger('change');
	        if (text == 'Federal Capital Territory') {
	            return $(this).html() == 'Abuja';
	        }
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 4:
/***/ function(module, exports) {

	module.exports = Bloodhound;

/***/ },

/***/ 5:
/***/ function(module, exports) {

	module.exports = Urls;

/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	International Telephone Input v3.7.1
	https://github.com/Bluefieldscom/intl-tel-input.git
	*/
	"use strict";
	
	(function (factory) {
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function ($) {
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
	                    }, 1e3);
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
	// wrap in UMD - see https://github.com/umdjs/umd/blob/master/jqueryPlugin.js

/***/ },

/***/ 7:
/***/ function(module, exports) {

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

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	__webpack_require__(9);
	
	$(function () {
		$('#mobile_navigation .search').click(function () {
			$('#mobile_skill_input').focus();
		});
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 9:
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 12:
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
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
	        return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
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
	  Validator = 'undefined' !== typeof Validator ? Validator :  true ? module.exports : null;
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
	    defaultMessage: "This value seems to be invalid.",
	    type: {
	      email: "This value should be a valid email.",
	      url: "This value should be a valid url.",
	      number: "This value should be a valid number.",
	      integer: "This value should be a valid integer.",
	      digits: "This value should be digits.",
	      alphanum: "This value should be alphanumeric."
	    },
	    notblank: "This value should not be blank.",
	    required: "This value is required.",
	    pattern: "This value seems to be invalid.",
	    min: "This value should be greater than or equal to %s.",
	    max: "This value should be lower than or equal to %s.",
	    range: "This value should be between %s and %s.",
	    minlength: "This value is too short. It should have %s characters or more.",
	    maxlength: "This value is too long. It should have %s characters or fewer.",
	    length: "This value length is invalid. It should be between %s and %s characters long.",
	    mincheck: "You must select at least %s choices.",
	    maxcheck: "You must select %s choices or fewer.",
	    check: "You must select between %s and %s choices.",
	    equalto: "This value should be the same."
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

/***/ 15:
/***/ function(module, exports) {

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

/***/ 120:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/**
	 * @license
	 * lodash 3.10.1 (Custom Build) <https://lodash.com/>
	 * Build: `lodash modern -d -o ./index.js`
	 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
	 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
	 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	 * Available under MIT license <https://lodash.com/license>
	 */
	;(function() {
	
	  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
	  var undefined;
	
	  /** Used as the semantic version number. */
	  var VERSION = '3.10.1';
	
	  /** Used to compose bitmasks for wrapper metadata. */
	  var BIND_FLAG = 1,
	      BIND_KEY_FLAG = 2,
	      CURRY_BOUND_FLAG = 4,
	      CURRY_FLAG = 8,
	      CURRY_RIGHT_FLAG = 16,
	      PARTIAL_FLAG = 32,
	      PARTIAL_RIGHT_FLAG = 64,
	      ARY_FLAG = 128,
	      REARG_FLAG = 256;
	
	  /** Used as default options for `_.trunc`. */
	  var DEFAULT_TRUNC_LENGTH = 30,
	      DEFAULT_TRUNC_OMISSION = '...';
	
	  /** Used to detect when a function becomes hot. */
	  var HOT_COUNT = 150,
	      HOT_SPAN = 16;
	
	  /** Used as the size to enable large array optimizations. */
	  var LARGE_ARRAY_SIZE = 200;
	
	  /** Used to indicate the type of lazy iteratees. */
	  var LAZY_FILTER_FLAG = 1,
	      LAZY_MAP_FLAG = 2;
	
	  /** Used as the `TypeError` message for "Functions" methods. */
	  var FUNC_ERROR_TEXT = 'Expected a function';
	
	  /** Used as the internal argument placeholder. */
	  var PLACEHOLDER = '__lodash_placeholder__';
	
	  /** `Object#toString` result references. */
	  var argsTag = '[object Arguments]',
	      arrayTag = '[object Array]',
	      boolTag = '[object Boolean]',
	      dateTag = '[object Date]',
	      errorTag = '[object Error]',
	      funcTag = '[object Function]',
	      mapTag = '[object Map]',
	      numberTag = '[object Number]',
	      objectTag = '[object Object]',
	      regexpTag = '[object RegExp]',
	      setTag = '[object Set]',
	      stringTag = '[object String]',
	      weakMapTag = '[object WeakMap]';
	
	  var arrayBufferTag = '[object ArrayBuffer]',
	      float32Tag = '[object Float32Array]',
	      float64Tag = '[object Float64Array]',
	      int8Tag = '[object Int8Array]',
	      int16Tag = '[object Int16Array]',
	      int32Tag = '[object Int32Array]',
	      uint8Tag = '[object Uint8Array]',
	      uint8ClampedTag = '[object Uint8ClampedArray]',
	      uint16Tag = '[object Uint16Array]',
	      uint32Tag = '[object Uint32Array]';
	
	  /** Used to match empty string literals in compiled template source. */
	  var reEmptyStringLeading = /\b__p \+= '';/g,
	      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
	      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
	
	  /** Used to match HTML entities and HTML characters. */
	  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
	      reUnescapedHtml = /[&<>"'`]/g,
	      reHasEscapedHtml = RegExp(reEscapedHtml.source),
	      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
	
	  /** Used to match template delimiters. */
	  var reEscape = /<%-([\s\S]+?)%>/g,
	      reEvaluate = /<%([\s\S]+?)%>/g,
	      reInterpolate = /<%=([\s\S]+?)%>/g;
	
	  /** Used to match property names within property paths. */
	  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
	      reIsPlainProp = /^\w*$/,
	      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
	
	  /**
	   * Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns)
	   * and those outlined by [`EscapeRegExpPattern`](http://ecma-international.org/ecma-262/6.0/#sec-escaperegexppattern).
	   */
	  var reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,
	      reHasRegExpChars = RegExp(reRegExpChars.source);
	
	  /** Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks). */
	  var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;
	
	  /** Used to match backslashes in property paths. */
	  var reEscapeChar = /\\(\\)?/g;
	
	  /** Used to match [ES template delimiters](http://ecma-international.org/ecma-262/6.0/#sec-template-literal-lexical-components). */
	  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
	
	  /** Used to match `RegExp` flags from their coerced string values. */
	  var reFlags = /\w*$/;
	
	  /** Used to detect hexadecimal string values. */
	  var reHasHexPrefix = /^0[xX]/;
	
	  /** Used to detect host constructors (Safari > 5). */
	  var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	  /** Used to detect unsigned integer values. */
	  var reIsUint = /^\d+$/;
	
	  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
	  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;
	
	  /** Used to ensure capturing order of template delimiters. */
	  var reNoMatch = /($^)/;
	
	  /** Used to match unescaped characters in compiled string literals. */
	  var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
	
	  /** Used to match words to create compound words. */
	  var reWords = (function() {
	    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
	        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';
	
	    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
	  }());
	
	  /** Used to assign default `context` object properties. */
	  var contextProps = [
	    'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',
	    'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',
	    'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'isFinite',
	    'parseFloat', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',
	    'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap'
	  ];
	
	  /** Used to make template sourceURLs easier to identify. */
	  var templateCounter = -1;
	
	  /** Used to identify `toStringTag` values of typed arrays. */
	  var typedArrayTags = {};
	  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	  typedArrayTags[uint32Tag] = true;
	  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	
	  /** Used to identify `toStringTag` values supported by `_.clone`. */
	  var cloneableTags = {};
	  cloneableTags[argsTag] = cloneableTags[arrayTag] =
	  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	  cloneableTags[dateTag] = cloneableTags[float32Tag] =
	  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	  cloneableTags[numberTag] = cloneableTags[objectTag] =
	  cloneableTags[regexpTag] = cloneableTags[stringTag] =
	  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	  cloneableTags[errorTag] = cloneableTags[funcTag] =
	  cloneableTags[mapTag] = cloneableTags[setTag] =
	  cloneableTags[weakMapTag] = false;
	
	  /** Used to map latin-1 supplementary letters to basic latin letters. */
	  var deburredLetters = {
	    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	    '\xc7': 'C',  '\xe7': 'c',
	    '\xd0': 'D',  '\xf0': 'd',
	    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	    '\xd1': 'N',  '\xf1': 'n',
	    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	    '\xc6': 'Ae', '\xe6': 'ae',
	    '\xde': 'Th', '\xfe': 'th',
	    '\xdf': 'ss'
	  };
	
	  /** Used to map characters to HTML entities. */
	  var htmlEscapes = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#39;',
	    '`': '&#96;'
	  };
	
	  /** Used to map HTML entities to characters. */
	  var htmlUnescapes = {
	    '&amp;': '&',
	    '&lt;': '<',
	    '&gt;': '>',
	    '&quot;': '"',
	    '&#39;': "'",
	    '&#96;': '`'
	  };
	
	  /** Used to determine if values are of the language type `Object`. */
	  var objectTypes = {
	    'function': true,
	    'object': true
	  };
	
	  /** Used to escape characters for inclusion in compiled regexes. */
	  var regexpEscapes = {
	    '0': 'x30', '1': 'x31', '2': 'x32', '3': 'x33', '4': 'x34',
	    '5': 'x35', '6': 'x36', '7': 'x37', '8': 'x38', '9': 'x39',
	    'A': 'x41', 'B': 'x42', 'C': 'x43', 'D': 'x44', 'E': 'x45', 'F': 'x46',
	    'a': 'x61', 'b': 'x62', 'c': 'x63', 'd': 'x64', 'e': 'x65', 'f': 'x66',
	    'n': 'x6e', 'r': 'x72', 't': 'x74', 'u': 'x75', 'v': 'x76', 'x': 'x78'
	  };
	
	  /** Used to escape characters for inclusion in compiled string literals. */
	  var stringEscapes = {
	    '\\': '\\',
	    "'": "'",
	    '\n': 'n',
	    '\r': 'r',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };
	
	  /** Detect free variable `exports`. */
	  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
	
	  /** Detect free variable `module`. */
	  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
	
	  /** Detect free variable `global` from Node.js. */
	  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;
	
	  /** Detect free variable `self`. */
	  var freeSelf = objectTypes[typeof self] && self && self.Object && self;
	
	  /** Detect free variable `window`. */
	  var freeWindow = objectTypes[typeof window] && window && window.Object && window;
	
	  /** Detect the popular CommonJS extension `module.exports`. */
	  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
	
	  /**
	   * Used as a reference to the global object.
	   *
	   * The `this` value is used if it's the global object to avoid Greasemonkey's
	   * restricted `window` object, otherwise the `window` object is used.
	   */
	  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * The base implementation of `compareAscending` which compares values and
	   * sorts them in ascending order without guaranteeing a stable sort.
	   *
	   * @private
	   * @param {*} value The value to compare.
	   * @param {*} other The other value to compare.
	   * @returns {number} Returns the sort order indicator for `value`.
	   */
	  function baseCompareAscending(value, other) {
	    if (value !== other) {
	      var valIsNull = value === null,
	          valIsUndef = value === undefined,
	          valIsReflexive = value === value;
	
	      var othIsNull = other === null,
	          othIsUndef = other === undefined,
	          othIsReflexive = other === other;
	
	      if ((value > other && !othIsNull) || !valIsReflexive ||
	          (valIsNull && !othIsUndef && othIsReflexive) ||
	          (valIsUndef && othIsReflexive)) {
	        return 1;
	      }
	      if ((value < other && !valIsNull) || !othIsReflexive ||
	          (othIsNull && !valIsUndef && valIsReflexive) ||
	          (othIsUndef && valIsReflexive)) {
	        return -1;
	      }
	    }
	    return 0;
	  }
	
	  /**
	   * The base implementation of `_.findIndex` and `_.findLastIndex` without
	   * support for callback shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {Function} predicate The function invoked per iteration.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseFindIndex(array, predicate, fromRight) {
	    var length = array.length,
	        index = fromRight ? length : -1;
	
	    while ((fromRight ? index-- : ++index < length)) {
	      if (predicate(array[index], index, array)) {
	        return index;
	      }
	    }
	    return -1;
	  }
	
	  /**
	   * The base implementation of `_.indexOf` without support for binary searches.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {*} value The value to search for.
	   * @param {number} fromIndex The index to search from.
	   * @returns {number} Returns the index of the matched value, else `-1`.
	   */
	  function baseIndexOf(array, value, fromIndex) {
	    if (value !== value) {
	      return indexOfNaN(array, fromIndex);
	    }
	    var index = fromIndex - 1,
	        length = array.length;
	
	    while (++index < length) {
	      if (array[index] === value) {
	        return index;
	      }
	    }
	    return -1;
	  }
	
	  /**
	   * The base implementation of `_.isFunction` without support for environments
	   * with incorrect `typeof` results.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	   */
	  function baseIsFunction(value) {
	    // Avoid a Chakra JIT bug in compatibility modes of IE 11.
	    // See https://github.com/jashkenas/underscore/issues/1621 for more details.
	    return typeof value == 'function' || false;
	  }
	
	  /**
	   * Converts `value` to a string if it's not one. An empty string is returned
	   * for `null` or `undefined` values.
	   *
	   * @private
	   * @param {*} value The value to process.
	   * @returns {string} Returns the string.
	   */
	  function baseToString(value) {
	    return value == null ? '' : (value + '');
	  }
	
	  /**
	   * Used by `_.trim` and `_.trimLeft` to get the index of the first character
	   * of `string` that is not found in `chars`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @param {string} chars The characters to find.
	   * @returns {number} Returns the index of the first character not found in `chars`.
	   */
	  function charsLeftIndex(string, chars) {
	    var index = -1,
	        length = string.length;
	
	    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
	    return index;
	  }
	
	  /**
	   * Used by `_.trim` and `_.trimRight` to get the index of the last character
	   * of `string` that is not found in `chars`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @param {string} chars The characters to find.
	   * @returns {number} Returns the index of the last character not found in `chars`.
	   */
	  function charsRightIndex(string, chars) {
	    var index = string.length;
	
	    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
	    return index;
	  }
	
	  /**
	   * Used by `_.sortBy` to compare transformed elements of a collection and stable
	   * sort them in ascending order.
	   *
	   * @private
	   * @param {Object} object The object to compare.
	   * @param {Object} other The other object to compare.
	   * @returns {number} Returns the sort order indicator for `object`.
	   */
	  function compareAscending(object, other) {
	    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
	  }
	
	  /**
	   * Used by `_.sortByOrder` to compare multiple properties of a value to another
	   * and stable sort them.
	   *
	   * If `orders` is unspecified, all valuess are sorted in ascending order. Otherwise,
	   * a value is sorted in ascending order if its corresponding order is "asc", and
	   * descending if "desc".
	   *
	   * @private
	   * @param {Object} object The object to compare.
	   * @param {Object} other The other object to compare.
	   * @param {boolean[]} orders The order to sort by for each property.
	   * @returns {number} Returns the sort order indicator for `object`.
	   */
	  function compareMultiple(object, other, orders) {
	    var index = -1,
	        objCriteria = object.criteria,
	        othCriteria = other.criteria,
	        length = objCriteria.length,
	        ordersLength = orders.length;
	
	    while (++index < length) {
	      var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
	      if (result) {
	        if (index >= ordersLength) {
	          return result;
	        }
	        var order = orders[index];
	        return result * ((order === 'asc' || order === true) ? 1 : -1);
	      }
	    }
	    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
	    // that causes it, under certain circumstances, to provide the same value for
	    // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
	    // for more details.
	    //
	    // This also ensures a stable sort in V8 and other engines.
	    // See https://code.google.com/p/v8/issues/detail?id=90 for more details.
	    return object.index - other.index;
	  }
	
	  /**
	   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
	   *
	   * @private
	   * @param {string} letter The matched letter to deburr.
	   * @returns {string} Returns the deburred letter.
	   */
	  function deburrLetter(letter) {
	    return deburredLetters[letter];
	  }
	
	  /**
	   * Used by `_.escape` to convert characters to HTML entities.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeHtmlChar(chr) {
	    return htmlEscapes[chr];
	  }
	
	  /**
	   * Used by `_.escapeRegExp` to escape characters for inclusion in compiled regexes.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @param {string} leadingChar The capture group for a leading character.
	   * @param {string} whitespaceChar The capture group for a whitespace character.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeRegExpChar(chr, leadingChar, whitespaceChar) {
	    if (leadingChar) {
	      chr = regexpEscapes[chr];
	    } else if (whitespaceChar) {
	      chr = stringEscapes[chr];
	    }
	    return '\\' + chr;
	  }
	
	  /**
	   * Used by `_.template` to escape characters for inclusion in compiled string literals.
	   *
	   * @private
	   * @param {string} chr The matched character to escape.
	   * @returns {string} Returns the escaped character.
	   */
	  function escapeStringChar(chr) {
	    return '\\' + stringEscapes[chr];
	  }
	
	  /**
	   * Gets the index at which the first occurrence of `NaN` is found in `array`.
	   *
	   * @private
	   * @param {Array} array The array to search.
	   * @param {number} fromIndex The index to search from.
	   * @param {boolean} [fromRight] Specify iterating from right to left.
	   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	   */
	  function indexOfNaN(array, fromIndex, fromRight) {
	    var length = array.length,
	        index = fromIndex + (fromRight ? 0 : -1);
	
	    while ((fromRight ? index-- : ++index < length)) {
	      var other = array[index];
	      if (other !== other) {
	        return index;
	      }
	    }
	    return -1;
	  }
	
	  /**
	   * Checks if `value` is object-like.
	   *
	   * @private
	   * @param {*} value The value to check.
	   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	   */
	  function isObjectLike(value) {
	    return !!value && typeof value == 'object';
	  }
	
	  /**
	   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
	   * character code is whitespace.
	   *
	   * @private
	   * @param {number} charCode The character code to inspect.
	   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
	   */
	  function isSpace(charCode) {
	    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
	      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
	  }
	
	  /**
	   * Replaces all `placeholder` elements in `array` with an internal placeholder
	   * and returns an array of their indexes.
	   *
	   * @private
	   * @param {Array} array The array to modify.
	   * @param {*} placeholder The placeholder to replace.
	   * @returns {Array} Returns the new array of placeholder indexes.
	   */
	  function replaceHolders(array, placeholder) {
	    var index = -1,
	        length = array.length,
	        resIndex = -1,
	        result = [];
	
	    while (++index < length) {
	      if (array[index] === placeholder) {
	        array[index] = PLACEHOLDER;
	        result[++resIndex] = index;
	      }
	    }
	    return result;
	  }
	
	  /**
	   * An implementation of `_.uniq` optimized for sorted arrays without support
	   * for callback shorthands and `this` binding.
	   *
	   * @private
	   * @param {Array} array The array to inspect.
	   * @param {Function} [iteratee] The function invoked per iteration.
	   * @returns {Array} Returns the new duplicate-value-free array.
	   */
	  function sortedUniq(array, iteratee) {
	    var seen,
	        index = -1,
	        length = array.length,
	        resIndex = -1,
	        result = [];
	
	    while (++index < length) {
	      var value = array[index],
	          computed = iteratee ? iteratee(value, index, array) : value;
	
	      if (!index || seen !== computed) {
	        seen = computed;
	        result[++resIndex] = value;
	      }
	    }
	    return result;
	  }
	
	  /**
	   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
	   * character of `string`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the index of the first non-whitespace character.
	   */
	  function trimmedLeftIndex(string) {
	    var index = -1,
	        length = string.length;
	
	    while (++index < length && isSpace(string.charCodeAt(index))) {}
	    return index;
	  }
	
	  /**
	   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
	   * character of `string`.
	   *
	   * @private
	   * @param {string} string The string to inspect.
	   * @returns {number} Returns the index of the last non-whitespace character.
	   */
	  function trimmedRightIndex(string) {
	    var index = string.length;
	
	    while (index-- && isSpace(string.charCodeAt(index))) {}
	    return index;
	  }
	
	  /**
	   * Used by `_.unescape` to convert HTML entities to characters.
	   *
	   * @private
	   * @param {string} chr The matched character to unescape.
	   * @returns {string} Returns the unescaped character.
	   */
	  function unescapeHtmlChar(chr) {
	    return htmlUnescapes[chr];
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  /**
	   * Create a new pristine `lodash` function using the given `context` object.
	   *
	   * @static
	   * @memberOf _
	   * @category Utility
	   * @param {Object} [context=root] The context object.
	   * @returns {Function} Returns a new `lodash` function.
	   * @example
	   *
	   * _.mixin({ 'foo': _.constant('foo') });
	   *
	   * var lodash = _.runInContext();
	   * lodash.mixin({ 'bar': lodash.constant('bar') });
	   *
	   * _.isFunction(_.foo);
	   * // => true
	   * _.isFunction(_.bar);
	   * // => false
	   *
	   * lodash.isFunction(lodash.foo);
	   * // => false
	   * lodash.isFunction(lodash.bar);
	   * // => true
	   *
	   * // using `context` to mock `Date#getTime` use in `_.now`
	   * var mock = _.runInContext({
	   *   'Date': function() {
	   *     return { 'getTime': getTimeMock };
	   *   }
	   * });
	   *
	   * // or creating a suped-up `defer` in Node.js
	   * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
	   */
	  function runInContext(context) {
	    // Avoid issues with some ES3 environments that attempt to use values, named
	    // after built-in constructors like `Object`, for the creation of literals.
	    // ES5 clears this up by stating that literals must use built-in constructors.
	    // See https://es5.github.io/#x11.1.5 for more details.
	    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
	
	    /** Native constructor references. */
	    var Array = context.Array,
	        Date = context.Date,
	        Error = context.Error,
	        Function = context.Function,
	        Math = context.Math,
	        Number = context.Number,
	        Object = context.Object,
	        RegExp = context.RegExp,
	        String = context.String,
	        TypeError = context.TypeError;
	
	    /** Used for native method references. */
	    var arrayProto = Array.prototype,
	        objectProto = Object.prototype,
	        stringProto = String.prototype;
	
	    /** Used to resolve the decompiled source of functions. */
	    var fnToString = Function.prototype.toString;
	
	    /** Used to check objects for own properties. */
	    var hasOwnProperty = objectProto.hasOwnProperty;
	
	    /** Used to generate unique IDs. */
	    var idCounter = 0;
	
	    /**
	     * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	     * of values.
	     */
	    var objToString = objectProto.toString;
	
	    /** Used to restore the original `_` reference in `_.noConflict`. */
	    var oldDash = root._;
	
	    /** Used to detect if a method is native. */
	    var reIsNative = RegExp('^' +
	      fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	    );
	
	    /** Native method references. */
	    var ArrayBuffer = context.ArrayBuffer,
	        clearTimeout = context.clearTimeout,
	        parseFloat = context.parseFloat,
	        pow = Math.pow,
	        propertyIsEnumerable = objectProto.propertyIsEnumerable,
	        Set = getNative(context, 'Set'),
	        setTimeout = context.setTimeout,
	        splice = arrayProto.splice,
	        Uint8Array = context.Uint8Array,
	        WeakMap = getNative(context, 'WeakMap');
	
	    /* Native method references for those with the same name as other `lodash` methods. */
	    var nativeCeil = Math.ceil,
	        nativeCreate = getNative(Object, 'create'),
	        nativeFloor = Math.floor,
	        nativeIsArray = getNative(Array, 'isArray'),
	        nativeIsFinite = context.isFinite,
	        nativeKeys = getNative(Object, 'keys'),
	        nativeMax = Math.max,
	        nativeMin = Math.min,
	        nativeNow = getNative(Date, 'now'),
	        nativeParseInt = context.parseInt,
	        nativeRandom = Math.random;
	
	    /** Used as references for `-Infinity` and `Infinity`. */
	    var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
	        POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
	
	    /** Used as references for the maximum length and index of an array. */
	    var MAX_ARRAY_LENGTH = 4294967295,
	        MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
	        HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
	
	    /**
	     * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	     * of an array-like value.
	     */
	    var MAX_SAFE_INTEGER = 9007199254740991;
	
	    /** Used to store function metadata. */
	    var metaMap = WeakMap && new WeakMap;
	
	    /** Used to lookup unminified function names. */
	    var realNames = {};
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a `lodash` object which wraps `value` to enable implicit chaining.
	     * Methods that operate on and return arrays, collections, and functions can
	     * be chained together. Methods that retrieve a single value or may return a
	     * primitive value will automatically end the chain returning the unwrapped
	     * value. Explicit chaining may be enabled using `_.chain`. The execution of
	     * chained methods is lazy, that is, execution is deferred until `_#value`
	     * is implicitly or explicitly called.
	     *
	     * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
	     * fusion is an optimization strategy which merge iteratee calls; this can help
	     * to avoid the creation of intermediate data structures and greatly reduce the
	     * number of iteratee executions.
	     *
	     * Chaining is supported in custom builds as long as the `_#value` method is
	     * directly or indirectly included in the build.
	     *
	     * In addition to lodash methods, wrappers have `Array` and `String` methods.
	     *
	     * The wrapper `Array` methods are:
	     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
	     * `splice`, and `unshift`
	     *
	     * The wrapper `String` methods are:
	     * `replace` and `split`
	     *
	     * The wrapper methods that support shortcut fusion are:
	     * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
	     * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
	     * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
	     * and `where`
	     *
	     * The chainable wrapper methods are:
	     * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
	     * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
	     * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
	     * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
	     * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
	     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	     * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
	     * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
	     * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
	     * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
	     * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
	     * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
	     * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
	     * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
	     * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
	     * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
	     *
	     * The wrapper methods that are **not** chainable by default are:
	     * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
	     * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
	     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
	     * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
	     * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	     * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
	     * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
	     * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
	     * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
	     * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
	     * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
	     * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
	     * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
	     * `unescape`, `uniqueId`, `value`, and `words`
	     *
	     * The wrapper method `sample` will return a wrapped value when `n` is provided,
	     * otherwise an unwrapped value is returned.
	     *
	     * @name _
	     * @constructor
	     * @category Chain
	     * @param {*} value The value to wrap in a `lodash` instance.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var wrapped = _([1, 2, 3]);
	     *
	     * // returns an unwrapped value
	     * wrapped.reduce(function(total, n) {
	     *   return total + n;
	     * });
	     * // => 6
	     *
	     * // returns a wrapped value
	     * var squares = wrapped.map(function(n) {
	     *   return n * n;
	     * });
	     *
	     * _.isArray(squares);
	     * // => false
	     *
	     * _.isArray(squares.value());
	     * // => true
	     */
	    function lodash(value) {
	      if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
	        if (value instanceof LodashWrapper) {
	          return value;
	        }
	        if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
	          return wrapperClone(value);
	        }
	      }
	      return new LodashWrapper(value);
	    }
	
	    /**
	     * The function whose prototype all chaining wrappers inherit from.
	     *
	     * @private
	     */
	    function baseLodash() {
	      // No operation performed.
	    }
	
	    /**
	     * The base constructor for creating `lodash` wrapper objects.
	     *
	     * @private
	     * @param {*} value The value to wrap.
	     * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
	     * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
	     */
	    function LodashWrapper(value, chainAll, actions) {
	      this.__wrapped__ = value;
	      this.__actions__ = actions || [];
	      this.__chain__ = !!chainAll;
	    }
	
	    /**
	     * An object environment feature flags.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    var support = lodash.support = {};
	
	    /**
	     * By default, the template delimiters used by lodash are like those in
	     * embedded Ruby (ERB). Change the following template settings to use
	     * alternative delimiters.
	     *
	     * @static
	     * @memberOf _
	     * @type Object
	     */
	    lodash.templateSettings = {
	
	      /**
	       * Used to detect `data` property values to be HTML-escaped.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'escape': reEscape,
	
	      /**
	       * Used to detect code to be evaluated.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'evaluate': reEvaluate,
	
	      /**
	       * Used to detect `data` property values to inject.
	       *
	       * @memberOf _.templateSettings
	       * @type RegExp
	       */
	      'interpolate': reInterpolate,
	
	      /**
	       * Used to reference the data object in the template text.
	       *
	       * @memberOf _.templateSettings
	       * @type string
	       */
	      'variable': '',
	
	      /**
	       * Used to import variables into the compiled template.
	       *
	       * @memberOf _.templateSettings
	       * @type Object
	       */
	      'imports': {
	
	        /**
	         * A reference to the `lodash` function.
	         *
	         * @memberOf _.templateSettings.imports
	         * @type Function
	         */
	        '_': lodash
	      }
	    };
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	     *
	     * @private
	     * @param {*} value The value to wrap.
	     */
	    function LazyWrapper(value) {
	      this.__wrapped__ = value;
	      this.__actions__ = [];
	      this.__dir__ = 1;
	      this.__filtered__ = false;
	      this.__iteratees__ = [];
	      this.__takeCount__ = POSITIVE_INFINITY;
	      this.__views__ = [];
	    }
	
	    /**
	     * Creates a clone of the lazy wrapper object.
	     *
	     * @private
	     * @name clone
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the cloned `LazyWrapper` object.
	     */
	    function lazyClone() {
	      var result = new LazyWrapper(this.__wrapped__);
	      result.__actions__ = arrayCopy(this.__actions__);
	      result.__dir__ = this.__dir__;
	      result.__filtered__ = this.__filtered__;
	      result.__iteratees__ = arrayCopy(this.__iteratees__);
	      result.__takeCount__ = this.__takeCount__;
	      result.__views__ = arrayCopy(this.__views__);
	      return result;
	    }
	
	    /**
	     * Reverses the direction of lazy iteration.
	     *
	     * @private
	     * @name reverse
	     * @memberOf LazyWrapper
	     * @returns {Object} Returns the new reversed `LazyWrapper` object.
	     */
	    function lazyReverse() {
	      if (this.__filtered__) {
	        var result = new LazyWrapper(this);
	        result.__dir__ = -1;
	        result.__filtered__ = true;
	      } else {
	        result = this.clone();
	        result.__dir__ *= -1;
	      }
	      return result;
	    }
	
	    /**
	     * Extracts the unwrapped value from its lazy wrapper.
	     *
	     * @private
	     * @name value
	     * @memberOf LazyWrapper
	     * @returns {*} Returns the unwrapped value.
	     */
	    function lazyValue() {
	      var array = this.__wrapped__.value(),
	          dir = this.__dir__,
	          isArr = isArray(array),
	          isRight = dir < 0,
	          arrLength = isArr ? array.length : 0,
	          view = getView(0, arrLength, this.__views__),
	          start = view.start,
	          end = view.end,
	          length = end - start,
	          index = isRight ? end : (start - 1),
	          iteratees = this.__iteratees__,
	          iterLength = iteratees.length,
	          resIndex = 0,
	          takeCount = nativeMin(length, this.__takeCount__);
	
	      if (!isArr || arrLength < LARGE_ARRAY_SIZE || (arrLength == length && takeCount == length)) {
	        return baseWrapperValue((isRight && isArr) ? array.reverse() : array, this.__actions__);
	      }
	      var result = [];
	
	      outer:
	      while (length-- && resIndex < takeCount) {
	        index += dir;
	
	        var iterIndex = -1,
	            value = array[index];
	
	        while (++iterIndex < iterLength) {
	          var data = iteratees[iterIndex],
	              iteratee = data.iteratee,
	              type = data.type,
	              computed = iteratee(value);
	
	          if (type == LAZY_MAP_FLAG) {
	            value = computed;
	          } else if (!computed) {
	            if (type == LAZY_FILTER_FLAG) {
	              continue outer;
	            } else {
	              break outer;
	            }
	          }
	        }
	        result[resIndex++] = value;
	      }
	      return result;
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a cache object to store key/value pairs.
	     *
	     * @private
	     * @static
	     * @name Cache
	     * @memberOf _.memoize
	     */
	    function MapCache() {
	      this.__data__ = {};
	    }
	
	    /**
	     * Removes `key` and its value from the cache.
	     *
	     * @private
	     * @name delete
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to remove.
	     * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.
	     */
	    function mapDelete(key) {
	      return this.has(key) && delete this.__data__[key];
	    }
	
	    /**
	     * Gets the cached value for `key`.
	     *
	     * @private
	     * @name get
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to get.
	     * @returns {*} Returns the cached value.
	     */
	    function mapGet(key) {
	      return key == '__proto__' ? undefined : this.__data__[key];
	    }
	
	    /**
	     * Checks if a cached value for `key` exists.
	     *
	     * @private
	     * @name has
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the entry to check.
	     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	     */
	    function mapHas(key) {
	      return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
	    }
	
	    /**
	     * Sets `value` to `key` of the cache.
	     *
	     * @private
	     * @name set
	     * @memberOf _.memoize.Cache
	     * @param {string} key The key of the value to cache.
	     * @param {*} value The value to cache.
	     * @returns {Object} Returns the cache object.
	     */
	    function mapSet(key, value) {
	      if (key != '__proto__') {
	        this.__data__[key] = value;
	      }
	      return this;
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     *
	     * Creates a cache object to store unique values.
	     *
	     * @private
	     * @param {Array} [values] The values to cache.
	     */
	    function SetCache(values) {
	      var length = values ? values.length : 0;
	
	      this.data = { 'hash': nativeCreate(null), 'set': new Set };
	      while (length--) {
	        this.push(values[length]);
	      }
	    }
	
	    /**
	     * Checks if `value` is in `cache` mimicking the return signature of
	     * `_.indexOf` by returning `0` if the value is found, else `-1`.
	     *
	     * @private
	     * @param {Object} cache The cache to search.
	     * @param {*} value The value to search for.
	     * @returns {number} Returns `0` if `value` is found, else `-1`.
	     */
	    function cacheIndexOf(cache, value) {
	      var data = cache.data,
	          result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];
	
	      return result ? 0 : -1;
	    }
	
	    /**
	     * Adds `value` to the cache.
	     *
	     * @private
	     * @name push
	     * @memberOf SetCache
	     * @param {*} value The value to cache.
	     */
	    function cachePush(value) {
	      var data = this.data;
	      if (typeof value == 'string' || isObject(value)) {
	        data.set.add(value);
	      } else {
	        data.hash[value] = true;
	      }
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a new array joining `array` with `other`.
	     *
	     * @private
	     * @param {Array} array The array to join.
	     * @param {Array} other The other array to join.
	     * @returns {Array} Returns the new concatenated array.
	     */
	    function arrayConcat(array, other) {
	      var index = -1,
	          length = array.length,
	          othIndex = -1,
	          othLength = other.length,
	          result = Array(length + othLength);
	
	      while (++index < length) {
	        result[index] = array[index];
	      }
	      while (++othIndex < othLength) {
	        result[index++] = other[othIndex];
	      }
	      return result;
	    }
	
	    /**
	     * Copies the values of `source` to `array`.
	     *
	     * @private
	     * @param {Array} source The array to copy values from.
	     * @param {Array} [array=[]] The array to copy values to.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayCopy(source, array) {
	      var index = -1,
	          length = source.length;
	
	      array || (array = Array(length));
	      while (++index < length) {
	        array[index] = source[index];
	      }
	      return array;
	    }
	
	    /**
	     * A specialized version of `_.forEach` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayEach(array, iteratee) {
	      var index = -1,
	          length = array.length;
	
	      while (++index < length) {
	        if (iteratee(array[index], index, array) === false) {
	          break;
	        }
	      }
	      return array;
	    }
	
	    /**
	     * A specialized version of `_.forEachRight` for arrays without support for
	     * callback shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayEachRight(array, iteratee) {
	      var length = array.length;
	
	      while (length--) {
	        if (iteratee(array[length], length, array) === false) {
	          break;
	        }
	      }
	      return array;
	    }
	
	    /**
	     * A specialized version of `_.every` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`.
	     */
	    function arrayEvery(array, predicate) {
	      var index = -1,
	          length = array.length;
	
	      while (++index < length) {
	        if (!predicate(array[index], index, array)) {
	          return false;
	        }
	      }
	      return true;
	    }
	
	    /**
	     * A specialized version of `baseExtremum` for arrays which invokes `iteratee`
	     * with one argument: (value).
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} comparator The function used to compare values.
	     * @param {*} exValue The initial extremum value.
	     * @returns {*} Returns the extremum value.
	     */
	    function arrayExtremum(array, iteratee, comparator, exValue) {
	      var index = -1,
	          length = array.length,
	          computed = exValue,
	          result = computed;
	
	      while (++index < length) {
	        var value = array[index],
	            current = +iteratee(value);
	
	        if (comparator(current, computed)) {
	          computed = current;
	          result = value;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * A specialized version of `_.filter` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     */
	    function arrayFilter(array, predicate) {
	      var index = -1,
	          length = array.length,
	          resIndex = -1,
	          result = [];
	
	      while (++index < length) {
	        var value = array[index];
	        if (predicate(value, index, array)) {
	          result[++resIndex] = value;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * A specialized version of `_.map` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     */
	    function arrayMap(array, iteratee) {
	      var index = -1,
	          length = array.length,
	          result = Array(length);
	
	      while (++index < length) {
	        result[index] = iteratee(array[index], index, array);
	      }
	      return result;
	    }
	
	    /**
	     * Appends the elements of `values` to `array`.
	     *
	     * @private
	     * @param {Array} array The array to modify.
	     * @param {Array} values The values to append.
	     * @returns {Array} Returns `array`.
	     */
	    function arrayPush(array, values) {
	      var index = -1,
	          length = values.length,
	          offset = array.length;
	
	      while (++index < length) {
	        array[offset + index] = values[index];
	      }
	      return array;
	    }
	
	    /**
	     * A specialized version of `_.reduce` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {boolean} [initFromArray] Specify using the first element of `array`
	     *  as the initial value.
	     * @returns {*} Returns the accumulated value.
	     */
	    function arrayReduce(array, iteratee, accumulator, initFromArray) {
	      var index = -1,
	          length = array.length;
	
	      if (initFromArray && length) {
	        accumulator = array[++index];
	      }
	      while (++index < length) {
	        accumulator = iteratee(accumulator, array[index], index, array);
	      }
	      return accumulator;
	    }
	
	    /**
	     * A specialized version of `_.reduceRight` for arrays without support for
	     * callback shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {boolean} [initFromArray] Specify using the last element of `array`
	     *  as the initial value.
	     * @returns {*} Returns the accumulated value.
	     */
	    function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
	      var length = array.length;
	      if (initFromArray && length) {
	        accumulator = array[--length];
	      }
	      while (length--) {
	        accumulator = iteratee(accumulator, array[length], length, array);
	      }
	      return accumulator;
	    }
	
	    /**
	     * A specialized version of `_.some` for arrays without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     */
	    function arraySome(array, predicate) {
	      var index = -1,
	          length = array.length;
	
	      while (++index < length) {
	        if (predicate(array[index], index, array)) {
	          return true;
	        }
	      }
	      return false;
	    }
	
	    /**
	     * A specialized version of `_.sum` for arrays without support for callback
	     * shorthands and `this` binding..
	     *
	     * @private
	     * @param {Array} array The array to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {number} Returns the sum.
	     */
	    function arraySum(array, iteratee) {
	      var length = array.length,
	          result = 0;
	
	      while (length--) {
	        result += +iteratee(array[length]) || 0;
	      }
	      return result;
	    }
	
	    /**
	     * Used by `_.defaults` to customize its `_.assign` use.
	     *
	     * @private
	     * @param {*} objectValue The destination object property value.
	     * @param {*} sourceValue The source object property value.
	     * @returns {*} Returns the value to assign to the destination object.
	     */
	    function assignDefaults(objectValue, sourceValue) {
	      return objectValue === undefined ? sourceValue : objectValue;
	    }
	
	    /**
	     * Used by `_.template` to customize its `_.assign` use.
	     *
	     * **Note:** This function is like `assignDefaults` except that it ignores
	     * inherited property values when checking if a property is `undefined`.
	     *
	     * @private
	     * @param {*} objectValue The destination object property value.
	     * @param {*} sourceValue The source object property value.
	     * @param {string} key The key associated with the object and source values.
	     * @param {Object} object The destination object.
	     * @returns {*} Returns the value to assign to the destination object.
	     */
	    function assignOwnDefaults(objectValue, sourceValue, key, object) {
	      return (objectValue === undefined || !hasOwnProperty.call(object, key))
	        ? sourceValue
	        : objectValue;
	    }
	
	    /**
	     * A specialized version of `_.assign` for customizing assigned values without
	     * support for argument juggling, multiple sources, and `this` binding `customizer`
	     * functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} customizer The function to customize assigned values.
	     * @returns {Object} Returns `object`.
	     */
	    function assignWith(object, source, customizer) {
	      var index = -1,
	          props = keys(source),
	          length = props.length;
	
	      while (++index < length) {
	        var key = props[index],
	            value = object[key],
	            result = customizer(value, source[key], key, object, source);
	
	        if ((result === result ? (result !== value) : (value === value)) ||
	            (value === undefined && !(key in object))) {
	          object[key] = result;
	        }
	      }
	      return object;
	    }
	
	    /**
	     * The base implementation of `_.assign` without support for argument juggling,
	     * multiple sources, and `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @returns {Object} Returns `object`.
	     */
	    function baseAssign(object, source) {
	      return source == null
	        ? object
	        : baseCopy(source, keys(source), object);
	    }
	
	    /**
	     * The base implementation of `_.at` without support for string collections
	     * and individual key arguments.
	     *
	     * @private
	     * @param {Array|Object} collection The collection to iterate over.
	     * @param {number[]|string[]} props The property names or indexes of elements to pick.
	     * @returns {Array} Returns the new array of picked elements.
	     */
	    function baseAt(collection, props) {
	      var index = -1,
	          isNil = collection == null,
	          isArr = !isNil && isArrayLike(collection),
	          length = isArr ? collection.length : 0,
	          propsLength = props.length,
	          result = Array(propsLength);
	
	      while(++index < propsLength) {
	        var key = props[index];
	        if (isArr) {
	          result[index] = isIndex(key, length) ? collection[key] : undefined;
	        } else {
	          result[index] = isNil ? undefined : collection[key];
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Copies properties of `source` to `object`.
	     *
	     * @private
	     * @param {Object} source The object to copy properties from.
	     * @param {Array} props The property names to copy.
	     * @param {Object} [object={}] The object to copy properties to.
	     * @returns {Object} Returns `object`.
	     */
	    function baseCopy(source, props, object) {
	      object || (object = {});
	
	      var index = -1,
	          length = props.length;
	
	      while (++index < length) {
	        var key = props[index];
	        object[key] = source[key];
	      }
	      return object;
	    }
	
	    /**
	     * The base implementation of `_.callback` which supports specifying the
	     * number of arguments to provide to `func`.
	     *
	     * @private
	     * @param {*} [func=_.identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {number} [argCount] The number of arguments to provide to `func`.
	     * @returns {Function} Returns the callback.
	     */
	    function baseCallback(func, thisArg, argCount) {
	      var type = typeof func;
	      if (type == 'function') {
	        return thisArg === undefined
	          ? func
	          : bindCallback(func, thisArg, argCount);
	      }
	      if (func == null) {
	        return identity;
	      }
	      if (type == 'object') {
	        return baseMatches(func);
	      }
	      return thisArg === undefined
	        ? property(func)
	        : baseMatchesProperty(func, thisArg);
	    }
	
	    /**
	     * The base implementation of `_.clone` without support for argument juggling
	     * and `this` binding `customizer` functions.
	     *
	     * @private
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {string} [key] The key of `value`.
	     * @param {Object} [object] The object `value` belongs to.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates clones with source counterparts.
	     * @returns {*} Returns the cloned value.
	     */
	    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	      var result;
	      if (customizer) {
	        result = object ? customizer(value, key, object) : customizer(value);
	      }
	      if (result !== undefined) {
	        return result;
	      }
	      if (!isObject(value)) {
	        return value;
	      }
	      var isArr = isArray(value);
	      if (isArr) {
	        result = initCloneArray(value);
	        if (!isDeep) {
	          return arrayCopy(value, result);
	        }
	      } else {
	        var tag = objToString.call(value),
	            isFunc = tag == funcTag;
	
	        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	          result = initCloneObject(isFunc ? {} : value);
	          if (!isDeep) {
	            return baseAssign(result, value);
	          }
	        } else {
	          return cloneableTags[tag]
	            ? initCloneByTag(value, tag, isDeep)
	            : (object ? value : {});
	        }
	      }
	      // Check for circular references and return its corresponding clone.
	      stackA || (stackA = []);
	      stackB || (stackB = []);
	
	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == value) {
	          return stackB[length];
	        }
	      }
	      // Add the source value to the stack of traversed objects and associate it with its clone.
	      stackA.push(value);
	      stackB.push(result);
	
	      // Recursively populate clone (susceptible to call stack limits).
	      (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	        result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.create` without support for assigning
	     * properties to the created object.
	     *
	     * @private
	     * @param {Object} prototype The object to inherit from.
	     * @returns {Object} Returns the new object.
	     */
	    var baseCreate = (function() {
	      function object() {}
	      return function(prototype) {
	        if (isObject(prototype)) {
	          object.prototype = prototype;
	          var result = new object;
	          object.prototype = undefined;
	        }
	        return result || {};
	      };
	    }());
	
	    /**
	     * The base implementation of `_.delay` and `_.defer` which accepts an index
	     * of where to slice the arguments to provide to `func`.
	     *
	     * @private
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {Object} args The arguments provide to `func`.
	     * @returns {number} Returns the timer id.
	     */
	    function baseDelay(func, wait, args) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return setTimeout(function() { func.apply(undefined, args); }, wait);
	    }
	
	    /**
	     * The base implementation of `_.difference` which accepts a single array
	     * of values to exclude.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Array} values The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     */
	    function baseDifference(array, values) {
	      var length = array ? array.length : 0,
	          result = [];
	
	      if (!length) {
	        return result;
	      }
	      var index = -1,
	          indexOf = getIndexOf(),
	          isCommon = indexOf == baseIndexOf,
	          cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
	          valuesLength = values.length;
	
	      if (cache) {
	        indexOf = cacheIndexOf;
	        isCommon = false;
	        values = cache;
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index];
	
	        if (isCommon && value === value) {
	          var valuesIndex = valuesLength;
	          while (valuesIndex--) {
	            if (values[valuesIndex] === value) {
	              continue outer;
	            }
	          }
	          result.push(value);
	        }
	        else if (indexOf(values, value, 0) < 0) {
	          result.push(value);
	        }
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.forEach` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    var baseEach = createBaseEach(baseForOwn);
	
	    /**
	     * The base implementation of `_.forEachRight` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array|Object|string} Returns `collection`.
	     */
	    var baseEachRight = createBaseEach(baseForOwnRight, true);
	
	    /**
	     * The base implementation of `_.every` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`
	     */
	    function baseEvery(collection, predicate) {
	      var result = true;
	      baseEach(collection, function(value, index, collection) {
	        result = !!predicate(value, index, collection);
	        return result;
	      });
	      return result;
	    }
	
	    /**
	     * Gets the extremum value of `collection` invoking `iteratee` for each value
	     * in `collection` to generate the criterion by which the value is ranked.
	     * The `iteratee` is invoked with three arguments: (value, index|key, collection).
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} comparator The function used to compare values.
	     * @param {*} exValue The initial extremum value.
	     * @returns {*} Returns the extremum value.
	     */
	    function baseExtremum(collection, iteratee, comparator, exValue) {
	      var computed = exValue,
	          result = computed;
	
	      baseEach(collection, function(value, index, collection) {
	        var current = +iteratee(value, index, collection);
	        if (comparator(current, computed) || (current === exValue && current === result)) {
	          computed = current;
	          result = value;
	        }
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.fill` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     */
	    function baseFill(array, value, start, end) {
	      var length = array.length;
	
	      start = start == null ? 0 : (+start || 0);
	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = (end === undefined || end > length) ? length : (+end || 0);
	      if (end < 0) {
	        end += length;
	      }
	      length = start > end ? 0 : (end >>> 0);
	      start >>>= 0;
	
	      while (start < length) {
	        array[start++] = value;
	      }
	      return array;
	    }
	
	    /**
	     * The base implementation of `_.filter` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Array} Returns the new filtered array.
	     */
	    function baseFilter(collection, predicate) {
	      var result = [];
	      baseEach(collection, function(value, index, collection) {
	        if (predicate(value, index, collection)) {
	          result.push(value);
	        }
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
	     * without support for callback shorthands and `this` binding, which iterates
	     * over `collection` using the provided `eachFunc`.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function} predicate The function invoked per iteration.
	     * @param {Function} eachFunc The function to iterate over `collection`.
	     * @param {boolean} [retKey] Specify returning the key of the found element
	     *  instead of the element itself.
	     * @returns {*} Returns the found element or its key, else `undefined`.
	     */
	    function baseFind(collection, predicate, eachFunc, retKey) {
	      var result;
	      eachFunc(collection, function(value, key, collection) {
	        if (predicate(value, key, collection)) {
	          result = retKey ? key : value;
	          return false;
	        }
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.flatten` with added support for restricting
	     * flattening and specifying the start index.
	     *
	     * @private
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isDeep] Specify a deep flatten.
	     * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
	     * @param {Array} [result=[]] The initial result value.
	     * @returns {Array} Returns the new flattened array.
	     */
	    function baseFlatten(array, isDeep, isStrict, result) {
	      result || (result = []);
	
	      var index = -1,
	          length = array.length;
	
	      while (++index < length) {
	        var value = array[index];
	        if (isObjectLike(value) && isArrayLike(value) &&
	            (isStrict || isArray(value) || isArguments(value))) {
	          if (isDeep) {
	            // Recursively flatten arrays (susceptible to call stack limits).
	            baseFlatten(value, isDeep, isStrict, result);
	          } else {
	            arrayPush(result, value);
	          }
	        } else if (!isStrict) {
	          result[result.length] = value;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `baseForIn` and `baseForOwn` which iterates
	     * over `object` properties returned by `keysFunc` invoking `iteratee` for
	     * each property. Iteratee functions may exit iteration early by explicitly
	     * returning `false`.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    var baseFor = createBaseFor();
	
	    /**
	     * This function is like `baseFor` except that it iterates over properties
	     * in the opposite order.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {Function} keysFunc The function to get the keys of `object`.
	     * @returns {Object} Returns `object`.
	     */
	    var baseForRight = createBaseFor(true);
	
	    /**
	     * The base implementation of `_.forIn` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForIn(object, iteratee) {
	      return baseFor(object, iteratee, keysIn);
	    }
	
	    /**
	     * The base implementation of `_.forOwn` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwn(object, iteratee) {
	      return baseFor(object, iteratee, keys);
	    }
	
	    /**
	     * The base implementation of `_.forOwnRight` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Object} Returns `object`.
	     */
	    function baseForOwnRight(object, iteratee) {
	      return baseForRight(object, iteratee, keys);
	    }
	
	    /**
	     * The base implementation of `_.functions` which creates an array of
	     * `object` function property names filtered from those provided.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Array} props The property names to filter.
	     * @returns {Array} Returns the new array of filtered property names.
	     */
	    function baseFunctions(object, props) {
	      var index = -1,
	          length = props.length,
	          resIndex = -1,
	          result = [];
	
	      while (++index < length) {
	        var key = props[index];
	        if (isFunction(object[key])) {
	          result[++resIndex] = key;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `get` without support for string paths
	     * and default values.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array} path The path of the property to get.
	     * @param {string} [pathKey] The key representation of path.
	     * @returns {*} Returns the resolved value.
	     */
	    function baseGet(object, path, pathKey) {
	      if (object == null) {
	        return;
	      }
	      if (pathKey !== undefined && pathKey in toObject(object)) {
	        path = [pathKey];
	      }
	      var index = 0,
	          length = path.length;
	
	      while (object != null && index < length) {
	        object = object[path[index++]];
	      }
	      return (index && index == length) ? object : undefined;
	    }
	
	    /**
	     * The base implementation of `_.isEqual` without support for `this` binding
	     * `customizer` functions.
	     *
	     * @private
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {boolean} [isLoose] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     */
	    function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
	      if (value === other) {
	        return true;
	      }
	      if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	        return value !== value && other !== other;
	      }
	      return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
	    }
	
	    /**
	     * A specialized version of `baseIsEqual` for arrays and objects which performs
	     * deep comparisons and tracks traversed objects enabling objects with circular
	     * references to be compared.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing objects.
	     * @param {boolean} [isLoose] Specify performing partial comparisons.
	     * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	     * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	      var objIsArr = isArray(object),
	          othIsArr = isArray(other),
	          objTag = arrayTag,
	          othTag = arrayTag;
	
	      if (!objIsArr) {
	        objTag = objToString.call(object);
	        if (objTag == argsTag) {
	          objTag = objectTag;
	        } else if (objTag != objectTag) {
	          objIsArr = isTypedArray(object);
	        }
	      }
	      if (!othIsArr) {
	        othTag = objToString.call(other);
	        if (othTag == argsTag) {
	          othTag = objectTag;
	        } else if (othTag != objectTag) {
	          othIsArr = isTypedArray(other);
	        }
	      }
	      var objIsObj = objTag == objectTag,
	          othIsObj = othTag == objectTag,
	          isSameTag = objTag == othTag;
	
	      if (isSameTag && !(objIsArr || objIsObj)) {
	        return equalByTag(object, other, objTag);
	      }
	      if (!isLoose) {
	        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	        if (objIsWrapped || othIsWrapped) {
	          return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
	        }
	      }
	      if (!isSameTag) {
	        return false;
	      }
	      // Assume cyclic values are equal.
	      // For more information on detecting circular references see https://es5.github.io/#JO.
	      stackA || (stackA = []);
	      stackB || (stackB = []);
	
	      var length = stackA.length;
	      while (length--) {
	        if (stackA[length] == object) {
	          return stackB[length] == other;
	        }
	      }
	      // Add `object` and `other` to the stack of traversed objects.
	      stackA.push(object);
	      stackB.push(other);
	
	      var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
	
	      stackA.pop();
	      stackB.pop();
	
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.isMatch` without support for callback
	     * shorthands and `this` binding.
	     *
	     * @private
	     * @param {Object} object The object to inspect.
	     * @param {Array} matchData The propery names, values, and compare flags to match.
	     * @param {Function} [customizer] The function to customize comparing objects.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     */
	    function baseIsMatch(object, matchData, customizer) {
	      var index = matchData.length,
	          length = index,
	          noCustomizer = !customizer;
	
	      if (object == null) {
	        return !length;
	      }
	      object = toObject(object);
	      while (index--) {
	        var data = matchData[index];
	        if ((noCustomizer && data[2])
	              ? data[1] !== object[data[0]]
	              : !(data[0] in object)
	            ) {
	          return false;
	        }
	      }
	      while (++index < length) {
	        data = matchData[index];
	        var key = data[0],
	            objValue = object[key],
	            srcValue = data[1];
	
	        if (noCustomizer && data[2]) {
	          if (objValue === undefined && !(key in object)) {
	            return false;
	          }
	        } else {
	          var result = customizer ? customizer(objValue, srcValue, key) : undefined;
	          if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
	            return false;
	          }
	        }
	      }
	      return true;
	    }
	
	    /**
	     * The base implementation of `_.map` without support for callback shorthands
	     * and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {Array} Returns the new mapped array.
	     */
	    function baseMap(collection, iteratee) {
	      var index = -1,
	          result = isArrayLike(collection) ? Array(collection.length) : [];
	
	      baseEach(collection, function(value, key, collection) {
	        result[++index] = iteratee(value, key, collection);
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.matches` which does not clone `source`.
	     *
	     * @private
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new function.
	     */
	    function baseMatches(source) {
	      var matchData = getMatchData(source);
	      if (matchData.length == 1 && matchData[0][2]) {
	        var key = matchData[0][0],
	            value = matchData[0][1];
	
	        return function(object) {
	          if (object == null) {
	            return false;
	          }
	          return object[key] === value && (value !== undefined || (key in toObject(object)));
	        };
	      }
	      return function(object) {
	        return baseIsMatch(object, matchData);
	      };
	    }
	
	    /**
	     * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
	     *
	     * @private
	     * @param {string} path The path of the property to get.
	     * @param {*} srcValue The value to compare.
	     * @returns {Function} Returns the new function.
	     */
	    function baseMatchesProperty(path, srcValue) {
	      var isArr = isArray(path),
	          isCommon = isKey(path) && isStrictComparable(srcValue),
	          pathKey = (path + '');
	
	      path = toPath(path);
	      return function(object) {
	        if (object == null) {
	          return false;
	        }
	        var key = pathKey;
	        object = toObject(object);
	        if ((isArr || !isCommon) && !(key in object)) {
	          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	          if (object == null) {
	            return false;
	          }
	          key = last(path);
	          object = toObject(object);
	        }
	        return object[key] === srcValue
	          ? (srcValue !== undefined || (key in object))
	          : baseIsEqual(srcValue, object[key], undefined, true);
	      };
	    }
	
	    /**
	     * The base implementation of `_.merge` without support for argument juggling,
	     * multiple sources, and `this` binding `customizer` functions.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {Function} [customizer] The function to customize merged values.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     * @returns {Object} Returns `object`.
	     */
	    function baseMerge(object, source, customizer, stackA, stackB) {
	      if (!isObject(object)) {
	        return object;
	      }
	      var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
	          props = isSrcArr ? undefined : keys(source);
	
	      arrayEach(props || source, function(srcValue, key) {
	        if (props) {
	          key = srcValue;
	          srcValue = source[key];
	        }
	        if (isObjectLike(srcValue)) {
	          stackA || (stackA = []);
	          stackB || (stackB = []);
	          baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
	        }
	        else {
	          var value = object[key],
	              result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	              isCommon = result === undefined;
	
	          if (isCommon) {
	            result = srcValue;
	          }
	          if ((result !== undefined || (isSrcArr && !(key in object))) &&
	              (isCommon || (result === result ? (result !== value) : (value === value)))) {
	            object[key] = result;
	          }
	        }
	      });
	      return object;
	    }
	
	    /**
	     * A specialized version of `baseMerge` for arrays and objects which performs
	     * deep merges and tracks traversed objects enabling objects with circular
	     * references to be merged.
	     *
	     * @private
	     * @param {Object} object The destination object.
	     * @param {Object} source The source object.
	     * @param {string} key The key of the value to merge.
	     * @param {Function} mergeFunc The function to merge values.
	     * @param {Function} [customizer] The function to customize merged values.
	     * @param {Array} [stackA=[]] Tracks traversed source objects.
	     * @param {Array} [stackB=[]] Associates values with source counterparts.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
	      var length = stackA.length,
	          srcValue = source[key];
	
	      while (length--) {
	        if (stackA[length] == srcValue) {
	          object[key] = stackB[length];
	          return;
	        }
	      }
	      var value = object[key],
	          result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
	          isCommon = result === undefined;
	
	      if (isCommon) {
	        result = srcValue;
	        if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
	          result = isArray(value)
	            ? value
	            : (isArrayLike(value) ? arrayCopy(value) : []);
	        }
	        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
	          result = isArguments(value)
	            ? toPlainObject(value)
	            : (isPlainObject(value) ? value : {});
	        }
	        else {
	          isCommon = false;
	        }
	      }
	      // Add the source value to the stack of traversed objects and associate
	      // it with its merged value.
	      stackA.push(srcValue);
	      stackB.push(result);
	
	      if (isCommon) {
	        // Recursively merge objects and arrays (susceptible to call stack limits).
	        object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
	      } else if (result === result ? (result !== value) : (value === value)) {
	        object[key] = result;
	      }
	    }
	
	    /**
	     * The base implementation of `_.property` without support for deep paths.
	     *
	     * @private
	     * @param {string} key The key of the property to get.
	     * @returns {Function} Returns the new function.
	     */
	    function baseProperty(key) {
	      return function(object) {
	        return object == null ? undefined : object[key];
	      };
	    }
	
	    /**
	     * A specialized version of `baseProperty` which supports deep paths.
	     *
	     * @private
	     * @param {Array|string} path The path of the property to get.
	     * @returns {Function} Returns the new function.
	     */
	    function basePropertyDeep(path) {
	      var pathKey = (path + '');
	      path = toPath(path);
	      return function(object) {
	        return baseGet(object, path, pathKey);
	      };
	    }
	
	    /**
	     * The base implementation of `_.pullAt` without support for individual
	     * index arguments and capturing the removed elements.
	     *
	     * @private
	     * @param {Array} array The array to modify.
	     * @param {number[]} indexes The indexes of elements to remove.
	     * @returns {Array} Returns `array`.
	     */
	    function basePullAt(array, indexes) {
	      var length = array ? indexes.length : 0;
	      while (length--) {
	        var index = indexes[length];
	        if (index != previous && isIndex(index)) {
	          var previous = index;
	          splice.call(array, index, 1);
	        }
	      }
	      return array;
	    }
	
	    /**
	     * The base implementation of `_.random` without support for argument juggling
	     * and returning floating-point numbers.
	     *
	     * @private
	     * @param {number} min The minimum possible value.
	     * @param {number} max The maximum possible value.
	     * @returns {number} Returns the random number.
	     */
	    function baseRandom(min, max) {
	      return min + nativeFloor(nativeRandom() * (max - min + 1));
	    }
	
	    /**
	     * The base implementation of `_.reduce` and `_.reduceRight` without support
	     * for callback shorthands and `this` binding, which iterates over `collection`
	     * using the provided `eachFunc`.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {*} accumulator The initial value.
	     * @param {boolean} initFromCollection Specify using the first or last element
	     *  of `collection` as the initial value.
	     * @param {Function} eachFunc The function to iterate over `collection`.
	     * @returns {*} Returns the accumulated value.
	     */
	    function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
	      eachFunc(collection, function(value, index, collection) {
	        accumulator = initFromCollection
	          ? (initFromCollection = false, value)
	          : iteratee(accumulator, value, index, collection);
	      });
	      return accumulator;
	    }
	
	    /**
	     * The base implementation of `setData` without support for hot loop detection.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var baseSetData = !metaMap ? identity : function(func, data) {
	      metaMap.set(func, data);
	      return func;
	    };
	
	    /**
	     * The base implementation of `_.slice` without an iteratee call guard.
	     *
	     * @private
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function baseSlice(array, start, end) {
	      var index = -1,
	          length = array.length;
	
	      start = start == null ? 0 : (+start || 0);
	      if (start < 0) {
	        start = -start > length ? 0 : (length + start);
	      }
	      end = (end === undefined || end > length) ? length : (+end || 0);
	      if (end < 0) {
	        end += length;
	      }
	      length = start > end ? 0 : ((end - start) >>> 0);
	      start >>>= 0;
	
	      var result = Array(length);
	      while (++index < length) {
	        result[index] = array[index + start];
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.some` without support for callback shorthands
	     * and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     */
	    function baseSome(collection, predicate) {
	      var result;
	
	      baseEach(collection, function(value, index, collection) {
	        result = predicate(value, index, collection);
	        return !result;
	      });
	      return !!result;
	    }
	
	    /**
	     * The base implementation of `_.sortBy` which uses `comparer` to define
	     * the sort order of `array` and replaces criteria objects with their
	     * corresponding values.
	     *
	     * @private
	     * @param {Array} array The array to sort.
	     * @param {Function} comparer The function to define sort order.
	     * @returns {Array} Returns `array`.
	     */
	    function baseSortBy(array, comparer) {
	      var length = array.length;
	
	      array.sort(comparer);
	      while (length--) {
	        array[length] = array[length].value;
	      }
	      return array;
	    }
	
	    /**
	     * The base implementation of `_.sortByOrder` without param guards.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	     * @param {boolean[]} orders The sort orders of `iteratees`.
	     * @returns {Array} Returns the new sorted array.
	     */
	    function baseSortByOrder(collection, iteratees, orders) {
	      var callback = getCallback(),
	          index = -1;
	
	      iteratees = arrayMap(iteratees, function(iteratee) { return callback(iteratee); });
	
	      var result = baseMap(collection, function(value) {
	        var criteria = arrayMap(iteratees, function(iteratee) { return iteratee(value); });
	        return { 'criteria': criteria, 'index': ++index, 'value': value };
	      });
	
	      return baseSortBy(result, function(object, other) {
	        return compareMultiple(object, other, orders);
	      });
	    }
	
	    /**
	     * The base implementation of `_.sum` without support for callback shorthands
	     * and `this` binding.
	     *
	     * @private
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @returns {number} Returns the sum.
	     */
	    function baseSum(collection, iteratee) {
	      var result = 0;
	      baseEach(collection, function(value, index, collection) {
	        result += +iteratee(value, index, collection) || 0;
	      });
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.uniq` without support for callback shorthands
	     * and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to inspect.
	     * @param {Function} [iteratee] The function invoked per iteration.
	     * @returns {Array} Returns the new duplicate-value-free array.
	     */
	    function baseUniq(array, iteratee) {
	      var index = -1,
	          indexOf = getIndexOf(),
	          length = array.length,
	          isCommon = indexOf == baseIndexOf,
	          isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
	          seen = isLarge ? createCache() : null,
	          result = [];
	
	      if (seen) {
	        indexOf = cacheIndexOf;
	        isCommon = false;
	      } else {
	        isLarge = false;
	        seen = iteratee ? [] : result;
	      }
	      outer:
	      while (++index < length) {
	        var value = array[index],
	            computed = iteratee ? iteratee(value, index, array) : value;
	
	        if (isCommon && value === value) {
	          var seenIndex = seen.length;
	          while (seenIndex--) {
	            if (seen[seenIndex] === computed) {
	              continue outer;
	            }
	          }
	          if (iteratee) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	        else if (indexOf(seen, computed, 0) < 0) {
	          if (iteratee || isLarge) {
	            seen.push(computed);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.values` and `_.valuesIn` which creates an
	     * array of `object` property values corresponding to the property names
	     * of `props`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array} props The property names to get values for.
	     * @returns {Object} Returns the array of property values.
	     */
	    function baseValues(object, props) {
	      var index = -1,
	          length = props.length,
	          result = Array(length);
	
	      while (++index < length) {
	        result[index] = object[props[index]];
	      }
	      return result;
	    }
	
	    /**
	     * The base implementation of `_.dropRightWhile`, `_.dropWhile`, `_.takeRightWhile`,
	     * and `_.takeWhile` without support for callback shorthands and `this` binding.
	     *
	     * @private
	     * @param {Array} array The array to query.
	     * @param {Function} predicate The function invoked per iteration.
	     * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function baseWhile(array, predicate, isDrop, fromRight) {
	      var length = array.length,
	          index = fromRight ? length : -1;
	
	      while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
	      return isDrop
	        ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
	        : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
	    }
	
	    /**
	     * The base implementation of `wrapperValue` which returns the result of
	     * performing a sequence of actions on the unwrapped `value`, where each
	     * successive action is supplied the return value of the previous.
	     *
	     * @private
	     * @param {*} value The unwrapped value.
	     * @param {Array} actions Actions to peform to resolve the unwrapped value.
	     * @returns {*} Returns the resolved value.
	     */
	    function baseWrapperValue(value, actions) {
	      var result = value;
	      if (result instanceof LazyWrapper) {
	        result = result.value();
	      }
	      var index = -1,
	          length = actions.length;
	
	      while (++index < length) {
	        var action = actions[index];
	        result = action.func.apply(action.thisArg, arrayPush([result], action.args));
	      }
	      return result;
	    }
	
	    /**
	     * Performs a binary search of `array` to determine the index at which `value`
	     * should be inserted into `array` in order to maintain its sort order.
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {boolean} [retHighest] Specify returning the highest qualified index.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function binaryIndex(array, value, retHighest) {
	      var low = 0,
	          high = array ? array.length : low;
	
	      if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
	        while (low < high) {
	          var mid = (low + high) >>> 1,
	              computed = array[mid];
	
	          if ((retHighest ? (computed <= value) : (computed < value)) && computed !== null) {
	            low = mid + 1;
	          } else {
	            high = mid;
	          }
	        }
	        return high;
	      }
	      return binaryIndexBy(array, value, identity, retHighest);
	    }
	
	    /**
	     * This function is like `binaryIndex` except that it invokes `iteratee` for
	     * `value` and each element of `array` to compute their sort ranking. The
	     * iteratee is invoked with one argument; (value).
	     *
	     * @private
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function} iteratee The function invoked per iteration.
	     * @param {boolean} [retHighest] Specify returning the highest qualified index.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     */
	    function binaryIndexBy(array, value, iteratee, retHighest) {
	      value = iteratee(value);
	
	      var low = 0,
	          high = array ? array.length : 0,
	          valIsNaN = value !== value,
	          valIsNull = value === null,
	          valIsUndef = value === undefined;
	
	      while (low < high) {
	        var mid = nativeFloor((low + high) / 2),
	            computed = iteratee(array[mid]),
	            isDef = computed !== undefined,
	            isReflexive = computed === computed;
	
	        if (valIsNaN) {
	          var setLow = isReflexive || retHighest;
	        } else if (valIsNull) {
	          setLow = isReflexive && isDef && (retHighest || computed != null);
	        } else if (valIsUndef) {
	          setLow = isReflexive && (retHighest || isDef);
	        } else if (computed == null) {
	          setLow = false;
	        } else {
	          setLow = retHighest ? (computed <= value) : (computed < value);
	        }
	        if (setLow) {
	          low = mid + 1;
	        } else {
	          high = mid;
	        }
	      }
	      return nativeMin(high, MAX_ARRAY_INDEX);
	    }
	
	    /**
	     * A specialized version of `baseCallback` which only supports `this` binding
	     * and specifying the number of arguments to provide to `func`.
	     *
	     * @private
	     * @param {Function} func The function to bind.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {number} [argCount] The number of arguments to provide to `func`.
	     * @returns {Function} Returns the callback.
	     */
	    function bindCallback(func, thisArg, argCount) {
	      if (typeof func != 'function') {
	        return identity;
	      }
	      if (thisArg === undefined) {
	        return func;
	      }
	      switch (argCount) {
	        case 1: return function(value) {
	          return func.call(thisArg, value);
	        };
	        case 3: return function(value, index, collection) {
	          return func.call(thisArg, value, index, collection);
	        };
	        case 4: return function(accumulator, value, index, collection) {
	          return func.call(thisArg, accumulator, value, index, collection);
	        };
	        case 5: return function(value, other, key, object, source) {
	          return func.call(thisArg, value, other, key, object, source);
	        };
	      }
	      return function() {
	        return func.apply(thisArg, arguments);
	      };
	    }
	
	    /**
	     * Creates a clone of the given array buffer.
	     *
	     * @private
	     * @param {ArrayBuffer} buffer The array buffer to clone.
	     * @returns {ArrayBuffer} Returns the cloned array buffer.
	     */
	    function bufferClone(buffer) {
	      var result = new ArrayBuffer(buffer.byteLength),
	          view = new Uint8Array(result);
	
	      view.set(new Uint8Array(buffer));
	      return result;
	    }
	
	    /**
	     * Creates an array that is the composition of partially applied arguments,
	     * placeholders, and provided arguments into a single array of arguments.
	     *
	     * @private
	     * @param {Array|Object} args The provided arguments.
	     * @param {Array} partials The arguments to prepend to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgs(args, partials, holders) {
	      var holdersLength = holders.length,
	          argsIndex = -1,
	          argsLength = nativeMax(args.length - holdersLength, 0),
	          leftIndex = -1,
	          leftLength = partials.length,
	          result = Array(leftLength + argsLength);
	
	      while (++leftIndex < leftLength) {
	        result[leftIndex] = partials[leftIndex];
	      }
	      while (++argsIndex < holdersLength) {
	        result[holders[argsIndex]] = args[argsIndex];
	      }
	      while (argsLength--) {
	        result[leftIndex++] = args[argsIndex++];
	      }
	      return result;
	    }
	
	    /**
	     * This function is like `composeArgs` except that the arguments composition
	     * is tailored for `_.partialRight`.
	     *
	     * @private
	     * @param {Array|Object} args The provided arguments.
	     * @param {Array} partials The arguments to append to those provided.
	     * @param {Array} holders The `partials` placeholder indexes.
	     * @returns {Array} Returns the new array of composed arguments.
	     */
	    function composeArgsRight(args, partials, holders) {
	      var holdersIndex = -1,
	          holdersLength = holders.length,
	          argsIndex = -1,
	          argsLength = nativeMax(args.length - holdersLength, 0),
	          rightIndex = -1,
	          rightLength = partials.length,
	          result = Array(argsLength + rightLength);
	
	      while (++argsIndex < argsLength) {
	        result[argsIndex] = args[argsIndex];
	      }
	      var offset = argsIndex;
	      while (++rightIndex < rightLength) {
	        result[offset + rightIndex] = partials[rightIndex];
	      }
	      while (++holdersIndex < holdersLength) {
	        result[offset + holders[holdersIndex]] = args[argsIndex++];
	      }
	      return result;
	    }
	
	    /**
	     * Creates a `_.countBy`, `_.groupBy`, `_.indexBy`, or `_.partition` function.
	     *
	     * @private
	     * @param {Function} setter The function to set keys and values of the accumulator object.
	     * @param {Function} [initializer] The function to initialize the accumulator object.
	     * @returns {Function} Returns the new aggregator function.
	     */
	    function createAggregator(setter, initializer) {
	      return function(collection, iteratee, thisArg) {
	        var result = initializer ? initializer() : {};
	        iteratee = getCallback(iteratee, thisArg, 3);
	
	        if (isArray(collection)) {
	          var index = -1,
	              length = collection.length;
	
	          while (++index < length) {
	            var value = collection[index];
	            setter(result, value, iteratee(value, index, collection), collection);
	          }
	        } else {
	          baseEach(collection, function(value, key, collection) {
	            setter(result, value, iteratee(value, key, collection), collection);
	          });
	        }
	        return result;
	      };
	    }
	
	    /**
	     * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
	     *
	     * @private
	     * @param {Function} assigner The function to assign values.
	     * @returns {Function} Returns the new assigner function.
	     */
	    function createAssigner(assigner) {
	      return restParam(function(object, sources) {
	        var index = -1,
	            length = object == null ? 0 : sources.length,
	            customizer = length > 2 ? sources[length - 2] : undefined,
	            guard = length > 2 ? sources[2] : undefined,
	            thisArg = length > 1 ? sources[length - 1] : undefined;
	
	        if (typeof customizer == 'function') {
	          customizer = bindCallback(customizer, thisArg, 5);
	          length -= 2;
	        } else {
	          customizer = typeof thisArg == 'function' ? thisArg : undefined;
	          length -= (customizer ? 1 : 0);
	        }
	        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
	          customizer = length < 3 ? undefined : customizer;
	          length = 1;
	        }
	        while (++index < length) {
	          var source = sources[index];
	          if (source) {
	            assigner(object, source, customizer);
	          }
	        }
	        return object;
	      });
	    }
	
	    /**
	     * Creates a `baseEach` or `baseEachRight` function.
	     *
	     * @private
	     * @param {Function} eachFunc The function to iterate over a collection.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new base function.
	     */
	    function createBaseEach(eachFunc, fromRight) {
	      return function(collection, iteratee) {
	        var length = collection ? getLength(collection) : 0;
	        if (!isLength(length)) {
	          return eachFunc(collection, iteratee);
	        }
	        var index = fromRight ? length : -1,
	            iterable = toObject(collection);
	
	        while ((fromRight ? index-- : ++index < length)) {
	          if (iteratee(iterable[index], index, iterable) === false) {
	            break;
	          }
	        }
	        return collection;
	      };
	    }
	
	    /**
	     * Creates a base function for `_.forIn` or `_.forInRight`.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new base function.
	     */
	    function createBaseFor(fromRight) {
	      return function(object, iteratee, keysFunc) {
	        var iterable = toObject(object),
	            props = keysFunc(object),
	            length = props.length,
	            index = fromRight ? length : -1;
	
	        while ((fromRight ? index-- : ++index < length)) {
	          var key = props[index];
	          if (iteratee(iterable[key], key, iterable) === false) {
	            break;
	          }
	        }
	        return object;
	      };
	    }
	
	    /**
	     * Creates a function that wraps `func` and invokes it with the `this`
	     * binding of `thisArg`.
	     *
	     * @private
	     * @param {Function} func The function to bind.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @returns {Function} Returns the new bound function.
	     */
	    function createBindWrapper(func, thisArg) {
	      var Ctor = createCtorWrapper(func);
	
	      function wrapper() {
	        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	        return fn.apply(thisArg, arguments);
	      }
	      return wrapper;
	    }
	
	    /**
	     * Creates a `Set` cache object to optimize linear searches of large arrays.
	     *
	     * @private
	     * @param {Array} [values] The values to cache.
	     * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
	     */
	    function createCache(values) {
	      return (nativeCreate && Set) ? new SetCache(values) : null;
	    }
	
	    /**
	     * Creates a function that produces compound words out of the words in a
	     * given string.
	     *
	     * @private
	     * @param {Function} callback The function to combine each word.
	     * @returns {Function} Returns the new compounder function.
	     */
	    function createCompounder(callback) {
	      return function(string) {
	        var index = -1,
	            array = words(deburr(string)),
	            length = array.length,
	            result = '';
	
	        while (++index < length) {
	          result = callback(result, array[index], index);
	        }
	        return result;
	      };
	    }
	
	    /**
	     * Creates a function that produces an instance of `Ctor` regardless of
	     * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	     *
	     * @private
	     * @param {Function} Ctor The constructor to wrap.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createCtorWrapper(Ctor) {
	      return function() {
	        // Use a `switch` statement to work with class constructors.
	        // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
	        // for more details.
	        var args = arguments;
	        switch (args.length) {
	          case 0: return new Ctor;
	          case 1: return new Ctor(args[0]);
	          case 2: return new Ctor(args[0], args[1]);
	          case 3: return new Ctor(args[0], args[1], args[2]);
	          case 4: return new Ctor(args[0], args[1], args[2], args[3]);
	          case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
	          case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
	          case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	        }
	        var thisBinding = baseCreate(Ctor.prototype),
	            result = Ctor.apply(thisBinding, args);
	
	        // Mimic the constructor's `return` behavior.
	        // See https://es5.github.io/#x13.2.2 for more details.
	        return isObject(result) ? result : thisBinding;
	      };
	    }
	
	    /**
	     * Creates a `_.curry` or `_.curryRight` function.
	     *
	     * @private
	     * @param {boolean} flag The curry bit flag.
	     * @returns {Function} Returns the new curry function.
	     */
	    function createCurry(flag) {
	      function curryFunc(func, arity, guard) {
	        if (guard && isIterateeCall(func, arity, guard)) {
	          arity = undefined;
	        }
	        var result = createWrapper(func, flag, undefined, undefined, undefined, undefined, undefined, arity);
	        result.placeholder = curryFunc.placeholder;
	        return result;
	      }
	      return curryFunc;
	    }
	
	    /**
	     * Creates a `_.defaults` or `_.defaultsDeep` function.
	     *
	     * @private
	     * @param {Function} assigner The function to assign values.
	     * @param {Function} customizer The function to customize assigned values.
	     * @returns {Function} Returns the new defaults function.
	     */
	    function createDefaults(assigner, customizer) {
	      return restParam(function(args) {
	        var object = args[0];
	        if (object == null) {
	          return object;
	        }
	        args.push(customizer);
	        return assigner.apply(undefined, args);
	      });
	    }
	
	    /**
	     * Creates a `_.max` or `_.min` function.
	     *
	     * @private
	     * @param {Function} comparator The function used to compare values.
	     * @param {*} exValue The initial extremum value.
	     * @returns {Function} Returns the new extremum function.
	     */
	    function createExtremum(comparator, exValue) {
	      return function(collection, iteratee, thisArg) {
	        if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
	          iteratee = undefined;
	        }
	        iteratee = getCallback(iteratee, thisArg, 3);
	        if (iteratee.length == 1) {
	          collection = isArray(collection) ? collection : toIterable(collection);
	          var result = arrayExtremum(collection, iteratee, comparator, exValue);
	          if (!(collection.length && result === exValue)) {
	            return result;
	          }
	        }
	        return baseExtremum(collection, iteratee, comparator, exValue);
	      };
	    }
	
	    /**
	     * Creates a `_.find` or `_.findLast` function.
	     *
	     * @private
	     * @param {Function} eachFunc The function to iterate over a collection.
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new find function.
	     */
	    function createFind(eachFunc, fromRight) {
	      return function(collection, predicate, thisArg) {
	        predicate = getCallback(predicate, thisArg, 3);
	        if (isArray(collection)) {
	          var index = baseFindIndex(collection, predicate, fromRight);
	          return index > -1 ? collection[index] : undefined;
	        }
	        return baseFind(collection, predicate, eachFunc);
	      };
	    }
	
	    /**
	     * Creates a `_.findIndex` or `_.findLastIndex` function.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new find function.
	     */
	    function createFindIndex(fromRight) {
	      return function(array, predicate, thisArg) {
	        if (!(array && array.length)) {
	          return -1;
	        }
	        predicate = getCallback(predicate, thisArg, 3);
	        return baseFindIndex(array, predicate, fromRight);
	      };
	    }
	
	    /**
	     * Creates a `_.findKey` or `_.findLastKey` function.
	     *
	     * @private
	     * @param {Function} objectFunc The function to iterate over an object.
	     * @returns {Function} Returns the new find function.
	     */
	    function createFindKey(objectFunc) {
	      return function(object, predicate, thisArg) {
	        predicate = getCallback(predicate, thisArg, 3);
	        return baseFind(object, predicate, objectFunc, true);
	      };
	    }
	
	    /**
	     * Creates a `_.flow` or `_.flowRight` function.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify iterating from right to left.
	     * @returns {Function} Returns the new flow function.
	     */
	    function createFlow(fromRight) {
	      return function() {
	        var wrapper,
	            length = arguments.length,
	            index = fromRight ? length : -1,
	            leftIndex = 0,
	            funcs = Array(length);
	
	        while ((fromRight ? index-- : ++index < length)) {
	          var func = funcs[leftIndex++] = arguments[index];
	          if (typeof func != 'function') {
	            throw new TypeError(FUNC_ERROR_TEXT);
	          }
	          if (!wrapper && LodashWrapper.prototype.thru && getFuncName(func) == 'wrapper') {
	            wrapper = new LodashWrapper([], true);
	          }
	        }
	        index = wrapper ? -1 : length;
	        while (++index < length) {
	          func = funcs[index];
	
	          var funcName = getFuncName(func),
	              data = funcName == 'wrapper' ? getData(func) : undefined;
	
	          if (data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && data[9] == 1) {
	            wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
	          } else {
	            wrapper = (func.length == 1 && isLaziable(func)) ? wrapper[funcName]() : wrapper.thru(func);
	          }
	        }
	        return function() {
	          var args = arguments,
	              value = args[0];
	
	          if (wrapper && args.length == 1 && isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
	            return wrapper.plant(value).value();
	          }
	          var index = 0,
	              result = length ? funcs[index].apply(this, args) : value;
	
	          while (++index < length) {
	            result = funcs[index].call(this, result);
	          }
	          return result;
	        };
	      };
	    }
	
	    /**
	     * Creates a function for `_.forEach` or `_.forEachRight`.
	     *
	     * @private
	     * @param {Function} arrayFunc The function to iterate over an array.
	     * @param {Function} eachFunc The function to iterate over a collection.
	     * @returns {Function} Returns the new each function.
	     */
	    function createForEach(arrayFunc, eachFunc) {
	      return function(collection, iteratee, thisArg) {
	        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	          ? arrayFunc(collection, iteratee)
	          : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	      };
	    }
	
	    /**
	     * Creates a function for `_.forIn` or `_.forInRight`.
	     *
	     * @private
	     * @param {Function} objectFunc The function to iterate over an object.
	     * @returns {Function} Returns the new each function.
	     */
	    function createForIn(objectFunc) {
	      return function(object, iteratee, thisArg) {
	        if (typeof iteratee != 'function' || thisArg !== undefined) {
	          iteratee = bindCallback(iteratee, thisArg, 3);
	        }
	        return objectFunc(object, iteratee, keysIn);
	      };
	    }
	
	    /**
	     * Creates a function for `_.forOwn` or `_.forOwnRight`.
	     *
	     * @private
	     * @param {Function} objectFunc The function to iterate over an object.
	     * @returns {Function} Returns the new each function.
	     */
	    function createForOwn(objectFunc) {
	      return function(object, iteratee, thisArg) {
	        if (typeof iteratee != 'function' || thisArg !== undefined) {
	          iteratee = bindCallback(iteratee, thisArg, 3);
	        }
	        return objectFunc(object, iteratee);
	      };
	    }
	
	    /**
	     * Creates a function for `_.mapKeys` or `_.mapValues`.
	     *
	     * @private
	     * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
	     * @returns {Function} Returns the new map function.
	     */
	    function createObjectMapper(isMapKeys) {
	      return function(object, iteratee, thisArg) {
	        var result = {};
	        iteratee = getCallback(iteratee, thisArg, 3);
	
	        baseForOwn(object, function(value, key, object) {
	          var mapped = iteratee(value, key, object);
	          key = isMapKeys ? mapped : key;
	          value = isMapKeys ? value : mapped;
	          result[key] = value;
	        });
	        return result;
	      };
	    }
	
	    /**
	     * Creates a function for `_.padLeft` or `_.padRight`.
	     *
	     * @private
	     * @param {boolean} [fromRight] Specify padding from the right.
	     * @returns {Function} Returns the new pad function.
	     */
	    function createPadDir(fromRight) {
	      return function(string, length, chars) {
	        string = baseToString(string);
	        return (fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string);
	      };
	    }
	
	    /**
	     * Creates a `_.partial` or `_.partialRight` function.
	     *
	     * @private
	     * @param {boolean} flag The partial bit flag.
	     * @returns {Function} Returns the new partial function.
	     */
	    function createPartial(flag) {
	      var partialFunc = restParam(function(func, partials) {
	        var holders = replaceHolders(partials, partialFunc.placeholder);
	        return createWrapper(func, flag, undefined, partials, holders);
	      });
	      return partialFunc;
	    }
	
	    /**
	     * Creates a function for `_.reduce` or `_.reduceRight`.
	     *
	     * @private
	     * @param {Function} arrayFunc The function to iterate over an array.
	     * @param {Function} eachFunc The function to iterate over a collection.
	     * @returns {Function} Returns the new each function.
	     */
	    function createReduce(arrayFunc, eachFunc) {
	      return function(collection, iteratee, accumulator, thisArg) {
	        var initFromArray = arguments.length < 3;
	        return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	          ? arrayFunc(collection, iteratee, accumulator, initFromArray)
	          : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
	      };
	    }
	
	    /**
	     * Creates a function that wraps `func` and invokes it with optional `this`
	     * binding of, partial application, and currying.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to prepend to those provided to the new function.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
	     * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	      var isAry = bitmask & ARY_FLAG,
	          isBind = bitmask & BIND_FLAG,
	          isBindKey = bitmask & BIND_KEY_FLAG,
	          isCurry = bitmask & CURRY_FLAG,
	          isCurryBound = bitmask & CURRY_BOUND_FLAG,
	          isCurryRight = bitmask & CURRY_RIGHT_FLAG,
	          Ctor = isBindKey ? undefined : createCtorWrapper(func);
	
	      function wrapper() {
	        // Avoid `arguments` object use disqualifying optimizations by
	        // converting it to an array before providing it to other functions.
	        var length = arguments.length,
	            index = length,
	            args = Array(length);
	
	        while (index--) {
	          args[index] = arguments[index];
	        }
	        if (partials) {
	          args = composeArgs(args, partials, holders);
	        }
	        if (partialsRight) {
	          args = composeArgsRight(args, partialsRight, holdersRight);
	        }
	        if (isCurry || isCurryRight) {
	          var placeholder = wrapper.placeholder,
	              argsHolders = replaceHolders(args, placeholder);
	
	          length -= argsHolders.length;
	          if (length < arity) {
	            var newArgPos = argPos ? arrayCopy(argPos) : undefined,
	                newArity = nativeMax(arity - length, 0),
	                newsHolders = isCurry ? argsHolders : undefined,
	                newHoldersRight = isCurry ? undefined : argsHolders,
	                newPartials = isCurry ? args : undefined,
	                newPartialsRight = isCurry ? undefined : args;
	
	            bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
	            bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);
	
	            if (!isCurryBound) {
	              bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
	            }
	            var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
	                result = createHybridWrapper.apply(undefined, newData);
	
	            if (isLaziable(func)) {
	              setData(result, newData);
	            }
	            result.placeholder = placeholder;
	            return result;
	          }
	        }
	        var thisBinding = isBind ? thisArg : this,
	            fn = isBindKey ? thisBinding[func] : func;
	
	        if (argPos) {
	          args = reorder(args, argPos);
	        }
	        if (isAry && ary < args.length) {
	          args.length = ary;
	        }
	        if (this && this !== root && this instanceof wrapper) {
	          fn = Ctor || createCtorWrapper(func);
	        }
	        return fn.apply(thisBinding, args);
	      }
	      return wrapper;
	    }
	
	    /**
	     * Creates the padding required for `string` based on the given `length`.
	     * The `chars` string is truncated if the number of characters exceeds `length`.
	     *
	     * @private
	     * @param {string} string The string to create padding for.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the pad for `string`.
	     */
	    function createPadding(string, length, chars) {
	      var strLength = string.length;
	      length = +length;
	
	      if (strLength >= length || !nativeIsFinite(length)) {
	        return '';
	      }
	      var padLength = length - strLength;
	      chars = chars == null ? ' ' : (chars + '');
	      return repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
	    }
	
	    /**
	     * Creates a function that wraps `func` and invokes it with the optional `this`
	     * binding of `thisArg` and the `partials` prepended to those provided to
	     * the wrapper.
	     *
	     * @private
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {Array} partials The arguments to prepend to those provided to the new function.
	     * @returns {Function} Returns the new bound function.
	     */
	    function createPartialWrapper(func, bitmask, thisArg, partials) {
	      var isBind = bitmask & BIND_FLAG,
	          Ctor = createCtorWrapper(func);
	
	      function wrapper() {
	        // Avoid `arguments` object use disqualifying optimizations by
	        // converting it to an array before providing it `func`.
	        var argsIndex = -1,
	            argsLength = arguments.length,
	            leftIndex = -1,
	            leftLength = partials.length,
	            args = Array(leftLength + argsLength);
	
	        while (++leftIndex < leftLength) {
	          args[leftIndex] = partials[leftIndex];
	        }
	        while (argsLength--) {
	          args[leftIndex++] = arguments[++argsIndex];
	        }
	        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
	        return fn.apply(isBind ? thisArg : this, args);
	      }
	      return wrapper;
	    }
	
	    /**
	     * Creates a `_.ceil`, `_.floor`, or `_.round` function.
	     *
	     * @private
	     * @param {string} methodName The name of the `Math` method to use when rounding.
	     * @returns {Function} Returns the new round function.
	     */
	    function createRound(methodName) {
	      var func = Math[methodName];
	      return function(number, precision) {
	        precision = precision === undefined ? 0 : (+precision || 0);
	        if (precision) {
	          precision = pow(10, precision);
	          return func(number * precision) / precision;
	        }
	        return func(number);
	      };
	    }
	
	    /**
	     * Creates a `_.sortedIndex` or `_.sortedLastIndex` function.
	     *
	     * @private
	     * @param {boolean} [retHighest] Specify returning the highest qualified index.
	     * @returns {Function} Returns the new index function.
	     */
	    function createSortedIndex(retHighest) {
	      return function(array, value, iteratee, thisArg) {
	        var callback = getCallback(iteratee);
	        return (iteratee == null && callback === baseCallback)
	          ? binaryIndex(array, value, retHighest)
	          : binaryIndexBy(array, value, callback(iteratee, thisArg, 1), retHighest);
	      };
	    }
	
	    /**
	     * Creates a function that either curries or invokes `func` with optional
	     * `this` binding and partially applied arguments.
	     *
	     * @private
	     * @param {Function|string} func The function or method name to reference.
	     * @param {number} bitmask The bitmask of flags.
	     *  The bitmask may be composed of the following flags:
	     *     1 - `_.bind`
	     *     2 - `_.bindKey`
	     *     4 - `_.curry` or `_.curryRight` of a bound function
	     *     8 - `_.curry`
	     *    16 - `_.curryRight`
	     *    32 - `_.partial`
	     *    64 - `_.partialRight`
	     *   128 - `_.rearg`
	     *   256 - `_.ary`
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param {Array} [partials] The arguments to be partially applied.
	     * @param {Array} [holders] The `partials` placeholder indexes.
	     * @param {Array} [argPos] The argument positions of the new function.
	     * @param {number} [ary] The arity cap of `func`.
	     * @param {number} [arity] The arity of `func`.
	     * @returns {Function} Returns the new wrapped function.
	     */
	    function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	      var isBindKey = bitmask & BIND_KEY_FLAG;
	      if (!isBindKey && typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var length = partials ? partials.length : 0;
	      if (!length) {
	        bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
	        partials = holders = undefined;
	      }
	      length -= (holders ? holders.length : 0);
	      if (bitmask & PARTIAL_RIGHT_FLAG) {
	        var partialsRight = partials,
	            holdersRight = holders;
	
	        partials = holders = undefined;
	      }
	      var data = isBindKey ? undefined : getData(func),
	          newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];
	
	      if (data) {
	        mergeData(newData, data);
	        bitmask = newData[1];
	        arity = newData[9];
	      }
	      newData[9] = arity == null
	        ? (isBindKey ? 0 : func.length)
	        : (nativeMax(arity - length, 0) || 0);
	
	      if (bitmask == BIND_FLAG) {
	        var result = createBindWrapper(newData[0], newData[2]);
	      } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
	        result = createPartialWrapper.apply(undefined, newData);
	      } else {
	        result = createHybridWrapper.apply(undefined, newData);
	      }
	      var setter = data ? baseSetData : setData;
	      return setter(result, newData);
	    }
	
	    /**
	     * A specialized version of `baseIsEqualDeep` for arrays with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Array} array The array to compare.
	     * @param {Array} other The other array to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing arrays.
	     * @param {boolean} [isLoose] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	     */
	    function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
	      var index = -1,
	          arrLength = array.length,
	          othLength = other.length;
	
	      if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
	        return false;
	      }
	      // Ignore non-index properties.
	      while (++index < arrLength) {
	        var arrValue = array[index],
	            othValue = other[index],
	            result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
	
	        if (result !== undefined) {
	          if (result) {
	            continue;
	          }
	          return false;
	        }
	        // Recursively compare arrays (susceptible to call stack limits).
	        if (isLoose) {
	          if (!arraySome(other, function(othValue) {
	                return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
	              })) {
	            return false;
	          }
	        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
	          return false;
	        }
	      }
	      return true;
	    }
	
	    /**
	     * A specialized version of `baseIsEqualDeep` for comparing objects of
	     * the same `toStringTag`.
	     *
	     * **Note:** This function only supports comparing values with tags of
	     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {string} tag The `toStringTag` of the objects to compare.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalByTag(object, other, tag) {
	      switch (tag) {
	        case boolTag:
	        case dateTag:
	          // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	          return +object == +other;
	
	        case errorTag:
	          return object.name == other.name && object.message == other.message;
	
	        case numberTag:
	          // Treat `NaN` vs. `NaN` as equal.
	          return (object != +object)
	            ? other != +other
	            : object == +other;
	
	        case regexpTag:
	        case stringTag:
	          // Coerce regexes to strings and treat strings primitives and string
	          // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	          return object == (other + '');
	      }
	      return false;
	    }
	
	    /**
	     * A specialized version of `baseIsEqualDeep` for objects with support for
	     * partial deep comparisons.
	     *
	     * @private
	     * @param {Object} object The object to compare.
	     * @param {Object} other The other object to compare.
	     * @param {Function} equalFunc The function to determine equivalents of values.
	     * @param {Function} [customizer] The function to customize comparing values.
	     * @param {boolean} [isLoose] Specify performing partial comparisons.
	     * @param {Array} [stackA] Tracks traversed `value` objects.
	     * @param {Array} [stackB] Tracks traversed `other` objects.
	     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	     */
	    function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	      var objProps = keys(object),
	          objLength = objProps.length,
	          othProps = keys(other),
	          othLength = othProps.length;
	
	      if (objLength != othLength && !isLoose) {
	        return false;
	      }
	      var index = objLength;
	      while (index--) {
	        var key = objProps[index];
	        if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
	          return false;
	        }
	      }
	      var skipCtor = isLoose;
	      while (++index < objLength) {
	        key = objProps[index];
	        var objValue = object[key],
	            othValue = other[key],
	            result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
	
	        // Recursively compare objects (susceptible to call stack limits).
	        if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
	          return false;
	        }
	        skipCtor || (skipCtor = key == 'constructor');
	      }
	      if (!skipCtor) {
	        var objCtor = object.constructor,
	            othCtor = other.constructor;
	
	        // Non `Object` object instances with different constructors are not equal.
	        if (objCtor != othCtor &&
	            ('constructor' in object && 'constructor' in other) &&
	            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	          return false;
	        }
	      }
	      return true;
	    }
	
	    /**
	     * Gets the appropriate "callback" function. If the `_.callback` method is
	     * customized this function returns the custom method, otherwise it returns
	     * the `baseCallback` function. If arguments are provided the chosen function
	     * is invoked with them and its result is returned.
	     *
	     * @private
	     * @returns {Function} Returns the chosen function or its result.
	     */
	    function getCallback(func, thisArg, argCount) {
	      var result = lodash.callback || callback;
	      result = result === callback ? baseCallback : result;
	      return argCount ? result(func, thisArg, argCount) : result;
	    }
	
	    /**
	     * Gets metadata for `func`.
	     *
	     * @private
	     * @param {Function} func The function to query.
	     * @returns {*} Returns the metadata for `func`.
	     */
	    var getData = !metaMap ? noop : function(func) {
	      return metaMap.get(func);
	    };
	
	    /**
	     * Gets the name of `func`.
	     *
	     * @private
	     * @param {Function} func The function to query.
	     * @returns {string} Returns the function name.
	     */
	    function getFuncName(func) {
	      var result = func.name,
	          array = realNames[result],
	          length = array ? array.length : 0;
	
	      while (length--) {
	        var data = array[length],
	            otherFunc = data.func;
	        if (otherFunc == null || otherFunc == func) {
	          return data.name;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
	     * customized this function returns the custom method, otherwise it returns
	     * the `baseIndexOf` function. If arguments are provided the chosen function
	     * is invoked with them and its result is returned.
	     *
	     * @private
	     * @returns {Function|number} Returns the chosen function or its result.
	     */
	    function getIndexOf(collection, target, fromIndex) {
	      var result = lodash.indexOf || indexOf;
	      result = result === indexOf ? baseIndexOf : result;
	      return collection ? result(collection, target, fromIndex) : result;
	    }
	
	    /**
	     * Gets the "length" property value of `object`.
	     *
	     * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	     * that affects Safari on at least iOS 8.1-8.3 ARM64.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {*} Returns the "length" value.
	     */
	    var getLength = baseProperty('length');
	
	    /**
	     * Gets the propery names, values, and compare flags of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the match data of `object`.
	     */
	    function getMatchData(object) {
	      var result = pairs(object),
	          length = result.length;
	
	      while (length--) {
	        result[length][2] = isStrictComparable(result[length][1]);
	      }
	      return result;
	    }
	
	    /**
	     * Gets the native function at `key` of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {string} key The key of the method to get.
	     * @returns {*} Returns the function if it's native, else `undefined`.
	     */
	    function getNative(object, key) {
	      var value = object == null ? undefined : object[key];
	      return isNative(value) ? value : undefined;
	    }
	
	    /**
	     * Gets the view, applying any `transforms` to the `start` and `end` positions.
	     *
	     * @private
	     * @param {number} start The start of the view.
	     * @param {number} end The end of the view.
	     * @param {Array} transforms The transformations to apply to the view.
	     * @returns {Object} Returns an object containing the `start` and `end`
	     *  positions of the view.
	     */
	    function getView(start, end, transforms) {
	      var index = -1,
	          length = transforms.length;
	
	      while (++index < length) {
	        var data = transforms[index],
	            size = data.size;
	
	        switch (data.type) {
	          case 'drop':      start += size; break;
	          case 'dropRight': end -= size; break;
	          case 'take':      end = nativeMin(end, start + size); break;
	          case 'takeRight': start = nativeMax(start, end - size); break;
	        }
	      }
	      return { 'start': start, 'end': end };
	    }
	
	    /**
	     * Initializes an array clone.
	     *
	     * @private
	     * @param {Array} array The array to clone.
	     * @returns {Array} Returns the initialized clone.
	     */
	    function initCloneArray(array) {
	      var length = array.length,
	          result = new array.constructor(length);
	
	      // Add array properties assigned by `RegExp#exec`.
	      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	        result.index = array.index;
	        result.input = array.input;
	      }
	      return result;
	    }
	
	    /**
	     * Initializes an object clone.
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneObject(object) {
	      var Ctor = object.constructor;
	      if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	        Ctor = Object;
	      }
	      return new Ctor;
	    }
	
	    /**
	     * Initializes an object clone based on its `toStringTag`.
	     *
	     * **Note:** This function only supports cloning values with tags of
	     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	     *
	     * @private
	     * @param {Object} object The object to clone.
	     * @param {string} tag The `toStringTag` of the object to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @returns {Object} Returns the initialized clone.
	     */
	    function initCloneByTag(object, tag, isDeep) {
	      var Ctor = object.constructor;
	      switch (tag) {
	        case arrayBufferTag:
	          return bufferClone(object);
	
	        case boolTag:
	        case dateTag:
	          return new Ctor(+object);
	
	        case float32Tag: case float64Tag:
	        case int8Tag: case int16Tag: case int32Tag:
	        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	          var buffer = object.buffer;
	          return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
	
	        case numberTag:
	        case stringTag:
	          return new Ctor(object);
	
	        case regexpTag:
	          var result = new Ctor(object.source, reFlags.exec(object));
	          result.lastIndex = object.lastIndex;
	      }
	      return result;
	    }
	
	    /**
	     * Invokes the method at `path` on `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the method to invoke.
	     * @param {Array} args The arguments to invoke the method with.
	     * @returns {*} Returns the result of the invoked method.
	     */
	    function invokePath(object, path, args) {
	      if (object != null && !isKey(path, object)) {
	        path = toPath(path);
	        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	        path = last(path);
	      }
	      var func = object == null ? object : object[path];
	      return func == null ? undefined : func.apply(object, args);
	    }
	
	    /**
	     * Checks if `value` is array-like.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	     */
	    function isArrayLike(value) {
	      return value != null && isLength(getLength(value));
	    }
	
	    /**
	     * Checks if `value` is a valid array-like index.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	     */
	    function isIndex(value, length) {
	      value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	      length = length == null ? MAX_SAFE_INTEGER : length;
	      return value > -1 && value % 1 == 0 && value < length;
	    }
	
	    /**
	     * Checks if the provided arguments are from an iteratee call.
	     *
	     * @private
	     * @param {*} value The potential iteratee value argument.
	     * @param {*} index The potential iteratee index or key argument.
	     * @param {*} object The potential iteratee object argument.
	     * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	     */
	    function isIterateeCall(value, index, object) {
	      if (!isObject(object)) {
	        return false;
	      }
	      var type = typeof index;
	      if (type == 'number'
	          ? (isArrayLike(object) && isIndex(index, object.length))
	          : (type == 'string' && index in object)) {
	        var other = object[index];
	        return value === value ? (value === other) : (other !== other);
	      }
	      return false;
	    }
	
	    /**
	     * Checks if `value` is a property name and not a property path.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @param {Object} [object] The object to query keys on.
	     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	     */
	    function isKey(value, object) {
	      var type = typeof value;
	      if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
	        return true;
	      }
	      if (isArray(value)) {
	        return false;
	      }
	      var result = !reIsDeepProp.test(value);
	      return result || (object != null && value in toObject(object));
	    }
	
	    /**
	     * Checks if `func` has a lazy counterpart.
	     *
	     * @private
	     * @param {Function} func The function to check.
	     * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
	     */
	    function isLaziable(func) {
	      var funcName = getFuncName(func);
	      if (!(funcName in LazyWrapper.prototype)) {
	        return false;
	      }
	      var other = lodash[funcName];
	      if (func === other) {
	        return true;
	      }
	      var data = getData(other);
	      return !!data && func === data[0];
	    }
	
	    /**
	     * Checks if `value` is a valid array-like length.
	     *
	     * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	     */
	    function isLength(value) {
	      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	    }
	
	    /**
	     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	     *
	     * @private
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` if suitable for strict
	     *  equality comparisons, else `false`.
	     */
	    function isStrictComparable(value) {
	      return value === value && !isObject(value);
	    }
	
	    /**
	     * Merges the function metadata of `source` into `data`.
	     *
	     * Merging metadata reduces the number of wrappers required to invoke a function.
	     * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
	     * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
	     * augment function arguments, making the order in which they are executed important,
	     * preventing the merging of metadata. However, we make an exception for a safe
	     * common case where curried functions have `_.ary` and or `_.rearg` applied.
	     *
	     * @private
	     * @param {Array} data The destination metadata.
	     * @param {Array} source The source metadata.
	     * @returns {Array} Returns `data`.
	     */
	    function mergeData(data, source) {
	      var bitmask = data[1],
	          srcBitmask = source[1],
	          newBitmask = bitmask | srcBitmask,
	          isCommon = newBitmask < ARY_FLAG;
	
	      var isCombo =
	        (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||
	        (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||
	        (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);
	
	      // Exit early if metadata can't be merged.
	      if (!(isCommon || isCombo)) {
	        return data;
	      }
	      // Use source `thisArg` if available.
	      if (srcBitmask & BIND_FLAG) {
	        data[2] = source[2];
	        // Set when currying a bound function.
	        newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
	      }
	      // Compose partial arguments.
	      var value = source[3];
	      if (value) {
	        var partials = data[3];
	        data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
	        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
	      }
	      // Compose partial right arguments.
	      value = source[5];
	      if (value) {
	        partials = data[5];
	        data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
	        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
	      }
	      // Use source `argPos` if available.
	      value = source[7];
	      if (value) {
	        data[7] = arrayCopy(value);
	      }
	      // Use source `ary` if it's smaller.
	      if (srcBitmask & ARY_FLAG) {
	        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
	      }
	      // Use source `arity` if one is not provided.
	      if (data[9] == null) {
	        data[9] = source[9];
	      }
	      // Use source `func` and merge bitmasks.
	      data[0] = source[0];
	      data[1] = newBitmask;
	
	      return data;
	    }
	
	    /**
	     * Used by `_.defaultsDeep` to customize its `_.merge` use.
	     *
	     * @private
	     * @param {*} objectValue The destination object property value.
	     * @param {*} sourceValue The source object property value.
	     * @returns {*} Returns the value to assign to the destination object.
	     */
	    function mergeDefaults(objectValue, sourceValue) {
	      return objectValue === undefined ? sourceValue : merge(objectValue, sourceValue, mergeDefaults);
	    }
	
	    /**
	     * A specialized version of `_.pick` which picks `object` properties specified
	     * by `props`.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {string[]} props The property names to pick.
	     * @returns {Object} Returns the new object.
	     */
	    function pickByArray(object, props) {
	      object = toObject(object);
	
	      var index = -1,
	          length = props.length,
	          result = {};
	
	      while (++index < length) {
	        var key = props[index];
	        if (key in object) {
	          result[key] = object[key];
	        }
	      }
	      return result;
	    }
	
	    /**
	     * A specialized version of `_.pick` which picks `object` properties `predicate`
	     * returns truthy for.
	     *
	     * @private
	     * @param {Object} object The source object.
	     * @param {Function} predicate The function invoked per iteration.
	     * @returns {Object} Returns the new object.
	     */
	    function pickByCallback(object, predicate) {
	      var result = {};
	      baseForIn(object, function(value, key, object) {
	        if (predicate(value, key, object)) {
	          result[key] = value;
	        }
	      });
	      return result;
	    }
	
	    /**
	     * Reorder `array` according to the specified indexes where the element at
	     * the first index is assigned as the first element, the element at
	     * the second index is assigned as the second element, and so on.
	     *
	     * @private
	     * @param {Array} array The array to reorder.
	     * @param {Array} indexes The arranged array indexes.
	     * @returns {Array} Returns `array`.
	     */
	    function reorder(array, indexes) {
	      var arrLength = array.length,
	          length = nativeMin(indexes.length, arrLength),
	          oldArray = arrayCopy(array);
	
	      while (length--) {
	        var index = indexes[length];
	        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
	      }
	      return array;
	    }
	
	    /**
	     * Sets metadata for `func`.
	     *
	     * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
	     * period of time, it will trip its breaker and transition to an identity function
	     * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
	     * for more details.
	     *
	     * @private
	     * @param {Function} func The function to associate metadata with.
	     * @param {*} data The metadata.
	     * @returns {Function} Returns `func`.
	     */
	    var setData = (function() {
	      var count = 0,
	          lastCalled = 0;
	
	      return function(key, value) {
	        var stamp = now(),
	            remaining = HOT_SPAN - (stamp - lastCalled);
	
	        lastCalled = stamp;
	        if (remaining > 0) {
	          if (++count >= HOT_COUNT) {
	            return key;
	          }
	        } else {
	          count = 0;
	        }
	        return baseSetData(key, value);
	      };
	    }());
	
	    /**
	     * A fallback implementation of `Object.keys` which creates an array of the
	     * own enumerable property names of `object`.
	     *
	     * @private
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     */
	    function shimKeys(object) {
	      var props = keysIn(object),
	          propsLength = props.length,
	          length = propsLength && object.length;
	
	      var allowIndexes = !!length && isLength(length) &&
	        (isArray(object) || isArguments(object));
	
	      var index = -1,
	          result = [];
	
	      while (++index < propsLength) {
	        var key = props[index];
	        if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	          result.push(key);
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Converts `value` to an array-like object if it's not one.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {Array|Object} Returns the array-like object.
	     */
	    function toIterable(value) {
	      if (value == null) {
	        return [];
	      }
	      if (!isArrayLike(value)) {
	        return values(value);
	      }
	      return isObject(value) ? value : Object(value);
	    }
	
	    /**
	     * Converts `value` to an object if it's not one.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {Object} Returns the object.
	     */
	    function toObject(value) {
	      return isObject(value) ? value : Object(value);
	    }
	
	    /**
	     * Converts `value` to property path array if it's not one.
	     *
	     * @private
	     * @param {*} value The value to process.
	     * @returns {Array} Returns the property path array.
	     */
	    function toPath(value) {
	      if (isArray(value)) {
	        return value;
	      }
	      var result = [];
	      baseToString(value).replace(rePropName, function(match, number, quote, string) {
	        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	      });
	      return result;
	    }
	
	    /**
	     * Creates a clone of `wrapper`.
	     *
	     * @private
	     * @param {Object} wrapper The wrapper to clone.
	     * @returns {Object} Returns the cloned wrapper.
	     */
	    function wrapperClone(wrapper) {
	      return wrapper instanceof LazyWrapper
	        ? wrapper.clone()
	        : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates an array of elements split into groups the length of `size`.
	     * If `collection` can't be split evenly, the final chunk will be the remaining
	     * elements.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to process.
	     * @param {number} [size=1] The length of each chunk.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the new array containing chunks.
	     * @example
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 2);
	     * // => [['a', 'b'], ['c', 'd']]
	     *
	     * _.chunk(['a', 'b', 'c', 'd'], 3);
	     * // => [['a', 'b', 'c'], ['d']]
	     */
	    function chunk(array, size, guard) {
	      if (guard ? isIterateeCall(array, size, guard) : size == null) {
	        size = 1;
	      } else {
	        size = nativeMax(nativeFloor(size) || 1, 1);
	      }
	      var index = 0,
	          length = array ? array.length : 0,
	          resIndex = -1,
	          result = Array(nativeCeil(length / size));
	
	      while (index < length) {
	        result[++resIndex] = baseSlice(array, index, (index += size));
	      }
	      return result;
	    }
	
	    /**
	     * Creates an array with all falsey values removed. The values `false`, `null`,
	     * `0`, `""`, `undefined`, and `NaN` are falsey.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to compact.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.compact([0, 1, false, 2, '', 3]);
	     * // => [1, 2, 3]
	     */
	    function compact(array) {
	      var index = -1,
	          length = array ? array.length : 0,
	          resIndex = -1,
	          result = [];
	
	      while (++index < length) {
	        var value = array[index];
	        if (value) {
	          result[++resIndex] = value;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Creates an array of unique `array` values not included in the other
	     * provided arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {...Array} [values] The arrays of values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.difference([1, 2, 3], [4, 2]);
	     * // => [1, 3]
	     */
	    var difference = restParam(function(array, values) {
	      return (isObjectLike(array) && isArrayLike(array))
	        ? baseDifference(array, baseFlatten(values, false, true))
	        : [];
	    });
	
	    /**
	     * Creates a slice of `array` with `n` elements dropped from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.drop([1, 2, 3]);
	     * // => [2, 3]
	     *
	     * _.drop([1, 2, 3], 2);
	     * // => [3]
	     *
	     * _.drop([1, 2, 3], 5);
	     * // => []
	     *
	     * _.drop([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function drop(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      return baseSlice(array, n < 0 ? 0 : n);
	    }
	
	    /**
	     * Creates a slice of `array` with `n` elements dropped from the end.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to drop.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropRight([1, 2, 3]);
	     * // => [1, 2]
	     *
	     * _.dropRight([1, 2, 3], 2);
	     * // => [1]
	     *
	     * _.dropRight([1, 2, 3], 5);
	     * // => []
	     *
	     * _.dropRight([1, 2, 3], 0);
	     * // => [1, 2, 3]
	     */
	    function dropRight(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      n = length - (+n || 0);
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }
	
	    /**
	     * Creates a slice of `array` excluding elements dropped from the end.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * bound to `thisArg` and invoked with three arguments: (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that match the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropRightWhile([1, 2, 3], function(n) {
	     *   return n > 1;
	     * });
	     * // => [1]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.dropRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
	     * // => ['barney', 'fred']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.dropRightWhile(users, 'active', false), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.dropRightWhile(users, 'active'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function dropRightWhile(array, predicate, thisArg) {
	      return (array && array.length)
	        ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true)
	        : [];
	    }
	
	    /**
	     * Creates a slice of `array` excluding elements dropped from the beginning.
	     * Elements are dropped until `predicate` returns falsey. The predicate is
	     * bound to `thisArg` and invoked with three arguments: (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.dropWhile([1, 2, 3], function(n) {
	     *   return n < 3;
	     * });
	     * // => [3]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');
	     * // => ['fred', 'pebbles']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.dropWhile(users, 'active', false), 'user');
	     * // => ['pebbles']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.dropWhile(users, 'active'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function dropWhile(array, predicate, thisArg) {
	      return (array && array.length)
	        ? baseWhile(array, getCallback(predicate, thisArg, 3), true)
	        : [];
	    }
	
	    /**
	     * Fills elements of `array` with `value` from `start` up to, but not
	     * including, `end`.
	     *
	     * **Note:** This method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to fill.
	     * @param {*} value The value to fill `array` with.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _.fill(array, 'a');
	     * console.log(array);
	     * // => ['a', 'a', 'a']
	     *
	     * _.fill(Array(3), 2);
	     * // => [2, 2, 2]
	     *
	     * _.fill([4, 6, 8], '*', 1, 2);
	     * // => [4, '*', 8]
	     */
	    function fill(array, value, start, end) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
	        start = 0;
	        end = length;
	      }
	      return baseFill(array, value, start, end);
	    }
	
	    /**
	     * This method is like `_.find` except that it returns the index of the first
	     * element `predicate` returns truthy for instead of the element itself.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * _.findIndex(users, function(chr) {
	     *   return chr.user == 'barney';
	     * });
	     * // => 0
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findIndex(users, { 'user': 'fred', 'active': false });
	     * // => 1
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findIndex(users, 'active', false);
	     * // => 0
	     *
	     * // using the `_.property` callback shorthand
	     * _.findIndex(users, 'active');
	     * // => 2
	     */
	    var findIndex = createFindIndex();
	
	    /**
	     * This method is like `_.findIndex` except that it iterates over elements
	     * of `collection` from right to left.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {number} Returns the index of the found element, else `-1`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * _.findLastIndex(users, function(chr) {
	     *   return chr.user == 'pebbles';
	     * });
	     * // => 2
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findLastIndex(users, { 'user': 'barney', 'active': true });
	     * // => 0
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findLastIndex(users, 'active', false);
	     * // => 2
	     *
	     * // using the `_.property` callback shorthand
	     * _.findLastIndex(users, 'active');
	     * // => 0
	     */
	    var findLastIndex = createFindIndex(true);
	
	    /**
	     * Gets the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @alias head
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the first element of `array`.
	     * @example
	     *
	     * _.first([1, 2, 3]);
	     * // => 1
	     *
	     * _.first([]);
	     * // => undefined
	     */
	    function first(array) {
	      return array ? array[0] : undefined;
	    }
	
	    /**
	     * Flattens a nested array. If `isDeep` is `true` the array is recursively
	     * flattened, otherwise it is only flattened a single level.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to flatten.
	     * @param {boolean} [isDeep] Specify a deep flatten.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flatten([1, [2, 3, [4]]]);
	     * // => [1, 2, 3, [4]]
	     *
	     * // using `isDeep`
	     * _.flatten([1, [2, 3, [4]]], true);
	     * // => [1, 2, 3, 4]
	     */
	    function flatten(array, isDeep, guard) {
	      var length = array ? array.length : 0;
	      if (guard && isIterateeCall(array, isDeep, guard)) {
	        isDeep = false;
	      }
	      return length ? baseFlatten(array, isDeep) : [];
	    }
	
	    /**
	     * Recursively flattens a nested array.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to recursively flatten.
	     * @returns {Array} Returns the new flattened array.
	     * @example
	     *
	     * _.flattenDeep([1, [2, 3, [4]]]);
	     * // => [1, 2, 3, 4]
	     */
	    function flattenDeep(array) {
	      var length = array ? array.length : 0;
	      return length ? baseFlatten(array, true) : [];
	    }
	
	    /**
	     * Gets the index at which the first occurrence of `value` is found in `array`
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons. If `fromIndex` is negative, it is used as the offset
	     * from the end of `array`. If `array` is sorted providing `true` for `fromIndex`
	     * performs a faster binary search.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
	     *  to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.indexOf([1, 2, 1, 2], 2);
	     * // => 1
	     *
	     * // using `fromIndex`
	     * _.indexOf([1, 2, 1, 2], 2, 2);
	     * // => 3
	     *
	     * // performing a binary search
	     * _.indexOf([1, 1, 2, 2], 2, true);
	     * // => 2
	     */
	    function indexOf(array, value, fromIndex) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return -1;
	      }
	      if (typeof fromIndex == 'number') {
	        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
	      } else if (fromIndex) {
	        var index = binaryIndex(array, value);
	        if (index < length &&
	            (value === value ? (value === array[index]) : (array[index] !== array[index]))) {
	          return index;
	        }
	        return -1;
	      }
	      return baseIndexOf(array, value, fromIndex || 0);
	    }
	
	    /**
	     * Gets all but the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.initial([1, 2, 3]);
	     * // => [1, 2]
	     */
	    function initial(array) {
	      return dropRight(array, 1);
	    }
	
	    /**
	     * Creates an array of unique values that are included in all of the provided
	     * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of shared values.
	     * @example
	     * _.intersection([1, 2], [4, 2], [2, 1]);
	     * // => [2]
	     */
	    var intersection = restParam(function(arrays) {
	      var othLength = arrays.length,
	          othIndex = othLength,
	          caches = Array(length),
	          indexOf = getIndexOf(),
	          isCommon = indexOf == baseIndexOf,
	          result = [];
	
	      while (othIndex--) {
	        var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
	        caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
	      }
	      var array = arrays[0],
	          index = -1,
	          length = array ? array.length : 0,
	          seen = caches[0];
	
	      outer:
	      while (++index < length) {
	        value = array[index];
	        if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
	          var othIndex = othLength;
	          while (--othIndex) {
	            var cache = caches[othIndex];
	            if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
	              continue outer;
	            }
	          }
	          if (seen) {
	            seen.push(value);
	          }
	          result.push(value);
	        }
	      }
	      return result;
	    });
	
	    /**
	     * Gets the last element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {*} Returns the last element of `array`.
	     * @example
	     *
	     * _.last([1, 2, 3]);
	     * // => 3
	     */
	    function last(array) {
	      var length = array ? array.length : 0;
	      return length ? array[length - 1] : undefined;
	    }
	
	    /**
	     * This method is like `_.indexOf` except that it iterates over elements of
	     * `array` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to search.
	     * @param {*} value The value to search for.
	     * @param {boolean|number} [fromIndex=array.length-1] The index to search from
	     *  or `true` to perform a binary search on a sorted array.
	     * @returns {number} Returns the index of the matched value, else `-1`.
	     * @example
	     *
	     * _.lastIndexOf([1, 2, 1, 2], 2);
	     * // => 3
	     *
	     * // using `fromIndex`
	     * _.lastIndexOf([1, 2, 1, 2], 2, 2);
	     * // => 1
	     *
	     * // performing a binary search
	     * _.lastIndexOf([1, 1, 2, 2], 2, true);
	     * // => 3
	     */
	    function lastIndexOf(array, value, fromIndex) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return -1;
	      }
	      var index = length;
	      if (typeof fromIndex == 'number') {
	        index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
	      } else if (fromIndex) {
	        index = binaryIndex(array, value, true) - 1;
	        var other = array[index];
	        if (value === value ? (value === other) : (other !== other)) {
	          return index;
	        }
	        return -1;
	      }
	      if (value !== value) {
	        return indexOfNaN(array, index, true);
	      }
	      while (index--) {
	        if (array[index] === value) {
	          return index;
	        }
	      }
	      return -1;
	    }
	
	    /**
	     * Removes all provided values from `array` using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * **Note:** Unlike `_.without`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...*} [values] The values to remove.
	     * @returns {Array} Returns `array`.
	     * @example
	     *
	     * var array = [1, 2, 3, 1, 2, 3];
	     *
	     * _.pull(array, 2, 3);
	     * console.log(array);
	     * // => [1, 1]
	     */
	    function pull() {
	      var args = arguments,
	          array = args[0];
	
	      if (!(array && array.length)) {
	        return array;
	      }
	      var index = 0,
	          indexOf = getIndexOf(),
	          length = args.length;
	
	      while (++index < length) {
	        var fromIndex = 0,
	            value = args[index];
	
	        while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
	          splice.call(array, fromIndex, 1);
	        }
	      }
	      return array;
	    }
	
	    /**
	     * Removes elements from `array` corresponding to the given indexes and returns
	     * an array of the removed elements. Indexes may be specified as an array of
	     * indexes or as individual arguments.
	     *
	     * **Note:** Unlike `_.at`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {...(number|number[])} [indexes] The indexes of elements to remove,
	     *  specified as individual indexes or arrays of indexes.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = [5, 10, 15, 20];
	     * var evens = _.pullAt(array, 1, 3);
	     *
	     * console.log(array);
	     * // => [5, 15]
	     *
	     * console.log(evens);
	     * // => [10, 20]
	     */
	    var pullAt = restParam(function(array, indexes) {
	      indexes = baseFlatten(indexes);
	
	      var result = baseAt(array, indexes);
	      basePullAt(array, indexes.sort(baseCompareAscending));
	      return result;
	    });
	
	    /**
	     * Removes all elements from `array` that `predicate` returns truthy for
	     * and returns an array of the removed elements. The predicate is bound to
	     * `thisArg` and invoked with three arguments: (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * **Note:** Unlike `_.filter`, this method mutates `array`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to modify.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new array of removed elements.
	     * @example
	     *
	     * var array = [1, 2, 3, 4];
	     * var evens = _.remove(array, function(n) {
	     *   return n % 2 == 0;
	     * });
	     *
	     * console.log(array);
	     * // => [1, 3]
	     *
	     * console.log(evens);
	     * // => [2, 4]
	     */
	    function remove(array, predicate, thisArg) {
	      var result = [];
	      if (!(array && array.length)) {
	        return result;
	      }
	      var index = -1,
	          indexes = [],
	          length = array.length;
	
	      predicate = getCallback(predicate, thisArg, 3);
	      while (++index < length) {
	        var value = array[index];
	        if (predicate(value, index, array)) {
	          result.push(value);
	          indexes.push(index);
	        }
	      }
	      basePullAt(array, indexes);
	      return result;
	    }
	
	    /**
	     * Gets all but the first element of `array`.
	     *
	     * @static
	     * @memberOf _
	     * @alias tail
	     * @category Array
	     * @param {Array} array The array to query.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.rest([1, 2, 3]);
	     * // => [2, 3]
	     */
	    function rest(array) {
	      return drop(array, 1);
	    }
	
	    /**
	     * Creates a slice of `array` from `start` up to, but not including, `end`.
	     *
	     * **Note:** This method is used instead of `Array#slice` to support node
	     * lists in IE < 9 and to ensure dense arrays are returned.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to slice.
	     * @param {number} [start=0] The start position.
	     * @param {number} [end=array.length] The end position.
	     * @returns {Array} Returns the slice of `array`.
	     */
	    function slice(array, start, end) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
	        start = 0;
	        end = length;
	      }
	      return baseSlice(array, start, end);
	    }
	
	    /**
	     * Uses a binary search to determine the lowest index at which `value` should
	     * be inserted into `array` in order to maintain its sort order. If an iteratee
	     * function is provided it is invoked for `value` and each element of `array`
	     * to compute their sort ranking. The iteratee is bound to `thisArg` and
	     * invoked with one argument; (value).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedIndex([30, 50], 40);
	     * // => 1
	     *
	     * _.sortedIndex([4, 4, 5, 5], 5);
	     * // => 2
	     *
	     * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };
	     *
	     * // using an iteratee function
	     * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {
	     *   return this.data[word];
	     * }, dict);
	     * // => 1
	     *
	     * // using the `_.property` callback shorthand
	     * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
	     * // => 1
	     */
	    var sortedIndex = createSortedIndex();
	
	    /**
	     * This method is like `_.sortedIndex` except that it returns the highest
	     * index at which `value` should be inserted into `array` in order to
	     * maintain its sort order.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The sorted array to inspect.
	     * @param {*} value The value to evaluate.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {number} Returns the index at which `value` should be inserted
	     *  into `array`.
	     * @example
	     *
	     * _.sortedLastIndex([4, 4, 5, 5], 5);
	     * // => 4
	     */
	    var sortedLastIndex = createSortedIndex(true);
	
	    /**
	     * Creates a slice of `array` with `n` elements taken from the beginning.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.take([1, 2, 3]);
	     * // => [1]
	     *
	     * _.take([1, 2, 3], 2);
	     * // => [1, 2]
	     *
	     * _.take([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.take([1, 2, 3], 0);
	     * // => []
	     */
	    function take(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      return baseSlice(array, 0, n < 0 ? 0 : n);
	    }
	
	    /**
	     * Creates a slice of `array` with `n` elements taken from the end.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {number} [n=1] The number of elements to take.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeRight([1, 2, 3]);
	     * // => [3]
	     *
	     * _.takeRight([1, 2, 3], 2);
	     * // => [2, 3]
	     *
	     * _.takeRight([1, 2, 3], 5);
	     * // => [1, 2, 3]
	     *
	     * _.takeRight([1, 2, 3], 0);
	     * // => []
	     */
	    function takeRight(array, n, guard) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (guard ? isIterateeCall(array, n, guard) : n == null) {
	        n = 1;
	      }
	      n = length - (+n || 0);
	      return baseSlice(array, n < 0 ? 0 : n);
	    }
	
	    /**
	     * Creates a slice of `array` with elements taken from the end. Elements are
	     * taken until `predicate` returns falsey. The predicate is bound to `thisArg`
	     * and invoked with three arguments: (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeRightWhile([1, 2, 3], function(n) {
	     *   return n > 1;
	     * });
	     * // => [2, 3]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': true },
	     *   { 'user': 'fred',    'active': false },
	     *   { 'user': 'pebbles', 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
	     * // => ['pebbles']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.takeRightWhile(users, 'active', false), 'user');
	     * // => ['fred', 'pebbles']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.takeRightWhile(users, 'active'), 'user');
	     * // => []
	     */
	    function takeRightWhile(array, predicate, thisArg) {
	      return (array && array.length)
	        ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true)
	        : [];
	    }
	
	    /**
	     * Creates a slice of `array` with elements taken from the beginning. Elements
	     * are taken until `predicate` returns falsey. The predicate is bound to
	     * `thisArg` and invoked with three arguments: (value, index, array).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to query.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the slice of `array`.
	     * @example
	     *
	     * _.takeWhile([1, 2, 3], function(n) {
	     *   return n < 3;
	     * });
	     * // => [1, 2]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'active': false },
	     *   { 'user': 'fred',    'active': false},
	     *   { 'user': 'pebbles', 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.takeWhile(users, 'active', false), 'user');
	     * // => ['barney', 'fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.takeWhile(users, 'active'), 'user');
	     * // => []
	     */
	    function takeWhile(array, predicate, thisArg) {
	      return (array && array.length)
	        ? baseWhile(array, getCallback(predicate, thisArg, 3))
	        : [];
	    }
	
	    /**
	     * Creates an array of unique values, in order, from all of the provided arrays
	     * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of combined values.
	     * @example
	     *
	     * _.union([1, 2], [4, 2], [2, 1]);
	     * // => [1, 2, 4]
	     */
	    var union = restParam(function(arrays) {
	      return baseUniq(baseFlatten(arrays, false, true));
	    });
	
	    /**
	     * Creates a duplicate-free version of an array, using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons, in which only the first occurence of each element
	     * is kept. Providing `true` for `isSorted` performs a faster search algorithm
	     * for sorted arrays. If an iteratee function is provided it is invoked for
	     * each element in the array to generate the criterion by which uniqueness
	     * is computed. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments: (value, index, array).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias unique
	     * @category Array
	     * @param {Array} array The array to inspect.
	     * @param {boolean} [isSorted] Specify the array is sorted.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new duplicate-value-free array.
	     * @example
	     *
	     * _.uniq([2, 1, 2]);
	     * // => [2, 1]
	     *
	     * // using `isSorted`
	     * _.uniq([1, 1, 2], true);
	     * // => [1, 2]
	     *
	     * // using an iteratee function
	     * _.uniq([1, 2.5, 1.5, 2], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => [1, 2.5]
	     *
	     * // using the `_.property` callback shorthand
	     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
	     * // => [{ 'x': 1 }, { 'x': 2 }]
	     */
	    function uniq(array, isSorted, iteratee, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      if (isSorted != null && typeof isSorted != 'boolean') {
	        thisArg = iteratee;
	        iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
	        isSorted = false;
	      }
	      var callback = getCallback();
	      if (!(iteratee == null && callback === baseCallback)) {
	        iteratee = callback(iteratee, thisArg, 3);
	      }
	      return (isSorted && getIndexOf() == baseIndexOf)
	        ? sortedUniq(array, iteratee)
	        : baseUniq(array, iteratee);
	    }
	
	    /**
	     * This method is like `_.zip` except that it accepts an array of grouped
	     * elements and creates an array regrouping the elements to their pre-zip
	     * configuration.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array of grouped elements to process.
	     * @returns {Array} Returns the new array of regrouped elements.
	     * @example
	     *
	     * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     *
	     * _.unzip(zipped);
	     * // => [['fred', 'barney'], [30, 40], [true, false]]
	     */
	    function unzip(array) {
	      if (!(array && array.length)) {
	        return [];
	      }
	      var index = -1,
	          length = 0;
	
	      array = arrayFilter(array, function(group) {
	        if (isArrayLike(group)) {
	          length = nativeMax(group.length, length);
	          return true;
	        }
	      });
	      var result = Array(length);
	      while (++index < length) {
	        result[index] = arrayMap(array, baseProperty(index));
	      }
	      return result;
	    }
	
	    /**
	     * This method is like `_.unzip` except that it accepts an iteratee to specify
	     * how regrouped values should be combined. The `iteratee` is bound to `thisArg`
	     * and invoked with four arguments: (accumulator, value, index, group).
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array of grouped elements to process.
	     * @param {Function} [iteratee] The function to combine regrouped values.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new array of regrouped elements.
	     * @example
	     *
	     * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
	     * // => [[1, 10, 100], [2, 20, 200]]
	     *
	     * _.unzipWith(zipped, _.add);
	     * // => [3, 30, 300]
	     */
	    function unzipWith(array, iteratee, thisArg) {
	      var length = array ? array.length : 0;
	      if (!length) {
	        return [];
	      }
	      var result = unzip(array);
	      if (iteratee == null) {
	        return result;
	      }
	      iteratee = bindCallback(iteratee, thisArg, 4);
	      return arrayMap(result, function(group) {
	        return arrayReduce(group, iteratee, undefined, true);
	      });
	    }
	
	    /**
	     * Creates an array excluding all provided values using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {Array} array The array to filter.
	     * @param {...*} [values] The values to exclude.
	     * @returns {Array} Returns the new array of filtered values.
	     * @example
	     *
	     * _.without([1, 2, 1, 3], 1, 2);
	     * // => [3]
	     */
	    var without = restParam(function(array, values) {
	      return isArrayLike(array)
	        ? baseDifference(array, values)
	        : [];
	    });
	
	    /**
	     * Creates an array of unique values that is the [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
	     * of the provided arrays.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to inspect.
	     * @returns {Array} Returns the new array of values.
	     * @example
	     *
	     * _.xor([1, 2], [4, 2]);
	     * // => [1, 4]
	     */
	    function xor() {
	      var index = -1,
	          length = arguments.length;
	
	      while (++index < length) {
	        var array = arguments[index];
	        if (isArrayLike(array)) {
	          var result = result
	            ? arrayPush(baseDifference(result, array), baseDifference(array, result))
	            : array;
	        }
	      }
	      return result ? baseUniq(result) : [];
	    }
	
	    /**
	     * Creates an array of grouped elements, the first of which contains the first
	     * elements of the given arrays, the second of which contains the second elements
	     * of the given arrays, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to process.
	     * @returns {Array} Returns the new array of grouped elements.
	     * @example
	     *
	     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
	     * // => [['fred', 30, true], ['barney', 40, false]]
	     */
	    var zip = restParam(unzip);
	
	    /**
	     * The inverse of `_.pairs`; this method returns an object composed from arrays
	     * of property names and values. Provide either a single two dimensional array,
	     * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
	     * and one of corresponding values.
	     *
	     * @static
	     * @memberOf _
	     * @alias object
	     * @category Array
	     * @param {Array} props The property names.
	     * @param {Array} [values=[]] The property values.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * _.zipObject([['fred', 30], ['barney', 40]]);
	     * // => { 'fred': 30, 'barney': 40 }
	     *
	     * _.zipObject(['fred', 'barney'], [30, 40]);
	     * // => { 'fred': 30, 'barney': 40 }
	     */
	    function zipObject(props, values) {
	      var index = -1,
	          length = props ? props.length : 0,
	          result = {};
	
	      if (length && !values && !isArray(props[0])) {
	        values = [];
	      }
	      while (++index < length) {
	        var key = props[index];
	        if (values) {
	          result[key] = values[index];
	        } else if (key) {
	          result[key[0]] = key[1];
	        }
	      }
	      return result;
	    }
	
	    /**
	     * This method is like `_.zip` except that it accepts an iteratee to specify
	     * how grouped values should be combined. The `iteratee` is bound to `thisArg`
	     * and invoked with four arguments: (accumulator, value, index, group).
	     *
	     * @static
	     * @memberOf _
	     * @category Array
	     * @param {...Array} [arrays] The arrays to process.
	     * @param {Function} [iteratee] The function to combine grouped values.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new array of grouped elements.
	     * @example
	     *
	     * _.zipWith([1, 2], [10, 20], [100, 200], _.add);
	     * // => [111, 222]
	     */
	    var zipWith = restParam(function(arrays) {
	      var length = arrays.length,
	          iteratee = length > 2 ? arrays[length - 2] : undefined,
	          thisArg = length > 1 ? arrays[length - 1] : undefined;
	
	      if (length > 2 && typeof iteratee == 'function') {
	        length -= 2;
	      } else {
	        iteratee = (length > 1 && typeof thisArg == 'function') ? (--length, thisArg) : undefined;
	        thisArg = undefined;
	      }
	      arrays.length = length;
	      return unzipWith(arrays, iteratee, thisArg);
	    });
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a `lodash` object that wraps `value` with explicit method
	     * chaining enabled.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to wrap.
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36 },
	     *   { 'user': 'fred',    'age': 40 },
	     *   { 'user': 'pebbles', 'age': 1 }
	     * ];
	     *
	     * var youngest = _.chain(users)
	     *   .sortBy('age')
	     *   .map(function(chr) {
	     *     return chr.user + ' is ' + chr.age;
	     *   })
	     *   .first()
	     *   .value();
	     * // => 'pebbles is 1'
	     */
	    function chain(value) {
	      var result = lodash(value);
	      result.__chain__ = true;
	      return result;
	    }
	
	    /**
	     * This method invokes `interceptor` and returns `value`. The interceptor is
	     * bound to `thisArg` and invoked with one argument; (value). The purpose of
	     * this method is to "tap into" a method chain in order to perform operations
	     * on intermediate results within the chain.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @param {*} [thisArg] The `this` binding of `interceptor`.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * _([1, 2, 3])
	     *  .tap(function(array) {
	     *    array.pop();
	     *  })
	     *  .reverse()
	     *  .value();
	     * // => [2, 1]
	     */
	    function tap(value, interceptor, thisArg) {
	      interceptor.call(thisArg, value);
	      return value;
	    }
	
	    /**
	     * This method is like `_.tap` except that it returns the result of `interceptor`.
	     *
	     * @static
	     * @memberOf _
	     * @category Chain
	     * @param {*} value The value to provide to `interceptor`.
	     * @param {Function} interceptor The function to invoke.
	     * @param {*} [thisArg] The `this` binding of `interceptor`.
	     * @returns {*} Returns the result of `interceptor`.
	     * @example
	     *
	     * _('  abc  ')
	     *  .chain()
	     *  .trim()
	     *  .thru(function(value) {
	     *    return [value];
	     *  })
	     *  .value();
	     * // => ['abc']
	     */
	    function thru(value, interceptor, thisArg) {
	      return interceptor.call(thisArg, value);
	    }
	
	    /**
	     * Enables explicit method chaining on the wrapper object.
	     *
	     * @name chain
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * // without explicit chaining
	     * _(users).first();
	     * // => { 'user': 'barney', 'age': 36 }
	     *
	     * // with explicit chaining
	     * _(users).chain()
	     *   .first()
	     *   .pick('user')
	     *   .value();
	     * // => { 'user': 'barney' }
	     */
	    function wrapperChain() {
	      return chain(this);
	    }
	
	    /**
	     * Executes the chained sequence and returns the wrapped result.
	     *
	     * @name commit
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2];
	     * var wrapped = _(array).push(3);
	     *
	     * console.log(array);
	     * // => [1, 2]
	     *
	     * wrapped = wrapped.commit();
	     * console.log(array);
	     * // => [1, 2, 3]
	     *
	     * wrapped.last();
	     * // => 3
	     *
	     * console.log(array);
	     * // => [1, 2, 3]
	     */
	    function wrapperCommit() {
	      return new LodashWrapper(this.value(), this.__chain__);
	    }
	
	    /**
	     * Creates a new array joining a wrapped array with any additional arrays
	     * and/or values.
	     *
	     * @name concat
	     * @memberOf _
	     * @category Chain
	     * @param {...*} [values] The values to concatenate.
	     * @returns {Array} Returns the new concatenated array.
	     * @example
	     *
	     * var array = [1];
	     * var wrapped = _(array).concat(2, [3], [[4]]);
	     *
	     * console.log(wrapped.value());
	     * // => [1, 2, 3, [4]]
	     *
	     * console.log(array);
	     * // => [1]
	     */
	    var wrapperConcat = restParam(function(values) {
	      values = baseFlatten(values);
	      return this.thru(function(array) {
	        return arrayConcat(isArray(array) ? array : [toObject(array)], values);
	      });
	    });
	
	    /**
	     * Creates a clone of the chained sequence planting `value` as the wrapped value.
	     *
	     * @name plant
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2];
	     * var wrapped = _(array).map(function(value) {
	     *   return Math.pow(value, 2);
	     * });
	     *
	     * var other = [3, 4];
	     * var otherWrapped = wrapped.plant(other);
	     *
	     * otherWrapped.value();
	     * // => [9, 16]
	     *
	     * wrapped.value();
	     * // => [1, 4]
	     */
	    function wrapperPlant(value) {
	      var result,
	          parent = this;
	
	      while (parent instanceof baseLodash) {
	        var clone = wrapperClone(parent);
	        if (result) {
	          previous.__wrapped__ = clone;
	        } else {
	          result = clone;
	        }
	        var previous = clone;
	        parent = parent.__wrapped__;
	      }
	      previous.__wrapped__ = value;
	      return result;
	    }
	
	    /**
	     * Reverses the wrapped array so the first element becomes the last, the
	     * second element becomes the second to last, and so on.
	     *
	     * **Note:** This method mutates the wrapped array.
	     *
	     * @name reverse
	     * @memberOf _
	     * @category Chain
	     * @returns {Object} Returns the new reversed `lodash` wrapper instance.
	     * @example
	     *
	     * var array = [1, 2, 3];
	     *
	     * _(array).reverse().value()
	     * // => [3, 2, 1]
	     *
	     * console.log(array);
	     * // => [3, 2, 1]
	     */
	    function wrapperReverse() {
	      var value = this.__wrapped__;
	
	      var interceptor = function(value) {
	        return (wrapped && wrapped.__dir__ < 0) ? value : value.reverse();
	      };
	      if (value instanceof LazyWrapper) {
	        var wrapped = value;
	        if (this.__actions__.length) {
	          wrapped = new LazyWrapper(this);
	        }
	        wrapped = wrapped.reverse();
	        wrapped.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
	        return new LodashWrapper(wrapped, this.__chain__);
	      }
	      return this.thru(interceptor);
	    }
	
	    /**
	     * Produces the result of coercing the unwrapped value to a string.
	     *
	     * @name toString
	     * @memberOf _
	     * @category Chain
	     * @returns {string} Returns the coerced string value.
	     * @example
	     *
	     * _([1, 2, 3]).toString();
	     * // => '1,2,3'
	     */
	    function wrapperToString() {
	      return (this.value() + '');
	    }
	
	    /**
	     * Executes the chained sequence to extract the unwrapped value.
	     *
	     * @name value
	     * @memberOf _
	     * @alias run, toJSON, valueOf
	     * @category Chain
	     * @returns {*} Returns the resolved unwrapped value.
	     * @example
	     *
	     * _([1, 2, 3]).value();
	     * // => [1, 2, 3]
	     */
	    function wrapperValue() {
	      return baseWrapperValue(this.__wrapped__, this.__actions__);
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates an array of elements corresponding to the given keys, or indexes,
	     * of `collection`. Keys may be specified as individual arguments or as arrays
	     * of keys.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(number|number[]|string|string[])} [props] The property names
	     *  or indexes of elements to pick, specified individually or in arrays.
	     * @returns {Array} Returns the new array of picked elements.
	     * @example
	     *
	     * _.at(['a', 'b', 'c'], [0, 2]);
	     * // => ['a', 'c']
	     *
	     * _.at(['barney', 'fred', 'pebbles'], 0, 2);
	     * // => ['barney', 'pebbles']
	     */
	    var at = restParam(function(collection, props) {
	      return baseAt(collection, baseFlatten(props));
	    });
	
	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is the number of times the key was returned by `iteratee`.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(n) {
	     *   return Math.floor(n);
	     * });
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy([4.3, 6.1, 6.4], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => { '4': 1, '6': 2 }
	     *
	     * _.countBy(['one', 'two', 'three'], 'length');
	     * // => { '3': 2, '5': 1 }
	     */
	    var countBy = createAggregator(function(result, value, key) {
	      hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);
	    });
	
	    /**
	     * Checks if `predicate` returns truthy for **all** elements of `collection`.
	     * The predicate is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias all
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {boolean} Returns `true` if all elements pass the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.every([true, 1, null, 'yes'], Boolean);
	     * // => false
	     *
	     * var users = [
	     *   { 'user': 'barney', 'active': false },
	     *   { 'user': 'fred',   'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.every(users, { 'user': 'barney', 'active': false });
	     * // => false
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.every(users, 'active', false);
	     * // => true
	     *
	     * // using the `_.property` callback shorthand
	     * _.every(users, 'active');
	     * // => false
	     */
	    function every(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayEvery : baseEvery;
	      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
	        predicate = undefined;
	      }
	      if (typeof predicate != 'function' || thisArg !== undefined) {
	        predicate = getCallback(predicate, thisArg, 3);
	      }
	      return func(collection, predicate);
	    }
	
	    /**
	     * Iterates over elements of `collection`, returning an array of all elements
	     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	     * invoked with three arguments: (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias select
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * _.filter([4, 5, 6], function(n) {
	     *   return n % 2 == 0;
	     * });
	     * // => [4, 6]
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.filter(users, 'active', false), 'user');
	     * // => ['fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.filter(users, 'active'), 'user');
	     * // => ['barney']
	     */
	    function filter(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      predicate = getCallback(predicate, thisArg, 3);
	      return func(collection, predicate);
	    }
	
	    /**
	     * Iterates over elements of `collection`, returning the first element
	     * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	     * invoked with three arguments: (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias detect
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': true },
	     *   { 'user': 'fred',    'age': 40, 'active': false },
	     *   { 'user': 'pebbles', 'age': 1,  'active': true }
	     * ];
	     *
	     * _.result(_.find(users, function(chr) {
	     *   return chr.age < 40;
	     * }), 'user');
	     * // => 'barney'
	     *
	     * // using the `_.matches` callback shorthand
	     * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
	     * // => 'pebbles'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.result(_.find(users, 'active', false), 'user');
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.result(_.find(users, 'active'), 'user');
	     * // => 'barney'
	     */
	    var find = createFind(baseEach);
	
	    /**
	     * This method is like `_.find` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * _.findLast([1, 2, 3, 4], function(n) {
	     *   return n % 2 == 1;
	     * });
	     * // => 3
	     */
	    var findLast = createFind(baseEachRight, true);
	
	    /**
	     * Performs a deep comparison between each element in `collection` and the
	     * source object, returning the first element that has equivalent property
	     * values.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Object} source The object of property values to match.
	     * @returns {*} Returns the matched element, else `undefined`.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');
	     * // => 'barney'
	     *
	     * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');
	     * // => 'fred'
	     */
	    function findWhere(collection, source) {
	      return find(collection, baseMatches(source));
	    }
	
	    /**
	     * Iterates over elements of `collection` invoking `iteratee` for each element.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection). Iteratee functions may exit iteration early
	     * by explicitly returning `false`.
	     *
	     * **Note:** As with other "Collections" methods, objects with a "length" property
	     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	     * may be used for object iteration.
	     *
	     * @static
	     * @memberOf _
	     * @alias each
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2]).forEach(function(n) {
	     *   console.log(n);
	     * }).value();
	     * // => logs each value from left to right and returns the array
	     *
	     * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	     *   console.log(n, key);
	     * });
	     * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	     */
	    var forEach = createForEach(arrayEach, baseEach);
	
	    /**
	     * This method is like `_.forEach` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias eachRight
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array|Object|string} Returns `collection`.
	     * @example
	     *
	     * _([1, 2]).forEachRight(function(n) {
	     *   console.log(n);
	     * }).value();
	     * // => logs each value from right to left and returns the array
	     */
	    var forEachRight = createForEach(arrayEachRight, baseEachRight);
	
	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is an array of the elements responsible for generating the key.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(n) {
	     *   return Math.floor(n);
	     * });
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * _.groupBy([4.2, 6.1, 6.4], function(n) {
	     *   return this.floor(n);
	     * }, Math);
	     * // => { '4': [4.2], '6': [6.1, 6.4] }
	     *
	     * // using the `_.property` callback shorthand
	     * _.groupBy(['one', 'two', 'three'], 'length');
	     * // => { '3': ['one', 'two'], '5': ['three'] }
	     */
	    var groupBy = createAggregator(function(result, value, key) {
	      if (hasOwnProperty.call(result, key)) {
	        result[key].push(value);
	      } else {
	        result[key] = [value];
	      }
	    });
	
	    /**
	     * Checks if `value` is in `collection` using
	     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	     * for equality comparisons. If `fromIndex` is negative, it is used as the offset
	     * from the end of `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @alias contains, include
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {*} target The value to search for.
	     * @param {number} [fromIndex=0] The index to search from.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
	     * @returns {boolean} Returns `true` if a matching element is found, else `false`.
	     * @example
	     *
	     * _.includes([1, 2, 3], 1);
	     * // => true
	     *
	     * _.includes([1, 2, 3], 1, 2);
	     * // => false
	     *
	     * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
	     * // => true
	     *
	     * _.includes('pebbles', 'eb');
	     * // => true
	     */
	    function includes(collection, target, fromIndex, guard) {
	      var length = collection ? getLength(collection) : 0;
	      if (!isLength(length)) {
	        collection = values(collection);
	        length = collection.length;
	      }
	      if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
	        fromIndex = 0;
	      } else {
	        fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
	      }
	      return (typeof collection == 'string' || !isArray(collection) && isString(collection))
	        ? (fromIndex <= length && collection.indexOf(target, fromIndex) > -1)
	        : (!!length && getIndexOf(collection, target, fromIndex) > -1);
	    }
	
	    /**
	     * Creates an object composed of keys generated from the results of running
	     * each element of `collection` through `iteratee`. The corresponding value
	     * of each key is the last element responsible for generating the key. The
	     * iteratee function is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the composed aggregate object.
	     * @example
	     *
	     * var keyData = [
	     *   { 'dir': 'left', 'code': 97 },
	     *   { 'dir': 'right', 'code': 100 }
	     * ];
	     *
	     * _.indexBy(keyData, 'dir');
	     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keyData, function(object) {
	     *   return String.fromCharCode(object.code);
	     * });
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     *
	     * _.indexBy(keyData, function(object) {
	     *   return this.fromCharCode(object.code);
	     * }, String);
	     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
	     */
	    var indexBy = createAggregator(function(result, value, key) {
	      result[key] = value;
	    });
	
	    /**
	     * Invokes the method at `path` of each element in `collection`, returning
	     * an array of the results of each invoked method. Any additional arguments
	     * are provided to each invoked method. If `methodName` is a function it is
	     * invoked for, and `this` bound to, each element in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Array|Function|string} path The path of the method to invoke or
	     *  the function invoked per iteration.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
	     * // => [[1, 5, 7], [1, 2, 3]]
	     *
	     * _.invoke([123, 456], String.prototype.split, '');
	     * // => [['1', '2', '3'], ['4', '5', '6']]
	     */
	    var invoke = restParam(function(collection, path, args) {
	      var index = -1,
	          isFunc = typeof path == 'function',
	          isProp = isKey(path),
	          result = isArrayLike(collection) ? Array(collection.length) : [];
	
	      baseEach(collection, function(value) {
	        var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
	        result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
	      });
	      return result;
	    });
	
	    /**
	     * Creates an array of values by running each element in `collection` through
	     * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments: (value, index|key, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * Many lodash methods are guarded to work as iteratees for methods like
	     * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	     *
	     * The guarded methods are:
	     * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
	     * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
	     * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
	     * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
	     * `sum`, `uniq`, and `words`
	     *
	     * @static
	     * @memberOf _
	     * @alias collect
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new mapped array.
	     * @example
	     *
	     * function timesThree(n) {
	     *   return n * 3;
	     * }
	     *
	     * _.map([1, 2], timesThree);
	     * // => [3, 6]
	     *
	     * _.map({ 'a': 1, 'b': 2 }, timesThree);
	     * // => [3, 6] (iteration order is not guaranteed)
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * // using the `_.property` callback shorthand
	     * _.map(users, 'user');
	     * // => ['barney', 'fred']
	     */
	    function map(collection, iteratee, thisArg) {
	      var func = isArray(collection) ? arrayMap : baseMap;
	      iteratee = getCallback(iteratee, thisArg, 3);
	      return func(collection, iteratee);
	    }
	
	    /**
	     * Creates an array of elements split into two groups, the first of which
	     * contains elements `predicate` returns truthy for, while the second of which
	     * contains elements `predicate` returns falsey for. The predicate is bound
	     * to `thisArg` and invoked with three arguments: (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the array of grouped elements.
	     * @example
	     *
	     * _.partition([1, 2, 3], function(n) {
	     *   return n % 2;
	     * });
	     * // => [[1, 3], [2]]
	     *
	     * _.partition([1.2, 2.3, 3.4], function(n) {
	     *   return this.floor(n) % 2;
	     * }, Math);
	     * // => [[1.2, 3.4], [2.3]]
	     *
	     * var users = [
	     *   { 'user': 'barney',  'age': 36, 'active': false },
	     *   { 'user': 'fred',    'age': 40, 'active': true },
	     *   { 'user': 'pebbles', 'age': 1,  'active': false }
	     * ];
	     *
	     * var mapper = function(array) {
	     *   return _.pluck(array, 'user');
	     * };
	     *
	     * // using the `_.matches` callback shorthand
	     * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);
	     * // => [['pebbles'], ['barney', 'fred']]
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.map(_.partition(users, 'active', false), mapper);
	     * // => [['barney', 'pebbles'], ['fred']]
	     *
	     * // using the `_.property` callback shorthand
	     * _.map(_.partition(users, 'active'), mapper);
	     * // => [['fred'], ['barney', 'pebbles']]
	     */
	    var partition = createAggregator(function(result, value, key) {
	      result[key ? 0 : 1].push(value);
	    }, function() { return [[], []]; });
	
	    /**
	     * Gets the property value of `path` from all elements in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Array|string} path The path of the property to pluck.
	     * @returns {Array} Returns the property values.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.pluck(users, 'user');
	     * // => ['barney', 'fred']
	     *
	     * var userIndex = _.indexBy(users, 'user');
	     * _.pluck(userIndex, 'age');
	     * // => [36, 40] (iteration order is not guaranteed)
	     */
	    function pluck(collection, path) {
	      return map(collection, property(path));
	    }
	
	    /**
	     * Reduces `collection` to a value which is the accumulated result of running
	     * each element in `collection` through `iteratee`, where each successive
	     * invocation is supplied the return value of the previous. If `accumulator`
	     * is not provided the first element of `collection` is used as the initial
	     * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
	     * (accumulator, value, index|key, collection).
	     *
	     * Many lodash methods are guarded to work as iteratees for methods like
	     * `_.reduce`, `_.reduceRight`, and `_.transform`.
	     *
	     * The guarded methods are:
	     * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
	     * and `sortByOrder`
	     *
	     * @static
	     * @memberOf _
	     * @alias foldl, inject
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * _.reduce([1, 2], function(total, n) {
	     *   return total + n;
	     * });
	     * // => 3
	     *
	     * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
	     *   result[key] = n * 3;
	     *   return result;
	     * }, {});
	     * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
	     */
	    var reduce = createReduce(arrayReduce, baseEach);
	
	    /**
	     * This method is like `_.reduce` except that it iterates over elements of
	     * `collection` from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias foldr
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The initial value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * var array = [[0, 1], [2, 3], [4, 5]];
	     *
	     * _.reduceRight(array, function(flattened, other) {
	     *   return flattened.concat(other);
	     * }, []);
	     * // => [4, 5, 2, 3, 0, 1]
	     */
	    var reduceRight = createReduce(arrayReduceRight, baseEachRight);
	
	    /**
	     * The opposite of `_.filter`; this method returns the elements of `collection`
	     * that `predicate` does **not** return truthy for.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * _.reject([1, 2, 3, 4], function(n) {
	     *   return n % 2 == 0;
	     * });
	     * // => [1, 3]
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false },
	     *   { 'user': 'fred',   'age': 40, 'active': true }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
	     * // => ['barney']
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.pluck(_.reject(users, 'active', false), 'user');
	     * // => ['fred']
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.reject(users, 'active'), 'user');
	     * // => ['barney']
	     */
	    function reject(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arrayFilter : baseFilter;
	      predicate = getCallback(predicate, thisArg, 3);
	      return func(collection, function(value, index, collection) {
	        return !predicate(value, index, collection);
	      });
	    }
	
	    /**
	     * Gets a random element or `n` random elements from a collection.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to sample.
	     * @param {number} [n] The number of elements to sample.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {*} Returns the random sample(s).
	     * @example
	     *
	     * _.sample([1, 2, 3, 4]);
	     * // => 2
	     *
	     * _.sample([1, 2, 3, 4], 2);
	     * // => [3, 1]
	     */
	    function sample(collection, n, guard) {
	      if (guard ? isIterateeCall(collection, n, guard) : n == null) {
	        collection = toIterable(collection);
	        var length = collection.length;
	        return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
	      }
	      var index = -1,
	          result = toArray(collection),
	          length = result.length,
	          lastIndex = length - 1;
	
	      n = nativeMin(n < 0 ? 0 : (+n || 0), length);
	      while (++index < n) {
	        var rand = baseRandom(index, lastIndex),
	            value = result[rand];
	
	        result[rand] = result[index];
	        result[index] = value;
	      }
	      result.length = n;
	      return result;
	    }
	
	    /**
	     * Creates an array of shuffled values, using a version of the
	     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to shuffle.
	     * @returns {Array} Returns the new shuffled array.
	     * @example
	     *
	     * _.shuffle([1, 2, 3, 4]);
	     * // => [4, 1, 3, 2]
	     */
	    function shuffle(collection) {
	      return sample(collection, POSITIVE_INFINITY);
	    }
	
	    /**
	     * Gets the size of `collection` by returning its length for array-like
	     * values or the number of own enumerable properties for objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to inspect.
	     * @returns {number} Returns the size of `collection`.
	     * @example
	     *
	     * _.size([1, 2, 3]);
	     * // => 3
	     *
	     * _.size({ 'a': 1, 'b': 2 });
	     * // => 2
	     *
	     * _.size('pebbles');
	     * // => 7
	     */
	    function size(collection) {
	      var length = collection ? getLength(collection) : 0;
	      return isLength(length) ? length : keys(collection).length;
	    }
	
	    /**
	     * Checks if `predicate` returns truthy for **any** element of `collection`.
	     * The function returns as soon as it finds a passing value and does not iterate
	     * over the entire collection. The predicate is bound to `thisArg` and invoked
	     * with three arguments: (value, index|key, collection).
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias any
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {boolean} Returns `true` if any element passes the predicate check,
	     *  else `false`.
	     * @example
	     *
	     * _.some([null, 0, 'yes', false], Boolean);
	     * // => true
	     *
	     * var users = [
	     *   { 'user': 'barney', 'active': true },
	     *   { 'user': 'fred',   'active': false }
	     * ];
	     *
	     * // using the `_.matches` callback shorthand
	     * _.some(users, { 'user': 'barney', 'active': false });
	     * // => false
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.some(users, 'active', false);
	     * // => true
	     *
	     * // using the `_.property` callback shorthand
	     * _.some(users, 'active');
	     * // => true
	     */
	    function some(collection, predicate, thisArg) {
	      var func = isArray(collection) ? arraySome : baseSome;
	      if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
	        predicate = undefined;
	      }
	      if (typeof predicate != 'function' || thisArg !== undefined) {
	        predicate = getCallback(predicate, thisArg, 3);
	      }
	      return func(collection, predicate);
	    }
	
	    /**
	     * Creates an array of elements, sorted in ascending order by the results of
	     * running each element in a collection through `iteratee`. This method performs
	     * a stable sort, that is, it preserves the original sort order of equal elements.
	     * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	     * (value, index|key, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * _.sortBy([1, 2, 3], function(n) {
	     *   return Math.sin(n);
	     * });
	     * // => [3, 1, 2]
	     *
	     * _.sortBy([1, 2, 3], function(n) {
	     *   return this.sin(n);
	     * }, Math);
	     * // => [3, 1, 2]
	     *
	     * var users = [
	     *   { 'user': 'fred' },
	     *   { 'user': 'pebbles' },
	     *   { 'user': 'barney' }
	     * ];
	     *
	     * // using the `_.property` callback shorthand
	     * _.pluck(_.sortBy(users, 'user'), 'user');
	     * // => ['barney', 'fred', 'pebbles']
	     */
	    function sortBy(collection, iteratee, thisArg) {
	      if (collection == null) {
	        return [];
	      }
	      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
	        iteratee = undefined;
	      }
	      var index = -1;
	      iteratee = getCallback(iteratee, thisArg, 3);
	
	      var result = baseMap(collection, function(value, key, collection) {
	        return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
	      });
	      return baseSortBy(result, compareAscending);
	    }
	
	    /**
	     * This method is like `_.sortBy` except that it can sort by multiple iteratees
	     * or property names.
	     *
	     * If a property name is provided for an iteratee the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If an object is provided for an iteratee the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {...(Function|Function[]|Object|Object[]|string|string[])} iteratees
	     *  The iteratees to sort by, specified as individual values or arrays of values.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'fred',   'age': 48 },
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 42 },
	     *   { 'user': 'barney', 'age': 34 }
	     * ];
	     *
	     * _.map(_.sortByAll(users, ['user', 'age']), _.values);
	     * // => [['barney', 34], ['barney', 36], ['fred', 42], ['fred', 48]]
	     *
	     * _.map(_.sortByAll(users, 'user', function(chr) {
	     *   return Math.floor(chr.age / 10);
	     * }), _.values);
	     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
	     */
	    var sortByAll = restParam(function(collection, iteratees) {
	      if (collection == null) {
	        return [];
	      }
	      var guard = iteratees[2];
	      if (guard && isIterateeCall(iteratees[0], iteratees[1], guard)) {
	        iteratees.length = 1;
	      }
	      return baseSortByOrder(collection, baseFlatten(iteratees), []);
	    });
	
	    /**
	     * This method is like `_.sortByAll` except that it allows specifying the
	     * sort orders of the iteratees to sort by. If `orders` is unspecified, all
	     * values are sorted in ascending order. Otherwise, a value is sorted in
	     * ascending order if its corresponding order is "asc", and descending if "desc".
	     *
	     * If a property name is provided for an iteratee the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If an object is provided for an iteratee the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
	     * @param {boolean[]} [orders] The sort orders of `iteratees`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
	     * @returns {Array} Returns the new sorted array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'fred',   'age': 48 },
	     *   { 'user': 'barney', 'age': 34 },
	     *   { 'user': 'fred',   'age': 42 },
	     *   { 'user': 'barney', 'age': 36 }
	     * ];
	     *
	     * // sort by `user` in ascending order and by `age` in descending order
	     * _.map(_.sortByOrder(users, ['user', 'age'], ['asc', 'desc']), _.values);
	     * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
	     */
	    function sortByOrder(collection, iteratees, orders, guard) {
	      if (collection == null) {
	        return [];
	      }
	      if (guard && isIterateeCall(iteratees, orders, guard)) {
	        orders = undefined;
	      }
	      if (!isArray(iteratees)) {
	        iteratees = iteratees == null ? [] : [iteratees];
	      }
	      if (!isArray(orders)) {
	        orders = orders == null ? [] : [orders];
	      }
	      return baseSortByOrder(collection, iteratees, orders);
	    }
	
	    /**
	     * Performs a deep comparison between each element in `collection` and the
	     * source object, returning an array of all elements that have equivalent
	     * property values.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Collection
	     * @param {Array|Object|string} collection The collection to search.
	     * @param {Object} source The object of property values to match.
	     * @returns {Array} Returns the new filtered array.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },
	     *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }
	     * ];
	     *
	     * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');
	     * // => ['barney']
	     *
	     * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');
	     * // => ['fred']
	     */
	    function where(collection, source) {
	      return filter(collection, baseMatches(source));
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Gets the number of milliseconds that have elapsed since the Unix epoch
	     * (1 January 1970 00:00:00 UTC).
	     *
	     * @static
	     * @memberOf _
	     * @category Date
	     * @example
	     *
	     * _.defer(function(stamp) {
	     *   console.log(_.now() - stamp);
	     * }, _.now());
	     * // => logs the number of milliseconds it took for the deferred function to be invoked
	     */
	    var now = nativeNow || function() {
	      return new Date().getTime();
	    };
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * The opposite of `_.before`; this method creates a function that invokes
	     * `func` once it is called `n` or more times.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {number} n The number of calls before `func` is invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var saves = ['profile', 'settings'];
	     *
	     * var done = _.after(saves.length, function() {
	     *   console.log('done saving!');
	     * });
	     *
	     * _.forEach(saves, function(type) {
	     *   asyncSave({ 'type': type, 'complete': done });
	     * });
	     * // => logs 'done saving!' after the two async saves have completed
	     */
	    function after(n, func) {
	      if (typeof func != 'function') {
	        if (typeof n == 'function') {
	          var temp = n;
	          n = func;
	          func = temp;
	        } else {
	          throw new TypeError(FUNC_ERROR_TEXT);
	        }
	      }
	      n = nativeIsFinite(n = +n) ? n : 0;
	      return function() {
	        if (--n < 1) {
	          return func.apply(this, arguments);
	        }
	      };
	    }
	
	    /**
	     * Creates a function that accepts up to `n` arguments ignoring any
	     * additional arguments.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to cap arguments for.
	     * @param {number} [n=func.length] The arity cap.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * _.map(['6', '8', '10'], _.ary(parseInt, 1));
	     * // => [6, 8, 10]
	     */
	    function ary(func, n, guard) {
	      if (guard && isIterateeCall(func, n, guard)) {
	        n = undefined;
	      }
	      n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);
	      return createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
	    }
	
	    /**
	     * Creates a function that invokes `func`, with the `this` binding and arguments
	     * of the created function, while it is called less than `n` times. Subsequent
	     * calls to the created function return the result of the last `func` invocation.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {number} n The number of calls at which `func` is no longer invoked.
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * jQuery('#add').on('click', _.before(5, addContactToList));
	     * // => allows adding up to 4 contacts to the list
	     */
	    function before(n, func) {
	      var result;
	      if (typeof func != 'function') {
	        if (typeof n == 'function') {
	          var temp = n;
	          n = func;
	          func = temp;
	        } else {
	          throw new TypeError(FUNC_ERROR_TEXT);
	        }
	      }
	      return function() {
	        if (--n > 0) {
	          result = func.apply(this, arguments);
	        }
	        if (n <= 1) {
	          func = undefined;
	        }
	        return result;
	      };
	    }
	
	    /**
	     * Creates a function that invokes `func` with the `this` binding of `thisArg`
	     * and prepends any additional `_.bind` arguments to those provided to the
	     * bound function.
	     *
	     * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** Unlike native `Function#bind` this method does not set the "length"
	     * property of bound functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to bind.
	     * @param {*} thisArg The `this` binding of `func`.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var greet = function(greeting, punctuation) {
	     *   return greeting + ' ' + this.user + punctuation;
	     * };
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * var bound = _.bind(greet, object, 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * // using placeholders
	     * var bound = _.bind(greet, object, _, '!');
	     * bound('hi');
	     * // => 'hi fred!'
	     */
	    var bind = restParam(function(func, thisArg, partials) {
	      var bitmask = BIND_FLAG;
	      if (partials.length) {
	        var holders = replaceHolders(partials, bind.placeholder);
	        bitmask |= PARTIAL_FLAG;
	      }
	      return createWrapper(func, bitmask, thisArg, partials, holders);
	    });
	
	    /**
	     * Binds methods of an object to the object itself, overwriting the existing
	     * method. Method names may be specified as individual arguments or as arrays
	     * of method names. If no method names are provided all enumerable function
	     * properties, own and inherited, of `object` are bound.
	     *
	     * **Note:** This method does not set the "length" property of bound functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Object} object The object to bind and assign the bound methods to.
	     * @param {...(string|string[])} [methodNames] The object method names to bind,
	     *  specified as individual method names or arrays of method names.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var view = {
	     *   'label': 'docs',
	     *   'onClick': function() {
	     *     console.log('clicked ' + this.label);
	     *   }
	     * };
	     *
	     * _.bindAll(view);
	     * jQuery('#docs').on('click', view.onClick);
	     * // => logs 'clicked docs' when the element is clicked
	     */
	    var bindAll = restParam(function(object, methodNames) {
	      methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);
	
	      var index = -1,
	          length = methodNames.length;
	
	      while (++index < length) {
	        var key = methodNames[index];
	        object[key] = createWrapper(object[key], BIND_FLAG, object);
	      }
	      return object;
	    });
	
	    /**
	     * Creates a function that invokes the method at `object[key]` and prepends
	     * any additional `_.bindKey` arguments to those provided to the bound function.
	     *
	     * This method differs from `_.bind` by allowing bound functions to reference
	     * methods that may be redefined or don't yet exist.
	     * See [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
	     * for more details.
	     *
	     * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Object} object The object the method belongs to.
	     * @param {string} key The key of the method.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new bound function.
	     * @example
	     *
	     * var object = {
	     *   'user': 'fred',
	     *   'greet': function(greeting, punctuation) {
	     *     return greeting + ' ' + this.user + punctuation;
	     *   }
	     * };
	     *
	     * var bound = _.bindKey(object, 'greet', 'hi');
	     * bound('!');
	     * // => 'hi fred!'
	     *
	     * object.greet = function(greeting, punctuation) {
	     *   return greeting + 'ya ' + this.user + punctuation;
	     * };
	     *
	     * bound('!');
	     * // => 'hiya fred!'
	     *
	     * // using placeholders
	     * var bound = _.bindKey(object, 'greet', _, '!');
	     * bound('hi');
	     * // => 'hiya fred!'
	     */
	    var bindKey = restParam(function(object, key, partials) {
	      var bitmask = BIND_FLAG | BIND_KEY_FLAG;
	      if (partials.length) {
	        var holders = replaceHolders(partials, bindKey.placeholder);
	        bitmask |= PARTIAL_FLAG;
	      }
	      return createWrapper(key, bitmask, object, partials, holders);
	    });
	
	    /**
	     * Creates a function that accepts one or more arguments of `func` that when
	     * called either invokes `func` returning its result, if all `func` arguments
	     * have been provided, or returns a function that accepts one or more of the
	     * remaining `func` arguments, and so on. The arity of `func` may be specified
	     * if `func.length` is not sufficient.
	     *
	     * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
	     * may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method does not set the "length" property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curry(abc);
	     *
	     * curried(1)(2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2)(3);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // using placeholders
	     * curried(1)(_, 3)(2);
	     * // => [1, 2, 3]
	     */
	    var curry = createCurry(CURRY_FLAG);
	
	    /**
	     * This method is like `_.curry` except that arguments are applied to `func`
	     * in the manner of `_.partialRight` instead of `_.partial`.
	     *
	     * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for provided arguments.
	     *
	     * **Note:** This method does not set the "length" property of curried functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to curry.
	     * @param {number} [arity=func.length] The arity of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the new curried function.
	     * @example
	     *
	     * var abc = function(a, b, c) {
	     *   return [a, b, c];
	     * };
	     *
	     * var curried = _.curryRight(abc);
	     *
	     * curried(3)(2)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(2, 3)(1);
	     * // => [1, 2, 3]
	     *
	     * curried(1, 2, 3);
	     * // => [1, 2, 3]
	     *
	     * // using placeholders
	     * curried(3)(1, _)(2);
	     * // => [1, 2, 3]
	     */
	    var curryRight = createCurry(CURRY_RIGHT_FLAG);
	
	    /**
	     * Creates a debounced function that delays invoking `func` until after `wait`
	     * milliseconds have elapsed since the last time the debounced function was
	     * invoked. The debounced function comes with a `cancel` method to cancel
	     * delayed invocations. Provide an options object to indicate that `func`
	     * should be invoked on the leading and/or trailing edge of the `wait` timeout.
	     * Subsequent calls to the debounced function return the result of the last
	     * `func` invocation.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
	     * on the trailing edge of the timeout only if the the debounced function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
	     * for details over the differences between `_.debounce` and `_.throttle`.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to debounce.
	     * @param {number} [wait=0] The number of milliseconds to delay.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=false] Specify invoking on the leading
	     *  edge of the timeout.
	     * @param {number} [options.maxWait] The maximum time `func` is allowed to be
	     *  delayed before it is invoked.
	     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
	     *  edge of the timeout.
	     * @returns {Function} Returns the new debounced function.
	     * @example
	     *
	     * // avoid costly calculations while the window size is in flux
	     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
	     *
	     * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
	     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
	     *   'leading': true,
	     *   'trailing': false
	     * }));
	     *
	     * // ensure `batchLog` is invoked once after 1 second of debounced calls
	     * var source = new EventSource('/stream');
	     * jQuery(source).on('message', _.debounce(batchLog, 250, {
	     *   'maxWait': 1000
	     * }));
	     *
	     * // cancel a debounced call
	     * var todoChanges = _.debounce(batchLog, 1000);
	     * Object.observe(models.todo, todoChanges);
	     *
	     * Object.observe(models, function(changes) {
	     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
	     *     todoChanges.cancel();
	     *   }
	     * }, ['delete']);
	     *
	     * // ...at some point `models.todo` is changed
	     * models.todo.completed = true;
	     *
	     * // ...before 1 second has passed `models.todo` is deleted
	     * // which cancels the debounced `todoChanges` call
	     * delete models.todo;
	     */
	    function debounce(func, wait, options) {
	      var args,
	          maxTimeoutId,
	          result,
	          stamp,
	          thisArg,
	          timeoutId,
	          trailingCall,
	          lastCalled = 0,
	          maxWait = false,
	          trailing = true;
	
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      wait = wait < 0 ? 0 : (+wait || 0);
	      if (options === true) {
	        var leading = true;
	        trailing = false;
	      } else if (isObject(options)) {
	        leading = !!options.leading;
	        maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
	        trailing = 'trailing' in options ? !!options.trailing : trailing;
	      }
	
	      function cancel() {
	        if (timeoutId) {
	          clearTimeout(timeoutId);
	        }
	        if (maxTimeoutId) {
	          clearTimeout(maxTimeoutId);
	        }
	        lastCalled = 0;
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	      }
	
	      function complete(isCalled, id) {
	        if (id) {
	          clearTimeout(id);
	        }
	        maxTimeoutId = timeoutId = trailingCall = undefined;
	        if (isCalled) {
	          lastCalled = now();
	          result = func.apply(thisArg, args);
	          if (!timeoutId && !maxTimeoutId) {
	            args = thisArg = undefined;
	          }
	        }
	      }
	
	      function delayed() {
	        var remaining = wait - (now() - stamp);
	        if (remaining <= 0 || remaining > wait) {
	          complete(trailingCall, maxTimeoutId);
	        } else {
	          timeoutId = setTimeout(delayed, remaining);
	        }
	      }
	
	      function maxDelayed() {
	        complete(trailing, timeoutId);
	      }
	
	      function debounced() {
	        args = arguments;
	        stamp = now();
	        thisArg = this;
	        trailingCall = trailing && (timeoutId || !leading);
	
	        if (maxWait === false) {
	          var leadingCall = leading && !timeoutId;
	        } else {
	          if (!maxTimeoutId && !leading) {
	            lastCalled = stamp;
	          }
	          var remaining = maxWait - (stamp - lastCalled),
	              isCalled = remaining <= 0 || remaining > maxWait;
	
	          if (isCalled) {
	            if (maxTimeoutId) {
	              maxTimeoutId = clearTimeout(maxTimeoutId);
	            }
	            lastCalled = stamp;
	            result = func.apply(thisArg, args);
	          }
	          else if (!maxTimeoutId) {
	            maxTimeoutId = setTimeout(maxDelayed, remaining);
	          }
	        }
	        if (isCalled && timeoutId) {
	          timeoutId = clearTimeout(timeoutId);
	        }
	        else if (!timeoutId && wait !== maxWait) {
	          timeoutId = setTimeout(delayed, wait);
	        }
	        if (leadingCall) {
	          isCalled = true;
	          result = func.apply(thisArg, args);
	        }
	        if (isCalled && !timeoutId && !maxTimeoutId) {
	          args = thisArg = undefined;
	        }
	        return result;
	      }
	      debounced.cancel = cancel;
	      return debounced;
	    }
	
	    /**
	     * Defers invoking the `func` until the current call stack has cleared. Any
	     * additional arguments are provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to defer.
	     * @param {...*} [args] The arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.defer(function(text) {
	     *   console.log(text);
	     * }, 'deferred');
	     * // logs 'deferred' after one or more milliseconds
	     */
	    var defer = restParam(function(func, args) {
	      return baseDelay(func, 1, args);
	    });
	
	    /**
	     * Invokes `func` after `wait` milliseconds. Any additional arguments are
	     * provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to delay.
	     * @param {number} wait The number of milliseconds to delay invocation.
	     * @param {...*} [args] The arguments to invoke the function with.
	     * @returns {number} Returns the timer id.
	     * @example
	     *
	     * _.delay(function(text) {
	     *   console.log(text);
	     * }, 1000, 'later');
	     * // => logs 'later' after one second
	     */
	    var delay = restParam(function(func, wait, args) {
	      return baseDelay(func, wait, args);
	    });
	
	    /**
	     * Creates a function that returns the result of invoking the provided
	     * functions with the `this` binding of the created function, where each
	     * successive invocation is supplied the return value of the previous.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {...Function} [funcs] Functions to invoke.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flow(_.add, square);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    var flow = createFlow();
	
	    /**
	     * This method is like `_.flow` except that it creates a function that
	     * invokes the provided functions from right to left.
	     *
	     * @static
	     * @memberOf _
	     * @alias backflow, compose
	     * @category Function
	     * @param {...Function} [funcs] Functions to invoke.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var addSquare = _.flowRight(square, _.add);
	     * addSquare(1, 2);
	     * // => 9
	     */
	    var flowRight = createFlow(true);
	
	    /**
	     * Creates a function that memoizes the result of `func`. If `resolver` is
	     * provided it determines the cache key for storing the result based on the
	     * arguments provided to the memoized function. By default, the first argument
	     * provided to the memoized function is coerced to a string and used as the
	     * cache key. The `func` is invoked with the `this` binding of the memoized
	     * function.
	     *
	     * **Note:** The cache is exposed as the `cache` property on the memoized
	     * function. Its creation may be customized by replacing the `_.memoize.Cache`
	     * constructor with one whose instances implement the [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
	     * method interface of `get`, `has`, and `set`.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to have its output memoized.
	     * @param {Function} [resolver] The function to resolve the cache key.
	     * @returns {Function} Returns the new memoizing function.
	     * @example
	     *
	     * var upperCase = _.memoize(function(string) {
	     *   return string.toUpperCase();
	     * });
	     *
	     * upperCase('fred');
	     * // => 'FRED'
	     *
	     * // modifying the result cache
	     * upperCase.cache.set('fred', 'BARNEY');
	     * upperCase('fred');
	     * // => 'BARNEY'
	     *
	     * // replacing `_.memoize.Cache`
	     * var object = { 'user': 'fred' };
	     * var other = { 'user': 'barney' };
	     * var identity = _.memoize(_.identity);
	     *
	     * identity(object);
	     * // => { 'user': 'fred' }
	     * identity(other);
	     * // => { 'user': 'fred' }
	     *
	     * _.memoize.Cache = WeakMap;
	     * var identity = _.memoize(_.identity);
	     *
	     * identity(object);
	     * // => { 'user': 'fred' }
	     * identity(other);
	     * // => { 'user': 'barney' }
	     */
	    function memoize(func, resolver) {
	      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var memoized = function() {
	        var args = arguments,
	            key = resolver ? resolver.apply(this, args) : args[0],
	            cache = memoized.cache;
	
	        if (cache.has(key)) {
	          return cache.get(key);
	        }
	        var result = func.apply(this, args);
	        memoized.cache = cache.set(key, result);
	        return result;
	      };
	      memoized.cache = new memoize.Cache;
	      return memoized;
	    }
	
	    /**
	     * Creates a function that runs each argument through a corresponding
	     * transform function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to wrap.
	     * @param {...(Function|Function[])} [transforms] The functions to transform
	     * arguments, specified as individual functions or arrays of functions.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function doubled(n) {
	     *   return n * 2;
	     * }
	     *
	     * function square(n) {
	     *   return n * n;
	     * }
	     *
	     * var modded = _.modArgs(function(x, y) {
	     *   return [x, y];
	     * }, square, doubled);
	     *
	     * modded(1, 2);
	     * // => [1, 4]
	     *
	     * modded(5, 10);
	     * // => [25, 20]
	     */
	    var modArgs = restParam(function(func, transforms) {
	      transforms = baseFlatten(transforms);
	      if (typeof func != 'function' || !arrayEvery(transforms, baseIsFunction)) {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      var length = transforms.length;
	      return restParam(function(args) {
	        var index = nativeMin(args.length, length);
	        while (index--) {
	          args[index] = transforms[index](args[index]);
	        }
	        return func.apply(this, args);
	      });
	    });
	
	    /**
	     * Creates a function that negates the result of the predicate `func`. The
	     * `func` predicate is invoked with the `this` binding and arguments of the
	     * created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} predicate The predicate to negate.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * function isEven(n) {
	     *   return n % 2 == 0;
	     * }
	     *
	     * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
	     * // => [1, 3, 5]
	     */
	    function negate(predicate) {
	      if (typeof predicate != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function() {
	        return !predicate.apply(this, arguments);
	      };
	    }
	
	    /**
	     * Creates a function that is restricted to invoking `func` once. Repeat calls
	     * to the function return the value of the first call. The `func` is invoked
	     * with the `this` binding and arguments of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to restrict.
	     * @returns {Function} Returns the new restricted function.
	     * @example
	     *
	     * var initialize = _.once(createApplication);
	     * initialize();
	     * initialize();
	     * // `initialize` invokes `createApplication` once
	     */
	    function once(func) {
	      return before(2, func);
	    }
	
	    /**
	     * Creates a function that invokes `func` with `partial` arguments prepended
	     * to those provided to the new function. This method is like `_.bind` except
	     * it does **not** alter the `this` binding.
	     *
	     * The `_.partial.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method does not set the "length" property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) {
	     *   return greeting + ' ' + name;
	     * };
	     *
	     * var sayHelloTo = _.partial(greet, 'hello');
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     *
	     * // using placeholders
	     * var greetFred = _.partial(greet, _, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     */
	    var partial = createPartial(PARTIAL_FLAG);
	
	    /**
	     * This method is like `_.partial` except that partially applied arguments
	     * are appended to those provided to the new function.
	     *
	     * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
	     * builds, may be used as a placeholder for partially applied arguments.
	     *
	     * **Note:** This method does not set the "length" property of partially
	     * applied functions.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to partially apply arguments to.
	     * @param {...*} [partials] The arguments to be partially applied.
	     * @returns {Function} Returns the new partially applied function.
	     * @example
	     *
	     * var greet = function(greeting, name) {
	     *   return greeting + ' ' + name;
	     * };
	     *
	     * var greetFred = _.partialRight(greet, 'fred');
	     * greetFred('hi');
	     * // => 'hi fred'
	     *
	     * // using placeholders
	     * var sayHelloTo = _.partialRight(greet, 'hello', _);
	     * sayHelloTo('fred');
	     * // => 'hello fred'
	     */
	    var partialRight = createPartial(PARTIAL_RIGHT_FLAG);
	
	    /**
	     * Creates a function that invokes `func` with arguments arranged according
	     * to the specified indexes where the argument value at the first index is
	     * provided as the first argument, the argument value at the second index is
	     * provided as the second argument, and so on.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to rearrange arguments for.
	     * @param {...(number|number[])} indexes The arranged argument indexes,
	     *  specified as individual indexes or arrays of indexes.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var rearged = _.rearg(function(a, b, c) {
	     *   return [a, b, c];
	     * }, 2, 0, 1);
	     *
	     * rearged('b', 'c', 'a')
	     * // => ['a', 'b', 'c']
	     *
	     * var map = _.rearg(_.map, [1, 0]);
	     * map(function(n) {
	     *   return n * 3;
	     * }, [1, 2, 3]);
	     * // => [3, 6, 9]
	     */
	    var rearg = restParam(function(func, indexes) {
	      return createWrapper(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes));
	    });
	
	    /**
	     * Creates a function that invokes `func` with the `this` binding of the
	     * created function and arguments from `start` and beyond provided as an array.
	     *
	     * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to apply a rest parameter to.
	     * @param {number} [start=func.length-1] The start position of the rest parameter.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var say = _.restParam(function(what, names) {
	     *   return what + ' ' + _.initial(names).join(', ') +
	     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	     * });
	     *
	     * say('hello', 'fred', 'barney', 'pebbles');
	     * // => 'hello fred, barney, & pebbles'
	     */
	    function restParam(func, start) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	      return function() {
	        var args = arguments,
	            index = -1,
	            length = nativeMax(args.length - start, 0),
	            rest = Array(length);
	
	        while (++index < length) {
	          rest[index] = args[start + index];
	        }
	        switch (start) {
	          case 0: return func.call(this, rest);
	          case 1: return func.call(this, args[0], rest);
	          case 2: return func.call(this, args[0], args[1], rest);
	        }
	        var otherArgs = Array(start + 1);
	        index = -1;
	        while (++index < start) {
	          otherArgs[index] = args[index];
	        }
	        otherArgs[start] = rest;
	        return func.apply(this, otherArgs);
	      };
	    }
	
	    /**
	     * Creates a function that invokes `func` with the `this` binding of the created
	     * function and an array of arguments much like [`Function#apply`](https://es5.github.io/#x15.3.4.3).
	     *
	     * **Note:** This method is based on the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to spread arguments over.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var say = _.spread(function(who, what) {
	     *   return who + ' says ' + what;
	     * });
	     *
	     * say(['fred', 'hello']);
	     * // => 'fred says hello'
	     *
	     * // with a Promise
	     * var numbers = Promise.all([
	     *   Promise.resolve(40),
	     *   Promise.resolve(36)
	     * ]);
	     *
	     * numbers.then(_.spread(function(x, y) {
	     *   return x + y;
	     * }));
	     * // => a Promise of 76
	     */
	    function spread(func) {
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      return function(array) {
	        return func.apply(this, array);
	      };
	    }
	
	    /**
	     * Creates a throttled function that only invokes `func` at most once per
	     * every `wait` milliseconds. The throttled function comes with a `cancel`
	     * method to cancel delayed invocations. Provide an options object to indicate
	     * that `func` should be invoked on the leading and/or trailing edge of the
	     * `wait` timeout. Subsequent calls to the throttled function return the
	     * result of the last `func` call.
	     *
	     * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
	     * on the trailing edge of the timeout only if the the throttled function is
	     * invoked more than once during the `wait` timeout.
	     *
	     * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
	     * for details over the differences between `_.throttle` and `_.debounce`.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {Function} func The function to throttle.
	     * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.leading=true] Specify invoking on the leading
	     *  edge of the timeout.
	     * @param {boolean} [options.trailing=true] Specify invoking on the trailing
	     *  edge of the timeout.
	     * @returns {Function} Returns the new throttled function.
	     * @example
	     *
	     * // avoid excessively updating the position while scrolling
	     * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
	     *
	     * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
	     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
	     *   'trailing': false
	     * }));
	     *
	     * // cancel a trailing throttled call
	     * jQuery(window).on('popstate', throttled.cancel);
	     */
	    function throttle(func, wait, options) {
	      var leading = true,
	          trailing = true;
	
	      if (typeof func != 'function') {
	        throw new TypeError(FUNC_ERROR_TEXT);
	      }
	      if (options === false) {
	        leading = false;
	      } else if (isObject(options)) {
	        leading = 'leading' in options ? !!options.leading : leading;
	        trailing = 'trailing' in options ? !!options.trailing : trailing;
	      }
	      return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
	    }
	
	    /**
	     * Creates a function that provides `value` to the wrapper function as its
	     * first argument. Any additional arguments provided to the function are
	     * appended to those provided to the wrapper function. The wrapper is invoked
	     * with the `this` binding of the created function.
	     *
	     * @static
	     * @memberOf _
	     * @category Function
	     * @param {*} value The value to wrap.
	     * @param {Function} wrapper The wrapper function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var p = _.wrap(_.escape, function(func, text) {
	     *   return '<p>' + func(text) + '</p>';
	     * });
	     *
	     * p('fred, barney, & pebbles');
	     * // => '<p>fred, barney, &amp; pebbles</p>'
	     */
	    function wrap(value, wrapper) {
	      wrapper = wrapper == null ? identity : wrapper;
	      return createWrapper(wrapper, PARTIAL_FLAG, undefined, [value], []);
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
	     * otherwise they are assigned by reference. If `customizer` is provided it is
	     * invoked to produce the cloned values. If `customizer` returns `undefined`
	     * cloning is handled by the method instead. The `customizer` is bound to
	     * `thisArg` and invoked with two argument; (value [, index|key, object]).
	     *
	     * **Note:** This method is loosely based on the
	     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
	     * The enumerable properties of `arguments` objects and objects created by
	     * constructors other than `Object` are cloned to plain `Object` objects. An
	     * empty object is returned for uncloneable values such as functions, DOM nodes,
	     * Maps, Sets, and WeakMaps.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to clone.
	     * @param {boolean} [isDeep] Specify a deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {*} Returns the cloned value.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * var shallow = _.clone(users);
	     * shallow[0] === users[0];
	     * // => true
	     *
	     * var deep = _.clone(users, true);
	     * deep[0] === users[0];
	     * // => false
	     *
	     * // using a customizer callback
	     * var el = _.clone(document.body, function(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(false);
	     *   }
	     * });
	     *
	     * el === document.body
	     * // => false
	     * el.nodeName
	     * // => BODY
	     * el.childNodes.length;
	     * // => 0
	     */
	    function clone(value, isDeep, customizer, thisArg) {
	      if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
	        isDeep = false;
	      }
	      else if (typeof isDeep == 'function') {
	        thisArg = customizer;
	        customizer = isDeep;
	        isDeep = false;
	      }
	      return typeof customizer == 'function'
	        ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 1))
	        : baseClone(value, isDeep);
	    }
	
	    /**
	     * Creates a deep clone of `value`. If `customizer` is provided it is invoked
	     * to produce the cloned values. If `customizer` returns `undefined` cloning
	     * is handled by the method instead. The `customizer` is bound to `thisArg`
	     * and invoked with two argument; (value [, index|key, object]).
	     *
	     * **Note:** This method is loosely based on the
	     * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
	     * The enumerable properties of `arguments` objects and objects created by
	     * constructors other than `Object` are cloned to plain `Object` objects. An
	     * empty object is returned for uncloneable values such as functions, DOM nodes,
	     * Maps, Sets, and WeakMaps.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to deep clone.
	     * @param {Function} [customizer] The function to customize cloning values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {*} Returns the deep cloned value.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * var deep = _.cloneDeep(users);
	     * deep[0] === users[0];
	     * // => false
	     *
	     * // using a customizer callback
	     * var el = _.cloneDeep(document.body, function(value) {
	     *   if (_.isElement(value)) {
	     *     return value.cloneNode(true);
	     *   }
	     * });
	     *
	     * el === document.body
	     * // => false
	     * el.nodeName
	     * // => BODY
	     * el.childNodes.length;
	     * // => 20
	     */
	    function cloneDeep(value, customizer, thisArg) {
	      return typeof customizer == 'function'
	        ? baseClone(value, true, bindCallback(customizer, thisArg, 1))
	        : baseClone(value, true);
	    }
	
	    /**
	     * Checks if `value` is greater than `other`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is greater than `other`, else `false`.
	     * @example
	     *
	     * _.gt(3, 1);
	     * // => true
	     *
	     * _.gt(3, 3);
	     * // => false
	     *
	     * _.gt(1, 3);
	     * // => false
	     */
	    function gt(value, other) {
	      return value > other;
	    }
	
	    /**
	     * Checks if `value` is greater than or equal to `other`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is greater than or equal to `other`, else `false`.
	     * @example
	     *
	     * _.gte(3, 1);
	     * // => true
	     *
	     * _.gte(3, 3);
	     * // => true
	     *
	     * _.gte(1, 3);
	     * // => false
	     */
	    function gte(value, other) {
	      return value >= other;
	    }
	
	    /**
	     * Checks if `value` is classified as an `arguments` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isArguments(function() { return arguments; }());
	     * // => true
	     *
	     * _.isArguments([1, 2, 3]);
	     * // => false
	     */
	    function isArguments(value) {
	      return isObjectLike(value) && isArrayLike(value) &&
	        hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	    }
	
	    /**
	     * Checks if `value` is classified as an `Array` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isArray([1, 2, 3]);
	     * // => true
	     *
	     * _.isArray(function() { return arguments; }());
	     * // => false
	     */
	    var isArray = nativeIsArray || function(value) {
	      return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	    };
	
	    /**
	     * Checks if `value` is classified as a boolean primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isBoolean(false);
	     * // => true
	     *
	     * _.isBoolean(null);
	     * // => false
	     */
	    function isBoolean(value) {
	      return value === true || value === false || (isObjectLike(value) && objToString.call(value) == boolTag);
	    }
	
	    /**
	     * Checks if `value` is classified as a `Date` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isDate(new Date);
	     * // => true
	     *
	     * _.isDate('Mon April 23 2012');
	     * // => false
	     */
	    function isDate(value) {
	      return isObjectLike(value) && objToString.call(value) == dateTag;
	    }
	
	    /**
	     * Checks if `value` is a DOM element.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
	     * @example
	     *
	     * _.isElement(document.body);
	     * // => true
	     *
	     * _.isElement('<body>');
	     * // => false
	     */
	    function isElement(value) {
	      return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
	    }
	
	    /**
	     * Checks if `value` is empty. A value is considered empty unless it is an
	     * `arguments` object, array, string, or jQuery-like collection with a length
	     * greater than `0` or an object with own enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {Array|Object|string} value The value to inspect.
	     * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	     * @example
	     *
	     * _.isEmpty(null);
	     * // => true
	     *
	     * _.isEmpty(true);
	     * // => true
	     *
	     * _.isEmpty(1);
	     * // => true
	     *
	     * _.isEmpty([1, 2, 3]);
	     * // => false
	     *
	     * _.isEmpty({ 'a': 1 });
	     * // => false
	     */
	    function isEmpty(value) {
	      if (value == null) {
	        return true;
	      }
	      if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
	          (isObjectLike(value) && isFunction(value.splice)))) {
	        return !value.length;
	      }
	      return !keys(value).length;
	    }
	
	    /**
	     * Performs a deep comparison between two values to determine if they are
	     * equivalent. If `customizer` is provided it is invoked to compare values.
	     * If `customizer` returns `undefined` comparisons are handled by the method
	     * instead. The `customizer` is bound to `thisArg` and invoked with three
	     * arguments: (value, other [, index|key]).
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. Functions and DOM nodes
	     * are **not** supported. Provide a customizer function to extend support
	     * for comparing other values.
	     *
	     * @static
	     * @memberOf _
	     * @alias eq
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @param {Function} [customizer] The function to customize value comparisons.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     * var other = { 'user': 'fred' };
	     *
	     * object == other;
	     * // => false
	     *
	     * _.isEqual(object, other);
	     * // => true
	     *
	     * // using a customizer callback
	     * var array = ['hello', 'goodbye'];
	     * var other = ['hi', 'goodbye'];
	     *
	     * _.isEqual(array, other, function(value, other) {
	     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
	     *     return true;
	     *   }
	     * });
	     * // => true
	     */
	    function isEqual(value, other, customizer, thisArg) {
	      customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
	      var result = customizer ? customizer(value, other) : undefined;
	      return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
	    }
	
	    /**
	     * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
	     * `SyntaxError`, `TypeError`, or `URIError` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
	     * @example
	     *
	     * _.isError(new Error);
	     * // => true
	     *
	     * _.isError(Error);
	     * // => false
	     */
	    function isError(value) {
	      return isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag;
	    }
	
	    /**
	     * Checks if `value` is a finite primitive number.
	     *
	     * **Note:** This method is based on [`Number.isFinite`](http://ecma-international.org/ecma-262/6.0/#sec-number.isfinite).
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
	     * @example
	     *
	     * _.isFinite(10);
	     * // => true
	     *
	     * _.isFinite('10');
	     * // => false
	     *
	     * _.isFinite(true);
	     * // => false
	     *
	     * _.isFinite(Object(10));
	     * // => false
	     *
	     * _.isFinite(Infinity);
	     * // => false
	     */
	    function isFinite(value) {
	      return typeof value == 'number' && nativeIsFinite(value);
	    }
	
	    /**
	     * Checks if `value` is classified as a `Function` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isFunction(_);
	     * // => true
	     *
	     * _.isFunction(/abc/);
	     * // => false
	     */
	    function isFunction(value) {
	      // The use of `Object#toString` avoids issues with the `typeof` operator
	      // in older versions of Chrome and Safari which return 'function' for regexes
	      // and Safari 8 equivalents which return 'object' for typed array constructors.
	      return isObject(value) && objToString.call(value) == funcTag;
	    }
	
	    /**
	     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	     * @example
	     *
	     * _.isObject({});
	     * // => true
	     *
	     * _.isObject([1, 2, 3]);
	     * // => true
	     *
	     * _.isObject(1);
	     * // => false
	     */
	    function isObject(value) {
	      // Avoid a V8 JIT bug in Chrome 19-20.
	      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	      var type = typeof value;
	      return !!value && (type == 'object' || type == 'function');
	    }
	
	    /**
	     * Performs a deep comparison between `object` and `source` to determine if
	     * `object` contains equivalent property values. If `customizer` is provided
	     * it is invoked to compare values. If `customizer` returns `undefined`
	     * comparisons are handled by the method instead. The `customizer` is bound
	     * to `thisArg` and invoked with three arguments: (value, other, index|key).
	     *
	     * **Note:** This method supports comparing properties of arrays, booleans,
	     * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions
	     * and DOM nodes are **not** supported. Provide a customizer function to extend
	     * support for comparing other values.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {Object} object The object to inspect.
	     * @param {Object} source The object of property values to match.
	     * @param {Function} [customizer] The function to customize value comparisons.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.isMatch(object, { 'age': 40 });
	     * // => true
	     *
	     * _.isMatch(object, { 'age': 36 });
	     * // => false
	     *
	     * // using a customizer callback
	     * var object = { 'greeting': 'hello' };
	     * var source = { 'greeting': 'hi' };
	     *
	     * _.isMatch(object, source, function(value, other) {
	     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;
	     * });
	     * // => true
	     */
	    function isMatch(object, source, customizer, thisArg) {
	      customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
	      return baseIsMatch(object, getMatchData(source), customizer);
	    }
	
	    /**
	     * Checks if `value` is `NaN`.
	     *
	     * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
	     * which returns `true` for `undefined` and other non-numeric values.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
	     * @example
	     *
	     * _.isNaN(NaN);
	     * // => true
	     *
	     * _.isNaN(new Number(NaN));
	     * // => true
	     *
	     * isNaN(undefined);
	     * // => true
	     *
	     * _.isNaN(undefined);
	     * // => false
	     */
	    function isNaN(value) {
	      // An `NaN` primitive is the only value that is not equal to itself.
	      // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
	      return isNumber(value) && value != +value;
	    }
	
	    /**
	     * Checks if `value` is a native function.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	     * @example
	     *
	     * _.isNative(Array.prototype.push);
	     * // => true
	     *
	     * _.isNative(_);
	     * // => false
	     */
	    function isNative(value) {
	      if (value == null) {
	        return false;
	      }
	      if (isFunction(value)) {
	        return reIsNative.test(fnToString.call(value));
	      }
	      return isObjectLike(value) && reIsHostCtor.test(value);
	    }
	
	    /**
	     * Checks if `value` is `null`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
	     * @example
	     *
	     * _.isNull(null);
	     * // => true
	     *
	     * _.isNull(void 0);
	     * // => false
	     */
	    function isNull(value) {
	      return value === null;
	    }
	
	    /**
	     * Checks if `value` is classified as a `Number` primitive or object.
	     *
	     * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
	     * as numbers, use the `_.isFinite` method.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isNumber(8.4);
	     * // => true
	     *
	     * _.isNumber(NaN);
	     * // => true
	     *
	     * _.isNumber('8.4');
	     * // => false
	     */
	    function isNumber(value) {
	      return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
	    }
	
	    /**
	     * Checks if `value` is a plain object, that is, an object created by the
	     * `Object` constructor or one with a `[[Prototype]]` of `null`.
	     *
	     * **Note:** This method assumes objects created by the `Object` constructor
	     * have no inherited enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     * }
	     *
	     * _.isPlainObject(new Foo);
	     * // => false
	     *
	     * _.isPlainObject([1, 2, 3]);
	     * // => false
	     *
	     * _.isPlainObject({ 'x': 0, 'y': 0 });
	     * // => true
	     *
	     * _.isPlainObject(Object.create(null));
	     * // => true
	     */
	    function isPlainObject(value) {
	      var Ctor;
	
	      // Exit early for non `Object` objects.
	      if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
	          (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
	        return false;
	      }
	      // IE < 9 iterates inherited properties before own properties. If the first
	      // iterated property is an object's own property then there are no inherited
	      // enumerable properties.
	      var result;
	      // In most environments an object's own properties are iterated before
	      // its inherited properties. If the last iterated property is an object's
	      // own property then there are no inherited enumerable properties.
	      baseForIn(value, function(subValue, key) {
	        result = key;
	      });
	      return result === undefined || hasOwnProperty.call(value, result);
	    }
	
	    /**
	     * Checks if `value` is classified as a `RegExp` object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isRegExp(/abc/);
	     * // => true
	     *
	     * _.isRegExp('/abc/');
	     * // => false
	     */
	    function isRegExp(value) {
	      return isObject(value) && objToString.call(value) == regexpTag;
	    }
	
	    /**
	     * Checks if `value` is classified as a `String` primitive or object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isString('abc');
	     * // => true
	     *
	     * _.isString(1);
	     * // => false
	     */
	    function isString(value) {
	      return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
	    }
	
	    /**
	     * Checks if `value` is classified as a typed array.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	     * @example
	     *
	     * _.isTypedArray(new Uint8Array);
	     * // => true
	     *
	     * _.isTypedArray([]);
	     * // => false
	     */
	    function isTypedArray(value) {
	      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	    }
	
	    /**
	     * Checks if `value` is `undefined`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to check.
	     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	     * @example
	     *
	     * _.isUndefined(void 0);
	     * // => true
	     *
	     * _.isUndefined(null);
	     * // => false
	     */
	    function isUndefined(value) {
	      return value === undefined;
	    }
	
	    /**
	     * Checks if `value` is less than `other`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is less than `other`, else `false`.
	     * @example
	     *
	     * _.lt(1, 3);
	     * // => true
	     *
	     * _.lt(3, 3);
	     * // => false
	     *
	     * _.lt(3, 1);
	     * // => false
	     */
	    function lt(value, other) {
	      return value < other;
	    }
	
	    /**
	     * Checks if `value` is less than or equal to `other`.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to compare.
	     * @param {*} other The other value to compare.
	     * @returns {boolean} Returns `true` if `value` is less than or equal to `other`, else `false`.
	     * @example
	     *
	     * _.lte(1, 3);
	     * // => true
	     *
	     * _.lte(3, 3);
	     * // => true
	     *
	     * _.lte(3, 1);
	     * // => false
	     */
	    function lte(value, other) {
	      return value <= other;
	    }
	
	    /**
	     * Converts `value` to an array.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Array} Returns the converted array.
	     * @example
	     *
	     * (function() {
	     *   return _.toArray(arguments).slice(1);
	     * }(1, 2, 3));
	     * // => [2, 3]
	     */
	    function toArray(value) {
	      var length = value ? getLength(value) : 0;
	      if (!isLength(length)) {
	        return values(value);
	      }
	      if (!length) {
	        return [];
	      }
	      return arrayCopy(value);
	    }
	
	    /**
	     * Converts `value` to a plain object flattening inherited enumerable
	     * properties of `value` to own properties of the plain object.
	     *
	     * @static
	     * @memberOf _
	     * @category Lang
	     * @param {*} value The value to convert.
	     * @returns {Object} Returns the converted plain object.
	     * @example
	     *
	     * function Foo() {
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.assign({ 'a': 1 }, new Foo);
	     * // => { 'a': 1, 'b': 2 }
	     *
	     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
	     * // => { 'a': 1, 'b': 2, 'c': 3 }
	     */
	    function toPlainObject(value) {
	      return baseCopy(value, keysIn(value));
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Recursively merges own enumerable properties of the source object(s), that
	     * don't resolve to `undefined` into the destination object. Subsequent sources
	     * overwrite property assignments of previous sources. If `customizer` is
	     * provided it is invoked to produce the merged values of the destination and
	     * source properties. If `customizer` returns `undefined` merging is handled
	     * by the method instead. The `customizer` is bound to `thisArg` and invoked
	     * with five arguments: (objectValue, sourceValue, key, object, source).
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var users = {
	     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
	     * };
	     *
	     * var ages = {
	     *   'data': [{ 'age': 36 }, { 'age': 40 }]
	     * };
	     *
	     * _.merge(users, ages);
	     * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
	     *
	     * // using a customizer callback
	     * var object = {
	     *   'fruits': ['apple'],
	     *   'vegetables': ['beet']
	     * };
	     *
	     * var other = {
	     *   'fruits': ['banana'],
	     *   'vegetables': ['carrot']
	     * };
	     *
	     * _.merge(object, other, function(a, b) {
	     *   if (_.isArray(a)) {
	     *     return a.concat(b);
	     *   }
	     * });
	     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
	     */
	    var merge = createAssigner(baseMerge);
	
	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object. Subsequent sources overwrite property assignments of previous sources.
	     * If `customizer` is provided it is invoked to produce the assigned values.
	     * The `customizer` is bound to `thisArg` and invoked with five arguments:
	     * (objectValue, sourceValue, key, object, source).
	     *
	     * **Note:** This method mutates `object` and is based on
	     * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
	     *
	     * @static
	     * @memberOf _
	     * @alias extend
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @param {Function} [customizer] The function to customize assigned values.
	     * @param {*} [thisArg] The `this` binding of `customizer`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	     * // => { 'user': 'fred', 'age': 40 }
	     *
	     * // using a customizer callback
	     * var defaults = _.partialRight(_.assign, function(value, other) {
	     *   return _.isUndefined(value) ? other : value;
	     * });
	     *
	     * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	     * // => { 'user': 'barney', 'age': 36 }
	     */
	    var assign = createAssigner(function(object, source, customizer) {
	      return customizer
	        ? assignWith(object, source, customizer)
	        : baseAssign(object, source);
	    });
	
	    /**
	     * Creates an object that inherits from the given `prototype` object. If a
	     * `properties` object is provided its own enumerable properties are assigned
	     * to the created object.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} prototype The object to inherit from.
	     * @param {Object} [properties] The properties to assign to the object.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * function Shape() {
	     *   this.x = 0;
	     *   this.y = 0;
	     * }
	     *
	     * function Circle() {
	     *   Shape.call(this);
	     * }
	     *
	     * Circle.prototype = _.create(Shape.prototype, {
	     *   'constructor': Circle
	     * });
	     *
	     * var circle = new Circle;
	     * circle instanceof Circle;
	     * // => true
	     *
	     * circle instanceof Shape;
	     * // => true
	     */
	    function create(prototype, properties, guard) {
	      var result = baseCreate(prototype);
	      if (guard && isIterateeCall(prototype, properties, guard)) {
	        properties = undefined;
	      }
	      return properties ? baseAssign(result, properties) : result;
	    }
	
	    /**
	     * Assigns own enumerable properties of source object(s) to the destination
	     * object for all destination properties that resolve to `undefined`. Once a
	     * property is set, additional values of the same property are ignored.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	     * // => { 'user': 'barney', 'age': 36 }
	     */
	    var defaults = createDefaults(assign, assignDefaults);
	
	    /**
	     * This method is like `_.defaults` except that it recursively assigns
	     * default properties.
	     *
	     * **Note:** This method mutates `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The destination object.
	     * @param {...Object} [sources] The source objects.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * _.defaultsDeep({ 'user': { 'name': 'barney' } }, { 'user': { 'name': 'fred', 'age': 36 } });
	     * // => { 'user': { 'name': 'barney', 'age': 36 } }
	     *
	     */
	    var defaultsDeep = createDefaults(merge, mergeDefaults);
	
	    /**
	     * This method is like `_.find` except that it returns the key of the first
	     * element `predicate` returns truthy for instead of the element itself.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findKey(users, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => 'barney' (iteration order is not guaranteed)
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findKey(users, { 'age': 1, 'active': true });
	     * // => 'pebbles'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findKey(users, 'active', false);
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.findKey(users, 'active');
	     * // => 'barney'
	     */
	    var findKey = createFindKey(baseForOwn);
	
	    /**
	     * This method is like `_.findKey` except that it iterates over elements of
	     * a collection in the opposite order.
	     *
	     * If a property name is provided for `predicate` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `predicate` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to search.
	     * @param {Function|Object|string} [predicate=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
	     * @example
	     *
	     * var users = {
	     *   'barney':  { 'age': 36, 'active': true },
	     *   'fred':    { 'age': 40, 'active': false },
	     *   'pebbles': { 'age': 1,  'active': true }
	     * };
	     *
	     * _.findLastKey(users, function(chr) {
	     *   return chr.age < 40;
	     * });
	     * // => returns `pebbles` assuming `_.findKey` returns `barney`
	     *
	     * // using the `_.matches` callback shorthand
	     * _.findLastKey(users, { 'age': 36, 'active': true });
	     * // => 'barney'
	     *
	     * // using the `_.matchesProperty` callback shorthand
	     * _.findLastKey(users, 'active', false);
	     * // => 'fred'
	     *
	     * // using the `_.property` callback shorthand
	     * _.findLastKey(users, 'active');
	     * // => 'pebbles'
	     */
	    var findLastKey = createFindKey(baseForOwnRight);
	
	    /**
	     * Iterates over own and inherited enumerable properties of an object invoking
	     * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
	     * with three arguments: (value, key, object). Iteratee functions may exit
	     * iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forIn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
	     */
	    var forIn = createForIn(baseFor);
	
	    /**
	     * This method is like `_.forIn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forInRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'
	     */
	    var forInRight = createForIn(baseForRight);
	
	    /**
	     * Iterates over own enumerable properties of an object invoking `iteratee`
	     * for each property. The `iteratee` is bound to `thisArg` and invoked with
	     * three arguments: (value, key, object). Iteratee functions may exit iteration
	     * early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwn(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'a' and 'b' (iteration order is not guaranteed)
	     */
	    var forOwn = createForOwn(baseForOwn);
	
	    /**
	     * This method is like `_.forOwn` except that it iterates over properties of
	     * `object` in the opposite order.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.forOwnRight(new Foo, function(value, key) {
	     *   console.log(key);
	     * });
	     * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'
	     */
	    var forOwnRight = createForOwn(baseForOwnRight);
	
	    /**
	     * Creates an array of function property names from all enumerable properties,
	     * own and inherited, of `object`.
	     *
	     * @static
	     * @memberOf _
	     * @alias methods
	     * @category Object
	     * @param {Object} object The object to inspect.
	     * @returns {Array} Returns the new array of property names.
	     * @example
	     *
	     * _.functions(_);
	     * // => ['after', 'ary', 'assign', ...]
	     */
	    function functions(object) {
	      return baseFunctions(object, keysIn(object));
	    }
	
	    /**
	     * Gets the property value at `path` of `object`. If the resolved value is
	     * `undefined` the `defaultValue` is used in its place.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the property to get.
	     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	     *
	     * _.get(object, 'a[0].b.c');
	     * // => 3
	     *
	     * _.get(object, ['a', '0', 'b', 'c']);
	     * // => 3
	     *
	     * _.get(object, 'a.b.c', 'default');
	     * // => 'default'
	     */
	    function get(object, path, defaultValue) {
	      var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
	      return result === undefined ? defaultValue : result;
	    }
	
	    /**
	     * Checks if `path` is a direct property.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path to check.
	     * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
	     * @example
	     *
	     * var object = { 'a': { 'b': { 'c': 3 } } };
	     *
	     * _.has(object, 'a');
	     * // => true
	     *
	     * _.has(object, 'a.b.c');
	     * // => true
	     *
	     * _.has(object, ['a', 'b', 'c']);
	     * // => true
	     */
	    function has(object, path) {
	      if (object == null) {
	        return false;
	      }
	      var result = hasOwnProperty.call(object, path);
	      if (!result && !isKey(path)) {
	        path = toPath(path);
	        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	        if (object == null) {
	          return false;
	        }
	        path = last(path);
	        result = hasOwnProperty.call(object, path);
	      }
	      return result || (isLength(object.length) && isIndex(path, object.length) &&
	        (isArray(object) || isArguments(object)));
	    }
	
	    /**
	     * Creates an object composed of the inverted keys and values of `object`.
	     * If `object` contains duplicate values, subsequent values overwrite property
	     * assignments of previous values unless `multiValue` is `true`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to invert.
	     * @param {boolean} [multiValue] Allow multiple values per key.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Object} Returns the new inverted object.
	     * @example
	     *
	     * var object = { 'a': 1, 'b': 2, 'c': 1 };
	     *
	     * _.invert(object);
	     * // => { '1': 'c', '2': 'b' }
	     *
	     * // with `multiValue`
	     * _.invert(object, true);
	     * // => { '1': ['a', 'c'], '2': ['b'] }
	     */
	    function invert(object, multiValue, guard) {
	      if (guard && isIterateeCall(object, multiValue, guard)) {
	        multiValue = undefined;
	      }
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = {};
	
	      while (++index < length) {
	        var key = props[index],
	            value = object[key];
	
	        if (multiValue) {
	          if (hasOwnProperty.call(result, value)) {
	            result[value].push(key);
	          } else {
	            result[value] = [key];
	          }
	        }
	        else {
	          result[value] = key;
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Creates an array of the own enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects. See the
	     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	     * for more details.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keys(new Foo);
	     * // => ['a', 'b'] (iteration order is not guaranteed)
	     *
	     * _.keys('hi');
	     * // => ['0', '1']
	     */
	    var keys = !nativeKeys ? shimKeys : function(object) {
	      var Ctor = object == null ? undefined : object.constructor;
	      if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	          (typeof object != 'function' && isArrayLike(object))) {
	        return shimKeys(object);
	      }
	      return isObject(object) ? nativeKeys(object) : [];
	    };
	
	    /**
	     * Creates an array of the own and inherited enumerable property names of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property names.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.keysIn(new Foo);
	     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	     */
	    function keysIn(object) {
	      if (object == null) {
	        return [];
	      }
	      if (!isObject(object)) {
	        object = Object(object);
	      }
	      var length = object.length;
	      length = (length && isLength(length) &&
	        (isArray(object) || isArguments(object)) && length) || 0;
	
	      var Ctor = object.constructor,
	          index = -1,
	          isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	          result = Array(length),
	          skipIndexes = length > 0;
	
	      while (++index < length) {
	        result[index] = (index + '');
	      }
	      for (var key in object) {
	        if (!(skipIndexes && isIndex(key, length)) &&
	            !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	          result.push(key);
	        }
	      }
	      return result;
	    }
	
	    /**
	     * The opposite of `_.mapValues`; this method creates an object with the
	     * same values as `object` and keys generated by running each own enumerable
	     * property of `object` through `iteratee`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the new mapped object.
	     * @example
	     *
	     * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
	     *   return key + value;
	     * });
	     * // => { 'a1': 1, 'b2': 2 }
	     */
	    var mapKeys = createObjectMapper(true);
	
	    /**
	     * Creates an object with the same keys as `object` and values generated by
	     * running each own enumerable property of `object` through `iteratee`. The
	     * iteratee function is bound to `thisArg` and invoked with three arguments:
	     * (value, key, object).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to iterate over.
	     * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	     *  per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Object} Returns the new mapped object.
	     * @example
	     *
	     * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
	     *   return n * 3;
	     * });
	     * // => { 'a': 3, 'b': 6 }
	     *
	     * var users = {
	     *   'fred':    { 'user': 'fred',    'age': 40 },
	     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
	     * };
	     *
	     * // using the `_.property` callback shorthand
	     * _.mapValues(users, 'age');
	     * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
	     */
	    var mapValues = createObjectMapper();
	
	    /**
	     * The opposite of `_.pick`; this method creates an object composed of the
	     * own and inherited enumerable properties of `object` that are not omitted.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function|...(string|string[])} [predicate] The function invoked per
	     *  iteration or property names to omit, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.omit(object, 'age');
	     * // => { 'user': 'fred' }
	     *
	     * _.omit(object, _.isNumber);
	     * // => { 'user': 'fred' }
	     */
	    var omit = restParam(function(object, props) {
	      if (object == null) {
	        return {};
	      }
	      if (typeof props[0] != 'function') {
	        var props = arrayMap(baseFlatten(props), String);
	        return pickByArray(object, baseDifference(keysIn(object), props));
	      }
	      var predicate = bindCallback(props[0], props[1], 3);
	      return pickByCallback(object, function(value, key, object) {
	        return !predicate(value, key, object);
	      });
	    });
	
	    /**
	     * Creates a two dimensional array of the key-value pairs for `object`,
	     * e.g. `[[key1, value1], [key2, value2]]`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the new array of key-value pairs.
	     * @example
	     *
	     * _.pairs({ 'barney': 36, 'fred': 40 });
	     * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	     */
	    function pairs(object) {
	      object = toObject(object);
	
	      var index = -1,
	          props = keys(object),
	          length = props.length,
	          result = Array(length);
	
	      while (++index < length) {
	        var key = props[index];
	        result[index] = [key, object[key]];
	      }
	      return result;
	    }
	
	    /**
	     * Creates an object composed of the picked `object` properties. Property
	     * names may be specified as individual arguments or as arrays of property
	     * names. If `predicate` is provided it is invoked for each property of `object`
	     * picking the properties `predicate` returns truthy for. The predicate is
	     * bound to `thisArg` and invoked with three arguments: (value, key, object).
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The source object.
	     * @param {Function|...(string|string[])} [predicate] The function invoked per
	     *  iteration or property names to pick, specified as individual property
	     *  names or arrays of property names.
	     * @param {*} [thisArg] The `this` binding of `predicate`.
	     * @returns {Object} Returns the new object.
	     * @example
	     *
	     * var object = { 'user': 'fred', 'age': 40 };
	     *
	     * _.pick(object, 'user');
	     * // => { 'user': 'fred' }
	     *
	     * _.pick(object, _.isString);
	     * // => { 'user': 'fred' }
	     */
	    var pick = restParam(function(object, props) {
	      if (object == null) {
	        return {};
	      }
	      return typeof props[0] == 'function'
	        ? pickByCallback(object, bindCallback(props[0], props[1], 3))
	        : pickByArray(object, baseFlatten(props));
	    });
	
	    /**
	     * This method is like `_.get` except that if the resolved value is a function
	     * it is invoked with the `this` binding of its parent object and its result
	     * is returned.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @param {Array|string} path The path of the property to resolve.
	     * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
	     * @returns {*} Returns the resolved value.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
	     *
	     * _.result(object, 'a[0].b.c1');
	     * // => 3
	     *
	     * _.result(object, 'a[0].b.c2');
	     * // => 4
	     *
	     * _.result(object, 'a.b.c', 'default');
	     * // => 'default'
	     *
	     * _.result(object, 'a.b.c', _.constant('default'));
	     * // => 'default'
	     */
	    function result(object, path, defaultValue) {
	      var result = object == null ? undefined : object[path];
	      if (result === undefined) {
	        if (object != null && !isKey(path, object)) {
	          path = toPath(path);
	          object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	          result = object == null ? undefined : object[last(path)];
	        }
	        result = result === undefined ? defaultValue : result;
	      }
	      return isFunction(result) ? result.call(object) : result;
	    }
	
	    /**
	     * Sets the property value of `path` on `object`. If a portion of `path`
	     * does not exist it is created.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to augment.
	     * @param {Array|string} path The path of the property to set.
	     * @param {*} value The value to set.
	     * @returns {Object} Returns `object`.
	     * @example
	     *
	     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
	     *
	     * _.set(object, 'a[0].b.c', 4);
	     * console.log(object.a[0].b.c);
	     * // => 4
	     *
	     * _.set(object, 'x[0].y.z', 5);
	     * console.log(object.x[0].y.z);
	     * // => 5
	     */
	    function set(object, path, value) {
	      if (object == null) {
	        return object;
	      }
	      var pathKey = (path + '');
	      path = (object[pathKey] != null || isKey(path, object)) ? [pathKey] : toPath(path);
	
	      var index = -1,
	          length = path.length,
	          lastIndex = length - 1,
	          nested = object;
	
	      while (nested != null && ++index < length) {
	        var key = path[index];
	        if (isObject(nested)) {
	          if (index == lastIndex) {
	            nested[key] = value;
	          } else if (nested[key] == null) {
	            nested[key] = isIndex(path[index + 1]) ? [] : {};
	          }
	        }
	        nested = nested[key];
	      }
	      return object;
	    }
	
	    /**
	     * An alternative to `_.reduce`; this method transforms `object` to a new
	     * `accumulator` object which is the result of running each of its own enumerable
	     * properties through `iteratee`, with each invocation potentially mutating
	     * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
	     * with four arguments: (accumulator, value, key, object). Iteratee functions
	     * may exit iteration early by explicitly returning `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Array|Object} object The object to iterate over.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [accumulator] The custom accumulator value.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the accumulated value.
	     * @example
	     *
	     * _.transform([2, 3, 4], function(result, n) {
	     *   result.push(n *= n);
	     *   return n % 2 == 0;
	     * });
	     * // => [4, 9]
	     *
	     * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
	     *   result[key] = n * 3;
	     * });
	     * // => { 'a': 3, 'b': 6 }
	     */
	    function transform(object, iteratee, accumulator, thisArg) {
	      var isArr = isArray(object) || isTypedArray(object);
	      iteratee = getCallback(iteratee, thisArg, 4);
	
	      if (accumulator == null) {
	        if (isArr || isObject(object)) {
	          var Ctor = object.constructor;
	          if (isArr) {
	            accumulator = isArray(object) ? new Ctor : [];
	          } else {
	            accumulator = baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
	          }
	        } else {
	          accumulator = {};
	        }
	      }
	      (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
	        return iteratee(accumulator, value, index, object);
	      });
	      return accumulator;
	    }
	
	    /**
	     * Creates an array of the own enumerable property values of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.values(new Foo);
	     * // => [1, 2] (iteration order is not guaranteed)
	     *
	     * _.values('hi');
	     * // => ['h', 'i']
	     */
	    function values(object) {
	      return baseValues(object, keys(object));
	    }
	
	    /**
	     * Creates an array of the own and inherited enumerable property values
	     * of `object`.
	     *
	     * **Note:** Non-object values are coerced to objects.
	     *
	     * @static
	     * @memberOf _
	     * @category Object
	     * @param {Object} object The object to query.
	     * @returns {Array} Returns the array of property values.
	     * @example
	     *
	     * function Foo() {
	     *   this.a = 1;
	     *   this.b = 2;
	     * }
	     *
	     * Foo.prototype.c = 3;
	     *
	     * _.valuesIn(new Foo);
	     * // => [1, 2, 3] (iteration order is not guaranteed)
	     */
	    function valuesIn(object) {
	      return baseValues(object, keysIn(object));
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Checks if `n` is between `start` and up to but not including, `end`. If
	     * `end` is not specified it is set to `start` with `start` then set to `0`.
	     *
	     * @static
	     * @memberOf _
	     * @category Number
	     * @param {number} n The number to check.
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @returns {boolean} Returns `true` if `n` is in the range, else `false`.
	     * @example
	     *
	     * _.inRange(3, 2, 4);
	     * // => true
	     *
	     * _.inRange(4, 8);
	     * // => true
	     *
	     * _.inRange(4, 2);
	     * // => false
	     *
	     * _.inRange(2, 2);
	     * // => false
	     *
	     * _.inRange(1.2, 2);
	     * // => true
	     *
	     * _.inRange(5.2, 4);
	     * // => false
	     */
	    function inRange(value, start, end) {
	      start = +start || 0;
	      if (end === undefined) {
	        end = start;
	        start = 0;
	      } else {
	        end = +end || 0;
	      }
	      return value >= nativeMin(start, end) && value < nativeMax(start, end);
	    }
	
	    /**
	     * Produces a random number between `min` and `max` (inclusive). If only one
	     * argument is provided a number between `0` and the given number is returned.
	     * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
	     * number is returned instead of an integer.
	     *
	     * @static
	     * @memberOf _
	     * @category Number
	     * @param {number} [min=0] The minimum possible value.
	     * @param {number} [max=1] The maximum possible value.
	     * @param {boolean} [floating] Specify returning a floating-point number.
	     * @returns {number} Returns the random number.
	     * @example
	     *
	     * _.random(0, 5);
	     * // => an integer between 0 and 5
	     *
	     * _.random(5);
	     * // => also an integer between 0 and 5
	     *
	     * _.random(5, true);
	     * // => a floating-point number between 0 and 5
	     *
	     * _.random(1.2, 5.2);
	     * // => a floating-point number between 1.2 and 5.2
	     */
	    function random(min, max, floating) {
	      if (floating && isIterateeCall(min, max, floating)) {
	        max = floating = undefined;
	      }
	      var noMin = min == null,
	          noMax = max == null;
	
	      if (floating == null) {
	        if (noMax && typeof min == 'boolean') {
	          floating = min;
	          min = 1;
	        }
	        else if (typeof max == 'boolean') {
	          floating = max;
	          noMax = true;
	        }
	      }
	      if (noMin && noMax) {
	        max = 1;
	        noMax = false;
	      }
	      min = +min || 0;
	      if (noMax) {
	        max = min;
	        min = 0;
	      } else {
	        max = +max || 0;
	      }
	      if (floating || min % 1 || max % 1) {
	        var rand = nativeRandom();
	        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
	      }
	      return baseRandom(min, max);
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the camel cased string.
	     * @example
	     *
	     * _.camelCase('Foo Bar');
	     * // => 'fooBar'
	     *
	     * _.camelCase('--foo-bar');
	     * // => 'fooBar'
	     *
	     * _.camelCase('__foo_bar__');
	     * // => 'fooBar'
	     */
	    var camelCase = createCompounder(function(result, word, index) {
	      word = word.toLowerCase();
	      return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);
	    });
	
	    /**
	     * Capitalizes the first character of `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to capitalize.
	     * @returns {string} Returns the capitalized string.
	     * @example
	     *
	     * _.capitalize('fred');
	     * // => 'Fred'
	     */
	    function capitalize(string) {
	      string = baseToString(string);
	      return string && (string.charAt(0).toUpperCase() + string.slice(1));
	    }
	
	    /**
	     * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	     * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to deburr.
	     * @returns {string} Returns the deburred string.
	     * @example
	     *
	     * _.deburr('déjà vu');
	     * // => 'deja vu'
	     */
	    function deburr(string) {
	      string = baseToString(string);
	      return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
	    }
	
	    /**
	     * Checks if `string` ends with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to search.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=string.length] The position to search from.
	     * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
	     * @example
	     *
	     * _.endsWith('abc', 'c');
	     * // => true
	     *
	     * _.endsWith('abc', 'b');
	     * // => false
	     *
	     * _.endsWith('abc', 'b', 2);
	     * // => true
	     */
	    function endsWith(string, target, position) {
	      string = baseToString(string);
	      target = (target + '');
	
	      var length = string.length;
	      position = position === undefined
	        ? length
	        : nativeMin(position < 0 ? 0 : (+position || 0), length);
	
	      position -= target.length;
	      return position >= 0 && string.indexOf(target, position) == position;
	    }
	
	    /**
	     * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
	     * their corresponding HTML entities.
	     *
	     * **Note:** No other characters are escaped. To escape additional characters
	     * use a third-party library like [_he_](https://mths.be/he).
	     *
	     * Though the ">" character is escaped for symmetry, characters like
	     * ">" and "/" don't need escaping in HTML and have no special meaning
	     * unless they're part of a tag or unquoted attribute value.
	     * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
	     * (under "semi-related fun fact") for more details.
	     *
	     * Backticks are escaped because in Internet Explorer < 9, they can break out
	     * of attribute values or HTML comments. See [#59](https://html5sec.org/#59),
	     * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
	     * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
	     * for more details.
	     *
	     * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
	     * to reduce XSS vectors.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escape('fred, barney, & pebbles');
	     * // => 'fred, barney, &amp; pebbles'
	     */
	    function escape(string) {
	      // Reset `lastIndex` because in IE < 9 `String#replace` does not.
	      string = baseToString(string);
	      return (string && reHasUnescapedHtml.test(string))
	        ? string.replace(reUnescapedHtml, escapeHtmlChar)
	        : string;
	    }
	
	    /**
	     * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
	     * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to escape.
	     * @returns {string} Returns the escaped string.
	     * @example
	     *
	     * _.escapeRegExp('[lodash](https://lodash.com/)');
	     * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
	     */
	    function escapeRegExp(string) {
	      string = baseToString(string);
	      return (string && reHasRegExpChars.test(string))
	        ? string.replace(reRegExpChars, escapeRegExpChar)
	        : (string || '(?:)');
	    }
	
	    /**
	     * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the kebab cased string.
	     * @example
	     *
	     * _.kebabCase('Foo Bar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('fooBar');
	     * // => 'foo-bar'
	     *
	     * _.kebabCase('__foo_bar__');
	     * // => 'foo-bar'
	     */
	    var kebabCase = createCompounder(function(result, word, index) {
	      return result + (index ? '-' : '') + word.toLowerCase();
	    });
	
	    /**
	     * Pads `string` on the left and right sides if it's shorter than `length`.
	     * Padding characters are truncated if they can't be evenly divided by `length`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.pad('abc', 8);
	     * // => '  abc   '
	     *
	     * _.pad('abc', 8, '_-');
	     * // => '_-abc_-_'
	     *
	     * _.pad('abc', 3);
	     * // => 'abc'
	     */
	    function pad(string, length, chars) {
	      string = baseToString(string);
	      length = +length;
	
	      var strLength = string.length;
	      if (strLength >= length || !nativeIsFinite(length)) {
	        return string;
	      }
	      var mid = (length - strLength) / 2,
	          leftLength = nativeFloor(mid),
	          rightLength = nativeCeil(mid);
	
	      chars = createPadding('', rightLength, chars);
	      return chars.slice(0, leftLength) + string + chars;
	    }
	
	    /**
	     * Pads `string` on the left side if it's shorter than `length`. Padding
	     * characters are truncated if they exceed `length`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padLeft('abc', 6);
	     * // => '   abc'
	     *
	     * _.padLeft('abc', 6, '_-');
	     * // => '_-_abc'
	     *
	     * _.padLeft('abc', 3);
	     * // => 'abc'
	     */
	    var padLeft = createPadDir();
	
	    /**
	     * Pads `string` on the right side if it's shorter than `length`. Padding
	     * characters are truncated if they exceed `length`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to pad.
	     * @param {number} [length=0] The padding length.
	     * @param {string} [chars=' '] The string used as padding.
	     * @returns {string} Returns the padded string.
	     * @example
	     *
	     * _.padRight('abc', 6);
	     * // => 'abc   '
	     *
	     * _.padRight('abc', 6, '_-');
	     * // => 'abc_-_'
	     *
	     * _.padRight('abc', 3);
	     * // => 'abc'
	     */
	    var padRight = createPadDir(true);
	
	    /**
	     * Converts `string` to an integer of the specified radix. If `radix` is
	     * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,
	     * in which case a `radix` of `16` is used.
	     *
	     * **Note:** This method aligns with the [ES5 implementation](https://es5.github.io/#E)
	     * of `parseInt`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} string The string to convert.
	     * @param {number} [radix] The radix to interpret `value` by.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {number} Returns the converted integer.
	     * @example
	     *
	     * _.parseInt('08');
	     * // => 8
	     *
	     * _.map(['6', '08', '10'], _.parseInt);
	     * // => [6, 8, 10]
	     */
	    function parseInt(string, radix, guard) {
	      // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.
	      // Chrome fails to trim leading <BOM> whitespace characters.
	      // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.
	      if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
	        radix = 0;
	      } else if (radix) {
	        radix = +radix;
	      }
	      string = trim(string);
	      return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
	    }
	
	    /**
	     * Repeats the given string `n` times.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to repeat.
	     * @param {number} [n=0] The number of times to repeat the string.
	     * @returns {string} Returns the repeated string.
	     * @example
	     *
	     * _.repeat('*', 3);
	     * // => '***'
	     *
	     * _.repeat('abc', 2);
	     * // => 'abcabc'
	     *
	     * _.repeat('abc', 0);
	     * // => ''
	     */
	    function repeat(string, n) {
	      var result = '';
	      string = baseToString(string);
	      n = +n;
	      if (n < 1 || !string || !nativeIsFinite(n)) {
	        return result;
	      }
	      // Leverage the exponentiation by squaring algorithm for a faster repeat.
	      // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
	      do {
	        if (n % 2) {
	          result += string;
	        }
	        n = nativeFloor(n / 2);
	        string += string;
	      } while (n);
	
	      return result;
	    }
	
	    /**
	     * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the snake cased string.
	     * @example
	     *
	     * _.snakeCase('Foo Bar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('fooBar');
	     * // => 'foo_bar'
	     *
	     * _.snakeCase('--foo-bar');
	     * // => 'foo_bar'
	     */
	    var snakeCase = createCompounder(function(result, word, index) {
	      return result + (index ? '_' : '') + word.toLowerCase();
	    });
	
	    /**
	     * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to convert.
	     * @returns {string} Returns the start cased string.
	     * @example
	     *
	     * _.startCase('--foo-bar');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('fooBar');
	     * // => 'Foo Bar'
	     *
	     * _.startCase('__foo_bar__');
	     * // => 'Foo Bar'
	     */
	    var startCase = createCompounder(function(result, word, index) {
	      return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
	    });
	
	    /**
	     * Checks if `string` starts with the given target string.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to search.
	     * @param {string} [target] The string to search for.
	     * @param {number} [position=0] The position to search from.
	     * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.
	     * @example
	     *
	     * _.startsWith('abc', 'a');
	     * // => true
	     *
	     * _.startsWith('abc', 'b');
	     * // => false
	     *
	     * _.startsWith('abc', 'b', 1);
	     * // => true
	     */
	    function startsWith(string, target, position) {
	      string = baseToString(string);
	      position = position == null
	        ? 0
	        : nativeMin(position < 0 ? 0 : (+position || 0), string.length);
	
	      return string.lastIndexOf(target, position) == position;
	    }
	
	    /**
	     * Creates a compiled template function that can interpolate data properties
	     * in "interpolate" delimiters, HTML-escape interpolated data properties in
	     * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
	     * properties may be accessed as free variables in the template. If a setting
	     * object is provided it takes precedence over `_.templateSettings` values.
	     *
	     * **Note:** In the development build `_.template` utilizes
	     * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
	     * for easier debugging.
	     *
	     * For more information on precompiling templates see
	     * [lodash's custom builds documentation](https://lodash.com/custom-builds).
	     *
	     * For more information on Chrome extension sandboxes see
	     * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The template string.
	     * @param {Object} [options] The options object.
	     * @param {RegExp} [options.escape] The HTML "escape" delimiter.
	     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
	     * @param {Object} [options.imports] An object to import into the template as free variables.
	     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
	     * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
	     * @param {string} [options.variable] The data object variable name.
	     * @param- {Object} [otherOptions] Enables the legacy `options` param signature.
	     * @returns {Function} Returns the compiled template function.
	     * @example
	     *
	     * // using the "interpolate" delimiter to create a compiled template
	     * var compiled = _.template('hello <%= user %>!');
	     * compiled({ 'user': 'fred' });
	     * // => 'hello fred!'
	     *
	     * // using the HTML "escape" delimiter to escape data property values
	     * var compiled = _.template('<b><%- value %></b>');
	     * compiled({ 'value': '<script>' });
	     * // => '<b>&lt;script&gt;</b>'
	     *
	     * // using the "evaluate" delimiter to execute JavaScript and generate HTML
	     * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the internal `print` function in "evaluate" delimiters
	     * var compiled = _.template('<% print("hello " + user); %>!');
	     * compiled({ 'user': 'barney' });
	     * // => 'hello barney!'
	     *
	     * // using the ES delimiter as an alternative to the default "interpolate" delimiter
	     * var compiled = _.template('hello ${ user }!');
	     * compiled({ 'user': 'pebbles' });
	     * // => 'hello pebbles!'
	     *
	     * // using custom template delimiters
	     * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
	     * var compiled = _.template('hello {{ user }}!');
	     * compiled({ 'user': 'mustache' });
	     * // => 'hello mustache!'
	     *
	     * // using backslashes to treat delimiters as plain text
	     * var compiled = _.template('<%= "\\<%- value %\\>" %>');
	     * compiled({ 'value': 'ignored' });
	     * // => '<%- value %>'
	     *
	     * // using the `imports` option to import `jQuery` as `jq`
	     * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
	     * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
	     * compiled({ 'users': ['fred', 'barney'] });
	     * // => '<li>fred</li><li>barney</li>'
	     *
	     * // using the `sourceURL` option to specify a custom sourceURL for the template
	     * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
	     * compiled(data);
	     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
	     *
	     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
	     * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
	     * compiled.source;
	     * // => function(data) {
	     * //   var __t, __p = '';
	     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
	     * //   return __p;
	     * // }
	     *
	     * // using the `source` property to inline compiled templates for meaningful
	     * // line numbers in error messages and a stack trace
	     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
	     *   var JST = {\
	     *     "main": ' + _.template(mainText).source + '\
	     *   };\
	     * ');
	     */
	    function template(string, options, otherOptions) {
	      // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
	      // and Laura Doktorova's doT.js (https://github.com/olado/doT).
	      var settings = lodash.templateSettings;
	
	      if (otherOptions && isIterateeCall(string, options, otherOptions)) {
	        options = otherOptions = undefined;
	      }
	      string = baseToString(string);
	      options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);
	
	      var imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
	          importsKeys = keys(imports),
	          importsValues = baseValues(imports, importsKeys);
	
	      var isEscaping,
	          isEvaluating,
	          index = 0,
	          interpolate = options.interpolate || reNoMatch,
	          source = "__p += '";
	
	      // Compile the regexp to match each delimiter.
	      var reDelimiters = RegExp(
	        (options.escape || reNoMatch).source + '|' +
	        interpolate.source + '|' +
	        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
	        (options.evaluate || reNoMatch).source + '|$'
	      , 'g');
	
	      // Use a sourceURL for easier debugging.
	      var sourceURL = '//# sourceURL=' +
	        ('sourceURL' in options
	          ? options.sourceURL
	          : ('lodash.templateSources[' + (++templateCounter) + ']')
	        ) + '\n';
	
	      string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
	        interpolateValue || (interpolateValue = esTemplateValue);
	
	        // Escape characters that can't be included in string literals.
	        source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
	
	        // Replace delimiters with snippets.
	        if (escapeValue) {
	          isEscaping = true;
	          source += "' +\n__e(" + escapeValue + ") +\n'";
	        }
	        if (evaluateValue) {
	          isEvaluating = true;
	          source += "';\n" + evaluateValue + ";\n__p += '";
	        }
	        if (interpolateValue) {
	          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
	        }
	        index = offset + match.length;
	
	        // The JS engine embedded in Adobe products requires returning the `match`
	        // string in order to produce the correct `offset` value.
	        return match;
	      });
	
	      source += "';\n";
	
	      // If `variable` is not specified wrap a with-statement around the generated
	      // code to add the data object to the top of the scope chain.
	      var variable = options.variable;
	      if (!variable) {
	        source = 'with (obj) {\n' + source + '\n}\n';
	      }
	      // Cleanup code by stripping empty strings.
	      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
	        .replace(reEmptyStringMiddle, '$1')
	        .replace(reEmptyStringTrailing, '$1;');
	
	      // Frame code as the function body.
	      source = 'function(' + (variable || 'obj') + ') {\n' +
	        (variable
	          ? ''
	          : 'obj || (obj = {});\n'
	        ) +
	        "var __t, __p = ''" +
	        (isEscaping
	           ? ', __e = _.escape'
	           : ''
	        ) +
	        (isEvaluating
	          ? ', __j = Array.prototype.join;\n' +
	            "function print() { __p += __j.call(arguments, '') }\n"
	          : ';\n'
	        ) +
	        source +
	        'return __p\n}';
	
	      var result = attempt(function() {
	        return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
	      });
	
	      // Provide the compiled function's source by its `toString` method or
	      // the `source` property as a convenience for inlining compiled templates.
	      result.source = source;
	      if (isError(result)) {
	        throw result;
	      }
	      return result;
	    }
	
	    /**
	     * Removes leading and trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trim('  abc  ');
	     * // => 'abc'
	     *
	     * _.trim('-_-abc-_-', '_-');
	     * // => 'abc'
	     *
	     * _.map(['  foo  ', '  bar  '], _.trim);
	     * // => ['foo', 'bar']
	     */
	    function trim(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
	      }
	      chars = (chars + '');
	      return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
	    }
	
	    /**
	     * Removes leading whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimLeft('  abc  ');
	     * // => 'abc  '
	     *
	     * _.trimLeft('-_-abc-_-', '_-');
	     * // => 'abc-_-'
	     */
	    function trimLeft(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(trimmedLeftIndex(string));
	      }
	      return string.slice(charsLeftIndex(string, (chars + '')));
	    }
	
	    /**
	     * Removes trailing whitespace or specified characters from `string`.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to trim.
	     * @param {string} [chars=whitespace] The characters to trim.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the trimmed string.
	     * @example
	     *
	     * _.trimRight('  abc  ');
	     * // => '  abc'
	     *
	     * _.trimRight('-_-abc-_-', '_-');
	     * // => '-_-abc'
	     */
	    function trimRight(string, chars, guard) {
	      var value = string;
	      string = baseToString(string);
	      if (!string) {
	        return string;
	      }
	      if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
	        return string.slice(0, trimmedRightIndex(string) + 1);
	      }
	      return string.slice(0, charsRightIndex(string, (chars + '')) + 1);
	    }
	
	    /**
	     * Truncates `string` if it's longer than the given maximum string length.
	     * The last characters of the truncated string are replaced with the omission
	     * string which defaults to "...".
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to truncate.
	     * @param {Object|number} [options] The options object or maximum string length.
	     * @param {number} [options.length=30] The maximum string length.
	     * @param {string} [options.omission='...'] The string to indicate text is omitted.
	     * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {string} Returns the truncated string.
	     * @example
	     *
	     * _.trunc('hi-diddly-ho there, neighborino');
	     * // => 'hi-diddly-ho there, neighbo...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', 24);
	     * // => 'hi-diddly-ho there, n...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': ' '
	     * });
	     * // => 'hi-diddly-ho there,...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'length': 24,
	     *   'separator': /,? +/
	     * });
	     * // => 'hi-diddly-ho there...'
	     *
	     * _.trunc('hi-diddly-ho there, neighborino', {
	     *   'omission': ' [...]'
	     * });
	     * // => 'hi-diddly-ho there, neig [...]'
	     */
	    function trunc(string, options, guard) {
	      if (guard && isIterateeCall(string, options, guard)) {
	        options = undefined;
	      }
	      var length = DEFAULT_TRUNC_LENGTH,
	          omission = DEFAULT_TRUNC_OMISSION;
	
	      if (options != null) {
	        if (isObject(options)) {
	          var separator = 'separator' in options ? options.separator : separator;
	          length = 'length' in options ? (+options.length || 0) : length;
	          omission = 'omission' in options ? baseToString(options.omission) : omission;
	        } else {
	          length = +options || 0;
	        }
	      }
	      string = baseToString(string);
	      if (length >= string.length) {
	        return string;
	      }
	      var end = length - omission.length;
	      if (end < 1) {
	        return omission;
	      }
	      var result = string.slice(0, end);
	      if (separator == null) {
	        return result + omission;
	      }
	      if (isRegExp(separator)) {
	        if (string.slice(end).search(separator)) {
	          var match,
	              newEnd,
	              substring = string.slice(0, end);
	
	          if (!separator.global) {
	            separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
	          }
	          separator.lastIndex = 0;
	          while ((match = separator.exec(substring))) {
	            newEnd = match.index;
	          }
	          result = result.slice(0, newEnd == null ? end : newEnd);
	        }
	      } else if (string.indexOf(separator, end) != end) {
	        var index = result.lastIndexOf(separator);
	        if (index > -1) {
	          result = result.slice(0, index);
	        }
	      }
	      return result + omission;
	    }
	
	    /**
	     * The inverse of `_.escape`; this method converts the HTML entities
	     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
	     * corresponding characters.
	     *
	     * **Note:** No other HTML entities are unescaped. To unescape additional HTML
	     * entities use a third-party library like [_he_](https://mths.be/he).
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to unescape.
	     * @returns {string} Returns the unescaped string.
	     * @example
	     *
	     * _.unescape('fred, barney, &amp; pebbles');
	     * // => 'fred, barney, & pebbles'
	     */
	    function unescape(string) {
	      string = baseToString(string);
	      return (string && reHasEscapedHtml.test(string))
	        ? string.replace(reEscapedHtml, unescapeHtmlChar)
	        : string;
	    }
	
	    /**
	     * Splits `string` into an array of its words.
	     *
	     * @static
	     * @memberOf _
	     * @category String
	     * @param {string} [string=''] The string to inspect.
	     * @param {RegExp|string} [pattern] The pattern to match words.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Array} Returns the words of `string`.
	     * @example
	     *
	     * _.words('fred, barney, & pebbles');
	     * // => ['fred', 'barney', 'pebbles']
	     *
	     * _.words('fred, barney, & pebbles', /[^, ]+/g);
	     * // => ['fred', 'barney', '&', 'pebbles']
	     */
	    function words(string, pattern, guard) {
	      if (guard && isIterateeCall(string, pattern, guard)) {
	        pattern = undefined;
	      }
	      string = baseToString(string);
	      return string.match(pattern || reWords) || [];
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Attempts to invoke `func`, returning either the result or the caught error
	     * object. Any additional arguments are provided to `func` when it is invoked.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Function} func The function to attempt.
	     * @returns {*} Returns the `func` result or error object.
	     * @example
	     *
	     * // avoid throwing errors for invalid selectors
	     * var elements = _.attempt(function(selector) {
	     *   return document.querySelectorAll(selector);
	     * }, '>_>');
	     *
	     * if (_.isError(elements)) {
	     *   elements = [];
	     * }
	     */
	    var attempt = restParam(function(func, args) {
	      try {
	        return func.apply(undefined, args);
	      } catch(e) {
	        return isError(e) ? e : new Error(e);
	      }
	    });
	
	    /**
	     * Creates a function that invokes `func` with the `this` binding of `thisArg`
	     * and arguments of the created function. If `func` is a property name the
	     * created callback returns the property value for a given element. If `func`
	     * is an object the created callback returns `true` for elements that contain
	     * the equivalent object properties, otherwise it returns `false`.
	     *
	     * @static
	     * @memberOf _
	     * @alias iteratee
	     * @category Utility
	     * @param {*} [func=_.identity] The value to convert to a callback.
	     * @param {*} [thisArg] The `this` binding of `func`.
	     * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	     * @returns {Function} Returns the callback.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * // wrap to create custom callback shorthands
	     * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
	     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
	     *   if (!match) {
	     *     return callback(func, thisArg);
	     *   }
	     *   return function(object) {
	     *     return match[2] == 'gt'
	     *       ? object[match[1]] > match[3]
	     *       : object[match[1]] < match[3];
	     *   };
	     * });
	     *
	     * _.filter(users, 'age__gt36');
	     * // => [{ 'user': 'fred', 'age': 40 }]
	     */
	    function callback(func, thisArg, guard) {
	      if (guard && isIterateeCall(func, thisArg, guard)) {
	        thisArg = undefined;
	      }
	      return isObjectLike(func)
	        ? matches(func)
	        : baseCallback(func, thisArg);
	    }
	
	    /**
	     * Creates a function that returns `value`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {*} value The value to return from the new function.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     * var getter = _.constant(object);
	     *
	     * getter() === object;
	     * // => true
	     */
	    function constant(value) {
	      return function() {
	        return value;
	      };
	    }
	
	    /**
	     * This method returns the first argument provided to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {*} value Any value.
	     * @returns {*} Returns `value`.
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * _.identity(object) === object;
	     * // => true
	     */
	    function identity(value) {
	      return value;
	    }
	
	    /**
	     * Creates a function that performs a deep comparison between a given object
	     * and `source`, returning `true` if the given object has equivalent property
	     * values, else `false`.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties. For comparing a single
	     * own or inherited property value see `_.matchesProperty`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Object} source The object of property values to match.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36, 'active': true },
	     *   { 'user': 'fred',   'age': 40, 'active': false }
	     * ];
	     *
	     * _.filter(users, _.matches({ 'age': 40, 'active': false }));
	     * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
	     */
	    function matches(source) {
	      return baseMatches(baseClone(source, true));
	    }
	
	    /**
	     * Creates a function that compares the property value of `path` on a given
	     * object to `value`.
	     *
	     * **Note:** This method supports comparing arrays, booleans, `Date` objects,
	     * numbers, `Object` objects, regexes, and strings. Objects are compared by
	     * their own, not inherited, enumerable properties.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Array|string} path The path of the property to get.
	     * @param {*} srcValue The value to match.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var users = [
	     *   { 'user': 'barney' },
	     *   { 'user': 'fred' }
	     * ];
	     *
	     * _.find(users, _.matchesProperty('user', 'fred'));
	     * // => { 'user': 'fred' }
	     */
	    function matchesProperty(path, srcValue) {
	      return baseMatchesProperty(path, baseClone(srcValue, true));
	    }
	
	    /**
	     * Creates a function that invokes the method at `path` on a given object.
	     * Any additional arguments are provided to the invoked method.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Array|string} path The path of the method to invoke.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': { 'b': { 'c': _.constant(2) } } },
	     *   { 'a': { 'b': { 'c': _.constant(1) } } }
	     * ];
	     *
	     * _.map(objects, _.method('a.b.c'));
	     * // => [2, 1]
	     *
	     * _.invoke(_.sortBy(objects, _.method(['a', 'b', 'c'])), 'a.b.c');
	     * // => [1, 2]
	     */
	    var method = restParam(function(path, args) {
	      return function(object) {
	        return invokePath(object, path, args);
	      };
	    });
	
	    /**
	     * The opposite of `_.method`; this method creates a function that invokes
	     * the method at a given path on `object`. Any additional arguments are
	     * provided to the invoked method.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Object} object The object to query.
	     * @param {...*} [args] The arguments to invoke the method with.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var array = _.times(3, _.constant),
	     *     object = { 'a': array, 'b': array, 'c': array };
	     *
	     * _.map(['a[2]', 'c[0]'], _.methodOf(object));
	     * // => [2, 0]
	     *
	     * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
	     * // => [2, 0]
	     */
	    var methodOf = restParam(function(object, args) {
	      return function(path) {
	        return invokePath(object, path, args);
	      };
	    });
	
	    /**
	     * Adds all own enumerable function properties of a source object to the
	     * destination object. If `object` is a function then methods are added to
	     * its prototype as well.
	     *
	     * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
	     * avoid conflicts caused by modifying the original.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Function|Object} [object=lodash] The destination object.
	     * @param {Object} source The object of functions to add.
	     * @param {Object} [options] The options object.
	     * @param {boolean} [options.chain=true] Specify whether the functions added
	     *  are chainable.
	     * @returns {Function|Object} Returns `object`.
	     * @example
	     *
	     * function vowels(string) {
	     *   return _.filter(string, function(v) {
	     *     return /[aeiou]/i.test(v);
	     *   });
	     * }
	     *
	     * _.mixin({ 'vowels': vowels });
	     * _.vowels('fred');
	     * // => ['e']
	     *
	     * _('fred').vowels().value();
	     * // => ['e']
	     *
	     * _.mixin({ 'vowels': vowels }, { 'chain': false });
	     * _('fred').vowels();
	     * // => ['e']
	     */
	    function mixin(object, source, options) {
	      if (options == null) {
	        var isObj = isObject(source),
	            props = isObj ? keys(source) : undefined,
	            methodNames = (props && props.length) ? baseFunctions(source, props) : undefined;
	
	        if (!(methodNames ? methodNames.length : isObj)) {
	          methodNames = false;
	          options = source;
	          source = object;
	          object = this;
	        }
	      }
	      if (!methodNames) {
	        methodNames = baseFunctions(source, keys(source));
	      }
	      var chain = true,
	          index = -1,
	          isFunc = isFunction(object),
	          length = methodNames.length;
	
	      if (options === false) {
	        chain = false;
	      } else if (isObject(options) && 'chain' in options) {
	        chain = options.chain;
	      }
	      while (++index < length) {
	        var methodName = methodNames[index],
	            func = source[methodName];
	
	        object[methodName] = func;
	        if (isFunc) {
	          object.prototype[methodName] = (function(func) {
	            return function() {
	              var chainAll = this.__chain__;
	              if (chain || chainAll) {
	                var result = object(this.__wrapped__),
	                    actions = result.__actions__ = arrayCopy(this.__actions__);
	
	                actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
	                result.__chain__ = chainAll;
	                return result;
	              }
	              return func.apply(object, arrayPush([this.value()], arguments));
	            };
	          }(func));
	        }
	      }
	      return object;
	    }
	
	    /**
	     * Reverts the `_` variable to its previous value and returns a reference to
	     * the `lodash` function.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @returns {Function} Returns the `lodash` function.
	     * @example
	     *
	     * var lodash = _.noConflict();
	     */
	    function noConflict() {
	      root._ = oldDash;
	      return this;
	    }
	
	    /**
	     * A no-operation function that returns `undefined` regardless of the
	     * arguments it receives.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @example
	     *
	     * var object = { 'user': 'fred' };
	     *
	     * _.noop(object) === undefined;
	     * // => true
	     */
	    function noop() {
	      // No operation performed.
	    }
	
	    /**
	     * Creates a function that returns the property value at `path` on a
	     * given object.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Array|string} path The path of the property to get.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var objects = [
	     *   { 'a': { 'b': { 'c': 2 } } },
	     *   { 'a': { 'b': { 'c': 1 } } }
	     * ];
	     *
	     * _.map(objects, _.property('a.b.c'));
	     * // => [2, 1]
	     *
	     * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	     * // => [1, 2]
	     */
	    function property(path) {
	      return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	    }
	
	    /**
	     * The opposite of `_.property`; this method creates a function that returns
	     * the property value at a given path on `object`.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {Object} object The object to query.
	     * @returns {Function} Returns the new function.
	     * @example
	     *
	     * var array = [0, 1, 2],
	     *     object = { 'a': array, 'b': array, 'c': array };
	     *
	     * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
	     * // => [2, 0]
	     *
	     * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
	     * // => [2, 0]
	     */
	    function propertyOf(object) {
	      return function(path) {
	        return baseGet(object, toPath(path), path + '');
	      };
	    }
	
	    /**
	     * Creates an array of numbers (positive and/or negative) progressing from
	     * `start` up to, but not including, `end`. If `end` is not specified it is
	     * set to `start` with `start` then set to `0`. If `end` is less than `start`
	     * a zero-length range is created unless a negative `step` is specified.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {number} [start=0] The start of the range.
	     * @param {number} end The end of the range.
	     * @param {number} [step=1] The value to increment or decrement by.
	     * @returns {Array} Returns the new array of numbers.
	     * @example
	     *
	     * _.range(4);
	     * // => [0, 1, 2, 3]
	     *
	     * _.range(1, 5);
	     * // => [1, 2, 3, 4]
	     *
	     * _.range(0, 20, 5);
	     * // => [0, 5, 10, 15]
	     *
	     * _.range(0, -4, -1);
	     * // => [0, -1, -2, -3]
	     *
	     * _.range(1, 4, 0);
	     * // => [1, 1, 1]
	     *
	     * _.range(0);
	     * // => []
	     */
	    function range(start, end, step) {
	      if (step && isIterateeCall(start, end, step)) {
	        end = step = undefined;
	      }
	      start = +start || 0;
	      step = step == null ? 1 : (+step || 0);
	
	      if (end == null) {
	        end = start;
	        start = 0;
	      } else {
	        end = +end || 0;
	      }
	      // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
	      // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
	      var index = -1,
	          length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
	          result = Array(length);
	
	      while (++index < length) {
	        result[index] = start;
	        start += step;
	      }
	      return result;
	    }
	
	    /**
	     * Invokes the iteratee function `n` times, returning an array of the results
	     * of each invocation. The `iteratee` is bound to `thisArg` and invoked with
	     * one argument; (index).
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {number} n The number of times to invoke `iteratee`.
	     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {Array} Returns the array of results.
	     * @example
	     *
	     * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));
	     * // => [3, 6, 4]
	     *
	     * _.times(3, function(n) {
	     *   mage.castSpell(n);
	     * });
	     * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2`
	     *
	     * _.times(3, function(n) {
	     *   this.cast(n);
	     * }, mage);
	     * // => also invokes `mage.castSpell(n)` three times
	     */
	    function times(n, iteratee, thisArg) {
	      n = nativeFloor(n);
	
	      // Exit early to avoid a JSC JIT bug in Safari 8
	      // where `Array(0)` is treated as `Array(1)`.
	      if (n < 1 || !nativeIsFinite(n)) {
	        return [];
	      }
	      var index = -1,
	          result = Array(nativeMin(n, MAX_ARRAY_LENGTH));
	
	      iteratee = bindCallback(iteratee, thisArg, 1);
	      while (++index < n) {
	        if (index < MAX_ARRAY_LENGTH) {
	          result[index] = iteratee(index);
	        } else {
	          iteratee(index);
	        }
	      }
	      return result;
	    }
	
	    /**
	     * Generates a unique ID. If `prefix` is provided the ID is appended to it.
	     *
	     * @static
	     * @memberOf _
	     * @category Utility
	     * @param {string} [prefix] The value to prefix the ID with.
	     * @returns {string} Returns the unique ID.
	     * @example
	     *
	     * _.uniqueId('contact_');
	     * // => 'contact_104'
	     *
	     * _.uniqueId();
	     * // => '105'
	     */
	    function uniqueId(prefix) {
	      var id = ++idCounter;
	      return baseToString(prefix) + id;
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * Adds two numbers.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {number} augend The first number to add.
	     * @param {number} addend The second number to add.
	     * @returns {number} Returns the sum.
	     * @example
	     *
	     * _.add(6, 4);
	     * // => 10
	     */
	    function add(augend, addend) {
	      return (+augend || 0) + (+addend || 0);
	    }
	
	    /**
	     * Calculates `n` rounded up to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {number} n The number to round up.
	     * @param {number} [precision=0] The precision to round up to.
	     * @returns {number} Returns the rounded up number.
	     * @example
	     *
	     * _.ceil(4.006);
	     * // => 5
	     *
	     * _.ceil(6.004, 2);
	     * // => 6.01
	     *
	     * _.ceil(6040, -2);
	     * // => 6100
	     */
	    var ceil = createRound('ceil');
	
	    /**
	     * Calculates `n` rounded down to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {number} n The number to round down.
	     * @param {number} [precision=0] The precision to round down to.
	     * @returns {number} Returns the rounded down number.
	     * @example
	     *
	     * _.floor(4.006);
	     * // => 4
	     *
	     * _.floor(0.046, 2);
	     * // => 0.04
	     *
	     * _.floor(4060, -2);
	     * // => 4000
	     */
	    var floor = createRound('floor');
	
	    /**
	     * Gets the maximum value of `collection`. If `collection` is empty or falsey
	     * `-Infinity` is returned. If an iteratee function is provided it is invoked
	     * for each value in `collection` to generate the criterion by which the value
	     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments: (value, index, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the maximum value.
	     * @example
	     *
	     * _.max([4, 2, 8, 6]);
	     * // => 8
	     *
	     * _.max([]);
	     * // => -Infinity
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.max(users, function(chr) {
	     *   return chr.age;
	     * });
	     * // => { 'user': 'fred', 'age': 40 }
	     *
	     * // using the `_.property` callback shorthand
	     * _.max(users, 'age');
	     * // => { 'user': 'fred', 'age': 40 }
	     */
	    var max = createExtremum(gt, NEGATIVE_INFINITY);
	
	    /**
	     * Gets the minimum value of `collection`. If `collection` is empty or falsey
	     * `Infinity` is returned. If an iteratee function is provided it is invoked
	     * for each value in `collection` to generate the criterion by which the value
	     * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
	     * arguments: (value, index, collection).
	     *
	     * If a property name is provided for `iteratee` the created `_.property`
	     * style callback returns the property value of the given element.
	     *
	     * If a value is also provided for `thisArg` the created `_.matchesProperty`
	     * style callback returns `true` for elements that have a matching property
	     * value, else `false`.
	     *
	     * If an object is provided for `iteratee` the created `_.matches` style
	     * callback returns `true` for elements that have the properties of the given
	     * object, else `false`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {*} Returns the minimum value.
	     * @example
	     *
	     * _.min([4, 2, 8, 6]);
	     * // => 2
	     *
	     * _.min([]);
	     * // => Infinity
	     *
	     * var users = [
	     *   { 'user': 'barney', 'age': 36 },
	     *   { 'user': 'fred',   'age': 40 }
	     * ];
	     *
	     * _.min(users, function(chr) {
	     *   return chr.age;
	     * });
	     * // => { 'user': 'barney', 'age': 36 }
	     *
	     * // using the `_.property` callback shorthand
	     * _.min(users, 'age');
	     * // => { 'user': 'barney', 'age': 36 }
	     */
	    var min = createExtremum(lt, POSITIVE_INFINITY);
	
	    /**
	     * Calculates `n` rounded to `precision`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {number} n The number to round.
	     * @param {number} [precision=0] The precision to round to.
	     * @returns {number} Returns the rounded number.
	     * @example
	     *
	     * _.round(4.006);
	     * // => 4
	     *
	     * _.round(4.006, 2);
	     * // => 4.01
	     *
	     * _.round(4060, -2);
	     * // => 4100
	     */
	    var round = createRound('round');
	
	    /**
	     * Gets the sum of the values in `collection`.
	     *
	     * @static
	     * @memberOf _
	     * @category Math
	     * @param {Array|Object|string} collection The collection to iterate over.
	     * @param {Function|Object|string} [iteratee] The function invoked per iteration.
	     * @param {*} [thisArg] The `this` binding of `iteratee`.
	     * @returns {number} Returns the sum.
	     * @example
	     *
	     * _.sum([4, 6]);
	     * // => 10
	     *
	     * _.sum({ 'a': 4, 'b': 6 });
	     * // => 10
	     *
	     * var objects = [
	     *   { 'n': 4 },
	     *   { 'n': 6 }
	     * ];
	     *
	     * _.sum(objects, function(object) {
	     *   return object.n;
	     * });
	     * // => 10
	     *
	     * // using the `_.property` callback shorthand
	     * _.sum(objects, 'n');
	     * // => 10
	     */
	    function sum(collection, iteratee, thisArg) {
	      if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
	        iteratee = undefined;
	      }
	      iteratee = getCallback(iteratee, thisArg, 3);
	      return iteratee.length == 1
	        ? arraySum(isArray(collection) ? collection : toIterable(collection), iteratee)
	        : baseSum(collection, iteratee);
	    }
	
	    /*------------------------------------------------------------------------*/
	
	    // Ensure wrappers are instances of `baseLodash`.
	    lodash.prototype = baseLodash.prototype;
	
	    LodashWrapper.prototype = baseCreate(baseLodash.prototype);
	    LodashWrapper.prototype.constructor = LodashWrapper;
	
	    LazyWrapper.prototype = baseCreate(baseLodash.prototype);
	    LazyWrapper.prototype.constructor = LazyWrapper;
	
	    // Add functions to the `Map` cache.
	    MapCache.prototype['delete'] = mapDelete;
	    MapCache.prototype.get = mapGet;
	    MapCache.prototype.has = mapHas;
	    MapCache.prototype.set = mapSet;
	
	    // Add functions to the `Set` cache.
	    SetCache.prototype.push = cachePush;
	
	    // Assign cache to `_.memoize`.
	    memoize.Cache = MapCache;
	
	    // Add functions that return wrapped values when chaining.
	    lodash.after = after;
	    lodash.ary = ary;
	    lodash.assign = assign;
	    lodash.at = at;
	    lodash.before = before;
	    lodash.bind = bind;
	    lodash.bindAll = bindAll;
	    lodash.bindKey = bindKey;
	    lodash.callback = callback;
	    lodash.chain = chain;
	    lodash.chunk = chunk;
	    lodash.compact = compact;
	    lodash.constant = constant;
	    lodash.countBy = countBy;
	    lodash.create = create;
	    lodash.curry = curry;
	    lodash.curryRight = curryRight;
	    lodash.debounce = debounce;
	    lodash.defaults = defaults;
	    lodash.defaultsDeep = defaultsDeep;
	    lodash.defer = defer;
	    lodash.delay = delay;
	    lodash.difference = difference;
	    lodash.drop = drop;
	    lodash.dropRight = dropRight;
	    lodash.dropRightWhile = dropRightWhile;
	    lodash.dropWhile = dropWhile;
	    lodash.fill = fill;
	    lodash.filter = filter;
	    lodash.flatten = flatten;
	    lodash.flattenDeep = flattenDeep;
	    lodash.flow = flow;
	    lodash.flowRight = flowRight;
	    lodash.forEach = forEach;
	    lodash.forEachRight = forEachRight;
	    lodash.forIn = forIn;
	    lodash.forInRight = forInRight;
	    lodash.forOwn = forOwn;
	    lodash.forOwnRight = forOwnRight;
	    lodash.functions = functions;
	    lodash.groupBy = groupBy;
	    lodash.indexBy = indexBy;
	    lodash.initial = initial;
	    lodash.intersection = intersection;
	    lodash.invert = invert;
	    lodash.invoke = invoke;
	    lodash.keys = keys;
	    lodash.keysIn = keysIn;
	    lodash.map = map;
	    lodash.mapKeys = mapKeys;
	    lodash.mapValues = mapValues;
	    lodash.matches = matches;
	    lodash.matchesProperty = matchesProperty;
	    lodash.memoize = memoize;
	    lodash.merge = merge;
	    lodash.method = method;
	    lodash.methodOf = methodOf;
	    lodash.mixin = mixin;
	    lodash.modArgs = modArgs;
	    lodash.negate = negate;
	    lodash.omit = omit;
	    lodash.once = once;
	    lodash.pairs = pairs;
	    lodash.partial = partial;
	    lodash.partialRight = partialRight;
	    lodash.partition = partition;
	    lodash.pick = pick;
	    lodash.pluck = pluck;
	    lodash.property = property;
	    lodash.propertyOf = propertyOf;
	    lodash.pull = pull;
	    lodash.pullAt = pullAt;
	    lodash.range = range;
	    lodash.rearg = rearg;
	    lodash.reject = reject;
	    lodash.remove = remove;
	    lodash.rest = rest;
	    lodash.restParam = restParam;
	    lodash.set = set;
	    lodash.shuffle = shuffle;
	    lodash.slice = slice;
	    lodash.sortBy = sortBy;
	    lodash.sortByAll = sortByAll;
	    lodash.sortByOrder = sortByOrder;
	    lodash.spread = spread;
	    lodash.take = take;
	    lodash.takeRight = takeRight;
	    lodash.takeRightWhile = takeRightWhile;
	    lodash.takeWhile = takeWhile;
	    lodash.tap = tap;
	    lodash.throttle = throttle;
	    lodash.thru = thru;
	    lodash.times = times;
	    lodash.toArray = toArray;
	    lodash.toPlainObject = toPlainObject;
	    lodash.transform = transform;
	    lodash.union = union;
	    lodash.uniq = uniq;
	    lodash.unzip = unzip;
	    lodash.unzipWith = unzipWith;
	    lodash.values = values;
	    lodash.valuesIn = valuesIn;
	    lodash.where = where;
	    lodash.without = without;
	    lodash.wrap = wrap;
	    lodash.xor = xor;
	    lodash.zip = zip;
	    lodash.zipObject = zipObject;
	    lodash.zipWith = zipWith;
	
	    // Add aliases.
	    lodash.backflow = flowRight;
	    lodash.collect = map;
	    lodash.compose = flowRight;
	    lodash.each = forEach;
	    lodash.eachRight = forEachRight;
	    lodash.extend = assign;
	    lodash.iteratee = callback;
	    lodash.methods = functions;
	    lodash.object = zipObject;
	    lodash.select = filter;
	    lodash.tail = rest;
	    lodash.unique = uniq;
	
	    // Add functions to `lodash.prototype`.
	    mixin(lodash, lodash);
	
	    /*------------------------------------------------------------------------*/
	
	    // Add functions that return unwrapped values when chaining.
	    lodash.add = add;
	    lodash.attempt = attempt;
	    lodash.camelCase = camelCase;
	    lodash.capitalize = capitalize;
	    lodash.ceil = ceil;
	    lodash.clone = clone;
	    lodash.cloneDeep = cloneDeep;
	    lodash.deburr = deburr;
	    lodash.endsWith = endsWith;
	    lodash.escape = escape;
	    lodash.escapeRegExp = escapeRegExp;
	    lodash.every = every;
	    lodash.find = find;
	    lodash.findIndex = findIndex;
	    lodash.findKey = findKey;
	    lodash.findLast = findLast;
	    lodash.findLastIndex = findLastIndex;
	    lodash.findLastKey = findLastKey;
	    lodash.findWhere = findWhere;
	    lodash.first = first;
	    lodash.floor = floor;
	    lodash.get = get;
	    lodash.gt = gt;
	    lodash.gte = gte;
	    lodash.has = has;
	    lodash.identity = identity;
	    lodash.includes = includes;
	    lodash.indexOf = indexOf;
	    lodash.inRange = inRange;
	    lodash.isArguments = isArguments;
	    lodash.isArray = isArray;
	    lodash.isBoolean = isBoolean;
	    lodash.isDate = isDate;
	    lodash.isElement = isElement;
	    lodash.isEmpty = isEmpty;
	    lodash.isEqual = isEqual;
	    lodash.isError = isError;
	    lodash.isFinite = isFinite;
	    lodash.isFunction = isFunction;
	    lodash.isMatch = isMatch;
	    lodash.isNaN = isNaN;
	    lodash.isNative = isNative;
	    lodash.isNull = isNull;
	    lodash.isNumber = isNumber;
	    lodash.isObject = isObject;
	    lodash.isPlainObject = isPlainObject;
	    lodash.isRegExp = isRegExp;
	    lodash.isString = isString;
	    lodash.isTypedArray = isTypedArray;
	    lodash.isUndefined = isUndefined;
	    lodash.kebabCase = kebabCase;
	    lodash.last = last;
	    lodash.lastIndexOf = lastIndexOf;
	    lodash.lt = lt;
	    lodash.lte = lte;
	    lodash.max = max;
	    lodash.min = min;
	    lodash.noConflict = noConflict;
	    lodash.noop = noop;
	    lodash.now = now;
	    lodash.pad = pad;
	    lodash.padLeft = padLeft;
	    lodash.padRight = padRight;
	    lodash.parseInt = parseInt;
	    lodash.random = random;
	    lodash.reduce = reduce;
	    lodash.reduceRight = reduceRight;
	    lodash.repeat = repeat;
	    lodash.result = result;
	    lodash.round = round;
	    lodash.runInContext = runInContext;
	    lodash.size = size;
	    lodash.snakeCase = snakeCase;
	    lodash.some = some;
	    lodash.sortedIndex = sortedIndex;
	    lodash.sortedLastIndex = sortedLastIndex;
	    lodash.startCase = startCase;
	    lodash.startsWith = startsWith;
	    lodash.sum = sum;
	    lodash.template = template;
	    lodash.trim = trim;
	    lodash.trimLeft = trimLeft;
	    lodash.trimRight = trimRight;
	    lodash.trunc = trunc;
	    lodash.unescape = unescape;
	    lodash.uniqueId = uniqueId;
	    lodash.words = words;
	
	    // Add aliases.
	    lodash.all = every;
	    lodash.any = some;
	    lodash.contains = includes;
	    lodash.eq = isEqual;
	    lodash.detect = find;
	    lodash.foldl = reduce;
	    lodash.foldr = reduceRight;
	    lodash.head = first;
	    lodash.include = includes;
	    lodash.inject = reduce;
	
	    mixin(lodash, (function() {
	      var source = {};
	      baseForOwn(lodash, function(func, methodName) {
	        if (!lodash.prototype[methodName]) {
	          source[methodName] = func;
	        }
	      });
	      return source;
	    }()), false);
	
	    /*------------------------------------------------------------------------*/
	
	    // Add functions capable of returning wrapped and unwrapped values when chaining.
	    lodash.sample = sample;
	
	    lodash.prototype.sample = function(n) {
	      if (!this.__chain__ && n == null) {
	        return sample(this.value());
	      }
	      return this.thru(function(value) {
	        return sample(value, n);
	      });
	    };
	
	    /*------------------------------------------------------------------------*/
	
	    /**
	     * The semantic version number.
	     *
	     * @static
	     * @memberOf _
	     * @type string
	     */
	    lodash.VERSION = VERSION;
	
	    // Assign default placeholders.
	    arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
	      lodash[methodName].placeholder = lodash;
	    });
	
	    // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
	    arrayEach(['drop', 'take'], function(methodName, index) {
	      LazyWrapper.prototype[methodName] = function(n) {
	        var filtered = this.__filtered__;
	        if (filtered && !index) {
	          return new LazyWrapper(this);
	        }
	        n = n == null ? 1 : nativeMax(nativeFloor(n) || 0, 0);
	
	        var result = this.clone();
	        if (filtered) {
	          result.__takeCount__ = nativeMin(result.__takeCount__, n);
	        } else {
	          result.__views__.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
	        }
	        return result;
	      };
	
	      LazyWrapper.prototype[methodName + 'Right'] = function(n) {
	        return this.reverse()[methodName](n).reverse();
	      };
	    });
	
	    // Add `LazyWrapper` methods that accept an `iteratee` value.
	    arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
	      var type = index + 1,
	          isFilter = type != LAZY_MAP_FLAG;
	
	      LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
	        var result = this.clone();
	        result.__iteratees__.push({ 'iteratee': getCallback(iteratee, thisArg, 1), 'type': type });
	        result.__filtered__ = result.__filtered__ || isFilter;
	        return result;
	      };
	    });
	
	    // Add `LazyWrapper` methods for `_.first` and `_.last`.
	    arrayEach(['first', 'last'], function(methodName, index) {
	      var takeName = 'take' + (index ? 'Right' : '');
	
	      LazyWrapper.prototype[methodName] = function() {
	        return this[takeName](1).value()[0];
	      };
	    });
	
	    // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
	    arrayEach(['initial', 'rest'], function(methodName, index) {
	      var dropName = 'drop' + (index ? '' : 'Right');
	
	      LazyWrapper.prototype[methodName] = function() {
	        return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
	      };
	    });
	
	    // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
	    arrayEach(['pluck', 'where'], function(methodName, index) {
	      var operationName = index ? 'filter' : 'map',
	          createCallback = index ? baseMatches : property;
	
	      LazyWrapper.prototype[methodName] = function(value) {
	        return this[operationName](createCallback(value));
	      };
	    });
	
	    LazyWrapper.prototype.compact = function() {
	      return this.filter(identity);
	    };
	
	    LazyWrapper.prototype.reject = function(predicate, thisArg) {
	      predicate = getCallback(predicate, thisArg, 1);
	      return this.filter(function(value) {
	        return !predicate(value);
	      });
	    };
	
	    LazyWrapper.prototype.slice = function(start, end) {
	      start = start == null ? 0 : (+start || 0);
	
	      var result = this;
	      if (result.__filtered__ && (start > 0 || end < 0)) {
	        return new LazyWrapper(result);
	      }
	      if (start < 0) {
	        result = result.takeRight(-start);
	      } else if (start) {
	        result = result.drop(start);
	      }
	      if (end !== undefined) {
	        end = (+end || 0);
	        result = end < 0 ? result.dropRight(-end) : result.take(end - start);
	      }
	      return result;
	    };
	
	    LazyWrapper.prototype.takeRightWhile = function(predicate, thisArg) {
	      return this.reverse().takeWhile(predicate, thisArg).reverse();
	    };
	
	    LazyWrapper.prototype.toArray = function() {
	      return this.take(POSITIVE_INFINITY);
	    };
	
	    // Add `LazyWrapper` methods to `lodash.prototype`.
	    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	      var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
	          retUnwrapped = /^(?:first|last)$/.test(methodName),
	          lodashFunc = lodash[retUnwrapped ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName];
	
	      if (!lodashFunc) {
	        return;
	      }
	      lodash.prototype[methodName] = function() {
	        var args = retUnwrapped ? [1] : arguments,
	            chainAll = this.__chain__,
	            value = this.__wrapped__,
	            isHybrid = !!this.__actions__.length,
	            isLazy = value instanceof LazyWrapper,
	            iteratee = args[0],
	            useLazy = isLazy || isArray(value);
	
	        if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
	          // Avoid lazy use if the iteratee has a "length" value other than `1`.
	          isLazy = useLazy = false;
	        }
	        var interceptor = function(value) {
	          return (retUnwrapped && chainAll)
	            ? lodashFunc(value, 1)[0]
	            : lodashFunc.apply(undefined, arrayPush([value], args));
	        };
	
	        var action = { 'func': thru, 'args': [interceptor], 'thisArg': undefined },
	            onlyLazy = isLazy && !isHybrid;
	
	        if (retUnwrapped && !chainAll) {
	          if (onlyLazy) {
	            value = value.clone();
	            value.__actions__.push(action);
	            return func.call(value);
	          }
	          return lodashFunc.call(undefined, this.value())[0];
	        }
	        if (!retUnwrapped && useLazy) {
	          value = onlyLazy ? value : new LazyWrapper(this);
	          var result = func.apply(value, args);
	          result.__actions__.push(action);
	          return new LodashWrapper(result, chainAll);
	        }
	        return this.thru(interceptor);
	      };
	    });
	
	    // Add `Array` and `String` methods to `lodash.prototype`.
	    arrayEach(['join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {
	      var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
	          chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
	          retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);
	
	      lodash.prototype[methodName] = function() {
	        var args = arguments;
	        if (retUnwrapped && !this.__chain__) {
	          return func.apply(this.value(), args);
	        }
	        return this[chainName](function(value) {
	          return func.apply(value, args);
	        });
	      };
	    });
	
	    // Map minified function names to their real names.
	    baseForOwn(LazyWrapper.prototype, function(func, methodName) {
	      var lodashFunc = lodash[methodName];
	      if (lodashFunc) {
	        var key = lodashFunc.name,
	            names = realNames[key] || (realNames[key] = []);
	
	        names.push({ 'name': methodName, 'func': lodashFunc });
	      }
	    });
	
	    realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': undefined }];
	
	    // Add functions to the lazy wrapper.
	    LazyWrapper.prototype.clone = lazyClone;
	    LazyWrapper.prototype.reverse = lazyReverse;
	    LazyWrapper.prototype.value = lazyValue;
	
	    // Add chaining functions to the `lodash` wrapper.
	    lodash.prototype.chain = wrapperChain;
	    lodash.prototype.commit = wrapperCommit;
	    lodash.prototype.concat = wrapperConcat;
	    lodash.prototype.plant = wrapperPlant;
	    lodash.prototype.reverse = wrapperReverse;
	    lodash.prototype.toString = wrapperToString;
	    lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
	
	    // Add function aliases to the `lodash` wrapper.
	    lodash.prototype.collect = lodash.prototype.map;
	    lodash.prototype.head = lodash.prototype.first;
	    lodash.prototype.select = lodash.prototype.filter;
	    lodash.prototype.tail = lodash.prototype.rest;
	
	    return lodash;
	  }
	
	  /*--------------------------------------------------------------------------*/
	
	  // Export lodash.
	  var _ = runInContext();
	
	  // Some AMD build optimizers like r.js check for condition patterns like the following:
	  if (true) {
	    // Expose lodash to the global object when an AMD loader is present to avoid
	    // errors in cases where lodash is loaded by a script tag and not intended
	    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
	    // more details.
	    root._ = _;
	
	    // Define as an anonymous module so, through path mapping, it can be
	    // referenced as the "underscore" module.
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
	  else if (freeExports && freeModule) {
	    // Export for Node.js or RingoJS.
	    if (moduleExports) {
	      (freeModule.exports = _)._ = _;
	    }
	    // Export for Rhino with CommonJS support.
	    else {
	      freeExports._ = _;
	    }
	  }
	  else {
	    // Export for a browser or Rhino.
	    root._ = _;
	  }
	}.call(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(15)(module), (function() { return this; }())))

/***/ },

/***/ 145:
/***/ function(module, exports) {

	'use strict';
	
	(function ($) {
	  "use strict";
	
	  var defaultOptions = {
	    tagClass: function tagClass(item) {
	      return 'label label-info';
	    },
	    itemValue: function itemValue(item) {
	      return item ? item.toString() : item;
	    },
	    itemText: function itemText(item) {
	      return this.itemValue(item);
	    },
	    freeInput: true,
	    addOnBlur: true,
	    maxTags: undefined,
	    maxChars: undefined,
	    confirmKeys: [13, 44],
	    onTagExists: function onTagExists(item, $tag) {
	      $tag.hide().fadeIn();
	    },
	    trimValue: false,
	    allowDuplicates: false
	  };
	
	  /**
	   * Constructor function
	   */
	  function TagsInput(element, options) {
	    this.itemsArray = [];
	
	    this.$element = $(element);
	    this.$element.hide();
	
	    this.isSelect = element.tagName === 'SELECT';
	    this.multiple = this.isSelect && element.hasAttribute('multiple');
	    this.objectItems = options && options.itemValue;
	    this.placeholderText = element.hasAttribute('placeholder') ? this.$element.attr('placeholder') : '';
	    this.inputSize = Math.max(1, this.placeholderText.length);
	
	    this.$container = $('<div class="bootstrap-tagsinput"></div>');
	    this.$input = $('<input type="text" placeholder="' + this.placeholderText + '"/>').appendTo(this.$container);
	
	    this.$element.after(this.$container);
	
	    var inputWidth = (this.inputSize < 3 ? 3 : this.inputSize) + "em";
	    this.$input.get(0).style.cssText = "width: " + inputWidth + " !important;";
	    this.build(options);
	  }
	
	  TagsInput.prototype = {
	    constructor: TagsInput,
	
	    /**
	     * Adds the given item as a new tag. Pass true to dontPushVal to prevent
	     * updating the elements val()
	     */
	    add: function add(item, dontPushVal) {
	      var self = this;
	
	      if (self.options.maxTags && self.itemsArray.length >= self.options.maxTags) return;
	
	      // Ignore falsey values, except false
	      if (item !== false && !item) return;
	
	      // Trim value
	      if (typeof item === "string" && self.options.trimValue) {
	        item = $.trim(item);
	      }
	
	      // Throw an error when trying to add an object while the itemValue option was not set
	      if (typeof item === "object" && !self.objectItems) throw "Can't add objects when itemValue option is not set";
	
	      // Ignore strings only containg whitespace
	      if (item.toString().match(/^\s*$/)) return;
	
	      // If SELECT but not multiple, remove current tag
	      if (self.isSelect && !self.multiple && self.itemsArray.length > 0) self.remove(self.itemsArray[0]);
	
	      if (typeof item === "string" && this.$element[0].tagName === 'INPUT') {
	        var items = item.split(',');
	        if (items.length > 1) {
	          for (var i = 0; i < items.length; i++) {
	            this.add(items[i], true);
	          }
	
	          if (!dontPushVal) self.pushVal();
	          return;
	        }
	      }
	
	      var itemValue = self.options.itemValue(item),
	          itemText = self.options.itemText(item),
	          tagClass = self.options.tagClass(item);
	
	      // Ignore items allready added
	      var existing = $.grep(self.itemsArray, function (item) {
	        return self.options.itemValue(item) === itemValue;
	      })[0];
	      if (existing && !self.options.allowDuplicates) {
	        // Invoke onTagExists
	        if (self.options.onTagExists) {
	          var $existingTag = $(".tag", self.$container).filter(function () {
	            return $(this).data("item") === existing;
	          });
	          self.options.onTagExists(item, $existingTag);
	        }
	        return;
	      }
	
	      // if length greater than limit
	      if (self.items().toString().length + item.length + 1 > self.options.maxInputLength) return;
	
	      // raise beforeItemAdd arg
	      var beforeItemAddEvent = $.Event('beforeItemAdd', { item: item, cancel: false });
	      self.$element.trigger(beforeItemAddEvent);
	      if (beforeItemAddEvent.cancel) return;
	
	      // register item in internal array and map
	      self.itemsArray.push(item);
	
	      // add a tag element
	      var $tag = $('<span class="tag ' + htmlEncode(tagClass) + '">' + htmlEncode(itemText) + '<span data-role="remove"></span></span>');
	      $tag.data('item', item);
	      self.findInputWrapper().before($tag);
	      $tag.after(' ');
	
	      // add <option /> if item represents a value not present in one of the <select />'s options
	      if (self.isSelect && !$('option[value="' + encodeURIComponent(itemValue) + '"]', self.$element)[0]) {
	        var $option = $('<option selected>' + htmlEncode(itemText) + '</option>');
	        $option.data('item', item);
	        $option.attr('value', itemValue);
	        self.$element.append($option);
	      }
	
	      if (!dontPushVal) self.pushVal();
	
	      // Add class when reached maxTags
	      if (self.options.maxTags === self.itemsArray.length || self.items().toString().length === self.options.maxInputLength) self.$container.addClass('bootstrap-tagsinput-max');
	
	      self.$element.trigger($.Event('itemAdded', { item: item }));
	    },
	
	    /**
	     * Removes the given item. Pass true to dontPushVal to prevent updating the
	     * elements val()
	     */
	    remove: function remove(item, dontPushVal) {
	      var self = this;
	
	      if (self.objectItems) {
	        if (typeof item === "object") item = $.grep(self.itemsArray, function (other) {
	          return self.options.itemValue(other) == self.options.itemValue(item);
	        });else item = $.grep(self.itemsArray, function (other) {
	          return self.options.itemValue(other) == item;
	        });
	
	        item = item[item.length - 1];
	      }
	
	      if (item) {
	        var beforeItemRemoveEvent = $.Event('beforeItemRemove', { item: item, cancel: false });
	        self.$element.trigger(beforeItemRemoveEvent);
	        if (beforeItemRemoveEvent.cancel) return;
	
	        $('.tag', self.$container).filter(function () {
	          return $(this).data('item') === item;
	        }).remove();
	        $('option', self.$element).filter(function () {
	          return $(this).data('item') === item;
	        }).remove();
	        if ($.inArray(item, self.itemsArray) !== -1) self.itemsArray.splice($.inArray(item, self.itemsArray), 1);
	      }
	
	      if (!dontPushVal) self.pushVal();
	
	      // Remove class when reached maxTags
	      if (self.options.maxTags > self.itemsArray.length) self.$container.removeClass('bootstrap-tagsinput-max');
	
	      self.$element.trigger($.Event('itemRemoved', { item: item }));
	    },
	
	    /**
	     * Removes all items
	     */
	    removeAll: function removeAll() {
	      var self = this;
	
	      $('.tag', self.$container).remove();
	      $('option', self.$element).remove();
	
	      while (self.itemsArray.length > 0) self.itemsArray.pop();
	
	      self.pushVal();
	    },
	
	    /**
	     * Refreshes the tags so they match the text/value of their corresponding
	     * item.
	     */
	    refresh: function refresh() {
	      var self = this;
	      $('.tag', self.$container).each(function () {
	        var $tag = $(this),
	            item = $tag.data('item'),
	            itemValue = self.options.itemValue(item),
	            itemText = self.options.itemText(item),
	            tagClass = self.options.tagClass(item);
	
	        // Update tag's class and inner text
	        $tag.attr('class', null);
	        $tag.addClass('tag ' + htmlEncode(tagClass));
	        $tag.contents().filter(function () {
	          return this.nodeType == 3;
	        })[0].nodeValue = htmlEncode(itemText);
	
	        if (self.isSelect) {
	          var option = $('option', self.$element).filter(function () {
	            return $(this).data('item') === item;
	          });
	          option.attr('value', itemValue);
	        }
	      });
	    },
	
	    /**
	     * Returns the items added as tags
	     */
	    items: function items() {
	      return this.itemsArray;
	    },
	
	    /**
	     * Assembly value by retrieving the value of each item, and set it on the
	     * element.
	     */
	    pushVal: function pushVal() {
	      var self = this,
	          val = $.map(self.items(), function (item) {
	        return self.options.itemValue(item).toString();
	      });
	
	      self.$element.val(val, true).trigger('change');
	    },
	
	    /**
	     * Initializes the tags input behaviour on the element
	     */
	    build: function build(options) {
	      var self = this;
	
	      self.options = $.extend({}, defaultOptions, options);
	      // When itemValue is set, freeInput should always be false
	      if (self.objectItems) self.options.freeInput = false;
	
	      makeOptionItemFunction(self.options, 'itemValue');
	      makeOptionItemFunction(self.options, 'itemText');
	      makeOptionFunction(self.options, 'tagClass');
	
	      // Typeahead Bootstrap version 2.3.2
	      if (self.options.typeahead) {
	        var typeahead = self.options.typeahead || {};
	
	        makeOptionFunction(typeahead, 'source');
	
	        self.$input.typeahead($.extend({}, typeahead, {
	          source: function source(query, process) {
	            function processItems(items) {
	              var texts = [];
	
	              for (var i = 0; i < items.length; i++) {
	                var text = self.options.itemText(items[i]);
	                map[text] = items[i];
	                texts.push(text);
	              }
	              process(texts);
	            }
	
	            this.map = {};
	            var map = this.map,
	                data = typeahead.source(query);
	
	            if ($.isFunction(data.success)) {
	              // support for Angular callbacks
	              data.success(processItems);
	            } else if ($.isFunction(data.then)) {
	              // support for Angular promises
	              data.then(processItems);
	            } else {
	              // support for functions and jquery promises
	              $.when(data).then(processItems);
	            }
	          },
	          updater: function updater(text) {
	            self.add(this.map[text]);
	          },
	          matcher: function matcher(text) {
	            return text.toLowerCase().indexOf(this.query.trim().toLowerCase()) !== -1;
	          },
	          sorter: function sorter(texts) {
	            return texts.sort();
	          },
	          highlighter: function highlighter(text) {
	            var regex = new RegExp('(' + this.query + ')', 'gi');
	            return text.replace(regex, "<strong>$1</strong>");
	          }
	        }));
	      }
	
	      // typeahead.js
	      if (self.options.typeaheadjs) {
	        var typeaheadjs = self.options.typeaheadjs || {};
	
	        self.$input.typeahead(null, typeaheadjs).on('typeahead:selected', $.proxy(function (obj, datum) {
	          if (typeaheadjs.valueKey) self.add(datum[typeaheadjs.valueKey]);else self.add(datum);
	          self.$input.typeahead('val', '');
	        }, self));
	      }
	
	      self.$container.on('click', $.proxy(function (event) {
	        if (!self.$element.attr('disabled')) {
	          self.$input.removeAttr('disabled');
	        }
	        self.$input.focus();
	      }, self));
	
	      if (self.options.addOnBlur && self.options.freeInput) {
	        self.$input.on('focusout', $.proxy(function (event) {
	          // HACK: only process on focusout when no typeahead opened, to
	          //       avoid adding the typeahead text as tag
	          if ($('.typeahead, .twitter-typeahead', self.$container).length === 0) {
	            self.add(self.$input.val());
	            self.$input.val('');
	          }
	        }, self));
	      }
	
	      self.$container.on('keydown', 'input', $.proxy(function (event) {
	        var $input = $(event.target),
	            $inputWrapper = self.findInputWrapper();
	
	        if (self.$element.attr('disabled')) {
	          self.$input.attr('disabled', 'disabled');
	          return;
	        }
	
	        switch (event.which) {
	          // BACKSPACE
	          case 8:
	            if (doGetCaretPosition($input[0]) === 0) {
	              var prev = $inputWrapper.prev();
	              if (prev) {
	                self.remove(prev.data('item'));
	              }
	            }
	            break;
	
	          // DELETE
	          case 46:
	            if (doGetCaretPosition($input[0]) === 0) {
	              var next = $inputWrapper.next();
	              if (next) {
	                self.remove(next.data('item'));
	              }
	            }
	            break;
	
	          // LEFT ARROW
	          case 37:
	            // Try to move the input before the previous tag
	            var $prevTag = $inputWrapper.prev();
	            if ($input.val().length === 0 && $prevTag[0]) {
	              $prevTag.before($inputWrapper);
	              $input.focus();
	            }
	            break;
	          // RIGHT ARROW
	          case 39:
	            // Try to move the input after the next tag
	            var $nextTag = $inputWrapper.next();
	            if ($input.val().length === 0 && $nextTag[0]) {
	              $nextTag.after($inputWrapper);
	              $input.focus();
	            }
	            break;
	          default:
	          // ignore
	        }
	
	        // Reset internal input's size
	        var textLength = $input.val().length,
	            wordSpace = Math.ceil(textLength / 5),
	            size = textLength + wordSpace + 1;
	        $input.attr('size', Math.max(this.inputSize, $input.val().length));
	      }, self));
	
	      self.$container.on('keypress', 'input', $.proxy(function (event) {
	        var $input = $(event.target);
	
	        if (self.$element.attr('disabled')) {
	          self.$input.attr('disabled', 'disabled');
	          return;
	        }
	
	        var text = $input.val(),
	            maxLengthReached = self.options.maxChars && text.length >= self.options.maxChars;
	        if (self.options.freeInput && (keyCombinationInList(event, self.options.confirmKeys) || maxLengthReached)) {
	          self.add(maxLengthReached ? text.substr(0, self.options.maxChars) : text);
	          $input.val('');
	          event.preventDefault();
	        }
	
	        // Reset internal input's size
	        var textLength = $input.val().length,
	            wordSpace = Math.ceil(textLength / 5),
	            size = textLength + wordSpace + 1;
	        $input.attr('size', Math.max(this.inputSize, $input.val().length));
	      }, self));
	
	      // Remove icon clicked
	      self.$container.on('click', '[data-role=remove]', $.proxy(function (event) {
	        if (self.$element.attr('disabled')) {
	          return;
	        }
	        self.remove($(event.target).closest('.tag').data('item'));
	      }, self));
	
	      // Only add existing value as tags when using strings as tags
	      if (self.options.itemValue === defaultOptions.itemValue) {
	        if (self.$element[0].tagName === 'INPUT') {
	          self.add(self.$element.val());
	        } else {
	          $('option', self.$element).each(function () {
	            self.add($(this).attr('value'), true);
	          });
	        }
	      }
	    },
	
	    /**
	     * Removes all tagsinput behaviour and unregsiter all event handlers
	     */
	    destroy: function destroy() {
	      var self = this;
	
	      // Unbind events
	      self.$container.off('keypress', 'input');
	      self.$container.off('click', '[role=remove]');
	
	      self.$container.remove();
	      self.$element.removeData('tagsinput');
	      self.$element.show();
	    },
	
	    /**
	     * Sets focus on the tagsinput
	     */
	    focus: function focus() {
	      this.$input.focus();
	    },
	
	    /**
	     * Returns the internal input element
	     */
	    input: function input() {
	      return this.$input;
	    },
	
	    /**
	     * Returns the element which is wrapped around the internal input. This
	     * is normally the $container, but typeahead.js moves the $input element.
	     */
	    findInputWrapper: function findInputWrapper() {
	      var elt = this.$input[0],
	          container = this.$container[0];
	      while (elt && elt.parentNode !== container) elt = elt.parentNode;
	
	      return $(elt);
	    }
	  };
	
	  /**
	   * Register JQuery plugin
	   */
	  $.fn.tagsinput = function (arg1, arg2) {
	    var results = [];
	
	    this.each(function () {
	      var tagsinput = $(this).data('tagsinput');
	      // Initialize a new tags input
	      if (!tagsinput) {
	        tagsinput = new TagsInput(this, arg1);
	        $(this).data('tagsinput', tagsinput);
	        results.push(tagsinput);
	
	        if (this.tagName === 'SELECT') {
	          $('option', $(this)).attr('selected', 'selected');
	        }
	
	        // Init tags from $(this).val()
	        $(this).val($(this).val());
	      } else if (!arg1 && !arg2) {
	        // tagsinput already exists
	        // no function, trying to init
	        results.push(tagsinput);
	      } else if (tagsinput[arg1] !== undefined) {
	        // Invoke function on existing tags input
	        var retVal = tagsinput[arg1](arg2);
	        if (retVal !== undefined) results.push(retVal);
	      }
	    });
	
	    if (typeof arg1 == 'string') {
	      // Return the results from the invoked function calls
	      return results.length > 1 ? results : results[0];
	    } else {
	      return results;
	    }
	  };
	
	  $.fn.tagsinput.Constructor = TagsInput;
	
	  /**
	   * Most options support both a string or number as well as a function as
	   * option value. This function makes sure that the option with the given
	   * key in the given options is wrapped in a function
	   */
	  function makeOptionItemFunction(options, key) {
	    if (typeof options[key] !== 'function') {
	      var propertyName = options[key];
	      options[key] = function (item) {
	        return item[propertyName];
	      };
	    }
	  }
	  function makeOptionFunction(options, key) {
	    if (typeof options[key] !== 'function') {
	      var value = options[key];
	      options[key] = function () {
	        return value;
	      };
	    }
	  }
	  /**
	   * HtmlEncodes the given value
	   */
	  var htmlEncodeContainer = $('<div />');
	  function htmlEncode(value) {
	    if (value) {
	      return htmlEncodeContainer.text(value).html();
	    } else {
	      return '';
	    }
	  }
	
	  /**
	   * Returns the position of the caret in the given input field
	   * http://flightschool.acylt.com/devnotes/caret-position-woes/
	   */
	  function doGetCaretPosition(oField) {
	    var iCaretPos = 0;
	    if (document.selection) {
	      oField.focus();
	      var oSel = document.selection.createRange();
	      oSel.moveStart('character', -oField.value.length);
	      iCaretPos = oSel.text.length;
	    } else if (oField.selectionStart || oField.selectionStart == '0') {
	      iCaretPos = oField.selectionStart;
	    }
	    return iCaretPos;
	  }
	
	  /**
	    * Returns boolean indicates whether user has pressed an expected key combination. 
	    * @param object keyPressEvent: JavaScript event object, refer
	    *     http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	    * @param object lookupList: expected key combinations, as in:
	    *     [13, {which: 188, shiftKey: true}]
	    */
	  function keyCombinationInList(keyPressEvent, lookupList) {
	    var found = false;
	    $.each(lookupList, function (index, keyCombination) {
	      if (typeof keyCombination === 'number' && keyPressEvent.which === keyCombination) {
	        found = true;
	        return false;
	      }
	
	      if (keyPressEvent.which === keyCombination.which) {
	        var alt = !keyCombination.hasOwnProperty('altKey') || keyPressEvent.altKey === keyCombination.altKey,
	            shift = !keyCombination.hasOwnProperty('shiftKey') || keyPressEvent.shiftKey === keyCombination.shiftKey,
	            ctrl = !keyCombination.hasOwnProperty('ctrlKey') || keyPressEvent.ctrlKey === keyCombination.ctrlKey;
	        if (alt && shift && ctrl) {
	          found = true;
	          return false;
	        }
	      }
	    });
	
	    return found;
	  }
	
	  /**
	   * Initialize tagsinput behaviour on inputs and selects which have
	   * data-role=tagsinput
	   */
	  $(function () {
	    $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
	  });
	})(window.jQuery);

/***/ },

/***/ 158:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var Utils = __webpack_require__(3);
	var Urls = __webpack_require__(5);
	var cloudinary = __webpack_require__(159);
	//require('typeahead.js');
	__webpack_require__(145);
	__webpack_require__(160);
	//require('bootstrap-fileinput');
	__webpack_require__(161);
	var Bloodhound = __webpack_require__(4);
	
	function SkillDescribeForm(certificate_form, my_callback) {
	
	    var tag_input = $('#id_tags');
	    var citynames = new Bloodhound({
	        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
	        queryTokenizer: Bloodhound.tokenizers.whitespace,
	        // local: $.map(that.props.tags, function(state) { return { name: state }; })
	        prefetch: {
	            url: Urls['users:api_tags'](),
	            filter: function filter(list) {
	                return $.map(list, function (nn) {
	                    return nn;
	                });
	            }
	        }
	    });
	    var certificates = Utils.getBloodhoundInstanceT('award_name', function () {
	        return Urls['users:api_certificates']();
	    });
	    citynames.initialize();
	    certificates.initialize();
	
	    tag_input.tagsinput({
	        // itemValue: 'name',
	        typeaheadjs: {
	            name: 'citynames',
	            displayKey: 'name',
	            source: citynames.ttAdapter()
	        }
	    });
	    $(".twitter-typeahead").css('display', 'inline');
	    function increment(index, value) {
	        console.log(value);
	        var el = $(value);
	
	        var options = {
	            'showUpload': false,
	            showRemove: false,
	            showPreview: false,
	            allowedFileTypes: ["image"]
	        };
	
	        el.attr('id', 'skillcertificate_set-' + index + '-row');
	        el.find('input.award').attr('id', 'id_skillcertificate_set-' + index + '-award_name').attr('name', 'skillcertificate_set-' + index + '-award_name').typeahead(null, {
	            name: 'certificates',
	            displayKey: 'award_name',
	            source: certificates.ttAdapter()
	
	        });
	        el.find('input.institution').attr('id', 'id_skillcertificate_set-' + index + '-award_institution').attr('name', 'skillcertificate_set-' + index + '-award_institution');
	        el.find('input[type="file"]').attr('id', 'id_skillcertificate_set-' + index + '-award_proof').attr('data-cloudinary-field', 'skillcertificate_set-' + index + '-award_proof');
	        //.fileinput(options);
	        el.find('input.delete_form').attr('id', 'id_skillcertificate_set-' + index + '-DELETE').attr('name', 'skillcertificate_set-' + index + '-DELETE');
	        el.find('input.id_form').attr('id', 'id_skillcertificate_set-' + index + '-id').attr('name', 'skillcertificate_set-' + index + '-id');
	    }
	
	    function incrementForms() {
	        var schedules = $('#certificate-form .form-base');
	        $.each(schedules, increment);
	        $('#id_skillcertificate_set-TOTAL_FORMS').val(schedules.length);
	        $('.delete-row').addClass('hide');
	    }
	
	    $('#certificate-form .form-base').formset({ addText: 'another credential?' });
	    certificate_form.parsley();
	    incrementForms();
	    var form_element = {};
	    var max_form_count = $('#id_skillcertificate_set-MAX_NUM_FORMS').val();
	    if (max_form_count >= 1 && max_form_count < 2) {
	        var el = $('#certificate-form .form-base input[type=file]');
	        form_element.class_name = el.attr('class');
	        form_element["data-cloudinary-field"] = el.attr('data-cloudinary-field');
	        form_element["data-form-data"] = el.attr('data-form-data');
	        form_element["data-url"] = el.attr('data-url');
	        $('#certificate-form .form-base').remove();
	    }
	    if ($('#certificate-form .form-base').length >= max_form_count) {
	        $('#certificate-form .add-row').addClass('hide');
	    }
	    function CloudinaryInitialize(fo_el) {
	        if (fo_el.class_name) {
	            $.each($('#certificate-form .form-base'), function (index, val) {
	                $(val).attr("class", fo_el["class_name"]).attr("data-cloudinary-field", fo_el["data-cloudinary-field"]).attr("data-form-data", fo_el["data-form-data"]).attr("data-url", fo_el["data-url"]);
	            });
	        }
	    }
	
	    $('#certificate-form .add-row').on('click', function (e) {
	        Utils.HideFormsetControl($('#certificate-form .form-base'), $(this), max_form_count);
	        incrementForms();
	        CloudinaryInitialize(form_element);
	    });
	    var totalChars = 70; //Total characters allowed in textarea
	    var countTextBox = $('#id_heading'); // Textarea input box
	    var descriptionInput = $('#id_description'),
	        descriptionCounter = $('#description_counter'),
	        teachingMethodInput = $('#id_teaching_method'),
	        teachingCounter = $('#teaching_counter');
	    descriptionCounter.text(1200);
	    teachingCounter.text(1200);
	    var charsCountEl = $('#textCounter'); // Remaining chars count will be displayed here
	    charsCountEl.text(totalChars); //initial value of countchars element
	    descriptionInput.keyup(function () {
	        // Utils.keyupCallback(this,1200,descriptionCounter);
	    });
	    teachingMethodInput.keyup(function () {
	        // Utils.keyupCallback(this,1200,teachingCounter);
	    });
	    countTextBox.keyup(function () {
	        //user releases a key on the keyboard
	        Utils.keyupCallback(this, totalChars, charsCountEl);
	    });
	    my_callback($('#certificate_form .form-base'), $('#certificate-form').find('.add-row'));
	}
	
	function SkillMediaForm(callback) {
	
	    var image_container = $('#image_container');
	    $('#id_image.cloudinary-fileupload').bind('cloudinarydone', function (e, data) {
	        image_container.html($.cloudinary.image(data.result.public_id, {
	            format: data.result.format, width: 225, height: 225, crop: "fill"
	        }));
	        console.log($('#edit_subject_form').serialize());
	        //$('#id_image.cloudinary-fileupload').val(data.result.public_id);
	        return true;
	    });
	    cloudinary.setCloudName(window.CloudName);
	    $('#upload_widget_multiple').on('click', function (e) {
	        e.preventDefault();
	        var exhibitions = $('input[name="attachment"]');
	        exhibitions.remove();
	        $('.cloudinary-thumbnails').remove();
	        cloudinary.openUploadWidget({
	            upload_preset: 'exhibitions',
	            form: '.upload_multiple_images_holder',
	            thumbnails: '.upload_multiple_images_holder',
	            max_files: 2,
	            client_allowed_formats: ["png", "gif", "jpeg"],
	            field_name: 'attachment',
	            thumbnail_transformation: { width: 200, height: 200, crop: 'fill' }
	        }, function (error, result) {
	            console.log(result);
	            var values = $('input[name="attachment"]').map(function () {
	                return this.value;
	            });
	            $.each($('input[name="attachment"]'), function (e, v) {
	                $(v).val($(v).attr('data-cloudinary-public-id'));
	            });
	
	            console.log(values);
	            console.log($('#edit_subject_form').serialize());
	            console.log(error, result);
	        });
	    });
	    callback();
	}
	
	function SkillSetPriceForm() {
	    var monthly_price = $('#monthly_price'),
	        weekly_price = $('#weekly_price'),
	        hour_select = $('#id_hours_per_day'),
	        price_input = $('#id_price'),
	        monthly_booking = $('#id_monthly_booking'),
	        day_select = $('#id_days_per_week');
	
	    price_input.filter_input({ regex: '[0-9]' });
	    price_input.on('keyup', function () {
	        calculatePrice('hour', $(this).val(), 1);
	        // calculatePrice('month', $(this).val(), 1);
	        calculateDiscount(parseInt($('#id_discount').val()));
	    });
	    $('#subject-price-form').parsley();
	    $('#subject-price-form').on('submit', function () {
	        $('#id_hours_per_day').attr('disabled', false);
	        $('#id_days_per_week').attr('disabled', false);
	    });
	
	    function toggleMonthlySupport() {
	        var mb = $('#id_monthly_booking');
	        if (mb.is(':checked')) {
	            $('#id_hours_per_day').attr('disabled', false).attr('required', true);
	            $('#id_days_per_week').attr('disabled', false).attr('required', true);
	
	            $('#monthly_support').removeClass('well');
	            // $('#monthly_support').show();
	        } else {
	                $('#id_hours_per_day').attr('disabled', true).removeAttr('required');
	                $('#id_days_per_week').attr('disabled', true).removeAttr('required');
	                $('#monthly_support').addClass('well');
	                // $('#monthly_support').hide();
	            }
	        $('#edit_subject_form').parsley();
	        console.log('true');
	    }
	
	    toggleMonthlySupport();
	    monthly_booking.on('click', function () {
	        toggleMonthlySupport();
	    });
	    $('#id_discount').on('change', function () {
	        var tag = $(this).find("option:selected");
	        calculateDiscount(parseInt(tag.val()));
	        // $('#discount_price').text((100-parseInt(tag.val()))*parseInt($('#id_price').val())/100);
	    });
	
	    function calculateDiscount(value) {
	        var percent = 100 - value;
	        var result = percent * parseInt($('#id_price').val()) / 100;
	        $('#discount_price').text(result);
	    }
	
	    function calculatePrice(option, price, multiplier) {
	        if (option === 'hour') {
	            var weekly_result = parseInt($('#id_days_per_week').val()) * parseInt(price) * parseInt($('#id_hours_per_day').val());
	            weekly_price.text(weekly_result);
	            monthly_price.text(weekly_result * 4);
	        } else {
	            weekly_result = parseInt(price) * parseInt(multiplier) * parseInt($('#id_hours_per_day').val());
	            monthly_price.text(weekly_result * 4);
	            weekly_price.text(weekly_result);
	        }
	    }
	
	    calculatePrice('hour', price_input.val(), 1);
	    // calculatePrice('month', price_input.val(), 1);
	
	    hour_select.on('change', function () {
	        var price = $('#id_price').val();
	        var tag = $(this).find("option:selected");
	        if (price) {
	            calculatePrice('hour', price, tag.val());
	        } else {
	            calculatePrice('hour', 0, tag.val());
	        }
	    });
	    day_select.on('change', function () {
	        var price = $('#id_price').val();
	        var tag = $(this).find("option:selected");
	
	        if (price) {
	            calculatePrice('month', price, tag.val());
	        } else {
	            calculatePrice('month', 0, tag.val());
	        }
	    });
	}
	
	module.exports = {
	    DescribeForm: SkillDescribeForm,
	    MediaForm: SkillMediaForm,
	    SetPriceForm: SkillSetPriceForm,
	    ParsleyConfig: Utils.ParsleyConfig
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 159:
/***/ function(module, exports) {

	module.exports = cloudinary;

/***/ },

/***/ 160:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/**
	 * jQuery Formset 1.3-pre
	 * @author Stanislaus Madueke (stan DOT madueke AT gmail DOT com)
	 * @requires jQuery 1.2.6 or later
	 *
	 * Copyright (c) 2009, Stanislaus Madueke
	 * All rights reserved.
	 *
	 * Licensed under the New BSD License
	 * See: http://www.opensource.org/licenses/bsd-license.php
	 */
	'use strict';
	
	;(function ($) {
	    $.fn.formset = function (opts) {
	        var options = $.extend({}, $.fn.formset.defaults, opts),
	            flatExtraClasses = options.extraClasses.join(' '),
	            totalForms = $('#id_' + options.prefix + '-TOTAL_FORMS'),
	            maxForms = $('#id_' + options.prefix + '-MAX_NUM_FORMS'),
	            childElementSelector = 'input,select,textarea,label,div',
	            $$ = $(this),
	            applyExtraClasses = function applyExtraClasses(row, ndx) {
	            if (options.extraClasses) {
	                row.removeClass(flatExtraClasses);
	                row.addClass(options.extraClasses[ndx % options.extraClasses.length]);
	            }
	        },
	            updateElementIndex = function updateElementIndex(elem, prefix, ndx) {
	            var idRegex = new RegExp(prefix + '-(\\d+|__prefix__)-'),
	                replacement = prefix + '-' + ndx + '-';
	            if (elem.attr("for")) elem.attr("for", elem.attr("for").replace(idRegex, replacement));
	            if (elem.attr('id')) elem.attr('id', elem.attr('id').replace(idRegex, replacement));
	            if (elem.attr('name')) elem.attr('name', elem.attr('name').replace(idRegex, replacement));
	        },
	            hasChildElements = function hasChildElements(row) {
	            return row.find(childElementSelector).length > 0;
	        },
	            showAddButton = function showAddButton() {
	            return maxForms.length == 0 || // For Django versions pre 1.2
	            maxForms.val() == '' || maxForms.val() - totalForms.val() > 0;
	        },
	            insertDeleteLink = function insertDeleteLink(row) {
	            if (row.is('TR')) {
	                // If the forms are laid out in table rows, insert
	                // the remove button into the last table cell:
	                row.children(':last').append('<a class="' + options.deleteCssClass + '" href="javascript:void(0)">' + options.deleteText + '</a>');
	            } else if (row.is('UL') || row.is('OL')) {
	                // If they're laid out as an ordered/unordered list,
	                // insert an <li> after the last list item:
	                row.append('<li><a class="' + options.deleteCssClass + '" href="javascript:void(0)">' + options.deleteText + '</a></li>');
	            } else {
	                // Otherwise, just insert the remove button as the
	                // last child element of the form's container:
	                row.append('<a class="' + options.deleteCssClass + '" href="javascript:void(0)">' + options.deleteText + '</a>');
	            }
	            row.find('a.' + options.deleteCssClass).click(function () {
	                var row = $(this).parents('.' + options.formCssClass),
	                    del = row.find('input:hidden[id $= "-DELETE"]'),
	                    buttonRow = row.siblings("a." + options.addCssClass + ', .' + options.formCssClass + '-add'),
	                    forms;
	                if (del.length) {
	                    // We're dealing with an inline formset.
	                    // Rather than remove this form from the DOM, we'll mark it as deleted
	                    // and hide it, then let Django handle the deleting:
	                    del.val('on');
	                    row.hide();
	                    forms = $('.' + options.formCssClass).not(':hidden');
	                } else {
	                    row.remove();
	                    // Update the TOTAL_FORMS count:
	                    forms = $('.' + options.formCssClass).not('.formset-custom-template');
	                    totalForms.val(forms.length);
	                }
	                for (var i = 0, formCount = forms.length; i < formCount; i++) {
	                    // Apply `extraClasses` to form rows so they're nicely alternating:
	                    applyExtraClasses(forms.eq(i), i);
	                    if (!del.length) {
	                        // Also update names and IDs for all child controls (if this isn't
	                        // a delete-able inline formset) so they remain in sequence:
	                        forms.eq(i).find(childElementSelector).each(function () {
	                            updateElementIndex($(this), options.prefix, i);
	                        });
	                    }
	                }
	                // Check if we need to show the add button:
	                if (buttonRow.is(':hidden') && showAddButton()) buttonRow.show();
	                // If a post-delete callback was provided, call it with the deleted form:
	                if (options.removed) options.removed(row);
	                return false;
	            });
	        };
	
	        $$.each(function (i) {
	            var row = $(this),
	                del = row.find('input:checkbox[id $= "-DELETE"]');
	            if (del.length) {
	                // If you specify "can_delete = True" when creating an inline formset,
	                // Django adds a checkbox to each form in the formset.
	                // Replace the default checkbox with a hidden field:
	                if (del.is(':checked')) {
	                    // If an inline formset containing deleted forms fails validation, make sure
	                    // we keep the forms hidden (thanks for the bug report and suggested fix Mike)
	                    del.before('<input type="hidden" name="' + del.attr('name') + '" id="' + del.attr('id') + '" value="on" />');
	                    row.hide();
	                } else {
	                    del.before('<input type="hidden" name="' + del.attr('name') + '" id="' + del.attr('id') + '" />');
	                }
	                // Hide any labels associated with the DELETE checkbox:
	                $('label[for="' + del.attr('id') + '"]').hide();
	                del.remove();
	            }
	            if (hasChildElements(row)) {
	                row.addClass(options.formCssClass);
	                if (row.is(':visible')) {
	                    insertDeleteLink(row);
	                    applyExtraClasses(row, i);
	                }
	            }
	        });
	
	        if ($$.length) {
	            var hideAddButton = !showAddButton(),
	                addButton,
	                template;
	            if (options.formTemplate) {
	                // If a form template was specified, we'll clone it to generate new form instances:
	                template = options.formTemplate instanceof $ ? options.formTemplate : $(options.formTemplate);
	                template.removeAttr('id').addClass(options.formCssClass + ' formset-custom-template');
	                template.find(childElementSelector).each(function () {
	                    updateElementIndex($(this), options.prefix, '__prefix__');
	                });
	                insertDeleteLink(template);
	            } else {
	                // Otherwise, use the last form in the formset; this works much better if you've got
	                // extra (>= 1) forms (thnaks to justhamade for pointing this out):
	                template = $('.' + options.formCssClass + ':last').clone(true).removeAttr('id');
	                template.find('input:hidden[id $= "-DELETE"]').remove();
	                // Clear all cloned fields, except those the user wants to keep (thanks to brunogola for the suggestion):
	                template.find(childElementSelector).not(options.keepFieldValues).each(function () {
	                    var elem = $(this);
	                    // If this is a checkbox or radiobutton, uncheck it.
	                    // This fixes Issue 1, reported by Wilson.Andrew.J:
	                    if (elem.is('input:checkbox') || elem.is('input:radio')) {
	                        elem.attr('checked', false);
	                    } else {
	                        elem.val('');
	                    }
	                });
	            }
	            // FIXME: Perhaps using $.data would be a better idea?
	            options.formTemplate = template;
	
	            if ($$.attr('tagName') == 'TR') {
	                // If forms are laid out as table rows, insert the
	                // "add" button in a new table row:
	                var numCols = $$.eq(0).children().length,
	                    // This is a bit of an assumption :|
	                buttonRow = $('<tr><td colspan="' + numCols + '"><a class="' + options.addCssClass + '" href="javascript:void(0)">' + options.addText + '</a></tr>').addClass(options.formCssClass + '-add');
	                $$.parent().append(buttonRow);
	                if (hideAddButton) buttonRow.hide();
	                addButton = buttonRow.find('a');
	            } else {
	                // Otherwise, insert it immediately after the last form:
	                $$.filter(':last').after('<a class="' + options.addCssClass + '" href="javascript:void(0)">' + options.addText + '</a>');
	                addButton = $$.filter(':last').next();
	                if (hideAddButton) addButton.hide();
	            }
	            addButton.click(function () {
	                var formCount = parseInt(totalForms.val()),
	                    row = options.formTemplate.clone(true).removeClass('formset-custom-template'),
	                    buttonRow = $($(this).parents('tr.' + options.formCssClass + '-add').get(0) || this);
	                applyExtraClasses(row, formCount);
	                row.insertBefore(buttonRow).show();
	                row.find(childElementSelector).each(function () {
	                    updateElementIndex($(this), options.prefix, formCount);
	                });
	                totalForms.val(formCount + 1);
	                // Check if we've exceeded the maximum allowed number of forms:
	                if (!showAddButton()) buttonRow.hide();
	                // If a post-add callback was supplied, call it with the added form:
	                if (options.added) options.added(row);
	                return false;
	            });
	        }
	
	        return $$;
	    };
	
	    /* Setup plugin defaults */
	    $.fn.formset.defaults = {
	        prefix: 'form', // The form prefix for your django formset
	        formTemplate: null, // The jQuery selection cloned to generate new form instances
	        addText: 'add another', // Text for the add link
	        deleteText: 'remove', // Text for the delete link
	        addCssClass: 'add-row', // CSS class applied to the add link
	        deleteCssClass: 'delete-row', // CSS class applied to the delete link
	        formCssClass: 'dynamic-form', // CSS class applied to each form in a formset
	        extraClasses: [], // Additional CSS classes, which will be applied to each form in turn
	        keepFieldValues: '', // jQuery selector for fields whose values should be kept when the form is cloned
	        added: null, // Function called each time a new form is added
	        removed: null // Function called each time a form is deleted
	    };
	})(jQuery);
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 161:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(jQuery) {/*
	
	  Author - Rudolf Naprstek
	  Website - http://www.thimbleopensource.com/tutorials-snippets/jquery-plugin-filter-text-input
	  Version - 1.5.3
	  Release - 12th February 2014
	
	  Thanks to Niko Halink from ARGH!media for bugfix!
	
	  Remy Blom: Added a callback function when the filter surpresses a keypress in order to give user feedback
	
	  Don Myers: Added extension for using predefined filter masks
	
	  Richard Eddy: Added extension for using negative number
	
	
	*/
	
	'use strict';
	
	(function ($) {
	
	  $.fn.extend({
	
	    filter_input: function filter_input(options) {
	
	      var defaults = {
	        regex: ".",
	        negkey: false, // use "-" if you want to allow minus sign at the beginning of the string
	        live: false,
	        events: 'keypress paste'
	      };
	
	      var options = $.extend(defaults, options);
	
	      function filter_input_function(event) {
	
	        var input = event.input ? event.input : $(this);
	        if (event.ctrlKey || event.altKey) return;
	        if (event.type == 'keypress') {
	
	          var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
	
	          // 8 = backspace, 9 = tab, 13 = enter, 35 = end, 36 = home, 37 = left, 39 = right, 46 = delete
	          if (key == 8 || key == 9 || key == 13 || key == 35 || key == 36 || key == 37 || key == 39 || key == 46) {
	
	            // if charCode = key & keyCode = 0
	            // 35 = #, 36 = $, 37 = %, 39 = ', 46 = .
	
	            if (event.charCode == 0 && event.keyCode == key) {
	              return true;
	            }
	          }
	          var string = String.fromCharCode(key);
	          // if they pressed the defined negative key
	          if (options.negkey && string == options.negkey) {
	            // if there is already one at the beginning, remove it
	            if (input.val().substr(0, 1) == string) {
	              input.val(input.val().substring(1, input.val().length)).change();
	            } else {
	              // it isn't there so add it to the beginning of the string
	              input.val(string + input.val()).change();
	            }
	            return false;
	          }
	          var regex = new RegExp(options.regex);
	        } else if (event.type == 'paste') {
	          input.data('value_before_paste', event.target.value);
	          setTimeout(function () {
	            filter_input_function({ type: 'after_paste', input: input });
	          }, 1);
	          return true;
	        } else if (event.type == 'after_paste') {
	          var string = input.val();
	          var regex = new RegExp('^(' + options.regex + ')+$');
	        } else {
	          return false;
	        }
	
	        if (regex.test(string)) {
	          return true;
	        } else if (typeof options.feedback == 'function') {
	          options.feedback.call(this, string);
	        }
	        if (event.type == 'after_paste') input.val(input.data('value_before_paste'));
	        return false;
	      }
	
	      var jquery_version = $.fn.jquery.split('.');
	      if (options.live) {
	        if (parseInt(jquery_version[0]) >= 1 && parseInt(jquery_version[1]) >= 7) {
	          $(this).on(options.events, filter_input_function);
	        } else {
	          $(this).live(options.events, filter_input_function);
	        }
	      } else {
	        return this.each(function () {
	          var input = $(this);
	          if (parseInt(jquery_version[0]) >= 1 && parseInt(jquery_version[1]) >= 7) {
	            input.off(options.events).on(options.events, filter_input_function);
	          } else {
	            input.unbind(options.events).bind(options.events, filter_input_function);
	          }
	        });
	      }
	    }
	  });
	})(jQuery);
	
	/*
	Â  Author - Don Myers
	Â  Version - 0.1.0
	Â  Release - March 1st 2013
	*/

	/*
	use any of these filters or regular expression in some cases the regular expression is shorter but for some people the "names" might be easier
	 ie.
	 <input type="text" name="first_name" value="" data-mask="[a-zA-Z ]" placeholder="eg. John"/>
	 <input type="text" name="last_name" value="" data-mask="int" placeholder="eg. Smith"/>
	*/

	/*
	jQuery(document).ready(function() {

	  var masks = {
	    'int': Â  Â  /[\d]/,
	    'float': Â  Â  /[\d\.]/,
	    'money': Â  Â /[\d\.\s,]/,
	    'num': Â  Â  Â /[\d\-\.]/,
	    'hex': Â  Â  Â /[0-9a-f]/i,
	    'email': Â  Â /[a-z0-9_\.\-@]/i,
	    'alpha': Â  Â /[a-z_]/i,
	    'alphanum': /[a-z0-9_]/i,
	    'alphanumlower':/[a-z0-9_]/,
	    'alphaspace': Â  Â /[a-z ]/i,
	    'alphanumspace': /[a-z0-9_ ]/i,
	    'alphanumspacelower':/[a-z0-9_ ]/
	  };

	  jQuery('input[data-mask]').each(function(idx) {
	    var mask = jQuery(this).data('mask');
	    var regex = (masks[mask]) ? masks[mask] : mask;

	    jQuery(this).filter_input({ regex: regex, live: true });Â
	  });
	});

	*/
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 458:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {'use strict';
	
	var _ = __webpack_require__(120);
	var Urls = __webpack_require__(5);
	var Utils = __webpack_require__(3);
	var Skill = __webpack_require__(158);
	Skill.ParsleyConfig();
	// require('parsley.remote');
	__webpack_require__(12);
	__webpack_require__(145);
	__webpack_require__(160);
	__webpack_require__(459);
	__webpack_require__(161);
	
	(function () {
	    var form = $('#edit_subject_form');
	    Skill.DescribeForm(form, function (fset, addNode) {
	        Utils.HideFormsetControl(fset, addNode, fset.length);
	        $(".twitter-typeahead").css('display', 'inline');
	    });
	    Skill.SetPriceForm();
	    Skill.MediaForm(function () {
	        $("#id_attachments").on('', function () {
	            $('#exhibition-pics').hide();
	        });
	    });
	
	    form.parsley();
	    form.submit(function (e) {
	        //e.preventDefault();
	        var total_form = $('#id_skillcertificate_set-TOTAL_FORMS');
	        var empty = '';
	        $.each($('#certificate-form .form-base'), function (index, val) {
	            var institution = $(val).find('input.form-control.institution').val().trim();
	            var award = $(val).find('input.form-control.award.tt-input').val().trim();
	            empty += institution + award;
	        });
	        if (empty == false) {
	            total_form.val("0");
	            console.log(total_form.val());
	        }
	    });
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },

/***/ 459:
/***/ function(module, exports) {

	/*!
	 * @copyright Copyright &copy; Kartik Visweswaran, Krajee.com, 2014 - 2015
	 * @version 4.1.9
	 *
	 * File input styled for Bootstrap 3.0 that utilizes HTML5 File Input's advanced 
	 * features including the FileReader API. 
	 * 
	 * The plugin drastically enhances the HTML file input to preview multiple files on the client before
	 * upload. In addition it provides the ability to preview content of images, text, videos, audio, html, 
	 * flash and other objects. It also offers the ability to upload and delete files using AJAX, and add 
	 * files in batches (i.e. preview, append, or remove before upload).
	 * 
	 * Author: Kartik Visweswaran
	 * Copyright: 2015, Kartik Visweswaran, Krajee.com
	 * For more JQuery plugins visit http://plugins.krajee.com
	 * For more Yii related demos visit http://demos.krajee.com
	 */"use strict";(function($){"use strict";String.prototype.repl = function(from,to){return this.split(from).join(to);};var isIE=function isIE(ver){var div=document.createElement("div"),status;div.innerHTML = "<!--[if IE " + ver + "]><i></i><![endif]-->";status = div.getElementsByTagName("i").length === 1;document.body.appendChild(div);div.parentNode.removeChild(div);return status;},previewCache={data:{},init:function init(obj){var content=obj.initialPreview,id=obj.id;if(content.length > 0 && !isArray(content)){content = content.split(obj.initialPreviewDelimiter);}previewCache.data[id] = {content:content,config:obj.initialPreviewConfig,tags:obj.initialPreviewThumbTags,delimiter:obj.initialPreviewDelimiter,template:obj.previewGenericTemplate,msg:function msg(n){return obj.getMsgSelected(n);},initId:obj.previewInitId,footer:obj.getLayoutTemplate('footer'),isDelete:obj.initialPreviewShowDelete,caption:obj.initialCaption,actions:function actions(showUpload,showDelete,disabled,url,key){return obj.renderFileActions(showUpload,showDelete,disabled,url,key);}};},fetch:function fetch(id){return previewCache.data[id].content.filter(function(n){return n !== null;});},count:function count(id,all){return !!previewCache.data[id] && !!previewCache.data[id].content?all?previewCache.data[id].content.length:previewCache.fetch(id).length:0;},get:function get(id,i,isDisabled){var ind='init_' + i,data=previewCache.data[id],previewId=data.initId + '-' + ind,out;isDisabled = isDisabled === undefined?true:isDisabled;if(data.content[i] === null){return '';}out = data.template.repl('{previewId}',previewId).repl('{frameClass}',' file-preview-initial').repl('{fileindex}',ind).repl('{content}',data.content[i]).repl('{footer}',previewCache.footer(id,i,isDisabled));if(data.tags.length && data.tags[i]){out = replaceTags(out,data.tags[i]);}return out;},add:function add(id,content,config,tags,append){var data=$.extend(true,{},previewCache.data[id]),index;if(!isArray(content)){content = content.split(data.delimiter);}if(append){index = data.content.push(content) - 1;data.config[index] = config;data.tags[index] = tags;}else {index = content.length;data.content = content;data.config = config;data.tags = tags;}previewCache.data[id] = data;return index;},set:function set(id,content,config,tags,append){var data=$.extend(true,{},previewCache.data[id]),i;if(!isArray(content)){content = content.split(data.delimiter);}if(append){for(i = 0;i < content.length;i++) {data.content.push(content[i]);}for(i = 0;i < config.length;i++) {data.config.push(config[i]);}for(i = 0;i < tags.length;i++) {data.tags.push(tags[i]);}}else {data.content = content;data.config = config;data.tags = tags;}previewCache.data[id] = data;},unset:function unset(id,index){var chk=previewCache.count(id);if(!chk){return;}if(chk === 1){previewCache.data[id].content = [];previewCache.data[id].config = [];return;}previewCache.data[id].content[index] = null;previewCache.data[id].config[index] = null;},out:function out(id){var html='',data=previewCache.data[id],caption,len=previewCache.count(id,true);if(len === 0){return {content:'',caption:''};}for(var i=0;i < len;i++) {html += previewCache.get(id,i);}caption = data.msg(previewCache.count(id));return {content:html,caption:caption};},footer:function footer(id,i,isDisabled){var data=previewCache.data[id];isDisabled = isDisabled === undefined?true:isDisabled;if(data.config.length === 0 || isEmpty(data.config[i])){return '';}var config=data.config[i],caption=isSet('caption',config)?config.caption:'',width=isSet('width',config)?config.width:'auto',url=isSet('url',config)?config.url:false,key=isSet('key',config)?config.key:null,disabled=url === false && isDisabled,actions=data.isDelete?data.actions(false,true,disabled,url,key):'',footer=data.footer.repl('{actions}',actions);return footer.repl('{caption}',caption).repl('{width}',width).repl('{indicator}','').repl('{indicatorTitle}','');}},getNum=function getNum(num,def){def = def || 0;if(typeof num === "number"){return num;}if(typeof num === "string"){num = parseFloat(num);}return isNaN(num)?def:num;},hasFileAPISupport=function hasFileAPISupport(){return window.File && window.FileReader;},hasDragDropSupport=function hasDragDropSupport(){var $div=document.createElement('div');return !isIE(9) && ($div.draggable !== undefined || $div.ondragstart !== undefined && $div.ondrop !== undefined);},hasFileUploadSupport=function hasFileUploadSupport(){return hasFileAPISupport && window.FormData;},addCss=function addCss($el,css){$el.removeClass(css).addClass(css);},STYLE_SETTING='style="width:{width};height:{height};"',OBJECT_PARAMS='      <param name="controller" value="true" />\n' + '      <param name="allowFullScreen" value="true" />\n' + '      <param name="allowScriptAccess" value="always" />\n' + '      <param name="autoPlay" value="false" />\n' + '      <param name="autoStart" value="false" />\n' + '      <param name="quality" value="high" />\n',DEFAULT_PREVIEW='<div class="file-preview-other">\n' + '       {previewFileIcon}\n' + '   </div>',defaultFileActionSettings={removeIcon:'<i class="glyphicon glyphicon-trash text-danger"></i>',removeClass:'btn btn-xs btn-default',removeTitle:'Remove file',uploadIcon:'<i class="glyphicon glyphicon-upload text-info"></i>',uploadClass:'btn btn-xs btn-default',uploadTitle:'Upload file',indicatorNew:'<i class="glyphicon glyphicon-hand-down text-warning"></i>',indicatorSuccess:'<i class="glyphicon glyphicon-ok-sign file-icon-large text-success"></i>',indicatorError:'<i class="glyphicon glyphicon-exclamation-sign text-danger"></i>',indicatorLoading:'<i class="glyphicon glyphicon-hand-up text-muted"></i>',indicatorNewTitle:'Not uploaded yet',indicatorSuccessTitle:'Uploaded',indicatorErrorTitle:'Upload Error',indicatorLoadingTitle:'Uploading ...'},tMain1='{preview}\n' + '<div class="kv-upload-progress hide"></div>\n' + '<div class="input-group {class}">\n' + '   {caption}\n' + '   <div class="input-group-btn">\n' + '       {remove}\n' + '       {cancel}\n' + '       {upload}\n' + '       {browse}\n' + '   </div>\n' + '</div>',tMain2='{preview}\n<div class="kv-upload-progress hide"></div>\n{remove}\n{cancel}\n{upload}\n{browse}\n',tPreview='<div class="file-preview {class}">\n' + '    <div class="close fileinput-remove">&times;</div>\n' + '    <div class="{dropClass}">\n' + '    <div class="file-preview-thumbnails">\n' + '    </div>\n' + '    <div class="clearfix"></div>' + '    <div class="file-preview-status text-center text-success"></div>\n' + '    <div class="kv-fileinput-error"></div>\n' + '    </div>\n' + '</div>',tIcon='<span class="glyphicon glyphicon-file kv-caption-icon"></span>',tCaption='<div tabindex="-1" class="form-control file-caption {class}">\n' + '   <span class="file-caption-ellipsis">&hellip;</span>\n' + '   <div class="file-caption-name"></div>\n' + '</div>',tModal='<div id="{id}" class="modal fade">\n' + '  <div class="modal-dialog modal-lg">\n' + '    <div class="modal-content">\n' + '      <div class="modal-header">\n' + '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\n' + '        <h3 class="modal-title">Detailed Preview <small>{title}</small></h3>\n' + '      </div>\n' + '      <div class="modal-body">\n' + '        <textarea class="form-control" style="font-family:Monaco,Consolas,monospace; height: {height}px;" readonly>{body}</textarea>\n' + '      </div>\n' + '    </div>\n' + '  </div>\n' + '</div>',tProgress='<div class="progress">\n' + '    <div class="{class}" role="progressbar"' + ' aria-valuenow="{percent}" aria-valuemin="0" aria-valuemax="100" style="width:{percent}%;">\n' + '        {percent}%\n' + '     </div>\n' + '</div>',tFooter='<div class="file-thumbnail-footer">\n' + '    <div class="file-caption-name">{caption}</div>\n' + '    {actions}\n' + '</div>',tActions='<div class="file-actions">\n' + '    <div class="file-footer-buttons">\n' + '        {upload}{delete}{other}' + '    </div>\n' + '    <div class="file-upload-indicator" tabindex="-1" title="{indicatorTitle}">{indicator}</div>\n' + '    <div class="clearfix"></div>\n' + '</div>',tActionDelete='<button type="button" class="kv-file-remove {removeClass}" ' + 'title="{removeTitle}"{dataUrl}{dataKey}>{removeIcon}</button>\n',tActionUpload='<button type="button" class="kv-file-upload {uploadClass}" title="{uploadTitle}">' + '   {uploadIcon}\n</button>\n',tGeneric='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}">\n' + '   {content}\n' + '   {footer}\n' + '</div>\n',tHtml='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}">\n' + '    <object data="{data}" type="{type}" width="{width}" height="{height}">\n' + '       ' + DEFAULT_PREVIEW + '\n' + '    </object>\n' + '   {footer}\n' + '</div>',tImage='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}">\n' + '   <img src="{data}" class="file-preview-image" title="{caption}" alt="{caption}" ' + STYLE_SETTING + '>\n' + '   {footer}\n' + '</div>\n',tText='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}">\n' + '   <div class="file-preview-text" title="{caption}" ' + STYLE_SETTING + '>\n' + '       {data}\n' + '   </div>\n' + '   {footer}\n' + '</div>',tVideo='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}"' + ' title="{caption}" ' + STYLE_SETTING + '>\n' + '   <video width="{width}" height="{height}" controls>\n' + '       <source src="{data}" type="{type}">\n' + '       ' + DEFAULT_PREVIEW + '\n' + '   </video>\n' + '   {footer}\n' + '</div>\n',tAudio='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}"' + ' title="{caption}" ' + STYLE_SETTING + '>\n' + '   <audio controls>\n' + '       <source src="' + '{data}' + '" type="{type}">\n' + '       ' + DEFAULT_PREVIEW + '\n' + '   </audio>\n' + '   {footer}\n' + '</div>',tFlash='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}"' + ' title="{caption}" ' + STYLE_SETTING + '>\n' + '   <object type="application/x-shockwave-flash" width="{width}" height="{height}" data="{data}">\n' + OBJECT_PARAMS + '       ' + DEFAULT_PREVIEW + '\n' + '   </object>\n' + '   {footer}\n' + '</div>\n',tObject='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}"' + ' title="{caption}" ' + STYLE_SETTING + '>\n' + '   <object data="{data}" type="{type}" width="{width}" height="{height}">\n' + '       <param name="movie" value="{caption}" />\n' + OBJECT_PARAMS + '         ' + DEFAULT_PREVIEW + '\n' + '   </object>\n' + '   {footer}\n' + '</div>',tOther='<div class="file-preview-frame{frameClass}" id="{previewId}" data-fileindex="{fileindex}"' + ' title="{caption}" ' + STYLE_SETTING + '>\n' + '   ' + DEFAULT_PREVIEW + '\n' + '   {footer}\n' + '</div>',defaultLayoutTemplates={main1:tMain1,main2:tMain2,preview:tPreview,icon:tIcon,caption:tCaption,modal:tModal,progress:tProgress,footer:tFooter,actions:tActions,actionDelete:tActionDelete,actionUpload:tActionUpload},defaultPreviewTemplates={generic:tGeneric,html:tHtml,image:tImage,text:tText,video:tVideo,audio:tAudio,flash:tFlash,object:tObject,other:tOther},defaultPreviewTypes=['image','html','text','video','audio','flash','object'],defaultPreviewSettings={image:{width:"auto",height:"160px"},html:{width:"213px",height:"160px"},text:{width:"160px",height:"160px"},video:{width:"213px",height:"160px"},audio:{width:"213px",height:"80px"},flash:{width:"213px",height:"160px"},object:{width:"160px",height:"160px"},other:{width:"160px",height:"160px"}},defaultFileTypeSettings={image:function image(vType,vName){return vType !== undefined?vType.match('image.*'):vName.match(/\.(gif|png|jpe?g)$/i);},html:function html(vType,vName){return vType !== undefined?vType === 'text/html':vName.match(/\.(htm|html)$/i);},text:function text(vType,vName){return vType !== undefined && vType.match('text.*') || vName.match(/\.(txt|md|csv|nfo|php|ini)$/i);},video:function video(vType,vName){return vType !== undefined && vType.match(/\.video\/(ogg|mp4|webm)$/i) || vName.match(/\.(og?|mp4|webm)$/i);},audio:function audio(vType,vName){return vType !== undefined && vType.match(/\.audio\/(ogg|mp3|wav)$/i) || vName.match(/\.(ogg|mp3|wav)$/i);},flash:function flash(vType,vName){return vType !== undefined && vType === 'application/x-shockwave-flash' || vName.match(/\.(swf)$/i);},object:function object(){return true;},other:function other(){return true;}},isEmpty=function isEmpty(value,trim){return value === null || value === undefined || value.length === 0 || trim && $.trim(value) === '';},isArray=function isArray(a){return Array.isArray(a) || Object.prototype.toString.call(a) === '[object Array]';},isSet=function isSet(needle,haystack){return typeof haystack === 'object' && needle in haystack;},getElement=function getElement(options,param,value){return isEmpty(options) || isEmpty(options[param])?value:$(options[param]);},uniqId=function uniqId(){return Math.round(new Date().getTime() + Math.random() * 100);},htmlEncode=function htmlEncode(str){return String(str).repl('&','&amp;').repl('"','&quot;').repl("'",'&#39;').repl('<','&lt;').repl('>','&gt;');},replaceTags=function replaceTags(str,tags){var out=str;tags = tags || {};$.each(tags,function(key,value){if(typeof value === "function"){value = value();}out = out.repl(key,value);});return out;},objUrl=window.URL || window.webkitURL,FileInput=function FileInput(element,options){var self=this;self.$element = $(element);if(!self.validate()){return;}if(hasFileAPISupport() || isIE(9)){self.init(options);self.listen();}else {self.$element.removeClass('file-loading');}};FileInput.prototype = {constructor:FileInput,validate:function validate(){var self=this,$exception;if(self.$element.attr('type') === 'file'){return true;}$exception = '<div class="help-block alert alert-warning">' + '<h4>Invalid Input Type</h4>' + 'You must set an input <code>type = file</code> for <b>bootstrap-fileinput</b> plugin to initialize.' + '</div>';self.$element.after($exception);return false;},init:function init(options){var self=this,$el=self.$element,t;$.each(options,function(key,value){self[key] = key === 'maxFileCount' || key === 'maxFileSize'?getNum(value):value;});self.fileInputCleared = false;self.fileBatchCompleted = true;if(isEmpty(self.allowedPreviewTypes)){self.allowedPreviewTypes = defaultPreviewTypes;}self.uploadFileAttr = !isEmpty($el.attr('name'))?$el.attr('name'):'file_data';self.reader = null;self.formdata = {};self.isIE9 = isIE(9);self.isIE10 = isIE(10);self.filestack = [];self.ajaxRequests = [];self.isError = false;self.ajaxAborted = false;self.dropZoneEnabled = hasDragDropSupport() && self.dropZoneEnabled;self.isDisabled = self.$element.attr('disabled') || self.$element.attr('readonly');self.isUploadable = hasFileUploadSupport && !isEmpty(self.uploadUrl);self.slug = typeof options.slugCallback === "function"?options.slugCallback:self.slugDefault;self.mainTemplate = self.showCaption?self.getLayoutTemplate('main1'):self.getLayoutTemplate('main2');self.captionTemplate = self.getLayoutTemplate('caption');self.previewGenericTemplate = self.getPreviewTemplate('generic');if(isEmpty(self.$element.attr('id'))){self.$element.attr('id',uniqId());}if(self.$container === undefined){self.$container = self.createContainer();}else {self.refreshContainer();}self.$progress = self.$container.find('.kv-upload-progress');self.$btnUpload = self.$container.find('.kv-fileinput-upload');self.$captionContainer = getElement(options,'elCaptionContainer',self.$container.find('.file-caption'));self.$caption = getElement(options,'elCaptionText',self.$container.find('.file-caption-name'));self.$previewContainer = getElement(options,'elPreviewContainer',self.$container.find('.file-preview'));self.$preview = getElement(options,'elPreviewImage',self.$container.find('.file-preview-thumbnails'));self.$previewStatus = getElement(options,'elPreviewStatus',self.$container.find('.file-preview-status'));self.$errorContainer = getElement(options,'elErrorContainer',self.$previewContainer.find('.kv-fileinput-error'));if(!isEmpty(self.msgErrorClass)){addCss(self.$errorContainer,self.msgErrorClass);}self.$errorContainer.hide();self.fileActionSettings = $.extend(defaultFileActionSettings,options.fileActionSettings);self.previewInitId = "preview-" + uniqId();self.id = self.$element.attr('id');previewCache.init(self);self.initPreview(true);self.initPreviewDeletes();self.options = options;self.setFileDropZoneTitle();self.uploadCount = 0;self.uploadPercent = 0;self.$element.removeClass('file-loading');t = self.getLayoutTemplate('progress');self.progressTemplate = t.replace('{class}',self.progressClass);self.progressCompleteTemplate = t.replace('{class}',self.progressCompleteClass);self.setEllipsis();},parseError:function parseError(jqXHR,errorThrown,fileName){var self=this,errMsg=$.trim(errorThrown + ''),dot=errMsg.slice(-1) === '.'?'':'.',text=$(jqXHR.responseText).text();if(self.showAjaxErrorDetails){text = $.trim(text.replace(/\n\s*\n/g,'\n'));text = text.length > 0?'<pre>' + text + '</pre>':'';errMsg += dot + text;}else {errMsg += dot;}return fileName?'<b>' + fileName + ': </b>' + jqXHR:errMsg;},raise:function raise(event,params){var self=this,e=$.Event(event),out=false;if(params !== undefined){self.$element.trigger(e,params);}else {self.$element.trigger(e);}if(e.result){out = true;}if(!out){return;}switch(event){ // ignore these events
	case 'filebatchuploadcomplete':case 'filebatchuploadsuccess':case 'fileuploaded':case 'fileclear':case 'filecleared':case 'filereset':case 'fileerror':case 'filefoldererror':case 'fileuploaderror':case 'filebatchuploaderror':case 'filedeleteerror':case 'filecustomerror':break; // can trigger filecustomerror to abort upload
	default:self.ajaxAborted = out;break;}},getLayoutTemplate:function getLayoutTemplate(t){var self=this,template=isSet(t,self.layoutTemplates)?self.layoutTemplates[t]:defaultLayoutTemplates[t];if(isEmpty(self.customLayoutTags)){return template;}return replaceTags(template,self.customLayoutTags);},getPreviewTemplate:function getPreviewTemplate(t){var self=this,template=isSet(t,self.previewTemplates)?self.previewTemplates[t]:defaultPreviewTemplates[t];template = template.repl('{previewFileIcon}',self.previewFileIcon);if(isEmpty(self.customPreviewTags)){return template;}return replaceTags(template,self.customPreviewTags);},getOutData:function getOutData(jqXHR,responseData,filesData){var self=this;jqXHR = jqXHR || {};responseData = responseData || {};filesData = filesData || self.filestack.slice(0) || {};return {form:self.formdata,files:filesData,extra:self.getExtraData(),response:responseData,reader:self.reader,jqXHR:jqXHR};},setEllipsis:function setEllipsis(){var self=this,$capCont=self.$captionContainer,$cap=self.$caption,$div=$cap.clone().css('height','auto').hide();$capCont.parent().before($div);$capCont.removeClass('kv-has-ellipsis');if($div.outerWidth() > $cap.outerWidth()){$capCont.addClass('kv-has-ellipsis');}$div.remove();},listen:function listen(){var self=this,$el=self.$element,$cap=self.$captionContainer,$btnFile=self.$btnFile,$form=$el.closest('form');$el.on('change',$.proxy(self.change,self));$(window).on('resize',function(){self.setEllipsis();});$btnFile.off('click').on('click',function(){self.raise('filebrowse');if(self.isError && !self.isUploadable){self.clear();}$cap.focus();});$form.off('reset').on('reset',$.proxy(self.reset,self));self.$container.off('click').on('click','.fileinput-remove:not([disabled])',$.proxy(self.clear,self)).on('click','.fileinput-cancel',$.proxy(self.cancel,self));if(self.isUploadable && self.dropZoneEnabled && self.showPreview){self.initDragDrop();}if(!self.isUploadable){$form.on('submit',$.proxy(self.submitForm,self));}self.$container.find('.kv-fileinput-upload').off('click').on('click',function(e){if(!self.isUploadable){return;}e.preventDefault();if(!$(this).hasClass('disabled') && isEmpty($(this).attr('disabled'))){self.upload();}});},submitForm:function submitForm(){var self=this,$el=self.$element,files=$el.get(0).files;if(files && files.length < self.minFileCount && self.minFileCount > 0){self.noFilesError({});return false;}return !self.abort({});},abort:function abort(params){var self=this,data;if(self.ajaxAborted && typeof self.ajaxAborted === "object" && self.ajaxAborted.message !== undefined){if(self.ajaxAborted.data !== undefined){data = self.getOutData({},self.ajaxAborted.data);}else {data = self.getOutData();}data = $.extend(data,params);self.showUploadError(self.ajaxAborted.message,data,'filecustomerror');return true;}return false;},noFilesError:function noFilesError(params){var self=this,label=self.minFileCount > 1?self.filePlural:self.fileSingle,msg=self.msgFilesTooLess.repl('{n}',self.minFileCount).repl('{files}',label),$error=self.$errorContainer;$error.html(msg);self.isError = true;self.updateFileDetails(0);$error.fadeIn(800);self.raise('fileerror',[params]);self.clearFileInput();addCss(self.$container,'has-error');},setProgress:function setProgress(p){var self=this,pct=Math.min(p,100),template=pct < 100?self.progressTemplate:self.progressCompleteTemplate;self.$progress.html(template.repl('{percent}',pct));},upload:function upload(){var self=this,totLen=self.getFileStack().length,params={},i,outData,len,hasExtraData=!$.isEmptyObject(self.getExtraData());if(totLen < self.minFileCount && self.minFileCount > 0){self.noFilesError(params);return;}if(!self.isUploadable || self.isDisabled || totLen === 0 && !hasExtraData){return;}self.resetUpload();self.$progress.removeClass('hide');self.uploadCount = 0;self.uploadPercent = 0;self.lock();self.setProgress(0);if(totLen === 0 && hasExtraData){self.uploadExtraOnly();return;}len = self.filestack.length;self.hasInitData = false;if(self.uploadAsync && self.showPreview){outData = self.getOutData();self.raise('filebatchpreupload',[outData]);self.fileBatchCompleted = false;self.uploadCache = {content:[],config:[],tags:[],append:true};for(i = 0;i < len;i += 1) {if(self.filestack[i] !== undefined){self.uploadSingle(i,self.filestack,true);}}return;}self.uploadBatch();},lock:function lock(){var self=this;self.resetErrors();self.disable();if(self.showRemove){addCss(self.$container.find('.fileinput-remove'),'hide');}if(self.showCancel){self.$container.find('.fileinput-cancel').removeClass('hide');}self.raise('filelock',[self.filestack,self.getExtraData()]);},unlock:function unlock(reset){var self=this;if(reset === undefined){reset = true;}self.enable();if(self.showCancel){addCss(self.$container.find('.fileinput-cancel'),'hide');}if(self.showRemove){self.$container.find('.fileinput-remove').removeClass('hide');}if(reset){self.resetFileStack();}self.raise('fileunlock',[self.filestack,self.getExtraData()]);},resetFileStack:function resetFileStack(){var self=this,i=0,newstack=[];self.getThumbs().each(function(){var $thumb=$(this),ind=$thumb.attr('data-fileindex'),file=self.filestack[ind];if(ind === -1){return;}if(file !== undefined){newstack[i] = file;$thumb.attr({'id':self.previewInitId + '-' + i,'data-fileindex':i});i += 1;}else {$thumb.attr({'id':'uploaded-' + uniqId(),'data-fileindex':'-1'});}});self.filestack = newstack;},refresh:function refresh(options){var self=this,$el=self.$element,$zone,params=arguments.length?$.extend(self.options,options):self.options;$el.off();self.init(params);$zone = self.$container.find('.file-drop-zone');$zone.off('dragenter dragover drop');$(document).off('dragenter dragover drop');self.listen();self.setFileDropZoneTitle();},initDragDrop:function initDragDrop(){var self=this,$zone=self.$container.find('.file-drop-zone');$zone.off('dragenter dragover drop');$(document).off('dragenter dragover drop');$zone.on('dragenter dragover',function(e){e.stopPropagation();e.preventDefault();if(self.isDisabled){return;}addCss($(this),'highlighted');});$zone.on('dragleave',function(e){e.stopPropagation();e.preventDefault();if(self.isDisabled){return;}$(this).removeClass('highlighted');});$zone.on('drop',function(e){e.preventDefault();if(self.isDisabled){return;}self.change(e,'dragdrop');$(this).removeClass('highlighted');});$(document).on('dragenter dragover drop',function(e){e.stopPropagation();e.preventDefault();});},setFileDropZoneTitle:function setFileDropZoneTitle(){var self=this,$zone=self.$container.find('.file-drop-zone');$zone.find('.' + self.dropZoneTitleClass).remove();if(!self.isUploadable || !self.showPreview || $zone.length === 0 || self.getFileStack().length > 0 || !self.dropZoneEnabled){return;}if($zone.find('.file-preview-frame').length === 0){$zone.prepend('<div class="' + self.dropZoneTitleClass + '">' + self.dropZoneTitle + '</div>');}self.$container.removeClass('file-input-new');addCss(self.$container,'file-input-ajax-new');},initFileActions:function initFileActions(){var self=this;self.$preview.find('.kv-file-remove').each(function(){var $el=$(this),$frame=$el.closest('.file-preview-frame'),ind=$frame.attr('data-fileindex'),n,cap;$el.off('click').on('click',function(){$frame.fadeOut('slow',function(){self.filestack[ind] = undefined;self.clearObjects($frame);$frame.remove();var filestack=self.getFileStack(),len=filestack.length,chk=previewCache.count(self.id);self.clearFileInput();if(len === 0 && chk === 0){self.reset();}else {n = chk + len;cap = n > 1?self.getMsgSelected(n):filestack[0].name;self.setCaption(cap);}});});});self.$preview.find('.kv-file-upload').each(function(){var $el=$(this);$el.off('click').on('click',function(){var $frame=$el.closest('.file-preview-frame'),ind=$frame.attr('data-fileindex');self.uploadSingle(ind,self.filestack,false);});});},getMsgSelected:function getMsgSelected(n){var self=this,strFiles=n === 1?self.fileSingle:self.filePlural;return self.msgSelected.repl('{n}',n).repl('{files}',strFiles);},renderFileFooter:function renderFileFooter(caption,width){var self=this,config=self.fileActionSettings,footer,out,template=self.getLayoutTemplate('footer');if(self.isUploadable){footer = template.repl('{actions}',self.renderFileActions(true,true,false,false,false));out = footer.repl('{caption}',caption).repl('{width}',width).repl('{indicator}',config.indicatorNew).repl('{indicatorTitle}',config.indicatorNewTitle);}else {out = template.repl('{actions}','').repl('{caption}',caption).repl('{width}',width).repl('{indicator}','').repl('{indicatorTitle}','');}out = replaceTags(out,self.previewThumbTags);return out;},renderFileActions:function renderFileActions(showUpload,showDelete,disabled,url,key){if(!showUpload && !showDelete){return '';}var self=this,vUrl=url === false?'':' data-url="' + url + '"',vKey=key === false?'':' data-key="' + key + '"',btnDelete=self.getLayoutTemplate('actionDelete'),btnUpload='',template=self.getLayoutTemplate('actions'),otherButtons=self.otherActionButtons.repl('{dataKey}',vKey),config=self.fileActionSettings,removeClass=disabled?config.removeClass + ' disabled':config.removeClass;btnDelete = btnDelete.repl('{removeClass}',removeClass).repl('{removeIcon}',config.removeIcon).repl('{removeTitle}',config.removeTitle).repl('{dataUrl}',vUrl).repl('{dataKey}',vKey);if(showUpload){btnUpload = self.getLayoutTemplate('actionUpload').repl('{uploadClass}',config.uploadClass).repl('{uploadIcon}',config.uploadIcon).repl('{uploadTitle}',config.uploadTitle);}return template.repl('{delete}',btnDelete).repl('{upload}',btnUpload).repl('{other}',otherButtons);},initPreview:function initPreview(isInit){var self=this,cap=self.initialCaption || '',out;if(!previewCache.count(self.id)){self.$preview.html('');if(isInit){self.setCaption(cap);}else {self.initCaption();}return;}out = previewCache.out(self.id);cap = isInit && self.initialCaption?self.initialCaption:out.caption;self.$preview.html(out.content);self.setCaption(cap);if(!isEmpty(out.content)){self.$container.removeClass('file-input-new');}},initPreviewDeletes:function initPreviewDeletes(){var self=this,deleteExtraData=self.deleteExtraData || {},resetProgress=function resetProgress(){if(self.$preview.find('.kv-file-remove').length === 0){self.reset();self.initialCaption = '';}};self.$preview.find('.kv-file-remove').each(function(){var $el=$(this),vUrl=$el.data('url') || self.deleteUrl,vKey=$el.data('key');if(isEmpty(vUrl) || vKey === undefined){return;}var $frame=$el.closest('.file-preview-frame'),cache=previewCache.data[self.id],settings,params,index=$frame.data('fileindex'),config,extraData;index = parseInt(index.replace('init_',''));config = isEmpty(cache.config) && isEmpty(cache.config[index])?null:cache.config[index];extraData = isEmpty(config) || isEmpty(config.extra)?deleteExtraData:config.extra;if(typeof extraData === "function"){extraData = extraData();}params = {id:$el.attr('id'),key:vKey,extra:extraData};settings = $.extend({url:vUrl,type:'DELETE',dataType:'json',data:$.extend({key:vKey},extraData),beforeSend:function beforeSend(jqXHR){self.ajaxAborted = false;self.raise('filepredelete',[vKey,jqXHR,extraData]);if(self.ajaxAborted){jqXHR.abort();}else {addCss($frame,'file-uploading');addCss($el,'disabled');}},success:function success(data,textStatus,jqXHR){var n,cap;if(data === undefined || data.error === undefined){previewCache.unset(self.id,index);n = previewCache.count(self.id);cap = n > 0?self.getMsgSelected(n):'';self.raise('filedeleted',[vKey,jqXHR,extraData]);self.setCaption(cap);}else {params.jqXHR = jqXHR;params.response = data;self.showError(data.error,params,'filedeleteerror');$frame.removeClass('file-uploading');$el.removeClass('disabled');resetProgress();return;}$frame.removeClass('file-uploading').addClass('file-deleted');$frame.fadeOut('slow',function(){self.clearObjects($frame);$frame.remove();resetProgress();if(!n && self.getFileStack().length === 0){self.setCaption('');self.reset();}});},error:function error(jqXHR,textStatus,errorThrown){var errMsg=self.parseError(jqXHR,errorThrown);params.jqXHR = jqXHR;params.response = {};self.showError(errMsg,params,'filedeleteerror');$frame.removeClass('file-uploading');resetProgress();}},self.ajaxDeleteSettings);$el.off('click').on('click',function(){$.ajax(settings);});});},clearObjects:function clearObjects($el){$el.find('video audio').each(function(){this.pause();$(this).remove();});$el.find('img object div').each(function(){$(this).remove();});},clearFileInput:function clearFileInput(){var self=this,$el=self.$element,$srcFrm,$tmpFrm,$tmpEl;if(isEmpty($el.val())){return;} // Fix for IE ver < 11, that does not clear file inputs
	// Requires a sequence of steps to prevent IE crashing but
	// still allow clearing of the file input.
	if(self.isIE9 || self.isIE10){$srcFrm = $el.closest('form');$tmpFrm = $(document.createElement('form'));$tmpEl = $(document.createElement('div'));$el.before($tmpEl);if($srcFrm.length){$srcFrm.after($tmpFrm);}else {$tmpEl.after($tmpFrm);}$tmpFrm.append($el).trigger('reset');$tmpEl.before($el).remove();$tmpFrm.remove();}else { // normal input clear behavior for other sane browsers
	$el.val('');}self.fileInputCleared = true;},resetUpload:function resetUpload(){var self=this;self.uploadCache = {content:[],config:[],tags:[],append:true};self.uploadCount = 0;self.uploadPercent = 0;self.$btnUpload.removeAttr('disabled');self.setProgress(0);addCss(self.$progress,'hide');self.resetErrors(false);self.ajaxAborted = false;self.ajaxRequests = [];},cancel:function cancel(){var self=this,xhr=self.ajaxRequests,len=xhr.length,i;if(len > 0){for(i = 0;i < len;i += 1) {xhr[i].abort();}}self.getThumbs().each(function(){var $thumb=$(this),ind=$thumb.attr('data-fileindex');$thumb.removeClass('file-uploading');if(self.filestack[ind] !== undefined){$thumb.find('.kv-file-upload').removeClass('disabled').removeAttr('disabled');$thumb.find('.kv-file-remove').removeClass('disabled').removeAttr('disabled');}self.unlock();});},clear:function clear(){var self=this,cap;self.$btnUpload.removeAttr('disabled');self.resetUpload();self.filestack = [];self.clearFileInput();self.resetErrors(true);self.raise('fileclear');if(!self.overwriteInitial && previewCache.count(self.id)){self.showFileIcon();self.resetPreview();self.setEllipsis();self.initPreviewDeletes();self.$container.removeClass('file-input-new');}else {self.getThumbs().each(function(){self.clearObjects($(this));});self.$preview.html('');cap = !self.overwriteInitial && self.initialCaption.length > 0?self.initialCaption:'';self.setCaption(cap);self.setEllipsis();self.$caption.attr('title','');addCss(self.$container,'file-input-new');}if(self.$container.find('.file-preview-frame').length === 0){if(!self.initCaption()){self.$captionContainer.find('.kv-caption-icon').hide();}self.setEllipsis();}self.hideFileIcon();self.raise('filecleared');self.$captionContainer.focus();self.setFileDropZoneTitle();},resetPreview:function resetPreview(){var self=this,out;if(previewCache.count(self.id)){out = previewCache.out(self.id);self.$preview.html(out.content);self.setCaption(out.caption);}else {self.$preview.html('');self.initCaption();}},reset:function reset(){var self=this;self.clear();self.resetPreview();self.setEllipsis();self.$container.find('.fileinput-filename').text('');self.raise('filereset');if(self.initialPreview.length > 0){self.$container.removeClass('file-input-new');}self.setFileDropZoneTitle();self.filestack = [];self.formdata = {};},disable:function disable(){var self=this;self.isDisabled = true;self.raise('filedisabled');self.$element.attr('disabled','disabled');self.$container.find(".kv-fileinput-caption").addClass("file-caption-disabled");self.$container.find(".btn-file, .fileinput-remove, .kv-fileinput-upload").attr("disabled",true);self.initDragDrop();},enable:function enable(){var self=this;self.isDisabled = false;self.raise('fileenabled');self.$element.removeAttr('disabled');self.$container.find(".kv-fileinput-caption").removeClass("file-caption-disabled");self.$container.find(".btn-file, .fileinput-remove, .kv-fileinput-upload").removeAttr("disabled");self.initDragDrop();},getThumbs:function getThumbs(css){css = css || '';return this.$preview.find('.file-preview-frame:not(.file-preview-initial)' + css);},getExtraData:function getExtraData(){var self=this,data=self.uploadExtraData;if(typeof self.uploadExtraData === "function"){data = self.uploadExtraData();}return data;},uploadExtra:function uploadExtra(){var self=this,data=self.getExtraData();if(data.length === 0){return;}$.each(data,function(key,value){self.formdata.append(key,value);});},initXhr:function initXhr(xhrobj,factor){var self=this;if(xhrobj.upload){xhrobj.upload.addEventListener('progress',function(event){var pct=0,position=event.loaded || event.position,total=event.total;if(event.lengthComputable){pct = Math.ceil(position / total * factor);}self.uploadPercent = Math.max(pct,self.uploadPercent);self.setProgress(self.uploadPercent);},false);}return xhrobj;},ajaxSubmit:function ajaxSubmit(fnBefore,fnSuccess,fnComplete,fnError){var self=this,settings;self.uploadExtra();settings = $.extend({xhr:function xhr(){var xhrobj=$.ajaxSettings.xhr();return self.initXhr(xhrobj,98);},url:self.uploadUrl,type:'POST',dataType:'json',data:self.formdata,cache:false,processData:false,contentType:false,beforeSend:fnBefore,success:fnSuccess,complete:fnComplete,error:fnError},self.ajaxSettings);self.ajaxRequests.push($.ajax(settings));},initUploadSuccess:function initUploadSuccess(out,$thumb,allFiles){var self=this,append,data,index,$newThumb,content,config,tags;if(typeof out !== 'object' || $.isEmptyObject(out)){return;}if(out.initialPreview !== undefined && out.initialPreview.length > 0){self.hasInitData = true;content = out.initialPreview || [];config = out.initialPreviewConfig || [];tags = out.initialPreviewThumbTags || [];append = out.append === undefined || out.append?true:false;self.overwriteInitial = false;if($thumb !== undefined && !allFiles){index = previewCache.add(self.id,content,config[0],tags[0],append);data = previewCache.get(self.id,index,false);$newThumb = $(data).hide();$thumb.after($newThumb).fadeOut('slow',function(){$newThumb.fadeIn('slow').css('display:inline-block');self.initPreviewDeletes();self.clearFileInput();});}else {if(allFiles){self.uploadCache.content.push(content[0]);self.uploadCache.config.push(config[0]);self.uploadCache.tags.push(tags[0]);self.uploadCache.append = append;}else {previewCache.set(self.id,content,config,tags,append);self.initPreview();self.initPreviewDeletes();}}}},uploadSingle:function uploadSingle(i,files,allFiles){var self=this,total=self.getFileStack().length,formdata=new FormData(),outData,previewId=self.previewInitId + "-" + i,$thumb=$('#' + previewId + ':not(.file-preview-initial)'),pct,chkComplete,$btnUpload=$thumb.find('.kv-file-upload'),$btnDelete=$thumb.find('.kv-file-remove'),$indicator=$thumb.find('.file-upload-indicator'),config=self.fileActionSettings,hasPostData=self.filestack.length > 0 || !$.isEmptyObject(self.uploadExtraData),setIndicator,updateProgress,resetActions,fnBefore,fnSuccess,fnComplete,fnError,params={id:previewId,index:i};self.formdata = formdata;if(total === 0 || !hasPostData || $btnUpload.hasClass('disabled') || self.abort(params)){return;}chkComplete = function(){var $thumbs=self.getThumbs('.file-uploading');if($thumbs.length > 0 || self.fileBatchCompleted){return;}self.fileBatchCompleted = true;setTimeout(function(){previewCache.set(self.id,self.uploadCache.content,self.uploadCache.config,self.uploadCache.tags,self.uploadCache.append);if(self.hasInitData){self.initPreview();self.initPreviewDeletes();}self.setProgress(100);self.unlock();self.clearFileInput();self.raise('filebatchuploadcomplete',[self.filestack,self.getExtraData()]);},100);};setIndicator = function(icon,msg){$indicator.html(config[icon]);$indicator.attr('title',config[msg]);};updateProgress = function(){if(!allFiles || total === 0 || self.uploadPercent >= 100){return;}self.uploadCount += 1;pct = 80 + Math.ceil(self.uploadCount * 20 / total);self.uploadPercent = Math.max(pct,self.uploadPercent);self.setProgress(self.uploadPercent);self.initPreviewDeletes();};resetActions = function(){$btnUpload.removeAttr('disabled');$btnDelete.removeAttr('disabled');$thumb.removeClass('file-uploading');};fnBefore = function(jqXHR){outData = self.getOutData(jqXHR);setIndicator('indicatorLoading','indicatorLoadingTitle');addCss($thumb,'file-uploading');$btnUpload.attr('disabled',true);$btnDelete.attr('disabled',true);if(!allFiles){self.lock();}self.raise('filepreupload',[outData,previewId,i]);params = $.extend(params,outData);if(self.abort(params)){jqXHR.abort();self.setProgress(100);}};fnSuccess = function(data,textStatus,jqXHR){outData = self.getOutData(jqXHR,data);params = $.extend(params,outData);setTimeout(function(){if(data.error === undefined){setIndicator('indicatorSuccess','indicatorSuccessTitle');$btnUpload.hide();$btnDelete.hide();self.filestack[i] = undefined;self.raise('fileuploaded',[outData,previewId,i]);self.initUploadSuccess(data,$thumb,allFiles);if(!allFiles){self.resetFileStack();}}else {setIndicator('indicatorError','indicatorErrorTitle');self.showUploadError(data.error,params);}},100);};fnComplete = function(){setTimeout(function(){updateProgress();resetActions();if(!allFiles){self.unlock(false);}else {chkComplete();}},100);};fnError = function(jqXHR,textStatus,errorThrown){var errMsg=self.parseError(jqXHR,errorThrown,allFiles?files[i].name:null);setIndicator('indicatorError','indicatorErrorTitle');params = $.extend(params,self.getOutData(jqXHR));self.showUploadError(errMsg,params);};formdata.append(self.uploadFileAttr,files[i]);formdata.append('file_id',i);self.ajaxSubmit(fnBefore,fnSuccess,fnComplete,fnError);},uploadBatch:function uploadBatch(){var self=this,files=self.filestack,total=files.length,config,hasPostData=self.filestack.length > 0 || !$.isEmptyObject(self.uploadExtraData),setIndicator,setAllUploaded,enableActions,fnBefore,fnSuccess,fnComplete,fnError,params={};self.formdata = new FormData();if(total === 0 || !hasPostData || self.abort(params)){return;}config = self.fileActionSettings;setIndicator = function(i,icon,msg){var $indicator=$('#' + self.previewInitId + "-" + i).find('.file-upload-indicator');$indicator.html(config[icon]);$indicator.attr('title',config[msg]);};enableActions = function(i){var $thumb=$('#' + self.previewInitId + "-" + i + ':not(.file-preview-initial)'),$btnUpload=$thumb.find('.kv-file-upload'),$btnDelete=$thumb.find('.kv-file-delete');$thumb.removeClass('file-uploading');$btnUpload.removeAttr('disabled');$btnDelete.removeAttr('disabled');};setAllUploaded = function(){$.each(files,function(key){self.filestack[key] = undefined;});self.clearFileInput();};fnBefore = function(jqXHR){self.lock();var outData=self.getOutData(jqXHR);if(self.showPreview){self.getThumbs().each(function(){var $thumb=$(this),$btnUpload=$thumb.find('.kv-file-upload'),$btnDelete=$thumb.find('.kv-file-remove');addCss($thumb,'file-uploading');$btnUpload.attr('disabled',true);$btnDelete.attr('disabled',true);});}self.raise('filebatchpreupload',[outData]);if(self.abort(outData)){jqXHR.abort();}};fnSuccess = function(data,textStatus,jqXHR){var outData=self.getOutData(jqXHR,data),$thumbs=self.getThumbs(),keys=isEmpty(data.errorkeys)?[]:data.errorkeys;if(data.error === undefined || isEmpty(data.error)){self.raise('filebatchuploadsuccess',[outData]);setAllUploaded();if(self.showPreview){$thumbs.find('.kv-file-upload').hide();$thumbs.find('.kv-file-remove').hide();$thumbs.each(function(){var $thumb=$(this),key=$thumb.attr('data-fileindex');setIndicator(key,'indicatorSuccess','indicatorSuccessTitle');enableActions(key);});self.initUploadSuccess(data);}else {self.reset();}}else {if(self.showPreview){$thumbs.each(function(){var $thumb=$(this),key=parseInt($thumb.attr('data-fileindex'),10);enableActions(key);if(keys.length === 0){setIndicator(key,'indicatorError','indicatorErrorTitle');return;}if($.inArray(key,keys) !== -1){setIndicator(key,'indicatorError','indicatorErrorTitle');}else {$thumb.find('.kv-file-upload').hide();$thumb.find('.kv-file-remove').hide();setIndicator(key,'indicatorSuccess','indicatorSuccessTitle');self.filestack[key] = undefined;}});self.initUploadSuccess(data);}self.showUploadError(data.error,outData,'filebatchuploaderror');}};fnComplete = function(){self.setProgress(100);self.unlock();self.raise('filebatchuploadcomplete',[self.filestack,self.getExtraData()]);self.clearFileInput();};fnError = function(jqXHR,textStatus,errorThrown){var outData=self.getOutData(jqXHR),errMsg=self.parseError(jqXHR,errorThrown);self.showUploadError(errMsg,outData,'filebatchuploaderror');self.uploadFileCount = total - 1;if(!self.showPreview){return;}self.getThumbs().each(function(){var $thumb=$(this),key=$thumb.attr('data-fileindex');$thumb.removeClass('file-uploading');if(self.filestack[key] !== undefined){setIndicator(key,'indicatorError','indicatorErrorTitle');}});self.getThumbs().removeClass('file-uploading');self.getThumbs(' .kv-file-upload').removeAttr('disabled');self.getThumbs(' .kv-file-delete').removeAttr('disabled');};$.each(files,function(key,data){if(!isEmpty(files[key])){self.formdata.append(self.uploadFileAttr,data);}});self.ajaxSubmit(fnBefore,fnSuccess,fnComplete,fnError);},uploadExtraOnly:function uploadExtraOnly(){var self=this,params={},fnBefore,fnSuccess,fnComplete,fnError;self.formdata = new FormData();if(self.abort(params)){return;}fnBefore = function(jqXHR){self.lock();var outData=self.getOutData(jqXHR);self.raise('filebatchpreupload',[outData]);self.setProgress(50);params.data = outData;params.xhr = jqXHR;if(self.abort(params)){jqXHR.abort();self.setProgress(100);}};fnSuccess = function(data,textStatus,jqXHR){var outData=self.getOutData(jqXHR,data);if(data.error === undefined || isEmpty(data.error)){self.raise('filebatchuploadsuccess',[outData]);self.clearFileInput();self.initUploadSuccess(data);}else {self.showUploadError(data.error,outData,'filebatchuploaderror');}};fnComplete = function(){self.setProgress(100);self.unlock();self.raise('filebatchuploadcomplete',[self.filestack,self.getExtraData()]);self.clearFileInput();};fnError = function(jqXHR,textStatus,errorThrown){var outData=self.getOutData(jqXHR),errMsg=self.parseError(jqXHR,errorThrown);params.data = outData;self.showUploadError(errMsg,outData,'filebatchuploaderror');};self.ajaxSubmit(fnBefore,fnSuccess,fnComplete,fnError);},hideFileIcon:function hideFileIcon(){if(this.overwriteInitial){this.$captionContainer.find('.kv-caption-icon').hide();}},showFileIcon:function showFileIcon(){this.$captionContainer.find('.kv-caption-icon').show();},resetErrors:function resetErrors(fade){var self=this,$error=self.$errorContainer;self.isError = false;self.$container.removeClass('has-error');$error.html('');if(fade){$error.fadeOut('slow');}else {$error.hide();}},showFolderError:function showFolderError(folders){var self=this,$error=self.$errorContainer;if(!folders){return;}$error.html(self.msgFoldersNotAllowed.repl('{n}',folders));$error.fadeIn(800);addCss(self.$container,'has-error');self.raise('filefoldererror',[folders]);},showUploadError:function showUploadError(msg,params,event){var self=this,$error=self.$errorContainer,ev=event || 'fileuploaderror';if($error.find('ul').length === 0){$error.html('<ul><li>' + msg + '</li></ul>');}else {$error.find('ul').append('<li>' + msg + '</li>');}$error.fadeIn(800);self.raise(ev,[params]);addCss(self.$container,'has-error');return true;},showError:function showError(msg,params,event){var self=this,$error=self.$errorContainer,ev=event || 'fileerror';params = params || {};params.reader = self.reader;$error.html(msg);$error.fadeIn(800);self.raise(ev,[params]);if(!self.isUploadable){self.clearFileInput();}addCss(self.$container,'has-error');self.$btnUpload.attr('disabled',true);return true;},errorHandler:function errorHandler(evt,caption){var self=this,err=evt.target.error;switch(err.code){case err.NOT_FOUND_ERR:self.showError(self.msgFileNotFound.repl('{name}',caption));break;case err.SECURITY_ERR:self.showError(self.msgFileSecured.repl('{name}',caption));break;case err.NOT_READABLE_ERR:self.showError(self.msgFileNotReadable.repl('{name}',caption));break;case err.ABORT_ERR:self.showError(self.msgFilePreviewAborted.repl('{name}',caption));break;default:self.showError(self.msgFilePreviewError.repl('{name}',caption));}},parseFileType:function parseFileType(file){var self=this,isValid,vType,cat,i;for(i = 0;i < defaultPreviewTypes.length;i += 1) {cat = defaultPreviewTypes[i];isValid = isSet(cat,self.fileTypeSettings)?self.fileTypeSettings[cat]:defaultFileTypeSettings[cat];vType = isValid(file.type,file.name)?cat:'';if(!isEmpty(vType)){return vType;}}return 'other';},previewDefault:function previewDefault(file,previewId,isDisabled){if(!this.showPreview){return;}var self=this,data=objUrl.createObjectURL(file),$obj=$('#' + previewId),config=self.previewSettings.other,footer=self.renderFileFooter(file.name,config.width),previewOtherTemplate=self.getPreviewTemplate('other'),ind=previewId.slice(previewId.lastIndexOf('-') + 1),frameClass='';if(isDisabled === true){frameClass = ' btn disabled';footer += '<div class="file-other-error text-danger"><i class="glyphicon glyphicon-exclamation-sign"></i></div>';}self.$preview.append("\n" + previewOtherTemplate.repl('{previewId}',previewId).repl('{frameClass}',frameClass).repl('{fileindex}',ind).repl('{caption}',self.slug(file.name)).repl('{width}',config.width).repl('{height}',config.height).repl('{type}',file.type).repl('{data}',data).repl('{footer}',footer));$obj.on('load',function(){objUrl.revokeObjectURL($obj.attr('data'));});},previewFile:function previewFile(file,theFile,previewId,data){if(!this.showPreview){return;}var self=this,cat=self.parseFileType(file),caption=self.slug(file.name),content,strText,types=self.allowedPreviewTypes,mimes=self.allowedPreviewMimeTypes,tmplt=self.getPreviewTemplate(cat),config=isSet(cat,self.previewSettings)?self.previewSettings[cat]:defaultPreviewSettings[cat],wrapLen=parseInt(self.wrapTextLength,10),wrapInd=self.wrapIndicator,chkTypes=types.indexOf(cat) >= 0,id,height,chkMimes=isEmpty(mimes) || !isEmpty(mimes) && mimes.indexOf(file.type) !== -1,footer=self.renderFileFooter(caption,config.width),modal='',ind=previewId.slice(previewId.lastIndexOf('-') + 1);if(chkTypes && chkMimes){if(cat === 'text'){strText = htmlEncode(theFile.target.result);objUrl.revokeObjectURL(data);if(strText.length > wrapLen){id = 'text-' + uniqId();height = window.innerHeight * 0.75;modal = self.getLayoutTemplate('modal').repl('{id}',id).repl('{title}',caption).repl('{height}',height).repl('{body}',strText);wrapInd = wrapInd.repl('{title}',caption).repl('{dialog}',"$('#" + id + "').modal('show')");strText = strText.substring(0,wrapLen - 1) + wrapInd;}content = tmplt.repl('{previewId}',previewId).repl('{caption}',caption).repl('{frameClass}','').repl('{type}',file.type).repl('{width}',config.width).repl('{height}',config.height).repl('{data}',strText).repl('{footer}',footer).repl('{fileindex}',ind) + modal;}else {content = tmplt.repl('{previewId}',previewId).repl('{caption}',caption).repl('{frameClass}','').repl('{type}',file.type).repl('{data}',data).repl('{width}',config.width).repl('{height}',config.height).repl('{footer}',footer).repl('{fileindex}',ind);}self.$preview.append("\n" + content);self.autoSizeImage(previewId);}else {self.previewDefault(file,previewId);}},slugDefault:function slugDefault(text){return isEmpty(text)?'':text.split(/(\\|\/)/g).pop().replace(/[^\w\u00C0-\u017F\-.\\\/ ]+/g,'');},getFileStack:function getFileStack(){var self=this;return self.filestack.filter(function(n){return n !== undefined;});},readFiles:function readFiles(files){this.reader = new FileReader();var self=this,$el=self.$element,$preview=self.$preview,reader=self.reader,$container=self.$previewContainer,$status=self.$previewStatus,msgLoading=self.msgLoading,msgProgress=self.msgProgress,previewInitId=self.previewInitId,numFiles=files.length,settings=self.fileTypeSettings,ctr=self.filestack.length,throwError=function throwError(msg,file,previewId,index){var p1=$.extend(self.getOutData({},{},files),{id:previewId,index:index}),p2={id:previewId,index:index,file:file,files:files};self.previewDefault(file,previewId,true);return self.isUploadable?self.showUploadError(msg,p1):self.showError(msg,p2);};function readFile(i){if(isEmpty($el.attr('multiple'))){numFiles = 1;}if(i >= numFiles){if(self.isUploadable && self.filestack.length > 0){self.raise('filebatchselected',[self.getFileStack()]);}else {self.raise('filebatchselected',[files]);}$container.removeClass('loading');$status.html('');return;}var node=ctr + i,previewId=previewInitId + "-" + node,isText,file=files[i],caption=self.slug(file.name),fileSize=(file.size || 0) / 1000,checkFile,fileExtExpr='',previewData=objUrl.createObjectURL(file),fileCount=0,j,msg,typ,chk,fileTypes=self.allowedFileTypes,strTypes=isEmpty(fileTypes)?'':fileTypes.join(', '),fileExt=self.allowedFileExtensions,strExt=isEmpty(fileExt)?'':fileExt.join(', ');if(!isEmpty(fileExt)){fileExtExpr = new RegExp('\\.(' + fileExt.join('|') + ')$','i');}fileSize = fileSize.toFixed(2);if(self.maxFileSize > 0 && fileSize > self.maxFileSize){msg = self.msgSizeTooLarge.repl('{name}',caption).repl('{size}',fileSize).repl('{maxSize}',self.maxFileSize);self.isError = throwError(msg,file,previewId,i);return;}if(!isEmpty(fileTypes) && isArray(fileTypes)){for(j = 0;j < fileTypes.length;j += 1) {typ = fileTypes[j];checkFile = settings[typ];chk = checkFile !== undefined && checkFile(file.type,caption);fileCount += isEmpty(chk)?0:chk.length;}if(fileCount === 0){msg = self.msgInvalidFileType.repl('{name}',caption).repl('{types}',strTypes);self.isError = throwError(msg,file,previewId,i);return;}}if(fileCount === 0 && !isEmpty(fileExt) && isArray(fileExt) && !isEmpty(fileExtExpr)){chk = caption.match(fileExtExpr);fileCount += isEmpty(chk)?0:chk.length;if(fileCount === 0){msg = self.msgInvalidFileExtension.repl('{name}',caption).repl('{extensions}',strExt);self.isError = throwError(msg,file,previewId,i);return;}}if(!self.showPreview){self.filestack.push(file);setTimeout(readFile(i + 1),100);self.raise('fileloaded',[file,previewId,i,reader]);return;}if($preview.length > 0 && FileReader !== undefined){$status.html(msgLoading.repl('{index}',i + 1).repl('{files}',numFiles));$container.addClass('loading');reader.onerror = function(evt){self.errorHandler(evt,caption);};reader.onload = function(theFile){self.previewFile(file,theFile,previewId,previewData);self.initFileActions();};reader.onloadend = function(){msg = msgProgress.repl('{index}',i + 1).repl('{files}',numFiles).repl('{percent}',50).repl('{name}',caption);setTimeout(function(){$status.html(msg);objUrl.revokeObjectURL(previewData);},100);setTimeout(function(){readFile(i + 1);self.updateFileDetails(numFiles);},100);self.raise('fileloaded',[file,previewId,i,reader]);};reader.onprogress = function(data){if(data.lengthComputable){var fact=data.loaded / data.total * 100,progress=Math.ceil(fact);msg = msgProgress.repl('{index}',i + 1).repl('{files}',numFiles).repl('{percent}',progress).repl('{name}',caption);setTimeout(function(){$status.html(msg);},100);}};isText = isSet('text',settings)?settings.text:defaultFileTypeSettings.text;if(isText(file.type,caption)){reader.readAsText(file,self.textEncoding);}else {reader.readAsArrayBuffer(file);}}else {self.previewDefault(file,previewId);setTimeout(function(){readFile(i + 1);self.updateFileDetails(numFiles);},100);self.raise('fileloaded',[file,previewId,i,reader]);}self.filestack.push(file);}readFile(0);self.updateFileDetails(numFiles,false);},updateFileDetails:function updateFileDetails(numFiles){var self=this,$el=self.$element,fileStack=self.getFileStack(),name=$el.val() || fileStack.length && fileStack[0].name || '',label=self.slug(name),n=self.isUploadable?fileStack.length:numFiles,nFiles=previewCache.count(self.id) + n,log=n > 1?self.getMsgSelected(nFiles):label;if(self.isError){self.$previewContainer.removeClass('loading');self.$previewStatus.html('');self.$captionContainer.find('.kv-caption-icon').hide();}else {self.showFileIcon();}self.setCaption(log,self.isError);self.$container.removeClass('file-input-new file-input-ajax-new');if(arguments.length === 1){self.raise('fileselect',[numFiles,label]);}if(previewCache.count(self.id)){self.initPreviewDeletes();}},change:function change(e){var self=this,$el=self.$element;if(!self.isUploadable && isEmpty($el.val()) && self.fileInputCleared){ // IE 11 fix
	self.fileInputCleared = false;return;}self.fileInputCleared = false;var tfiles,msg,total,$preview=self.$preview,isDragDrop=arguments.length > 1,files=isDragDrop?e.originalEvent.dataTransfer.files:$el.get(0).files,isSingleUpload=isEmpty($el.attr('multiple')),i=0,f,m,folders=0,ctr=self.filestack.length,isAjaxUpload=self.isUploadable,throwError=function throwError(mesg,file,previewId,index){var p1=$.extend(self.getOutData({},{},files),{id:previewId,index:index}),p2={id:previewId,index:index,file:file,files:files};return self.isUploadable?self.showUploadError(mesg,p1):self.showError(mesg,p2);};self.reader = null;self.resetUpload();self.hideFileIcon();if(self.isUploadable){self.$container.find('.file-drop-zone .' + self.dropZoneTitleClass).remove();}if(isDragDrop){tfiles = [];while(files[i]) {f = files[i];if(!f.type && f.size % 4096 === 0){folders++;}else {tfiles.push(f);}i++;}}else {if(e.target.files === undefined){tfiles = e.target && e.target.value?[{name:e.target.value.replace(/^.+\\/,'')}]:[];}else {tfiles = e.target.files;}}if(isEmpty(tfiles) || tfiles.length === 0){if(!isAjaxUpload){self.clear();}self.showFolderError(folders);self.raise('fileselectnone');return;}self.resetErrors();if(!isAjaxUpload || isSingleUpload && ctr > 0){if(!self.overwriteInitial && previewCache.count(self.id)){var out=previewCache.out(self.id);$preview.html(out.content);self.setCaption(out.caption);self.initPreviewDeletes();}else {$preview.html('');}if(isSingleUpload && ctr > 0){self.filestack = [];}}total = self.isUploadable?self.getFileStack().length + tfiles.length:tfiles.length;if(self.maxFileCount > 0 && total > self.maxFileCount){msg = self.msgFilesTooMany.repl('{m}',self.maxFileCount).repl('{n}',total);self.isError = throwError(msg,null,null,null);self.$captionContainer.find('.kv-caption-icon').hide();self.$caption.html(self.msgValidationError);self.setEllipsis();self.$container.removeClass('file-input-new file-input-ajax-new');return;}if(!self.isIE9){self.readFiles(tfiles);}else {self.updateFileDetails(1);}self.showFolderError(folders);},autoSizeImage:function autoSizeImage(previewId){var self=this,$preview=self.$preview,$thumb=$preview.find("#" + previewId),$img=$thumb.find('img'),w1,w2,$cap;if(!$img.length){return;}$img.on('load',function(){w1 = $thumb.width();w2 = $preview.width();if(w1 > w2){$img.css('width','100%');$thumb.css('width','97%');}$cap = $img.closest('.file-preview-frame').find('.file-caption-name');if($cap.length){$cap.width($img.width());$cap.attr('title',$cap.text());}self.raise('fileimageloaded',previewId);});},initCaption:function initCaption(){var self=this,cap=self.initialCaption || '';if(self.overwriteInitial || isEmpty(cap)){self.$caption.html('');return false;}self.setCaption(cap);return true;},setCaption:function setCaption(content,isError){var self=this,err=isError || false,title,out;if(err){title = $('<div>' + self.msgValidationError + '</div>').text();out = '<span class="' + self.msgValidationErrorClass + '">' + self.msgValidationErrorIcon + title + '</span>';}else {if(isEmpty(content) || self.$caption.length === 0){return;}title = $('<div>' + content + '</div>').text();out = self.getLayoutTemplate('icon') + title;}self.$caption.html(out);self.$caption.attr('title',title);self.$captionContainer.find('.file-caption-ellipsis').attr('title',title);self.setEllipsis();},initBrowse:function initBrowse($container){var self=this;self.$btnFile = $container.find('.btn-file');self.$btnFile.append(self.$element);},createContainer:function createContainer(){var self=this,$container=$(document.createElement("span")).attr({"class":'file-input file-input-new'}).html(self.renderMain());self.$element.before($container);self.initBrowse($container);return $container;},refreshContainer:function refreshContainer(){var self=this,$container=self.$container;$container.before(self.$element);$container.html(self.renderMain());self.initBrowse($container);},renderMain:function renderMain(){var self=this,dropCss=self.isUploadable && self.dropZoneEnabled?' file-drop-zone':'',preview=self.showPreview?self.getLayoutTemplate('preview').repl('{class}',self.previewClass).repl('{dropClass}',dropCss):'',css=self.isDisabled?self.captionClass + ' file-caption-disabled':self.captionClass,caption=self.captionTemplate.repl('{class}',css + ' kv-fileinput-caption');return self.mainTemplate.repl('{class}',self.mainClass).repl('{preview}',preview).repl('{caption}',caption).repl('{upload}',self.renderUpload()).repl('{remove}',self.renderRemove()).repl('{cancel}',self.renderCancel()).repl('{browse}',self.renderBrowse());},renderBrowse:function renderBrowse(){var self=this,css=self.browseClass + ' btn-file',status='';if(self.isDisabled){status = ' disabled ';}return '<div class="' + css + '"' + status + '> ' + self.browseIcon + self.browseLabel + ' </div>';},renderRemove:function renderRemove(){var self=this,css=self.removeClass + ' fileinput-remove fileinput-remove-button',status='';if(!self.showRemove){return '';}if(self.isDisabled){status = ' disabled ';}return '<button type="button" title="' + self.removeTitle + '" class="' + css + '"' + status + '>' + self.removeIcon + self.removeLabel + '</button>';},renderCancel:function renderCancel(){var self=this,css=self.cancelClass + ' fileinput-cancel fileinput-cancel-button';if(!self.showCancel){return '';}return '<button type="button" title="' + self.cancelTitle + '" class="hide ' + css + '">' + self.cancelIcon + self.cancelLabel + '</button>';},renderUpload:function renderUpload(){var self=this,css=self.uploadClass + ' kv-fileinput-upload fileinput-upload-button',content='',status='';if(!self.showUpload){return '';}if(self.isDisabled){status = ' disabled ';}if(!self.isUploadable || self.isDisabled){content = '<button type="submit" title="' + self.uploadTitle + '"class="' + css + '"' + status + '>' + self.uploadIcon + self.uploadLabel + '</button>';}else {content = '<a href="' + self.uploadUrl + '" title="' + self.uploadTitle + '" class="' + css + '"' + status + '>' + self.uploadIcon + self.uploadLabel + '</a>';}return content;}}; //FileInput plugin definition
	$.fn.fileinput = function(option){if(!hasFileAPISupport() && !isIE(9)){return;}var args=Array.apply(null,arguments);args.shift();return this.each(function(){var $this=$(this),data=$this.data('fileinput'),options=typeof option === 'object' && option;if(!data){data = new FileInput(this,$.extend({},$.fn.fileinput.defaults,options,$(this).data()));$this.data('fileinput',data);}if(typeof option === 'string'){data[option].apply(data,args);}});};$.fn.fileinput.defaults = {showCaption:true,showPreview:true,showRemove:true,showUpload:true,showCancel:true,mainClass:'',previewClass:'',captionClass:'',mainTemplate:null,initialCaption:'',initialPreview:[],initialPreviewDelimiter:'*$$*',initialPreviewConfig:[],initialPreviewThumbTags:[],previewThumbTags:{},initialPreviewShowDelete:true,deleteUrl:'',deleteExtraData:{},overwriteInitial:true,layoutTemplates:defaultLayoutTemplates,previewTemplates:defaultPreviewTemplates,allowedPreviewTypes:defaultPreviewTypes,allowedPreviewMimeTypes:null,allowedFileTypes:null,allowedFileExtensions:null,customLayoutTags:{},customPreviewTags:{},previewSettings:defaultPreviewSettings,fileTypeSettings:defaultFileTypeSettings,previewFileIcon:'<i class="glyphicon glyphicon-file"></i>',browseIcon:'<i class="glyphicon glyphicon-folder-open"></i> &nbsp;',browseClass:'btn btn-primary',removeIcon:'<i class="glyphicon glyphicon-trash"></i> ',removeClass:'btn btn-default',cancelIcon:'<i class="glyphicon glyphicon-ban-circle"></i> ',cancelClass:'btn btn-default',uploadIcon:'<i class="glyphicon glyphicon-upload"></i> ',uploadClass:'btn btn-default',uploadUrl:null,uploadAsync:true,uploadExtraData:{},maxFileSize:0,minFileCount:0,maxFileCount:0,msgValidationErrorClass:'text-danger',msgValidationErrorIcon:'<i class="glyphicon glyphicon-exclamation-sign"></i> ',msgErrorClass:'file-error-message',progressClass:"progress-bar progress-bar-success progress-bar-striped active",progressCompleteClass:"progress-bar progress-bar-success",previewFileType:'image',wrapTextLength:250,wrapIndicator:' <span class="wrap-indicator" title="{title}" onclick="{dialog}">[&hellip;]</span>',elCaptionContainer:null,elCaptionText:null,elPreviewContainer:null,elPreviewImage:null,elPreviewStatus:null,elErrorContainer:null,slugCallback:null,dropZoneEnabled:true,dropZoneTitleClass:'file-drop-zone-title',fileActionSettings:{},otherActionButtons:'',textEncoding:'UTF-8',ajaxSettings:{},ajaxDeleteSettings:{},showAjaxErrorDetails:true};$.fn.fileinput.locales = {};$.fn.fileinput.locales.en = {fileSingle:'file',filePlural:'files',browseLabel:'Browse &hellip;',removeLabel:'Remove',removeTitle:'Clear selected files',cancelLabel:'Cancel',cancelTitle:'Abort ongoing upload',uploadLabel:'Upload',uploadTitle:'Upload selected files',msgSizeTooLarge:'File "{name}" (<b>{size} KB</b>) exceeds maximum allowed upload size of <b>{maxSize} KB</b>. Please retry your upload!',msgFilesTooLess:'You must select at least <b>{n}</b> {files} to upload. Please retry your upload!',msgFilesTooMany:'Number of files selected for upload <b>({n})</b> exceeds maximum allowed limit of <b>{m}</b>. Please retry your upload!',msgFileNotFound:'File "{name}" not found!',msgFileSecured:'Security restrictions prevent reading the file "{name}".',msgFileNotReadable:'File "{name}" is not readable.',msgFilePreviewAborted:'File preview aborted for "{name}".',msgFilePreviewError:'An error occurred while reading the file "{name}".',msgInvalidFileType:'Invalid type for file "{name}". Only "{types}" files are supported.',msgInvalidFileExtension:'Invalid extension for file "{name}". Only "{extensions}" files are supported.',msgValidationError:'File Upload Error',msgLoading:'Loading file {index} of {files} &hellip;',msgProgress:'Loading file {index} of {files} - {name} - {percent}% completed.',msgSelected:'{n} {files} selected',msgFoldersNotAllowed:'Drag & drop files only! {n} folder(s) dropped were skipped.',dropZoneTitle:'Drag & drop files here &hellip;'};$.extend($.fn.fileinput.defaults,$.fn.fileinput.locales.en);$.fn.fileinput.Constructor = FileInput; /**
	     * Convert automatically file inputs with class 'file'
	     * into a bootstrap fileinput control.
	     */$(document).ready(function(){var $input=$('input.file[type=file]'),count=$input.attr('type')?$input.length:0;if(count > 0){$input.fileinput();}});})(window.jQuery);

/***/ }

/******/ });
//# sourceMappingURL=subject_update.bundle.js.map