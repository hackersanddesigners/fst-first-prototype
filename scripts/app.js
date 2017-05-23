// THINGS TO DO:
// - Move totalCount out from second function into new
// - Attach staticTexts object to html() function under topicDisplay()


var staticTexts = {
  'language_code_t': "Lorem ipsum....",
  'publishing_country_t': "Lorem ipsum",
}

var facetArray = [
  ['Language',                'language_code_t'],
  ['Birth Name of Author',    'birth_d_personal_name_t'],
  ['Geographic Area',         'a_geographic_area_code_t'],
  ['Translated item (Item is or includes a translation)', 'h_language_code_t'],
  ['Place of publication', 'a_geographic_area_code_t'],
  ['Multiple languages', 'a_language_code_t', 'count_a_language_code_i:[2 TO *]']
];



var mainSearch = function(str) {
  console.log("Do the search: " + str);

  $('.results-container').html('<div class="results-title serif"><p>Results:</p></div>');

  // X Records for Y
  $('.results-container').append('</br><div class="results-records serif"><p><span class="sans results-answer">'+ '1111' +'</span> records found for: <span class="sans results-subject">"' + str + '"</span></p></div></br><div class="results-answer-box serif"><p>Of which:</p>');

  // facetArrayTEST.forEach(function(el) {
  for(var i = 0; i < facetArray.length; i++) {

    var facetTopic = facetArray[i][0];
    var facetCode  = facetArray[i][1];
    var facetPred  = facetArray[i][2];

    facetSearch(facetCode, facetTopic, facetPred, str);

  }

  $('.results-container').append('</div></div>');

};


var facetSearch = function(code, top, pred, str) {
  var url = 'http://' + window.location.host + '/solr?rows=0&facet=true&facet.field=' + code + '&q=' + str;

  if(pred) {
   url += ' AND ' + pred;
  }
  console.log(url);

  $.get(url, function(res) {

    var data = JSON.parse(res);
    var totalCount = data.response.numFound;
    console.log("total count: " + totalCount);
    var facets = data.facet_counts.facet_fields[ code ];

    // SHOW RESULTS
    // for(var i = 0; i < facets.length; i++) {
    //   console.log(facets[i]);
    // }

    var percentage1 = Math.floor((facets[1] / totalCount) * 100);
    var percentage2 = Math.floor((facets[3] / totalCount) * 100);
    var percentage3 = Math.floor((facets[5] / totalCount) * 100);
    var percentage4 = Math.floor((facets[7] / totalCount) * 100);

    $('.results-answer-box').append('</br></br><p>Search question related to <span id=' + code + ' class="result-topic" onclick="topicDisplay(this)" data-topicval="' + code + '" data-topic="' + top + '">' + top + '</span></p></br><div class="sans"><p><span class="percentage">' + percentage1 + '%</span> in <span class="upper">' + facets[0] + '</span></br><span class="percentage">' + percentage2 + '%</span> in <span class="upper">' + facets[2]+ '</span></br><span class="percentage">' + percentage3 + '%</span> in <span class="upper">' + facets[4] + '</span></br><span class="percentage">' + percentage4 + '%</span> in <span class="upper">' + facets[6] + '</span></div>');

  }).fail(function(e) {
    console.log("FAIL?!?!?!? " + JSON.stringify(e));
  });

};


var topicDisplay = function(e) {
  var a = e.getAttribute("data-topicval");
  var g = e.getAttribute("data-topic");
  var r = staticTexts[a];
  console.log(r);

  $('.sidebar-text-container').html('<div class="sidebar-text serif"><p>Search question related to <span>country of publishing</span>' + r + '</p></div>');

  $('.sidebar-left').animate({
    left: 0
  }, 200);

};



$(document).ready(function(){

  $('iframe').attr('src', 'https://' + window.location.host + '/ep');

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

  $('.menu-select').click(function(){
    var att = $(this).attr('value'),
        typ = '#info-' + att;

    if ( att == 0 ){
      $('.menu').css('display', 'none');
      $('body').css('position', 'static');
      console.log('yep');
    } else {
      $('.menu').css('display', 'none');
      $(typ).css('display', 'block');

      console.log('nope');
    }

  });

  // SIDEBAR
  $('.sidebar-close').click(function(){
    $('.sidebar-left').animate({
      left: -580
    }, 200);
  });

  // SEARCH
  $('input[type=submit]').click(function(e) {
    e.preventDefault();
    mainSearch($('input[name=searchf]').val());

  });

});
