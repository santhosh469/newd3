var adapter = {}; // empty object for json to pass as paramater
	function embedAdapterBind(adapter){
	$('#embed_pod_image').attr('src',adapter.pod.podImage.jpgUrl);

	// embed_imgNotes() is plugin for hotspots
	var $img = $("#embed_pod_image").embed_imgNotes();
		$img.one("load",function(){
			// original image width and height
			var height_img = $(this).prop("naturalHeight");
			var width_img = $(this).prop("naturalWidth"); 

			var hotspotObj = [];
			var hotspots = adapter.pod.hotspots;
				for (var hotspot in hotspots){
					var temp = {};
					if (hotspots[hotspot].location.x == 0 && hotspots[hotspot].location.y == 0) {
						// $("#nohotspots").css("display", "block");
						continue;
					}
					temp["x"] = ((hotspots[hotspot].location.x+30)/width_img);
					temp["y"] = ((hotspots[hotspot].location.y+30)/height_img);
					temp["note"] = '<div class="rny-hp-desc">' +  (hotspots[hotspot].hotspotDescription_ts) + '</div>';

					if (hotspots[hotspot].media.audio.length > 0) {
						temp["note"] = temp["note"]  + '<span class="rny-hp-linkimages"><a href="#"><img data-streamUrl= "'+ hotspots[hotspot].media.audio[0].streamfile +'" class="audioStream" src="images/audio_icon.png"></a></span>';
					}

					if (hotspots[hotspot].media.images.length > 0) {
						temp["note"] = temp["note"]  + '<span class="rny-hp-linkimages">';
						temp["note"] = temp["note"] + '<a href="'+hotspots[hotspot].media.images[0].imageUrl+'" data-lightbox="rny-media-images"><img src="images/image_icon.png"></a>';

							for(var i=1; i<hotspots[hotspot].media.images.length; i++){
								temp["note"] = temp["note"] + '<a href="'+hotspots[hotspot].media.images[i].imageUrl+'" data-lightbox="rny-media-images">';
							}
						temp["note"] = temp["note"] + '</a></span>';
					}

					if (hotspots[hotspot].media.docs.length > 0) {
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img src="images/doc_icon.png" class="popUp"></a></span>';
					}

					if (hotspots[hotspot].media.video.length > 0){
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#" id="video"><img data-streamUrl= "'+ hotspots[hotspot].media.video[0].streamfile +'" src="images/video_icon.png" class="videoStream"></a></span>';
					}

					if (hotspots[hotspot].clickUrl.length > 0){
						temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="'+hotspots[hotspot].clickUrl+'" target="blank"><img src="images/url_icon.png"></a></span>';
					}

					// $elem for define css properties of hot spot and changing the color of hot spot dynamically
					$elem = $('<div id="embed_hotspots"></div>').css({
							width : "25px",
							height : "25px",
							transition: "all 1s ease",
							"-webkit-transition":"all 1s ease"
							}).append('<div class="pulse hs-animation" style="background:'+hotspots[hotspot].markerColor+'"></div><div class="hs-label">'+hotspots[hotspot].hotspotLabel_ts+'</div>');
					temp["hs_color"] = $elem;
					hotspotObj.push(temp);
				}
			$img.embed_imgNotes("import", hotspotObj); // each hotspot x,y co-ordinates and media of each hotspot as object
		});

		//video and auudio modals
		$(document).on("click", '.videoStream',function(){
			var videoSource = $(this).attr('data-streamUrl');
			videojs('rnyooVideo').ready(function(){
				var rnyVideoPlayer = this;
				rnyVideoPlayer.src({"type":"application/x-mpegURL", "src": videoSource});
				rnyVideoPlayer.play();
			});
			$("#modalVideo").css({ display: "block" });
		});
		$(".closeVideo").on("click", function() {
			videojs('rnyooVideo').pause();
			$("#modalVideo").css({ display: "none" });
		});
		$(".closeAudio").on("click", function() {
			videojs('rnyooAudio').pause();
			$("#modalAudio").css({ display: "none" });
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