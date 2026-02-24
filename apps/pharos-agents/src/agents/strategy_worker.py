from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from src.core.config import get_settings
from src.core.logger import get_logger
from src.models.schemas import BlueprintSchema

logger = get_logger(__name__)

def get_strategy_llm():
    settings = get_settings()
    # Strategy requires higher intelligence -> Use GPT-4o
    return ChatOpenAI(
        model="gpt-4o", 
        api_key=settings.openai_api_key,
        temperature=0
    )

async def generate_blueprint(news_context: str, market_data_context: str) -> BlueprintSchema:
    """
    Generate an investment blueprint based on aggregated news and market data.
    """
    logger.info("Strategy Worker: Generating Blueprint...")
    llm = get_strategy_llm()
    parser = PydanticOutputParser(pydantic_object=BlueprintSchema)
    
    system_prompt = """
    # Role
    You are the 'Chief Investment Strategist' for Pharos, an AI investment guide service.
    Your goal is NOT to chat, but to generate a structured 'Investment Blueprint' JSON.
    
    # Guidelines
    1. **Be Decisive**: Do not say "wait and see". Give clear advice (Buy, Sell, Hold Cash).
    2. **Data-Driven**: Use the provided News and Market Data as your logical basis.
    3. **Beginner Friendly**: Explain complex terms simply.
    4. **Safety First**: If uncertainty is high, prioritize Capital Preservation (High Cash %).
    5. **Language**: Output must be in **Korean (한국어)**.

    # Output Schema
    Strictly follow the JSON schema provided.
    """
    
    user_prompt = """
    Generate today's Investment Blueprint based on the following data:

    [Recent News Analysis]
    {news_context}

    [Market Data Indicators]
    {market_data_context}
    
    {format_instructions}
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_prompt)
    ])
    
    chain = prompt | llm | parser
    
    try:
        result = await chain.ainvoke({
            "news_context": news_context,
            "market_data_context": market_data_context,
            "format_instructions": parser.get_format_instructions()
        })
        logger.info("Strategy Worker: Blueprint Generated Successfully")
        return result
        
    except Exception as e:
        logger.error(f"Strategy Generation Failed: {e}", exc_info=True)
        # Return a fallback safe blueprint in case of failure
        return BlueprintSchema(
            market_phase="Unknown",
            risk_level=5,
            key_takeaways=["시스템 분석 중 오류가 발생했습니다.", "잠시 후 다시 시도해주세요.", "보수적인 관점을 유지하세요."],
            action_guide="데이터 분석 중 일시적인 오류가 발생했습니다. 현금 비중을 유지하며 관망하세요.",
            recommended_portfolio={"Cash": 100},
            reasoning="System Error Fallback"
        )
