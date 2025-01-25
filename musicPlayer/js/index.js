// 将 jQuery 的 DOM 选择替换为原生 JS
const playerContent1 = document.getElementById("player-content1");
const musicName = document.querySelector(".music-name");
const artistName = document.querySelector(".artist-name");
const musicImgs = document.querySelector(".music-imgs");
const playPauseBtn = document.querySelector(".play-pause");
const playPrevBtn = document.querySelector(".prev");
const playNextBtn = document.querySelector(".next");
const time = document.querySelector(".time");
const tProgress = document.querySelector(".current-time");
const totalTime = document.querySelector(".total-time");
const sArea = document.getElementById("s-area");
const insTime = document.getElementById("ins-time");
const sHover = document.getElementById("s-hover");
const seekBar = document.getElementById("seek-bar");

import { musicData } from "./musicData.js";

// 一些计算所需的变量
var seekT,
  seekLoc,
  cM,
  ctMinutes,
  ctSeconds,
  curMinutes,
  curSeconds,
  durMinutes,
  durSeconds,
  playProgress,
  bTime,
  nTime = 0;

var currIndex = -1; // 当前播放索引
var buffInterval = null; // 初始化定时器 判断是否需要缓冲
var len = musicData.songs.length; // 歌曲长度

// 点击 播放/暂停 按钮，触发该函数
// 作用：根据audio的paused属性 来检测当前音频是否已暂停  true:暂停  false:播放中
function playPause() {
  if (audio.paused) {
    playerContent1.classList.add("active");
    musicImgs.classList.add("active");
    playPauseBtn.setAttribute("class", "btn play-pause icon-zanting iconfont");
    checkBuffering();
    audio.play();
  } else {
    playerContent1.classList.remove("active");
    musicImgs.classList.remove("active");
    playPauseBtn.setAttribute(
      "class",
      "btn play-pause icon-jiediankaishi iconfont"
    );
    clearInterval(buffInterval);
    musicImgs.classList.remove("buffering");
    audio.pause();
  }
}

// 鼠标移动在进度条上， 触发该函数
function showHover(event) {
  const seekBarPos = sArea.getBoundingClientRect();
  seekT = event.clientX - seekBarPos.left;
  seekLoc = audio.duration * (seekT / sArea.offsetWidth);

  sHover.style.width = seekT + "px";

  cM = seekLoc / 60;
  ctMinutes = Math.floor(cM);
  ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

  if (ctMinutes < 0 || ctSeconds < 0) return;

  if (ctMinutes < 10) ctMinutes = "0" + ctMinutes;
  if (ctSeconds < 10) ctSeconds = "0" + ctSeconds;

  if (isNaN(ctMinutes) || isNaN(ctSeconds)) {
    insTime.textContent = "--:--";
  } else {
    insTime.textContent = ctMinutes + ":" + ctSeconds;
  }

  insTime.style.left = seekT + "px";
  insTime.style.marginLeft = "-21px";
  insTime.style.display = "block";
}

// 鼠标移出进度条，触发该函数
function hideHover() {
  sHover.style.width = "0px";
  insTime.textContent = "00:00";
  insTime.style.left = "0px";
  insTime.style.marginLeft = "0px";
  insTime.style.display = "none";
}

// 鼠标点击进度条，触发该函数
function playFromClickedPos() {
  audio.currentTime = seekLoc; // 设置音频播放时间 为当前鼠标点击的位置时间
  seekBar.style.width = seekT + "px"; // 设置进度条播放长度，为当前鼠标点击的长度
  hideHover(); // 调用该函数，隐藏原来鼠标移动到上方触发的进度条阴影
}

