# rows = []


# def create_json(ff):
#     keys = [
#         "id",
#         "created",
#         "modified",
#         "tutor_id",
#         "skill_id",
#         "heading",
#         "slug",
#         "description",
#         "agent_id",
#         "price",
#         "discount",
#         "max_student",
#         "monthly_booking",
#         "hours_per_day",
#         "days_per_week",
#         "marked_for_display",
#         "image",
#         "image_denied_on",
#         "status",
#         "set_for_request",
#         "remark",
#         "approved",
#     ]
#     dd = {x[0]: x[1] for x in zip(keys, ff)}
#     return dd


# def create_actual_records(j):
#     date_func = lambda o: dateutil.parser.parse(j[o])
#     is_none = lambda o: j[o] if j[o] != "\\N" else None
#     is_bool = lambda o: j[o] not in ["f"]
#     return dict(
#         id=int(j["id"]),
#         created=date_func("created"),
#         modified=date_func("modified"),
#         tutor_id=int(j["tutor_id"]),
#         skill_id=int(j["skill_id"]),
#         heading=j["heading"],
#         slug=j["slug"],
#         description=j["description"],
#         agent_id=int(j["agent_id"]) if j["agent_id"] != "\\N" else None,
#         price=j["price"],
#         discount=j["discount"],
#         max_student=j["max_student"],
#         monthly_booking=is_bool("monthly_booking"),
#         hours_per_day=is_none("hours_per_day"),
#         days_per_week=is_none("days_per_week"),
#         marked_for_display=is_bool("marked_for_display"),
#         image=is_none("image"),
#         image_denied_on=date_func("image_denied_on")
#         if j["image_denied_on"] != "\\N"
#         else None,
#         status=int(j["status"]),
#         set_for_request=is_bool("set_for_request"),
#         remark=is_none("remark"),
#         approved=is_bool("approved"),
#     )


# with open("backup.tsv") as rr:
#     for i in rr.readlines():
#         js = create_json(i.split("\t"))
#         rows.append(create_actual_records(js))

