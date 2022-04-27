class Struct(object):

    def __init__(self, **entries):
        self.__dict__.update(**entries)


class dict(dict):

    def toObject(self):
        if not self:
            return Struct()
        obj = Struct(**self)
        return obj
