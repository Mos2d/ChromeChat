# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []
from rasa_sdk import Action
from rasa_sdk.events import SlotSet

class UtterSearchResult(Action):
    def name(self) -> str:
        return "utter_search_result"

    def run(self, dispatcher, tracker, domain):
        query = tracker.get_slot("search_query")
        # Call YouTube API or your logic to search based on the query
        dispatcher.utter_message(f"Searching YouTube for: {query}")
        return [SlotSet("search_query", query)]
