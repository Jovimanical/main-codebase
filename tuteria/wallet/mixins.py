class WalletMixin(object):

    def owner_email(self):
        return self.owner.email

    owner_email.short_description = "Owner Email"

    full_name = property(owner_email)
