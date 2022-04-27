from contentful_management import Client

MANAGEMENT_API_TOKEN = (
    "CFPAT-ad589b00a502d8d860f80d0e9df694199389dfdb8f930c48b261ce1f3146db34"
)
SPACE_ID = "tp6rlg4xcwsc"
ENVIRONMENT_ID = "master"
CONTENT_TYPE_ID = "schedule"

client = Client(access_token=MANAGEMENT_API_TOKEN)


def get_schedules(summary_value):
    entries = client.entries(SPACE_ID, ENVIRONMENT_ID)
    entries.content_type_id = CONTENT_TYPE_ID
    query = {"fields.summary": summary_value}
    return entries.all(query=query)


def update_entry(summary_value, payload):
    entries = get_schedules(summary_value)
    for entry in entries:
        for field, value in payload.items():
            setattr(entry, field, value)
        entry.save()


if __name__ == "__main__":
    summary_value = "January Weekend Evening Class 1"
    payload = {"slots": 5}
    update_entry(summary_value, payload)
