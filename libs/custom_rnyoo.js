
//fullview postinfo details
$('.psotinfo_showhide').click(function(event){
	event.stopPropagation();
	$(".fullview-postInfo").slideToggle();
});
$(".fullview-postInfo").on("click", function (event) {
	event.stopPropagation();
});
// post info block will close click out side of block
$(document).on("click", function () {
	$(".fullview-postInfo").hide();
});

// embed iframes color toggle  
$('.embed-pixel-choose span').click(function (e) {
	e.preventDefault();
	$(this).addClass('textcolor').siblings().removeClass('textcolor');
});

//embed iframes toggle
$(".embed-pixel-choose-640").click(function(){
	$("#iframe_640").show();
	$("#iframe_480").hide();
});
$(".embed-pixel-choose-480").click(function(){
	$("#iframe_640").hide();
	$("#iframe_480").show();
});

//embed modal
$("#rny_Embed").click(function(){
	$("#embedModal").show();
});
$("#close_id").click(function(){
	$("#embedModal").hide();
});

// download app popup
$(".popUp").click(function(){
	$("#rny_app_download").stop().fadeIn(500);
});
$(".rny-app-close").click(function(){
	$("#rny_app_download").stop().fadeOut(500);
});

//pod image resize for adjusting the screen
var img_h, screen_h, container_h,zoombar_h;
img_h = parseInt($("img#pod_image").css("height"));
screen_h = parseInt($(window).height())-2; //2px difference (borderwith 2px missing from screen height) 
container_h = parseInt($(".rny-fullviewimg-container").css("height"));
zoombar_h = parseInt($('#zoomb').css("height"));
	if(img_h > screen_h){
		$("img#pod_image").css("max-height",screen_h-zoombar_h);
		$("img#pod_image").css("max-width","100%");
		$(".rny-fullviewimg-container").css("height",screen_h-zoombar_h);
	}
	else{
		$("img#pod_image").css("max-height","100%");
		$("img#pod_image").css("max-width","100%");
		$(".rny-fullviewimg-container").css("height",screen_h-zoombar_h);
	}

// posts js
	// scroll icon
	$(".scroll-top").click(function() {
		$("html, body").animate({ scrollTop: 0 }, "slow");
		return false;
	});

// more button loader
	$(".more-btn").click(function() {
		$("#loader").show();
		$(".more-btn").hide();
		setTimeout(function() { $("#loader").hide(); }, 2000);
	});

// download app popup
	$(".popUp").click(function(){
		$("#rny_app_download").stop().fadeIn(500);
	});

	$(".rny-app-close").click(function(){
		$("#rny_app_download").stop().fadeOut(500);
	});  

//search key words in input box(deopdown plugin) 
	$('select').niceSelect();

// menu overlay
	$("#menu").click(function(){
		$(".menu-overlay").stop().fadeIn(1000);
	});

	$(".menu-close").click(function(){
		$(".menu-overlay").stop().fadeOut(1000);
	});

// mobile and tablet serach 
	$(".search-icon").click(function(){
		$(".mobile-search-view").fadeIn(1000);
	});

	$(".search-close").click(function(){
		$(".mobile-search-view").fadeOut(1000);
	});