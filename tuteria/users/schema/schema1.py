import graphene
from graphene_django.types import DjangoObjectType
from graphene.types.generic import GenericScalar
from users.models import User, Location, PhoneNumber, states
from skills import models as skill_model
from django.urls import reverse
from django.db import models
from users import services, forms


class TutorSkillNode(graphene.ObjectType):
    get_absolute_url = graphene.String()
    name = graphene.String()

    def resolve_get_absolute_url(self, args, context, info):
        return self.get_absolute_url()

    def resolve_name(self, args, context, info):
        return self.skill.name


class LocationNode(DjangoObjectType):

    class Meta:
        model = Location


class UserWithSubjectType(graphene.InputObjectType):
    tutor_slug = graphene.String()
    req__request_subjects = graphene.List(graphene.String)
    pk = graphene.Int()


class CustomerInputType(graphene.InputObjectType):
    email = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    background_check_consent = graphene.Boolean()
    number = graphene.String()
    address = graphene.String()
    state = graphene.String()
    longitude = graphene.String()
    latitude = graphene.String()
    vicinity = graphene.String()
    referral_code = graphene.String()


class PhoneNumberNode(graphene.ObjectType):
    number = graphene.String()
    primary = graphene.Boolean()
    verified = graphene.Boolean()

    def resolve_number(self, info, **kwargs):
        return self.number.national_number

    def resolve_primary(self, info, **kwargs):
        return True if self.number == self.owner.primary_phone_no.number else False


class UserDNode(DjangoObjectType):
    primary_phone_no = graphene.String()

    class Meta:
        model = User

    def resolve_primary_phone_no(self, args, context, info):
        return str(self.primary_phone_no.number)


def tutor_location(locations):
    addresses = locations
    t = [x for x in addresses if x.addr_type == 2]
    if len(t) > 0:
        return t[0]
    if len(addresses) > 0:
        return addresses[0]


class UserNode1(DjangoObjectType):
    country = graphene.String()
    phone_numbers = graphene.List(PhoneNumberNode)
    location = graphene.Field(LocationNode)
    gender = graphene.String()
    dob = graphene.String()

    class Meta:
        model = User

    def resolve_phone_numbers(self, info, **kwargs):
        return self.phonenumber_set.all()

    def resolve_location(self, info, **kwargs):
        return tutor_location(self.location_set.all())

    def resolve_gender(self, info, **kwargs):
        return self.profile.gender

    def resolve_dob(self, info, **kwargs):
        return self.profile.dob.strftime("%Y-%m-%d")


class UserNode(graphene.ObjectType):
    primary_phone_no = graphene.String()
    location = graphene.Field(LocationNode)
    found_subjects = graphene.List(TutorSkillNode)
    slug = graphene.String()
    email = graphene.String()
    first_name = graphene.String()
    last_name = graphene.String()
    pk = graphene.Int()

    def resolve_slug(self, args, context, info):
        return self[0].slug

    def resolve_email(self, args, context, info):
        return self[0].email

    def resolve_first_name(self, args, context, info):
        return self[0].first_name

    def resolve_last_name(self, args, context, info):
        return self[0].last_name

    def resolve_location(self, args, context, info):
        addresses = self[0].location_set.all()
        return tutor_location(addresses)

    def resolve_primary_phone_no(self, args, context, info):
        return str(self[0].primary_phone_no.number)

    def resolve_found_subjects(self, args, context, info):
        instance = self[1]
        if instance:
            return skill_model.found_subjects(
                self[0].valid_tutorskills, instance["req__request_subjects"]
            )
        return self[0].valid_tutorskills

    def resolve_pk(self, args, context, info):
        return self[1]["pk"]


class FormData(graphene.ObjectType):
    countries = GenericScalar()
    basic_profile_form = GenericScalar()
    phone_forms = GenericScalar()


class CreateUserMutation(graphene.Mutation):

    class Input:
        input = CustomerInputType()

    user = graphene.Field(lambda: UserDNode)

    @staticmethod
    def mutate(root, args, context, info):
        user, _ = services.CustomerService.create_user_instance(**args["input"])
        return CreateUserMutation(user=user)


