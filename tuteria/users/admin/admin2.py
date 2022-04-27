from django.contrib import admin
from .admin1 import (
    Location,
    LocationAdmin,
    PhoneNumber,
    PhoneNumberAdmin,
    UserIdentification,
    UserIdentificationAdmin,
    VerifiedTutorIdentificationAdmin,
    UserAdmin,
    User,
    TutorLocationAdmin,
)
from allauth.account.admin import (
    EmailAddress,
    EmailAddressAdmin,
    EmailConfirmation,
    EmailConfirmationAdmin,
)
from django_quiz.quiz.admin import Quiz, QuizAdmin
from registration.admin import (
    NewEmailAddressAdmin,
    ApprovingTutorsAdmin,
    VerifiedTutor,
    VerifiedTutorAdmin,
    VerifiedTutorSkillsAdmin,
    Education,
    EducationAdmin,
    WorkExperience,
    WorkExperienceAdmin,
    Guarantor,
    GuarantorAdmin,
    TutorApplicant,
    TutorAdmin,
)
from allauth.socialaccount.admin import SocialAccount, SocialAccountAdmin
from skills.admin import (
    TutorSkill,
    TutorSkillAdmin,
    QuizSitting,
    QuizSittingAdmin,
    PendingTutorSkill,
    PendingTutorSkillAdmin,
    SkillCertificate,
    SkillCertificateAdmin,
)


class TutorAdminSite(admin.AdminSite):
    site_header = "Monty Python administration"


tutor_admin = TutorAdminSite(name="Tutor Admin")


def create_modeladmin(modeladmin, model, name=None):

    class Meta:
        proxy = True
        app_label = model._meta.app_label

    attrs = {"__module__": "", "Meta": Meta}

    newmodel = type(name, (model,), attrs)

    tutor_admin.register(newmodel, modeladmin)
    return modeladmin


tutor_admin.register(Quiz, QuizAdmin)
tutor_admin.register(User, UserAdmin)
tutor_admin.register(PhoneNumber, PhoneNumberAdmin)
tutor_admin.register(Location, LocationAdmin)
tutor_admin.register(UserIdentification, UserIdentificationAdmin)
tutor_admin.register(TutorSkill, TutorSkillAdmin)
tutor_admin.register(PendingTutorSkill, PendingTutorSkillAdmin)
tutor_admin.register(QuizSitting, QuizSittingAdmin)
tutor_admin.register(EmailAddress, NewEmailAddressAdmin)
tutor_admin.register(EmailConfirmation, EmailConfirmationAdmin)
tutor_admin.register(SocialAccount, SocialAccountAdmin)
tutor_admin.register(TutorApplicant, TutorAdmin)
tutor_admin.register(Education, EducationAdmin)
tutor_admin.register(WorkExperience, WorkExperienceAdmin)
tutor_admin.register(Guarantor, GuarantorAdmin)
create_modeladmin(ApprovingTutorsAdmin, User, name="ApprovingTutor")
create_modeladmin(VerifiedTutorSkillsAdmin, User, name="VerifiedTutorWithSkill")
create_modeladmin(TutorLocationAdmin, Location, name="TutorLocation")
create_modeladmin(
    VerifiedTutorIdentificationAdmin,
    UserIdentification,
    name="VerifiedTutorIdentification",
)
