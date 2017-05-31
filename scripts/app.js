// THINGS TO DO:
// - Fix floor problem with percentage Math
// - Pull totalCount out using Promise
// - Add all available texts

var facetArray = [
  ['Predominant language', 'fixed_lang_t'],
/*  ['Language of the item', 'a_language_code_t'], */
  ['Multiple languages', 'a_language_code_t', 'count_a_language_code_i:[2 TO *]'],
  ['Translated work', 'h_language_code_t', 'h_language_code_t:*'],
  ['Original language', 'a_language_code_t'],
  ['Place of publication', 'a_geographic_area_code_t', 'a_geographic_area_code_t:*'],
  ['Country of Publishing', 'a_publishing_country_t'],
  ['Multiple places', 'a_publishing_country_t', 'count_a_publishing_country_i:[2 TO *]'],
  ['Publisher', 'b_imprint_s'],
  ['Manufacturer', 'f_imprint_s'],
  ['Date of publication (part 1)', 'c_imprint_s'],
  ['Date of publication (part 2)', 'copyright_s'],
  ['(Personal) Information about the author', 'a_creator_characteristics_t'],
  ['Relator term', 'e_personal_name_t'],
  ['Titles held by the author', 'c_personal_name_t'],
  ['Authors dead or alive', 'death_d_personal_name_t', 'birth_d_personal_name_t'],
  ['Gender', 'gender_s']
];



var mainSearch = function(str) {
  console.log("Do the search: " + str);

  var defs = [];
  for(var i = 0; i < facetArray.length; i++) {
    var facetTopic = facetArray[i][0];
    var facetCode  = facetArray[i][1];
    var facetPred  = facetArray[i][2];
    defs.push(facetSearch(facetCode, facetTopic, facetPred, str));
  }

  var totalCount = 0

  $.when.apply($, defs).then(function() {
    $('.terms').hide();
    $('.results-subject').html(str);
    for(var i = 0; i < arguments.length; i++) {
      var data = JSON.parse(arguments[i][0]);
      console.log(data);
      totalCount += data.response.numFound;
      appendResult(data);
    };
    showTotal(totalCount);
    $('.results-container').show();

    $('.ellipse').click(function(e) {
      console.log('clicked ellipse');
      console.log(e.target);
      $(e.target).parent().siblings('.expandable').show();
      $(e.target).parent().hide()
    })
  });
};

var facetSearch = function(code, top, pred, str) {

  var url = 'http://' +
    window.location.host +
    '/solr?rows=0&facet=true&facet.field=' + code +
    '&top=' + top +
    '&q=' + str;

  if(pred) { url += ' AND ' + pred; }
  console.log(url);
  return $.get(url);
};

var showTotal = function(totalCount) {
  $('.results-answer').html(totalCount);
};

var appendResult = function(data) {
  var code = Object.keys(data.facet_counts.facet_fields)[0];
  var facets = data.facet_counts.facet_fields[code];
  var top = data.responseHeader.params.top;
  var numFound = data.response.numFound;

  var html = '';

  if(facets[1] > 0) {
    html += '<div><br/><br/><p>Search question related to <span id=' + code + ' class="result-topic" onclick="topicDisplay(this)" data-topicval="' + top + '" data-topic="' + top + '">' + top + '</span></p><br/>';

    for(var i = 0; facets[i+1] > 0; i += 2) {
      var p = facets[i+1];
      html += '<div class="sans' + (i > 7 ? ' expandable' : '') + '"><p><span class="percentage">' + p + '</span> in <span class="upper">' + facets[i] + '</span><br/></div>';
    }

    if(facets.length > 7 && facets[9] > 0) {
      html += '<div class="sans ellipse"><p>...</p></div>';
    }
  }
  html += '</div>';
  $('.results-answer-box').append(html);
    
};

var topicDisplay = function(e) {
  var a = e.getAttribute("data-topicval");
  var g = e.getAttribute("data-topic");

  $.get('/assets/'+a+'.html', function( data ) {
    $('.sidebar-text-container').html('<div class="sidebar-text serif"><p>Search question related to <span>' + g + '</span>:</p></br><p>' + data + '</p></div>');
  });

  $('.sidebar-left').animate({
    left: 0
  }, 200);

};

$(document).ready(function(){

  $('.result-topic').click(function(){
    console.log('worked');
  });

  $('.menu-butt').click(function(){
    $('.menu').css('display', 'block');
    $('.purple').css('display', 'none');
    // STOP SCROLLING
    $('body').css('position', 'fixed');
  });

  $('#menu-close').click(function(){
    $('.menu').css('display', 'none');
    $('body').css('position', 'static');
  });

  $('.title-text-underline').click(function() {
    var att = $(this).attr('value'),
        typ = '#info-' + att;
    $(typ).css('display', 'block');
  });

  $('.menu-select').click(function(){
    var att = $(this).attr('value'),
        typ = '#info-' + att;

    if ( att == 0 ){
      $('.menu').css('display', 'none');
      $('body').css('position', 'static');
    } else {
      $('.menu').css('display', 'none');
      $(typ).css('display', 'block');
    }

  });

  // SIDEBAR
  $('.sidebar-close').click(function(){
    var mobCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if ( mobCheck ){
      var w = $(window).width() - 20;
      $('.sidebar-left').animate({
        left: w
      }, 200);
    } else {
      $('.sidebar-left').animate({
        left: -580
      }, 200);
    }
  });

  $( window ).resize( function() {
    $('.sidebar-left').css('left', 'calc(-90% - 20px);');
    console.log('test');
  });

  // SEARCH
  $('input[type=submit]').click(function(e) {
    e.preventDefault();
    $('.results-answer-box').html('');
    mainSearch($('input[name=searchf]').val());
  });

  $(window).scroll(function(e) {
    if($('.scroll-top').offset().top > 20) $('.scroll-top').show();
    else $('.scroll-top').hide();
  });

  $('.scroll-top').click(function(e) {
     $(window).scrollTop(0);
  });

});

