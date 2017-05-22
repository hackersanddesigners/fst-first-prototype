var staticTexts = {
  'language_code_t': "Lorem ipsum....",
  'publishing_country_t': "Lorem ipsum",
}

// var facetTopics = {
//   'Language of Publication': 'language_code_t',
// }


var doSearch = function(facet, str) {
  console.log("Do the search: " + str);

  $.get('http://localhost:8888/solr?rows=0&facet=true&facet.field=' + facet + '&q=' + str, function(res) {
    var data = JSON.parse(res);
    var totalCount = data.response.numFound;
    console.log("total count: " + totalCount);
    var facets = data.facet_counts.facet_fields[facet];

    for(var i = 0; i < facets.length; i++) {
      console.log(facets[i]);
      // Show search results....

    }


    if ( totalCount == 0 ){

      $('.results-container').html('<div class="results-title serif"><p>Results:</p></div>');
      $('.results-container').append('</br><div class="results-records serif"><p>There were no records found for: <span class="sans results-subject">"' + str + '"</span>');

    } else{

      $('.results-container').html('<div class="results-title serif"><p>Results:</p></div>');

      // X Records for Y
      $('.results-container').append('</br><div class="results-records serif"><p><span class="sans results-answer">'+ totalCount +'</span> records found for: <span class="sans results-subject">"' + str + '"</span></br>');

      var percentage1 = Math.floor((facets[1] / totalCount) * 100);
      var percentage2 = Math.floor((facets[3] / totalCount) * 100);
      var percentage3 = Math.floor((facets[5] / totalCount) * 100);
      var percentage4 = Math.floor((facets[7] / totalCount) * 100);

      // Of which %
      $('.results-container').append('</br><div class="results-answer-box serif"><p>Of which:</p><p>Search question related to <span class="result-topic">language</span></p></br><div class="sans"><p>' + percentage1 + '% in ' + facets[0] + '</br>' + percentage2 + '% in ' + facets[2]+ '</br>' + percentage3 + '% in ' + facets[4] + '</br>' + percentage4 + '% in ' + facets[6]);

    }


  });
};

$(document).ready(function(){

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
    doSearch('a_language_code_t', $('input[name=searchf]').val());

  });

});
