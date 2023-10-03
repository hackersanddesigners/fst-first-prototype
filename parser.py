import sys
import os
from pathlib import Path
import xml.etree.ElementTree
import re
import json
import urllib.request


'''
language_code_t    Language of publication
fixed_lang_t

a_language_code_t    Language of the item (Predominant language)
count_a_language_code_i:[2 TO *], a_language_code_t    Multiple languages
h_language_code_t:*, h_language_code_t    Translated item (Item is or includes a translation)
a_language_code_t    Original language (of translated item)

a_geographic_area_code_t:*, a_geographic_area_code_t    Place of publication
a_imprint_s
fixed_place_t

a_publishing_country_t Country of Publishing/Producing entity
count_a_publishing_country_i:[2 TO *], a_publishing_country_t    Multiple places
b_imprint_s    Publisher
f_imprint_s    Manufacturer
c_imprint_s    Time period of Publication
copyright_s    Date of publication

a_creator_characteristics_t    (Personal) Information about the author
e_personal_name_t    Profession of the author
c_personal_name_t    Titles held by the author

birth_d_personal_name_t, death_d_personal_name_t   Authors dead/alive

gender_s    Gender
    Gender of the author

Ideas maybe when further developing the Search Tool:

Terms for which there are only a few entries:

    Associated country

    Intended audience

    Creator/Contributor group category


Terms for which their meaning/presence in the data sheet is not entirely clear to me yet:

    Geograhic areas associated with an item
'''



attrs = {
  "22":  "target_audience_t", # "Target audience",
  "041": "language_code_t", # "Language Code",
  "043": "geographic_area_code_t", # "Geographic Area Code",
  "044": "publishing_country_t", # "Country of Publishing/Producing Entity Code",
  "052": "geographic_classification_t", # "Geographic Classification",
  "100": "personal_name_t", # "Main Entry-Personal Name",
  "245": "title_statement_t", # "Title statement",
  "257": "producing_country_t", # "Country of Producing Entity",
  "260": "imprint_s", # "Publication, Distribution, etc. (Imprint)",
  "264": "copyright_s", # "Production, Publication, Distribution, Manufacture, and Copyright Notice",
  "355": "security_classification_t", # "Security Classification Control",
  "357": "originator_dissemination_t", # "Originator Dissemination Control",
  "370": "associated_place_t", # "Associated Place",
  "377": "associated_language_t", # "Associated Language",
  "385": "audience_characteristics_t", # "Audience Characteristics",
  "386": "creator_characteristics_t", # "Creator/Contributor Characteristics",
  "546": "language_note_t", # "Language Note",
  "765": "original_language_t", # "Original Language Entry",
  "767": "translation_entry_t" #"Translation Entry"
}

descs = {
  "008": "Fixed Length Field",
  "22":  "Target audience",
  "041": "Language Code",
  "043": "Geographic Area Code",
  "044": "Country of Publishing/Producing Entity Code",
  "052": "Geographic Classification",
  "100": "Main Entry-Personal Name",
  "245": "Title statement",
  "257": "Country of Producing Entity",
  "260": "Publication, Distribution, etc. (Imprint)",
  "264": "Production, Publication, Distribution, Manufacture, and Copyright Notice",
  "355": "Security Classification Control",
  "357": "Originator Dissemination Control",
  "370": "Associated Place",
  "377": "Associated Language",
  "385": "Audience Characteristics",
  "386": "Creator/Contributor Characteristics",
  "546": "Language Note",
  "765": "Original Language Entry",
  "767": "Translation Entry"
}

def store_name(rec):
  try:
    print(rec)
    # Add it to the database so we don't make multiple requests for names we already know - JBG
    req = urllib.request.Request('http://localhost:8983/solr/name2gender/update')
    req.add_header('Content-Type', 'application/json')
    res = urllib.request.urlopen(req, json.dumps([rec]))
    print(res.read())
  except (Exception, e):
    print(e)
    exit()

def get_name(name):
  try:
    req = urllib.request.Request('http://localhost:8983/solr/name2gender/get?id=' + urllib.quote(name))
    req.add_header('Content-Type', 'application/json')
    res = urllib.request.urlopen(req)
    data = json.load(res)
    if data['doc'] != None:
      print("YOU GET THIS FOR FREE!!!!")
      return data["doc"]['gender_s']
    else:
      return None
  except(Exception, e):
    print(e)
    exit()

def get_wdid(item_str):
  try:
    esc_str = urllib.quote_plus(item_str)
    req = urllib.request.Request('https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops%7Cpageterms&list=&meta=&generator=search&gsrsearch=' + esc_str + '&gsrlimit=1')
    res = urllib.request.urlopen(req)
    data = json.load(res)
    wdid = data['query']['pages'].itervalues().next()['pageprops']['wikibase_item']
    return wdid
  except:
    return None

