var adapter = {};

function humanizedDateString(utcSeconds) {
    var date = new Date(utcSeconds);
    var isoDate = date.toISOString();
    var humanizedTime = moment(isoDate).fromNow();
    return humanizedTime;
}

function rnyooDataBind(adapter) {
    var createdAt = adapter.createdAt_l;
    var lastUpdatedAt = adapter.lastUpdatedAt_l;
    var postId = adapter.rpostid_s;
    var humanizedCreatedAt = humanizedDateString(createdAt);
    var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);

    $("#postCreatedAt").html(humanizedCreatedAt);
    $("#postUpdatedAt").html(" (Updated " + humanizedUpdatedAt + " )");
    if (adapter.postTtl) {
        var ttl = adapter.postTtl;
        var humanizedTtl = humanizedDateString(ttl);
        $("#postTtl").html(humanizedTtl);
    }
    if (adapter.channel_s != null) {
        var channelArray = [];
        channelArray = (adapter.channel_s).split(',');
        var channels = '';
        for (var i = 0; i < channelArray.length; i++) {
            channels = channels + '<a href="/search?in=channels&q=' + channelArray[i] + '" class="rny-btn">' + channelArray[i] + '</a>';
        }
        $("#channels").html(channels);
    }
    // plugin call for change text into hyper link(using in hotspot - dialogbox - media - hotspot description )
    var autolinker = new Autolinker({
        urls: {
            schemeMatches: true,
            wwwMatches: true,
            tldMatches: true
        },
        email: false,
        phone: false,
        mention: false,
        hashtag: false,
        stripPrefix: false,
        newWindow: true,
        truncate: {
            length: 0,
            location: 'end'
        },
        className: ''
    });

    $('#pod_image').attr('src', adapter.pod.podImage.jpgUrl);
    //imgNotes() is plugin for hotspots

    var $img = $("#pod_image").imgNotes();
    $img.one("load", function() {
        // original image width and height
        var height_img = $(this).prop("naturalHeight");
        var width_img = $(this).prop("naturalWidth");
        var hotspotObj = [];
        var hotspots = adapter.pod.hotspots;
        var addedHotspots = adapter.changeLog.added;
        var updatedHotspots = adapter.changeLog.changed;
        var updatedHotspotIds = [];
        for (var h in updatedHotspots) {
            if (updatedHotspots[h][0] === "hotspots") {
                updatedHotspotIds.push(updatedHotspots[h][1]);
            }
        }
        for (var hotspot in hotspots) {
            var temp = {};
            temp['note'] = "";
            if (hotspots[hotspot].location.x == 0 && hotspots[hotspot].location.y == 0) {
                continue;
                $("#nohotspots").show();
            }
            temp["x"] = ((hotspots[hotspot].location.x + 30) / width_img);
            temp["y"] = ((hotspots[hotspot].location.y + 30) / height_img);
            if (hotspots[hotspot].media.audio.length === 0 &&
                hotspots[hotspot].media.images.length === 0 &&
                hotspots[hotspot].media.docs.length === 0 &&
                hotspots[hotspot].media.video.length === 0 &&
                hotspots[hotspot].clickUrl.length === 0 &&
                hotspots[hotspot].hotspotDescription_ts === ""
            ) {
                temp["note"] = temp["note"] + '<div class="hs-no-data">There is no data for this hotspot</div>';
            }
            if (hotspots[hotspot].hotspotDescription_ts.length > 0) {
                temp["note"] = '<div class="rny-hp-desc">' + autolinker.link(hotspots[hotspot].hotspotDescription_ts) + '</div>';
            }
            if (hotspots[hotspot].media.audio.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-streamUrl= "' + hotspots[hotspot].media.audio[0].streamfile + '" class="audioStream" src="/images/audio_icon.png")></a></span>';
            }
            if (hotspots[hotspot].media.images.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages">';
                temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[0].imageUrl + '" data-lightbox="rny-media-images"><img src="/images/image_icon.png"></a>';
                for (var i = 1; i < hotspots[hotspot].media.images.length; i++) {
                    temp["note"] = temp["note"] + '<a href="' + hotspots[hotspot].media.images[i].imageUrl + '" data-lightbox="rny-media-images">';
                }
                temp["note"] = temp["note"] + '</a></span>';
            }
            if (hotspots[hotspot].media.docs.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img src="/images/doc_icon.png"></a></span>';
            }
            if (hotspots[hotspot].media.video.length > 0) {
                var fallbackUrl = hotspots[hotspot].media.video[0].streamfile;
                console.log(fallbackUrl);
                // console.log(hotspots[hotspot].media.video[0].videoUrl);
                var videoMimeType = "application/x-mpegurl";
                // Get Stream URL headers here
                $.ajax({
                    url: hotspots[hotspot].media.video[0].streamfile,
                    type: 'GET',
                    async: false,
                    error: function(data) {
                        console.log("Failure");
                        fallbackUrl = hotspots[hotspot].media.video[0].videoUrl;
                        videoMimeType = 'video/mp4';
                    }
                });
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="#"><img data-mimetype="' + videoMimeType + '" data-streamUrl= "' + fallbackUrl + '" class="videoStream" src="/images/video_icon.png"></a></span>';
            }
            if (hotspots[hotspot].clickUrl.length > 0) {
                temp["note"] = temp["note"] + '<span class="rny-hp-linkimages"><a href="' + hotspots[hotspot].clickUrl + '" target="blank"><img src="/images/url_icon.png"></a></span>';
            }
            // $elem for define css properties of hot spot and changing the color of hot spot dynamically
            var addedIdx = addedHotspots.indexOf(hotspots[hotspot].hotspotId);
            var updatedIdx = updatedHotspotIds.indexOf(hotspots[hotspot].hotspotId);
            if (addedIdx != -1 || updatedIdx != -1) {
                $elem = $('<div style="display:none;"></div>').css({
                    width: "25px",
                    "max-width": "100%",
                    height: "25px",
                    transition: "all 1s ease"
                }).append('<div class="revolve hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
                temp["hs_color"] = $elem;
            } else {
                $elem = $('<div style="display:none;"></div>').css({
                    width: "25px",
                    height: "25px",
                    "max-width": "100%",
                    transition: "all 1s ease"
                }).append('<div class="pulse hs-animation" style="background:' + hotspots[hotspot].markerColor + '"></div><div class="hs-label">' + hotspots[hotspot].hotspotLabel_ts + '</div>');
                temp["hs_color"] = $elem;
            }
            hotspotObj.push(temp);
        }
        $img.imgNotes("import", hotspotObj);
    });

    $(".closeVideo").on("click", function() {
        videojs('rnyooVideo').pause();
        $("#modalVideo").css({ display: "none" });
    });
    $(".closeAudio").on("click", function() {
        videojs('rnyooAudio').pause();
        $("#modalAudio").css({ display: "none" });
    });

    $(document).on("click", '.videoStream', function() {
        var videoSource = $(this).attr('data-streamUrl');
        var videoMimeType = $(this).attr('data-mimeType');
        videojs('rnyooVideo').ready(function() {
            var rnyVideoPlayer = this;
            rnyVideoPlayer.src({ "type": videoMimeType, "src": videoSource });
            rnyVideoPlayer.play();
        });
        $("#modalVideo").css({ display: "block" });
    });

    $(document).on("click", '.audioStream', function() {
        var audioSource = $(this).attr('data-streamUrl');
        videojs('rnyooAudio').ready(function() {
            var rnyAudioPlayer = this;
            rnyAudioPlayer.src({ "type": "audio/mp4", "src": audioSource });
            rnyAudioPlayer.play();
        });
        $("#modalAudio").css({ display: "block" });
    });


    var $hotspots_hiding = $("#embed_hotspots");

    var $hide = $("#hide");
    var $show = $("#show");
    $("#show").hide();
    $("#hide").hide();
    $hide.on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $(this).hide();
        $(this).siblings("#show").show();
    });

    $show.on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $(this).hide();
        $(this).siblings("#hide").show();
    });

    $("#showhotspots").on("click", function() {
        $img.imgNotes('hide_show_hotspots');
        $hide.show();
        $(this).hide();
    });
}

