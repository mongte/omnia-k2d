from typing import Literal
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers.openai_functions import JsonOutputFunctionsParser
from langchain_core.messages import SystemMessage

from src.core.config import get_settings
from src.core.state import AgentState

# Define the list of workers manageable by the supervisor
members = ["news_worker"]

system_prompt = (
    "You are a supervisor tasked with managing a conversation between the"
    " following workers: {members}. Given the following user request,"
    " respond with the worker to act next. Each worker will perform a"
    " task and respond with their results and status. If you think the"
    " task is finished or the user query is answered, respond with 'FINISH'."
)

def get_supervisor_node():
    settings = get_settings()
    llm = ChatOpenAI(model="gpt-4o", api_key=settings.openai_api_key)
    
    options = ["FINISH"] + members
    
    # Using function calling to enforce structured routing decisions
    function_def = {
        "name": "route",
        "description": "Select the next role.",
        "parameters": {
            "title": "routeSchema",
            "type": "object",
            "properties": {
                "next": {
                    "title": "Next",
                    "anyOf": [
                        {"enum": options},
                    ],
                }
            },
            "required": ["next"],
        },
    }
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="messages"),
        (
            "system",
            "Given the conversation above, who should act next?"
            " Or should we FINISH? Select one of: {options}",
        ),
    ]).partial(options=str(options), members=", ".join(members))
    
    supervisor_chain = (
        prompt 
        | llm.bind_functions(functions=[function_def], function_call="route") 
        | JsonOutputFunctionsParser()
    )
    
    return supervisor_chain

async def supervisor_node(state: AgentState) -> dict:
    chain = get_supervisor_node()
    result = await chain.ainvoke(state)
    return result
