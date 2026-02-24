from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pharos Agents API")

from src.core.scheduler import start_scheduler, job_macro, job_market

@app.on_event("startup")
async def startup_event():
    start_scheduler()

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "pharos-agents"}

@app.post("/test/collect/{type}")
async def trigger_collection(type: str):
    """Manually trigger collection jobs."""
    if type == "macro":
        job_macro()
        return {"status": "triggered", "job": "macro"}
    elif type == "market":
        job_market()
        return {"status": "triggered", "job": "market"}
    return {"status": "error", "message": "Invalid type"}

from src.agents.strategy_worker import generate_blueprint
from src.models.schemas import BlueprintSchema

@app.post("/test/strategy", response_model=BlueprintSchema)
async def test_strategy_worker():
    """
    Trigger the Strategy Worker with DUMMY data for verification.
    """
    # Dummy context for testing
    dummy_news = """
    1. [War] Middle East tension rising, oil price up 3%.
    2. [Fed] Interest rate hike expected next month.
    3. [Crypto] Bitcoin drops below $60k support line.
    """
    dummy_market = """
    - BTC Price: $59,000
    - Fear & Greed Index: 25 (Extreme Fear)
    - 10Y Treasury Yield: 4.5%
    """
    
    return await generate_blueprint(dummy_news, dummy_market)
    
from src.models.schemas import AgentRequest
from src.agents.supervisor import supervisor_node
from src.agents.news_worker import news_worker_node
from src.core.state import AgentState
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage

def build_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("news_worker", news_worker_node)
    
    # Members definition must match the names in add_node and supervisor.py
    members = ["news_worker"]
    
    for member in members:
        # Worker always reports back to supervisor
        workflow.add_edge(member, "supervisor")
        
    # Supervisor decides next step via conditional edge
    workflow.add_conditional_edges(
        "supervisor",
        lambda x: x["next"],
        {
            "news_worker": "news_worker",
            "FINISH": END
        }
    )
    
    workflow.set_entry_point("supervisor")
    return workflow.compile()

graph = build_graph()

@app.post("/agent/invoke")
async def invoke_agent(request: AgentRequest):
    """
    Invoke the multi-agent system with a user query.
    """
    initial_state = {
        "messages": [HumanMessage(content=request.query)],
        "next": "supervisor"
    }
    
    # Run the graph
    # For simplicity, we just return the final state history
    # In a real app, we might extract the last message content
    result = await graph.ainvoke(initial_state)
    
    # Extract the last message from the conversation
    last_message = result['messages'][-1]
    
    return {"result": last_message.content}
