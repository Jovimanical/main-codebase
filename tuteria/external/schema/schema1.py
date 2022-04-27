import graphene
from django.http import JsonResponse
from django.shortcuts import reverse
from graphene.types.generic import GenericScalar
from graphene_django.types import DjangoObjectType


from ..models import Agent, BaseRequestTutor, PriceDeterminator
from . import types
from .subject_pricing import SubjectPricing


class AgentNode(graphene.ObjectType):
    phone_number = graphene.String()

    # class Meta:
    #     model = Agent
    #     fields = ['']

    def resolve_phone_number(self, info, **kwargs):
        return str(self.phone_number)


class StateVicinity(graphene.ObjectType):
    name = graphene.String()
    vicinities = GenericScalar()
    factor = graphene.Float()
    marketing_channels = GenericScalar()
    errors = graphene.List(lambda: GenericScalar)


class PricingInfo(graphene.ObjectType):

    get_state_information = graphene.Field(
        StateVicinity, state=graphene.String(required=True)
    )

    get_subject_information = graphene.Field(
        GenericScalar, subject=graphene.String(required=True)
    )

    get_hourly_rate_and_transport = graphene.Field(
        GenericScalar,
        classes=graphene.List(GenericScalar),
        state=graphene.String(default_value="Lagos"),
        vicinity=graphene.String(),
        curriculums=graphene.List(graphene.String),
        no_of_hours=graphene.Float(default_value=1.0),
        subject=graphene.String(default_value="home tutoring"),
    )


class RequestDump(graphene.ObjectType):
    pass


class Query(object):
    # subject_pricing = SubjectPricing()

    agent = graphene.Field(AgentNode)
    agents = graphene.List(AgentNode)
    pricing_info = graphene.Field(PricingInfo)
    get_state_information = graphene.Field(
        StateVicinity, state=graphene.String(required=True)
    )
    get_subject_information = graphene.Field(
        GenericScalar, subject=graphene.String(required=True)
    )
    get_request = graphene.Field(GenericScalar, slug=graphene.String(required=True))

    get_hourly_rate_and_transport = graphene.Field(
        GenericScalar,
        classes=graphene.List(GenericScalar),
        state=graphene.String(default_value="Lagos"),
        vicinity=graphene.String(),
        curriculums=graphene.List(graphene.String),
        no_of_hours=graphene.Float(default_value=1.0),
        subject=graphene.String(default_value="home tutoring"),
    )

    @staticmethod
    def subject_pricing():
        return SubjectPricing()

    def resolve_agent(self, info, **kwargs):
        return Agent.get_agent()

    def resolve_agents(self, info, **kwargs):
        return Agent.objects.all()

    def resolve_pricing_info(self, info, **kwargs):
        return Query.subject_pricing

    def resolve_get_request(self, info, **kwargs):
        request = BaseRequestTutor.objects.get(slug__iexact=kwargs["slug"])
        agent = request.agent
        result = None
        if agent:
            result = {
                i: getattr(agent, i) for i in ["name", "email", "title", "image_url"]
            }
            result["phone_number"] = str(agent.phone_number)
        return {
            "request_dump": {
                **request.request_info,
                "slug": request.slug,
                "status": request.get_status_display(),
                "paid_fee": request.paid_fee,
                "fee_link": reverse("redirect_completion", args=[request.slug]),
                "discount_info": PriceDeterminator.get_forced_discount_info(),
            },
            "agent": result,
        }

    def resolve_get_state_information(self, info, **kwargs):
        state = kwargs.get("state")
        errors = []
        subject_pricing = Query.subject_pricing()
        vicinities = subject_pricing.get_state_vicinities(state)
        state_factor = subject_pricing.get_state_factor(state)
        marketing_channels = subject_pricing.get_marketing_channels()
        if not vicinities:
            errors.append("state provided has no vicinities")
        return StateVicinity(
            factor=state_factor,
            vicinities=vicinities,
            name=state,
            errors=errors,
            marketing_channels=marketing_channels,
        )

    def resolve_get_subject_information(self, info, **kwargs):
        subject = kwargs.get("subject")
        subject_pricing = Query.subject_pricing()
        return dict(
            name=subject,
            price=subject_pricing.get_subject_price(subject),
            curriculums=subject_pricing.get_all_curriculums_and_factors(),
            hours=subject_pricing.get_all_hours_and_factors(),
            purposes=subject_pricing.get_all_purposes_and_factors(),
            purpose_curriculum_relation=subject_pricing.get_purpose_curriculum_relation(),
            plan_factor=subject_pricing.get_all_plans(),
            exam_factor=subject_pricing.get_all_exam_factors(),
        )

    def resolve_get_hourly_rate_and_transport(self, info, **kwargs):
        classes = kwargs.get("classes")
        state = kwargs.get("state")
        vicinity = kwargs.get("vicinity")
        curriculums = kwargs.get("curriculums")
        no_of_hours = kwargs.get("no_of_hours")
        subject = kwargs.get("subject")
        return Query.subject_pricing().get_hourly_price_and_transport(
            students=classes,
            state=state,
            vicinity=vicinity,
            curriculums=curriculums,
            no_of_hours=no_of_hours,
            subject=subject,
        )


def download(request):
    SubjectPricing(download=True)
    return JsonResponse({"downloaded": True})
