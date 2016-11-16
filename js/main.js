/*
*Create at 2016-11-15
*
*Author: 孙晋广
*/
var main = (function(){
	var main,  //播放器主结构
		mainW,   //播放器主结构宽度
		voiceW,   //音量条宽度
		player,   //audio标签
		singName,   //歌名的DOM
		singer,   //歌手的DOM
		musicVoiceBar,   //音量条的百分比条
		progressBox,   //进度条盒子
		progressBar,   //进度条
		prevBtn,   //上一首的按钮
		controlBtn,   //开始/暂停按钮
		nextBtn,   //下一首的按钮
		progressBtn,   //进度条的按钮
		musicVoice,   //音量条盒子
		voiceBtn,   //音量条按钮
		isProgressBtnDrag,   //是否正在拖拽进度条的按钮
		placementDistance,   //拖拽进度条按钮或者音量条按钮时放置的距离
		volumeLeft,   //左边的静音按钮
		volumeRight,   //右边的最大音量按钮
		menu,   //菜单
		menuBtn,   //菜单按钮
		close,   //菜单上的关闭按钮
		//时间线和音量的滑动临时事件方法
		tempEventFunc = {
			tempTimeMoveEvent: function(e) {
				var pageX = e.pageX,
					mainX = main.offsetLeft,
					leftValue = pageX - mainX;
				if (leftValue < 0) {
					leftValue = 0;
				}else if (leftValue > mainW) {
					leftValue = mainW;
				};
				window.placementDistance = leftValue;
				progressBar.style.width = leftValue/mainW*100 + '%';
				progressBtn.style.left = leftValue - 3 + 'px';
			},
			tempTimeBodyMouseUp: function() {
				isProgressBtnDrag = false;
				main.removeEventListener('mousemove', tempEventFunc.tempTimeMoveEvent);
				document.body.removeEventListener('mouseup', tempEventFunc.tempTimeBodyMouseUp);
				setPlayerTime();
				mediaLoop();
			},
			tempVoiceMoveEvent: function(e) {
				var pageX = e.pageX,
					voiceL = main.offsetLeft + (mainW * 20/100),
					leftValue = pageX - voiceL;
				if (leftValue < 0) {
					leftValue = 0;
				}else if (leftValue > voiceW) {
					leftValue = voiceW;
				};
				window.placementDistance = leftValue;
				musicVolume(leftValue/voiceW);
				updateVolume();
			},
			tempVoiceBodyMouseUp: function() {
				main.removeEventListener('mousemove', tempEventFunc.tempVoiceMoveEvent);
				document.body.removeEventListener('mouseup', tempEventFunc.tempVoiceBodyMouseUp);
				setPlayerVolume();
				updateVolume();
			}
		};
	//初始化
	function init() {
		getDOM();
		addEvent();
		mainW = main.offsetWidth;
		voiceW = mainW * 60/100;
		isProgressBtnDrag = false;
		window.placementDistance = 0;
		mediaLoop();
		nextBtn.click();
	}
	//设置背景图
	function setBg(bgSrc) {
		main.style.backgroundImage = "url("+bgSrc+")";
	}
	//时间线刷新
	function mediaLoop() {
		if (!isProgressBtnDrag) {
			updateTime();
			window.requestAnimationFrame(mediaLoop);
		};
	}
	//获取DOM
	function getDOM() {
		main = document.getElementById('main');
		player = document.getElementById('player');
		singName = document.getElementById('sing-name');
		singer = document.getElementById('singer');
		musicVoice = document.getElementById('music-voice');
		musicVoiceBar = musicVoice.querySelector('em');
		progressBox = document.getElementById('progress-bar');
		progressBar = progressBox.querySelector('em');
		prevBtn = document.getElementById('prev-btn');
		controlBtn = document.getElementById('control');
		nextBtn = document.getElementById('next-btn');
		progressBtn = document.getElementById('progress-btn');
		voiceBtn = document.getElementById('voice-btn');
		menu = document.getElementById('menu');
		menuBtn = document.getElementById('menu-btn');
		close = document.getElementById('close');
		volumeLeft = document.getElementById('volume-left');
		volumeRight = document.getElementById('volume-right');
	}
	//添加事件
	function addEvent() {
		progressBox.addEventListener('click', function(e){
			e.stopPropagation();
			var pageX = e.pageX;
				leftValue = pageX - main.offsetLeft;
			getNowTime(leftValue/mainW*getAllTime());
		});
		musicVoice.addEventListener('click', function(e){
			e.stopPropagation();
			var pageX = e.pageX;
				leftValue = pageX - main.offsetLeft - mainW*0.2;
			musicVolume(leftValue/voiceW);
			updateVolume();
		});
		volumeLeft.addEventListener('click', function(e){
			e.stopPropagation();
			if (player.muted) {
				player.muted = false;
				volumeLeft.querySelector('img').src = 'images/volume_left.png';
			}else{
				player.muted = true;
				volumeLeft.querySelector('img').src = 'images/volume_none.png';
			};
		});
		volumeRight.addEventListener('click', function(e){
			e.stopPropagation();
			musicVolume(1);
			updateVolume();
		});
		menu.addEventListener('click', function(e){
			e.stopPropagation();
			var elem = e.target || e.srcElement;
			if (elem.tagName === 'LI' && !elem.classList.contains('active')) {
				var mediaSrc = elem.getAttribute('data-src'),
					mediaName = elem.getAttribute('data-name'),
					mediaSinger = elem.getAttribute('data-singer'),
					bgSrc = elem.getAttribute('data-pic'),
					list = document.body.querySelectorAll('li'),
					length = list.length,
					i = 0;
				for (;i<length;i++) {
					list[i].classList.remove('active');
				};
				elem.className = 'active';
				player.src = mediaSrc;
				singName.innerText = mediaName;
				singer.innerText = mediaSinger;
				setBg(bgSrc);
			};
		});
		prevBtn.addEventListener('click', function(){
			var list = menu.querySelectorAll('li'),
				length = list.length,
				i = 0,
				activeIndex;
			for (;i<length;i++) {
				if (list[i].classList.contains('active')) {
					activeIndex = i;
					break;
				};
			};
			if (typeof activeIndex === 'undefined') {
				menu.querySelectorAll('li')[length-1].click();
				return;
			};
			if (activeIndex !== 0) {
				activeIndex--;
			};
			list[activeIndex].click();
		});
		nextBtn.addEventListener('click', function(){
			var list = menu.querySelectorAll('li'),
				length = list.length,
				i = 0,
				activeIndex;
			for (;i<length;i++) {
				if (list[i].classList.contains('active')) {
					activeIndex = i;
					break;
				};
			};
			if (typeof activeIndex === 'undefined') {
				menu.querySelectorAll('li')[0].click();
				return;
			};
			if (activeIndex !== length-1) {
				activeIndex++;
			};
			list[activeIndex].click();
		});
		player.addEventListener('durationchange', function(){
			controlBtn.click();
		});
		player.addEventListener('ended', function(){
			nextBtn.click();
		});
		controlBtn.addEventListener('click', function(e){
			e.stopPropagation();
			musicControl(player.paused);
		});
		menuBtn.addEventListener('click', function(){
			if (menu.style.right.length===0 || menu.style.right==='0px') {
				close.click();
			}else{
				menu.style.right = '0px';
			};
		});
		close.addEventListener('click', function(){
			menu.style.right = '-320px';
		});
		progressBtn.addEventListener('mousedown', function(e){
			e.stopPropagation();
			isProgressBtnDrag = true;
			main.addEventListener('mousemove', tempEventFunc.tempTimeMoveEvent);
			document.body.addEventListener('mouseup', tempEventFunc.tempTimeBodyMouseUp);
		});
		voiceBtn.addEventListener('mousedown', function(e){
			e.stopPropagation();
			main.addEventListener('mousemove', tempEventFunc.tempVoiceMoveEvent);
			document.body.addEventListener('mouseup', tempEventFunc.tempVoiceBodyMouseUp);
		});
	}
	//开始或播放
	function musicControl(boolean) {
		if (boolean) {
			controlBtn.className = 'player-start control';
			player.play();
		}else{
			controlBtn.className = 'triangle triangle-right control';
			player.pause();
		};
	}
	//设置播放器时间线 封装一下
	function setPlayerTime() {
		getNowTime(window.placementDistance/mainW * getAllTime());
	}
	//设置播放器音量 封装一下
	function setPlayerVolume() {
		musicVolume(window.placementDistance/voiceW);
	}
	//获取音频的总时长
	function getAllTime() {
		return player.duration;
	}
	//获取或设置现在播放的时间
	function getNowTime(time) {
		if (!time) {
			return player.currentTime;
		};
		player.currentTime = time;
	}
	//获取或设置现在的音量
	function musicVolume(num) {
		if (typeof num === 'undefined') {
			return player.volume;
		};
		if (num<0) num = 0;
		if (num>1) num = 1;
		player.volume = num;
	}
	//更新时间线到视图
	function updateTime() {
		var thisWidth = getNowTime()/getAllTime();
		progressBar.style.width = thisWidth*100 + '%';
		progressBtn.style.left = thisWidth*mainW-3 + 'px';
	}
	//更新音量到视图
	function updateVolume() {
		musicVoiceBar.style.width = musicVolume()*100 + '%';
		voiceBtn.style.left =  musicVolume()*voiceW - 7 + 'px';
	}
	return {
		init: init
	};
})();