function hashtagText(text) {
    var replacedText = text.replace(/#(\w+)/g, '<a href="/search?q=$&" class="postinfo-hashtags">#$1</a>');
    return replacedText;
}

function channelText(textdata) {
    if (textdata === null || textdata === undefined || textdata === "") {
        return " ";
    }
    var channel_text = textdata.split(",");
    var load_channels = " ";
    for (var i in channel_text) {
        load_channels = load_channels + '<a href="/search?in=channels&q=' + channel_text[i] + '" class="rny-btn">' + channel_text[i] + '</a>';
    }
    return load_channels;
    console.log(load_channels);
}
var page_offsetY = window.pageYOffset, // global variable for this js and Homepage_main_integration_temp.html
    $win = $(window); // global variable for this js and Homepage_main_integration_temp.html
function getmodalContent(currentData) {
    page_offsetY = window.pageYOffset; //scroll behind overlay
    $("body, html").css({
        "position": "fixed",
        "width": "100%",
        "height": "'100%",
        "top": -page_offsetY + "px"
    });
    $("#fullview_modal_container").show();
    $.ajax({
        get: 'POST',
        url: 'https://beta.rnyoo.co/post/ov/' + currentData + '',
        dataType: 'json',
        beforeSend: function(html) {
            $("#modal_loader").show();
        },
        success: function(data) {
            // console.log(JSON.stringify(data.responseJson));
            isIos();
            var pod_content = "";
            var createdAt = data.responseJson.createdAt_l;
            var lastUpdatedAt = data.responseJson.lastUpdatedAt_l;
            var timevalue = data.responseJson.hasOwnProperty('postTtl');
            var postQuestion = data.responseJson.hasOwnProperty('postQuestionCount');
            var humanizedCreatedAt = humanizedDateString(createdAt);
            var humanizedUpdatedAt = humanizedDateString(lastUpdatedAt);
            var humanizedTtl;
            //modal content
            // console.log(Object.keys(data.responseJson.pod.hotspots).length);
            if (Object.keys(data.responseJson.pod.hotspots).length === 1) {
                pod_content = pod_content + '<div class="rny-zoomblock rny-mobileview-zoomblock" id="zoomb"><ul><li><a href="#" class="psotinfo_showhide">Post Info</a></li><li><button class="rny-mobileviewzoommbutton" id="normal_image"><span>N</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_out_button"><span> -</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_in_button"><span> +</span></button></li><li class="fullviewZwidth"><span class="mobile-post-img" id="hide"><img src="images/hide.png" alt="rny-image"> hide</span><span class="mobile-post-img" id="show"><img src="images/show.png" alt="rny-image">show</span></li><li><a href="/post/fv/' + data.responseJson.rpostid_s + '" target="_blank"><img src="images/fullview.png" alt="rny-image" id="rny_Embed" class="rny-embed-icon"></a></li></ul><span class="modal-close"><img src="images/cancel.png" alt="rny-image" id="fullview_close"></span></div><div class="rny-fullviewimg-container"><img class="img-responsive" id="pod_image" src="' + data.responseJson.pod.podImage.jpgUrl + '" alt="rny-image"><div class="fullview-postInfo" style="display:none;"><div class="rny-flex" style="min-height: 500px;">';
                console.log("hotspots");
            } else {
                pod_content = pod_content + '<div class="rny-zoomblock rny-mobileview-zoomblock" id="zoomb"><ul><li><a href="#" class="psotinfo_showhide">Post Info</a></li><li><button class="rny-mobileviewzoommbutton" id="normal_image"><span>N</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_out_button"><span> -</span></button></li><li><button class="rny-mobileviewzoommbutton" id="zoom_in_button"><span> +</span></button></li><li class="fullviewZwidth"><span class="mobile-post-img" id="hide"><img src="images/hide.png" alt="rny-image"> hide</span><span class="mobile-post-img" id="show"><img src="images/show.png" alt="rny-image">show</span></li><li><a href="/post/fv/' + data.responseJson.rpostid_s + '" target="_blank"><img src="images/fullview.png" alt="rny-image" id="rny_Embed" class="rny-embed-icon"></a></li></ul><span class="modal-close"><img src="images/cancel.png" alt="rny-image" id="fullview_close"></span></div><div class="rny-fullviewimg-container"><span class="tap-to-view" id="showhotspots">TAP TO VIEW</span><img class="img-responsive" id="pod_image" src="' + data.responseJson.pod.podImage.jpgUrl + '" alt="rny-image"><div class="fullview-postInfo" style="display:none;"><div class="rny-flex" style="min-height: 500px;">';
            }

            if (timevalue === false) {
                pod_content = pod_content + "";
            } else {
                humanizedTtl = humanizedDateString(data.responseJson.postTtl);
                pod_content = pod_content + '<div class="rny-header"><img src="images/icon_clock.png" alt="rny-image"><span> < ' + humanizedTtl + ' </span></div>';
            }

            pod_content = pod_content + '<div class="rny-publisher"><span class="rny-avatar"> <img src="' + data.responseJson.avatar + '" onError="this.onerror=null;this.src=\'https://rnyooassets.s3.amazonaws.com/avatars/default.png\';" alt="rny-image"> </span><span class="rny-pub-name"><a href="">' + data.responseJson.screenName_s + '</a></span><br></div><div class="rny-post-description">' + hashtagText(data.responseJson.postDescription_s) + '</div><div class="rny-post-timeDetails"><span class="rny-lightgrey">posted</span> <br><span class="rny-midgrey">' + humanizedCreatedAt + '</span><span class="rny-lightgrey rny-post-updatetime">(Updated ' + humanizedUpdatedAt + ')</span></div><div class="rny-post-locationDetails">';
            if (data.responseJson.location_s === null || data.responseJson.location_s === "") {
                pod_content = pod_content + '</div>';
            } else {
                pod_content = pod_content + '<div class="rny-post-locationDetails"><span class="rny-lightgrey">picture taken at</span><br><span class="rny-midgrey">' + data.responseJson.location_s + '</span></div>';
            }
            pod_content = pod_content + '<div class="rny-btn-flex">' + channelText(data.responseJson.channel_s) + '</div>';
            var comments = "";
            for (var i in data.responseJson.hotspotStats) {
                if (data.responseJson.hotspotStats === null || data.responseJson.hotspotStats === undefined) {
                    continue;
                }
                comments = comments + data.responseJson.hotspotStats[i].commentCount + " ";
            }
            if (comments === null || comments === "") {
                comments = 0;
            }
            // console.log(comments);
            if (data.responseJson.postLikeCount !== undefined && data.responseJson.podCommentCount !== undefined && comments !== undefined && data.responseJson.noOfViews === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.podCommentCount !== undefined && comments !== undefined && data.responseJson.postLikeCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && data.responseJson.podCommentCount !== undefined && comments === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews !== undefined && data.responseJson.postLikeCount === undefined && comments !== undefined && data.responseJson.podCommentCount === undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> 0</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> 0 post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            } else if (data.responseJson.noOfViews === undefined && data.responseJson.postLikeCount !== undefined && comments === undefined && data.responseJson.podCommentCount !== undefined) {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> 0</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> 0 hotspot comments</a></li></ul></div>';
            } else {
                pod_content = pod_content + '<div class="rny-commentSection"><ul class="rny-likes"><li><a class="rny-lightgrey popUp" href="#"><img src="images/like.png" alt="rny-image"> ' + data.responseJson.postLikeCount + '</a></li><li><a class="rny-lightgrey popUp" href="#"><img src="images/view.png" alt="rny-image"> ' + data.responseJson.noOfViews + '</a></li></ul><ul class="rny-comments"><li><a class="rny-lightgrey popUp" href="#"> ' + data.responseJson.podCommentCount + ' post comments</a></li><li class="rny-comment-lidot">&#183;</li><li><a class="rny-lightgrey popUp" href="#"> ' + comments + ' hotspot comments</a></li></ul></div>';
            }
            pod_content = pod_content + '</div></div>';
            //modal content end
            $(".viewport").show();
            $(".rny-row-container").empty();
            $(".rny-row-container").html(pod_content);
            var adapter = data.responseJson;
            rnyooDataBind(adapter);

            var img_h, screen_h, container_h, zoombar_h;
            img_h = parseInt($("img#pod_image").css("height"));
            screen_h = parseInt($(window).height());
            container_h = parseInt($(".rny-fullviewimg-container").css("height"));
            zoombar_h = parseInt($('#zoomb').css("height"));
            if (img_h > screen_h) {
                $("img#pod_image").css("max-height", screen_h - zoombar_h);
                $("img#pod_image").css("max-width", "100%");
                $(".rny-fullviewimg-container").css("height", screen_h - zoombar_h);
            } else {
                $("img#pod_image").css("max-height", "100%");
                $("img#pod_image").css("max-width", "100%");
                $(".rny-fullviewimg-container").css("height", screen_h - zoombar_h - 6);
            }
            $("#modal_loader").hide();
            $('.psotinfo_showhide').click(function(event) {
                event.stopPropagation();
                $(".fullview-postInfo").slideToggle();
                $("#NoteDialog").css("display", "none");
            });
            $(".fullview-postInfo").on("click", function(event) {
                event.stopPropagation();
            });
            // post info block will close click out side of block
            $(".rny-fullviewimg-container, .viewport, .rny-mobileview-zoomblock").on("click", function() {
                $(".fullview-postInfo").hide();
            });
            $(".popUp").on("click", function() {
                $("#rny_app_download").stop().fadeIn(500);
            });

            $(".rny-app-close").on("click", function() {
                $("#rny_app_download").stop().fadeOut(500);
            });
        }
    });
}

$(document).on("click", "#closeios_detector", function() {
    $(".ios-detector").hide();
});
$(document).on("click", ".popUp", function() {
    $("#rny_app_download").stop().fadeIn(500);
});
$(document).on("click", ".rny-app-close", function() {
    $("#rny_app_download").stop().fadeOut(500);
});

$(document).ready(function() {

    $('.hs-label').position({ within: '#pod_image', collision: "flipfit" });
    
    $(".scroll-top").click(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });
    $(window).scroll(function() {
        if ($(this).scrollTop() != 0) {
            $('.scroll-top').fadeIn();
        } else {
            $('.scroll-top').fadeOut();
        }
    });
    $("#menu").click(function() {
        $(".menu-overlay").stop().fadeIn(1000);
    });
    $(".menu-close").click(function() {
        $(".menu-overlay").stop().fadeOut(1000);
    });
    // mobile and tablet serach 
    $(".search-icon").click(function() {
        $(".mobile-search-view").fadeIn(1000);
    });

    $(".search-close").click(function() {
        $(".mobile-search-view").fadeOut(1000);
    });
    $(".rny-select-option").click(function() {
        $(".selection-box").toggle();
    });

    $('input[name="name"]').keyup(function(event) {
        $nameval = $(this).val();
        if ($nameval == "" || $nameval == null) {
            $('.name-error').show();
            $(".name-characters-error").hide();
        } else {
            $('.name-error').hide();
        }
        validateName($nameval);
    });

    function validateName($nameval) {
        var alphaExp = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
        if ($nameval.match(alphaExp)) {
            $(".name-characters-error").hide();
        } else {
            $(".name-characters-error").show();
            $(".name-error").hide();
        }
    }

    $('input[name="email"]').keyup(function(event) {
        $mailval = $(this).val();
        if ($mailval === "" || $mailval === null) {
            $(".email-error").show();
            $(".email-valid-error").hide();
        } else {
            $(".email-error").hide();
        }
        validateEmail($mailval);
    });

    function validateEmail($emailval) {
        var emailReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!emailReg.test($emailval)) {
            $(".email-valid-error").show();
            $(".email-error").hide();
        } else {
            $(".email-valid-error").hide();
        }
    }


    $('input[name="number"]').keyup(function() {
        $numval = $(this).val();
        if ($numval == "" || $numval == null) {
            $('.num-error').show();
            $('.num-valid-error').hide();
        } else {
            $('.num-error').hide();
        }
        validateNumber($numval);
    });

    function validateNumber($numval) {
        var numberExp = /^[0-9+()\s]*$/;

        if ($numval.match(numberExp)) {
            $('.num-valid-error').hide();
        } else {
            $('.num-valid-error').show();
            $(".num-error").hide();
        }
    }

    $('textarea[name="comment"]').keyup(function() {
        $commentval = $(this).val();

        if ($commentval == "" || $commentval == null) {
            $('.comment-error').show();
        } else {
            $('.comment-error').hide();
        }
    });

});