data = [
    {
        "email": "nosayaba20@gmail.com",
        "vicinity": "Festac Town",
        "region": "Festac Town",
    },
    {
        "email": "solangeagbor12@gmail.com",
        "vicinity": "Lekki-Epe Express way",
        "region": "Lekki Phase 2",
    },
    {
        "email": "edwinadj004@gmail.com",
        "vicinity": "First Gate",
        "region": "Lekki Phase 2",
    },
    {
        "email": "falodunike@gmail.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {"email": "onategeorge6@gmail.com", "vicinity": "Lekki", "region": "Lekki"},
    {
        "email": "fatai.ayoyusuph@gmail.com",
        "vicinity": "Lekki-V.I./Ajah",
        "region": "Lekki Phase 1",
    },
    {"email": "ebiyele@yahoo.com", "vicinity": "Lekki-Ajah", "region": "Lekki Phase 2"},
    {
        "email": "ijeomalilianokeke@gmail.com",
        "vicinity": "Ikota",
        "region": "Lekki Phase 2",
    },
    {
        "email": "mayowaaborisade@yahoo.com",
        "vicinity": "Igbo-Efon",
        "region": "Lekki Phase 2",
    },
    {"email": "jeremiahedewojames@gmail.com", "vicinity": "Ajah", "region": "Ajah"},
    {"email": "ifiada@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {"email": "emmanuelchijio@yahoo.com", "vicinity": "Ajah", "region": "Ajah"},
    {
        "email": "koluniyi@yahoo.com",
        "vicinity": "Chevron drive",
        "region": "Lekki Phase 2",
    },
    {"email": "soanfinest@gmail.com", "vicinity": "Ikota", "region": "Lekki Phase 2"},
    {
        "email": "chikaobi.david@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "ngoziakodu@gmail.com",
        "vicinity": "Osapa-London",
        "region": "Lekki Phase 2",
    },
    {"email": "oketunbi@gmail.com", "vicinity": "Igbo-Efon", "region": "Lekki Phase 2"},
    {
        "email": "damilolaalabi55@gmail.com",
        "vicinity": "Igbo-Efon",
        "region": "Lekki Phase 2",
    },
    {"email": "ajahebby@gmail.com", "vicinity": "Agungi", "region": "Lekki Phase 2"},
    {"email": "dkolutayo@gmail.com", "vicinity": "Ebeano", "region": "Lekki Phase 2"},
    {"email": "greatvizy@gmail.com", "vicinity": "Ajah ", "region": "Ajah"},
    {
        "email": "golddeambasadore@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "godfreyarchibong@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "blessingesset@gmail.com",
        "vicinity": "Agungi",
        "region": "Lekki Phase 2",
    },
    {
        "email": "sophia.newton565@gmail.com",
        "vicinity": "Osapa London",
        "region": "Lekki Phase 2",
    },
    {"email": "cherubeters@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {"email": "charlesndu4u@yahoo.co.uk", "vicinity": "Awoyaya", "region": "Ajah"},
    {
        "email": "amoswegheyan@gmail.com",
        "vicinity": "Lekki phase 1",
        "region": "Lekki Phase 1",
    },
    {"email": "joelighalo@gmail.com", "vicinity": "Agungi", "region": "Lekki Phase 2"},
    {
        "email": "brightohanekwu@yahoo.com",
        "vicinity": "Jakande",
        "region": "Lekki Phase 2",
    },
    {"email": "aloedako@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {
        "email": "enangbasseyjune13@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {"email": "petrasng@yahoo.com", "vicinity": "Ajah", "region": "Ajah"},
    {
        "email": "altruisticnancy@gmail.com",
        "vicinity": "Eti Osa",
        "region": "Lekki Phase 2",
    },
    {
        "email": "kemieshiett@hotmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "bedeworks@gmail.com",
        "vicinity": "Alasia Bus stop, Badore",
        "region": "Ajah",
    },
    {"email": "ayatmol@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {
        "email": "adelekedolapo@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {"email": "aiyenowoileola@gmail.com", "vicinity": "Ibeju lekki", "region": "Ajah"},
    {
        "email": "ibrahimogunajo@gmail.com",
        "vicinity": "Chevron, Agungi",
        "region": "Lekki Phase 2",
    },
    {
        "email": "princejothan@gmail.com",
        "vicinity": "Lekki / Jakande",
        "region": "Lekki Phase 2",
    },
    {"email": "opemiyimika@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {"email": "amaka09@gmail.com", "vicinity": "Agungi", "region": "Lekki Phase 2"},
    {"email": "tonyeokari@gmail.com", "vicinity": "Ilasan", "region": "Ajah"},
    {"email": "s.shobowale@yahoo.com", "vicinity": "Bogije", "region": "Ajah"},
    {
        "email": "iphie232000@gmail.com",
        "vicinity": "Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "officialhouseofmartins@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {"email": "afoladayo@gmail.com", "vicinity": "Ikoyi", "region": "Ikoyi"},
    {"email": "ruth.offor@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {"email": "nwaezesarah@gmail.com", "vicinity": "Ikate", "region": "Lekki Phase 2"},
    {"email": "amiewonder97@gmail.com", "vicinity": "Osapa", "region": "Lekki Phase 2"},
    {
        "email": "adejobipeter2010@yahoo.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "sulaimankareem08@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {"email": "gloriousnkem@gmail.com", "vicinity": "Ikate", "region": "Lekki Phase 2"},
    {"email": "nnanyaa@gmail.com", "vicinity": "Igbo Efon", "region": "Lekki Phase 2"},
    {
        "email": "chukwunonsochukwuma@yahoo.com",
        "vicinity": "Igbo-Efon",
        "region": "Lekki Phase 2",
    },
    {
        "email": "stephanieuwadiare@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "anne.ebinum@gmail.com",
        "vicinity": "Jakande",
        "region": "Lekki Phase 2",
    },
    {
        "email": "david.ayang1@gmail.com",
        "vicinity": "Chevron",
        "region": "Lekki Phase 2",
    },
    {
        "email": "pearl.ilolo@gmail.com",
        "vicinity": "Lekki Conservation ",
        "region": "Lekki Phase 2",
    },
    {
        "email": "temiloluwaoni7@gmail.com",
        "vicinity": "Ikate",
        "region": "Lekki Phase 2",
    },
    {"email": "ucheewa@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 1"},
    {
        "email": "olanike_kolapo@yahoo.com",
        "vicinity": "Marwa",
        "region": "Lekki Phase 1",
    },
    {"email": "jennynikky31@yahoo.com", "vicinity": "Salem", "region": "Lekki Phase 2"},
    {
        "email": "lisaamajatoja@gmail.com",
        "vicinity": "Ajiran",
        "region": "Lekki Phase 2",
    },
    {
        "email": "akomolafeolubukola@gmail.com",
        "vicinity": "Chevron",
        "region": "Lekki Phase 2",
    },
    {
        "email": "sannisamuelajayi@yahoo.com",
        "vicinity": "Ikate",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ogundipesolataiwo123@gmail.com",
        "vicinity": "Agungi",
        "region": "Lekki Phase 2",
    },
    {"email": "successesq@live.com", "vicinity": "VGC", "region": "Lekki Phase 2"},
    {"email": "yemsahd@gmail.com", "vicinity": "Awoyaya", "region": "Ajah"},
    {
        "email": "tarepatrickgold@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "bellomarvelous@gmail.com",
        "vicinity": "Agbaje Close,Bakare Estate",
        "region": "Ajah",
    },
    {
        "email": "zubairdanfodio@yahoo.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ujayohans@gmail.com",
        "vicinity": "Osapa London",
        "region": "Lekki Phase 2",
    },
    {
        "email": "blissangel22@gmail.com",
        "vicinity": "Lekki Phase 2",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ibrahimolatunji318@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "genevieveakandu@yahoo.com",
        "vicinity": "Bera Estate",
        "region": "Lekki Phase 2",
    },
    {
        "email": "damselloradebrad@yahoo.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "chiomaobanor01@gmail.com",
        "vicinity": "Chevron drive",
        "region": "Lekki Phase 2",
    },
    {
        "email": "jeremiahabimbola0@gmail.com",
        "vicinity": "New Road",
        "region": "Lekki Phase 2",
    },
    {"email": "philipkirgs@yahoo.com", "vicinity": "VGC", "region": "Lekki Phase 2"},
    {
        "email": "whisper2chinee@gmail.com",
        "vicinity": "31A Admiralty Way, Lagos",
        "region": "Lekki Phase 1",
    },
    {
        "email": "jameswhitemouau@gmail.com",
        "vicinity": "Igbo-Efon ",
        "region": "Lekki Phase 2",
    },
    {
        "email": "tosinadebowale@gmail.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "oluwatoyebolutife2000@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "igloria689@gmail.com",
        "vicinity": "Alpha Beach, New Road, Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "tresureogbonna@gmail.com",
        "vicinity": "Ilasan",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ohikhuemetobi@gmail.com",
        "vicinity": "Victoria island",
        "region": "Victoria Island",
    },
    {
        "email": "emmanuellautomi@yahoo.com",
        "vicinity": "Ikate",
        "region": "Lekki Phase 2",
    },
    {
        "email": "olagokeoladapo@gmail.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "topeseun28@gmail.com",
        "vicinity": "Lekki  phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "adesina.oluwatobi@yahoo.com",
        "vicinity": "Lekki-Epe Expressway",
        "region": "Lekki Phase 2",
    },
    {"email": "giftnwaefulu@gmail.com", "vicinity": "Ikota", "region": "Lekki Phase 2"},
    {
        "email": "bankeajayi90@gmail.com",
        "vicinity": "Elf Bus Stop",
        "region": "Lekki Phase 2",
    },
    {"email": "eoyins@gmail.com", "vicinity": "Salem", "region": "Lekki Phase 2"},
    {
        "email": "unambadoris@gmail.com",
        "vicinity": "Lagos Business School",
        "region": "Ajah",
    },
    {
        "email": "tolu123456taiwo@yahoo.com",
        "vicinity": "Chevron",
        "region": "Lekki Phase 2",
    },
    {"email": "dannyheart2001@gmail.com", "vicinity": "Ajah", "region": "Ajah"},
    {
        "email": "eodoh92@yahoo.com",
        "vicinity": "Law school",
        "region": "Victoria Island",
    },
    {"email": "jonzlebo@gmail.com", "vicinity": "Jakande", "region": "Lekki Phase 2"},
    {"email": "debykoray@gmail.com", "vicinity": "Phase 1", "region": "Lekki Phase 1"},
    {
        "email": "rachaeladeyinka3@gmail.com",
        "vicinity": "Ibeju lekki",
        "region": "Ibeju-Lekki",
    },
    {"email": "morakinyoisrael@gmail.com", "vicinity": "Jakande", "region": "Ajah"},
    {
        "email": "chikeve1989@gmail.com",
        "vicinity": "Chevron",
        "region": "Lekki Phase 2",
    },
    {
        "email": "chikaodi.agwu@yahoo.com",
        "vicinity": "Whitesands Street",
        "region": "Lekki Phase 1",
    },
    {
        "email": "ibukunmary@yahoo.com",
        "vicinity": "IGBO-EFON",
        "region": "Lekki Phase 2",
    },
    {
        "email": "lilswtneno007@gmail.com",
        "vicinity": "Agungi",
        "region": "Lekki Phase 2",
    },
    {"email": "loladejare@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {"email": "buchibenn@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {"email": "uchogedi@gmail.com", "vicinity": "Chevron", "region": "Lekki Phase 2"},
    {"email": "njokuchukwumaa@gmail.com", "vicinity": "Ajah", "region": "Ajah"},
    {
        "email": "abike2008@yahoo.com",
        "vicinity": "Admiralty way Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "oduguwaolamide@yahoo.com",
        "vicinity": "Jakande",
        "region": "Lekki Phase 2",
    },
    {
        "email": "folajimi45@yahoo.com",
        "vicinity": "Admiralty way Lekki",
        "region": "Lekki Phase 1",
    },
    {
        "email": "patig_14@yahoo.com",
        "vicinity": "Lekki Scheme 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "beatrice.elezue@gmail.com",
        "vicinity": "Alpha beach road",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ogbokovictoria@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {"email": "tomiomojola@yahoo.com", "vicinity": "Ikate", "region": "Lekki Phase 2"},
    {"email": "ikheloabetty@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {
        "email": "kingsleyohans@gmail.com",
        "vicinity": "lekki",
        "region": "Lekki Phase 2",
    },
    {"email": "jemine09@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {
        "email": "babalolakemi@gmail.com",
        "vicinity": "Eleganza",
        "region": "Lekki Phase 2",
    },
    {"email": "uwahaustin2@gmail.com", "vicinity": "Abraham Adesoya", "region": "Ajah"},
    {
        "email": "smoothedge_entertainment@outlook.com",
        "vicinity": "Ikota School",
        "region": "Lekki Phase 2",
    },
    {"email": "johnokediji@gmail.com", "vicinity": "Oniru ", "region": "Lekki Phase 1"},
    {
        "email": "zaynabyusuf2011@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {"email": "tgirl4real32@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {
        "email": "joshua.okeme@gmail.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "adaonuigbo@rocketmail.com",
        "vicinity": "Ibeju lekki",
        "region": "Ibeju-Lekki",
    },
    {"email": "toniausifo@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {
        "email": "chukwudimmamc@gmail.com",
        "vicinity": "Eleganza Bus stop",
        "region": "Lekki Phase 2",
    },
    {"email": "loladejare@gmail.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {"email": "bettyikheloa@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
    {"email": "owatetaiye@gmail.com", "vicinity": "Ajah, phase 1 ", "region": "Ajah"},
    {
        "email": "olugbengafaloju@yahoo.com",
        "vicinity": "Lekki Phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "urielokunade@gmail.com",
        "vicinity": "Chevron round-about",
        "region": "Lekki Phase 2",
    },
    {
        "email": "tayosteve6@gmail.com",
        "vicinity": "Cheveron, lekki-Ajah",
        "region": "Lekki Phase 2",
    },
    {
        "email": "paulo_stekel01@yahoo.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "elrahmaney@gmail.com",
        "vicinity": "Lekki phase 1",
        "region": "Lekki Phase 1",
    },
    {
        "email": "enerogheneovo@gmail.com",
        "vicinity": "Ilasan ",
        "region": "Lekki Phase 2",
    },
    {
        "email": "temmystephen2013@gmail.com",
        "vicinity": "Lekki",
        "region": "Lekki Phase 2",
    },
    {
        "email": "ogunletijonathan@gmail.com",
        "vicinity": "ELEGUSHI",
        "region": "Lekki Phase 2",
    },
    {
        "email": "iyanuopeyemi0@gmail.com",
        "vicinity": "Chisco Ikate",
        "region": "Lekki Phase 2",
    },
    {
        "email": "fireglossolalia@gmail.com",
        "vicinity": "Lekki-Ajah",
        "region": "Lekki Phase 2",
    },
    {"email": "agbons112@yahoo.com", "vicinity": "Lekki", "region": "Lekki Phase 2"},
]

def update(User):
    for o in data:
        record = User.objects.filter(data_dump__tutor_update__personalInfo__email=o['email']).first()
        print(record)
        record.data_dump['tutor_update']['personalInfo']['vicinity'] = o['vicinity']
        record.data_dump['tutor_update']['personalInfo']['region'] = o['region']
        record.save()