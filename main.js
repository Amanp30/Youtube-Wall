class Main {
  constructor() {
    this.targetContainer = document.getElementById("videoIDContainer");
    this.form = document.getElementById("addNewForm");

    if (!this.targetContainer || !this.form) {
      console.error("Video container or form not found.");
      return;
    }

    this.videosStored = this.getVideosFromLocalStorage();

    this.bindEvents();
    this.renderStoredVideos();
  }

  bindEvents() {
    this.form.addEventListener("submit", this.handleFormSubmit.bind(this));
  }

  async handleFormSubmit(event) {
    event.preventDefault();
    const file = document.getElementById("selectNewFile").files[0];
    const title = document.getElementById("vdTitle").value;

    if (!file || !title) {
      console.error("File and title are required.");
      return;
    }

    try {
      const base64String = await this.convertToBase64String(file);
      const videoData = {
        src: base64String,
        title,
        id: this.generateUUID(),
      };
      this.saveVideo(videoData);
      this.prependToContainer(this.newVideoElement(videoData));
      this.form.reset();
      this.clearNoVideosMessage();
    } catch (error) {
      console.error("Error adding new video:", error);
    }
  }

  generateUUID() {
    let dt = new Date().getTime();
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  async convertToBase64String(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(new Error("Error reading file."));
      };
      reader.readAsDataURL(file);
    });
  }

  getVideosFromLocalStorage() {
    try {
      const storedData = localStorage.getItem("videos");
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error("Error fetching videos from local storage:", error);
      return [];
    }
  }

  saveVideo(videoData) {
    try {
      this.videosStored.push(videoData);
      this.setLocalStorage(this.videosStored);
    } catch (error) {
      console.error("Error saving video:", error);
    }
  }

  setLocalStorage(data) {
    try {
      localStorage.setItem("videos", JSON.stringify(data));
    } catch (error) {
      console.error("Error saving data to local storage:", error);
    }
  }

  renderStoredVideos() {
    if (this.videosStored.length === 0) {
      this.showNoVideoMessage();
      return;
    }

    this.videosStored.forEach((videoData) => {
      this.prependToContainer(this.newVideoElement(videoData));
    });
  }

  showNoVideoMessage() {
    const message = `<div class="NoVideoMessage">
            <p>No videos to show, Add first video</p>
            </div>`;
    this.targetContainer.innerHTML = message;
  }

  clearNoVideosMessage() {
    const messageDiv = this.targetContainer.querySelector(".NoVideoMessage");
    if (messageDiv) messageDiv.remove();
  }

  updateState(id, updatedData) {
    const indexFound = this.videosStored.findIndex((vid) => vid.id === id);

    if (indexFound !== -1) {
      this.videosStored[indexFound] = updatedData;
      this.setLocalStorage(this.videosStored);

      const foundDiv = document.querySelector(`[data-id="${updatedData.id}"]`);

      if (foundDiv) {
        const newRenderedDiv = this.newVideoElement(updatedData);
        this.targetContainer.replaceChild(newRenderedDiv, foundDiv);
      } else {
        console.error("Video not found with ID:", id);
      }
    }
  }

  newVideoElement(videoData) {
    const videoHere = document.createElement("div");
    videoHere.classList.add("videoHere");

    videoHere.setAttribute("data-id", videoData.id);

    videoHere.addEventListener("dblclick", () => {
      const od = document.createElement("div");
      od.id = "overlayDiv";
      od.innerHTML = `
            <form class="overlayForm" id="updateForm">
                <img src="${videoData.src}" />
                <label for="updateImg">Change Image</label>
                <input type="file" id="updateImg" accept=".png" />
                <label for="updateVideoTitle">Video Title</label>
                <input type="text" id="updateVideoTitle" value="${videoData.title}" />
                <button type="submit" id="updateButton">Update</button>
                <button type="button" id="cancelButton">Cancel</button>
            </form>    
        `;

      const updateForm = od.querySelector("#updateForm");
      const cancelButton = od.querySelector("#cancelButton");

      updateForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const file = updateForm.querySelector("#updateImg").files[0];
        const updatedTitle =
          updateForm.querySelector("#updateVideoTitle").value;

        try {
          let base64String = null;
          if (file) {
            base64String = await this.convertToBase64String(file);
          }

          const updatedVideoData = {
            src: base64String || videoData.src,
            title: updatedTitle || videoData.title,
            id: videoData.id,
          };

          this.updateState(videoData.id, updatedVideoData);

          od.remove();
        } catch (error) {
          console.error("Error updating video:", error);
        }
      });

      cancelButton.addEventListener("click", () => {
        od.remove();
      });

      document.body.appendChild(od);
    });

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("imgContainer");
    const img = document.createElement("img");
    img.src = videoData.src;
    img.alt = "Video thumbnail";
    imgContainer.appendChild(img);

    const vidTitleContainer = document.createElement("div");
    vidTitleContainer.classList.add("vidTitleContainer");
    const p = document.createElement("p");
    p.classList.add("videotitle");
    p.textContent = videoData.title;
    vidTitleContainer.appendChild(p);

    videoHere.appendChild(imgContainer);
    videoHere.appendChild(vidTitleContainer);

    return videoHere;
  }

  prependToContainer(element) {
    this.targetContainer.insertBefore(element, this.targetContainer.firstChild);
  }
}

const main = new Main();

const mode = document.getElementById("mode");

function toggleMode() {
  const darkMode = localStorage.getItem("darkMode") === "true";
  localStorage.setItem("darkMode", !darkMode);
  document.documentElement.classList.toggle("dark", !darkMode);
  mode.innerText = !darkMode ? "Enable Light Mode" : "Enable Dark Mode";
}

mode.addEventListener("click", toggleMode);

document.addEventListener("DOMContentLoaded", function () {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.documentElement.classList.add("dark");
    mode.innerText = "Enable Light Mode";
  } else {
    mode.innerText = "Enable Dark Mode";
  }
});