class UpdateEmailMutation(graphene.Mutation):

    class Input:
        ids = graphene.List(graphene.Int)
        email = graphene.String()

    users = graphene.List(lambda: UserDNode)

    @staticmethod
    def mutate(root, args, context, info):
        users = services.CustomerService.update_profile_emails(
            args["ids"], args["email"]
        )
        return UpdateEmailMutation(users=users)


class UserInput(graphene.InputObjectType):
    first_name = graphene.String()
    last_name = graphene.String()
    email = graphene.String()
    dob = graphene.String()
    country = graphene.String()
    gender = graphene.String()


class AboutTutorInput(graphene.InputObjectType):
    description = graphene.String(required=True)
    title = graphene.String(required=True)
    online_experience = graphene.Boolean(required=True)
    years_of_experience = graphene.Int(required=True)


class PhoneNumberInput(graphene.InputObjectType):
    number = graphene.String()
    primary = graphene.Boolean()


class LocationInput(graphene.InputObjectType):
    address = graphene.String()
    state = graphene.String()
    vicinity = graphene.String()
    area = graphene.String()
    latitude = graphene.Float()
    longitude = graphene.Float()


class saveLocationMutation(graphene.Mutation):

    class Arguments:
        email = graphene.String(required=True)
        details = LocationInput(required=True)

    phone_numbers = graphene.List(PhoneNumberNode)
    first_name = graphene.String()
    last_name = graphene.String()
    email = graphene.String()
    gender = graphene.String()
    dob = graphene.String()
    country = graphene.String()
    location = graphene.Field(LocationNode)
    errors = graphene.List(lambda: GenericScalar)

    @classmethod
    def mutate(self, *args, **kwargs):
        errors = None
        details = kwargs["details"]
        email = kwargs["email"]

        ss = services.CustomerService(email=email)
        user = ss.user

        output, errors = ss.save_location(details)

        phone_numbers = user.phonenumber_set.all()
        location = tutor_location(user.location_set.all())

        return saveLocationMutation(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            gender=user.profile.gender,
            dob=user.profile.dob,
            country=user.country,
            location=location,
            phone_numbers=phone_numbers,
            errors=errors,
        )


class savePersonalInfoMutation(graphene.Mutation):

    class Arguments:
        details = UserInput(required=True)
        phone_numbers = graphene.List(PhoneNumberInput)

    phone_numbers = graphene.List(PhoneNumberNode)
    first_name = graphene.String()
    last_name = graphene.String()
    email = graphene.String()
    gender = graphene.String()
    dob = graphene.String()
    country = graphene.String()
    location = graphene.Field(LocationNode)
    errors = graphene.List(lambda: GenericScalar)

    @classmethod
    def mutate(self, *args, **kwargs):
        errors = None
        details = kwargs["details"]
        kwargs.pop("details", None)
        phone_numbers = kwargs["phone_numbers"]

        data = dict(kwargs, **details)

        ss = services.CustomerService(email=details.get("email"))
        user = ss.user

        output, errors = ss.save_personal_info1(data)

        phone_numbers = user.phonenumber_set.all()
        location = tutor_location(user.location_set.all())

        return savePersonalInfoMutation(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            gender=user.profile.gender,
            dob=user.profile.dob,
            country=user.country,
            location=location,
            phone_numbers=phone_numbers,
            errors=errors,
        )


class saveAboutTutorInfoMutation(graphene.Mutation):

    class Arguments:
        email = graphene.String(required=True)
        details = AboutTutorInput(required=True)

    email = graphene.String()
    online_experience = graphene.Boolean()
    years_of_experience = graphene.Int()
    title = graphene.String()
    description = graphene.String()
    errors = graphene.List(lambda: GenericScalar)

    @classmethod
    def mutate(self, *args, **kwargs):
        errors = None
        email = kwargs["email"]
        details = kwargs["details"]

        ss = services.CustomerService(email=email)
        user = ss.user

        output, errors = ss.save_about_tutor_info(details)

        return saveAboutTutorInfoMutation(
            online_experience=user.teach_online,
            years_of_experience=user.profile.years_of_teaching,
            title=user.profile.custom_header,
            email=user.email,
            description=user.profile.description,
            errors=errors,
        )


class UpdatePhotoInput(graphene.InputObjectType):
    image = graphene.String(required=True)


