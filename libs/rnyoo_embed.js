var adapter = {};

function embedHumanizedDateString(utcSeconds){
	var date = new Date(utcSeconds);
	var isoDate = date.toISOString();
	var humanizedTime = moment(isoDate).fromNow();
	return humanizedTime;
}

function rnyooEmbedDataBind(adapter){
	var createdAt = adapter.createdAt_l;
	var lastUpdatedAt = adapter.lastUpdatedAt_l;
	var postId = adapter.rpostid_s;
	var humanizedCreatedAt = embedHumanizedDateString(createdAt);
	var humanizedUpdatedAt = embedHumanizedDateString(lastUpdatedAt);

	$("#postCreatedAt").html(humanizedCreatedAt);
	$("#postUpdatedAt").html(" (Updated " + humanizedUpdatedAt + " )");
		if (adapter.postTtl){
			var ttl = adapter.postTtl;
			var humanizedTtl = embedHumanizedDateString(ttl);
			$("#postTtl").html(humanizedTtl);
		}
		if (adapter.channel_s != null) {
			var channelArray = [];
			channelArray = (adapter.channel_s).split(',');
			var channels = '';
				for(var i=0; i < channelArray.length; i++){
				channels = channels + '<a href="/search?in=channels&q=' + channelArray[i] + '" class="rny-btn">' + channelArray[i] + '</a>';
			}
			$("#channels").html(channels);
		}

	// plugin call for change text into hyper link(using in hotspot - dialogbox - media - hotspot description )
	var autolinker = new Autolinker({
		urls : {
			schemeMatches : true,
			wwwMatches    : true,
			tldMatches    : true
			},
			email       : false,
			phone       : false,
			mention     : false,
			hashtag     : false,
			stripPrefix : false,
			newWindow   : true,
			truncate : {
				length   : 0,
				location : 'end'
			},
			className : ''
	});

	$('#embed_pod_image').attr('src',adapter.pod.podImage.jpgUrl);
	//embed_imgNotes() is plugin for hotspots

	var $img = $("#embed_pod_image").embed_imgNotes();
		$img.one("load",function(){
			// original image width and height
			var height_img = $(this).prop("naturalHeight");
			var width_img = $(this).prop("naturalWidth");

			var hotspotObj = [];
			var hotspots = adapter.pod.hotspots;
			var addedHotspots = adapter.changeLog.added;
			  var updatedHotspots = adapter.changeLog.changed;
        var updatedHotspotIds = [];
        for(var h in updatedHotspots) {
            if(updatedHotspots[h][0] === "hotspots"){
                updatedHotspotIds.push(updatedHotspots[h][1]);
            }
        }
				for (var hotspot in hotspots){
					var temp = {};
					temp['note'] = "";
					if (hotspots[hotspot].location.x == 0 && hotspots[hotspot].location.y == 0) {
						continue;
					}
					temp["x"] = ((hotspots[hotspot].location.x+30)/width_img);
					temp["y"] = ((hotspots[hotspot].location.y+30)/height_img);
					if ( hotspots[hotspot].media.audio.length === 0 &&
						hotspots[hotspot].media.images.length === 0 &&
						hotspots[hotspot].media.docs.length === 0 &&
						hotspots[hotspot].media.video.length === 0 &&
						hotspots[hotspot].clickUrl.length === 0 &&
						hotspots[hotspot].hotspotDescription_ts === ""
					){
					temp["note"] = temp["note"]  + '<div class="hs-no-data">There is no data for this hotspot</div>';
					}
					if(hotspots[hotspot].hotspotDescription_ts.length > 0 ){
						temp["note"] = '<div class="rny-hp-desc">' +  autolinker.link(hotspots[hotspot].hotspotDescription_ts) + '</div>';
					}
					if (hotspots[hotspot].media.audio.length > 0) {
						temp["note"] = temp["note"]  + '<span class="rny-hp-linkimages"><a href="#"><img data-streamUrl= "'+ hotspots[hotspot].media.audio[0].streamfile +'" class="audioStream" src="/images/audio_icon.png")></a></span>';
					}
					if (hotspots[hotspot].media.images.length > 0) {
						temp["note"] = temp["note"]  + '<span class="rny-hp-linkimages">';
						temp["note"] = temp["note"] + '<a href="'+hotspots[hotspot].media.images[0].imageUrl+'" data-lightbox="rny-media-images"><img src="/images/image_icon.png"></a>';
						for(var i=1; i<hotspots[hotspot].media.images.length; i++){
							temp["note"] = temp["note"] + '<a href="'+hotspots[hotspot].media.images[i].imageUrl+'" data-lightbox="rny-media-images">';
						}
						temp["note"] = temp["note"] + '</a></span>';
					}
					if (hotspots[hotspot].media.docs.length > 0) {
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img src="/images/doc_icon.png"></a></span>';
					}
					  if (hotspots[hotspot].media.video.length > 0){
                var fallbackUrl =  hotspots[hotspot].media.video[0].streamfile;
                var videoMimeType = "application/x-mpegurl";
                // Get Stream URL headers here
               $.ajax({
                    url: hotspots[hotspot].media.video[0].streamfile,
                  type: 'GET',
                  async:false,
                    error: function(data) {
                        console.log("Failure");
                        fallbackUrl =  hotspots[hotspot].media.video[0].videoUrl;
                        videoMimeType = "video/mp4";
                    }
              });
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-mimetype="'+ videoMimeType + '" data-streamUrl= "'+ fallbackUrl +'" class="videoStream" src="/images/video_icon.png"></a></span>';
					}
					if (hotspots[hotspot].clickUrl.length > 0){
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="'+hotspots[hotspot].clickUrl+'" target="blank"><img src="/images/url_icon.png"></a></span>';
					}
					// $elem for define css properties of hot spot and changing the color of hot spot dynamically
					  var addedIdx = addedHotspots.indexOf(hotspots[hotspot].hotspotId);
					  var updatedIdx = updatedHotspotIds.indexOf(hotspots[hotspot].hotspotId);
						if (addedIdx != -1 || updatedIdx != -1){
							$elem = $('<div id="embed_hotspots"></div>').css({
								width : "25px",
								height : "25px",
								transition: "all 1s ease"
								}).append('<div class="revolve hs-animation" style="background:'+hotspots[hotspot].markerColor+'"></div><div class="hs-label">'+hotspots[hotspot].hotspotLabel_ts+'</div>');
							temp["hs_color"] = $elem;
						}
						else {
							$elem = $('<div id="embed_hotspots"></div>').css({
									width : "25px",
									height : "25px",
									transition: "all 1s ease"
									}).append('<div class="pulse hs-animation" style="background:'+hotspots[hotspot].markerColor+'"></div><div class="hs-label">'+hotspots[hotspot].hotspotLabel_ts+'</div>');
							temp["hs_color"] = $elem;
						}
					hotspotObj.push(temp);
				}
			$img.embed_imgNotes("import", hotspotObj);
		});

		// hide and shows hotspots
		var $hide  = $("#hide");
		var $show  = $("#show");
		$("#show").hide();
		$hide.on("click", function() {
			$img.embed_imgNotes('hide_show_hotspots');
			$(this).hide();
			$(this).siblings("#show").show();
		});
		$show.on("click", function() {
			$img.embed_imgNotes('hide_show_hotspots');
			$(this).hide();
			$(this).siblings("#hide").show();
		});

		$(".closeVideo").on("click", function() {
			videojs('rnyooVideo').pause();
			$("#modalVideo").css({ display: "none" });
		});
		$(".closeAudio").on("click", function() {
			videojs('rnyooAudio').pause();
			$("#modalAudio").css({ display: "none" });
		});

		$(document).on("click", '.videoStream',function(){
			  var videoSource = $(this).attr('data-streamUrl');
        var videoMimeType = $(this).attr('data-videoMimeType');
			videojs('rnyooVideo').ready(function(){
				var rnyVideoPlayer = this;
				rnyVideoPlayer.src({"type": videoMimeType, "src": videoSource});
				rnyVideoPlayer.play();
			});
			$("#modalVideo").css({ display: "block" });
		});

		$(document).on("click", '.audioStream',function(){
			var audioSource = $(this).attr('data-streamUrl');
			videojs('rnyooAudio').ready(function(){
				var rnyAudioPlayer = this;
				rnyAudioPlayer.src({"type":"audio/mp4", "src": audioSource});
				rnyAudioPlayer.play();
			});
			$("#modalAudio").css({ display: "block" });
		});

		// hide and show hotspots
		var $hotspots_hiding = $("#embed_hotspots");

		var $hide = $("#hide");
		var $show =$("#show");
		$("#show").hide();
		$("#hide").hide();
		$hide.on("click", function() {
			$img.embed_imgNotes('embed_hide_show_hotspots');
			$(this).hide();
			$(this).siblings("#show").show();
			$hotspots_hiding.css("display", "block");
		});

		$show.on("click", function() {
			$img.embed_imgNotes('embed_hide_show_hotspots');
			$(this).hide();
			$(this).siblings("#hide").show();
			$hotspots_hiding.css("display", "none");
		});

		$("#showhotspots").on("click", function(){
			$img.embed_imgNotes('embed_hide_show_hotspots');
			$hide.show();
			$(this).hide();
			$(this).siblings("#show").show();
			$hotspots_hiding.css("display", "block");
		});
	}