def get_wdsex(wdid, name):
  try:
    req = urllib.request.Request('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=' + wdid + '&props=labels|descriptions|claims&languages=en')
    res = urllib.request.urlopen(req)
    data = json.load(res)
    sex_id = data['entities'].itervalues().next()['claims']['P21'][0]['mainsnak']['datavalue']['value']['id']
    gender = {
      'Q6581097': 'male',
      'Q6581072': 'female',
      'Q1097630': 'intersex',
      'Q1052281': 'transgender female',
      'Q2449503': 'transgender male'
    }.get(sex_id, 'unknown')

    rec = {}
    rec['id'] = name
    rec['name_t'] = name
    rec['gender_s'] = gender 
    rec['probability_d'] = 1.0 
    rec['source_s'] = "wd"

    store_name(rec)

    return gender
  except(Exception, e):
    print(e)
    exit()

def get_gender(name):

  if "." in name:
    return "unknown"

  try:
    gender_req = urllib.request.urlopen('https://api.genderize.io/?name=' + name)
    data = json.load(gender_req)
    rec = {}
    rec['id'] = name
    rec['name_t'] = name
    rec['gender_s'] = data['gender']
    rec['probability_d'] = data['probability']
    rec['count_l'] = data['count']
    rec['source_s'] = "genderize.io"

    store_name(rec)
    
    gender = data['gender']
    if gender == None:
      return 'unknown'
    else:
      return gender
  except(Exception, e):
    # We can only make 1000 gender requests per day... - JBG
    print(e)
    exit()

def solr_store(recs):
  try:
    req = urllib.request.Request('http://localhost:8983/solr/readin-fst/update')
    req.add_header('Content-Type', 'application/json')
    res = urllib.request.urlopen(req, json.dumps(recs))
    print(res.read())
    
  except Exception as e:
    # We can only make 1000 gender requests per day... - JBG
    print(e)
    exit()

def namespace(element):
  m = re.match('\{.*\}', element.tag)
  return m.group(0) if m else ''


def main(filepath: str | os.PathLike):
  """
  """

  print("Parsing...")
  root = xml.etree.ElementTree.parse(filepath).getroot()
  ns = namespace(root)
  count = 0
  bd = re.compile('([0-9]{4})-([0-9]{4})?')

  for record in root:
    ns = namespace(record)
    rec = {}

    # Control Fields - JBG
    for controlfield in record.findall(ns + 'controlfield'):
      tag = controlfield.attrib['tag']

      if tag == "001":
        rec['id'] = controlfield.text

      elif tag == "008":
        rec['fixed_lang_t'] =  controlfield.text[35:38]
        rec['fixed_place_t'] =  controlfield.text[15:18]
        rec['fixed_pubstat_t'] =  controlfield.text[6]

    # Datafields - JBG
    for datafield in record.findall(ns + 'datafield'):
      ns = namespace(datafield)
      tag = datafield.attrib['tag']
      attr = attrs[tag]

      rec['tag_' + attr] = tag

      try:
        ind1 = datafield.attrib['ind1']
        if ind1 != " ":
          rec['ind1_' + attr] = ind1
          ind2 = datafield.attrib['ind2']
          if ind2 != " ":
            rec['ind2_' + attr] = ind2
      except:
        pass

      val = ""
      codes = ""

      for subfield in datafield.findall(ns + 'subfield'):
        code = subfield.attrib['code']

        if len(codes) > 0:
          codes += "," + code
        else:
          codes = code
        
        st = subfield.text
        if st != None:
          key = code + "_" + attr
          ckey = "count_" + code + "_" + attr[:-1] + "i"
          if key in rec:
            rec[ckey] += 1
            rec[key] += "," + st

          else:
            rec[ckey] = 1
            rec[key] = st 
            val += st + " "

          # Handel Name - JBG
          if tag == "100" and code == "a":
            names = st.split(",")
            gnames = " ".join(names[1:]).strip()
            sname = names[0].strip()
            fullname = (gnames + " " + sname).strip().lower().encode('utf8')

            print("CHECKING NAME: " + fullname)

            rec['gender_s'] = 'unknown'
            gender = get_name(fullname) 
            if gender != None:
              rec['gender_s'] = gender
            else:
              try:
                wdid = get_wdid(fullname)
                if wdid != None:
                  rec['gender_s'] = get_wdsex(wdid, fullname)
              except:
                try:
                  firstname = names[1].strip().lower().encode('utf8')
                  gender = get_name(firstname)
                  if gender == None:
                    rec['gender_s'] = get_gender(firstname)
                  else:
                    rec['gender_s'] = gender
                except:
                  rec['gender_s'] = 'unknown'
                
          # Handle Birth/Death - JBG
          m = bd.match(st)
          if tag == "100" and code == "d" and m:
            rec["birth_" + key] = m.groups()[0]
            if m.groups()[1] != None:
              rec["death_" + key] = m.groups()[1]

      rec[attr] = val.strip()
      rec["codes_" + attr] = codes 
    
      if "id" in rec:
        print("Storing...[" + str(count) + ", " + rec["id"] + "]")
        #print(json.dumps(rec, indent=4, sort_keys=True))
        solr_store([rec])
        count += 1
      else:
        print("ERROR: No id: ") 
        print(rec)


      print("done.")


input_file = sys.argv[1]
fp = Path(input_file).expanduser().absolute()
if fp.is_file():
  main(fp)

else:
  raise FileNotFoundError


