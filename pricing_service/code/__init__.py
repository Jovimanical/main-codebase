from starlette.responses import JSONResponse 
from starlette.applications import Starlette
from starlette.routing import Mount, Route
from .subject_pricing import SubjectPricing


def re_download(request):
    SubjectPricing(download=True)
    return JSONResponse({"downloaded": True})


def home_page(request):
    return JSONResponse({"hello": "world"})


async def get_state_information(request):
    state = request.query_params.get("state")
    errors = []
    subject_pricing = SubjectPricing()
    result = {}
    if state:
        vicinities = subject_pricing.get_state_vicinities(state)
        state_factor = subject_pricing.get_state_factor(state)
        marketing_channels = subject_pricing.get_marketing_channels()
        if not vicinities:
            errors.append("state provided has no vicinities")
        result = {
            "factor": state_factor,
            "vicinities": vicinities,
            "name": state,
            "errors": errors,
            "marketing_channels": marketing_channels,
        }
    return JSONResponse(result)


async def get_subject_information(request):
    subject = request.query_params.get("subject")
    subject_pricing = SubjectPricing()
    result = dict(
        name=subject,
        price=subject_pricing.get_subject_price(subject),
        curriculums=subject_pricing.get_all_curriculums_and_factors(),
        hours=subject_pricing.get_all_hours_and_factors(),
        purposes=subject_pricing.get_all_purposes_and_factors(),
        purpose_curriculum_relation=subject_pricing.get_purpose_curriculum_relation(),
    )
    return JSONResponse(result)

app = Starlette(routes=[
    Mount("/p",routes=[
        Route("/", home_page, methods=["GET"]),
        Route("/download", re_download, methods=["GET"]),
        Route(
            "/get-state-information",
            get_state_information,
            methods=["GET"],
        ),
        Route(
            "/get-subject-information",
            get_subject_information,
            methods=["GET"],
        ),
    ])
])
# app = Router(
#     [
#         PathPrefix(
#             "/p",
#             app=Router(
#                 [
#                     Path("/", app=home_page, methods=["GET"]),
#                     Path("/download", app=re_download, methods=["GET"]),
#                     Path(
#                         "/get-state-information",
#                         app=get_state_information,
#                         methods=["GET"],
#                     ),
#                     Path(
#                         "/get-subject-information",
#                         app=get_subject_information,
#                         methods=["GET"],
#                     ),
#                 ]
#             ),
#         )
#     ]
# )

