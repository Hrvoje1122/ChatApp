import {Component} from "react";
import React from "react";


class Input extends Component {
    state = {
        text: "",
        typing: false,
        memberStopTypingTimeout: 0
    };

    onChange(e) {
        const {typing} = this.state;
        this.setState({text: e.target.value});
        this.setMemberStopTypingTimeout();
        if (typing) {
            return;
        }
        this.setMemberTyping(true);
        this.props.onMemberStartTyping();
    }

    setMemberStopTypingTimeout() {
        const {memberStopTypingTimeout} = this.state;
        if (memberStopTypingTimeout) {
            clearTimeout(memberStopTypingTimeout);
        }
        this.setState({
            memberStopTypingTimeout: setTimeout(() => {
                this.setState({typing: false});
                this.props.onMemberStopTyping();
            }, 800)
        });
    }

    setMemberTyping(typing) {
        this.setState({typing: typing});
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({text: ""});
        this.props.onSendMessage(this.state.text);
    }

    render() {
        return (
            <div className="Input">
                <form onSubmit={e => this.onSubmit(e)}>
                    <input
                        onChange={e => this.onChange(e)}
                        value={this.state.text}
                        type="text"
                        placeholder="Enter your message"
                        autoFocus={true}
                    />
                    <button>Send</button>
                </form>
            </div>
        );
    }
}

export default Input;