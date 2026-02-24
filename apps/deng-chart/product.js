var strurl	= "/product/";
var total = 0;
var mcut = 0;
var spage = 1;
$(document).ready(function () {
    var darkmode = localStorage.getItem("theme");
    themeChk(darkmode);

    window.addEventListener('themeChanged', (e) => {
        themeChk(e.detail);
    });
    function themeChk(dark) {
        $(".comment p > span:not(tbody p > span), .comment li > span").each(function() {
            var span = $(this);
            var color = span.css("color");
            var bg = span.css("background-color");

            if (color == "rgb(0, 0, 0)" || color == "rgb(37, 37, 37)" || color == "rgb(70, 70, 70)") {
                span.css("color", "");
            }
            if (bg == "rgb(255, 255, 255)") {
                span.css({
                    "color": "",
                    "background-color": ""
                });
            }
        });
    }
    // product_banner 스크립트
    const productBannerLis = $(".product_banner_ul li div");
    const productBanner = $(".product_banner_img");
    let imageChangeTimeout;
    let currentIndex = 0;
    let shouldAutoSlide = true;
    const autoRollingInterval = 3000;
    function changeImage(index) {
        productBannerLis.removeClass("hovered");
        productBannerLis.eq(index).addClass("hovered");
        src =  productBannerLis.eq(index).data("img");
        dd =  productBannerLis.eq(index).data("category");
        const tempImage = $("<img>")
            .on("load", function () {
                productBanner.attr("src", src);
                productBanner.attr('data-category', dd)
            })
            .attr("src", src);
    }
    productBannerLis.each(function (index) {
        $(this).on("mouseenter", function () {
            clearTimeout(imageChangeTimeout);
            shouldAutoSlide = false;
            currentIndex = index;
            img = $(index).data('img');
            changeImage(index);
        });
        $(this).on("mouseleave", function () {
            shouldAutoSlide = true;
            autoRolling(autoRollingInterval);
        });
    });
    productBanner.on("mouseenter", function () {
        shouldAutoSlide = false;
    });
    productBanner.on("mouseleave", function () {
        shouldAutoSlide = true;
        autoRolling(autoRollingInterval);
    });

    function autoRolling(waitTime) {
        clearTimeout(imageChangeTimeout);
        if (shouldAutoSlide) {
            imageChangeTimeout = setTimeout(function () {
                len = $(".product_banner_ul div").length;
                currentIndex = (currentIndex + 1) % len;
                changeImage(currentIndex);
                autoRolling(autoRollingInterval);
            }, waitTime);
        }
    }
    //페이지 클릭
    $(document).on('click','nav.homePage ul li',function(e){
        var param = ycommon.getParams($(this).find('a').attr('href'));
        page = (param.page !== undefined) ? param.page : '1';
        if ($("input[name=page]").length > 0) $("input[name=page]").val(page);
        var pageurl = location.pathname;
        if (pageurl.indexOf("GiftHistory") > -1) {
            gifthistory();
        } else if (pageurl.indexOf("view") > -1) {
            spage = page;
            proposalList();
            proposaljs();
        } else {
            ajaxSearch(2);
        }
        return false;
    });
    changeImage(0);
    autoRolling(autoRollingInterval);
    // search_banner 스크립트
    const $demo5 = $("#demo5");
    const itemWidth = 630;
    var itemcut = 0;
    const itemCount = $demo5.children().length;
    setInterval(scrollForward, 5000);
    $("#demo5-forward").click(function () {
        scrollForward();
    });
    // $("#demo5-backward").click(function () {
    //     scrollBackward();
    // });
    function scrollForward() {
        $demo5.animate({ scrollLeft: `+=${itemWidth}` }, 800, "linear", function () {
            // 다음 이미지를 복사해서 원래의 이미지 목록에 추가합니다.
            const firstItemCopy = $demo5.children().eq(itemcut).clone();
            $demo5.append(firstItemCopy);
            // 현재 스크롤 위치 저장
            itemcut =  $demo5.scrollLeft() / itemWidth;
            // 마지막 이미지에 도달하면 처음으로 되돌림
            demotext();
        });
    }
    function scrollBackward() {
        // 마지막 이미지를 복제해서 원래의 이미지 목록 맨 앞에 추가합니다.
        const lastItemCopy = $demo5.children().last().clone();
        $demo5.prepend(lastItemCopy);
        // 현재 스크롤 위치 저장
        const currentScrollLeft = $demo5.scrollLeft();
        itemcut =  $demo5.scrollLeft() / itemWidth - 1;
        // 첫 번째 이미지에 도달하면 마지막으로 되돌림
        if (currentScrollLeft === 0) {
            $demo5.scrollLeft(itemWidth * itemCount);
            // 이전 이미지로 이동
            $demo5.children().last().remove();
            itemcut = itemCount - 1;
        }
        $demo5.animate({ scrollLeft: `-=${itemWidth}` }, 800, "linear");
        demotext();
    }
    
    function demotext() {
        if ($("#fltitle").length > 0 ) {
            var num = Math.floor(itemcut % itemCount) ;
            var ct = $(".search_banner_txt > p").eq(num).text();
            $("#fltitle").html(ct.replace('· ',''));
        }
    }
    
    demotext();
    // lists 즐겨찾기 추가 스크립트
    var favoriteImg = document.querySelector(".lists_favorite_img");
    if (favoriteImg) {
        favoriteImg.addEventListener("click", function () {
            if (this.src.match("/static/img/new/common/favorite.png")) {
                this.src = "/static/img/new/common/favorite_on.png";
            } else {
                this.src = "/static/img/new/common/favorite.png";
            }
        });
    }
    // product_initial on클릭 스크립트
    document.querySelectorAll(".product_initial div").forEach(function (way) {
        way.addEventListener("click", function () {
            document.querySelectorAll(".product_initial div").forEach(function (p) {
                return p.classList.remove("on");
            });
            way.classList.add("on");
        });
    }); // lists sellbuy 클릭 스크립트
    document.querySelectorAll(".lists_category div").forEach(function (way) {
        way.addEventListener("click", function () {
            if (typeof($(way).data('category')) != 'undefined') {
                if (typeof($(way).data('thread')) != 'undefined') {
                    location.href = "/product/lists/"+$(way).data('thread');
                } else {
                    if ($(this).hasClass("on") === false){
                        alertopen({
                            image:"fail",
                            title: "지원하지 않는 게임입니다",
                            hideCloseButton: true,
                        });
                    }
                }
            } else {
                document.querySelectorAll(".lists_category div").forEach(function (p) {
                    return p.classList.remove("on");
                });
                way.classList.add("on");
                var sell = $(way).data('sell');
                if ($("input[name=sell]").val() != sell) {
                    $("input[name=sell]").val(sell);
                    $("input[name=page]").val(1);
                    if (sell == "sell") {
                        $(".lists_sell").removeClass("di_no_i");
                    } else {
                        $(".lists_sell").addClass("di_no_i");
                    }
                    ajaxSearch(1);
                }
            }
        });
    });
    document.querySelectorAll(".lists_options_division li").forEach(function (way) {
        way.addEventListener("click", function () {
            document.querySelectorAll(".lists_options_division li").forEach(function (p) {
                return p.classList.remove("on");
            });
            way.classList.add("on");
        });
    });
    document.querySelectorAll(".lists_options_history li").forEach(function (way) {
        way.addEventListener("click", function () {
            document.querySelectorAll(".lists_options_history li").forEach(function (p) {
                return p.classList.remove("on");
            });
            way.classList.add("on");
        });
    });
    document.querySelectorAll(".lists_options_peristalsis li").forEach(function (way) {
        way.addEventListener("click", function () {
            document.querySelectorAll(".lists_options_peristalsis li").forEach(function (p) {
                return p.classList.remove("on");
            });
            way.classList.add("on");
        });
    });
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    document.querySelectorAll(".lists_options_price li").forEach(function (way) {
        way.addEventListener("click", function () {
            var minPrice = document.querySelector(".lists_options_price_input input:nth-child(1)");
            var maxPrice = document.querySelector(".lists_options_price_input input:nth-child(3)"); // 첫 번째 input에 0을 넣음
            minPrice.value = 0; // 두 번째 input에 p 태그 내의 텍스트를 숫자로 변환하여 넣음
            var valueText = way.textContent;
            var valueNumber = Number(valueText.replace(/[^0-9]/g, ""));
            var numberWithCommasValue = numberWithCommas(valueNumber); // 세자릿수마다 콤마를 붙임
            maxPrice.value = numberWithCommasValue;
        });
    });
    // document.querySelectorAll(".title_options_all li").forEach(function (way) {
    //     way.addEventListener("click", function () {
    //         document.querySelectorAll(".title_options_all li").forEach(function (p) {
    //             return p.classList.remove("on");
    //         });
    //         way.classList.add("on");
    //         if ($("input[name=display]").val() != $(way).data('display')) {
    //             $("input[name=display]").val($(way).data('display'));
    //             $("input[name=page]").val('1');
    //             ajaxSearch(2);
    //         }
    //     });
    // });
    if($("input[name=display]").val() != $(".title_options_all option:selected").val()) {
        var display = $("input[name=display]").val();
        $(".title_options_all").val(display).prop('selected', true); 
    }
    $(".title_options_all").change(function(e) {
        var v = $(".title_options_all").val();
        if ($("input[name=display]").val() != v) {
            var t = $("input[name=display]").val(v);
            $("input[name=page]").val('1');
            ajaxSearch(1);
        }
    });
    $(".right_proposal_content").hover(function(){
        $(".right_proposal_content").bind('wheel', function(e){
            $(".right_proposal_content").css('overflow-y', 'auto');
        });
    }, function() {
        $(".right_proposal_content").css('overflow-y', 'hidden');
    });

    document.querySelectorAll(".title_options_sort li").forEach(function (way) {
        way.addEventListener("click", function () {
            document.querySelectorAll(".title_options_sort li").forEach(function (p) {
                return p.classList.remove("on");
            });
            way.classList.add("on");
            if ($("input[name=orderby]").val() != $(way).data('orderby')) {
                $("input[name=orderby]").val($(way).data('orderby'));
                $("input[name=page]").val('1');
                ajaxSearch(2);
            }
        });
    }); // view heart 이미지 클릭시 on 스크립트
    // view heart 이미지 클릭시 on 스크립트
    const infoWish = document.querySelector(".info_wish");
    if (infoWish) {
        infoWish.addEventListener("click", () => {
            zzimjs();
        });
    }
    // 인증상태 클래스 on 추가 스크립트
    function updateImageSrc(div) {
        const hasOnClass = div.classList.contains("on");
        const img = div.querySelector("img");
        if (hasOnClass && !img.src.includes("_on.png")) {
            img.src = img.src.replace(".png", "_on.png");
        }
    }
    const statusDivs = document.querySelectorAll(".header_status_image div");
    statusDivs.forEach((div) => {
        updateImageSrc(div);
    });
    // 추가서비스 클릭 이벤트 시작
    $(document).on('click', '.right_addservice > div', function(e){
        $(".right_addservice > div").removeClass("on");
        $(this).addClass("on");
        if( $("#addService_nm").hasClass('on') ) {
            $("#serviceday").data('day', '0');
            var pay = numberjs($("#serviceday").data('pay'));
            var mpay = numberjs($("#serviceday").data('mpay'));
            $(".nm_pay").html(comma(mpay)+"원 / 1개월");
            $("#totalpay").html(comma(pay) + '<span>원</span>');

            $(".right_addservice").css('margin-bottom', '11px');
            $(".right_addservice").css('height', '100%');
            $("#addService_nm").css('height', '143px');
            $("#addService_nm > dl").css('height', '65px');
            $("#serviceday").css('display', 'block');

            var t = 12;
            var obj = '<option value="0"">선택</option>';
            for (var i = 1; i <= t ; ++i) {
                obj += '<option value="'+i+'">'+i+'개월</option>';
            }
            $("#servicepay").val('');
            $("#serviceday").html(obj);
        
        } else {
            $(".right_addservice").css('margin-bottom', '84px');
            $(".right_addservice").css('height', '312px');
            $("#addService_nm").css('height', '70px');
            $("#serviceday").css('display', 'none');
        }
    });
    // 추가서비스 클릭 이벤트 종료

    // 완료페이지 드롭다운 시작
    $(document).on('click', '.order_dropdown > img', function(e){
        if( $(".order_info").hasClass('active') ) {
            $(".order_info").removeClass('active');
            $(".order_info").show();
            $(".order_dropdown > img").attr("src", "/static/img/new/common/arrow_down1.png");
        } else {
            $(".order_info").addClass('active');
            $(".order_info").hide();
            $(".order_dropdown > img").attr("src", "/static/img/new/common/arrow_up.png");
        } 
    });
    $(document).on('click', '.price_dropdown > img', function(e){
        if( $(".price_info").hasClass('active') ) {
            $(".price_info").removeClass('active');
            $(".price_info").show();
            $(".price_dropdown > img").attr("src", "/static/img/new/common/arrow_down1.png");
        } else {
            $(".price_info").addClass('active');
            $(".price_info").hide();
            $(".price_dropdown > img").attr("src", "/static/img/new/common/arrow_up.png");
        } 
    });
    $(document).on('click', '.payment_dropdown > img', function(e){
        if( $(".payment_info").hasClass('active') ) {
            $(".payment_info").removeClass('active');
            $(".payment_info").show();
            $(".payment_dropdown > img").attr("src", "/static/img/new/common/arrow_down1.png");
        } else {
            $(".payment_info").addClass('active');
            $(".payment_info").hide();
            $(".payment_dropdown > img").attr("src", "/static/img/new/common/arrow_up.png");
        } 
    });
    // 완료페이지 드롭다운 종료
    $(document).on('click','.order_add_service > div',function(e){
        $(".order_add_service > div").removeClass("on");
        $(this).addClass("on");
        $("#event1").data("mpay","0");
        $("#event2").data("mpay","0");
        var content = $(this).data('content');
        $("#add_service_explain > span").html(content);
        if (content != "") {
            $("#add_service_explain").removeClass("di_no_i");
        } else {
            $("#add_service_explain").addClass("di_no_i");
        }
        if (typeof  $(this).data('ipay') != "undefined") {
            $("#chkpay").removeClass("di_no_i");
            var type = $(this).data('type');
            var t = 12;
            if (type == "w1") {
                t = 24;
                $("#divpay").removeClass("di_no_i");
            } else {
                $("#divpay").addClass("di_no_i");
            }
            var obj = '<option value="0">선택</option>';
            for (var i = 1; i <= t ; ++i) {
                obj += '<option value="'+i+'">'+i+'개월</option>';
            }
            $("#servicepay").val('');
            $("#serviceday").html(obj);
        } else {
            $("#chkpay").addClass("di_no_i");
        }
        totalpay();
    });
    // 물품리스트 즐겨찾기 스크립트
    $(document).on('click', '.lists_wrap_top > div', function(e) {
        var img = $(this).find('img');
        var text = $(this).find('p');   
        var imgSrc = img.attr("src");
        var newSrc, newText;

        if (imgSrc.includes("_on.png")) {
            newSrc = imgSrc.replace("_on.png", ".png");
            newText = "추가";
            favorites('out');
        } else {
            newSrc = imgSrc.replace(".png", "_on.png");
            newText = "해제";
            favorites('in');
        }

        img.attr("src", newSrc);
        text.text("즐겨 찾기 " + newText);
    });
    
    $(document).on('click','ul.lists_options_classification li',function(e){
        var stitle = $(this).data('title');
        var data = $(this).data(stitle);
        var ul = $(this).parent('ul');
        if (data == '') {
            if ($(this).hasClass("on")) {
                ul.find('li').removeClass("on");
                $(this).removeClass("on");
            } else {
                ul.find('li').addClass("on");
                $(this).addClass("on");
            }
        } else if (stitle == "sell") {
            ul.find('li').removeClass("on");
            $(this).addClass("on");
            if ($("input[name=sell]").val() != data) {
                $("input[name=sell]").val(data);
                $("input[name=page]").val(1);
                if (data == "sell") {
                    $(".lists_sell").removeClass("di_no_i");
                } else {
                    $(".lists_sell").addClass("di_no_i");
                }
                ajaxSearch(1);
                return;
            }
        } else {
            if($(this).hasClass("on") == true){
                $(this).removeClass("on");
            } else {
                $(this).addClass("on");
            }
            var allclass = true;
            ul.find('li').each(function(i) {
                if(i > 0 && $(this).hasClass("on") == false) {
                    allclass = false;
                }
            });
            if (allclass) {
                ul.find('li').eq(0).addClass("on");
            } else {
                ul.find('li').eq(0).removeClass("on");
            }
        }
        var dd = '';
        ul.find('li').each(function() {
            if ($(this).hasClass("on")) {
                if (dd != '') dd += ",";
                dd += $(this).data(stitle);
            }
        });
        $("input[name="+stitle+"]").val(dd);
    });

    if ($("ul.lists_options_classification").length > 0) {
        $("ul.lists_options_classification").each(function() {
            var stitle = $(this).find('li').data('title');
            if (stitle != "sell") {
                var allclass = true;
                $(this).find('li').each(function(i) {
                    if(i > 0 && $(this).hasClass("on") == false) {
                        allclass = false;
                    }
                });
                if (allclass) {
                    $(this).find('li').eq(0).addClass("on");
                } else {
                    $(this).find('li').eq(0).removeClass("on");
                }
            }
        })
    }
    
    // 등록된 물품 상세 내용 img 클릭 시 새창 (캐러셀 적용 이전 코드)
    // $('.comment img').click(function(e){
    //     var src = $(this).attr("src");
    //     if (src != '') {
    //         window.open(src);
    //     }
    // });
    //물품 상세 이미지 캐러셀 시작
    const thumbnails = document.querySelectorAll(".comment img");
    // 슬라이드 갤러리 초기화
    if (thumbnails.length > 0) initializeGallery();

    //물품 상세 이미지 캐러셀 종료

    // 리스트 물품 검색 엔터키 입력시 submit
    $('#search_word').on('keypress', function(e) {
        if (e.keyCode == 13) {  // 엔터키 코드
            listSearch();
        }
    });

    // giftview 모달 +- 스크립트
    $(document).on('click','.charge_modal_minus_wrap',function(e){
        e.stopPropagation();
        var div = $(this).parent("div");
        var cut = div.find("input").val();
        cut = Number(cut);
        if (cut == 0) return;
        --cut;
        div.find("input").val(cut);
        if (cut == 0) {
            div.find(".charge_modal_minus").attr("src",div.find(".charge_modal_minus").attr("src").replace("newMinus_on.png", "minus.png"));
        };
        div.find(".charge_modal_plus").attr("src",div.find(".charge_modal_plus").attr("src").replace("plus.png", "newPlus_on.png"));
        giftviewcount();
    });
    
    $(document).on('click','.charge_modal_plus_wrap',function(e){
        e.stopPropagation();
        var div = $(this).parent("div");
        var cut = div.find("input").val();
        cut = Number(cut);
        if (cut == 10) return;
        ++cut;
        div.find("input").val(cut);
        if (cut == 10) {
            div.find(".charge_modal_plus").attr("src",div.find(".charge_modal_plus").attr("src").replace("plus_on.png", "plus.png"));
        };
        div.find(".charge_modal_minus").attr("src",div.find(".charge_modal_minus").attr("src").replace("minus.png", "minus_on.png"));
        var bool = giftviewcount();
        if (!bool) {
            --cut;
            div.find("input").val(cut);
            if (cut == 0) {
                div.find(".charge_modal_minus").attr("src",div.find(".charge_modal_minus").attr("src").replace("minus_on.png", "minus.png"));
            };
            div.find(".charge_modal_plus").attr("src",div.find(".charge_modal_plus").attr("src").replace("plus.png", "plus_on.png"));
            giftviewcount();
            alert("회원님의 마일리지가 부족하여 추가 구매 하실수 없습니다.");
        }
    });
    // giftview 탭 스크립트
    $(function() {
        $('.giftview_tab_divs div').click(function() {
            var onTab = $(this).attr('data-tab');
            $('.giftview_tab_divs div').removeClass('on');
            $('.giftview_content_divs').removeClass('on');
            $(this).addClass('on');
            $('#' + onTab).addClass('on');
        })
    });
    
    $(function() {
        var $slider = $('.gifthistory_carousel_ul');
        var $slides = $slider.find('li');
    
        // 각 슬라이드에 원래의 위치에 대한 데이터 속성 추가
        $slides.each(function(index) {
            $(this).attr('data-original-index', index + 1);
        });
    
        // 마지막 슬라이드를 맨 앞으로 보내기
        // $slides.last().prependTo($slider);
        var onIndex = $slides.index($slides.filter('.on'));
        // 'on' 클래스가 붙어있는 요소를 가운데에 두고 나머지 요소 재정렬
        $slides = $slides.toArray();
        $slides.unshift.apply($slides, $slides.splice(onIndex - 1, $slides.length));
        $slider.empty().append($slides);
        $slider.find('li').eq(0).addClass('prev'); // 첫 번째 슬라이드에 prev 추가
        $slider.find('li').eq(2).addClass('next'); // 세 번째 슬라이드에 next 추가
    
        function slide(action) {
            var $slide = action === 'next' ? $slider.find('li').first() : $slider.find('li').last();
            var methodName = action === 'next' ? 'appendTo' : 'prependTo';
        
            $slide[methodName]($slider); // 슬라이드 이동
        
            // 모든 클래스 제거
            $slider.find('li').removeClass('on prev next');
        
            // 클래스 다시 추가
            $slider.find('li').eq(0).addClass('prev'); // 첫 번째 슬라이드에 prev 추가
            $slider.find('li').eq(1).addClass('on');   // 두 번째 슬라이드에 on 추가
            $slider.find('li').eq(2).addClass('next'); // 세 번째 슬라이드에 next 추가
        
            $("#giftcode").val($slider.find('li').eq(1).find('img').data('code'));
            gifthistory();
        }
    
        $('body').on('click', '.gifthistory_carousel_btn_next, .gifthistory_carousel_ul > .next', function() { // 이전버튼 클릭
            slide('next');
        });
        $('body').on('click', '.gifthistory_carousel_btn_prev, .gifthistory_carousel_ul > .prev', function() { // 다음버튼 클릭
            slide('prev');
        });
    });    

    var historyListLi = document.querySelectorAll(".gift_company_list li")
    historyListLi.forEach((way) => {
        way.addEventListener("click", () => {
            historyListLi.forEach((p) => p.classList.remove("on"));
            var dataCode = way.getAttribute("data-code");
            document.getElementById('giftcode').value = dataCode;
            gifthistory();
            way.classList.add("on");
        });
    });

    // 상품권샵 구매 내역 토글
    $(document).on('click','.gifthistory_list_left',function(e){
        var li = $(this).parent("div");
        var rightDiv = li.find("div.gifthistory_list_right");
        var leftDivImg = li.find("div.gifthistory_list_left .list_img");

        if (rightDiv.hasClass("active")) {
            rightDiv.removeClass("active");
            leftDivImg.attr("src", "/static/img/new/common/sm_arrow_down.png");
        } else {
            rightDiv.addClass("active");
            leftDivImg.attr("src", "/static/img/new/common/sm_arrow_up.png");
        }
    });

    // 상품권샵 구매내역 핀코드 복사
    $(document).on('click', '.gifthistory_pin_code', function(e) {
        var pinCode = $(this).text();
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(pinCode).select();
        document.execCommand("copy");
        $temp.remove();
        
        options = [];
        options["image"] = "success";
        options["title"] = "핀번호가 복사 되었습니다.";
        options["hideCloseButton"] = true;
        alertopen(options);
    });

    $(document).on('click','.comment a',function(e){
        var href = $(this).prop('href');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (href != "#" && href.length > 5) window.open(href);
    });
    // $(document).on('click','img',function(e){
    //     var href = $(this).prop('src');
    //     console.log(href);
    //     e.preventDefault();
    //     e.stopPropagation();
    //     e.stopImmediatePropagation();
    //     if (href != "#" && href.length > 5) barotemGuide(href);
    // });
    
    if(typeof onoff !== "undefined") {
        if(onoff.on == 'on') {
            $(".online").addClass("on");
            $(".online > img").attr("src", "/static/img/new/product/online.png");
            $(".online").append(onoff.text);
        } else {
            $(".online").removeClass("on");
            $(".online > img").attr("src", "/static/img/new/product/offline.png");
            $(".online").append(onoff.text);
        }
    }
});

