import itertools
import copy
v = [dict(name="a",val=[1,2,3]),dict(name="b",val=[3,4,5]),
	dict(name="c",val=[5,6,7])]
all_letters = list(set(itertools.chain(*[z['val'] for z in v])))

def x(u,p):
	result = []
	# w = list(set(itertools.chain(*u)))
	# for z in w:
	for i,d in enumerate(u):
		if p in d['val']:
			result.append(copy.copy(u[i]['name']))				
			d['val'].remove(p)
	return result


SELECT DISTINCT ON ("auth_user"."id") "auth_user"."id", "auth_user"."password", "auth_user"."last_login", "auth_user"."is_superuser", "auth_user"."email", "auth_user"."first_name", "auth_user"."last_name", "auth_user"."username", "auth_user"."is_staff", "auth_user"."is_active", "auth_user"."date_joined", "auth_user"."country", "auth_user"."slug", "auth_user"."confirmed_date", "auth_user"."tuteria_points", "auth_user"."tutor_intent", "auth_user"."background_check_consent", "auth_user"."last_visit", "auth_user"."submitted_verification", "auth_user"."flagged", "auth_user"."is_teacher", "auth_user"."pay_with_bank" 
FROM "auth_user" 
LEFT OUTER JOIN "tutors_educations" 
	ON ( "auth_user"."id" = "tutors_educations"."tutor_id" ) 
LEFT OUTER JOIN "tutor_work_experiences" 
	ON ( "auth_user"."id" = "tutor_work_experiences"."tutor_id" ) 
LEFT OUTER JOIN "skills_tutorskill" 
	ON ( "auth_user"."id" = "skills_tutorskill"."tutor_id" ) 
LEFT OUTER JOIN "skills_skill" 
	ON ( "skills_tutorskill"."skill_id" = "skills_skill"."id" ) 
INNER JOIN "users_userprofile" 
	ON ( "auth_user"."id" = "users_userprofile"."user_id" ) 
INNER JOIN "users_location" 
	ON ( "auth_user"."id" = "users_location"."user_id" ) 
WHERE 
(
	(
		UPPER("tutors_educations"."course"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("tutor_work_experiences"."name"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("tutor_work_experiences"."role"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("skills_skill"."name"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("skills_tutorskill"."description"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("users_userprofile"."description"::text) LIKE UPPER(%Architecture%) 
		OR UPPER("users_userprofile"."tutor_description"::text) LIKE UPPER(%Architecture%)) 
		AND "users_location"."state" = Lagos 
		AND "users_userprofile"."application_status" = 3 
		AND NOT ("auth_user"."id" IN 
		(
			SELECT U1."tutor_id" AS Col1 
			FROM "skills_tutorskill" U1 
			WHERE U1."status" = 4
		) 
		AND "auth_user"."id" IN 
		(
			SELECT U1."tutor_id" AS Col1 
			FROM "skills_tutorskill" U1 
			INNER JOIN "skills_skill" U2 
				ON ( U1."skill_id" = U2."id" 
		) 
		WHERE UPPER(U2."name"::text) LIKE UPPER(%Architecture%))))