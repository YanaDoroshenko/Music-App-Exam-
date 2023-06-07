class App {
  static API_KEY = "438b11dfd9msh69dedc151d4924fp1a1d28jsn15d25d1b44f0";
  static SEARCH_URL = "https://deezerdevs-deezer.p.rapidapi.com/search?q=";
  static DEFAULT_HEADERS = {
    "X-RapidAPI-Key": App.API_KEY,
    "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
  };
  static searchBtn = document.querySelector("#search-btn");
  static input = document.querySelector("#search-input");
  static output = document.querySelector("#output");
  static playList = document.querySelector("#play-list");
  static playListBtn = document.querySelector("#my-pL-btn");
  static SECTIONS = {
    main: "main",
    playlistSection: "playlistSection",
  };

  constructor(data = [], myPlayList = []) {
    this.data = data;
    this.myPlayList = myPlayList;
    this.currentPage = App.SECTIONS.main;

    App.searchBtn.onclick = () => this.onButtonClick();
    App.playListBtn.onclick = () =>
      this.currentPage === App.SECTIONS.main
        ? this.renderPlayList()
        : this.renderMainPage();

    App.input.oninput = (event) => this.onInputChange(event);
  }

  onInputChange(event) {
    if (this.currentPage === App.SECTIONS.playlistSection) {
      const tracks = this.getPlayListData();

      const filterTracks = tracks.filter(({ title }) =>
        title.toLowerCase().includes(event.target.value.toLowerCase())
      );

      this.renderData(filterTracks, App.playList, true);
    }
  }

  onButtonClick() {
    this.getDataBySearch(App.input.value).then(() => {
      App.input.value = "";
      console.log("Data", this.data);

      this.renderData(this.data, App.output);
    });
  }

  async getDataBySearch(artist = "") {
    try {
      const response = await fetch(App.SEARCH_URL + artist, {
        headers: App.DEFAULT_HEADERS,
      });
      const data = await response.json();

      this.data = data.data ? data.data : [];
    } catch (e) {
      alert("Query is invalid");
    }
  }

  getPlayListData() {
    return JSON.parse(localStorage.getItem("playlist") || "[]");
  }

  addPlayListData(track) {
    const oldTracks = this.getPlayListData();
    localStorage.setItem("playlist", JSON.stringify([...oldTracks, track]));
  }

  removePlayListData(id) {
    const oldTracks = this.getPlayListData();
    localStorage.setItem(
      "playlist",
      JSON.stringify([...oldTracks].filter((track) => track.id !== id))
    );
  }

  checkPlayListContainsTrack(id) {
    return this.getPlayListData().find((track) => track.id === id)
      ? true
      : false;
  }

  renderData(
    dataToRender,
    outputElement = App.output,
    isUsingAsPlayList = false
  ) {
    outputElement.innerHTML = "";
    //     id:664107
    // readable:true
    // title:"Take on Me"
    // title_short:"Take on Me"
    // title_version:""
    // link:"https://www.deezer.com/track/664107"
    // duration:227
    // rank:954653
    // explicit_lyrics:false
    // explicit_content_lyrics:0
    // explicit_content_cover:0
    // preview:"https://cdns-preview-e.dzcdn.net/stream/c-e817b793ead610762756f4f3a48dfcd9-13.mp3"
    // md5_image:"e0ce8977ab98d73bcea00fc838ece034"
    dataToRender.forEach((track) => {
      const {
        id,
        title,
        rank,
        duration,
        album,
        preview,
      } = track;

      const { cover_medium, name } = album;

      const isTrackAddedToPlaylist = this.checkPlayListContainsTrack(id);

      outputElement.innerHTML += `<div class="track-elem ${
        isTrackAddedToPlaylist ? "play-list-track" : ""
      }">
        <img src="${cover_medium}"/>
        <h3 class="title">${title}</h3>
        <h4 class="rank">Rank: ${rank}</h4>
        <h4 class="duration">Duration: ${duration}</h4>

        <audio src="${preview}" controls></audio> 

        <button id="btn-${id}" class="playlist-btn">${
        isTrackAddedToPlaylist ? "Delete from PlayList" : "Add to PlayList"
      }</button>

        </div>`;
    })


    const playlistBtn =
      this.currentPage === App.SECTIONS.main
        ? App.output.querySelectorAll(".playlist-btn")
        : App.playList.querySelectorAll(".playlist-btn");


    [...playlistBtn].forEach((btn, i) => {
      btn.onclick = () => {
        const currentTrack = dataToRender[i];
        if (this.checkPlayListContainsTrack(currentTrack.id)) {
          this.removePlayListData(currentTrack.id);

          isUsingAsPlayList &&
            this.renderData(this.getPlayListData(), App.playList, true);

          btn.textContent = "Add to PlayList";

          const btnMainPage = App.output.querySelector(`#${btn.id}`);
          const btnPlayList = App.playList.querySelector(`#${btn.id}`);

          if(btnMainPage) btnMainPage.textContent = "Add to PlayList";
          if(btnPlayList) btnPlayList.textContent = "Add to PlayList";
          
        } else {
          this.addPlayListData(currentTrack);
          btn.textContent = "Delete from PlayList";

          const btnMainPage = App.output.querySelector(`#${btn.id}`);
          const btnPlayList = App.playList.querySelector(`#${btn.id}`);

          if(btnMainPage) btnMainPage.textContent = "Delete from PlayList";
          if(btnPlayList) btnPlayList.textContent = "Delete from PlayList";
        }
      };
    });
  }

  renderPlayList() {
    App.output.style.display = "none";
    App.playList.style.display = "flex";
    App.searchBtn.style.display = "none";
    App.playListBtn.textContent = "Go to Main Page";

    this.currentPage = App.SECTIONS.playlistSection;

    const playlistData = this.getPlayListData();
    this.renderData(playlistData, App.playList, true);
  }

  renderMainPage() {
    App.output.style.display = "flex";
    App.playList.style.display = "none";
    App.searchBtn.style.display = "inline-block";
    App.playListBtn.textContent = "My Play List";

    this.currentPage = App.SECTIONS.main;
  }


}
new App();