function selectOne(id) {
    $("#select_one_option").val(id);
    $(".selection-box").hide();
}


function formSubmit() {

    var nameval = $("#nameval").val();
    var emailval = $("#emailval").val();
    var selectval = $("#select_one_option").val();
    var numval = $("#numval").val();
    var commentval = $("#commentval").val();
    var alphaExp = /^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/;
    var emailExp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var numberExp = /^[0-9+()\s]*$/;

    if (nameval === "" || !nameval.match(alphaExp)) {
        $(".name-error").show();
        $(".name-characters-error").hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".name-error").hide();
    }
    if (emailval === "" || emailExp.test(emailval) == false) {
        $(".email-error").show();
        $(".email-valid-error").hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".email-error").hide();
    }
    if (numval === "") {
        $(".num-error").show();
        $('.num-valid-error').hide();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".num-error").hide();
    }
    if (selectval === "I am a ...") {
        $(".selectone-error").show();
        $("body").scrollTop(0);
        return false;
    } else {
        $(".selectone-error").hide();
    }
    if (commentval === "" || commentval === null) {
        $(".comment-error").show();
        $("body").scrollTop(0);
        return false;
    }
    var data = {
            "name": nameval,
            "email": emailval,
            "selectedval": selectval,
            "phonenum": numval,
            "comment": commentval
        }
        // console.log(data);

    $.ajax({
        url: "/beta.rnyoo.co/form", // actual url will come here
        type: "POST",
        data: data, // data object defined above
        success: function(data) {
            $(".rny-business-text").html(data);
            $(".hiddent_text").show();
            $("#nameval").val('');
            $("#emailval").val('');
            $("#select_one_option").val('I am a ...');
            $("#numval").val('');
            $("#commentval").val('');
            $(".email-error").hide();
            $(".name-error").hide();
            $(".num-error").hide();
            $(".selectone-error").hide();
            $("body").scrollTop(0);
        },
        error: function() {
            alert("error");
        }
    });
    return true;
}

function isIos() {
    if (navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/) && navigator.userAgent.match(/Version\/[\d\.]+.*Safari/)) {
        return $(".ios-detector").show();
    }
}