// 출금 하단 giftblock 클릭 시 넘어 온 URL 처리
document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const giftCode = urlParams.get('giftCode');
    if (giftCode) {
      setTimeout(() => {
        openChargeModal(giftCode);
      }, 300);
    }
});

function openChargeModal(code) {

    loading(1);
	var str_url	= strurl+"giftview/"+code;
    // return;
	jQuery.ajax({
		type: "post",
		url : str_url,
		success:function(data, status, xhr){
            arr = JSON.parse(data);

            if (arr.code == 200) {
                var modalOverlay = document.querySelector(".giftview_modal_overlay");
                total = 0;
                mcut = 0;
                var modal = document.querySelector(".giftview_charge_modal_wrap");
                modalOverlay.style.display = "block";
                modal.style.display = "flex";
                $(".giftview_charge_modal_wrap").html(arr.msg);
                giftviewcount();

                $(".charge_modal_list > ul > li > div > input").val("0");
                $(".charge_modal_minus").attr("src",$(".charge_modal_minus").attr("src").replace("minus_on.png", "minus.png"));
                $(".charge_modal_plus").attr("src",$(".charge_modal_plus").attr("src").replace("plus.png", "plus_on.png"));
            } else if (arr.code == 400){
                options = [];
                options["image"] = "alert";
                options["title"] = arr.msg;
                options["customFunction"] = "location.href='/auth/login'";
                options["hideCloseButton"] = true;
                alertopen(options);
            } else {
                options = [];
                options["image"] = "alert";
                options["title"] = arr.msg;
                options["hideCloseButton"] = true;
                alertopen(options);
            }
            loading(2);
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
function giftviewcount() {
    var bool = true;
    var spay = gpay = pay = cut = 0;
    total = mcut = 0;
    var html = '';
    var li = '\
    <li>\
        <p>{cut}개</p>\
        <p>{spay}원</p>\
        <span>{pay}원</span>\
        <img src="/static/img/new/product/cart_back.png" alt="오른쪽 화살표 이미지" data-id="{id}">\
    </li>';
    $(".charge_modal_list ul li").each(function() {
        pay = $(this).attr("id");
        gpay = $(this).data("pay");
        cut = $(this).find("input").val();
        cut = Number(cut);
        pay = Number(pay);
        gpay = Number(gpay);
        if (cut > 0 ) {
            mcut += cut;
            spay = pay * cut;
            total += spay;
            html += li.replace("{cut}",cut).replace("{spay}",comma(spay)).replace("{pay}",comma(gpay)).replace("{id}",pay);
        }
    });
    if (total > point) bool = false;
    $("#mcut").html(comma(mcut));
    $("#tpay").html(comma(total));
    giftbtn();
    return bool;
}

function giftbtn(){
    if (mcut > 0 && $('#modalCheckbox').is(':checked')) {
        $(".charge_modal_btns").find('div').eq(1).addClass("on");
    } else {
        $(".charge_modal_btns").find('div').eq(1).removeClass("on");
    }
}

function giftorder(){
    if (!$("#modalCheckbox").is(':checked')) return alertopen({
        image:"alert",
        title: "필수 동의 사항을 체크해주세요",
        hideCloseButton: true,
    });
    if (mcut == 0) return alertopen({
	        image:"alert",
            title: "구매하실 권종을 선택해주세요",
            hideCloseButton: true,
        });
    $("input[name=tcashpass]").val('');
    js = 'passview()';
	var msg = "선택한 상품을 구매하시면 <br>" + comma(total) + " 마일리지가 소모 됩니다<br><br>구매 후 환불, 취소가 불가능한 상품입니다<br>구매 하시겠습니까?{비밀번호}";
    // if ($("#Tcash").val() == "1") {
    //     msg = msg.replace("{비밀번호}",'<br><br>PIN 비밀번호 : <input id="tcashpass" type="password" maxlength="6" onkeyup="SetNum(this)" class="tx_c p000 Ls_30">PIN번호 직접 입력시 꼭 필요해요.');
    // } else {
        msg = msg.replace("{비밀번호}",'');
    // }
	userPassjs = "ordergift()";
    alertopen({
        image: "curios",
        title: msg,
        hideCloseButton: false,
        customFunction: js,
    })
    if ($("#Tcash").val() == "1") $("#tcashpass").focus();
}
function giftview(){
    // if ($("#Tcash").val() == "1") {
    //     if ($("#tcashpass").val().length == 0) return alert("PIN 비밀번호를 입력하세요.");
    //     if ($("#tcashpass").val().length < 6) return alert("PIN 비밀번호를 정확히 입력하세요.");
    //     $("input[name=tcashpass]").val($("#tcashpass").val());
    // }
    // paymentpwview();
    passview();
}

var giftbool = true;
function ordergift(){
    if (giftbool) {
        giftbool = false;
        loading(1);
        var str_url	= strurl+"giftorder";
        var actionData = $('#frm').serialize();
        // return;
        jQuery.ajax({
            type: "post",
            url : str_url,
            data: actionData,
            success:function(data, status, xhr){
                arr = JSON.parse(data);
                var msg = arr.msg;
                if (arr.code == 200) {
                    url = 'location.href="'+strurl+"gifthistory/"+$("input[name=giftcode]").val()+'"';
                } else {
                    url = 'location.reload();';
                }
                loading(2);
                alertopen({
				    image:"success",
				    title: msg,
				    hideCloseButton: true,
				    customFunction: url,
				});
            },
            error : function(request, status, error) {
                alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
                loading(2);
            }
        });
    }
}
function gifthistory(){
    loading(1);
    var giftcode = $("#giftcode").val();
    var page = $("input[name=page]").val();
	var str_url	= strurl+"giftHistorylist";
	jQuery.ajax({
		type: "post",
		url : str_url,
		data: {giftcode:giftcode,page:page},
		success:function(data, status, xhr){
            arr = JSON.parse(data);
            if (arr.code == 200) {
                if (giftcode == "3001") {
                    $(".gifthistory_tcash_app_container").removeClass("di_no_i");
                } else {
                    $(".gifthistory_tcash_app_container").addClass("di_no_i");
                }
                $(".gifthistory_list_container").html(arr.view);
            } else {
                alert(arr.msg);
            }

            // 각 구매 건수
            var totalItemCount = 0;
            $('.gifthistory_list').each(function() {
                var itemCount = $(this).find('.gifthistory_list_right > div > ul > li > .gifthistory_pin_code').length;
                totalItemCount += itemCount;
                $(this).find('.gifthistory_purchase > span').text(itemCount);
            });

            $('.gifthistory_list_total > span').html(comma(totalItemCount));
            loading(2);
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
function closeChargeModal() {
    var modalOverlay = document.querySelector(".giftview_modal_overlay");
    var modal = document.querySelector(".giftview_charge_modal");
    modalOverlay.style.display = "none";
    modal.style.display = "none";
}
function searchcho(obj) {
    loading(1);
    var tv = $(obj).html();
    var list = '';
    var html = '<li>\
        <a href="javascript:void(0);" onclick="productlist(\'{thread}\')">\
                <img src="{img}" alt="{title}" title="{title}"/>\
                <p>{title}</p>\
            </a>\
        </li>';
    if (tv == "전체") {
        searchjs(tabcoe);
    } else{
        if (tv == "1~A") {
            var arr = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
            for (var i = 0; i < arr.length ; ++i) {
                ret = homeSearch(arr[i],tabcoe,'',2,html);
                if (typeof(ret) != "undefined") {
                    if (list == "") {
                        list += ret;    
                    } else {
                        var words = ret.split('<li');
                        var str = list.replace(/<b class='chColor'>/gi, "").replace(/<\/b>/gi, "");
                        for (var t = 0; t < words.length; ++ t) {
                            rr = words[t].replace(/<b class='chColor'>/gi, "").replace(/<\/b>/gi, "");
                            if (str.indexOf(rr) == -1 ) {
                                list += "<li"+words[t];
                            }
                        }
                    }
                }
            }
        } else {
            list = homeSearch(tv,tabcoe,'',2,html);
            if (tv == "ㄱ") list += homeSearch("ㄲ",tabcoe,'',2,html);
            if (tv == "ㄷ") list += homeSearch("ㄸ",tabcoe,'',2,html);
            if (tv == "ㅈ") list += homeSearch("ㅉ",tabcoe,'',2,html);
            if (tv == "ㅂ") list += homeSearch("ㅃ",tabcoe,'',2,html);
            if (tv == "ㅅ") list += homeSearch("ㅆ",tabcoe,'',2,html);
        }
        $(".product_ul").html(list);
    }
    loading(0);
}
function searchurl(obj) {
    num = $(obj).data('category');
    location.href = "/product/lists/"+num;
}
function searchjs() {
    var compars = globalCategory[tabcoe];
    var text = '';
    var html = '<li>\
            <a href="javascript:void(0);" onclick="productlist(\'{thread}\')">\
                <img src="{img}" alt="{title}" title="{title}"/>\
                <p>{title}</p>\
            </a>\
        </li>';
        
    $(compars).each(function(i,compare){
        title = compare.title;
        thread = compare.thread;
        img = compare.cate_img;
        $(setFavoritearr).each(function(t,search){
            searchT = search.thread;
            if (searchT == thread) {
                li = html;
                li = li.replace(/{title}/gi, title);
                li = li.replace(/{thread}/gi, thread);
                li = li.replace(/{img}/gi, img);
            }
        });
        li = html;
        li = li.replace(/{title}/gi, title);
        li = li.replace(/{thread}/gi, thread);
        li = li.replace(/{img}/gi, img);
        text += li;
    });
    $(".product_ul").html(text);
}
function favorites(vl) {
	var str_url	= strurl+"saveFavorites";
    setFavoritearr = [];
	jQuery.ajax({
		type: "post",
		url : str_url,
		data: {type:vl,thread:category},
		success:function(data, status, xhr){
            arr = JSON.parse(data);
            if (arr.code == 200) {
                setFavoritearr =  JSON.parse(arr.game);
            } else {
                alertopen({
                    image:"alert",
                    title: data,
                    hideCloseButton: true,
                });
            }
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
function listSearch() {
    $("input[name=page]").val(1);
    ajaxSearch(1);
}
var apibool = true;
function ajaxSearch(no) {
    loading(1);
    scTop = "#shtop";
    if (no == 2) scTop = "#sttop";
    var re = /[^0-9]/gi;
    $("input[name=search_word]").val($("#search_word").val());
    var minpay = $("#minpay").val();
    $("input[name=minpay]").val(minpay);
    var maxpay = $("#maxpay").val();
    $("input[name=maxpay]").val(maxpay);
    var sellValue = $('#frm input[name="sell"]').val();
    if(category != '2380') {
        // $('input[name="sellType"][value="sell"]').prop('checked', sellValue == 'sell');
        // $('input[name="sellType"][value="buy"]').prop('checked', sellValue == 'buy');
        $("#headerSelectul li").removeClass("on");

        $("#headerSelectul li").filter(function() {
            return $(this).data("val") === sellValue;
        }).addClass("on");
        $("#headerSelectul li.on").show();
    }
    var f = $('#frm');
    var action = location.pathname;
    var actionData = f.serialize();
    action += '?' + actionData;
    history.pushState(null, null, action);
    var str_url;
    str_url = strurl + "premiumTable/"+category;
    jQuery.ajax({
        type: "get",
        url : str_url,
        data: actionData,
        success:function(data, status, xhr){
            arr = JSON.parse(data);
            if (arr.code == 200) {
                
                // 리뉴얼
                var premiumHtml = premiumView = '';
                if(arr.rows.length > 0) {
                    arr.rows.forEach(function(row) {
                        premiumData = ajaxtransformData(row, arr.keywordarr);
                        premiumView = '';

                        premiumView = arr.view.replace(/\{\{(\w+)\}\}/g, function(_, key) {
                            return premiumData[key] ?? '';
                        });
                        premiumHtml += premiumView;
                    });
                    $("#pmcut").html(arr.total);
                    $(".lists_product_premium").html(premiumHtml);
                    $(".lists_title_premium").removeClass("di_no_i");
                    $(".lists_product_premium").removeClass("di_no_i");
                } else {
                    $(".lists_product_premium").html('');
                    $(".lists_title_premium").addClass("di_no_i");
                    $(".lists_product_premium").addClass("di_no_i");
                }
                tdcolor();
                if (typeof arr.q != "undefined") console.log(arr.q);
                
                // 기존
                // view = arr.view;
                // $("#pmcut").html(arr.total);
                // if (view.length > 0) {
                //     $(".lists_product_premium").html(view);
                //     $(".lists_title_premium").removeClass("di_no_i");
                //     $(".lists_product_premium").removeClass("di_no_i");
                // } else {
                //     $(".lists_product_premium").html('');
                //     $(".lists_title_premium").addClass("di_no_i");
                //     $(".lists_product_premium").addClass("di_no_i");
                // }
                // $('.lists_goods_content').each(function(el) {
                //     var online = $(this).data('online');
                //     if(online) {
                //         var onoff = onoffline(online);
                //         if(onoff.on == 'on') {
                //             $(this).find(".onoffline").addClass('on');
                //             $(this).find(".onoffline").html('<img src="/static/img/new/product/online.png">'+onoff.text);
                //         } else {
                //             $(this).find(".onoffline").removeClass('on');
                //             $(this).find(".onoffline").html('<img src="/static/img/new/product/offline.png">'+onoff.text);
                //         }
                //     }
                // });
            } else {
                alertopen({
                    image:"alert",
                    title: arr.msg,
                    hideCloseButton: true,
                });
            }
        },
        error : function(request, status, error) {
            if (apibool) {
                apibool = false;
                return saveSearch(true);
            } else {
                alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
                return loading(2);
            }
        }
    });
    str_url = strurl + "productTable/"+category;
    jQuery.ajax({
        type: "get",
        url : str_url,
        data: actionData,
        success:function(data, status, xhr){
            arr = JSON.parse(data);
            // console.log(arr);
            if (arr.code == 200) {

                // 리뉴얼
                var html = view = '';

                arr.rows.forEach(function(row) {
                    data = ajaxtransformData(row, arr.keywordarr);
                    view = '';

                    view = arr.view.replace(/\{\{(\w+)\}\}/g, function(_, key) {
                        return data[key] ?? '';
                    });
                    html += view;
                });
                // 리스트
                $(".lists_product_contents").html(html);
                if (no > 0) listscrollTop();
                // 페이지네이션
                $(".lists_product_pagination").html(arr.paging);
                // 리스트 총 수
                $("#cut").html(arr.total);
                tdcolor();
                if (typeof arr.q != "undefined") console.log(arr.q);

                // 기존
                // $(".lists_product_common").html(arr.view);
                // $("#cut").html(arr.total);
                // if (no > 0) listscrollTop();
                // tdcolor();
                // $('.lists_goods_content').each(function(el) {
                //     var online = $(this).data('online');
                //     if(online) {
                //         var onoff = onoffline(online);
                //         if(onoff.on == 'on') {
                //             $(this).find(".onoffline").addClass('on');
                //             $(this).find(".onoffline").html('<img src="/static/img/new/product/online.png">'+onoff.text);
                //         } else {
                //             $(this).find(".onoffline").removeClass('on');
                //             $(this).find(".onoffline").html('<img src="/static/img/new/product/offline.png">'+onoff.text);
                //         }
                //     }
                // });
            } else {
                alertopen({
                    image:"alert",
                    title: arr.msg,
                    hideCloseButton: true,
                });
            }
            loading(2);
        },
        error : function(request, status, error) {
            if (apibool) {
                apibool = false;
                return saveSearch(true);
            } else {
                alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
                return loading(2);
            }
        }
    });
}
function ajaxtransformData(row, keyword) {

    // 물품명 검색 ( 키워드 )
    var productName = row.product_name || "";
    if (keyword && keyword.length > 0 && productName) {
        keyword.forEach(function(r) {
            if (r) {
                productName = productName.replaceAll(r, "<i>" + r + "</i>");
            }
        });
    }
    row.product_name = productName;

    if(row.onlineUse) {
        var onoff = onoffline(row.online_date);
        row.on = (onoff.on == 'on') ? 'on' : '';
        row.onImg = (onoff.on == 'on') ? 'online' : 'offline';
        row.onlineText = onoff.text;
    }
    row.brandClass = row.brandClass ? '' : 'di_no_i';
    row.isAmends = row.isAmends ? "" : "di_no_i";
    row.isBuynow = row.isBuynow ? "" : "di_no_i";
    row.isQuick = row.isQuick ? "" : "di_no_i";
    row.isQuickMark = row.isQuickMark ? "" : "di_no_i";
    row.darkImgClass = row.darkImgClass ? 'listDark_img' : '';

    // 계정 판매 금액
    row.acount_price = Number(row.acount_price).toLocaleString() + '원';
    if(row.acount_price_min && Number(row.acount_price_min) > 0) {
        row.acount_price_min = Number(row.acount_price_min).toLocaleString() + '원';
        row.acount_price = '~ ' + row.acount_price;
    } else {
        row.acount_price_min = '';
    }

    // 판매 수량(일괄,분할)
    row.singleUnitClass = "di_no_i";
    row.multiUnitClass = "di_no_i";
    if(row.saletype == '1') {
        row.singleUnitClass = "";
        if( Number(row.unitEx) > 1 || row.category.substring(0, 5) == "2382r" ) {
            row.single_cnt = row.single_unit;
        } else {
            row.single_cnt = (row.sell_type == 'buy') ? "일괄구매" : "일괄판매";
        }
        // row.unit_price = ( Number(row.unitEx) > 1 ) ? row.saleUnitText+'당 '+ Math.floor(Number(row.baro_price) / Number(row.unitEx)).toLocaleString() + '원': '';
        row.noacount_price = Number(row.baro_price).toLocaleString() +"원"; // 판매 금액
    } else {
        if( Number(row.min_cnt) > Number(row.work_same_cnt) ) {
            row.singleUnitClass = "";
            row.single_cnt = '[수량 부족]';
        } else {
            row.multiUnitClass = "";
        }
        if (typeof(row.unit_price) == "undefined") {
            row.unit_price = row.saleUnitText+'당 '+ Number(row.baro_price).toLocaleString() +"원"; // 단위 금액
        }
        row.noacount_price = "최소 " + (Number(row.baro_price) * Number(row.min_cnt)).toLocaleString() +"원"; // 판매 금액
    }
    return row;
}
function listscrollTop() {
    var offset = $(scTop).offset();
    var scrollValue = Math.max(window.pageYOffset, document.body.scrollTop);
    var t = $(".top_section").height() + 20;
    var h = offset.top + scrollValue - t;
    $('body').animate({scrollTop : h}, 300);
}

function zzimjs() {
	var str_url	= strurl+"zzim";
	jQuery.ajax({
		type: "post",
		url : str_url,
		data: {num:productNumber},
		success:function(data, status, xhr){
            arr = JSON.parse(data);
            img = "fail";
            if (arr.code == 200)  {
                if (arr.status == "del") $(".info_wish > img").attr("src", "/static/img/new/product/heart1.png");
                if (arr.status == "add") $(".info_wish > img").attr("src", "/static/img/new/product/heart1_on.png");
                img = "success";
            }
            alertopen({
                image: img,
                title: arr.msg,
                hideCloseButton: true,
            });
            loading(2);
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
function proposalList() {
    loading(1);
    str_url = strurl + "proposalList";
    jQuery.ajax({
        type: "post",
        url : str_url,
        data: {num:productNumber, thread:thread,page:spage},
        success: function(data, status, xhr){
            arr = JSON.parse(data);
            if (arr.code == 200) {
                $(".proposal_count > div > p").text(arr.count);
                $(".right_proposal_content").html(arr.view);

                //페이지 클릭
            } else {
                alertopen({
                    image:"file",
                    title: arr.msg,
                    hideCloseButton: true,
                });
            }
            loading(2);
        }
    });
}

function calculate(no) {
    var cnt = numberjs($("#barotemcnt").val());
    var max = numberjs($("#maxcnt").val());
    var min = numberjs($("#mincnt").val());
    var pay = numberjs($("#pay").val());

    cnt += no;
    if (min > max) {
        alertopen({
	        image:"fail",
            title: "구매 가능 수량이 없습니다",
            hideCloseButton: true,
        });
        $("#barotemcnt").val(max);
        return false;
    }
    if (cnt > max) {
        cnt = max;
        alertopen({
	        image:"alert",
            title: "최대수량입니다",
            hideCloseButton: true,
        });
        $("#barotemcnt").val(cnt);
    } else if (cnt < min) {
        cnt = min;
        alertopen({
	        image:"alert",
            title: "최소수량입니다",
            hideCloseButton: true,
        });
        $("#barotemcnt").val(cnt);
    }
    pay = pay * cnt;
     
    $("#barotemcnt").val(cnt);
    $("input[name=cnt]").val(cnt);

    var percent = numberjs($("#guarantee_percent").text());
    var noaccountpay = 0;
    if($("#noaccount_guarantee").hasClass('on')) { 
        noaccountpay = pay * (0.01 * percent);
    }
    var totalpay = pay + noaccountpay;

    $("#totalpay").html(comma(totalpay) + '<span>원</span');
    if (cnt > min) {
        if ($("#minus").attr("src").indexOf("_on.png") == -1) {
            $("#minus").attr("src",$("#minus").attr("src").replace(".png","_on.png"));
        }
    } else {
        if ($("#minus").attr("src").indexOf("_on.png") != -1) {
            $("#minus").attr("src",$("#minus").attr("src").replace("_on.png",".png"));
        }
    }
    if (cnt < max) {
        if ($("#plus").attr("src").indexOf("_on.png") == -1) {
            $("#plus").attr("src",$("#plus").attr("src").replace(".png","_on.png"));
        }
    } else {
        if ($("#plus").attr("src").indexOf("_on.png") != -1) {
            $("#plus").attr("src",$("#plus").attr("src").replace("_on.png",".png"));
        }
    }
}

function cart(code) {
    if (!orderbool) {
        alertopen({
	        image:"fail",
            title: "회원님의 물품입니다.<br><br>본인 물품은 결제가 불가능 합니다",
            hideCloseButton: true,
        });
        return false;
    }
    var cnt = numberjs($("#barotemcnt").val());
    var max = numberjs($("#maxcnt").val());
    var min = numberjs($("#mincnt").val());
    var pay = numberjs($("#pay").val());
    if (min > max) {
        return alertopen({
	        image:"fail",
            title: "구매 가능 수량이 없습니다",
            hideCloseButton: true,
        });
    }
    if (cnt < min) {
        return alertopen({
	        image:"alert",
            title: "최소 수량보다 구매 수량이 작습니다",
            hideCloseButton: true,
        });
    }
    if (cnt > max) {
        return alertopen({
	        image:"alert",
            title: "최대 수량보다 구매 수량이 많습니다",
            hideCloseButton: true,
        });
    }
    loading(1);
    var productQuantity = $("#barotemcnt").val();
	var str_url	= strurl+"cart";
	jQuery.ajax({
		type: "post",
		url : str_url,
        data: {number:productNumber,quantity:productQuantity},
		success:function(data, status, xhr){
            arr = JSON.parse(data);
            // console.log(arr)
            if (arr.code == 200) {
                // location.href = strurl+"order/"+arr.cartId;
                $("input[name=cartId]").val(arr.cartId);
                loading(2);
                var div = '';
                if ( code == "account") {
                    js = 'paymentpwview(0)';
                    threadClass = 'account';
                    div1 = '<div>\
                        <img src="/static/img/new/common/paper.png" alt="이미지"/>\
                        <p>법적 효력</p>\
                        <h3>전자계약서</h3>\
                    </div><div>\
                        <img src="/static/img/new/common/silver.png" alt="이미지"/>\
                        <p>회수 대비</p>\
                        <h3>일반 보증</h3>\
                    </div><div>\
                        <img src="/static/img/new/common/gold.png" alt="이미지"/>\
                        <p>회수,정지,탈퇴 대비</p>\
                        <h3>프리미엄 보증</h3>\
                    <div>';
                } else if ( code == "item" || code == "money" || code == "etc" ) {
                    var vi = (code == "etc")? "2":"1";
                    js = 'paymentpwview('+vi+')';
                    threadClass = 'noaccount';
                    div1 = '<div class="noaccount">\
                        <img src="/static/img/new/common/paper.png" alt="이미지"/>\
                        <p>영구정지, 명의도용, 복제 대비</p>\
                        <h3>아이템/게임머니 보증</h3>\
                    </div>';
                } else {
                    js = 'paymentpwview()';
                }
                userPassjs = "savePayment()";
                spay = $(".right_addservice > .on").data("number");
                var childCount = $(".right_addservice").find("div").length;
                if(spay == 0 && selltype == "sell" && thread != 'gift' && thread != 'etc' && childCount > 1) {
                    var div = '<div class="normal_content" id="normal_content">\
                    <div>\
                        <img src="/static/img/new/product/newSafe.png" alt="이미지"/>\
                        <h2>안전 거래를 이용해보세요</h2></div>\
                    <div class="service_info {threadClass}">\
                    {div1}\
                    </div></div>';

                    div = div.replace('{threadClass}', threadClass);
                    div = div.replace('{div1}', div1);
                    alertopen({
                        image: "curios",
                        title: "부가 서비스없이 거래를 진행할까요?",
                        content: div,
                        hideCloseButton: false,
                        customFunction: js,
                    });
                    // $("#normalDealAlert, #normalDealOverlay").css('display', 'flex');
                } else {
                    var msg = "결제를 계속 진행하시려면 확인 버튼을 클릭하세요";
                    var alertcheck = content = '';
                    if (selltype == "buy") {
                        msg = "잠깐! 거래 사기 주의해주세요!";
                        content = '<h3>오픈 카카오톡, 디스코드, 서든라디오, 매렌지지</h3><p>등의 외부 메신저로 대화하신 경우<br>제3자 사기일 경우가 많으니 주의 해주시기 바랍니다.<p>';
                        alertcheck = "위 내용에 대하여 확인했습니다";
                    }
                    js += ";handleAlertClose();";
                    alertopen({
                        image:"curios",
                        title: msg,
                        content: content,
                        hideCloseButton: false,
                        customFunction: js,
                        alertcheck: alertcheck,
                    });
                }
            } else {
                alertopen({
                    image:"alert",
                    title: arr.msg,
                    hideCloseButton: true,
                    customFunction: "location.reload();",
                });
                loading(2);
            }
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
// 보증 설명 시작
function guarantee_info(){
    $("#guaranteeAlert, #guaranteeAlertOverlay").css("display", "flex");
    $('#guaranteeAlert').focus();

    // 모달 닫기
    $(document).on("click", ".guarantee_alert_close", guaranteeAlertClose);
}
function guaranteeAlertClose() {
    $(document).off('keyup');
    $("#guaranteeAlert, #guaranteeAlertOverlay").css("display", "none");
    $("#guaranteeAlert").blur();
}
// 보증 설명 종료
// 거래 제안 요청 시작
function proposaljs() {
    if (!orderbool) {
        alertopen({
	        image:"fail",
            title: "회원님의 물품입니다<br><br>본인 물품은 제안 요청이 불가 합니다",
            hideCloseButton: true,
        });
        return false;
    }
    var cate = '';
    if (thread == 'product') {
        var account_cate = category.split('r');
        cate = account_cate[0];
    } else {
        cate = category;
    };
    var str_url = strurl+"possibleList";
    loading(1);
    jQuery.ajax({
        type: "post",
        url : str_url,
        data : {cate:cate, thread:thread, number:productNumber, page:spage},
        success: function(data, status, xhr) {
            arr = JSON.parse(data);
            if( arr.code == 200 ) {
                if(arr.total == 0) {
                    alertopen({
                        image: "fail",
                        title: "해당 구매 물품에 맞는 판매 물품이 없습니다<br><br>제안 요청하실 물품을 먼저 등록해주세요",
                        checkButtonText : "물품등록",
                        closeButtonText : "확인",
                        customFunction : "window.open('/creation');"
                    })
                } else {
                    $("#proposal_mylists").html(arr.view);
                    $("#proposalAlert, #proposalAlertOverlay").css("display", "flex");
                    $('#proposalAlert').focus();
                    // 모달 닫기
                    $(document).on("click", ".proposal_alert_close", proposalAlertClose);
                }
            } else {
                alertopen({
                    image: "fail",
                    title: arr.msg,
                    hideCloseButton: true,
                });
            }
            loading(2);
        } 
    });
    


}
function proposalAlertClose() {
    $(document).off('keyup');
    $("#proposalAlert, #proposalAlertOverlay").css("display", "none");
    $("#proposalAlert").blur();
}
// 거래 제안 요청 종료
// 거래 제안 물품 선택 시작
function offerChoice(number) {
    var data = $("#mylists_contents_" + number).data();
    var title = data.title.split('||');

    proposalAlertClose();
    
    $("#offerAlert, #offerAlertOverlay").css("display", "flex");
    $('#offerAlert').focus();

    $('#offer_name').text(data.name);
    if(data.img) {
        $('#offer_img').attr("src", "/static/img/new/common/" + data.img )
    }
    if( data.rank == 'sae_conf' ) {
        $('#offer_rank').attr("src", "/static/img/new/mypage/rating_new.png" );
    } else if( data.rank == 'silver_conf' ){
        $('#offer_rank').attr("src", "/static/img/new/mypage/rating_silver.png" );
    } else if( data.rank == 'gold_conf') {
        $('#offer_rank').attr("src", "/static/img/new/mypage/rating_gold.png" );
    } else {
        $('#offer_rank').attr("src", "/static/img/new/mypage/rating_vip.png" );
    }
    for(var i=0; i < title.length; i++) {
        if(i == 0 ) {
            $("#offer_title1").text(title[i]);
        } else {
            $("#offer_title1").append(title[i]);
        }
    }
    $("#offer_title2").text(data.classname);
    $('#offer_date').text(data.date);
    if(!data.saletype) {
        $('#offer_quantity').html('<p><span>최소</span>' + data.minquantity + '</p>');
        $('#offer_quantity').append('<p class="maxquantity"><span>최대</span>' + data.maxquantity + '</p>');
        $('#offer_price').text(data.quantity + data.price + '원'); 
        $('#offer_price').append('<span><span>최소</span>' + data.price + '원</span>');        
    } else {
        $('#offer_quantity').text(data.quantity);
        $('#offer_price').text(data.price + '원');
    }
    $('#offer_mylists > div.offer_price > div > h3').text(data.price);
    $('#offer_mylists > div.offer_price > div > input').val(data.price);
 
    $('#offer_mylists').data('offernumber', data.number);
}
function offerAlertClose() {
    $(document).off('keyup');
    $("#offerAlert, #offerAlertOverlay").css("display", "none");
    $("#offerAlert").blur();
}
function offerAlertGoback() {
    spage = 1;
    $(document).off('keyup');
    $("#offerAlert, #offerAlertOverlay").css("display", "none");
    $("#offerAlert").blur();

    proposaljs();
}
// function normalAlertClose() {
//     // $(document).off('keyup');
//     $("#normalDealAlert, #normalDealOverlay").css("display", "none");
//     $("#normalDealAlert").blur();
// }
// function normalAlertCheck() {
//     normalAlertClose();
//     if(thread == 'product') {
//         paymentpwview(0);
//     } else {
//         paymentpwview(1);
//     }
//     // <?=($threadClass == 'account') ? 'paymentpwview(0)' : 'paymentpwview(1)'?>
// }
// 거래 제안 물품 선택 종료
function modaldupli() {
    if($("#commonAlert").css("display") == 'flex') {
        $("#offerAlert").css("z-index", "1001");
    }
    $("#common_alert_check").click(function(){
        $("#offerAlert").css("z-index", "1200");
    })
}
function offerCanceljs(num) {
    event.stopPropagation();

    alertopen({
        image: "curios",
        title: "제안 요청을 취소하시겠습니까?",
        customFunction: "offerCancel('"+num+"');"
    })
}
// 제안 요청 취소
function offerCancel(num) {
    loading(1);
    var offer_data = {
        type: 'del',
        productNumber: numberjs(productNumber),
        offernumber: num,
    };
    var str_url = strurl+"proposal";
    jQuery.ajax({
        type: "post",
        url : str_url,
        data : offer_data,
        success: function(data, status, xhr) {
            arr = JSON.parse(data);
            if( arr.code == 200 ) {
                alertopen({
                    image: "success",
                    title: arr.msg,
                    hideCloseButton: true,
                    customFunction: "spage = 1; proposalList(); offerAlertClose();",
                })
            } else {
                alertopen({
                    image: "fail",
                    title: arr.msg,
                    hideCloseButton: true,
                })
            }
            loading(2);
        } 
    });
}
// 거래 제안 요청
function offerjs() {
    event.stopPropagation();

    var offer_data = $("#offer_mylists").data();
    var price = $("#offer_totalprice").val();
    price = price.replace(/,/g, '');
    $('#offer_mylists').data('offerprice', price);

    if(!price || price == '0') {
        alertopen({
            image: "fail",
            title: "제안 가격을 입력해주세요",
            hideCloseButton: true,
        })
        modaldupli();
        return false;
    } else {
        loading(1);
        var str_url = strurl+"proposal";
        jQuery.ajax({
            type: "post",
            url : str_url,
            data: offer_data,
            success: function(data, status, xhr) {
                arr = JSON.parse(data);

                if( arr.code == 200 ) {
                    alertopen({
                        image: "success",
                        title: arr.msg,
                        hideCloseButton: true,
                        customFunction: "spage = 1; proposalList(); offerAlertClose();",
                    })
                } else if( arr.code == 100 ) {
                    alertopen({
                        image: "fail",
                        title: arr.msg,
                        hideCloseButton: true,
                    })
                } else {
                    alertopen({
                        image: "fail",
                        title: arr.msg,
                        closeButtonText: "확인",
                        closeFunction2: "handleAlertClose();",
                        checkButtonText: "제안물품확인",
                        customFunction: "location.href ='/product/view/"+arr.code+"';",
                    })
                }
                modaldupli();
                loading(2);
            }
        });
    }
}
function paymentjs(code) {
    if (!orderbool) {
        alertopen({
	        image:"fail",
            title: "회원님의 물품입니다.<br><br>본인 물품은 결제가 불가능 합니다",
            hideCloseButton: true,
        });
        return false;
    }
    var cnt = numberjs($("#barotemcnt").val());
    var max = numberjs($("#maxcnt").val());
    var min = numberjs($("#mincnt").val());
    var pay = numberjs($("#pay").val());
    if (min > max) {
        return alertopen({
	        image:"fail",
            title: "구매 가능 수량이 없습니다",
            hideCloseButton: true,
        });
    }
    if (cnt < min) {
        return alertopen({
	        image:"alert",
            title: "최소 수량보다 구매 수량이 작습니다",
            hideCloseButton: true,
        });
    }
    if (cnt > max) {
        return alertopen({
	        image:"alert",
            title: "최대 수량보다 구매 수량이 많습니다",
            hideCloseButton: true,
        });
    }
    var totalpay = $("#totalpay").text().replace(/,/g, '');

    var spay = 0;
    var mpay = 0;
    var day = 0;
    var type = '';
    var number = 0;
    if (code == 'account') {
        if ($("#account_contract").hasClass('on') ){
            number = $("#account_contract").data('number');
            // spay = $("#account_contract").data('pay');
            mpay = $("#account_contract").data('mpay');
            type = $("#account_contract").data('type');
        } else if ($("#addService_nm").hasClass('on') ) {
            number = $("#serviceday").data('number');
            // spay = $("#serviceday").data('pay');
            mpay = $("#serviceday").data('mpay');
            type = $("#serviceday").data('type');
            day = $("#serviceday").data('day');
        } else if ($("#addService_pm").hasClass('on') ) {
            number = $("#addService_pm").data('number'); 
            // spay = $("#addService_pm").data('pay');
            mpay = $("#addService_pm").data('mpay');
            type = $("#addService_pm").data('type');
        }
    } else if ($("#noaccount_guarantee").length > 0 ) {
        if ($("#noaccount_guarantee").hasClass('on') ) {
            number = $("#noaccount_guarantee").data('number'); 
            // spay = $("#noaccount_guarantee").data('pay');
            mpay = $("#noaccount_guarantee").data('mpay');
            type = $("#noaccount_guarantee").data('type');
        }
    }
    $("input[name=servicepay]").val(pay);
    $("input[name=serviceNumber]").val(number);
    $("input[name=serviceday]").val(day);
    $("input[name=signType]").val(type);

    msg = '';
    if ($(".right_addservice").length > 0) {
        if ($(".right_addservice > .on").length == 0) {
            return alertopen({
                image: "curios",
                title: "부가 서비스를 선택하지 않았어요",
                content: "안전을 위해 부가 서비스를 추천드려요",
                hideCloseButton: true,
                customFunction : 'serverblink()',
            });
        }
        if ($("#addService_nm").hasClass('on') && $("#serviceday").data('day') == '0') {
            return alertopen({
                image: "alert",
                title: "보증기간을 선택해주세요",
                hideCloseButton: true,
            });
        }
    }
    if (totalpay > point && selltype == "sell" ) {
        return alertopen({
            image: "alert",
            title: "회원님의 마일리지가 부족합니다",
            hideCloseButton: true,
            customFunction: "window.open('/mileage')",
        });
    }
    cart(code);
}
function payment(code){
    if ($("#chrName").length > 0) {
        if ($("#chrName").val().length == "") return alertopen({
	        image:"alert",
            title: "거래 캐릭터명을 입력해주세요",
            hideCloseButton: true,
        });
        $("input[name=chrName]").val($("#chrName").val());
    }
    var spay = 0;
    var mpay = 0;
    var msg2 = '';
    if ($(".order_add_service").length > 0) {
        if ($(".order_add_service > .on").length == 0) {
            return alertopen({
                image:"alert",
                title: "부가 서비스를 선택하지 않았어요",
                hideCloseButton: true,
            });
        }
        spay = $(".order_add_service > .on").data("pay");
        mpay = $(".order_add_service > .on").data("mpay");
        type = $(".order_add_service > .on").data("type");
        if (mpay == "0") {
            if (type == "w3") return alertopen({
                image:"alert",
                title: "보증기간을 선택해주세요",
                hideCloseButton: true,
            });
            if (type == "w1") return alertopen({
                image:"alert",
                title: "보증기간 또는 보증금액을 입력해주세요",
                hideCloseButton: true,
            });
        }
        spay = Number(spay);
        mpay = Number(mpay);
        $("input[name=servicepay]").val(spay);
        $("input[name=serviceNumber]").val($(".order_add_service > .on").data("number"));
        $("input[name=selloptchk]").val($(".order_add_service > .on").data("optchk"));
        $("input[name=serviceday]").val($(".order_add_service > .on").data("day"));
        $("input[name=signType]").val(type);
        if (spay == 0) {
            msg2 = '전자계약서 및 보증서비스를 선택하지 않으셨습니다<br><br>';
        }
    }
    if (cartbool && (pay + mpay) > point && selltype == "sell") return alertopen({
	        image:"alert",
            title: "회원님의 마일리지가 부족합니다",
            hideCloseButton: true,
            customFunction: "window.open('/mileage')",
	        // customFunction: 'location.reload()',
        });
    if (!cartbool && mpay > point) return alertopen({
        image:"alert",
        title: "회원님의 마일리지가 부족합니다",
        hideCloseButton: true,
        customFunction: "window.open('/mileage')",
        // customFunction: 'location.reload()',
    });
    js = 'paymentpwview()';
    // if (code == "gift")  js = 'passview()';
    var msg = "결제"
    if (selltype == "buy") msg = "판매";
    if (!cartbool) msg	= "결제";
    msg += "를 계속 진행하시려면 확인 버튼을 클릭하세요";
    userPassjs = "savePayment()";
    alertopen({
        image:"curios",
        title: msg2 + msg,
        hideCloseButton: false,
        customFunction: js,
    });
}

function savePayment(){
    var f = $('#frm1');
    var actionData = f.serialize();
	var str_url	= strurl+"payment";
    if (!cartbool) str_url	= strurl+"upPayment";
	jQuery.ajax({
		type: "post",
		url : str_url,
		data: actionData,
		success:function(data, status, xhr){
            arr = JSON.parse(data);
            if (arr.code == 200) {
                location.href = arr.url;
            } else {
                var js = (arr.msg.indexOf("마일리지가 부족합니다.") == -1)? "location.reload();":"window.open('/mileage')";
                alertopen({
                    image:"alert",
                    title: arr.msg,
                    hideCloseButton: true,
                    customFunction: js,
                });
                loading(2);
            }
		},
		error : function(request, status, error) {
			alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
            loading(2);
		}
	});
}
// 추가서비스 함수
function noChoicejs() {
    var pay = numberjs($("#no_addservice").data('pay'));
    var cnt = numberjs($("#barotemcnt").val());

    pay = pay * cnt;

    $("#totalpay").html(comma(pay) + '<span>원</span>');
    $('#serviceday').attr('data-day', 0);
}
function contractjs() {
    var pay = numberjs($("#account_contract").data('pay'));
    var mpay = $("#account_contract").data('mpay');
    var retpay = pay + mpay;

    $("#totalpay").html(comma(retpay) + '<span>원</span>');
}
function premiumjs() {

    var pay = numberjs($("#addService_pm").data('pay'));
    var ipay = $("#addService_pm").data('ipay');
    var percent = $("#addService_pm").data('perc');

    var premiumpay = 0;
    premiumpay = (pay * (percent / 100)) + ipay;
    premiumpay = parseInt(premiumpay);
    var retpay = premiumpay + pay;

    $("#totalpay").html(comma(retpay) + '<span>원</span>');
    $('#addService_pm').attr('data-mpay', premiumpay);
    $('#addService_pm').data('mpay', premiumpay);
}
function normaljs() {
    event.stopPropagation();

    var pay = numberjs($("#serviceday").data('pay'));
    var mpay = numberjs($("#serviceday").data('mpay'));

    var day = numberjs($("#serviceday option:selected").val());

    $('#serviceday').data('day', day);
    if ( day == 0) {
        $(".nm_pay").html(comma(mpay)+"원 / 1개월");

        $("#totalpay").html(comma(retpay) + '<span>원</span>');
    } else {
        var contractpay = $("#serviceday").data('mpay');
        var normalpay = day * contractpay;
        var retpay = normalpay + pay;
        
        $(".nm_pay").html(comma(mpay * day)+"원 / "+ day +"개월");
        $('#serviceday').attr('data-ipay', contractpay);
        $("#totalpay").html(comma(retpay) + '<span>원</span>');
    }
}
function noaccountjs()  {
    var pay = numberjs($("#noaccount_guarantee").data('pay'));
    var cnt = numberjs($("#barotemcnt").val());
    var percent = numberjs($("#guarantee_percent").text());
    
    var pay = pay * cnt;
    var noaccountpay = pay * (0.01 * percent);
    noaccountpay = parseInt(noaccountpay);
    var retpay = pay + noaccountpay;

    var retpay = comma(retpay);
    $("#totalpay").html(comma(retpay) + '<span>원</span>');
}
function totalpay(){
    var spay = numberjs($(".order_add_service > .on").data("mpay"));
    var txt = $(".order_add_service > .on").text();
    $(".content_right_commission span").html(txt);
    var tpay = pay + spay;
    if (!cartbool) {
        tpay = spay;
    }
    $("#service").html(comma(spay)+"원");
    $("#totalpay").html(comma(tpay)+"원");
}

function servicejs() {
    var day = $("#serviceday").val();
    var paychk = false;
    if ($("#divpay").hasClass("di_no_i")) {
        paychk = true;
    }
    if (paychk) {
        if (day == 0) {
            $(".order_add_service > .on").data("day",0);
            $(".order_add_service > .on").data("mpay",0);
        } else {
            var pay = numberjs($(".order_add_service > .on").data("ipay"));
            var tt = day * pay;
            $(".order_add_service > .on").data("day",day);
            $(".order_add_service > .on").data("mpay",tt);
        }
    } else {
        var pay = numberjs($("#servicepay").val());
        $(".order_add_service > .on").data("number",0);
        $(".order_add_service > .on").data("day",0);
        $(".order_add_service > .on").data("pay",0);
        $(".order_add_service > .on").data("mpay",0);
        if (day != 0 && pay != 0) {
            var optdata = '';
            $(sellopt).each(function(i,opt){
                if (opt.price >= pay) {
                    optdata = opt;
                    return false;
                }
            });
            if (optdata != "") {
                var mpay = hpay = number = 0;
                days = "6m";
                if (day > 18) {
                    days = "24m";
                } else if (day > 12) {
                    days = "18m";
                } else if (day > 6) {
                    days = "12m";
                }
                for (var key in optdata){
                    if (key == "number") number = optdata[key];
                    if (key == "pay") mpay = optdata[key];
                    if (key == days) hpay = optdata[key];
                }
                var gpay = ((pay * hpay * day) / 100) + mpay;
                gpay = Math.floor(gpay);
                $(".order_add_service > .on").data("day",day);
                $(".order_add_service > .on").data("pay",pay);
                $(".order_add_service > .on").data("mpay",gpay);
                $(".order_add_service > .on").data("number",number);
            }
        }
    }
    totalpay();
}
function successjs(no) {
    // $(".order_dropdown > img").on("click", ".order_info", function(e){
    //     if($(this).hasClass("active") == false) {
    //         $(".order_info").removeClass("active");
    //         $(this).addClass("active");
    //     }
    // });
    // $(".order_dropdown > img").on("click", function(){
    //     $(".order_info").addClass("active");
    // });
    // if( no == 1) {
    //     $(".order_info").addClass("active");
    //     alert('123');
    //     if( $(".order_info").hasClass('active') ) {
    //         $(".order_info").removeClass("active");
    //         alert('456');
    //     }
    // }
}
function servicemaxpay(obj){
    var aa = numberjs($(obj).val());
    if (aa > 0) {
        if (aa < optminpay) {
            $(obj).val('');
            alertopen({
	        image:"alert",
            title: "보증 최소금액은 "+comma(optminpay)+"원입니다",
            hideCloseButton: true,
        });
        } else if ((pay * optmaxpay) < aa) {
            $(obj).val(comma(pay * optmaxpay));
            alertopen({
	        image:"alert",
            title: "보증금액은 결제금액의 "+optmaxpay+"배를 초과 하실 수 없습니다",
            hideCloseButton: true,
        });
        } else {
            if ( aa % payunit != 0 ) {
                $(obj).val('');
                alertopen({
	        image:"alert",
            title: "판매금액을 "+payunit+"원 단위로 입력해주세요",
            hideCloseButton: true,
        });
            }
        }
    }
    servicejs();
}

function openview(appImg) {
    var productname = $(".view_header").text();
    var re = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
    productname = productname.replace(re, "");
    var gg = productNumber+"|"+appImg+"|"+productname;
    var arr = '';
    var ff = ycommon.getCookie('barotemproduct');
    if (ff != "") {
        var words = ff.split(',');
        var s = 0;
        for (var i = 0 ; i < words.length; ++i) {
            var dd = words[i].split('|');
            if (Number(dd[0]) != productNumber) {
                if (arr != '') arr += ",";
                arr += dd[0]+"|"+dd[1]+"|"+dd[2];
                ++s;
                if (s == 5) return false;
            }
        }
        if (arr != '') arr = ","+arr;
    }
    gg += arr;
    ycommon.setCookie('barotemproduct',gg,1);
}

function Zzimjs(obj){
    event.stopPropagation();
    var stats = $(obj).data('class');
    if (stats != '') {
        alertopen({
            image:"alert",
            title: '찜이 가능한 물품이 아닙니다',
            hideCloseButton: true,
        });
    } else {
        loading(1);
        var dl = $(obj).parents('a');
        var number = dl.attr('id');
        var action = strurl+'zzim';
        var src = $(obj).attr("src");
        jQuery.ajax({
            type: "post",
            url : action,
            data: {num:number},
            success:function(data, status, xhr){
                arr = JSON.parse(data);
                if (arr.status == 'add') {
                    $(obj).attr("src",src.replace('.png',"_on.png"));
                } else if (arr.status == 'del') {
                    $(obj).attr("src",src.replace('_on.png',".png"));
                }
                if (arr.msg.length > 0) {
                    alertopen({
                        image:"alert",
                        title: arr.msg,
                        hideCloseButton: true,
                    });
                }
                loading(2);
            },
            error : function(request, status, error) {
                alert("code:"+request.status+"\nmessage:"+request.responseText+"\nerror:"+error);
                loading(2);
            }
        });
        return false;
    }
}

function tcashqr(qr) {
    
    var options = {
        // render method: 'canvas', 'image' or 'div'
        render: 'canvas',
        // version range somewhere in 1 .. 40
        minVersion: 1,
        maxVersion: 40,
        // error correction level: 'L', 'M', 'Q' or 'H'
        ecLevel: 'L',
        // offset in pixel if drawn onto existing canvas
        left: 0,
        top: 0,
        // size in pixel
        size: 115,
        // code color or image element
        fill: '#000',
        // background color or image element, null for transparent background
        background: null,
        // content
        // corner radius relative to module width: 0.0 .. 0.5
        radius: 0,
        // quiet zone in modules
        quiet: 0,
        // modes
        // 0: normal
        // 1: label strip
        // 2: label box
        // 3: image strip
        // 4: image box
        mode: 0,
        mSize: 0.1,
        mPosX: 0.5,
        mPosY: 0.5,
        label: 'no label',
        fontname: 'sans',
        fontcolor: '#000',
        image: null,
        text: qr
    }
    $(".gift_qr").qrcode(options);
}
function serverblink() {
    $(".right_header > div").addClass("blink30");
    $(".right_header > div > h3").addClass("co_R");
    $(".right_addservice > div").addClass("lists_product_premium");
    $('body').animate({scrollTop :0},200);
}
function chatnot() {
    alertopen({
        image:"fail",
        title: "채팅이 제한된 물품입니다",
        hideCloseButton: true,
    });
}

function certification() {
    $(".modifycertification").show();
    loading(2);
}

function kcpopne(url) {
    window.open( '/'+url+'?groupKey='+groupKey, 'kcbPop', 'left=200, top=100, status=0, width=490, height=790,scrollbar=yes' );
}

function certificationclose() {
    groupKey = '';
    $(".background").addClass('di_no');
    $(".modifycertification").hide();
}