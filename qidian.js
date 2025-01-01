// 窗口管理
console.show();
auto.waitFor();
console.setTitle("自动任务");
console.setPosition(device.width / 3, 0);
console.setSize(device.width / 3, device.height / 3);
// 获取设备信息
var ham = hamibot.env;

var bounds;
var centerX;
var centerY;
var right;
var sp = 0;
var X;
var Y;
var InitialValue = null;

//提取数字
function jstime(textObj) {
  if (textObj == null) {
    return null;
  }
  // 存储初始文本内容
  var initText = textObj.text();
  // log(initText)
  //获取时间
  var match = initText.match(/\d+/g);
  return match ? parseInt(match[0]) : null;
}

//提取坐标中心
function getXy(obj) {
  if (obj == null) {
    return null;
  }
  var bounds = obj.bounds();
  return {
    centerX: (bounds.left + bounds.right) / 2,
    centerY: (bounds.top + bounds.bottom) / 2,
  };
}

//点击坐标中心
function clickCenter(params) {
  var center = getXy(params);
  if (center == null) {
    console.log("没找到");
    return;
  }
  click(center.centerX, center.centerY);
  console.log("点击坐标");
}

/**
 * Navigates back to the home screen by repeatedly calling the `back` function
 * until an element with the ID "normal" is found.
 *
 * @param {Object} params - The parameters for the function (currently unused).
 */
function backHome(params) {
  do {
    back();
  } while (id("normal").findOne(500) == null);
  console.log("已到主界面");
}

/**
 * 尝试点击控件的父类，直到点击成功或者没有父类为止。
 *
 * @param {Object} widget - The widget to be clicked.
 * @returns {boolean|null} - Returns true if a widget is clicked, false if no clickable widget is found,
 *                           and null if the widget is null.
 */
function clickParentIfClickable(widget) {
  if (InitialValue == null) {
    InitialValue = widget;
  }
  if (widget === null) {
    console.log("找不到控件");
    InitialValue = null;
    return null;
  }
  if (widget.click()) {
    console.log("已点击控件");
    InitialValue = null;
    return true;
  }
  var parentWidget = widget.parent(); // 获取控件的父类
  if (parentWidget === null) {
    console.log("控件不可点击");
    clickCenter(InitialValue);
    InitialValue = null;
    return false;
  }
  return clickParentIfClickable(parentWidget);
}

function longClickParentIfClickable(widget) {
  if (widget === null) {
    console.log("找不到");
    return null; // 终止递归的条件：如果 widget 是空值，则结束递归
  }
  if (widget.longClick()) {
    console.log("已长按");
    return true; // 点击控件
  }
  var parentWidget = widget.parent(); // 获取控件的父类
  if (parentWidget === null) {
    console.log("不可长按");
    return false;
  }
  return longClickParentIfClickable(parentWidget); // 递归调用自身，传入父类控件进行下一次查找和点击
}

//福利中心模块
//看视频
function lookvd() {
  clickParentIfClickable(text("我").findOne());
  // waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
  // clickParentIfClickable(text("我知道了").findOne(1000));
  clickParentIfClickable(text("福利中心").findOne());
  log("进入福利中心");
  sleep(random(2000, 6000));

  // text("限时彩蛋").waitFor();
  // 多线程监听，如果出现领奖上限或风险等则停止所有线程
  var thread1 = threads.start(function () {
    let stop = textContains("领奖上限").findOne();
    console.log(stop.text());
    engines.stopAllAndToast();
  });
  var thread2 = threads.start(function () {
    let stop = textContains("风险等级").findOne();
    console.log(stop.text());
    engines.stopAllAndToast();
  });

  while (clickParentIfClickable(text("看视频").findOnce()) != null) {
    waitAd();
    clickParentIfClickable(text("我知道了").findOne(500));
  }

  while (
    clickParentIfClickable(text("看视频").findOnce()) != null &&
    !text("明日再来吧").exists()
  ) {
    waitAd();
    clickParentIfClickable(text("我知道了").findOne(500));
  }

  while (clickParentIfClickable(desc("看视频").findOnce()) != null) {
    waitAd();
    clickParentIfClickable(text("我知道了").findOne(500));
  }
  log("视频已看完");
  thread1.interrupt();
  thread2.interrupt();
  backHome();
}


/**
 * 等待广告结束并尝试关闭广告。
 * This function performs the following steps:
 * 1. Waits for the ad to appear.
 * 2. Checks if the ad reward text is present.
 * 3. Handles different scenarios where the ad might not load properly.
 * 4. Waits for the ad to finish and attempts to close it.
 * 5. Logs the status and increments the ad view count.
 * 
 * The function uses various UI elements to determine the state of the ad and 
 * interacts with them accordingly.
 */
