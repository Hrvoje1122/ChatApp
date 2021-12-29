import React, {Component} from 'react';
import './App.css';
import Messages from "./Messages";
import Input from "./Input";

function randomName() {
    const adjectives = [
        "autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark",
        "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter",
        "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue",
        "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long",
        "late", "lingering", "bold", "little", "morning", "muddy", "old", "red",
        "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering",
        "withered", "wild", "black", "young", "holy", "solitary", "fragrant",
        "aged", "snowy", "proud", "floral", "restless", "divine", "polished",
        "ancient", "purple", "lively", "nameless"
    ];
    const nouns = [
        "waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning",
        "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter",
        "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook",
        "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly",
        "feather", "grass", "haze", "mountain", "night", "pond", "darkness",
        "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder",
        "violet", "water", "wildflower", "wave", "water", "resonance", "sun",
        "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog",
        "smoke", "star"
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
            timeout: 0
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
            if (data.userTyping) {
                this.notifyMemberTyping(member.clientData.username);
                return;
            }
            const messages = this.state.messages;
            messages.push({member, text: data});
            this.setState({messages});
        });
    }

    notifyMemberTyping(memberTypingUsername) {
        const {member, memberTyping} = this.state;
        if (member.username === memberTypingUsername) {
            return;
        }
        if (memberTyping.timeout) {
            clearTimeout(memberTyping.timeout);
        }
        this.setState({
            memberTyping: {
                member: memberTypingUsername,
                typing: true,
                timeout: setTimeout(() => {
                    this.setMemberStoppedTyping();
                }, 1000)
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
        return (
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
                    onInputChange={this.onMemberTyping}
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

    onMemberTyping = () => {
        this.drone.publish({
            room: "observable-room",
            message: {userTyping: true}
        });
    }

}

export default App;
