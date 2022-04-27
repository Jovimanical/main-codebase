from haystack import indexes
from .models import User, UserProfile, Location


class LocationIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    location = indexes.LocationField(model_attr="get_loc")
    user_id = indexes.IntegerField(model_attr="user_id")
    # lga = indexes.CharField(model_attr='lga')

    def get_model(self):
        return Location

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(
            user__profile__application_status=UserProfile.VERIFIED
        )


# class UserIndex(indexes.SearchIndex, indexes.Indexable):
# 	text = indexes.CharField(document=True,use_template=True)

# 	def get_model(self):
# 		return User

# 	def index_queryset(self,using=None):
# 		return self.get_model().objects.filter(profile__application_status=UserProfile.VERIFIED)