// 在音频的播放位置发生改变是触发该函数
function updateCurrTime() {
  nTime = new Date().getTime();

  curMinutes = Math.floor(audio.currentTime / 60);
  curSeconds = Math.floor(audio.currentTime - curMinutes * 60);
  durMinutes = Math.floor(audio.duration / 60);
  durSeconds = Math.floor(audio.duration - durMinutes * 60);
  playProgress = (audio.currentTime / audio.duration) * 100;

  if (curMinutes < 10) curMinutes = "0" + curMinutes;
  if (curSeconds < 10) curSeconds = "0" + curSeconds;
  if (durMinutes < 10) durMinutes = "0" + durMinutes;
  if (durSeconds < 10) durSeconds = "0" + durSeconds;

  if (isNaN(curMinutes) || isNaN(curSeconds)) {
    tProgress.textContent = "00:00";
  } else {
    tProgress.textContent = curMinutes + ":" + curSeconds;
  }

  if (isNaN(durMinutes) || isNaN(durSeconds)) {
    totalTime.textContent = "00:00";
  } else {
    totalTime.textContent = durMinutes + ":" + durSeconds;
  }

  if (
    isNaN(curMinutes) ||
    isNaN(curSeconds) ||
    isNaN(durMinutes) ||
    isNaN(durSeconds)
  ) {
    time.classList.remove("active");
  } else {
    time.classList.add("active");
  }

  seekBar.style.width = playProgress + "%";

  if (playProgress === 100) {
    playPauseBtn.setAttribute(
      "class",
      "btn play-pause icon-jiediankaishi iconfont"
    );
    seekBar.style.width = "0";
    tProgress.textContent = "00:00";
    musicImgs.classList.remove("buffering", "active");
    clearInterval(buffInterval);
    selectTrack(1);
  }
}

// 定时器检测是否需要缓冲
function checkBuffering() {
  clearInterval(buffInterval);
  buffInterval = setInterval(function () {
    // 这里如果音频播放了，则nTime为当前时间毫秒数，如果没播放则为0；如果时间间隔过长，也将缓存
    if (nTime == 0 || bTime - nTime > 1000) {
      musicImgs.classList.add("buffering"); // 添加缓存样式类
    } else {
      musicImgs.classList.remove("buffering"); // 移除缓存样式类
    }

    bTime = new Date();
    bTime = bTime.getTime();
  }, 100);
}

// 点击上一首/下一首时，触发该函数。
//注意：后面代码初始化时，会触发一次selectTrack(0)，因此下面一些地方需要判断flag是否为0
function selectTrack(flag) {
  if (flag == 0 || flag == 1) {
    // 初始 || 点击下一首
    ++currIndex;
    if (currIndex >= len) {
      // 当处于最后一首时，点击下一首，播放索引置为第一首
      currIndex = 0;
    }
  } else {
    // 点击上一首
    --currIndex;
    if (currIndex <= -1) {
      // 当处于第一首时，点击上一首，播放索引置为最后一首
      currIndex = len - 1;
    }
  }

  if (flag == 0) {
    playPauseBtn.setAttribute(
      "class",
      "btn play-pause icon-jiediankaishi iconfont"
    ); // 显示播放图标
  } else {
    musicImgs.classList.remove("buffering");
    playPauseBtn.setAttribute("class", "btn play-pause icon-zanting iconfont"); // 显示暂停图标
  }

  seekBar.style.width = "0"; // 重置播放进度条为0
  time.classList.remove("active");
  tProgress.textContent = "00:00"; // 播放时间重置
  totalTime.textContent = "00:00"; // 总时间重置

  // 获取当前歌曲的所有信息
  const currentSong = musicData.songs[currIndex];

  artistName.textContent = currentSong.artist;
  musicName.textContent = currentSong.name;
  musicImgs.querySelector(
    ".img"
  ).style.background = `url(${currentSong.cover})`;
  audio.src = currentSong.url;

  nTime = 0;
  bTime = new Date();
  bTime = bTime.getTime();

  // 如果点击的是上一首/下一首 则设置开始播放，添加相关类名，重新开启定时器
  if (flag != 0) {
    audio.play();
    playerContent1.classList.add("active");
    musicImgs.classList.add("active");

    clearInterval(buffInterval);
    checkBuffering();
  }
}

// 初始化函数
function initPlayer() {
  audio = new Audio(); // 创建Audio对象
  selectTrack(0); // 初始化第一首歌曲的相关信息
  audio.loop = false; // 取消歌曲的循环播放功能

  playPauseBtn.addEventListener("click", playPause); // 点击播放/暂停 按钮，触发playPause函数

  // 进度条 移入/移出/点击 动作触发相应函数
  sArea.addEventListener("mousemove", showHover);
  sArea.addEventListener("mouseout", hideHover);
  sArea.addEventListener("click", playFromClickedPos);

  // 实时更新播放时间
  audio.addEventListener("timeupdate", updateCurrTime);

  // 上下首切换
  playPrevBtn.addEventListener("click", () => selectTrack(-1));
  playNextBtn.addEventListener("click", () => selectTrack(1));
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", initPlayer);
