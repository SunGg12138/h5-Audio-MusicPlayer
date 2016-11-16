var loading = (function(){
	var loadPicPath = [
			{
				picName: '背景图',
				path: './images/bg.jpg'
			},
			{
				picName: '菜单图标',
				path: './images/menu.png'
			},
			{
				picName: '菜单鼠标经过图标',
				path: './images/menu_hover.png'
			},
			{
				picName: '静音图标',
				path: './images/volume_left.png'
			},
			{
				picName: '已静音图标',
				path: './images/volume_none.png'
			},
			{
				picName: '最大音量图标',
				path: './images/volume_right.png'
			},
			{
				picName: '明星照 - 周杰伦',
				path: './images/singer/周杰伦.jpg'
			}
		],
		loadingDOM,
		progressBarDOM,
		loadingCaptionDOM,
		player,
		allLength;
	function startPicLoading(fn) {
		var alreadyLength = 0;
		startPicLoading.fn = fn;
		loadingDOM = document.getElementById('loading');
		loadingCaptionDOM = document.getElementById('loading-caption');
		progressBarDOM = loadingDOM.querySelector('em');
		player = document.getElementById('player');
		allLength = loadPicPath.length;
		loadPicPath.forEach(function(item, index){
			var img = new Image();
			img.src = item.path;
			img.onload = function(){
				alreadyLength++;
				updateLoadView(alreadyLength);
			};
		});
	}
	function updateLoadView(readylength) {
		progressBarDOM.style.width = readylength/allLength * 100 + '%';
		function tempEvent() {
			setTimeout(function(){
				loadingDOM.style.display = 'none';
				startPicLoading.fn();
			}, 500);
			player.removeEventListener('canplaythrough', tempEvent);
		}
		if (readylength === allLength) {
			loadingCaptionDOM.innerText = '正在加载音乐...';
			player.addEventListener('canplaythrough', tempEvent);
		};
	}
	return {
		startPicLoading: startPicLoading
	};
})();