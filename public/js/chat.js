const socket = io();

const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.getElementById("send-location");
const $message = document.querySelector("#messages");
// document.getElementById('increase').addEventListener('click', () => {
//     console.log('Clicked');
//     socket.emit('increase');
// })

//Templates

//Options
const autoScroll = () => {
    const $newMessage = $message.lastElementChild;

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $message.offsetHeight

    const containerHeight = $message.scrollHeight

    const scrollOffset = $message.scrollTop + visibleHeight
    console.log($message.scrollTop, scrollOffset )

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
}
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createAt: moment(message.createAt).format("h:mm:ss a"),
  });
  $message.insertAdjacentHTML("beforeend", html);
  autoScroll();
});
socket.on("locationMessage", (url) => {
  const html = Mustache.render(locationMessageTemplate, {
    url,
  });
  $message.insertAdjacentHTML("beforeend", html);
});
socket.on("countUpdated", (count) => {
  document.getElementById("count").innerHTML = count;
});
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
    console.log(room);
    console.log(users);
})
$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled"); 
  const message = event.target.elements.message.value;
  $messageFormInput.value = "";
  $messageFormInput.focus();
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return;
  }
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});
socket.emit('join', { username, room }, (error) => {
    if (error) {
        location.href = '/'
        alert(error);
    }

})