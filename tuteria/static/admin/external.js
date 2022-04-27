"use strict";

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return call && (typeof call === "object" || typeof call === "function")
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError(
      "Super expression must either be null or a function, not " +
        typeof superClass
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

var customStyles = {
  content: {
    top: "50%",
    left: "45%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    width: "40%",
    transform: "translate(-50%, -50%)"
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 2000
  }
};
var styles = {
  parent: {
    marginBottom: 20
  },
  FormGroup: {
    marginBottom: 10
  },
  label: {
    marginRight: 10,
    marginBottom: 10,
    width: "15%",
    display: "inline-block"
  },
  input: {
    width: "70%"
  }
};
var Modal = ReactModal;
var FormGroup = function FormGroup(_ref) {
  var label = _ref.label,
    children = _ref.children;
  return React.createElement(
    "div",
    { style: styles.FormGroup, className: "form-row field-first_name" },
    React.createElement(
      "div",
      null,
      React.createElement("label", { style: styles.label }, label),
      children
    )
  );
};

var EditContainer = (function(_React$Component) {
  _inherits(EditContainer, _React$Component);

  function EditContainer() {
    var _ref2;

    var _temp, _this, _ret;

    _classCallCheck(this, EditContainer);

    for (
      var _len = arguments.length, args = Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }

    return (
      (_ret = ((_temp = ((_this = _possibleConstructorReturn(
        this,
        (_ref2 =
          EditContainer.__proto__ ||
          Object.getPrototypeOf(EditContainer)).call.apply(
          _ref2,
          [this].concat(args)
        )
      )),
      _this)),
      (_this.state = { modalIsOpen: false }),
      (_this.openModal = function() {
        _this.setState({ modalIsOpen: true });
      }),
      (_this.afterOpenModal = function() {
        // references are now sync'd and can be accessed.
      }),
      (_this.closeModal = function(e) {
        e.preventDefault();
        _this.setState({ modalIsOpen: false });
      }),
      _temp)),
      _possibleConstructorReturn(_this, _ret)
    );
  }

  _createClass(EditContainer, [
    {
      key: "render",
      value: function render() {
        return React.createElement(
          React.Fragment,
          null,
          this.props.render(this.openModal),
          React.createElement(
            Modal,
            {
              isOpen: this.state.modalIsOpen,
              onAfterOpen: this.afterOpenModal,
              onRequestClose: this.closeModal,
              style: customStyles,
              ariaHideApp: false,
              contentLabel: "Example Modal"
            },
            this.props.children(this.closeModal)
          )
        );
      }
    }
  ]);

  return EditContainer;
})(React.Component);

var ButtonLink = function ButtonLink(_ref3) {
  var _ref3$node = _ref3.node,
    node = _ref3$node === undefined ? "a" : _ref3$node,
    children = _ref3.children,
    rest = _objectWithoutProperties(_ref3, ["node", "children"]);

  var className = "button nowrap";
  var style = { cursor: "pointer", padding: "7px", marginRight: "10px" };
  return React.createElement(
    node,
    _extends({}, rest, { className: className, style: style }),
    children
  );
};

function refundImplementation() {
  var Form = (function(_React$Component2) {
    _inherits(Form, _React$Component2);

    function Form() {
      var _ref4;

      var _temp2, _this2, _ret2;

      _classCallCheck(this, Form);

      for (
        var _len2 = arguments.length, args = Array(_len2), _key2 = 0;
        _key2 < _len2;
        _key2++
      ) {
        args[_key2] = arguments[_key2];
      }

      return (
        (_ret2 = ((_temp2 = ((_this2 = _possibleConstructorReturn(
          this,
          (_ref4 = Form.__proto__ || Object.getPrototypeOf(Form)).call.apply(
            _ref4,
            [this].concat(args)
          )
        )),
        _this2)),
        (_this2.state = {
          banks: [],
          account_id: "",
          account_name: "",
          bank: ""
        }),
        (_this2.refundTutor = function(e) {
          e.preventDefault();
          console.log(_this2.state);

          var _this2$state = _this2.state,
            banks = _this2$state.banks,
            rest = _objectWithoutProperties(_this2$state, ["banks"]);

          var request = new Request(_this2.props.url, {
            method: "post",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(rest)
          });
          fetch(request)
            .then(function(response) {
              if (!response.ok) {
                throw Error(response.statusText);
              }
              return response.json();
            })
            .then(function(response) {
              console.log(response);
              window.location.reload();
            });
        }),
        _temp2)),
        _possibleConstructorReturn(_this2, _ret2)
      );
    }

    _createClass(Form, [
      {
        key: "componentDidMount",
        value: function componentDidMount() {
          var _this3 = this;

          if (this.props.banks.length == 0) {
            fetch(this.props.url)
              .then(function(response) {
                if (response.status !== 200) {
                  console.log(
                    "Looks like there was a problem. Status Code: " +
                      response.status
                  );
                  return;
                }
                // Examine the text in the response
                response.json().then(function(data) {
                  var banks = data.banks,
                    _data$account_id = data.account_id,
                    account_id =
                      _data$account_id === undefined ? "" : _data$account_id,
                    _data$account_name = data.account_name,
                    account_name =
                      _data$account_name === undefined
                        ? ""
                        : _data$account_name,
                    _data$bank = data.bank,
                    bank = _data$bank === undefined ? "" : _data$bank;

                  _this3.setState({
                    banks: banks,
                    account_id: account_id,
                    account_name: account_name,
                    bank: bank
                  });
                  console.log(data);
                  _this3.props.updateParent(data);
                });
              })
              .catch(function(err) {
                console.log("Fetch Error :-S", err);
              });
          } else {
            this.setState(this.props);
          }
        }
      },
      {
        key: "render",
        value: function render() {
          var _this4 = this;

          var fields = [
            {
              label: "Account number",
              key: "account_id",
              extra: { maxlength: 10 }
            },
            { label: "Account name", key: "account_name", extra: {} }
          ];
          return React.createElement(
            React.Fragment,
            null,
            React.createElement(
              "fieldset",
              { className: "module aligned " },
              React.createElement(
                "h2",
                { style: styles.parent },
                "Refund " + this.props.kind + " fee form."
              ),
              fields.map(function(field) {
                return React.createElement(
                  FormGroup,
                  { label: field.label + ":" },
                  React.createElement(
                    "input",
                    _extends(
                      {
                        style: styles.input,
                        value: _this4.state[field.key],
                        className: "vTextField"
                      },
                      field.extra,
                      {
                        onChange: function onChange(e) {
                          return _this4.setState(
                            _defineProperty({}, field.key, e.target.value)
                          );
                        },
                        type: "text"
                      }
                    )
                  )
                );
              }),
              React.createElement(
                FormGroup,
                { label: "Bank" },
                React.createElement(
                  "select",
                  {
                    style: styles.input,
                    onChange: function onChange(e) {
                      return _this4.setState({ bank: e.target.value });
                    },
                    value: this.state.bank
                  },
                  this.state.banks.map(function(bank) {
                    return React.createElement(
                      "option",
                      { value: bank[0] },
                      bank[1]
                    );
                  })
                )
              )
            ),
            React.createElement(
              "div",
              { class: "submit-row" },
              React.createElement("input", {
                onClick: this.refundTutor,
                value: this.props.buttonText,
                class: "default",
                type: "submit"
              }),
              React.createElement(
                "p",
                { class: "deletelink-box" },
                React.createElement(
                  "a",
                  {
                    href: "#",
                    onClick: this.props.closeModal,
                    class: "deletelink"
                  },
                  "Close Modal"
                )
              )
            )
          );
        }
      }
    ]);

    return Form;
  })(React.Component);

  var App = (function(_React$Component3) {
    _inherits(App, _React$Component3);

    function App() {
      var _ref5;

      var _temp3, _this5, _ret3;

      _classCallCheck(this, App);

      for (
        var _len3 = arguments.length, args = Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3];
      }

      return (
        (_ret3 = ((_temp3 = ((_this5 = _possibleConstructorReturn(
          this,
          (_ref5 = App.__proto__ || Object.getPrototypeOf(App)).call.apply(
            _ref5,
            [this].concat(args)
          )
        )),
        _this5)),
        (_this5.state = {
          value: "",
          banks: [],
          account_id: "",
          account_name: "",
          bank: "",
          userId: ""
        }),
        (_this5.updateParent = function(_ref6) {
          var banks = _ref6.banks,
            _ref6$account_id = _ref6.account_id,
            account_id = _ref6$account_id === undefined ? "" : _ref6$account_id,
            _ref6$account_name = _ref6.account_name,
            account_name =
              _ref6$account_name === undefined ? "" : _ref6$account_name,
            _ref6$bank = _ref6.bank,
            bank = _ref6$bank === undefined ? "" : _ref6$bank;

          _this5.setState({
            banks: banks,
            account_id: account_id,
            account_name: account_name,
            bank: bank
          });
        }),
        _temp3)),
        _possibleConstructorReturn(_this5, _ret3)
      );
    }

    _createClass(App, [
      {
        key: "componentDidMount",
        value: function componentDidMount() {
          this.setState({ userId: this.props.userId });
        }
      },
      {
        key: "render",
        value: function render() {
          var _this6 = this;

          return React.createElement(
            EditContainer,
            {
              render: function render(openModal) {
                return React.createElement(
                  ButtonLink,
                  { onClick: openModal },
                  "Refund Client"
                );
              }
            },
            function(closeModal) {
              return React.createElement(
                Form,
                _extends({}, _this6.state, {
                  url: "" + _this6.props.baseUrl + _this6.state.userId + "/",
                  closeModal: closeModal,
                  kind: _this6.props.kind,
                  updateParent: _this6.updateParent,
                  buttonText: _this6.props.buttonText
                })
              );
            }
          );
        }
      }
    ]);

    return App;
  })(React.Component);

  Array.from(document.querySelectorAll(".pfee")).forEach(function(node) {
    var userId = node.getAttribute("data-user-id");
    var baseUrl = node.getAttribute("data-url");
    var kind = node.getAttribute("data-kind");
    var buttonText = node.getAttribute("data-button-text");
    node.parentNode.setAttribute("class", "field-refund_button nowrap");
    ReactDOM.render(
      React.createElement(App, {
        userId: userId,
        kind: kind,
        baseUrl: baseUrl
      }),
      node.parentNode
    );
  });
}
function remarkImplementation() {
  var RemarkApp = (function(_React$Component4) {
    _inherits(RemarkApp, _React$Component4);

    function RemarkApp() {
      var _ref7;

      var _temp4, _this7, _ret4;

      _classCallCheck(this, RemarkApp);

      for (
        var _len4 = arguments.length, args = Array(_len4), _key4 = 0;
        _key4 < _len4;
        _key4++
      ) {
        args[_key4] = arguments[_key4];
      }

      return (
        (_ret4 = ((_temp4 = ((_this7 = _possibleConstructorReturn(
          this,
          (_ref7 =
            RemarkApp.__proto__ || Object.getPrototypeOf(RemarkApp)).call.apply(
            _ref7,
            [this].concat(args)
          )
        )),
        _this7)),
        (_this7.state = {
          edit: false,
          content: _this7.props.content,
          fields: {
            remark: _this7.props.content,
            action: ""
          }
        }),
        (_this7.showEditButton = function() {
          _this7.setState({ edit: true });
        }),
        (_this7.updateFields = function(key, value) {
          var fields = _this7.state.fields;

          _this7.setState({
            fields: _extends({}, fields, _defineProperty({}, key, value))
          });
        }),
        (_this7.hideEditButton = function() {
          _this7.timeOutId = setTimeout(function() {
            _this7.setState({ edit: false });
          }, 1000);
        }),
        (_this7.updateRemark = function(e, closeModal) {
          e.preventDefault();
          console.log(_this7.state);

          var _this7$state = _this7.state,
            banks = _this7$state.banks,
            rest = _objectWithoutProperties(_this7$state, ["banks"]);

          var request = new Request(
            "" + window.REMARK_URL + _this7.props.request_id + "/",
            {
              method: "post",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(_this7.state.fields)
            }
          );
          fetch(request)
            .then(function(response) {
              if (!response.ok) {
                throw Error(response.statusText);
              }
              return response.json();
            })
            .then(function(response) {
              console.log(response);
              _this7.setState({ content: response.content });
              closeModal(e);
            });
        }),
        (_this7.disableSubmit = function() {
          var fields = _this7.state.fields;

          var result =
            Object.keys(fields)
              .map(function(x) {
                return fields[x];
              })
              .filter(function(x) {
                return x.trim().length > 0;
              }).length !== 2;
          return result;
        }),
        (_this7.getDate = function() {
          var dd = new Date();
          return (
            dd.getFullYear() + "-" + (dd.getMonth() + 1) + "-" + dd.getDate()
          );
        }),
        _temp4)),
        _possibleConstructorReturn(_this7, _ret4)
      );
    }

    _createClass(RemarkApp, [
      {
        key: "render",
        value: function render() {
          var _this8 = this;

          return React.createElement(
            EditContainer,
            {
              render: function render(openModal) {
                return React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    "p",
                    {
                      onMouseOver: _this8.showEditButton,
                      onMouseOut: _this8.hideEditButton
                    },
                    _this8.state.content
                  ),
                  _this8.state.edit
                    ? React.createElement(
                        ButtonLink,
                        { onClick: openModal },
                        "Update Remark"
                      )
                    : null
                );
              }
            },
            function(closeModal) {
              return React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "fieldset",
                  { className: "module aligned " },
                  React.createElement(
                    "h2",
                    { style: styles.parent },
                    "Update Remark"
                  ),
                  React.createElement(
                    FormGroup,
                    { label: "Action" },
                    React.createElement(
                      "select",
                      {
                        style: styles.input,
                        onChange: function onChange(e) {
                          return _this8.updateFields("action", e.target.value);
                        },
                        value: _this8.state.fields.action
                      },
                      React.createElement(
                        "option",
                        { value: "" },
                        "Select Action"
                      ),
                      React.createElement(
                        "option",
                        { value: "profile_to_client" },
                        "Send profile to client"
                      ),
                      React.createElement(
                        "option",
                        { value: "activity_log" },
                        "Log calls/sms/email"
                      ),
                      React.createElement(
                        "option",
                        { value: "call_client_later" },
                        "Contact client later"
                      ),
                      React.createElement(
                        "option",
                        { value: "generic" },
                        "Generic action"
                      )
                    )
                  ),
                  React.createElement(
                    FormGroup,
                    { label: "Remark:" },
                    _this8.state.fields.action === "call_client_later"
                      ? React.createElement("input", {
                          type: "date",
                          style: styles.input,
                          value: _this8.state.fields.remark,
                          className: "vTextField",
                          min: _this8.getDate(),
                          onChange: function onChange(e) {
                            return _this8.updateFields(
                              "remark",
                              e.target.value
                            );
                          }
                        })
                      : React.createElement("textarea", {
                          rows: 4,
                          style: styles.input,
                          value: _this8.state.fields.remark,
                          className: "vTextField",
                          onChange: function onChange(e) {
                            return _this8.updateFields(
                              "remark",
                              e.target.value
                            );
                          }
                        })
                  )
                ),
                React.createElement(
                  "div",
                  { class: "submit-row" },
                  _this8.disableSubmit()
                    ? null
                    : React.createElement("input", {
                        onClick: function onClick(e) {
                          _this8.updateRemark(e, closeModal);
                        },
                        value: "Update Remark",
                        class: "default",
                        type: "submit"
                      }),
                  React.createElement(
                    "p",
                    { class: "deletelink-box" },
                    React.createElement(
                      "a",
                      { href: "#", onClick: closeModal, class: "deletelink" },
                      "Close Modal"
                    )
                  )
                )
              );
            }
          );
        }
      }
    ]);

    return RemarkApp;
  })(React.Component);

  Array.from(document.querySelectorAll("td.field-remarks")).forEach(function(
    node
  ) {
    var text = node.textContent;
    var id = $(node)
      .siblings()
      .find("input[name=_selected_action]")
      .val();
    ReactDOM.render(
      React.createElement(RemarkApp, { content: text, request_id: id }),
      node
    );
  });
}
function onPageLoad() {
  refundImplementation();
  remarkImplementation();
  console.log($);
}

onPageLoad();
