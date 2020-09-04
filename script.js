const CLASSES = {0:'あ', 1:'い', 2:'う', 3:'え', 4:'お',
				 5:'か', 6:'き', 7:'く', 8:'け', 9:'こ',
				 10:'さ', 11:'し', 12:'す', 13:'せ', 14:'そ',
				 15:'た', 16:'ち', 17:'つ', 18:'て', 19:'と',
				 20:'な', 21:'に', 22:'ぬ', 23:'ね', 24:'の',
				 25:'は', 26:'ひ', 27:'ふ', 28:'へ', 29:'ほ',
				 30:'ま', 31:'み', 32:'む', 33:'め', 34:'も',
				 35:'や', 36:'ゆ', 37:'よ',
				 38:'ら', 39:'り', 40:'る', 41:'れ', 42:'ろ',
				 43:'わ', 44:'ん'}

var vocab = [['あめ'],
			 ['いぬ'],
			 ['うし'],
			 ['えたのーる'],
			 ['おんがく'],
			 ['からす'],
			 ['きつつき'],
			 ['くま'],
			 ['けむし'],
			 ['こま'],
			 ['さい'],
			 ['しまうま'],
			 ['すずめ'],
			 ['せみ'],
			 ['そり'],
			 ['たぬき'],
			 ['ちたん'],
			 ['つばめ'],
			 ['てにす'],
			 ['とり'],
			 ['なつ'],
			 ['にんにく'],
			 ['ぬかづけ'],
			 ['ねこ'],
			 ['のり'],
			 ['はむ'],
			 ['ひこうき'],
			 ['ふね'],
			 ['へんたい'],
			 ['ほし'],
			 ['まつり'],
			 ['みち'],
			 ['むすめ'],
			 ['めんたいこ'],
			 ['もり'],
			 ['やま'],
			 ['ゆめ'],
			 ['よる'],
			 ['らきすた'],
			 ['りす'],
			 ['るす'],
			 ['れたす'],
			 ['ろうそく'],
			 ['わに']
			]

$("#video").click(function() {
	loadModel() ;
	startWebcam();
	setInterval(predict, 1000/10);
});

let model;
async function loadModel() {
	$("#console").html(`<div>model loading...</div>`);
	model = await tf.loadLayersModel(`https://raw.githubusercontent.com/IEHOKADO/FingerClassification/master/model/model.json`);
	$("#console").html(`<div>model loaded.</div>`);
};

var video;
function startWebcam() {
	$("#console").html(`<div>video streaming start.</div>`);
	video = $('#video').get(0);
	vendorUrl = window.URL || window.webkitURL;

	navigator.getMedia = navigator.getUserMedia ||
						 navigator.webkitGetUserMedia ||
						 navigator.mozGetUserMedia ||
						 navigator.msGetUserMedia;

	navigator.getMedia({
		video: true,
		audio: false
	}, function(stream) {
		localStream = stream;
		video.srcObject = stream;
		video.play();
	}, function(error) {
		alert("Something wrong with webcam!");
	});
}

var latest  //最新の指文字
async function predict(){
	let tensor = captureWebcam();

	let prediction = await model.predict(tensor).data();
	let results = Array.from(prediction)
				.map(function(p,i){
	return {
		probability: p,
		className: CLASSES[i]
	};
	}).sort(function(a,b){
		return b.probability-a.probability;
	}).slice(0,5);

	$("#console").empty();

	results.forEach(function(p){
		$("#console").append(`<div>・${p.className} : ${p.probability.toFixed(6)}</div>`);
		if(p.probability.toFixed(6) > 0.5 && latest != p.className){
			latest = p.className
			$("#textInput").val($("#textInput").val() + p.className);
		}
	});
};

function captureWebcam() {
	var canvas    = document.createElement("canvas");
	var context   = canvas.getContext('2d');
	canvas.width  = video.width;
	canvas.height = video.height;

	context.drawImage(video, 0, 0, video.width, video.height);
	tensor_image = preprocessImage(canvas);

	return tensor_image;
}

function preprocessImage(image){
	let tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([256,256]).toFloat();	
	let offset = tf.scalar(255);
    return tensor.div(offset).expandDims();
}

var cpText = vocab[Math.floor(Math.random() * Math.floor(44))][0];  //最初のテキストはランダムで決める
$("#box").append(cpText + ' → ');  //最初のテキスト
var status = 'true';  //しりとりを開始できる状態かどうか判断する
function reply() {
	if(status == 'true'){
		var usrText = $("#textInput").val();  //ユーザーのテキスト
		var idx = Object.keys(CLASSES).reduce( (r, key) => {
			return CLASSES[key] === usrText.substr(-1) ? key : r 
		}, null);  //ユーザーのテキストの末尾の文字の辞書番号
		if(usrText.substr(0,1) == cpText.substr(-1) && idx) {
			$("#textInput").val("");  //入力フォームを空にする
			$("#box").append(usrText + ' → ');
			if(usrText.substr(-1) == 'ん') {
				status = 'false';  //ユーザーからの入力を終了する
				$("#box").append('You Lose');
			}
			else {
				cpText = vocab[idx][0];  //コンピュータのテキスト
				$("#box").append(cpText + ' → ');
			}
			if(cpText.substr(-1)=='ん') {
				status = 'false';  //ユーザーからの入力を終了する
				$("#box").append('You Win');
			}
		}
	}
}

//EnterKeyを押したとき
$("#textInput").keypress(function(e) {
    if ((e.which == 13) && document.getElementById("textInput").value != "" ) reply();
})

//SendButtonを押したとき
$("#buttonInput").click(function() {
    if (document.getElementById("textInput").value != "") reply();
})

document.getElementById("support-img").style.display = "none";
$("#support-bt").click(function() {
    var img = document.getElementById("support-img");
	if(img.style.display == "block") img.style.display = "none";
	else img.style.display = "block";
})