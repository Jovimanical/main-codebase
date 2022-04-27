const customStyles = {
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
const styles = {
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
const Modal = ReactModal;
const FormGroup = ({ label, children }) => (
  <div style={styles.FormGroup} className="form-row field-first_name">
    <div>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  </div>
);
class EditContainer extends React.Component {
  state = { modalIsOpen: false };
  openModal = () => {
    this.setState({ modalIsOpen: true });
  };

  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
  };

  closeModal = e => {
    e.preventDefault();
    this.setState({ modalIsOpen: false });
  };
  render() {
    return (
      <React.Fragment>
        {this.props.render(this.openModal)}
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          ariaHideApp={false}
          contentLabel="Example Modal"
        >
          {this.props.children(this.closeModal)}
        </Modal>
      </React.Fragment>
    );
  }
}
const ButtonLink = ({ node = "a", children, ...rest }) => {
  let className = "button nowrap";
  let style = { cursor: "pointer", padding: "7px", marginRight: "10px" };
  return React.createElement(node, { ...rest, className, style }, children);
};

function refundImplementation() {
  class Form extends React.Component {
    state = {
      banks: [],
      account_id: "",
      account_name: "",
      bank: ""
    };
    componentDidMount() {
      if (this.props.banks.length == 0) {
        fetch(this.props.url)
          .then(response => {
            if (response.status !== 200) {
              console.log(
                "Looks like there was a problem. Status Code: " +
                  response.status
              );
              return;
            }
            // Examine the text in the response
            response.json().then(data => {
              const {
                banks,
                account_id = "",
                account_name = "",
                bank = ""
              } = data;
              this.setState({ banks, account_id, account_name, bank });
              console.log(data);
              this.props.updateParent(data);
            });
          })
          .catch(function(err) {
            console.log("Fetch Error :-S", err);
          });
      } else {
        this.setState(this.props);
      }
    }
    refundTutor = e => {
      e.preventDefault();
      console.log(this.state);
      const { banks, ...rest } = this.state;
      let request = new Request(this.props.url, {
        method: "post",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rest)
      });
      fetch(request)
        .then(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then(response => {
          console.log(response);
          window.location.reload();
        });
    };
    render() {
      const fields = [
        {
          label: "Account number",
          key: "account_id",
          extra: { maxlength: 10 }
        },
        { label: "Account name", key: "account_name", extra: {} }
      ];
      return (
        <React.Fragment>
          <fieldset className="module aligned ">
            <h2 style={styles.parent}>{`Refund ${
              this.props.kind
            } fee form.`}</h2>
            {fields.map(field => (
              <FormGroup label={`${field.label}:`}>
                <input
                  style={styles.input}
                  value={this.state[field.key]}
                  className="vTextField"
                  {...field.extra}
                  onChange={e => this.setState({ [field.key]: e.target.value })}
                  type="text"
                />
              </FormGroup>
            ))}
            <FormGroup label="Bank">
              <select
                style={styles.input}
                onChange={e => this.setState({ bank: e.target.value })}
                value={this.state.bank}
              >
                {this.state.banks.map(bank => (
                  <option value={bank[0]}>{bank[1]}</option>
                ))}
              </select>
            </FormGroup>
          </fieldset>
          <div class="submit-row">
            <input
              onClick={this.refundTutor}
              value={this.props.buttonText}
              class="default"
              type="submit"
            />
            <p class="deletelink-box">
              <a href="#" onClick={this.props.closeModal} class="deletelink">
                Close Modal
              </a>
            </p>
          </div>
        </React.Fragment>
      );
    }
  }

  class App extends React.Component {
    state = {
      value: "",
      banks: [],
      account_id: "",
      account_name: "",
      bank: "",
      userId: ""
    };
    updateParent = ({
      banks,
      account_id = "",
      account_name = "",
      bank = ""
    }) => {
      this.setState({
        banks,
        account_id,
        account_name,
        bank
      });
    };
    componentDidMount() {
      this.setState({ userId: this.props.userId });
    }

    render() {
      return (
        <EditContainer
          render={openModal => {
            return <ButtonLink onClick={openModal}>Refund Client</ButtonLink>;
          }}
        >
          {closeModal => {
            return (
              <Form
                {...this.state}
                url={`${this.props.baseUrl}${this.state.userId}/`}
                closeModal={closeModal}
                kind={this.props.kind}
                updateParent={this.updateParent}
                buttonText={this.props.buttonText}
              />
            );
          }}
        </EditContainer>
      );
    }
  }

  Array.from(document.querySelectorAll(".pfee")).forEach(node => {
    const userId = node.getAttribute("data-user-id");
    const baseUrl = node.getAttribute("data-url");
    const kind = node.getAttribute("data-kind");
    const buttonText = node.getAttribute("data-button-text");
    node.parentNode.setAttribute("class", "field-refund_button nowrap");
    ReactDOM.render(
      <App userId={userId} kind={kind} baseUrl={baseUrl} />,
      node.parentNode
    );
  });
}
function remarkImplementation() {
  class RemarkApp extends React.Component {
    state = {
      edit: false,
      content: this.props.content,
      fields: {
        remark: this.props.content,
        action: ""
      }
    };
    showEditButton = () => {
      this.setState({ edit: true });
    };
    updateFields = (key, value) => {
      const { fields } = this.state;
      this.setState({ fields: { ...fields, [key]: value } });
    };
    hideEditButton = () => {
      this.timeOutId = setTimeout(() => {
        this.setState({ edit: false });
      }, 1000);
    };
    updateRemark = (e, closeModal) => {
      e.preventDefault();
      console.log(this.state);
      const { banks, ...rest } = this.state;
      let request = new Request(
        `${window.REMARK_URL}${this.props.request_id}/`,
        {
          method: "post",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(this.state.fields)
        }
      );
      fetch(request)
        .then(response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response.json();
        })
        .then(response => {
          console.log(response);
          this.setState({ content: response.content });
          closeModal(e);
        });
    };
    disableSubmit = () => {
      const { fields } = this.state;
      let result =
        Object.keys(fields)
          .map(x => fields[x])
          .filter(x => x.trim().length > 0).length !== 2;
      return result;
    };
    getDate = () => {
      let dd = new Date();
      return `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`;
    };
    render() {
      return (
        <EditContainer
          render={openModal => {
            return (
              <React.Fragment>
                <p
                  onMouseOver={this.showEditButton}
                  onMouseOut={this.hideEditButton}
                >
                  {this.state.content}
                </p>
                {this.state.edit ? (
                  <ButtonLink onClick={openModal}>Update Remark</ButtonLink>
                ) : null}
              </React.Fragment>
            );
          }}
        >
          {closeModal => {
            return (
              <React.Fragment>
                <fieldset className="module aligned ">
                  <h2 style={styles.parent}>{`Update Remark`}</h2>
                  <FormGroup label="Action">
                    <select
                      style={styles.input}
                      onChange={e =>
                        this.updateFields("action", e.target.value)
                      }
                      value={this.state.fields.action}
                    >
                      <option value="">Select Action</option>
                      <option value={"profile_to_client"}>
                        Send profile to client
                      </option>
                      <option value="activity_log">Log calls/sms/email</option>
                      <option value="call_client_later">
                        Contact client later
                      </option>
                      <option value="generic">Generic action</option>
                    </select>
                  </FormGroup>
                  <FormGroup label={`Remark:`}>
                    {this.state.fields.action === "call_client_later" ? (
                      <input
                        type="date"
                        style={styles.input}
                        value={this.state.fields.remark}
                        className="vTextField"
                        min={this.getDate()}
                        onChange={e =>
                          this.updateFields("remark", e.target.value)
                        }
                      />
                    ) : (
                      <textarea
                        rows={4}
                        style={styles.input}
                        value={this.state.fields.remark}
                        className="vTextField"
                        onChange={e =>
                          this.updateFields("remark", e.target.value)
                        }
                      />
                    )}
                  </FormGroup>
                </fieldset>
                <div class="submit-row">
                  {this.disableSubmit() ? null : (
                    <input
                      onClick={e => {
                        this.updateRemark(e, closeModal);
                      }}
                      value="Update Remark"
                      class="default"
                      type="submit"
                    />
                  )}
                  <p class="deletelink-box">
                    <a href="#" onClick={closeModal} class="deletelink">
                      Close Modal
                    </a>
                  </p>
                </div>
              </React.Fragment>
            );
          }}
        </EditContainer>
      );
    }
  }
  Array.from(document.querySelectorAll("td.field-remarks")).forEach(node => {
    let text = node.textContent;
    let id = $(node)
      .siblings()
      .find("input[name=_selected_action]")
      .val();
    ReactDOM.render(<RemarkApp content={text} request_id={id} />, node);
  });
}
function onPageLoad() {
  refundImplementation();
  remarkImplementation();
  console.log($);
}

onPageLoad();
