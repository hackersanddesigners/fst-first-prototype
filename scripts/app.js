var doSearch = function(facet, str) {
  console.log("Do the search: " + str);

  // language_code_t
  // publishing_country_t
  //

  $.get('http://localhost:8983/solr/query?rows=0&facet=true&facet.field=' + facet + 'q=' + str, function(data) {
    console.log(data);
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

  $('input[type=submit]').click(function(e) {
    e.preventDefault();
    doSearch('language_code_t', $('input[name=searchf]').val());
  });

});
