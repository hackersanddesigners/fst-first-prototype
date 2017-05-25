// THINGS TO DO:
// - Fix floor problem with percentage Math
// - Pull totalCount out using Promise
// - Add all available texts


var staticTexts = {
  'Language of Publication':            'The filter Language of publication refers to the predominant language of a publication*. It is an interesting filter to consider in the light of our question: Why are the authors of the books I read so white, so male, so Eurocentric?, because it shows how difficult is is to make conclusions about race and nationality of the author on the basis of the language of an item. Despite those shortcomings, this filter clearly reflects that English remains the dominant language of global scholarly publishing, with 81,52% of the items of this data set being published in English. This highlights a linguistic monoculture, that scholars such as Gloria E. Anzaldúa have long tried to criticize and attempted to intervene in. Additionally, the fact that English, Dutch, French, Italian and German are the five most frequent languages of publication is – despite of the occurrence of some of these languages in different geographical contexts – still very telling for how our Western knowledge economy functions.*This filter is an interpretation of the MARC 21 tag 008 - Fixed-Length Data Elements character positions 35-37 - Language.',
  'Place of publication':               'This filter refers to the country, in which a work has been published.* It is an interesting filter, as it shows the geographical locations, around which current global scholarly publishing centres. The most frequently named locations in this context are the United States, with New York, and the United Kingdom, with London and Cambridge.',
  'Gender':                             'The information regarding gender of an author is information, which the Utrecht University library cannot provide access to, as the information is stored in a separate data base – for which they do not possess direct access – with ‘authority files’, which include more detailed information regarding the gender and nationality of an author. For the data set of the Feminist Search Tool, Hackers & Designers have  linked our data set to Wikidata to nonetheless obtain this information. Possible flaws that come with this linking of the two data sets, is that wikidata attributes gender on the basis of the name. Self-narration, particularly important when it comes to trans* and non-binary identities, unfortunately aren’t included in this data set, which might lead to misrepresentations.',
  'Multiple languages':                 'The filter Multiple languages refers to those publications that are multilingual and/or for which no predominant language of publication can be identified*. This is an interesting filter, as it challenges the linguistic monoculture of English as the language of global scholarly publishing.*This filter is an interpretation of the MARC 21 tag 008 - All Materials (NR), character positions 35-37, subfield code ‘mul’ and tag 041 - Language Code (R) including those items marked as "mul".',
  'Translated Work':                    'This filter refers to those publications that either are or include a translation. Hereby, it is interesting to check not only the number of works that are published as translated works, but also what the original language, and the target language of the item is (see filter Original language). This filter is an interpretation of the MARC 21 field 041 - Language Code (R) and indicator 1.',
  'Original language':                  'This filter refers to the original language of a publication*. This field only needs to be filled in if the publication is/or includes a translation. This would suggest that through this filter one could make conclusions about the original language of a translated work. However, given that this field also refers to those items simply including translations and/or could be filled in accidently, it is important to bear in mind that the results of this filter could also be misleading. *This filter is an interpretation of the MARC 21 tag 041 - Language Code (R) and combines the first indicator 1 and subfield code h - $h - Language code of original (R).',
  'Manufacturer':                       'This filter refers to the producing entity of a publication.* It might be used interchangeably with the publisher of a publication, because not all MARC 21 tags make a clear distinction between the publisher and the manufacturer of an item. *This field is an interpretation of  tag 260 - Publication, Distribution, etc. (Imprint) (R), subfield code $f - Manufacturer (R) and/or tag 264 - Production, Publication, Distribution, Manufacture, and Copyright Notice (R), subfield code $b - Name of producer, publisher, distributor, manufacturer (R).'
}

var facetArray = [
  ['Language of publication',                               'language_code_t'],
  ['Language of the item (Predominant language)',           'a_language_code_t'],
  ['Multiple languages',                                    'a_language_code_t', 'count_a_language_code_i:[2 TO *]'],
  ['Translated item (Item is or includes a translation)',   'h_language_code_t', 'h_language_code_t:*'],
  ['Original language (of translated item)',                'a_language_code_t'],
  ['Place of publication',                                  'a_geographic_area_code_t', 'a_geographic_area_code_t:*'],
  ['Multiple languages',                                    'a_language_code_t', 'count_a_language_code_i:[2 TO *]'],
  ['Country of Publishing/Producing entity',                'a_publishing_country_t'],
  ['Multiple places',                                       'a_publishing_country_t', 'count_a_publishing_country_i:[2 TO *]'],
  ['Publisher',                                             'b_imprint_s'],
  ['Manufacturer',                                          'f_imprint_s'],
  ['Time period of Publication',                            'c_imprint_s'],
  ['Date of publication',                                   'copyright_s'],
  ['(Personal) Information about the author',               'a_creator_characteristics_t'],
  ['Profession of the author',                              'e_personal_name_t'],
  ['Titles held by the author',                             'c_personal_name_t'],
  ['Authors dead/alive',                                    'death_d_personal_name_t', 'birth_d_personal_name_t'],
  ['Gender',                                                'gender_s']
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

  $.when(

    $.get(url, function(res) {

      var data = JSON.parse(res);
      var totalCount = data.response.numFound;
      console.log("total count: " + totalCount);
      var facets = data.facet_counts.facet_fields[ code ];

    })

  ).then(function(){

    var facets = data.facet_counts.facet_fields[ code ];
    console.log( facets );
    var percentage1 = (facets[1] / 100) * 100;
    var percentage2 = (facets[3] / 100) * 100;
    var percentage3 = (facets[5] / 100) * 100;
    var percentage4 = (facets[7] / 100) * 100;
    var percentageA = Math.round(percentage1 * 100) / 100;

    $('.results-answer-box').append('</br></br><p>Search question related to <span id=' + code + ' class="result-topic" onclick="topicDisplay(this)" data-topicval="' + top + '" data-topic="' + top + '">' + top + '</span></p></br><div class="sans"><p><span class="percentage">' + percentageA + '%</span> in <span class="upper">' + facets[0] + '</span></br><span class="percentage">' + percentage2 + '%</span> in <span class="upper">' + facets[2]+ '</span></br><span class="percentage">' + percentage3 + '%</span> in <span class="upper">' + facets[4] + '</span></br><span class="percentage">' + percentage4 + '%</span> in <span class="upper">' + facets[6] + '</span></div>');

  });

};


var topicDisplay = function(e) {
  var a = e.getAttribute("data-topicval");
  var g = e.getAttribute("data-topic");
  var r = staticTexts[a];
  console.log(r);

  $('.sidebar-text-container').html('<div class="sidebar-text serif"><p>Search question related to <span>' + g + '</span>:</p></br><p>' + r + '</p></div>');

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
    mainSearch($('input[name=searchf]').val());

  });

});
