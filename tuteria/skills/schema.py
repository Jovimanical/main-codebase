import graphene
from graphene_django.types import DjangoObjectType
from . import models as skill_model
from django.urls import reverse
from django.db import models
from graphene.types.generic import GenericScalar


class SkillNode(graphene.ObjectType):
    tags = graphene.List(graphene.String)

    # class Meta:
    #     model = skill_model.Skill

    def resolve_tags(self, *args):
        return self.tags.all()



class Query(object):
    skills = graphene.List(
        SkillNode, search_param=graphene.String(), parent_subjects=graphene.Boolean()
    )

    
    def resolve_skills(self, args, context, info):
        if args.get("search_param"):
            return skill_model.Skill.objects.filter(
                name__icontains=args["search_param"]
            )
        if args.get("parent_subjects"):
            return skill_model.Skill.parent_subjects()
        return skill_model.Skill.objects.all()
    
