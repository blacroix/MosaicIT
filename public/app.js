var app = {
    imgUrls: [],
    googleImgSearch: [],
    config: {
        queries: ['shopping', 'mode', 'perfume'],
        line: 1,
        imgHeight: 100,
        timerMove: 600,
        imgPerLine: $(window).width() * 14 / 1440
    },
    interval: {}
};
function setOptions() {
    $('#tag').val(app.config.queries.join());
};
$(document).ready(function () {
    google.setOnLoadCallback(googleGetImages);
    setOptions();
    waitLoading();
});
function waitLoading() {
    if (app.interval.loading == null) {
        app.interval.loading = setInterval(function () {
            for (var p = 0; p < app.googleImgSearch.length; p++) {
                if (app.googleImgSearch[p] != null)
                    return;
            }
            clearInterval(app.interval.loading);
            app.interval.loading = null;
            app.imgUrls = _.shuffle(app.imgUrls);
            displayMosaic();
        }, 500);
    }
};
function googleOnSearchComplete(size) {
    if (app.googleImgSearch[size].results && app.googleImgSearch[size].results.length > 0) {
        for (var p = 0; p < app.googleImgSearch[size].results.length; p++) {
            app.imgUrls.push(app.googleImgSearch[size].results[p].tbUrl);
        }
    }
    if (app.googleImgSearch[size].cursor.currentPageIndex + 1 == app.googleImgSearch[size].cursor.pages.length) {
        app.googleImgSearch[size] = null;
    } else {
        app.googleImgSearch[size].gotoPage(app.googleImgSearch[size].cursor.currentPageIndex + 1);
    }
};
function googleGetImages() {
    for (var p = 0; p < app.config.queries.length; p++) {
        var size = app.googleImgSearch.length;
        app.googleImgSearch[size] = new google.search.ImageSearch();
        app.googleImgSearch[size].setSearchCompleteCallback(this, googleOnSearchComplete, [size]);
        app.googleImgSearch[size].setResultSetSize(8);
        app.googleImgSearch[size].execute(app.config.queries[p]);
    }
};
function displayMosaic() {
    var curContainer;
    var imgCount = 0;
    var contentDiv = document.getElementById('content');
    for (var i = 0; i < app.imgUrls.length; i++) {
        if (imgCount == 0 || imgCount > app.config.imgPerLine) {
            curContainer = document.createElement("div");
            curContainer.style.height = app.config.imgHeight + "px";
            curContainer.style.overflow = 'hidden';
            contentDiv.appendChild(curContainer);
            app.config.line++;
            imgCount = 0;
        }
        curContainer = $('div:eq(' + app.config.line + ')');
        var newImg = document.createElement('img');
        newImg.src = app.imgUrls[i];
        newImg.height = app.config.imgHeight;
        curContainer.append(newImg);
        imgCount++;
    }
    $('.container').css('height', $(window).height());
    $('.spinner').hide();
    $('.opt').animate({
        'opacity': '.6'
    });
    $('#content').show('slow');
    if (app.interval.move == null)
        app.interval.move = setInterval(moveLine, app.config.timerMove);
};
function moveLine() {
    var randomLine = (Math.floor((Math.random() * app.config.line) + 1)) % (Math.floor($(window).height() / app.config.imgHeight) + 2);
    console.log(randomLine);
    var lineDOM = $('div:eq(' + randomLine + ')');
    var img = lineDOM.children()[app.config.imgPerLine];
    $(img).css("margin-left", "-500px");
    lineDOM.prepend(img);
    $(img).animate({marginLeft: "+=500"}, 1000);
};
function displayPanel() {
    $('.opt').css("opacity", "0");
    var panelDOM = $('.panel');
    panelDOM.show();
    panelDOM.animate({
        'width': '+=300'
    }, 300);
};
function hidePanel() {
    var panelDOM = $('.panel');
    panelDOM.animate({
        'width': '-=300'
    }, 300, function () {
        panelDOM.hide();
        $('.opt').animate({
            'opacity': '.6'
        });
    });
};
function updateOptions() {
    app.config.queries = $('#tag').val().split(',');
    hidePanel();
    app.googleImgSearch = [];
    app.config.line = 1;
    $('#content').html('').hide();
    $('.spinner').show();
    googleGetImages();
    waitLoading();
};