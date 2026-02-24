from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from src.core.config import get_settings
from src.core.logger import get_logger
from src.core.state import AgentState
from src.models.schemas import NewsBatch
from src.tools.news_fetcher import fetch_crypto_news, fetch_market_news

logger = get_logger(__name__)

def get_llm():
    settings = get_settings()
    # Using 'gpt-4o-mini' as requested for cost efficiency (worker node)
    return ChatOpenAI(
        model="gpt-4o-mini", 
        api_key=settings.openai_api_key,
        temperature=0
    )

async def news_worker_node(state: AgentState) -> dict:
    """
    LangGraph Node: News Worker
    Receives state, executes logic, and updates state with a message back to Supervisor.
    """
    logger.info("News Worker: Started processing")
    
    # Analyze the last message to determine functionality or defaults?
    # For now, default to crypto as per previous logic, or simple routing.
    # In a real scenario, we might parse the state['messages'] to find specific params.
    topic = "crypto" # Default for now
    
    # 1. Fetch raw news
    try:
        if topic == "crypto":
            raw_items = fetch_crypto_news(limit=5)
        else:
            raw_items = fetch_market_news(limit=5)
    except Exception as e:
        logger.error(f"Failed to fetch news: {e}")
        return {"messages": [HumanMessage(content="Error fetching news.", name="news_worker")]}
        
    if not raw_items:
        return {"messages": [HumanMessage(content="No news items found.", name="news_worker")]}

    # 2. Prepare for LLM processing
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=NewsBatch)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a financial news analyst. Extract and clean the news items provided."),
        ("user", """
        Process the following raw news items into structured data.
        
        Requirements:
        1. Clean up the text (remove ads, HTML tags).
        2. Provide a 3-sentence summary for each item.
        3. Assign a sentiment score (0-100).
        4. Preserve 'source_url' and 'published_at'.
        5. Return STRICT JSON matching the schema.

        Raw Items:
        {raw_items}
        
        {format_instructions}
        """)
    ])
    
    chain = prompt | llm | parser
    
    raw_text = "\n\n".join([
        f"Item {i+1}:\nTitle: {item['title']}\nLink: {item['link']}\nPublished: {item['published']}\nRaw Summary: {item['summary'][:800]}..." 
        for i, item in enumerate(raw_items)
    ])
    
    try:
        logger.info("News Worker: Invoking LLM")
        result = await chain.ainvoke({
            "raw_items": raw_text,
            "format_instructions": parser.get_format_instructions()
        })
        
        # Serialize the Pydantic result to JSON string to pass back as a message
        # Supervisor can then decide what to do with this JSON.
        json_result = result.model_dump_json()
        logger.info("News Worker: Finished")
        
        return {
            "messages": [
                HumanMessage(content=json_result, name="news_worker")
            ]
        }
        
    except Exception as e:
        logger.error(f"LLM Processing Error: {e}", exc_info=True)
        return {"messages": [HumanMessage(content="Error processing news with AI.", name="news_worker")]}

