import json

from django.core.handlers.wsgi import WSGIRequest
from django.http.response import JsonResponse

class Result:
    def __init__(self, msg="", errors=None, data=None, status_code=200):
        self.errors = errors
        self.data = data
        self.msg = msg
        self.status_code = status_code


def generic_response(request: WSGIRequest, callback):
    if request.method == "POST":
        body = json.loads(request.body)
        result: Result = callback(body)
        if result.errors:
            return JsonResponse(
                {"status": False, "errors": result.errors}, status=result.status_code
            )
        return JsonResponse({"status": True, "data": result.data}, status=200)
    return JsonResponse({"status": False, "errors": "Not allowed"}, status=400)

