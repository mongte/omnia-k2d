from typing import Annotated, TypedDict, Union
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    # The list of messages in the conversation
    messages: Annotated[list[BaseMessage], operator.add]
    # The next node to execute
    next: str
