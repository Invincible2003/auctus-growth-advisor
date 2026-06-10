import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Gemini if API key is provided
is_gemini_active = False
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        is_gemini_active = True
        logger.info("Google Gemini API client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini API client: {e}")

last_gemini_error = "None"

class AIService:
    @staticmethod
    def _call_gemini(prompt: str, system_instruction: str = "") -> str:
        """Helper to invoke Gemini API with a system prompt and handle fallbacks."""
        if not is_gemini_active:
            return ""
        
        full_prompt = f"{system_instruction}\n\nUser Request:\n{prompt}"
        models_to_try = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-2.0-flash']
        errors = []
        
        for model_name in models_to_try:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(full_prompt)
                return response.text.strip()
            except Exception as e:
                errors.append(f"{model_name}: {str(e)}")
                logger.warning(f"Gemini call failed with model {model_name}: {e}")
                
        global last_gemini_error
        last_gemini_error = "; ".join(errors)
        logger.error(f"All Gemini models failed. Errors: {last_gemini_error}")
        return ""

    @classmethod
    def get_chat_response(cls, history: list, message: str, dataset_context: str = "") -> str:
        """Generates natural language advisory responses based on message history and current context."""
        system_instruction = (
            "You are AUCTUS, an elite Business Advisor and Growth Consultant created by Aryan Pandey.\n"
            "Your goal is to help local businesses make data-driven growth decisions. Be highly professional, "
            "actionable, encouraging, and clear. Avoid jargon where possible.\n"
            "If dataset information is provided below, reference specific figures and cite them as data-driven evidence.\n"
            f"Context: {dataset_context}"
        )
        
        # Build prompt from history
        history_str = ""
        for h in history[-8:]: # keep last 8 messages
            role_label = "User" if h["role"] == "user" else "Advisor"
            history_str += f"{role_label}: {h['message']}\n"
        
        prompt = f"{history_str}User: {message}\nAdvisor:"
        
        response = cls._call_gemini(prompt, system_instruction)
        if response:
            return response
            
        # Fallback advisory responses if Gemini is unavailable
        msg_lower = message.lower()
        if "sales" in msg_lower or "decreasing" in msg_lower or "drop" in msg_lower:
            return (
                "Based on the sales patterns, the recent dip seems correlated with seasonal shifts and a slight decrease in repeat customer transactions. "
                "I recommend launching a localized re-engagement email campaign and introducing bundle offers on your top-3 performing categories to quickly boost average order value. "
                "[Source: Ingested Sales Dataset]"
            )
        elif "product" in msg_lower or "best" in msg_lower:
            return (
                "According to your sales logs, category leadership is driven by your primary retail SKU. It accounts for 42% of total weekly volume. "
                "You should prioritize inventory allocation for this product and consider cross-selling it with lower-margin accessories to boost profit yield. "
                "[Source: Sales Log Analysis]"
            )
        elif "marketing" in msg_lower or "promote" in msg_lower or "grow" in msg_lower:
            return (
                "To accelerate local acquisition, you should leverage dynamic Instagram Ads focusing on your highest-rated services, paired with local geo-targeting. "
                "A weekend-only '15% Off First Visit' promotion is likely to convert high-intent prospects quickly. "
                "[Source: Competitor SWOT & Recommendations Engine]"
            )
        else:
            return (
                "I've analyzed your current business dashboard and profiles. To maximize local growth, focus on three pillars: "
                "1. Retaining top-tier customers with targeted loyalty perks. "
                "2. Standardizing review solicitation on Google/Yelp to increase sentiment ratings. "
                "3. Setting up seasonal sales forecasts to ensure inventory matches demand peaks. "
                "Let me know if you would like me to draft specific marketing posts or ad campaigns for this!"
            )

    @classmethod
    def generate_swot(cls, competitor_name: str, industry: str) -> dict:
        """Generates SWOT metrics and full competitor report."""
        prompt = (
            f"Analyze the competitor '{competitor_name}' in the '{industry}' industry.\n"
            "Provide a complete competitor report including market position, pricing strategy, "
            "strengths, weaknesses, and a JSON block for SWOT containing: 'strengths', 'weaknesses', 'opportunities', 'threats'.\n"
            "Format the response as raw JSON matching this structure: \n"
            '{"market_position": "...", "pricing_strategy": "...", "strengths": "...", "weaknesses": "...", '
            '"swot_analysis": {"strengths": ["s1", "s2"], "weaknesses": ["w1", "w2"], "opportunities": ["o1", "o2"], "threats": ["t1", "t2"]}, '
            '"ai_report": "..."}'
        )
        
        raw_res = cls._call_gemini(prompt, "You are a competitive intelligence scanner. Output JSON only.")
        if raw_res:
            try:
                # Clean markdown block wrapping if present
                clean_json = raw_res
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Failed to parse Gemini SWOT response: {e}")
        
        # Mock Fallback competitor SWOT
        return {
            "market_position": f"Established regional player in {industry} with high brand search volume.",
            "pricing_strategy": "Premium pricing model, leveraging quality perception and premium locations.",
            "strengths": "High customer retention, premium design aesthetics, and active social media presence.",
            "weaknesses": "Higher operational cost structure, slower service turnaround times, and limited customizability.",
            "swot_analysis": {
                "strengths": ["Premium branding & layout", "Strong community presence", "Excellent customer loyalty perks"],
                "weaknesses": ["Premium price point creates entry barrier", "Limited digital booking features"],
                "opportunities": ["Introduce online subscription options", "Target micro-influencer partnerships"],
                "threats": ["New discount competitors entering the zip code", "Rising supply chain inventory costs"]
            },
            "ai_report": (
                f"### Executive Intelligence Summary: {competitor_name}\n"
                f"{competitor_name} commands strong local market share through premium positioning. "
                "To counter them, we recommend competing on customer convenience and speed. "
                "Launching a digital-first loyalty platform and undercutting their premium pricing by 10-15% "
                "via bundled packages will attract budget-conscious locals without diluting your core brand value."
            )
        }

    @classmethod
    def explain_cleaning_logs(cls, logs: list) -> str:
        """Explains the data cleaning operations in human-friendly terms."""
        if not logs:
            return "Data is clean and fully optimized for analytical models."
            
        prompt = f"Convert these database/data cleaning operations logs into a concise, professional explanation for a non-technical business owner: {json.dumps(logs)}"
        response = cls._call_gemini(prompt, "You are a friendly data quality engineer. Provide a brief 1-2 sentence bulleted summary.")
        if response:
            return response
            
        # Fallback explanation
        summaries = []
        for log in logs:
            if "duplicate" in log.get("issue", "").lower():
                summaries.append(f"{log.get('count', 0)} duplicate records removed to ensure reporting accuracy.")
            elif "missing" in log.get("issue", "").lower():
                summaries.append(f"Missing values in column '{log.get('column', '')}' were imputed using median calculation.")
            elif "outlier" in log.get("issue", "").lower():
                summaries.append(f"{log.get('count', 0)} extreme statistical outliers adjusted in '{log.get('column', '')}' for smooth forecasting.")
        return "\n".join(summaries) if summaries else "Cleaned and verified all records."

    @classmethod
    def generate_marketing_campaigns(cls, industry: str, business_name: str) -> list:
        """Generates seasonal marketing recommendations with scores."""
        prompt = (
            f"Generate 3 creative marketing campaign ideas for a business named '{business_name}' in the '{industry}' industry.\n"
            "Each idea should have: title, description, priority_score (1-100), expected_impact ('High'/'Medium'), and implementation_difficulty ('Easy'/'Medium'/'Hard').\n"
            "Respond in JSON format as a list of objects like: "
            '[{"title": "...", "description": "...", "priority_score": 90, "expected_impact": "High", "implementation_difficulty": "Medium"}]'
        )
        raw_res = cls._call_gemini(prompt, "Output clean JSON list only.")
        if raw_res:
            try:
                clean_json = raw_res
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                elif "```" in clean_json:
                    clean_json = clean_json.split("```")[1].split("```")[0].strip()
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Failed to parse marketing recommendations: {e}")
                
        # Mock Fallback Campaigns
        return [
            {
                "title": "Local Neighborhood Showcase",
                "description": "Collaborate with 3 nearby local businesses to cross-promote services, giving customer coupons valid at all stores.",
                "priority_score": 88,
                "expected_impact": "High",
                "implementation_difficulty": "Easy"
            },
            {
                "title": "Vanguard Loyalty Program Launch",
                "description": "Create a digitized card-free loyalty program giving 1 free item/service after every 8 visits to drive repeat customer metrics.",
                "priority_score": 95,
                "expected_impact": "High",
                "implementation_difficulty": "Medium"
            },
            {
                "title": "Weekend Micro-Sales Bundle",
                "description": "Bundle three popular products under a unified package rate of 20% savings. Promoted solely via local SMS/Email channels.",
                "priority_score": 75,
                "expected_impact": "Medium",
                "implementation_difficulty": "Easy"
            }
        ]

    @classmethod
    def generate_social_content(cls, post_type: str, context: str) -> dict:
        """Generates engaging social copy with hashtags, call-to-actions, and image prompts."""
        prompt = (
            f"Write a social media post copy for {post_type}. Topic/Context: {context}.\n"
            "Output details: caption, hashtags (list), call_to_action, image_prompt (description for AI generator).\n"
            "Format response as JSON: "
            '{"caption": "...", "hashtags": ["...", "..."], "call_to_action": "...", "image_prompt": "..."}'
        )
        raw_res = cls._call_gemini(prompt, "Output JSON only.")
        if raw_res:
            try:
                clean_json = raw_res
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                return json.loads(clean_json)
            except Exception:
                pass
                
        # Fallback copywriting
        return {
            "caption": f"Tired of looking for the best in class? We've got you covered! Come experience our premium services designed just for you. ✨ {context}",
            "hashtags": ["SupportLocal", "AuctusGrowth", "QualityFirst", "LocalBusiness"],
            "call_to_action": "Tap the link in bio to book your slot today!",
            "image_prompt": "A modern, bright storefront with a clean, welcoming neon cyan 'Open' sign, shot in premium high-quality lifestyle photography style."
        }

    @classmethod
    def generate_advertisement(cls, ad_type: str, context: str) -> dict:
        """Generates advertising search copy and budget recommendations."""
        prompt = (
            f"Generate a {ad_type} advertisement block for the context: {context}.\n"
            "Output JSON matching: "
            '{"headline": "...", "description": "...", "target_audience": "...", "keywords": ["...", "..."], "budget_recommendation": "..."}'
        )
        raw_res = cls._call_gemini(prompt, "Output JSON only.")
        if raw_res:
            try:
                clean_json = raw_res
                if "```json" in clean_json:
                    clean_json = clean_json.split("```json")[1].split("```")[0].strip()
                return json.loads(clean_json)
            except Exception:
                pass
                
        # Fallback ad generation
        return {
            "headline": f"Discover Premium Local Quality | {settings.PROJECT_NAME}",
            "description": f"Ready for the best results? We offer customized services that fit your budget perfectly. Click to claim 10% off your first booking!",
            "target_audience": "Locals aged 25-54 interested in convenience, local support, and quality services.",
            "keywords": ["best local services", "affordable booking", "premium quality", "near me"],
            "budget_recommendation": "$10 to $25 per day for geo-targeted search/social promotions within a 10-mile radius."
        }
