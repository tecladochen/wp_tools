function updateYearProgress() {
  const widget = document.getElementById("year-progress-widget");
  const now = new Date();
  const currentYear = now.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

  // 计算进度
  const totalDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
  const passedDays = (now - startOfYear) / (1000 * 60 * 60 * 24);
  const percentage = ((passedDays / totalDays) * 100).toFixed(2);

  // 将百分比分成整数和小数部分
  const [integerPart, decimalPart] = percentage.split(".");
  widget.querySelector(".number").textContent = integerPart;
  widget.querySelector(".decimal").textContent = `.${decimalPart}`;

  // 更新日期显示 - 添加补零
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  widget.querySelector(
    ".date-number"
  ).textContent = `${currentYear}.${month}.${date}`;

  // 更新星期显示
  widget.querySelector(".date-unit").textContent =
    "星期" + "日一二三四五六"[now.getDay()];

  // 更新天数
  widget.querySelector(".days").textContent = `第${Math.ceil(passedDays)}天`;

  // 计算今天已经过去的时间
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const remainingHours = String(23 - now.getHours()).padStart(2, "0");
  const remainingMinutes = String(59 - now.getMinutes()).padStart(2, "0");

  widget.querySelector(
    ".time-passed"
  ).textContent = `${hours}:${minutes} / -${remainingHours}:${remainingMinutes}`;

  // 更新进度条
  widget.querySelector(".progress-bar").style.width = `${percentage}%`;
}

// 初始更新
updateYearProgress();

// 改为每分钟更新一次
setInterval(updateYearProgress, 60000);