class saveUpdatePhotoInfoMutation(graphene.Mutation):

    class Arguments:
        email = graphene.String(required=True)
        details = UpdatePhotoInput(required=True)

    email = graphene.String()
    image = graphene.String()
    errors = graphene.List(lambda: GenericScalar)

    @classmethod
    def mutate(self, *args, **kwargs):
        errors = None
        email = kwargs["email"]
        details = kwargs["details"]

        ss = services.CustomerService(email=email)
        user = ss.user

        output, errors = ss.save_photo_info(details)

        return saveUpdatePhotoInfoMutation(
            image=user.profile.image.build_url(secure=True),
            email=user.email,
            errors=errors,
        )


class Mutation(object):
    create_customer = CreateUserMutation.Field()
    update_email = UpdateEmailMutation.Field()
    save_personal_info = savePersonalInfoMutation.Field()
    save_location = saveLocationMutation.Field()
    save_about_tutor_info = saveAboutTutorInfoMutation.Field()
    save_update_photo_info = saveUpdatePhotoInfoMutation.Field()


class Struct(object):

    def __init__(self, **entries):
        self.__dict__.update(**entries)


class FetchVicinitiesNode(graphene.ObjectType):
    item = graphene.String()
    areas = graphene.List(graphene.String)

    def resolve_item(self, info, **kwargs):
        return (self["vicinity1"]).title()

    def resolve_areas(self, info, **kwargs):
        return []


class Struct(object):

    def __init__(self, **entries):
        self.__dict__.update(**entries)


class Query(object):
    user1 = graphene.Field(UserNode, slugs=UserWithSubjectType())
    user_detail = graphene.Field(UserDNode, slug=graphene.String(required=True))
    users = graphene.List(UserNode, slugs=graphene.List(UserWithSubjectType))

    form_data = graphene.Field(FormData)

    @staticmethod
    def get_countries():
        return [
            {"locale": "", "text": "Select Country", "code": ""},
            {
                "text": "Nigeria",
                "locale": "ng",
                "code": "234",
                "latitude": 9.081999,
                "longitude": 8.675277000000051,
                "states": states,
            },
        ]

    def resolve_form_data(self, info, **kwargs):
        countries = Query.get_countries()
        basic_profile_form = forms.BasicProfileForm().serialized_form_fields()
        phone_forms = forms.PhoneNumberFormSet().serialized_form_fields()
        result = dict(
            countries=countries,
            basic_profile_form=basic_profile_form,
            phone_forms=phone_forms,
        )
        return Struct(**result)

    user = graphene.Field(UserNode1, email=graphene.String(required=False))
    fetch_vicinities = graphene.List(
        FetchVicinitiesNode,
        search_input=graphene.String(),
        state=graphene.String(),
        country=graphene.String(),
    )

    def resolve_user(self, info, **kwargs):
        if not kwargs.get("email"):
            user = info.context.user
            if user.is_authenticated:
                return user
            return None
        return User.objects.filter(email=kwargs["email"]).first()

    @staticmethod
    def base_query(slugs=None):
        users = User.objects.all()
        if slugs:

            tutors = [x["tutor_slug"] for x in slugs]
            preserved = models.Case(
                *[models.When(slug=slug, then=pos) for pos, slug in enumerate(tutors)]
            )

            users = users.filter(slug__in=tutors).order_by(preserved)
        return users.prefetch_related(
            models.Prefetch(
                "tutorskill_set",
                queryset=skill_model.TutorSkill.objects.select_related(
                    "tutor", "skill"
                ).not_denied(),
                to_attr="valid_tutorskills",
            ),
            "location_set",
        )

    def resolve_user1(self, args, context, info):
        if args.get("slugs") is not None:
            return (
                Query.base_query().filter(slug=args["slugs"]["tutor_slug"]).first(),
                args["slugs"],
            )
        return None

    def resolve_user_detail(self, args, context, info):
        return User.objects.filter(slug=args["slug"]).first()

    def resolve_users(self, args, context, info):
        slugs = args.get("slugs")
        if slugs:
            return zip(Query.base_query(slugs), slugs)

    def resolve_fetch_vicinities(self, info, **kwargs):
        return Location.objects.get_vicinities(kwargs["search_input"], kwargs["state"])
