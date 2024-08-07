import React, { useEffect, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import "moment/locale/pl";
import { BiSolidChat } from "react-icons/bi";
import { socket } from "./service/socket";
import MessageForm from "./components/MessageForm/MessageForm";
import Chat from "./components/Chat/Chat";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatNav from "./components/ChatNav/ChatNav";
import Profile from "./components/Profile/Profile";

export interface Message {
  nickname: string;
  content: string;
  sendDate: string;
}

export interface Room {
  token: string;
  name: string;
  isGroup: boolean;
}

// TO DO
// add group formularz
// scroll area na friends i groups
// handle data aby sie wyswietlala tylko godzina i minuta jezeli to dzisij, wyswietla sie dzien tygodnia i godzina jezeli to ten tydzien, wyswietla sie cały date jezeli ponad tydzien
// usuwanie znajomego
// jezeli wejde za wysoko w konwersacji to zrob slide to bottom przycisk

function App() {
  const [newMessage, setNewMessage] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [myNickname, setMyNickname] = useState<string>("");
  const [isRegisterPage, setIsRegisterPage] = useState<boolean>(false);
  const [isChatChoosen, setIsChatChoosen] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      nickname: "Max",
      content: "Hejka!",
      sendDate: "21:21 2022-06-30",
    },
    {
      nickname: "igor",
      content: "No cześć co tam",
      sendDate: "02:14 2024-06-12",
    },
    {
      nickname: "Max",
      content: "Mogłbyś mi pomóc?",
      sendDate: "22:21 2024-07-29",
    },
    {
      nickname: "Max",
      content: "Konkretnie mam do przeniesienia trochę gruzu i chciałbym abyś mi pomógł na moim ogródku",
      sendDate: "22:22 2024-07-29",
    },
    {
      nickname: "igor",
      content: "No spoko",
      sendDate: "11:11 2024-07-31",
    },
    {
      nickname: "igor",
      content: "Wpadnę jutro",
      sendDate: "11:12 2024-07-31",
    },
  ]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room>({ token: "fake token", name: "Max", isGroup: false });
  const [inviteReqests, setInviteRequests] = useState<string[]>([]);

  useEffect(() => {
    //socket.connect();

    socket.on("get:message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    socket.on("get:invite", (invite) => {
      if (invite.receiver === myNickname) {
        console.log(`Jam ${invite.receiver} otrzymał invite REQUESTA od ${invite.sender}`);
        setInviteRequests((prevInvitesRequests) => [...prevInvitesRequests, invite.sender]);
      }
    });

    socket.on("get:all-invites", (response) => {
      if (response.nickname === myNickname) {
        console.log(`Loaduje wszystkie invites dla mej osobowosci ${response.nickname}`);
        setInviteRequests(response.arr);
      }
    });

    socket.on("get:room", (response: { sender: Room; receiver: Room }) => {
      if (response.receiver.name === myNickname) {
        setRooms((rooms) => [...rooms, response.sender]);
      } else if (response.sender.name === myNickname) {
        setRooms((rooms) => [...rooms, response.receiver]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      // with server
      // const messageData = { nickname: myNickname, content: newMessage, token: currentRoom.token };
      // socket.emit("send:message", messageData);

      // with only front-end

      setMessages((messages) => [
        ...messages,
        { nickname: "igor", content: newMessage, sendDate: moment().format("HH:mm:ss YYYY-MM-DD") },
      ]);
      setNewMessage("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const element = document.querySelector(".scroll-area") as HTMLDivElement;
      if (element) {
        const start = element.scrollTop;
        const end = element.scrollHeight;
        const distance = end - start;
        const duration = 300;
        let startTime: number | null = null;

        const animateScroll = (currentTime: number) => {
          if (!startTime) startTime = currentTime;
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          element.scrollTop = start + distance * progress;

          if (elapsed < duration) {
            window.requestAnimationFrame(animateScroll);
          } else {
            element.scrollTop = end;
          }
        };
        window.requestAnimationFrame(animateScroll);
      }
    }, 0);
  };

  return (
    <div className="container-fluid p-0">
      {token ? (
        <div className="container-fluid">
          <div className="row">
            <div className="header">
              <h1 className="text-center my-3">
                Chat <BiSolidChat />
              </h1>
              <div>
                <Profile
                  myNickname={myNickname}
                  setToken={setToken}
                  token={token}
                  inviteReqests={inviteReqests}
                  setInviteRequests={setInviteRequests}
                  setRooms={setRooms}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <Sidebar
              rooms={rooms}
              setIsChatChoosen={setIsChatChoosen}
              setMessages={setMessages}
              setCurrentRoom={setCurrentRoom}
              myNickname={myNickname}
              scrollToBottom={scrollToBottom}
              setToken={setToken}
              token={token}
            />
            <div className="chat-container  col-12 col-md-9">
              {isChatChoosen ? (
                <>
                  <ChatNav currentRoom={currentRoom} />
                  <Chat messages={messages} myNickname={myNickname} />
                  <MessageForm newMessage={newMessage} setNewMessage={setNewMessage} sendMessage={sendMessage} />
                </>
              ) : (
                <h1 className="chat-place-holder text-center p-5">Choose the chat</h1>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {isRegisterPage ? (
            <RegisterPage setIsRegisterPage={setIsRegisterPage} />
          ) : (
            <LoginPage
              setToken={setToken}
              setRooms={setRooms}
              setMyNickname={setMyNickname}
              setIsRegisterPage={setIsRegisterPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
