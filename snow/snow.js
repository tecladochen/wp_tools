var options = {
  minSize: 5,
  maxSize: 50,
  newOn: 200,
  randColor: true,
  flakeColor: "#f00",
  snow: true,
  mobile: false,
  buttonPosition: "bottom-right", // 可选值: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
  buttonSize: "small", // 可选值: 'small', 'medium', 'large'
  buttonOrientation: "horizontal", // 可选值: 'vertical', 'horizontal'
};

jQuery.noConflict();
(function ($) {
  $(function () {
    // 判断是否是电脑浏览
    function IsPC() {
      const userAgentInfo = navigator.userAgent;
      const Agents = [
        "Android",
        "iPhone",
        "SymbianOS",
        "Windows Phone",
        "iPad",
        "iPod",
      ];
      return (
        !Agents.some((agent) => userAgentInfo.includes(agent)) &&
        window.innerWidth > 768
      );
    }

    // 如果是移动设备，则不显示按钮，不显示雪花
    if (!IsPC()) {
      options.snow = false; // 不显示雪花
      return; // 不再继续执行后续的代码
    }

    // 配置按钮的大小
    const buttonSizes = {
      small: { padding: "5px 10px", fontSize: "12px" },
      medium: { padding: "10px 20px", fontSize: "14px" },
      large: { padding: "15px 30px", fontSize: "16px" },
    };

    // 配置按钮的位置
    const buttonPositions = {
      "top-left": { bottom: "auto", top: "10px", left: "10px" },
      "top-right": { bottom: "auto", top: "10px", right: "10px" },
      "bottom-left": {
        bottom: "10px",
        left: "10px",
        top: "auto",
        right: "auto",
      },
      "bottom-right": {
        bottom: "10px",
        right: "10px",
        top: "auto",
        left: "auto",
      },
    };

    // 在页面加载时初始化开关按钮
    const $toggleButton = $('<div class="snow-toggle-button">关闭雪花</div>')
      .css({
        position: "fixed",
        zIndex: 10000,
        background: "#333",
        color: "#fff",
        "border-radius": "5px",
        cursor: "pointer",
        "user-select": "none",
        "font-family": "Arial, sans-serif",
        ...buttonSizes[options.buttonSize], // 使用配置的大小
        ...buttonPositions[options.buttonPosition], // 使用配置的位置
        display: "flex",
        "align-items": "center",
        "justify-content": "center",
      })
      .appendTo("body");

    // 根据方向设置按钮的布局
    if (options.buttonOrientation === "horizontal") {
      $toggleButton.css({
        "flex-direction": "row",
        padding: "10px 20px",
      });
    } else {
      $toggleButton.css({
        "flex-direction": "column",
        padding: "10px 20px",
      });
    }

    let isSnowing = false;

    // 初始化雪花状态
    if (
      getSnowCookie("showSnow") === "true" ||
      (getSnowCookie("showSnow") === null && options.snow)
    ) {
      startSnow();
      $toggleButton.text("关闭雪花");
    } else {
      $toggleButton.text("开启雪花");
    }

    // 按钮点击事件
    $toggleButton.on("click", function () {
      if (isSnowing) {
        stopSnow();
        setSnowCookie("showSnow", "false");
        $toggleButton.text("开启雪花");
      } else {
        startSnow();
        setSnowCookie("showSnow", "true");
        $toggleButton.text("关闭雪花");
      }
    });

    // 启动下雪
    function startSnow() {
      if (isSnowing) return;
      isSnowing = true;

      const maxFlakes = 200;
      let flakeCount = 0;

      const $flake = $('<div id="snowbox" />')
        .css({
          position: "fixed",
          "z-index": "9999",
          top: "-50px",
          "user-select": "none",
          "pointer-events": "none",
        })
        .html("&#10052;");

      const interval = setInterval(() => {
        if (!isSnowing) {
          clearInterval(interval);
          return;
        }

        if (flakeCount >= maxFlakes) return;

        const documentHeight = $(document).height();
        const documentWidth = $(document).width();
        const startPositionLeft = Math.random() * documentWidth - 100;
        const startOpacity = 0.5 + Math.random();
        const sizeFlake =
          options.minSize + Math.random() * (options.maxSize - options.minSize);
        const endPositionTop = documentHeight - 200;
        const endPositionLeft = startPositionLeft - 500 + Math.random() * 500;
        const durationFall = documentHeight * 10 + Math.random() * 5000;

        const $flakeElement = $flake.clone();
        flakeCount++;

        $flakeElement
          .appendTo("body")
          .css({
            left: startPositionLeft,
            opacity: startOpacity,
            "font-size": sizeFlake,
            color: options.randColor ? getRandomColor() : options.flakeColor,
            "font-family": "Arial, sans-serif",
          })
          .animate(
            {
              top: endPositionTop,
              left: endPositionLeft,
              opacity: 0.4,
            },
            durationFall,
            "linear",
            function () {
              $(this).remove();
              flakeCount--;
            }
          );
      }, options.newOn);
    }

    // 停止下雪
    function stopSnow() {
      isSnowing = false;

      // 缓慢移除当前页面上的所有雪花
      $("#snowbox").each(function () {
        $(this)
          .stop(true)
          .fadeOut(2000, function () {
            $(this).remove();
          });
      });
    }

    // 获取随机颜色
    function getRandomColor() {
      return (
        "#" +
        ("000000" + Math.floor(Math.random() * 0xffffff).toString(16)).slice(-6)
      );
    }

    // 写 Cookie
    function setSnowCookie(name, value) {
      const Days = 30;
      const exp = new Date();
      exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
      )};expires=${exp.toGMTString()};path=/`;
    }

    // 读 Cookie
    function getSnowCookie(name) {
      const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
        return acc;
      }, {});
      return cookies[name] || null;
    }
  });
})(jQuery);
