import React, {Component} from 'react';
import './App.css';
import Messages from "./Messages";
import Input from "./Input";

function randomName() {
    const adjectives = [
        "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
        "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
    ];
    const nouns = [
        "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
        "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
        "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
    ];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return adjective + noun;
}

function randomColor() {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

class App extends Component {
    state = {
        messages: [],
        member: {
            username: randomName(),
            color: randomColor(),
        },
        memberTyping: {
            member: '',
            typing: false,
        }
    }

    constructor(props) {
        super(props);
        this.openScaledroneConnection();
    }

    openScaledroneConnection() {
        this.drone = new window.Scaledrone("3Dv1xDIzhViYlrIm", {
            data: this.state.member
        });
        this.drone.on('open', error => {
            if (error) {
                return console.error(error);
            }
            const member = {...this.state.member};
            member.id = this.drone.clientId;
            this.setState({member});
        });
        this.subscribeOnRoomMessages();
    }

    subscribeOnRoomMessages() {
        const room = this.drone.subscribe("observable-room");
        room.on('data', (data, member) => {
            if (typeof data.userTyping == 'boolean') {
                this.updateMemberTypingState(data.userTyping, member.clientData.username);
                return;
            }
            const messages = this.state.messages;
            messages.push({member, text: data});
            this.setState({messages});
        });
    }

    updateMemberTypingState(typing, memberTypingUsername) {
        const {member} = this.state;
        if (member.username === memberTypingUsername) {
            return;
        }
        this.setState({
            memberTyping: {
                member: memberTypingUsername,
                typing,
            }
        });
    }

    setMemberStoppedTyping() {
        this.setState({
            memberTyping: {
                typing: false
            }
        });
    }

    render() {
        const {memberTyping} = this.state;
        let typing = '';
        if (memberTyping.typing) {
            typing = memberTyping.member + ' is typing...';
        }
        return  (
            <div className="App">
                <div className="App-header">
                    <h1>Chat</h1>
                    <h5>{typing}</h5>
                </div>
                <Messages
                    messages={this.state.messages}
                    currentMember={this.state.member}
                />
                <Input
                    onSendMessage={this.onSendMessage}
                    onMemberStartTyping={this.notifyMemberStartTyping}
                    onMemberStopTyping={this.notifyMemberStopTyping}
                />
            </div>
        );
    }

    onSendMessage = (inputText) => {
        this.drone.publish({
            room: "observable-room",
            message: inputText
        });
    }

    notifyMemberStartTyping = () => {
        this.drone.publish({
            room: "observable-room",
            message: {userTyping: true}
        });
    }

    notifyMemberStopTyping = () => {
        this.drone.publish({
            room: "observable-room",
            message: {userTyping: false}
        });
    }

}

export default App;