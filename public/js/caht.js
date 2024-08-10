// public/js/chat.js
$(document).ready(() => {
    const socket = io();
  
    $("#chatForm").submit(() => {
      const text = $("#chat-input").val(),
            userName = $("#chat-user-name").val(),
            userId = $("#chat-user-id").val(),
            roomNum = $("#chat-room-id").val(); //숨겨진 입력 필드에서 roomNum 가져오기
  
      socket.emit("message", {
        content: text,
        userName: userName,
        userId: userId,
        roomNum: roomNum, //roomNum을 서버로 전송
        senderNum: userId, //senderNum을 userId로 설정
        receiverNum: getReceiverId() //receiverNum을 가져오는 함수 구현
      });
  
      $("#chat-input").val("");
      return false;
    });
  
    socket.on("message", message => {
      displayMessage(message);
    });
  
    socket.on("load all messages", data => {
      data.forEach(message => {
        displayMessage(message);
      });
    });
  
    socket.on("message", message => {
      displayMessage(message);
      for (let i = 0; i < 2; i++) {
        $(".chat-icon").fadeOut(200).fadeIn(200);
      }
    });
  
    const displayMessage = message => {
      $("#chat").prepend(
        $("<li>").html(`
          <div class='message ${getCurrentUserClass(message.senderNum)}'>
            <span class="user-name">${message.userName}:</span>
            ${message.message}
          </div>
        `)
      );
    };
  
    const getCurrentUserClass = id => {
      const userId = $("#chat-user-id").val();
      return userId === id ? "current-user" : "";
    };
  
    const getReceiverId = () => {
      //채팅방 또는 컨텍스트에 따라 receiver ID를 결정하는 로직 구현
      return someReceiverId; //실제 로직으로 교체
    };
  });
  