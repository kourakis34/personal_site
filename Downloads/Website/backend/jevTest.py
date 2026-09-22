from dotenv import load_dotenv
load_dotenv()
from typesafe_sdk import Noul, TypeSafeClient
from app.config import settings


client = TypeSafeClient()


ticket = "Where has nick worked?"

response = client.system_one(
    state=ticket,
    questions={
        "is_relevant": Noul(
            instructions="The message inquires about Nick",
        ),
    },
)

print(response.answers["is_relevant"].noul)  
