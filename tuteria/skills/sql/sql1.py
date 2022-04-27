POSTGRES_FUNCTIONS = (
    "CREATE OR REPLACE FUNCTION havesinecal(latitude double precision,"
    "longitude double precision, lat double precision, lon double precision) "
    "RETURNS double precision AS $BODY$ "
    "SELECT ((6371.0000 * acos( cos( radians($1) ) * cos( radians( $3 ) ) * cos( radians( $4 ) - radians($2) ) +"
    "sin( radians($1) ) * sin( radians( $3 ) ) ) )) as distance $BODY$ LANGUAGE sql IMMUTABLE COST 100;"
)
CATEGORY_SELECT = (
    'SELECT DISTINCT ON ("skills_tutorskill"."tutor_id") "skills_tutorskill"."id",'
    '("skills_tutorskill"."price" *4*"skills_tutorskill"."hours_per_day"*"skills_tutorskill"."days_per_week")'
    ' as "monthly_price", ("skills_tutorskill"."days_per_week"*4) as "no_of_lessons","skills_tutorskill"."tutor_id",'
    '"skills_skill"."name","users_userprofile".image'
    ' AS "user_image","users_userprofile"."request_pool" AS "starred", "skills_tutorskill"."heading", "skills_tutorskill"."slug", "skills_tutorskill"."price",'
    '"skills_tutorskill"."max_student", "skills_tutorskill"."monthly_booking", "skills_tutorskill"."hours_per_day",'
    '"skills_tutorskill"."days_per_week", "skills_tutorskill"."image", COUNT(DISTINCT "reviews_skillreview"."id") AS "rc",'
    '"users_location"."vicinity" , "tutors_educations"."degree","auth_user"."first_name","users_location"."state",'
    '"auth_user"."slug" AS "user_slug", AVG("skills_quizsitting"."score") AS "score"'
)

LOCATION_BASED_SELECT = (
    ',havesinecal(%s,%s,"users_location".latitude,"users_location".longitude) AS "distance"'
)

JOINS = (
    'FROM "skills_tutorskill" '
    'LEFT OUTER JOIN "taggit_taggeditem" ON '
    '( "skills_tutorskill"."id" = "taggit_taggeditem"."object_id" AND ("taggit_taggeditem"."content_type_id" = 51) )'
    'LEFT OUTER JOIN "taggit_tag" ON ( "taggit_taggeditem"."tag_id" = "taggit_tag"."id" )'
    'LEFT OUTER JOIN "skills_quizsitting" ON ("skills_tutorskill"."id" = "skills_quizsitting"."tutor_skill_id")'
    'INNER JOIN "skills_skill" ON ( "skills_tutorskill"."skill_id" = "skills_skill"."id" )'
    'INNER JOIN "auth_user"  ON ( "skills_tutorskill"."tutor_id" = "auth_user"."id" )'
    'INNER JOIN "users_location" ON ( "auth_user"."id" = "users_location"."user_id" )'
    'INNER JOIN "users_userprofile" ON ( "auth_user"."id" = "users_userprofile"."user_id" )'
    'LEFT OUTER JOIN "reviews_skillreview" ON ( "skills_tutorskill"."id" = "reviews_skillreview"."tutor_skill_id" )'
    'LEFT OUTER JOIN "tutors_educations" ON ( "skills_tutorskill"."tutor_id" = "tutors_educations"."tutor_id" ) '
    'AND "tutors_educations"."id" = ( SELECT "id" FROM "tutors_educations" WHERE "skills_tutorskill"."tutor_id" '
    '= "tutors_educations"."tutor_id" LIMIT 1) WHERE '
)
ACTIVE_PARAM = '("skills_tutorskill"."status" = 2 AND '
TAG_PARAM = '(UPPER("taggit_tag"."name"::text) LIKE UPPER(%s)'
SKILL_PARAM = 'UPPER("skills_skill"."name"::text) LIKE UPPER(%s) '
SEARCH_PARAM = ACTIVE_PARAM + TAG_PARAM + " OR " + SKILL_PARAM + ")"
COORDINATE_PARAM = (
    '"users_location"."id" IN'
    '(SELECT "users_location"."id" FROM "users_location" WHERE ((6371 * acos( cos( radians(%s) ) * '
    "cos( radians( latitude ) ) * cos( radians( longitude ) - radians(%s) ) + sin( radians(%s) ) * "
    'sin( radians( latitude ) ) ) ) < %s)) AND "users_location".addr_type = 2 '
)
REGION_PARAM = (
    'UPPER("users_location"."state"::text) LIKE UPPER(%s) AND "users_location".addr_type = 2 '
)
AGE_PARAM = (
    '"users_userprofile"."dob" >= date %s AND "users_userprofile"."dob" <= date %s '
)
END_RATE_PARAM = '"skills_tutorskill"."price" <= %s '
START_RATE_PARAM = '"skills_tutorskill"."price" >= %s '
GENDER_PARAM = '"users_userprofile"."gender" = %s '
IS_TEACHER_PARAM = '"auth_user"."is_teacher" = True '
DAYS_PER_WEEK_PARAM = '"skills_tutorskill"."days_per_week" >= %s '
CLASSES_PARAMS = '"users_userprofile"."classes" @> %s :: VARCHAR(20) [] '
YEARS_OF_TEACHING = '"users_userprofile"."years_of_teaching" >= %s '
CURRICULUM_USED = '"users_userprofile"."curriculum_used" @> %s :: VARCHAR(20) [] '

GROUP_BY = (
    ') GROUP BY "skills_tutorskill"."id", "skills_tutorskill"."tutor_id", "users_userprofile".image,'
    '"skills_tutorskill"."skill_id", "skills_tutorskill"."heading", "skills_tutorskill"."slug",'
    '"skills_tutorskill"."description", "skills_tutorskill"."price", "skills_tutorskill"."discount",'
    '"skills_tutorskill"."max_student", "skills_tutorskill"."monthly_booking","skills_tutorskill"."hours_per_day",'
    '"skills_tutorskill"."days_per_week", "skills_tutorskill"."image", "skills_tutorskill"."status",'
    '"users_location"."vicinity","tutors_educations"."degree","auth_user"."first_name","users_location"."state",'
    '"auth_user"."slug","users_location"."latitude", "users_location"."longitude","skills_skill"."name", "users_userprofile"."request_pool"'
)