function waitAd() {
  log("看广告");
  // 广告时间对象
  var reward;
  //等待广告出现
  while (className("android.view.View").depth(4).exists()) {
    sleep(500);
  }
  //等待广告时间对象
  reward = textEndsWith("可获得奖励").findOne(7000);
  if (reward == null) {
    if (className("android.view.View").depth(4).exists()) {
      while (className("android.view.View").depth(4).exists()) {
        sleep(500);
      }
      if (!textEndsWith("可获得奖励").exists()) {
        back();
        sleep(500);
        console.log("广告未加载1");
        return;
      }
    } else if (className("android.view.View").depth(5).exists()) {
      back();
      sleep(500);
      console.log("广告未加载2");
      return;
    } else {
      console.log("未进入广告页面");
      return;
    }
  }
  //等待广告出现
  while (className("android.view.View").depth(4).exists()) {
    sleep(500);
  }
  if (!textEndsWith("可获得奖励").exists()) {
    back();
    sleep(500);
    console.log("广告未加载3");
    return;
  }
  //获取关闭坐标
  var gb = text("关闭").findOne(400);
  var cross = text("cross").findOne(400);
  var tg = text("跳过广告").findOne(400);
  // var wz = text("此图片未加标签。打开右上角的“更多选项”菜单即可获取图片说明。").findOnce()
  var zb = null;
  if (gb) {
    zb = gb;
  } else if (cross) {
    zb = cross;
  } else if (tg) {
    zb = tg;
  } /*else if (wz) {
        zb = wz
    }*/
  if (zb == null) {
    console.log("获取关闭坐标");
    var video_quit = reward.bounds();
    var x1 = 0;
    var x2 = video_quit.left;
    var y1 = video_quit.top;
    var y2 = video_quit.bottom;
    X = parseInt((x1 + x2) / 2);
    Y = parseInt((y1 + y2) / 2);
    // var nocross = true
  }

  // 获取等待时间
  var time = jstime(textEndsWith("可获得奖励").findOne());
  if (time == null) {
    log("获取不到时间，重新获取");
    log("点击退出");
    do {
      if (!textEndsWith("可获得奖励").exists()) {
        back();
        sleep(500);
        console.log("获取不到坐标");
        return;
      }
      if (zb == null) {
        click(X, Y);
      } else {
        clickParentIfClickable(zb);
      }
      sleep(500);
    } while (!textStartsWith("继续").exists());
    time = jstime(textEndsWith("可获得奖励").findOne());
    clickParentIfClickable(textStartsWith("继续").findOne());
    if (time == null) {
      time = textMatches(/\d+/).findOnce();
      if (time) {
        time = parseInt(time.text());
      }
    }
  }

  //等待广告结束
  var num;
  if (time) {
    log("等待" + (time + 1) + "秒");
    sleep(1000 * (time + 1));
    num = 0;
    do {
      if (zb == null) {
        click(X, Y);
      } else {
        clickParentIfClickable(zb);
      }
      if (clickParentIfClickable(textStartsWith("继续").findOne(500))) {
        sleep(1000);
        num++;
        log("等待" + num + "秒");
      }
    } while (textEndsWith("可获得奖励").exists());
  } else {
    //获取不到时间
    log("等待视频结束");
    // clickParentIfClickable(text("继续观看").findOne())
    num = 0;
    do {
      num++;
      sleep(1000);
      log("等待" + num + "秒");
    } while (textEndsWith("可获得奖励").exists());
  }
  //判断是否还在广告页面
  if (className("android.view.View").depth(5).exists()) {
    back();
    sleep(500);
  }
  log("广告结束");
  sp++;
  log("已看视频" + sp + "个");
}

//兑换
function buy() {
  clickParentIfClickable(desc("更多好礼").findOne());
  text("畅享卡").waitFor();
  var enjoyCard = textStartsWith("7天").findOne().parent().parent();
  var convertibleList = enjoyCard.find(text("兑换"));
  if (convertibleList.length > 0) {
    for (let i = convertibleList.length - 1; i >= 0; i--) {
      clickParentIfClickable(convertibleList[i]);
      clickParentIfClickable(text("确认").findOne(2000));
      sleep(500);
    }
  }
  console.log("已兑换");
}

