const fileDropzone = document.querySelector(".main");
const fileInput = document.getElementById("file");
const submit = document.getElementById("submit");
const copy = document.getElementById("copy");
const messageDiv = document.querySelector(".message");
const link = document.getElementById("copy-link");
const progress = document.querySelector(".progress-bar ");
const selectedFile = document.querySelector(".selected-file");
const removeFile = document.getElementById("remove-file");

const HOST_UPLOAD = "https://my-fileshare-01.herokuapp.com/upload/file";
const EMAIL_UPLOAD = "https://my-fileshare-01.herokuapp.com/send/mail";

file.addEventListener("change", (e) => {
  e.preventDefault();
  const file = e.target.files;
  fileInput.files = file;
  selectedFile.style.display = "block";
  document.getElementById("file-name").innerText = file[0].name;
  document.getElementById("size").innerText = `${parseInt(
    file[0].size / 1000
  )}  KB`;
  UploadFile(e);
});

removeFile.addEventListener("click", () => {
  clear();
});

fileDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!fileDropzone.classList.contains("dragged")) {
    fileDropzone.classList.add("dragged");
  }
});

fileDropzone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  fileDropzone.classList.remove("dragged");
});

fileDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length !== 0) {
    const file = e.dataTransfer.files;
    fileDropzone.classList.remove("dragged");
    selectedFile.style.display = "block";
    document.getElementById("file-name").innerText = file[0].name;
    document.getElementById("size").innerText = `${parseInt(
      file[0].size / 1000
    )}  KB`;
    fileInput.files = file;
    UploadFile(e);
  }
});

submit.addEventListener("click", (e) => {
  e.preventDefault();
  const to = document.getElementById("to");
  const from = document.getElementById("from");

  if (!to.value || !from.value) {
    message("All filds are required !", "red", true);
    submit.innerText = "Send";
    submit.disabled = false;
  } else {
    submit.innerText = "Sending mail...";
    submit.disabled = true;
    const data = {
      to: to.value,
      from: from.value,
      uid: link.value.split("/").splice(-1, 1),
    };

    fetch(EMAIL_UPLOAD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        message("Email sent !", "green");
        submit.innerText = "Send";
        submit.disabled = false;

        setTimeout(() => {
          clear();
        }, 3000);
      })
      .catch((err) => message("Something went wrong !", "red"));
  }
});

const UploadFile = (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (fileInput.files.length > 1) {
    message("Only on file will be uploaded !", "red", true);
    upload();
  } else if (file.size > 10 ** 6 * 100) {
    message("File size is to large !", "red", true);
  } else if (fileInput.files.length == 1) {
    upload();
  }
};

const upload = () => {
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);
  progress.style.display = "block";

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      document.querySelector(".link-div").style.display = "block";
      document.querySelector(".mail-div").style.display = "block";
      let value = JSON.parse(xhr.response);
      if (value.error) {
        message("Something went wrong!", "red");
        progress.style.display = "none";
        clear();
      }
      link.value = value.file;
      progress.style.display = "none";
      document.getElementById("or").style.display = "block";
    }
  };
  xhr.upload.onprogress = (e) => {
    const { loaded, total } = e;
    let percentage = Math.round((loaded / total) * 100);
    document.getElementById("progress").style.width = `${percentage}%`;
    document.getElementById("percentage").innerText = `${percentage}%`;
  };

  xhr.open("POST", HOST_UPLOAD);
  xhr.send(formData);
};

// copy link to the clipboard
copy.addEventListener("click", (e) => {
  const copyLink = document.querySelector("#copy-link");
  navigator.clipboard.writeText(copyLink.value);
  message("Copied to clipboard", "orange");
});

let timer;

const message = (msg, color, error) => {
  if (error) {
    document.getElementById("msg-icon").innerHTML = `<img src="./error.svg" />`;
  } else {
    document.getElementById("msg-icon").innerHTML = `<img src="./check.svg" />`;
  }
  if (!messageDiv.classList.contains("show-message")) {
    messageDiv.classList.add("show-message");
    document.getElementById("msg-text").innerText = msg;
    messageDiv.style.backgroundColor = color;
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    messageDiv.classList.remove("show-message");
    color = "orange";
  }, 2500);
};

const clear = () => {
  document.querySelector(".link-div").style.display = "none";
  document.querySelector(".mail-div").style.display = "none";
  document.getElementById("to").value = "";
  document.getElementById("from").value = "";
  document.getElementById("or").style.display = "none";
  selectedFile.style.display = "none";
  fileInput.files = null;
  link.value = "";
  progress.style.display = "none";
  document.getElementById("progress").style.width = "0";
};