//听书
function listenToBook() {
  var bookV;
  // let listenTime
  bookV = textContains("当日听书").findOne(1000);
  if (bookV == null) {
    console.log("没有听书");
    return;
  }
  // let listeningTime = jstime(bookV);
  // if (textContains("当日玩游戏").findOnce() == null) {
  //      listenTime = jstime(bookVs);
  // }
  bookV = bookV.parent();
  if (clickParentIfClickable(bookV.findOne(text("去完成"))) != null) {
    sleep(1500);
    let isback = false;
    if (text("听原创小说").exists()) {
      isback = true;
      text("听原创小说").waitFor();
      clickParentIfClickable(id("playIv").findOne());
    }
    id("ivPlayCenter").waitFor();
    //         sleep(1000 * 10)
    back();
    clickParentIfClickable(id("btnLeft").findOne(850));
    if (isback) {
      back();
    }
  }
}

//玩游戏
function play() {
  var game;
  game = textContains("当日玩游戏").findOne(1000);
  if (game == null) {
    console.log("没有游戏可玩");
    return;
  }
  game = game.parent();
  let finishing;
  var pt;
  device.keepScreenDim();
  while ((finishing = game.findOne(text("去完成"))) != null) {
    pt =
      jstime(game.findOne(textMatches(/\/\d+分钟/))) -
      jstime(game.findOne(textMatches(/\d+/)));
    // var repetitions = 4
    do {
      if (!clickParentIfClickable(finishing)) {
        back();
        clickParentIfClickable(text("游戏中心").findOne());
      }
      sleep(500);
    } while (textContains("当日玩游戏").exists());
    log("前往游戏中心");
    textContains("热门").waitFor();
    textContains("喜欢").waitFor();
    textContains("推荐").waitFor();
    if (clickParentIfClickable(text("排行").findOne(5000)) == null) {
      clickParentIfClickable(text("在线玩").findOne());
    } else {
      text("新游榜").waitFor();
      text("热门榜").waitFor();
      text("畅销榜").waitFor();
      clickParentIfClickable(text("热门榜").findOne());
      clickParentIfClickable(text("在线玩").findOne());
      // repetitions++
    }
    log("进入游戏");
    log("剩余" + (pt + 0.5) + "分钟");
    startCountdown(pt + 0.5);
    backHome();
    log("重新进入福利中心");
    clickParentIfClickable(text("我").findOne());
    // waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity')
    // clickParentIfClickable(text("我知道了").findOne(750))
    clickParentIfClickable(text("福利中心").findOne());
    log("等待福利中心加载");
    text("限时彩蛋").waitFor();
    game = textContains("当日玩游戏").findOne(1000);
    game = game.parent();
  }
  device.cancelKeepingAwake();
}

//领取
function getPrize() {
  var prizePool;
  prizePool = text("领奖励").find();
  for (i = 0; i < prizePool.length; i++) {
    // prizePool[i].click()
    clickParentIfClickable(prizePool[i]);
    clickParentIfClickable(text("我知道了").findOne(750));
  }
  clickParentIfClickable(id("ivClose").findOne(500));
}

//倒计时
function startCountdown(minutes) {
  var count = minutes * 60; // 倒计时的秒数
  var remainingMinutes;
  var remainingSeconds;
  for (var i = count; i >= 0; i--) {
    remainingMinutes = Math.floor(i / 60); // 剩余分钟数
    remainingSeconds = i % 60; // 剩余秒数
    //清除控制台
    console.clear();
    // 每分钟提示倒计时
    if (i > 60) {
      log(
        "倒计时还剩 " + remainingMinutes + " 分钟 " + remainingSeconds + " 秒 "
      );
    }
    // 剩余60秒钟提示倒计时
    if (i <= 60) {
      log("倒计时还剩 " + i + " 秒");
    }
    sleep(1000); // 等待1秒
    device.wakeUpIfNeeded();
  }
  console.clear();
  log("倒计时已结束");
}

//主界面模块
//启动起点获取坐标中心点
function start() {
  if (auto.service == null) {
    log("请先开启无障碍服务！");
  } else {
    log("无障碍服务已开启");
    home();
    sleep(1000);
    launch("com.qidian.QDReader");
    waitForActivity("com.qidian.QDReader.ui.activity.MainGroupActivity");
    textStartsWith("签到").findOne(3000);
    back();
    // 通过类名获取控件的边界
    bounds = className("android.widget.FrameLayout").depth(0).findOne();
    centerX = getXy(bounds).centerX;
    centerY = getXy(bounds).centerY;
    right = bounds.bounds().right;
    log("起点应用已启动");
    // sleep(1500)
  }
}

start();
lookvd();

/*//停止线程执行
thread.interrupt();*/
console.hide();
engines.stopAllAndToast();
